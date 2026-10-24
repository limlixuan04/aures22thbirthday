/**
 * Builds the whole site into ONE self-contained HTML file (dist-single/index.html)
 * — handy for a quick private preview. Usage: npm run build:single
 */
import { defineConfig, mergeConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import base from './vite.config';

export default mergeConfig(
  base,
  defineConfig({
    plugins: [viteSingleFile()],
    build: { outDir: 'dist-single', assetsInlineLimit: 100_000_000 },
  }),
);
