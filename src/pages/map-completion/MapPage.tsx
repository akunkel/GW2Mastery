import { Info } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import { useExplorerProgress } from '../../hooks/useExplorerProgress';
import { useAppStore } from '../../store/useAppStore';
import type { RenderedZone } from '../../types/gw2';
import { applyMapAdjustments } from '../../utils/mapConfig';
import { getZoneCenter, mapRectToPolygon } from '../../utils/mapCoordinates';
import InteractiveMap from './InteractiveMap';

export default function MapPage() {
    const {
        continentData,
        mapLoading,
        initializeContinentData,
        showCollectibleAchievements,
        setShowCollectibleAchievements,
    } = useAppStore();
    const { progressMap, insightMap, collectibleMap } = useExplorerProgress();

    useEffect(() => {
        initializeContinentData();
    }, [initializeContinentData]);

    // Transform continent data into renderable zones
    // Note: Non-public maps are already filtered out during database build
    const zones = useMemo((): RenderedZone[] => {
        if (!continentData || !continentData.floor.regions) return [];

        const allZones: RenderedZone[] = [];

        // Iterate through all regions
        Object.values(continentData.floor.regions).forEach((region) => {
            // Iterate through all maps in each region
            Object.values(region.maps).forEach((map) => {
                if (!map.continent_rect) return;

                // Apply visual adjustments at runtime
                const adjustedRect = applyMapAdjustments(map.continent_rect, map.name);

                const zone: RenderedZone = {
                    id: map.id,
                    name: map.name,
                    polygonPoints: mapRectToPolygon(adjustedRect),
                    center: getZoneCenter(adjustedRect),
                    minLevel: map.min_level,
                    maxLevel: map.max_level,
                    regionName: region.name,
                    masteryRegion: map.masteryRegion,
                };

                allZones.push(zone);
            });
        });

        return allZones;
    }, [continentData]);

    if (mapLoading) {
        return <LoadingSpinner message="Loading map data..." />;
    }

    if (!continentData || zones.length === 0) {
        return (
            <div className="max-w-[1800px] mx-auto py-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Map Achievements</h2>
                <div className="text-center text-slate-400 mt-10">
                    <p className="mb-4">No map data available.</p>
                    <p className="text-sm">
                        Click "Rebuild Database" in Setup to fetch map data.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-4">
            {/* Page header */}
            <div className="mb-4 px-6 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <span>Map Achievements</span>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="w-5 h-5 text-slate-400 cursor-help translate-y-px" />
                        </TooltipTrigger>
                        <TooltipContent
                            side="bottom"
                            className="max-w-64 border border-slate-700 font-normal text-sm"
                        >
                            Map completion data is not available in the API, so we track
                            achievements related to each zone instead.
                        </TooltipContent>
                    </Tooltip>
                </h2>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={showCollectibleAchievements}
                        onChange={(e) => setShowCollectibleAchievements(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                    />
                    Include collectibles
                </label>
            </div>

            <InteractiveMap
                zones={zones}
                explorerProgress={progressMap}
                insightProgress={insightMap}
                collectibleProgress={showCollectibleAchievements ? collectibleMap : new Map()}
            />
        </div>
    );
}
