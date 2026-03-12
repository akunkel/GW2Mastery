import { BASE_URL } from './apiConfig';

export interface ItemsParams {
  ids?: string;
  lang?: string;
}

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

export function queryItems({ ids, lang }: ItemsParams): Promise<unknown> {
  const params: Record<string, string> = {};
  if (ids) params.ids = ids;
  if (lang) params.lang = lang;
  return fetchApi('/items', params);
}
