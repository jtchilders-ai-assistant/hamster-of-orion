# Planetary Slider Mathematics

## Overview

The five-slider system is the heart of planetary management in Hamster of Orion. Each slider allocates a percentage of the planet's production capacity to different outputs. This document specifies exact formulas for how slider percentages convert to actual output, slider interactions, and resource overflow mechanics.

**Key MOO1 Faithful Mechanics:**
- Five sliders must sum to 100% (or less)
- Production capacity is shared across all sliders
- Excess allocation to completed projects goes to Reserve
- Ecology must be satisfied before other production is effective
- Each slider has different output formulas

---

## The Five Sliders

| Slider | Purpose | Output Type |
|--------|---------|-------------|
| SHIP | Build spacecraft | BC toward ship construction |
| DEF | Build missile bases & shields | BC toward defenses |
| IND | Build factories | BC toward factory construction |
| ECO | Cleanup pollution & terraform | BC toward ecology |
| TECH | Research technologies | Scientists (converts to RP) |

---

## Core Formula: Production Allocation

### 1. Total Planetary Production

First, calculate the planet's total production capacity:

```
Total_Production = Factory_Production + Population_Production

Where:
  Factory_Production = Operating_Factories × 1.0 × Racial_Production_Modifier
  Population_Production = Population × 0.5 × Racial_Production_Modifier
```

(See `factory-formulas.md` for detailed production calculations)

---

### 2. Slider Allocation

Each slider receives a percentage of total production:

```
Slider_Allocation[X] = Total_Production × (Slider_Percentage[X] / 100)
```

**Constraint:** All slider percentages must sum to exactly 100%.

```
SHIP% + DEF% + IND% + ECO% + TECH% = 100%
```

---

## Individual Slider Formulas

### 3. SHIP Slider (Ship Construction)

Converts production to BC toward the current ship build queue:

```
Ship_BC = Total_Production × (SHIP% / 100)
```

#### Ship Construction Progress

```
Ship_Progress += Ship_BC

If Ship_Progress >= Ship_Cost:
    Ship_Completed = True
    Ship_Progress -= Ship_Cost
    # Overflow applies to next ship in queue
```

#### Turns to Complete

```
Turns_Remaining = ceil((Ship_Cost - Ship_Progress) / Ship_BC_Per_Turn)
```

**Edge Case:** If no ship is in the build queue, Ship BC goes to **Empire Reserve**.

---

### 4. DEF Slider (Planetary Defenses)

Converts production to BC toward missile bases and planetary shields:

```
Defense_BC = Total_Production × (DEF% / 100)
```

#### Defense Priority Order

1. **Missile Bases** (until max reached)
2. **Planetary Shield** (if not built)
3. **Shield Upgrade** (if better shield tech available)
4. **Missile Base Refit** (upgrade existing bases to new tech)
5. **Reserve** (if all defenses maxed)

#### Missile Base Construction

```
Missile_Base_Cost = 100 BC (base) # Canonical: design/economy/slider-mathematics.md
Missile_Base_Cost = 100 × (1 + 0.1 × Tech_Level_Bonus) # Scales with tech

Bases_Built = floor((Defense_BC + Base_Progress) / Missile_Base_Cost)
Base_Progress = (Defense_BC + Old_Progress) mod Missile_Base_Cost
```

#### Maximum Missile Bases

```
Max_Missile_Bases = 10 + (Population / 10)  # Base formula
Max_Missile_Bases = min(Max_Missile_Bases, 50)  # Hard cap
```

#### Planetary Shield Construction

| Shield Level | Cost | Tech Level | Absorbs per Turn |
|--------------|------|------------|------------------|
| Class V | 500 BC | 6 | 5 damage |
| Class X | 1000 BC | 16 | 10 damage |
| Class XV | 2000 BC | 26 | 15 damage |
| Class XX | 4000 BC | 36 | 20 damage |

---

### 5. IND Slider (Industry/Factories)

Converts production to BC toward factory construction:

```
Industry_BC = Total_Production × (IND% / 100)
```

#### Factory Construction

```
Factory_Cost = Base_Cost - Industrial_Tech_Reduction  # 10 BC down to 2 BC

Factories_Built = floor((Industry_BC + Factory_Progress) / Factory_Cost)
Factory_Progress = (Industry_BC + Old_Progress) mod Factory_Cost
```

