import { BASE_URL } from './apiConfig';

export interface AccountAchievementsParams {
  access_token?: string;
}

export async function queryAccountAchievements({ access_token }: AccountAchievementsParams): Promise<unknown> {
  const params: Record<string, string> = {};
  if (access_token) params.access_token = access_token;
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/account/achievements${query ? `?${query}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json();
}
