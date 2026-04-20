# Current Task: ship-designer-ui

## Task ID
ship-designer-ui

## Name
Ship designer UI screen

## Description
Full ship designer screen per design/ui-ux/wireframes/ship-design-screen.md. MOO1-accurate layout: hull selection, auto-assigned systems (computer/shield/armor/engine), player-selectable weapons (4 slots) and specials (3 slots), stats preview, save design.

## Key References
- `design/ui-ux/wireframes/ship-design-screen.md` — full wireframe and layout spec
- `src/game/systems/shipDesign.ts` — validateDesign(), calculateDesignCost(), checkTechRequirements()
- `src/game/types/shipComponents.ts` — component types
- `src/data/components.json` — all components data
- `src/ui/screens/` — existing screen patterns to follow
- `src/game/state.ts` — GameState, ShipDesign types

## Output
- `src/ui/screens/DesignScreen.ts` (replace stub if exists, or create)

## Acceptance Criteria
1. Hull size selector (Frigate/Destroyer/Cruiser/Battleship/Titan)
2. Auto-assigned systems panel (computer, shield, armor, engine, ECM — read-only, best available tech)
3. Weapons panel — 4 slots, player selects weapon type and count
4. Special equipment panel — 3 slots, player selects specials
5. Live stats: remaining space, total cost in BC
6. Ship name input field
7. Save Design button — creates ShipDesign in game state
8. Load/cycle existing designs
9. Delete design button
10. DOM-only code (no game logic here — call shipDesign.ts functions)

## Implementation Notes
- Screen is a DOM overlay (full-screen modal), consistent with other screens
- Auto-assigned systems: iterate player's researched techs to find best computer, shield, armor, engine
- Space calculation: use calculateDesignCost() and hull space limits from shipDesign.ts
- Hull sizes (from shipDesign.ts): Frigate=25 spaces, Destroyer=70, Cruiser=280, Battleship=1400 (or check actual hull constants)
- Weapons slots: show dropdown of available weapons (filtered by tech), count +/- buttons
- Specials slots: show available specials (colony module, reserve tanks, etc.)
- On save: call validateDesign(), show errors if invalid, otherwise dispatch action to add design
- Style consistent with existing game screens (dark space theme)

## Tests Required
UI screens don't require unit tests (DOM code). No test file needed.

## Output on Completion
Update `workflow-state.json` to include ship-designer-ui completion signal:
```json
{
  "completed_tasks": ["ship-designer-ui"]
}
```
And update tasks.json: set ship-designer-ui status to "done".
Log progress to `.agents/progress.md`.
