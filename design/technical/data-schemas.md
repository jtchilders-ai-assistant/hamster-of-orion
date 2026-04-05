# JSON Data Schemas - Hamster of Orion

## Overview

This document provides complete TypeScript interfaces and JSON Schema definitions for all game data structures in Hamster of Orion. These schemas are implementation-ready and designed for type-safe game development.

**Purpose:**
- Define exact structure for all game entities
- Provide validation rules for game data files
- Enable type-safe development in TypeScript/JavaScript
- Document all fields with descriptions and constraints

**Organization:**
1. Core Types & Enums
2. Race/Species Schemas
3. Technology Schemas
4. Ship & Combat Schemas
5. Planet & Colony Schemas
6. Diplomacy Schemas
7. Event Schemas
8. Game State Schemas

---

## 1. Core Types & Enums

### 1.1 Base Types

```typescript
/** Unique identifier using snake_case */
type EntityId = string;

/** Non-negative integer */
type PositiveInteger = number;

/** Decimal value between 0 and 1 */
type Percentage = number;

/** Non-negative decimal */
type PositiveNumber = number;

/** Integer or floating point */
type Modifier = number;

/** Turn number (1-indexed) */
type TurnNumber = number;

/** BC (Build Cost) currency */
type Credits = number;

/** Research Points */
type ResearchPoints = number;
```

### 1.2 Core Enums

```typescript
/** The 10 playable races */
enum RaceId {
  HAMSTERS = "hamsters",
  ANTS = "ants",
  MICE = "mice",
  RATS = "rats",
  RABBITS = "rabbits",
  HERMIT_CRABS = "hermit_crabs",
  GUINEA_PIGS = "guinea_pigs",
  FERRETS = "ferrets",
  BUDGIES = "budgies",
  CHAMELEONS = "chameleons"
}

/** The 6 technology fields */
enum TechField {
  WEAPONS = "weapons",
  PROPULSION = "propulsion",
  CONSTRUCTION = "construction",
  COMPUTERS = "computers",
  FORCE_FIELDS = "force_fields",
  PLANETOLOGY = "planetology"
}

/** Planet environment types */
enum PlanetEnvironment {
  GAIA = "gaia",
  TERRAN = "terran",
  JUNGLE = "jungle",
  OCEAN = "ocean",
  ARID = "arid",
  STEPPE = "steppe",
  DESERT = "desert",
  MINIMAL = "minimal",
  TUNDRA = "tundra",
  BARREN = "barren",
  DEAD = "dead",
  INFERNO = "inferno",
  TOXIC = "toxic",
  RADIATED = "radiated"
}

/** Planet size categories */
enum PlanetSize {
  TINY = "tiny",
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  HUGE = "huge"
}

/** Planet mineral richness */
enum MineralRichness {
  ULTRA_POOR = "ultra_poor",
  POOR = "poor",
  NORMAL = "normal",
  RICH = "rich",
  ULTRA_RICH = "ultra_rich"
}

/** Star types for systems */
enum StarType {
  YELLOW = "yellow",
  GREEN = "green",
  RED = "red",
  BLUE = "blue",
  WHITE = "white",
  PURPLE = "purple"
}

/** Ship class sizes */
enum ShipClass {
  SCOUT = "scout",
  FIGHTER = "fighter",
  DESTROYER = "destroyer",
  CRUISER = "cruiser",
  BATTLE_CRUISER = "battle_cruiser",
  DREADNOUGHT = "dreadnought",
  TITAN = "titan"
}

/** Weapon categories */
enum WeaponCategory {
  BEAM = "beam",
  MISSILE = "missile",
  TORPEDO = "torpedo",
  BOMB = "bomb",
  BIOLOGICAL = "biological",
  SPECIAL = "special",
  GROUND = "ground"
}

/** Diplomatic relationship states */
enum DiplomaticState {
  WAR = "war",
  HOSTILE = "hostile",
  UNFRIENDLY = "unfriendly",
  NEUTRAL = "neutral",
  FRIENDLY = "friendly",
  ALLIED = "allied"
}

/** Treaty types */
enum TreatyType {
  PEACE = "peace_treaty",
  TRADE = "trade_agreement",
  NON_AGGRESSION = "non_aggression_pact",
  RESEARCH = "research_pact",
  DEFENSIVE = "defensive_pact",
  ALLIANCE = "military_alliance"
}

/** Game difficulty levels */
enum Difficulty {
  SIMPLE = "simple",
  EASY = "easy",
  AVERAGE = "average",
  HARD = "hard",
  IMPOSSIBLE = "impossible"
}

/** Galaxy size options */
enum GalaxySize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  HUGE = "huge"
}

/** Event categories */
enum EventCategory {
  SPACE_MONSTER = "space_monster",
  DISCOVERY = "discovery",
  DISASTER = "disaster",
  DIPLOMATIC = "diplomatic",
  OPPORTUNITY = "opportunity"
}
```

---

## 2. Race/Species Schemas

### 2.1 Race Definition

