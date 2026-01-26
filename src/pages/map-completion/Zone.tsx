import { memo } from 'react';
import { getTextStroke } from '../../lib/utils';
import type { MasteryRegion } from '../../types/gw2';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '../../utils/mapCoordinates';
import { getRegionZoneColor } from '../../utils/regionHelpers';

interface ZoneProps {
    id: number;
    name: string;
    polygonPoints: string;
    center: [number, number];
    masteryRegion?: MasteryRegion;
}

export const Zone = memo(({ id, name, polygonPoints, center, masteryRegion }: ZoneProps) => {
    // Get region color or fallback to white
    const baseColor = getRegionZoneColor(masteryRegion ?? 'Tyria');
    // Parse polygon points to get coordinates
    const points = polygonPoints.split(' ').map((point) => {
        const [x, y] = point.split(',').map(Number);
        return { x, y };
    });
    // Calculate bounding box
    const xCoords = points.map((p) => p.x);
    const yCoords = points.map((p) => p.y);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);
    const width = maxX - minX;
    const height = maxY - minY;

    // Convert bounding box to percentages
    const leftPercent = (minX / IMAGE_WIDTH) * 100;
    const topPercent = (minY / IMAGE_HEIGHT) * 100;
    const widthPercent = (width / IMAGE_WIDTH) * 100;
    const heightPercent = (height / IMAGE_HEIGHT) * 100;

    // Convert polygon points relative to the element's own coordinate system
    const clipPathPoints = points
        .map((point) => {
            const xPercent = ((point.x - minX) / width) * 100;
            const yPercent = ((point.y - minY) / height) * 100;
            return `${xPercent}% ${yPercent}%`;
        })
        .join(', ');

    const fontSize = Math.min(1.6 + width * 0.05, height * 0.15);

    return (
        <div
            className="absolute pointer-events-auto cursor-pointer flex items-center justify-center transition-[background] duration-200 bg-[color-mix(in_srgb,var(--zone-base-color)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--zone-base-color)_50%,transparent)] border border-[color-mix(in_srgb,var(--zone-base-color)_50%,transparent)]"
            style={
                {
                    '--zone-base-color': baseColor,
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: `${widthPercent}%`,
                    height: `${heightPercent}%`,
                    clipPath: `polygon(${clipPathPoints})`,
                } as React.CSSProperties
            }
            onClick={() => {
                if (import.meta.env.DEV) {
                    console.log('Zone clicked:', { id, name, center, polygonPoints });
                }
            }}
            title={name}
        >
            {/* Zone label */}
            <div
                className="pointer-events-none select-none text-center text-white font-bold"
                style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    textShadow: getTextStroke(0.08),
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    maxWidth: '90%',
                }}
            >
                {name}
            </div>
        </div>
    );
});

Zone.displayName = 'Zone';
