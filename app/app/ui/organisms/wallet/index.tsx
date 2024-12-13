import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { cn } from '~/lib/utils';
import { useUser } from '~/provider/user-provider';

export const Wallet = ({ className }: { className?: string }) => {
  const { user } = useUser();
  const { publicKey } = useWallet();

  return user ? (
    <>
      {publicKey ? (
        <span
          className={cn(
            'h-fit rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground',
            className
          )}
        >
          {publicKey.toString().slice(0, 10)}...
          {publicKey.toString().slice(-10)}
        </span>
      ) : (
        <span
          className={cn(
            'h-fit pointer-events-none text-xs text-gray-400',
            className
          )}
        >
          <WalletMultiButton />
        </span>
      )}
    </>
  ) : null;
};