```typescript
interface Race {
  /** Unique identifier (snake_case) */
  id: RaceId;
  
  /** Display name */
  name: string;
  
  /** MOO1 equivalent race name (for reference) */
  moo1_equivalent: string;
  
  /** Lore description */
  description: string;
  
  /** Homeworld configuration */
  homeworld: HomeworldConfig;
  
  /** Racial stat bonuses/penalties (percentages) */
  bonuses: RacialBonuses;
  
  /** Unique racial abilities */
  special_abilities: SpecialAbility[];
  
  /** Starting technology IDs */
  starting_technologies: EntityId[];
  
  /** Unique racial content */
  unique_content: UniqueRacialContent;
  
  /** AI behavior parameters */
  ai_behavior: AIBehaviorProfile;
  
  /** Leader name pools */
  leader_names: LeaderNames;
  
  /** Ship naming prefix */
  ship_prefix: string;
}

interface HomeworldConfig {
  /** Default homeworld name */
  name: string;
  
  /** Planet type */
  type: PlanetEnvironment;
  
  /** Climate description */
  climate: string;
  
  /** Planet size */
  size: PlanetSize;
  
  /** Special planetary feature (nullable) */
  special: string | null;
}

interface RacialBonuses {
  /** Production bonus (percentage, can be negative) */
  production: Modifier;
  
  /** Research bonus (percentage) */
  research: Modifier;
  
  /** Food production bonus (percentage) */
  food: Modifier;
  
  /** Population growth bonus (percentage) */
  growth: Modifier;
  
  /** Ground combat bonus (percentage) */
  ground_combat: Modifier;
  
  /** Ship combat bonus (percentage) */
  ship_combat: Modifier;
  
  /** Espionage bonus (percentage) */
  espionage: Modifier;
  
  /** Diplomacy bonus (percentage) */
  diplomacy: Modifier;
}

interface SpecialAbility {
  /** Unique ability identifier */
  id: EntityId;
  
  /** Display name */
  name: string;
  
  /** Description of ability effect */
  description: string;
  
  /** Mechanical effect definition */
  effect: AbilityEffect;
}

interface AbilityEffect {
  /** Type of game mechanic affected */
  type: string;
  
  /** Primary value (interpretation depends on type) */
  value: number | string | boolean;
  
  /** Optional scope limiter */
  scope?: string;
  
  /** Additional parameters */
  [key: string]: any;
}

interface UniqueRacialContent {
  /** Unique building available only to this race */
  building: UniqueBuilding;
  
  /** Unique ship design available only to this race */
  ship: UniqueShip;
  
  /** Unique technology available only to this race */
  technology: UniqueTechnology;
}

interface UniqueBuilding {
  id: EntityId;
  name: string;
  description: string;
  cost: Credits;
  maintenance: Credits;
  effects: Record<string, number | boolean>;
}

interface UniqueShip {
  id: EntityId;
  name: string;
  description: string;
  size: ShipClass | string;
  special: string;
  [key: string]: any; // Additional ship-specific properties
}

interface UniqueTechnology {
  id: EntityId;
  name: string;
  description: string;
  field: TechField | string;
  tier: PositiveInteger;
  effect: Record<string, any>;
}

interface AIBehaviorProfile {
  /** AI archetype for behavior selection */
  archetype: "diplomat" | "researcher" | "expansionist" | "aggressive" | "defensive" | "sneaky";
  
  /** Tendency to start wars (0.0 - 1.0) */
  aggression: Percentage;
  
  /** Priority for colonization (0.0 - 1.0) */
  expansion: Percentage;
  
  /** Priority for research (0.0 - 1.0) */
  research_focus: Percentage;
  
  /** Priority for production (0.0 - 1.0) */
  production_focus: Percentage;
  
  /** Priority for diplomacy (0.0 - 1.0) */
  diplomacy_priority: Percentage;
  
  /** Races this race tends to ally with */
  natural_allies: RaceId[];
  
  /** Races this race tends to conflict with */
  natural_enemies: RaceId[];
  
  /** Reliability of treaty commitments (0.0 - 1.0) */
  treaty_reliability: Percentage;
  
  /** Whether AI will declare war unprovoked */
  declares_war_first: boolean;
}

interface LeaderNames {
  /** Male leader names (optional, some races use different naming) */
  male?: string[];
  
  /** Female leader names (optional) */
  female?: string[];
  
  /** Alternative naming schemes (for hiveminds, etc.) */
  coordinators?: string[];
  queens?: string[];
}
```

### 2.2 Racial Attitude Matrix

```typescript
interface RacialAttitude {
  /** Source race */
  from: RaceId;
  
  /** Target race (or "*" for all) */
  to: RaceId | "*";
  
  /** Starting relationship modifier */
  modifier: Modifier;
}

type RacialAttitudeMatrix = RacialAttitude[];
```

---

## 3. Technology Schemas

### 3.1 Technology Definition

```typescript
interface Technology {
  /** Unique identifier */
  id: EntityId;
  
  /** Display name */
  name: string;
  
  /** Description of technology */
  description: string;
  
  /** Technology field */
  field: TechField;
  
  /** Technology tier (1-20+) */
  tier: PositiveInteger;
  
  /** Base research cost in RP */
  cost: ResearchPoints;
  
  /** What this tech unlocks/provides */
  unlocks: TechUnlock[];
  
  /** Categories for random selection pooling */
  category?: string;
  
  /** Whether this appears in every game */
  always_available?: boolean;
  
  /** Chance to appear if not always_available (0.0 - 1.0) */
  availability_chance?: Percentage;
  
  /** Tech IDs that must be researched first */
  prerequisites?: EntityId[];
  
  /** Race-specific bonuses when researching */
  racial_bonuses?: Record<RaceId, TechRacialBonus>;
}

interface TechUnlock {
  /** Type of unlock */
  type: "weapon" | "component" | "building" | "ability" | "stat_bonus" | "ship_class";
  
  /** ID of unlocked item (if applicable) */
  id?: EntityId;
  
  /** Direct stat bonus (if type is "stat_bonus") */
  bonus?: Record<string, number>;
}

interface TechRacialBonus {
  /** Cost reduction percentage */
  cost_reduction?: Percentage;
  
  /** Effect boost percentage */
  effect_bonus?: Percentage;
  
  /** Renamed version for this race */
  renamed?: string;
}

interface TechTierCost {
  tier: PositiveInteger;
  cost: ResearchPoints;
}
```

### 3.2 Research State

```typescript
interface EmpireResearchState {
  /** Current tech being researched per field */
  current_research: Record<TechField, EntityId | null>;
  
  /** Accumulated RP per field */
  progress: Record<TechField, ResearchPoints>;
  
  /** Slider allocation per field (must sum to 100) */
  allocation: Record<TechField, Percentage>;
  
  /** Highest completed tier per field */
  current_tier: Record<TechField, PositiveInteger>;
  
  /** All completed technology IDs */
  completed_techs: EntityId[];
  
  /** Pending tech choices awaiting player selection */
  pending_choices: Record<TechField, EntityId[]>;
  
  /** Technologies available for selection this game */
  available_techs: Record<TechField, EntityId[]>;
}
```

---

## 4. Ship & Combat Schemas

### 4.1 Ship Class Definition

```typescript
interface ShipClassDefinition {
  /** Class identifier */
  id: ShipClass;
  
  /** Display name */
  name: string;
  
  /** Total space available */
  space: PositiveInteger;
  
  /** Base HP before armor multiplier */
  base_hp: PositiveInteger;
  
  /** Base build cost (BC) */
  base_cost: Credits;
  
  /** Technology required to build (null = always available) */
  tech_required: EntityId | null;
  
  /** Maximum weapon slots */
  max_weapon_slots: PositiveInteger;
  
  /** Maximum heavy weapon slots */
  max_heavy_weapons: PositiveInteger;
}
```

### 4.2 Weapon Definition

