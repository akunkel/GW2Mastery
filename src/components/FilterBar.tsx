import type { FilterType, GoalType } from '../types/gw2';

interface FilterBarProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  currentGoal: GoalType;
  onGoalChange: (goal: GoalType) => void;
  totalCount: number;
  completedCount: number;
  incompleteCount: number;
}

export default function FilterBar({
  currentFilter,
  onFilterChange,
  currentGoal,
  onGoalChange,
  totalCount,
  incompleteCount,
}: FilterBarProps) {
  const hideCompleted = currentFilter === 'incomplete';
  const requiredOnly = currentGoal === 'required';

  const handleFilterCheckboxChange = () => {
    onFilterChange(hideCompleted ? 'all' : 'incomplete');
  };

  const handleGoalCheckboxChange = () => {
    onGoalChange(requiredOnly ? 'all' : 'required');
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Hide completed checkbox */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={handleFilterCheckboxChange}
            className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-700 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all"
          />
          <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
            Hide completed
          </span>
        </label>
        <span className="text-slate-400 text-xs">
          ({hideCompleted ? incompleteCount : totalCount} shown)
        </span>
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
