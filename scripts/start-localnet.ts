import { web3 } from '@project-serum/anchor';
import { executeCommand, LOCALNET_URL, createTestBonkToken, PROGRAM_NAME } from '../deploy/scripts/utils';
import fs from 'fs';
import { spawn } from 'child_process';
import * as anchor from '@project-serum/anchor';
import path from 'path';

let validatorProcess: any = null;
let validatorStarted = false;

async function cleanup() {
  if (validatorProcess) {
    console.log('Stopping local validator...');
    validatorProcess.kill('SIGINT');
    await executeCommand('pkill -f solana-test-validator || true');
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

async function startValidator(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Starting fresh validator...');
    fs.rmSync('test-ledger', { recursive: true, force: true });

    // create logs directory if it doesn't exist
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
    }

    const logStream = fs.createWriteStream('logs/validator.log', { flags: 'a' });
    logStream.write(`\n--- New Validator Session: ${new Date().toISOString()} ---\n`);

    validatorProcess = spawn(
      'solana-test-validator',
      ['--reset', '--bind-address', '127.0.0.1', '--rpc-port', '8899', '--log'],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );

    validatorProcess.stdout.pipe(logStream);
    validatorProcess.stderr.pipe(logStream);

    setTimeout(() => {
      validatorStarted = true;
      resolve();
    }, 5000);

    validatorProcess.on('error', (err: Error) => {
      console.error('Failed to start validator:', err);
      reject(err);
    });

    validatorProcess.on('exit', (code: number) => {
      if (!validatorStarted) {
        reject(new Error(`Validator exited with code ${code}`));
      }
    });
  });
}

async function checkValidatorConnection(connection: web3.Connection): Promise<boolean> {
  try {
    await connection.getEpochInfo();
    return true;
  } catch {
    return false;
  }
}

