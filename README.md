## Development

You'll need to run two terminals (or bring in a process manager like concurrently/pm2-dev if you like):

Start the Remix development asset server

```sh
npm run dev
```

In a new tab start your express app:

```sh
npm run start:dev
```

This starts your app in development mode, which will purge the server require cache when Remix rebuilds assets so you don't need a process manager restarting the express server.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying express applications you should be right at home just make sure to deploy the output of `remix build`

- `server/build/`
- `public/build/`

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
