# Population Growth Mathematics

## Overview

Population is the foundation of empire power in Hamster of Orion. More population means more production, more research, more food, and more votes in the Galactic Council. This document specifies the exact formulas for population growth, maximum population capacity, and all modifiers affecting population mechanics.

**Key MOO1 Faithful Mechanics:**
- Population grows as a percentage of current population (logistic growth)
- Growth rate slows as population approaches maximum capacity
- Planet environment affects growth rate
- Terraforming increases maximum population capacity
- Racial bonuses significantly affect growth rate

---

## Core Formulas

### 1. Base Population Growth

Population growth follows a **logistic growth model** where growth slows as population approaches the carrying capacity:

```
Growth_Per_Turn = Population × Base_Growth_Rate × Environment_Modifier × Racial_Modifier × (1 - Population / Max_Population)
```

Where:
- `Population` = current population
- `Base_Growth_Rate` = 0.10 (10% per turn)
- `Environment_Modifier` = modifier based on planet type (0.0 to 1.0)
- `Racial_Modifier` = race-specific growth bonus
- `Max_Population` = maximum population capacity of the planet

**Note:** Growth is calculated as a floating point value but applied as an integer (fractional population is tracked separately).

---

### 2. Maximum Population Capacity

Maximum population is determined by planet size, environment, and terraforming:

```
Max_Population = (Base_Size + Terraforming_Bonus + Soil_Enrichment_Bonus) × Environment_Capacity_Modifier
```

#### Base Planet Sizes

| Planet Size | Base Max Population |
|-------------|---------------------|
| Tiny | 20 |
| Small | 40 |
| Medium | 60 |
| Large | 80 |
| Huge | 100 |

#### Terraforming Bonus (Cumulative)

| Technology Level | Technology Name | Bonus |
|------------------|-----------------|-------|
| 2 | Terraforming +10 | +10 |
| 6 | Terraforming +20 | +20 |
| 10 | Terraforming +30 | +30 |
| 14 | Terraforming +40 | +40 |
| 18 | Terraforming +50 | +50 |
| 22 | Terraforming +60 | +60 |
| 30 | Terraforming +80 | +80 |
| 38 | Terraforming +100 | +100 |
| 46 | Terraforming +120 | +120 |

**Note:** Terraforming bonuses are NOT cumulative in the traditional sense. You only get the highest level you've researched.

#### Soil Enrichment Bonus (Flat Population Capacity)

Soil Enrichment works like terraforming — it permanently raises maximum population capacity by a flat amount, applied per-planet when you pay the one-time BC cost. Effects do **not** stack; Advanced replaces Basic.

| Technology Level | Technology Name | Max Pop Bonus | One-Time Cost |
|------------------|-----------------|---------------|---------------|
| None | — | +0 | — |
| 14 | Soil Enrichment | +25 | 150 BC |
| 26 | Advanced Soil Enrichment | +50 | 300 BC |

**Example:** A Large planet (80 base) with Terraforming +40 and Advanced Soil Enrichment:
- Max Population = (80 + 40) + 50 = 170

---

### 3. Environment Modifiers

Planet environment affects both growth rate and effective capacity.

#### Growth Rate Modifiers by Environment

| Environment | Growth Modifier | Notes |
|-------------|-----------------|-------|
| Gaia | 1.00 | Perfect conditions |
| Terran | 1.00 | Earth-like |
| Jungle | 0.90 | Dense vegetation |
| Ocean | 0.90 | Water world |
| Arid | 0.80 | Desert-like |
| Steppe | 0.80 | Grasslands |
| Desert | 0.70 | Harsh climate |
| Minimal | 0.60 | Barely habitable |
| Tundra | 0.50 | Frozen |
| Barren | 0.40 | No atmosphere |
| Dead | 0.30 | Lifeless |
| Inferno | 0.20 | Volcanic |
| Toxic | 0.20 | Poisonous atmosphere |
| Radiated | 0.10 | Heavy radiation |

#### Environment Capacity Modifier

Hostile environments also reduce effective maximum population:

| Environment | Capacity Modifier |
|-------------|-------------------|
| Gaia | 1.00 |
| Terran | 1.00 |
| Jungle | 1.00 |
| Ocean | 1.00 |
| Arid | 0.90 |
| Steppe | 0.90 |
| Desert | 0.80 |
| Minimal | 0.70 |
| Tundra | 0.60 |
| Barren | 0.50 |
| Dead | 0.40 |
| Inferno | 0.30 |
| Toxic | 0.30 |
| Radiated | 0.20 |

