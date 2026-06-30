import type { ApiNovelty } from '../types/novelty';
import { BASE_URL } from './apiConfig';

export async function queryNovelties(lang: string = 'en'): Promise<ApiNovelty[]> {
  const response = await fetch(`${BASE_URL}/novelties?ids=all&lang=${lang}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json() as Promise<ApiNovelty[]>;
}

export async function queryAccountNovelties(apiKey: string): Promise<number[]> {
  const response = await fetch(`${BASE_URL}/account/novelties?access_token=${apiKey}`);
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Invalid API key or insufficient permissions (requires "unlocks" scope)');
    }
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return response.json() as Promise<number[]>;
}
