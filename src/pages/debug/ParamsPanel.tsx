import type { DebugViewConfig } from './types';

interface Props {
    view: DebugViewConfig;
    paramValues: Record<string, string>;
    onParamChange: (name: string, value: string) => void;
    onSend: () => void;
    loading: boolean;
}

export function ParamsPanel({ view, paramValues, onParamChange, onSend, loading }: Props) {
    return (
        <div className="flex flex-col gap-4 md:w-72 shrink-0">
            <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Parameters
            </h2>

            {view.params.map((param) => (
                <div key={param.name} className="flex flex-col gap-1">
                    <label
                        htmlFor={`param-${param.name}`}
                        className="text-sm font-medium text-slate-300"
                    >
                        {param.label}
                    </label>
                    {param.type === 'select' ? (
                        <select
                            id={`param-${param.name}`}
                            value={paramValues[param.name] ?? ''}
                            onChange={(e) => onParamChange(param.name, e.target.value)}
                            className="bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {param.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : param.type === 'checkbox' ? (
                        <input
                            id={`param-${param.name}`}
                            type="checkbox"
                            checked={paramValues[param.name] === 'true'}
                            onChange={(e) =>
                                onParamChange(param.name, e.target.checked ? 'true' : 'false')
                            }
                            className="w-4 h-4 accent-blue-500"
                        />
                    ) : (
                        <input
                            id={`param-${param.name}`}
                            type="text"
                            value={paramValues[param.name] ?? ''}
                            onChange={(e) => onParamChange(param.name, e.target.value)}
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
                onClick={onSend}
                disabled={loading}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Running…' : 'Run'}
            </button>
        </div>
    );
}
