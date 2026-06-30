import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { noveltyMetadata } from '../../data/noveltyMetadata';
import { getNoveltyData } from '../../database/getNoveltyData';
import { useAppStore } from '../../store/useAppStore';
import type { NoveltyEntry, NoveltySlot } from '../../types/novelty';
import ToysGrid from './ToysGrid';

const SLOT_CONFIG: { slot: NoveltySlot; label: string; collapsed?: boolean }[] = [
  { slot: 'Miscellaneous', label: 'Toys' },
  { slot: 'Chair', label: 'Chairs' },
  { slot: 'HeldItem', label: 'Held Items' },
  { slot: 'Music', label: 'Instruments' },
  { slot: 'Tonic', label: 'Tonics' },
];

export default function ToysPage() {
  const enrichedAchievementMap = useAppStore((s) => s.enrichedAchievementMap);
  const [novelties, setNovelties] = useState<NoveltyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [includeGemStore, setIncludeGemStore] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash ? Number(hash) : null;
  });

  useEffect(() => {
    getNoveltyData().then((db) => {
      if (db) {
        setNovelties(db.novelties);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      setSelectedId(hash ? Number(hash) : null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectionChange = (id: number | null) => {
    setSelectedId(id);
    if (id != null) {
      window.history.pushState({ novelty: id }, '', `#${id}`);
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<NoveltySlot, NoveltyEntry[]>();
    for (const config of SLOT_CONFIG) {
      map.set(config.slot, []);
    }
    for (const n of novelties) {
      if (noveltyMetadata[n.id]?.hidden) continue;
      if (!includeGemStore && noveltyMetadata[n.id]?.source === 'Gem Store') continue;
      const list = map.get(n.slot);
      if (list) {
        list.push(n);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => (b.achievementIds.length > 0 ? 1 : 0) - (a.achievementIds.length > 0 ? 1 : 0));
    }
    return map;
  }, [novelties, includeGemStore]);

  const isLoaded = enrichedAchievementMap.size > 0 && !loading;

  return (
    <div className="pb-4">
      <div className="flex items-start justify-between mt-4 px-4 sm:px-6 lg:px-8">
        <div />
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Novelties</h1>
          <p className="text-slate-400 md:text-base text-sm">
            Toys, tonics, instruments, and more.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none whitespace-nowrap mt-2">
          <input
            type="checkbox"
            checked={includeGemStore}
            onChange={(e) => setIncludeGemStore(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
          />
          Include Gem Store
        </label>
      </div>

      {!isLoaded && <LoadingSpinner message="Loading…" />}

      {isLoaded && novelties.length === 0 && (
        <div className="text-center mt-8 text-slate-400">
          <p>No novelty data available.</p>
          <p className="text-sm mt-2">
            Use Setup → Build Database to fetch novelty data from the API.
          </p>
        </div>
      )}

      {isLoaded && novelties.length > 0 && (
        <>
          {SLOT_CONFIG.map((config) => {
            const items = grouped.get(config.slot) ?? [];
            if (items.length === 0) return null;
            return (
              <AnimatePresence mode="wait" key={config.slot}>
                <ToysGrid
                  novelties={items}
                  selectedId={selectedId}
                  onSelectionChange={handleSelectionChange}
                  defaultCollapsed={config.collapsed ?? false}
                  label={config.label}
                />
              </AnimatePresence>
            );
          })}
        </>
      )}
    </div>
  );
}
