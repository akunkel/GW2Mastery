import { AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useEffect } from 'react';
import AchievementList from './components/AchievementList';
import FilterBar from './components/FilterBar';
import LoadingSpinner from './components/LoadingSpinner';
import SetupModal from './components/SetupModal';
import { Button } from './components/ui/button';
import { useAppStore } from './store/useAppStore';
import {
  calculateTotalMasteryPoints,
  enrichAchievements,
  filterByCompletion,
  groupByRegionAndCategory,
} from './utils/filters';

function App() {
  const {
    achievements,
    accountProgress,
    categoryMap,
    loading,
    buildingDatabase,
    loadingProgress,
    filter,
    goal,
    showHidden,
    hiddenAchievements,
    initialize,
    setSetupModalOpen,
    setFilter,
    setGoal,
    setShowHidden,
    handleToggleHidden,
  } = useAppStore();

  // Check for stored API key, database, and filter settings on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-10 relative">
      {/* Setup Button - Absolute Top Left */}
      <Button
        onClick={() => setSetupModalOpen(true)}
        variant="outline"
        size="sm"
        className="absolute top-4 left-4 z-10 mt-0 ml-0"
      >
        <Settings className="w-4 h-4" />
        Setup
      </Button>

      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <header className="text-center mb-10 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            GW2Mastery
          </h1>
          <p className="text-slate-400 lg:text-lg md:text-base text-sm">
            Just the mastery points, please.
          </p>
        </header>

        {/* Setup Modal */}
        <SetupModal />

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
      </div>
    </div>
  );
}

export default App;

