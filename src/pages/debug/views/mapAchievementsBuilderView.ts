import continentDb from '../../../data/continentDb.json';
import rawAchievementDb from '../../../data/rawAchievementDb.json';
import type { DebugViewConfig } from '../../../services/endpointTypes';
import type { RawAchievement } from '../../../types/achievement';
import type { ContinentDatabase } from '../../../types/map';

export const mapAchievementsBuilderView: DebugViewConfig = {
  label: 'Map Achievements Builder',
  description:
    'Generates a mapping of zone names to achievement IDs by searching achievement text for zone name mentions. Uses rawAchievementDb.json.',
  autoFetch: true,
  queryFn: async () => {
    // 1. Collect all map names from the continent database
    const allMapNames: string[] = [];
    const continentData = continentDb as unknown as ContinentDatabase;
    Object.values(continentData.floor.regions).forEach((region) => {
      Object.values(region.maps).forEach((map) => {
        if (map.name) allMapNames.push(map.name);
      });
    });

    // 2. Load raw achievements from bundled database
    const rawAchievements = (rawAchievementDb as unknown as { achievements: RawAchievement[] }).achievements;

    // 3. Match achievements to map names by word-boundary text search
    const mapAchievementIds: Record<string, number[]> = {};
    for (const mapName of allMapNames) {
      const escaped = mapName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');

      const matchingIds = rawAchievements
        .filter((raw) => {
          const searchText = `${raw.name || ''} ${raw.description || ''} ${raw.requirement || ''}`;
          return regex.test(searchText);
        })
        .map((raw) => raw.id);

      if (matchingIds.length > 0) {
        mapAchievementIds[mapName] = matchingIds;
      }
    }

    return mapAchievementIds;
  },
  params: [],
};
