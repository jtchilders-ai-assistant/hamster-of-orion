# Task: Basic AI opponent (`ai-basic`)

## Dependencies
- ✅ `fleet-state` — Fleet state and actions
- ✅ `colonization` — Colony ship and colonization

## Description
Basic AI that manages production, builds ships, expands to nearby planets. Reference design/species/ai-archetypes.md for personality types.

## Output
`src/game/ai/AIEmpire.ts`, `src/game/ai/strategies.ts`

## Acceptance Criteria
- [ ] AI sets production sliders
- [ ] AI builds colony ships early game
- [ ] AI colonizes nearby planets
- [ ] AI builds military ships
- [ ] AI sends fleets to attack if at war
- [ ] No DOM imports
- [ ] Unit tests pass

## Notes
- Dependencies `fleet-state` and `colonization` are both completed
- `fleet-state` provides fleet management primitives
- `colonization` provides colony ship mechanics
