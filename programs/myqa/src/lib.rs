use anchor_lang::prelude::*;
use anchor_spl::{
    token::{self, Token, Transfer, Mint, TokenAccount},
    metadata::*,
    associated_token::AssociatedToken,
};

use mpl_token_metadata::types::DataV2;

declare_id!("EsXaHoxZzsBAmMGKVWrNgysfs2Rv1XasV1JTHdyvwskM");

// Fee constants as basis points (1 basis point = 0.01%)
const INITIAL_PLATFORM_FEE_BPS: u16 = 500;  // 5%
const INITIAL_CREATOR_ROYALTY_BPS: u16 = 200;  // 2%
const MAX_FEE_BPS: u16 = 1000;  // 10% maximum fee
const MAX_URI_LENGTH: usize = 200;

// Security constants
const MAX_QUESTIONS_PER_USER: u64 = 100;
#[cfg(not(feature = "test"))]
const OPERATION_COOLDOWN: i64 = 60; // 60 seconds for production

const MIN_METADATA_LENGTH: usize = 5;
const MAX_ENCRYPTED_KEY_LENGTH: usize = 1024;
const MIN_OPERATION_COOLDOWN: i64 = 300; // 5 minutes
const MAX_TOTAL_FEE_BPS: u16 = 9000;    // 90% maximum total fee
const MIN_ACCOUNT_SPACE: usize = 8;      // Discriminator

// For IPFS CID validation
const IPFS_CID_LENGTH: usize = 46;
const MAX_CID_LENGTH: usize = 64; 

// Unlock key size
const UNLOCK_KEY_BASE_SIZE: usize = 8 + // anchor account discriminator
    1 + // discriminator: u8 field
    32 + // owner: Pubkey
    32 + // question: Pubkey
    8 +  // token_id: u64
    1 +  // is_listed: bool
    8 +  // list_price: u64
    8 +  // mint_time: i64
    8 +  // last_sold_price: u64
    8 +  // last_sold_time: i64
    8;   // list_time: i64

// Add this near the top of the file with other constants
const UNLOCK_KEY_DISCRIMINATOR: u8 = 1;

#[account]
pub struct UserState {
    pub questions_created: u64,
    pub last_operation_time: i64,
    pub is_blacklisted: bool,
}

#[program]
pub mod myqa {
    use super::*;

