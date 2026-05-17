import { buildAchievementDatabase } from '../../../database/buildAchievementDatabase';
import type { DebugViewConfig } from '../../../services/endpointTypes';

export const achievementDbBuilderView: DebugViewConfig = {
  label: 'Achievement DB Builder',
  description:
    'Runs buildAchievementDatabase() and outputs the full JSON result.',
  queryFn: async (params) => {
    const { db, rawDb } = await buildAchievementDatabase();
    return params['raw'] === 'true' ? rawDb : db;
  },
  params: [
    {
      name: 'raw',
      label: 'Raw',
      type: 'checkbox',
      description: 'Outputs raw achievements instead of the processed database. Irrelevant achievements are still filtered out.',
      defaultValue: 'false',
    },
  ],
};
