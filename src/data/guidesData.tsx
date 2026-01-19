import React from 'react';

export interface GuideItem {
    id: string;
    name: string;
    type: 'Fractal' | 'Raid' | 'Strike' | 'Dungeon';
    category?: string; // Wing, Expansion, etc.
    content: React.ReactNode;
}

export interface GuideCategory {
    title: string;
    items: GuideItem[];
}

export const FRACTALS: GuideItem[] = [
    {
        id: 'f-aquatic',
        name: 'Aquatic Ruins',
        type: 'Fractal',
        content: (
            <>
                <h4>Traps</h4>
                <ul>
                    <li>
                        <b>Underwater Mines:</b> Avoid the mines in the water at the start; they are
                        one-hit kills. Watch for mines hidden behind seaweed or on the ceiling.
                    </li>{' '}
                    <li>
                        <b>Electric Floor:</b> Move only on unlit tiles. Evasive movement skills
                        (like Whirlwind Attack) can cross unsafe tiles without taking damage.
                    </li>{' '}
                    <li>
                        <b>Knockback Danger:</b> The Inquest enemy at the end of the first puzzle
                        can knock you back into the trap. Use Stability or blocks.
                    </li>{' '}
                    <li>
                        <b>Rotating Walls:</b> Run with the gaps in the rotating barriers.
                        Invulnerability skills allow you to pass through them.
                    </li>{' '}
                    <li>
                        <b>Required Mechanic:</b> You <b>must</b> disable the terminals at the end
                        of <em>both</em> trap sections. Inspector Kiel cannot move through active
                        traps, and the fractal will not progress until she reaches the end.
                    </li>{' '}
                </ul>
                <h4>Boss: Frizz</h4>{' '}
                <ul>
                    {' '}
                    <li>
                        <b>Laser Walls:</b> Frizz activates rotating walls that sweep the room.{' '}
                        <ul>
                            {' '}
                            <li>
                                <b>Low/Fast Walls:</b> Jump on top of the stacked crates in the room
                                to avoid these completely.
                            </li>{' '}
                            <li>
                                <b>High/Slow Walls:</b> You must run around the room to outpace
                                these.
                            </li>{' '}
                        </ul>{' '}
                    </li>{' '}
                    <li>
                        <b>Golem Mechanics:</b>{' '}
                        <ul>
                            {' '}
                            <li>
                                Passing through a laser buffs golems with a blocking shield.{' '}
                                <b>Unblockable attacks</b> are highly recommended.
                            </li>{' '}
                            <li>
                                Golems can pull players off the safety of the crate stacks. Use
                                Stability to prevent this.
                            </li>{' '}
                        </ul>{' '}
                    </li>{' '}
                </ul>
            </>
        ),
    },
    {
        id: 'f-aetherblade',
        name: 'Aetherblade',
        type: 'Fractal',
        content: <>Guide content for Aetherblade...</>,
    },
    {
        id: 'f-mai-trin',
        name: 'Captain Mai Trin Boss',
        type: 'Fractal',
        content: <>Guide content for Captain Mai Trin Boss...</>,
    },
    { id: 'f-chaos', name: 'Chaos', type: 'Fractal', content: <>Guide content for Chaos...</> },
    {
        id: 'f-cliffside',
        name: 'Cliffside',
        type: 'Fractal',
        content: <>Guide content for Cliffside...</>,
    },
    {
        id: 'f-deepstone',
        name: 'Deepstone',
        type: 'Fractal',
        content: <>Guide content for Deepstone...</>,
    },
    {
        id: 'f-molten-boss',
        name: 'Molten Boss',
        type: 'Fractal',
        content: <>Guide content for Molten Boss...</>,
    },
    {
        id: 'f-molten-furnace',
        name: 'Molten Furnace',
        type: 'Fractal',
        content: <>Guide content for Molten Furnace...</>,
    },
    {
        id: 'f-nightmare',
        name: 'Nightmare',
        type: 'Fractal',
        content: <>Guide content for Nightmare...</>,
    },
    {
        id: 'f-shattered',
        name: 'Shattered Observatory',
        type: 'Fractal',
        content: <>Guide content for Shattered Observatory...</>,
    },
    {
        id: 'f-silent-surf',
        name: 'Silent Surf',
        type: 'Fractal',
        content: <>Guide content for Silent Surf...</>,
    },
    {
        id: 'f-siren',
        name: "Siren's Reef",
        type: 'Fractal',
        content: <>Guide content for Siren's Reef...</>,
    },
    {
        id: 'f-snowblind',
        name: 'Snowblind',
        type: 'Fractal',
        content: <>Guide content for Snowblind...</>,
    },
    {
        id: 'f-solid-ocean',
        name: 'Solid Ocean',
        type: 'Fractal',
        content: <>Guide content for Solid Ocean...</>,
    },
    {
        id: 'f-sunqua',
        name: 'Sunqua Peak',
        type: 'Fractal',
        content: <>Guide content for Sunqua Peak...</>,
    },
    {
        id: 'f-swampland',
        name: 'Swampland',
        type: 'Fractal',
        content: <>Guide content for Swampland...</>,
    },
    {
        id: 'f-thaumanova',
        name: 'Thaumanova Reactor',
        type: 'Fractal',
        content: <>Guide content for Thaumanova Reactor...</>,
    },
    {
        id: 'f-twilight',
        name: 'Twilight Oasis',
        type: 'Fractal',
        content: <>Guide content for Twilight Oasis...</>,
    },
    {
        id: 'f-uncategorized',
        name: 'Uncategorized',
        type: 'Fractal',
        content: <>Guide content for Uncategorized...</>,
    },
    {
        id: 'f-underground',
        name: 'Underground Facility',
        type: 'Fractal',
        content: <>Guide content for Underground Facility...</>,
    },
    {
        id: 'f-urban',
        name: 'Urban Battleground',
        type: 'Fractal',
        content: <>Guide content for Urban Battleground...</>,
    },
    {
        id: 'f-volcanic',
        name: 'Volcanic',
        type: 'Fractal',
        content: <>Guide content for Volcanic...</>,
    },
];

