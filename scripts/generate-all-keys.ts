import { web3 } from '@project-serum/anchor';
import fs from 'fs';
import path from 'path';

// define the keys directory
const KEYS_DIR = path.join(process.cwd(), 'config', 'keys');

// function to extract program ID from lib.rs
function getProgramId(): web3.PublicKey {
  const libRsPath = path.join(process.cwd(), 'programs', 'myfaq-is', 'src', 'lib.rs');
  const content = fs.readFileSync(libRsPath, 'utf-8');
  const match = content.match(/declare_id!\("([^"]+)"\)/);

  if (!match) {
    throw new Error('Could not find program ID in lib.rs');
  }

  return new web3.PublicKey(match[1]);
}

// Define the key configurations
const REQUIRED_KEYS = [
  {
    name: 'treasury',
    description: 'Treasury Account Keypair',
  },
];

interface KeyInfo {
  address: string;
  keypairPath: string;
}

async function generateKeys(): Promise<void> {
  try {
    // create keys directory if it doesn't exist
    if (!fs.existsSync(KEYS_DIR)) {
      console.log('Creating keys directory...');
      fs.mkdirSync(KEYS_DIR, { recursive: true });
    }

    const keyInfos: { [key: string]: KeyInfo } = {};

    // generate or load each keypair
    for (const keyConfig of REQUIRED_KEYS) {
      const keypairPath = path.join(KEYS_DIR, `${keyConfig.name}-keypair.json`);
      let keypair: web3.Keypair;

      if (fs.existsSync(keypairPath)) {
        console.log(`Loading existing ${keyConfig.description}...`);
        const secretKey = new Uint8Array(JSON.parse(fs.readFileSync(keypairPath, 'utf-8')));
        keypair = web3.Keypair.fromSecretKey(secretKey);
      } else {
        console.log(`Generating new ${keyConfig.description}...`);
        keypair = web3.Keypair.generate();
        fs.writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)), 'utf-8');
      }

      keyInfos[keyConfig.name] = {
        address: keypair.publicKey.toString(),
        keypairPath: `config/keys/${keyConfig.name}-keypair.json`,
      };
    }

    // get program ID
    const programId = getProgramId();

    // write key info to JSON file
    const keyInfoPath = path.join(process.cwd(), 'config', 'key-info.json');
    fs.writeFileSync(keyInfoPath, JSON.stringify(keyInfos, null, 2));

    console.log('\n=== Key Generation Summary ===');
    console.log('✓ Keys directory:', KEYS_DIR);
    console.log('✓ Key info file:', keyInfoPath);
    console.log('✓ Program ID:', programId.toString());
    console.log('\nGenerated/loaded keys:');
    for (const [name, info] of Object.entries(keyInfos)) {
      console.log(`- ${name}:`);
      console.log(`  Address: ${info.address}`);
      console.log(`  Keypair: ${info.keypairPath}`);
    }
  } catch (error) {
    console.error('Error generating keys:', error);
    throw error;
  }
}

// run the script if it's called directly
if (require.main === module) {
  generateKeys().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generateKeys };
