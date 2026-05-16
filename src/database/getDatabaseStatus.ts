import achievementDb from '../data/achievementDb.json';

import type { AchievementDatabase } from '../types/achievement';
import { getAchievementDatabase } from '../utils/storage';

/**
 * Returns the status of the achievement database (timestamps)
 */
export async function getDatabaseStatus() {
  const localDb = await getAchievementDatabase();
  const bundledDb = achievementDb as unknown as AchievementDatabase;
  const localTs = localDb?.timestamp || 0;
  const bundledTs = bundledDb?.timestamp || 0;

  return {
    localTs,
    bundledTs,
    activeTs: Math.max(localTs, bundledTs),
  };
}
