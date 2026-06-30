export type NoveltySlot = 'Chair' | 'Music' | 'HeldItem' | 'Miscellaneous' | 'Tonic';

export interface ApiNovelty {
  id: number;
  name: string;
  description: string;
  icon: string;
  slot: NoveltySlot;
  unlock_item?: number[];
}

export interface NoveltyEntry {
  id: number;
  name: string;
  description: string;
  icon: string;
  slot: NoveltySlot;
  achievementIds: number[];
}

export interface NoveltyDatabase {
  timestamp: number;
  novelties: NoveltyEntry[];
}
