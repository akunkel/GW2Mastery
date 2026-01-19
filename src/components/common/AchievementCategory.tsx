import { Bug, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { EnrichedCategory, FilterType } from '../../types/gw2';
import AchievementCard from './AchievementCard';

interface AchievementCategoryProps {
    category: EnrichedCategory;
    filter: FilterType;
    hiddenAchievements: Set<number>;
    showHidden: boolean;
    onToggleHidden: (achievementId: number) => void;
}

export default function AchievementCategory({
    category,
    filter,
    hiddenAchievements,
    showHidden,
    onToggleHidden,
}: AchievementCategoryProps) {
    const [hasToggled, setHasToggled] = useState(false);

    const { name, achievements, totalCount, completedCount } = category;
    const isCategoryComplete = totalCount > 0 && completedCount >= totalCount;

    // If complete -> default collapsed (so toggle=false -> collapsed).
    // If incomplete -> default expanded (so toggle=false -> expanded).
    const isCollapsed = isCategoryComplete ? !hasToggled : hasToggled;

    // Filter and sort achievements
    const sortedAchievements = [...achievements]
        .filter((a) => {
            if (a.progress?.done) return true; // Always show completed
            if (showHidden) return true; // Show all if toggle is on
            return !hiddenAchievements.has(a.id); // Hide if in hidden list
        })
        .sort((a, b) => {
            const aCompleted = a.progress?.done || false;
            const bCompleted = b.progress?.done || false;
            if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
            return 0;
        });

    return (
        <div>
            <div
                onClick={() => setHasToggled(!hasToggled)}
                className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg transition-all border-2 cursor-pointer select-none',
                    isCategoryComplete
                        ? 'bg-slate-700/80 border-green-500 shadow-md'
                        : 'bg-slate-700/50 hover:bg-slate-700 border-transparent'
                )}
            >
                <div className="flex items-center gap-3">
                    {isCategoryComplete && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    <h4
                        className={cn(
                            'text-lg font-semibold',
                            isCategoryComplete ? 'text-green-50 font-bold' : 'text-white'
                        )}
                    >
                        {name}
                    </h4>
                </div>
                <div className="flex items-center gap-3">
                    {/* Debug Button (Dev only) */}
                    {import.meta.env.DEV && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('Category Data:', category);
                            }}
                            className="p-1.5 rounded-md hover:bg-slate-600 transition-all text-slate-400 hover:text-blue-300"
                            title="Debug: Log Category Data"
                        >
                            <Bug className="w-4 h-4" />
                        </button>
                    )}
                    <span
                        className={cn(
                            'font-medium text-sm',
                            isCategoryComplete ? 'text-green-400' : 'text-slate-300'
                        )}
                    >
                        {completedCount} / {totalCount}
                    </span>
                    {isCollapsed ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <div className="flex flex-wrap gap-4 justify-center mt-3 px-2">
                    {sortedAchievements.map((achievement) => (
                        <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            isHidden={
                                hiddenAchievements.has(achievement.id) &&
                                !achievement.progress?.done
                            }
                            onToggleHidden={onToggleHidden}
                            filter={filter}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
