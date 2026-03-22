# Galaxy Map UI - Detailed Wireframe Specification

## Overview

The Galaxy Map is the primary hub screen in Hamster of Orion, serving as the main interface for exploration, fleet movement, strategic overview, and navigation to all other game screens. This specification provides detailed ASCII wireframes matching MOO1 behavior while incorporating modern web enhancements.

**Reference**: Master of Orion (1993) Main Galaxy Screen  
**Hotkey**: F1  
**Target Resolution**: 1920×1080 (scalable)

---

## Screen Layout: Default View (Nothing Selected)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 1  │  Treasury: 500 BC  │  [F2][F3][F4][F5][F6][F7]  ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║ ┌──Empire Info──┐   ╔══════════════════════════════════════════════════════╗   ┌───Legend────┐   ║
║ │               │   ║                                                      ║   │             │   ║
║ │ ┌───────────┐ │   ║            ·              ★                          ║   │ ★ Yellow    │   ║
║ │ │           │ │   ║     ·    ·        ·              ·                    ║   │ ✦ Blue      │   ║
║ │ │  [Race    │ │   ║        ●              ◈       ·        ★             ║   │ ✴ Red       │   ║
║ │ │  Portrait]│ │   ║   ✴         ★                     ·                  ║   │ ✵ White     │   ║
║ │ │           │ │   ║      ·         ✦    ●        ·         ◉             ║   │ · Unexplored│   ║
║ │ └───────────┘ │   ║          ◉            ·   ✵                          ║   │             │   ║
║ │               │   ║   ★           ·            ★         ·    ✴          ║   │ ● Your Col. │   ║
║ │ HAMSTERS      │   ║        ·   ✵         ●              ·                ║   │ ◉ Enemy Col.│   ║
║ │               │   ║             ·    ·          ✦                 ·      ║   │ ◈ Neutral   │   ║
║ │───────────────│   ║   ·              ★       ·       ·                   ║   │             │   ║
║ │ Colonies:   3 │   ║         ●                   ·          ★             ║   │ ▲ Your Fleet│   ║
║ │ Population: 35M│   ║      ✴      ·    ✵      ·        ✦         ·        ║   │ △ Enemy Flt │   ║
║ │ Ships:     12 │   ║   ·       ·          ·              ·                ║   │             │   ║
║ │ Bases:      4 │   ║              ★    ·        ·    ✴                    ║   │─────────────│   ║
║ │───────────────│   ║                                                      ║   │ [+] Zoom In │   ║
║ │ Income:  +85BC│   ╚══════════════════════════════════════════════════════╝   │ [-] Zoom Out│   ║
║ │ Expenses:-35BC│                                                               │ [⊕] Center  │   ║
║ │ Net:     +50BC│                                                               │             │   ║
║ │───────────────│   ┌─────────────────────────────────────────────────────┐   │ [?] Help    │   ║
║ │ Research:     │   │                                                     │   └─────────────┘   ║
║ │ Plasma Cannon │   │  Select a star to view system information           │                      ║
║ │ ████████░░ 80%│   │  Select a fleet to issue movement orders            │                      ║
║ │ ETA: 2 turns  │   │                                                     │                      ║
║ └───────────────┘   └─────────────────────────────────────────────────────┘                      ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Notifications: [!] Research Complete: Fusion Rifle [View]  │  Enemy fleet spotted at Rigel    ║
║                                                                               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Star Selected State

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 1  │  Treasury: 500 BC  │  [F2][F3][F4][F5][F6][F7]  ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║ ┌──Empire Info──┐   ╔══════════════════════════════════════════════════════╗   ┌───Legend────┐   ║
║ │               │   ║                                                      ║   │             │   ║
║ │ ┌───────────┐ │   ║            ·              ★                          ║   │ ★ Yellow    │   ║
║ │ │           │ │   ║     ·    ·        ·              ·                    ║   │ ✦ Blue      │   ║
║ │ │  [Race    │ │   ║        ●              ◈       ·        ★             ║   │ ✴ Red       │   ║
║ │ │  Portrait]│ │   ║   ✴         ★                     ·                  ║   │ ✵ White     │   ║
║ │ │           │ │   ║      ·        [✦]───●        ·         ◉             ║   │ · Unexplored│   ║
║ │ └───────────┘ │   ║          ◉     ╲      ·   ✵                          ║   │             │   ║
║ │               │   ║   ★           · ╲          ★         ·    ✴          ║   │ ● Your Col. │   ║
║ │ HAMSTERS      │   ║        ·   ✵    ╲    ●              ·                ║   │ ◉ Enemy Col.│   ║
║ │               │   ║             ·    ·──────✦                 ·          ║   │ ◈ Neutral   │   ║
║ │───────────────│   ║   ·              ★       ·       ·                   ║   │             │   ║
║ │ Colonies:   3 │   ║         ●                   ·          ★             ║   │ ▲ Your Fleet│   ║
║ │ Population: 35M│   ║      ✴      ·    ✵      ·        ✦         ·        ║   │ △ Enemy Flt │   ║
║ │ Ships:     12 │   ║   ·       ·          ·              ·                ║   │             │   ║
║ │ Bases:      4 │   ║              ★    ·        ·    ✴                    ║   │ [✦] Selected│   ║
║ │───────────────│   ║                                                      ║   │ ─── Range   │   ║
║ │ Income:  +85BC│   ╚══════════════════════════════════════════════════════╝   │             │   ║
║ │ Expenses:-35BC│                                                               │─────────────│   ║
║ │ Net:     +50BC│                                                               │ [+] Zoom In │   ║
║ │───────────────│   ┌─────────────────────────────────────────────────────┐   │ [-] Zoom Out│   ║
║ │ Research:     │   │ ◆ SIRIUS SYSTEM                                     │   │ [⊕] Center  │   ║
║ │ Plasma Cannon │   │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│   │             │   ║
║ │ ████████░░ 80%│   │ Star Type: Blue (B-Class)    Sector: Alpha-7       │   │ [?] Help    │   ║
║ │ ETA: 2 turns  │   │ Planets: 3 (1 habitable)     Distance: 5 parsecs   │   └─────────────┘   ║
║ └───────────────┘   │                                                     │                      ║
║                     │ 🌍 Sirius I    - COLONIZED (Yours)                  │                      ║
║                     │    Type: Ocean | Pop: 12M/80M | Prod: 32 BC/turn   │                      ║
║                     │                                                     │                      ║
║                     │ 🌑 Sirius II   - Barren (Uncolonized)              │                      ║
║                     │    Size: Medium | Requires: Controlled Environment │                      ║
║                     │                                                     │                      ║
║                     │ ⭕ Sirius III  - Gas Giant (Not colonizable)        │                      ║
║                     │                                                     │                      ║
║                     │ Fleets at Sirius:                                   │                      ║
║                     │  ▲ Scout Squadron (3 ships) - Yours                │                      ║
║                     │                                                     │                      ║
║                     │   [VIEW COLONY]  [SEND FLEET]  [CLOSE ×]           │                      ║
║                     └─────────────────────────────────────────────────────┘                      ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Notifications: [!] Research Complete: Fusion Rifle [View]  │  Enemy fleet spotted at Rigel    ║
║                                                                               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Fleet Selected State

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 1  │  Treasury: 500 BC  │  [F2][F3][F4][F5][F6][F7]  ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║ ┌──Empire Info──┐   ╔══════════════════════════════════════════════════════╗   ┌───Legend────┐   ║
║ │               │   ║                    ╭───────────╮                      ║   │             │   ║
║ │ ┌───────────┐ │   ║            ·      ╱★           ╲                      ║   │ ★ Yellow    │   ║
║ │ │           │ │   ║     ·    · ╱     ╱      ·       ╲     ·               ║   │ ✦ Blue      │   ║
║ │ │  [Race    │ │   ║        ●  ╱     ╱   ◈       ·    ╲   ★               ║   │ ✴ Red       │   ║
║ │ │  Portrait]│ │   ║   ✴      ╱ ★   ╱                  ╲ ·                 ║   │ ✵ White     │   ║
║ │ │           │ │   ║      · ╱      ╱ ✦    ●        ·    ╲   ◉             ║   │ · Unexplored│   ║
║ │ └───────────┘ │   ║       ╱ ◉    ╱       ·   ✵          ╲                 ║   │             │   ║
║ │               │   ║   ★  ╱     ╱ ·            ★     ╲   ·    ✴           ║   │ ● Your Col. │   ║
║ │ HAMSTERS      │   ║     ╱ ·  ╱✵         ●            ╲  ·                 ║   │ ◉ Enemy Col.│   ║
║ │               │   ║    ╱    ╱    ·    ·          ✦     ╲       ·          ║   │ ◈ Neutral   │   ║
║ │───────────────│   ║   ╱·   ╱          ★       ·       · ╲                 ║   │             │   ║
║ │ Colonies:   3 │   ║  ╱    ╱  ●                   ·       ╲   ★            ║   │[▲]Your Fleet│   ║
║ │ Population: 35M│   ║ ╱  ✴ ╱    ·    ✵      ·        ✦     ╲  ·            ║   │ △ Enemy Flt │   ║
║ │ Ships:     12 │   ║╱·   ╱ ·          ·              ·      ╲              ║   │             │   ║
║ │ Bases:      4 │   ║    [▲]──────→ ★    ·        ·    ✴     ╲             ║   │ ╭──╮ Range  │   ║
║ │───────────────│   ║      ╲                                  ╱             ║   │ ──→ Route   │   ║
║ │ Income:  +85BC│   ║       ╲          ╲           ╱         ╱              ║   │             │   ║
║ │ Expenses:-35BC│   ╚════════╲══════════╲═════════╱═════════╱═══════════════╝   │─────────────│   ║
║ │ Net:     +50BC│             ╲          ╲       ╱         ╱                    │ [+] Zoom In │   ║
║ │───────────────│              ╰──────────╲─────╱─────────╯                     │ [-] Zoom Out│   ║
║ │ Research:     │   ┌─────────────────────────────────────────────────────┐   │ [⊕] Center  │   ║
║ │ Plasma Cannon │   │ ▲ BATTLE GROUP ALPHA                                │   │             │   ║
║ │ ████████░░ 80%│   │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│   │ [?] Help    │   ║
║ │ ETA: 2 turns  │   │ Location: Sol System          Status: Idle         │   └─────────────┘   ║
║ └───────────────┘   │ Destination: ★ Deneb          ETA: 3 turns         │                      ║
║                     │ Speed: 4 parsecs/turn         Range: 8 parsecs     │                      ║
║                     │                                                     │                      ║
║                     │ Ships (12 total):                      Strength:   │                      ║
║                     │  • Cruiser "Sunflower"      (1)        ★★★☆☆      │                      ║
║                     │  • Destroyer "Whiskers" ×6  (6)                    │                      ║
║                     │  • Fighter "Pellet" ×5      (5)                    │                      ║
║                     │                                                     │                      ║
║                     │ [MOVE TO]  [SPLIT FLEET]  [CANCEL ORDERS]  [×]     │                      ║
║                     └─────────────────────────────────────────────────────┘                      ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Notifications: [!] Research Complete: Fusion Rifle [View]  │  Enemy fleet spotted at Rigel    ║
║                                                                               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Fleet Moving / Route Display

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 1  │  Treasury: 500 BC  │  [F2][F3][F4][F5][F6][F7]  ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║ ┌──Empire Info──┐   ╔══════════════════════════════════════════════════════╗   ┌───Legend────┐   ║
║ │               │   ║                                                      ║   │             │   ║
║ │ ┌───────────┐ │   ║            ·              ★                          ║   │ ★ Yellow    │   ║
║ │ │           │ │   ║     ·    ·        ·              ·                    ║   │ ✦ Blue      │   ║
║ │ │  [Race    │ │   ║        ●              ◈       ·        ★             ║   │ ✴ Red       │   ║
║ │ │  Portrait]│ │   ║   ✴         ★                     ·                  ║   │ ✵ White     │   ║
║ │ │           │ │   ║      ·         ✦    ●        ·         ◉             ║   │ · Unexplored│   ║
║ │ └───────────┘ │   ║          ◉            ·   ✵                          ║   │             │   ║
║ │               │   ║   ★           ·            ★         ·    ✴          ║   │ ● Your Col. │   ║
║ │ HAMSTERS      │   ║       [▲]━━━━━━━━━━━━━━━━━●              ·           ║   │ ◉ Enemy Col.│   ║
║ │               │   ║        ↑·    ·    ·          ✦                 ·     ║   │ ◈ Neutral   │   ║
║ │───────────────│   ║    In Transit              ·       ·                 ║   │             │   ║
║ │ Colonies:   3 │   ║    ETA: 2 turns  ●                  ·          ★     ║   │[▲]Your Fleet│   ║
║ │ Population: 35M│   ║      ✴      ·    ✵      ·        ✦         ·        ║   │ ━━ Route    │   ║
║ │ Ships:     12 │   ║   ·       ·          ·              ·                ║   │             │   ║
║ │ Bases:      4 │   ║              ★    ·        ·    ✴                    ║   │─────────────│   ║
║ │───────────────│   ║                                                      ║   │ [+] Zoom In │   ║
║ │ Income:  +85BC│   ╚══════════════════════════════════════════════════════╝   │ [-] Zoom Out│   ║
║ │ Expenses:-35BC│                                                               │ [⊕] Center  │   ║
║ │ Net:     +50BC│                                                               │             │   ║
║ │───────────────│   ┌─────────────────────────────────────────────────────┐   │ [?] Help    │   ║
║ │ Research:     │   │ ▲ BATTLE GROUP ALPHA (In Transit)                   │   └─────────────┘   ║
║ │ Plasma Cannon │   │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│                      ║
║ │ ████████░░ 80%│   │ From: Sol System                                    │                      ║
║ │ ETA: 2 turns  │   │ To:   New Hamsterton (● Your Colony)               │                      ║
║ └───────────────┘   │ Progress: ████████████░░░░░░░░ 60% (2 turns left)  │                      ║
║                     │                                                     │                      ║
║                     │    [CANCEL ORDERS]  [VIEW DESTINATION]  [×]        │                      ║
║                     └─────────────────────────────────────────────────────┘                      ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Notifications: [!] Research Complete: Fusion Rifle [View]  │  Enemy fleet spotted at Rigel    ║
║                                                                               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Interactive Elements Specification

