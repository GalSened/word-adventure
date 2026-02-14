# Phase 1: Test Safety Net - Research

**Researched:** 2026-02-14
**Domain:** Vitest testing framework, React Testing Library, snapshot testing, pure utility unit testing
**Confidence:** HIGH

## Summary

Phase 1 requires setting up a test framework from scratch for a Vite 7 + React 19 project (JSX, no TypeScript) and writing two categories of tests: pure utility unit tests (srs.js, grammarEngine.js, storage.js) and component snapshot tests (WordAdventure across 6 gameState values).

The project currently has zero test infrastructure -- no test runner, no test files, no vitest config. The standard stack for this is Vitest 4 (which supports Vite 7 natively) with happy-dom as the DOM environment and @testing-library/react for component rendering. The three utility files are pure functions with minimal external dependencies, making them straightforward to unit test. The WordAdventure component is large (627 lines) with heavy dependencies on framer-motion, canvas-confetti, lucide-react, localStorage, and custom hooks, which all need mocking for stable snapshot tests.

**Primary recommendation:** Install Vitest 4 + happy-dom + @testing-library/react + @testing-library/jest-dom. Mock framer-motion, canvas-confetti, and voice/mobile browser APIs globally in a setup file. Write pure unit tests first (no DOM needed), then snapshot tests with careful mocking.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | ^4.0.18 | Test runner and assertion library | Vite-native, zero-config with Vite 7 (dep: `vite ^6.0.0 \|\| ^7.0.0`), Jest-compatible API |
| happy-dom | ^20.6.1 | DOM environment for tests | Faster than jsdom, simpler localStorage spying, recommended by Vitest docs |
| @testing-library/react | ^16.3.2 | React component rendering for tests | Standard for React 19 (`react ^18.0.0 \|\| ^19.0.0`), user-centric queries |
| @testing-library/jest-dom | ^6.9.1 | Custom DOM matchers (toBeInTheDocument, etc.) | Vitest-compatible via `@testing-library/jest-dom/vitest` import |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/user-event | latest | Simulating user interactions | Not needed for Phase 1 (snapshot-only), but useful in future phases |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| happy-dom | jsdom | jsdom is more complete but 2-3x slower; localStorage spying requires `Storage.prototype` workaround in jsdom but works directly in happy-dom |
| Vitest 4 | Vitest 3.2 | Vitest 3.2 also supports Vite 7, but Vitest 4 is current and the project is greenfield -- no migration cost |

**Installation:**
```bash
npm install -D vitest happy-dom @testing-library/react @testing-library/jest-dom
```

## Architecture Patterns

### Recommended Test File Structure
```
src/
├── utils/
│   ├── srs.js
│   ├── srs.test.js              # Co-located unit tests
│   ├── grammarEngine.js
│   ├── grammarEngine.test.js
│   ├── storage.js
│   └── storage.test.js
├── WordAdventure.jsx
├── __tests__/
│   └── WordAdventure.snapshot.test.jsx  # Snapshot tests in __tests__ folder
└── __mocks__/                    # Manual mocks (optional)
```

Co-locate pure utility tests next to their source files. Use a `__tests__` folder or a `.snapshot.test.jsx` suffix for component snapshot tests that require heavier mocking.

### Pattern 1: Pure Utility Unit Test (no DOM needed)
**What:** Test pure functions by importing them directly and asserting return values
**When to use:** srs.js, grammarEngine.js, storage.js
**Example:**
```javascript
// Source: Vitest docs - https://vitest.dev/guide/
import { describe, it, expect } from 'vitest'
import { calculateNextReview } from './srs'

describe('calculateNextReview', () => {
  it('sets interval to 1 day for first successful review', () => {
    const result = calculateNextReview(null, 5)
    expect(result.interval).toBe(1)
    expect(result.repetition).toBe(1)
  })
})
```

