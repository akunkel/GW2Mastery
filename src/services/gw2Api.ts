import type { AccountAchievement, Achievement, AchievementCategory, AchievementDatabase, MasteryRegion } from '../types/gw2';
import achievementDb from '../data/achievementDb.json';
import { getAchievementDatabase, saveAchievementDatabase } from '../utils/storage';

// Raw API response types (internal use for build process)
interface RawAchievementReward {
  type: string;
  id?: number;
  count?: number;
  region?: string; // Raw API region string (e.g., "Maguuma")
}

interface RawAchievementBit {
  type: string;
  id?: number;
  text?: string;
}

interface RawAchievement {
  id: number;
  name: string;
  description: string;
  requirement: string;
  locked_text?: string;
  type: string;
  flags: string[];
  tiers: unknown[];
  icon?: string;
  prerequisites?: number[];
  rewards?: RawAchievementReward[];
  bits?: RawAchievementBit[];
  point_cap?: number;
}

/**
 * Returns the status of the achievement database (timestamps)
 */
export function getDatabaseStatus() {
  const localDb = getAchievementDatabase();
  const bundledDb = achievementDb as unknown as AchievementDatabase;
  const localTs = localDb?.timestamp || 0;
  const bundledTs = bundledDb?.timestamp || 0;

  return {
    localTs,
    bundledTs,
    activeTs: Math.max(localTs, bundledTs)
  };
}

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
 * Builds the achievement database by fetching all achievements
 * This should be called manually via the "Build Database" button
 */
export async function buildAchievementDatabase(
  onProgress?: (current: number, total: number) => void
): Promise<number[]> {
  // console.log('Starting database build...');

  // 1. Start fetching categories (don't await yet)
  const categoriesPromise = fetchAchievementCategories();

  // 2. Fetch Achievements
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
  const ids: number[] = [];
  const achievements: Achievement[] = [];

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
        return (await response.json()) as RawAchievement[];
      })
    );

    // Process results
    results.forEach((batchData) => {
      batchData.forEach((raw) => {
        ids.push(raw.id);

        // Optimize: Map raw API data to our optimized structure
        const optimized: Achievement = {
          id: raw.id,
          name: raw.name,
          requirement: raw.requirement,
        };

        if (raw.icon) {
          optimized.icon = raw.icon;
        }

        const region = raw.rewards?.find((r) => r.type === 'Mastery')?.region;
        if (region) {
          optimized.masteryRegion = region as MasteryRegion;
        }

        if (raw.bits && raw.bits.length > 0) {
          optimized.bits = raw.bits.map((b) => {
            // Create clean bit object
            const bit: { text?: string } = {};
            if (b.text) bit.text = b.text;
            return bit;
          });
        }


        achievements.push(optimized);
      });
    });

    // Report progress
    const currentBatch = Math.min(i + PARALLEL_REQUESTS, totalBatches);
    if (onProgress) {
      onProgress(currentBatch, totalBatches);
    }
  }

  // Await categories fetch to complete
  const categories = await categoriesPromise;
  // console.log(categories);

  // Create database object with timestamp
  const db: AchievementDatabase = {
    timestamp: Date.now(),
    achievements,
    categories,
  };

  // Save to localStorage for immediate use
  saveAchievementDatabase(db);

  console.log('=== Database Build Complete ===');
  console.log(`Total achievements: ${achievements.length}`);
  console.log(`Total categories: ${categories.length}`);
  console.log('\n' + JSON.stringify(db));

  return ids;
}

/**
 * Gets ALL achievements from the database, either from local storage or json, whichever is newer.
 */
export async function getDbAchievements(): Promise<AchievementDatabase | null> {
  // 1. Get local storage version
  const localDb = getAchievementDatabase();

  // 2. Get bundled version
  // We handle the potential type mismatch if the JSON is empty stub
  const bundledDb = achievementDb as unknown as AchievementDatabase;

  // 3. Compare timestamps
  let activeDb: AchievementDatabase;

  const localTs = localDb?.timestamp || 0;
  const bundledTs = bundledDb?.timestamp || 0;

  if (localTs > bundledTs) {
    // console.log(`Using local database (Timestamp: ${new Date(localTs).toISOString()})`);
    activeDb = localDb!;
  } else if (bundledTs > 0) {
    // console.log(`Using bundled database (Timestamp: ${new Date(bundledTs).toISOString()})`);
    activeDb = bundledDb;
  } else {
    // Both are empty/invalid
    console.warn('No valid achievement database found.');
    return null;
  }

  return activeDb;
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
  return achievement.masteryRegion || null;
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
