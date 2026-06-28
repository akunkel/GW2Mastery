import type { MasteryRegion } from '../types/mastery';

/**
 * Maps each mastery region to the zone (map) names it contains. Hand-maintained: when a game
 * update adds a new explorable zone, add it here so its map picks up the right mastery region.
 *
 * Kept in its own image-free module (separate from regionHelpers, which imports expansion
 * banner images) so the offline build-data script can consume it under Node/tsx.
 */
export const REGION_ZONES: Record<MasteryRegion, string[]> = {
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
    "Comosus Isle",
    "Eternity's Garden",
  ]
};
