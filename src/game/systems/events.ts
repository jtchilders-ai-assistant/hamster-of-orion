/**
 * Random Events System — pure TypeScript, NO DOM.
 * src/game/systems/events.ts
 *
 * Implements the random event system from design/game-mechanics/random-events.md.
 *
 * Three public entry points:
 *   rollRandomEvents(state, rng?)   — decide which events fire this turn
 *   applyGameEvent(state, event, targetPlanetId?) — apply one event to state
 *   processRandomEvents(state)      — roll + apply all events in one call
 *
 * All functions are pure: no mutation, returns new GameState objects.
 */

import { GameState, PlanetId, NotificationType, EmpireId } from '../state';
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

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_EVENT_CHANCE = 0.03;
const TURN_PROBABILITY_INCREMENT = 0.001;
const MAX_EVENT_CHANCE = 0.15;

// Legacy difficulty multiplier removed — now using getEventFrequencyMultiplier() from ./difficulty.

// Category weights from the design doc
const CATEGORY_WEIGHTS: Record<GameEventCategory, number> = {
  space_monsters: 15,
  discoveries: 25,
  disasters: 30,
  diplomatic: 15,
  opportunities: 15,
};

// ── Loaded event definitions ──────────────────────────────────────────────────

const ALL_EVENTS: GameEvent[] = eventsData.events as GameEvent[];

// ── Notification counter ──────────────────────────────────────────────────────
// Simple monotonic counter to guarantee unique notification IDs within a process.
let _notifSeq = 0;

function nextNotifId(): string {
  _notifSeq += 1;
  return `event-notif-${Date.now()}-${_notifSeq}`;
}

// ── Galaxy-state helper predicates ────────────────────────────────────────────

/**
 * Check whether the empire meets a galaxy_requirement string.
 * These are coarse checks; a full game would inspect colony counts, etc.
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
 *
 * @param state  Current game state.
 * @param rng    Optional RNG function (defaults to Math.random).
 *               Pass a seeded function for deterministic tests.
 */
export function rollRandomEvents(
  state: GameState,
  rng: () => number = Math.random,
): GameEvent[] {
  const turn = state.turn;
  // Use the difficulty system's event frequency multiplier
  const difficultyMultiplier = getEventFrequencyMultiplier(state.difficulty);

  const eventChance = Math.min(
    BASE_EVENT_CHANCE + turn * TURN_PROBABILITY_INCREMENT,
    MAX_EVENT_CHANCE,
  ) * difficultyMultiplier;

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
 * More complex multi-turn or choice-based effects are stubbed: they add the
 * notification but full effect resolution (e.g. comet countdown) is deferred
 * to the game loop / UI layer per the event's duration_turns field.
 *
 * @param state          Current game state.
 * @param event          The event to apply.
 * @param targetPlanetId Optional planet to target; if omitted, the system
 *                       picks the first colonised player planet.
 */
export function applyGameEvent(
  state: GameState,
  event: GameEvent,
  targetPlanetId?: PlanetId,
): GameState {
  let next = state;
  const playerId = state.empires.playerId;

  // Resolve target planet (best-effort; may be undefined for empire-wide events)
  const resolvedPlanetId = targetPlanetId ?? resolveTargetPlanet(state, playerId);

  // Apply effect to state based on effect type
  next = dispatchEffect(next, event, resolvedPlanetId, playerId);

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
export function processRandomEvents(state: GameState): GameState {
  const events = rollRandomEvents(state);
  let next = state;
  for (const ev of events) {
    next = applyGameEvent(next, ev);
  }
  return next;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Find the first colonised planet owned by the player empire. */
function resolveTargetPlanet(
  state: GameState,
  playerId: EmpireId,
): PlanetId | undefined {
  const empire = state.empires.byId[playerId];
  if (!empire) return undefined;
  return empire.planets.find((pid) => state.planets.byId[pid]?.isColonized);
}

/** Derive notification priority based on event type. */
function deriveNotificationPriority(
  event: GameEvent,
): 'critical' | 'important' | 'info' {
  switch (event.type) {
    case 'disaster':
    case 'monster':
      return event.id === 'supernova' || event.id === 'comet'
        ? 'critical'
        : 'important';
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
 *
 * Instant effects (bc_gain, planet damage, etc.) are applied directly.
 * Multi-turn and choice-required effects are noted via notification only —
 * their ongoing tick is handled by the game loop once the full event
 * tracking system is added (future task).
 */
function dispatchEffect(
  state: GameState,
  event: GameEvent,
  targetPlanetId: PlanetId | undefined,
  playerId: EmpireId,
): GameState {
  const effectType = event.effects['type'] as string | undefined;

  switch (effectType) {
    case 'bc_gain':
      return applyBcGain(state, event, playerId);

    case 'instant_damage':
      return applyInstantDamage(state, event, targetPlanetId);

    case 'planet_modifier':
      return applyPlanetModifier(state, event, targetPlanetId);

    // Deferred/complex effects: state is unchanged beyond the notification
    case 'spawn_monster':
    case 'plague':
    case 'comet':
    case 'supernova':
    case 'empire_debuff':
    case 'piracy':
    case 'rebellion':
    case 'research_bonus':
    case 'empire_wide_bonus':
    case 'diplomatic_penalty':
    case 'discovery_choice':
      // Full implementation deferred to event-tracking task; notification is added by caller
      return state;

    default:
      return state;
  }
}

/** Apply an immediate BC gain to the player empire. */
function applyBcGain(
  state: GameState,
  event: GameEvent,
  playerId: EmpireId,
): GameState {
  const empire = state.empires.byId[playerId];
  if (!empire) return state;

  const minBc = (event.effects['min'] as number | undefined) ?? 100;
  const maxBc = (event.effects['max'] as number | undefined) ?? 500;
  const gain = Math.floor(Math.random() * (maxBc - minBc + 1)) + minBc;

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
): GameState {
  if (!targetPlanetId) return state;
  const planet = state.planets.byId[targetPlanetId];
  if (!planet) return state;

  const effects = event.effects;

  // factories_destroyed
  let factories = planet.factories;
  const fdRange = effects['factories_destroyed'] as { min: number; max: number } | undefined;
  if (fdRange) {
    const destroyed = Math.floor(Math.random() * (fdRange.max - fdRange.min + 1)) + fdRange.min;
    factories = Math.max(0, factories - destroyed);
  }

  // population_killed_percent
  let population = planet.population;
  const pkRange = effects['population_killed_percent'] as { min: number; max: number } | undefined;
  if (pkRange) {
    const pct = (Math.random() * (pkRange.max - pkRange.min) + pkRange.min) / 100;
    population = Math.max(0, Math.floor(population * (1 - pct)));
  }

  // pollution_added
  let waste = planet.waste;
  const paRange = effects['pollution_added'] as { min: number; max: number } | undefined;
  if (paRange) {
    const added = Math.floor(Math.random() * (paRange.max - paRange.min + 1)) + paRange.min;
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
