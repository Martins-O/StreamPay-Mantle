import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Book,
  Code,
  Wallet,
  Zap,
  ExternalLink,
  Copy,
  FileCode,
  Server,
  Brain,
  Shield,
  Database,
  Rocket
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  REVENUE_FACTORY_ADDRESS,
  RISK_ORACLE_ADDRESS,
  PRIMARY_YIELD_POOL
} from '@/lib/streamYield';

const Docs = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="min-h-screen pb-20">
      <AnimatedBackground />
      <Navbar />

      <main className="pt-24 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <Book className="h-16 w-16 text-primary mx-auto" />
            <h1 className="text-4xl font-bold gradient-text">Liquifi Documentation</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              AI-powered revenue financing protocol on Mantle L2. Turn future revenue into instant capital.
            </p>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="glass-card border border-border/50 p-1 grid grid-cols-6 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
              <TabsTrigger value="api">Backend API</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="glass-card p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Wallet className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">What is Liquifi?</h2>
                </div>

                <div className="space-y-4 text-sm">
                  <p className="text-muted-foreground leading-relaxed">
                    Liquifi is a decentralized revenue financing protocol that enables businesses to unlock capital
                    from future revenue streams. Unlike traditional lending that requires collateral, Liquifi uses
                    <strong className="text-foreground"> AI-powered risk assessment</strong> to evaluate your revenue
                    history and provide instant financing.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <Card className="bg-background/50 p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        For Businesses
                      </h3>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Get capital in &lt;60 seconds with AI risk scoring</li>
                        <li>• No collateral required—just revenue history</li>
                        <li>• Mint RevenueTokens backed by future earnings</li>
                        <li>• Gas costs &lt;$0.01 per transaction on Mantle L2</li>
                        <li>• Transparent, deterministic risk assessment</li>
                      </ul>
                    </Card>

                    <Card className="bg-background/50 p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        For Investors
                      </h3>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Earn yield from real business revenue streams</li>
                        <li>• Invest in YieldPools with AI-verified risk bands</li>
                        <li>• Diversified exposure across multiple businesses</li>
                        <li>• Real-time APY and risk metrics on-chain</li>
                        <li>• Withdraw anytime with instant liquidity</li>
                      </ul>
                    </Card>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h3 className="font-semibold text-lg">Key Features</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      <Card className="bg-primary/5 border-primary/20 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Brain className="h-4 w-4 text-primary" />
                          <span className="text-xs font-semibold">AI Risk Oracle</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          FastAPI service scores business risk in &lt;60s based on revenue, volatility, and payment history
                        </p>
                      </Card>
                      <Card className="bg-primary/5 border-primary/20 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="text-xs font-semibold">EIP-712 Signatures</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Cryptographically signed risk scores verified on-chain for trustless operation
                        </p>
                      </Card>
                      <Card className="bg-primary/5 border-primary/20 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Rocket className="h-4 w-4 text-primary" />
                          <span className="text-xs font-semibold">Mantle L2 Speed</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Sub-cent gas fees and instant finality on Mantle's optimistic rollup
                        </p>
                      </Card>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Quick Start</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                        <div>
                          <p className="font-medium">Connect Wallet</p>
                          <p className="text-xs text-muted-foreground">MetaMask or any Web3 wallet with Mantle Sepolia testnet</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                        <div>
                          <p className="font-medium">Register Business Profile</p>
                          <p className="text-xs text-muted-foreground">Submit revenue data → AI generates risk score → Get signed proof</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                        <div>
                          <p className="font-medium">Mint RevenueTokens or Invest</p>
                          <p className="text-xs text-muted-foreground">Businesses create revenue-backed tokens, investors deposit into YieldPools</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button asChild size="sm">
                      <a href="/business">
                        <Brain className="mr-2 h-4 w-4" />
                        Business Workspace
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href="/investor">
                        <Zap className="mr-2 h-4 w-4" />
                        Investor Workspace
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* ARCHITECTURE TAB */}
            <TabsContent value="architecture" className="space-y-6">
              <Card className="glass-card p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Server className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">System Architecture</h2>
                </div>

                <div className="space-y-6 text-sm">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Service Architecture</h3>
                    <Card className="bg-background/50 p-4 font-mono text-xs overflow-x-auto">
                      <pre className="text-muted-foreground">
{`┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│  Backend API │────────▶│ AI Service  │
│  (React)    │         │  (Express)   │         │  (FastAPI)  │
│  Port: 3000 │         │  Port: 4000  │         │ Port: 8001  │
└──────┬──────┘         └──────┬───────┘         └─────────────┘
       │                       │
       │                       │ Signs risk scores
       └───────────────────────▼──────────────────┐
                    ┌──────────────────────────┐  │
                    │ Smart Contracts (Mantle) │◀─┘
                    │  • RiskOracle            │
                    │  • RevenueFactory        │
                    │  • YieldPool             │
                    └──────────────────────────┘`}
                      </pre>
                    </Card>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-background/50 p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-primary" />
                        Frontend (React + TypeScript)
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• <strong>Framework:</strong> Vite + React 18</li>
                        <li>• <strong>Web3:</strong> wagmi + viem</li>
                        <li>• <strong>UI:</strong> Tailwind CSS + shadcn/ui</li>
                        <li>• <strong>State:</strong> @tanstack/react-query</li>
                        <li>• <strong>Animations:</strong> Framer Motion</li>
                        <li>• <strong>Bundle Size:</strong> 2.3MB (708KB gzipped)</li>
                      </ul>
                    </Card>

                    <Card className="bg-background/50 p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Server className="h-4 w-4 text-primary" />
                        Backend API (Node.js)
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• <strong>Framework:</strong> Express + TypeScript</li>
                        <li>• <strong>Web3:</strong> ethers.js v6</li>
                        <li>• <strong>Storage:</strong> JSON file-based (DataStore)</li>
                        <li>• <strong>Logging:</strong> Pino structured logging</li>
                        <li>• <strong>CORS:</strong> Configurable origins</li>
                        <li>• <strong>Port:</strong> 4000 (configurable via env)</li>
                      </ul>
                    </Card>

                    <Card className="bg-background/50 p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        AI Service (Python)
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• <strong>Framework:</strong> FastAPI + Pydantic</li>
                        <li>• <strong>Algorithm:</strong> Deterministic risk scoring</li>
                        <li>• <strong>Inputs:</strong> Revenue, volatility, missed payments</li>
                        <li>• <strong>Outputs:</strong> Score (0-100) + risk band</li>
                        <li>• <strong>SLA:</strong> &lt;60 seconds response time</li>
                        <li>• <strong>Port:</strong> 8001 (uvicorn)</li>
                      </ul>
                    </Card>

                    <Card className="bg-background/50 p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Smart Contracts (Solidity)
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• <strong>RiskOracle:</strong> Verifies EIP-712 signatures</li>
                        <li>• <strong>RevenueFactory:</strong> Mints RevenueTokens</li>
                        <li>• <strong>YieldPool:</strong> Investor deposits + rewards</li>
                        <li>• <strong>Network:</strong> Mantle Sepolia (Chain ID: 5003)</li>
                        <li>• <strong>Gas Cost:</strong> &lt;$0.01 per transaction</li>
                      </ul>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Business Registration Flow</h3>
                    <Card className="bg-background/50 p-4 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</div>
                        <code>User fills form in Frontend → POST /api/business/register</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</div>
                        <code>Backend stores profile in DataStore (JSON)</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</div>
                        <code>Backend → POST /score-business → AI Service</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</div>
                        <code>AI calculates risk score (0-100) + band (LOW/MEDIUM/HIGH)</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">5</div>
                        <code>Backend signs risk data with EIP-712 (private key)</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">6</div>
                        <code>Backend returns: profile + risk score + signature</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">7</div>
                        <code>User calls createRevenueToken() with signed data</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">8</div>
                        <code>RiskOracle verifies signature on-chain → Mint token</code>
                      </div>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Technology Stack</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Card className="bg-background/50 p-3 text-center">
                        <p className="text-xs font-semibold">React 18</p>
                        <p className="text-xs text-muted-foreground">Frontend UI</p>
                      </Card>
                      <Card className="bg-background/50 p-3 text-center">
                        <p className="text-xs font-semibold">TypeScript</p>
                        <p className="text-xs text-muted-foreground">Type Safety</p>
                      </Card>
                      <Card className="bg-background/50 p-3 text-center">
                        <p className="text-xs font-semibold">wagmi</p>
                        <p className="text-xs text-muted-foreground">Web3 Hooks</p>
                      </Card>
                      <Card className="bg-background/50 p-3 text-center">
                        <p className="text-xs font-semibold">viem</p>
                        <p className="text-xs text-muted-foreground">Ethereum Client</p>
                      </Card>
                      <Card className="bg-background/50 p-3 text-center">
                        <p className="text-xs font-semibold">Express</p>
                        <p className="text-xs text-muted-foreground">Backend API</p>
                      </Card>
                      <Card className="bg-background/50 p-3 text-center">
                        <p className="text-xs font-semibold">FastAPI</p>
                        <p className="text-xs text-muted-foreground">AI Service</p>
                      </Card>
                      <Card className="bg-background/50 p-3 text-center">
                        <p className="text-xs font-semibold">Solidity</p>
                        <p className="text-xs text-muted-foreground">Smart Contracts</p>
                      </Card>
                      <Card className="bg-background/50 p-3 text-center">
                        <p className="text-xs font-semibold">Mantle L2</p>
                        <p className="text-xs text-muted-foreground">Blockchain</p>
                      </Card>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* SMART CONTRACTS TAB */}
            <TabsContent value="contracts" className="space-y-6">
              <Card className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Code className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Smart Contracts</h2>
                </div>

                <div className="space-y-6 text-sm">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-background/50 p-4">
                      <h3 className="font-semibold mb-2">RiskOracle</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Verifies EIP-712 signed risk scores from backend
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <code className="text-xs font-mono">{RISK_ORACLE_ADDRESS.slice(0, 8)}...{RISK_ORACLE_ADDRESS.slice(-6)}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(RISK_ORACLE_ADDRESS)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>

                    <Card className="bg-background/50 p-4">
                      <h3 className="font-semibold mb-2">RevenueFactory</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Mints ERC-20 RevenueTokens backed by business revenue
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <code className="text-xs font-mono">{REVENUE_FACTORY_ADDRESS.slice(0, 8)}...{REVENUE_FACTORY_ADDRESS.slice(-6)}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(REVENUE_FACTORY_ADDRESS)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>

                    <Card className="bg-background/50 p-4">
                      <h3 className="font-semibold mb-2">YieldPool</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Investors deposit USDT, earn yield from revenue streams
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <code className="text-xs font-mono">{PRIMARY_YIELD_POOL.slice(0, 8)}...{PRIMARY_YIELD_POOL.slice(-6)}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(PRIMARY_YIELD_POOL)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Key Functions</h3>
                    <div className="space-y-2">
                      <Card className="bg-background/50 p-3">
                        <div className="flex items-center justify-between">
                          <code className="text-xs font-mono">createRevenueToken(params, riskData)</code>
                          <span className="text-xs text-muted-foreground">RevenueFactory</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mint ERC-20 RevenueToken with AI-verified risk score
                        </p>
                      </Card>

                      <Card className="bg-background/50 p-3">
                        <div className="flex items-center justify-between">
                          <code className="text-xs font-mono">verifyRiskScore(business, score, signature)</code>
                          <span className="text-xs text-muted-foreground">RiskOracle</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Verify EIP-712 signature from backend signer
                        </p>
                      </Card>

                      <Card className="bg-background/50 p-3">
                        <div className="flex items-center justify-between">
                          <code className="text-xs font-mono">deposit(amount)</code>
                          <span className="text-xs text-muted-foreground">YieldPool</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Investor deposits USDT into yield pool
                        </p>
                      </Card>

                      <Card className="bg-background/50 p-3">
                        <div className="flex items-center justify-between">
                          <code className="text-xs font-mono">withdraw(amount)</code>
                          <span className="text-xs text-muted-foreground">YieldPool</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Withdraw principal + yield from pool
                        </p>
                      </Card>

                      <Card className="bg-background/50 p-3">
                        <div className="flex items-center justify-between">
                          <code className="text-xs font-mono">currentAPY()</code>
                          <span className="text-xs text-muted-foreground">YieldPool</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Get real-time annual percentage yield
                        </p>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Network Configuration</h3>
                    <Card className="bg-background/50 p-4 space-y-2 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network:</span>
                        <span>Mantle Sepolia Testnet</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chain ID:</span>
                        <span>5003</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RPC URL:</span>
                        <span>https://rpc.sepolia.mantle.xyz</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Explorer:</span>
                        <a href="https://explorer.sepolia.mantle.xyz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          explorer.sepolia.mantle.xyz
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gas Token:</span>
                        <span>MNT</span>
                      </div>
                    </Card>
                  </div>

                  <div className="flex gap-3">
                    <Button asChild size="sm" variant="outline">
                      <a href="https://faucet.sepolia.mantle.xyz" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Get Testnet MNT
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <a href="https://explorer.sepolia.mantle.xyz" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on Explorer
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* BACKEND API TAB */}
            <TabsContent value="api" className="space-y-6">
              <Card className="glass-card p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Backend API Reference</h2>
                </div>

                <div className="space-y-6 text-sm">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Base URL</h3>
                    <Card className="bg-background/50 p-3 flex items-center justify-between">
                      <code className="text-xs font-mono">http://127.0.0.1:4000</code>
                      <span className="text-xs text-muted-foreground">Local Development</span>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Endpoints</h3>
                    <div className="space-y-3">
                      <Card className="bg-background/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-mono rounded">GET</span>
                          <code className="text-xs font-mono">/health</code>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Health check endpoint</p>
                        <Card className="bg-background/30 p-2 mt-2">
                          <pre className="text-xs font-mono text-muted-foreground">
{`{
  "ok": true,
  "time": 1734956730355
}`}
                          </pre>
                        </Card>
                      </Card>

                      <Card className="bg-background/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs font-mono rounded">POST</span>
                          <code className="text-xs font-mono">/api/business/register</code>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Register new business profile</p>
                        <Card className="bg-background/30 p-2 mt-2">
                          <pre className="text-xs font-mono text-muted-foreground">
{`// Request
{
  "address": "0x123...",
  "name": "SaaS Business",
  "industry": "SaaS",
  "monthlyRevenue": 75000,
  "revenueVolatility": 15,
  "contactEmail": "founder@example.com"
}

// Response
{
  "ok": true,
  "profile": { ...profile },
  "risk": {
    "score": 69,
    "band": "MEDIUM",
    "signature": "0xabc...",
    "rationale": "Revenue-adjusted score..."
  }
}`}
                          </pre>
                        </Card>
                      </Card>

                      <Card className="bg-background/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-mono rounded">GET</span>
                          <code className="text-xs font-mono">/api/business/:address/risk</code>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Get current risk score for business</p>
                        <Card className="bg-background/30 p-2 mt-2">
                          <pre className="text-xs font-mono text-muted-foreground">
{`{
  "score": 69,
  "band": "MEDIUM",
  "bandIndex": 1,
  "lastUpdated": 1734956730,
  "signature": "0xabc...",
  "rationale": "Revenue-adjusted score 69.0..."
}`}
                          </pre>
                        </Card>
                      </Card>

                      <Card className="bg-background/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs font-mono rounded">POST</span>
                          <code className="text-xs font-mono">/api/business/:address/risk</code>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Refresh risk score with updated parameters</p>
                        <Card className="bg-background/30 p-2 mt-2">
                          <pre className="text-xs font-mono text-muted-foreground">
{`// Request (optional overrides)
{
  "monthlyRevenue": 85000,
  "revenueVolatility": 12,
  "missedPayments": 0,
  "useVerifiedData": true
}

// Response
{
  "record": {
    "score": 74,
    "band": "MEDIUM",
    "signature": "0xdef...",
    "verified": true
  }
}`}
                          </pre>
                        </Card>
                      </Card>

                      <Card className="bg-background/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-mono rounded">GET</span>
                          <code className="text-xs font-mono">/api/pools</code>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Get all available YieldPools with metrics</p>
                        <Card className="bg-background/30 p-2 mt-2">
                          <pre className="text-xs font-mono text-muted-foreground">
{`[
  {
    "id": "pool-1",
    "name": "SaaS Revenue Pool",
    "yieldPool": "0x9187...",
    "targetApy": 12.5,
    "metrics": {
      "apy": 13.2,
      "tvl": 450000,
      "investors": 42,
      "risk": { "score": 69, "band": "MEDIUM" }
    }
  }
]`}
                          </pre>
                        </Card>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">AI Service Integration</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Backend calls AI service at <code>http://127.0.0.1:8001</code> for risk scoring
                    </p>
                    <Card className="bg-background/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-500 text-xs font-mono rounded">POST</span>
                        <code className="text-xs font-mono">/score-business</code>
                        <span className="text-xs text-muted-foreground ml-auto">AI Service</span>
                      </div>
                      <Card className="bg-background/30 p-2 mt-2">
                        <pre className="text-xs font-mono text-muted-foreground">
{`// Request
{
  "address": "0x123...",
  "monthlyRevenue": 75000,
  "revenueVolatility": 15,
  "missedPayments": 0,
  "useVerifiedData": false
}

// Response (< 60 seconds)
{
  "score": 69,
  "band": "MEDIUM",
  "rationale": "Revenue-adjusted score 69.0 based on $75,000...",
  "verified": false
}`}
                        </pre>
                      </Card>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Environment Variables</h3>
                    <Card className="bg-background/50 p-4 space-y-2 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PORT</span>
                        <span>4000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">AI_SERVICE_URL</span>
                        <span>http://127.0.0.1:8001</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RISK_SIGNER_PRIVATE_KEY</span>
                        <span className="text-amber-500">Required (keep secret!)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RISK_ORACLE_ADDRESS</span>
                        <span>Contract address</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ALLOWED_ORIGINS</span>
                        <span>CORS allowed domains</span>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* DEPLOYMENT TAB */}
            <TabsContent value="deployment" className="space-y-6">
              <Card className="glass-card p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Rocket className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Deployment Guide</h2>
                </div>

                <div className="space-y-6 text-sm">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Local Development</h3>
                    <Card className="bg-background/50 p-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold mb-2">1. Start All Services</p>
                        <Card className="bg-background/30 p-3">
                          <code className="text-xs font-mono">./start-services.sh</code>
                        </Card>
                        <p className="text-xs text-muted-foreground mt-1">
                          Starts AI service (8001), backend (4000), frontend (3000)
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold mb-2">2. Test Integration</p>
                        <Card className="bg-background/30 p-3">
                          <code className="text-xs font-mono">./test-integration.sh</code>
                        </Card>
                        <p className="text-xs text-muted-foreground mt-1">
                          Verifies all services are running and connected
                        </p>
                      </div>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Production Deployment</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-background/50 p-4">
                        <h4 className="font-semibold mb-2">Option 1: Render.com</h4>
                        <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                          <li>• Deploy AI service first (Python/FastAPI)</li>
                          <li>• Deploy backend with AI service URL</li>
                          <li>• Deploy frontend on Vercel</li>
                          <li>• See RENDER-DEPLOYMENT.md for details</li>
                        </ul>
                        <Button asChild size="sm" variant="outline">
                          <a href="https://render.com" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-3 w-3" />
                            Render.com
                          </a>
                        </Button>
                      </Card>

                      <Card className="bg-background/50 p-4">
                        <h4 className="font-semibold mb-2">Option 2: Docker Compose</h4>
                        <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                          <li>• All services in one compose file</li>
                          <li>• PostgreSQL for production storage</li>
                          <li>• Nginx reverse proxy</li>
                          <li>• See SERVICE-INTEGRATION.md</li>
                        </ul>
                        <Button asChild size="sm" variant="outline">
                          <a href="https://docs.docker.com/compose" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-3 w-3" />
                            Docker Docs
                          </a>
                        </Button>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Environment Configuration</h3>
                    <div className="space-y-3">
                      <Card className="bg-background/50 p-3">
                        <p className="text-xs font-semibold mb-2">Frontend (.env.local)</p>
                        <Card className="bg-background/30 p-2">
                          <pre className="text-xs font-mono text-muted-foreground">
{`VITE_BACKEND_API_URL=https://api.liquifi.io
VITE_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
VITE_REVENUE_FACTORY_ADDRESS=0x6f00...
VITE_RISK_ORACLE_ADDRESS=0x4938...
VITE_PRIMARY_YIELD_POOL=0x9187...`}
                          </pre>
                        </Card>
                      </Card>

                      <Card className="bg-background/50 p-3">
                        <p className="text-xs font-semibold mb-2">Backend (.env)</p>
                        <Card className="bg-background/30 p-2">
                          <pre className="text-xs font-mono text-muted-foreground">
{`PORT=4000
AI_SERVICE_URL=https://ai.liquifi.io
RISK_SIGNER_PRIVATE_KEY=0x...
RISK_ORACLE_ADDRESS=0x4938...
ALLOWED_ORIGINS=https://app.liquifi.io`}
                          </pre>
                        </Card>
                      </Card>

                      <Card className="bg-background/50 p-3">
                        <p className="text-xs font-semibold mb-2">AI Service (.env)</p>
                        <Card className="bg-background/30 p-2">
                          <pre className="text-xs font-mono text-muted-foreground">
{`AI_SERVICE_PORT=8001
AI_LOG_LEVEL=INFO`}
                          </pre>
                        </Card>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Documentation Files</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Card className="bg-primary/5 border-primary/20 p-3">
                        <p className="text-xs font-semibold mb-1">SERVICE-INTEGRATION.md</p>
                        <p className="text-xs text-muted-foreground">
                          Complete service integration guide, architecture, and testing
                        </p>
                      </Card>
                      <Card className="bg-primary/5 border-primary/20 p-3">
                        <p className="text-xs font-semibold mb-1">RENDER-DEPLOYMENT.md</p>
                        <p className="text-xs text-muted-foreground">
                          Step-by-step Render.com deployment with troubleshooting
                        </p>
                      </Card>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* FAQ TAB */}
            <TabsContent value="faq" className="space-y-6">
              <Card className="glass-card p-6 space-y-6">
                <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">How does Liquifi differ from traditional lending?</h3>
                    <p className="text-sm text-muted-foreground">
                      Traditional lending requires collateral (assets you pledge). Liquifi uses AI-powered risk assessment
                      of your revenue history instead. No collateral needed—just proof of consistent revenue.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">What is a RevenueToken?</h3>
                    <p className="text-sm text-muted-foreground">
                      A RevenueToken is an ERC-20 token backed by your future revenue streams. When you mint a RevenueToken,
                      you're selling the rights to a portion of your future revenue in exchange for instant capital.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">How is the risk score calculated?</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI service analyzes: (1) Monthly revenue volume, (2) Revenue volatility (how consistent),
                      (3) Payment history (missed payments). The algorithm is deterministic and returns a score from 0-100
                      with a risk band (LOW/MEDIUM/HIGH). See the Architecture tab for the formula.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Why is the backend signer needed?</h3>
                    <p className="text-sm text-muted-foreground">
                      The backend holds a private key to sign risk scores using EIP-712. Smart contracts verify this signature
                      on-chain, proving the risk score came from our trusted AI oracle. This prevents users from faking risk scores.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">What are YieldPools for investors?</h3>
                    <p className="text-sm text-muted-foreground">
                      YieldPools are smart contracts where investors deposit USDT and earn yield from revenue streams of multiple
                      businesses. It's like a mutual fund for revenue financing—diversified exposure with real-time APY tracking.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Why Mantle L2 instead of Ethereum mainnet?</h3>
                    <p className="text-sm text-muted-foreground">
                      Mantle L2 provides: (1) Gas fees &lt;$0.01 per transaction (vs $5-50 on mainnet), (2) Faster finality,
                      (3) Full EVM compatibility. This makes micro-revenue streams economically viable.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Can I refresh my risk score?</h3>
                    <p className="text-sm text-muted-foreground">
                      Yes! Click "Refresh Risk Score" in the Business workspace. You can update your revenue data, and the AI
                      will recalculate your score in &lt;60 seconds. New signatures are valid for 1 hour.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Is this production-ready?</h3>
                    <p className="text-sm text-muted-foreground">
                      Currently on Mantle Sepolia testnet for testing. For production: (1) Deploy on Mantle mainnet,
                      (2) Use PostgreSQL instead of JSON storage, (3) Implement proper key management (AWS Secrets/Vault),
                      (4) Add rate limiting and monitoring. See RENDER-DEPLOYMENT.md for the production checklist.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">How do I get support?</h3>
                    <p className="text-sm text-muted-foreground">
                      Check the Documentation files in the GitHub repository (SERVICE-INTEGRATION.md, RENDER-DEPLOYMENT.md)
                      or join our community channels. All services have health check endpoints for debugging.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="glass-card p-6 text-center space-y-4">
            <h3 className="text-xl font-semibold">Additional Resources</h3>
            <p className="text-muted-foreground">
              Explore these guides for detailed information
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild size="sm">
                <a href="https://docs.mantle.xyz" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Mantle Docs
                </a>
              </Button>
              <Button variant="outline" asChild size="sm">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  GitHub Repo
                </a>
              </Button>
              <Button variant="outline" asChild size="sm">
                <a href="https://wagmi.sh" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  wagmi Docs
                </a>
              </Button>
              <Button variant="outline" asChild size="sm">
                <a href="https://fastapi.tiangolo.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  FastAPI Docs
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Docs;
