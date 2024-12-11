import { zodResolver } from '@hookform/resolvers/zod';
import { type WalletContextState } from '@solana/wallet-adapter-react';
import { z } from 'zod';
import { MarketplaceClient } from '~/lib/marketplace';
import { bigIntReplacer } from '~/utils/big-int-replacer';

const schema = z.object({
  question: z.string().min(10),
  answer: z.string().min(1).max(5000),
  maxKeys: z.number().min(0).max(100_000),
  unlockPriceInBonk: z.bigint().min(BigInt(1)),
});

export type CreateQuestionAndAnswerFormData = z.infer<typeof schema>;
export const createQuestionAndAnswerFormDataResolver = zodResolver(schema);

export async function createQuestionAndAnswer({
  values: { question, answer, unlockPriceInBonk, maxKeys },
  marketplace,
  wallet,
}: {
  values: CreateQuestionAndAnswerFormData;
  marketplace: MarketplaceClient;
  wallet: WalletContextState;
}) {
  try {
    // Step 1: Pin to IPFS
    const pinResponse = await fetch('/api/v1/ipfs/pin', {
      method: 'POST',
      body: JSON.stringify({
        question,
        answer,
      }),
    });

    const {
      data: { cid, questionHash, contentHash },
    } = await pinResponse.json();

    // Step 2: Create on-chain
    try {
      const onChainId = await marketplace.createQuestion({
        contentCid: cid,
        contentMetadataHash: contentHash,
        maxKeys,
        unlockPrice: Number(unlockPriceInBonk),
        wallet,
      });

      console.log(onChainId);

      // Step 3: Create answer record
      const createAnswerResponse = await fetch('/api/v1/create-answer', {
        method: 'POST',
        body: JSON.stringify(
          {
            cid,
            onChainId,
            question,
            unlockPrice: unlockPriceInBonk,
            maxKeys,
            questionHash,
          },
          bigIntReplacer
        ),
      });

      return await createAnswerResponse.json();
    } catch (blockchainError) {
      console.log(blockchainError);
      // If blockchain transaction fails, clean up IPFS pin
      await fetch('/api/v1/ipfs/unpin', {
        method: 'POST',
        body: JSON.stringify({ cid }),
      });
      throw blockchainError;
    }
  } catch (error) {
    throw new Error(`Failed to create question: ${(error as Error)?.message}`);
  }
}
