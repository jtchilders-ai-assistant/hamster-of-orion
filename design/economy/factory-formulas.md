# Factory & Production Formulas

## Overview

Factories are the primary economic engine in Hamster of Orion. Each planet can build and operate factories to generate **Production Capacity (BC - "Building Credits")**, which is spent on ships, defenses, research, and more factories. This document provides exact formulas, constants, and algorithms for implementing the factory and production system.

**Key MOO1 Faithful Mechanics:**
- Factories require population to operate (base ratio 2:1)
- Factory construction cost is reduced by Construction technology
- Factories generate pollution/waste that must be cleaned up
- Robotic Controls technology increases the factory:population ratio

---

## Core Formulas

### 1. Maximum Operable Factories

The number of factories a planet can operate is limited by population and Robotic Controls technology:

```
Max_Operable_Factories = Population × Robotic_Controls_Level
```

| Technology | Robotic Controls Level | Factories per Colonist |
|------------|------------------------|------------------------|
| None (Base) | 2 | 2:1 |
| Robotic Controls II | 3 | 3:1 |
| Robotic Controls III | 4 | 4:1 |
| Robotic Controls IV | 5 | 5:1 |
| Robotic Controls V | 6 | 6:1 |
| Robotic Controls VI | 7 | 7:1 |

**Example:** A planet with 50 population and Robotic Controls IV can operate up to 50 × 5 = 250 factories.

---

### 2. Factory Output (Production per Turn)

Each operating factory produces a base amount of BC per turn, modified by racial bonuses:

```
Base_Factory_Output = 1 BC per factory per turn

Effective_Factory_Output = Operating_Factories × Base_Factory_Output × Racial_Production_Modifier
```

#### Racial Production Modifiers

| Race | Modifier | Notes |
|------|----------|-------|
| Ants | 1.50 (+50%) | Hive efficiency |
| Mice | 1.25 (+25%) | Base modifier. **Note:** Mice have THREE stacking production bonuses: (1) +25% base production modifier, (2) +2 production per population from Cybernetic Workers ability, (3) +50% factory efficiency from Automated Production ability. See `species/race-stats-complete.md` for full calculation. |
| Guinea Pigs | 1.10 (+10%) | Strong workers |
| Hamsters | 1.00 (baseline) | Balanced |
| Rabbits | 1.00 (baseline) | Focus on growth |
| Rats | 1.00 (baseline) | Focus on research |
| Ferrets | 1.00 (baseline) | Focus on combat |
| Budgies | 0.90 (-10%) | Quality over quantity |
| Chameleons | 1.00 (baseline) | Focus on espionage |
| Hermit Crabs | 1.00 (baseline) | Environmental focus |

**Example:** 100 factories operated by Ants produce 100 × 1 × 1.50 = 150 BC/turn.

---

### 3. Total Planetary Production

Total production includes both factory output and population labor:

```
Total_Production = Factory_Production + Population_Production

Where:
  Factory_Production = Operating_Factories × 1 × Racial_Production_Modifier
  Population_Production = Population × 0.5 × Racial_Production_Modifier
```

**Note:** Each colonist contributes 0.5 BC/turn of base production (representing manual labor outside factories).

**Example:** A Hamster planet with 50 population and 100 factories:
- Factory Production: 100 × 1 × 1.00 = 100 BC
- Population Production: 50 × 0.5 × 1.00 = 25 BC
- **Total Production: 125 BC/turn**

---

### 4. Factory Construction Cost

The cost to build one factory depends on Construction technology:

```
Factory_Cost = Base_Factory_Cost - Industrial_Tech_Reduction

Base_Factory_Cost = 10 BC
```

#### Industrial Technology Cost Reduction

| Technology Level | Technology Name | Factory Cost |
|------------------|-----------------|--------------|
| 0 (None) | — | 10 BC |
| 3 | Industrial Tech 9 | 9 BC |
| 8 | Industrial Tech 8 | 8 BC |
| 13 | Industrial Tech 7 | 7 BC |
| 18 | Industrial Tech 6 | 6 BC |
| 23 | Industrial Tech 5 | 5 BC |
| 28 | Industrial Tech 4 | 4 BC |
| 33 | Industrial Tech 3 | 3 BC |
| 38 | Industrial Tech 2 | 2 BC |

**Note:** Factory cost cannot go below 2 BC.

---

### 5. Factory Construction Rate

How many factories are built per turn depends on production allocated and factory cost:

```
Factories_Built = floor(Production_Allocated ÷ Factory_Cost)
```

