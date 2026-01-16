import type { Achievement } from '../types/gw2';
import defaultMasteryIds from '../data/masteryAchievementIds.json';

const API_KEY_STORAGE_KEY = 'gw2_api_key';
const MASTERY_IDS_STORAGE_KEY = 'gw2_mastery_achievement_ids';
const MASTERY_IDS_TIMESTAMP_KEY = 'gw2_mastery_achievement_ids_timestamp';
const MASTERY_ACHIEVEMENTS_CACHE_KEY = 'gw2_mastery_achievements_cache';
const FILTER_SETTINGS_KEY = 'gw2_filter_settings';
const HIDDEN_ACHIEVEMENTS_KEY = 'gw2_hidden_achievements';

/**
 * Saves the API key to localStorage
 */
export function saveApiKey(key: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } catch (error) {
    console.error('Failed to save API key to localStorage:', error);
  }
}

/**
 * Retrieves the API key from localStorage
 */
export function getApiKey(): string | null {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to retrieve API key from localStorage:', error);
    return null;
  }
}

/**
 * Removes the API key from localStorage
 */
export function clearApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear API key from localStorage:', error);
  }
}

/**
 * Saves mastery achievement IDs to localStorage
 */
export function saveMasteryAchievementIds(ids: number[]): void {
  try {
    localStorage.setItem(MASTERY_IDS_STORAGE_KEY, JSON.stringify(ids));
    localStorage.setItem(MASTERY_IDS_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to save mastery achievement IDs to localStorage:', error);
  }
}

/**
 * Retrieves mastery achievement IDs from localStorage
 * If not found in localStorage, returns the default IDs from the bundled JSON file
 */
export function getMasteryAchievementIds(): number[] | null {
  try {
    const data = localStorage.getItem(MASTERY_IDS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Return default IDs from bundled JSON file if available
    return defaultMasteryIds.length > 0 ? defaultMasteryIds : null;
  } catch (error) {
    console.error('Failed to retrieve mastery achievement IDs from localStorage:', error);
    return defaultMasteryIds.length > 0 ? defaultMasteryIds : null;
  }
}

/**
 * Gets the timestamp when mastery achievement IDs were last updated
 * Returns build time timestamp if using default bundled data
 */
export function getMasteryAchievementIdsTimestamp(): number | null {
  try {
    const timestamp = localStorage.getItem(MASTERY_IDS_TIMESTAMP_KEY);
    if (timestamp) {
      return parseInt(timestamp, 10);
    }
    // If using default bundled data and no timestamp exists, return build time
    // This will be updated when you paste the IDs from console
    return defaultMasteryIds.length > 0 ? new Date('2026-01-14').getTime() : null;
  } catch (error) {
    console.error('Failed to retrieve mastery achievement IDs timestamp:', error);
    return defaultMasteryIds.length > 0 ? new Date('2026-01-14').getTime() : null;
  }
}

/**
 * Saves filter settings to localStorage
 */
export function saveFilterSettings(
  hideCompleted: boolean,
  requiredOnly: boolean,
  showHidden: boolean
): void {
  try {
    console.log('Saving filter settings:', { hideCompleted, requiredOnly, showHidden });
    localStorage.setItem(
      FILTER_SETTINGS_KEY,
      JSON.stringify({ hideCompleted, requiredOnly, showHidden })
    );
  } catch (error) {
    console.error('Failed to save filter settings to localStorage:', error);
  }
}

/**
 * Retrieves filter settings from localStorage
 * Defaults to { hideCompleted: false, requiredOnly: true, showHidden: false } if not found
 */
export function getFilterSettings(): {
  hideCompleted: boolean;
  requiredOnly: boolean;
  showHidden: boolean;
} {
  try {
    const data = localStorage.getItem(FILTER_SETTINGS_KEY);
    console.log('Reading filter settings:', data);
    if (data) {
      const parsed = JSON.parse(data);
      const settings = {
        hideCompleted: parsed.hideCompleted ?? false,
        requiredOnly: parsed.requiredOnly ?? true,
        showHidden: parsed.showHidden ?? false,
      };
      console.log('Parsed settings:', settings);
      return settings;
    }
    // Default: show completed (false), required only (true), show hidden (false)
    return { hideCompleted: false, requiredOnly: true, showHidden: false };
  } catch (error) {
    console.error(
      'Failed to retrieve filter settings from localStorage:',
      error
    );
    return { hideCompleted: false, requiredOnly: true, showHidden: false };
  }
}

/**
 * Saves full mastery achievement details to localStorage
 */
export function saveMasteryAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(MASTERY_ACHIEVEMENTS_CACHE_KEY, JSON.stringify(achievements));
    localStorage.setItem(MASTERY_IDS_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to save mastery achievements to localStorage:', error);
  }
}

/**
 * Retrieves full mastery achievement details from localStorage
 */
export function getMasteryAchievements(): Achievement[] | null {
  try {
    const data = localStorage.getItem(MASTERY_ACHIEVEMENTS_CACHE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to retrieve mastery achievements from localStorage:', error);
    return null;
  }
}

/**
 * Saves hidden achievement IDs to localStorage
 */
export function saveHiddenAchievements(hiddenIds: Set<number>): void {
  try {
    localStorage.setItem(HIDDEN_ACHIEVEMENTS_KEY, JSON.stringify(Array.from(hiddenIds)));
  } catch (error) {
    console.error('Failed to save hidden achievements to localStorage:', error);
  }
}

/**
 * Retrieves hidden achievement IDs from localStorage
 */
export function getHiddenAchievements(): Set<number> {
  try {
    const data = localStorage.getItem(HIDDEN_ACHIEVEMENTS_KEY);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch (error) {
    console.error('Failed to retrieve hidden achievements from localStorage:', error);
    return new Set();
  }
}
