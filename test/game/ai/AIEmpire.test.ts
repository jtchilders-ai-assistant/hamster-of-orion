/**
 * AI Empire tests.
 * test/game/ai/AIEmpire.test.ts
 *
 * Tests for processAITurn(), processAllAITurns(), and the strategy helpers.
 * NO DOM imports — pure TypeScript only.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { processAITurn, processAllAITurns } from '../../../src/game/ai/AIEmpire';
import {
  getGamePhase,
  computeProductionSliders,
  findColonizationTargets,
  scorePlanetForColonization,
  isUnderThreat,
  shouldBuildMilitary,
  calculateShipPower,
  calculateFleetPower,
  getEmpireFleetPower,
} from '../../../src/game/ai/strategies';
import {
  GameState,
  Empire,
  Fleet,
  Ship,
  ShipDesign,
  Planet,
  StarSystem,
  AIEmpire,
  AIPersonality,
  AIStrategy,
  AIMemory,
  AIWeights,
} from '../../../src/game/state';
import { initialState } from '../../../src/game/initialState';

// ── Fixture helpers ───────────────────────────────────────────────────────────

function makeSystem(
  id: string,
  coords = { x: 0, y: 0 },
): StarSystem {
  return {
    id,
    name: `System ${id}`,
    coordinates: coords,
    starType: 'yellow',
    starClass: 'G',
    planetIds: [],
    ownerId: null,
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

function makePlanet(
  id: string,
  systemId: string,
  ownerId: string | null = null,
): Planet {
  return {
    id,
    name: `Planet ${id}`,
    systemId,
    orbit: 1,
    type: 'terran',
    size: 'large',
    gravity: 1.0,
    ownerId,
    isColonized: ownerId !== null,
    isHomeworld: false,
    population: ownerId !== null ? 50 : 0,
    maxPopulation: 100,
    growthRate: 0.02,
    morale: 'content',
    factories: ownerId !== null ? 20 : 0,
    maxFactories: 50,
    waste: 0,
    production: { ship: 20, defense: 20, industry: 20, ecology: 20, research: 20 },
    buildQueue: [],
    buildings: [],
    missileBases: 0,
    maxMissileBases: 10,
    planetaryShield: 0,
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

function makeShip(
  id: string,
  fleetId: string,
  designId: string,
  ownerId = 'ai1',
): Ship {
  return {
    id,
    name: `Ship ${id}`,
    designId,
    ownerId,
    fleetId,
    hp: 50,
    maxHp: 50,
    shieldHp: 0,
    maxShieldHp: 0,
    experience: 'rookie',
    kills: 0,
    combatPosition: null,
    hasActed: false,
    specialSystems: {},
  };
}

function makeFleet(
  id: string,
  systemId: string,
  shipIds: string[],
  ownerId = 'ai1',
): Fleet {
  return {
    id,
    name: `Fleet ${id}`,
    ownerId,
    shipIds,
    systemId,
    destination: null,
    eta: 0,
    route: [],
    movementPoints: 0,
    maxMovement: 0,
    orders: { type: 'none' },
    experience: 'rookie',
    isInCombat: false,
    combatId: null,
  };
}

function makeEmpire(
  id: string,
  planetIds: string[] = [],
  fleetIds: string[] = [],
  isPlayer = false,
): Empire {
  return {
    id,
    raceId: 'hamsters',
    name: `Empire ${id}`,
    isPlayer,
    credits: 1000,
    creditPerTurn: 50,
    planets: planetIds,
    fleets: fleetIds,
    shipDesigns: [],
    research: {
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
    },
    relations: {},
    isDefeated: false,
    defeatedTurn: null,
  };
}

function makeColonyShipDesign(id: string, ownerId = 'ai1'): ShipDesign {
  return {
    id,
    name: 'Colony Ship',
    class: 'large',
    ownerId,
    size: 100,
    spaceUsed: 80,
    spaceFree: 20,
    components: [
      {
        id: 'colony_base',
        type: 'special',
        name: 'Colony Base',
        space: 40,
        baseCost: 200,
        count: 1,
      },
      {
        id: 'nuclear_drive_1',
        type: 'engine',
        name: 'Nuclear Drive I',
        space: 10,
        baseCost: 20,
        count: 1,
      },
    ],
    stats: {
      attack: 0,
      defense: 0,
      hp: 50,
      speed: 2,
      cost: 400,
      manpower: 1,
      beamDefense: 0,
      missileDefense: 0,
      initiative: 0,
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 0,
  };
}

function makeMilitaryShipDesign(id: string, ownerId = 'ai1'): ShipDesign {
  return {
    id,
    name: 'Fighter',
    class: 'small',
    ownerId,
    size: 50,
    spaceUsed: 40,
    spaceFree: 10,
    components: [
      {
        id: 'laser_1',
        type: 'weapon',
        name: 'Laser I',
        space: 10,
        baseCost: 40,
        count: 2,
      },
      {
        id: 'nuclear_drive_1',
        type: 'engine',
        name: 'Nuclear Drive I',
        space: 10,
        baseCost: 20,
        count: 1,
      },
    ],
    stats: {
      attack: 20,
      defense: 5,
      hp: 30,
      speed: 2,
      cost: 120,
      manpower: 1,
      beamDefense: 10,
      missileDefense: 5,
      initiative: 1,
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 0,
  };
}

function makeAIEmpire(id: string, personality?: Partial<AIPersonality>): AIEmpire {
  const defaultPersonality: AIPersonality = {
    type: 'balanced',
    aggression: 40,
    expansionism: 60,
    diplomacy: 50,
    research: 50,
    traits: ['logical'],
    ...personality,
  };

  const defaultWeights: AIWeights = {
    shipWeight: 20,
    defenseWeight: 15,
    industryWeight: 30,
    ecologyWeight: 20,
    researchWeight: 15,
    weaponsPriority: 50,
    propulsionPriority: 50,
    constructionPriority: 30,
    computersPriority: 30,
    forceFieldsPriority: 30,
    biotechPriority: 30,
    fleetSizeThreshold: 1.5,
    threatTolerance: 30,
    retreatThreshold: 0.3,
  };

  const defaultStrategy: AIStrategy = {
    primary: 'expansion',
    secondary: 'tech_advantage',
    economicFocus: 'production',
    militaryStance: 'neutral',
    diplomaticGoal: 'alliances',
    targetEmpires: {},
    targetSystems: [],
    lastEvaluation: 0,
    nextEvaluation: 10,
  };

  const defaultMemory: AIMemory = {
    playerBetrayals: 0,
    playerAggression: 0,
    playerDiplomacy: 0,
    lastWars: [],
    failedInvasions: [],
    lostSystems: [],
    brokenTreaties: [],
    receivedHelp: [],
  };

  return {
    id,
    raceId: 'hamsters',
    empireName: `AI ${id}`,
    personality: defaultPersonality,
    strategy: defaultStrategy,
    memory: defaultMemory,
    weights: defaultWeights,
  };
}

/** Build a minimal GameState with an AI empire that has one owned planet. */
function makeBaseState(turn = 1): GameState {
  const system1 = makeSystem('s1', { x: 0, y: 0 });
  const system2 = makeSystem('s2', { x: 5, y: 0 });
  const planet1 = makePlanet('p1', 's1', 'ai1');
  const planet2 = makePlanet('p2', 's2', null); // uncolonized

  system1.planetIds = ['p1'];
  system2.planetIds = ['p2'];

  const empire = makeEmpire('ai1', ['p1'], []);
  const ai = makeAIEmpire('ai1');

  return {
    ...initialState,
    turn,
    galaxy: {
      ...initialState.galaxy,
      systems: {
        byId: { s1: system1, s2: system2 },
        allIds: ['s1', 's2'],
      },
    },
    planets: {
      byId: { p1: planet1, p2: planet2 },
      allIds: ['p1', 'p2'],
    },
    fleets: { byId: {}, allIds: [] },
    ships: { byId: {}, allIds: [] },
    shipDesigns: { byId: {}, allIds: [] },
    empires: {
      byId: { ai1: empire },
      allIds: ['ai1'],
      playerId: 'player',
    },
    aiEmpires: { ai1: ai },
  };
}

