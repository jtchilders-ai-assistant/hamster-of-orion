# Technical Architecture — Hamster of Orion

## Overview

Hamster of Orion is a turn-based 4X strategy game implemented as a web application. The architecture prioritizes simplicity, testability, and clean separation between game logic and rendering.

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Build** | Vite | Fast dev server, hot reload, zero-config TypeScript |
| **Language** | TypeScript | Type safety for complex game state |
| **Rendering** | HTML5 Canvas 2D | Star map, tactical combat grid |
| **UI Panels** | HTML/CSS | Simpler than Canvas for menus, panels, buttons |
| **State** | Vanilla TypeScript (Redux-compatible pattern) | Easy migration to Redux if needed |
| **Testing** | Vitest + Browser snapshots | Unit tests + visual verification |

### Why Vanilla TypeScript (Not React/Redux)?

1. **MOO1-style UI is simple** — static panels, not dynamic reactive forms
2. **Turn-based** — no real-time state sync challenges
3. **Faster iteration** — no framework abstractions to work through
4. **Smaller bundle** — no 40KB+ framework overhead
5. **Easy migration** — if complexity grows, structured code ports to React easily

---

## Project Structure

```
hamster-of-orion/
├── design/                 # Game design docs (existing)
├── src/
│   ├── index.html          # Entry point
│   ├── main.ts             # Bootstrap
│   ├── styles/             # CSS
│   │   └── main.css
│   │
│   ├── game/               # Pure game logic (NO DOM)
│   │   ├── state.ts        # GameState type definitions
│   │   ├── store.ts        # State container (Redux-compatible)
│   │   ├── actions/        # State mutations
│   │   │   ├── turn.ts
│   │   │   ├── colony.ts
│   │   │   ├── fleet.ts
│   │   │   ├── research.ts
│   │   │   ├── combat.ts
│   │   │   └── diplomacy.ts
│   │   ├── generators/     # Galaxy, planet generation
│   │   ├── systems/        # Game systems (production, growth, AI)
│   │   └── utils/          # Math, random, pathfinding
│   │
│   ├── ui/                 # Rendering layer
│   │   ├── screens/        # Full-screen views
│   │   │   ├── GalaxyScreen.ts
│   │   │   ├── FleetScreen.ts
│   │   │   ├── PlanetScreen.ts
│   │   │   ├── ResearchScreen.ts
│   │   │   ├── RacesScreen.ts
│   │   │   ├── DesignScreen.ts
│   │   │   └── CombatScreen.ts
│   │   ├── components/     # Reusable UI pieces
│   │   │   ├── CommandBar.ts
│   │   │   ├── InfoPanel.ts
│   │   │   ├── StarMap.ts
│   │   │   └── Modal.ts
│   │   ├── canvas/         # Canvas rendering utilities
│   │   │   ├── renderer.ts
│   │   │   └── sprites.ts
│   │   └── app.ts          # Screen router, main UI controller
│   │
│   └── data/               # Static game data (JSON)
│       ├── races.json
│       ├── technologies.json
│       └── weapons.json
│
├── test/                   # Unit tests
├── assets/                 # Images, sounds
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Critical Architecture Rule

### Separation of Concerns

```
┌─────────────────────────────────────────────────────────────┐
│                        src/game/                            │
│                                                             │
│   Pure TypeScript. NO DOM. NO document. NO window.          │
│   Functions take state in, return new state out.            │
│   100% unit testable without a browser.                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ GameState
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         src/ui/                             │
│                                                             │
│   Renders GameState to DOM/Canvas.                          │
│   Listens for user input, dispatches actions.               │
│   Thin layer — minimal logic.                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**This separation enables:**
- Unit testing game logic without browser
- Easy migration to React if needed (only `ui/` changes)
- Clear debugging (is bug in logic or rendering?)

---

## State Management

### Redux-Compatible Pattern

We use a simple store that mirrors Redux's API, making future migration trivial:

```typescript
// src/game/store.ts

type Listener<T> = (state: T) => void;
type Reducer<T> = (state: T, action: Action) => T;

interface Action {
  type: string;
  payload?: any;
}

export class Store<T> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();
  private reducer: Reducer<T>;

  constructor(reducer: Reducer<T>, initialState: T) {
    this.reducer = reducer;
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  dispatch(action: Action): void {
    this.state = this.reducer(this.state, action);
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
```

**Migration to Redux:** Replace `Store` import with `createStore` from Redux. Action creators and reducers remain unchanged.

---

## Rendering Architecture

### Multi-Layer Canvas

For the Galaxy Map and Combat screens:

```
┌─────────────────────────────────────┐
│  UI Overlay (HTML/CSS)              │ ← Panels, buttons, text
├─────────────────────────────────────┤
│  Selection Layer (Canvas)           │ ← Highlights, routes
├─────────────────────────────────────┤
│  Objects Layer (Canvas)             │ ← Stars, fleets, ships
├─────────────────────────────────────┤
│  Background Layer (Canvas)          │ ← Starfield, grid
└─────────────────────────────────────┘
```

