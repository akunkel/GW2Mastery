import { Bug, CheckCircle2, ChevronDown, ChevronUp, Circle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { EnrichedAchievement, FilterType } from '../../types/gw2';
import { Card, CardContent } from '../ui/card';

interface AchievementCardProps {
    achievement: EnrichedAchievement;
    isHidden?: boolean;
    onToggleHidden?: (achievementId: number) => void;
    filter?: FilterType;
}

// Helper functions
const cleanDescription = (text: string): string => {
    return text.replace(/<[^>]*>/g, '');
};

const getProgressPercentage = (current: number = 0, max: number = 0): number => {
    if (!max) return 0;
    return Math.round((current / max) * 100);
};

export default function AchievementCard({
    achievement,
    isHidden = false,
    onToggleHidden,
    filter = 'all',
}: AchievementCardProps) {
    const { name, requirement, icon, progress, bits } = achievement;
    const isCompleted = progress?.done || false;

    // Check if achievement has multiple parts
    const hasMultipleParts = bits && bits.length > 0;

    // State to track if the parts list is expanded (default: collapsed)
    const [isExpanded, setIsExpanded] = useState(false);

    if (filter === 'incomplete' && isCompleted) {
        return null;
    }

    return (
        <Card
            className={cn(
                'w-full max-w-80 flex flex-col border-2 bg-slate-800 min-h-[138px] relative group',
                isCompleted ? 'border-green-500' : 'border-slate-600',
                isHidden && 'opacity-50'
            )}
        >
            {/* Top Right Controls (Debug + Hide) */}
            <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Debug Button (Dev only) */}
                {import.meta.env.DEV && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log(achievement);
                        }}
                        className="p-1.5 rounded-md bg-slate-700/90 hover:bg-slate-600 transition-all text-slate-300 hover:text-blue-300"
                        title="Debug: Log Data"
                    >
                        <Bug className="w-4 h-4" />
                    </button>
                )}

                {/* Hidden toggle button - only show if NOT completed and handler exists */}
                {!isCompleted && onToggleHidden && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleHidden(achievement.id);
                        }}
                        className="p-1.5 rounded-md bg-slate-700/90 hover:bg-slate-600 transition-all"
                        aria-label={isHidden ? 'Show achievement' : 'Hide achievement'}
                    >
                        {isHidden ? (
                            <EyeOff className="w-4 h-4 text-slate-300" />
                        ) : (
                            <Eye className="w-4 h-4 text-slate-300" />
                        )}
                    </button>
                )}
            </div>

            <CardContent className="p-3 flex flex-col h-full min-h-0">
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
                        <a
                            href={`https://wiki.guildwars2.com/wiki/${encodeURIComponent(name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-white text-sm leading-tight hover:text-blue-400 group-hover:underline transition-colors"
                        >
                            {name}
                        </a>
                    </div>
                    {isCompleted && (
                        <div className="flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                    )}
                </div>

                {/* Requirement (unlock criteria) */}
                <p className={cn('text-xs text-slate-300 mb-2', isCompleted && 'line-clamp-3')}>
                    {cleanDescription(requirement)}
                </p>

                {/* Multi-part achievement objectives */}
                {hasMultipleParts && (
                    <>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors mb-2"
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                            ) : (
                                <ChevronDown className="w-3 h-3" />
                            )}
                            <span className="font-medium">
                                {isExpanded ? 'Hide' : 'Show'} objectives ({bits.length})
                            </span>
                        </button>

                        {isExpanded && (
                            <div className="mb-2 flex-grow">
                                <ul className="space-y-1">
                                    {bits.map((bit, index) => {
                                        const bitCompleted =
                                            progress?.bits?.includes(index) ?? false;
                                        return (
                                            <li
                                                key={index}
                                                className="flex items-start gap-2 text-xs"
                                            >
                                                {bitCompleted ? (
                                                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <Circle className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                                                )}
                                                <span
                                                    className={cn(
                                                        bitCompleted
                                                            ? 'text-slate-400 line-through'
                                                            : 'text-slate-300'
                                                    )}
                                                >
                                                    {bit.text
                                                        ? cleanDescription(bit.text)
                                                        : `Part ${index + 1}`}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </>
                )}

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
                                style={{
                                    width: `${getProgressPercentage(progress.current, progress.max)}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Completion status for simple achievements */}
                {(!progress || !progress.max || progress.max === 1) && isCompleted && (
                    <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
