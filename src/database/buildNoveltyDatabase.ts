import { queryNovelties } from '../services/noveltiesApi';
import type { RawAchievement } from '../types/achievement';
import type { NoveltyDatabase, NoveltyEntry } from '../types/novelty';

export async function buildNoveltyDatabase(
  rawAchievements: RawAchievement[],
  lang: string = 'en',
): Promise<NoveltyDatabase> {
  const apiNovelties = await queryNovelties(lang);

  // Build a map: item ID → achievement IDs whose rewards include that item
  const itemToAchievements = new Map<number, number[]>();
  for (const achievement of rawAchievements) {
    if (!achievement.rewards) continue;
    for (const reward of achievement.rewards) {
      if (reward.type === 'Item' && reward.id != null) {
        const list = itemToAchievements.get(reward.id);
        if (list) {
          list.push(achievement.id);
        } else {
          itemToAchievements.set(reward.id, [achievement.id]);
        }
      }
    }
  }

  const novelties: NoveltyEntry[] = apiNovelties.map((n) => {
    // Cross-reference unlock_item IDs with achievement reward item IDs
    const achievementIds: number[] = [];
    if (n.unlock_item) {
      for (const itemId of n.unlock_item) {
        const linked = itemToAchievements.get(itemId);
        if (linked) {
          achievementIds.push(...linked);
        }
      }
    }

    return {
      id: n.id,
      name: n.name,
      description: n.description,
      icon: n.icon,
      slot: n.slot,
      achievementIds,
    };
  });

  return {
    timestamp: Date.now(),
    novelties,
  };
}
