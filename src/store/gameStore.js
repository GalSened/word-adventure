import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Legacy localStorage keys (from src/utils/storage.js STORAGE_KEYS + hooks) ---
const LEGACY_KEYS = {
  USER_PROFILE: 'userProfile',
  SCORE: 'score',
  STARS: 'stars',
  USER_PROGRESS: 'userProgress',
  HIGH_SCORES: 'highScores',
  INVENTORY: 'inventory',
  DAILY_STATS: 'dailyStats',
  AVATAR: 'avatar',
  STORY_PROGRESS: 'storyProgress',
  EQUIPPED: 'word_adventure_equipped',
  HAS_SEEN_STORY_INTRO: 'hasSeenStoryIntro',
};

// --- Migration from legacy localStorage ---

/**
 * Read a legacy localStorage key as JSON.
 * Returns defaultValue on missing key or parse failure.
 */
function legacyGetJSON(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Read a legacy localStorage key as a number.
 * Handles raw numeric strings (e.g. 'score' stored as '42' without JSON.stringify).
 */
function legacyGetNumber(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  } catch {
    return defaultValue;
  }
}

/**
 * Check for legacy localStorage keys and return a seed object if any exist.
 * Does NOT delete old keys -- old code still reads them until Plan 02-02 rewires hooks.
 * Returns null if no legacy data found or if the new 'word-adventure' key already exists.
 */
export function migrateFromLegacyStorage() {
  // If the new store key already exists, skip migration
  if (localStorage.getItem('word-adventure') !== null) {
    return null;
  }

  // Check if ANY legacy key exists
  const hasLegacy = Object.values(LEGACY_KEYS).some(
    (key) => localStorage.getItem(key) !== null
  );

  if (!hasLegacy) {
    return null;
  }

  // Read all legacy data with safe parsing
  const userProfile = legacyGetJSON(LEGACY_KEYS.USER_PROFILE, null);
  const score = legacyGetNumber(LEGACY_KEYS.SCORE, 0);
  const userProgress = legacyGetJSON(LEGACY_KEYS.USER_PROGRESS, {});
  const highScores = legacyGetJSON(LEGACY_KEYS.HIGH_SCORES, []);
  const inventory = legacyGetJSON(LEGACY_KEYS.INVENTORY, []);
  const dailyStats = legacyGetJSON(LEGACY_KEYS.DAILY_STATS, {
    date: new Date().toDateString(),
    wordsPlayed: 0,
    maxStreak: 0,
    dailyScore: 0,
  });
  const equipped = legacyGetJSON(LEGACY_KEYS.EQUIPPED, {});
  const hasSeenStoryIntro = legacyGetJSON(LEGACY_KEYS.HAS_SEEN_STORY_INTRO, false);

  // Avatar: check profile first, then standalone key
  const avatar =
    (userProfile && userProfile.avatar) ||
    localStorage.getItem(LEGACY_KEYS.AVATAR) ||
    '\u{1F478}'; // princess emoji default

  return {
    userProfile,
    score,
    userProgress,
    highScores,
    inventory,
    dailyStats,
    equipped,
    hasSeenStoryIntro,
    avatar,
  };
}

// --- Slice creators ---

/**
 * User data slice: profile, scores, progress, inventory
 */
