/**
 * Turn processing system — pure TypeScript, NO DOM.
 * src/game/systems/turn.ts
 *
 * Implements the 12-phase turn structure from design/game-mechanics/turn-structure.md:
 *   1.  Income & Maintenance
 *   2.  Production
 *   3.  Research
 *   4.  Population Growth
 *   5.  Diplomacy
 *   6.  Movement
 *   7.  Combat Resolution
 *   8.  Ground Combat & Colonization
 *   9.  Events
 *   10. Victory Check
 *   11. AI Turn
 *   12. End Turn
 *
 * Each phase:
 *   - Accepts current state and returns new state
 *   - Records per-phase output for the turn summary
 *   - Checks for game-ending conditions after relevant phases
 *
 * All functions are pure: no mutation, returns new GameState objects.
 * No DOM imports. No `any` types.
 */

import {
  GameState,
  Planet,
  Empire,
  SystemId,
  TurnEvent,
  TurnPhase,
  PhaseOutput,
  TurnResult,
} from '../state';
import {
  calculatePopulationGrowth,
  PopulationContext,
  PopulationPlanetFields,
} from './population';
import {
  DEFAULT_PRODUCTION_CONTEXT,
  ProductionContext,
  processPlanetProduction,
} from './production';
import {
  processResearchTurn,
  createDefaultFieldResearch,
  createEvenAllocation,
  PlanetRPInput,
  EmpireFieldResearch,
} from './research';
import { processFleetMovement } from './fleet';
import { canColonize, colonize } from './colonization';
import { processAllAITurns } from '../ai/AIEmpire';
import { processAllShipConstruction } from './shipConstruction';
import { checkVictoryConditions, VictoryResult } from './victoryConditions';
import { resolveEspionageMissions } from './espionageResolution';

// ── Phase execution order ──────────────────────────────────────────────────────

const PHASE_ORDER: TurnPhase[] = [
  TurnPhase.IncomeAndMaintenance,
  TurnPhase.Production,
  TurnPhase.Research,
  TurnPhase.PopulationGrowth,
  TurnPhase.Diplomacy,
  TurnPhase.Movement,
  TurnPhase.CombatResolution,
  TurnPhase.GroundCombatAndColonization,
  TurnPhase.Events,
  TurnPhase.VictoryCheck,
  TurnPhase.AITurn,
  TurnPhase.EndTurn,
];

// ── Phase processor type ───────────────────────────────────────────────────────

interface PhaseProcessorResult {
  state: GameState;
  output: PhaseOutput;
  /** If a victory condition was met during this phase */
  victoryResult?: VictoryResult | null;
}

type PhaseProcessor = (state: GameState, preTurnState: GameState) => PhaseProcessorResult;

// ── Internal helpers ───────────────────────────────────────────────────────────

/**
 * Build a ProductionContext for an empire using baseline values.
 *
 * In a fully-featured game this would read tech levels, racial bonuses,
 * and building effects from empire state. For the current integration
 * we use DEFAULT_PRODUCTION_CONTEXT as the baseline — future tasks can
 * derive real values from the empire's research and race data.
 */
function buildProductionContext(_empire: Empire): ProductionContext {
  // TODO (future task): derive from empire.research tech levels, race bonuses.
  return DEFAULT_PRODUCTION_CONTEXT;
}

/**
 * Build the PlanetRPInput array for all planets owned by an empire.
 */
function buildPlanetRPInputs(empire: Empire, state: GameState): PlanetRPInput[] {
  return empire.planets
    .map((planetId) => state.planets.byId[planetId])
    .filter((p): p is Planet => p !== undefined && p.isColonized)
    .map((planet) => {
      // Check if this planet is in the Orion system
      const system = state.galaxy.systems.byId[planet.systemId];
      const isOrionPlanet = system?.isOrion ?? false;

      return {
        population: planet.population,
        researchSlider: planet.production.research,
        buildingIds: planet.buildings,
        hasArtifacts: planet.hasArtifacts,
        isOrion: isOrionPlanet,
        // Pass the planet's researchMultiplier so Gaia/Artifacts bonuses are data-driven
        researchMultiplier: planet.researchMultiplier,
      };
    });
}

