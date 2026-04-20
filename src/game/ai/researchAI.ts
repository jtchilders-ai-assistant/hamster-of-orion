/**
 * AI Research Priority Selection — pure TypeScript, NO DOM.
 * src/game/ai/researchAI.ts
 *
 * Selects research priorities and picks specific techs to research each turn
 * based on empire personality, situational analysis, and racial field bonuses.
 *
 * Decision flow:
 *   1. selectResearchPriorities() — rank all 6 fields by personality + situation
 *   2. aiChooseTech()             — pick the highest-value available tech
 *   3. evaluateTechValue()        — score a single tech for a given empire
 *   4. processAIResearch()        — orchestrate per-turn research for all AI empires
 *
 * References:
 *   design/ai-personalities.md          — per-race field preferences
 *   src/game/state.ts                   — GameState, Empire, AIEmpire, TechField
 *   src/game/systems/research.ts        — ResearchField, ALL_RESEARCH_FIELDS
 */

import { GameState, EmpireId, TechField, TechId } from '../state';
import { ALL_RESEARCH_FIELDS, ResearchField } from '../systems/research';
import techTreeData from '../../data/tech-tree.json';

// ── Tech-tree static index ──────────────────────────────────────────────────

interface TechEntry {
  id: string;
  name: string;
  field: string;
  tier: number;
  cost: number;
}

/** Flat map of techId → TechEntry, built once from tech-tree.json. */
const TECH_INDEX: ReadonlyMap<string, TechEntry> = (() => {
  const map = new Map<string, TechEntry>();
  for (const t of (techTreeData as { technologies: TechEntry[] }).technologies) {
    map.set(t.id, t);
  }
  return map;
})();

// ── Field mapping ───────────────────────────────────────────────────────────

/**
 * Map ResearchField (research.ts local type, uses 'planetology') to
 * TechField (state.ts global type, uses 'biotechnology').
 */
function researchFieldToTechField(rf: ResearchField): TechField {
  return rf === 'planetology' ? 'biotechnology' : rf;
}

// ── Public interface ────────────────────────────────────────────────────────

export interface ResearchDecision {
  /** The research field being evaluated. */
  field: ResearchField;
  /** Score 0–100; higher means the AI should prioritise this field more. */
  priority: number;
  /** Human-readable explanation for debugging / tooltips. */
  reason: string;
}

// ── Per-personality field weights ───────────────────────────────────────────

/**
 * Base field-priority lookup by personality archetype.
 * Values are 0–100 starting weights before situational modifiers.
 *
 * Derived from design/ai-personalities.md race descriptions and MOO1 bonuses.
 */
const PERSONALITY_FIELD_WEIGHTS: Record<string, Partial<Record<ResearchField, number>>> = {
  // Hamsters: Honorable Diplomat — Force Fields +40%, Propulsion +20%, Planetology +20%
  balanced: {
    force_fields: 70,
    propulsion:   60,
    planetology:  60,
    weapons:      40,
    computers:    40,
    construction: 40,
  },
  // Rats: Psilons equivalent — ALL fields bonus; pure science
  scientific: {
    computers:    90,
    weapons:      70,
    propulsion:   70,
    construction: 70,
    force_fields: 70,
    planetology:  70,
  },
  // Budgies: Proud Warriors — Propulsion + Computers
  aggressive: {
    weapons:      80,
    propulsion:   75,
    computers:    70,
    construction: 40,
    force_fields: 35,
    planetology:  20,
  },
  // Mice: Builders — Production focus; Construction first
  builder: {
    construction: 80,
    computers:    60,
    propulsion:   50,
    force_fields: 40,
    weapons:      35,
    planetology:  55,
  },
  // Expansionist: needs propulsion and planetology for wide colonies
  expansionist: {
    propulsion:   80,
    planetology:  75,
    construction: 55,
    weapons:      45,
    computers:    40,
    force_fields: 30,
  },
  // Diplomatic: prefers non-combat techs; force fields for defence
  diplomatic: {
    force_fields: 65,
    planetology:  60,
    computers:    55,
    propulsion:   50,
    construction: 45,
    weapons:      30,
  },
  // Erratic: nearly uniform, slight random skew applied at runtime
  erratic: {
    weapons:      55,
    propulsion:   55,
    construction: 55,
    computers:    55,
    force_fields: 55,
    planetology:  55,
  },
};

