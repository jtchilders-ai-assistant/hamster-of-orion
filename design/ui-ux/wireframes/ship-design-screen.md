# Ship Design Screen (F6) - MOO1-Accurate Wireframe

## Overview

The Ship Design screen is a **full-screen modal** opened by clicking DESIGN on the Galaxy Map's bottom command bar. It allows players to create and modify ship designs. **No bottom command bar** - exit via Cancel or Build buttons.

**Reference**: `design/moo_screens/moo_ship_design.png`  
**Hotkey**: F6

---

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                         TOP PANEL — SHIP SYSTEMS                            │   │
│  │  ┌───────────────────────────────┐  ┌───────────────────────────────────┐  │   │
│  │  │  Computer    Attack Level: 0  │  │  Armor    Titanium    3 Hit Pts   │  │   │
│  │  │  Shield      (none)           │  │  Engine   Retros  Warp 1  Def 3   │  │   │
│  │  │  ECM         Missile Def: 3   │  │  Maneuver Rating 1  Combat Spd 1  │  │   │
│  │  └───────────────────────────────┘  └───────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                         MIDDLE PANEL — WEAPONS                              │   │
│  │  ┌────────┬───────┬──────────────────┬────────┬──────┬─────────────────┐   │   │
│  │  │  Slot  │ Count │   Ship Weapons   │ Damage │ Arc  │     Notes       │   │   │
│  │  ├────────┼───────┼──────────────────┼────────┼──────┼─────────────────┤   │   │
│  │  │ Weap 1 │       │     (empty)      │        │      │                 │   │   │
│  │  │ Weap 2 │       │     (empty)      │        │      │                 │   │   │
│  │  │ Weap 3 │       │     (empty)      │        │      │                 │   │   │
│  │  │ Weap 4 │       │     (empty)      │        │      │                 │   │   │
│  │  └────────┴───────┴──────────────────┴────────┴──────┴─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌──────────────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │         SPECIAL EQUIPMENT                │  │        SHIP PREVIEW            │ │
│  │  ┌────────┬────────────────────────────┐ │  │                                │ │
│  │  │ Spec 1 │ Reserve Fuel Tanks (+3 rng)│ │  │     ┌──────────────────┐       │ │
│  │  │ Spec 2 │        (empty)             │ │  │     │                  │       │ │
│  │  │ Spec 3 │        (empty)             │ │  │     │   [3D RENDERED   │       │ │
│  │  └────────┴────────────────────────────┘ │  │     │    SHIP IMAGE]   │       │ │
│  │                                          │  │     │                  │       │ │
│  │                                          │  │     └──────────────────┘       │ │
│  │                                          │  │                                │ │
│  │                                          │  │   (space backdrop w/ planet)  │ │
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

### Top Panel — Ship Systems

Split into **two columns** covering core ship stats:

**Left Column:**
| System | Description |
|--------|-------------|
| **Computer** | Attack Level bonus (e.g., 0, +1, +2...) |
| **Shield** | Deflector shields (or "none") |
| **ECM** | Missile Defense rating (electronic countermeasures) |

**Right Column:**
| System | Description |
|--------|-------------|
| **Armor** | Armor type + Hit Points (e.g., "Titanium, 3 Hit Pts") |
| **Engine** | Engine type + Warp Speed + Defense bonus (e.g., "Retros, Warp 1, Def 3") |
| **Maneuver** | Maneuver Rating + Combat Speed (e.g., "Rating 1, Combat Spd 1") |

These are foundational defensive and mobility components.

---

### Middle Panel — Weapons

A **table with 4 weapon slots**, each showing:

| Column | Description |
|--------|-------------|
| **Slot** | Weapon 1, Weapon 2, Weapon 3, Weapon 4 |
| **Count** | Number of this weapon equipped |
| **Ship Weapons** | Weapon type name |
| **Damage** | Damage dealt |
| **Arc** | Firing angle/arc |
| **Notes** | Special properties |

```
┌────────┬───────┬──────────────────┬────────┬──────┬─────────────────┐
│  Slot  │ Count │   Ship Weapons   │ Damage │ Arc  │     Notes       │
├────────┼───────┼──────────────────┼────────┼──────┼─────────────────┤
│ Weap 1 │   2   │ Laser            │  1-4   │  —   │                 │
│ Weap 2 │   1   │ Nuclear Missiles │  4     │  —   │ 2 shots/rack    │
│ Weap 3 │       │     (empty)      │        │      │                 │
│ Weap 4 │       │     (empty)      │        │      │                 │
└────────┴───────┴──────────────────┴────────┴──────┴─────────────────┘
```

---

### Special Equipment

**Three special slots** for non-weapon equipment:

| Slot | Example Equipment |
|------|-------------------|
| Special 1 | Reserve Fuel Tanks (+3 parsec range) |
| Special 2 | (empty) |
| Special 3 | (empty) |

Special equipment provides utility bonuses like extended range, scanners, etc.

---

### Ship Preview

A **rendered 3D image** of the ship displayed against a space backdrop (with planet visible). This gives a visual sense of the hull design.

---

### Bottom Bar — Summary

**Ship Size Selection:**
```
(•) Small   ( ) Medium   ( ) Large   ( ) Huge
```
Radio buttons to select hull size. Each size has different total space.

**Ship Icon:**
A tiny pixel sprite showing how the ship will appear on the galaxy map.

**Design Name:**
Editable text field (e.g., "GUNBOAT")

**Cost & Space:**
| Stat | Description |
|------|-------------|
| **Ship Cost** | BC (billion credits) to build one ship |
| **Total Space** | Maximum space units for this hull size |
| **Available** | Space remaining after equipped components |

**Action Buttons:**
| Button | Function |
|--------|----------|
| **CANCEL** | Exit without saving changes |
| **CLEAR** | Remove all components, reset to empty hull |
| **BUILD** | Save design (makes it available for production) |

---

## Visual Style

Classic early-90s aesthetic:
- **Green-on-black** terminal text
- **Orange accent** highlights
- Functional layout prioritizing **information density**
- Remarkably readable despite the era

---

## Interactions

| Action | Result |
|--------|--------|
| Click hull size radio button | Changes ship size, updates total space |
| Click system slot | Opens component selection for that slot |
| Click weapon slot | Opens weapon selection/count dialog |
| Click special slot | Opens special equipment selection |
| Edit name field | Changes ship design name |
| Click CLEAR | Removes all components |
| Click CANCEL | Exits without saving |
| Click BUILD | Saves design, exits to Galaxy Map |

---

## Space Management

- **Total Space** determined by hull size (Small=40, Medium=?, Large=?, Huge=?)
- Each component consumes space
- **Available Space** = Total Space - Used Space
- Cannot add components if insufficient space remains
