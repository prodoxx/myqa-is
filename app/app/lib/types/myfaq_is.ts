export type MyfaqIs = {
  "version": "0.1.0",
  "name": "myfaq_is",
  "instructions": [
    {
      "name": "initializeUserState",
      "accounts": [
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonkMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateFees",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newPlatformFeeBps",
          "type": "u16"
        },
        {
          "name": "newCreatorRoyaltyBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "createQuestion",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "contentCid",
          "type": "string"
        },
        {
          "name": "contentHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "unlockPrice",
          "type": "u64"
        },
        {
          "name": "maxKeys",
          "type": "u64"
        }
      ]
    },
    {
      "name": "mintUnlockKey",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unlockKey",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creatorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "platformTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonkMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        },
        {
          "name": "encryptedKey",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "listKey",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unlockKey",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateListing",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unlockKey",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelListing",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unlockKey",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "buyListedKey",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unlockKey",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creatorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "platformTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonkMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newEncryptedKey",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "toggleMarketplace",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "blacklistUser",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "user",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "unblacklistUser",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "user",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "toggleOperation",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "operation",
          "type": {
            "defined": "OperationType"
          }
        }
      ]
    },
    {
      "name": "transferAuthority",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "marketplace",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "questionCounter",
            "type": "u64"
          },
          {
            "name": "platformFeeBps",
            "type": "u16"
          },
          {
            "name": "creatorRoyaltyBps",
            "type": "u16"
          },
          {
            "name": "totalVolume",
            "type": "u64"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "pausedOperations",
            "type": {
              "defined": "PausedOperations"
            }
          },
          {
            "name": "bonkMint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "question",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "contentCid",
            "type": "string"
          },
          {
            "name": "contentHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "unlockPrice",
            "type": "u64"
          },
          {
            "name": "maxKeys",
            "type": "u64"
          },
          {
            "name": "currentKeys",
            "type": "u64"
          },
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "creationTime",
            "type": "i64"
          },
          {
            "name": "totalSales",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "validationTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "unlockKey",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "question",
            "type": "publicKey"
          },
          {
            "name": "tokenId",
            "type": "u64"
          },
          {
            "name": "encryptedKey",
            "type": "bytes"
          },
          {
            "name": "isListed",
            "type": "bool"
          },
          {
            "name": "listPrice",
            "type": "u64"
          },
          {
            "name": "mintTime",
            "type": "i64"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "lastSoldPrice",
            "type": "u64"
          },
          {
            "name": "lastSoldTime",
            "type": "i64"
          },
          {
            "name": "listTime",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "userState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questionsCreated",
            "type": "u64"
          },
          {
            "name": "lastOperationTime",
            "type": "i64"
          },
          {
            "name": "isBlacklisted",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OperationType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "CreateQuestion"
          },
          {
            "name": "MintKey"
          },
          {
            "name": "ListKey"
          },
          {
            "name": "BuyKey"
          }
        ]
      }
    },
    {
      "name": "PausedOperations",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "createQuestion",
            "type": "bool"
          },
          {
            "name": "mintKey",
            "type": "bool"
          },
          {
            "name": "listKey",
            "type": "bool"
          },
          {
            "name": "buyKey",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "AuthorityTransferred",
      "fields": [
        {
          "name": "previousAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "FeeUpdateEvent",
      "fields": [
        {
          "name": "platformFeeBps",
          "type": "u16",
          "index": false
        },
        {
          "name": "creatorRoyaltyBps",
          "type": "u16",
          "index": false
        }
      ]
    },
    {
      "name": "KeyListed",
      "fields": [
        {
          "name": "keyId",
          "type": "u64",
          "index": false
        },
        {
          "name": "price",
          "type": "u64",
          "index": false
        },
        {
          "name": "seller",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "listTime",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "KeyMinted",
      "fields": [
        {
          "name": "keyId",
          "type": "u64",
          "index": false
        },
        {
          "name": "questionId",
          "type": "u64",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mintTime",
          "type": "i64",
          "index": false
        },
        {
          "name": "price",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "KeySold",
      "fields": [
        {
          "name": "keyId",
          "type": "u64",
          "index": false
        },
        {
          "name": "questionId",
          "type": "u64",
          "index": false
        },
        {
          "name": "seller",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "buyer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "price",
          "type": "u64",
          "index": false
        },
        {
          "name": "soldTime",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ListingCancelled",
      "fields": [
        {
          "name": "keyId",
          "type": "u64",
          "index": false
        },
        {
          "name": "seller",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ListingUpdated",
      "fields": [
        {
          "name": "keyId",
          "type": "u64",
          "index": false
        },
        {
          "name": "oldPrice",
          "type": "u64",
          "index": false
        },
        {
          "name": "newPrice",
          "type": "u64",
          "index": false
        },
        {
          "name": "seller",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "MarketplaceInitialized",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "platformFeeBps",
          "type": "u16",
          "index": false
        },
        {
          "name": "creatorRoyaltyBps",
          "type": "u16",
          "index": false
        },
        {
          "name": "bonkMint",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "MarketplaceToggled",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "paused",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "OperationToggled",
      "fields": [
        {
          "name": "operation",
          "type": {
            "defined": "OperationType"
          },
          "index": false
        },
        {
          "name": "isPaused",
          "type": "bool",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "QuestionCreated",
      "fields": [
        {
          "name": "questionId",
          "type": "u64",
          "index": false
        },
        {
          "name": "creator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "unlockPrice",
          "type": "u64",
          "index": false
        },
        {
          "name": "maxKeys",
          "type": "u64",
          "index": false
        },
        {
          "name": "creationTime",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "UserBlacklisted",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "UserUnblacklisted",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NumericalOverflow",
      "msg": "Numerical overflow occurred"
    },
    {
      "code": 6001,
      "name": "NoKeysAvailable",
      "msg": "No keys available for this question"
    },
    {
      "code": 6002,
      "name": "NotKeyOwner",
      "msg": "Not the key owner"
    },
    {
      "code": 6003,
      "name": "NotListed",
      "msg": "Key not listed for sale"
    },
    {
      "code": 6004,
      "name": "AlreadyListed",
      "msg": "Key is already listed"
    },
    {
      "code": 6005,
      "name": "CannotBuyOwnKey",
      "msg": "Cannot buy your own key"
    },
    {
      "code": 6006,
      "name": "FeeTooHigh",
      "msg": "Fee too high"
    },
    {
      "code": 6007,
      "name": "InvalidPrice",
      "msg": "Invalid price"
    },
    {
      "code": 6008,
      "name": "InvalidKeyCount",
      "msg": "Invalid key count"
    },
    {
      "code": 6009,
      "name": "ContentTooLong",
      "msg": "Content too long"
    },
    {
      "code": 6010,
      "name": "AnswerTooLong",
      "msg": "Answer too long"
    },
    {
      "code": 6011,
      "name": "URITooLong",
      "msg": "URI too long"
    },
    {
      "code": 6012,
      "name": "QuestionInactive",
      "msg": "Question is inactive"
    },
    {
      "code": 6013,
      "name": "MarketplacePaused",
      "msg": "Marketplace is paused"
    },
    {
      "code": 6014,
      "name": "UserBlacklisted",
      "msg": "User is blacklisted"
    },
    {
      "code": 6015,
      "name": "RateLimitExceeded",
      "msg": "Rate limit exceeded"
    },
    {
      "code": 6016,
      "name": "TooManyQuestions",
      "msg": "Too many questions created"
    },
    {
      "code": 6017,
      "name": "InvalidCharacters",
      "msg": "Invalid characters in input"
    },
    {
      "code": 6018,
      "name": "OperationPaused",
      "msg": "Operation is paused"
    },
    {
      "code": 6019,
      "name": "EncryptionError",
      "msg": "Encryption error occurred"
    },
    {
      "code": 6020,
      "name": "InvalidAnswerKey",
      "msg": "Invalid answer key"
    },
    {
      "code": 6021,
      "name": "InvalidKeyLength",
      "msg": "Invalid encrypted key length"
    },
    {
      "code": 6022,
      "name": "InvalidMetadataFormat",
      "msg": "Invalid metadata format"
    },
    {
      "code": 6023,
      "name": "TotalFeeTooHigh",
      "msg": "Total fee percentage too high"
    },
    {
      "code": 6024,
      "name": "InsufficientSpace",
      "msg": "Insufficient account space"
    },
    {
      "code": 6025,
      "name": "InvalidAuthority",
      "msg": "Invalid authority account"
    },
    {
      "code": 6026,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds for transaction"
    },
    {
      "code": 6027,
      "name": "InvalidCIDFormat",
      "msg": "Invalid IPFS CID format"
    },
    {
      "code": 6028,
      "name": "InvalidOwner",
      "msg": "Invalid owner for this operation"
    },
    {
      "code": 6029,
      "name": "InvalidBonkMint",
      "msg": "Invalid BONK token mint address"
    }
  ]
};

export const IDL: MyfaqIs = {
  "version": "0.1.0",
  "name": "myfaq_is",
  "instructions": [
    {
      "name": "initializeUserState",
      "accounts": [
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonkMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateFees",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newPlatformFeeBps",
          "type": "u16"
        },
        {
          "name": "newCreatorRoyaltyBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "createQuestion",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "contentCid",
          "type": "string"
        },
        {
          "name": "contentHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "unlockPrice",
          "type": "u64"
        },
        {
          "name": "maxKeys",
          "type": "u64"
        }
      ]
    },
    {
      "name": "mintUnlockKey",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unlockKey",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creatorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "platformTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonkMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        },
        {
          "name": "encryptedKey",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "listKey",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unlockKey",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateListing",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unlockKey",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelListing",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unlockKey",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "buyListedKey",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "unlockKey",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creatorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "platformTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonkMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newEncryptedKey",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "toggleMarketplace",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "blacklistUser",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "user",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "unblacklistUser",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "user",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "toggleOperation",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "operation",
          "type": {
            "defined": "OperationType"
          }
        }
      ]
    },
    {
      "name": "transferAuthority",
      "accounts": [
        {
          "name": "marketplace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "marketplace",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "questionCounter",
            "type": "u64"
          },
          {
            "name": "platformFeeBps",
            "type": "u16"
          },
          {
            "name": "creatorRoyaltyBps",
            "type": "u16"
          },
          {
            "name": "totalVolume",
            "type": "u64"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "pausedOperations",
            "type": {
              "defined": "PausedOperations"
            }
          },
          {
            "name": "bonkMint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "question",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "contentCid",
            "type": "string"
          },
          {
            "name": "contentHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "unlockPrice",
            "type": "u64"
          },
          {
            "name": "maxKeys",
            "type": "u64"
          },
          {
            "name": "currentKeys",
            "type": "u64"
          },
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "creationTime",
            "type": "i64"
          },
          {
            "name": "totalSales",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "validationTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "unlockKey",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "question",
            "type": "publicKey"
          },
          {
            "name": "tokenId",
            "type": "u64"
          },
          {
            "name": "encryptedKey",
            "type": "bytes"
          },
          {
            "name": "isListed",
            "type": "bool"
          },
          {
            "name": "listPrice",
            "type": "u64"
          },
          {
            "name": "mintTime",
            "type": "i64"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "lastSoldPrice",
            "type": "u64"
          },
          {
            "name": "lastSoldTime",
            "type": "i64"
          },
          {
            "name": "listTime",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "userState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questionsCreated",
            "type": "u64"
          },
          {
            "name": "lastOperationTime",
            "type": "i64"
          },
          {
            "name": "isBlacklisted",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OperationType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "CreateQuestion"
          },
          {
            "name": "MintKey"
          },
          {
            "name": "ListKey"
          },
          {
            "name": "BuyKey"
          }
        ]
      }
    },
    {
      "name": "PausedOperations",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "createQuestion",
            "type": "bool"
          },
          {
            "name": "mintKey",
            "type": "bool"
          },
          {
            "name": "listKey",
            "type": "bool"
          },
          {
            "name": "buyKey",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "AuthorityTransferred",
      "fields": [
        {
          "name": "previousAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newAuthority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "FeeUpdateEvent",
      "fields": [
        {
          "name": "platformFeeBps",
          "type": "u16",
          "index": false
        },
        {
          "name": "creatorRoyaltyBps",
          "type": "u16",
          "index": false
        }
      ]
    },
    {
      "name": "KeyListed",
      "fields": [
        {
          "name": "keyId",
          "type": "u64",
          "index": false
        },
        {
          "name": "price",
          "type": "u64",
          "index": false
        },
        {
          "name": "seller",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "listTime",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "KeyMinted",
      "fields": [
        {
          "name": "keyId",
          "type": "u64",
          "index": false
        },
        {
          "name": "questionId",
          "type": "u64",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mintTime",
          "type": "i64",
          "index": false
        },
        {
          "name": "price",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "KeySold",
      "fields": [
        {
          "name": "keyId",
          "type": "u64",
          "index": false
        },
        {
          "name": "questionId",
          "type": "u64",
          "index": false
        },
        {
          "name": "seller",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "buyer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "price",
          "type": "u64",
          "index": false
        },
        {
          "name": "soldTime",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ListingCancelled",
      "fields": [
        {
          "name": "keyId",
          "type": "u64",
          "index": false
        },
        {
          "name": "seller",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ListingUpdated",
      "fields": [
        {
          "name": "keyId",
          "type": "u64",
          "index": false
        },
        {
          "name": "oldPrice",
          "type": "u64",
          "index": false
        },
        {
          "name": "newPrice",
          "type": "u64",
          "index": false
        },
        {
          "name": "seller",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "MarketplaceInitialized",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "platformFeeBps",
          "type": "u16",
          "index": false
        },
        {
          "name": "creatorRoyaltyBps",
          "type": "u16",
          "index": false
        },
        {
          "name": "bonkMint",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "MarketplaceToggled",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "paused",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "OperationToggled",
      "fields": [
        {
          "name": "operation",
          "type": {
            "defined": "OperationType"
          },
          "index": false
        },
        {
          "name": "isPaused",
          "type": "bool",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "QuestionCreated",
      "fields": [
        {
          "name": "questionId",
          "type": "u64",
          "index": false
        },
        {
          "name": "creator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "unlockPrice",
          "type": "u64",
          "index": false
        },
        {
          "name": "maxKeys",
          "type": "u64",
          "index": false
        },
        {
          "name": "creationTime",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "UserBlacklisted",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "UserUnblacklisted",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NumericalOverflow",
      "msg": "Numerical overflow occurred"
    },
    {
      "code": 6001,
      "name": "NoKeysAvailable",
      "msg": "No keys available for this question"
    },
    {
      "code": 6002,
      "name": "NotKeyOwner",
      "msg": "Not the key owner"
    },
    {
      "code": 6003,
      "name": "NotListed",
      "msg": "Key not listed for sale"
    },
    {
      "code": 6004,
      "name": "AlreadyListed",
      "msg": "Key is already listed"
    },
    {
      "code": 6005,
      "name": "CannotBuyOwnKey",
      "msg": "Cannot buy your own key"
    },
    {
      "code": 6006,
      "name": "FeeTooHigh",
      "msg": "Fee too high"
    },
    {
      "code": 6007,
      "name": "InvalidPrice",
      "msg": "Invalid price"
    },
    {
      "code": 6008,
      "name": "InvalidKeyCount",
      "msg": "Invalid key count"
    },
    {
      "code": 6009,
      "name": "ContentTooLong",
      "msg": "Content too long"
    },
    {
      "code": 6010,
      "name": "AnswerTooLong",
      "msg": "Answer too long"
    },
    {
      "code": 6011,
      "name": "URITooLong",
      "msg": "URI too long"
    },
    {
      "code": 6012,
      "name": "QuestionInactive",
      "msg": "Question is inactive"
    },
    {
      "code": 6013,
      "name": "MarketplacePaused",
      "msg": "Marketplace is paused"
    },
    {
      "code": 6014,
      "name": "UserBlacklisted",
      "msg": "User is blacklisted"
    },
    {
      "code": 6015,
      "name": "RateLimitExceeded",
      "msg": "Rate limit exceeded"
    },
    {
      "code": 6016,
      "name": "TooManyQuestions",
      "msg": "Too many questions created"
    },
    {
      "code": 6017,
      "name": "InvalidCharacters",
      "msg": "Invalid characters in input"
    },
    {
      "code": 6018,
      "name": "OperationPaused",
      "msg": "Operation is paused"
    },
    {
      "code": 6019,
      "name": "EncryptionError",
      "msg": "Encryption error occurred"
    },
    {
      "code": 6020,
      "name": "InvalidAnswerKey",
      "msg": "Invalid answer key"
    },
    {
      "code": 6021,
      "name": "InvalidKeyLength",
      "msg": "Invalid encrypted key length"
    },
    {
      "code": 6022,
      "name": "InvalidMetadataFormat",
      "msg": "Invalid metadata format"
    },
    {
      "code": 6023,
      "name": "TotalFeeTooHigh",
      "msg": "Total fee percentage too high"
    },
    {
      "code": 6024,
      "name": "InsufficientSpace",
      "msg": "Insufficient account space"
    },
    {
      "code": 6025,
      "name": "InvalidAuthority",
      "msg": "Invalid authority account"
    },
    {
      "code": 6026,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds for transaction"
    },
    {
      "code": 6027,
      "name": "InvalidCIDFormat",
      "msg": "Invalid IPFS CID format"
    },
    {
      "code": 6028,
      "name": "InvalidOwner",
      "msg": "Invalid owner for this operation"
    },
    {
      "code": 6029,
      "name": "InvalidBonkMint",
      "msg": "Invalid BONK token mint address"
    }
  ]
};
