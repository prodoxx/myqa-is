import { web3 } from '@project-serum/anchor';
import { executeCommand, PROGRAM_NAME } from '../deploy/scripts/utils';
import fs from 'fs';
import * as anchor from '@project-serum/anchor';
import path from 'path';

// devnet BONK token address
// from: https://spl-token-faucet.com/?token-name=BONK
const DEVNET_BONK_MINT = new web3.PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
const DEVNET_URL = 'https://api.devnet.solana.com';

const PROGRAM_ID = new web3.PublicKey('9JAQRjJrrADocbboPiaRNRNpkbGKZKgxoJpsEkJEDn2e');

async function checkAccountFunding(
  connection: web3.Connection,
  account: web3.PublicKey,
  accountName: string,
  minBalance: number = 1 * web3.LAMPORTS_PER_SOL,
): Promise<void> {
  const balance = await connection.getBalance(account);
  if (balance < minBalance) {
    console.error(
      `Error: ${accountName} (${account.toString()}) has insufficient balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`,
    );
    console.error(`Required minimum balance: ${minBalance / web3.LAMPORTS_PER_SOL} SOL`);
    console.error(`Please fund the account before proceeding with deployment`);
    throw new Error(`Insufficient balance for ${accountName}`);
  } else {
    console.log(`✓ ${accountName} is sufficiently funded with ${balance / web3.LAMPORTS_PER_SOL} SOL`);
  }
}

async function verifyProgramDeploymentWithRetry(
  connection: web3.Connection,
  programId: web3.PublicKey,
  retries = 10,
  waitTimeMs = 10000,
) {
  for (let i = 0; i < retries; i++) {
    const info = await connection.getAccountInfo(programId);
    if (info && info.executable) {
      return;
    }
    console.log(`Attempt ${i + 1}/${retries}: Waiting for program to be fully finalized...`);
    await new Promise((resolve) => setTimeout(resolve, waitTimeMs));
  }
  throw new Error('Program not verified after multiple retries');
}

async function deployProgram({
  connection,
  programId,
  provider,
}: {
  connection: web3.Connection;
  programId: web3.PublicKey;
  provider: anchor.AnchorProvider;
}): Promise<boolean> {
  try {
    console.log('Building program...');
    await executeCommand('anchor build');

    const wallet = provider.wallet;
    console.log(`Using Program Authority wallet: ${wallet.publicKey.toString()}`);

    // Check if program exists at the program ID address
    const programInfo = await connection.getAccountInfo(programId);

    if (programInfo && programInfo.executable) {
      console.log(`Program exists at ${programId.toString()}, attempting upgrade...`);

      const programSoPath = `target/deploy/${PROGRAM_NAME}.so`;
      if (!fs.existsSync(programSoPath)) {
        throw new Error('Program binary not found');
      }

      await executeCommand(
        `anchor upgrade ${programSoPath} --program-id ${programId.toString()} --provider.cluster devnet`,
      );
      await verifyProgramDeploymentWithRetry(connection, programId);
      console.log('Program upgraded successfully');
    } else {
      console.log('Deploying new program...');
      await executeCommand(`anchor deploy --provider.cluster devnet`);
      await verifyProgramDeploymentWithRetry(connection, programId);
      console.log(`Program deployed to ${programId.toString()}`);
    }

    return true;
  } catch (error) {
    console.error('Program deployment/upgrade failed:', error);
    return false;
  }
}

async function ensureProgramBuild(): Promise<void> {
  console.log('Ensuring program is built...');
  const programSoPath = `target/deploy/${PROGRAM_NAME}.so`;
  const programKeypairPath = `target/deploy/${PROGRAM_NAME}-keypair.json`;

  if (!fs.existsSync(programSoPath) || !fs.existsSync(programKeypairPath)) {
    console.log('Program build not found, building...');
    await executeCommand('anchor build');
  }

  if (!fs.existsSync(programKeypairPath)) {
    throw new Error('Program keypair not found even after build. Check your anchor.toml configuration.');
  }
}

async function deploy() {
  try {
    const configDir = path.join(process.cwd(), 'config');

    // Ensure program is built before proceeding
    await ensureProgramBuild();

    // Load treasury keypair from config/keys
    const treasuryKeypair = web3.Keypair.fromSecretKey(
      Buffer.from(JSON.parse(fs.readFileSync(path.join(configDir, 'keys', 'treasury-keypair.json'), 'utf-8'))),
    );

    const connection = new web3.Connection(DEVNET_URL, 'confirmed');

    // Use default provider (from Solana CLI wallet) for program deployment
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    console.log(`Using Program Authority from Solana CLI config: ${provider.wallet.publicKey.toString()}`);

    // Check funding for critical accounts
    console.log('\nChecking account balances...');
    await checkAccountFunding(connection, treasuryKeypair.publicKey, 'Treasury');
    await checkAccountFunding(connection, provider.wallet.publicKey, 'Program Authority (Solana CLI wallet)');

    await checkAccountFunding(connection, provider.wallet.publicKey, 'Program Authority (Solana CLI wallet)');

    const deployed = await deployProgram({ connection, programId: PROGRAM_ID, provider });
    if (!deployed) throw new Error('Program deployment failed');

    // Initialize the program
    const program = new anchor.Program(require(`../target/idl/${PROGRAM_NAME}.json`), PROGRAM_ID, provider);

    // Derive the marketplace PDA from program authority
    const [marketplacePDA] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('marketplace'), provider.wallet.publicKey.toBuffer()],
      program.programId,
    );

    // Initialize the marketplace
    await program.methods
      .initialize()
      .accounts({
        marketplace: marketplacePDA,
        bonkMint: DEVNET_BONK_MINT,
        treasury: treasuryKeypair.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const deployInfo = {
      programId: PROGRAM_ID.toString(),
      programAuthority: provider.wallet.publicKey.toString(),
      bonkMint: DEVNET_BONK_MINT.toString(),
      marketplace: marketplacePDA.toString(),
      network: 'devnet',
      deploymentTime: new Date().toISOString(),
      version: JSON.parse(fs.readFileSync('package.json', 'utf-8')).version,
      treasury: treasuryKeypair.publicKey.toString(),
    };

    // Ensure config/devnet directory exists
    const devnetConfigDir = path.join(configDir, 'devnet');
    if (!fs.existsSync(devnetConfigDir)) {
      fs.mkdirSync(devnetConfigDir, { recursive: true });
    }

    fs.writeFileSync(path.join(devnetConfigDir, 'deployment-info.json'), JSON.stringify(deployInfo, null, 2));

    console.log('\n=== Deployment Summary ===');
    console.log(`✓ Program deployed to: ${PROGRAM_ID.toString()}`);
    console.log(`✓ Program authority: ${provider.wallet.publicKey.toString()}`);
    console.log(`✓ Network: Devnet`);
    console.log(`✓ RPC URL: ${DEVNET_URL}`);
    console.log(`✓ BONK Token: ${DEVNET_BONK_MINT.toString()}`);
    console.log(`✓ Marketplace: ${marketplacePDA.toString()}`);
    console.log(`✓ Treasury: ${treasuryKeypair.publicKey.toString()}`);
    console.log('✓ Deployment info: ./config/devnet/deployment-info.json');
    console.log('\nDeployment completed successfully!\n');

    return deployInfo;
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}

if (require.main === module) {
  deploy().catch((error) => {
    console.error('Fatal deployment error:', error);
    process.exit(1);
  });
}

export { deploy };
