# Ship Maintenance & Fleet Costs

## Overview

Ships in Hamster of Orion require ongoing maintenance to operate. Fleet upkeep is a significant economic factor that limits the size of navies empires can sustain. This document specifies exact formulas for ship construction costs, maintenance, scrapping returns, and refit mechanics.

**Key MOO1 Faithful Mechanics:**
- Ships cost BC to build based on components
- All ships have per-turn maintenance costs
- Maintenance scales with ship size and technology
- Scrapping ships returns partial value
- Fleet upkeep can bankrupt empires
- Refitting updates ship designs at reduced cost

---

## Ship Construction Costs

### 1. Base Construction Cost

Ship construction cost is determined by hull size and all installed components:

```
Ship_Cost = Hull_Cost + Engine_Cost + Σ(Weapon_Costs) + Σ(Defense_Costs) + Σ(Special_Costs)
```

#### Hull Base Costs (MOO1 Hull Sizes)

| Hull Size | Base Space | Base Hull Cost | Notes |
|-----------|------------|----------------|-------|
| Small | 25 | 6 BC | Scouts, fighters, colony ships |
| Medium | 70 | 36 BC | Multi-role warships |
| Large | 280 | 200 BC | Heavy warships |
| Huge | 1400 | 1200 BC | Capital ships |

**Note:** Hull cost is the **base cost before adding weapons and special equipment**. Ship systems (engines, shields, computers, ECM, armor, maneuver) are automatic and don't add to cost - they use your best available technology. Space values increase with Construction technology. See `ships/ship-classes.md` for details.

---

### 2. Component Costs

Each component added to a ship increases its cost:

#### Engine Costs

**Canonical values** (see `ships/components-complete.md`):

| Engine Type | Tech Level | Base Cost | Space |
|-------------|------------|-----------|-------|
| Retro Engine | 1 | 10 BC | 25 |
| Nuclear Engine | 5 | 18 BC | 22 |
| Sub-Light Drive | 8 | 25 BC | 20 |
| Fusion Drive | 12 | 35 BC | 18 |
| Impulse Drive | 16 | 45 BC | 17 |
| Ion Drive | 20 | 55 BC | 15 |
| Antimatter Drive | 26 | 70 BC | 14 |
| Interphased Drive | 34 | 90 BC | 12 |
| Hyperdrive | 42 | 120 BC | 11 |
| Hyper-X Drive | 48 | 150 BC | 10 |

#### Weapon Costs (Examples)

| Weapon | Tech Level | Base Cost | Space |
|--------|------------|-----------|-------|
| Laser | 1 | 5 BC | 10 |
| Gatling Laser | 8 | 12 BC | 20 |
| Heavy Laser | 5 | 10 BC | 15 |
| Ion Cannon | 12 | 25 BC | 25 |
| Fusion Beam | 18 | 50 BC | 30 |
| Neutron Blaster | 24 | 80 BC | 40 |
| Plasma Cannon | 30 | 120 BC | 50 |
| Stellar Converter | 45 | 500 BC | 100 |

(See `weapons-complete.md` for full weapon list)

#### Shield Costs

| Shield Type | Tech Level | Base Cost | Space |
|-------------|------------|-----------|-------|
| Class I Deflector | 2 | 15 BC | 10 |
| Class II Deflector | 8 | 30 BC | 15 |
| Class III Deflector | 14 | 50 BC | 20 |
| Class IV Deflector | 20 | 80 BC | 25 |
| Class V Deflector | 28 | 120 BC | 30 |

(See `components-complete.md` for full component list)

---

### 3. Miniaturization Cost Reduction

As technology advances, older components become cheaper:

```
Miniaturized_Cost = Base_Cost × (1 - Miniaturization_Reduction)

Miniaturization_Reduction = (Current_Tier - Component_Tier) × 0.05
Maximum_Reduction = 0.50 (50% off, minimum 50% of base cost)
```

