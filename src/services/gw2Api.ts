import achievementDb from '../data/achievementDb.json';
import continentDb from '../data/continentDb.json';
import type {
  AccountAchievement,
  Achievement,
  AchievementCategory,
  AchievementDatabase,
  AchievementGroup,
  ContinentDatabase,
  ContinentFloor,
  ContinentMapData,
  GW2Map,
  MasteryRegion,
  RawAchievement,
} from '../types/gw2';
import { REGION_ZONES } from '../utils/regionHelpers';
import {
  getAchievementDatabase,
  getContinentDatabase,
  saveAchievementDatabase,
  saveContinentDatabase,
} from '../utils/storage';

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
        // Skip achievements without the Permanent flag
        if (!raw.flags?.includes('Permanent')) return;

        ids.push(raw.id);

        // Optimize: Map raw API data to our optimized structure
        const optimized: Achievement = {
          id: raw.id,
          name: raw.name,
          requirement: raw.requirement,
          flags: raw.flags,
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
            const bit: { text?: string; } = {};
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
    console.log(`Raw achievements: ${rawAchievements.length}`);
    console.log(
      JSON.stringify({
        ...db,
        achievements: rawAchievements,
      })
    );

    // Build map of map name -> achievement IDs using ALL maps from continentDb
    const allMapNames: string[] = [];
    const continentData = continentDb as unknown as ContinentDatabase;
    Object.values(continentData.floor.regions).forEach((region) => {
      Object.values(region.maps).forEach((map) => {
        if (map.name) allMapNames.push(map.name);
      });
    });

    const mapAchievementIds: Record<string, number[]> = {};
    for (const mapName of allMapNames) {
      const escaped = mapName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');

      const matchingIds = rawAchievements
        .filter((raw) => {
          // Check if map name is mentioned in title, description, or requirement
          const searchText = `${raw.name || ''} ${raw.description || ''} ${raw.requirement || ''}`;
          return regex.test(searchText);
        })
        .map((raw) => raw.id);

      if (matchingIds.length > 0) {
        mapAchievementIds[mapName] = matchingIds;
      }
    }

    console.log(`Map achievement IDs (${Object.keys(mapAchievementIds).length} maps):`);
    console.log(JSON.stringify(mapAchievementIds, null, 2));
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

// ===== Continent and Map API Functions =====

/**
 * Fetches continent floor data from the GW2 API
 * @param continentId - The continent ID (1 for Tyria, 2 for Mists)
 * @param floorId - The floor ID (typically 1 for the main world map)
 */
export async function fetchContinentFloor(
  continentId: number,
  floorId: number
): Promise<ContinentFloor> {
  try {
    const response = await fetch(`${BASE_URL}/continents/${continentId}/floors/${floorId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch continent floor: ${response.statusText}`);
    }
    return (await response.json()) as ContinentFloor;
  } catch (error) {
    console.error('Failed to fetch continent floor:', error);
    throw error;
  }
}

/**
 * Fetches map types for all maps in the continent floor data
 */
async function fetchMapTypes(
  floor: ContinentFloor,
  onProgress?: (message: string) => void
): Promise<Record<number, string>> {
  // Extract all map IDs from floor data
  const mapIds: number[] = [];
  Object.values(floor.regions).forEach((region) => {
    Object.keys(region.maps).forEach((mapId) => {
      mapIds.push(Number(mapId));
    });
  });

  if (onProgress) onProgress(`Fetching map types for ${mapIds.length} maps...`);

  // Create batches
  const batchSize = 200;
  const batches: number[][] = [];
  for (let i = 0; i < mapIds.length; i += batchSize) {
    batches.push(mapIds.slice(i, i + batchSize));
  }

  const mapTypes: Record<number, string> = {};

  // Process batches in parallel groups
  for (let i = 0; i < batches.length; i += PARALLEL_REQUESTS) {
    const parallelBatches = batches.slice(i, i + PARALLEL_REQUESTS);

    const results = await Promise.all(
      parallelBatches.map(async (batchIds) => {
        const response = await fetch(`${BASE_URL}/maps?ids=${batchIds.join(',')}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch maps: ${response.statusText}`);
        }
        return (await response.json()) as GW2Map[];
      })
    );

    // Collect map types
    results.forEach((batchData) => {
      batchData.forEach((map) => {
        mapTypes[map.id] = map.type;
      });
    });
  }

  return mapTypes;
}

/**
 * Finds the mastery region for a map based on its name using REGION_ZONES
 */
function findMasteryRegion(mapName: string): MasteryRegion | undefined {
  for (const [region, zones] of Object.entries(REGION_ZONES)) {
    if (zones.includes(mapName)) {
      return region as MasteryRegion;
    }
  }
  return undefined;
}

/**
 * Enriches floor data with map types and filters out non-Public maps
 */
