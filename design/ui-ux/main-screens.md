# Main Game Screens

## 1. Main Menu

### Layout
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║               HAMSTER OF ORION                             ║
║          ________________________                          ║
║         /                        \                         ║
║        |   [Majestic Hamster]     |                        ║
║         \________________________/                         ║
║                                                            ║
║              [NEW GAME]                                    ║
║              [LOAD GAME]                                   ║
║              [SETTINGS]                                    ║
║              [CREDITS]                                     ║
║              [EXIT]                                        ║
║                                                            ║
║         Version 1.0  |  © 2026                             ║
╚════════════════════════════════════════════════════════════╝
```

### New Game Setup Flow
**Step 1: Galaxy Generation**
```
┌─────────────────────────────────────────────────────┐
│ GALAXY SETUP                                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Galaxy Size:    ( ) Small   (•) Medium             │
│                 ( ) Large   ( ) Huge               │
│                                                     │
│ Galaxy Shape:   ( ) Spiral  (•) Elliptical         │
│                 ( ) Irregular                       │
│                                                     │
│ Difficulty:     Easy  [======|====] Impossible     │
│                         (Normal)                    │
│                                                     │
│ Opponents:      [  3  ] (1-9)                      │
│                                                     │
│ Random Seed:    [_________] (optional)             │
│                                                     │
│         [< Back]              [Next >]             │
└─────────────────────────────────────────────────────┘
```

**Step 2: Race Selection**
```
┌─────────────────────────────────────────────────────┐
│ CHOOSE YOUR SPECIES                                 │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │[Hamster]│  │[ Mice  ]│  │[ Rats  ]│  ←Scroll→ │
│  │ Portrait│  │ Portrait│  │ Portrait│           │
│  └─────────┘  └─────────┘  └─────────┘           │
│                                                     │
│  HAMSTERS - The Diplomatic Engineers               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━             │
│  Bonuses:                                          │
│  ✓ +30% Diplomatic Relations                       │
│  ✓ +15% Research Speed                             │
│  ✓ Start with extra Habitrail tech                │
│                                                     │
│  Best Victory: Diplomatic, Discovery               │
│  Difficulty: ★★☆☆☆ (Beginner-Friendly)           │
│                                                     │
│  "We built the tubes. We'll build the future."    │
│                                                     │
│         [< Back]         [START GAME]              │
└─────────────────────────────────────────────────────┘
```

---

## 2. Galaxy Map (F1 - Hub Screen)

### Full Layout
```
╔════════════════════════════════════════════════════════════╗
║ [≡] Year 2623 - Turn 1 | Treasury: 500 BC | [F2] [F3] [F4]║
╠════════════════════════════════════════════════════════════╣
║ ┌──Info──┐ ╔═══════════════════════════════╗  ┌─Legend──┐║
║ │Empire: │ ║                               ║  │● Home   │║
║ │Hamster │ ║        ★   *    ◉  *         ║  │◉ Colony │║
║ │        │ ║    *    ●      *      ★      ║  │* Unknown│║
║ │Planets:│ ║         *    ●   *           ║  │★ Star   │║
║ │ 3 / 100│ ║   ◉         ★         ●      ║  │━ Route  │║
║ │        │ ║      *    *      *    ★      ║  │         │║
║ │Pop:    │ ║    ★       ●            *    ║  │[+] Zoom │║
║ │ 35M    │ ║  *    *         ◉           *║  │[-] Zoom │║
║ │        │ ║       *    *        *        ║  │[⊕] Centr│║
║ │Fleet:  │ ║                               ║  └──────────┘║
║ │ 12 🚀 │ ╚═══════════════════════════════╝              ║
║ │        │                                                ║
║ │Research│  Selected: Sol System                         ║
║ │ Plasma │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━                ║
║ │Cannon  │  Star: Yellow G-Type                          ║
║ │ 45%    │  Planets: 4 (1 colonized)                     ║
║ └────────┘  Fleet: Scout Squadron (3 ships)              ║
╠════════════════════════════════════════════════════════════╣
║ Notifications: Research Complete! [View] | Enemy fleet... ║
║                                          [END TURN ⏎]     ║
╚════════════════════════════════════════════════════════════╝
```

### Map Interaction
**Click Star System**: Open system detail view
**Click Fleet Icon**: Select fleet (shows movement range)
**Right-Click**: Quick command menu
**Scroll Wheel**: Zoom in/out
**Drag**: Pan map

### System Detail Overlay
```
┌─────────────────────────────────────────────────┐
│ SOL SYSTEM                             [×]      │
├─────────────────────────────────────────────────┤
│ Star Type: Yellow G-Type                        │
│ Coordinates: Sector 12-A (Safe Zone)            │
│                                                 │
│ Planets:                                        │
│ 🌍 Sol I (Your Colony)   [MANAGE]              │
│    Pop: 15M | Production: 45 BC/turn           │
│                                                 │
│ 🌑 Sol II (Barren)       [COLONIZE]            │
│    Size: Medium | Requires: Barren Tech        │
│                                                 │
│ 🔴 Sol III (Dead)        (Uncolonizable)       │
│                                                 │
│ ⭕ Sol IV (Gas Giant)    (No surface)          │
│                                                 │
│ Fleets Present:                                 │
│ • Scout Squadron (Yours) - 3 ships             │
│                                                 │
│         [Close]    [View on Map]                │
└─────────────────────────────────────────────────┘
```

---

## 3. Planet Management (F2)

### Single Planet View
```
╔════════════════════════════════════════════════════════════╗
║ PLANET: New Hamsterton (Sol I)                   [F1 Map] ║
╠════════════════════════════════════════════════════════════╣
║ ┌─Planet─Info────┐ ┌───Production─Sliders─────────────────┐
║ │                │ │ Ship Construction:  [████░░] 40%     │
║ │  🌍            │ │    +20 BC/turn → Destroyer (80/200)  │
║ │ [Planet Img]   │ │                                       │
║ │                │ │ Defense:            [██░░░░] 20%     │
║ │ Type: Terran   │ │    +10 BC/turn → Missile Base 4/10   │
║ │ Size: Medium   │ │                                       │
║ │ Gravity: 1.0g  │ │ Industry:           [████░░] 40%     │
║ │                │ │    +20 BC/turn → Factories +2/turn   │
║ │ Population:    │ │                                       │
║ │  15 / 100 M    │ │ Ecology:            [░░░░░░] 0%      │
║ │  Growth: +5%   │ │    Cleanup: 0 waste                  │
║ │                │ │                                       │
║ │ Factories:     │ │ Research:           [░░░░░░] 0%      │
║ │  150 / 500     │ │    +0 RP/turn                        │
║ │                │ │                                       │
║ │ Waste: 5       │ │ [Lock Ratios] [Auto-Manage]          │
║ └────────────────┘ └──────────────────────────────────────┘
║                                                             ║
║ ┌───Buildings─────────────────────────────────────────────┐
║ │ ✓ Colony Base          ✓ Research Lab I                 │
║ │ ✓ Automated Factories  □ Cloning Center (Available)     │
║ │ □ Planetary Shields (Locked: Need Force Fields III)     │
║ │                        [BUILD: Cloning Center]           │
║ └──────────────────────────────────────────────────────────┘
╠════════════════════════════════════════════════════════════╣
║ [< Prev Planet]   Summary Stats    [Next Planet >] [END ⏎]║
╚════════════════════════════════════════════════════════════╝
```

### Planet List View (Alternative)
```
┌─────────────────────────────────────────────────────────┐
│ YOUR COLONIES (3)                         Sort: [Name▼] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🌍 New Hamsterton (Sol I)         [MANAGE]             │
│    Pop: 15/100M | Prod: 45BC | Factories: 150/500      │
│    Building: Destroyer (80/200 BC)                     │
│                                                         │
│ 🌳 Jungle Paradise (Alpha III)    [MANAGE]             │
│    Pop: 8/80M | Prod: 28BC | Factories: 80/400         │
│    Building: Research Lab II (25/100 BC)               │
│                                                         │
│ 🏜️ Desert Outpost (Beta II)        [MANAGE]            │
│    Pop: 5/60M | Prod: 15BC | Factories: 50/300         │
│    Building: Factories (growing economy)               │
│                                                         │
│              [Auto-Manage All] [F1: Back to Map]        │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Fleet Command (F3)

