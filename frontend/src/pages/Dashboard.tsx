import { useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Activity, History, ShieldAlert, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StreamTable from '@/components/StreamTable';
import CreateStreamForm from '@/components/CreateStreamForm';
import StreamChart from '@/components/StreamChart';
import TransactionTracker from '@/components/TransactionTracker';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useStreams, formatTokenAmount } from '@/lib/hooks';
import { toast } from 'sonner';
import { IS_STREAM_MANAGER_CONFIGURED } from '@/lib/contract';

interface Transaction {
  hash: `0x${string}`;
  description: string;
  timestamp: number;
}

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending: isConnecting, pendingConnector, error: connectError } = useConnect();
  const { streams, isLoading, error, refetch } = useStreams(address);
  const [totalStreamed, setTotalStreamed] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (streams.length > 0) {
      const total = streams.reduce((acc, stream) => {
        const decimals = stream.tokenDecimals ?? 18;
        const claimed = parseFloat(formatTokenAmount(stream.claimedAmount, decimals));
        return acc + (Number.isFinite(claimed) ? claimed : 0);
      }, 0);
      setTotalStreamed(total);
    }
  }, [streams]);

  const activeStreams = streams.filter(s => s.isActive);
  const featuredStream = activeStreams.length > 0 ? activeStreams[0] : streams[0];

  const handleTransactionSubmit = (hash: string, description: string) => {
    setTransactions(prev => [...prev, {
      hash: hash as `0x${string}`,
      description,
      timestamp: Date.now(),
    }]);
  };

  const handleRemoveTransaction = (hash: string) => {
    setTransactions(prev => prev.filter(tx => tx.hash !== hash));
  };

  if (!isConnected) {
    const handleConnectorSelect = async (connector: (typeof connectors)[number]) => {
      try {
        await connectAsync({ connector });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to connect wallet');
      }
    };

    return (
      <div className="min-h-screen">
        <AnimatedBackground />
        <Navbar />

        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-md w-full"
          >
            <Card className="glass-card p-12 text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <ShieldAlert className="h-10 w-10 text-primary" />
              </div>

              <h2 className="text-2xl font-bold">Connect Your Wallet</h2>

              <p className="text-muted-foreground">
                Please connect your wallet to access the StreamPay dashboard and manage your payment streams.
              </p>

              <div className="space-y-2">
                {connectors.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No wallet connectors available. Please refresh or check your configuration.
                  </p>
                )}

                {connectors.map((connector) => {
                  const isUnavailable = !connector.ready;
                  const isLoading = isConnecting && pendingConnector?.id === connector.id;

                  return (
                    <Button
                      key={connector.id}
                      onClick={() => handleConnectorSelect(connector)}
                      disabled={isUnavailable || isLoading}
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Wallet className="mr-2 h-5 w-5" />
                      )}
                      {connector.name}
                      {isUnavailable ? ' (Unavailable)' : ''}
                    </Button>
                  );
                })}
              </div>

              {connectError && (
                <p className="text-xs text-destructive">
                  {connectError.message || 'Failed to connect wallet. Try another option.'}
                </p>
              )}
            </Card>
          </motion.div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <AnimatedBackground />
      <Navbar />

      <main className="pt-24 px-4">
        <div className="container mx-auto max-w-7xl space-y-8">
          {/* Header Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <Card className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Address</p>
                  <p className="font-mono text-sm font-semibold">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Streams</p>
                  <p className="text-2xl font-bold">{activeStreams.length}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Streamed</p>
                  <motion.p
                    key={totalStreamed}
                    initial={{ scale: 1.2, color: 'hsl(171, 100%, 45%)' }}
                    animate={{ scale: 1, color: 'hsl(210, 40%, 98%)' }}
                    className="text-2xl font-bold font-mono"
                  >
                    {totalStreamed.toFixed(4)}
                  </motion.p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {(!IS_STREAM_MANAGER_CONFIGURED || error) && (
              <Card className="glass-card p-4 border-yellow-500/30 bg-yellow-500/5 mb-6">
                <p className="text-sm text-foreground font-semibold mb-1">
                  {IS_STREAM_MANAGER_CONFIGURED
                    ? 'Unable to fetch streams'
                    : 'Stream manager contract not configured'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {IS_STREAM_MANAGER_CONFIGURED
                    ? error?.message ?? 'Please try again later.'
                    : 'Set VITE_STREAM_MANAGER_ADDRESS (and related addresses) in your environment, then reload.'}
                </p>
              </Card>
            )}

            <Tabs defaultValue="streams" className="space-y-6">
              <TabsList className="glass-card border border-border/50 p-1 grid grid-cols-4 w-full">
                <TabsTrigger value="streams" className="data-[state=active]:bg-primary/20">
                  Active
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-primary/20">
                  History
                </TabsTrigger>
                <TabsTrigger value="create" className="data-[state=active]:bg-primary/20">
                  Create
                </TabsTrigger>
                {featuredStream && (
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20">
                    Analytics
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="streams" className="space-y-6">
                {isLoading ? (
                  <Card className="glass-card p-12 text-center">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-primary/20 rounded w-1/4 mx-auto" />
                      <div className="h-4 bg-primary/20 rounded w-1/2 mx-auto" />
                    </div>
                  </Card>
                ) : (
                  <StreamTable
                    streams={streams}
                    userAddress={address!}
                    onRefetch={refetch}
                    onTransactionSubmit={handleTransactionSubmit}
                  />
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                {isLoading ? (
                  <Card className="glass-card p-12 text-center">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-primary/20 rounded w-1/4 mx-auto" />
                      <div className="h-4 bg-primary/20 rounded w-1/2 mx-auto" />
                    </div>
                  </Card>
                ) : (
                  <StreamTable
                    streams={streams}
                    userAddress={address!}
                    onRefetch={refetch}
                    showHistory={true}
                  />
                )}
              </TabsContent>

              <TabsContent value="create">
                <CreateStreamForm
                  onSuccess={refetch}
                  onTransactionSubmit={handleTransactionSubmit}
                />
              </TabsContent>

              {featuredStream && (
                <TabsContent value="analytics">
                  <StreamChart stream={featuredStream} />
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        </div>
      </main>

      <TransactionTracker
        transactions={transactions}
        onRemove={handleRemoveTransaction}
      />

      <Footer />
    </div>
  );
};

export default Dashboard;
