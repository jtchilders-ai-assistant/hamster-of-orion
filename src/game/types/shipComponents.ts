/**
 * Ship component type definitions for the components.json data file.
 * These extend the base ShipComponent interface with full design stats
 * for use during ship design and combat calculations.
 *
 * src/game/types/shipComponents.ts
 */

// ── Component categories ──────────────────────────────────────────────────────

export type ComponentCategory =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'engine'
  | 'computer'
  | 'fuel'
  | 'special';

// ── Weapon sub-types ──────────────────────────────────────────────────────────

export type WeaponSubtype =
  | 'beam'
  | 'missile'
  | 'torpedo'
  | 'bomb'
  | 'scatter'
  | 'ground';

// ── Special effects ───────────────────────────────────────────────────────────

export interface WeaponEffect {
  /** Minimum damage (beam/bomb) */
  damageMin?: number;
  /** Maximum damage (beam/bomb); equals damageMin for fixed-damage weapons */
  damageMax?: number;
  /** Fixed damage value for missiles/torpedoes that always deal the same damage */
  damage?: number;
  /** Effective range in hexes (beam weapons only) */
  range?: number;
  /** Number of attacks per combat round */
  attacksPerRound?: number;
  /** Attack rating bonus (missiles only) */
  attackRatingBonus?: number;
  /** Speed rating for missiles */
  missileSpeed?: number;
  /** MIRV warhead count (scatter packs) */
  mirvCount?: number;
  /** Per-warhead damage (scatter packs) */
  damagePerMirv?: number;
  /** Ground combat bonus (ground weapons) */
  groundCombatBonus?: number;
  /** Whether weapon ignores shields entirely */
  ignoresShields?: boolean;
  /** Whether weapon bypasses half of shield absorption */
  bypassesHalfShield?: boolean;
  /** Whether weapon halves the shield value before absorbing */
  halvesShield?: boolean;
  /** Whether weapon kills crew (reduces enemy manpower) */
  killsCrew?: boolean;
  /** Damage as a % of target's current HP (e.g. 0.2 = 20%) */
  percentDamage?: number;
  /** Damage penalty per hex traveled (Plasma Torpedo) */
  damagePerHexPenalty?: number;
  /** Whether the weapon can be intercepted by point defense */
  interceptable?: boolean;
  /** Whether this is a point-defense weapon */
  pointDefense?: boolean;
  /** Base % chance to destroy each incoming missile (point defense) */
  missileDestroyChanceBase?: number;
  /** % reduction per missile tech level */
  missileDestroyChancePenaltyPerTechLevel?: number;
  /** Chain lightning: number of secondary ships hit */
  chainTargets?: number;
}

export interface ArmorEffect {
  /** HP multiplier relative to Titanium (1.0×) baseline */
  hpMultiplier: number;
  /** Ground combat bonus from armor tech */
  groundCombatBonus?: number;
}

export interface ShieldEffect {
  /** Damage absorbed per hit */
  damageAbsorption: number;
  /** Defense bonus (cloaking device) */
  defenseBonus?: number;
  /** Whether the shield makes ship invisible until it fires */
  invisibleUntilFire?: boolean;
}

export interface EngineEffect {
  /** Interstellar travel speed (parsecs/turn) */
  warpSpeed: number;
  /** Combat speed (hexes/round) */
  combatSpeed: number;
  /** Maneuverability class */
  maneuver: number;
}

export interface FuelEffect {
  /** Travel range in parsecs; null = infinite */
  range: number | null;
  /** Bonus range when used as a supplemental tank */
  bonusRange?: number;
}

export interface ComputerEffect {
  /** Attack rating bonus */
  attackRating?: number;
  /** Missile defense rating bonus */
  missileDefense?: number;
  /** Factories per population */
  factoriesPerPop?: number;
  /** Initiative bonus */
  initiativeBonus?: number;
  /** Scanning range for colonies (parsecs) */
  colonyDetectRange?: number;
  /** Scanning range for ships (parsecs) */
  shipDetectRange?: number;
  /** Whether scanner reveals cloaked ships */
  seeCloaked?: boolean;
  /** Whether all weapons become armor-piercing */
  allWeaponsArmorPiercing?: boolean;
}

