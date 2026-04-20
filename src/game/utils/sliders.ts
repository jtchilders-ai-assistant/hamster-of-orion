/**
 * Slider rebalancing utilities — pure TypeScript, NO DOM.
 * src/game/utils/sliders.ts
 *
 * Re-exports the rebalance algorithm from production.ts for clean imports by
 * UI code and tests, without pulling in the full production system.
 *
 * Algorithm source: design/economy/slider-mathematics.md §7
 */

// Re-export the types and function from production.ts so callers can import
// from one place without depending on the full production module.
export type { SliderState, RebalanceResult } from '../systems/production';
export { rebalanceSliders } from '../systems/production';
