import { queryAccountAchievements } from '../../../services/accountApi';
import type { DebugViewConfig } from '../../../services/endpointTypes';

export const accountAchievementsView: DebugViewConfig = {
    label: 'Account / Achievements',
    endpointPath: '/account/achievements',
    description: "Returns the account's achievement progress. Requires an API key.",
    queryFn: queryAccountAchievements,
    params: [
        {
            name: 'access_token',
            label: 'API Key',
            type: 'text',
            placeholder: 'Enter your GW2 API key',
            description: 'Your Guild Wars 2 API key with the "progression" permission.',
        },
    ],
};
