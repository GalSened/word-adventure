# Word Adventure - Comprehensive Improvement Plan

## Executive Summary

This plan addresses all issues identified in the code review, organized into 6 phases. Each phase builds on the previous one, ensuring a stable codebase throughout the refactoring process.

**Total Scope:** 35 tasks across 6 phases
**Priority Focus:** Architecture → Bug Fixes → Accessibility → Testing → Polish

---

## Phase 1: Critical Bug Fixes & Error Handling (High Priority)

### 1.1 Fix Streak Calculation System
**File:** `src/WordAdventure.jsx`
**Problem:** `maxStreak` is tracked but never calculated as consecutive correct answers
**Solution:**
- Add `currentStreak` state variable
- Increment streak on correct answer, reset on incorrect
- Update `updateDailyStats` to properly track max streak
- Pass streak to `DailyQuests` component

```javascript
// Add state
const [currentStreak, setCurrentStreak] = useState(0);

// In processAnswer (correct):
setCurrentStreak(prev => prev + 1);
updateDailyStats(1, earnedScore, currentStreak + 1);

// In processAnswer (incorrect):
setCurrentStreak(0);
```

### 1.2 Add LocalStorage Error Handling
**Files:** `src/WordAdventure.jsx`
**Problem:** `JSON.parse(localStorage.getItem(...))` can crash with corrupted data
**Solution:** Create safe storage utility

```javascript
// src/utils/storage.js
export const safeGetJSON = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Storage parse error for ${key}:`, e);
    return defaultValue;
  }
};

export const safeSetJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Storage write error for ${key}:`, e);
  }
};
```

### 1.3 Fix PetWalkingGame Memory Leak
**File:** `src/components/PetWalkingGame.jsx:99-128`
**Problem:** `requestAnimationFrame` loop continues after unmount
**Solution:**

```javascript
useEffect(() => {
  let frameId;
  let isActive = true; // Add flag

  const animate = () => {
    if (!isActive) return; // Check flag
    if (gameState === 'walking') {
      // ... existing animation code
    }
    frameId = requestAnimationFrame(animate);
  };

  frameId = requestAnimationFrame(animate);

  return () => {
    isActive = false; // Set flag on cleanup
    cancelAnimationFrame(frameId);
  };
}, [gameState, score, onComplete]);
```

### 1.4 Fix Voice Recognition Error Handling
**File:** `src/utils/voice.js`
**Problem:** Silent failures, no error callback
**Solution:**

```javascript
// Add error state and handler
const [error, setError] = useState(null);

recognizer.onerror = (event) => {
  setError(event.error);
  setIsListening(false);
};

// Return error in hook
return { isListening, transcript, startListening, stopListening, isSupported, setTranscript, error };
```

---

## Phase 2: Architecture Refactoring

### 2.1 Create Custom Hooks for State Management

**File:** `src/hooks/useGameState.js` (new)
```javascript
// Extract game state logic from WordAdventure
export function useGameState() {
  const [gameState, setGameState] = useState('start');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState(null);
  const [activeWords, setActiveWords] = useState([]);
  const [gameMode, setGameMode] = useState('regular');

  const resetGame = useCallback(() => {
    setCurrentWordIndex(0);
    setLives(3);
    setUserInput('');
    setFeedback(null);
  }, []);

  return {
    gameState, setGameState,
    currentWordIndex, setCurrentWordIndex,
    userInput, setUserInput,
    lives, setLives,
    feedback, setFeedback,
    activeWords, setActiveWords,
    gameMode, setGameMode,
    resetGame
  };
}
```

**File:** `src/hooks/useUserProgress.js` (new)
```javascript
// Extract user progress/persistence logic
export function useUserProgress() {
  const [userProfile, setUserProfile] = useState(() =>
    safeGetJSON('userProfile', null)
  );
  const [score, setScore] = useState(() =>
    parseInt(localStorage.getItem('score')) || 0
  );
  const [stars, setStars] = useState(() =>
    parseInt(localStorage.getItem('stars')) || 0
  );
  const [userProgress, setUserProgress] = useState(() =>
    safeGetJSON('userProgress', {})
  );
  const [inventory, setInventory] = useState(() =>
    safeGetJSON('inventory', [])
  );

  // Persistence effects...

  return { userProfile, setUserProfile, score, setScore, /* etc */ };
}
```

