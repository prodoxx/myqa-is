import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { vercelPreset } from '@vercel/remix/vite';

installGlobals({ nativeFetch: true });

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  console.log(process.env);

  return defineConfig({
    ssr: {
      noExternal:
        process.env.NODE_ENV === 'production'
          ? [
              /^\@radix-ui/,
              'pino',
              'pino-pretty',
              '@logtail/pino',
              /^pino$/,
              /^pino\-pretty$/,
              /^@logtail\/pino$/,
              'colorette',
              'dateformat',
              'fast-copy',
              'fast-safe-stringify',
              'help-me',
              'joycon',
              'minimist',
              'on-exit-leak-free',
              'pino-abstract-transport',
              'pump',
              'readable-stream',
              'secure-json-parse',
              'sonic-boom',
              'strip-json-comments',
              'posthog-js',
              '@radix-ui/react-compose-refs',
              'react-dropzone',
              'react-currency-input-field',
              'vaul',
              '@project-serum/anchor',
            ]
          : [
              '@radix-ui/react-compose-refs',
              /^\@radix-ui/,
              'react-dropzone',
              'react-currency-input-field',
              'vaul',
              '@project-serum/anchor',
            ],
    },
    plugins: [
      nodePolyfills({ include: ['buffer'] }),
      remix({
        presets: [vercelPreset()],
        future: {
          v3_singleFetch: true,
        },
      }),
      tsconfigPaths(),
    ],
    resolve: {
      alias: {
        'msw/native': resolve(
          resolve(__dirname, './node_modules/msw/lib/native/index.mjs')
        ),
        'msw/browser': resolve(
          resolve(__dirname, './node_modules/msw/lib/browser/index.mjs')
        ),
      },
    },
    build: {
      target: 'esnext',
    },
    esbuild: {
      supported: {
        'top-level-await': true, //browsers can handle top-level-await features
      },
    },
    define: {
      DATABASE_URL: String(process.env.DATABASE_URL),
      POSTGRES_PRISMA_URL: String(process.env.POSTGRES_PRISMA_URL),
      REDIS_URL: String(process.env.REDIS_URL),
      PASSWORD_COOKIE_SECRET: String(process.env.PASSWORD_COOKIE_SECRET),
      AWS_S3_KEY_ID: String(process.env.AWS_S3_KEY_ID),
      AWS_S3_KEY_SECRET: String(process.env.AWS_S3_KEY_SECRET),
      GOOGLE_CLIENT_ID: String(process.env.GOOGLE_CLIENT_ID),
      GOOGLE_CLIENT_SECRET: String(process.env.GOOGLE_CLIENT_SECRET),
      GOOGLE_CLIENT_CALLBACK_URL: String(
        process.env.GOOGLE_CLIENT_CALLBACK_URL
      ),
      DIGITAL_OCEAN_ENDPOINT_URL: String(
        process.env.DIGITAL_OCEAN_ENDPOINT_URL
      ),
      DIGITAL_OCEAN_REGION: String(process.env.DIGITAL_OCEAN_REGION),
      DIGITAL_OCEAN_API_ID: String(process.env.DIGITAL_OCEAN_API_ID),
      DIGITAL_OCEAN_API_KEY: String(process.env.DIGITAL_OCEAN_API_KEY),
      DIGITAL_OCEAN_BUCKET: String(process.env.DIGITAL_OCEAN_BUCKET),
      BINANCE_API_KEY: String(process.env.BINANCE_API_KEY),
      BINANCE_API_SECRET: String(process.env.BINANCE_API_SECRET),
      BETTER_STACK_LOGS: String(process.env.BETTER_STACK_LOGS),
      PINATA_API_KEY: String(process.env.PINATA_API_KEY),
      PINATA_SECRET_KEY: String(process.env.PINATA_SECRET_KEY),
      PINATA_JWT: String(process.env.PINATA_JWT),
      PRISMA_FIELD_ENCRYPTION_KEY: String(
        process.env.PRISMA_FIELD_ENCRYPTION_KEY
      ),
      POSTHOG_URL: String(process.env.POSTHOG_URL),
      MARKETPLACE_PROGRAM_ID: String(process.env.MARKETPLACE_PROGRAM_ID),
      MARKETPLACE_AUTHORITY_PUBLIC_KEY: String(
        process.env.MARKETPLACE_AUTHORITY_PUBLIC_KEY
      ),
      SOLANA_NETWORK: String(process.env.SOLANA_NETWORK),
      SOLANA_RPC_URL: String(process.env.SOLANA_RPC_URL),
    },
  });
};
