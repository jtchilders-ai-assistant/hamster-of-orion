# Travel & Movement

## Overview
Ships travel through hyperspace between star systems. Warp speed (engines) determines travel time. Fuel range (fuel cells) determines maximum distance from colonies.

---

## Hyperspace Travel

**The Habitrail Network** (Lore):
- Ancient One's tubes repurposed
- Hyperspace conduits between systems
- Dimensional travel, not physical

**Gameplay**:
- Select fleet, click destination system
- Fleet travels in straight line
- Takes multiple turns based on distance ÷ warp speed

---

## Warp Speed (Engine Technology)

Engine tech determines parsecs traveled per turn:

| Engine | Warp Speed | Tech Level |
|--------|------------|------------|
| Retro Engines | 1 | Starting |
| Nuclear Engines | 2 | Early |
| Sub-Light Drives | 2 | Early-Mid |
| Fusion Drives | 3 | Mid |
| Impulse Drives | 3 | Mid |
| Ion Drives | 4 | Mid-Late |
| Anti-Matter Drives | 5 | Late |
| Interphased Drives | 6 | Late |
| Hyperdrives | 7 | End-game |
| Hyper-X Drives | 8 | End-game |
| Temporal Drive | 9 | End-game |

**Travel Time**: Distance (parsecs) ÷ Warp Speed = Turns to arrive (rounded up)

**Example**: 12 parsec journey with Warp 4 (Ion) = 3 turns

### Nebula Travel Interference (Mathematical ETA Intersection)

Nebulae are hazardous regions that restrict hyperspace travel. Any portion of a fleet's journey that passes through a nebula is restricted to a maximum speed of **Warp 1**, regardless of the fleet's engine technology.

To calculate the ETA when a travel path intersects a nebula:
1. **Define the Travel Segment**: Let the path from the origin star $P_1$ to destination $P_2$ be a line segment of length $D$.
2. **Define the Nebula**: The nebula is a circle centered at $C$ with radius $R$.
3. **Find Intersections**: Parameterize the segment with $t \in [0, 1]$ where $P(t) = P_1 + t(P_2 - P_1)$. Solve for $t$ where $||P(t) - C||^2 = R^2$ using the quadratic formula.
4. **Calculate Segments**: 
   - If intersections $t_1$ and $t_2$ exist within $[0, 1]$, the distance traveled *inside* the nebula is $D_{neb} = D \times |t_2 - t_1|$.
   - The distance traveled *outside* the nebula is $D_{norm} = D - D_{neb}$.
5. **Calculate ETA**: The total turns required is calculated by applying the normal warp speed ($S$) to the outside distance, and Warp 1 to the inside distance:
   $$ \text{Total Turns} = \lceil \frac{D_{norm}}{S} + \frac{D_{neb}}{1} \rceil $$

*(Note: In MOO1, ships simply moved at 1 parsec per turn while inside the nebula visually, but the math under the hood guarantees the ETA reflects this intersection exactly.)*

---

## Fuel Range (Fuel Cell Technology)

Fuel cells determine maximum distance ships can travel from any friendly colony:

| Fuel Cells | Range (Parsecs) | Tech Level |
|------------|-----------------|------------|
| Hydrogen | 4 | Starting |
| Deuterium | 5 | Early |
| Irridium | 6 | Early-Mid |
| Dotomite Crystals | 7 | Mid |
| Uridium | 8 | Mid |
| Reajax II | 9 | Mid-Late |
| Trilithium Crystals | 10 | Late |
| Thorium Cells | Unlimited | End-game |

**Critical**: Ships cannot travel farther than their fuel range from the nearest friendly colony!

---

## Extending Ship Range

### Reserve Fuel Tanks (Special Equipment)
- +3 parsecs to ship range
- Takes up ship space
- Essential for early exploration

### Extended Fuel Tanks (Special Equipment)  
- +6 parsecs to ship range (replaces Reserve)
- Takes more space
- Good for deep space operations

### Example
- Hydrogen Fuel Cells (Range 4) + Reserve Tanks (+3) = 7 parsec range
- Allows reaching systems 7 parsecs from your colonies

---

## Strategic Movement

### Fleet Staging
- Position fleets at border colonies
- Quick response to threats
- Colonies extend your fuel range

### Invasion Routes
- Plan path to enemy territory
- Need to capture planets along the way
- Each captured planet extends your range

### Getting Stranded
- Ships beyond fuel range cannot move
- Must wait for colony to come to them (capture/colonize nearby)
- Or build ships with longer range to rescue them

---

## Star Gates (Special Technology)

**Intergalactic Star Gates** (Propulsion tech):
- Build gates on two or more colonies (3000 BC each)
- Ships travel instantly between any gated planets
- Ignores fuel range for gate-to-gate travel
- Does NOT increase warp speed

**Strategic Use**:
- Connect distant parts of empire
- Rapid response to invasions
- Move reinforcements instantly

---

## Combat Speed vs Warp Speed

**Warp Speed**: Travel between star systems (map movement)
**Combat Speed**: Movement within tactical combat (see combat-mechanics.md)

These are related but separate:
- Better engines improve both
- Maneuver tech affects combat speed only
- Inertial Stabilizer/Nullifier add combat maneuverability

---

## Special Movement Technologies

### Sub-Space Teleporter (Propulsion)
- Teleport anywhere on combat map
- Grants first initiative in combat
- Does NOT affect map travel

### Displacement Device (Propulsion)
- 33% chance to avoid non-area attacks
- Defensive, not movement related

### Combat Transporters (Propulsion)
- 50% chance troops land before combat
- For planetary invasion, not ship movement

---

## Fleet Organization

**Combined Fleet**: All ships move at slowest ship's warp speed
**Split Fleet**: Divide fast and slow ships
- Scouts can reach destination first
- Capital ships follow

**Strategy**: Don't mix warp speeds unless necessary

---

## Movement UI

**Selecting Destination**:
1. Select fleet on map
2. Click destination system
3. Path shows: turns to arrival, fuel check
4. Confirm or cancel

**Range Indicator**:
- Systems within fuel range: Reachable
- Systems beyond range: Grayed out (unless have tanks)

**ETA Display**:
- Shows turns to arrival
- Updates as you research better engines

---

## Racial Movement Bonuses

**Budgies** (Superior Pilots): 
- No direct warp speed bonus
- Combat speed bonus helps in battle
- Prioritize propulsion research for fleet advantage

**Other Races**: No inherent movement bonuses

---

## Movement and Victory

**Domination**: Mobility essential for conquering
- Faster fleets control engagement timing
- Range limits deep strike options

**Diplomatic**: Mobility less critical
- Population matters more than fleet position
- But still need defense capability

---

## The Orion Journey

**Location**: Near galactic center
**Distance**: Often 30-50+ parsecs from starting position
**Challenge**: May need staging colonies or extended range
**With Thorium Cells**: Can reach from anywhere (unlimited range)

---

Next: See `star-systems.md` for system details.
