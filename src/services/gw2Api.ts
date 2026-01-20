import type {
    AccountAchievement,
    Achievement,
    AchievementCategory,
    AchievementGroup,
    AchievementDatabase,
    MasteryRegion,
    RawAchievement,
} from '../types/gw2';
import achievementDb from '../data/achievementDb.json';
import { getAchievementDatabase, saveAchievementDatabase } from '../utils/storage';

const includeDebugFields = import.meta.env.DEV;

/**
 * Returns the status of the achievement database (timestamps)
 */
/**
 * Returns the status of the achievement database (timestamps)
 */
export async function getDatabaseStatus() {
    const localDb = await getAchievementDatabase();
    const bundledDb = achievementDb as unknown as AchievementDatabase;
    const localTs = localDb?.timestamp || 0;
    const bundledTs = bundledDb?.timestamp || 0;

    return {
        localTs,
        bundledTs,
        activeTs: Math.max(localTs, bundledTs),
    };
}

const BASE_URL = 'https://api.guildwars2.com/v2';
const PARALLEL_REQUESTS = 4; // Parallel requests to stay under API rate limit (5/sec)

/**
 * Builds the achievement database by fetching all achievements
 * This should be called manually via the "Build Database" button
 */
export async function buildAchievementDatabase(
    onProgress?: (current: number, total: number) => void
): Promise<AchievementDatabase> {
    // 1. Start fetching categories (don't await yet)
    const categoriesPromise = fetchAchievementCategories();

    // 2. Fetch Achievements
    // Get all achievement IDs
    const idsResponse = await fetch(`${BASE_URL}/achievements`);
    if (!idsResponse.ok) {
        throw new Error(`Failed to fetch achievement IDs: ${idsResponse.statusText}`);
    }
    const allIds = (await idsResponse.json()) as number[];

    // Create batches of achievement IDs
    const batchSize = 200;
    const batches: number[][] = [];
    for (let i = 0; i < allIds.length; i += batchSize) {
        batches.push(allIds.slice(i, i + batchSize));
    }

    const totalBatches = batches.length;
    const ids: number[] = [];
    const achievements: Achievement[] = [];
    const rawAchievements: RawAchievement[] = [];

    // Process batches in parallel groups to stay under rate limits
    for (let i = 0; i < batches.length; i += PARALLEL_REQUESTS) {
        const parallelBatches = batches.slice(i, i + PARALLEL_REQUESTS);

        // Fetch multiple batches in parallel
        const results = await Promise.all(
            parallelBatches.map(async (batchIds) => {
                const response = await fetch(`${BASE_URL}/achievements?ids=${batchIds.join(',')}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch achievements batch: ${response.statusText}`);
                }
                return (await response.json()) as RawAchievement[];
            })
        );

        // Process results
        results.forEach((batchData) => {
            batchData.forEach((raw) => {
                ids.push(raw.id);

                // Optimize: Map raw API data to our optimized structure
                const optimized: Achievement = {
                    id: raw.id,
                    name: raw.name,
                    requirement: raw.requirement,
                };

                if (raw.icon) {
                    optimized.icon = raw.icon;
                }

                const region = raw.rewards?.find((r) => r.type === 'Mastery')?.region;
                if (region) {
                    optimized.masteryRegion = region as MasteryRegion;
                }

                if (raw.bits && raw.bits.length > 0) {
                    optimized.bits = raw.bits.map((b, index) => {
                        const bit: { text?: string } = {};
                        if (b.text) {
                            bit.text = b.text;
                        } else {
                            // When there is no text, use the type instead.
                            bit.text = `${b.type} ${index + 1}`;
                        }
                        return bit;
                    });
                }

                rawAchievements.push(raw);
                achievements.push(optimized);
            });
        });

        // Report progress
        const currentBatch = Math.min(i + PARALLEL_REQUESTS, totalBatches);
        if (onProgress) {
            onProgress(currentBatch, totalBatches);
        }
    }

    // Await categories fetch to complete
    const categories = await categoriesPromise;

    // 4. Fetch all groups
    const groupsResponse = await fetch('https://api.guildwars2.com/v2/achievements/groups?ids=all');
    if (!groupsResponse.ok) throw new Error('Failed to fetch groups');
    const groupsRaw = await groupsResponse.json();

    // Validate groups
    const groups = groupsRaw.map((g: AchievementGroup) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        order: g.order,
        categories: g.categories,
    }));

    // Create database object with timestamp
    const db: AchievementDatabase = {
        timestamp: Date.now(),
        achievements,
        categories,
        groups,
    };

    // Save to localStorage for immediate use
    await saveAchievementDatabase(db);

    console.log('=== Database Build Complete ===');
    if (includeDebugFields) {
        console.log(`Raw achievments: ${rawAchievements.length}`);
        console.log(JSON.stringify(
            {
                ...db,
                achievements: rawAchievements,
            }));
    }
    console.log(`Achievements: ${achievements.length}`);
    console.log(JSON.stringify(db));

    return db;
}

