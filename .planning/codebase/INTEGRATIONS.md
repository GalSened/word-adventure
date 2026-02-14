# External Integrations

**Analysis Date:** 2026-02-14

## APIs & External Services

**None Detected** - This is a fully client-side application with no external API integrations, backend services, or third-party API calls.

## Data Storage

**Databases:**
- None - application uses only browser storage

**Local Storage:**
- Browser localStorage only
  - Keys defined in `src/utils/storage.js` via `STORAGE_KEYS` constant
  - Safe JSON serialization/deserialization with error handling
  - Persists user progress, scores, inventory, and game state
  - Keys: `userProfile`, `score`, `stars`, `userProgress`, `highScores`, `inventory`, `dailyStats`, `avatar`

**File Storage:**
- Local filesystem only - static assets served from `public/` directory
- PWA asset caching via Service Worker (vite-plugin-pwa)
- No cloud storage integration

**Caching:**
- Service Worker caching (vite-plugin-pwa)
  - `registerType: 'autoUpdate'` in `vite.config.js`
  - Caches application assets for offline support
  - Auto-updates when new version deployed
- No third-party cache service (Redis, Memcached, etc.)

## Authentication & Identity

**Auth Provider:**
- None - application is public with no user authentication
- Avatar selection provided by `AvatarSelect` component
- User identification is local only (no backend session management)

## Monitoring & Observability

**Error Tracking:**
- None detected - no Sentry, LogRocket, or similar integration

**Logs:**
- Console logging only via `console.log()`, `console.error()`, `console.warn()`
- No log aggregation service
- Error messages prefixed with module identifiers: `[Storage]`, `[VoiceRecognition]`, etc.
- Examples in `src/utils/storage.js`, `src/utils/voice.js`

## Browser APIs Used

**Critical (no fallback):**
- localStorage - game state persistence
  - Implementation: `src/utils/storage.js` with safe get/set wrappers
  - Fallback: returns default values if storage fails

**Speech & Voice:**
- Web Speech API for pronunciation verification
  - Implementation: `src/utils/voice.js` (`useVoiceRecognition` hook)
  - Language: en-US hardcoded
  - Graceful degradation: `isSupported` flag disables UI if unavailable
  - Browser support check: `window.SpeechRecognition || window.webkitSpeechRecognition`

**Mobile & Haptics:**
- Vibration API for haptic feedback (`navigator.vibrate`)
  - Implementation: `src/utils/mobile.js` (`hapticFeedback` function)
  - Pattern types: light, medium, heavy, success, warning, error, tap, selection
  - Graceful degradation: silently fails if unavailable
  - Example: Medium vibration [20ms] on correct answer, error pattern [50-100-50ms] on wrong answer

- Screen Orientation API for portrait lock
  - Implementation: `src/utils/mobile.js` (`lockOrientation` function)
  - Called during gameplay to prevent landscape rotation
  - Graceful degradation: returns false if not supported

- Screen Wake Lock API to prevent screen sleep
  - Implementation: `src/utils/mobile.js` (`requestWakeLock`, `releaseWakeLock`)
  - Keeps screen awake during active gameplay
  - Graceful degradation: silently fails if denied or unsupported

**Touch & Gestures:**
- Touch Events API for swipe detection
  - Implementation: `src/utils/mobile.js` (`createSwipeHandler`)
  - Supported gestures: swipe left/right (horizontal), swipe up/down (vertical)
  - Threshold: 50px minimum distance
  - Time constraint: max 500ms for swipe detection
  - Used in interactive game screens

## CI/CD & Deployment

**Hosting:**
- Vercel (configured via `vercel.json`)
- Static deployment - no runtime environment needed

**Build Process:**
```
npm install → npm run build → dist/ → Vercel deployment
```

**Build Configuration:**
- `vite.config.js` - Vite build settings
- PWA manifest generated at build time with app metadata
- Assets bundled and optimized for production
- Service Worker generated for offline support

**CI Pipeline:**
- Not configured - likely Vercel CI based on Git integration

## Environment Configuration

**Required env vars:**
- None - application has no backend or service dependencies requiring secrets

**Secrets location:**
- No secrets required - fully client-side application
- No `.env` file needed or present

## Static Assets & PWA

**PWA Configuration:**
- Manifest metadata in `vite.config.js`:
  - App name: 'הרפתקת המילים' (Hebrew: "Word Adventure")
  - Short name: 'מילים' (Hebrew: "Words")
  - Description: 'משחק לימוד אנגלית קסום' (Hebrew: "Magical English learning game")
  - Theme color: #ffffff (white)

**PWA Icons:**
- `public/pwa-192x192.png` - Home screen icon
- `public/pwa-512x512.png` - Splash screen icon
- Auto-generated apple-touch-icon.png reference

**Manifest Features:**
- App installation support (add to home screen on mobile)
- Offline functionality via Service Worker
- Auto-update on new deployment
- No backend polling or server connection required

## No Third-Party Integrations

**Not Used:**
- No API client library (axios, fetch, etc. for backend calls)
- No state management library (Redux, Zustand, Jotai, etc.)
- No routing library (React Router) - single-page component-based navigation
- No form validation library (Formik, React Hook Form) - no forms
- No HTTP/WebSocket library - no network communication
- No authentication library (Auth0, Firebase, etc.)
- No analytics service (Google Analytics, Mixpanel, etc.)
- No payment processing (Stripe, PayPal, etc.)
- No CMS or backend API
- No database library

---

*Integration audit: 2026-02-14*