```typescript
interface BeamWeapon {
  id: EntityId;
  name: string;
  category: "beam";
  tech_level: PositiveInteger;
  damage_min: PositiveInteger;
  damage_max: PositiveInteger;
  range: PositiveInteger;
  space: PositiveInteger;
  cost: Credits;
  attacks: PositiveInteger;
  special: WeaponSpecial | null;
  heavy?: boolean;
}

interface MissileWeapon {
  id: EntityId;
  name: string;
  category: "missile";
  tech_level: PositiveInteger;
  damage: PositiveInteger;
  speed: PositiveNumber;
  space: PositiveInteger;
  cost: Credits;
  rack_size: PositiveInteger;
  special: WeaponSpecial | null;
}

interface TorpedoWeapon {
  id: EntityId;
  name: string;
  category: "torpedo";
  tech_level: PositiveInteger;
  damage: PositiveInteger;
  speed: PositiveInteger;
  space: PositiveInteger;
  cost: Credits;
  fire_rate: PositiveInteger;
  special: WeaponSpecial | null;
  heavy?: boolean;
}

interface BombWeapon {
  id: EntityId;
  name: string;
  category: "bomb";
  tech_level: PositiveInteger;
  damage_min: PositiveInteger;
  damage_max: PositiveInteger;
  space: PositiveInteger;
  cost: Credits;
}

interface BiologicalWeapon {
  id: EntityId;
  name: string;
  category: "biological";
  tech_level: PositiveInteger;
  pop_damage_min: PositiveInteger;
  pop_damage_max: PositiveInteger;
  max_pop_reduction: Percentage;
  space: PositiveInteger;
  cost: Credits;
  heavy: true;
}

interface SpecialWeapon {
  id: EntityId;
  name: string;
  category: "special";
  tech_level: PositiveInteger;
  effect: string;
  space: PositiveInteger;
  cost: Credits;
  [key: string]: any; // Effect-specific properties
}

interface GroundWeapon {
  id: EntityId;
  name: string;
  category: "ground";
  tech_level: PositiveInteger;
  ground_combat_bonus: PositiveInteger;
}

type Weapon = BeamWeapon | MissileWeapon | TorpedoWeapon | BombWeapon | BiologicalWeapon | SpecialWeapon | GroundWeapon;

type WeaponSpecial = 
  | "multi_attack"
  | "armor_piercing"
  | "halves_shields"
  | "ignores_half_shields"
  | "kills_crew"
  | "stream"
  | "no_range_penalty"
  | "chain_lightning_4"
  | "double_shield_damage"
  | "instant_kill_small"
  | "always_hits"
  | "destroys_planets"
  | "mirv_5"
  | "no_intercept"
  | "bonus_vs_shields"
  | "disable_engines"
  | "crew_damage"
  | "area_damage"
  | "instant_kill"
  | "remove_evasion";
```

### 4.3 Ship Components

```typescript
interface Engine {
  id: EntityId;
  name: string;
  tech_level: PositiveInteger;
  speed: PositiveInteger;
  combat_speed: PositiveInteger;
  space: PositiveInteger;
  cost: Credits;
  maneuver: PositiveInteger;
}

interface FuelCell {
  id: EntityId;
  name: string;
  tech_level: PositiveInteger;
  range: PositiveInteger | -1; // -1 = infinite
  space: PositiveInteger;
  cost: Credits;
}

interface BattleComputer {
  id: EntityId;
  name: string;
  tech_level: PositiveInteger;
  attack_rating: PositiveInteger;
  space: PositiveInteger;
  cost: Credits;
}

interface ECMJammer {
  id: EntityId;
  name: string;
  tech_level: PositiveInteger;
  missile_defense: PositiveInteger;
  space: PositiveInteger;
  cost: Credits;
}

interface Shield {
  id: EntityId;
  name: string;
  tech_level: PositiveInteger;
  absorbs: PositiveInteger;
  space: PositiveInteger;
  cost: Credits;
}

interface Armor {
  id: EntityId;
  name: string;
  tech_level: PositiveInteger;
  hp_multiplier: PositiveNumber;
  ground_bonus: PositiveInteger;
}

interface Scanner {
  id: EntityId;
  name: string;
  tech_level: PositiveInteger;
  colony_detect: PositiveInteger;
  ship_detect: PositiveInteger;
  space: PositiveInteger;
  cost: Credits;
  special?: string;
}

interface SpecialSystem {
  id: EntityId;
  name: string;
  tech_level: PositiveInteger;
  space: PositiveInteger;
  cost: Credits;
  effect: string;
  [key: string]: any; // Effect-specific properties
}

type ShipComponent = Engine | FuelCell | BattleComputer | ECMJammer | Shield | Armor | Scanner | SpecialSystem;
```

### 4.4 Ship Design

```typescript
interface ShipDesign {
  /** Unique design identifier */
  id: EntityId;
  
  /** Player-assigned name */
  name: string;
  
  /** Ship class/size */
  ship_class: ShipClass;
  
  /** Engine component ID */
  engine: EntityId;
  
  /** Fuel cell component ID (optional) */
  fuel_cell?: EntityId;
  
  /** Battle computer component ID (optional) */
  computer?: EntityId;
  
  /** ECM jammer component ID (optional) */
  ecm?: EntityId;
  
  /** Shield component ID (optional) */
  shield?: EntityId;
  
  /** Armor type ID */
  armor: EntityId;
  
  /** Installed weapons */
  weapons: WeaponMount[];
  
  /** Special systems installed */
  specials: EntityId[];
  
  /** Total space used */
  space_used: PositiveInteger;
  
  /** Total build cost */
  total_cost: Credits;
  
  /** Calculated HP after armor */
  effective_hp: PositiveInteger;
  
  /** Auto-designed by AI */
  auto_designed?: boolean;
}

interface WeaponMount {
  /** Weapon component ID */
  weapon_id: EntityId;
  
  /** Number of this weapon mounted */
  count: PositiveInteger;
}

interface ShipInstance {
  /** Reference to design */
  design_id: EntityId;
  
  /** Current HP */
  current_hp: PositiveInteger;
  
  /** Experience level */
  experience: PositiveInteger;
  
  /** Remaining missile ammo */
  missiles_remaining?: Record<EntityId, PositiveInteger>;
  
  /** Current position (if in combat) */
  position?: { x: number; y: number };
  
  /** Cloaked status */
  cloaked?: boolean;
}
```

### 4.5 Fleet Definition

```typescript
interface Fleet {
  /** Unique fleet identifier */
  id: EntityId;
  
  /** Owner empire/race */
  owner: RaceId;
  
  /** Fleet name */
  name: string;
  
  /** Current location (star system ID) */
  location: EntityId;
  
  /** Destination (if in transit) */
  destination?: EntityId;
  
  /** Turns until arrival */
  eta?: TurnNumber;
  
  /** Ships in fleet grouped by design */
  ships: FleetShipGroup[];
  
  /** Fleet stance/orders */
  stance: "defensive" | "aggressive" | "hold" | "retreat";
}

interface FleetShipGroup {
  /** Ship design ID */
  design_id: EntityId;
  
  /** Number of ships of this design */
  count: PositiveInteger;
  
  /** Individual ship instances (for damage tracking) */
  instances?: ShipInstance[];
}
```

---

## 5. Planet & Colony Schemas

### 5.1 Planet Definition

```typescript
interface Planet {
  /** Unique planet identifier */
  id: EntityId;
  
  /** Planet name */
  name: string;
  
  /** Star system this planet belongs to */
  system_id: EntityId;
  
  /** Planet environment type */
  environment: PlanetEnvironment;
  
  /** Planet size category */
  size: PlanetSize;
  
  /** Mineral richness */
  minerals: MineralRichness;
  
  /** Special planetary features */
  specials: PlanetSpecial[];
  
  /** Base maximum population (before modifiers) */
  base_max_pop: PositiveInteger;
  
  /** Whether planet has been explored */
  explored_by: RaceId[];
  
  /** Current owner (null if uncolonized) */
  owner?: RaceId;
  
  /** Colony data (if colonized) */
  colony?: Colony;
}

type PlanetSpecial = 
  | "artifacts"
  | "mineral_rich"
  | "mineral_ultra_rich"
  | "mineral_poor"
  | "mineral_ultra_poor"
  | "fertile"
  | "hostile_life"
  | "ancient_ruins"
  | "orion";
```

