# Ship Design Screen (F6) - MOO1-Accurate Wireframe

## Overview

The Ship Design screen is a **full-screen modal** opened by clicking DESIGN on the Galaxy Map's bottom command bar. Players create ship designs by selecting size, weapons, and special equipment. **Ship systems are automatically set to the best available technology** - no manual selection required.

**Reference**: `design/moo_screens/moo_ship_design.png`  
**Hotkey**: F6

---

## Key Design Principle

**Automatic Systems**: Computer, Shield, ECM, Armor, Engine, and Maneuver are **automatically equipped with your best available tech**. The player does NOT select these - they're determined by your current research level.

**Player Choices**:
1. Ship Size (determines space available)
2. Ship Appearance (visual style)
3. Weapons (type and count for 4 slots)
4. Special Equipment (3 slots)

---

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                   TOP PANEL — SHIP SYSTEMS (AUTO-ASSIGNED)                  │   │
│  │  ┌───────────────────────────────┐  ┌───────────────────────────────────┐  │   │
│  │  │  Computer    Attack Level: 0  │  │  Armor    Titanium    3 Hit Pts   │  │   │
│  │  │  Shield      (none)           │  │  Engine   Retros  Warp 1  Def 3   │  │   │
│  │  │  ECM         Missile Def: 3   │  │  Maneuver Rating 1  Combat Spd 1  │  │   │
│  │  └───────────────────────────────┘  └───────────────────────────────────┘  │   │
│  │                                                                             │   │
│  │  (These are READ-ONLY — automatically set to your best available tech)     │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                    MIDDLE PANEL — WEAPONS (PLAYER SELECTS)                  │   │
│  │  ┌────────┬───────┬──────────────────┬────────┬──────┬─────────────────┐   │   │
│  │  │  Slot  │ Count │   Ship Weapons   │ Damage │ Arc  │     Notes       │   │   │
│  │  ├────────┼───────┼──────────────────┼────────┼──────┼─────────────────┤   │   │
│  │  │ Weap 1 │   2   │ Laser            │  1-4   │  —   │                 │   │   │
│  │  │ Weap 2 │   1   │ Nuclear Missiles │  4     │  —   │ 2 shots/rack    │   │   │
│  │  │ Weap 3 │       │     (empty)      │        │      │                 │   │   │
│  │  │ Weap 4 │       │     (empty)      │        │      │                 │   │   │
│  │  └────────┴───────┴──────────────────┴────────┴──────┴─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌──────────────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │    SPECIAL EQUIPMENT (PLAYER SELECTS)    │  │        SHIP PREVIEW            │ │
│  │  ┌────────┬────────────────────────────┐ │  │                                │ │
│  │  │ Spec 1 │ Reserve Fuel Tanks (+3 rng)│ │  │     ┌──────────────────┐       │ │
│  │  │ Spec 2 │ Colony Module              │ │  │     │                  │       │ │
│  │  │ Spec 3 │        (empty)             │ │  │     │   [3D RENDERED   │       │ │
│  │  └────────┴────────────────────────────┘ │  │     │    SHIP IMAGE]   │       │ │
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
│  │   Ship Size: (•)Small ( )Medium ( )Large ( )Huge     [ship icon]           │   │
│  │                                                                             │   │
│  │   Name: [ GUNBOAT_________ ]                                                │   │
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

### Top Panel — Ship Systems (AUTO-ASSIGNED)

These are **read-only displays** showing what systems will be equipped automatically based on your current technology level:

**Left Column:**
| System | Description |
|--------|-------------|
| **Computer** | Attack Level bonus - uses your best Battle Computer |
| **Shield** | Deflector shields - uses your best Shield tech (or "none" if not researched) |
| **ECM** | Missile Defense rating - uses your best ECM tech |

**Right Column:**
| System | Description |
|--------|-------------|
| **Armor** | Automatically uses your best armor tech + shows Hit Points |
| **Engine** | Automatically uses your best engine + shows Warp Speed + Defense bonus |
| **Maneuver** | Automatically uses your best maneuver tech + Combat Speed |

**Important**: Player cannot change these. They upgrade automatically when you research better technology.

---

### Middle Panel — Weapons (PLAYER SELECTS)

A **table with 4 weapon slots** that the player can configure:

| Column | Description |
|--------|-------------|
| **Slot** | Weapon 1, Weapon 2, Weapon 3, Weapon 4 |
| **Count** | Number of this weapon to equip (uses space) |
| **Ship Weapons** | Weapon type selected from available tech |
| **Damage** | Damage dealt per weapon |
| **Arc** | Firing angle/arc |
| **Notes** | Special properties (shots per rack, etc.) |

**Player actions**:
- Click a slot to select weapon type from available weapons
- Adjust count (more weapons = more space used)
- Leave empty if not needed

---

### Special Equipment (PLAYER SELECTS)

**Three slots** for special equipment:

| Slot | Example Equipment | Effect |
|------|-------------------|--------|
| Special 1 | Reserve Fuel Tanks | +3 parsec range |
| Special 2 | Colony Module | Allows colonizing planets |
| Special 3 | Battle Scanner | See enemy ship details in combat |

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

**Ship Size Selection:**
```
(•) Small   ( ) Medium   ( ) Large   ( ) Huge
```
Determines total space available for weapons and specials.

**Ship Icon**: Pixel sprite showing galaxy map appearance

**Design Name**: Editable text field

**Stats:**
| Stat | Description |
|------|-------------|
| **Ship Cost** | BC to build one ship |
| **Total Space** | Maximum space for this hull size |
| **Available** | Space remaining after weapons/specials |

**Buttons:**
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

## Interactions

| Action | Result |
|--------|--------|
| Click hull size | Changes available space |
| Click weapon slot | Opens weapon selection popup |
| Adjust weapon count | Changes space used |
| Click special slot | Opens special equipment selection |
| Click style arrows | Changes ship appearance (cosmetic) |
| Edit name | Changes design name |
| Click CLEAR | Removes all weapons/specials |
| Click CANCEL | Exits without saving |
| Click BUILD | Saves design |

---

## Design Workflow

1. **Select hull size** (determines total space)
2. **Choose ship appearance** (cosmetic style)
3. **Add weapons** to up to 4 slots with desired counts
4. **Add special equipment** if needed (colony module, fuel tanks, etc.)
5. **Name the design**
6. **Click BUILD** to save

Ship systems are handled automatically - no selection needed!