/**
 * Build a minimal EmpireFieldResearch from a GameState Empire's research state.
 */
function buildEmpireFieldResearch(empire: Empire): EmpireFieldResearch {
  const fields = createDefaultFieldResearch();
  const rp = empire.research.researchPoints;
  if (rp > 0) {
    const perField = rp / 6;
    for (const field of Object.keys(fields) as Array<keyof EmpireFieldResearch>) {
      fields[field] = { ...fields[field], progressRP: perField };
    }
  }
  return fields;
}

/**
 * Build the ship-BC map for all colonised planets from their production results.
 */
function buildShipBcMap(state: GameState): Record<string, number> {
  const map: Record<string, number> = {};

  for (const planetId of state.planets.allIds) {
    const planet = state.planets.byId[planetId];
    if (!planet.isColonized || !planet.ownerId) continue;

    const empire = state.empires.byId[planet.ownerId];
    if (!empire) continue;

    const ctx = buildProductionContext(empire);
    const result = processPlanetProduction(planet, ctx);
    map[planetId] = result.allocation.ship;
  }

  return map;
}

// ── Phase 1: Income & Maintenance ──────────────────────────────────────────────

function processPhaseIncomeAndMaintenance(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  let next = state;
  let totalIncome = 0;
  let totalMaintenance = 0;

  for (const empireId of next.empires.allIds) {
    const empire = next.empires.byId[empireId];
    if (empire.isDefeated) continue;

    // Collect income
    const income = empire.creditPerTurn;
    totalIncome += income;

    // TODO: Calculate ship/building maintenance from empire assets
    // For now, maintenance is 0
    const maintenance = 0;
    totalMaintenance += maintenance;

    const netIncome = income - maintenance;

    const updatedEmpire: Empire = {
      ...empire,
      credits: Math.max(0, empire.credits + netIncome),
    };

    next = {
      ...next,
      empires: {
        ...next.empires,
        byId: {
          ...next.empires.byId,
          [empireId]: updatedEmpire,
        },
      },
    };
  }

  const output: PhaseOutput = {
    phase: TurnPhase.IncomeAndMaintenance,
    summary: `Collected ${totalIncome} BC in income, paid ${totalMaintenance} BC in maintenance.`,
    events: [],
    metrics: {
      totalIncome,
      totalMaintenance,
      netIncome: totalIncome - totalMaintenance,
    },
  };

  return { state: next, output };
}

// ── Phase 2: Production ────────────────────────────────────────────────────────

