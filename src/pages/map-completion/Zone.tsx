import { memo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import type {
    CollectibleAchievementProgress,
    ZoneExplorerProgress,
    ZoneInsightProgress,
} from '../../hooks/useExplorerProgress';
import { getTextStroke } from '../../lib/utils';
import type { MasteryRegion } from '../../types/gw2';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '../../utils/mapCoordinates';
import { getRegionZoneColor } from '../../utils/regionHelpers';

interface ZoneProps {
    id: number;
    name: string;
    polygonPoints: string;
    center: [number, number];
    masteryRegion?: MasteryRegion;
    explorerProgress?: ZoneExplorerProgress | null; // null = no achievement exists, undefined = no data yet
    insightProgress?: ZoneInsightProgress; // undefined = zone has no mastery insights
    collectibleAchievements?: CollectibleAchievementProgress[]; // undefined = zone has no collectible achievements
    includeCollectiblesInProgress?: boolean; // whether to include collectibles in the progress bar
}

export const Zone = memo(
    ({
        id,
        name,
        polygonPoints,
        center,
        masteryRegion,
        explorerProgress,
        insightProgress,
        collectibleAchievements,
        includeCollectiblesInProgress = false,
    }: ZoneProps) => {
        // Get region color or fallback to white
        const baseColor = getRegionZoneColor(masteryRegion ?? 'Tyria');
        // Parse polygon points to get coordinates
        const points = polygonPoints.split(' ').map((point) => {
            const [x, y] = point.split(',').map(Number);
            return { x, y };
        });
        // Calculate bounding box
        const xCoords = points.map((p) => p.x);
        const yCoords = points.map((p) => p.y);
        const minX = Math.min(...xCoords);
        const maxX = Math.max(...xCoords);
        const minY = Math.min(...yCoords);
        const maxY = Math.max(...yCoords);
        const width = maxX - minX;
        const height = maxY - minY;

        // Convert bounding box to percentages
        const leftPercent = (minX / IMAGE_WIDTH) * 100;
        const topPercent = (minY / IMAGE_HEIGHT) * 100;
        const widthPercent = (width / IMAGE_WIDTH) * 100;
        const heightPercent = (height / IMAGE_HEIGHT) * 100;

        // Convert polygon points relative to the element's own coordinate system
        const clipPathPoints = points
            .map((point) => {
                const xPercent = ((point.x - minX) / width) * 100;
                const yPercent = ((point.y - minY) / height) * 100;
                return `${xPercent}% ${yPercent}%`;
            })
            .join(', ');

        // Font size scales with the zone's rendered size (as percentage of viewport)
        // widthPercent is the zone's width as % of map, and map is 100vw wide
        // Use the smaller of width-based or height-based sizing to fit within zone bounds
        const fontSizeVw = Math.min(widthPercent * 0.12, heightPercent * 0.25);

        // Calculate combined progress from all tracked types (sum of completed / sum of total)
        const getCombinedProgress = (): { percentage: number; hasProgress: boolean } => {
            let totalCompleted = 0;
            let totalItems = 0;

            if (explorerProgress) {
                totalCompleted += explorerProgress.completedBits;
                totalItems += explorerProgress.totalBits;
            }
            if (insightProgress) {
                totalCompleted += insightProgress.completed;
                totalItems += insightProgress.total;
            }
            if (includeCollectiblesInProgress && collectibleAchievements) {
                for (const achievement of collectibleAchievements) {
                    totalCompleted += achievement.completedBits;
                    totalItems += achievement.totalBits;
                }
            }

            if (totalItems === 0) {
                return { percentage: 0, hasProgress: false };
            }

            return {
                percentage: Math.round((totalCompleted / totalItems) * 100),
                hasProgress: true,
            };
        };

        const combinedProgress = getCombinedProgress();

        // Dialog state for showing full achievement details
        const [dialogOpen, setDialogOpen] = useState(false);

        // Convert a name to a wiki URL (spaces become underscores)
        const toWikiUrl = (text: string) =>
            `https://wiki.guildwars2.com/wiki/${encodeURIComponent(text.replace(/ /g, '_'))}`;

        // Calculate other achievements count
        const otherAchievementsCount = collectibleAchievements?.length ?? 0;
        const otherAchievementsCompleted =
            collectibleAchievements?.filter((a) => a.isComplete).length ?? 0;

        // Determine tooltip content (simplified summary)
        const getTooltipContent = () => {
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

            const hasAnyProgress =
                explorerProgress || insightProgress || otherAchievementsCount > 0;

            return (
                <div className="text-center">
                    <div className="font-semibold text-white leading-tight mb-1">{name}</div>
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
            );
        };

        const hasAnyProgress = explorerProgress || insightProgress || otherAchievementsCount > 0;

        return (
            <>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className="absolute pointer-events-auto cursor-pointer flex items-center justify-center transition-[background] duration-200 bg-[color-mix(in_srgb,var(--zone-base-color)_50%,transparent)] hover:bg-[color-mix(in_srgb,var(--zone-base-color)_50%,transparent)] border border-[color-mix(in_srgb,var(--zone-base-color)_50%,transparent)]"
                            style={
                                {
                                    '--zone-base-color': baseColor,
                                    left: `${leftPercent}%`,
                                    top: `${topPercent}%`,
                                    width: `${widthPercent}%`,
                                    height: `${heightPercent}%`,
                                    clipPath: `polygon(${clipPathPoints})`,
                                } as React.CSSProperties
                            }
                            onClick={() => {
                                if (hasAnyProgress) {
                                    setDialogOpen(true);
                                }
                                if (import.meta.env.DEV) {
                                    console.log('Zone clicked:', {
                                        id,
                                        name,
                                        center,
                                        polygonPoints,
                                    });
                                }
                            }}
                        >
                            {/* Zone label and progress bar */}
                            <div className="pointer-events-none select-none flex flex-col items-center w-full max-w-[80%]">
                                <div
                                    className="text-center text-white font-bold leading-tight"
                                    style={{
                                        fontSize: `${fontSizeVw}vw`,
                                        fontFamily: 'system-ui, -apple-system, sans-serif',
                                        textShadow: getTextStroke(0.08),
                                        WebkitFontSmoothing: 'antialiased',
                                        MozOsxFontSmoothing: 'grayscale',
                                    }}
                                >
                                    {name}
                                </div>
                                {/* Progress bar - show if any tracked progress exists */}
                                {combinedProgress.hasProgress && (
                                    <div
                                        className="mt-0.5 rounded-full overflow-hidden w-3/4 h-1"
                                        style={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        }}
                                    >
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${combinedProgress.percentage === 100 ? 'bg-green-500' : 'bg-green-700'}`}
                                            style={{
                                                width: `${combinedProgress.percentage}%`,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">{getTooltipContent()}</TooltipContent>
                </Tooltip>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">
                                <a
                                    href={toWikiUrl(name)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-amber-300 transition-colors"
                                >
                                    {name}
                                </a>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Explorer Achievement */}
                            {explorerProgress && (
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-300 mb-2">
                                        Explorer Achievement
                                    </h3>
                                    <div
                                        className={`text-sm ${explorerProgress.isComplete ? 'text-slate-500' : 'text-white'}`}
                                    >
                                        <a
                                            href={toWikiUrl(explorerProgress.achievementName)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-amber-300 transition-colors"
                                        >
                                            {explorerProgress.achievementName}
                                        </a>
                                        <span className="text-slate-400 ml-2">
                                            {explorerProgress.completedBits}/
                                            {explorerProgress.totalBits}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Mastery Insights */}
                            {insightProgress && (
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-300 mb-2">
                                        Mastery Insights ({insightProgress.completed}/
                                        {insightProgress.total})
                                    </h3>
                                    <div className="space-y-1">
                                        {[...insightProgress.insights]
                                            .sort((a, b) => {
                                                // First by completion (incomplete first)
                                                const completeDiff =
                                                    Number(a.isComplete) - Number(b.isComplete);
                                                if (completeDiff !== 0) return completeDiff;
                                                // Then alphabetically
                                                return a.achievementName.localeCompare(
                                                    b.achievementName
                                                );
                                            })
                                            .map((insight) => (
                                                <div
                                                    key={insight.achievementId}
                                                    className={`text-sm ${insight.isComplete ? 'text-slate-500' : 'text-white'}`}
                                                >
                                                    <a
                                                        href={toWikiUrl(insight.achievementName)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-amber-300 transition-colors"
                                                    >
                                                        {insight.achievementName}
                                                    </a>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Other Achievements */}
                            {collectibleAchievements && collectibleAchievements.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-300 mb-2">
                                        Other Achievements ({otherAchievementsCompleted}/
                                        {otherAchievementsCount})
                                    </h3>
                                    <div className="space-y-1">
                                        {[...collectibleAchievements]
                                            .sort((a, b) => {
                                                // First by completion (incomplete first)
                                                const completeDiff =
                                                    Number(a.isComplete) - Number(b.isComplete);
                                                if (completeDiff !== 0) return completeDiff;
                                                // Then alphabetically
                                                return a.achievementName.localeCompare(
                                                    b.achievementName
                                                );
                                            })
                                            .map((achievement) => (
                                                <div
                                                    key={achievement.achievementId}
                                                    className={`text-sm ${achievement.isComplete ? 'text-slate-500' : 'text-white'}`}
                                                >
                                                    <a
                                                        href={toWikiUrl(
                                                            achievement.achievementName
                                                        )}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-amber-300 transition-colors"
                                                    >
                                                        {achievement.achievementName}
                                                    </a>
                                                    {achievement.totalBits > 0 && (
                                                        <span className="text-slate-400 ml-2">
                                                            {achievement.completedBits}/
                                                            {achievement.totalBits}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }
);

Zone.displayName = 'Zone';
