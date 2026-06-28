import { buildAchievementDatabase } from '../../../database/buildAchievementDatabase';
import type { DebugViewConfig } from '../types';

export const achievementDatabaseBuilderView: DebugViewConfig = {
  label: 'Achievement DB Builder',
  description:
    'Runs buildAchievementDatabase() and outputs the full processed JSON result. Prefer `npm run build:data` to regenerate the bundled files.',
  queryFn: () => buildAchievementDatabase(),
  params: [],
};
