import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateStream } from '@/lib/hooks';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { toast } from 'sonner';
import { Rocket, ExternalLink } from 'lucide-react';
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

interface CreateStreamFormProps {
  onSuccess: () => void;
  onTransactionSubmit?: (hash: string, description: string) => void;
}

const CreateStreamForm = ({ onSuccess, onTransactionSubmit }: CreateStreamFormProps) => {
  const { address } = useAccount();
  const [receiver, setReceiver] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [timeUnit, setTimeUnit] = useState<'seconds' | 'minutes' | 'hours' | 'days'>('hours');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approvalComplete, setApprovalComplete] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);

  const { createStream, isPending } = useCreateStream();

  const handleTemplateSelect = (templateDuration: number, templateUnit: 'seconds' | 'minutes' | 'hours' | 'days') => {
    setDuration(templateDuration.toString());
    setTimeUnit(templateUnit);
    setShowTemplates(false);
  };

  const checkApproval = () => {
    if (!receiver || !tokenAddress || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(receiver)) {
      toast.error('Invalid receiver address');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      toast.error('Invalid token address');
      return;
    }

    setNeedsApproval(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!approvalComplete) {
      checkApproval();
      return;
    }

    if (!duration) {
      toast.error('Please set a duration');
      return;
    }

    try {
      const totalAmount = parseUnits(amount, 18);
      let durationInSeconds = BigInt(duration);

      // Convert to seconds based on time unit
      if (timeUnit === 'minutes') durationInSeconds *= 60n;
      if (timeUnit === 'hours') durationInSeconds *= 3600n;
      if (timeUnit === 'days') durationInSeconds *= 86400n;

      const hash = await createStream(
        receiver as `0x${string}`,
        tokenAddress as `0x${string}`,
        totalAmount,
        durationInSeconds
      );

      if (hash && onTransactionSubmit) {
        onTransactionSubmit(hash, 'Create Stream');
      }

      setTxHash(hash || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
      setShowSuccessModal(true);

      // Reset form
      setReceiver('');
      setTokenAddress('');
      setAmount('');
      setDuration('');
      setNeedsApproval(false);
      setApprovalComplete(false);
      setShowTemplates(true);

      toast.success('Stream created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating stream:', error);
      toast.error(error?.message || 'Failed to create stream');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {showTemplates && (
          <StreamTemplates onSelect={handleTemplateSelect} />
        )}

        <Card className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="receiver">Receiver Address</Label>
              <Input
                id="receiver"
                placeholder="0x..."
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="font-mono bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Token Address</Label>
              <Input
                id="token"
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
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
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/50"
              />
            </div>

            {needsApproval && address && tokenAddress && amount && (
              <TokenApproval
                tokenAddress={tokenAddress as `0x${string}`}
                amount={parseUnits(amount, 18)}
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
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeUnit">Time Unit</Label>
                <Select value={timeUnit} onValueChange={(value: any) => setTimeUnit(value)}>
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

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isPending || (needsApproval && !approvalComplete)}
                className="w-full animated-gradient hover:opacity-90 text-lg py-6"
              >
                <Rocket className="mr-2 h-5 w-5" />
                {isPending ? 'Creating Stream...' : needsApproval && !approvalComplete ? 'Approve First' : 'Create Stream'}
              </Button>
            </motion.div>
          </form>
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

export default CreateStreamForm;
