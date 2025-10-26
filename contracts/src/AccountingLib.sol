// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

library AccountingLib {
    function calculateAccrued(
        uint256 ratePerSecond,
        uint256 startTime,
        uint256 stopTime,
        uint256 lastClaimed
    ) internal view returns (uint256) {
        if (block.timestamp <= lastClaimed) {
            return 0;
        }

        uint256 currentTime = block.timestamp;
        uint256 effectiveStopTime = stopTime == 0 ? currentTime :
            (stopTime < currentTime ? stopTime : currentTime);

        uint256 effectiveStartTime = lastClaimed > startTime ? lastClaimed : startTime;

        if (effectiveStopTime <= effectiveStartTime) {
            return 0;
        }

        uint256 elapsedTime = effectiveStopTime - effectiveStartTime;
        return ratePerSecond * elapsedTime;
    }

    function calculateRatePerSecond(
        uint256 totalAmount,
        uint256 duration
    ) internal pure returns (uint256) {
        require(duration > 0, "Duration must be greater than zero");
        return totalAmount / duration;
    }
}