# Coding Conventions

**Analysis Date:** 2026-02-14

## Naming Patterns

**Files:**
- React components: PascalCase with `.jsx` extension (e.g., `GameHeader.jsx`, `ErrorBoundary.jsx`, `LetterPicker.jsx`)
- Custom hooks: camelCase with `use` prefix and `.js` extension (e.g., `useStoryProgress.js`, `useItemEffects.js`)
- Utilities: camelCase with `.js` extension (e.g., `storage.js`, `grammarEngine.js`, `srs.js`)
- Data modules: camelCase with `.js` extension (e.g., `storeItems.js`, `story.js`, `words.js`)
- Configuration: camelCase with `.js` extension (e.g., `constants.js`)
- Barrel files: `index.js` for directory exports (e.g., `src/hooks/index.js`, `src/components/screens/index.js`)

**Functions:**
- camelCase for all functions: `handleSelect`, `calculateNextReview`, `getDailyDeals`, `getInitialProgress`
- Event handlers prefixed with `handle`: `handleBuy`, `handleReset`, `handleGoHome`, `handleSelect`, `handleBackspace`
- Getter functions prefixed with `get`: `getDueWords`, `getInitialProgress`, `getOwnedCount`, `getItemSlot`, `getRandomItem`
- Boolean checks start with `is` or `can`: `isOwned`, `canAfford`, `isListening`, `isSupported`
- Conversion functions: `safeGetJSON`, `safeSetJSON`, `safeGetNumber`

**Variables:**
- camelCase for all variables: `userProfile`, `currentWordIndex`, `userInput`, `activeWords`, `hasError`
- State variables follow: `const [state, setState] = useState(...)`
- Use camelCase consistently: `dailyStats`, `newUsed`, `ownedCount`, `itemEffects`
- Private/internal variables use leading underscore (rarely used, seen in comments)
- Constants: UPPER_SNAKE_CASE for exported constants (e.g., `STORAGE_KEYS`, `GAME_CONFIG`, `CHAPTERS`)

**Types/Objects:**
- No TypeScript detected; uses JSDoc comments for type hints
- Configuration objects in UPPER_SNAKE_CASE: `GAME_CONFIG`, `DAILY_QUEST_CONFIG`, `STORE_ITEMS`, `CHAPTERS`
- Inline object properties: camelCase (e.g., `{ word: '...', hebrew: '...', level: '...' }`)

## Code Style

**Formatting:**
- ESLint configured with flat config format in `eslint.config.js`
- ecmaVersion: 2020 (ES11)
- Parser features: JSX enabled
- Line breaks: Standard (newlines separate statements)
- No explicit Prettier config detected; follows ESLint rules

**Linting:**
- ESLint v9.39.1 with plugins: react-hooks, react-refresh
- Configuration in `eslint.config.js`:
  - Base config: `@eslint/js` recommended rules
  - React hooks rules: `eslint-plugin-react-hooks/flat/recommended`
  - React refresh rules: `eslint-plugin-react-refresh/vite`
- Rule: `no-unused-vars` error with varsIgnorePattern `^[A-Z_]` (allows unused PascalCase and UPPER_CASE vars)
- Ignores `/dist` directory

**Import/Export:**
- ES6 modules (`import`/`export`)
- Default exports for components: `export default function ComponentName() { ... }`
- Named exports for utility functions and hooks: `export function useStoryProgress(...)`
- Barrel exports in index files to centralize imports

## Import Organization

**Order:**
1. React and core libraries first (e.g., `import React, { useState } from 'react'`)
2. External dependencies (e.g., `import { motion } from 'framer-motion'`, `import { Volume2 } from 'lucide-react'`)
3. Local relative imports - utilities first (e.g., `import { calculateNextReview } from './utils/srs'`)
4. Local relative imports - hooks (e.g., `import { useStoryProgress } from './hooks/useStoryProgress'`)
5. Local relative imports - components (e.g., `import AvatarSelect from './components/AvatarSelect'`)
6. Local relative imports - data and config (e.g., `import { CHAPTERS } from './data/story'`)

**Path Aliases:**
- No path aliases detected (no jsconfig.json or paths configuration)
- Relative paths used throughout: `./utils/`, `./hooks/`, `./components/`, `./data/`

## Error Handling

