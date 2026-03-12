import { LANG_OPTIONS, type DebugViewConfig } from '../../../services/endpointTypes';
import { queryMaps } from '../../../services/mapsApi';

export const mapsView: DebugViewConfig = {
  label: 'Maps',
  endpointPath: '/maps',
  description: 'Returns map details.',
  queryFn: queryMaps,
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