function processPhaseProduction(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  let next = state;
  const events: TurnEvent[] = [];
  let totalFactoriesBuilt = 0;
  let totalPollutionGenerated = 0;

  // Compute ship-BC allocations before mutating planet state
  const shipBcMap = buildShipBcMap(next);

  for (const planetId of next.planets.allIds) {
    const planet = next.planets.byId[planetId];
    if (!planet.isColonized || !planet.ownerId) continue;

    const empire = next.empires.byId[planet.ownerId];
    if (!empire) continue;

    const ctx = buildProductionContext(empire);
    const result = processPlanetProduction(planet, ctx);

    // Apply factory construction output
    const factoriesBuilt = Math.min(
      result.factories.factoriesBuilt,
      planet.maxFactories - planet.factories,
    );
    totalFactoriesBuilt += factoriesBuilt;
    totalPollutionGenerated += result.eco.uncleanedPollution;

    const updatedPlanet: Planet = {
      ...planet,
      factories: planet.factories + factoriesBuilt,
      waste: Math.max(0, planet.waste + result.eco.uncleanedPollution),
    };

    next = {
      ...next,
      planets: {
        ...next.planets,
        byId: {
          ...next.planets.byId,
          [planetId]: updatedPlanet,
        },
      },
    };
  }

  // Process ship construction
  next = processAllShipConstruction(next, shipBcMap);

  // Check for new ships built (compare with pre-state)
  const beforeShipIds = new Set(state.ships.allIds);
  for (const shipId of next.ships.allIds) {
    if (beforeShipIds.has(shipId)) continue;
    const ship = next.ships.byId[shipId];
    if (!ship || ship.ownerId !== next.empires.playerId) continue;

    const design = next.shipDesigns.byId[ship.designId];
    const designName = design ? design.name : ship.designId;
    const fleet = next.fleets.byId[ship.fleetId];
    const systemId = fleet ? fleet.systemId : null;
    const system = systemId ? next.galaxy.systems.byId[systemId] : undefined;
    const systemName = system ? system.name : (systemId ?? 'Unknown System');

    events.push({
      type: 'ship_built',
      title: `${designName} Completed`,
      description: `A new ${designName} has been constructed at ${systemName}.`,
      empireId: next.empires.playerId,
      systemId,
      planetId: null,
      combatId: null,
      techId: null,
      designId: ship.designId,
      turn: next.turn,
    });
  }

  const output: PhaseOutput = {
    phase: TurnPhase.Production,
    summary: `Built ${totalFactoriesBuilt} factories. Generated ${totalPollutionGenerated} pollution.`,
    events,
    metrics: {
      factoriesBuilt: totalFactoriesBuilt,
      pollutionGenerated: totalPollutionGenerated,
      shipsBuilt: events.filter((e) => e.type === 'ship_built').length,
    },
  };

  return { state: next, output };
}

// ── Phase 3: Research ──────────────────────────────────────────────────────────

function processPhaseResearch(
  state: GameState,
  preTurnState: GameState,
): PhaseProcessorResult {
  let next = state;
  const events: TurnEvent[] = [];
  let totalRPGenerated = 0;

  for (const empireId of next.empires.allIds) {
    const empire = next.empires.byId[empireId];
    if (empire.isDefeated) continue;

    const planets = buildPlanetRPInputs(empire, next);
    if (planets.length === 0) continue;

    const allocation = createEvenAllocation();
    const fields = buildEmpireFieldResearch(empire);
    const isAI = !empire.isPlayer;

    const result = processResearchTurn(
      planets,
      empire.raceId,
      allocation,
      fields,
      next.galaxy.size,
      isAI,
    );

    totalRPGenerated += result.totalRP;

    const updatedEmpire: Empire = {
      ...empire,
      research: {
        ...empire.research,
        researchPerTurn: result.totalRP,
        researchPoints: empire.research.researchPoints + result.totalRP,
      },
    };

    next = {
      ...next,
      empires: {
        ...next.empires,
        byId: {
          ...next.empires.byId,
          [empire.id]: updatedEmpire,
        },
      },
    };
  }

  // Generate research event for player
  const playerBefore = preTurnState.empires.byId[next.empires.playerId];
  const playerAfter = next.empires.byId[next.empires.playerId];
  if (playerBefore && playerAfter) {
    const rpGained =
      playerAfter.research.researchPoints - playerBefore.research.researchPoints;
    if (rpGained > 0) {
      events.push({
        type: 'research',
        title: 'Research Progress',
        description: `Your scientists generated ${rpGained} research points this turn.`,
        empireId: next.empires.playerId,
        systemId: null,
        planetId: null,
        combatId: null,
        techId: playerAfter.research.currentTech,
        designId: null,
        turn: next.turn,
      });
    }
  }

  const output: PhaseOutput = {
    phase: TurnPhase.Research,
    summary: `Generated ${totalRPGenerated} research points across all empires.`,
    events,
    metrics: {
      totalRPGenerated,
      playerRP: playerAfter?.research.researchPerTurn ?? 0,
    },
  };

  return { state: next, output };
}

// ── Phase 4: Population Growth ─────────────────────────────────────────────────

/**
 * Build PopulationContext for an empire to use with calculatePopulationGrowth.
 * Uses race ID and derives tech levels from completedTechs.
 *
 * TODO: This is a simplified implementation that uses 0 for tech levels.
 * A full implementation would scan completedTechs for terraforming/cloning techs
 * and extract their tech levels from the tech tree data.
 */