#### Maximum Factories

```
Max_Factories = Max_Population × Robotic_Controls_Level
```

**When Max Reached:** Excess Industry BC goes to **Empire Reserve**.

---

### 6. ECO Slider (Ecology)

The ECO slider is **special** - it has mandatory requirements before other sliders work efficiently.

```
Ecology_BC = Total_Production × (ECO% / 100)
```

#### ECO Priority Order

1. **Pollution Cleanup** (MANDATORY - must be satisfied first)
2. **Terraforming** (increase max population)
3. **Population Growth Bonus** (accelerate natural growth)
4. **Reserve** (if all ecology complete)

#### Pollution Cleanup Requirement

```
Pollution_Generated = Operating_Factories × Waste_Rate
Cleanup_Cost = Pollution_Generated × Base_Cleanup_Cost × Eco_Restoration_Modifier

Where:
  Base_Cleanup_Cost = 0.5 BC per pollution unit
  Eco_Restoration_Modifier = 1.0 to 0.0 (based on tech)
```

**CRITICAL:** If ECO allocation < Cleanup_Cost:
- Pollution accumulates
- Population capacity decreases
- Morale drops
- Planet becomes "polluted" (visible debuff)

```
Pollution_Deficit = Cleanup_Cost - Ecology_BC
Accumulated_Pollution += Pollution_Deficit

If Accumulated_Pollution > Threshold:
    Max_Population -= 1 (per 10 pollution accumulated)
```

#### Terraforming Spending

After cleanup is satisfied:

```
Terraform_BC = Ecology_BC - Cleanup_Cost

Terraform_Progress += Terraform_BC

Terraform_Cost = 5 BC per +1 max population

If Terraform_Progress >= Terraform_Cost:
    Current_Terraform_Level += 1
    Terraform_Progress -= Terraform_Cost
```

**Maximum Terraforming:** Limited by your Terraforming tech level.

#### Population Growth Bonus

After terraforming is maxed:

```
Growth_Bonus_BC = Ecology_BC - Cleanup_Cost

Growth_Bonus_Pop = floor(Growth_Bonus_BC / 20)  # 20 BC = +1 pop
```

This adds directly to population (instant growth, not natural growth).

---

### 7. TECH Slider (Research)

The TECH slider works differently - it allocates **population as scientists**, not BC:

```
Scientists = Population × (TECH% / 100)
```

Scientists then generate Research Points:

```
Planet_RP = Scientists × 1.0 × Lab_Multiplier × Racial_Modifier
```

(See `research-formulas.md` for detailed RP calculations)

**Note:** The TECH slider does NOT consume production BC. It converts population from workers to scientists.

---

## Slider Interactions

### 8. Production vs. Research Split

The slider system creates a fundamental trade-off:

```
Workers = Population × ((100 - TECH%) / 100)
Scientists = Population × (TECH% / 100)

Production is based on Workers (implicitly through factory operation).
Research is based on Scientists.
```

**Clarification:** In MOO1 style, the TECH slider determines what percentage of population are scientists vs. workers. The other four sliders (SHIP, DEF, IND, ECO) divide the *production* generated by workers and factories.

---

### 9. Effective Allocation Model

```
# Step 1: Determine scientist/worker split
Scientists = Population × (TECH% / 100)
Workers = Population - Scientists

# Step 2: Calculate production from workers + factories
# (Factories need workers to operate)
Operable_Factories = min(Factories, Workers × Robotic_Controls_Level)
Production = (Operable_Factories × 1.0 + Workers × 0.5) × Racial_Modifier

# Step 3: Allocate production across SHIP/DEF/IND/ECO
# Note: These four sliders should sum to (100 - TECH%)
Effective_SHIP% = SHIP%  # These are percentages of total
Effective_DEF% = DEF%
Effective_IND% = IND%
Effective_ECO% = ECO%

Ship_BC = Production × (SHIP% / (100 - TECH%)) if TECH% < 100 else 0
# etc.
```

**Alternative Interpretation (Simpler):**

All five sliders divide 100% of the planet's attention:
- TECH% goes to research (scientists)
- Remaining (100 - TECH%) of production goes to SHIP/DEF/IND/ECO

---

