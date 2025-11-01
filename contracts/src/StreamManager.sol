// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {StreamVault} from "./StreamVault.sol";
import {AccountingLib} from "./AccountingLib.sol";

contract StreamManager is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct Stream {
        address sender;
        address recipient;
        address token;
        uint256 totalAmount;
        uint256 claimedAmount;
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
        address token;
        uint256 totalAmount;
        uint256 duration;
    }

    StreamVault public immutable VAULT;
    uint256 public streamCounter;
    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public senderStreams;
    mapping(address => uint256[]) public recipientStreams;

    event StreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        address token,
        uint256 totalAmount,
        uint256 ratePerSecond,
        uint256 startTime,
        uint256 duration
    );

    event StreamBatchCreated(address indexed sender, uint256[] streamIds);

    event StreamCanceled(
        uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 remainingAmount
    );

    event Claimed(uint256 indexed streamId, address indexed recipient, uint256 amount);

    event StreamPaused(uint256 indexed streamId, address indexed sender, uint256 pauseTimestamp);

    event StreamResumed(uint256 indexed streamId, address indexed sender, uint256 resumeTimestamp);

    constructor() Ownable(msg.sender) {
        VAULT = new StreamVault();
    }

    function createStream(address recipient, address token, uint256 totalAmount, uint256 duration)
        external
        nonReentrant
        whenNotPaused
        returns (uint256)
    {
        (uint256 streamId,) = _createStream(msg.sender, recipient, token, totalAmount, duration);
        return streamId;
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
            (uint256 streamId,) = _createStream(
                msg.sender, params[i].recipient, params[i].token, params[i].totalAmount, params[i].duration
            );
            streamIds[i] = streamId;
        }

        emit StreamBatchCreated(msg.sender, streamIds);
        return streamIds;
    }

    function cancelStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.sender == msg.sender, "Only sender can cancel");

        AccountingLib.AccrualResult memory accrual = AccountingLib.calculateAccrual(
            stream.totalAmount,
            stream.claimedAmount,
            stream.startTime,
            stream.duration,
            stream.lastClaimed,
            stream.stopTime,
            block.timestamp,
            stream.isPaused,
            stream.pauseStart,
            stream.pausedDuration
        );

        stream.isActive = false;
        stream.isPaused = false;
        stream.pauseStart = 0;

        if (accrual.claimable > 0) {
            stream.claimedAmount += accrual.claimable;
            VAULT.withdraw(stream.token, stream.recipient, accrual.claimable);
        }

        stream.lastClaimed = accrual.accrualPoint;
        stream.stopTime = accrual.accrualPoint;

        uint256 remainingAmount = stream.totalAmount - stream.claimedAmount;
        if (remainingAmount > 0) {
            VAULT.withdraw(stream.token, stream.sender, remainingAmount);
        }

        emit StreamCanceled(streamId, stream.sender, stream.recipient, remainingAmount);
    }

    function claim(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.recipient == msg.sender, "Only recipient can claim");
        require(!stream.isPaused, "Stream paused");

        AccountingLib.AccrualResult memory accrual = AccountingLib.calculateAccrual(
            stream.totalAmount,
            stream.claimedAmount,
            stream.startTime,
            stream.duration,
            stream.lastClaimed,
            stream.stopTime,
            block.timestamp,
            stream.isPaused,
            stream.pauseStart,
            stream.pausedDuration
        );

        require(accrual.claimable > 0, "No amount to claim");

        stream.claimedAmount += accrual.claimable;
        stream.lastClaimed = accrual.accrualPoint;
        if (stream.claimedAmount >= stream.totalAmount) {
            stream.isActive = false;
            stream.stopTime = accrual.accrualPoint;
        }
        VAULT.withdraw(stream.token, stream.recipient, accrual.claimable);

        emit Claimed(streamId, stream.recipient, accrual.claimable);
    }

    function getStreamableAmount(uint256 streamId) external view returns (uint256) {
        Stream memory stream = streams[streamId];
        if (!stream.isActive || stream.isPaused) {
            return 0;
        }

        AccountingLib.AccrualResult memory accrual = AccountingLib.calculateAccrual(
            stream.totalAmount,
            stream.claimedAmount,
            stream.startTime,
            stream.duration,
            stream.lastClaimed,
            stream.stopTime,
            block.timestamp,
            stream.isPaused,
            stream.pauseStart,
            stream.pausedDuration
        );
        return accrual.claimable;
    }

    function getStream(uint256 streamId) external view returns (Stream memory) {
        return streams[streamId];
    }

    function pauseStream(uint256 streamId) external nonReentrant whenNotPaused {
        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.sender == msg.sender, "Only sender can pause");
        require(!stream.isPaused, "Already paused");

        AccountingLib.AccrualResult memory accrual = AccountingLib.calculateAccrual(
            stream.totalAmount,
            stream.claimedAmount,
            stream.startTime,
            stream.duration,
            stream.lastClaimed,
            stream.stopTime,
            block.timestamp,
            false,
            stream.pauseStart,
            stream.pausedDuration
        );

        if (accrual.claimable > 0) {
            stream.claimedAmount += accrual.claimable;
            VAULT.withdraw(stream.token, stream.recipient, accrual.claimable);
        }

        stream.lastClaimed = accrual.accrualPoint;
        stream.pauseStart = accrual.accrualPoint;
        stream.isPaused = true;

        emit StreamPaused(streamId, stream.sender, accrual.accrualPoint);
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

    function _createStream(address sender, address recipient, address token, uint256 totalAmount, uint256 duration)
        internal
        returns (uint256 streamId, uint256 ratePerSecond)
    {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != sender, "Cannot stream to self");
        require(token != address(0), "Invalid token");
        require(totalAmount > 0, "Amount must be greater than zero");
        require(duration > 0, "Duration must be greater than zero");

        streamId = ++streamCounter;
        ratePerSecond = totalAmount / duration;

        streams[streamId] = Stream({
            sender: sender,
            recipient: recipient,
            token: token,
            totalAmount: totalAmount,
            claimedAmount: 0,
            startTime: block.timestamp,
            duration: duration,
            stopTime: 0,
            lastClaimed: block.timestamp,
            isActive: true,
            isPaused: false,
            pauseStart: 0,
            pausedDuration: 0
        });

        senderStreams[sender].push(streamId);
        recipientStreams[recipient].push(streamId);

        IERC20(token).safeTransferFrom(sender, address(VAULT), totalAmount);
        VAULT.pushToStrategy(token);

        emit StreamCreated(streamId, sender, recipient, token, totalAmount, ratePerSecond, block.timestamp, duration);
    }

    function getSenderStreams(address sender) external view returns (uint256[] memory) {
        return senderStreams[sender];
    }

    function getRecipientStreams(address recipient) external view returns (uint256[] memory) {
        return recipientStreams[recipient];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