### 5.2 Colony Definition

```typescript
interface Colony {
  /** Reference to planet */
  planet_id: EntityId;
  
  /** Owner race */
  owner: RaceId;
  
  /** Current population (millions) */
  population: PositiveNumber;
  
  /** Fractional population accumulator */
  fractional_pop: number;
  
  /** Maximum population (after all modifiers) */
  max_population: PositiveInteger;
  
  /** Number of factories */
  factories: PositiveInteger;
  
  /** Production sliders (must sum to 100) */
  sliders: ColonySliders;
  
  /** Built structures */
  buildings: EntityId[];
  
  /** Current build queue */
  build_queue: BuildQueueItem[];
  
  /** Morale level (0-100) */
  morale: PositiveInteger;
  
  /** Accumulated pollution */
  pollution: PositiveNumber;
  
  /** Missile bases */
  missile_bases: PositiveInteger;
  
  /** Planetary shield level */
  shield_level: PositiveInteger;
  
  /** Turn colony was established */
  founded_turn: TurnNumber;
}

interface ColonySliders {
  /** Ship/defense construction (percentage) */
  ship: Percentage;
  
  /** Defense construction (percentage) */
  defense: Percentage;
  
  /** Factory construction (percentage) */
  industry: Percentage;
  
  /** Environmental cleanup (percentage) */
  ecology: Percentage;
  
  /** Technology research (percentage) */
  research: Percentage;
}

interface BuildQueueItem {
  /** What is being built */
  type: "ship" | "building" | "missile_base" | "stargate";
  
  /** Item ID (ship design or building ID) */
  item_id: EntityId;
  
  /** Progress accumulated */
  progress: PositiveNumber;
  
  /** Total cost */
  total_cost: Credits;
  
  /** Quantity (for ships) */
  quantity?: PositiveInteger;
}
```

### 5.3 Star System Definition

```typescript
interface StarSystem {
  /** Unique system identifier */
  id: EntityId;
  
  /** System name */
  name: string;
  
  /** Star type */
  star_type: StarType;
  
  /** Position in galaxy (normalized 0-1) */
  position: { x: number; y: number };
  
  /** Planet in this system (exactly one per MOO1 rules) */
  planet_id: EntityId;
  
  /** Whether system is in a nebula */
  in_nebula: boolean;
  
  /** Wormhole connection (if any) */
  wormhole_to?: EntityId;
  
  /** Whether this is the Orion system */
  is_orion?: boolean;
}
```

### 5.4 Environment Data

```typescript
interface EnvironmentStats {
  id: PlanetEnvironment;
  name: string;
  growth_modifier: Percentage;
  capacity_modifier: Percentage;
  fertility: Percentage;
  colonization_tech_required?: EntityId;
}

interface PlanetSizeStats {
  id: PlanetSize;
  name: string;
  base_max_population: PositiveInteger;
}
```

---

## 6. Diplomacy Schemas

### 6.1 Empire Relationship

```typescript
interface EmpireRelationship {
  /** First empire */
  empire_a: RaceId;
  
  /** Second empire */
  empire_b: RaceId;
  
  /** Current relationship value (-100 to +100) */
  value: Modifier;
  
  /** Fractional relationship accumulator */
  fractional: number;
  
  /** Active treaties between empires */
  treaties: ActiveTreaty[];
  
  /** Turn empires first made contact */
  first_contact_turn: TurnNumber;
  
  /** Whether currently at war */
  at_war: boolean;
  
  /** Turn war started (if at war) */
  war_start_turn?: TurnNumber;
  
  /** Accumulated war weariness */
  war_weariness: PositiveNumber;
  
  /** Border friction from contested systems */
  border_friction: PositiveInteger;
}

interface ActiveTreaty {
  /** Treaty type */
  type: TreatyType;
  
  /** Turn treaty was signed */
  signed_turn: TurnNumber;
  
  /** Accumulated maintenance bonus */
  maintenance_accumulated: number;
}
```

### 6.2 Treaty Definition

```typescript
interface TreatyDefinition {
  id: TreatyType;
  name: string;
  
  /** Initial relationship bonus when signed */
  initial_bonus: Modifier;
  
  /** Per-turn maintenance bonus */
  maintenance_bonus: PositiveNumber;
  
  /** Minimum relationship to propose */
  min_relation_required: Modifier;
  
  /** Minimum turns before breaking */
  duration_min: PositiveInteger;
  
  /** Penalty with treaty partner if broken */
  break_penalty_target: Modifier;
  
  /** Penalty with all empires if broken */
  break_penalty_all: Modifier;
}
```

### 6.3 Diplomatic Action

```typescript
interface DiplomaticAction {
  id: EntityId;
  type: "positive" | "negative";
  base_change: Modifier;
  
  /** Only affects relationship with target */
  target_only?: boolean;
  
  /** Affects all empire relationships */
  affects_all?: boolean;
  
  /** Change applied to all empires (if different from base) */
  all_change?: Modifier;
  
  /** Value range (for gifts) */
  min_value?: Credits;
  max_value?: Credits;
}
```

### 6.4 Empire Reputation

```typescript
interface EmpireReputation {
  /** Honor track: treaty keeping (-100 to +100) */
  honor: Modifier;
  
  /** Peace track: war aversion (-100 to +100) */
  peace: Modifier;
  
  /** Fairness track: deal fairness (-100 to +100) */
  fairness: Modifier;
  
  /** Mercy track: treatment of defeated (-100 to +100) */
  mercy: Modifier;
  
  /** Turns remaining as "treaty breaker" */
  treaty_breaker_duration: PositiveInteger;
}
```

---

## 7. Event Schemas

### 7.1 Random Event Definition

