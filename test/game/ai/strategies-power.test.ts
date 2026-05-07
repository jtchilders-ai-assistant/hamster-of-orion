/**
 * Ship Power Calculation tests.
 * test/game/ai/strategies-power.test.ts
 *
 * Tests for calculateShipPower and calculateFleetPower per
 * design/technical/ai-implementation.md §1.3 Military Threat Component.
 *
 * NO DOM imports — pure TypeScript only.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateShipPower,
  calculateFleetPower,
  getEmpireFleetPower,
} from '../../../src/game/ai/strategies';
import {
  GameState,
  Fleet,
  Ship,
  ShipDesign,
  Empire,
  ShipComponent,
} from '../../../src/game/state';
import { initialState } from '../../../src/game/initialState';
import { HULL_BASE_HP, ARMOR_MULTIPLIERS } from '../../../src/game/constants';

// ── Test fixtures ─────────────────────────────────────────────────────────────

function makeDesign(
  id: string,
  overrides: Partial<ShipDesign> = {},
): ShipDesign {
  return {
    id,
    name: `Test Ship ${id}`,
    class: 'medium',
    ownerId: 'empire-1',
    size: 70,
    spaceUsed: 50,
    spaceFree: 20,
    components: [],
    stats: {
      cost: 100,
      maintenance: 2,
      hp: 18, // medium hull
      shieldHp: 0,
      speed: 4,
      range: 5,
      weapons: [],
      defense: {
        armor: 1.0,
        shields: 0,
        ecm: 0,
      },
      special: [],
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 0,
    ...overrides,
  };
}

function makeShip(
  id: string,
  designId: string,
  overrides: Partial<Ship> = {},
): Ship {
  return {
    id,
    name: `Ship ${id}`,
    designId,
    ownerId: 'empire-1',
    fleetId: 'fleet-1',
    hp: 18,
    maxHp: 18,
    shieldHp: 0,
    maxShieldHp: 0,
    experience: 'regular',
    kills: 0,
    combatPosition: null,
    hasActed: false,
    specialSystems: {},
    ...overrides,
  };
}

function makeFleet(
  id: string,
  shipIds: string[],
  overrides: Partial<Fleet> = {},
): Fleet {
  return {
    id,
    name: `Fleet ${id}`,
    ownerId: 'empire-1',
    shipIds,
    systemId: 'system-1',
    destination: null,
    turnsToArrival: 0,
    orders: 'guard',
    ...overrides,
  };
}

function cloneState(): GameState {
  return JSON.parse(JSON.stringify(initialState)) as GameState;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('calculateShipPower (design/technical/ai-implementation.md §1.3)', () => {
  it('returns minimum power of 1 for empty design', () => {
    const design = makeDesign('test-1');
    const power = calculateShipPower(design);
    expect(power).toBeGreaterThanOrEqual(1);
  });

  it('calculates HP component: Hull_HP × Armor_Multiplier × 0.5', () => {
    // Medium hull = 18 HP, no armor = 1.0 multiplier
    // HP component = 18 × 1.0 × 0.5 = 9
    const design = makeDesign('test-2', {
      class: 'medium',
      stats: {
        cost: 100,
        maintenance: 2,
        hp: 18,
        shieldHp: 0,
        speed: 0, // No speed contribution
        range: 5,
        weapons: [], // No weapon contribution
        defense: {
          armor: 1.0,
          shields: 0, // No shield contribution
          ecm: 0,
        },
        special: [],
      },
    });

    const power = calculateShipPower(design);
    // 18 × 1.0 × 0.5 + 0 + 0 + 0 = 9
    expect(power).toBe(9);
  });

  it('calculates weapon damage component: Total_Weapon_Damage × 2.0', () => {
    const design = makeDesign('test-3', {
      class: 'small', // 3 HP
      stats: {
        cost: 50,
        maintenance: 1,
        hp: 3,
        shieldHp: 0,
        speed: 0,
        range: 5,
        weapons: [
          { name: 'Laser', damage: '10', range: 3, type: 'beam' }, // 10 dmg
          { name: 'Laser', damage: '10', range: 3, type: 'beam' }, // 10 dmg
        ],
        defense: {
          armor: 1.0,
          shields: 0,
          ecm: 0,
        },
        special: [],
      },
    });

    const power = calculateShipPower(design);
    // HP: 3 × 1.0 × 0.5 = 1.5
    // Weapons: (10 + 10) × 2.0 = 40
    // Total: floor(1.5 + 40) = 41
    expect(power).toBe(41);
  });

  it('calculates shield component: Shield_Class × 5', () => {
    const design = makeDesign('test-4', {
      class: 'small', // 3 HP
      stats: {
        cost: 50,
        maintenance: 1,
        hp: 3,
        shieldHp: 0,
        speed: 0,
        range: 5,
        weapons: [],
        defense: {
          armor: 1.0,
          shields: 5, // Class V shields
          ecm: 0,
        },
        special: [],
      },
    });

    const power = calculateShipPower(design);
    // HP: 3 × 1.0 × 0.5 = 1.5
    // Shields: 5 × 5 = 25
    // Total: floor(1.5 + 25) = 26
    expect(power).toBe(26);
  });

  it('calculates speed component: Speed × 3', () => {
    const design = makeDesign('test-5', {
      class: 'small', // 3 HP
      stats: {
        cost: 50,
        maintenance: 1,
        hp: 3,
        shieldHp: 0,
        speed: 8, // Max combat speed
        range: 5,
        weapons: [],
        defense: {
          armor: 1.0,
          shields: 0,
          ecm: 0,
        },
        special: [],
      },
    });

    const power = calculateShipPower(design);
    // HP: 3 × 1.0 × 0.5 = 1.5
    // Speed: 8 × 3 = 24
    // Total: floor(1.5 + 24) = 25
    expect(power).toBe(25);
  });

  it('parses damage range strings correctly (e.g., "2-8")', () => {
    const design = makeDesign('test-6', {
      class: 'small',
      stats: {
        cost: 50,
        maintenance: 1,
        hp: 3,
        shieldHp: 0,
        speed: 0,
        range: 5,
        weapons: [
          { name: 'Fusion Beam', damage: '2-8', range: 3, type: 'beam' },
        ],
        defense: {
          armor: 1.0,
          shields: 0,
          ecm: 0,
        },
        special: [],
      },
    });

    const power = calculateShipPower(design);
    // HP: 3 × 1.0 × 0.5 = 1.5
    // Weapons: average(2, 8) × 2.0 = 5 × 2 = 10
    // Total: floor(1.5 + 10) = 11
    expect(power).toBe(11);
  });

  it('uses armor multiplier from components', () => {
    const design = makeDesign('test-7', {
      class: 'medium', // 18 HP
      components: [
        { id: 'zortrium', type: 'armor', name: 'Zortrium Armor', space: 0, baseCost: 100, count: 1 },
      ],
      stats: {
        cost: 100,
        maintenance: 2,
        hp: 18,
        shieldHp: 0,
        speed: 0,
        range: 5,
        weapons: [],
        defense: {
          armor: ARMOR_MULTIPLIERS['zortrium'], // Use the actual value from constants
          shields: 0,
          ecm: 0,
        },
        special: [],
      },
    });

    const power = calculateShipPower(design);
    // HP: 18 × 2.0 × 0.5 = 18 (zortrium = 2.0× per ai-implementation.md §1.3)
    // Total: floor(18) = 18
    expect(power).toBe(18);
  });

  it('matches worked example from design doc', () => {
    // From design/technical/ai-implementation.md §1.3 worked example:
    // Large ship with Fusion Beams (20 dmg), Class V shields, Zortrium armor (2.0×)
    // Ship_Power = floor((100 × 2.0 × 0.5) + (20 × 2.0) + (5 × 5) + (4 × 3))
    //            = floor(100 + 40 + 25 + 12) = 177

    const design = makeDesign('worked-example', {
      class: 'large', // 100 HP per HULL_BASE_HP
      components: [
        { id: 'zortrium', type: 'armor', name: 'Zortrium Armor', space: 0, baseCost: 100, count: 1 },
      ],
      stats: {
        cost: 200,
        maintenance: 4,
        hp: HULL_BASE_HP['large'], // 100
        shieldHp: 0,
        speed: 4,
        range: 5,
        weapons: [
          { name: 'Fusion Beam', damage: '20', range: 3, type: 'beam' },
        ],
        defense: {
          armor: ARMOR_MULTIPLIERS['zortrium'], // 2.0 per ai-implementation.md
          shields: 5,
          ecm: 0,
        },
        special: [],
      },
    });

    const power = calculateShipPower(design);
    // HP: 100 × 2.0 × 0.5 = 100
    // Weapons: 20 × 2.0 = 40
    // Shields: 5 × 5 = 25
    // Speed: 4 × 3 = 12
    // Total: floor(100 + 40 + 25 + 12) = 177
    expect(power).toBe(177);
  });
});

describe('calculateFleetPower (design/technical/ai-implementation.md §1.3)', () => {
  it('returns 0 for empty fleet', () => {
    const state = cloneState();
    const fleet = makeFleet('fleet-1', []);
    state.fleets.byId[fleet.id] = fleet;
    state.fleets.allIds = [fleet.id];

    const power = calculateFleetPower(fleet, state);
    expect(power).toBe(0);
  });

  it('sums power of all ships in fleet', () => {
    const state = cloneState();

    // Create a simple design
    const design = makeDesign('design-1', {
      class: 'small',
      stats: {
        cost: 50,
        maintenance: 1,
        hp: 3,
        shieldHp: 0,
        speed: 4,
        range: 5,
        weapons: [{ name: 'Laser', damage: '10', range: 3, type: 'beam' }],
        defense: { armor: 1.0, shields: 0, ecm: 0 },
        special: [],
      },
    });
    state.shipDesigns.byId[design.id] = design;
    state.shipDesigns.allIds = [design.id];

    // Create 3 ships with this design
    const ships = [
      makeShip('ship-1', 'design-1', { hp: 3, maxHp: 3 }),
      makeShip('ship-2', 'design-1', { hp: 3, maxHp: 3 }),
      makeShip('ship-3', 'design-1', { hp: 3, maxHp: 3 }),
    ];
    for (const ship of ships) {
      state.ships.byId[ship.id] = ship;
    }
    state.ships.allIds = ships.map((s) => s.id);

    const fleet = makeFleet('fleet-1', ships.map((s) => s.id));
    state.fleets.byId[fleet.id] = fleet;
    state.fleets.allIds = [fleet.id];

    // Calculate expected ship power:
    // HP: 3 × 1.0 × 0.5 = 1.5
    // Weapons: 10 × 2.0 = 20
    // Speed: 4 × 3 = 12
    // Total per ship: floor(1.5 + 20 + 12) = 33
    // Fleet: 33 × 3 = 99
    const power = calculateFleetPower(fleet, state);
    expect(power).toBe(99);
  });

  it('adjusts power based on ship HP ratio (damaged ships)', () => {
    const state = cloneState();

    const design = makeDesign('design-1', {
      class: 'medium',
      stats: {
        cost: 100,
        maintenance: 2,
        hp: 18,
        shieldHp: 0,
        speed: 4,
        range: 5,
        weapons: [],
        defense: { armor: 1.0, shields: 0, ecm: 0 },
        special: [],
      },
    });
    state.shipDesigns.byId[design.id] = design;
    state.shipDesigns.allIds = [design.id];

    // Full HP ship
    const fullShip = makeShip('ship-1', 'design-1', { hp: 18, maxHp: 18 });
    // Half HP ship
    const damagedShip = makeShip('ship-2', 'design-1', { hp: 9, maxHp: 18 });

    state.ships.byId[fullShip.id] = fullShip;
    state.ships.byId[damagedShip.id] = damagedShip;
    state.ships.allIds = [fullShip.id, damagedShip.id];

    const fleet = makeFleet('fleet-1', [fullShip.id, damagedShip.id]);
    state.fleets.byId[fleet.id] = fleet;
    state.fleets.allIds = [fleet.id];

    // Design power: floor(18 × 1.0 × 0.5 + 4 × 3) = floor(9 + 12) = 21
    // Full ship: 21 × 1.0 = 21
    // Damaged ship: floor(21 × 0.5) = 10
    // Total: 21 + 10 = 31
    const power = calculateFleetPower(fleet, state);
    expect(power).toBe(31);
  });
});

describe('getEmpireFleetPower (design/technical/ai-implementation.md §1.3)', () => {
  it('returns 0 for empire with no fleets', () => {
    const state = cloneState();
    const empire: Empire = {
      id: 'empire-1',
      name: 'Test Empire',
      raceId: 'hamsters',
      color: '#ff0000',
      homeSystemId: 'system-1',
      homePlanetId: 'planet-1',
      planets: [],
      fleets: [],
      knownSystems: [],
      exploredSystems: [],
      technologies: { researched: [], available: [], current: null, progress: {} },
      treasury: 100,
      income: 10,
      expenses: 5,
      researchOutput: 5,
      productionOutput: 10,
      foodOutput: 0,
      foodConsumption: 0,
      researchAllocation: {},
      relations: {},
      isAI: false,
      isDefeated: false,
      ai: null,
      traits: [],
      leaders: [],
      reputation: { honor: 0, peace: 0, fairness: 0, mercy: 0, overall: 0 },
      espionage: { defensiveAgents: 0, offensiveAgents: {}, totalAgents: 0, maxAgents: 10 },
      shipDesignIds: [],
    };
    state.empires.byId[empire.id] = empire;
    state.empires.allIds = [empire.id];

    const power = getEmpireFleetPower('empire-1', state);
    expect(power).toBe(0);
  });

  it('sums power across all empire fleets', () => {
    const state = cloneState();

    // Create design
    const design = makeDesign('design-1', {
      class: 'small',
      stats: {
        cost: 50,
        maintenance: 1,
        hp: 3,
        shieldHp: 0,
        speed: 0,
        range: 5,
        weapons: [],
        defense: { armor: 1.0, shields: 0, ecm: 0 },
        special: [],
      },
    });
    state.shipDesigns.byId[design.id] = design;
    state.shipDesigns.allIds = [design.id];

    // Create ships
    const ship1 = makeShip('ship-1', 'design-1');
    const ship2 = makeShip('ship-2', 'design-1');
    state.ships.byId[ship1.id] = ship1;
    state.ships.byId[ship2.id] = ship2;
    state.ships.allIds = [ship1.id, ship2.id];

    // Create 2 fleets with 1 ship each
    const fleet1 = makeFleet('fleet-1', [ship1.id]);
    const fleet2 = makeFleet('fleet-2', [ship2.id]);
    state.fleets.byId[fleet1.id] = fleet1;
    state.fleets.byId[fleet2.id] = fleet2;
    state.fleets.allIds = [fleet1.id, fleet2.id];

    // Create empire with both fleets
    const empire: Empire = {
      id: 'empire-1',
      name: 'Test Empire',
      raceId: 'hamsters',
      color: '#ff0000',
      homeSystemId: 'system-1',
      homePlanetId: 'planet-1',
      planets: [],
      fleets: [fleet1.id, fleet2.id],
      knownSystems: [],
      exploredSystems: [],
      technologies: { researched: [], available: [], current: null, progress: {} },
      treasury: 100,
      income: 10,
      expenses: 5,
      researchOutput: 5,
      productionOutput: 10,
      foodOutput: 0,
      foodConsumption: 0,
      researchAllocation: {},
      relations: {},
      isAI: false,
      isDefeated: false,
      ai: null,
      traits: [],
      leaders: [],
      reputation: { honor: 0, peace: 0, fairness: 0, mercy: 0, overall: 0 },
      espionage: { defensiveAgents: 0, offensiveAgents: {}, totalAgents: 0, maxAgents: 10 },
      shipDesignIds: [],
    };
    state.empires.byId[empire.id] = empire;
    state.empires.allIds = [empire.id];

    // Ship power: floor(3 × 1.0 × 0.5) = 1 (minimum)
    // 2 ships = 2 power
    const power = getEmpireFleetPower('empire-1', state);
    expect(power).toBe(2);
  });
});
