// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {StreamVault} from "./StreamVault.sol";
import {AccountingLib} from "./AccountingLib.sol";

contract StreamManager is ReentrancyGuard, Pausable, Ownable {
    using AccountingLib for uint256;

    struct Stream {
        address sender;
        address recipient;
        address token;
        uint256 totalAmount;
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 stopTime;
        uint256 lastClaimed;
        bool isActive;
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

    event StreamCanceled(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 remainingAmount
    );

    event Claimed(
        uint256 indexed streamId,
        address indexed recipient,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {
        VAULT = new StreamVault();
    }

    function createStream(
        address recipient,
        address token,
        uint256 totalAmount,
        uint256 duration
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot stream to self");
        require(token != address(0), "Invalid token");
        require(totalAmount > 0, "Amount must be greater than zero");
        require(duration > 0, "Duration must be greater than zero");

        uint256 streamId = ++streamCounter;
        uint256 ratePerSecond = AccountingLib.calculateRatePerSecond(
            totalAmount,
            duration
        );

        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            token: token,
            totalAmount: totalAmount,
            ratePerSecond: ratePerSecond,
            startTime: block.timestamp,
            stopTime: 0,
            lastClaimed: block.timestamp,
            isActive: true
        });

        senderStreams[msg.sender].push(streamId);
        recipientStreams[recipient].push(streamId);

        require(
            IERC20(token).transferFrom(msg.sender, address(VAULT), totalAmount),
            "Transfer failed"
        );

        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            token,
            totalAmount,
            ratePerSecond,
            block.timestamp,
            duration
        );

        return streamId;
    }

    function cancelStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.sender == msg.sender, "Only sender can cancel");

        uint256 accruedAmount = AccountingLib.calculateAccrued(
            stream.ratePerSecond,
            stream.startTime,
            stream.stopTime,
            stream.lastClaimed
        );

        stream.stopTime = block.timestamp;
        stream.isActive = false;

        if (accruedAmount > 0) {
            VAULT.withdraw(stream.token, stream.recipient, accruedAmount);
            stream.lastClaimed = block.timestamp;
        }

        uint256 totalStreamed = AccountingLib.calculateAccrued(
            stream.ratePerSecond,
            stream.startTime,
            block.timestamp,
            stream.startTime
        );
        uint256 remainingAmount = stream.totalAmount - totalStreamed;

        if (remainingAmount > 0) {
            VAULT.withdraw(stream.token, stream.sender, remainingAmount);
        }

        emit StreamCanceled(
            streamId,
            stream.sender,
            stream.recipient,
            remainingAmount
        );
    }

    function claim(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.isActive, "Stream not active");
        require(stream.recipient == msg.sender, "Only recipient can claim");

        uint256 accruedAmount = AccountingLib.calculateAccrued(
            stream.ratePerSecond,
            stream.startTime,
            stream.stopTime,
            stream.lastClaimed
        );

        require(accruedAmount > 0, "No amount to claim");

        stream.lastClaimed = block.timestamp;
        VAULT.withdraw(stream.token, stream.recipient, accruedAmount);

        emit Claimed(streamId, stream.recipient, accruedAmount);
    }

    function getStreamableAmount(
        uint256 streamId
    ) external view returns (uint256) {
        Stream memory stream = streams[streamId];
        if (!stream.isActive) {
            return 0;
        }

        return
            AccountingLib.calculateAccrued(
                stream.ratePerSecond,
                stream.startTime,
                stream.stopTime,
                stream.lastClaimed
            );
    }

    function getStream(uint256 streamId) external view returns (Stream memory) {
        return streams[streamId];
    }

    function getSenderStreams(
        address sender
    ) external view returns (uint256[] memory) {
        return senderStreams[sender];
    }

    function getRecipientStreams(
        address recipient
    ) external view returns (uint256[] memory) {
        return recipientStreams[recipient];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