**File:** `src/hooks/useDailyStats.js` (new)
```javascript
// Extract daily stats with proper streak tracking
export function useDailyStats() {
  const [dailyStats, setDailyStats] = useState(() =>
    safeGetJSON('dailyStats', getInitialDailyStats())
  );
  const [currentStreak, setCurrentStreak] = useState(0);

  const updateStats = useCallback((newWords, newScore, streakAction) => {
    // ... proper streak calculation
  }, []);

  return { dailyStats, currentStreak, updateStats, resetStreak };
}
```

### 2.2 Extract Game Screen Components

**File:** `src/screens/StartScreen.jsx` (new)
```javascript
// Extract start screen from WordAdventure lines 259-290
export default function StartScreen({
  userProfile,
  dailyStats,
  onStartLevel,
  onNavigate
}) {
  // ... extracted JSX and logic
}
```

**File:** `src/screens/MapScreen.jsx` (new)
```javascript
// Extract map screen from WordAdventure lines 319-332
export default function MapScreen({ onSelectLevel }) {
  // ... extracted JSX and logic
}
```

**File:** `src/screens/PlayingScreen.jsx` (new)
```javascript
// Extract playing screen from WordAdventure lines 334-388
export default function PlayingScreen({
  currentWord,
  lives,
  userInput,
  onInputChange,
  onCheck,
  onVoiceToggle,
  feedback,
  isListening,
  isVoiceSupported
}) {
  // ... extracted JSX and logic
}
```

**File:** `src/screens/ResultScreen.jsx` (new)
```javascript
// Extract level complete/game over screens from WordAdventure lines 390-399
export default function ResultScreen({
  isSuccess,
  onHome,
  onPlayAgain
}) {
  // ... extracted JSX and logic
}
```

### 2.3 Create Configuration Constants

**File:** `src/config/constants.js` (new)
```javascript
// Extract magic numbers and configuration
export const GAME_CONFIG = {
  INITIAL_LIVES: 3,
  SCORE_PER_CORRECT: 150,
  STARS_PER_CORRECT: 2,

  // Delays (milliseconds)
  FEEDBACK_DURATION: 1500,
  ERROR_FEEDBACK_DURATION: 1000,
  TRANSITION_DELAY: 2500,

  // Daily quest targets
  DAILY_WORDS_TARGET: 10,
  DAILY_SCORE_TARGET: 1000,
  DAILY_STREAK_TARGET: 5,
};

export const STORAGE_KEYS = {
  USER_PROFILE: 'userProfile',
  SCORE: 'score',
  STARS: 'stars',
  USER_PROGRESS: 'userProgress',
  HIGH_SCORES: 'highScores',
  INVENTORY: 'inventory',
  DAILY_STATS: 'dailyStats',
};

export const STORY_CHAPTERS = {
  easy: { title: 'הממלכה הקסומה', color: 'from-green-400 to-emerald-600', character: '👸' },
  medium: { title: 'היער הקסום', color: 'from-blue-400 to-indigo-600', character: '🧚' },
  hard: { title: 'מגדל הקוסם', color: 'from-purple-500 to-fuchsia-600', character: '🧙' },
  expert: { title: 'היקום האינסופי', color: 'from-rose-500 to-pink-600', character: '👽' },
  master: { title: 'היכל החכמים', color: 'from-amber-500 to-red-600', character: '🏛️' },
  review: { title: 'חזרות חכמות', color: 'from-yellow-400 to-orange-500', character: '🧠' }
};
```

### 2.4 Create Word Data Module

**File:** `src/data/words.js` (new)
```javascript
// Extract word data from WordAdventure
export const initialWordData = [
  { id: 'cat', word: 'CAT', hint: '🐱 חיה שאוהבת חלב', hebrew: 'חתול', level: 'easy', type: 'word' },
  // ... rest of words
];

export const getWordsByLevel = (level) =>
  initialWordData.filter(w => w.level === level);

export const getAllWords = () => initialWordData;
```

