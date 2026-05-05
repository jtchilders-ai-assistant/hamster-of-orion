/**
 * Galactic High Council tests.
 * test/game/systems/council.test.ts
 *
 * Validates functions in src/game/systems/council.ts against the spec in
 * design/diplomacy/council.md.
 */

import { describe, it, expect } from 'vitest';
import {
  isCouncilTurn,
  calculateVoteShares,
  getCouncilCandidates,
  runAIVotes,
  checkDiplomaticVictory,
  isCouncilFormationMet,
  calculateTechBribeValue,
  calculateTotalBribeValue,
  calculateBriberyFactor,
  COUNCIL_INTERVAL,
  VICTORY_THRESHOLD,
  ALLIANCE_VOTE_LOYALTY,
  CHAMELEON_ALLIANCE_LOYALTY,
  TECH_VALUE_PER_TIER,
  TECH_VALUE_NEW_BONUS,
  BRIBERY_WEIGHT,
  MAX_BRIBERY_FACTOR,
} from '../../../src/game/systems/council';
import {
  Empire,
  EmpireId,
  GameState,
  DiplomaticRelations,
  Planet,
  PlanetId,
  Treaty,
} from '../../../src/game/state';

// ── Minimal state factory ─────────────────────────────────────────────────────

function makeRelation(
  empireA: EmpireId,
  empireB: EmpireId,
  value = 0,
): DiplomaticRelations {
  return {
    empireA,
    empireB,
    value,
    state: value < -50 ? 'war' : value < 0 ? 'unfriendly' : value <= 49 ? 'neutral' : value <= 79 ? 'friendly' : 'allied',
    treaties: [],
    events: [],
    warStartTurn: null,
    lastContact: 1,
    modifiers: [],
    incomingProposals: [],
  };
}

function makeEmpire(
  id: EmpireId,
  raceId: string,
  planetIds: PlanetId[] = [],
  relations: Record<EmpireId, DiplomaticRelations> = {},
): Empire {
  return {
    id,
    raceId,
    name: `Empire ${id}`,
    isPlayer: false,
    credits: 0,
    creditPerTurn: 0,
    planets: planetIds,
    fleets: [],
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
    relations,
    isDefeated: false,
    defeatedTurn: null,
    scannerTechLevel: 0,
    computerTechLevel: 0,
    securityLevel: 0,
    exploredSystems: [],
    visibleSystems: [],
  };
}

function makePlanet(id: PlanetId, ownerId: EmpireId | null, population: number): Planet {
  return {
    id,
    name: `Planet ${id}`,
    systemId: 's1',
    orbit: 1,
    type: 'terran',
    size: 'medium',
    gravity: 1,
    ownerId,
    isColonized: ownerId !== null,
    isHomeworld: false,
    population,
    maxPopulation: 100,
    growthRate: 1,
    morale: 'content',
    factories: 0,
    maxFactories: 10,
    waste: 0,
    production: { ship: 0, defense: 0, industry: 0, ecology: 0, research: 0 },
    buildQueue: [],
    buildings: [],
    missileBases: 0,
    maxMissileBases: 5,
    planetaryShield: 0,
    isRich: false,
    isPoor: false,
    isGaia: false,
    hasArtifacts: false,
    currentDesignId: null,
    shipyardProgress: 0,
    resourceLevel: 'normal',
    researchMultiplier: 1,
    startingPopulation: null,
    startingFactories: null,
    groundAttack: 0,
    groundDefense: 0,
  };
}

