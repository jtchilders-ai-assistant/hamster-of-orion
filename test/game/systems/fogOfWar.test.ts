/**
 * Fog of War system tests.
 * test/game/systems/fogOfWar.test.ts
 *
 * Tests: exploreSystem, isSystemVisible, updateVisibility, processFogOfWar.
 *
 * NO DOM — pure TypeScript only.
 */

import { describe, it, expect } from 'vitest';
import {
  exploreSystem,
  getSensorRange,
  isSystemVisible,
  updateVisibility,
  processFogOfWar,
} from '../../../src/game/systems/fogOfWar';
import {
  GameState,
  Empire,
  Fleet,
  StarSystem,
  Planet,
} from '../../../src/game/state';
import { initialState } from '../../../src/game/initialState';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeSystem(id: string, x: number, y: number): StarSystem {
  return {
    id,
    name: `System-${id}`,
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

function makeEmpire(overrides: Partial<Empire> = {}): Empire {
  return {
    id: 'p1',
    raceId: 'humans',
    name: 'Test Empire',
    isPlayer: true,
    credits: 500,
    creditPerTurn: 10,
    planets: [],
    fleets: [],
    shipDesigns: [],
    scannerTechLevel: 0,
    exploredSystems: [],
    visibleSystems: [],
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
    ...overrides,
  };
}

function makeFleet(id: string, systemId: string, ownerId = 'p1'): Fleet {
  return {
    id,
    name: `Fleet-${id}`,
    ownerId,
    systemId,
    destination: null,
    eta: 0,
    shipIds: [],
    orders: { type: 'none' },
    experience: 0,
    combatRating: 0,
    experienceLevel: 'green',
  };
}

function makePlanet(id: string, systemId: string, ownerId: string): Planet {
  return {
    id,
    name: `Planet-${id}`,
    systemId,
    orbit: 1,
    type: 'terran',
    size: 'medium',
    gravity: 1.0,
    ownerId,
    isColonized: true,
    isHomeworld: false,
    population: 100,
    maxPopulation: 500,
    populationGrowth: 5,
    habitability: 100,
    pollutionLevel: 0,
    resourceLevel: 'normal',
    morale: 'happy',
    moraleModifiers: [],
    production: { ship: 25, defense: 25, industry: 25, ecology: 0, research: 25 },
    buildQueue: [],
    buildings: [],
    defenses: { missileBase: 0, shield: 0, armor: 0, battleStation: false },
    isBombarded: false,
    turnColonized: 0,
    lastBombardment: null,
    terraformLevel: 0,
    pollutionCleanupCost: 0,
    industryLevel: 0,
    researchOutput: 0,
    rawProduction: 0,
  };
}

/** Build a minimal GameState with configurable empires and systems. */
function buildState({
  systems,
  empires,
  fleets,
  planets,
}: {
  systems: StarSystem[];
  empires: Empire[];
  fleets?: Fleet[];
  planets?: Planet[];
}): GameState {
  const byIdSystems: Record<string, StarSystem> = {};
  for (const s of systems) byIdSystems[s.id] = s;

  const byIdEmpires: Record<string, Empire> = {};
  for (const e of empires) byIdEmpires[e.id] = e;

  const byIdFleets: Record<string, Fleet> = {};
  for (const f of fleets ?? []) byIdFleets[f.id] = f;

  const byIdPlanets: Record<string, Planet> = {};
  for (const p of planets ?? []) byIdPlanets[p.id] = p;

  return {
    ...initialState,
    galaxy: {
      ...initialState.galaxy,
      systems: {
        byId: byIdSystems,
        allIds: systems.map((s) => s.id),
      },
    },
    empires: {
      byId: byIdEmpires,
      allIds: empires.map((e) => e.id),
      playerId: empires[0]?.id ?? 'p1',
    },
    fleets: {
      byId: byIdFleets,
      allIds: (fleets ?? []).map((f) => f.id),
    },
    planets: {
      byId: byIdPlanets,
      allIds: (planets ?? []).map((p) => p.id),
    },
  };
}

// ── getSensorRange ─────────────────────────────────────────────────────────────

describe('getSensorRange', () => {
  it('returns base 1 ly when scannerTechLevel is 0', () => {
    const empire = makeEmpire({ scannerTechLevel: 0 });
    expect(getSensorRange(empire)).toBe(1);
  });

  it('adds 1 ly per scanner tech level', () => {
    const empire = makeEmpire({ scannerTechLevel: 3 });
    expect(getSensorRange(empire)).toBe(4);
  });
});

// ── exploreSystem ─────────────────────────────────────────────────────────────

describe('exploreSystem', () => {
  it('adds a system to exploredSystems when not already there', () => {
    const empire = makeEmpire({ id: 'p1', exploredSystems: [] });
    const sys = makeSystem('s1', 0, 0);
    const state = buildState({ systems: [sys], empires: [empire] });

    const next = exploreSystem(state, 'p1', 's1');

    expect(next.empires.byId['p1'].exploredSystems).toContain('s1');
  });

  it('does not duplicate a system already in exploredSystems', () => {
    const empire = makeEmpire({ id: 'p1', exploredSystems: ['s1'] });
    const sys = makeSystem('s1', 0, 0);
    const state = buildState({ systems: [sys], empires: [empire] });

    const next = exploreSystem(state, 'p1', 's1');

    expect(next.empires.byId['p1'].exploredSystems.filter((id) => id === 's1')).toHaveLength(1);
  });

  it('returns original state for unknown empireId', () => {
    const sys = makeSystem('s1', 0, 0);
    const state = buildState({ systems: [sys], empires: [] });
    const next = exploreSystem(state, 'ghost', 's1');
    expect(next).toBe(state);
  });
});

// ── isSystemVisible ───────────────────────────────────────────────────────────

describe('isSystemVisible', () => {
  it('returns true for a system in exploredSystems', () => {
    const empire = makeEmpire({ id: 'p1', exploredSystems: ['s1'] });
    const sys = makeSystem('s1', 0, 0);
    const state = buildState({ systems: [sys], empires: [empire] });

    expect(isSystemVisible(state, 'p1', 's1')).toBe(true);
  });

  it('returns true for a system in visibleSystems (not yet explored)', () => {
    const empire = makeEmpire({ id: 'p1', exploredSystems: [], visibleSystems: ['s2'] });
    const sys1 = makeSystem('s1', 0, 0);
    const sys2 = makeSystem('s2', 10, 10);
    const state = buildState({ systems: [sys1, sys2], empires: [empire] });

    expect(isSystemVisible(state, 'p1', 's2')).toBe(true);
  });

  it('returns false for an unexplored system outside sensor range', () => {
    const empire = makeEmpire({ id: 'p1', exploredSystems: [], visibleSystems: [] });
    const sys1 = makeSystem('s1', 0, 0);
    const sys2 = makeSystem('s2', 100, 100);
    const state = buildState({ systems: [sys1, sys2], empires: [empire] });

    expect(isSystemVisible(state, 'p1', 's2')).toBe(false);
  });

  it('returns false for unknown empireId', () => {
    const sys = makeSystem('s1', 0, 0);
    const state = buildState({ systems: [sys], empires: [] });
    expect(isSystemVisible(state, 'ghost', 's1')).toBe(false);
  });
});

// ── updateVisibility ──────────────────────────────────────────────────────────

describe('updateVisibility', () => {
  it('reveals systems within sensor range of a fleet', () => {
    // Fleet at s1 (0,0); s2 at (0.5,0) — within range 1; s3 at (5,0) — out of range
    const fleet = makeFleet('f1', 's1');
    const empire = makeEmpire({
      id: 'p1',
      fleets: ['f1'],
      scannerTechLevel: 0, // range = 1 ly
    });
    const s1 = makeSystem('s1', 0, 0);
    const s2 = makeSystem('s2', 0.5, 0);
    const s3 = makeSystem('s3', 5, 0);
    const state = buildState({ systems: [s1, s2, s3], empires: [empire], fleets: [fleet] });

    const next = updateVisibility(state, 'p1');

    expect(next.empires.byId['p1'].visibleSystems).toContain('s2');
    expect(next.empires.byId['p1'].visibleSystems).not.toContain('s3');
  });

  it('extended sensor range reveals more systems', () => {
    const fleet = makeFleet('f1', 's1');
    const empire = makeEmpire({
      id: 'p1',
      fleets: ['f1'],
      scannerTechLevel: 4, // range = 5 ly
    });
    const s1 = makeSystem('s1', 0, 0);
    const s2 = makeSystem('s2', 4.9, 0); // just inside
    const s3 = makeSystem('s3', 6, 0);   // outside
    const state = buildState({ systems: [s1, s2, s3], empires: [empire], fleets: [fleet] });

    const next = updateVisibility(state, 'p1');

    expect(next.empires.byId['p1'].visibleSystems).toContain('s2');
    expect(next.empires.byId['p1'].visibleSystems).not.toContain('s3');
  });

  it('colonies reveal their own system', () => {
    const planet = makePlanet('pl1', 's2', 'p1');
    const empire = makeEmpire({
      id: 'p1',
      planets: ['pl1'],
      scannerTechLevel: 0,
    });
    const s1 = makeSystem('s1', 0, 0);
    const s2 = makeSystem('s2', 50, 50); // far away, not reachable by sensor
    const state = buildState({
      systems: [s1, s2],
      empires: [empire],
      planets: [planet],
    });

    const next = updateVisibility(state, 'p1');

    expect(next.empires.byId['p1'].visibleSystems).toContain('s2');
  });
});

// ── processFogOfWar ───────────────────────────────────────────────────────────

describe('processFogOfWar', () => {
  it('updates visibility for all empires each turn', () => {
    const fleet1 = makeFleet('f1', 's1', 'e1');
    const fleet2 = makeFleet('f2', 's3', 'e2');

    const e1 = makeEmpire({ id: 'e1', fleets: ['f1'], scannerTechLevel: 0 });
    const e2 = makeEmpire({ id: 'e2', fleets: ['f2'], scannerTechLevel: 0 });

    // s2 is 0.5 ly from s1 — e1 can see it; s4 is 0.5 ly from s3 — e2 can see it
    const s1 = makeSystem('s1', 0, 0);
    const s2 = makeSystem('s2', 0.5, 0);
    const s3 = makeSystem('s3', 10, 0);
    const s4 = makeSystem('s4', 10.5, 0);

    const state = buildState({
      systems: [s1, s2, s3, s4],
      empires: [e1, e2],
      fleets: [fleet1, fleet2],
    });

    const next = processFogOfWar(state);

    expect(next.empires.byId['e1'].visibleSystems).toContain('s2');
    expect(next.empires.byId['e2'].visibleSystems).toContain('s4');
  });

  it('stationary fleets mark their own system as explored', () => {
    // Fleet with destination=null means it's not moving
    const fleet = makeFleet('f1', 's1');
    const empire = makeEmpire({ id: 'p1', fleets: ['f1'], exploredSystems: [] });
    const sys = makeSystem('s1', 0, 0);
    const state = buildState({ systems: [sys], empires: [empire], fleets: [fleet] });

    const next = processFogOfWar(state);

    expect(next.empires.byId['p1'].exploredSystems).toContain('s1');
  });

  it('colonies reveal and explore their own system', () => {
    const planet = makePlanet('pl1', 's1', 'p1');
    const empire = makeEmpire({
      id: 'p1',
      planets: ['pl1'],
      exploredSystems: [],
      visibleSystems: [],
    });
    const sys = makeSystem('s1', 0, 0);
    const state = buildState({
      systems: [sys],
      empires: [empire],
      planets: [planet],
    });

    const next = processFogOfWar(state);

    expect(next.empires.byId['p1'].exploredSystems).toContain('s1');
    expect(next.empires.byId['p1'].visibleSystems).toContain('s1');
  });

  it('skips defeated empires', () => {
    const fleet = makeFleet('f1', 's1');
    const empire = makeEmpire({
      id: 'p1',
      fleets: ['f1'],
      isDefeated: true,
      exploredSystems: [],
    });
    const sys = makeSystem('s1', 0, 0);
    const state = buildState({ systems: [sys], empires: [empire], fleets: [fleet] });

    const next = processFogOfWar(state);

    // Defeated empire should not get any exploration updates
    expect(next.empires.byId['p1'].exploredSystems).toHaveLength(0);
  });
});
