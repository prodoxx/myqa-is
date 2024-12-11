import { useAnchorProgram } from '~/hooks/use-anchor-program.client';
import { MarketplaceClient } from '~/lib/marketplace';
import { useMemo } from 'react';
import invariant from 'tiny-invariant';
import { MARKETPLACE_AUTHORITY } from '~/config/marketplace.client';

export function useMarketplace() {
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