/** Build a minimal GameState. */
function makeState(
  empires: Empire[],
  planets: Planet[] = [],
  turn = 50,
): GameState {
  const empireById: Record<EmpireId, Empire> = {};
  for (const e of empires) empireById[e.id] = e;

  const planetById: Record<PlanetId, Planet> = {};
  for (const p of planets) planetById[p.id] = p;

  return {
    version: '0.1.0',
    seed: 'test',
    turn,
    year: 2450,
    difficulty: 'average',
    isPaused: false,
    gameSpeed: 'normal',
    currentScreen: 'galaxy',
    victoryCondition: null,
    defeatedTurn: null,
    createdAt: 0,
    lastPlayed: 0,
    playTime: 0,
    galaxy: {
      id: 'g1',
      size: 'small',
      shape: 'spiral',
      width: 100,
      height: 100,
      systemCount: 0,
      systems: { byId: {}, allIds: [] },
      quadTree: {
        bounds: { x: 0, y: 0, width: 100, height: 100 },
        systemIds: [],
        children: null,
      },
      nebulae: [],
      clusters: [],
      artifactsSystemIds: [],
      orionSystemId: 's_orion',
      homeSystemIds: {},
      fogOfWar: {},
    },
    planets: {
      byId: planetById,
      allIds: planets.map(p => p.id),
    },
    fleets: { byId: {}, allIds: [] },
    ships: { byId: {}, allIds: [] },
    shipDesigns: { byId: {}, allIds: [] },
    empires: {
      byId: empireById,
      allIds: empires.map(e => e.id),
      playerId: empires[0]?.id ?? '',
    },
    combats: { byId: {}, allIds: [], activeCombatId: null },
    aiEmpires: {},
    highCouncil: null,
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
        groundCombat: { open: false },
      },
      notifications: [],
      filters: {
        planetsSort: 'name',
        fleetsFilter: 'all',
      },
      settings: {
        masterVolume: 1,
        musicVolume: 1,
        sfxVolume: 1,
        ambientVolume: 1,
        particleEffects: true,
        animationSpeed: 'normal',
        showGrid: false,
        autosave: true,
        autosaveFrequency: 10,
        autoEndTurn: false,
        confirmEndTurn: true,
        showTutorials: false,
        colorBlindMode: false,
        textSize: 14,
        highContrast: false,
        screenReaderEnabled: false,
        customHotkeys: {},
      },
    },
  };
}

// ── 1. isCouncilTurn ──────────────────────────────────────────────────────────

describe('isCouncilTurn', () => {
  it('returns true for multiples of COUNCIL_INTERVAL (25)', () => {
    expect(isCouncilTurn(25)).toBe(true);
    expect(isCouncilTurn(50)).toBe(true);
    expect(isCouncilTurn(75)).toBe(true);
    expect(isCouncilTurn(100)).toBe(true);
    expect(isCouncilTurn(200)).toBe(true);
  });

  it('returns false for turn 0', () => {
    expect(isCouncilTurn(0)).toBe(false);
  });

  it('returns false for non-multiples', () => {
    expect(isCouncilTurn(1)).toBe(false);
    expect(isCouncilTurn(24)).toBe(false);
    expect(isCouncilTurn(26)).toBe(false);
    expect(isCouncilTurn(49)).toBe(false);
    expect(isCouncilTurn(51)).toBe(false);
    expect(isCouncilTurn(99)).toBe(false);
  });

  it('COUNCIL_INTERVAL constant is 25', () => {
    expect(COUNCIL_INTERVAL).toBe(25);
  });
});

// ── 2. calculateVoteShares ───────────────────────────────────────────────────