### 2.5 Refactor WordAdventure.jsx

After extracting hooks and components, `WordAdventure.jsx` should be ~150-200 lines:

```javascript
// src/WordAdventure.jsx (refactored)
import { useGameState } from './hooks/useGameState';
import { useUserProgress } from './hooks/useUserProgress';
import { useDailyStats } from './hooks/useDailyStats';
import StartScreen from './screens/StartScreen';
import MapScreen from './screens/MapScreen';
import PlayingScreen from './screens/PlayingScreen';
import ResultScreen from './screens/ResultScreen';
// ... other imports

export default function WordAdventure() {
  const gameState = useGameState();
  const userProgress = useUserProgress();
  const dailyStats = useDailyStats();

  // Screen routing logic only
  const renderScreen = () => {
    switch (gameState.gameState) {
      case 'start': return <StartScreen {...props} />;
      case 'map': return <MapScreen {...props} />;
      case 'playing': return <PlayingScreen {...props} />;
      // ... etc
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative" dir="rtl">
      {/* Background animations */}
      {/* Top bar */}
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
}
```

---

## Phase 3: Accessibility Improvements

### 3.1 Add ARIA Labels and Roles

**Updates across all components:**

```javascript
// Button example
<button
  onClick={handleCheck}
  aria-label="בדוק תשובה"
  className="..."
>
  בדיקה
</button>

// Input example
<input
  type="text"
  value={userInput}
  aria-label={`תרגום ל: ${currentWord.hebrew}`}
  aria-describedby="word-hint"
  // ...
/>
<span id="word-hint" className="sr-only">{currentWord.hint}</span>

// Progress bar example
<div
  role="progressbar"
  aria-valuenow={percentage}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label={quest.text}
>
  // ...
</div>
```

### 3.2 Add Keyboard Navigation

**File:** `src/hooks/useKeyboardNav.js` (new)
```javascript
export function useKeyboardNav(options, onSelect) {
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          setFocusIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          setFocusIndex(prev => Math.min(options.length - 1, prev + 1));
          break;
        case 'Enter':
        case ' ':
          onSelect(options[focusIndex]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusIndex, options, onSelect]);

  return focusIndex;
}
```

### 3.3 Add Focus Management

```javascript
// When game state changes, manage focus
useEffect(() => {
  if (gameState === 'playing') {
    inputRef.current?.focus();
  }
}, [gameState]);

// Trap focus in modals
import { FocusTrap } from './components/FocusTrap';

<FocusTrap active={gameState === 'found'}>
  <QuestionModal ... />
</FocusTrap>
```

### 3.4 Add Screen Reader Announcements

**File:** `src/components/SROnly.jsx` (new)
```javascript
// Screen reader only component for announcements
export function SROnly({ children }) {
  return (
    <span className="sr-only">{children}</span>
  );
}

// Live region for announcements
export function LiveRegion({ message }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
```

### 3.5 Add CSS for Screen Reader Only

**File:** `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Screen reader only utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Phase 4: Testing Infrastructure

### 4.1 Setup Testing Environment

**Update `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^25.0.0"
  }
}
```

**File:** `vitest.config.js` (new)
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
```

**File:** `src/test/setup.js` (new)
```javascript
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock Speech Recognition
global.webkitSpeechRecognition = vi.fn();
```

### 4.2 Unit Tests for SRS Algorithm

