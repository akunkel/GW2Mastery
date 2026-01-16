import type { FilterType, GoalType } from '../../types/gw2';

interface FilterBarProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  currentGoal: GoalType;
  onGoalChange: (goal: GoalType) => void;
  totalCount: number;
  completedCount: number;
  incompleteCount: number;
  showHidden: boolean;
  onShowHiddenChange: (showHidden: boolean) => void;
  hiddenCount: number;
}

export default function FilterBar({
  currentFilter,
  onFilterChange,
  currentGoal,
  onGoalChange,
  completedCount,
  showHidden,
  onShowHiddenChange,
  hiddenCount,
}: FilterBarProps) {
  const showCompleted = currentFilter === 'all';
  const requiredOnly = currentGoal === 'required';

  const handleFilterCheckboxChange = () => {
    onFilterChange(showCompleted ? 'incomplete' : 'all');
  };

  const handleGoalCheckboxChange = () => {
    onGoalChange(requiredOnly ? 'all' : 'required');
  };

  const handleShowHiddenChange = () => {
    onShowHiddenChange(!showHidden);
  };

  return (
    <div className="flex items-end justify-between w-full">
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
            ({completedCount} completed)
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
          <span className="text-slate-400 text-xs">({hiddenCount} hidden)</span>
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
