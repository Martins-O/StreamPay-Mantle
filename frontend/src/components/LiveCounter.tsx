import { useEffect, useState } from 'react';
import { Stream } from '@/lib/contract';
import { formatTokenAmount } from '@/lib/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface LiveCounterProps {
  stream: Stream;
}

const LiveCounter = ({ stream }: LiveCounterProps) => {
  const [claimableAmount, setClaimableAmount] = useState<bigint>(0n);
  const [displayValue, setDisplayValue] = useState('0.000000');

  useEffect(() => {
    if (!stream || !stream.isActive) {
      setClaimableAmount(0n);
      return;
    }

    const updateClaimable = () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const elapsed = now - stream.startTime;
      const totalDuration = stream.duration;

      if (elapsed >= totalDuration) {
        const finalAmount = stream.totalAmount - stream.claimedAmount;
        setClaimableAmount(finalAmount);
        setDisplayValue(formatTokenAmount(finalAmount, 18));
      } else {
        const streamed = (stream.totalAmount * elapsed) / totalDuration;
        const claimable = streamed > stream.claimedAmount ? streamed - stream.claimedAmount : 0n;
        setClaimableAmount(claimable);
        setDisplayValue(formatTokenAmount(claimable, 18));
      }
    };

    updateClaimable();
    const interval = setInterval(updateClaimable, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [stream]);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
      <div>
        <p className="text-xs text-muted-foreground">Claimable Now</p>
        <motion.p
          key={displayValue}
          initial={{ scale: 1.1, color: 'hsl(171, 100%, 45%)' }}
          animate={{ scale: 1, color: 'hsl(210, 40%, 98%)' }}
          className="text-lg font-bold font-mono"
        >
          {displayValue}
        </motion.p>
      </div>
    </div>
  );
};

export default LiveCounter;
