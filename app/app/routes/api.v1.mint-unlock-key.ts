import type { ActionFunction } from '@remix-run/node';
import { PinataSDK } from 'pinata-web3';
import { typedjson } from 'remix-typedjson';
import { z } from 'zod';
import { authenticator } from '~/auth.server';
import prisma from '~/infrastructure/database/index.server';
import {
  generateUnlockKeyEncryptionKey,
  encryptContent,
} from '~/utils/encryption.server';

const mintUnlockKeySchema = z.object({
  questionId: z.string().min(1),
  tokenId: z.string().min(1),
  message: z.string().min(1),
  signature: z.string().min(1),
  txSignature: z.string().min(1),
});

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

  try {
    const { questionId, tokenId, message, signature, txSignature } =
      await mintUnlockKeySchema.parseAsync(await request.json());

    // Find the question and its associated IPFS pin
    const qa = await prisma.qA.findFirst({
      where: { onChainId: questionId },
      include: { IpfsPin: true },
    });

    if (!qa || !qa.IpfsPin) {
      return typedjson({ error: 'Question not found' }, { status: 404 });
    }

    // generate encryption key using all signature components
    const keyEncryptionKey = await generateUnlockKeyEncryptionKey({
      message,
      signature,
      transactionSignature: txSignature,
      questionId,
    });

    // encrypt the question's symmetric key
    const encryptedSymmetricKey = encryptContent(
      qa.IpfsPin.symmetricKey,
      keyEncryptionKey
    );

    const name = `QA Key #${tokenId} - Q${questionId}`;

    // Create metadata JSON
    const metadata = {
      name,
      symbol: 'QAK',
      description: `Access key for question #${questionId} on MyQA`,
      attributes: [
        {
          trait_type: 'Question ID',
          value: questionId,
        },
        {
          trait_type: 'Key Number',
          value: tokenId,
        },
        {
          trait_type: 'Question CID',
          value: `ipfs://${qa.IpfsPin.cid}`,
        },
        {
          trait_type: 'Version',
          value: '1.0',
        },
      ],
      properties: {
        question_cid: qa.IpfsPin.cid,
        category: 'access_key',
      },
    };

    // pin metadata to IPFS
    const { IpfsHash } = await pinata.upload.json(metadata, {
      metadata: {
        name,
        keyValues: {
          questionId,
          tokenId,
        },
      },
      cidVersion: 1,
    });

    // store the encrypted key in the database
    const keyPin = await prisma.ipfsPin.create({
      data: {
        cid: IpfsHash,
        status: 'PINNED',
        symmetricKey: encryptedSymmetricKey,
        userId: user.id,
        qaId: qa.id,
        type: 'ANSWER',
      },
    });

    return typedjson({
      success: true,
      data: {
        keyPinId: keyPin.id,
        cid: IpfsHash,
        encryptionKey: keyEncryptionKey,
      },
    });
  } catch (error) {
    console.error('Error minting key:', error);
    return typedjson({ error: 'Failed to mint key' }, { status: 500 });
  }
};
