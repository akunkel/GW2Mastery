import { useCallback, useMemo, useState } from 'react';
import { ObjectView } from 'react-obj-view';
import 'react-obj-view/dist/react-obj-view.css';
import { ENDPOINTS, type EndpointConfig } from '../../data/endpoints';

const BASE_URL = 'https://api.guildwars2.com/v2';

function deepContains(value: unknown, term: string): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.toLowerCase().includes(term);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).includes(term);
  if (Array.isArray(value)) return value.some((item) => deepContains(item, term));
  if (typeof value === 'object') return Object.values(value).some((v) => deepContains(v, term));
  return false;
}

function buildUrl(endpoint: EndpointConfig, params: Record<string, string>): string {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v.trim() !== '')
  );
  const query = new URLSearchParams(filtered).toString();
  return `${BASE_URL}${endpoint.path}${query ? `?${query}` : ''}`;
}

function defaultParamValues(endpoint: EndpointConfig): Record<string, string> {
  return Object.fromEntries(
    endpoint.params.map((p) => [p.name, p.defaultValue ?? ''])
  );
}

export default function DebugPage() {
  const [selectedId, setSelectedId] = useState(ENDPOINTS[0].id);
  const [paramValues, setParamValues] = useState<Record<string, string>>(
    () => defaultParamValues(ENDPOINTS[0])
  );
  const [response, setResponse] = useState<unknown>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandAll, setExpandAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(
    () => ENDPOINTS.find((e) => e.id === selectedId)!,
    [selectedId]
  );

  const requestUrl = buildUrl(endpoint, paramValues);

  const filteredResponse = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term || response === null) return response;
    if (Array.isArray(response)) return response.filter((item) => deepContains(item, term));
    return deepContains(response, term) ? response : null;
  }, [response, searchTerm]);

  const valueGetter = useCallback(() => filteredResponse, [filteredResponse]);

  function handleEndpointChange(id: string) {
    const next = ENDPOINTS.find((e) => e.id === id)!;
    setSelectedId(id);
    setParamValues(defaultParamValues(next));
    setResponse(null);
    setSearchTerm('');
    setError(null);
  }

  function handleParamChange(name: string, value: string) {
    setParamValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSend() {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const filtered = Object.fromEntries(
        Object.entries(paramValues).filter(([, v]) => v.trim() !== '')
      );

      const data = await endpoint.queryFn(filtered);
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      {/* Endpoint selector */}
      <div className="flex flex-col gap-1">
        <label htmlFor="endpoint-select" className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Endpoint
        </label>
        <select
          id="endpoint-select"
          value={selectedId}
          onChange={(e) => handleEndpointChange(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-sm"
        >
          {ENDPOINTS.map((e) => (
            <option key={e.id} value={e.id}>{e.label}</option>
          ))}
        </select>
        <p className="text-sm text-slate-400">{endpoint.description}</p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        {/* Parameters panel */}
        <div className="flex flex-col gap-4 md:w-72 shrink-0">
          <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wide">Parameters</h2>

          {endpoint.params.map((param) => (
            <div key={param.name} className="flex flex-col gap-1">
              <label htmlFor={`param-${param.name}`} className="text-sm font-medium text-slate-300">
                {param.label}
              </label>
              {param.type === 'select' ? (
                <select
                  id={`param-${param.name}`}
                  value={paramValues[param.name] ?? ''}
                  onChange={(e) => handleParamChange(param.name, e.target.value)}
                  className="bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {param.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={`param-${param.name}`}
                  type="text"
                  value={paramValues[param.name] ?? ''}
                  onChange={(e) => handleParamChange(param.name, e.target.value)}
                  placeholder={param.placeholder}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              {param.description && (
                <p className="text-xs text-slate-500">{param.description}</p>
              )}
            </div>
          ))}

          <button
            onClick={handleSend}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending…' : 'Send Request'}
          </button>
        </div>

        {/* Response panel */}
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wide">Response</h2>
            {response !== null && !error && (
              <button
                onClick={() => setExpandAll((v) => !v)}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {expandAll ? 'Collapse All' : 'Expand All'}
              </button>
            )}
          </div>

          {/* Live URL preview */}
          <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md">
            <p className="text-slate-500 text-xs font-mono break-all">{requestUrl}</p>
          </div>

          {/* Search */}
          {response !== null && !error && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search response…"
                className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm.trim() && Array.isArray(response) && (
                <span className="text-xs text-slate-400 shrink-0">
                  {Array.isArray(filteredResponse) ? filteredResponse.length : 0} / {response.length}
                </span>
              )}
            </div>
          )}

          {/* Response body */}
          <div className="flex-1 min-h-0 bg-slate-900 border border-slate-700 rounded-md overflow-auto">
            {error && (
              <pre className="p-3 text-red-400 font-mono text-sm whitespace-pre-wrap">{error}</pre>
            )}
            {filteredResponse !== null && !error && (
              <ObjectView key={String(expandAll)} valueGetter={valueGetter} expandLevel={expandAll ? true : 2} />
            )}
            {filteredResponse === null && response !== null && !error && (
              <p className="p-3 text-slate-600 text-sm italic">No matches found.</p>
            )}
            {response === null && !error && !loading && (
              <p className="p-3 text-slate-600 text-sm italic">Response will appear here</p>
            )}
            {loading && (
              <p className="p-3 text-slate-400 text-sm">Loading…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
