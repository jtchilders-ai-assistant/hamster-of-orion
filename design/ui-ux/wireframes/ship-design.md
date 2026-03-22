# Ship Design UI - Detailed Wireframe Specification

## Overview

The Ship Design screen (F6) is the interface for creating and managing custom ship blueprints in Hamster of Orion. Players select a hull class, assign weapons, computers, shields, and special systems within the available space budget. This screen matches MOO1's ship design interface while incorporating modern web enhancements for usability.

**Reference**: Master of Orion (1993) Ship Design Screen  
**Hotkey**: F6  
**Target Resolution**: 1920×1080 (scalable)

---

## Core Concepts

### Ship Design Philosophy (MOO1-Faithful)
- **6 Active Designs**: Player can have up to 6 active ship designs at any time
- **Hull Classes**: Scout, Fighter, Destroyer, Cruiser, Battlecruiser, Dreadnought (unlocked via Construction tech)
- **Space Budget**: Each hull has fixed space; components consume space
- **Miniaturization**: Older techs shrink 5% per tech level above their original level
- **Cost Calculation**: Sum of all component costs with hull base cost

### Design Slots
Players have exactly 6 design slots. When all slots are full, they must:
1. **Scrap** an existing design (ships in production/active fleets are affected)
2. **Overwrite** a design (same consequences)

---

