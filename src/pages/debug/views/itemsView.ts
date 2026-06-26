import { LANG_OPTIONS } from '../../../services/languages';
import type { DebugViewConfig } from '../types';
import { queryItems } from '../../../services/itemsApi';

export const itemsView: DebugViewConfig = {
  label: 'Items',
  endpointPath: '/items',
  description: 'Returns item details. Leave IDs empty to get the full list of item IDs, then query specific IDs (up to 200) to fetch details.',
  queryFn: queryItems,
  params: [
    {
      name: 'ids',
      label: 'IDs',
      type: 'text',
      placeholder: 'e.g. 19699,19700,19701 (comma-separated)',
      defaultValue: '4',
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
