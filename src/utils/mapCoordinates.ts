// Map coordinate conversion utilities for Guild Wars 2 map rendering

// Tyria continent dimensions from GW2 API (continent ID 1)
export const TYRIA_WIDTH = 81920;
export const TYRIA_HEIGHT = 114688;

// World map image dimensions (world_map_small.webp)
export const IMAGE_WIDTH = 2000;
export const IMAGE_HEIGHT = 2800;

/**
 * Convert continent coordinates to pixel coordinates
 * @param continentX - X coordinate in continent space
 * @param continentY - Y coordinate in continent space
 * @returns [x, y] pixel coordinates rounded to whole pixels for crisp rendering
 */
export function continentToPixel(continentX: number, continentY: number): [number, number] {
    const x = Math.round((continentX / TYRIA_WIDTH) * IMAGE_WIDTH);
    const y = Math.round((continentY / TYRIA_HEIGHT) * IMAGE_HEIGHT);
    return [x, y];
}

/**
 * Convert a continent_rect to SVG polygon points string
 * continent_rect format: [[NW_x, NW_y], [SE_x, SE_y]]
 * @param continent_rect - Bounding rectangle from GW2 API
 * @returns SVG polygon points string
 */
export function mapRectToPolygon(continent_rect: [[number, number], [number, number]]): string {
    const [nw, se] = continent_rect;

    // Create 4 corners of the rectangle
    const corners: [number, number][] = [
        continentToPixel(nw[0], nw[1]), // NW (top-left)
        continentToPixel(se[0], nw[1]), // NE (top-right)
        continentToPixel(se[0], se[1]), // SE (bottom-right)
        continentToPixel(nw[0], se[1]), // SW (bottom-left)
    ];

    // Convert to SVG polygon points format: "x1,y1 x2,y2 x3,y3 x4,y4"
    return corners.map(([x, y]) => `${x},${y}`).join(' ');
}

/**
 * Calculate the center point of a zone for label placement
 * @param continent_rect - Bounding rectangle from GW2 API
 * @returns [x, y] pixel coordinates of the center
 */
export function getZoneCenter(continent_rect: [[number, number], [number, number]]): [number, number] {
    const [nw, se] = continent_rect;
    const centerX = (nw[0] + se[0]) / 2;
    const centerY = (nw[1] + se[1]) / 2;
    return continentToPixel(centerX, centerY);
}