**File:** `src/utils/__tests__/srs.test.js` (new)
```javascript
import { describe, it, expect } from 'vitest';
import { calculateNextReview, getDueWords } from '../srs';

describe('SRS Algorithm', () => {
  describe('calculateNextReview', () => {
    it('should initialize new words with default values', () => {
      const result = calculateNextReview(null, 5);
      expect(result.interval).toBe(1);
      expect(result.repetition).toBe(1);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('should reset on quality < 3', () => {
      const prev = { interval: 6, repetition: 2, easeFactor: 2.5 };
      const result = calculateNextReview(prev, 2);
      expect(result.repetition).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('should increase interval on good reviews', () => {
      const prev = { interval: 6, repetition: 2, easeFactor: 2.5 };
      const result = calculateNextReview(prev, 5);
      expect(result.interval).toBeGreaterThan(6);
      expect(result.repetition).toBe(3);
    });

    it('should never let ease factor go below 1.3', () => {
      const prev = { interval: 1, repetition: 1, easeFactor: 1.3 };
      const result = calculateNextReview(prev, 0);
      expect(result.easeFactor).toBe(1.3);
    });
  });

  describe('getDueWords', () => {
    it('should return new words as due', () => {
      const words = [{ id: '1', word: 'TEST' }];
      expect(getDueWords(words)).toHaveLength(1);
    });

    it('should return past-due words', () => {
      const words = [{
        id: '1',
        word: 'TEST',
        srs: { nextReviewDate: Date.now() - 1000 }
      }];
      expect(getDueWords(words)).toHaveLength(1);
    });

    it('should not return future words', () => {
      const words = [{
        id: '1',
        word: 'TEST',
        srs: { nextReviewDate: Date.now() + 100000 }
      }];
      expect(getDueWords(words)).toHaveLength(0);
    });
  });
});
```

### 4.3 Unit Tests for Grammar Engine

**File:** `src/utils/__tests__/grammarEngine.test.js` (new)
```javascript
import { describe, it, expect } from 'vitest';
import { generateChallenge } from '../grammarEngine';

describe('Grammar Engine', () => {
  it('should generate valid challenge structure', () => {
    const challenge = generateChallenge();

    expect(challenge).toHaveProperty('id');
    expect(challenge).toHaveProperty('word');
    expect(challenge).toHaveProperty('hebrew');
    expect(challenge).toHaveProperty('hint');
    expect(challenge.level).toBe('master');
    expect(challenge.type).toBe('sentence');
  });

  it('should generate unique IDs', () => {
    const challenge1 = generateChallenge();
    const challenge2 = generateChallenge();

    expect(challenge1.id).not.toBe(challenge2.id);
  });

  it('should generate English sentences starting with THE', () => {
    const challenge = generateChallenge();
    expect(challenge.word).toMatch(/^THE /);
  });

  it('should generate Hebrew translations starting with ה', () => {
    const challenge = generateChallenge();
    expect(challenge.hebrew).toMatch(/^ה/);
  });
});
```

### 4.4 Component Tests

**File:** `src/components/__tests__/DailyQuests.test.jsx` (new)
```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DailyQuests from '../DailyQuests';

describe('DailyQuests', () => {
  const defaultProgress = {
    wordsPlayed: 5,
    dailyScore: 500,
    maxStreak: 3
  };

  it('should render all three quests', () => {
    render(<DailyQuests progress={defaultProgress} />);

    expect(screen.getByText(/10 מילים/)).toBeInTheDocument();
    expect(screen.getByText(/1000 נקודות/)).toBeInTheDocument();
    expect(screen.getByText(/רצף של 5/)).toBeInTheDocument();
  });

  it('should show progress counts', () => {
    render(<DailyQuests progress={defaultProgress} />);

    expect(screen.getByText('5/10')).toBeInTheDocument();
    expect(screen.getByText('500/1000')).toBeInTheDocument();
    expect(screen.getByText('3/5')).toBeInTheDocument();
  });

  it('should mark completed quests', () => {
    const completedProgress = {
      wordsPlayed: 10,
      dailyScore: 500,
      maxStreak: 3
    };

    render(<DailyQuests progress={completedProgress} />);

    // Check for completion indicator (green checkmark)
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });
});
```

### 4.5 Integration Tests

**File:** `src/__tests__/WordAdventure.integration.test.jsx` (new)
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WordAdventure from '../WordAdventure';

