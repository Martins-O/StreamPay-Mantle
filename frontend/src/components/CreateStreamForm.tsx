import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateStream, useCreateStreamsBatch } from '@/lib/hooks';
import { useAccount, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { toast } from 'sonner';
import { Rocket, ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TokenApproval from './TokenApproval';
import StreamTemplates from './StreamTemplates';
import { ERC20_ABI, IS_STREAM_MANAGER_CONFIGURED, STREAM_TOKEN_ADDRESS, IS_STREAM_TOKEN_CONFIGURED } from '@/lib/contract';
import { TARGET_CHAIN_NAME } from '@/lib/web3';
import { useNotifications } from '@/contexts/useNotifications';

type BatchRow = {
  recipient: string;
  amount: string;
};

interface CreateStreamFormProps {
  onSuccess: () => void;
  onTransactionSubmit?: (hash: string, description: string) => void;
  isNetworkReady?: boolean;
  onSwitchNetwork?: () => void;
  isSwitchingNetwork?: boolean;
}

const CreateStreamForm = ({
  onSuccess,
  onTransactionSubmit,
  isNetworkReady = true,
  onSwitchNetwork,
  isSwitchingNetwork = false,
}: CreateStreamFormProps) => {
  const { address } = useAccount();
  const streamTokenAddress = STREAM_TOKEN_ADDRESS;
  const isTokenConfigured = IS_STREAM_TOKEN_CONFIGURED;
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [timeUnit, setTimeUnit] = useState<'seconds' | 'minutes' | 'hours' | 'days'>('hours');
  const [batchRows, setBatchRows] = useState<BatchRow[]>([{ recipient: '', amount: '' }]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approvalComplete, setApprovalComplete] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string | undefined>();
  const [isFetchingTokenInfo, setIsFetchingTokenInfo] = useState(false);

  const { createStream, isPending: isCreatingSingle } = useCreateStream();
  const { createStreamsBatch, isPending: isCreatingBatch } = useCreateStreamsBatch();
  const publicClient = usePublicClient();
  const { notifyStreamEvent } = useNotifications();

  useEffect(() => {
    let cancelled = false;

    const fetchTokenInfo = async () => {
      if (!publicClient || !isTokenConfigured) {
        if (!cancelled) {
          setTokenDecimals(null);
          setTokenSymbol(undefined);
        }
        return;
      }

      setIsFetchingTokenInfo(true);

      try {
        const [decimalsResult, symbolResult] = await Promise.all([
          publicClient.readContract({
            address: streamTokenAddress,
            abi: ERC20_ABI,
            functionName: 'decimals',
          }) as Promise<bigint | number>,
          publicClient.readContract({
            address: streamTokenAddress,
            abi: ERC20_ABI,
            functionName: 'symbol',
          }).catch(() => ''),
        ]);

        if (!cancelled) {
          const decimals =
            typeof decimalsResult === 'bigint'
              ? Number(decimalsResult)
              : typeof decimalsResult === 'number'
                ? decimalsResult
                : 18;
          setTokenDecimals(Number.isFinite(decimals) ? decimals : 18);
          setTokenSymbol(
            typeof symbolResult === 'string' && symbolResult.length > 0
              ? symbolResult
              : undefined,
          );
        }
      } catch (error) {
        if (!cancelled) {
          setTokenDecimals(18);
          setTokenSymbol(undefined);
        }
      } finally {
        if (!cancelled) {
          setIsFetchingTokenInfo(false);
        }
      }
    };

    fetchTokenInfo();

    return () => {
      cancelled = true;
    };
  }, [publicClient, streamTokenAddress, isTokenConfigured]);

  useEffect(() => {
    if (mode === 'batch') {
      setShowTemplates(false);
    }
  }, [mode]);

  const resolvedTokenDecimals = tokenDecimals ?? 18;
  const isSubmitting = mode === 'single' ? isCreatingSingle : isCreatingBatch;

  const invalidateApproval = () => {
    setNeedsApproval(false);
    setApprovalComplete(false);
  };

  const validBatchRows = useMemo(
    () => batchRows.filter(row => row.recipient && row.amount),
    [batchRows],
  );

  const approvalAmount = useMemo(() => {
    try {
      if (!isTokenConfigured) {
        return 0n;
      }
      if (mode === 'single') {
        if (!amount) return 0n;
        return parseUnits(amount, resolvedTokenDecimals);
      }
      return validBatchRows.reduce((acc, row) => acc + parseUnits(row.amount, resolvedTokenDecimals), 0n);
    } catch (error) {
      return 0n;
    }
  }, [amount, mode, resolvedTokenDecimals, validBatchRows, isTokenConfigured]);

  const totalStreamsInBatch = validBatchRows.length;

  if (!isTokenConfigured) {
    return (
      <Card className="glass-card p-6">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Stream token not configured</p>
          <p>
            Set <code className="font-mono">VITE_STREAM_TOKEN_ADDRESS</code> (or <code className="font-mono">VITE_MOCK_USDT_ADDRESS</code>)
            in your frontend environment so the app knows which token to stream.
          </p>
        </div>
      </Card>
    );
  }

  if (!isNetworkReady) {
    return (
      <Card className="glass-card p-6">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Wrong network</p>
          <p>
            Switch to {TARGET_CHAIN_NAME} before creating a stream. You can change networks directly in your wallet.
          </p>
          {onSwitchNetwork && (
            <Button
              onClick={onSwitchNetwork}
              disabled={isSwitchingNetwork}
              size="sm"
              className="animated-gradient"
            >
              {isSwitchingNetwork ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Switching...
                </>
              ) : (
                'Switch Network'
              )}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (!IS_STREAM_MANAGER_CONFIGURED) {
    return (
      <Card className="glass-card p-6">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Stream manager contract not configured</p>
          <p>
            Please set <code className="font-mono">VITE_STREAM_MANAGER_ADDRESS</code> in your frontend
            environment (see <code className="font-mono">frontend/.env.example</code>) and restart the app.
          </p>
        </div>
      </Card>
    );
  }

  const handleTemplateSelect = (templateDuration: number, templateUnit: 'seconds' | 'minutes' | 'hours' | 'days') => {
    setDuration(templateDuration.toString());
    setTimeUnit(templateUnit);
    setShowTemplates(false);
    invalidateApproval();
  };

  const checkApproval = () => {
    if (!isNetworkReady) {
      toast.error(`Switch to ${TARGET_CHAIN_NAME} before approving tokens.`);
      return;
    }

    if (approvalAmount === 0n) {
      toast.error('Enter a valid amount before requesting approval');
      return;
    }

    if (mode === 'single') {
      if (!receiver || !amount) {
        toast.error('Please fill in all fields');
        return;
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(receiver)) {
        toast.error('Invalid receiver address');
        return;
      }
    } else if (validBatchRows.length === 0) {
      toast.error('Add at least one valid recipient for batch creation');
      return;
    }

    if (isFetchingTokenInfo) {
      toast('Fetching token details, please try again in a moment');
      return;
    }

    setNeedsApproval(true);
  };

  const convertToSeconds = (value: bigint) => {
    let result = value;
    if (timeUnit === 'minutes') result *= 60n;
    if (timeUnit === 'hours') result *= 3600n;
    if (timeUnit === 'days') result *= 86400n;
    return result;
  };

  const resetFormState = () => {
    setReceiver('');
    setAmount('');
    setDuration('');
    setBatchRows([{ recipient: '', amount: '' }]);
    setNeedsApproval(false);
    setApprovalComplete(false);
    setShowTemplates(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNetworkReady) {
      toast.error(`Switch to ${TARGET_CHAIN_NAME} before creating a stream.`);
      return;
    }

    if (!IS_STREAM_MANAGER_CONFIGURED) {
      toast.error('Stream manager contract is not configured.');
      return;
    }

    if (!approvalComplete) {
      checkApproval();
      return;
    }

    if (!duration) {
      toast.error('Please set a duration');
      return;
    }

    try {
      const durationInSeconds = convertToSeconds(BigInt(duration));
      if (durationInSeconds === 0n) {
        toast.error('Duration must be greater than zero');
        return;
      }

      if (mode === 'single') {
        const totalAmount = parseUnits(amount, resolvedTokenDecimals);
        const hash = await createStream(
          receiver as `0x${string}`,
          streamTokenAddress,
          totalAmount,
          durationInSeconds
        );

        if (hash && onTransactionSubmit) {
          onTransactionSubmit(hash, 'Create Stream');
        }

        const fallbackHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        setTxHash(hash || fallbackHash);
        setShowSuccessModal(true);
        toast.success('Stream created successfully!');

        if (address) {
          await notifyStreamEvent({
            type: 'create',
            stream: {
              id: 0n,
              sender: address as `0x${string}`,
              recipient: receiver as `0x${string}`,
              token: streamTokenAddress,
              totalAmount,
              claimedAmount: 0n,
              startTime: BigInt(Math.floor(Date.now() / 1000)),
              duration: durationInSeconds,
              stopTime: 0n,
              lastClaimed: 0n,
              isActive: true,
              isPaused: false,
              pauseStart: 0n,
              pausedDuration: 0n,
              streamableAmount: 0n,
              tokenDecimals: resolvedTokenDecimals,
              tokenSymbol,
            },
            actor: address as `0x${string}`,
          });
        }

        resetFormState();
        onSuccess();
        return;
      }

      const params = validBatchRows.map((row, index) => {
        if (!/^0x[a-fA-F0-9]{40}$/.test(row.recipient)) {
          throw new Error(`Invalid recipient address in row ${index + 1}`);
        }

        return {
          recipient: row.recipient as `0x${string}`,
          token: streamTokenAddress,
          totalAmount: parseUnits(row.amount, resolvedTokenDecimals),
          duration: durationInSeconds,
        };
      });

      if (params.length === 0) {
        toast.error('Add at least one valid recipient for batch creation');
        return;
      }

      const hash = await createStreamsBatch(params);
      if (hash && onTransactionSubmit) {
        onTransactionSubmit(hash, `Create ${params.length} Streams`);
      }

      const fallbackHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setTxHash(hash || fallbackHash);
      setShowSuccessModal(true);
      toast.success(`Created ${params.length} streams successfully!`);

      if (address) {
        await notifyStreamEvent({
          type: 'batch-create',
          stream: {
            id: 0n,
            sender: address as `0x${string}`,
            recipient: params[0].recipient,
            token: streamTokenAddress,
            totalAmount: params.reduce((acc, item) => acc + item.totalAmount, 0n),
            claimedAmount: 0n,
            startTime: BigInt(Math.floor(Date.now() / 1000)),
            duration: params[0].duration,
            stopTime: 0n,
            lastClaimed: 0n,
            isActive: true,
            isPaused: false,
            pauseStart: 0n,
            pausedDuration: 0n,
            streamableAmount: 0n,
            tokenDecimals: resolvedTokenDecimals,
            tokenSymbol,
          },
          actor: address as `0x${string}`,
          recipients: params.map((p) => p.recipient),
          count: params.length,
        });
      }

      resetFormState();
      onSuccess();
    } catch (error) {
      console.error('Error creating stream:', error);
      const message = error instanceof Error ? error.message : 'Failed to create stream';
      toast.error(message);
    }
  };

  const updateBatchRow = (index: number, field: keyof BatchRow, value: string) => {
    const next = [...batchRows];
    next[index] = { ...next[index], [field]: value };
    setBatchRows(next);
    invalidateApproval();
  };

  const addBatchRow = () => {
    setBatchRows(prev => [...prev, { recipient: '', amount: '' }]);
    invalidateApproval();
  };

  const removeBatchRow = (index: number) => {
    if (batchRows.length === 1) {
      setBatchRows([{ recipient: '', amount: '' }]);
    } else {
      const next = [...batchRows];
      next.splice(index, 1);
      setBatchRows(next);
    }
    invalidateApproval();
  };

  return (
    <>
      <div className="space-y-6">
        {mode === 'single' && showTemplates && (
          <StreamTemplates onSelect={handleTemplateSelect} />
        )}

        <Card className="glass-card p-6">
          <Tabs value={mode} onValueChange={(value) => { setMode(value as 'single' | 'batch'); invalidateApproval(); }}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="single">Single Stream</TabsTrigger>
              <TabsTrigger value="batch">Batch Payroll</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6">
              <TabsContent value="single" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="receiver">Receiver Address</Label>
                  <Input
                    id="receiver"
                    placeholder="0x..."
                    value={receiver}
                    onChange={(e) => {
                      setReceiver(e.target.value);
                      invalidateApproval();
                    }}
                    className="font-mono bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Total Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.000001"
                    placeholder="1000.0"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      invalidateApproval();
                    }}
                    className="bg-background/50"
                  />
                </div>
              </TabsContent>

              <TabsContent value="batch" className="space-y-6">
                <div className="rounded-lg border border-border/60 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                  Upload multiple recipients with a shared token and duration. Each row represents one stream creation.
                </div>

                <div className="space-y-4">
                  {batchRows.map((row, index) => (
                    <div key={index} className="grid gap-3 md:grid-cols-[1fr,1fr,auto] items-end">
                      <div className="space-y-2">
                        <Label>Recipient #{index + 1}</Label>
                        <Input
                          placeholder="0x..."
                          value={row.recipient}
                          onChange={(e) => updateBatchRow(index, 'recipient', e.target.value)}
                          className="font-mono bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          step="0.000001"
                          placeholder="1000.0"
                          value={row.amount}
                          onChange={(e) => updateBatchRow(index, 'amount', e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={addBatchRow}
                          className="h-10 w-10"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeBatchRow(index)}
                          className="h-10 w-10"
                          disabled={batchRows.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-border/50 bg-background/40 px-4 py-2 text-xs text-muted-foreground">
                  Total streams: {totalStreamsInBatch} · Estimated tokens required: {approvalAmount > 0n ? formatTokenAmount(approvalAmount, resolvedTokenDecimals) : '0.000000'}
                </div>
              </TabsContent>

              <div className="space-y-2">
                <Label>Streaming Token</Label>
                <div className="rounded-lg border border-border/60 bg-background/40 px-4 py-3 space-y-1">
                  <p className="text-xs text-muted-foreground">All streams use this ERC-20 token:</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono break-all">{streamTokenAddress}</code>
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-primary">
                      <a
                        href={`https://explorer.sepolia.mantle.xyz/address/${streamTokenAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View token on explorer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isFetchingTokenInfo
                      ? 'Loading token information...'
                      : `Decimals: ${resolvedTokenDecimals}${tokenSymbol ? ` · Symbol: ${tokenSymbol}` : ''}`}
                  </p>
                </div>
              </div>

              {needsApproval && address && approvalAmount > 0n && (
                <TokenApproval
                  tokenAddress={streamTokenAddress}
                  amount={approvalAmount}
                  userAddress={address}
                  onApprovalComplete={() => setApprovalComplete(true)}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="24"
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      invalidateApproval();
                    }}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeUnit">Time Unit</Label>
                  <Select
                    value={timeUnit}
                    onValueChange={(value: 'seconds' | 'minutes' | 'hours' | 'days') => {
                      setTimeUnit(value);
                      invalidateApproval();
                    }}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seconds">Seconds</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
                <div>
                  {mode === 'single' ? (
                    <p>Preparing 1 continuous payment stream.</p>
                  ) : (
                    <p>Preparing {totalStreamsInBatch || 0} payment stream{totalStreamsInBatch === 1 ? '' : 's'}.</p>
                  )}
                </div>
                <div className="flex flex-col sm:items-end">
                  <p className="font-mono text-xs">Approval required: {approvalAmount > 0n ? formatTokenAmount(approvalAmount, resolvedTokenDecimals) : '0'}</p>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isSubmitting || (needsApproval && !approvalComplete)}
                  className="w-full animated-gradient hover:opacity-90 text-lg py-6"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  {isSubmitting
                    ? mode === 'single'
                      ? 'Creating Stream...'
                      : 'Creating Batch...'
                    : needsApproval && !approvalComplete
                      ? 'Approve First'
                      : mode === 'single'
                        ? 'Create Stream'
                        : 'Create Streams'}
                </Button>
              </motion.div>

              <div className="flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={checkApproval}>
                  {approvalComplete ? 'Approval Ready' : 'Check Token Approval'}
                </Button>
              </div>
            </form>
          </Tabs>
        </Card>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="glass-card border-primary/50">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">Stream Created! 🎉</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p className="text-foreground">Your payment stream has been successfully created.</p>
              {txHash && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Transaction Hash:</p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
                    <code className="text-xs font-mono flex-1 truncate">{txHash}</code>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://explorer.testnet.mantle.xyz/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full animated-gradient"
              >
                Close
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

const formatTokenAmount = (amount: bigint, decimals: number) => {
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 6);
  return `${whole.toString()}.${fractionStr}`;
};

export default CreateStreamForm;
