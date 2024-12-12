import { MarketplaceClient } from '~/lib/marketplace';
import { MintUnlockKeyParams } from '~/lib/marketplace/client';

export async function unlockQuestionAndAnswer(
  params: MintUnlockKeyParams,
  marketplace: MarketplaceClient
) {
  return marketplace.mintUnlockKey(params);
}
