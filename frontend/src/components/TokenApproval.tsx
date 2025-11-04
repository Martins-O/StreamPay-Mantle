import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useReadContract, useWriteContract } from 'wagmi';
import { STREAM_MANAGER_ADDRESS, ZERO_ADDRESS } from '@/lib/contract';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Extended ERC20 ABI with allowance function
const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface TokenApprovalProps {
  tokenAddress: `0x${string}`;
  amount: bigint;
  userAddress: `0x${string}`;
  onApprovalComplete: () => void;
}

const TokenApproval = ({ tokenAddress, amount, userAddress, onApprovalComplete }: TokenApprovalProps) => {
  const [isApproved, setIsApproved] = useState(false);

  // Check current allowance
  const { data: allowance, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [userAddress, STREAM_MANAGER_ADDRESS],
    query: {
      enabled: STREAM_MANAGER_ADDRESS !== ZERO_ADDRESS,
    },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  useEffect(() => {
    if (allowance !== undefined && amount) {
      const currentAllowance = BigInt(allowance.toString());
      setIsApproved(currentAllowance >= amount);
      if (currentAllowance >= amount) {
        onApprovalComplete();
      }
    }
  }, [allowance, amount, onApprovalComplete]);

  type WriteParams = Parameters<typeof writeContractAsync>[0];

  const handleApprove = async () => {
    try {
      const request: WriteParams = {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [STREAM_MANAGER_ADDRESS, amount],
      };
      await writeContractAsync(request);

      toast.success('Approval submitted');
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Approval failed';
      toast.error(message);
    }
  };

  if (isApproved) {
    return (
      <Card className="glass-card p-4 border-primary/30">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-sm font-semibold">Token Approved</p>
            <p className="text-xs text-muted-foreground">Ready to create stream</p>
          </div>
        </div>
      </Card>
    );
  }

  if (STREAM_MANAGER_ADDRESS === ZERO_ADDRESS) {
    return (
      <Card className="glass-card p-4 border-yellow-500/30 bg-yellow-500/5">
        <p className="text-sm text-muted-foreground">
          Configure <code className="font-mono">VITE_STREAM_MANAGER_ADDRESS</code> before approving tokens.
        </p>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-4 border-yellow-500/30 bg-yellow-500/5">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Approval Required</p>
            <p className="text-xs text-muted-foreground">
              Approve the contract to spend your tokens before creating the stream
            </p>
          </div>
        </div>
        <Button
          onClick={handleApprove}
          disabled={isPending}
          className="w-full animated-gradient"
          size="sm"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Approving...
            </>
          ) : (
            'Approve Tokens'
          )}
        </Button>
      </div>
    </Card>
  );
};

export default TokenApproval;
