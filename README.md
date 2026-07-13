# הרפתקת המילים — Word Adventure

A Hebrew↔English vocabulary adventure for kids, built as an installable PWA.
Kids learn real English words through play: guided levels, a story that unfolds
as they progress, and a virtual puppy they walk, feed, and play with — where the
words they find along the path feed a real spaced-repetition engine.

**Live:** https://word-adventure-phi.vercel.app

## What's inside

- **261 curated words** across 12 categories (animals, food, family, school,
  transport…), each with emoji, example sentence, and difficulty tier, spread
  over **16 story levels** from the Kingdom Gate to the Legendary Crown.
- **Real SRS (SM-2)**: every answer — in levels, reviews, or the walk — updates
  the same spaced-repetition schedule; "Smart Review" sessions serve the words
  that are actually due.
- **הטיול הגדול (The Big Walk)** — the heart of the game: a side-scrolling
  journey with rigged SVG characters, day→sunset→night scenery, story landmarks,
  and pet care that matters (a hungry dog walks slower; a happy dog sniffs out
  bonus coins; a tap-to-catch fetch minigame at the meadow).
- **Story mode**: per-level NPC chapters with gendered Hebrew dialogue and a
  branching story path.
- **Economy**: coins earned by learning buy pets, treats, toys, hints and skips
  in the store; consumables work in-level.
- Multiple challenge types (translation, spelling, sentence-build, listening,
  memory), leaderboard, daily quests, avatars, and full RTL Hebrew UI.

## Tech

React 19 · Vite 7 · zustand (persisted, debounced storage with
flush-on-pagehide) · framer-motion · Tailwind CSS · vite-plugin-pwa ·
vitest + Testing Library (happy-dom).

## Develop

```bash
npm install
npm run dev        # local dev server
npm test           # vitest run (190 tests)
npm run lint       # eslint, zero-warning policy
npm run build      # production build + PWA precache
```

## CI/CD

GitHub Actions (`.github/workflows/deploy.yml`):

- **ci** — lint + full test suite on every push and PR, plus a nightly
  scheduled run (02:30 UTC) that catches time/date-dependent breakage.
- **deploy** — runs only on green CI on `main`, deploys to Vercel.
  Vercel's own git auto-deploy for `main` is disabled in `vercel.json`
  (`git.deploymentEnabled.main: false`), so **CI is the only path to
  production**; PR preview deployments remain enabled.

## Project map

```
src/
  components/        screens, game modes, WalkArt.jsx (SVG character rigs)
  data/              words.js (261 words), levels.js, story.js, storeItems.js
  hooks/             useGameLogic, useStoryProgress, ...
  store/             gameStore.js (zustand slices: profile, progress, petCare…)
  utils/             srs.js (SM-2), walkSession.js (walk engine), ...
```
