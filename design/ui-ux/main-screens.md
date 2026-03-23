# Main Game Screens

**Updated to match MOO1 layout based on reference screenshots.**

Reference: `design/moo_screens/` and `design/ui-ux/wireframes/moo1-reference-wireframes.md`

---

## 1. Main Menu

### Layout
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║               HAMSTER OF ORION                             ║
║          ________________________                          ║
║         /                        \                         ║
║        |   [Majestic Hamster]     |                        ║
║         \________________________/                         ║
║                                                            ║
║              [NEW GAME]                                    ║
║              [LOAD GAME]                                   ║
║              [SETTINGS]                                    ║
║              [CREDITS]                                     ║
║              [EXIT]                                        ║
║                                                            ║
║         Version 1.0  |  © 2026                             ║
╚════════════════════════════════════════════════════════════╝
```

### New Game Setup Flow
**Step 1: Galaxy Generation**
```
┌─────────────────────────────────────────────────────┐
│ GALAXY SETUP                                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Galaxy Size:    ( ) Small (24 stars)               │
│                 (•) Medium (48 stars)              │
│                 ( ) Large (70 stars)               │
│                 ( ) Huge (108 stars)               │
│                                                     │
│ Difficulty:     ( ) Simple                         │
│                 (•) Normal                         │
│                 ( ) Hard                           │
│                 ( ) Impossible                     │
│                                                     │
│ Opponents:      [  5  ] (1-9)                      │
│                                                     │
│         [< Back]              [Next >]             │
└─────────────────────────────────────────────────────┘
```

**Step 2: Race Selection**
```
┌─────────────────────────────────────────────────────┐
│ CHOOSE YOUR SPECIES                                 │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │[Hamster]│  │[ Mice  ]│  │[ Rats  ]│  ←Scroll→ │
│  │ Portrait│  │ Portrait│  │ Portrait│           │
│  └─────────┘  └─────────┘  └─────────┘           │
│                                                     │
│  HAMSTERS - The Diplomatic Engineers               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━             │
│  Bonuses:                                          │
│  ✓ +25% Diplomatic Relations                       │
│  ✓ Trade agreements worth +25% BC                  │
│                                                     │
│  "We shall unite the galaxy through commerce."    │
│                                                     │
│         [< Back]         [START GAME]              │
└─────────────────────────────────────────────────────┘
```

---

## 2. Galaxy Map (F1 - Hub Screen)

**NOTE: This is the primary game screen. Layout matches MOO1 exactly.**

### Screen Structure
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌────────────────────────────────────────────────────┐ ┌─────────────────────┐│
│  │                                                    │ │                     ││
│  │                                                    │ │   INFO PANEL        ││
│  │                                                    │ │   (Right Side)      ││
│  │                   STAR MAP                         │ │                     ││
│  │                   (~75% width)                     │ │   (~25% width)      ││
│  │                                                    │ │                     ││
│  │   Stars displayed as colored symbols              │ │   Context-sensitive ││
│  │   Colonies marked with filled circles             │ │   based on what     ││
│  │   Fleets shown as small arrows                    │ │   is selected       ││
│  │                                                    │ │                     ││
│  │                                                    │ │                     ││
│  │                                                    │ │                     ││
│  └────────────────────────────────────────────────────┘ └─────────────────────┘│
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Info Panel State: Colony Selected
When your own colony is selected, shows full colony details with production sliders.

```
┌─────────────────────┐
│  FIRMA              │
│  ════════════════   │
│                     │
│  [★] Yellow Star    │
│  Terran  85 max pop │
│                     │
│  Population:  12    │
│  Factories:   45    │
│  Bases:        2    │
│  Waste:        3    │
│                     │
│  ─────────────────  │
│  PRODUCTION         │
│  ─────────────────  │
│                     │
│  SHIP ■■■□□□□□ 38%  │
│  DEF  ■□□□□□□□  0%  │
│  IND  ■■■■■□□□ 62%  │
│  ECO  ■□□□□□□□  0%  │
│  TECH ■□□□□□□□  0%  │
│                     │
│  Building: Scout    │
│  ████████░░ 2 turns │
│                     │
└─────────────────────┘
```

### Info Panel State: Unexplored Star
```
┌─────────────────────┐
│  ALTAIR             │
│  ════════════════   │
│                     │
│  [✴] Red Star       │
│                     │
│                     │
│   UNEXPLORED        │
│                     │
│                     │
│  Range: 4 parsecs   │
│  from nearest       │
│  colony             │
│                     │
│                     │
│                     │
│                     │
│                     │
│                     │
│                     │
│                     │
│                     │
└─────────────────────┘
```

### Info Panel State: Fleet Selected (at colony)
```
┌─────────────────────┐
│  FLEET AT FIRMA     │
│  ════════════════   │
│                     │
│  Orbiting:          │
│  Firma (Your Colony)│
│                     │
│  ─────────────────  │
│  SHIPS              │
│  ─────────────────  │
│                     │
│  Scout        x 2   │
│  Fighter      x 6   │
│  Colony Ship  x 1   │
│                     │
│  ─────────────────  │
│  Total: 9 ships     │
│                     │
│  Click destination  │
│  to send fleet      │
│                     │
│                     │
└─────────────────────┘
```

### Info Panel State: Fleet In Transit
```
┌─────────────────────┐
│  FLEET IN TRANSIT   │
│  ════════════════   │
│                     │
│  From: Firma        │
│  To:   Centauri     │
│  ETA:  3 turns      │
│                     │
│  ─────────────────  │
│  SHIPS              │
│  ─────────────────  │
│                     │
│  Scout        x 2   │
│  Fighter      x 4   │
│                     │
│  ─────────────────  │
│  Total: 6 ships     │
│  Speed: Warp 3      │
│                     │
│  [REDIRECT]         │
│                     │
└─────────────────────┘
```

### Selection Behavior
**Something is always selected.** When the game starts, your homeworld is automatically selected. Clicking empty space does NOT deselect - you must click another star or fleet to change selection.

### Bottom Command Bar
Always present on Galaxy Map screen:

```
┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐
│ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │
└──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘
  F10     F6       F3     F1     F5       F2       F4        ENTER
