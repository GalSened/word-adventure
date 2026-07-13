import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Deployed fixes must reach installed PWAs fast. Phones foreground the app
// from memory for days without a real navigation, so the browser's own
// service-worker update check never runs and kids stay on stale builds.
// registerSW (autoUpdate) reloads the page the moment a new service worker
// takes control; we force an update check on app launch, on every return
// to the foreground, and hourly while open. Game state lives in persisted
// storage (with a pagehide flush), so the reload never loses progress data.
registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
        if (!registration) return
        const check = () => registration.update().catch(() => { })
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') check()
        })
        setInterval(check, 60 * 60 * 1000)
    },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
