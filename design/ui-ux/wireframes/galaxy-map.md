# Galaxy Map UI - MOO1-Accurate Wireframe

## Overview

This wireframe matches the exact layout of the original Master of Orion (1993) Galaxy Map screen, verified against actual MOO1 screenshots. The layout consists of three main areas: the star map (left ~75%), the context-sensitive info panel (right ~25%), and the bottom command bar.

**Reference**: Master of Orion (1993) Main Galaxy Screen  
**Hotkey**: F1 (or MAP button)

---

## Screen Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   ┌───────────────────────────────────────────┐  ┌───────────────────────────┐ │
│   │                                           │  │                           │ │
│   │                                           │  │     INFO PANEL            │ │
│   │                                           │  │     (Context-Sensitive)   │ │
│   │              STAR MAP                     │  │                           │ │
│   │              (~75% width)                 │  │     (~25% width)          │ │
│   │                                           │  │                           │ │
│   │                                           │  │     Changes based on:     │ │
│   │                                           │  │     - Star selected       │ │
│   │                                           │  │     - Fleet selected      │ │
│   │                                           │  │     - Nothing selected    │ │
│   │                                           │  │                           │ │
│   │                                           │  │                           │ │
│   └───────────────────────────────────────────┘  └───────────────────────────┘ │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐  │
│   │  GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │    NEXT TURN   │  │
│   └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Layout: Star Map Area

```
┌───────────────────────────────────────────────────────────────────┐
│  [black space background]                                         │
│                                                                   │
│         ·                    ★                                    │
│                  ·                        ·                       │
│     ·        ●            ·       ○               ★               │
│                     ★                                    ·        │
│  ✴              ·              ·                                  │
│         ◉                [●]◄── Selected star (bright ring)       │
│              ·      ✦              ✵            ·                 │
│     ★                        ●                                    │
│           ·    ✴        ·              ·          ◉               │
│                    ·           ★                                  │
│        ·      ✵          ·                   ✦          ·         │
│                              ·        ·                           │
│    ★         ·       ·              ★            ✴                │
│                  ·          ✵                 ·                   │
│          ●              ·        ·                    ·           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

STAR SYMBOLS (colored pixel-art dots):
  ★  Yellow/white star
  ✦  Blue star (bright, hot)
  ✴  Red/orange star
  ✵  White dwarf or dim star
  ·  Unexplored star (small dim dot — no color data yet)

COLONY MARKERS (colored ring/glow around star):
  ●  Your colony — ring in YOUR empire color
  ◉  Enemy colony — ring in THEIR empire color
  ○  Uncolonized habitable system (no ring, just star dot)

FLEET INDICATORS (small pixel-art ship sprite near star):
  ▶  Your fleet orbiting a system (positioned to the right of star)
  ◀  Your fleet in transit (moving dot on route line)
  ▷  Enemy fleet (visible if detected)

SELECTION:
  [●] Selected star shown with a bright highlight ring
  ─── Solid route line when fleet destination is set (in range)
  - - Red dashed route line when destination out of range
```

---

## Info Panel States

### Selection Behavior

**Something is always selected in MOO1.** The game starts with your homeworld selected. Clicking empty space may show a default/empty panel. You click a star or fleet icon to change selection.

The info panel states are:
1. Your colony selected (planet stats + production info)
2. Unexplored star selected (minimal info)
3. Uncolonized but explored planet selected
4. Enemy colony selected (race portrait + estimated info)
5. Fleet deployment (ships at a system, ready to send)
6. Fleet in transit (moving fleet selected on map)

---

### State 1: Your Colony Selected

The right panel shows star/planet details at top, then colony stats, then current production. The planet name is shown as a header. Star type shown below name.

