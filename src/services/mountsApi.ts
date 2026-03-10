import { BASE_URL } from './apiConfig';

async function fetchApi(path: string, params: Record<string, string>): Promise<unknown> {
    const query = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${path}${query ? `?${query}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} ${response.statusText}: ${text}`);
    }
    return response.json();
}

export function queryAccountMountTypes(params: Record<string, string>): Promise<unknown> {
    return fetchApi('/account/mounts/types', params);
}
