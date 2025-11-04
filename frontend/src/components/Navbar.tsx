import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, Moon, Sun, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '@/contexts/useTheme';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { TARGET_CHAIN_ID, TARGET_CHAIN_NAME } from '@/lib/web3';

const LogoMark = () => (
  <svg
    className="h-8 w-8"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="streampayLogoGradient" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="45%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="streampayLogoWave" x1="10" y1="18" x2="38" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#cbd5f5" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="36" height="36" rx="18" fill="url(#streampayLogoGradient)" />
    <path
      d="M12 27.5C16.5 24 19.5 24 24 27.5C28.5 31 31.5 31 36 27.5"
      stroke="url(#streampayLogoWave)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 22C18.5 19.5 20.5 18.5 24 18.5C27.5 18.5 29.5 19.5 32 22"
      stroke="rgba(248, 250, 252, 0.6)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Navbar = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending, pendingConnector, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingNetwork } = useSwitchChain();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectorDialogOpen, setConnectorDialogOpen] = useState(false);

  const isWrongNetwork = isConnected && chainId !== undefined && chainId !== TARGET_CHAIN_ID;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/about', label: 'About' },
  ];

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchChainAsync({ chainId: TARGET_CHAIN_ID });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Unable to switch automatically. Please select ${TARGET_CHAIN_NAME} in your wallet.`,
      );
    }
  };

  const handleConnectClick = async (fromMobile = false) => {
    if (fromMobile) {
      setMobileOpen(false);
    }

    if (connectors.length === 0) {
      toast.error('No wallet connectors available');
      return;
    }

    const readyConnector = connectors.find((connector) => connector.ready);

    if (connectors.length === 1 && readyConnector) {
      try {
        await connectAsync({ connector: readyConnector });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to connect wallet');
      }
      return;
    }

    setConnectorDialogOpen(true);
  };

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
      setConnectorDialogOpen(false);
      setMobileOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/40">
              <LogoMark />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight text-foreground">StreamPay Mantle</span>
              <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground group-hover:text-primary transition-colors">Real-time payments</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {location.pathname !== '/dashboard' && navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isConnected && location.pathname !== '/dashboard' && (
              <Link
                to="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hidden sm:flex"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Desktop Wallet */}
            <div className="hidden md:flex items-center gap-4">
              {isConnected ? (
                <>
                  {isWrongNetwork && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSwitchNetwork}
                      disabled={isSwitchingNetwork}
                      className="border-yellow-500/60 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      {isSwitchingNetwork ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Switch Network'
                      )}
                    </Button>
                  )}
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg glass-card">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-mono">{truncateAddress(address!)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnect()}
                    className="border-primary/50 hover:bg-primary/10"
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleConnectClick()}
                  className="animated-gradient hover:opacity-90 transition-opacity"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass-card w-[300px]">
                <div className="flex flex-col gap-6 mt-6">
                  {location.pathname !== '/dashboard' && navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {isConnected && location.pathname !== '/dashboard' && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium transition-colors hover:text-primary text-muted-foreground"
                    >
                      Dashboard
                    </Link>
                  )}

                  <Button
                    variant="ghost"
                    onClick={toggleTheme}
                    className="justify-start"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        Dark Mode
                      </>
                    )}
                  </Button>

                  <div className="pt-4 border-t border-border">
                    {isConnected ? (
                      <div className="space-y-3">
                        <div className="px-4 py-2 rounded-lg glass-card">
                          <p className="text-xs text-muted-foreground mb-1">Connected</p>
                          <p className="text-sm font-mono">{truncateAddress(address!)}</p>
                        </div>
                        {isWrongNetwork && (
                          <Button
                            onClick={handleSwitchNetwork}
                            disabled={isSwitchingNetwork}
                            className="w-full border-yellow-500/60 text-yellow-400"
                            variant="outline"
                          >
                            {isSwitchingNetwork ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Switching...
                              </>
                            ) : (
                              `Switch to ${TARGET_CHAIN_NAME}`
                            )}
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            disconnect();
                            setMobileOpen(false);
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleConnectClick(true)}
                        className="w-full animated-gradient"
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Dialog open={connectorDialogOpen} onOpenChange={setConnectorDialogOpen}>
              <DialogContent className="glass-card border-border/50">
                <DialogHeader>
                  <DialogTitle>Connect a Wallet</DialogTitle>
                  <DialogDescription>
                    Choose a wallet provider to connect to StreamPay.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {connectors.map((connector) => {
                    const isLoading = isPending && pendingConnector?.id === connector.id;
                    return (
                      <Button
                        key={connector.id}
                        variant="outline"
                        className="w-full justify-between"
                        disabled={isLoading}
                        onClick={() => handleConnectorSelect(connector)}
                      >
                        <span>{connector.name}</span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          {!connector.ready && connector.id !== 'walletConnect' && '(Unavailable)'}
                          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        </span>
                      </Button>
                    );
                  })}
                </div>
                {error && (
                  <p className="text-xs text-destructive">
                    {error.message || 'Failed to connect wallet. Try a different option.'}
                  </p>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
