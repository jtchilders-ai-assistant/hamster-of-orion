# Technical Architecture

## Overview

Hamster of Orion is a complex turn-based 4X strategy game designed as a web application. This document outlines the technical architecture, technology stack, and implementation approach.

---

## Technology Stack

### Frontend

**Core Framework**:
- **React 18+** (or Vue 3 as alternative)
  - Component-based architecture
  - Hooks for state management
  - Virtual DOM for efficient updates
  - Large ecosystem and community

**Rendering**:
- **HTML5 Canvas** - Galaxy map, tactical combat grid
- **SVG** - UI elements, icons, scalable graphics
- **WebGL** (optional) - Advanced visual effects, particle systems
- **Canvas Rendering Context 2D** - Primary drawing API

**State Management**:
- **Redux Toolkit** (preferred) or **Zustand** (lightweight alternative)
  - Centralized game state
  - Time-travel debugging
  - Predictable state updates
  - Middleware for save/load

**Styling**:
- **CSS Modules** or **Styled Components**
- **Tailwind CSS** (utility-first approach)
- CSS Grid and Flexbox for layouts
- CSS Variables for theming

**Additional Libraries**:
```javascript
// Package.json dependencies
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "redux": "^4.2.0",
  "@reduxjs/toolkit": "^1.9.0",
  "react-redux": "^8.0.0",
  "immer": "^9.0.0",           // Immutable state updates
  "lodash": "^4.17.21",         // Utility functions
  "uuid": "^9.0.0",             // Unique IDs
  "seedrandom": "^3.0.5",       // Seeded random for galaxy generation
  "pathfinding": "^0.4.18",     // Hex pathfinding algorithms
  "lz-string": "^1.5.0"         // Save game compression
}
```

### Backend (Optional)

**For Multiplayer/Cloud Saves** (Phase 2+):
- **Node.js + Express** - REST API
- **Socket.io** - Real-time multiplayer
- **PostgreSQL** - Persistent storage
- **Redis** - Session management, leaderboards

**For Single-Player** (Phase 1):
- No backend required!
- Everything runs client-side
- LocalStorage for saves
- IndexedDB for larger save files

---

## Architecture Pattern

### Core Architecture: Flux Pattern with Redux

```
┌─────────────┐
│   React UI  │ ← Renders game state
└──────┬──────┘
       │ dispatches actions
       ↓
┌─────────────┐
│   Actions   │ ← User interactions, game events
└──────┬──────┘
       │ processed by
       ↓
┌─────────────┐
│  Reducers   │ ← Pure functions updating state
└──────┬──────┘
       │ updates
       ↓
┌─────────────┐
│ Redux Store │ ← Single source of truth
└──────┬──────┘
       │ triggers re-render
       ↓
┌─────────────┐
│   React UI  │
└─────────────┘
```

### Folder Structure

