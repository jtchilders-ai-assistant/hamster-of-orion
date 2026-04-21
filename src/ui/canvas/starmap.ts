/**
 * Star map canvas drawing helpers — pure canvas rendering, NO game logic.
 * src/ui/canvas/starmap.ts
 *
 * All functions are stateless helpers that take a CanvasRenderingContext2D
 * and explicit parameters. No DOM queries, no store access.
 */

import { StarType, GalaxyCoord } from '../../game/state';

// ── Star color palette ─────────────────────────────────────────────────────

export const STAR_COLORS: Readonly<Record<StarType, string>> = {
  yellow: '#ffee88',
  green:  '#88ff88',
  red:    '#ff6644',
  blue:   '#88aaff',
  white:  '#ffffff',
  purple: '#cc88ff',
};

// ── Map transform ──────────────────────────────────────────────────────────

export interface MapTransform {
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Compute the scale and offset to map galaxy coordinates → canvas pixels.
 *
 * @param canvasWidth  - Canvas element pixel width
 * @param canvasHeight - Canvas element pixel height
 * @param galaxyWidth  - Galaxy coordinate space width
 * @param galaxyHeight - Galaxy coordinate space height
 * @param padding      - Pixel padding around the edge of the canvas
 */
export function getMapTransform(
  canvasWidth: number,
  canvasHeight: number,
  galaxyWidth: number,
  galaxyHeight: number,
  padding = 40,
): MapTransform {
  const scaleX = (canvasWidth - padding * 2) / galaxyWidth;
  const scaleY = (canvasHeight - padding * 2) / galaxyHeight;
  return { scaleX, scaleY, offsetX: padding, offsetY: padding };
}

/**
 * Convert galaxy coordinates to canvas pixel coordinates.
 */
export function galaxyToCanvas(
  coord: GalaxyCoord,
  transform: MapTransform,
): { x: number; y: number } {
  return {
    x: coord.x * transform.scaleX + transform.offsetX,
    y: coord.y * transform.scaleY + transform.offsetY,
  };
}

// ── Hit testing ────────────────────────────────────────────────────────────

/**
 * Return the ID of the star system closest to (mx, my) within `radius` pixels.
 * Returns null if no system is within range.
 *
 * @param mx        - Mouse X in canvas pixels
 * @param my        - Mouse Y in canvas pixels
 * @param systems   - Array of { id, coordinates } objects
 * @param transform - MapTransform from getMapTransform()
 * @param radius    - Click hit-radius in pixels (default 20)
 */
export function hitTestStar(
  mx: number,
  my: number,
  systems: ReadonlyArray<{ id: string; coordinates: GalaxyCoord }>,
  transform: MapTransform,
  radius = 20,
): string | null {
  let closestId: string | null = null;
  let closestDist = radius;

  for (const sys of systems) {
    const px = sys.coordinates.x * transform.scaleX + transform.offsetX;
    const py = sys.coordinates.y * transform.scaleY + transform.offsetY;
    const d = Math.hypot(mx - px, my - py);
    if (d < closestDist) {
      closestDist = d;
      closestId = sys.id;
    }
  }

  return closestId;
}

// ── Drawing primitives ─────────────────────────────────────────────────────

/**
 * Draw a single star system dot with a glow effect.
 *
 * @param ctx       - 2D rendering context
 * @param x         - Canvas X
 * @param y         - Canvas Y
 * @param starType  - Spectral type (determines color)
 * @param coreRadius - Radius of the solid center dot
 * @param glowRadius - Radius of the soft glow halo
 */
export function drawStarDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  starType: StarType,
  coreRadius = 4,
  glowRadius = 8,
): void {
  const color = STAR_COLORS[starType];

  // Glow halo
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  gradient.addColorStop(0, color + 'cc');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Solid core
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, coreRadius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw the selection highlight ring around a star.
 *
 * @param ctx    - 2D rendering context
 * @param x      - Canvas X
 * @param y      - Canvas Y
 * @param radius - Ring radius in pixels
 * @param color  - Ring color (default: bright cyan)
 */
export function drawSelectionRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius = 12,
  color = '#00d4ff',
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner pulse ring
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw a colony ownership ring around a star.
 *
 * @param ctx        - 2D rendering context
 * @param x          - Canvas X
 * @param y          - Canvas Y
 * @param empireColor - Hex/CSS color for the empire
 * @param radius     - Ring radius in pixels
 */
export function drawColonyRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  empireColor: string,
  radius = 9,
): void {
  ctx.save();
  ctx.strokeStyle = empireColor;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw the star system name label below the star dot.
 *
 * @param ctx     - 2D rendering context
 * @param x       - Canvas X (center of star)
 * @param y       - Canvas Y (center of star)
 * @param name    - System name to display
 * @param color   - Label color (default: pale blue-white)
 * @param yOffset - Vertical offset below star center (default: 16)
 */
export function drawStarLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  name: string,
  color = '#b8d0e8',
  yOffset = 16,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.globalAlpha = 0.9;
  ctx.fillText(name, x, y + yOffset);
  ctx.restore();
}

