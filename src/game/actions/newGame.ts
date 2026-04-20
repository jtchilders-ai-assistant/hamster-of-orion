/**
 * New game action and reducer — pure TypeScript, NO DOM.
 * src/game/actions/newGame.ts
 *
 * Handles START_GAME action: galaxy generation, empire setup, initial state.
 */

import { Action } from '../store';
import { GameState, Empire, AIEmpire, EmpireId, DifficultyLevel, GalaxySize, ResearchState } from '../state';
import { generateGalaxy } from '../generators/galaxy';
import { initialState } from '../initialState';
import racesData from '../../data/races.json';

// ── Types ─────────────────────────────────────────────────────────────────────

export type GalaxyAge = 'young' | 'average' | 'old';

export interface NewGameOptions {
  galaxySize: GalaxySize;
  opponents: number;           // 1-9
  difficulty: DifficultyLevel; // 'easy' | 'normal' | 'hard' | 'impossible'
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

function emptyResearchState(): ResearchState {
  return {
    currentTech: null,
    researchPoints: 0,
    researchPerTurn: 0,
    completedTechs: [],
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

function buildRelations(
  empireA: EmpireId,
  allEmpireIds: EmpireId[],
  isPlayer: boolean,
): Empire['relations'] {
  const relations: Empire['relations'] = {};
  for (const otherId of allEmpireIds) {
    if (otherId === empireA) continue;
    relations[otherId] = {
      empireA,
      empireB: otherId,
      value: isPlayer ? 50 : 40,
      state: 'neutral',
      treaties: [],
      events: [],
      warStartTurn: null,
      lastContact: isPlayer ? 1 : -1,
      modifiers: [],
    };
  }
  return relations;
}

function buildPlayerEmpire(
  empireId: EmpireId,
  options: NewGameOptions,
  allEmpireIds: EmpireId[],
): Empire {
  const relations = buildRelations(empireId, allEmpireIds, true);

  return {
    id: empireId,
    raceId: options.raceId,
    name: options.emperorName,
    isPlayer: true,
    credits: 250,
    creditPerTurn: 0,
    planets: [],
    fleets: [],
    shipDesigns: [],
    research: emptyResearchState(),
    relations,
    isDefeated: false,
    defeatedTurn: null,
  };
}

function buildAIEmpire(
  empireId: EmpireId,
  raceData: RaceData,
  allEmpireIds: EmpireId[],
): { empire: Empire; ai: AIEmpire } {
  const relations = buildRelations(empireId, allEmpireIds, false);

  const empire: Empire = {
    id: empireId,
    raceId: raceData.id,
    name: `Emperor of ${raceData.name}`,
    isPlayer: false,
    credits: 250,
    creditPerTurn: 0,
    planets: [],
    fleets: [],
    shipDesigns: [],
    research: emptyResearchState(),
    relations,
    isDefeated: false,
    defeatedTurn: null,
  };

  const ai: AIEmpire = {
    id: empireId,
    raceId: raceData.id,
    empireName: empire.name,
    personality: {
      type: 'balanced',
      aggression: 50,
      expansionism: 50,
      diplomacy: 50,
      research: 50,
      traits: [],
    },
    strategy: {
      primary: 'expansion',
      secondary: 'tech_advantage',
      economicFocus: 'production',
      militaryStance: 'neutral',
      diplomaticGoal: 'alliances',
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
      shipWeight: 20,
      defenseWeight: 15,
      industryWeight: 25,
      ecologyWeight: 20,
      researchWeight: 20,
      weaponsPriority: 50,
      propulsionPriority: 50,
      constructionPriority: 50,
      computersPriority: 50,
      forceFieldsPriority: 50,
      biotechPriority: 50,
      fleetSizeThreshold: 60,
      threatTolerance: 40,
      retreatThreshold: 30,
    },
  };

  return { empire, ai };
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

  // Build empires
  const playerEmpire = buildPlayerEmpire(playerEmpireId, options, allEmpireIds);

  const aiEmpiresById: Record<EmpireId, Empire> = {};
  const aiEmpireStates: Record<EmpireId, AIEmpire> = {};
  for (let i = 0; i < numOpponents; i++) {
    const id = aiEmpireIds[i];
    const { empire, ai } = buildAIEmpire(id, aiRaces[i], allEmpireIds);
    aiEmpiresById[id] = empire;
    aiEmpireStates[id] = ai;
  }

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

  // Assemble fresh GameState
  const now = Date.now();
  const newState: GameState = {
    ...initialState,
    version: state.version,
    seed: String(seed),
    turn: 1,
    year: 2501,
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
      byId: planets,
      allIds: planetIds,
    },

    fleets: { byId: {}, allIds: [] },
    ships: { byId: {}, allIds: [] },
    shipDesigns: { byId: {}, allIds: [] },

    empires: {
      byId: {
        [playerEmpireId]: { ...playerEmpire, name: emperorName },
        ...aiEmpiresById,
      },
      allIds: allEmpireIds,
      playerId: playerEmpireId,
    },

    combats: { byId: {}, allIds: [], activeCombatId: null },

    aiEmpires: aiEmpireStates,

    highCouncil: null,

    ui: {
      ...initialState.ui,
      currentScreen: 'galaxy',
      previousScreen: 'menu',
      selectedSystem: playerHomeSystemId ?? null,
    },
  };

  return newState;
}
