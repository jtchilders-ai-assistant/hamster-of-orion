# Command Menu: TECH (F4) - MOO1-Accurate Wireframe

## Overview

The TECH command button opens the Research and Technology screen. This is a **full-screen modal** where players view their tech tree and allocate research points (RP) across six technology fields.

**Hotkey**: F4

---

## Screen Layout

This screen is a **full-screen modal** and does **NOT** display the bottom command bar.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           R E S E A R C H                                       │
│  ═══════════════════════════════════════════════════════════════════════════    │
│                                                                                 │
│  ┌────────────────────────────────┐   ┌──────────────────────────────────────┐ │
│  │  FIELD LIST + RP ALLOCATION    │   │  TECH TREE (selected field)          │ │
│  │  (~40% width)                  │   │  (~60% width)                        │ │
│  │                                │   │                                      │ │
│  │  COMPUTERS           25%       │   │  COMPUTERS                           │ │
│  │  Battle Computer II            │   │  ══════════════════════════════════  │ │
│  │  ████████░░░░ 4 turns          │   │                                      │ │
│  ├────────────────────────────────┤   │  ─── Level 1 ──────────────────────  │ │
│  │  CONSTRUCTION        15%       │   │  Battle Computer I           [✓]     │ │
│  │  Duralloy Armor                │   │  ECM Jammer I                [✓]     │ │
│  │  ████░░░░░░░░ 8 turns          │   │                                      │ │
│  ├────────────────────────────────┤   │  ─── Level 2 ──────────────────────  │ │
│  │  FORCE FIELDS        10%       │   │  Battle Computer II          [→]     │ │
│  │  Class I Shield                │   │  ECM Jammer II               [ ]     │ │
│  │  ██░░░░░░░░░░ 12 turns         │   │  Deep Space Scanner          [ ]     │ │
│  ├────────────────────────────────┤   │                                      │ │
│  │  PLANETOLOGY         20%       │   │  ─── Level 3 ──────────────────────  │ │
│  │  Improved Eco                  │   │  Battle Computer III         [ ]     │ │
│  │  ██████░░░░░░ 5 turns          │   │                                      │ │
│  ├────────────────────────────────┤   │  (scrollable; all levels shown)      │ │
│  │  PROPULSION          20%       │   │                                      │ │
│  │  Improved Drives               │   └──────────────────────────────────────┘ │
│  │  ██████░░░░░░ 5 turns          │                                            │
│  ├────────────────────────────────┤                                            │
│  │  WEAPONRY            10%       │                                            │
│  │  Nuclear Bomb                  │                                            │
│  │  ██░░░░░░░░░░ 15 turns         │                                            │
│  └────────────────────────────────┘                                            │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────┐  ┌──────────────────┐ │
│  │  DESCRIPTION PANEL                                  │  │  Total RP:       │ │
│  │                                                     │  │  127 BC/turn     │ │
│  │  Battle Computer II                                 │  │                  │ │
│  │  ═══════════════════════════════════════════        │  │  ┌────────────┐  │ │
│  │  Provides +2 to ship attack rating in combat.       │  │  │     OK     │  │ │
│  │  Applies to beam and missile weapons.               │  │  └────────────┘  │ │
│  │                                                     │  │                  │ │
│  └─────────────────────────────────────────────────────┘  └──────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Design Decision: Two Distinct Research UI Moments

> **Tech Screen (F4)** and **Tech Selection** are two completely separate interactions:
>
> | Moment | When | What it does |
> |--------|------|--------------|
> | **Tech Screen (F4)** | Anytime (player opens it) | 6 RP allocation sliders — redistribute research points across the 6 fields |
> | **Tech Selection Popup** | Start of turn only (when a field completes) | Player picks next tech from 2–3 options for that field |
>
> Players **cannot** select their next tech from the main Tech Screen. Tech picking is deferred to the next turn start.

---

## Detailed Sections

### Left Half: Field List with RP Allocation

Six **stacked field rows** (not tabs or checkboxes) fill the left panel. Each row shows three lines:

1. **Field name** + **RP percentage** (e.g., `COMPUTERS  25%`)
2. **Currently researching** tech name (e.g., `Battle Computer II`)
3. **Progress bar** + **ETA in turns** (e.g., `████████░░░░  4 turns`)

Clicking a field row **selects** it, which updates:
- The right-half tech tree to show that field's technologies
- The bottom description panel

RP percentages for all six fields always sum to 100%. Adjusting one field's percentage affects ETAs in real time.

Each field researches exactly **one tech at a time**. The active tech is shown in the row. **Tech selection does not happen here** — it happens via the start-of-turn popup.

**Field labels (exact MOO1 names)**:
- `COMPUTERS`
- `CONSTRUCTION`
- `FORCE FIELDS`
- `PLANETOLOGY`
- `PROPULSION`
- `WEAPONRY` ← note: not "WEAPONS"

