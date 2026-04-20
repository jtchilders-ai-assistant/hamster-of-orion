/**
 * GameState type definitions — pure TypeScript, NO DOM.
 * Derived from design/technical/data-structures.md
 */

// ── ID types ──────────────────────────────────────────────────────────────────

export type SystemId = string;
export type PlanetId = string;
export type FleetId = string;
export type ShipId = string;
export type ShipDesignId = string;
export type EmpireId = string;
export type TechId = string;
export type BuildingId = string;
export type RaceId = string;
export type CombatId = string;

// ── Enumerations ──────────────────────────────────────────────────────────────

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'impossible' | 'custom';
export type GameSpeed = 'slow' | 'normal' | 'fast';
export type VictoryType = 'domination' | 'discovery' | 'diplomatic' | 'survival' | 'transcendence';
export type ScreenType =
  | 'menu'
  | 'new_game'
  | 'galaxy'
  | 'planet'
  | 'planet_list'
  | 'fleet'
  | 'research'
  | 'diplomacy'
  | 'ship_design'
  | 'reports'
  | 'council'
  | 'combat';

export type GalaxySize = 'small' | 'medium' | 'large' | 'huge';
export type GalaxyShape = 'spiral' | 'elliptical' | 'irregular';
export type StarType = 'yellow' | 'green' | 'red' | 'blue' | 'white' | 'purple';

export type PlanetType =
  | 'terran' | 'ocean' | 'jungle' | 'arid' | 'tundra'
  | 'toxic' | 'radiated' | 'barren' | 'dead' | 'gas_giant'
  | 'gaia' | 'steppe' | 'desert' | 'minimal' | 'inferno';

export type ResourceLevel = 'ultra_poor' | 'poor' | 'normal' | 'rich' | 'ultra_rich';
export type GalaxyRegion = 'safe_zones' | 'wild_pellet_fields' | 'dark_sectors' | 'omega_sector';
export type PlanetSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge';
export type Morale = 'ecstatic' | 'happy' | 'content' | 'unrest' | 'rebellion';
export type MonsterType = 'amoeba' | 'crystal' | 'dragon';
export type BuildingCategory = 'production' | 'research' | 'defense' | 'growth' | 'morale' | 'special';

export type ShipClass = 'small' | 'medium' | 'large' | 'huge';
export type ComponentType = 'weapon' | 'armor' | 'shield' | 'engine' | 'computer' | 'special' | 'fuel';
export type WeaponType = 'beam' | 'missile' | 'bomb' | 'special';
export type ExperienceLevel = 'green' | 'regular' | 'veteran' | 'elite' | 'legendary';

export type TechField = 'weapons' | 'propulsion' | 'construction' | 'computers' | 'force_fields' | 'biotechnology';

export type DiplomaticState = 'war' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';
export type TreatyType = 'peace' | 'non_aggression' | 'trade' | 'research' | 'military_alliance' | 'defensive_pact';

export type CombatPhase = 'initiative' | 'movement' | 'firing' | 'special' | 'resolution';
export type HexType = 'empty' | 'asteroid' | 'nebula' | 'planet';
export type CombatStatus = 'cloaked' | 'stunned' | 'disabled' | 'repaired';

export type PersonalityType = 'aggressive' | 'scientific' | 'diplomatic' | 'expansionist' | 'builder' | 'balanced' | 'erratic';
export type AITrait = 'honorable' | 'backstabber' | 'logical' | 'xenophobic' | 'tech_trader' | 'war_monger' | 'peaceful';
export type StrategyGoal = 'survival' | 'expansion' | 'tech_advantage' | 'military_supremacy' | 'diplomatic_victory' | 'discovery' | 'transcendence';
export type TargetPriority = 'ignore' | 'low' | 'medium' | 'high' | 'critical';

export type NotificationType = 'research' | 'production' | 'combat' | 'diplomacy' | 'event' | 'warning' | 'error';

// ── Coordinates ───────────────────────────────────────────────────────────────

export interface HexCoord {
  x: number;
  y: number;
}

