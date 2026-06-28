import historicalCategories from '../data/historicalCategories.json';

import { buildItemNameDatabase } from './buildItemNameDatabase';
import { queryAchievementCategories } from '../services/achievementsApi';
import { BASE_URL } from '../services/apiConfig';
import type {
  Achievement,
  AchievementCategory,
  AchievementDatabase,
  RawAchievement,
} from '../types/achievement';
import type { MasteryRegion } from '../types/mastery';

const excludedAchievementNames = ['Daily', 'Weekly'];
const historicalCategoryIds = new Set(historicalCategories.categories);
const excludedCategoryNames = ['Retired Achievements', 'Adventure Guide:'];

// Parallel requests to stay under API rate limit (5/sec)
const PARALLEL_REQUESTS = 4;

export interface AchievementFetchResult {
  /** Relevant raw achievements after historical/excluded/non-permanent filtering. */
  rawAchievements: RawAchievement[];
  /** Categories with historical ones stripped (what the app displays). */
  categories: AchievementCategory[];
  /** The unfiltered category list, for diagnostics (e.g. detecting new historical categories). */
  allCategories: AchievementCategory[];
}

/**
 * Fetches all achievements and categories from the API and applies the relevance filters
 * (drops Daily/Weekly, historical-category achievements, excluded-category achievements, and
 * non-permanent achievements). Returns the filtered raw data without persisting anything.
 */
export async function fetchAchievementData(
  lang: string = 'en',
  onProgress?: (current: number, total: number) => void
): Promise<AchievementFetchResult> {
  // 1. Start fetching categories (don't await yet)
  const categoriesPromise = queryAchievementCategories({ lang });

  // 2. Fetch all achievement IDs
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

    const results = await Promise.all(
      parallelBatches.map(async (batchIds) => {
        const response = await fetch(`${BASE_URL}/achievements?ids=${batchIds.join(',')}&lang=${lang}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch achievements batch: ${response.statusText}`);
        }
        return (await response.json()) as RawAchievement[];
      })
    );

    results.forEach((batchData) => {
      allRawAchievements.push(...batchData);
    });

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

  return { rawAchievements, categories, allCategories };
}

/**
 * Transforms filtered raw achievements into the optimized, bundled database structure.
 * `itemNames` resolves the display text of `Item`-type achievement bits; bits whose item ID
 * is missing fall back to a generic `Item N` label.
 */
export function toAchievementDatabase(
  rawAchievements: RawAchievement[],
  categories: AchievementCategory[],
  itemNames: Record<number, string>
): AchievementDatabase {
  const achievements: Achievement[] = [];
  for (const raw of rawAchievements) {
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
        } else if (b.type === 'Item' && b.id != null) {
          bit.text = itemNames[b.id] ?? `${b.type} ${index + 1}`;
        } else {
          bit.text = `${b.type} ${index + 1}`;
        }
        return bit;
      });
    }

    achievements.push(optimized);
  }

  return {
    timestamp: Date.now(),
    achievements,
    categories,
    groups: [],
  };
}

/**
 * Builds the achievement database end to end: fetches and filters achievements, resolves item
 * bit names from the live /items endpoint, and returns the optimized database. Does not persist —
 * callers (the store) own persistence. The build-data script composes the lower-level
 * `fetchAchievementData` / `buildItemNameDatabase` / `toAchievementDatabase` directly when it
 * also needs the raw achievements.
 */
export async function buildAchievementDatabase(
  onProgress?: (current: number, total: number) => void,
  lang: string = 'en'
): Promise<AchievementDatabase> {
  const { rawAchievements, categories } = await fetchAchievementData(lang, onProgress);
  const { names } = await buildItemNameDatabase(rawAchievements);
  return toAchievementDatabase(rawAchievements, categories, names);
}