### 1. Star Display

| Star Type | Symbol | Color | Description |
|-----------|--------|-------|-------------|
| Yellow (G-type) | ★ | `#ffa726` | Most Earth-like planets |
| Blue (B-type) | ✦ | `#42a5f5` | Hot, often hostile |
| Red (M-type) | ✴ | `#ef5350` | Cool, smaller planets |
| White (A-type) | ✵ | `#eeeeee` | Variable habitability |
| Unexplored | · | `#546e7a` | Unknown star type |

**Star States:**
- **Unvisited**: Dim, unknown star type (small dot)
- **Scouted**: Star type visible, planet count shown
- **Colonized (Yours)**: Bright highlight, ownership ring
- **Colonized (Enemy)**: Enemy color ring
- **Colonized (Neutral)**: Gray ring

### 2. Colony Indicators

| Indicator | Symbol | Description |
|-----------|--------|-------------|
| Your Colony | ● | Filled circle in your race color |
| Enemy Colony | ◉ | Circle with enemy race color |
| Neutral Colony | ◈ | Diamond shape, gray |
| Contested | ⊛ | Animated pulse effect |

### 3. Fleet Indicators

| Indicator | Symbol | Description |
|-----------|--------|-------------|
| Your Fleet (stationary) | ▲ | Solid triangle, race color |
| Your Fleet (moving) | ▷ | Arrow pointing to destination |
| Enemy Fleet (known) | △ | Hollow triangle, enemy color |
| Multiple Fleets | ▲² | Number superscript |
| Fleet + Colony | ●▲ | Combined display |

