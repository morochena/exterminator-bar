import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ExterminatorBar',
      fileName: 'exterminator-bar'
    },
    rollupOptions: {
      external: ['fabric', 'html2canvas'],
      output: {
        globals: {
          fabric: 'fabric',
          html2canvas: 'html2canvas'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
}); 