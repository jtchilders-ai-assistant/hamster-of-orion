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
| Budgies | Alkari | +50% Ship Defense (+5 effective), +3 Initiative, +20% Evasion |
| Guinea Pigs | Bulrathi | +25 Ground Combat |
| Chameleons | Darloks | +60% Spy bonus |
| Hamsters | Humans | Diplomatic, Balanced |
| Ants | Klackons | +2 Production |
| Mice | Meklar | +2 Production (Cybernetic) |
| Ferrets | Mrrshan | +4 Attack Level, +15% Weapon Damage (Deadly Accuracy) |
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
**Canonical formula** (see `design/ships/combat-algorithm.md` Section 9):
```
hit_chance = 50 + (battle_computer_rating × 5) - (target_defense × 5) + size_modifier - range_penalty + experience_modifier

Where:
  target_defense = ecm_rating + maneuver_rating
  size_modifier = (target_size_class - 1) × 5  # Scout = class 1
  range_penalty = {point_blank: -10, close: 0, medium: +5, long: +10, very_long: +20}
  experience_modifier = {rookie: -5, regular: 0, veteran: +5, elite: +10}
```
- Damage = Weapon Damage - Shield Absorption (shields absorb up to class value per hit)

## Variable Naming Conventions

**Formula Variables:** Use `snake_case` for all variables
**Formula Names:** Use `Title_Case` for formula definitions

| Concept | Standard Name |
|---------|---------------|
| Production modifier | `production_modifier` |
| Hit chance | `hit_chance` |
| Ship HP | `ship_hp` |
| Factory ratio | `robotic_controls_level` |
| Attack rating | `attack_rating` |
| Defense rating | `defense_rating` |
| Experience modifier | `experience_modifier` |

**JSON Keys:** Always use `snake_case` (e.g., `tech_level`, `attack_rating`)

## Gotchas & Learnings

<!-- Agents: Add discoveries here so future sessions don't repeat mistakes -->

- MOO1 uses integer math - document rounding rules
- Factory count is per-planet, not global
- Research points pool empire-wide
- Shield absorption is per-hit (shields absorb up to class value, not percentage)
- Missiles can be shot down by point defense
- Ferrets have BOTH +4 attack level AND +15% damage (two separate bonuses)
- Budgies have +50% defense (+5 effective) AND +3 initiative AND +20% evasion (three bonuses)
- Mice have stacking production bonuses: +25% base, +2 per pop, +50% factory efficiency
- Hamsters have +30% diplomacy stat AND 2× positive action multiplier (separate)

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
