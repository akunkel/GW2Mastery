import type { MasteryRegion } from './mastery';

export interface RawAchievement {
  id: number;
  name: string;
  description: string;
  requirement: string;
  locked_text?: string;
  type: string;
  flags: string[];
  tiers: {
    count: number;
    points: number;
  }[];
  icon?: string; // Optional in raw, but we pick it
  prerequisites?: number[];
  rewards?: {
    type: string;
    id?: number;
    count?: number;
    region?: string; // Raw API region string (e.g., "Maguuma")
  }[];
  bits?: {
    type: string;
    id?: number;
    text?: string;
  }[];
  point_cap?: number;
}

export interface AchievementDatabase {
  timestamp: number;
  achievements: Achievement[];
  categories: AchievementCategory[];
  groups: AchievementGroup[];
}

export interface AchievementGroup {
  id: string;
  name: string;
  description: string;
  order: number;
  categories: number[];
}

export interface AchievementCategory {
  id: number;
  name: string;
  description: string;
  order: number;
  icon?: string;
  achievements: number[];
}

// Subset of RawAchievement, stripping unused fields to reduce json size.
export interface Achievement extends Omit<
  RawAchievement,
  | 'description'
  | 'locked_text'
  | 'type'
  | 'tiers'
  | 'prerequisites'
  | 'rewards'
  | 'bits'
  | 'point_cap'
> {
  masteryRegion?: MasteryRegion | null;
  masteryId?: number; // the mastery reward ID from the API
  bits?: { text?: string; }[];
  raw?: RawAchievement;
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
