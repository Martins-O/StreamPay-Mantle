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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStreams } from '@/lib/hooks';
import { registerBusiness, fetchBusinessProfile, fetchRisk, refreshRisk, fetchBackendConfig } from '@/lib/api';
import type { BusinessRegistrationPayload, RiskResponse, BackendConfigResponse } from '@/lib/api';
import { parseUnits, formatUnits } from 'viem';
import { REVENUE_FACTORY_ABI, REVENUE_FACTORY_ADDRESS, ZERO_ADDRESS } from '@/lib/streamYield';
import { MOCK_USDT_ADDRESS } from '@/lib/contract';

const defaultProfile: Omit<BusinessRegistrationPayload, 'address'> = {
  name: '',
  industry: 'SaaS',
  monthlyRevenue: 75_000,
  revenueVolatility: 15,
  contactEmail: ''
};

const INDUSTRIES = [
  'SaaS',
  'Fintech',
  'Retail',
  'Healthcare',
  'Manufacturing',
  'Real Estate',
  'Logistics',
  'Education',
  'Energy'
] as const;

const defaultTokenForm = {
  name: 'Acme ARR 2025',
  symbol: 'ACME25',
  expectedRevenue: '250000',
  tenorDays: 90,
  paymentToken: MOCK_USDT_ADDRESS
};

const heroStats = [
  {
    label: 'AI refresh SLA',
    value: '< 60s',
    caption: 'Deterministic scoring'
  },
  {
    label: 'Signer uptime',
    value: '99.9%',
    caption: 'Pino-monitored keys'
  },
  {
    label: 'Pools connected',
    value: '3',
    caption: 'Mantle testnet'
  }
] as const;

const lifecycle = [
  {
    step: '01',
    title: 'Profile & KYC-lite',
    description: 'Register revenue + volatility metrics so the AI oracle understands your cashflows.'
  },
  {
    step: '02',
    title: 'Refresh risk',
    description: 'Call the FastAPI service, capture rationale, and sign payloads for the oracle adapter.'
  },
  {
    step: '03',
    title: 'Mint + stream',
    description: 'Deploy RevenueTokens, route repayments through StreamEngine, and surface telemetry.'
  }
] as const;