describe('WordAdventure Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('userProfile', JSON.stringify({
      name: 'Test',
      gender: 'boy',
      avatar: '👸'
    }));
  });

  it('should render start screen for returning user', () => {
    render(<WordAdventure />);
    expect(screen.getByText(/Word Adventure/)).toBeInTheDocument();
  });

  it('should navigate to map when clicking מפת עולמות', async () => {
    render(<WordAdventure />);

    await userEvent.click(screen.getByText('מפת עולמות'));

    expect(screen.getByText('בחר עולם')).toBeInTheDocument();
  });

  it('should start easy level when selected', async () => {
    render(<WordAdventure />);

    await userEvent.click(screen.getByText('מפת עולמות'));
    await userEvent.click(screen.getByText('הממלכה הקסומה'));

    expect(screen.getByText('תרגם')).toBeInTheDocument();
  });
});
```

---

## Phase 5: Code Quality & Tooling

### 5.1 Fix ESLint Configuration

**File:** `eslint.config.js` (updated)
```javascript
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
```

### 5.2 Add Prettier Configuration

**File:** `.prettierrc` (new)
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Update `package.json`:**
```json
{
  "scripts": {
    "format": "prettier --write src/"
  },
  "devDependencies": {
    "prettier": "^3.3.0"
  }
}
```

### 5.3 Clean Up Unused Code

**File:** `src/App.css` - DELETE (unused styles)

**Update `src/main.jsx`:**
```javascript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Remove App.css import
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### 5.4 Update CI/CD Pipeline

**File:** `.github/workflows/deploy.yml` (updated)
```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Phase 6: Polish & Enhancements (Nice-to-Have)

### 6.1 Fix Gender Source of Truth

**File:** `src/components/PetWalkingGame.jsx`
```javascript
// Before (fragile)
const isGirl = (userProfile?.gender === 'girl') || (avatar === '👸') || (userProfile?.avatar === '👸');

