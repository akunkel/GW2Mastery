import { getMasteryRegion } from '../services/gw2Api';
import type {
  AccountAchievement,
  Achievement,
  EnrichedAchievement,
  AchievementCategory,
  AchievementGroup,
  EnrichedCategory,
  EnrichedGroup,
  FilterType,
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
 * Gets the required points to unloack all masteries for each region.
 */
export const REQUIRED_COUNTS: Record<MasteryRegion, number> = {
  Tyria: 49,
  Maguuma: 144,
  Desert: 110,
  Tundra: 63,
  Jade: 89,
  Sky: 88,
  Wild: 90,
  Magic: 38,
};

export function getRequiredCounts(): Record<MasteryRegion, number> {
  return REQUIRED_COUNTS;
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
  allAchievements.forEach(ach => {
    const progress = accountProgress.get(ach.id);
    achievementMap.set(ach.id, {
      ...ach,
      progress,
      masteryRegion: getMasteryRegion(ach) as MasteryRegion,
    });
  });

  // 2. Build Enriched Categories (and link achievements)
  categories.forEach(cat => {
    const catAchievements: EnrichedAchievement[] = [];
    let totalPoints = 0;
    let earnedPoints = 0;
    let totalCount = 0;
    let completedCount = 0;

    cat.achievements.forEach(achId => {
      const ach = achievementMap.get(achId);
      if (ach) {
        // Update achievement with category info
        ach.categoryId = cat.id;
        ach.category = cat.name;
        ach.categoryOrder = cat.order;

        catAchievements.push(ach);

        // Stats
        // Mastery achievements usually give 1 point, but let's assume 1 for now or check rewards later if needed
        const points = 1;
        totalPoints += points; // Adjust if achievements strictly imply Points vs Mastery Points
        totalCount++;

        if (ach.progress?.done) {
          earnedPoints += points;
          completedCount++;
        }
      }
    });

    const enrichedCat: EnrichedCategory = {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      order: cat.order,
      icon: cat.icon,
      achievements: catAchievements,
      totalPoints,
      earnedPoints,
      totalCount,
      completedCount,
    };
    categoryMap.set(cat.id, enrichedCat);
  });

  // 3. Build Enriched Groups (and link categories)
  const enrichedGroups: EnrichedGroup[] = groups.map(group => {
    const groupCategories: EnrichedCategory[] = [];
    let totalPoints = 0;
    let earnedPoints = 0;
    let totalCount = 0;
    let completedCount = 0;

    group.categories.forEach(catId => {
      const cat = categoryMap.get(catId);
      if (cat) {
        // Link Group info to achievements in this category
        cat.achievements.forEach(ach => {
          ach.groupId = group.id;
          ach.groupName = group.name;
          ach.groupOrder = group.order;
        });

        groupCategories.push(cat);
        totalPoints += cat.totalPoints;
        earnedPoints += cat.earnedPoints;
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
      totalPoints,
      earnedPoints,
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
  filter: FilterType,
  _requiredOnly: boolean, // For goal === 'required' (Mastery specific logic usually)
  masteryRegion?: MasteryRegion, // Optional: Filter by specific mastery region
  searchTerm?: string
): EnrichedGroup[] {

  return groups.map(group => {
    // 1. Filter Categories
    const filteredCategories = group.categories.map(cat => {
      // 2. Filter Achievements
      const filteredAchievements = cat.achievements.filter(ach => {
        // Region Filter (if provided, usually at group level, but good to check)
        if (masteryRegion && ach.masteryRegion !== masteryRegion) return false;

        // Completion Filter
        if (filter === 'incomplete' && ach.progress?.done) return false;

        // Term Filter (Future proofing)
        if (searchTerm && !ach.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

        return true;
      });

      if (filteredAchievements.length === 0) return null;

      // Return new category object with filtered achievements
      return {
        ...cat,
        achievements: filteredAchievements,
        // Note: Counts here should probably reflect the *filtered* counts? 
        // Or keep original totals? Usually UI wants to show "X / Y" where Y is total available.
        // Let's keep original counts for context, but the *list* is filtered.
      };
    }).reduce<EnrichedCategory[]>((acc, cat) => {
      if (cat) acc.push(cat);
      return acc;
    }, []);

    if (filteredCategories.length === 0) return null;

    // Return new group object with filtered categories
    return {
      ...group,
      categories: filteredCategories
    };
  }).reduce<EnrichedGroup[]>((acc, group) => {
    if (group) acc.push(group);
    return acc;
  }, []);
}
