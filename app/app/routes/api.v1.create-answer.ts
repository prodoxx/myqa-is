import type { ActionFunction } from '@remix-run/node';
import { typedjson } from 'remix-typedjson';
import { z, ZodError } from 'zod';
import { authenticator } from '~/auth.server';
import prisma from '~/infrastructure/database/index.server';

const createQuestionSchema = z.object({
  cid: z.string().min(1),
  onChainId: z.string().min(1),
  question: z.string().min(10),
  unlockPrice: z.object({
    type: z.string().min(1),
    value: z.string().min(1),
  }),
  maxKeys: z
    .number({ message: 'A minimum of 1 is required' })
    .min(1)
    .max(100_000),
  questionHash: z.string().min(1),
});

type CreateAnswerFieldErrors = z.inferFlattenedErrors<
  typeof createQuestionSchema
>['fieldErrors'];

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return typedjson({ error: 'Method not allowed' }, { status: 405 });
  }

  const user = await authenticator.isAuthenticated(request);
  if (!user || !user.id) {
    return typedjson({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cid, onChainId, question, unlockPrice, maxKeys, questionHash } =
    await createQuestionSchema.parseAsync(await request.json());
  const unlockPriceInBonk = BigInt(unlockPrice.value);

  try {
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    if (!userProfile) {
      return typedjson({ error: 'User profile not found' }, { status: 404 });
    }

    const pin = await prisma.ipfsPin.findFirst({
      where: {
        cid,
        userId: user.id,
        status: 'PINNED',
      },
    });

    if (!pin) {
      return typedjson({ error: 'Pin not found' }, { status: 404 });
    }
    const qa = await prisma.qA.create({
      data: {
        question,
        unlockPriceInBonk: Number(unlockPriceInBonk),
        maxKeys,
        questionHash,
        onChainId,
        ipfsPinId: pin.id,
        userProfileId: userProfile.id,
        userId: user.id,
      },
    });

    // update the pin with the qa id
    await prisma.ipfsPin.update({
      where: { id: pin.id },
      data: { qaId: qa.id },
    });

    return typedjson({ success: true, data: qa });
  } catch (error) {
    if (error instanceof ZodError) {
      return typedjson(
        {
          error: 'The required fields are mismatched',
          fieldErrors: error.flatten().fieldErrors as CreateAnswerFieldErrors,
        },
        { status: 400 }
      );
    }
    return typedjson({ error: 'Failed to create answer' }, { status: 500 });
  }
};
