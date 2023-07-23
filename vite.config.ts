import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';
import { run as runCssDts } from 'typed-css-modules';
import react from '@vitejs/plugin-react';
import createSvgSpritePlugin from 'vite-plugin-svg-sprite';

const isDev = process.env.NODE_ENV === 'development';
const rootDir = fileURLToPath(new URL('.', import.meta.url));
const srcDir = path.resolve(rootDir, 'src');

runCssDts(srcDir, {
  pattern: '**/*.module.scss',
  watch: isDev,
}).catch(console.error);

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '#': srcDir,
    },
  },
  plugins: [
    react(),
    createSvgSpritePlugin({
      symbolId: 'icon-[name]-[hash]',
      include: '**/icons/*.svg',
    }),
  ],
  server: {
    port: 10001,
  },
});