function buildPopulationContext(empire: Empire): PopulationContext {
  // For now, default to 0 — terraforming and cloning bonuses require
  // looking up tech definitions to get their levels, which is deferred.
  // This maintains parity with the old growth.ts implementation which
  // also didn't factor in tech bonuses.
  //
  // TODO: Implement proper tech level lookup:
  //   1. Check empire.research.completedTechs for terraforming/cloning techs
  //   2. Look up each tech's level from tech-tree.json
  //   3. Use highest level for each category
  const terraformingLevel = 0;
  const cloningLevel = 0;

  return {
    raceId: empire.raceId,
    techState: {
      terraforming_tech_level: terraformingLevel,
      cloning_tech_level: cloningLevel,
    },
    difficulty: undefined, // TODO: pass from game state
    isPlayer: empire.isPlayer,
  };
}

function processPhasePopulationGrowth(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  let next = state;
  let totalGrowth = 0;
  let planetsGrown = 0;

  for (const planetId of next.planets.allIds) {
    const planet = next.planets.byId[planetId];
    if (!planet.isColonized || !planet.ownerId) continue;

    const empire = next.empires.byId[planet.ownerId];
    if (!empire) continue;

    const ctx = buildPopulationContext(empire);
    const result = calculatePopulationGrowth(
      planet as Planet & PopulationPlanetFields,
      ctx,
    );

    if (result.integerGrowth === 0 && result.newFractional === (planet as unknown as PopulationPlanetFields).fractional_population) {
      continue;
    }

    totalGrowth += result.integerGrowth;
    if (result.integerGrowth > 0) planetsGrown++;

    // Update planet with new population, maxPopulation (calculated), and fractional carry-over
    const updatedPlanet: Planet = {
      ...planet,
      population: result.newPopulation,
      maxPopulation: result.maxPopulation,  // Keep maxPopulation in sync with calculated value
      // Store fractional population for next turn (if field exists)
    };

    // Extend with fractional_population if the field is used
    const extendedPlanet = {
      ...updatedPlanet,
      fractional_population: result.newFractional,
    } as Planet & PopulationPlanetFields;

    next = {
      ...next,
      planets: {
        ...next.planets,
        byId: {
          ...next.planets.byId,
          [planetId]: extendedPlanet as Planet,
        },
      },
    };
  }

  const output: PhaseOutput = {
    phase: TurnPhase.PopulationGrowth,
    summary: `Population grew by ${totalGrowth} across ${planetsGrown} planets.`,
    events: [],
    metrics: {
      totalGrowth,
      planetsGrown,
    },
  };

  return { state: next, output };
}

// ── Phase 5: Diplomacy ─────────────────────────────────────────────────────────

function processPhaseDiplomacy(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  let next = state;
  const events: TurnEvent[] = [];
  let espionageMissionsResolved = 0;

  // Resolve espionage missions
  const espionageResult = resolveEspionageMissions(next);
  next = espionageResult.state;
  espionageMissionsResolved = espionageResult.results.length;
  events.push(...espionageResult.events);

  // TODO: Implement treaty decay, AI diplomatic proposals, trade route updates

  const successfulMissions = espionageResult.results.filter((r) => r.success).length;
  const detectedMissions = espionageResult.results.filter((r) => r.detected).length;

  let summary = 'Diplomatic relations evaluated.';
  if (espionageMissionsResolved > 0) {
    summary = `Espionage: ${espionageMissionsResolved} mission(s) resolved. ${successfulMissions} successful, ${detectedMissions} detected.`;
  }

  const output: PhaseOutput = {
    phase: TurnPhase.Diplomacy,
    summary,
    events,
    metrics: {
      espionageMissionsResolved,
      successfulMissions,
      detectedMissions,
    },
  };

  return { state: next, output };
}

// ── Phase 6: Movement ──────────────────────────────────────────────────────────

