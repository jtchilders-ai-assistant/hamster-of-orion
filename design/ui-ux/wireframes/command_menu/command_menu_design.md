# Command Menu: DESIGN (F6) - MOO1-Accurate Wireframe

## Overview

The DESIGN command button opens the Ship Design screen. This is a **full-screen modal**.

**Hotkey**: F6

---

## Screen Layout

This screen is a **full-screen modal** and does **NOT** display the bottom command bar.

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
│  │  • Battle Scanner                        │  │   [STYLE ◄ ►] (appearance)    │ │
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

## Details

* **Ship Size Selector**: Appears at the **top of the screen** as a radio-button row — NOT in the bottom bar.
* **Auto-assigned Systems**: Computer, Shield, ECM, Armor, Engine, and Maneuver are automatically set to the best available technology.
  - Left column: Computer, Shield, ECM
  - Right column: Armor, Engine, Maneuver
  - Example values: `Nuclear Engines Warp 2`, `Class I Combat Spd 2`
* **Player Choices**:
    * **Ship Size**: Selects the hull class (at top of screen).
    * **Weapons**: Configure up to 4 weapon slots. Columns: Count | Ship Weapons | Damage | Arc.
    * **Special Equipment**: Select up to 3 special devices.
    * **Appearance**: Visual style (cosmetic only).
* **Space Usage**: Only weapons and special equipment consume space.
* **Bottom Bar**: Shows ship name, Ship Cost, Total Space, Available space, and action buttons.
* **Controls**: `CANCEL` to exit, `CLEAR` to reset weapons/specials, `BUILD` to save the design.

---

## Reference Screenshots

| File | Description |
|------|-------------|
| [`../../../moo_screens/moo_ship_design.png`](../../../moo_screens/moo_ship_design.png) | MOO1 Ship Design screen — primary reference |
| [`../../../moo_screens/moo_design.png`](../../../moo_screens/moo_design.png) | MOO1 Ship Design screen (same image, alternate filename) |
