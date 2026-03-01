import { useAppStore } from '../../store/useAppStore';

interface FilterBarProps {
    completedCount: number;
    hiddenCount: number;
}

export default function FilterBar({ completedCount, hiddenCount }: FilterBarProps) {
    const {
        filter,
        showHidden,
        showRecommendedOnly,
        setFilter,
        setShowHidden,
        setShowRecommendedOnly,
    } = useAppStore();

    const showCompleted = filter === 'all';

    const handleFilterCheckboxChange = () => {
        setFilter(showCompleted ? 'incomplete' : 'all');
    };

    const handleShowHiddenChange = () => {
        setShowHidden(!showHidden);
    };

    return (
        <div className="flex flex-wrap items-center gap-8 w-full md:px-2">
            <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={showCompleted}
                        onChange={handleFilterCheckboxChange}
                        className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-700 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all"
                    />
                    <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                        Show completed
                    </span>
                </label>
                <span className="text-slate-400 text-xs">
                    ({completedCount}
                    <span className="hidden sm:inline"> completed</span>)
                </span>
            </div>

            <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={showHidden}
                        onChange={handleShowHiddenChange}
                        className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-700 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all"
                    />
                    <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                        Show hidden
                    </span>
                </label>
                <span className="text-slate-400 text-xs">
                    ({hiddenCount}
                    <span className="hidden sm:inline"> hidden</span>)
                </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer group">
                <input
                    type="checkbox"
                    checked={showRecommendedOnly}
                    onChange={() => setShowRecommendedOnly(!showRecommendedOnly)}
                    className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-700 checked:bg-amber-600 checked:border-amber-600 cursor-pointer transition-all"
                />
                <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                    Recommended only
                </span>
            </label>
        </div>
    );
}
