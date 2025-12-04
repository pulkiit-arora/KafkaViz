import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    base: './', // Ensures assets are loaded relatively for GitHub Pages
    build: {
      outDir: 'dist',
    },
    define: {
      // If API_KEY is present in build environment (e.g. GitHub Secrets), bake it in.
      // Default to empty string to prevent "undefined" variables in the built code.
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY || ""),
      // Polyfill other process.env calls to avoid crashes
      'process.env': {} 
    }
  };
});
