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
import { useMemo } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';

export function SolanaProvider({
  children,
  SOLANA_NETWORK,
  RPC_ENDPOINT,
}: {
  children: React.ReactNode;
  SOLANA_NETWORK: string;
  RPC_ENDPOINT: string;
}) {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [SOLANA_NETWORK]
  );

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
