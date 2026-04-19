# Current Task: population-growth

## Task ID
`population-growth`

## Name
Population growth system

## Description
Implement the population growth system per `design/economy/population-growth.md`.

## Output File
`src/game/systems/population.ts`

## Dependencies (all done)
- `production-system` ✅

## Acceptance Criteria
1. Logistic growth formula implemented correctly
2. Environment modifiers applied (growth rate + capacity)
3. Racial bonuses work (Rabbits 2×, Hermit Crabs ignore env, Ants +25% capacity, etc.)
4. Unit tests pass

## Key Design References
- `design/economy/population-growth.md` — primary spec (all formulas here)
- `design/technical/data-structures.md` — existing types
- `src/game/systems/production.ts` — example of an existing system

## What to Implement

### Core Functions

**`calculateMaxPopulation(planet, empire, techState)`**
```
Max_Population = floor((base_population + terraforming_bonus + soil_bonus) × env_capacity_modifier × racial_capacity_modifier)
```
- Hermit Crabs: env_capacity_modifier = 1.0 always
- Ants: racial_capacity_modifier = 1.25
- Use planet.base_population (generated per-planet), not hardcoded sizes
- Terraforming bonus: use highest unlocked level (non-cumulative) from tech state
- Soil enrichment: per-planet (planet.soil_enrichment_level: 0 | 1 | 2)

**`calculatePopulationGrowth(planet, empire, techState)`**
```
Natural_Growth = pop × 0.10 × env_growth_mod × racial_mod × morale_mod × (1 - pop/max_pop)
Cloning_Bonus = empire's cloning tech bonus (0, 2, or 5)
Total_Growth = Natural_Growth + Cloning_Bonus
total_with_frac = Total_Growth + planet.fractional_population
integer_growth = floor(total_with_frac)
new_fractional = total_with_frac - integer_growth
new_population = min(pop + integer_growth, max_pop)
```
- Hermit Crabs: env_growth_mod = 1.0 always
- Ants: morale_modifier = 1.0 always
- Morale modifier: 0.5 + (morale / 200)
- If pop >= max_pop: growth = 0, fractional unchanged (cloning wasted)

**`processFoodAndStarvation(planet, empire)`**
```
food_required = pop × food_per_colonist (1.0; Mice = 0.5)
food_produced = farmers × 2.0 × env_fertility × racial_food_mod
if food_produced < food_required:
    deficit = food_required - food_produced
    deaths = floor(deficit × 0.5)
    population -= deaths
    morale -= 20
```
- Hermit Crabs: no food required, return early with zeros

**`calculateDifficultyGrowthModifier(difficulty, isPlayer)`**
```
Simple:     player=1.25, ai=0.75
Easy:       player=1.10, ai=0.90
Average:    player=1.00, ai=1.00
Hard:       player=0.90, ai=1.25
Impossible: player=0.75, ai=1.50
```

### Environment Tables (from design doc)
Implement as lookup maps — do NOT hardcode if/else chains:
- Growth modifiers: gaia=1.0, terran=1.0, jungle=0.9, ocean=0.9, arid=0.8, steppe=0.8, desert=0.7, minimal=0.6, tundra=0.5, barren=0.4, dead=0.3, inferno=0.2, toxic=0.2, radiated=0.1
- Capacity modifiers: gaia=1.0, terran=1.0, jungle=1.0, ocean=1.0, arid=0.9, steppe=0.9, desert=0.8, minimal=0.7, tundra=0.6, barren=0.5, dead=0.4, inferno=0.3, toxic=0.3, radiated=0.2
- Fertility: gaia=1.5, terran=1.0, jungle=1.2, ocean=1.0, arid=0.6, steppe=0.8, desert=0.4, minimal=0.3, tundra=0.2, barren=0.1, dead=0.1, inferno=0.05, toxic=0.05, radiated=0.05

### Racial Tables
- Growth modifiers: rabbits=2.0, ants=1.25, guinea_pigs=1.0, hamsters=1.0, rats=1.0, ferrets=1.0, budgies=1.0, chameleons=1.0, mice=0.75, hermit_crabs=0.5
- Food modifiers: rabbits=1.25, ants=1.20, budgies=1.10, hamsters=1.0, guinea_pigs=1.0, rats=1.0, ferrets=1.0, chameleons=1.0, mice=0.5, hermit_crabs=null (no food needed)

