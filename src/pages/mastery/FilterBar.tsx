import { useAppStore } from '../../store/useAppStore';

interface FilterBarProps {
    completedCount: number;
    hiddenCount: number;
}

export default function FilterBar({ completedCount, hiddenCount }: FilterBarProps) {
    const { filter, goal, showHidden, setFilter, setGoal, setShowHidden } = useAppStore();

    const showCompleted = filter === 'all';
    const requiredOnly = goal === 'required';

    const handleFilterCheckboxChange = () => {
        setFilter(showCompleted ? 'incomplete' : 'all');
    };

    const handleGoalCheckboxChange = () => {
        setGoal(requiredOnly ? 'all' : 'required');
    };

    const handleShowHiddenChange = () => {
        setShowHidden(!showHidden);
    };

    return (
        <div className="flex items-end justify-between w-full md:px-2">
            {/* Left side - Hide completed and show hidden checkboxes */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
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
            </div>

            {/* Goal checkbox - pinned right */}
            <label className="flex items-center gap-2 cursor-pointer group">
                <input
                    type="checkbox"
                    checked={requiredOnly}
                    onChange={handleGoalCheckboxChange}
                    className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-700 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all"
                />
                <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                    Required only
                </span>
            </label>
        </div>
    );
}
