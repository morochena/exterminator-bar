import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ExterminatorBar',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : format === 'umd' ? 'umd.js' : 'js'}`,
      formats: ['es', 'umd', 'cjs']
    },
    rollupOptions: {
      external: ['fabric'],
      output: {
        assetFileNames: (assetInfo) => {
          return assetInfo.name === 'style.css' ? 'index.css' : assetInfo.name || 'asset-[hash]';
        },
        globals: {
          fabric: 'fabric'
        }
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    }
  }
}); 