### Fleet Management Screen
```
╔════════════════════════════════════════════════════════════╗
║ FLEET COMMAND                                     [F1 Map] ║
╠════════════════════════════════════════════════════════════╣
║ ┌─Fleet──List────────┐ ┌─Selected─Fleet──────────────────┐
║ │                    │ │ Scout Squadron                   │
║ │ ● Scout Squadron   │ │ Location: Sol System             │
║ │   Sol System       │ │                                  │
║ │   3 ships          │ │ Ships:                           │
║ │                    │ │  • Scout Ship "Discovery"        │
║ │ □ Battle Group A   │ │  • Scout Ship "Explorer"         │
║ │   Alpha Centauri   │ │  • Scout Ship "Pathfinder"       │
║ │   12 ships         │ │                                  │
║ │                    │ │ Total Strength: ★☆☆☆☆           │
║ │ □ Defense Fleet    │ │ Speed: 5 parsecs/turn            │
║ │   New Hamsterton   │ │ Range: 8 parsecs                 │
║ │   5 ships          │ │                                  │
║ │                    │ │ Orders: [Move] [Split Fleet]     │
║ │ □ Invasion Force   │ │         [Merge] [Disband]        │
║ │   In Transit       │ │                                  │
║ │   8 ships          │ │ [AUTO-EXPLORE] [SET PATROL]      │
║ │                    │ │                                  │
║ │ [NEW FLEET]        │ │ Movement Range: (show on map)    │
║ └────────────────────┘ └──────────────────────────────────┘
╠════════════════════════════════════════════════════════════╣
║                                          [F1: Map] [END ⏎] ║
╚════════════════════════════════════════════════════════════╝
```

