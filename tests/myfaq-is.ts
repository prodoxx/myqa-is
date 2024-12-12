import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { MyfaqIs } from '../target/types/myfaq_is';
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  Connection,
} from '@solana/web3.js';
import {
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from '@solana/spl-token';
import { assert } from 'chai';
import { MPL_TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { BorshAccountsCoder } from '@project-serum/anchor';

const TEST_BONK_DECIMALS = 6; // Match BONK token decimals

describe('myfaq-is', function () {
  // set timeout to 30 seconds for all tests in this suite
  this.timeout(30000);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // jrogram test accounts
  const authority = Keypair.generate();
  const user = Keypair.generate();
  const bonkMint = Keypair.generate();
  let marketplace: PublicKey;
  let userState: PublicKey;
  let userTokenAccount: PublicKey;
  let platformTokenAccount: PublicKey;

  // mint unlock key test accounts
  const buyer = Keypair.generate();
  const nftMint = Keypair.generate();
  let buyerTokenAccount: PublicKey;
  let creatorTokenAccount: PublicKey;
  let questionPda: PublicKey;
  let mintAuthority: PublicKey;
  let metadata: PublicKey;

  // configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MyfaqIs as Program<MyfaqIs>;

  // constants for testing
  const CONTENT_CID = 'QmT8JtG98Pu6YqHrRxiANrqjaC8ydz3F4uuQvRfQqC3T45';
  const CONTENT_HASH = Array(32).fill(1);
  const UNLOCK_PRICE = new anchor.BN(1_000_000); // 1 BONK (6 decimals)
  const MAX_KEYS = new anchor.BN(10);
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID);
  const LIST_PRICE = new anchor.BN(2_000_000); // 2 BONK (6 decimals)

  before(async () => {
    try {
      // airdrop SOL with confirmation
      const latestBlockhash = await provider.connection.getLatestBlockhash();

      for (const kp of [authority, user]) {
        const signature = await provider.connection.requestAirdrop(kp.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);

        await provider.connection.confirmTransaction({
          signature,
          ...latestBlockhash,
        });
      }

      // find PDA for marketplace instead of using a regular account
      const [marketplacePda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from('marketplace'), authority.publicKey.toBuffer()],
        program.programId,
      );
      marketplace = marketplacePda;

      // initialize marketplace using PDA
      await program.methods
        .initialize()
        .accounts({
          marketplace,
          authority: authority.publicKey,
          bonkMint: bonkMint.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([authority])
        .rpc();

      // create BONK token mint with correct decimals
      await createMint(provider.connection, authority, authority.publicKey, null, TEST_BONK_DECIMALS, bonkMint);

      // create associated token accounts
      userTokenAccount = await getAssociatedTokenAddress(bonkMint.publicKey, user.publicKey);

      platformTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        authority,
        bonkMint.publicKey,
        authority.publicKey,
      );

      // find PDA for user state
      [userState] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_state'), user.publicKey.toBuffer()],
        program.programId,
      );

      // additional setup for mint unlock key tests
      buyerTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        authority,
        bonkMint.publicKey,
        buyer.publicKey,
      );

      creatorTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        authority,
        bonkMint.publicKey,
        user.publicKey,
      );

      // mint some BONK tokens to buyer
      await mintTo(
        provider.connection,
        authority,
        bonkMint.publicKey,
        buyerTokenAccount,
        authority,
        10_000_000, // 10 BONK
      );

      // find PDAs
      [mintAuthority] = PublicKey.findProgramAddressSync([Buffer.from('mint_authority')], program.programId);

      [questionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('question'), marketplace.toBuffer(), new anchor.BN(0).toArrayLike(Buffer, 'le', 8)],
        program.programId,
      );

      // find metadata address
      [metadata] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID).toBuffer(),
          nftMint.publicKey.toBuffer(),
        ],
        new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID),
      );
    } catch (error) {
      console.error('Setup error:', error);
      if ('logs' in error) {
        console.error('Error logs:', error.logs);
      }
      throw error;
    }
  });

  it('Initializes the marketplace', async () => {
    try {
      const marketplaceAccount = await program.account.marketplace.fetch(marketplace);

      assert.ok(marketplaceAccount.authority.equals(authority.publicKey));
      assert.equal(marketplaceAccount.questionCounter.toNumber(), 0);
      assert.equal(marketplaceAccount.platformFeeBps, 500); // 5%
      assert.equal(marketplaceAccount.creatorRoyaltyBps, 200); // 2%
      assert.equal(marketplaceAccount.totalVolume.toNumber(), 0);
      assert.equal(marketplaceAccount.paused, false);
      assert.deepEqual(marketplaceAccount.pausedOperations, {
        createQuestion: false,
        mintKey: false,
        listKey: false,
        buyKey: false,
      });
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  });

  it('Initializes user state', async () => {
    try {
      const [userStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_state'), user.publicKey.toBuffer()],
        program.programId,
      );

      await program.methods
        .initializeUserState()
        .accounts({
          userState: userStatePda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const userStateAccount = await program.account.userState.fetch(userStatePda);
      assert.equal(userStateAccount.questionsCreated.toNumber(), 0);
      assert.equal(userStateAccount.isBlacklisted, false);
    } catch (error) {
      console.error('User state initialization error:', error);
      throw error;
    }
  });

  describe('CreateQuestion', () => {
    it('Creates a question', async () => {
      try {
        // get user state PDA
        const [userStatePda] = PublicKey.findProgramAddressSync(
          [Buffer.from('user_state'), user.publicKey.toBuffer()],
          program.programId,
        );

        // get question PDA
        const [questionPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('question'), marketplace.toBuffer(), new anchor.BN(0).toArrayLike(Buffer, 'le', 8)],
          program.programId,
        );

        await program.methods
          .createQuestion(CONTENT_CID, CONTENT_HASH, UNLOCK_PRICE, MAX_KEYS)
          .accounts({
            marketplace: marketplace,
            userState: userStatePda,
            question: questionPda,
            creator: user.publicKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([user])
          .rpc();

        const questionAccount = await program.account.question.fetch(questionPda);
        assert.ok(questionAccount.creator.equals(user.publicKey));
        assert.equal(questionAccount.contentCid, CONTENT_CID);
        assert.deepEqual(Array.from(questionAccount.contentHash), CONTENT_HASH);
        assert.equal(questionAccount.unlockPrice.toNumber(), UNLOCK_PRICE.toNumber());
        assert.equal(questionAccount.maxKeys.toNumber(), MAX_KEYS.toNumber());
        assert.equal(questionAccount.currentKeys.toNumber(), 0);
        assert.equal(questionAccount.isActive, true);

        const marketplaceAccount = await program.account.marketplace.fetch(marketplace);
        assert.equal(marketplaceAccount.questionCounter.toNumber(), 1);
      } catch (error) {
        console.error('Create question error:', error);
        throw error;
      }
    });

    it('Fails to create question when marketplace is paused', async () => {
      const [userStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_state'), user.publicKey.toBuffer()],
        program.programId,
      );

      // wait for rate limit cooldown
      await sleep(1000);

      // pause marketplace
      await program.methods
        .toggleMarketplace()
        .accounts({
          marketplace: marketplace,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const [questionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('question'), marketplace.toBuffer(), new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
        program.programId,
      );

      try {
        await program.methods
          .createQuestion(CONTENT_CID, CONTENT_HASH, UNLOCK_PRICE, MAX_KEYS)
          .accounts({
            marketplace: marketplace,
            userState: userStatePda,
            question: questionPda,
            creator: user.publicKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([user])
          .rpc();
        assert.fail('Expected transaction to fail');
      } catch (error: any) {
        const errorMessage = error.error?.errorMessage || error.message;
        assert.ok(
          errorMessage === 'Marketplace is paused' || errorMessage.includes('MarketplacePaused'),
          `Expected marketplace paused error, got: ${errorMessage}`,
        );
      }

      // cleanup
      await program.methods
        .toggleMarketplace()
        .accounts({
          marketplace: marketplace,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();
    });
  });

  describe('MintUnlockKey', () => {
    const PINATA_URI = 'https://gateway.pinata.cloud/ipfs/QmT8JtG98Pu6YqHrRxiANrqjaC8ydz3F4uuQvRfQqC3T45';
    const ENCRYPTED_KEY = Buffer.from('encrypted_key_data');
    let unlockKeyPda: PublicKey;
    let nftMint: Keypair;

    beforeEach(async () => {
      try {
        // airdrop SOL to buyer
        const latestBlockhash = await provider.connection.getLatestBlockhash();

        const signature = await provider.connection.requestAirdrop(
          buyer.publicKey,
          2 * LAMPORTS_PER_SOL, // airdrop 2 SOL to cover all fees
        );

        // wait for confirmation
        await provider.connection.confirmTransaction({
          signature,
          ...latestBlockhash,
        });

        // make sure marketplace is not paused
        const marketplaceAccount = await program.account.marketplace.fetch(marketplace);

        if (marketplaceAccount.paused) {
          await program.methods
            .toggleMarketplace()
            .accounts({
              marketplace: marketplace,
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc();
        }

        // initialize user state if not already initialized
        try {
          await program.account.userState.fetch(userState);
        } catch {
          await program.methods
            .initializeUserState()
            .accounts({
              userState: userState,
              user: user.publicKey,
              systemProgram: SystemProgram.programId,
            })
            .signers([user])
            .rpc();
        }

        // get question PDA with correct seeds
        [questionPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('question'),
            marketplace.toBuffer(),
            marketplaceAccount.questionCounter.toArrayLike(Buffer, 'le', 8),
          ],
          program.programId,
        );

        // create NFT mint
        nftMint = Keypair.generate();
        await createMint(provider.connection, authority, mintAuthority, null, 0, nftMint);

        // create the question
        await program.methods
          .createQuestion(CONTENT_CID, CONTENT_HASH, UNLOCK_PRICE, MAX_KEYS)
          .accounts({
            marketplace,
            userState,
            question: questionPda,
            creator: user.publicKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([user])
          .rpc();

        // verify question was created
        const questionAccount = await program.account.question.fetch(questionPda);

        if (!questionAccount) {
          throw new Error('Question account not initialized');
        }

        // find PDA for unlock key
        [unlockKeyPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('unlock_key'), questionPda.toBuffer(), new anchor.BN(0).toArrayLike(Buffer, 'le', 8)],
          program.programId,
        );

        // create token accounts if they don't exist
        try {
          // get ATAs
          buyerTokenAccount = await getAssociatedTokenAddress(bonkMint.publicKey, buyer.publicKey);

          creatorTokenAccount = await getAssociatedTokenAddress(bonkMint.publicKey, user.publicKey);

          platformTokenAccount = await getAssociatedTokenAddress(bonkMint.publicKey, authority.publicKey);

          // create ATAs if they don't exist
          const buyerAccountInfo = await provider.connection.getAccountInfo(buyerTokenAccount);
          if (!buyerAccountInfo) {
            const ix = createAssociatedTokenAccountInstruction(
              buyer.publicKey,
              buyerTokenAccount,
              buyer.publicKey,
              bonkMint.publicKey,
            );
            const tx = new Transaction().add(ix);
            return await sendAndConfirmTransaction(provider.connection, tx, [buyer]);
          }

          const creatorAccountInfo = await provider.connection.getAccountInfo(creatorTokenAccount);
          if (!creatorAccountInfo) {
            const ix = createAssociatedTokenAccountInstruction(
              authority.publicKey,
              creatorTokenAccount,
              user.publicKey,
              bonkMint.publicKey,
            );
            const tx = new Transaction().add(ix);
            return await sendAndConfirmTransaction(provider.connection, tx, [authority]);
          }

          const platformAccountInfo = await provider.connection.getAccountInfo(platformTokenAccount);
          if (!platformAccountInfo) {
            const ix = createAssociatedTokenAccountInstruction(
              authority.publicKey,
              platformTokenAccount,
              authority.publicKey,
              bonkMint.publicKey,
            );
            const tx = new Transaction().add(ix);
            return await sendAndConfirmTransaction(provider.connection, tx, [authority]);
          }

          // mint BONK tokens to buyer
          await mintTo(
            provider.connection,
            authority,
            bonkMint.publicKey,
            buyerTokenAccount,
            authority,
            UNLOCK_PRICE.toNumber() * 2, // mint extra for fees
          );
        } catch (error) {
          console.error('Token account setup error:', error);
          throw error;
        }

        // find metadata PDA
        [metadata] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('metadata'),
            new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID).toBuffer(),
            nftMint.publicKey.toBuffer(),
          ],
          new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID),
        );
      } catch (error) {
        console.error('BeforeEach setup error:', error);
        throw error;
      }
    });

    afterEach(async () => {
      try {
        // ensure marketplace is unpaused after each test
        const marketplaceAccount = await program.account.marketplace.fetch(marketplace);

        if (marketplaceAccount.paused) {
          return await program.methods
            .toggleMarketplace()
            .accounts({
              marketplace: marketplace,
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc();
        }
      } catch (error) {
        console.error('AfterEach cleanup error:', error);
      }
    });

    it('Successfully mints an unlock key', async () => {
      try {
        await program.methods
          .mintUnlockKey(PINATA_URI, ENCRYPTED_KEY)
          .accounts({
            marketplace: marketplace,
            question: questionPda,
            unlockKey: unlockKeyPda,
            buyer: buyer.publicKey,
            buyerTokenAccount: buyerTokenAccount,
            creatorTokenAccount: creatorTokenAccount,
            platformTokenAccount: platformTokenAccount,
            bonkMint: bonkMint.publicKey,
            metadata: metadata,
            mint: nftMint.publicKey,
            mintAuthority: mintAuthority,
            updateAuthority: mintAuthority,
            tokenProgram: TOKEN_PROGRAM_ID,
            metadataProgram: TOKEN_METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
            userState: userState,
          })
          .signers([buyer])
          .rpc();

        const unlockKeyAccount = await program.account.unlockKey.fetch(unlockKeyPda);

        // verify account data
        assert.ok(unlockKeyAccount.owner.equals(buyer.publicKey), 'Incorrect initial owner');
        assert.ok(unlockKeyAccount.question.equals(questionPda));
        assert.equal(unlockKeyAccount.tokenId.toNumber(), 0);
        assert.deepEqual(Buffer.from(unlockKeyAccount.encryptedKey), ENCRYPTED_KEY);
        assert.equal(unlockKeyAccount.isListed, false);
        assert.equal(unlockKeyAccount.listPrice.toNumber(), 0);
        assert.equal(unlockKeyAccount.metadataUri, PINATA_URI);
        assert.equal(unlockKeyAccount.discriminator, 1, 'Incorrect unlock key discriminator');

        // verify question state
        const questionAccount = await program.account.question.fetch(questionPda);
        assert.equal(questionAccount.currentKeys.toNumber(), 1);

        // verify token transfers
        const buyerBalance = await provider.connection.getTokenAccountBalance(buyerTokenAccount);
        const creatorBalance = await provider.connection.getTokenAccountBalance(creatorTokenAccount);
        const platformBalance = await provider.connection.getTokenAccountBalance(platformTokenAccount);

        // calculate expected fees (5% platform fee, remaining to creator)
        const platformFee = Math.floor(UNLOCK_PRICE.toNumber() * 0.05);
        const creatorPayment = UNLOCK_PRICE.toNumber() - platformFee;

        assert.equal(platformBalance.value.amount, platformFee.toString());
        assert.equal(creatorBalance.value.amount, creatorPayment.toString());
      } catch (error) {
        console.error('Mint unlock key error:', error);
        if ('logs' in error) {
          console.error('Error logs:', error.logs);
        }
        throw error;
      }
    });

    it('Fails to mint when marketplace is paused', async () => {
      try {
        // pause marketplace
        await program.methods
          .toggleMarketplace()
          .accounts({
            marketplace: marketplace,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();

        // wait for transaction to confirm
        await sleep(2000);

        // verify marketplace is paused
        const marketplaceAccount = await program.account.marketplace.fetch(marketplace);
        assert.isTrue(marketplaceAccount.paused, 'Marketplace should be paused');

        await program.methods
          .mintUnlockKey(PINATA_URI, ENCRYPTED_KEY)
          .accounts({
            marketplace: marketplace,
            question: questionPda,
            unlockKey: unlockKeyPda,
            buyer: buyer.publicKey,
            buyerTokenAccount: buyerTokenAccount,
            creatorTokenAccount: creatorTokenAccount,
            platformTokenAccount: platformTokenAccount,
            bonkMint: bonkMint.publicKey,
            metadata: metadata,
            mint: nftMint.publicKey,
            mintAuthority: mintAuthority,
            updateAuthority: mintAuthority,
            tokenProgram: TOKEN_PROGRAM_ID,
            metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
            userState: userState,
          })
          .signers([buyer])
          .rpc();
        assert.fail('Expected transaction to fail');
      } catch (error: any) {
        const errorMessage = error.error?.errorMessage || error.message;
        assert.include(errorMessage, 'Marketplace is paused');
      } finally {
        // cleanup - unpause marketplace
        await program.methods
          .toggleMarketplace()
          .accounts({
            marketplace: marketplace,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();
        await sleep(2000);
      }
    });

    it('Fails to mint when max keys reached', async () => {
      try {
        // get current marketplace counter
        const marketplaceAccount = await program.account.marketplace.fetch(marketplace);
        const currentCounter = marketplaceAccount.questionCounter;

        // create question with max_keys = 1 using the correct counter
        const [questionPdaLimited] = PublicKey.findProgramAddressSync(
          [Buffer.from('question'), marketplace.toBuffer(), currentCounter.toArrayLike(Buffer, 'le', 8)],
          program.programId,
        );

        await program.methods
          .createQuestion(CONTENT_CID, CONTENT_HASH, UNLOCK_PRICE, new anchor.BN(1))
          .accounts({
            marketplace: marketplace,
            userState: userState,
            question: questionPdaLimited,
            creator: user.publicKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([user])
          .rpc();

        // verify question was created with correct parameters
        const questionAccount = await program.account.question.fetch(questionPdaLimited);
        assert.equal(questionAccount.maxKeys.toNumber(), 1);
        assert.equal(questionAccount.currentKeys.toNumber(), 0);

        // add delay between transactions
        await sleep(2000);

        const firstNftMint = Keypair.generate();
        await createMint(provider.connection, authority, mintAuthority, null, 0, firstNftMint);

        const [firstMetadata] = PublicKey.findProgramAddressSync(
          [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), firstNftMint.publicKey.toBuffer()],
          TOKEN_METADATA_PROGRAM_ID,
        );

        // get PDA for first unlock key using current_keys = 0
        const [firstKeyPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('unlock_key'), questionPdaLimited.toBuffer(), new anchor.BN(0).toArrayLike(Buffer, 'le', 8)],
          program.programId,
        );

        await program.methods
          .mintUnlockKey(PINATA_URI, ENCRYPTED_KEY)
          .accounts({
            marketplace: marketplace,
            question: questionPdaLimited,
            unlockKey: firstKeyPda,
            buyer: buyer.publicKey,
            buyerTokenAccount: buyerTokenAccount,
            creatorTokenAccount: creatorTokenAccount,
            platformTokenAccount: platformTokenAccount,
            bonkMint: bonkMint.publicKey,
            metadata: firstMetadata,
            mint: firstNftMint.publicKey,
            mintAuthority: mintAuthority,
            updateAuthority: mintAuthority,
            tokenProgram: TOKEN_PROGRAM_ID,
            metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
            userState: userState,
          })
          .signers([buyer])
          .rpc();

        // verify first mint succeeded
        const updatedQuestionAccount = await program.account.question.fetch(questionPdaLimited);
        assert.equal(updatedQuestionAccount.currentKeys.toNumber(), 1);

        // add delay between transactions
        await sleep(2000);

        // second mint attempt - should fail
        const secondNftMint = Keypair.generate();
        await createMint(provider.connection, authority, mintAuthority, null, 0, secondNftMint);

        const [secondMetadata] = PublicKey.findProgramAddressSync(
          [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), secondNftMint.publicKey.toBuffer()],
          TOKEN_METADATA_PROGRAM_ID,
        );

        // use current_keys = 1 for second key attempt
        const [secondKeyPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('unlock_key'), questionPdaLimited.toBuffer(), new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
          program.programId,
        );

        // this should fail with NoKeysAvailable
        await program.methods
          .mintUnlockKey(PINATA_URI, ENCRYPTED_KEY)
          .accounts({
            marketplace: marketplace,
            question: questionPdaLimited,
            unlockKey: secondKeyPda,
            buyer: buyer.publicKey,
            buyerTokenAccount: buyerTokenAccount,
            creatorTokenAccount: creatorTokenAccount,
            platformTokenAccount: platformTokenAccount,
            bonkMint: bonkMint.publicKey,
            metadata: secondMetadata,
            mint: secondNftMint.publicKey,
            mintAuthority: mintAuthority,
            updateAuthority: mintAuthority,
            tokenProgram: TOKEN_PROGRAM_ID,
            metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
            userState: userState,
          })
          .signers([buyer])
          .rpc();

        assert.fail('Expected transaction to fail');
      } catch (error: any) {
        const errorMessage = error.error?.errorMessage || error.message;
        assert.ok(
          errorMessage.includes('No keys available') || errorMessage.includes('NoKeysAvailable'),
          `Expected NoKeysAvailable error, got: ${errorMessage}`,
        );
      }
    });

    it('Prevents duplicate minting of the same token ID', async () => {
      try {
        // first mint - this should succeed
        await program.methods
          .mintUnlockKey(PINATA_URI, ENCRYPTED_KEY)
          .accounts({
            marketplace: marketplace,
            question: questionPda,
            unlockKey: unlockKeyPda,
            buyer: buyer.publicKey,
            buyerTokenAccount: buyerTokenAccount,
            creatorTokenAccount: creatorTokenAccount,
            platformTokenAccount: platformTokenAccount,
            bonkMint: bonkMint.publicKey,
            metadata: metadata,
            mint: nftMint.publicKey,
            mintAuthority: mintAuthority,
            updateAuthority: mintAuthority,
            tokenProgram: TOKEN_PROGRAM_ID,
            metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
            userState: userState,
          })
          .signers([buyer])
          .rpc();

        // add delay between transactions
        await sleep(2000);

        // create a new NFT mint for the second attempt
        const secondNftMint = Keypair.generate();
        await createMint(provider.connection, authority, mintAuthority, null, 0, secondNftMint);

        // find metadata for second attempt
        const [secondMetadata] = PublicKey.findProgramAddressSync(
          [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), secondNftMint.publicKey.toBuffer()],
          TOKEN_METADATA_PROGRAM_ID,
        );

        // try to mint again with the same PDA seeds
        // note: we're using the same seeds as the first mint to test duplicate prevention
        const [duplicateUnlockKeyPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('unlock_key'), questionPda.toBuffer(), new anchor.BN(0).toArrayLike(Buffer, 'le', 8)],
          program.programId,
        );

        await program.methods
          .mintUnlockKey(PINATA_URI, ENCRYPTED_KEY)
          .accounts({
            marketplace: marketplace,
            question: questionPda,
            unlockKey: duplicateUnlockKeyPda,
            buyer: buyer.publicKey,
            buyerTokenAccount: buyerTokenAccount,
            creatorTokenAccount: creatorTokenAccount,
            platformTokenAccount: platformTokenAccount,
            bonkMint: bonkMint.publicKey,
            metadata: secondMetadata,
            mint: secondNftMint.publicKey,
            mintAuthority: mintAuthority,
            updateAuthority: mintAuthority,
            tokenProgram: TOKEN_PROGRAM_ID,
            metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
            userState: userState,
          })
          .signers([buyer])
          .rpc();

        assert.fail('Expected transaction to fail');
      } catch (error: any) {
        // check for account already initialized error
        const errorMessage = error.toString();
        assert.ok(
          errorMessage.includes('custom program error: 0x0') || // Anchor account already initialized error
            errorMessage.includes('failed to send transaction') || // Transaction simulation failure
            errorMessage.includes('Account already initialized') || // Explicit error message
            errorMessage.includes('Error Code: AccountAlreadyInitialized') || // Anchor specific error
            errorMessage.includes('Error Code: ConstraintSeeds'), // Seeds constraint violation
          `Got unexpected error: ${errorMessage}`,
        );
      }
    });
  });

  describe('Listings', () => {
    let unlockKeyPda: PublicKey;
    const LIST_PRICE = new anchor.BN(2_000_000); // 2 BONK (6 decimals)
    const UPDATED_PRICE = new anchor.BN(3_000_000); // 3 BONK (6 decimals)
    const CONTENT_CID = 'QmT8JtG98Pu6YqHrRxiANrqjaC8ydz3F4uuQvRfQqC3T45';
    const CONTENT_HASH = Array(32).fill(1);

    beforeEach(async () => {
      try {
        // 1. airdrop SOL to necessary accounts
        const latestBlockhash = await provider.connection.getLatestBlockhash();

        // fund buyer with 10 SOL
        const buyerAirdropSig = await provider.connection.requestAirdrop(buyer.publicKey, 10 * LAMPORTS_PER_SOL);

        // wait for confirmation
        await provider.connection.confirmTransaction({
          signature: buyerAirdropSig,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

        await sleep(1000);

        // fund user with 10 SOL if needed
        const userBalance = await provider.connection.getBalance(user.publicKey);
        if (userBalance < 5 * LAMPORTS_PER_SOL) {
          const userAirdropSig = await provider.connection.requestAirdrop(user.publicKey, 10 * LAMPORTS_PER_SOL);
          await provider.connection.confirmTransaction({
            signature: userAirdropSig,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          });
          await sleep(1000);
        }

        // 2. initialize user state if not already initialized
        try {
          await program.account.userState.fetch(userState);
        } catch {
          await program.methods
            .initializeUserState()
            .accounts({
              userState: userState,
              user: user.publicKey,
              systemProgram: SystemProgram.programId,
            })
            .signers([user])
            .rpc();

          await sleep(1000);
        }

        // 3. get marketplace state
        const marketplaceAccount = await program.account.marketplace.fetch(marketplace);

        // 4. find PDA for question
        [questionPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('question'),
            marketplace.toBuffer(),
            marketplaceAccount.questionCounter.toArrayLike(Buffer, 'le', 8),
          ],
          program.programId,
        );

        // 5. create the question
        await program.methods
          .createQuestion(CONTENT_CID, CONTENT_HASH, UNLOCK_PRICE, MAX_KEYS)
          .accounts({
            marketplace: marketplace,
            userState: userState,
            question: questionPda,
            creator: user.publicKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([user])
          .rpc();

        await sleep(1000);

        // 6. create NFT mint
        const nftMint = Keypair.generate();
        await createMint(
          provider.connection,
          buyer, // Use buyer as payer
          mintAuthority,
          null,
          0,
          nftMint,
        );

        await sleep(1000);

        // 7. find metadata PDA
        [metadata] = PublicKey.findProgramAddressSync(
          [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), nftMint.publicKey.toBuffer()],
          TOKEN_METADATA_PROGRAM_ID,
        );

        // 8. find PDA for unlock key
        [unlockKeyPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('unlock_key'), questionPda.toBuffer(), new anchor.BN(0).toArrayLike(Buffer, 'le', 8)],
          program.programId,
        );

        // 9. get or create associated token accounts
        const buyerATA = await getAssociatedTokenAddress(bonkMint.publicKey, buyer.publicKey);

        const creatorATA = await getAssociatedTokenAddress(bonkMint.publicKey, user.publicKey);

        const platformATA = await getAssociatedTokenAddress(bonkMint.publicKey, authority.publicKey);

        // create ATAs if they don't exist
        try {
          await getAccount(provider.connection, buyerATA);
        } catch {
          await createAssociatedTokenAccount(provider.connection, buyer, bonkMint.publicKey, buyer.publicKey);
        }

        try {
          await getAccount(provider.connection, creatorATA);
        } catch {
          await createAssociatedTokenAccount(provider.connection, authority, bonkMint.publicKey, user.publicKey);
        }

        try {
          await getAccount(provider.connection, platformATA);
        } catch {
          await createAssociatedTokenAccount(provider.connection, authority, bonkMint.publicKey, authority.publicKey);
        }

        await sleep(1000);

        // 10. mint BONK tokens to buyer
        await mintTo(
          provider.connection,
          authority,
          bonkMint.publicKey,
          buyerATA,
          authority,
          UNLOCK_PRICE.toNumber() * 2, // Mint extra for fees
        );

        await sleep(1000);

        // 11. mint the unlock key
        await program.methods
          .mintUnlockKey('https://example.com/metadata.json', Buffer.from('encrypted_key'))
          .accounts({
            marketplace: marketplace,
            question: questionPda,
            unlockKey: unlockKeyPda,
            buyer: buyer.publicKey,
            buyerTokenAccount: buyerATA,
            creatorTokenAccount: creatorATA,
            platformTokenAccount: platformATA,
            bonkMint: bonkMint.publicKey,
            metadata,
            mint: nftMint.publicKey,
            mintAuthority: mintAuthority,
            updateAuthority: mintAuthority,
            tokenProgram: TOKEN_PROGRAM_ID,
            metadataProgram: TOKEN_METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
            userState: userState,
          })
          .signers([buyer])
          .rpc();

        // add delay after all setup is complete
        await sleep(2000);
      } catch (error) {
        console.error('BeforeEach setup error:', error);
        if ('logs' in error) {
          console.error('Error logs:', error.logs);
        }
        throw error;
      }
    });

    it('Successfully lists a key', async () => {
      try {
        await program.methods
          .listKey(LIST_PRICE)
          .accounts({
            marketplace,
            unlockKey: unlockKeyPda,
            seller: buyer.publicKey,
            userState,
          })
          .signers([buyer])
          .rpc();

        const unlockKeyAccount = await program.account.unlockKey.fetch(unlockKeyPda);
        assert.isTrue(unlockKeyAccount.isListed);
        assert.equal(unlockKeyAccount.listPrice.toNumber(), LIST_PRICE.toNumber());
      } catch (error) {
        console.error('List key error:', error);
        throw error;
      }
    });

    it('Successfully updates listing price', async () => {
      try {
        // first list the key
        await program.methods
          .listKey(LIST_PRICE)
          .accounts({
            marketplace,
            unlockKey: unlockKeyPda,
            seller: buyer.publicKey,
            userState,
          })
          .signers([buyer])
          .rpc();

        await sleep(2000);

        // then update the listing
        await program.methods
          .updateListing(UPDATED_PRICE)
          .accounts({
            marketplace,
            unlockKey: unlockKeyPda,
            seller: buyer.publicKey,
          })
          .signers([buyer])
          .rpc();

        const unlockKeyAccount = await program.account.unlockKey.fetch(unlockKeyPda);
        assert.isTrue(unlockKeyAccount.isListed);
        assert.equal(unlockKeyAccount.listPrice.toNumber(), UPDATED_PRICE.toNumber());
      } catch (error) {
        console.error('Update listing error:', error);
        throw error;
      }
    });

    it('Successfully cancels a listing', async () => {
      try {
        // first list the key
        await program.methods
          .listKey(LIST_PRICE)
          .accounts({
            marketplace,
            unlockKey: unlockKeyPda,
            seller: buyer.publicKey,
            userState,
          })
          .signers([buyer])
          .rpc();

        await sleep(2000);

        // then cancel the listing
        await program.methods
          .cancelListing()
          .accounts({
            marketplace,
            unlockKey: unlockKeyPda,
            seller: buyer.publicKey,
          })
          .signers([buyer])
          .rpc();

        const unlockKeyAccount = await program.account.unlockKey.fetch(unlockKeyPda);
        assert.isFalse(unlockKeyAccount.isListed);
        assert.equal(unlockKeyAccount.listPrice.toNumber(), 0);
      } catch (error) {
        console.error('Cancel listing error:', error);
        throw error;
      }
    });

    it('Fails to list when marketplace is paused', async () => {
      try {
        // pause marketplace
        await program.methods
          .toggleMarketplace()
          .accounts({
            marketplace,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();

        await sleep(2000);

        // try to list key
        await program.methods
          .listKey(LIST_PRICE)
          .accounts({
            marketplace,
            unlockKey: unlockKeyPda,
            seller: buyer.publicKey,
            userState,
          })
          .signers([buyer])
          .rpc();

        assert.fail('Expected transaction to fail');
      } catch (error: any) {
        const errorMessage = error.error?.errorMessage || error.message;
        assert.include(errorMessage, 'Marketplace is paused');
      } finally {
        // cleanup - unpause marketplace
        await program.methods
          .toggleMarketplace()
          .accounts({
            marketplace,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();
      }
    });

    it('Fails to list with invalid price', async () => {
      try {
        await program.methods
          .listKey(new anchor.BN(0))
          .accounts({
            marketplace,
            unlockKey: unlockKeyPda,
            seller: buyer.publicKey,
            userState,
          })
          .signers([buyer])
          .rpc();

        assert.fail('Expected transaction to fail');
      } catch (error: any) {
        const errorMessage = error.error?.errorMessage || error.message;
        assert.include(errorMessage, 'Invalid price');
      }
    });
  });

  describe('Buy Unlock Keys', () => {
    let unlockKeyPda: PublicKey;
    let questionPda: PublicKey;
    const LIST_PRICE = new anchor.BN(2_000_000); // 2 BONK (6 decimals)
    const ENCRYPTED_KEY = Buffer.from('encrypted_key_data');
    const NEW_ENCRYPTED_KEY = Buffer.from('new_encrypted_key_data');
    const METADATA_URI = 'https://example.com/metadata.json';

    // new buyer for testing purchases
    const newBuyer = Keypair.generate();
    let newBuyerTokenAccount: PublicKey;

    beforeEach(async () => {
      try {
        const marketplaceAccount = await program.account.marketplace.fetch(marketplace);
        if (marketplaceAccount.paused) {
          await program.methods
            .toggleMarketplace()
            .accounts({
              marketplace,
              authority: authority.publicKey,
            })
            .signers([authority])
            .rpc();
          await sleep(1000);
        }

        // 1. airdrop SOL to all participants
        const latestBlockhash = await provider.connection.getLatestBlockhash();

        // airdrop to buyer and original seller
        for (const kp of [buyer, newBuyer, user]) {
          const signature = await provider.connection.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
          await provider.connection.confirmTransaction({
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          });
          await sleep(1000);
        }

        // 2. initialize user states for all participants
        const userStates = [user, buyer, newBuyer];

        for (const signer of userStates) {
          const [userStatePda] = PublicKey.findProgramAddressSync(
            [Buffer.from('user_state'), signer.publicKey.toBuffer()],
            program.programId,
          );

          try {
            await program.account.userState.fetch(userStatePda);
          } catch {
            await program.methods
              .initializeUserState()
              .accounts({
                userState: userStatePda,
                user: signer.publicKey,
                systemProgram: SystemProgram.programId,
              })
              .signers([signer])
              .rpc();
            await sleep(1000);
          }
        }

        let newBuyerTokenAccount: PublicKey;
        let buyerTokenAccount: PublicKey;
        let creatorTokenAccount: PublicKey;
        let platformTokenAccount: PublicKey;

        // initialize token accounts
        platformTokenAccount = await getAssociatedTokenAddress(bonkMint.publicKey, authority.publicKey);
        buyerTokenAccount = await getAssociatedTokenAddress(bonkMint.publicKey, buyer.publicKey);
        creatorTokenAccount = await getAssociatedTokenAddress(bonkMint.publicKey, user.publicKey);
        newBuyerTokenAccount = await getAssociatedTokenAddress(bonkMint.publicKey, newBuyer.publicKey);

        // create and verify each account
        for (const [account, owner] of [
          [newBuyerTokenAccount, newBuyer.publicKey],
          [buyerTokenAccount, buyer.publicKey],
          [creatorTokenAccount, user.publicKey],
          [platformTokenAccount, authority.publicKey],
        ]) {
          try {
            await getAccount(provider.connection, account);
          } catch {
            await createAssociatedTokenAccount(provider.connection, authority, bonkMint.publicKey, owner);
          }
          await sleep(1000);

          // mint tokens
          await mintTo(
            provider.connection,
            authority,
            bonkMint.publicKey,
            account,
            authority,
            LIST_PRICE.toNumber() * 2,
          );
          await sleep(1000);
        }

        [questionPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('question'),
            marketplace.toBuffer(),
            marketplaceAccount.questionCounter.toArrayLike(Buffer, 'le', 8),
          ],
          program.programId,
        );

        await program.methods
          .createQuestion(CONTENT_CID, CONTENT_HASH, UNLOCK_PRICE, MAX_KEYS)
          .accounts({
            marketplace,
            userState,
            question: questionPda,
            creator: user.publicKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([user])
          .rpc();

        await sleep(1000);

        // 5. create NFT mint and metadata
        const nftMint = Keypair.generate();
        await createMint(provider.connection, authority, mintAuthority, null, 0, nftMint);

        [metadata] = PublicKey.findProgramAddressSync(
          [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), nftMint.publicKey.toBuffer()],
          TOKEN_METADATA_PROGRAM_ID,
        );

        // 6. find PDA for unlock key
        [unlockKeyPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('unlock_key'), questionPda.toBuffer(), new anchor.BN(0).toArrayLike(Buffer, 'le', 8)],
          program.programId,
        );

        // 7. verify token accounts
        assert(buyerTokenAccount, 'Buyer token account not initialized');
        assert(newBuyerTokenAccount, 'New buyer token account not initialized');
        assert(creatorTokenAccount, 'Creator token account not initialized');

        // 8. mint key to original buyer
        await program.methods
          .mintUnlockKey(METADATA_URI, ENCRYPTED_KEY)
          .accounts({
            marketplace,
            question: questionPda,
            unlockKey: unlockKeyPda,
            buyer: buyer.publicKey,
            buyerTokenAccount,
            creatorTokenAccount,
            platformTokenAccount,
            bonkMint: bonkMint.publicKey,
            metadata,
            mint: nftMint.publicKey,
            mintAuthority,
            updateAuthority: mintAuthority,
            tokenProgram: TOKEN_PROGRAM_ID,
            metadataProgram: TOKEN_METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
            userState,
          })
          .signers([buyer])
          .rpc();

        await sleep(1000);

        // 9. list the key for sale
        await program.methods
          .listKey(LIST_PRICE)
          .accounts({
            marketplace,
            unlockKey: unlockKeyPda,
            seller: buyer.publicKey,
            userState,
          })
          .signers([buyer])
          .rpc();

        await sleep(2000);
      } catch (error) {
        console.error('BeforeEach setup error:', error);
        if ('logs' in error) {
          console.error('Error logs:', error.logs);
        }
        throw error;
      }
    });

    it('Successfully buys a listed key', async () => {
      try {
        // airdrop SOL to new buyer for account creation
        const latestBlockhash = await provider.connection.getLatestBlockhash();
        const signature = await provider.connection.requestAirdrop(newBuyer.publicKey, 2 * LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction({
          signature,
          ...latestBlockhash,
        });
        await sleep(1000);

        // initialize new buyer's user state only if it doesn't exist
        const [newBuyerState] = PublicKey.findProgramAddressSync(
          [Buffer.from('user_state'), newBuyer.publicKey.toBuffer()],
          program.programId,
        );

        try {
          await program.account.userState.fetch(newBuyerState);
          console.log('User state already exists');
        } catch {
          // only initialize if it doesn't exist
          await program.methods
            .initializeUserState()
            .accounts({
              userState: newBuyerState,
              user: newBuyer.publicKey,
              systemProgram: SystemProgram.programId,
            })
            .signers([newBuyer])
            .rpc();
          await sleep(1000);
        }

        // initialize newBuyerTokenAccount
        newBuyerTokenAccount = await getAssociatedTokenAddress(bonkMint.publicKey, newBuyer.publicKey);

        // create ATA for new buyer
        try {
          await getAccount(provider.connection, newBuyerTokenAccount);
        } catch {
          await createAssociatedTokenAccount(provider.connection, newBuyer, bonkMint.publicKey, newBuyer.publicKey);
          await sleep(1000);
        }

        // mint tokens to buyer
        await mintTo(
          provider.connection,
          authority,
          bonkMint.publicKey,
          newBuyerTokenAccount,
          authority,
          LIST_PRICE.toNumber() * 2,
        );
        await sleep(1000);

        // Verify state before purchase
        const preUnlockKeyAccount = await program.account.unlockKey.fetch(unlockKeyPda);
        assert.isTrue(preUnlockKeyAccount.isListed, 'Key should be listed before purchase');
        assert.ok(preUnlockKeyAccount.owner.equals(buyer.publicKey), 'Incorrect initial owner');

        // Execute purchase
        await program.methods
          .buyListedKey(NEW_ENCRYPTED_KEY)
          .accounts({
            marketplace,
            question: questionPda,
            unlockKey: unlockKeyPda,
            buyer: newBuyer.publicKey,
            buyerTokenAccount: newBuyerTokenAccount,
            sellerTokenAccount: buyerTokenAccount,
            creatorTokenAccount,
            platformTokenAccount,
            bonkMint: bonkMint.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            userState: newBuyerState,
          })
          .signers([newBuyer])
          .rpc();

        // Verify the purchase
        const unlockKeyAccount = await program.account.unlockKey.fetch(unlockKeyPda);
        assert.equal(unlockKeyAccount.discriminator, 1, 'Incorrect unlock key discriminator');
        assert.ok(unlockKeyAccount.owner.equals(newBuyer.publicKey), 'Ownership not transferred correctly');
        assert.deepEqual(
          Array.from(unlockKeyAccount.encryptedKey),
          Array.from(NEW_ENCRYPTED_KEY),
          'Encrypted key not updated correctly',
        );
        assert.isFalse(unlockKeyAccount.isListed, 'Key should not be listed after purchase');
        assert.equal(unlockKeyAccount.listPrice.toNumber(), 0, 'List price should be reset to 0');
      } catch (error) {
        console.error('Buy listed key error:', error);
        if ('logs' in error) {
          console.error('Error logs:', error.logs);
        }
        throw error;
      }
    });
    it('Fails to buy when marketplace is paused', async () => {
      try {
        // initialize newBuyerTokenAccount if not already done
        newBuyerTokenAccount = await getAssociatedTokenAddress(bonkMint.publicKey, newBuyer.publicKey);

        // create ATA for new buyer if it doesn't exist
        try {
          await getAccount(provider.connection, newBuyerTokenAccount);
        } catch {
          await createAssociatedTokenAccount(provider.connection, authority, bonkMint.publicKey, newBuyer.publicKey);
          await sleep(1000);
        }

        // Mint tokens to new buyer
        await mintTo(
          provider.connection,
          authority,
          bonkMint.publicKey,
          newBuyerTokenAccount,
          authority,
          LIST_PRICE.toNumber() * 2,
        );
        await sleep(1000);

        // pause marketplace
        await program.methods
          .toggleMarketplace()
          .accounts({
            marketplace,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();

        await sleep(2000);

        // get new buyer's user state PDA
        const [newBuyerState] = PublicKey.findProgramAddressSync(
          [Buffer.from('user_state'), newBuyer.publicKey.toBuffer()],
          program.programId,
        );

        // initialize user state if not already done
        try {
          await program.account.userState.fetch(newBuyerState);
        } catch {
          await program.methods
            .initializeUserState()
            .accounts({
              userState: newBuyerState,
              user: newBuyer.publicKey,
              systemProgram: SystemProgram.programId,
            })
            .signers([newBuyer])
            .rpc();
          await sleep(1000);
        }

        await program.methods
          .buyListedKey(NEW_ENCRYPTED_KEY)
          .accounts({
            marketplace,
            question: questionPda,
            unlockKey: unlockKeyPda,
            buyer: newBuyer.publicKey,
            buyerTokenAccount: newBuyerTokenAccount,
            sellerTokenAccount: buyerTokenAccount,
            creatorTokenAccount,
            platformTokenAccount,
            bonkMint: bonkMint.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            userState: newBuyerState,
          })
          .signers([newBuyer])
          .rpc();

        assert.fail('Expected transaction to fail');
      } catch (error: any) {
        const errorMessage = error.error?.errorMessage || error.message;
        assert.ok(
          errorMessage.includes('Marketplace is paused') || errorMessage.includes('MarketplacePaused'),
          `Expected marketplace paused error, got: ${errorMessage}`,
        );
      } finally {
        // cleanup - unpause marketplace
        await program.methods
          .toggleMarketplace()
          .accounts({
            marketplace,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();
        await sleep(2000);
      }
    });

    it('Fails to buy own listed key', async () => {
      try {
        await program.methods
          .buyListedKey(NEW_ENCRYPTED_KEY)
          .accounts({
            marketplace,
            question: questionPda,
            unlockKey: unlockKeyPda,
            buyer: buyer.publicKey,
            buyerTokenAccount,
            sellerTokenAccount: buyerTokenAccount,
            creatorTokenAccount,
            platformTokenAccount,
            bonkMint: bonkMint.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            userState,
          })
          .signers([buyer])
          .rpc();

        assert.fail('Expected transaction to fail');
      } catch (error: any) {
        const errorMessage = error.error?.errorMessage || error.message;
        assert.include(errorMessage.toLowerCase(), 'cannot buy your own key');
      }
    });

    it('Fails to buy with insufficient funds', async () => {
      try {
        const poorBuyer = Keypair.generate();

        // initialize user state for poor buyer
        const [poorBuyerState] = PublicKey.findProgramAddressSync(
          [Buffer.from('user_state'), poorBuyer.publicKey.toBuffer()],
          program.programId,
        );

        // airdrop some SOL to poor buyer for account creation
        const latestBlockhash = await provider.connection.getLatestBlockhash();
        const signature = await provider.connection.requestAirdrop(poorBuyer.publicKey, LAMPORTS_PER_SOL / 2);
        await provider.connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });
        await sleep(1000);

        await program.methods
          .initializeUserState()
          .accounts({
            userState: poorBuyerState,
            user: poorBuyer.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([poorBuyer])
          .rpc();

        await sleep(1000);

        // create token account for poor buyer but don't fund it
        const poorBuyerTokenAccount = await createAssociatedTokenAccount(
          provider.connection,
          poorBuyer,
          bonkMint.publicKey,
          poorBuyer.publicKey,
        );

        await sleep(1000);

        try {
          await program.methods
            .buyListedKey(NEW_ENCRYPTED_KEY)
            .accounts({
              marketplace,
              question: questionPda,
              unlockKey: unlockKeyPda,
              buyer: poorBuyer.publicKey,
              buyerTokenAccount: poorBuyerTokenAccount,
              sellerTokenAccount: buyerTokenAccount,
              creatorTokenAccount,
              platformTokenAccount,
              bonkMint: bonkMint.publicKey,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              userState: poorBuyerState,
            })
            .signers([poorBuyer])
            .rpc();

          assert.fail('Expected transaction to fail');
        } catch (error: any) {
          // handle both custom program errors and token program errors
          const errorMessage = error.toString();
          assert.ok(
            errorMessage.includes('0x1') || // anchor error code
              errorMessage.includes('insufficient funds') || // SPL token error
              errorMessage.includes('InsufficientFunds') || // our custom error
              errorMessage.includes('custom program error: 0x1'), // alternative error format
            `Got unexpected error: ${errorMessage}`,
          );
        }
      } catch (error) {
        console.error('Test setup error:', error);
        throw error;
      }
    });
  });

  it('Initializes with correct BONK mint', async () => {
    const marketplaceAccount = await program.account.marketplace.fetch(marketplace);
    assert.ok(marketplaceAccount.bonkMint.equals(bonkMint.publicKey));
  });

  it('Prints UnlockKey discriminator', () => {
    const discriminator = BorshAccountsCoder.accountDiscriminator('UnlockKey');
    console.log('UnlockKey discriminator:', discriminator);
  });
});