export interface GalaxyCoord {
  x: number;
  y: number;
}

// ── Spatial Index ───────────────────────────────────────────────────────────────

export interface QuadTreeNode {
  bounds: { x: number; y: number; width: number; height: number };
  systemIds: SystemId[];
  children: QuadTreeNode[] | null;  // null = leaf node
}

// ── Region ────────────────────────────────────────────────────────────────────

export interface Region {
  centerX: number;
  centerY: number;
  radius: number;
}

// ── Galaxy & Star Systems ─────────────────────────────────────────────────────

export interface StarSystem {
  id: SystemId;
  name: string;
  coordinates: GalaxyCoord;

  starType: StarType;
  starClass: string;

  planetIds: PlanetId[];
  ownerId: EmpireId | null;

  hasAsteroids: boolean;
  hasNebula: boolean;
  nebulaId: string | null;
  hasWormhole: boolean;
  wormholeTarget: SystemId | null;

  fleetIds: FleetId[];

  isOrion: boolean;
  hasGuardian: boolean;
  hasArtifacts: boolean;
  hasSpaceMonster: MonsterType | null;

  region: GalaxyRegion;
  clusterId: string | null;
}

export interface Nebula {
  id: string;
  centerX: number;
  centerY: number;
  radius: number;
  starIds: SystemId[];
}

export interface Cluster {
  id: string;
  centerStarId: SystemId;
  memberStarIds: SystemId[];
  region: GalaxyRegion;
}

export interface Galaxy {
  id: string;
  size: GalaxySize;
  shape: GalaxyShape;
  width: number;
  height: number;
  systemCount: number;

  systems: {
    byId: Record<SystemId, StarSystem>;
    allIds: SystemId[];
  };

  // Spatial index for fast lookups
  quadTree: QuadTreeNode;

  nebulae: Nebula[];
  clusters: Cluster[];
  artifactsSystemIds: SystemId[];

  orionSystemId: SystemId;
  homeSystemIds: Record<EmpireId, SystemId>;
  fogOfWar: Record<EmpireId, SystemId[]>;  // Unexplored systems per empire
}

// ── Planets & Colonies ────────────────────────────────────────────────────────

export interface PlanetProduction {
  ship: number;      // 0-100%
  defense: number;   // 0-100%
  industry: number;  // 0-100%
  ecology: number;   // 0-100%
  research: number;  // 0-100%
}

export interface BuildQueueItem {
  type: 'ship' | 'building' | 'defense' | 'industry';
  targetId: string;
  targetName: string;
  costTotal: number;
  costRemaining: number;
  turnsRemaining: number;
}

export interface Planet {
  id: PlanetId;
  name: string;
  systemId: SystemId;
  orbit: number;

  type: PlanetType;
  size: PlanetSize;
  gravity: number;

  ownerId: EmpireId | null;
  isColonized: boolean;
  isHomeworld: boolean;

  population: number;
  maxPopulation: number;
  growthRate: number;
  morale: Morale;

  factories: number;
  maxFactories: number;
  waste: number;

  production: PlanetProduction;
  buildQueue: BuildQueueItem[];
  buildings: BuildingId[];

  missileBases: number;
  maxMissileBases: number;
  planetaryShield: number;

  isRich: boolean;
  isPoor: boolean;
  isGaia: boolean;
  hasArtifacts: boolean;

  // Shipyard construction state
  /** The design currently being built at this planet's shipyard (null = nothing queued). */
  currentDesignId: ShipDesignId | null;
  /** BC accumulated toward the current ship design this turn and prior turns. */
  shipyardProgress: number;

  // Galaxy generation metadata
  resourceLevel: ResourceLevel;
  researchMultiplier: number;
  startingPopulation: number | null;
  startingFactories: number | null;
}

export interface BuildingEffect {
  type: 'production_multiplier' | 'research_multiplier' | 'growth_rate' | 'max_population' | 'shield' | 'factory_efficiency' | 'waste_reduction';
  value: number;
}