### Ship Detail View
```
┌─────────────────────────────────────────────────┐
│ SCOUT SHIP "Discovery"                 [×]      │
├─────────────────────────────────────────────────┤
│ ┌──────────┐  Class: Scout                     │
│ │          │  HP: 50/50                         │
│ │ [Ship]   │  Armor: Titanium (5 HP/space)     │
│ │  Art     │  Shields: None                     │
│ │          │                                    │
│ └──────────┘  Weapons:                          │
│               • Laser (×2) - 5 damage each      │
│                                                 │
│              Speed: 5 parsecs/turn              │
│              Range: 8 parsecs (fuel)            │
│                                                 │
│              Special:                           │
│              • Extended Fuel Tanks              │
│              • Long Range Scanners              │
│                                                 │
│              Experience: Veteran (★★☆☆☆)       │
│                                                 │
│       [RENAME] [SCRAP] [VIEW DESIGN]            │
└─────────────────────────────────────────────────┘
```

---

## 5. Research Screen (F4)

### Research Tree View
```
╔════════════════════════════════════════════════════════════╗
║ RESEARCH & DEVELOPMENT                            [F1 Map] ║
╠════════════════════════════════════════════════════════════╣
║ Current Research:                                          ║
║ ┌──────────────────────────────────────────────────────┐  ║
║ │ Plasma Cannon (Weapons - Tier 3)                     │  ║
║ │ Progress: [████████████░░░░░░] 60% (45/75 RP)       │  ║
║ │ Estimated: 3 turns at current rate (15 RP/turn)     │  ║
║ │                                                      │  ║
║ │ Effect: Unlocks Plasma Cannon weapon (20×4 damage)  │  ║
║ │ Special Bonus (Hamster): +5% miniaturization        │  ║
║ └──────────────────────────────────────────────────────┘  ║
║                                                             ║
║ Select Next Research: [Show Tree] [Show List]              ║
║                                                             ║
║ ┌─Weapons────┐ ┌─Propulsion─┐ ┌─Construction┐             ║
║ │✓ Laser     │ │✓ Nuclear   │ │✓ Titanium   │             ║
║ │✓ Gatling   │ │✓ Fusion    │ │✓ Duralloy   │             ║
║ │● Plasma ▼  │ │  Ion Drive │ │  Neutronium │             ║
║ │  Fusion    │ │  Warp 2    │ │  Factories  │             ║
║ │  Particle  │ │  Warp 3    │ │  Robot III  │             ║
║ └────────────┘ └────────────┘ └─────────────┘             ║
║                                                             ║
║ ┌─Computers──┐ ┌─Force Fields┐ ┌─Biotech───┐             ║
║ │✓ ECM I     │ │  Shield I   │ │✓ Cloning I │             ║
║ │  Battle    │ │  Shield II  │ │  Terraform │             ║
║ │  Computer  │ │  ECM Jammer │ │  +10 Pop   │             ║
║ │  Scanner   │ │  Repulsor   │ │  +20 Pop   │             ║
║ └────────────┘ └─────────────┘ └────────────┘             ║
║                                                             ║
║ ✓ = Researched | ● = Current | Available = Can research   ║
╠════════════════════════════════════════════════════════════╣
║ Total RP/turn: 15 | Next Tech: [Select] | [F1: Map] [END]║
╚════════════════════════════════════════════════════════════╝
```