```
hamster-of-orion/
├── public/
│   ├── assets/
│   │   ├── portraits/          # Race leader portraits
│   │   ├── ships/              # Ship sprites
│   │   ├── planets/            # Planet textures
│   │   ├── icons/              # UI icons
│   │   ├── audio/              # Sound effects, music
│   │   └── backgrounds/        # Starfields, nebulae
│   ├── index.html
│   └── manifest.json
│
├── src/
│   ├── components/             # React components
│   │   ├── UI/
│   │   │   ├── MainMenu.jsx
│   │   │   ├── GalaxyMap.jsx
│   │   │   ├── PlanetScreen.jsx
│   │   │   ├── FleetScreen.jsx
│   │   │   ├── ResearchScreen.jsx
│   │   │   ├── DiplomacyScreen.jsx
│   │   │   └── ShipDesigner.jsx
│   │   ├── Combat/
│   │   │   ├── TacticalCombat.jsx
│   │   │   ├── HexGrid.jsx
│   │   │   ├── CombatShip.jsx
│   │   │   └── CombatUI.jsx
│   │   ├── Common/
│   │   │   ├── Button.jsx
│   │   │   ├── Slider.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Notification.jsx
│   │   └── Canvas/
│   │       ├── GalaxyCanvas.jsx
│   │       ├── CombatCanvas.jsx
│   │       └── CanvasRenderer.js
│   │
│   ├── engine/                 # Core game logic
│   │   ├── GameEngine.js       # Main game loop
│   │   ├── TurnProcessor.js    # Turn resolution
│   │   ├── CombatEngine.js     # Battle simulation
│   │   ├── AIEngine.js         # AI decision making
│   │   └── EventSystem.js      # Random events
│   │
│   ├── systems/                # Game systems
│   │   ├── galaxy/
│   │   │   ├── GalaxyGenerator.js
│   │   │   ├── StarSystem.js
│   │   │   └── Planet.js
│   │   ├── fleet/
│   │   │   ├── FleetManager.js
│   │   │   ├── Ship.js
│   │   │   └── ShipDesign.js
│   │   ├── research/
│   │   │   ├── TechTree.js
│   │   │   └── ResearchManager.js
│   │   ├── diplomacy/
│   │   │   ├── DiplomaticEngine.js
│   │   │   ├── Treaty.js
│   │   │   └── Relations.js
│   │   └── economy/
│   │       ├── ProductionManager.js
│   │       └── TradeManager.js
│   │
│   ├── data/                   # Static game data
│   │   ├── races.json          # Race definitions
│   │   ├── technologies.json   # Tech tree data
│   │   ├── ships.json          # Ship class definitions
│   │   ├── buildings.json      # Building definitions
│   │   ├── weapons.json        # Weapon stats
│   │   └── events.json         # Random event definitions
│   │
│   ├── store/                  # Redux store
│   │   ├── store.js
│   │   ├── slices/
│   │   │   ├── gameSlice.js
│   │   │   ├── galaxySlice.js
│   │   │   ├── fleetSlice.js
│   │   │   ├── researchSlice.js
│   │   │   ├── diplomacySlice.js
│   │   │   └── uiSlice.js
│   │   └── middleware/
│   │       ├── saveMiddleware.js
│   │       └── loggerMiddleware.js
│   │
│   ├── utils/                  # Utility functions
│   │   ├── hexGrid.js          # Hex math
│   │   ├── pathfinding.js      # A* for hex grids
│   │   ├── random.js           # Seeded RNG
│   │   ├── calculations.js     # Game calculations
│   │   └── serialization.js    # Save/load helpers
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useGameState.js
│   │   ├── useCanvas.js
│   │   ├── useHotkeys.js
│   │   └── useSound.js
│   │
│   ├── constants/              # Game constants
│   │   ├── gameConfig.js
│   │   ├── uiConstants.js
│   │   └── balanceConstants.js
│   │
│   ├── App.jsx                 # Root component
│   ├── index.js                # Entry point
│   └── styles/
│       ├── global.css
│       ├── themes.css
│       └── variables.css
│
├── tests/                      # Unit & integration tests
│   ├── engine/
│   ├── systems/
│   └── components/
│
├── package.json
├── webpack.config.js
└── README.md
```

---

## Core Systems Architecture

### 1. Game State Management