### Right Half: Tech Tree Browser

Shows all technologies in the **selected field**, organized by tech level with horizontal level separators. Each tech entry shows:
- **Tech name**
- **Status indicator**: `[✓]` researched, `[→]` currently researching, `[ ]` not researched

Discovered (already researched) technologies appear brighter/fully colored. Undiscovered ones appear dimmer. Clicking any tech name shows its description in the bottom panel.

### Bottom: Description Panel + Summary Box

**Description panel (~80% width)**:
- Shows the **name** and **short description** of whichever tech was last clicked in the tree
- Minimal format: just name header + description text (no separate tech level / cost fields)

**Summary box (~20% width)**:
- **Total RP** — empire's total research output per turn (e.g., "127 BC/turn")
- **OK button** — closes the screen and returns to the Galaxy Map

---

## Interactions

| Action | Result |
|--------|--------|
| Click field row (left) | Selects field; updates tech tree and description panel |
| Adjust RP % on field row | Reallocates research points; all ETAs recalculate |
| Click tech name (right) | Shows description in bottom panel |
| Press ESC / Click OK | Exits to Galaxy Map |

---

## Design Notes

- **Layout is two-panel, not single-panel**: Left = field overview with RP allocation; Right = tech tree detail for selected field. The original wireframe incorrectly showed a single stacked layout.
- **No mid-turn tech picking**: Players cannot select or change their active research target from the main Tech Screen. The active research per field is set exclusively via the **start-of-turn Tech Selection Popup** (when a field completes). The main Tech Screen is for viewing the tech tree and adjusting RP allocation only.
- **RP sliders vs. percentages**: MOO1 uses percentage values per field row, not a separate slider panel. Dragging or clicking the percentage column adjusts allocation.
- **Tech tree is hierarchical but not prerequisite-gated in the wireframe display**: All levels are visible. Locked techs are simply dimmer, not hidden.
- **Title is "RESEARCH"**, not "TECHNOLOGY TREE".

---

## Start-of-Turn Tech Selection Popup

> This is a **separate UI moment** from the main Tech Screen. It is triggered automatically at the start of turn when a field completes its research. The player cannot initiate this from the Tech Screen.

When a field's research completes, the player is prompted to choose the next research target for that field. This appears as a **full-screen overlay** at the **start of the following turn** — before normal gameplay resumes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│            SELECT NEXT COMPUTERS RESEARCH                                   │
│            ═══════════════════════════════════════════════════════          │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Battle Computer III                                                 │  │
│  │  Provides +3 attack bonus to all beam and missile weapons.           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ECM Jammer II                                                       │  │
│  │  +2 defense bonus vs. incoming missiles.                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Deep Space Scanner                                                  │  │
│  │  Reveals enemy ship loadouts and sensor positions.                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Appears at **start of turn only** — never mid-turn
- Player **must choose** one option — no skip/later button
- Options are large clickable rows (name + description)
- MOO1 randomizes which techs from the next level are offered (typically 2–3 options)
- If multiple fields completed last turn, popups appear in sequence (one per field)

---

## New Technology Notification

When research completes, a popup announces the discovery at the **start of the next turn**. Tech selection is bundled into this popup — there is no mid-turn interruption:

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  You have discovered:  Battle Computer II                    │
│  ════════════════════════════════════════════════════        │
│                                                              │
│  [Tech graphic]                                              │
│                                                              │
│  Provides +2 to ship attack rating in combat.                │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  Choose next COMPUTERS research:                             │
│                                                              │
│  [ Battle Computer III   +3 attack bonus                ]   │
│  [ ECM Jammer II         +2 defense vs missiles         ]   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Reference Screenshots

All paths are relative to `design/moo_screens/` from the project root.

| File | What it shows |
|------|--------------|
| [`../../moo_screens/moo_tech.png`](../../moo_screens/moo_tech.png) | Main RESEARCH screen — left field list, right tech tree, bottom description panel |
| [`../../moo_screens/moo_new_tech.png`](../../moo_screens/moo_new_tech.png) | New technology discovery popup with next-research selection options |
| [`../../moo_screens/moo_new_tech_eco_increase.png`](../../moo_screens/moo_new_tech_eco_increase.png) | Tech screen: Planetology selected, showing RP reallocation and ETA impact |
| [`../../moo_screens/moo_tech_eco_reduction.png`](../../moo_screens/moo_tech_eco_reduction.png) | Tech screen: reduced Planetology RP, demonstrating ETA increase |
| [`../../moo_screens/moo_start_of_turn_select_new_research.png`](../../moo_screens/moo_start_of_turn_select_new_research.png) | Start-of-turn research selection screen (full-screen option list) |