export const RAIDS: GuideCategory[] = [
    {
        title: 'Wing 1: Spirit Vale',
        items: [
            {
                id: 'r-w1-vg',
                name: 'Vale Guardian',
                type: 'Raid',
                category: 'Wing 1',
                content: <>Guide content for Vale Guardian...</>,
            },
            {
                id: 'r-w1-spirit',
                name: 'Spirit Woods',
                type: 'Raid',
                category: 'Wing 1',
                content: <>Guide content for Spirit Woods...</>,
            },
            {
                id: 'r-w1-gorse',
                name: 'Gorseval',
                type: 'Raid',
                category: 'Wing 1',
                content: <>Guide content for Gorseval...</>,
            },
            {
                id: 'r-w1-sab',
                name: 'Sabetha',
                type: 'Raid',
                category: 'Wing 1',
                content: <>Guide content for Sabetha...</>,
            },
        ],
    },
    {
        title: 'Wing 2: Salvation Pass',
        items: [
            {
                id: 'r-w2-sloth',
                name: 'Slothasor',
                type: 'Raid',
                category: 'Wing 2',
                content: <>Guide content for Slothasor...</>,
            },
            {
                id: 'r-w2-trio',
                name: 'Bandit Trio',
                type: 'Raid',
                category: 'Wing 2',
                content: <>Guide content for Bandit Trio...</>,
            },
            {
                id: 'r-w2-matt',
                name: 'Matthias Gabrel',
                type: 'Raid',
                category: 'Wing 2',
                content: <>Guide content for Matthias Gabrel...</>,
            },
        ],
    },
    {
        title: 'Wing 3: Stronghold of the Faithful',
        items: [
            {
                id: 'r-w3-escort',
                name: 'Escort',
                type: 'Raid',
                category: 'Wing 3',
                content: <>Guide content for Escort...</>,
            },
            {
                id: 'r-w3-kc',
                name: 'Keep Construct',
                type: 'Raid',
                category: 'Wing 3',
                content: <>Guide content for Keep Construct...</>,
            },
            {
                id: 'r-w3-xera',
                name: 'Xera',
                type: 'Raid',
                category: 'Wing 3',
                content: <>Guide content for Xera...</>,
            },
        ],
    },
    {
        title: 'Wing 4: Bastion of the Penitent',
        items: [
            {
                id: 'r-w4-cairn',
                name: 'Cairn',
                type: 'Raid',
                category: 'Wing 4',
                content: <>Guide content for Cairn...</>,
            },
            {
                id: 'r-w4-mo',
                name: 'Mursaat Overseer',
                type: 'Raid',
                category: 'Wing 4',
                content: <>Guide content for Mursaat Overseer...</>,
            },
            {
                id: 'r-w4-sam',
                name: 'Samarog',
                type: 'Raid',
                category: 'Wing 4',
                content: <>Guide content for Samarog...</>,
            },
            {
                id: 'r-w4-deimos',
                name: 'Deimos',
                type: 'Raid',
                category: 'Wing 4',
                content: <>Guide content for Deimos...</>,
            },
        ],
    },
    {
        title: 'Wing 5: Hall of Chains',
        items: [
            {
                id: 'r-w5-sh',
                name: 'Soulless Horror',
                type: 'Raid',
                category: 'Wing 5',
                content: <>Guide content for Soulless Horror...</>,
            },
            {
                id: 'r-w5-river',
                name: 'River of Souls',
                type: 'Raid',
                category: 'Wing 5',
                content: <>Guide content for River of Souls...</>,
            },
            {
                id: 'r-w5-statues',
                name: 'Statues of Grenth',
                type: 'Raid',
                category: 'Wing 5',
                content: <>Guide content for Statues of Grenth...</>,
            },
            {
                id: 'r-w5-dhuum',
                name: 'Dhuum',
                type: 'Raid',
                category: 'Wing 5',
                content: <>Guide content for Dhuum...</>,
            },
        ],
    },
    {
        title: 'Wing 6: Mythwright Gambit',
        items: [
            {
                id: 'r-w6-ca',
                name: 'Conjured Amalgamate',
                type: 'Raid',
                category: 'Wing 6',
                content: <>Guide content for Conjured Amalgamate...</>,
            },
            {
                id: 'r-w6-twins',
                name: 'Twin Largos',
                type: 'Raid',
                category: 'Wing 6',
                content: <>Guide content for Twin Largos...</>,
            },
            {
                id: 'r-w6-qadim',
                name: 'Qadim',
                type: 'Raid',
                category: 'Wing 6',
                content: <>Guide content for Qadim...</>,
            },
        ],
    },
    {
        title: 'Wing 7: The Key of Ahdashim',
        items: [
            {
                id: 'r-w7-adina',
                name: 'Cardinal Adina',
                type: 'Raid',
                category: 'Wing 7',
                content: <>Guide content for Cardinal Adina...</>,
            },
            {
                id: 'r-w7-sabir',
                name: 'Cardinal Sabir',
                type: 'Raid',
                category: 'Wing 7',
                content: <>Guide content for Cardinal Sabir...</>,
            },
            {
                id: 'r-w7-qadim',
                name: 'Qadim the Peerless',
                type: 'Raid',
                category: 'Wing 7',
                content: <>Guide content for Qadim the Peerless...</>,
            },
        ],
    },
    {
        title: 'Wing 8: Mount Balrior',
        items: [
            {
                id: 'r-w8-decima',
                name: 'Decima, the Stormsinger',
                type: 'Raid',
                category: 'Wing 8',
                content: <>Guide content for Decima, the Stormsinger...</>,
            },
            {
                id: 'r-w8-greer',
                name: 'Greer, the Blightbringer',
                type: 'Raid',
                category: 'Wing 8',
                content: <>Guide content for Greer, the Blightbringer...</>,
            },
            {
                id: 'r-w8-ura',
                name: 'Ura, the Steamshrieker',
                type: 'Raid',
                category: 'Wing 8',
                content: <>Guide content for Ura, the Steamshrieker...</>,
            },
        ],
    },
];