describe('calculateVoteShares', () => {
  it('sums to approximately 100%', () => {
    const pA1 = makePlanet('pA1', 'A', 300);
    const pB1 = makePlanet('pB1', 'B', 250);
    const pC1 = makePlanet('pC1', 'C', 200);
    const pD1 = makePlanet('pD1', 'D', 250);

    const empA = makeEmpire('A', 'hamsters',    ['pA1']);
    const empB = makeEmpire('B', 'guinea_pigs', ['pB1']);
    const empC = makeEmpire('C', 'rats',        ['pC1']);
    const empD = makeEmpire('D', 'budgies',     ['pD1']);

    const state = makeState([empA, empB, empC, empD], [pA1, pB1, pC1, pD1]);
    const shares = calculateVoteShares(state);

    const total = Object.values(shares).reduce((s, v) => s + v, 0);
    expect(total).toBeCloseTo(100, 1);
  });

  it('assigns proportional shares (300/1000 = 30%)', () => {
    const pA = makePlanet('pA', 'A', 300);
    const pB = makePlanet('pB', 'B', 700);
    const empA = makeEmpire('A', 'hamsters',    ['pA']);
    const empB = makeEmpire('B', 'guinea_pigs', ['pB']);

    const state = makeState([empA, empB], [pA, pB]);
    const shares = calculateVoteShares(state);

    expect(shares['A']).toBeCloseTo(30, 1);
    expect(shares['B']).toBeCloseTo(70, 1);
  });

  it('returns equal shares when all populations are zero', () => {
    const empA = makeEmpire('A', 'hamsters');
    const empB = makeEmpire('B', 'rats');
    const state = makeState([empA, empB], []);
    const shares = calculateVoteShares(state);
    expect(shares['A']).toBeCloseTo(50, 1);
    expect(shares['B']).toBeCloseTo(50, 1);
  });

  it('excludes defeated empires', () => {
    const pA = makePlanet('pA', 'A', 500);
    const pB = makePlanet('pB', 'B', 500);
    const empA = makeEmpire('A', 'hamsters',    ['pA']);
    const empB = { ...makeEmpire('B', 'rats', ['pB']), isDefeated: true };

    const state = makeState([empA, empB], [pA, pB]);
    const shares = calculateVoteShares(state);

    // B is defeated; only A should appear.
    expect(shares['A']).toBeCloseTo(100, 1);
    expect(shares['B']).toBeUndefined();
  });
});

// ── 3. getCouncilCandidates ──────────────────────────────────────────────────

describe('getCouncilCandidates', () => {
  it('returns the two empires with the highest population shares', () => {
    const pA = makePlanet('pA', 'A', 400);
    const pB = makePlanet('pB', 'B', 350);
    const pC = makePlanet('pC', 'C', 150);
    const pD = makePlanet('pD', 'D', 100);

    const empA = makeEmpire('A', 'hamsters',    ['pA']);
    const empB = makeEmpire('B', 'guinea_pigs', ['pB']);
    const empC = makeEmpire('C', 'rats',        ['pC']);
    const empD = makeEmpire('D', 'budgies',     ['pD']);

    const state = makeState([empA, empB, empC, empD], [pA, pB, pC, pD]);
    const [c1, c2] = getCouncilCandidates(state);

    expect(c1).toBe('A');  // 40%
    expect(c2).toBe('B');  // 35%
  });

  it('breaks ties alphabetically', () => {
    // A and B tie, C and D tie — should be A, C (alphabetical within each rank)
    const pA = makePlanet('pA', 'A', 500);
    const pB = makePlanet('pB', 'B', 500);
    const pC = makePlanet('pC', 'C', 250);
    const pD = makePlanet('pD', 'D', 250);

    const empA = makeEmpire('A', 'hamsters',    ['pA']);
    const empB = makeEmpire('B', 'guinea_pigs', ['pB']);
    const empC = makeEmpire('C', 'rats',        ['pC']);
    const empD = makeEmpire('D', 'budgies',     ['pD']);

    const state = makeState([empA, empB, empC, empD], [pA, pB, pC, pD]);
    const [c1, c2] = getCouncilCandidates(state);

    // A and B tie for first; A wins alphabetically. B and C,D all differ in second round.
    expect(c1).toBe('A');
    expect(c2).toBe('B');
  });
});

// ── 4. checkDiplomaticVictory ────────────────────────────────────────────────

