# Data Structures & Models

## Overview

Complete data models for all game entities in Hamster of Orion. These structures are designed for use with Redux/Immer state management.

---

## Core Game State

### Game Meta-State

```typescript
interface GameState {
  version: string;              // '1.0.0'
  seed: string;                 // Random seed for reproducibility
  turn: number;                 // Current turn (starts at 1)
  year: number;                 // 2500 + turn
  difficulty: DifficultyLevel;  // 'easy' | 'normal' | 'hard' | 'impossible' | 'custom'
  isPaused: boolean;
  gameSpeed: GameSpeed;         // 'slow' | 'normal' | 'fast'
  currentScreen: ScreenType;    // 'menu' | 'galaxy' | 'planet' | 'fleet' | etc.

  // Victory tracking
  victoryCondition: VictoryType | null;  // null until won
  defeatedTurn: number | null;           // Turn of defeat if lost

  // Timestamps
  createdAt: number;            // Unix timestamp
  lastPlayed: number;           // Unix timestamp
  playTime: number;             // Total seconds played
}

type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'impossible' | 'custom';
type GameSpeed = 'slow' | 'normal' | 'fast';
type VictoryType = 'domination' | 'discovery' | 'diplomatic' | 'survival' | 'transcendence';
```

---

## Galaxy & Star Systems

### Galaxy

```typescript
interface Galaxy {
  id: string;
  size: GalaxySize;             // 'small' | 'medium' | 'large' | 'huge'
  shape: GalaxyShape;           // 'spiral' | 'elliptical' | 'irregular'
  width: number;                // Grid width in sectors
  height: number;               // Grid height in sectors
  systemCount: number;          // Total systems

  // Systems normalized
  systems: {
    byId: Record<SystemId, StarSystem>;
    allIds: SystemId[];
  };

  // Spatial index for fast lookups
  quadTree: QuadTreeNode;

  // Special locations
  orionSystemId: SystemId;
  homeSystemIds: Record<EmpireId, SystemId>;

  // Exploration
  fogOfWar: Record<EmpireId, Set<SystemId>>;  // Unexplored systems per empire
}

type GalaxySize = 'small' | 'medium' | 'large' | 'huge';
type GalaxyShape = 'spiral' | 'elliptical' | 'irregular';
type SystemId = string;  // 'sys_001'
type EmpireId = string;  // 'emp_001' or 'player'
```

### Star System

```typescript
interface StarSystem {
  id: SystemId;
  name: string;                // 'Sol', 'Alpha Centauri', etc.
  coordinates: { x: number; y: number };  // Galaxy position

  // Star properties
  starType: StarType;          // 'red' | 'orange' | 'yellow' | 'white' | 'blue'
  starClass: string;           // 'M5', 'G2', 'B1', etc.

  // Planets
  planetIds: PlanetId[];       // 0-6 planets

  // Control
  ownerId: EmpireId | null;    // Who owns the system (based on planets)

  // Features
  hasAsteroids: boolean;
  hasNebula: boolean;
  hasWormhole: boolean;
  wormholeTarget: SystemId | null;

  // Fleet presence
  fleetIds: FleetId[];         // Fleets currently in system

  // Special
  isOrion: boolean;            // The center of the galaxy
  hasGuardian: boolean;        // Orion only
  hasArtifacts: boolean;       // Ancient ruins
  hasSpaceMonster: MonsterType | null;  // 'amoeba' | 'crystal' | 'dragon' | null
}

type StarType = 'red' | 'orange' | 'yellow' | 'white' | 'blue';
type PlanetId = string;  // 'pla_001'
type FleetId = string;   // 'flt_001'
type MonsterType = 'amoeba' | 'crystal' | 'dragon' | null;
```

---

## Planets & Colonies

### Planet

