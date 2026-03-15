import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  name: 'Teryx',
  globalName: 'Teryx',
  minify: false,
  splitting: false,
});
