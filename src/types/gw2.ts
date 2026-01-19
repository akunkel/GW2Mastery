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
    bits?: { text?: string }[];
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
