import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Override via VITE_BASE_PATH for a GitHub Pages project repository.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  server: { host: '0.0.0.0', port: 4173, strictPort: true, allowedHosts: ['terminal.local'] },
  preview: { host: '0.0.0.0', port: 4173, strictPort: true, allowedHosts: ['terminal.local'] },
});
