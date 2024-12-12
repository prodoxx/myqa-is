import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from 'bn.js';

// The discriminator for UnlockKey account type
// This should match the value from the Rust program
const UNLOCK_KEY_DISCRIMINATOR = 1;

export async function verifyKeyOwnership(
  walletPublicKey: string,
  questionId: string
): Promise<boolean> {
  const config = {
    SOLANA_NETWORK: process.env.SOLANA_NETWORK!,
    RPC_ENDPOINT: process.env.RPC_ENDPOINT!,
    MARKETPLACE_PROGRAM: new PublicKey(process.env.MARKETPLACE_PROGRAM!),
    MARKETPLACE_AUTHORITY: new PublicKey(process.env.MARKETPLACE_AUTHORITY!),
  };
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
