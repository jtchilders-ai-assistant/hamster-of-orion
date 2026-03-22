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

#### Hull Base Costs

| Ship Class | Space | Base Hull Cost |
|------------|-------|----------------|
| Scout | 50 | 25 BC |
| Fighter | 100 | 40 BC |
| Destroyer | 250 | 80 BC |
| Cruiser | 500 | 150 BC |
| Battle Cruiser | 1,000 | 300 BC |
| Dreadnought | 1,500 | 500 BC |
| Titan | 2,500 | 1,000 BC |

**Note:** Hull cost is a base minimum before components are added.

---

### 2. Component Costs

Each component added to a ship increases its cost:

#### Engine Costs

| Engine Type | Tech Level | Base Cost | Space |
|-------------|------------|-----------|-------|
| Retro Engine | 1 | 10 BC | 20 |
| Nuclear Engine | 4 | 18 BC | 18 |
| Fusion Engine | 10 | 30 BC | 16 |
| Ion Engine | 16 | 48 BC | 14 |
| Antimatter Engine | 22 | 75 BC | 12 |
| Interphased Engine | 30 | 110 BC | 11 |
| Hyperdrive | 40 | 160 BC | 10 |

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
Maximum_Reduction = 0.80 (80% off, minimum 20% of base cost)
```

**Example:** A Laser (5 BC, Tier 1) at Tier 10 weapons:
- Reduction: (10 - 1) × 0.05 = 0.45 (45%)
- Miniaturized cost: 5 × (1 - 0.45) = 2.75 BC → **3 BC**

---

### 4. Total Ship Cost Formula

```
Total_Ship_Cost = Hull_Cost + Σ(Component_Costs × Miniaturization_Modifier)
```

**Example Destroyer:**
- Hull: 80 BC
- Ion Engine: 48 BC
- 2× Heavy Laser: 2 × 10 = 20 BC
- Class II Deflector: 30 BC
- Battle Computer II: 15 BC
- ECM Jammer I: 12 BC
- **Total: 205 BC**

---

## Ship Maintenance

### 5. Per-Turn Maintenance Cost

Every ship requires BC per turn to operate:

```
Ship_Maintenance = Ship_Cost × Maintenance_Rate

Maintenance_Rate = 0.02 (2% of construction cost per turn)
```

**Minimum Maintenance:** 1 BC per ship (no ship is free to maintain).

#### Maintenance by Ship Class (Typical)

| Ship Class | Typical Cost | Typical Maintenance |
|------------|--------------|---------------------|
| Scout | 75 BC | 1-2 BC/turn |
| Fighter | 150 BC | 3 BC/turn |
| Destroyer | 400 BC | 8 BC/turn |
| Cruiser | 1,000 BC | 20 BC/turn |
| Battle Cruiser | 2,500 BC | 50 BC/turn |
| Dreadnought | 5,000 BC | 100 BC/turn |
| Titan | 15,000 BC | 300 BC/turn |

---

### 6. Fleet Total Maintenance

```
Fleet_Maintenance = Σ(Ship_Maintenance) for all ships in empire
```

**Example Fleet:**
- 20 Scouts: 20 × 2 = 40 BC/turn
- 30 Fighters: 30 × 3 = 90 BC/turn
- 15 Destroyers: 15 × 8 = 120 BC/turn
- 5 Cruisers: 5 × 20 = 100 BC/turn
- **Total Fleet Maintenance: 350 BC/turn**

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

| Technology | Effect |
|------------|--------|
| Automated Repair | -10% maintenance |
| Advanced Damage Control | -20% maintenance |
| Self-Repairing Hull | -30% maintenance |

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

When empire cannot pay maintenance:

```
While Empire_Treasury < 0:
    Ship = select_random_ship()  # Or oldest/weakest
    Scrap_Value = Ship.cost × Emergency_Scrap_Rate
    Empire_Treasury += Scrap_Value
    Remove ship from fleet
    
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
- Cannot change hull size (Scout → Cruiser impossible)
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
| Missile Base | 150 BC | 2 BC/turn |
| Fighter Base | 300 BC | 5 BC/turn |
| Orbital Station | 800 BC | 15 BC/turn |
| Star Fortress | 2,000 BC | 40 BC/turn |
| Battlestation | 5,000 BC | 100 BC/turn |

