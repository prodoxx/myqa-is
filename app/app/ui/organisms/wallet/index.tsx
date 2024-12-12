import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useUser } from '~/provider/user-provider';

export const Wallet = () => {
  const { user } = useUser();
  const { publicKey } = useWallet();

  return user ? (
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
    </>
  ) : null;
};
