# Technology Screen (F4) - MOO1-Accurate Wireframe

## Overview

The Technology screen is a **full-screen modal** opened by clicking TECH on the Galaxy Map's bottom command bar. It has **no bottom command bar** - you return to the Galaxy Map by clicking the OK button.

**Reference**: `design/moo_screens/moo_tech.png`  
**Hotkey**: F4

---

## Screen Layout

The screen is divided into **two main halves** (left and right) plus a **bottom section** with description panel and exit button.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │                                 │  │                                     │  │
│  │   LEFT HALF                     │  │   RIGHT HALF                        │  │
│  │   TECH BROWSER                  │  │   RESEARCH ALLOCATION               │  │
│  │   (~50% width)                  │  │   (~50% width)                      │  │
│  │                                 │  │                                     │  │
│  │   ┌─────────────────────────┐   │  │   ┌─────────────────────────────┐   │  │
│  │   │ FIELD TABS              │   │  │   │ ALLOCATION SLIDERS          │   │  │
│  │   │ [COMP][CONST][FORCE]    │   │  │   │                             │   │  │
│  │   │ [PLAN][PROP ][WEAP ]    │   │  │   │ COMPUTERS    ████░░░░ 25%   │   │  │
│  │   └─────────────────────────┘   │  │   │ CONSTRUCTION ██████░░ 40%   │   │  │
│  │                                 │  │   │ FORCE FIELD  ████░░░░ 15%   │   │  │
│  │   ┌─────────────────────────┐   │  │   │ PLANETOLOGY  ██░░░░░░  5%   │   │  │
│  │   │ DISCOVERED TECH LIST    │   │  │   │ PROPULSION   ██░░░░░░ 10%   │   │  │
│  │   │ (for selected field)    │   │  │   │ WEAPONS      ██░░░░░░  5%   │   │  │
│  │   │                         │   │  │   │                             │   │  │
│  │   │ • Battle Computer I     │   │  │   │ Total: 100%                 │   │  │
│  │   │ • Deep Space Scanner    │   │  │   └─────────────────────────────┘   │  │
│  │   │ • ECM Jammer I          │   │  │                                     │  │
│  │   │ • Improved Robotic...   │   │  │   ┌─────────────────────────────┐   │  │
│  │   │                         │   │  │   │ CURRENTLY RESEARCHING       │   │  │
│  │   │ (click to view desc)    │   │  │   │                             │   │  │
│  │   │                         │   │  │   │ Battle Computer II          │   │  │
│  │   └─────────────────────────┘   │  │   │ ████████████░░░░ 80%        │   │  │
│  │                                 │  │   │ ETA: 2 turns                │   │  │
│  │                                 │  │   └─────────────────────────────┘   │  │
│  │                                 │  │                                     │  │
│  └─────────────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ ┌─────────────┐ │
│  │                                                           │ │             │ │
│  │   TECH DESCRIPTION PANEL                                  │ │ Total       │ │
│  │   (~80% width)                                            │ │ Research    │ │
│  │                                                           │ │             │ │
│  │   Battle Computer I                                       │ │ 127 BC      │ │
│  │   ═══════════════════════════════════════════════════     │ │             │ │
│  │                                                           │ │ ┌─────────┐ │ │
│  │   Provides +1 to ship attack rating in combat.            │ │ │   OK    │ │ │
│  │   Unlocks Battle Computer I component for ship design.    │ │ └─────────┘ │ │
│  │                                                           │ │             │ │
│  │   Tech Level: 1  |  Field: Computers                      │ │  (~20%)     │ │
│  │                                                           │ │             │ │
│  └───────────────────────────────────────────────────────────┘ └─────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Left Half: Tech Browser

### Field Tabs
Six clickable tabs to select which technology field to browse:

```
┌────────┬────────┬────────┐
│  COMP  │ CONST  │ FORCE  │
├────────┼────────┼────────┤
│  PLAN  │  PROP  │  WEAP  │
└────────┴────────┴────────┘
```

| Tab | Full Name | Research Focus |
|-----|-----------|----------------|
| COMP | Computers | Battle computers, ECM, scanners |
| CONST | Construction | Armor, factories, ship hulls |
| FORCE | Force Fields | Shields, repulsors, cloaking |
| PLAN | Planetology | Terraforming, ecology, bio weapons |
| PROP | Propulsion | Engines, fuel range, speed |
| WEAP | Weapons | Beams, missiles, bombs |

