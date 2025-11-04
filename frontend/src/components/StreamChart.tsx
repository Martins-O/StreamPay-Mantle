import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
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
};

const formatElapsedLabel = (seconds: number) => {
  if (seconds >= 86_400) {
    return `${Math.floor(seconds / 86_400)}d`;
  }
  if (seconds >= 3_600) {
    return `${Math.floor(seconds / 3_600)}h`;
  }
  if (seconds >= 60) {
    return `${Math.floor(seconds / 60)}m`;
  }
  return `${seconds}s`;
};

const StreamChart = ({ stream }: StreamChartProps) => {
  const decimals = stream.tokenDecimals ?? 18;

  const totalAmount = useMemo(
    () => parseFloat(formatTokenAmount(stream.totalAmount, decimals)),
    [stream.totalAmount, decimals],
  );

  const points = useMemo(() => {
    const steps = 30;
    const durationSeconds = Number(stream.duration);
    const segments = Array.from({ length: steps + 1 }, (_, index) => {
      const fraction = steps === 0 ? 0 : index / steps;
      const seconds = Math.round(durationSeconds * fraction);
      return { fraction, seconds };
    });
    return segments;
  }, [stream.duration]);

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
    const { fraction, elapsedSeconds, streamedAmount } = calculateProgress();
    const currentActual = parseFloat(formatTokenAmount(streamedAmount, decimals));

    let previousClose = 0;
    let currentIncluded = false;

    const baseData: ChartPoint[] = points.map(point => {
      const projectedValue = totalAmount * point.fraction;
      const actualFraction = Math.min(point.fraction, fraction);
      const closeValue = totalAmount * actualFraction;
      const openValue = previousClose;

      const highValue = Math.max(projectedValue, closeValue, openValue);
      const lowValue = Math.min(closeValue, openValue);
      const bodyHeight = Math.abs(closeValue - openValue);
      const upperWick = highValue - Math.max(closeValue, openValue);
      const lowerWick = Math.max(closeValue, openValue) - lowValue;

      const isCurrent = !currentIncluded && point.fraction >= fraction;
      if (isCurrent) {
        currentIncluded = true;
      }

      previousClose = closeValue;

      return {
        time: formatElapsedLabel(point.seconds),
        projected: projectedValue,
        open: openValue,
        close: closeValue,
        high: highValue,
        low: lowValue,
        base: Math.min(closeValue, openValue),
        body: bodyHeight,
        wick: [lowerWick, upperWick],
        direction: closeValue >= openValue ? 'up' : 'down',
        isCurrent,
      } satisfies ChartPoint;
    });

    if (!currentIncluded) {
      const projectedValue = totalAmount * fraction;
      const openValue = previousClose;
      const closeValue = currentActual;
      const highValue = Math.max(projectedValue, closeValue, openValue);
      const lowValue = Math.min(closeValue, openValue);
      const bodyHeight = Math.abs(closeValue - openValue);
      const upperWick = highValue - Math.max(closeValue, openValue);
      const lowerWick = Math.max(closeValue, openValue) - lowValue;

      baseData.push({
        time: formatElapsedLabel(elapsedSeconds),
        projected: projectedValue,
        open: openValue,
        close: closeValue,
        high: highValue,
        low: lowValue,
        base: Math.min(closeValue, openValue),
        body: bodyHeight,
        wick: [lowerWick, upperWick],
        direction: closeValue >= openValue ? 'up' : 'down',
        isCurrent: true,
      });
    }

    return baseData;
  }, [calculateProgress, points, totalAmount, decimals]);

  const [chartData, setChartData] = useState<ChartPoint[]>(() => buildChartData());

  useEffect(() => {
    setChartData(buildChartData());
  }, [buildChartData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(buildChartData());
    }, 1000);

    return () => clearInterval(interval);
  }, [buildChartData]);

  return (
    <Card className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Stream Progress</h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
          <XAxis
            dataKey="time"
            stroke="hsl(215, 20%, 65%)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="hsl(215, 20%, 65%)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CandleTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />

          <Bar dataKey="base" stackId="progress" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="body" stackId="progress" barSize={16} radius={[3, 3, 3, 3]}>
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

const CandleTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const candle = payload[0]?.payload as ChartPoint | undefined;
  if (!candle) {
    return null;
  }

  return (
    <div className="rounded-md border border-primary/40 bg-background/95 p-3 text-xs shadow-lg">
      <p className="font-semibold">{candle.time}</p>
      <p>Open: {candle.open.toFixed(4)}</p>
      <p>Close: {candle.close.toFixed(4)}</p>
      <p>High: {candle.high.toFixed(4)}</p>
      <p>Low: {candle.low.toFixed(4)}</p>
      <p>Projected: {candle.projected.toFixed(4)}</p>
    </div>
  );
};

export default StreamChart;