## Screen Layout: Default View (Design List)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  SHIP DESIGN CENTER                                                            [?] Help          ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Active Designs (6 Slots)────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                               │ ║
║  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐                   │ ║
║  │  │ 1. SCOUT            │  │ 2. FIGHTER          │  │ 3. DESTROYER        │                   │ ║
║  │  │ ══════════════════  │  │ ══════════════════  │  │ ══════════════════  │                   │ ║
║  │  │ ┌───────────────┐   │  │ ┌───────────────┐   │  │ ┌───────────────┐   │                   │ ║
║  │  │ │   ·    ·      │   │  │ │  \   ·   /    │   │  │ │  ┌─────────┐  │   │                   │ ║
║  │  │ │    \  │  /    │   │  │ │   \  │  /     │   │  │ │  │  ┌───┐  │  │   │                   │ ║
║  │  │ │     ╲ │ ╱     │   │  │ │    ╲═╪═╱      │   │  │ │  │  │███│  │  │   │                   │ ║
║  │  │ │      ◇─◇      │   │  │ │     ◆─◆       │   │  │ │  │  └───┘  │  │   │                   │ ║
║  │  │ │     ╱   ╲     │   │  │ │    ╱   ╲      │   │  │ │  └─────────┘  │   │                   │ ║
║  │  │ └───────────────┘   │  │ └───────────────┘   │  │ └───────────────┘   │                   │ ║
║  │  │                     │  │                     │  │                     │                   │ ║
║  │  │ "Whisker Scout"     │  │ "Pellet Mk II"      │  │ "Hammerhead"        │                   │ ║
║  │  │ Class: Scout        │  │ Class: Fighter      │  │ Class: Destroyer    │                   │ ║
║  │  │ Space: 50/50        │  │ Space: 100/100      │  │ Space: 250/250      │                   │ ║
║  │  │ Cost: 45 BC         │  │ Cost: 125 BC        │  │ Cost: 380 BC        │                   │ ║
║  │  │ Built: 12           │  │ Built: 24           │  │ Built: 8            │                   │ ║
║  │  │                     │  │                     │  │                     │                   │ ║
║  │  │ [EDIT] [SCRAP]      │  │ [EDIT] [SCRAP]      │  │ [EDIT] [SCRAP]      │                   │ ║
║  │  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘                   │ ║
║  │                                                                                               │ ║
║  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐                   │ ║
║  │  │ 4. CRUISER          │  │ 5. EMPTY SLOT       │  │ 6. EMPTY SLOT       │                   │ ║
║  │  │ ══════════════════  │  │ ══════════════════  │  │ ══════════════════  │                   │ ║
║  │  │ ┌───────────────┐   │  │ ┌───────────────┐   │  │ ┌───────────────┐   │                   │ ║
║  │  │ │ ╔═══════════╗ │   │  │ │               │   │  │ │               │   │                   │ ║
║  │  │ │ ║ ┌───────┐ ║ │   │  │ │      ╭───╮    │   │  │ │      ╭───╮    │   │                   │ ║
║  │  │ │ ║ │ ▓▓▓▓▓ │ ║ │   │  │ │      │ + │    │   │  │ │      │ + │    │   │                   │ ║
║  │  │ │ ║ └───────┘ ║ │   │  │ │      ╰───╯    │   │  │ │      ╰───╯    │   │                   │ ║
║  │  │ │ ╚═══════════╝ │   │  │ │               │   │  │ │               │   │                   │ ║
║  │  │ └───────────────┘   │  │ └───────────────┘   │  │ └───────────────┘   │                   │ ║
║  │  │                     │  │                     │  │                     │                   │ ║
║  │  │ "Sunflower Mk III"  │  │ Create New Design   │  │ Create New Design   │                   │ ║
║  │  │ Class: Cruiser      │  │                     │  │                     │                   │ ║
║  │  │ Space: 500/500      │  │                     │  │                     │                   │ ║
║  │  │ Cost: 850 BC        │  │                     │  │                     │                   │ ║
║  │  │ Built: 3            │  │                     │  │                     │                   │ ║
║  │  │                     │  │                     │  │                     │                   │ ║
║  │  │ [EDIT] [SCRAP]      │  │ [NEW DESIGN]        │  │ [NEW DESIGN]        │                   │ ║
║  │  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘                   │ ║
║  │                                                                                               │ ║
║  └───────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Summary Stats─────────────────────────────────────────────────────────────────────────────┐  ║
║  │                                                                                             │  ║
║  │  Available Hull Classes: Scout, Fighter, Destroyer, Cruiser                                │  ║
║  │  Locked Hull Classes: Battlecruiser (requires Battle Station tech), Dreadnought (requires  │  ║
║  │                       Star Fortress tech)                                                  │  ║
║  │                                                                                             │  ║
║  │  Current Tech Levels:    Weapons: 20    Propulsion: 16    Construction: 15                 │  ║
║  │                          Computers: 18   Force Fields: 12  Planetology: 14                 │  ║
║  │                                                                                             │  ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Select a design to edit or click [NEW DESIGN] to create a new ship                            ║
║                                                                               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: New Design - Hull Selection

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  SHIP DESIGN CENTER - SELECT HULL CLASS                                        [?] Help          ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Hull Selection────────────────────────────────────────────────────────────────────────────┐  ║
║  │                                                                                             │  ║
║  │  Choose a hull class for your new ship design:                                             │  ║
║  │                                                                                             │  ║
║  │  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐                       │  ║
║  │  │    ◈ SCOUT        │  │    ◈ FIGHTER      │  │    ◈ DESTROYER    │                       │  ║
║  │  │  ═══════════════  │  │  ═══════════════  │  │  ═══════════════  │                       │  ║
║  │  │  ┌─────────────┐  │  │  ┌─────────────┐  │  │  ┌─────────────┐  │                       │  ║
║  │  │  │    ·  ·     │  │  │  │   \  ·  /   │  │  │  │ ┌─────────┐ │  │                       │  ║
║  │  │  │     ◇─◇     │  │  │  │    ╲═╪═╱    │  │  │  │ │  ┌───┐  │ │  │                       │  ║
║  │  │  │    ╱   ╲    │  │  │  │     ◆─◆     │  │  │  │ │  │▓▓▓│  │ │  │                       │  ║
║  │  │  └─────────────┘  │  │  └─────────────┘  │  │  │ └─────────┘ │  │                       │  ║
║  │  │                   │  │                   │  │  └─────────────┘  │                       │  ║
║  │  │  Space: 50        │  │  Space: 100       │  │  Space: 250       │                       │  ║
║  │  │  Base Cost: 25 BC │  │  Base Cost: 50 BC │  │  Base Cost: 125 BC│                       │  ║
║  │  │  Base HP: 5       │  │  Base HP: 10      │  │  Base HP: 25      │                       │  ║
║  │  │                   │  │                   │  │                   │                       │  ║
║  │  │  Role: Recon &    │  │  Role: Swarm &    │  │  Role: Mainline   │                       │  ║
║  │  │  Exploration      │  │  Screening        │  │  Workhorse        │                       │  ║
║  │  │                   │  │                   │  │                   │                       │  ║
║  │  │     [SELECT]      │  │     [SELECT]      │  │     [SELECT]      │                       │  ║
║  │  └───────────────────┘  └───────────────────┘  └───────────────────┘                       │  ║
║  │                                                                                             │  ║
║  │  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐                       │  ║
║  │  │    ◈ CRUISER      │  │    🔒 BATTLECRUISER │  │    🔒 DREADNOUGHT │                       │  ║
║  │  │  ═══════════════  │  │  ═══════════════  │  │  ═══════════════  │                       │  ║
║  │  │  ┌─────────────┐  │  │  ┌─────────────┐  │  │  ┌─────────────┐  │                       │  ║
║  │  │  │╔═══════════╗│  │  │  │             │  │  │  │             │  │                       │  ║
║  │  │  │║ ┌───────┐ ║│  │  │  │  ╔═══════╗  │  │  │  │╔═══════════╗│  │                       │  ║
║  │  │  │║ │ ▓▓▓▓▓ │ ║│  │  │  │  ║ ▓▓▓▓▓ ║  │  │  │  │║▓▓▓▓▓▓▓▓▓▓▓║│  │                       │  ║
║  │  │  │║ └───────┘ ║│  │  │  │  ╚═══════╝  │  │  │  │╚═══════════╝│  │                       │  ║
║  │  │  │╚═══════════╝│  │  │  │             │  │  │  │             │  │                       │  ║
║  │  │  └─────────────┘  │  │  └─────────────┘  │  │  └─────────────┘  │                       │  ║
║  │  │                   │  │                   │  │                   │                       │  ║
║  │  │  Space: 500       │  │  Space: 1,000     │  │  Space: 1,500     │                       │  ║
║  │  │  Base Cost: 300 BC│  │  Base Cost: 700 BC│  │  Base Cost: 1200 BC│                       │  ║
║  │  │  Base HP: 60      │  │  Base HP: 120     │  │  Base HP: 200     │                       │  ║
║  │  │                   │  │                   │  │                   │                       │  ║
║  │  │  Role: Heavy      │  │  Requires:        │  │  Requires:        │                       │  ║
║  │  │  Combat Ship      │  │  Battle Station   │  │  Star Fortress    │                       │  ║
║  │  │                   │  │  (Construction 24)│  │  (Construction 36)│                       │  ║
║  │  │     [SELECT]      │  │     [LOCKED]      │  │     [LOCKED]      │                       │  ║
║  │  └───────────────────┘  └───────────────────┘  └───────────────────┘                       │  ║
║  │                                                                                             │  ║
║  └────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Select a hull class to begin ship design                                     [CANCEL]          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Ship Design Editor (Main Interface)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  SHIP DESIGN EDITOR - CRUISER                                                  [?] Help          ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Ship Preview────────────┐  ┌──Component Selection───────────────────────────────────────────┐║
║  │                          │  │                                                                 │║
║  │  Design Name:            │  │  ⚙️  ENGINE (Required)                                          │║
║  │  ┌────────────────────┐  │  │  ─────────────────────────────────────────────────────────────  │║
║  │  │ Sunflower Mk IV    │  │  │  Current: [Ion Drive              ▼]  Space: 15  Cost: 55 BC   │║
║  │  └────────────────────┘  │  │           Speed: 4 | Combat Speed: 4 | Maneuver: +3            │║
║  │                          │  │                                                                 │║
║  │  ┌────────────────────┐  │  │  🔫 WEAPONS                                                     │║
║  │  │                    │  │  │  ─────────────────────────────────────────────────────────────  │║
║  │  │  ╔══════════════╗  │  │  │                                                                 │║
║  │  │  ║  ┌────────┐  ║  │  │  │  Slot 1: [Fusion Beam        ▼] ×4   Space: 120  Cost: 140 BC  │║
║  │  │  ║  │ ▓▓▓▓▓▓ │  ║  │  │  │          Damage: 4-16  Range: 4                                │║
║  │  │  ║  │ ▓▓▓▓▓▓ │  ║  │  │  │                                                                 │║
║  │  │  ║  └────────┘  ║  │  │  │  Slot 2: [Nuclear Missile   ▼] ×10  Space: 100  Cost: 50 BC   │║
║  │  │  ║              ║  │  │  │          Damage: 4  Speed: 2  Racks: 2                         │║
║  │  │  ╚══════════════╝  │  │  │                                                                 │║
║  │  │                    │  │  │  Slot 3: [──── EMPTY ────   ▼]       Space: 0    Cost: 0 BC    │║
║  │  │  ╔═▓▓▓▓▓▓▓▓▓▓▓═╗  │  │  │                                                                 │║
║  │  │  ║   CRUISER    ║  │  │  │  Slot 4: [──── EMPTY ────   ▼]       Space: 0    Cost: 0 BC    │║
║  │  │  ╚══════════════╝  │  │  │                                                                 │║
║  │  └────────────────────┘  │  │  [+ ADD WEAPON SLOT]  (Max 4 weapon types per ship)            │║
║  │                          │  │                                                                 │║
║  │  ─────────────────────   │  │  💻 COMPUTER                                                    │║
║  │  Class: CRUISER          │  │  ─────────────────────────────────────────────────────────────  │║
║  │  Hull HP: 60 (×2.0 Armor)│  │  [Battle Computer III ▼]            Space: 7   Cost: 22 BC    │║
║  │  Total HP: 120           │  │   Attack Rating: +3  (+15% accuracy)                           │║
║  │                          │  │                                                                 │║
║  │  ─────────────────────   │  │  📡 ECM JAMMER                                                  │║
║  │  SPACE USAGE:            │  │  ─────────────────────────────────────────────────────────────  │║
║  │                          │  │  [ECM Jammer II      ▼]             Space: 5   Cost: 12 BC    │║
║  │  Engine:        15       │  │   Missile Defense: +2  (-10% enemy missile accuracy)           │║
║  │  Weapons:      220       │  │                                                                 │║
║  │  Computer:       7       │  │  🛡️ SHIELDS                                                     │║
║  │  ECM:            5       │  │  ─────────────────────────────────────────────────────────────  │║
║  │  Shields:       12       │  │  [Class III Deflector▼]             Space: 12  Cost: 25 BC    │║
║  │  Specials:      25       │  │   Absorbs: 3 damage per hit                                    │║
║  │  ─────────────           │  │                                                                 │║
║  │  Used:    284 / 500      │  │  🔧 ARMOR                                                       │║
║  │  [████████████░░░░░░░]   │  │  ─────────────────────────────────────────────────────────────  │║
║  │  Free:    216            │  │  [Zortrium          ▼]              Space: 0   Cost: +50%     │║
║  │                          │  │   HP Multiplier: ×2.0  Ground Bonus: +10                       │║
║  │  ─────────────────────   │  │                                                                 │║
║  │  TOTAL COST: 682 BC      │  │  ⭐ SPECIAL SYSTEMS                                             │║
║  │                          │  │  ─────────────────────────────────────────────────────────────  │║
║  │                          │  │  [Inertial Stabilizer▼]             Space: 15  Cost: 25 BC    │║
║  │                          │  │   +2 Defense, +2 Initiative                                    │║
║  │                          │  │                                                                 │║
║  │                          │  │  [Battle Scanner    ▼]              Space: 8   Cost: 20 BC    │║
║  │                          │  │   +3 Initiative, +1 Targeting, View enemy stats               │║
║  │                          │  │                                                                 │║
║  │                          │  │  [──── EMPTY ────   ▼]              Space: 0   Cost: 0 BC     │║
║  │                          │  │                                                                 │║
║  │                          │  │  [+ ADD SPECIAL SLOT]  (No limit on special systems)           │║
║  │                          │  │                                                                 │║
║  └──────────────────────────┘  └─────────────────────────────────────────────────────────────────┘║
║                                                                                                   ║
║  ┌──Ship Statistics────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  OFFENSE                    │  DEFENSE                    │  MOBILITY                       │ ║
║  │  ═══════════════════════    │  ═══════════════════════    │  ═══════════════════════        │ ║
║  │  Attack Rating:  +3         │  Defense Rating:    +5      │  Speed: 4 parsecs/turn          │ ║
║  │  Weapons: 4×Fusion Beam     │  Shields: Class III (3)     │  Combat Speed: 4 hexes/turn     │ ║
║  │          10×Nuclear Missile │  Armor: Zortrium (×2.0)     │  Maneuver Bonus: +3             │ ║
║  │  Firepower Rating: ★★★☆☆   │  Hull HP: 120               │  Initiative: +5                 │ ║
║  │                             │  Missile Defense: +2        │  Range: 3 parsecs               │ ║
║  │                             │  Durability: ★★★★☆         │                                 │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  [CLEAR ALL]  [AUTO-DESIGN]  [COPY FROM...]                     [CANCEL]  [SAVE DESIGN ✓]       ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Weapon Selection Dropdown (Expanded)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                   ║
║  🔫 WEAPONS                                                                                       ║
║  ─────────────────────────────────────────────────────────────────────────────────────────────── ║
║                                                                                                   ║
║  Slot 1: [Fusion Beam        ▼] ×4   Space: 120  Cost: 140 BC                                   ║
║          ╔═══════════════════════════════════════════════════════════════════════════════════╗  ║
║          ║  SELECT WEAPON                                                    [×]              ║  ║
║          ╠═══════════════════════════════════════════════════════════════════════════════════╣  ║
║          ║                                                                                    ║  ║
║          ║  ▸ BEAM WEAPONS                                                                    ║  ║
║          ║  ─────────────────────────────────────────────────────────────────────────────    ║  ║
║          ║  │ Laser              │ Dmg: 1-4   │ Rng: 1 │ Spc: 10* │ Cost: 5   │ Starting    ║  ║
║          ║  │ Gatling Laser      │ Dmg: 1-4×4 │ Rng: 1 │ Spc: 20* │ Cost: 12  │ 4 attacks   ║  ║
║          ║  │ Ion Cannon         │ Dmg: 3-8   │ Rng: 2 │ Spc: 15  │ Cost: 15  │ ½ shields   ║  ║
║          ║  │ Mass Driver        │ Dmg: 5-8   │ Rng: 3 │ Spc: 20  │ Cost: 18  │ Ign ½ shld  ║  ║
║          ║  │ Fusion Beam ✓      │ Dmg: 4-16  │ Rng: 4 │ Spc: 30  │ Cost: 35  │ ──          ║  ║
║          ║  │ Heavy Fusion Beam  │ Dmg: 8-24  │ Rng: 4 │ Spc: 45  │ Cost: 50  │ ──          ║  ║
║          ║  │                                                                                ║  ║
║          ║  ▸ MISSILES (Click to expand)                                                     ║  ║
║          ║  ─────────────────────────────────────────────────────────────────────────────    ║  ║
║          ║  │ Nuclear Missile    │ Dmg: 4     │ Spd: 2 │ Spc: 10  │ Cost: 5   │ Racks: 2    ║  ║
║          ║  │ Hyper-V Rocket     │ Dmg: 6     │ Spd: 3.5│ Spc: 12 │ Cost: 8   │ Racks: 2    ║  ║
║          ║  │ Merculite Missile  │ Dmg: 10    │ Spd: 4 │ Spc: 18  │ Cost: 18  │ Racks: 2    ║  ║
║          ║  │ Scatter Pack V     │ Dmg: 5×5   │ Spd: 3.5│ Spc: 20 │ Cost: 15  │ MIRV        ║  ║
║          ║  │                                                                                ║  ║
║          ║  ▸ TORPEDOES (Click to expand)                                                    ║  ║
║          ║  ─────────────────────────────────────────────────────────────────────────────    ║  ║
║          ║  │ 🔒 Anti-Matter Torpedo │ Requires: Tech Level 25                              ║  ║
║          ║  │                                                                                ║  ║
║          ║  ▸ BOMBS (Click to expand)                                                        ║  ║
║          ║  ─────────────────────────────────────────────────────────────────────────────    ║  ║
║          ║  │ Nuclear Bomb       │ Dmg: 3-12  │ ──     │ Spc: 25  │ Cost: 15  │ Bombardment ║  ║
║          ║  │ Fusion Bomb        │ Dmg: 5-20  │ ──     │ Spc: 35  │ Cost: 25  │ Bombardment ║  ║
║          ║  │                                                                                ║  ║
║          ║  ───────────────────────────────────────────────────────────────────────────────  ║  ║
║          ║  * Miniaturized (50% size reduction from tech advancement)                        ║  ║
║          ║                                                                                    ║  ║
║          ╚═══════════════════════════════════════════════════════════════════════════════════╝  ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Weapon Count Selection

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                   ║
║  Slot 1: [Fusion Beam        ▼] ×[  4  ▼]   Space: 120  Cost: 140 BC                            ║
║                                   ╔═══════════════════════════════╗                              ║
║                                   ║  WEAPON COUNT                 ║                              ║
║                                   ╠═══════════════════════════════╣                              ║
║                                   ║                               ║                              ║
║                                   ║  Weapon: Fusion Beam          ║                              ║
║                                   ║  Space per weapon: 30         ║                              ║
║                                   ║  Cost per weapon: 35 BC       ║                              ║
║                                   ║                               ║                              ║
║                                   ║  Available Space: 432         ║                              ║
║                                   ║  Maximum Count: 14            ║                              ║
║                                   ║                               ║                              ║
║                                   ║  ─────────────────────────    ║                              ║
║                                   ║                               ║                              ║
║                                   ║  Select Count:                ║                              ║
║                                   ║  [─────●─────────────────] 4  ║                              ║
║                                   ║   1              7       14   ║                              ║
║                                   ║                               ║                              ║
║                                   ║  Or enter directly: [4    ]   ║                              ║
║                                   ║                               ║                              ║
║                                   ║  ─────────────────────────    ║                              ║
║                                   ║  Total Space: 120             ║                              ║
║                                   ║  Total Cost: 140 BC           ║                              ║
║                                   ║                               ║                              ║
║                                   ║        [CANCEL]  [OK]         ║                              ║
║                                   ╚═══════════════════════════════╝                              ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Special Systems Selection

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                   ║
║  ⭐ SPECIAL SYSTEMS                                                                               ║
║  ─────────────────────────────────────────────────────────────────────────────────────────────── ║
║                                                                                                   ║
║  [Inertial Stabilizer▼]             Space: 15  Cost: 25 BC                                       ║
║   ╔═══════════════════════════════════════════════════════════════════════════════════════════╗  ║
║   ║  SELECT SPECIAL SYSTEM                                                       [×]          ║  ║
║   ╠═══════════════════════════════════════════════════════════════════════════════════════════╣  ║
║   ║                                                                                            ║  ║
║   ║  ▸ TACTICAL SYSTEMS                                                                        ║  ║
║   ║  ───────────────────────────────────────────────────────────────────────────────────────  ║  ║
║   ║  │ Inertial Stabilizer ✓  │ Spc: 15 │ Cst: 25  │ +2 Defense, +2 Initiative              ║  ║
║   ║  │ Inertial Nullifier     │ Spc: 20 │ Cst: 50  │ +4 Defense, +4 Initiative              ║  ║
║   ║  │ Repulsor Beam          │ Spc: 20 │ Cst: 35  │ Push ships 1 hex away                  ║  ║
║   ║  │ Tractor Beam           │ Spc: 20 │ Cst: 40  │ Pull ships 1 hex closer                ║  ║
║   ║  │ 🔒 Stasis Field        │ Spc: 45 │ Cst: 90  │ Requires: Force Fields 38              ║  ║
║   ║  │ 🔒 Displacement Device │ Spc: 40 │ Cst: 110 │ Requires: Force Fields 45              ║  ║
║   ║  │                                                                                        ║  ║
║   ║  ▸ SCANNER SYSTEMS                                                                         ║  ║
║   ║  ───────────────────────────────────────────────────────────────────────────────────────  ║  ║
║   ║  │ Battle Scanner         │ Spc: 8  │ Cst: 20  │ +3 Init, +1 Target, View enemy stats   ║  ║
║   ║  │ Deep Space Scanner     │ Spc: 5  │ Cst: 15  │ Colony detect: 5, Ship detect: 1       ║  ║
║   ║  │ Improved Scanner       │ Spc: 6  │ Cst: 25  │ Colony detect: 7, Ship detect: 2       ║  ║
║   ║  │                                                                                        ║  ║
║   ║  ▸ CLOAKING DEVICES                                                                        ║  ║
║   ║  ───────────────────────────────────────────────────────────────────────────────────────  ║  ║
║   ║  │ 🔒 Cloaking Device     │ Spc: 30 │ Cst: 80  │ Requires: Construction 30              ║  ║
║   ║  │                                                                                        ║  ║
║   ║  ▸ REPAIR SYSTEMS                                                                          ║  ║
║   ║  ───────────────────────────────────────────────────────────────────────────────────────  ║  ║
║   ║  │ Automated Repair       │ Spc: 25 │ Cst: 40  │ +15% HP per turn                        ║  ║
║   ║  │ 🔒 Adv Damage Control  │ Spc: 35 │ Cst: 80  │ Requires: Construction 35              ║  ║
║   ║  │                                                                                        ║  ║
║   ║  ▸ TELEPORTATION                                                                           ║  ║
║   ║  ───────────────────────────────────────────────────────────────────────────────────────  ║  ║
║   ║  │ 🔒 Sub-Space Teleporter│ Spc: 35 │ Cst: 75  │ Requires: Propulsion 28                ║  ║
║   ║  │                                                                                        ║  ║
║   ╚═══════════════════════════════════════════════════════════════════════════════════════════╝  ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Design Over Space Budget (Error State)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  SHIP DESIGN EDITOR - CRUISER                                                  [?] Help          ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Ship Preview────────────┐  ┌──Component Selection───────────────────────────────────────────┐║
║  │                          │  │                                                                 │║
║  │  Design Name:            │  │  ⚙️  ENGINE (Required)                                          │║
║  │  ┌────────────────────┐  │  │  ─────────────────────────────────────────────────────────────  │║
║  │  │ Sunflower Mk IV    │  │  │  Current: [Antimatter Drive        ▼]  Space: 14  Cost: 70 BC  │║
║  │  └────────────────────┘  │  │                                                                 │║
║  │                          │  │  🔫 WEAPONS                                                     │║
║  │  ┌────────────────────┐  │  │  ─────────────────────────────────────────────────────────────  │║
║  │  │                    │  │  │                                                                 │║
║  │  │  ╔══════════════╗  │  │  │  Slot 1: [Heavy Phasor     ▼] ×10  Space: 550  Cost: 700 BC   │║
║  │  │  ║  ┌────────┐  ║  │  │  │          ⚠️ Exceeds available space!                           │║
║  │  │  ║  │ ▓▓▓▓▓▓ │  ║  │  │  │                                                                 │║
║  │  │  ║  │ ▓▓▓▓▓▓ │  ║  │  │  │                                                                 │║
║  │  │  ║  └────────┘  ║  │  │  │                                                                 │║
║  │  │  ║              ║  │  │  │                                                                 │║
║  │  │  ╚══════════════╝  │  │  │                                                                 │║
║  │  │                    │  │  │                                                                 │║
║  │  └────────────────────┘  │  │                                                                 │║
║  │                          │  │                                                                 │║
║  │  ─────────────────────   │  │                                                                 │║
║  │  Class: CRUISER          │  │                                                                 │║
║  │                          │  │                                                                 │║
║  │  ─────────────────────   │  │                                                                 │║
║  │  SPACE USAGE:            │  │                                                                 │║
║  │  ⚠️ OVER BUDGET!          │  │                                                                 │║
║  │                          │  │                                                                 │║
║  │  Engine:        14       │  │                                                                 │║
║  │  Weapons:      550       │  │                                                                 │║
║  │  ─────────────           │  │                                                                 │║
║  │  Used:    564 / 500      │  │                                                                 │║
║  │  [███████████████████▓▓] │  │                                                                 │║
║  │  Over:    -64 ⚠️          │  │                                                                 │║
║  │                          │  │                                                                 │║
║  │  ─────────────────────   │  │                                                                 │║
║  │  DESIGN INVALID          │  │                                                                 │║
║  │  Reduce components by 64 │  │                                                                 │║
║  │  space to save design    │  │                                                                 │║
║  │                          │  │                                                                 │║
║  └──────────────────────────┘  └─────────────────────────────────────────────────────────────────┘║
║                                                                                                   ║
║  ┌──Error Message───────────────────────────────────────────────────────────────────────────────┐║
║  │  ⚠️ DESIGN EXCEEDS SPACE BUDGET                                                               │║
║  │  Your current design uses 564 space but Cruiser hulls only have 500 space available.        │║
║  │  Please reduce weapon count or choose smaller components to save this design.                │║
║  └───────────────────────────────────────────────────────────────────────────────────────────────┘║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  [CLEAR ALL]  [AUTO-DESIGN]  [COPY FROM...]                     [CANCEL]  [SAVE DESIGN ✗]       ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Scrap Design Confirmation Dialog

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  ⚠️ SCRAP SHIP DESIGN                                                              [×]       │ ║
║  │  ═══════════════════════════════════════════════════════════════════════════════════════    │ ║
║  │                                                                                              │ ║
║  │  Are you sure you want to scrap the design "Sunflower Mk III"?                             │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │  WARNING: This action will affect:                                                          │ ║
║  │                                                                                              │ ║
║  │    • 3 ships currently built with this design will be SCRAPPED                             │ ║
║  │    • 2 ships currently under construction will be CANCELLED                                │ ║
║  │    • You will receive 50% of the BC value of scrapped ships (1,275 BC)                    │ ║
║  │                                                                                              │ ║
║  │  Ships using this design:                                                                   │ ║
║  │    ┌─────────────────────────────────────────────────────────────────────────────────────┐ │ ║
║  │    │ Location              │ Ships │ Status                                              │ │ ║
║  │    ├─────────────────────────────────────────────────────────────────────────────────────┤ │ ║
║  │    │ Sol System            │    2  │ Active - will be scrapped                           │ │ ║
║  │    │ Alpha Centauri        │    1  │ Active - will be scrapped                           │ │ ║
║  │    │ New Hamsterton        │    2  │ Building (50%) - will be cancelled                  │ │ ║
║  │    └─────────────────────────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │  Type "SCRAP" to confirm: [____________]                                                    │ ║
║  │                                                                                              │ ║
║  │                                           [CANCEL]  [SCRAP DESIGN]                          │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Auto-Design Options

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  ⚙️ AUTO-DESIGN                                                                    [×]       │ ║
║  │  ═══════════════════════════════════════════════════════════════════════════════════════    │ ║
║  │                                                                                              │ ║
║  │  Automatically create a balanced ship design based on your preferences:                     │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │  Hull Class: CRUISER (500 space)                                                            │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │  DESIGN FOCUS:                                                                              │ ║
║  │                                                                                              │ ║
║  │    ( ) BEAM ATTACKER - Maximize beam weapons for close combat                              │ ║
║  │    (●) MISSILE BOAT - Load up on missiles for ranged combat                                │ ║
║  │    ( ) TORPEDO BOAT - Heavy torpedoes for capital ship hunting                             │ ║
║  │    ( ) BOMBER - Planetary bombardment specialist                                            │ ║
║  │    ( ) DEFENDER - Maximize shields and armor for durability                                 │ ║
║  │    ( ) SCOUT - Speed and sensors, minimal combat                                            │ ║
║  │    ( ) BALANCED - Equal offense and defense                                                 │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │  TECH PREFERENCE:                                                                           │ ║
║  │                                                                                              │ ║
║  │    (●) Use Best Available - Newest technology                                               │ ║
║  │    ( ) Budget Build - Cheaper, miniaturized older tech                                      │ ║
║  │    ( ) Mix - Balance of new and miniaturized                                                │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │                                           [CANCEL]  [GENERATE DESIGN]                       │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Copy From Existing Design

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  📋 COPY DESIGN                                                                   [×]       │ ║
║  │  ═══════════════════════════════════════════════════════════════════════════════════════    │ ║
║  │                                                                                              │ ║
║  │  Copy components from an existing design as a starting point:                               │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │  YOUR DESIGNS:                                                                              │ ║
║  │  ┌───────────────────────────────────────────────────────────────────────────────────────┐ │ ║
║  │  │   │ Name                │ Class      │ Space    │ Cost     │ Ships Built             │ │ ║
║  │  ├───────────────────────────────────────────────────────────────────────────────────────┤ │ ║
║  │  │ ○ │ Whisker Scout       │ Scout      │ 50/50    │ 45 BC    │ 12                      │ │ ║
║  │  │ ○ │ Pellet Mk II        │ Fighter    │ 100/100  │ 125 BC   │ 24                      │ │ ║
║  │  │ ○ │ Hammerhead          │ Destroyer  │ 250/250  │ 380 BC   │ 8                       │ │ ║
║  │  │ ● │ Sunflower Mk III    │ Cruiser    │ 500/500  │ 850 BC   │ 3                       │ │ ║
║  │  └───────────────────────────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │  SELECTED: Sunflower Mk III (Cruiser)                                                       │ ║
║  │                                                                                              │ ║
║  │  Note: If hull classes differ, components will be copied if they fit within the             │ ║
║  │  new hull's space budget. Excess components will be removed.                                │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │                                           [CANCEL]  [COPY COMPONENTS]                       │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Design Saved Confirmation

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  ✓ DESIGN SAVED                                                                   [×]       │ ║
║  │  ═══════════════════════════════════════════════════════════════════════════════════════    │ ║
║  │                                                                                              │ ║
║  │  "Sunflower Mk IV" has been saved to Design Slot 4.                                        │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │  Design Summary:                                                                            │ ║
║  │  ┌───────────────────────────────────────────────────────────────────────────────────────┐ │ ║
║  │  │                                                                                       │ │ ║
║  │  │  Class: Cruiser                      Cost: 682 BC per ship                           │ │ ║
║  │  │  Space: 284 / 500                    HP: 120                                         │ │ ║
║  │  │                                                                                       │ │ ║
║  │  │  Components:                                                                          │ │ ║
║  │  │    • Ion Drive                       • Battle Computer III                           │ │ ║
║  │  │    • 4× Fusion Beam                  • ECM Jammer II                                 │ │ ║
║  │  │    • 10× Nuclear Missile             • Class III Deflector                           │ │ ║
║  │  │    • Zortrium Armor                  • Inertial Stabilizer                           │ │ ║
║  │  │    • Battle Scanner                                                                   │ │ ║
║  │  │                                                                                       │ │ ║
║  │  └───────────────────────────────────────────────────────────────────────────────────────┘ │ ║
║  │                                                                                              │ ║
║  │  You can now build this ship at any colony with shipyard capability.                       │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │                        [BUILD NOW]  [EDIT AGAIN]  [RETURN TO DESIGN LIST]                   │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Miniaturization Info Tooltip

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                   ║
║  🔫 WEAPONS                                                                                       ║
║  ─────────────────────────────────────────────────────────────────────────────────────────────── ║
║                                                                                                   ║
║  Slot 1: [Laser              ▼] ×10  Space: 50*  Cost: 50 BC                                    ║
║          ┌─────────────────────────────────────────────────────────────────────┐                ║
║          │  ℹ️ MINIATURIZATION BONUS                                            │                ║
║          ├─────────────────────────────────────────────────────────────────────┤                ║
║          │                                                                      │                ║
║          │  Laser (Tech Level 1)                                               │                ║
║          │  Current Tech Level: Weapons 20                                     │                ║
║          │                                                                      │                ║
║          │  Tech Levels Above Original: 19                                     │                ║
║          │  Size Reduction: 5% × 19 = 95% (capped at 50%)                     │                ║
║          │                                                                      │                ║
║          │  ─────────────────────────────────────────────────────────────────  │                ║
║          │                                                                      │                ║
║          │  Original Size: 10 space                                            │                ║
║          │  Miniaturized Size: 5 space (50% reduction)                         │                ║
║          │                                                                      │                ║
║          │  This makes older technologies viable on space-limited              │                ║
║          │  hulls and allows packing more weapons per ship.                    │                ║
║          │                                                                      │                ║
║          └─────────────────────────────────────────────────────────────────────┘                ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Component Dropdown Specifications

