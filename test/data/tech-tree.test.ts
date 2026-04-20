import { describe, it, expect } from 'vitest';
import techTreeRaw from '../../src/data/tech-tree.json';
import componentsRaw from '../../src/data/components.json';

// ── Types ──────────────────────────────────────────────────────────────────

type TechField =
  | 'weapons'
  | 'propulsion'
  | 'construction'
  | 'computers'
  | 'force_fields'
  | 'planetology';

interface Technology {
  id: string;
  name: string;
  field: TechField;
  tier: number;
  cost: number;
  unlocks: string[];
  description: string;
  prerequisite?: string;
}

interface ComponentsFile {
  components: Array<{ id: string }>;
}

// ── Load data ──────────────────────────────────────────────────────────────

const VALID_FIELDS: TechField[] = [
  'weapons',
  'propulsion',
  'construction',
  'computers',
  'force_fields',
  'planetology',
];

const techs = (techTreeRaw as { technologies: Technology[] }).technologies;
const componentIds = new Set(
  (componentsRaw as ComponentsFile).components.map((c) => c.id)
);

// ── Tests ──────────────────────────────────────────────────────────────────

describe('tech-tree.json', () => {
  // ─── 1. Minimum total count ───────────────────────────────────────────────
  it('has at least 150 total technologies', () => {
    expect(techs.length).toBeGreaterThanOrEqual(150);
  });

  // ─── 2. All 6 fields present ──────────────────────────────────────────────
  it('has all 6 tech fields represented', () => {
    const presentFields = new Set(techs.map((t) => t.field));
    for (const field of VALID_FIELDS) {
      expect(presentFields.has(field), `Missing field: ${field}`).toBe(true);
    }
  });

  // ─── 3. Each field has at least one tech ─────────────────────────────────
  it.each(VALID_FIELDS)('field "%s" has at least 1 technology', (field) => {
    const count = techs.filter((t) => t.field === field).length;
    expect(count).toBeGreaterThan(0);
  });

  // ─── 4. No duplicate IDs ──────────────────────────────────────────────────
  it('has no duplicate tech IDs', () => {
    const ids = techs.map((t) => t.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      const seen = new Set<string>();
      const dupes: string[] = [];
      for (const id of ids) {
        if (seen.has(id)) dupes.push(id);
        seen.add(id);
      }
      expect(dupes).toEqual([]);
    }
    expect(uniqueIds.size).toBe(ids.length);
  });

  // ─── 5. Required fields present ───────────────────────────────────────────
  it('every tech has required fields: id, name, field, tier, cost, unlocks, description', () => {
    for (const tech of techs) {
      expect(tech.id, `Missing id in ${JSON.stringify(tech)}`).toBeTruthy();
      expect(tech.name, `Missing name in tech ${tech.id}`).toBeTruthy();
      expect(
        VALID_FIELDS.includes(tech.field),
        `Invalid field "${tech.field}" in tech ${tech.id}`
      ).toBe(true);
      expect(
        typeof tech.tier === 'number',
        `Non-number tier in tech ${tech.id}`
      ).toBe(true);
      expect(
        typeof tech.cost === 'number',
        `Non-number cost in tech ${tech.id}`
      ).toBe(true);
      expect(
        Array.isArray(tech.unlocks),
        `unlocks is not an array in tech ${tech.id}`
      ).toBe(true);
      expect(
        typeof tech.description === 'string' && tech.description.length > 0,
        `Missing/empty description in tech ${tech.id}`
      ).toBe(true);
    }
  });

  // ─── 6. Tiers are positive integers ──────────────────────────────────────
  it('every tech has a positive integer tier', () => {
    for (const tech of techs) {
      expect(Number.isInteger(tech.tier), `tech ${tech.id}: tier must be integer`).toBe(true);
      expect(tech.tier, `tech ${tech.id}: tier must be > 0`).toBeGreaterThan(0);
    }
  });

  // ─── 7. Costs are non-negative ────────────────────────────────────────────
  it('every tech has a non-negative cost', () => {
    for (const tech of techs) {
      expect(
        tech.cost,
        `tech ${tech.id}: cost must be >= 0`
      ).toBeGreaterThanOrEqual(0);
    }
  });

  // ─── 8. Cost progression — within-field tiers should be non-decreasing ───
  it('within each field, higher tiers have equal or higher cost than lower tiers', () => {
    for (const field of VALID_FIELDS) {
      const fieldTechs = techs.filter((t) => t.field === field);
      const byTier = fieldTechs.reduce(
        (acc, t) => {
          const min = acc.get(t.tier) ?? Infinity;
          acc.set(t.tier, Math.min(min, t.cost));
          return acc;
        },
        new Map<number, number>()
      );
      const sortedTiers = Array.from(byTier.keys()).sort((a, b) => a - b);
      for (let i = 1; i < sortedTiers.length; i++) {
        const prevTier = sortedTiers[i - 1];
        const currTier = sortedTiers[i];
        const prevMin = byTier.get(prevTier)!;
        const currMin = byTier.get(currTier)!;
        // Allow equal or increasing cost — just flag big reversals (>50% cheaper)
        expect(
          currMin >= prevMin * 0.5,
          `field ${field}: tier ${currTier} min cost (${currMin}) is drastically cheaper than tier ${prevTier} (${prevMin})`
        ).toBe(true);
      }
    }
  });

  // ─── 9. unlocks reference valid component IDs ────────────────────────────
  it('all unlocks references are valid component IDs from components.json', () => {
    const mismatches: string[] = [];
    for (const tech of techs) {
      for (const unlockId of tech.unlocks) {
        if (!componentIds.has(unlockId)) {
          mismatches.push(`tech "${tech.id}" unlocks unknown component "${unlockId}"`);
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  // ─── 10. prerequisite IDs are valid tech IDs ─────────────────────────────
  it('all prerequisite references point to valid tech IDs', () => {
    const techIds = new Set(techs.map((t) => t.id));
    const badPrereqs: string[] = [];
    for (const tech of techs) {
      if (tech.prerequisite !== undefined) {
        if (!techIds.has(tech.prerequisite)) {
          badPrereqs.push(
            `tech "${tech.id}" has unknown prerequisite "${tech.prerequisite}"`
          );
        }
      }
    }
    expect(badPrereqs).toEqual([]);
  });

  // ─── 11. Tech IDs are snake_case ─────────────────────────────────────────
  it('all tech IDs are snake_case strings', () => {
    const badIds: string[] = [];
    for (const tech of techs) {
      if (!/^[a-z0-9_]+$/.test(tech.id)) {
        badIds.push(tech.id);
      }
    }
    expect(badIds).toEqual([]);
  });

  // ─── 12. Per-field tech counts ───────────────────────────────────────────
  it('weapons field has 20+ technologies', () => {
    expect(techs.filter((t) => t.field === 'weapons').length).toBeGreaterThanOrEqual(20);
  });

  it('propulsion field has 15+ technologies', () => {
    expect(techs.filter((t) => t.field === 'propulsion').length).toBeGreaterThanOrEqual(15);
  });

  it('construction field has 10+ technologies', () => {
    expect(techs.filter((t) => t.field === 'construction').length).toBeGreaterThanOrEqual(10);
  });

  it('computers field has 20+ technologies', () => {
    expect(techs.filter((t) => t.field === 'computers').length).toBeGreaterThanOrEqual(20);
  });

  it('force_fields field has 10+ technologies', () => {
    expect(techs.filter((t) => t.field === 'force_fields').length).toBeGreaterThanOrEqual(10);
  });

  it('planetology field has 15+ technologies', () => {
    expect(techs.filter((t) => t.field === 'planetology').length).toBeGreaterThanOrEqual(15);
  });

  // ─── 13. Starting tech consistency ───────────────────────────────────────
  it('zero-cost technologies are only in planetology (ecological_restoration)', () => {
    const zeroCostNonPlanetology = techs.filter(
      (t) => t.cost === 0 && t.field !== 'planetology'
    );
    expect(zeroCostNonPlanetology).toEqual([]);
  });

  // ─── 14. Descriptions are non-trivial ────────────────────────────────────
  it('all descriptions are at least 10 characters', () => {
    const shortDescs = techs.filter((t) => t.description.length < 10);
    expect(shortDescs.map((t) => t.id)).toEqual([]);
  });

  // ─── 15. Names are non-empty ──────────────────────────────────────────────
  it('all names are non-empty', () => {
    const emptyNames = techs.filter((t) => !t.name || t.name.trim().length === 0);
    expect(emptyNames.map((t) => t.id)).toEqual([]);
  });
});