```typescript
interface Planet {
  id: PlanetId;
  name: string;                // 'Earth', 'Mars', etc.
  systemId: SystemId;
  orbit: number;               // 1-6 (distance from star)

  // Physical properties
  type: PlanetType;
  size: PlanetSize;
  gravity: number;             // 0.5 - 2.0 (Earth = 1.0)

  // Colonization
  ownerId: EmpireId | null;
  isColonized: boolean;
  isHomeworld: boolean;

  // Population
  population: number;          // In millions
  maxPopulation: number;       // Capacity based on type + size + tech
  growthRate: number;          // % per turn
  morale: Morale;              // 'ecstatic' | 'happy' | 'content' | 'unrest' | 'rebellion'

  // Economy
  factories: number;
  maxFactories: number;        // Based on population
  waste: number;               // Pollution

  // Production (MOO1 sliders)
  production: {
    ship: number;              // 0-100%
    defense: number;           // 0-100%
    industry: number;          // 0-100%
    ecology: number;           // 0-100%
    research: number;          // 0-100%
  };

  // Build queue
  buildQueue: BuildQueueItem[];

  // Buildings
  buildings: BuildingId[];

  // Defense
  missileBases: number;
  maxMissileBases: number;     // Typically 10
  planetaryShield: number;     // Shield strength (0 if no shield)

  // Special properties
  isRich: boolean;             // +50% production
  isPoor: boolean;             // -25% production
  isGaia: boolean;             // Perfect world
  hasArtifacts: boolean;       // +50% research
}

type PlanetType = 'terran' | 'ocean' | 'jungle' | 'arid' | 'tundra' |
                  'toxic' | 'radiated' | 'barren' | 'dead' | 'gas_giant';
type PlanetSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge';
type Morale = 'ecstatic' | 'happy' | 'content' | 'unrest' | 'rebellion';
type BuildingId = string;  // 'bld_001'

interface BuildQueueItem {
  type: 'ship' | 'building' | 'defense' | 'industry';
  targetId: string;          // ShipDesignId or BuildingId
  targetName: string;        // Display name
  costTotal: number;         // Total BC cost
  costRemaining: number;     // BC left to pay
  turnsRemaining: number;    // Estimated turns
}
```

### Building

```typescript
interface Building {
  id: string;                  // 'automated_factories'
  name: string;                // 'Automated Factories III'
  category: BuildingCategory;
  cost: number;                // BC to build
  maintenance: number;         // BC per turn

  // Requirements
  requiredTech: TechId[];
  requiredBuildings: BuildingId[];

  // Effects
  effects: BuildingEffect[];

  // Restrictions
  onePerPlanet: boolean;
  onePerEmpire: boolean;

  // Display
  description: string;
  icon: string;
}

type BuildingCategory = 'production' | 'research' | 'defense' | 'growth' | 'morale' | 'special';

interface BuildingEffect {
  type: 'production_multiplier' | 'research_multiplier' | 'growth_rate' |
        'max_population' | 'shield' | 'factory_efficiency' | 'waste_reduction';
  value: number;
}

// Examples
const BUILDINGS: Building[] = [
  {
    id: 'automated_factories_1',
    name: 'Automated Factories',
    category: 'production',
    cost: 200,
    maintenance: 2,
    requiredTech: ['robot_controls_1'],
    effects: [{ type: 'factory_efficiency', value: 1.25 }],
    description: '+25% factory efficiency'
  },
  {
    id: 'cloning_center',
    name: 'Cloning Center',
    category: 'growth',
    cost: 300,
    maintenance: 3,
    requiredTech: ['cloning_1'],
    effects: [{ type: 'growth_rate', value: 1.50 }],
    description: '+50% population growth'
  }
];
```

---

## Fleets & Ships

### Fleet

