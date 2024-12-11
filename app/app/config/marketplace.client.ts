import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';

declare global {
  interface Window {
    ENV: {
      SOLANA_NETWORK: string;
      SOLANA_RPC_URL: string;
      MARKETPLACE_PROGRAM_ID: string;
      MARKETPLACE_AUTHORITY_PUBLIC_KEY: string;
    };
  }
}

export const SOLANA_NETWORK =
  window.ENV?.SOLANA_NETWORK === 'mainnet-beta'
    ? WalletAdapterNetwork.Mainnet
    : window.ENV?.SOLANA_NETWORK === 'devnet'
      ? WalletAdapterNetwork.Devnet
      : window.ENV?.SOLANA_NETWORK === 'testnet'
        ? WalletAdapterNetwork.Testnet
        : 'localnet'; // Default to localnet

export const RPC_ENDPOINT =
  window.ENV?.SOLANA_RPC_URL ||
  clusterApiUrl(SOLANA_NETWORK as WalletAdapterNetwork);

export const MARKETPLACE_PROGRAM = new PublicKey(
  window.ENV?.MARKETPLACE_PROGRAM_ID
);
export const MARKETPLACE_AUTHORITY = new PublicKey(
  window.ENV?.MARKETPLACE_AUTHORITY_PUBLIC_KEY
);
