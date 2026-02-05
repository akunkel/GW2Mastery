// Unified zone configuration for map adjustments and explorer achievements
// Each zone can have:
// - Visual adjustments (offset, scale, bounds) for rendering on the map
// - Explorer achievement ID for progress tracking
// - Mastery insight achievement IDs

import type { MasteryRegion } from '../types/gw2';

export interface ZoneConfig {
  // Visual adjustments
  offsetX?: number;
  offsetY?: number;
  scaleX?: number;
  scaleY?: number;
  adjustBounds?: { top?: number; right?: number; bottom?: number; left?: number; };
  masteryRegion?: MasteryRegion;

  // Explorer achievement - either a dedicated zone achievement or part of a regional one
  // For regional achievements, bits are filtered by zone name prefix (e.g., "Queensdale: Some Area")
  explorerAchievementId?: number;
  regionalExplorerId?: number;
  insightAchievementIds?: number[];
  // Collectible achievements to track (e.g., hero points, diving goggles, etc.)
  collectibleAchievementIds?: number[];
}

/**
 * Zone configurations keyed by zone name.
 * Only zones that need adjustments or manual achievement mapping need entries here.
 */
// Regional achievement IDs
const ASCALON_EXPLORER = 101;
const KRYTAN_EXPLORER = 12;
const SHIVERPEAK_EXPLORER = 100;
const ORR_EXPLORER = 103;
const MAGUUMA_JUNGLE_EXPLORER = 102;

