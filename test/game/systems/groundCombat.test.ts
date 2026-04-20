/**
 * Ground combat system tests.
 * test/game/systems/groundCombat.test.ts
 *
 * NO DOM imports — pure TypeScript only.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateGroundCombatOdds,
  executeGroundCombat,
  transferTroops,
  capturePlanet,
} from '../../../src/game/systems/groundCombat';
import { GameState, Fleet, Planet, Empire, StarSystem } from '../../../src/game/state';

// ── Test fixture helpers ──────────────────────────────────────────────────────

function makeMinimalState(): GameState {
  return {
    version: '0.1.0',
    seed: 'test',
    turn: 1,
    year: 2501,
    difficulty: 'normal',
    isPaused: false,
    gameSpeed: 'normal',
    currentScreen: 'galaxy',
    victoryCondition: null,
    defeatedTurn: null,
    isGameOver: false,
    victoryResult: null,
    createdAt: Date.now(),
    lastPlayed: Date.now(),
    playTime: 0,
    galaxy: {
      id: 'test-galaxy',
      size: 'small',
      shape: 'spiral',
      width: 10,
      height: 10,
      systemCount: 1,
      systems: { byId: {}, allIds: [] },
      nebulae: [],
      clusters: [],
      artifactsSystemIds: [],
      orionSystemId: '',
      homeSystemIds: {},
      fogOfWar: {},
      quadTree: {
        bounds: { x: 0, y: 0, width: 10, height: 10 },
        systemIds: [],
        children: null,
      },
    },
    planets: { byId: {}, allIds: [] },
    fleets: { byId: {}, allIds: [] },
    ships: { byId: {}, allIds: [] },
    shipDesigns: { byId: {}, allIds: [] },
    empires: { byId: {}, allIds: [], playerId: 'player' },
    combats: { byId: {}, allIds: [], activeCombatId: null },
    aiEmpires: {},
    highCouncil: null,
    spyMissions: [],
    ui: {
      currentScreen: 'galaxy',
      previousScreen: null,
      selectedSystem: null,
      selectedPlanet: null,
      selectedFleet: null,
      selectedShip: null,
      camera: { x: 0, y: 0, zoom: 1, target: null },
      modals: {
        shipDesigner: { open: false },
        diplomacy: { open: false },
        combat: { open: false },
        victory: { open: false },
      },
      notifications: [],
      filters: { planetsSort: 'name', fleetsFilter: 'all' },
      settings: {
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
        showTutorials: false,
        colorBlindMode: false,
        textSize: 100,
        highContrast: false,
        screenReaderEnabled: false,
        customHotkeys: {},
      },
    },
  };
}

function makePlanet(id: string, systemId: string, ownerId: string, population: number): Planet {
  return {
    id,
    name: `Planet ${id}`,
    systemId,
    orbit: 1,
    type: 'terran',
    size: 'medium',
    gravity: 1.0,
    ownerId,
    isColonized: true,
    isHomeworld: false,
    population,
    maxPopulation: 100,
    growthRate: 1.0,
    morale: 'content',
    factories: 10,
    maxFactories: 100,
    waste: 0,
    production: { ship: 0, defense: 0, industry: 50, ecology: 25, research: 25 },
    buildQueue: [],
    buildings: [],
    missileBases: 0,
    maxMissileBases: 10,
    planetaryShield: 0,
    groundAttack: 1,
    groundDefense: 1,
    isRich: false,
    isPoor: false,
    isGaia: false,
    hasArtifacts: false,
    currentDesignId: null,
    shipyardProgress: 0,
    resourceLevel: 'normal',
    researchMultiplier: 1.0,
    startingPopulation: null,
    startingFactories: null,
  };
}

function makeFleet(id: string, ownerId: string, systemId: string, troops: number): Fleet {
  return {
    id,
    name: `Fleet ${id}`,
    ownerId,
    shipIds: ['ship1', 'ship2'], // 2 ships for bombardment bonus
    systemId,
    troops,
    destination: null,
    eta: 0,
    route: [],
    movementPoints: 0,
    maxMovement: 4,
    orders: { type: 'none' },
    experience: 'regular',
    isInCombat: false,
    combatId: null,
  };
}

function makeEmpire(id: string, raceId: string, planets: string[], fleets: string[]): Empire {
  return {
    id,
    raceId,
    name: `Empire ${id}`,
    isPlayer: id === 'player',
    credits: 1000,
    creditPerTurn: 50,
    planets,
    fleets,
    shipDesigns: [],
    scannerTechLevel: 0,
    computerTechLevel: 0,
    securityLevel: 0,
    research: {
      currentTech: null,
      researchPoints: 0,
      researchPerTurn: 10,
      completedTechs: [],
      availableTechs: {},
      miniaturization: {},
      stolenTechs: [],
    },
    relations: {},
    exploredSystems: [],
    visibleSystems: [],
    isDefeated: false,
    defeatedTurn: null,
  };
}

function makeSystem(id: string, planetIds: string[], ownerId: string | null): StarSystem {
  return {
    id,
    name: `System ${id}`,
    coordinates: { x: 5, y: 5 },
    starType: 'yellow',
    starClass: 'G',
    planetIds,
    ownerId,
    hasAsteroids: false,
    hasNebula: false,
    nebulaId: null,
    hasWormhole: false,
    wormholeTarget: null,
    fleetIds: [],
    isOrion: false,
    hasGuardian: false,
    hasArtifacts: false,
    hasSpaceMonster: null,
    region: 'safe_zones',
    clusterId: null,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('calculateGroundCombatOdds', () => {
  it('should give attacker 100% chance with no defenders', () => {
    const result = calculateGroundCombatOdds(100, 0, 1, 1, 0);
    expect(result.attackerChance).toBe(1);
    expect(result.defenderChance).toBe(0);
  });

  it('should give defender 100% chance with no attackers', () => {
    const result = calculateGroundCombatOdds(0, 100, 1, 1, 0);
    expect(result.attackerChance).toBe(0);
    expect(result.defenderChance).toBe(1);
  });

  it('should give 50/50 odds with equal forces', () => {
    const result = calculateGroundCombatOdds(100, 100, 1, 1, 0);
    expect(result.attackerChance).toBeCloseTo(0.5, 2);
    expect(result.defenderChance).toBeCloseTo(0.5, 2);
  });

  it('should increase attacker chance with bombardment bonus', () => {
    const withoutBombardment = calculateGroundCombatOdds(100, 100, 1, 1, 0);
    const withBombardment = calculateGroundCombatOdds(100, 100, 1, 1, 50);
    
    expect(withBombardment.attackerChance).toBeGreaterThan(withoutBombardment.attackerChance);
  });

  it('should increase defender chance with higher defense factor', () => {
    const lowDefense = calculateGroundCombatOdds(100, 100, 1, 1, 0);
    const highDefense = calculateGroundCombatOdds(100, 100, 2, 1, 0);
    
    expect(highDefense.defenderChance).toBeGreaterThan(lowDefense.defenderChance);
  });
});

describe('transferTroops', () => {
  it('should load troops from planet to fleet', () => {
    let state = makeMinimalState();
    const planet = makePlanet('p1', 's1', 'player', 50);
    const fleet = makeFleet('f1', 'player', 's1', 0);
    const empire = makeEmpire('player', 'hamsters', ['p1'], ['f1']);

    state.planets.byId.p1 = planet;
    state.planets.allIds = ['p1'];
    state.fleets.byId.f1 = fleet;
    state.fleets.allIds = ['f1'];
    state.empires.byId.player = empire;
    state.empires.allIds = ['player'];

    const result = transferTroops(state, 'player', 'f1', 'p1');

    expect(result.fleets.byId.f1.troops).toBe(10); // 20% of 50 population
  });

  it('should throw error if fleet not found', () => {
    const state = makeMinimalState();
    expect(() => transferTroops(state, 'player', 'nonexistent', 'p1')).toThrow();
  });

  it('should throw error if planet not found', () => {
    let state = makeMinimalState();
    const fleet = makeFleet('f1', 'player', 's1', 0);
    state.fleets.byId.f1 = fleet;

    expect(() => transferTroops(state, 'player', 'f1', 'nonexistent')).toThrow();
  });

  it('should throw error if fleet not owned by empire', () => {
    let state = makeMinimalState();
    const planet = makePlanet('p1', 's1', 'player', 50);
    const fleet = makeFleet('f1', 'enemy', 's1', 0);

    state.planets.byId.p1 = planet;
    state.fleets.byId.f1 = fleet;

    expect(() => transferTroops(state, 'player', 'f1', 'p1')).toThrow();
  });
});

describe('capturePlanet', () => {
  it('should change planet ownership to new owner', () => {
    let state = makeMinimalState();
    const planet = makePlanet('p1', 's1', 'defender', 50);
    const system = makeSystem('s1', ['p1'], 'defender');
    const attacker = makeEmpire('attacker', 'rats', [], []);
    const defender = makeEmpire('defender', 'hamsters', ['p1'], []);

    state.planets.byId.p1 = planet;
    state.planets.allIds = ['p1'];
    state.galaxy.systems.byId.s1 = system;
    state.galaxy.systems.allIds = ['s1'];
    state.empires.byId.attacker = attacker;
    state.empires.byId.defender = defender;
    state.empires.allIds = ['attacker', 'defender'];

    const result = capturePlanet(state, 'attacker', 'p1');

    expect(result.planets.byId.p1.ownerId).toBe('attacker');
  });

  it('should remove planet from old owner and add to new owner', () => {
    let state = makeMinimalState();
    const planet = makePlanet('p1', 's1', 'defender', 50);
    const system = makeSystem('s1', ['p1'], 'defender');
    const attacker = makeEmpire('attacker', 'rats', [], []);
    const defender = makeEmpire('defender', 'hamsters', ['p1'], []);

    state.planets.byId.p1 = planet;
    state.planets.allIds = ['p1'];
    state.galaxy.systems.byId.s1 = system;
    state.galaxy.systems.allIds = ['s1'];
    state.empires.byId.attacker = attacker;
    state.empires.byId.defender = defender;
    state.empires.allIds = ['attacker', 'defender'];

    const result = capturePlanet(state, 'attacker', 'p1');

    expect(result.empires.byId.attacker.planets).toContain('p1');
    expect(result.empires.byId.defender.planets).not.toContain('p1');
  });

  it('should reset build queue and production sliders', () => {
    let state = makeMinimalState();
    const planet = makePlanet('p1', 's1', 'defender', 50);
    planet.buildQueue = [{ type: 'ship', targetId: 'destroyer', targetName: 'Destroyer', costTotal: 100, costRemaining: 50, turnsRemaining: 5 }];
    planet.production = { ship: 40, defense: 20, industry: 20, ecology: 10, research: 10 };
    
    const system = makeSystem('s1', ['p1'], 'defender');
    const attacker = makeEmpire('attacker', 'rats', [], []);
    const defender = makeEmpire('defender', 'hamsters', ['p1'], []);

    state.planets.byId.p1 = planet;
    state.planets.allIds = ['p1'];
    state.galaxy.systems.byId.s1 = system;
    state.galaxy.systems.allIds = ['s1'];
    state.empires.byId.attacker = attacker;
    state.empires.byId.defender = defender;
    state.empires.allIds = ['attacker', 'defender'];

    const result = capturePlanet(state, 'attacker', 'p1');

    expect(result.planets.byId.p1.buildQueue).toEqual([]);
    expect(result.planets.byId.p1.production.ship).toBe(0);
  });

  it('should set morale to unrest on capture', () => {
    let state = makeMinimalState();
    const planet = makePlanet('p1', 's1', 'defender', 50);
    const system = makeSystem('s1', ['p1'], 'defender');
    const attacker = makeEmpire('attacker', 'rats', [], []);
    const defender = makeEmpire('defender', 'hamsters', ['p1'], []);

    state.planets.byId.p1 = planet;
    state.planets.allIds = ['p1'];
    state.galaxy.systems.byId.s1 = system;
    state.galaxy.systems.allIds = ['s1'];
    state.empires.byId.attacker = attacker;
    state.empires.byId.defender = defender;
    state.empires.allIds = ['attacker', 'defender'];

    const result = capturePlanet(state, 'attacker', 'p1');

    expect(result.planets.byId.p1.morale).toBe('unrest');
  });
});

describe('executeGroundCombat', () => {
  it('should execute combat and capture planet on attacker victory', () => {
    let state = makeMinimalState();
    const planet = makePlanet('p1', 's1', 'defender', 10); // Small population, weak defense
    const system = makeSystem('s1', ['p1'], 'defender');
    const fleet = makeFleet('f1', 'attacker', 's1', 100); // Large invasion force
    const attacker = makeEmpire('attacker', 'rats', [], ['f1']);
    const defender = makeEmpire('defender', 'hamsters', ['p1'], []);

    state.planets.byId.p1 = planet;
    state.planets.allIds = ['p1'];
    state.galaxy.systems.byId.s1 = system;
    state.galaxy.systems.allIds = ['s1'];
    state.fleets.byId.f1 = fleet;
    state.fleets.allIds = ['f1'];
    state.empires.byId.attacker = attacker;
    state.empires.byId.defender = defender;
    state.empires.allIds = ['attacker', 'defender'];

    // Mock Math.random to ensure attacker victory
    const originalRandom = Math.random;
    Math.random = () => 0.01; // Very low roll = attacker wins

    const result = executeGroundCombat(state, 'attacker', 'defender', 'p1');

    Math.random = originalRandom;

    expect(result.planets.byId.p1.ownerId).toBe('attacker');
    expect(result.fleets.byId.f1.troops).toBeLessThan(100); // Casualties
  });

  it('should reduce population on successful invasion', () => {
    let state = makeMinimalState();
    const planet = makePlanet('p1', 's1', 'defender', 50);
    const system = makeSystem('s1', ['p1'], 'defender');
    const fleet = makeFleet('f1', 'attacker', 's1', 100);
    const attacker = makeEmpire('attacker', 'rats', [], ['f1']);
    const defender = makeEmpire('defender', 'hamsters', ['p1'], []);

    state.planets.byId.p1 = planet;
    state.planets.allIds = ['p1'];
    state.galaxy.systems.byId.s1 = system;
    state.galaxy.systems.allIds = ['s1'];
    state.fleets.byId.f1 = fleet;
    state.fleets.allIds = ['f1'];
    state.empires.byId.attacker = attacker;
    state.empires.byId.defender = defender;
    state.empires.allIds = ['attacker', 'defender'];

    const originalRandom = Math.random;
    Math.random = () => 0.01;

    const result = executeGroundCombat(state, 'attacker', 'defender', 'p1');

    Math.random = originalRandom;

    expect(result.planets.byId.p1.population).toBeLessThan(50);
  });

  it('should preserve planet ownership on defender victory', () => {
    let state = makeMinimalState();
    const planet = makePlanet('p1', 's1', 'defender', 100); // Large population
    const system = makeSystem('s1', ['p1'], 'defender');
    const fleet = makeFleet('f1', 'attacker', 's1', 10); // Small invasion force
    const attacker = makeEmpire('attacker', 'rats', [], ['f1']);
    const defender = makeEmpire('defender', 'hamsters', ['p1'], []);

    state.planets.byId.p1 = planet;
    state.planets.allIds = ['p1'];
    state.galaxy.systems.byId.s1 = system;
    state.galaxy.systems.allIds = ['s1'];
    state.fleets.byId.f1 = fleet;
    state.fleets.allIds = ['f1'];
    state.empires.byId.attacker = attacker;
    state.empires.byId.defender = defender;
    state.empires.allIds = ['attacker', 'defender'];

    const originalRandom = Math.random;
    Math.random = () => 0.99; // Very high roll = defender wins

    const result = executeGroundCombat(state, 'attacker', 'defender', 'p1');

    Math.random = originalRandom;

    expect(result.planets.byId.p1.ownerId).toBe('defender');
    expect(result.fleets.byId.f1.troops).toBe(0); // All troops lost
  });

  it('should throw error if no fleet at system', () => {
    let state = makeMinimalState();
    const planet = makePlanet('p1', 's1', 'defender', 50);
    const system = makeSystem('s1', ['p1'], 'defender');
    const fleet = makeFleet('f1', 'attacker', 's2', 100); // Fleet in different system
    const attacker = makeEmpire('attacker', 'rats', [], ['f1']);
    const defender = makeEmpire('defender', 'hamsters', ['p1'], []);

    state.planets.byId.p1 = planet;
    state.galaxy.systems.byId.s1 = system;
    state.fleets.byId.f1 = fleet;
    state.empires.byId.attacker = attacker;
    state.empires.byId.defender = defender;
    state.empires.allIds = ['attacker', 'defender'];

    expect(() => executeGroundCombat(state, 'attacker', 'defender', 'p1')).toThrow();
  });
});
