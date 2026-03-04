import { queryAchievementGroups } from '../services/achievementGroupsApi';

export interface ParamConfig {
  name: string;
  label: string;
  type: 'text' | 'select';
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
}

export interface EndpointConfig {
  id: string;
  label: string;
  path: string;
  description: string;
  requiresAuth: boolean;
  queryFn: (params: Record<string, string>) => Promise<unknown>;
  params: ParamConfig[];
}

const LANG_OPTIONS = [
  { value: '', label: 'Default (en)' },
  { value: 'en', label: 'English (en)' },
  { value: 'de', label: 'German (de)' },
  { value: 'es', label: 'Spanish (es)' },
  { value: 'fr', label: 'French (fr)' },
  { value: 'ko', label: 'Korean (ko)' },
  { value: 'zh', label: 'Chinese (zh)' },
];

export const ENDPOINTS: EndpointConfig[] = [
  {
    id: 'achievements-groups',
    label: 'Achievements / Groups',
    path: '/achievements/groups',
    description: 'Returns achievement groups. Each group contains a set of achievement categories.',
    requiresAuth: false,
    queryFn: queryAchievementGroups,
    params: [
      {
        name: 'ids',
        label: 'IDs',
        type: 'text',
        placeholder: 'e.g. all, or comma-separated UUIDs',
        description: 'Use "all" to fetch all objects. Enter comma-separated UUIDs to fetch specific items.',
        defaultValue: 'all',
      },
      {
        name: 'lang',
        label: 'Language',
        type: 'select',
        options: LANG_OPTIONS,
      },
    ],
  },
];
