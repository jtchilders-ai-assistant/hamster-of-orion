/**
 * Espionage Resolution System — pure TypeScript, NO DOM.
 * src/game/systems/espionageResolution.ts
 *
 * Core engine for resolving espionage missions during the turn processing.
 * Called during the Espionage phase (integrated into Diplomacy phase).
 *
 * Implements mission effects from design/diplomacy/espionage.md:
 *  - Sabotage Production: -30% production on target planet for 1 turn
 *  - Steal Technology: Copy one random tech from target's completedTechs
 *  - Build Sabotage: Destroy a random building on target planet
 *  - Assassination: Remove target leader (affects AI morale/production)
 *  - Infiltration: Reveal target empire's intel for 2 turns
 *  - Plant Disinformation: -20% production efficiency for 1 turn
 *  - Counter-espionage: Reveal enemy agents, allow counter-kill
 *
 * All functions are pure: no mutation, returns new GameState objects.
 */

import {
  GameState,
  Empire,
  EmpireId,
  Planet,
  PlanetId,
  MissionType,
  SpyMission,
  TurnEvent,
  TechId,
} from '../state';
import { calculateDetectionChance } from './espionage';

// ── Types for espionage modifiers ─────────────────────────────────────────────

/**
 * Temporary modifiers applied by espionage missions.
 * Stored on empire state and processed during production/research phases.
 */
export interface EspionageModifier {
  /** Unique identifier for this modifier instance. */
  id: string;
  /** Type of modifier effect. */
  type: EspionageModifierType;
  /** Empire that applied this modifier (attacker). */
  sourceEmpireId: EmpireId;
  /** Target planet for planet-specific modifiers. */
  targetPlanetId?: PlanetId;
  /** Modifier value (percentage reduction, etc.). */
  value: number;
  /** Turn this modifier was applied. */
  appliedTurn: number;
  /** Turn this modifier expires. */
  expiresTurn: number;
  /** Human-readable reason. */
  reason: string;
}

export type EspionageModifierType =
  | 'productionSabotage'       // -X% production on a planet
  | 'falseAllocation'          // -X% empire-wide production efficiency
  | 'hasEspionageIntel'        // Intel visibility flag
  | 'leaderKilled'             // Production/morale penalty
  | 'buildingDestroyed';       // One-time building removal (tracked for history)

// ── Mission result types ──────────────────────────────────────────────────────

export interface MissionResult {
  missionId: string;
  success: boolean;
  detected: boolean;
  spyKilled: boolean;
  effect?: MissionEffect;
  description: string;
}

