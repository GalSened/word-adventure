import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Take over stale clients immediately: the new SW activates without
      // waiting, claims open pages, and drops old-version caches — combined
      // with the registerSW reload in main.jsx this is the "hard refresh"
      // that keeps installed phone PWAs on the latest deploy.
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'הרפתקת המילים',
        short_name: 'מילים',
        description: 'משחק לימוד אנגלית קסום',
        lang: 'he',
        dir: 'rtl',
        display: 'standalone',
        start_url: '/',
        background_color: '#f8fafc',
        theme_color: '#7c3aed',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        // Split heavyweight vendors so the app shell loads fast and
        // framework updates don't bust the whole-bundle cache
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
