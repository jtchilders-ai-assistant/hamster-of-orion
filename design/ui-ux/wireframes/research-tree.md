# Technology Screen (F4) - MOO1-Accurate Wireframe

## Overview

The Technology screen is a **full-screen modal** opened by clicking TECH on the Galaxy Map's bottom command bar. It has **no bottom command bar** — you return to the Galaxy Map by clicking the OK button.

**Hotkey**: F4

---

## Screen Layout

The screen is divided into **two main halves** (left and right) plus a **bottom section** with a description panel and exit controls.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              R E S E A R C H                                    │
│  ═══════════════════════════════════════════════════════════════════════════    │
│                                                                                 │
│  ┌──────────────────────────────────┐  ┌───────────────────────────────────┐  │
│  │                                  │  │                                   │  │
│  │   LEFT HALF                      │  │   RIGHT HALF                      │  │
│  │   FIELD LIST + RP ALLOCATION     │  │   TECH TREE BROWSER               │  │
│  │   (~40% width)                   │  │   (~60% width)                    │  │
│  │                                  │  │                                   │  │
│  │  ┌──────────────────────────┐   │  │  ┌─────────────────────────────┐  │  │
│  │  │ COMPUTERS          25%  │   │  │  │ COMPUTERS (selected field)  │  │  │
│  │  │ Battle Computer II      │   │  │  │ ═══════════════════════════ │  │  │
│  │  │ ████████░░░░ 4 turns   │   │  │  │                             │  │  │
│  │  ├──────────────────────────┤   │  │  │ ── Level 1 ─────────────── │  │  │
│  │  │ CONSTRUCTION       15%  │   │  │  │  Battle Computer I    [✓]  │  │  │
│  │  │ Duralloy Armor          │   │  │  │  ECM Jammer I         [✓]  │  │  │
│  │  │ ████░░░░░░░░ 8 turns   │   │  │  │                             │  │  │
│  │  ├──────────────────────────┤   │  │  │ ── Level 2 ─────────────── │  │  │
│  │  │ FORCE FIELDS       10%  │   │  │  │  Battle Computer II   [→]  │  │  │
│  │  │ Class I Shield          │   │  │  │  ECM Jammer II        [ ]  │  │  │
│  │  │ ██░░░░░░░░░░ 12 turns  │   │  │  │  Deep Space Scanner   [ ]  │  │  │
│  │  ├──────────────────────────┤   │  │  │                             │  │  │
│  │  │ PLANETOLOGY        20%  │   │  │  │ ── Level 3 ─────────────── │  │  │
│  │  │ Improved Eco          │   │  │  │  Battle Computer III   [ ]  │  │  │
│  │  │ ██████░░░░░░  5 turns  │   │  │  │                             │  │  │
│  │  ├──────────────────────────┤   │  │  │ (scrollable list)           │  │  │
│  │  │ PROPULSION         20%  │   │  │  └─────────────────────────────┘  │  │
│  │  │ Improved Drives         │   │  │                                   │  │
│  │  │ ██████░░░░░░  5 turns  │   │  └───────────────────────────────────┘  │
│  │  ├──────────────────────────┤   │                                         │
│  │  │ WEAPONRY           10%  │   │                                         │
│  │  │ Nuclear Bomb            │   │                                         │
│  │  │ ██░░░░░░░░░░ 15 turns  │   │                                         │
│  │  └──────────────────────────┘   │                                         │
│  │                                  │                                         │
│  └──────────────────────────────────┘                                         │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────┐ ┌───────────────┐ │
│  │                                                        │ │               │ │
│  │   TECH DESCRIPTION PANEL          (~80% width)         │ │  Total RP:    │ │
│  │                                                        │ │  127 BC/turn  │ │
│  │   Battle Computer II                                   │ │               │ │
│  │   ═══════════════════════════════════════════════      │ │               │ │
│  │                                                        │ │  ┌─────────┐  │ │
│  │   Provides +2 to ship attack rating in combat.         │ │  │   OK    │  │ │
│  │   Applies to all beam and missile weapons.             │ │  └─────────┘  │ │
│  │                                                        │ │               │ │
│  └────────────────────────────────────────────────────────┘ └───────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Left Half: Field List with RP Allocation