### 4. Selection Mechanics

**Click Interactions:**
| Action | Result |
|--------|--------|
| Click Star | Select star, show System Info Panel |
| Click Colony | Select star, highlight colony info |
| Click Fleet | Select fleet, show Fleet Panel, display range circle |
| Click Empty Space | Deselect all |
| Right-Click Star | Context menu (Send Fleet, Set Rally, etc.) |
| Right-Click Fleet | Context menu (Move, Split, Merge, etc.) |

**Drag Interactions:**
| Action | Result |
|--------|--------|
| Drag on map | Pan view |
| Drag fleet to star | Set fleet destination |
| Shift+Drag | Select multiple fleets |

**Keyboard Shortcuts:**
| Key | Action |
|-----|--------|
| F1 | Focus Galaxy Map |
| Space/Enter | End Turn |
| + / = | Zoom In |
| - | Zoom Out |
| Home | Center on home system |
| Arrow Keys | Pan map |
| Tab | Cycle through your fleets |
| Shift+Tab | Cycle through your colonies |
| Esc | Deselect / Open menu |

### 5. Info Panels

#### Left Panel: Empire Summary (Always Visible)
```
┌──Empire Info──┐
│               │
│ ┌───────────┐ │
│ │  [Race    │ │  ← 80×80 race portrait
│ │  Portrait]│ │
│ └───────────┘ │
│               │
│ HAMSTERS      │  ← Race name
│               │
│───────────────│
│ Colonies:   3 │  ← Total colonies
│ Population: 35M│  ← Total population (millions)
│ Ships:     12 │  ← Total ships
│ Bases:      4 │  ← Total missile bases
│───────────────│
│ Income:  +85BC│  ← BC per turn income
│ Expenses:-35BC│  ← Ship/base maintenance
│ Net:     +50BC│  ← Net income
│───────────────│
│ Research:     │
│ Plasma Cannon │  ← Current research
│ ████████░░ 80%│  ← Progress bar
│ ETA: 2 turns  │  ← Estimated completion
└───────────────┘
```