    pub fn initialize_user_state(ctx: Context<InitializeUserState>) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        user_state.questions_created = 0;
        user_state.last_operation_time = Clock::get()?.unix_timestamp - MIN_OPERATION_COOLDOWN;
        user_state.is_blacklisted = false;
        Ok(())
    }

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.treasury = ctx.accounts.treasury.key();
        marketplace.question_counter = 0;
        marketplace.platform_fee_bps = INITIAL_PLATFORM_FEE_BPS;
        marketplace.creator_royalty_bps = INITIAL_CREATOR_ROYALTY_BPS;
        marketplace.total_volume = 0;
        marketplace.paused = false;
        marketplace.paused_operations = PausedOperations::default();
        marketplace.bonk_mint = ctx.accounts.bonk_mint.key();

        emit!(MarketplaceInitialized {
            authority: marketplace.authority,
            platform_fee_bps: INITIAL_PLATFORM_FEE_BPS,
            creator_royalty_bps: INITIAL_CREATOR_ROYALTY_BPS,
            bonk_mint: marketplace.bonk_mint,
        });

        Ok(())
    }

    pub fn update_treasury(ctx: Context<UpdateTreasury>, new_treasury: Pubkey) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        
        emit!(TreasuryUpdated {
            previous_treasury: marketplace.treasury,
            new_treasury,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        marketplace.treasury = new_treasury;
        Ok(())
    }

    pub fn update_fees(
        ctx: Context<UpdateFees>,
        new_platform_fee_bps: u16,
        new_creator_royalty_bps: u16,
    ) -> Result<()> {
        require!(!ctx.accounts.marketplace.paused, ErrorCode::MarketplacePaused);
        require!(
            new_platform_fee_bps <= MAX_FEE_BPS,
            ErrorCode::FeeTooHigh
        );
        require!(
            new_creator_royalty_bps <= MAX_FEE_BPS,
            ErrorCode::FeeTooHigh
        );
        
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.platform_fee_bps = new_platform_fee_bps;
        marketplace.creator_royalty_bps = new_creator_royalty_bps;
        
        emit!(FeeUpdateEvent {
            platform_fee_bps: new_platform_fee_bps,
            creator_royalty_bps: new_creator_royalty_bps
        });
        
        Ok(())
    }

    pub fn create_question(
        ctx: Context<CreateQuestion>,
        content_cid: String,
        content_hash: [u8; 32],
        unlock_price: u64,
        max_keys: u64,
    ) -> Result<()> {

        require!(!ctx.accounts.marketplace.paused, ErrorCode::MarketplacePaused);
        require!(
            !ctx.accounts.marketplace.paused_operations.create_question,
            ErrorCode::OperationPaused
        );

        let user_state = &mut ctx.accounts.user_state;
        let current_time = Clock::get()?.unix_timestamp;

        require!(
            !user_state.is_blacklisted,
            ErrorCode::UserBlacklisted
        );
        
        #[cfg(not(feature = "test"))]
        require!(
            current_time - user_state.last_operation_time >= OPERATION_COOLDOWN,
            ErrorCode::RateLimitExceeded
        );
        require!(
            user_state.questions_created < MAX_QUESTIONS_PER_USER,
            ErrorCode::TooManyQuestions
        );

        // Validate CID format and length
        require!(
            content_cid.len() >= IPFS_CID_LENGTH && content_cid.len() <= MAX_CID_LENGTH,
            ErrorCode::InvalidCIDFormat
        );
        require!(
            content_cid.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_'),
            ErrorCode::InvalidCIDFormat
        );

        // Input validation
        require!(max_keys > 0, ErrorCode::InvalidKeyCount);
        require!(unlock_price > 0, ErrorCode::InvalidPrice);

        // Add total fee validation
        let total_fee_bps = ctx.accounts.marketplace.platform_fee_bps
            .checked_add(ctx.accounts.marketplace.creator_royalty_bps)
            .ok_or(ErrorCode::NumericalOverflow)?;
        require!(
            total_fee_bps <= MAX_TOTAL_FEE_BPS,
            ErrorCode::TotalFeeTooHigh
        );

        let question = &mut ctx.accounts.question;
        let marketplace = &mut ctx.accounts.marketplace;

        question.creator = ctx.accounts.creator.key();
        question.content_cid = content_cid;
        question.content_hash = content_hash;
        question.unlock_price = unlock_price;
        question.max_keys = max_keys;
        question.current_keys = 0;
        question.index = marketplace.question_counter;
        question.creation_time = current_time;
        question.total_sales = 0;
        question.is_active = true;
        question.validation_timestamp = current_time;
        
        marketplace.question_counter = marketplace.question_counter
            .checked_add(1)
            .ok_or(ErrorCode::NumericalOverflow)?;

        emit!(QuestionCreated {
            question_id: question.index,
            creator: question.creator,
            unlock_price,
            max_keys,
            creation_time: question.creation_time,
        });

        // Update rate limiting state
        user_state.questions_created = user_state.questions_created
            .checked_add(1)
            .ok_or(ErrorCode::NumericalOverflow)?;
        #[cfg(not(feature = "test"))]
        {
            let current_time = Clock::get()?.unix_timestamp;
            ctx.accounts.user_state.last_operation_time = current_time;
        }

        Ok(())
    }

    pub fn mint_unlock_key(
        ctx: Context<MintUnlockKey>,
        metadata_uri: String,
        encrypted_key: Vec<u8>,
    ) -> Result<()> {
        require!(!ctx.accounts.marketplace.paused, ErrorCode::MarketplacePaused);
        
        require!(
            !ctx.accounts.marketplace.paused_operations.mint_key,
            ErrorCode::OperationPaused
        );

        require!(ctx.accounts.question.is_active, ErrorCode::QuestionInactive);
        require!(metadata_uri.len() <= MAX_URI_LENGTH, ErrorCode::URITooLong);

        require!(
            ctx.accounts.question.current_keys < ctx.accounts.question.max_keys,
            ErrorCode::NoKeysAvailable
        );

        // input validation
        require!(
            encrypted_key.len() <= MAX_ENCRYPTED_KEY_LENGTH,
            ErrorCode::InvalidKeyLength
        );
        require!(
            metadata_uri.chars().all(|c| c.is_ascii()),
            ErrorCode::InvalidMetadataFormat
        );
        require!(
            metadata_uri.len() >= MIN_METADATA_LENGTH,
            ErrorCode::InvalidMetadataFormat
        );

        // Update BONK token validation
        require!(
            ctx.accounts.bonk_mint.key() == ctx.accounts.marketplace.bonk_mint,
            ErrorCode::InvalidBonkMint
        );

        let question_key = ctx.accounts.question.key();
        let current_keys = ctx.accounts.question.current_keys;
        let unlock_price = ctx.accounts.question.unlock_price;
        let platform_fee_bps = ctx.accounts.marketplace.platform_fee_bps;
        let _creator = ctx.accounts.question.creator;
        let _index = ctx.accounts.question.index;

        let question = &mut ctx.accounts.question;
        let marketplace = &mut ctx.accounts.marketplace;
        let key = &mut ctx.accounts.unlock_key;

        // balance check before calculating fees
        require!(
            ctx.accounts.buyer_token_account.amount >= unlock_price,
            ErrorCode::InsufficientFunds
        );

        // calculate fees
        let platform_fee = (unlock_price * platform_fee_bps as u64)
            .checked_div(10000)
            .ok_or(ErrorCode::NumericalOverflow)?;
        let creator_payment = unlock_price
            .checked_sub(platform_fee)
            .ok_or(ErrorCode::NumericalOverflow)?;

        // transfer BONK tokens
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_token_account.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            platform_fee,
        )?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_token_account.to_account_info(),
                    to: ctx.accounts.creator_token_account.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            creator_payment,
        )?;

        // Set the discriminator
        key.discriminator = UNLOCK_KEY_DISCRIMINATOR;
        
        // store the encrypted symmetric key
        key.encrypted_key = encrypted_key;
        
        // create NFT metadata and mint token
        key.owner = ctx.accounts.buyer.key();
        key.question = question_key;
        key.token_id = current_keys;
        key.is_listed = false;
        key.list_price = 0;
        key.mint_time = Clock::get()?.unix_timestamp;
        key.metadata_uri = metadata_uri.clone();
        
        // update statistics
        question.current_keys = question.current_keys
            .checked_add(1)
            .ok_or(ErrorCode::NumericalOverflow)?;
        question.total_sales = question.total_sales
            .checked_add(question.unlock_price)
            .ok_or(ErrorCode::NumericalOverflow)?;
        marketplace.total_volume = marketplace.total_volume
            .checked_add(question.unlock_price)
            .ok_or(ErrorCode::NumericalOverflow)?;

        // create Metaplex metadata
        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                ctx.accounts.metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.metadata.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    mint_authority: ctx.accounts.mint_authority.to_account_info(),
                    update_authority: ctx.accounts.update_authority.to_account_info(),
                    payer: ctx.accounts.buyer.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                &[&[b"mint_authority", &[ctx.bumps.mint_authority]]],
            ),
            DataV2 {
                name: format!("QA Key #{} - Q{}", key.token_id, question.index),
                symbol: "QAK".to_string(),
                uri: metadata_uri,
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            },
            true,  // is_mutable
            false, // collection_details
            None,  // uses
        )?;

        emit!(KeyMinted {
            key_id: key.token_id,
            question_id: question.index,
            owner: key.owner,
            mint_time: key.mint_time,
            price: question.unlock_price,
        });

        // Update rate limiting state - only in non-test mode
        #[cfg(not(feature = "test"))]
        {
            let current_time = Clock::get()?.unix_timestamp;
            ctx.accounts.user_state.last_operation_time = current_time;
        }

        Ok(())
    }

    pub fn list_key(
        ctx: Context<ListKey>,
        price: u64
    ) -> Result<()> {
        require!(!ctx.accounts.marketplace.paused, ErrorCode::MarketplacePaused);
        require!(
            !ctx.accounts.marketplace.paused_operations.list_key,
            ErrorCode::OperationPaused
        );

        require!(price > 0, ErrorCode::InvalidPrice);
        
        let key = &mut ctx.accounts.unlock_key;
        require!(key.owner == ctx.accounts.seller.key(), ErrorCode::NotKeyOwner);
        require!(!key.is_listed, ErrorCode::AlreadyListed);
        
        key.is_listed = true;
        key.list_price = price;
        key.list_time = Clock::get()?.unix_timestamp;

        emit!(KeyListed {
            key_id: key.token_id,
            price,
            seller: key.owner,
            list_time: key.list_time,
        });

        Ok(())
    }

    pub fn update_listing(
        ctx: Context<UpdateListing>,
        new_price: u64,
    ) -> Result<()> {
        require!(!ctx.accounts.marketplace.paused, ErrorCode::MarketplacePaused);
        require!(new_price > 0, ErrorCode::InvalidPrice);
        
        let key = &mut ctx.accounts.unlock_key;
        require!(key.owner == ctx.accounts.seller.key(), ErrorCode::NotKeyOwner);
        require!(key.is_listed, ErrorCode::NotListed);
        
        let old_price = key.list_price;
        key.list_price = new_price;

        emit!(ListingUpdated {
            key_id: key.token_id,
            old_price,
            new_price,
            seller: key.owner,
        });

        Ok(())
    }

    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        require!(!ctx.accounts.marketplace.paused, ErrorCode::MarketplacePaused);
        
        let key = &mut ctx.accounts.unlock_key;
        require!(key.owner == ctx.accounts.seller.key(), ErrorCode::NotKeyOwner);
        require!(key.is_listed, ErrorCode::NotListed);
        
        key.is_listed = false;
        key.list_price = 0;

        emit!(ListingCancelled {
            key_id: key.token_id,
            seller: key.owner,
        });

        Ok(())
    }

    pub fn buy_listed_key(
        ctx: Context<BuyListedKey>,
        new_encrypted_key: Vec<u8>,
    ) -> Result<()> {
        require!(!ctx.accounts.marketplace.paused, ErrorCode::MarketplacePaused);
        require!(
            !ctx.accounts.marketplace.paused_operations.buy_key,
            ErrorCode::OperationPaused
        );

        // Add input validation
        require!(
            new_encrypted_key.len() <= MAX_ENCRYPTED_KEY_LENGTH,
            ErrorCode::InvalidKeyLength
        );

      
        require!(ctx.accounts.question.is_active, ErrorCode::QuestionInactive);
        
        let key = &mut ctx.accounts.unlock_key;
        require!(key.is_listed, ErrorCode::NotListed);
        require!(key.owner != ctx.accounts.buyer.key(), ErrorCode::CannotBuyOwnKey);

        let price = key.list_price;
        
        // balance check before calculating fees
        require!(
            ctx.accounts.buyer_token_account.amount >= price,
            ErrorCode::InsufficientFunds
        );

        let platform_fee = (price * ctx.accounts.marketplace.platform_fee_bps as u64)
            .checked_div(10000)
            .ok_or(ErrorCode::NumericalOverflow)?;
        let creator_royalty = (price * ctx.accounts.marketplace.creator_royalty_bps as u64)
            .checked_div(10000)
            .ok_or(ErrorCode::NumericalOverflow)?;
        let seller_payment = price
            .checked_sub(platform_fee)
            .ok_or(ErrorCode::NumericalOverflow)?
            .checked_sub(creator_royalty)
            .ok_or(ErrorCode::NumericalOverflow)?;

        // transfer payments
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_token_account.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            platform_fee,
        )?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_token_account.to_account_info(),
                    to: ctx.accounts.creator_token_account.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            creator_royalty,
        )?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_token_account.to_account_info(),
                    to: ctx.accounts.seller_token_account.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            seller_payment,
        )?;

        // update statistics
        ctx.accounts.question.total_sales = ctx.accounts.question.total_sales
            .checked_add(price)
            .ok_or(ErrorCode::NumericalOverflow)?;
        ctx.accounts.marketplace.total_volume = ctx.accounts.marketplace.total_volume
            .checked_add(price)
            .ok_or(ErrorCode::NumericalOverflow)?;

        // update key ownership and encrypted key
        let previous_owner = key.owner;
        key.owner = ctx.accounts.buyer.key();
        key.encrypted_key = new_encrypted_key;
        key.is_listed = false;
        key.list_price = 0;
        key.last_sold_price = price;
        key.last_sold_time = Clock::get()?.unix_timestamp;

        emit!(KeySold {
            key_id: key.token_id,
            question_id: ctx.accounts.question.index,
            seller: previous_owner,
            buyer: key.owner,
            price,
            sold_time: key.last_sold_time,
        });

        // update rate limiting state - only in non-test mode
        #[cfg(not(feature = "test"))]
        {
            let current_time = Clock::get()?.unix_timestamp;
            ctx.accounts.user_state.last_operation_time = current_time;
        }

        Ok(())
    }

    pub fn toggle_marketplace(ctx: Context<ToggleMarketplace>) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.paused = !marketplace.paused;

        emit!(MarketplaceToggled {
            authority: marketplace.authority,
            paused: marketplace.paused,
        });

        Ok(())
    }

    pub fn blacklist_user(
        ctx: Context<BlacklistUser>,
        user: Pubkey,
    ) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        user_state.is_blacklisted = true;

        emit!(UserBlacklisted {
            user,
            authority: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn unblacklist_user(
        ctx: Context<BlacklistUser>,
        user: Pubkey,
    ) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        user_state.is_blacklisted = false;

        emit!(UserUnblacklisted {
            user,
            authority: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // pause operations
    pub fn toggle_operation(
        ctx: Context<ToggleOperation>,
        operation: OperationType,
    ) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.paused_operations.toggle(operation);

        emit!(OperationToggled {
            operation,
            is_paused: marketplace.paused_operations.is_paused(operation),
            authority: ctx.accounts.authority.key(),
        });

        Ok(())
    }

    pub fn transfer_authority(ctx: Context<TransferAuthority>) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;
        
        let previous_authority = ctx.accounts.marketplace.authority;
        
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.new_authority.key();
        
        emit!(AuthorityTransferred {
            previous_authority,
            new_authority: marketplace.authority,
            timestamp,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction()]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + // discriminator
        32 + // authority: Pubkey
        32 + // treasury: Pubkey
        8 + // question_counter: u64
        2 + // platform_fee_bps: u16
        2 + // creator_royalty_bps: u16
        8 + // total_volume: u64
        1 + // paused: bool
        4 + // paused_operations
        32, // bonk_mint: Pubkey
        seeds = [b"marketplace", authority.key().as_ref()],
        bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    /// CHECK: Validated in instruction
    pub bonk_mint: UncheckedAccount<'info>,
    /// CHECK: Treasury account
    pub treasury: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct InitializeUserState<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8 + 8 + 1,  // discriminator + questions_created + last_operation_time + is_blacklisted
        seeds = [b"user_state", user.key().as_ref()],
        bump
    )]
    pub user_state: Account<'info, UserState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFees<'info> {
    #[account(mut, has_one = authority)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(content_cid: String, content_hash: [u8; 32])]
pub struct CreateQuestion<'info> {
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub user_state: Account<'info, UserState>,
    #[account(
        init,
        payer = creator,
        space = MIN_ACCOUNT_SPACE +
        32 +                        // creator: Pubkey
        4 + content_cid.len() +     // content_cid: String
        32 +                        // content_hash: [u8; 32]
        8 +                         // unlock_price: u64
        8 +                         // max_keys: u64
        8 +                         // current_keys: u64
        8 +                         // index: u64
        8 +                         // creation_time: i64
        8 +                         // total_sales: u64
        1 +                         // is_active: bool
        8,                          // validation_timestamp: i64
        seeds = [
            b"question",
            marketplace.key().as_ref(),
            &marketplace.question_counter.to_le_bytes()
        ],
        bump
    )]
    pub question: Account<'info, Question>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(metadata_uri: String, encrypted_key: Vec<u8>)]
pub struct MintUnlockKey<'info> {
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub question: Account<'info, Question>,
    #[account(
        mut,
        constraint = treasury_token_account.owner == marketplace.treasury,
        token::mint = bonk_mint
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = buyer,
        space = MIN_ACCOUNT_SPACE +   // discriminator
        1 +                          // discriminator: u8
        32 +                         // owner: Pubkey
        32 +                         // question: Pubkey
        8 +                          // token_id: u64
        4 + encrypted_key.len() +    // encrypted_key: Vec<u8>
        1 +                          // is_listed: bool
        8 +                          // list_price: u64
        8 +                          // mint_time: i64
        4 + metadata_uri.len() +     // metadata_uri: String
        8 +                          // last_sold_price: u64
        8 +                          // last_sold_time: i64
        8,                          // list_time: i64
        seeds = [
            b"unlock_key",
            question.key().as_ref(),
            &question.current_keys.to_le_bytes()
        ],
        bump,
        constraint = question.current_keys < question.max_keys @ ErrorCode::NoKeysAvailable
    )]
    pub unlock_key: Account<'info, UnlockKey>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(
        mut,
        constraint = buyer_token_account.owner == buyer.key(),
        token::mint = bonk_mint
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = creator_token_account.owner == question.creator,
        token::mint = bonk_mint
    )]
    pub creator_token_account: Account<'info, TokenAccount>,
    
    pub bonk_mint: Account<'info, Mint>,
    
    /// CHECK: Metaplex will check this
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    /// CHECK: PDA for mint authority
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    
    /// CHECK: PDA for update authority
    pub update_authority: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    /// CHECK: Metaplex Token Metadata Program
    pub metadata_program: UncheckedAccount<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    #[account(mut)]
    pub user_state: Account<'info, UserState>,
}

