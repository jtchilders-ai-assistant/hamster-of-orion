# UI Navigation Fixes

**Date:** 2026-04-29  
**Related Spec:** `design/ui-ux/navigation-flow.md`, `design/ui-ux/interaction-spec.md`

## Summary

Fixed ESC key navigation behavior and added missing global keyboard shortcuts per the UI specs.

## Issues Found

### 1. ESC Key Behavior (FIXED)

**Problem:** ESC from any screen navigated to the game menu, but the spec states:
> "ESC from any main screen returns to the Galaxy Map (F1)."

ESC should only open the game menu when pressed *from the Galaxy Map itself*.

**Fix:** Updated `src/ui/app.ts` lines 203-218 to:
- ESC from Galaxy Map → opens game menu
- ESC from any other main screen → returns to Galaxy Map
- ESC from game menu → returns to Galaxy Map (close menu)
- ESC from save/load screen → returns to Galaxy Map

### 2. Missing Ctrl+S Quick Save (FIXED)

**Problem:** `interaction-spec.md` §2.1 specifies `Ctrl+S = Quick Save`, but this was not implemented.

**Fix:** Added keyboard handler in `src/ui/app.ts` lines 224-229 and `quickSave()` method at lines 380-397. Quick save writes to the `hamster_autosave` localStorage slot.

### 3. Missing Ctrl+L Load Game (FIXED)

**Problem:** `interaction-spec.md` §2.1 specifies `Ctrl+L = Load Game`, but this was not implemented.

**Fix:** Added keyboard handler in `src/ui/app.ts` lines 231-236 that navigates to the save/load screen.

### 4. Enter/Space End Turn Scope (FIXED)

**Problem:** Enter/Space triggered end turn from any screen, but other screens may need Enter/Space for their own purposes (e.g., confirming dialogs).

**Fix:** Restricted Enter/Space end turn to Galaxy Map only (`src/ui/app.ts` lines 238-243).

### 5. FleetsScreen Redundant ESC Handler (FIXED)

**Problem:** `FleetsScreen.ts` had its own ESC handler that dispatched `SHOW_SCREEN` (an invalid action type) instead of `NAVIGATE`.

**Fix:** Updated `src/ui/screens/FleetsScreen.ts` lines 337-356:
- Removed redundant ESC handling (now handled globally by app.ts)
- Changed `handleClose()` to dispatch `NAVIGATE` action
- Added stub handlers for fleet-specific shortcuts (M for move, S for split)

## File Changes

### src/ui/app.ts

| Line(s) | Change |
|---------|--------|
| 203-218 | ESC behavior: return to galaxy from non-galaxy screens, open menu from galaxy |
| 224-229 | Added Ctrl+S quick save handler |
| 231-236 | Added Ctrl+L load game handler |
| 238-243 | Restricted Enter/Space to galaxy map only |
| 248-249 | Renumbered F-key section comment (5→7) |
| 258-259 | Renumbered galaxy-only keys section comment (6→8) |
| 380-397 | Added `quickSave()` method |

### src/ui/screens/FleetsScreen.ts

| Line(s) | Change |
|---------|--------|
| 337-352 | Replaced ESC handler with screen-specific shortcuts (M, S) |
| 354-356 | Fixed `handleClose()` to use `NAVIGATE` action |

## Screens Now Properly Supporting ESC → Galaxy

After these fixes, ESC correctly returns to Galaxy Map from:

- ✅ Planet List (F2/Colonies)
- ✅ Fleet Screen (F3)
- ✅ Research Screen (F4)
- ✅ Diplomacy Screen (F5)
- ✅ Ship Design (F6)
- ✅ Reports (F7)
- ✅ Council (F8)
- ✅ Save/Load Screen
- ✅ Game Menu (closes menu)

## Not Changed

The following screens are "true modals" and ESC is handled specially:
- Combat Screen — blocks F-key navigation, internal ESC handling
- Ground Combat Screen — blocks F-key navigation
- Turn Summary — ESC dismisses overlay (already working)
- Victory Screen — end-game state

## Testing Notes

1. Start game, navigate to any F-key screen (F2-F7)
2. Press ESC → should return to Galaxy Map
3. Press ESC again from Galaxy Map → should open game menu
4. Press ESC from game menu → should close menu and return to Galaxy Map
5. Press Ctrl+S → should save to autosave slot (check console log)
6. Press Ctrl+L → should open save/load screen
