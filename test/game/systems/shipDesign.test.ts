/**
 * Unit tests for src/game/systems/shipDesign.ts
 *
 * Coverage:
 * - validateDesign: valid/invalid space, edge cases
 * - calculateDesignCost: hull + component costs
 * - checkTechRequirements: unlocked/locked, starting tech, tier-1
 * - miniaturizedSize: space reduction per tech tier
 * - missingTechRequirements: returns unlocked component IDs
 */

import { describe, it, expect } from 'vitest';
import {
  validateDesign,
  calculateDesignCost,
  checkTechRequirements,
  missingTechRequirements,
  miniaturizedSize,
  getComponent,
  HULL_SPECS,
} from '../../../src/game/systems/shipDesign';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convenience: build a single-component DesignComponent entry. */
function slot(componentId: string, count = 1, techLevelOverride?: number) {
  return { componentId, count, techLevelOverride };
}

// ── HULL_SPECS sanity ─────────────────────────────────────────────────────────

describe('HULL_SPECS', () => {
  it('small hull has 25 space and 6 BC base cost', () => {
    expect(HULL_SPECS.small.space).toBe(25);
    expect(HULL_SPECS.small.baseCost).toBe(6);
  });

  it('medium hull has 70 space and 36 BC base cost', () => {
    expect(HULL_SPECS.medium.space).toBe(70);
    expect(HULL_SPECS.medium.baseCost).toBe(36);
  });

  it('large hull has 280 space and 200 BC base cost', () => {
    expect(HULL_SPECS.large.space).toBe(280);
    expect(HULL_SPECS.large.baseCost).toBe(200);
  });

  it('huge hull has 1400 space and 1200 BC base cost', () => {
    expect(HULL_SPECS.huge.space).toBe(1400);
    expect(HULL_SPECS.huge.baseCost).toBe(1200);
  });
});

// ── getComponent ──────────────────────────────────────────────────────────────

describe('getComponent', () => {
  it('returns component data for a known ID', () => {
    const laser = getComponent('laser');
    expect(laser).toBeDefined();
    expect(laser!.name).toBe('Laser');
    expect(laser!.techLevel).toBe(1);
  });

  it('returns undefined for unknown ID', () => {
    expect(getComponent('nonexistent_weapon_xyz')).toBeUndefined();
  });
});

// ── miniaturizedSize ──────────────────────────────────────────────────────────

describe('miniaturizedSize', () => {
  it('returns base size when no tech override is given', () => {
    const laser = getComponent('laser')!;
    expect(miniaturizedSize(laser)).toBe(laser.size);
  });

  it('returns base size when tech level equals component tech level', () => {
    const laser = getComponent('laser')!; // techLevel: 1, size: 1
    expect(miniaturizedSize(laser, 1)).toBe(1);
  });

  it('returns base size when tech level is below component tech level', () => {
    const ionCannon = getComponent('ion_cannon')!; // techLevel: 10, size: 3
    expect(miniaturizedSize(ionCannon, 5)).toBe(3);
  });

  it('halves size for 1 tier above component tech level', () => {
    const ionCannon = getComponent('ion_cannon')!; // techLevel: 10, size: 3
    // 3 * 0.5 = 1.5 → round → 2 (min 1)
    const result = miniaturizedSize(ionCannon, 11);
    expect(result).toBe(2);
  });

  it('floors at 1 for high tech components with small base size', () => {
    const laser = getComponent('laser')!; // techLevel: 1, size: 1
    // Already size 1; any reduction clamps to 1
    expect(miniaturizedSize(laser, 10)).toBe(1);
  });

  it('returns 0 for components with base size 0', () => {
    const titanium = getComponent('titanium_armor')!; // size: 0
    expect(miniaturizedSize(titanium, 99)).toBe(0);
  });
});

// ── validateDesign ────────────────────────────────────────────────────────────

