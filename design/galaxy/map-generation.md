# Galaxy Map Generation

## Overview
The galaxy is procedurally generated at game start. Each game creates a unique star map with 24-108 systems depending on galaxy size.

---

## Galaxy Size Options

| Size | Stars | Recommended Players |
|------|-------|---------------------|
| Small | 24 | 2-4 races |
| Medium | 48 | 4-6 races |
| Large | 70 | 6-8 races |
| Huge | 108 | 8-10 races |

---

## Map Shape

**2D Rectangular Grid**: Stars are distributed across a coordinate space.
- X and Y positions for each star
- Orion system placed near center
- Homeworlds distributed around edges for fairness

---

## Generation Steps

### Step 1: Place Stars
- Stars placed with minimum distance between them
- Total count based on galaxy size
- Assign star color: Yellow, Green, Red, Blue, White, Purple

### Step 2: Assign Planets
- Each star gets exactly one planet
- Environment determined by star color + random roll
- Size (Tiny to Huge) assigned randomly
- Mineral richness assigned (Ultra Poor to Ultra Rich)

### Step 3: Place Special Systems
- **Orion**: Near galactic center, guarded by Guardian
- **Artifacts**: 2-6 systems with ancient technology (one-time tech bonus when colonized)

### Step 4: Place Nebulae
- 1-5 nebula regions depending on galaxy size
- Stars inside nebulae have special combat rules (no shields)

### Step 5: Starting Positions
- Homeworlds distributed for fair start
- Maximum distance between player homeworlds
- Each player starts with:
  - 1 Homeworld (Terran, good size)
  - 2 Scout ships
  - 1 Colony ship

---

## Fairness Balancing

**Starting Position Rules**:
- Homeworlds are always highly habitable
- Each player has similar nearby colonization options
- No player starts adjacent to Orion

---

## See Also

- `generation-algorithm.md` - Full technical specification
- `star-systems.md` - Star and planet details
- `space-regions.md` - Regional gameplay zones
