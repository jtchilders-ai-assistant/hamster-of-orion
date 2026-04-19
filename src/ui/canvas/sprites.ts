/**
 * Sprite utilities — placeholder for future asset loading.
 * src/ui/canvas/sprites.ts
 */

const cache = new Map<string, HTMLImageElement>();

/**
 * Load an image asset and cache it.
 */
export function loadSprite(src: string): Promise<HTMLImageElement> {
  const cached = cache.get(src);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      cache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load sprite: ${src}`));
    img.src = src;
  });
}

/**
 * Draw a sprite from the cache. Noop if not loaded yet.
 */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const img = cache.get(src);
  if (!img) return;
  ctx.drawImage(img, x, y, w, h);
}
