import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ExterminatorBar',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : format === 'umd' ? 'umd.js' : 'js'}`,
      formats: ['es', 'umd', 'cjs'],
    },
    rollupOptions: {
      external: ['fabric', 'html2canvas'],
      output: {
        globals: {
          fabric: 'fabric',
          html2canvas: 'html2canvas',
        },
        exports: 'named',
        format: 'umd',
        name: 'ExterminatorBar',
        extend: true,
      },
    },
    sourcemap: true,
    minify: 'terser',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
}); 