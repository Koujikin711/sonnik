import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

function versionStamp(): Plugin {
  const stamp = () => ({
    version: pkg.version,
    deployedAt: new Date().toISOString(),
  })

  return {
    name: 'version-stamp',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path === '/sonnik/version.json' || path === '/version.json') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(stamp(), null, 2) + '\n')
          return
        }
        next()
      })
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify(stamp(), null, 2) + '\n',
      })
    },
    closeBundle() {
      writeFileSync(resolve(import.meta.dirname, 'dist/.nojekyll'), '')
    },
  }
}

export default defineConfig({
  base: '/sonnik/',
  plugins: [
    react(),
    versionStamp(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg'],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: '',
        importScripts: ['sw-reload.js'],
        globPatterns: ['**/*.{js,css,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/sonnik\/(version|data\/symbols)\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sonnik-data',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 8, maxAgeSeconds: 60 },
            },
          },
        ],
      },
      manifest: {
        name: 'Сонник',
        short_name: 'Сонник',
        description: 'Толкование снов — свой словарь традиций',
        theme_color: '#1a3a4a',
        background_color: '#eef3f6',
        display: 'standalone',
        lang: 'ru',
        start_url: '/sonnik/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