### Pattern 2: Mocking localStorage for storage.js Tests
**What:** happy-dom provides a working localStorage; spy on it to simulate errors
**When to use:** Testing safeGetJSON/safeSetJSON error handling
**Example:**
```javascript
// Source: https://dylanbritz.dev/writing/mocking-local-storage-vitest/
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { safeGetJSON, safeSetJSON } from './storage'

beforeEach(() => {
  localStorage.clear()
})

it('returns defaultValue for missing key', () => {
  expect(safeGetJSON('nonexistent', 42)).toBe(42)
})

it('returns defaultValue for corrupted JSON', () => {
  localStorage.setItem('bad', 'not-json{')
  expect(safeGetJSON('bad', 'fallback')).toBe('fallback')
})

it('returns false when setItem throws (quota exceeded)', () => {
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
    throw new DOMException('QuotaExceededError')
  })
  expect(safeSetJSON('key', 'value')).toBe(false)
})
```

### Pattern 3: Component Snapshot with Mocked Dependencies
**What:** Render WordAdventure in a specific gameState and snapshot the output
**When to use:** Snapshot tests for each gameState value
**Example:**
```javascript
// Source: Vitest docs - https://vitest.dev/guide/snapshot
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import WordAdventure from '../WordAdventure'

// After mocking framer-motion, canvas-confetti, etc.
it('renders start state', () => {
  // Must provide userProfile in localStorage for start state
  localStorage.setItem('userProfile', JSON.stringify({ name: 'Test', gender: 'boy' }))
  const { container } = render(<WordAdventure />)
  expect(container).toMatchSnapshot()
})
```

### Pattern 4: Seeding randomness in grammarEngine tests
**What:** grammarEngine.js uses `Math.random()` extensively; mock it for deterministic tests
**When to use:** Testing sentence generation, gender agreement, verb conjugation
**Example:**
```javascript
import { vi, describe, it, expect, afterEach } from 'vitest'
import { generateChallenge } from './grammarEngine'

afterEach(() => {
  vi.restoreAllMocks()
})

it('generates a sentence challenge with correct structure', () => {
  // Seed Math.random to get deterministic output
  let callCount = 0
  vi.spyOn(Math, 'random').mockImplementation(() => {
    // Return values that select specific template, noun, verb, etc.
    return [0.0, 0.0, 0.0, 0.0][callCount++ % 4]
  })
  const challenge = generateChallenge()
  expect(challenge.word).toContain('THE')
  expect(challenge.hebrew).toMatch(/^ה/)
  expect(challenge.type).toBe('sentence')
})
```

### Anti-Patterns to Avoid
- **Testing animation details in snapshots:** Framer-motion props like `animate`, `initial`, `exit` are implementation details. Mock them away to get stable, meaningful snapshots.
- **Testing randomized output without seeding:** grammarEngine uses `Math.random()` -- tests without mocking will be flaky.
- **Importing the full component without mocking heavy deps:** canvas-confetti, voice recognition, haptic feedback will all fail or be slow in happy-dom. Mock them.
- **Over-reliance on snapshot tests for logic:** Snapshots catch UI regressions but don't verify behavior. Use unit tests for logic, snapshots for structure.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DOM environment | Custom JSDOM setup | `happy-dom` via Vitest `environment` config | Vitest handles lifecycle, cleanup, globals |
| DOM matchers | Custom `expect.extend()` assertions | `@testing-library/jest-dom/vitest` | 20+ battle-tested matchers like `toBeInTheDocument` |
| React render helpers | Custom `ReactDOM.render()` wrappers | `@testing-library/react` `render()` | Handles cleanup, provides query helpers |
| localStorage mock | Manual `Storage` class | happy-dom's built-in localStorage + `vi.spyOn` | happy-dom provides a working Storage implementation |

**Key insight:** Vitest + happy-dom gives you a working DOM with localStorage out of the box. You only need to spy/mock for error simulation (quota exceeded, corrupted data), not for basic get/set operations.

## Common Pitfalls

### Pitfall 1: Framer-motion causes slow/broken tests
**What goes wrong:** framer-motion uses `requestAnimationFrame`, `window.getComputedStyle`, and other browser APIs heavily. In happy-dom, this either fails or runs very slowly.
**Why it happens:** framer-motion is designed for real browsers, not simulated DOM environments.
**How to avoid:** Mock `framer-motion` globally in the Vitest setup file. Replace `motion.div`, `motion.button`, etc. with their plain HTML counterparts. Replace `AnimatePresence` with a pass-through component that just renders children.
**Warning signs:** Tests hang, take >5 seconds, or throw errors about `requestAnimationFrame`.

