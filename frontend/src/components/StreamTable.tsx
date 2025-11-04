import { useState } from 'react';
import { Stream } from '@/lib/contract';
import { useClaimStream, useCancelStream, usePauseStream, useResumeStream, formatTokenAmount } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, DollarSign, X, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import LiveCounter from './LiveCounter';
import { TARGET_CHAIN_NAME } from '@/lib/web3';
import { useNotifications } from '@/contexts/useNotifications';

interface StreamTableProps {
  streams: Stream[];
  userAddress: `0x${string}`;
  onRefetch: () => void;
  showHistory?: boolean;
  onTransactionSubmit?: (hash: string, description: string) => void;
  isNetworkReady?: boolean;
}

const StreamTable = ({
  streams,
  userAddress,
  onRefetch,
  showHistory = false,
  onTransactionSubmit,
  isNetworkReady = true,
}: StreamTableProps) => {
  const { claimStream, isPending: isClaiming } = useClaimStream();
  const { cancelStream, isPending: isCancelling } = useCancelStream();
  const { pauseStream, isPending: isPausing } = usePauseStream();
  const { resumeStream, isPending: isResuming } = useResumeStream();
  const [selectedStreamId, setSelectedStreamId] = useState<bigint | null>(null);
  const [selectedStreams, setSelectedStreams] = useState<Set<bigint>>(new Set());
  const { notifyStreamEvent } = useNotifications();

  const displayStreams = showHistory ? streams.filter(s => !s.isActive) : streams.filter(s => s.isActive);

  const toggleStreamSelection = (streamId: bigint) => {
    const newSelected = new Set(selectedStreams);
    if (newSelected.has(streamId)) {
      newSelected.delete(streamId);
    } else {
      newSelected.add(streamId);
    }
    setSelectedStreams(newSelected);
  };

  const guardNetwork = () => {
    if (!isNetworkReady) {
      toast.error(`Switch to ${TARGET_CHAIN_NAME} to manage streams.`);
      return false;
    }
    return true;
  };

  const handleClaim = async (streamId: bigint) => {
    if (!guardNetwork()) {
      return;
    }
    const target = streams.find(s => s.id === streamId);
    if (target?.isPaused) {
      toast.info('This stream is currently paused. Resume it to continue accruing.');
      return;
    }
    setSelectedStreamId(streamId);
    try {
      const hash = await claimStream(streamId);
      if (hash && onTransactionSubmit) {
        onTransactionSubmit(hash, `Claim Stream #${streamId}`);
      }
      toast.success('Claim transaction submitted');
      setTimeout(() => onRefetch(), 2000);
      if (target) {
        await notifyStreamEvent({
          type: 'claim',
          stream: target,
          actor: userAddress,
          recipients: [target.sender],
        });
      }
    } catch (error) {
      toast.error('Failed to claim stream');
    } finally {
      setSelectedStreamId(null);
    }
  };

  const handleCancel = async (streamId: bigint) => {
    if (!guardNetwork()) {
      return;
    }
    const target = streams.find(s => s.id === streamId);
    setSelectedStreamId(streamId);
    try {
      const hash = await cancelStream(streamId);
      if (hash && onTransactionSubmit) {
        onTransactionSubmit(hash, `Cancel Stream #${streamId}`);
      }
      toast.success('Cancel transaction submitted');
      setTimeout(() => onRefetch(), 2000);
      if (target) {
        await notifyStreamEvent({
          type: 'cancel',
          stream: target,
          actor: userAddress,
          recipients: [target.recipient],
        });
      }
    } catch (error) {
      toast.error('Failed to cancel stream');
    } finally {
      setSelectedStreamId(null);
    }
  };

  const handleBatchClaim = async () => {
    if (!guardNetwork()) {
      return;
    }
    const claimableStreams = Array.from(selectedStreams).filter(id => {
      const stream = streams.find(s => s.id === id);
      return (
        stream &&
        stream.recipient.toLowerCase() === userAddress.toLowerCase() &&
        stream.isActive &&
        !stream.isPaused
      );
    });

    for (const streamId of claimableStreams) {
      await handleClaim(streamId);
    }
    setSelectedStreams(new Set());
  };

  const handleBatchCancel = async () => {
    if (!guardNetwork()) {
      return;
    }
    const cancellableStreams = Array.from(selectedStreams).filter(id => {
      const stream = streams.find(s => s.id === id);
      return stream && stream.sender.toLowerCase() === userAddress.toLowerCase() && stream.isActive;
    });

    for (const streamId of cancellableStreams) {
      await handleCancel(streamId);
    }
    setSelectedStreams(new Set());
  };

  const handlePause = async (streamId: bigint) => {
    if (!guardNetwork()) {
      return;
    }
    const target = streams.find(s => s.id === streamId);
    setSelectedStreamId(streamId);
    try {
      const hash = await pauseStream(streamId);
      if (hash && onTransactionSubmit) {
        onTransactionSubmit(hash, `Pause Stream #${streamId}`);
      }
      toast.success('Stream paused');
      setTimeout(() => onRefetch(), 2000);
      if (target) {
        await notifyStreamEvent({
          type: 'pause',
          stream: target,
          actor: userAddress,
          recipients: [target.recipient],
        });
      }
    } catch (error) {
      toast.error('Failed to pause stream');
    } finally {
      setSelectedStreamId(null);
    }
  };

  const handleResume = async (streamId: bigint) => {
    if (!guardNetwork()) {
      return;
    }
    const target = streams.find(s => s.id === streamId);
    setSelectedStreamId(streamId);
    try {
      const hash = await resumeStream(streamId);
      if (hash && onTransactionSubmit) {
        onTransactionSubmit(hash, `Resume Stream #${streamId}`);
      }
      toast.success('Stream resumed');
      setTimeout(() => onRefetch(), 2000);
      if (target) {
        await notifyStreamEvent({
          type: 'resume',
          stream: target,
          actor: userAddress,
          recipients: [target.recipient],
        });
      }
    } catch (error) {
      toast.error('Failed to resume stream');
    } finally {
      setSelectedStreamId(null);
    }
  };

  const calculateProgress = (stream: Stream) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const reference = stream.isPaused && stream.pauseStart > 0n ? stream.pauseStart : now;
    const elapsed = reference > stream.startTime ? reference - stream.startTime : 0n;
    const pausedOffset = stream.pausedDuration;
    const effectiveElapsed = elapsed > pausedOffset ? elapsed - pausedOffset : 0n;
    const progress = Number((effectiveElapsed * 100n) / stream.duration);
    return Math.min(progress, 100);
  };

  if (displayStreams.length === 0) {
    return (
      <Card className="glass-card p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">
            {showHistory ? 'No completed streams' : 'No active streams yet'}
          </h3>
          <p className="text-muted-foreground">
            {showHistory ? 'Your stream history will appear here' : 'Create your first payment stream to get started'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {selectedStreams.size > 0 && (
        <Card className="glass-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedStreams.size} stream{selectedStreams.size > 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleBatchClaim}
                size="sm"
                className="animated-gradient"
                disabled={!isNetworkReady || isClaiming}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Claim All
              </Button>
              <Button
                onClick={handleBatchCancel}
                size="sm"
                variant="destructive"
                disabled={!isNetworkReady || isCancelling}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel All
              </Button>
            </div>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {displayStreams.map((stream, index) => {
          const isReceiver = stream.recipient.toLowerCase() === userAddress.toLowerCase();
          const isSender = stream.sender.toLowerCase() === userAddress.toLowerCase();
          const remaining = stream.totalAmount - stream.claimedAmount;
          const progress = calculateProgress(stream);
          const isSelected = selectedStreams.has(stream.id);
          const tokenDecimals = stream.tokenDecimals ?? 18;
          const tokenSymbol = stream.tokenSymbol ?? '';
          const statusLabel = stream.isActive ? (stream.isPaused ? 'Paused' : 'Active') : 'Ended';
          const statusIndicator = !stream.isActive
            ? 'bg-muted'
            : stream.isPaused
              ? 'bg-yellow-400'
              : 'bg-primary animate-pulse';

          return (
            <motion.div
              key={stream.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-card p-6 hover:glow-cyan transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {!showHistory && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleStreamSelection(stream.id)}
                        className="mt-4"
                      />
                    )}
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-mono text-sm">
                            #{stream.id.toString()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {isReceiver ? 'From' : 'To'}
                          </p>
                          <p className="font-mono text-sm">
                            {isReceiver
                              ? `${stream.sender.slice(0, 6)}...${stream.sender.slice(-4)}`
                              : `${stream.recipient.slice(0, 6)}...${stream.recipient.slice(-4)}`}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Rate/sec</p>
                          <p className="font-semibold">
                            {formatTokenAmount(stream.totalAmount / stream.duration, tokenDecimals)}
                            {tokenSymbol ? ` ${tokenSymbol}` : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Claimed</p>
                          <p className="font-semibold text-primary">
                            {formatTokenAmount(stream.claimedAmount, tokenDecimals)}
                            {tokenSymbol ? ` ${tokenSymbol}` : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Remaining</p>
                          <p className="font-semibold">
                            {formatTokenAmount(remaining, tokenDecimals)}
                            {tokenSymbol ? ` ${tokenSymbol}` : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${statusIndicator}`} />
                            <p className="font-semibold">{statusLabel}</p>
                          </div>
                        </div>
                      </div>

                      {!showHistory && (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {stream.isActive && !stream.isPaused && isReceiver && (
                            <LiveCounter stream={stream} />
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:w-48">
                    {!showHistory && isReceiver && stream.isActive && (
                      <Button
                        onClick={() => handleClaim(stream.id)}
                        disabled={
                          !isNetworkReady ||
                          stream.isPaused ||
                          (isClaiming && selectedStreamId === stream.id)
                        }
                        className="animated-gradient hover:opacity-90"
                        size="sm"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        {stream.isPaused
                          ? 'Paused'
                          : isClaiming && selectedStreamId === stream.id
                            ? 'Claiming...'
                            : 'Claim'}
                      </Button>
                    )}
                    {!showHistory && isSender && stream.isActive && (
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleCancel(stream.id)}
                          disabled={!isNetworkReady || (isCancelling && selectedStreamId === stream.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <X className="mr-2 h-4 w-4" />
                          {isCancelling && selectedStreamId === stream.id ? 'Cancelling...' : 'Cancel'}
                        </Button>
                        <Button
                          onClick={() => (stream.isPaused ? handleResume(stream.id) : handlePause(stream.id))}
                          disabled={
                            !isNetworkReady ||
                            (stream.isPaused
                              ? isResuming && selectedStreamId === stream.id
                              : isPausing && selectedStreamId === stream.id)
                          }
                          variant={stream.isPaused ? 'default' : 'secondary'}
                          size="sm"
                        >
                          {stream.isPaused ? (
                            <Play className="mr-2 h-4 w-4" />
                          ) : (
                            <Pause className="mr-2 h-4 w-4" />
                          )}
                          {stream.isPaused
                            ? isResuming && selectedStreamId === stream.id
                              ? 'Resuming...'
                              : 'Resume'
                            : isPausing && selectedStreamId === stream.id
                              ? 'Pausing...'
                              : 'Pause'}
                        </Button>
                      </div>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://explorer.testnet.mantle.xyz/address/${stream.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Explorer
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default StreamTable;
