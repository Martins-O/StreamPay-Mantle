import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Wallet, TrendingUp, Activity, History } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StreamTable from '@/components/StreamTable';
import CreateStreamForm from '@/components/CreateStreamForm';
import StreamChart from '@/components/StreamChart';
import TransactionTracker from '@/components/TransactionTracker';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useStreams, formatTokenAmount } from '@/lib/hooks';

interface Transaction {
  hash: `0x${string}`;
  description: string;
  timestamp: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { streams, isLoading, refetch } = useStreams(address);
  const [totalStreamed, setTotalStreamed] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    if (streams.length > 0) {
      const total = streams.reduce((acc, stream) => {
        return acc + Number(formatTokenAmount(stream.claimedAmount, 18));
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
    return null;
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