/**
 * Draw a fleet presence indicator (small triangle) near a star.
 *
 * @param ctx     - 2D rendering context
 * @param x       - Canvas X (star position)
 * @param y       - Canvas Y (star position)
 * @param color   - Fleet color (empire color for owned fleets)
 * @param side    - 'right' for orbiting, 'left' for outbound
 */
export function drawFleetIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  side: 'left' | 'right' = 'right',
): void {
  const offset = side === 'right' ? 14 : -14;
  const fx = x + offset;
  const fy = y;
  const size = 4;
  const dir = side === 'right' ? 1 : -1;

  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(fx + size * dir, fy);
  ctx.lineTo(fx - size * 0.5 * dir, fy - size * 0.8);
  ctx.lineTo(fx - size * 0.5 * dir, fy + size * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Calculate Euclidean distance between two galaxy coordinates (in parsecs).
 */
export function calculateDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Draw a fleet movement range circle (deployment mode).
 *
 * @param ctx       - 2D rendering context
 * @param x         - Canvas X (fleet star position)
 * @param y         - Canvas Y (fleet star position)
 * @param radius    - Circle radius in pixels
 * @param color     - Circle stroke color (default: green)
 * @param lineWidth - Stroke width (default: 1.5)
 */
export function drawFleetRangeCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color = '#00cc66',
  lineWidth = 1.5,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = 0.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw a route path line between two star systems.
 *
 * @param ctx     - 2D rendering context
 * @param fromX   - Canvas X (origin)
 * @param fromY   - Canvas Y (origin)
 * @param toX     - Canvas X (destination)
 * @param toY     - Canvas Y (destination)
 * @param color   - Line color: green = in-range, red = out-of-range
 * @param dashed  - Whether to draw as dashed line
 */
export function drawPathLine(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color = '#00cc66',
  dashed = false,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.7;
  if (dashed) {
    ctx.setLineDash([6, 4]);
  }
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw a fleet-in-transit indicator along a path.
 *
 * Shows a small triangle moving along the route line at the appropriate
 * position based on progress (0 = at origin, 1 = at destination).
 *
 * @param ctx       - 2D rendering context
 * @param fromX     - Canvas X (origin star)
 * @param fromY     - Canvas Y (origin star)
 * @param toX       - Canvas X (destination star)
 * @param toY       - Canvas Y (destination star)
 * @param progress  - 0-1 progress along the route
 * @param color     - Fleet color
 * @param size      - Triangle size in pixels (default: 6)
 */
export function drawFleetInTransit(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  progress: number,
  color: string,
  size = 6,
): void {
  const t = Math.max(0, Math.min(1, progress));
  const x = fromX + (toX - fromX) * t;
  const y = fromY + (toY - fromY) * t;

  // Direction vector (normalized)
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.hypot(dx, dy) || 1;
  const nx = dx / len;
  const ny = dy / len;

  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;

  // Triangle pointing in direction of travel
  ctx.beginPath();
  ctx.moveTo(x + nx * size, y + ny * size);
  const perpX = -ny;
  const perpY = nx;
  ctx.lineTo(x + nx * (-size * 0.5) + perpX * size * 0.5, y + ny * (-size * 0.5) + perpY * size * 0.5);
  ctx.lineTo(x + nx * (-size * 0.5) - perpX * size * 0.5, y + ny * (-size * 0.5) - perpY * size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
