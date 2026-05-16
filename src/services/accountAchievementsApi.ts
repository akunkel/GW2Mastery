import type { AccountAchievement } from '../types/achievement';
import { BASE_URL } from './apiConfig';

export async function queryAccountAchievements(apiKey: string): Promise<AccountAchievement[]> {
  const response = await fetch(`${BASE_URL}/account/achievements?access_token=${apiKey}`);
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Invalid API key or insufficient permissions');
    }
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  const data = await response.json() as AccountAchievement[];
  if (data.length === 0) {
    throw new Error('Achievements API returned no achievement data. Try using a different API key.');
  }
  console.log(`Loaded data for ${data.length} achievements, ${data.filter((a) => a.done).length} completed.`);
  return data;
}