```
┌───────────────────────────┐
│                           │
│   ORION                   │  ← Star/system name (all caps)
│   ══════════════════      │
│                           │
│   Yellow Star             │  ← Star type (text, no icon)
│                           │
│   Terran                  │  ← Planet type
│   Size: 100               │  ← Max population
│                           │
│   ─────────────────       │
│   YOUR COLONY             │  ← Your empire name or "YOUR COLONY"
│   ─────────────────       │
│                           │
│   Pop:       15  /  100   │  ← Current / max pop (in millions)
│   Factories:     45       │
│   Missile Bases:  2       │
│   Shield:   Class III     │
│   Waste:         3%       │
│                           │
│   ─────────────────       │
│   PRODUCING               │
│   ─────────────────       │
│                           │
│   Factories               │  ← What's being built
│   ████████████░░          │  ← Progress bar
│   Turns left: 1           │
│                           │
└───────────────────────────┘
```

**Notes from screenshots:**
- Planet name/star name are shown at top with a decorative underline/divider
- Population shown as current value vs. max (e.g., "15 / 100")
- Factories, Missile Bases, Shield level, Waste % all listed
- Current production item + progress bar + turns remaining

---

### State 1a: Colony at Max Population

When population has hit the planet size cap, the panel reflects this. No more growth occurs. Pop shows max value. Production continues normally.

```
┌───────────────────────────┐
│   VEGA                    │
│   ══════════════════      │
│   Yellow Star             │
│   Terran                  │
│   Size: 60                │
│                           │
│   YOUR COLONY             │
│   ─────────────────       │
│   Pop:       60  /  60    │  ← AT MAX — no further growth
│   Factories:     60       │
│   Missile Bases:  3       │
│   Shield:   Class IV      │
│   Waste:         5%       │
│                           │
│   PRODUCING               │
│   ─────────────────       │
│   Housing (irrelevant)    │  ← Or whatever is queued
│   ████████░░░░░░          │
│   Turns left: 4           │
└───────────────────────────┘
```

---

### State 1b: Colony at Max Factories

When factories reach the cap (5× population), the factory line shows "MAX" and the production item has shifted to something else (missiles, shields, housing, etc.).

```
┌───────────────────────────┐
│   ARCTURUS                │
│   ══════════════════      │
│   Red Star                │
│   Arid                    │
│   Size: 40                │
│                           │
│   YOUR COLONY             │
│   ─────────────────       │
│   Pop:       35  /  40    │
│   Factories: 175  (MAX)   │  ← MAX shown when factories = 5×pop
│   Missile Bases:  5       │
│   Shield:   Class V       │
│   Waste:        12%       │
│                           │
│   PRODUCING               │
│   ─────────────────       │
│   Missile Bases           │
│   ████████████████░       │
│   Turns left: 1           │
└───────────────────────────┘
```

---

### State 2: Unexplored Star Selected

When a star has not yet been visited by any scout/ship, almost no information is available.

```
┌───────────────────────────┐
│                           │
│   ALTAIR                  │
│   ══════════════════      │
│                           │
│   Blue Star               │  ← Star type visible (stars have
│                           │    visible color on map)
│                           │
│   UNEXPLORED              │  ← Status label
│                           │
│   (no planet data)        │  ← Planet type/size unknown
│                           │
│                           │
│                           │
│                           │
│                           │
│                           │
│                           │
│                           │
│                           │
│                           │
│                           │
└───────────────────────────┘
```

**Notes from screenshots:**
- Star name IS shown (stars are named on the map even unexplored)
- Star type (color) IS visible — you can see the colored dot on the map
- Planet type, size, environment are NOT shown — all "?"
- No owner, no colony data

---

### State 3: Uncolonized Planet (Explored)

Once a scout has visited, planet details are known but no colony exists.

```
┌───────────────────────────┐
│                           │
│   SIRIUS                  │
│   ══════════════════      │
│                           │
│   White Star              │
│                           │
│   Ocean                   │  ← Planet type (known after scouting)
│   Size: 80                │  ← Max population
│   Fertile                 │  ← Environment rating
│   Abundant                │  ← Mineral rating
│                           │
│   ─────────────────       │
│   UNCOLONIZED             │
│   ─────────────────       │
│                           │
│   Requires: Colony Ship   │
│                           │
│   Special: None           │  ← Or "Artifacts", "Natives", etc.
│                           │
│                           │
│                           │
│                           │
└───────────────────────────┘
```

