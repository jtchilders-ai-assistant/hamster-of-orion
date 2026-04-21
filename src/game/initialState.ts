/**
 * Default initial game state — pure TypeScript, NO DOM.
 * src/game/initialState.ts
 */

import { GameState, GameSettings, UIState } from './state';

const defaultSettings: GameSettings = {
  masterVolume: 80,
  musicVolume: 70,
  sfxVolume: 80,
  ambientVolume: 60,
  particleEffects: true,
  animationSpeed: 'normal',
  showGrid: false,
  autosave: true,
  autosaveFrequency: 5,
  autoEndTurn: false,
  confirmEndTurn: true,
  showTutorials: true,
  colorBlindMode: false,
  textSize: 100,
  highContrast: false,
  screenReaderEnabled: false,
  customHotkeys: {},
};

const defaultUI: UIState = {
  currentScreen: 'menu',
  previousScreen: null,
  selectedSystem: null,
  selectedPlanet: null,
  selectedFleet: null,
  selectedShip: null,
  fleetDeploymentMode: null,
  camera: {
    x: 0,
    y: 0,
    zoom: 1.0,
    target: null,
  },
  modals: {
    shipDesigner: { open: false },
    diplomacy: { open: false },
    combat: { open: false },
    victory: { open: false },
  },
  notifications: [],
  filters: {
    planetsSort: 'name',
    fleetsFilter: 'all',
  },
  settings: defaultSettings,
};

export const initialState: GameState = {
  version: '0.1.0',
  seed: 'default',
  turn: 1,
  year: 2501,
  difficulty: 'normal',
  isPaused: false,
  gameSpeed: 'normal',
  currentScreen: 'menu',

  victoryCondition: null,
  defeatedTurn: null,
  isGameOver: false,
  victoryResult: null,

  createdAt: Date.now(),
  lastPlayed: Date.now(),
  playTime: 0,

  galaxy: {
    id: 'galaxy_0',
    size: 'medium',
    shape: 'spiral',
    width: 30,
    height: 30,
    systemCount: 0,
    systems: { byId: {}, allIds: [] },
    nebulae: [],
    clusters: [],
    artifactsSystemIds: [],
    orionSystemId: '',
    homeSystemIds: {},
    fogOfWar: {},
    quadTree: {
      bounds: { x: 0, y: 0, width: 30, height: 30 },
      systemIds: [],
      children: null,
    },
  },

  planets: { byId: {}, allIds: [] },
  fleets: { byId: {}, allIds: [] },
  ships: { byId: {}, allIds: [] },
  shipDesigns: { byId: {}, allIds: [] },

  empires: {
    byId: {},
    allIds: [],
    playerId: 'player',
  },

  combats: {
    byId: {},
    allIds: [],
    activeCombatId: null,
  },

  aiEmpires: {},

  highCouncil: null,

  spyMissions: [],

  ui: defaultUI,
};
