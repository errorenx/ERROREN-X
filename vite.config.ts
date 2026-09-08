import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  // Use relative base './' by default so that the application works seamlessly on:
  // - GitHub Pages (https://user.github.io/repo/)
  // - Custom domains (https://example.com/)
  // - Subpaths / subdirectories
  // - Cloud Run / Express backend
  let base = './';

  if (process.env.BASE_URL && process.env.BASE_URL.trim() !== '') {
    base = process.env.BASE_URL;
  } else if (process.env.VITE_BASE_PATH && process.env.VITE_BASE_PATH.trim() !== '') {
    base = process.env.VITE_BASE_PATH;
  }

  return {
    base,

    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',

      // Disable file watching when DISABLE_HMR is true.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});