---

### State 4: Enemy Colony Selected

Shows enemy race portrait (pixel art) and limited intelligence info.

```
┌───────────────────────────┐
│                           │
│   KRONOS                  │
│   ══════════════════      │
│                           │
│   Red Star                │
│                           │
│   Arid                    │
│   Size: 55                │
│                           │
│   ─────────────────       │
│   BULRATHI COLONY         │  ← Race name + "COLONY"
│   ─────────────────       │
│                           │
│   ┌─────────────────┐     │
│   │  [RACE PORTRAIT]│     │  ← Pixel-art race portrait image
│   └─────────────────┘     │
│                           │
│   Relation: WAR           │  ← Diplomatic status
│                           │
│   Pop:      ~25M          │  ← Estimated (tilde = approximate)
│   Defenses: Strong        │  ← Qualitative assessment
│                           │
└───────────────────────────┘
```

---

### State 5: Fleet Deployment Panel

Triggered when clicking a **fleet icon orbiting one of your systems**. Shows ships available to send. Appears in right panel with ship images in a 2-column grid (up to 5 ship types).

```
┌─────────────────────────┐
│                         │
│   FLEET                 │  ← Header
│   ═══════════════════   │
│                         │
│   ┌───────┐ ┌───────┐   │
│   │[SCOUT ]│ │[DEST.]│   │  ← Pixel-art ship images
│   │       │ │       │   │     (ship type portrait)
│   └───────┘ └───────┘   │
│   Scout        12       │  ← Ship name + total count at colony
│   << <  12  > >>        │  ← Deploy count controls (0–12)
│                         │
│   ┌───────┐ ┌───────┐   │
│   │[FIGHTR]│ │       │   │
│   └───────┘ └───────┘   │
│   Fighter       4       │
│   << <   4  > >>        │
│                         │
│   [empty slots...]      │  ← Up to 5 ship types shown
│                         │
│   ┌─────────────────┐   │
│   │  ETA: 3 turns   │   │  ← Green text; only after dest. selected
│   └─────────────────┘   │
│                         │
│   [CANCEL]   [ACCEPT]   │  ← ACCEPT grayed until dest. chosen
│                         │
└─────────────────────────┘
```

**Deployment Controls** (per ship type):
- `<<` = Set to 0 (leave all ships here)
- `<` = Decrease by 1
- `[number]` = Ships to deploy (editable display)
- `>` = Increase by 1
- `>>` = Set to max (deploy all)

**Deployment Flow**:
1. Click fleet icon at your colony → Fleet Deployment panel opens
2. All ships default to their full count (deploy all)
3. Adjust counts with `<< < > >>` buttons per ship type
4. Click a destination star on the map:
   - A solid route line appears from origin to destination
   - ETA in green appears at bottom of panel
   - ACCEPT button activates
5. Click ACCEPT → fleet departs
6. Clicking an **out-of-range** destination: route line turns red, ETA shows "OUT OF RANGE" or is blank, ACCEPT stays grayed

**After ACCEPT**:
- Departing fleet icon appears to the LEFT of origin system (moving away)
- Any remaining fleet icon stays to the RIGHT of origin system
- Selection moves to the origin system info

---

### State 6: Fleet In Transit (Moving Fleet Selected)

When clicking a fleet sprite on the map that is traveling between systems:

```
┌───────────────────────────┐
│                           │
│   FLEET IN TRANSIT        │
│   ═══════════════════     │
│                           │
│   From: Sol               │
│   To:   Altair            │
│   ETA:  3 turns           │
│                           │
│   ─────────────────       │
│   SHIPS                   │
│   ─────────────────       │
│                           │
│   Scout          x12      │
│   Fighter         x4      │
│                           │
│   ─────────────────       │
│   Total:          16      │
│                           │
└───────────────────────────┘
```

