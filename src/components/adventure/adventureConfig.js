/**
 * Adventure Game Configuration
 * Zone definitions, state machine states, and game tuning constants
 */

// Game state machine states
export const ADVENTURE_STATES = {
  EXPLORING: 'exploring',
  APPROACHING: 'approaching',
  ENCOUNTERING: 'encountering',
  RESOLVED: 'resolved',
  ZONE_TRANSITION: 'zoneTransition',
  COMPLETE: 'complete',
};

// 5 themed zones with word bank category mappings
export const ADVENTURE_ZONES = [
  {
    id: 'forest',
    name: '\u05D4\u05D9\u05E2\u05E8 \u05D4\u05E7\u05E1\u05D5\u05DD',
    subtitle: 'Enchanted Forest',
    categories: ['nature', 'animals'],
    theme: {
      sky: 'from-emerald-200 via-green-100 to-lime-50',
      ground: 'from-emerald-600 to-green-800',
      accent: 'from-green-400 to-emerald-500',
      filter: 'contrast(1.1) saturate(1.2)',
      decorEmojis: ['\uD83C\uDF33', '\uD83C\uDF32', '\uD83C\uDF44', '\uD83C\uDF3F', '\uD83E\uDD8B', '\uD83D\uDC3F\uFE0F'],
      encounterCue: '\uD83C\uDF3F',
    },
    encounterChance: 0.004,
    wordCount: 5,
  },
  {
    id: 'beach',
    name: '\u05D7\u05D5\u05E3 \u05D4\u05D9\u05DD',
    subtitle: 'Ocean Beach',
    categories: ['colors', 'food'],
    theme: {
      sky: 'from-sky-300 via-blue-200 to-cyan-100',
      ground: 'from-yellow-300 to-amber-400',
      accent: 'from-cyan-400 to-blue-500',
      filter: 'brightness(1.05) saturate(1.1)',
      decorEmojis: ['\uD83C\uDFD6\uFE0F', '\uD83D\uDC1A', '\uD83C\uDF0A', '\uD83E\uDD80', '\u26F1\uFE0F', '\uD83D\uDC20'],
      encounterCue: '\uD83D\uDC1A',
    },
    encounterChance: 0.004,
    wordCount: 5,
  },
  {
    id: 'city',
    name: '\u05D4\u05E2\u05D9\u05E8 \u05D4\u05D2\u05D3\u05D5\u05DC\u05D4',
    subtitle: 'The Big City',
    categories: ['professions', 'home'],
    theme: {
      sky: 'from-slate-300 via-gray-200 to-blue-100',
      ground: 'from-gray-500 to-slate-700',
      accent: 'from-amber-400 to-yellow-500',
      filter: 'contrast(1.05)',
      decorEmojis: ['\uD83C\uDFE2', '\uD83C\uDFEC', '\uD83D\uDE97', '\uD83D\uDEA6', '\uD83C\uDFEA', '\uD83C\uDFD7\uFE0F'],
      encounterCue: '\uD83D\uDCE6',
    },
    encounterChance: 0.004,
    wordCount: 5,
  },
  {
    id: 'mountain',
    name: '\u05E4\u05E1\u05D2\u05EA \u05D4\u05D4\u05E8\u05D9\u05DD',
    subtitle: 'Mountain Summit',
    categories: ['body', 'actions'],
    theme: {
      sky: 'from-indigo-300 via-purple-200 to-pink-100',
      ground: 'from-stone-500 to-gray-700',
      accent: 'from-purple-400 to-indigo-500',
      filter: 'contrast(1.15) brightness(0.95)',
      decorEmojis: ['\u26F0\uFE0F', '\uD83C\uDFD4\uFE0F', '\uD83E\uDD85', '\uD83C\uDF04', '\uD83E\uDEA8', '\u2744\uFE0F'],
      encounterCue: '\uD83E\uDEA8',
    },
    encounterChance: 0.004,
    wordCount: 5,
  },
  {
    id: 'space',
    name: '\u05D4\u05D7\u05DC\u05DC \u05D4\u05D7\u05D9\u05E6\u05D5\u05DF',
    subtitle: 'Outer Space',
    categories: ['emotions', 'family'],
    theme: {
      sky: 'from-indigo-950 via-purple-900 to-slate-900',
      ground: 'from-slate-800 to-indigo-950',
      accent: 'from-blue-500 to-violet-600',
      filter: 'brightness(0.9) contrast(1.3)',
      decorEmojis: ['\uD83C\uDF1F', '\uD83E\uDE90', '\uD83D\uDE80', '\uD83D\uDEF8', '\uD83C\uDF0C', '\uD83D\uDC7D'],
      encounterCue: '\uD83C\uDF1F',
    },
    encounterChance: 0.004,
    wordCount: 5,
  },
];

// Game tuning constants
export const ADVENTURE_CONFIG = {
  scrollSpeed: 4,
  progressIncrement: 0.03,
  approachDuration: 1200,
  resolvedDuration: 2000,
  petHintDelay: 8000,
  bonusChance: 0.2,
  bonusPoints: 25,
};