#[derive(Accounts)]
pub struct ListKey<'info> {
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut, constraint = unlock_key.owner == seller.key() @ ErrorCode::NotKeyOwner)]
    pub unlock_key: Account<'info, UnlockKey>,
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(mut)]
    pub user_state: Account<'info, UserState>,
}

#[derive(Accounts)]
pub struct UpdateListing<'info> {
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut, constraint = unlock_key.owner == seller.key() @ ErrorCode::NotKeyOwner)]
    pub unlock_key: Account<'info, UnlockKey>,
    #[account(mut)]
    pub seller: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut, constraint = unlock_key.owner == seller.key() @ ErrorCode::NotKeyOwner)]
    pub unlock_key: Account<'info, UnlockKey>,
    #[account(mut)]
    pub seller: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(new_encrypted_key: Vec<u8>)]
pub struct BuyListedKey<'info> {
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(
        mut,
        constraint = !marketplace.paused @ ErrorCode::MarketplacePaused,
        constraint = !marketplace.paused_operations.buy_key @ ErrorCode::OperationPaused
    )]
    pub question: Account<'info, Question>,
    #[account(
        mut,
        constraint = treasury_token_account.owner == marketplace.treasury,
        token::mint = bonk_mint
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [
            b"unlock_key",
            question.key().as_ref(),
            &unlock_key.token_id.to_le_bytes()
        ],
        bump,
        constraint = unlock_key.is_listed @ ErrorCode::NotListed,
        constraint = unlock_key.owner != buyer.key() @ ErrorCode::CannotBuyOwnKey,
        constraint = unlock_key.owner == seller_token_account.owner @ ErrorCode::InvalidOwner,
        realloc = UNLOCK_KEY_BASE_SIZE + 
            4 + new_encrypted_key.len() +  // encrypted_key: Vec<u8>
            4 + unlock_key.metadata_uri.len(),  // metadata_uri: String
        realloc::payer = buyer,
        realloc::zero = false
    )]
    pub unlock_key: Account<'info, UnlockKey>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(
        mut,
        constraint = buyer_token_account.owner == buyer.key(),
        token::mint = bonk_mint
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = seller_token_account.owner == unlock_key.owner,
        token::mint = bonk_mint
    )]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = creator_token_account.owner == question.creator,
        token::mint = bonk_mint
    )]
    pub creator_token_account: Account<'info, TokenAccount>,
    
    pub bonk_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub user_state: Account<'info, UserState>,
}

