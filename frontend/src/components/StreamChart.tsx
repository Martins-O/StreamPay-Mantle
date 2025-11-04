import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Stream } from '@/lib/contract';
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Bar,
  Cell,
  Line,
  ErrorBar,
  type TooltipProps,
} from 'recharts';
import { formatTokenAmount } from '@/lib/hooks';

interface StreamChartProps {
  stream: Stream;
}

type ViewMode = 'hourly' | 'daily';

type ChartPoint = {
  time: string;
  projected: number;
  open: number;
  close: number;
  high: number;
  low: number;
  base: number;
  body: number;
  wick: [number, number];
  direction: 'up' | 'down';
  isCurrent: boolean;
  change: number;
  startSeconds: number;
  endSeconds: number;
};

const VIEW_OPTIONS: Array<{ value: ViewMode; label: string }> = [
  { value: 'hourly', label: 'Hourly rate' },
  { value: 'daily', label: 'Daily rate' },
];

const StreamChart = ({ stream }: StreamChartProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('hourly');
  const decimals = stream.tokenDecimals ?? 18;
  const totalAmount = useMemo(
    () => parseFloat(formatTokenAmount(stream.totalAmount, decimals)),
    [stream.totalAmount, decimals],
  );
  const totalDurationSeconds = useMemo(() => Number(stream.duration), [stream.duration]);

  const bucketSize = viewMode === 'hourly' ? 3_600 : 86_400;

  const buckets = useMemo(() => {
    const count = Math.max(1, Math.ceil(totalDurationSeconds / Math.max(bucketSize, 1)));
    return Array.from({ length: count }, (_, index) => {
      const start = Math.min(index * bucketSize, totalDurationSeconds);
      const rawEnd = Math.min((index + 1) * bucketSize, totalDurationSeconds);
      const end = index === count - 1 ? totalDurationSeconds : rawEnd;
      const label = viewMode === 'hourly' ? `Hour ${index + 1}` : `Day ${index + 1}`;
      const startFraction = totalDurationSeconds > 0 ? start / totalDurationSeconds : 0;
      const endFraction = totalDurationSeconds > 0 ? end / totalDurationSeconds : 0;

      return {
        index,
        label,
        start,
        end,
        startFraction,
        endFraction,
      };
    });
  }, [bucketSize, totalDurationSeconds, viewMode]);

  const calculateProgress = useCallback(() => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const endTime = Number(stream.startTime + stream.duration);
    const cappedNow = Math.min(nowSeconds, endTime);

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

    const progressFraction = stream.duration > 0n ? Number(elapsed) / Number(stream.duration) : 0;
    const streamedAmount = stream.duration > 0n
      ? (stream.totalAmount * elapsed) / stream.duration
      : 0n;

    return {
      fraction: Math.min(Math.max(progressFraction, 0), 1),
      elapsedSeconds: Number(elapsed),
      streamedAmount,
    };
  }, [stream]);

  const buildChartData = useCallback(() => {
    if (totalDurationSeconds <= 0) {
      return [
        {
          time: VIEW_OPTIONS.find(option => option.value === viewMode)?.label ?? 'Period',
          projected: totalAmount,
          open: 0,
          close: totalAmount,
          high: totalAmount,
          low: 0,
          base: 0,
          body: totalAmount,
          wick: [0, 0],
          direction: 'up',
          isCurrent: true,
          change: totalAmount,
          startSeconds: 0,
          endSeconds: 0,
        },
      ] satisfies ChartPoint[];
    }

    const { fraction, elapsedSeconds, streamedAmount } = calculateProgress();
    const currentActual = parseFloat(formatTokenAmount(streamedAmount, decimals));

    let currentMarked = false;

    return buckets.map((bucket, index) => {
      const actualStartSeconds = Math.min(bucket.start, elapsedSeconds);
      const actualEndSeconds = Math.min(bucket.end, elapsedSeconds);

      const openValue = totalAmount * (actualStartSeconds / totalDurationSeconds);
      const closeValue = totalAmount * (actualEndSeconds / totalDurationSeconds);
      const projectedCloseValue = totalAmount * bucket.endFraction;

      const highValue = Math.max(openValue, closeValue, projectedCloseValue);
      const lowValue = Math.min(openValue, closeValue, projectedCloseValue);
      const bodyBase = Math.min(openValue, closeValue);
      const bodyHeight = Math.abs(closeValue - openValue);
      const upperWick = highValue - Math.max(openValue, closeValue);
      const lowerWick = bodyBase - lowValue;

      const isCurrent = !currentMarked && (elapsedSeconds <= bucket.end || index === buckets.length - 1);
      if (isCurrent) {
        currentMarked = true;
      }

      return {
        time: bucket.label,
        projected: totalAmount * bucket.endFraction,
        open: openValue,
        close: index === buckets.length - 1 ? currentActual : closeValue,
        high: index === buckets.length - 1 ? Math.max(highValue, currentActual) : highValue,
        low: lowValue,
        base: bodyBase,
        body: bodyHeight,
        wick: [Math.max(lowerWick, 0), Math.max(upperWick, 0)],
        direction: closeValue >= openValue ? 'up' : 'down',
        isCurrent,
        change: Math.max(closeValue - openValue, 0),
        startSeconds: bucket.start,
        endSeconds: bucket.end,
      } satisfies ChartPoint;
    });
  }, [buckets, calculateProgress, decimals, totalAmount, totalDurationSeconds, viewMode]);

  const [chartData, setChartData] = useState<ChartPoint[]>(() => buildChartData());

  useEffect(() => {
    setChartData(buildChartData());
  }, [buildChartData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(buildChartData());
    }, 1_000);

    return () => clearInterval(interval);
  }, [buildChartData]);

  return (
    <Card className="glass-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Stream Progress</h3>
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
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
          <XAxis dataKey="time" stroke="hsl(215, 20%, 65%)" style={{ fontSize: '12px' }} />
          <YAxis stroke="hsl(215, 20%, 65%)" style={{ fontSize: '12px' }} />
          <Tooltip content={props => <CandleTooltip viewMode={viewMode} {...props} />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />

          <Bar dataKey="base" stackId="progress" fill="transparent" isAnimationActive={false} hide />
          <Bar
            dataKey="body"
            stackId="progress"
            barSize={16}
            radius={[3, 3, 3, 3]}
            name="Actual streamed"
            legendType="rect"
          >
            {chartData.map((entry, index) => {
              const fill = entry.direction === 'up'
                ? 'hsl(171, 100%, 45%)'
                : 'hsl(5, 85%, 55%)';
              const stroke = entry.isCurrent ? 'hsl(51, 100%, 65%)' : fill;
              return (
                <Cell
                  key={`${entry.time}-${index}`}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={entry.isCurrent ? 2 : 1}
                />
              );
            })}
            <ErrorBar dataKey="wick" width={0} stroke="hsl(210, 20%, 75%)" strokeWidth={2} direction="y" />
          </Bar>

          <Line
            type="monotone"
            dataKey="projected"
            stroke="hsl(215, 20%, 50%)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            isAnimationActive={false}
            name="Projected"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
};

type CandleTooltipProps = TooltipProps<number, string> & { viewMode: ViewMode };

const CandleTooltip = ({ active, payload, viewMode }: CandleTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const candle = payload[0]?.payload as ChartPoint | undefined;
  if (!candle) {
    return null;
  }

  const periodLabel = viewMode === 'hourly' ? 'hour' : 'day';
  const streamedThisPeriod = Math.max(candle.close - candle.open, 0);

  const formatSeconds = (seconds: number) => {
    if (seconds === 0) {
      return '0s';
    }

    const days = Math.floor(seconds / 86_400);
    const hours = Math.floor((seconds % 86_400) / 3_600);
    const minutes = Math.floor((seconds % 3_600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="rounded-md border border-primary/40 bg-background/95 p-3 text-xs shadow-lg">
      <p className="font-semibold">{candle.time}</p>
      <p>Range: {formatSeconds(candle.startSeconds)} → {formatSeconds(candle.endSeconds)}</p>
      <p>Open: {candle.open.toFixed(4)}</p>
      <p>Close: {candle.close.toFixed(4)}</p>
      <p>High: {candle.high.toFixed(4)}</p>
      <p>Low: {candle.low.toFixed(4)}</p>
      <p>{`Streamed this ${periodLabel}: ${streamedThisPeriod.toFixed(4)}`}</p>
      <p>Projected total: {candle.projected.toFixed(4)}</p>
    </div>
  );
};

export default StreamChart;
