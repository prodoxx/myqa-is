'use client';

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { useMemo, useEffect } from 'react';

import '@solana/wallet-adapter-react-ui/styles.css';
import { initializeMarketplace } from '~/config/marketplace.client';
import { useUser } from '~/provider/user-provider';

export function SolanaProvider({
  children,
  SOLANA_NETWORK,
  RPC_ENDPOINT,
}: {
  children: React.ReactNode;
  SOLANA_NETWORK: string;
  RPC_ENDPOINT: string;
}) {
  const { user } = useUser();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeMarketplace();
    }
  }, []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [SOLANA_NETWORK]
  );

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect={!!user}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
