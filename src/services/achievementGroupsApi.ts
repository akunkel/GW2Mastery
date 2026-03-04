const BASE_URL = 'https://api.guildwars2.com/v2';

/**
 * Queries the achievements/groups endpoint with arbitrary params (used by debug page)
 */
export async function queryAchievementGroups(
  params: Record<string, string>
): Promise<unknown> {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/achievements/groups${query ? `?${query}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json();
}