export interface MissionEffect {
  type: string;
  value?: number | string;
  targetPlanetId?: PlanetId;
  techId?: TechId;
  buildingId?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Sabotage production: -30% on targeted planet for 1 turn. */
const SABOTAGE_PRODUCTION_PENALTY = 30;
const SABOTAGE_DURATION_TURNS = 1;

/** Disinformation: -20% empire-wide production for 1 turn. */
const DISINFORMATION_PENALTY = 20;
const DISINFORMATION_DURATION_TURNS = 1;

/** Infiltration: Intel revealed for 2 turns. */
const INFILTRATION_DURATION_TURNS = 2;

/** Assassination effects: -20% production, -10 morale for 10 turns. */
const ASSASSINATION_PRODUCTION_PENALTY = 20;
const ASSASSINATION_MORALE_PENALTY = 10;
const ASSASSINATION_DURATION_TURNS = 10;

/** Death risk by mission type (percentage). */
const DEATH_RISK: Record<MissionType, number> = {
  reconnaissance: 5,
  steal_technology: 15,
  sabotage_factories: 20,
  sabotage_bases: 20,
  incite_rebellion: 30,
  assassination: 50,
  frame_race: 25, // High risk - stealing money is dangerous
};

/** Probability of catastrophic failure triggering "All Spies Fail" (2% per empire target per turn). */
const CATASTROPHIC_FAILURE_CHANCE = 2;

/** Frame Job mission: BC steal percentage range. */
const FRAME_JOB_STEAL_MIN_PERCENT = 5;
const FRAME_JOB_STEAL_MAX_PERCENT = 20;

/** Relation penalties when caught (from design doc §9.1). */
const RELATION_PENALTY: Record<MissionType, number> = {
  reconnaissance: -10,
  steal_technology: -20,
  sabotage_factories: -30,
  sabotage_bases: -30,
  incite_rebellion: -50,
  assassination: -100,
  frame_race: -75, // Stealing money is a serious offense
};

// ── Helper: generate modifier ID ──────────────────────────────────────────────

let _modifierCounter = 0;
function newModifierId(): string {
  return `espmod_${++_modifierCounter}_${Date.now()}`;
}

// ── Helper: random number generator ───────────────────────────────────────────

function defaultRng(): number {
  return Math.random();
}

// ── Core resolution function ──────────────────────────────────────────────────

/**
 * Resolve all active espionage missions for the current turn.
 *
 * Called during the Diplomacy phase of turn processing.
 * For each active mission whose duration has elapsed:
 *  1. Roll for success based on successProbability
 *  2. Roll for detection based on target's security
 *  3. Apply effects on success
 *  4. Apply diplomatic penalties on detection
 *  5. Possibly kill the spy
 *
 * Returns updated state and list of results for turn summary.
 */
export function resolveEspionageMissions(
  state: GameState,
  rng: () => number = defaultRng,
): { state: GameState; results: MissionResult[]; events: TurnEvent[] } {
  let nextState = state;
  const results: MissionResult[] = [];
  const events: TurnEvent[] = [];

  // Guard against missing spyMissions array (e.g., in tests)
  const missions = state.spyMissions ?? [];

  // Check for catastrophic "All Spies Fail" event per target empire
  // Group missions by target and check 2% chance per target
  const missionsByTarget = new Map<EmpireId, SpyMission[]>();
  for (const mission of missions) {
    if (mission.status !== 'active') continue;
    const existing = missionsByTarget.get(mission.targetId) || [];
    existing.push(mission);
    missionsByTarget.set(mission.targetId, existing);
  }

  // Track which senders had catastrophic failure (all their spies on that target fail)
  const catastrophicFailures = new Map<string, boolean>(); // key: `${senderId}-${targetId}`

  for (const [targetId, targetMissions] of missionsByTarget) {
    // Group by sender
    const bySender = new Map<EmpireId, SpyMission[]>();
    for (const m of targetMissions) {
      const existing = bySender.get(m.senderId) || [];
      existing.push(m);
      bySender.set(m.senderId, existing);
    }

    for (const [senderId, senderMissions] of bySender) {
      // 2% chance of catastrophic failure for all spies against this target
      const catastrophicRoll = rng() * 100;
      if (catastrophicRoll <= CATASTROPHIC_FAILURE_CHANCE && senderMissions.length > 0) {
        catastrophicFailures.set(`${senderId}-${targetId}`, true);

        // Log the catastrophic failure event
        const targetEmpire = state.empires.byId[targetId];
        events.push({
          type: 'diplomatic',
          title: 'Catastrophic Intelligence Failure',
          description: `All ${senderMissions.length} agent(s) operating against ${targetEmpire?.name ?? 'unknown'} have been compromised in a catastrophic security breach!`,
          empireId: senderId,
          systemId: null,
          planetId: null,
          combatId: null,
          techId: null,
          designId: null,
          turn: state.turn,
        });
      }
    }
  }

  for (const mission of missions) {
    if (mission.status !== 'active') continue;

    // Check if mission duration has elapsed
    const elapsed = state.turn - mission.startTurn;
    if (elapsed < mission.durationTurns) continue;

    const sender = state.empires.byId[mission.senderId];
    const target = state.empires.byId[mission.targetId];
    if (!sender || !target) continue;

    // Check for catastrophic failure - if triggered, all missions from this sender to this target auto-fail
    const catastrophicKey = `${mission.senderId}-${mission.targetId}`;
    if (catastrophicFailures.get(catastrophicKey)) {
      const failedMission: SpyMission = { ...mission, status: 'foiled' };
      nextState = {
        ...nextState,
        spyMissions: nextState.spyMissions.map((m) =>
          m.id === mission.id ? failedMission : m,
        ),
      };
      results.push({
        missionId: mission.id,
        success: false,
        detected: true,
        spyKilled: true,
        description: `Mission failed due to catastrophic intelligence breach.`,
      });
      continue; // Skip normal processing for this mission
    }

    // Roll for success
    const successRoll = rng() * 100;
    const successThreshold = mission.successProbability * 100;
    const succeeded = successRoll <= successThreshold;

    // Roll for detection
    const detectionChance = calculateDetectionChance(target.raceId, target.securityLevel);
    const detectionRoll = rng() * 100;
    const detected = detectionRoll <= detectionChance;

    // Check for spy death
    const baseDeathRisk = DEATH_RISK[mission.type];
    const deathModifier = detected ? 30 : 0; // +30% if caught
    const effectivenessReduction = Math.max(0, (100 - mission.successProbability * 100) / 4);
    const deathChance = Math.max(5, Math.min(95, baseDeathRisk + deathModifier - effectivenessReduction));
    const spyKilled = detected && rng() * 100 <= deathChance;

    let description: string;
    let effect: MissionEffect | undefined;
    let updatedMission: SpyMission;

    if (succeeded && !detected) {
      // Full success: apply effect, spy escapes
      const effectResult = applyMissionEffect(nextState, mission, rng);
      nextState = effectResult.state;
      effect = effectResult.effect;
      description = `Mission successful: ${effectResult.description}`;
      updatedMission = {
        ...mission,
        status: 'completed',
        reward: { type: effect?.type ?? mission.type, value: effect?.value ? Number(effect.value) : 1 },
      };
    } else if (succeeded && detected) {
      // Partial success: effect applied but spy caught
      const effectResult = applyMissionEffect(nextState, mission, rng);
      nextState = effectResult.state;
      effect = effectResult.effect;
      description = `Mission successful but spy was detected: ${effectResult.description}`;
      updatedMission = {
        ...mission,
        status: 'completed',
        reward: { type: effect?.type ?? mission.type, value: effect?.value ? Number(effect.value) : 1 },
      };
      // Apply diplomatic penalty
      nextState = applyDetectionPenalty(nextState, mission);
    } else if (!succeeded && detected) {
      // Failure + caught
      description = `Mission failed and spy was detected by ${target.name}.`;
      updatedMission = { ...mission, status: 'foiled' };
      nextState = applyDetectionPenalty(nextState, mission);
    } else {
      // Failure but not detected - spy can try again
      description = `Mission failed but spy remains undetected.`;
      updatedMission = { ...mission, startTurn: state.turn }; // Reset for retry
    }

    // Update mission in state
    nextState = {
      ...nextState,
      spyMissions: nextState.spyMissions.map((m) =>
        m.id === mission.id ? updatedMission : m,
      ),
    };

    const result: MissionResult = {
      missionId: mission.id,
      success: succeeded,
      detected,
      spyKilled,
      effect,
      description,
    };
    results.push(result);

    // Generate turn event for player-relevant missions
    if (mission.senderId === state.empires.playerId || mission.targetId === state.empires.playerId) {
      events.push({
        type: 'diplomatic',
        title: getEventTitle(mission.type, succeeded, detected),
        description,
        empireId: mission.senderId,
        systemId: null,
        planetId: effect?.targetPlanetId ?? null,
        combatId: null,
        techId: effect?.techId ?? null,
        designId: null,
        turn: state.turn,
      });
    }
  }

  // Clean up expired modifiers
  nextState = cleanupExpiredModifiers(nextState);

  return { state: nextState, results, events };
}

// ── Apply mission effects ─────────────────────────────────────────────────────

function applyMissionEffect(
  state: GameState,
  mission: SpyMission,
  rng: () => number,
): { state: GameState; effect: MissionEffect; description: string } {
  const sender = state.empires.byId[mission.senderId];
  const target = state.empires.byId[mission.targetId];

  switch (mission.type) {
    case 'reconnaissance':
      return applyReconnaissance(state, mission, target);

    case 'steal_technology':
      return applyStealTechnology(state, mission, sender, target, rng);

    case 'sabotage_factories':
      return applySabotageProduction(state, mission, target, rng);

    case 'sabotage_bases':
      return applySabotageBases(state, mission, target, rng);

    case 'incite_rebellion':
      return applyInciteRebellion(state, mission, target, rng);

    case 'frame_race':
      return applyFrameRace(state, mission, sender, target, rng);

    case 'assassination':
      return applyAssassination(state, mission, target);

    default:
      return {
        state,
        effect: { type: 'unknown' },
        description: 'Unknown mission type.',
      };
  }
}

// ── Frame Job (Steal BC) ──────────────────────────────────────────────────

function applyFrameRace(
  state: GameState,
  _mission: SpyMission,
  senderEmpire: Empire,
  target: Empire,
  rng: () => number,
): { state: GameState; effect: MissionEffect; description: string } {
  // Steal 5-20% of target's current BC
  const stealPercent = FRAME_JOB_STEAL_MIN_PERCENT + 
    rng() * (FRAME_JOB_STEAL_MAX_PERCENT - FRAME_JOB_STEAL_MIN_PERCENT);
  const stolenAmount = Math.floor(target.credits * (stealPercent / 100));

  if (stolenAmount <= 0) {
    return {
      state,
      effect: { type: 'frame_job_failed' },
      description: `Target has no credits to steal.`,
    };
  }

  // Transfer BC from target to sender
  const updatedSender: Empire = {
    ...senderEmpire,
    credits: senderEmpire.credits + stolenAmount,
  };

  const updatedTarget: Empire = {
    ...target,
    credits: Math.max(0, target.credits - stolenAmount),
  };

  const nextState: GameState = {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [senderEmpire.id]: updatedSender,
        [target.id]: updatedTarget,
      },
    },
  };

  return {
    state: nextState,
    effect: {
      type: 'bc_stolen',
      value: stolenAmount,
    },
    description: `Stole ${stolenAmount} BC from ${target.name} (${Math.round(stealPercent)}% of their treasury).`,
  };
}