export const createUserSlice = (set) => ({
  // State
  userProfile: null,
  score: 0,
  userProgress: {},
  avatar: '\u{1F478}', // 👸
  highScores: [],
  inventory: [],

  // Actions
  setUserProfile: (profile) =>
    set((state) => ({
      userProfile: profile,
      // First profile creation picks a gender-appropriate avatar; a profile
      // re-set must never clobber an avatar the player chose manually
      avatar:
        state.userProfile === null && profile?.gender
          ? (profile.gender === 'girl' ? '\u{1F478}' : '\u{1F934}') // 👸 / 🤴
          : state.avatar,
    })),

  addScore: (points) =>
    set((state) => ({ score: state.score + points })),

  subtractScore: (points) =>
    set((state) => ({ score: Math.max(0, state.score - points) })),

  updateWordProgress: (wordId, srsState) =>
    set((state) => ({
      userProgress: { ...state.userProgress, [wordId]: srsState },
    })),

  saveHighScore: (points, level) =>
    set((state) => {
      const newScore = {
        points,
        level,
        date: new Date().toLocaleDateString('he-IL'),
        avatar: state.avatar,
      };
      const updatedScores = [...state.highScores, newScore]
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);
      return { highScores: updatedScores };
    }),

  addToInventory: (itemId) =>
    set((state) => {
      if (state.inventory.includes(itemId)) return state;
      return { inventory: [...state.inventory, itemId] };
    }),

  updateAvatar: (newAvatar) => set({ avatar: newAvatar }),

  setInventory: (inventory) => set({ inventory }),

  // Completed levels (persisted array of level ids)
  completedLevels: [],

  addCompletedLevel: (levelId) =>
    set((state) => {
      if (state.completedLevels.includes(levelId)) return state;
      return { completedLevels: [...state.completedLevels, levelId] };
    }),

  // Pet care (persisted): the walk mode feeds, plays and record-keeps here.
  // satiety/happiness are 0-100 meters shown as bones/hearts in the HUD.
  petCare: { satiety: 70, happiness: 70, walksCompleted: 0 },

  feedPet: (satietyGain) =>
    set((state) => ({
      petCare: {
        ...state.petCare,
        satiety: Math.min(100, state.petCare.satiety + satietyGain),
        happiness: Math.min(100, state.petCare.happiness + 10),
      },
    })),

  boostPetHappiness: (delta) =>
    set((state) => ({
      petCare: {
        ...state.petCare,
        happiness: Math.max(0, Math.min(100, state.petCare.happiness + delta)),
      },
    })),

  // Walking is hungry work — called once when a walk starts
  decayPetCare: () =>
    set((state) => ({
      petCare: {
        ...state.petCare,
        satiety: Math.max(0, state.petCare.satiety - 15),
        happiness: Math.max(0, state.petCare.happiness - 5),
      },
    })),

  recordWalkCompleted: () =>
    set((state) => ({
      petCare: {
        ...state.petCare,
        walksCompleted: state.petCare.walksCompleted + 1,
      },
    })),

  // Purchased consumable charges, usable during play (persisted)
  hintsAvailable: 0,
  skipsAvailable: 0,

  addHints: (count) =>
    set((state) => ({ hintsAvailable: state.hintsAvailable + count })),

  consumeHint: () =>
    set((state) => ({ hintsAvailable: Math.max(0, state.hintsAvailable - 1) })),

  addSkips: (count) =>
    set((state) => ({ skipsAvailable: state.skipsAvailable + count })),

  consumeSkip: () =>
    set((state) => ({ skipsAvailable: Math.max(0, state.skipsAvailable - 1) })),
});

/**
 * Game session slice: ephemeral state that resets on page refresh
 */
export const createGameSlice = (set) => ({
  // State (all ephemeral -- not persisted)
  gameState: 'start',
  currentWordIndex: 0,
  userInput: '',
  lives: 3,
  feedback: null,
  activeWords: [],
  activePet: null,
  currentStreak: 0,
  currentLevel: null,
  // Points earned within the current level only (the persisted `score` is a
  // lifetime total AND the coin currency — useless for a leaderboard)
  levelScore: 0,
  // Where to resume when closing the store/inventory overlay; only 'playing'
  // is ever worth resuming, everything else falls back to the caller's default
  returnScreen: null,

  // Actions
  // Any explicit navigation abandons the resume point — only openStore /
  // openInventory (below) set one
  setGameState: (gameState) => set({ gameState, returnScreen: null }),

  addLevelScore: (points) =>
    set((state) => ({ levelScore: state.levelScore + points })),

  resetLevelScore: () => set({ levelScore: 0 }),

  openStore: () =>
    set((state) => ({
      gameState: 'store',
      returnScreen: state.gameState === 'playing'
        ? 'playing'
        // hopping store↔inventory must not lose the way back to the level
        : (state.gameState === 'store' || state.gameState === 'inventory')
          ? state.returnScreen
          : null,
    })),

  openInventory: () =>
    set((state) => ({
      gameState: 'inventory',
      returnScreen: state.gameState === 'playing'
        ? 'playing'
        : (state.gameState === 'store' || state.gameState === 'inventory')
          ? state.returnScreen
          : null,
    })),

  closeOverlay: (fallback) =>
    set((state) => ({
      gameState: state.returnScreen || fallback,
      returnScreen: null,
    })),
  setCurrentWordIndex: (currentWordIndex) => set({ currentWordIndex }),
  setUserInput: (userInputOrFn) =>
    set((state) => ({
      userInput: typeof userInputOrFn === 'function'
        ? userInputOrFn(state.userInput)
        : userInputOrFn,
    })),
  setLives: (lives) => set({ lives }),
  setFeedback: (feedback) => set({ feedback }),
  setActiveWords: (activeWords) => set({ activeWords }),
  setActivePet: (activePet) => set({ activePet }),
  setCurrentStreak: (currentStreak) => set({ currentStreak }),
  setCurrentLevel: (currentLevel) => set({ currentLevel }),

  resetGame: () =>
    set({
      gameState: 'start',
      currentWordIndex: 0,
      userInput: '',
      lives: 3,
      feedback: null,
      activeWords: [],
      activePet: null,
      currentStreak: 0,
      currentLevel: null,
      levelScore: 0,
      returnScreen: null,
    }),
});

/**
 * Daily stats slice: daily play statistics and streaks
 */
