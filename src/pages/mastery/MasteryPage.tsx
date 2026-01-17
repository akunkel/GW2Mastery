import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import AchievementList, { type AchievementGroup } from '../../components/common/AchievementList';
import { useAppStore } from '../../store/useAppStore';

import {
    enrichAchievements,
    filterByCompletion,
    getRegionDisplayName,
    getRequiredCounts,
    groupByRegionAndCategory,
} from '../../utils/filters';
import { getRegionColor, getRegionImage, REGION_ORDER } from '../../utils/regionHelpers';
import FilterBar from './FilterBar';

export default function MasteryPage() {
    const {
        achievements: allAchievements,
        accountProgress,
        categoryMap,
        filter,
        goal,
        showHidden,
        hiddenAchievements,
        setFilter,
        setGoal,
        setShowHidden,
        handleToggleHidden,
    } = useAppStore();

    // Filter for mastery achievements only
    const achievements = useMemo(() => allAchievements.filter((a) => a.masteryRegion), [allAchievements]);

    // Calculate filtered and grouped achievements
    const filteredAchievements = useMemo(() => filterByCompletion(
        achievements,
        accountProgress,
        filter
    ), [achievements, accountProgress, filter]);

    const enrichedAchievements = useMemo(() => enrichAchievements(
        filteredAchievements,
        accountProgress,
        categoryMap
    ), [filteredAchievements, accountProgress, categoryMap]);

    const groupedAchievements = useMemo(() => groupByRegionAndCategory(enrichedAchievements), [enrichedAchievements]);

    // Also group ALL enriched achievements for accurate toal counts
    const allEnriched = useMemo(() => enrichAchievements(achievements, accountProgress, categoryMap), [achievements, accountProgress, categoryMap]);
    const allGrouped = useMemo(() => groupByRegionAndCategory(allEnriched), [allEnriched]);

    // Calculate counts for filter bar
    const { totalCount, completedCount, incompleteCount } = useMemo(() => {
        const total = achievements.length;
        const complete = achievements.filter(
            (a) => accountProgress.get(a.id)?.done
        ).length;
        return {
            totalCount: total,
            completedCount: complete,
            incompleteCount: total - complete
        };
    }, [achievements, accountProgress]);


    // Build generic groups from Mastery Regions
    const groups: AchievementGroup[] = useMemo(() => {
        const requiredCounts = getRequiredCounts();

        return REGION_ORDER.map(region => {
            // Get categories for this region
            const regionCategories = groupedAchievements.get(region) || new Map();

            // Calculate totals using ALL achievements (unfiltered)
            const allRegionCategories = allGrouped.get(region);
            let totalInRegion = 0;
            let completedInRegion = 0;

            if (allRegionCategories) {
                allRegionCategories.forEach((achievements) => {
                    totalInRegion += achievements.length;
                    completedInRegion += achievements.filter(
                        (a) => a.progress?.done
                    ).length;
                });
            }

            const goalCount = goal === 'required' ? requiredCounts[region] : totalInRegion;
            const isComplete = completedInRegion >= goalCount;

            return {
                id: region,
                title: getRegionDisplayName(region),
                color: getRegionColor(region),
                image: getRegionImage(region),
                totalCount: goalCount,
                completedCount: completedInRegion,
                isComplete,
                categories: regionCategories,
                categoryOrder: REGION_ORDER.indexOf(region) // Just use index for stability
            };
        }).filter(g => {
            // Same filtering logic as before for the "ExpansionCard" list
            if (filter === 'incomplete' && g.isComplete) return false;
            return true;
        });
    }, [groupedAchievements, allGrouped, goal, filter]);

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
            window.history.pushState({ expansion: id }, '', `#${id}`);
        } else {
            // Go back if clearing selection, or push empty hash?
            // Previous behavior was back() or pushState to remove hash? 
            // Let's just reset hash for now to keep it simple
            window.history.pushState(null, '', window.location.pathname);
        }
    };

    return (
        <>
            {/* Filter Controls */}
            {achievements.length > 0 && (
                <div className="mb-4 px-4 sm:px-6 lg:px-8">
                    <FilterBar
                        currentFilter={filter}
                        onFilterChange={setFilter}
                        currentGoal={goal}
                        onGoalChange={setGoal}
                        totalCount={totalCount}
                        completedCount={completedCount}
                        incompleteCount={incompleteCount}
                        showHidden={showHidden}
                        onShowHiddenChange={setShowHidden}
                        hiddenCount={
                            Array.from(hiddenAchievements).filter((id) => {
                                const ach = achievements.find((a) => a.id === id);
                                const progress = accountProgress.get(id);
                                return ach && (!progress || !progress.done);
                            }).length
                        }
                    />
                </div>
            )}

            {(achievements.length === 0) && (
                <LoadingSpinner message="Loading…" />
            )}

            {/* Achievement list */}
            {achievements.length > 0 && (
                <AnimatePresence mode="wait">
                    <AchievementList
                        groups={groups}
                        selectedId={selectedGroupId}
                        onSelectionChange={handleSelectionChange}
                        filter={filter}
                        hiddenAchievements={hiddenAchievements}
                        showHidden={showHidden}
                        onToggleHidden={handleToggleHidden}
                    />
                </AnimatePresence >
            )
            }
        </>
    );
}
