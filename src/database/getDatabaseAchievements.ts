import achievementDb from '../data/achievementDb.json';

import type { AchievementDatabase } from '../types/achievement';
import { getAchievementDatabase } from '../utils/storage';

/**
 * Gets ALL achievements from the database, either from local storage or json, whichever is newer.
 */
export async function getDatabaseAchievements(): Promise<AchievementDatabase | null> {
  // 1. Get local storage version
  const localDb = await getAchievementDatabase();

  // 2. Get bundled version
  // We handle the potential type mismatch if the JSON is empty stub
  const bundledDb = achievementDb as unknown as AchievementDatabase;

  // 3. Compare timestamps
  let activeDb: AchievementDatabase;

  const localTs = localDb?.timestamp || 0;
  const bundledTs = bundledDb?.timestamp || 0;

  if (localTs > bundledTs) {
    activeDb = localDb!;
  } else if (bundledTs > 0) {
    activeDb = bundledDb;
  } else {
    // Both are empty/invalid
    console.warn('No valid achievement database found.');
    return null;
  }

  return activeDb;
}