```typescript
interface RandomEvent {
  /** Unique event identifier */
  id: EntityId;
  
  /** Display title */
  title: string;
  
  /** Event category */
  category: EventCategory;
  
  /** Narrative description */
  description: string;
  
  /** Minimum turn for event to occur */
  min_turn: TurnNumber;
  
  /** Selection weight (higher = more likely) */
  weight: PositiveInteger;
  
  /** Requirements for event to be eligible */
  prerequisites: EventPrerequisite[];
  
  /** Effects when event triggers */
  effects: EventEffect[];
  
  /** Player choices (if any) */
  choices?: EventChoice[];
  
  /** Duration in turns (0 = instant) */
  duration: PositiveInteger;
  
  /** Minimum turns between same event */
  cooldown: PositiveInteger;
}

interface EventPrerequisite {
  type: "min_colonies" | "min_population" | "has_tech" | "has_contact" | "at_war" | "at_peace" | "min_fleet_size";
  value: number | string | boolean;
}

interface EventEffect {
  type: "population_change" | "production_change" | "research_bonus" | "credits_change" | 
        "relation_change" | "destroy_planet" | "spawn_monster" | "tech_discovery" | 
        "morale_change" | "fleet_damage";
  
  /** Target scope */
  target: "random_colony" | "all_colonies" | "homeworld" | "specific_race" | "all_races" | "random_system";
  
  /** Effect magnitude */
  value: number | string;
  
  /** Duration (if temporary) */
  duration?: PositiveInteger;
}

interface EventChoice {
  /** Choice text */
  text: string;
  
  /** Effects if chosen */
  effects: EventEffect[];
  
  /** Requirements to show this choice */
  requirements?: EventPrerequisite[];
}
```

### 7.2 Space Monster Definition

```typescript
interface SpaceMonster {
  /** Unique monster identifier */
  id: EntityId;
  
  /** Display name */
  name: string;
  
  /** Narrative description */
  description: string;
  
  /** Combat statistics */
  combat_stats: MonsterCombatStats;
  
  /** Behavior pattern */
  behavior: "stationary" | "random_wander" | "targeted" | "patrol";
  
  /** Location tied to (if stationary) */
  location?: EntityId;
  
  /** Rewards for defeating */
  rewards: MonsterReward[];
  
  /** Turn monster was spawned */
  spawn_turn?: TurnNumber;
}

interface MonsterCombatStats {
  hp: PositiveInteger;
  attack: PositiveInteger;
  defense: PositiveInteger;
  speed: PositiveInteger;
  damage_min: PositiveInteger;
  damage_max: PositiveInteger;
  special_abilities: string[];
  
  /** Difficulty scaling */
  scales_with_turn?: boolean;
  scaling_factor?: PositiveNumber;
}

interface MonsterReward {
  type: "credits" | "tech" | "artifact" | "planet_bonus";
  value: number | string;
}
```

---

## 8. Game State Schemas

### 8.1 Complete Game State

```typescript
interface GameState {
  /** Game metadata */
  meta: GameMeta;
  
  /** Galaxy configuration */
  galaxy: GalaxyState;
  
  /** All star systems */
  systems: StarSystem[];
  
  /** All planets */
  planets: Planet[];
  
  /** All empires (player + AI) */
  empires: EmpireState[];
  
  /** Inter-empire relationships */
  relationships: EmpireRelationship[];
  
  /** Active space monsters */
  monsters: SpaceMonster[];
  
  /** Event history and pending events */
  events: EventState;
  
  /** Current turn number */
  turn: TurnNumber;
  
  /** Game phase */
  phase: GamePhase;
  
  /** Victory tracking */
  victory: VictoryState;
}

interface GameMeta {
  /** Unique game identifier */
  game_id: string;
  
  /** Player's chosen race */
  player_race: RaceId;
  
  /** Difficulty level */
  difficulty: Difficulty;
  
  /** Galaxy size */
  galaxy_size: GalaxySize;
  
  /** Number of AI opponents */
  ai_count: PositiveInteger;
  
  /** Random seed for reproducibility */
  seed: number;
  
  /** Game creation timestamp */
  created_at: string; // ISO 8601
  
  /** Last save timestamp */
  saved_at: string; // ISO 8601
  
  /** Game version */
  version: string;
}

interface GalaxyState {
  /** Width in parsecs */
  width: PositiveInteger;
  
  /** Height in parsecs */
  height: PositiveInteger;
  
  /** Total star count */
  star_count: PositiveInteger;
  
  /** Nebula regions */
  nebulae: NebulaRegion[];
  
  /** Wormhole pairs */
  wormholes: WormholePair[];
}

interface NebulaRegion {
  center: { x: number; y: number };
  radius: PositiveNumber;
}

interface WormholePair {
  system_a: EntityId;
  system_b: EntityId;
}
```

### 8.2 Empire State

```typescript
interface EmpireState {
  /** Race identifier */
  race: RaceId;
  
  /** Whether this is the player */
  is_player: boolean;
  
  /** Whether empire is eliminated */
  eliminated: boolean;
  
  /** Turn eliminated (if applicable) */
  eliminated_turn?: TurnNumber;
  
  /** All colonies owned */
  colonies: EntityId[];
  
  /** Homeworld planet ID */
  homeworld: EntityId;
  
  /** All fleets */
  fleets: Fleet[];
  
  /** Ship designs */
  ship_designs: ShipDesign[];
  
  /** Research state */
  research: EmpireResearchState;
  
  /** Reputation tracks */
  reputation: EmpireReputation;
  
  /** Treasury (BC) */
  treasury: Credits;
  
  /** Income/expenses breakdown */
  budget: EmpireBudget;
  
  /** Known technologies */
  known_techs: EntityId[];
  
  /** Explored systems */
  explored_systems: EntityId[];
  
  /** Empire-wide modifiers */
  modifiers: EmpireModifier[];
  
  /** Spy operations in progress */
  spy_operations: SpyOperation[];
  
  /** Total population across all colonies */
  total_population: PositiveInteger;
  
  /** Total production capacity */
  total_production: PositiveInteger;
}

interface EmpireBudget {
  /** Income from colonies */
  colony_income: Credits;
  
  /** Income from trade */
  trade_income: Credits;
  
  /** Fleet maintenance costs */
  fleet_maintenance: Credits;
  
  /** Building maintenance costs */
  building_maintenance: Credits;
  
  /** Spy network costs */
  spy_costs: Credits;
  
  /** Net income/loss */
  net: Credits;
}

interface EmpireModifier {
  /** What is being modified */
  type: string;
  
  /** Modifier value */
  value: number;
  
  /** Source of modifier */
  source: string;
  
  /** Turns remaining (-1 = permanent) */
  duration: number;
}

interface SpyOperation {
  /** Target empire */
  target: RaceId;
  
  /** Operation type */
  operation: "reconnaissance" | "tech_theft" | "sabotage" | "incite_rebellion" | "assassination";
  
  /** Spies assigned */
  spies_assigned: PositiveInteger;
  
  /** Turns until completion */
  turns_remaining: PositiveInteger;
}

type GamePhase = "setup" | "playing" | "combat" | "council" | "victory" | "defeat";
```

### 8.3 Victory State