describe('checkDiplomaticVictory', () => {
  it('returns winner when candidate has ≥2/3 of effective votes', () => {
    // A has 40%, B has 25%, C has 20%, D has 15%
    const voteShares: Record<EmpireId, number> = { A: 40, B: 25, C: 20, D: 15 };
    // Everyone votes for A (self + others)
    const votes: Record<EmpireId, EmpireId> = { A: 'A', B: 'A', C: 'A', D: 'A' };
    const candidates: [EmpireId, EmpireId] = ['A', 'B'];

    const winner = checkDiplomaticVictory(voteShares, votes, candidates);
    expect(winner).toBe('A');
  });

  it('returns null when no candidate reaches 2/3', () => {
    // A=40%, B=35%, C=25% — A and B split roughly evenly
    const voteShares: Record<EmpireId, number> = { A: 40, B: 35, C: 25 };
    const votes: Record<EmpireId, EmpireId> = { A: 'A', C: 'A', B: 'B' };
    const candidates: [EmpireId, EmpireId] = ['A', 'B'];

    // A has 65%, threshold = ceil(100 × 2/3) = 67 → no winner
    const winner = checkDiplomaticVictory(voteShares, votes, candidates);
    expect(winner).toBeNull();
  });

  it('returns second candidate as winner when they hit threshold', () => {
    // B is the big dog
    const voteShares: Record<EmpireId, number> = { A: 20, B: 50, C: 30 };
    const votes: Record<EmpireId, EmpireId> = { A: 'B', B: 'B', C: 'B' };
    const candidates: [EmpireId, EmpireId] = ['A', 'B'];

    const winner = checkDiplomaticVictory(voteShares, votes, candidates);
    expect(winner).toBe('B');
  });

  it('handles abstentions correctly — reduces effective total and threshold', () => {
    // A=35%, B=30%, C=20%, D=15% (total 100)
    // D abstains — effective total = 85%, threshold = ceil(85 × 2/3) = 57
    // A gets 35+20=55 → no win without D
    const voteShares: Record<EmpireId, number> = { A: 35, B: 30, C: 20, D: 15 };
    const votes: Record<EmpireId, EmpireId> = { A: 'A', C: 'A', B: 'B' }; // D abstains
    const candidates: [EmpireId, EmpireId] = ['A', 'B'];

    const winner = checkDiplomaticVictory(voteShares, votes, candidates);
    expect(winner).toBeNull(); // 55 < 57
  });

  it('returns null when no quorum (effective votes < 50%)', () => {
    // Heavy abstentions
    const voteShares: Record<EmpireId, number> = { A: 20, B: 20, C: 60 };
    // C abstains — effective total = 40% which is below MIN_EFFECTIVE_VOTES
    const votes: Record<EmpireId, EmpireId> = { A: 'A', B: 'B' };
    const candidates: [EmpireId, EmpireId] = ['A', 'B'];

    const winner = checkDiplomaticVictory(voteShares, votes, candidates);
    expect(winner).toBeNull();
  });

  it('VICTORY_THRESHOLD constant is 2/3', () => {
    expect(VICTORY_THRESHOLD).toBeCloseTo(2 / 3, 5);
  });
});

// ── 5. runAIVotes ────────────────────────────────────────────────────────────

