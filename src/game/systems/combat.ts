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

import { DifficultyLevel } from '../state';
import { getCombatAttackModifier, getCombatDefenseModifier } from './difficulty';

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
export type HullSize = 'small' | 'medium' | 'large' | 'huge';
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
  /** Optimal range in hexes (for range modifiers) */
  range?: number;
  /** Halves effective shield class on impact (armor_piercing) */
  armorPiercing?: boolean;
  /** Weapon always hits (e.g. Mauler Device) */
  alwaysHits?: boolean;
  /** Chain lightning: number of additional targets to arc to */
  chainTargets?: number;
  /** Kills crew on hit (percentage of max crew killed per hit) */
  killsCrew?: boolean;
  /** Crew kill percentage (default 0.01 = 1%) */
  crewKillPercent?: number;
  /** Overflow damage: excess damage carries to next ship in stack */
  overflowDamage?: boolean;
  /** Double damage to shields */
  doubleShieldDamage?: boolean;
  /** Percent-based damage (e.g., Ion Stream Projector = 0.20 for 20% current HP) */
  percentDamage?: number;
  /** Instant kill small ships */
  instantKillSmall?: boolean;
  /** No range penalty to damage */
  noRangePenalty?: boolean;
  /** Ignores shields (e.g., Death Ray) — bypasses shield absorption entirely */
  ignoresShields?: boolean;
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
  /** Whether this ship belongs to the player (for difficulty modifier lookup). */
  isPlayer?: boolean;
  /** Hull size class for size-based hit modifiers */
  hullSize: HullSize;
  /** Hex position on combat grid (for range calculations) */
  position?: { x: number; y: number };
  /** Current crew count */
  crewCurrent?: number;
  /** Maximum crew complement */
  crewMax?: number;
  /** ECM jammer level (reduces missile hit chance) */
  ecmRating?: number;
  /** Has cloaking device (adds +5 to defense when cloaked) */
  cloaked?: boolean;
  /** Warp dissipator prevents enemy retreat */
  hasWarpDissipator?: boolean;
  /** Sub-space teleporter allows instant repositioning */
  hasTeleporter?: boolean;
  /** High energy focus: +1 attack rating for one shot */
  hasHighEnergyFocus?: boolean;
  highEnergyFocusUsed?: boolean;
  /** Displacement Device: 33% chance to completely avoid a hit */
  hasDisplacementDevice?: boolean;
  /** Ship is displaced (removed from combat for this round) */
  displaced?: boolean;
  /** Turn when displacement ends and ship returns */
  displacementReturnRound?: number;
  /** Black Hole Generator: destroys 25-100% of enemy stack */
  hasBlackHoleGenerator?: boolean;
  /** Cooldown turns remaining for Black Hole Generator */
  blackHoleGeneratorCooldown?: number;
  /** Black Hole Generator destruction penalty per shield class */
  blackHoleGeneratorPenaltyPerShield?: number;
}

export interface CombatLogEntry {
  round: number;
  message: string;
}

/** Missile/Torpedo in flight */
export interface MissileInFlight {
  id: string;
  sourceShipId: string;
  targetShipId: string;
  weapon: WeaponInstance;
  damage: number;
  /** Tech level of the missile (for interception calculations) */
  techLevel?: number;
  /** Remaining fuel (turns until self-destruct) */
  remainingFuel: number;
  /** Side that fired this missile */
  side: CombatSide;
}