```typescript
interface Fleet {
  id: FleetId;
  name: string;                // 'Battle Group Alpha'
  ownerId: EmpireId;

  // Ships in fleet
  shipIds: ShipId[];

  // Location
  systemId: SystemId;

  // Movement
  destination: SystemId | null;
  route: SystemId[];           // Path to destination
  movementPoints: number;      // Remaining this turn
  maxMovement: number;         // Based on slowest ship

  // Orders
  orders: FleetOrder;

  // Combat
  experience: ExperienceLevel;
  isInCombat: boolean;
  combatId: CombatId | null;
}

type ShipId = string;  // 'shp_001'
type CombatId = string;  // 'cmb_001'
type FleetOrder =
  | { type: 'none' }
  | { type: 'move', target: SystemId }
  | { type: 'patrol', systems: SystemId[] }
  | { type: 'explore', region: Region }
  | { type: 'attack', target: FleetId }
  | { type: 'bombard', target: PlanetId }
  | { type: 'invade', target: PlanetId }
  | { type: 'merge', target: FleetId }
  | { type: 'retreat' };

type ExperienceLevel = 'green' | 'regular' | 'veteran' | 'elite' | 'legendary';
```

### Ship

```typescript
interface Ship {
  id: ShipId;
  name: string;                // 'USS Discovery'
  designId: ShipDesignId;
  ownerId: EmpireId;
  fleetId: FleetId;

  // Current status
  hp: number;
  maxHp: number;
  shieldHp: number;
  maxShieldHp: number;

  // Experience
  experience: ExperienceLevel;
  kills: number;

  // Combat state (in battle only)
  combatPosition: HexCoord | null;
  hasActed: boolean;           // This combat turn

  // Special systems status
  specialSystems: Record<string, SystemStatus>;
}

type ShipDesignId = string;  // 'des_001'

interface SystemStatus {
  isActive: boolean;
  cooldownRemaining: number;   // Turns
  energyRemaining: number;     // Charges
}
```

### Ship Design

```typescript
interface ShipDesign {
  id: ShipDesignId;
  name: string;                // 'Heavy Cruiser Mk1'
  class: ShipClass;
  ownerId: EmpireId;

  // Base properties
  size: number;                // 50, 100, 250, 500, 1000, 1500, 2500
  spaceUsed: number;           // Total component space
  spaceFree: number;           // Remaining space

  // Components
  components: ShipComponent[];

  // Computed stats
  stats: {
    cost: number;              // BC to build
    maintenance: number;       // BC per turn
    hp: number;                // Total hit points
    shieldHp: number;          // Shield strength
    speed: number;             // Parsecs per turn
    range: number;             // Fuel range
    weapons: WeaponSummary[];
    defense: DefenseSummary;
    special: SpecialAbility[];
  };

  // Miniaturization applied
  miniaturization: Record<TechId, number>;  // Tech -> reduction %

  // Status
  isObsolete: boolean;         // Better version exists
  shipsBuilt: number;          // How many built
}

type ShipClass = 'scout' | 'fighter' | 'destroyer' | 'cruiser' |
                 'battle_cruiser' | 'dreadnought' | 'titan';

interface ShipComponent {
  id: string;
  type: ComponentType;
  name: string;
  space: number;               // Space required (after miniaturization)
  baseCost: number;
  count: number;               // How many equipped
}

type ComponentType = 'weapon' | 'armor' | 'shield' | 'engine' |
                     'computer' | 'special' | 'fuel';

interface WeaponSummary {
  name: string;
  damage: string;              // '20×4' or '10-20' etc.
  range: number;
  type: WeaponType;
}

type WeaponType = 'beam' | 'missile' | 'bomb' | 'special';

interface DefenseSummary {
  armor: number;               // HP per space
  shields: number;             // Shield HP
  ecm: number;                 // -% enemy accuracy
}

interface SpecialAbility {
  name: string;
  description: string;
}
```

---

## Research & Technology

### Research State

```typescript
interface ResearchState {
  // Current research
  currentTech: TechId | null;
  researchPoints: number;      // Progress toward current
  researchPerTurn: number;     // RP generation rate

  // Completed techs
  completedTechs: Set<TechId>;

  // Available to research (based on completed)
  availableTechs: Record<TechField, TechId[]>;

  // Miniaturization
  miniaturization: Record<TechId, number>;  // 0.0 to 1.0 (1.0 = 100% reduction)

  // Stolen/traded techs (track source)
  stolenTechs: Array<{
    techId: TechId;
    fromEmpire: EmpireId;
    turn: number;
  }>;
}

type TechField = 'weapons' | 'propulsion' | 'construction' |
                 'computers' | 'force_fields' | 'biotechnology';
```

