import type { Achievement } from '../types/achievement';
import type { EnrichedAchievement } from '../types/enriched';
import type { MasteryRegion } from '../types/mastery';

// Import expansion images
import centralTyriaImg from '../assets/images/central_tyria.png';
import endOfDragonsImg from '../assets/images/end_of_dragons.png';
import heartOfThornsImg from '../assets/images/heart_of_thorns.png';
import icebroodSagaImg from '../assets/images/icebrood_saga.png';
import janthirWildsImg from '../assets/images/janthir_wilds.png';
import pathOfFireImg from '../assets/images/path_of_fire.png';
import secretsOfTheObscureImg from '../assets/images/secrets_of_the_obscure.png';
import visionsOfEternityImg from '../assets/images/visions_of_eternity.png';

export interface RegionConfig {
  displayName: string;
  color: string;
  zoneColor: string;
  image: string;
}

const REGION_CONFIG: Record<MasteryRegion, RegionConfig> = {
  Tyria: {
    displayName: 'Core Tyria',
    color: 'var(--expansion-tyria)',
    zoneColor: 'var(--zone-tyria)',
    image: centralTyriaImg,
  },
  Maguuma: {
    displayName: 'Heart of Thorns',
    color: 'var(--expansion-maguuma)',
    zoneColor: 'var(--zone-maguuma)',
    image: heartOfThornsImg,
  },
  Desert: {
    displayName: 'Path of Fire',
    color: 'var(--expansion-desert)',
    zoneColor: 'var(--zone-desert)',
    image: pathOfFireImg,
  },
  Tundra: {
    displayName: 'Icebrood Saga',
    color: 'var(--expansion-tundra)',
    zoneColor: 'var(--zone-tundra)',
    image: icebroodSagaImg,
  },
  Jade: {
    displayName: 'End of Dragons',
    color: 'var(--expansion-jade)',
    zoneColor: 'var(--zone-jade)',
    image: endOfDragonsImg,
  },
  Sky: {
    displayName: 'Secrets of the Obscure',
    color: 'var(--expansion-sky)',
    zoneColor: 'var(--zone-sky)',
    image: secretsOfTheObscureImg,
  },
  Wild: {
    displayName: 'Janthir Wilds',
    color: 'var(--expansion-wild)',
    zoneColor: 'var(--zone-wild)',
    image: janthirWildsImg,
  },
  Magic: {
    displayName: 'Visions of Eternity',
    color: 'var(--expansion-magic)',
    zoneColor: 'var(--zone-magic)',
    image: visionsOfEternityImg,
  },
};

/**
 * Returns the full config for a mastery region
 */
export function getRegionConfig(region: MasteryRegion): RegionConfig {
  return REGION_CONFIG[region];
}

// Convenience functions for individual properties
export const getRegionDisplayName = (region: MasteryRegion) => REGION_CONFIG[region].displayName;
export const getRegionColor = (region: MasteryRegion) => REGION_CONFIG[region].color;
export const getRegionZoneColor = (region: MasteryRegion) => REGION_CONFIG[region].zoneColor;
export const getRegionImage = (region: MasteryRegion) => REGION_CONFIG[region].image;

/**
 * Total mastery points needed per region for the "Required Only" goal filter.
 * https://wiki.guildwars2.com/wiki/Mastery
 */
export const REQUIRED_MASTERY_POINTS: Record<MasteryRegion, number> = {
  Tyria: 49,
  Maguuma: 144,
  Desert: 110,
  Tundra: 63,
  Jade: 89,
  Sky: 88,
  Wild: 90,
  Magic: 38,
};

/**
 * The canonical order of regions for display
 */
export const REGION_ORDER: MasteryRegion[] = [
  'Tyria',
  'Maguuma',
  'Desert',
  'Tundra',
  'Jade',
  'Sky',
  'Wild',
  'Magic',
];

/**
 * Returns the total number of mastery points available, deduplicating achievements
 * that share the same mastery reward ID. Optionally scoped to a single region.
 */
export function getTotalMasteryPoints(
  achievements: Iterable<EnrichedAchievement>,
  region?: MasteryRegion
): number {
  let count = 0;
  const seenMasteryIds = new Set<number>();
  for (const a of achievements) {
    if (!a.masteryRegion) continue;
    if (region && a.masteryRegion !== region) continue;
    if (a.masteryId !== undefined) {
      if (seenMasteryIds.has(a.masteryId)) continue;
      seenMasteryIds.add(a.masteryId);
    }
    count += a.masteryPoints ?? 1;
  }
  return count;
}

/**
 * Returns the number of earned mastery points, deduplicating achievements
 * that share the same mastery reward ID. Optionally scoped to a single region.
 */
export function getMasteryPointsAcquired(
  achievements: Iterable<EnrichedAchievement>,
  region?: MasteryRegion
): number {
  let count = 0;
  const seenMasteryIds = new Set<number>();
  for (const a of achievements) {
    if (!a.masteryRegion || !a.progress?.done) continue;
    if (region && a.masteryRegion !== region) continue;
    if (a.masteryId !== undefined) {
      if (seenMasteryIds.has(a.masteryId)) continue;
      seenMasteryIds.add(a.masteryId);
    }
    count += a.masteryPoints ?? 1;
  }
  return count;
}

export function getMasteryRegion(achievement: Achievement): string | null {
  return achievement.masteryRegion || null;
}