export const STRIKES: GuideItem[] = [
    // IBS
    {
        id: 's-ibs-pass',
        name: 'Shiverpeaks Pass',
        type: 'Strike',
        category: 'IBS',
        content: <>Guide content for Shiverpeaks Pass...</>,
    },
    {
        id: 's-ibs-raven',
        name: 'Voice and Claw',
        type: 'Strike',
        category: 'IBS',
        content: <>Guide content for Voice and Claw...</>,
    },
    {
        id: 's-ibs-fraenir',
        name: 'Fraenir of Jormag',
        type: 'Strike',
        category: 'IBS',
        content: <>Guide content for Fraenir of Jormag...</>,
    },
    {
        id: 's-ibs-boneskinner',
        name: 'Boneskinner',
        type: 'Strike',
        category: 'IBS',
        content: <>Guide content for Boneskinner...</>,
    },
    {
        id: 's-ibs-whisper',
        name: 'Whisper of Jormag',
        type: 'Strike',
        category: 'IBS',
        content: <>Guide content for Whisper of Jormag...</>,
    },
    {
        id: 's-ibs-coldwar',
        name: 'Cold War',
        type: 'Strike',
        category: 'IBS',
        content: <>Guide content for Cold War...</>,
    },
    {
        id: 's-ibs-forging',
        name: 'Forging Steel',
        type: 'Strike',
        category: 'IBS',
        content: <>Guide content for Forging Steel...</>,
    },
    // EoD
    {
        id: 's-eod-ah',
        name: 'Aetherblade Hideout',
        type: 'Strike',
        category: 'EoD',
        content: <>Guide content for Aetherblade Hideout...</>,
    },
    {
        id: 's-eod-xjj',
        name: 'Xunlai Jade Junkyard',
        type: 'Strike',
        category: 'EoD',
        content: <>Guide content for Xunlai Jade Junkyard...</>,
    },
    {
        id: 's-eod-ko',
        name: 'Kaineng Overlook',
        type: 'Strike',
        category: 'EoD',
        content: <>Guide content for Kaineng Overlook...</>,
    },
    {
        id: 's-eod-ht',
        name: 'Harvest Temple',
        type: 'Strike',
        category: 'EoD',
        content: <>Guide content for Harvest Temple...</>,
    },
    {
        id: 's-eod-olc',
        name: "Old Lion's Court",
        type: 'Strike',
        category: 'EoD',
        content: <>Guide content for Old Lion's Court...</>,
    },
    // SotO
    {
        id: 's-soto-co',
        name: 'Cosmic Observatory',
        type: 'Strike',
        category: 'SotO',
        content: <>Guide content for Cosmic Observatory...</>,
    },
    {
        id: 's-soto-tof',
        name: 'Temple of Febe',
        type: 'Strike',
        category: 'SotO',
        content: <>Guide content for Temple of Febe...</>,
    },
];

