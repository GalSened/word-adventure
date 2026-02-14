# Testing Patterns

**Analysis Date:** 2026-02-14

## Test Framework

**Runner:**
- No test framework detected
- No test configuration files found (jest.config.*, vitest.config.*, cypress.config.*)
- No test scripts in `package.json` (scripts: dev, build, lint, preview)

**Assertion Library:**
- Not applicable - no testing infrastructure present

**Run Commands:**
```bash
# Available commands in package.json:
npm run dev          # Run development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Test File Organization

**Current State:**
- No test files found in repository
- No `.test.js`, `.spec.js`, or test directories detected
- All source code is untested

**Recommended Structure (if testing were added):**
- Co-located tests: `Component.jsx` would have `Component.test.jsx` in same directory
- Hook tests: `useHookName.js` would have `useHookName.test.js` in same directory
- Utility tests: `utility.js` would have `utility.test.js` in same directory

**Naming Convention:**
- Components: `ComponentName.test.jsx`
- Hooks: `hookName.test.js`
- Utilities: `utilityName.test.js`

## Test Structure

**Recommended Pattern (based on code structure):**

For a React component test, following the project's style:
```javascript
// Example: GameHeader.test.jsx
import React from 'react';
import GameHeader from './GameHeader';

describe('GameHeader', () => {
  it('renders header with title', () => {
    // Test implementation
  });

  it('displays score correctly', () => {
    // Test implementation
  });
});
```

For a custom hook test:
```javascript
// Example: useStoryProgress.test.js
import { renderHook, act } from '@testing-library/react';
import { useStoryProgress } from './useStoryProgress';

describe('useStoryProgress', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useStoryProgress(null));
    expect(result.current.progress).toBeDefined();
  });

  it('persists progress to localStorage', () => {
    const { result } = renderHook(() => useStoryProgress(null));
    // Test implementation
  });
});
```

For a utility function test:
```javascript
// Example: srs.test.js
import { calculateNextReview, getDueWords } from './srs';

describe('SRS', () => {
  describe('calculateNextReview', () => {
    it('calculates interval based on quality score', () => {
      const result = calculateNextReview({
        interval: 0,
        repetition: 0,
        easeFactor: 2.5
      }, 4);
      expect(result.interval).toBe(1);
      expect(result.repetition).toBe(1);
    });
  });
});
```

**Setup Pattern:**
- No setup files detected
- Would typically initialize test utilities and global mocks in a `setupTests.js` file
- localStorage would need mocking for tests involving persistence

**Teardown Pattern:**
- No explicit teardown detected
- Tests would need to clean up localStorage mocks between tests
- Would use `afterEach()` hooks for cleanup

**Assertion Pattern:**
- No assertions currently exist
- Would likely use Jest's built-in assertion methods or similar library
- Pattern seen in codebase suggests straightforward assertions

## Mocking

**Framework:**
- Jest would be the standard for React/Vite projects
- Manual mocking approach likely needed for:
  - localStorage (used extensively in `src/utils/storage.js`)
  - Web Audio API (voice recognition in `src/utils/voice.js`)
  - framer-motion animations
  - canvas-confetti library

**Patterns to Mock:**

**localStorage:**
```javascript
// Mock localStorage for persistence layer tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};

global.localStorage = localStorageMock;
```

**Voice Recognition API:**
```javascript
// Mock Web Audio API for voice input
global.SpeechRecognition = jest.fn(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn()
}));
```

**Framer Motion:**
```javascript
// Mock animations to run synchronously in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }) => children
  },
  AnimatePresence: ({ children }) => children
}));
```

**What to Mock:**
- External APIs (voice recognition, canvas confetti)
- Browser APIs (localStorage, window object)
- Animation libraries (framer-motion)
- Heavy dependencies that don't affect core logic

**What NOT to Mock:**
- React itself
- Custom utility functions that are being tested
- Storage utilities - test them with mocked localStorage
- Core game logic and calculations
- Component logic (test actual behavior)

## Fixtures and Factories

**Test Data:**

No fixtures or factory patterns currently exist. Recommended approach based on codebase:

```javascript
// fixtures/wordData.js
export const mockWordData = [
  {
    id: 'cat',
    word: 'CAT',
    hint: '🐱 חיה שאוהבת חלב',
    hebrew: 'חתול',
    level: 'easy',
    type: 'word',
    srs: {
      interval: 1,
      repetition: 1,
      easeFactor: 2.5,
      nextReviewDate: Date.now()
    }
  },
  {
    id: 'dog',
    word: 'DOG',
    hint: '🐕 החבר הכי טוב של האדם',
    hebrew: 'כלב',
    level: 'easy',
    type: 'word'
  }
];

