import { BASE_URL } from './apiConfig';
export interface ContinentsParams {
  ids?: string;
  lang?: string;
}

export interface ContinentFloorParams {
  continentId?: string;
  floorId?: string;
  lang?: string;
}

export async function queryContinents({ ids, lang }: ContinentsParams): Promise<unknown> {
  const params: Record<string, string> = {};
  if (ids) params.ids = ids;
  if (lang) params.lang = lang;
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/continents${query ? `?${query}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json();
}

export async function queryContinentFloor({ continentId = '1', floorId = '1', lang }: ContinentFloorParams): Promise<unknown> {
  const path = `/continents/${continentId}/floors/${floorId}`;
  const params: Record<string, string> = {};
  if (lang) params.lang = lang;
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${path}${query ? `?${query}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json();
}