### Screen Rendering Pattern

```typescript
// src/ui/screens/GalaxyScreen.ts

export class GalaxyScreen {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private infoPanel: HTMLElement;

  constructor(container: HTMLElement) {
    // Create canvas and panel elements
  }

  render(state: GameState): void {
    this.renderBackground();
    this.renderStars(state.galaxy.stars);
    this.renderFleets(state.fleets);
    this.renderSelection(state.ui.selectedStar);
    this.renderInfoPanel(state);
  }

  private renderInfoPanel(state: GameState): void {
    // Update HTML panel based on selection
    if (state.ui.selectedStar) {
      this.infoPanel.innerHTML = this.buildPlanetInfo(state);
    }
  }
}
```

---

## AI Agent Testing Strategy

The game is designed for AI-assisted development with visual testing capabilities.

### Requirements for AI Testing

1. **Dev server accessible via localhost**
2. **Deterministic state injection**
3. **Stable DOM selectors for snapshots**
4. **Keyboard/mouse simulation support**

### Test State Injection

```typescript
// Built into the game for testing
declare global {
  interface Window {
    __HAMSTER_DEBUG__: {
      store: Store<GameState>;
      loadState: (state: GameState) => void;
      getState: () => GameState;
      dispatch: (action: Action) => void;
    };
  }
}

// In main.ts (dev mode only)
if (import.meta.env.DEV) {
  window.__HAMSTER_DEBUG__ = {
    store,
    loadState: (state) => store.dispatch({ type: 'LOAD_STATE', payload: state }),
    getState: () => store.getState(),
    dispatch: (action) => store.dispatch(action),
  };
}
```

### DOM Structure for Snapshots

UI elements have stable, semantic identifiers:

```html
<!-- Galaxy Screen -->
<div id="galaxy-screen" class="screen active">
  <canvas id="star-map"></canvas>
  
  <div id="info-panel" class="panel">
    <h2 class="planet-name" data-testid="planet-name">Orion</h2>
    <div class="stat" data-testid="population">Pop: 15 / 100</div>
    <div class="stat" data-testid="factories">Factories: 45</div>
    <button id="btn-reloc" data-testid="reloc-button">RELOC</button>
    <button id="btn-trans" data-testid="trans-button">TRANS</button>
  </div>
  
  <div id="command-bar">
    <button data-screen="game" data-testid="cmd-game">GAME</button>
    <button data-screen="design" data-testid="cmd-design">DESIGN</button>
    <!-- ... -->
    <button id="next-turn" data-testid="next-turn">NEXT TURN</button>
  </div>
</div>
```

### AI Testing Workflow

```bash
# 1. Start dev server
npm run dev
# → Vite serves on http://localhost:5173

# 2. AI takes snapshot
browser action=open url=http://localhost:5173
browser action=snapshot

# 3. AI injects test state
browser action=eval javaScript="window.__HAMSTER_DEBUG__.loadState(testState)"

# 4. AI interacts
browser action=act kind=click ref="Next Turn"

# 5. AI verifies result
browser action=snapshot
```

### Test Scenarios

```typescript
// test/fixtures/states.ts

export const earlyGameState: GameState = {
  turn: 10,
  galaxy: { /* small galaxy, 2 colonies */ },
  // ...
};

export const midGameState: GameState = {
  turn: 100,
  galaxy: { /* full galaxy, multiple empires */ },
  // ...
};

export const combatState: GameState = {
  turn: 50,
  combat: { /* active battle */ },
  // ...
};
```

---

## Build & Deployment

### Development

```bash
npm install
npm run dev       # Start Vite dev server (localhost:5173)
npm run test      # Run Vitest unit tests
npm run lint      # ESLint + Prettier
```

### Production Build

```bash
npm run build     # Output to dist/
npm run preview   # Preview production build locally
```

### GitHub Pages Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Migration Path to React/Redux

If game complexity grows and we need React:

### What Changes
- `src/ui/` rewritten as React components
- `Store` class replaced with Redux `createStore`
- HTML templates become JSX

### What Stays the Same
- `src/game/` (100% unchanged)
- All game logic, actions, reducers
- Data structures and types
- Canvas rendering utilities

### Estimated Effort
- **Low** if separation rule followed
- ~20% of codebase (UI layer only)
- Game logic remains untouched

---

## Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Vanilla TypeScript | Simple, fast, easy React migration |
| State | Redux-pattern store | Familiar pattern, trivial migration |
| Rendering | Canvas + HTML/CSS | Canvas for maps, HTML for panels |
| Build | Vite | Fast, zero-config, hot reload |
| Testing | Vitest + Browser snapshots | Unit + visual AI testing |
| Separation | game/ (pure) vs ui/ (DOM) | Testability, maintainability |
