import type { ActionFunction } from '@vercel/remix';
import { PinataSDK } from 'pinata-web3';
import { typedjson } from 'remix-typedjson';
import { authenticator } from '~/auth.server';
import {
  encryptContent,
  generateSymmetricKey,
  hashContent,
} from '~/utils/encryption.server';
import {} from '~/utils/encryption.server';
import prisma from '~/infrastructure/database/index.server';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY_URL,
});

const MAX_QUESTION_LENGTH = 1000;
const MAX_ANSWER_LENGTH = 5000;

interface UploadRequest {
  question: string;
  answer: string;
}

interface IpfsContent {
  question: string;
  answer: string;
  metadata: {
    version: string;
    createdAt: string;
    hashedAnswer: string;
    answerEncryptionType: string;
    contentType: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return typedjson({ error: 'Method not allowed' }, { status: 405 });
  }

  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return typedjson({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { question, answer }: UploadRequest = await request.json();
    if (!question || !answer) {
      return typedjson({ error: 'Invalid content format' }, { status: 400 });
    }

    const questionSize = question.length;
    if (questionSize > MAX_QUESTION_LENGTH) {
      return typedjson({ error: 'Question too long' }, { status: 400 });
    }

    const answerSize = answer.length;
    if (answerSize > MAX_ANSWER_LENGTH) {
      return typedjson({ error: 'Answer too long' }, { status: 400 });
    }

    const symmetricKey = generateSymmetricKey();
    const encryptedAnswer = encryptContent(answer, symmetricKey);
    const hashedAnswer = hashContent(answer);

    const ipfsContent: IpfsContent = {
      question,
      answer: encryptedAnswer,
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        hashedAnswer: hashedAnswer.toString('hex'),
        answerEncryptionType: 'AES-256-CBC',
        contentType: 'application/json',
      },
    };

    const contentHash = hashContent(JSON.stringify(ipfsContent));
    const questionHash = hashContent(question);

    const result = await pinata.upload.json(ipfsContent, {
      metadata: {
        name: `MyFAQ-${Date.now()}`,
        keyValues: {
          creatorAddress: user.walletPublicKey!,
          questionHash: questionHash.toString('hex'),
        },
      },
      cidVersion: 1,
    });

    try {
      await pinata.testAuthentication();
      if (!result.IpfsHash) {
        throw new Error('Upload verification failed - no hash returned');
      }
    } catch (verifyError) {
      console.error('Upload verification failed:', verifyError);
      return typedjson(
        { error: 'Upload verification failed' },
        { status: 500 }
      );
    }
    await prisma.ipfsPin.create({
      data: {
        cid: result.IpfsHash,
        symmetricKey,
        status: 'PINNED',
        User: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return typedjson({
      success: true,
      data: {
        questionHash: questionHash.toString('hex'),
        cid: result.IpfsHash,
        contentHash: contentHash.toString('hex'),
        encryptedAnswer,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return typedjson({ error: 'Failed to create IPFS pin' }, { status: 500 });
  }
};
