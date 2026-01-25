import { useEffect, useMemo } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAppStore } from '../../store/useAppStore';
import type { RenderedZone } from '../../types/gw2';
import { applyMapAdjustments } from '../../utils/mapAdjustments';
import { getZoneCenter, mapRectToPolygon } from '../../utils/mapCoordinates';
import InteractiveMap from './InteractiveMap';

export default function MapCompletionPage() {
    const { continentData, mapLoading, initializeContinentData } = useAppStore();

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
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Map Completion</h2>
                <div className="text-center text-slate-400 mt-10">
                    <p className="mb-4">No map data available.</p>
                    <p className="text-sm">
                        Click the "Build Map" button in the header to fetch continent data.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-4">
            {/* Page header - Fixed height */}
            <div className="mb-4 h-16 px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Map Completion</h2>
                <p className="text-slate-400 text-sm">
                    Explore the world of Tyria. {zones.length} zones available.
                </p>
            </div>

            <InteractiveMap zones={zones} />
        </div>
    );
}
