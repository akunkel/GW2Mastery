// Guild Wars 2 API Type Definitions

export type MasteryRegion =
  | 'Tyria'
  | 'Maguuma'
  | 'Desert'
  | 'Tundra'
  | 'Jade'
  | 'Sky'
  | 'Wild'
  | 'Magic';

export type FilterType = 'all' | 'incomplete';

export type GoalType = 'all' | 'required';



export interface Achievement {
  id: number;
  name: string;
  requirement: string;
  icon?: string;
  masteryRegion?: MasteryRegion | null;
  bits?: { text?: string }[];
  rewards?: never; // Ensure we don't accidentally use the old rewards structure
}

export interface AchievementDatabase {
  timestamp: number;
  achievements: Achievement[];
  categories: AchievementCategory[];
}

export interface AchievementCategory {
  id: number;
  name: string;
  description: string;
  order: number;
  icon?: string;
  achievements: number[];
}

export interface AccountAchievement {
  id: number;
  done: boolean;
  current?: number;
  max?: number;
  bits?: number[];
  repeated?: number;
  unlocked?: boolean;
}

export interface EnrichedAchievement extends Achievement {
  progress?: AccountAchievement;
  masteryRegion?: MasteryRegion;
  category?: string;
  categoryId?: number;
  categoryOrder?: number;
}

export interface MasteryPointSummary {
  earned: number;
  total: number;
  byRegion: Map<MasteryRegion, { earned: number; total: number }>;
}