### Pitfall 2: canvas-confetti throws in happy-dom
**What goes wrong:** `canvas-confetti` tries to create a `<canvas>` element and get a 2D context, which is not fully supported in happy-dom.
**Why it happens:** happy-dom lacks canvas rendering support.
**How to avoid:** Mock `canvas-confetti` with `vi.mock('canvas-confetti', () => ({ default: vi.fn() }))` in the setup file.
**Warning signs:** `TypeError: canvas.getContext is not a function` or similar.

### Pitfall 3: Snapshot instability from timestamps and random IDs
**What goes wrong:** `srs.js` uses `Date.now()` for `nextReviewDate`. `grammarEngine.js` uses `Date.now()` and `Math.random()` for `id` generation. Snapshots change every run.
**Why it happens:** Non-deterministic values in test output.
**How to avoid:** For unit tests: use `vi.useFakeTimers()` and `vi.spyOn(Math, 'random')`. For snapshot tests: the component snapshots won't include SRS data directly (it's in state, not rendered), but be aware of any rendered timestamps.
**Warning signs:** Snapshot tests fail on every run with "1 snapshot failed" even though nothing changed.

### Pitfall 4: WordAdventure initial render shows WelcomeScreen, not "start" state
**What goes wrong:** WordAdventure checks `if (!userProfile)` and returns `<WelcomeScreen />` instead of the main game UI. Test tries to snapshot "start" state but gets welcome screen.
**Why it happens:** localStorage is empty in test environment, so `safeGetJSON('userProfile', null)` returns null.
**How to avoid:** Pre-populate localStorage with a valid `userProfile` before rendering: `localStorage.setItem('userProfile', JSON.stringify({ name: 'Test', gender: 'boy', avatar: '...' }))`.
**Warning signs:** All gameState snapshots look identical (all showing WelcomeScreen).

### Pitfall 5: Voice recognition and haptic feedback APIs missing
**What goes wrong:** `useVoiceRecognition` checks `window.SpeechRecognition || window.webkitSpeechRecognition`. `hapticFeedback` checks `navigator.vibrate`. These don't exist in happy-dom.
**Why it happens:** Browser-specific APIs not simulated by happy-dom.
**How to avoid:** These utilities already have null-checks and fail gracefully, but mock them to avoid console warnings and ensure predictable behavior.
**Warning signs:** Console warnings during test runs.

### Pitfall 6: gameState is internal useState -- cannot set directly from outside
**What goes wrong:** WordAdventure uses `const [gameState, setGameState] = useState('start')` internally. There's no prop to set the initial gameState.
**Why it happens:** The component is a monolith -- all state is internal.
**How to avoid:** For snapshot tests, simulate user interactions that change gameState, OR mock the hooks/useState to start in a specific state. However, the simplest approach is:
- **start:** Default state with userProfile in localStorage
- **welcome:** No userProfile in localStorage (renders WelcomeScreen)
- **map:** Click the map button after rendering start state
- **playing:** Call `startLevel` by clicking a level button
- **levelComplete/gameOver:** These require game progression, so use `vi.spyOn` on `useState` or extract state management

The most pragmatic approach for snapshot coverage is to test the states that can be reached directly (start, welcome/no-profile, map) and accept that deeper states (playing, levelComplete, gameOver) may need either component refactoring or creative mocking.

**Alternative:** Use `render` + `fireEvent` to navigate through states, snapshotting at each point. This is more integration-test-like but avoids internal mocking.

## Code Examples

Verified patterns from official sources:

### Vitest Config for this Project (vitest.config.js)
```javascript
// Source: https://main.vitest.dev/config
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.js'],
  },
}))
```

### Test Setup File (src/test-setup.js)
```javascript
// Source: https://testing-library.com/docs/svelte-testing-library/setup
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test (RTL best practice)
afterEach(() => {
  cleanup()
  localStorage.clear()
})
```

