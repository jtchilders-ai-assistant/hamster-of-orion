/**
 * Root reducer — pure TypeScript, NO DOM.
 * src/game/reducer.ts
 *
 * Delegates to sub-reducers by action type.
 */

import { Action } from './store';
import { GameState, ScreenType } from './state';
import { executeGroundCombat } from './systems/groundCombat';
import { turnReducer } from './actions/turn';
import { newGameReducer } from './actions/newGame';
import { fleetReducer, MOVE_FLEET, MERGE_FLEETS, SPLIT_FLEET, SCRAP_FLEET, PROCESS_FLEET_MOVEMENT, OPEN_FLEET_DEPLOYMENT, UPDATE_DEPLOYMENT_SHIPS, SET_DEPLOYMENT_DESTINATION, CANCEL_FLEET_DEPLOYMENT } from './actions/fleet';
import { colonize } from './systems/colonization';
import type { PlanetId, FleetId } from './state';

const FLEET_ACTIONS = new Set([
  MOVE_FLEET, MERGE_FLEETS, SPLIT_FLEET, SCRAP_FLEET, PROCESS_FLEET_MOVEMENT,
  OPEN_FLEET_DEPLOYMENT, UPDATE_DEPLOYMENT_SHIPS, SET_DEPLOYMENT_DESTINATION, CANCEL_FLEET_DEPLOYMENT,
]);

const VALID_SCREENS: ReadonlySet<string> = new Set<ScreenType>([
  'menu', 'new_game', 'galaxy', 'planet', 'planet_list', 'fleet', 'research',
  'diplomacy', 'ship_design', 'reports', 'council', 'combat', 'turn_summary',
  'ground_combat',
]);

