import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Stream } from '@/lib/contract';
import { formatTokenAmount } from '@/lib/hooks';

interface StreamChartProps {
  stream: Stream;
}

const StreamChart = ({ stream }: StreamChartProps) => {
  const chartData = useMemo(() => {
    const points = 20;
    const data = [];
    const duration = Number(stream.duration);
    const decimals = stream.tokenDecimals ?? 18;
    const totalAmount = parseFloat(formatTokenAmount(stream.totalAmount, decimals));

    for (let i = 0; i <= points; i++) {
      const progress = (i / points) * duration;
      const amount = (totalAmount * i) / points;

      data.push({
        time: `${Math.floor(progress / 3600)}h`,
        amount: amount.toFixed(2),
        claimed:
          i === points
            ? parseFloat(formatTokenAmount(stream.claimedAmount, decimals)).toFixed(2)
            : 0,
      });
    }

    return data;
  }, [stream]);

  return (
    <Card className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Stream Progress</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
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
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 8%)',
              border: '1px solid hsl(171, 100%, 45% / 0.2)',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="hsl(171, 100%, 45%)"
            strokeWidth={2}
            dot={false}
            name="Streamed"
          />
          <Line
            type="monotone"
            dataKey="claimed"
            stroke="hsl(263, 70%, 60%)"
            strokeWidth={2}
            dot={false}
            name="Claimed"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default StreamChart;
