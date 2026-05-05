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
  Fleet,
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
  calculateShipMaintenance,
  handleBankruptcy,
  ScuttleCandidate,
  BankruptcyResult,
} from './production';
import { calculateBuildingMaintenance } from './buildings';
import {
  processResearchTurn,
  createDefaultFieldResearch,
  createEvenAllocation,
  PlanetRPInput,
  EmpireFieldResearch,
} from './research';
import { processFleetMovement, getFleetWarpSpeed, distanceBetweenSystems } from './fleet';
import { canColonize, colonize } from './colonization';
import { processAllAITurns } from '../ai/AIEmpire';
import { processAllShipConstruction } from './shipConstruction';
import { checkVictoryConditions, VictoryResult } from './victoryConditions';
import { resolveEspionageMissions } from './espionageResolution';
import {
  processRandomEvents,
  processActiveEvents,
  processMonsterMovement,
} from './events';
import {
  getFactoryEfficiencyMultiplier,
  getRoboticControlsBonus,
  getPollutionReduction,
} from './raceAbilities';
import {
  RACIAL_PRODUCTION_MODIFIERS,
  ROBOTIC_CONTROLS,
  WASTE_REDUCTION,
  ECO_RESTORATION,
  INDUSTRIAL_TECH_FACTORY_COSTS,
  TERRAFORMING_BONUSES,
} from '../constants';
import { RaceId } from '../state';

// ── Bankruptcy Constants (design/game-mechanics/turn-structure.md) ────────────

/**
 * Diplomatic relation penalty with all known empires on bankruptcy.
 * Design doc: "Diplomatic reputation damage"
 */
const BANKRUPTCY_DIPLOMACY_PENALTY = -15;

// NOTE: BANKRUPTCY_MORALE_PENALTY (-10) is documented in design/game-mechanics/turn-structure.md
// but not implemented yet. Add when full planet morale system is added.

/**
 * Spy maintenance cost per active spy per turn.
 * Design doc: turn-structure.md mentions spies cost upkeep.
 * Note: espionage.md doesn't specify this; using a placeholder.
 */
const SPY_MAINTENANCE_COST = 5;

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

// ── Tech Level Helpers (derive from completedTechs) ─────────────────────────────

/**
 * Get the highest Robotic Controls level from completed techs.
 * Returns the factory_ratio (2-7) based on researched RC techs.
 * Default: 2 (RC II, starting tech).
 *
 * Tech IDs: robotic_controls_2_tech, robotic_controls_3_tech, etc.
 */
function getRoboticControlsLevel(completedTechs: string[]): number {
  // Check from highest to lowest
  for (let i = ROBOTIC_CONTROLS.length - 1; i >= 0; i--) {
    const rc = ROBOTIC_CONTROLS[i];
    // Tech IDs follow pattern: robotic_controls_N_tech where N is the Roman numeral as digit
    const techId = `robotic_controls_${rc.factory_ratio}_tech`;
    if (completedTechs.includes(techId)) {
      return rc.factory_ratio;
    }
  }
  // Starting tech RC II (factory_ratio 2) is always available
  return 2;
}

/**
 * Get the current waste rate from completed techs.
 * Returns the waste_rate multiplier (1.0 down to 0.0) based on researched waste reduction.
 * Default: 1.0 (no reduction).
 *
 * Tech IDs: reduced_industrial_waste_80_tech, reduced_industrial_waste_60_tech, etc.
 */
function getWasteRateFromTechs(completedTechs: string[]): number {
  // Check from best (lowest rate) to worst
  const techPatterns = [
    { pattern: 'industrial_waste_elimination', rate: 0.0 },
    { pattern: 'reduced_industrial_waste_20', rate: 0.2 },
    { pattern: 'reduced_industrial_waste_40', rate: 0.4 },
    { pattern: 'reduced_industrial_waste_60', rate: 0.6 },
    { pattern: 'reduced_industrial_waste_80', rate: 0.8 },
  ];

  for (const { pattern, rate } of techPatterns) {
    if (completedTechs.some(t => t.includes(pattern))) {
      return rate;
    }
  }
  return 1.0; // No waste reduction
}