### Discovered Tech List
Below the tabs, a scrollable list shows all technologies **already researched** in the selected field:

```
┌─────────────────────────────┐
│  COMPUTERS (selected)       │
│  ═══════════════════════    │
│                             │
│  • Battle Computer I        │  ← Click to see description
│  • Deep Space Scanner       │
│  • ECM Jammer I             │
│  • Improved Robotic Ctrl II │
│                             │
│  (4 technologies discovered)│
└─────────────────────────────┘
```

**Behavior**: Click a tech in the list to display its full description in the bottom panel.

---

## Right Half: Research Allocation

### Allocation Sliders
Six horizontal sliders for distributing research points across fields:

```
┌─────────────────────────────────┐
│  RESEARCH ALLOCATION            │
│  ═══════════════════════════    │
│                                 │
│  COMPUTERS     ████░░░░░░ 25%   │  ← Drag to adjust
│  CONSTRUCTION  ██████░░░░ 40%   │
│  FORCE FIELD   ████░░░░░░ 15%   │
│  PLANETOLOGY   ██░░░░░░░░  5%   │
│  PROPULSION    ██░░░░░░░░ 10%   │
│  WEAPONS       ██░░░░░░░░  5%   │
│                                 │
│  Total: 100%                    │
└─────────────────────────────────┘
```

**Rules**:
- All six sliders must total 100%
- Dragging one slider auto-adjusts others to maintain 100%
- Minimum allocation is 0%, maximum is 100%
- A field with 0% receives no research points

### Currently Researching
Shows the active research project for each field with progress:

```
┌─────────────────────────────────┐
│  CURRENTLY RESEARCHING          │
│  ═══════════════════════════    │
│                                 │
│  COMPUTERS:                     │
│  Battle Computer II             │
│  ████████████░░░░ 80%           │
│  ETA: 2 turns                   │
│                                 │
│  CONSTRUCTION:                  │
│  Duralloy Armor                 │
│  ██████░░░░░░░░░░ 40%           │
│  ETA: 5 turns                   │
│                                 │
│  (etc. for each field)          │
└─────────────────────────────────┘
```

---

## Bottom Section

### Tech Description Panel (~80% width)

Displays detailed information about the tech selected in the Discovered Tech List:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  Battle Computer I                                                        │
│  ═════════════════════════════════════════════════════════════════════    │
│                                                                           │
│  Provides +1 to ship attack rating in combat. This bonus applies to all  │
│  beam and missile weapons on ships equipped with this computer.          │
│                                                                           │
│  Unlocks:                                                                 │
│  • Battle Computer I component for Ship Design                           │
│                                                                           │
│  Tech Level: 1  |  Field: Computers  |  Research Cost: 80 RP             │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Research Summary Box (~20% width)

```
┌─────────────────┐
│                 │
│  Total          │
│  Research       │
│                 │
│  127 BC         │
│                 │
│  ┌───────────┐  │
│  │    OK     │  │
│  └───────────┘  │
│                 │
└─────────────────┘
```

- **Total Research**: Empire's total research points per turn
- **OK Button**: Closes the Technology screen and returns to Galaxy Map

---

## Interactions

| Action | Result |
|--------|--------|
| Click field tab | Shows discovered techs for that field in list |
| Click tech in list | Shows full description in bottom panel |
| Drag allocation slider | Adjusts RP allocation (others auto-adjust) |
| Click OK button | Returns to Galaxy Map |

---

## When Research Completes

When a technology finishes researching, a popup appears allowing you to choose the **next tech to research** in that field from available options:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  RESEARCH COMPLETE!                                 │
│  ═══════════════════════════════════════════════    │
│                                                     │
│  You have discovered: Battle Computer II            │
│                                                     │
│  Choose next COMPUTERS research:                    │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ • Battle Computer III                         │  │
│  │   +3 attack bonus                             │  │
│  │                                               │  │
│  │ • ECM Jammer II                               │  │
│  │   +2 defense vs missiles                      │  │
│  │                                               │  │
│  │ • Deep Space Scanner                          │  │
│  │   Reveals enemy ship designs                  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│                              [SELECT]  [LATER]      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Navigation Note

**Important**: The Technology screen is a full-screen modal. There is NO bottom command bar (GAME, DESIGN, FLEET, etc.) on this screen. The only way to exit is:
- Click the **OK** button
- Press **ESC** key

This applies to all modal screens opened from the Galaxy Map's command bar (TECH, DESIGN, FLEET, RACES, PLANETS).
