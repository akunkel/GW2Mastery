// Per-map configuration overrides for visual adjustments
// - offsetX/offsetY: shift the map's coordinates on the visual map
// - scaleX/scaleY: multiplier for width/height (2 = double size), scales from center
// - adjustBounds: { top, right, bottom, left } to adjust individual edges
// - masteryRegion: the mastery region for coloring the zone

import type { MasteryRegion } from '../types/gw2';

interface MapConfig {
  offsetX?: number;
  offsetY?: number;
  scaleX?: number;
  scaleY?: number;
  adjustBounds?: { top?: number; right?: number; bottom?: number; left?: number; };
  masteryRegion?: MasteryRegion;
}

const mapConfigs: Record<string, MapConfig> = {
  // Core Tyria
  Arborstone: { offsetY: -2300, scaleX: 0.75, scaleY: 0.75, masteryRegion: 'Jade' },
  'Bloodstone Fen': { offsetY: -20, masteryRegion: 'Maguuma' },
  'Claw Island': { adjustBounds: { right: -250 } },
  'Dry Top': { adjustBounds: { top: 1050 }, masteryRegion: 'Maguuma' },
  'Mistburned Barrens': { adjustBounds: { right: -2200 } },
  'Spirit Vale': { offsetY: -250, masteryRegion: 'Maguuma' },
  'The Silverwastes': { adjustBounds: { bottom: -100 }, masteryRegion: 'Maguuma' },
};

/**
 * Applies visual adjustments to a continent_rect based on map config
 */
export function applyMapAdjustments(
  rect: [[number, number], [number, number]],
  mapName: string
): [[number, number], [number, number]] {
  const config = mapConfigs[mapName];
  if (!config) return rect;

  const offsetX = config.offsetX ?? 0;
  const offsetY = config.offsetY ?? 0;
  const scaleX = config.scaleX ?? 1;
  const scaleY = config.scaleY ?? 1;
  const bounds = config.adjustBounds ?? {};

  // Calculate center and half-dimensions for scaling
  const centerX = (rect[0][0] + rect[1][0]) / 2;
  const centerY = (rect[0][1] + rect[1][1]) / 2;
  const halfWidth = (rect[1][0] - rect[0][0]) / 2;
  const halfHeight = (rect[1][1] - rect[0][1]) / 2;

  // Apply scale from center, then offset, then bounds adjustments
  return [
    [
      centerX - halfWidth * scaleX + offsetX + (bounds.left ?? 0),
      centerY - halfHeight * scaleY + offsetY + (bounds.top ?? 0),
    ],
    [
      centerX + halfWidth * scaleX + offsetX + (bounds.right ?? 0),
      centerY + halfHeight * scaleY + offsetY + (bounds.bottom ?? 0),
    ],
  ];
}

/**
 * Gets the mastery region for a map (if configured)
 */
export function getMapMasteryRegion(mapName: string): MasteryRegion | undefined {
  return mapConfigs[mapName]?.masteryRegion;
}
