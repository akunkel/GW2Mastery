import historicalCategories from '../data/historicalCategories.json';
import itemNameDb from '../data/itemNameDb.json';

import { BASE_URL } from '../services/apiConfig';
import { queryAchievementCategories } from '../services/achievementsApi';
import type {
  Achievement,
  AchievementDatabase,
  RawAchievement,
} from '../types/achievement';
import type { MasteryRegion } from '../types/mastery';
import { saveAchievementDatabase } from '../utils/storage';

const excludedAchievementNames = ['Daily', 'Weekly'];
const historicalCategoryIds = new Set(historicalCategories.categories);
const excludedCategoryNames = ['Retired Achievements', 'Adventure Guide:'];

// Parallel requests to stay under API rate limit (5/sec)
const PARALLEL_REQUESTS = 4;

/**
 * Builds the achievement database by fetching all achievements from the API. This is run manually
 * by the user, which usually is not needed if the newest achievement JSON has been updated.
 */
export async function buildAchievementDatabase(
  onProgress?: (current: number, total: number) => void,
  lang: string = 'en'
): Promise<{ db: AchievementDatabase; rawAchievements: RawAchievement[] }> {
  // 1. Start fetching categories (don't await yet)
  const categoriesPromise = queryAchievementCategories({ lang });

  // 2. Fetch Achievements
  // Get all achievement IDs
  const idsResponse = await fetch(`${BASE_URL}/achievements?lang=${lang}`);
  if (!idsResponse.ok) {
    throw new Error(`Failed to fetch achievement IDs: ${idsResponse.statusText}`);
  }
  const allIds = (await idsResponse.json()) as number[];

  // Create batches of achievement IDs
  const batchSize = 200;
  const batches: number[][] = [];
  for (let i = 0; i < allIds.length; i += batchSize) {
    batches.push(allIds.slice(i, i + batchSize));
  }

  const totalBatches = batches.length;
  const allRawAchievements: RawAchievement[] = [];

  // Process batches in parallel groups to stay under rate limits
  for (let i = 0; i < batches.length; i += PARALLEL_REQUESTS) {
    const parallelBatches = batches.slice(i, i + PARALLEL_REQUESTS);

    // Fetch multiple batches in parallel
    const results = await Promise.all(
      parallelBatches.map(async (batchIds) => {
        const response = await fetch(`${BASE_URL}/achievements?ids=${batchIds.join(',')}&lang=${lang}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch achievements batch: ${response.statusText}`);
        }
        return (await response.json()) as RawAchievement[];
      })
    );

    // Collect results
    results.forEach((batchData) => {
      allRawAchievements.push(...batchData);
    });

    // Report progress
    const currentBatch = Math.min(i + PARALLEL_REQUESTS, totalBatches);
    if (onProgress) {
      onProgress(currentBatch, totalBatches);
    }
  }

  // Strip out historical categories.
  const allCategories = await categoriesPromise;
  const categories = allCategories.filter((cat) => !historicalCategoryIds.has(cat.id));
  const historicalAchievementIds = new Set(
    allCategories.filter((cat) => historicalCategoryIds.has(cat.id)).flatMap((cat) => cat.achievements)
  );
  const excludedCategoryAchievementIds = new Set(
    allCategories
      .filter((cat) => excludedCategoryNames.some((ex) => cat.name.includes(ex)))
      .flatMap((cat) => cat.achievements)
  );

  const rawAchievements = allRawAchievements
    // Strip out achievements excluded by partial name.
    .filter((a) => !excludedAchievementNames.some((ex) => a.name.includes(ex)))
    // Strip out historical achievements.
    .filter((a) => !historicalAchievementIds.has(a.id))
    // Strip out excluded category achievements.
    .filter((a) => !excludedCategoryAchievementIds.has(a.id))
    // Strip out non-permanent achievements.
    .filter((a) => a.flags?.includes('Permanent'));

  // Map filtered raw achievements to optimized structure
  const ids: number[] = [];
  const achievements: Achievement[] = [];
  for (const raw of rawAchievements) {
    ids.push(raw.id);

    const optimized: Achievement = {
      id: raw.id,
      name: raw.name,
      requirement: raw.requirement,
      flags: raw.flags,
    };

    if (raw.icon) {
      optimized.icon = raw.icon;
    }

    const masteryReward = raw.rewards?.find((r) => r.type === 'Mastery');
    if (masteryReward?.region) {
      optimized.masteryRegion = masteryReward.region as MasteryRegion;
      if (masteryReward.id !== undefined) {
        optimized.masteryId = masteryReward.id;
      }
    }

    if (raw.bits && raw.bits.length > 0) {
      optimized.bits = raw.bits.map((b, index) => {
        const bit: { text?: string; } = {};
        if (b.text) {
          bit.text = b.text;
        } else if (b.type === 'Item') {
          bit.text = (itemNameDb as Record<string, string>)[String(b.id)] ?? `${b.type} ${index + 1}`;
        } else {
          bit.text = `${b.type} ${index + 1}`;
        }
        return bit;
      });
    }

    achievements.push(optimized);
  }

  // Create database object with timestamp
  const db: AchievementDatabase = {
    timestamp: Date.now(),
    achievements,
    categories,
    groups: [],
  };

  // Save to localStorage for immediate use
  await saveAchievementDatabase(db);

  console.log('=== Database Build Complete ===');
  console.log(`Achievements: ${achievements.length}`);
  console.log(JSON.stringify(db));

  return { db, rawAchievements };
}
