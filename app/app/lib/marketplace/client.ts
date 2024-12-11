import { Program, web3, BN } from '@project-serum/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { QuestionAnswerParams, MarketplaceState } from './types';
import { WalletContextState } from '@solana/wallet-adapter-react';

export class MarketplaceClient {
  private static instance: MarketplaceClient | null = null;
  private marketplacePda: PublicKey | null = null;
  private marketplaceState: MarketplaceState | null = null;

  private constructor(
    private program: Program,
    private connection: Connection,
    private marketplaceAuthority: PublicKey
  ) {}

  public static getInstance(
    program: Program,
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
}
