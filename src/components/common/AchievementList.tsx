import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import type { FilterType } from '../../types/gw2';
import AchievementCard from './AchievementCard';
import RegionCard from './RegionCard';

import type { EnrichedGroup } from '../../types/gw2';

export interface UIAchievementGroup extends EnrichedGroup {
    title?: string; // Optional override for display
    image?: string;
    color?: string;
    isComplete?: boolean;
}

interface AchievementListProps {
    groups: UIAchievementGroup[];
    selectedId?: string | null;
    onSelectionChange?: (id: string | null) => void;

    filter: FilterType;
    hiddenAchievements: Set<number>;
    showHidden: boolean;
    onToggleHidden: (achievementId: number) => void;
}

export default function AchievementList({
    groups,
    selectedId,
    onSelectionChange,
    filter,
    hiddenAchievements,
    showHidden,
    onToggleHidden,
}: AchievementListProps) {
    // State to track selected group for uncontrolled mode
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

    // Determine current selection based on controlled vs uncontrolled
    const isControlled = selectedId !== undefined;
    const currentSelectedId = isControlled ? selectedId : internalSelectedId;

    const handleGroupSelect = (id: string | null) => {
        if (!isControlled) {
            setInternalSelectedId(id);
        }
        onSelectionChange?.(id);
    };

    // State to track which categories have been manually toggled by the user
    // If a category is complete, it defaults to collapsed, so toggling it expands it.
    // If a category is incomplete, it defaults to expanded, so toggling it collapses it.
    const [manuallyToggledCategories, setManuallyToggledCategories] = useState<Set<string>>(
        new Set()
    );

    // Animation variants
    const pageVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const pageTransition = { duration: 0.4 };

    // Scroll to top when selection changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentSelectedId]);

    const toggleCategory = (categoryKey: string) => {
        setManuallyToggledCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryKey)) {
                newSet.delete(categoryKey);
            } else {
                newSet.add(categoryKey);
            }
            return newSet;
        });
    };

    if (groups.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-slate-300 mb-2">No achievements found</h3>
            </div>
        );
    }

    // If no group is selected, show ProgressCards
    if (currentSelectedId === null) {
        return (
            <motion.div
                key="group-selection"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className="w-full"
            >
                <div className="flex flex-wrap gap-4 justify-center">
                    {groups.map((group) => {
                        // Apply filtering logic for the group card visibility?
                        // Assuming parent filters groups passed in, or we just show them.
                        // If filter === 'incomplete' and group is complete, maybe hide?
                        // Generally better if parent handles data filtering, but we can do simple check here.
                        const isComplete =
                            group.isComplete ??
                            (group.totalCount > 0 && group.completedCount >= group.totalCount);

                        return (
                            <div key={group.id} className="flex-none w-[360px] h-[130px]">
                                <RegionCard
                                    title={group.title || group.name}
                                    image={group.image}
                                    color={group.color || '#1e293b'}
                                    completed={group.completedCount}
                                    total={group.totalCount}
                                    isComplete={isComplete}
                                    onClick={() => handleGroupSelect(group.id)}
                                />
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        );
    }

    // Show details for selected group
    const selectedGroup = groups.find((g) => g.id === currentSelectedId);

    const isGroupComplete = selectedGroup
        ? (selectedGroup.isComplete ??
          (selectedGroup.totalCount > 0 &&
              selectedGroup.completedCount >= selectedGroup.totalCount))
        : false;

    if (!selectedGroup) {
        // Fallback if selection is invalid
        return null;
    }

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
            <div className="mb-4">
                {/* Sticky Header */}
                <div
                    className={`sticky top-12 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 shadow-md ${isGroupComplete ? 'border-b-2 border-green-500' : ''}`}
                    style={{
                        backgroundColor: selectedGroup.color || '#1e293b', // Fallback color
                        color: '#ffffff',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleGroupSelect(null)}
                            className="flex items-center justify-center w-10 h-10 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                            aria-label="Back to overview"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-bold">
                            {selectedGroup.title || selectedGroup.name}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {isGroupComplete && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        <span className="font-bold text-base">
                            {selectedGroup.completedCount} / {selectedGroup.totalCount}
                        </span>
                    </div>
                </div>

                {/* Categories List */}
                <div className="mt-4 space-y-3 px-4 sm:px-6 lg:px-8">
                    {/* Categories List */}
                    <div className="mt-4 space-y-3 px-4 sm:px-6 lg:px-8">
                        {selectedGroup.categories.map((category) => {
                            const categoryName = category.name;
                            const achievements = category.achievements;
                            const categoryKey = `${selectedGroup.id}-${category.id}`;

                            // Calculate filtered achievements for display
                            // ... existing logic ...
                            // Actually, if we use filterEnrichedHierarchy, the achievements are ALREADY filtered in the group structure?
                            // "User: ...helper method... to filter it down...".
                            // If `groups` passed in are already filtered, we don't need to re-filter here?
                            // Yes, `AchievementList` shouldn't do business logic filtering if the parent did it.
                            // BUT `AchievementList` has `filter` prop.
                            // The `AchievementCard` does the final "hide if incomplete" check.
                            // The `filterEnrichedHierarchy` does pre-filtering.

                            // Let's assume `achievements` is the list we want to show (or filter further).
                            // We still need to sort them.

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

                            // Stats for the header
                            // If hierarchy is pre-filtered, totalInCategory might be lower than actual total?
                            // `EnrichedCategory` has `totalCount` and `completedCount` properties! Use those!
                            // That way even if we filter the list, we show correct stats.

                            const { totalCount, completedCount } = category;
                            const isCategoryComplete =
                                totalCount > 0 && completedCount >= totalCount;

                            // Derived state:
                            const hasToggled = manuallyToggledCategories.has(categoryKey);
                            const isCategoryCollapsed = isCategoryComplete
                                ? !hasToggled
                                : hasToggled;

                            return (
                                <div key={categoryKey}>
                                    <button
                                        onClick={() => toggleCategory(categoryKey)}
                                        className={cn(
                                            'w-full flex items-center justify-between p-3 rounded-lg transition-all border-2',
                                            isCategoryComplete
                                                ? 'bg-slate-700/80 border-green-500 shadow-md'
                                                : 'bg-slate-700/50 hover:bg-slate-700 border-transparent'
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isCategoryComplete && (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            )}
                                            <h4
                                                className={cn(
                                                    'text-lg font-semibold',
                                                    isCategoryComplete
                                                        ? 'text-green-50 font-bold'
                                                        : 'text-white'
                                                )}
                                            >
                                                {categoryName}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    'font-medium text-sm',
                                                    isCategoryComplete
                                                        ? 'text-green-400'
                                                        : 'text-slate-300'
                                                )}
                                            >
                                                {completedCount} / {totalCount}
                                            </span>
                                            {isCategoryCollapsed ? (
                                                <ChevronDown className="w-5 h-5 text-slate-400" />
                                            ) : (
                                                <ChevronUp className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                    </button>

                                    {!isCategoryCollapsed && (
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
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
