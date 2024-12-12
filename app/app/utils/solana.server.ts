import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from 'bn.js';
import { getMarketplaceConfig } from '~/config/marketplace.client';

// The discriminator for UnlockKey account type
// This should match the value from the Rust program
const UNLOCK_KEY_DISCRIMINATOR = 1;

export async function verifyKeyOwnership(
  walletPublicKey: string,
  questionId: string
): Promise<boolean> {
  const config = getMarketplaceConfig();
  const connection = new Connection(config.RPC_ENDPOINT);

  try {
    // Get the PDAs
    const [marketplacePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('marketplace'), config.MARKETPLACE_AUTHORITY.toBuffer()],
      config.MARKETPLACE_PROGRAM
    );

    const [questionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('question'),
        marketplacePda.toBuffer(),
        new BN(questionId).toArrayLike(Buffer, 'le', 8),
      ],
      config.MARKETPLACE_PROGRAM
    );

    // Get all program accounts filtered by owner and question
    const accounts = await connection.getProgramAccounts(
      config.MARKETPLACE_PROGRAM,
      {
        filters: [
          // Filter for UnlockKey accounts using the correct discriminator
          { memcmp: { offset: 0, bytes: UNLOCK_KEY_DISCRIMINATOR } },
          // Filter for owner
          { memcmp: { offset: 8, bytes: walletPublicKey } },
          // Filter for question
          { memcmp: { offset: 40, bytes: questionPda.toBase58() } },
        ],
      }
    );

    return accounts.length > 0;
  } catch (error) {
    console.error('Failed to verify key ownership:', error);
    return false;
  }
}