**Redux Store Structure**:
```javascript
{
  // Game meta-state
  game: {
    turn: 1,
    year: 2500,
    difficulty: 'normal',
    seed: 'abc123',
    isPaused: false,
    currentScreen: 'galaxy',
    gameSpeed: 'normal'
  },

  // Player empire
  player: {
    raceId: 'hamsters',
    empireName: 'Hamster Collective',
    color: '#ffa726',
    treasury: 500,
    score: 0
  },

  // Galaxy state
  galaxy: {
    size: 100,
    shape: 'spiral',
    systems: {
      'sys_001': { id, name, x, y, starType, planets, owner, fleets },
      'sys_002': { ... }
    },
    planets: {
      'pla_001': { id, systemId, type, size, maxPop, currentPop, buildings, production },
      'pla_002': { ... }
    }
  },

  // Fleets and ships
  fleets: {
    byId: {
      'flt_001': { id, ownerId, ships, location, destination, orders },
      'flt_002': { ... }
    },
    allIds: ['flt_001', 'flt_002', ...]
  },

  ships: {
    byId: {
      'shp_001': { id, designId, hp, maxHp, experience, fleetId },
      'shp_002': { ... }
    },
    designs: {
      'des_001': { id, name, class, components, cost, stats }
    }
  },

  // Research state
  research: {
    currentTech: 'plasma_cannon',
    researchPoints: 45,
    completedTechs: ['laser', 'gatling', 'fusion_drive'],
    availableTechs: ['fusion_bomb', 'particle_beam'],
    miniaturization: {
      'laser': 0.90,
      'plasma_cannon': 0.25
    }
  },

  // Diplomacy
  diplomacy: {
    relations: {
      'hamsters-rats': { value: 75, state: 'allied', treaties: [...] },
      'hamsters-guinea_pigs': { value: -85, state: 'war', warStartTurn: 65 }
    },
    treaties: {
      'tre_001': { id, parties, type, signedTurn, terms }
    }
  },

  // AI empires
  empires: {
    byId: {
      'emp_001': { id, raceId, ai: true, personality, strategy, resources },
      'emp_002': { ... }
    },
    allIds: ['emp_001', 'emp_002', ...]
  },

  // Combat state (temporary, cleared after battle)
  combat: {
    active: false,
    grid: { width: 15, height: 15, hexes },
    participants: { player: [...], enemy: [...] },
    turnOrder: [...],
    currentUnit: 'shp_001',
    phase: 'movement'
  },

  // UI state
  ui: {
    selectedSystem: 'sys_001',
    selectedPlanet: 'pla_001',
    selectedFleet: 'flt_001',
    notifications: [...],
    modals: { shipDesigner: { open: false }, diplomacy: { open: true } },
    camera: { x: 0, y: 0, zoom: 1.0 }
  }
}
```

### 2. Game Loop

**Turn-Based Loop**:
```javascript
// Main game loop
class GameEngine {
  constructor(store) {
    this.store = store;
    this.turnProcessor = new TurnProcessor(store);
  }

  async processTurn() {
    const state = this.store.getState();

    // 1. Pre-turn validation
    this.validateGameState(state);

    // 2. Process player actions (already in state)
    // Player made choices during their "planning phase"

    // 3. AI decision making
    await this.processAITurns(state);

    // 4. Simultaneous resolution
    const updates = this.turnProcessor.resolveTurn({
      // Economy
      production: this.resolveProduction(state),
      research: this.resolveResearch(state),
      growth: this.resolvePopulationGrowth(state),

      // Military
      movement: this.resolveFleetMovement(state),
      combat: this.resolveCombats(state),

      // Diplomacy
      treaties: this.processTreaties(state),
      relations: this.updateRelations(state),

      // Events
      events: this.triggerRandomEvents(state)
    });

    // 5. Apply all updates atomically
    this.store.dispatch(applyTurnUpdates(updates));

    // 6. Victory check
    const victor = this.checkVictoryConditions(state);
    if (victor) {
      this.endGame(victor);
    }

    // 7. Increment turn
    this.store.dispatch(incrementTurn());

    // 8. Generate notifications
    this.generateTurnSummary(updates);
  }
}
```

### 3. Rendering Pipeline