### Technology

```typescript
interface Technology {
  id: TechId;
  name: string;                // 'Plasma Cannon'
  field: TechField;
  tier: number;                // 1-10

  // Research
  baseCost: number;            // Base RP required

  // Prerequisites (must have ONE tech from this tier)
  prerequisites: {
    field: TechField;
    minTier: number;
  }[];

  // Unlocks
  unlocks: TechUnlock[];

  // Special bonuses
  racialBonuses: Record<RaceId, RacialBonus>;

  // Display
  description: string;
  icon: string;
  category: string;            // 'weapon' | 'building' | 'ship_system' | 'bonus'
}

type TechId = string;  // 'plasma_cannon'
type RaceId = string;  // 'hamsters'

interface TechUnlock {
  type: 'weapon' | 'armor' | 'shield' | 'engine' | 'building' |
        'ship_system' | 'planet_bonus' | 'general_bonus';
  id: string;
  name: string;
}

interface RacialBonus {
  type: 'cost_reduction' | 'effectiveness_boost' | 'miniaturization' | 'special_unlock';
  value: number;
  description: string;
}

// Example
const PLASMA_CANNON: Technology = {
  id: 'plasma_cannon',
  name: 'Plasma Cannon',
  field: 'weapons',
  tier: 3,
  baseCost: 75,
  prerequisites: [
    { field: 'weapons', minTier: 2 }
  ],
  unlocks: [
    { type: 'weapon', id: 'plasma_cannon_weapon', name: 'Plasma Cannon' }
  ],
  racialBonuses: {
    'hamsters': {
      type: 'miniaturization',
      value: 0.05,
      description: '+5% miniaturization from engineering expertise'
    },
    'ferrets': {
      type: 'effectiveness_boost',
      value: 1.10,
      description: '+10% damage from hunter instincts'
    }
  },
  description: 'Advanced energy weapon firing superheated plasma bolts',
  icon: 'plasma_icon.png',
  category: 'weapon'
};
```

---

## Diplomacy

### Diplomatic Relations

```typescript
interface DiplomaticRelations {
  // Bilateral relations between two empires
  empireA: EmpireId;
  empireB: EmpireId;

  // Relation value (-100 to +100)
  value: number;

  // Current state
  state: DiplomaticState;

  // Treaties
  treaties: Treaty[];

  // History
  events: DiplomaticEvent[];

  // Tracking
  warStartTurn: number | null;
  lastContact: number;         // Turn number
}

type DiplomaticState = 'war' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';

interface Treaty {
  id: string;
  type: TreatyType;
  signedTurn: number;
  duration: number | null;     // Null = permanent
  terms: TreatyTerms;

  // Status
  isActive: boolean;
  canBreak: boolean;           // Cooling period
}

type TreatyType = 'peace' | 'non_aggression' | 'trade' | 'research' |
                  'military_alliance' | 'defensive_pact';

interface TreatyTerms {
  // Trade agreement
  tradeIncome?: {
    toEmpireA: number;         // BC per turn
    toEmpireB: number;
  };

  // Research agreement
  researchBonus?: number;      // +% research speed

  // Military terms
  mustDefend?: boolean;
  mustJoinWars?: boolean;
  sharedIntelligence?: boolean;

  // Additional clauses
  nonAggressionDuration?: number;
  breakPenalty?: number;       // Relations hit
}

interface DiplomaticEvent {
  turn: number;
  type: string;                // 'war_declared' | 'treaty_signed' | 'betrayal' | etc.
  impact: number;              // Relations change
  description: string;
}
```

### High Council

```typescript
interface HighCouncil {
  isActive: boolean;
  formationTurn: number;

  // Next vote
  nextVoteTurn: number;
  voteFrequency: number;       // Turns between votes

  // Vote tracking
  voteHistory: CouncilVote[];

  // Current standings
  voteShares: Record<EmpireId, number>;  // % of galactic population
}

interface CouncilVote {
  turn: number;
  candidates: EmpireId[];
  results: Record<EmpireId, number>;  // Empire -> % votes received
  winner: EmpireId | null;     // Null if no 67% majority

  // Vote details
  votes: Record<EmpireId, EmpireId>;  // Who voted for whom
}
```

