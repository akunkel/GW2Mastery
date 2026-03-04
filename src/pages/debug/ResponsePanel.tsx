import { useCallback } from 'react';
import { ObjectView } from 'react-obj-view';
import 'react-obj-view/dist/react-obj-view.css';

interface Props {
    requestUrl: string;
    response: unknown;
    filteredResponse: unknown;
    error: string | null;
    loading: boolean;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    expandAll: boolean;
    onToggleExpand: () => void;
}

export function ResponsePanel({
    requestUrl,
    response,
    filteredResponse,
    error,
    loading,
    searchTerm,
    onSearchChange,
    expandAll,
    onToggleExpand,
}: Props) {
    const valueGetter = useCallback(() => filteredResponse, [filteredResponse]);

    return (
        <div className="flex flex-col gap-2 flex-1 min-h-0">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Response
                </h2>
                {response !== null && !error && (
                    <button
                        onClick={onToggleExpand}
                        className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        {expandAll ? 'Collapse All' : 'Expand All'}
                    </button>
                )}
            </div>

            {/* Live URL preview */}
            {requestUrl && (
                <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md">
                    <p className="text-slate-500 text-xs font-mono break-all">{requestUrl}</p>
                </div>
            )}

            {/* Search */}
            {response !== null && !error && (
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search response…"
                        className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchTerm.trim() && Array.isArray(response) && (
                        <span className="text-xs text-slate-400 shrink-0">
                            {Array.isArray(filteredResponse) ? filteredResponse.length : 0}{' '}
                            / {response.length}
                        </span>
                    )}
                </div>
            )}

            {/* Response body */}
            <div className="flex-1 min-h-0 bg-slate-900 border border-slate-700 rounded-md overflow-auto">
                {error && (
                    <pre className="p-3 text-red-400 font-mono text-sm whitespace-pre-wrap">
                        {error}
                    </pre>
                )}
                {filteredResponse !== null && !error && (
                    <ObjectView
                        key={String(expandAll)}
                        valueGetter={valueGetter}
                        expandLevel={expandAll ? true : 2}
                    />
                )}
                {filteredResponse === null && response !== null && !error && (
                    <p className="p-3 text-slate-600 text-sm italic">No matches found.</p>
                )}
                {response === null && !error && !loading && (
                    <p className="p-3 text-slate-600 text-sm italic">
                        Response will appear here
                    </p>
                )}
                {loading && <p className="p-3 text-slate-400 text-sm">Loading…</p>}
            </div>
        </div>
    );
}
