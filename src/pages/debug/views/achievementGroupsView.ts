import { queryAchievementGroups } from '../../../services/achievementGroupsApi';
import { LANG_OPTIONS } from '../../../services/languages';
import type { DebugViewConfig } from '../types';

export const achievementGroupsView: DebugViewConfig = {
  label: 'Achievement Groups',
  endpointPath: '/achievements/groups',
  description: 'Returns achievement groups. Each group contains a set of achievement categories.',
  queryFn: queryAchievementGroups,
  params: [
    {
      name: 'ids',
      label: 'IDs',
      type: 'text',
      placeholder: 'e.g. all, or comma-separated UUIDs',
      description: 'Use "all" to fetch all objects. Enter comma-separated UUIDs to fetch specific items.',
      defaultValue: 'all',
    },
    {
      name: 'lang',
      label: 'Language',
      type: 'select',
      options: LANG_OPTIONS,
    },
  ],
};
