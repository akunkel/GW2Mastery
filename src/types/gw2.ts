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

export interface AchievementTier {
  count: number;
  points: number;
}

export interface MasteryReward {
  type: 'Mastery';
  id: number;
  region: MasteryRegion;
}

export interface CoinReward {
  type: 'Coins';
  count: number;
}

export interface ItemReward {
  type: 'Item';
  id: number;
  count: number;
}

export interface TitleReward {
  type: 'Title';
  id: number;
}

export type AchievementReward = MasteryReward | CoinReward | ItemReward | TitleReward;

export interface AchievementBit {
  type: string;
  id?: number;
  text?: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  requirement: string;
  locked_text?: string;
  type: string;
  flags: string[];
  tiers: AchievementTier[];
  icon?: string;
  prerequisites?: number[];
  rewards?: AchievementReward[];
  bits?: AchievementBit[];
  point_cap?: number;
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
