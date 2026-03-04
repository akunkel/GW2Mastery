import { queryContinents } from '../../../services/continentsApi';
import { LANG_OPTIONS, type DebugViewConfig } from '../../../services/endpointTypes';

export const continentsView: DebugViewConfig = {
    label: 'Continents',
    endpointPath: '/continents',
    description: 'Returns continent details.',
    queryFn: queryContinents,
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