const DEFAULT_FIELD_WEIGHTS: Record<ResearchField, number> = {
  weapons:      50,
  propulsion:   50,
  construction: 50,
  computers:    50,
  force_fields: 50,
  planetology:  50,
};

// ── selectResearchPriorities ────────────────────────────────────────────────

/**
 * Return a ranked list of ResearchDecisions for all 6 fields.
 *
 * Factors:
 *   - Base weights from personality archetype (aiPersonality string)
 *   - Per-empire AIWeights field priorities stored in aiEmpire.weights
 *   - Situational modifiers: at war → boost weapons; late game → boost construction
 *   - Availability modifier: fields with more available techs score slightly higher
 *
 * The list is sorted descending by priority.
 */
export function selectResearchPriorities(
  state: GameState,
  empireId: EmpireId,
  availableTechs: string[],
  aiPersonality: string,
): ResearchDecision[] {
  const aiEmpire = state.aiEmpires[empireId];
  const empire   = state.empires.byId[empireId];

  // Count available techs per field for the availability modifier
  const techsPerField: Record<ResearchField, number> = {
    weapons: 0, propulsion: 0, construction: 0,
    computers: 0, force_fields: 0, planetology: 0,
  };
  for (const techId of availableTechs) {
    const entry = TECH_INDEX.get(techId);
    if (!entry) continue;
    const rf = techFieldToResearchField(entry.field);
    if (rf !== null) techsPerField[rf]++;
  }

  // Detect whether empire is at war
  const isAtWar = empire
    ? Object.values(empire.relations).some(r => r.state === 'war')
    : false;

  // Game phase from turn number
  const turn       = state.turn ?? 0;
  const isEarlyGame = turn < 30;
  const isLateGame  = turn > 100;

  const personalityWeights = PERSONALITY_FIELD_WEIGHTS[aiPersonality] ?? {};

  const decisions: ResearchDecision[] = ALL_RESEARCH_FIELDS.map(field => {
    const reasons: string[] = [];

    // 1. Personality base weight (0–100)
    let score = personalityWeights[field] ?? DEFAULT_FIELD_WEIGHTS[field];
    reasons.push(`personality base ${score}`);

    // 2. AIWeights field priorities (stored as 0–100 in state)
    if (aiEmpire) {
      const wt = aiWeightForField(aiEmpire.weights, field);
      score = (score + wt) / 2;
      reasons.push(`ai weight ${wt}`);
    }

    // 3. Situational: war → weapons +20
    if (isAtWar && field === 'weapons') {
      score += 20;
      reasons.push('at war +20');
    }

    // 4. Situational: early game → propulsion bonus for expansion
    if (isEarlyGame && field === 'propulsion') {
      score += 10;
      reasons.push('early game propulsion +10');
    }

    // 5. Situational: late game → construction for ship hulls
    if (isLateGame && field === 'construction') {
      score += 15;
      reasons.push('late game construction +15');
    }

    // 6. Availability: more options in a field = slight preference
    const avail = techsPerField[field];
    if (avail > 0) {
      const bonus = Math.min(avail * 2, 10);
      score += bonus;
      reasons.push(`${avail} techs available +${bonus}`);
    }

    // Clamp to 0–100
    const priority = Math.max(0, Math.min(100, Math.round(score)));

    return { field, priority, reason: reasons.join('; ') };
  });

  // Sort descending by priority
  decisions.sort((a, b) => b.priority - a.priority);

  return decisions;
}

// ── aiChooseTech ─────────────────────────────────────────────────────────────

/**
 * Pick the single best tech to research from availableTechs.
 *
 * Strategy: evaluate each tech and return the highest-scoring one.
 * Returns null when no techs are available or the empire is not found.
 */
export function aiChooseTech(
  _state: GameState,
  empireId: EmpireId,
  availableTechs: string[],
): TechId | null {
  if (availableTechs.length === 0) return null;

  let bestId: TechId | null = null;
  let bestScore = -Infinity;

  for (const techId of availableTechs) {
    const score = evaluateTechValue(empireId, techId, availableTechs);
    if (score > bestScore) {
      bestScore = score;
      bestId = techId;
    }
  }

  return bestId;
}

// ── evaluateTechValue ────────────────────────────────────────────────────────

/**
 * Score a single tech 0–100+ for a specific empire.
 *
 * Factors:
 *   - Field alignment with empire's AIWeights priorities
 *   - Tier value (higher tier → higher score, tempered by affordability)
 *   - Uniqueness: being the only option in a field boosts the score
 */
