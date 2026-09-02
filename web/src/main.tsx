import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

const RELOAD_FLAG = 'sonnik-sw-reloaded'

if ('serviceWorker' in navigator) {
  if (sessionStorage.getItem(RELOAD_FLAG)) {
    sessionStorage.removeItem(RELOAD_FLAG)
  } else {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      sessionStorage.setItem(RELOAD_FLAG, '1')
      window.location.reload()
    })
  }
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  },
  onRegisteredSW(_url, registration) {
    void registration?.update()
    if (!registration) return
    window.setInterval(() => {
      void registration.update()
    }, 60_000)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
