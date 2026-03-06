import { getMasteryRegion } from '../services/gw2Api';
import type {
  AccountAchievement,
  Achievement,
  AchievementCategory,
  AchievementGroup,
  EnrichedAchievement,
  EnrichedCategory,
  EnrichedGroup,
  MasteryRegion,
} from '../types/gw2';

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
 * Builds the full enriched hierarchy: Groups -> Categories -> Achievements
 */
export function buildEnrichedHierarchy(
  allAchievements: Achievement[],
  categories: AchievementCategory[],
  groups: AchievementGroup[],
  accountProgress: Map<number, AccountAchievement>
): {
  groups: EnrichedGroup[];
  groupMap: Map<string, EnrichedGroup>;
  categoryMap: Map<number, EnrichedCategory>;
  achievementMap: Map<number, EnrichedAchievement>;
} {
  const achievementMap = new Map<number, EnrichedAchievement>();
  const categoryMap = new Map<number, EnrichedCategory>();
  const groupMap = new Map<string, EnrichedGroup>();

  // 1. Build Enriched Achievements Map (Initial pass, no category/group info yet)
  allAchievements.forEach((ach) => {
    const progress = accountProgress.get(ach.id);
    achievementMap.set(ach.id, {
      ...ach,
      progress,
      masteryRegion: getMasteryRegion(ach) as MasteryRegion,
    });
  });

  // 2. Build Enriched Categories (and link achievements)
  categories.forEach((cat) => {
    const catAchievements: EnrichedAchievement[] = [];
    let totalCount = 0;
    let completedCount = 0;

    cat.achievements.forEach((achId) => {
      const ach = achievementMap.get(achId);
      if (ach) {
        // Update achievement with category info
        ach.categoryId = cat.id;
        ach.category = cat.name;
        ach.categoryOrder = cat.order;

        catAchievements.push(ach);

        totalCount++;
        if (ach.progress?.done) completedCount++;
      }
    });

    const enrichedCat: EnrichedCategory = {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      order: cat.order,
      icon: cat.icon,
      achievements: catAchievements,
      totalCount,
      completedCount,
    };
    categoryMap.set(cat.id, enrichedCat);
  });

  // 3. Build Enriched Groups (and link categories)
  const enrichedGroups: EnrichedGroup[] = groups.map((group) => {
    const groupCategories: EnrichedCategory[] = [];
    let totalCount = 0;
    let completedCount = 0;

    group.categories.forEach((catId) => {
      const cat = categoryMap.get(catId);
      if (cat) {
        // Link Group info to achievements in this category
        cat.achievements.forEach((ach) => {
          ach.groupId = group.id;
          ach.groupName = group.name;
          ach.groupOrder = group.order;
        });

        groupCategories.push(cat);
        totalCount += cat.totalCount;
        completedCount += cat.completedCount;
      }
    });

    // Sort categories explicitly if needed, though usually API order is fine.
    // Ensuring they are sorted by order.
    groupCategories.sort((a, b) => a.order - b.order);

    const enrichedGroup: EnrichedGroup = {
      id: group.id,
      name: group.name,
      description: group.description,
      order: group.order,
      categories: groupCategories,
      totalCount,
      completedCount,
    };
    groupMap.set(group.id, enrichedGroup);
    return enrichedGroup;
  });

  // Sort groups by order
  enrichedGroups.sort((a, b) => a.order - b.order);

  return {
    groups: enrichedGroups,
    groupMap,
    categoryMap,
    achievementMap,
  };
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
