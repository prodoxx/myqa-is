import { MarketplaceClient } from '~/lib/marketplace';
import { MintUnlockKeyParams } from '~/lib/marketplace/client';

export async function unlockQuestionAndAnswer(
  params: Pick<MintUnlockKeyParams, 'questionId' | 'wallet' | 'onChainId'>,
  marketplace: MarketplaceClient
) {
  return marketplace.mintUnlockKey(params as MintUnlockKeyParams);
}
