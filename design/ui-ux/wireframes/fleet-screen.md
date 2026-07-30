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

## 4-Column Interaction Element Table

| UI Element | (a) Trigger Response | (b) Visual Transition | (c) Return Path / Exit Method |
| :--- | :--- | :--- | :--- |
| **Fleet Row Selection** | Selects fleet row item | Highlights row with gold outline and focuses camera on host system | Remains selected; double click opens system on Galaxy Map |
| **`[SPECS]` Button** | Opens ship specification detail modal | Displays component loadout, weapon stats, and hull schematics | Click `[Close]` or press `Esc` to return to Fleet View |
| **`[SCRAP]` Button** | Triggers ship scrapping confirmation prompt | Displays confirmation modal `"Scrap selected ships for BC refund?"` | Click `[Cancel]` or press `Esc` to dismiss scrap modal |
| **`[OK]` Button** | Closes Fleet Screen | Fades out screen (`200ms`) and restores Galaxy Map view | Returns directly to Galaxy Map (`moo_galaxy_home.png`) |
| **Keyboard `Esc` Key** | Cancels active sub-modal or closes Fleet Screen | Fades out screen | Returns directly to Galaxy Map (`moo_galaxy_home.png`) |

---

## Reference Screenshots

![MOO1 Fleet Screen](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_fleet_screen.png)

