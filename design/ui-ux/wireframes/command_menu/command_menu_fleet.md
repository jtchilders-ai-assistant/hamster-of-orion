# Command Menu: FLEET (F3) - MOO1-Accurate Wireframe

## Overview

The FLEET command button opens the Fleet Overview screen. This is a **full-screen modal** (replaces the galaxy view entirely — no bottom command bar visible). It displays all fleets in the empire organized by their current location (system or in-transit destination).

**Reference**: Master of Orion (1993) Fleet Screen  
**Hotkey**: F3  
**Exit**: OK button or ESC

---

## Visual Style

The Fleet screen shares MOO1's characteristic earthy palette:
- **Background**: Dark brown/maroon panel (same stone-like texture as other full-screen modals)
- **Title text**: Gold/yellow pixel font, centered at top
- **Table borders**: Thin lines separating rows and columns
- **Ship icons**: Small pixel-art sprites; one sprite per design type
- **Count badge**: Number overlaid on or beside the ship icon (bottom-right corner of icon cell)
- **Buttons**: 3D raised style, same as other MOO1 UI elements

---

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                             FLEET OVERVIEW                                      │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  ┌────────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐    │
│  │  SYSTEM    │ Scout   │ Fighter │Destroyer│ Cruiser │Battleshp│ Colony  │    │
│  │            │         │         │         │         │         │         │    │
│  ├────────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤    │
│  │            │         │         │         │         │         │         │    │
│  │  FIRMA     │ ┌─────┐ │ ┌─────┐ │         │         │         │ ┌─────┐ │    │
│  │            │ │[IMG]│ │ │[IMG]│ │         │         │         │ │[IMG]│ │    │
│  │            │ │   12│ │ │    4│ │         │         │         │ │    1│ │    │
│  │            │ └─────┘ │ └─────┘ │         │         │         │ └─────┘ │    │
│  │            │         │         │         │         │         │         │    │
│  ├────────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤    │
│  │            │         │         │         │         │         │         │    │
│  │  CENTAURI  │ ┌─────┐ │         │ ┌─────┐ │         │         │         │    │
│  │            │ │[IMG]│ │         │ │[IMG]│ │         │         │         │    │
│  │            │ │    3│ │         │ │    2│ │         │         │         │    │
│  │            │ └─────┘ │         │ └─────┘ │         │         │         │    │
│  │            │         │         │         │         │         │         │    │
│  ├────────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤    │
│  │            │         │         │         │         │         │         │    │
│  │  → ALTAIR  │ ┌─────┐ │ ┌─────┐ │         │         │         │         │    │
│  │  ETA: 3    │ │[IMG]│ │ │[IMG]│ │         │         │         │         │    │
│  │            │ │    6│ │ │    8│ │         │         │         │         │    │
│  │            │ └─────┘ │ └─────┘ │         │         │         │         │    │
│  │            │         │         │         │         │         │         │    │
│  ├────────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤    │
│  │  (more     │         │         │         │         │         │         │    │
│  │   rows...) │         │         │         │         │         │         │    │
│  └────────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘    │
│                                                                                 │
│  ┌──────────────────────────────────────┐        ┌──────┐  ┌──────┐  ┌────┐   │
│  │  Fleet Maintenance: 45 BC/turn       │        │SPECS │  │SCRAP │  │ OK │   │
│  └──────────────────────────────────────┘        └──────┘  └──────┘  └────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Column Structure

| Column | Content |
|--------|---------|
| 1 — SYSTEM | System name (orbiting) or `→ DESTINATION` (in transit) |
| 2–7 — SHIP DESIGNS | One column per active ship design (actual design name as header) |

### System Column Details

| State | Display |
|-------|---------|
| Orbiting a colony | System name (e.g., `FIRMA`) |
| Orbiting uncolonized | System name |
| In transit | `→ DESTINATION` + `ETA: N` turns |

> **Correction from earlier draft**: Status labels like "(colony)" and "(transit)" do **not** appear as separate sub-labels in the actual screenshot. The arrow prefix (`→`) distinguishes in-transit fleets; the ETA is shown on a second line.

### Ship Design Columns

- **Header row**: The actual ship design name (Scout, Fighter, Destroyer, Cruiser, Battleship, Colony Ship — or player-named equivalents)
- **Cell content** (when ships present):
  ```
  ┌─────────┐
  │         │
  │  [IMG]  │
  │       12│  ← Count in bottom-right corner
  └─────────┘
  ```
- **Empty cell**: No icon, no count — just background fill
- **Maximum columns**: 6 (MOO1 cap of 6 active ship designs)

---

## Bottom Section

### Fleet Maintenance (Bottom-Left)

```
┌──────────────────────────────────────┐
│  Fleet Maintenance: 45 BC/turn       │
└──────────────────────────────────────┘
```

Total recurring upkeep cost for all ships in the empire, shown every turn.

### Action Buttons (Bottom-Right)

Three 3D-raised buttons, left to right:

| Button | Action |
|--------|--------|
| **SPECS** | View detailed specifications for a selected ship design |
| **SCRAP** | Open the scrap interface to dismantle selected ships |
| **OK** | Exit the Fleet screen and return to the Galaxy Map |

---

## Interactions

| Action | Result |
|--------|--------|
| Click a fleet row | Return to Galaxy Map with that fleet selected |
| Click **SPECS** | Open ship design spec viewer |
| Click **SCRAP** | Open scrapping interface for selected fleet |
| Click **OK** | Close screen, return to Galaxy Map |
| Press **ESC** | Close screen, return to Galaxy Map |

---

## Design Constraints

- **No bottom command bar**: The command bar (GAME, DESIGN, FLEET…) is hidden while this screen is open.
- **Max 6 ship designs**: MOO1 limits the player to 6 active designs — so at most 7 columns total (SYSTEM + 6 ship types).
- **Scrollable rows**: If the empire has many fleet locations, the table scrolls vertically.
- **Empty cells are common**: Most systems won't have every ship type present.

---

## 4-Column Interaction Element Table

| UI Element | (a) Trigger Response | (b) Visual Transition | (c) Return Path / Exit Method |
| :--- | :--- | :--- | :--- |
| **`[FLEET]` Command Button** | Opens Fleet Command Overview modal | Fades out Galaxy Map view and opens Fleet overview screen (`moo_fleet_screen.png`) | Click `[OK]` or press `Esc` to return to Galaxy Map |

---

## Reference Screenshots

| File | Description |
|------|-------------|
| [moo_fleet_screen.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_fleet_screen.png) | Actual MOO1 Fleet Overview screen showing table layout, ship icons, and bottom buttons |
