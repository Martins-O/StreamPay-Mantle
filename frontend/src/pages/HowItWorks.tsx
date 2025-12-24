import { motion } from 'framer-motion';
import {
  Wallet,
  Droplets,
  Clock,
  Coins,
  Shield,
  Zap,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Play,
  HelpCircle,
  Info
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import InfoTooltip from '@/components/InfoTooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      icon: Shield,
      title: 'Business Submits Revenue Data',
      description: 'Businesses submit metadata about their revenue streams - invoices, subscriptions, or rent rolls.',
      tip: 'No upfront fees - only pay when funded',
      details: [
        'Upload business profile and revenue documentation',
        'Connect accounting systems or provide manual data',
        'Specify funding needs and repayment terms',
      ],
    },
    {
      number: '02',
      icon: Zap,
      title: 'AI Risk Oracle Scores',
      description: 'The FastAPI risk service analyzes the business and generates a signed AI risk score with rationale.',
      tip: 'Scores update in real-time as your business grows',
      details: [
        'Deterministic scoring based on revenue stability',
        'EIP-712 signed payload for on-chain verification',
        'Real-time updates as business metrics change',
      ],
    },
    {
      number: '03',
      icon: Coins,
      title: 'Mint RevenueToken',
      description: 'Business creates ERC-20 RevenueTokens backed by their future cashflows.',
      tip: 'Tokens are tradeable - create a secondary market',
      details: [
        'Tokens represent claims on future revenue',
        'Minted through RevenueTokenFactory contract',
        'Automatically configured with StreamEngine',
      ],
    },
    {
      number: '04',
      icon: Wallet,
      title: 'Investors Provide Liquidity',
      description: 'Investors review the AI risk score and deposit stablecoins into the YieldPool to receive YieldBackedTokens (YBT).',
      tip: 'Withdraw anytime - YBT shares are liquid',
      details: [
        'Deposit USDC or MNT into the YieldPool',
        'Receive YBT shares proportional to deposit',
        'Earn yield as revenue streams in',
      ],
    },
    {
      number: '05',
      icon: Droplets,
      title: 'Revenue Streams & Yields',
      description: 'Business revenue flows into the YieldPool in real-time, distributing proportional yield to all YBT holders.',
      tip: 'Watch your balance grow every second',
      details: [
        'Second-by-second streaming of revenue',
        'Automatic yield distribution to investors',
        'Transparent on-chain accounting',
      ],
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Risk Scoring',
      description: 'FastAPI service generates deterministic risk scores with transparent rationale, signed via EIP-712 for trustless on-chain verification.',
      tooltip: 'Risk scores are generated off-chain and cryptographically signed, then verified on-chain for maximum transparency',
      color: 'text-cyan-500',
    },
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'All transactions and risk scores are verified on-chain. Smart contracts manage funds with zero intermediaries or custodial risk.',
      tooltip: 'Non-custodial by design - you always maintain full control of your assets',
      color: 'text-purple-500',
    },
    {
      icon: CheckCircle2,
      title: 'Instant Liquidity',
      description: 'Businesses get immediate capital against future revenue without waiting 30-90 days for invoice payments or subscription renewals.',
      tooltip: 'Typical funding time: 6-24 hours from application to receiving capital',
      color: 'text-green-500',
    },
    {
      icon: Droplets,
      title: 'Real-Time Yield',
      description: 'Investors earn yield every second as revenue streams into the YieldPool. No monthly distributions - fully automated and continuous.',
      tooltip: 'Yield compounds continuously - claim anytime without waiting for distribution schedules',
      color: 'text-amber-500',
    },
    {
      icon: Coins,
      title: 'Composable DeFi Primitives',
      description: 'RevenueTokens, YieldBackedTokens, and StreamEngine are modular building blocks that integrate with any DeFi protocol on Mantle.',
      tooltip: 'Use YBT tokens as collateral, stake them, or integrate with other Mantle DeFi protocols',
      color: 'text-rose-500',
    },
  ];

  const useCases = [
    {
      title: 'SaaS ARR Financing',
      description: 'Turn annual recurring revenue into immediate working capital. Investors fund your MRR, you pay back as customers renew.',
      tooltip: 'Example: $100K ARR SaaS company can get $70K upfront, repaid as subscriptions renew',
      icon: '💻',
    },
    {
      title: 'Invoice Factoring',
      description: 'Convert B2B invoices with 30-90 day payment terms into instant liquidity. No more waiting for slow-paying customers.',
      tooltip: 'Get 80-90% of invoice value immediately, full payment when customer pays',
      icon: '📄',
    },
    {
      title: 'Real Estate Cashflow',
      description: 'Tokenize rent rolls and stream payments to liquidity providers. Get upfront capital against future lease income.',
      tooltip: 'Property owners can unlock 6-12 months of rent upfront for renovations or new acquisitions',
      icon: '🏠',
    },
    {
      title: 'Trade Finance',
      description: 'Embed Liquifi into supply chain platforms. Suppliers get paid instantly while logistics partners earn yield on receivables.',
      tooltip: 'Suppliers get instant payment, buyers keep payment terms, logistics partners earn yield',
      icon: '📦',
    },
    {
      title: 'Creator Economy',
      description: 'Monetize future sponsorships, memberships, and content revenue. Creators get upfront funding, backers earn from success.',
      tooltip: 'Creators with predictable revenue can fund projects without platform lock-in',
      icon: '🎨',
    },
    {
      title: 'Revenue-Based Loans',
      description: 'Non-dilutive growth capital tied to actual revenue performance. Repay automatically as your business scales.',
      tooltip: 'Pay back a percentage of revenue - higher revenue months mean higher repayments, lower means lower',
      icon: '📈',
    },
  ];

  const technicalFlow = [
    {
      step: 'Business Registration',
      description: 'Business submits profile to backend, which calls FastAPI AI service for initial risk assessment',
    },
    {
      step: 'AI Risk Scoring',
      description: 'FastAPI service generates deterministic score + rationale, backend signer creates EIP-712 signature',
    },
    {
      step: 'RevenueToken Mint',
      description: 'Business calls RevenueTokenFactory with signed risk payload, mints ERC-20 tokens backed by future revenue',
    },
    {
      step: 'YieldPool Deposit',
      description: 'Investors approve and deposit USDC/MNT into YieldPool, receive YieldBackedTokens (YBT) as shares',
    },
    {
      step: 'Revenue Streaming',
      description: 'Business revenue flows via StreamEngine to YieldPool, distributing yield proportionally to all YBT holders',
    },
    {
      step: 'Risk Updates',
      description: 'RiskOracleAdapter validates updated AI scores on-chain, adjusting pool exposure and share values',
    },
  ];

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Droplets className="h-16 w-16 text-primary mx-auto glow-cyan" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              How <span className="gradient-text">Liquifi</span> Works
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform future revenue into instant capital with AI-powered risk management, yield streaming, and transparent on-chain verification.
            </p>

            {/* Quick Tips */}
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12">
              <Card className="glass-card p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">1</Badge>
                  <div className="text-left">
                    <p className="font-semibold text-sm mb-1">For Businesses</p>
                    <p className="text-xs text-muted-foreground">Get funded in hours, not weeks. Zero equity dilution.</p>
                  </div>
                </div>
              </Card>
              <Card className="glass-card p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">2</Badge>
                  <div className="text-left">
                    <p className="font-semibold text-sm mb-1">For Investors</p>
                    <p className="text-xs text-muted-foreground">Earn real yield from revenue, not speculation.</p>
                  </div>
                </div>
              </Card>
              <Card className="glass-card p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">3</Badge>
                  <div className="text-left">
                    <p className="font-semibold text-sm mb-1">Fully On-Chain</p>
                    <p className="text-xs text-muted-foreground">Every transaction verified on Mantle L2.</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-16"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                <div className={`space-y-6 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-bold text-primary/20">{step.number}</span>
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-3xl font-bold">{step.title}</h2>
                      <InfoTooltip content={step.tip} side="right" />
                    </div>
                  </div>

                  <p className="text-lg text-muted-foreground">{step.description}</p>

                  <ul className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Card className={`glass-card p-8 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                    <step.icon className="h-24 w-24 text-primary/40" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Why Choose <span className="gradient-text">Liquifi</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Built on cutting-edge technology to provide the best revenue financing experience.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Each feature is designed to maximize trust and minimize friction</span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card p-8 h-full hover:scale-105 transition-transform">
                  <feature.icon className={`h-12 w-12 ${feature.color} mb-6`} />
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <InfoTooltip content={feature.tooltip} side="top" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Real-World <span className="gradient-text">Use Cases</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Liquifi transforms how businesses access capital across industries.
            </p>
            <Card className="mt-8 max-w-2xl mx-auto glass-card p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground text-left">
                  <strong className="text-foreground">Getting Started:</strong> Each use case can be implemented in under 24 hours. Connect your wallet, submit your revenue data, and get instant liquidity.
                </p>
              </div>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="glass-card p-6 h-full">
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold">{useCase.title}</h3>
                    <InfoTooltip content={useCase.tooltip} side="top" />
                  </div>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Flow Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-purple-500/5">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Under the <span className="gradient-text">Hood</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              The technical architecture of Liquifi's revenue financing protocol.
            </p>
            <Badge variant="outline" className="mt-4">
              <HelpCircle className="h-3 w-3 mr-2" />
              For Developers: All contracts are open-source and auditable
            </Badge>
          </motion.div>

          <div className="space-y-4">
            {technicalFlow.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{item.step}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Card className="glass-card p-8">
              <p className="text-muted-foreground mb-6">
                AI risk scores are cryptographically signed off-chain and verified on-chain via EIP-712. Revenue streaming and yield distribution happen with second-level precision.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                  <span>Transparent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span>Composable</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card p-12 text-center space-y-6 glow-purple">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your Revenue?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Connect your wallet to access the Liquifi dashboard. Businesses get instant liquidity, investors earn real yield.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <a href="/dashboard">
                  <div className="text-lg px-8 py-4 rounded-full animated-gradient text-background font-semibold cursor-pointer">
                    Launch Dashboard <ArrowRight className="inline-block ml-2 h-5 w-5" />
                  </div>
                </a>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
