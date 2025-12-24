import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TransactionStatusProps {
  hash?: `0x${string}`;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  explorerUrl?: string;
}

export const TransactionStatus = ({
  hash,
  onSuccess,
  onError,
  successMessage = 'Transaction successful!',
  errorMessage = 'Transaction failed',
  explorerUrl = 'https://explorer.testnet.mantle.xyz/tx',
}: TransactionStatusProps) => {
  const [dismissed, setDismissed] = useState(false);

  const { data: receipt, isError, isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  useEffect(() => {
    if (isError && onError) {
      onError(new Error('Transaction failed'));
    }
  }, [isError, onError]);

  if (!hash || dismissed) {
    return null;
  }

  const txUrl = `${explorerUrl}/${hash}`;

  return (
    <Card className="fixed bottom-4 right-4 max-w-md p-4 shadow-lg z-50 border-primary/30">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {isSuccess && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {isError && <XCircle className="h-5 w-5 text-destructive" />}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">
              {isLoading && 'Transaction pending...'}
              {isSuccess && successMessage}
              {isError && errorMessage}
            </p>
            <Badge variant={isSuccess ? 'default' : isError ? 'destructive' : 'outline'} className="text-xs">
              {isLoading && 'Pending'}
              {isSuccess && 'Success'}
              {isError && 'Failed'}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground font-mono truncate">
            {hash.slice(0, 10)}...{hash.slice(-8)}
          </p>

          {isSuccess && receipt && (
            <p className="text-xs text-muted-foreground">
              Block: {receipt.blockNumber.toString()}
            </p>
          )}

          <div className="flex gap-2 mt-2">
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              asChild
            >
              <a href={txUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                View on Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs ml-auto"
              onClick={() => setDismissed(true)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TransactionStatus;