function processPhaseMovement(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  const next = processFleetMovement(state);

  // Count fleets that moved
  let fleetsMoved = 0;
  for (const fleetId of next.fleets.allIds) {
    const fleet = next.fleets.byId[fleetId];
    const oldFleet = state.fleets.byId[fleetId];
    if (fleet && oldFleet && fleet.systemId !== oldFleet.systemId) {
      fleetsMoved++;
    }
  }

  const output: PhaseOutput = {
    phase: TurnPhase.Movement,
    summary: `${fleetsMoved} fleets moved this turn.`,
    events: [],
    metrics: {
      fleetsMoved,
    },
  };

  return { state: next, output };
}

// ── Phase 7: Combat Resolution ─────────────────────────────────────────────────

function processPhaseCombatResolution(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  let next = state;
  const events: TurnEvent[] = [];

  // Group fleet IDs by system
  const fleetsBySystem = new Map<SystemId, string[]>();
  for (const fleetId of next.fleets.allIds) {
    const fleet = next.fleets.byId[fleetId];
    if (!fleet) continue;
    const list = fleetsBySystem.get(fleet.systemId) ?? [];
    list.push(fleetId);
    fleetsBySystem.set(fleet.systemId, list);
  }

  let combatsDetected = 0;

  for (const [systemId, fleetIds] of fleetsBySystem) {
    if (fleetIds.length < 2) continue;

    // Check if there are fleets from more than one empire in this system
    const empiresPresent = new Set(
      fleetIds
        .map((id) => state.fleets.byId[id]?.ownerId)
        .filter((id): id is string => id !== undefined),
    );
    if (empiresPresent.size < 2) continue;

    // Check if any of those empires are at war with each other
    const empireIds = [...empiresPresent];
    let combatDetected = false;
    outer: for (let i = 0; i < empireIds.length; i++) {
      for (let j = i + 1; j < empireIds.length; j++) {
        const empA = next.empires.byId[empireIds[i]];
        const empB = next.empires.byId[empireIds[j]];
        if (!empA || !empB) continue;
        const rel = empA.relations[empireIds[j]];
        if (rel?.state === 'war') {
          combatDetected = true;
          break outer;
        }
      }
    }
    if (!combatDetected) continue;

    combatsDetected++;

    // Mark all fleets in this system as in-combat
    const updatedFleetsById = { ...next.fleets.byId };
    for (const fleetId of fleetIds) {
      const fleet = updatedFleetsById[fleetId];
      if (fleet && !fleet.isInCombat) {
        updatedFleetsById[fleetId] = { ...fleet, isInCombat: true };

        // Generate combat event for player fleets
        if (fleet.ownerId === next.empires.playerId) {
          const system = next.galaxy.systems.byId[systemId];
          const systemName = system ? system.name : systemId;
          events.push({
            type: 'combat',
            title: 'Combat Detected',
            description: `Enemy forces have been detected in the ${systemName} system. Your fleet is engaged.`,
            empireId: next.empires.playerId,
            systemId,
            planetId: null,
            combatId: fleet.combatId,
            techId: null,
            designId: null,
            turn: next.turn,
          });
        }
      }
    }
    next = {
      ...next,
      fleets: { ...next.fleets, byId: updatedFleetsById },
    };
  }

  const output: PhaseOutput = {
    phase: TurnPhase.CombatResolution,
    summary:
      combatsDetected > 0
        ? `${combatsDetected} space battles detected.`
        : 'No space combat this turn.',
    events,
    metrics: {
      combatsDetected,
    },
  };

  return { state: next, output };
}

// ── Phase 8: Ground Combat & Colonization ──────────────────────────────────────

