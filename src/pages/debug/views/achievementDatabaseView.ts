import rawAchievementDb from '../../../data/rawAchievementDb.json';
import type { DebugViewConfig } from '../types';
import { useAppStore } from '../../../store/useAppStore';

export const achievementDatabaseView: DebugViewConfig = {
  label: 'Achievement DB (Local)',
  description: 'Shows the active achievement database from the store.',
  autoFetch: true,
  queryFn: async (params: Record<string, string>) => {
    if (params.raw === 'true')
      return (rawAchievementDb as { achievements: unknown[]; }).achievements;
    const { enrichedAchievementMap } = useAppStore.getState();
    return Array.from(enrichedAchievementMap.values());
  },
  params: [
    {
      name: 'raw',
      label: 'Raw',
      type: 'checkbox',
      description: 'Show raw achievement data from rawAchievementDb.json instead.',
      defaultValue: 'true',
    },
  ],
};
