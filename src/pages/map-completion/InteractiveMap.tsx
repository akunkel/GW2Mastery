import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import worldMapSmall from '../../assets/images/world_map_small.webp';
import type { RenderedZone } from '../../types/gw2';
import { Zone } from './Zone';

interface InteractiveMapProps {
    zones: RenderedZone[];
}

export default function InteractiveMap({ zones }: InteractiveMapProps) {
    return (
        <TransformWrapper
            initialScale={2}
            minScale={1.2}
            maxScale={6}
            wheel={{ step: 0.5 }}
            panning={{ velocityDisabled: true }}
            centerOnInit
            limitToBounds
            disablePadding
        >
            {() => (
                <div className="relative h-full flex flex-col">
                    <div className="flex-1 min-h-0">
                        <TransformComponent
                            wrapperClass="w-full h-full bg-slate-900 rounded-lg overflow-hidden"
                            contentClass="w-full h-full"
                        >
                            <div className="relative w-full h-full">
                                <img
                                    src={worldMapSmall}
                                    alt="Tyria World Map"
                                    className="w-full h-full object-contain"
                                    draggable={false}
                                />
                                <div className="absolute inset-0">
                                    {zones.map((zone) => (
                                        <Zone
                                            key={zone.id}
                                            id={zone.id}
                                            name={zone.name}
                                            polygonPoints={zone.polygonPoints}
                                            center={zone.center}
                                        />
                                    ))}
                                </div>
                            </div>
                        </TransformComponent>
                    </div>
                </div>
            )}
        </TransformWrapper>
    );
}
