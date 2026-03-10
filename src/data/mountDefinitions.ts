import griffonImg from '../assets/images/mounts/griffon.png';
import jackalImg from '../assets/images/mounts/jackal.png';
import raptorImg from '../assets/images/mounts/raptor.png';
import rollerBeetleImg from '../assets/images/mounts/roller-beetle.png';
import siegeTurtleImg from '../assets/images/mounts/siege-turtle.png';
import skimmerImg from '../assets/images/mounts/skimmer.png';
import skyscaleImg from '../assets/images/mounts/skyscale.png';
import springerImg from '../assets/images/mounts/springer.png';
import warclawImg from '../assets/images/mounts/warclaw.png';
import type { MasteryRegion } from '../types/gw2';

export interface MountDefinition {
  id: string;
  name: string;
  image?: string;
  region: MasteryRegion;
  // The achievement that determines whether a mount is considered unlocked.
  unlockAchievementId: number;
  // The achievements tracked when opening this mount's section. May or may not be the same as the
  // unlock criteria.
  achievementIds: number[];
}

export const MOUNT_DEFINITIONS: MountDefinition[] = [
  // Path of Fire
  {
    id: 'raptor',
    name: 'Raptor',
    image: raptorImg,
    region: 'Desert',
    unlockAchievementId: 3806,
    achievementIds: [3806],
  },
  {
    id: 'springer',
    name: 'Springer',
    image: springerImg,
    region: 'Desert',
    unlockAchievementId: 3567,
    achievementIds: [3567],
  },
  {
    id: 'skimmer',
    name: 'Skimmer',
    image: skimmerImg,
    region: 'Desert',
    unlockAchievementId: 3627,
    achievementIds: [3627],
  },
  {
    id: 'jackal',
    name: 'Jackal',
    image: jackalImg,
    region: 'Desert',
    unlockAchievementId: 3818,
    achievementIds: [3818],
  },
  {
    id: 'griffon',
    name: 'Griffon',
    image: griffonImg,
    region: 'Desert',
    unlockAchievementId: 3867,
    achievementIds: [3736, 3662, 3867],
  },
  // Living World Season 4
  {
    id: 'roller-beetle',
    name: 'Roller Beetle',
    image: rollerBeetleImg,
    region: 'Desert',
    unlockAchievementId: 4270,
    achievementIds: [4270],
  },
  {
    id: 'skyscale',
    name: 'Skyscale',
    image: skyscaleImg,
    region: 'Desert',
    unlockAchievementId: 4745,
    achievementIds: [4745],
  },
  // Icebrood Saga
  {
    id: 'warclaw',
    name: 'Warclaw',
    image: warclawImg,
    region: 'Tundra',
    unlockAchievementId: 4642,
    achievementIds: [4642],
  },
  // End of Dragons
  {
    id: 'siege-turtle',
    name: 'Siege Turtle',
    image: siegeTurtleImg,
    region: 'Jade',
    unlockAchievementId: 6176,
    achievementIds: [6176],
  },
  // TODO: General masteries: Crystal Champion, United Legions Waystation Synchronization
];

export const GENERAL_MOUNT_DEFINITIONS: MountDefinition[] = [
  // Secrets of the Obscure
  {
    id: 'flight-training',
    name: 'Flight Training',
    region: 'Sky',
    unlockAchievementId: 7225,
    achievementIds: [7225],
  },
  // Visions of Eternity
  {
    id: 'skimmer-adaptation',
    name: 'Skimmer Adaptation',
    region: 'Magic',
    unlockAchievementId: 8990,
    achievementIds: [8990],
  },
];
