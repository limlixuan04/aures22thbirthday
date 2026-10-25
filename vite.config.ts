import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative paths so the site works at any address (GitHub Pages sub-folder, Vercel, Netlify…).
  base: './',
  build: {
    // Keep built filenames neutral (no source-map leakage of comments).
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
