import type { ReactNode } from 'react';
import griffonImg from '../assets/images/mounts/griffon.png';
import jackalImg from '../assets/images/mounts/jackal.png';
import raptorImg from '../assets/images/mounts/raptor.png';
import rollerBeetleImg from '../assets/images/mounts/roller-beetle.png';
import siegeTurtleImg from '../assets/images/mounts/siege-turtle.png';
import skimmerImg from '../assets/images/mounts/skimmer.png';
import skyscaleImg from '../assets/images/mounts/skyscale.png';
import springerImg from '../assets/images/mounts/springer.png';
import warclawImg from '../assets/images/mounts/warclaw.png';
import type { MasteryRegion } from '../types/mastery';

export interface MountDefinition {
    id: string;
    name: string;
    // Optional custom title node for the card. This allows us to insert <br> for better formatting.
    cardTitle?: ReactNode;
    image?: string;
    region: MasteryRegion;
    // The API:2/account/mounts/types ID for this mount (if applicable).
    mountTypeId?: string;
    // The achievement that determines whether a mount is considered unlocked.
    unlockAchievementId: number;
    // Achievements grouped by step. Each inner array is one step shown in the detail view.
    achievementIdsSteps: number[][];
    // Optional note displayed above the achievement list in the detail view.
    note?: ReactNode;
    // Optional wiki URL. When provided, the header text becomes a hyperlink.
    wikiUrl?: string;
}

export const MOUNT_DEFINITIONS: MountDefinition[] = [
    // Path of Fire
    {
        id: 'raptor',
        name: 'Raptor',
        image: raptorImg,
        region: 'Desert',
        mountTypeId: 'raptor',
        unlockAchievementId: 3806,
        achievementIdsSteps: [[3806]],
        wikiUrl: 'https://wiki.guildwars2.com/wiki/Raptor#Related_masteries',
    },
    {
        id: 'springer',
        name: 'Springer',
        image: springerImg,
        region: 'Desert',
        mountTypeId: 'springer',
        unlockAchievementId: 3567,
        achievementIdsSteps: [[3567]],
        wikiUrl: 'https://wiki.guildwars2.com/wiki/Springer#Related_masteries',
    },
    {
        id: 'skimmer',
        name: 'Skimmer',
        image: skimmerImg,
        region: 'Desert',
        mountTypeId: 'skimmer',
        unlockAchievementId: 3627,
        achievementIdsSteps: [[3627]],
        wikiUrl: 'https://wiki.guildwars2.com/wiki/Skimmer#Related_masteries',
    },
    {
        id: 'jackal',
        name: 'Jackal',
        image: jackalImg,
        region: 'Desert',
        mountTypeId: 'jackal',
        unlockAchievementId: 3818,
        achievementIdsSteps: [[3818]],
        wikiUrl: 'https://wiki.guildwars2.com/wiki/Jackal#Related_masteries',
    },
    {
        id: 'griffon',
        name: 'Griffon',
        image: griffonImg,
        region: 'Desert',
        mountTypeId: 'griffon',
        unlockAchievementId: 3867,
        achievementIdsSteps: [
            // Open Skies: Sunspear Sanctuary
            [3736, 3634, 3686, 3834, 3856, 3758],
            // Open Skies: On Wings and a Prayer
            [3867, 3662],
        ],
        wikiUrl: 'https://wiki.guildwars2.com/wiki/Griffon#Related_masteries',
    },
    // Living World Season 4
    {
        id: 'roller-beetle',
        name: 'Roller Beetle',
        image: rollerBeetleImg,
        region: 'Desert',
        mountTypeId: 'roller_beetle',
        unlockAchievementId: 4270,
        achievementIdsSteps: [[4265, 4205, 4270]],
        wikiUrl: 'https://wiki.guildwars2.com/wiki/Roller_Beetle#Related_masteries',
    },
    {
        id: 'skyscale',
        name: 'Skyscale',
        image: skyscaleImg,
        region: 'Desert',
        mountTypeId: 'skyscale',
        unlockAchievementId: 4745,
        achievementIdsSteps: [
            // Newborn Skyscales
            [4714, 4707, 4719, 4667, 4666],
            // Saving Skyscales
            [4712, 4704, 4694, 4678, 4680, 4746, 4730, 4684, 4711, 4695, 4724, 4736, 4665],
            // Raising Skyscales
            [4693, 4671, 4725, 4733],
            // Troublesome Skyscales
            [4675, 4692, 4662, 4710],
            // Riding Skyscales
            [4745, 4709, 4668],
        ],
        note: 'These achievements unlock the LWS4 mastery track and the mount. See "Flight Training" mastery for the faster route to unlock the mount through SotO, although it won\'t unlock this mastery track.',
        wikiUrl: 'https://wiki.guildwars2.com/wiki/Skyscale#Related_masteries',
    },
    // End of Dragons
    {
        id: 'siege-turtle',
        name: 'Siege Turtle',
        image: siegeTurtleImg,
        region: 'Jade',
        mountTypeId: 'turtle',
        unlockAchievementId: 6176,
        achievementIdsSteps: [[6176, 6408, 6066, 6099]],
        wikiUrl: 'https://wiki.guildwars2.com/wiki/Siege_Turtle#Related_masteries',
    },
    // Janthir Wilds
    {
        id: 'warclaw',
        name: 'Warclaw',
        image: warclawImg,
        region: 'Wild',
        mountTypeId: 'warclaw',
        unlockAchievementId: 8223,
        achievementIdsSteps: [[8223]],
        note: 'This achievement unlocks the PvE mastery track. The mount itself can be unlocked simply by owning PoF and entering a WvW map.',
        wikiUrl: 'https://wiki.guildwars2.com/wiki/Warclaw#Related_masteries',
    },
    // TODO: General masteries: Crystal Champion, United Legions Waystation Synchronization
];

export const OTHER_MOUNT_DEFINITIONS: MountDefinition[] = [
    // Secrets of the Obscure
    {
        id: 'flight-training',
        name: 'Flight Training',
        region: 'Sky',
        mountTypeId: 'skyscale',
        unlockAchievementId: 7175,
        achievementIdsSteps: [[7175, 7225]],
        note: '"Hell Breaks Loose" unlocks this mastery track, while "A New Friend" unlocks the Skyscale mount.',
        wikiUrl: 'https://wiki.guildwars2.com/wiki/Flight_Training',
    },
    // Visions of Eternity
    {
        id: 'skimmer-adaptation',
        name: 'Skimmer Adaptation',
        cardTitle: (
            <>
                Skimmer
                <br />
                Adaptation
            </>
        ),
        region: 'Magic',
        mountTypeId: 'skimmer',
        unlockAchievementId: 8990,
        achievementIdsSteps: [[8990]],
        wikiUrl: 'https://wiki.guildwars2.com/wiki/Skimmer_Adaptation',
    },
];
