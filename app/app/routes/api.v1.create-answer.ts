import type { ActionFunction } from '@remix-run/node';
import { typedjson } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import prisma from '~/infrastructure/database/index.server';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return typedjson({ error: 'Method not allowed' }, { status: 405 });
  }

  const user = await authenticator.isAuthenticated(request);
  if (!user || !user.id) {
    return typedjson({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cid, onChainId, question, unlockPrice, maxKeys, questionHash } =
    await request.json();
  const unlockPriceInBonk = BigInt(unlockPrice.value);

  // TODO: add validations

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
        unlockPriceInBonk,
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
    return typedjson({ error: 'Failed to create answer' }, { status: 500 });
  }
};
