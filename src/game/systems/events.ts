/**
 * Random Events System — pure TypeScript, NO DOM.
 * src/game/systems/events.ts
 *
 * Implements the random event system from design/game-mechanics/random-events.md.
 *
 * Public entry points:
 *   rollRandomEvents(state, rng?)              — decide which events fire this turn
 *   applyGameEvent(state, event, ...)          — apply one event to state
 *   processRandomEvents(state, rng?)           — roll + apply all events in one call
 *   tickActiveEvents(state, rng?)              — process multi-turn events (plague, comet, etc.)
 *   moveRoamingMonsters(state)                 — move monsters toward nearest colony
 *   resolveDerelictChoice(state, choice, rng?) — resolve Ancient Derelict player choice
 *
 * All functions are pure: no mutation, returns new GameState objects.
 */

import {
  GameState,
  PlanetId,
  SystemId,
  NotificationType,
  EmpireId,
  ActiveEvent,
  SpaceMonster,
  TurnEvent,
  TechField,
} from '../state';
import { getEventFrequencyMultiplier } from './difficulty';
import eventsData from '../../data/events.json';

// ── Types ─────────────────────────────────────────────────────────────────────

export type GameEventType =
  | 'monster'
  | 'discovery'
  | 'disaster'
  | 'diplomatic'
  | 'opportunity';

export type GameEventCategory =
  | 'space_monsters'
  | 'discoveries'
  | 'disasters'
  | 'diplomatic'
  | 'opportunities';

/** The effect payload attached to each event definition. */
export type GameEventEffect = Record<string, unknown>;

/** A game event definition (loaded from events.json). */
export interface GameEvent {
  id: string;
  name: string;
  type: GameEventType;
  category: GameEventCategory;
  probability: number;
  weight: number;
  min_turn: number;
  description: string;
  target_type: string;
  galaxy_requirement?: string;
  duration_turns?: number | { min: number; max: number };
  effects: GameEventEffect;
}

// ── Constants (from design/game-mechanics/random-events.md) ───────────────────

const BASE_EVENT_CHANCE = 0.03;
const TURN_PROBABILITY_INCREMENT = 0.001;
const MAX_EVENT_CHANCE = 0.15;
const MIN_TURNS_BETWEEN_SAME_EVENT = 20;

// Category weights from the design doc
const CATEGORY_WEIGHTS: Record<GameEventCategory, number> = {
  space_monsters: 15,
  discoveries: 25,
  disasters: 30,
  diplomatic: 15,
  opportunities: 15,
};

// Monster stats from design doc §MONSTER_STATS
export const MONSTER_STATS = {
  cosmic_blob: {
    id: 'cosmic_blob',
    name: 'Cosmic Blob',
    hp: 500,
    attackLevel: 4,
    defenseLevel: 4,
    beamAttackMin: 10,
    beamAttackMax: 40,
    movement: 2,
    regenerationPerRound: 15,
    isRoaming: true,
    rewardField: 'biotechnology' as TechField,
    rewardBonusPercent: 50,
    rewardBonusDuration: 10,
    rewardBcMin: 200,
    rewardBcMax: 500,
  },
  crystal_horror: {
    id: 'crystal_horror',
    name: 'Crystal Horror',
    hp: 400,
    attackLevel: 6,
    defenseLevel: 8,
    beamAttackMin: 15,
    beamAttackMax: 50,
    movement: 3,
    beamReflectionPercent: 25,
    isRoaming: true,
    rewardField: 'construction' as TechField,
    rewardBonusPercent: 25,
    rewardBonusDuration: 10,
    rewardBcMin: 300,
    rewardBcMax: 600,
  },
  void_wyrm: {
    id: 'void_wyrm',
    name: 'Void Wyrm',
    hp: 750,
    attackLevel: 8,
    defenseLevel: 6,
    beamAttackMin: 30,
    beamAttackMax: 100,
    movement: 4,
    isRoaming: false, // Guards treasure location
    rewardTechsMin: 2,
    rewardTechsMax: 4,
    rewardBcMin: 500,
    rewardBcMax: 1000,
    rewardArtifactChance: 0.25,
  },
} as const;

// Comet stats from design doc
const COMET_HP = 1000;
const COMET_WARNING_TURNS = 5;

// Plague stats from design doc
const PLAGUE_SPREAD_CHANCE = 0.25;
const PLAGUE_SPREAD_RANGE_PARSECS = 3;

// ── Loaded event definitions ──────────────────────────────────────────────────

const ALL_EVENTS: GameEvent[] = eventsData.events as GameEvent[];

// ── Notification/ID counters ──────────────────────────────────────────────────

let _notifSeq = 0;
let _eventSeq = 0;
let _monsterSeq = 0;

function nextNotifId(): string {
  _notifSeq += 1;
  return `event-notif-${Date.now()}-${_notifSeq}`;
}

function nextActiveEventId(): string {
  _eventSeq += 1;
  return `active-event-${Date.now()}-${_eventSeq}`;
}

function nextMonsterId(): string {
  _monsterSeq += 1;
  return `monster-${Date.now()}-${_monsterSeq}`;
}

// ── Technology Mitigation Helpers ─────────────────────────────────────────────

/**
 * Check if empire has a specific technology.
 * Design doc: random-events.md §Mitigation
 */
function hasTech(state: GameState, empireId: EmpireId, techId: string): boolean {
  const empire = state.empires.byId[empireId];
  if (!empire) return false;
  return empire.research.completedTechs.includes(techId);
}

/**
 * Get plague mitigation effects based on empire technologies.
 * Design doc: random-events.md §Plague §Mitigation
 *
 * - Bio Toxin Antidote: Immediate cure
 * - Atmospheric Terraforming: Duration reduced by 50%
 * - Soil Enrichment: Death rate reduced by 50%
 */
function getPlagueMitigation(
  state: GameState,
  empireId: EmpireId,
): { cured: boolean; durationReduction: number; deathRateReduction: number } {
  const result = { cured: false, durationReduction: 0, deathRateReduction: 0 };

  if (hasTech(state, empireId, 'bio_toxin_antidote_tech')) {
    result.cured = true;
  }
  if (hasTech(state, empireId, 'atmospheric_terraforming_tech')) {
    result.durationReduction = 0.5;
  }
  if (hasTech(state, empireId, 'soil_enrichment_tech')) {
    result.deathRateReduction = 0.5;
  }

  return result;
}

