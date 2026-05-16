import type {
  AccountAchievement,
  AchievementCategory,
} from '../types/achievement';
import { BASE_URL } from './apiConfig';

const PARALLEL_REQUESTS = 4; // Parallel requests to stay under API rate limit (5/sec)

/**
 * Fetches account-specific achievement progress
 */
export async function fetchAccountAchievements(apiKey: string): Promise<AccountAchievement[]> {
  const response = await fetch(`${BASE_URL}/account/achievements?access_token=${apiKey}`);

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Invalid API key or insufficient permissions');
    }
    throw new Error(`Failed to fetch account achievements: ${response.statusText}`);
  }

  const data = await response.json() as AccountAchievement[];
  if (data.length === 0) {
    throw new Error('Achievements API returned no achievement data. Try using a different API key.');
  } else {
    console.log(`Loaded data for ${data.length} achievements, ${data.filter((a) => a.done).length} completed.`);
  }
  return data;
}

/**
 * Fetches all achievement categories
 */
export async function fetchAchievementCategories(lang: string = 'en'): Promise<AchievementCategory[]> {
  try {
    // Get all category IDs
    const idsResponse = await fetch(`${BASE_URL}/achievements/categories?lang=${lang}`);
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
          const response = await fetch(
            `${BASE_URL}/achievements/categories?ids=${batchIds.join(',')}&lang=${lang}`
          );
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