/**
 * Gets ALL achievements from the database, either from local storage or json, whichever is newer.
 */
export async function getDbAchievements(): Promise<AchievementDatabase | null> {
    // 1. Get local storage version
    const localDb = await getAchievementDatabase();

    // 2. Get bundled version
    // We handle the potential type mismatch if the JSON is empty stub
    const bundledDb = achievementDb as unknown as AchievementDatabase;

    // 3. Compare timestamps
    let activeDb: AchievementDatabase;

    const localTs = localDb?.timestamp || 0;
    const bundledTs = bundledDb?.timestamp || 0;

    if (localTs > bundledTs) {
        activeDb = localDb!;
    } else if (bundledTs > 0) {
        activeDb = bundledDb;
    } else {
        // Both are empty/invalid
        console.warn('No valid achievement database found.');
        return null;
    }

    return activeDb;
}

/**
 * Fetches account-specific achievement progress
 */
export async function fetchAccountAchievements(apiKey: string): Promise<AccountAchievement[]> {
    try {
        const response = await fetch(`${BASE_URL}/account/achievements?access_token=${apiKey}`);

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Invalid API key or insufficient permissions');
            }
            throw new Error(`Failed to fetch account achievements: ${response.statusText}`);
        }

        const data = await response.json();
        return data as AccountAchievement[];
    } catch (error) {
        console.error('Failed to fetch account achievements:', error);
        throw error;
    }
}

/**
 * Fetches all achievement categories
 */
export async function fetchAchievementCategories(): Promise<AchievementCategory[]> {
    try {
        // Get all category IDs
        const idsResponse = await fetch(`${BASE_URL}/achievements/categories`);
        if (!idsResponse.ok) {
            throw new Error(`Failed to fetch category IDs: ${idsResponse.statusText}`);
        }
        const categoryIds = (await idsResponse.json()) as number[];

        // Create batches of category IDs
        const batchSize = 200;
        const batches: number[][] = [];
        for (let i = 0; i < categoryIds.length; i += batchSize) {
            batches.push(categoryIds.slice(i, i + batchSize));
        }

        const categories: AchievementCategory[] = [];

        // Process batches in parallel groups to stay under rate limits
        for (let i = 0; i < batches.length; i += PARALLEL_REQUESTS) {
            const parallelBatches = batches.slice(i, i + PARALLEL_REQUESTS);

            // Fetch multiple batches in parallel
            const results = await Promise.all(
                parallelBatches.map(async (batchIds) => {
                    const response = await fetch(
                        `${BASE_URL}/achievements/categories?ids=${batchIds.join(',')}`
                    );
                    if (!response.ok) {
                        throw new Error(`Failed to fetch categories: ${response.statusText}`);
                    }
                    return (await response.json()) as AchievementCategory[];
                })
            );

            // Collect results
            results.forEach((batchData) => {
                categories.push(...batchData);
            });
        }

        return categories;
    } catch (error) {
        console.error('Failed to fetch achievement categories:', error);
        throw error;
    }
}

/**
 * Gets the mastery region for an achievement
 */
export function getMasteryRegion(achievement: Achievement): string | null {
    return achievement.masteryRegion || null;
}