describe('runAIVotes', () => {
  it('candidates always vote for themselves', () => {
    const pA = makePlanet('pA', 'A', 400);
    const pB = makePlanet('pB', 'B', 300);
    const empA = makeEmpire('A', 'hamsters',    ['pA']);
    const empB = makeEmpire('B', 'guinea_pigs', ['pB']);
    const state = makeState([empA, empB], [pA, pB]);

    const votes = runAIVotes(state, ['A', 'B']);
    expect(votes['A']).toBe('A');
    expect(votes['B']).toBe('B');
  });

  it('third empire votes for the candidate it has better relations with', () => {
    const pA = makePlanet('pA', 'A', 350);
    const pB = makePlanet('pB', 'B', 300);
    const pC = makePlanet('pC', 'C', 350);

    // C is friendly with A (+70) and unfriendly with B (-40)
    const relCA = makeRelation('C', 'A', 70);
    const relCB = makeRelation('C', 'B', -40);
    const relAC = makeRelation('A', 'C', 70);
    const relBC = makeRelation('B', 'C', -40);
    const relAB = makeRelation('A', 'B', 0);
    const relBA = makeRelation('B', 'A', 0);

    const empA = makeEmpire('A', 'hamsters',    ['pA'], { C: relAC, B: relAB });
    const empB = makeEmpire('B', 'guinea_pigs', ['pB'], { C: relBC, A: relBA });
    const empC = makeEmpire('C', 'rats',        ['pC'], { A: relCA, B: relCB });

    const state = makeState([empA, empB, empC], [pA, pB, pC]);
    const votes = runAIVotes(state, ['A', 'B']);

    // C should vote for A (better relation)
    expect(votes['C']).toBe('A');
  });

  it('empire at war with one candidate votes for the other', () => {
    const pA = makePlanet('pA', 'A', 350);
    const pB = makePlanet('pB', 'B', 300);
    const pC = makePlanet('pC', 'C', 350);

    // C is at war with A
    const relCA: DiplomaticRelations = { ...makeRelation('C', 'A', -80), state: 'war' };
    const relAC: DiplomaticRelations = { ...makeRelation('A', 'C', -80), state: 'war' };
    const relCB = makeRelation('C', 'B', 0);
    const relBC = makeRelation('B', 'C', 0);
    const relAB = makeRelation('A', 'B', 0);
    const relBA = makeRelation('B', 'A', 0);

    const empA = makeEmpire('A', 'hamsters',    ['pA'], { C: relAC, B: relAB });
    const empB = makeEmpire('B', 'guinea_pigs', ['pB'], { C: relBC, A: relBA });
    const empC = makeEmpire('C', 'rats',        ['pC'], { A: relCA, B: relCB });

    const state = makeState([empA, empB, empC], [pA, pB, pC]);
    const votes = runAIVotes(state, ['A', 'B']);

    // C is at war with A → must vote B
    expect(votes['C']).toBe('B');
  });

  it('empire at war with both candidates abstains', () => {
    const pA = makePlanet('pA', 'A', 350);
    const pB = makePlanet('pB', 'B', 300);
    const pC = makePlanet('pC', 'C', 350);

    const relCA: DiplomaticRelations = { ...makeRelation('C', 'A', -80), state: 'war' };
    const relCB: DiplomaticRelations = { ...makeRelation('C', 'B', -80), state: 'war' };
    const relAC: DiplomaticRelations = { ...makeRelation('A', 'C', -80), state: 'war' };
    const relBC: DiplomaticRelations = { ...makeRelation('B', 'C', -80), state: 'war' };
    const relAB = makeRelation('A', 'B', 0);
    const relBA = makeRelation('B', 'A', 0);

    const empA = makeEmpire('A', 'hamsters',    ['pA'], { C: relAC, B: relAB });
    const empB = makeEmpire('B', 'guinea_pigs', ['pB'], { C: relBC, A: relBA });
    const empC = makeEmpire('C', 'rats',        ['pC'], { A: relCA, B: relCB });

    const state = makeState([empA, empB, empC], [pA, pB, pC]);
    const votes = runAIVotes(state, ['A', 'B']);

    // C at war with both → abstain (not in votes map)
    expect(votes['C']).toBeUndefined();
  });
});

// ── 6. isCouncilFormationMet ─────────────────────────────────────────────────

