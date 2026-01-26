import type { MasteryRegion } from '../types/gw2';

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

export const REGION_ZONES = {
  Tyria: [
    // Ascalon
    "Plains of Ashford",
    "Diessa Plateau",
    "Fields of Ruin",
    "Blazeridge Steppes",
    "Iron Marches",
    "Fireheart Rise",
    // Kryta
    "Queensdale",
    "Kessex Hills",
    "Gendarran Fields",
    "Harathi Hinterlands",
    "Bloodtide Coast",
    "Southsun Cove",
    "Lake Doric",
    // Shiverpeak Mountains
    "Wayfarer Foothills",
    "Snowden Drifts",
    "Lornar's Pass",
    "Dredgehaunt Cliffs",
    "Timberline Falls",
    // Maguuma Jungle (Central)
    "Caledon Forest",
    "Metrica Province",
    "Brisban Wildlands",
    "Sparkfly Fen",
    "Mount Maelstrom",
    // Ruins of Orr
    "Straits of Devastation",
    "Malchor's Leap",
    "Cursed Shore",
    // Maguuma Wastes
    "Dry Top",
    "The Silverwastes"
  ],
  Maguuma: [
    // Heart of Thorns
    "Verdant Brink",
    "Auric Basin",
    "Tangled Depths",
    "Dragon's Stand",
    // Season 3
    "Bloodstone Fen",
    "Ember Bay",
    "Bitterfrost Frontier",
    "Draconis Mons",
    "Siren's Landing"
  ],
  Desert: [
    // Path of Fire
    "Crystal Oasis",
    "Desert Highlands",
    "Elon Riverlands",
    "The Desolation",
    "Domain of Vabbi",
    // Season 4
    "Domain of Istan",
    "Sandswept Isles",
    "Domain of Kourna",
    "Jahai Bluffs",
    "Thunderhead Peaks",
    "Dragonfall"
  ],
  Tundra: [
    // Icebrood Saga
    "Grothmar Valley",
    "Bjora Marches",
    "Drizzlewood Coast"
  ],
  Jade: [
    // End of Dragons
    "Seitung Province",
    "New Kaineng City",
    "The Echovald Wilds",
    "Dragon's End",
    "Gyala Delve"
  ],
  Sky: [
    // Secrets of the Obscure
    "Skywatch Archipelago",
    "Amnytas",
    "Inner Nayos"
  ],
  Wild: [
    // Janthir Wilds
    "Lowland Shore",
    "Janthir Syntri",
    "Mistburned Barrens",
    "Bava Nisos"
  ],
  Magic: [
    // Visions of Eternity
    "Starlit Weald",
    "Shipwreck Strand",
    "Comosus Isle"
  ]
};