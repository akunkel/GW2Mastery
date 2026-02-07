import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import type {
    CollectibleAchievementProgress,
    ZoneExplorerProgress,
    ZoneInsightProgress,
} from '../../hooks/useExplorerProgress';

interface ZoneTooltipProps {
    zoneName: string;
    explorerProgress?: ZoneExplorerProgress | null;
    insightProgress?: ZoneInsightProgress;
    collectibleAchievements?: CollectibleAchievementProgress[];
    includeCollectiblesInProgress?: boolean;
    children: ReactNode;
}

export function ZoneTooltip({
    zoneName,
    explorerProgress,
    insightProgress,
    collectibleAchievements,
    includeCollectiblesInProgress = false,
    children,
}: ZoneTooltipProps) {
    const otherAchievementsCount = collectibleAchievements?.length ?? 0;
    const otherAchievementsCompleted =
        collectibleAchievements?.filter((a) => a.isComplete).length ?? 0;

    const hasAnyProgress = explorerProgress || insightProgress || otherAchievementsCount > 0;

    const explorerLine = explorerProgress && (
        <div
            className={`text-[9px] leading-tight ${explorerProgress.isComplete ? 'text-slate-500' : 'text-slate-300'}`}
        >
            Explorer: {explorerProgress.completedBits}/{explorerProgress.totalBits}
        </div>
    );

    const insightLine = insightProgress && (
        <div
            className={`text-[9px] leading-tight ${insightProgress.isComplete ? 'text-slate-500' : 'text-slate-300'}`}
        >
            Insights: {insightProgress.completed}/{insightProgress.total}
        </div>
    );

    const otherLine = includeCollectiblesInProgress && otherAchievementsCount > 0 && (
        <div
            className={`text-[9px] leading-tight ${otherAchievementsCompleted === otherAchievementsCount ? 'text-slate-500' : 'text-slate-300'}`}
        >
            Other: {otherAchievementsCompleted}/{otherAchievementsCount}
        </div>
    );

    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side="top">
                <div className="text-center">
                    <div className="font-semibold text-white leading-tight mb-1">{zoneName}</div>
                    {explorerLine}
                    {insightLine}
                    {otherLine}
                    {!hasAnyProgress && (
                        <div className="text-[10px] leading-tight text-slate-400">
                            No achievement data
                        </div>
                    )}
                    {hasAnyProgress && (
                        <div className="text-[8px] leading-tight text-amber-500 mt-1">
                            Click for more…
                        </div>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    );
}
