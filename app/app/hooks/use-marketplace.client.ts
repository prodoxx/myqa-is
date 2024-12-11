'use client';
import { useAnchorProgram } from '~/hooks/use-anchor-program.client';
import { MarketplaceClient } from '~/lib/marketplace';
import { useMemo } from 'react';
import invariant from 'tiny-invariant';
import { getMarketplaceConfig } from '~/config/marketplace.client';

export function useMarketplace() {
  const { MARKETPLACE_AUTHORITY } = getMarketplaceConfig();

  const { program, connection } = useAnchorProgram();

  const result = useMemo(() => {
    invariant(MARKETPLACE_AUTHORITY, 'MARKETPLACE_AUTHORITY must be set');

    return MarketplaceClient.getInstance(
      program,
      connection,
      MARKETPLACE_AUTHORITY
    );
  }, [program, connection]);

  return result;
}
