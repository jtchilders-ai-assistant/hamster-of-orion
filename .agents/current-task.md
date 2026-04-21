# Current Task: Turn summary/events screen

**ID**: turn-summary-screen
**Type**: ui
**Output**: src/ui/screens/TurnSummaryScreen.ts

## Description
Create turn summary screen that shows between turns. Display research completed, ships built, combats resolved, diplomatic events, random events.

## Design Documents (MUST READ)
- design/ui-ux/wireframes/turn-summary.md — **FILE NOT FOUND** (see reference materials below)
- design/game-mechanics/turn-structure.md — Turn phases (Phase 3: Research breakthrough popup, Phase 7: Combat results, Phase 9: Random events)
- design/game-mechanics/random-events.md — Event types and effects

**NOTE**: The primary wireframe `design/ui-ux/wireframes/turn-summary.md` does not exist. Use the following sources:
1. **turn-structure.md** Phase 12: "Player can review reports" — implies turn summary
2. **MOO reference screens**: `design/moo_screens/moo_start_of_turn_*.png`
3. **Acceptance criteria below** define the UI requirements

## Reference: MOO-style Turn Events
From the reference images:
- `moo_start_of_turn_new_planet_reveal.png` — New planet discovery popup
- `moo_start_of_turn_select_new_research.png` — Research completed, choose next
- `moo_start_of_turn_new_ships.png` — Ships built this turn

## Acceptance Criteria
1. Shows after Next Turn is clicked
2. Lists research completed this turn
3. Lists ships built this turn
4. Lists combat results with links
5. Lists diplomatic events
6. Lists random events
7. Continue button returns to galaxy map

## Implementation Notes
- Should be a modal/screen that appears between turns
- Can use a card/list layout for different event types
- Each event type can have an icon (research flask, ship, crossed swords, handshake, star)
- Combat results should be clickable to see battle report
- Continue button or ESC dismisses and returns to galaxy map
- If no events, still show "Turn X Complete - Nothing of note occurred"
- The reducer should track turn events in state (add `turnEvents` array to GameState if needed)
- processTurn() should populate turnEvents as it processes each phase

## Dependencies
- None (no blocking dependencies)