Six **stacked field rows** (not tabs) run the full height of the left panel. Each row shows:

```
┌──────────────────────────────────┐
│  COMPUTERS              25%      │  ← Field name + RP % allocated
│  Battle Computer II              │  ← Currently researching
│  ████████░░░░  4 turns           │  ← Progress bar + ETA
├──────────────────────────────────┤
│  CONSTRUCTION           15%      │
│  Duralloy Armor                  │
│  ████░░░░░░░░  8 turns           │
├──────────────────────────────────┤
│  FORCE FIELDS           10%      │
│  Class I Shield                  │
│  ██░░░░░░░░░░  12 turns          │
├──────────────────────────────────┤
│  PLANETOLOGY            20%      │
│  Improved Eco                    │
│  ██████░░░░░░  5 turns           │
├──────────────────────────────────┤
│  PROPULSION             20%      │
│  Improved Drives                 │
│  ██████░░░░░░  5 turns           │
├──────────────────────────────────┤
│  WEAPONRY               10%      │
│  Nuclear Bomb                    │
│  ██░░░░░░░░░░  15 turns          │
└──────────────────────────────────┘
```

**Behavior**:
- Clicking a field row **selects** that field and updates the right-half tech tree and bottom description panel
- The selected field row is visually highlighted
- RP percentages across all six fields sum to 100%
- RP allocation is adjusted by dragging the percentage value or via sliders (exact MOO1 mechanic: clicking/dragging on the % column)
- If a field has 0% RP, its ETA shows "Never" or is blank

**Field names (exact MOO1 labels)**:
| Label | Full Name |
|-------|-----------|
| COMPUTERS | Computers |
| CONSTRUCTION | Construction |
| FORCE FIELDS | Force Fields |
| PLANETOLOGY | Planetology |
| PROPULSION | Propulsion |
| WEAPONRY | Weaponry |

> **Note**: The right-most column is labeled "WEAPONRY" in MOO1, not "WEAPONS" or "WEAP".

---

## Right Half: Tech Tree Browser

Shows all technologies in the **currently selected field**, organized by tech level with level separators. Technologies span from Level 1 through the highest level in that field.

```
┌──────────────────────────────────────────────┐
│  COMPUTERS                                   │
│  ════════════════════════════════════════    │
│                                              │
│  ─── Level 1 ───────────────────────────    │
│  Battle Computer I                  [✓]      │  ← Already researched
│  ECM Jammer I                       [✓]      │  ← Already researched
│                                              │
│  ─── Level 2 ───────────────────────────    │
│  Battle Computer II                 [→]      │  ← Currently researching
│  ECM Jammer II                      [ ]      │  ← Available but not chosen
│  Deep Space Scanner                 [ ]      │  ← Available but not chosen
│                                              │
│  ─── Level 3 ───────────────────────────    │
│  Battle Computer III                [ ]      │  ← Locked (prereq not met)
│                                              │
│  (continues for all levels in field)        │
└──────────────────────────────────────────────┘
```

**Tech States**:
| Indicator | Meaning |
|-----------|---------|
| `[✓]` | Already discovered/researched |
| `[→]` | Currently being researched (active) |
| `[ ]` | Not yet researched (available or locked) |

**Behavior**: Click any tech in the list to display its description in the bottom panel. Discovered techs are brighter/fully colored; undiscovered techs appear dimmer.

---

## Bottom Section

### Tech Description Panel (~80% width)

Displays details of the tech **clicked in the right-half tech tree**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  Battle Computer II                                                          │
│  ══════════════════════════════════════════════════════════════════════      │
│                                                                              │
│  Provides +2 to ship attack rating in combat. This bonus applies to all     │
│  beam and missile weapons on ships equipped with this computer.              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

> **Note**: MOO1's description panel is relatively minimal — a name header and a short description. It does **not** display tech level, field, or research cost as separate labeled fields.

