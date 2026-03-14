import { ACHIEVEMENT_METADATA } from '../data/achievementMetadata';
import { getMasteryRegion } from '../services/gw2Api';
import type {
  AccountAchievement,
  Achievement,
  AchievementCategory,
  AchievementGroup,
} from '../types/achievement';
import type { EnrichedAchievement, EnrichedCategory, EnrichedGroup } from '../types/enriched';
import type { MasteryRegion } from '../types/mastery';

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
    let progress = accountProgress.get(ach.id);
    const metadata = ACHIEVEMENT_METADATA[ach.id];
    const meetsThreshold = metadata?.doneCount != null && (progress?.current ?? 0) >= metadata.doneCount;
    if (progress && meetsThreshold && !progress.done) {
      progress = { ...progress, done: true };
    }
    achievementMap.set(ach.id, {
      ...ach,
      progress,
      masteryRegion: getMasteryRegion(ach) as MasteryRegion,
      wikiUrl: metadata?.wikiUrl,
      note: metadata?.note,
      doneCount: metadata?.doneCount,
      masteryPoints: metadata?.masteryPoints,
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
