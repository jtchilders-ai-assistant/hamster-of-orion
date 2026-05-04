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
    experience: 'green',
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
    experience: 'green',
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