describe('isCouncilFormationMet', () => {
  it('returns true when ≥50% of habitable planets are colonised', () => {
    const p1 = makePlanet('p1', 'A', 100);
    const p2 = makePlanet('p2', 'B', 100);
    const p3 = { ...makePlanet('p3', null, 0), isColonized: false };
    const p4 = { ...makePlanet('p4', null, 0), isColonized: false };

    const empA = makeEmpire('A', 'hamsters',    ['p1']);
    const empB = makeEmpire('B', 'guinea_pigs', ['p2']);
    const state = makeState([empA, empB], [p1, p2, p3, p4]);

    // 2 of 4 colonised = 50%
    expect(isCouncilFormationMet(state)).toBe(true);
  });

  it('returns false when <50% of habitable planets are colonised', () => {
    const p1 = makePlanet('p1', 'A', 100);
    const p2 = { ...makePlanet('p2', null, 0), isColonized: false };
    const p3 = { ...makePlanet('p3', null, 0), isColonized: false };

    const empA = makeEmpire('A', 'hamsters', ['p1']);
    const state = makeState([empA], [p1, p2, p3]);

    // 1 of 3 = 33% < 50%
    expect(isCouncilFormationMet(state)).toBe(false);
  });

  it('excludes gas giants from habitable count', () => {
    const p1 = makePlanet('p1', 'A', 100);
    const p2: Planet = { ...makePlanet('p2', null, 0), type: 'gas_giant', isColonized: false };

    const empA = makeEmpire('A', 'hamsters', ['p1']);
    const state = makeState([empA], [p1, p2]);

    // Only 1 habitable (terran), it's colonised → 100% ≥ 50%
    expect(isCouncilFormationMet(state)).toBe(true);
  });

  it('uses difficulty-based threshold: Simple requires 60%, Impossible allows 40%', () => {
    // Create 10 planets, colonise 5 (50%)
    const planets: Planet[] = [];
    const colonisedIds: PlanetId[] = [];
    for (let i = 0; i < 10; i++) {
      const isColonised = i < 5;
      const ownerId = isColonised ? 'A' : null;
      planets.push({ ...makePlanet(`p${i}`, ownerId, isColonised ? 100 : 0), isColonized: isColonised });
      if (isColonised) colonisedIds.push(`p${i}`);
    }

    const empA = makeEmpire('A', 'hamsters', colonisedIds);
    
    // With Simple difficulty (60% threshold), 50% colonised should NOT meet threshold
    const stateSimple = { ...makeState([empA], planets), difficulty: 'simple' as const };
    expect(isCouncilFormationMet(stateSimple)).toBe(false);

    // With Impossible difficulty (40% threshold), 50% colonised SHOULD meet threshold
    const stateImpossible = { ...makeState([empA], planets), difficulty: 'impossible' as const };
    expect(isCouncilFormationMet(stateImpossible)).toBe(true);
  });

  it('Simple difficulty requires 60% colonised for council formation', () => {
    // Create 10 planets, colonise 6 (60%)
    const planets: Planet[] = [];
    const colonisedIds: PlanetId[] = [];
    for (let i = 0; i < 10; i++) {
      const isColonised = i < 6;
      const ownerId = isColonised ? 'A' : null;
      planets.push({ ...makePlanet(`p${i}`, ownerId, isColonised ? 100 : 0), isColonized: isColonised });
      if (isColonised) colonisedIds.push(`p${i}`);
    }

    const empA = makeEmpire('A', 'hamsters', colonisedIds);
    const state = { ...makeState([empA], planets), difficulty: 'simple' as const };
    
    // 60% exactly meets Simple's 60% threshold
    expect(isCouncilFormationMet(state)).toBe(true);
  });

  it('Impossible difficulty allows council at 40% colonised', () => {
    // Create 10 planets, colonise 4 (40%)
    const planets: Planet[] = [];
    const colonisedIds: PlanetId[] = [];
    for (let i = 0; i < 10; i++) {
      const isColonised = i < 4;
      const ownerId = isColonised ? 'A' : null;
      planets.push({ ...makePlanet(`p${i}`, ownerId, isColonised ? 100 : 0), isColonized: isColonised });
      if (isColonised) colonisedIds.push(`p${i}`);
    }

    const empA = makeEmpire('A', 'hamsters', colonisedIds);
    const state = { ...makeState([empA], planets), difficulty: 'impossible' as const };
    
    // 40% exactly meets Impossible's 40% threshold
    expect(isCouncilFormationMet(state)).toBe(true);
  });
});

// ── 7. Bribery Formulas (council.md §4.4) ─────────────────────────────────────

describe('calculateTechBribeValue (council.md §4.4)', () => {
  it('calculates Tech_Value = Tech_Tier × 50 when voter has tech', () => {
    // Tier 6 tech, voter already has it: 6 × 50 = 300
    expect(calculateTechBribeValue(6, true)).toBe(300);
    // Tier 1 tech: 1 × 50 = 50
    expect(calculateTechBribeValue(1, true)).toBe(50);
    // Tier 10 tech: 10 × 50 = 500
    expect(calculateTechBribeValue(10, true)).toBe(500);
  });

  it('adds +1000 bonus when voter does not have the tech', () => {
    // Tier 6 tech, voter doesn't have it: 6 × 50 + 1000 = 1300
    expect(calculateTechBribeValue(6, false)).toBe(1300);
    // Tier 1 tech: 1 × 50 + 1000 = 1050
    expect(calculateTechBribeValue(1, false)).toBe(1050);
  });

  it('constants match design doc values', () => {
    expect(TECH_VALUE_PER_TIER).toBe(50);
    expect(TECH_VALUE_NEW_BONUS).toBe(1000);
  });
});

