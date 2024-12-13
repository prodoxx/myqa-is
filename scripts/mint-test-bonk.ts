import { Command } from 'commander';
import { web3 } from '@project-serum/anchor';
import { createMintToInstruction, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import fs from 'fs';

async function mintTestBonk(connection: web3.Connection, amount: number, recipientAddress: web3.PublicKey) {
  // Load the mint authority
  const mintAuthoritySecret = JSON.parse(fs.readFileSync('config/localnet-bonk-mint-authority-keypair.json', 'utf-8'));
  const mintAuthority = web3.Keypair.fromSecretKey(new Uint8Array(mintAuthoritySecret));

  // Load the BONK mint address
  const deployInfo = JSON.parse(fs.readFileSync('config/localnet-deployment-info.json', 'utf-8'));
  const bonkMint = new web3.PublicKey(deployInfo.bonkMint);

  // Get or create the recipient's token account, payer is the mint authority
  const ataAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    mintAuthority, // payer for account creation
    bonkMint,
    recipientAddress,
  );

  // Create the MintTo instruction
  const mintIx = createMintToInstruction(bonkMint, ataAccount.address, mintAuthority.publicKey, amount);

  // Create transaction and set fee payer to mint authority
  const tx = new web3.Transaction().add(mintIx);
  tx.feePayer = mintAuthority.publicKey;

  // Send and confirm the transaction
  const signature = await web3.sendAndConfirmTransaction(connection, tx, [mintAuthority], { commitment: 'confirmed' });

  console.log(`Minted ${amount} BONK tokens to ${recipientAddress.toString()}`);
  console.log(`Transaction: ${signature}`);
}

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
    // Initialize connection to localnet
    const connection = new web3.Connection('http://localhost:8899', 'confirmed');

    // Validate and create PublicKey from address
    const recipientAddress = new web3.PublicKey(opts.address);

    // Execute mint
    await mintTestBonk(connection, Number(opts.amount), recipientAddress);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { mintTestBonk };