**Overflow Rule:** Excess BC carries over to the next turn as "partial factory progress."

```
Partial_Progress = (Production_Allocated mod Factory_Cost)
```

**Example:** With 25 BC allocated and factory cost of 6 BC:
- Factories built: floor(25 ÷ 6) = 4
- Partial progress: 25 mod 6 = 1 BC (carries over)

---

### 6. Maximum Factories Per Planet

Maximum factories are limited by planet size (population capacity):

```
Max_Factories = Max_Population × Robotic_Controls_Level
```

Where `Max_Population` is determined by planet size and terraforming.

| Planet Base Size | Max Population (Base) |
|------------------|----------------------|
| Tiny | 20 |
| Small | 40 |
| Medium | 60 |
| Large | 80 |
| Huge | 100 |

With Terraforming, max population can increase significantly (see Population Growth spec).

---

## Pollution / Industrial Waste

### 7. Pollution Generation

Factories generate pollution (waste) that reduces effective production:

```
Base_Pollution = Operating_Factories × Pollution_Rate

Pollution_Rate = 1.0 (base, no waste reduction)
```

#### Waste Reduction Technology

| Technology Level | Technology Name | Pollution Rate |
|------------------|-----------------|----------------|
| 0 (None) | — | 1.00 (100%) |
| 5 | Reduced Industrial Waste 80% | 0.80 (80%) |
| 15 | Reduced Industrial Waste 60% | 0.60 (60%) |
| 25 | Reduced Industrial Waste 40% | 0.40 (40%) |
| 35 | Reduced Industrial Waste 20% | 0.20 (20%) |
| 45 | Industrial Waste Elimination | 0.00 (0%) |

---

### 8. Pollution Cleanup Cost

Pollution must be cleaned up to prevent production loss:

```
Cleanup_Cost = Pollution_Generated × Cleanup_Cost_Per_Unit

Base_Cleanup_Cost_Per_Unit = 0.5 BC
```

**Eco Restoration Technology** reduces cleanup cost:

| Technology Level | Technology Name | Cleanup Modifier |
|------------------|-----------------|------------------|
| 0 (None) | — | 1.00 |
| 6 | Eco Restoration 20% | 0.80 |
| 16 | Eco Restoration 40% | 0.60 |
| 26 | Eco Restoration 60% | 0.40 |
| 36 | Eco Restoration 80% | 0.20 |
| 46 | Atmospheric Terraform | 0.00 |

```
Effective_Cleanup_Cost = Pollution × 0.5 × Cleanup_Modifier
```

---

### 9. Net Production After Cleanup

```
Net_Production = Total_Production - Cleanup_Cost
```

If cleanup cost is not fully paid, pollution accumulates and reduces planet population capacity.

---

## Worker Allocation

### 10. Production Slider Allocation

The ECO slider determines what percentage of workers are assigned to industrial/ecological tasks:

```
Workers_For_Production = Total_Population × (Production_Slider_Percent ÷ 100)
Effective_Operating_Factories = min(Factories_Built, Workers_For_Production × Robotic_Controls_Level)
```

**Note:** Full slider allocation is covered in detail in `slider-mathematics.md`.

---

## JSON Data Schema