#[derive(Accounts)]
pub struct ToggleMarketplace<'info> {
    #[account(mut, has_one = authority)]
    pub marketplace: Account<'info, Marketplace>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Marketplace {
    pub treasury: Pubkey,
    pub authority: Pubkey,
    pub question_counter: u64,
    pub platform_fee_bps: u16,
    pub creator_royalty_bps: u16,
    pub total_volume: u64,
    pub paused: bool,
    pub paused_operations: PausedOperations,
    pub bonk_mint: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct PausedOperations {
    pub create_question: bool,
    pub mint_key: bool,
    pub list_key: bool,
    pub buy_key: bool,
}

impl PausedOperations {
    pub fn toggle(&mut self, operation: OperationType) {
        match operation {
            OperationType::CreateQuestion => self.create_question = !self.create_question,
            OperationType::MintKey => self.mint_key = !self.mint_key,
            OperationType::ListKey => self.list_key = !self.list_key,
            OperationType::BuyKey => self.buy_key = !self.buy_key,
        }
    }

    pub fn is_paused(&self, operation: OperationType) -> bool {
        match operation {
            OperationType::CreateQuestion => self.create_question,
            OperationType::MintKey => self.mint_key,
            OperationType::ListKey => self.list_key,
            OperationType::BuyKey => self.buy_key,
        }
    }
}

