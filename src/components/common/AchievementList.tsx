import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { EnrichedGroup } from '../../types/gw2';
import AchievementCategory from './AchievementCategory';
import RegionCard from './RegionCard';

export interface UIAchievementSection extends EnrichedGroup {
    title?: string; // Optional override for display
    image?: string;
    color?: string;
    isComplete?: boolean;
}

export interface CardProps {
    section: UIAchievementSection;
    onClick: () => void;
}

interface AchievementListProps {
    sections: UIAchievementSection[];
    selectedId?: string | null;
    onSelectionChange?: (id: string | null) => void;
    toolbar?: React.ReactNode;
    sectionComponent?: React.ComponentType<CardProps>;

    showCompletedAchievements: boolean;
    hiddenAchievements?: Set<number>;
    showHidden?: boolean;
    onToggleHidden?: (achievementId: number) => void;
}

export default function AchievementList({
    sections,
    selectedId,
    onSelectionChange,
    toolbar,
    sectionComponent,
    showCompletedAchievements,
    hiddenAchievements = new Set(),
    showHidden = false,
    onToggleHidden = () => {},
}: AchievementListProps) {
    // State to track selected section for uncontrolled mode
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

    // Determine current selection based on controlled vs uncontrolled
    const isControlled = selectedId !== undefined;
    const currentSelectedId = isControlled ? selectedId : internalSelectedId;

    const handleSectionSelect = (id: string | null) => {
        if (!isControlled) {
            setInternalSelectedId(id);
        }
        onSelectionChange?.(id);
    };

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

    if (sections.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-slate-300 mb-2">No achievements found</h3>
            </div>
        );
    }

    // If no section is selected, show the grid
    if (currentSelectedId === null) {
        const SectionComp = sectionComponent ?? RegionCard;
        return (
            <motion.div
                key="section-selection"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className="w-full"
            >
                <div
                    className="grid gap-4"
                    style={{
                        gridTemplateColumns: 'repeat(auto-fill, 360px)',
                        justifyContent: 'center',
                    }}
                >
                    {toolbar && (
                        <div style={{ gridColumn: '1 / -1' }} className="flex justify-end">
                            {toolbar}
                        </div>
                    )}
                    {sections.map((section) => (
                        <div key={section.id} className="h-[130px]">
                            <SectionComp
                                section={section}
                                onClick={() => handleSectionSelect(section.id)}
                            />
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    }

    // Show details for selected section
    const selectedSection = sections.find((s) => s.id === currentSelectedId);

    const isSectionComplete = selectedSection
        ? (selectedSection.isComplete ??
          (selectedSection.totalCount > 0 &&
              selectedSection.completedCount >= selectedSection.totalCount))
        : false;

    if (!selectedSection) {
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
                    className={`sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 shadow-md ${isSectionComplete ? 'border-b-2 border-green-500' : ''}`}
                    style={{
                        backgroundColor: selectedSection.color || '#1e293b',
                        color: '#ffffff',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSectionSelect(null)}
                            className="flex items-center justify-center w-10 h-10 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                            aria-label="Back to overview"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-bold">
                            {selectedSection.title || selectedSection.name}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {isSectionComplete && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        <span className="font-bold text-base">
                            {selectedSection.completedCount} / {selectedSection.totalCount}
                        </span>
                    </div>
                </div>

                {/* Categories List */}
                <div className="mt-4 space-y-3 px-4 sm:px-6 lg:px-8">
                    {/* Categories List */}
                    <div className="mt-4 space-y-3 px-4 sm:px-6 lg:px-8">
                        {selectedSection.categories
                            .filter(
                                (category) =>
                                    showCompletedAchievements ||
                                    category.completedCount < category.totalCount
                            )
                            .map((category) => (
                                <AchievementCategory
                                    key={`${selectedSection.id}-${category.id}`}
                                    category={category}
                                    showCompletedAchievements={showCompletedAchievements}
                                    hiddenAchievements={hiddenAchievements}
                                    showHidden={showHidden}
                                    onToggleHidden={onToggleHidden}
                                />
                            ))}
                    </div>
                    {selectedSection.id === 'Tundra' && (
                        <p className="text-xs text-slate-400 py-4 px-10">
                            Credit to{' '}
                            <a
                                href="https://www.reddit.com/r/Guildwars2/comments/j1ya99/icebrood_saga_logo_recolored_from_one_of_the/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-slate-300 transition-colors"
                            >
                                u/KortasEE
                            </a>{' '}
                            for the Icebrood Saga artwork!
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