**Example:** A Laser (5 BC, Tier 1) at Tier 10 weapons:
- Reduction: (10 - 1) × 0.05 = 0.45 (45%)
- Miniaturized cost: 5 × (1 - 0.45) = 2.75 BC → **3 BC**

---

### 4. Total Ship Cost Formula

```
Total_Ship_Cost = Hull_Cost + Σ(Component_Costs × Miniaturization_Modifier)
```

**Example Medium Hull Warship:**
- Hull: 36 BC
- 2× Heavy Laser: 2 × 10 = 20 BC
- 1× Nuclear Missile: 8 BC
- Battle Scanner (special): 15 BC
- **Total: 79 BC**

**Note:** Ship systems (engine, shield, computer, ECM, armor, maneuver) are automatic in MOO1 - they don't consume space or add to cost. Only weapons and specials are chosen by the player.

---

## Ship Maintenance

### 5. Per-Turn Maintenance Cost

Every ship requires BC per turn to operate:

```
Ship_Maintenance = Ship_Cost × Maintenance_Rate

Maintenance_Rate = 0.02 (2% of construction cost per turn)
```

**Minimum Maintenance:** 1 BC per ship (no ship is free to maintain).

#### Maintenance by Hull Size (Typical)

| Hull Size | Typical Cost Range | Typical Maintenance |
|-----------|-------------------|---------------------|
| Small | 20-100 BC | 1-2 BC/turn |
| Medium | 80-300 BC | 2-6 BC/turn |
| Large | 300-1,000 BC | 6-20 BC/turn |
| Huge | 1,500-5,000 BC | 30-100 BC/turn |

---

### 6. Fleet Total Maintenance

```
Fleet_Maintenance = Σ(Ship_Maintenance) for all ships in empire
```

**Example Fleet:**
- 20 Small ships (scouts): 20 × 2 = 40 BC/turn
- 15 Medium ships (warships): 15 × 5 = 75 BC/turn
- 5 Large ships (heavy warships): 5 × 15 = 75 BC/turn
- 2 Huge ships (capital ships): 2 × 50 = 100 BC/turn
- **Total Fleet Maintenance: 290 BC/turn**

---

### 7. Maintenance Modifiers

#### Racial Modifiers

| Race | Maintenance Modifier | Notes |
|------|---------------------|-------|
| Ants | 0.75 (25% less) | Hive efficiency |
| Mice | 0.80 (20% less) | Automated systems |
| Hermit Crabs | 0.90 (10% less) | Durable ships |
| Hamsters | 1.00 (baseline) | — |
| Others | 1.00 (baseline) | — |
| Budgies | 1.10 (10% more) | High-performance ships |
| Ferrets | 1.15 (15% more) | Weapon-heavy designs |

#### Technology Modifiers

**Important naming note:** The Construction tech tree contains "Automated Repair Unit" and "Advanced Damage Control" as **in-combat HP regeneration systems** (ships recover % HP per combat round). These are NOT the same as the maintenance modifiers listed below. The maintenance-reducing technologies are separate planetary logistics and logistics automation techs, renamed here to avoid confusion:

| Technology (Logistics) | Construction Tech Level | Effect on Maintenance | Stacking |
|------------------------|------------------------|-----------------------|----------|
| Fleet Logistics I | 14 | -10% fleet maintenance | Multiplicative |
| Fleet Logistics II | 30 | -20% fleet maintenance | Multiplicative |
| Fleet Logistics III | 44 | -30% fleet maintenance | Multiplicative |

**Stacking rule:** These modifiers stack multiplicatively (each applied in sequence):
```
Ship_Maintenance = Base_Maintenance × Racial_Modifier × Fleet_Logistics_I_Mod × Fleet_Logistics_II_Mod × Fleet_Logistics_III_Mod

# Example with all three:
# 100 BC × 0.90 × 0.80 × 0.70 = 50.4 BC (approximately -50% total)
```

With all three Fleet Logistics techs at maximum, total maintenance is approximately **50% of base** (0.9 × 0.8 × 0.7 = 0.504). The modifiers are NOT additive (they do not simply sum to -60%).

