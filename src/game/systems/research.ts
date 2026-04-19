/**
 * Research system — pure TypeScript, NO DOM.
 * src/game/systems/research.ts
 *
 * Implements the research point (RP) calculation, tech cost, field allocation,
 * miniaturization, and research progress tracking.
 *
 * All formulas follow design/technology/research-formulas.md.
 * No DOM, no side effects, no `any` types.
 */

import technologiesData from '../../data/technologies.json';
import { GalaxySize, RaceId } from '../state';

// ─────────────────────────────────────────────────────────────────────────────
// Static data types (mirrors technologies.json schema)
// ─────────────────────────────────────────────────────────────────────────────

export interface ResearchBuildingConfig {
  id: string;
  name: string;
  tech_level: number;
  construction_cost: number;
  maintenance: number;
  rp_multiplier_bonus: number;
}

interface TierCostEntry {
  tier: number;
  cost: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Research field type
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The 6 research fields used by the allocation and progress tracking systems.
 * Note: The global TechField in state.ts uses 'biotechnology'; the research
 * design doc uses 'planetology'. This local type reflects the design doc.
 */
export type ResearchField =
  | 'weapons'
  | 'propulsion'
  | 'construction'
  | 'computers'
  | 'force_fields'
  | 'planetology';

export const ALL_RESEARCH_FIELDS: readonly ResearchField[] = [
  'weapons',
  'propulsion',
  'construction',
  'computers',
  'force_fields',
  'planetology',
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Research difficulty type (broader than DifficultyLevel in state.ts)
// ─────────────────────────────────────────────────────────────────────────────

export type ResearchDifficulty = 'simple' | 'easy' | 'average' | 'hard' | 'impossible';

// ─────────────────────────────────────────────────────────────────────────────
// Field allocation type
// ─────────────────────────────────────────────────────────────────────────────

/** Per-field allocation percentages. All values must sum to 100. */
export type ResearchAllocation = Record<ResearchField, number>;

// ─────────────────────────────────────────────────────────────────────────────
// Per-field empire research state
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldResearchState {
  /** The tech ID currently being researched in this field, or null. */
  currentTechId: string | null;
  /** Tier of the currently targeted tech, or null. */
  currentTechTier: number | null;
  /** Accumulated RP toward the current tech (includes overflow from last completion). */
  progressRP: number;
  /** Highest tier completed in this field (0 = none). */
  currentTier: number;
  /** IDs of all completed techs in this field. */
  completedTechs: string[];
  /** Tech choices offered for the next tier (populated after a tech completes). */
  pendingChoices: string[];
}

/** Full per-field research state for one empire. */
export type EmpireFieldResearch = Record<ResearchField, FieldResearchState>;

// ─────────────────────────────────────────────────────────────────────────────
// Miniaturization input/output
// ─────────────────────────────────────────────────────────────────────────────

export interface ComponentStats {
  /** Tech tier at which this component was introduced. */
  techTier: number;
  /** Base space consumed by the component. */
  baseSize: number;
  /** Base production cost of the component (BC). */
  baseCost: number;
}

export interface MiniaturizedStats {
  /** Miniaturized space (>= 50% of baseSize). */
  size: number;
  /** Miniaturized cost (>= 50% of baseCost). */
  cost: number;
  /** The actual size reduction fraction applied (0.0–0.50). */
  reductionApplied: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Planet RP input
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Data needed to compute RP for one planet.
 * Callers pass this; no GameState dependency required (keeps fn pure & easy to
 * test in isolation).
 */
export interface PlanetRPInput {
  /** Current total population on the planet (in Mu, same units as production). */
  population: number;
  /**
   * Research slider value (0–100). The fraction of population assigned to
   * science: scientists = population × (research_slider / 100).
   */
  researchSlider: number;
  /**
   * IDs of research buildings present on the planet.
   * Valid values: 'research_lab', 'supercomputer', 'autolab', 'galactic_cybernet'.
   */
  buildingIds: string[];
  /** True if this planet is an Artifacts World (+25% RP). */
  hasArtifacts: boolean;
  /** True if this planet is Orion (+400% RP, i.e. ×4). */
  isOrion: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tech completion result
// ─────────────────────────────────────────────────────────────────────────────

export interface TechCompletionResult {
  /** The field where a tech completed. */
  field: ResearchField;
  /** The completed tech ID. */
  completedTechId: string;
  /** Overflow RP carried into the next tech's progress. */
  overflowRP: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Process research turn result
// ─────────────────────────────────────────────────────────────────────────────

export interface ResearchTurnResult {
  /** Total empire RP generated this turn. */
  totalRP: number;
  /** RP allocated to each field this turn. */
  fieldRP: ResearchAllocation;
  /** Updated per-field state after this turn's RP is applied. */
  updatedFields: EmpireFieldResearch;
  /** List of techs that completed this turn (may be empty). */
  completions: TechCompletionResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Static data accessors
// ─────────────────────────────────────────────────────────────────────────────

/** Indexed tier→cost lookup built once at module load. */
const TIER_COST_MAP: ReadonlyMap<number, number> = new Map(
  (technologiesData.tech_tier_costs as TierCostEntry[]).map(
    (entry) => [entry.tier, entry.cost] as [number, number],
  ),
);

/** Research building configs indexed by building ID. */
const BUILDING_CONFIGS: ReadonlyMap<string, ResearchBuildingConfig> = new Map(
  (technologiesData.research_buildings as ResearchBuildingConfig[]).map(
    (b) => [b.id, b] as [string, ResearchBuildingConfig],
  ),
);

/** Galaxy size modifier lookup. */
const GALAXY_SIZE_MODS: Readonly<Record<string, number>> =
  technologiesData.galaxy_size_modifiers as Record<string, number>;

/** Difficulty AI cost modifier lookup. */
const DIFFICULTY_AI_MODS: Readonly<Record<string, number>> =
  technologiesData.difficulty_ai_cost_modifiers as Record<string, number>;

/** Racial research modifier lookup (1.0 = baseline). */
const RACIAL_RESEARCH_MODS: Readonly<Record<string, number>> =
  technologiesData.racial_research_modifiers as Record<string, number>;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Base RP generated per scientist per turn. */
export const BASE_RP_PER_SCIENTIST = technologiesData.research_system.base_rp_per_scientist;

/** Reduction per tier of difference (5%). */
export const MINIATURIZATION_RATE = technologiesData.research_system.miniaturization_rate;

/** Maximum reduction fraction (50%). */
export const MINIATURIZATION_MAX = technologiesData.research_system.miniaturization_maximum;

/** Minimum scale factor; component never shrinks below 50% of base. */
export const MINIATURIZATION_MIN_SCALE =
  technologiesData.research_system.miniaturization_minimum_scale;

// ─────────────────────────────────────────────────────────────────────────────
// Core functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the racial research modifier for a given race.
 *
 * These are the research-specific multipliers from research-formulas.md §3.
 * They differ from the general race.bonuses.research percentage in races.json.
 *
 * @throws {Error} if the raceId is not recognized.
 */
export function getRacialResearchModifier(raceId: RaceId): number {
  const modifier = RACIAL_RESEARCH_MODS[raceId];
  if (modifier === undefined) {
    throw new Error(`Unknown raceId for research modifier: "${raceId}"`);
  }
  return modifier;
}

/**
 * Calculates the lab multiplier for a planet based on which research
 * buildings are present.
 *
 * Formula (cumulative):
 *   base: 1.0
 *   + Research Lab:       +0.5  (cumulative: 1.5)
 *   + Supercomputer:      +1.0  (cumulative: 2.5)
 *   + Autolab:            +1.5  (cumulative: 4.0)
 *   + Galactic Cybernet:  +2.0  (cumulative: 6.0)
 *
 * Unknown building IDs are silently ignored (not research buildings).
 */
export function getLabMultiplier(buildingIds: readonly string[]): number {
  let multiplier = 1.0;
  for (const id of buildingIds) {
    const config = BUILDING_CONFIGS.get(id);
    if (config !== undefined) {
      multiplier += config.rp_multiplier_bonus;
    }
  }
  return multiplier;
}

/**
 * Calculates RP generated by one planet per turn.
 *
 * Formula:
 *   Scientists = population × (researchSlider / 100)
 *   Planet_RP  = Scientists × BASE_RP_PER_SCIENTIST × Lab_Multiplier × Racial_Modifier
 *
 * Special bonuses applied after the base formula:
 *   - Artifacts World: × 1.25
 *   - Orion Planet:    × 4.0
 *
 * Difficulty modifier does NOT appear here (it affects AI tech cost only).
 *
 * @param planet  Planet RP inputs.
 * @param raceId  The race that owns this planet.
 * @returns RP generated by this planet this turn (may be fractional).
 */
export function calculatePlanetRP(planet: PlanetRPInput, raceId: RaceId): number {
  const scientists = planet.population * (planet.researchSlider / 100);
  const labMultiplier = getLabMultiplier(planet.buildingIds);
  const racialModifier = getRacialResearchModifier(raceId);

  let planetRP = scientists * BASE_RP_PER_SCIENTIST * labMultiplier * racialModifier;

  if (planet.hasArtifacts) {
    planetRP *= technologiesData.special_rp_bonuses.artifacts_world_multiplier;
  }
  if (planet.isOrion) {
    planetRP *= technologiesData.special_rp_bonuses.orion_planet_multiplier;
  }

  return planetRP;
}

/**
 * Returns the base tech cost for a given tier from the tier cost table.
 *
 * @throws {Error} if the tier is not in the table.
 */
export function getBaseTierCost(tier: number): number {
  const cost = TIER_COST_MAP.get(tier);
  if (cost === undefined) {
    throw new Error(`No tech cost defined for tier ${tier}`);
  }
  return cost;
}

/**
 * Returns the galaxy size modifier for tech cost calculations.
 *
 * @throws {Error} if the galaxy size is not recognized.
 */
export function getGalaxySizeModifier(galaxySize: GalaxySize): number {
  const modifier = GALAXY_SIZE_MODS[galaxySize];
  if (modifier === undefined) {
    throw new Error(`Unknown galaxy size: "${galaxySize}"`);
  }
  return modifier;
}

/**
 * Returns the AI difficulty cost modifier.
 *
 * @throws {Error} if the difficulty level is not recognized.
 */
export function getDifficultyAICostModifier(difficulty: ResearchDifficulty): number {
  const modifier = DIFFICULTY_AI_MODS[difficulty];
  if (modifier === undefined) {
    throw new Error(`Unknown difficulty for AI cost modifier: "${difficulty}"`);
  }
  return modifier;
}

/**
 * Calculates the actual tech cost for the player empire.
 *
 * Formula:
 *   Player_Cost = Base_Tier_Cost × Galaxy_Size_Modifier
 *
 * Difficulty does NOT affect player tech cost (see design doc §7).
 *
 * @param tier        The tech tier being researched.
 * @param galaxySize  Current galaxy size.
 * @returns Actual RP cost for the player to research this tier.
 */
export function getTechCost(tier: number, galaxySize: GalaxySize): number {
  return getBaseTierCost(tier) * getGalaxySizeModifier(galaxySize);
}

/**
 * Calculates the actual tech cost for an AI empire.
 *
 * Formula:
 *   AI_Cost = Base_Tier_Cost × Galaxy_Size_Modifier × Difficulty_AI_Modifier
 *
 * @param tier        The tech tier being researched.
 * @param galaxySize  Current galaxy size.
 * @param difficulty  Game difficulty level.
 * @returns Actual RP cost for an AI empire to research this tier.
 */
export function getTechCostAI(
  tier: number,
  galaxySize: GalaxySize,
  difficulty: ResearchDifficulty,
): number {
  return (
    getBaseTierCost(tier) *
    getGalaxySizeModifier(galaxySize) *
    getDifficultyAICostModifier(difficulty)
  );
}

/**
 * Validates that a research allocation is valid (all values ≥ 0, sums to 100).
 *
 * @returns true if valid; false otherwise.
 */
export function isValidAllocation(allocation: ResearchAllocation): boolean {
  for (const field of ALL_RESEARCH_FIELDS) {
    if (allocation[field] < 0) return false;
  }
  const total = ALL_RESEARCH_FIELDS.reduce((sum, field) => sum + allocation[field], 0);
  // Allow small floating-point tolerance
  return Math.abs(total - 100) < 0.001;
}

/**
 * Splits total empire RP across the 6 research fields per the allocation.
 *
 * Formula per field:
 *   Field_RP = Empire_Total_RP × (field_allocation_percent / 100)
 *
 * @param totalRP    Total empire RP pool this turn.
 * @param allocation Per-field percentages (must sum to 100).
 * @returns Per-field RP distribution (same record shape as allocation).
 * @throws {Error} if allocation does not sum to 100 (within floating-point tolerance).
 */
export function allocateResearch(
  totalRP: number,
  allocation: ResearchAllocation,
): ResearchAllocation {
  if (!isValidAllocation(allocation)) {
    const total = ALL_RESEARCH_FIELDS.reduce((s, f) => s + allocation[f], 0);
    throw new Error(
      `Research allocation must sum to 100% (got ${total.toFixed(3)}%)`,
    );
  }

  const result = {} as ResearchAllocation;
  for (const field of ALL_RESEARCH_FIELDS) {
    result[field] = totalRP * (allocation[field] / 100);
  }
  return result;
}

/**
 * Calculates miniaturized size and cost for a ship component given the
 * empire's current research tier in the relevant field.
 *
 * Formula:
 *   Size_Reduction = min((currentTier - techTier) × 0.05, 0.50)
 *   Miniaturized_Size = Base_Size × (1 − Size_Reduction)
 *   Miniaturized_Cost = Base_Cost × (1 − Size_Reduction)
 *
 * Minimum 50% of base (never below 0.5× original).
 *
 * If currentTier ≤ techTier, no reduction applies (reduction = 0).
 *
 * @param component   The component's base stats and tech tier.
 * @param currentTier The empire's current highest researched tier in the field.
 * @returns Miniaturized size, cost, and the actual reduction fraction.
 */
export function getMiniaturizedStats(
  component: ComponentStats,
  currentTier: number,
): MiniaturizedStats {
  const tierDiff = Math.max(0, currentTier - component.techTier);
  const rawReduction = tierDiff * MINIATURIZATION_RATE;
  const reductionApplied = Math.min(rawReduction, MINIATURIZATION_MAX);
  const scaleFactor = 1 - reductionApplied;

  const minScale = MINIATURIZATION_MIN_SCALE;
  const size = Math.max(component.baseSize * scaleFactor, component.baseSize * minScale);
  const cost = Math.max(component.baseCost * scaleFactor, component.baseCost * minScale);

  return { size, cost, reductionApplied };
}

// ─────────────────────────────────────────────────────────────────────────────
// Research turn processing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Applies one turn of research to an empire's field research state.
 *
 * For each field:
 *   1. Add field_rp to progressRP
 *   2. If progressRP >= tech cost → tech completes, overflow carries over
 *   3. Completes at most one tech per field per turn
 *      (overflow is stored; a second completion would need another call)
 *
 * Returns a new EmpireFieldResearch object (does not mutate the input).
 *
 * @param fields      Current per-field research state.
 * @param fieldRP     RP allocated to each field this turn (from allocateResearch).
 * @param galaxySize  Used to calculate actual tech costs.
 * @param isAI        If true, uses AI tech cost (with difficulty modifier).
 * @param difficulty  Required when isAI=true.
 * @returns Updated field states and any completions.
 */
export function applyResearchRP(
  fields: EmpireFieldResearch,
  fieldRP: ResearchAllocation,
  galaxySize: GalaxySize,
  isAI: boolean,
  difficulty: ResearchDifficulty = 'average',
): { updatedFields: EmpireFieldResearch; completions: TechCompletionResult[] } {
  const updatedFields = { ...fields } as EmpireFieldResearch;
  const completions: TechCompletionResult[] = [];

  for (const field of ALL_RESEARCH_FIELDS) {
    const fieldState = { ...fields[field] };
    const addedRP = fieldRP[field];

    // If no tech is targeted in this field, accumulate in a pending pool
    // (the progressRP acts as pending RP until a tech is selected)
    fieldState.progressRP += addedRP;

    // Check for completion if we have a targeted tech
    if (fieldState.currentTechId !== null && fieldState.currentTechTier !== null) {
      const tier = fieldState.currentTechTier;
      const actualCost = isAI
        ? getTechCostAI(tier, galaxySize, difficulty)
        : getTechCost(tier, galaxySize);

      if (fieldState.progressRP >= actualCost) {
        const overflowRP = fieldState.progressRP - actualCost;
        completions.push({
          field,
          completedTechId: fieldState.currentTechId,
          overflowRP,
        });

        // Update state: record completion, reset progress with overflow
        fieldState.completedTechs = [...fieldState.completedTechs, fieldState.currentTechId];
        fieldState.currentTier = Math.max(fieldState.currentTier, tier);
        fieldState.progressRP = overflowRP;
        fieldState.currentTechId = null;
        fieldState.currentTechTier = null;
      }
    }

    updatedFields[field] = fieldState;
  }

  return { updatedFields, completions };
}

/**
 * Processes a full research turn for an empire.
 *
 * Steps:
 *   1. Sum RP from all planets
 *   2. Allocate RP to fields per allocation percentages
 *   3. Apply RP to each field's current research target
 *   4. Detect completions with overflow carry-over
 *
 * @param planets       All planets owned by this empire (with RP inputs).
 * @param raceId        The empire's race.
 * @param allocation    Research field allocation (must sum to 100%).
 * @param fields        Current per-field research state.
 * @param galaxySize    Current galaxy size.
 * @param isAI          Whether this is an AI empire (affects tech cost).
 * @param difficulty    Difficulty level (used for AI cost modifier).
 * @returns Turn results including updated field states and any completions.
 */
export function processResearchTurn(
  planets: readonly PlanetRPInput[],
  raceId: RaceId,
  allocation: ResearchAllocation,
  fields: EmpireFieldResearch,
  galaxySize: GalaxySize,
  isAI: boolean = false,
  difficulty: ResearchDifficulty = 'average',
): ResearchTurnResult {
  // Step 1: Calculate total empire RP
  let totalRP = 0;
  for (const planet of planets) {
    totalRP += calculatePlanetRP(planet, raceId);
  }

  // Step 2: Allocate RP to fields
  const fieldRP = allocateResearch(totalRP, allocation);

  // Step 3 & 4: Apply and detect completions
  const { updatedFields, completions } = applyResearchRP(
    fields,
    fieldRP,
    galaxySize,
    isAI,
    difficulty,
  );

  return { totalRP, fieldRP, updatedFields, completions };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a default (zeroed) per-field research state for a new empire.
 */
export function createDefaultFieldResearch(): EmpireFieldResearch {
  const defaults: FieldResearchState = {
    currentTechId: null,
    currentTechTier: null,
    progressRP: 0,
    currentTier: 0,
    completedTechs: [],
    pendingChoices: [],
  };
  return {
    weapons: { ...defaults },
    propulsion: { ...defaults },
    construction: { ...defaults },
    computers: { ...defaults },
    force_fields: { ...defaults },
    planetology: { ...defaults },
  };
}

/**
 * Creates a default even allocation (all 6 fields at ~16.67%).
 * Caller should adjust to sum exactly to 100 for usage; this is a
 * convenience starting point.
 */
export function createEvenAllocation(): ResearchAllocation {
  // Assign 17% to first field, 16% to remaining 5 = 97, then adjust
  // Actually use exactly equal fractions; isValidAllocation checks within 0.001
  const base = 100 / ALL_RESEARCH_FIELDS.length;
  const result = {} as ResearchAllocation;
  let remaining = 100;
  for (let i = 0; i < ALL_RESEARCH_FIELDS.length; i++) {
    const field = ALL_RESEARCH_FIELDS[i];
    if (i === ALL_RESEARCH_FIELDS.length - 1) {
      result[field] = remaining;
    } else {
      const val = Math.round(base * 10) / 10; // one decimal
      result[field] = val;
      remaining -= val;
    }
  }
  return result;
}

/**
 * Sets a research target for a specific field.
 *
 * Returns a new EmpireFieldResearch with the target updated.
 * Does not clear existing progress (pending RP is applied to new target).
 */
export function setResearchTarget(
  fields: EmpireFieldResearch,
  field: ResearchField,
  techId: string,
  techTier: number,
): EmpireFieldResearch {
  return {
    ...fields,
    [field]: {
      ...fields[field],
      currentTechId: techId,
      currentTechTier: techTier,
    },
  };
}

/**
 * Calculates total empire RP from a list of planets (sum only, no allocation).
 *
 * Convenience wrapper around calculatePlanetRP for use in UI displays.
 */
export function calculateEmpireTotalRP(
  planets: readonly PlanetRPInput[],
  raceId: RaceId,
): number {
  let total = 0;
  for (const planet of planets) {
    total += calculatePlanetRP(planet, raceId);
  }
  return total;
}
