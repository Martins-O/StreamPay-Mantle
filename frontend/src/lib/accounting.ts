export interface AccrualParams {
  totalAmount: bigint;
  claimedAmount: bigint;
  startTime: bigint;
  duration: bigint;
  lastClaimed: bigint;
  stopTime: bigint;
  timestamp: bigint;
  isPaused: boolean;
  pauseStart: bigint;
  pausedDuration: bigint;
}

export interface AccrualResult {
  claimable: bigint;
  accrualPoint: bigint;
}

const MAX_UINT = (1n << 256n) - 1n;

export function calculateAccrual({
  totalAmount,
  claimedAmount,
  startTime,
  duration,
  lastClaimed,
  stopTime,
  timestamp,
  isPaused,
  pauseStart,
  pausedDuration,
}: AccrualParams): AccrualResult {
  if (duration === 0n) {
    return { claimable: 0n, accrualPoint: lastClaimed };
  }

  if (timestamp <= lastClaimed) {
    return { claimable: 0n, accrualPoint: lastClaimed };
  }

  let streamEndTime = startTime + duration;
  if (pausedDuration > 0n) {
    streamEndTime += pausedDuration;
    if (streamEndTime < startTime) {
      streamEndTime = MAX_UINT;
    }
  }

  let effectiveTime = timestamp;

  if (isPaused && pauseStart !== 0n && pauseStart < effectiveTime) {
    effectiveTime = pauseStart;
  }

  if (stopTime !== 0n && stopTime < effectiveTime) {
    effectiveTime = stopTime;
  }

  if (effectiveTime > streamEndTime) {
    effectiveTime = streamEndTime;
  }

  if (effectiveTime <= lastClaimed) {
    return { claimable: 0n, accrualPoint: effectiveTime };
  }

  let elapsed = effectiveTime > startTime ? effectiveTime - startTime : 0n;

  if (pausedDuration > elapsed) {
    pausedDuration = elapsed;
  }

  let effectiveElapsed = elapsed - pausedDuration;

  if (effectiveElapsed > duration) {
    effectiveElapsed = duration;
  }

  const totalStreamed = (totalAmount * effectiveElapsed) / duration;

  if (totalStreamed <= claimedAmount) {
    return { claimable: 0n, accrualPoint: effectiveTime };
  }

  return { claimable: totalStreamed - claimedAmount, accrualPoint: effectiveTime };
}
