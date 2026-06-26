import type { DebugViewConfig } from './types';

interface Props {
    views: DebugViewConfig[];
    selectedLabel: string;
    onViewChange: (label: string) => void;
    description: string;
}

export function ViewSelector({ views, selectedLabel, onViewChange, description }: Props) {
    return (
        <div className="flex flex-col gap-1">
            <label
                htmlFor="view-select"
                className="text-xs font-medium text-slate-400 uppercase tracking-wide"
            >
                View
            </label>
            <select
                id="view-select"
                value={selectedLabel}
                onChange={(e) => onViewChange(e.target.value)}
                className="bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-sm"
            >
                {views.map((e) => (
                    <option key={e.label} value={e.label}>
                        {e.label}
                    </option>
                ))}
            </select>
            <p className="text-sm text-slate-400">{description}</p>
        </div>
    );
}