#### Right Panel: Legend (Collapsible)
```
┌───Legend────┐
│             │
│ ★ Yellow    │  ← Star types
│ ✦ Blue      │
│ ✴ Red       │
│ ✵ White     │
│ · Unexplored│
│             │
│ ● Your Col. │  ← Colony ownership
│ ◉ Enemy Col.│
│ ◈ Neutral   │
│             │
│ ▲ Your Fleet│  ← Fleet indicators
│ △ Enemy Flt │
│             │
│─────────────│
│ [+] Zoom In │  ← Zoom controls
│ [-] Zoom Out│
│ [⊕] Center  │  ← Center on home
│             │
│ [?] Help    │  ← Show hotkeys
└─────────────┘
```

#### Bottom Panel: Context Info / System Details
Shows information based on current selection (see state diagrams above).

### 6. Top Navigation Bar

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 1  │  Treasury: 500 BC  │  [F2][F3][F4][F5][F6][F7]  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

| Element | Description | Click Action |
|---------|-------------|--------------|
| [≡] | Hamburger menu | Open game menu (Save, Load, Settings, Exit) |
| Game Title | "HAMSTER OF ORION" | None (branding) |
| Year/Turn | Current game year and turn number | None (info display) |
| Treasury | Current BC balance | Hover: Show income/expense breakdown |
| [F2] | Planets | Go to Planet Management screen |
| [F3] | Fleets | Go to Fleet Command screen |
| [F4] | Research | Go to Research screen |
| [F5] | Diplomacy | Go to Diplomacy screen |
| [F6] | Ship Design | Go to Ship Design screen |
| [F7] | Reports | Go to Reports screen |