**Hermit Crabs Exception:** Hermit Crabs ignore environment modifiers entirely due to their **Universal Adaptation** ability. All environments are treated as Gaia (1.0 modifier).

---

### 4. Racial Growth Modifiers

| Race | Growth Modifier | Notes |
|------|-----------------|-------|
| Rabbits | 2.00 (+100%) | Exponential breeders |
| Ants | 1.25 (+25%) | Rapid reproduction. **Note:** Ants also receive +25% max population capacity from their Overpopulation ability (separate bonus, applied to max_population calculation). |
| Guinea Pigs | 1.00 (baseline) | Controlled growth |
| Hamsters | 1.00 (baseline) | Balanced |
| Rats | 1.00 (baseline) | Focus on research |
| Ferrets | 1.00 (baseline) | Focus on combat |
| Budgies | 1.00 (baseline) | Focus on piloting |
| Chameleons | 1.00 (baseline) | Focus on espionage |
| Mice | 0.75 (-25%) | Slow augmentation process |
| Hermit Crabs | 0.50 (-50%) | Crystalline budding |

---

### 5. Cloning Technology

Cloning technology provides a flat bonus to population growth:

| Technology Level | Technology Name | Flat Bonus per Turn |
|------------------|-----------------|---------------------|
| 11 | Cloning | +2 pop/turn |
| 22 | Advanced Cloning | +5 pop/turn |

```
Total_Growth = Natural_Growth + Cloning_Bonus
```

**Note:** Cloning bonus applies per planet per turn, regardless of current population.

---

### 6. Complete Growth Formula

```
Natural_Growth = Population × Base_Growth_Rate × Environment_Growth_Mod × Racial_Mod × (1 - Population / Max_Population)

Cloning_Bonus = Cloning_Tech_Bonus  # 0, 2, or 5

Total_Growth = Natural_Growth + Cloning_Bonus

New_Population = min(Population + floor(Total_Growth + Fractional_Population), Max_Population)

Fractional_Population = (Total_Growth + Old_Fractional) mod 1.0
```

---

## Population Transport

### 7. Population Transfer

Population can be transferred between planets using transport ships:

```
Transport_Capacity = 1 million per transport
Transport_Time = Distance_In_Parsecs ÷ Warp_Speed (turns)
```

#### Transport Construction

Population transports are **civilian colony ships** distinct from military troop transports (see `economy/ship-costs.md` §16). They carry colonists between friendly planets and have no combat capability.

| Ship Type | Cost | Maintenance | Capacity |
|-----------|------|-------------|----------|
| Colony Transport | 50 BC | 1 BC/turn | 1 million pop |

**Note:** Transported population departs the source planet immediately and arrives at destination after travel time. Population in transit does not contribute to either planet. The 50 BC cost reflects a Small hull with minimal equipment — comparable to a scout or colony ship base cost (see `economy/ship-costs.md` hull cost tables).

### 8. Overflow Population

When a planet reaches maximum population:
- Natural growth ceases
- Cloning bonus is wasted (does not overflow)
- Excess production slider allocation goes to **Empire Reserve**

**Rabbits Special:** Can redirect overflow population to transports automatically (unique ability).

---

## Food and Population

### 9. Food Requirements

Each population unit requires food to survive:

```
Food_Required = Population × Food_Per_Colonist

Food_Per_Colonist = 1.0 units
```

#### Food Production

Food is produced by colonists working agricultural land:

```
Food_Produced = Agricultural_Workers × Base_Food_Output × Environment_Fertility × Racial_Modifier

Base_Food_Output = 2.0 food per worker
```

#### Environment Fertility

| Environment | Fertility |
|-------------|-----------|
| Gaia | 1.50 |
| Terran | 1.00 |
| Jungle | 1.20 |
| Ocean | 1.00 |
| Arid | 0.60 |
| Steppe | 0.80 |
| Desert | 0.40 |
| Minimal | 0.30 |
| Tundra | 0.20 |
| Barren | 0.10 |
| Dead | 0.10 |
| Inferno | 0.05 |
| Toxic | 0.05 |
| Radiated | 0.05 |

#### Racial Food Modifiers