#[account]
pub struct Question {
    pub creator: Pubkey,
    pub content_cid: String,      // IPFS CID containing question and encrypted answer
    pub content_hash: [u8; 32],   // Hash of the complete IPFS content
    pub unlock_price: u64,
    pub max_keys: u64,
    pub current_keys: u64,
    pub index: u64,
    pub creation_time: i64,
    pub total_sales: u64,
    pub is_active: bool,
    pub validation_timestamp: i64,
}

#[account]
pub struct UnlockKey {
    pub discriminator: u8,
    pub owner: Pubkey,
    pub question: Pubkey,
    pub token_id: u64,
    pub encrypted_key: Vec<u8>,
    pub is_listed: bool,
    pub list_price: u64,
    pub mint_time: i64,
    pub metadata_uri: String,
    pub last_sold_price: u64,
    pub last_sold_time: i64,
    pub list_time: i64,
}

#[event]
pub struct MarketplaceInitialized {
    pub authority: Pubkey,
    pub platform_fee_bps: u16,
    pub creator_royalty_bps: u16,
    pub bonk_mint: Pubkey,
}

#[event]
pub struct MarketplaceToggled {
    pub authority: Pubkey,
    pub paused: bool,
}

#[event]
pub struct UserBlacklisted {
    pub user: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct OperationToggled {
    pub operation: OperationType,
    pub is_paused: bool,
    pub authority: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Copy)]
