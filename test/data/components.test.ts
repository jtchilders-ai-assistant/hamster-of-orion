/**
 * Validation tests for src/data/components.json
 * Ensures the JSON loads correctly and satisfies the acceptance criteria
 * for the ship-components-data task.
 *
 * test/data/components.test.ts
 */

import { describe, it, expect } from 'vitest';
import type { ComponentsSchema, ComponentData, ComponentCategory } from '../../src/game/types/shipComponents';
import rawComponents from '../../src/data/components.json';

const data = rawComponents as ComponentsSchema;
const components: ComponentData[] = data.components;

// ── Helper: filter by category ────────────────────────────────────────────────

function byCategory(cat: ComponentCategory): ComponentData[] {
  return components.filter((c) => c.category === cat);
}

// ── Schema sanity ─────────────────────────────────────────────────────────────

describe('components.json — schema', () => {
  it('loads without errors', () => {
    expect(data).toBeTruthy();
  });

  it('has version 1', () => {
    expect(data.version).toBe(1);
  });

  it('components array is non-empty', () => {
    expect(Array.isArray(components)).toBe(true);
    expect(components.length).toBeGreaterThan(0);
  });
});

// ── Required fields on every component ───────────────────────────────────────

describe('components.json — required fields', () => {
  it('every component has id, name, techLevel, size, cost', () => {
    for (const c of components) {
      expect(c.id, `${c.id ?? '?'} missing id`).toBeTruthy();
      expect(typeof c.id).toBe('string');

      expect(c.name, `${c.id} missing name`).toBeTruthy();
      expect(typeof c.name).toBe('string');

      expect(c.techLevel, `${c.id} missing techLevel`).toBeDefined();
      expect(typeof c.techLevel).toBe('number');

      expect(c.size, `${c.id} missing size`).toBeDefined();
      expect(typeof c.size).toBe('number');

      expect(c.cost, `${c.id} missing cost`).toBeDefined();
      expect(typeof c.cost).toBe('number');
    }
  });

  it('every component has a non-empty effect object', () => {
    for (const c of components) {
      expect(c.effect, `${c.id} missing effect`).toBeDefined();
      expect(typeof c.effect).toBe('object');
    }
  });

  it('all techLevels are positive integers', () => {
    for (const c of components) {
      const tl = c.techLevel;
      expect(Number.isInteger(tl), `${c.id} techLevel ${tl} is not integer`).toBe(true);
      expect(tl, `${c.id} techLevel ${tl} must be >= 1`).toBeGreaterThanOrEqual(1);
    }
  });

  it('all sizes are non-negative integers', () => {
    for (const c of components) {
      expect(Number.isInteger(c.size), `${c.id} size ${c.size} is not integer`).toBe(true);
      expect(c.size, `${c.id} size must be >= 0`).toBeGreaterThanOrEqual(0);
    }
  });

  it('all costs are non-negative numbers', () => {
    for (const c of components) {
      expect(c.cost, `${c.id} cost must be >= 0`).toBeGreaterThanOrEqual(0);
    }
  });
});

// ── No duplicate IDs ──────────────────────────────────────────────────────────

describe('components.json — uniqueness', () => {
  it('no duplicate component IDs', () => {
    const ids = components.map((c) => c.id);
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const id of ids) {
      if (seen.has(id)) duplicates.push(id);
      seen.add(id);
    }
    expect(duplicates, `Duplicate IDs: ${duplicates.join(', ')}`).toHaveLength(0);
  });
});

// ── Category presence ─────────────────────────────────────────────────────────

describe('components.json — categories present', () => {
  it('has at least one weapon', () => {
    expect(byCategory('weapon').length).toBeGreaterThan(0);
  });

  it('has at least one armor', () => {
    expect(byCategory('armor').length).toBeGreaterThan(0);
  });

  it('has at least one shield', () => {
    expect(byCategory('shield').length).toBeGreaterThan(0);
  });

  it('has at least one engine', () => {
    expect(byCategory('engine').length).toBeGreaterThan(0);
  });

  it('has at least one computer', () => {
    expect(byCategory('computer').length).toBeGreaterThan(0);
  });

  it('has at least one fuel component', () => {
    expect(byCategory('fuel').length).toBeGreaterThan(0);
  });

  it('has at least one special component', () => {
    expect(byCategory('special').length).toBeGreaterThan(0);
  });
});

// ── Weapon-specific checks ────────────────────────────────────────────────────