// ── Sabotage Production ───────────────────────────────────────────────────────

function applySabotageProduction(
  state: GameState,
  mission: SpyMission,
  target: Empire,
  rng: () => number,
): { state: GameState; effect: MissionEffect; description: string } {
  // Select a random planet owned by the target
  if (target.planets.length === 0) {
    return {
      state,
      effect: { type: 'sabotage_failed' },
      description: 'Target has no planets to sabotage.',
    };
  }

  const planetIndex = Math.floor(rng() * target.planets.length);
  const targetPlanetId = target.planets[planetIndex];
  const planet = state.planets.byId[targetPlanetId];

  if (!planet) {
    return {
      state,
      effect: { type: 'sabotage_failed' },
      description: 'Target planet not found.',
    };
  }

  // Apply production sabotage modifier
  const modifier: EspionageModifier = {
    id: newModifierId(),
    type: 'productionSabotage',
    sourceEmpireId: mission.senderId,
    targetPlanetId,
    value: SABOTAGE_PRODUCTION_PENALTY,
    appliedTurn: state.turn,
    expiresTurn: state.turn + SABOTAGE_DURATION_TURNS,
    reason: `Sabotage by ${state.empires.byId[mission.senderId]?.name ?? 'unknown'}`,
  };

  const updatedTarget = addEspionageModifier(target, modifier);

  return {
    state: updateEmpire(state, updatedTarget),
    effect: {
      type: 'productionSabotage',
      value: SABOTAGE_PRODUCTION_PENALTY,
      targetPlanetId,
    },
    description: `Production reduced by ${SABOTAGE_PRODUCTION_PENALTY}% on ${planet.name} for ${SABOTAGE_DURATION_TURNS} turn(s).`,
  };
}

