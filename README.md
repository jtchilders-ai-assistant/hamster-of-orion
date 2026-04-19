# Hamster of Orion 🐹

A turn-based 4X space strategy game inspired by Master of Orion (1993).

## Tech Stack

- **Build:** Vite
- **Language:** TypeScript
- **Rendering:** HTML5 Canvas 2D + HTML/CSS
- **State:** Vanilla TypeScript (Redux-compatible pattern)
- **Testing:** Vitest

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (localhost:5173)
npm run dev

# Run tests
npm run test

# Type check
npm run typecheck

# Build for production
npm run build
```

## Project Structure

```
hamster-of-orion/
├── design/              # Game design documentation
├── src/
│   ├── game/            # Pure TypeScript game logic (NO DOM)
│   │   ├── state.ts     # Type definitions
│   │   ├── store.ts     # State container
│   │   ├── actions/     # State mutations
│   │   ├── systems/     # Game systems (production, growth, etc.)
│   │   ├── generators/  # Galaxy/planet generation
│   │   └── utils/       # Math, random, pathfinding
│   │
│   ├── ui/              # DOM/Canvas rendering layer
│   │   ├── screens/     # Full-screen views
│   │   ├── components/  # Reusable UI pieces
│   │   └── canvas/      # Canvas utilities
│   │
│   ├── data/            # Static game data (JSON)
│   ├── styles/          # CSS
│   └── main.ts          # Bootstrap
│
├── test/                # Vitest unit tests
├── assets/              # Images, sounds, fonts
└── README.md
```

## Architecture

**Critical Rule:** Separation of game logic and rendering.

- **`src/game/`** — Pure TypeScript. NO DOM. NO `document`. NO `window`. 100% unit testable.
- **`src/ui/`** — Rendering layer. Reads `GameState`, dispatches actions, updates DOM/Canvas.

This separation enables:
- Unit testing without a browser
- Easy migration to React if needed (only UI changes)
- Clear debugging (logic vs. rendering bugs)

## Development

### Debug API

In dev mode, a debug API is exposed at `window.__HAMSTER_DEBUG__`:

```javascript
// Get current state
const state = window.__HAMSTER_DEBUG__.getState();

// Load test state
window.__HAMSTER_DEBUG__.loadState(testState);

// Dispatch action
window.__HAMSTER_DEBUG__.dispatch({ type: 'NEXT_TURN' });
```

### Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch
```

## Design Documentation

See `design/` folder for:
- Game mechanics and formulas
- UI wireframes
- Data structures
- Technical architecture

## License

MIT
