#!/bin/bash

# Install Homebrew if not already installed
if ! command -v brew &> /dev/null; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install nodenv and node-build
brew install nodenv
# Add nodenv to bash/zsh
echo 'eval "$(nodenv init -)"' >> ~/.zshrc

# Install Node.js v22.11.0
nodenv install 22.11.0

# Install Yarn for Anchor
npm install --global yarn

# Install Rust and Cargo
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Solana Tool Suite
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Add Solana to your PATH (add this to your .zshrc or .bash_profile)
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Install Anchor Framework (for smart contract development)
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest

# Create local keypair for development
solana-keygen new --no-bip39-passphrase

# Set Cluster to Devnet
solana config set -ud

# Airdrop SOL to your wallet
solana airdrop 2

# Configure for localnet
solana config set -ul

# Additional development tools
npm install -g @project-serum/anchor-cli
brew install pkg-config
brew install openssl@3