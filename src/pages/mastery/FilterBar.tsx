import { Star } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface FilterBarProps {
    completedCount: number;
    hiddenCount: number;
}

export default function FilterBar({ completedCount, hiddenCount }: FilterBarProps) {
    const {
        showCompletedAchievements,
        showHidden,
        showRecommendedOnly,
        setShowCompletedAchievements,
        setShowHidden,
        setShowRecommendedOnly,
    } = useAppStore();

    const handleShowHiddenChange = () => {
        setShowHidden(!showHidden);
    };

    return (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 w-full md:px-2">
            <div className="flex items-center gap-1">
                <label className="flex items-center gap-1 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={showCompletedAchievements}
                        onChange={() => setShowCompletedAchievements(!showCompletedAchievements)}
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

            <div className="flex items-center gap-1">
                <label className="flex items-center gap-1 cursor-pointer group">
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

            <label className="flex items-center gap-1 cursor-pointer group">
                <input
                    type="checkbox"
                    checked={showRecommendedOnly}
                    onChange={() => setShowRecommendedOnly(!showRecommendedOnly)}
                    className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-700 checked:bg-amber-600 checked:border-amber-600 cursor-pointer transition-all"
                />
                <Star className="w-3 h-3 text-slate-300 fill-slate-300 group-hover:text-white group-hover:fill-white transition-colors" />
                <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                    Recommended only
                </span>
            </label>
        </div>
    );
}
