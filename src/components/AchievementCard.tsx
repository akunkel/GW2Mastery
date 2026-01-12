import { CheckCircle2, Circle } from 'lucide-react';
import type { EnrichedAchievement, MasteryRegion } from '../types/gw2';
import { getRegionDisplayName } from '../utils/filters';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';

interface AchievementCardProps {
  achievement: EnrichedAchievement;
}

// Helper function to get region Tailwind classes
function getRegionClasses(region: MasteryRegion): {
  bgClass: string;
  completedBgClass: string;
  borderClass: string;
  badgeClass: string;
} {
  const classMap: Record<
    MasteryRegion,
    { bgClass: string; completedBgClass: string; borderClass: string; badgeClass: string }
  > = {
    Tyria: {
      bgClass: 'bg-gradient-to-br from-slate-800 to-blue-900/30',
      completedBgClass: 'bg-gradient-to-br from-slate-800 via-teal-800/40 to-blue-900/30',
      borderClass: 'border-blue-600/50',
      badgeClass: 'bg-blue-600',
    },
    Maguuma: {
      bgClass: 'bg-gradient-to-br from-slate-800 to-green-900/30',
      completedBgClass: 'bg-gradient-to-br from-slate-800 via-emerald-700/45 to-green-900/30',
      borderClass: 'border-green-600/50',
      badgeClass: 'bg-green-600',
    },
    Desert: {
      bgClass: 'bg-gradient-to-br from-slate-800 to-purple-900/30',
      completedBgClass: 'bg-gradient-to-br from-slate-800 via-teal-800/40 to-purple-900/30',
      borderClass: 'border-purple-600/50',
      badgeClass: 'bg-purple-600',
    },
    Tundra: {
      bgClass: 'bg-gradient-to-br from-slate-800 to-cyan-900/30',
      completedBgClass: 'bg-gradient-to-br from-slate-800 via-teal-700/45 to-cyan-900/30',
      borderClass: 'border-cyan-600/50',
      badgeClass: 'bg-cyan-600',
    },
    Jade: {
      bgClass: 'bg-gradient-to-br from-slate-800 to-emerald-900/30',
      completedBgClass: 'bg-gradient-to-br from-slate-800 via-green-700/45 to-emerald-900/30',
      borderClass: 'border-emerald-500/50',
      badgeClass: 'bg-emerald-500',
    },
    Sky: {
      bgClass: 'bg-gradient-to-br from-slate-800 to-sky-900/30',
      completedBgClass: 'bg-gradient-to-br from-slate-800 via-teal-800/40 to-sky-900/30',
      borderClass: 'border-sky-500/50',
      badgeClass: 'bg-sky-500',
    },
    Wild: {
      bgClass: 'bg-gradient-to-br from-slate-800 to-amber-900/30',
      completedBgClass: 'bg-gradient-to-br from-slate-800 via-lime-800/40 to-amber-900/30',
      borderClass: 'border-amber-600/50',
      badgeClass: 'bg-amber-600',
    },
    Magic: {
      bgClass: 'bg-gradient-to-br from-slate-800 to-violet-900/30',
      completedBgClass: 'bg-gradient-to-br from-slate-800 via-teal-800/40 to-violet-900/30',
      borderClass: 'border-violet-600/50',
      badgeClass: 'bg-violet-600',
    },
  };
  return classMap[region];
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const { name, requirement, icon, progress, masteryRegion } = achievement;
  const isCompleted = progress?.done || false;

  const getProgressPercentage = (): number => {
    if (!progress || !progress.max) return 0;
    return Math.round(((progress.current || 0) / progress.max) * 100);
  };

  // Strip HTML tags from requirement text
  const cleanDescription = (text: string): string => {
    return text.replace(/<[^>]*>/g, '');
  };

  const classes = masteryRegion
    ? getRegionClasses(masteryRegion)
    : {
        bgClass: 'bg-slate-800',
        completedBgClass: 'bg-gradient-to-br from-slate-800 via-teal-900/20 to-slate-800',
        borderClass: 'border-slate-600',
        badgeClass: 'bg-slate-600',
      };

  return (
    <Card
      className={cn(
        'w-80 h-36 flex flex-col border-2',
        isCompleted ? classes.completedBgClass : classes.bgClass,
        isCompleted ? 'border-green-500' : classes.borderClass
      )}
    >
      <CardContent className="p-3 flex flex-col h-full">
        {/* Header with icon and title */}
        <div className="flex items-start gap-2 mb-2">
          {icon && (
            <img
              src={icon}
              alt={name}
              className="w-8 h-8 rounded border border-slate-600 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-1">
              {name}
            </h3>
            {masteryRegion && (
              <span
                className={cn(
                  'inline-block px-1.5 py-0.5 text-[10px] font-bold text-white/70 rounded',
                  classes.badgeClass
                )}
              >
                {getRegionDisplayName(masteryRegion)}
              </span>
            )}
          </div>
          {isCompleted && (
            <div className="flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>

        {/* Requirement (unlock criteria) */}
        <p className="text-xs text-slate-300 mb-2 line-clamp-2 flex-grow">
          {cleanDescription(requirement)}
        </p>

        {/* Progress bar */}
        {progress && progress.max && progress.max > 1 && (
          <div className="mt-auto">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
              <span>Progress</span>
              <span className="text-white">
                {progress.current || 0} / {progress.max}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden shadow-inner">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  isCompleted
                    ? 'bg-gradient-to-r from-green-500 to-green-400'
                    : 'bg-gradient-to-r from-blue-500 to-blue-400'
                )}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}

        {/* Completion status for simple achievements */}
        {(!progress || !progress.max || progress.max === 1) && (
          <div className="mt-auto pt-1 border-t border-slate-700/50">
            {isCompleted ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Circle className="w-3 h-3" />
                <span>Not completed</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
