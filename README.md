# MyQA.is

A creator knowledge-base for fans.

## Solana Contract Development

First run the setup script:

```sh
./scripts/setup-solana-contract-dev.sh
```

Make sure to press enter when prompted.

After running the setup script, verify your installation with:

```bash
solana --version
anchor --version
rustc --version
```

Then install Vscode / Cursor extentions:

- Rust Analyzer
- Even Better TOML

To Run a validator locally:

```
cd ~
mkdir validator
cd validator
solana-test-validator
```

See more information at: https://solana.com/docs/intro/installation