```json
{
  "factory_system": {
    "base_output_per_factory": 1.0,
    "base_output_per_population": 0.5,
    "base_factory_cost": 10,
    "min_factory_cost": 2,
    "base_pollution_per_factory": 1.0,
    "base_cleanup_cost_per_pollution": 0.5
  },
  
  "robotic_controls": [
    { "tech_level": 0, "name": "None", "factory_ratio": 2 },
    { "tech_level": 10, "name": "Robotic Controls II", "factory_ratio": 3 },
    { "tech_level": 16, "name": "Robotic Controls III", "factory_ratio": 4 },
    { "tech_level": 23, "name": "Robotic Controls IV", "factory_ratio": 5 },
    { "tech_level": 30, "name": "Robotic Controls V", "factory_ratio": 6 },
    { "tech_level": 38, "name": "Robotic Controls VI", "factory_ratio": 7 }
  ],
  
  "industrial_tech": [
    { "tech_level": 0, "name": "None", "factory_cost": 10 },
    { "tech_level": 3, "name": "Industrial Tech 9", "factory_cost": 9 },
    { "tech_level": 8, "name": "Industrial Tech 8", "factory_cost": 8 },
    { "tech_level": 13, "name": "Industrial Tech 7", "factory_cost": 7 },
    { "tech_level": 18, "name": "Industrial Tech 6", "factory_cost": 6 },
    { "tech_level": 23, "name": "Industrial Tech 5", "factory_cost": 5 },
    { "tech_level": 28, "name": "Industrial Tech 4", "factory_cost": 4 },
    { "tech_level": 33, "name": "Industrial Tech 3", "factory_cost": 3 },
    { "tech_level": 38, "name": "Industrial Tech 2", "factory_cost": 2 }
  ],
  
  "waste_reduction": [
    { "tech_level": 0, "name": "None", "waste_rate": 1.00 },
    { "tech_level": 5, "name": "Reduced Industrial Waste 80%", "waste_rate": 0.80 },
    { "tech_level": 15, "name": "Reduced Industrial Waste 60%", "waste_rate": 0.60 },
    { "tech_level": 25, "name": "Reduced Industrial Waste 40%", "waste_rate": 0.40 },
    { "tech_level": 35, "name": "Reduced Industrial Waste 20%", "waste_rate": 0.20 },
    { "tech_level": 45, "name": "Industrial Waste Elimination", "waste_rate": 0.00 }
  ],
  
  "eco_restoration": [
    { "tech_level": 0, "name": "None", "cleanup_modifier": 1.00 },
    { "tech_level": 6, "name": "Eco Restoration 20%", "cleanup_modifier": 0.80 },
    { "tech_level": 16, "name": "Eco Restoration 40%", "cleanup_modifier": 0.60 },
    { "tech_level": 26, "name": "Eco Restoration 60%", "cleanup_modifier": 0.40 },
    { "tech_level": 36, "name": "Eco Restoration 80%", "cleanup_modifier": 0.20 },
    { "tech_level": 46, "name": "Atmospheric Terraform", "cleanup_modifier": 0.00 }
  ],
  
  "racial_production_modifiers": {
    "ants": 1.50,
    "mice": 1.25,
    "guinea_pigs": 1.10,
    "hamsters": 1.00,
    "rabbits": 1.00,
    "rats": 1.00,
    "ferrets": 1.00,
    "budgies": 0.90,
    "chameleons": 1.00,
    "hermit_crabs": 1.00
  },
  
  "planet_base_sizes": {
    "tiny": { "max_population": 20 },
    "small": { "max_population": 40 },
    "medium": { "max_population": 60 },
    "large": { "max_population": 80 },
    "huge": { "max_population": 100 }
  }
}
```

---

## Algorithm: Calculate Planetary Production

```pseudocode
function calculate_planetary_production(planet, empire):
    # Get constants
    base_factory_output = 1.0
    base_pop_output = 0.5
    racial_modifier = get_racial_production_modifier(empire.race)
    robotic_level = get_robotic_controls_level(empire)
    
    # Calculate operable factories
    max_operable = planet.population * robotic_level
    operating_factories = min(planet.factories, max_operable)
    
    # Calculate gross production
    factory_production = operating_factories * base_factory_output * racial_modifier
    population_production = planet.population * base_pop_output * racial_modifier
    gross_production = factory_production + population_production
    
    # Calculate pollution cleanup
    waste_rate = get_waste_rate(empire)
    cleanup_modifier = get_cleanup_modifier(empire)
    pollution = operating_factories * waste_rate
    cleanup_cost = pollution * 0.5 * cleanup_modifier
    
    # Net production
    net_production = gross_production - cleanup_cost
    
    return {
        gross_production: gross_production,
        cleanup_cost: cleanup_cost,
        net_production: net_production,
        operating_factories: operating_factories,
        idle_factories: planet.factories - operating_factories
    }
```

---

## Algorithm: Build Factories

```pseudocode
function build_factories(planet, empire, production_allocated):
    factory_cost = get_factory_cost(empire)
    
    # Add carryover from previous turn
    total_bc = production_allocated + planet.factory_build_progress
    
    # Calculate factories built
    factories_built = floor(total_bc / factory_cost)
    
    # Check maximum factory limit
    max_factories = planet.max_population * get_robotic_controls_level(empire)
    factories_built = min(factories_built, max_factories - planet.factories)
    
    # Cannot build negative factories
    factories_built = max(factories_built, 0)
    
    # Update planet
    planet.factories += factories_built
    planet.factory_build_progress = total_bc - (factories_built * factory_cost)
    
    # If at max, refund to reserve
    if planet.factories >= max_factories:
        refund = planet.factory_build_progress
        planet.factory_build_progress = 0
        empire.reserve += refund
    
    return factories_built
```