### Technology Selection
```
┌─────────────────────────────────────────────────┐
│ CHOOSE NEXT RESEARCH                            │
├─────────────────────────────────────────────────┤
│ Weapons Field - Tier 3                          │
│                                                 │
│ ( ) Fusion Bomb                                 │
│     Cost: 80 RP (6 turns)                       │
│     Effect: 2-20 damage bombardment weapon      │
│     Strong vs planets, weak vs ships            │
│                                                 │
│ ( ) Particle Beam                               │
│     Cost: 100 RP (7 turns)                      │
│     Effect: 10×3 damage beam                    │
│     High accuracy, medium damage                │
│                                                 │
│ (•) Fusion Rifle (Infantry)                     │
│     Cost: 60 RP (4 turns)                       │
│     Effect: +20% ground combat                  │
│     Excellent for invasions                     │
│                                                 │
│        [CONFIRM SELECTION] [CANCEL]             │
└─────────────────────────────────────────────────┘
```

---

## 6. Ship Design Screen (F6)

### Ship Designer
```
╔════════════════════════════════════════════════════════════╗
║ SHIP DESIGN LAB                                   [F1 Map] ║
╠════════════════════════════════════════════════════════════╣
║ ┌─Design──────────┐ ┌─Components──────────────────────────┐
║ │ [Ship Outline]  │ │ Available Components:               │
║ │                 │ │                                     │
║ │   ┌─────────┐  │ │ Weapons:                            │
║ │   │ ░░░░░░░ │  │ │ • Laser (5) - 5 space, 10 dmg      │
║ │   │ ░Armor░ │  │ │ • Gatling Laser (15) - 15 sp, 20   │
║ │   │ ░░░░░░░ │  │ │ • Plasma Cannon (30) - 20×4 dmg    │
║ │   └─────────┘  │ │                                     │
║ │                 │ │ Defense:                            │
║ │ Class: Cruiser  │ │ • Titanium Armor (5 HP/space)      │
║ │ Size: 500 space │ │ • Class I Shield (10 HP)           │
║ │ Used: 285/500   │ │                                     │
║ │ Free: 215       │ │ Special:                            │
║ │                 │ │ • Battle Computer I (+10% accuracy)│
║ │ Cost: 450 BC    │ │ • ECM I (-10% enemy accuracy)      │
║ └─────────────────┘ │                                     │
║                     │ [ADD TO DESIGN] ←                   │
║ ┌─Current─Loadout─────────────────────────────────────────┐
║ │ • Plasma Cannon ×4 (120 space) - 320 total damage       │
║ │ • Battle Computer I (10 space) - +10% accuracy          │
║ │ • Class I Shield (5 space) - 10 HP shield               │
║ │ • Titanium Armor (150 space) - 750 HP armor             │
║ │ • Ion Drive (standard) - 3 parsecs/turn                 │
║ │                                            [REMOVE] →    │
║ └──────────────────────────────────────────────────────────┘
║                                                             ║
║ Stats: HP: 750+10 shield | Speed: 3 | Range: 5 parsecs    ║
║        Damage: 320 (alpha strike) | Accuracy: 80%          ║
║                                                             ║
║ Name: [Heavy Cruiser MK1_____________]                      ║
║                                                             ║
║     [SAVE DESIGN] [CANCEL] [BUILD NOW (×5)]                ║
╚════════════════════════════════════════════════════════════╝
```

