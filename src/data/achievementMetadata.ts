// Per-achievement metadata overrides for cases where API data is insufficient.
export interface AchievementMetadata {
  /** Override the number of mastery points provided by this achievement. */
  masteryPoints?: number;
  /** Treat the achievement as done when progress.current >= this value */
  doneCount?: number;
  /** Additional note displayed beneath the achievement description */
  note?: string;
  /** Override the auto-generated wiki link */
  wikiUrl?: string;
}

export const ACHIEVEMENT_METADATA: Record<number, AchievementMetadata> = {
  // Fleet of Foot
  3567: { wikiUrl: 'https://wiki.guildwars2.com/wiki/Crystal_Desert_(achievements)#Fleet_of_Foot' },
  // Morale Breaker
  5247: { masteryPoints: 2, doneCount: 10, note: '*Mastery points at 1 and 10 clears.' },
  // Janthir Wilds Warclaw
  8223: { wikiUrl: 'https://wiki.guildwars2.com/wiki/Unknown_Territory' },
};