### Engine Dropdown

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SELECT ENGINE                                                        [×]        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  │ Engine           │ Speed │ Combat │ Maneuver │ Space │ Cost │ Tech Req      │
│  ├───────────────────────────────────────────────────────────────────────────────┤
│  │ Retro Engine     │   1   │   1    │   +1     │  25   │  10  │ Always        │
│  │ Nuclear Engine   │   2   │   2    │   +1     │  22   │  18  │ Propulsion 5  │
│  │ Sub-Light Drive  │   2   │   3    │   +2     │  20   │  25  │ Propulsion 8  │
│  │ Fusion Drive     │   3   │   3    │   +2     │  18   │  35  │ Propulsion 12 │
│  │ Impulse Drive    │   3   │   4    │   +2     │  17   │  45  │ Propulsion 16 │
│  │ Ion Drive ✓      │   4   │   4    │   +3     │  15   │  55  │ Propulsion 20 │
│  │ 🔒 Antimatter    │   5   │   5    │   +3     │  14   │  70  │ Propulsion 26 │
│  │ 🔒 Interphased   │   6   │   6    │   +4     │  12   │  90  │ Propulsion 34 │
│  │                                                                               │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Shield Dropdown

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SELECT SHIELD                                                        [×]        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  │ Shield              │ Absorbs │ Space │ Cost │ Tech Required                 │
│  ├───────────────────────────────────────────────────────────────────────────────┤
│  │ ── NONE ──          │   0     │   0   │   0  │ ──                            │
│  │ Class I Deflector   │   1     │   8   │  12  │ Force Fields 2                │
│  │ Class II Deflector  │   2     │  10   │  18  │ Force Fields 5                │
│  │ Class III Deflector✓│   3     │  12   │  25  │ Force Fields 8                │
│  │ Class IV Deflector  │   4     │  14   │  32  │ Force Fields 11               │
│  │ 🔒 Class V Deflector │   5     │  16   │  42  │ Force Fields 14               │
│  │ 🔒 Class VI Deflector│   6     │  18   │  52  │ Force Fields 18               │
│  │                                                                               │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Armor Dropdown

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SELECT ARMOR                                                         [×]        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  │ Armor         │ HP Mult │ Ground │ Cost Mod │ Tech Required                  │
│  ├───────────────────────────────────────────────────────────────────────────────┤
│  │ Titanium      │  ×1.0   │  +0    │  Base    │ Always                         │
│  │ Duralloy      │  ×1.5   │  +5    │  +25%    │ Construction 10                │
│  │ Zortrium ✓    │  ×2.0   │  +10   │  +50%    │ Construction 17                │
│  │ 🔒 Andrium    │  ×2.5   │  +15   │  +75%    │ Construction 26                │
│  │ 🔒 Tritanium  │  ×3.0   │  +20   │  +100%   │ Construction 34                │
│  │ 🔒 Adamantium │  ×3.5   │  +25   │  +125%   │ Construction 42                │
│  │ 🔒 Neutronium │  ×4.0   │  +30   │  +150%   │ Construction 50                │
│  │                                                                               │
│  Note: Armor does not consume space but affects total ship cost.                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Computer Dropdown

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SELECT BATTLE COMPUTER                                               [×]        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  │ Computer            │ Attack │ Accuracy │ Space │ Cost │ Tech Required       │
│  ├───────────────────────────────────────────────────────────────────────────────┤
│  │ ── NONE ──          │   0    │  Base    │   0   │   0  │ ──                  │
│  │ Battle Computer I   │  +1    │  +5%     │   5   │  10  │ Computers 1         │
│  │ Battle Computer II  │  +2    │  +10%    │   6   │  15  │ Computers 6         │
│  │ Battle Computer III✓│  +3    │  +15%    │   7   │  22  │ Computers 11        │
│  │ Battle Computer IV  │  +4    │  +20%    │   8   │  30  │ Computers 16        │
│  │ 🔒 Battle Computer V│  +5    │  +25%    │   9   │  40  │ Computers 21        │
│  │                                                                               │
│  Hit Chance = 50% + (Attack × 5%) - (Target Defense × 5%)                       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### ECM Dropdown

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  SELECT ECM JAMMER                                                    [×]        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  │ ECM               │ Miss Def │ Effect      │ Space │ Cost │ Tech Required    │
│  ├───────────────────────────────────────────────────────────────────────────────┤
│  │ ── NONE ──        │    0     │ ──          │   0   │   0  │ ──               │
│  │ ECM Jammer I      │   +1     │ -5% missile │   4   │   8  │ Computers 3      │
│  │ ECM Jammer II ✓   │   +2     │ -10% missile│   5   │  12  │ Computers 8      │
│  │ ECM Jammer III    │   +3     │ -15% missile│   6   │  18  │ Computers 13     │
│  │ 🔒 ECM Jammer IV  │   +4     │ -20% missile│   7   │  25  │ Computers 18     │
│  │                                                                               │
│  Note: ECM affects enemy missiles only, not beams or torpedoes.                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F6` | Open Ship Design screen |
| `Escape` | Cancel/Close current dialog |
| `Enter` | Confirm/Save |
| `1-6` | Select design slot 1-6 |
| `N` | New Design |
| `E` | Edit selected design |
| `S` | Save current design |
| `C` | Clear all components |
| `A` | Auto-design |
| `Delete` | Remove selected component |
| `Tab` | Move to next component slot |
| `Shift+Tab` | Move to previous component slot |
| `↑/↓` | Navigate dropdown options |
| `+/-` | Increase/decrease weapon count |

---

## Mouse Interactions

| Element | Click | Right-Click | Hover | Drag |
|---------|-------|-------------|-------|------|
| Design Slot | Select for editing | Context menu (Edit, Copy, Scrap) | Show design summary | — |
| Empty Slot | Open hull selection | — | "Create new design" | — |
| Component Dropdown | Open selection list | Clear component | Show component stats | — |
| Weapon Count | Open count selector | Reset to 1 | Show space calculation | Slider adjustment |
| Space Bar | — | — | Show space breakdown | — |
| Ship Preview | — | — | Rotate view (future) | — |
| [SAVE DESIGN] | Save and return | — | Show save status | — |
| [CANCEL] | Discard changes | — | "Discard unsaved changes" | — |

---

## Component Interaction Details

### Adding a Weapon
1. Click on weapon slot dropdown
2. Browse categories (Beams, Missiles, Torpedoes, Bombs)
3. Select weapon from list
4. Choose weapon count (slider or input)
5. Space and cost update automatically
6. Repeat for additional slots (max 4 weapon types)

### Removing a Weapon
1. Click on weapon slot dropdown
2. Select "── EMPTY ──" option
3. Or right-click weapon slot → "Remove"
4. Or press Delete when slot is focused

### Changing Engine
1. Click engine dropdown
2. Select from available engines
3. Speed/maneuver stats update immediately
4. Cannot remove engine (required component)

### Adding Special Systems
1. Click [+ ADD SPECIAL SLOT]
2. Select system from categorized list
3. Repeat for additional systems (no limit)
4. Some systems conflict and cannot be combined

---

## Validation Rules

### Space Budget
- Total component space must not exceed hull space
- Design cannot be saved if over budget
- Warning shown with exact overage amount

### Required Components
- Engine is required (cannot be empty)
- All other components are optional

### Component Limits
- Maximum 4 different weapon types per ship
- No limit on special systems (space permitting)
- Weapon counts limited by available space

### Tech Requirements
- Components locked if tech level not met
- Locked items show required tech and level
- Indicator: 🔒 with tooltip

### Conflicting Systems
- Some special systems conflict (e.g., cannot have both Repulsor and Tractor beams)
- Conflict shown when selecting incompatible system

---

## State Transitions

```
┌─────────────────┐
│  Design List    │◄──────────────────────────────────────┐
│  (Default View) │                                        │
└────────┬────────┘                                        │
         │                                                 │
         │ [NEW DESIGN] or                                │
         │ [EDIT]                                         │
         ▼                                                 │