```typescript
interface VictoryState {
  /** Victory achieved (null if game ongoing) */
  victor?: RaceId;
  
  /** Type of victory */
  victory_type?: VictoryType;
  
  /** Turn victory was achieved */
  victory_turn?: TurnNumber;
  
  /** Domination tracking */
  domination: DominationProgress;
  
  /** Council voting history */
  council: CouncilState;
  
  /** Orion conquest status (not a victory, but strategic milestone) */
  orion: OrionState;
}

type VictoryType = "domination" | "diplomatic";

interface DominationProgress {
  /** Population by empire */
  population_by_empire: Record<RaceId, PositiveInteger>;
  
  /** Total galactic population */
  total_population: PositiveInteger;
  
  /** Threshold for victory (2/3) */
  threshold: Percentage;
}

interface CouncilState {
  /** Whether council has formed */
  formed: boolean;
  
  /** Turn council formed */
  formation_turn?: TurnNumber;
  
  /** Previous council votes */
  vote_history: CouncilVote[];
  
  /** Current council session (if active) */
  current_session?: CouncilSession;
}

interface CouncilVote {
  turn: TurnNumber;
  candidates: RaceId[];
  votes: Record<RaceId, Record<RaceId, PositiveInteger>>;
  winner?: RaceId;
  abstentions: RaceId[];
}

interface CouncilSession {
  /** Nominated candidates */
  candidates: RaceId[];
  
  /** Vote allocations */
  votes_available: Record<RaceId, PositiveInteger>;
}

interface OrionState {
  /** Whether Guardian is defeated */
  guardian_defeated: boolean;
  
  /** Empire that defeated Guardian */
  defeated_by?: RaceId;
  
  /** Turn Guardian was defeated */
  defeated_turn?: TurnNumber;
  
  /** Whether Orion is colonized */
  orion_colonized: boolean;
}

interface EventState {
  /** Events that have occurred */
  history: TriggeredEvent[];
  
  /** Cooldowns for events */
  cooldowns: Record<EntityId, TurnNumber>;
  
  /** Active ongoing events */
  active: ActiveEvent[];
}

interface TriggeredEvent {
  event_id: EntityId;
  turn: TurnNumber;
  target_empire?: RaceId;
  target_system?: EntityId;
  choice_made?: number;
}

interface ActiveEvent {
  event_id: EntityId;
  start_turn: TurnNumber;
  remaining_turns: PositiveInteger;
  effects: EventEffect[];
  target?: EntityId;
}
```

---

## 9. JSON Schema Definitions

### 9.1 Race Data File Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://hamsteroforion.game/schemas/races.json",
  "title": "Races Data",
  "type": "object",
  "required": ["races"],
  "properties": {
    "races": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "moo1_equivalent", "description", "homeworld", "bonuses", "special_abilities", "starting_technologies", "unique_content", "ai_behavior", "leader_names", "ship_prefix"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-z_]+$" },
          "name": { "type": "string" },
          "moo1_equivalent": { "type": "string" },
          "description": { "type": "string" },
          "homeworld": {
            "type": "object",
            "required": ["name", "type", "climate", "size"],
            "properties": {
              "name": { "type": "string" },
              "type": { "enum": ["gaia", "terran", "jungle", "ocean", "arid", "steppe", "desert", "minimal", "tundra", "barren", "dead", "inferno", "toxic", "radiated"] },
              "climate": { "type": "string" },
              "size": { "enum": ["tiny", "small", "medium", "large", "huge"] },
              "special": { "type": ["string", "null"] }
            }
          },
          "bonuses": {
            "type": "object",
            "required": ["production", "research", "food", "growth", "ground_combat", "ship_combat", "espionage", "diplomacy"],
            "properties": {
              "production": { "type": "number", "minimum": -100, "maximum": 100 },
              "research": { "type": "number", "minimum": -100, "maximum": 100 },
              "food": { "type": "number", "minimum": -100, "maximum": 100 },
              "growth": { "type": "number", "minimum": -100, "maximum": 200 },
              "ground_combat": { "type": "number", "minimum": -100, "maximum": 100 },
              "ship_combat": { "type": "number", "minimum": -100, "maximum": 100 },
              "espionage": { "type": "number", "minimum": -100, "maximum": 100 },
              "diplomacy": { "type": "number", "minimum": -100, "maximum": 100 }
            }
          },
          "special_abilities": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["id", "name", "description", "effect"],
              "properties": {
                "id": { "type": "string" },
                "name": { "type": "string" },
                "description": { "type": "string" },
                "effect": { "type": "object" }
              }
            }
          },
          "starting_technologies": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 4,
            "maxItems": 4
          },
          "unique_content": {
            "type": "object",
            "required": ["building", "ship", "technology"],
            "properties": {
              "building": { "type": "object" },
              "ship": { "type": "object" },
              "technology": { "type": "object" }
            }
          },
          "ai_behavior": {
            "type": "object",
            "required": ["archetype", "aggression", "expansion", "research_focus", "production_focus", "diplomacy_priority", "natural_allies", "natural_enemies", "treaty_reliability", "declares_war_first"],
            "properties": {
              "archetype": { "enum": ["diplomat", "researcher", "expansionist", "aggressive", "defensive", "sneaky"] },
              "aggression": { "type": "number", "minimum": 0, "maximum": 1 },
              "expansion": { "type": "number", "minimum": 0, "maximum": 1 },
              "research_focus": { "type": "number", "minimum": 0, "maximum": 1 },
              "production_focus": { "type": "number", "minimum": 0, "maximum": 1 },
              "diplomacy_priority": { "type": "number", "minimum": 0, "maximum": 1 },
              "natural_allies": { "type": "array", "items": { "type": "string" } },
              "natural_enemies": { "type": "array", "items": { "type": "string" } },
              "treaty_reliability": { "type": "number", "minimum": 0, "maximum": 1 },
              "declares_war_first": { "type": "boolean" }
            }
          },
          "leader_names": { "type": "object" },
          "ship_prefix": { "type": "string", "maxLength": 4 }
        }
      }
    }
  }
}
```

### 9.2 Technology Data File Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://hamsteroforion.game/schemas/technologies.json",
  "title": "Technologies Data",
  "type": "object",
  "required": ["technologies"],
  "properties": {
    "technologies": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "description", "field", "tier", "cost", "unlocks"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-z_0-9]+$" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "field": { "enum": ["weapons", "propulsion", "construction", "computers", "force_fields", "planetology"] },
          "tier": { "type": "integer", "minimum": 1, "maximum": 50 },
          "cost": { "type": "integer", "minimum": 50 },
          "unlocks": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["type"],
              "properties": {
                "type": { "enum": ["weapon", "component", "building", "ability", "stat_bonus", "ship_class"] },
                "id": { "type": "string" },
                "bonus": { "type": "object" }
              }
            }
          },
          "category": { "type": "string" },
          "always_available": { "type": "boolean" },
          "availability_chance": { "type": "number", "minimum": 0, "maximum": 1 },
          "prerequisites": { "type": "array", "items": { "type": "string" } }
        }
      }
    }
  }
}
```