### 10. Lock Slider Functionality

Players can "lock" sliders to prevent automatic adjustment:

```
If Slider_Locked[X]:
    Slider_Percentage[X] = Locked_Value
    # Other sliders adjust around this
```

When unlocking or adjusting, other unlocked sliders redistribute proportionally.

---

## Reserve Fund Mechanics

### 11. Empire Reserve

The Reserve is a global pool of BC that can be spent anywhere:

```
Empire_Reserve += Overflow_From_All_Planets
```

#### Sources of Reserve BC

| Source | Condition |
|--------|-----------|
| SHIP overflow | Ship queue empty, no ships to build |
| DEF overflow | Defenses maxed (bases + shield) |
| IND overflow | Factories at maximum |
| ECO overflow | Pollution clean, terraform maxed, pop maxed |
| TECH overflow | N/A (never overflows) |

#### Using Reserve

Reserve can be applied to any planet's production:

```
Effective_Production = Planet_Production + Reserve_Allocation

Reserve_Slider% determines how much reserve is spent empire-wide.
```

#### Reserve Transfer (Per Planet)

```
Reserve_To_Planet = min(Empire_Reserve, Planet_Need)
Planet_Need = Max_Useful_Production - Current_Production
```

---

## Auto-Adjustment Rules

### 12. Governor AI Slider Adjustment

When planetary governor is enabled, sliders auto-adjust:

```
Priority_Order:
1. ECO → Maintain minimum for pollution cleanup
2. IND → Build factories until maxed
3. DEF → Build defenses on border worlds
4. SHIP → Build ships on production worlds
5. TECH → Research on safe interior worlds
```

#### Planet Role Detection

```
If planet.is_border_world:
    Focus: DEF, SHIP
Else if planet.factories < planet.max_factories:
    Focus: IND
Else if planet.is_research_focused:
    Focus: TECH
Else:
    Focus: SHIP (contribute to fleet)
```

---

## JSON Data Schema

```json
{
  "slider_system": {
    "slider_count": 5,
    "slider_names": ["SHIP", "DEF", "IND", "ECO", "TECH"],
    "total_percentage": 100,
    "minimum_eco_for_cleanup": true
  },

  "ship_slider": {
    "output_type": "bc_to_shipyard",
    "overflow_destination": "reserve",
    "can_rush": true,
    "rush_cost_multiplier": 2.0
  },

  "defense_slider": {
    "output_type": "bc_to_defenses",
    "overflow_destination": "reserve",
    "priority_order": ["missile_bases", "planetary_shield", "shield_upgrade", "base_refit"],
    "missile_base_cost": 100,
    "max_bases_formula": "10 + (population / 10)",
    "max_bases_cap": 50
  },

  "industry_slider": {
    "output_type": "bc_to_factories",
    "overflow_destination": "reserve",
    "factory_base_cost": 10,
    "factory_min_cost": 2
  },

  "ecology_slider": {
    "output_type": "bc_to_ecology",
    "priority_order": ["pollution_cleanup", "terraforming", "population_boost", "reserve"],
    "cleanup_cost_per_pollution": 0.5,
    "terraform_cost_per_pop": 5,
    "growth_boost_cost_per_pop": 20,
    "mandatory_cleanup": true
  },

  "tech_slider": {
    "output_type": "population_to_scientists",
    "overflow_destination": null,
    "affects_production": true
  },

  "planetary_shields": [
    { "level": "class_v", "cost": 500, "tech_level": 6, "absorbs": 5 },
    { "level": "class_x", "cost": 1000, "tech_level": 16, "absorbs": 10 },
    { "level": "class_xv", "cost": 2000, "tech_level": 26, "absorbs": 15 },
    { "level": "class_xx", "cost": 4000, "tech_level": 36, "absorbs": 20 }
  ],

  "reserve_system": {
    "global_pool": true,
    "sources": ["ship_overflow", "def_overflow", "ind_overflow", "eco_overflow"],
    "can_distribute_to_planets": true,
    "reserve_slider_exists": true
  }
}
```

---

## Algorithm: Process Planetary Sliders

