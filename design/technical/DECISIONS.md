# Technical Decisions Log — Hamster of Orion

This document records key technical decisions made during development, including rationale and any rejected alternatives.

---

## Decision Log

### DEC-001: Web-Based Implementation
**Date:** 2026-04-19  
**Status:** Approved

**Decision:** Implement as a web application (browser-based).

**Rationale:**
- Zero install — runs in any browser
- Cross-platform instantly (Windows, Mac, Linux, mobile)
- Easy to share (just a URL)
- Updates deploy instantly
- MOO1 is turn-based (no real-time performance pressure)
- UI-heavy with panels/menus — web excels at this
- Pixel art aesthetic works great with Canvas/WebGL

**Alternatives Considered:**
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Godot | Great 2D, exports everywhere | Another language (GDScript) | Rejected |
| Electron | Web code + native wrapper | Bloated 100MB+ bundle | Rejected |
| Rust + SDL | Fast, small binary | Steep learning curve | Rejected |
| Python + Pygame | Quick prototyping | Distribution pain | Rejected |

**Distribution:** GitHub Pages initially, URL-based access.

---

### DEC-002: Vanilla TypeScript (Not React/Redux)
**Date:** 2026-04-19  
**Status:** Approved

**Decision:** Use vanilla TypeScript with a Redux-compatible store pattern, not React/Redux.

**Rationale:**
- MOO1-style UI is simple panels, not dynamic reactive forms
- Turn-based means no real-time state sync challenges
- Faster iteration without framework abstractions
- Smaller bundle (no 40KB+ framework overhead)
- Easier for AI testing (plain DOM snapshots vs React virtual DOM)
- Clean separation makes React migration cheap if needed later

**Migration Path:** If complexity grows:
- Only `src/ui/` needs rewriting (React components)
- `src/game/` stays 100% unchanged
- Store pattern is Redux-compatible (swap import)
- Estimated effort: ~20% of codebase

**Key Constraint:** Strict separation of `game/` (pure logic, no DOM) and `ui/` (rendering only).

---

### DEC-003: Technology Stack
**Date:** 2026-04-19  
**Status:** Approved

**Decision:** 

| Layer | Technology |
|-------|------------|
| Build | Vite |
| Language | TypeScript |
| Star Map/Combat | HTML5 Canvas 2D |
| UI Panels | HTML/CSS |
| State | Vanilla Store (Redux-compatible) |
| Testing | Vitest + Browser snapshots |

**Rationale:**
- **Vite:** Fast dev server, hot reload, zero-config TypeScript
- **TypeScript:** Type safety essential for complex game state
- **Canvas 2D:** Sufficient for 2D maps; WebGL/PixiJS available if needed
- **HTML/CSS for panels:** Simpler than Canvas for menus, buttons, text
- **Vanilla Store:** Familiar Redux pattern, trivial migration path

---

### DEC-004: AI Agent Testing Strategy
**Date:** 2026-04-19  
**Status:** Approved

**Decision:** Build testing hooks for AI-assisted development and visual verification.

**Implementation:**
1. **Dev server:** Vite on `localhost:5173`
2. **State injection:** `window.__HAMSTER_DEBUG__` object (dev mode only)
3. **DOM structure:** Stable `data-testid` attributes on all interactive elements
4. **Test fixtures:** Pre-built game states (early/mid/combat)

**Debug Interface:**
```typescript
window.__HAMSTER_DEBUG__ = {
  store,
  loadState: (state) => store.dispatch({ type: 'LOAD_STATE', payload: state }),
  getState: () => store.getState(),
  dispatch: (action) => store.dispatch(action),
};
```

**Testing Workflow:**
```
1. npm run dev                           # Start server
2. browser action=snapshot               # AI sees UI
3. browser action=eval loadState(...)    # Inject test state
4. browser action=click ref="Next Turn"  # AI interacts
5. browser action=snapshot               # AI verifies
```

---

### DEC-005: Project Structure
**Date:** 2026-04-19  
**Status:** Approved

**Decision:** Enforce strict separation between game logic and UI rendering.

```
src/
├── game/           # Pure TypeScript (NO DOM)
│   ├── state.ts    # Type definitions
│   ├── store.ts    # State container
│   ├── actions/    # State mutations
│   ├── systems/    # Production, growth, AI
│   └── utils/      # Math, pathfinding
│
├── ui/             # Rendering layer (DOM/Canvas)
│   ├── screens/    # Full-screen views
│   ├── components/ # Reusable pieces
│   └── canvas/     # Canvas utilities
│
└── data/           # Static JSON
```

**Critical Rule:**
- `src/game/` must have ZERO imports of DOM APIs
- All DOM/Canvas access isolated to `src/ui/`
- Enables: unit testing without browser, easy framework migration

---

### DEC-006: Rendering Architecture
**Date:** 2026-04-19  
**Status:** Approved

**Decision:** Multi-layer canvas with HTML overlay for UI panels.

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

**Rationale:**
- Canvas for efficient redraw of many objects (stars, ships)
- HTML for text-heavy panels (better font rendering, accessibility)
- Layering allows selective updates (don't redraw background on selection change)

---

### DEC-007: Deployment Strategy
**Date:** 2026-04-19  
**Status:** Approved

**Decision:** GitHub Pages with automated deployment.

**Workflow:**
1. Push to `main` branch
2. GitHub Actions builds with Vite
3. Deploys `dist/` to GitHub Pages
4. Available at `https://[user].github.io/hamster-of-orion/`

**Future Options:**
- Custom domain
- itch.io distribution
- Steam (via Electron wrapper if needed)

---

## Pending Decisions

### DEC-008: Asset Pipeline
**Status:** Pending

**Question:** How do we handle sprites, sounds, fonts?

**Options:**
1. Hand-drawn pixel art
2. AI-generated assets
3. Open-source asset packs
4. Placeholder art initially

---

### DEC-009: Save/Load System
**Status:** Pending

**Question:** How do players save games?

**Options:**
1. localStorage (simple, browser-local)
2. IndexedDB (larger storage)
3. Export/Import JSON files
4. Cloud sync (requires backend)

---

### DEC-010: Multiplayer
**Status:** Deferred

**Question:** Will the game support multiplayer?

**Current Answer:** No. Single-player only for initial release. Architecture doesn't preclude future multiplayer, but it's not a design goal.

---

## Decision Template

```markdown
### DEC-XXX: [Title]
**Date:** YYYY-MM-DD  
**Status:** Proposed | Approved | Rejected | Superseded

**Decision:** [What was decided]

**Rationale:** [Why this choice]

**Alternatives Considered:** [Other options and why rejected]

**Consequences:** [Impact of this decision]
```
