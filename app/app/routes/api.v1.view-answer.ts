import type { ActionFunction } from '@vercel/remix';
import { typedjson } from 'remix-typedjson';
import { z } from 'zod';
import { authenticator } from '~/auth.server';
import prisma from '~/infrastructure/database/index.server';
import { decryptContent } from '~/utils/encryption.server';
import { verifyKeyOwnership } from '~/utils/solana.server';

const viewAnswerSchema = z.object({
  questionId: z.number().int().positive(),
  tokenId: z.string().min(1).nullish(),
});

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return typedjson({ error: 'Method not allowed' }, { status: 405 });
  }

  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return typedjson({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user.walletPublicKey) {
    return typedjson({ error: 'No wallet connected' }, { status: 401 });
  }

  try {
    const { questionId } = await viewAnswerSchema.parseAsync(
      await request.json()
    );

    const qa = await prisma.qA.findUnique({
      where: { id: questionId },
      include: { IpfsPin: true },
    });

    if (!qa) {
      return typedjson({ error: 'Question not found' }, { status: 404 });
    }

    // verify ownership using server-side utility
    const hasAccess = await verifyKeyOwnership(
      user.walletPublicKey,
      qa.onChainId
    );

    if (!hasAccess) {
      return typedjson(
        { error: 'You do not own an unlock key for this question' },
        { status: 403 }
      );
    }

    // decrypt the answer using the symmetric key
    const decryptedAnswer = decryptContent(
      qa.encryptedAnswer,
      qa.IpfsPin.symmetricKey
    );

    return typedjson({
      success: true,
      data: {
        question: qa.question,
        answer: decryptedAnswer,
      },
    });
  } catch (error) {
    console.error('Failed to view answer:', error);
    return typedjson({ error: 'Failed to retrieve answer' }, { status: 500 });
  }
};