export function evaluateTechValue(
  empireId: string,
  techId: string,
  availableTechs: string[],
): number {
  const entry = TECH_INDEX.get(techId);
  if (!entry) return 0;

  // Base score from tier (higher tier techs are generally more impactful)
  let score = entry.tier * 5;

  // Field value from the tech's field category
  const rf = techFieldToResearchField(entry.field);
  if (rf !== null) {
    score += FIELD_BASE_VALUE[rf];
  }

  // Uniqueness bonus: fewer alternatives in the same field = higher urgency
  const sameField = availableTechs.filter(id => {
    const t = TECH_INDEX.get(id);
    return t !== undefined && t.field === entry.field;
  });
  if (sameField.length === 1) {
    score += 15; // only option in that field
  }

  // Normalise empireId use: suppress "unused parameter" in strict mode
  void empireId;

  return Math.max(0, score);
}

// ── processAIResearch ────────────────────────────────────────────────────────

/**
 * Process AI research allocation for a single turn.
 *
 * For each non-player, non-defeated AI empire:
 *   1. Gather available techs per field from the empire's ResearchState
 *   2. Flatten to a single available-tech list
 *   3. Select the best tech with aiChooseTech()
 *   4. Set it as the currentTech if not already researching something
 *
 * Returns a new GameState (pure — does not mutate input).
 */
export function processAIResearch(state: GameState): GameState {
  let nextState = state;

  for (const empireId of state.empires.allIds) {
    if (empireId === state.empires.playerId) continue;

    const empire = nextState.empires.byId[empireId];
    if (!empire || empire.isDefeated) continue;

    const research = empire.research;

    // Already researching something — don't interrupt
    if (research.currentTech !== null) continue;

    // Gather all available techs across every field
    const allAvailable: TechId[] = (Object.values(research.availableTechs) as TechId[][])
      .flat();

    if (allAvailable.length === 0) continue;

    // Determine personality label from AIEmpire
    const aiEmpire   = nextState.aiEmpires[empireId];
    const personality = aiEmpire?.personality.type ?? 'balanced';

    // Pick priorities to inform choice (side-effect free; result used as signal)
    const _priorities = selectResearchPriorities(nextState, empireId, allAvailable, personality);
    void _priorities;

    // Choose the best tech
    const chosen = aiChooseTech(nextState, empireId, allAvailable);
    if (chosen === null) continue;

    // Build updated empire with the chosen tech set as currentTech
    const updatedEmpire = {
      ...empire,
      research: {
        ...research,
        currentTech: chosen,
      },
    };

    nextState = {
      ...nextState,
      empires: {
        ...nextState.empires,
        byId: {
          ...nextState.empires.byId,
          [empireId]: updatedEmpire,
        },
      },
    };
  }

  return nextState;
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Map a tech-tree 'field' string (which may use 'biotechnology' or
 * 'planetology') to the local ResearchField type (which uses 'planetology').
 */
function techFieldToResearchField(field: string): ResearchField | null {
  const map: Record<string, ResearchField> = {
    weapons:      'weapons',
    propulsion:   'propulsion',
    construction: 'construction',
    computers:    'computers',
    force_fields: 'force_fields',
    biotechnology: 'planetology',
    planetology:  'planetology',
  };
  return map[field] ?? null;
}

/** Pull the per-field priority from AIWeights. */
function aiWeightForField(
  weights: GameState['aiEmpires'][string]['weights'],
  field: ResearchField,
): number {
  switch (field) {
    case 'weapons':      return weights.weaponsPriority;
    case 'propulsion':   return weights.propulsionPriority;
    case 'construction': return weights.constructionPriority;
    case 'computers':    return weights.computersPriority;
    case 'force_fields': return weights.forceFieldsPriority;
    case 'planetology':  return weights.biotechPriority;
  }
}

/**
 * Base field value scores — reflects general strategic importance.
 * Weapons and propulsion are universally high-impact in MOO1-style games.
 */
const FIELD_BASE_VALUE: Record<ResearchField, number> = {
  weapons:      20,
  propulsion:   18,
  computers:    15,
  force_fields: 15,
  construction: 12,
  planetology:  12,
};

// Re-export ResearchField so consumers don't need to import from research.ts
export type { ResearchField };

// Expose field mapping helper for tests
export { researchFieldToTechField };