**Note:** Defensive installations have lower maintenance than equivalent ships.

---

### 16. Transport Costs

Troop transports have minimal combat value but strategic importance:

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
    { "class": "scout", "space": 50, "hull_cost": 25 },
    { "class": "fighter", "space": 100, "hull_cost": 40 },
    { "class": "destroyer", "space": 250, "hull_cost": 80 },
    { "class": "cruiser", "space": 500, "hull_cost": 150 },
    { "class": "battle_cruiser", "space": 1000, "hull_cost": 300 },
    { "class": "dreadnought", "space": 1500, "hull_cost": 500 },
    { "class": "titan", "space": 2500, "hull_cost": 1000 }
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
    { "tech": "automated_repair", "modifier": 0.90 },
    { "tech": "advanced_damage_control", "modifier": 0.80 },
    { "tech": "self_repairing_hull", "modifier": 0.70 }
  ],

  "defensive_installations": [
    { "type": "missile_base", "cost": 150, "maintenance": 2 },
    { "type": "fighter_base", "cost": 300, "maintenance": 5 },
    { "type": "orbital_station", "cost": 800, "maintenance": 15 },
    { "type": "star_fortress", "cost": 2000, "maintenance": 40 },
    { "type": "battlestation", "cost": 5000, "maintenance": 100 }
  ],

  "transports": [
    { "type": "light_transport", "cost": 50, "maintenance": 1, "capacity": 5 },
    { "type": "heavy_transport", "cost": 100, "maintenance": 2, "capacity": 10 },
    { "type": "assault_transport", "cost": 200, "maintenance": 4, "capacity": 20 }
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
  - 10 Scouts (75 BC each)
  - 20 Destroyers (400 BC each)
  - 5 Cruisers (1,000 BC each)

**Calculation:**
1. Scout maintenance: 75 × 0.02 = 1.5 → 2 BC each → 10 × 2 = 20 BC
2. Destroyer maintenance: 400 × 0.02 = 8 BC each → 20 × 8 = 160 BC
3. Cruiser maintenance: 1,000 × 0.02 = 20 BC each → 5 × 20 = 100 BC
4. **Total: 280 BC/turn**

---

### Example 2: Ants Fleet Advantage

**Same fleet as above, but Ants (0.75 modifier):**

1. Scout: 2 × 0.75 = 1.5 → 2 BC × 10 = 20 BC
2. Destroyer: 8 × 0.75 = 6 BC × 20 = 120 BC
3. Cruiser: 20 × 0.75 = 15 BC × 5 = 75 BC
4. **Total: 215 BC/turn** (vs 280 BC for Hamsters)

Ants save 65 BC/turn on the same fleet!

---

### Example 3: Scrapping for Emergency Funds

**Situation:**
- Treasury: -50 BC (bankruptcy)
- Own a 2,000 BC Battle Cruiser

**Options:**
1. Emergency scrap (10%): 2,000 × 0.10 = 200 BC
2. Fly to shipyard, then scrap (35%): 2,000 × 0.35 = 700 BC

**Decision:** If time permits, fly to shipyard for 500 BC more value.

---

### Example 4: Refit Analysis

**Old Design:** Destroyer with Laser weapons (400 BC)
**New Design:** Destroyer with Ion Cannons (600 BC)

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
3. Can sustain: ~8 Cruisers OR ~20 Destroyers OR mix

**Reality Check:**
- Building 10 Cruisers (10,000 BC value) = 200 BC/turn maintenance
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
