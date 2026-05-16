import type { AchievementCategory } from '../types/achievement';
import { BASE_URL } from './apiConfig';

const PARALLEL_REQUESTS = 4;
const BATCH_SIZE = 200;

export interface AchievementsParams {
  ids?: string;
  lang?: string;
}

export interface AchievementCategoriesParams {
  ids?: string;
  lang?: string;
}

async function fetchApi(path: string, params: Record<string, string>): Promise<unknown> {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${path}${query ? `?${query}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json();
}

export function queryAchievements({ ids, lang }: AchievementsParams): Promise<unknown> {
  const params: Record<string, string> = {};
  if (ids) params.ids = ids;
  if (lang) params.lang = lang;
  return fetchApi('/achievements', params);
}

export async function queryAchievementCategories({ ids, lang = 'en' }: AchievementCategoriesParams): Promise<AchievementCategory[]> {
  if (ids) {
    return fetchApi('/achievements/categories', { ids, lang }) as Promise<AchievementCategory[]>;
  }

  // Fetch all IDs first, then batch-fetch to stay under rate limits
  const idsResponse = await fetch(`${BASE_URL}/achievements/categories?lang=${lang}`);
  if (!idsResponse.ok) {
    throw new Error(`Failed to fetch category IDs: ${idsResponse.statusText}`);
  }
  const categoryIds = (await idsResponse.json()) as number[];

  const batches: number[][] = [];
  for (let i = 0; i < categoryIds.length; i += BATCH_SIZE) {
    batches.push(categoryIds.slice(i, i + BATCH_SIZE));
  }

  const categories: AchievementCategory[] = [];
  for (let i = 0; i < batches.length; i += PARALLEL_REQUESTS) {
    const results = await Promise.all(
      batches.slice(i, i + PARALLEL_REQUESTS).map(async (batchIds) => {
        const response = await fetch(
          `${BASE_URL}/achievements/categories?ids=${batchIds.join(',')}&lang=${lang}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }
        return (await response.json()) as AchievementCategory[];
      })
    );
    results.forEach((batchData) => categories.push(...batchData));
  }

  return categories;
}
