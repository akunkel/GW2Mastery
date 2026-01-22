import { memo } from 'react';
import { getTextStroke } from '../../lib/utils';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '../../utils/mapCoordinates';

interface ZoneProps {
    id: number;
    name: string;
    polygonPoints: string;
    center: [number, number];
}

export const Zone = memo(({ name, polygonPoints, center }: ZoneProps) => {
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

    const fontSize = 2 + width * 0.05;

    // Convert center coordinates relative to the element
    const centerXPercent = ((center[0] - minX) / width) * 100;
    const centerYPercent = ((center[1] - minY) / height) * 100;

    return (
        <div
            className="absolute pointer-events-auto cursor-pointer"
            style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                clipPath: `polygon(${clipPathPoints})`,
                background: 'rgba(59, 130, 246, 0.1)',
                transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            }}
            title={name}
        >
            {/* Zone label */}
            <div
                className="absolute pointer-events-none select-none text-center text-white font-bold"
                style={{
                    left: `${centerXPercent}%`,
                    top: `${centerYPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${fontSize}px`,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    textShadow: getTextStroke(0.08),
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    lineHeight: '1.2',
                    maxWidth: '90%',
                    wordWrap: 'break-word',
                }}
            >
                {name}
            </div>
        </div>
    );
});

Zone.displayName = 'Zone';
