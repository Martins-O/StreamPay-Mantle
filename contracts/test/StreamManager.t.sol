// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {StreamManager} from "../src/StreamManager.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract StreamManagerTest is Test {
    StreamManager public streamManager;
    MockERC20 public token;

    address public sender = address(0x1);
    address public recipient = address(0x2);
    uint256 public constant INITIAL_BALANCE = 1000000 * 1e6; // 1M tokens

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

    function setUp() public {
        streamManager = new StreamManager();
        token = new MockERC20("Test Token", "TEST", INITIAL_BALANCE);

        // Transfer tokens to sender
        token.transfer(sender, INITIAL_BALANCE / 2);

        // Approve StreamManager to spend tokens
        vm.prank(sender);
        token.approve(address(streamManager), type(uint256).max);
    }

    function testCreateStream() public {
        uint256 totalAmount = 1000 * 1e6; // 1000 tokens
        uint256 duration = 30 days;

        vm.prank(sender);
        vm.expectEmit(true, true, true, true);
        emit StreamCreated(1, sender, recipient, address(token), totalAmount, totalAmount / duration, block.timestamp, duration);

        uint256 streamId = streamManager.createStream(recipient, address(token), totalAmount, duration);

        assertEq(streamId, 1);

        StreamManager.Stream memory stream = streamManager.getStream(streamId);
        assertEq(stream.sender, sender);
        assertEq(stream.recipient, recipient);
        assertEq(stream.token, address(token));
        assertEq(stream.totalAmount, totalAmount);
        assertEq(stream.ratePerSecond, totalAmount / duration);
        assertEq(stream.startTime, block.timestamp);
        assertEq(stream.stopTime, 0);
        assertEq(stream.lastClaimed, block.timestamp);
        assertTrue(stream.isActive);
    }

    function testCreateStreamInvalidRecipient() public {
        vm.prank(sender);
        vm.expectRevert("Invalid recipient");
        streamManager.createStream(address(0), address(token), 1000 * 1e6, 30 days);

        vm.prank(sender);
        vm.expectRevert("Cannot stream to self");
        streamManager.createStream(sender, address(token), 1000 * 1e6, 30 days);
    }

    function testCreateStreamInvalidToken() public {
        vm.prank(sender);
        vm.expectRevert("Invalid token");
        streamManager.createStream(recipient, address(0), 1000 * 1e6, 30 days);
    }

    function testCreateStreamInvalidAmount() public {
        vm.prank(sender);
        vm.expectRevert("Amount must be greater than zero");
        streamManager.createStream(recipient, address(token), 0, 30 days);
    }

    function testCreateStreamInvalidDuration() public {
        vm.prank(sender);
        vm.expectRevert("Duration must be greater than zero");
        streamManager.createStream(recipient, address(token), 1000 * 1e6, 0);
    }

    function testClaimStream() public {
        uint256 totalAmount = 1000 * 1e6;
        uint256 duration = 100; // 100 seconds for easier testing

        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(token), totalAmount, duration);

        // Fast forward 10 seconds
        vm.warp(block.timestamp + 10);

        uint256 expectedAmount = (totalAmount / duration) * 10; // 10 seconds worth
        uint256 streamableAmount = streamManager.getStreamableAmount(streamId);
        assertEq(streamableAmount, expectedAmount);

        uint256 recipientBalanceBefore = token.balanceOf(recipient);

        vm.prank(recipient);
        vm.expectEmit(true, true, false, true);
        emit Claimed(streamId, recipient, expectedAmount);
        streamManager.claim(streamId);

        uint256 recipientBalanceAfter = token.balanceOf(recipient);
        assertEq(recipientBalanceAfter - recipientBalanceBefore, expectedAmount);

        // Check stream state updated
        StreamManager.Stream memory stream = streamManager.getStream(streamId);
        assertEq(stream.lastClaimed, block.timestamp);
    }

    function testClaimStreamNotRecipient() public {
        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(token), 1000 * 1e6, 100);

        vm.warp(block.timestamp + 10);

        vm.prank(sender);
        vm.expectRevert("Only recipient can claim");
        streamManager.claim(streamId);
    }

    function testClaimStreamNoAmount() public {
        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(token), 1000 * 1e6, 100);

        // Try to claim immediately without any time passing
        vm.prank(recipient);
        vm.expectRevert("No amount to claim");
        streamManager.claim(streamId);
    }

    function testCancelStream() public {
        uint256 totalAmount = 1000 * 1e6;
        uint256 duration = 100;

        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(token), totalAmount, duration);

        // Fast forward 10 seconds
        vm.warp(block.timestamp + 10);

        uint256 expectedClaimAmount = (totalAmount / duration) * 10;
        uint256 expectedRefundAmount = totalAmount - expectedClaimAmount;

        uint256 senderBalanceBefore = token.balanceOf(sender);
        uint256 recipientBalanceBefore = token.balanceOf(recipient);

        vm.prank(sender);
        vm.expectEmit(true, true, true, true);
        emit StreamCanceled(streamId, sender, recipient, expectedRefundAmount);
        streamManager.cancelStream(streamId);

        // Check balances
        assertEq(token.balanceOf(recipient) - recipientBalanceBefore, expectedClaimAmount);
        assertEq(token.balanceOf(sender) - senderBalanceBefore, expectedRefundAmount);

        // Check stream state
        StreamManager.Stream memory stream = streamManager.getStream(streamId);
        assertFalse(stream.isActive);
        assertEq(stream.stopTime, block.timestamp);
    }

    function testCancelStreamNotSender() public {
        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(token), 1000 * 1e6, 100);

        vm.prank(recipient);
        vm.expectRevert("Only sender can cancel");
        streamManager.cancelStream(streamId);
    }

    function testCancelStreamNotActive() public {
        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(token), 1000 * 1e6, 100);

        vm.prank(sender);
        streamManager.cancelStream(streamId);

        vm.prank(sender);
        vm.expectRevert("Stream not active");
        streamManager.cancelStream(streamId);
    }

    function testMultipleStreams() public {
        uint256 totalAmount = 1000 * 1e6;
        uint256 duration = 100;

        vm.startPrank(sender);
        uint256 streamId1 = streamManager.createStream(recipient, address(token), totalAmount, duration);
        uint256 streamId2 = streamManager.createStream(recipient, address(token), totalAmount, duration);
        vm.stopPrank();

        assertEq(streamId1, 1);
        assertEq(streamId2, 2);

        uint256[] memory senderStreams = streamManager.getSenderStreams(sender);
        uint256[] memory recipientStreams = streamManager.getRecipientStreams(recipient);

        assertEq(senderStreams.length, 2);
        assertEq(recipientStreams.length, 2);
        assertEq(senderStreams[0], 1);
        assertEq(senderStreams[1], 2);
        assertEq(recipientStreams[0], 1);
        assertEq(recipientStreams[1], 2);
    }

    function testStreamComplete() public {
        uint256 totalAmount = 1000 * 1e6;
        uint256 duration = 100;

        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(token), totalAmount, duration);

        // Fast forward exactly to the end of duration
        vm.warp(block.timestamp + duration);

        uint256 streamableAmount = streamManager.getStreamableAmount(streamId);
        assertEq(streamableAmount, totalAmount);

        vm.prank(recipient);
        streamManager.claim(streamId);

        // Should have no more streamable amount
        assertEq(streamManager.getStreamableAmount(streamId), 0);
    }

    function testPauseUnpause() public {
        streamManager.pause();

        vm.prank(sender);
        vm.expectRevert();
        streamManager.createStream(recipient, address(token), 1000 * 1e6, 100);

        streamManager.unpause();

        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(token), 1000 * 1e6, 100);
        assertEq(streamId, 1);
    }
}