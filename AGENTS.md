# AGENTS.md - Hamster of Orion Specification Project

This file contains patterns, conventions, and learnings for AI agents working on this game design specification.

## Project Overview

**Hamster of Orion** is a web-based 4X strategy game faithfully recreating Master of Orion (1993) mechanics with a pet-themed setting. We are completing the game design specification - documenting all math, algorithms, and data needed for implementation.

## Key Design Principles

1. **MOO1 Faithful**: Follow Master of Orion 1 mechanics exactly (not MOO2)
2. **Dignified Ridiculousness**: Serious gameplay with absurd premise (sentient pets in space)
3. **Implementation-Ready**: Specifications should be directly usable by developers
4. **Data-Driven**: Provide JSON-ready data tables wherever possible

## Reference Materials

- `design/LORE.md` - Complete lore and setting (USE THIS FOR NAMING)
- `design/` folder - Existing design documents
- MOO1 manual PDF - Original game reference
- MOO1 wiki: https://masteroforion.fandom.com/wiki/Master_of_Orion

## The 10 Races (Pet-Themed)

| Race | MOO1 Equivalent | Key Trait |
|------|-----------------|-----------|
| Budgies | Alkari | +3 Ship Defense, Pilot bonus |
| Guinea Pigs | Bulrathi | +25 Ground Combat |
| Chameleons | Darloks | +60% Spy bonus |
| Hamsters | Humans | Diplomatic, Balanced |
| Ants | Klackons | +2 Production |
| Mice | Meklar | +2 Production (Cybernetic) |
| Ferrets | Mrrshan | +4 Ship Attack |
| Rats | Psilons | +50% Research |
| Rabbits | Sakkra | +2 Population Growth |
| Hermit Crabs | Silicoid | Ignore planet hostility |

## File Conventions

### Specification Files Should Include:

```markdown
# System Name

## Overview
Brief description of the system

## Formulas
Exact mathematical formulas with variable definitions

## Constants
All magic numbers with explanations

## Algorithm (if applicable)
Pseudocode or step-by-step logic

## Data Tables (JSON)
Complete stat tables ready for implementation

## Edge Cases
How to handle special situations

## Examples
Worked examples showing calculations
```

### JSON Data Format

```json
{
  "id": "snake_case_id",
  "name": "Display Name",
  "description": "Human-readable description",
  "stats": { },
  "cost": 0,
  "tech_level": 1
}
```

## MOO1 Key Mechanics Reference

### Production Formula (General)
- Base Production = Factories × Worker Efficiency
- Racial modifiers apply multiplicatively
- Difficulty modifiers stack

### Research Formula (General)
- RP = Scientists × Labs × Racial Bonus
- Tech cost scales with tier
- Miniaturization: 5% size reduction per tech level above

### Combat Formula (General)
- Hit Chance = 50 + Computer - ECM + Size Modifier - Range Penalty
- Damage = Weapon Damage × (1 - Shield Absorption)

## Gotchas & Learnings

<!-- Agents: Add discoveries here so future sessions don't repeat mistakes -->

- MOO1 uses integer math - document rounding rules
- Factory count is per-planet, not global
- Research points pool empire-wide
- Shield absorption is percentage-based
- Missiles can be shot down by point defense

## File Structure

```
design/
├── economy/           # NEW - Economic formulas
│   ├── factory-formulas.md
│   ├── population-growth.md
│   └── ship-costs.md
├── planets/           # Planetary systems
├── ships/             # Ship design & combat
├── technology/        # Tech tree (6 fields)
├── diplomacy/         # Relations & treaties
├── galaxy/            # Map generation
├── game-mechanics/    # Core game rules
├── species/           # Race definitions
├── technical/         # Implementation details
└── ui-ux/            # Interface design
```

## Recent Changes

<!-- Agents: Log significant changes here -->

- 2026-03-21: Project initialized for specification completion
- 2026-03-21: Created 25 specification tasks in tasks.json
