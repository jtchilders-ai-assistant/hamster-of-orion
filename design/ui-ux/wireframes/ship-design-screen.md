# Ship Design Screen (F6) - MOO1-Accurate Wireframe

## Overview

The Ship Design screen is a **full-screen modal** opened by clicking DESIGN on the Galaxy Map's bottom command bar. It allows players to create and modify ship designs by selecting a hull size and equipping components. **No bottom command bar** - exit via OK button.

**Reference**: `design/moo_screens/moo_ship_design.png`  
**Hotkey**: F6

---

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐ │
│  │                     │  │                         │  │      ▲ (scroll up)      │ │
│  │                     │  │   EQUIPPED COMPONENTS   │  │  ┌─────────────────────┐│ │
│  │    ┌───────────┐    │  │   ═══════════════════   │  │  │ Laser         3 sp ││ │
│  │    │           │    │  │                         │  │  │ Gatling Laser 5 sp ││ │
│  │    │   SHIP    │    │  │  Computer: Bat Comp I   │  │  │ Neutron Blast 8 sp ││ │
│  │    │   IMAGE   │    │  │  Shield:   Class I      │  │  │ Ion Cannon   12 sp ││ │
│  │    │           │    │  │  ECM:      Jammer I     │  │  │ ─────────────────── ││ │
│  │    │           │    │  │  Armor:    Titanium     │  │  │ Shield I      5 sp ││ │
│  │    └───────────┘    │  │  Engine:   Retros       │  │  │ Shield II    10 sp ││ │
│  │                     │  │  Maneuver: Class I      │  │  │ ─────────────────── ││ │
│  │  ───────────────    │  │                         │  │  │ ECM Jammer    5 sp ││ │
│  │  HULL SIZE:         │  │  ─────────────────────  │  │  │ Scanner       8 sp ││ │
│  │                     │  │  WEAPONS:               │  │  │ ─────────────────── ││ │
│  │  (•) Small    25 sp │  │                         │  │  │ Retro Engine  5 sp ││ │
│  │  ( ) Medium   60 sp │  │  Laser         x2   6sp │  │  │ Nuclear Eng  10 sp ││ │
│  │  ( ) Large   120 sp │  │  Gatling Laser x1   5sp │  │  │ ─────────────────── ││ │
│  │  ( ) Huge    250 sp │  │                         │  │  │ Titanium Arm  0 sp ││ │
│  │  ( ) Battle  500 sp │  │  ─────────────────────  │  │  │ Duralloy Arm 15 sp ││ │
│  │  ( ) Dread  1000 sp │  │  SPECIALS:              │  │  │                     ││ │
│  │                     │  │  (none)                 │  │  └─────────────────────┘│ │
│  │                     │  │                         │  │      ▼ (scroll down)    │ │
│  └─────────────────────┘  └─────────────────────────┘  └─────────────────────────┘ │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                               │ │
│  │   Design Name: [ Hornet_____________ ]                                        │ │
│  │                                                                               │ │
│  │   SIZE: 18/25    COST: 45 BC    RANGE: 4    SPEED: 1    ATTACK: 2    DEF: 1  │ │
│  │                                                                               │ │
│  │                                                 [CLEAR]  [SCRAP]  [  OK  ]   │ │
│  │                                                                               │ │
│  └───────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Section Details

### Left Column: Ship Preview & Hull Selection

**Ship Image**
- Visual representation of the current hull type
- Changes when different hull size is selected

**Hull Size Selection (Radio Buttons)**
```
┌─────────────────────┐
│  HULL SIZE:         │
│                     │
│  (•) Small    25 sp │  ← Currently selected
│  ( ) Medium   60 sp │
│  ( ) Large   120 sp │
│  ( ) Huge    250 sp │
│  ( ) Battle  500 sp │
│  ( ) Dread  1000 sp │
└─────────────────────┘
```

| Hull | Space | Cost Multiplier | Typical Role |
|------|-------|-----------------|--------------|
| Small | 25 | 1x | Scout, fighter |
| Medium | 60 | 2x | Multi-role |
| Large | 120 | 4x | Destroyer |
| Huge | 250 | 8x | Cruiser |
| Battle | 500 | 16x | Battleship |
| Dread | 1000 | 32x | Dreadnought |

---

### Center Column: Equipped Components

Shows what's currently installed on the ship:

