import type { ActionFunction } from '@remix-run/node';
import pinataSDK from '@pinata/sdk';
import { typedjson } from 'remix-typedjson';
import { authenticator } from '~/auth.server';

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_SECRET_KEY!
);

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return typedjson({ error: 'Method not allowed' }, { status: 405 });
  }

  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return typedjson({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { cid } = await request.json();

    if (!cid) {
      return typedjson({ error: 'No CID provided' }, { status: 400 });
    }

    await pinata.unpin(cid);

    return typedjson({ success: true });
  } catch (error) {
    console.error('Unpin error:', error);
    return typedjson({ error: 'Failed to unpin content' }, { status: 500 });
  }
};
