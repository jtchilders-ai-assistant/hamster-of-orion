# UI/UX Overview

**Updated to match MOO1 layout based on reference screenshots.**

## Design Philosophy

**Master of Orion 1 Faithful + Modern Web**:
- Classic MOO1 layout preserved exactly
- Right-side info panel, bottom command bar
- Information density (strategy game players want data)
- Responsive web design (desktop primary)
- Charming pet-themed visual style

---

## Screen Layout Standard

All game screens follow the MOO1 layout pattern:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌────────────────────────────────────────────────────┐ ┌─────────────────────┐│
│  │                                                    │ │                     ││
│  │                                                    │ │   INFO PANEL        ││
│  │                  MAIN CONTENT                      │ │   (Right Side)      ││
│  │                  (~75% width)                      │ │                     ││
│  │                                                    │ │   (~25% width)      ││
│  │                                                    │ │                     ││
│  │                                                    │ │   Context-sensitive ││
│  │                                                    │ │                     ││
│  └────────────────────────────────────────────────────┘ └─────────────────────┘│
│                                                                                 │
│  ┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐  │
│  │ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │  │
│  └──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Key Layout Rules (MOO1 Faithful):
1. **NO top status bar** - Empire info is in right panel
2. **Right-side info panel** - Context-sensitive, ~25% width
3. **Bottom command bar** - Always present, 8 buttons
4. **Main content left** - Star map, lists, or full-screen content

---

## Visual Style

For complete CSS design tokens, HSL color palettes, typography, button states, slider styling, and micro-animations, see the master [UI Style Guide & Design System](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/style-guide.md).

### Art Direction
**Dignified Sci-Fi & Tactile Tactical Glass**:
- Portraits: Serious pet portraits (formal attire, dramatic lighting)
- UI: Professional, military-grade glassmorphic interface (`backdrop-filter: blur(12px)`)
- Iconography: Clear, functional symbols with neon indicator badges
- Color: Space-appropriate dark theme with Imperial Gold and Plasma Cyan accents

### Color Palette

**Primary Colors**:
- Deep Space Blue: `#0a1628` (backgrounds)
- Panel Background: `#1a2a3a` (info panels)
- Highlight: `#4a90d9` (selection)
- Text: `#ffffff` (primary), `#aabbcc` (secondary)

**Race Colors** (for empire identification):
| Race | Color | Hex |
|------|-------|-----|
| Hamsters | Warm Gold | `#ffa726` |
| Guinea Pigs | Olive Drab | `#7cb342` |
| Chameleons | Shifting Teal | `#26a69a` |
| Ants | Industrial Red | `#ef5350` |
| Mice | Electric Blue | `#42a5f5` |
| Ferrets | Hunter Brown | `#8d6e63` |
| Rats | Lab Coat White | `#eeeeee` |
| Rabbits | Pastel Pink | `#f48fb1` |
| Budgies | Sky Cyan | `#4dd0e1` |
| Hermit Crabs | Ocean Turquoise | `#00acc1` |

---

## Navigation Structure

### Bottom Command Bar (Always Present)

```
┌──────┬────────┬───────┬─────┬───────┬─────────┬──────┬───────────────────┐
│ GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │     NEXT TURN     │
└──────┴────────┴───────┴─────┴───────┴─────────┴──────┴───────────────────┘
  F10     F6       F3     F1     F5       F2       F4        ENTER
```

| Button | Screen | Hotkey | Description |
|--------|--------|--------|-------------|
| GAME | Game Menu | F10/ESC | Save, Load, Options, Quit |
| DESIGN | Ship Design | F6 | Create and modify ship designs |
| FLEET | Fleet Command | F3 | View and manage all fleets |
| MAP | Galaxy Map | F1 | Main hub screen |
| RACES | Diplomacy | F5 | Race relations and treaties |
| PLANETS | Colony List | F2 | Manage all colonies |
| TECH | Technology | F4 | Research allocation |
| NEXT TURN | End Turn | ENTER | Process turn, AI moves |

### Screen Flow
```
                    ┌─────────────────┐
                    │   MAIN MENU     │
                    └────────┬────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                       GALAXY MAP (F1)                        │
│                       (Primary Hub)                          │
└──────────────────────────────────────────────────────────────┘
        │         │         │         │         │         │
        ▼         ▼         ▼         ▼         ▼         ▼
    ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
    │PLANETS│ │ FLEET │ │ TECH  │ │ RACES │ │DESIGN │ │ GAME  │
    │  F2   │ │  F3   │ │  F4   │ │  F5   │ │  F6   │ │  F10  │
    └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘
```

