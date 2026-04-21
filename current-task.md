# Current Task: Keyboard Hotkeys (F1-F8)

**ID**: hotkey-navigation
**Type**: ui
**Output**: src/ui/app.ts (keyboard handler)

## Description
Implement keyboard navigation. F1=Galaxy, F2=Colonies, F3=Fleets, F4=Design, F5=Research, F6=Diplomacy, F7=Council, F8=Save. Also arrow keys for map pan, +/- keys for zoom.

## Design Documents (MUST READ)
- `design/ui-ux/navigation-flow.md` — §9 Keyboard Hotkeys specification
- `design/ui-ux/interaction-spec.md` — §2 Galaxy Map keyboard controls

## Acceptance Criteria
1. F1 opens galaxy map
2. F2 opens colonies list
3. F3 opens fleets list
4. F4 opens ship designer
5. F5 opens research screen
6. F6 opens diplomacy screen
7. F7 opens council screen
8. F8 opens save/load
9. Arrow keys pan galaxy map
10. +/- keys zoom galaxy map

## Dependencies
- None

## Implementation Notes
- App already has a basic `onKeyDown` handler in `src/ui/app.ts` (lines 85-94) with F1/F2/F3 partial implementation and a `keyPress` state tracking last pressed key
- Need to add: F4-F8 handlers, arrow key panning, +/- zoom
- The app already uses `store.dispatch(NAVIGATE({ screen: ... }))` pattern for screen changes
- Galaxy map screen needs to handle arrow key events for panning the viewport
- The `ScreenName` enum has all the screen names: GALAXY, COLONIES, FLEETS, DESIGN, RESEARCH, DIPLOMACY, COUNCIL, SAVE_LOAD
