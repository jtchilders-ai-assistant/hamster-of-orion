/**
 * Ship Design game logic — pure TypeScript, NO DOM.
 *
 * Implements:
 * - validateDesign()        — checks hull space limits
 * - calculateDesignCost()   — returns total BC cost
 * - checkTechRequirements() — validates all components are unlocked
 *
 * References:
 *   design/ships/ship-design.md
 *   src/data/components.json
 *   src/game/types/shipComponents.ts
 *   src/game/state.ts
 */

import componentsData from '../../data/components.json';
import type { ComponentsSchema, ComponentData } from '../types/shipComponents';
import type { ShipClass, TechId } from '../state';

// ── Hull definitions (from design/ships/ship-design.md) ───────────────────────

/**
 * Hull space, base cost, HP, and crew for each ship class.
 * 
 * Design doc source:
 *   - space/baseCost: design/ships/ship-classes.md
 *   - baseHp: design/ships/combat-algorithm.md §13 Base_HP by Hull Size (MOO1)
 *   - baseCrew: design/ships/combat-algorithm.md §11c Crew scaling by hull size
 */
export interface HullSpec {
  space: number;
  baseCost: number;
  /** Base hit points before armor multiplier (MOO1 canonical) */
  baseHp: number;
  /** Base crew complement for combat crew tracking */
  baseCrew: number;
}

export const HULL_SPECS: Record<ShipClass, HullSpec> = {
  small:  { space:   25, baseCost:    6, baseHp:   3, baseCrew:  20 },
  medium: { space:   70, baseCost:   36, baseHp:  18, baseCrew:  60 },
  large:  { space:  280, baseCost:  200, baseHp: 100, baseCrew: 200 },
  huge:   { space: 1400, baseCost: 1200, baseHp: 600, baseCrew: 500 },
};

// ── Ship design type used by this system ─────────────────────────────────────

/**
 * A ship design as understood by the validation / cost-calculation system.
 * Component IDs reference entries in src/data/components.json.
 *
 * `count` is how many of that component are fitted (defaults to 1 when omitted).
 * `techLevelOverride` supports miniaturization: the current tech level for
 * this component category, used to reduce its space requirement.
 */
export interface DesignComponent {
  componentId: string;
  count?: number;
  /** Caller's current research level for this component (enables miniaturization). */
  techLevelOverride?: number;
}

export interface ShipDesignInput {
  hullSize: ShipClass;
  components: DesignComponent[];
}

// ── Validation result ─────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  /** Total hull space available for this design. */
  totalSpace: number;
  /** Space actually consumed by all components (after miniaturization). */
  spaceUsed: number;
  /** Space remaining. Negative means over-budget. */
  spaceRemaining: number;
  errors: string[];
  warnings: string[];
}

// ── Component lookup helpers ──────────────────────────────────────────────────

const _schema = componentsData as ComponentsSchema;

/**
 * Build an index from component ID → ComponentData for O(1) lookups.
 * Computed once at module load time.
 */
const COMPONENT_INDEX: ReadonlyMap<string, ComponentData> = new Map(
  _schema.components.map((c) => [c.id, c]),
);

/** Look up a component by ID; returns undefined for unknown IDs. */
export function getComponent(id: string): ComponentData | undefined {
  return COMPONENT_INDEX.get(id);
}

// ── Miniaturization ───────────────────────────────────────────────────────────

/**
 * Calculate the effective space cost of a component, accounting for
 * miniaturization.
 *
 * Rule (from design/ships/ship-design.md):
 *   Each tech tier above the component's required tech level → −50% space cost.
 *   Space is floored at 1 (never 0) for components that normally cost space.
 *   Components with base size 0 stay at 0.
 *
 * @param component  The component definition from components.json.
 * @param currentTechLevel  The empire's current research level for this component's category.
 */
export function miniaturizedSize(
  component: ComponentData,
  currentTechLevel?: number,
): number {
  if (component.size === 0) return 0;
  if (currentTechLevel === undefined || currentTechLevel <= component.techLevel) {
    return component.size;
  }
  const tiersAhead = currentTechLevel - component.techLevel;
  // Each tier halves the space; cap reduction so cost never goes below 1.
  const reduced = component.size * Math.pow(0.5, tiersAhead);
  return Math.max(1, Math.round(reduced));
}

// ── Core functions ────────────────────────────────────────────────────────────

/**
 * Validate a ship design against hull space limits.
 *
 * Only weapons and specials consume space (per design doc). However, since
 * this system works with raw component IDs and counts, it sums the space of
 * every component supplied — callers are responsible for passing only the
 * space-consuming slots. Automatic systems (engine, shield, armor, computer,
 * ECM, maneuver) should NOT be passed in unless a custom override is intended.
 *
 * @param design  The ship design to validate.
 * @param techs   Array of tech IDs the empire has researched (used for tech
 *                requirement checks but NOT for miniaturization here — pass
 *                `techLevelOverride` per component for miniaturization).
 */
