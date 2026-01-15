import { AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import AchievementList from './components/AchievementList';
import FilterBar from './components/FilterBar';
import LoadingSpinner from './components/LoadingSpinner';
import SetupModal from './components/SetupModal';
import { Button } from './components/ui/button';
import {
  buildMasteryAchievementIdsDatabase,
  fetchAccountAchievements,
  fetchAchievementCategories,
  fetchMasteryAchievements,
  mapAchievementsToCategories,
  validateApiKey,
} from './services/gw2Api';
import type {
  AccountAchievement,
  Achievement,
  FilterType,
  GoalType,
} from './types/gw2';
import {
  calculateTotalMasteryPoints,
  enrichAchievements,
  filterByCompletion,
  groupByRegionAndCategory,
} from './utils/filters';
import {
  clearApiKey,
  getApiKey,
  getFilterSettings,
  getHiddenAchievements,
  getMasteryAchievementIds,
  getMasteryAchievementIdsTimestamp,
  saveApiKey,
  saveFilterSettings,
  saveHiddenAchievements,
} from './utils/storage';

function App() {
  const [hasStoredKey, setHasStoredKey] = useState<boolean>(false);
  const [storedApiKey, setStoredApiKey] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [accountProgress, setAccountProgress] = useState<
    Map<number, AccountAchievement>
  >(new Map());
  const [categoryMap, setCategoryMap] = useState<
    Map<
      number,
      { categoryId: number; categoryName: string; categoryOrder: number }
    >
  >(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [buildingDatabase, setBuildingDatabase] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [goal, setGoal] = useState<GoalType>('all');
  const [databaseTimestamp, setDatabaseTimestamp] = useState<number | null>(
    null
  );
  const [setupModalOpen, setSetupModalOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [hiddenAchievements, setHiddenAchievements] = useState<Set<number>>(
    new Set()
  );
  const [showHidden, setShowHidden] = useState<boolean>(false);

  // Check for stored API key, database, and filter settings on mount
  useEffect(() => {
    const storedKey = getApiKey();
    const masteryIds = getMasteryAchievementIds();
    const timestamp = getMasteryAchievementIdsTimestamp();
    const filterSettings = getFilterSettings();
    const hiddenIds = getHiddenAchievements();

    setDatabaseTimestamp(timestamp);
    setHiddenAchievements(hiddenIds);

    // Load filter settings from localStorage (defaults to both true)
    setFilter(filterSettings.hideCompleted ? 'incomplete' : 'all');
    setGoal(filterSettings.requiredOnly ? 'required' : 'all');

    if (storedKey) {
      setHasStoredKey(true);
      setStoredApiKey(storedKey);
      if (masteryIds) {
        loadAchievements(storedKey);
      }
    } else {
      // Open modal if no API key is stored
      setSetupModalOpen(true);
    }

    // Mark as initialized to allow saving filter changes
    setIsInitialized(true);
  }, []);

  // Save filter settings to localStorage whenever they change (after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    const hideCompleted = filter === 'incomplete';
    const requiredOnly = goal === 'required';
    saveFilterSettings(hideCompleted, requiredOnly);
  }, [filter, goal, isInitialized]);

  const loadAchievements = async (key: string) => {
    setLoading(true);
    setLoadingProgress(null);
    setError(null);

    try {
      // Validate API key
      const isValid = await validateApiKey(key);
      if (!isValid) {
        throw new Error('Invalid API key or insufficient permissions');
      }

      // Fetch account progress first (this is fast)
      const accountData = await fetchAccountAchievements(key);

      // Create a map of account progress for quick lookup
      const progressMap = new Map<number, AccountAchievement>();
      accountData.forEach((progress) => {
        progressMap.set(progress.id, progress);
      });

      // Fetch categories and achievements concurrently
      const [categories, masteryAchievements] = await Promise.all([
        fetchAchievementCategories(),
        fetchMasteryAchievements(accountData),
      ]);

      // Map achievements to their categories
      const achCategoryMap = mapAchievementsToCategories(
        masteryAchievements,
        categories
      );

      setAchievements(masteryAchievements);
      setAccountProgress(progressMap);
      setCategoryMap(achCategoryMap);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load achievements';
      setError(errorMessage);
      console.error('Error loading achievements:', err);
    } finally {
      setLoading(false);
      setLoadingProgress(null);
    }
  };

  const handleApiKeySubmit = (key: string, remember: boolean) => {
    if (remember) {
      saveApiKey(key);
      setHasStoredKey(true);
      setStoredApiKey(key);
    } else {
      clearApiKey();
      setHasStoredKey(false);
      setStoredApiKey(null);
    }

    loadAchievements(key);
  };

  const handleClearKey = () => {
    clearApiKey();
    setHasStoredKey(false);
    setStoredApiKey(null);
    setAchievements([]);
    setAccountProgress(new Map());
    setError(null);
  };

  const handleToggleHidden = (achievementId: number) => {
    setHiddenAchievements((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(achievementId)) {
        newSet.delete(achievementId);
      } else {
        newSet.add(achievementId);
      }
      saveHiddenAchievements(newSet);
      return newSet;
    });
  };

  const handleBuildDatabase = async () => {
    setBuildingDatabase(true);
    setLoadingProgress(null);
    setError(null);

    try {
      await buildMasteryAchievementIdsDatabase((current, total) => {
        setLoadingProgress({ current, total });
      });

      const timestamp = getMasteryAchievementIdsTimestamp();
      setDatabaseTimestamp(timestamp);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to build database';
      setError(errorMessage);
      console.error('Error building database:', err);
    } finally {
      setBuildingDatabase(false);
      setLoadingProgress(null);
    }
  };

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
          <p className="text-slate-400 text-lg md:text-xl">
            When all you want is the mastery points.
          </p>
        </header>

        {/* Setup Modal */}
        <SetupModal
          open={setupModalOpen}
          onOpenChange={setSetupModalOpen}
          onApiKeySubmit={handleApiKeySubmit}
          onClearKey={handleClearKey}
          onBuildDatabase={handleBuildDatabase}
          isLoading={loading}
          buildingDatabase={buildingDatabase}
          error={error}
          hasStoredKey={hasStoredKey}
          storedApiKey={storedApiKey}
          databaseTimestamp={databaseTimestamp}
          loadingProgress={loadingProgress}
          hasAchievements={achievements.length > 0}
        />

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
              hiddenCount={hiddenAchievements.size}
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
                  ? `Building database (${loadingProgress.current} of ${loadingProgress.total} batches)...`
                  : 'Starting database build...'
                : 'Loading your achievements...'
            }
          />
        )}

        {/* Achievement list */}
        {!loading && achievements.length > 0 && (
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