┌─────────────────┐                                        │
│  Hull Selection │ (NEW only)                            │
│  Modal          │                                        │
└────────┬────────┘                                        │
         │                                                 │
         │ [SELECT]                                        │
         ▼                                                 │
┌─────────────────┐                                        │
│  Ship Design    │◄─────────────────────────────────┐    │
│  Editor         │                                   │    │
└────────┬────────┘                                   │    │
         │                                            │    │
    ┌────┼─────┬─────────┬─────────┬────────┐       │    │
    │    │     │         │         │        │       │    │
    ▼    ▼     ▼         ▼         ▼        ▼       │    │
┌──────┐ ┌──────┐ ┌───────────┐ ┌──────┐ ┌──────┐   │    │
│Weapon│ │Engine│ │Special Sys│ │Shield│ │Armor │   │    │
│Select│ │Select│ │   Select  │ │Select│ │Select│   │    │
│Modal │ │Dropdown│ │   Modal  │ │Dropdown│ │Dropdown│  │    │
└──┬───┘ └──┬───┘ └────┬──────┘ └──┬───┘ └──┬───┘   │    │
   │        │          │           │        │       │    │
   └────────┴──────────┴───────────┴────────┘       │    │
                       │                             │    │
              [Component selected]                   │    │
                       │                             │    │
                       ▼                             │    │
                 Update Stats                        │    │
                       │                             │    │
         ┌─────────────┴─────────────┐              │    │
         │                           │              │    │
         ▼                           ▼              │    │
   [SAVE DESIGN]              [CANCEL]              │    │
         │                           │              │    │
         ▼                           ▼              │    │