/**
 * Get computer virus mitigation effects based on empire technologies.
 * Design doc: random-events.md §Computer Virus §Mitigation
 *
 * - Battle Computer Mark V or higher: Duration reduced by 50%
 * - ECM Jammer Mark V or higher: Effect severity reduced by 50%
 */
function getComputerVirusMitigation(
  state: GameState,
  empireId: EmpireId,
): { durationReduction: number; severityReduction: number } {
  const result = { durationReduction: 0, severityReduction: 0 };

  // Check for Battle Computer V+ (computers field, level 5+)
  if (
    hasTech(state, empireId, 'battle_computer_5_tech') ||
    hasTech(state, empireId, 'battle_computer_6_tech') ||
    hasTech(state, empireId, 'battle_computer_7_tech')
  ) {
    result.durationReduction = 0.5;
  }

  // Check for ECM Jammer V+ (computers field)
  if (
    hasTech(state, empireId, 'ecm_jammer_5_tech') ||
    hasTech(state, empireId, 'ecm_jammer_6_tech') ||
    hasTech(state, empireId, 'ecm_jammer_7_tech')
  ) {
    result.severityReduction = 0.5;
  }

  return result;
}

// ── Galaxy-state helper predicates ────────────────────────────────────────────

/**
 * Check whether the empire meets a galaxy_requirement string.
 */
function meetsGalaxyRequirement(
  state: GameState,
  playerId: EmpireId,
  requirement: string | undefined,
): boolean {
  if (!requirement) return true;

  const empire = state.empires.byId[playerId];
  if (!empire) return false;

  const colonyCount = empire.planets.filter(
    (pid) => state.planets.byId[pid]?.isColonized,
  ).length;

  switch (requirement) {
    case 'has_colonies':
      return colonyCount > 0;
    case 'has_multiple_colonies':
      return colonyCount >= 2;
    case 'has_factories': {
      const totalFactories = empire.planets.reduce((sum, pid) => {
        const p = state.planets.byId[pid];
        return sum + (p?.factories ?? 0);
      }, 0);
      return totalFactories > 0;
    }
    case 'has_enemy_contact': {
      const knownEmpires = Object.keys(empire.relations).length;
      return knownEmpires > 0;
    }
    default:
      return true;
  }
}

/**
 * Calculate distance between two systems in parsecs.
 */
function systemDistance(state: GameState, sysA: SystemId, sysB: SystemId): number {
  const systemA = state.galaxy.systems.byId[sysA];
  const systemB = state.galaxy.systems.byId[sysB];
  if (!systemA || !systemB) return Infinity;

  const dx = systemA.coordinates.x - systemB.coordinates.x;
  const dy = systemA.coordinates.y - systemB.coordinates.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find the nearest colonized system to a given system.
 */
function findNearestColonizedSystem(
  state: GameState,
  fromSystemId: SystemId,
): SystemId | null {
  let nearestId: SystemId | null = null;
  let nearestDist = Infinity;

  for (const pid of state.planets.allIds) {
    const planet = state.planets.byId[pid];
    if (planet?.isColonized && planet.systemId !== fromSystemId) {
      const dist = systemDistance(state, fromSystemId, planet.systemId);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestId = planet.systemId;
      }
    }
  }

  return nearestId;
}

/**
 * Find systems within a given parsec range of a system.
 */
function findSystemsInRange(
  state: GameState,
  fromSystemId: SystemId,
  rangeParsecs: number,
): SystemId[] {
  const result: SystemId[] = [];
  for (const sysId of state.galaxy.systems.allIds) {
    if (sysId === fromSystemId) continue;
    if (systemDistance(state, fromSystemId, sysId) <= rangeParsecs) {
      result.push(sysId);
    }
  }
  return result;
}

/**
 * Get a random colonized planet owned by the player that hasn't been targeted recently.
 */