**Canvas Rendering Strategy**:
```javascript
// Galaxy Map Renderer
class GalaxyRenderer {
  constructor(canvas, store) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.store = store;

    // Layers
    this.backgroundLayer = this.createLayer();
    this.starLayer = this.createLayer();
    this.routeLayer = this.createLayer();
    this.fleetLayer = this.createLayer();
    this.uiLayer = this.createLayer();

    // Camera
    this.camera = { x: 0, y: 0, zoom: 1.0 };

    // Performance
    this.lastRender = 0;
    this.fps = 60;
    this.dirty = true;
  }

  render(timestamp) {
    // Only render at target FPS
    if (timestamp - this.lastRender < 1000 / this.fps) {
      requestAnimationFrame((t) => this.render(t));
      return;
    }

    // Skip if nothing changed
    if (!this.dirty) {
      requestAnimationFrame((t) => this.render(t));
      return;
    }

    this.clear();

    // Apply camera transform
    this.ctx.save();
    this.ctx.translate(this.camera.x, this.camera.y);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);

    // Render layers bottom to top
    this.renderBackground();      // Starfield
    this.renderRoutes();          // Hyperspace routes
    this.renderSystems();         // Star systems
    this.renderFleets();          // Fleet icons
    this.renderSelections();      // Selection highlights
    this.renderFogOfWar();        // Unexplored areas

    this.ctx.restore();

    // UI layer (no camera transform)
    this.renderUI();

    this.dirty = false;
    this.lastRender = timestamp;
    requestAnimationFrame((t) => this.render(t));
  }

  renderSystems() {
    const state = this.store.getState();
    const systems = state.galaxy.systems;

    // Frustum culling - only render visible systems
    const visible = this.getVisibleSystems(systems);

    for (const system of visible) {
      this.drawStar(system);
      this.drawPlanets(system);
      this.drawSystemName(system);
      this.drawOwnerIndicator(system);
    }
  }

  // Mark dirty when state changes
  markDirty() {
    this.dirty = true;
  }
}
```

---

## Performance Optimization

### 1. State Optimization

**Normalized State Shape**:
```javascript
// BAD - nested arrays, hard to update
systems: [
  { id: 1, planets: [{ id: 1, buildings: [...] }] }
]

// GOOD - normalized, easy lookups
systems: {
  byId: { 1: { id: 1, planetIds: [1, 2] } },
  allIds: [1, 2, 3]
},
planets: {
  byId: { 1: { id: 1, buildingIds: [1, 2] } },
  allIds: [1, 2, 3]
}
```

**Memoization**:
```javascript
import { createSelector } from '@reduxjs/toolkit';

// Expensive calculation cached until dependencies change
export const selectVisibleSystems = createSelector(
  [selectAllSystems, selectCamera, selectFogOfWar],
  (systems, camera, fog) => {
    return systems.filter(sys =>
      isInViewport(sys, camera) && !fog.includes(sys.id)
    );
  }
);
```

### 2. Rendering Optimization

**Techniques**:
- **Dirty Rectangles**: Only redraw changed areas
- **Offscreen Canvas**: Pre-render static elements
- **Spatial Partitioning**: Quad-tree for galaxy map
- **Level of Detail**: Simplify distant objects
- **Asset Pooling**: Reuse canvas objects
- **Web Workers**: Heavy calculations off main thread

**Example - Spatial Partitioning**:
```javascript
class QuadTree {
  // Divide galaxy into quadrants
  // Only query/render objects in visible quadrants
  // Massive performance boost for large galaxies

  constructor(bounds, maxObjects = 10, maxLevels = 4) {
    this.bounds = bounds;
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = 0;
    this.objects = [];
    this.nodes = [];
  }

  query(area) {
    // Returns only objects in the queried area
    // Used for viewport culling
  }
}
```

### 3. Memory Management

**Save Game Compression**:
```javascript
import LZString from 'lz-string';

function savegame(state) {
  // 1. Serialize state
  const json = JSON.stringify(state);

  // 2. Compress (can reduce 10MB save to 500KB)
  const compressed = LZString.compress(json);

  // 3. Save to IndexedDB (LocalStorage has 5MB limit)
  await saveToIndexedDB('save_slot_1', compressed);
}

function loadGame(slot) {
  const compressed = await loadFromIndexedDB(slot);
  const json = LZString.decompress(compressed);
  return JSON.parse(json);
}
```

---

## AI Implementation Strategy