export const zoneConfigs: Record<string, ZoneConfig> = {
  // === Ascalon (Regional: Ascalon Explorer) ===
  'Plains of Ashford': { regionalExplorerId: ASCALON_EXPLORER },
  'Diessa Plateau': { regionalExplorerId: ASCALON_EXPLORER },
  'Fields of Ruin': { regionalExplorerId: ASCALON_EXPLORER },
  'Iron Marches': { regionalExplorerId: ASCALON_EXPLORER, insightAchievementIds: [3526] },
  'Blazeridge Steppes': { regionalExplorerId: ASCALON_EXPLORER },
  'Fireheart Rise': { regionalExplorerId: ASCALON_EXPLORER, insightAchievementIds: [3530] },
  'Black Citadel': { regionalExplorerId: ASCALON_EXPLORER },

  // === Kryta (Regional: Krytan Explorer) ===
  Queensdale: { regionalExplorerId: KRYTAN_EXPLORER },
  'Kessex Hills': { regionalExplorerId: KRYTAN_EXPLORER },
  'Gendarran Fields': { regionalExplorerId: KRYTAN_EXPLORER },
  'Harathi Hinterlands': { regionalExplorerId: KRYTAN_EXPLORER, insightAchievementIds: [3539] },
  'Bloodtide Coast': { regionalExplorerId: KRYTAN_EXPLORER, insightAchievementIds: [3501], collectibleAchievementIds: [3092] },
  "Lion's Arch": { regionalExplorerId: KRYTAN_EXPLORER },
  "Divinity's Reach": { regionalExplorerId: KRYTAN_EXPLORER },
  'Claw Island': { adjustBounds: { right: -250 }, regionalExplorerId: KRYTAN_EXPLORER },

  // === Shiverpeaks (Regional: Shiverpeak Explorer) ===
  'Wayfarer Foothills': { regionalExplorerId: SHIVERPEAK_EXPLORER },
  'Snowden Drifts': { regionalExplorerId: SHIVERPEAK_EXPLORER },
  "Lornar's Pass": { regionalExplorerId: SHIVERPEAK_EXPLORER },
  'Dredgehaunt Cliffs': { regionalExplorerId: SHIVERPEAK_EXPLORER, insightAchievementIds: [3534] },
  'Timberline Falls': { regionalExplorerId: SHIVERPEAK_EXPLORER, insightAchievementIds: [3504] },
  'Frostgorge Sound': { regionalExplorerId: SHIVERPEAK_EXPLORER, collectibleAchievementIds: [3096] },
  Hoelbrak: { regionalExplorerId: SHIVERPEAK_EXPLORER },

  // === Orr (Regional: Orr Explorer) ===
  'Straits of Devastation': { regionalExplorerId: ORR_EXPLORER },
  "Malchor's Leap": { regionalExplorerId: ORR_EXPLORER, insightAchievementIds: [3476] },
  'Cursed Shore': { regionalExplorerId: ORR_EXPLORER },

  // === Maguuma Jungle (Regional: Maguuma Explorer) ===
  'Metrica Province': { regionalExplorerId: MAGUUMA_JUNGLE_EXPLORER },
  'Caledon Forest': { regionalExplorerId: MAGUUMA_JUNGLE_EXPLORER },
  'Brisban Wildlands': { regionalExplorerId: MAGUUMA_JUNGLE_EXPLORER },
  'Sparkfly Fen': { regionalExplorerId: MAGUUMA_JUNGLE_EXPLORER, insightAchievementIds: [3543] },
  'Mount Maelstrom': { regionalExplorerId: MAGUUMA_JUNGLE_EXPLORER, insightAchievementIds: [3531] },
  'Rata Sum': { regionalExplorerId: MAGUUMA_JUNGLE_EXPLORER },
  'The Grove': { regionalExplorerId: MAGUUMA_JUNGLE_EXPLORER },

  // === Heart of Maguuma ===
  'Bloodstone Fen': { offsetY: -20, masteryRegion: 'Maguuma', insightAchievementIds: [3061, 3078], collectibleAchievementIds: [8025] },
  'Dry Top': { adjustBounds: { top: 1050 }, masteryRegion: 'Maguuma', collectibleAchievementIds: [5785] },
  'Spirit Vale': { offsetY: -250, masteryRegion: 'Maguuma' },
  'The Silverwastes': { adjustBounds: { bottom: -100 }, masteryRegion: 'Maguuma' },
  'Verdant Brink': { explorerAchievementId: 2222, collectibleAchievementIds: [2489] },
  'Auric Basin': { explorerAchievementId: 2370, insightAchievementIds: [2164, 2168, 2517, 2267, 2204, 2612, 2143, 2608], collectibleAchievementIds: [2574] },
  'Tangled Depths': { explorerAchievementId: 2378, insightAchievementIds: [2349, 2396, 2305, 2380, 2457] },
  "Dragon's Stand": { explorerAchievementId: 2212 },

  // === Living World Season 3 ===
  'Ember Bay': { insightAchievementIds: [3103, 3116], collectibleAchievementIds: [3137] },
  'Bitterfrost Frontier': { insightAchievementIds: [3174, 3217, 3240] },
  'Lake Doric': { insightAchievementIds: [3350, 3358, 3284, 3377] },
  'Draconis Mons': { insightAchievementIds: [3404, 3431, 3418] },
  "Siren's Landing": { insightAchievementIds: [3475, 3508, 3506, 3477, 3490], collectibleAchievementIds: [3498] },

  // === Path of Fire ===
  'Crystal Oasis': { explorerAchievementId: 3864, insightAchievementIds: [3805, 3763, 3655, 3710, 3717, 3714] },
  'Desert Highlands': { explorerAchievementId: 3616, insightAchievementIds: [3713, 3640, 3591, 3755, 3769, 3878, 3605, 3671, 3810, 3630, 3656, 3783, 3875, 3800, 3610] },
  'Elon Riverlands': { explorerAchievementId: 3623, insightAchievementIds: [3795, 3563, 3704, 3761, 3603, 3701, 3767, 3852], collectibleAchievementIds: [3632] },
  'The Desolation': { explorerAchievementId: 3612, insightAchievementIds: [3645, 3592, 3885, 3659, 3620, 3695, 3573, 3600], collectibleAchievementIds: [3683] },
  'Domain of Vabbi': { explorerAchievementId: 3865, insightAchievementIds: [3841, 3803, 3692] },

  // === Living World Season 4 ===
  'Domain of Istan': { insightAchievementIds: [4029, 3981, 4026] },
  'Sandswept Isles': { insightAchievementIds: [4096, 4150, 4125, 4134] },
  'Domain of Kourna': { insightAchievementIds: [4206, 4213, 4228, 4261, 4255] },
  'Jahai Bluffs': { insightAchievementIds: [4380, 4368, 4386, 4405, 4411] },
  'Thunderhead Peaks': { insightAchievementIds: [4543, 4524, 4578, 4525] },
  Dragonfall: { insightAchievementIds: [4701, 4664, 4685, 4741, 4690, 4735], collectibleAchievementIds: [4757] },

  // === Icebrood Saga ===
  'Grothmar Valley': { insightAchievementIds: [5128, 5111], collectibleAchievementIds: [4919] },
  'Bjora Marches': { insightAchievementIds: [5088, 5058, 5129, 5041, 5043, 5090, 5057] },
  'Drizzlewood Coast': { insightAchievementIds: [5374, 5336, 5415, 5333, 5378, 5396, 5421, 5326, 5303], collectibleAchievementIds: [5376] },
  Champions: { insightAchievementIds: [5536, 5540, 5504, 5515, 5533, 5502, 5478, 5485, 5517, 5498] },

  // === End of Dragons ===
  Arborstone: { offsetY: -2300, scaleX: 0.75, scaleY: 0.75, masteryRegion: 'Jade' },
  'Seitung Province': { explorerAchievementId: 6077, insightAchievementIds: [6410, 6104, 6281, 6070, 6277, 6267, 6087, 6149, 6105, 6119, 6100, 6479, 6095, 6191] },
  'New Kaineng City': { explorerAchievementId: 6142, insightAchievementIds: [6341, 6477, 6182, 6365, 6449, 6177, 6441, 6476, 6507, 6379, 6214, 6128, 6389], collectibleAchievementIds: [6461] },
  'The Echovald Wilds': { explorerAchievementId: 6481, insightAchievementIds: [6226, 6351, 6462, 6338, 6244, 6249, 6094, 6102, 6238, 6382, 6334, 6076] },
  "Dragon's End": { explorerAchievementId: 6248, insightAchievementIds: [6360, 6395, 6406, 6122, 6404] },

  // === Secrets of the Obscure ===
  'Mistburned Barrens': { adjustBounds: { right: -2200 }, explorerAchievementId: 8625, insightAchievementIds: [8597, 8590, 8594, 8588, 8563, 8617] },
  Amnytas: { explorerAchievementId: 7054, insightAchievementIds: [6977, 7124, 7045, 6966, 7209, 6999, 7182, 7213, 7046], collectibleAchievementIds: [7034] },
  'Skywatch Archipelago': { explorerAchievementId: 7147, insightAchievementIds: [7150, 7177, 7093, 7006, 7216, 7125, 7171, 7016, 7188, 7115, 7086] },
  'Inner Nayos': { explorerAchievementId: 8101, insightAchievementIds: [7836, 7683, 7694, 8014, 7731, 7708, 7673, 7724, 7817, 7671] },
  Tower: { insightAchievementIds: [7022, 7000] },

  // === Janthir Wilds ===
  'Lowland Shore': { explorerAchievementId: 8154, insightAchievementIds: [8235, 8365, 8169, 8307, 8321, 8215, 8212, 8295, 8220, 8176, 8238], collectibleAchievementIds: [8291] },
  'Janthir Syntri': { explorerAchievementId: 8283, insightAchievementIds: [8186, 8308, 8277, 8264, 8274, 8359, 8181, 8211, 8254, 8225, 8315] },

  // === Realm of Dreams ===
  'Bava Nisos': { explorerAchievementId: 8704, insightAchievementIds: [8734, 8722, 8737, 8754, 8738, 8779] },
  'Shipwreck Strand': { explorerAchievementId: 8885, insightAchievementIds: [9066, 8960, 8899, 8912, 9050, 8972, 8962, 8984, 8997, 8943, 9006, 8975] },
  'Starlit Weald': { explorerAchievementId: 8889, insightAchievementIds: [9012, 8927, 9073, 8993, 8956, 8901, 8913, 9015] },
};

/**
 * Applies visual adjustments to a continent_rect based on zone config
 */
export function applyMapAdjustments(
  rect: [[number, number], [number, number]],
  zoneName: string
): [[number, number], [number, number]] {
  const config = zoneConfigs[zoneName];
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
 * Gets the mastery region for a zone (if configured)
 */
export function getZoneMasteryRegion(zoneName: string): MasteryRegion | undefined {
  return zoneConfigs[zoneName]?.masteryRegion;
}

/**
 * Gets the explorer achievement ID for a zone (if manually configured)
 */
export function getZoneExplorerAchievementId(zoneName: string): number | undefined {
  return zoneConfigs[zoneName]?.explorerAchievementId;
}
