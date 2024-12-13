import { useWallet } from '@solana/wallet-adapter-react';
import React, { createContext, useContext, useEffect, useState } from 'react';

type WalletContextType = {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  hasPermission: boolean;
};

const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  isConnected: false,
  isConnecting: false,
  connectWallet: () => {},
  disconnectWallet: () => {},
  hasPermission: false,
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      setWalletAddress(publicKey.toString());
      setHasPermission(true);
    } else {
      setWalletAddress(null);
      setHasPermission(false);
    }
  }, [connected, publicKey]);

  const connectWallet = () => {
    // Reset states for fresh connection
    setWalletAddress(null);
    setHasPermission(false);
  };

  const disconnectWallet = () => {
    disconnect();
    setWalletAddress(null);
    setHasPermission(false);
  };

  const value = {
    walletAddress,
    isConnected: connected,
    isConnecting: connecting,
    connectWallet,
    disconnectWallet,
    hasPermission,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWalletState = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletState must be used within a WalletProvider');
  }
  return context;
};
