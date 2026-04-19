import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: '../assets',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: false,
  },
  test: {
    // This config section is only used when running via vitest directly
    // For vitest configuration, see vitest.config.ts
  },
});