function processPhaseGroundCombatAndColonization(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  let next = state;
  const events: TurnEvent[] = [];
  let coloniesEstablished = 0;

  // Auto-colonize any unowned planet where a fleet with a colony ship is present
  for (const fleetId of next.fleets.allIds) {
    const fleet = next.fleets.byId[fleetId];
    if (!fleet) continue;

    const system = next.galaxy.systems.byId[fleet.systemId];
    if (!system) continue;

    for (const planetId of system.planetIds) {
      const planet = next.planets.byId[planetId];
      if (!planet) continue;
      if (!canColonize(fleet, planet, next)) continue;

      try {
        next = colonize(fleetId, planetId, next);
        coloniesEstablished++;

        // Generate colonization event for player
        if (fleet.ownerId === next.empires.playerId) {
          const updatedPlanet = next.planets.byId[planetId];
          const systemName = system.name;
          events.push({
            type: 'colonization',
            title: `${updatedPlanet?.name ?? planetId} Colonized`,
            description: `Colonists have established a new settlement on ${updatedPlanet?.name ?? planetId} in the ${systemName} system.`,
            empireId: next.empires.playerId,
            systemId: fleet.systemId,
            planetId,
            combatId: null,
            techId: null,
            designId: null,
            turn: next.turn,
          });
        }
      } catch {
        // canColonize returned true but colonize threw — skip silently
      }
      // One colonization per fleet per turn
      break;
    }
  }

  // TODO: Implement ground combat resolution for invasions

  const output: PhaseOutput = {
    phase: TurnPhase.GroundCombatAndColonization,
    summary:
      coloniesEstablished > 0
        ? `${coloniesEstablished} new colonies established.`
        : 'No new colonies this turn.',
    events,
    metrics: {
      coloniesEstablished,
    },
  };

  return { state: next, output };
}

// ── Phase 9: Events ────────────────────────────────────────────────────────────

function processPhaseEvents(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  // TODO: Implement random events (10% chance) and scripted events
  // For now, this is a stub

  const output: PhaseOutput = {
    phase: TurnPhase.Events,
    summary: 'No random events this turn.',
    events: [],
    metrics: {
      eventsTriggered: 0,
    },
  };

  return { state, output };
}

// ── Phase 10: Victory Check ────────────────────────────────────────────────────

function processPhaseVictoryCheck(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  const victoryResult = checkVictoryConditions(state);

  let next = state;
  const events: TurnEvent[] = [];

  if (victoryResult) {
    next = {
      ...next,
      isGameOver: true,
      victoryResult: {
        winnerId: victoryResult.winnerId,
        type: victoryResult.type,
        description: victoryResult.description,
      },
    };

    events.push({
      type: 'victory',
      title: 'Victory!',
      description: victoryResult.description,
      empireId: victoryResult.winnerId,
      systemId: null,
      planetId: null,
      combatId: null,
      techId: null,
      designId: null,
      turn: next.turn,
    });
  }

  const output: PhaseOutput = {
    phase: TurnPhase.VictoryCheck,
    summary: victoryResult
      ? `Game over: ${victoryResult.description}`
      : 'No victory conditions met.',
    events,
    metrics: {},
  };

  return { state: next, output, victoryResult };
}

// ── Phase 11: AI Turn ──────────────────────────────────────────────────────────

function processPhaseAITurn(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  const next = processAllAITurns(state);

  const output: PhaseOutput = {
    phase: TurnPhase.AITurn,
    summary: 'AI empires processed their turns.',
    events: [],
    metrics: {},
  };

  return { state: next, output };
}

// ── Phase 12: End Turn ─────────────────────────────────────────────────────────

function processPhaseEndTurn(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  // Cleanup and finalization
  const next: GameState = {
    ...state,
    lastPlayed: Math.max(Date.now(), state.lastPlayed + 1),
    currentPhase: null,
  };

  const output: PhaseOutput = {
    phase: TurnPhase.EndTurn,
    summary: `Turn ${state.turn} complete.`,
    events: [],
    metrics: {},
  };

  return { state: next, output };
}

// ── Phase dispatcher ───────────────────────────────────────────────────────────

