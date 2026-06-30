import noveltyDb from '../data/noveltyDb.json';

import type { NoveltyDatabase } from '../types/novelty';
import { getNoveltyDatabase } from '../utils/storage';

export async function getNoveltyData(): Promise<NoveltyDatabase | null> {
  const localDb = await getNoveltyDatabase();
  const bundledDb = noveltyDb as unknown as NoveltyDatabase;

  const localTs = localDb?.timestamp || 0;
  const bundledTs = bundledDb?.timestamp || 0;

  if (localTs > bundledTs) {
    return localDb!;
  } else if (bundledTs > 0) {
    return bundledDb;
  }

  return null;
}
