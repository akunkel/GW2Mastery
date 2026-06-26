import { queryAchievementCategories } from '../../../services/achievementsApi';
import { LANG_OPTIONS } from '../../../services/languages';
import type { DebugViewConfig } from '../types';

export const achievementCategoriesView: DebugViewConfig = {
  label: 'Achievement Categories',
  endpointPath: '/achievements/categories',
  description: 'Returns achievement categories.',
  queryFn: queryAchievementCategories,
  params: [
    {
      name: 'ids',
      label: 'IDs',
      type: 'text',
      placeholder: 'e.g. all, or comma-separated IDs',
      description: 'Use "all" to fetch all objects. Enter comma-separated IDs to fetch specific items.',
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