export interface Building {
  id: string;
  name: string;
  category: BuildingCategory;
  cost: number;
  maintenance: number;
  requiredTech: TechId[];
  requiredBuildings: BuildingId[];
  effects: BuildingEffect[];
  onePerPlanet: boolean;
  onePerEmpire: boolean;
  description: string;
  icon: string;
}

// ── Fleets & Ships ────────────────────────────────────────────────────────────

export type FleetOrder =
  | { type: 'none' }
  | { type: 'move'; target: SystemId }
  | { type: 'patrol'; systems: SystemId[] }
  | { type: 'explore'; region: Region }
  | { type: 'attack'; target: FleetId }
  | { type: 'bombard'; target: PlanetId }
  | { type: 'invade'; target: PlanetId }
  | { type: 'merge'; target: FleetId }
  | { type: 'retreat' };

export interface Fleet {
  id: FleetId;
  name: string;
  ownerId: EmpireId;

  shipIds: ShipId[];
  systemId: SystemId;

  destination: SystemId | null;
  eta: number;            // turns until arrival (0 = not moving or arrived)
  route: SystemId[];
  movementPoints: number;
  maxMovement: number;

  orders: FleetOrder;
  experience: ExperienceLevel;
  isInCombat: boolean;
  combatId: CombatId | null;
}

export interface SystemStatus {
  isActive: boolean;
  cooldownRemaining: number;
  energyRemaining: number;
}

export interface Ship {
  id: ShipId;
  name: string;
  designId: ShipDesignId;
  ownerId: EmpireId;
  fleetId: FleetId;

  hp: number;
  maxHp: number;
  shieldHp: number;
  maxShieldHp: number;

  experience: ExperienceLevel;
  kills: number;

  combatPosition: HexCoord | null;
  hasActed: boolean;

  specialSystems: Record<string, SystemStatus>;
}

export interface ShipComponent {
  id: string;
  type: ComponentType;
  name: string;
  space: number;
  baseCost: number;
  count: number;
}

export interface WeaponSummary {
  name: string;
  damage: string;
  range: number;
  type: WeaponType;
}

export interface DefenseSummary {
  armor: number;
  shields: number;
  ecm: number;
}

export interface SpecialAbility {
  name: string;
  description: string;
}

export interface ShipDesignStats {
  cost: number;
  maintenance: number;
  hp: number;
  shieldHp: number;
  speed: number;
  range: number;
  weapons: WeaponSummary[];
  defense: DefenseSummary;
  special: SpecialAbility[];
}

export interface ShipDesign {
  id: ShipDesignId;
  name: string;
  class: ShipClass;
  ownerId: EmpireId;

  size: number;
  spaceUsed: number;
  spaceFree: number;

  components: ShipComponent[];
  stats: ShipDesignStats;
  miniaturization: Record<TechId, number>;

  isObsolete: boolean;
  shipsBuilt: number;
}

// ── Research & Technology ─────────────────────────────────────────────────────

export interface RacialBonus {
  type: 'cost_reduction' | 'effectiveness_boost' | 'miniaturization' | 'special_unlock';
  value: number;
  description: string;
}

export interface TechPrerequisite {
  field: TechField;
  minTier: number;
}

export interface TechUnlock {
  type: 'weapon' | 'armor' | 'shield' | 'engine' | 'building' | 'ship_system' | 'planet_bonus' | 'general_bonus';
  id: string;
  name: string;
}

export interface Technology {
  id: TechId;
  name: string;
  field: TechField;
  tier: number;
  baseCost: number;
  prerequisites: TechPrerequisite[];
  unlocks: TechUnlock[];
  racialBonuses: Record<RaceId, RacialBonus>;
  description: string;
  icon: string;
  category: string;
}

export interface StolenTech {
  techId: TechId;
  fromEmpire: EmpireId;
  turn: number;
}

export interface ResearchState {
  currentTech: TechId | null;
  researchPoints: number;
  researchPerTurn: number;
  completedTechs: TechId[];
  availableTechs: Record<TechField, TechId[]>;
  miniaturization: Record<TechId, number>;
  stolenTechs: StolenTech[];
}

