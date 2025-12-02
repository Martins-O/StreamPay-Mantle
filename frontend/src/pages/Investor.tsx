import { useEffect, useMemo, useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { fetchPools, type PoolResponse } from '@/lib/api';
import { YIELD_POOL_ABI, ZERO_ADDRESS } from '@/lib/streamYield';
import { MOCK_USDT_ADDRESS, ERC20_ABI } from '@/lib/contract';

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

const Investor = () => {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [pools, setPools] = useState<PoolResponse[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState('1000');

  useEffect(() => {
    fetchPools()
      .then((data) => {
        setPools(data);
        if (data.length > 0) {
          setSelectedPoolId(data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load pools', err));
  }, []);

  const selectedPool = useMemo(() => pools.find((pool) => pool.id === selectedPoolId), [pools, selectedPoolId]);

  const handleApprove = async () => {
    if (!selectedPool) {
      toast.error('Select a pool first.');
      return;
    }
    if (!isConnected) {
      toast.error('Connect wallet to approve deposits.');
      return;
    }
    if (MOCK_USDT_ADDRESS === ZERO_ADDRESS) {
      toast.error('Set VITE_MOCK_USDT_ADDRESS to your stablecoin address.');
      return;
    }

    try {
      const value = parseUnits(investAmount || '0', 6);
      await writeContractAsync({
        address: MOCK_USDT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [selectedPool.yieldPool as `0x${string}`, value]
      });
      toast.success('Approval transaction sent.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approval failed');
    }
  };

  const handleDeposit = async () => {
    if (!selectedPool) {
      toast.error('Select a pool first.');
      return;
    }
    if (!isConnected) {
      toast.error('Connect wallet to deposit.');
      return;
    }

    try {
      const value = parseUnits(investAmount || '0', 6);
      await writeContractAsync({
        address: selectedPool.yieldPool as `0x${string}`,
        abi: YIELD_POOL_ABI,
        functionName: 'deposit',
        args: [value]
      });
      toast.success('Deposit transaction submitted.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Deposit failed');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 space-y-10">
        <section className="space-y-4">
          <Badge variant="secondary">Investor cockpit</Badge>
          <h1 className="text-3xl font-semibold">Stream yield into your wallet</h1>
          <p className="text-muted-foreground max-w-3xl">
            Review curated Mantle pools backed by tokenized invoices and AI risk scores. Approve your stablecoin once,
            deposit into YieldPool, and watch yield stream in real time as businesses settle their revenue obligations.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {pools.map((pool) => (
            <Card
              key={pool.id}
              className={`p-5 border ${pool.id === selectedPoolId ? 'border-primary shadow-lg shadow-primary/20' : ''}`}
              onClick={() => setSelectedPoolId(pool.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{pool.name}</p>
                  <p className="text-xs text-muted-foreground">{pool.symbol}</p>
                </div>
                <Badge variant={pool.metrics.risk?.band === 'LOW' ? 'default' : 'outline'}>
                  {pool.metrics.risk?.band ?? 'TBD'}
                </Badge>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>APY target: {(pool.metrics.apy * 100).toFixed(2)}%</p>
                <p>TVL: ${numberFormatter.format(pool.metrics.tvl)}</p>
                <p>Investors: {pool.metrics.investors}</p>
              </div>
              <Progress value={Math.min(100, (pool.metrics.tvl / 1_000_000) * 100)} className="mt-4" />
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Deposit flow</h2>
            {selectedPool ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Pool contract: {selectedPool.yieldPool}</p>
                <p>Revenue token: {selectedPool.revenueToken}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Select a pool to continue.</p>
            )}
            <div>
              <label htmlFor="amount" className="text-sm font-medium">
                Amount (USDC)
              </label>
              <Input
                id="amount"
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                disabled={!isConnected}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleApprove} disabled={!isConnected || isPending} variant="outline">
                Approve USDC
              </Button>
              <Button onClick={handleDeposit} disabled={!isConnected || isPending}>
                Deposit to YieldPool
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Remember to keep some MNT for gas fees on Mantle testnet. Yield accrues continuously and can be withdrawn
              anytime.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Risk telemetry</h2>
            {selectedPool?.metrics.risk ? (
              <div className="space-y-2 text-sm">
                <p>
                  Score: <span className="font-semibold">{selectedPool.metrics.risk.score}/100</span>
                </p>
                <p>Band: {selectedPool.metrics.risk.band}</p>
                <p>
                  On-chain signature:{' '}
                  {selectedPool.metrics.risk.signature?.slice(0, 10) ?? 'Uploaded via backend oracle'}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No risk update yet—request from business dashboard.</p>
            )}
          </Card>
        </section>

        {selectedPool && (
          <section>
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Pool snapshot</h3>
              <div className="grid gap-4 md:grid-cols-3 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Projected APY</p>
                  <p className="text-2xl font-semibold">{(selectedPool.metrics.apy * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilization</p>
                  <p className="text-2xl font-semibold">
                    {numberFormatter.format((selectedPool.metrics.tvl / (selectedPool.metrics.tvl + 50_000)) * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Investors</p>
                  <p className="text-2xl font-semibold">{selectedPool.metrics.investors}</p>
                </div>
              </div>
            </Card>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Investor;