---

## Edge Cases

### Factory Overflow
When a planet has more factories than can be operated (due to population loss or Robotic Controls being stolen), excess factories remain but are idle. They do not generate production or pollution.

### Reserve Fund
If a planet is fully developed (max factories, max population, no ships in queue), excess production goes to the **Empire Reserve Fund**. The reserve can be spent anywhere via the Reserve slider.

### Blockaded Planets
When a planet is blockaded by enemy ships:
- Production continues normally
- But cannot build ships (only ground defenses, missiles, shields)
- Excess production goes to reserve

### Bombed Factories
Planetary bombardment can destroy factories:
```
Factories_Destroyed = Bomb_Damage × Factory_Vulnerability
Factory_Vulnerability = 0.1 (10% of bomb damage destroys factories)
```

### Captured Planets
When capturing an enemy planet:
- Factories remain (may be damaged by invasion)
- Factory technology level uses YOUR tech (not previous owner)
- This may result in idle factories if you have lower Robotic Controls

---

## Worked Examples

### Example 1: Basic Production Calculation

**Setup:**
- Race: Hamsters (1.0 modifier)
- Population: 40
- Factories: 80
- Robotic Controls: II (3:1)
- No waste reduction

**Calculation:**
1. Max operable factories: 40 × 3 = 120
2. Operating factories: min(80, 120) = 80
3. Factory production: 80 × 1 × 1.0 = 80 BC
4. Population production: 40 × 0.5 × 1.0 = 20 BC
5. Gross production: 100 BC
6. Pollution: 80 × 1.0 = 80 units
7. Cleanup cost: 80 × 0.5 × 1.0 = 40 BC
8. **Net production: 100 - 40 = 60 BC/turn**

---

### Example 2: Ants with Advanced Tech

**Setup:**
- Race: Ants (1.5 modifier)
- Population: 60
- Factories: 300
- Robotic Controls: V (6:1)
- Reduced Industrial Waste 40%
- Eco Restoration 40%

**Calculation:**
1. Max operable factories: 60 × 6 = 360
2. Operating factories: min(300, 360) = 300
3. Factory production: 300 × 1 × 1.5 = 450 BC
4. Population production: 60 × 0.5 × 1.5 = 45 BC
5. Gross production: 495 BC
6. Pollution: 300 × 0.40 = 120 units
7. Cleanup cost: 120 × 0.5 × 0.60 = 36 BC
8. **Net production: 495 - 36 = 459 BC/turn**

---

### Example 3: Factory Construction

**Setup:**
- Industrial Tech 6 (factory cost = 6 BC)
- Production allocated to industry: 50 BC
- Previous carryover: 2 BC
- Current factories: 80
- Max factories: 120

**Calculation:**
1. Total BC available: 50 + 2 = 52 BC
2. Factories built: floor(52 ÷ 6) = 8
3. New factory count: 80 + 8 = 88
4. Carryover: 52 - (8 × 6) = 52 - 48 = 4 BC

---

## Difficulty Modifiers

Production can be modified by game difficulty:

| Difficulty | Player Modifier | AI Modifier |
|------------|-----------------|-------------|
| Simple | 1.25 | 0.75 |
| Easy | 1.10 | 0.90 |
| Average | 1.00 | 1.00 |
| Hard | 0.90 | 1.25 |
| Impossible | 0.75 | 1.50 |

These modifiers apply to the final net production after cleanup costs.

---

## Implementation Notes

### Integer Math
MOO1 used integer arithmetic throughout. For faithful recreation:
- Use `floor()` for division operations
- Round production values down at each step
- Track fractional progress separately (factory build carryover)

### Factory Display
The UI should show:
- Total factories on planet
- Operating factories (may be less than total)
- Idle factories (total - operating)
- Factories under construction (partial progress as percentage)

### Performance Optimization
Factory calculations run once per planet per turn. For a large empire (50+ planets), consider:
- Caching racial modifiers per empire
- Pre-computing tech effects at research completion
- Batch processing all planets in a single pass

---

## Related Documents

- `population-growth.md` - Population limits and growth formulas
- `slider-mathematics.md` - How production is allocated across categories
- `ship-costs.md` - Ship construction and maintenance
- `../technology/construction.md` - Construction tech tree details
- `../technology/computers.md` - Robotic Controls tech tree

---

*Last Updated: 2026-03-21*
*Specification: spec-001 - Factory & Production Formulas*