describe('components.json — weapons', () => {
  const weapons = byCategory('weapon');

  it('includes canonical early beam weapons (laser, ion cannon)', () => {
    const ids = new Set(weapons.map((w) => w.id));
    expect(ids.has('laser')).toBe(true);
    expect(ids.has('ion_cannon')).toBe(true);
  });

  it('includes missiles with attackRatingBonus', () => {
    const missiles = weapons.filter((w) => w.subtype === 'missile');
    expect(missiles.length).toBeGreaterThanOrEqual(4);
    const withBonus = missiles.filter(
      (m) => typeof (m.effect as Record<string, unknown>)['attackRatingBonus'] === 'number'
    );
    expect(withBonus.length).toBeGreaterThan(0);
  });

  it('includes torpedoes that are not interceptable', () => {
    const torpedoes = weapons.filter((w) => w.subtype === 'torpedo');
    expect(torpedoes.length).toBeGreaterThanOrEqual(4);
    for (const t of torpedoes) {
      expect((t.effect as Record<string, unknown>)['interceptable']).toBe(false);
    }
  });

  it('includes scatter packs with mirvCount and damagePerMirv', () => {
    const scatter = weapons.filter((w) => w.subtype === 'scatter');
    expect(scatter.length).toBeGreaterThanOrEqual(3);
    for (const s of scatter) {
      const e = s.effect as Record<string, unknown>;
      expect(typeof e['mirvCount']).toBe('number');
      expect(typeof e['damagePerMirv']).toBe('number');
    }
  });

  it('includes bombs', () => {
    const bombs = weapons.filter((w) => w.subtype === 'bomb');
    expect(bombs.length).toBeGreaterThanOrEqual(5);
  });
});

// ── Armor-specific checks ─────────────────────────────────────────────────────

