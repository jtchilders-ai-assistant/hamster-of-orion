/**
 * Fog of War system tests.
 * test/game/systems/fogOfWar.test.ts
 *
 * Tests for: exploreSystem, isSystemVisible, updateVisibility, processFogOfWar.
 *
 * NO DOM imports — pure TypeScript only.
 */

import { describe, it, expect } from 'vitest';
import {
  exploreSystem,
  isSystemVisible,
  updateVisibility,
  processFogOfWar,
  getSensorRange,
} from '../../../src/game/systems/fogOfWar';
import {
  GameState,
  Empire,
  Planet,
  Fleet,
  Ship,
  ShipDesign,
  StarSystem,
  ResearchState,
  DiplomaticRelations,
} from '../../../src/game/state';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSystem(id: string, x: number = 0, y: number = 0): StarSystem {
  return {
    id,
    name: `System ${id}`,
    coordinates: { x, y },
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
  colonized = true,
  ownerId: string = 'player',
): Planet {
  return {
    id,
    name: `Planet ${id}`,
    systemId,
    orbit: 1,
    type: 'terran',
    size: 'medium',
    gravity: 1.0,
    ownerId,
    isColonized: colonized,
    isHomeworld: false,
    population: 50,
    maxPopulation: 100,
    growthRate: 0.02,
    morale: 'content',
    factories: 20,
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
    resourceLevel: 'normal',
    researchMultiplier: 1.0,
    startingPopulation: null,
    startingFactories: null,
  };
}

function makeEmpire(
  id: string,
  scannerTechLevel = 0,
  planets: string[] = [],
  fleetIds: string[] = [],
): Empire {
  return {
    id,
    raceId: 'hamsters',
    name: `Empire ${id}`,
    isPlayer: id === 'player',
    credits: 100,
    creditPerTurn: 10,
    planets,
    fleets: fleetIds,
    shipDesigns: [],
    scannerTechLevel,
    research: makeResearchState(),
    relations: {},
    exploredSystems: [],
    visibleSystems: [],
    isDefeated: false,
    defeatedTurn: null,
  };
}

function makeResearchState(): ResearchState {
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

function makeFleet(
  id: string,
  systemId: string,
): Fleet {
  return {
    id,
    name: `Fleet ${id}`,
    side: 'attacker' as const,
    hp: 100,
    maxHp: 100,
    systemId,
    destination: null,
    destinationTurn: null,
    eta: 0,
    ships: [],
    inCombat: false,
  };
}

function makeShipDesign(): ShipDesign {
  return {
    id: 'basic-frigate',
    name: 'Basic Frigate',
    class: 'small',
    ownerId: 'player',
    size: 50,
    spaceUsed: 10,
    spaceFree: 40,
    components: [],
    weapons: [],
    shieldClass: 0,
    attackRating: 2,
    defenseRating: 2,
    speed: 2,
    fuel: 0,
    cargo: 0,
    cost: 100,
  };
}

function makeState(
  systemIds: string[],
  empires: Record<string, Empire>,
): GameState {
  const systemsById: Record<string, StarSystem> = {};
  for (const sid of systemIds) {
    systemsById[sid] = makeSystem(sid);
  }

  return {
    turn: 1,
    difficulty: 'normal',
    galaxySize: 'normal',
    mapSeed: 42,
    empires: {
      allIds: Object.keys(empires),
      byId: empires,
    },
    galaxy: {
      systems: {
        allIds: systemIds,
        byId: systemsById,
      },
    },
    planets: { allIds: [], byId: {} },
    fleets: { allIds: [], byId: {} },
    ships: { allIds: [], byId: {} },
    shipDesigns: { allIds: [], byId: {} },
    buildings: { allIds: [], byId: {} },
    techs: { allIds: [], byId: {} },
    highCouncil: {
      isActive: false,
      formationTurn: 0,
      nextVoteTurn: 0,
      voteFrequency: 5,
      voteHistory: [],
      voteShares: {},
    },
    aiState: { pendingEvaluation: {}, pendingEco: {}, pendingResearch: {} },
    combatLog: [],
    gameEnded: false,
    winner: null,
    turnStartSnapshot: null,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getSensorRange', () => {
  it('returns 1 ly with scannerTechLevel 0', () => {
    const empire = makeEmpire('player', 0);
    expect(getSensorRange(empire)).toBe(1);
  });

  it('returns 3 ly with scannerTechLevel 2', () => {
    const empire = makeEmpire('player', 2);
    expect(getSensorRange(empire)).toBe(3);
  });
});

describe('exploreSystem', () => {
  it('adds a system to exploredSystems when first explored', () => {
    const p1 = makePlanet('p1', 's1');
    const empire = makeEmpire('player', 1, ['p1'], []);
    const state = makeState(['s1', 's2'], { player: empire });
    const stateWithPlanets = {
      ...state,
      planets: { allIds: ['p1'], byId: { p1 } },
    };

    const result = exploreSystem(stateWithPlanets, 'player', 's2');
    expect(result.empires.byId.player.exploredSystems).toContain('s2');
  });

  it('does not duplicate when system is already explored', () => {
    const empire = makeEmpire('player', 1, [], []);
    empire.exploredSystems = ['s1', 's2'];
    const state = makeState(['s1', 's2', 's3'], { player: empire });

    const result = exploreSystem(state, 'player', 's1');
    const count = result.empires.byId.player.exploredSystems.filter(
      (s) => s === 's1',
    ).length;
    expect(count).toBe(1);
  });
});

describe('isSystemVisible', () => {
  it('returns true for an explored system', () => {
    const empire = makeEmpire('player', 0, [], []);
    empire.exploredSystems = ['s1'];
    const state = makeState(['s1', 's2'], { player: empire });

    expect(isSystemVisible(state, 'player', 's1')).toBe(true);
    expect(isSystemVisible(state, 'player', 's2')).toBe(false);
  });

  it('returns true for a system in visibleSystems (sensor range)', () => {
    const empire = makeEmpire('player', 0, [], []);
    empire.visibleSystems = ['s3'];
    empire.exploredSystems = [];
    const state = makeState(['s1', 's2', 's3'], { player: empire });

    expect(isSystemVisible(state, 'player', 's3')).toBe(true);
    expect(isSystemVisible(state, 'player', 's1')).toBe(false);
  });

  it('returns false for unknown empire', () => {
    const state = makeState(['s1'], { player: makeEmpire('player') });
    expect(isSystemVisible(state, 'nonexistent', 's1')).toBe(false);
  });
});

describe('updateVisibility', () => {
  it('colonies reveal their own system in visibleSystems', () => {
    const p1 = makePlanet('p1', 's1');
    const empire = makeEmpire('player', 0, ['p1'], []);
    const state = makeState(['s1', 's2'], { player: empire });
    const stateWithPlanets = {
      ...state,
      planets: { allIds: ['p1'], byId: { p1 } },
    };

    const result = updateVisibility(stateWithPlanets, 'player');
    expect(result.empires.byId.player.visibleSystems).toContain('s1');
  });

  it('fleets reveal nearby systems within sensor range', () => {
    const fleet1 = makeFleet('f1', 's1');
    const empire = makeEmpire('player', 2, [], ['f1']);
    const state = makeState(['s1', 's2', 's3'], { player: empire });
    const stateWithFleets = {
      ...state,
      fleets: { allIds: ['f1'], byId: { f1: fleet1 } },
    };

    // sensorRange = 1 + 2 = 3. Distance s1→s2 = 1, s1→s3 = 2. Both within range.
    const result = updateVisibility(stateWithFleets, 'player');
    const visible = result.empires.byId.player.visibleSystems;
    expect(visible).toContain('s2');
    expect(visible).toContain('s3');
  });

  it('does not change state when nothing new is visible', () => {
    const empire = makeEmpire('player', 0, [], []);
    const state = makeState(['s1'], { player: empire });

    const result = updateVisibility(state, 'player');
    // Same reference when no change
    expect(result).toBe(state);
  });
});

describe('processFogOfWar', () => {
  it('updates visibility and explores for all empires', () => {
    // Two empires with fleets in different systems
    const fleet1 = makeFleet('f1', 's1');
    const fleet2 = makeFleet('f2', 's2');
    const emp1 = makeEmpire('player', 1, [], ['f1']);
    const emp2 = makeEmpire('ai1', 1, [], ['f2']);
    const state = makeState(['s1', 's2', 's3', 's4'], { player: emp1, ai1: emp2 });
    const stateWithFleets = {
      ...state,
      fleets: { allIds: ['f1', 'f2'], byId: { f1: fleet1, f2: fleet2 } },
    };

    const result = processFogOfWar(stateWithFleets);

    // Both empires should have their own systems explored
    expect(result.empires.byId.player.exploredSystems).toContain('s1');
    expect(result.empires.byId.ai1.exploredSystems).toContain('s2');

    // Both should have nearby systems visible (sensor range = 2)
    const playerVisible = result.empires.byId.player.visibleSystems;
    const aiVisible = result.empires.byId.ai1.visibleSystems;
    expect(playerVisible).toContain('s2');
    expect(aiVisible).toContain('s1');
  });

  it('excluded defeated empires from processing', () => {
    const empire = makeEmpire('defeated', 5, [], []);
    empire.isDefeated = true;
    empire.exploredSystems = [];
    empire.visibleSystems = [];
    const state = makeState(['s1', 's2'], { defeated: empire });

    const result = processFogOfWar(state);
    // Defeated empire should not get any changes
    expect(result.empires.byId.defeated.exploredSystems).toEqual([]);
    expect(result.empires.byId.defeated.visibleSystems).toEqual([]);
  });

  it('colonies reveal their system as explored', () => {
    const p1 = makePlanet('p1', 's1');
    const p2 = makePlanet('p2', 's2');
    const empire = makeEmpire('player', 0, ['p1', 'p2'], []);
    const state = makeState(['s1', 's2', 's3'], { player: empire });
    const stateWithPlanets = {
      ...state,
      planets: { allIds: ['p1', 'p2'], byId: { p1, p2 } },
    };

    const result = processFogOfWar(stateWithPlanets);

    // Colonies always count as explored
    expect(result.empires.byId.player.exploredSystems).toContain('s1');
    expect(result.empires.byId.player.exploredSystems).toContain('s2');
    // Colonies reveal their system in visible too
    expect(result.empires.byId.player.visibleSystems).toContain('s1');
    expect(result.empires.byId.player.visibleSystems).toContain('s2');
  });
});