| Race | Food Modifier | Notes |
|------|---------------|-------|
| Rabbits | 1.25 (+25%) | Expert farmers |
| Ants | 1.20 (+20%) | Efficient foraging |
| Budgies | 1.10 (+10%) | Natural foragers |
| Hamsters | 1.00 (baseline) | — |
| Others | 1.00 (baseline) | — |
| Mice | 0.50 (-50%) | Reduced food needs (cybernetic) |
| Hermit Crabs | N/A | No food required (mineral absorption) |

### 10. Starvation

When food production < food required:

```
Starvation_Deaths = (Food_Required - Food_Produced) × Starvation_Rate

Starvation_Rate = 0.5 (50% of deficit dies per turn)
```

Population lost to starvation is permanent. Morale also drops sharply during starvation.

---

## Morale Effects on Growth

### 11. Morale Modifier

Population morale affects growth rate:

```
Morale_Growth_Modifier = 0.5 + (Morale / 200)
```

Where Morale ranges from 0 (rebellion) to 100 (ecstatic).

| Morale Level | Morale Value | Growth Modifier |
|--------------|--------------|-----------------|
| Ecstatic | 100 | 1.00 |
| Happy | 75 | 0.875 |
| Content | 50 | 0.75 |
| Unrest | 25 | 0.625 |
| Rebellion | 0 | 0.50 |

**Note:** Ants are immune to morale effects (hive mind). Hermit Crabs have +50 permanent morale bonus.

---

## Colony Establishment

### 12. New Colony Initial Population

When a colony ship lands:

```
Initial_Population = 2 (base)
```

Colony ships carry 2 million colonists as the founding population.

### 13. Colony Ship Requirements

To colonize hostile environments, specific technology is required:

| Technology Level | Technology Name | Unlocks |
|------------------|-----------------|---------|
| 3 | Controlled Barren | Barren worlds |
| 6 | Controlled Tundra | Tundra worlds |
| 9 | Controlled Dead | Dead worlds |
| 12 | Controlled Inferno | Inferno worlds |
| 15 | Controlled Toxic | Toxic worlds |
| 18 | Controlled Radiated | Radiated worlds |

**Hermit Crabs Exception:** Can colonize any environment from game start.

---

## JSON Data Schema