**Separate from combat repair:** Automated Repair Unit (+15% HP/turn, Construction TL 14) and Advanced Damage Control (+30% HP/turn, Construction TL 36) are combat-only in-battle recovery systems and have no effect on per-turn maintenance costs.

---

### 8. Maintenance Payment Order

During the maintenance phase:

```
1. Calculate total maintenance required
2. Subtract from empire treasury
3. If treasury goes negative:
   a. Ships are scuttled randomly until balance restored
   b. Morale drops empire-wide
   c. Diplomatic reputation suffers
```

---

## Scrapping Ships

### 9. Scrap Value Formula

Ships can be scrapped to recover some of their construction cost:

```
Scrap_Value = Ship_Cost × Scrap_Rate

Base_Scrap_Rate = 0.25 (25% of construction cost)
```

#### Scrap Rate Modifiers

| Condition | Scrap Rate |
|-----------|------------|
| At friendly planet | 0.25 (25%) |
| At shipyard world | 0.35 (35%) |
| Damaged ship (< 50% HP) | 0.15 (15%) |
| In enemy territory | 0.10 (10%) |
| Self-destruct in combat | 0.00 (0%) |

**Example:** Scrapping a 1,000 BC cruiser at a shipyard:
- Scrap value: 1,000 × 0.35 = **350 BC**

---

### 10. Auto-Scrap (Bankruptcy)

When empire cannot pay maintenance (Empire_Treasury drops below 0):

```
While Empire_Treasury < 0:
    # 1. Scrap Ships first
    If Fleet_Has_Ships:
        Ship = select_oldest_ship()  # deterministic criteria: scrap oldest design first (highest maintenance/value ratio)
        Scrap_Value = Ship.cost × Emergency_Scrap_Rate
        Empire_Treasury += Scrap_Value
        Remove ship from fleet
    # 2. Scrap Missile Bases if no ships remain
    Else If Empire_Has_Missile_Bases:
        Planet = select_poorest_planet_with_bases() # lowest production output
        Scrap 1 Missile Base at Planet
        Empire_Treasury += Base_Scrap_Value (e.g. 25 BC)
        
Emergency_Scrap_Rate = 0.10 (10% - hasty scrapping)
```

---

## Ship Refitting

### 11. Refit Cost Formula

Existing ships can be upgraded to newer designs:

```
Refit_Cost = (New_Design_Cost - Old_Design_Value) × Refit_Rate

Refit_Rate = 0.50 (50% of the difference)
```

**Minimum Refit Cost:** 0 BC (if new design is cheaper, no refund)

#### Refit Restrictions

- Ships must be at a planet with shipyard
- Cannot change hull size (Small → Large impossible)
- Takes time proportional to cost difference
- Ship unavailable during refit

**Example:** Refitting a 400 BC destroyer to a 600 BC design:
- Difference: 600 - 400 = 200 BC
- Refit cost: 200 × 0.50 = **100 BC**

---

### 12. Refit Time

```
Refit_Time = ceil(Refit_Cost / Planet_Production_Per_Turn)
```

**Minimum:** 1 turn for any refit.

---

## Fleet Budget Planning

### 13. Sustainable Fleet Size

To avoid bankruptcy, fleet maintenance should not exceed income:

```
Max_Sustainable_Maintenance = Net_Empire_Income × Safety_Margin

Safety_Margin = 0.50 (spend max 50% of income on fleet)

Max_Fleet_Value = Max_Sustainable_Maintenance / Maintenance_Rate
Max_Fleet_Value = (Net_Income × 0.50) / 0.02
Max_Fleet_Value = Net_Income × 25
```

**Example:** 
- Empire income: 500 BC/turn
- Max fleet maintenance: 500 × 0.50 = 250 BC/turn
- Max fleet value: 250 / 0.02 = **12,500 BC worth of ships**

---

### 14. Fleet-to-Income Ratio

A healthy empire maintains:

