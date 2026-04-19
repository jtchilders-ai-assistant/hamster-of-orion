/**
 * Canvas rendering utilities.
 * src/ui/canvas/renderer.ts
 */

/**
 * Clear a canvas to its background color.
 */
export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#000010';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Draw a simple starfield background (static, seeded by position).
 */
export function drawStarfield(ctx: CanvasRenderingContext2D, starCount = 200): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

  // Pseudo-random but stable positions based on canvas size
  let s = 12345;
  const xorshift = (): number => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 0x100000000;
  };

  for (let i = 0; i < starCount; i++) {
    const x = xorshift() * w;
    const y = xorshift() * h;
    const r = xorshift() * 1.2 + 0.3;
    ctx.globalAlpha = xorshift() * 0.5 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw a colored star system dot.
 */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  radius = 4,
  glowRadius = 8,
): void {
  // Glow
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  gradient.addColorStop(0, color + 'cc');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Core
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}
