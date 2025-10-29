import { Link, useLocation } from 'react-router-dom';
import { Wallet, Droplets, Menu, Moon, Sun, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const Navbar = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending, pendingConnector, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectorDialogOpen, setConnectorDialogOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/about', label: 'About' },
  ];

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
          <Link to="/" className="flex items-center gap-2 group">
            <Droplets className="h-8 w-8 text-primary animate-pulse-glow" />
            <span className="text-2xl font-bold gradient-text">StreamPay</span>
            <span className="text-sm text-muted-foreground">Mantle</span>
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
                    const isUnavailable = !connector.ready;
                    const isLoading = isPending && pendingConnector?.id === connector.id;
                    return (
                      <Button
                        key={connector.id}
                        variant="outline"
                        className="w-full justify-between"
                        disabled={isUnavailable || isLoading}
                        onClick={() => handleConnectorSelect(connector)}
                      >
                        <span>{connector.name}</span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          {isUnavailable && '(Unavailable)'}
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
