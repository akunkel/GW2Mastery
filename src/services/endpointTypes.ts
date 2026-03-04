export interface ParamConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'path' | 'checkbox';
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  options?: { value: string; label: string; }[];
}

export interface DebugViewConfig {
  label: string;
  endpointPath?: string;
  description: string;
  queryFn: (params: Record<string, string>) => Promise<unknown>;
  params: ParamConfig[];
}

export const LANG_OPTIONS: { value: string; label: string; }[] = [
  { value: '', label: 'Default (en)' },
  { value: 'en', label: 'English (en)' },
  { value: 'de', label: 'German (de)' },
  { value: 'es', label: 'Spanish (es)' },
  { value: 'fr', label: 'French (fr)' },
  { value: 'zh', label: 'Chinese (zh)' },
];
