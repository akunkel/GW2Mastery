import type { RawAchievement } from '../types/achievement';
import type { ContinentDatabase } from '../types/map';

/**
 * Maps each zone name to the achievement IDs whose name/description/requirement mention it
 * (case-insensitive, word-boundary match). A heuristic that seeds the per-zone achievement
 * lists used by the Explorer view. Pure and parameterized so it runs from both the browser
 * and the offline build-data script.
 */
export function buildMapAchievements(
  continentData: ContinentDatabase,
  achievements: RawAchievement[]
): Record<string, number[]> {
  const mapNames: string[] = [];
  Object.values(continentData.floor.regions).forEach((region) => {
    Object.values(region.maps).forEach((map) => {
      if (map.name) mapNames.push(map.name);
    });
  });

  const mapAchievementIds: Record<string, number[]> = {};
  for (const mapName of mapNames) {
    const escaped = mapName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');

    const matchingIds = achievements
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
}
