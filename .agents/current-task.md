# Current Task: production-system

## Task ID
production-system

## Name
Production and sliders

## Description
Implement production calculation per design/economy/slider-mathematics.md

## Output Files
- Primary: `src/game/systems/production.ts`

## Acceptance Criteria
1. 5 sliders sum to 100% (SHIP, DEF, IND, ECO, TECH)
2. SHIP/DEF/IND/ECO/TECH calculations correct per design/economy/slider-mathematics.md
3. Pollution and cleanup work
4. Unit tests pass

## Dependencies (all done)
- turn-system ✓

## Steps

1. Read `design/economy/slider-mathematics.md` for exact formulas
2. Read `design/technical/data-structures.md` for Planet/Empire type definitions
3. Check existing `src/game/systems/turn.ts` for how production stub was wired in
4. Implement `src/game/systems/production.ts` with:
   - Slider validation (sum to 100)
   - Per-slider production allocation functions
   - Pollution and cleanup calculations
   - Wire into turn system (replace stub)
5. Write tests in `test/game/systems/production.test.ts`
6. Run `npm run typecheck && npm run test`
7. Update `.agents/workflow-state.json` with state="TESTING" and worker_output summary
