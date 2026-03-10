import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import AchievementList, {
    type UIAchievementSection,
} from '../../components/common/AchievementList';
import MountCard from '../../components/common/MountCard';
import type { MountDefinition } from '../../data/mountDefinitions';
import { GENERAL_MOUNT_DEFINITIONS, MOUNT_DEFINITIONS } from '../../data/mountDefinitions';
import { useAppStore } from '../../store/useAppStore';

import type { EnrichedAchievement, EnrichedCategory } from '../../types/gw2';
import { getRegionConfig } from '../../utils/regionHelpers';

function buildSections(
    definitions: MountDefinition[],
    enrichedAchievementMap: Map<number, EnrichedAchievement>
): UIAchievementSection[] {
    return definitions.map((mount) => {
        const achievements: EnrichedAchievement[] = mount.achievementIds
            .map((id) => enrichedAchievementMap.get(id))
            .filter((a): a is EnrichedAchievement => a !== undefined);

        const totalCount = achievements.length;
        const completedCount = achievements.filter((a) => a.progress?.done).length;
        const isComplete =
            enrichedAchievementMap.get(mount.unlockAchievementId)?.progress?.done === true;

        const category: EnrichedCategory = {
            id: 0,
            name: mount.name,
            description: '',
            order: 0,
            achievements,
            totalCount,
            completedCount,
        };

        const regionConfig = getRegionConfig(mount.region);

        return {
            id: mount.id,
            name: mount.name,
            title: mount.name,
            description: '',
            order: 0,
            categories: [category],
            totalCount,
            completedCount,
            isComplete,
            color: regionConfig.color,
            image: mount.image ?? regionConfig.image,
            mountTypeId: mount.mountTypeId,
        };
    });
}

export default function MountsPage() {
    const { enrichedAchievementMap } = useAppStore();

    const displaySections = useMemo(
        () => buildSections(MOUNT_DEFINITIONS, enrichedAchievementMap),
        [enrichedAchievementMap]
    );

    const generalSections = useMemo(
        () => buildSections(GENERAL_MOUNT_DEFINITIONS, enrichedAchievementMap),
        [enrichedAchievementMap]
    );

    // Handle selection state via URL hash
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(() => {
        const hash = window.location.hash.replace('#', '');
        return hash || null;
    });

    useEffect(() => {
        const handlePopState = () => {
            const hash = window.location.hash.replace('#', '');
            setSelectedSectionId(hash || null);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleSelectionChange = (id: string | null) => {
        setSelectedSectionId(id);
        if (id) {
            window.history.pushState({ expansion: id }, '', `#${id}`);
        } else {
            window.history.pushState(null, '', window.location.pathname);
        }
    };

    const isLoaded = enrichedAchievementMap.size > 0;

    const sharedListProps = {
        sectionComponent: MountCard,
        selectedId: selectedSectionId,
        onSelectionChange: handleSelectionChange,
        showCompletedAchievements: true,
        flatList: true,
    };

    return (
        <>
            {/* Page Title */}
            <div className="text-center mb-8 mt-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Mounts</h1>
                <p className="text-slate-400 md:text-base text-sm">You can never have too many.</p>
            </div>

            {!isLoaded && <LoadingSpinner message="Loading…" />}

            {isLoaded && (
                <>
                    <AnimatePresence mode="wait">
                        <AchievementList sections={displaySections} {...sharedListProps} />
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        <AchievementList
                            sections={generalSections}
                            {...sharedListProps}
                            toolbar={
                                <h2 className="text-xl font-bold text-slate-300 mt-4">
                                    General Masteries
                                </h2>
                            }
                        />
                    </AnimatePresence>

                    {!selectedSectionId && (
                        <ul className="[list-style-type:'*__'] list-inside text-sm text-slate-400 px-4 sm:px-6 lg:px-8 mt-8 mb-4 space-y-1">
                            <li>
                                Checkmarks indicate mount ownership (requires "inventories"
                                permissions on the API key).
                            </li>
                            <li>Green borders indicate the mastery track is unlocked.</li>
                        </ul>
                    )}
                </>
            )}
        </>
    );
}
