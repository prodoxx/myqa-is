import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from '@remix-run/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React from 'react';
import { useUser } from '~/provider/user-provider';
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
import '@solana/wallet-adapter-react-ui/styles.css';

export const SiteNav = ({
  className,
  connectedPublicKey,
}: {
  className?: string;
  connectedPublicKey?: string;
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { publicKey, connected, disconnect, connecting, select, ...rest } =
    useWallet();

  // TODO: We need to log the user out of their wallet if it doesn't match
  // the one that the originally linked to their profile
  const [showWarning, setShowWarning] = React.useState(false);

  return (
    <nav className={`flex h-[96px] w-full flex-row items-center ${className}`}>
      <div className="mr-auto">
        <NavLogo isText={false} isLink size="large" />
      </div>

      <div className="ml-auto hidden items-center gap-4 sm:flex">
        {user ? (
          <>
            {publicKey ? (
              <span className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground">
                {publicKey.toString()}
              </span>
            ) : (
              <span className="pointer-events-none text-xs text-gray-400">
                <WalletMultiButton />
              </span>
            )}
            <LogoutForm />
          </>
        ) : null}
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
