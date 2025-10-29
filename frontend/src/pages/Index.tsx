import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets, Zap, Shield, TrendingUp, Clock, Coins, Users, ArrowRight, PlayCircle, DollarSign } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card } from '@/components/ui/card';

const Index = () => {

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Streaming',
      description: 'Tokens flow continuously per second, not in batches. Watch your balance grow in real-time as payments stream directly to your wallet.',
      color: 'text-cyan-500',
    },
    {
      icon: Shield,
      title: 'Secure & Trustless',
      description: 'Smart contracts ensure transparent and tamper-proof payments. Built on OpenZeppelin standards with comprehensive security testing.',
      color: 'text-purple-500',
    },
    {
      icon: TrendingUp,
      title: 'Flexible Control',
      description: 'Create streams for any duration. Cancel anytime to reclaim unstreamed tokens. Recipients claim whenever they want.',
      color: 'text-green-500',
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Get Paid Every Second',
      description: 'No more waiting for payday. Your earnings accumulate continuously, second by second.',
    },
    {
      icon: Coins,
      title: 'Low Fees on Mantle L2',
      description: 'Built on Mantle\'s Layer 2 network for ultra-low transaction costs - less than $0.01 per stream.',
    },
    {
      icon: Users,
      title: 'Perfect for Teams',
      description: 'Ideal for payroll, freelancers, subscriptions, and any continuous payment needs.',
    },
    {
      icon: DollarSign,
      title: 'Transparent & Fair',
      description: 'Every transaction is recorded on-chain. No hidden fees, no intermediaries, just pure transparency.',
    },
  ];

  const stats = [
    { value: '100%', label: 'On-Chain', description: 'Fully decentralized' },
    { value: '< $0.01', label: 'Gas Fees', description: 'Per transaction' },
    { value: '1s', label: 'Precision', description: 'Second-accurate' },
    { value: '24/7', label: 'Uptime', description: 'Always available' },
  ];

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Droplets className="h-20 w-20 text-primary mx-auto glow-cyan" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Stream Your Crypto
              <br />
              <span className="gradient-text">Payments in Real Time</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Revolutionary payment streaming on <span className="text-primary font-semibold">Mantle L2</span>.
              Pay by the second, claim anytime, cancel flexibly. The future of continuous value transfer is here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/dashboard">
                  <div className="text-lg px-8 py-4 rounded-full animated-gradient text-background font-semibold cursor-pointer flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Launch App
                  </div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/how-it-works">
                  <div className="text-lg px-8 py-4 rounded-full border-2 border-primary/50 hover:bg-primary/10 transition-colors font-semibold cursor-pointer">
                    Learn More
                  </div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-sm font-semibold mb-1">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
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
              Why Choose <span className="gradient-text">StreamPay</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Experience the next generation of payment infrastructure built for the modern world.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="glass-card p-8 rounded-2xl h-full">
                  <feature.icon className={`h-12 w-12 ${feature.color} mb-6`} />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-purple-500/5">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Built for <span className="gradient-text">Everyone</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Whether you're an individual, freelancer, or business - StreamPay works for you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
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
            <Card className="glass-card p-12 rounded-3xl text-center space-y-6 glow-purple">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Payments?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join the future of continuous crypto streaming on Mantle. Start your first stream today and experience the power of real-time payments.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/dashboard">
                    <div className="px-8 py-4 rounded-lg animated-gradient text-background font-semibold cursor-pointer flex items-center gap-2">
                      <PlayCircle className="h-5 w-5" />
                      Launch App
                    </div>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/how-it-works">
                    <div className="px-8 py-4 rounded-lg border border-primary/50 hover:bg-primary/10 transition-colors font-semibold cursor-pointer flex items-center gap-2">
                      Learn How It Works
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </Link>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