### 9.3 Weapons Data File Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://hamsteroforion.game/schemas/weapons.json",
  "title": "Weapons Data",
  "type": "object",
  "required": ["beam_weapons", "missiles", "torpedoes", "bombs", "biological_weapons", "special_weapons", "ground_weapons"],
  "properties": {
    "beam_weapons": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "tech_level", "damage_min", "damage_max", "range", "space", "cost", "attacks"],
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "tech_level": { "type": "integer", "minimum": 1 },
          "damage_min": { "type": "integer", "minimum": 0 },
          "damage_max": { "type": "integer", "minimum": 1 },
          "range": { "type": "integer", "minimum": 1 },
          "space": { "type": "integer", "minimum": 1 },
          "cost": { "type": "integer", "minimum": 1 },
          "attacks": { "type": "integer", "minimum": 1 },
          "special": { "type": ["string", "null"] },
          "heavy": { "type": "boolean" }
        }
      }
    },
    "missiles": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "tech_level", "damage", "speed", "space", "cost", "rack_size"],
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "tech_level": { "type": "integer" },
          "damage": { "type": "integer" },
          "speed": { "type": "number" },
          "space": { "type": "integer" },
          "cost": { "type": "integer" },
          "rack_size": { "type": "integer" },
          "special": { "type": ["string", "null"] }
        }
      }
    },
    "torpedoes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "tech_level", "damage", "speed", "space", "cost", "fire_rate"],
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "tech_level": { "type": "integer" },
          "damage": { "type": "integer" },
          "speed": { "type": "integer" },
          "space": { "type": "integer" },
          "cost": { "type": "integer" },
          "fire_rate": { "type": "integer" },
          "special": { "type": ["string", "null"] },
          "heavy": { "type": "boolean" }
        }
      }
    },
    "bombs": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "tech_level", "damage_min", "damage_max", "space", "cost"]
      }
    },
    "biological_weapons": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "tech_level", "pop_damage_min", "pop_damage_max", "max_pop_reduction", "space", "cost", "heavy"]
      }
    },
    "special_weapons": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "tech_level", "effect", "space", "cost"]
      }
    },
    "ground_weapons": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "tech_level", "ground_combat_bonus"]
      }
    }
  }
}
```

### 9.4 Events Data File Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://hamsteroforion.game/schemas/events.json",
  "title": "Random Events Data",
  "type": "object",
  "required": ["events", "space_monsters"],
  "properties": {
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "category", "description", "min_turn", "weight", "effects", "duration", "cooldown"],
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" },
          "category": { "enum": ["space_monster", "discovery", "disaster", "diplomatic", "opportunity"] },
          "description": { "type": "string" },
          "min_turn": { "type": "integer", "minimum": 1 },
          "weight": { "type": "integer", "minimum": 1 },
          "prerequisites": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["type", "value"]
            }
          },
          "effects": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["type", "target", "value"]
            }
          },
          "choices": { "type": "array" },
          "duration": { "type": "integer", "minimum": 0 },
          "cooldown": { "type": "integer", "minimum": 0 }
        }
      }
    },
    "space_monsters": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "description", "combat_stats", "behavior", "rewards"],
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "combat_stats": {
            "type": "object",
            "required": ["hp", "attack", "defense", "speed", "damage_min", "damage_max"]
          },
          "behavior": { "enum": ["stationary", "random_wander", "targeted", "patrol"] },
          "location": { "type": "string" },
          "rewards": { "type": "array" }
        }
      }
    }
  }
}
```

---

## 10. Constants & Configuration

### 10.1 Game Constants

```typescript
const GAME_CONSTANTS = {
  // Population
  BASE_GROWTH_RATE: 0.10,
  BASE_FOOD_PER_COLONIST: 1.0,
  BASE_FOOD_PER_WORKER: 2.0,
  STARVATION_RATE: 0.5,
  INITIAL_COLONY_POPULATION: 2,
  TRANSPORT_CAPACITY: 1,
  
  // Research
  BASE_RP_PER_SCIENTIST: 1.0,
  MINIATURIZATION_RATE: 0.05,
  MINIATURIZATION_MINIMUM: 0.20,
  TECH_CHOICES_BASE: 2,
  TECH_CHOICES_RATS: 3,
  
  // Combat
  BASE_HIT_CHANCE: 50,
  HIT_CHANCE_PER_LEVEL: 5,
  RANGE_PENALTY_PER_HEX: 10,
  MINIMUM_HIT_CHANCE: 5,
  MAXIMUM_HIT_CHANCE: 95,
  
  // Diplomacy
  RELATION_MIN: -100,
  RELATION_MAX: 100,
  DECAY_RATE: 0.02,
  TREATY_MAINTENANCE_CAP: 10,
  TREATY_BREAKER_DURATION: 50,
  BORDER_FRICTION_PER_SYSTEM: -5,
  BORDER_FRICTION_MAX: -25,
  
  // Events
  BASE_EVENT_CHANCE: 0.03,
  TURN_PROBABILITY_INCREMENT: 0.001,
  MAX_EVENT_CHANCE: 0.15,
  MIN_TURNS_BETWEEN_SAME_EVENT: 20,
  
  // Victory
  DOMINATION_THRESHOLD: 0.667, // 2/3
  COUNCIL_VICTORY_THRESHOLD: 0.667, // 2/3 of votes
  COUNCIL_FORMATION_COLONIZATION: 0.5, // 50% of planets colonized
  
  // Economy
  BASE_PRODUCTION_PER_POP: 1.0,
  FACTORY_BASE_OUTPUT: 1.0,
  WASTE_RATE: 0.05,
  SCRAP_RETURN_RATE: 0.25
} as const;
```

### 10.2 Difficulty Modifiers

```typescript
interface DifficultyConfig {
  /** Player research cost multiplier */
  player_research_cost: number;
  
  /** AI research cost multiplier */
  ai_research_cost: number;
  
  /** Player production multiplier */
  player_production: number;
  
  /** AI production multiplier */
  ai_production: number;
  
  /** Player growth multiplier */
  player_growth: number;
  
  /** AI growth multiplier */
  ai_growth: number;
  
  /** Event frequency multiplier */
  event_multiplier: number;
  
  /** AI starting tech bonus (extra techs) */
  ai_starting_techs: number;
  
  /** AI starting fleet bonus */
  ai_starting_fleet: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  simple: {
    player_research_cost: 0.75,
    ai_research_cost: 1.50,
    player_production: 1.25,
    ai_production: 0.75,
    player_growth: 1.25,
    ai_growth: 0.75,
    event_multiplier: 0.5,
    ai_starting_techs: 0,
    ai_starting_fleet: 0
  },
  easy: {
    player_research_cost: 0.90,
    ai_research_cost: 1.25,
    player_production: 1.10,
    ai_production: 0.90,
    player_growth: 1.10,
    ai_growth: 0.90,
    event_multiplier: 0.75,
    ai_starting_techs: 0,
    ai_starting_fleet: 0
  },
  average: {
    player_research_cost: 1.0,
    ai_research_cost: 1.0,
    player_production: 1.0,
    ai_production: 1.0,
    player_growth: 1.0,
    ai_growth: 1.0,
    event_multiplier: 1.0,
    ai_starting_techs: 0,
    ai_starting_fleet: 0
  },
  hard: {
    player_research_cost: 1.0,
    ai_research_cost: 0.75,
    player_production: 0.90,
    ai_production: 1.25,
    player_growth: 0.90,
    ai_growth: 1.25,
    event_multiplier: 1.25,
    ai_starting_techs: 2,
    ai_starting_fleet: 2
  },
  impossible: {
    player_research_cost: 1.0,
    ai_research_cost: 0.50,
    player_production: 0.75,
    ai_production: 1.50,
    player_growth: 0.75,
    ai_growth: 1.50,
    event_multiplier: 1.50,
    ai_starting_techs: 4,
    ai_starting_fleet: 5
  }
};
```

