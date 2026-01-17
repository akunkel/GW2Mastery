const API_KEY_STORAGE_KEY = 'gw2_api_key';
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
 * Saves filter settings to localStorage
 */
export function saveFilterSettings(
  hideCompleted: boolean,
  requiredOnly: boolean,
  showHidden: boolean
): void {
  try {
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

    if (data) {
      const parsed = JSON.parse(data);
      const settings = {
        hideCompleted: parsed.hideCompleted ?? false,
        requiredOnly: parsed.requiredOnly ?? true,
        showHidden: parsed.showHidden ?? false,
      };
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

const ACHIEVEMENT_DB_KEY = 'gw2_achievement_db_v2';

import type { AchievementDatabase } from '../types/gw2';

/**
 * Saves the full achievement database to localStorage
 */
export function saveAchievementDatabase(db: AchievementDatabase): void {
  try {
    localStorage.setItem(ACHIEVEMENT_DB_KEY, JSON.stringify(db));
  } catch (error) {
    console.error('Failed to save achievement database to localStorage:', error);
  }
}

/**
 * Retrieves the full achievement database from localStorage
 */
export function getAchievementDatabase(): AchievementDatabase | null {
  try {
    const data = localStorage.getItem(ACHIEVEMENT_DB_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to retrieve achievement database from localStorage:', error);
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
