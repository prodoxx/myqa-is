'use client';

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { useMemo, useEffect } from 'react';

import '@solana/wallet-adapter-react-ui/styles.css';
import { initializeMarketplace } from '~/config/marketplace.client';

export function SolanaProvider({
  children,
  SOLANA_NETWORK,
  RPC_ENDPOINT,
}: {
  children: React.ReactNode;
  SOLANA_NETWORK: string;
  RPC_ENDPOINT: string;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeMarketplace();
    }
  }, []);

  const wallets = useMemo(
    () => [new SolflareWalletAdapter()],
    [SOLANA_NETWORK]
  );

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
