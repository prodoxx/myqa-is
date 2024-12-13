import { web3 } from '@project-serum/anchor';
import { executeCommand, PROGRAM_NAME } from '../deploy/scripts/utils';
import fs from 'fs';
import * as anchor from '@project-serum/anchor';
import path from 'path';

// Network configurations
const NETWORK_CONFIGS = {
  devnet: {
    url: 'https://api.devnet.solana.com',
    bonkMint: new web3.PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'),
  },
  mainnet: {
    url: 'https://api.mainnet-beta.solana.com',
    bonkMint: new web3.PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'), // Mainnet BONK
  },
} as const;

type Network = keyof typeof NETWORK_CONFIGS;

const PROGRAM_ID = new web3.PublicKey('EsXaHoxZzsBAmMGKVWrNgysfs2Rv1XasV1JTHdyvwskM');

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
    console.error(`Please fund the account before proceeding with initialization`);
    throw new Error(`Insufficient balance for ${accountName}`);
  } else {
    console.log(`✓ ${accountName} is sufficiently funded with ${balance / web3.LAMPORTS_PER_SOL} SOL`);
  }
}

async function initialize(network: Network) {
  if (!['devnet', 'mainnet'].includes(network)) {
    throw new Error('Invalid network. Must be either "devnet" or "mainnet"');
  }

  try {
    const configDir = path.join(process.cwd(), 'config');
    const networkConfig = NETWORK_CONFIGS[network];

    const connection = new web3.Connection(networkConfig.url, 'confirmed');

    const info = await connection.getAccountInfo(PROGRAM_ID, 'confirmed');
    console.log('info', info);
    if (!info || !info.executable) {
      throw new Error('Program not found or not executable');
    }

    // Load treasury keypair from config/keys
    const treasuryKeypair = web3.Keypair.fromSecretKey(
      Buffer.from(JSON.parse(fs.readFileSync(path.join(configDir, 'keys', 'treasury-keypair.json'), 'utf-8'))),
    );

    // Use default provider (from Solana CLI wallet) for program deployment
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    console.log(`Using Program Authority from Solana CLI config: ${provider.wallet.publicKey.toString()}`);

    // Check funding for critical accounts
    console.log('\nChecking account balances...');
    await checkAccountFunding(connection, treasuryKeypair.publicKey, 'Treasury');
    await checkAccountFunding(connection, provider.wallet.publicKey, 'Program Authority (Solana CLI wallet)');

    // Initialize the program
    const program = new anchor.Program(require(`../target/idl/${PROGRAM_NAME}.json`), PROGRAM_ID, provider);

    // Derive the marketplace PDA from program authority
    const [marketplacePDA] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('marketplace'), provider.wallet.publicKey.toBuffer()],
      program.programId,
    );

    console.log('\nInitializing program...');
    // Initialize the marketplace
    await program.methods
      .initialize()
      .accounts({
        marketplace: marketplacePDA,
        bonkMint: networkConfig.bonkMint,
        treasury: treasuryKeypair.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const initInfo = {
      programId: PROGRAM_ID.toString(),
      programAuthority: provider.wallet.publicKey.toString(),
      bonkMint: networkConfig.bonkMint.toString(),
      marketplace: marketplacePDA.toString(),
      network,
      initializationTime: new Date().toISOString(),
      version: JSON.parse(fs.readFileSync('package.json', 'utf-8')).version,
      treasury: treasuryKeypair.publicKey.toString(),
    };

    // Ensure config/network directory exists
    const networkConfigDir = path.join(configDir, network);
    if (!fs.existsSync(networkConfigDir)) {
      fs.mkdirSync(networkConfigDir, { recursive: true });
    }

    fs.writeFileSync(path.join(networkConfigDir, 'initialization-info.json'), JSON.stringify(initInfo, null, 2));

    console.log('\n=== Initialization Summary ===');
    console.log(`✓ Program ID: ${PROGRAM_ID.toString()}`);
    console.log(`✓ Program authority: ${provider.wallet.publicKey.toString()}`);
    console.log(`✓ Network: ${network}`);
    console.log(`✓ RPC URL: ${networkConfig.url}`);
    console.log(`✓ BONK Token: ${networkConfig.bonkMint.toString()}`);
    console.log(`✓ Marketplace: ${marketplacePDA.toString()}`);
    console.log(`✓ Treasury: ${treasuryKeypair.publicKey.toString()}`);
    console.log(`✓ Initialization info: ./config/${network}/initialization-info.json`);
    console.log('\nInitialization completed successfully!\n');

    return initInfo;
  } catch (error) {
    console.error('Initialization failed:', error);
    throw error;
  }
}

if (require.main === module) {
  const network = process.argv[2] as Network;
  if (!network) {
    console.error('Please specify a network: devnet or mainnet');
    process.exit(1);
  }

  initialize(network).catch((error) => {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  });
}

export { initialize };
