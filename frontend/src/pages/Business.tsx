import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useWriteContract } from 'wagmi';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStreams } from '@/lib/hooks';
import { registerBusiness, fetchBusinessProfile, fetchRisk, refreshRisk } from '@/lib/api';
import type { BusinessRegistrationPayload, RiskResponse } from '@/lib/api';
import { parseUnits, formatUnits } from 'viem';
import { REVENUE_FACTORY_ABI, REVENUE_FACTORY_ADDRESS, ZERO_ADDRESS } from '@/lib/streamYield';
import { MOCK_USDT_ADDRESS } from '@/lib/contract';

const defaultProfile: Omit<BusinessRegistrationPayload, 'address'> = {
  name: '',
  industry: '',
  monthlyRevenue: 75000,
  revenueVolatility: 15,
  contactEmail: ''
};

const defaultTokenForm = {
  name: 'Acme ARR 2025',
  symbol: 'ACME25',
  expectedRevenue: '250000',
  tenorDays: 90,
  paymentToken: MOCK_USDT_ADDRESS
};

const Business = () => {
  const { address, isConnected } = useAccount();
  const { streams, isLoading: streamsLoading } = useStreams(address);
  const [profile, setProfile] = useState<(BusinessRegistrationPayload & { createdAt: number }) | null>(null);
  const [risk, setRisk] = useState<RiskResponse | null>(null);
  const [profileForm, setProfileForm] = useState(defaultProfile);
  const [tokenForm, setTokenForm] = useState(defaultTokenForm);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  useEffect(() => {
    if (!address) {
      setProfile(null);
      setRisk(null);
      return;
    }
    const load = async () => {
      setLoadingProfile(true);
      try {
        const result = await fetchBusinessProfile(address);
        setProfile(result);
        setProfileForm({
          name: result.name,
          industry: result.industry,
          monthlyRevenue: result.monthlyRevenue,
          revenueVolatility: result.revenueVolatility,
          contactEmail: result.contactEmail
        });
      } catch (err) {
        console.warn('No profile yet', err);
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    const loadRisk = async () => {
      setLoadingRisk(true);
      try {
        const result = await fetchRisk(address);
        setRisk(result);
      } catch (err) {
        setRisk(null);
      } finally {
        setLoadingRisk(false);
      }
    };

    load();
    loadRisk();
  }, [address]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!address) {
      toast.error('Connect your wallet to register a business profile.');
      return;
    }

    try {
      const payload: BusinessRegistrationPayload = {
        address,
        ...profileForm
      };
      const { profile: saved } = await registerBusiness(payload);
      setProfile(saved);
      toast.success('Business profile saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save profile');
    }
  };

  const handleRefreshRisk = async () => {
    if (!address) {
      toast.error('Connect wallet first');
      return;
    }
    setLoadingRisk(true);
    try {
      const { record } = await refreshRisk(address, {
        monthlyRevenue: profileForm.monthlyRevenue,
        revenueVolatility: profileForm.revenueVolatility
      });
      setRisk(record);
      toast.success('Risk model refreshed via AI oracle.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Risk refresh failed');
    } finally {
      setLoadingRisk(false);
    }
  };

  const handleTokenSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!address) {
      toast.error('Connect wallet to deploy revenue tokens.');
      return;
    }
    if (REVENUE_FACTORY_ADDRESS === ZERO_ADDRESS) {
      toast.error('Set VITE_REVENUE_FACTORY_ADDRESS in .env.local to enable token deployment.');
      return;
    }

    try {
      const expectedRevenue = parseUnits(tokenForm.expectedRevenue || '0', 6);
      await writeContractAsync({
        address: REVENUE_FACTORY_ADDRESS,
        abi: REVENUE_FACTORY_ABI,
        functionName: 'createRevenueToken',
        args: [
          {
            name: tokenForm.name,
            symbol: tokenForm.symbol,
            expectedRevenue,
            tenor: BigInt(tokenForm.tenorDays * 24 * 60 * 60),
            paymentToken: tokenForm.paymentToken
          }
        ]
      });
      toast.success('RevenueToken transaction submitted. Confirm in your wallet.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create RevenueToken');
    }
  };

  const sortedStreams = useMemo(() => streams.slice(0, 4), [streams]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 space-y-12">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
          <Card className="p-8 space-y-6">
            <div className="space-y-2">
              <Badge className="w-fit" variant="outline">
                Mantle StreamYield
              </Badge>
              <h1 className="text-3xl font-semibold">Business Control Center</h1>
              <p className="text-muted-foreground">
                Tokenize invoices, stream revenue into Mantle pools, and share AI-backed risk credentials with investors
                in minutes.
              </p>
            </div>
            <ul className="grid gap-3 md:grid-cols-2 text-sm text-muted-foreground">
              <li className="rounded-lg border border-border/60 p-4">
                <p className="text-lg font-semibold text-foreground">1. Register profile</p>
                Submit your off-chain metadata for the AI oracle.
              </li>
              <li className="rounded-lg border border-border/60 p-4">
                <p className="text-lg font-semibold text-foreground">2. Mint RevenueTokens</p>
                Deploy ERC-20 claims on projected cashflow.
              </li>
              <li className="rounded-lg border border-border/60 p-4">
                <p className="text-lg font-semibold text-foreground">3. Stream into YieldPool</p>
                Route flows to StreamEngine / YieldPool for investors.
              </li>
              <li className="rounded-lg border border-border/60 p-4">
                <p className="text-lg font-semibold text-foreground">4. Share live risk</p>
                Push signed scores on-chain through RiskOracleAdapter.
              </li>
            </ul>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Risk Band</p>
                <p className="text-3xl font-semibold">
                  {risk ? risk.band : loadingRisk ? 'Loading…' : 'Not scored'}
                </p>
              </div>
              <Button onClick={handleRefreshRisk} disabled={!isConnected || loadingRisk}>
                {loadingRisk ? 'Updating…' : 'Refresh score'}
              </Button>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Score: {risk ? `${risk.score}/100` : '—'}</p>
              <p>
                Last updated:{' '}
                {risk?.lastUpdated
                  ? new Date(risk.lastUpdated * 1000).toLocaleString()
                  : 'Not yet published'}
              </p>
              <p>Signature: {risk?.signature ? `${risk.signature.slice(0, 10)}…` : '—'}</p>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Business profile & KYC-lite</h2>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div>
                <Label htmlFor="name">Legal name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  disabled={!isConnected}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={profileForm.industry}
                  disabled={!isConnected}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, industry: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="revenue">Monthly revenue (USD)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={profileForm.monthlyRevenue}
                    disabled={!isConnected}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, monthlyRevenue: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="volatility">Revenue volatility %</Label>
                  <Input
                    id="volatility"
                    type="number"
                    value={profileForm.revenueVolatility}
                    disabled={!isConnected}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, revenueVolatility: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Contact email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.contactEmail}
                  disabled={!isConnected}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                />
              </div>
              <Button type="submit" disabled={!isConnected || loadingProfile} className="w-full">
                {loadingProfile ? 'Saving…' : profile ? 'Update profile' : 'Register business'}
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Mint RevenueToken</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Deploy a tokenized revenue tranche connected to your Mantle streams. Investors will deposit stablecoins into
              the linked YieldPool to earn streamed cash flows.
            </p>
            <form className="space-y-4" onSubmit={handleTokenSubmit}>
              <div>
                <Label htmlFor="token-name">Token name</Label>
                <Input
                  id="token-name"
                  value={tokenForm.name}
                  onChange={(e) => setTokenForm((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!isConnected}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="token-symbol">Symbol</Label>
                  <Input
                    id="token-symbol"
                    value={tokenForm.symbol}
                    onChange={(e) => setTokenForm((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    disabled={!isConnected}
                  />
                </div>
                <div>
                  <Label htmlFor="tenor">Tenor (days)</Label>
                  <Input
                    id="tenor"
                    type="number"
                    value={tokenForm.tenorDays}
                    onChange={(e) => setTokenForm((prev) => ({ ...prev, tenorDays: Number(e.target.value) }))}
                    disabled={!isConnected}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="expected">Expected revenue (USD)</Label>
                <Input
                  id="expected"
                  type="number"
                  value={tokenForm.expectedRevenue}
                  onChange={(e) => setTokenForm((prev) => ({ ...prev, expectedRevenue: e.target.value }))}
                  disabled={!isConnected}
                />
              </div>
              <div>
                <Label htmlFor="payment-token">Payment token address</Label>
                <Input
                  id="payment-token"
                  value={tokenForm.paymentToken}
                  onChange={(e) => setTokenForm((prev) => ({ ...prev, paymentToken: e.target.value as `0x${string}` }))}
                  disabled={!isConnected}
                />
              </div>
              <Button type="submit" disabled={!isConnected || isWriting} className="w-full">
                {isWriting ? 'Submitting transaction…' : 'Launch RevenueToken'}
              </Button>
            </form>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active streams powering your YieldPool</h2>
            <Button variant="secondary" asChild>
              <Link to="/dashboard">Open streaming console</Link>
            </Button>
          </div>
          {streamsLoading ? (
            <div className="grid gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : sortedStreams.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">No streams yet. Deploy from the streaming console.</Card>
          ) : (
            <div className="grid gap-4">
              {sortedStreams.map((stream) => {
                const durationDays = Math.max(1, Math.round(Number(stream.duration) / 86_400));
                return (
                  <Card key={stream.id.toString()} className="p-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">Recipient: {stream.recipient}</p>
                      <p className="text-sm text-muted-foreground">Duration: {durationDays} days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Tokens</p>
                      <ul className="text-sm">
                        {stream.tokens.map((token) => (
                        <li key={token.token}>
                          {token.tokenSymbol ?? token.token.slice(0, 6)} —
                          {' '}
                          {formatUnits(token.totalAmount, token.tokenDecimals ?? 18)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Business;
