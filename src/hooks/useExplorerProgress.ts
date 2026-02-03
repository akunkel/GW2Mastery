import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { buildZoneToExplorerMap } from '../utils/explorerMapping';
import { zoneConfigs } from '../utils/mapConfig';

export interface ZoneExplorerProgress {
  achievementId: number;
  achievementName: string;
  completedBits: number;
  totalBits: number;
  percentage: number;
  isComplete: boolean;
}

export interface ZoneInsightProgress {
  completed: number;
  total: number;
  percentage: number;
  isComplete: boolean;
}

/**
 * Hook that returns Explorer achievement and Mastery Insight progress for each zone.
 * Returns Maps keyed by zone name.
 */
export function useExplorerProgress(): {
  progressMap: Map<string, ZoneExplorerProgress | null>;
  insightMap: Map<string, ZoneInsightProgress>;
  hasApiKey: boolean;
} {
  const { enrichedAchievementMap, accountProgress, apiKey } = useAppStore();

  const explorerMap = useMemo(() => {
    return buildZoneToExplorerMap(enrichedAchievementMap);
  }, [enrichedAchievementMap]);

  const progressMap = useMemo(() => {
    const map = new Map<string, ZoneExplorerProgress | null>();

    // Build progress for each zone that has an Explorer achievement
    for (const [zoneName, info] of explorerMap.entries()) {
      const progress = accountProgress.get(info.achievementId);
      const totalBits = info.totalBits;

      if (progress) {
        let completedBits: number;
        let isComplete: boolean;

        if (info.zoneBitIndices) {
          // Regional achievement: only count bits that belong to this zone
          // If the entire regional achievement is done, all zones are complete
          if (progress.done) {
            completedBits = totalBits;
            isComplete = true;
          } else {
            const completedBitSet = new Set(progress.bits ?? []);
            completedBits = info.zoneBitIndices.filter((idx) => completedBitSet.has(idx)).length;
            isComplete = completedBits === totalBits;
          }
        } else {
          // Dedicated zone achievement: count all bits
          // If achievement is done, API may not return bits array
          if (progress.done) {
            completedBits = totalBits;
            isComplete = true;
          } else {
            completedBits = progress.bits?.length ?? 0;
            isComplete = false;
          }
        }

        const percentage = totalBits > 0 ? Math.round((completedBits / totalBits) * 100) : 0;

        map.set(zoneName, {
          achievementId: info.achievementId,
          achievementName: info.achievementName,
          completedBits,
          totalBits,
          percentage,
          isComplete,
        });
      } else {
        // Achievement exists but no progress data (either not started or no API key)
        map.set(zoneName, {
          achievementId: info.achievementId,
          achievementName: info.achievementName,
          completedBits: 0,
          totalBits,
          percentage: 0,
          isComplete: false,
        });
      }
    }

    return map;
  }, [explorerMap, accountProgress]);

  // Calculate insight progress for each zone directly from config
  const insightMap = useMemo(() => {
    const map = new Map<string, ZoneInsightProgress>();

    for (const [zoneName, config] of Object.entries(zoneConfigs)) {
      const insightIds = config.insightAchievementIds;
      if (!insightIds?.length) continue;

      const total = insightIds.length;
      let completed = 0;

      for (const achievementId of insightIds) {
        const progress = accountProgress.get(achievementId);
        if (progress?.done) {
          completed++;
        }
      }

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      map.set(zoneName, {
        completed,
        total,
        percentage,
        isComplete: completed === total,
      });
    }

    return map;
  }, [accountProgress]);

  return {
    progressMap,
    insightMap,
    hasApiKey: !!apiKey,
  };
}