---

## 11. Data Validation Rules

### 11.1 General Validation

```typescript
interface ValidationRules {
  /** All IDs must be unique within their category */
  unique_ids: boolean;
  
  /** All references must point to existing entities */
  valid_references: boolean;
  
  /** Numerical values must be within specified bounds */
  bounded_values: boolean;
  
  /** Required fields must be present */
  required_fields: boolean;
  
  /** Enums must use valid values */
  valid_enums: boolean;
}

const VALIDATION_BOUNDS = {
  tech_tier: { min: 1, max: 50 },
  tech_cost: { min: 50, max: 200000 },
  weapon_damage: { min: 1, max: 10000 },
  ship_space: { min: 50, max: 2500 },
  modifier_percentage: { min: -100, max: 200 },
  probability: { min: 0, max: 1 },
  population: { min: 0, max: 999 },
  turn_number: { min: 1, max: 9999 }
};
```

### 11.2 Cross-Reference Validation

```typescript
/** Validates that all tech prerequisites exist */
function validateTechPrerequisites(techs: Technology[]): ValidationResult;

/** Validates that all starting techs exist for each race */
function validateRaceStartingTechs(races: Race[], techs: Technology[]): ValidationResult;

/** Validates that weapon/component tech_levels match available technologies */
function validateComponentTechLevels(components: ShipComponent[], techs: Technology[]): ValidationResult;

/** Validates colony slider values sum to 100 */
function validateSliderAllocation(sliders: ColonySliders): ValidationResult;

/** Validates fleet ships reference valid designs */
function validateFleetShips(fleet: Fleet, designs: ShipDesign[]): ValidationResult;
```

---

## 12. Usage Examples

### 12.1 Loading Race Data

```typescript
import raceData from './data/races.json';

function loadRaces(): Race[] {
  const races: Race[] = raceData.races;
  
  // Validate all races
  for (const race of races) {
    if (!validateRace(race)) {
      throw new Error(`Invalid race data: ${race.id}`);
    }
  }
  
  return races;
}

function getRaceById(id: RaceId): Race | undefined {
  return loadRaces().find(r => r.id === id);
}
```

### 12.2 Creating a New Ship Design

```typescript
function createShipDesign(
  name: string,
  shipClass: ShipClass,
  engine: EntityId,
  weapons: WeaponMount[],
  components: ShipComponent[]
): ShipDesign {
  const classStats = SHIP_CLASS_STATS[shipClass];
  const engineComponent = getComponent(engine) as Engine;
  
  // Calculate space usage
  let spaceUsed = engineComponent.space;
  for (const weapon of weapons) {
    const weaponStats = getWeapon(weapon.weapon_id);
    spaceUsed += weaponStats.space * weapon.count;
  }
  for (const component of components) {
    spaceUsed += component.space;
  }
  
  if (spaceUsed > classStats.space) {
    throw new Error(`Design exceeds available space: ${spaceUsed}/${classStats.space}`);
  }
  
  return {
    id: generateId(),
    name,
    ship_class: shipClass,
    engine,
    weapons,
    specials: components.map(c => c.id),
    armor: "titanium", // Default
    space_used: spaceUsed,
    total_cost: calculateDesignCost(weapons, components, engineComponent),
    effective_hp: classStats.base_hp
  };
}
```

### 12.3 Processing a Turn

```typescript
async function processTurn(gameState: GameState): Promise<GameState> {
  let newState = { ...gameState };
  
  // Process each empire
  for (const empire of newState.empires) {
    if (empire.eliminated) continue;
    
    // Process colonies
    for (const colonyId of empire.colonies) {
      const colony = getColony(newState, colonyId);
      
      // Population growth
      const growth = calculatePopulationGrowth(colony, empire);
      colony.population = Math.min(
        colony.population + growth.integer,
        colony.max_population
      );
      colony.fractional_pop = growth.fractional;
      
      // Production
      const production = calculateProduction(colony, empire);
      processProduction(colony, production);
      
      // Research contribution
      empire.research.progress = addResearchProgress(
        empire.research.progress,
        calculateColonyResearch(colony, empire)
      );
    }
    
    // Check for tech completion
    checkTechCompletion(empire);
    
    // Process fleet movement
    for (const fleet of empire.fleets) {
      if (fleet.destination) {
        processFleetMovement(fleet);
      }
    }
  }
  
  // Process diplomacy
  updateRelationships(newState);
  
  // Random events
  const event = rollForRandomEvent(newState.turn, gameState.meta.difficulty);
  if (event) {
    newState = applyEvent(newState, event);
  }
  
  // Check victory conditions
  checkVictoryConditions(newState);
  
  newState.turn++;
  return newState;
}
```

---

## 13. File Organization

### 13.1 Recommended Data File Structure

```
data/
├── races/
│   └── races.json           # All 10 race definitions
├── technology/
│   ├── weapons.json         # Weapons tech tree
│   ├── propulsion.json      # Propulsion tech tree
│   ├── construction.json    # Construction tech tree
│   ├── computers.json       # Computers tech tree
│   ├── force_fields.json    # Force fields tech tree
│   └── planetology.json     # Planetology tech tree
├── ships/
│   ├── weapons.json         # All weapon components
│   ├── components.json      # All ship components
│   └── classes.json         # Ship class definitions
├── planets/
│   ├── environments.json    # Environment stats
│   └── specials.json        # Planet specials
├── diplomacy/
│   ├── treaties.json        # Treaty definitions
│   └── actions.json         # Diplomatic actions
├── events/
│   ├── random_events.json   # All random events
│   └── space_monsters.json  # Monster definitions
└── config/
    ├── constants.json       # Game constants
    ├── difficulty.json      # Difficulty settings
    └── balance.json         # Balance parameters
```

---

## Related Documents

- `AGENTS.md` - Project conventions
- `design/species/race-stats-complete.md` - Complete race data
- `design/ships/weapons-complete.md` - Complete weapon data
- `design/ships/components-complete.md` - Complete component data
- `design/technology/*.md` - Tech tree specifications
- `design/game-mechanics/random-events.md` - Event system
- `design/diplomacy/relationship-formulas.md` - Diplomacy mechanics

---

*Document Version: 1.0*
*Last Updated: 2026-03-22*
*Specification: spec-025 - JSON Data Schemas*
