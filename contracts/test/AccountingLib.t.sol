// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {AccountingLib} from "../src/AccountingLib.sol";

contract TestContract {
    function calculateRatePerSecond(uint256 totalAmount, uint256 duration) external pure returns (uint256) {
        return AccountingLib.calculateRatePerSecond(totalAmount, duration);
    }
}

contract AccountingLibTest is Test {
    using AccountingLib for uint256;

    TestContract testContract;

    function setUp() public {
        testContract = new TestContract();
    }

    function testCalculateAccrued() public {
        uint256 ratePerSecond = 1e6; // 1 token per second
        uint256 startTime = 1000;
        uint256 stopTime = 0; // No stop time
        uint256 lastClaimed = 1000;

        // Set current time to 1010 (10 seconds later)
        vm.warp(1010);

        uint256 accrued = AccountingLib.calculateAccrued(ratePerSecond, startTime, stopTime, lastClaimed);
        assertEq(accrued, 10 * 1e6); // 10 seconds * 1 token per second
    }

    function testCalculateAccruedWithStopTime() public {
        uint256 ratePerSecond = 1e6;
        uint256 startTime = 1000;
        uint256 stopTime = 1005; // Stream stopped after 5 seconds
        uint256 lastClaimed = 1000;

        // Set current time to 1010 (past stop time)
        vm.warp(1010);

        uint256 accrued = AccountingLib.calculateAccrued(ratePerSecond, startTime, stopTime, lastClaimed);
        assertEq(accrued, 5 * 1e6); // Only 5 seconds should be counted
    }

    function testCalculateAccruedAlreadyClaimed() public {
        uint256 ratePerSecond = 1e6;
        uint256 startTime = 1000;
        uint256 stopTime = 0;
        uint256 lastClaimed = 1010; // Already claimed up to this point

        // Set current time to 1005 (before last claimed)
        vm.warp(1005);

        uint256 accrued = AccountingLib.calculateAccrued(ratePerSecond, startTime, stopTime, lastClaimed);
        assertEq(accrued, 0); // Nothing should be claimable
    }

    function testCalculateAccruedPartialClaim() public {
        uint256 ratePerSecond = 1e6;
        uint256 startTime = 1000;
        uint256 stopTime = 0;
        uint256 lastClaimed = 1005; // Claimed up to 5 seconds

        // Set current time to 1010
        vm.warp(1010);

        uint256 accrued = AccountingLib.calculateAccrued(ratePerSecond, startTime, stopTime, lastClaimed);
        assertEq(accrued, 5 * 1e6); // Should get 5 more seconds worth
    }

    function testCalculateAccruedZeroRate() public {
        uint256 ratePerSecond = 0;
        uint256 startTime = 1000;
        uint256 stopTime = 0;
        uint256 lastClaimed = 1000;

        vm.warp(1010);

        uint256 accrued = AccountingLib.calculateAccrued(ratePerSecond, startTime, stopTime, lastClaimed);
        assertEq(accrued, 0);
    }

    function testCalculateRatePerSecond() public {
        uint256 totalAmount = 3600 * 1e6; // 3600 tokens
        uint256 duration = 3600; // 1 hour in seconds

        uint256 rate = AccountingLib.calculateRatePerSecond(totalAmount, duration);
        assertEq(rate, 1e6); // 1 token per second
    }

    function testCalculateRatePerSecondRounding() public {
        uint256 totalAmount = 100 * 1e6; // 100 tokens
        uint256 duration = 3; // 3 seconds

        uint256 rate = AccountingLib.calculateRatePerSecond(totalAmount, duration);
        assertEq(rate, 33333333); // Truncated division: 100000000 / 3 = 33333333
    }

    function testCalculateRatePerSecondZeroDuration() public {
        uint256 totalAmount = 1000 * 1e6;
        uint256 duration = 0;

        vm.expectRevert(bytes("Duration must be greater than zero"));
        testContract.calculateRatePerSecond(totalAmount, duration);
    }

    function testCalculateAccruedComplexScenario() public {
        uint256 ratePerSecond = 578703; // Irregular rate
        uint256 startTime = 1682000000; // Some timestamp
        uint256 stopTime = 0;
        uint256 lastClaimed = startTime + 123; // Claimed after 123 seconds

        vm.warp(startTime + 456); // Current time is 456 seconds after start

        uint256 accrued = AccountingLib.calculateAccrued(ratePerSecond, startTime, stopTime, lastClaimed);
        uint256 expectedAccrued = ratePerSecond * (456 - 123); // 333 seconds worth
        assertEq(accrued, expectedAccrued);
    }

    function testCalculateAccruedEdgeCases() public {
        uint256 ratePerSecond = 1;
        uint256 startTime = 1000;
        uint256 stopTime = 1000; // Stop time equals start time
        uint256 lastClaimed = 1000;

        vm.warp(1010);

        uint256 accrued = AccountingLib.calculateAccrued(ratePerSecond, startTime, stopTime, lastClaimed);
        assertEq(accrued, 0); // No time elapsed between start and stop
    }

    function testCalculateAccruedLastClaimedAfterStart() public {
        uint256 ratePerSecond = 1e6;
        uint256 startTime = 1000;
        uint256 stopTime = 0;
        uint256 lastClaimed = 1005; // Last claimed after start

        vm.warp(1015);

        uint256 accrued = AccountingLib.calculateAccrued(ratePerSecond, startTime, stopTime, lastClaimed);
        assertEq(accrued, 10 * 1e6); // From 1005 to 1015 = 10 seconds
    }
}