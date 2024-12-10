import { ActionFunction } from '@remix-run/node';
import { typedjson } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import prisma from '~/infrastructure/database/index.server';
import pinataSDK from '@pinata/sdk';

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_SECRET_KEY!
);

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return typedjson({ error: 'Method not allowed' }, { status: 405 });
  }

  const user = await authenticator.isAuthenticated(request);
  if (!user || !user.id) {
    return typedjson({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cid } = await request.json();

  try {
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

    if (pin.userId !== user.id) {
      return typedjson(
        { error: 'Pin does not belong to the user' },
        { status: 400 }
      );
    }

    if (pin.qaId) {
      return typedjson({ error: 'Pin has an answer' }, { status: 400 });
    }

    // TODO: make this a transaction
    await prisma.ipfsPin.update({
      where: { id: pin.id },
      data: { status: 'UNPINNED' },
    });

    await pinata.unpin(cid);

    return typedjson({ success: true });
  } catch (error) {
    console.error('Failed to unpin', error);
    return typedjson({ error: 'Failed to unpin' }, { status: 500 });
  }
};