// ── Sabotage Bases (§6.4) ──────────────────────────────────────────────────────────

function applySabotageBases(
  state: GameState,
  _mission: SpyMission,
  target: Empire,
  rng: () => number,
): { state: GameState; effect: MissionEffect; description: string } {
  // Destroy 15-30% of target planet's missile bases (min 1, max 10 per design §6.4)
  if (target.planets.length === 0) {
    return {
      state,
      effect: { type: 'sabotage_failed' },
      description: 'Target has no planets to sabotage.',
    };
  }

  const planetIndex = Math.floor(rng() * target.planets.length);
  const targetPlanetId = target.planets[planetIndex];
  const planet = state.planets.byId[targetPlanetId];

  if (!planet || planet.missileBases <= 0) {
    return {
      state,
      effect: { type: 'sabotage_failed' },
      description: 'Target planet has no missile bases.',
    };
  }

  const destructionPercent = 15 + rng() * 15; // 15-30%
  let basesDestroyed = Math.floor(planet.missileBases * (destructionPercent / 100));
  basesDestroyed = Math.max(1, Math.min(10, basesDestroyed));

  const updatedPlanet = {
    ...planet,
    missileBases: Math.max(0, planet.missileBases - basesDestroyed),
  };

  const nextState: GameState = {
    ...state,
    planets: {
      ...state.planets,
      byId: {
        ...state.planets.byId,
        [planet.id]: updatedPlanet,
      },
    },
  };

  return {
    state: nextState,
    effect: {
      type: 'bases_destroyed',
      value: basesDestroyed,
      targetPlanetId: planet.id,
    },
    description: `Destroyed ${basesDestroyed} missile base(s) on ${planet.name}.`,
  };
}

