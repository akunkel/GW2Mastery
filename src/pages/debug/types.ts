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
  /** When true, auto-fetch on select. */
  autoFetch?: boolean;
}