pub enum OperationType {
    CreateQuestion,
    MintKey,
    ListKey,
    BuyKey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Numerical overflow occurred")]
    NumericalOverflow,
    #[msg("No keys available for this question")]
    NoKeysAvailable,
    #[msg("Not the key owner")]
    NotKeyOwner,
    #[msg("Key not listed for sale")]
    NotListed,
    #[msg("Key is already listed")]
    AlreadyListed,
    #[msg("Cannot buy your own key")]
    CannotBuyOwnKey,
    #[msg("Fee too high")]
    FeeTooHigh,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Invalid key count")]
    InvalidKeyCount,
    #[msg("Content too long")]
    ContentTooLong,
    #[msg("Answer too long")]
    AnswerTooLong,
    #[msg("URI too long")]
    URITooLong,
    #[msg("Question is inactive")]
    QuestionInactive,
    #[msg("Marketplace is paused")]
    MarketplacePaused,
    #[msg("User is blacklisted")]
    UserBlacklisted,
    #[msg("Rate limit exceeded")]
    RateLimitExceeded,
    #[msg("Too many questions created")]
    TooManyQuestions,
    #[msg("Invalid characters in input")]
    InvalidCharacters,
    #[msg("Operation is paused")]
    OperationPaused,
    #[msg("Encryption error occurred")]
    EncryptionError,
    #[msg("Invalid answer key")]
    InvalidAnswerKey,
    #[msg("Invalid encrypted key length")]
    InvalidKeyLength,
    #[msg("Invalid metadata format")]
    InvalidMetadataFormat,
    #[msg("Total fee percentage too high")]
    TotalFeeTooHigh,
    #[msg("Insufficient account space")]
    InsufficientSpace,
    #[msg("Invalid authority account")]
    InvalidAuthority,
    #[msg("Insufficient funds for transaction")]
    InsufficientFunds,
    #[msg("Invalid IPFS CID format")]
    InvalidCIDFormat,
    #[msg("Invalid owner for this operation")]
    InvalidOwner,
    #[msg("Invalid BONK token mint address")]
    InvalidBonkMint,
}