---

## 7. Diplomacy Screen (F5)

### Diplomacy Overview
```
╔════════════════════════════════════════════════════════════╗
║ DIPLOMATIC RELATIONS                              [F1 Map] ║
╠════════════════════════════════════════════════════════════╣
║ ┌─Empire──List───────┐ ┌─Selected─Empire─────────────────┐
║ │                    │ │ RATS - Scientific Collective     │
║ │ ⚔️ Guinea Pigs     │ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
║ │   At War!          │ │ Leader: Dr. Whiskers             │
║ │   Relations: -85   │ │ ┌──────────┐                     │
║ │                    │ │ │          │                     │
║ │ 🤝 Rats            │ │ │ [Rat     │ Personality:        │
║ │   Allied           │ │ │ Portrait]│ Scientist           │
║ │   Relations: +75   │ │ │          │                     │
║ │                    │ │ └──────────┘                     │
║ │ 😐 Mice            │ │                                  │
║ │   Neutral          │ │ Relations: +75 (Allied)          │
║ │   Relations: +10   │ │ ████████████████░░░░ Friendly    │
║ │                    │ │                                  │
║ │ 🔒 Chameleons      │ │ Treaties:                        │
║ │   Unknown          │ │ ✓ Research Agreement             │
║ │   Relations: ???   │ │ ✓ Military Alliance              │
║ │                    │ │ ✓ Trade Agreement (+15 BC/turn)  │
║ │ [CONTACT]          │ │                                  │
║ └────────────────────┘ │ Fleet Power: ★★★☆☆ (Moderate)   │
║                        │ Technology: ★★★★★ (Superior!)   │
║                        │ Population: 28M (3 planets)      │
║                        │                                  │
║                        │ [CONTACT] [DECLARE WAR]          │
║                        │ [PROPOSE TREATY] [TRADE TECH]    │
║                        └──────────────────────────────────┘
╠════════════════════════════════════════════════════════════╣
║                                          [F1: Map] [END ⏎] ║
╚════════════════════════════════════════════════════════════╝
```

### Treaty Negotiation
```
┌─────────────────────────────────────────────────┐
│ NEGOTIATE WITH: Rats                            │
├─────────────────────────────────────────────────┤
│ Propose Treaty:                                 │
│                                                 │
│ ( ) Peace Treaty (end war)                      │
│ ( ) Non-Aggression Pact                         │
│ (•) Trade Agreement                             │
│ ( ) Research Sharing Pact                       │
│ ( ) Military Alliance                           │
│                                                 │
│ ┌─Our─Offer───────────┐ ┌─Their─Offer──────────┐
│ │ Trade Agreement     │ │ Trade Agreement      │
│ │                     │ │ +50 BC (one-time)    │
│ │ [Add Item ▼]        │ │                      │
│ │  • Technology       │ │ [Add Item ▼]         │
│ │  • Credits          │ │                      │
│ │  • System           │ │                      │
│ └─────────────────────┘ └──────────────────────┘
│                                                 │
│ AI Evaluation: 😊 Likely to Accept             │
│                                                 │
│        [PROPOSE] [CANCEL] [ADD MORE]            │
└─────────────────────────────────────────────────┘
```

