import type { DebugViewConfig } from '../../../services/endpointTypes';
import { buildAchievementDatabase } from '../../../services/gw2Api';

export const achievementDbBuilderView: DebugViewConfig = {
  label: 'Achievement DB Builder',
  description:
    'Runs buildAchievementDatabase() and outputs the full JSON result.',
  queryFn: async () => {
    const db = await buildAchievementDatabase();
    return db;
  },
  params: [],
};
