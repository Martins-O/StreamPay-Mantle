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
  Play
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card } from '@/components/ui/card';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      icon: Wallet,
      title: 'Connect Your Wallet',
      description: 'Connect your MetaMask or WalletConnect-compatible wallet to the Mantle testnet network.',
      details: [
        'Supports MetaMask, WalletConnect, and more',
        'One-click connection process',
        'Secure and non-custodial',
      ],
    },
    {
      number: '02',
      icon: Coins,
      title: 'Select Tokens & Amounts',
      description: 'Choose one or many ERC-20 tokens to stream and specify how much should unlock over time.',
      details: [
        'Multi-token support in a single stream',
        'Real-time balance and allowance checking',
        'Token approval handled automatically',
      ],
    },
    {
      number: '03',
      icon: Clock,
      title: 'Set Stream Duration',
      description: 'Define how long the payment stream should last - from seconds to months.',
      details: [
        'Flexible duration settings',
        'Calculate rate per second',
        'Preview stream details before creation',
      ],
    },
    {
      number: '04',
      icon: Play,
      title: 'Start Streaming',
      description: 'Confirm the transaction and mint an NFT receipt that streams value in real-time to the recipient.',
      details: [
        'Low gas fees on Mantle L2',
        'Instant stream activation with NFT ownership proof',
        'Recipients can transfer or batch claim with the NFT',
      ],
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Streaming',
      description: 'Tokens are transferred continuously per second, not in batches. Recipients can see their balance increasing in real-time.',
      color: 'text-cyan-500',
    },
    {
      icon: Shield,
      title: 'Secure & Trustless',
      description: 'Smart contracts handle all transactions automatically. No intermediaries, no trust required. Your funds are secured by blockchain technology.',
      color: 'text-purple-500',
    },
    {
      icon: CheckCircle2,
      title: 'Flexible Control',
      description: 'Senders can top up, extend, or cancel streams anytime. Recipients claim accrued tokens on demand or transfer their NFT receipt.',
      color: 'text-green-500',
    },
    {
      icon: Droplets,
      title: 'Transferable NFT Receipts',
      description: 'Every stream mints an ERC-721 receipt that proves ownership. Hand it off to another wallet or marketplace to reroute future cashflow instantly.',
      color: 'text-amber-500',
    },
    {
      icon: Coins,
      title: 'Batch Payroll Claims',
      description: 'Recipients aggregate multiple NFT streams and claim them in one transaction—perfect for payroll and treasury ops.',
      color: 'text-rose-500',
    },
  ];

  const useCases = [
    {
      title: 'Payroll & Salaries',
      description: 'Stream salaries to employees every second instead of monthly payments. Employees get paid continuously for their work.',
      icon: '💼',
    },
    {
      title: 'Subscriptions',
      description: 'Pay for services per second of usage. No more upfront monthly fees. Cancel anytime and only pay for what you use.',
      icon: '📱',
    },
    {
      title: 'Freelance Payments',
      description: 'Stream payments to freelancers based on project milestones or time worked. Automatic and transparent.',
      icon: '💻',
    },
    {
      title: 'Vesting & Grants',
      description: 'Create token vesting schedules for investors or team members with continuous unlocking over time.',
      icon: '🎁',
    },
    {
      title: 'Rent & Leases',
      description: 'Stream rent payments per second to landlords. No more monthly rent due dates or late fees.',
      icon: '🏠',
    },
    {
      title: 'DeFi Loans',
      description: 'Continuous interest payments on loans. Interest streams from borrower to lender every second.',
      icon: '🏦',
    },
  ];

  const technicalFlow = [
    {
      step: 'Token Approval',
      description: 'User approves StreamManager contract to spend tokens',
    },
    {
      step: 'Create Stream',
      description: 'StreamManager locks tokens in StreamVault and mints an ERC-721 receipt to the recipient',
    },
    {
      step: 'Real-Time Calculation',
      description: 'Accounting keeps per-token balances in sync every second, including pauses and top-ups',
    },
    {
      step: 'Claim, Transfer, or Adjust',
      description: 'NFT holder batches claims or transfers ownership while the sender can extend, top up, or cancel',
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
              How <span className="gradient-text">StreamPay</span> Works
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover how multi-token, NFT-backed payment streaming lets teams top up, transfer, and batch claim value without waiting for payroll cycles.
            </p>
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

                  <h2 className="text-3xl font-bold">{step.title}</h2>
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
              Why Choose <span className="gradient-text">StreamPay</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Built on cutting-edge technology to provide the best streaming payment experience.
            </p>
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
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
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
              StreamPay transforms how payments work across industries.
            </p>
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
                  <h3 className="text-lg font-semibold mb-3">{useCase.title}</h3>
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
              The technical flow of a StreamPay payment stream.
            </p>
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
                All calculations happen on-chain with second-precision accuracy. No oracles, no off-chain dependencies.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Trustless</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                  <span>Transparent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span>Decentralized</span>
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
                Ready to Start Streaming?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Connect your wallet and experience the future of continuous payments on Mantle.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <div className="text-lg px-8 py-4 rounded-full animated-gradient text-background font-semibold cursor-pointer">
                  Get Started <ArrowRight className="inline-block ml-2 h-5 w-5" />
                </div>
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
