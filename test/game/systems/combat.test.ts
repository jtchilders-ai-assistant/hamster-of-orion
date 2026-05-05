/**
 * Unit tests for the combat engine.
 * NO DOM imports — pure game logic only.
 *
 * test/game/systems/combat.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initiateCombat,
  processRound,
  applyDamage,
  calcHitChanceVs,
  attemptRetreat,
  autoResolveCombat,
  setCombatRng,
  type CombatShip,
  type WeaponInstance,
  type FleetForCombat,
} from '../../../src/game/systems/combat';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeWeapon(overrides: Partial<WeaponInstance> = {}): WeaponInstance {
  return {
    id: 'laser-1',
    name: 'Laser Cannon',
    category: 'beam',
    damageMin: 1,
    damageMax: 4,
    attacksPerRound: 1,
    ...overrides,
  };
}

function makeShip(
  id: string,
  side: 'attacker' | 'defender',
  overrides: Partial<CombatShip> = {},
): CombatShip {
  return {
    id,
    designId: `design-${id}`,
    side,
    hp: 10,
    maxHp: 10,
    shieldClass: 0,
    weapons: [makeWeapon()],
    attackRating: 0,
    defenseRating: 0,
    speed: 3,
    experience: 'regular',
    retreated: false,
    ...overrides,
  };
}

function makeFleet(ships: CombatShip[]): FleetForCombat {
  return { ships };
}

// ── Deterministic RNG helpers ──────────────────────────────────────────────────

/** Always returns a fixed value in [0,1). */
function fixedRng(value: number) {
  return () => value;
}

