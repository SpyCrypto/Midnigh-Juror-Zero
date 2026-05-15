import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^\.\/lib\//,
        replacement: resolve(__dirname, 'lib') + '/',
      },
      {
        find: /^\.\/lib$/,
        replacement: resolve(__dirname, 'lib') + '/index',
      },
      {
        find: /^\.\/managed\//,
        replacement: resolve(__dirname, 'managed') + '/',
      },
      {
        find: /^@midnight-ntwrk\/platform-js\/effect\/(.+)$/,
        replacement: resolve(__dirname, 'lib/vendor/platform-js/effect') + '/$1.mjs',
      },
      {
        find: '@midnight-ntwrk/platform-js',
        replacement: resolve(__dirname, 'lib/vendor/platform-js/index.mjs'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-network-id',
        replacement: resolve(__dirname, 'lib/vendor/midnight-js-network-id/index.mjs'),
      },
      {
        find: '@midnight-ntwrk/midnight-js-utils',
        replacement: resolve(__dirname, 'lib/vendor/midnight-js-utils/index.mjs'),
      },
    ],
  },
  optimizeDeps: {
    exclude: [
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/onchain-runtime-v3',
      '@midnight-ntwrk/ledger-v8',
    ],
  },
  build: {
    target: 'esnext',
  },
  assetsInclude: ['**/*.prover', '**/*.verifier', '**/*.bzkir', '**/*.zkir', '**/*.wasm'],
});
