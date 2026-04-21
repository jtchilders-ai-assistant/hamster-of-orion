# Current Task: Verify All Design Doc Constants in Code

**ID**: constants-to-code
**Type**: code
**Output**: src/game/constants.ts (complete audit)

## Description
Audit all formulas and constants in design docs. Ensure each one appears in `src/game/constants.ts` with proper documentation. Run `npm run check-design` to verify compliance.

## Design Documents (MUST READ)
- `design/economy/factory-formulas.md` — Factory output, population output, factory cost, pollution/cleanup, racial modifiers, mineral richness, slider allocation, RC levels, Industrial Tech, waste reduction, eco restoration
- `design/economy/population-growth.md` — Growth rate, max population, environment modifiers, racial growth/food modifiers, cloning bonuses, morale modifiers, terraforming levels, soil enrichment, environment data
- `design/economy/slider-mathematics.md` — Slider allocation (production, research, military, defense, civic), civic budget, food allocation, morale formula, welfare costs
- `design/ships/combat-algorithm.md` — Combat damage, defense, attack, maneuverability, armor, hit points, ship design constants, hull/material types, maintenance costs
- `design/diplomacy/relationship-formulas.md` — Relationship changes, alliance maintenance, war declaration, tribute, espionage detection, trade income, council votes, espionage defense
- `design/technology/research-formulas.md` — RP calculation, research speed modifiers, tech categories, research cost scaling, field bonuses

## Acceptance Criteria
1. `npm run check-design` passes (zero errors/warnings)
2. All formulas in design docs have code equivalents in constants.ts
3. Each constant has a doc source reference (e.g. `// source: factory-formulas.md §2`)
4. No magic numbers in game systems
5. Tests verify formulas match docs

## Dependencies
- None

## Implementation Notes
- Read `src/game/constants.ts` to see current constants
- Compare against each design doc systematically
- Add/update constants and source comments as needed
- Run `npm run check-design` iteratively until clean
- Run `npm run typecheck` to ensure no breakage
