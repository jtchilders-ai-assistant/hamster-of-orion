# Fleet Deployment Panel - MOO1-Accurate Specification

## Overview

The Fleet Deployment panel appears in the **right-side info panel** of the Galaxy Map when a fleet orbiting a system is selected. This panel allows the player to select which ships to deploy to a new destination.

**Trigger**: Click on a fleet icon at a star system (not in transit)

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
│   │  12 │ │   4 │       │  ← Ship count in corner
│   └─────┘ └─────┘       │
│   << < 12 > >>          │  ← Deployment controls
│   << <  4 > >>          │
│                         │
│   ┌─────┐ ┌─────┐       │
│   │     │ │     │       │  ← Empty slots (up to 5 total)
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
│   │  ETA: -- turns  │   │  ← Green text, shows ETA after
│   │                 │   │    destination selected
│   └─────────────────┘   │
│                         │
│   [CANCEL]   [ACCEPT]   │  ← ACCEPT disabled until
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
│           12  │  ← Total ships of this type in orbit
└───────────────┘
   << < 12 > >>    ← Deployment count controls
```

### Ship Count Display
- Bottom-right corner of each ship image shows **total ships of that type** in orbit
- This number represents the fleet's current composition

### Deployment Controls
Below each ship image are selection buttons:

| Button | Action |
|--------|--------|
| `<<` | Set deployment count to 0 (leave all behind) |
| `<` | Decrease deployment count by 1 |
| `[number]` | Current deployment count (how many will travel) |
| `>` | Increase deployment count by 1 |
| `>>` | Set deployment count to maximum (deploy all) |

**Default State**: All ships are selected for deployment (count = total)

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
- **ACCEPT button** becomes enabled (was disabled before destination selected)

### Step 4: Confirm Deployment
- Click **ACCEPT** to confirm the deployment
- Click **CANCEL** to abort and return to normal selection

---

## After Accepting Deployment

### Fleet Icons Update

**Departing Fleet Icon**:
- A new ship icon appears to the **LEFT** of the origin system
- This represents the fleet that is now departing/in transit
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
- After clicking ACCEPT, selection automatically moves to the **origin system** (not the departing fleet)
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
- **Disabled** (grayed out) until a destination is selected
- **Enabled** once a valid destination star is clicked
- Clicking confirms the deployment and sends ships

---

## Example Scenarios

### Scenario 1: Deploy All Ships
1. Click fleet icon at Sol (has 12 Scouts, 4 Fighters)
2. Fleet Deployment panel shows: Scouts [12], Fighters [4]
3. Click destination star Altair
4. Green line appears, ETA shows "3 turns"
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

## Visual Reference

See `design/moo_screens/` for reference screenshots showing:
- Fleet selection with deployment panel
- Ship count displays
- Deployment controls
- ETA display after destination selection
