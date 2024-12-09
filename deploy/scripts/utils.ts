import { web3, Program, Wallet, AnchorProvider } from '@project-serum/anchor';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  createMint as _createMint,
  createAccount,
  mintTo as _mintTo,
  TOKEN_PROGRAM_ID,
  getAccount,
  createMint,
} from '@solana/spl-token';

export const LOCALNET_URL = 'http://127.0.0.1:8899';
export const PROGRAM_NAME = 'myfaq_is';
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 2000;

export const executeCommand = async (command: string, maxRetries = MAX_RETRIES): Promise<string> => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.warn(stderr);
            reject(error);
          }
          resolve(stdout);
        });
      });
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        console.log(`Command failed, retrying (${i + 1}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  throw lastError;
};

export const updateProgramId = async (programId: string): Promise<void> => {
  try {
    // validate program ID format
    if (!web3.PublicKey.isOnCurve(new web3.PublicKey(programId))) {
      throw new Error('Invalid program ID format');
    }

    // update Anchor.toml
    const anchorPath = 'Anchor.toml';
    if (!fs.existsSync(anchorPath)) {
      throw new Error('Anchor.toml not found');
    }
    let anchorConfig = fs.readFileSync(anchorPath, 'utf8');
    anchorConfig = anchorConfig.replace(new RegExp(`${PROGRAM_NAME} = "[^"]*"`), `${PROGRAM_NAME} = "${programId}"`);
    fs.writeFileSync(anchorPath, anchorConfig);

    // update lib.rs
    const libRsPath = path.join('programs', PROGRAM_NAME.replace('_', '-'), 'src', 'lib.rs');
    if (!fs.existsSync(libRsPath)) {
      throw new Error('lib.rs not found');
    }
    let libRs = fs.readFileSync(libRsPath, 'utf8');
    libRs = libRs.replace(/declare_id!\("[^"]*"\);/, `declare_id!("${programId}");`);
    fs.writeFileSync(libRsPath, libRs);

    // verify updates
    const updatedAnchor = fs.readFileSync(anchorPath, 'utf8');
    const updatedLibRs = fs.readFileSync(libRsPath, 'utf8');
    if (!updatedAnchor.includes(programId) || !updatedLibRs.includes(programId)) {
      throw new Error('Program ID update verification failed');
    }
  } catch (error) {
    console.error('Failed to update program ID:', error);
    throw error;
  }
};

export const waitForConfirmation = async (
  connection: web3.Connection,
  signature: string,
  maxRetries = MAX_RETRIES,
): Promise<void> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const latestBlockhash = await connection.getLatestBlockhash();
      const result = await connection.confirmTransaction(
        {
          signature,
          ...latestBlockhash,
        },
        'confirmed',
      );

      if (result.value.err) throw new Error(`Transaction failed: ${result.value.err}`);

      // add small delay after confirmation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Confirmation attempt ${i + 1} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
};

export async function createTestBonkToken(
  connection: web3.Connection,
  payer: web3.Keypair,
): Promise<{ mint: web3.PublicKey; mintAuthority: web3.Keypair }> {
  const mintAuthority = web3.Keypair.generate();
  const mint = await createMint(connection, payer, mintAuthority.publicKey, mintAuthority.publicKey, 9);

  return { mint, mintAuthority };
}

async function retry<T>(operation: () => Promise<T>, maxRetries = MAX_RETRIES): Promise<T> {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        console.log(`Operation failed, retrying (${i + 1}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  throw lastError;
}
