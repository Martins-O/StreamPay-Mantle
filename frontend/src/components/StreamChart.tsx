import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Stream } from '@/lib/contract';
import { formatTokenAmount } from '@/lib/hooks';

interface StreamChartProps {
  stream: Stream;
}

type ViewMode = 'hourly' | 'daily';

const VIEW_OPTIONS: Array<{ value: ViewMode; label: string }> = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
];

const UPDATE_INTERVAL_MS = 4_000;

const StreamChart = ({ stream }: StreamChartProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('hourly');
  const decimals = stream.tokenDecimals ?? 18;
  const totalAmount = useMemo(
    () => parseFloat(formatTokenAmount(stream.totalAmount, decimals)),
    [stream.totalAmount, decimals],
  );
  const totalDurationSeconds = useMemo(
    () => Math.max(Number(stream.duration), 1),
    [stream.duration],
  );

  const computeProgress = useCallback(() => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const adjustedEnd = Number(stream.startTime + stream.duration);
    const cappedNow = Math.min(nowSeconds, adjustedEnd);

    let reference = BigInt(cappedNow);
    if (stream.isPaused && stream.pauseStart > 0n && stream.pauseStart < reference) {
      reference = stream.pauseStart;
    }

    let elapsed = reference > stream.startTime ? reference - stream.startTime : 0n;
    const paused = stream.pausedDuration;
    if (elapsed > paused) {
      elapsed -= paused;
    } else {
      elapsed = 0n;
    }

    if (elapsed > stream.duration) {
      elapsed = stream.duration;
    }

    const elapsedSeconds = Number(elapsed);
    const fraction = totalDurationSeconds > 0 ? Math.min(Math.max(Number(elapsed) / totalDurationSeconds, 0), 1) : 0;

    const streamedAmount = stream.duration > 0n
      ? (stream.totalAmount * elapsed) / stream.duration
      : stream.totalAmount;
    const claimableAmount = streamedAmount > stream.claimedAmount
      ? streamedAmount - stream.claimedAmount
      : 0n;
    const remainingToStream = stream.totalAmount > streamedAmount
      ? stream.totalAmount - streamedAmount
      : 0n;
    const remainingToClaim = stream.totalAmount > stream.claimedAmount
      ? stream.totalAmount - stream.claimedAmount
      : 0n;
    const totalProgress = stream.totalAmount > 0n
      ? Number((streamedAmount * 10000n) / stream.totalAmount) / 100
      : 0;

    return {
      elapsedSeconds,
      fraction,
      streamedAmount,
      claimableAmount,
      remainingToStream,
      remainingToClaim,
      progressPercent: Math.min(Math.max(totalProgress, 0), 100),
      isNotStarted: nowSeconds < Number(stream.startTime),
    };
  }, [stream, totalDurationSeconds]);

  const [snapshot, setSnapshot] = useState(() => computeProgress());

  useEffect(() => {
    setSnapshot(computeProgress());
  }, [computeProgress]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) {
        setSnapshot(computeProgress());
      }
    }, UPDATE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [computeProgress]);

  const totalFormatted = useMemo(
    () => formatTokenAmount(stream.totalAmount, decimals),
    [stream.totalAmount, decimals],
  );
  const streamedFormatted = useMemo(
    () => formatTokenAmount(snapshot.streamedAmount, decimals),
    [snapshot.streamedAmount, decimals],
  );
  const claimableFormatted = useMemo(
    () => formatTokenAmount(snapshot.claimableAmount, decimals),
    [snapshot.claimableAmount, decimals],
  );
  const claimedFormatted = useMemo(
    () => formatTokenAmount(stream.claimedAmount, decimals),
    [stream.claimedAmount, decimals],
  );
  const remainingFormatted = useMemo(
    () => formatTokenAmount(snapshot.remainingToStream, decimals),
    [snapshot.remainingToStream, decimals],
  );

  const totalAmountNumber = useMemo(() => parseFloat(totalFormatted), [totalFormatted]);
  const ratePerSecond = totalDurationSeconds > 0 ? totalAmountNumber / totalDurationSeconds : 0;
  const ratePerHour = ratePerSecond * 3_600;
  const ratePerDay = ratePerHour * 24;

  const elapsedSeconds = snapshot.elapsedSeconds;
  const elapsedLabel = elapsedSeconds === 0
    ? 'Not started'
    : formatDuration(elapsedSeconds);
  const timeUntilStart = snapshot.isNotStarted
    ? Math.max(Number(stream.startTime) - Math.floor(Date.now() / 1000), 0)
    : 0;
  const remainingDurationSeconds = stream.isPaused
    ? null
    : Number(stream.duration > BigInt(elapsedSeconds)
      ? stream.duration - BigInt(elapsedSeconds)
      : 0n);
  const remainingLabel = stream.isPaused
    ? 'Paused'
    : snapshot.progressPercent >= 100
      ? 'Completed'
      : remainingDurationSeconds !== null
        ? formatDuration(remainingDurationSeconds)
        : '—';

  const completionTimestampSeconds = Number(stream.startTime + stream.duration + stream.pausedDuration);
  const completionEta = new Date(completionTimestampSeconds * 1000);

  let statusLabel = 'Live';
  let statusTone = 'text-primary';
  if (!stream.isActive || snapshot.progressPercent >= 100) {
    statusLabel = 'Completed';
    statusTone = 'text-emerald-400';
  } else if (stream.isPaused) {
    statusLabel = 'Paused';
    statusTone = 'text-amber-400';
  } else if (snapshot.isNotStarted) {
    statusLabel = 'Scheduled';
    statusTone = 'text-sky-400';
  }

  const etaLabel = (() => {
    if (!stream.isActive || snapshot.progressPercent >= 100) {
      return 'Stream fully settled';
    }
    if (stream.isPaused) {
      return 'Resume the stream to continue accrual';
    }
    if (snapshot.isNotStarted && timeUntilStart > 0) {
      return `Starts in ${formatDuration(timeUntilStart)}`;
    }
    return `Projected completion: ${completionEta.toLocaleString()}`;
  })();

  const rateLabel = viewMode === 'hourly'
    ? `${ratePerHour.toFixed(4)} per hour`
    : `${ratePerDay.toFixed(4)} per day`;

  const progressPercentRounded = Math.min(Math.max(Number(snapshot.progressPercent.toFixed(1)), 0), 100);

  return (
    <Card className="glass-card p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Stream Analytics</h3>
          <p className="text-sm text-muted-foreground">Live snapshot of the highlighted stream</p>
        </div>
        <div className="flex gap-2">
          {VIEW_OPTIONS.map(option => (
            <Button
              key={option.value}
              size="sm"
              variant={viewMode === option.value ? 'default' : 'outline'}
              onClick={() => setViewMode(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Progress</p>
              <p className="text-3xl font-semibold">{progressPercentRounded.toFixed(1)}%</p>
            </div>
            <span className={`text-sm font-medium ${statusTone}`}>{statusLabel}</span>
          </div>
          <Progress value={progressPercentRounded} className="h-2" />
          <div className="grid gap-3 sm:grid-cols-2">
            <StatBlock label="Elapsed" value={elapsedLabel} />
            <StatBlock label="Remaining" value={remainingLabel} />
            <StatBlock label="Claimable now" value={`${claimableFormatted}`} emphasis />
            <StatBlock label="Claimed to date" value={claimedFormatted} />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border/60 bg-background/60 p-4">
          <StatBlock label="Total amount" value={totalFormatted} />
          <StatBlock label="Streamed so far" value={streamedFormatted} />
          <StatBlock label="Remaining to stream" value={remainingFormatted} />
          <StatBlock label="Payout cadence" value={rateLabel} />
          <p className="text-xs text-muted-foreground">{etaLabel}</p>
        </div>
      </div>
    </Card>
  );
};

interface StatBlockProps {
  label: string;
  value: string;
  emphasis?: boolean;
}

const StatBlock = ({ label, value, emphasis = false }: StatBlockProps) => (
  <div className="rounded-lg border border-border/50 bg-background/40 p-3">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={`mt-1 text-sm ${emphasis ? 'font-semibold text-primary' : 'text-foreground'}`}>{value}</p>
  </div>
);

const formatDuration = (seconds: number) => {
  if (seconds <= 0) {
    return '0s';
  }

  const units: Array<{ label: string; value: number }> = [
    { label: 'd', value: 86_400 },
    { label: 'h', value: 3_600 },
    { label: 'm', value: 60 },
    { label: 's', value: 1 },
  ];

  const parts: string[] = [];
  let remainder = seconds;

  for (const unit of units) {
    if (remainder >= unit.value) {
      const count = Math.floor(remainder / unit.value);
      parts.push(`${count}${unit.label}`);
      remainder -= count * unit.value;
    }
    if (parts.length === 2) {
      break;
    }
  }

  return parts.join(' ');
};

export default StreamChart;