```json
{
  "population_system": {
    "base_growth_rate": 0.10,
    "base_food_per_colonist": 1.0,
    "base_food_per_worker": 2.0,
    "starvation_rate": 0.5,
    "initial_colony_population": 2,
    "transport_capacity": 1
  },

  "planet_base_sizes": [
    { "size": "tiny", "max_population": 20 },
    { "size": "small", "max_population": 40 },
    { "size": "medium", "max_population": 60 },
    { "size": "large", "max_population": 80 },
    { "size": "huge", "max_population": 100 }
  ],

  "terraforming": [
    { "tech_level": 0, "name": "None", "bonus": 0 },
    { "tech_level": 2, "name": "Terraforming +10", "bonus": 10 },
    { "tech_level": 6, "name": "Terraforming +20", "bonus": 20 },
    { "tech_level": 10, "name": "Terraforming +30", "bonus": 30 },
    { "tech_level": 14, "name": "Terraforming +40", "bonus": 40 },
    { "tech_level": 18, "name": "Terraforming +50", "bonus": 50 },
    { "tech_level": 22, "name": "Terraforming +60", "bonus": 60 },
    { "tech_level": 30, "name": "Terraforming +80", "bonus": 80 },
    { "tech_level": 38, "name": "Terraforming +100", "bonus": 100 },
    { "tech_level": 46, "name": "Terraforming +120", "bonus": 120 }
  ],

  "soil_enrichment": [
    { "tech_level": 0, "name": "None", "max_pop_bonus": 0, "upgrade_cost": 0 },
    { "tech_level": 14, "name": "Soil Enrichment", "max_pop_bonus": 25, "upgrade_cost": 150 },
    { "tech_level": 26, "name": "Advanced Soil Enrichment", "max_pop_bonus": 50, "upgrade_cost": 300 }
  ],

  "cloning": [
    { "tech_level": 0, "name": "None", "bonus_per_turn": 0 },
    { "tech_level": 11, "name": "Cloning", "bonus_per_turn": 2 },
    { "tech_level": 22, "name": "Advanced Cloning", "bonus_per_turn": 5 }
  ],

  "environment_colonization": [
    { "tech_level": 0, "name": "Standard", "unlocks": ["gaia", "terran", "jungle", "ocean", "arid", "steppe", "desert", "minimal"] },
    { "tech_level": 3, "name": "Controlled Barren", "unlocks": ["barren"] },
    { "tech_level": 6, "name": "Controlled Tundra", "unlocks": ["tundra"] },
    { "tech_level": 9, "name": "Controlled Dead", "unlocks": ["dead"] },
    { "tech_level": 12, "name": "Controlled Inferno", "unlocks": ["inferno"] },
    { "tech_level": 15, "name": "Controlled Toxic", "unlocks": ["toxic"] },
    { "tech_level": 18, "name": "Controlled Radiated", "unlocks": ["radiated"] }
  ],

  "environments": [
    { "id": "gaia", "name": "Gaia", "growth_modifier": 1.00, "capacity_modifier": 1.00, "fertility": 1.50 },
    { "id": "terran", "name": "Terran", "growth_modifier": 1.00, "capacity_modifier": 1.00, "fertility": 1.00 },
    { "id": "jungle", "name": "Jungle", "growth_modifier": 0.90, "capacity_modifier": 1.00, "fertility": 1.20 },
    { "id": "ocean", "name": "Ocean", "growth_modifier": 0.90, "capacity_modifier": 1.00, "fertility": 1.00 },
    { "id": "arid", "name": "Arid", "growth_modifier": 0.80, "capacity_modifier": 0.90, "fertility": 0.60 },
    { "id": "steppe", "name": "Steppe", "growth_modifier": 0.80, "capacity_modifier": 0.90, "fertility": 0.80 },
    { "id": "desert", "name": "Desert", "growth_modifier": 0.70, "capacity_modifier": 0.80, "fertility": 0.40 },
    { "id": "minimal", "name": "Minimal", "growth_modifier": 0.60, "capacity_modifier": 0.70, "fertility": 0.30 },
    { "id": "tundra", "name": "Tundra", "growth_modifier": 0.50, "capacity_modifier": 0.60, "fertility": 0.20 },
    { "id": "barren", "name": "Barren", "growth_modifier": 0.40, "capacity_modifier": 0.50, "fertility": 0.10 },
    { "id": "dead", "name": "Dead", "growth_modifier": 0.30, "capacity_modifier": 0.40, "fertility": 0.10 },
    { "id": "inferno", "name": "Inferno", "growth_modifier": 0.20, "capacity_modifier": 0.30, "fertility": 0.05 },
    { "id": "toxic", "name": "Toxic", "growth_modifier": 0.20, "capacity_modifier": 0.30, "fertility": 0.05 },
    { "id": "radiated", "name": "Radiated", "growth_modifier": 0.10, "capacity_modifier": 0.20, "fertility": 0.05 }
  ],

  "racial_growth_modifiers": {
    "rabbits": 2.00,
    "ants": 1.25,
    "guinea_pigs": 1.00,
    "hamsters": 1.00,
    "rats": 1.00,
    "ferrets": 1.00,
    "budgies": 1.00,
    "chameleons": 1.00,
    "mice": 0.75,
    "hermit_crabs": 0.50
  },

  "racial_food_modifiers": {
    "rabbits": 1.25,
    "ants": 1.20,
    "budgies": 1.10,
    "hamsters": 1.00,
    "guinea_pigs": 1.00,
    "rats": 1.00,
    "ferrets": 1.00,
    "chameleons": 1.00,
    "mice": 0.50,
    "hermit_crabs": null
  },

  "racial_special_rules": {
    "hermit_crabs": {
      "ignore_environment_modifiers": true,
      "no_food_required": true,
      "can_colonize_all": true
    },
    "rabbits": {
      "auto_transport_overflow": true
    },
    "ants": {
      "immune_to_morale": true
    },
    "mice": {
      "reduced_food_requirement": true
    }
  }
}
```

---

## Algorithm: Calculate Population Growth