export const mockUserProgress = {
  score: 1500,
  stars: 30,
  level: 'medium',
  wordsLearned: ['cat', 'dog', 'sun']
};

export const mockStoryProgress = {
  currentChapter: 'easy',
  completedChapters: [],
  totalWordsLearned: 0,
  storyPath: null,
  choicesMade: [],
  activePetId: null,
  petEvolutionLevel: {},
  discoveredSecrets: [],
  unlockedLore: [],
  collectibles: [],
  achievements: []
};
```

**Factory Functions:**

```javascript
// factories/userFactory.js
export const createMockUserProfile = (overrides = {}) => ({
  name: 'Test Player',
  avatar: '👸',
  gender: 'girl',
  createdAt: Date.now(),
  ...overrides
});

export const createMockInventoryItem = (overrides = {}) => ({
  id: 'item_1',
  name: 'Test Item',
  rarity: 'common',
  equipable: false,
  consumable: false,
  ...overrides
});
```

**Location:**
- Would place fixtures in `src/__tests__/fixtures/` directory
- Would place factories in `src/__tests__/factories/` directory
- Keep close to test files that use them

## Coverage

**Requirements:**
- No coverage requirements enforced
- No coverage threshold configured
- Coverage not tracked in CI/CD

**Recommended Target (best practice):**
- Utility functions: 80%+ coverage
- Custom hooks: 75%+ coverage
- Components: 60%+ coverage (visual components harder to test)
- Overall: 70%+ coverage

**View Coverage (if implemented):**
```bash
npm test -- --coverage          # Run tests with coverage report
npm test -- --coverage --watch  # Watch mode with coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions and components in isolation
- Approach: Mock dependencies, test input/output behavior
- Examples needed for:
  - `src/utils/srs.js` - SRS algorithm calculations
  - `src/utils/storage.js` - localStorage safe wrappers
  - `src/utils/grammarEngine.js` - Grammar sentence generation
  - `src/utils/mobile.js` - Device detection logic

**Integration Tests:**
- Scope: Multiple components/hooks working together
- Approach: Test actual data flow without mocking internal dependencies
- Examples needed for:
  - `useStoryProgress` hook with storage persistence
  - `useItemEffects` hook applying bonuses to gameplay
  - Component + hook combinations (e.g., Store component using inventory data)

**E2E Tests:**
- Framework: Not present - would use Cypress or Playwright
- Approach: Test complete user workflows through the app
- Scenarios needed for:
  - Complete game flow from start to level completion
  - Inventory management and item usage
  - Story progression and chapter unlocking
  - Daily stats tracking

## Common Patterns

**Async Testing:**

For hooks with async operations (voice recognition in `src/utils/voice.js`):
```javascript
it('handles async voice input', async () => {
  const { result } = renderHook(() => useVoiceRecognition());

  await act(async () => {
    result.current.startListening();
    // Simulate recognition result
    simulateVoiceResult('HELLO');
  });

  expect(result.current.transcript).toBe('HELLO');
});
```

**Error Testing:**

For error handling in storage utilities:
```javascript
it('returns default value on JSON parse error', () => {
  localStorageMock.getItem.mockReturnValue('invalid json {');

  const result = safeGetJSON('test_key', 'default');

  expect(result).toBe('default');
  expect(console.error).toHaveBeenCalled();
});
```

For error boundary testing:
```javascript
it('catches and displays error UI', () => {
  const { getByText } = render(
    <ErrorBoundary>
      <ComponentThatThrows />
    </ErrorBoundary>
  );

  expect(getByText('אופס! משהו השתבש')).toBeInTheDocument();
});
```

**State Testing:**

For component state updates (e.g., LetterPicker):
```javascript
it('updates input when letter is selected', () => {
  const { getByText } = render(
    <LetterPicker
      letters={['C', 'A', 'T']}
      onCheck={jest.fn()}
      isWord={true}
    />
  );

  fireEvent.click(getByText('C'));

  expect(screen.getByDisplayValue('C')).toBeInTheDocument();
});
```

**Persistent State Testing:**

For localStorage-backed state (user progress, scores):
```javascript
it('persists user progress to localStorage', () => {
  const userProgress = { score: 100, level: 'medium' };

  act(() => {
    safeSetJSON(STORAGE_KEYS.USER_PROGRESS, userProgress);
  });

  expect(localStorageMock.setItem).toHaveBeenCalledWith(
    STORAGE_KEYS.USER_PROGRESS,
    JSON.stringify(userProgress)
  );
});
```

---

*Testing analysis: 2026-02-14*
