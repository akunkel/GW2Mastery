import rawAchievementDb from '../../../data/rawAchievementDb.json';
import { BASE_URL } from '../../../services/apiConfig';
import type { DebugViewConfig } from '../types';

interface AchievementBit {
  type: string;
  id?: number;
}

interface RawAchievement {
  bits?: AchievementBit[];
}

async function buildItemNameDatabase(): Promise<unknown> {
  const ids = new Set<number>();
  for (const achievement of (rawAchievementDb as { achievements: RawAchievement[]; }).achievements) {
    for (const bit of achievement.bits ?? []) {
      if (bit.type === 'Item' && bit.id != null) {
        ids.add(bit.id);
      }
    }
  }

  const uniqueIds = [...ids];
  const batchSize = 200;
  const batches: number[][] = [];
  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    batches.push(uniqueIds.slice(i, i + batchSize));
  }

  // Fetch up to 4 batches in parallel to stay under rate limits
  const allItems: { id: number; name: string; type: string; }[] = [];
  for (let i = 0; i < batches.length; i += 4) {
    const chunk = batches.slice(i, i + 4);
    const results = await Promise.all(
      chunk.map(async (batch) => {
        const url = `${BASE_URL}/items?ids=${batch.join(',')}`;
        const response = await fetch(url);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`${response.status} ${response.statusText}: ${text}`);
        }
        return response.json() as Promise<{ id: number; name: string; type: string; }[]>;
      })
    );
    allItems.push(...results.flat());
  }

  const idToName: Record<number, string> = {};
  for (const item of allItems) {
    idToName[item.id] = item.name;
  }
  return idToName;
}

export const itemNameDatabaseBuilderView: DebugViewConfig = {
  label: 'Item Name DB Builder',
  description:
    'Parses rawAchievementDb.json for all achievement bits of type "Item", fetches them from the API, and returns an ID-to-name mapping.',
  queryFn: buildItemNameDatabase,
  params: [],
};