```pseudocode
function calculate_population_growth(planet, empire):
    # Get base values
    population = planet.population
    max_population = calculate_max_population(planet, empire)
    
    # Check if already at max
    if population >= max_population:
        return {
            growth: 0,
            new_population: max_population,
            fractional: 0
        }
    
    # Get modifiers
    base_rate = 0.10
    env_modifier = get_environment_growth_modifier(planet.environment)
    racial_modifier = get_racial_growth_modifier(empire.race)
    morale_modifier = calculate_morale_modifier(planet.morale)
    
    # Hermit Crabs ignore environment
    if empire.race == "hermit_crabs":
        env_modifier = 1.0
    
    # Ants ignore morale
    if empire.race == "ants":
        morale_modifier = 1.0
    
    # Logistic growth formula
    growth_factor = 1 - (population / max_population)
    natural_growth = population * base_rate * env_modifier * racial_modifier * morale_modifier * growth_factor
    
    # Add cloning bonus
    cloning_bonus = get_cloning_bonus(empire)
    total_growth = natural_growth + cloning_bonus
    
    # Apply fractional tracking
    total_with_fractional = total_growth + planet.fractional_population
    integer_growth = floor(total_with_fractional)
    new_fractional = total_with_fractional - integer_growth
    
    # Cap at max population
    new_population = min(population + integer_growth, max_population)
    actual_growth = new_population - population
    
    return {
        growth: actual_growth,
        new_population: new_population,
        fractional: new_fractional
    }

function calculate_max_population(planet, empire):
    base_size = planet.base_max_population  # 20/40/60/80/100
    terraforming_bonus = get_terraforming_bonus(empire)
    soil_bonus = get_soil_enrichment_bonus(planet)  # 0, 25, or 50 — per-planet, paid at upgrade time
    env_capacity = get_environment_capacity_modifier(planet.environment)
    
    # Hermit Crabs ignore environment capacity penalty
    if empire.race == "hermit_crabs":
        env_capacity = 1.0
    
    max_pop = floor((base_size + terraforming_bonus + soil_bonus) * env_capacity)
    
    return max_pop

function calculate_morale_modifier(morale):
    # morale: 0-100
    return 0.5 + (morale / 200)
```

---

## Algorithm: Food and Starvation

```pseudocode
function process_food(planet, empire):
    population = planet.population
    
    # Hermit Crabs don't need food
    if empire.race == "hermit_crabs":
        return {
            food_required: 0,
            food_produced: 0,
            surplus: 0,
            starvation_deaths: 0
        }
    
    # Calculate food requirements
    food_per_colonist = 1.0
    if empire.race == "mice":
        food_per_colonist = 0.5  # Cybernetic - reduced needs
    
    food_required = population * food_per_colonist
    
    # Calculate food production
    farmers = planet.workers_assigned_to_food
    base_output = 2.0
    fertility = get_environment_fertility(planet.environment)
    racial_modifier = get_racial_food_modifier(empire.race)
    
    food_produced = farmers * base_output * fertility * racial_modifier
    
    # Check for surplus or starvation
    surplus = food_produced - food_required
    starvation_deaths = 0
    
    if surplus < 0:
        deficit = abs(surplus)
        starvation_rate = 0.5
        starvation_deaths = floor(deficit * starvation_rate)
        planet.population -= starvation_deaths
        planet.morale -= 20  # Morale penalty for starvation
    
    return {
        food_required: food_required,
        food_produced: food_produced,
        surplus: surplus,
        starvation_deaths: starvation_deaths
    }
```

---

## Worked Examples

### Example 1: Basic Growth (Hamsters on Terran)

**Setup:**
- Race: Hamsters (1.0 modifier)
- Planet: Large Terran (80 base pop)
- Current Population: 40
- Terraforming: +20
- Morale: 75 (Happy)
- No cloning

**Calculation:**
1. Max Population: (80 + 20) × 1.0 × 1.0 = 100
2. Environment modifier: 1.0 (Terran)
3. Racial modifier: 1.0 (Hamsters)
4. Morale modifier: 0.5 + (75/200) = 0.875
5. Growth factor: 1 - (40/100) = 0.6
6. Natural growth: 40 × 0.10 × 1.0 × 1.0 × 0.875 × 0.6 = **2.1**
7. **Growth this turn: 2 (fractional 0.1 carries over)**

---

### Example 2: Rabbits on Jungle

**Setup:**
- Race: Rabbits (2.0 modifier)
- Planet: Huge Jungle (100 base pop)
- Current Population: 30
- Terraforming: +40
- Soil Enrichment: +25 (Basic)
- Morale: 100 (Ecstatic)
- Advanced Cloning: +5/turn

