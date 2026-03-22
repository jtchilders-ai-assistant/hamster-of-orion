# MOO1-Accurate UI Wireframes

Based on actual MOO1 screenshots from `design/moo_screens/`.

---

## 1. Galaxy Map - Colony Selected (`moo_galaxy_home.png`)

When your own colony is selected, the right panel shows full colony details with production sliders.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌────────────────────────────────────────────────────┐ ┌─────────────────────┐│
│  │                                                    │ │  FIRMA              ││
│  │                    STAR MAP                        │ │  ════════════════   ││
│  │                                                    │ │                     ││
│  │    Various colored stars scattered                 │ │  [★] Yellow Star    ││
│  │    across black space background                   │ │  Terran  85 max pop ││
│  │                                                    │ │                     ││
│  │         ·    ★         ·                          │ │  Population:  12    ││
│  │    ·              ·         ★     ·               │ │  Factories:   45    ││
│  │              ✴                          ·         │ │  Bases:        2    ││
│  │      ★              [●]◄─ Selected                │ │  Waste:        3    ││
│  │           ·    ·              ★                   │ │                     ││
│  │    ·                    ·           ·             │ │  ─────────────────  ││
│  │         ★       ·    ✦         ·                  │ │  PRODUCTION         ││
│  │                         ·                ★        │ │  ─────────────────  ││
│  │      ·        ·              ·                    │ │                     ││
│  │           ✵          ★           ·                │ │  SHIP ■■■□□□□□ 38%  ││
│  │    ·              ·         ·          ·          │ │  DEF  ■□□□□□□□  0%  ││
│  │                                                    │ │  IND  ■■■■■□□□ 62%  ││
│  │                                                    │ │  ECO  ■□□□□□□□  0%  ││
│  │                                                    │ │  TECH ■□□□□□□□  0%  ││
│  │                                                    │ │                     ││
│  │                                                    │ │  Building: Scout    ││
│  │                                                    │ │  ████████░░ 2 turns ││
│  └────────────────────────────────────────────────────┘ └─────────────────────┘│
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Right Panel Elements (Colony Selected):
- **Star name** (large, top)
- **Star type icon** + star classification
- **Planet type** + max population
- **Colony stats**: Population, Factories, Missile Bases, Waste %
- **Production sliders** (5 sliders):
  - SHIP - Ship construction allocation
  - DEF - Defense (missile bases, shields)
  - IND - Industry (factory construction)
  - ECO - Ecology (waste cleanup, terraforming)
  - TECH - Research contribution
- **Current build** + turns remaining

---

## 2. Galaxy Map - Unexplored Star (`moo_galaxy_unexplored.png`)

When an unexplored star is selected, minimal info shown.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌────────────────────────────────────────────────────┐ ┌─────────────────────┐│
│  │                                                    │ │                     ││
│  │                    STAR MAP                        │ │  ROMULAS            ││
│  │                                                    │ │  ════════════════   ││
│  │                                                    │ │                     ││
│  │         ·    ★         ·                          │ │  [✴] Red Star       ││
│  │    ·              ·         ★     ·               │ │                     ││
│  │              ✴                          ·         │ │                     ││
│  │      ★                                            │ │                     ││
│  │           ·    [·]◄─ Selected (unexplored)        │ │   UNEXPLORED        ││
│  │    ·                    ·           ·             │ │                     ││
│  │         ★       ·    ✦         ·                  │ │                     ││
│  │                         ·                ★        │ │  Range: 4 parsecs   ││
│  │      ·        ·              ·                    │ │  from nearest       ││
│  │           ✵          ★           ·                │ │  colony             ││
│  │    ·              ·         ·          ·          │ │                     ││
│  │                                                    │ │                     ││
│  │                                                    │ │                     ││
│  │                                                    │ │                     ││
│  │                                                    │ │                     ││
│  │                                                    │ │                     ││
│  └────────────────────────────────────────────────────┘ └─────────────────────┘│
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Right Panel Elements (Unexplored):
- **Star name** 
- **Star type icon** + classification
- **"UNEXPLORED"** label
- **Range info** (distance from nearest colony)

---

## 3. Galaxy Map - Fleet Selected (`moo_galaxy_shipselect.png`)

