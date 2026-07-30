# Command Menu: PLANETS (F2) - MOO1-Accurate Wireframe

## Overview

The PLANETS command button opens the Planet Management screen. This is a **full-screen replacement view** (replaces the galaxy map) that provides a tabular overview of all planets currently owned by the player's empire. The bottom command bar remains visible (QoL improvement over MOO1).

**Reference**: Master of Orion (1993) Planet Management Screen  
**Hotkey**: F2

---

## Screen Layout

This screen is a **full navigation screen with the bottom command bar** (QoL improvement over MOO1). The OK button at the bottom-right returns to the Galaxy Map.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│  ┌──────┬──────────────────┬──────┬──────┬──────┬──────┬──────┬──────┬───────────────┐ │
│  │ IMG  │  PLANET NAME     │ POP  │ FACT │ SHD  │ BASE │ WST  │ PROD │ BUILDING      │ │
│  ├──────┼──────────────────┼──────┼──────┼──────┼──────┼──────┼──────┼───────────────┤ │
│  │ [🌍] │  Sol III         │ ███░ │  47  │   2  │   0  │   0  │ 101  │ COLONY SHIP   │ │
│  │ [🪐] │  Proxima II      │ █░░░ │   8  │   0  │   0  │   1  │  12  │ FACTORY       │ │
│  │ [🌑] │  Vega IV         │ ██░░ │  23  │   1  │   0  │   0  │  38  │ MISSILE BASE  │ │
│  │      │                  │      │      │      │      │      │      │               │ │
│  │      │                  │      │      │      │      │      │      │               │ │
│  │      │                  │      │      │      │      │      │      │               │ │
│  │      │                  │      │      │      │      │      │      │               │ │
│  │      │                  │      │      │      │      │      │      │               │ │
│  │      │                  │      │      │      │      │      │      │               │ │
│  │      │                  │      │      │      │      │      │      │               │ │
│  │      │                  │      │      │      │      │      │      │               │ │
│  │      │                  │      │      │      │      │      │      │               │ │
│  │      │                  │      │      │      │      │      │      │               │ │
│  │      │                  │      │      │      │      │      │      │               │ │
│  │      │                  │      │      │      │      │      │      │               │ │
│  └──────┴──────────────────┴──────┴──────┴──────┴──────┴──────┴──────┴───────────────┘ │
│                                                                                         │
│  ┌──────────────────────────┐  ┌──────────────────────────┐  ┌─────────────────────┐   │
│  │       SPENDING           │  │         TOTALS           │  │       FINANCE       │   │
│  │  ════════════════════    │  │  ════════════════════    │  │  ═════════════════  │   │
│  │  SHIPS:      0.0 BC      │  │  TRADE:       0 BC       │  │  RESERVE:   500 BC  │   │
│  │  BASES:      0.0 BC      │  │  PLANETS:   103 BC       │  │                     │   │
│  │  SPYING:     0.0 BC      │  │  TOTAL:     103 BC       │  │  [▲]  [  0  ]  [▼]  │   │
│  │  SECURITY:   0.0 BC      │  │                          │  │                     │   │
│  │                          │  │                          │  │  [    TRANSFER    ]  │   │
│  │                          │  │                          │  │  [       OK       ]  │   │
│  └──────────────────────────┘  └──────────────────────────┘  └─────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Column Definitions

| Column | Width | Description |
|--------|-------|-------------|
| **IMG** | Narrow | Small planet thumbnail/graphic — unique per planet type |
| **PLANET NAME** | Wide | The name of the planet (all caps) |
| **POP** | Medium | Population displayed as a segmented bar (filled segments = current pop, empty = capacity) |
| **FACT** | Narrow | Number of factories built |
| **SHD** | Narrow | Planetary shield level (0 = none) |
| **BASE** | Narrow | Number of missile bases |
| **WST** | Narrow | Waste output (increases with factories; reduced by ecology spending) |
| **PROD** | Narrow | Total production output in BCs/turn |
| **BUILDING** | Wide | What the planet's industry is currently building (ship class, structure type, etc.) |

