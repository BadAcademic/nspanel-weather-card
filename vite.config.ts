import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['es'],
      fileName: () => 'nspanel-weather-card.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2021',
    assetsInlineLimit: 100000000,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