### Right Summary Box (~20% width)

```
┌─────────────────────┐
│                     │
│  Total RP:          │
│  127 BC/turn        │  ← Empire's total research output
│                     │
│  ┌───────────────┐  │
│  │     OK        │  │  ← Returns to Galaxy Map
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

---

## Interactions

| Action | Result |
|--------|--------|
| Click field row (left half) | Selects that field; updates tech tree (right) and description (bottom) |
| Adjust RP % on field row | Reallocates research points; ETA values update |
| Click tech in tree (right half) | Shows tech description in bottom panel |
| Click OK button | Returns to Galaxy Map |
| Press ESC | Returns to Galaxy Map |

---

## Research Selection Screen (Start of Turn)

When a technology finishes researching **and** the player needs to choose their next research target, a **full-screen selection modal** appears at the start of the next turn (before the main tech screen). This is distinct from the main tech screen.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│              SELECT NEXT COMPUTERS RESEARCH                                 │
│              ═══════════════════════════════════════════════════════        │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────┐     │
│   │                                                                  │     │
│   │  Battle Computer III                                             │     │  ← Clickable option
│   │  Provides +3 attack bonus to all beam and missile weapons.       │     │
│   │                                                                  │     │
│   ├──────────────────────────────────────────────────────────────────┤     │
│   │                                                                  │     │
│   │  ECM Jammer II                                                   │     │  ← Clickable option
│   │  +2 defense bonus vs. incoming missiles.                         │     │
│   │                                                                  │     │
│   ├──────────────────────────────────────────────────────────────────┤     │
│   │                                                                  │     │
│   │  Deep Space Scanner                                              │     │  ← Clickable option
│   │  Reveals enemy ship loadouts and positions.                      │     │
│   │                                                                  │     │
│   └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behavior**:
- Player **must select** one option before proceeding — there is no "skip" or "later" button
- Each option is a large clickable row with tech name and description
- Number of options varies (typically 2–4); MOO1 randomizes which techs from the next level are offered
- After selecting, the game returns to normal turn resolution

---

## New Technology Notification (Research Complete)

When a technology completes mid-game, a **popup dialog** appears announcing the discovery and prompting selection of next research:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  You have discovered:                                   │
│  Battle Computer II                                     │
│  ═══════════════════════════════════════════════════    │
│                                                         │
│  [Tech icon / graphic]                                  │
│                                                         │
│  Provides +2 to ship attack rating in combat.           │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Choose next COMPUTERS research:                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Battle Computer III                            │   │  ← Option row
│  │  +3 attack bonus                                │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ECM Jammer II                                  │   │  ← Option row
│  │  +2 defense vs missiles                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Navigation Note

**Important**: The Technology screen is a full-screen modal. There is **no bottom command bar** (GAME, DESIGN, FLEET, etc.) on this screen. The only ways to exit are:
- Click the **OK** button
- Press **ESC**

This applies to all modal screens opened from the Galaxy Map's command bar (TECH, DESIGN, FLEET, RACES, PLANETS).

---

## Reference Screenshots

All screenshots are relative to `design/moo_screens/` from the project root.

| File | What it shows |
|------|--------------|
| [`../moo_screens/moo_tech.png`](../moo_screens/moo_tech.png) | Main technology screen — left field list, right tech tree, bottom description |
| [`../moo_screens/moo_new_tech.png`](../moo_screens/moo_new_tech.png) | "New Technology" discovery popup with next-research selection |
| [`../moo_screens/moo_new_tech_eco_increase.png`](../moo_screens/moo_new_tech_eco_increase.png) | Tech screen showing Planetology field selected; RP reallocation effect on ETA |
| [`../moo_screens/moo_tech_eco_reduction.png`](../moo_screens/moo_tech_eco_reduction.png) | Tech screen with reduced ecology RP allocation; demonstrates ETA changes |
| [`../moo_screens/moo_start_of_turn_select_new_research.png`](../moo_screens/moo_start_of_turn_select_new_research.png) | Start-of-turn research selection screen (full-screen option picker) |
