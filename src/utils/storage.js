/**
 * Safe localStorage utilities with error handling
 * Prevents crashes from corrupted or invalid JSON data
 */

/**
 * Safely retrieve and parse JSON from localStorage
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {*} Parsed value or defaultValue
 */
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

/**
 * Safely stringify and store JSON in localStorage
 * @param {string} key - The localStorage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export const safeSetJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to save "${key}":`, error);
    return false;
  }
};

/**
 * Safely retrieve a number from localStorage
 * @param {string} key - The localStorage key
 * @param {number} defaultValue - Default value if key doesn't exist or is invalid
 * @returns {number} Parsed number or defaultValue
 */
export const safeGetNumber = (key, defaultValue = 0) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    const parsed = parseInt(item, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  } catch (error) {
    console.error(`[Storage] Failed to parse number "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Storage keys used throughout the app
 */
export const STORAGE_KEYS = {
  USER_PROFILE: 'userProfile',
  SCORE: 'score',
  STARS: 'stars',
  USER_PROGRESS: 'userProgress',
  HIGH_SCORES: 'highScores',
  INVENTORY: 'inventory',
  DAILY_STATS: 'dailyStats',
  AVATAR: 'avatar',
};