---

## Combat

### Combat Instance

```typescript
interface Combat {
  id: CombatId;
  systemId: SystemId;
  turn: number;                // Game turn when started

  // Participants
  participants: {
    [empireId: EmpireId]: CombatParticipant;
  };

  // Battle grid
  grid: HexGrid;

  // State
  combatTurn: number;          // Combat turn (within battle)
  phase: CombatPhase;
  currentUnit: ShipId | null;
  turnOrder: ShipId[];         // Initiative order

  // Results (when finished)
  isFinished: boolean;
  victor: EmpireId | null;
  casualties: Record<EmpireId, ShipLoss[]>;
  salvage: number;             // BC recovered
  experienceGained: Record<ShipId, number>;
}

interface CombatParticipant {
  empireId: EmpireId;
  fleetIds: FleetId[];
  ships: CombatShip[];
  hasRetreated: boolean;
}

interface CombatShip {
  shipId: ShipId;
  position: HexCoord;
  hp: number;
  shieldHp: number;
  hasActed: boolean;

  // Temporary combat status
  statuses: CombatStatus[];
}

interface HexGrid {
  width: number;               // 15
  height: number;              // 15
  hexes: Record<string, HexTile>;  // 'x,y' -> tile
}

interface HexTile {
  coord: HexCoord;
  type: HexType;
  shipId: ShipId | null;
}

type HexType = 'empty' | 'asteroid' | 'nebula' | 'planet';
type HexCoord = { x: number; y: number };
type CombatPhase = 'initiative' | 'movement' | 'firing' | 'special' | 'resolution';
type CombatStatus = 'cloaked' | 'stunned' | 'disabled' | 'repaired';

interface ShipLoss {
  shipId: ShipId;
  designName: string;
  killer: ShipId | null;       // Who destroyed it
}
```

---

## AI Empire

### AI Empire State

```typescript
interface AIEmpire {
  id: EmpireId;
  raceId: RaceId;
  empireName: string;

  // Personality
  personality: AIPersonality;

  // Current strategy
  strategy: AIStrategy;

  // Memory
  memory: AIMemory;

  // Decision weights (adjusted by difficulty)
  weights: AIWeights;
}

interface AIPersonality {
  type: PersonalityType;
  aggression: number;          // 0-100
  expansionism: number;        // 0-100
  diplomacy: number;           // 0-100
  research: number;            // 0-100

  // Behavioral traits
  traits: AITrait[];
}

type PersonalityType = 'aggressive' | 'scientific' | 'diplomatic' |
                       'expansionist' | 'builder' | 'balanced' | 'erratic';
type AITrait = 'honorable' | 'backstabber' | 'logical' | 'xenophobic' |
               'tech_trader' | 'war_monger' | 'peaceful';

interface AIStrategy {
  primary: StrategyGoal;
  secondary: StrategyGoal;

  // Current focus
  economicFocus: 'production' | 'research' | 'growth';
  militaryStance: 'defensive' | 'neutral' | 'aggressive';
  diplomaticGoal: 'isolation' | 'alliances' | 'domination';

  // Targets
  targetEmpires: Record<EmpireId, TargetPriority>;
  targetSystems: SystemId[];

  // Re-evaluation
  lastEvaluation: number;      // Turn
  nextEvaluation: number;      // Turn
}

type StrategyGoal = 'survival' | 'expansion' | 'tech_advantage' |
                    'military_supremacy' | 'diplomatic_victory' |
                    'discovery' | 'transcendence';
type TargetPriority = 'ignore' | 'low' | 'medium' | 'high' | 'critical';

interface AIMemory {
  // Remember player actions
  playerBetrayals: number;
  playerAggression: number;
  playerDiplomacy: number;

  // Strategic memory
  lastWars: Array<{ enemy: EmpireId; outcome: 'won' | 'lost'; turn: number }>;
  failedInvasions: PlanetId[];
  lostSystems: SystemId[];

  // Diplomatic memory
  brokenTreaties: Array<{ empire: EmpireId; turn: number }>;
  receivedHelp: Array<{ empire: EmpireId; type: string; turn: number }>;
}

interface AIWeights {
  // Production allocation preferences
  shipWeight: number;
  defenseWeight: number;
  industryWeight: number;
  ecologyWeight: number;
  researchWeight: number;

  // Research priorities
  weaponsPriority: number;
  propulsionPriority: number;
  constructionPriority: number;
  computersPriority: number;
  forceFieldsPriority: number;
  biotechPriority: number;

  // Military decisions
  fleetSizeThreshold: number;  // When to attack
  threatTolerance: number;     // When threatened
  retreatThreshold: number;    // HP% to retreat
}
```

