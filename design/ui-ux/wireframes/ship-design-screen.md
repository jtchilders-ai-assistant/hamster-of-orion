# Ship Design Screen (F6) - MOO1-Accurate Wireframe

## Overview

The Ship Design screen is a **full-screen modal** opened by clicking DESIGN on the Galaxy Map's bottom command bar. Players create ship designs by selecting size, weapons, and special equipment. **Ship systems are automatically set to the best available technology** - no manual selection required.

**Hotkey**: F6

---

## Key Design Principle

**Automatic Systems**: Computer, Shield, ECM, Armor, Engine, and Maneuver are **automatically equipped with your best available tech**. The player does NOT select these - they're determined by your current research level.

**Player Choices**:
1. Ship Size (determines space available) — chosen at the **top** of the screen
2. Ship Appearance (visual style)
3. Weapons (type and count for 4 slots)
4. Special Equipment (3 slots)

---

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│  Ship Size:  (•) Frigate  ( ) Destroyer  ( ) Cruiser  ( ) Battleship  ( ) Titan    │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                   TOP PANEL — SHIP SYSTEMS (AUTO-ASSIGNED)                  │   │
│  │  ┌───────────────────────────────────┐  ┌─────────────────────────────────┐│   │
│  │  │  Computer    Class I  Attack +1   │  │  Armor     Titanium   3 Hit Pts ││   │
│  │  │  Shield      (none)               │  │  Engine    Nuclear Engines Warp 2││   │
│  │  │  ECM         Missile Def: 3       │  │  Maneuver  Class I  Combat Spd 2 ││   │
│  │  └───────────────────────────────────┘  └─────────────────────────────────┘│   │
│  │                                                                             │   │
│  │  (These are READ-ONLY — automatically set to your best available tech)     │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                    MIDDLE PANEL — WEAPONS (PLAYER SELECTS)                  │   │
│  │  ┌───────┬──────────────────────────┬────────┬──────┐                      │   │
│  │  │ Count │       Ship Weapons       │ Damage │ Arc  │                      │   │
│  │  ├───────┼──────────────────────────┼────────┼──────┤                      │   │
│  │  │   2   │ Laser                    │  1-4   │  —   │                      │   │
│  │  │   1   │ Nuclear Missiles         │  4     │  —   │                      │   │
│  │  │       │       (empty)            │        │      │                      │   │
│  │  │       │       (empty)            │        │      │                      │   │
│  │  └───────┴──────────────────────────┴────────┴──────┘                      │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌──────────────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │    SPECIAL EQUIPMENT (PLAYER SELECTS)    │  │        SHIP PREVIEW            │ │
│  │  ┌────────────────────────────────────┐  │  │                                │ │
│  │  │ Reserve Fuel Tanks  (+3 range)     │  │  │     ┌──────────────────┐       │ │
│  │  │ Colony Module                      │  │  │     │                  │       │ │
│  │  │        (empty)                     │  │  │     │   [3D RENDERED   │       │ │
│  │  └────────────────────────────────────┘  │  │     │    SHIP IMAGE]   │       │ │
│  │                                          │  │     │                  │       │ │
│  │  Examples:                               │  │     └──────────────────┘       │ │
│  │  • Reserve Fuel Tanks (extended range)   │  │                                │ │
│  │  • Colony Module (colonize planets)      │  │   (space backdrop w/ planet)  │ │
│  │  • Battle Scanner                        │  │                                │ │
│  │  • Extended Fuel Tanks                   │  │   [STYLE ◄ ►] (appearance)    │ │
│  └──────────────────────────────────────────┘  └────────────────────────────────┘ │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           BOTTOM BAR — SUMMARY                              │   │
│  │                                                                             │   │
│  │   Name: [ GUNBOAT_________ ]   [ship icon]                                  │   │
│  │                                                                             │   │
│  │   Ship Cost: 8 BC      Total Space: 40      Available: 18                   │   │
│  │                                                                             │   │
│  │                                        [CANCEL]   [CLEAR]   [BUILD]         │   │
│  │                                                                             │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Panel Details

### Ship Size Selector — TOP OF SCREEN

The **Ship Size selector appears at the very top** of the Ship Design screen, above all other panels. It is a radio-button row:

```
(•) Frigate   ( ) Destroyer   ( ) Cruiser   ( ) Battleship   ( ) Titan
```

