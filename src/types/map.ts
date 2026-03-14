import type { MasteryRegion } from './mastery';

export interface GW2Map {
  id: number;
  name: string;
  min_level: number;
  max_level: number;
  default_floor: number;
  type: string;
  floors: number[];
  region_id: number;
  region_name: string;
  continent_id: number;
  continent_name: string;
  map_rect: [[number, number], [number, number]];
  continent_rect: [[number, number], [number, number]];
}

export interface PointOfInterest {
  id: number;
  name: string;
  type: string;
  coord: [number, number];
  floor: number;
  chat_link?: string;
  icon?: string;
}

export interface Task {
  id: number;
  objective: string;
  level: number;
  coord: [number, number];
  bounds?: [number, number][];
  chat_link?: string;
}

export interface Sector {
  id: number;
  name: string;
  level: number;
  coord: [number, number];
  bounds?: [number, number][];
  chat_link?: string;
}

export interface SkillChallenge {
  id: string;
  coord: [number, number];
}

export interface MasteryPoint {
  id: number;
  region: string;
  coord: [number, number];
}

export interface Adventure {
  id: string;
  name: string;
  description: string;
  coord: [number, number];
}

export interface ContinentMapData {
  id: number;
  name: string;
  min_level: number;
  max_level: number;
  default_floor: number;
  type?: string; // Map type: "Public", "Instance", "Activity", etc.
  masteryRegion?: MasteryRegion;
  map_rect: [[number, number], [number, number]];
  continent_rect: [[number, number], [number, number]];
  points_of_interest?: PointOfInterest[];
  tasks?: Task[];
  skill_challenges?: SkillChallenge[];
  sectors?: Sector[];
  adventures?: Adventure[];
  mastery_points?: MasteryPoint[];
}

export interface ContinentRegion {
  id: number;
  name: string;
  label_coord: [number, number];
  continent_rect: [[number, number], [number, number]];
  maps: Record<number, ContinentMapData>;
}

export interface ContinentFloor {
  texture_dims: [number, number];
  clamped_view?: [[number, number], [number, number]];
  regions: Record<number, ContinentRegion>;
}

export interface ContinentDatabase {
  timestamp: number;
  continentId: number;
  floorId: number;
  continentDims: [number, number];
  floor: ContinentFloor;
}

export interface RenderedZone {
  id: number;
  name: string;
  polygonPoints: string;
  center: [number, number];
  minLevel: number;
  maxLevel: number;
  regionName: string;
  masteryRegion?: MasteryRegion;
}