// ── Diplomacy ─────────────────────────────────────────────────────────────────

export interface TreatyTerms {
  /** Fixed base income per turn (used by trade treaties, before ramp-up). */
  tradeIncome?: number;
  researchBonus?: number;
  mustDefend?: boolean;
  mustJoinWars?: boolean;
  sharedIntelligence?: boolean;
  nonAggressionDuration?: number;
  breakPenalty?: number;
}

export interface Treaty {
  id: string;
  type: TreatyType;
  signedTurn: number;
  duration: number | null;
  terms: TreatyTerms;
  isActive: boolean;
  canBreak: boolean;
  /** Turns since a trade agreement was signed (for ramp-up calculation). */
  tradeRampTurns?: number;
}

export interface DiplomaticEvent {
  turn: number;
  type: string;
  impact: number;
  description: string;
}

/** A temporary modifier applied to a diplomatic relation (e.g., after an attack). */
export interface RelationModifier {
  /** Human-readable reason for the modifier. */
  reason: string;
  /** Change in relation value; added to running total each turn. */
  amount: number;
  /** Turn at which this modifier expires (undefined = permanent). */
  expiresAtTurn?: number;
}

export interface DiplomaticRelations {
  empireA: EmpireId;
  empireB: EmpireId;
  value: number;
  state: DiplomaticState;
  treaties: Treaty[];
  events: DiplomaticEvent[];
  warStartTurn: number | null;
  lastContact: number;
  /** Pending modifiers applied to the relation value. */
  modifiers: RelationModifier[];
}

export interface CouncilVote {
  turn: number;
  candidates: EmpireId[];
  results: Record<EmpireId, number>;
  winner: EmpireId | null;
  votes: Record<EmpireId, EmpireId>;
}

export interface HighCouncil {
  isActive: boolean;
  formationTurn: number;
  nextVoteTurn: number;
  voteFrequency: number;
  voteHistory: CouncilVote[];
  voteShares: Record<EmpireId, number>;
}

// ── Empire ────────────────────────────────────────────────────────────────────

export interface Empire {
  id: EmpireId;
  raceId: RaceId;
  name: string;
  isPlayer: boolean;

  credits: number;
  creditPerTurn: number;

  planets: PlanetId[];
  fleets: FleetId[];
  shipDesigns: ShipDesignId[];

  scannerTechLevel: number;  // 0 = basic, +1 per upgrade; used for sensor range

  research: ResearchState;
  relations: Record<EmpireId, DiplomaticRelations>;

  // Exploration state
  exploredSystems: SystemId[];  // Systems the empire has visited/discovered
  visibleSystems: SystemId[];   // Systems currently visible (explored + in sensor range)

  isDefeated: boolean;
  defeatedTurn: number | null;
}

// ── AI Empire ───────────────────────────────────────────────────────────────

export interface AIPersonality {
  type: PersonalityType;
  aggression: number;      // 0-100
  expansionism: number;    // 0-100
  diplomacy: number;       // 0-100
  research: number;        // 0-100
  traits: AITrait[];
}

export interface AIStrategy {
  primary: StrategyGoal;
  secondary: StrategyGoal;

  economicFocus: 'production' | 'research' | 'growth';
  militaryStance: 'defensive' | 'neutral' | 'aggressive';
  diplomaticGoal: 'isolation' | 'alliances' | 'domination';

  targetEmpires: Record<EmpireId, TargetPriority>;
  targetSystems: SystemId[];

  lastEvaluation: number;   // Turn
  nextEvaluation: number;   // Turn
}