**Patterns:**
- Try-catch blocks used for risky operations: JSON parsing in `safeGetJSON`, `safeSetJSON`, `safeGetNumber` in `src/utils/storage.js`
- Error logging: `console.error()` with prefixed messages (e.g., `[Storage]`, `[VoiceRecognition]`)
- Warnings: `console.warn()` for non-fatal issues (e.g., voice recognition failures in `src/utils/voice.js`)
- Error Boundary component: `ErrorBoundary.jsx` catches React component errors with fallback UI
- Safe storage utilities prevent crashes from corrupted localStorage data by returning default values
- Development-only error logging: Errors logged to console only when `process.env.NODE_ENV === 'development'`

**Example from `src/utils/storage.js`:**
```javascript
export const safeGetJSON = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`[Storage] Failed to parse "${key}":`, error);
    return defaultValue;
  }
};
```

## Logging

**Framework:** `console` (no logging library detected)

**Patterns:**
- Error logging: `console.error()` with descriptive messages
- Warning logging: `console.warn()` for non-fatal issues
- Prefix convention: Square bracket prefix for module context (e.g., `[Storage]`, `[VoiceRecognition]`, `[ErrorBoundary]`)
- Development-mode: Additional error details logged only in development
- No production logging detected; all logging appears to be for development/debugging

**Examples:**
```javascript
console.error(`[Storage] Failed to parse "${key}":`, error);
console.warn('[VoiceRecognition] Start failed:', err);
console.error('ErrorBoundary caught an error:', error, errorInfo);
```

## Comments

**When to Comment:**
- Function/hook purpose: JSDoc-style comments at function definitions
- Complex logic: Inline comments for non-obvious algorithms (e.g., SM-2 spaced repetition in `src/utils/srs.js`)
- Data structures: Comments explaining object properties and their purposes
- Sections: Section dividers using comment lines (e.g., `// --- DATA ---`, `// --- EFFECT: PERSISTENCE ---`)
- Bug fixes or workarounds: Explanatory comments on why something is done a certain way

**JSDoc/TSDoc:**
- Block comments for functions: Document parameters, return values, purpose
- Prefix comment style (not full JSDoc with tags): Lines start with `/**` and `*/`
- Example from `src/utils/storage.js`:
```javascript
/**
 * Safely retrieve and parse JSON from localStorage
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {*} Parsed value or defaultValue
 */
export const safeGetJSON = (key, defaultValue = null) => {
```

**Documentation comments for data files:**
- File-level comment at top explaining module purpose (e.g., in `src/data/story.js`)
- Section headers marking logical divisions (e.g., `// ============================================`)

## Function Design

**Size:**
- Functions range from 5-50 lines typically
- Larger components (1000+ lines) like `WordAdventure.jsx` split logic using custom hooks
- Utility functions kept lean and focused (e.g., `srs.js` functions are 10-20 lines)

**Parameters:**
- Destructured props in React components: `export default function Store({ coins, inventory, onBuy, onClose, gender = 'boy' })`
- Default parameters used: `gender = 'boy'`, `size = 'normal'`, `defaultValue = null`
- Callback functions passed as props for event handlers
- Custom hooks receive configuration as parameters: `useStoryProgress(userProfile)`, `useItemEffects(inventory)`

**Return Values:**
- React components return JSX
- Hooks return state objects and callback functions
- Utility functions return computed values or null/false on failure
- Objects returned for grouped return values: `{ interval, repetition, easeFactor, nextReviewDate }`
- Arrays returned for collections: `getDueWords` returns filtered word array

## Module Design

**Exports:**
- Default exports: React components and main hook functions
- Named exports: Utility functions, configuration constants, helper functions
- Example from `src/hooks/index.js` (barrel file):
```javascript
export { useGameState } from './useGameState';
export { useUserProgress } from './useUserProgress';
export { useDailyStats } from './useDailyStats';
export { useStoryProgress } from './useStoryProgress';
```

**Barrel Files:**
- Used for organizing component exports: `src/components/screens/index.js`
- Used for hook exports: `src/hooks/index.js`
- Simplifies imports from consuming modules: `import { useStoryProgress } from './hooks'` instead of `'./hooks/useStoryProgress'`

---

*Convention analysis: 2026-02-14*
