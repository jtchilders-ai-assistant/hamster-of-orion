/**
 * New game action and reducer — pure TypeScript, NO DOM.
 * src/game/actions/newGame.ts
 *
 * Handles START_GAME action: galaxy generation, empire setup, initial state.
 */

import { Action } from '../store';
import { GameState, Empire, AIEmpire, EmpireId, DifficultyLevel, GalaxySize, ResearchState, AIPersonality, AITrait } from '../state';
import { generateGalaxy } from '../generators/galaxy';
import { initialState } from '../initialState';
import racesData from '../../data/races.json';
import {
  getRace,
  startingRelationship,
  isBloodEnemiesAll,
  getRandomLeaderName,
} from '../systems/races';
import { getStartingConditions } from '../systems/difficulty';
import { getPersonalityProfile } from '../ai/ai-personalities';

// ── Types ─────────────────────────────────────────────────────────────────────

export type GalaxyAge = 'young' | 'average' | 'old';

export interface NewGameOptions {
  galaxySize: GalaxySize;
  opponents: number;           // 1-9
  difficulty: DifficultyLevel; // 'simple' | 'easy' | 'average' | 'hard' | 'impossible' | 'custom'
  galaxyAge: GalaxyAge;
  raceId: string;
  empireColor: string;
  emperorName: string;
  homeworldName: string;
  seed: number;
}

// ── Race data types ───────────────────────────────────────────────────────────

interface RaceData {
  id: string;
  name: string;
  description: string;
  homeworld: { name: string; type: string };
}

// ── Action creator ────────────────────────────────────────────────────────────