export interface SpecialEffect {
  /** Damage reflection percentage (e.g., 0.5 = reflect 50% of incoming damage back to attacker) */
  damageReflection?: number;
  /** Push distance in hexes (Repulsor Beam) */
  pushDistance?: number;
  /** Pull distance in hexes (Tractor Beam) */
  pullDistance?: number;
  /** Whether prevents enemy from retreating (Warp Dissipator) */
  preventsRetreat?: boolean;
  /** Number of turns target is disabled (Stasis Field) */
  disableDurationTurns?: number;
  /** Minimum % of enemy stack destroyed (Black Hole Generator) */
  stackDestructionMin?: number;
  /** Maximum % of enemy stack destroyed (Black Hole Generator) */
  stackDestructionMax?: number;
  /** % reduction per shield class (Black Hole Generator) */
  destructionPenaltyPerShieldClass?: number;
  /** Cooldown turns between uses */
  cooldownTurns?: number;
  /** Required hull class(es) */
  requiresShipClass?: string[];
  /** % chance to avoid any incoming hit (Displacement Device) */
  hitAvoidChance?: number;
  /** Initiative bonus */
  initiativeBonus?: number;
  /** Defense bonus */
  defenseBonus?: number;
  /** Whether allows teleporting anywhere in combat */
  combatTeleport?: boolean;
  /** Whether allows boarding enemy ships */
  boardingCapability?: boolean;
  /** Base % to destroy incoming missiles */
  missileDestroyChanceBase?: number;
  /** % penalty per missile tech level */
  missileDestroyChancePenaltyPerTechLevel?: number;
  /** Empire-wide speed bonus */
  empireSpeedBonus?: number;
  /** Whether enables fleet re-routing in transit */
  fleetRerouting?: boolean;
  /** Range in parsecs provided by star gates */
  starGateRange?: number;
  /** Bombardment absorption (planetary shields) */
  bombardmentAbsorption?: number;
  /** Build cost for planetary installations */
  buildCost?: number;
  /** Per-turn maintenance cost */
  maintenance?: number;
  /** Whether this component enables colonization of habitable planets (consumed on use) */
  canColonize?: boolean;
  /** HP regenerated per turn (%), minimum value when range is specified */
  repairPerTurn?: number;
  /** Maximum HP regenerated per turn (%), when a range is specified */
  repairPerTurnMax?: number;
  /** Hull space bonus multiplier (e.g. 0.2 = +20%) */
  hullSpaceBonus?: number;
  /** Pollution reduction factor (e.g. 0.8 = 80% of normal waste) */
  pollutionFactor?: number;
  /** Factory build cost */
  factoryCost?: number;
  /** Ground combat bonus */
  groundCombatBonus?: number;
  /** Whether ship is invisible until it fires (Cloaking Device) */
  invisibleUntilFire?: boolean;
  /** Detection range multiplier (Improved Cloaking: 0.5 = -50%) */
  detectionRangeMultiplier?: number;
  /** Whether ship remains invisible even while firing (Perfect Cloaking) */
  alwaysInvisible?: boolean;
}

// ── Union effect type ─────────────────────────────────────────────────────────

export type ComponentEffect =
  | WeaponEffect
  | ArmorEffect
  | ShieldEffect
  | EngineEffect
  | FuelEffect
  | ComputerEffect
  | SpecialEffect;

// ── Core component definition (matches JSON) ──────────────────────────────────

export interface ComponentData {
  /** Unique string identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Technology level required to unlock */
  techLevel: number;
  /** Category grouping */
  category: ComponentCategory;
  /** Optional sub-type for weapons */
  subtype?: WeaponSubtype;
  /** Space consumed on a ship hull */
  size: number;
  /** Build cost in BCs */
  cost: number;
  /** Type-specific effect properties */
  effect: ComponentEffect;
  /** Whether this tech is available from game start */
  startingTech?: boolean;
  /** Design addition (not in original MOO1) */
  designAddition?: boolean;
  /** Any notes or caveats */
  note?: string;
}

// ── Top-level schema ──────────────────────────────────────────────────────────

export interface ComponentsSchema {
  version: 1;
  components: ComponentData[];
}
