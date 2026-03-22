# Research Tree UI - Detailed Wireframe Specification

## Overview

The Research screen (F4) is the primary interface for managing empire-wide technology research in Hamster of Orion. This screen displays all six technology fields, current research progress, allocation sliders for RP distribution, and tech details panels. Players use this screen to guide their empire's technological advancement by choosing which fields to prioritize and selecting specific technologies to research.

**Reference**: Master of Orion (1993) Technology Research Screen  
**Hotkey**: F4  
**Target Resolution**: 1920×1080 (scalable)

---

## Screen Layout: Default View (Research Overview)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  TECHNOLOGY RESEARCH                            Total RP/Turn: 125        [?] Help              ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Research Allocation─────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                               │ ║
║  │  ⚔️  WEAPONS      [🔓]  [░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]  30%  │  38 RP →  Fusion Beam     │ ║
║  │                         [████████████████████░░░░░░░░░░] 68%   │  ETA: 4 turns              │ ║
║  │                                                                │                             │ ║
║  │  🚀 PROPULSION   [🔓]  [░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓]  20%  │  25 RP →  Ion Drive        │ ║
║  │                         [████████████████░░░░░░░░░░░░░░] 54%   │  ETA: 6 turns              │ ║
║  │                                                                │                             │ ║
║  │  🔧 CONSTRUCTION [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓]  15%  │  19 RP →  Duralloy Armor   │ ║
║  │                         [████████████░░░░░░░░░░░░░░░░░░] 42%   │  ETA: 9 turns              │ ║
║  │                                                                │                             │ ║
║  │  💻 COMPUTERS    [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓]  10%  │  13 RP →  Battle Comp III  │ ║
║  │                         [███████████████░░░░░░░░░░░░░░░] 48%   │  ETA: 8 turns              │ ║
║  │                                                                │                             │ ║
║  │  🛡️  FORCE FLDS  [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓]  10%  │  13 RP →  Class III Shield │ ║
║  │                         [███████░░░░░░░░░░░░░░░░░░░░░░░] 23%   │  ETA: 15 turns             │ ║
║  │                                                                │                             │ ║
║  │  🌿 PLANETOLOGY  [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓]  15%  │  19 RP →  Soil Enrichment  │ ║
║  │                         [█████████████████████░░░░░░░░░] 71%   │  ETA: 3 turns              │ ║
║  │                                                                │                             │ ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ║
║  │  TOTAL: 100%                     [🔄 EQUALIZE]  [🔒 LOCK ALL]  [📊 RESEARCH REPORT]         │ ║
║  │                                                                                               │ ║
║  └───────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Selected Technology Details────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Click on a technology field to view details and available tech choices.                    │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │  Empire Research Summary:                                                                   │ ║
║  │                                                                                              │ ║
║  │    Total Scientists:     45M across 5 planets                                               │ ║
║  │    Research Buildings:   3 Research Labs, 1 Supercomputer                                   │ ║
║  │    Racial Modifier:      1.0× (Hamster baseline)                                            │ ║
║  │    Effective RP Output:  125 RP/turn                                                        │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │  Recent Discoveries:                                                                        │ ║
║  │    Turn 12: Nuclear Missiles (Weapons, Tier 2)                                              │ ║
║  │    Turn 10: Extended Fuel Tanks (Propulsion, Tier 2)                                        │ ║
║  │    Turn  8: Research Lab (Computers, Tier 1)                                                │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Notifications: [!] Soil Enrichment nearly complete (71%) - 3 turns remaining                   ║
║                                                                               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Field Selected State (Weapons Example)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  TECHNOLOGY RESEARCH                            Total RP/Turn: 125        [?] Help              ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Research Allocation─────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                               │ ║
║  │  ⚔️  WEAPONS      [🔓]  [░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]  30%  │  38 RP →  Fusion Beam     │ ║
║  │  [SELECTED]             [████████████████████░░░░░░░░░░] 68%   │  ETA: 4 turns  [DETAILS ▼]│ ║
║  │                                                                │                             │ ║
║  │  🚀 PROPULSION   [🔓]  [░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓]  20%  │  25 RP →  Ion Drive        │ ║
║  │                         [████████████████░░░░░░░░░░░░░░] 54%   │  ETA: 6 turns              │ ║
║  │                                                                │                             │ ║
║  │  🔧 CONSTRUCTION [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓]  15%  │  19 RP →  Duralloy Armor   │ ║
║  │                         [████████████░░░░░░░░░░░░░░░░░░] 42%   │  ETA: 9 turns              │ ║
║  │                                                                │                             │ ║
║  │  💻 COMPUTERS    [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓]  10%  │  13 RP →  Battle Comp III  │ ║
║  │                         [███████████████░░░░░░░░░░░░░░░] 48%   │  ETA: 8 turns              │ ║
║  │                                                                │                             │ ║
║  │  🛡️  FORCE FLDS  [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓]  10%  │  13 RP →  Class III Shield │ ║
║  │                         [███████░░░░░░░░░░░░░░░░░░░░░░░] 23%   │  ETA: 15 turns             │ ║
║  │                                                                │                             │ ║
║  │  🌿 PLANETOLOGY  [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓]  15%  │  19 RP →  Soil Enrichment  │ ║
║  │                         [█████████████████████░░░░░░░░░] 71%   │  ETA: 3 turns              │ ║
║  │                                                                │                             │ ║
║  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ║
║  │  TOTAL: 100%                     [🔄 EQUALIZE]  [🔒 LOCK ALL]  [📊 RESEARCH REPORT]         │ ║
║  │                                                                                               │ ║
║  └───────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──⚔️ WEAPONS - Technology Details────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Current Tier: 3                     Researched Techs: 5                                    │ ║
║  │  Highest Tech: Nuclear Missiles      Miniaturization: Tier 1-2 weapons at 50% size         │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │  CURRENT RESEARCH: FUSION BEAM                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │  ┌─────────────────────────────────────────────────────────────────────────────────────┐   │ ║
║  │  │  ╔═══════════════╗                                                                  │   │ ║
║  │  │  ║               ║   FUSION BEAM                                                    │   │ ║
║  │  │  ║   ≋≋≋≋≋≋≋≋    ║   ═════════════════════════════════════════════════════════    │   │ ║
║  │  │  ║   [BEAM IMG]  ║   Type: Beam Weapon (Ship-mounted)                              │   │ ║
║  │  │  ║   ≋≋≋≋≋≋≋≋    ║   Tier: 3                                                       │   │ ║
║  │  │  ║               ║   Base Size: 15 space                                           │   │ ║
║  │  │  ╚═══════════════╝   Base Cost: 12 BC                                              │   │ ║
║  │  │                                                                                     │   │ ║
║  │  │  Description:                                                                       │   │ ║
║  │  │  A high-energy beam weapon that uses controlled fusion reaction to                 │   │ ║
║  │  │  project concentrated plasma at enemy targets. Improved damage and                 │   │ ║
║  │  │  accuracy over previous laser technologies.                                        │   │ ║
║  │  │                                                                                     │   │ ║
║  │  │  Stats:                                                                             │   │ ║
║  │  │    • Damage: 4-16 (average 10)                                                     │   │ ║
║  │  │    • Range: 7 (Medium)                                                              │   │ ║
║  │  │    • Shield Penetration: None                                                       │   │ ║
║  │  │    • Special: None                                                                  │   │ ║
║  │  │                                                                                     │   │ ║
║  │  └─────────────────────────────────────────────────────────────────────────────────────┘   │ ║
║  │                                                                                              │ ║
║  │  Research Progress: 340 / 500 RP (68%)                                                      │ ║
║  │  [████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░] 68%                         │ ║
║  │                                                                                              │ ║
║  │  Current Allocation: 38 RP/turn                                                             │ ║
║  │  Estimated Completion: Turn 19 (4 turns remaining)                                          │ ║
║  │                                                                                              │ ║
║  │  [CHANGE RESEARCH]                                            [VIEW TECH TREE]              │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  ⚔️ WEAPONS selected - Drag slider to adjust allocation                       [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Technology Choice Dialog

When a technology is completed or when clicking [CHANGE RESEARCH]:

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  ⚔️ WEAPONS - SELECT NEW RESEARCH                                                   [×]     │ ║
║  │  ═══════════════════════════════════════════════════════════════════════════════════════════ │ ║
║  │                                                                                              │ ║
║  │  Current Tier: 3 → Researching: Tier 4                                                      │ ║
║  │  Choose your next research project in the Weapons field:                                    │ ║
║  │                                                                                              │ ║
║  │  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │ ║
║  │  │                            AVAILABLE TECHNOLOGIES                                     │   │ ║
║  │  └──────────────────────────────────────────────────────────────────────────────────────┘   │ ║
║  │                                                                                              │ ║
║  │  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐        │ ║
║  │  │ HEAVY FUSION BEAM      │  │ ANTI-MATTER TORPEDOES  │  │ GRAVITON BEAM          │        │ ║
║  │  │ ════════════════════   │  │ ════════════════════   │  │ ════════════════════   │        │ ║
║  │  │ Tier: 4                │  │ Tier: 4                │  │ Tier: 4                │        │ ║
║  │  │                        │  │                        │  │                        │        │ ║
║  │  │ ┌──────────────────┐   │  │ ┌──────────────────┐   │  │ ┌──────────────────┐   │        │ ║
║  │  │ │   ≋≋≋≋≋≋≋≋       │   │  │ │   ● ● ●          │   │  │ │   ╔═══╗          │   │        │ ║
║  │  │ │  [HEAVY BEAM]    │   │  │ │  [TORPEDOES]     │   │  │ │  [GRAVITON]      │   │        │ ║
║  │  │ │   ≋≋≋≋≋≋≋≋       │   │  │ │   ● ● ●          │   │  │ │   ╚═══╝          │   │        │ ║
║  │  │ └──────────────────┘   │  │ └──────────────────┘   │  │ └──────────────────┘   │        │ ║
║  │  │                        │  │                        │  │                        │        │ ║
║  │  │ Type: Beam Weapon      │  │ Type: Torpedo          │  │ Type: Special Beam     │        │ ║
║  │  │ Damage: 6-30           │  │ Damage: 15-25          │  │ Damage: 3-15           │        │ ║
║  │  │ Range: 8               │  │ Range: 12 (Homing)     │  │ Range: 5               │        │ ║
║  │  │ Size: 25 space         │  │ Size: 30 space         │  │ Size: 20 space         │        │ ║
║  │  │                        │  │                        │  │                        │        │ ║
║  │  │ Special: None          │  │ Special: Self-guided   │  │ Special: Halves enemy  │        │ ║
║  │  │                        │  │ Can be shot down       │  │ combat speed           │        │ ║
║  │  │                        │  │                        │  │                        │        │ ║
║  │  │ Research Cost: 800 RP  │  │ Research Cost: 1,000 RP│  │ Research Cost: 1,200 RP│        │ ║
║  │  │ @ 38 RP/turn: 21 turns │  │ @ 38 RP/turn: 27 turns │  │ @ 38 RP/turn: 32 turns │        │ ║
║  │  │                        │  │                        │  │                        │        │ ║
║  │  │ [SELECT] ◀─────────────│  │ [SELECT]               │  │ [SELECT]               │        │ ║
║  │  └────────────────────────┘  └────────────────────────┘  └────────────────────────┘        │ ║
║  │                                                                                              │ ║
║  │  ⚠️ Not all technologies are available in every game. Make your choice wisely!             │ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │  Already Researched in Weapons:                                                             │ ║
║  │    Tier 1: Hand Laser, Nuclear Bomb        Tier 2: Laser Cannon, Nuclear Missiles          │ ║
║  │    Tier 3: Fusion Beam (current)                                                            │ ║
║  │                                                                                              │ ║
║  │                                        [CANCEL - KEEP CURRENT]                              │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Select a new Weapons technology to research. This choice cannot be changed once made.         ║
║                                                                               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Full Tech Tree View

When clicking [VIEW TECH TREE]:

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  ⚔️ WEAPONS - TECHNOLOGY TREE                                               [BACK] [?] Help    ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Tech Tree Visualization────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Tier 1          Tier 2          Tier 3          Tier 4          Tier 5          Tier 6     │ ║
║  │  ──────          ──────          ──────          ──────          ──────          ──────     │ ║
║  │                                                                                              │ ║
║  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐│ ║
║  │  │✓ Hand    │    │✓ Laser   │    │⚡Fusion  │    │? Heavy   │    │? Plasma  │    │? Disrup│││ ║
║  │  │  Laser   │───→│  Cannon  │───→│  Beam    │───→│  Fusion  │───→│  Cannon  │───→│  tor   │││ ║
║  │  │ (Beam)   │    │ (Beam)   │    │ (Beam)   │    │ (Beam)   │    │ (Beam)   │    │(Beam)  │││ ║
║  │  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └────────┘│ ║
║  │                                                                                              │ ║
║  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐│ ║
║  │  │✓ Nuclear │    │✓ Nuclear │    │○ Merculite│   │? Anti-   │    │? Pulson  │    │? Stell │││ ║
║  │  │  Bomb    │───→│  Missiles│───→│  Missiles│───→│  Matter  │───→│  Missiles│───→│  -arite│││ ║
║  │  │ (Bomb)   │    │ (Missile)│    │ (Missile)│    │ (Torpedo)│    │ (Missile)│    │(Bomb)  │││ ║
║  │  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └────────┘│ ║
║  │                                                                                              │ ║
║  │                                  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐│ ║
║  │                                  │○ Scatter │    │? Graviton│    │? Auto-   │    │? Mauler│││ ║
║  │                            ───→│  Pack V  │───→│  Beam    │───→│  Blaster │───→│  Device│││ ║
║  │                                  │(Special) │    │ (Beam)   │    │ (Beam)   │    │(Beam)  │││ ║
║  │                                  └──────────┘    └──────────┘    └──────────┘    └────────┘│ ║
║  │                                                                                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │ ║
║  │                                                                                              │ ║
║  │  LEGEND:                                                                                     │ ║
║  │   ✓ Researched    ⚡ In Progress    ○ Available (Not Selected)    ? Unknown (Not Available) │ ║
║  │   🔒 Locked (Need Previous Tier)   ✕ Missed (Chose Different Tech)                          │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Selected Tech Info─────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Hover over any technology to see details. Click researched techs for miniaturization info.│ ║
║  │                                                                                              │ ║
║  │  Your Weapons Progress:  Tier 3 of 10                                                       │ ║
║  │  Techs Researched:       5 / 18 possible                                                    │ ║
║  │  Available This Game:    14 techs (random selection)                                        │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  View the tech tree progression. Use ← → to scroll through higher tiers.       [END TURN ⏎]    ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Research Complete Notification

Pop-up when a technology completes:

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                   ║
║         ┌──────────────────────────────────────────────────────────────────────────────┐         ║
║         │                                                                              │         ║
║         │                    🎉 RESEARCH BREAKTHROUGH! 🎉                              │         ║
║         │                                                                              │         ║
║         │  ══════════════════════════════════════════════════════════════════════════  │         ║
║         │                                                                              │         ║
║         │                          ⚔️ WEAPONS - TIER 3                                 │         ║
║         │                                                                              │         ║
║         │          ┌────────────────────────────────────────────────┐                  │         ║
║         │          │                                                │                  │         ║
║         │          │     ╔═══════════════════════════════════╗      │                  │         ║
║         │          │     ║                                   ║      │                  │         ║
║         │          │     ║         ≋≋≋≋≋≋≋≋≋≋≋≋≋≋           ║      │                  │         ║
║         │          │     ║         [FUSION BEAM]             ║      │                  │         ║
║         │          │     ║         ≋≋≋≋≋≋≋≋≋≋≋≋≋≋           ║      │                  │         ║
║         │          │     ║                                   ║      │                  │         ║
║         │          │     ╚═══════════════════════════════════╝      │                  │         ║
║         │          │                                                │                  │         ║
║         │          │         F U S I O N   B E A M                  │                  │         ║
║         │          │         ══════════════════════                 │                  │         ║
║         │          │                                                │                  │         ║
║         │          │  "A weapon harnessing the raw power of         │                  │         ║
║         │          │   fusion, concentrating stellar plasma         │                  │         ║
║         │          │   into a devastating beam."                    │                  │         ║
║         │          │                                                │                  │         ║
║         │          │  • Damage: 4-16 (average 10)                   │                  │         ║
║         │          │  • Range: 7 (Medium)                           │                  │         ║
║         │          │  • Now available in Ship Design                │                  │         ║
║         │          │                                                │                  │         ║
║         │          └────────────────────────────────────────────────┘                  │         ║
║         │                                                                              │         ║
║         │  Miniaturization Bonus:                                                      │         ║
║         │    • Hand Laser now 25% smaller/cheaper                                      │         ║
║         │    • Laser Cannon now 10% smaller/cheaper                                    │         ║
║         │                                                                              │         ║
║         │  ══════════════════════════════════════════════════════════════════════════  │         ║
║         │                                                                              │         ║
║         │               [SELECT NEXT RESEARCH]     [DISMISS]                           │         ║
║         │                                                                              │         ║
║         └──────────────────────────────────────────────────────────────────────────────┘         ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Research Allocation Panel - Detailed Specification

### Individual Field Row Layout

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    │
│  ⚔️  WEAPONS      [🔓]  [░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]  30%  │  38 RP →  Fusion Beam           │
│  │                 │    │              Allocation Slider    │  │  │                                │
│  │                 │    │                                   │  │  │                                │
│  Icon        Lock Btn   │                                   │  │  └── Current Tech Name            │
│  + Label                │                                   │  │                                   │
│                         │                                   │  └──── RP Being Applied             │
│                         │                                   │                                      │
│                         │                                   └──────── Percentage Display           │
│                         │                                                                          │
│                         └────────────────────────────────────────── Drag Handle Position           │
│                                                                                                    │
│                         [████████████████████░░░░░░░░░░] 68%   │  ETA: 4 turns                     │
│                         │       Progress Bar             │     │                                   │
│                         │                                │     └── Estimated Time to Complete      │
│                         │                                │                                         │
│                         └── Research Progress (current/total)                                      │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### The Six Technology Fields

| Field | Icon | Color | Focus |
|-------|------|-------|-------|
| Weapons | ⚔️ | Red `#ef5350` | Beam, missile, bomb systems |
| Propulsion | 🚀 | Orange `#ffa726` | Engines, speed, range |
| Construction | 🔧 | Yellow `#ffee58` | Armor, factories, building |
| Computers | 💻 | Blue `#42a5f5` | Targeting, ECM, espionage |
| Force Fields | 🛡️ | Purple `#ab47bc` | Shields, barriers, defense |
| Planetology | 🌿 | Green `#66bb6a` | Terraforming, ecology, growth |

### Allocation Slider Mechanics

**Slider Rules (MOO1 Faithful):**
1. All six sliders must sum to exactly 100%
2. Locked sliders cannot be adjusted
3. When one slider increases, unlocked sliders decrease proportionally
4. Minimum allocation per slider: 0%
5. Maximum allocation per slider: 100% (if all others are 0% or locked)

**Slider States:**

| State | Visual | Behavior |
|-------|--------|----------|
| Unlocked (Normal) | `[🔓]` + draggable | Can be adjusted by user |
| Locked | `[🔒]` + solid fill | Cannot be changed; maintains percentage |
| Selected | Highlighted border | Details panel shows this field |
| No Research | Grayed out | Field has no active research target |
| Completed | Checkmark badge | All techs in field researched |

### Slider Interaction

**Dragging a Slider:**
```
Before: WEAPONS: 30%, PROPULSION: 20%, CONSTRUCTION: 15%, COMPUTERS: 10%, FORCE_FIELDS: 10%, PLANETOLOGY: 15%
Action: Drag WEAPONS slider from 30% to 45%
Delta: +15%

Rebalance unlocked sliders:
  - PROPULSION: 20% → 17% (-3%)
  - CONSTRUCTION: 15% → 13% (-2%)
  - COMPUTERS: 10% → 9% (-1%)
  - FORCE_FIELDS: 10% → 9% (-1%)
  - PLANETOLOGY: 15% → 7% (-8%) [absorbs remainder]

After: WEAPONS: 45%, PROPULSION: 17%, CONSTRUCTION: 13%, COMPUTERS: 9%, FORCE_FIELDS: 9%, PLANETOLOGY: 7%
```

**Lock Example:**
```
Before: WEAPONS: 30% [LOCKED], others unlocked
Action: Try to drag WEAPONS
Result: No change (locked sliders ignore drag)

Action: Drag PROPULSION from 20% to 35%
Result: Other unlocked sliders absorb the +15%
        WEAPONS stays at 30% (locked)
```

---

## Research Progress Display

### Progress Bar States

| State | Visual | Description |
|-------|--------|-------------|
| Early Progress | `[██░░░░░░░░]` 20% | Just started |
| Mid Progress | `[█████░░░░░]` 50% | Halfway |
| Near Complete | `[████████░░]` 80% | Almost done |
| Complete | `[██████████]` ✓ | Tech completed |
| No Research | `[──────────]` | No tech selected |
| Stalled | `[███░░░░░░░]` ⚠️ | 0% allocation |

### ETA Calculation Display

```
ETA Formula:
  Remaining_RP = Tech_Cost - Current_Progress
  Turns_Remaining = CEILING(Remaining_RP / RP_Per_Turn)

If RP_Per_Turn == 0:
  Display "∞" or "Stalled"
```

**ETA Examples:**
- "ETA: 4 turns" (normal)
- "ETA: < 1 turn" (will complete next turn)
- "ETA: ∞" (0% allocation - stalled)
- "Complete!" (100% progress)

---

## Technology Details Panel

### Standard Tech Display

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│  ⚔️ WEAPONS - FUSION BEAM                                                               │
│  ═══════════════════════════════════════════════════════════════════════════════════════│
│                                                                                          │
│  ┌────────────────┐   Type: Beam Weapon (Ship-mounted)                                  │
│  │                │   Tier: 3 of 10                                                     │
│  │   ≋≋≋≋≋≋≋≋     │   Category: Energy Weapons                                         │
│  │   [TECH IMG]   │                                                                     │
│  │   ≋≋≋≋≋≋≋≋     │   Base Size: 15 space                                              │
│  │                │   Base Cost: 12 BC                                                  │
│  └────────────────┘                                                                      │
│                                                                                          │
│  ─────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                          │
│  Description:                                                                            │
│  A high-energy beam weapon that uses controlled fusion reaction to project concentrated │
│  plasma at enemy targets. Improved damage and accuracy over previous laser technologies.│
│                                                                                          │
│  ─────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                          │
│  STATS:                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Damage:            4-16 (average 10)                                              │  │
│  │  Range:             7 (Medium)                                                     │  │
│  │  Accuracy Modifier: +0%                                                            │  │
│  │  Shield Penetration: None                                                          │  │
│  │  Special Effects:   None                                                           │  │
│  │  Fires Per Turn:    1                                                              │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│  ─────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                          │
│  RESEARCH PROGRESS:                                                                      │
│  Cost: 500 RP │ Progress: 340 RP (68%)                                                  │
│  [████████████████████████████████████░░░░░░░░░░░░░░░░] 68%                             │
│                                                                                          │
│  Allocation: 30% (38 RP/turn) │ ETA: 4 turns (Turn 19)                                  │
│                                                                                          │
│  [CHANGE RESEARCH]  [VIEW TECH TREE]  [COMPARE TO CURRENT WEAPONS]                      │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Miniaturization Display (for researched techs)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│  ⚔️ WEAPONS - HAND LASER (Researched)                                                   │
│  ═══════════════════════════════════════════════════════════════════════════════════════│
│                                                                                          │
│  ✓ RESEARCHED - Tier 1                                                                  │
│                                                                                          │
│  MINIATURIZATION STATUS:                                                                │
│  ─────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                          │
│  Your Current Weapons Tier: 3                                                           │
│  Hand Laser Tier: 1                                                                     │
│  Tier Difference: 2 tiers                                                               │
│                                                                                          │
│  Miniaturization Bonus: 10% (2 tiers × 5% per tier)                                     │
│                                                                                          │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Stat           │ Original │ Miniaturized │ Savings                               │  │
│  ├───────────────────────────────────────────────────────────────────────────────────┤  │
│  │  Size           │ 10 space │ 9 space      │ -1 space (10%)                        │  │
│  │  Cost           │ 5 BC     │ 4.5 BC       │ -0.5 BC (10%)                         │  │
│  │  Damage         │ 1-4      │ 1-4          │ (unchanged)                           │  │
│  │  Range          │ 3        │ 3            │ (unchanged)                           │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│  Future Miniaturization:                                                                │
│    • At Weapons Tier 5: 20% smaller/cheaper                                             │
│    • At Weapons Tier 10: 45% smaller/cheaper                                            │
│    • Maximum reduction: 80% (at Tier 17+)                                               │
│                                                                                          │
│  [VIEW IN SHIP DESIGNER]                                                                │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Field-Specific Details Panels

### Weapons Field

```
Current Research:  [Tech Name]
Unlocks:          [Ship weapons, bombs, missiles]
Key Techs:        Fusion Beam, Plasma Cannon, Stellar Converter
Miniaturizes:     Beam weapons, Missiles, Bombs (size + cost)
```

### Propulsion Field

```
Current Research:  [Tech Name]
Unlocks:          [Engines, fuel tanks, maneuverability]
Key Techs:        Ion Drive, Warp Drive, Hyperspace Tech
Miniaturizes:     Engines, Fuel Tanks (size only)
Note:             Determines fleet speed and range
```

### Construction Field

```
Current Research:  [Tech Name]
Unlocks:          [Armor, factory improvements, ship hulls]
Key Techs:        Duralloy Armor, Robotic Controls, Industrial Tech
Miniaturizes:     Armor (slight size reduction)
Note:             Determines factory output and ship durability
```

### Computers Field

```
Current Research:  [Tech Name]
Unlocks:          [Battle computers, ECM, scanners, spy tech]
Key Techs:        Battle Computer III, ECM Jammer, Deep Space Scanner
Miniaturizes:     Battle Computers, ECM (size + cost)
Note:             Determines accuracy and espionage capability
```

### Force Fields Field

```
Current Research:  [Tech Name]
Unlocks:          [Shields, planetary shields, special defenses]
Key Techs:        Class III Shield, Planetary Shield, Repulsor Beam
Miniaturizes:     Ship shields, Specials (size + cost)
Note:             Primary defensive technology
```

### Planetology Field

```
Current Research:  [Tech Name]
Unlocks:          [Terraforming, environmental tech, bio weapons]
Key Techs:        Soil Enrichment, Atmospheric Terraformer, Death Spores
Miniaturizes:     N/A (does not miniaturize)
Note:             Increases population capacity and ecological efficiency
```

---

## Special UI States

### No Research Selected

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│  ⚔️ WEAPONS - NO RESEARCH SELECTED                                                      │
│  ═══════════════════════════════════════════════════════════════════════════════════════│
│                                                                                          │
│  ⚠️ No technology is currently being researched in this field!                          │
│                                                                                          │
│  RP allocated to this field (38 RP/turn) is being wasted.                               │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │                     [SELECT RESEARCH NOW]                                        │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│  Alternatively, set this field's allocation to 0% to redirect RP elsewhere.            │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### All Techs Researched in Field

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│  ⚔️ WEAPONS - FULLY RESEARCHED ✓                                                        │
│  ═══════════════════════════════════════════════════════════════════════════════════════│
│                                                                                          │
│  🏆 Congratulations! You have researched all available Weapons technologies!            │
│                                                                                          │
│  Total Techs Researched: 14 / 14                                                        │
│  Highest Tier Achieved: 10 (Maximum)                                                    │
│                                                                                          │
│  RP allocated to this field will now be converted to "Reserve Research":                │
│    • Reserve RP accumulates for future discoveries                                      │
│    • Can be converted to BC at 50% efficiency                                           │
│    • May unlock special late-game technologies                                          │
│                                                                                          │
│  Current Reserve: 0 RP                                                                  │
│  Allocation: 30% (38 RP/turn → Reserve)                                                │
│                                                                                          │
│  [CONVERT RESERVE TO BC]  [REDISTRIBUTE ALLOCATION]                                     │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Research Stalled (0% Allocation)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│  ⚔️ WEAPONS - RESEARCH STALLED ⚠️                                                       │
│  ═══════════════════════════════════════════════════════════════════════════════════════│
│                                                                                          │
│  Current Research: Fusion Beam                                                          │
│  Progress: 340 / 500 RP (68%)                                                           │
│                                                                                          │
│  ⚠️ WARNING: 0% allocation - No progress is being made!                                 │
│                                                                                          │
│  Research has been stalled for: 3 turns                                                 │
│  Time to completion at 0%: ∞ (never)                                                    │
│                                                                                          │
│  To resume research, increase the Weapons allocation slider above 0%.                   │
│                                                                                          │
│  [ALLOCATE 10%]  [ALLOCATE 25%]  [CANCEL RESEARCH]                                      │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Research Report Screen

When clicking [📊 RESEARCH REPORT]:

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  EMPIRE RESEARCH REPORT                                                          [?] Help        ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Research Infrastructure──────────────────────────────────────────────────────────────────┐   ║
║  │                                                                                            │   ║
║  │  Total Scientists:     45M (across 5 planets)                                              │   ║
║  │  Population Researching: 18% of total population                                           │   ║
║  │                                                                                            │   ║
║  │  Research Buildings:                                                                       │   ║
║  │    • Research Labs: 3 planets (+50% each)                                                  │   ║
║  │    • Supercomputers: 1 planet (+100% each)                                                 │   ║
║  │    • Autolabs: 0 planets                                                                   │   ║
║  │    • Galactic Cybernet: 0 planets                                                          │   ║
║  │                                                                                            │   ║
║  │  Racial Research Modifier: 1.0× (Hamster baseline)                                         │   ║
║  │                                                                                            │   ║
║  │  ────────────────────────────────────────────────────────────────────────────────────────  │   ║
║  │                                                                                            │   ║
║  │  RP GENERATION BY PLANET:                                                                  │   ║
║  │  ┌─────────────────────────────────────────────────────────────────────────────────────┐  │   ║
║  │  │ Planet           │ Scientists │ Buildings        │ Bonus    │ RP/Turn            │  │   ║
║  │  ├─────────────────────────────────────────────────────────────────────────────────────┤  │   ║
║  │  │ New Hamsterton   │ 15M        │ Lab + Supercomp  │ Artifact │ 56 RP              │  │   ║
║  │  │ Alpha Prime      │ 12M        │ Research Lab     │ -        │ 18 RP              │  │   ║
║  │  │ Sirius III       │ 8M         │ Research Lab     │ -        │ 12 RP              │  │   ║
║  │  │ Jungle Paradise  │ 6M         │ Research Lab     │ -        │ 9 RP               │  │   ║
║  │  │ Desert Outpost   │ 4M         │ None             │ -        │ 4 RP               │  │   ║
║  │  ├─────────────────────────────────────────────────────────────────────────────────────┤  │   ║
║  │  │ EMPIRE TOTAL     │ 45M        │                  │          │ 99 RP              │  │   ║
║  │  │ Research Treaties│            │                  │          │ +26 RP (from Rats) │  │   ║
║  │  │ TOTAL RP/TURN    │            │                  │          │ 125 RP             │  │   ║
║  │  └─────────────────────────────────────────────────────────────────────────────────────┘  │   ║
║  │                                                                                            │   ║
║  └────────────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                                   ║
║  ┌──Research Progress by Field────────────────────────────────────────────────────────────────┐  ║
║  │                                                                                             │  ║
║  │  Field       │ Tier │ Researched │ In Progress        │ ETA   │ Alloc │ RP/Turn           │  ║
║  │  ────────────────────────────────────────────────────────────────────────────────────────  │  ║
║  │  ⚔️ Weapons   │  3   │ 5 techs    │ Fusion Beam (68%)  │ 4 trn │ 30%   │ 38 RP             │  ║
║  │  🚀 Propulsion│  2   │ 3 techs    │ Ion Drive (54%)    │ 6 trn │ 20%   │ 25 RP             │  ║
║  │  🔧 Construct │  2   │ 4 techs    │ Duralloy (42%)     │ 9 trn │ 15%   │ 19 RP             │  ║
║  │  💻 Computers │  3   │ 4 techs    │ Battle Comp III    │ 8 trn │ 10%   │ 13 RP             │  ║
║  │  🛡️ Force Fld │  2   │ 3 techs    │ Class III Shield   │15 trn │ 10%   │ 13 RP             │  ║
║  │  🌿 Planetology│ 3   │ 5 techs    │ Soil Enrichment    │ 3 trn │ 15%   │ 19 RP             │  ║
║  │  ────────────────────────────────────────────────────────────────────────────────────────  │  ║
║  │  TOTALS      │ Avg:2.5│ 24 techs  │                    │       │ 100%  │ 125 RP            │  ║
║  │                                                                                             │  ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
║  ┌──Comparison to Other Empires (Known)──────────────────────────────────────────────────────┐   ║
║  │                                                                                            │   ║
║  │  Empire      │ Est. Tech Level │ Est. RP/Turn │ Known Advantages                         │   ║
║  │  ──────────────────────────────────────────────────────────────────────────────────────── │   ║
║  │  🐀 Rats     │ High (+2 tiers) │ ~200 RP      │ Research Treaty Partner                  │   ║
║  │  🐹 Hamsters │ Average (You)   │ 125 RP       │ -                                        │   ║
║  │  🐰 Rabbits  │ Low (-1 tier)   │ ~80 RP       │ Planetology focus                        │   ║
║  │  🐹 Guinea P │ Low (-2 tiers)  │ ~60 RP       │ Weapons focus                            │   ║
║  │                                                                                            │   ║
║  │  Note: Estimates based on spy reports and diplomatic intel. May not be accurate.         │   ║
║  │                                                                                            │   ║
║  └────────────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                                   ║
║  [BACK TO RESEARCH]  [OPTIMIZE ALLOCATIONS]                                  [END TURN ⏎]        ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Interactive Elements Specification

### Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| F4 | Open Research Screen | Any screen |
| 1-6 | Select field (1=Weapons...6=Planetology) | Research screen |
| ↑/↓ | Navigate fields | Field list |
| ←/→ | Adjust selected slider ±5% | Field selected |
| Shift+←/→ | Adjust selected slider ±1% | Field selected |
| L | Toggle lock on selected field | Field selected |
| Shift+L | Lock all fields | Research screen |
| C | Change research (open selection) | Field selected |
| T | View tech tree | Field selected |
| R | Open research report | Research screen |
| E | Equalize all sliders | Research screen |
| Enter | Select tech / Confirm | Dialogs |
| Escape | Close dialog / Deselect | Any |

### Mouse Interactions

| Action | Target | Result |
|--------|--------|--------|
| Click | Field row | Select field, show details |
| Drag | Allocation slider | Adjust percentage |
| Shift+Click | Slider | Set to specific % (opens input) |
| Double-click | Slider | Set to 100% (others to 0%) |
| Click | Lock button | Toggle lock state |
| Click | Progress bar | Open detailed progress tooltip |
| Click | Tech name | View tech details |
| Right-click | Field row | Context menu |
| Hover | Any element | Show tooltip |

### Context Menu (Right-Click Field)

```
┌────────────────────────────────┐
│ ⚔️ WEAPONS                     │
├────────────────────────────────┤
│ 🔄 Change Research        [C]  │
│ 📊 View Tech Tree         [T]  │
│ ───────────────────────────── │
│ Set Allocation:                │
│   ○  0%                        │
│   ○ 10%                        │
│   ○ 25%                        │
│   ● 30% (current)              │
│   ○ 50%                        │
│   ○ 100%                       │
│ ───────────────────────────── │
│ 🔒 Lock This Field        [L]  │
│ 🔒 Lock All Others             │
└────────────────────────────────┘
```

---

## Tooltips

### Field Tooltip (Hover on Field Row)

```
┌─────────────────────────────────────────────────┐
│ ⚔️ WEAPONS                                      │
│ ═══════════════════════════════════════════════│
│                                                 │
│ Offensive technologies for ship and ground     │
│ combat including beam weapons, missiles, and   │
│ bombs.                                          │
│                                                 │
│ Current Tier:      3 of 10                      │
│ Techs Researched:  5                            │
│ ─────────────────────────────────────────────── │
│ Current Research:  Fusion Beam                  │
│ Progress:          68% (340/500 RP)             │
│ Allocation:        30% (38 RP/turn)             │
│ ETA:               4 turns                      │
│ ─────────────────────────────────────────────── │
│ Click to select • Drag slider to adjust         │
│ Right-click for more options                    │
└─────────────────────────────────────────────────┘
```

### Progress Bar Tooltip

```
┌─────────────────────────────────────────────────┐
│ FUSION BEAM - Research Progress                 │
│ ═══════════════════════════════════════════════│
│                                                 │
│ Research Points:                                │
│   Current: 340 RP                               │
│   Required: 500 RP                              │
│   Remaining: 160 RP                             │
│                                                 │
│ Progress: 68%                                   │
│ [████████████████████████░░░░░░░░░░]            │
│                                                 │
│ At current rate (38 RP/turn):                   │
│   Completion: Turn 19 (4 turns)                 │
│                                                 │
│ If allocation doubled (76 RP/turn):             │
│   Completion: Turn 17 (2 turns)                 │
│                                                 │
│ If allocation halved (19 RP/turn):              │
│   Completion: Turn 24 (9 turns)                 │
└─────────────────────────────────────────────────┘
```

### Lock Button Tooltip

```
┌─────────────────────────────────────────────────┐
│ 🔓 UNLOCK/🔒 LOCK FIELD                         │
│ ═══════════════════════════════════════════════│
│                                                 │
│ Current: Unlocked                               │
│                                                 │
│ When locked:                                    │
│ • Allocation percentage cannot be changed       │
│ • Other sliders adjust around this value        │
│ • Useful for protecting critical research       │
│                                                 │
│ Hotkey: L                                       │
└─────────────────────────────────────────────────┘
```

---

## Animation Specifications

| Element | Animation | Duration | Trigger |
|---------|-----------|----------|---------|
| Slider drag | Smooth movement | Real-time | User drag |
| Other sliders rebalance | Smooth slide | 200ms | Primary slider change |
| Progress bar update | Fill animation | 300ms | Turn end / allocation change |
| Field selection | Highlight fade-in | 150ms | Click |
| Lock/unlock | Icon flip animation | 200ms | Click |
| Tech complete popup | Scale + fade in | 400ms | Research complete |
| Tech choice cards | Stagger entrance | 100ms each | Dialog opens |
| ETA update | Number fade | 150ms | Allocation change |

---

## Color Specifications

| Element | Color | Hex |
|---------|-------|-----|
| Weapons field | Red | `#ef5350` |
| Propulsion field | Orange | `#ffa726` |
| Construction field | Yellow | `#ffee58` |
| Computers field | Blue | `#42a5f5` |
| Force Fields field | Purple | `#ab47bc` |
| Planetology field | Green | `#66bb6a` |
| Progress bar fill | Cyan | `#4fc3f7` |
| Progress bar track | Dark gray | `#37474f` |
| Locked indicator | Red | `#ef5350` |
| Complete checkmark | Green | `#81c784` |
| Warning state | Amber | `#ffa726` |
| Selection highlight | White/Gold | `#ffd54f` |

---

## Responsive Behavior

### Wide Screen (1920×1080+)
- Full layout as shown
- All six fields visible simultaneously
- Tech details panel always visible

### Medium Screen (1280×720)

```
╔══════════════════════════════════════════════════════════════════════╗
║ [≡] HAMSTER OF ORION │ Year 2623 │ 1,850 BC │ [F1][F2][F3][F4][F5]  ║
╠══════════════════════════════════════════════════════════════════════╣
║  TECHNOLOGY RESEARCH                    Total: 125 RP/turn          ║
║  ═══════════════════════════════════════════════════════════════════║
║                                                                      ║
║  ⚔️ WEAPONS   [🔓] [░░░░▓▓▓▓▓▓] 30% │ 38 RP → Fusion Beam [68%]    ║
║  🚀 PROPULSION[🔓] [░░░░░▓▓▓▓░] 20% │ 25 RP → Ion Drive [54%]      ║
║  🔧 CONSTRUCT [🔓] [░░░░░░▓▓▓░] 15% │ 19 RP → Duralloy [42%]       ║
║  💻 COMPUTERS [🔓] [░░░░░░░▓▓░] 10% │ 13 RP → Battle Comp [48%]    ║
║  🛡️ FORCE FLD [🔓] [░░░░░░░▓▓░] 10% │ 13 RP → Shield III [23%]     ║
║  🌿 PLANETLGY [🔓] [░░░░░░░▓▓░] 15% │ 19 RP → Soil Enrich [71%]    ║
║  ───────────────────────────────────────────────────────────────────║
║  [🔄 EQUALIZE]  [🔒 LOCK ALL]  [📊 REPORT]                          ║
║                                                                      ║
║  ┌─Selected: ⚔️ WEAPONS──────────────────────────────────────────┐  ║
║  │ Fusion Beam │ Tier 3 │ Damage 4-16 │ 68% │ ETA 4 turns        │  ║
║  │ [CHANGE]  [TECH TREE]                                          │  ║
║  └────────────────────────────────────────────────────────────────┘  ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  [!] Soil Enrichment: 3 turns remaining                [END TURN]   ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Small Screen / Mobile (Below 1024)

```
╔═══════════════════════════════════════╗
║  RESEARCH        125 RP/turn          ║
╠═══════════════════════════════════════╣
║                                       ║
║  ⚔️ 30% [████▓░░░] Fusion Beam        ║
║       68% complete │ 4 turns          ║
║                                       ║
║  🚀 20% [███▓░░░░] Ion Drive          ║
║       54% complete │ 6 turns          ║
║                                       ║
║  🔧 15% [██▓░░░░░] Duralloy           ║
║       42% complete │ 9 turns          ║
║                                       ║
║  💻 10% [██▓░░░░░] Battle Comp III    ║
║       48% complete │ 8 turns          ║
║                                       ║
║  🛡️ 10% [█▓░░░░░░] Shield III         ║
║       23% complete │ 15 turns         ║
║                                       ║
║  🌿 15% [███▓░░░░] Soil Enrichment    ║
║       71% complete │ 3 turns          ║
║                                       ║
╠═══════════════════════════════════════╣
║  [Details]  [Report]    [END TURN]    ║
╚═══════════════════════════════════════╝
```

---

## Accessibility Features

| Feature | Implementation |
|---------|----------------|
| Screen Reader | All fields announced with label, percentage, tech name, and progress |
| Keyboard Navigation | Full control via keyboard (see shortcuts) |
| High Contrast | Increased border thickness, field icons remain visible |
| Color Blind | Each field has unique icon; progress uses pattern not just color |
| Focus Indicators | Clear focus rings on all interactive elements |
| ARIA Labels | Sliders have `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Tab Order | Logical flow: Fields 1-6 → Actions → Details panel |

---

## Data Structures (JSON)

### Research State

```json
{
  "research": {
    "total_rp_per_turn": 125,
    "allocation": {
      "weapons": { "percent": 30, "locked": false },
      "propulsion": { "percent": 20, "locked": false },
      "construction": { "percent": 15, "locked": false },
      "computers": { "percent": 10, "locked": false },
      "force_fields": { "percent": 10, "locked": false },
      "planetology": { "percent": 15, "locked": false }
    },
    "fields": {
      "weapons": {
        "current_tier": 3,
        "current_research": {
          "id": "fusion_beam",
          "name": "Fusion Beam",
          "tier": 3,
          "cost": 500,
          "progress": 340
        },
        "researched_techs": ["hand_laser", "nuclear_bomb", "laser_cannon", "nuclear_missiles", "fusion_beam_progress"],
        "available_next": ["heavy_fusion_beam", "anti_matter_torpedoes", "graviton_beam"]
      }
    },
    "research_buildings": {
      "research_labs": 3,
      "supercomputers": 1,
      "autolabs": 0,
      "galactic_cybernets": 0
    },
    "racial_modifier": 1.0,
    "treaty_bonus": 26,
    "artifacts_bonus": 12
  }
}
```

### Technology Definition

```json
{
  "technologies": {
    "fusion_beam": {
      "id": "fusion_beam",
      "name": "Fusion Beam",
      "field": "weapons",
      "tier": 3,
      "type": "beam_weapon",
      "research_cost": 500,
      "description": "A high-energy beam weapon that uses controlled fusion reaction to project concentrated plasma at enemy targets.",
      "stats": {
        "damage_min": 4,
        "damage_max": 16,
        "range": 7,
        "size": 15,
        "cost": 12,
        "shield_penetration": 0,
        "special": null
      },
      "unlocks": ["ship_component:fusion_beam"],
      "flavor_text": "Hamster scientists finally cracked the fusion containment problem by repurposing an ancient hamster wheel's rotational field."
    }
  }
}
```

---

## Edge Cases

### 1. All Sliders Locked

```
⚠️ ALL FIELDS LOCKED

Cannot adjust allocations - all fields are locked.
Unlock at least one field to redistribute research.

[UNLOCK ALL]
```

### 2. Insufficient Unlocked Fields for Rebalance

```
⚠️ CANNOT INCREASE ALLOCATION

Weapons is the only unlocked field.
Cannot take RP from locked fields.

Unlock another field, or reduce Weapons allocation.

[OK]
```

### 3. No Research in Progress (All Fields)

```
⚠️ NO ACTIVE RESEARCH

No technologies are being researched in any field!
All 125 RP/turn is being wasted.

Select research projects for each field:
  [⚔️ Select Weapons Tech]
  [🚀 Select Propulsion Tech]
  ...
```

### 4. Research Treaty Bonus Display

When player has research treaties:

```
┌──RP Breakdown────────────────────────────┐
│ Base RP:         99 RP                   │
│ Treaty Bonus:    +26 RP (from Rats)      │
│ Total:           125 RP/turn             │
│                                          │
│ Note: You receive 10% of Rat Empire's   │
│ research output through your treaty.     │
└──────────────────────────────────────────┘
```

### 5. Tech Already Being Researched (Prevent Duplicate)

When trying to select a tech that's already in progress:

```
⚠️ ALREADY RESEARCHING

"Fusion Beam" is already being researched (68% complete).

[CONTINUE CURRENT]  [START OVER (Lose Progress)]
```

---

## MOO1 Faithfulness Notes

This specification maintains MOO1 research mechanics:

1. **Six Independent Fields**: Each field progresses independently (MOO1 mechanic)
2. **Percentage Allocation**: Sliders sum to 100%, RP distributed proportionally (MOO1 mechanic)
3. **2-3 Random Choices**: Tech selection from random subset (MOO1 mechanic)
4. **Miniaturization**: Older techs shrink as you advance (MOO1 mechanic)
5. **Empire-Wide RP Pool**: All planets contribute to single pool (MOO1 mechanic)
6. **Research Buildings Stack**: Lab bonuses are cumulative (MOO1 mechanic)

**Enhancements over MOO1:**
- Visual progress bars (easier to see status at a glance)
- ETA calculations displayed (quality of life)
- Research report screen (consolidated information)
- Lock mechanism for sliders (convenience)
- Tooltips with detailed breakdowns (modern UX)

---

## Related Documents

- `research-formulas.md` - Detailed RP calculation formulas
- `TECH_OVERVIEW.md` - Tech tree structure overview
- `weapons.md`, `propulsion.md`, etc. - Individual field tech lists
- `planet-management.md` - Research slider on planets
- `main-screens.md` - Screen navigation overview

---

*Document Version: 1.0*  
*Created: 2026-03-22*  
*Based on: Master of Orion (1993) Technology Research Screen*  
*Task: ui-005 - Research Tree UI Wireframe*
