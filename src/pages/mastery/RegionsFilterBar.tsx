export type GoalFilter = 'all' | 'required';

interface RegionsFilterBarProps {
    goalFilter: GoalFilter;
    onGoalChange: (goal: GoalFilter) => void;
}

export default function RegionsFilterBar({ goalFilter, onGoalChange }: RegionsFilterBarProps) {
    return (
        <div className="flex items-center justify-end w-full md:px-2">
            <div className="flex items-center gap-2">
                <label className="text-slate-300 text-sm font-medium" htmlFor="goal-select">
                    Goal
                </label>
                <select
                    id="goal-select"
                    value={goalFilter}
                    onChange={(e) => onGoalChange(e.target.value as GoalFilter)}
                    className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-md px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors hover:border-slate-400"
                >
                    <option value="required">Required Only</option>
                    <option value="all">All Mastery Points</option>
                </select>
            </div>
        </div>
    );
}
