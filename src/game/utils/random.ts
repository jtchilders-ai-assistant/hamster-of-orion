/**
 * Random utility functions — pure TypeScript, NO DOM.
 * src/game/utils/random.ts
 *
 * Simple seeded PRNG (xorshift32) for reproducible galaxy generation.
 */

let _seed = 0;

/**
 * Seed the PRNG. Call once at game start with the saved seed.
 */
export function seedRandom(seed: number): void {
  _seed = seed >>> 0 || 1;
}

/**
 * Return the next pseudo-random number in [0, 1).
 */
export function seededRandom(): number {
  _seed ^= _seed << 13;
  _seed ^= _seed >> 17;
  _seed ^= _seed << 5;
  return (_seed >>> 0) / 0x100000000;
}

/**
 * Return a random integer in [min, max] (inclusive).
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

/**
 * Pick a random element from a non-empty array.
 */
export function randomPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)];
}

/**
 * Generate a unique-ish prefixed ID using Math.random (not seeded).
 * Use for runtime entity creation, not galaxy gen.
 */
export function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
