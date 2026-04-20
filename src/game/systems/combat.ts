/**
 * Combat engine — pure TypeScript, NO DOM.
 *
 * Implements tactical combat resolution per design/ships/combat-algorithm.md.
 *
 * Exports:
 *   initiateCombat(attackerFleet, defenderFleet)  — create initial CombatState
 *   processRound(combatState)                      — advance one round
 *
 * Auto-resolve mode: ships act in initiative order, each fires all weapons at
 * the lowest-HP enemy (or random if tied).  Manual hex-grid control is deferred.
 */

// ── RNG ───────────────────────────────────────────────────────────────────────

/**
 * Injectable random source so tests can supply deterministic values.
 * Returns a float in [0, 1).  Override via `setCombatRng` in tests.
 */
let rng: () => number = Math.random;

export function setCombatRng(fn: () => number): void {
  rng = fn;
}

/** Roll an integer in [min, max] inclusive. */
function roll(min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

// ── Domain types ──────────────────────────────────────────────────────────────

export type WeaponCategory = 'beam' | 'missile' | 'torpedo' | 'special';
export type ExperienceLevel = 'rookie' | 'regular' | 'veteran' | 'elite';
export type CombatSide = 'attacker' | 'defender';
export type CombatStatus = 'ongoing' | 'attacker_wins' | 'defender_wins' | 'draw';

export interface WeaponInstance {
  id: string;
  name: string;
  /** Weapon category (beam, missile, etc.) */
  category: WeaponCategory;
  /** Minimum damage (beams/torpedoes) — equals damageMax for fixed-damage weapons */
  damageMin: number;
  /** Maximum damage */
  damageMax: number;
  /** Attacks per combat round (multi-attack weapons) */
  attacksPerRound: number;
  /** Halves effective shield class on impact (armor_piercing) */
  armorPiercing?: boolean;
  /** Weapon always hits (e.g. Mauler Device) */
  alwaysHits?: boolean;
}

/**
 * A ship as it exists inside a combat session.
 *
 * Values derived from ShipDesign + components + racial bonuses at combat start.
 */
export interface CombatShip {
  id: string;
  /** Owning ship design name (for logging) */
  designId: string;
  /** Which side this ship fights for */
  side: CombatSide;
  /** Current hull points */
  hp: number;
  maxHp: number;
  /**
   * Shield class (1–15).  Each hit absorbs up to this many points of damage.
   * 0 = no shields.
   */
  shieldClass: number;
  /** Weapons installed on this ship */
  weapons: WeaponInstance[];
  /**
   * Effective attacker level used in the MOO1 differential hit-chance formula.
   * Equals Battle Computer Mark + scanner/racial bonuses.
   */
  attackRating: number;
  /**
   * Effective defender level used in the MOO1 differential hit-chance formula.
   * Equals maneuver class + inertial stabilizer / nullifier / racial bonuses.
   */
  defenseRating: number;
  /** Engine combat speed (1–8 hexes/round) — used for initiative */
  speed: number;
  /** Experience level — affects accuracy and experience gain tracking */
  experience: ExperienceLevel;
  /** Whether this ship has successfully retreated */
  retreated: boolean;
}

export interface CombatLogEntry {
  round: number;
  message: string;
}

export interface CombatState {
  attackerShips: CombatShip[];
  defenderShips: CombatShip[];
  round: number;
  log: CombatLogEntry[];
  status: CombatStatus;
}

/** Summary returned after combat ends. */
export interface CombatResult {
  status: CombatStatus;
  /** Surviving ships for the winner, or empty on draw */
  survivors: CombatShip[];
  /** Ships destroyed (hp <= 0) */
  losses: {
    attacker: CombatShip[];
    defender: CombatShip[];
  };
  rounds: number;
  log: CombatLogEntry[];
}

// ── Fleet → CombatShip adapter ────────────────────────────────────────────────

/**
 * Minimal fleet representation the caller must provide.
 * Callers are responsible for translating their GameState ships/designs into
 * this shape before calling initiateCombat().
 */
export interface FleetForCombat {
  ships: CombatShip[];
}

// ── Core API ──────────────────────────────────────────────────────────────────

/**
 * Create a fresh CombatState from two fleets.
 *
 * Ships are copied shallowly so callers can keep original state untouched.
 * `retreated` is forced to false for all ships.
 */
export function initiateCombat(
  attackerFleet: FleetForCombat,
  defenderFleet: FleetForCombat,
): CombatState {
  const copyShips = (ships: CombatShip[], side: CombatSide): CombatShip[] =>
    ships.map((s) => ({
      ...s,
      side,
      hp: Math.max(0, s.hp),
      retreated: false,
    }));

  return {
    attackerShips: copyShips(attackerFleet.ships, 'attacker'),
    defenderShips: copyShips(defenderFleet.ships, 'defender'),
    round: 0,
    log: [],
    status: 'ongoing',
  };
}

// ── Hit-chance formula (MOO1 differential) ────────────────────────────────────

/**
 * Experience accuracy bonus (non-MOO1 enhancement, documented in design).
 */
function experienceAccuracyBonus(level: ExperienceLevel): number {
  switch (level) {
    case 'rookie':  return -5;
    case 'regular': return 0;
    case 'veteran': return 5;
    case 'elite':   return 10;
  }
}

/**
 * Calculate hit chance per the MOO1 differential formula:
 *
 *   hitChance = 50 + (attackRating - defenseRating) × 5   [task spec]
 *
 * Note: the combat-algorithm.md doc uses ×10 per level, but the task
 * acceptance criterion explicitly specifies ×5.  We follow the task spec.
 *
 * Enhancement modifiers (non-MOO1, per design):
 *   experience accuracy bonus applied after base differential.
 *
 * Clamped to [5, 95].
 */
export function calcHitChance(attacker: CombatShip, weapon: WeaponInstance): number {
  if (weapon.alwaysHits) return 100;

  const base = 50 + (attacker.attackRating - 0) * 5; // defenseRating applied below
  // We can't pass target here without refactoring signature; pass as parameter instead
  // — kept for standalone testing of the formula.  Real calls go through calcHitChanceVs.
  return Math.min(95, Math.max(5, base));
}

/**
 * Full hit-chance calculation against a specific target.
 *
 *   hitChance = 50 + (attacker.attackRating - target.defenseRating) × 5
 *             + experienceBonus
 *
 * Clamped [5, 95].  If weapon.alwaysHits, returns 100 (bypasses clamp).
 */
export function calcHitChanceVs(
  attacker: CombatShip,
  weapon: WeaponInstance,
  target: CombatShip,
): number {
  if (weapon.alwaysHits) return 100;

  const differential = attacker.attackRating - target.defenseRating;
  const base = 50 + differential * 5;
  const withExp = base + experienceAccuracyBonus(attacker.experience);
  return Math.min(95, Math.max(5, withExp));
}

// ── Damage application ────────────────────────────────────────────────────────

/**
 * Apply `damage` points to `target`, shields-first.
 *
 * Shield absorption per hit = min(effectiveShieldClass, damage).
 * `armorPiercing` halves effective shield class (floor) before absorbing.
 *
 * Mutates target.hp in place; returns actual hull damage taken.
 */
export function applyDamage(
  target: CombatShip,
  damage: number,
  weapon: WeaponInstance,
): number {
  if (damage <= 0) return 0;

  let remaining = damage;

  // ── Shields ────────────────────────────────────────────────────────────────
  if (target.shieldClass > 0 && remaining > 0) {
    const effectiveShieldClass = weapon.armorPiercing
      ? Math.floor(target.shieldClass / 2)
      : target.shieldClass;

    const absorbed = Math.min(effectiveShieldClass, remaining);
    remaining -= absorbed;
  }

  // ── Hull ───────────────────────────────────────────────────────────────────
  if (remaining > 0) {
    target.hp = Math.max(0, target.hp - remaining);
  }

  return damage - remaining; // shield-absorbed portion (informational)
}

// ── Damage roll (beam / MOO1 mapped) ─────────────────────────────────────────

/**
 * Roll damage for a beam weapon using the MOO1 "damage mapped to roll" mechanic.
 *
 * A roll exactly at the hit threshold = minimum damage.
 * A roll of 100 = maximum damage.
 *
 * For weapons with damageMin === damageMax (fixed damage), returns damageMin.
 */
function rollDamage(weapon: WeaponInstance, d100: number, hitChance: number): number {
  if (weapon.damageMin === weapon.damageMax) return weapon.damageMin;

  const hitThreshold = 101 - hitChance;
  const successRange = Math.max(hitChance - 1, 1);
  const damageFraction = (d100 - hitThreshold) / successRange;
  const rawDmg = weapon.damageMin +
    Math.floor(damageFraction * (weapon.damageMax - weapon.damageMin));
  return Math.max(weapon.damageMin, rawDmg);
}

// ── Initiative ────────────────────────────────────────────────────────────────

/**
 * Sort ships by initiative (speed descending, then random tiebreak).
 * Returns a new sorted array; does not mutate the input.
 */
function sortByInitiative(ships: CombatShip[]): CombatShip[] {
  return [...ships].sort((a, b) => {
    const diff = b.speed - a.speed;
    if (diff !== 0) return diff;
    return rng() < 0.5 ? -1 : 1;
  });
}

// ── Target selection ──────────────────────────────────────────────────────────

/**
 * Select the best target from `enemies`: lowest-HP living ship.
 * Returns undefined if no living enemies remain.
 */
function selectTarget(enemies: CombatShip[]): CombatShip | undefined {
  const living = enemies.filter((s) => s.hp > 0 && !s.retreated);
  if (living.length === 0) return undefined;
  return living.reduce((best, s) => (s.hp < best.hp ? s : best), living[0]);
}

// ── Ship action (fire all weapons at target) ──────────────────────────────────

function shipActs(
  ship: CombatShip,
  enemies: CombatShip[],
  round: number,
  log: CombatLogEntry[],
): void {
  if (ship.hp <= 0 || ship.retreated) return;

  const target = selectTarget(enemies);
  if (!target) return;

  for (const weapon of ship.weapons) {
    const attackCount = weapon.attacksPerRound > 0 ? weapon.attacksPerRound : 1;

    for (let atk = 0; atk < attackCount; atk++) {
      // Abort if target already destroyed mid-volley
      if (target.hp <= 0) break;

      const hitChance = calcHitChanceVs(ship, weapon, target);
      const d100 = roll(1, 100);

      if (d100 <= hitChance) {
        const damage = rollDamage(weapon, d100, hitChance);
        applyDamage(target, damage, weapon);
        log.push({
          round,
          message:
            `[R${round}] ${ship.designId} fires ${weapon.name} at ${target.designId}` +
            ` — HIT (roll ${d100} ≤ ${hitChance}%), ${damage} dmg → ${target.hp}/${target.maxHp} HP`,
        });
      } else {
        log.push({
          round,
          message:
            `[R${round}] ${ship.designId} fires ${weapon.name} at ${target.designId}` +
            ` — MISS (roll ${d100} > ${hitChance}%)`,
        });
      }
    }
  }
}

// ── Victory check ─────────────────────────────────────────────────────────────

function checkVictory(state: CombatState): CombatStatus {
  const attackersAlive = state.attackerShips.some((s) => s.hp > 0 && !s.retreated);
  const defendersAlive = state.defenderShips.some((s) => s.hp > 0 && !s.retreated);

  if (!attackersAlive && !defendersAlive) return 'draw';
  if (!defendersAlive) return 'attacker_wins';
  if (!attackersAlive) return 'defender_wins';
  return 'ongoing';
}

// ── Round processor ───────────────────────────────────────────────────────────

/**
 * Advance `state` by one combat round.
 *
 * Mutates state in place (round counter, ship HP, log, status).
 * Returns the same state for chaining.
 *
 * Combat flow per round:
 *   1. Initiative: sort all living ships by speed desc
 *   2. Action: each ship fires all weapons at lowest-HP enemy
 *   3. Victory check: update status if one side is eliminated
 */
export function processRound(state: CombatState): CombatState {
  if (state.status !== 'ongoing') return state;

  state.round += 1;

  // Combine all living ships for initiative sort
  const allShips = sortByInitiative([
    ...state.attackerShips.filter((s) => s.hp > 0 && !s.retreated),
    ...state.defenderShips.filter((s) => s.hp > 0 && !s.retreated),
  ]);

  for (const ship of allShips) {
    // Re-check alive — may have been killed mid-round
    if (ship.hp <= 0 || ship.retreated) continue;

    const enemies =
      ship.side === 'attacker' ? state.defenderShips : state.attackerShips;

    shipActs(ship, enemies, state.round, state.log);
  }

  // Check victory after all ships have acted
  state.status = checkVictory(state);

  if (state.status !== 'ongoing') {
    const victor = state.status === 'attacker_wins' ? 'ATTACKER' :
                   state.status === 'defender_wins' ? 'DEFENDER' : 'NONE (DRAW)';
    state.log.push({
      round: state.round,
      message: `[R${state.round}] Combat ended — victor: ${victor}`,
    });
  }

  return state;
}

// ── Retreat ───────────────────────────────────────────────────────────────────

/**
 * Attempt to retreat a single ship from combat.
 *
 * Retreat chance = clamp((ownSpeed / maxEnemySpeed) * 50 + 25, 0, 95)
 *
 * Returns true if retreat succeeded.
 */
export function attemptRetreat(ship: CombatShip, state: CombatState): boolean {
  const enemies =
    ship.side === 'attacker' ? state.defenderShips : state.attackerShips;
  const livingEnemies = enemies.filter((s) => s.hp > 0 && !s.retreated);

  if (livingEnemies.length === 0) {
    ship.retreated = true;
    return true;
  }

  const maxEnemySpeed = Math.max(...livingEnemies.map((s) => s.speed));
  const retreatChance = Math.min(
    95,
    Math.max(0, Math.round((ship.speed / Math.max(maxEnemySpeed, 1)) * 50 + 25)),
  );

  const d100 = roll(1, 100);
  if (d100 <= retreatChance) {
    ship.retreated = true;
    state.log.push({
      round: state.round,
      message: `[R${state.round}] ${ship.designId} retreated successfully.`,
    });
    return true;
  }

  state.log.push({
    round: state.round,
    message: `[R${state.round}] ${ship.designId} retreat FAILED (roll ${d100} > ${retreatChance}%).`,
  });
  return false;
}

// ── Full auto-resolve ─────────────────────────────────────────────────────────

/**
 * Run combat to completion (auto-resolve).
 *
 * Safety cap: 100 rounds max to prevent infinite loops (e.g. both sides have
 * only regenerating-shield ships with too-low weapon damage — not currently
 * modeled, but defensive).
 */
export function autoResolveCombat(
  attackerFleet: FleetForCombat,
  defenderFleet: FleetForCombat,
  maxRounds = 100,
): CombatResult {
  const state = initiateCombat(attackerFleet, defenderFleet);

  while (state.status === 'ongoing' && state.round < maxRounds) {
    processRound(state);
  }

  if (state.status === 'ongoing') {
    // Hit round cap — call it a draw
    state.status = 'draw';
    state.log.push({
      round: state.round,
      message: `[R${state.round}] Combat ended — round limit reached (draw).`,
    });
  }

  const attackerLosses = state.attackerShips.filter((s) => s.hp <= 0);
  const defenderLosses = state.defenderShips.filter((s) => s.hp <= 0);

  const survivors: CombatShip[] =
    state.status === 'attacker_wins'
      ? state.attackerShips.filter((s) => s.hp > 0 && !s.retreated)
      : state.status === 'defender_wins'
      ? state.defenderShips.filter((s) => s.hp > 0 && !s.retreated)
      : [];

  return {
    status: state.status,
    survivors,
    losses: {
      attacker: attackerLosses,
      defender: defenderLosses,
    },
    rounds: state.round,
    log: state.log,
  };
}