export function validateDesign(
  design: ShipDesignInput,
  techs: TechId[],
): ValidationResult {
  const hull = HULL_SPECS[design.hullSize];
  const errors: string[] = [];
  const warnings: string[] = [];

  let spaceUsed = 0;

  for (const slot of design.components) {
    const component = getComponent(slot.componentId);
    if (!component) {
      errors.push(`Unknown component: "${slot.componentId}"`);
      continue;
    }

    const count = slot.count ?? 1;
    if (count < 1) {
      errors.push(`Component "${slot.componentId}" has invalid count: ${count}`);
      continue;
    }

    const effectiveSize = miniaturizedSize(component, slot.techLevelOverride);
    spaceUsed += effectiveSize * count;
  }

  const spaceRemaining = hull.space - spaceUsed;

  if (spaceRemaining < 0) {
    errors.push(
      `Design exceeds hull space: ${spaceUsed} used / ${hull.space} available ` +
      `(${Math.abs(spaceRemaining)} over limit)`,
    );
  }

  if (design.components.length === 0) {
    warnings.push('Design has no components — ship will be unarmed and unequipped.');
  }

  const techSet = new Set(techs);
  for (const slot of design.components) {
    const component = getComponent(slot.componentId);
    if (!component) continue; // already reported above
    if (component.techLevel > 1 && !techSet.has(slot.componentId) && !component.startingTech) {
      // Warn if the component's tech level is high enough that it's unlikely
      // to be available without explicit research; checkTechRequirements() does
      // the definitive check.
      // (We keep this as a warning; errors come from checkTechRequirements.)
    }
  }

  return {
    valid: errors.length === 0,
    totalSpace: hull.space,
    spaceUsed,
    spaceRemaining,
    errors,
    warnings,
  };
}

/**
 * Calculate the total BC cost of a ship design.
 *
 * Cost = hull base cost + sum(component.cost × count)
 * Miniaturization does NOT reduce cost in MOO1 (only space is reduced).
 *
 * @param design  The ship design to cost.
 */
export function calculateDesignCost(design: ShipDesignInput): number {
  const hull = HULL_SPECS[design.hullSize];
  let total = hull.baseCost;

  for (const slot of design.components) {
    const component = getComponent(slot.componentId);
    if (!component) continue; // unknown components contribute 0 cost
    const count = slot.count ?? 1;
    total += component.cost * count;
  }

  return total;
}

/**
 * Check whether an empire has researched all tech required by a design.
 *
 * Each component in components.json has a `techLevel` (numeric tier) and an
 * `id`.  The tech requirements system stores researched technologies as an
 * array of TechId strings.
 *
 * A component is considered unlocked if ANY of the following are true:
 *   1. `component.startingTech === true`  (always available from game start)
 *   2. The component's `id` appears in the `techs` array
 *   3. The component's `techLevel === 1` (tier-1 items are assumed unlocked)
 *
 * Returns `true` if every component in the design is unlocked.
 *
 * @param design  The ship design to check.
 * @param techs   Array of tech IDs the empire has researched.
 */
export function checkTechRequirements(
  design: ShipDesignInput,
  techs: TechId[],
): boolean {
  const techSet = new Set(techs);

  for (const slot of design.components) {
    const component = getComponent(slot.componentId);
    if (!component) {
      // Unknown component — treat as blocked.
      return false;
    }

    const isStartingTech = component.startingTech === true;
    const isTier1 = component.techLevel === 1;
    const isResearched = techSet.has(component.id);

    if (!isStartingTech && !isTier1 && !isResearched) {
      return false;
    }
  }

  return true;
}

/**
 * Return a list of component IDs in a design that are NOT yet researched.
 * Useful for surfacing specific missing techs in the UI.
 *
 * @param design  The ship design to check.
 * @param techs   Array of tech IDs the empire has researched.
 */
export function missingTechRequirements(
  design: ShipDesignInput,
  techs: TechId[],
): string[] {
  const techSet = new Set(techs);
  const missing: string[] = [];

  for (const slot of design.components) {
    const component = getComponent(slot.componentId);
    if (!component) {
      missing.push(slot.componentId);
      continue;
    }

    const isStartingTech = component.startingTech === true;
    const isTier1 = component.techLevel === 1;
    const isResearched = techSet.has(component.id);

    if (!isStartingTech && !isTier1 && !isResearched) {
      missing.push(component.id);
    }
  }

  return missing;
}
