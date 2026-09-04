self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      await self.clients.claim()
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      await Promise.all(
        windows.map((client) => {
          if (typeof client.navigate === 'function') return client.navigate(client.url)
          client.postMessage({ type: 'sonnik-reload' })
          return undefined
        }),
      )
      await self.registration.unregister()
    })(),
  )
})