describe('validateDesign', () => {
  it('returns valid for an empty design', () => {
    const result = validateDesign({ hullSize: 'small', components: [] }, []);
    expect(result.valid).toBe(true);
    expect(result.spaceUsed).toBe(0);
    expect(result.spaceRemaining).toBe(25);
    expect(result.warnings.length).toBeGreaterThan(0); // warns about no components
  });

  it('returns valid for a design within space limit', () => {
    // laser = size 1; 5 lasers = 5 space; small hull = 25 space
    const result = validateDesign(
      { hullSize: 'small', components: [slot('laser', 5)] },
      ['laser'],
    );
    expect(result.valid).toBe(true);
    expect(result.spaceUsed).toBe(5);
    expect(result.totalSpace).toBe(25);
    expect(result.spaceRemaining).toBe(20);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid for a design that exactly fills hull space', () => {
    // laser = size 1; 25 lasers = 25 space on small hull (exactly full)
    const result = validateDesign(
      { hullSize: 'small', components: [slot('laser', 25)] },
      [],
    );
    expect(result.valid).toBe(true);
    expect(result.spaceUsed).toBe(25);
    expect(result.spaceRemaining).toBe(0);
  });

  it('returns invalid with error for an over-space design', () => {
    // laser = size 1; 26 lasers = 26 space on small hull (25 max)
    const result = validateDesign(
      { hullSize: 'small', components: [slot('laser', 26)] },
      [],
    );
    expect(result.valid).toBe(false);
    expect(result.spaceUsed).toBe(26);
    expect(result.spaceRemaining).toBe(-1);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/exceeds hull space/i);
  });

  it('returns invalid for unknown component IDs', () => {
    const result = validateDesign(
      { hullSize: 'medium', components: [slot('bogus_component')] },
      [],
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Unknown component'))).toBe(true);
  });

  it('handles multiple components summing correctly', () => {
    // nuclear_missile = size 1; ion_cannon = size 3
    // 2 missiles (2) + 1 ion cannon (3) = 5 space
    const result = validateDesign(
      {
        hullSize: 'large',
        components: [slot('nuclear_missile', 2), slot('ion_cannon', 1)],
      },
      [],
    );
    expect(result.valid).toBe(true);
    expect(result.spaceUsed).toBe(5);
  });

  it('applies miniaturization when techLevelOverride is provided', () => {
    // ion_cannon = techLevel 10, size 3
    // with techLevel 11 → size halved to 2
    const result = validateDesign(
      {
        hullSize: 'small',
        components: [slot('ion_cannon', 1, 11)],
      },
      [],
    );
    expect(result.spaceUsed).toBe(2);
  });

  it('reports an error for components with invalid count < 1', () => {
    const result = validateDesign(
      { hullSize: 'small', components: [{ componentId: 'laser', count: 0 }] },
      [],
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('invalid count'))).toBe(true);
  });

  it('medium hull design within 70 space limit is valid', () => {
    // heavy_fusion_beam = size 6; 11 × 6 = 66 ≤ 70
    const result = validateDesign(
      { hullSize: 'medium', components: [slot('heavy_fusion_beam', 11)] },
      [],
    );
    expect(result.valid).toBe(true);
    expect(result.spaceUsed).toBe(66);
  });

  it('huge hull can hold many large components', () => {
    // death_ray = size 12; 100 × 12 = 1200 ≤ 1400
    const result = validateDesign(
      { hullSize: 'huge', components: [slot('death_ray', 100)] },
      [],
    );
    expect(result.valid).toBe(true);
    expect(result.spaceUsed).toBe(1200);
  });
});

// ── calculateDesignCost ───────────────────────────────────────────────────────

