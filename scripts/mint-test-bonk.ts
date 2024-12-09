import { Command } from 'commander';
import { web3 } from '@project-serum/anchor';
import { createMintToInstruction, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import fs from 'fs';

async function mintTestBonk(connection: web3.Connection, amount: number, recipientAddress: web3.PublicKey) {
  // load the mint authority keypair from your config
  const mintAuthoritySecret = JSON.parse(fs.readFileSync('config/localnet-bonk-mint-authority-keypair.json', 'utf-8'));
  const mintAuthority = web3.Keypair.fromSecretKey(new Uint8Array(mintAuthoritySecret));

  // load deployment info to get the BONK mint address
  const deployInfo = JSON.parse(fs.readFileSync('config/localnet-deployment-info.json', 'utf-8'));
  const bonkMint = new web3.PublicKey(deployInfo.bonkMint);

  // get or create the recipient's token account
  const recipientATA = await getOrCreateAssociatedTokenAccount(
    connection,
    mintAuthority, // payer
    bonkMint,
    recipientAddress,
  );

  // create mint instruction
  const mintIx = createMintToInstruction(bonkMint, recipientATA.address, mintAuthority.publicKey, amount);

  // send and confirm transaction
  const tx = new web3.Transaction().add(mintIx);
  const signature = await web3.sendAndConfirmTransaction(connection, tx, [mintAuthority]);

  console.log(`Minted ${amount} BONK tokens to ${recipientAddress.toString()}`);
  console.log(`Transaction: ${signature}`);
}

// tsx scripts/mint-test-bonk.ts -a <recipient-address> -m <amount>
async function main() {
  const program = new Command();

  program
    .name('mint-test-bonk')
    .description('Mint test BONK tokens to a specified address')
    .requiredOption('-a, --address <string>', 'recipient solana address')
    .requiredOption('-m, --amount <number>', 'amount of tokens to mint', parseInt)
    .parse(process.argv);

  const opts = program.opts();

  try {
    // initialize connection to local network
    const connection = new web3.Connection('http://localhost:8899', 'confirmed');

    // validate and create PublicKey from address
    const recipientAddress = new web3.PublicKey(opts.address);

    // execute mint
    await mintTestBonk(connection, opts.amount, recipientAddress);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// only run if this script is called directly
if (require.main === module) {
  main();
}

export { mintTestBonk };