const PHASE_PROCESSORS: Record<TurnPhase, PhaseProcessor> = {
  [TurnPhase.IncomeAndMaintenance]: processPhaseIncomeAndMaintenance,
  [TurnPhase.Production]: processPhaseProduction,
  [TurnPhase.Research]: processPhaseResearch,
  [TurnPhase.PopulationGrowth]: processPhasePopulationGrowth,
  [TurnPhase.Diplomacy]: processPhaseDiplomacy,
  [TurnPhase.Movement]: processPhaseMovement,
  [TurnPhase.CombatResolution]: processPhaseCombatResolution,
  [TurnPhase.GroundCombatAndColonization]: processPhaseGroundCombatAndColonization,
  [TurnPhase.Events]: processPhaseEvents,
  [TurnPhase.VictoryCheck]: processPhaseVictoryCheck,
  [TurnPhase.AITurn]: processPhaseAITurn,
  [TurnPhase.EndTurn]: processPhaseEndTurn,
};

// ── Core turn processor ────────────────────────────────────────────────────────

/**
 * Advance the game by one turn using the 12-phase turn structure.
 *
 * Phase sequence (from design/game-mechanics/turn-structure.md):
 *   1.  Income & Maintenance
 *   2.  Production
 *   3.  Research
 *   4.  Population Growth
 *   5.  Diplomacy
 *   6.  Movement
 *   7.  Combat Resolution
 *   8.  Ground Combat & Colonization
 *   9.  Events
 *   10. Victory Check (moved after cleanup per design spec)
 *   11. AI Turn
 *   12. End Turn (cleanup, turn summary preparation)
 *
 * Pure function — does not mutate `state`.
 */
export function processTurn(state: GameState): GameState {
  // Capture pre-turn state for event comparison
  const preTurnState = state;

  // ── Step 1: advance time ─────────────────────────────────────────────────
  const newTurn = state.turn + 1;
  const newYear = 2500 + newTurn;

  let current: GameState = {
    ...state,
    turn: newTurn,
    year: newYear,
    turnEvents: [],
    phaseOutputs: [],
    currentPhase: null,
  };

  const phaseOutputs: PhaseOutput[] = [];
  const allEvents: TurnEvent[] = [];

  // ── Execute phases in order ──────────────────────────────────────────────
  for (const phase of PHASE_ORDER) {
    // Set current phase for UI tracking
    current = { ...current, currentPhase: phase };

    // Process the phase
    const processor = PHASE_PROCESSORS[phase];
    const result = processor(current, preTurnState);

    // Update state
    current = result.state;

    // Collect outputs
    phaseOutputs.push(result.output);
    allEvents.push(...result.output.events);

    // Note: Victory result is stored in current.victoryResult by processPhaseVictoryCheck
  }

  // ── Finalize ─────────────────────────────────────────────────────────────
  return {
    ...current,
    turnEvents: allEvents,
    phaseOutputs,
    currentPhase: null,
  };
}

/**
 * Process the turn and return detailed results.
 * This is for advanced consumers that want per-phase output details.
 */
export function processTurnWithResult(state: GameState): TurnResult {
  const preTurnState = state;
  const newTurn = state.turn + 1;
  const newYear = 2500 + newTurn;

  let current: GameState = {
    ...state,
    turn: newTurn,
    year: newYear,
    turnEvents: [],
    phaseOutputs: [],
    currentPhase: null,
  };

  const phaseOutputs: PhaseOutput[] = [];
  const allEvents: TurnEvent[] = [];
  let victoryResult: { winnerId: string; type: string; description: string } | null =
    null;

  for (const phase of PHASE_ORDER) {
    current = { ...current, currentPhase: phase };

    const processor = PHASE_PROCESSORS[phase];
    const result = processor(current, preTurnState);

    current = result.state;
    phaseOutputs.push(result.output);
    allEvents.push(...result.output.events);

    if (result.victoryResult) {
      victoryResult = {
        winnerId: result.victoryResult.winnerId,
        type: result.victoryResult.type,
        description: result.victoryResult.description,
      };
    }
  }

  return {
    turn: newTurn,
    phaseOutputs,
    allEvents,
    victoryResult: victoryResult as TurnResult['victoryResult'],
  };
}