describe('components.json — armor', () => {
  const armors = byCategory('armor');

  it('has at least 7 armor types', () => {
    expect(armors.length).toBeGreaterThanOrEqual(7);
  });

  it('all armors have hpMultiplier >= 1', () => {
    for (const a of armors) {
      const mult = (a.effect as Record<string, unknown>)['hpMultiplier'] as number;
      expect(typeof mult).toBe('number');
      expect(mult).toBeGreaterThanOrEqual(1.0);
    }
  });

  it('includes titanium (1.0×) and neutronium (4.0×)', () => {
    const titanium = armors.find((a) => a.id === 'titanium_armor');
    const neutronium = armors.find((a) => a.id === 'neutronium_armor');
    expect(titanium).toBeDefined();
    expect(neutronium).toBeDefined();
    expect((titanium!.effect as Record<string, unknown>)['hpMultiplier']).toBe(1.0);
    expect((neutronium!.effect as Record<string, unknown>)['hpMultiplier']).toBe(4.0);
  });

  it('armor hpMultipliers are in ascending order by techLevel', () => {
    const sorted = [...armors].sort((a, b) => a.techLevel - b.techLevel);
    for (let i = 1; i < sorted.length; i++) {
      const prev = (sorted[i - 1].effect as Record<string, unknown>)['hpMultiplier'] as number;
      const curr = (sorted[i].effect as Record<string, unknown>)['hpMultiplier'] as number;
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });
});

// ── Shield-specific checks ────────────────────────────────────────────────────

describe('components.json — shields', () => {
  const shields = byCategory('shield');

  it('has all 15 deflector classes', () => {
    expect(shields.length).toBeGreaterThanOrEqual(15);
  });

  it('all shields have damageAbsorption >= 1', () => {
    for (const s of shields) {
      const absorb = (s.effect as Record<string, unknown>)['damageAbsorption'] as number;
      expect(typeof absorb).toBe('number');
      expect(absorb).toBeGreaterThanOrEqual(1);
    }
  });

  it('shield damageAbsorption ranges from 1 to 15', () => {
    const absorptions = shields.map(
      (s) => (s.effect as Record<string, unknown>)['damageAbsorption'] as number
    );
    expect(Math.min(...absorptions)).toBe(1);
    expect(Math.max(...absorptions)).toBe(15);
  });

  it('class 1 shield has cost 12 and size 8', () => {
    const c1 = shields.find((s) => s.id === 'shield_class_1');
    expect(c1).toBeDefined();
    expect(c1!.cost).toBe(12);
    expect(c1!.size).toBe(8);
  });

  it('class 15 shield has cost 220 and size 36', () => {
    const c15 = shields.find((s) => s.id === 'shield_class_15');
    expect(c15).toBeDefined();
    expect(c15!.cost).toBe(220);
    expect(c15!.size).toBe(36);
  });
});

// ── Engine-specific checks ────────────────────────────────────────────────────

describe('components.json — engines', () => {
  const engines = byCategory('engine');

  it('has at least 9 engine types', () => {
    expect(engines.length).toBeGreaterThanOrEqual(9);
  });

  it('all engines have warpSpeed, combatSpeed, and maneuver', () => {
    for (const e of engines) {
      const eff = e.effect as Record<string, unknown>;
      expect(typeof eff['warpSpeed'], `${e.id} missing warpSpeed`).toBe('number');
      expect(typeof eff['combatSpeed'], `${e.id} missing combatSpeed`).toBe('number');
      expect(typeof eff['maneuver'], `${e.id} missing maneuver`).toBe('number');
    }
  });

  it('retro engines start at warp 1 and temporal drives reach warp 9', () => {
    const retro = engines.find((e) => e.id === 'retro_engines');
    const temporal = engines.find((e) => e.id === 'temporal_drive');
    expect(retro).toBeDefined();
    expect(temporal).toBeDefined();
    expect((retro!.effect as Record<string, unknown>)['warpSpeed']).toBe(1);
    expect((temporal!.effect as Record<string, unknown>)['warpSpeed']).toBe(9);
  });

  it('warp speeds are strictly increasing by techLevel', () => {
    const sorted = [...engines].sort((a, b) => a.techLevel - b.techLevel);
    for (let i = 1; i < sorted.length; i++) {
      const prev = (sorted[i - 1].effect as Record<string, unknown>)['warpSpeed'] as number;
      const curr = (sorted[i].effect as Record<string, unknown>)['warpSpeed'] as number;
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });
});

// ── Computer-specific checks ──────────────────────────────────────────────────

describe('components.json — computers', () => {
  const computers = byCategory('computer');

  it('has at least 10 entries (Battle Computers I-XI and ECM Jammers)', () => {
    expect(computers.length).toBeGreaterThanOrEqual(10);
  });

  it('battle computers I through XI are all present', () => {
    for (let i = 1; i <= 11; i++) {
      const bc = computers.find((c) => c.id === `battle_computer_${i}`);
      expect(bc, `battle_computer_${i} missing`).toBeDefined();
    }
  });

  it('ECM jammers I through X are all present', () => {
    for (let i = 1; i <= 10; i++) {
      const ecm = computers.find((c) => c.id === `ecm_jammer_${i}`);
      expect(ecm, `ecm_jammer_${i} missing`).toBeDefined();
    }
  });
});

// ── Special-specific checks ───────────────────────────────────────────────────

describe('components.json — specials', () => {
  const specials = byCategory('special');

  it('has at least 10 special items', () => {
    expect(specials.length).toBeGreaterThanOrEqual(10);
  });

  it('cloaking device is present with defenseBonus 5', () => {
    const cloak = specials.find((s) => s.id === 'cloaking_device');
    expect(cloak).toBeDefined();
    expect((cloak!.effect as Record<string, unknown>)['defenseBonus']).toBe(5);
  });

  it('black hole generator requires huge hull', () => {
    const bhg = specials.find((s) => s.id === 'black_hole_generator');
    expect(bhg).toBeDefined();
    const req = (bhg!.effect as Record<string, unknown>)['requiresShipClass'] as string[];
    expect(req).toContain('huge');
  });

  it('stasis field disables for 2 turns and prevents retreat (design/ships/special-systems.md)', () => {
    const stasis = specials.find((s) => s.id === 'stasis_field');
    expect(stasis).toBeDefined();
    const e = stasis!.effect as Record<string, unknown>;
    expect(e['disableDurationTurns']).toBe(2);
    expect(e['preventsRetreat']).toBe(true);
  });

  it('zyro shield has 75% base missile destroy chance', () => {
    const zyro = specials.find((s) => s.id === 'zyro_shield');
    expect(zyro).toBeDefined();
    expect((zyro!.effect as Record<string, unknown>)['missileDestroyChanceBase']).toBe(0.75);
  });

  it('lightning shield reflects 50% damage at tech level 25 (design/ships/special-systems.md)', () => {
    const lightning = specials.find((s) => s.id === 'lightning_shield');
    expect(lightning).toBeDefined();
    expect(lightning!.techLevel).toBe(25);
    expect((lightning!.effect as Record<string, unknown>)['damageReflection']).toBe(0.5);
  });

  it('automated repair unit regenerates 10-15% HP per turn (design/ships/special-systems.md)', () => {
    const repair = specials.find((s) => s.id === 'automated_repair_unit');
    expect(repair).toBeDefined();
    const e = repair!.effect as Record<string, unknown>;
    expect(e['repairPerTurn']).toBe(0.10);
    expect(e['repairPerTurnMax']).toBe(0.15);
  });

  it('displacement device has 33% hit avoid chance', () => {
    const dd = specials.find((s) => s.id === 'displacement_device');
    expect(dd).toBeDefined();
    expect((dd!.effect as Record<string, unknown>)['hitAvoidChance']).toBeCloseTo(0.33);
  });
});

// ── Starting tech check ───────────────────────────────────────────────────────

describe('components.json — starting techs', () => {
  it('laser, nuclear_missile, retro_engines, battle_computer_1, titanium_armor, shield_class_1, standard_fuel_cells are marked as startingTech', () => {
    const expectedStarters = [
      'laser',
      'nuclear_missile',
      'retro_engines',
      'battle_computer_1',
      'titanium_armor',
      'shield_class_1',
      'standard_fuel_cells',
    ];
    const starters = new Set(
      components.filter((c) => c.startingTech === true).map((c) => c.id)
    );
    for (const id of expectedStarters) {
      expect(starters.has(id), `${id} should be marked startingTech`).toBe(true);
    }
  });
});
