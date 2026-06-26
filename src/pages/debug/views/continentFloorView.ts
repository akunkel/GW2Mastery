import { queryContinentFloor } from '../../../services/continentsApi';
import { LANG_OPTIONS } from '../../../services/languages';
import type { DebugViewConfig } from '../types';

export const continentFloorView: DebugViewConfig = {
  label: 'Continent Floors',
  endpointPath: '/continents/{continentId}/floors/{floorId}',
  description: 'Returns floor data for a specific continent.',
  queryFn: queryContinentFloor,
  params: [
    {
      name: 'continentId',
      label: 'Continent ID',
      type: 'path',
      placeholder: 'e.g. 1',
      defaultValue: '1',
    },
    {
      name: 'floorId',
      label: 'Floor ID',
      type: 'path',
      placeholder: 'e.g. 1',
      defaultValue: '1',
    },
    {
      name: 'lang',
      label: 'Language',
      type: 'select',
      options: LANG_OPTIONS,
    },
  ],
};
