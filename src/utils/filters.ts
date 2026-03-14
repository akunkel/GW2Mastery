import type { EnrichedAchievement, EnrichedCategory, EnrichedGroup } from '../types/enriched';
import type { MasteryRegion } from '../types/mastery';

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
 * Filters the enriched hierarchy based on completion status and other criteria.
 * Returns a NEW array of groups, with filtered categories and achievements.
 * Deep clones the structure where necessary to avoid mutating the store.
 */
export function filterEnrichedHierarchy(
  groups: EnrichedGroup[],
  showCompleted: boolean,
  masteryRegion?: MasteryRegion,
  searchTerm?: string
): EnrichedGroup[] {
  return groups
    .map((group) => {
      const filteredCategories = group.categories
        .map((cat) => {
          const filteredAchievements = cat.achievements.filter((ach) => {
            if (masteryRegion && ach.masteryRegion !== masteryRegion) return false;
            if (!showCompleted && ach.progress?.done) return false;
            if (searchTerm && !ach.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
          });

          if (filteredAchievements.length === 0) return null;
          return { ...cat, achievements: filteredAchievements };
        })
        .reduce<EnrichedCategory[]>((acc, cat) => {
          if (cat) acc.push(cat);
          return acc;
        }, []);

      if (filteredCategories.length === 0) return null;
      return { ...group, categories: filteredCategories };
    })
    .reduce<EnrichedGroup[]>((acc, group) => {
      if (group) acc.push(group);
      return acc;
    }, []);
}