```

| Button | Function | Hotkey |
|--------|----------|--------|
| GAME | Save, Load, Options, Quit | F10 or ESC |
| DESIGN | Ship Design screen | F6 |
| FLEET | Fleet management | F3 |
| MAP | Galaxy Map (current) | F1 |
| RACES | Diplomacy screen | F5 |
| PLANETS | Colony list | F2 |
| TECH | Technology/Research | F4 |
| NEXT TURN | End turn, process AI | ENTER or SPACE |

### Star Map Symbols
```
Stars by Type:
  ★  Yellow star (G-type, most habitable)
  ✦  Blue star (hot, often hostile planets)
  ✴  Red star (cool, smaller planets)
  ✵  White star (various planet types)
  ·  Unexplored/unvisited star

Colony Status:
  ●  Your colony (filled, your empire color)
  ◉  Enemy colony (filled, their empire color)
  ◈  Uncolonized but habitable

Fleet Indicators:
  ▲  Your fleet (small triangle at star)
  △  Enemy fleet detected
  ─  Fleet route line (when in transit)
```

---

## 3. Planet Management (F2)

### Planets List View
Shows all your colonies. Click any to manage.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PLANETS                                            │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ COLONY         POP   FACT  BASE  PROD   BUILD        TURNS             │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ Firma           12    45     2    56    Scout          2               │   │
│  │ New Hamsterdam  25    78     4   102    Factory        1               │   │
│  │ Wheelton         8    23     0    31    Missile Base   5               │   │
│  │ Tunnelville     18    55     3    71    Cruiser       12               │   │
│  │ Burrowburg       5    12     0    15    Colony Ship    8               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Click colony to manage production sliders                                      │
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Single Planet Management
When a colony is clicked, shows detailed management:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FIRMA                                              │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  ┌───────────────────────┐  ┌─────────────────────────────────────────────────┐│
│  │                       │  │  PRODUCTION SLIDERS                             ││
│  │    ┌─────────────┐    │  │  ═══════════════════════════════════════════   ││
│  │    │             │    │  │                                                 ││
│  │    │  [PLANET    │    │  │  SHIP  ■■■■□□□□□□□□□□□□  38%   Scout (2 turns) ││
│  │    │   IMAGE]    │    │  │        └────────────────┴──────────────────────│││
│  │    │             │    │  │                                                 ││
│  │    └─────────────┘    │  │  DEF   ■□□□□□□□□□□□□□□□   0%   (none)          ││
│  │                       │  │        └────────────────┴──────────────────────│││
│  │  Terran Planet        │  │                                                 ││
│  │  Max Pop: 85          │  │  IND   ■■■■■■■■■□□□□□□□  62%   Factory (1 turn)││
│  │  Minerals: Rich       │  │        └────────────────┴──────────────────────│││
│  │                       │  │                                                 ││
│  └───────────────────────┘  │  ECO   ■□□□□□□□□□□□□□□□   0%   Clean           ││
│                             │        └────────────────┴──────────────────────│││
│  ┌───────────────────────┐  │                                                 ││
│  │  COLONY STATS         │  │  TECH  ■□□□□□□□□□□□□□□□   0%   (none)          ││
│  │  ════════════════════ │  │        └────────────────┴──────────────────────│││
│  │                       │  │                                                 ││
│  │  Population:    12    │  │  Drag sliders to adjust allocation              ││
│  │  Factories:     45    │  │  Total must equal 100%                          ││
│  │  Missile Bases:  2    │  │                                                 ││
│  │  Shield Level:  III   │  └─────────────────────────────────────────────────┘│
│  │  Waste:          3%   │                                                     │
│  │  Production:    56 BC │                                                     │
│  │                       │                                                     │
│  └───────────────────────┘                                                     │
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Production Slider Details

| Slider | Purpose | Builds |
|--------|---------|--------|
| **SHIP** | Ship construction | Ships from design queue |
| **DEF** | Planetary defense | Missile bases, planetary shields |
| **IND** | Industrial growth | Factories (up to max) |
| **ECO** | Ecology/terraform | Waste cleanup, terraforming |
| **TECH** | Research contribution | Adds to empire research pool |

---

## 4. Technology Screen (F4)

Based on `moo_tech.png` screenshot.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TECHNOLOGY                                         │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  Research Points: 127/turn                              Total Labs: 45          │
│                                                                                 │
│  ┌───────────┬───────────┬───────────┬───────────┬───────────┬───────────┐     │
│  │ COMPUTERS │CONSTRUCTN │FORCE FIELD│PLANETOLOGY│PROPULSION │  WEAPONS  │     │
│  ├───────────┼───────────┼───────────┼───────────┼───────────┼───────────┤     │
│  │           │           │           │           │           │           │     │
│  │  ████░░   │  ██████   │  ████░░   │  ██░░░░   │  ██████   │  ████░░   │     │
│  │   25%     │   40%     │   15%     │   5%      │   10%     │   5%      │     │
│  │           │           │           │           │           │           │     │
│  ├───────────┼───────────┼───────────┼───────────┼───────────┼───────────┤     │
│  │ Researching:          │           │           │           │           │     │
│  │           │           │           │           │           │           │     │
│  │ Battle    │ Duralloy  │ Class III │ Improved  │ Range 5   │ Fusion    │     │
│  │ Computer  │ Armor     │ Shields   │ Terraform │           │ Rifle     │     │
│  │ Mk II     │           │           │ +20       │           │           │     │
│  │           │           │           │           │           │           │     │
│  │ ████████░░│ ██████░░░░│ ████░░░░░░│ ██░░░░░░░░│ ██████████│ ████████░░│     │
│  │  80%      │  60%      │  40%      │  20%      │  DONE!    │  85%      │     │
│  │  2 turns  │  4 turns  │  6 turns  │ 12 turns  │           │  1 turn   │     │
│  │           │           │           │           │           │           │     │
│  └───────────┴───────────┴───────────┴───────────┴───────────┴───────────┘     │
│                                                                                 │
│  When research completes, choose next technology from available options.        │
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Technology Fields

| Field | Focus | Example Techs |
|-------|-------|---------------|
| **Computers** | Battle computers, ECM, scanners | Battle Computer II, Deep Space Scanner |
| **Construction** | Armor, factories, ship hulls | Duralloy Armor, Reduced Industrial Waste |
| **Force Fields** | Shields, repulsors, cloaking | Class III Shields, Repulsor Beam |
| **Planetology** | Terraforming, ecology, bio weapons | +20 Terraform, Soil Enrichment |
| **Propulsion** | Engines, fuel, range | Nuclear Engines, Range 5 |
| **Weapons** | Beams, missiles, bombs | Fusion Rifle, Merculite Missiles |

---

## 5. Ship Design Screen (F6)

Based on `moo_design.png` screenshot.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SHIP DESIGN                                        │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  ┌──────────────────┐│
│  │                     │  │  HULL CLASS                 │  │ AVAILABLE        ││
│  │                     │  │  ════════════════════       │  │ COMPONENTS       ││
│  │    ┌───────────┐    │  │                             │  │ ════════════════ ││
│  │    │           │    │  │  ( ) Scout      50 space    │  │                  ││
│  │    │           │    │  │  (●) Fighter   125 space    │  │ WEAPONS:         ││
│  │    │  [SHIP    │    │  │  ( ) Destroyer 300 space    │  │ ──────────────── ││
│  │    │  IMAGE]   │    │  │  ( ) Cruiser   700 space    │  │ Laser      [+]   ││
│  │    │           │    │  │  ( ) Battleship 1500 space  │  │ Gatling    [+]   ││
│  │    │           │    │  │  ( ) Dreadnought 3000 space │  │ Neutron P. [+]   ││
│  │    └───────────┘    │  │                             │  │ Fusion Rifle [+] ││
│  │                     │  ├─────────────────────────────┤  │                  ││
│  │  Design: HUNTER     │  │  CURRENT LOADOUT            │  │ SHIELDS:         ││
│  │                     │  │  ════════════════════       │  │ ──────────────── ││
│  │                     │  │                             │  │ Class I    [+]   ││
│  └─────────────────────┘  │  Weapon 1: Laser      x2    │  │ Class II   [+]   ││
│                           │  Weapon 2: Gatling    x1    │  │                  ││
│  ┌─────────────────────┐  │  Shield:   Class II         │  │ SPECIALS:        ││
│  │  SHIP STATS         │  │  Armor:    Titanium         │  │ ──────────────── ││
│  │  ════════════════   │  │  Engine:   Retros           │  │ ECM Jammer [+]   ││
│  │                     │  │  Special:  None             │  │ Scanner    [+]   ││
│  │  Space Used: 98/125 │  │                             │  │                  ││
│  │  Cost: 45 BC        │  │  [CLEAR]  [AUTO]  [DONE]    │  │ ENGINES:         ││
│  │  Attack: 4          │  │                             │  │ ──────────────── ││
│  │  Defense: 2         │  │                             │  │ Retros     [+]   ││
│  │  HP: 3              │  └─────────────────────────────┘  │ Nuclear    [+]   ││
│  │  Speed: Warp 1      │                                   │                  ││
│  │  Range: 4           │                                   └──────────────────┘│
│  └─────────────────────┘                                                        │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  [< PREV]  Design 2 of 6: HUNTER  [NEXT >]         [NEW]  [SCRAP]        │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Ship Classes

| Class | Space | Cost Range | Role |
|-------|-------|------------|------|
| Scout | 50 | 10-25 BC | Exploration, early defense |
| Fighter | 125 | 25-75 BC | Fleet combat |
| Destroyer | 300 | 75-200 BC | Multi-role warship |
| Cruiser | 700 | 200-500 BC | Heavy combat |
| Battleship | 1500 | 500-1500 BC | Capital ship |
| Dreadnought | 3000 | 1500-5000 BC | Ultimate warship |

---

## 6. Fleet Management (F3)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FLEET COMMAND                                      │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ LOCATION          SHIPS                               DESTINATION       │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ Firma             Scout x2, Fighter x6, Colony x1    (orbiting)        │   │
│  │ Centauri          Fighter x4, Destroyer x2           (orbiting)        │   │
│  │ In Transit        Scout x3                           Altair (2 turns)  │   │
│  │ In Transit        Cruiser x1, Fighter x8             Kronos (5 turns)  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  FLEET TOTALS:                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Scout: 5    Fighter: 18    Destroyer: 2    Cruiser: 1    Battleship: 0        │
│  Colony Ship: 1    Total Ships: 27    Maintenance: 35 BC/turn                   │
│                                                                                 │
│  Click a fleet to select, then click destination on map                         │
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Diplomacy Screen (F5)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              RACES                                              │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │             │ │             │ │             │ │             │              │
│  │ [GUINEA    ]│ │ [RATS      ]│ │ [MICE      ]│ │ [ANTS      ]│              │
│  │ [PIG       ]│ │ [PORTRAIT  ]│ │ [PORTRAIT  ]│ │ [PORTRAIT  ]│              │
│  │             │ │             │ │             │ │             │              │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘              │
│   GUINEA PIGS    RATS            MICE            ANTS                         │
│   ───────────    ────            ────            ────                         │
│   WAR            PEACE           ALLIANCE        NO CONTACT                   │
│   Hostile        Friendly        Allied          Unknown                      │
│                                                                                 │
│  Click a race to open diplomacy options                                        │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     GUINEA PIGS - DIPLOMACY                             │   │
│  │  ═══════════════════════════════════════════════════════════════════   │   │
│  │                                                                         │   │
│  │  Current Status: WAR                                                    │   │
│  │  Attitude: Hostile (-75)                                                │   │
│  │                                                                         │   │
│  │  [OFFER PEACE]  [PROPOSE TREATY]  [DECLARE WAR]  [THREATEN]            │   │
│  │                                                                         │   │
│  │  Treaties Available: Non-Aggression, Trade, Alliance                    │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Game Menu (ESC / GAME button)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                                                                                 │
│                    ┌───────────────────────────────┐                           │
│                    │         GAME MENU             │                           │
│                    │  ═══════════════════════════  │                           │
│                    │                               │                           │
│                    │       [SAVE GAME]             │                           │
│                    │                               │                           │
│                    │       [LOAD GAME]             │                           │
│                    │                               │                           │
│                    │       [OPTIONS]               │                           │
│                    │                               │                           │
│                    │       [RETIRE]                │                           │
│                    │                               │                           │
│                    │       [QUIT TO MENU]          │                           │
│                    │                               │                           │
│                    │       [RETURN TO GAME]        │                           │
│                    │                               │                           │
│                    └───────────────────────────────┘                           │
│                                                                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary: Key UI Principles (MOO1 Faithful)

1. **Bottom Command Bar** - Always visible, 8 buttons, consistent across all screens
2. **Right-Side Info Panel** - Context-sensitive on galaxy map
3. **No Top Status Bar** - Info embedded in right panel instead
4. **Production Sliders** - 5 sliders (SHIP/DEF/IND/ECO/TECH) totaling 100%
5. **Tech Allocation** - 6 fields with percentage sliders
6. **Hotkey Support** - F1-F10 for navigation, ENTER for end turn
