import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ShieldCheck, Wallet, Workflow, Cpu, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const steps = [
  {
    title: 'Register profile',
    description: 'Submit business metadata so the AI oracle can underwrite your cashflows.',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'Refresh AI risk',
    description: 'One click fetches a deterministic score, rationale, and signed payload.',
    icon: <Cpu className="h-5 w-5" />,
  },
  {
    title: 'Stream + invest',
    description: 'Route revenue to the YieldPool while investors deposit stablecoins.',
    icon: <Workflow className="h-5 w-5" />,
  },
];

const personas = [
  {
    title: 'For businesses',
    description:
      'Tokenize subscriptions or invoices in minutes. Refresh risk credentials, mint RevenueTokens, and pipe repayments into Mantle pools.',
    cta: 'Open Business control center',
    to: '/business',
    icon: <ShieldCheck className="h-5 w-5 text-primary" />,
  },
  {
    title: 'For investors',
    description:
      'Browse curated pools with real-time AI telemetry. Approve stablecoins, deposit into YieldPool, and monitor signed risk updates.',
    cta: 'Explore investor cockpit',
    to: '/investor',
    icon: <Wallet className="h-5 w-5 text-primary" />,
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 space-y-16">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="uppercase tracking-[0.35em]">Unified dashboard</Badge>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
              Operate Mantle StreamYield from one place
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Move between off-chain underwriting, pool operations, and investor outreach without context switching. StreamYield
              keeps the AI service, backend signer, and frontend UIs in sync so your team focuses on growth instead of glue code.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/business">
                  Business workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/investor">Investor cockpit</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link to="/legacy-console" className="text-muted-foreground">
                  Legacy stream console
                </Link>
              </Button>
            </div>
          </div>

          <Card className="p-6 bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live telemetry</p>
                <p className="text-3xl font-semibold">AI + Yield stats</p>
              </div>
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-xl border border-border/50 p-4 bg-background/80">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Risk signed</p>
                <p className="text-2xl font-semibold">LOW band • 84/100</p>
                <p className="text-muted-foreground">Payload ready to push on-chain.</p>
              </div>
              <div className="rounded-xl border border-border/50 p-4 bg-background/80">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Pool TVL</p>
                <p className="text-2xl font-semibold">$1.2M streaming</p>
                <p className="text-muted-foreground">Yield accrues the moment revenue flows in.</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title} className="p-5 border-border/70 bg-card/80">
              <div className="flex items-center gap-3 text-primary">
                {step.icon}
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {personas.map((persona) => (
            <Card key={persona.title} className="p-6 flex flex-col justify-between border-border/60">
              <div className="space-y-3">
                <Badge variant="secondary" className="w-fit flex items-center gap-2">
                  {persona.icon}
                  {persona.title}
                </Badge>
                <p className="text-muted-foreground leading-relaxed">{persona.description}</p>
              </div>
              <Button asChild className="mt-6">
                <Link to={persona.to}>
                  {persona.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border border-dashed border-primary/40 p-6 text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Need the old tooling?</p>
          <h3 className="text-2xl font-semibold">Legacy stream console is still available</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Run low-level stream operations, inspect balances, or debug transfers inside the legacy interface whenever you need it.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link to="/legacy-console">Open legacy console</Link>
          </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