### Terraforming Bonus Lookup (highest unlocked, NOT cumulative)
| Tech Level | Bonus |
|------------|-------|
| 0          | 0     |
| 2          | +10   |
| 6          | +20   |
| 10         | +30   |
| 14         | +40   |
| 18         | +50   |
| 22         | +60   |
| 30         | +80   |
| 38         | +100  |
| 46         | +120  |

### Cloning Bonus Lookup
| Tech Level | Bonus/turn |
|------------|-----------|
| 0          | 0         |
| 11         | 2         |
| 22         | 5         |

## Types to Check/Add
Check `src/game/state.ts` for existing Planet/Empire types. You may need to add:
- `planet.fractional_population: number` (defaults to 0)
- `planet.soil_enrichment_level: 0 | 1 | 2` (defaults to 0)
- `planet.morale: number` (0-100, default 50)
- `planet.farmers: number` (workers assigned to food)
- `empire.terraforming_tech_level: number`
- `empire.cloning_tech_level: number`

Add missing fields as needed, keeping them optional (with defaults) so existing tests don't break.

## Tests Required
Write `test/game/systems/population.test.ts` covering:

1. **`calculateMaxPopulation`**:
   - Basic: large terran with terraforming
   - Hermit Crabs on radiated (env penalty ignored)
   - Ants capacity bonus (+25%)
   - Soil enrichment applied
   - Base uses `planet.base_population`, not hardcoded size

2. **`calculatePopulationGrowth`**:
   - Example 1 from design doc: Hamsters on Terran, pop=40, max=100, morale=75 → growth=2, fractional=0.1
   - Example 2: Rabbits on Jungle with cloning → growth=9, fractional≈0.48
   - Example 3: Hermit Crabs on Radiated → growth=0, fractional=0.78
   - Fractional carry-over: growth accumulates across turns
   - At max population: growth = 0
   - Cloning wasted when at max pop

3. **`processFoodAndStarvation`**:
   - Example 4 from design doc: pop=50, farmers=10, Desert → 21 deaths
   - Hermit Crabs: no food required, no deaths
   - Mice: food_per_colonist = 0.5
   - Surplus: no deaths

4. **`calculateDifficultyGrowthModifier`**:
   - All 5 difficulty levels for player and AI

5. **Morale modifier**: `0.5 + (morale/200)`, morale=100 → 1.0, morale=50 → 0.75

## Worked Examples to Validate Against (from design doc)

### Example 1: Hamsters on Terran
- Pop=40, base_pop=80, terraforming=+20 → max=100
- env_growth=1.0, racial=1.0, morale_mod=0.5+(75/200)=0.875
- growth_factor = 1-(40/100)=0.6
- natural = 40×0.1×1.0×1.0×0.875×0.6 = 2.1
- growth=2, fractional=0.1 ✓

### Example 2: Rabbits on Jungle
- Pop=30, base_pop=100, terraforming=+40, soil=+25 → max_raw=(100+40+25)×1.0=165
- env_growth=0.9, racial=2.0, morale=1.0 (ecstatic)
- growth_factor = 1-(30/165)=0.8182
- natural = 30×0.1×0.9×2.0×1.0×0.8182 = 4.418
- cloning = +5, total = 9.418
- growth=9, fractional≈0.418 (design doc says 0.48 — use your calc)

### Example 3: Hermit Crabs on Radiated
- Pop=20, base_pop=60, terraforming=+30 → max=floor(90×1.0×1.0)=90
- env_growth=1.0 (HC ignore), racial=0.5, morale=1.0
- growth_factor = 1-(20/90)=0.778
- natural = 20×0.1×1.0×0.5×1.0×0.778 = 0.778
- growth=0, fractional=0.778 ✓

## Completion

When done:
1. Run `npm run typecheck` — must be clean
2. Run `npm run test` — all tests must pass
3. Update `workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "population-growth",
  "worker_output": {
    "files_created": [...],
    "files_modified": [...],
    "tests_added": [...],
    "summary": "..."
  }
}
```
