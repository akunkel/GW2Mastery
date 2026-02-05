import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import worldMapSmall from '../../assets/images/world_map_small.webp';
import type { CollectibleAchievementProgress, ZoneExplorerProgress, ZoneInsightProgress } from '../../hooks/useExplorerProgress';
import type { RenderedZone } from '../../types/gw2';
import { Zone } from './Zone';

interface InteractiveMapProps {
    zones: RenderedZone[];
    explorerProgress: Map<string, ZoneExplorerProgress | null>;
    insightProgress: Map<string, ZoneInsightProgress>;
    collectibleProgress: Map<string, CollectibleAchievementProgress[]>;
}

export default function InteractiveMap({ zones, explorerProgress, insightProgress, collectibleProgress }: InteractiveMapProps) {
    return (
        <TransformWrapper
            initialScale={2}
            minScale={1.2}
            maxScale={6}
            smooth
            wheel={{ smoothStep: 0.005 }}
            panning={{ velocityDisabled: true }}
            centerOnInit
            limitToBounds
            disablePadding
        >
            {() => (
                <TransformComponent wrapperClass="!h-[calc(100dvh-11.8rem)] md:!h-[calc(100dvh-9rem)]">
                    <img
                        src={worldMapSmall}
                        alt="Tyria World Map"
                        className="w-[100dvw] h-auto object-contain"
                        draggable={false}
                    />
                    <div className="absolute inset-0">
                        {zones.map((zone) => {
                            // Get progress: undefined if not in map, null or ZoneExplorerProgress if present
                            const progress = explorerProgress.has(zone.name)
                                ? explorerProgress.get(zone.name)
                                : null; // null indicates no Explorer achievement exists

                            const insight = insightProgress.get(zone.name);
                            const collectible = collectibleProgress.get(zone.name);

                            return (
                                <Zone
                                    key={zone.id}
                                    id={zone.id}
                                    name={zone.name}
                                    polygonPoints={zone.polygonPoints}
                                    center={zone.center}
                                    masteryRegion={zone.masteryRegion}
                                    explorerProgress={progress}
                                    insightProgress={insight}
                                    collectibleAchievements={collectible}
                                />
                            );
                        })}
                    </div>
                </TransformComponent>
            )}
        </TransformWrapper>
    );
}