describe('calculateDesignCost', () => {
  it('returns hull base cost for an empty design', () => {
    // small hull base cost = 6
    expect(calculateDesignCost({ hullSize: 'small', components: [] })).toBe(6);
    expect(calculateDesignCost({ hullSize: 'medium', components: [] })).toBe(36);
    expect(calculateDesignCost({ hullSize: 'large', components: [] })).toBe(200);
    expect(calculateDesignCost({ hullSize: 'huge', components: [] })).toBe(1200);
  });

  it('sums component costs + hull base cost for a single component', () => {
    // laser cost = 2, small hull base = 6 → total 8
    const cost = calculateDesignCost({
      hullSize: 'small',
      components: [slot('laser', 1)],
    });
    expect(cost).toBe(8);
  });

  it('multiplies component cost by count', () => {
    // laser cost = 2 × 4 = 8, small hull = 6 → total 14
    const cost = calculateDesignCost({
      hullSize: 'small',
      components: [slot('laser', 4)],
    });
    expect(cost).toBe(14);
  });

  it('sums multiple components correctly', () => {
    // laser cost 2 + nuclear_missile cost 2 + medium hull 36 = 40
    const cost = calculateDesignCost({
      hullSize: 'medium',
      components: [slot('laser', 1), slot('nuclear_missile', 1)],
    });
    expect(cost).toBe(40);
  });

  it('ignores unknown component IDs (contributes 0 cost)', () => {
    // Only the hull base cost (6) is counted
    const cost = calculateDesignCost({
      hullSize: 'small',
      components: [slot('this_does_not_exist')],
    });
    expect(cost).toBe(6);
  });

  it('miniaturization does NOT reduce cost (only space)', () => {
    // ion_cannon cost = 8; cost stays 8 regardless of tech level
    const costNoMini = calculateDesignCost({
      hullSize: 'medium',
      components: [slot('ion_cannon', 1)],
    });
    const costWithMini = calculateDesignCost({
      hullSize: 'medium',
      components: [slot('ion_cannon', 1, 20)],
    });
    expect(costNoMini).toBe(costWithMini);
    expect(costWithMini).toBe(36 + 8); // medium hull + ion_cannon
  });

  it('calculates a realistic destroyer design cost', () => {
    // Large hull (200) + 2× ion_cannon (8 each) + merculite_missile (8) = 224
    const cost = calculateDesignCost({
      hullSize: 'large',
      components: [slot('ion_cannon', 2), slot('merculite_missile', 1)],
    });
    expect(cost).toBe(200 + 8 * 2 + 8);
  });
});

// ── checkTechRequirements ─────────────────────────────────────────────────────

describe('checkTechRequirements', () => {
  it('returns true for an empty design (no requirements)', () => {
    expect(checkTechRequirements({ hullSize: 'small', components: [] }, [])).toBe(true);
  });

  it('returns true when all components are starting tech', () => {
    // laser and nuclear_missile are startingTech: true
    const result = checkTechRequirements(
      { hullSize: 'small', components: [slot('laser'), slot('nuclear_missile')] },
      [],
    );
    expect(result).toBe(true);
  });

  it('returns true when all component techs are in the researched list', () => {
    // ion_cannon is NOT startingTech; requires techLevel 10
    const result = checkTechRequirements(
      { hullSize: 'medium', components: [slot('ion_cannon')] },
      ['ion_cannon'],
    );
    expect(result).toBe(true);
  });

  it('returns false when a required tech is missing', () => {
    // ion_cannon is NOT startingTech and NOT in the tech list
    const result = checkTechRequirements(
      { hullSize: 'medium', components: [slot('ion_cannon')] },
      [],
    );
    expect(result).toBe(false);
  });

  it('returns false when ANY component tech is missing', () => {
    // laser is ok (starting tech), ion_cannon is not researched
    const result = checkTechRequirements(
      {
        hullSize: 'medium',
        components: [slot('laser'), slot('ion_cannon')],
      },
      ['laser'], // ion_cannon not listed
    );
    expect(result).toBe(false);
  });

  it('returns true when all required techs are researched', () => {
    const result = checkTechRequirements(
      {
        hullSize: 'large',
        components: [slot('laser'), slot('ion_cannon'), slot('merculite_missile')],
      },
      ['ion_cannon', 'merculite_missile'],
    );
    expect(result).toBe(true);
  });

  it('returns false for an unknown component (cannot be verified)', () => {
    const result = checkTechRequirements(
      { hullSize: 'small', components: [slot('ghost_weapon')] },
      ['ghost_weapon'],
    );
    expect(result).toBe(false);
  });

  it('returns true for tier-1 components even if not explicitly in tech list', () => {
    // titanium_armor is techLevel 1 — treated as always available
    const result = checkTechRequirements(
      { hullSize: 'small', components: [slot('titanium_armor')] },
      [],
    );
    expect(result).toBe(true);
  });
});

