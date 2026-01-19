import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import AchievementList, { type UIAchievementGroup } from '../../components/common/AchievementList';
import { useAppStore } from '../../store/useAppStore';

import {
    getRegionDisplayName,
    getRequiredCounts,
    groupByRegionAndCategory,
} from '../../utils/filters';
import type { EnrichedAchievement } from '../../types/gw2';
import { getRegionColor, getRegionImage, REGION_ORDER } from '../../utils/regionHelpers';
import FilterBar from './FilterBar';

export default function MasteryPage() {
    const {
        enrichedAchievementMap,
        filter,
        goal,
        showHidden,
        hiddenAchievements,
        handleToggleHidden,
    } = useAppStore();

    // Derive flat list for mastery filtering
    const allEnrichedAchievements = useMemo(
        () => Array.from(enrichedAchievementMap.values()),
        [enrichedAchievementMap]
    );

    // Filter for mastery achievements only from the ENRICHED source
    const achievements = useMemo(
        () => allEnrichedAchievements.filter((a) => a.masteryRegion),
        [allEnrichedAchievements]
    );

    // Grouping
    const groupedAchievements = useMemo(
        () => groupByRegionAndCategory(achievements),
        [achievements]
    );

    // Also group ALL enriched achievements for accurate total counts
    const allGrouped = useMemo(() => groupByRegionAndCategory(achievements), [achievements]);

    // Calculate counts for filter bar
    const { completedCount } = useMemo(() => {
        const complete = achievements.filter((a) => a.progress?.done).length;
        return {
            completedCount: complete,
        };
    }, [achievements]);

    // Build generic groups from Mastery Regions
    // We need to return EnrichedGroup[] to match the new AchievementList props
    // EnrichedGroup requires: categories: EnrichedCategory[]
    // Our 'groupedAchievements' is Map<Region, Map<CategoryName, Achievement[]>>
    // We need to transform this into the EnrichedGroup structure.

    // Note: We are creating "synthetic" EnrichedGroups here because Mastery Regions don't map directly to API groups.
    // This is fine, as long as the shape matches.

    const displayGroups: UIAchievementGroup[] = useMemo(() => {
        const requiredCounts = getRequiredCounts();

        return REGION_ORDER.map((region) => {
            // Get categories for this region
            const regionCategoriesMap =
                groupedAchievements.get(region) || new Map<string, EnrichedAchievement[]>();

            // Calculate totals using ALL achievements (unfiltered)
            const allRegionCategories = allGrouped.get(region);
            let totalInRegion = 0;
            let completedInRegion = 0;

            if (allRegionCategories) {
                allRegionCategories.forEach((achievements) => {
                    totalInRegion += achievements.length;
                    completedInRegion += achievements.filter((a) => a.progress?.done).length;
                });
            }

            // Build EnrichedCategories for this region
            const categoriesList = Array.from(regionCategoriesMap.entries())
                .map(([catName, achievements]) => {
                    // We need to calculate stats for the category
                    const totalCount = achievements.length;
                    const completedCount = achievements.filter((a) => a.progress?.done).length;

                    // We fake the 'EnrichedCategory' shape since we don't have the full object here
                    // We only have the achievements and the name.
                    // We can pick the first achievement to get metadata closer to reality if needed.
                    const firstAch = achievements[0];

                    return {
                        id: firstAch?.categoryId || 0, // Fallback
                        name: catName,
                        description: '', // Not used in list
                        order: firstAch?.categoryOrder || 0,
                        achievements: achievements,
                        totalPoints: totalCount, // Approx
                        earnedPoints: completedCount, // Approx
                        totalCount,
                        completedCount,
                    };
                })
                .sort((a, b) => a.order - b.order);

            const goalCount = goal === 'required' ? requiredCounts[region] : totalInRegion;
            const isComplete = completedInRegion >= goalCount;

            return {
                id: region,
                title: getRegionDisplayName(region),
                color: getRegionColor(region),
                image: getRegionImage(region),
                // EnrichedGroup props
                description: '',
                order: REGION_ORDER.indexOf(region),
                categories: categoriesList,
                totalPoints: totalInRegion, // Approx
                earnedPoints: completedInRegion, // Approx
                totalCount: goalCount,
                completedCount: completedInRegion,

                // AchievementList specific extra props (if any? AchievementGroup checked `isComplete`)
                // EnrichedGroup doesn't strictly have `isComplete` but our UI might add it?
                // Actually AchievementList uses `isComplete` from the prop.
                // EnrichedGroup in type def doesn't have `isComplete`.
                // BUT `AchievementList` defined `AchievementGroup` with `isComplete`.
                // I changed `AchievementList` to use `EnrichedGroup`.
                // `EnrichedGroup` does NOT have `isComplete`.
                // `EnrichedGroup` has `completedCount` and `totalCount`.
                // `AchievementList` logic uses `g.isComplete`.
                // I need to add `isComplete` to the object I pass OR update `AchievementList` to derive it.
                // Or I can just cast it / extend type locally if needed.
                // Actually, `AchievementList` uses `selectedGroup.isComplete`.
                // I should probably add `isComplete` to `EnrichedGroup`?
                // No, `isComplete` is a derived UI state usually.
                // `AchievementList` was looking at `group.isComplete`.
                // The API `EnrichedGroup` I defined doesn't have it.
                // I should update `AchievementList` to calculate `isComplete` or accept an intersection type.
                // The `groups` prop in `AchievementList` is `EnrichedGroup[]`.
                // I will add `isComplete` to the objects I create here, but TS might complain.
                //
                // Let's check `types/gw2.ts`. `EnrichedGroup` extends `AchievementGroup` (API type).
                // API type doesn't have `isComplete`.
                //
                // Safe fix: Update `AchievementList` to calculate `isComplete` from counts, OR extend the type in `AchievementList` props.
                // `interface UIEnrichedGroup extends EnrichedGroup { isComplete?: boolean; color?: string; image?: string; title?: string; }`
                // Wait, `EnrichedGroup` uses `name` not `title`. `AchievementList` used `title`.
                // I need to map `name` -> `title` or update `AchievementList` to use `name`.
                //
                // I'll update `AchievementList` to be more robust.

                isComplete,
                // Maps for UI compatibility if I don't change Accessors
                // name is standard. title was UI.
                name: getRegionDisplayName(region),
            };
        }).filter((g) => {
            if (filter === 'incomplete' && g.completedCount >= g.totalCount) return false;
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
            window.history.pushState(null, '', window.location.pathname);
        }
    };

    return (
        <>
            {/* Filter Controls */}
            {achievements.length > 0 && (
                <div className="mb-4 px-4 sm:px-6 lg:px-8">
                    <FilterBar
                        completedCount={completedCount}
                        hiddenCount={
                            Array.from(hiddenAchievements).filter((id) => {
                                const ach = achievements.find((a) => a.id === id);
                                return ach && (!ach.progress || !ach.progress.done);
                            }).length
                        }
                    />
                </div>
            )}

            {achievements.length === 0 && <LoadingSpinner message="Loading…" />}

            {/* Achievement list */}
            {achievements.length > 0 && (
                <AnimatePresence mode="wait">
                    <AchievementList
                        groups={displayGroups}
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
