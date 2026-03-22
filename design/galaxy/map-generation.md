# Galaxy Map Generation

## Overview
The galaxy is procedurally generated at game start. Each game creates a unique star map with 24-108 systems depending on galaxy size.

---

## Galaxy Size Options

### Small (24 stars)
**Standard**: Minimum size, fast play.
**Players**: 2-4 races.

### Medium (48 stars)
**Standard**: Balanced game length.
**Players**: 4-6 races.

### Large (70 stars)
**Standard**: Broad expansion opportunities.
**Players**: 6-10 races.

### Huge (108 stars)
**Standard**: Epic scale, long-term strategic depth.
**Players**: 10 races.

---

## Map Shape

### Square Grid (Default)
**MOO1 Classic**: Systems are distributed across a rectangular coordinate system.
**Orion**: Usually near the center but not strictly fixed to the exact centroid.

---

## Generation Algorithm

### Step 1: Place Stars
- Stars are placed randomly with a minimum distance between them.
- Total count based on galaxy size (24, 48, 70, 108).
- Assign star color (Yellow, Green, Red, Blue, White, Purple).

### Step 2: Assign Planets
- Each star system is assigned exactly one habitable planet.
- Environment type and mineral richness determined by star color and random rolls.

### Step 3: Place Special Systems
- **Orion**: One system designated as Orion, guarded by the Guardian.
- **Artifacts**: 2-4 systems designated as Artifacts worlds (Research x2).

### Step 4: Starting Positions
- Homeworlds are distributed to ensure a fair start.
- Players start with:
  - 1 Homeworld (Terran, typically Large/Huge).
  - 2 Scout ships.
  - 1 Colony ship.
- Distance between homeworlds is maximized within constraints.

### Step 5: Nebulas
- Areas of the map designated as nebulas.
- Affects ship speed (Warp 1) and combat (No shields).

---

## Starting Positions Balance

**Fair Start Algorithm**:
1. Maximize distance between player homeworlds.
2. Homeworlds are always highly habitable (Terran).
3. Ensure initial star systems within reach are not all extremely hostile.

---

## Web Implementation Notes

**2D Map Display**:
- Canvas or SVG rendering.
- MOO1 aesthetic: Black background, colored stars, range circles.
- Hover details for explored stars.

---

Next: See `star-systems.md` for system composition details.
