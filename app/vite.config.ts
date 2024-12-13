import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { vercelPreset } from '@vercel/remix/vite';

installGlobals({ nativeFetch: true });

export default defineConfig({
  test: {
    threads: false,
    coverage: {
      all: true,
    },
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
  },
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
    'process.env.BROWSER': 'true',
  },
});