```pseudocode
function process_planetary_turn(planet, empire):
    # Step 1: Calculate scientist/worker split
    tech_percent = planet.sliders.TECH
    scientists = floor(planet.population * tech_percent / 100)
    workers = planet.population - scientists
    
    # Step 2: Calculate production capacity
    operable_factories = min(planet.factories, workers * empire.robotic_controls_level)
    racial_mod = get_racial_production_modifier(empire.race)
    production = (operable_factories * 1.0 + workers * 0.5) * racial_mod
    
    # Step 3: Calculate slider BC allocations
    remaining_percent = 100 - tech_percent
    if remaining_percent > 0:
        ship_bc = production * (planet.sliders.SHIP / remaining_percent)
        def_bc = production * (planet.sliders.DEF / remaining_percent)
        ind_bc = production * (planet.sliders.IND / remaining_percent)
        eco_bc = production * (planet.sliders.ECO / remaining_percent)
    else:
        ship_bc = def_bc = ind_bc = eco_bc = 0
    
    # Step 4: Process ECO first (mandatory cleanup)
    eco_result = process_ecology(planet, empire, eco_bc)
    if eco_result.pollution_deficit > 0:
        planet.accumulated_pollution += eco_result.pollution_deficit
        apply_pollution_penalties(planet)
    
    # Step 5: Process IND (factory building)
    ind_result = process_industry(planet, empire, ind_bc)
    empire.reserve += ind_result.overflow
    
    # Step 6: Process DEF (missile bases and shields)
    def_result = process_defense(planet, empire, def_bc)
    empire.reserve += def_result.overflow
    
    # Step 7: Process SHIP (ship construction)
    ship_result = process_shipyard(planet, empire, ship_bc)
    empire.reserve += ship_result.overflow
    
    # Step 8: Generate research points from scientists
    rp = calculate_planet_rp(scientists, planet, empire)
    empire.research_pool += rp
    
    return {
        production: production,
        scientists: scientists,
        rp_generated: rp,
        ships_built: ship_result.completed,
        factories_built: ind_result.built,
        bases_built: def_result.bases_built
    }

function process_ecology(planet, empire, eco_bc):
    # Calculate cleanup requirement
    waste_rate = get_waste_rate(empire)
    pollution = planet.operating_factories * waste_rate
    cleanup_mod = get_cleanup_modifier(empire)
    cleanup_cost = pollution * 0.5 * cleanup_mod
    
    if eco_bc >= cleanup_cost:
        # Cleanup satisfied
        remaining = eco_bc - cleanup_cost
        
        # Terraforming
        max_terraform = get_max_terraform(empire)
        if planet.terraform_level < max_terraform:
            terraform_cost = 5  # BC per +1 pop
            planet.terraform_progress += remaining
            while planet.terraform_progress >= terraform_cost and planet.terraform_level < max_terraform:
                planet.terraform_level += 1
                planet.terraform_progress -= terraform_cost
                remaining = planet.terraform_progress
        else:
            # Population boost
            growth_cost = 20  # BC per +1 pop
            bonus_pop = floor(remaining / growth_cost)
            planet.population = min(planet.population + bonus_pop, planet.max_population)
        
        return { pollution_deficit: 0 }
    else:
        # Pollution deficit!
        return { pollution_deficit: cleanup_cost - eco_bc }

function process_industry(planet, empire, ind_bc):
    max_factories = planet.max_population * empire.robotic_controls_level
    
    if planet.factories >= max_factories:
        return { built: 0, overflow: ind_bc }
    
    factory_cost = get_factory_cost(empire)
    total_bc = ind_bc + planet.factory_progress
    
    factories_built = floor(total_bc / factory_cost)
    factories_built = min(factories_built, max_factories - planet.factories)
    
    planet.factories += factories_built
    planet.factory_progress = total_bc - (factories_built * factory_cost)
    
    if planet.factories >= max_factories:
        overflow = planet.factory_progress
        planet.factory_progress = 0
        return { built: factories_built, overflow: overflow }
    
    return { built: factories_built, overflow: 0 }
```

---

## Worked Examples

### Example 1: Balanced Development

**Setup:**
- Population: 60
- Factories: 120
- Robotic Controls: II (3:1)
- Racial Modifier: 1.0 (Hamsters)
- Sliders: SHIP 20%, DEF 10%, IND 30%, ECO 10%, TECH 30%

**Calculation:**