export const startGame = (options: NewGameOptions): Action => ({
  type: 'START_GAME',
  payload: options,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Create initial research state with race-specific starting technologies.
 */
function buildResearchState(raceId: string): ResearchState {
  const race = getRace(raceId);
  return {
    currentTech: null,
    researchPoints: 0,
    researchPerTurn: 0,
    completedTechs: [...race.startingTechnologies],
    availableTechs: {
      weapons: [],
      propulsion: [],
      construction: [],
      computers: [],
      force_fields: [],
      biotechnology: [],
    },
    miniaturization: {},
    stolenTechs: [],
  };
}

/**
 * Build diplomatic relations for an empire.
 * Uses race-specific starting relationship calculations and handles special cases
 * like Ferrets' blood_enemies_all status.
 *
 * Design compliance: design/diplomacy/relationship-formulas.md Section 5.3
 * Starting relations use Racial Attitude Matrix only - no player bonus modifier.
 */
function buildRelations(
  empireA: EmpireId,
  raceAId: string,
  allEmpiresWithRaces: Array<{ empireId: EmpireId; raceId: string }>,
  isPlayer: boolean,
): Empire['relations'] {
  const relations: Empire['relations'] = {};
  const isBloodEnemy = isBloodEnemiesAll(raceAId);

  for (const { empireId: otherId, raceId: otherRaceId } of allEmpiresWithRaces) {
    if (otherId === empireA) continue;

    const otherIsBloodEnemy = isBloodEnemiesAll(otherRaceId);

    // Calculate base relationship using both races' diplomacy bonuses
    // Per design doc: use Racial Attitude Matrix only, no player-specific bonus
    const baseRelationValue = startingRelationship(raceAId, otherRaceId);

    // Determine if we start at war (Ferrets mechanic)
    const startsAtWar = isBloodEnemy || otherIsBloodEnemy;
    const relationState = startsAtWar ? 'war' : 'neutral';

    // Blood enemies start at very negative relations
    let finalRelationValue = baseRelationValue;
    if (startsAtWar) {
      finalRelationValue = Math.min(baseRelationValue, -40);
    }

    relations[otherId] = {
      empireA,
      empireB: otherId,
      value: Math.round(finalRelationValue),
      state: relationState,
      treaties: [],
      events: [],
      warStartTurn: startsAtWar ? 1 : null,
      lastContact: isPlayer ? 1 : -1,
      modifiers: [],
      incomingProposals: [],
    };
  }
  return relations;
}

/**
 * Map AI behavior archetype to personality type for AI state.
 */
function archetypeToPersonalityType(archetype: string): AIPersonality['type'] {
  const mapping: Record<string, AIPersonality['type']> = {
    diplomat: 'diplomatic',
    industrialist: 'builder',
    erratic_industrialist: 'erratic',
    researcher: 'scientific',
    aggressive_expansionist: 'expansionist',
    xenophobic_expansionist: 'expansionist',
    aggressive: 'aggressive',
    honorable_militarist: 'balanced',
    sneaky: 'erratic',
  };
  return mapping[archetype] ?? 'balanced';
}

/**
 * Map AI behavior archetype to AI traits.
 */
function archetypeToTraits(archetype: string, raceId: string): AITrait[] {
  const traits: AITrait[] = [];
  const race = getRace(raceId);

  switch (archetype) {
    case 'diplomat':
      traits.push('honorable');
      break;
    case 'industrialist':
      // Ants have hive mind but it's not an AITrait - they're immune to espionage
      if (race.immuneToEspionage) traits.push('logical');
      break;
    case 'erratic_industrialist':
      traits.push('logical');
      break;
    case 'researcher':
      traits.push('logical', 'tech_trader');
      break;
    case 'aggressive_expansionist':
      // Rabbits - no specific traits
      break;
    case 'xenophobic_expansionist':
      traits.push('xenophobic');
      break;
    case 'aggressive':
      traits.push('war_monger');
      break;
    case 'honorable_militarist':
      traits.push('honorable');
      break;
    case 'sneaky':
      traits.push('backstabber', 'xenophobic');
      break;
  }

  return traits;
}

/**
 * Map AI archetype to strategic primary goal.
 */
function archetypeToPrimaryStrategy(archetype: string): AIEmpire['strategy']['primary'] {
  const mapping: Record<string, AIEmpire['strategy']['primary']> = {
    diplomat: 'diplomatic_victory',
    industrialist: 'expansion',
    erratic_industrialist: 'tech_advantage',
    researcher: 'tech_advantage',
    aggressive_expansionist: 'expansion',
    xenophobic_expansionist: 'expansion',
    aggressive: 'military_supremacy',
    honorable_militarist: 'military_supremacy',
    sneaky: 'survival', // Sneaky races focus on survival through subterfuge
  };
  return mapping[archetype] ?? 'expansion';
}

/**
 * Map AI archetype to military stance.
 */
function archetypeToMilitaryStance(archetype: string, declaresWarFirst: boolean): AIEmpire['strategy']['militaryStance'] {
  if (declaresWarFirst) return 'aggressive';
  if (archetype === 'researcher' || archetype === 'diplomat') return 'defensive';
  return 'neutral';
}

/**
 * Map AI archetype to diplomatic goal.
 */
function archetypeToDiplomaticGoal(archetype: string): AIEmpire['strategy']['diplomaticGoal'] {
  if (archetype === 'diplomat') return 'alliances';
  if (archetype === 'xenophobic_expansionist' || archetype === 'sneaky') return 'isolation';
  if (archetype === 'aggressive') return 'domination';
  return 'alliances';
}

/**
 * Build player empire with difficulty-based starting conditions.
 *
 * Design compliance: design/game-mechanics/difficulty.md §Starting Conditions
 * Player starting treasury (BC) varies by difficulty:
 *   Simple: 100 BC, Easy: 50 BC, Average/Hard/Impossible: 0 BC
 */
function buildPlayerEmpire(
  empireId: EmpireId,
  options: NewGameOptions,
  allEmpiresWithRaces: Array<{ empireId: EmpireId; raceId: string }>,
): Empire {
  const relations = buildRelations(empireId, options.raceId, allEmpiresWithRaces, true);
  const research = buildResearchState(options.raceId);
  const startingConditions = getStartingConditions(options.difficulty, true);

  return {
    id: empireId,
    raceId: options.raceId,
    name: options.emperorName,
    isPlayer: true,
    credits: startingConditions.reserveBC,
    creditPerTurn: 0,
    planets: [],
    fleets: [],
    shipDesigns: [],
    scannerTechLevel: 0,
    computerTechLevel: 0,
    securityLevel: 0,
    exploredSystems: [],
    visibleSystems: [],
    research,
    relations,
    isDefeated: false,
    defeatedTurn: null,
  };
}

/**
 * Build AI empire with Average-level starting conditions.
 *
 * Design compliance: design/game-mechanics/difficulty.md §Starting Conditions
 * "AI empires always start with Average-level conditions (40 pop, 30 factories, 1 scout, 0 BC)"
 */
function buildAIEmpire(
  empireId: EmpireId,
  raceId: string,
  allEmpiresWithRaces: Array<{ empireId: EmpireId; raceId: string }>,
  seed: number,
  index: number,
): { empire: Empire; ai: AIEmpire } {
  const race = getRace(raceId);
  const aiBehavior = race.aiBehavior;

  // Use race-specific leader name
  const leaderName = getRandomLeaderName(raceId, seed + index);

  const relations = buildRelations(empireId, raceId, allEmpiresWithRaces, false);
  const research = buildResearchState(raceId);
  const startingConditions = getStartingConditions('average', false);

  const empire: Empire = {
    id: empireId,
    raceId: raceId,
    name: leaderName,
    isPlayer: false,
    credits: startingConditions.reserveBC,
    creditPerTurn: 0,
    planets: [],
    fleets: [],
    shipDesigns: [],
    scannerTechLevel: 0,
    computerTechLevel: 0,
    securityLevel: 0,
    exploredSystems: [],
    visibleSystems: [],
    research,
    relations,
    isDefeated: false,
    defeatedTurn: null,
  };

  // Build AI personality from race's aiBehavior data, augmented by the
  // canonical per-race profile from ai-personalities.ts.
  // The canonical profile provides: baseFriendliness, warReluctance,
  // treatyBonus, backstabTendency — values not present in races.json.
  const canonicalProfile = getPersonalityProfile(raceId);
  const personality: AIPersonality = {
    type: archetypeToPersonalityType(aiBehavior.archetype),
    // Convert 0.0-1.0 scale to 0-100 scale
    aggression: Math.round(aiBehavior.aggression * 100),
    expansionism: Math.round(aiBehavior.expansion * 100),
    diplomacy: Math.round(aiBehavior.diplomacyPriority * 100),
    research: Math.round(aiBehavior.researchFocus * 100),
    traits: archetypeToTraits(aiBehavior.archetype, raceId),
    // Race-specific diplomacy modifiers from canonical profile
    baseFriendliness: canonicalProfile.baseFriendliness,
    warReluctance: canonicalProfile.warReluctance,
    treatyBonus: canonicalProfile.treatyBonus,
    backstabTendency: canonicalProfile.backstabTendency,
  };

  // Build strategy from race behavior
  const primaryStrategy = archetypeToPrimaryStrategy(aiBehavior.archetype);
  const militaryStance = archetypeToMilitaryStance(aiBehavior.archetype, aiBehavior.declaresWarFirst);
  const diplomaticGoal = archetypeToDiplomaticGoal(aiBehavior.archetype);

  // Determine economic focus based on race strengths
  let economicFocus: 'production' | 'research' | 'growth' = 'production';
  if (aiBehavior.researchFocus > aiBehavior.productionFocus) {
    economicFocus = 'research';
  } else if (race.bonuses.growth > 50) {
    economicFocus = 'growth';
  }

  const ai: AIEmpire = {
    id: empireId,
    raceId: raceId,
    empireName: leaderName,
    personality,
    strategy: {
      primary: primaryStrategy,
      secondary: primaryStrategy === 'expansion' ? 'tech_advantage' : 'expansion',
      economicFocus,
      militaryStance,
      diplomaticGoal,
      targetEmpires: {},
      targetSystems: [],
      lastEvaluation: 0,
      nextEvaluation: 5,
    },
    memory: {
      playerBetrayals: 0,
      playerAggression: 0,
      playerDiplomacy: 0,
      lastWars: [],
      failedInvasions: [],
      lostSystems: [],
      brokenTreaties: [],
      receivedHelp: [],
    },
    weights: {
      // Use race behavior to weight production allocation
      shipWeight: Math.round(20 * (1 + aiBehavior.aggression)),
      defenseWeight: aiBehavior.declaresWarFirst ? 10 : 20,
      industryWeight: Math.round(25 * aiBehavior.productionFocus),
      ecologyWeight: 20,
      researchWeight: Math.round(20 * (1 + aiBehavior.researchFocus)),
      // Research priorities based on race archetype
      weaponsPriority: aiBehavior.aggression > 0.5 ? 70 : 40,
      propulsionPriority: aiBehavior.expansion > 0.6 ? 60 : 45,
      constructionPriority: aiBehavior.productionFocus > 0.6 ? 65 : 50,
      computersPriority: aiBehavior.researchFocus > 0.6 ? 60 : 50,
      forceFieldsPriority: aiBehavior.declaresWarFirst ? 40 : 55,
      biotechPriority: race.bonuses.growth > 50 ? 60 : 45,
      // Military thresholds
      fleetSizeThreshold: aiBehavior.aggression > 0.6 ? 50 : 70,
      threatTolerance: Math.round(50 - aiBehavior.aggression * 20),
      retreatThreshold: aiBehavior.declaresWarFirst ? 20 : 35,
    },
  };

  return { empire, ai };
}

/**
 * Initialize war entries for empires at war (Ferrets blood_enemies_all).
 * Modifies the empires' relations in place to add wars_with entries.
 */
function initializeWars(empires: Record<EmpireId, Empire>): void {
  const empireList = Object.values(empires);

  for (const empire of empireList) {
    // Find all empires we're at war with based on relations
    const warsWithIds: EmpireId[] = [];

    for (const [otherId, relation] of Object.entries(empire.relations)) {
      if (relation.state === 'war') {
        warsWithIds.push(otherId as EmpireId);
      }
    }

    // Update the empire with wars_with if not already present
    if (warsWithIds.length > 0) {
      (empire as any).wars_with = warsWithIds;
    }
  }
}

// ── Reducer ───────────────────────────────────────────────────────────────────

export function newGameReducer(state: GameState, action: Action): GameState {
  if (action.type !== 'START_GAME') return state;

  const options = action.payload as NewGameOptions;
  const { galaxySize, opponents, difficulty, galaxyAge: _galaxyAge, raceId, emperorName, homeworldName, seed } = options;

  // Clamp opponents to valid range
  const numOpponents = Math.max(1, Math.min(9, opponents));
  const playerCount = 1 + numOpponents;

  // Build empire IDs
  const playerEmpireId: EmpireId = 'player';
  const aiEmpireIds: EmpireId[] = Array.from({ length: numOpponents }, (_, i) => `ai_${i}`);
  const allEmpireIds: EmpireId[] = [playerEmpireId, ...aiEmpireIds];

  // Generate galaxy
  const { galaxy, planets, planetIds } = generateGalaxy({
    size: galaxySize,
    shape: 'spiral',
    seed,
    playerCount,
    empireIds: allEmpireIds,
  });

  // Pick AI races (pick races other than player's)
  const races: RaceData[] = (racesData as { races: RaceData[] }).races;
  const otherRaces = races.filter((r) => r.id !== raceId);
  const aiRaces: RaceData[] = [];
  for (let i = 0; i < numOpponents; i++) {
    aiRaces.push(otherRaces[i % otherRaces.length]);
  }

  // Build list of all empires with their races for relationship calculation
  const allEmpiresWithRaces: Array<{ empireId: EmpireId; raceId: string }> = [
    { empireId: playerEmpireId, raceId: raceId },
    ...aiEmpireIds.map((id, i) => ({ empireId: id, raceId: aiRaces[i].id })),
  ];

  // Build empires using race-specific data
  const playerEmpire = buildPlayerEmpire(playerEmpireId, options, allEmpiresWithRaces);

  const aiEmpiresById: Record<EmpireId, Empire> = {};
  const aiEmpireStates: Record<EmpireId, AIEmpire> = {};
  for (let i = 0; i < numOpponents; i++) {
    const id = aiEmpireIds[i];
    const { empire, ai } = buildAIEmpire(id, aiRaces[i].id, allEmpiresWithRaces, seed, i);
    aiEmpiresById[id] = empire;
    aiEmpireStates[id] = ai;
  }

  // Combine all empires for war initialization
  const allEmpires: Record<EmpireId, Empire> = {
    [playerEmpireId]: { ...playerEmpire, name: emperorName },
    ...aiEmpiresById,
  };

  // Initialize wars for Ferrets blood_enemies_all
  initializeWars(allEmpires);

  // Set homeworld name for player's home system
  const playerHomeSystemId = galaxy.homeSystemIds[playerEmpireId];
  let updatedGalaxy = galaxy;
  if (playerHomeSystemId && galaxy.systems.byId[playerHomeSystemId]) {
    updatedGalaxy = {
      ...galaxy,
      systems: {
        ...galaxy.systems,
        byId: {
          ...galaxy.systems.byId,
          [playerHomeSystemId]: {
            ...galaxy.systems.byId[playerHomeSystemId],
            name: homeworldName || galaxy.systems.byId[playerHomeSystemId].name,
          },
        },
      },
    };
  }

  // Apply difficulty-based starting conditions to player homeworld
  // Design compliance: design/game-mechanics/difficulty.md §Starting Conditions
  // Player homeworld population/factories vary by difficulty:
  //   Simple: 50 pop, 40 factories | Easy: 45 pop, 35 factories | Average+: 40 pop, 30 factories
  const playerStartingConditions = getStartingConditions(difficulty, true);
  let updatedPlanets = { ...planets };
  if (playerHomeSystemId) {
    const playerHomeSystem = updatedGalaxy.systems.byId[playerHomeSystemId];
    if (playerHomeSystem && playerHomeSystem.planetIds.length > 0) {
      const playerHomeworldId = playerHomeSystem.planetIds[0];
      const playerHomeworld = planets[playerHomeworldId];
      if (playerHomeworld) {
        updatedPlanets = {
          ...updatedPlanets,
          [playerHomeworldId]: {
            ...playerHomeworld,
            population: playerStartingConditions.population,
            factories: playerStartingConditions.factories,
          },
        };
      }
    }
  }

  // Assemble fresh GameState
  const now = Date.now();
  const newState: GameState = {
    ...initialState,
    version: state.version,
    seed: String(seed),
    turn: 1,
    year: 2624, // 2623 + 1 per design/game-mechanics/turn-structure.md
    difficulty,
    isPaused: false,
    gameSpeed: 'normal',
    currentScreen: 'galaxy',

    victoryCondition: null,
    defeatedTurn: null,

    createdAt: now,
    lastPlayed: now,
    playTime: 0,

    galaxy: updatedGalaxy,

    planets: {
      byId: updatedPlanets,
      allIds: planetIds,
    },

    fleets: { byId: {}, allIds: [] },
    ships: { byId: {}, allIds: [] },
    shipDesigns: { byId: {}, allIds: [] },

    empires: {
      byId: allEmpires,
      allIds: allEmpireIds,
      playerId: playerEmpireId,
    },

    combats: { byId: {}, allIds: [], activeCombatId: null },

    aiEmpires: aiEmpireStates,

    highCouncil: null,

    spyMissions: [],

    ui: {
      ...initialState.ui,
      currentScreen: 'galaxy',
      previousScreen: 'menu',
      selectedSystem: playerHomeSystemId ?? null,
    },
  };

  return newState;
}
