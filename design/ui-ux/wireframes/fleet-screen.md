# Fleet Screen (F3) - MOO1-Accurate Specification

## Overview

The Fleet screen is a **full-screen modal** opened by clicking FLEET on the Galaxy Map's bottom command bar. It displays all fleets in the empire organized by location. **No bottom command bar** - exit via OK button.

**Reference**: `../../moo_screens/moo_fleet_screen.png`  
**Hotkey**: F3

---

## Visual Description (from MOO1 screenshot)

The screen has a **solid black background** with no decorative border frame. At the top, "FLEET OVERVIEW" is centered in white/amber text with a **horizontal golden/amber decorative line** spanning the full width beneath the title. The grid occupies the bulk of the screen. At the bottom, a left-aligned bordered text box shows fleet maintenance cost, with three pixel-art raised buttons (SPECS, SCRAP, OK) in the bottom-right corner.

---

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                              FLEET OVERVIEW                                     │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  ┌────────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐    │
│  │  SYSTEM    │ DESIGN1 │ DESIGN2 │ DESIGN3 │ DESIGN4 │ DESIGN5 │ DESIGN6 │    │
│  │            │ (Scout) │(Fighter)│(Destroy)│(Cruiser)│(Battlesh│(Colony) │    │
│  ├────────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤    │
│  │            │         │         │         │         │         │         │    │
│  │  FIRMA     │ ┌─────┐ │ ┌─────┐ │         │         │         │ ┌─────┐ │    │
│  │  (colony)  │ │SHIP │ │ │SHIP │ │         │         │         │ │SHIP │ │    │
│  │            │ │  12 │ │ │   4 │ │         │         │         │ │   1 │ │    │
│  │            │ └─────┘ │ └─────┘ │         │         │         │ └─────┘ │    │
│  │            │         │         │         │         │         │         │    │
│  ├────────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤    │
│  │            │         │         │         │         │         │         │    │
│  │  CENTAURI  │ ┌─────┐ │         │ ┌─────┐ │         │         │         │    │
│  │  (colony)  │ │SHIP │ │         │ │SHIP │ │         │         │         │    │
│  │            │ │   3 │ │         │ │   2 │ │         │         │         │    │
│  │            │ └─────┘ │         │ └─────┘ │         │         │         │    │
│  │            │         │         │         │         │         │         │    │
│  ├────────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤    │
│  │            │         │         │         │         │         │         │    │
│  │  → ALTAIR  │ ┌─────┐ │ ┌─────┐ │         │         │         │         │    │
│  │  (transit) │ │SHIP │ │ │SHIP │ │         │         │         │         │    │
│  │  ETA: 3    │ │   6 │ │ │   8 │ │         │         │         │         │    │
│  │            │ └─────┘ │ └─────┘ │         │         │         │         │    │
│  │            │         │         │         │         │         │         │    │
│  ├────────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤    │
│  │            │         │         │         │         │         │         │    │
│  │  (more     │         │         │         │         │         │         │    │
│  │   rows...) │         │         │         │         │         │         │    │
│  │            │         │         │         │         │         │         │    │
│  └────────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────┐    ┌──────┐ ┌──────┐ ┌────┐   │
│  │                                             │    │SPECS │ │SCRAP │ │ OK │   │
│  │  Fleet Maintenance: 45 BC/turn              │    └──────┘ └──────┘ └────┘   │
│  │                                             │                               │
│  └─────────────────────────────────────────────┘                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Column Structure (7 Columns)

| Column | Content |
|--------|---------|
| 1 - SYSTEM | System name where fleet is located (or destination if in transit) |
| 2-7 - SHIP DESIGNS | One column per ship design (max 6 designs in game) |

### System Column
- Shows system name in white text, left-aligned
- If orbiting: just the name (e.g., "FIRMA")
- If in transit: arrow + destination + ETA (e.g., "→ ALTAIR, ETA: 3")
- May show a colony/status indicator below the name

### Ship Design Columns
- Column header shows ship design name
- Each cell shows:
  - Pixel-art ship sprite (if ships of that type are present)
  - Ship count in **bottom-right corner** of the image box
  - Cell is solid black if no ships of that type at that location

```
┌─────────┐
│         │
│  [IMG]  │
│      12 │  ← Count in bottom-right
└─────────┘
```

---

## Row Structure

Each row represents a **fleet at a specific location**:

- Orbiting fleets: System name in first column
- In-transit fleets: Destination with arrow prefix and ETA

**Clicking a row** returns to the Galaxy Map with that fleet selected.

---

## Bottom Section

### Fleet Maintenance Display (Bottom-Left)
```
┌─────────────────────────────────────────────┐
│                                             │
│  Fleet Maintenance: 45 BC/turn              │
│                                             │
└─────────────────────────────────────────────┘
```
Shows total maintenance cost for all ships in the empire. Displayed in a bordered rectangle with light text on dark background.

### Buttons (Bottom-Right)

Three **raised pixel-art style buttons**, right-aligned, displayed in a row:

| Button | Action |
|--------|--------|
| **SPECS** | View ship design specifications |
| **SCRAP** | Scrap selected ships (opens scrap dialog) |
| **OK** | Close Fleet screen, return to Galaxy Map |

Buttons use the standard MOO1 raised-border style (lighter top/left edges, darker bottom/right edges on a medium-gray background).

---

## Interactions

| Action | Result |
|--------|--------|
| Click fleet row | Return to Galaxy Map with that fleet selected |
| Click SPECS | View detailed ship design specs |
| Click SCRAP | Open ship scrapping interface |
| Click OK | Close screen, return to Galaxy Map |
| Press ESC | Close screen, return to Galaxy Map |

---

## Design Constraints

- **Maximum 6 ship designs**: The game only allows 6 active ship designs at a time
- **Column headers**: Show design names (e.g., "Scout", "Fighter", "Destroyer")
- **Empty cells**: If no ships of a type exist at a location, cell is solid black
- **Scrolling**: If many fleets exist, list scrolls vertically
- **No decorative border**: The screen has a plain black background; the title + rule provide the only top decoration

---

## Example Data

| System | Scout | Fighter | Destroyer | Cruiser | Battleship | Colony |
|--------|-------|---------|-----------|---------|------------|--------|
| FIRMA | 12 | 4 | - | - | - | 1 |
| CENTAURI | 3 | - | 2 | - | - | - |
| → ALTAIR (3) | 6 | 8 | - | - | - | - |
| SOL | - | - | - | 1 | - | - |

*Fleet Maintenance: 45 BC/turn*

---

## Reference Screenshots

![MOO1 Fleet Screen](../../moo_screens/moo_fleet_screen.png)
