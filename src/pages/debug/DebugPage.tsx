import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BASE_URL } from '../../services/apiConfig';
import type { DebugViewConfig } from './types';
import { useAppStore } from '../../store/useAppStore';
import { ParamsPanel } from './ParamsPanel';
import { ResponsePanel } from './ResponsePanel';
import { ViewSelector } from './ViewSelector';
import { accountAchievementsView } from './views/accountAchievementsView';
import { achievementCategoriesView } from './views/achievementCategoriesView';
import { achievementDatabaseBuilderView } from './views/achievementDatabaseBuilderView';
import { achievementDatabaseView } from './views/achievementDatabaseView';
import { achievementGroupsView } from './views/achievementGroupsView';
import { achievementsView } from './views/achievementsView';
import { continentFloorView } from './views/continentFloorView';
import { continentsView } from './views/continentsView';
import { itemNameDatabaseBuilderView } from './views/itemNameDatabaseBuilderView';
import { itemsView } from './views/itemsView';
import { mapAchievementsBuilderView } from './views/mapAchievementsBuilderView';
import { mapsView } from './views/mapsView';
import { mountTypesView } from './views/mountTypesView';

const ALL_VIEWS: DebugViewConfig[] = [
    achievementDatabaseView,
    achievementGroupsView,
    achievementCategoriesView,
    achievementsView,
    accountAchievementsView,
    continentsView,
    continentFloorView,
    mapsView,
    mountTypesView,
    itemsView,
    achievementDatabaseBuilderView,
    itemNameDatabaseBuilderView,
    mapAchievementsBuilderView,
];

function deepContains(value: unknown, term: string): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.toLowerCase().includes(term);
    if (typeof value === 'number' || typeof value === 'boolean')
        return String(value).includes(term);
    if (Array.isArray(value)) return value.some((item) => deepContains(item, term));
    if (typeof value === 'object') return Object.values(value).some((v) => deepContains(v, term));
    return false;
}

function buildUrl(view: DebugViewConfig, params: Record<string, string>): string {
    if (!view.endpointPath) return '';
    let path = view.endpointPath;
    const queryParams: Record<string, string> = {};
    for (const paramCfg of view.params) {
        const value = (params[paramCfg.name] ?? '').trim();
        if (!value) continue;
        if (paramCfg.type === 'path') {
            path = path.replace(`{${paramCfg.name}}`, value);
        } else {
            queryParams[paramCfg.name] = value;
        }
    }
    const query = new URLSearchParams(queryParams).toString();
    return `${BASE_URL}${path}${query ? `?${query}` : ''}`;
}

function defaultParamValues(view: DebugViewConfig, apiKey: string | null): Record<string, string> {
    return Object.fromEntries(
        view.params.map((p) => [
            p.name,
            p.name === 'access_token' && apiKey ? apiKey : (p.defaultValue ?? ''),
        ])
    );
}

export default function DebugPage() {
    const apiKey = useAppStore((s) => s.apiKey);
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedLabel =
        ALL_VIEWS.find((v) => v.label === searchParams.get('view'))?.label ?? ALL_VIEWS[0].label;

    const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
        const initialView = ALL_VIEWS.find((v) => v.label === selectedLabel) ?? ALL_VIEWS[0];
        return defaultParamValues(initialView, apiKey);
    });
    const [response, setResponse] = useState<unknown>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandAll, setExpandAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const view = useMemo(() => ALL_VIEWS.find((e) => e.label === selectedLabel)!, [selectedLabel]);

    const requestUrl = buildUrl(view, paramValues);

    // Auto-fetch on select when autoFetch is true.
    useEffect(() => {
        if (view.autoFetch !== true) return;
        setLoading(true);
        setError(null);
        setResponse(null);
        const defaults = Object.fromEntries(
            Object.entries(defaultParamValues(view, apiKey)).filter(([, v]) => v.trim() !== '')
        );
        view.queryFn(defaults)
            .then(setResponse)
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : String(err));
            })
            .finally(() => setLoading(false));
    }, [view, apiKey]);

    // Filters the response by searchTerm before passing to ResponsePanel.
    // Supports array responses (filters items), object responses (filters array-valued properties),
    // and scalar responses (returns null if no match).
    const filteredResponse = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term || response === null) return response;
        if (Array.isArray(response)) return response.filter((item) => deepContains(item, term));
        if (typeof response === 'object') {
            // For object responses, filter each array-valued property individually
            return Object.fromEntries(
                Object.entries(response as Record<string, unknown>).map(([key, value]) =>
                    Array.isArray(value)
                        ? [key, value.filter((item) => deepContains(item, term))]
                        : [key, value]
                )
            );
        }
        return deepContains(response, term) ? response : null;
    }, [response, searchTerm]);

    function handleViewChange(label: string) {
        const next = ALL_VIEWS.find((e) => e.label === label)!;
        setSearchParams({ view: label }, { replace: true });
        setParamValues(defaultParamValues(next, apiKey));
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
            const data = await view.queryFn(filtered);
            setResponse(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4 h-full flex flex-col gap-4">
            <ViewSelector
                views={ALL_VIEWS}
                selectedLabel={selectedLabel}
                onViewChange={handleViewChange}
                description={view.description}
            />
            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                <ParamsPanel
                    view={view}
                    paramValues={paramValues}
                    onParamChange={handleParamChange}
                    onSend={handleSend}
                    loading={loading}
                />
                <ResponsePanel
                    requestUrl={requestUrl}
                    response={response}
                    filteredResponse={filteredResponse}
                    error={error}
                    loading={loading}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    expandAll={expandAll}
                    onToggleExpand={() => setExpandAll((v) => !v)}
                />
            </div>
        </div>
    );
}
