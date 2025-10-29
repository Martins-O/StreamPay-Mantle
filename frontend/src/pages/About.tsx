import { motion } from 'framer-motion';
import {
  Target,
  Lightbulb,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Heart,
  Code,
  Rocket,
  GitBranch,
  Award
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card } from '@/components/ui/card';

const About = () => {
  const mission = {
    icon: Target,
    title: 'Our Mission',
    description: 'To revolutionize how payments flow in the digital economy by making continuous, real-time value transfer accessible to everyone.',
    details: [
      'Enable second-by-second payment streaming',
      'Eliminate traditional payment delays',
      'Create financial inclusivity through blockchain',
      'Build trust through transparent smart contracts',
    ],
  };

  const vision = {
    icon: Lightbulb,
    title: 'Our Vision',
    description: 'A world where every payment flows like water - continuous, transparent, and instant. Where workers get paid every second they work, and services are paid per second of usage.',
    highlights: [
      'Universal adoption of streaming payments',
      'No more waiting for payday',
      'Fair compensation in real-time',
      'Borderless payment infrastructure',
    ],
  };

  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Built with security as the foundation. All smart contracts follow OpenZeppelin standards and are designed for maximum safety.',
    },
    {
      icon: Users,
      title: 'User-Centric',
      description: 'Every feature is designed with users in mind. Simple interfaces, clear documentation, and intuitive interactions.',
    },
    {
      icon: Globe,
      title: 'Accessible',
      description: 'Financial tools should be available to everyone, everywhere. No barriers, no gatekeepers, just open access.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Pushing the boundaries of what\'s possible with blockchain technology to solve real-world problems.',
    },
    {
      icon: Heart,
      title: 'Community Driven',
      description: 'Built by the community, for the community. Open source and transparent in everything we do.',
    },
    {
      icon: Code,
      title: 'Technical Excellence',
      description: 'Clean code, comprehensive testing, and best practices in every line we write.',
    },
  ];

  const technology = [
    {
      name: 'Mantle L2',
      description: 'Built on Mantle\'s high-performance Layer 2 network for ultra-low gas fees and fast transactions.',
      icon: '⛓️',
    },
    {
      name: 'Smart Contracts',
      description: 'Solidity 0.8.30 with OpenZeppelin libraries for industry-standard security and reliability.',
      icon: '📜',
    },
    {
      name: 'Wagmi & Viem',
      description: 'Modern TypeScript Web3 libraries for seamless wallet integration and blockchain interactions.',
      icon: '🔌',
    },
    {
      name: 'React & Vite',
      description: 'Lightning-fast frontend with React 18, Vite, and beautiful UI components.',
      icon: '⚛️',
    },
  ];

  const metrics = [
    {
      value: '100%',
      label: 'Open Source',
      description: 'Fully transparent code',
    },
    {
      value: '~$0.01',
      label: 'Per Transaction',
      description: 'Ultra-low fees on Mantle',
    },
    {
      value: '1 sec',
      label: 'Precision',
      description: 'Second-by-second accuracy',
    },
    {
      value: '28',
      label: 'Tests Passing',
      description: 'Comprehensive coverage',
    },
  ];

  const roadmap = [
    {
      phase: 'Phase 1',
      title: 'Foundation',
      status: 'Completed',
      items: ['Core streaming contracts', 'Basic UI interface', 'Testnet deployment', 'Security audits'],
    },
    {
      phase: 'Phase 2',
      title: 'Enhancement',
      status: 'In Progress',
      items: ['Pause/Resume streams', 'Batch stream creation', 'Advanced analytics', 'Mobile optimization'],
    },
    {
      phase: 'Phase 3',
      title: 'Expansion',
      status: 'Planned',
      items: ['Multi-chain support', 'NFT stream receipts', 'Yield integration', 'DAO governance'],
    },
    {
      phase: 'Phase 4',
      title: 'Scale',
      status: 'Future',
      items: ['Enterprise solutions', 'API marketplace', 'White-label platform', 'Global partnerships'],
    },
  ];

  const team = {
    description: 'StreamPay is built by a passionate team of blockchain developers, designers, and innovators who believe in the power of continuous payments to transform the digital economy.',
    values: [
      'We\'re committed to open source principles',
      'Every line of code is peer-reviewed',
      'Community feedback shapes our roadmap',
      'Transparent development process',
    ],
  };

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
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              About <span className="gradient-text">StreamPay Mantle</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Building the future of continuous payments on blockchain technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card p-8 h-full">
                <mission.icon className="h-12 w-12 text-primary mb-6" />
                <h2 className="text-2xl font-bold mb-4">{mission.title}</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {mission.description}
                </p>
                <ul className="space-y-3">
                  {mission.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card p-8 h-full">
                <vision.icon className="h-12 w-12 text-primary mb-6" />
                <h2 className="text-2xl font-bold mb-4">{vision.title}</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {vision.description}
                </p>
                <ul className="space-y-3">
                  {vision.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
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
              Our Core <span className="gradient-text">Values</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Principles that guide everything we build and every decision we make.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card p-6 h-full hover:scale-105 transition-transform">
                  <value.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
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
              Built with <span className="gradient-text">Cutting-Edge Tech</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We use the latest and most reliable technologies to deliver a superior experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {technology.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{tech.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{tech.name}</h3>
                      <p className="text-sm text-muted-foreground">{tech.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-purple-500/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card p-6 text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {metric.value}
                  </div>
                  <div className="text-lg font-semibold mb-1">{metric.label}</div>
                  <div className="text-sm text-muted-foreground">{metric.description}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
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
              Development <span className="gradient-text">Roadmap</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our journey from concept to the future of continuous payments.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {roadmap.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className={`glass-card p-6 h-full ${
                  phase.status === 'Completed' ? 'border-green-500/50' :
                  phase.status === 'In Progress' ? 'border-primary/50' :
                  'border-border/50'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-primary">{phase.phase}</span>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      phase.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                      phase.status === 'In Progress' ? 'bg-primary/20 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {phase.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{phase.title}</h3>
                  <ul className="space-y-2">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Rocket className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card p-12 text-center">
              <GitBranch className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Open Source Community</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {team.description}
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                {team.values.map((value, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{value}</span>
                  </div>
                ))}
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
            <Card className="glass-card p-12 text-center space-y-6 glow-cyan">
              <TrendingUp className="h-16 w-16 text-primary mx-auto" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Join the Payment Revolution
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Be part of the movement towards continuous, fair, and transparent payments. Start streaming today.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <div className="text-lg px-8 py-4 rounded-full animated-gradient text-background font-semibold cursor-pointer">
                  Get Started Now
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

export default About;
