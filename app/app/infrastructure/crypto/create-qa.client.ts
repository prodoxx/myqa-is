import { zodResolver } from '@hookform/resolvers/zod';
import { type WalletContextState } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { z } from 'zod';
import { MarketplaceClient } from '~/lib/marketplace';
import { bigIntReplacer } from '~/utils/big-int-replacer';

const schema = z.object({
  question: z.string().min(10, 'A longer question is required'),
  answer: z.string().min(1, 'An answer to the question is required').max(5000),
  maxKeys: z
    .number({ message: 'A minimum of 1 is required' })
    .min(1)
    .max(100_000),
  unlockPriceInBonk: z
    .bigint({ message: 'A minimum of 1 BONK is required' })
    .min(BigInt(1)),
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
    const {
      data: {
        data: { cid, questionHash, contentHash, encryptedAnswer },
      },
    } = await axios.post('/api/v1/ipfs/pin', {
      question,
      answer,
    });

    // Step 2: Create on-chain
    try {
      const onChainId = await marketplace.createQuestion({
        contentCid: cid,
        contentMetadataHash: contentHash,
        maxKeys,
        unlockPrice: Number(unlockPriceInBonk),
        wallet,
      });

      // Step 3: Create answer record
      const { data: createAnswerData } = await axios.post(
        '/api/v1/create-answer',
        {
          cid,
          onChainId,
          question,
          encryptedAnswer,
          unlockPrice: unlockPriceInBonk,
          maxKeys,
          questionHash,
        },
        {
          transformRequest: [(data) => JSON.stringify(data, bigIntReplacer)],
        }
      );

      return createAnswerData;
    } catch (blockchainError) {
      // If blockchain transaction fails, clean up IPFS pin
      await axios.post('/api/v1/ipfs/unpin', { cid });
      throw blockchainError;
    }
  } catch (error) {
    throw new Error(`Failed to create question: ${(error as Error)?.message}`);
  }
}
