import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { OTHER_MOUNT_DEFINITIONS, MOUNT_DEFINITIONS } from '../../data/mountDefinitions';
import { useAppStore } from '../../store/useAppStore';
import MountsGrid from './MountsGrid';

export default function MountsPage() {
    const enrichedAchievementMap = useAppStore((s) => s.enrichedAchievementMap);

    // Handle selection state via URL hash
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(() => {
        const hash = window.location.hash.replace('#', '');
        return hash || null;
    });

    useEffect(() => {
        const handlePopState = () => {
            const hash = window.location.hash.replace('#', '');
            setSelectedSectionId(hash || null);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleSelectionChange = (id: string | null) => {
        setSelectedSectionId(id);
        if (id) {
            window.history.pushState({ expansion: id }, '', `#${id}`);
        } else {
            window.history.pushState(null, '', window.location.pathname);
        }
    };

    const isLoaded = enrichedAchievementMap.size > 0;

    return (
        <div className="pb-4">
            {/* Page Title */}
            <div className="text-center mb-2 mt-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mounts</h1>
                <p className="text-slate-400 md:text-base text-sm">You can never have too many.</p>
            </div>

            {!isLoaded && <LoadingSpinner message="Loading…" />}

            {isLoaded && (
                <>
                    <AnimatePresence mode="wait">
                        <MountsGrid
                            mounts={MOUNT_DEFINITIONS}
                            selectedId={selectedSectionId}
                            onSelectionChange={handleSelectionChange}
                            toolbar={
                                <h2 className="text-xl font-bold text-slate-300 mt-4">
                                    Mount Masteries
                                </h2>
                            }
                        />
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        <MountsGrid
                            mounts={OTHER_MOUNT_DEFINITIONS}
                            selectedId={selectedSectionId}
                            onSelectionChange={handleSelectionChange}
                            toolbar={
                                <h2 className="text-xl font-bold text-slate-300 mt-4">
                                    Other Masteries
                                </h2>
                            }
                        />
                    </AnimatePresence>

                    {!selectedSectionId && (
                        <ul className="[list-style-type:'*__'] list-inside text-sm text-slate-400 px-4 sm:px-6 lg:px-8 mt-8 mb-4 space-y-1">
                            <li>
                                Checkmarks indicate mount ownership (requires "inventories"
                                permissions on the API key).
                            </li>
                            <li>Green borders indicate the mastery track is unlocked.</li>
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}
