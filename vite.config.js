import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  build: { outDir: 'docs' },
  plugins: [preact(), tailwindcss()],
});