When a fleet icon is clicked, shows ship composition.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌────────────────────────────────────────────────────┐ ┌─────────────────────┐│
│  │                                                    │ │                     ││
│  │                    STAR MAP                        │ │  FLEET AT FIRMA     ││
│  │                                                    │ │  ════════════════   ││
│  │                                                    │ │                     ││
│  │         ·    ★         ·                          │ │  Orbiting:          ││
│  │    ·              ·         ★     ·               │ │  Firma (Your Colony)││
│  │              ✴                          ·         │ │                     ││
│  │      ★             [●]▲◄─ Fleet selected          │ │  ─────────────────  ││
│  │           ·    ·              ★                   │ │  SHIPS              ││
│  │    ·                    ·           ·             │ │  ─────────────────  ││
│  │         ★       ·    ✦         ·                  │ │                     ││
│  │                         ·                ★        │ │  Scout        x 2   ││
│  │      ·        ·              ·                    │ │  Fighter      x 6   ││
│  │           ✵          ★           ·                │ │  Colony Ship  x 1   ││
│  │    ·              ·         ·          ·          │ │                     ││
│  │                                                    │ │  ─────────────────  ││
│  │                                                    │ │  Total: 9 ships     ││
│  │                                                    │ │                     ││
│  │                                                    │ │  Click destination  ││
│  │                                                    │ │  to send fleet      ││
│  │                                                    │ │                     ││
│  └────────────────────────────────────────────────────┘ └─────────────────────┘│
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Right Panel Elements (Fleet at Colony):
- **"FLEET AT [location]"** header
- **Orbiting** location name
- **Ship list** with counts by design name
- **Total ships** count
- **Instructions** for sending fleet

---

## 4. Galaxy Map - Fleet In Transit (`moo_galaxy_movingshipselected.png`)

Fleet that is currently moving between stars.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌────────────────────────────────────────────────────┐ ┌─────────────────────┐│
│  │                                                    │ │                     ││
│  │                    STAR MAP                        │ │  FLEET IN TRANSIT   ││
│  │                                                    │ │  ════════════════   ││
│  │                                                    │ │                     ││
│  │         ·    ★         ·                          │ │  From: Firma        ││
│  │    ·              ·         ★     ·               │ │  To:   Centauri     ││
│  │              ✴                          ·         │ │  ETA:  3 turns      ││
│  │      ★             ●                              │ │                     ││
│  │           ·    ·    ╲             ★               │ │  ─────────────────  ││
│  │    ·                 ╲[▲]◄─ Fleet in transit      │ │  SHIPS              ││
│  │         ★       ·     ╲    ·                      │ │  ─────────────────  ││
│  │                        ╲          ★               │ │                     ││
│  │      ·        ·         ◎ Destination             │ │  Scout        x 2   ││
│  │           ✵          ★           ·                │ │  Fighter      x 4   ││
│  │    ·              ·         ·          ·          │ │                     ││
│  │                                                    │ │  ─────────────────  ││
│  │                                                    │ │  Total: 6 ships     ││
│  │                                                    │ │  Speed: Warp 3      ││
│  │                                                    │ │                     ││
│  │                                                    │ │  [REDIRECT]         ││
│  │                                                    │ │                     ││
│  └────────────────────────────────────────────────────┘ └─────────────────────┘│
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Right Panel Elements (Fleet In Transit):
- **"FLEET IN TRANSIT"** header
- **From/To** star names
- **ETA** in turns
- **Ship list** with counts
- **Total ships** + fleet speed
- **REDIRECT** button to change destination

### Map Shows:
- Dashed/dotted line from origin to destination
- Fleet icon (▲) along the route
- Destination marker

---

## 5. Galaxy Map - After Setting Destination (`moo_galaxy_aftershipdestinationselected.png`)

After clicking a destination for a fleet, confirmation shown.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌────────────────────────────────────────────────────┐ ┌─────────────────────┐│
│  │                                                    │ │                     ││
│  │                    STAR MAP                        │ │  ORDERS CONFIRMED   ││
│  │                                                    │ │  ════════════════   ││
│  │                                                    │ │                     ││
│  │         ·    ★         ·                          │ │  Fleet departing:   ││
│  │    ·              ·         ★     ·               │ │  Firma              ││
│  │              ✴                          ·         │ │                     ││
│  │      ★             ●══════════════◎               │ │  Destination:       ││
│  │           ·    ·   ▲          ★                   │ │  Centauri           ││
│  │    ·               Fleet      ·           ·       │ │                     ││
│  │         ★       ·    ✦         ·                  │ │  ETA: 3 turns       ││
│  │                         ·                ★        │ │                     ││
│  │      ·        ·              ·                    │ │  ─────────────────  ││
│  │           ✵          ★           ·                │ │  Ships deploying:   ││
│  │    ·              ·         ·          ·          │ │                     ││
│  │                                                    │ │  Scout        x 2   ││
│  │   Route line shown: ════════════                  │ │  Fighter      x 4   ││
│  │                                                    │ │                     ││
│  │                                                    │ │  Fleet departs next ││
│  │                                                    │ │  turn               ││
│  │                                                    │ │                     ││
│  └────────────────────────────────────────────────────┘ └─────────────────────┘│
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Technology Screen (`moo_tech.png`)

