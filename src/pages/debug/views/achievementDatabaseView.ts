import type { DebugViewConfig } from '../types';
import { useAppStore } from '../../../store/useAppStore';

export const achievementDatabaseView: DebugViewConfig = {
  label: 'Achievement DB (Local)',
  description: 'Shows the active achievement database from the store.',
  autoFetch: true,
  queryFn: async () => {
    const { enrichedAchievementMap } = useAppStore.getState();
    return Array.from(enrichedAchievementMap.values());
  },
  params: [],
};
