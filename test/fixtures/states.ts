/**
 * Test state fixtures for unit tests and debug interface testing.
 * test/fixtures/states.ts
 */

import { GameState, Empire, ResearchState } from '../../src/game/state';
import { initialState } from '../../src/game/initialState';

// ── Shared helpers ────────────────────────────────────────────────────────────

const baseResearch: ResearchState = {
  currentTech: null,
  researchPoints: 0,
  researchPerTurn: 20,
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

const playerEmpireBase: Empire = {
  id: 'player',
  raceId: 'human',
  name: 'Human Empire',
  isPlayer: true,
  credits: 500,
  creditPerTurn: 30,
  planets: ['planet_earth'],
  fleets: [],
  shipDesigns: [],
  research: baseResearch,
  relations: {},
  isDefeated: false,
  defeatedTurn: null,
};

// ── Early game fixture ────────────────────────────────────────────────────────

/**
 * Early-game state: turn 1, single home planet colonised, no research completed.
 */
export const earlyGameState: GameState = {
  ...initialState,
  seed: 'early-game-fixture',
  turn: 1,
  year: 2501,
  currentScreen: 'galaxy',
  empires: {
    byId: {
      player: { ...playerEmpireBase },
    },
    allIds: ['player'],
    playerId: 'player',
  },
};

// ── Mid game fixture ──────────────────────────────────────────────────────────

/**
 * Mid-game state: turn 50, multiple planets, active research, modest fleet.
 */
export const midGameState: GameState = {
  ...initialState,
  seed: 'mid-game-fixture',
  turn: 50,
  year: 2550,
  currentScreen: 'galaxy',
  empires: {
    byId: {
      player: {
        ...playerEmpireBase,
        credits: 2400,
        creditPerTurn: 140,
        planets: ['planet_earth', 'planet_alpha', 'planet_beta'],
        fleets: ['fleet_1'],
        research: {
          ...baseResearch,
          currentTech: 'tech_nuclear_drive',
          researchPoints: 120,
          researchPerTurn: 65,
          completedTechs: ['tech_battle_scanner'],
          availableTechs: {
            weapons: ['tech_fusion_rifle'],
            propulsion: ['tech_nuclear_drive'],
            construction: [],
            computers: ['tech_battle_scanner'],
            force_fields: [],
            biotechnology: [],
          },
        },
      },
      ai_1: {
        id: 'ai_1',
        raceId: 'psilon',
        name: 'Psilon Republic',
        isPlayer: false,
        credits: 1800,
        creditPerTurn: 90,
        planets: ['planet_psilon_home'],
        fleets: [],
        shipDesigns: [],
        research: {
          ...baseResearch,
          researchPerTurn: 110,
          completedTechs: ['tech_battle_scanner', 'tech_fusion_rifle'],
        },
        relations: {
          player: {
            empireA: 'ai_1',
            empireB: 'player',
            value: 30,
            state: 'neutral',
            treaties: [],
            events: [],
            warStartTurn: null,
            lastContact: 40,
          },
        },
        isDefeated: false,
        defeatedTurn: null,
      },
    },
    allIds: ['player', 'ai_1'],
    playerId: 'player',
  },
};
