import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlayCircle,
  Rocket,
  Clock,
  ShieldCheck,
  Waves,
  PiggyBank,
  Workflow,
  BarChart3,
  Route,
  AlarmCheck,
  ArrowRight,
  Sparkle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import InfoTooltip from '@/components/InfoTooltip';

const heroCopy = {
  heading: 'Tokenize revenue. Stream AI-scored yield on Mantle.',
  subheading:
    'Liquifi transforms future revenue into instant capital with AI-powered risk management. Businesses tokenize cashflows, investors provide liquidity, everyone earns from real revenue streams.',
  ctas: [
    { label: 'Launch App', to: '/dashboard', icon: Rocket, variant: 'primary' as const },
    { label: 'Learn How It Works', to: '/how-it-works', icon: ArrowRight, variant: 'secondary' as const },
  ],
};

const problemPoints = [
  {
    icon: AlarmCheck,
    title: 'Working capital trapped in invoices',
    description: 'Vendors wait 30-90 days to convert ARR or rent into usable liquidity, stalling hiring and growth.',
    tooltip: 'Traditional factoring charges 2-5% monthly. Liquifi provides instant liquidity at transparent on-chain rates',
  },
  {
    icon: Route,
    title: 'Fragmented streaming rails',
    description: 'Revenue-based financing still relies on spreadsheets. There is no single primitive for streams, vaults, and risk data.',
    tooltip: 'Current RBF solutions require custom integrations per lender. Liquifi standardizes everything in composable smart contracts',
  },
  {
    icon: ShieldCheck,
    title: 'Risk is opaque',
    description: 'Investors cannot trust off-chain PDFs. They need signed AI risk updates before deploying stablecoins.',
    tooltip: 'AI risk scores are cryptographically signed off-chain, then verified on-chain—combining speed with trustlessness',
  },
];

const solutionHighlights = [
  {
    icon: Waves,
    title: 'RevenueToken factory',
    description: 'Deploy ERC-20 claims backed by ARR, trade finance, or rent, then stream repayments through StreamEngine.',
    tooltip: 'Mint custom ERC-20 tokens representing revenue rights. Tradeable, composable, fully on-chain—no legal wrappers needed',
  },
  {
    icon: PiggyBank,
    title: 'YieldPool + YBT',
    description: 'Investors deposit USDC/MNT, receive YieldBackedToken shares, and earn real-time revenue distribution.',
    tooltip: 'Like a mutual fund for revenue streams: deposit stablecoins, get yield-bearing tokens, redeem anytime with accrued revenue',
  },
  {
    icon: Workflow,
    title: 'AI Risk Oracle',
    description: 'A backend signer feeds FastAPI scoring outputs into RiskOracleAdapter for trustless underwriting.',
    tooltip: 'FastAPI generates risk scores off-chain for speed, backend signs them, smart contract verifies signature on-chain',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Fund the vault',
    copy: 'Approve once, deposit tokens, and StreamManager escrows the full amount for your stream or batch.',
    tooltip: 'One-time ERC-20 approval, then deposit. Funds locked in StreamVault until stream completes or you pause it',
  },
  {
    step: '02',
    title: 'Configure the flow',
    copy: 'Pick recipient, total amount, duration, and optional templates. Streams start ticking immediately with second-level precision.',
    tooltip: 'Set recipient address, total tokens, duration in seconds. Stream starts immediately—no waiting periods',
  },
  {
    step: '03',
    title: 'Monitor & automate',
    copy: 'Recipients claim on demand, senders pause/resume instantly, and analytics visualize actual vs projected throughput.',
    tooltip: 'Dashboard shows real-time accrual. Recipients claim anytime, senders can pause for emergencies—full control',
  },
];

const metrics = [
  { label: 'gas cost per action', value: '< $0.01', caption: 'Mantle L2 keeps costs negligible.', tooltip: 'Typical transaction costs: Stream creation ~$0.005, claiming ~$0.003, powered by Mantle L2 efficiency' },
  { label: 'stream precision', value: '1 second', caption: 'Calculated via on-chain accrual library.', tooltip: 'Revenue accrues every second with deterministic on-chain math—no off-chain dependencies or rounding errors' },
  { label: 'escrow safety', value: '100% on-chain', caption: 'No custodial dependencies or manual payouts.', tooltip: 'All funds locked in audited smart contracts. No admin keys, no centralized control, fully trustless' },
  { label: 'automation ready', value: 'Webhooks (soon)', caption: 'Upcoming triggers for payroll, SaaS, and grants.', tooltip: 'Upcoming: Auto-trigger streams on Stripe invoice creation, Quickbooks entries, or custom events' },
];

const useCases = [
  {
    title: 'SaaS ARR financing',
    description: 'Turn annual subscriptions into instant liquidity while investors receive second-by-second revenue splits.',
    tooltip: 'Example: $100K ARR → get $70K upfront, repay as subscriptions renew, investors earn yield on actual revenue',
  },
  {
    title: 'Invoice / trade finance',
    description: 'Embed Liquifi into logistics partners so receivables fund a shared Mantle pool with live risk scores.',
    tooltip: 'Get 80-90% of invoice value immediately instead of waiting 60-90 days. Pool investors earn from invoice payments',
  },
  {
    title: 'Real estate cashflow',
    description: 'Tokenize rent rolls and stream payments to liquidity providers that want transparent RealFi exposure.',
    tooltip: 'Tokenize monthly rent, get upfront capital for renovations, tenants pay into pool, investors earn rental yield',
  },
];

