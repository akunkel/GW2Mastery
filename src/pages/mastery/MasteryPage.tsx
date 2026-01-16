import { AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAppStore } from '../../store/useAppStore';
import {
    calculateTotalMasteryPoints,
    enrichAchievements,
    filterByCompletion,
    groupByRegionAndCategory,
} from '../../utils/filters';
import AchievementList from './AchievementList';
import FilterBar from './FilterBar';

export default function MasteryPage() {
    const {
        achievements: allAchievements,
        accountProgress,
        categoryMap,
        loading,
        buildingDatabase,
        loadingProgress,
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
    const achievements = allAchievements.filter((a) =>
        a.rewards?.some((r) => r.type === 'Mastery')
    );

    // Calculate filtered and grouped achievements
    const filteredAchievements = filterByCompletion(
        achievements,
        accountProgress,
        filter
    );

    const enrichedAchievements = enrichAchievements(
        filteredAchievements,
        accountProgress,
        categoryMap
    );

    const groupedAchievements = groupByRegionAndCategory(enrichedAchievements);

    // Calculate counts for filter bar
    const totalCount = achievements.length;
    const completedCount = achievements.filter(
        (a) => accountProgress.get(a.id)?.done
    ).length;
    const incompleteCount = totalCount - completedCount;

    // Calculate mastery points
    const masteryPoints = calculateTotalMasteryPoints(
        achievements,
        accountProgress
    );

    return (
        <>
            {/* Filter Controls */}
            {achievements.length > 0 && (
                <div className="mb-4 px-6">
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

            {/* Loading state */}
            {(loading || buildingDatabase) && (
                <LoadingSpinner
                    progress={loadingProgress?.current}
                    total={loadingProgress?.total}
                    message={
                        buildingDatabase
                            ? loadingProgress
                                ? `Building database (${loadingProgress.current} of ${loadingProgress.total} batches)…`
                                : 'Starting database build…'
                            : 'Loading your achievements…'
                    }
                />
            )}

            {/* Achievement list */}
            {!loading && !buildingDatabase && achievements.length > 0 && (
                <AnimatePresence mode="wait">
                    <AchievementList
                        groupedAchievements={groupedAchievements}
                        allAchievements={achievements}
                        accountProgress={accountProgress}
                        categoryMap={categoryMap}
                        earnedPoints={masteryPoints.earned}
                        totalPoints={masteryPoints.total}
                        goal={goal}
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
