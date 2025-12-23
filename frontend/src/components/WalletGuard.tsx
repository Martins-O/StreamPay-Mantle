import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface WalletGuardProps {
  children: React.ReactNode;
}

const WalletGuard = ({ children }: WalletGuardProps) => {
  const { isConnected, isConnecting } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect during initial connection check
    if (!isConnecting && !isConnected) {
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isConnecting, navigate]);

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Checking wallet connection...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-20">
          <Card className="glass-card max-w-md mx-auto p-8 text-center">
            <Wallet className="h-12 w-12 text-primary mx-auto" />
            <h2 className="mt-6 text-2xl font-bold">Wallet Connection Required</h2>
            <p className="mt-3 text-muted-foreground">
              You need to connect your wallet to access this page. Click the button in the navigation to get started.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Redirecting to homepage in 3 seconds...
            </p>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="mt-6"
            >
              Go to Homepage
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
};

export default WalletGuard;
