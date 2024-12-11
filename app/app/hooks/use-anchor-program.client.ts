'use client';
import {
  Program,
  AnchorProvider,
  setProvider,
  Idl,
} from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { IDL } from '~/lib/types/myfaq_is';
import { getMarketplaceConfig } from '~/config/marketplace.client';

export function useAnchorProgram() {
  const { MARKETPLACE_PROGRAM } = getMarketplaceConfig();

  const { connection } = useConnection();
  const wallet = useWallet();

  const result = useMemo(() => {
    if (!wallet) {
      throw new Error('Wallet is required');
    }

    const provider = new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );
    setProvider(provider);

    const program = new Program(IDL as Idl, MARKETPLACE_PROGRAM, provider);

    return {
      program,
      connection,
      provider,
    };
  }, [connection, wallet]);

  return result;
}