---

## Info Panel States (Galaxy Map)

The right-side info panel changes based on selection.

**Note: Something is always selected.** The game starts with your homeworld selected. Clicking empty space does NOT deselect - you must click another star or fleet to change selection.

### Your Colony Selected → Colony Details
Shows: Star name, planet type, population, factories, bases, 5 production sliders

### Star Selected (Unexplored) → Star Info
Shows: Star name, star type, "UNEXPLORED", range from nearest colony

### Star Selected (Enemy Colony) → Enemy Info
Shows: Star name, enemy race portrait, relationship status, estimated strength

### Fleet Selected → Fleet Details
Shows: Location/destination, ship list with counts, ETA if in transit, redirect option

---

## Production Sliders

Used on Planet Management screen. Five sliders totaling 100%:

```
SHIP ■■■■□□□□□□□□□□□□  38%   Scout (2 turns)
DEF  ■□□□□□□□□□□□□□□□   0%   (none)
IND  ■■■■■■■■■□□□□□□□  62%   Factory (1 turn)
ECO  ■□□□□□□□□□□□□□□□   0%   Clean
TECH ■□□□□□□□□□□□□□□□   0%   (none)
```

| Slider | Purpose |
|--------|---------|
| SHIP | Ship construction |
| DEF | Missile bases, planetary shields |
| IND | Factory construction |
| ECO | Waste cleanup, terraforming |
| TECH | Research contribution |

---

## Technology Screen (F4)

**Full-screen modal with NO bottom command bar.** Click OK to return to Galaxy Map.

The Technology screen has two halves plus a bottom section:

**Left Half - Tech Browser:**
- Field tabs (6 fields) to select which tech category to browse
- Discovered tech list showing researched techs in selected field
- Click a tech to see its description

**Right Half - Research Allocation:**
- 6 sliders (one per field) to allocate research points
- Must total 100%
- Shows currently researching tech with progress

**Bottom Section:**
- Tech Description Panel (~80% width) - shows details of selected tech
- Research Summary (~20% width) - "Total Research XXX BC" + OK button to exit

---

## Interaction Patterns

### Mouse Controls
| Action | Result |
|--------|--------|
| Left Click | Select star/fleet/item |
| Right Click | Context menu (MOO1 style) |
| Double Click | Open detailed view |
| Drag | Pan map / adjust sliders |
| Scroll | Zoom map |

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| F1 | Galaxy Map |
| F2 | Planets |
| F3 | Fleet |
| F4 | Technology |
| F5 | Races/Diplomacy |
| F6 | Ship Design |
| F10/ESC | Game Menu |
| ENTER/SPACE | Next Turn |
| +/- | Zoom In/Out |

---

## Screen Resolution

**Target Resolutions**:
- Desktop Primary: 1920×1080 (Full HD)
- Desktop Secondary: 2560×1440 (2K)
- Minimum: 1366×768

**Scaling**:
- UI scales proportionally
- Maintain ~75%/25% split for map/info panel
- Font sizes scale with resolution

---

## Reference Screenshots

Located in `design/moo_screens/`:

| File | Content |
|------|---------|
| `moo_galaxy_home.png` | Galaxy map with colony selected |
| `moo_galaxy_unexplored.png` | Galaxy map with unexplored star |
| `moo_galaxy_shipselect.png` | Fleet selection |
| `moo_galaxy_movingshipselected.png` | Fleet in transit |
| `moo_galaxy_aftershipdestinationselected.png` | Destination set |
| `moo_tech.png` | Technology screen |
| `moo_design.png` | Ship design screen |

---

## Detailed Screen Specifications

See individual wireframe files in `design/ui-ux/wireframes/`:
- `moo1-reference-wireframes.md` - Complete wireframes from screenshots
- `galaxy-map-moo1-accurate.md` - Detailed galaxy map spec

See also:
- `main-screens.md` - All main game screens
- `tactical-combat-ui.md` - Combat interface
- `interaction-spec.md` - Detailed interactions
- `state-transitions.md` - Screen flow