```
┌─────────────────────────┐
│   EQUIPPED COMPONENTS   │
│   ═══════════════════   │
│                         │
│  Computer: Bat Comp I   │  ← One slot
│  Shield:   Class I      │  ← One slot
│  ECM:      Jammer I     │  ← One slot
│  Armor:    Titanium     │  ← One slot (free)
│  Engine:   Retros       │  ← One slot
│  Maneuver: Class I      │  ← One slot
│                         │
│  ─────────────────────  │
│  WEAPONS:               │
│                         │
│  Laser         x2   6sp │  ← Multiple weapons allowed
│  Gatling Laser x1   5sp │
│                         │
│  ─────────────────────  │
│  SPECIALS:              │
│  Reserve Tanks     10sp │  ← Special equipment
└─────────────────────────┘
```

**Component Categories:**
- **Computer**: Battle computers (attack bonus)
- **Shield**: Deflector shields
- **ECM**: Electronic countermeasures (defense vs missiles)
- **Armor**: Hull armor (free, doesn't cost space)
- **Engine**: Propulsion (determines speed)
- **Maneuver**: Combat maneuverability
- **Weapons**: Offensive weapons (multiple allowed)
- **Specials**: Special equipment (multiple allowed)

---

### Right Column: Available Components

Scrollable list of components you can add:

```
┌─────────────────────────┐
│      ▲ (scroll up)      │
│  ┌─────────────────────┐│
│  │ WEAPONS             ││
│  │ Laser         3 sp  ││
│  │ Gatling Laser 5 sp  ││
│  │ Neutron Blast 8 sp  ││
│  │ Ion Cannon   12 sp  ││
│  │ ─────────────────── ││
│  │ SHIELDS             ││
│  │ Shield I      5 sp  ││
│  │ Shield II    10 sp  ││
│  │ ─────────────────── ││
│  │ SPECIALS            ││
│  │ ECM Jammer    5 sp  ││
│  │ Scanner       8 sp  ││
│  │ Reserve Tank 15 sp  ││
│  └─────────────────────┘│
│      ▼ (scroll down)    │
└─────────────────────────┘
```

**Interaction**: Click a component to add it to the ship (if space allows).

---

### Bottom Section: Stats & Buttons

**Design Name Field**
```
Design Name: [ Hornet_____________ ]
```
Editable text field for naming the ship design.

**Ship Statistics**
```
SIZE: 18/25    COST: 45 BC    RANGE: 4    SPEED: 1    ATTACK: 2    DEF: 1
  │     │          │             │           │            │          │
  │     │          │             │           │            │          └─ Defense rating
  │     │          │             │           │            └─ Attack rating
  │     │          │             │           └─ Warp speed
  │     │          │             └─ Parsec range
  │     │          └─ Build cost in BC
  │     └─ Total space available
  └─ Space currently used
```

**Action Buttons**
| Button | Function |
|--------|----------|
| **CLEAR** | Remove all equipped components, reset to empty hull |
| **SCRAP** | Delete this ship design entirely |
| **OK** | Save design and return to Galaxy Map |

---

## Interactions

| Action | Result |
|--------|--------|
| Click hull size | Select that hull, update available space |
| Click available component | Add to ship (if space allows) |
| Click equipped component | Remove from ship |
| Edit design name | Change the ship's name |
| Click CLEAR | Reset to empty hull |
| Click SCRAP | Delete design (with confirmation) |
| Click OK | Save and exit to Galaxy Map |
| Press ESC | Exit without saving (with confirmation if changes made) |

---

## Constraints

- **Space limit**: Cannot exceed hull's total space
- **One of each**: Only one Computer, Shield, ECM, Armor, Engine, Maneuver
- **Multiple weapons**: Can have multiple weapon types and quantities
- **Multiple specials**: Can have multiple special equipment
- **6 designs max**: Empire can only have 6 ship designs active

---

## Design Workflow

1. **Select hull size** based on intended role
2. **Add essential components**: Engine, Computer, Shield
3. **Add weapons** appropriate for the ship's role
4. **Add specials** if space remains
5. **Name the design** descriptively
6. **Click OK** to save

---

## Example Designs

**Scout (Small Hull)**
- Engine: Nuclear
- Computer: None
- Weapons: None
- Special: Reserve Tanks (extended range)
- Role: Exploration

**Fighter (Small Hull)**  
- Engine: Retros
- Computer: Bat Comp I
- Weapons: Laser x3
- Role: Cheap combat ship

**Destroyer (Large Hull)**
- Engine: Nuclear
- Computer: Bat Comp II
- Shield: Class II
- Weapons: Fusion Beam x2, Missiles x1
- Special: ECM Jammer
- Role: Multi-role warship
