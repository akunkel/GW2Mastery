import achievementDb from '../data/achievementDb.json';

import type {
  AccountAchievement,
  Achievement,
  AchievementCategory,
  AchievementDatabase,
} from '../types/achievement';
import type { ContinentDatabase, ContinentFloor, ContinentMapData, GW2Map } from '../types/map';
import type { MasteryRegion } from '../types/mastery';
import { REGION_ZONES } from '../utils/regionHelpers';
import {
  getAchievementDatabase,
  getContinentDatabase,
  saveContinentDatabase,
} from '../utils/storage';
import { BASE_URL } from './apiConfig';

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

const PARALLEL_REQUESTS = 4; // Parallel requests to stay under API rate limit (5/sec)

/**
 * Fetches account-specific achievement progress
 */
export async function fetchAccountAchievements(apiKey: string): Promise<AccountAchievement[]> {
  const response = await fetch(`${BASE_URL}/account/achievements?access_token=${apiKey}`);

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Invalid API key or insufficient permissions');
    }
    throw new Error(`Failed to fetch account achievements: ${response.statusText}`);
  }

  const data = await response.json() as AccountAchievement[];
  if (data.length === 0) {
    throw new Error('Achievements API returned no achievement data. Try using a different API key.');
  } else {
    console.log(`Loaded data for ${data.length} achievements, ${data.filter((a) => a.done).length} completed.`);
  }
  return data;
}

/**
 * Fetches all achievement categories
 */
export async function fetchAchievementCategories(lang: string = 'en'): Promise<AchievementCategory[]> {
  try {
    // Get all category IDs
    const idsResponse = await fetch(`${BASE_URL}/achievements/categories?lang=${lang}`);
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
            `${BASE_URL}/achievements/categories?ids=${batchIds.join(',')}&lang=${lang}`
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
  floorId: number,
  lang: string = 'en'
): Promise<ContinentFloor> {
  try {
    const response = await fetch(`${BASE_URL}/continents/${continentId}/floors/${floorId}?lang=${lang}`);
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
  onProgress?: (message: string) => void,
  lang: string = 'en'
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
        const response = await fetch(`${BASE_URL}/maps?ids=${batchIds.join(',')}&lang=${lang}`);
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
  onProgress?: (message: string) => void,
  lang: string = 'en'
): Promise<ContinentFloor> {
  // First, fetch map types for all maps
  const mapTypes = await fetchMapTypes(floor, onProgress, lang);

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
export async function buildContinentDatabase({
  onProgress,
  lang = 'en',
}: {
  onProgress?: (message: string) => void;
  lang?: string;
} = {}): Promise<ContinentDatabase> {
  try {
    // For Tyria continent (ID 1)
    const continentId = 1;
    // Floor 1 has most core maps, Floor 49 has Path of Fire and Living World Season 4/5 maps
    const floorIds = [1, 49];

    if (onProgress) onProgress('Fetching continent data...');

    // Fetch the continent metadata first to get dimensions
    const continentResponse = await fetch(`${BASE_URL}/continents/${continentId}?lang=${lang}`);
    if (!continentResponse.ok) {
      throw new Error(`Failed to fetch continent: ${continentResponse.statusText}`);
    }
    const continentData = await continentResponse.json();
    const continentDims = continentData.continent_dims as [number, number];

    // Fetch all floors
    const enrichedFloors: ContinentFloor[] = [];
    for (const floorId of floorIds) {
      if (onProgress) onProgress(`Fetching floor ${floorId} data...`);
      const floorRaw = await fetchContinentFloor(continentId, floorId, lang);
      const enriched = await enrichAndFilterFloorData(floorRaw, onProgress, lang);
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