### Framer-motion Mock (for snapshot tests)
```javascript
// Source: adapted from https://www.hectane.com/blog/mock-framer-motion-with-jest
// Applied via vi.mock in individual test files or setup file
vi.mock('framer-motion', () => {
  const React = require('react')
  const actual = {} // Don't need actual exports

  const motion = new Proxy({}, {
    get: (_, tag) => {
      return React.forwardRef(({ children, ...props }, ref) => {
        // Strip framer-motion-specific props
        const {
          animate, initial, exit, variants, transition,
          whileHover, whileTap, whileFocus, whileInView,
          layout, layoutId, ...htmlProps
        } = props
        return React.createElement(tag, { ...htmlProps, ref }, children)
      })
    }
  })

  return {
    __esModule: true,
    motion,
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useMotionValue: (val) => ({ get: () => val, set: vi.fn() }),
    useTransform: (val) => val,
  }
})
```

### package.json Test Scripts
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vitest 3 + Vite 6 | Vitest 4 + Vite 7 | Vitest 4: Jan 2026, Vite 7: Jun 2025 | Vitest 4 has Vite 7 support via dep `vite ^6.0.0 \|\| ^7.0.0`. Minor breaking changes (mock behavior, coverage defaults) |
| jsdom default | happy-dom recommended | 2024+ | happy-dom is faster, lighter, and has better localStorage support |
| `@testing-library/jest-dom` + manual extend | `@testing-library/jest-dom/vitest` auto-extend | jest-dom v6+ | Single import in setup file auto-registers all matchers |
| jest-canvas-mock | vitest-canvas-mock | 2023 | Vitest-native fork, but often not needed -- just mock canvas-confetti directly |

**Deprecated/outdated:**
- Vitest `poolOptions` config: Removed in Vitest 4, thread options now at top-level `test` config
- Vitest `coverage.all`: Removed in Vitest 4, use `coverage.include` instead
- `vi.restoreAllMocks()`: Changed in Vitest 4 -- no longer resets spy state, only restores `vi.spyOn` mocks

## Codebase-Specific Analysis

### Utility Files Under Test

**srs.js** (48 lines, 2 exports):
- `calculateNextReview(previousState, quality)` -- Pure function, deterministic except for `Date.now()` in return value. Easy to test with `vi.useFakeTimers()`.
- `getDueWords(allWords)` -- Pure filter function, uses `Date.now()`. Easy to test.
- Dependencies: None (completely standalone).

**grammarEngine.js** (119 lines, 1 export + internal VOCAB/TEMPLATES):
- `generateChallenge()` -- Uses `Math.random()` extensively (4+ calls per invocation via `getRandom`). Requires mocking for determinism.
- Internal `VOCAB` object has 10 nouns, 8 adjectives, 5 transitive verbs, 6 intransitive verbs, 6 objects.
- Internal `TEMPLATES` array has 3 sentence patterns.
- Gender agreement: adjective/verb form selected based on `noun.gender` ('m' or 'f').
- ID generation uses `Date.now()` and `Math.random()`.
- Dependencies: None (completely standalone).

**storage.js** (69 lines, 4 exports):
- `safeGetJSON(key, defaultValue)` -- Returns parsed JSON or defaultValue on error.
- `safeSetJSON(key, value)` -- Returns boolean success status.
- `safeGetNumber(key, defaultValue)` -- Specialized number parser.
- `STORAGE_KEYS` -- Object with key constants.
- Dependencies: `localStorage` (browser API, provided by happy-dom).

### WordAdventure Component Complexity for Snapshot Tests

The component has these gameState values: `'start'`, `'store'`, `'inventory'`, `'petWalking'`, `'map'`, `'playing'`, `'levelComplete'`, `'gameOver'`, `'memory'`, `'avatar'`.

The phase requirements specify 6 states: start, welcome, map, playing, levelComplete, gameOver.

**Note:** "welcome" is not a gameState value -- it's what renders when `userProfile` is null (the WelcomeScreen component). This is an important distinction for test setup.

**Dependencies that need mocking for snapshots:**
- `framer-motion` (motion.*, AnimatePresence) -- used everywhere
- `canvas-confetti` -- called in processAnswer
- `lucide-react` -- SVG icons, should render fine in happy-dom
- `useVoiceRecognition` hook -- checks browser SpeechRecognition API
- `hapticFeedback` -- checks navigator.vibrate
- `useStoryProgress` hook -- complex, uses localStorage
- `useItemEffects` hook -- uses localStorage
- Various child components (Store, Inventory, MemoryGame, etc.)

