import { CheckCircle2 } from 'lucide-react';


import type { MasteryRegion } from '../../types/gw2';
import { getRegionDisplayName } from '../../utils/filters';
import { getRegionColor, getRegionImage } from '../../utils/regionHelpers';

interface ExpansionCardProps {
  region: MasteryRegion;
  completed: number;
  total: number;
  isComplete: boolean;
  onClick: () => void;
}

export default function ExpansionCard({
  region,
  completed,
  total,
  isComplete,
  onClick,
}: ExpansionCardProps) {
  const regionColor = getRegionColor(region);
  const regionImage = getRegionImage(region);

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden flex items-center gap-4 text-left border-2 ${isComplete ? 'border-green-500' : 'border-transparent'
        }`}
    >
      {/* Background with opacity */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundColor: regionColor,
        }}
      />

      {/* Image on left */}
      {regionImage && (
        <div className="flex-shrink-0 relative z-10">
          <img
            src={regionImage}
            alt={getRegionDisplayName(region)}
            className="w-24 h-24 object-contain"
          />
        </div>
      )}

      {/* Content section on right */}
      <div className="flex-1 flex flex-col items-start relative z-10">
        <h2 className="text-2xl font-bold text-white mb-2 text-left">
          {getRegionDisplayName(region)}
        </h2>
        <div className="flex items-center gap-3">
          {isComplete && <CheckCircle2 className="w-6 h-6 text-green-400" />}
          <span className="text-xl font-semibold text-white">
            {completed} / {total}
          </span>
        </div>
      </div>
    </button>
  );
}
