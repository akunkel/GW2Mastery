import { getMasteryRegion } from '../services/gw2Api';
import type {
  AccountAchievement,
  Achievement,
  EnrichedAchievement,
  FilterType,
  MasteryPointSummary,
  MasteryRegion,
} from '../types/gw2';

/**
 * Filters achievements by completion status
 */
export function filterByCompletion(
  achievements: Achievement[],
  accountProgress: Map<number, AccountAchievement>,
  filter: FilterType
): Achievement[] {
  if (filter === 'all') {
    return achievements;
  }

  // filter === 'incomplete'
  return achievements.filter((achievement) => {
    const progress = accountProgress.get(achievement.id);
    return !progress || progress.done === false;
  });
}

/**
 * Groups achievements by mastery region
 */
export function groupByCategory(
  achievements: Achievement[]
): Map<MasteryRegion, Achievement[]> {
  const grouped = new Map<MasteryRegion, Achievement[]>();

  achievements.forEach((achievement) => {
    const region = getMasteryRegion(achievement) as MasteryRegion;

    if (region) {
      if (!grouped.has(region)) {
        grouped.set(region, []);
      }
      grouped.get(region)!.push(achievement);
    }
  });

  return grouped;
}

/**
 * Enriches achievements with account progress data and category information
 */
export function enrichAchievements(
  achievements: Achievement[],
  accountProgress: Map<number, AccountAchievement>,
  categoryMap?: Map<number, { categoryId: number; categoryName: string; }>
): EnrichedAchievement[] {
  return achievements.map((achievement) => {
    const categoryInfo = categoryMap?.get(achievement.id);
    return {
      ...achievement,
      progress: accountProgress.get(achievement.id),
      masteryRegion: getMasteryRegion(achievement) as MasteryRegion,
      category: categoryInfo?.categoryName,
      categoryId: categoryInfo?.categoryId,
    };
  });
}

/**
 * Groups enriched achievements by region and then by category
 */
export function groupByRegionAndCategory(
  achievements: EnrichedAchievement[]
): Map<MasteryRegion, Map<string, EnrichedAchievement[]>> {
  const grouped = new Map<MasteryRegion, Map<string, EnrichedAchievement[]>>();

  achievements.forEach((achievement) => {
    const region = achievement.masteryRegion;
    const category = achievement.category || 'Uncategorized';

    if (region) {
      if (!grouped.has(region)) {
        grouped.set(region, new Map());
      }

      const regionMap = grouped.get(region)!;
      if (!regionMap.has(category)) {
        regionMap.set(category, []);
      }

      regionMap.get(category)!.push(achievement);
    }
  });

  return grouped;
}

/**
 * Calculates total mastery points earned and available
 */
export function calculateTotalMasteryPoints(
  achievements: Achievement[],
  accountProgress: Map<number, AccountAchievement>
): MasteryPointSummary {
  let earned = 0;
  let total = 0;
  const byRegion = new Map<MasteryRegion, { earned: number; total: number; }>();

  achievements.forEach((achievement) => {
    const progress = accountProgress.get(achievement.id);
    const region = getMasteryRegion(achievement) as MasteryRegion;

    // Each mastery achievement awards 1 point
    const points = 1;
    total += points;

    if (progress?.done) {
      earned += points;
    }

    if (region) {
      if (!byRegion.has(region)) {
        byRegion.set(region, { earned: 0, total: 0 });
      }

      const regionStats = byRegion.get(region)!;
      regionStats.total += points;
      if (progress?.done) {
        regionStats.earned += points;
      }
    }
  });

  return { earned, total, byRegion };
}

/**
 * Gets a display name for a mastery region
 */
export function getRegionDisplayName(region: MasteryRegion): string {
  const regionNames: Record<MasteryRegion, string> = {
    Tyria: 'Core Tyria',
    Maguuma: 'Heart of Thorns',
    Desert: 'Path of Fire',
    Tundra: 'Icebrood Saga',
    Jade: 'End of Dragons',
    Sky: 'Secrets of the Obscure',
    Wild: 'Janthir Wilds',
    Magic: 'Visions of Eternity',
  };

  return regionNames[region] || region;
}

/**
 * Gets the required achievement counts for each mastery region
 * Based on the chart data provided
 */
export function getRequiredCounts(): Record<MasteryRegion, number> {
  return {
    Tyria: 49,
    Maguuma: 144,
    Desert: 110,
    Tundra: 63,
    Jade: 89,
    Sky: 88,
    Wild: 90,
    Magic: 38,
  };
}