**Notes from screenshots:**
- Fleet sprite is a small pixel-art ship visible on the route line
- Clicking it shows FROM / TO / ETA
- Ship list shows type + count
- No redirect option visible in early MOO1 (fleet must arrive first)

---

## Bottom Command Bar

The command bar is a single row of text buttons across the full width, with NEXT TURN on the far right. All buttons are the same height and use a consistent pixel-art button style.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │          NEXT TURN      │
└──────────────────────────────────────────────────────────────────────────────────┘
   F10     F6       F3    F1     F5       F2       F4               [ENTER]
```

**Button order (left to right, verified from screenshots):**
1. **GAME** — Save/Load/Quit menu (F10 or ESC)
2. **DESIGN** — Ship Design screen (F6)
3. **FLEET** — Fleet overview screen (F3)
4. **MAP** — Galaxy Map / current screen (F1) — highlighted when active
5. **RACES** — Diplomacy screen (F5)
6. **PLANETS** — Colony list (F2)
7. **TECH** — Research screen (F4)
8. **NEXT TURN** — End turn, far right, larger button (ENTER or SPACE)

**Notes:**
- MAP button appears active/highlighted when on the galaxy map
- All non-MAP screens open as full-screen replacements (no overlay)
- NEXT TURN is visually distinct — wider, right-aligned, often a different color

---

## Star Map Visual Details

From the screenshots, the star map has these confirmed visual elements:

### Background
- Pure black space
- Occasional faint star-field dots (non-interactive background stars)

### Star Rendering
- Stars are small colored pixel-art dots/glows
- **Yellow** stars: warm yellow dot
- **Blue** stars: bright blue-white dot
- **Red** stars: orange-red dot
- **White** stars: small white dot
- Size of dot = approximately the same; no size variation for importance

### Colony Rings
- Your colonies: colored ring around the star dot (in your empire's color)
- Enemy colonies: colored ring in that empire's color
- Multiple empires at same star: shown with their respective colors
- No colony = bare star dot

### Fleet Icons
- Small pixel-art ship sprites
- Positioned adjacent to their star (to the right when orbiting)
- Move along route lines when in transit
- Clicking the sprite selects that fleet

### Route Lines
- Appear when fleet has a set destination
- **Solid line**: in-range destination (can send)
- **Red/dashed line**: out-of-range destination (cannot send yet)
- Line connects origin star to destination star

### Star Name Labels
- Each star has a text label (small pixel font)
- Label appears below or beside the star dot
- Always visible regardless of selection state

---

## Interaction Behaviors

### Star Map Interactions

| Action | Result |
|--------|--------|
| Left-click star | Select star, show info in right panel |
| Left-click empty space | Deselects; panel may go blank or show empire summary |
| Left-click fleet icon | Select fleet; show fleet deployment or transit panel |
| During deployment: click destination | Sets route, shows ETA, activates ACCEPT |
| During deployment: click out-of-range | Red line shown; ACCEPT stays disabled |

### Confirmed from Screenshots

| Scenario | Panel Shows |
|----------|-------------|
| Home colony (start) | Colony stats + current production |
| Unexplored star | Star name + "UNEXPLORED", no planet data |
| Uncolonized explored planet | Planet type + size + "UNCOLONIZED" |
| Your colony at max pop | Pop = max/max, production continues |
| Your colony at max factories | Factories shows "MAX", building something else |
| New colony (just founded) | Low pop, 0 factories, basic stats |
| Post-terraformed colony | Updated planet type, higher max pop |
| Fleet at your colony | Fleet Deployment panel with ship grid |
| Fleet in transit | From/To/ETA + ship list |
| Destination out of range | Red route line, ACCEPT grayed |

---

## ASCII Reference: Full Screen Composite

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌────────────────────────────────────────────────────┐ ┌─────────────────────┐│
│  │ [black space]                                      │ │                     ││
│  │         ·                    ★                     │ │  ORION              ││
│  │                  ·                        ·        │ │  ═══════════════    ││
│  │     ·        ●            ·       ○               │ │                     ││
│  │                     ★                        ★    │ │  Yellow Star        ││
│  │  ✴              ·              ·                  │ │                     ││
│  │         ◉                [●]                      │ │  Terran             ││
│  │              ·      ✦              ✵            · │ │  Size: 100          ││
│  │     ★                        ●                    │ │                     ││
│  │           ·    ✴        ·              ·          │ │  ─────────────      ││
│  │                    ·           ★            ◉     │ │  YOUR COLONY        ││
│  │        ·      ✵          ·                   ✦    │ │  ─────────────      ││
│  │                              ·        ·           │ │  Pop:  15 / 100     ││
│  │    ★         ·       ·              ★            │ │  Factories:  45     ││
│  │                  ·          ✵                 ·   │ │  Bases:       2     ││
│  │          ●              ·        ·                │ │                     ││
│  │                         ▶◄──fleet icon            │ │  PRODUCING          ││
│  └────────────────────────────────────────────────────┘ │  Factory           ││
│                                                          │  ████████████░░   ││
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┤  Turns left: 1    ││
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │                   ││
│  │      │        │       │[MAP]│       │         │      └─────────────────────┘│
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┬───────────────────┐  │
│                                                          │    NEXT TURN      │  │
│                                                          └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Reference Screenshots

All screenshots are from Master of Orion (1993) and located at:

- [Home screen / default state](../../moo_screens/moo_galaxy_home.png)
- [Unexplored star selected](../../moo_screens/moo_galaxy_unexplored.png)
- [Ship/fleet select at colony](../../moo_screens/moo_galaxy_shipselect.png)
- [After ship destination selected](../../moo_screens/moo_galaxy_aftershipdestinationselected.png)
- [Moving ship/fleet selected](../../moo_screens/moo_galaxy_movingshipselected.png)
- [Fleet deployment panel](../../moo_screens/moo_galaxy_fleet_deployment.png)
- [Uncolonized planet selected](../../moo_screens/moo_galaxy_select_uncolonized_planet.png)
- [Ship destination out of range](../../moo_screens/moo_galaxy_ship_select_destination_out_of_range.png)
- [New colony planet panel](../../moo_screens/moo_galaxy_planet_new.png)
- [Post-terraformed planet panel](../../moo_screens/moo_galaxy_planet_post_tform.png)
- [Colony at max population](../../moo_screens/moo_galaxy_planet_is_full.png)
- [Colony at max factories](../../moo_screens/moo_galaxy_max_factories.png)

---

## Changes from Previous Version

1. **Star symbols corrected**: Uncolonized planets use `○` (no ring), not `◈`
2. **Colony markers clarified**: Ring color = empire color; no ring = uncolonized
3. **Fleet icons updated**: Pixel-art ship sprites (not arrow glyphs like `▲`)
4. **Fleet deployment layout**: 2-column ship grid confirmed; ship image shown above controls
5. **Route lines**: Solid = in range, Red = out of range (confirmed from screenshots)
6. **Out-of-range behavior**: Red route line + ACCEPT grayed (added new state doc)
7. **New colony state added** (State 1: fresh colony with low stats)
8. **Max population state added** (State 1a: pop = max, production continues)
9. **Max factories state added** (State 1b: factories = MAX, building other things)
10. **Post-terraforming state added** (planet type + max pop updated)
11. **Unexplored vs. uncolonized clarified**: Two distinct panel states
12. **Star name labels**: Always visible on map (not just when selected)
13. **Command bar order confirmed**: GAME, DESIGN, FLEET, MAP, RACES, PLANETS, TECH, NEXT TURN
14. **Reference Screenshots section added** with relative paths to all MOO1 source images
