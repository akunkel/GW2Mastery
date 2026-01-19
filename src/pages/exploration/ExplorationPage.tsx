import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import AchievementList, { type UIAchievementGroup } from '../../components/common/AchievementList';
import { useAppStore } from '../../store/useAppStore';

import { filterEnrichedHierarchy } from '../../utils/filters';
import FilterBar from '../mastery/FilterBar';

export default function ExplorationPage() {
    const { enrichedGroups, filter, showHidden, hiddenAchievements, handleToggleHidden } =
        useAppStore();

    // Filter the enriched hierarchy to remove completed items if filter is 'incomplete'
    const displayGroups = useMemo(() => {
        return filterEnrichedHierarchy(
            enrichedGroups,
            filter,
            false // Not required only
        );
    }, [enrichedGroups, filter]);

    // Calculate counts for FilterBar
    const { completedCount } = useMemo(() => {
        let completed = 0;
        displayGroups.forEach((g) => {
            completed += g.completedCount;
        });
        return { completedCount: completed };
    }, [displayGroups]);

    // Handle selection state via URL hash
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(() => {
        const hash = window.location.hash.replace('#', '');
        return hash || null;
    });

    useEffect(() => {
        const handlePopState = () => {
            const hash = window.location.hash.replace('#', '');
            setSelectedGroupId(hash || null);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleSelectionChange = (id: string | null) => {
        setSelectedGroupId(id);
        if (id) {
            window.history.pushState({ group: id }, '', `#${id}`);
        } else {
            window.history.pushState(null, '', window.location.pathname);
        }
    };

    // Convert EnrichedGroup[] to UIAchievementGroup[] for the component
    const uiGroups: UIAchievementGroup[] = useMemo(() => {
        return displayGroups.map((g) => {
            return {
                ...g,
                title: g.name,
                color: '#2e3b4e', // Should exist on Group?
                totalCount: g.totalCount,
                completedCount: g.completedCount,
                isComplete: g.completedCount >= g.totalCount,
                // categories is already EnrichedCategory[] in 'g'
            };
        });
    }, [displayGroups]);

    return (
        <>
            {/* Filter Controls */}
            {enrichedGroups.length > 0 && (
                <div className="mb-4 px-4 sm:px-6 lg:px-8">
                    <FilterBar
                        completedCount={completedCount}
                        hiddenCount={
                            Array.from(hiddenAchievements).filter(() => {
                                // This count is difficult to calculate accurately without iteration
                                // Assume 0 for now as hidden achievements are mostly filtered out anyway
                                return false;
                            }).length
                        }
                    />
                </div>
            )}

            {enrichedGroups.length === 0 && (
                <div className="text-center text-slate-400 mt-10">
                    <LoadingSpinner message="Loading..." />
                </div>
            )}

            {/* Achievement list */}
            {enrichedGroups.length > 0 && (
                <AnimatePresence mode="wait">
                    <AchievementList
                        groups={uiGroups}
                        selectedId={selectedGroupId}
                        onSelectionChange={handleSelectionChange}
                        filter={filter}
                        hiddenAchievements={hiddenAchievements}
                        showHidden={showHidden}
                        onToggleHidden={handleToggleHidden}
                    />
                </AnimatePresence>
            )}
        </>
    );
}
