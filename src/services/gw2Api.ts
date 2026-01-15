import type { AccountAchievement, Achievement, AchievementCategory, MasteryReward } from '../types/gw2';
import { getMasteryAchievementIds, getMasteryAchievements, saveMasteryAchievementIds, saveMasteryAchievements } from '../utils/storage';

const BASE_URL = 'https://api.guildwars2.com/v2';
const PARALLEL_REQUESTS = 4; // Parallel requests to stay under API rate limit (5/sec)

/**
 * Validates an API key by attempting to fetch account achievements
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${BASE_URL}/account/achievements?access_token=${apiKey}`
    );
    return response.ok;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
}

/**
 * Builds the mastery achievement IDs database by fetching all achievements
 * This should be called manually via the "Build Database" button
 */
export async function buildMasteryAchievementIdsDatabase(
  onProgress?: (current: number, total: number) => void
): Promise<number[]> {
  // Get all achievement IDs
  const idsResponse = await fetch(`${BASE_URL}/achievements`);
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
  const masteryIds: number[] = [];
  const masteryAchievements: Achievement[] = [];

  // Process batches in parallel groups to stay under rate limits
  for (let i = 0; i < batches.length; i += PARALLEL_REQUESTS) {
    const parallelBatches = batches.slice(i, i + PARALLEL_REQUESTS);

    // Fetch multiple batches in parallel
    const results = await Promise.all(
      parallelBatches.map(async (batchIds) => {
        const response = await fetch(`${BASE_URL}/achievements?ids=${batchIds.join(',')}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch achievements batch: ${response.statusText}`);
        }
        return (await response.json()) as Achievement[];
      })
    );

    // Process results and filter for mastery achievements
    results.forEach((batchData) => {
      batchData.forEach((achievement) => {
        if (achievement.rewards?.some((r) => r.type === 'Mastery')) {
          masteryIds.push(achievement.id);
          masteryAchievements.push(achievement);
        }
      });
    });

    // Report progress
    const currentBatch = Math.min(i + PARALLEL_REQUESTS, totalBatches);
    if (onProgress) {
      onProgress(currentBatch, totalBatches);
    }
  }

  // Save both IDs and full achievement details to localStorage
  saveMasteryAchievementIds(masteryIds);
  saveMasteryAchievements(masteryAchievements);

  // Log the results for developers to use in source code.
  // To update the default database, copy the JSON and paste it into src/data/masteryAchievementIds.json
  console.log('=== Database Build Complete ===');
  console.log(`Total mastery achievements: ${masteryIds.length}`);
  console.log('\n' + JSON.stringify(masteryIds, null, 2));

  return masteryIds;
}

/**
 * Fetches ALL mastery point achievements from the database
 * Requires mastery achievement IDs database to be built first
 */
export async function fetchMasteryAchievements(
  _accountAchievements: AccountAchievement[]
): Promise<Achievement[]> {
  // Try to get from cache first
  const cachedAchievements = getMasteryAchievements();
  if (cachedAchievements && cachedAchievements.length > 0) {
    console.log(`Loaded ${cachedAchievements.length} mastery achievements from cache (instant)`);
    return cachedAchievements;
  }

  // Fall back to fetching from API if cache is empty
  const masteryIdsArray = getMasteryAchievementIds();

  if (!masteryIdsArray) {
    throw new Error('Mastery achievement database not found. Please click "Build Database" first.');
  }

  console.log(`Fetching all ${masteryIdsArray.length} mastery achievements from API`);

  // Create batches of achievement IDs
  const batchSize = 200;
  const batches: number[][] = [];
  for (let i = 0; i < masteryIdsArray.length; i += batchSize) {
    batches.push(masteryIdsArray.slice(i, i + batchSize));
  }

  const achievements: Achievement[] = [];

  // Process batches in parallel groups to stay under rate limits
  for (let i = 0; i < batches.length; i += PARALLEL_REQUESTS) {
    const parallelBatches = batches.slice(i, i + PARALLEL_REQUESTS);

    // Fetch multiple batches in parallel
    const results = await Promise.all(
      parallelBatches.map(async (batchIds) => {
        const response = await fetch(`${BASE_URL}/achievements?ids=${batchIds.join(',')}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch achievement details: ${response.statusText}`);
        }
        return (await response.json()) as Achievement[];
      })
    );

    // Collect results
    results.forEach((batchData) => {
      achievements.push(...batchData);
    });
  }

  console.log(`Loaded ${achievements.length} total mastery achievements from API`);

  // Save to cache for next time
  saveMasteryAchievements(achievements);

  return achievements;
}

/**
 * Fetches account-specific achievement progress
 */
export async function fetchAccountAchievements(
  apiKey: string
): Promise<AccountAchievement[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/account/achievements?access_token=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Invalid API key or insufficient permissions');
      }
      throw new Error(`Failed to fetch account achievements: ${response.statusText}`);
    }

    const data = await response.json();
    return data as AccountAchievement[];
  } catch (error) {
    console.error('Failed to fetch account achievements:', error);
    throw error;
  }
}

/**
 * Fetches all achievement categories
 */
export async function fetchAchievementCategories(): Promise<AchievementCategory[]> {
  try {
    // Get all category IDs
    const idsResponse = await fetch(`${BASE_URL}/achievements/categories`);
    if (!idsResponse.ok) {
      throw new Error(`Failed to fetch category IDs: ${idsResponse.statusText}`);
    }
    const categoryIds = (await idsResponse.json()) as number[];

    // Create batches of category IDs
    const batchSize = 200;
    const batches: number[][] = [];
    for (let i = 0; i < categoryIds.length; i += batchSize) {
      batches.push(categoryIds.slice(i, i + batchSize));
    }

    const categories: AchievementCategory[] = [];

    // Process batches in parallel groups to stay under rate limits
    for (let i = 0; i < batches.length; i += PARALLEL_REQUESTS) {
      const parallelBatches = batches.slice(i, i + PARALLEL_REQUESTS);

      // Fetch multiple batches in parallel
      const results = await Promise.all(
        parallelBatches.map(async (batchIds) => {
          const response = await fetch(`${BASE_URL}/achievements/categories?ids=${batchIds.join(',')}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.statusText}`);
          }
          return (await response.json()) as AchievementCategory[];
        })
      );

      // Collect results
      results.forEach((batchData) => {
        categories.push(...batchData);
      });
    }

    return categories;
  } catch (error) {
    console.error('Failed to fetch achievement categories:', error);
    throw error;
  }
}

/**
 * Gets the mastery region for an achievement
 */
export function getMasteryRegion(achievement: Achievement): string | null {
  if (!achievement.rewards) return null;

  const masteryReward = achievement.rewards.find(
    (reward) => reward.type === 'Mastery'
  ) as MasteryReward | undefined;

  return masteryReward?.region || null;
}

/**
 * Maps achievements to their categories
 */
export function mapAchievementsToCategories(
  _achievements: Achievement[],
  categories: AchievementCategory[]
): Map<number, { categoryId: number; categoryName: string; categoryOrder: number; }> {
  const achievementToCategoryMap = new Map<number, { categoryId: number; categoryName: string; categoryOrder: number; }>();

  // Create a map for quick lookup
  categories.forEach((category) => {
    category.achievements.forEach((achievementId) => {
      achievementToCategoryMap.set(achievementId, {
        categoryId: category.id,
        categoryName: category.name,
        categoryOrder: category.order,
      });
    });
  });

  return achievementToCategoryMap;
}