const Business = () => {
  const { address, isConnected } = useAccount();
  const { streams, isLoading: streamsLoading } = useStreams(address);
  const [profile, setProfile] = useState<(BusinessRegistrationPayload & { createdAt: number }) | null>(null);
  const [risk, setRisk] = useState<RiskResponse | null>(null);
  const [profileForm, setProfileForm] = useState(defaultProfile);
  const [tokenForm, setTokenForm] = useState(defaultTokenForm);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [backendConfig, setBackendConfig] = useState<BackendConfigResponse | null>(null);
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const disabledInputClass = !isConnected ? 'opacity-60 cursor-not-allowed' : '';
  const industrySelectValue = INDUSTRIES.includes(profileForm.industry as (typeof INDUSTRIES)[number])
    ? profileForm.industry
    : 'custom';

  useEffect(() => {
    if (!address) {
      setProfile(null);
      setRisk(null);
      return;
    }

    const loadProfile = async () => {
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

    loadProfile();
    loadRisk();
  }, [address]);

  useEffect(() => {
    fetchBackendConfig()
      .then(setBackendConfig)
      .catch(() => setBackendConfig(null));
  }, []);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!address) {
      toast.error('Wallet: Connect before registering a business profile.');
      return;
    }

    try {
      const payload: BusinessRegistrationPayload = {
        address,
        ...profileForm
      };
      const { profile: saved } = await registerBusiness(payload);
      setProfile(saved);
      toast.success('Profile saved and ready for AI underwriting.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Profile: Unable to save details.');
    }
  };

  const handleRefreshRisk = async () => {
    if (!address) {
      toast.error('Wallet: Connect before refreshing risk.');
      return;
    }
    setLoadingRisk(true);
    try {
      const { record } = await refreshRisk(address, {
        monthlyRevenue: profileForm.monthlyRevenue,
        revenueVolatility: profileForm.revenueVolatility
      });
      setRisk(record);
      toast.success('Risk oracle refreshed. Share the update with investors.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Risk: Unable to refresh score.');
    } finally {
      setLoadingRisk(false);
    }
  };

  const handleTokenSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!address) {
      toast.error('Wallet: Connect before creating a RevenueToken.');
      return;
    }
    if (REVENUE_FACTORY_ADDRESS === ZERO_ADDRESS) {
      toast.error('Config: Set VITE_REVENUE_FACTORY_ADDRESS in .env.local to enable token deployment.');
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
      toast.error(err instanceof Error ? err.message : 'Contracts: Failed to create RevenueToken');
    }
  };

  const sortedStreams = useMemo(() => streams.slice(0, 4), [streams]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 space-y-12">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 shadow-lg">
            <Badge variant="secondary" className="uppercase tracking-[0.35em] w-fit">
              Business workspace
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight mt-6">Operate underwriting, minting, and streaming from one pane</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
              Keep the FastAPI risk service, backend signer, and StreamEngine console in sync. Refresh risk, publish rationale,
              and coordinate investor outreach without leaving this dashboard.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button asChild size="lg">
                <Link to="/investor">Open investor cockpit</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/legacy-console">Legacy stream console</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-muted-foreground">
                <Link to="/docs">Docs & checklist</Link>
              </Button>
            </div>
            <div className="grid gap-4 pt-8 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border/40 bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold mt-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.caption}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-7 space-y-6 border-primary/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">AI risk band</p>
                <p className="text-4xl font-semibold">
                  {risk ? risk.band : loadingRisk ? 'Refreshing…' : 'Not scored'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {risk?.lastUpdated
                    ? `Last update ${new Date(risk.lastUpdated * 1000).toLocaleString()}`
                    : 'Request a score to publish telemetry'}
                </p>
              </div>
              <Button onClick={handleRefreshRisk} disabled={!isConnected || loadingRisk}>
                {loadingRisk ? 'Updating…' : 'Refresh score'}
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Score</p>
                <p className="text-3xl font-semibold">{risk ? `${risk.score}/100` : '—'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Signature {risk?.signature ? `${risk.signature.slice(0, 10)}…` : 'pending'}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Nonce & expiry</p>
                <p className="text-sm font-mono">
                  {risk?.payload ? `${risk.payload.nonce.slice(0, 10)}…` : 'Not issued'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Expires {risk?.payload ? new Date(risk.payload.expiry * 1000).toLocaleTimeString() : '—'}
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">AI rationale</p>
              <p className="text-sm text-foreground mt-2 leading-relaxed">
                {risk?.rationale ?? 'Run the oracle to capture a human-readable explanation investors can trust.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link to="/investor">Share with investors</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link to="/legacy-console">Inspect historic scores</Link>
              </Button>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Business profile & KYC-lite</h2>
              <p className="text-sm text-muted-foreground">
                Keep this metadata fresh—every risk refresh relies on it.
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div>
                <Label htmlFor="name">Legal name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  disabled={!isConnected}
                  className={disabledInputClass}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={industrySelectValue}
                  disabled={!isConnected}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setProfileForm((prev) => ({
                        ...prev,
                        industry:
                          prev.industry && !INDUSTRIES.includes(prev.industry as (typeof INDUSTRIES)[number])
                            ? prev.industry
                            : ''
                      }));
                      return;
                    }
                    setProfileForm((prev) => ({ ...prev, industry: value }));
                  }}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Other / custom</SelectItem>
                  </SelectContent>
                </Select>
                {industrySelectValue === 'custom' && (
                  <div className="mt-2 space-y-1">
                    <Label htmlFor="custom-industry" className="text-xs text-muted-foreground">
                      Custom industry
                    </Label>
                    <Input
                      id="custom-industry"
                      placeholder="Enter industry"
                      value={profileForm.industry}
                      disabled={!isConnected}
                      className={disabledInputClass}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, industry: e.target.value }))}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="revenue">Monthly revenue (USD)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={profileForm.monthlyRevenue}
                    disabled={!isConnected}
                    className={disabledInputClass}
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
                    className={disabledInputClass}
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
                  className={disabledInputClass}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                />
              </div>
              <Button type="submit" disabled={!isConnected || loadingProfile} className="w-full">
                {loadingProfile ? 'Saving…' : profile ? 'Sync profile' : 'Register business'}
              </Button>
            </form>
          </Card>

          <Card className="p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Mint RevenueTokens</h2>
              <p className="text-sm text-muted-foreground">
                Deploy tokenized cashflows that investors will stream into YieldPool.
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleTokenSubmit}>
              <div>
                <Label htmlFor="token-name">Token name</Label>
                <Input
                  id="token-name"
                  value={tokenForm.name}
                  onChange={(e) => setTokenForm((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!isConnected}
                  className={disabledInputClass}
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
                    className={disabledInputClass}
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
                    className={disabledInputClass}
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
                  className={disabledInputClass}
                />
              </div>
              <div>
                <Label htmlFor="payment-token">Payment token address</Label>
                <Input
                  id="payment-token"
                  value={tokenForm.paymentToken}
                  onChange={(e) => setTokenForm((prev) => ({ ...prev, paymentToken: e.target.value as `0x${string}` }))}
                  disabled={!isConnected}
                  className={disabledInputClass}
                />
              </div>
              <Button type="submit" disabled={!isConnected || isWriting} className="w-full">
                {isWriting ? 'Submitting transaction…' : 'Launch RevenueToken'}
              </Button>
            </form>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Lifecycle runbook</h2>
              <Badge variant="outline">Always-on</Badge>
            </div>
            <div className="space-y-4">
              {lifecycle.map((stage) => (
                <div key={stage.title} className="flex gap-4">
                  <span className="text-sm font-semibold text-primary">{stage.step}</span>
                  <div>
                    <p className="font-semibold">{stage.title}</p>
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Operations desk</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="rounded-xl border border-border/60 p-4">
                <p className="font-semibold text-foreground">FastAPI risk service</p>
                <p>Status: <span className="text-green-500">healthy</span>. Ensure `uvicorn` runs from `ai-service/.venv`.</p>
                {backendConfig && (
                  <p className="text-xs text-muted-foreground break-all">{backendConfig.aiServiceUrl}</p>
                )}
              </li>
              <li className="rounded-xl border border-border/60 p-4">
                <p className="font-semibold text-foreground">Backend signer</p>
                <p>Environment-driven private key. Rotate credentials via `.env` then restart `start-services.sh`.</p>
                {backendConfig && (
                  <p className="text-xs text-muted-foreground break-all">
                    Risk oracle: {backendConfig.riskOracleAddress || 'not configured'}
                  </p>
                )}
              </li>
              <li className="rounded-xl border border-border/60 p-4">
                <p className="font-semibold text-foreground">Legacy tooling</p>
                <p>Open the legacy console for low-level stream debugging or manual payouts.</p>
                {backendConfig && (
                  <p className="text-xs text-muted-foreground break-all">
                    Pools registry: {backendConfig.poolRegistryPath}
                  </p>
                )}
              </li>
            </ul>
            <Button asChild variant="outline">
              <Link to="/legacy-console">Jump to legacy console</Link>
            </Button>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Live streams powering investors</h2>
              <p className="text-sm text-muted-foreground">A quick snapshot of the latest flows. Use the legacy console for the full ledger.</p>
            </div>
            <Button variant="secondary" asChild>
              <Link to="/legacy-console">Open streaming console</Link>
            </Button>
          </div>
          {streamsLoading ? (
            <div className="grid gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : sortedStreams.length ? (
            <div className="grid gap-4">
              {sortedStreams.map((stream) => {
                const streamId = typeof stream.id === 'string' ? stream.id : stream.id?.toString?.() ?? '—';
                const streamRecipient = (stream as any).receiver ?? (stream as any).recipient ?? '—';
                return (
                  <Card key={streamId} className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Stream ID</p>
                        <p className="font-mono text-sm">{streamId}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Receiver</p>
                        <p className="font-mono text-sm">{streamRecipient}</p>
                      </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Token</p>
                      <p className="text-sm">{stream.tokens[0]?.tokenSymbol ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Flow rate</p>
                      <p className="text-sm font-semibold">
                        {stream.tokens
                          .map((token) => `${formatUnits(token.flowRate, token.tokenDecimals)} ${token.tokenSymbol}`)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              No streams yet. Deploy RevenueTokens and start routing repayments into the YieldPool.
            </Card>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Business;
