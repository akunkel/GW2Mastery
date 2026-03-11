import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CardProps } from './AchievementList';

export default function RegionCard({ section, onClick }: CardProps) {
    const {
        title,
        name,
        image,
        color,
        completedCount,
        totalCount,
        isComplete: isCompleteProp,
    } = section;
    const displayTitle = title || name;
    const isComplete = isCompleteProp ?? (totalCount > 0 && completedCount >= totalCount);

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full h-full p-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden flex items-center gap-4 text-left border-2',
                isComplete ? 'border-green-500' : 'border-transparent'
            )}
        >
            {/* Background with opacity */}
            {color && (
                <div
                    className="absolute inset-0 opacity-50"
                    style={{
                        backgroundColor: color,
                    }}
                />
            )}

            {/* Image on left */}
            {image && (
                <div className="flex-shrink-0 relative z-10">
                    <img src={image} alt={displayTitle} className="w-24 h-24 object-contain" />
                </div>
            )}

            {/* Content section on right */}
            <div className="flex-1 flex flex-col items-start relative z-10">
                <h2 className="text-2xl font-bold text-white leading-none mb-2 text-left">
                    {displayTitle}
                </h2>
                <div className="flex items-center gap-3">
                    {isComplete && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                    <span
                        className={cn(
                            'text-xl font-semibold',
                            isComplete ? 'text-green-400' : 'text-white'
                        )}
                    >
                        {completedCount} / {totalCount}
                    </span>
                </div>
            </div>
        </button>
    );
}
