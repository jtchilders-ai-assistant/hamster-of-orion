# Production System (MOO1-Style Sliders)

## Overview
The heart of planet management: five sliding scales allocate population/resources. Simple, elegant, strategic.

**Reference Materials:**
- [Planetary Controls Explained PDF](file:///Users/jchilders/mywork/hamster-of-orion/design/Master%20of%20Orion%20Planetary%20Controls%20Explained.pdf)
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)
- [StrategyWiki Reference Text](file:///Users/jchilders/mywork/hamster-of-orion/reference/strategywiki-moo1.txt)

---

## The Five Sliders

### 1. Ship Construction
**Allocates**: Production capacity to building ships
**Range**: 0-100%  
**Output**: BC toward current ship project
**Display Text**: `{Ship Name} {Turns}` (e.g., "Scout 4")
**Strategy**: 
- High when building fleets
- Low during peacetime
- Emergency: 100% for rapid response

### 2. Defense
**Allocates**: Production to missile bases and shields
**Range**: 0-100%
**Output**: BC toward planetary defenses
**Display Text**: `Bases & Shield` (e.g., "12 Bases", "Shield II")
**Strategy**:
- Border worlds: 30-50%
- Safe interior: 0-10%
- Fortress worlds: 80%+
- Once maxed, funds are used for refitting bases to new tech.

### 3. Industry
**Allocates**: Production to building/maintaining factories
**Range**: 0-100%
**Output**: New factories (compounds over time!)
**Display Text**: `Factories` status (e.g., "256/300", "Maxed")
**Strategy**:
- New colonies: 80%+ (infrastructure first)
- Developed worlds: 10-20% (maintenance)
- When "Maxed", excess is redirected to the Planetary Reserve.

### 4. Ecology (Waste Cleanup)
**Allocates**: Production to pollution control and growth
**Range**: 0-100%
**Output**: Reduces pollution, then funds terraforming/population growth
**Display Text**: `Clean / Terraform` status
**Strategy** (in priority order):
- Priority 1: Waste Cleanup (Clean) — mandatory first charge.
- Priority 2: Terraforming — permanently increase planet max population.
- Priority 3: Population Growth Bonus — accelerate population toward max (via Cloning).

*Note: See `../economy/slider-mathematics.md` §ECO for exact formulas.*

### 5. Research
**Allocates**: Scientists to current research project
**Range**: 0-100%
**Output**: Research points toward technology
**Display Text**: `(Field Name)` (e.g., "Computers", "Weapons")
**Strategy**:
- High on safe interior worlds
- Low on border worlds (defense priority)
- Balance empire-wide

---

## Slider Strategies by Game Phase

### Early Game (Turns 1-40)
**New Colony**:
- Industry: 70% (build economy)
- Ship: 0% (homeworld builds ships)
- Defense: 0% (not threatened yet)
- Ecology: 0% (no pollution yet)
- Research: 30% (some contribution)

**Homeworld**:
- Industry: 30% (already developed)
- Ship: 40% (build fleet)
- Defense: 10% (some protection)
- Ecology: 0% (not needed yet)
- Research: 20% (science center)

### Mid Game (Turns 40-80)
**Border World**:
- Industry: 20% (maintain)
- Ship: 30% (local defense fleet)
- Defense: 40% (fortress)
- Ecology: 10% (starting to matter)
- Research: 0% (survival priority)

**Interior World**:
- Industry: 20% (maintain)
- Ship: 0% (safe, no need)
- Defense: 0% (no threat)
- Ecology: 20% (pollution management)
- Research: 60% (science powerhouse)

### Late Game (Turns 80+)
**Production World**:
- Industry: 0% (maxed)
- Ship: 80% (shipyard)
- Defense: 20% (basic)
- Ecology: 0% (tech solved pollution)
- Research: 0% (focus elsewhere)

**Research World**:
- Industry: 0% (maxed)
- Ship: 0% (others build)
- Defense: 10% (minimal)
- Ecology: 0% (tech solved)
- Research: 90% (pure science)

---

## Empire-Wide Resource Allocation

**Balanced Empire** (Hamsters):
- 30% Ship, 20% Defense, 10% Industry, 10% Ecology, 30% Research

**Militaristic** (Guinea Pigs, Ferrets):
- 50% Ship, 30% Defense, 10% Industry, 10% Ecology, 0% Research

**Expansionist** (Rabbits, Ants):
- 30% Ship, 10% Defense, 40% Industry, 10% Ecology, 10% Research

**Tech Rush** (Rats, Mice):
- 20% Ship, 20% Defense, 10% Industry, 10% Ecology, 40% Research

**Defensive** (Hermit Crabs):
- 10% Ship, 60% Defense, 10% Industry, 10% Ecology, 10% Research

---

## Slider Micro-Management Tips

**Lock Sliders**: Prevent AI from changing specific sliders  
**Planetary Governors**: AI manages sliders (for casual play)  
**Manual Control**: Full control for optimization (competitive play)

**Key Insight**: Industry slider is most important early game. Factories compound. Rush factories = economic snowball.

---

## Production Efficiency

**Wasted Capacity**: 
- Allocating to fully-built projects wastes BC
- Example: Missile bases at max + 30% Defense = waste
- Solution: Reallocate when projects complete

**Rush Production**:
- Pay extra BC to complete projects instantly
- Cost: 2× remaining BC needed
- Strategy: Emergency fleet construction

---

Next: See `special-planets.md` for Orion and artifacts.
