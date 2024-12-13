import { Program, web3, BN } from '@project-serum/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { QuestionAnswerParams, MarketplaceState, Question } from './types';
import { MyfaqIs } from '../types/myfaq_is';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { MPL_TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { decryptContent } from '~/utils/encryption.client';
import axios from 'axios';

export interface MintUnlockKeyParams {
  questionId: string;
  metadataUri: string;
  encryptedKey: Uint8Array;
  wallet: WalletContextState;
}

export interface DecryptContentParams {
  questionId: string;
  encryptedContent: string;
  wallet: WalletContextState;
}

export class MarketplaceClient {
  private static instance: MarketplaceClient | null = null;
  private marketplacePda: PublicKey | null = null;
  private marketplaceState: MarketplaceState | null = null;

  private constructor(
    private program: Program<MyfaqIs>,
    private connection: Connection,
    private marketplaceAuthority: PublicKey
  ) {}

  public static getInstance(
    program: Program<MyfaqIs>,
    connection: Connection,
    marketplaceAuthority: PublicKey
  ): MarketplaceClient {
    if (!MarketplaceClient.instance) {
      MarketplaceClient.instance = new MarketplaceClient(
        program,
        connection,
        marketplaceAuthority
      );
    }
    return MarketplaceClient.instance;
  }

  public static resetInstance(): void {
    MarketplaceClient.instance = null;
  }

  private async getMarketplacePda(): Promise<PublicKey> {
    if (!this.marketplacePda) {
      [this.marketplacePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('marketplace'), this.marketplaceAuthority.toBuffer()],
        this.program.programId
      );
    }
    return this.marketplacePda;
  }

  public async getMarketplaceState(): Promise<MarketplaceState> {
    if (!this.marketplaceState) {
      const marketplacePda = await this.getMarketplacePda();

      try {
        const marketplaceAccount =
          await this.program.account.marketplace.fetch(marketplacePda);

        this.marketplaceState = {
          authority: marketplaceAccount.authority,
          questionCounter: marketplaceAccount.questionCounter,
          platformFeeBps: marketplaceAccount.platformFeeBps,
          creatorRoyaltyBps: marketplaceAccount.creatorRoyaltyBps,
          totalVolume: marketplaceAccount.totalVolume,
          paused: marketplaceAccount.paused,
          pausedOperations: marketplaceAccount.pausedOperations,
          bonkMint: marketplaceAccount.bonkMint,
        } as MarketplaceState;
      } catch (error) {
        console.error('Failed to fetch marketplace account:', error);
        throw new Error(
          `Marketplace not initialized at ${marketplacePda.toString()}. ` +
            'Please ensure the marketplace has been properly initialized.'
        );
      }
    }
    return this.marketplaceState;
  }

  private async ensureWalletConnected(
    wallet: WalletContextState
  ): Promise<PublicKey> {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    return wallet.publicKey;
  }

  private async confirmTx(signature: string) {
    const latestBlockhash = await this.connection.getLatestBlockhash();
    await this.connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });
  }

  public async createQuestion({
    contentCid,
    contentMetadataHash,
    unlockPrice,
    maxKeys,
    wallet,
  }: QuestionAnswerParams): Promise<string> {
    try {
      const publicKey = await this.ensureWalletConnected(wallet);
      // convert contentMetadataHash from hex to Uint8Array
      const contentHash = new Uint8Array(
        contentMetadataHash.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
      );

      // get PDAs
      const [userStatePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('user_state'), publicKey.toBuffer()],
        this.program.programId
      );

      const marketplacePda = await this.getMarketplacePda();
      const marketplaceState = await this.getMarketplaceState();

      // get the next question counter
      const questionCounter = marketplaceState.questionCounter;

      // derive the question PDA
      const [questionPda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('question'),
          marketplacePda.toBuffer(),
          questionCounter.toArrayLike(Buffer, 'le', 8),
        ],
        this.program.programId
      );

      // ensure user state is initialized
      await this.ensureUserStateInitialized(wallet);

      // send transaction
      const tx = await this.program.methods
        .createQuestion(
          contentCid,
          Array.from(contentHash),
          new BN(unlockPrice),
          new BN(maxKeys)
        )
        .accounts({
          marketplace: marketplacePda,
          userState: userStatePda,
          question: questionPda,
          creator: publicKey,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .transaction();

      // sign and send the transaction using the wallet
      const signature = await wallet.sendTransaction(tx, this.connection);

      // wait for confirmation
      await this.confirmTx(signature);

      // invalidate marketplace state cache
      this.marketplaceState = null;

      return questionCounter.toString();
    } catch (error) {
      console.error('Failed to create question:', error);
      throw error;
    }
  }

  private async ensureUserStateInitialized(
    wallet: WalletContextState
  ): Promise<void> {
    const publicKey = await this.ensureWalletConnected(wallet);
    const [userStatePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('user_state'), publicKey.toBuffer()],
      this.program.programId
    );

    try {
      await this.program.account.userState.fetch(userStatePda);
    } catch (error) {
      // send transaction
      const tx = await this.program.methods
        .initializeUserState()
        .accounts({
          userState: userStatePda,
          user: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .transaction();

      // sign and send the transaction using the wallet
      const signature = await wallet.sendTransaction(tx, this.connection);

      await this.confirmTx(signature);
    }
  }

  private async generateDecryptionMaterial(
    wallet: WalletContextState,
    questionId: string
  ): Promise<{ message: string; signature: string; txSignature: string }> {
    if (!wallet.signMessage || !wallet.signTransaction) {
      throw new Error('Wallet does not support required signing operations');
    }

    // 1. create and sign the message
    const message = `Unlock question #${questionId} at timestamp ${Date.now()}`;
    const messageBytes = new TextEncoder().encode(message);
    const signature = await wallet.signMessage(messageBytes);

    // 2. create and sign a dummy transaction to get an unforgeable signature
    const recentBlockhash = await this.connection.getLatestBlockhash();
    const tx = new web3.Transaction({
      feePayer: wallet.publicKey,
      ...recentBlockhash,
    }).add(
      web3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey!,
        toPubkey: wallet.publicKey!,
        lamports: 0,
      })
    );

    const signedTx = await wallet.signTransaction(tx);
    const txSignature = signedTx.signatures[0].signature?.toString('hex') || '';

    return {
      message,
      signature: Buffer.from(signature).toString('hex'),
      txSignature,
    };
  }

  // @note: this will be used in the future
  public async decryptContent({
    questionId,
    encryptedContent,
    wallet,
  }: DecryptContentParams): Promise<string> {
    try {
      // get all required signatures
      const decryptionMaterial = await this.generateDecryptionMaterial(
        wallet,
        questionId
      );

      // get the decryption key from the server
      const response = await fetch('/api/v1/decrypt-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          ...decryptionMaterial,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get decryption key');
      }

      const { decryptionKey } = await response.json();

      // use the key to decrypt the content locally
      return decryptContent(encryptedContent, decryptionKey);
    } catch (error) {
      console.error('Failed to decrypt content:', error);
      throw error;
    }
  }

  public async mintUnlockKey({
    questionId,
    wallet,
  }: MintUnlockKeyParams): Promise<string> {
    let data: any;
    try {
      const publicKey = await this.ensureWalletConnected(wallet);

      // Get all required signatures
      const decryptionMaterial = await this.generateDecryptionMaterial(
        wallet,
        questionId
      );

      // First make API call to get metadata and encrypted key
      const response = await fetch('/api/v1/mint-unlock-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          tokenId: (
            await this.currentKeysCount(parseInt(questionId))
          ).toString(),
          ...decryptionMaterial,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to prepare unlock key');
      }

      ({ data } = await response.json());

      // Continue with on-chain minting...
      const marketplacePda = await this.getMarketplacePda();
      const marketplaceState = await this.getMarketplaceState();

      // Get question PDA
      const [questionPda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('question'),
          marketplacePda.toBuffer(),
          new BN(questionId).toArrayLike(Buffer, 'le', 8),
        ],
        this.program.programId
      );

      // get question account to get current keys count
      const questionAccount =
        await this.program.account.question.fetch(questionPda);

      // get unlock key PDA
      const [unlockKeyPda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('unlock_key'),
          questionPda.toBuffer(),
          questionAccount.currentKeys.toArrayLike(Buffer, 'le', 8),
        ],
        this.program.programId
      );

      // get mint authority PDA
      const [mintAuthority] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('mint_authority')],
        this.program.programId
      );

      // get token accounts
      const buyerTokenAccount = await getAssociatedTokenAddress(
        marketplaceState.bonkMint,
        publicKey
      );

      const creatorTokenAccount = await getAssociatedTokenAddress(
        marketplaceState.bonkMint,
        questionAccount.creator
      );

      const platformTokenAccount = await getAssociatedTokenAddress(
        marketplaceState.bonkMint,
        marketplaceState.authority
      );

      // create NFT mint
      const nftMint = web3.Keypair.generate();

      // get metadata PDA
      const [metadata] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID).toBuffer(),
          nftMint.publicKey.toBuffer(),
        ],
        new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID)
      );

      // ensure user state is initialized
      await this.ensureUserStateInitialized(wallet);

      // get user state PDA
      const [userStatePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('user_state'), publicKey.toBuffer()],
        this.program.programId
      );

      const metadataUri = `ipfs://${data.cid}`;

      // send transaction
      const tx = await this.program.methods
        .mintUnlockKey(metadataUri, data.encryptionKey)
        .accounts({
          marketplace: marketplacePda,
          question: questionPda,
          unlockKey: unlockKeyPda,
          buyer: publicKey,
          buyerTokenAccount,
          creatorTokenAccount,
          platformTokenAccount,
          bonkMint: marketplaceState.bonkMint,
          metadata,
          mint: nftMint.publicKey,
          mintAuthority,
          updateAuthority: mintAuthority,
          tokenProgram: TOKEN_PROGRAM_ID,
          metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
          userState: userStatePda,
        })
        .transaction();

      // sign and send transaction
      const signature = await wallet.sendTransaction(tx, this.connection, {
        signers: [nftMint],
      });

      // wait for confirmation
      await this.confirmTx(signature);

      // return the token ID (current keys count)
      return questionAccount.currentKeys.toString();
    } catch (error) {
      // clean up IPFS pin if we have metadata URI and the transaction failed
      if (data?.metadataUri) {
        try {
          await axios.post('/api/v1/ipfs/unpin', {
            cid: data.metadataUri,
            type: 'ANSWER',
          });
        } catch (cleanupError) {
          console.error('Failed to clean up IPFS pin:', cleanupError);
        }
      }
      throw error;
    }
  }

  public async currentKeysCount(questionId: number) {
    try {
      const marketplacePda = await this.getMarketplacePda();

      // Get question PDA
      const [questionPda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from('question'),
          marketplacePda.toBuffer(),
          new BN(questionId).toArrayLike(Buffer, 'le', 8),
        ],
        this.program.programId
      );

      // Get question account to get current keys count
      const questionAccount =
        await this.program.account.question.fetch(questionPda);

      return questionAccount.currentKeys.toArray();
    } catch (error) {
      console.error('Failed to find question current keys:', error);
      throw error;
    }
  }
}