export const DUNGEONS: GuideItem[] = [
    {
        id: 'd-ac',
        name: 'Ascalonian Catacombs',
        type: 'Dungeon',
        content: <>Guide content for Ascalonian Catacombs...</>,
    },
    {
        id: 'd-cm',
        name: "Caudecus's Manor",
        type: 'Dungeon',
        content: <>Guide content for Caudecus's Manor...</>,
    },
    {
        id: 'd-ta',
        name: 'Twilight Arbor',
        type: 'Dungeon',
        content: <>Guide content for Twilight Arbor...</>,
    },
    {
        id: 'd-se',
        name: "Sorrow's Embrace",
        type: 'Dungeon',
        content: <>Guide content for Sorrow's Embrace...</>,
    },
    {
        id: 'd-cof',
        name: 'Citadel of Flame',
        type: 'Dungeon',
        content: <>Guide content for Citadel of Flame...</>,
    },
    {
        id: 'd-hotw',
        name: 'Honor of the Waves',
        type: 'Dungeon',
        content: <>Guide content for Honor of the Waves...</>,
    },
    {
        id: 'd-coe',
        name: 'Crucible of Eternity',
        type: 'Dungeon',
        content: <>Guide content for Crucible of Eternity...</>,
    },
    {
        id: 'd-arah',
        name: 'The Ruined City of Arah',
        type: 'Dungeon',
        content: <>Guide content for The Ruined City of Arah...</>,
    },
];