Full-screen technology research interface.

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
│  │           │           │           │           │           │           │     │
│  │ Researching:          │           │           │           │           │     │
│  │ Battle    │ Duralloy  │ Class III │ Improved  │ Range 5   │ Fusion    │     │
│  │ Computer  │ Armor     │ Shields   │ Terraform │           │ Rifle     │     │
│  │ Mk II     │           │           │ +20       │           │           │     │
│  │           │           │           │           │           │           │     │
│  │ ████████░░│ ██████░░░░│ ████░░░░░░│ ██░░░░░░░░│ ██████████│ ████████░░│     │
│  │  80%      │  60%      │  40%      │  20%      │  DONE!    │  85%      │     │
│  │  2 turns  │  4 turns  │  6 turns  │ 12 turns  │           │  1 turn   │     │
│  │           │           │           │           │           │           │     │
│  ├───────────┴───────────┴───────────┴───────────┴───────────┴───────────┤     │
│  │                                                                       │     │
│  │  AVAILABLE TECHNOLOGIES (click to select next research):              │     │
│  │                                                                       │     │
│  │  [Battle Computer III] [ECM Jammer II] [Deep Space Scanner]           │     │
│  │                                                                       │     │
│  └───────────────────────────────────────────────────────────────────────┘     │
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Technology Screen Elements:
- **Header**: "TECHNOLOGY" title
- **Research Points**: Empire-wide RP/turn and total labs
- **6 Tech Field Columns**:
  - Computers
  - Construction  
  - Force Fields
  - Planetology
  - Propulsion
  - Weapons
- **Allocation Sliders**: Percentage per field (must total 100%)
- **Current Research**: Per-field current tech being researched
- **Progress Bars**: Per-field progress + turns remaining
- **Available Techs**: Clickable list of unlocked-but-not-researched options
- **Bottom Command Bar**: Same as galaxy screen

---

## 7. Ship Design Screen (`moo_design.png`)

Ship design and customization interface.

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
│  │  HP: 3              │  │                             │  │ Nuclear    [+]   ││
│  │  Speed: Warp 1      │  └─────────────────────────────┘  │                  ││
│  │  Range: 4           │                                   └──────────────────┘│
│  └─────────────────────┘                                                        │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  [PREV DESIGN]  Design 2 of 6: HUNTER  [NEXT DESIGN]  [NEW]  [SCRAP]     │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Ship Design Screen Elements:

**Left Column:**
- Ship image/preview
- Design name (editable)
- Ship stats summary (space, cost, attack, defense, HP, speed, range)

**Center Column:**
- Hull class selection (6 sizes)
- Current loadout list (weapons, shields, armor, engine, specials)
- Action buttons: CLEAR, AUTO (auto-design), DONE

**Right Column:**
- Available components list by category
- [+] buttons to add components
- Categories: Weapons, Shields, Specials, Engines, Armor

**Bottom:**
- Design navigation (prev/next)
- Design count and name
- NEW (create new design) and SCRAP (delete design) buttons

---

## Summary: Key UI Patterns

### Consistent Across All Screens:
1. **Bottom Command Bar** - Always present with 8 buttons
2. **Dark space theme** - Black backgrounds, colored elements
3. **Right-side info panels** - Context-sensitive on galaxy map
4. **Percentage sliders** - Used for allocation (production, research)
5. **Progress bars** - Show completion status with turns remaining

### Screen Navigation:
| Button | Screen | Hotkey |
|--------|--------|--------|
| GAME | Save/Load/Options menu | F10/ESC |
| DESIGN | Ship Design | F6 |
| FLEET | Fleet Management | F3 |
| MAP | Galaxy Map (hub) | F1 |
| RACES | Diplomacy | F5 |
| PLANETS | Colony List | F2 |
| TECH | Technology | F4 |
| NEXT TURN | End turn | ENTER |

---

## Implementation Notes

### For Hamster of Orion:
1. Keep same layout proportions as MOO1
2. Modernize visuals (higher res, smoother) while keeping structure
3. Add tooltips on hover for additional info
4. Support keyboard navigation matching MOO1 hotkeys
5. Pet-themed graphics replace alien graphics, but same UI positions
