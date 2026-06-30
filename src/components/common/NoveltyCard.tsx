import { CheckCircle2 } from 'lucide-react';
import { noveltyMetadata } from '../../data/noveltyMetadata';
import type { NoveltyEntry } from '../../types/novelty';

interface NoveltyCardProps {
  novelty: NoveltyEntry;
  isUnlocked: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function NoveltyCard({ novelty, isUnlocked, disabled, onClick }: NoveltyCardProps) {
  const wikiUrl = `https://wiki.guildwars2.com/wiki/${encodeURIComponent(novelty.name)}`;
  const source = noveltyMetadata[novelty.id]?.source
    ?? (novelty.achievementIds.length > 0 ? 'Achievement' : undefined);

  if (disabled) {
    return (
      <a
        href={wikiUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-full p-3 rounded-xl shadow-lg relative overflow-hidden flex items-center gap-3 text-left border-2 border-transparent bg-slate-700/40 hover:bg-slate-700/60 transition-colors cursor-pointer"
      >
        {novelty.icon && (
          <div className="flex-shrink-0">
            <img
              src={novelty.icon}
              alt={novelty.name}
              className="w-12 h-12 object-contain grayscale opacity-60"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate text-slate-400 hover:text-blue-400 transition-colors">
              {novelty.name}
            </span>
            {isUnlocked && (
              <CheckCircle2 className="shrink-0 w-5 h-5 text-green-400" />
            )}
          </div>
          {source && (
            <span className="text-xs text-slate-500 truncate block">{source}</span>
          )}
        </div>
      </a>
    );
  }

  return (
    <div
      onClick={onClick}
      role="button"
      className={`w-full h-full p-3 rounded-xl bg-slate-800 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer relative overflow-hidden flex items-center gap-3 text-left border-2 ${isUnlocked ? 'border-green-500' : 'border-transparent'}`}
    >
      {novelty.icon && (
        <div className="flex-shrink-0">
          <img
            src={novelty.icon}
            alt={novelty.name}
            className="w-12 h-12 object-contain"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate text-white">
            {novelty.name}
          </span>
          {isUnlocked && (
            <CheckCircle2 className="shrink-0 w-5 h-5 text-green-400" />
          )}
        </div>
        {source && (
          <span className="text-xs text-slate-500 truncate block">{source}</span>
        )}
      </div>
    </div>
  );
}