```
Fleet_Maintenance / Net_Income < 0.40 (40%)
```

| Ratio | Status |
|-------|--------|
| < 20% | Underbuilt (can afford more ships) |
| 20-40% | Healthy (balanced) |
| 40-60% | Strained (risk of bankruptcy) |
| 60-80% | Critical (one bad turn = scrapping) |
| > 80% | Unsustainable (will collapse) |

---

## Special Costs

### 15. Starbase & Station Costs

Fixed installations have different economics:

| Installation | Construction | Maintenance |
|--------------|--------------|-------------|
| Missile Base | 100 BC | 2 BC/turn |
| Starbase | 300 BC | 5 BC/turn |
| Orbital Station | 800 BC | 15 BC/turn |
| Star Fortress | 2,000 BC | 40 BC/turn |
| Battlestation | 5,000 BC | 100 BC/turn |

**Note:** Defensive installations have lower maintenance than equivalent ships.

---

### 16. Transport Costs

There are two distinct transport classes in the game:

#### A. Population (Colony) Transports
Civilian ships used to move colonists between friendly planets. No combat capability. See `economy/population-growth.md` §7 for usage details.

| Transport Type | Cost | Maintenance | Capacity |
|----------------|------|-------------|----------|
| Colony Transport | 50 BC | 1 BC/turn | 1 million pop |

#### B. Military (Troop) Transports
Military vessels used to carry soldiers for planetary invasion. Have limited self-defense but are primary combat targets.

| Transport Type | Cost | Maintenance | Capacity |
|----------------|------|-------------|----------|
| Light Transport | 50 BC | 1 BC/turn | 5 troops |
| Heavy Transport | 100 BC | 2 BC/turn | 10 troops |
| Assault Transport | 200 BC | 4 BC/turn | 20 troops |

---

## JSON Data Schema

```json
{
  "ship_economics": {
    "maintenance_rate": 0.02,
    "minimum_maintenance": 1,
    "scrap_rate_base": 0.25,
    "scrap_rate_shipyard": 0.35,
    "scrap_rate_damaged": 0.15,
    "scrap_rate_enemy_territory": 0.10,
    "scrap_rate_emergency": 0.10,
    "refit_rate": 0.50
  },

  "hull_costs": [
    { "class": "small",  "space": 25,   "hull_cost": 6 },
    { "class": "medium", "space": 70,   "hull_cost": 36 },
    { "class": "large",  "space": 280,  "hull_cost": 200 },
    { "class": "huge",   "space": 1400, "hull_cost": 1200 }
  ],

  "racial_maintenance_modifiers": {
    "ants": 0.75,
    "mice": 0.80,
    "hermit_crabs": 0.90,
    "hamsters": 1.00,
    "guinea_pigs": 1.00,
    "rats": 1.00,
    "rabbits": 1.00,
    "chameleons": 1.00,
    "budgies": 1.10,
    "ferrets": 1.15
  },

  "maintenance_tech_modifiers": [
    { "tech": "fleet_logistics_1", "construction_tech_level": 14, "modifier": 0.90, "note": "Logistics automation; NOT the same as Automated Repair Unit combat HP regen" },
    { "tech": "fleet_logistics_2", "construction_tech_level": 30, "modifier": 0.80, "note": "Advanced logistics; NOT the same as Advanced Damage Control combat HP regen" },
    { "tech": "fleet_logistics_3", "construction_tech_level": 44, "modifier": 0.70, "note": "Full logistics optimization" }
  ],
  "maintenance_stacking": "multiplicative",

  "defensive_installations": [
    { "type": "missile_base", "cost": 100, "maintenance": 2 },
    { "type": "fighter_base", "cost": 300, "maintenance": 5 },
    { "type": "orbital_station", "cost": 800, "maintenance": 15 },
    { "type": "star_fortress", "cost": 2000, "maintenance": 40 },
    { "type": "battlestation", "cost": 5000, "maintenance": 100 }
  ],

  "population_transports": [
    { "type": "colony_transport", "cost": 50, "maintenance": 1, "capacity_millions": 1 }
  ],

  "troop_transports": [
    { "type": "light_transport", "cost": 50, "maintenance": 1, "capacity_troops": 5 },
    { "type": "heavy_transport", "cost": 100, "maintenance": 2, "capacity_troops": 10 },
    { "type": "assault_transport", "cost": 200, "maintenance": 4, "capacity_troops": 20 }
  ],

  "budget_guidelines": {
    "max_fleet_ratio": 0.40,
    "safety_margin": 0.50,
    "underbuilt_threshold": 0.20,
    "strained_threshold": 0.60,
    "critical_threshold": 0.80
  }
}
```

