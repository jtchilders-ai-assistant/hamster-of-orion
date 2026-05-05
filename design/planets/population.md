# Population Management

## Overview
Population is the fundamental resource. More population = more factory operators = more production and research output.

---

## Population Growth

**Base Growth Rate**: Population grows each turn based on current population relative to maximum capacity.

**Growth Phases**:
- Low population (under 25% of max): Fastest growth
- Medium population (25-75% of max): Moderate growth
- High population (over 75% of max): Slow growth
- At maximum: No natural growth

**Racial Modifiers**:
- Rabbits: +100% population growth
- Ants: +25% population growth
- Mice: -25% population growth (slow augmentation process)
- Hermit Crabs: -50% population growth (crystalline budding)
- Other races: Standard growth

See `../economy/population-growth.md` §4 for complete racial growth modifiers.

---

## Population and Production

**Operating Factories**: Population operates factories at a ratio determined by Robotic Controls technology:
- Base: 2 factories per population (Robotic Controls II, starting tech)
- With tech upgrades: Up to 7 factories per population (Robotic Controls VII)
- **Mice (Meklars) Special**: +2 effective RC level (start with 4 factories/pop)

See `../economy/factory-formulas.md` §1 for the complete Robotic Controls table.

**Direct Production**: Each population unit contributes labor output that scales with Planetology technology:

```
Base_Pop_Output = 0.5 + (Planetology_TL / 50 × 1.5)
  # At TL 0:  0.50 BC/pop (game start)
  # At TL 25: 1.25 BC/pop
  # At TL 50: 2.00 BC/pop (maximum)
```

This represents improvements in agricultural efficiency and industrial tools from environmental research.

**Formula** (see `../economy/factory-formulas.md` §3 for complete details):
```
Factory_Production = Operating_Factories × 1.0 × Racial_Production_Modifier × Factory_Efficiency_Modifier
Population_Production = Active_Population × Base_Pop_Output × Racial_Production_Modifier
Total_Production = (Factory_Production + Population_Production) × Mineral_Richness_Modifier
```

**Notes:**
- `Active_Population` = Population not diverted to TECH slider (scientists don't contribute labor)
- `Factory_Efficiency_Modifier` = 1.0 for most races; Mice have 1.5× from "Automated Production" ability
- Mineral richness ranges from 0.33× (Ultra Poor) to 3.0× (Ultra Rich)

---

## Population and Research

**Research Output**: When the Tech slider is allocated, population contributes to research:
- Research points scale with population and tech allocation
- No separate "scientist" units - just slider percentage
- Rats get +50% research bonus

---

## Maximum Population

Determined by:
1. **Planet Size**: Tiny to Huge base capacity
2. **Environment**: Hostile environments reduce capacity
3. **Terraforming**: Planetology tech can increase maximum

**Example**: Large Terran planet = ~100 max population
**With Terraforming**: Could increase to 120, 140, etc.

---

## Population Transport

**Relocating Population**:
- Can transport population between your colonies
- Uses transport ships (built via Ship slider)
- Takes time based on distance

**Invasion**:
- Transport population to enemy planets
- Ground combat determines outcome
- Captured planets retain infrastructure

---

## Population and Voting

**Diplomatic Victory**: Council votes are proportional to population
- More total population = more votes
- Rabbits/Ants excel at population-based strategies

---

## Conquered Populations

**Newly Captured Planets**:
- Population may resist (morale penalty)
- Production reduced until stabilized
- Garrison troops help maintain order
- Over time, population integrates

---

Next: See `production.md` for the slider system.
