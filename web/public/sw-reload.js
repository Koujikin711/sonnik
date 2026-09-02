/* Runs inside the generated service worker. Forces a real page reload
   after a new worker activates, so users are not stuck on a cached shell. */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of windows) {
        if (typeof client.navigate === 'function') {
          await client.navigate(client.url)
        }
      }
    })(),
  )
})
