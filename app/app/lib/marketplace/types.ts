import { Program, BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

export interface QuestionAnswerParams {
  contentCid: string;
  contentMetadataHash: string;
  unlockPrice: number;
  maxKeys: number;
  wallet: WalletContextState;
}

export interface MarketplaceState {
  authority: PublicKey;
  questionCounter: BN;
  platformFeeBps: number;
  creatorRoyaltyBps: number;
  totalVolume: BN;
  paused: boolean;
  pausedOperations: {
    createQuestion: boolean;
    mintKey: boolean;
    listKey: boolean;
    buyKey: boolean;
  };
  bonkMint: PublicKey;
}
