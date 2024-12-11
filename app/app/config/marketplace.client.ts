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

let initialized = false;
let solanaNetwork: string;
let rpcEndpoint: string;
let marketplaceProgram: PublicKey;
let marketplaceAuthority: PublicKey;

export function initializeMarketplace() {
  if (initialized) return;

  solanaNetwork =
    window.ENV?.SOLANA_NETWORK === 'mainnet-beta'
      ? WalletAdapterNetwork.Mainnet
      : window.ENV?.SOLANA_NETWORK === 'devnet'
        ? WalletAdapterNetwork.Devnet
        : window.ENV?.SOLANA_NETWORK === 'testnet'
          ? WalletAdapterNetwork.Testnet
          : 'localnet';

  rpcEndpoint =
    window.ENV?.SOLANA_RPC_URL ||
    clusterApiUrl(solanaNetwork as WalletAdapterNetwork);

  marketplaceProgram = new PublicKey(window.ENV?.MARKETPLACE_PROGRAM_ID);

  marketplaceAuthority = new PublicKey(
    window.ENV?.MARKETPLACE_AUTHORITY_PUBLIC_KEY
  );

  initialized = true;
}

export function getMarketplaceConfig() {
  if (!initialized) {
    throw new Error(
      'Marketplace config not initialized. Call initializeMarketplace() first.'
    );
  }

  return {
    SOLANA_NETWORK: solanaNetwork,
    RPC_ENDPOINT: rpcEndpoint,
    MARKETPLACE_PROGRAM: marketplaceProgram,
    MARKETPLACE_AUTHORITY: marketplaceAuthority,
  };
}