┌─────────────────┐         ┌───────────────┐      │    │
│  Save Success   │         │ Discard       │      │    │
│  Dialog         │         │ Confirmation? │──────┘    │
└────────┬────────┘         └───────┬───────┘           │
         │                          │                    │
    [RETURN TO LIST]           [DISCARD]                │
         │                          │                    │
         └──────────────────────────┴────────────────────┘
```

---

## Data Display Formulas

### Ship Cost Calculation
```
Base_Cost = Hull_Base_Cost
Component_Cost = Sum(Engine_Cost + Weapon_Costs + Computer_Cost + ECM_Cost + Shield_Cost + Special_Costs)
Armor_Modifier = 1.0 + (Armor_Cost_Modifier)
Total_Cost = (Base_Cost + Component_Cost) × Armor_Modifier
```

### Space Usage
```
Used_Space = Engine_Space + Weapon_Space + Computer_Space + ECM_Space + Shield_Space + Special_Space
Free_Space = Hull_Space - Used_Space
```

### HP Calculation
```
Base_HP = Hull_Base_HP (from ship class)
Armor_Multiplier = Armor_HP_Mult (1.0 to 4.0)
Total_HP = floor(Base_HP × Armor_Multiplier)
```

### Miniaturization
```
Levels_Above = Current_Tech_Level - Component_Tech_Level
Size_Reduction = min(0.50, Levels_Above × 0.05)
Miniaturized_Space = floor(Original_Space × (1 - Size_Reduction))
```

### Firepower Rating (Visual)
```
Stars based on total weapon damage potential relative to ship class:
★☆☆☆☆ = Minimal weapons
★★☆☆☆ = Light armament
★★★☆☆ = Standard armament
★★★★☆ = Heavy armament
★★★★★ = Maximum firepower
```

### Durability Rating (Visual)
```
Stars based on effective HP + shields relative to ship class:
★☆☆☆☆ = Paper thin
★★☆☆☆ = Light protection
★★★☆☆ = Standard durability
★★★★☆ = Heavy armor
★★★★★ = Maximum durability
```

---

## JSON Data Schema for Ship Designs

```json
{
  "ship_designs": [
    {
      "id": "design_001",
      "slot": 1,
      "name": "Sunflower Mk IV",
      "hull_class": "cruiser",
      "hull_space": 500,
      "components": {
        "engine": {
          "id": "ion_drive",
          "name": "Ion Drive",
          "space": 15,
          "cost": 55
        },
        "weapons": [
          {
            "id": "fusion_beam",
            "name": "Fusion Beam",
            "count": 4,
            "space_each": 30,
            "space_total": 120,
            "cost_each": 35,
            "cost_total": 140
          },
          {
            "id": "nuclear_missile",
            "name": "Nuclear Missile",
            "count": 10,
            "space_each": 10,
            "space_total": 100,
            "cost_each": 5,
            "cost_total": 50
          }
        ],
        "computer": {
          "id": "bc_3",
          "name": "Battle Computer III",
          "space": 7,
          "cost": 22
        },
        "ecm": {
          "id": "ecm_2",
          "name": "ECM Jammer II",
          "space": 5,
          "cost": 12
        },
        "shield": {
          "id": "shield_3",
          "name": "Class III Deflector",
          "space": 12,
          "cost": 25
        },
        "armor": {
          "id": "zortrium",
          "name": "Zortrium",
          "hp_multiplier": 2.0,
          "cost_modifier": 0.5
        },
        "specials": [
          {
            "id": "inertial_stab",
            "name": "Inertial Stabilizer",
            "space": 15,
            "cost": 25
          },
          {
            "id": "battle_scanner",
            "name": "Battle Scanner",
            "space": 8,
            "cost": 20
          }
        ]
      },
      "calculated_stats": {
        "space_used": 284,
        "space_free": 216,
        "base_hp": 60,
        "total_hp": 120,
        "total_cost": 682,
        "attack_rating": 3,
        "defense_bonus": 5,
        "speed": 4,
        "combat_speed": 4,
        "maneuver": 3,
        "initiative": 5,
        "missile_defense": 2,
        "shield_absorb": 3,
        "firepower_rating": 3,
        "durability_rating": 4
      },
      "ships_built": 0,
      "ships_building": 0,
      "created_turn": 15,
      "last_modified_turn": 15
    }
  ]
}
```

---

## Responsive Behavior

### Wide Screen (1920×1080+)
- Full layout as shown
- All panels visible simultaneously
- Component list shows full details

### Standard Screen (1280×720)
- Component selection becomes stacked tabs
- Ship preview smaller
- Statistics panel below editor
- Dropdowns use compact mode

### Narrow Screen (1024×768)
- Two-column layout
- Ship preview hidden (show on hover/click)
- Component categories as accordion
- Statistics as expandable section

---

## Accessibility Features

### Screen Reader Support
- All components have ARIA labels
- Dropdown selections announced
- Space budget announced on change
- Validation errors announced immediately

### Keyboard Navigation
- Full tab order through all controls
- Dropdown navigation with arrow keys
- Slider adjustment with +/- keys
- Focus indicators clearly visible

### Visual Indicators
- Color-coded space usage (green=ok, yellow=75%+, red=over)
- Lock icons for unavailable tech
- Checkmarks for currently selected items
- Warning icons for validation errors

---

## Error States

### Space Exceeded
- Space bar turns red
- Save button disabled
- Error message displayed below editor
- Components causing overflow highlighted

### Invalid Design Name
- Empty name shows validation error
- Name field highlighted
- Must have name to save

### Duplicate Name Warning
- Warning shown if name matches existing design
- Allow save but confirm overwrite
- Suggest appending "Mk II", "Mk III", etc.

### No Engine Selected
- Engine dropdown shows error state
- Cannot save without engine
- Prompt to select engine

---

## Pet-Themed Flavor

### Default Ship Names by Race
- **Hamsters**: Sunflower, Pellet Runner, Wheel Dancer
- **Budgies**: Featherwind, Sky Dancer, Chirp Storm
- **Guinea Pigs**: Iron Squeak, Thunder Fur, War Piggle
- **Ferrets**: Shadow Slink, Swift Hunter, Tunnel Strike
- **Rats**: Lab Runner, Cheese Seeker, Wire Chewer
- **Mice**: Micro Warrior, Silent Scurry, Crumb Collector
- **Rabbits**: Carrot Cruiser, Warren Defender, Hop Star
- **Ants**: Mandible Prime, Colony One, Worker Alpha
- **Chameleons**: Color Shift, Invisible Eye, Scale Shadow
- **Hermit Crabs**: Shell Fortress, Tide Walker, Coral Guard

### Ship Image Variations
Each hull class has unique ASCII art per race, reflecting their aesthetic:
- Hamsters: Rounded, wheel-inspired designs
- Budgies: Sleek, aerodynamic with wing shapes
- Guinea Pigs: Bulky, heavily armored
- Ferrets: Long, serpentine designs
- Etc.

---

## Related Documents

- `design/ships/ship-classes.md` - Hull class statistics
- `design/ships/components-complete.md` - All component stats
- `design/ships/weapons-complete.md` - All weapon stats
- `design/technology/` - Tech tree for unlocking
- `design/ui-ux/wireframes/fleet-command.md` - Fleet management interface

---

*Last Updated: 2026-03-22*
*Specification: ui-006 - Ship Design UI - ASCII Wireframe*