1. **Scientists/Workers:**
   - Scientists: 60 × 0.30 = 18
   - Workers: 60 - 18 = 42

2. **Operable Factories:**
   - Max operable: 42 × 3 = 126
   - Actual operable: min(120, 126) = 120

3. **Production:**
   - Factory production: 120 × 1.0 × 1.0 = 120 BC
   - Worker production: 42 × 0.5 × 1.0 = 21 BC
   - **Total: 141 BC**

4. **Slider Allocations (of 141 BC, across 70% non-TECH):**
   - SHIP: 141 × (20/70) = 40.3 BC
   - DEF: 141 × (10/70) = 20.1 BC
   - IND: 141 × (30/70) = 60.4 BC
   - ECO: 141 × (10/70) = 20.1 BC

5. **Research:** 18 scientists × 1.0 × lab_mult = RP

---

### Example 2: Pollution Crisis

**Setup:**
- Factories: 200 operating
- Waste Rate: 1.0 (no reduction tech)
- Cleanup Modifier: 1.0 (no eco restoration)
- ECO Slider: 5% (100 BC production total)

**Calculation:**

1. **Pollution Generated:**
   - 200 × 1.0 = 200 units

2. **Cleanup Cost:**
   - 200 × 0.5 × 1.0 = 100 BC

3. **ECO Allocation:**
   - 100 × 0.05 = 5 BC

4. **Deficit:**
   - 100 - 5 = **95 BC shortfall**

5. **Consequence:**
   - 95 pollution accumulates
   - Max population drops by 9 (95 / 10)
   - Morale penalty

**Solution:** Increase ECO slider to at least 100% × (100/100) = 100% for full cleanup, or research waste reduction tech.

---

### Example 3: Full Development Overflow

**Setup:**
- Factories: 300 (maxed)
- Defenses: 50 bases (maxed), Shield XX (maxed)
- Terraforming: Maxed at current tech
- Population: At max

**Calculation:**

All four production sliders overflow to Reserve:
- SHIP: Building, no overflow (unless queue empty)
- DEF: 100% overflow (maxed)
- IND: 100% overflow (maxed)
- ECO: 100% overflow (maxed)

**Total Overflow:** Significant BC to Reserve each turn.

---

### Example 4: Rush Production

**Setup:**
- Building Cruiser (cost: 800 BC)
- Current progress: 200 BC
- Remaining: 600 BC
- Empire Reserve: 2000 BC

**Rush Cost:**

```
Rush_Cost = Remaining × Rush_Multiplier
Rush_Cost = 600 × 2.0 = 1200 BC

If Empire_Reserve >= Rush_Cost:
    Ship_Completed = True
    Empire_Reserve -= Rush_Cost
```

---

## Edge Cases

### Zero Production
If a planet has 0 factories and 0 population:
- All sliders produce 0 output
- Planet is effectively non-functional

### 100% TECH Slider
If TECH = 100%:
- All population becomes scientists
- Zero workers means zero factory operation
- Zero production for SHIP/DEF/IND/ECO
- Maximum research output

### Locked Sliders
When adjusting unlocked sliders, locked sliders don't change:
```
Available_Percent = 100 - Sum(Locked_Slider_Percents)
Unlocked_Sliders redistribute within Available_Percent
```

### Negative Production (Impossible)
Production cannot go negative. Minimum is 0.

### Fractional BC
BC is tracked as floating point internally, but displayed as integers. Construction uses accumulated totals.

---

## UI Display Formulas

### Turns to Complete Display

```
If allocation > 0:
    Turns = ceil((Cost - Progress) / Allocation_Per_Turn)
    Display: "Ship Name (Turns turns)"
Else:
    Display: "Ship Name (—)"
```

### Slider Bar Colors

| State | Color |
|-------|-------|
| Normal | Blue/Green |
| Overflow (wasted) | Yellow/Orange |
| Deficit (ECO) | Red |
| Locked | Gray border |

---

## Related Documents

- `factory-formulas.md` - Production capacity calculation
- `population-growth.md` - Population mechanics
- `research-formulas.md` - How TECH slider converts to RP
- `../economy/ship-costs.md` - Ship construction costs
- `buildings.md` - Building costs for DEF slider

---

*Last Updated: 2026-03-21*
*Specification: spec-004 - Planetary Slider Mathematics*
