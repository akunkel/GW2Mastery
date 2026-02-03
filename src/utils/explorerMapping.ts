import type { EnrichedAchievement } from '../types/gw2';
import { zoneConfigs } from './mapConfig';

export interface ExplorerAchievementInfo {
    achievementId: number;
    achievementName: string;
    totalBits: number;
    // For regional achievements, the specific bit indices that belong to this zone
    // If undefined, all bits belong to this zone (dedicated achievement)
    zoneBitIndices?: number[];
}

/**
 * Builds a map from zone names to their Explorer achievement info.
 * Handles both dedicated zone achievements and regional achievements.
 */
export function buildZoneToExplorerMap(
    achievements: Map<number, EnrichedAchievement>
): Map<string, ExplorerAchievementInfo> {
    const zoneMap = new Map<string, ExplorerAchievementInfo>();

    for (const [zoneName, config] of Object.entries(zoneConfigs)) {
        // Dedicated zone achievement (e.g., "Verdant Brink Explorer")
        if (config.explorerAchievementId) {
            const achievement = achievements.get(config.explorerAchievementId);
            if (achievement) {
                zoneMap.set(zoneName, {
                    achievementId: config.explorerAchievementId,
                    achievementName: achievement.name,
                    totalBits: achievement.bits?.length ?? 0,
                });
            }
        }

        // Regional achievement (e.g., "Krytan Explorer" with bits like "Queensdale: Some Area")
        // The zone name is used as the prefix to filter bits
        if (config.regionalExplorerId) {
            const achievement = achievements.get(config.regionalExplorerId);
            if (achievement && achievement.bits) {
                // Find bit indices that match this zone's name prefix
                const zoneBitIndices: number[] = [];
                achievement.bits.forEach((bit, index) => {
                    if (bit.text?.startsWith(zoneName + ':')) {
                        zoneBitIndices.push(index);
                    }
                });

                if (zoneBitIndices.length > 0) {
                    zoneMap.set(zoneName, {
                        achievementId: config.regionalExplorerId,
                        achievementName: achievement.name,
                        totalBits: zoneBitIndices.length,
                        zoneBitIndices,
                    });
                }
            }
        }
    }

    return zoneMap;
}
