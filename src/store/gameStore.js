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
  const stars = legacyGetNumber(LEGACY_KEYS.STARS, 0);
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
    stars,
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
export const createUserSlice = (set, get) => ({
  // State
  userProfile: null,
  score: 0,
  stars: 0,
  userProgress: {},
  avatar: '\u{1F478}', // 👸
  highScores: [],
  inventory: [],

  // Actions
  setUserProfile: (profile) => set({ userProfile: profile }),

  addScore: (points) =>
    set((state) => ({ score: state.score + points })),

  subtractScore: (points) =>
    set((state) => ({ score: Math.max(0, state.score - points) })),

  addStars: (count) =>
    set((state) => ({ stars: state.stars + count })),

  updateWordProgress: (wordId, srsState) =>
    set((state) => ({
      userProgress: { ...state.userProgress, [wordId]: srsState },
    })),

  saveHighScore: (points) =>
    set((state) => {
      const newScore = {
        points,
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
  gameMode: 'regular',
  activePet: null,
  currentStreak: 0,
  currentLevel: null,
  showStoryIntro: false,

  // Actions
  setGameState: (gameState) => set({ gameState }),
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
  setGameMode: (gameMode) => set({ gameMode }),
  setActivePet: (activePet) => set({ activePet }),
  setCurrentStreak: (currentStreak) => set({ currentStreak }),
  setCurrentLevel: (currentLevel) => set({ currentLevel }),
  setShowStoryIntro: (showStoryIntro) => set({ showStoryIntro }),

  resetGame: () =>
    set({
      gameState: 'start',
      currentWordIndex: 0,
      userInput: '',
      lives: 3,
      feedback: null,
      activeWords: [],
      gameMode: 'regular',
      activePet: null,
      currentStreak: 0,
      currentLevel: null,
      showStoryIntro: false,
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
 */
function createDebouncedStorage() {
  let timeout;

  return {
    getItem: (name) => {
      const str = localStorage.getItem(name);
      return str ? JSON.parse(str) : null;
    },
    setItem: (name, value) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem(name, JSON.stringify(value));
      }, 300);
    },
    removeItem: (name) => {
      localStorage.removeItem(name);
    },
  };
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
    }),
    {
      name: 'word-adventure',

      // Only persist data that survives page refresh
      partialize: (state) => ({
        userProfile: state.userProfile,
        score: state.score,
        stars: state.stars,
        userProgress: state.userProgress,
        avatar: state.avatar,
        highScores: state.highScores,
        inventory: state.inventory,
        dailyStats: state.dailyStats,
        equipped: state.equipped,
        completedLevels: state.completedLevels,
        hasSeenStoryIntro: state.hasSeenStoryIntro,
        storyPath: state.storyPath,
        // Do NOT persist: gameState, currentWordIndex, lives, feedback,
        // activeWords, gameMode, activePet, currentStreak, currentLevel,
        // userInput, showStoryIntro (all ephemeral)
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
          }
        };
      },

      storage: createDebouncedStorage(),
    }
  )
);