async function waitForValidator(connection: web3.Connection, maxAttempts = 30): Promise<void> {
  console.log('Waiting for validator to be responsive...');

  for (let i = 0; i < maxAttempts; i++) {
    if (await checkValidatorConnection(connection)) {
      console.log('Validator is responsive!');
      return;
    }
    console.log(`Waiting for validator... attempt ${i + 1}/${maxAttempts}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('Validator failed to become responsive');
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

    // Use the default wallet from provider
    const wallet = provider.wallet;
    const walletPubkey = wallet.publicKey;

    console.log(`Using wallet: ${walletPubkey.toString()}`);

    // check if program exists for this wallet
    const programInfo = await connection.getAccountInfo(walletPubkey);

    if (programInfo && programInfo.executable) {
      console.log(`Program exists at ${walletPubkey.toString()}, attempting upgrade...`);

      // upgrade existing program
      const programSoPath = `target/deploy/${PROGRAM_NAME}.so`;
      if (!fs.existsSync(programSoPath)) {
        throw new Error('Program binary not found');
      }

      await executeCommand(`anchor upgrade ${programSoPath} --program-id ${programId.toString()}`);
      console.log('Program upgraded successfully');
    } else {
      console.log('Deploying new program...');
      await executeCommand('anchor deploy');
      console.log(`Program deployed to ${programId.toString()}`);
    }

    // verify deployment
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

async function deploy() {
  try {
    await cleanup();

    // Ensure config directory exists
    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const connection = new web3.Connection(LOCALNET_URL, 'confirmed');
    await startValidator();
    await waitForValidator(connection);

    // load the deployed program ID
    const programIdKeypair = web3.Keypair.fromSecretKey(
      Buffer.from(JSON.parse(fs.readFileSync(`target/deploy/${PROGRAM_NAME}-keypair.json`, 'utf-8'))),
    );
    const programId = programIdKeypair.publicKey;

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const deployed = await deployProgram({ connection, programId, provider });
    if (!deployed) throw new Error('Program deployment failed');

    // load or generate payer keypair
    let payerKeypair: web3.Keypair;
    const payerKeypairFile = path.join(configDir, 'localnet-payer-keypair.json');

    if (fs.existsSync(payerKeypairFile)) {
      console.log('Using existing payer keypair...');
      const secretKey = Buffer.from(JSON.parse(fs.readFileSync(payerKeypairFile, 'utf-8')));
      payerKeypair = web3.Keypair.fromSecretKey(secretKey);
    } else {
      console.log('Creating new payer keypair...');
      payerKeypair = web3.Keypair.generate();
      fs.writeFileSync(payerKeypairFile, JSON.stringify(Array.from(payerKeypair.secretKey)), 'utf-8');
    }

    await ensureAccountFunded(connection, payerKeypair.publicKey, 5 * web3.LAMPORTS_PER_SOL);

    let testBonkMint: web3.PublicKey;
    let testBonkMintAuthority: web3.Keypair;

    // check if BONK mint authority already exists
    const bonkMintAuthorityFile = path.join(configDir, 'localnet-bonk-mint-authority-keypair.json');
    if (fs.existsSync(bonkMintAuthorityFile)) {
      console.log('Using existing BONK mint authority...');
      const secretKey = Buffer.from(JSON.parse(fs.readFileSync(bonkMintAuthorityFile, 'utf-8')));
      testBonkMintAuthority = web3.Keypair.fromSecretKey(secretKey);

      // load existing mint from deployment info
      const deploymentInfoFile = path.join(configDir, 'localnet-deployment-info.json');
      if (fs.existsSync(deploymentInfoFile)) {
        const existingDeployInfo = JSON.parse(fs.readFileSync(deploymentInfoFile, 'utf-8'));
        testBonkMint = new web3.PublicKey(existingDeployInfo.bonkMint);
      } else {
        // If deployment info doesn't exist, create new mint
        const result = await createTestBonkToken(connection, payerKeypair);
        testBonkMint = result.mint;
      }
    } else {
      console.log('Creating new test BONK token...');
      const result = await createTestBonkToken(connection, payerKeypair);
      testBonkMint = result.mint;
      testBonkMintAuthority = result.mintAuthority;

      // save BONK mint authority keypair
      fs.writeFileSync(bonkMintAuthorityFile, JSON.stringify(Array.from(testBonkMintAuthority.secretKey)), 'utf-8');
    }

    // initialize the program
    const program = new anchor.Program(require(`../target/idl/${PROGRAM_NAME}.json`), programId, provider);

    // derive the marketplace PDA
    const [marketplacePDA] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('marketplace'), provider.wallet.publicKey.toBuffer()],
      program.programId,
    );

    let treasuryKeypair: web3.Keypair;

    // add this after payerKeypair initialization
    const treasuryKeypairFile = path.join(configDir, 'localnet-treasury-keypair.json');

    if (fs.existsSync(treasuryKeypairFile)) {
      console.log('Using existing treasury keypair...');
      const secretKey = Buffer.from(JSON.parse(fs.readFileSync(treasuryKeypairFile, 'utf-8')));
      treasuryKeypair = web3.Keypair.fromSecretKey(secretKey);
    } else {
      console.log('Creating new treasury keypair...');
      treasuryKeypair = web3.Keypair.generate();
      fs.writeFileSync(treasuryKeypairFile, JSON.stringify(Array.from(treasuryKeypair.secretKey)), 'utf-8');
    }

    await ensureAccountFunded(connection, treasuryKeypair.publicKey, 5 * web3.LAMPORTS_PER_SOL);

    // Update the program initialization to include treasury
    await program.methods
      .initialize()
      .accounts({
        marketplace: marketplacePDA,
        bonkMint: testBonkMint,
        treasury: treasuryKeypair.publicKey, // Add treasury account
        authority: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const deployInfo = {
      programId: programId.toString(),
      bonkMint: testBonkMint.toString(),
      marketplace: marketplacePDA.toString(),
      network: 'localnet',
      deploymentTime: new Date().toISOString(),
      version: JSON.parse(fs.readFileSync('package.json', 'utf-8')).version,
      payerKeypairPath: 'config/localnet-payer-keypair.json',
      bonkMintAuthorityPath: 'config/localnet-bonk-mint-authority-keypair.json',
      treasury: treasuryKeypair.publicKey.toString(),
      treasuryKeypairPath: 'config/localnet-treasury-keypair.json',
    };

    fs.writeFileSync('config/localnet-deployment-info.json', JSON.stringify(deployInfo, null, 2));

    console.log('\n=== Deployment Summary ===');
    console.log('✓ Validator is running on port 8899');
    console.log('✓ RPC URL: http://127.0.0.1:8899');
    console.log('✓ Validator logs: ./logs/validator.log');
    console.log('✓ Deployment info: ./config/localnet-deployment-info.json');
    console.log('✓ Payer keypair: ./config/localnet-payer-keypair.json');
    console.log('✓ BONK mint authority: ./config/localnet-bonk-mint-authority-keypair.json');
    console.log('✓ Treasury keypair: ./config/localnet-treasury-keypair.json');
    console.log('\nPress Ctrl+C to stop the validator and cleanup...\n');

    return deployInfo;
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}

if (require.main === module) {
  // handle ctrl+c gracefully
  process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT signal...');
    await cleanup();
    process.exit(0);
  });

  deploy().catch((error) => {
    console.error('Fatal deployment error:', error);
    cleanup().then(() => process.exit(1));
  });
}

export { deploy };
