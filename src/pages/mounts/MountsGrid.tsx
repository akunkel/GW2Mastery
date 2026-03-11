import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import AchievementCard from '../../components/common/AchievementCard';
import MountCard from '../../components/common/MountCard';
import type { MountDefinition } from '../../data/mountDefinitions';
import { useAppStore } from '../../store/useAppStore';
import { getRegionConfig } from '../../utils/regionHelpers';

interface MountsGridProps {
    mounts: MountDefinition[];
    selectedId: string | null;
    onSelectionChange: (id: string | null) => void;
    toolbar?: ReactNode;
}

const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

const pageTransition = { duration: 0.4 };

export default function MountsGrid({
    mounts,
    selectedId,
    onSelectionChange,
    toolbar,
}: MountsGridProps) {
    const enrichedAchievementMap = useAppStore((s) => s.enrichedAchievementMap);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [selectedId]);

    const selectedMount = selectedId ? (mounts.find((m) => m.id === selectedId) ?? null) : null;

    // If something is selected but it's not in this grid, hide entirely
    if (selectedId && !selectedMount) {
        return null;
    }

    if (!selectedMount) {
        return (
            <motion.div
                key="mount-grid"
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
                        <div style={{ gridColumn: '1 / -1' }} className="flex">
                            {toolbar}
                        </div>
                    )}
                    {mounts.map((mount) => (
                        <div key={mount.id} className="h-[130px]">
                            <MountCard mount={mount} onClick={() => onSelectionChange(mount.id)} />
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    }

    const regionConfig = getRegionConfig(selectedMount.region);
    const color = regionConfig.color;
    const isComplete =
        enrichedAchievementMap.get(selectedMount.unlockAchievementId)?.progress?.done === true;
    const achievementSteps = selectedMount.achievementIdsSteps.map((ids) =>
        ids.flatMap((id) => {
            const a = enrichedAchievementMap.get(id);
            return a ? [a] : [];
        })
    );
    const showStepLabels = achievementSteps.length > 1;

    return (
        <motion.div
            key="mount-detail"
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
                    className={`sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 shadow-md ${isComplete ? 'border-b-2 border-green-500' : ''}`}
                    style={{ backgroundColor: color || '#1e293b', color: '#ffffff' }}
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onSelectionChange(null)}
                            className="flex items-center justify-center w-10 h-10 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                            aria-label="Back to overview"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-bold">{selectedMount.name}</h3>
                    </div>
                    {isComplete && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                </div>

                {/* Note */}
                {selectedMount.note && (
                    <div className="mt-4 px-4 sm:px-6 lg:px-8 text-sm text-slate-500">
                        {selectedMount.note}
                    </div>
                )}

                {/* Steps */}
                <div className="mt-4 px-4 sm:px-6 lg:px-8 space-y-3">
                    {achievementSteps.map((stepAchievements, i) => (
                        <div key={i}>
                            {showStepLabels && (
                                <p className="text-base font-semibold text-slate-400 uppercase tracking-wide mb-3">
                                    Step {i + 1}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-4">
                                {stepAchievements.map((achievement) => (
                                    <AchievementCard
                                        key={achievement.id}
                                        achievement={achievement}
                                        showCompletedAchievements={true}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