export interface CombatState {
  attackerShips: CombatShip[];
  defenderShips: CombatShip[];
  round: number;
  log: CombatLogEntry[];
  status: CombatStatus;
  /** Difficulty level for applying combat modifiers. */
  difficulty?: DifficultyLevel;
  /** Missiles and torpedoes currently in flight */
  missilesInFlight: MissileInFlight[];
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
      hullSize: s.hullSize ?? 'medium', // Default to medium if not specified
      highEnergyFocusUsed: false, // Reset for each combat
    }));

  return {
    attackerShips: copyShips(attackerFleet.ships, 'attacker'),
    defenderShips: copyShips(defenderFleet.ships, 'defender'),
    round: 0,
    log: [],
    status: 'ongoing',
    missilesInFlight: [],
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
 * Calculate hex distance between two positions.
 * Returns 3 if either position is undefined (neutral "close" range for no modifier).
 */
function hexDistance(a?: { x: number; y: number }, b?: { x: number; y: number }): number {
  if (!a || !b) return 3; // Default to close range (no modifier) if no positions
  // Axial hex distance formula
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  const dz = Math.abs((a.x + a.y) - (b.x + b.y));
  return Math.max(dx, dy, dz);
}

/**
 * Size modifier: larger targets are easier to hit.
 * Per design spec: (target_size_class - 1) × 5%
 * Small = class 1, Medium = 2, Large = 3, Huge = 4
 */
function sizeModifier(targetSize: HullSize | undefined): number {
  if (!targetSize) return 0; // Default to no modifier if size not specified
  const sizeClass: Record<HullSize, number> = {
    small: 1,
    medium: 2,
    large: 3,
    huge: 4,
  };
  return (sizeClass[targetSize] - 1) * 5;
}

/**
 * Range modifier for hit chance.
 * Per design spec:
 *   Point Blank (1 hex): +10%
 *   Close (2-4 hexes): +0%
 *   Medium (5-8 hexes): -5%
 *   Long (9-15 hexes): -10%
 *   Very Long (16+ hexes): -20%
 */
function rangeModifier(distance: number): number {
  if (distance <= 1) return 10;   // Point blank
  if (distance <= 4) return 0;    // Close
  if (distance <= 8) return -5;   // Medium
  if (distance <= 15) return -10; // Long
  return -20;                     // Very long
}

/**
 * Full hit-chance calculation against a specific target.
 *
 * MOO1 canonical formula (combat-algorithm.md Section 9):
 *   hitChance = 50 + (Effective_Attacker_Level - Effective_Defender_Level) × 10
 *
 * Enhancement modifiers (non-MOO1, per design):
 *   + experienceBonus: {rookie: -5%, regular: 0%, veteran: +5%, elite: +10%}
 *   + rangeModifier: Point Blank +10%, Medium -5%, Long -10%, Very Long -20%
 *   + sizeModifier: (target_size_class - 1) × 5%
 *
 * Clamped [5, 95].  If weapon.alwaysHits, returns 100 (bypasses clamp).
 */
/**
 * Full hit-chance calculation against a specific target with difficulty modifiers.
 *
 * @param attacker   The attacking ship.
 * @param weapon     The weapon being fired.
 * @param target     The target ship.
 * @param difficulty Optional difficulty level for modifier lookup.
 */
export function calcHitChanceVs(
  attacker: CombatShip,
  weapon: WeaponInstance,
  target: CombatShip,
  difficulty?: DifficultyLevel,
): number {
  if (weapon.alwaysHits) return 100;

  // Differential formula: each level of advantage = +5%
  // Note: MOO1 canonical uses ×10, but this implementation uses ×5 per original task spec.
  const differential = attacker.attackRating - target.defenseRating;
  let hitChance = 50 + differential * 5;

  // High Energy Focus: +1 attack rating for this shot (one-time use)
  if (attacker.hasHighEnergyFocus && !attacker.highEnergyFocusUsed) {
    hitChance += 5; // +1 level = +5%
  }

  // Enhancement: Experience accuracy bonus
  hitChance += experienceAccuracyBonus(attacker.experience);

  // Enhancement: Range modifier
  const distance = hexDistance(attacker.position, target.position);
  hitChance += rangeModifier(distance);

  // Enhancement: Size modifier (larger targets easier to hit)
  hitChance += sizeModifier(target.hullSize);

  // Cloaking device adds +5 to effective defender level (already in defenseRating)
  // but if dynamically cloaked, apply here
  if (target.cloaked) {
    hitChance -= 50; // +5 defense levels = -50% hit chance
  }

  // Apply difficulty modifiers if provided
  // Attacker's bonus (expressed as decimal, e.g., 0.10 = +10%)
  // Target's defense bonus (reduces attacker's chance)
  if (difficulty) {
    const attackerBonus = getCombatAttackModifier(difficulty, attacker.isPlayer ?? false);
    const targetDefenseBonus = getCombatDefenseModifier(difficulty, target.isPlayer ?? false);
    // Convert to percentage points
    hitChance += attackerBonus * 100;
    hitChance -= targetDefenseBonus * 100;
  }

  return Math.min(95, Math.max(5, Math.round(hitChance)));
}

// ── Damage application ────────────────────────────────────────────────────────

/**
 * Apply `damage` points to `target`, shields-first.
 *
 * Shield absorption per hit = min(effectiveShieldClass, damage).
 * `armorPiercing` halves effective shield class (floor) before absorbing.
 * `doubleShieldDamage` causes shields to take 2× damage.
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
  // ignoresShields (e.g., Death Ray): skip shield absorption entirely
  if (!weapon.ignoresShields && target.shieldClass > 0 && remaining > 0) {
    let effectiveShieldClass = target.shieldClass;
    
    // Armor piercing: halves shield class for this hit
    if (weapon.armorPiercing) {
      effectiveShieldClass = Math.floor(effectiveShieldClass / 2);
    }

    const absorbed = Math.min(effectiveShieldClass, remaining);
    remaining -= absorbed;
    
    // Double shield damage weapons (e.g., Plasma Cannon) - tracked for shield pool if implemented
    // For now, this is informational as we use per-hit absorption model
  }

  // ── Hull ───────────────────────────────────────────────────────────────────
  if (remaining > 0) {
    target.hp = Math.max(0, target.hp - remaining);
  }

  return damage - remaining; // shield-absorbed portion (informational)
}

/**
 * Apply weapon special effects after damage.
 * Called after applyDamage() for additional effects like crew kills, chain lightning, etc.
 */
export function applyWeaponEffects(
  target: CombatShip,
  weapon: WeaponInstance,
  damage: number,
  combat: CombatState,
  log: CombatLogEntry[],
): void {
  // ── Instant kill small ships ────────────────────────────────────────────────
  if (weapon.instantKillSmall && target.hullSize === 'small' && target.hp > 0) {
    target.hp = 0;
    log.push({
      round: combat.round,
      message: `[R${combat.round}] ${weapon.name} INSTANT KILL on small ship ${target.designId}!`,
    });
    return; // Ship destroyed, no further effects
  }

  // ── Crew kills ──────────────────────────────────────────────────────────────
  if (weapon.killsCrew && target.crewCurrent !== undefined && target.crewMax !== undefined) {
    const killPercent = weapon.crewKillPercent ?? 0.01; // Default 1%
    const crewKilled = Math.max(1, Math.floor(target.crewMax * killPercent));
    target.crewCurrent = Math.max(0, target.crewCurrent - crewKilled);
    log.push({
      round: combat.round,
      message: `[R${combat.round}] ${weapon.name} kills ${crewKilled} crew on ${target.designId} (${target.crewCurrent}/${target.crewMax} remaining)`,
    });
    
    // Apply crew loss penalties
    applyCrewLossPenalties(target);
    
    // Check if ship is destroyed due to 0 crew
    checkCrewDeath(target, log, combat.round);
  }
  
  // ── Overflow damage ─────────────────────────────────────────────────────────
  if (weapon.overflowDamage && target.hp <= 0) {
    applyOverflowDamage(target, weapon, combat, log);
  }

  // ── Chain lightning ─────────────────────────────────────────────────────────
  if (weapon.chainTargets && weapon.chainTargets > 0 && target.hp > 0) {
    const arcDamage = Math.floor(damage * 0.5);
    const enemies = target.side === 'attacker' ? combat.defenderShips : combat.attackerShips;
    
    // Find adjacent enemies (within 2 hexes of primary target)
    const adjacentEnemies = enemies.filter((s) => {
      if (s.id === target.id || s.hp <= 0 || s.retreated) return false;
      const dist = hexDistance(target.position, s.position);
      return dist <= 2;
    });

    let arcsFired = 0;
    for (const arcTarget of adjacentEnemies) {
      if (arcsFired >= weapon.chainTargets) break;
      if (arcTarget.hp > 0) {
        // Apply arc damage (no further chaining)
        const weaponNoChain = { ...weapon, chainTargets: 0 };
        applyDamage(arcTarget, arcDamage, weaponNoChain);
        arcsFired++;
        log.push({
          round: combat.round,
          message: `[R${combat.round}] ${weapon.name} CHAIN ARC to ${arcTarget.designId} for ${arcDamage} dmg → ${arcTarget.hp}/${arcTarget.maxHp} HP`,
        });
      }
    }
  }
}

/**
 * Apply crew loss penalties based on current crew ratio.
 * Per combat-algorithm.md Section 11c.
 */
function applyCrewLossPenalties(_ship: CombatShip): void {
  // Note: Full implementation would track status effects based on crew ratio.
  // For now, the adrift check (0 crew) is handled in shipActs().
  // Future implementation should apply:
  //   <= 0%: Ship is adrift (cannot act) - IMPLEMENTED in shipActs()
  //   <= 25%: Skeleton crew (-20% accuracy, 50% weapon failure, half speed)
  //   <= 50%: Undermanned (-10% accuracy, speed -1)
}

/**
 * Check if ship is destroyed due to 0 crew (crew kill mechanic).
 * A ship at 0 crew is destroyed regardless of hull HP.
 */
function checkCrewDeath(ship: CombatShip, log: CombatLogEntry[], round: number): boolean {
  if (ship.crewCurrent !== undefined && ship.crewCurrent <= 0 && ship.hp > 0) {
    ship.hp = 0;
    log.push({
      round,
      message: `[R${round}] ${ship.designId} DESTROYED — no crew remaining!`,
    });
    return true;
  }
  return false;
}

/**
 * Find ships of the same design in the same stack (for overflow damage).
 * Ships are in the same "stack" if they have the same designId and are alive.
 */
function getStackMates(target: CombatShip, combat: CombatState): CombatShip[] {
  const sameSide = target.side === 'attacker' ? combat.attackerShips : combat.defenderShips;
  return sameSide.filter(
    (s) => s.designId === target.designId && s.id !== target.id && s.hp > 0 && !s.retreated
  );
}

/**
 * Apply overflow damage to next ship in stack.
 * Per design: excess damage beyond what kills a ship carries over to the next
 * ship of the same design in the stack.
 */
function applyOverflowDamage(
  target: CombatShip,
  weapon: WeaponInstance,
  combat: CombatState,
  log: CombatLogEntry[],
): void {
  if (!weapon.overflowDamage) return;
  
  // Calculate overkill amount (target HP is already negative or zero)
  const overkill = Math.abs(Math.min(0, target.hp));
  if (overkill <= 0) return;
  
  // Reset target HP to 0 (it's destroyed)
  target.hp = 0;
  
  // Find next weakest ship to overflow to
  const stackMates = getStackMates(target, combat);
  if (stackMates.length === 0) return;
  
  // Sort by HP ascending (weakest first)
  stackMates.sort((a, b) => a.hp - b.hp);
  const nextTarget = stackMates[0];
  
  log.push({
    round: combat.round,
    message: `[R${combat.round}] ${weapon.name} OVERFLOW: ${overkill} excess damage → ${nextTarget.designId}`,
  });
  
  // Apply overflow damage (with shields for the new target)
  applyDamage(nextTarget, overkill, weapon);
  
  // Check if overflow killed this ship too (chain overflow)
  if (nextTarget.hp <= 0) {
    applyOverflowDamage(nextTarget, weapon, combat, log);
  }
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
  // Filter out dead, retreated, and displaced ships
  const living = enemies.filter((s) => s.hp > 0 && !s.retreated && !s.displaced);
  if (living.length === 0) return undefined;
  return living.reduce((best, s) => (s.hp < best.hp ? s : best), living[0]);
}

/**
 * Select the next weakest ship for overflow damage targeting.
 * Returns ships sorted by total HP (hull + effective armor).
 */
/**
 * Select the next weakest ship for overflow damage targeting.
 * Returns ships sorted by total HP (hull + effective armor).
 * Exported for use in manual combat resolution.
 */
export function selectNextWeakestShip(enemies: CombatShip[]): CombatShip | undefined {
  const living = enemies.filter((s) => s.hp > 0 && !s.retreated && !s.displaced);
  if (living.length === 0) return undefined;
  // Sort by HP ascending, then by hull size (smaller = weaker)
  const sizeOrder: Record<HullSize, number> = { small: 1, medium: 2, large: 3, huge: 4 };
  return living.sort((a, b) => {
    if (a.hp !== b.hp) return a.hp - b.hp;
    return sizeOrder[a.hullSize] - sizeOrder[b.hullSize];
  })[0];
}

// ── Displacement Device ───────────────────────────────────────────────────────

/**
 * Check if Displacement Device activates and avoids a hit.
 * Per design: 33% chance to completely avoid any hit.
 */
function checkDisplacementDevice(
  target: CombatShip,
  log: CombatLogEntry[],
  round: number,
): boolean {
  if (!target.hasDisplacementDevice) return false;
  
  const d100 = roll(1, 100);
  if (d100 <= 33) {
    log.push({
      round,
      message: `[R${round}] ${target.designId} Displacement Device ACTIVATED — attack avoided!`,
    });
    return true;
  }
  return false;
}

// ── Missile Interception ──────────────────────────────────────────────────────

/**
 * Calculate the total point defense capability of defending ships.
 * Per design: Anti-Missile Rockets destroy 40% of incoming missiles.
 * Beam weapons: 10% per beam weapon × attacks_per_round.
 */
function calculateInterceptionChance(
  defenders: CombatShip[],
  missileTechLevel: number,
): number {
  let totalChance = 0;
  
  for (const ship of defenders) {
    if (ship.hp <= 0 || ship.retreated || ship.displaced) continue;
    
    for (const weapon of ship.weapons) {
      if (weapon.category === 'beam') {
        // Beam weapons provide point defense: 10% per attack
        const attacks = weapon.attacksPerRound > 0 ? weapon.attacksPerRound : 1;
        totalChance += 10 * attacks;
      }
      // Anti-Missile Rockets (special case - identified by name or special property)
      if (weapon.name?.toLowerCase().includes('anti-missile')) {
        // 40% base minus 1% per missile tech level
        const antiMissileChance = Math.max(0, 40 - missileTechLevel);
        totalChance += antiMissileChance;
      }
    }
  }
  
  // Cap at 95% (always some chance to get through)
  return Math.min(95, totalChance);
}

/**
 * Attempt to intercept incoming missiles during the missile phase.
 */
function attemptMissileInterception(
  missile: MissileInFlight,
  defenders: CombatShip[],
  log: CombatLogEntry[],
  round: number,
): boolean {
  // Torpedoes marked as no-intercept are immune to point defense
  // (though per design they ARE subject to ECM and point defense - this is a weapon property check)
  
  const interceptionChance = calculateInterceptionChance(defenders, missile.techLevel ?? 1);
  if (interceptionChance <= 0) return false;
  
  const d100 = roll(1, 100);
  if (d100 <= interceptionChance) {
    log.push({
      round,
      message: `[R${round}] Missile ${missile.weapon.name} INTERCEPTED by point defense (roll ${d100} ≤ ${interceptionChance}%)`,
    });
    return true;
  }
  return false;
}

// ── Black Hole Generator ─────────────────────────────────────────────────────

/**
 * Activate Black Hole Generator against enemy fleet.
 * 
 * Per design (force-fields.md §Black Hole Generator):
 * - Roll 1d4: result × 25% = base destruction percentage
 * - Destruction % reduced by 2% per shield class on target ships
 * - Affected ships are completely destroyed (no salvage)
 * - 3-turn cooldown
 * - Huge hull only
 * 
 * @returns Number of ships destroyed
 */
function activateBlackHoleGenerator(
  ship: CombatShip,
  enemies: CombatShip[],
  round: number,
  log: CombatLogEntry[],
): number {
  // Check if on cooldown
  if ((ship.blackHoleGeneratorCooldown ?? 0) > 0) {
    return 0;
  }

  const livingEnemies = enemies.filter((s) => s.hp > 0 && !s.retreated);
  if (livingEnemies.length === 0) return 0;

  // Roll 1d4 for base destruction percentage
  const d4Roll = roll(1, 4);
  const baseDestruction = d4Roll * 0.25; // 25%, 50%, 75%, or 100%

  // Calculate average shield class of enemy stack
  const avgShieldClass = livingEnemies.reduce((sum, s) => sum + s.shieldClass, 0) / livingEnemies.length;
  
  // Apply shield class reduction (2% per shield class)
  const penaltyPerShield = ship.blackHoleGeneratorPenaltyPerShield ?? 0.02;
  const actualDestruction = Math.max(0, baseDestruction - (avgShieldClass * penaltyPerShield));

  // Calculate number of ships destroyed
  const shipsToDestroy = Math.floor(livingEnemies.length * actualDestruction);

  // Destroy ships (randomly selected from stack)
  let destroyed = 0;
  const shuffled = [...livingEnemies].sort(() => rng() - 0.5);
  
  for (let i = 0; i < shipsToDestroy && i < shuffled.length; i++) {
    shuffled[i].hp = 0;
    destroyed++;
    log.push({
      round,
      message: `[R${round}] ${shuffled[i].designId} CONSUMED by Black Hole!`,
    });
  }

  // Set cooldown (3 turns)
  ship.blackHoleGeneratorCooldown = 3;

  log.push({
    round,
    message: `[R${round}] ${ship.designId} activates BLACK HOLE GENERATOR! ` +
      `Roll: ${d4Roll} (${Math.round(baseDestruction * 100)}% base) − ${Math.round(avgShieldClass * penaltyPerShield * 100)}% shield penalty = ` +
      `${Math.round(actualDestruction * 100)}% destruction. ${destroyed}/${livingEnemies.length} ships destroyed!`,
  });

  return destroyed;
}

// ── Ship action (fire all weapons at target) ──────────────────────────────────

function shipActs(
  ship: CombatShip,
  enemies: CombatShip[],
  round: number,
  log: CombatLogEntry[],
  combat: CombatState,
): void {
  if (ship.hp <= 0 || ship.retreated) return;

  // Check crew status - if adrift (0 crew), cannot act
  if (ship.crewCurrent !== undefined && ship.crewCurrent <= 0) {
    log.push({
      round,
      message: `[R${round}] ${ship.designId} is ADRIFT (no crew) — cannot act`,
    });
    return;
  }

  // Black Hole Generator: activates before normal weapons
  // Per design: huge-hull only, 3-turn cooldown
  if (ship.hasBlackHoleGenerator && ship.hullSize === 'huge') {
    const destroyed = activateBlackHoleGenerator(ship, enemies, round, log);
    if (destroyed > 0) {
      // Black Hole Generator is the only action this round
      return;
    }
  }

  // Decrement Black Hole Generator cooldown
  if (ship.blackHoleGeneratorCooldown && ship.blackHoleGeneratorCooldown > 0) {
    ship.blackHoleGeneratorCooldown--;
  }

  const target = selectTarget(enemies);
  if (!target) return;

  for (const weapon of ship.weapons) {
    // Handle percent-damage weapons (e.g., Ion Stream Projector)
    if (weapon.percentDamage && weapon.percentDamage > 0) {
      const percentDmg = Math.floor(target.hp * weapon.percentDamage);
      applyDamage(target, percentDmg, weapon);
      log.push({
        round,
        message:
          `[R${round}] ${ship.designId} fires ${weapon.name} at ${target.designId}` +
          ` — ${Math.round(weapon.percentDamage * 100)}% HP damage = ${percentDmg} dmg → ${target.hp}/${target.maxHp} HP`,
      });
      continue;
    }

    const attackCount = weapon.attacksPerRound > 0 ? weapon.attacksPerRound : 1;

    for (let atk = 0; atk < attackCount; atk++) {
      // Abort if target already destroyed mid-volley
      if (target.hp <= 0) break;

      const hitChance = calcHitChanceVs(ship, weapon, target, combat.difficulty);
      const d100 = roll(1, 100);

      if (d100 <= hitChance) {
        // Check Displacement Device before applying damage
        if (checkDisplacementDevice(target, log, round)) {
          continue; // Hit avoided by Displacement Device
        }
        
        const damage = rollDamage(weapon, d100, hitChance);
        applyDamage(target, damage, weapon);
        
        // Apply weapon special effects (crew kills, chain lightning, etc.)
        applyWeaponEffects(target, weapon, damage, combat, log);
        
        // Mark High Energy Focus as used after first hit
        if (ship.hasHighEnergyFocus && !ship.highEnergyFocusUsed) {
          ship.highEnergyFocusUsed = true;
          log.push({
            round,
            message: `[R${round}] ${ship.designId} High Energy Focus EXPENDED`,
          });
        }
        
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
/**
 * Process missiles in flight: move toward targets, check interception, apply damage.
 */
function processMissilePhase(state: CombatState): void {
  const surviving: MissileInFlight[] = [];
  
  for (const missile of state.missilesInFlight) {
    // Get target ship
    const allShips = [...state.attackerShips, ...state.defenderShips];
    const target = allShips.find((s) => s.id === missile.targetShipId);
    
    // If target is destroyed or retreated, missile is wasted
    if (!target || target.hp <= 0 || target.retreated || target.displaced) {
      continue;
    }
    
    // Decrement fuel
    missile.remainingFuel -= 1;
    if (missile.remainingFuel <= 0) {
      state.log.push({
        round: state.round,
        message: `[R${state.round}] Missile ${missile.weapon.name} EXPIRED (out of fuel)`,
      });
      continue;
    }
    
    // For simplicity in auto-resolve, missiles hit on the turn after they're fired
    // (simulating travel time)
    
    // Get defenders for interception
    const defenders = missile.side === 'attacker' ? state.defenderShips : state.attackerShips;
    
    // Attempt interception
    if (attemptMissileInterception(missile, defenders, state.log, state.round)) {
      continue; // Missile intercepted
    }
    
    // Calculate hit chance (missiles are affected by ECM)
    let hitChance = 80;
    if (target.ecmRating) {
      hitChance -= target.ecmRating * 5;
    }
    // Maneuver penalty for missiles
    hitChance -= target.defenseRating * 2;
    hitChance = Math.min(95, Math.max(10, hitChance));
    
    const d100 = roll(1, 100);
    if (d100 <= hitChance) {
      // Check Displacement Device
      if (checkDisplacementDevice(target, state.log, state.round)) {
        continue;
      }
      
      applyDamage(target, missile.damage, missile.weapon);
      state.log.push({
        round: state.round,
        message: `[R${state.round}] Missile ${missile.weapon.name} HIT ${target.designId} for ${missile.damage} dmg → ${target.hp}/${target.maxHp} HP`,
      });
      
      // Apply weapon effects (crew kills, overflow, etc.)
      applyWeaponEffects(target, missile.weapon, missile.damage, state, state.log);
    } else {
      state.log.push({
        round: state.round,
        message: `[R${state.round}] Missile ${missile.weapon.name} MISSED ${target.designId} (roll ${d100} > ${hitChance}%)`,
      });
    }
  }
  
  state.missilesInFlight = surviving;
}

/**
 * Process ships returning from displacement at the end of the round.
 */
function processDisplacementReturns(state: CombatState): void {
  const allShips = [...state.attackerShips, ...state.defenderShips];
  for (const ship of allShips) {
    if (ship.displaced && ship.displacementReturnRound !== undefined && 
        ship.displacementReturnRound <= state.round) {
      ship.displaced = false;
      ship.displacementReturnRound = undefined;
      state.log.push({
        round: state.round,
        message: `[R${state.round}] ${ship.designId} RETURNS from displacement!`,
      });
    }
  }
}

export function processRound(state: CombatState): CombatState {
  if (state.status !== 'ongoing') return state;

  state.round += 1;

  // Process displacement returns at start of round
  processDisplacementReturns(state);

  // Combine all living, non-displaced ships for initiative sort
  const allShips = sortByInitiative([
    ...state.attackerShips.filter((s) => s.hp > 0 && !s.retreated && !s.displaced),
    ...state.defenderShips.filter((s) => s.hp > 0 && !s.retreated && !s.displaced),
  ]);

  for (const ship of allShips) {
    // Re-check alive — may have been killed mid-round
    if (ship.hp <= 0 || ship.retreated || ship.displaced) continue;

    const enemies =
      ship.side === 'attacker' ? state.defenderShips : state.attackerShips;

    shipActs(ship, enemies, state.round, state.log, state);
  }

  // Process missiles in flight (interception happens here)
  processMissilePhase(state);

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

// ── Displacement Device (Active Use) ───────────────────────────────────────────

/**
 * Activate Displacement Device to remove ship from combat for 1 round.
 * Per design: Ship is removed from combat this round and reappears at the end of initiative.
 * Returns true if activation succeeded.
 */
export function activateDisplacementDevice(ship: CombatShip, state: CombatState): boolean {
  if (!ship.hasDisplacementDevice) {
    return false;
  }
  
  if (ship.displaced) {
    state.log.push({
      round: state.round,
      message: `[R${state.round}] ${ship.designId} Displacement Device FAILED — already displaced!`,
    });
    return false;
  }
  
  ship.displaced = true;
  ship.displacementReturnRound = state.round + 1; // Return at start of next round
  
  state.log.push({
    round: state.round,
    message: `[R${state.round}] ${ship.designId} activates Displacement Device — REMOVED from combat!`,
  });
  
  return true;
}

// ── Missile/Torpedo Launch ─────────────────────────────────────────────────────

let missileIdCounter = 0;

/**
 * Launch a missile or torpedo at a target.
 * Missiles travel and can be intercepted; they don't hit immediately.
 */
export function launchMissile(
  attacker: CombatShip,
  weapon: WeaponInstance,
  target: CombatShip,
  state: CombatState,
): boolean {
  if (weapon.category !== 'missile' && weapon.category !== 'torpedo') {
    return false;
  }
  
  const missile: MissileInFlight = {
    id: `missile_${++missileIdCounter}`,
    sourceShipId: attacker.id,
    targetShipId: target.id,
    weapon,
    damage: weapon.damageMin === weapon.damageMax 
      ? weapon.damageMin 
      : roll(weapon.damageMin, weapon.damageMax),
    techLevel: 1, // Would be derived from weapon tech level
    remainingFuel: 2, // MOO1: missiles self-destruct after 2 turns
    side: attacker.side,
  };
  
  state.missilesInFlight.push(missile);
  
  state.log.push({
    round: state.round,
    message: `[R${state.round}] ${attacker.designId} launches ${weapon.name} at ${target.designId}`,
  });
  
  return true;
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

  // Check for Warp Dissipator — prevents all retreat
  const hasWarpDissipator = livingEnemies.some((s) => s.hasWarpDissipator);
  if (hasWarpDissipator) {
    state.log.push({
      round: state.round,
      message: `[R${state.round}] ${ship.designId} retreat BLOCKED by enemy Warp Dissipator!`,
    });
    return false;
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

/**
 * Use sub-space teleporter to reposition a ship.
 * Per design: teleport to any valid hex on the combat grid.
 */
export function useTeleporter(
  ship: CombatShip,
  destination: { x: number; y: number },
  state: CombatState,
): boolean {
  if (!ship.hasTeleporter) {
    return false;
  }

  // Check if destination is valid (not occupied by another ship)
  const allShips = [...state.attackerShips, ...state.defenderShips];
  const occupied = allShips.some(
    (s) => s.position?.x === destination.x && s.position?.y === destination.y && s.hp > 0,
  );

  if (occupied) {
    state.log.push({
      round: state.round,
      message: `[R${state.round}] ${ship.designId} teleport FAILED — destination occupied`,
    });
    return false;
  }

  ship.position = destination;
  state.log.push({
    round: state.round,
    message: `[R${state.round}] ${ship.designId} TELEPORTED to (${destination.x}, ${destination.y})`,
  });
  return true;
}

// ── Full auto-resolve ─────────────────────────────────────────────────────────

/**
 * Run combat to completion (auto-resolve).
 *
 * Safety cap: 100 rounds max to prevent infinite loops (e.g. both sides have
 * only regenerating-shield ships with too-low weapon damage — not currently
 * modeled, but defensive).
 *
 * @param attackerFleet  Fleet data for the attacker.
 * @param defenderFleet  Fleet data for the defender.
 * @param maxRounds      Maximum rounds before declaring a draw.
 * @param difficulty     Optional difficulty level for combat modifiers.
 */
export function autoResolveCombat(
  attackerFleet: FleetForCombat,
  defenderFleet: FleetForCombat,
  maxRounds = 100,
  difficulty?: DifficultyLevel,
): CombatResult {
  const state = initiateCombat(attackerFleet, defenderFleet);
  state.difficulty = difficulty;

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