### 7. Bottom Notification Bar

```
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Notifications: [!] Research Complete: Fusion Rifle [View]  │  Enemy fleet spotted at Rigel    ║
║                                                                               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

| Element | Description | Click Action |
|---------|-------------|--------------|
| Notifications area | Scrolling event messages | Click message to dismiss or view details |
| [!] Critical | Red icon for urgent events | Click [View] to jump to location |
| [END TURN ⏎] | Large prominent button | Advance to next turn (hotkey: Enter/Space) |

---

## Range Display Mechanics

When a fleet is selected, display movement range:

### Visual Range Circle
```
               ╭───────────────────────╮
              ╱                         ╲
             ╱     ·    ★    ·           ╲
            ╱   ★      ╱╲        ·        ╲
           ╱          ╱  ╲                 ╲
          │    ●    ╱ ▲  ╲     ★    ●      │
          │        ╱      ╲                │
           ╲      ╱        ╲    ·         ╱
            ╲    ╱──RANGE───╲            ╱
             ╲  ╱   CIRCLE   ╲          ╱
              ╲╱              ╲        ╱
               ╰───────────────────────╯
```

**Range Colors:**
| Zone | Color | Description |
|------|-------|-------------|
| Full Range | Green border | Can reach this turn |
| Extended Range | Yellow/dashed | Can reach in 2 turns |
| Beyond Range | Grayed out | Cannot reach (fuel limit) |

**Range Calculation:**
- Range = Fleet speed × fuel reserves
- Display parsec distance to hovered star
- Show ETA in turns when hovering over reachable stars

---

## Fleet Destination Selection

When selecting a destination for a fleet:

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                   ║
║                         ╭─────────────────╮                                                       ║
║                        ╱   Reachable Stars ╲                                                      ║
║                       ╱     highlight with  ╲                                                     ║
║                      ╱      green glow       ╲                                                    ║
║                     ╱                         ╲                                                   ║
║                    │    ★     ·      [★]       │  ← Hovered star shows tooltip                   ║
║                    │         ↑                 │                                                  ║
║                    │    [▲]══╪══════════→      │  ← Dashed line shows route                      ║
║                    │    Fleet               ★  │                                                  ║
║                     ╲                         ╱                                                   ║
║                      ╲                       ╱                                                    ║
║                       ╲                     ╱                                                     ║
║                        ╲                   ╱                                                      ║
║                         ╰─────────────────╯                                                       ║
║                                                                                                   ║
║   ┌─────────────────────────────────────────────────────────────────────────────────────────┐   ║
║   │  SELECT DESTINATION: Click a star within range                                          │   ║
║   │  ══════════════════════════════════════════════════════════════════════════════════════│   ║
║   │  Hovering: ★ DENEB (Yellow G-type)                                                      │   ║
║   │  Distance: 5 parsecs  │  ETA: 2 turns  │  Status: Unexplored                           │   ║
║   │                                                                                         │   ║
║   │  [CONFIRM DESTINATION]  [CANCEL]                                                        │   ║
║   └─────────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Zoom Levels

The galaxy map supports 5 zoom levels:

### Level 1: Strategic Overview (Most Zoomed Out)
```
╔════════════════════════════════════════════════════════════════════════╗
║  ·  · ★ ·  ·  ✦  ·  ★  ·  ·  ✴  ·  ·  ★  ·  ·  ✦  ·  ★  ·  ·  ·  ✵  ║
║ ·  ★  ·  ·  ●  · ★  ·  ·  ✵  ·  ·  ★  ·  ◉  ·  ·  ✴  ·  ·  ★  ·  ·  ║
║  ·  ·  ◈  ·  ·  ✴  ·  ✦  ·  ·  ●  ·  ·  ·  ✵  ·  ·  ★  ·  ◉  ·  ·   ║
║ ★  ·  ·  ·  ★  ·  ·  ·  ·  ★  ·  ·  ◈  ·  ·  ·  ✦  ·  ·  ·  ·  ★  ·  ║
╚════════════════════════════════════════════════════════════════════════╝
```
- Stars: Small dots
- Colonies: Small filled circles
- Fleets: Not visible (too small)
- Labels: None

### Level 3: Normal View (Default)
```
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║            ·              ★                          ·                 ║
║     ·    ·        ·              ·                    ✦               ║
║        ●              ◈       ·        ★                              ║
║   ✴         ★                     ·                  ·                ║
║      ·         ✦    ●        ·         ◉            ★                 ║
║          ◉            ·   ✵                          ·                ║
║   ★           ·            ★         ·    ✴         ·                 ║
║        ·   ✵         ●              ·                ✦               ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
```
- Stars: Medium symbols with type visible
- Colonies: Clear ownership rings
- Fleets: Small triangles
- Labels: On hover only

### Level 5: Tactical View (Most Zoomed In)
```
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║                    ·                                                   ║
║                                                                        ║
║                                                                        ║
║                         ╭─SOL SYSTEM─╮                                ║
║                         │            │                                 ║
║                    ·    │    ★      │     ·                           ║
║                         │   ╱│╲     │                                  ║
║                         │  🌍│🌑    │                                  ║
║                         │ ╱  ▲  ╲   │                                  ║
║                         │╱Scout ╲  │                                  ║
║                         │Squadron│  │                                  ║
║                         ╰────────────╯                                ║
║                                           ·                            ║
║                                                                        ║
║                   ·                              ★                     ║
║                                                  SIRIUS                ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
```
- Stars: Large with name labels
- Colonies: Show planet icons
- Fleets: Show fleet names and ship counts
- Labels: Always visible

---

## Fog of War / Exploration States

### Star Visibility States

| State | Visual | Description |
|-------|--------|-------------|
| Unknown | Dark area | Never scouted, no information |
| Scouted | Star visible | Scout ship visited, basic info known |
| Colonized | Full info | Your colony present, full visibility |
| Intel | Partial info | Spy reports, may be outdated |

### Visual Representation
```
╔════════════════════════════════════════════════════════════════════════╗
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                                                ║
║ ▓▓▓ UNKNOWN ▓▓▓▓▓▓▓▓▓│      ·          ★                              ║
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│            ·                                   ║
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓·   │   ●                   ★         ·              ║
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓·     │         ·        ·                              ║
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓·       │   ★            ●              ·                 ║
║ ▓▓▓▓▓▓▓▓▓▓▓·         │      ·    ·         ·        ★                  ║
║ ▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░░│                                                ║
║ ▓▓▓▓▓▓▓▓▓ │ SCOUTED  │    KNOWN SPACE                                  ║
║ ▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░░│    (Your colonies provide sight)               ║
╚════════════════════════════════════════════════════════════════════════╝
```

---

## Context Menus

### Right-Click on Star
```
┌──────────────────────┐
│ ★ SOL SYSTEM         │
├──────────────────────┤
│ ► View System Info   │
│ ► Send Fleet Here    │
│ ► Set as Rally Point │
│ ► View Colony (F2)   │ ← Only if colonized
├──────────────────────┤
│   Center Map Here    │
└──────────────────────┘
```

### Right-Click on Fleet
```
┌──────────────────────┐
│ ▲ BATTLE GROUP ALPHA │
├──────────────────────┤
│ ► Set Destination    │
│ ► Split Fleet        │
│ ► Merge with...      │ ← If other fleet present
│ ► Cancel Orders      │
│ ► View Ships (F3)    │
├──────────────────────┤
│ ► Disband Fleet      │
└──────────────────────┘
```

### Right-Click on Empty Space
```
┌──────────────────────┐
│ ► Center Map Here    │
│ ► Zoom In            │
│ ► Zoom Out           │
├──────────────────────┤
│ ► Show All Fleets    │
│ ► Show All Colonies  │
└──────────────────────┘
```

---

## Tooltip Specifications

### Star System Tooltip (on hover)
```
┌─────────────────────────────┐
│ ★ SOL SYSTEM                │
│ ═══════════════════════════│
│ Star Type: Yellow (G-Class) │
│ Planets: 4                  │
│ ─────────────────────────── │
│ Colony: New Hamsterton      │
│ Owner: You (Hamsters)       │
│ Pop: 25M / 100M             │
│ ─────────────────────────── │
│ Click to select             │
│ Right-click for options     │
└─────────────────────────────┘
```

### Fleet Tooltip (on hover)
```
┌─────────────────────────────┐
│ ▲ SCOUT SQUADRON            │
│ ═══════════════════════════│
│ Ships: 3 total              │
│  • Scout ×3                 │
│ ─────────────────────────── │
│ Speed: 5 parsecs/turn       │
│ Range: 8 parsecs            │
│ Status: Idle                │
│ ─────────────────────────── │
│ Click to select             │
│ Drag to set destination     │
└─────────────────────────────┘
```

### Unreachable Star Tooltip
```
┌─────────────────────────────┐
│ ⚠ OUT OF RANGE              │
│ ═══════════════════════════│
│ ✴ BETELGEUSE                │
│ Distance: 15 parsecs        │
│ Fleet Range: 8 parsecs      │
│ ─────────────────────────── │
│ Need: Extended Fuel Tanks   │
│       or closer colony      │
└─────────────────────────────┘
```

---

## Special Visual States

### 1. Orion System (Endgame Target)
```
        ╭─────────────────╮
       ╱   ┌───────────┐   ╲
      ╱    │           │    ╲
     │     │ ◉ ORION   │     │   ← Unique golden glow
     │     │ [GUARDIAN]│     │   ← Guardian indicator
     │     │           │     │
      ╲    └───────────┘    ╱
       ╲  ENERGY BARRIER   ╱     ← Pulsing barrier effect
        ╰─────────────────╯
