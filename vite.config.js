import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js'
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/dompurify')) {
            return 'vendor-dompurify';
          }
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'vendor-pdfjs';
          }
          if (id.includes('node_modules/mammoth')) {
            return 'vendor-mammoth';
          }
        }
      }
    },
    modulePreload: {
      resolveDependencies(filename, deps) {
        return deps.filter(dep => 
          !dep.includes('vendor-firebase') && 
          !dep.includes('vendor-pdfjs') && 
          !dep.includes('vendor-mammoth')
        );
      }
    },
    chunkSizeWarningLimit: 1500
  }
});