**AI Architecture**:
```javascript
class AIEngine {
  constructor(empireId, personality) {
    this.empireId = empireId;
    this.personality = personality; // 'aggressive', 'scientific', 'diplomatic', etc.

    // Decision systems
    this.economyAI = new EconomyAI();
    this.militaryAI = new MilitaryAI();
    this.researchAI = new ResearchAI();
    this.diplomacyAI = new DiplomacyAI();
  }

  async takeTurn(gameState) {
    // 1. Evaluate current situation
    const situation = this.evaluateSituation(gameState);

    // 2. Set strategic priorities based on personality
    const priorities = this.determineStrategy(situation);

    // 3. Make decisions for each system
    return {
      production: this.economyAI.planProduction(gameState, priorities),
      research: this.researchAI.selectTech(gameState, priorities),
      fleetOrders: this.militaryAI.issueOrders(gameState, priorities),
      diplomacy: this.diplomacyAI.conductDiplomacy(gameState, priorities),
      shipDesigns: this.militaryAI.designShips(gameState)
    };
  }

  // Weighted scoring system
  evaluateThreat(otherEmpire, gameState) {
    let threat = 0;
    threat += otherEmpire.fleetPower * 0.4;
    threat += otherEmpire.production * 0.3;
    threat += otherEmpire.techLevel * 0.2;
    threat += this.proximityFactor(otherEmpire) * 0.1;
    threat -= this.relations[otherEmpire.id] * 0.5;
    return threat;
  }
}
```

**Difficulty Levels**:
- **Easy**: AI gets -25% bonuses, makes suboptimal decisions
- **Normal**: AI plays fairly, no bonuses
- **Hard**: AI gets +25% production/research bonuses
- **Impossible**: AI gets +50% bonuses, perfect play

---

## Save/Load System

**Save Game Format**:
```javascript
{
  version: '1.0.0',          // For migration compatibility
  timestamp: 1234567890,
  metadata: {
    playerName: 'Player1',
    empireName: 'Hamster Collective',
    turn: 77,
    year: 2650,
    difficulty: 'normal',
    playtime: 7200,          // seconds
    screenshot: 'base64...'  // Thumbnail
  },
  gameState: { /* full Redux state */ },
  checksum: 'abc123'         // Integrity verification
}
```

**Auto-Save Strategy**:
- Save after every turn (overwrite auto-save slot)
- Keep last 3 auto-saves
- Manual saves (unlimited, user-named)
- Quicksave (F5) overwrites quicksave slot
- Cloud sync (future feature)

---

## Testing Strategy

### Unit Tests
```javascript
// Jest + React Testing Library
describe('CombatEngine', () => {
  test('calculates hit chance correctly', () => {
    const accuracy = calculateHitChance({
      baseAccuracy: 70,
      range: 3,
      computerBonus: 10,
      enemyECM: 10,
      targetSize: 'medium'
    });
    expect(accuracy).toBe(70); // 70 + 10 - 10 + 0
  });
});
```

### Integration Tests
- Galaxy generation produces valid maps
- Turn processing maintains state consistency
- Combat resolution matches design doc
- Save/load produces identical state

### E2E Tests
- Full game playthrough (automated)
- Victory condition triggers
- UI interaction flows

---

## Build & Deployment

**Webpack Configuration**:
```javascript
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        }
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new CompressionPlugin({ algorithm: 'gzip' })
  ]
};
```

**Performance Targets**:
- Initial load: < 3 seconds
- Turn processing: < 5 seconds (turn 200)
- Combat frame rate: 60 FPS
- Memory usage: < 500MB
- Bundle size: < 2MB (gzipped)

---

## Development Workflow

**Phases**:
1. **Phase 0**: Core engine + basic UI (galaxy map, turn processing)
2. **Phase 1**: Complete single-player game
3. **Phase 2**: Polish, balance, AI improvements
4. **Phase 3**: Multiplayer (optional)
5. **Phase 4**: Modding support (optional)

**Version Control**:
- Git with feature branches
- Semantic versioning (v1.0.0)
- Automated CI/CD (GitHub Actions)

---

Next: See `data-structures.md` for detailed data models and `ai-implementation.md` for AI behavior trees.
