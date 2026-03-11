import { CheckCircle2 } from 'lucide-react';
import type { MountDefinition } from '../../data/mountDefinitions';
import { useAppStore } from '../../store/useAppStore';
import { getRegionConfig } from '../../utils/regionHelpers';

interface MountCardProps {
    mount: MountDefinition;
    onClick: () => void;
}

export default function MountCard({ mount, onClick }: MountCardProps) {
    const enrichedAchievementMap = useAppStore((s) => s.enrichedAchievementMap);
    const unlockedMountTypes = useAppStore((s) => s.unlockedMountTypes);

    const regionConfig = getRegionConfig(mount.region);
    const color = regionConfig.color;
    const image = mount.image ?? regionConfig.image;
    const isComplete =
        enrichedAchievementMap.get(mount.unlockAchievementId)?.progress?.done === true;
    const isUnlocked = mount.mountTypeId ? unlockedMountTypes.includes(mount.mountTypeId) : false;

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
                    <img src={image} alt={mount.name} className="w-24 h-24 object-contain" />
                </div>
            )}

            {/* Content on right */}
            <div className="flex-1 flex items-center gap-2 relative z-10">
                <h2 className="text-2xl font-bold text-white leading-none">{mount.cardTitle ?? mount.name}</h2>
                {isUnlocked && (
                    <CheckCircle2 className="shrink-0 w-6 h-6 text-green-400 translate-y-0.5" />
                )}
            </div>
        </button>
    );
}