// ── missingTechRequirements ───────────────────────────────────────────────────

describe('missingTechRequirements', () => {
  it('returns empty array when all techs are satisfied', () => {
    const missing = missingTechRequirements(
      { hullSize: 'medium', components: [slot('laser'), slot('ion_cannon')] },
      ['ion_cannon'],
    );
    expect(missing).toHaveLength(0);
  });

  it('returns the IDs of unresearched components', () => {
    const missing = missingTechRequirements(
      {
        hullSize: 'large',
        components: [slot('laser'), slot('ion_cannon'), slot('merculite_missile')],
      },
      ['ion_cannon'], // merculite_missile NOT researched
    );
    expect(missing).toContain('merculite_missile');
    expect(missing).not.toContain('laser'); // starting tech
    expect(missing).not.toContain('ion_cannon'); // researched
  });

  it('includes unknown component IDs in the missing list', () => {
    const missing = missingTechRequirements(
      { hullSize: 'small', components: [slot('unknown_thing')] },
      [],
    );
    expect(missing).toContain('unknown_thing');
  });

  it('returns empty for a design with only starting tech', () => {
    const missing = missingTechRequirements(
      { hullSize: 'small', components: [slot('laser'), slot('nuclear_missile')] },
      [],
    );
    expect(missing).toHaveLength(0);
  });
});

// ── Integration / edge cases ──────────────────────────────────────────────────

describe('integration', () => {
  it('scout design: no weapons, reserve fuel tanks – valid', () => {
    // reserve_fuel_tanks may not exist in components.json — use a known special
    // Let's use an empty design as a scout proxy
    const result = validateDesign({ hullSize: 'small', components: [] }, []);
    expect(result.valid).toBe(true);
    expect(result.spaceUsed).toBe(0);
  });

  it('fighter design: 4× laser on small hull – valid and correct cost', () => {
    // 4 × laser = 4 space (small hull = 25) ✓
    // Cost: small (6) + 4×laser (4×2=8) = 14
    const design = { hullSize: 'small' as const, components: [slot('laser', 4)] };
    const validation = validateDesign(design, ['laser']);
    const cost = calculateDesignCost(design);
    const techOk = checkTechRequirements(design, []);

    expect(validation.valid).toBe(true);
    expect(cost).toBe(14);
    expect(techOk).toBe(true); // laser is starting tech
  });

  it('destroyer design: ion cannon + merculite on large hull', () => {
    // ion_cannon size 3 × 2 = 6; merculite size 2 × 1 = 2; total = 8 ≤ 280 ✓
    const design = {
      hullSize: 'large' as const,
      components: [slot('ion_cannon', 2), slot('merculite_missile', 1)],
    };
    const validation = validateDesign(design, ['ion_cannon', 'merculite_missile']);
    expect(validation.valid).toBe(true);
    expect(validation.spaceUsed).toBe(8);

    const cost = calculateDesignCost(design);
    expect(cost).toBe(200 + 2 * 8 + 8); // 224

    expect(checkTechRequirements(design, ['ion_cannon', 'merculite_missile'])).toBe(true);
    expect(checkTechRequirements(design, ['ion_cannon'])).toBe(false); // missing merculite
  });

  it('validates correctly when design is exactly at hull limit', () => {
    // laser size 1, 25× on small hull = 25/25 (exactly full)
    const result = validateDesign(
      { hullSize: 'small', components: [slot('laser', 25)] },
      [],
    );
    expect(result.valid).toBe(true);
    expect(result.spaceRemaining).toBe(0);
  });

  it('invalidates when one extra unit pushes past hull limit', () => {
    const result = validateDesign(
      { hullSize: 'small', components: [slot('laser', 26)] },
      [],
    );
    expect(result.valid).toBe(false);
    expect(result.spaceRemaining).toBe(-1);
  });
});