/**
 * Get the cleanup modifier from completed Eco Restoration techs.
 * Returns the cleanup_modifier (1.0 down to 0.1) based on researched eco restoration.
 * Default: 1.0 (base Ecological Restoration).
 */
function getCleanupModifierFromTechs(completedTechs: string[]): number {
  // Check from best to worst
  const techPatterns = [
    { pattern: 'complete_eco_restoration', modifier: 0.1 },
    { pattern: 'advanced_eco_restoration', modifier: 0.2 },
    { pattern: 'enhanced_eco_restoration', modifier: 0.4 },
    { pattern: 'improved_eco_restoration', modifier: 0.67 },
  ];

  for (const { pattern, modifier } of techPatterns) {
    if (completedTechs.some(t => t.includes(pattern))) {
      return modifier;
    }
  }
  return 1.0; // Base eco restoration
}

/**
 * Get the factory cost from completed Industrial Tech.
 * Returns the factory cost in BC (10 down to 2) based on researched industrial tech.
 * Default: 10 BC.
 */
function getFactoryCostFromTechs(completedTechs: string[]): number {
  // Check from best (lowest cost) to worst
  for (let i = INDUSTRIAL_TECH_FACTORY_COSTS.length - 1; i >= 0; i--) {
    const tech = INDUSTRIAL_TECH_FACTORY_COSTS[i];
    // Tech IDs: industrial_tech_9, industrial_tech_8, etc.
    const techId = `industrial_tech_${tech.factory_cost}`;
    if (completedTechs.includes(techId)) {
      return tech.factory_cost;
    }
  }
  return 10; // Base factory cost
}

/**
 * Get the maximum terraform tier from completed terraforming techs.
 * Returns the tier index (0-9) or null if no terraforming.
 */
function getMaxTerraformTierFromTechs(completedTechs: string[]): number | null {
  // Check from highest tier to lowest
  const terraformTechs = [
    'terraforming_120_tech',
    'terraforming_100_tech',
    'terraforming_80_tech',
    'terraforming_60_tech',
    'terraforming_50_tech',
    'terraforming_40_tech',
    'terraforming_30_tech',
    'terraforming_20_tech',
    'terraforming_10_tech',
  ];

  for (let i = 0; i < terraformTechs.length; i++) {
    if (completedTechs.includes(terraformTechs[i])) {
      return TERRAFORMING_BONUSES.length - 1 - i; // Convert to tier index
    }
  }
  return null; // No terraforming available
}

/**
 * Get the Planetology tech level from completed techs.
 * This is an approximation based on the highest planetology-category tech researched.
 * Returns 0-50 range.
 */
function getPlanetologyTechLevel(completedTechs: string[]): number {
  // The planetology TL affects population labor output.
  // We estimate it based on terraforming techs as a proxy.
  const terraformTier = getMaxTerraformTierFromTechs(completedTechs);
  if (terraformTier === null) return 1; // Starting TL
  
  // Map tier to approximate TL (terraforming tiers map to increasing TLs)
  const tierToTL = [0, 2, 6, 10, 14, 18, 22, 30, 38, 46];
  return tierToTL[Math.min(terraformTier, tierToTL.length - 1)] || 1;
}

/**
 * Build a ProductionContext for an empire based on its race and completed technologies.
 *
 * Derives all production parameters from:
 *   - Racial bonuses (production modifier, RC bonus, factory efficiency)
 *   - Completed technologies (RC level, waste rate, cleanup modifier, factory cost)
 *   - Difficulty settings (applied separately via applyDifficultyToContext)
 *
 * Design source: design/economy/factory-formulas.md
 */