---

## 8. Reports & Statistics (F7)

### Empire Status Report
```
╔════════════════════════════════════════════════════════════╗
║ EMPIRE REPORT: Year 2623 - Turn 15               [F1 Map] ║
╠════════════════════════════════════════════════════════════╣
║ ┌─Economy─────┐ ┌─Military────┐ ┌─Research────┐          ║
║ │             │ │             │ │             │          ║
║ │ Income:     │ │ Fleet:      │ │ Current:    │          ║
║ │ +125 BC/t   │ │ 45 ships    │ │ Plasma      │          ║
║ │             │ │             │ │ Cannon      │          ║
║ │ Expenses:   │ │ Strength:   │ │ 45/75 RP    │          ║
║ │ -35 BC/t    │ │ ★★★☆☆      │ │ 3 turns     │          ║
║ │             │ │             │ │             │          ║
║ │ Net: +90/t  │ │ Bases: 12   │ │ Total: 125  │          ║
║ │             │ │             │ │ Tech: 15/150│          ║
║ │ Treasury:   │ │ In Build:   │ │             │          ║
║ │ 1,850 BC    │ │ 8 ships     │ │ Fields:     │          ║
║ │             │ │             │ │ W:3 P:2 C:3 │          ║
║ └─────────────┘ └─────────────┘ │ C:2 F:2 B:3 │          ║
║                                 └─────────────┘          ║
║ ┌─Demographics─────────────────────────────────────────┐  ║
║ │ Population: 65M (3 planets)                          │  ║
║ │ Rank: 3rd of 5 empires                               │  ║
║ │ Galactic Share: 18% (need 67% for Domination)       │  ║
║ │                                                      │  ║
║ │ Growth Rate: +5% per turn                            │  ║
║ │ Morale: Happy 😊                                     │  ║
║ └──────────────────────────────────────────────────────┘  ║
║                                                             ║
║ ┌─Victory─Progress──────────────────────────────────────┐  ║
║ │ Domination:    [████░░░░░░░░░░] 18% / 67%            │  ║
║ │ Discovery:     Guardian not defeated                  │  ║
║ │ Diplomatic:    Council not formed yet                 │  ║
║ │ Survival:      4 empires remaining                    │  ║
║ │ Transcendence: ???                                    │  ║
║ └──────────────────────────────────────────────────────┘  ║
╠════════════════════════════════════════════════════════════╣
║ [Detailed Stats] [Graphs] [History] [F1: Map] [END ⏎]     ║
╚════════════════════════════════════════════════════════════╝
```

---

## 9. High Council Screen (F8)