// ── Strategy helper tests ──────────────────────────────────────────────────────

// ── Ship Power calculation tests (design/technical/ai-implementation.md §1.3) ──────

function makeShipDesignForPower(
  options: {
    hullClass?: 'small' | 'medium' | 'large' | 'huge';
    armorType?: string;
    weaponsDamage?: string[];
    shieldClass?: number;
    speed?: number;
  } = {},
): ShipDesign {
  const hullClass = options.hullClass ?? 'medium';
  return {
    id: 'test-design',
    name: 'Test Ship',
    class: hullClass,
    ownerId: 'player',
    size: 100,
    spaceUsed: 80,
    spaceFree: 20,
    components: options.armorType
      ? [{ id: options.armorType, type: 'armor' as const, name: `${options.armorType} Armor`, space: 10, baseCost: 50, count: 1 }]
      : [],
    stats: {
      cost: 100,
      maintenance: 2,
      hp: 18,
      shieldHp: options.shieldClass ? options.shieldClass * 10 : 0,
      speed: options.speed ?? 4,
      range: 5,
      weapons: (options.weaponsDamage ?? []).map((dmg, i) => ({
        name: `Weapon ${i}`,
        damage: dmg,
        range: 3,
        type: 'beam' as const,
      })),
      defense: {
        armor: 1,
        shields: options.shieldClass ?? 0,
        ecm: 0,
      },
      special: [],
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 0,
  };
}

describe('calculateShipPower (ai-implementation.md §1.3)', () => {
  it('calculates power using hull HP, armor, weapons, shields, and speed', () => {
    // Medium hull = 18 HP, Zortrium armor = 1.8×, Fusion Beam 20 dmg, Class V shields, Speed 4
    // Ship_Power = floor((18 × 1.8 × 0.5) + (20 × 2.0) + (5 × 5) + (4 × 3))
    //            = floor(16.2 + 40 + 25 + 12) = floor(93.2) = 93
    const design = makeShipDesignForPower({
      hullClass: 'medium',
      armorType: 'zortrium',
      weaponsDamage: ['20'],
      shieldClass: 5,
      speed: 4,
    });
    expect(calculateShipPower(design)).toBe(93);
  });

  it('handles damage ranges (e.g., 2-8) by using average', () => {
    // Laser damage 2-8, average = 5
    // Medium hull = 18, no armor (1.0), no shields, speed 1
    // Ship_Power = floor((18 × 1.0 × 0.5) + (5 × 2.0) + (0 × 5) + (1 × 3))
    //            = floor(9 + 10 + 0 + 3) = 22
    const design = makeShipDesignForPower({
      hullClass: 'medium',
      weaponsDamage: ['2-8'],
      shieldClass: 0,
      speed: 1,
    });
    expect(calculateShipPower(design)).toBe(22);
  });

  it('uses different base HP for each hull size', () => {
    // Small hull = 3 HP, Large = 100 HP, Huge = 600 HP
    const small = calculateShipPower(makeShipDesignForPower({ hullClass: 'small', speed: 1 }));
    const large = calculateShipPower(makeShipDesignForPower({ hullClass: 'large', speed: 1 }));
    const huge = calculateShipPower(makeShipDesignForPower({ hullClass: 'huge', speed: 1 }));
    
    // Small: floor(3 × 0.5) + 3 = 4
    // Large: floor(100 × 0.5) + 3 = 53
    // Huge: floor(600 × 0.5) + 3 = 303
    expect(small).toBe(4);
    expect(large).toBe(53);
    expect(huge).toBe(303);
  });

  it('sums damage from multiple weapons', () => {
    // Two weapons: 10 + 20 = 30 total
    // Medium hull = 18, no armor, no shields, speed 1
    // Ship_Power = floor((18 × 0.5) + (30 × 2.0) + 0 + 3) = floor(9 + 60 + 3) = 72
    const design = makeShipDesignForPower({
      hullClass: 'medium',
      weaponsDamage: ['10', '20'],
      speed: 1,
    });
    expect(calculateShipPower(design)).toBe(72);
  });

  it('returns minimum power of 1 for unarmed scout', () => {
    // Tiny ship with nothing
    const design = makeShipDesignForPower({
      hullClass: 'small',
      weaponsDamage: [],
      shieldClass: 0,
      speed: 0,
    });
    // floor(3 × 0.5 + 0 + 0 + 0) = 1
    expect(calculateShipPower(design)).toBeGreaterThanOrEqual(1);
  });

  it('handles missing weapons array gracefully', () => {
    const design = makeShipDesignForPower({ hullClass: 'medium' });
    // Remove weapons to simulate test fixture without weapons
    (design.stats as { weapons?: unknown }).weapons = undefined;
    // Should not throw, should return some positive value
    expect(() => calculateShipPower(design)).not.toThrow();
    expect(calculateShipPower(design)).toBeGreaterThanOrEqual(1);
  });
});

describe('calculateFleetPower (ai-implementation.md §1.3)', () => {
  it('sums power of all ships in fleet', () => {
    const state = makeBaseState();
    // Add ships and designs to state
    const design = makeShipDesignForPower({
      hullClass: 'medium',
      weaponsDamage: ['10'],
      speed: 2,
    });
    state.shipDesigns.byId['test-design'] = design;
    state.shipDesigns.allIds = ['test-design'];

    // Add two ships with this design
    state.ships.byId['ship1'] = {
      id: 'ship1',
      name: 'Ship 1',
      designId: 'test-design',
      ownerId: 'ai1',
      fleetId: 'fleet1',
      hp: 18,
      maxHp: 18,
      shieldHp: 0,
      maxShieldHp: 0,
      experience: 'regular',
      kills: 0,
      combatPosition: null,
      hasActed: false,
      specialSystems: {},
    };
    state.ships.byId['ship2'] = { ...state.ships.byId['ship1'], id: 'ship2', name: 'Ship 2' };
    state.ships.allIds = ['ship1', 'ship2'];

    // Create fleet with both ships
    const fleet: Fleet = {
      id: 'fleet1',
      name: 'Test Fleet',
      ownerId: 'ai1',
      shipIds: ['ship1', 'ship2'],
      systemId: 'sys1',
      troops: 0,
      destination: null,
      eta: 0,
      route: [],
      movementPoints: 4,
      maxMovement: 4,
      orders: { type: 'none' },
      experience: 'regular',
      isInCombat: false,
      combatId: null,
    };
    state.fleets.byId['fleet1'] = fleet;
    state.fleets.allIds = ['fleet1'];

    // Each ship: floor(18 × 0.5 + 10 × 2 + 0 + 2 × 3) = floor(9 + 20 + 6) = 35
    // Fleet power = 35 + 35 = 70
    expect(calculateFleetPower(fleet, state)).toBe(70);
  });

  it('adjusts power based on ship HP ratio', () => {
    const state = makeBaseState();
    const design = makeShipDesignForPower({
      hullClass: 'medium',
      weaponsDamage: ['10'],
      speed: 2,
    });
    state.shipDesigns.byId['test-design'] = design;

    // One ship at full HP, one at 50%
    state.ships.byId['ship1'] = {
      id: 'ship1',
      name: 'Ship 1',
      designId: 'test-design',
      ownerId: 'ai1',
      fleetId: 'fleet1',
      hp: 18,
      maxHp: 18,
      shieldHp: 0,
      maxShieldHp: 0,
      experience: 'regular',
      kills: 0,
      combatPosition: null,
      hasActed: false,
      specialSystems: {},
    };
    state.ships.byId['ship2'] = { ...state.ships.byId['ship1'], id: 'ship2', name: 'Ship 2', hp: 9 }; // 50% HP
    state.ships.allIds = ['ship1', 'ship2'];

    const fleet: Fleet = {
      id: 'fleet1',
      name: 'Test Fleet',
      ownerId: 'ai1',
      shipIds: ['ship1', 'ship2'],
      systemId: 'sys1',
      troops: 0,
      destination: null,
      eta: 0,
      route: [],
      movementPoints: 4,
      maxMovement: 4,
      orders: { type: 'none' },
      experience: 'regular',
      isInCombat: false,
      combatId: null,
    };
    state.fleets.byId['fleet1'] = fleet;

    // Ship 1: 35 × 1.0 = 35
    // Ship 2: 35 × 0.5 = 17 (floor)
    // Total = 52
    expect(calculateFleetPower(fleet, state)).toBe(52);
  });
});

describe('getEmpireFleetPower (ai-implementation.md §1.3)', () => {
  it('sums power of all fleets belonging to empire', () => {
    const state = makeBaseState();
    const design = makeShipDesignForPower({
      hullClass: 'medium',
      weaponsDamage: ['10'],
      speed: 2,
    });
    state.shipDesigns.byId['test-design'] = design;

    // Add ships
    state.ships.byId['ship1'] = {
      id: 'ship1',
      name: 'Ship 1',
      designId: 'test-design',
      ownerId: 'ai1',
      fleetId: 'fleet1',
      hp: 18,
      maxHp: 18,
      shieldHp: 0,
      maxShieldHp: 0,
      experience: 'regular',
      kills: 0,
      combatPosition: null,
      hasActed: false,
      specialSystems: {},
    };
    state.ships.byId['ship2'] = { ...state.ships.byId['ship1'], id: 'ship2', fleetId: 'fleet2' };
    state.ships.allIds = ['ship1', 'ship2'];

    // Two fleets, one ship each
    const fleet1: Fleet = {
      id: 'fleet1',
      name: 'Fleet 1',
      ownerId: 'ai1',
      shipIds: ['ship1'],
      systemId: 'sys1',
      troops: 0,
      destination: null,
      eta: 0,
      route: [],
      movementPoints: 4,
      maxMovement: 4,
      orders: { type: 'none' },
      experience: 'regular',
      isInCombat: false,
      combatId: null,
    };
    const fleet2: Fleet = { ...fleet1, id: 'fleet2', name: 'Fleet 2', shipIds: ['ship2'] };
    state.fleets.byId = { fleet1, fleet2 };
    state.fleets.allIds = ['fleet1', 'fleet2'];

    // Update empire to have both fleets
    state.empires.byId['ai1'].fleets = ['fleet1', 'fleet2'];

    // Each ship = 35, total = 70
    expect(getEmpireFleetPower('ai1', state)).toBe(70);
  });

  it('returns 0 for empire with no fleets', () => {
    const state = makeBaseState();
    state.empires.byId['ai1'].fleets = [];
    expect(getEmpireFleetPower('ai1', state)).toBe(0);
  });

  it('returns 0 for unknown empire', () => {
    const state = makeBaseState();
    expect(getEmpireFleetPower('nonexistent', state)).toBe(0);
  });
});

describe('getGamePhase', () => {
  it('returns early for turns 1-50', () => {
    expect(getGamePhase(1)).toBe('early');
    expect(getGamePhase(50)).toBe('early');
  });

  it('returns mid for turns 51-150', () => {
    expect(getGamePhase(51)).toBe('mid');
    expect(getGamePhase(150)).toBe('mid');
  });

  it('returns late for turns > 150', () => {
    expect(getGamePhase(151)).toBe('late');
    expect(getGamePhase(999)).toBe('late');
  });
});

describe('computeProductionSliders', () => {
  it('returns sliders that sum to 100', () => {
    const planet = makePlanet('p1', 's1', 'ai1');
    const ai = makeAIEmpire('ai1');

    for (const phase of ['early', 'mid', 'late'] as const) {
      for (const threatened of [true, false]) {
        const sliders = computeProductionSliders(planet, ai, phase, threatened);
        const sum = sliders.ship + sliders.defense + sliders.industry + sliders.ecology + sliders.research;
        expect(sum).toBe(100);
      }
    }
  });

  it('prioritises IND in early game', () => {
    const planet = makePlanet('p1', 's1', 'ai1');
    const ai = makeAIEmpire('ai1');
    const sliders = computeProductionSliders(planet, ai, 'early', false);
    // Industry should be the dominant slider in early game
    expect(sliders.industry).toBeGreaterThan(sliders.ship);
    expect(sliders.industry).toBeGreaterThan(sliders.defense);
  });

  it('maximises SHIP when threatened', () => {
    const planet = makePlanet('p1', 's1', 'ai1');
    const ai = makeAIEmpire('ai1');
    const sliders = computeProductionSliders(planet, ai, 'mid', true);
    // SHIP should dominate in crisis mode
    expect(sliders.ship).toBeGreaterThanOrEqual(30);
    expect(sliders.defense).toBeGreaterThanOrEqual(20);
  });

  it('prioritises TECH/ECO for peaceful late-game low-aggression AI', () => {
    const planet = makePlanet('p1', 's1', 'ai1');
    const ai = makeAIEmpire('ai1', { aggression: 20 }); // peaceful
    const sliders = computeProductionSliders(planet, ai, 'late', false);
    expect(sliders.research + sliders.ecology).toBeGreaterThan(sliders.ship + sliders.defense);
  });

  it('all slider values are >= 0', () => {
    const planet = makePlanet('p1', 's1', 'ai1');
    const ai = makeAIEmpire('ai1', { aggression: 100, research: 100 });
    const sliders = computeProductionSliders(planet, ai, 'early', true);
    expect(sliders.ship).toBeGreaterThanOrEqual(0);
    expect(sliders.defense).toBeGreaterThanOrEqual(0);
    expect(sliders.industry).toBeGreaterThanOrEqual(0);
    expect(sliders.ecology).toBeGreaterThanOrEqual(0);
    expect(sliders.research).toBeGreaterThanOrEqual(0);
  });
});

describe('scorePlanetForColonization', () => {
  it('scores rich large planets higher than poor small planets', () => {
    const rich: Planet = { ...makePlanet('r', 's1'), resourceLevel: 'rich', size: 'large' };
    const poor: Planet = { ...makePlanet('p', 's1'), resourceLevel: 'poor', size: 'small' };
    expect(scorePlanetForColonization(rich)).toBeGreaterThan(scorePlanetForColonization(poor));
  });

  it('adds bonus for artifacts and gaia planets', () => {
    const base: Planet = makePlanet('b', 's1');
    const gaia: Planet = { ...base, isGaia: true };
    const artifacts: Planet = { ...base, hasArtifacts: true };
    expect(scorePlanetForColonization(gaia)).toBeGreaterThan(scorePlanetForColonization(base));
    expect(scorePlanetForColonization(artifacts)).toBeGreaterThan(scorePlanetForColonization(base));
  });
});

describe('findColonizationTargets', () => {
  it('returns uncolonized planet candidates', () => {
    const state = makeBaseState();
    const targets = findColonizationTargets('ai1', state, 5);
    expect(targets.length).toBeGreaterThan(0);
    expect(targets[0].planetId).toBe('p2'); // only uncolonized planet
  });

  it('excludes gas giants', () => {
    const state = makeBaseState();
    // Make p2 a gas giant
    const gasGiant: Planet = { ...state.planets.byId['p2'], type: 'gas_giant' };
    const modState: GameState = {
      ...state,
      planets: { ...state.planets, byId: { ...state.planets.byId, p2: gasGiant } },
    };
    const targets = findColonizationTargets('ai1', modState, 5);
    expect(targets.find((t) => t.planetId === 'p2')).toBeUndefined();
  });

  it('returns empty if empire has no planets', () => {
    const state = makeBaseState();
    const modEmpire = { ...state.empires.byId['ai1'], planets: [] };
    const modState: GameState = {
      ...state,
      empires: { ...state.empires, byId: { ...state.empires.byId, ai1: modEmpire } },
    };
    const targets = findColonizationTargets('ai1', modState, 5);
    expect(targets).toHaveLength(0);
  });
});

// ── processAITurn tests ───────────────────────────────────────────────────────

describe('processAITurn', () => {
  it('returns state unchanged for defeated empire', () => {
    const state = makeBaseState();
    const defeatedEmpire = { ...state.empires.byId['ai1'], isDefeated: true };
    const modState: GameState = {
      ...state,
      empires: { ...state.empires, byId: { ...state.empires.byId, ai1: defeatedEmpire } },
    };
    const result = processAITurn(modState, 'ai1');
    expect(result).toBe(modState);
  });

  it('returns state unchanged if AI data missing', () => {
    const state = makeBaseState();
    const modState: GameState = { ...state, aiEmpires: {} };
    const result = processAITurn(modState, 'ai1');
    expect(result).toBe(modState);
  });

  describe('production slider adjustment', () => {
    it('sets production sliders on owned planets', () => {
      const state = makeBaseState(1); // early game
      const result = processAITurn(state, 'ai1');
      const planet = result.planets.byId['p1'];
      // Sliders must sum to 100
      const sum = planet.production.ship + planet.production.defense +
        planet.production.industry + planet.production.ecology + planet.production.research;
      expect(sum).toBe(100);
    });

    it('adjusts sliders differently in early vs mid game', () => {
      const earlyState = makeBaseState(1);
      const midState = makeBaseState(100);

      const earlyResult = processAITurn(earlyState, 'ai1');
      const midResult = processAITurn(midState, 'ai1');

      const earlyProd = earlyResult.planets.byId['p1'].production;
      const midProd = midResult.planets.byId['p1'].production;

      // Early game should have higher industry
      expect(earlyProd.industry).toBeGreaterThan(midProd.ship);
    });
  });

  describe('colony ship building (early game)', () => {
    it('queues colony ship design in early game when available', () => {
      const state = makeBaseState(1); // early game
      const colonyDesign = makeColonyShipDesign('design-colony', 'ai1');

      const modState: GameState = {
        ...state,
        shipDesigns: {
          byId: { 'design-colony': colonyDesign },
          allIds: ['design-colony'],
        },
        empires: {
          ...state.empires,
          byId: {
            ...state.empires.byId,
            ai1: { ...state.empires.byId['ai1'], shipDesigns: ['design-colony'] },
          },
        },
      };

      const result = processAITurn(modState, 'ai1');
      const planet = result.planets.byId['p1'];
      // Should have queued the colony design
      expect(planet.currentDesignId).toBe('design-colony');
    });

    it('does not queue colony ship in mid/late game if already building', () => {
      const state = makeBaseState(100); // mid game
      const colonyDesign = makeColonyShipDesign('design-colony', 'ai1');

      // Planet already has something queued
      const busyPlanet = { ...state.planets.byId['p1'], currentDesignId: 'something-else' };
      const modState: GameState = {
        ...state,
        planets: { ...state.planets, byId: { ...state.planets.byId, p1: busyPlanet } },
        shipDesigns: {
          byId: { 'design-colony': colonyDesign },
          allIds: ['design-colony'],
        },
      };

      const result = processAITurn(modState, 'ai1');
      const planet = result.planets.byId['p1'];
      // Should not override existing queue
      expect(planet.currentDesignId).toBe('something-else');
    });
  });

  describe('military ship building', () => {
    it('queues military ship when at war', () => {
      const state = makeBaseState(1);
      const militaryDesign = makeMilitaryShipDesign('design-fighter', 'ai1');

      // Put AI1 at war with 'enemy'
      const ai1WithWar: Empire = {
        ...state.empires.byId['ai1'],
        shipDesigns: ['design-fighter'],
        relations: {
          enemy: {
            empireId: 'enemy',
            state: 'war',
            treaties: [],
            events: [],
            warStartTurn: 1,
            lastContact: 1,
          },
        },
      };

      const modState: GameState = {
        ...state,
        shipDesigns: {
          byId: { 'design-fighter': militaryDesign },
          allIds: ['design-fighter'],
        },
        empires: {
          ...state.empires,
          byId: { ...state.empires.byId, ai1: ai1WithWar },
        },
      };

      const result = processAITurn(modState, 'ai1');
      const planet = result.planets.byId['p1'];
      expect(planet.currentDesignId).toBe('design-fighter');
    });
  });

  describe('colony fleet dispatching', () => {
    it('sends idle colony fleet toward best uncolonized planet', () => {
      const state = makeBaseState(1);
      const colonyDesign = makeColonyShipDesign('design-colony', 'ai1');
      const ship1 = makeShip('ship-cs1', 'fleet-cs', 'design-colony');
      const fleet = makeFleet('fleet-cs', 's1', ['ship-cs1']);

      const modState: GameState = {
        ...state,
        ships: { byId: { 'ship-cs1': ship1 }, allIds: ['ship-cs1'] },
        fleets: { byId: { 'fleet-cs': fleet }, allIds: ['fleet-cs'] },
        shipDesigns: {
          byId: { 'design-colony': colonyDesign },
          allIds: ['design-colony'],
        },
        empires: {
          ...state.empires,
          byId: {
            ...state.empires.byId,
            ai1: { ...state.empires.byId['ai1'], fleets: ['fleet-cs'] },
          },
        },
      };

      const result = processAITurn(modState, 'ai1');
      const updatedFleet = result.fleets.byId['fleet-cs'];
      // Fleet should be dispatched toward s2 (uncolonized planet)
      expect(updatedFleet.destination).toBe('s2');
    });
  });

  describe('colonization execution', () => {
    it('colonizes when colony fleet is already in system with habitable planet', () => {
      // Colony fleet at s2 where p2 (uncolonized) exists
      const state = makeBaseState(1);
      const colonyDesign = makeColonyShipDesign('design-colony', 'ai1');
      const ship1 = makeShip('ship-cs1', 'fleet-cs', 'design-colony');
      const fleet = makeFleet('fleet-cs', 's2', ['ship-cs1']); // fleet already at s2

      // s2 system with p2 as planet
      const s2 = { ...state.galaxy.systems.byId['s2'], planetIds: ['p2'], fleetIds: ['fleet-cs'] };

      const modState: GameState = {
        ...state,
        galaxy: {
          ...state.galaxy,
          systems: {
            byId: { ...state.galaxy.systems.byId, s2 },
            allIds: state.galaxy.systems.allIds,
          },
        },
        ships: { byId: { 'ship-cs1': ship1 }, allIds: ['ship-cs1'] },
        fleets: { byId: { 'fleet-cs': fleet }, allIds: ['fleet-cs'] },
        shipDesigns: {
          byId: { 'design-colony': colonyDesign },
          allIds: ['design-colony'],
        },
        empires: {
          ...state.empires,
          byId: {
            ...state.empires.byId,
            ai1: { ...state.empires.byId['ai1'], fleets: ['fleet-cs'] },
          },
        },
      };

      const result = processAITurn(modState, 'ai1');
      const colonizedPlanet = result.planets.byId['p2'];
      // Planet should now be owned by ai1
      expect(colonizedPlanet.ownerId).toBe('ai1');
      expect(colonizedPlanet.isColonized).toBe(true);
    });
  });

  describe('no DOM imports', () => {
    it('processAITurn does not throw on valid input', () => {
      const state = makeBaseState(1);
      expect(() => processAITurn(state, 'ai1')).not.toThrow();
    });
  });
});

describe('processAllAITurns', () => {
  it('skips player empire', () => {
    const state = makeBaseState(1);
    // Add a player empire
    const playerEmpire = makeEmpire('player', [], [], true);
    const modState: GameState = {
      ...state,
      empires: {
        byId: { ...state.empires.byId, player: playerEmpire },
        allIds: [...state.empires.allIds, 'player'],
        playerId: 'player',
      },
    };
    // Should not throw
    expect(() => processAllAITurns(modState)).not.toThrow();
  });

  it('processes all non-player AI empires', () => {
    const state = makeBaseState(1);
    // Add a second AI empire with a separate system/planet
    const system3 = makeSystem('s3', { x: 10, y: 0 });
    const planet3 = makePlanet('p3', 's3', 'ai2');
    system3.planetIds = ['p3'];
    const empire2 = makeEmpire('ai2', ['p3'], []);
    const ai2 = makeAIEmpire('ai2');

    const modState: GameState = {
      ...state,
      galaxy: {
        ...state.galaxy,
        systems: {
          byId: { ...state.galaxy.systems.byId, s3: system3 },
          allIds: [...state.galaxy.systems.allIds, 's3'],
        },
      },
      planets: {
        byId: { ...state.planets.byId, p3: planet3 },
        allIds: [...state.planets.allIds, 'p3'],
      },
      empires: {
        byId: { ...state.empires.byId, ai2: empire2 },
        allIds: [...state.empires.allIds, 'ai2'],
        playerId: 'player',
      },
      aiEmpires: { ...state.aiEmpires, ai2: ai2 },
    };

    const result = processAllAITurns(modState);
    // Both AI planets should have production sliders set to sum=100
    const p1 = result.planets.byId['p1'].production;
    const p3 = result.planets.byId['p3'].production;
    expect(p1.ship + p1.defense + p1.industry + p1.ecology + p1.research).toBe(100);
    expect(p3.ship + p3.defense + p3.industry + p3.ecology + p3.research).toBe(100);
  });

  it('does not crash on empty AI empires', () => {
    const state = { ...makeBaseState(), aiEmpires: {} };
    expect(() => processAllAITurns(state)).not.toThrow();
  });
});

describe('shouldBuildMilitary', () => {
  it('returns true when at war', () => {
    const state = makeBaseState(100);
    const ai1WithWar: Empire = {
      ...state.empires.byId['ai1'],
      relations: {
        enemy: {
          empireId: 'enemy',
          state: 'war',
          treaties: [],
          events: [],
          warStartTurn: 1,
          lastContact: 1,
        },
      },
    };
    const modState: GameState = {
      ...state,
      empires: { ...state.empires, byId: { ai1: ai1WithWar } },
    };
    const ai = makeAIEmpire('ai1');
    expect(shouldBuildMilitary('ai1', modState, ai, 'mid')).toBe(true);
  });

  it('returns false for peaceful early-game with no enemies', () => {
    const state = makeBaseState(1);
    const ai = makeAIEmpire('ai1', { aggression: 10 });
    expect(shouldBuildMilitary('ai1', state, ai, 'early')).toBe(false);
  });

  it('returns true for highly aggressive mid-game AI', () => {
    const state = makeBaseState(100);
    const ai = makeAIEmpire('ai1', { aggression: 80 });
    expect(shouldBuildMilitary('ai1', state, ai, 'mid')).toBe(true);
  });
});

describe('isUnderThreat', () => {
  it('returns false when no enemies and balanced fleets', () => {
    const state = makeBaseState();
    expect(isUnderThreat('ai1', state)).toBe(false);
  });

  it('returns true when at war', () => {
    const state = makeBaseState();
    const ai1WithWar: Empire = {
      ...state.empires.byId['ai1'],
      relations: {
        enemy: {
          empireId: 'enemy',
          state: 'war',
          treaties: [],
          events: [],
          warStartTurn: 1,
          lastContact: 1,
        },
      },
    };
    const modState: GameState = {
      ...state,
      empires: { ...state.empires, byId: { ai1: ai1WithWar } },
    };
    expect(isUnderThreat('ai1', modState)).toBe(true);
  });
});
