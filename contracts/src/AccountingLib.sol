// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

library AccountingLib {
    struct AccrualResult {
        uint256 claimable;
        uint256 accrualPoint;
    }

    function calculateAccrual(
        uint256 totalAmount,
        uint256 claimedAmount,
        uint256 startTime,
        uint256 duration,
        uint256 lastClaimed,
        uint256 stopTime,
        uint256 timestamp,
        bool isPaused,
        uint256 pauseStart,
        uint256 pausedDuration
    ) internal pure returns (AccrualResult memory) {
        if (duration == 0) {
            return AccrualResult({claimable: 0, accrualPoint: lastClaimed});
        }

        if (timestamp <= lastClaimed) {
            return AccrualResult({claimable: 0, accrualPoint: lastClaimed});
        }

        uint256 streamEndTime = startTime + duration;
        if (pausedDuration > 0) {
            streamEndTime += pausedDuration;
            if (streamEndTime < startTime) {
                streamEndTime = type(uint256).max;
            }
        }
        uint256 effectiveTime = timestamp;

        if (isPaused && pauseStart != 0 && pauseStart < effectiveTime) {
            effectiveTime = pauseStart;
        }

        if (stopTime != 0 && stopTime < effectiveTime) {
            effectiveTime = stopTime;
        }

        if (effectiveTime > streamEndTime) {
            effectiveTime = streamEndTime;
        }

        if (effectiveTime <= lastClaimed) {
            return AccrualResult({claimable: 0, accrualPoint: effectiveTime});
        }

        uint256 elapsed = effectiveTime > startTime ? effectiveTime - startTime : 0;

        if (pausedDuration > elapsed) {
            pausedDuration = elapsed;
        }

        uint256 effectiveElapsed = elapsed - pausedDuration;

        if (effectiveElapsed > duration) {
            effectiveElapsed = duration;
        }

        uint256 totalStreamed = (totalAmount * effectiveElapsed) / duration;

        if (totalStreamed <= claimedAmount) {
            return AccrualResult({claimable: 0, accrualPoint: effectiveTime});
        }

        uint256 claimable = totalStreamed - claimedAmount;
        return AccrualResult({claimable: claimable, accrualPoint: effectiveTime});
    }
}
