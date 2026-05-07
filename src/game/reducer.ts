/**
 * Root reducer — pure TypeScript, NO DOM.
 * src/game/reducer.ts
 *
 * Delegates to sub-reducers by action type.
 */

import { Action } from './store';
import { GameState, ScreenType } from './state';
import { executeGroundCombat } from './systems/groundCombat';
import { turnReducer, NEXT_TURN, SKIP_TURN_SUMMARY, SET_TURN_PHASE } from './actions/turn';
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
  'ground_combat', 'save_load', 'victory',
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
  if (action.type === NEXT_TURN || action.type === SKIP_TURN_SUMMARY || action.type === SET_TURN_PHASE) {
    return turnReducer(state, action);
  }

  if (action.type === 'START_GAME') {
    return newGameReducer(state, action);
  }

  // ── Ship Design CRUD ─────────────────────────────────────────────────────

  /** Maximum ship designs an empire may have simultaneously (per design/ships/ship-design.md). */
  const MAX_SHIP_DESIGNS = 6;

  if (action.type === 'ADD_SHIP_DESIGN') {
    const design = (action.payload as { design: import('./state').ShipDesign }).design;
    const empireId = state.empires.playerId;
    const empire = state.empires.byId[empireId];
    if (!empire) return state;

    // Enforce 6-design limit: if this design ID is NEW (not an edit/overwrite),
    // reject when the empire already has the maximum number of designs.
    const isNewDesign = !empire.shipDesigns.includes(design.id);
    if (isNewDesign && empire.shipDesigns.length >= MAX_SHIP_DESIGNS) {
      // Return state unchanged — UI layer is responsible for showing a message.
      return state;
    }

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

  // ── Camera pan ─────────────────────────────────────────────────────────────
  //
  // Dispatched by the keyboard handler (arrow keys) to scroll the galaxy map.
  // Payload: { dx: number; dy: number }  (pixel offsets in galaxy-coord space)

  if (action.type === 'PAN_CAMERA') {
    const { dx, dy } = action.payload as { dx: number; dy: number };
    return {
      ...state,
      ui: {
        ...state.ui,
        camera: {
          ...state.ui.camera,
          x: state.ui.camera.x + dx,
          y: state.ui.camera.y + dy,
        },
      },
    };
  }

  // ── Camera zoom ───────────────────────────────────────────────────────────
  //
  // Dispatched by the keyboard handler (+/-/0 keys) to zoom the galaxy map.
  // Payload: { delta: number } — positive = zoom in, negative = zoom out.
  // Pass delta=0 to reset zoom to 1.0.

  if (action.type === 'ZOOM_CAMERA') {
    const { delta } = action.payload as { delta: number };
    const ZOOM_MIN = 0.25;
    const ZOOM_MAX = 4.0;
    const newZoom =
      delta === 0
        ? 1.0
        : Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, state.ui.camera.zoom + delta));
    return {
      ...state,
      ui: {
        ...state.ui,
        camera: {
          ...state.ui.camera,
          zoom: newZoom,
          // Reset pan offset when resetting zoom so the view re-centres
          x: delta === 0 ? 0 : state.ui.camera.x,
          y: delta === 0 ? 0 : state.ui.camera.y,
        },
      },
    };
  }

  // ── Game speed setting ───────────────────────────────────────────────────
  //
  // SET_GAME_SPEED: Updates animation speed (slow, normal, fast).
  // Affects combat animations, map transitions, and other timed effects.

  if (action.type === 'SET_GAME_SPEED') {
    const { speed } = action.payload as { speed: import('./state').GameSpeed };
    return {
      ...state,
      gameSpeed: speed,
    };
  }

  // ── Galaxy Map Toggles (interaction-spec.md §2.2) ─────────────────────────
  //
  // Toggle display options for the galaxy map view.

  if (action.type === 'TOGGLE_GRID') {
    return {
      ...state,
      ui: {
        ...state.ui,
        settings: {
          ...state.ui.settings,
          showGrid: !state.ui.settings.showGrid,
        },
      },
    };
  }

  if (action.type === 'TOGGLE_RANGE_CIRCLES') {
    return {
      ...state,
      ui: {
        ...state.ui,
        galaxyMapToggles: {
          ...state.ui.galaxyMapToggles,
          showRangeCircles: !state.ui.galaxyMapToggles.showRangeCircles,
        },
      },
    };
  }

  if (action.type === 'TOGGLE_TRADE_ROUTES') {
    return {
      ...state,
      ui: {
        ...state.ui,
        galaxyMapToggles: {
          ...state.ui.galaxyMapToggles,
          showTradeRoutes: !state.ui.galaxyMapToggles.showTradeRoutes,
        },
      },
    };
  }

  if (action.type === 'TOGGLE_HIGHLIGHT_ENEMIES') {
    return {
      ...state,
      ui: {
        ...state.ui,
        galaxyMapToggles: {
          ...state.ui.galaxyMapToggles,
          highlightEnemyFleets: !state.ui.galaxyMapToggles.highlightEnemyFleets,
        },
      },
    };
  }

  // ── Cycle Colony/Fleet Selection (interaction-spec.md §2.2) ───────────────
  //
  // SELECT_NEXT_COLONY / SELECT_PREV_COLONY: Cycle through player colonies.
  // SELECT_NEXT_FLEET / SELECT_PREV_FLEET: Cycle through player fleets.

  if (action.type === 'SELECT_NEXT_COLONY' || action.type === 'SELECT_PREV_COLONY') {
    const playerEmpireId = state.empires.playerId;
    const playerColonies = state.planets.allIds
      .map((id) => state.planets.byId[id])
      .filter((p) => p.ownerId === playerEmpireId)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (playerColonies.length === 0) return state;

    const currentSystem = state.ui.selectedSystem;
    const currentColony = playerColonies.find((p) => p.systemId === currentSystem);
    const currentIdx = currentColony ? playerColonies.indexOf(currentColony) : -1;

    let nextIdx: number;
    if (action.type === 'SELECT_NEXT_COLONY') {
      nextIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % playerColonies.length;
    } else {
      nextIdx = currentIdx < 0 ? playerColonies.length - 1 : (currentIdx - 1 + playerColonies.length) % playerColonies.length;
    }

    const nextColony = playerColonies[nextIdx];
    return {
      ...state,
      ui: {
        ...state.ui,
        selectedSystem: nextColony.systemId,
        selectedPlanet: nextColony.id,
        selectedFleet: null,
        fleetDeploymentMode: null,
        camera: {
          ...state.ui.camera,
          target: nextColony.systemId,
        },
      },
    };
  }

  if (action.type === 'SELECT_NEXT_FLEET' || action.type === 'SELECT_PREV_FLEET') {
    const playerEmpireId = state.empires.playerId;
    const playerFleets = state.fleets.allIds
      .map((id) => state.fleets.byId[id])
      .filter((f) => f.ownerId === playerEmpireId)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    if (playerFleets.length === 0) return state;

    const currentFleetId = state.ui.selectedFleet;
    const currentIdx = currentFleetId ? playerFleets.findIndex((f) => f.id === currentFleetId) : -1;

    let nextIdx: number;
    if (action.type === 'SELECT_NEXT_FLEET') {
      nextIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % playerFleets.length;
    } else {
      nextIdx = currentIdx < 0 ? playerFleets.length - 1 : (currentIdx - 1 + playerFleets.length) % playerFleets.length;
    }

    const nextFleet = playerFleets[nextIdx];
    return {
      ...state,
      ui: {
        ...state.ui,
        selectedSystem: nextFleet.systemId,
        selectedPlanet: null,
        selectedFleet: nextFleet.id,
        fleetDeploymentMode: nextFleet.destination ? null : {
          fleetId: nextFleet.id,
          ships: {},
          destinationId: null,
        },
        camera: {
          ...state.ui.camera,
          target: nextFleet.systemId,
        },
      },
    };
  }

  // ── Settings: confirmEndTurn toggle ──────────────────────────────────────
  //
  // Per design/ui-ux/state-transitions.md §3.3: "Don't show end turn confirmation" checkbox.
  // Sets settings.confirmEndTurn to the provided boolean value.

  if (action.type === 'SET_CONFIRM_END_TURN') {
    const payload = action.payload as { value: boolean };
    return {
      ...state,
      ui: {
        ...state.ui,
        settings: {
          ...state.ui.settings,
          confirmEndTurn: payload.value,
        },
      },
    };
  }

  // Unknown action — return unchanged state
  return state;
}
