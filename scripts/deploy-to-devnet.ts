import { web3 } from '@project-serum/anchor';
import { executeCommand, PROGRAM_NAME } from '../deploy/scripts/utils';
import fs from 'fs';
import * as anchor from '@project-serum/anchor';
import path from 'path';

// devnet BONK token address
// from: https://spl-token-faucet.com/?token-name=BONK
const DEVNET_BONK_MINT = new web3.PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
const DEVNET_URL = 'https://api.devnet.solana.com';

async function ensureAccountFunded(
  connection: web3.Connection,
  account: web3.PublicKey,
  minBalance: number = 1 * web3.LAMPORTS_PER_SOL,
): Promise<void> {
  try {
    const balance = await connection.getBalance(account);
    if (balance < minBalance) {
      console.log(`Funding account ${account.toString()}...`);
      const signature = await connection.requestAirdrop(account, minBalance);
      await connection.confirmTransaction(signature);
    }
  } catch (error) {
    console.error('Failed to fund account:', error);
    throw error;
  }
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
    const walletPubkey = wallet.publicKey;

    console.log(`Using wallet: ${walletPubkey.toString()}`);

    const programInfo = await connection.getAccountInfo(walletPubkey);

    if (programInfo && programInfo.executable) {
      console.log(`Program exists at ${walletPubkey.toString()}, attempting upgrade...`);

      const programSoPath = `target/deploy/${PROGRAM_NAME}.so`;
      if (!fs.existsSync(programSoPath)) {
        throw new Error('Program binary not found');
      }

      await executeCommand(
        `anchor upgrade ${programSoPath} --program-id ${programId.toString()} --provider.cluster devnet`,
      );
      console.log('Program upgraded successfully');
    } else {
      console.log('Deploying new program...');
      await executeCommand('anchor deploy --provider.cluster devnet');
      console.log(`Program deployed to ${programId.toString()}`);
    }

    const verifyProgramInfo = await connection.getAccountInfo(programId);
    if (!verifyProgramInfo || !verifyProgramInfo.executable) {
      throw new Error('Program deployment verification failed');
    }
    return true;
  } catch (error) {
    console.error('Program deployment/upgrade failed:', error);
    return false;
  }
}

async function deploy() {
  try {
    // Ensure config/devnet directory exists
    const configDir = path.join(process.cwd(), 'config', 'devnet');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const connection = new web3.Connection(DEVNET_URL, 'confirmed');

    // load the deployed program ID
    const programIdKeypair = web3.Keypair.fromSecretKey(
      Buffer.from(JSON.parse(fs.readFileSync(`target/deploy/${PROGRAM_NAME}-keypair.json`, 'utf-8'))),
    );
    const programId = programIdKeypair.publicKey;

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const deployed = await deployProgram({ connection, programId, provider });
    if (!deployed) throw new Error('Program deployment failed');

    // load or generate treasury keypair
    let treasuryKeypair: web3.Keypair;
    const treasuryKeypairFile = path.join(configDir, 'treasury-keypair.json');

    if (fs.existsSync(treasuryKeypairFile)) {
      console.log('Using existing treasury keypair...');
      const secretKey = Buffer.from(JSON.parse(fs.readFileSync(treasuryKeypairFile, 'utf-8')));
      treasuryKeypair = web3.Keypair.fromSecretKey(secretKey);
    } else {
      console.log('Creating new treasury keypair...');
      treasuryKeypair = web3.Keypair.generate();
      fs.writeFileSync(treasuryKeypairFile, JSON.stringify(Array.from(treasuryKeypair.secretKey)), 'utf-8');
    }

    await ensureAccountFunded(connection, treasuryKeypair.publicKey, 2 * web3.LAMPORTS_PER_SOL);

    // initialize the program
    const program = new anchor.Program(require(`../target/idl/${PROGRAM_NAME}.json`), programId, provider);

    // derive the marketplace PDA
    const [marketplacePDA] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('marketplace'), provider.wallet.publicKey.toBuffer()],
      program.programId,
    );

    // initialize the marketplace
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
      programId: programId.toString(),
      programAuthority: provider.wallet.publicKey.toString(),
      bonkMint: DEVNET_BONK_MINT.toString(),
      marketplace: marketplacePDA.toString(),
      network: 'devnet',
      deploymentTime: new Date().toISOString(),
      version: JSON.parse(fs.readFileSync('package.json', 'utf-8')).version,
      treasury: treasuryKeypair.publicKey.toString(),
      treasuryKeypairPath: 'config/devnet/treasury-keypair.json',
    };

    fs.writeFileSync(path.join(configDir, 'deployment-info.json'), JSON.stringify(deployInfo, null, 2));

    console.log('\n=== Deployment Summary ===');
    console.log(`✓ Program deployed to: ${programId.toString()}`);
    console.log(`✓ Program authority: ${provider.wallet.publicKey.toString()}`);
    console.log(`✓ Network: Devnet`);
    console.log(`✓ RPC URL: ${DEVNET_URL}`);
    console.log(`✓ BONK Token: ${DEVNET_BONK_MINT.toString()}`);
    console.log(`✓ Marketplace: ${marketplacePDA.toString()}`);
    console.log(`✓ Treasury: ${treasuryKeypair.publicKey.toString()}`);
    console.log('✓ Deployment info: ./config/devnet/deployment-info.json');
    console.log('✓ Treasury keypair: ./config/devnet/treasury-keypair.json');
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