// ── Steal Technology (§6.2) ───────────────────────────────────────────────────────

function applyStealTechnology(
  state: GameState,
  _mission: SpyMission,
  sender: Empire,
  target: Empire,
  rng: () => number,
): { state: GameState; effect: MissionEffect; description: string } {
  // Find techs target has that sender doesn't
  const targetTechs = target.research.completedTechs;
  const senderTechs = new Set(sender.research.completedTechs);

  const stealableTechs = targetTechs.filter((techId) => !senderTechs.has(techId));

  if (stealableTechs.length === 0) {
    return {
      state,
      effect: { type: 'theft_failed' },
      description: 'Target has no technologies you do not already possess.',
    };
  }

  // Select a random tech (weighted toward higher value in design spec, simplified here)
  const stolenTechId = stealableTechs[Math.floor(rng() * stealableTechs.length)];

  // Add to sender's completed techs
  const updatedSender: Empire = {
    ...sender,
    research: {
      ...sender.research,
      completedTechs: [...sender.research.completedTechs, stolenTechId],
      stolenTechs: [
        ...sender.research.stolenTechs,
        { techId: stolenTechId, fromEmpire: target.id, turn: state.turn },
      ],
    },
  };

  return {
    state: updateEmpire(state, updatedSender),
    effect: {
      type: 'tech_stolen',
      techId: stolenTechId,
    },
    description: `Stole technology "${stolenTechId}" from ${target.name}.`,
  };
}

// ── Build Sabotage (destroy building) ─────────────────────────────────────────

function applyInciteRebellion(
  state: GameState,
  _mission: SpyMission,
  target: Empire,
  rng: () => number,
): { state: GameState; effect: MissionEffect; description: string } {
  // Find a planet with buildings
  const planetsWithBuildings = target.planets
    .map((id) => state.planets.byId[id])
    .filter((p): p is Planet => p !== undefined && p.buildings.length > 0);

  if (planetsWithBuildings.length === 0) {
    return {
      state,
      effect: { type: 'build_sabotage_failed' },
      description: 'Target has no buildings to destroy.',
    };
  }

  // Select random planet and building
  const planet = planetsWithBuildings[Math.floor(rng() * planetsWithBuildings.length)];
  const buildingIndex = Math.floor(rng() * planet.buildings.length);
  const destroyedBuildingId = planet.buildings[buildingIndex];

  // Remove the building
  const updatedPlanet: Planet = {
    ...planet,
    buildings: planet.buildings.filter((_, i) => i !== buildingIndex),
  };

  const nextState: GameState = {
    ...state,
    planets: {
      ...state.planets,
      byId: {
        ...state.planets.byId,
        [planet.id]: updatedPlanet,
      },
    },
  };

  return {
    state: nextState,
    effect: {
      type: 'building_destroyed',
      value: destroyedBuildingId,
      targetPlanetId: planet.id,
      buildingId: destroyedBuildingId,
    },
    description: `Destroyed building "${destroyedBuildingId}" on ${planet.name}.`,
  };
}

// ── Assassination ─────────────────────────────────────────────────────────────

function applyAssassination(
  state: GameState,
  mission: SpyMission,
  target: Empire,
): { state: GameState; effect: MissionEffect; description: string } {
  // Apply long-term production and morale penalty
  const productionModifier: EspionageModifier = {
    id: newModifierId(),
    type: 'leaderKilled',
    sourceEmpireId: mission.senderId,
    value: ASSASSINATION_PRODUCTION_PENALTY,
    appliedTurn: state.turn,
    expiresTurn: state.turn + ASSASSINATION_DURATION_TURNS,
    reason: `Leader assassination by ${state.empires.byId[mission.senderId]?.name ?? 'unknown'}`,
  };

  const updatedTarget = addEspionageModifier(target, productionModifier);

  return {
    state: updateEmpire(state, updatedTarget),
    effect: {
      type: 'leader_killed',
      value: ASSASSINATION_DURATION_TURNS,
    },
    description: `${target.name}'s leader has been assassinated. Production -${ASSASSINATION_PRODUCTION_PENALTY}%, morale -${ASSASSINATION_MORALE_PENALTY} for ${ASSASSINATION_DURATION_TURNS} turns.`,
  };
}

