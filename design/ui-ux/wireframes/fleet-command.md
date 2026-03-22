# Fleet Command UI - Detailed Wireframe Specification

## Overview

The Fleet Command screen (F3) is the central interface for managing all player fleets in Hamster of Orion. This screen provides a comprehensive view of fleet locations, compositions, destinations, movement status, rally points, and ship designs. It enables players to coordinate empire-wide military operations efficiently.

**Reference**: Master of Orion (1993) Ships/Fleet Screen  
**Hotkey**: F3  
**Target Resolution**: 1920×1080 (scalable)

---

## Screen Layout: Default View (Fleet List)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  FLEET COMMAND                                                                   [?] Help        ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Fleet List────────────────────────────────┐   ┌──Selected Fleet Details────────────────────┐ ║
║  │                                             │   │                                            │ ║
║  │  Sort: [Location▼] [Name] [Size] [Status]   │   │  No fleet selected                         │ ║
║  │  ───────────────────────────────────────── │   │                                            │ ║
║  │                                             │   │  Select a fleet from the list to view      │ ║
║  │  ▶ BATTLE GROUP ALPHA          ★★★☆☆      │   │  details and issue commands.               │ ║
║  │    📍 New Hamsterton (Orbiting)             │   │                                            │ ║
║  │    🚀 12 ships │ Speed: 4 │ Range: 12       │   │  ─────────────────────────────────────────│ ║
║  │                                             │   │                                            │ ║
║  │  ▷ SCOUT SQUADRON               ★☆☆☆☆      │   │  Empire Fleet Summary:                     │ ║
║  │    📍 Sol System (Orbiting)                 │   │                                            │ ║
║  │    🚀 3 ships │ Speed: 6 │ Range: 15        │   │    Total Ships:    32                      │ ║
║  │                                             │   │    Total Fleets:    6                      │ ║
║  │  ▷ DEFENSE FLEET                ★★☆☆☆      │   │                                            │ ║
║  │    📍 Alpha Prime (Orbiting)                │   │    Ships by Class:                         │ ║
║  │    🚀 5 ships │ Speed: 3 │ Range: 10        │   │    ├─ Scouts:        5                     │ ║
║  │                                             │   │    ├─ Fighters:     10                     │ ║
║  │  ▷ INVASION FORCE              ★★★★☆       │   │    ├─ Destroyers:    8                     │ ║
║  │    🛫 → Rigel IV (In Transit)               │   │    ├─ Cruisers:      6                     │ ║
║  │    🚀 8 ships │ ETA: 3 turns                │   │    ├─ Battlecrsrs:   2                     │ ║
║  │                                             │   │    └─ Dreadnoughts:  1                     │ ║
║  │  ▷ PATROL WING                  ★☆☆☆☆      │   │                                            │ ║
║  │    🔄 Patrol Route (Active)                 │   │    Maintenance:  -45 BC/turn               │ ║
║  │    🚀 2 ships │ Route: 3 systems            │   │                                            │ ║
║  │                                             │   │    [📊 FLEET REPORT]                       │ ║
║  │  ▷ RESERVE FORCE                ★★☆☆☆      │   │                                            │ ║
║  │    ⚓ Rally Point: Sirius                   │   │                                            │ ║
║  │    🚀 4 ships │ Awaiting orders             │   │                                            │ ║
║  │                                             │   │                                            │ ║
║  │  ─────────────────────────────────────────  │   │                                            │ ║
║  │  [+ NEW FLEET]   [🔄 REFRESH]               │   │                                            │ ║
║  │                                             │   │                                            │ ║
║  └─────────────────────────────────────────────┘   └────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Quick Actions──────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Rally Points:  [📍 Set New]  │  Ship Designs:  [✏️ View/Edit (F6)]  │  [🗺️ SHOW ON MAP]   │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Notifications: Fleet "Invasion Force" will arrive at Rigel IV in 3 turns                       ║
║                                                                               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Fleet Selected State

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  FLEET COMMAND                                                                   [?] Help        ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Fleet List────────────────────────────────┐   ┌──Selected Fleet Details────────────────────┐ ║
║  │                                             │   │                                            │ ║
║  │  Sort: [Location▼] [Name] [Size] [Status]   │   │  ▲ BATTLE GROUP ALPHA                      │ ║
║  │  ───────────────────────────────────────── │   │  ═════════════════════════════════════════ │ ║
║  │                                             │   │                                            │ ║
║  │  ▶ BATTLE GROUP ALPHA          ★★★☆☆      │   │  Status: Orbiting                          │ ║
║  │    📍 New Hamsterton (Orbiting)  [SELECTED] │   │  Location: New Hamsterton (Sol System)     │ ║
║  │    🚀 12 ships │ Speed: 4 │ Range: 12       │   │  Destination: None                         │ ║
║  │                                             │   │                                            │ ║
║  │  ▷ SCOUT SQUADRON               ★☆☆☆☆      │   │  ─────────────────────────────────────────│ ║
║  │    📍 Sol System (Orbiting)                 │   │  Fleet Statistics:                         │ ║
║  │    🚀 3 ships │ Speed: 6 │ Range: 15        │   │                                            │ ║
║  │                                             │   │    Ships: 12 total                         │ ║
║  │  ▷ DEFENSE FLEET                ★★☆☆☆      │   │    Strength: ★★★☆☆ (Good)                │ ║
║  │    📍 Alpha Prime (Orbiting)                │   │    Speed: 4 parsecs/turn                   │ ║
║  │    🚀 5 ships │ Speed: 3 │ Range: 10        │   │    Range: 12 parsecs (fuel)                │ ║
║  │                                             │   │    Maintenance: -18 BC/turn                │ ║
║  │  ▷ INVASION FORCE              ★★★★☆       │   │                                            │ ║
║  │    🛫 → Rigel IV (In Transit)               │   │  ─────────────────────────────────────────│ ║
║  │    🚀 8 ships │ ETA: 3 turns                │   │  Ship Composition:                         │ ║
║  │                                             │   │  ┌─────────────────────────────────────── │ ║
║  │  ▷ PATROL WING                  ★☆☆☆☆      │   │  │ Design Name        │ Count │ Hull     │ │ ║
║  │    🔄 Patrol Route (Active)                 │   │  ├─────────────────────────────────────── │ ║
║  │    🚀 2 ships │ Route: 3 systems            │   │  │ Cruiser "Sunflower"│   2   │ Cruiser  │ │ ║
║  │                                             │   │  │ Dest. "Whiskers"   │   6   │ Destroyer│ │ ║
║  │  ▷ RESERVE FORCE                ★★☆☆☆      │   │  │ Fighter "Pellet"   │   4   │ Fighter  │ │ ║
║  │    ⚓ Rally Point: Sirius                   │   │  └─────────────────────────────────────── │ ║
║  │    🚀 4 ships │ Awaiting orders             │   │                                            │ ║
║  │                                             │   │  [VIEW SHIP DETAILS]                       │ ║
║  │  ─────────────────────────────────────────  │   │                                            │ ║
║  │  [+ NEW FLEET]   [🔄 REFRESH]               │   │  ─────────────────────────────────────────│ ║
║  │                                             │   │  Fleet Commands:                           │ ║
║  └─────────────────────────────────────────────┘   │                                            │ ║
║                                                     │  [🎯 SET DESTINATION]  [↔️ SPLIT FLEET]   │ ║
║  ┌──Mini Map Preview──────────────────────────┐   │  [🔗 MERGE FLEETS]     [📍 SET RALLY]      │ ║
║  │  ╔═════════════════════════════════════╗   │   │  [🔄 SET PATROL]       [⛔ CANCEL ORDERS]  │ ║
║  │  ║    ·              ★                 ║   │   │                                            │ ║
║  │  ║  ·    ·    [●]         ·           ║   │   │  [✏️ RENAME FLEET]     [🗑️ DISBAND]        │ ║
║  │  ║     ●       ╲       ·      ★       ║   │   │                                            │ ║
║  │  ║   ✴    ★    ╲          ·           ║   │   └────────────────────────────────────────────┘ ║
║  │  ║              ╲──────Range─────     ║   │                                                   ║
║  │  ╚═════════════════════════════════════╝   │                                                   ║
║  │     [●] = Fleet Location  ─── = Range      │                                                   ║
║  └────────────────────────────────────────────┘                                                   ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Notifications: Fleet "Invasion Force" will arrive at Rigel IV in 3 turns                       ║
║                                                                               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Fleet In Transit State

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  FLEET COMMAND                                                                   [?] Help        ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Fleet List────────────────────────────────┐   ┌──Selected Fleet Details────────────────────┐ ║
║  │                                             │   │                                            │ ║
║  │  Sort: [Location▼] [Name] [Size] [Status]   │   │  ▲ INVASION FORCE                          │ ║
║  │  ───────────────────────────────────────── │   │  ═════════════════════════════════════════ │ ║
║  │                                             │   │                                            │ ║
║  │  ▷ BATTLE GROUP ALPHA          ★★★☆☆      │   │  Status: 🛫 IN TRANSIT                     │ ║
║  │    📍 New Hamsterton (Orbiting)             │   │  Origin: New Hamsterton                    │ ║
║  │    🚀 12 ships │ Speed: 4 │ Range: 12       │   │  Destination: Rigel IV (Enemy Territory)   │ ║
║  │                                             │   │                                            │ ║
║  │  ▷ SCOUT SQUADRON               ★☆☆☆☆      │   │  ─────────────────────────────────────────│ ║
║  │    📍 Sol System (Orbiting)                 │   │  Journey Progress:                         │ ║
║  │    🚀 3 ships │ Speed: 6 │ Range: 15        │   │                                            │ ║
║  │                                             │   │    Distance: 15 parsecs total              │ ║
║  │  ▷ DEFENSE FLEET                ★★☆☆☆      │   │    Traveled: 10 parsecs (67%)              │ ║
║  │    📍 Alpha Prime (Orbiting)                │   │    Remaining: 5 parsecs                    │ ║
║  │    🚀 5 ships │ Speed: 3 │ Range: 10        │   │                                            │ ║
║  │                                             │   │    [████████████████████░░░░░░░░░░] 67%    │ ║
║  │  ▶ INVASION FORCE              ★★★★☆       │   │                                            │ ║
║  │    🛫 → Rigel IV (In Transit)  [SELECTED]   │   │    ETA: 3 turns (at speed 4)               │ ║
║  │    🚀 8 ships │ ETA: 3 turns                │   │    Arrival: Turn 18                        │ ║
║  │                                             │   │                                            │ ║
║  │  ▷ PATROL WING                  ★☆☆☆☆      │   │  ─────────────────────────────────────────│ ║
║  │    🔄 Patrol Route (Active)                 │   │  Ship Composition:                         │ ║
║  │    🚀 2 ships │ Route: 3 systems            │   │  ┌─────────────────────────────────────── │ ║
║  │                                             │   │  │ Design Name        │ Count │ Hull     │ │ ║
║  │  ▷ RESERVE FORCE                ★★☆☆☆      │   │  ├─────────────────────────────────────── │ ║
║  │    ⚓ Rally Point: Sirius                   │   │  │ Battlecruiser "Fist"│   1   │ BattleCr │ │ ║
║  │    🚀 4 ships │ Awaiting orders             │   │  │ Cruiser "Hammer"    │   3   │ Cruiser  │ │ ║
║  │                                             │   │  │ Dest. "Striker"     │   4   │ Destroyer│ │ ║
║  │  ─────────────────────────────────────────  │   │  └─────────────────────────────────────── │ ║
║  │  [+ NEW FLEET]   [🔄 REFRESH]               │   │                                            │ ║
║  │                                             │   │  [VIEW SHIP DETAILS]                       │ ║
║  └─────────────────────────────────────────────┘   │                                            │ ║
║                                                     │  ─────────────────────────────────────────│ ║
║  ┌──Transit Route Visualization───────────────┐   │  Fleet Commands (Limited - In Transit):    │ ║
║  │  ╔═════════════════════════════════════╗   │   │                                            │ ║
║  │  ║                                     ║   │   │  [⛔ CANCEL ORDERS]                         │ ║
║  │  ║   [●]━━━━━━━━━▶━━━━━[◎]            ║   │   │     └─ Return to origin                    │ ║
║  │  ║  Origin    Fleet    Destination     ║   │   │                                            │ ║
║  │  ║  (New Ham.)  ▲     (Rigel IV)       ║   │   │  [🔀 REDIRECT FLEET]                       │ ║
║  │  ║              │                      ║   │   │     └─ Choose new destination              │ ║
║  │  ║         In Transit                  ║   │   │                                            │ ║
║  │  ╚═════════════════════════════════════╝   │   │  ⚠️ Cannot split/merge while in transit   │ ║
║  │     Speed: 4 │ ETA: 3 turns                │   │                                            │ ║
║  └────────────────────────────────────────────┘   └────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  ⚠️ INVASION FORCE approaching enemy system! Combat expected on arrival.      [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Set Destination Dialog

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  FLEET COMMAND - SET DESTINATION                                                 [?] Help        ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Fleet: BATTLE GROUP ALPHA (12 ships)                                                        │ ║
║  │  Current Location: New Hamsterton                                                            │ ║
║  │  Range: 12 parsecs │ Speed: 4 parsecs/turn                                                   │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Destination Selection Map──────────────────────────────────────────────────────────────────┐ ║
║  │  ╔════════════════════════════════════════════════════════════════════════════════════════╗ │ ║
║  │  ║                              ╭─────────────────────────────────╮                       ║ │ ║
║  │  ║            ·              ★ ╱                                   ╲                      ║ │ ║
║  │  ║     ·    ·        ·       ╱      ·                               ╲     ·               ║ │ ║
║  │  ║        ●              ◈  ╱  ·        ★                            ╲                    ║ │ ║
║  │  ║   ✴         ★           ╱                  ·                       ╲                   ║ │ ║
║  │  ║      ·         ✦    [●]╱       ·         ◉                          ╲                  ║ │ ║
║  │  ║          ◉           ╱     ·   ✵            ◎ ← Click to select     ╲                 ║ │ ║
║  │  ║   ★           ·     ╱           ★         ·    ✴                     ╲                ║ │ ║
║  │  ║        ·   ✵       ╱      ●              ·                            ╲               ║ │ ║
║  │  ║             ·    ·╱           ✦                 ·                      ╲              ║ │ ║
║  │  ║   ·             ╱ ★       ·       ·                                     ╲             ║ │ ║
║  │  ║         ●      ╱              ·          ★                               ╲            ║ │ ║
║  │  ║      ✴      · ╱  ✵      ·        ✦         ·                             ╲           ║ │ ║
║  │  ║   ·       ·  ╱       ·              ·                                     ╲          ║ │ ║
║  │  ║            ╲╱ ★    ·        ·    ✴                                         ╲         ║ │ ║
║  │  ║             ╲────────────RANGE─LIMIT─────────────────────────────────────── ╲        ║ │ ║
║  │  ╚════════════════════════════════════════════════════════════════════════════════════════╝ │ ║
║  │                                                                                              │ ║
║  │  Legend: [●] Fleet Position  ● Your Colony  ◉ Enemy  ◈ Neutral  ✵ Unexplored  ╭╮ Range    │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Selected Destination────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Destination: RIGEL IV              Distance: 10 parsecs    ETA: 3 turns                    │ ║
║  │  Owner: Ferret Empire (Enemy)       Star Type: Yellow       Planets: 3 (1 colonized)        │ ║
║  │                                                                                              │ ║
║  │  ⚠️ Warning: Hostile territory - expect combat upon arrival                                 │ ║
║  │                                                                                              │ ║
║  │              [CONFIRM DESTINATION]                 [CANCEL]                                  │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Click on a star within range to select destination. Destinations outside range are dimmed.    ║
║                                                                               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Split Fleet Dialog

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  FLEET COMMAND - SPLIT FLEET                                                     [?] Help        ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Splitting: BATTLE GROUP ALPHA (12 ships total)                                              │ ║
║  │  Location: New Hamsterton                                                                    │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Current Fleet (Keep)───────────────────────┐   ┌──New Fleet (Split Off)────────────────────┐ ║
║  │                                             │   │                                            │ ║
║  │  Name: BATTLE GROUP ALPHA                   │   │  Name: [NEW FLEET NAME__________]          │ ║
║  │                                             │   │                                            │ ║
║  │  ┌─────────────────────────────────────┐   │   │  ┌────────────────────────────────────┐   │ ║
║  │  │ Ship Design        │ Keep │ Total   │   │   │  │ Ship Design        │ Transfer     │   │ ║
║  │  ├─────────────────────────────────────┤   │   │  ├────────────────────────────────────┤   │ ║
║  │  │ Cruiser "Sunflower"│  2   │   2     │   │   │  │ Cruiser "Sunflower"│ [0]  [▲][▼]  │   │ ║
║  │  │ Dest. "Whiskers"   │  3   │   6     │   │   │  │ Dest. "Whiskers"   │ [3]  [▲][▼]  │   │ ║
║  │  │ Fighter "Pellet"   │  2   │   4     │   │   │  │ Fighter "Pellet"   │ [2]  [▲][▼]  │   │ ║
║  │  └─────────────────────────────────────┘   │   │  └────────────────────────────────────┘   │ ║
║  │                                             │   │                                            │ ║
║  │  Ships Remaining: 7                         │   │  Ships in New Fleet: 5                     │ ║
║  │  Strength: ★★☆☆☆                           │   │  Strength: ★★☆☆☆                          │ ║
║  │  Speed: 4 parsecs/turn                      │   │  Speed: 6 parsecs/turn                     │ ║
║  │  Range: 12 parsecs                          │   │  Range: 15 parsecs                         │ ║
║  │                                             │   │                                            │ ║
║  │  [SELECT ALL]  [SELECT NONE]                │   │  [TRANSFER ALL]  [CLEAR]                   │ ║
║  │                                             │   │                                            │ ║
║  └─────────────────────────────────────────────┘   └────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  ⚠️ Note: The new fleet will be created at the same location (New Hamsterton).              │ ║
║  │     Fleet speed and range are determined by the SLOWEST ship in the fleet.                  │ ║
║  │                                                                                              │ ║
║  │                    [CONFIRM SPLIT]                        [CANCEL]                           │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Use ▲/▼ buttons or type numbers to transfer ships between fleets.            [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Rally Point Configuration

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  FLEET COMMAND - RALLY POINTS                                                    [?] Help        ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Active Rally Points───────────────────────────────────────────────────────────────────────┐  ║
║  │                                                                                             │  ║
║  │  Rally points are gathering locations for newly built ships and idle fleets.               │  ║
║  │                                                                                             │  ║
║  │  ┌───────────────────────────────────────────────────────────────────────────────────────┐ │  ║
║  │  │ #  │ Rally Point Name   │ Location         │ Assigned Ships │ Fleets │ Actions       │ │  ║
║  │  ├───────────────────────────────────────────────────────────────────────────────────────┤ │  ║
║  │  │ 1  │ MAIN FLEET HQ      │ New Hamsterton   │ All new builds │   2    │ [Edit][Del]   │ │  ║
║  │  │ 2  │ NORTHERN BORDER    │ Alpha Prime      │ Fighters only  │   1    │ [Edit][Del]   │ │  ║
║  │  │ 3  │ STAGING AREA       │ Sirius III       │ Capital ships  │   1    │ [Edit][Del]   │ │  ║
║  │  └───────────────────────────────────────────────────────────────────────────────────────┘ │  ║
║  │                                                                                             │  ║
║  │  [+ ADD NEW RALLY POINT]                                                                    │  ║
║  │                                                                                             │  ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
║  ┌──Configure Rally Point─────────────────────────────────────────────────────────────────────┐  ║
║  │                                                                                             │  ║
║  │  Rally Point Name: [STAGING AREA_____________]                                              │  ║
║  │                                                                                             │  ║
║  │  Location: [Sirius III          ▼]   (Select from your colonies or star systems)            │  ║
║  │                                                                                             │  ║
║  │  Ship Types to Rally:                                                                       │  ║
║  │    [✓] Scouts           [✓] Destroyers       [ ] Battlecruisers                            │  ║
║  │    [✓] Fighters         [✓] Cruisers         [✓] Dreadnoughts                              │  ║
║  │                                                                                             │  ║
║  │  Auto-Rally New Ships From:                                                                 │  ║
║  │    [✓] New Hamsterton   [✓] Alpha Prime      [ ] Desert Outpost                            │  ║
║  │    [ ] Jungle Paradise  [✓] Sirius III       [ ] All Colonies                              │  ║
║  │                                                                                             │  ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────  │  ║
║  │                                                                                             │  ║
║  │  ⚠️ Ships at rally points await orders. They will not move until assigned to a fleet       │  ║
║  │     or given a destination.                                                                 │  ║
║  │                                                                                             │  ║
║  │                    [SAVE RALLY POINT]                     [CANCEL]                          │  ║
║  │                                                                                             │  ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Rally points help organize fleet production across your empire.               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Ship Design Quick View

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  FLEET COMMAND - SHIP DETAILS                                                    [?] Help        ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Ship Design: Cruiser "Sunflower MK II"─────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  ┌───────────────────┐   Hull Class: Cruiser (500 space)                                    │ ║
║  │  │                   │   Cost: 425 BC per ship                                              │ ║
║  │  │                   │   Maintenance: 3 BC/turn per ship                                    │ ║
║  │  │   ╔═══════════╗   │                                                                      │ ║
║  │  │   ║           ║   │   ─────────────────────────────────────────────────────────────────  │ ║
║  │  │   ║  [SHIP    ║   │   WEAPONS:                                                           │ ║
║  │  │   ║   IMAGE]  ║   │   ├─ Heavy Fusion Beam ×2        (20 damage each, range 5)           │ ║
║  │  │   ║           ║   │   ├─ Scatter Pack V ×1           (3×5 missiles, 15 dmg total)        │ ║
║  │  │   ╚═══════════╝   │   └─ Point Defense Laser ×2      (Anti-missile, 5 damage)            │ ║
║  │  │                   │                                                                      │ ║
║  │  │   Combat Rating:  │   DEFENSES:                                                          │ ║
║  │  │   ★★★☆☆          │   ├─ Armor: Titanium III          (80 HP absorption)                 │ ║
║  │  │                   │   ├─ Shield: Class IV             (40% damage reduction)             │ ║
║  │  └───────────────────┘   └─ ECM: Jammer II               (+15% enemy miss chance)           │ ║
║  │                                                                                              │ ║
║  │  ┌──Statistics─────────────────────────────────────────────────────────────────────────────┐│ ║
║  │  │                                                                                          ││ ║
║  │  │  Hit Points:  250 / 250      Speed:   4 parsecs/turn     Computer: Mark III (+30% hit)  ││ ║
║  │  │  Attack Mod:  +25%           Range:   12 parsecs (fuel)  Maneuver: 3 (combat speed)     ││ ║
║  │  │  Defense Mod: +15%           Specials: Auto-Repair, ECM                                 ││ ║
║  │  │                                                                                          ││ ║
║  │  └──────────────────────────────────────────────────────────────────────────────────────────┘│ ║
║  │                                                                                              │ ║
║  │  Fleet Count: 2 ships of this design in BATTLE GROUP ALPHA                                  │ ║
║  │  Empire Total: 6 ships of this design across all fleets                                     │ ║
║  │                                                                                              │ ║
║  │                [EDIT DESIGN (F6)]           [SCRAP ALL]           [CLOSE]                   │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Other Ships in Fleet───────────────────────────────────────────────────────────────────────┐ ║
║  │  [Cruiser "Sunflower"]  [Destroyer "Whiskers"]  [Fighter "Pellet"]                          │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Click on another ship design to view its details.                             [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Merge Fleets Dialog

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  FLEET COMMAND - MERGE FLEETS                                                    [?] Help        ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Primary Fleet: BATTLE GROUP ALPHA (12 ships)                                                │ ║
║  │  Location: New Hamsterton                                                                    │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Fleets Available to Merge (Same Location)──────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │ ║
║  │  │ [✓] │ Fleet Name        │ Ships │ Strength │ Speed │ Status                          │  │ ║
║  │  ├───────────────────────────────────────────────────────────────────────────────────────┤  │ ║
║  │  │ [✓] │ RESERVE FORCE     │   4   │ ★★☆☆☆   │   5   │ Orbiting New Hamsterton         │  │ ║
║  │  │ [ ] │ SCOUT SQUADRON    │   3   │ ★☆☆☆☆   │   6   │ Orbiting New Hamsterton         │  │ ║
║  │  └───────────────────────────────────────────────────────────────────────────────────────┘  │ ║
║  │                                                                                              │ ║
║  │  ⚠️ Only fleets at the same location can be merged.                                         │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Merged Fleet Preview────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Result: BATTLE GROUP ALPHA (merged)                                                         │ ║
║  │                                                                                              │ ║
║  │  Total Ships: 16                                                                             │ ║
║  │  Composition:                                                                                │ ║
║  │    • Cruiser "Sunflower"    ×2                                                              │ ║
║  │    • Destroyer "Whiskers"   ×6                                                              │ ║
║  │    • Destroyer "Anvil"      ×4    ← From RESERVE FORCE                                      │ ║
║  │    • Fighter "Pellet"       ×4                                                              │ ║
║  │                                                                                              │ ║
║  │  Combined Strength: ★★★★☆ (Excellent)                                                       │ ║
║  │  Fleet Speed: 4 parsecs/turn (limited by slowest ship)                                       │ ║
║  │  Fleet Range: 10 parsecs                                                                     │ ║
║  │  Maintenance: 28 BC/turn                                                                     │ ║
║  │                                                                                              │ ║
║  │                    [CONFIRM MERGE]                        [CANCEL]                           │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Select fleets to merge with BATTLE GROUP ALPHA. All selected fleets will be absorbed.         ║
║                                                                               [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Patrol Route Configuration

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  FLEET COMMAND - SET PATROL ROUTE                                                [?] Help        ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Fleet: PATROL WING (2 ships)          Speed: 6 parsecs/turn          Range: 15 parsecs     │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Patrol Route Map───────────────────────────────────────────────────────────────────────────┐ ║
║  │  ╔════════════════════════════════════════════════════════════════════════════════════════╗ │ ║
║  │  ║                                                                                        ║ │ ║
║  │  ║            ·              ★                                                            ║ │ ║
║  │  ║     ·    ·        ·              ·                    ┌──Patrol Route──┐              ║ │ ║
║  │  ║        ●              ◈       ·        ★              │ 1. Sol System  │              ║ │ ║
║  │  ║   ✴       [1]★───────────────[2]●         ·           │ 2. Alpha Prime │              ║ │ ║
║  │  ║      ·     │   ✦    ●   │    ·         ◉              │ 3. Sirius      │              ║ │ ║
║  │  ║          ◉ │            │ ·   ✵                       │                │              ║ │ ║
║  │  ║   ★        │ ·          │       ★         ·    ✴      │ Cycle Time:    │              ║ │ ║
║  │  ║        ·   │✵           │  ●              ·           │ 9 turns        │              ║ │ ║
║  │  ║            │·    ·      │       ✦                 ·   │                │              ║ │ ║
║  │  ║   ·        │      ★     │ ·       ·                   │ [+ Add Stop]   │              ║ │ ║
║  │  ║         ●  │            │      ·          ★           │ [Clear Route]  │              ║ │ ║
║  │  ║      ✴     └────────────[3]●       ✦         ·        └────────────────┘              ║ │ ║
║  │  ║   ·       ·          ·              ·                                                  ║ │ ║
║  │  ║              ★    ·        ·    ✴                                                      ║ │ ║
║  │  ║                                                                                        ║ │ ║
║  │  ╚════════════════════════════════════════════════════════════════════════════════════════╝ │ ║
║  │                                                                                              │ ║
║  │  Click stars to add to patrol route. Click existing waypoints to remove. Numbers show order.│ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Patrol Behavior────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  On Enemy Contact: (•) Engage and Report   ( ) Report Only   ( ) Evade                      │ ║
║  │  Wait at Each Stop: [ 0 ] turns                                                              │ ║
║  │  Auto-Explore Nearby: [ ] Yes (deviate 2 parsecs to explore unknown systems)                │ ║
║  │                                                                                              │ ║
║  │                    [START PATROL]                        [CANCEL]                            │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Patrol routes repeat indefinitely until cancelled.                            [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Fleet List Component - Detailed Specification

### Fleet List Entry Layout

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  ▶ BATTLE GROUP ALPHA                      ★★★☆☆         │
│    └─ Fleet Name (Editable)                 └─ Strength   │
│                                                Rating      │
│    📍 New Hamsterton (Orbiting)                           │
│    └─ Status Icon + Location + State                       │
│                                                            │
│    🚀 12 ships │ Speed: 4 │ Range: 12                     │
│    └─ Count      └─ Parsecs/turn  └─ Max distance         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Fleet Status Icons

| Icon | Status | Description |
|------|--------|-------------|
| 📍 | Orbiting | Fleet is at a star system |
| 🛫 | In Transit | Fleet moving to destination |
| 🔄 | Patrolling | Fleet on active patrol route |
| ⚓ | Rally Point | Fleet awaiting orders at rally |
| ⚔️ | Combat | Fleet engaged in battle |
| 🛑 | Blocked | Fleet movement blocked (out of range) |
| ⏸️ | Idle | Fleet with no orders |

### Fleet Strength Ratings

| Rating | Stars | Approximate Power |
|--------|-------|-------------------|
| Negligible | ★☆☆☆☆ | 1-3 scouts/fighters |
| Weak | ★★☆☆☆ | Small patrol force |
| Moderate | ★★★☆☆ | Balanced combat fleet |
| Strong | ★★★★☆ | Capital ship presence |
| Overwhelming | ★★★★★ | Dreadnought+ fleet |

**Strength Calculation Formula:**
```
Strength = Σ (Ship_HP × Ship_Firepower × Class_Modifier)

Class Modifiers:
- Scout: 0.5
- Fighter: 0.75
- Destroyer: 1.0
- Cruiser: 1.5
- Battle Cruiser: 2.0
- Dreadnought: 3.0
- Titan: 5.0
```

---

## Ship Composition Table - Detailed Specification

### Table Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Ship Composition                                                │
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ Design Name          │ Count │ Hull Class │ Actions       │  │
│ ├───────────────────────────────────────────────────────────┤  │
│ │ Cruiser "Sunflower"  │   2   │ Cruiser    │ [👁️] [🗑️]    │  │
│ │ Dest. "Whiskers"     │   6   │ Destroyer  │ [👁️] [🗑️]    │  │
│ │ Fighter "Pellet"     │   4   │ Fighter    │ [👁️] [🗑️]    │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│ [👁️] = View ship design details                                │
│ [🗑️] = Scrap ships (opens confirmation)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Column Definitions

| Column | Width | Content | Sortable |
|--------|-------|---------|----------|
| Design Name | 40% | Ship design name (truncated if needed) | Yes |
| Count | 15% | Number of this design in fleet | Yes |
| Hull Class | 25% | Scout/Fighter/Destroyer/etc. | Yes |
| Actions | 20% | View/Scrap buttons | No |

---

## ETA Calculation Display

### ETA Panel (In Transit Fleets)

```
┌──Journey Progress──────────────────────────────────────────┐
│                                                             │
│  From: New Hamsterton         To: Rigel IV                  │
│                                                             │
│  Total Distance:    15 parsecs                              │
│  Fleet Speed:       4 parsecs/turn                          │
│  Base Travel Time:  4 turns (15 ÷ 4, rounded up)           │
│                                                             │
│  Progress: ████████████░░░░░░░░░░░░ 50%                    │
│            └─ 7.5 parsecs traveled                          │
│                                                             │
│  ETA: 2 turns remaining (Turn 17)                           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Modifiers Applied:                                         │
│    • None                                                   │
│                                                             │
│  Possible Modifiers (not currently active):                 │
│    • Nebula transit: +50% travel time                       │
│    • Hyperspace booster: -1 turn                            │
│    • Starlane: Instant arrival                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### ETA Formula

```
Base ETA = CEILING(Distance / Fleet_Speed)

Where:
- Distance = Euclidean distance in parsecs
- Fleet_Speed = Speed of SLOWEST ship in fleet (parsecs/turn)
- CEILING = Round up to nearest integer

Modifiers:
- Nebula: ETA = ETA × 1.5 (rounded up)
- Hyperspace Booster tech: ETA = ETA - 1 (minimum 1)
- Starlane: ETA = 1 (instant travel between connected systems)
```

---

## Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| F3 | Open Fleet Command | Any screen |
| ↑/↓ | Navigate fleet list | Fleet list focused |
| Enter | Select/expand fleet | Fleet highlighted |
| M | Set destination (Move) | Fleet selected |
| S | Split fleet | Fleet selected |
| R | Set rally point | Fleet selected |
| P | Set patrol route | Fleet selected |
| Delete | Disband fleet | Fleet selected |
| Escape | Cancel/close dialog | Any dialog open |
| Tab | Cycle between panels | Main screen |
| / | Search fleets by name | Any |
| N | Create new fleet | Fleet list |
| Shift+Click | Multi-select fleets | Fleet list |
| Ctrl+A | Select all fleets | Fleet list |

---

## Mouse Interactions

| Action | Target | Result |
|--------|--------|--------|
| Click | Fleet list entry | Select fleet, show details |
| Double-click | Fleet list entry | Open fleet on galaxy map |
| Right-click | Fleet list entry | Context menu (Move, Split, etc.) |
| Drag | Fleet in mini-map | Quick destination setting |
| Click | Ship in composition | Open ship design view |
| Click | Star in destination map | Set as destination |
| Shift+Click | Multiple stars | Create waypoint route |
| Mouse wheel | Mini-map | Zoom in/out |
| Click+drag | Mini-map | Pan view |
| Hover | Fleet entry | Show tooltip with details |
| Hover | Star in map | Show system info tooltip |

---

## Context Menu (Right-Click Fleet)

```
┌────────────────────────────┐
│ ▶ Battle Group Alpha       │
├────────────────────────────┤
│ 🎯 Set Destination    [M]  │
│ ↔️ Split Fleet         [S]  │
│ 🔗 Merge Fleets...         │
│ ───────────────────────── │
│ 📍 Set Rally Point    [R]  │
│ 🔄 Set Patrol Route   [P]  │
│ 🔍 Auto-Explore            │
│ ───────────────────────── │
│ 🗺️ Show on Galaxy Map     │
│ 📊 Fleet Statistics        │
│ ───────────────────────── │
│ ✏️ Rename Fleet            │
│ 🗑️ Disband Fleet    [Del] │
└────────────────────────────┘
```

---

## Tooltips

### Fleet Entry Tooltip

```
┌──────────────────────────────────────────────┐
│ BATTLE GROUP ALPHA                           │
│ ═══════════════════════════════════════════ │
│                                              │
│ Location: New Hamsterton (Sol System)        │
│ Status: Orbiting (Idle)                      │
│                                              │
│ Ships: 12 total                              │
│  • 2 Cruisers                                │
│  • 6 Destroyers                              │
│  • 4 Fighters                                │
│                                              │
│ Combat Strength: ★★★☆☆ (Moderate)           │
│ Speed: 4 parsecs/turn (limited by Cruiser)   │
│ Range: 12 parsecs                            │
│ Maintenance: 18 BC/turn                      │
│                                              │
│ ──────────────────────────────────────────── │
│ Click to select • Right-click for actions    │
│ Double-click to view on map                  │
└──────────────────────────────────────────────┘
```

### Star System Tooltip (Destination Selection)

```
┌──────────────────────────────────────────────┐
│ RIGEL IV                                     │
│ ═══════════════════════════════════════════ │
│                                              │
│ Owner: Ferret Empire (Enemy ⚔️)              │
│ Star Type: Yellow G-Class                    │
│ Planets: 3 (1 colonized)                     │
│                                              │
│ Distance: 10 parsecs                         │
│ ETA: 3 turns (at speed 4)                    │
│                                              │
│ Known Defenses:                              │
│  • 5 Missile Bases                           │
│  • 8 ships in orbit                          │
│                                              │
│ ⚠️ Combat expected upon arrival              │
└──────────────────────────────────────────────┘
```

---

## Notification Events (Fleet-Related)

### Fleet Arrival Notification

```
┌──────────────────────────────────────────────────────────┐
│ 🛬 FLEET ARRIVAL                                   [×]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ INVASION FORCE has arrived at Rigel IV!                  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Fleet: 8 ships                                      │  │
│ │ Status: Hostile forces detected!                    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ Enemy Presence:                                          │
│  • 5 Missile Bases                                       │
│  • 12 Ships (estimated)                                  │
│                                                          │
│  [ENGAGE IN COMBAT]    [RETREAT]    [VIEW FLEET]        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Fleet Under Attack Notification

```
┌──────────────────────────────────────────────────────────┐
│ ⚔️ FLEET UNDER ATTACK!                             [×]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ DEFENSE FLEET at Alpha Prime is under attack!           │
│                                                          │
│ Attacker: Ferret Empire                                  │
│ Enemy Force: 15 ships (estimated ★★★★☆)                 │
│                                                          │
│ Your Force: 5 ships (★★☆☆☆)                             │
│                                                          │
│ ⚠️ You are outnumbered! Retreat may be advisable.       │
│                                                          │
│  [FIGHT]    [RETREAT]    [AUTO-RESOLVE]                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Fleet Report Screen (Detailed View)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  EMPIRE FLEET REPORT                                                             [?] Help        ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──Summary Statistics─────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Total Ships: 32                    Active Fleets: 6                                         │ ║
║  │  Total Strength: ★★★☆☆ (Moderate)  Total Maintenance: 45 BC/turn                            │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──Ships by Class─────────────────────┐   ┌──Ships by Design────────────────────────────────┐  ║
║  │                                     │   │                                                  │  ║
║  │  Class         │ Count │ % of Total │   │  Design Name          │ Count │ Maint. │ Built │  ║
║  │  ──────────────────────────────────│   │  ────────────────────────────────────────────── │  ║
║  │  Scouts        │   5   │   16%      │   │  Scout "Explorer"     │   5   │  2 BC  │ T.5   │  ║
║  │  Fighters      │  10   │   31%      │   │  Fighter "Pellet"     │  10   │  5 BC  │ T.8   │  ║
║  │  Destroyers    │   8   │   25%      │   │  Dest. "Whiskers"     │   6   │  9 BC  │ T.10  │  ║
║  │  Cruisers      │   6   │   19%      │   │  Dest. "Anvil"        │   2   │  6 BC  │ T.12  │  ║
║  │  Battle Crsrs  │   2   │    6%      │   │  Cruiser "Sunflower"  │   6   │ 18 BC  │ T.14  │  ║
║  │  Dreadnoughts  │   1   │    3%      │   │  BattleCr "Fist"      │   2   │  8 BC  │ T.13  │  ║
║  │  ──────────────────────────────────│   │  Dread. "Hammerfall"  │   1   │  5 BC  │ T.15  │  ║
║  │  TOTAL         │  32   │  100%      │   │  ────────────────────────────────────────────── │  ║
║  │                                     │   │  TOTAL                │  32   │ 53 BC  │       │  ║
║  └─────────────────────────────────────┘   └──────────────────────────────────────────────────┘  ║
║                                                                                                   ║
║  ┌──Fleet Disposition─────────────────────────────────────────────────────────────────────────┐  ║
║  │                                                                                             │  ║
║  │  Status           │ Fleets │ Ships │ Notes                                                 │  ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────│  ║
║  │  Orbiting         │   3    │  20   │ New Hamsterton (12), Alpha Prime (5), Sol (3)        │  ║
║  │  In Transit       │   1    │   8   │ → Rigel IV (ETA: 3 turns)                            │  ║
║  │  Patrolling       │   1    │   2   │ Northern Border (3-system route)                     │  ║
║  │  At Rally Points  │   1    │   2   │ Sirius Staging Area                                  │  ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────│  ║
║  │  TOTAL            │   6    │  32   │                                                       │  ║
║  │                                                                                             │  ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
║  ┌──Recent Fleet Events (Last 10 Turns)────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │  Turn 14: Cruiser "Sunflower" completed at New Hamsterton                                   │ ║
║  │  Turn 12: INVASION FORCE departed for Rigel IV                                              │ ║
║  │  Turn 11: PATROL WING began patrol route                                                    │ ║
║  │  Turn 10: 2 Fighters "Pellet" completed at Alpha Prime                                      │ ║
║  │  Turn 8:  Fleet battle at Deneb - Victory (2 Destroyers lost)                              │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  [BACK TO FLEET COMMAND]                                                       [END TURN ⏎]      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Data Structures (JSON)

### Fleet Data Structure

```json
{
  "fleets": [
    {
      "id": "fleet_001",
      "name": "BATTLE GROUP ALPHA",
      "status": "orbiting",
      "location": {
        "system_id": "sol",
        "system_name": "New Hamsterton",
        "coordinates": { "x": 45.2, "y": 32.1 }
      },
      "destination": null,
      "eta": null,
      "ships": [
        { "design_id": "cruiser_sunflower", "count": 2 },
        { "design_id": "destroyer_whiskers", "count": 6 },
        { "design_id": "fighter_pellet", "count": 4 }
      ],
      "total_ships": 12,
      "speed": 4,
      "range": 12,
      "strength_rating": 3,
      "maintenance_cost": 18,
      "rally_point_id": null,
      "patrol_route": null,
      "orders": {
        "type": "idle",
        "on_enemy_contact": "engage",
        "auto_explore": false
      },
      "created_turn": 5,
      "last_combat_turn": 8
    }
  ]
}
```

### Rally Point Data Structure

```json
{
  "rally_points": [
    {
      "id": "rally_001",
      "name": "MAIN FLEET HQ",
      "location": {
        "system_id": "sol",
        "system_name": "New Hamsterton"
      },
      "ship_types": ["all"],
      "source_colonies": ["sol_i", "alpha_iii"],
      "assigned_fleets": ["fleet_001", "fleet_005"],
      "ships_awaiting": 0
    }
  ]
}
```

### Patrol Route Data Structure

```json
{
  "patrol_routes": [
    {
      "id": "patrol_001",
      "fleet_id": "fleet_004",
      "waypoints": [
        { "system_id": "sol", "order": 1 },
        { "system_id": "alpha", "order": 2 },
        { "system_id": "sirius", "order": 3 }
      ],
      "cycle_time": 9,
      "current_waypoint": 2,
      "on_enemy_contact": "engage_report",
      "wait_turns": 0,
      "auto_explore": false
    }
  ]
}
```

---

## Edge Cases

### 1. Empty Fleet List
```
┌──Fleet List────────────────────────────────┐
│                                             │
│  No fleets available.                       │
│                                             │
│  Ships must be assigned to fleets before    │
│  they can be commanded. New ships will      │
│  automatically form fleets at their build   │
│  location, or go to assigned rally points.  │
│                                             │
│  [+ CREATE FLEET FROM SHIPS]                │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. Fleet Out of Range
When destination is beyond fleet range:
```
⚠️ DESTINATION OUT OF RANGE

Rigel IV is 18 parsecs away.
Your fleet's maximum range is 12 parsecs.

Options:
• Research Extended Fuel Cells technology
• Set intermediate waypoint within range
• Build refueling station at nearer colony

[SELECT WAYPOINT]  [CANCEL]
```

### 3. Cannot Split Single Ship
```
⚠️ CANNOT SPLIT FLEET

SCOUT SQUADRON contains only 1 ship.
A fleet must have at least 2 ships to split.

[OK]
```

### 4. Merge Location Mismatch
```
⚠️ NO FLEETS TO MERGE

There are no other fleets at New Hamsterton.
Fleets must be at the same location to merge.

Nearby fleets:
• DEFENSE FLEET at Alpha Prime (3 parsecs away)
• PATROL WING at Sirius (5 parsecs away)

[OK]
```

### 5. Fleet Speed Warning
When merging/splitting creates mismatched speeds:
```
⚠️ FLEET SPEED WARNING

Adding Scout "Explorer" (speed 6) to this fleet
will NOT change fleet speed.

Current fleet speed: 4 parsecs/turn
(Limited by Cruiser "Sunflower")

Fleet speed is always determined by the
SLOWEST ship in the fleet.

[CONTINUE]  [CANCEL]
```

---

## Accessibility Features

### Screen Reader Support
- All fleet entries include ARIA labels with full status
- Ship counts announced with context ("6 Destroyers in fleet")
- Status changes announced ("Fleet now in transit, ETA 3 turns")
- Keyboard navigation fully supported

### Visual Accessibility
- High contrast mode: White text on dark backgrounds
- Color-blind friendly status icons (shapes + patterns, not just color)
- Scalable UI elements (responds to browser zoom)
- Status indicators use both color AND text/icons

### Motor Accessibility
- All actions accessible via keyboard
- No time-limited interactions
- Large click targets (minimum 44×44 pixels)
- Drag actions have click alternatives

---

## Responsive Behavior

### Wide Screen (1920×1080+)
- Full layout as shown in wireframes
- Mini-map always visible
- Side-by-side fleet list and details

### Medium Screen (1280×720)
- Collapsed mini-map (click to expand)
- Fleet list and details stack vertically when fleet selected
- Reduced padding and margins

### Small Screen (Below 1280)
- Tab-based navigation (List / Details / Map)
- Full-width single column layout
- Bottom sheet dialogs for actions

---

## Performance Considerations

### Fleet List Virtualization
- Only render visible fleet entries
- Lazy load ship composition details
- Cache strength calculations

### Map Rendering
- Use canvas for destination selection map
- Pre-render range circle graphics
- Throttle hover tooltip updates

### Data Updates
- Batch fleet status updates
- Debounce search/filter operations
- Progressive loading for large empires (100+ ships)

---

## MOO1 Faithfulness Notes

This specification maintains MOO1 fleet mechanics:

1. **Fleet Speed**: Determined by slowest ship (MOO1 mechanic)
2. **Fleet Range**: Determined by shortest-range ship (MOO1 mechanic)
3. **In-Transit Lock**: Cannot split/merge fleets while moving (MOO1 mechanic)
4. **Same-Location Merge**: Fleets must be at same system to merge (MOO1 mechanic)
5. **Destination Setting**: Click-to-move interface (MOO1 mechanic)

**Enhancements over MOO1:**
- Rally points (streamlines fleet organization)
- Patrol routes (automation for routine tasks)
- Fleet strength ratings (quick assessment)
- Mini-map preview (better spatial awareness)
- Ship design quick-view (no screen switching needed)

---

*Document created: 2026-03-22*
*Reference: MOO1 Ships Screen (F3), MOO1 Official Strategy Guide*
*Target: Hamster of Orion - Web-based 4X Strategy Game*