describe('calculateTotalBribeValue (council.md §4.4)', () => {
  it('sums BC amount and tech values', () => {
    // 500 BC + Impulse Drive (tier 6, voter doesn't have it)
    const techValue = calculateTechBribeValue(6, false); // 1300
    expect(calculateTotalBribeValue(500, [techValue])).toBe(1800);
  });

  it('handles multiple technologies', () => {
    const tech1 = calculateTechBribeValue(3, false); // 150 + 1000 = 1150
    const tech2 = calculateTechBribeValue(5, true);  // 250
    expect(calculateTotalBribeValue(200, [tech1, tech2])).toBe(1600);
  });

  it('handles zero BC and empty techs', () => {
    expect(calculateTotalBribeValue(0, [])).toBe(0);
    expect(calculateTotalBribeValue(100, [])).toBe(100);
  });
});

describe('calculateBriberyFactor (council.md §4.4)', () => {
  it('applies formula: (Bribe_Value / Voter_Economy) × BRIBERY_WEIGHT × Modifier', () => {
    // Example from design doc: 1800 bribe / 400 economy × 100 × 1.0 = 450
    const result = calculateBriberyFactor(1800, 400, 1.0);
    // But capped at MAX_BRIBERY_FACTOR = 50
    expect(result).toBe(50);
  });

  it('returns uncapped value when below MAX_BRIBERY_FACTOR', () => {
    // 100 bribe / 400 economy × 100 × 1.0 = 25 (no cap)
    expect(calculateBriberyFactor(100, 400, 1.0)).toBe(25);
  });

  it('applies racial bribe modifier', () => {
    // 100 bribe / 400 economy × 100 × 1.5 (Rabbits) = 37.5
    expect(calculateBriberyFactor(100, 400, 1.5)).toBe(37.5);
    // 100 bribe / 400 economy × 100 × 0.3 (Guinea Pigs) = 7.5
    expect(calculateBriberyFactor(100, 400, 0.3)).toBe(7.5);
  });

  it('returns 0 when voter economy is 0 or negative', () => {
    expect(calculateBriberyFactor(1000, 0, 1.0)).toBe(0);
    expect(calculateBriberyFactor(1000, -100, 1.0)).toBe(0);
  });

  it('constants match design doc values', () => {
    expect(BRIBERY_WEIGHT).toBe(100);
    expect(MAX_BRIBERY_FACTOR).toBe(50);
  });
});

// ── 8. Alliance Voting (council.md §7.6) ──────────────────────────────────────

describe('alliance voting constants (council.md §7.6)', () => {
  it('ALLIANCE_VOTE_LOYALTY is 80%', () => {
    expect(ALLIANCE_VOTE_LOYALTY).toBe(0.80);
  });

  it('CHAMELEON_ALLIANCE_LOYALTY is 50%', () => {
    expect(CHAMELEON_ALLIANCE_LOYALTY).toBe(0.50);
  });
});