---

## Algorithm: Calculate Fleet Maintenance

```pseudocode
function calculate_fleet_maintenance(empire):
    total_maintenance = 0
    
    for ship in empire.ships:
        # Base maintenance
        ship_maintenance = ship.construction_cost * 0.02
        
        # Apply racial modifier
        racial_mod = get_racial_maintenance_modifier(empire.race)
        ship_maintenance *= racial_mod
        
        # Apply tech modifiers
        for tech in empire.maintenance_techs:
            ship_maintenance *= tech.modifier
        
        # Minimum 1 BC
        ship_maintenance = max(ship_maintenance, 1)
        
        total_maintenance += ship_maintenance
    
    # Add defensive installation maintenance
    for planet in empire.planets:
        for installation in planet.defensive_installations:
            total_maintenance += installation.maintenance
    
    return total_maintenance

function process_maintenance_phase(empire):
    maintenance = calculate_fleet_maintenance(empire)
    
    empire.treasury -= maintenance
    
    # Check for bankruptcy
    if empire.treasury < 0:
        handle_bankruptcy(empire)
    
    return maintenance

function handle_bankruptcy(empire):
    while empire.treasury < 0:
        # Select ship to scrap (oldest or weakest)
        ship = select_ship_to_scrap(empire)
        
        if ship == None:
            # No ships left - empire collapse
            trigger_empire_collapse(empire)
            return
        
        # Emergency scrap value
        scrap_value = ship.construction_cost * 0.10
        
        empire.treasury += scrap_value
        remove_ship(empire, ship)
        
        # Apply penalties
        empire.morale -= 5
        empire.diplomatic_reputation -= 10
        
        notify_player("Ship " + ship.name + " scrapped due to bankruptcy!")
```

---

## Algorithm: Calculate Refit Cost

```pseudocode
function calculate_refit_cost(old_design, new_design):
    # Cannot change hull class
    if old_design.hull_class != new_design.hull_class:
        return INVALID_REFIT
    
    cost_difference = new_design.cost - old_design.cost
    
    if cost_difference <= 0:
        # Downgrade - no cost, but no refund either
        return 0
    
    refit_cost = cost_difference * 0.50
    
    return refit_cost

function calculate_refit_time(refit_cost, planet):
    production_per_turn = calculate_planetary_production(planet)
    
    if production_per_turn <= 0:
        return INFINITE
    
    turns = ceil(refit_cost / production_per_turn)
    
    return max(turns, 1)  # Minimum 1 turn
```

---

## Worked Examples

### Example 1: Fleet Maintenance Calculation

**Empire Setup:**
- Race: Hamsters (1.0 modifier)
- No maintenance tech
- Fleet:
  - 10 Small ships (50 BC each)
  - 20 Medium ships (200 BC each)
  - 5 Large ships (800 BC each)

**Calculation:**
1. Small ship maintenance: 50 × 0.02 = 1 BC each → 10 × 1 = 10 BC
2. Medium ship maintenance: 200 × 0.02 = 4 BC each → 20 × 4 = 80 BC
3. Large ship maintenance: 800 × 0.02 = 16 BC each → 5 × 16 = 80 BC
4. **Total: 280 BC/turn**

---

### Example 2: Ants Fleet Advantage

**Same fleet as above, but Ants (0.75 modifier):**