export interface AIMemory {
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

export interface AIWeights {
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

export interface AIEmpire {
  id: EmpireId;
  raceId: RaceId;
  empireName: string;
  personality: AIPersonality;
  strategy: AIStrategy;
  memory: AIMemory;
  weights: AIWeights;
}

// ── Combat ────────────────────────────────────────────────────────────────────

export interface CombatShip {
  shipId: ShipId;
  position: HexCoord;
  hp: number;
  shieldHp: number;
  hasActed: boolean;
  statuses: CombatStatus[];
}

export interface CombatParticipant {
  empireId: EmpireId;
  fleetIds: FleetId[];
  ships: CombatShip[];
  hasRetreated: boolean;
}

export interface HexTile {
  coord: HexCoord;
  type: HexType;
  shipId: ShipId | null;
}

export interface HexGrid {
  width: number;
  height: number;
  hexes: Record<string, HexTile>;
}

export interface ShipLoss {
  shipId: ShipId;
  designName: string;
  killer: ShipId | null;
}

export interface Combat {
  id: CombatId;
  systemId: SystemId;
  turn: number;
  participants: Record<EmpireId, CombatParticipant>;
  grid: HexGrid;
  combatTurn: number;
  phase: CombatPhase;
  currentUnit: ShipId | null;
  turnOrder: ShipId[];
  isFinished: boolean;
  victor: EmpireId | null;
  casualties: Record<EmpireId, ShipLoss[]>;
  salvage: number;
  experienceGained: Record<ShipId, number>;
}

// ── UI State ──────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: NotificationType;
  priority: 'critical' | 'important' | 'info';
  title: string;
  message: string;
  actions?: Array<{ label: string; actionType: string }>;
  dismissable: boolean;
  autoDismiss: number | null;
  timestamp: number;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  particleEffects: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  showGrid: boolean;
  autosave: boolean;
  autosaveFrequency: number;
  autoEndTurn: boolean;
  confirmEndTurn: boolean;
  showTutorials: boolean;
  colorBlindMode: boolean;
  textSize: number;
  highContrast: boolean;
  screenReaderEnabled: boolean;
  customHotkeys: Record<string, string>;
}

export interface UIState {
  currentScreen: ScreenType;
  previousScreen: ScreenType | null;

  selectedSystem: SystemId | null;
  selectedPlanet: PlanetId | null;
  selectedFleet: FleetId | null;
  selectedShip: ShipId | null;

  camera: {
    x: number;
    y: number;
    zoom: number;
    target: SystemId | null;
  };

  modals: {
    shipDesigner: { open: boolean; designId?: ShipDesignId };
    diplomacy: { open: boolean; empireId?: EmpireId };
    combat: { open: boolean; combatId?: CombatId };
    victory: { open: boolean; victoryType?: VictoryType };
  };

  notifications: Notification[];

  filters: {
    planetsSort: 'name' | 'population' | 'production' | 'location';
    fleetsFilter: 'all' | 'military' | 'scouts' | 'idle';
  };

  settings: GameSettings;
}

// ── Root Game State ───────────────────────────────────────────────────────────

export interface GameState {
  version: string;
  seed: string;
  turn: number;
  year: number;
  difficulty: DifficultyLevel;
  isPaused: boolean;
  gameSpeed: GameSpeed;
  currentScreen: ScreenType;

  victoryCondition: VictoryType | null;
  defeatedTurn: number | null;

  createdAt: number;
  lastPlayed: number;
  playTime: number;

  galaxy: Galaxy;

  planets: {
    byId: Record<PlanetId, Planet>;
    allIds: PlanetId[];
  };

  fleets: {
    byId: Record<FleetId, Fleet>;
    allIds: FleetId[];
  };

  ships: {
    byId: Record<ShipId, Ship>;
    allIds: ShipId[];
  };

  shipDesigns: {
    byId: Record<ShipDesignId, ShipDesign>;
    allIds: ShipDesignId[];
  };

  empires: {
    byId: Record<EmpireId, Empire>;
    allIds: EmpireId[];
    playerId: EmpireId;
  };

  combats: {
    byId: Record<CombatId, Combat>;
    allIds: CombatId[];
    activeCombatId: CombatId | null;
  };

  // AI state (keyed by EmpireId for non-player empires)
  aiEmpires: Record<EmpireId, AIEmpire>;

  highCouncil: HighCouncil | null;

  ui: UIState;
}
