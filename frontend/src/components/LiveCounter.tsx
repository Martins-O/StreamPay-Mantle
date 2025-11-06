import { useEffect, useState } from 'react';
import { Stream } from '@/lib/contract';
import { formatTokenAmount } from '@/lib/hooks';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface LiveCounterProps {
  stream: Stream;
}

type DisplayRecord = Record<string, string>;

const LiveCounter = ({ stream }: LiveCounterProps) => {
  const [displayValues, setDisplayValues] = useState<DisplayRecord>({});

  useEffect(() => {
    if (!stream || !stream.isActive || stream.tokens.length === 0) {
      setDisplayValues({});
      return;
    }

    const updateValues = () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const baseTimestamp = stream.isPaused && stream.pauseStart > 0n ? stream.pauseStart : now;
      const elapsed = baseTimestamp > stream.startTime ? baseTimestamp - stream.startTime : 0n;
      const effectiveElapsed = elapsed > stream.pausedDuration ? elapsed - stream.pausedDuration : 0n;
      const totalDuration = stream.duration;

      const nextValues: DisplayRecord = {};

      for (const token of stream.tokens) {
        const decimals = token.tokenDecimals ?? 18;
        const symbol = token.tokenSymbol ?? `${token.token.slice(0, 6)}...${token.token.slice(-4)}`;

        if (!stream.isActive || stream.isPaused || totalDuration === 0n) {
          nextValues[token.token] = `0.000000${symbol ? ` ${symbol}` : ''}`;
          continue;
        }

        const streamed = (token.totalAmount * effectiveElapsed) / totalDuration;
        const claimable = streamed > token.claimedAmount ? streamed - token.claimedAmount : 0n;
        nextValues[token.token] = `${formatTokenAmount(claimable, decimals)}${symbol ? ` ${symbol}` : ''}`;
      }

      setDisplayValues(nextValues);
    };

    updateValues();
    const interval = setInterval(updateValues, 200);

    return () => clearInterval(interval);
  }, [stream]);

  const tokenEntries = stream.tokens.map((token) => {
    const address = token.token;
    const symbol = token.tokenSymbol ?? `${address.slice(0, 6)}...${address.slice(-4)}`;
    const value = displayValues[address] ?? `0.000000${symbol ? ` ${symbol}` : ''}`;
    return { address, symbol, value };
  });

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-primary animate-pulse" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Claimable Right Now</p>
          <p className="text-[11px] text-muted-foreground">Live view updates every 0.2s</p>
        </div>
      </div>

      <div className="space-y-2">
        {tokenEntries.map(({ address, symbol, value }) => (
          <motion.p
            key={address}
            initial={{ opacity: 0.6, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-mono"
          >
            {symbol}: <span className="font-semibold text-primary">{value}</span>
          </motion.p>
        ))}
      </div>
    </div>
  );
};

export default LiveCounter;
