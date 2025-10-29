import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, Code, Wallet, Zap, ExternalLink, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { STREAM_MANAGER_ADDRESS, IS_STREAM_MANAGER_CONFIGURED } from '@/lib/contract';

const Docs = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const managerAddressDisplay = IS_STREAM_MANAGER_CONFIGURED
    ? `${STREAM_MANAGER_ADDRESS.slice(0, 6)}...${STREAM_MANAGER_ADDRESS.slice(-4)}`
    : 'Not configured';

  return (
    <div className="min-h-screen pb-20">
      <AnimatedBackground />
      <Navbar />

      <main className="pt-24 px-4">
        <div className="container mx-auto max-w-5xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <Book className="h-16 w-16 text-primary mx-auto" />
            <h1 className="text-4xl font-bold gradient-text">Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about StreamPay Mantle
            </p>
          </motion.div>

          <Tabs defaultValue="getting-started" className="space-y-6">
            <TabsList className="glass-card border border-border/50 p-1 grid grid-cols-4 w-full">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="smart-contracts">Smart Contracts</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="getting-started" className="space-y-6">
              <Card className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Getting Started</h2>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">1. Connect Your Wallet</h3>
                    <p className="text-muted-foreground">
                      Click "Connect Wallet" in the top right corner. StreamPay supports MetaMask and Mantle Wallet.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">2. Configure Mantle Testnet</h3>
                    <p className="text-muted-foreground mb-2">Add Mantle Testnet to your wallet:</p>
                    <Card className="bg-background/50 p-4 space-y-2 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network Name:</span>
                        <span>Mantle Testnet</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RPC URL:</span>
                        <span>https://rpc.testnet.mantle.xyz</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chain ID:</span>
                        <span>5003</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency:</span>
                        <span>MNT</span>
                      </div>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">3. Get Testnet MNT</h3>
                    <p className="text-muted-foreground mb-2">
                      Request testnet tokens from the Mantle faucet:
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <a href="https://faucet.testnet.mantle.xyz" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit Faucet
                      </a>
                    </Button>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">4. Create Your First Stream</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Go to Dashboard → Create Stream</li>
                      <li>Enter receiver address and token details</li>
                      <li>Approve token spending (one-time)</li>
                      <li>Set amount and duration</li>
                      <li>Confirm transaction in your wallet</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="smart-contracts" className="space-y-6">
              <Card className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Code className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Smart Contracts</h2>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">StreamManager Contract</h3>
                    <p className="text-muted-foreground mb-2">
                      The main contract for creating and managing payment streams.
                    </p>
                    <Card className="bg-background/50 p-4">
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-mono">{managerAddressDisplay}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!IS_STREAM_MANAGER_CONFIGURED}
                          onClick={() =>
                            IS_STREAM_MANAGER_CONFIGURED && copyToClipboard(STREAM_MANAGER_ADDRESS)
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Key Functions</h3>
                    <div className="space-y-2">
                      <Card className="bg-background/50 p-3">
                        <code className="text-xs font-mono">createStream(recipient, token, amount, duration)</code>
                        <p className="text-xs text-muted-foreground mt-1">Create a new payment stream</p>
                      </Card>
                      <Card className="bg-background/50 p-3">
                        <code className="text-xs font-mono">claim(streamId)</code>
                        <p className="text-xs text-muted-foreground mt-1">Claim available tokens from a stream</p>
                      </Card>
                      <Card className="bg-background/50 p-3">
                        <code className="text-xs font-mono">cancelStream(streamId)</code>
                        <p className="text-xs text-muted-foreground mt-1">Cancel an active stream</p>
                      </Card>
                      <Card className="bg-background/50 p-3">
                        <code className="text-xs font-mono">getStream(streamId)</code>
                        <p className="text-xs text-muted-foreground mt-1">Inspect a specific stream</p>
                      </Card>
                      <Card className="bg-background/50 p-3">
                        <code className="text-xs font-mono">getSenderStreams(address)</code>
                        <p className="text-xs text-muted-foreground mt-1">List stream IDs created by an address</p>
                      </Card>
                      <Card className="bg-background/50 p-3">
                        <code className="text-xs font-mono">getRecipientStreams(address)</code>
                        <p className="text-xs text-muted-foreground mt-1">List stream IDs where the address is recipient</p>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Security Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Only sender can cancel streams</li>
                      <li>Only receiver can claim tokens</li>
                      <li>Linear vesting with per-second precision</li>
                      <li>Automatic refunds on cancellation</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="integration" className="space-y-6">
              <Card className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Integration Guide</h2>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Install Dependencies</h3>
                    <Card className="bg-background/50 p-4 relative">
                      <pre className="text-xs font-mono overflow-x-auto">
                        {`npm install wagmi viem @tanstack/react-query`}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard('npm install wagmi viem @tanstack/react-query')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Setup Wagmi Config</h3>
                    <Card className="bg-background/50 p-4 relative">
                      <pre className="text-xs font-mono overflow-x-auto">
{`import { createConfig, http } from 'wagmi'
import { mantleTestnet } from 'wagmi/chains'

const config = createConfig({
  chains: [mantleTestnet],
  transports: {
    [mantleTestnet.id]: http()
  }
})`}
                      </pre>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Configure Environment</h3>
                    <Card className="bg-background/50 p-4 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">VITE_STREAM_MANAGER_ADDRESS</span>
                        <span>0x...</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">VITE_STREAM_VAULT_ADDRESS</span>
                        <span>0x...</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">VITE_MOCK_USDT_ADDRESS</span>
                        <span>0x...</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">VITE_WALLETCONNECT_PROJECT_ID</span>
                        <span>Optional</span>
                      </div>
                    </Card>
                    <p className="text-xs text-muted-foreground mt-2">
                      The app runs in read-only mode if these addresses are not set.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Example: Create Stream</h3>
                    <Card className="bg-background/50 p-4">
                      <pre className="text-xs font-mono overflow-x-auto">
{`const { writeContractAsync } = useWriteContract()

await writeContractAsync({
  address: STREAM_MANAGER_ADDRESS,
  abi: STREAM_MANAGER_ABI,
  functionName: 'createStream',
  args: [recipient, token, amount, duration]
})`}
                      </pre>
                    </Card>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              <Card className="glass-card p-6 space-y-6">
                <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">How do payment streams work?</h3>
                    <p className="text-sm text-muted-foreground">
                      Payment streams release tokens continuously per second from sender to receiver. The receiver can claim accumulated tokens at any time, and the sender can cancel to stop the stream and reclaim unstreamed tokens.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">What tokens are supported?</h3>
                    <p className="text-sm text-muted-foreground">
                      Any ERC-20 token on Mantle testnet can be streamed. You'll need to approve the StreamManager contract before creating a stream.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Can I cancel a stream?</h3>
                    <p className="text-sm text-muted-foreground">
                      Yes, the sender can cancel an active stream at any time. Already-streamed tokens go to the receiver, and remaining tokens are returned to the sender.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Is there a minimum duration?</h3>
                    <p className="text-sm text-muted-foreground">
                      No minimum duration, but very short streams may have higher gas costs relative to the value streamed. We recommend at least 1 hour for efficiency.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">How do I get support?</h3>
                    <p className="text-sm text-muted-foreground">
                      Join our community on Discord or open an issue on GitHub. Links are available in the navbar.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="glass-card p-6 text-center space-y-4">
            <h3 className="text-xl font-semibold">Need More Help?</h3>
            <p className="text-muted-foreground">
              Check out these additional resources
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <a href="https://docs.mantle.xyz" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Mantle Docs
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  GitHub
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Discord
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