const AnimatedBackdrop = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <motion.svg
      className="absolute -top-32 left-1/2 h-[520px] w-[920px] -translate-x-1/2 opacity-60"
      viewBox="0 0 1200 600"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
    >
      <defs>
        <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.35)" />
          <stop offset="50%" stopColor="rgba(192,132,252,0.3)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.25)" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="35" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d="M100 200 C 220 80, 420 80, 540 200 S 860 320, 980 200"
        stroke="url(#hero-gradient)"
        strokeWidth="120"
        strokeLinecap="round"
        fill="none"
        filter="url(#glow)"
        animate={{
          d: [
            'M100 200 C 220 80, 420 80, 540 200 S 860 320, 980 200',
            'M120 240 C 280 120, 400 40, 580 160 S 840 360, 960 220',
            'M80 220 C 200 60, 460 120, 600 240 S 880 280, 1020 260',
          ],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  </div>
);

const Index = () => (
  <div className="relative min-h-screen overflow-hidden bg-background">
    <AnimatedBackdrop />
    <Navbar />

    <main className="relative z-10">
      {/* Hero */}
      <section className="relative pt-28 pb-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary">
              <Sparkle className="h-3 w-3" />
              RealFi + AI on Mantle
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
              {heroCopy.heading}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl mx-auto max-w-3xl">
              {heroCopy.subheading}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {heroCopy.ctas.map(cta => (
                <motion.div key={cta.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to={cta.to}>
                    <div
                      className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                        cta.variant === 'primary'
                          ? 'animated-gradient text-background shadow-lg shadow-primary/25'
                          : 'border border-primary/50 text-primary hover:bg-primary/10'
                      }`}
                    >
                      <cta.icon className="h-4 w-4" />
                      {cta.label}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-16 grid gap-4 sm:grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto">
              {metrics.map(metric => (
                <Card key={metric.label} className="glass-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                    <InfoTooltip content={metric.tooltip} side="top" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold gradient-text">{metric.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{metric.caption}</p>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold md:text-4xl">The old way slows teams down.</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Payment drips stitched together with spreadsheets, cron jobs, and manual claims equal risk and wasted time. Liquifi removes the friction.
              </p>
              <div className="mt-8 space-y-5">
                {problemPoints.map(point => (
                  <Card key={point.title} className="glass-card p-6">
                    <div className="flex items-start gap-4">
                      <point.icon className="mt-1 h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{point.title}</h3>
                          <InfoTooltip content={point.tooltip} side="top" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{point.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold md:text-4xl">Liquifi handles the heavy lifting.</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                A modular stack of RevenueTokenFactory, StreamEngine, YieldPool, and the RiskOracleAdapter makes RealFi primitives composable on Mantle.
              </p>
              <div className="mt-8 space-y-5">
                {solutionHighlights.map(point => (
                  <Card key={point.title} className="glass-card p-6">
                    <div className="flex items-start gap-4">
                      <point.icon className="mt-1 h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{point.title}</h3>
                          <InfoTooltip content={point.tooltip} side="top" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{point.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative bg-primary/5 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }} className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Launch a stream in three moves.</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Under the hood, StreamManager validates every parameter, escrows assets in StreamVault, and keeps second-by-second accounting synced.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {howItWorks.map(step => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: Number(step.step) * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card h-full rounded-3xl p-6">
                  <p className="text-sm font-semibold text-primary">{step.step}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <InfoTooltip content={step.tooltip} side="top" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{step.copy}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }} className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Built for the builders who move fast.</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              From SaaS finance desks to proptech operators, Liquifi packages underwriting, tokenization, and streaming in one battle-tested repo.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {useCases.map(card => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <Card className="glass-card h-full rounded-3xl p-7">
                  <BarChart3 className="h-10 w-10 text-primary" />
                  <div className="flex items-center gap-2 mt-5">
                    <h3 className="text-xl font-semibold">{card.title}</h3>
                    <InfoTooltip content={card.tooltip} side="top" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{card.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 pb-24">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <Card className="glass-card overflow-hidden rounded-3xl border border-primary/30 bg-primary/10 p-10 text-center shadow-[0_20px_120px_rgba(56,189,248,0.25)]">
              <h2 className="text-3xl font-bold md:text-4xl">Ready to make every second count?</h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Connect your wallet to access the dashboard and start tokenizing revenue or providing liquidity.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                  <Link to="/dashboard">
                    <div className="flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-primary shadow-lg">
                      <PlayCircle className="h-4 w-4" />
                      Launch App
                    </div>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                  <Link to="/docs">
                    <div className="flex items-center gap-2 rounded-full border border-primary/40 px-6 py-3 text-sm font-semibold text-background/90">
                      View technical docs
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default Index;