---

## UI State

### UI State

```typescript
interface UIState {
  // Current view
  currentScreen: ScreenType;
  previousScreen: ScreenType | null;

  // Selections
  selectedSystem: SystemId | null;
  selectedPlanet: PlanetId | null;
  selectedFleet: FleetId | null;
  selectedShip: ShipId | null;

  // Camera (for Galaxy Map)
  camera: {
    x: number;
    y: number;
    zoom: number;              // 0.5 - 2.0
    target: SystemId | null;   // Auto-follow
  };

  // Modal dialogs
  modals: {
    shipDesigner: { open: boolean; designId?: ShipDesignId };
    diplomacy: { open: boolean; empireId?: EmpireId };
    combat: { open: boolean; combatId?: CombatId };
    victory: { open: boolean; victoryType?: VictoryType };
  };

  // Notifications
  notifications: Notification[];

  // Filters/Sorting
  filters: {
    planetsSort: 'name' | 'population' | 'production' | 'location';
    fleetsFilter: 'all' | 'military' | 'scouts' | 'idle';
  };

  // Settings
  settings: GameSettings;
}

type ScreenType = 'menu' | 'galaxy' | 'planet' | 'planet_list' | 'fleet' |
                  'research' | 'diplomacy' | 'ship_design' | 'reports' |
                  'council' | 'combat';

interface Notification {
  id: string;
  type: NotificationType;
  priority: 'critical' | 'important' | 'info';
  title: string;
  message: string;
  actions?: NotificationAction[];
  dismissable: boolean;
  autoDismiss: number | null;  // ms, null = manual only
  timestamp: number;
}

type NotificationType = 'research' | 'production' | 'combat' | 'diplomacy' |
                        'event' | 'warning' | 'error';

interface NotificationAction {
  label: string;
  action: () => void;
}

interface GameSettings {
  // Audio
  masterVolume: number;        // 0-100
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;

  // Graphics
  particleEffects: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  showGrid: boolean;

  // Gameplay
  autosave: boolean;
  autosaveFrequency: number;   // Turns
  autoEndTurn: boolean;
  confirmEndTurn: boolean;
  showTutorials: boolean;

  // Accessibility
  colorBlindMode: boolean;
  textSize: number;            // 100, 125, 150%
  highContrast: boolean;
  screenReaderEnabled: boolean;

  // Hotkeys
  customHotkeys: Record<string, string>;
}
```

---

## Type Utilities

```typescript
// Utility types for type safety

// IDs
type EntityId<T extends string> = string & { __brand: T };
type SystemId = EntityId<'system'>;
type PlanetId = EntityId<'planet'>;
type FleetId = EntityId<'fleet'>;
type ShipId = EntityId<'ship'>;
type EmpireId = EntityId<'empire'>;
// etc.

// Coordinates
type HexCoord = { x: number; y: number };
type GalaxyCoord = { x: number; y: number };

// Ranges
type Percentage = number;     // 0-100
type NormalizedValue = number;  // 0.0-1.0
type RelationValue = number;  // -100 to +100

// Time
type Turn = number;           // Game turn
type Timestamp = number;      // Unix timestamp
```

---

All data structures optimized for Redux with Immer. Next: `rendering-pipeline.md` for graphics implementation.
