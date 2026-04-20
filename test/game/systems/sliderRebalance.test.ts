/**
 * Slider rebalance algorithm tests.
 * test/game/systems/sliderRebalance.test.ts
 *
 * Tests the rebalanceSliders pure function from production.ts per
 * design/economy/slider-mathematics.md §7.
 */

import { describe, it, expect } from 'vitest';
import { rebalanceSliders, SliderState } from '../../../src/game/systems/production';

type SliderKey = keyof SliderState;

// Helper to create a standard slider state (all unlocked, equal shares)
function makeSliders(
  values: Partial<Record<SliderKey, number>> = {},
  locked: Partial<Record<SliderKey, boolean>> = {},
): SliderState {
  return {
    ship:     { value: values.ship     ?? 20, locked: locked.ship     ?? false },
    defense:  { value: values.defense  ?? 20, locked: locked.defense  ?? false },
    industry: { value: values.industry ?? 20, locked: locked.industry ?? false },
    ecology:  { value: values.ecology  ?? 20, locked: locked.ecology  ?? false },
    research: { value: values.research ?? 20, locked: locked.research ?? false },
  };
}

function sumSliders(sliders: SliderState): number {
  return (sliders.ship.value + sliders.defense.value + sliders.industry.value
    + sliders.ecology.value + sliders.research.value);
}

describe('rebalanceSliders', () => {
  // ── AC: Rebalance when one slider is adjusted ────────────────────────────

  it('rebalances when one slider is adjusted upward', () => {
    const current = makeSliders();
    const result = rebalanceSliders(current, 'ship', 40);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.sliders.ship.value).toBe(40);
    expect(sumSliders(result.sliders)).toBeCloseTo(100, 5);
    // Other unlocked sliders must have decreased proportionally
    expect(result.sliders.defense.value).toBeLessThan(20);
    expect(result.sliders.industry.value).toBeLessThan(20);
    expect(result.sliders.ecology.value).toBeLessThan(20);
    expect(result.sliders.research.value).toBeLessThan(20);
  });

  it('rebalances when one slider is adjusted downward', () => {
    const current = makeSliders({ ship: 40, defense: 15, industry: 15, ecology: 15, research: 15 });
    const result = rebalanceSliders(current, 'ship', 20);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.sliders.ship.value).toBe(20);
    expect(sumSliders(result.sliders)).toBeCloseTo(100, 5);
    // Other sliders must have grown to absorb the freed allocation
    expect(result.sliders.defense.value).toBeGreaterThan(15);
  });

  // ── AC: Rebalance with a locked slider ───────────────────────────────────

  it('rebalances with a locked slider — locked slider stays unchanged', () => {
    const current = makeSliders({}, { defense: true });

    const result = rebalanceSliders(current, 'ship', 40);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.sliders.ship.value).toBe(40);
    expect(result.sliders.defense.value).toBe(20); // locked — must not change
    expect(result.sliders.defense.locked).toBe(true);
    expect(sumSliders(result.sliders)).toBeCloseTo(100, 5);
    // Only the three remaining unlocked sliders (industry/ecology/research) absorb the delta
    expect(result.sliders.industry.value + result.sliders.ecology.value + result.sliders.research.value)
      .toBeCloseTo(40, 5);
  });

  it('distributes delta only among unlocked sliders when multiple sliders are locked', () => {
    const current = makeSliders({}, { defense: true, industry: true });

    const result = rebalanceSliders(current, 'ship', 40);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.sliders.ship.value).toBe(40);
    expect(result.sliders.defense.value).toBe(20); // locked
    expect(result.sliders.industry.value).toBe(20); // locked
    expect(sumSliders(result.sliders)).toBeCloseTo(100, 5);
    // ecology + research absorb everything: 100 - 40 - 20 - 20 = 20
    expect(result.sliders.ecology.value + result.sliders.research.value).toBeCloseTo(20, 5);
  });

  // ── AC: Sum always == 100 after rebalance ────────────────────────────────

  it('sum always equals 100 regardless of which slider is adjusted', () => {
    const base = makeSliders();

    const keys: SliderKey[] = ['ship', 'defense', 'industry', 'ecology', 'research'];
    const testValues = [0, 10, 25, 50, 75, 100];

    for (const key of keys) {
      for (const newValue of testValues) {
        const result = rebalanceSliders(base, key, newValue);
        if (result.ok) {
          expect(sumSliders(result.sliders)).toBeCloseTo(100, 5);
        }
      }
    }
  });

  it('values never go negative after rebalance', () => {
    // Ship at 80% — pushing it to 100 should clamp others to 0, not negative
    const current = makeSliders({ ship: 80, defense: 5, industry: 5, ecology: 5, research: 5 });
    const result = rebalanceSliders(current, 'ship', 100);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.sliders.ship.value).toBe(100);
    expect(result.sliders.defense.value).toBeGreaterThanOrEqual(0);
    expect(result.sliders.industry.value).toBeGreaterThanOrEqual(0);
    expect(result.sliders.ecology.value).toBeGreaterThanOrEqual(0);
    expect(result.sliders.research.value).toBeGreaterThanOrEqual(0);
    expect(sumSliders(result.sliders)).toBeCloseTo(100, 5);
  });

  // ── AC: Rejection when only one unlocked slider exists ───────────────────

  it('rejects when only the changed slider is unlocked (no adjustable peers)', () => {
    // Lock all except ship; then try to move ship — no peers to absorb the delta
    const current = makeSliders({}, { defense: true, industry: true, ecology: true, research: true });

    const result = rebalanceSliders(current, 'ship', 50);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('NO_UNLOCKED_SLIDERS');
  });

  it('rejects when locked sliders already sum above the target value', () => {
    // Locked sliders sum to 80; trying to push ship to 30 → locked(80) + ship(30) > 100
    const current = makeSliders(
      { ship: 10, defense: 40, industry: 40, ecology: 5, research: 5 },
      { defense: true, industry: true },
    );

    const result = rebalanceSliders(current, 'ship', 30);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('LOCKED_SUM_EXCEEDS_100');
  });
});
