// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {StreamManager} from "../src/StreamManager.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {MockYieldStrategy} from "./mocks/MockYieldStrategy.sol";

contract StreamManagerTest is Test {
    StreamManager public streamManager;
    MockERC20 public tokenA;
    MockERC20 public tokenB;

    address public sender = address(0x1);
    address public recipient = address(0x2);
    uint256 public constant INITIAL_BALANCE = 1_000_000 * 1e6;

    event StreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        address[] tokens,
        uint256[] totalAmounts,
        uint256 startTime,
        uint256 duration
    );

    event StreamCanceled(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        address[] tokens,
        uint256[] refundedAmounts
    );

    event Claimed(uint256 indexed streamId, address indexed recipient, address indexed token, uint256 amount);

    event StreamsBatchClaimed(address indexed recipient, uint256[] streamIds);

    event StreamToppedUp(
        uint256 indexed streamId, address indexed sender, address indexed token, uint256 amount, uint256 newTotalAmount
    );

    function setUp() public {
        streamManager = new StreamManager();
        tokenA = new MockERC20("Token A", "TKA", INITIAL_BALANCE);
        tokenB = new MockERC20("Token B", "TKB", INITIAL_BALANCE);

        tokenA.transfer(sender, INITIAL_BALANCE / 2);
        tokenB.transfer(sender, INITIAL_BALANCE / 2);

        vm.startPrank(sender);
        tokenA.approve(address(streamManager), type(uint256).max);
        tokenB.approve(address(streamManager), type(uint256).max);
        vm.stopPrank();
    }

    function testCreateSingleTokenStream() public {
        uint256 totalAmount = 1_000 * 1e6;
        uint256 duration = 30 days;

        vm.prank(sender);
        vm.expectEmit(true, true, true, true);
        address[] memory tokens = new address[](1);
        tokens[0] = address(tokenA);
        uint256[] memory totals = new uint256[](1);
        totals[0] = totalAmount;
        emit StreamCreated(1, sender, recipient, tokens, totals, block.timestamp, duration);
        uint256 streamId = streamManager.createStream(recipient, address(tokenA), totalAmount, duration);

        assertEq(streamId, 1);
        assertEq(streamManager.ownerOf(streamId), recipient);

        (StreamManager.Stream memory details, StreamManager.StreamToken[] memory assets) =
            streamManager.getStream(streamId);
        assertEq(details.sender, sender);
        assertEq(details.recipient, recipient);
        assertEq(details.duration, duration);
        assertEq(details.isActive, true);
        assertEq(assets.length, 1);
        assertEq(assets[0].token, address(tokenA));
        assertEq(assets[0].totalAmount, totalAmount);
    }

    function testCreateMultiTokenStream() public {
        address[] memory tokens = new address[](2);
        tokens[0] = address(tokenA);
        tokens[1] = address(tokenB);
        uint256[] memory totals = new uint256[](2);
        totals[0] = 500 * 1e6;
        totals[1] = 250 * 1e6;
        uint256 duration = 90 days;

        vm.prank(sender);
        uint256 streamId = streamManager.createMultiTokenStream(recipient, tokens, totals, duration);
        assertEq(streamId, 1);

        (StreamManager.Stream memory details, StreamManager.StreamToken[] memory assets) =
            streamManager.getStream(streamId);
        assertEq(assets.length, 2);
        assertEq(assets[0].token, address(tokenA));
        assertEq(assets[1].token, address(tokenB));
        assertEq(assets[0].totalAmount, totals[0]);
        assertEq(assets[1].totalAmount, totals[1]);
        assertEq(details.duration, duration);
    }

    function testClaimStream() public {
        uint256 totalAmount = 1_000 * 1e6;
        uint256 duration = 100;

        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(tokenA), totalAmount, duration);
        uint256 start = block.timestamp;

        vm.warp(start + 10);
        uint256 expected = (totalAmount * 10) / duration;

        vm.prank(recipient);
        vm.expectEmit(true, true, true, true);
        emit Claimed(streamId, recipient, address(tokenA), expected);
        streamManager.claim(streamId);

        assertEq(tokenA.balanceOf(recipient), expected);
        (StreamManager.Stream memory details, StreamManager.StreamToken[] memory assets) =
            streamManager.getStream(streamId);
        assertEq(details.lastClaimed, block.timestamp);
        assertEq(assets[0].claimedAmount, expected);
    }

    function testClaimStreamsBatch() public {
        uint256 amount = 1_000 * 1e6;
        uint256 duration = 100;

        vm.startPrank(sender);
        uint256 streamId1 = streamManager.createStream(recipient, address(tokenA), amount, duration);
        uint256 streamId2 = streamManager.createStream(recipient, address(tokenA), amount, duration);
        vm.stopPrank();

        vm.warp(block.timestamp + 20);

        uint256[] memory claimIds = new uint256[](2);
        claimIds[0] = streamId1;
        claimIds[1] = streamId2;

        vm.prank(recipient);
        vm.expectEmit(true, true, true, true);
        emit StreamsBatchClaimed(recipient, claimIds);
        streamManager.claimStreamsBatch(claimIds);

        uint256 expected = ((amount * 20) / duration) * 2;
        assertEq(tokenA.balanceOf(recipient), expected);
    }

    function testCancelStream() public {
        uint256 totalAmount = 1_000 * 1e6;
        uint256 duration = 100;

        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(tokenA), totalAmount, duration);

        vm.warp(block.timestamp + 40);

        uint256 accrued = (totalAmount * 40) / duration;
        uint256 expectedRefund = totalAmount - accrued;

        address[] memory tokens = new address[](1);
        tokens[0] = address(tokenA);
        uint256[] memory refunds = new uint256[](1);
        refunds[0] = expectedRefund;

        vm.prank(sender);
        vm.expectEmit(true, true, true, true);
        emit StreamCanceled(streamId, sender, recipient, tokens, refunds);
        streamManager.cancelStream(streamId);

        assertEq(tokenA.balanceOf(recipient), accrued);
        assertEq(tokenA.balanceOf(sender), INITIAL_BALANCE / 2 - totalAmount + expectedRefund);
    }

    function testPauseAndResumeStream() public {
        uint256 totalAmount = 1_000 * 1e6;
        uint256 duration = 100;

        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(tokenA), totalAmount, duration);
        uint256 start = block.timestamp;

        vm.warp(start + 30);
        vm.prank(sender);
        streamManager.pauseStream(streamId);

        vm.warp(start + 60);
        (address[] memory tokens, uint256[] memory amounts) = streamManager.getStreamableAmounts(streamId);
        assertEq(tokens.length, 1);
        assertEq(amounts[0], 0);

        vm.prank(sender);
        streamManager.resumeStream(streamId);

        vm.warp(block.timestamp + 20);
        vm.prank(recipient);
        streamManager.claim(streamId);
        assertGt(tokenA.balanceOf(recipient), 0);
    }

    function testTopUpStream() public {
        uint256 totalAmount = 1_000 * 1e6;
        uint256 topUpAmount = 500 * 1e6;

        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(tokenA), totalAmount, 100);

        vm.prank(sender);
        vm.expectEmit(true, true, true, true);
        emit StreamToppedUp(streamId, sender, address(tokenA), topUpAmount, totalAmount + topUpAmount);
        streamManager.topUpStream(streamId, address(tokenA), topUpAmount);

        (, StreamManager.StreamToken[] memory assets) = streamManager.getStream(streamId);
        assertEq(assets[0].totalAmount, totalAmount + topUpAmount);
    }

    function testExtendStreamDuration() public {
        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(tokenA), 1_000 * 1e6, 100);

        vm.prank(sender);
        streamManager.extendStreamDuration(streamId, 50);

        (StreamManager.Stream memory details,) = streamManager.getStream(streamId);
        assertEq(details.duration, 150);
    }

    function testUpdateStreamRecipient() public {
        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(tokenA), 1_000 * 1e6, 100);

        address newRecipient = address(0x3);
        vm.prank(sender);
        streamManager.updateStreamRecipient(streamId, newRecipient);

        assertEq(streamManager.ownerOf(streamId), newRecipient);
        uint256[] memory newRecipientStreams = streamManager.getRecipientStreams(newRecipient);
        assertEq(newRecipientStreams.length, 1);
        assertEq(newRecipientStreams[0], streamId);
    }

    function testCreateStreamsBatch() public {
        StreamManager.BatchCreateParams[] memory params = new StreamManager.BatchCreateParams[](2);
        params[0] = StreamManager.BatchCreateParams({
            recipient: recipient,
            tokens: _wrapToken(address(tokenA)),
            totalAmounts: _wrapAmount(500 * 1e6),
            duration: 100
        });
        params[1] = StreamManager.BatchCreateParams({
            recipient: address(0x4),
            tokens: _wrapToken(address(tokenA)),
            totalAmounts: _wrapAmount(250 * 1e6),
            duration: 50
        });

        vm.prank(sender);
        uint256[] memory streamIds = streamManager.createStreamsBatch(params);
        assertEq(streamIds.length, 2);
        assertEq(streamIds[0], 1);
        assertEq(streamIds[1], 2);
    }

    function testYieldStrategyIntegration() public {
        MockYieldStrategy strategy = new MockYieldStrategy();
        streamManager.configureYieldStrategy(address(tokenA), address(strategy), 1000);

        vm.prank(sender);
        uint256 streamId = streamManager.createStream(recipient, address(tokenA), 1_000 * 1e6, 100);
        assertEq(streamId, 1);

        assertGt(tokenA.balanceOf(address(strategy)), 0);

        vm.warp(block.timestamp + 10);
        vm.prank(recipient);
        streamManager.claim(streamId);

        assertLt(tokenA.balanceOf(address(strategy)), 1_000 * 1e6);
    }

    function _wrapToken(address token) internal pure returns (address[] memory arr) {
        arr = new address[](1);
        arr[0] = token;
    }

    function _wrapAmount(uint256 amount) internal pure returns (uint256[] memory arr) {
        arr = new uint256[](1);
        arr[0] = amount;
    }
}
