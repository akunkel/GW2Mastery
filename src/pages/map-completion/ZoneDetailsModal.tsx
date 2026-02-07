import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import type {
    CollectibleAchievementProgress,
    ZoneExplorerProgress,
    ZoneInsightProgress,
} from '../../hooks/useExplorerProgress';

interface ZoneDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    zoneName: string;
    explorerProgress?: ZoneExplorerProgress | null;
    insightProgress?: ZoneInsightProgress;
    collectibleAchievements?: CollectibleAchievementProgress[];
}

// Convert a name to a wiki URL (spaces become underscores)
const toWikiUrl = (text: string) =>
    `https://wiki.guildwars2.com/wiki/${encodeURIComponent(text.replace(/ /g, '_'))}`;

export function ZoneDetailsModal({
    open,
    onOpenChange,
    zoneName,
    explorerProgress,
    insightProgress,
    collectibleAchievements,
}: ZoneDetailsModalProps) {
    const otherAchievementsCount = collectibleAchievements?.length ?? 0;
    const otherAchievementsCompleted =
        collectibleAchievements?.filter((a) => a.isComplete).length ?? 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        <a
                            href={toWikiUrl(zoneName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-amber-300 transition-colors"
                        >
                            {zoneName}
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
                                    {explorerProgress.completedBits}/{explorerProgress.totalBits}
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
                                        return a.achievementName.localeCompare(b.achievementName);
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
                                        return a.achievementName.localeCompare(b.achievementName);
                                    })
                                    .map((achievement) => (
                                        <div
                                            key={achievement.achievementId}
                                            className={`text-sm ${achievement.isComplete ? 'text-slate-500' : 'text-white'}`}
                                        >
                                            <a
                                                href={toWikiUrl(achievement.achievementName)}
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
    );
}
