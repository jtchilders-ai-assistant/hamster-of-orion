# UI Specification: Random Events & Monster Encounters

## Overview

This document specifies the interface layout, notification banners, choices/response buttons, map camera transitions, and explicit return paths for all random events, space monster encounters, and galactic crises in **Hamster of Orion**.

**References:**
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)
- [Random Events Design Spec](file:///Users/jchilders/mywork/hamster-of-orion/design/game-mechanics/random-events.md)
- [Crisis Narrative Spec](file:///Users/jchilders/mywork/hamster-of-orion/design/narrative/crisis-events.md)
- [Screen Inventory](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/screen-inventory.md)

---

## 1. Event Modal Layout & Visual Reference

When a random event triggers at the start of a turn, an event modal overlay pops up in front of the main UI.

### Screenshot Reference
![Colony Ship Arrival Modal](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_colony_ship_arrives_at_potential_planet.png)

### Layout Wireframe
```
+-------------------------------------------------------------+
| [ALERT ICON]  RANDOM EVENT: SPACE AMOEBA DETECTED   [X]     |
+-------------------------------------------------------------+
|                                                             |
|  +-----------------------+  A giant Space Amoeba has        |
|  |                       |  entered the Kaelis system!      |
|  |   [EVENT ARTWORK]     |  It is consuming orbital        |
|  |                       |  factories and population.       |
|  +-----------------------+                                  |
|                                                             |
|  Action Required: Dispatch war fleets to destroy the entity.|
|                                                             |
|   +-----------------------+     +-----------------------+   |
|   |  [Center on System]   |     |      [Dismiss]        |   |
|   +-----------------------+     +-----------------------+   |
+-------------------------------------------------------------+
```

---

## 2. Interaction Specifications (3-Part)

### 2.1 Space Monster Incursion Event
1. **Trigger / Click Response**:
   - Triggers automatically at the start of a turn after fleet movement processing.
   - Clicking `[Center on System]` adjusts the galaxy map camera to target coordinates `(X, Y)` and highlights the monster icon.
   - Clicking `[Dismiss]` or pressing `Esc` / `Enter` closes the modal.
2. **Visual Transition**:
   - Modal background darkens (`backdrop-filter: blur(4px); opacity 0.8`).
   - Red header banner pulses at `1Hz`.
3. **Return Path / Exit Method**:
   - Closing the modal transfers focus back to the Turn Summary notification panel.
   - A persistent red warning badge remains on the affected star system node on the Galaxy Map.

### 2.2 Planetary Plague Event
1. **Trigger / Click Response**:
   - Clicking `[Allocate Reserve Funds (250 BC)]` immediately deducts 250 BC from the Planetary Reserve and applies a +50% medical cure bonus to the colony.
   - Clicking `[Ignore Crisis]` leaves the colony to rely solely on local Eco production.
2. **Visual Transition**:
   - Biohazard symbol overlays the colony summary box on the Galaxy Map (`moo_galaxy_home.png`).
3. **Return Path / Exit Method**:
   - Selecting either choice closes the modal prompt and updates colony status indicators immediately.

### 2.3 Supernova Warning & Explosion
1. **Trigger / Click Response**:
   - Warning modal pops up with a countdown timer (`Supernova in 5 Turns`).
   - Clicking `[Open Transport Window]` opens the [Population Transport UI](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/main-screens.md) with target planet pre-selected.
2. **Visual Transition**:
   - System star icon on the Galaxy Map changes from yellow/blue to an animated pulsing orange flare.
3. **Return Path / Exit Method**:
   - Pressing `Esc` or clicking `[OK]` dismisses the warning modal and returns focus to the Galaxy Map.
