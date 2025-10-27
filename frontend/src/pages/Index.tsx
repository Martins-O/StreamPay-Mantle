import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Droplets, Zap, Shield, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';

const Index = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      navigate('/dashboard');
    }
  }, [isConnected, navigate]);

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Streaming',
      description: 'Tokens flow continuously per second, not in batches',
    },
    {
      icon: Shield,
      title: 'Secure & Trustless',
      description: 'Smart contracts ensure transparent and tamper-proof payments',
    },
    {
      icon: TrendingUp,
      title: 'Flexible Duration',
      description: 'Create streams for seconds, hours, days, or months',
    },
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

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Create continuous token payment streams on Mantle. Pay by the second, claim anytime, cancel flexibly.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <div className="text-lg px-8 py-4 rounded-full animated-gradient text-background font-semibold cursor-default">
                Connect wallet to get started →
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="glass-card p-8 rounded-2xl"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
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
            className="glass-card p-12 rounded-3xl text-center space-y-6 glow-purple"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Ready to revolutionize payments?</h2>
            <p className="text-lg text-muted-foreground">
              Join the future of continuous crypto streaming on Mantle testnet
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <motion.a
                href="https://docs.mantle.xyz"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg border border-primary/50 hover:bg-primary/10 transition-colors"
              >
                Read Docs
              </motion.a>
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg animated-gradient"
              >
                View on GitHub
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