```

### 2. Combat Occurring
```
              ⚔
         ●═══════◉
              ⚔
```
Flash/pulse animation indicating battle in progress.

### 3. Blockaded System
```
        ╭─ BLOCKADED ─╮
       ╱               ╲
      │    ●           │
      │    ═           │
      │   △△△          │
       ╲               ╱
        ╰─────────────╯
```
Enemy fleet preventing access to your colony.

---

## Responsive Behavior

### Desktop (1920×1080)
- Full layout as shown in wireframes
- All panels visible
- Rich tooltips

### Laptop (1366×768)
- Side panels collapse to icons
- Click to expand panels
- Reduced star label density

### Tablet (1024×768)
- Touch-optimized
- Larger hit targets for stars (44px minimum)
- Bottom panel slides up from bottom
- Long-press replaces right-click

---

## Animation Specifications

| Element | Animation | Duration | Trigger |
|---------|-----------|----------|---------|
| Selection ring | Pulse glow | 1s loop | On select |
| Fleet movement | Smooth slide | 500ms | Turn end |
| Range circle | Fade in | 200ms | Fleet select |
| Route line | Dash animation | Continuous | While route displayed |
| Star discovery | Sparkle effect | 300ms | On scout arrival |
| Combat | Flash pulse | 500ms loop | During battle |
| Turn transition | Brief fade | 300ms | End turn |

---

## Accessibility Features

| Feature | Implementation |
|---------|----------------|
| Color Blind Mode | Shape-based indicators, not just color |
| High Contrast | Thicker borders, brighter colors |
| Screen Reader | All stars/fleets have aria labels |
| Keyboard Navigation | Full game playable without mouse |
| Zoom Controls | Large, clearly labeled buttons |
| Tooltips | 500ms delay, always visible text |

---

## Technical Notes

### Performance Targets
- Map rendering: 60fps during pan/zoom
- Star count: Up to 100 stars with smooth performance
- Fleet animations: 30fps minimum
- Memory: < 100MB for galaxy state

### Data Requirements
Each visible star needs:
```json
{
  "id": "star_001",
  "name": "Sol",
  "type": "yellow",
  "position": {"x": 500, "y": 300},
  "planets": 4,
  "owner": "player",
  "colony": {"name": "New Hamsterton", "population": 25},
  "fleets": ["fleet_001"],
  "visibility": "full"
}
```

---

## Related Documents

- `main-screens.md` - Overview of all game screens
- `UI_OVERVIEW.md` - General UI/UX guidelines
- `screen-inventory.md` - Complete screen inventory
- `fleet-command-wireframe.md` - Detailed fleet management (F3)
- `planet-management-wireframe.md` - Colony management (F2)

---

*Document Version: 1.0*
*Created: 2026-03-22*
*Based on: Master of Orion (1993) galaxy map interface*
