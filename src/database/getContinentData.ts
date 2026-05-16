import type { ContinentDatabase } from '../types/map';
import { getContinentDatabase } from '../utils/storage';

/**
 * Gets continent data from IndexedDB cache or bundled JSON
 * Returns null if no data is available
 */
export async function getContinentData(): Promise<ContinentDatabase | null> {
  try {
    // Try to get from IndexedDB first
    const cachedDb = await getContinentDatabase();
    if (cachedDb) {
      console.log('Using cached continent data from IndexedDB');
      return cachedDb;
    }

    // Try to import bundled data (we'll create this later)
    try {
      const bundledDb = await import('../data/continentDb.json');
      if (bundledDb && bundledDb.default) {
        console.log('Using bundled continent data');
        return bundledDb.default as unknown as ContinentDatabase;
      }
    } catch {
      console.warn('No bundled continent data found, will need to build database');
    }

    return null;
  } catch (error) {
    console.error('Failed to get continent data:', error);
    return null;
  }
}
