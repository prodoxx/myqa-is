import { ActionFunction } from '@remix-run/node';
import { typedjson } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import prisma from '~/infrastructure/database/index.server';
import { PinataSDK } from 'pinata-web3';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY_URL,
});

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return typedjson({ error: 'Method not allowed' }, { status: 405 });
  }

  const user = await authenticator.isAuthenticated(request);
  if (!user || !user.id) {
    return typedjson({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cid, type } = await request.json();

  try {
    const pin = await prisma.ipfsPin.findFirst({
      where: {
        cid,
        userId: user.id,
        status: 'PINNED',
        type,
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

    if (pin.qaId && type === 'ANSWER') {
      return typedjson({ error: 'Pin has an answer' }, { status: 400 });
    }

    if (pin.qaId && type === 'QUESTION') {
      return typedjson({ error: 'Pin has a question' }, { status: 400 });
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
