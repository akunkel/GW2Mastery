import { CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { CardProps } from './AchievementList';

export default function MountCard({ section, onClick }: CardProps) {
    const { title, name, image, color, completedCount, totalCount, isComplete: isCompleteProp, mountTypeId } = section;
    const displayTitle = title || name;
    const isComplete = isCompleteProp ?? (totalCount > 0 && completedCount >= totalCount);

    const unlockedMountTypes = useAppStore((s) => s.unlockedMountTypes);
    const isUnlocked = mountTypeId ? unlockedMountTypes.includes(mountTypeId) : false;

    return (
        <button
            onClick={onClick}
            className={`w-full h-full p-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden flex items-center gap-4 text-left border-2 ${isComplete ? 'border-green-500' : 'border-transparent'}`}
        >
            {/* Background with opacity */}
            {color && (
                <div className="absolute inset-0 opacity-50" style={{ backgroundColor: color }} />
            )}

            {/* Mount image on left */}
            {image && (
                <div className="flex-shrink-0 relative z-10">
                    <img src={image} alt={displayTitle} className="w-24 h-24 object-contain" />
                </div>
            )}

            {/* Content on right */}
            <div className="flex-1 flex flex-col items-start relative z-10">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white text-left leading-none">{displayTitle}</h2>
                    {isUnlocked && <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 translate-y-0.5" />}
                </div>
            </div>
        </button>
    );
}