## Open Questions

1. **Snapshot depth for playing/levelComplete/gameOver states**
   - What we know: These states require internal state manipulation (activeWords must be set, currentWordIndex must be valid, etc.). The component has no props for setting initial gameState.
   - What's unclear: Whether to use `fireEvent` sequences to reach these states, or mock `useState`, or take a different approach.
   - Recommendation: Use `fireEvent` to navigate through the app (click level button for 'playing', etc.). This is more robust than mocking internals. For 'levelComplete' and 'gameOver', these are harder to reach via UI -- consider either: (a) accepting simpler snapshot coverage for hard-to-reach states, or (b) mocking the state hook. The planner should decide the pragmatic depth.

2. **Snapshot stability with many child components**
   - What we know: WordAdventure renders 10+ child components depending on state. Some (StoryDialogue, PetEvolution, StoryIntro, StoryPathChoice) render conditionally as overlays.
   - What's unclear: Whether to shallow-render (mock child components) or deep-render (full tree).
   - Recommendation: Deep-render with framer-motion mocked. This captures the actual DOM output. If snapshots are too large/noisy, consider mocking specific child components that contribute noise without value.

3. **grammarEngine test coverage for all VOCAB combinations**
   - What we know: 3 templates x (10 nouns x 8 adj / 6 verbs / 5 verbs x 6 objects) = hundreds of combinations. Testing all is impractical.
   - What's unclear: What level of coverage satisfies "verify sentence generation, gender agreement, and verb conjugation."
   - Recommendation: Test one representative from each template (3 tests), verify gender agreement for both 'm' and 'f' nouns (2 tests), verify verb conjugation matches gender (2 tests). Total: ~7-10 targeted tests with deterministic Math.random mocking.

## Sources

### Primary (HIGH confidence)
- Vitest official docs (Context7: `/websites/main_vitest_dev`) -- configuration, environments, snapshot testing
- Testing Library official docs (Context7: `/websites/testing-library`) -- setup file, React rendering, jest-dom integration
- npm registry (`npm view vitest@4.0.18`) -- verified version 4.0.18, dep on `vite ^6.0.0 || ^7.0.0`
- npm registry (`npm view @testing-library/react@16.3.2`) -- verified peer dep on `react ^18.0.0 || ^19.0.0`
- npm registry (`npm view happy-dom@20.6.1`) -- latest version confirmed
- npm registry (`npm view @testing-library/jest-dom@6.9.1`) -- latest version confirmed

### Secondary (MEDIUM confidence)
- [Vitest 4.0 announcement](https://vitest.dev/blog/vitest-4) -- breaking changes documentation
- [Vite 7.0 announcement](https://vite.dev/blog/announcing-vite7) -- Node.js requirements, Vitest 3.2+ support
- [Testing Library setup for Vitest](https://testing-library.com/docs/svelte-testing-library/setup/) -- jest-dom/vitest import pattern
- [Mocking localStorage with Vitest](https://dylanbritz.dev/writing/mocking-local-storage-vitest/) -- happy-dom vs jsdom localStorage behavior
- [Mock framer-motion with Jest](https://www.hectane.com/blog/mock-framer-motion-with-jest) -- mock pattern adapted for Vitest

### Tertiary (LOW confidence)
- [framer-motion testing feature request](https://github.com/framer/motion/issues/1690) -- no official testing mock exists yet; community patterns only
- [Vitest Node 25 Web Storage issue](https://github.com/vitest-dev/vitest/issues/8757) -- NOT applicable to this project (Node 24.4.1), but noted for future awareness

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Vitest 4 + happy-dom + RTL 16 versions verified via npm registry, peer deps checked, Vite 7 compatibility confirmed
- Architecture: HIGH -- patterns verified through Context7 and official docs, codebase thoroughly analyzed
- Pitfalls: HIGH -- framer-motion mocking is well-documented community pattern; localStorage behavior in happy-dom verified; component state analysis based on direct code reading
- Open questions: MEDIUM -- pragmatic approaches exist for all 3 questions; planner has enough info to decide

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (stable domain, 30-day validity)
