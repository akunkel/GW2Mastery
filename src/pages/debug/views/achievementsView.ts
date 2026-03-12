import { queryAchievements } from '../../../services/achievementsApi';
import { LANG_OPTIONS, type DebugViewConfig } from '../../../services/endpointTypes';

export const achievementsView: DebugViewConfig = {
  label: 'Achievements',
  endpointPath: '/achievements',
  description: 'Returns achievement details. Leave IDs empty to get the full list of IDs, then query specific IDs.',
  queryFn: queryAchievements,
  params: [
    {
      name: 'ids',
      label: 'IDs',
      type: 'text',
      placeholder: 'e.g. 1,2,3 (comma-separated)',
      description: 'Leave empty to get all IDs. Enter comma-separated IDs (up to 200) to fetch details.',
    },
    {
      name: 'lang',
      label: 'Language',
      type: 'select',
      options: LANG_OPTIONS,
    },
  ],
};
