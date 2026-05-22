import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages personal site (username.github.io): base: '/'
  // For project site (username.github.io/PRTSMusic): base: '/PRTSMusic/'
  base: '/',
  server: {
    proxy: {
      // Monster Siren Records API proxy (dev only)
      '/siren-api': {
        target: 'https://monster-siren.hypergryph.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/siren-api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('[siren-proxy]', err.message);
          });
        },
      },
    },
  },
})