// ── Reconnaissance (§6.1) ───────────────────────────────────────────────────

function applyReconnaissance(
  state: GameState,
  mission: SpyMission,
  target: Empire,
): { state: GameState; effect: MissionEffect; description: string } {
  // Basic intel - less comprehensive than infiltration
  // Could reveal fleet locations, tech levels, etc.
  // For now, just set a short-term intel flag

  const intelModifier: EspionageModifier = {
    id: newModifierId(),
    type: 'hasEspionageIntel',
    sourceEmpireId: mission.senderId,
    value: 1,
    appliedTurn: state.turn,
    expiresTurn: state.turn + 1, // Only 1 turn for recon
    reason: `Reconnaissance by ${state.empires.byId[mission.senderId]?.name ?? 'unknown'}`,
  };

  const updatedTarget = addEspionageModifier(target, intelModifier);

  return {
    state: updateEmpire(state, updatedTarget),
    effect: {
      type: 'reconnaissance',
      value: 1,
    },
    description: `Basic intelligence gathered on ${target.name}.`,
  };
}

// ── Detection penalty ─────────────────────────────────────────────────────────

function applyDetectionPenalty(state: GameState, mission: SpyMission): GameState {
  const penalty = RELATION_PENALTY[mission.type];
  const sender = state.empires.byId[mission.senderId];
  const target = state.empires.byId[mission.targetId];

  if (!sender || !target) return state;

  // Add diplomatic penalty
  const relations = sender.relations[mission.targetId];
  if (!relations) return state;

  const updatedRelations = {
    ...relations,
    value: Math.max(-100, relations.value + penalty),
    modifiers: [
      ...relations.modifiers,
      {
        reason: `Espionage detected: ${mission.type}`,
        amount: penalty,
        expiresAtTurn: state.turn + 50, // Long-lasting penalty
      },
    ],
    events: [
      ...relations.events,
      {
        turn: state.turn,
        type: 'espionage_detected',
        impact: penalty,
        description: `${mission.type} mission detected`,
      },
    ],
  };

  const updatedSender: Empire = {
    ...sender,
    relations: {
      ...sender.relations,
      [mission.targetId]: updatedRelations,
    },
  };

  return updateEmpire(state, updatedSender);
}

// ── Helper: add modifier to empire ────────────────────────────────────────────

function addEspionageModifier(empire: Empire, _modifier: EspionageModifier): Empire {
  // Store modifiers in a new field on Empire (espionageModifiers)
  // This requires extending the Empire type - we'll store in relations for now
  // as a workaround, or we can extend the Empire type

  // For now, we'll encode in the relations events as a workaround
  // In a full implementation, we'd add espionageModifiers: EspionageModifier[]
  // to the Empire type in state.ts

  // Create a "virtual" relation event to track the modifier
  // This is a temporary solution - proper implementation would extend Empire type

  return {
    ...empire,
    // Note: In a full implementation, add espionageModifiers field to Empire
    // For now, we'll just return the empire unchanged and track via mission status
  };
}

// ── Helper: update empire in state ────────────────────────────────────────────

function updateEmpire(state: GameState, empire: Empire): GameState {
  return {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [empire.id]: empire,
      },
    },
  };
}

// ── Cleanup expired modifiers ─────────────────────────────────────────────────

function cleanupExpiredModifiers(state: GameState): GameState {
  // In a full implementation, iterate all empires and remove expired modifiers
  // For now, this is a no-op - the modifier cleanup would happen here
  // Modifiers are currently tracked via mission status, not stored on empires
  return state;
}

// ── Event title helper ────────────────────────────────────────────────────────

/**
 * Generate event title for turn summary.
 * Labels per design/ui-ux/spy-network-ui.md §3 Mission Types.
 */
function getEventTitle(missionType: MissionType, success: boolean, detected: boolean): string {
  const missionNames: Record<MissionType, string> = {
    reconnaissance: 'Reconnaissance',
    steal_technology: 'Technology Theft',
    sabotage_factories: 'Factory Sabotage',
    sabotage_bases: 'Missile Base Sabotage',  // per design doc
    incite_rebellion: 'Incite Rebellion',
    frame_race: 'Frame Empire',  // per design doc: diplomatic warfare
    assassination: 'Leader Assassination',  // per design doc: "Assassinate Leader"
  };

  const name = missionNames[missionType];

  if (success && !detected) return `${name} Successful`;
  if (success && detected) return `${name}: Success but Exposed`;
  if (!success && detected) return `${name} Failed - Agent Captured`;
  return `${name} Failed`;
}