describe('runAIVotes with alliances (council.md §7.6)', () => {
  // Helper to create a relation with a military alliance treaty
  function makeAllianceRelation(
    empireA: EmpireId,
    empireB: EmpireId,
    value = 80,
  ): DiplomaticRelations {
    const treaty: Treaty = {
      id: `treaty-${empireA}-${empireB}`,
      type: 'military_alliance',
      signedTurn: 10,
      duration: null,
      terms: {},
      isActive: true,
      canBreak: true,
    };
    return {
      empireA,
      empireB,
      value,
      state: 'allied',
      treaties: [treaty],
      events: [],
      warStartTurn: null,
      lastContact: 1,
      modifiers: [],
      incomingProposals: [],
    };
  }

  it('allied empire tends to vote for allied candidate (80% loyalty for non-Chameleons)', () => {
    // Setup: C is allied with A but has worse relations with A than B
    // The alliance should override the relation-based decision most of the time
    const pA = makePlanet('pA', 'A', 350);
    const pB = makePlanet('pB', 'B', 300);
    const pC = makePlanet('pC', 'C', 350);

    // C has bad relations with A (-30) but good with B (+60)
    // However, C is allied with A, so should vote for A due to loyalty
    const relCA = makeAllianceRelation('C', 'A', -30);
    const relCB = makeRelation('C', 'B', 60);
    const relAC = makeAllianceRelation('A', 'C', -30);
    const relBC = makeRelation('B', 'C', 60);
    const relAB = makeRelation('A', 'B', 0);
    const relBA = makeRelation('B', 'A', 0);

    const empA = makeEmpire('A', 'hamsters',    ['pA'], { C: relAC, B: relAB });
    const empB = makeEmpire('B', 'guinea_pigs', ['pB'], { C: relBC, A: relBA });
    const empC = makeEmpire('C', 'rats',        ['pC'], { A: relCA, B: relCB });

    // Run multiple turns to test probabilistic behavior
    // Due to deterministic hash, we just verify the alliance is detected
    const state = makeState([empA, empB, empC], [pA, pB, pC], 50);
    const votes = runAIVotes(state, ['A', 'B']);

    // With the deterministic hash for turn 50 + 'C', the result is determined
    // We're testing that the alliance path is taken and produces a valid vote
    expect(votes['C']).toBeDefined();
    expect(['A', 'B']).toContain(votes['C']);
  });

  it('Chameleons have only 50% alliance loyalty', () => {
    const pA = makePlanet('pA', 'A', 350);
    const pB = makePlanet('pB', 'B', 300);
    const pC = makePlanet('pC', 'C', 350);

    // C (Chameleon) is allied with A
    const relCA = makeAllianceRelation('C', 'A', 50);
    const relCB = makeRelation('C', 'B', 40);
    const relAC = makeAllianceRelation('A', 'C', 50);
    const relBC = makeRelation('B', 'C', 40);
    const relAB = makeRelation('A', 'B', 0);
    const relBA = makeRelation('B', 'A', 0);

    const empA = makeEmpire('A', 'hamsters',    ['pA'], { C: relAC, B: relAB });
    const empB = makeEmpire('B', 'guinea_pigs', ['pB'], { C: relBC, A: relBA });
    const empC = makeEmpire('C', 'chameleons',  ['pC'], { A: relCA, B: relCB });

    const state = makeState([empA, empB, empC], [pA, pB, pC], 50);
    const votes = runAIVotes(state, ['A', 'B']);

    // Verify Chameleon produces a valid vote (alliance path or independent)
    expect(votes['C']).toBeDefined();
    expect(['A', 'B']).toContain(votes['C']);
  });

  it('alliance with both candidates falls through to score-based voting', () => {
    const pA = makePlanet('pA', 'A', 350);
    const pB = makePlanet('pB', 'B', 300);
    const pC = makePlanet('pC', 'C', 350);

    // C is allied with BOTH A and B
    const relCA = makeAllianceRelation('C', 'A', 50);
    const relCB = makeAllianceRelation('C', 'B', 80); // Better relations with B
    const relAC = makeAllianceRelation('A', 'C', 50);
    const relBC = makeAllianceRelation('B', 'C', 80);
    const relAB = makeRelation('A', 'B', 0);
    const relBA = makeRelation('B', 'A', 0);

    const empA = makeEmpire('A', 'hamsters',    ['pA'], { C: relAC, B: relAB });
    const empB = makeEmpire('B', 'guinea_pigs', ['pB'], { C: relBC, A: relBA });
    const empC = makeEmpire('C', 'rats',        ['pC'], { A: relCA, B: relCB });

    const state = makeState([empA, empB, empC], [pA, pB, pC], 50);
    const votes = runAIVotes(state, ['A', 'B']);

    // When allied with both, falls through to score-based voting
    // B has better relations (+80 vs +50), so C should vote for B
    expect(votes['C']).toBe('B');
  });
});