async function enrichAndFilterFloorData(
  floor: ContinentFloor,
  onProgress?: (message: string) => void
): Promise<ContinentFloor> {
  // First, fetch map types for all maps
  const mapTypes = await fetchMapTypes(floor, onProgress);

  // Maps to exclude from the database (non-explorable or special instances)
  const excludedMapNames = ['', "Arborstone", "Noble's Folly", "Labyrinthine Cliffs", "Lion's Arch Aerodrome", "Spiritvale", "The Wizard's Tower", "Windswept Haven"];

  const enrichedFloor: ContinentFloor = {
    texture_dims: floor.texture_dims,
    regions: {},
  };

  // Copy regions, enrich maps with type, and filter out non-Public maps
  Object.entries(floor.regions).forEach(([regionId, region]) => {
    const regionMaps: Record<number, ContinentMapData> = {};

    Object.entries(region.maps).forEach(([mapId, map]) => {
      const mapType = mapTypes[Number(mapId)];

      // Only include Public maps without parentheticals in their name and not in exclusion list
      if (
        mapType === 'Public' &&
        !map.name.includes('(') &&
        !excludedMapNames.includes(map.name)
      ) {
        const mapData: ContinentMapData = {
          id: map.id,
          name: map.name,
          min_level: map.min_level,
          max_level: map.max_level,
          default_floor: map.default_floor,
          type: mapType,
          map_rect: map.map_rect,
          continent_rect: map.continent_rect,
        };

        // Add masteryRegion if the map is in REGION_ZONES
        const masteryRegion = findMasteryRegion(map.name);
        if (masteryRegion) {
          mapData.masteryRegion = masteryRegion;
        }

        regionMaps[Number(mapId)] = mapData;
      }
    });

    // Only include regions that have at least one Public map
    if (Object.keys(regionMaps).length > 0) {
      enrichedFloor.regions[Number(regionId)] = {
        id: region.id,
        name: region.name,
        label_coord: region.label_coord,
        continent_rect: region.continent_rect,
        maps: regionMaps,
      };
    }
  });

  return enrichedFloor;
}

/**
 * Merges multiple floor data objects, combining regions and maps.
 * Later floors override earlier floors for maps with the same ID.
 */
function mergeFloorData(floors: ContinentFloor[]): ContinentFloor {
  const merged: ContinentFloor = {
    texture_dims: floors[0]?.texture_dims ?? [0, 0],
    regions: {},
  };

  for (const floor of floors) {
    for (const [regionId, region] of Object.entries(floor.regions)) {
      const numRegionId = Number(regionId);
      if (!merged.regions[numRegionId]) {
        merged.regions[numRegionId] = {
          id: region.id,
          name: region.name,
          label_coord: region.label_coord,
          continent_rect: region.continent_rect,
          maps: {},
        };
      }

      // Merge maps, later floors override earlier
      for (const [mapId, map] of Object.entries(region.maps)) {
        merged.regions[numRegionId].maps[Number(mapId)] = map;
      }
    }
  }

  return merged;
}

/**
 * Builds the continent database by fetching continent floor data
 * This creates a pre-bundled JSON file for fast loading
 */
export async function buildContinentDatabase(
  onProgress?: (message: string) => void
): Promise<ContinentDatabase> {
  try {
    // For Tyria continent (ID 1)
    const continentId = 1;
    // Floor 1 has most core maps, Floor 49 has Path of Fire and Living World Season 4/5 maps
    const floorIds = [1, 49];

    if (onProgress) onProgress('Fetching continent data...');

    // Fetch the continent metadata first to get dimensions
    const continentResponse = await fetch(`${BASE_URL}/continents/${continentId}`);
    if (!continentResponse.ok) {
      throw new Error(`Failed to fetch continent: ${continentResponse.statusText}`);
    }
    const continentData = await continentResponse.json();
    const continentDims = continentData.continent_dims as [number, number];

    // Fetch all floors
    const enrichedFloors: ContinentFloor[] = [];
    for (const floorId of floorIds) {
      if (onProgress) onProgress(`Fetching floor ${floorId} data...`);
      const floorRaw = await fetchContinentFloor(continentId, floorId);
      const enriched = await enrichAndFilterFloorData(floorRaw, onProgress);
      enrichedFloors.push(enriched);
    }

    if (onProgress) onProgress('Merging floor data...');

    // Merge all floors together
    const floor = mergeFloorData(enrichedFloors);

    if (onProgress) onProgress('Building database...');

    // Count total public maps
    let totalMaps = 0;
    Object.values(floor.regions).forEach((region) => {
      totalMaps += Object.keys(region.maps).length;
    });

    // Create database object with timestamp
    const db: ContinentDatabase = {
      timestamp: Date.now(),
      continentId,
      floorId: floorIds[0], // Primary floor for reference
      continentDims,
      floor,
    };

    // Save to IndexedDB
    await saveContinentDatabase(db);

    if (onProgress) onProgress('Complete!');

    console.log('=== Continent Database Build Complete ===');
    console.log(`Continent ID: ${continentId}, Floors: ${floorIds.join(', ')}`);
    console.log(`Dimensions: ${continentDims[0]} x ${continentDims[1]}`);
    console.log(`Public maps: ${totalMaps}`);
    console.log(JSON.stringify(db));

    return db;
  } catch (error) {
    console.error('Failed to build continent database:', error);
    throw error;
  }
}

/**
 * Gets continent data from IndexedDB cache or bundled JSON
 * Returns null if no data is available
 */
export async function getContinentData(): Promise<ContinentDatabase | null> {
  try {
    // Try to get from IndexedDB first
    const cachedDb = await getContinentDatabase();
    if (cachedDb) {
      console.log('Using cached continent data from IndexedDB');
      return cachedDb;
    }

    // Try to import bundled data (we'll create this later)
    try {
      const bundledDb = await import('../data/continentDb.json');
      if (bundledDb && bundledDb.default) {
        console.log('Using bundled continent data');
        return bundledDb.default as unknown as ContinentDatabase;
      }
    } catch {
      console.warn('No bundled continent data found, will need to build database');
    }

    return null;
  } catch (error) {
    console.error('Failed to get continent data:', error);
    return null;
  }
}