function buildProductionContext(empire: Empire): ProductionContext {
  const completedTechs = empire.research.completedTechs;
  const raceId = empire.raceId as RaceId;

  // Racial production modifier (Ants: 1.5, Mice: 1.25, etc.)
  const racialProductionModifier = RACIAL_PRODUCTION_MODIFIERS[raceId] ?? 1.0;

  // Racial research modifier (not used in production, but included for completeness)
  // Note: This would come from race data; using 1.0 as default.
  const racialResearchModifier = 1.0;

  // Robotic Controls level from tech, plus racial bonus (Mice: +2)
  const baseRCLevel = getRoboticControlsLevel(completedTechs);
  const racialRCBonus = getRoboticControlsBonus(raceId);

  // Planetology tech level (affects population labor output)
  const planetologyTL = getPlanetologyTechLevel(completedTechs);

  // Waste rate from tech
  let wasteRate = getWasteRateFromTechs(completedTechs);
  // Apply Mice racial pollution reduction (50% less pollution)
  const pollutionReduction = getPollutionReduction(raceId);
  if (pollutionReduction > 0) {
    wasteRate *= (1 - pollutionReduction / 100);
  }

  // Cleanup modifier from Eco Restoration tech
  const cleanupModifier = getCleanupModifierFromTechs(completedTechs);

  // Factory cost from Industrial Tech
  const factoryCostBC = getFactoryCostFromTechs(completedTechs);

  // Terraform tier and cost
  const maxTerraformTier = getMaxTerraformTierFromTechs(completedTechs);
  const terraformTierCost = 200; // Base cost per tier

  // Factory efficiency multiplier (Mice: 1.5 for Automated Production)
  const factoryEfficiencyMultiplier = getFactoryEfficiencyMultiplier(raceId);

  // Ship maintenance modifiers (could be expanded later)
  const racialMaintenanceModifier = 1.0;
  const fleetLogisticsModifiers: number[] = [];

  return {
    racialProductionModifier,
    racialResearchModifier,
    difficultyProductionModifier: 1.0, // Applied separately via applyDifficultyToContext
    roboticControlsLevel: baseRCLevel,
    racialRCBonus,
    planetologyTL,
    wasteRate,
    cleanupModifier,
    factoryCostBC,
    maxTerraformTier,
    terraformTierCost,
    factoryEfficiencyMultiplier,
    racialMaintenanceModifier,
    fleetLogisticsModifiers,
  };
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

/**
 * Calculate total ship maintenance for an empire.
 *
 * Design source: design/economy/ship-costs.md
 *   Ship_Maintenance = 2% × Ship_Cost per turn (minimum 1 BC)
 */
function calculateEmpireShipMaintenance(
  empire: Empire,
  state: GameState,
): number {
  let totalMaintenance = 0;
  const ctx = buildProductionContext(empire);

  // Iterate over all ships owned by this empire
  for (const shipId of state.ships.allIds) {
    const ship = state.ships.byId[shipId];
    if (!ship || ship.ownerId !== empire.id) continue;

    const design = state.shipDesigns.byId[ship.designId];
    if (!design) continue;

    // Use the ship design's cost for maintenance calculation
    const shipMaintenance = calculateShipMaintenance(design.stats.cost, ctx);
    totalMaintenance += shipMaintenance;
  }

  return totalMaintenance;
}

/**
 * Calculate total building maintenance for all planets owned by an empire.
 *
 * Design source: design/game-mechanics/turn-structure.md Phase 1
 */
function calculateEmpireBuildingMaintenance(
  empire: Empire,
  state: GameState,
): number {
  let totalMaintenance = 0;

  for (const planetId of empire.planets) {
    const planet = state.planets.byId[planetId];
    if (!planet) continue;

    totalMaintenance += calculateBuildingMaintenance(planet);
  }

  return totalMaintenance;
}

/**
 * Calculate spy maintenance for an empire.
 *
 * Design source: design/game-mechanics/turn-structure.md mentions spies cost upkeep.
 * Note: espionage.md doesn't specify exact costs; using SPY_MAINTENANCE_COST constant.
 */
function calculateEmpireSpyMaintenance(
  empireId: string,
  state: GameState,
): number {
  // Count active spy missions for this empire
  // Guard for backward compatibility with test fixtures lacking spyMissions
  const spyMissions = state.spyMissions ?? [];
  const activeSpyCount = spyMissions.filter(
    (m) => m.senderId === empireId && m.status === 'active',
  ).length;

  return activeSpyCount * SPY_MAINTENANCE_COST;
}

/**
 * Apply bankruptcy penalties to an empire's planets (morale) and relations (diplomacy).
 *
 * Design source: design/game-mechanics/turn-structure.md
 *   - "Morale penalties empire-wide"
 *   - "Diplomatic reputation damage"
 */
function applyBankruptcyPenalties(
  empire: Empire,
  state: GameState,
  scuttledShips: string[],
): GameState {
  if (scuttledShips.length === 0) return state;

  let next = state;

  // Apply morale penalty to all planets owned by this empire
  // We'll record this in planet morale (simulated via an event for now)
  // Full morale system integration would update planet.morale directly

  // Apply diplomatic reputation damage to all known empires
  const updatedRelations = { ...empire.relations };
  for (const otherEmpireId of next.empires.allIds) {
    if (otherEmpireId === empire.id) continue;
    const otherEmpire = next.empires.byId[otherEmpireId];
    if (!otherEmpire || otherEmpire.isDefeated) continue;

    const relation = updatedRelations[otherEmpireId];
    if (relation) {
      // Add a temporary diplomatic penalty modifier
      const updatedModifiers = [
        ...relation.modifiers,
        {
          reason: 'Bankruptcy - economic collapse',
          amount: BANKRUPTCY_DIPLOMACY_PENALTY,
          expiresAtTurn: next.turn + 10, // Penalty fades after 10 turns
        },
      ];
      updatedRelations[otherEmpireId] = {
        ...relation,
        modifiers: updatedModifiers,
      };
    }
  }

  const updatedEmpire: Empire = {
    ...empire,
    relations: updatedRelations,
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

  return next;
}

/**
 * Build scuttle candidates for bankruptcy handling.
 * Ships are ordered by cost (cheapest first) for deterministic scuttling.
 */
function buildScuttleCandidates(
  empire: Empire,
  state: GameState,
): ScuttleCandidate[] {
  const candidates: ScuttleCandidate[] = [];

  for (const shipId of state.ships.allIds) {
    const ship = state.ships.byId[shipId];
    if (!ship || ship.ownerId !== empire.id) continue;

    const design = state.shipDesigns.byId[ship.designId];
    if (!design) continue;

    candidates.push({
      shipId,
      cost: design.stats.cost,
    });
  }

  // Sort by cost ascending (cheapest ships scuttled first)
  // For "random" per design doc, we could shuffle, but deterministic is safer
  candidates.sort((a, b) => a.cost - b.cost);

  return candidates;
}

/**
 * Remove scuttled ships from state.
 */
function removeScuttledShips(
  state: GameState,
  shipIds: string[],
): GameState {
  if (shipIds.length === 0) return state;

  let next = state;
  const shipIdSet = new Set(shipIds);

  // Remove ships from ships collection
  const updatedShipsById: Record<string, typeof state.ships.byId[string]> = {};
  for (const id of next.ships.allIds) {
    if (!shipIdSet.has(id)) {
      updatedShipsById[id] = next.ships.byId[id];
    }
  }
  const updatedShipAllIds = next.ships.allIds.filter((id) => !shipIdSet.has(id));

  // Remove ships from their fleets
  const updatedFleetsById = { ...next.fleets.byId };
  for (const fleetId of next.fleets.allIds) {
    const fleet = updatedFleetsById[fleetId];
    if (!fleet) continue;

    const remainingShips = fleet.shipIds.filter((id) => !shipIdSet.has(id));
    if (remainingShips.length !== fleet.shipIds.length) {
      updatedFleetsById[fleetId] = {
        ...fleet,
        shipIds: remainingShips,
      };
    }
  }

  next = {
    ...next,
    ships: {
      byId: updatedShipsById,
      allIds: updatedShipAllIds,
    },
    fleets: {
      ...next.fleets,
      byId: updatedFleetsById,
    },
  };

  return next;
}

function processPhaseIncomeAndMaintenance(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  let next = state;
  const events: TurnEvent[] = [];
  let globalTotalIncome = 0;
  let globalTotalMaintenance = 0;
  let globalShipsScuttled = 0;

  for (const empireId of next.empires.allIds) {
    const empire = next.empires.byId[empireId];
    if (empire.isDefeated) continue;

    // Step 1: Collect income
    const income = empire.creditPerTurn;
    globalTotalIncome += income;

    // Step 2: Calculate maintenance
    const shipMaintenance = calculateEmpireShipMaintenance(empire, next);
    const buildingMaintenance = calculateEmpireBuildingMaintenance(empire, next);
    const spyMaintenance = calculateEmpireSpyMaintenance(empireId, next);
    const totalMaintenance = shipMaintenance + buildingMaintenance + spyMaintenance;
    globalTotalMaintenance += totalMaintenance;

    // Step 3: Calculate net income and new treasury
    const netIncome = income - totalMaintenance;
    let newCredits = empire.credits + netIncome;

    // Step 4: Handle bankruptcy if treasury goes negative
    let bankruptcyResult: BankruptcyResult | null = null;
    if (newCredits < 0) {
      const candidates = buildScuttleCandidates(empire, next);
      bankruptcyResult = handleBankruptcy(newCredits, candidates);
      newCredits = bankruptcyResult.finalTreasury;
      globalShipsScuttled += bankruptcyResult.scuttledShips.length;

      // Remove scuttled ships from state
      if (bankruptcyResult.scuttledShips.length > 0) {
        next = removeScuttledShips(next, bankruptcyResult.scuttledShips);

        // Apply bankruptcy penalties (morale + diplomacy)
        next = applyBankruptcyPenalties(
          next.empires.byId[empireId], // Use updated empire reference
          next,
          bankruptcyResult.scuttledShips,
        );

        // Generate bankruptcy event for player
        if (empireId === next.empires.playerId) {
          events.push({
            type: 'production', // Using 'production' as closest match
            title: 'Treasury Crisis!',
            description: `Unable to pay maintenance! ${bankruptcyResult.scuttledShips.length} ship(s) were emergency scrapped. Empire morale and diplomatic reputation have suffered.`,
            empireId,
            systemId: null,
            planetId: null,
            combatId: null,
            techId: null,
            designId: null,
            turn: next.turn,
          });
        }
      }
    }

    // Update empire with new credits
    const updatedEmpire: Empire = {
      ...next.empires.byId[empireId],
      credits: Math.max(0, newCredits),
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

  const netIncome = globalTotalIncome - globalTotalMaintenance;
  let summary = `Collected ${globalTotalIncome} BC in income, paid ${globalTotalMaintenance} BC in maintenance.`;
  if (globalShipsScuttled > 0) {
    summary += ` ${globalShipsScuttled} ship(s) scrapped due to bankruptcy.`;
  }

  const output: PhaseOutput = {
    phase: TurnPhase.IncomeAndMaintenance,
    summary,
    events,
    metrics: {
      totalIncome: globalTotalIncome,
      totalMaintenance: globalTotalMaintenance,
      netIncome,
      shipsScuttled: globalShipsScuttled,
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

/**
 * Check if two fleets are at war (hostile).
 */
function areAtWar(fleetA: Fleet, fleetB: Fleet, state: GameState): boolean {
  const empA = state.empires.byId[fleetA.ownerId];
  const empB = state.empires.byId[fleetB.ownerId];
  if (!empA || !empB) return false;

  const rel = empA.relations[fleetB.ownerId];
  return rel?.state === 'war';
}

/**
 * Calculate if a fleet can intercept another fleet in transit.
 *
 * Design source: design/game-mechanics/turn-structure.md Phase 6
 *   "Fast fleets can intercept slow ones"
 *
 * Interception occurs when:
 *   1. Both fleets belong to empires at war
 *   2. One fleet is in transit (has destination)
 *   3. Intercepting fleet is faster than target fleet
 *   4. Intercepting fleet starts at a system along the target's route
 *      OR intercepting fleet can reach the target's current trajectory position
 *
 * Simplified implementation:
 *   - Fast fleet at the target's destination can intercept arriving slow fleet
 *   - Fast fleet in same system can intercept departing slow fleet
 */
interface InterceptionResult {
  interceptorFleetId: string;
  targetFleetId: string;
  systemId: SystemId;
}

function detectFleetInterceptions(
  state: GameState,
): InterceptionResult[] {
  const interceptions: InterceptionResult[] = [];

  // Get all fleets in transit
  const fleetsInTransit = state.fleets.allIds
    .map((id) => state.fleets.byId[id])
    .filter((f): f is Fleet => f !== undefined && f.destination !== null && f.eta > 0);

  // Get all stationary fleets (potential interceptors)
  const stationaryFleets = state.fleets.allIds
    .map((id) => state.fleets.byId[id])
    .filter((f): f is Fleet => f !== undefined && f.destination === null);

  for (const targetFleet of fleetsInTransit) {
    const targetSpeed = getFleetWarpSpeed(targetFleet, state);

    for (const interceptor of stationaryFleets) {
      // Skip same empire
      if (interceptor.ownerId === targetFleet.ownerId) continue;

      // Must be at war
      if (!areAtWar(interceptor, targetFleet, state)) continue;

      const interceptorSpeed = getFleetWarpSpeed(interceptor, state);

      // Interceptor must be faster
      if (interceptorSpeed <= targetSpeed) continue;

      // Check if interceptor is at target's destination
      // (can intercept the arriving fleet)
      if (interceptor.systemId === targetFleet.destination) {
        interceptions.push({
          interceptorFleetId: interceptor.id,
          targetFleetId: targetFleet.id,
          systemId: targetFleet.destination,
        });
        continue;
      }

      // Check if interceptor is at target's origin and can catch up
      // (needs to reach target before target reaches destination)
      if (interceptor.systemId === targetFleet.systemId && targetFleet.destination) {
        // Interceptor at same origin, faster, can catch
        const destId = targetFleet.destination;
        const distToTarget = distanceBetweenSystems(
          interceptor.systemId,
          destId,
          state,
        );
        const interceptorEta = Math.ceil(distToTarget / interceptorSpeed);
        if (interceptorEta < targetFleet.eta) {
          interceptions.push({
            interceptorFleetId: interceptor.id,
            targetFleetId: targetFleet.id,
            systemId: destId,
          });
        }
      }
    }
  }

  return interceptions;
}

/**
 * Process fleet interceptions - mark both fleets as in combat.
 */
function processInterceptions(
  state: GameState,
  interceptions: InterceptionResult[],
): { state: GameState; events: TurnEvent[] } {
  if (interceptions.length === 0) {
    return { state, events: [] };
  }

  let next = state;
  const events: TurnEvent[] = [];
  const updatedFleetsById = { ...next.fleets.byId };

  for (const interception of interceptions) {
    const interceptor = updatedFleetsById[interception.interceptorFleetId];
    const target = updatedFleetsById[interception.targetFleetId];

    if (!interceptor || !target) continue;

    // Mark both fleets as in combat
    updatedFleetsById[interception.interceptorFleetId] = {
      ...interceptor,
      isInCombat: true,
    };
    updatedFleetsById[interception.targetFleetId] = {
      ...target,
      isInCombat: true,
      // Stop the target fleet at the interception point
      destination: null,
      eta: 0,
      systemId: interception.systemId,
    };

    // Generate event for player if involved
    const system = next.galaxy.systems.byId[interception.systemId];
    const systemName = system?.name ?? interception.systemId;

    if (interceptor.ownerId === next.empires.playerId) {
      events.push({
        type: 'combat',
        title: 'Fleet Intercept!',
        description: `Your fleet has intercepted an enemy fleet en route to ${systemName}.`,
        empireId: next.empires.playerId,
        systemId: interception.systemId,
        planetId: null,
        combatId: null,
        techId: null,
        designId: null,
        turn: next.turn,
      });
    } else if (target.ownerId === next.empires.playerId) {
      events.push({
        type: 'combat',
        title: 'Fleet Intercepted!',
        description: `Your fleet has been intercepted by an enemy fleet near ${systemName}!`,
        empireId: next.empires.playerId,
        systemId: interception.systemId,
        planetId: null,
        combatId: null,
        techId: null,
        designId: null,
        turn: next.turn,
      });
    }
  }

  // Update system fleetIds for intercepted fleets that changed position
  const systemUpdates: Record<SystemId, string[]> = {};
  for (const interception of interceptions) {
    const target = state.fleets.byId[interception.targetFleetId];
    if (!target) continue;

    // Remove from old system
    const oldSystemId = target.systemId;
    if (oldSystemId !== interception.systemId) {
      const oldSystem = next.galaxy.systems.byId[oldSystemId];
      if (oldSystem) {
        systemUpdates[oldSystemId] = (systemUpdates[oldSystemId] ?? oldSystem.fleetIds)
          .filter((id) => id !== interception.targetFleetId);
      }
      // Add to new system
      const newSystem = next.galaxy.systems.byId[interception.systemId];
      if (newSystem) {
        const currentFleets = systemUpdates[interception.systemId] ?? newSystem.fleetIds;
        if (!currentFleets.includes(interception.targetFleetId)) {
          systemUpdates[interception.systemId] = [...currentFleets, interception.targetFleetId];
        }
      }
    }
  }

  // Apply system updates
  const updatedSystemsById = { ...next.galaxy.systems.byId };
  for (const [sysId, fleetIds] of Object.entries(systemUpdates)) {
    const sys = updatedSystemsById[sysId];
    if (sys) {
      updatedSystemsById[sysId] = { ...sys, fleetIds };
    }
  }

  next = {
    ...next,
    fleets: {
      ...next.fleets,
      byId: updatedFleetsById,
    },
    galaxy: {
      ...next.galaxy,
      systems: {
        ...next.galaxy.systems,
        byId: updatedSystemsById,
      },
    },
  };

  return { state: next, events };
}

function processPhaseMovement(
  state: GameState,
  _preTurnState: GameState,
): PhaseProcessorResult {
  // Step 1: Detect fleet interceptions (before movement)
  const interceptions = detectFleetInterceptions(state);

  // Step 2: Process interceptions (marks fleets as in-combat, stops intercepted fleet)
  const { state: stateAfterInterceptions, events } = processInterceptions(
    state,
    interceptions,
  );

  // Step 3: Process normal fleet movement for non-intercepted fleets
  const next = processFleetMovement(stateAfterInterceptions);

  // Count fleets that moved
  let fleetsMoved = 0;
  for (const fleetId of next.fleets.allIds) {
    const fleet = next.fleets.byId[fleetId];
    const oldFleet = state.fleets.byId[fleetId];
    if (fleet && oldFleet && fleet.systemId !== oldFleet.systemId) {
      fleetsMoved++;
    }
  }

  let summary = `${fleetsMoved} fleets moved this turn.`;
  if (interceptions.length > 0) {
    summary += ` ${interceptions.length} fleet interception(s) occurred.`;
  }

  const output: PhaseOutput = {
    phase: TurnPhase.Movement,
    summary,
    events,
    metrics: {
      fleetsMoved,
      interceptions: interceptions.length,
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
  /**
   * Phase 9: Events
   * Design source: design/game-mechanics/random-events.md
   *
   * 1. Process active multi-turn events (plague, comet countdown, etc.)
   * 2. Process monster movement (roaming toward colonies)
   * 3. Roll for new random events
   */
  let next = state;
  const allEvents: TurnEvent[] = [];

  // Step 1: Process active multi-turn events
  const activeResult = processActiveEvents(next);
  next = activeResult.state;
  allEvents.push(...activeResult.events);

  // Step 2: Process monster movement
  const monsterResult = processMonsterMovement(next);
  next = monsterResult.state;
  allEvents.push(...monsterResult.events);

  // Step 3: Roll for new random events
  next = processRandomEvents(next);

  const newEventsTriggered = allEvents.length;
  const summary =
    newEventsTriggered > 0
      ? `${newEventsTriggered} event(s) occurred this turn.`
      : 'No random events this turn.';

  const output: PhaseOutput = {
    phase: TurnPhase.Events,
    summary,
    events: allEvents,
    metrics: {
      eventsTriggered: newEventsTriggered,
      activeEventsCount: next.activeEvents?.length ?? 0,
      activeMonstersCount: next.monsters?.length ?? 0,
    },
  };

  return { state: next, output };
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