1. Small: 1 × 0.75 = 0.75 → 1 BC × 10 = 10 BC
2. Medium: 4 × 0.75 = 3 BC × 20 = 60 BC
3. Large: 16 × 0.75 = 12 BC × 5 = 60 BC
4. **Total: 215 BC/turn** (vs 280 BC for Hamsters)

Ants save 65 BC/turn on the same fleet!

---

### Example 3: Scrapping for Emergency Funds

**Situation:**
- Treasury: -50 BC (bankruptcy)
- Own a 2,000 BC Huge ship

**Options:**
1. Emergency scrap (10%): 2,000 × 0.10 = 200 BC
2. Fly to shipyard, then scrap (35%): 2,000 × 0.35 = 700 BC

**Decision:** If time permits, fly to shipyard for 500 BC more value.

---

### Example 4: Refit Analysis

**Old Design:** Medium warship with Laser weapons (150 BC)
**New Design:** Medium warship with Ion Cannons (250 BC)

**Refit Cost:**
1. Difference: 600 - 400 = 200 BC
2. Refit cost: 200 × 0.50 = **100 BC**

**Comparison:**
- Refit: 100 BC
- Build new + scrap old: 600 BC - (400 × 0.25) = 500 BC

**Refit is 400 BC cheaper!**

---

### Example 5: Sustainable Fleet Planning

**Empire Income:** 400 BC/turn (net)

**Calculation:**
1. Safe fleet budget: 400 × 0.40 = 160 BC/turn maintenance
2. Max fleet value: 160 / 0.02 = 8,000 BC
3. Can sustain: ~8 Large ships OR ~20 Medium ships OR mix

**Reality Check:**
- Building 10 Large ships (8,000 BC value) = 160 BC/turn maintenance
- That's 50% of income - strained but sustainable short-term

---

## Edge Cases

### Zero Maintenance Ships
No ship can have 0 maintenance. Minimum is 1 BC/turn.

### Captured Ships
Captured enemy ships use YOUR maintenance modifiers, not the original owner's.

### Ships in Transit
Ships in hyperspace still require maintenance.

### Disabled Ships
Damaged/disabled ships still require maintenance until scrapped.

### Gifted Ships (Diplomacy)
Ships received through diplomacy:
- Arrive at no construction cost
- Immediately require maintenance
- Use your maintenance modifiers

### Ancient Ships (Orion Guardian)
If you defeat the Guardian and capture Ancient ships:
- Very high construction value (for scrap purposes)
- Standard maintenance rate applies
- Cannot be refitted (alien technology)

---

## Difficulty Modifiers

| Difficulty | Player Maintenance | AI Maintenance |
|------------|-------------------|----------------|
| Simple | 0.75 (25% less) | 1.25 (25% more) |
| Easy | 0.90 (10% less) | 1.10 (10% more) |
| Average | 1.00 (baseline) | 1.00 (baseline) |
| Hard | 1.10 (10% more) | 0.90 (10% less) |
| Impossible | 1.25 (25% more) | 0.75 (25% less) |

---

## UI Recommendations

### Fleet Management Screen
Display:
- Total fleet value (BC)
- Total fleet maintenance (BC/turn)
- Maintenance as % of income
- Warning if > 40% of income

### Ship Info Panel
Display:
- Construction cost
- Maintenance cost per turn
- Scrap value (current location)
- Refit options available

### Budget Warnings
- Yellow warning at 40% maintenance ratio
- Red warning at 60% maintenance ratio
- Auto-pause at 80% (impending bankruptcy)

---

## Related Documents

- `factory-formulas.md` - Production capacity for building
- `slider-mathematics.md` - SHIP slider allocation
- `../ships/ship-classes.md` - Ship class details
- `../ships/ship-design.md` - Ship component costs
- `../game-mechanics/turn-structure.md` - Maintenance phase timing

---

*Last Updated: 2026-03-21*
*Specification: spec-005 - Ship Maintenance & Fleet Costs*
