import { BASE_URL } from './apiConfig';

export interface MapsParams {
  ids?: string;
  lang?: string;
}

export async function queryMaps({ ids, lang }: MapsParams): Promise<unknown> {
  const params: Record<string, string> = {};
  if (ids) params.ids = ids;
  if (lang) params.lang = lang;
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/maps${query ? `?${query}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json();
}