export function rootReducer(state: GameState, action: Action): GameState {
  // Special: LOAD_STATE replaces entire state (used for debug injection)
  if (action.type === 'LOAD_STATE') {
    return action.payload as GameState;
  }

  // Screen navigation
  if (action.type === 'NAVIGATE') {
    const screen = (action.payload as { screen: string }).screen;
    if (!VALID_SCREENS.has(screen)) return state;
    return {
      ...state,
      currentScreen: screen as ScreenType,
      ui: {
        ...state.ui,
        previousScreen: state.currentScreen,
        currentScreen: screen as ScreenType,
      },
    };
  }

  // Star system selection
  if (action.type === 'SELECT_SYSTEM') {
    const { systemId } = action.payload as { systemId: string | null };
    return {
      ...state,
      ui: {
        ...state.ui,
        selectedSystem: systemId,
        // Clear sub-selections when switching systems
        selectedPlanet: null,
        selectedFleet: null,
        fleetDeploymentMode: null,
      },
    };
  }

  // Planet selection — navigates to planet screen
  if (action.type === 'SELECT_PLANET') {
    const { planetId } = action.payload as { planetId: string | null };
    return {
      ...state,
      currentScreen: 'planet' as const,
      ui: {
        ...state.ui,
        selectedPlanet: planetId,
        previousScreen: state.currentScreen,
        currentScreen: 'planet' as const,
      },
    };
  }

  // Fleet selection — also opens deployment mode for player fleets at rest
  if (action.type === 'SELECT_FLEET') {
    const { fleetId } = action.payload as { fleetId: string | null };
    if (!fleetId) {
      return { ...state, ui: { ...state.ui, selectedFleet: null, fleetDeploymentMode: null } };
    }
    const fleet = state.fleets.byId[fleetId];
    const isPlayerFleet = fleet?.ownerId === state.empires.playerId;
    const isAtRest = fleet && !fleet.destination;
    // Open deployment mode for player-owned fleets that aren't moving or in combat
    if (fleet && isPlayerFleet && isAtRest && !fleet.isInCombat) {
      const shipCount: Record<string, number> = {};
      for (const shipId of fleet.shipIds) {
        const ship = state.ships.byId[shipId];
        if (ship) {
          const designId = ship.designId;
          if (!(designId in shipCount)) {
            shipCount[designId] = fleet.shipIds.filter(
              (sid) => state.ships.byId[sid]?.designId === designId,
            ).length;
          }
        }
      }
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedFleet: fleetId,
          fleetDeploymentMode: { fleetId, ships: shipCount, destinationId: null },
        },
      };
    }
    return { ...state, ui: { ...state.ui, selectedFleet: fleetId } };
  }

  // Production slider update
  if (action.type === 'UPDATE_PRODUCTION') {
    const { planetId, sliders } = action.payload as {
      planetId: string;
      sliders: Partial<{
        ship: number;
        defense: number;
        industry: number;
        ecology: number;
        research: number;
      }>;
    };

    const planet = state.planets.byId[planetId];
    if (!planet) return state;

    const updated = {
      ...planet,
      production: {
        ship:     sliders.ship     ?? planet.production.ship,
        defense:  sliders.defense  ?? planet.production.defense,
        industry: sliders.industry ?? planet.production.industry,
        ecology:  sliders.ecology  ?? planet.production.ecology,
        research: sliders.research ?? planet.production.research,
      },
    };

    return {
      ...state,
      planets: {
        ...state.planets,
        byId: { ...state.planets.byId, [planetId]: updated },
      },
    };
  }

  // Lock / unlock slider flags (stored as ui hints; no planet state change needed)
  // These are purely UI-side; PlanetScreen tracks them locally.
  // We handle them here to keep the store as single source of truth if needed later.
  if (action.type === 'LOCK_SLIDER' || action.type === 'UNLOCK_SLIDER') {
    // No persistent state change for now — PlanetScreen manages lock state internally.
    return state;
  }

  // Route to sub-reducers
  if (action.type === 'NEXT_TURN') {
    return turnReducer(state, action);
  }

  if (action.type === 'START_GAME') {
    return newGameReducer(state, action);
  }

  // ── Ship Design CRUD ─────────────────────────────────────────────────────

  if (action.type === 'ADD_SHIP_DESIGN') {
    const design = (action.payload as { design: import('./state').ShipDesign }).design;
    const empireId = state.empires.playerId;
    const empire = state.empires.byId[empireId];
    if (!empire) return state;

    return {
      ...state,
      shipDesigns: {
        byId: { ...state.shipDesigns.byId, [design.id]: design },
        allIds: state.shipDesigns.allIds.includes(design.id)
          ? state.shipDesigns.allIds
          : [...state.shipDesigns.allIds, design.id],
      },
      empires: {
        ...state.empires,
        byId: {
          ...state.empires.byId,
          [empireId]: {
            ...empire,
            shipDesigns: empire.shipDesigns.includes(design.id)
              ? empire.shipDesigns
              : [...empire.shipDesigns, design.id],
          },
        },
      },
    };
  }

  if (action.type === 'DELETE_SHIP_DESIGN') {
    const { designId } = action.payload as { designId: string };
    const empireId = state.empires.playerId;
    const empire = state.empires.byId[empireId];

    const newById = { ...state.shipDesigns.byId };
    delete newById[designId];

    return {
      ...state,
      shipDesigns: {
        byId: newById,
        allIds: state.shipDesigns.allIds.filter((id) => id !== designId),
      },
      empires: empire
        ? {
            ...state.empires,
            byId: {
              ...state.empires.byId,
              [empireId]: {
                ...empire,
                shipDesigns: empire.shipDesigns.filter((id) => id !== designId),
              },
            },
          }
        : state.empires,
    };
  }

  // Colonize planet action
  // Show turn summary screen
  if (action.type === 'SHOW_TURN_SUMMARY') {
    return {
      ...state,
      currentScreen: 'turn_summary' as ScreenType,
      ui: {
        ...state.ui,
        previousScreen: state.currentScreen,
        currentScreen: 'turn_summary' as ScreenType,
      },
    };
  }

  if (action.type === 'COLONIZE_PLANET') {
    const { planetId, fleetId } = action.payload as {
      planetId: PlanetId;
      fleetId: FleetId;
    };

    try {
      // colonize() validates and performs the colonization
      const newState = colonize(fleetId, planetId, state);
      // Navigate to planet management screen for the new colony
      return {
        ...newState,
        currentScreen: 'planet' as ScreenType,
        ui: {
          ...newState.ui,
          currentScreen: 'planet' as ScreenType,
          selectedPlanet: planetId,
        },
      };
    } catch {
      // Colonization failed (preconditions not met) — return unchanged
      return state;
    }
  }

  // Fleet actions
  if (FLEET_ACTIONS.has(action.type)) {
    return fleetReducer(state, action);
  }

  // ── Research allocation / targeting ──────────────────────────────────────────
  //
  // These actions are dispatched by ResearchScreen and persist the player's
  // per-field allocation and research targets to the empire's ResearchState.

  if (action.type === 'SET_RESEARCH_ALLOCATION') {
    // Payload: { allocation: Record<string, number> }
    // The allocation record maps ResearchField keys to percentages (sum = 100).
    const { allocation } = action.payload as { allocation: Record<string, number> };
    const playerId = state.empires.playerId;
    const empire = state.empires.byId[playerId];
    if (!empire) return state;
    return {
      ...state,
      empires: {
        ...state.empires,
        byId: {
          ...state.empires.byId,
          [playerId]: {
            ...empire,
            research: {
              ...empire.research,
              fieldAllocation: allocation as import('./state').ResearchState['fieldAllocation'],
            },
          },
        },
      },
    };
  }

  if (action.type === 'SET_RESEARCH_CURRENT_TECH') {
    // Payload: { field: ResearchFieldKey, techId: string | null }
    const { field, techId } = action.payload as {
      field: string;
      techId: string | null;
    };
    const playerId = state.empires.playerId;
    const empire = state.empires.byId[playerId];
    if (!empire) return state;
    const prevFieldCurrentTech = empire.research.fieldCurrentTech ?? {};
    return {
      ...state,
      empires: {
        ...state.empires,
        byId: {
          ...state.empires.byId,
          [playerId]: {
            ...empire,
            research: {
              ...empire.research,
              // Also set the legacy currentTech if this field matches what was
              // previously tracked, so existing AI/system code still works.
              currentTech: techId ?? empire.research.currentTech,
              fieldCurrentTech: {
                ...prevFieldCurrentTech,
                [field]: techId,
              },
            },
          },
        },
      },
    };
  }

  // ── Ground Combat Result ────────────────────────────────────────────────
  //
  // Dispatched by GroundCombatScreen when combat concludes.
  // Delegates full state mutation to executeGroundCombat (which handles
  // planet capture, fleet troop depletion, empire planet list updates, etc.).

  if (action.type === 'GROUNDCOMBAT_RESULT') {
    const { attackerId, defenderId, planetId } = action.payload as {
      attackerId: string;
      defenderId: string;
      planetId: PlanetId;
    };
    try {
      return executeGroundCombat(state, attackerId, defenderId, planetId);
    } catch {
      // If preconditions aren't met (no fleet, no planet, etc.), return unchanged.
      return state;
    }
  }

  // Unknown action — return unchanged state
  return state;
}
