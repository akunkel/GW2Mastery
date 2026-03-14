import type { Achievement, AchievementCategory, AchievementGroup, AccountAchievement } from './achievement';
import type { MasteryRegion } from './mastery';

export interface EnrichedCategory extends Omit<AchievementCategory, 'achievements'> {
  achievements: EnrichedAchievement[];
  totalCount: number;
  completedCount: number;
}

export interface EnrichedGroup extends Omit<AchievementGroup, 'categories'> {
  categories: EnrichedCategory[];
  totalCount: number;
  completedCount: number;
}

export interface EnrichedAchievement extends Achievement {
  progress?: AccountAchievement;
  masteryRegion?: MasteryRegion;
  category?: string;
  categoryId?: number;
  categoryOrder?: number;
  groupId?: string;
  groupName?: string;
  groupOrder?: number;
  /** Override wiki link from achievement metadata */
  wikiUrl?: string;
  /** Note from achievement metadata */
  note?: string;
  /** Threshold from metadata to treat achievement as done */
  doneCount?: number;
  /** Override the number of mastery points this achievement is worth */
  masteryPoints?: number;
}
