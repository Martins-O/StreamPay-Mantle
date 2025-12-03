// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {StreamVault} from "./StreamVault.sol";
import {AccountingLib} from "./AccountingLib.sol";

contract StreamManager is ERC721, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct StreamToken {
        address token;
        uint256 totalAmount;
        uint256 claimedAmount;
    }

    struct TokenAllocation {
        address token;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 duration;
        uint256 pauseAccumulated;
        uint256 pauseCarry;
        uint256 lastAccrued;
    }

    struct Stream {
        address sender;
        address recipient;
        uint256 startTime;
        uint256 duration;
        uint256 stopTime;
        uint256 lastClaimed;
        bool isActive;
        bool isPaused;
        uint256 pauseStart;
        uint256 pausedDuration;
    }

    struct BatchCreateParams {
        address recipient;
        address[] tokens;
        uint256[] totalAmounts;
        uint256 duration;
    }

    StreamVault public immutable VAULT;
    uint256 public streamCounter;

    mapping(uint256 => Stream) public streams;
    mapping(uint256 => TokenAllocation[]) private _tokenAllocations;

    function _currentPauseCarry(Stream storage stream) internal view returns (uint256) {
        if (stream.isPaused && stream.pauseStart != 0 && block.timestamp > stream.pauseStart) {
            return block.timestamp - stream.pauseStart;
        }
        return 0;
    }

    function _remainingActiveDuration(Stream storage stream) internal view returns (uint256) {
        if (!stream.isActive) {
            return 0;
        }

        uint256 elapsed = block.timestamp - stream.startTime;
        uint256 paused = stream.pausedDuration;
        if (stream.isPaused && stream.pauseStart != 0 && block.timestamp > stream.pauseStart) {
            paused += block.timestamp - stream.pauseStart;
        }

        if (elapsed <= paused) {
            return stream.duration;
        }

        uint256 activeElapsed = elapsed - paused;
        if (stream.duration <= activeElapsed) {
            return 0;
        }

        return stream.duration - activeElapsed;
    }

    function _pausedDurationForAllocation(TokenAllocation storage allocation, Stream storage stream)
        internal
        view
        returns (uint256)
    {
        uint256 paused = stream.pausedDuration;
        if (paused <= allocation.pauseAccumulated) {
            paused = 0;
        } else {
            paused -= allocation.pauseAccumulated;
        }

        if (allocation.pauseCarry > 0) {
            if (paused <= allocation.pauseCarry) {
                paused = 0;
            } else {
                paused -= allocation.pauseCarry;
            }
        }

        return paused;
    }

    function _findTokenIndex(address[] memory tokens, address token) internal pure returns (uint256) {
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == token) {
                return i;
            }
        }
        revert("TOKEN_NOT_FOUND");
    }

    function _uniqueTokenAddresses(TokenAllocation[] storage allocations) internal view returns (address[] memory) {
        uint256 length = allocations.length;
        if (length == 0) {
            return new address[](0);
        }

        address[] memory temp = new address[](length);
        uint256 unique;

        for (uint256 i = 0; i < length; i++) {
            address token = allocations[i].token;
            bool exists;
            for (uint256 j = 0; j < unique; j++) {
                if (temp[j] == token) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                temp[unique++] = token;
            }
        }

        address[] memory tokens = new address[](unique);
        for (uint256 i = 0; i < unique; i++) {
            tokens[i] = temp[i];
        }
        return tokens;
    }

    function _aggregateTokens(TokenAllocation[] storage allocations)
        internal
        view
        returns (StreamToken[] memory tokens)
    {
        address[] memory unique = _uniqueTokenAddresses(allocations);
        uint256 count = unique.length;
        tokens = new StreamToken[](count);

        for (uint256 i = 0; i < count; i++) {
            tokens[i].token = unique[i];
        }

        for (uint256 i = 0; i < allocations.length; i++) {
            address tokenAddr = allocations[i].token;
            for (uint256 j = 0; j < count; j++) {
                if (tokens[j].token == tokenAddr) {
                    tokens[j].totalAmount += allocations[i].totalAmount;
                    tokens[j].claimedAmount += allocations[i].claimedAmount;
                    break;
                }
            }
        }
    }

    function _totalAllocatedForToken(TokenAllocation[] storage allocations, address token)
        internal
        view
        returns (uint256 total)
    {
        for (uint256 i = 0; i < allocations.length; i++) {
            if (allocations[i].token == token) {
                total += allocations[i].totalAmount;
            }
        }
    }

    mapping(address => uint256[]) public senderStreams;
    mapping(address => uint256[]) public recipientStreams;
    mapping(address => mapping(uint256 => uint256)) private _recipientStreamIndex;

    event StreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        address[] tokens,
        uint256[] totalAmounts,
        uint256 startTime,
        uint256 duration
    );

    event StreamBatchCreated(address indexed sender, uint256[] streamIds);

    event StreamCanceled(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        address[] tokens,
        uint256[] refundedAmounts
    );

    event Claimed(uint256 indexed streamId, address indexed recipient, address indexed token, uint256 amount);

    event StreamPaused(uint256 indexed streamId, address indexed sender, uint256 pauseTimestamp);

    event StreamResumed(uint256 indexed streamId, address indexed sender, uint256 resumeTimestamp);

    event StreamsBatchClaimed(address indexed recipient, uint256[] streamIds);

    event StreamToppedUp(
        uint256 indexed streamId, address indexed sender, address indexed token, uint256 amount, uint256 newTotalAmount
    );

    event StreamDurationExtended(uint256 indexed streamId, uint256 newDuration);

    event StreamRecipientUpdated(
        uint256 indexed streamId, address indexed previousRecipient, address indexed newRecipient
    );

    constructor() ERC721("StreamPay Stream", "STRM") Ownable(msg.sender) {
        VAULT = new StreamVault();
    }

    function createStream(address recipient, address token, uint256 totalAmount, uint256 duration)
        external
        nonReentrant
        whenNotPaused
        returns (uint256)
    {
        address[] memory tokens = new address[](1);
        tokens[0] = token;
        uint256[] memory totalAmounts = new uint256[](1);
        totalAmounts[0] = totalAmount;
        return _createStream(msg.sender, recipient, tokens, totalAmounts, duration);
    }

    function createStreamsBatch(BatchCreateParams[] calldata params)
        external
        nonReentrant
        whenNotPaused
        returns (uint256[] memory)
    {
        uint256 length = params.length;
        require(length > 0, "Empty batch");

        uint256[] memory streamIds = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            streamIds[i] = _createStream(
                msg.sender, params[i].recipient, params[i].tokens, params[i].totalAmounts, params[i].duration
            );
        }

        emit StreamBatchCreated(msg.sender, streamIds);
        return streamIds;
    }

    function createMultiTokenStream(
        address recipient,
        address[] calldata tokens,
        uint256[] calldata totalAmounts,
        uint256 duration
    ) external nonReentrant whenNotPaused returns (uint256) {
        return _createStream(msg.sender, recipient, tokens, totalAmounts, duration);
    }

    function cancelStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.sender == msg.sender, "Only sender can cancel");

        (address recipientAddr, address[] memory tokens, uint256[] memory refunded) = _finalizeStream(streamId, true);

        stream.isActive = false;
        stream.isPaused = false;
        stream.pauseStart = 0;

        emit StreamCanceled(streamId, stream.sender, recipientAddr, tokens, refunded);
    }

    function claim(uint256 streamId) external nonReentrant {
        address claimer = msg.sender;
        uint256[] memory single = new uint256[](1);
        single[0] = streamId;
        _claimBatch(claimer, single);
    }

    function claimStreamsBatch(uint256[] calldata streamIds) external nonReentrant {
        require(streamIds.length > 0, "No streams provided");
        _claimBatch(msg.sender, streamIds);
        emit StreamsBatchClaimed(msg.sender, streamIds);
    }

    function getStreamableAmounts(uint256 streamId)
        external
        view
        returns (address[] memory tokens, uint256[] memory amounts)
    {
        Stream storage stream = streams[streamId];
        TokenAllocation[] storage allocations = _tokenAllocations[streamId];
        StreamToken[] memory aggregates = _aggregateTokens(allocations);
        uint256 aggregateLength = aggregates.length;

        if (!stream.isActive || stream.isPaused) {
            tokens = new address[](aggregateLength);
            amounts = new uint256[](aggregateLength);
            for (uint256 i = 0; i < aggregateLength; i++) {
                tokens[i] = aggregates[i].token;
            }
            return (tokens, amounts);
        }

        tokens = new address[](aggregateLength);
        amounts = new uint256[](aggregateLength);
        for (uint256 i = 0; i < aggregateLength; i++) {
            tokens[i] = aggregates[i].token;
        }

        uint256 timestamp = block.timestamp;
        for (uint256 i = 0; i < allocations.length; i++) {
            TokenAllocation storage allocation = allocations[i];
            uint256 pausedForToken = _pausedDurationForAllocation(allocation, stream);
            AccountingLib.AccrualResult memory accrual = AccountingLib.calculateAccrual(
                allocation.totalAmount,
                allocation.claimedAmount,
                allocation.startTime,
                allocation.duration,
                allocation.lastAccrued,
                stream.stopTime,
                timestamp,
                stream.isPaused,
                stream.pauseStart,
                pausedForToken
            );

            uint256 index = _findTokenIndex(tokens, allocation.token);
            amounts[index] += accrual.claimable;
        }
    }

    function getStream(uint256 streamId) external view returns (Stream memory data, StreamToken[] memory tokens) {
        Stream storage stream = streams[streamId];
        data = stream;
        TokenAllocation[] storage allocations = _tokenAllocations[streamId];
        tokens = _aggregateTokens(allocations);
    }

    function getStreamTokens(uint256 streamId) external view returns (StreamToken[] memory) {
        TokenAllocation[] storage allocations = _tokenAllocations[streamId];
        return _aggregateTokens(allocations);
    }

    function getStreamTranches(uint256 streamId) external view returns (TokenAllocation[] memory tranches) {
        TokenAllocation[] storage allocations = _tokenAllocations[streamId];
        uint256 length = allocations.length;
        tranches = new TokenAllocation[](length);
        for (uint256 i = 0; i < length; i++) {
            tranches[i] = allocations[i];
        }
    }

    function topUpStream(uint256 streamId, address token, uint256 amount) external nonReentrant whenNotPaused {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Invalid amount");

        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.sender == msg.sender, "Only sender can top up");

        uint256 remainingDuration = _remainingActiveDuration(stream);
        require(remainingDuration > 0, "Stream completed");

        TokenAllocation memory allocation = TokenAllocation({
            token: token,
            totalAmount: amount,
            claimedAmount: 0,
            startTime: block.timestamp,
            duration: remainingDuration,
            pauseAccumulated: stream.pausedDuration,
            pauseCarry: _currentPauseCarry(stream),
            lastAccrued: block.timestamp
        });

        TokenAllocation[] storage allocations = _tokenAllocations[streamId];
        allocations.push(allocation);
        uint256 newTotal = _totalAllocatedForToken(allocations, token);
        emit StreamToppedUp(streamId, msg.sender, token, amount, newTotal);

        IERC20(token).safeTransferFrom(msg.sender, address(VAULT), amount);
        VAULT.pushToStrategy(token);
    }

    function extendStreamDuration(uint256 streamId, uint256 additionalDuration) external nonReentrant whenNotPaused {
        require(additionalDuration > 0, "Invalid duration");
        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.sender == msg.sender, "Only sender can extend");

        stream.duration += additionalDuration;
        TokenAllocation[] storage allocations = _tokenAllocations[streamId];
        for (uint256 i = 0; i < allocations.length; i++) {
            allocations[i].duration += additionalDuration;
        }
        emit StreamDurationExtended(streamId, stream.duration);
    }

    function updateStreamRecipient(uint256 streamId, address newRecipient) external nonReentrant whenNotPaused {
        require(newRecipient != address(0), "Invalid recipient");
        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.sender == msg.sender, "Only sender can update recipient");

        address currentRecipient = ownerOf(streamId);
        require(currentRecipient != newRecipient, "Recipient unchanged");
        _safeTransfer(currentRecipient, newRecipient, streamId, "");
        emit StreamRecipientUpdated(streamId, currentRecipient, newRecipient);
    }

    function getSenderStreams(address sender) external view returns (uint256[] memory) {
        return senderStreams[sender];
    }

    function getRecipientStreams(address recipient) external view returns (uint256[] memory) {
        return recipientStreams[recipient];
    }

    function pauseStream(uint256 streamId) external nonReentrant whenNotPaused {
        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.sender == msg.sender, "Only sender can pause");
        require(!stream.isPaused, "Already paused");

        _distributeAccrued(streamId, ownerOf(streamId));

        stream.pauseStart = stream.lastClaimed;
        stream.isPaused = true;

        emit StreamPaused(streamId, stream.sender, stream.pauseStart);
    }

    function resumeStream(uint256 streamId) external nonReentrant whenNotPaused {
        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.sender == msg.sender, "Only sender can resume");
        require(stream.isPaused, "Not paused");

        uint256 pausedFor = block.timestamp - stream.pauseStart;
        stream.pausedDuration += pausedFor;

        stream.pauseStart = 0;
        stream.isPaused = false;
        stream.lastClaimed = block.timestamp;

        emit StreamResumed(streamId, stream.sender, block.timestamp);
    }

    function configureYieldStrategy(address token, address strategy, uint16 reserveRatioBps) external onlyOwner {
        VAULT.setStrategy(token, strategy, reserveRatioBps);
    }

    function pushToYieldStrategy(address token) external onlyOwner {
        VAULT.pushToStrategy(token);
    }

    function harvestYield(address token) external onlyOwner {
        VAULT.harvestYield(token);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _createStream(
        address sender,
        address recipient,
        address[] memory tokens,
        uint256[] memory totalAmounts,
        uint256 duration
    ) internal returns (uint256 streamId) {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != sender, "Cannot stream to self");
        require(duration > 0, "Duration must be greater than zero");
        require(tokens.length == totalAmounts.length, "Mismatched arrays");
        require(tokens.length > 0, "No assets supplied");

        streamId = ++streamCounter;

        Stream storage stream = streams[streamId];
        stream.sender = sender;
        stream.startTime = block.timestamp;
        stream.duration = duration;
        stream.lastClaimed = block.timestamp;
        stream.isActive = true;

        TokenAllocation[] storage allocations = _tokenAllocations[streamId];
        address[] memory eventTokens = new address[](tokens.length);
        uint256[] memory eventTotals = new uint256[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            require(tokens[i] != address(0), "Invalid token");
            require(totalAmounts[i] > 0, "Amount must be greater than zero");

            allocations.push(
                TokenAllocation({
                    token: tokens[i],
                    totalAmount: totalAmounts[i],
                    claimedAmount: 0,
                    startTime: stream.startTime,
                    duration: duration,
                    pauseAccumulated: stream.pausedDuration,
                    pauseCarry: 0,
                    lastAccrued: stream.startTime
                })
            );
            eventTokens[i] = tokens[i];
            eventTotals[i] = totalAmounts[i];

            IERC20(tokens[i]).safeTransferFrom(sender, address(VAULT), totalAmounts[i]);
            VAULT.pushToStrategy(tokens[i]);
        }

        _safeMint(recipient, streamId);
        senderStreams[sender].push(streamId);

        emit StreamCreated(streamId, sender, recipient, eventTokens, eventTotals, block.timestamp, duration);
    }

    function _claimBatch(address claimer, uint256[] memory streamIds) internal {
        for (uint256 i = 0; i < streamIds.length; i++) {
            uint256 streamId = streamIds[i];
            Stream storage stream = streams[streamId];
            require(stream.isActive, "Stream not active");
            require(ownerOf(streamId) == claimer, "Not stream recipient");
            require(!stream.isPaused, "Stream paused");

            bool fullyClaimed = _distributeAccrued(streamId, claimer);
            if (fullyClaimed) {
                stream.isActive = false;
                stream.stopTime = block.timestamp;
            }
        }
    }

    function _distributeAccrued(uint256 streamId, address recipient) internal returns (bool fullyClaimed) {
        Stream storage stream = streams[streamId];
        TokenAllocation[] storage allocations = _tokenAllocations[streamId];

        uint256 allocationsLength = allocations.length;
        uint256 latestAccrualPoint = stream.lastClaimed;
        fullyClaimed = true;
        uint256 timestamp = block.timestamp;

        for (uint256 i = 0; i < allocationsLength; i++) {
            TokenAllocation storage allocation = allocations[i];
            uint256 pausedForToken = _pausedDurationForAllocation(allocation, stream);
            AccountingLib.AccrualResult memory accrual = AccountingLib.calculateAccrual(
                allocation.totalAmount,
                allocation.claimedAmount,
                allocation.startTime,
                allocation.duration,
                allocation.lastAccrued,
                stream.stopTime,
                timestamp,
                stream.isPaused,
                stream.pauseStart,
                pausedForToken
            );

            allocation.lastAccrued = accrual.accrualPoint;

            if (accrual.claimable > 0) {
                allocation.claimedAmount += accrual.claimable;
                VAULT.withdraw(allocation.token, recipient, accrual.claimable);
                emit Claimed(streamId, recipient, allocation.token, accrual.claimable);
            }

            if (allocation.claimedAmount < allocation.totalAmount) {
                fullyClaimed = false;
            }

            if (accrual.accrualPoint > latestAccrualPoint) {
                latestAccrualPoint = accrual.accrualPoint;
            }
        }

        stream.lastClaimed = latestAccrualPoint;
    }

    function _finalizeStream(uint256 streamId, bool refundSender)
        internal
        returns (address recipient, address[] memory tokens, uint256[] memory refunded)
    {
        Stream storage stream = streams[streamId];
        TokenAllocation[] storage allocations = _tokenAllocations[streamId];
        address[] memory uniqueTokens = _uniqueTokenAddresses(allocations);
        uint256 uniqueCount = uniqueTokens.length;
        tokens = uniqueTokens;
        refunded = new uint256[](uniqueCount);

        recipient = ownerOf(streamId);
        uint256 timestamp = block.timestamp;
        uint256 latestAccrualPoint = stream.lastClaimed;

        for (uint256 i = 0; i < allocations.length; i++) {
            TokenAllocation storage allocation = allocations[i];
            uint256 pausedForToken = _pausedDurationForAllocation(allocation, stream);
            AccountingLib.AccrualResult memory accrual = AccountingLib.calculateAccrual(
                allocation.totalAmount,
                allocation.claimedAmount,
                allocation.startTime,
                allocation.duration,
                allocation.lastAccrued,
                stream.stopTime,
                timestamp,
                stream.isPaused,
                stream.pauseStart,
                pausedForToken
            );

            allocation.lastAccrued = accrual.accrualPoint;

            if (accrual.claimable > 0) {
                allocation.claimedAmount += accrual.claimable;
                VAULT.withdraw(allocation.token, recipient, accrual.claimable);
                emit Claimed(streamId, recipient, allocation.token, accrual.claimable);
            }

            uint256 remainingAmount = allocation.totalAmount - allocation.claimedAmount;
            if (refundSender && remainingAmount > 0) {
                VAULT.withdraw(allocation.token, stream.sender, remainingAmount);
            }

            uint256 index = uniqueCount == 0 ? 0 : _findTokenIndex(tokens, allocation.token);
            if (uniqueCount > 0) {
                refunded[index] += remainingAmount;
            }

            if (accrual.accrualPoint > latestAccrualPoint) {
                latestAccrualPoint = accrual.accrualPoint;
            }
        }

        stream.lastClaimed = latestAccrualPoint;
        stream.stopTime = latestAccrualPoint;

        _burn(streamId);
        _removeRecipientStream(recipient, streamId);
    }

    function _addRecipientStream(address recipient, uint256 streamId) internal {
        uint256 index = recipientStreams[recipient].length;
        recipientStreams[recipient].push(streamId);
        _recipientStreamIndex[recipient][streamId] = index + 1;
    }

    function _removeRecipientStream(address recipient, uint256 streamId) internal {
        uint256 indexPlusOne = _recipientStreamIndex[recipient][streamId];
        if (indexPlusOne == 0) {
            return;
        }

        uint256 index = indexPlusOne - 1;
        uint256 lastIndex = recipientStreams[recipient].length - 1;

        if (index != lastIndex) {
            uint256 lastStreamId = recipientStreams[recipient][lastIndex];
            recipientStreams[recipient][index] = lastStreamId;
            _recipientStreamIndex[recipient][lastStreamId] = index + 1;
        }

        recipientStreams[recipient].pop();
        delete _recipientStreamIndex[recipient][streamId];
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address previousOwner) {
        previousOwner = super._update(to, tokenId, auth);

        Stream storage stream = streams[tokenId];
        stream.recipient = to;

        if (previousOwner != address(0)) {
            _removeRecipientStream(previousOwner, tokenId);
        }

        if (to != address(0)) {
            _addRecipientStream(to, tokenId);
        }
    }
}