### Council Chamber
```
╔════════════════════════════════════════════════════════════╗
║ HIGH COUNCIL VOTE - Year 2650                     [×]      ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║              "WHO SHALL LEAD THE GALAXY?"                   ║
║                                                             ║
║ ┌─Candidates────────────────────────────────────────────┐  ║
║ │                                                        │  ║
║ │ 🐹 HAMSTERS (You)            Vote Share: 32%          │  ║
║ │    Population: 135M | Support: 32% + Allied votes    │  ║
║ │                                                        │  ║
║ │ 🐭 RATS                       Vote Share: 28%          │  ║
║ │    Population: 118M | Support: 28%                    │  ║
║ │                                                        │  ║
║ │ 🐹 GUINEA PIGS                Vote Share: 25%          │  ║
║ │    Population: 105M | Support: 25%                    │  ║
║ │                                                        │  ║
║ │ 🦜 BUDGIES                    Vote Share: 15%          │  ║
║ │    Population: 63M | Support: 15%                     │  ║
║ └────────────────────────────────────────────────────────┘  ║
║                                                             ║
║ ┌─Your─Allies─(voting─for─you)─────────────────────────┐  ║
║ │ • Rats: 28% (Alliance)                                │  ║
║ │ • Budgies: 15% (Bribed with 500 BC)                  │  ║
║ │                                                        │  ║
║ │ TOTAL SUPPORT: 75% ✓                                  │  ║
║ │ REQUIRED: 67%                                          │  ║
║ └────────────────────────────────────────────────────────┘  ║
║                                                             ║
║              YOU WIN THE VOTE!                              ║
║                                                             ║
║      [ACCEPT VICTORY] [REJECT & CONTINUE WAR]              ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

---

## 10. Victory/Defeat Screens

### Victory Screen Example (Discovery)
```
╔════════════════════════════════════════════════════════════╗
║                                                             ║
║                    🏆 VICTORY 🏆                            ║
║                                                             ║
║               DISCOVERY VICTORY                             ║
║            "The Master of Orion"                            ║
║                                                             ║
║  [Majestic animation of Hamster placing paw on Cosmic     ║
║   Wheel, energy radiating outward across the galaxy]      ║
║                                                             ║
║  "The Guardian falls. The barrier dissolves. You descend   ║
║   to Orion's surface and place your paw upon the Cosmic   ║
║   Wheel. Its power flows through you, through your people, ║
║   through your civilization. The Wheel has chosen. You     ║
║   are the Master of Orion."                                ║
║                                                             ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                             ║
║  Empire: Hamster Collective                                 ║
║  Victory: Discovery (Orion Conquered)                       ║
║  Year: 2715 (Turn 142)                                      ║
║  Difficulty: Normal                                         ║
║  Score: 8,450 points                                        ║
║                                                             ║
║  Final Statistics:                                          ║
║  • Population: 285 Million                                  ║
║  • Planets: 42 / 100                                        ║
║  • Technologies: 87 / 150                                   ║
║  • Fleet Power: ★★★★★ (Supreme)                           ║
║                                                             ║
║  [HALL OF FAME] [PLAY AGAIN] [MAIN MENU]                   ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

### Defeat Screen
```
╔════════════════════════════════════════════════════════════╗
║                                                             ║
║                    💀 DEFEAT 💀                             ║
║                                                             ║
║          YOUR CIVILIZATION HAS FALLEN                       ║
║                                                             ║
║  [Animation of your homeworld being conquered]             ║
║                                                             ║
║  "Your last colony falls to the Guinea Pig war machine.    ║
║   Your species survives, scattered across the galaxy as    ║
║   refugees and servants to other empires. The Hamster      ║
║   dream of greatness dies not with a bang, but with a      ║
║   whimper of surrender."                                    ║
║                                                             ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                             ║
║  Conquered By: Guinea Pig Empire                            ║
║  Year of Defeat: 2698 (Turn 125)                           ║
║  Difficulty: Normal                                         ║
║                                                             ║
║  [TRY AGAIN] [LOAD SAVE] [MAIN MENU]                       ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

---

## Navigation Quick Reference

| Key | Screen | Primary Function |
|-----|--------|------------------|
| F1 | Galaxy Map | Hub, exploration, fleet movement |
| F2 | Planets | Production sliders, buildings |
| F3 | Fleets | Ship management, orders |
| F4 | Research | Tech tree, select research |
| F5 | Diplomacy | Treaties, relations, Council |
| F6 | Ship Design | Custom ship creation |
| F7 | Reports | Empire statistics, graphs |
| F8 | Council | High Council voting |
| Enter | End Turn | Advance to next turn |
| Esc | Menu | Save, load, settings, quit |

---

All screens designed for 1920×1080 with scalable elements. See `tactical-combat-ui.md` for battle screen details.
