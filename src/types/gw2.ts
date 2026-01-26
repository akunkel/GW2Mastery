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

export interface RawAchievement {
  id: number;
  name: string;
  description: string;
  requirement: string;
  locked_text?: string;
  type: string;
  flags: string[];
  tiers: unknown[];
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

// Subset of RawAchievment, stripping unused fields to reduce json size.
export interface Achievement extends Omit<
  RawAchievement,
  | 'description'
  | 'locked_text'
  | 'type'
  | 'flags'
  | 'tiers'
  | 'prerequisites'
  | 'rewards'
  | 'bits'
  | 'point_cap'
> {
  masteryRegion?: MasteryRegion | null;
  bits?: { text?: string; }[];
  raw?: RawAchievement;
}

export interface EnrichedCategory extends Omit<AchievementCategory, 'achievements'> {
  achievements: EnrichedAchievement[];
  totalPoints: number;
  earnedPoints: number;
  totalCount: number;
  completedCount: number;
}

export interface EnrichedGroup extends Omit<AchievementGroup, 'categories'> {
  categories: EnrichedCategory[];
  totalPoints: number;
  earnedPoints: number;
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

// Map Completion Types

export interface GW2Map {
  id: number;
  name: string;
  min_level: number;
  max_level: number;
  default_floor: number;
  type: string;
  floors: number[];
  region_id: number;
  region_name: string;
  continent_id: number;
  continent_name: string;
  map_rect: [[number, number], [number, number]];
  continent_rect: [[number, number], [number, number]];
}

export interface PointOfInterest {
  id: number;
  name: string;
  type: string;
  coord: [number, number];
  floor: number;
  chat_link?: string;
  icon?: string;
}

export interface Task {
  id: number;
  objective: string;
  level: number;
  coord: [number, number];
  bounds?: [number, number][];
  chat_link?: string;
}

export interface Sector {
  id: number;
  name: string;
  level: number;
  coord: [number, number];
  bounds?: [number, number][];
  chat_link?: string;
}

export interface SkillChallenge {
  id: string;
  coord: [number, number];
}

export interface MasteryPoint {
  id: number;
  region: string;
  coord: [number, number];
}

export interface Adventure {
  id: string;
  name: string;
  description: string;
  coord: [number, number];
}

export interface ContinentMapData {
  id: number;
  name: string;
  min_level: number;
  max_level: number;
  default_floor: number;
  type?: string; // Map type: "Public", "Instance", "Activity", etc.
  masteryRegion?: MasteryRegion;
  map_rect: [[number, number], [number, number]];
  continent_rect: [[number, number], [number, number]];
  points_of_interest?: PointOfInterest[];
  tasks?: Task[];
  skill_challenges?: SkillChallenge[];
  sectors?: Sector[];
  adventures?: Adventure[];
  mastery_points?: MasteryPoint[];
}

export interface ContinentRegion {
  id: number;
  name: string;
  label_coord: [number, number];
  continent_rect: [[number, number], [number, number]];
  maps: Record<number, ContinentMapData>;
}

export interface ContinentFloor {
  texture_dims: [number, number];
  clamped_view?: [[number, number], [number, number]];
  regions: Record<number, ContinentRegion>;
}

export interface ContinentDatabase {
  timestamp: number;
  continentId: number;
  floorId: number;
  continentDims: [number, number];
  floor: ContinentFloor;
}

export interface RenderedZone {
  id: number;
  name: string;
  polygonPoints: string;
  center: [number, number];
  minLevel: number;
  maxLevel: number;
  regionName: string;
  masteryRegion?: MasteryRegion;
}
