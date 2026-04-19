# Current Task: app-shell

**ID:** app-shell  
**Name:** Application shell and routing  
**Type:** ui  
**Status:** pending → in-progress

## Description

Build the basic application shell with screen routing. This is the top-level UI orchestrator that initializes the app, manages which screen is active, and wires up keyboard navigation.

## Output Files

- `src/ui/app.ts` — main App class, initializes and owns all screens
- `src/ui/screens/` — individual screen implementations

## Dependencies (all done)

- `scaffold` ✅ — Vite + TypeScript project structure
- `debug-hooks` ✅ — Debug interface (loadState, getState, dispatch)

## Acceptance Criteria

1. **Command bar renders** — persistent bottom bar visible on screen
2. **F-key navigation works** — F1–F10 function keys switch screens
3. **Screen switching works** — clean transition between screens (Galaxy Map, Colonies, Fleets, Research, etc.)

## Reference Design

- `design/ui-ux/wireframes/` — wireframes for each screen
- `design/technical/ARCHITECTURE.md` — UI component patterns
- Existing code: `src/ui/` for any existing UI scaffolding, `src/game/debug.ts` for debug hooks

## Implementation Notes

The App shell should:
- Create a root container in `#app`
- Initialize a Store (from `src/game/store.ts`) with default/empty state
- Render a **CommandBar** (persistent) at the bottom/top
- Route to different screens based on F-key input
- Expose the app on `globalThis` for dev/debug use (via debug hooks)

Screens to scaffold (even if mostly placeholder):
- **GalaxyMapScreen** (default, F2 or similar)
- **ColoniesScreen** 
- **FleetsScreen**
- **ResearchScreen**
- **DiplomacyScreen** (can be stub)

Command bar should show contextual F-key labels (e.g. `F2: Galaxy | F3: Colonies | ...`).

## Task Execution

1. Read relevant design docs (wireframes, architecture)
2. Implement `src/ui/app.ts` with App class
3. Implement `src/ui/screens/*.ts` (at minimum stubs for each screen)
4. Implement `src/ui/components/CommandBar.ts` if not already present
5. Wire F-key keyboard navigation
6. Run `npm run typecheck` and `npm run test`
7. Update `workflow-state.json` with state=`"TESTING"` and worker_output summary
