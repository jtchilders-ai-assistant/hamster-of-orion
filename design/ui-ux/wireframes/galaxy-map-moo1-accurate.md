# Galaxy Map UI - MOO1-Accurate Wireframe

## Overview

This wireframe matches the exact layout of the original Master of Orion (1993) Galaxy Map screen. The layout consists of three main areas: the star map (left ~75%), the context-sensitive info panel (right ~25%), and the bottom command bar.

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
│                                                                   │
│         ·                    ★                                    │
│                  ·                        ·                       │
│     ·        ●            ·       ◈               ★               │
│                     ★                                    ·        │
│  ✴              ·              ·                                  │
│         ◉                [●]◄── Selected star (highlighted)       │
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

STAR SYMBOLS:
  ★  Yellow star (G-type, habitable)
  ✦  Blue star (hot, often hostile planets)
  ✴  Red star (cool, often small planets)
  ✵  White star (various planet types)
  ·  Unexplored/unknown star

COLONY MARKERS:
  ●  Your colony (filled, your empire color)
  ◉  Enemy colony (filled, their empire color)
  ◈  Neutral/uncolonized habitable
  
FLEET INDICATORS:
  ▲  Your fleet in transit (small arrow)
  △  Enemy fleet detected

SELECTION:
  [●] Selected star shown with highlight box
  ─── Fleet route line when moving
```

---

## Info Panel States

### State 1: Nothing Selected (Empire Summary)

```
┌───────────────────────────┐
│                           │
│   ┌─────────────────┐     │
│   │                 │     │
│   │  [RACE EMBLEM]  │     │
│   │                 │     │
│   └─────────────────┘     │
│                           │
│   HAMSTER EMPIRE          │
│   ─────────────────       │
│                           │
│   Colonies:      5        │
│   Population:   42M       │
│   Factories:   127        │
│   Ships:        18        │
│   Missile Bases: 3        │
│                           │
│   ─────────────────       │
│   Income:     +120 BC     │
│   Expenses:    -45 BC     │
│   Reserve:     500 BC     │
│                           │
│   ─────────────────       │
│   Research:               │
│   Plasma Cannon           │
│   ████████░░ 80%          │
│   ETA: 2 turns            │
│                           │
└───────────────────────────┘
```

### State 2: Star Selected (Colony View)

```
┌───────────────────────────┐
│                           │
│   FIRMA                   │
│   ═══════════════════     │
│                           │
│   [★] Yellow Star         │
│                           │
│   Planet: Terran          │
│   Size: 85 (max pop)      │
│   Environment: Normal     │
│   Minerals: Rich          │
│                           │
│   ─────────────────       │
│   YOUR COLONY             │
│   ─────────────────       │
│                           │
│   Population:    12M      │
│   Factories:     45       │
│   Missile Bases:  2       │
│   Shield:   Class III     │
│   Waste:         3%       │
│                           │
│   ─────────────────       │
│   PRODUCTION              │
│   ─────────────────       │
│                           │
│   Building: Factory       │
│   ████████████░░ 85%      │
│   Turns left: 1           │
│                           │
│   [CLICK TO MANAGE]       │
│                           │
└───────────────────────────┘
```

### State 3: Star Selected (Uncolonized)

```
┌───────────────────────────┐
│                           │
│   ALTAIR                  │
│   ═══════════════════     │
│                           │
│   [✦] Blue Star           │
│                           │
│   Planet: Ocean           │
│   Size: 65 (max pop)      │
│   Environment: Fertile    │
│   Minerals: Abundant      │
│                           │
│   ─────────────────       │
│   UNCOLONIZED             │
│   ─────────────────       │
│                           │
│   Requires: Colony Ship   │
│                           │
│   Special: Artifacts      │
│   (+50% research)         │
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

### State 4: Star Selected (Enemy Colony)

```
┌───────────────────────────┐
│                           │
│   KRONOS                  │
│   ═══════════════════     │
│                           │
│   [✴] Red Star            │
│                           │
│   Planet: Arid            │
│   Size: 55                │
│                           │
│   ─────────────────       │
│   GUINEA PIG COLONY       │
│   ─────────────────       │
│                           │
│   ┌─────────────────┐     │
│   │ [GUINEA PIG     │     │
│   │  PORTRAIT]      │     │
│   └─────────────────┘     │
│                           │
│   Relation: WAR           │
│                           │
│   Est. Population: ~25M   │
│   Est. Defenses: Strong   │
│                           │
│   [SEND FLEET]            │
│   [CONTACT]               │
│                           │
│                           │
└───────────────────────────┘
```

### State 5: Fleet Selected

```
┌───────────────────────────┐
│                           │
│   YOUR FLEET              │
│   ═══════════════════     │
│                           │
│   Location: In Transit    │
│   From: Sol               │
│   To: Altair              │
│   ETA: 3 turns            │
│                           │
│   ─────────────────       │
│   SHIPS                   │
│   ─────────────────       │
│                           │
│   Scout          x3       │
│   Colony Ship    x1       │
│   Fighter        x12      │
│   Destroyer      x4       │
│                           │
│   ─────────────────       │
│   Total Ships:   20       │
│   Fleet Power:   450      │
│                           │
│   ─────────────────       │
│   [CHANGE DESTINATION]    │
│   [SPLIT FLEET]           │
│   [SCRAP SHIPS]           │
│                           │
└───────────────────────────┘
```

