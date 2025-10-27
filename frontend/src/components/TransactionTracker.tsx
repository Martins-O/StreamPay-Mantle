import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWaitForTransactionReceipt } from 'wagmi';

interface Transaction {
  hash: `0x${string}`;
  description: string;
  timestamp: number;
}

interface TransactionTrackerProps {
  transactions: Transaction[];
  onRemove: (hash: string) => void;
}

const TransactionTracker = ({ transactions, onRemove }: TransactionTrackerProps) => {
  if (transactions.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {transactions.map((tx) => (
          <TransactionCard
            key={tx.hash}
            transaction={tx}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const TransactionCard = ({
  transaction,
  onRemove,
}: {
  transaction: Transaction;
  onRemove: (hash: string) => void;
}) => {
  const { data: receipt, isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: transaction.hash,
  });

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onRemove(transaction.hash);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, transaction.hash, onRemove]);

  const getIcon = () => {
    if (isSuccess) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (isError) return <AlertCircle className="h-5 w-5 text-destructive" />;
    return <Clock className="h-5 w-5 text-primary animate-pulse" />;
  };

  const getStatus = () => {
    if (isSuccess) return 'Confirmed';
    if (isError) return 'Failed';
    return 'Pending...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
    >
      <Card className="glass-card p-4 min-w-[320px]">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{transaction.description}</p>
            <p className="text-xs text-muted-foreground">{getStatus()}</p>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-xs font-mono bg-background/50 px-2 py-1 rounded truncate">
                {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
              </code>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href={`https://explorer.testnet.mantle.xyz/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(transaction.hash)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default TransactionTracker;