export const createDailySlice = (set) => ({
  // State
  dailyStats: {
    date: new Date().toDateString(),
    wordsPlayed: 0,
    maxStreak: 0,
    dailyScore: 0,
  },

  // Actions
  updateDailyStats: (updates) =>
    set((state) => ({
      dailyStats: { ...state.dailyStats, ...updates },
    })),

  resetDailyStats: () =>
    set({
      dailyStats: {
        date: new Date().toDateString(),
        wordsPlayed: 0,
        maxStreak: 0,
        dailyScore: 0,
      },
    }),
});

/**
 * Item effects slice: equipped items
 */
export const createItemSlice = (set) => ({
  // State
  equipped: {},

  // Actions
  setEquipped: (equipped) => set({ equipped }),
});

// --- Debounced storage adapter (ARCH-08) ---

/**
 * Creates a storage adapter that debounces writes to localStorage by 300ms.
 * Reads are synchronous. This prevents performance issues from
 * serializing state to JSON on every keystroke.
 *
 * The pending write MUST be flushable: without it, closing the tab within
 * 300ms of the last state change silently drops that write (SRS progress,
 * score, completed levels). flushPendingWrites() runs on pagehide and on
 * visibilitychange→hidden, the only reliable exit signals on mobile.
 */
function createDebouncedStorage() {
  let timeout;
  let pending = null; // { name, value } awaiting the debounce timer

  const flush = () => {
    clearTimeout(timeout);
    if (pending) {
      localStorage.setItem(pending.name, JSON.stringify(pending.value));
      pending = null;
    }
  };

  return {
    getItem: (name) => {
      const str = localStorage.getItem(name);
      return str ? JSON.parse(str) : null;
    },
    setItem: (name, value) => {
      clearTimeout(timeout);
      pending = { name, value };
      timeout = setTimeout(flush, 300);
    },
    removeItem: (name) => {
      localStorage.removeItem(name);
    },
    flush,
  };
}

const debouncedStorage = createDebouncedStorage();

/** Immediately persist any pending debounced write. */
export function flushPendingWrites() {
  debouncedStorage.flush();
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushPendingWrites);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPendingWrites();
  });
}

// --- Store composition ---

export const useGameStore = create(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createGameSlice(...a),
      ...createDailySlice(...a),
      ...createItemSlice(...a),

      // Story intro flag (story hook manages its own complex state;
      // we just provide a persistence slot for the intro flag and path)
      hasSeenStoryIntro: false,
      storyPath: null,
      setHasSeenStoryIntro: (value) => a[0]({ hasSeenStoryIntro: value }),
      setStoryPath: (path) => a[0]({ storyPath: path }),

      // Onboarding: guided first lesson replaces StoryIntro overlay (Phase 6)
      hasCompletedOnboarding: false,
      onboardingStep: 0, // 0=not started, 1=first word seen, 2=first correct, 3=completed
      setHasCompletedOnboarding: (value) => a[0]({ hasCompletedOnboarding: value }),
      setOnboardingStep: (step) => a[0]({ onboardingStep: step }),
    }),
    {
      name: 'word-adventure',

      // Only persist data that survives page refresh
      partialize: (state) => ({
        userProfile: state.userProfile,
        score: state.score,
        userProgress: state.userProgress,
        avatar: state.avatar,
        highScores: state.highScores,
        inventory: state.inventory,
        dailyStats: state.dailyStats,
        equipped: state.equipped,
        completedLevels: state.completedLevels,
        hintsAvailable: state.hintsAvailable,
        skipsAvailable: state.skipsAvailable,
        petCare: state.petCare,
        hasSeenStoryIntro: state.hasSeenStoryIntro,
        storyPath: state.storyPath,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        onboardingStep: state.onboardingStep,
        // Do NOT persist: gameState, currentWordIndex, lives, feedback,
        // activeWords, activePet, currentStreak, currentLevel,
        // userInput (all ephemeral)
      }),

      onRehydrateStorage: () => {
        return (state) => {
          // After rehydration, run migration if needed
          if (state) {
            const migrated = migrateFromLegacyStorage();
            if (migrated) {
              // Merge migrated data — only set non-null/non-undefined values
              const updates = {};
              for (const [key, value] of Object.entries(migrated)) {
                if (value !== null && value !== undefined) {
                  updates[key] = value;
                }
              }
              if (Object.keys(updates).length > 0) {
                useGameStore.setState(updates);
              }
            }

            // Backward compat: existing users with hasSeenStoryIntro=true skip onboarding
            if (state.hasSeenStoryIntro && !state.hasCompletedOnboarding) {
              useGameStore.setState({ hasCompletedOnboarding: true, onboardingStep: 3 });
            }
          }
        };
      },

      storage: debouncedStorage,
    }
  )
);
