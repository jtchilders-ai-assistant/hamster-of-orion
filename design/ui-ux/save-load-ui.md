# UI Specification: Save & Load Systems

## Overview

This document specifies save game slot management, file save/load dialogs, autosave rules, timestamp formatting, overwrite confirmation modals, and keyboard exit paths in **Hamster of Orion**.

**References:**
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)
- [Main Screens Spec](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/main-screens.md)
- [State Transitions Spec](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/state-transitions.md)

---

## 1. Save / Load Slot Layout

Save and Load screens are accessible from the Title Menu (`moo_new_game_menu.png`) or from the In-Game Pause Menu (`Esc` key).

```
+-----------------------------------------------------------------+
| SAVE GAME                                                [X]    |
+-----------------------------------------------------------------+
|  SLOTS:                                                         |
|  [AutoSave] Turn 42 - Emperor Hammy - Hamsteria (Medium, Normal)|
|  [QuickSave] Turn 89 - Emperor Hammy - Orion System            |
|  [Slot 01]  Turn 120 - Victory Threshold Reached - 2026-07-29 |
|  [Slot 02]  <Empty Slot>                                        |
|  [Slot 03]  <Empty Slot>                                        |
|                                                                 |
|  Save Name: [ Turn 120 - Pre Orion Invasion              ]      |
|                                                                 |
|  +---------------------+   +-----------------+   +-----------+  |
|  |     [SAVE GAME]     |   |    [DELETE]     |   | [CANCEL]  |  |
|  +---------------------+   +-----------------+   +-----------+  |
+-----------------------------------------------------------------+
```

---

## 2. Interaction Specifications (3-Part)

### 2.1 Saving a Game
1. **Trigger / Click Response**:
   - Selecting a save slot highlights the row and populates the Save Name input box.
   - Clicking `[SAVE GAME]` checks if the slot is occupied. If occupied, triggers the Overwrite Confirmation Modal (`"Overwrite existing save slot?"`).
2. **Visual Transition**:
   - Save slot list updates instantly with green text status `"Saved Successfully"`.
3. **Return Path / Exit Method**:
   - Modal closes automatically after saving (`500ms delay`) and returns focus to the game or pause menu.
   - Pressing `Esc` or clicking `[CANCEL]` closes the Save dialog without making changes.

### 2.2 Loading a Game
1. **Trigger / Click Response**:
   - Clicking an occupied save slot and clicking `[LOAD GAME]` prompts `"Load selected save? Any unsaved progress will be lost."`
   - Clicking `[CONFIRM]` initiates state reload.
2. **Visual Transition**:
   - Screen fades out to loading spinner (`1.0s`), loads game state, and fades in to the saved Galaxy Map state (`moo_galaxy_home.png`).
3. **Return Path / Exit Method**:
   - Pressing `Esc` or clicking `[CANCEL]` on the load prompt returns to the previous menu state.

### 2.3 Autosave & Quicksave Rules
- **Autosave**: Triggers automatically at the start of every turn before player interaction. Cycles across 3 rolling slots (`AutoSave_1`, `AutoSave_2`, `AutoSave_3`).
- **Quicksave**: Pressing `F5` hotkey immediately saves to `QuickSave` slot without opening UI modals. Toast notification `"Game Quicksaved"` displays for 2 seconds.
- **Quickload**: Pressing `F9` hotkey prompts for Quickload confirmation.
