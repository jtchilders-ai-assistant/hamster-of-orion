# Current Task: Save/Load game UI

**ID**: save-load-ui
**Type**: ui
**Output**: src/ui/screens/SaveLoadScreen.ts

## Description
Create save/load game screens accessible from menu. Show save slots with game info (turn, year, empires). Allow saving, loading, and deleting saves.

## Design Documents (MUST READ)
- `design/ui-ux/UI_OVERVIEW.md` — GAME menu (F10/ESC) contains Save/Load/Options/Quit
- `design/ui-ux/state-transitions.md` — Section 10: Loading and Save States (save flow, auto-save, save dialog structure)

**Note**: Primary wireframe `design/ui-ux/wireframes/save-load.md` does NOT exist. Use the above docs + acceptance criteria as guide.

### Key Design Points from state-transitions.md:
1. **Save Dialog Flow**: GAME_MENU → SAVE_DIALOG (shows slots) → NAME_INPUT (new) or OVERWRITE_CONFIRM (existing) → SAVING → SUCCESS/ERROR
2. **Auto-save**: Enabled by default, slot "autosave", triggers on TURN_END, COMBAT_START, BEFORE_COUNCIL. Max 3 autosaves with rotation.
3. **Save Slots**: Show numbered slots, each with game info preview
4. **Error handling**: Save failed → Retry/Save As/Cancel options

### From UI_OVERVIEW.md:
- GAME button (F10/ESC) opens Game Menu with Save, Load, Options, Quit
- Modal overlay style matching existing screens

## Acceptance Criteria
1. Shows list of save slots
2. Each slot shows turn, year, player empire
3. Save button saves current game to slot
4. Load button loads selected save
5. Delete button removes save with confirmation
6. Autosave slot shown separately
7. Works with LocalStorage persistence

## Implementation Notes
- Use LocalStorage API for persistence
- Save format: JSON with GameState + metadata (turn, timestamp, player race)
- Key format: `hamster-orion-save-{slot}` for manual saves, `hamster-orion-autosave` for autosave
- Maximum 10 manual save slots + 1 autosave
- Modal overlay similar to TurnSummaryScreen pattern
- Wire into App/CommandBar GAME menu button
- Follow existing UI patterns (main.css styles, DOM rendering)

## Dependencies
- None ✓

## Files to Reference
- `src/ui/screens/TurnSummaryScreen.ts` — modal overlay pattern
- `src/game/state.ts` — GameState structure to serialize
- `src/ui/app.ts` — integration point
- `src/styles/main.css` — existing styles
