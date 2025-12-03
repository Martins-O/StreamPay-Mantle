import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const diligenceChecklist = [
  'Confirm backend signer log shows latest rationale + signature.',
  'Verify pool registry entry matches Mantle deployment addresses.',
  'Ask business workspace for renewed risk before large deposits.',
];

const Investor = () => {
  const { isConnected } = useAccount();
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

  const totalTVL = useMemo(() => pools.reduce((sum, pool) => sum + pool.metrics.tvl, 0), [pools]);
  const lowRiskPools = useMemo(() => pools.filter((pool) => pool.metrics.risk?.band === 'LOW').length, [pools]);
  const heroHighlights = [
    { label: 'Live pools', value: pools.length || '—', caption: 'Curated from business workspace' },
    { label: 'TVL tracked', value: currencyFormatter.format(totalTVL), caption: 'Off-chain mirror' },
    { label: 'LOW risk signal', value: lowRiskPools || '0', caption: 'AI certified pools' },
  ];

  const handleApprove = async () => {
    if (!selectedPool) {
      toast.error('Pool: Select a pool first.');
      return;
    }
    if (!isConnected) {
      toast.error('Wallet: Connect before approving deposits.');
      return;
    }
    if (MOCK_USDT_ADDRESS === ZERO_ADDRESS) {
      toast.error('Config: Set VITE_MOCK_USDT_ADDRESS to your stablecoin address.');
      return;
    }

    try {
      const value = parseUnits(investAmount || '0', 6);
      await writeContractAsync({
        address: MOCK_USDT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [selectedPool.yieldPool as `0x${string}`, value],
      });
      toast.success('Approval sent. Deposit once the transaction confirms.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Contracts: Approval failed');
    }
  };

  const handleDeposit = async () => {
    if (!selectedPool) {
      toast.error('Pool: Select a pool first.');
      return;
    }
    if (!isConnected) {
      toast.error('Wallet: Connect before depositing.');
      return;
    }

    try {
      const value = parseUnits(investAmount || '0', 6);
      await writeContractAsync({
        address: selectedPool.yieldPool as `0x${string}`,
        abi: YIELD_POOL_ABI,
        functionName: 'deposit',
        args: [value],
      });
      toast.success('Deposit transaction submitted. Watch stream yield accrue.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Contracts: Deposit failed');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 space-y-12">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 shadow-lg">
            <Badge variant="secondary" className="uppercase tracking-[0.35em] w-fit">
              Investor cockpit
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight mt-6">Stream yield the moment Mantle businesses settle revenue</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
              Review AI-backed diligence, approve stablecoins once, and deposit into Mantle-native YieldPools. Risk telemetry is sourced directly from the business workspace to keep LPs informed.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button asChild size="lg">
                <Link to="/business">Request new risk update</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/legacy-console">Inspect legacy console</Link>
              </Button>
            </div>
            <div className="grid gap-4 pt-8 sm:grid-cols-3">
              {heroHighlights.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border/40 bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold mt-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.caption}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-7 space-y-4 border-primary/30">
            <h2 className="text-xl font-semibold">Due diligence reminders</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {diligenceChecklist.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Need context?</p>
              <p className="text-sm text-foreground mt-2">
                The business workspace exposes every signed payload plus rationale. Ping the operator if a pool looks stale before allocating.
              </p>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {pools.map((pool) => {
            const isSelected = pool.id === selectedPoolId;
            const band = pool.metrics.risk?.band;
            return (
              <Card
                key={pool.id}
                className={`p-5 transition-all cursor-pointer ${
                  isSelected ? 'border-primary shadow-lg shadow-primary/20' : 'border-border/70'
                }`}
                onClick={() => setSelectedPoolId(pool.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{pool.name}</p>
                    <p className="text-xs text-muted-foreground">{pool.symbol}</p>
                  </div>
                  <Badge variant={band === 'LOW' ? 'default' : 'outline'}>{band ?? 'TBD'}</Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>APY target: {(pool.metrics.apy * 100).toFixed(2)}%</p>
                  <p>TVL: {currencyFormatter.format(pool.metrics.tvl)}</p>
                  <p>Investors: {pool.metrics.investors}</p>
                </div>
                <Progress value={Math.min(100, (pool.metrics.tvl / 1_000_000) * 100)} className="mt-4" />
              </Card>
            );
          })}
          {pools.length === 0 && (
            <Card className="p-6 text-muted-foreground">No pools published yet. Ask the business workspace to mint RevenueTokens.</Card>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Deposit flow</h2>
                <p className="text-sm text-muted-foreground">Approve once, then supply USDC into the selected YieldPool.</p>
              </div>
              <Badge variant="outline">Mantle</Badge>
            </div>
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
                className={!isConnected ? 'opacity-60 cursor-not-allowed' : ''}
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
              Keep some MNT for gas fees on Mantle testnet. Yield accrues continuously and can be withdrawn anytime.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Risk telemetry</h2>
            {selectedPool?.metrics.risk ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <p>
                    Score: <span className="font-semibold">{selectedPool.metrics.risk.score}/100</span>
                  </p>
                  <Badge variant="outline">{selectedPool.metrics.risk.band}</Badge>
                </div>
                <p>Signature: {selectedPool.metrics.risk.signature?.slice(0, 10) ?? 'Uploaded via backend oracle'}</p>
                <p>Rationale: {selectedPool.metrics.risk.rationale ?? 'Waiting for latest AI update'}</p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/business">Ask issuer for update</Link>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No risk update yet—use the business workspace to trigger one.</p>
            )}
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Pool snapshot</h2>
              <p className="text-sm text-muted-foreground">Compare projected APY, utilization, and investor count for the selected pool.</p>
            </div>
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link to="/legacy-console">Open historical analytics</Link>
            </Button>
          </div>
          {selectedPool ? (
            <Card className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
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
          ) : (
            <Card className="p-6 text-muted-foreground">Select a pool to view its metrics.</Card>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Investor;