---

## Bottom Command Bar

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   ┌──────┐ ┌────────┐ ┌───────┐ ┌─────┐ ┌───────┐ ┌─────────┐ ┌──────┐        │
│   │ GAME │ │ DESIGN │ │ FLEET │ │ MAP │ │ RACES │ │ PLANETS │ │ TECH │        │
│   └──────┘ └────────┘ └───────┘ └─────┘ └───────┘ └─────────┘ └──────┘        │
│      F10       F6        F3       F1       F5         F2        F4            │
│                                                                                 │
│                                                           ┌─────────────────┐  │
│                                                           │   NEXT TURN     │  │
│                                                           │    [ENTER]      │  │
│                                                           └─────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

BUTTON FUNCTIONS:
  GAME    - Save, Load, Options, Quit (F10 or ESC)
  DESIGN  - Ship Design screen (F6)
  FLEET   - Fleet overview and management (F3)
  MAP     - Return to Galaxy Map / current screen (F1)
  RACES   - Diplomacy and race relations (F5)
  PLANETS - Colony list and management (F2)
  TECH    - Research allocation screen (F4)
  
  NEXT TURN - End current turn, process AI turns (ENTER or SPACE)
```

---

## Interaction Behaviors

### Star Map Interactions

| Action | Result |
|--------|--------|
| Left-click star | Select star, show info in right panel |
| Left-click empty space | Deselect, show empire summary |
| Left-click fleet icon | Select fleet, show fleet info |
| Right-click star | Quick menu (Send Fleet, View, etc.) |
| Click-drag on map | Pan the view |
| Scroll wheel | Zoom in/out |
| Double-click colony | Go to Planet Management screen |
| Double-click fleet | Go to Fleet screen |

### Fleet Movement

| Action | Result |
|--------|--------|
| Select fleet | Fleet info appears in panel |
| Click destination star | Set fleet destination, show route line |
| Route line appears | Dashed line from fleet to destination |
| ETA displayed | Turns to arrival shown in panel |

### Info Panel Interactions

| Action | Result |
|--------|--------|
| Click colony info | Opens Planet Management for that colony |
| Click "SEND FLEET" | Opens fleet selection dialog |
| Click "CONTACT" | Opens diplomacy with that race |
| Click production bar | Opens build queue / production screen |

---

## Visual Design Notes

### MOO1 Faithful Elements
- Right-side info panel (not left as in our earlier wireframe)
- Bottom command bar (not top)
- Star colors indicating star type
- Simple, clear colony/fleet markers
- Context-sensitive info panel

### Hamster of Orion Adaptations
- Higher resolution (1080p vs 320x200)
- Pet-themed race portraits and emblems
- Modern tooltip support on hover
- Smooth zoom/pan (vs. fixed zoom levels)
- Optional notification overlay (top-right)

---

## ASCII Reference for Implementation

### Full Screen Composite

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌────────────────────────────────────────────────────┐ ┌─────────────────────┐│
│  │                                                    │ │                     ││
│  │         ·                    ★                     │ │  FIRMA              ││
│  │                  ·                        ·        │ │  ═════════════      ││
│  │     ·        ●            ·       ◈               │ │                     ││
│  │                     ★                        ★    │ │  [★] Yellow Star    ││
│  │  ✴              ·              ·                  │ │                     ││
│  │         ◉                [●]                      │ │  Planet: Terran     ││
│  │              ·      ✦              ✵            · │ │  Size: 85           ││
│  │     ★                        ●                    │ │  Minerals: Rich     ││
│  │           ·    ✴        ·              ·          │ │                     ││
│  │                    ·           ★            ◉     │ │  ───────────────    ││
│  │        ·      ✵          ·                   ✦    │ │  Population: 12M    ││
│  │                              ·        ·           │ │  Factories:  45     ││
│  │    ★         ·       ·              ★            │ │  Bases:       2     ││
│  │                  ·          ✵                 ·   │ │                     ││
│  │          ●              ·        ·                │ │  Building: Factory  ││
│  │                                                   │ │  ████████████░░ 85% ││
│  │                                                    │ │                     ││
│  └────────────────────────────────────────────────────┘ └─────────────────────┘│
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## File Reference

This wireframe supersedes the "modern interpretation" in `galaxy-map.md` for MOO1 accuracy. The original file may be kept for comparison or as an alternative "modern" layout option.

**Changes from previous wireframe:**
1. Info panel moved from LEFT to RIGHT side
2. Command bar moved from TOP to BOTTOM  
3. Removed top status bar (info now in right panel)
4. Removed left empire info panel (consolidated to right)
5. Removed legend panel (stars self-explanatory with tooltips)
6. Simplified to match actual MOO1 layout proportions
