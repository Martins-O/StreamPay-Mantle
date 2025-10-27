// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {AccountingLib} from "../src/AccountingLib.sol";

contract AccountingLibHarness {
    function calculateAccrual(
        uint256 totalAmount,
        uint256 claimedAmount,
        uint256 startTime,
        uint256 duration,
        uint256 lastClaimed,
        uint256 stopTime,
        uint256 timestamp
    ) external pure returns (AccountingLib.AccrualResult memory) {
        return AccountingLib.calculateAccrual(
            totalAmount,
            claimedAmount,
            startTime,
            duration,
            lastClaimed,
            stopTime,
            timestamp
        );
    }
}

contract AccountingLibTest is Test {
    AccountingLibHarness private harness;

    function setUp() public {
        harness = new AccountingLibHarness();
    }

    function testAccrualBasic() public view {
        uint256 totalAmount = 1_000 ether;
        uint256 claimedAmount = 0;
        uint256 startTime = 1_000;
        uint256 duration = 100;
        uint256 timestamp = startTime + 10;

        AccountingLib.AccrualResult memory result = harness.calculateAccrual(
            totalAmount,
            claimedAmount,
            startTime,
            duration,
            startTime,
            0,
            timestamp
        );

        uint256 expectedClaimable = (totalAmount * 10) / duration;
        assertEq(result.claimable, expectedClaimable);
        assertEq(result.accrualPoint, timestamp);
    }

    function testAccrualRespectsClaimedAmount() public view {
        uint256 totalAmount = 1_000 ether;
        uint256 claimedAmount = 300 ether;
        uint256 startTime = 1_000;
        uint256 duration = 100;
        uint256 timestamp = startTime + 50;

        AccountingLib.AccrualResult memory result = harness.calculateAccrual(
            totalAmount,
            claimedAmount,
            startTime,
            duration,
            startTime + 30,
            0,
            timestamp
        );

        uint256 totalStreamed = (totalAmount * 50) / duration;
        assertEq(result.claimable, totalStreamed - claimedAmount);
        assertEq(result.accrualPoint, timestamp);
    }

    function testAccrualCapsAtStopTime() public view {
        uint256 totalAmount = 1_000 ether;
        uint256 claimedAmount = 0;
        uint256 startTime = 1_000;
        uint256 duration = 100;
        uint256 stopTime = startTime + 25;
        uint256 timestamp = startTime + 50;

        AccountingLib.AccrualResult memory result = harness.calculateAccrual(
            totalAmount,
            claimedAmount,
            startTime,
            duration,
            startTime,
            stopTime,
            timestamp
        );

        uint256 expectedStreamed = (totalAmount * 25) / duration;
        assertEq(result.claimable, expectedStreamed);
        assertEq(result.accrualPoint, stopTime);
    }

    function testAccrualCapsAtEndOfStream() public view {
        uint256 totalAmount = 1_000 ether;
        uint256 claimedAmount = 0;
        uint256 startTime = 1_000;
        uint256 duration = 100;
        uint256 timestamp = startTime + 1_000;

        AccountingLib.AccrualResult memory result = harness.calculateAccrual(
            totalAmount,
            claimedAmount,
            startTime,
            duration,
            startTime,
            0,
            timestamp
        );

        assertEq(result.claimable, totalAmount);
        assertEq(result.accrualPoint, startTime + duration);
    }

    function testAccrualNoNewAmountWhenTimestampBeforeLastClaimed() public view {
        uint256 totalAmount = 1_000 ether;
        uint256 claimedAmount = 400 ether;
        uint256 startTime = 1_000;
        uint256 duration = 100;
        uint256 lastClaimed = startTime + 60;
        uint256 timestamp = startTime + 50;

        AccountingLib.AccrualResult memory result = harness.calculateAccrual(
            totalAmount,
            claimedAmount,
            startTime,
            duration,
            lastClaimed,
            0,
            timestamp
        );

        assertEq(result.claimable, 0);
        assertEq(result.accrualPoint, lastClaimed);
    }

    function testAccrualHandlesZeroDuration() public view {
        AccountingLib.AccrualResult memory result = harness.calculateAccrual(
            1_000 ether,
            0,
            1_000,
            0,
            1_000,
            0,
            2_000
        );

        assertEq(result.claimable, 0);
        assertEq(result.accrualPoint, 1_000);
    }
}