Selecting a size immediately updates **Total Space** and resets weapons/specials if they no longer fit.

---

### Top Panel — Ship Systems (AUTO-ASSIGNED)

These are **read-only displays** showing what systems will be equipped automatically based on your current technology level:

**Left Column:**
| System | Example Display |
|--------|----------------|
| **Computer** | `Class I  Attack +1` |
| **Shield** | `(none)` or `Class I Shields` |
| **ECM** | `Missile Def: 3` |

**Right Column:**
| System | Example Display |
|--------|----------------|
| **Armor** | `Titanium   3 Hit Pts` |
| **Engine** | `Nuclear Engines  Warp 2` |
| **Maneuver** | `Class I  Combat Spd 2` |

**Important**: Player cannot change these. They upgrade automatically when you research better technology.

---

### Middle Panel — Weapons (PLAYER SELECTS)

A **table with 4 weapon slots**. Columns are:

| Column | Description |
|--------|-------------|
| **Count** | Number of this weapon to equip (uses space) |
| **Ship Weapons** | Weapon type selected from available tech |
| **Damage** | Damage dealt per weapon |
| **Arc** | Firing angle/arc |

**Player actions**:
- Click a row to select weapon type from available weapons
- Adjust count (more weapons = more space used)
- Leave empty if not needed

---

### Special Equipment (PLAYER SELECTS)

**Three slots** for special equipment:

| Example Equipment | Effect |
|-------------------|--------|
| Reserve Fuel Tanks | +3 parsec range |
| Colony Module | Allows colonizing planets |
| Battle Scanner | See enemy ship details in combat |

**Common special equipment**:
- **Colony Module** - Required for colony ships
- **Reserve Fuel Tanks** - Extended travel range
- **Extended Fuel Tanks** - Even more range
- **Battle Scanner** - Intel on enemy ships
- **Anti-Missile Rockets** - Point defense

---

### Ship Preview

- **3D rendered ship image** against space backdrop
- **Style selector** (◄ ►) to choose ship appearance/visual style
- Appearance is cosmetic only - does not affect stats

---

### Bottom Bar — Summary

**Design Name**: Editable text field (e.g. `GUNBOAT`)

**Ship Icon**: Pixel sprite showing galaxy map appearance

**Stats:**
| Stat | Description |
|------|-------------|
| **Ship Cost** | BC to build one ship |
| **Total Space** | Maximum space for this hull size |
| **Available** | Space remaining after weapons/specials |

**Buttons (right side):**
| Button | Function |
|--------|----------|
| **CANCEL** | Exit without saving |
| **CLEAR** | Remove all weapons/specials |
| **BUILD** | Save design |

---

## What Uses Space

Only these player-selected items consume space:
- **Weapons** (count × weapon size)
- **Special Equipment**

Ship systems (Computer, Shield, ECM, Armor, Engine, Maneuver) do **NOT** consume space - they are automatically included.

---

## 4-Column Interaction Element Table

| UI Element | (a) Trigger Response | (b) Visual Transition | (c) Return Path / Exit Method |
| :--- | :--- | :--- | :--- |
| **Hull Size Radio (Frigate..Titan)** | Sets active ship hull size | Recalculates available space; updates hull 3D preview | Remains selected until another size or command button is clicked |
| **Weapon Slot Selector** | Opens weapon category picker modal | Displays available beam/missile/bomb tech list overlay | Click `[Close]` or press `Esc` to return to design workspace |
| **Special Equipment Selector** | Opens special component picker modal | Displays shield generators, engine boosters, colony modules list | Click `[Close]` or press `Esc` to return to design workspace |
| **`[CLEAR]` Button** | Prompts confirmation to reset design | Clears all equipped weapon and special slots | Click `[Cancel]` to dismiss reset prompt |
| **`[BUILD]` Button** | Validates space usage and saves ship design | Saves design to active fleet roster (Slot 1-6) and exits | Returns to Galaxy Map (`moo_galaxy_home.png`) |
| **`[CANCEL]` Button / `Esc` Key** | Discards unsaved design changes | Fades out design workspace | Returns to Galaxy Map (`moo_galaxy_home.png`) |

---

## Reference Screenshots

| File | Description |
|------|-------------|
| [moo_ship_design.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_ship_design.png) | MOO1 Ship Design screen — primary reference |
| [moo_design.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_design.png) | MOO1 Ship Design screen (same image, alternate filename) |