#[derive(Accounts)]
pub struct ToggleOperation<'info> {
    #[account(mut, has_one = authority)]
    pub marketplace: Account<'info, Marketplace>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct BlacklistUser<'info> {
    #[account(mut, has_one = authority)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub user_state: Account<'info, UserState>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateTreasury<'info> {
    #[account(mut, has_one = authority)]
    pub marketplace: Account<'info, Marketplace>,
    pub authority: Signer<'info>,
}

#[event]
pub struct FeeUpdateEvent {
    pub platform_fee_bps: u16,
    pub creator_royalty_bps: u16,
}

#[event]
pub struct QuestionCreated {
    pub question_id: u64,
    pub creator: Pubkey,
    pub unlock_price: u64,
    pub max_keys: u64,
    pub creation_time: i64,
}

#[event]
pub struct KeyMinted {
    pub key_id: u64,
    pub question_id: u64,
    pub owner: Pubkey,
    pub mint_time: i64,
    pub price: u64,
}

#[event]
pub struct KeyListed {
    pub key_id: u64,
    pub price: u64,
    pub seller: Pubkey,
    pub list_time: i64,
}

#[event]
pub struct ListingUpdated {
    pub key_id: u64,
    pub old_price: u64,
    pub new_price: u64,
    pub seller: Pubkey,
}

#[event]
pub struct ListingCancelled {
    pub key_id: u64,
    pub seller: Pubkey,
}

#[event]
pub struct KeySold {
    pub key_id: u64,
    pub question_id: u64,
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub price: u64,
    pub sold_time: i64,
}

#[derive(Accounts)]
pub struct TransferAuthority<'info> {
    #[account(mut, has_one = authority)]
    pub marketplace: Account<'info, Marketplace>,
    pub authority: Signer<'info>,
    /// CHECK: New authority account, will be validated in instruction
    pub new_authority: UncheckedAccount<'info>,
}

#[event]
pub struct AuthorityTransferred {
    pub previous_authority: Pubkey,
    pub new_authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct UserUnblacklisted {
    pub user: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryUpdated {
    pub previous_treasury: Pubkey,
    pub new_treasury: Pubkey,
    pub timestamp: i64,
}