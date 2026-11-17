import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // Social-card images must be absolute URLs. Set SITE_URL at build time
      // (e.g. SITE_URL=https://example.com npm run build); without it they stay root-relative.
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', (process.env.SITE_URL ?? '').replace(/\/$/, '')),
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
