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
- Ants: +25% population growth (estimated)
- Other races: Standard growth

---

## Population and Production

**Operating Factories**: Population operates factories at a ratio determined by Robotic Controls technology:
- Base: 2 factories per population
- With tech upgrades: Up to 7 factories per population

**Direct Production**: Each population unit also contributes 0.5 BC of base production (representing manual labor).

**Formula**:
```
Total_Production = (Operating_Factories × 1 BC) + (Population × 0.5 BC)
Total_Production *= Mineral_Richness_Modifier
Total_Production *= Racial_Production_Modifier
```

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
