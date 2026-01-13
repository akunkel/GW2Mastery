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

/**
 * Returns the CSS variable for a region's color
 */
export function getRegionColor(region: MasteryRegion): string {
  const colorMap: Record<MasteryRegion, string> = {
    Tyria: 'var(--expansion-tyria)',
    Maguuma: 'var(--expansion-maguuma)',
    Desert: 'var(--expansion-desert)',
    Tundra: 'var(--expansion-tundra)',
    Jade: 'var(--expansion-jade)',
    Sky: 'var(--expansion-sky)',
    Wild: 'var(--expansion-wild)',
    Magic: 'var(--expansion-magic)',
  };
  return colorMap[region];
}

/**
 * Returns the image path for a region
 */
export function getRegionImage(region: MasteryRegion): string {
  const imageMap: Record<MasteryRegion, string> = {
    Tyria: centralTyriaImg,
    Maguuma: heartOfThornsImg,
    Desert: pathOfFireImg,
    Tundra: icebroodSagaImg,
    Jade: endOfDragonsImg,
    Sky: secretsOfTheObscureImg,
    Wild: janthirWildsImg,
    Magic: visionsOfEternityImg,
  };
  return imageMap[region];
}

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