// After (single source of truth)
export default function PetWalkingGame({ pet, userProfile, onExit, onComplete }) {
  const isGirl = userProfile?.gender === 'girl';
  const playerSprite = isGirl ? girlWalkSprite : boyWalkSprite;
  // ...
}
```

### 6.2 Expand Grammar Engine Usage

**File:** `src/WordAdventure.jsx`
```javascript
// Add procedural variations to medium/hard levels
const startLevel = (level) => {
  if (level === 'master' || level === 'hard') {
    const staticWords = initialWordData.filter(w => w.level === level);
    const proceduralWords = Array(3).fill(null).map(() => generateChallenge());
    wordsToPlay = shuffleArray([...staticWords, ...proceduralWords]);
  }
  // ...
};
```

### 6.3 Add Progress Export Feature

**File:** `src/components/SettingsMenu.jsx` (new)
```javascript
export default function SettingsMenu({ onClose }) {
  const exportProgress = () => {
    const data = {
      userProfile: JSON.parse(localStorage.getItem('userProfile')),
      userProgress: JSON.parse(localStorage.getItem('userProgress')),
      score: localStorage.getItem('score'),
      stars: localStorage.getItem('stars'),
      inventory: JSON.parse(localStorage.getItem('inventory')),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `word-adventure-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-4">הגדרות</h2>
      <button onClick={exportProgress} className="...">
        📤 ייצא התקדמות
      </button>
    </div>
  );
}
```

### 6.4 Lazy Load Game Modes

**File:** `src/WordAdventure.jsx`
```javascript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const PetWalkingGame = lazy(() => import('./components/PetWalkingGame'));
const MemoryGame = lazy(() => import('./components/MemoryGame'));

// In render:
{gameState === 'petWalking' && (
  <Suspense fallback={<LoadingSpinner />}>
    <PetWalkingGame {...props} />
  </Suspense>
)}
```

### 6.5 Optimize Sprite Assets

Run image optimization:
```bash
# Install imagemin-cli
npm install -g imagemin-cli imagemin-pngquant

# Optimize sprites
imagemin src/assets/sprites/*.png --out-dir=src/assets/sprites --plugin=pngquant
```

---

## File Structure After Refactoring

```
src/
├── App.jsx
├── WordAdventure.jsx (refactored: ~150 lines)
├── main.jsx
├── index.css
│
├── components/
│   ├── AvatarSelect.jsx
│   ├── DailyQuests.jsx
│   ├── FocusTrap.jsx (new)
│   ├── Inventory.jsx
│   ├── Leaderboard.jsx
│   ├── LiveRegion.jsx (new)
│   ├── MemoryGame.jsx
│   ├── PetWalkingGame.jsx (fixed)
│   ├── SettingsMenu.jsx (new)
│   ├── SpriteAnimator.jsx
│   ├── SROnly.jsx (new)
│   ├── Store.jsx
│   └── WelcomeScreen.jsx
│   └── __tests__/
│       └── DailyQuests.test.jsx
│
├── screens/ (new)
│   ├── StartScreen.jsx
│   ├── MapScreen.jsx
│   ├── PlayingScreen.jsx
│   └── ResultScreen.jsx
│
├── hooks/ (new)
│   ├── useDailyStats.js
│   ├── useGameState.js
│   ├── useKeyboardNav.js
│   └── useUserProgress.js
│
├── utils/
│   ├── grammarEngine.js
│   ├── srs.js
│   ├── storage.js (new)
│   ├── voice.js (fixed)
│   └── __tests__/
│       ├── grammarEngine.test.js
│       └── srs.test.js
│
├── data/ (new)
│   └── words.js
│
├── config/ (new)
│   └── constants.js
│
└── test/ (new)
    └── setup.js
```

---

## Implementation Order

| Order | Phase | Task | Priority | Effort |
|-------|-------|------|----------|--------|
| 1 | 1.2 | Add LocalStorage error handling | Critical | 1hr |
| 2 | 1.1 | Fix streak calculation | Critical | 1hr |
| 3 | 1.3 | Fix PetWalkingGame memory leak | Critical | 30min |
| 4 | 1.4 | Fix voice recognition error handling | High | 30min |
| 5 | 2.3 | Create configuration constants | High | 1hr |
| 6 | 2.4 | Create word data module | High | 30min |
| 7 | 2.1 | Create custom hooks | High | 2hr |
| 8 | 2.2 | Extract game screen components | High | 3hr |
| 9 | 2.5 | Refactor WordAdventure.jsx | High | 1hr |
| 10 | 3.5 | Add SR-only CSS | Medium | 15min |
| 11 | 3.1 | Add ARIA labels | Medium | 2hr |
| 12 | 3.4 | Add screen reader announcements | Medium | 1hr |
| 13 | 3.2 | Add keyboard navigation | Medium | 2hr |
| 14 | 3.3 | Add focus management | Medium | 1hr |
| 15 | 4.1 | Setup testing environment | Medium | 1hr |
| 16 | 4.2 | Unit tests for SRS | Medium | 1hr |
| 17 | 4.3 | Unit tests for grammar engine | Medium | 1hr |
| 18 | 4.4 | Component tests | Medium | 2hr |
| 19 | 4.5 | Integration tests | Medium | 2hr |
| 20 | 5.1 | Fix ESLint configuration | Low | 30min |
| 21 | 5.2 | Add Prettier | Low | 15min |
| 22 | 5.3 | Clean up unused code | Low | 30min |
| 23 | 5.4 | Update CI/CD pipeline | Low | 30min |
| 24 | 6.1 | Fix gender source of truth | Low | 30min |
| 25 | 6.2 | Expand grammar engine usage | Low | 1hr |
| 26 | 6.3 | Add progress export | Low | 1hr |
| 27 | 6.4 | Lazy load game modes | Low | 1hr |
| 28 | 6.5 | Optimize sprite assets | Low | 30min |

---

## Success Criteria

- [ ] All critical bugs fixed (streak, localStorage, memory leak)
- [ ] WordAdventure.jsx reduced from 420 to ~150 lines
- [ ] Test coverage > 70% for utility functions
- [ ] All interactive elements have ARIA labels
- [ ] ESLint passes without errors
- [ ] CI/CD pipeline includes tests
- [ ] No console errors in production build

---

## Notes

- Each phase can be completed independently and deployed
- Phase 1 should be completed first as it fixes production bugs
- Phase 4 (Testing) can be done in parallel with other phases
- TypeScript migration is intentionally excluded to limit scope
