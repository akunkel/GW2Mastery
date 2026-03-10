import { queryAccountMountTypes } from '../../../services/mountsApi';
import type { DebugViewConfig } from '../../../services/endpointTypes';

export const mountTypesView: DebugViewConfig = {
    label: 'Account Mount Types',
    endpointPath: '/account/mounts/types',
    description: "Returns the mount types unlocked on the account. Requires an API key with the \"inventories\" permission.",
    queryFn: queryAccountMountTypes,
    params: [
        {
            name: 'access_token',
            label: 'API Key',
            type: 'text',
            placeholder: 'Enter your GW2 API key',
            description: 'Your Guild Wars 2 API key with the "inventories" permission.',
        },
    ],
};
