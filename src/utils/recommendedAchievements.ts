import { RECOMMENDED_ACHIEVEMENT_IDS } from '../data/recommendedMasteryAchievements';

const allRecommendedIds = new Set<number>(
  Object.values(RECOMMENDED_ACHIEVEMENT_IDS).flat()
);

export function isRecommended(achievementId: number): boolean {
  return allRecommendedIds.has(achievementId);
}
