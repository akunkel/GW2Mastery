const API_KEY_STORAGE_KEY = 'gw2_api_key';
const FILTER_SETTINGS_KEY = 'gw2_filter_settings';
const MAP_FILTER_SETTINGS_KEY = 'gw2_map_filter_settings';
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
        console.error('Failed to retrieve filter settings from localStorage:', error);
        return { hideCompleted: false, requiredOnly: true, showHidden: false };
    }
}

/**
 * Saves map filter settings to localStorage
 */
export function saveMapFilterSettings(showCollectibleAchievements: boolean): void {
    try {
        localStorage.setItem(MAP_FILTER_SETTINGS_KEY, JSON.stringify({ showCollectibleAchievements }));
    } catch (error) {
        console.error('Failed to save map filter settings to localStorage:', error);
    }
}

/**
 * Retrieves map filter settings from localStorage
 */
export function getMapFilterSettings(): { showCollectibleAchievements: boolean } {
    try {
        const data = localStorage.getItem(MAP_FILTER_SETTINGS_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return { showCollectibleAchievements: parsed.showCollectibleAchievements ?? false };
        }
        return { showCollectibleAchievements: false };
    } catch (error) {
        console.error('Failed to retrieve map filter settings from localStorage:', error);
        return { showCollectibleAchievements: false };
    }
}

const ACHIEVEMENT_DB_KEY = 'gw2_achievement_db_v3';
const CONTINENT_DB_KEY = 'gw2_continent_db_v1';
const DB_NAME = 'GW2MasteryDB';
const DB_VERSION = 1;
const DB_STORE_NAME = 'achievements';

import type { AchievementDatabase, ContinentDatabase } from '../types/gw2';

/**
 * Open IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
                db.createObjectStore(DB_STORE_NAME);
            }
        };
    });
}

/**
 * Saves the full achievement database to IndexedDB
 */
export async function saveAchievementDatabase(db: AchievementDatabase): Promise<void> {
    try {
        const idb = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = idb.transaction(DB_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(DB_STORE_NAME);
            const request = store.put(db, ACHIEVEMENT_DB_KEY);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    } catch (error) {
        console.error('Failed to save achievement database to IndexedDB:', error);
        throw error;
    }
}

/**
 * Retrieves the full achievement database from IndexedDB
 */
export async function getAchievementDatabase(): Promise<AchievementDatabase | null> {
    try {
        const idb = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = idb.transaction(DB_STORE_NAME, 'readonly');
            const store = transaction.objectStore(DB_STORE_NAME);
            const request = store.get(ACHIEVEMENT_DB_KEY);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    } catch (error) {
        console.error('Failed to retrieve achievement database from IndexedDB:', error);
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

// ===== Continent Database Storage =====

/**
 * Saves the continent database to IndexedDB
 */
export async function saveContinentDatabase(db: ContinentDatabase): Promise<void> {
    try {
        const idb = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = idb.transaction(DB_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(DB_STORE_NAME);
            const request = store.put(db, CONTINENT_DB_KEY);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    } catch (error) {
        console.error('Failed to save continent database to IndexedDB:', error);
        throw error;
    }
}

/**
 * Retrieves the continent database from IndexedDB
 */
export async function getContinentDatabase(): Promise<ContinentDatabase | null> {
    try {
        const idb = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = idb.transaction(DB_STORE_NAME, 'readonly');
            const store = transaction.objectStore(DB_STORE_NAME);
            const request = store.get(CONTINENT_DB_KEY);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    } catch (error) {
        console.error('Failed to retrieve continent database from IndexedDB:', error);
        return null;
    }
}