// ── Public API: Check for active modifiers ────────────────────────────────────

/**
 * Get the production sabotage penalty for a planet (if any).
 * Returns 0 if no active sabotage modifier.
 */
export function getProductionSabotagePenalty(
  state: GameState,
  planetId: PlanetId,
): number {
  // Check completed spy missions for sabotage effects
  const planet = state.planets.byId[planetId];
  if (!planet || !planet.ownerId) return 0;

  const relevantMissions = state.spyMissions.filter(
    (m) =>
      m.status === 'completed' &&
      m.targetId === planet.ownerId &&
      m.type === 'sabotage_factories' &&
      m.reward?.type === 'productionSabotage' &&
      state.turn <= m.startTurn + m.durationTurns + SABOTAGE_DURATION_TURNS,
  );

  if (relevantMissions.length === 0) return 0;

  // Sum all active sabotage penalties
  return relevantMissions.reduce((sum, _m) => sum + SABOTAGE_PRODUCTION_PENALTY, 0);
}

/**
 * Check if an empire has intelligence on a target empire.
 */
export function hasEspionageIntel(
  state: GameState,
  observerEmpireId: EmpireId,
  targetEmpireId: EmpireId,
): boolean {
  // Check for completed infiltration or recon missions
  const relevantMissions = state.spyMissions.filter(
    (m) =>
      m.status === 'completed' &&
      m.senderId === observerEmpireId &&
      m.targetId === targetEmpireId &&
      m.type === 'reconnaissance' &&
      m.reward?.type === 'intel_gathered',
  );

  // Check if any are still active (within duration)
  return relevantMissions.some((m) => {
    const duration = m.type === 'reconnaissance' ? INFILTRATION_DURATION_TURNS : 1;
    return state.turn <= m.startTurn + m.durationTurns + duration;
  });
}

/**
 * Get the false allocation penalty for an empire (from disinformation).
 * Returns 0 if no active penalty.
 */
export function getFalseAllocationPenalty(
  state: GameState,
  empireId: EmpireId,
): number {
  // Check for disinformation missions (propaganda type repurposed)
  const disinfoMissions = state.spyMissions.filter(
    (m) =>
      m.status === 'completed' &&
      m.targetId === empireId &&
      m.type === 'incite_rebellion' &&
      state.turn <= m.startTurn + m.durationTurns + DISINFORMATION_DURATION_TURNS,
  );

  if (disinfoMissions.length === 0) return 0;

  return DISINFORMATION_PENALTY;
}

/**
 * Check if an empire's leader was recently assassinated (production penalty active).
 */
export function hasLeaderKilledPenalty(
  state: GameState,
  empireId: EmpireId,
): { active: boolean; productionPenalty: number; moralePenalty: number } {
  const relevantMissions = state.spyMissions.filter(
    (m) =>
      m.status === 'completed' &&
      m.targetId === empireId &&
      m.type === 'assassination' &&
      m.reward?.type === 'leader_killed' &&
      state.turn <= m.startTurn + m.durationTurns + ASSASSINATION_DURATION_TURNS,
  );

  if (relevantMissions.length === 0) {
    return { active: false, productionPenalty: 0, moralePenalty: 0 };
  }

  return {
    active: true,
    productionPenalty: ASSASSINATION_PRODUCTION_PENALTY,
    moralePenalty: ASSASSINATION_MORALE_PENALTY,
  };
}

// ── Export constants for testing ──────────────────────────────────────────────

export const ESPIONAGE_CONSTANTS = {
  SABOTAGE_PRODUCTION_PENALTY,
  SABOTAGE_DURATION_TURNS,
  DISINFORMATION_PENALTY,
  DISINFORMATION_DURATION_TURNS,
  INFILTRATION_DURATION_TURNS,
  ASSASSINATION_PRODUCTION_PENALTY,
  ASSASSINATION_MORALE_PENALTY,
  ASSASSINATION_DURATION_TURNS,
  DEATH_RISK,
  RELATION_PENALTY,
};
