import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type {
  AccountAchievement,
  Achievement,
  EnrichedAchievement,
  FilterType,
  GoalType,
  MasteryRegion,
} from '../../types/gw2';
import {
  enrichAchievements,
  getRegionDisplayName,
  getRequiredCounts,
  groupByRegionAndCategory,
} from '../../utils/filters';
import { getRegionColor, REGION_ORDER } from '../../utils/regionHelpers';
import AchievementCard from './AchievementCard';
import ExpansionCard from './ExpansionCard';

interface AchievementListProps {
  groupedAchievements: Map<MasteryRegion, Map<string, EnrichedAchievement[]>>;
  allAchievements: Achievement[];
  accountProgress: Map<number, AccountAchievement>;
  categoryMap: Map<number, { categoryId: number; categoryName: string; categoryOrder: number }>;
  earnedPoints: number;
  totalPoints: number;
  goal: GoalType;
  filter: FilterType;
  hiddenAchievements: Set<number>;
  showHidden: boolean;
  onToggleHidden: (achievementId: number) => void;
}

export default function AchievementList({
  groupedAchievements,
  allAchievements,
  accountProgress,
  categoryMap,
  goal,
  filter,
  hiddenAchievements,
  showHidden,
  onToggleHidden,
}: AchievementListProps) {
  const requiredCounts = getRequiredCounts();

  // Group ALL achievements by region for accurate counting
  const allEnrichedAchievements = enrichAchievements(
    allAchievements,
    accountProgress,
    categoryMap
  );
  const allGroupedAchievements = groupByRegionAndCategory(
    allEnrichedAchievements
  );
  // State to track selected expansion (null = showing expansion selection)
  // Initialize from URL hash
  const [selectedExpansion, setSelectedExpansion] =
    useState<MasteryRegion | null>(() => {
      const hash = window.location.hash.replace('#', '');
      if (hash && REGION_ORDER.includes(hash as MasteryRegion)) {
        return hash as MasteryRegion;
      }
      return null;
    });

  // State to track which categories are collapsed - start all collapsed
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );



  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const pageTransition = {
    duration: 0.4,
  };

  // Scroll to top when expansion changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedExpansion]);

  // Handle browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && REGION_ORDER.includes(hash as MasteryRegion)) {
        setSelectedExpansion(hash as MasteryRegion);
      } else {
        setSelectedExpansion(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update browser history when expansion is selected
  const handleExpansionClick = (region: MasteryRegion) => {
    setSelectedExpansion(region);
    window.history.pushState({ expansion: region }, '', `#${region}`);
  };

  // Handle back button click - pop current page and return to root
  const handleBackClick = useCallback(() => {
    setSelectedExpansion(null);
    // Go back in history to remove the expansion page from the stack
    window.history.back();
  }, []);

  const toggleCategory = (categoryKey: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  if (groupedAchievements.size === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-2xl font-bold text-slate-300 mb-2">
          No achievements found
        </h3>
        <p className="text-slate-400">
          Enter your API key above to load your mastery point achievements.
        </p>
      </div>
    );
  }

  // If no expansion is selected, show expansion cards
  if (selectedExpansion === null) {
    return (
      <motion.div
        key="expansion-selection"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {REGION_ORDER.map((region) => {
            const allCategoryMap = allGroupedAchievements.get(region);
            let totalInRegion = 0;
            let completedInRegion = 0;

            if (allCategoryMap) {
              allCategoryMap.forEach((achievements) => {
                totalInRegion += achievements.length;
                completedInRegion += achievements.filter(
                  (a) => a.progress?.done
                ).length;
              });
            }

            // Skip regions with no achievements
            if (totalInRegion === 0) {
              return null;
            }

            const goalCount =
              goal === 'required' ? requiredCounts[region] : totalInRegion;

            // Skip completed regions if filter is set to hide completed
            const isComplete = completedInRegion >= goalCount;
            if (filter === 'incomplete' && isComplete) {
              return null;
            }

            return (
              <ExpansionCard
                key={region}
                region={region}
                completed={completedInRegion}
                total={goalCount}
                isComplete={isComplete}
                onClick={() => handleExpansionClick(region)}
              />
            );
          })}
        </div>
      </motion.div>
    );
  }

  // If an expansion is selected, show its achievement categories
  return (
    <motion.div
      key="achievement-details"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      {/* Achievement groups - show selected region */}
      {REGION_ORDER.map((region) => {
        // Only show the selected expansion
        if (region !== selectedExpansion) {
          return null;
        }
        const categoryMap = groupedAchievements.get(region);

        // Skip regions with no achievements
        if (!categoryMap || categoryMap.size === 0) {
          return null;
        }

        // Calculate total achievements in this region from ALL achievements (not just filtered)
        const allCategoryMap = allGroupedAchievements.get(region);
        let totalInRegion = 0;
        let completedInRegion = 0;

        if (allCategoryMap) {
          allCategoryMap.forEach((achievements) => {
            totalInRegion += achievements.length;
            completedInRegion += achievements.filter(
              (a) => a.progress?.done
            ).length;
          });
        }

        // Use required count or total based on goal
        const goalCount =
          goal === 'required' ? requiredCounts[region] : totalInRegion;

        const isComplete = completedInRegion >= goalCount;
        const regionColor = getRegionColor(region);

        return (
          <div key={region} className="mb-4">
            <div
              className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3 shadow-md ${isComplete ? 'border-y-2 border-green-500' : ''
                }`}
              style={{
                backgroundColor: regionColor,
                color: '#ffffff',
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackClick}
                  className="flex items-center justify-center w-10 h-10 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Back to expansions"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h3 className="text-xl font-bold">
                  {getRegionDisplayName(region)}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {isComplete && (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                )}
                <span className="font-bold text-base">
                  {completedInRegion} / {goalCount}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {Array.from(categoryMap.entries())
                .sort(([, achievementsA], [, achievementsB]) => {
                  // Sort by category order (ascending)
                  const orderA = achievementsA[0]?.categoryOrder ?? 999999;
                  const orderB = achievementsB[0]?.categoryOrder ?? 999999;
                  return orderA - orderB;
                })
                .map(([categoryName, achievements]) => {
                  const categoryKey = `${region}-${categoryName}`;
                  const isCategoryCollapsed =
                    collapsedCategories.has(categoryKey);

                  // Filter hidden achievements if showHidden is false
                  const visibleAchievements = showHidden
                    ? achievements
                    : achievements.filter((a) => {
                      const isCompleted = a.progress?.done || false;
                      const isHidden = hiddenAchievements.has(a.id);
                      // If it's completed, it's never hidden
                      if (isCompleted) return true;
                      // Otherwise respect hidden status
                      return !isHidden;
                    });

                  // Sort achievements: incomplete first, completed last
                  const sortedAchievements = [...visibleAchievements].sort((a, b) => {
                    const aCompleted = a.progress?.done || false;
                    const bCompleted = b.progress?.done || false;

                    if (aCompleted !== bCompleted) {
                      return aCompleted ? 1 : -1;
                    }

                    return 0;
                  });

                  // Get total count from ALL achievements (not just filtered)
                  const allAchievementsInCategory =
                    allCategoryMap?.get(categoryName) || [];
                  const totalInCategory = allAchievementsInCategory.length;
                  const completedInCategory = allAchievementsInCategory.filter(
                    (a) => a.progress?.done
                  ).length;

                  return (
                    <div key={categoryKey} className="mx-4">
                      <button
                        onClick={() => toggleCategory(categoryKey)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                      >
                        <h4 className="text-lg font-semibold text-white">
                          {categoryName}
                        </h4>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-300 font-medium text-sm">
                            {completedInCategory} / {totalInCategory}
                          </span>
                          {isCategoryCollapsed ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {!isCategoryCollapsed && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 justify-items-center items-start mt-3">
                          {sortedAchievements.map((achievement) => (
                            <AchievementCard
                              key={achievement.id}
                              achievement={achievement}
                              isHidden={
                                hiddenAchievements.has(achievement.id) &&
                                !achievement.progress?.done
                              }
                              onToggleHidden={onToggleHidden}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                )}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