**Calculation:**
1. Max Population: (100 + 40 + 25) × 1.0 = 165
2. Environment modifier: 0.9 (Jungle)
3. Racial modifier: 2.0 (Rabbits)
4. Morale modifier: 1.0 (Ecstatic)
5. Growth factor: 1 - (30/175) = 0.829
6. Natural growth: 30 × 0.10 × 0.9 × 2.0 × 1.0 × (1 - 30/165) = 30 × 0.10 × 0.9 × 2.0 × 0.818 = **4.42**
7. Cloning bonus: +5
8. Total growth: 4.48 + 5 = **9.48**
9. **Growth this turn: 9 (fractional 0.48 carries over)**

---

### Example 3: Hermit Crabs on Radiated

**Setup:**
- Race: Hermit Crabs (0.5 modifier, ignores environment)
- Planet: Medium Radiated (60 base pop)
- Current Population: 20
- Terraforming: +30
- Morale: 100 (base +50 bonus)
- No cloning

**Calculation:**
1. Max Population: (60 + 30) × 1.0 × 1.0 = 90 (ignores capacity penalty)
2. Environment modifier: 1.0 (Hermit Crabs ignore)
3. Racial modifier: 0.5 (Hermit Crabs)
4. Morale modifier: 1.0
5. Growth factor: 1 - (20/90) = 0.778
6. Natural growth: 20 × 0.10 × 1.0 × 0.5 × 1.0 × 0.778 = **0.78**
7. **Growth this turn: 0 (fractional 0.78 carries over)**
8. After 2 turns: fractional reaches 1.56, growth = 1

---

### Example 4: Starvation Scenario

**Setup:**
- Race: Hamsters
- Population: 50
- Farmers: 10
- Planet: Desert (0.4 fertility)

**Calculation:**
1. Food required: 50 × 1.0 = 50 units
2. Food produced: 10 × 2.0 × 0.4 × 1.0 = 8 units
3. Deficit: 50 - 8 = 42 units
4. Starvation deaths: floor(42 × 0.5) = **21 deaths**
5. New population: 50 - 21 = 29

---

## Edge Cases

### Negative Growth
Growth cannot be negative from the formula. However, population CAN decrease due to:
- Starvation
- Combat casualties
- Biological weapons
- Population transfer (transports)

### Fractional Population
Fractional population must be tracked per planet. When fractional reaches 1.0 or higher, it converts to integer population.

### Overflow Prevention
When population reaches max:
- Growth formula returns 0 (growth factor = 0)
- Cloning bonus is wasted
- Consider alerting player to build transports (Rabbits: auto-queue)

### Conquered Population
When conquering an enemy planet:
- Population is reduced by 50% (combat casualties)
- Survivors maintain their original max population capacity
- Your terraforming tech applies, potentially increasing capacity

### Biological Weapon Damage
Bio weapons (researched in the Planetology field) kill population each combat round and permanently reduce max population capacity:

| Weapon | Kill Rate | Max Pop Reduction |
|--------|-----------|-------------------|
| Death Spores (Planetology TL 9) | 1M per combat round | -10% permanent |
| Doom Virus (Planetology TL 25) | 2M per combat round | -25% permanent |
| Bio Terminator (Planetology TL 33) | 3M per combat round | -50% permanent |

```
Population_Killed = Weapon_Kill_Rate × Number_Of_Weapons × Combat_Rounds_Survived
New_Max_Pop = Old_Max_Pop × (1 - Max_Pop_Reduction)
```

Max population reduction is permanent until the planet is re-terraformed. See `technology/planetology.md` for full bio weapon mechanics.

---

## Difficulty Modifiers

| Difficulty | Player Growth | AI Growth |
|------------|---------------|-----------|
| Simple | 1.25 | 0.75 |
| Easy | 1.10 | 0.90 |
| Average | 1.00 | 1.00 |
| Hard | 0.90 | 1.25 |
| Impossible | 0.75 | 1.50 |

These modifiers apply multiplicatively to the base growth rate.

---

## Related Documents

- `factory-formulas.md` - Production requires population
- `slider-mathematics.md` - Worker allocation affects food/growth
- `../technology/planetology.md` - Terraforming and colonization tech
- `../diplomacy/council.md` - Population determines council votes
- `../game-mechanics/victory-conditions.md` - Domination requires 2/3 population

---

*Last Updated: 2026-03-21*
*Specification: spec-002 - Population Growth Mathematics*
