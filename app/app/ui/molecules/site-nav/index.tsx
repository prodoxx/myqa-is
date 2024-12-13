import { useNavigate } from '@remix-run/react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import React from 'react';
import { useUser } from '~/provider/user-provider';
import { useWalletState } from '~/provider/wallet-provider';
import { Button } from '~/ui/atoms/button';
import { NavLogo } from '~/ui/atoms/nav-logo';
import { LogoutForm } from '~/ui/organisms/auth/logout-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '../dialog';
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';

export const SiteNav = ({
  className,
  connectedPublicKey,
}: {
  className?: string;
  connectedPublicKey?: string;
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isConnected, walletAddress } = useWalletState();
  const [showWarning, setShowWarning] = React.useState(false);

  return (
    <nav className={`flex h-[96px] w-full flex-row items-center ${className}`}>
      <div className="mr-auto">
        <NavLogo isText={false} isLink size="large" />
      </div>

      <div className="ml-auto hidden items-center gap-4 sm:flex">
        {user ? (
          <>
            {isConnected ? (
              <code className="rounded-md border border-input bg-background px-4 py-2 font-mono text-sm font-medium text-foreground">
                {`${walletAddress?.slice(0, 4)}...${walletAddress?.slice(-4)}`}
              </code>
            ) : (
              <WalletMultiButton className="!bg-primary hover:!bg-primary/90">
                Connect Wallet
              </WalletMultiButton>
            )}
            <LogoutForm />
          </>
        ) : (
          <Button onClick={() => navigate('/login')} size="lg" variant="ghost">
            Log in <ArrowLongRightIcon className="text-white h-8 w-10" />
          </Button>
        )}
      </div>

      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent>
          <DialogTitle>Wallet Mismatch</DialogTitle>
          <DialogDescription>
            The wallet you connected doesn't match the one stored in our system
            (The connected wallet starts with{' '}
            <span className="font-bold">
              {connectedPublicKey?.slice(0, 10)}
            </span>
            ). Please connect the correct wallet or contact support for help.
          </DialogDescription>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowWarning(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
};