function selectTargetPlanet(
  state: GameState,
  playerId: EmpireId,
  excludeHomeworld: boolean = false,
): PlanetId | null {
  const empire = state.empires.byId[playerId];
  if (!empire) return null;

  const candidates = empire.planets.filter((pid) => {
    const planet = state.planets.byId[pid];
    if (!planet?.isColonized) return false;
    if (excludeHomeworld && planet.isHomeworld) return false;
    return true;
  });

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

/**
 * Get a random system that is not too close to the player homeworld.
 */
function selectMonsterSpawnSystem(
  state: GameState,
  playerId: EmpireId,
  minDistanceFromHomeworld: number = 5,
): SystemId | null {
  const empire = state.empires.byId[playerId];
  if (!empire) return null;

  // Find homeworld system
  let homeworldSystemId: SystemId | null = null;
  for (const pid of empire.planets) {
    const planet = state.planets.byId[pid];
    if (planet?.isHomeworld) {
      homeworldSystemId = planet.systemId;
      break;
    }
  }

  const candidates = state.galaxy.systems.allIds.filter((sysId) => {
    if (!homeworldSystemId) return true;
    return systemDistance(state, sysId, homeworldSystemId) >= minDistanceFromHomeworld;
  });

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

// ── Weighted random selection ─────────────────────────────────────────────────

function weightedChoice<T extends { weight: number }>(
  items: T[],
  rng: () => number,
): T | null {
  if (items.length === 0) return null;
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * totalWeight;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1] ?? null;
}

// ── Core public functions ─────────────────────────────────────────────────────

/**
 * Roll random events for this turn.
 *
 * Uses the formula from the design doc:
 *   event_chance = min(BASE + turn * INCREMENT, MAX) * difficulty_multiplier
 *
 * Returns an array of GameEvent definitions that triggered.
 * In most turns this will be empty; rarely 1 event fires.
 */
export function rollRandomEvents(
  state: GameState,
  rng: () => number = Math.random,
): GameEvent[] {
  const turn = state.turn;
  // Default to 'average' if difficulty not set (backward compatibility)
  const difficulty = state.difficulty ?? 'average';
  const difficultyMultiplier = getEventFrequencyMultiplier(difficulty);

  const eventChance =
    Math.min(BASE_EVENT_CHANCE + turn * TURN_PROBABILITY_INCREMENT, MAX_EVENT_CHANCE) *
    difficultyMultiplier;

  // Roll whether any event fires this turn
  if (rng() >= eventChance) return [];

  const playerId = state.empires.playerId;

  // ── Step 1: select a category by weight ───────────────────────────────────
  const categories = Object.keys(CATEGORY_WEIGHTS) as GameEventCategory[];
  const categoryItems = categories.map((cat) => ({
    category: cat,
    weight: CATEGORY_WEIGHTS[cat],
  }));

  const totalCatWeight = categoryItems.reduce((s, c) => s + c.weight, 0);
  let catRoll = rng() * totalCatWeight;
  let selectedCategory: GameEventCategory = 'disasters'; // fallback
  for (const ci of categoryItems) {
    catRoll -= ci.weight;
    if (catRoll <= 0) {
      selectedCategory = ci.category;
      break;
    }
  }

  // ── Step 2: collect eligible events from that category ────────────────────
  const eligible = ALL_EVENTS.filter((ev) => {
    if (ev.category !== selectedCategory) return false;
    if (turn < ev.min_turn) return false;
    if (!meetsGalaxyRequirement(state, playerId, ev.galaxy_requirement)) return false;

    // Check cooldown: event hasn't fired within MIN_TURNS_BETWEEN_SAME_EVENT
    const lastFired = state.activeEvents.find((ae) => ae.type === ev.id)?.startTurn;
    if (lastFired !== undefined && turn - lastFired < MIN_TURNS_BETWEEN_SAME_EVENT) {
      return false;
    }

    return true;
  });

  if (eligible.length === 0) return [];

  // ── Step 3: weighted pick from eligible pool ──────────────────────────────
  const chosen = weightedChoice(eligible, rng);
  if (!chosen) return [];

  return [chosen];
}

/**
 * Apply a single GameEvent to the game state.
 *
 * Dispatches the event's effect and adds a notification to ui.notifications.
 * Multi-turn events are added to state.activeEvents for later processing.
 */
export function applyGameEvent(
  state: GameState,
  event: GameEvent,
  targetPlanetId?: PlanetId,
  rng: () => number = Math.random,
): GameState {
  let next = state;
  const playerId = state.empires.playerId;

  // Resolve target planet (best-effort; may be undefined for empire-wide events)
  const resolvedPlanetId = targetPlanetId ?? selectTargetPlanet(next, playerId);

  // Apply effect to state based on effect type
  next = dispatchEffect(next, event, resolvedPlanetId, playerId, rng);

  // Add notification
  const priority = deriveNotificationPriority(event);
  const notifType: NotificationType = 'event';

  const notification = {
    id: nextNotifId(),
    type: notifType,
    priority,
    title: event.name,
    message: event.description,
    actions: [] as Array<{ label: string; actionType: string }>,
    dismissable: true,
    autoDismiss: null as number | null,
    timestamp: state.turn,
  };

  next = {
    ...next,
    ui: {
      ...next.ui,
      notifications: [...next.ui.notifications, notification],
    },
  };

  return next;
}

/**
 * Process all random events for the current turn.
 * Rolls and applies any triggered events.
 */
export function processRandomEvents(
  state: GameState,
  rng: () => number = Math.random,
): GameState {
  const events = rollRandomEvents(state, rng);
  let next = state;
  for (const ev of events) {
    next = applyGameEvent(next, ev, undefined, rng);
  }
  return next;
}

/**
 * Tick all active multi-turn events.
 * Called once per turn to process ongoing effects (plague damage, comet countdown, etc.).
 *
 * Design doc: random-events.md §Duration Fields Summary
 */
export function tickActiveEvents(
  state: GameState,
  rng: () => number = Math.random,
): { state: GameState; events: TurnEvent[] } {
  // Handle missing activeEvents field for backward compatibility
  if (!state.activeEvents || !Array.isArray(state.activeEvents)) {
    return { state, events: [] };
  }

  let next = state;
  const turnEvents: TurnEvent[] = [];
  const expiredEvents: string[] = [];
  const playerId = state.empires.playerId;

  for (const activeEvent of next.activeEvents) {
    switch (activeEvent.type) {
      case 'plague': {
        const result = tickPlague(next, activeEvent, playerId, rng);
        next = result.state;
        turnEvents.push(...result.events);
        if (result.expired) expiredEvents.push(activeEvent.id);
        break;
      }
      case 'comet': {
        const result = tickComet(next, activeEvent, playerId);
        next = result.state;
        turnEvents.push(...result.events);
        if (result.expired) expiredEvents.push(activeEvent.id);
        break;
      }
      case 'supernova': {
        const result = tickSupernova(next, activeEvent, playerId);
        next = result.state;
        turnEvents.push(...result.events);
        if (result.expired) expiredEvents.push(activeEvent.id);
        break;
      }
      case 'computer_virus': {
        const result = tickComputerVirus(next, activeEvent, playerId);
        next = result.state;
        if (result.expired) expiredEvents.push(activeEvent.id);
        break;
      }
      case 'scientist_recruitment':
      case 'leader_emergence':
      case 'fertile_planet_growth': {
        // Check if duration expired
        if (activeEvent.endTurn !== null && next.turn >= activeEvent.endTurn) {
          expiredEvents.push(activeEvent.id);
        }
        break;
      }
      default:
        // Piracy and rebellion need special resolution via player actions
        break;
    }
  }

  // Remove expired events
  next = {
    ...next,
    activeEvents: next.activeEvents.filter((ae) => !expiredEvents.includes(ae.id)),
  };

  return { state: next, events: turnEvents };
}

/**
 * Move all roaming monsters toward the nearest colony.
 * Cosmic Blob and Crystal Horror roam; Void Wyrm guards its treasure location.
 *
 * Design doc: random-events.md §Space Monsters §Behavior
 */
export function moveRoamingMonsters(state: GameState): { state: GameState; events: TurnEvent[] } {
  // Handle missing monsters field for backward compatibility
  if (!state.monsters || !Array.isArray(state.monsters)) {
    return { state, events: [] };
  }

  let next = state;
  const turnEvents: TurnEvent[] = [];

  const updatedMonsters: SpaceMonster[] = [];

  for (const monster of next.monsters) {
    const stats = MONSTER_STATS[monster.type];

    // Only roaming monsters move
    if (!stats.isRoaming) {
      updatedMonsters.push(monster);
      continue;
    }

    // Find nearest colonized system
    const nearestSystemId = findNearestColonizedSystem(next, monster.systemId);
    if (!nearestSystemId) {
      updatedMonsters.push(monster);
      continue;
    }

    // Check if monster can reach target this turn (based on movement)
    const dist = systemDistance(next, monster.systemId, nearestSystemId);
    let newSystemId = monster.systemId;

    if (dist <= stats.movement) {
      // Monster arrives at target system
      newSystemId = nearestSystemId;

      // Check if there's a colony to attack
      const targetPlanet = next.planets.allIds
        .map((pid) => next.planets.byId[pid])
        .find((p) => p?.systemId === nearestSystemId && p.isColonized);

      if (targetPlanet) {
        turnEvents.push({
          type: 'random_event',
          title: `${stats.name} Attacks!`,
          description: `The ${stats.name} has arrived at ${targetPlanet.name} and is attacking!`,
          empireId: targetPlanet.ownerId,
          systemId: nearestSystemId,
          planetId: targetPlanet.id,
          combatId: null,
          techId: null,
          designId: null,
          turn: next.turn,
        });
      }
    } else {
      // Monster moves toward target (simplified: move to intermediate position)
      // In a full implementation, this would update coordinates along the path
      // For now, we track system-level movement by finding nearest system in direction
      const systemsInRange = findSystemsInRange(next, monster.systemId, stats.movement);
      let bestSystem = monster.systemId;
      let bestDist = dist;

      for (const sysId of systemsInRange) {
        const distToTarget = systemDistance(next, sysId, nearestSystemId);
        if (distToTarget < bestDist) {
          bestDist = distToTarget;
          bestSystem = sysId;
        }
      }

      newSystemId = bestSystem;

      if (newSystemId !== monster.systemId) {
        turnEvents.push({
          type: 'random_event',
          title: `${stats.name} Moving`,
          description: `The ${stats.name} is moving toward the nearest colony.`,
          empireId: null,
          systemId: newSystemId,
          planetId: null,
          combatId: null,
          techId: null,
          designId: null,
          turn: next.turn,
        });
      }
    }

    // Apply regeneration for Cosmic Blob
    let newHp = monster.hp;
    if (monster.type === 'cosmic_blob') {
      newHp = Math.min(monster.maxHp, monster.hp + MONSTER_STATS.cosmic_blob.regenerationPerRound);
    }

    updatedMonsters.push({
      ...monster,
      systemId: newSystemId,
      hp: newHp,
    });
  }

  next = {
    ...next,
    monsters: updatedMonsters,
  };

  return { state: next, events: turnEvents };
}

/**
 * Resolve the Ancient Derelict choice event.
 * Player can choose to salvage for BC or board and explore.
 *
 * Design doc: random-events.md §Ancient Derelict
 *
 * Options:
 *   - 'salvage': 100% chance of 200-800 BC
 *   - 'board': 60% tech discovery, 25% nothing, 15% trap (lose crew)
 */
/**
 * Derelict choice outcome types.
 */
export type DerelictOutcome = 'bc_gain' | 'tech_discovery' | 'nothing' | 'trap';

/**
 * Result of resolving an Ancient Derelict choice.
 */
export interface DerelictChoiceResult {
  state: GameState;
  outcome: DerelictOutcome;
  details: {
    bcGained?: number;
    techDiscovered?: string;
    casualtiesLost?: number;
  };
}

export function resolveDerelictChoice(
  state: GameState,
  choice: 'salvage' | 'board',
  rng: () => number = Math.random,
): DerelictChoiceResult {
  let next = state;
  const playerId = state.empires.playerId;
  const empire = next.empires.byId[playerId];
  if (!empire) {
    return { state: next, outcome: 'nothing', details: {} };
  }

  if (choice === 'salvage') {
    // Guaranteed BC gain: 200-800
    const bcGained = Math.floor(rng() * 601) + 200;
    next = {
      ...next,
      empires: {
        ...next.empires,
        byId: {
          ...next.empires.byId,
          [playerId]: { ...empire, credits: empire.credits + bcGained },
        },
      },
    };
    return { state: next, outcome: 'bc_gain', details: { bcGained } };
  }

  // Board and explore: 60% tech, 25% nothing, 15% trap
  const roll = rng();

  if (roll < 0.60) {
    // Tech discovery - pick a random tech from a field the player doesn't have
    const techFields: TechField[] = [
      'weapons',
      'propulsion',
      'construction',
      'computers',
      'force_fields',
      'biotechnology',
    ];
    const randomField = techFields[Math.floor(rng() * techFields.length)];
    const techDiscovered = `${randomField}_derelict_discovery`;

    // Add the tech to completed techs
    next = {
      ...next,
      empires: {
        ...next.empires,
        byId: {
          ...next.empires.byId,
          [playerId]: {
            ...empire,
            research: {
              ...empire.research,
              completedTechs: [...empire.research.completedTechs, techDiscovered],
            },
          },
        },
      },
    };

    return { state: next, outcome: 'tech_discovery', details: { techDiscovered } };
  } else if (roll < 0.85) {
    // Nothing found
    return { state: next, outcome: 'nothing', details: {} };
  } else {
    // Trap - lose 5% population on a random colony
    const targetPlanetId = selectTargetPlanet(state, playerId);
    let casualtiesLost = 0;

    if (targetPlanetId) {
      const planet = state.planets.byId[targetPlanetId];
      if (planet) {
        casualtiesLost = Math.floor(planet.population * 0.05);
        next = {
          ...next,
          planets: {
            ...next.planets,
            byId: {
              ...next.planets.byId,
              [targetPlanetId]: {
                ...planet,
                population: Math.max(1, planet.population - casualtiesLost),
              },
            },
          },
        };
      }
    }

    return { state: next, outcome: 'trap', details: { casualtiesLost } };
  }
}

// ── Multi-turn event tick functions ───────────────────────────────────────────

/**
 * Tick plague event: apply population loss and check for spread.
 * Design doc: random-events.md §Plague
 */
function tickPlague(
  state: GameState,
  activeEvent: ActiveEvent,
  playerId: EmpireId,
  rng: () => number,
): { state: GameState; events: TurnEvent[]; expired: boolean } {
  let next = state;
  const events: TurnEvent[] = [];

  const targetPlanetId = activeEvent.targetPlanetId;
  if (!targetPlanetId) return { state: next, events, expired: true };

  const planet = next.planets.byId[targetPlanetId];
  if (!planet?.isColonized) return { state: next, events, expired: true };

  // Check for mitigation
  const mitigation = getPlagueMitigation(next, playerId);

  if (mitigation.cured) {
    // Bio Toxin Antidote cures immediately
    events.push({
      type: 'random_event',
      title: 'Plague Cured!',
      description: `Bio Toxin Antidote has cured the plague on ${planet.name}.`,
      empireId: playerId,
      systemId: planet.systemId,
      planetId: targetPlanetId,
      combatId: null,
      techId: null,
      designId: null,
      turn: next.turn,
    });
    return { state: next, events, expired: true };
  }

  // Calculate population loss (10-20% per turn, reduced by Soil Enrichment)
  const lossRange = activeEvent.data['populationLossPercent'] as { min: number; max: number } | undefined;
  const minLoss = lossRange?.min ?? 10;
  const maxLoss = lossRange?.max ?? 20;
  let lossPercent = (rng() * (maxLoss - minLoss) + minLoss) / 100;

  // Apply death rate reduction from Soil Enrichment
  lossPercent *= 1 - mitigation.deathRateReduction;

  const populationLoss = Math.floor(planet.population * lossPercent);
  const newPopulation = Math.max(0, planet.population - populationLoss);

  next = {
    ...next,
    planets: {
      ...next.planets,
      byId: {
        ...next.planets.byId,
        [targetPlanetId]: { ...planet, population: newPopulation },
      },
    },
  };

  events.push({
    type: 'random_event',
    title: 'Plague Continues',
    description: `The plague on ${planet.name} has killed ${populationLoss} million.`,
    empireId: playerId,
    systemId: planet.systemId,
    planetId: targetPlanetId,
    combatId: null,
    techId: null,
    designId: null,
    turn: next.turn,
  });

  // Check for spread (25% chance to adjacent colonies within 3 parsecs)
  if (rng() < PLAGUE_SPREAD_CHANCE) {
    const nearbySystemIds = findSystemsInRange(next, planet.systemId, PLAGUE_SPREAD_RANGE_PARSECS);
    for (const sysId of nearbySystemIds) {
      const nearbyPlanets = next.planets.allIds
        .map((pid) => next.planets.byId[pid])
        .filter((p) => p?.systemId === sysId && p.isColonized && p.ownerId === playerId);

      for (const nearbyPlanet of nearbyPlanets) {
        if (!nearbyPlanet) continue;
        // Check if plague already active on this planet
        const alreadyInfected = next.activeEvents.some(
          (ae) => ae.type === 'plague' && ae.targetPlanetId === nearbyPlanet.id,
        );

        if (!alreadyInfected) {
          // Spread plague to this planet
          const newPlague: ActiveEvent = {
            id: nextActiveEventId(),
            type: 'plague',
            startTurn: next.turn,
            endTurn: next.turn + 3 + Math.floor(rng() * 3), // 3-5 turns
            targetPlanetId: nearbyPlanet.id,
            targetSystemId: nearbyPlanet.systemId,
            targetEmpireId: null,
            data: { populationLossPercent: { min: 10, max: 20 } },
          };

          next = {
            ...next,
            activeEvents: [...next.activeEvents, newPlague],
          };

          events.push({
            type: 'random_event',
            title: 'Plague Spreads!',
            description: `The plague has spread to ${nearbyPlanet.name}!`,
            empireId: playerId,
            systemId: nearbyPlanet.systemId,
            planetId: nearbyPlanet.id,
            combatId: null,
            techId: null,
            designId: null,
            turn: next.turn,
          });
          break; // Only spread to one planet per turn
        }
      }
    }
  }

  // Check if duration expired (apply Atmospheric Terraforming reduction)
  let endTurn = activeEvent.endTurn;
  if (mitigation.durationReduction > 0 && endTurn !== null) {
    const originalDuration = endTurn - activeEvent.startTurn;
    const reducedDuration = Math.ceil(originalDuration * (1 - mitigation.durationReduction));
    endTurn = activeEvent.startTurn + reducedDuration;
  }

  const expired = endTurn !== null && next.turn >= endTurn;

  if (expired) {
    events.push({
      type: 'random_event',
      title: 'Plague Ends',
      description: `The plague on ${planet.name} has finally run its course.`,
      empireId: playerId,
      systemId: planet.systemId,
      planetId: targetPlanetId,
      combatId: null,
      techId: null,
      designId: null,
      turn: next.turn,
    });
  }

  return { state: next, events, expired };
}

/**
 * Tick comet event: countdown and check for interception.
 * Design doc: random-events.md §Comet
 */
function tickComet(
  state: GameState,
  activeEvent: ActiveEvent,
  playerId: EmpireId,
): { state: GameState; events: TurnEvent[]; expired: boolean } {
  let next = state;
  const events: TurnEvent[] = [];

  const targetPlanetId = activeEvent.targetPlanetId;
  if (!targetPlanetId) return { state: next, events, expired: true };

  const planet = next.planets.byId[targetPlanetId];
  if (!planet?.isColonized) return { state: next, events, expired: true };

  const turnsRemaining = (activeEvent.endTurn ?? next.turn) - next.turn;
  const cometHp = (activeEvent.data['cometHp'] as number) ?? COMET_HP;

  // Check for fleet interception (fleet in system damages comet)
  const fleetsInSystem = next.fleets.allIds
    .map((fid) => next.fleets.byId[fid])
    .filter((f) => f?.systemId === planet.systemId && f.ownerId === playerId);

  let totalDamage = 0;
  for (const fleet of fleetsInSystem) {
    if (!fleet) continue;
    // Calculate fleet damage output (simplified: sum ship attack values)
    for (const shipId of fleet.shipIds) {
      const ship = next.ships.byId[shipId];
      if (ship) {
        // Use a base damage estimate per ship
        totalDamage += 50; // Placeholder - full impl would use combat stats
      }
    }
  }

  const newCometHp = Math.max(0, cometHp - totalDamage);

  if (newCometHp <= 0) {
    // Comet destroyed!
    events.push({
      type: 'random_event',
      title: 'Comet Destroyed!',
      description: `Your fleet has successfully destroyed the comet threatening ${planet.name}!`,
      empireId: playerId,
      systemId: planet.systemId,
      planetId: targetPlanetId,
      combatId: null,
      techId: null,
      designId: null,
      turn: next.turn,
    });
    return { state: next, events, expired: true };
  }

  // Update comet HP in event data
  const updatedEvent: ActiveEvent = {
    ...activeEvent,
    data: { ...activeEvent.data, cometHp: newCometHp },
  };
  next = {
    ...next,
    activeEvents: next.activeEvents.map((ae) => (ae.id === activeEvent.id ? updatedEvent : ae)),
  };

  if (turnsRemaining <= 0) {
    // Comet impacts! Colony destroyed.
    events.push({
      type: 'random_event',
      title: 'Colony Destroyed!',
      description: `The comet has impacted ${planet.name}. The colony has been completely destroyed.`,
      empireId: playerId,
      systemId: planet.systemId,
      planetId: targetPlanetId,
      combatId: null,
      techId: null,
      designId: null,
      turn: next.turn,
    });

    // Destroy the colony
    next = {
      ...next,
      planets: {
        ...next.planets,
        byId: {
          ...next.planets.byId,
          [targetPlanetId]: {
            ...planet,
            population: 0,
            factories: 0,
            isColonized: false,
            ownerId: null,
          },
        },
      },
    };

    // Remove planet from empire's planets list
    const empire = next.empires.byId[playerId];
    if (empire) {
      next = {
        ...next,
        empires: {
          ...next.empires,
          byId: {
            ...next.empires.byId,
            [playerId]: {
              ...empire,
              planets: empire.planets.filter((pid) => pid !== targetPlanetId),
            },
          },
        },
      };
    }

    return { state: next, events, expired: true };
  }

  // Countdown warning
  events.push({
    type: 'random_event',
    title: 'Comet Approaching',
    description: `${turnsRemaining} turns until comet impacts ${planet.name}. Comet HP: ${newCometHp}/${COMET_HP}`,
    empireId: playerId,
    systemId: planet.systemId,
    planetId: targetPlanetId,
    combatId: null,
    techId: null,
    designId: null,
    turn: next.turn,
  });

  return { state: next, events, expired: false };
}

/**
 * Tick supernova event: countdown warning, then destroy system.
 * Design doc: random-events.md §Supernova
 */
function tickSupernova(
  state: GameState,
  activeEvent: ActiveEvent,
  playerId: EmpireId,
): { state: GameState; events: TurnEvent[]; expired: boolean } {
  let next = state;
  const events: TurnEvent[] = [];

  const targetSystemId = activeEvent.targetSystemId;
  if (!targetSystemId) return { state: next, events, expired: true };

  const system = next.galaxy.systems.byId[targetSystemId];
  if (!system) return { state: next, events, expired: true };

  const turnsRemaining = (activeEvent.endTurn ?? next.turn) - next.turn;

  if (turnsRemaining <= 0) {
    // Supernova detonates! Destroy all planets in system.
    events.push({
      type: 'random_event',
      title: 'SUPERNOVA!',
      description: `The star in ${system.name} has gone supernova! All planets and ships in the system have been destroyed.`,
      empireId: playerId,
      systemId: targetSystemId,
      planetId: null,
      combatId: null,
      techId: null,
      designId: null,
      turn: next.turn,
    });

    // Destroy all planets in system
    for (const planetId of system.planetIds) {
      const planet = next.planets.byId[planetId];
      if (planet) {
        next = {
          ...next,
          planets: {
            ...next.planets,
            byId: {
              ...next.planets.byId,
              [planetId]: {
                ...planet,
                population: 0,
                factories: 0,
                isColonized: false,
                ownerId: null,
                type: 'dead', // System becomes uninhabitable
              },
            },
          },
        };

        // Remove planet from owner's planet list
        if (planet.ownerId) {
          const empire = next.empires.byId[planet.ownerId];
          if (empire) {
            next = {
              ...next,
              empires: {
                ...next.empires,
                byId: {
                  ...next.empires.byId,
                  [planet.ownerId]: {
                    ...empire,
                    planets: empire.planets.filter((pid) => pid !== planetId),
                  },
                },
              },
            };
          }
        }
      }
    }

    // Destroy all ships in system
    const shipsInSystem = next.ships.allIds.filter((shipId) => {
      const ship = next.ships.byId[shipId];
      if (!ship) return false;
      const fleet = next.fleets.byId[ship.fleetId];
      return fleet?.systemId === targetSystemId;
    });

    for (const shipId of shipsInSystem) {
      const ship = next.ships.byId[shipId];
      if (ship) {
        // Remove ship from ships
        const { [shipId]: _removed, ...remainingShips } = next.ships.byId;
        next = {
          ...next,
          ships: {
            byId: remainingShips,
            allIds: next.ships.allIds.filter((sid) => sid !== shipId),
          },
        };
      }
    }

    return { state: next, events, expired: true };
  }

  // Countdown warning
  events.push({
    type: 'random_event',
    title: 'Supernova Warning',
    description: `${turnsRemaining} turns until supernova in ${system.name}! Evacuate immediately!`,
    empireId: playerId,
    systemId: targetSystemId,
    planetId: null,
    combatId: null,
    techId: null,
    designId: null,
    turn: next.turn,
  });

  return { state: next, events, expired: false };
}

/**
 * Tick computer virus event: apply research/production penalties.
 * Design doc: random-events.md §Computer Virus
 */
function tickComputerVirus(
  state: GameState,
  activeEvent: ActiveEvent,
  playerId: EmpireId,
): { state: GameState; expired: boolean } {
  // Computer virus effects are applied during production/research phases
  // Here we just check if the duration has expired

  const mitigation = getComputerVirusMitigation(state, playerId);

  let endTurn = activeEvent.endTurn;
  if (mitigation.durationReduction > 0 && endTurn !== null) {
    const originalDuration = endTurn - activeEvent.startTurn;
    const reducedDuration = Math.ceil(originalDuration * (1 - mitigation.durationReduction));
    endTurn = activeEvent.startTurn + reducedDuration;
  }

  const expired = endTurn !== null && state.turn >= endTurn;

  return { state, expired };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Derive notification priority based on event type. */
function deriveNotificationPriority(
  event: GameEvent,
): 'critical' | 'important' | 'info' {
  switch (event.type) {
    case 'disaster':
    case 'monster':
      return event.id === 'supernova' || event.id === 'comet' ? 'critical' : 'important';
    case 'diplomatic':
      return event.id === 'rebellion' ? 'critical' : 'important';
    case 'discovery':
    case 'opportunity':
      return 'info';
    default:
      return 'info';
  }
}

/**
 * Dispatch an event's effect, returning an updated GameState.
 * Instant effects are applied directly; multi-turn events are added to activeEvents.
 */
function dispatchEffect(
  state: GameState,
  event: GameEvent,
  targetPlanetId: PlanetId | undefined | null,
  playerId: EmpireId,
  rng: () => number,
): GameState {
  const effectType = event.effects['type'] as string | undefined;

  switch (effectType) {
    case 'bc_gain':
      return applyBcGain(state, event, playerId, rng);

    case 'instant_damage':
      return applyInstantDamage(state, event, targetPlanetId ?? undefined, rng);

    case 'planet_modifier':
      return applyPlanetModifier(state, event, targetPlanetId ?? undefined);

    case 'spawn_monster':
      return spawnMonster(state, event, playerId, rng);

    case 'plague':
      return startPlague(state, event, targetPlanetId ?? undefined, playerId, rng);

    case 'comet':
      return startComet(state, event, targetPlanetId ?? undefined, playerId);

    case 'supernova':
      return startSupernova(state, event, playerId, rng);

    case 'empire_debuff':
      return startComputerVirus(state, event, playerId, rng);

    case 'discovery_choice':
      // Choice-based event - notification is added, player must choose
      // The actual resolution happens via resolveDerelictChoice()
      return state;

    case 'piracy':
    case 'rebellion':
    case 'research_bonus':
    case 'empire_wide_bonus':
    case 'diplomatic_penalty':
      // These need more complex implementation
      // For now, add to activeEvents for tracking
      return addGenericActiveEvent(state, event, targetPlanetId ?? undefined, playerId, rng);

    default:
      return state;
  }
}

/** Apply an immediate BC gain to the player empire. */
function applyBcGain(
  state: GameState,
  event: GameEvent,
  playerId: EmpireId,
  rng: () => number,
): GameState {
  const empire = state.empires.byId[playerId];
  if (!empire) return state;

  const minBc = (event.effects['min'] as number | undefined) ?? 100;
  const maxBc = (event.effects['max'] as number | undefined) ?? 500;
  const gain = Math.floor(rng() * (maxBc - minBc + 1)) + minBc;

  return {
    ...state,
    empires: {
      ...state.empires,
      byId: {
        ...state.empires.byId,
        [playerId]: { ...empire, credits: empire.credits + gain },
      },
    },
  };
}

/** Apply instant factory/population damage to a target planet. */
function applyInstantDamage(
  state: GameState,
  event: GameEvent,
  targetPlanetId: PlanetId | undefined,
  rng: () => number,
): GameState {
  if (!targetPlanetId) return state;
  const planet = state.planets.byId[targetPlanetId];
  if (!planet) return state;

  const effects = event.effects;

  // factories_destroyed
  let factories = planet.factories;
  const fdRange = effects['factories_destroyed'] as { min: number; max: number } | undefined;
  if (fdRange) {
    const destroyed = Math.floor(rng() * (fdRange.max - fdRange.min + 1)) + fdRange.min;
    factories = Math.max(0, factories - destroyed);
  }

  // population_killed_percent
  let population = planet.population;
  const pkRange = effects['population_killed_percent'] as { min: number; max: number } | undefined;
  if (pkRange) {
    const pct = (rng() * (pkRange.max - pkRange.min) + pkRange.min) / 100;
    population = Math.max(0, Math.floor(population * (1 - pct)));
  }

  // pollution_added
  let waste = planet.waste;
  const paRange = effects['pollution_added'] as { min: number; max: number } | undefined;
  if (paRange) {
    const added = Math.floor(rng() * (paRange.max - paRange.min + 1)) + paRange.min;
    waste += added;
  }

  return {
    ...state,
    planets: {
      ...state.planets,
      byId: {
        ...state.planets.byId,
        [targetPlanetId]: { ...planet, factories, population, waste },
      },
    },
  };
}

/** Apply a permanent or semi-permanent modifier to a planet. */
function applyPlanetModifier(
  state: GameState,
  event: GameEvent,
  targetPlanetId: PlanetId | undefined,
): GameState {
  if (!targetPlanetId) return state;
  const planet = state.planets.byId[targetPlanetId];
  if (!planet) return state;

  const permanent = event.effects['permanent'] as Record<string, number> | undefined;
  if (!permanent) return state;

  let updatedPlanet = { ...planet };

  // production_modifier → boost maxFactories as a proxy for production capacity
  if (permanent['production_modifier'] !== undefined) {
    const mod = permanent['production_modifier'] as number;
    updatedPlanet = {
      ...updatedPlanet,
      maxFactories: Math.floor(updatedPlanet.maxFactories * mod),
    };
  }

  // max_population_modifier
  if (permanent['max_population_modifier'] !== undefined) {
    const mod = permanent['max_population_modifier'] as number;
    updatedPlanet = {
      ...updatedPlanet,
      maxPopulation: Math.floor(updatedPlanet.maxPopulation * mod),
    };
  }

  // resource_level_downgrade → flip isRich / isPoor flags one step
  if (permanent['resource_level_downgrade'] !== undefined) {
    if (updatedPlanet.isRich) {
      updatedPlanet = { ...updatedPlanet, isRich: false };
    } else if (!updatedPlanet.isPoor) {
      updatedPlanet = { ...updatedPlanet, isPoor: true };
    }
  }

  return {
    ...state,
    planets: {
      ...state.planets,
      byId: { ...state.planets.byId, [targetPlanetId]: updatedPlanet },
    },
  };
}

/**
 * Spawn a space monster.
 * Design doc: random-events.md §Space Monsters
 */
function spawnMonster(
  state: GameState,
  event: GameEvent,
  playerId: EmpireId,
  _rng: () => number,
): GameState {
  const monsterId = event.effects['monster_id'] as string | undefined;
  if (!monsterId) return state;

  const monsterType = monsterId as 'cosmic_blob' | 'crystal_horror' | 'void_wyrm';
  const stats = MONSTER_STATS[monsterType];
  if (!stats) return state;

  // Find spawn location
  const spawnSystemId = selectMonsterSpawnSystem(state, playerId, 5);
  if (!spawnSystemId) return state;

  const monster: SpaceMonster = {
    id: nextMonsterId(),
    type: monsterType,
    systemId: spawnSystemId,
    hp: stats.hp,
    maxHp: stats.hp,
    isRoaming: stats.isRoaming,
    spawnTurn: state.turn,
  };

  return {
    ...state,
    monsters: [...state.monsters, monster],
  };
}

/**
 * Start a plague event.
 * Design doc: random-events.md §Plague
 */
function startPlague(
  state: GameState,
  event: GameEvent,
  targetPlanetId: PlanetId | undefined,
  playerId: EmpireId,
  rng: () => number,
): GameState {
  const planetId = targetPlanetId ?? selectTargetPlanet(state, playerId);
  if (!planetId) return state;

  const planet = state.planets.byId[planetId];
  if (!planet?.isColonized) return state;

  // Duration: 3-5 turns
  const durationRange = event.duration_turns as { min: number; max: number } | undefined;
  const minDuration = durationRange?.min ?? 3;
  const maxDuration = durationRange?.max ?? 5;
  const duration = minDuration + Math.floor(rng() * (maxDuration - minDuration + 1));

  const activeEvent: ActiveEvent = {
    id: nextActiveEventId(),
    type: 'plague',
    startTurn: state.turn,
    endTurn: state.turn + duration,
    targetPlanetId: planetId,
    targetSystemId: planet.systemId,
    targetEmpireId: null,
    data: {
      populationLossPercent: event.effects['population_loss_percent_per_turn'] ?? { min: 10, max: 20 },
    },
  };

  return {
    ...state,
    activeEvents: [...state.activeEvents, activeEvent],
  };
}

/**
 * Start a comet event.
 * Design doc: random-events.md §Comet
 */
function startComet(
  state: GameState,
  _event: GameEvent,
  targetPlanetId: PlanetId | undefined,
  playerId: EmpireId,
): GameState {
  const planetId = targetPlanetId ?? selectTargetPlanet(state, playerId);
  if (!planetId) return state;

  const planet = state.planets.byId[planetId];
  if (!planet?.isColonized) return state;

  const activeEvent: ActiveEvent = {
    id: nextActiveEventId(),
    type: 'comet',
    startTurn: state.turn,
    endTurn: state.turn + COMET_WARNING_TURNS,
    targetPlanetId: planetId,
    targetSystemId: planet.systemId,
    targetEmpireId: null,
    data: {
      cometHp: COMET_HP,
      warningTurns: COMET_WARNING_TURNS,
    },
  };

  return {
    ...state,
    activeEvents: [...state.activeEvents, activeEvent],
  };
}

/**
 * Start a supernova event.
 * Design doc: random-events.md §Supernova
 */
function startSupernova(
  state: GameState,
  _event: GameEvent,
  playerId: EmpireId,
  rng: () => number,
): GameState {
  // Select a random owned system (not homeworld)
  const empire = state.empires.byId[playerId];
  if (!empire) return state;

  const eligibleSystems: SystemId[] = [];
  for (const planetId of empire.planets) {
    const planet = state.planets.byId[planetId];
    if (planet?.isColonized && !planet.isHomeworld) {
      if (!eligibleSystems.includes(planet.systemId)) {
        eligibleSystems.push(planet.systemId);
      }
    }
  }

  if (eligibleSystems.length === 0) return state;

  const targetSystemId = eligibleSystems[Math.floor(rng() * eligibleSystems.length)];
  if (!targetSystemId) return state;

  const activeEvent: ActiveEvent = {
    id: nextActiveEventId(),
    type: 'supernova',
    startTurn: state.turn,
    endTurn: state.turn + 5, // 5 turns warning
    targetPlanetId: null,
    targetSystemId,
    targetEmpireId: null,
    data: { warningTurns: 5 },
  };

  return {
    ...state,
    activeEvents: [...state.activeEvents, activeEvent],
  };
}

/**
 * Start a computer virus event.
 * Design doc: random-events.md §Computer Virus
 */
function startComputerVirus(
  state: GameState,
  event: GameEvent,
  playerId: EmpireId,
  rng: () => number,
): GameState {
  // Duration: 5-10 turns
  const durationRange = event.effects['duration_turns'] as { min: number; max: number } | undefined;
  const minDuration = durationRange?.min ?? 5;
  const maxDuration = durationRange?.max ?? 10;
  const duration = minDuration + Math.floor(rng() * (maxDuration - minDuration + 1));

  const activeEvent: ActiveEvent = {
    id: nextActiveEventId(),
    type: 'computer_virus',
    startTurn: state.turn,
    endTurn: state.turn + duration,
    targetPlanetId: null,
    targetSystemId: null,
    targetEmpireId: playerId,
    data: {
      researchModifier: event.effects['research_output_modifier'] ?? 0.75,
      productionModifier: event.effects['production_modifier'] ?? 0.90,
    },
  };

  return {
    ...state,
    activeEvents: [...state.activeEvents, activeEvent],
  };
}

/**
 * Add a generic active event for tracking.
 */
function addGenericActiveEvent(
  state: GameState,
  event: GameEvent,
  targetPlanetId: PlanetId | undefined,
  _playerId: EmpireId,
  rng: () => number,
): GameState {
  const planet = targetPlanetId ? state.planets.byId[targetPlanetId] : null;

  // Calculate duration
  let duration = 0;
  const durationField = event.duration_turns;
  if (typeof durationField === 'number') {
    duration = durationField;
  } else if (durationField && typeof durationField === 'object') {
    const { min, max } = durationField;
    duration = min + Math.floor(rng() * (max - min + 1));
  }

  const activeEvent: ActiveEvent = {
    id: nextActiveEventId(),
    type: event.id as ActiveEvent['type'],
    startTurn: state.turn,
    endTurn: duration > 0 ? state.turn + duration : null,
    targetPlanetId: targetPlanetId ?? null,
    targetSystemId: planet?.systemId ?? null,
    targetEmpireId: null,
    data: { ...event.effects },
  };

  return {
    ...state,
    activeEvents: [...state.activeEvents, activeEvent],
  };
}

/**
 * Check if there's an active computer virus affecting the empire.
 * Used by production/research systems to apply penalties.
 */
export function getActiveComputerVirus(
  state: GameState,
  empireId: EmpireId,
): { researchModifier: number; productionModifier: number } | null {
  const virusEvent = state.activeEvents.find(
    (ae) => ae.type === 'computer_virus' && ae.targetEmpireId === empireId,
  );

  if (!virusEvent) return null;

  // Apply severity reduction from ECM Jammer V+
  const mitigation = getComputerVirusMitigation(state, empireId);

  let researchMod = (virusEvent.data['researchModifier'] as number) ?? 0.75;
  let productionMod = (virusEvent.data['productionModifier'] as number) ?? 0.90;

  if (mitigation.severityReduction > 0) {
    // Reduce the penalty (bring modifiers closer to 1.0)
    researchMod = 1 - (1 - researchMod) * (1 - mitigation.severityReduction);
    productionMod = 1 - (1 - productionMod) * (1 - mitigation.severityReduction);
  }

  return { researchModifier: researchMod, productionModifier: productionMod };
}

/**
 * Get the monster stats for a given monster type.
 * Exported for use by combat system.
 */
export function getMonsterStats(
  monsterType: 'cosmic_blob' | 'crystal_horror' | 'void_wyrm',
): (typeof MONSTER_STATS)[typeof monsterType] {
  return MONSTER_STATS[monsterType];
}

// ── Aliases for turn.ts compatibility ─────────────────────────────────────────

/**
 * Alias for tickActiveEvents — processes active multi-turn events.
 * Used by turn.ts phase 9.
 */
export const processActiveEvents = tickActiveEvents;

/**
 * Alias for moveRoamingMonsters — processes monster movement.
 * Used by turn.ts phase 9.
 */
export const processMonsterMovement = moveRoamingMonsters;
