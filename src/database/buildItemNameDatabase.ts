import { BASE_URL } from '../services/apiConfig';
import type { RawAchievement } from '../types/achievement';

const BATCH_SIZE = 200;
// Parallel requests to stay under the API rate limit (5/sec).
const PARALLEL_REQUESTS = 4;

export interface ItemNameDatabase {
  /** Map of item ID to display name. */
  names: Record<number, string>;
  /** Item IDs referenced by achievement bits that the API did not return. */
  unresolvedIds: number[];
}

/**
 * Collects every `Item` bit referenced by the given achievements and resolves each item ID
 * to its name via the GW2 /items endpoint. Persistence-free and parameterized on the
 * achievements so it can run from both the in-browser build flow and the offline
 * build-data script without reading a bundled JSON file.
 */
export async function buildItemNameDatabase(
  achievements: RawAchievement[]
): Promise<ItemNameDatabase> {
  const ids = new Set<number>();
  for (const achievement of achievements) {
    for (const bit of achievement.bits ?? []) {
      if (bit.type === 'Item' && bit.id != null) {
        ids.add(bit.id);
      }
    }
  }

  const uniqueIds = [...ids];
  const batches: number[][] = [];
  for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
    batches.push(uniqueIds.slice(i, i + BATCH_SIZE));
  }

  const names: Record<number, string> = {};
  for (let i = 0; i < batches.length; i += PARALLEL_REQUESTS) {
    const results = await Promise.all(
      batches.slice(i, i + PARALLEL_REQUESTS).map(async (batch) => {
        const response = await fetch(`${BASE_URL}/items?ids=${batch.join(',')}`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`${response.status} ${response.statusText}: ${text}`);
        }
        return response.json() as Promise<{ id: number; name: string; }[]>;
      })
    );
    for (const item of results.flat()) {
      names[item.id] = item.name;
    }
  }

  const unresolvedIds = uniqueIds.filter((id) => names[id] === undefined);
  return { names, unresolvedIds };
}