### Key Layout Notes
- The **planet image thumbnail** is the leftmost column — a small rendered planet graphic, unique per world
- **Population** is shown as a **segmented bar** (not a raw number), indicating current vs. maximum population visually
- The **BUILDING** column is the widest right-hand column and shows the active production item in text form
- All column headers appear in a single header row above the planet list
- The list is **scrollable** if colonies exceed visible rows (~12–15 rows fit on screen)
- Selecting a row **highlights** it; double-clicking or pressing Enter opens the Planet Detail View

---

## Bottom Panels (Three-Column Layout)

### Left Panel — SPENDING
Shows empire-wide per-turn expenditures broken down by category:
- **SHIPS** — maintenance cost of all ships in fleet
- **BASES** — maintenance cost of missile bases
- **SPYING** — espionage spending
- **SECURITY** — counter-espionage spending

### Center Panel — TOTALS
Shows net empire income per turn:
- **TRADE** — income from active trade treaties
- **PLANETS** — total production income from all colonies
- **TOTAL** — combined net income

### Right Panel — FINANCE
Controls BC transfers to the selected (highlighted) planet:
- **RESERVE** — current empire treasury balance in BCs
- **Amount Selector** — up/down arrow buttons flanking a numeric field; adjusts transfer amount
- **[ TRANSFER ]** — sends selected BC amount from reserve to the highlighted planet's production
- **[ OK ]** — closes the screen and returns to the Galaxy Map

---

## Interactions

| Action | Result |
|--------|--------|
| Click planet row | Selects/highlights that planet for finance operations |
| Double-click planet row | Opens the full Planet Detail / Colony Management view |
| [▲] / [▼] buttons | Increases / decreases BC transfer amount |
| [ TRANSFER ] | Moves selected BCs from Reserve to the highlighted planet |
| [ OK ] / ESC | Closes Planet Management and returns to the Galaxy Map |
| Scroll (list) | Scrolls the planet list if more colonies than visible rows |

---

## Related Screens

### Colony Ship Arrives at Uninhabited Planet
When a colony ship reaches an uncolonized world, an **event overlay** appears on the Galaxy Map:
- Centered modal panel over the galaxy map background
- Shows: planet graphic, planet name, type, size, and environment descriptors
- Two action buttons: **[ COLONIZE ]** and **[ ABANDON ]** (or similar dismiss option)
- Stats shown: planet size (Tiny/Small/Medium/Large/Huge), environment type (Terran, Ocean, Arid, etc.), and mineral richness

### New Colony Established Screen
After confirming colonization, a dedicated full-screen or large panel appears:
- Large planet image on the **left side**
- Planet name (prominent, top)
- Stats listed on the **right**: size, type, gravity, atmosphere, mineral richness, max population
- Confirm / **[ OK ]** button at the bottom

### Start-of-Turn: New Planet Discovery
At the start of a turn when scouts or colony ships reveal a new world:
- A notification/reveal panel slides in or appears
- Shows planet image + summary stats
- **[ OK ]** button to dismiss and continue
- Used for both newly scouted planets and confirmed new colonies

---

---

## 4-Column Interaction Element Table

| UI Element | (a) Trigger Response | (b) Visual Transition | (c) Return Path / Exit Method |
| :--- | :--- | :--- | :--- |
| **`[PLANETS]` Command Button** | Opens Colony Overview List screen | Fades out Galaxy Map view and opens Planets List overview (`moo_planets.png`) | Click `[OK]`, select a colony row, or press `Esc` to return to Galaxy Map |

---

## Reference Screenshots

| Screenshot | Description |
|------------|-------------|
| ![MOO1 Planets Screen](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_planets.png) | Main Planet Management screen (F6) — full colony list with stats |
| ![Colony Ship Arrives](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_colony_ship_arrives_at_potential_planet.png) | Event overlay when a colony ship reaches an uninhabited planet |
| ![New Colony Screen](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_colony_screen.png) | Post-colonization confirmation screen with full planet stats |
| ![New Planet Reveal](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_new_planet_reveal.png) | Start-of-turn notification revealing a newly discovered world |
