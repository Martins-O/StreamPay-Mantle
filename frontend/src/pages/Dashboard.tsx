import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, useConnect, useSwitchChain, useReadContracts } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Activity, History, ShieldAlert, Loader2, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StreamTable from '@/components/StreamTable';
import CreateStreamForm from '@/components/CreateStreamForm';
import TransactionTracker from '@/components/TransactionTracker';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useStreams, formatTokenAmount } from '@/lib/hooks';
import { toast } from 'sonner';
import {
  ERC20_ABI,
  IS_STREAM_MANAGER_CONFIGURED,
  STREAM_TOKEN_ADDRESS,
  STREAM_VAULT_ADDRESS,
  STREAM_VAULT_ABI,
  ZERO_ADDRESS,
} from '@/lib/contract';
import { TARGET_CHAIN_ID, TARGET_CHAIN_NAME } from '@/lib/web3';
import { useNotifications } from '@/contexts/useNotifications';

const StreamChart = lazy(() => import('@/components/StreamChart'));

interface Transaction {
  hash: `0x${string}`;
  description: string;
  timestamp: number;
}

type TabKey = 'streams' | 'history' | 'create' | 'analytics';

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending: isConnecting, pendingConnector, error: connectError } = useConnect();
  const { streams, isLoading, error, refetch } = useStreams(address);
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingNetwork } = useSwitchChain();
  const [activeTab, setActiveTab] = useState<TabKey>('streams');
  const [totalStreamed, setTotalStreamed] = useState('0');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { processReminderSnapshot } = useNotifications();

  const trackedTokens = useMemo(() => {
    const entries = new Map<string, { address: `0x${string}`; decimals?: number; symbol?: string }>();
    for (const stream of streams) {
      for (const token of stream.tokens) {
        const key = token.token.toLowerCase();
        if (!entries.has(key)) {
          entries.set(key, {
            address: token.token,
            decimals: token.tokenDecimals,
            symbol: token.tokenSymbol,
          });
        }
      }
    }

    if (STREAM_TOKEN_ADDRESS !== ZERO_ADDRESS) {
      const key = STREAM_TOKEN_ADDRESS.toLowerCase();
      if (!entries.has(key)) {
        entries.set(key, {
          address: STREAM_TOKEN_ADDRESS,
        });
      }
    }

    return Array.from(entries.values());
  }, [streams]);

  const tokensNeedingMetadata = useMemo(
    () => trackedTokens.filter((token) => token.decimals === undefined || !token.symbol),
    [trackedTokens],
  );

  const metadataContracts = useMemo(() => {
    if (tokensNeedingMetadata.length === 0) {
      return [] as const;
    }

    return tokensNeedingMetadata.flatMap((token) => ([
      {
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'decimals',
      } as const,
      {
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'symbol',
      } as const,
    ]));
  }, [tokensNeedingMetadata]);

  const { data: metadataResults } = useReadContracts({
    contracts: metadataContracts,
    query: {
      enabled: metadataContracts.length > 0,
    },
  });

  const metadataMap = useMemo(() => {
    const map = new Map<string, { decimals?: number; symbol?: string }>();
    if (!metadataResults || tokensNeedingMetadata.length === 0) {
      return map;
    }

    for (let i = 0; i < tokensNeedingMetadata.length; i++) {
      const token = tokensNeedingMetadata[i];
      const decimalsResult = metadataResults[i * 2];
      const symbolResult = metadataResults[i * 2 + 1];

      const decimals = decimalsResult?.status === 'success'
        ? Number(decimalsResult.result as bigint)
        : undefined;
      const symbol = symbolResult?.status === 'success'
        ? (symbolResult.result as string)
        : undefined;

      map.set(token.address.toLowerCase(), {
        decimals,
        symbol,
      });
    }

    return map;
  }, [metadataResults, tokensNeedingMetadata]);

  const resolvedTokens = useMemo(() => trackedTokens.map((token) => {
    const metadata = metadataMap.get(token.address.toLowerCase());
    const decimals = metadata?.decimals ?? token.decimals ?? 18;
    const symbol = metadata?.symbol ?? token.symbol ?? `${token.address.slice(0, 6)}...${token.address.slice(-4)}`;

    return {
      address: token.address,
      decimals,
      symbol,
    };
  }), [trackedTokens, metadataMap]);

  const vaultContracts = useMemo(() => {
    if (STREAM_VAULT_ADDRESS === ZERO_ADDRESS || resolvedTokens.length === 0) {
      return [] as const;
    }

    return resolvedTokens.map((token) => ({
      address: STREAM_VAULT_ADDRESS,
      abi: STREAM_VAULT_ABI,
      functionName: 'getTotalManaged',
      args: [token.address],
    }) as const);
  }, [resolvedTokens]);

  const { data: vaultResults } = useReadContracts({
    contracts: vaultContracts,
    query: {
      enabled: STREAM_VAULT_ADDRESS !== ZERO_ADDRESS && vaultContracts.length > 0,
      refetchOnWindowFocus: false,
    },
  });

  const vaultSummaries = useMemo(() => resolvedTokens.map((token, index) => {
    const vaultEntry = vaultResults?.[index];
    const totalManaged = vaultEntry?.status === 'success' ? (vaultEntry.result as bigint) : 0n;

    return {
      address: token.address,
      decimals: token.decimals,
      symbol: token.symbol,
      totalManaged,
    };
  }), [resolvedTokens, vaultResults]);

  const isWrongNetwork = useMemo(() => {
    if (!isConnected) return false;
    return chainId !== undefined && chainId !== null && chainId !== TARGET_CHAIN_ID;
  }, [chainId, isConnected]);

  const handleSwitchNetwork = async () => {
    try {
      await switchChainAsync({ chainId: TARGET_CHAIN_ID });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Unable to switch automatically. Please change your wallet to ${TARGET_CHAIN_NAME}.`,
      );
    }
  };

  useEffect(() => {
    if (streams.length === 0) {
      setTotalStreamed('0');
      return;
    }

    const tokenTotals = new Map<string, { amount: bigint; decimals: number; symbol: string }>();

    for (const stream of streams) {
      for (const token of stream.tokens) {
        const key = token.token.toLowerCase();
        const symbol = token.tokenSymbol ?? `${token.token.slice(0, 6)}...${token.token.slice(-4)}`;
        const decimals = token.tokenDecimals ?? 18;
        const entry = tokenTotals.get(key);
        if (entry) {
          entry.amount += token.claimedAmount;
          entry.decimals = decimals;
          entry.symbol = symbol;
        } else {
          tokenTotals.set(key, { amount: token.claimedAmount, decimals, symbol });
        }
      }
    }

    if (tokenTotals.size === 0) {
      setTotalStreamed('0');
      return;
    }

    const summary = Array.from(tokenTotals.values())
      .map(({ amount, decimals, symbol }) => `${formatTokenAmount(amount, decimals)} ${symbol}`)
      .join(' · ');

    setTotalStreamed(summary);
  }, [streams]);

  useEffect(() => {
    if (streams.length > 0) {
      processReminderSnapshot(streams).catch((err) => console.error('Reminder processing failed', err));
    }
  }, [streams, processReminderSnapshot]);

  const activeStreams = streams.filter(s => s.isActive);
  const featuredStream = activeStreams.length > 0 ? activeStreams[0] : streams[0];

  const primaryTokenMeta = useMemo(() => {
    if (STREAM_TOKEN_ADDRESS === ZERO_ADDRESS) {
      return undefined;
    }

    const target = STREAM_TOKEN_ADDRESS.toLowerCase();
    const hit = resolvedTokens.find((token) => token.address.toLowerCase() === target);
    return hit;
  }, [resolvedTokens]);

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

  const handleExportStreamsCsv = () => {
    if (streams.length === 0) {
      toast.info('No streams to export yet. Create a stream to populate data.');
      return;
    }

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const header = [
      'Stream ID',
      'Sender',
      'Recipient',
      'Token Address',
      'Token Symbol',
      'Total Amount',
      'Claimed Amount',
      'Current Claimable',
      'Start Time (UTC)',
      'Duration (secs)',
      'Status',
    ];

    const rows = streams.flatMap((stream) => {
      const status = !stream.isActive
        ? 'Ended'
        : stream.isPaused
          ? 'Paused'
          : 'Active';
      const startIso = stream.startTime > 0n
        ? new Date(Number(stream.startTime) * 1000).toISOString()
        : '';

      if (stream.tokens.length === 0) {
        const fallbackRow = [
          stream.id.toString(),
          stream.sender,
          stream.recipient,
          '—',
          '—',
          '0',
          '0',
          '0',
          startIso,
          stream.duration.toString(),
          status,
        ];
        return [fallbackRow.map((value) => escapeCsv(value)).join(',')];
      }

      return stream.tokens.map((token) => {
        const decimals = token.tokenDecimals ?? 18;
        const symbol = token.tokenSymbol ?? `${token.token.slice(0, 6)}...${token.token.slice(-4)}`;
        const values = [
          stream.id.toString(),
          stream.sender,
          stream.recipient,
          token.token,
          symbol,
          formatTokenAmount(token.totalAmount, decimals),
          formatTokenAmount(token.claimedAmount, decimals),
          formatTokenAmount(token.claimableAmount, decimals),
          startIso,
          stream.duration.toString(),
          status,
        ];

        return values.map((value) => escapeCsv(value)).join(',');
      });
    });

    const csvContent = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `streampay-streams-${Date.now()}.csv`;
    downloadLink.style.visibility = 'hidden';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    toast.success('Stream data exported as CSV');
  };

  if (!isConnected) {
    const handleConnectorSelect = async (connector: (typeof connectors)[number]) => {
      if (!connector.ready && connector.id !== 'walletConnect') {
        toast.info(`${connector.name} looks inactive. We’ll try to connect anyway—make sure the extension is enabled.`);
      }

      if (connector.id === 'walletConnect' && !import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
        toast.error('Set VITE_WALLETCONNECT_PROJECT_ID in .env.local to enable WalletConnect.');
        return;
      }

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
                  const isLoading = isConnecting && pendingConnector?.id === connector.id;

                  return (
                    <Button
                      key={connector.id}
                      onClick={() => handleConnectorSelect(connector)}
                      disabled={isLoading}
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Wallet className="mr-2 h-5 w-5" />
                      )}
                      {connector.name}
                      {!connector.ready && connector.id !== 'walletConnect' ? ' (Unavailable)' : ''}
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
            className="grid md:grid-cols-4 gap-6"
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
                    initial={{ scale: 1.05, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-bold font-mono"
                  >
                    {totalStreamed}
                  </motion.p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <History className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground">Vault Managed</p>
                  {STREAM_VAULT_ADDRESS === ZERO_ADDRESS ? (
                    <p className="text-xs text-muted-foreground">
                      Configure `VITE_STREAM_VAULT_ADDRESS` to view managed balances.
                    </p>
                  ) : vaultSummaries.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No tracked token balances yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {vaultSummaries.map((entry) => (
                        <p key={entry.address} className="font-mono text-sm">
                          {formatTokenAmount(entry.totalManaged, entry.decimals)} {entry.symbol}
                        </p>
                      ))}
                    </div>
                  )}
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
              <Card className="glass-card p-4 border-yellow-500/30 bg-yellow-500/5 mb-4">
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

            {isWrongNetwork && (
              <Card className="glass-card p-4 border-yellow-500/40 bg-yellow-500/10 mb-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Wrong Network</p>
                    <p className="text-xs text-muted-foreground">
                      Switch your wallet to {TARGET_CHAIN_NAME} (chain ID {TARGET_CHAIN_ID}) to interact with StreamPay.
                    </p>
                  </div>
                  <Button
                    onClick={handleSwitchNetwork}
                    disabled={isSwitchingNetwork}
                    size="sm"
                    className="animated-gradient"
                  >
                    {isSwitchingNetwork ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Switching...
                      </>
                    ) : (
                      'Switch Network'
                    )}
                  </Button>
                </div>
              </Card>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)} className="space-y-6">
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
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Manage live streams and export your payment history.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportStreamsCsv}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>

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
                    isNetworkReady={!isWrongNetwork}
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
                    isNetworkReady={!isWrongNetwork}
                    showHistory={true}
                  />
                )}
              </TabsContent>

              <TabsContent value="create">
                <CreateStreamForm
                  onSuccess={refetch}
                  onTransactionSubmit={handleTransactionSubmit}
                  isNetworkReady={!isWrongNetwork}
                  onSwitchNetwork={handleSwitchNetwork}
                  isSwitchingNetwork={isSwitchingNetwork}
                />
              </TabsContent>

              {featuredStream && (
                <TabsContent value="analytics">
                  {activeTab === 'analytics' ? (
                    <Suspense
                      fallback={(
                        <Card className="glass-card p-12 text-center space-y-3">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Loading analytics...</p>
                        </Card>
                      )}
                    >
                      <StreamChart stream={featuredStream} />
                    </Suspense>
                  ) : (
                    <Card className="glass-card p-6 text-sm text-muted-foreground">
                      Open the Analytics tab to load real-time insights for the highlighted stream.
                    </Card>
                  )}
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
