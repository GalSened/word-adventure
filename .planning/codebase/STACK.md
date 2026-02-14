# Technology Stack

**Analysis Date:** 2026-02-14

## Languages

**Primary:**
- JavaScript (ES2020+) - All application source code
- JSX - React component syntax in `.jsx` files
- CSS 3 - Styling via Tailwind CSS

## Runtime

**Environment:**
- Node.js (version not specified in lockfile metadata)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- React 19.2.0 - UI library and component framework
- Vite 7.2.4 - Build tool and development server with HMR support

**UI & Animation:**
- Framer Motion 12.23.26 - Complex animation framework for React components
- Lucide React 0.562.0 - Icon library providing 560+ SVG icons
- canvas-confetti 1.9.4 - Confetti animation for celebration/reward sequences

**Styling:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework
- PostCSS 8.5.6 - CSS transformation tool
- Autoprefixer 10.4.23 - Automatic vendor prefix injection

**PWA & Offline:**
- vite-plugin-pwa 1.2.0 - Progressive Web App support with auto-update registration

**Testing:**
- No testing framework configured (not detected)

**Build & Dev:**
- @vitejs/plugin-react 5.1.1 - React Fast Refresh plugin for Vite
- ESLint 9.39.1 - JavaScript linter
- @eslint/js 9.39.1 - ESLint recommended configuration

## Key Dependencies

**Critical:**
- react 19.2.0 - Core UI framework, all components depend on this
- react-dom 19.2.0 - DOM rendering for React applications
- framer-motion 12.23.26 - All animated transitions and motion sequences use this
- vite-plugin-pwa 1.2.0 - Enables offline functionality and install-to-home-screen capability

**UI & Interaction:**
- lucide-react 0.562.0 - Icons used throughout UI (Volume2, Heart, Trophy, Star, etc.)
- canvas-confetti 1.9.4 - Celebration animations when completing challenges

**Development:**
- @vitejs/plugin-react 5.1.1 - Hot module replacement and React Fast Refresh
- eslint-plugin-react-hooks 7.0.1 - Validates React Hook patterns
- eslint-plugin-react-refresh 0.4.24 - Prevents Fast Refresh edge cases

## Configuration

**Environment:**
- Environment variables not used - application is fully client-side with no backend integration
- No `.env` file present
- Configuration hardcoded in `src/config/constants.js`

**Build:**
- `vite.config.js` - Vite configuration with React plugin and PWA plugin
- `tailwind.config.js` - Tailwind CSS configuration with standard theme
- `postcss.config.js` - PostCSS configuration with Tailwind and Autoprefixer
- `eslint.config.js` - ESLint flat config format with React hooks and refresh rules

**Deployment:**
- `vercel.json` - Vercel deployment configuration
  - Build command: `npm run build`
  - Output directory: `dist`
  - Framework: vite

## Platform Requirements

**Development:**
- Node.js and npm installed
- Modern browser with ES2020 support
- ESLint CLI tools for linting

**Production:**
- Deployment target: Vercel (configured via `vercel.json`)
- Client-side rendering only - no backend server required
- Requires browser support for:
  - ES2020+ JavaScript
  - Web APIs: localStorage, Web Speech API (for voice recognition)
  - Mobile APIs: Vibration API, Screen Orientation API, Screen Wake Lock API
  - PWA features: Service Workers

## Browser API Dependencies

**Required:**
- localStorage - for persistent state and game progress storage
- Web Speech API - for voice recognition in word pronunciation checks
- Vibration API - for haptic feedback on mobile devices

**Enhanced (optional, graceful degradation):**
- Screen Orientation API - for portrait lock
- Screen Wake Lock API - to prevent sleep during gameplay
- Touch Events API - for swipe detection on mobile

---

*Stack analysis: 2026-02-14*
