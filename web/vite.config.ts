import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
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
          res.setHeader('Cache-Control', 'no-store')
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
  plugins: [react(), versionStamp()],
})
