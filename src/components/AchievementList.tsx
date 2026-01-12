import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { EnrichedAchievement, MasteryRegion, GoalType, Achievement, AccountAchievement } from '../types/gw2';
import AchievementCard from './AchievementCard';
import { getRegionDisplayName, getRequiredCounts, enrichAchievements, groupByRegionAndCategory } from '../utils/filters';

interface AchievementListProps {
  groupedAchievements: Map<MasteryRegion, Map<string, EnrichedAchievement[]>>;
  allAchievements: Achievement[];
  accountProgress: Map<number, AccountAchievement>;
  categoryMap: Map<number, { categoryId: number; categoryName: string }>;
  earnedPoints: number;
  totalPoints: number;
  goal: GoalType;
}

// Helper function to get region colors matching in-game appearance
function getRegionColors(region: MasteryRegion): { bg: string; border: string; text: string } {
  const colorMap: Record<MasteryRegion, { bg: string; border: string; text: string }> = {
    'Tyria': { bg: 'bg-blue-900/40', border: 'border-blue-600', text: 'text-blue-300' },
    'Maguuma': { bg: 'bg-green-900/40', border: 'border-green-600', text: 'text-green-300' },
    'Desert': { bg: 'bg-purple-900/40', border: 'border-purple-600', text: 'text-purple-300' },
    'Tundra': { bg: 'bg-cyan-900/40', border: 'border-cyan-600', text: 'text-cyan-300' },
    'Jade': { bg: 'bg-emerald-900/40', border: 'border-emerald-500', text: 'text-emerald-300' },
    'Sky': { bg: 'bg-sky-900/40', border: 'border-sky-500', text: 'text-sky-300' },
    'Wild': { bg: 'bg-amber-900/40', border: 'border-amber-600', text: 'text-amber-300' },
    'Magic': { bg: 'bg-violet-900/40', border: 'border-violet-600', text: 'text-violet-300' },
  };
  return colorMap[region];
}

export default function AchievementList({
  groupedAchievements,
  allAchievements,
  accountProgress,
  categoryMap,
  goal,
}: AchievementListProps) {
  const requiredCounts = getRequiredCounts();

  // Group ALL achievements by region for accurate counting
  const allEnrichedAchievements = enrichAchievements(allAchievements, accountProgress, categoryMap);
  const allGroupedAchievements = groupByRegionAndCategory(allEnrichedAchievements);
  // State to track which regions are collapsed - start all collapsed
  const [collapsedRegions, setCollapsedRegions] = useState<Set<MasteryRegion>>(() => {
    return new Set(['Tyria', 'Maguuma', 'Desert', 'Tundra', 'Jade', 'Sky', 'Wild', 'Magic']);
  });

  // State to track which categories are collapsed - start all collapsed
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleRegion = (region: MasteryRegion) => {
    setCollapsedRegions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(region)) {
        newSet.delete(region);
      } else {
        newSet.add(region);
      }
      return newSet;
    });
  };

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

  // Define the order of regions - show all regions even if empty
  const regionOrder: MasteryRegion[] = [
    'Tyria',
    'Maguuma',
    'Desert',
    'Tundra',
    'Jade',
    'Sky',
    'Wild',
    'Magic',
  ];

  return (
    <div className="w-full">
      {/* Achievement groups - show all regions in order */}
      {regionOrder.map((region) => {
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
            completedInRegion += achievements.filter((a) => a.progress?.done).length;
          });
        }

        // Use required count or total based on goal
        const goalCount = goal === 'required' ? requiredCounts[region] : totalInRegion;

        const colors = getRegionColors(region);
        const isRegionCollapsed = collapsedRegions.has(region);

        return (
          <div key={region} className="mb-4">
            <button
              onClick={() => toggleRegion(region)}
              className={`w-full flex items-center justify-between p-5 rounded-xl border-l-4 shadow-lg transition-all duration-200 hover:shadow-xl ${colors.bg} ${colors.border}`}
            >
              <h3 className={`text-2xl md:text-3xl font-bold ${colors.text}`}>
                {getRegionDisplayName(region)}
              </h3>
              <div className="flex items-center gap-4">
                <span className={`${colors.text} font-bold text-lg`}>
                  {completedInRegion} / {goalCount}
                </span>
                {isRegionCollapsed ? (
                  <ChevronDown className={`w-6 h-6 ${colors.text}`} />
                ) : (
                  <ChevronUp className={`w-6 h-6 ${colors.text}`} />
                )}
              </div>
            </button>

            {!isRegionCollapsed && (
              <div className="mt-4 space-y-3">
                {Array.from(categoryMap.entries()).map(([categoryName, achievements]) => {
                  const categoryKey = `${region}-${categoryName}`;
                  const isCategoryCollapsed = collapsedCategories.has(categoryKey);

                  // Sort achievements: incomplete first, completed last
                  const sortedAchievements = [...achievements].sort((a, b) => {
                    const aCompleted = a.progress?.done || false;
                    const bCompleted = b.progress?.done || false;

                    if (aCompleted !== bCompleted) {
                      return aCompleted ? 1 : -1;
                    }

                    return 0;
                  });

                  // Get total count from ALL achievements (not just filtered)
                  const allAchievementsInCategory = allCategoryMap?.get(categoryName) || [];
                  const totalInCategory = allAchievementsInCategory.length;
                  const completedInCategory = allAchievementsInCategory.filter(
                    (a) => a.progress?.done
                  ).length;

                  return (
                    <div key={categoryKey} className="ml-4">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 justify-items-center mt-3">
                          {sortedAchievements.map((achievement) => (
                            <AchievementCard
                              key={achievement.id}
                              achievement={achievement}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