/** Sequence of values, cycling back to start when exhausted. */
function seqRng(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('initiateCombat', () => {
  it('creates valid combat state from two fleets', () => {
    const attacker = makeFleet([makeShip('a1', 'attacker'), makeShip('a2', 'attacker')]);
    const defender = makeFleet([makeShip('d1', 'defender')]);

    const state = initiateCombat(attacker, defender);

    expect(state.round).toBe(0);
    expect(state.status).toBe('ongoing');
    expect(state.log).toHaveLength(0);
    expect(state.attackerShips).toHaveLength(2);
    expect(state.defenderShips).toHaveLength(1);
  });

  it('forces retreated=false on all ships', () => {
    const ship = { ...makeShip('a1', 'attacker'), retreated: true };
    const state = initiateCombat(makeFleet([ship]), makeFleet([makeShip('d1', 'defender')]));
    expect(state.attackerShips[0].retreated).toBe(false);
  });

  it('assigns sides correctly', () => {
    const state = initiateCombat(
      makeFleet([makeShip('a1', 'attacker')]),
      makeFleet([makeShip('d1', 'defender')]),
    );
    expect(state.attackerShips[0].side).toBe('attacker');
    expect(state.defenderShips[0].side).toBe('defender');
  });

  it('does not mutate the original fleet ships', () => {
    const ship = makeShip('a1', 'attacker', { hp: 5 });
    const fleet = makeFleet([ship]);
    initiateCombat(fleet, makeFleet([makeShip('d1', 'defender')]));
    expect(ship.hp).toBe(5); // unchanged
  });
});

// ── Hit-chance formula ─────────────────────────────────────────────────────────

describe('calcHitChanceVs — hit chance formula', () => {
  // Per design/ships/combat-algorithm.md Section 9:
  // Hit_Chance = 50 + (Effective_Attacker_Level - Effective_Defender_Level) × 10
  // Use hullSize: 'small' to avoid size modifier (+5% for medium targets)

  it('returns 50% when attack and defense ratings are equal', () => {
    const attacker = makeShip('a', 'attacker', { attackRating: 3, experience: 'regular', hullSize: 'small' });
    const target = makeShip('d', 'defender', { defenseRating: 3, hullSize: 'small' });
    const weapon = makeWeapon();
    // diff = 0 → 50 + 0*10 = 50
    expect(calcHitChanceVs(attacker, weapon, target)).toBe(50);
  });

  it('increases by 10 per point of attacker advantage (×10 per combat-algorithm.md)', () => {
    const attacker = makeShip('a', 'attacker', { attackRating: 5, experience: 'regular', hullSize: 'small' });
    const target = makeShip('d', 'defender', { defenseRating: 3, hullSize: 'small' });
    // diff = 2 → 50 + 2*10 = 70
    expect(calcHitChanceVs(attacker, weapon, target)).toBe(70);
  });

  it('decreases by 10 per point of defender advantage', () => {
    const attacker = makeShip('a', 'attacker', { attackRating: 1, experience: 'regular', hullSize: 'small' });
    const target = makeShip('d', 'defender', { defenseRating: 3, hullSize: 'small' });
    // diff = -2 → 50 - 2*10 = 30
    expect(calcHitChanceVs(attacker, weapon, target)).toBe(30);
  });

  it('clamps to minimum 5%', () => {
    const attacker = makeShip('a', 'attacker', { attackRating: 0, experience: 'regular' });
    const target = makeShip('d', 'defender', { defenseRating: 20 });
    expect(calcHitChanceVs(attacker, weapon, target)).toBe(5);
  });

  it('clamps to maximum 95%', () => {
    const attacker = makeShip('a', 'attacker', { attackRating: 20, experience: 'regular' });
    const target = makeShip('d', 'defender', { defenseRating: 0 });
    expect(calcHitChanceVs(attacker, weapon, target)).toBe(95);
  });

  it('returns 100 for always-hits weapons (bypasses clamp)', () => {
    const attacker = makeShip('a', 'attacker', { attackRating: 0, experience: 'regular' });
    const target = makeShip('d', 'defender', { defenseRating: 20 });
    const alwaysHit = makeWeapon({ alwaysHits: true });
    expect(calcHitChanceVs(attacker, alwaysHit, target)).toBe(100);
  });

  it('applies experience bonus: rookie -5%, veteran +5%, elite +10%', () => {
    const target = makeShip('d', 'defender', { defenseRating: 0 });
    const wep = makeWeapon();

    const rookie = makeShip('a', 'attacker', { attackRating: 0, experience: 'rookie' });
    const veteran = makeShip('b', 'attacker', { attackRating: 0, experience: 'veteran' });
    const elite = makeShip('c', 'attacker', { attackRating: 0, experience: 'elite' });

    expect(calcHitChanceVs(rookie, wep, target)).toBe(45);
    expect(calcHitChanceVs(veteran, wep, target)).toBe(55);
    expect(calcHitChanceVs(elite, wep, target)).toBe(60);
  });

  // Helper used inside the describe block
  const weapon = makeWeapon();
});

// ── Damage / shield application ────────────────────────────────────────────────

describe('applyDamage', () => {
  it('reduces HP by full damage when no shields', () => {
    const target = makeShip('d', 'defender', { hp: 10, shieldClass: 0 });
    applyDamage(target, 4, makeWeapon());
    expect(target.hp).toBe(6);
  });

  it('shields absorb damage before HP (shieldClass = absorption per hit)', () => {
    // shieldClass 3 absorbs 3; 5 damage → 2 reaches HP
    const target = makeShip('d', 'defender', { hp: 10, shieldClass: 3 });
    applyDamage(target, 5, makeWeapon());
    expect(target.hp).toBe(8); // 10 - 2 = 8
  });

  it('shields absorb all damage when damage <= shieldClass', () => {
    const target = makeShip('d', 'defender', { hp: 10, shieldClass: 5 });
    applyDamage(target, 3, makeWeapon());
    expect(target.hp).toBe(10); // no hull damage
  });

  it('armor_piercing halves shield class (floor) before absorbing', () => {
    // shieldClass=5 → effectiveShield=2; 6 damage → 4 reaches HP
    const target = makeShip('d', 'defender', { hp: 10, shieldClass: 5 });
    const armorPiercing = makeWeapon({ armorPiercing: true });
    applyDamage(target, 6, armorPiercing);
    expect(target.hp).toBe(6); // 10 - 4 = 6
  });

  it('armor_piercing with odd shield class floors correctly (3 → 1)', () => {
    const target = makeShip('d', 'defender', { hp: 10, shieldClass: 3 });
    const ap = makeWeapon({ armorPiercing: true });
    applyDamage(target, 5, ap);
    // effectiveShield = floor(3/2) = 1; 5-1=4 hits hull
    expect(target.hp).toBe(6); // 10 - 4 = 6
  });

  it('HP never goes below 0', () => {
    const target = makeShip('d', 'defender', { hp: 3, shieldClass: 0 });
    applyDamage(target, 100, makeWeapon());
    expect(target.hp).toBe(0);
  });

  it('does nothing for 0 damage', () => {
    const target = makeShip('d', 'defender', { hp: 10, shieldClass: 5 });
    applyDamage(target, 0, makeWeapon());
    expect(target.hp).toBe(10);
  });
});

// ── processRound ──────────────────────────────────────────────────────────────

describe('processRound', () => {
  afterEach(() => {
    // Restore real RNG after each test
    setCombatRng(Math.random);
  });

  it('increments round counter', () => {
    const state = initiateCombat(
      makeFleet([makeShip('a1', 'attacker')]),
      makeFleet([makeShip('d1', 'defender')]),
    );
    processRound(state);
    expect(state.round).toBe(1);
  });

  it('reduces target HP when a hit lands', () => {
    // Force always-hit weapon with fixed high damage
    const ship = makeShip('a1', 'attacker', {
      weapons: [makeWeapon({ damageMin: 5, damageMax: 5, alwaysHits: true })],
    });
    const target = makeShip('d1', 'defender', { hp: 10, shieldClass: 0 });

    const state = initiateCombat(makeFleet([ship]), makeFleet([target]));
    processRound(state);

    const targetInState = state.defenderShips[0];
    expect(targetInState.hp).toBe(5);
  });

  it('adds log entries for each attack', () => {
    const ship = makeShip('a1', 'attacker', {
      weapons: [makeWeapon({ alwaysHits: true, damageMin: 1, damageMax: 1 })],
    });
    const state = initiateCombat(makeFleet([ship]), makeFleet([makeShip('d1', 'defender')]));
    processRound(state);
    expect(state.log.length).toBeGreaterThan(0);
  });

  it('removes destroyed ships from future rounds (HP <= 0 → no further attacks)', () => {
    // Attacker one-shots defender
    const ship = makeShip('a1', 'attacker', {
      hp: 10, maxHp: 10,
      weapons: [makeWeapon({ damageMin: 100, damageMax: 100, alwaysHits: true })],
    });
    const target = makeShip('d1', 'defender', { hp: 5 });

    const state = initiateCombat(makeFleet([ship]), makeFleet([target]));
    processRound(state);

    expect(state.defenderShips[0].hp).toBe(0);
    expect(state.status).toBe('attacker_wins');
  });

  it('does not process further rounds after combat ends', () => {
    const ship = makeShip('a1', 'attacker', {
      weapons: [makeWeapon({ damageMin: 100, damageMax: 100, alwaysHits: true })],
    });
    const state = initiateCombat(makeFleet([ship]), makeFleet([makeShip('d1', 'defender')]));
    processRound(state); // ends combat

    const hpAfterFirstRound = state.defenderShips[0].hp;
    processRound(state); // should be no-op

    expect(state.defenderShips[0].hp).toBe(hpAfterFirstRound);
    expect(state.round).toBe(1); // round not incremented
  });
});

// ── Victory conditions ─────────────────────────────────────────────────────────

describe('victory conditions', () => {
  afterEach(() => setCombatRng(Math.random));

  it('sets status to attacker_wins when all defenders destroyed', () => {
    const attacker = makeShip('a1', 'attacker', {
      weapons: [makeWeapon({ damageMin: 100, damageMax: 100, alwaysHits: true })],
    });
    const state = initiateCombat(
      makeFleet([attacker]),
      makeFleet([makeShip('d1', 'defender', { hp: 1 })]),
    );
    processRound(state);
    expect(state.status).toBe('attacker_wins');
  });

  it('sets status to defender_wins when all attackers destroyed', () => {
    const defender = makeShip('d1', 'defender', {
      weapons: [makeWeapon({ damageMin: 100, damageMax: 100, alwaysHits: true })],
    });
    const state = initiateCombat(
      makeFleet([makeShip('a1', 'attacker', { hp: 1 })]),
      makeFleet([defender]),
    );
    processRound(state);
    expect(state.status).toBe('defender_wins');
  });

  it('sets status to draw when both sides are destroyed simultaneously', () => {
    // Both ships kill each other in one round (need both to die in same round)
    // Attacker dies: defender has lethal weapon; defender dies: attacker has lethal weapon
    // Initiative: both speed 3, seqRng so attacker goes first.
    // After attacker fires → defender dies.  Defender already dead so doesn't fire.
    // Both destroyed? No — attacker survives.
    // To get a draw we need both to die. Force by using a sequence RNG where
    // the roll is always ≤ hitChance for both, and each does lethal damage.
    // We'll do it manually by setting up state directly.

    const state = initiateCombat(
      makeFleet([makeShip('a1', 'attacker', {
        weapons: [makeWeapon({ damageMin: 100, damageMax: 100, alwaysHits: true })],
      })]),
      makeFleet([makeShip('d1', 'defender', {
        weapons: [makeWeapon({ damageMin: 100, damageMax: 100, alwaysHits: true })],
      })]),
    );

    // Force initiative so defender acts first (kills attacker), then attacker
    // fires back. Actually we need both to die in same round.
    // Easiest: set both to 1 HP, both have lethal weapons.
    state.attackerShips[0].hp = 1;
    state.defenderShips[0].hp = 1;

    // With seqRng the first ship in initiative order fires and kills the other.
    // The other ship has hp=0 so doesn't fire. One side wins, not a draw.
    // True draw: both sides have 0 HP after round. Force by directly reducing HP.
    state.attackerShips[0].hp = 0;
    state.defenderShips[0].hp = 0;

    // processRound skips hp<=0 ships; check_victory sees both dead → draw
    processRound(state);
    expect(state.status).toBe('draw');
  });

  it('returns correct victor from autoResolveCombat', () => {
    const strong = makeShip('a1', 'attacker', {
      hp: 100, maxHp: 100,
      weapons: [makeWeapon({ damageMin: 50, damageMax: 50, alwaysHits: true })],
    });
    const weak = makeShip('d1', 'defender', {
      hp: 5, maxHp: 5,
      weapons: [makeWeapon({ damageMin: 1, damageMax: 1, alwaysHits: false })],
    });

    const result = autoResolveCombat(makeFleet([strong]), makeFleet([weak]));
    expect(result.status).toBe('attacker_wins');
    expect(result.losses.defender).toHaveLength(1);
    expect(result.losses.attacker).toHaveLength(0);
  });
});

// ── Retreat ───────────────────────────────────────────────────────────────────

describe('attemptRetreat', () => {
  afterEach(() => setCombatRng(Math.random));

  it('succeeds when rng returns a low value (roll within retreat chance)', () => {
    // Own speed=5, enemy speed=3 → retreatChance = clamp((5/3)*50+25, 0, 95) ≈ 108 → 95
    // Any roll will succeed. Use fixedRng(0.01) → roll=1 which is ≤ 95.
    setCombatRng(fixedRng(0.01));

    const state = initiateCombat(
      makeFleet([makeShip('a1', 'attacker', { speed: 5 })]),
      makeFleet([makeShip('d1', 'defender', { speed: 3 })]),
    );
    const result = attemptRetreat(state.attackerShips[0], state);
    expect(result).toBe(true);
    expect(state.attackerShips[0].retreated).toBe(true);
  });

  it('fails when rng returns a value above retreat chance', () => {
    // Own speed=1, enemy speed=8 → retreatChance = clamp((1/8)*50+25, 0, 95) ≈ 31
    // Force roll=99 (> 31) → fail.  fixedRng(0.98) → roll = floor(0.98*100)+1 = 99
    setCombatRng(fixedRng(0.98));

    const state = initiateCombat(
      makeFleet([makeShip('a1', 'attacker', { speed: 1 })]),
      makeFleet([makeShip('d1', 'defender', { speed: 8 })]),
    );
    const result = attemptRetreat(state.attackerShips[0], state);
    expect(result).toBe(false);
    expect(state.attackerShips[0].retreated).toBe(false);
  });

  it('auto-succeeds when no living enemies remain', () => {
    const state = initiateCombat(
      makeFleet([makeShip('a1', 'attacker')]),
      makeFleet([makeShip('d1', 'defender', { hp: 0 })]),
    );
    const result = attemptRetreat(state.attackerShips[0], state);
    expect(result).toBe(true);
    expect(state.attackerShips[0].retreated).toBe(true);
  });
});

// ── Multi-round scenarios ──────────────────────────────────────────────────────

describe('multi-round / autoResolveCombat', () => {
  afterEach(() => setCombatRng(Math.random));

  it('resolves combat with multiple ships on each side', () => {
    const attackers = [1, 2, 3].map((i) =>
      makeShip(`a${i}`, 'attacker', {
        hp: 20, maxHp: 20,
        weapons: [makeWeapon({ damageMin: 5, damageMax: 5, alwaysHits: true })],
      }),
    );
    const defenders = [1, 2].map((i) =>
      makeShip(`d${i}`, 'defender', {
        hp: 10, maxHp: 10,
        weapons: [makeWeapon({ damageMin: 1, damageMax: 1, alwaysHits: true })],
      }),
    );

    const result = autoResolveCombat(makeFleet(attackers), makeFleet(defenders));
    expect(result.status).toBe('attacker_wins');
    expect(result.rounds).toBeGreaterThan(0);
  });

  it('shields absorb damage consistently across rounds', () => {
    // Defender has shieldClass=3; attacker fires 4 damage/hit → only 1 reaches hull per hit
    const attacker = makeShip('a1', 'attacker', {
      weapons: [makeWeapon({ damageMin: 4, damageMax: 4, alwaysHits: true })],
    });
    const defender = makeShip('d1', 'defender', { hp: 10, maxHp: 10, shieldClass: 3 });

    const state = initiateCombat(makeFleet([attacker]), makeFleet([defender]));

    // Rounds 1-3: each round defender takes 1 hull damage (4-3=1)
    // Defender needs 10 rounds to die
    let rounds = 0;
    while (state.status === 'ongoing' && rounds < 20) {
      processRound(state);
      rounds++;
    }

    // Defender should eventually die (HP reaches 0)
    expect(state.defenderShips[0].hp).toBe(0);
    expect(state.status).toBe('attacker_wins');
    // Should take exactly 10 rounds (1 hp per round)
    expect(rounds).toBe(10);
  });

  it('combat log is populated throughout the battle', () => {
    const result = autoResolveCombat(
      makeFleet([makeShip('a1', 'attacker', { weapons: [makeWeapon({ alwaysHits: true, damageMin: 3, damageMax: 3 })] })]),
      makeFleet([makeShip('d1', 'defender')]),
    );
    expect(result.log.length).toBeGreaterThan(0);
    // All log entries have a round number
    result.log.forEach((entry) => {
      expect(entry.round).toBeGreaterThanOrEqual(1);
      expect(typeof entry.message).toBe('string');
    });
  });
});
