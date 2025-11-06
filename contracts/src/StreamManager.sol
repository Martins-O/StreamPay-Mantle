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
    mapping(uint256 => StreamToken[]) private _streamTokens;
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
        if (!stream.isActive || stream.isPaused) {
            StreamToken[] storage allocations = _streamTokens[streamId];
            uint256 len = allocations.length;
            tokens = new address[](len);
            amounts = new uint256[](len);
            for (uint256 i = 0; i < len; i++) {
                tokens[i] = allocations[i].token;
            }
            return (tokens, amounts);
        }

        StreamToken[] storage assets = _streamTokens[streamId];
        uint256 length = assets.length;
        tokens = new address[](length);
        amounts = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            AccountingLib.AccrualResult memory accrual = AccountingLib.calculateAccrual(
                assets[i].totalAmount,
                assets[i].claimedAmount,
                stream.startTime,
                stream.duration,
                stream.lastClaimed,
                stream.stopTime,
                block.timestamp,
                stream.isPaused,
                stream.pauseStart,
                stream.pausedDuration
            );
            tokens[i] = assets[i].token;
            amounts[i] = accrual.claimable;
        }
    }

    function getStream(uint256 streamId) external view returns (Stream memory data, StreamToken[] memory tokens) {
        Stream storage stream = streams[streamId];
        data = stream;
        StreamToken[] storage assets = _streamTokens[streamId];
        uint256 length = assets.length;
        tokens = new StreamToken[](length);
        for (uint256 i = 0; i < length; i++) {
            tokens[i] = assets[i];
        }
    }

    function getStreamTokens(uint256 streamId) external view returns (StreamToken[] memory) {
        StreamToken[] storage allocations = _streamTokens[streamId];
        uint256 length = allocations.length;
        StreamToken[] memory tokens = new StreamToken[](length);
        for (uint256 i = 0; i < length; i++) {
            tokens[i] = allocations[i];
        }
        return tokens;
    }

    function topUpStream(uint256 streamId, address token, uint256 amount) external nonReentrant whenNotPaused {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Invalid amount");

        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.sender == msg.sender, "Only sender can top up");

        StreamToken[] storage assets = _streamTokens[streamId];
        bool found;
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].token == token) {
                assets[i].totalAmount += amount;
                found = true;
                emit StreamToppedUp(streamId, msg.sender, token, amount, assets[i].totalAmount);
                break;
            }
        }

        if (!found) {
            assets.push(StreamToken({token: token, totalAmount: amount, claimedAmount: 0}));
            emit StreamToppedUp(streamId, msg.sender, token, amount, amount);
        }

        IERC20(token).safeTransferFrom(msg.sender, address(VAULT), amount);
        VAULT.pushToStrategy(token);
    }

    function extendStreamDuration(uint256 streamId, uint256 additionalDuration) external nonReentrant whenNotPaused {
        require(additionalDuration > 0, "Invalid duration");
        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.sender == msg.sender, "Only sender can extend");

        stream.duration += additionalDuration;
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
        if (stream.pausedDuration > stream.duration) {
            stream.pausedDuration = stream.duration;
        }

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

        StreamToken[] storage assets = _streamTokens[streamId];
        address[] memory eventTokens = new address[](tokens.length);
        uint256[] memory eventTotals = new uint256[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            require(tokens[i] != address(0), "Invalid token");
            require(totalAmounts[i] > 0, "Amount must be greater than zero");

            assets.push(StreamToken({token: tokens[i], totalAmount: totalAmounts[i], claimedAmount: 0}));
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
        StreamToken[] storage assets = _streamTokens[streamId];

        uint256 assetsLength = assets.length;
        uint256 accruedPoint = stream.lastClaimed;
        fullyClaimed = true;

        for (uint256 i = 0; i < assetsLength; i++) {
            AccountingLib.AccrualResult memory accrual = AccountingLib.calculateAccrual(
                assets[i].totalAmount,
                assets[i].claimedAmount,
                stream.startTime,
                stream.duration,
                stream.lastClaimed,
                stream.stopTime,
                block.timestamp,
                stream.isPaused,
                stream.pauseStart,
                stream.pausedDuration
            );

            accruedPoint = accrual.accrualPoint;

            if (accrual.claimable > 0) {
                assets[i].claimedAmount += accrual.claimable;
                VAULT.withdraw(assets[i].token, recipient, accrual.claimable);
                emit Claimed(streamId, recipient, assets[i].token, accrual.claimable);
            }

            if (assets[i].claimedAmount < assets[i].totalAmount) {
                fullyClaimed = false;
            }
        }

        stream.lastClaimed = accruedPoint;
    }

    function _finalizeStream(uint256 streamId, bool refundSender)
        internal
        returns (address recipient, address[] memory tokens, uint256[] memory refunded)
    {
        Stream storage stream = streams[streamId];
        StreamToken[] storage assets = _streamTokens[streamId];
        uint256 length = assets.length;

        tokens = new address[](length);
        refunded = new uint256[](length);

        recipient = ownerOf(streamId);

        for (uint256 i = 0; i < length; i++) {
            AccountingLib.AccrualResult memory accrual = AccountingLib.calculateAccrual(
                assets[i].totalAmount,
                assets[i].claimedAmount,
                stream.startTime,
                stream.duration,
                stream.lastClaimed,
                stream.stopTime,
                block.timestamp,
                stream.isPaused,
                stream.pauseStart,
                stream.pausedDuration
            );

            if (accrual.claimable > 0) {
                assets[i].claimedAmount += accrual.claimable;
                VAULT.withdraw(assets[i].token, recipient, accrual.claimable);
                emit Claimed(streamId, recipient, assets[i].token, accrual.claimable);
            }

            stream.lastClaimed = accrual.accrualPoint;
            stream.stopTime = accrual.accrualPoint;

            uint256 remainingAmount = assets[i].totalAmount - assets[i].claimedAmount;
            if (refundSender && remainingAmount > 0) {
                VAULT.withdraw(assets[i].token, stream.sender, remainingAmount);
            }

            tokens[i] = assets[i].token;
            refunded[i] = remainingAmount;
        }

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
