# Planetary Infrastructure

## Overview
In MOO1, planets don't have discrete "buildings" like later 4X games. Instead, infrastructure is built through the slider system and appears as quantities (factories, missile bases) or levels (planetary shields).

---

## Factories

**Built Via**: Industry (IND) slider
**Cost**: Base 10 BC per factory (reduced by Construction tech)
**Effect**: Each factory produces 1 BC of production per turn
**Limit**: Based on population × Robotic Controls level

**Key Mechanics**:
- Population operates factories (not automated)
- Base ratio: 2 factories per population
- Robotic Controls tech increases ratio (up to 7:1)
- More factories = more production = faster ship building

**Formula**:
```
Max_Factories = Population × Robotic_Controls_Multiplier
Factory_Output = Operating_Factories × 1 BC × Mineral_Richness_Modifier
```

---

## Missile Bases

**Built Via**: Defense (DEF) slider
**Cost**: ~150 BC per base (varies with tech)
**Effect**: Defends planet against bombardment and invasion
**Limit**: Soft limit based on planet needs

**Key Mechanics**:
- Bases fire missiles at attacking ships
- Missile type = your best researched missile tech
- Bases automatically upgrade when you research better missiles
- Essential for border world defense

**Strategy**:
- 5-10 bases: Light defense
- 15-25 bases: Moderate defense
- 30+ bases: Fortress world

---

## Planetary Shields

**Built Via**: Defense (DEF) slider (after missile bases)
**Cost**: Varies by shield class
**Effect**: Absorbs damage from orbital bombardment

**Shield Classes** (from Force Fields tech):
| Shield | Absorption | Tech Required |
|--------|------------|---------------|
| Class V | 5 damage | Planetary Shield V |
| Class X | 10 damage | Planetary Shield X |
| Class XV | 15 damage | Planetary Shield XV |
| Class XX | 20 damage | Planetary Shield XX |

**Key Mechanics**:
- Reduces damage from each hit by absorption value
- Does NOT stop invasion transports
- Combines with missile bases for layered defense

---

## Star Gates

**Built Via**: Special production project
**Cost**: 3000 BC
**Tech Required**: Intergalactic Star Gates (Propulsion)
**Effect**: Instant travel between gated planets

**Key Mechanics**:
- Ships can travel instantly between any two planets with Star Gates
- Ignores fuel range for gate-to-gate travel
- Excellent for rapid reinforcement
- One gate per planet maximum

---

## What MOO1 Does NOT Have

Unlike later 4X games, MOO1 does NOT have:
- ❌ Research Labs (research comes from population + Tech slider)
- ❌ Farms/Hydroponic facilities (no separate food system)
- ❌ Cloning Centers (population growth is base mechanic)
- ❌ Race-unique buildings
- ❌ Building queues (just sliders)
- ❌ Entertainment/morale buildings

**Simplicity**: MOO1's elegance comes from the slider system handling everything. You don't micromanage individual buildings - you allocate percentages.

---

## Terraforming

**Built Via**: Ecology (ECO) slider (after pollution cleared)
**Effect**: Increases maximum population capacity
**Tech Required**: Various Planetology techs

**Process**:
1. First, ECO slider cleans pollution
2. Once pollution = 0, excess ECO goes to terraforming
3. Terraforming adds +1 to max population per investment threshold
4. Advanced tech allows more total terraforming

---

## Infrastructure Strategy

**New Colony**:
1. Industry slider high → build factories
2. Once factories maxed → shift to other needs

**Developed Planet**:
1. Industry slider low (maintenance only)
2. Allocate to Ship, Defense, or Research based on role

**Border World**:
1. Defense slider high → build missile bases
2. Planetary shield if tech available

**Research World**:
1. Tech slider maximized
2. Minimal defense (interior location)

---

Next: See `production.md` for slider mechanics.
