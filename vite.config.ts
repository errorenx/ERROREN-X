import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  // Support GitHub Pages repository path or relative paths
  let base = './';

  if (process.env.GITHUB_REPOSITORY) {
    const parts = process.env.GITHUB_REPOSITORY.split('/');
    const repo = parts[1] || parts[0];
    if (repo && !repo.toLowerCase().endsWith('.github.io')) {
      base = `/${repo}/`;
    }
  } else if (
    process.env.VITE_BASE_PATH &&
    process.env.VITE_BASE_PATH !== '/' &&
    process.env.VITE_BASE_PATH !== '//'
  ) {
    base = process.env.VITE_BASE_PATH.endsWith('/')
      ? process.env.VITE_BASE_PATH
      : `${process.env.VITE_BASE_PATH}/`;
  } else if (process.env.BASE_URL) {
    base = process.env.BASE_URL;
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