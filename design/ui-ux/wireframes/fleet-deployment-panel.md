# Fleet Deployment Panel - MOO1-Accurate Specification

## Overview

The Fleet Deployment panel appears in the **right-side info panel** of the Galaxy Map when a fleet orbiting a system is selected. This panel allows the player to select which ships to deploy to a new destination.

**Trigger**: Click on a fleet icon at a star system (not in transit)

---

## Visual Description (from MOO1 screenshot)

The Galaxy Map remains visible behind the deployment flow, showing the star field and star systems. When a fleet is selected for deployment, the **right-side info panel** (approximately 20–25% of screen width) switches to the deployment UI. A **bright green line** is drawn from the origin system to the selected destination star on the galaxy map, showing the planned route. The right panel has a dark background consistent with the rest of the info panel.

Within the panel:
- **Top area**: Pixel-art ship sprites in individual bordered boxes, stacked or arranged in rows
- **Below each ship**: `<< < [N] > >>` arrow/button controls for deployment count
- **Lower area**: An ETA readout in green text
- **Bottom**: CANCEL and ACCEPT buttons side by side

---

## Panel Layout

```
┌─────────────────────────┐
│                         │
│   FLEET DEPLOYMENT      │
│   ═══════════════════   │
│                         │
│   ┌─────┐ ┌─────┐       │
│   │     │ │     │       │
│   │SHIP │ │SHIP │       │
│   │ IMG │ │ IMG │       │
│   │  12 │ │   4 │       │  ← Ship count in bottom-right corner
│   └─────┘ └─────┘       │
│   << < 12 > >>          │  ← Deployment controls per ship type
│   << <  4 > >>          │
│                         │
│   ┌─────┐ ┌─────┐       │
│   │     │ │     │       │  ← Empty slots (up to 5 types total)
│   │EMPTY│ │EMPTY│       │
│   │     │ │     │       │
│   └─────┘ └─────┘       │
│                         │
│   ┌─────┐               │
│   │     │               │
│   │EMPTY│               │
│   │     │               │
│   └─────┘               │
│                         │
│   ┌─────────────────┐   │
│   │                 │   │
│   │  ETA: -- turns  │   │  ← Green text on dark background
│   │                 │   │    Updates when destination selected
│   └─────────────────┘   │
│                         │
│   [CANCEL]   [ACCEPT]   │  ← ACCEPT grayed out until
│                         │    destination selected
│                         │
└─────────────────────────┘
```

---

## Ship Slots (5 Maximum)

The panel displays up to **5 ship type slots**. Each slot shows:

```
┌───────────────┐
│               │
│   [SHIP       │
│    IMAGE]     │
│           12  │  ← Total ships of this type in orbit (bottom-right)
└───────────────┘
   << < 12 > >>    ← Deployment count controls below the image
```

### Ship Count Display
- Bottom-right corner of each ship image box shows **total ships of that type** in orbit
- Pixel-art ship sprite fills most of the box interior

### Deployment Controls
Below each ship image are selection buttons (pixel-art raised button style):

| Button | Action |
|--------|--------|
| `<<` | Set deployment count to 0 (leave all behind) |
| `<` | Decrease deployment count by 1 |
| `[number]` | Current deployment count (ships that will travel) |
| `>` | Increase deployment count by 1 |
| `>>` | Set deployment count to maximum (deploy all) |

**Default State**: All ships are selected for deployment (count = total)

---

## Galaxy Map — Route Visualization

When a destination is selected on the Galaxy Map:
- A **bright green line** is drawn from the origin fleet to the destination star
- The line remains visible until ACCEPT or CANCEL is clicked
- The origin fleet icon remains highlighted/selected

---

## Deployment Flow

### Step 1: Select Fleet
- Click on fleet icon orbiting a star system
- Fleet Deployment panel appears in right info panel
- All ships default to fully selected for deployment

### Step 2: Adjust Ship Counts (Optional)
- Use `<<` `<` `>` `>>` buttons to choose how many of each ship type to deploy
- Can leave some ships behind (partial deployment)

### Step 3: Select Destination
- Click on destination star on the Galaxy Map
- **Green line** appears connecting the fleet icon to the destination
- **ETA display** updates to show turns to reach destination (e.g., "ETA: 3 turns")
- **ACCEPT button** becomes enabled (was grayed out before destination selected)

### Step 4: Confirm Deployment
- Click **ACCEPT** to confirm the deployment
- Click **CANCEL** to abort and return to normal selection

---

## After Accepting Deployment

### Fleet Icons Update

**Departing Fleet Icon**:
- A new ship icon appears to the **LEFT** of the origin system on the galaxy map
- This represents the fleet now in transit
- Clicking this icon shows the in-transit fleet info with ETA

**Remaining Fleet Icon** (if applicable):
- If some ships were left behind, the original fleet icon remains on the **RIGHT** side of the system
- If ALL ships were deployed, this icon disappears

```
Before:                          After (partial deployment):

    ★ ▲                              ▲ ★ ▲
    │ │                              │ │ │
    │ └─ Fleet orbiting              │ │ └─ Ships remaining in orbit
    │                                │ └─── Star system
    └─── Star system                 └───── Departing fleet (in transit)


After (full deployment):

    ▲ ★
    │ │
    │ └─ Star system (no ships remain)
    └─── Departing fleet (in transit)
```

### Selection Changes
- After clicking ACCEPT, selection automatically moves to the **origin system**
- The info panel shows the origin system's colony details (if colonized)

---

## ETA Display

The green text area at the bottom of the panel shows:

| State | Display |
|-------|---------|
| No destination selected | "ETA: -- turns" or blank |
| Destination selected | "ETA: X turns" (calculated based on slowest ship in deployment) |

**Note**: ETA is calculated based on the **slowest ship** in the selected deployment group.

---

## Button States

### CANCEL Button
- Always enabled
- Closes the Fleet Deployment panel
- Returns to normal system selection
- No changes made to fleet

### ACCEPT Button
- **Grayed out** (disabled) until a destination is selected
- **Enabled** once a valid destination star is clicked
- Clicking confirms the deployment and sends ships

Both buttons use the standard MOO1 raised pixel-art button style.

---

## Example Scenarios

### Scenario 1: Deploy All Ships
1. Click fleet icon at Sol (has 12 Scouts, 4 Fighters)
2. Fleet Deployment panel shows: Scouts [12], Fighters [4]
3. Click destination star Altair
4. Green line appears on galaxy map, ETA shows "3 turns"
5. Click ACCEPT
6. Departing fleet icon appears left of Sol
7. Original fleet icon at Sol disappears (all ships deployed)
8. Selection moves to Sol system

### Scenario 2: Partial Deployment
1. Click fleet icon at Sol (has 12 Scouts, 4 Fighters)
2. Click `<<` under Fighters to set Fighter deployment to 0
3. Scouts still at [12], Fighters now at [0]
4. Click destination star Altair
5. Click ACCEPT
6. Departing fleet icon appears (12 Scouts heading to Altair)
7. Original fleet icon remains at Sol (4 Fighters still orbiting)
8. Selection moves to Sol system

---

## Reference Screenshots

![MOO1 Galaxy Map Fleet Deployment](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_fleet_deployment.png)
