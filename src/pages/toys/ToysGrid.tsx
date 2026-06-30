import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import AchievementCard from '../../components/common/AchievementCard';
import NoveltyCard from '../../components/common/NoveltyCard';
import { useAppStore } from '../../store/useAppStore';
import type { NoveltyEntry } from '../../types/novelty';

const cleanDescription = (text: string): string => {
  return text.replace(/<[^>]*>/g, '');
};

interface ToysGridProps {
  novelties: NoveltyEntry[];
  selectedId: number | null;
  onSelectionChange: (id: number | null) => void;
  label: string;
  defaultCollapsed?: boolean;
}

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = { duration: 0.4 };

export default function ToysGrid({
  novelties,
  selectedId,
  onSelectionChange,
  label,
  defaultCollapsed = false,
}: ToysGridProps) {
  const enrichedAchievementMap = useAppStore((s) => s.enrichedAchievementMap);
  const unlockedNoveltyIds = useAppStore((s) => s.unlockedNoveltyIds);

  useEffect(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [selectedId]);

  const selected = selectedId != null
    ? (novelties.find((n) => n.id === selectedId) ?? null)
    : null;

  // If something is selected but not in this grid, hide entirely
  if (selectedId != null && !selected) {
    return null;
  }

  const unlockedCount = novelties.filter((n) => unlockedNoveltyIds.has(n.id)).length;

  if (!selected) {
    return (
      <motion.div
        key="novelty-grid"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        <CollapsibleSection
          label={label}
          count={unlockedCount}
          total={novelties.length}
          defaultCollapsed={defaultCollapsed}
        >
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, 280px)',
              justifyContent: 'center',
            }}
          >
            {novelties.map((novelty) => (
              <div key={novelty.id} className="h-[68px]">
                <NoveltyCard
                  novelty={novelty}
                  isUnlocked={unlockedNoveltyIds.has(novelty.id)}
                  disabled={novelty.achievementIds.length === 0}
                  onClick={() => onSelectionChange(novelty.id)}
                />
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </motion.div>
    );
  }

  const isUnlocked = unlockedNoveltyIds.has(selected.id);
  const linkedAchievements = selected.achievementIds
    .map((id) => enrichedAchievementMap.get(id))
    .filter((a) => a != null);

  return (
    <motion.div
      key="novelty-detail"
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
          className={`group sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 mt-4 shadow-md bg-slate-800 ${isUnlocked ? 'border-b-2 border-green-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectionChange(null)}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Back to overview"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            {selected.icon && (
              <img
                src={selected.icon}
                alt={selected.name}
                className="w-10 h-10 object-contain"
              />
            )}
            <h3 className="text-xl font-bold text-white">{selected.name}</h3>
          </div>
          {isUnlocked && <CheckCircle2 className="w-5 h-5 text-green-400" />}
        </div>

        {/* Description */}
        {selected.description && (
          <div className="mt-4 px-4 sm:px-6 lg:px-8 text-sm text-slate-400">
            {cleanDescription(selected.description)}
          </div>
        )}

        {/* Linked Achievements */}
        {linkedAchievements.length > 0 && (
          <div className="mt-4 px-4 sm:px-6 lg:px-8 space-y-3">
            <p className="text-base font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Unlock Achievements
            </p>
            <div className="flex flex-wrap gap-4">
              {linkedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  showCompletedAchievements={true}
                  showRecommended={false}
                />
              ))}
            </div>
          </div>
        )}

        {linkedAchievements.length === 0 && (
          <div className="mt-4 px-4 sm:px-6 lg:px-8 text-sm text-slate-500">
            No linked achievement found. This item may be obtained from the Gem Store,
            Trading Post, or other in-game sources.
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CollapsibleSection({
  label,
  count,
  total,
  defaultCollapsed,
  children,
}: {
  label: string;
  count: number;
  total: number;
  defaultCollapsed: boolean;
  children: ReactNode;
}) {
  const [hasToggled, setHasToggled] = useState(false);
  const isComplete = total > 0 && count >= total;
  const isCollapsed = defaultCollapsed ? !hasToggled : hasToggled;

  return (
    <div>
      <div
        onClick={() => setHasToggled(!hasToggled)}
        className={cn(
          'w-full flex items-center justify-between p-3 rounded-lg transition-all border-2 cursor-pointer select-none',
          isComplete
            ? 'bg-slate-700/80 border-green-500 shadow-md'
            : 'bg-slate-700/50 hover:bg-slate-700 border-transparent'
        )}
      >
        <div className="flex items-center gap-3">
          {isComplete && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          <h4
            className={cn(
              'text-lg font-semibold',
              isComplete ? 'text-green-50 font-bold' : 'text-white'
            )}
          >
            {label}
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'font-medium text-sm',
              isComplete ? 'text-green-400' : 'text-slate-300'
            )}
          >
            {count} / {total}
          </span>
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>
      {!isCollapsed && <div className="mt-3">{children}</div>}
    </div>
  );
}
