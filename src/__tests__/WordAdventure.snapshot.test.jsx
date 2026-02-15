import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// --- GLOBAL MOCKS (before imports) ---

vi.mock('framer-motion', () => {
  const React = require('react')
  const motion = new Proxy({}, {
    get: (_, tag) => {
      return React.forwardRef(({ children, ...props }, ref) => {
        const {
          animate, initial, exit, variants, transition,
          whileHover, whileTap, whileFocus, whileInView,
          layout, layoutId, onAnimationComplete, drag, dragConstraints,
          ...htmlProps
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

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

vi.mock('../utils/voice', () => ({
  useVoiceRecognition: () => ({
    isListening: false,
    transcript: '',
    startListening: vi.fn(),
    stopListening: vi.fn(),
    isSupported: false,
    setTranscript: vi.fn(),
  })
}))

vi.mock('../utils/mobile', () => ({
  hapticFeedback: vi.fn()
}))

// Mock challenge selector to always return 'spelling' for deterministic snapshot tests
vi.mock('../utils/challengeSelector', () => ({
  selectChallengeType: () => 'spelling',
  CHALLENGE_POOLS: {
    new: ['multipleChoice', 'reverseChoice'],
    learning: ['multipleChoice', 'reverseChoice', 'listening'],
    familiar: ['reverseChoice', 'listening', 'spelling'],
    mastered: ['spelling', 'sentenceBuild', 'listening'],
  },
}))

vi.mock('../data/storeItems', () => ({
  STORE_ITEMS: {},
  getItemsByCategory: () => [],
  getItemById: () => null,
  getWalkablePets: () => [],
  getEquipableItems: () => [],
  getConsumables: () => [],
  FEATURED_ITEMS: [],
  getDailyDeals: () => [],
  RARITIES: {},
  CATEGORIES: {},
}))

// --- IMPORTS ---
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import WordAdventure from '../WordAdventure'
import { useGameStore } from '../store/gameStore'

// --- TEST HELPERS ---

const PROFILE = { name: 'Test', gender: 'boy', avatar: '\u{1F9D9}' }

/**
 * Reset Zustand in-memory state to defaults so tests don't leak state.
 */
function resetZustandStore() {
  useGameStore.setState({
    userProfile: null, score: 0, stars: 0, userProgress: {}, avatar: '\u{1F478}',
    highScores: [], inventory: [], gameState: 'start', currentWordIndex: 0,
    userInput: '', lives: 3, feedback: null, activeWords: [], gameMode: 'regular',
    activePet: null, currentStreak: 0, currentLevel: null, showStoryIntro: false,
    dailyStats: { date: new Date().toDateString(), wordsPlayed: 0, maxStreak: 0, dailyScore: 0 },
    equipped: {}, hasSeenStoryIntro: false, storyPath: null,
  })
}

/**
 * Set up Zustand store + localStorage so that WordAdventure renders with a logged-in user
 * and all overlays (StoryIntro, StoryPathChoice, chapter intros) are suppressed.
 */
function setupLoggedInState() {
  // Seed Zustand persisted store
  localStorage.setItem('word-adventure', JSON.stringify({
    state: {
      userProfile: PROFILE,
      score: 0,
      stars: 0,
      userProgress: {},
      avatar: PROFILE.avatar,
      highScores: [],
      inventory: [],
      dailyStats: { date: new Date().toDateString(), wordsPlayed: 0, maxStreak: 0, dailyScore: 0 },
      equipped: {},
      hasSeenStoryIntro: true,
      storyPath: 'hero',
    },
    version: 0,
  }))

  // Also set Zustand in-memory state directly
  useGameStore.setState({
    userProfile: PROFILE,
    score: 0,
    stars: 0,
    userProgress: {},
    avatar: PROFILE.avatar,
    highScores: [],
    inventory: [],
    dailyStats: { date: new Date().toDateString(), wordsPlayed: 0, maxStreak: 0, dailyScore: 0 },
    equipped: {},
    hasSeenStoryIntro: true,
    storyPath: 'hero',
  })

  // Keep legacy keys for story hook which still reads them
  localStorage.setItem('userProfile', JSON.stringify(PROFILE))
  localStorage.setItem('hasSeenStoryIntro', JSON.stringify(true))
  // Suppress StoryPathChoice overlay and chapter intro dialogues by providing
  // a fully configured storyProgress with seenIntros for all chapters
  localStorage.setItem('storyProgress', JSON.stringify({
    currentChapter: null,
    completedChapters: [],
    totalWordsLearned: 0,
    storyPath: 'hero',
    choicesMade: [{ type: 'story_path', choice: 'hero', timestamp: 1717243200000 }],
    activePetId: null,
    petEvolutionLevel: {},
    discoveredSecrets: [],
    unlockedLore: [],
    collectibles: [],
    achievements: [],
    seenIntros: ['easy', 'medium', 'hard', 'expert', 'master'],
    seenEvolutions: [],
    answeredUnder3Seconds: false,
    wonWith1Life: false,
    playedBefore7am: false,
    playedAfter10pm: false,
    perfectLevelIds: [],
  }))
}

/**
 * Navigate from start to playing state for the easy level.
 * Returns all letter buttons found in the LetterPicker grid.
 */
function navigateToPlayingState(container) {
  // Navigate to map (wrap in act to flush Zustand state update)
  act(() => {
    fireEvent.click(screen.getByText('\u{05DE}\u{05E4}\u{05EA} \u{05E2}\u{05D5}\u{05DC}\u{05DE}\u{05D5}\u{05EA}'))
  })

  // Click the easy level button
  act(() => {
    fireEvent.click(screen.getByText('\u{05D4}\u{05DE}\u{05DE}\u{05DC}\u{05DB}\u{05D4} \u{05D4}\u{05E7}\u{05E1}\u{05D5}\u{05DE}\u{05D4}'))
  })

  // Settle state
  act(() => {
    vi.advanceTimersByTime(100)
  })
}

/**
 * Click letters in the LetterPicker to spell a word.
 * Handles duplicate letters by tracking which buttons have been used.
 */
function clickLettersForWord(container, word) {
  for (const letter of word) {
    const allButtons = container.querySelectorAll('button')
    const letterButton = Array.from(allButtons).find(btn =>
      btn.textContent === letter && !btn.disabled
    )
    if (letterButton) {
      fireEvent.click(letterButton)
    }
  }
}

/**
 * Submit the current answer by clicking the check button.
 */
function submitAnswer() {
  const checkButtons = screen.getAllByRole('button')
  const checkBtn = checkButtons.find(btn => btn.textContent.includes('\u{05D1}\u{05D3}\u{05D9}\u{05E7}\u{05D4}'))
  if (checkBtn) {
    fireEvent.click(checkBtn)
  }
}

// --- TEST SUITE ---

describe('WordAdventure Snapshot Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-01T12:00:00Z'))
    // Mock Math.random for deterministic shuffling and dialogue selection
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    localStorage.clear()
    resetZustandStore()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders welcome state when no userProfile exists', () => {
    // Do NOT set any userProfile in localStorage or store
    const { container } = render(<WordAdventure />)
    expect(container).toMatchSnapshot()
  })

  it('renders start state (main menu) when userProfile exists', () => {
    setupLoggedInState()
    const { container } = render(<WordAdventure />)
    expect(container).toMatchSnapshot()
  })

  it('renders map state after clicking world map button', () => {
    setupLoggedInState()
    const { container } = render(<WordAdventure />)

    act(() => {
      fireEvent.click(screen.getByText('\u{05DE}\u{05E4}\u{05EA} \u{05E2}\u{05D5}\u{05DC}\u{05DE}\u{05D5}\u{05EA}'))
    })

    expect(container).toMatchSnapshot()
  })

  it('renders playing state after navigating to a level', () => {
    setupLoggedInState()
    const { container } = render(<WordAdventure />)

    navigateToPlayingState(container)

    expect(container).toMatchSnapshot()
  })

  it('renders levelComplete state after answering all words correctly', () => {
    setupLoggedInState()
    const { container } = render(<WordAdventure />)

    navigateToPlayingState(container)

    // The easy level has 5 words: CAT, DOG, SUN, BOOK, FISH
    const easyWords = ['CAT', 'DOG', 'SUN', 'BOOK', 'FISH']

    for (const word of easyWords) {
      clickLettersForWord(container, word)
      submitAnswer()

      // Advance timers past the 1500ms delay for moving to next word
      act(() => {
        vi.advanceTimersByTime(2000)
      })
    }

    expect(container).toMatchSnapshot()
  })

  it('renders gameOver state after losing all lives', () => {
    setupLoggedInState()
    const { container } = render(<WordAdventure />)

    navigateToPlayingState(container)

    // Submit 3 wrong answers to lose all 3 lives.
    // Click a single wrong letter and submit (the word is CAT, submitting one
    // wrong letter like just "C" or a different letter will be incorrect).
    for (let i = 0; i < 3; i++) {
      // Click any single letter to form a wrong (incomplete) answer
      const allButtons = container.querySelectorAll('button')
      const letterButton = Array.from(allButtons).find(btn =>
        btn.textContent.length === 1 &&
        !btn.disabled &&
        /^[A-Z]$/.test(btn.textContent)
      )
      if (letterButton) {
        fireEvent.click(letterButton)
      }

      submitAnswer()

      // Advance timers past the 1000ms feedback delay
      act(() => {
        vi.advanceTimersByTime(2000)
      })
    }

    expect(container).toMatchSnapshot()
  })
})
