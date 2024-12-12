import { MarketplaceClient } from '~/lib/marketplace';
import { MintUnlockKeyParams } from '~/lib/marketplace/client';

export async function unlockQuestionAndAnswer(
  params: Pick<MintUnlockKeyParams, 'questionId' | 'wallet'>,
  marketplace: MarketplaceClient
) {
  return marketplace.mintUnlockKey(params as MintUnlockKeyParams);
}
