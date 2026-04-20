# Current Task: planet-screen

## Task ID
planet-screen

## Name
Planet management screen

## Description
Implement `src/ui/screens/PlanetScreen.ts` — a full planet management screen with the 5 production sliders (SHIP / DEF / IND / ECO / TECH).

## Key References
- `design/economy/slider-mathematics.md` — formulas, rebalancing algorithm, locking mechanics
- `design/ui-ux/wireframes/moo1-reference-wireframes.md` — MOO1 galaxy map right-panel wireframe shows slider layout
- `src/game/state.ts` — `Planet`, `PlanetProduction`, `UIState` types
- `src/game/actions/colony.ts` — `updateProduction(planetId, sliders)` action
- `src/game/systems/production.ts` — `calculateProduction` for preview numbers
- `src/ui/screens/ColoniesScreen.ts` — reference for existing screen pattern

## Acceptance Criteria
1. 5 sliders render with current values from planet's `production` state (ship/defense/industry/ecology/research)
2. Dragging/interacting with a slider updates the allocation
3. Sliders auto-rebalance so they always sum to 100% (use the algorithm from slider-mathematics.md §7)
4. Shows production output preview (net BC, RP, factory construction progress)
5. Accessible from galaxy map: when a planet is selected (`ui.selectedPlanet` is set), this screen is shown; clicking a planet on the galaxy map should set `ui.currentScreen = 'planet'` and `ui.selectedPlanet = planetId`

## Implementation Details

### File to create
`src/ui/screens/PlanetScreen.ts`

### May also need to modify
- `src/game/actions/colony.ts` — if slider actions need to be extended (e.g., add `lockSlider` action)
- `src/game/store.ts` — handle `UPDATE_PRODUCTION` and any new actions in reducer
- `src/ui/screens/GalaxyScreen.ts` — wire up planet click to navigate to PlanetScreen

### Slider Rebalance Algorithm (from slider-mathematics.md §7)
```
When player adjusts slider X to new_value:
  delta = new_value - old_value
  adjustable = all unlocked sliders EXCEPT X
  if no adjustable → reject (need at least one unlocked)
  total_adjustable = sum of adjustable values
  for each adjustable slider s:
    if total_adjustable > 0:
      s.value -= delta * (s.value / total_adjustable)
    else:
      s.value -= delta / len(adjustable)
    s.value = max(0, s.value)
  # Fix rounding: ensure sum == 100
  remainder = 100 - sum(all slider values)
  adjustable[-1].value += remainder
```

### Production Preview
Use `calculateProduction` (or a simplified version) to show:
- Net BC/turn
- Scientists (TECH slider population × base RP)
- IND progress toward next factory

### Slider Labels
```
SHIP  → Shipbuilding (BC allocated to current build queue)
DEF   → Defense (missile bases & shields)
IND   → Industry (factory construction)
ECO   → Ecology (cleanup, growth, terraforming)
TECH  → Research (diverts population to science)
```

## Tests Required
Create `test/ui/PlanetScreen.test.ts` (or if pure logic extracted, `test/game/systems/sliderRebalance.test.ts`):
- Test rebalance when one slider is adjusted
- Test rebalance with a locked slider
- Test that sum always == 100 after rebalance
- Test rejection when only one unlocked slider exists

Extract the rebalance logic as a pure function in `src/game/systems/production.ts` or `src/game/utils/sliders.ts` so it can be unit tested without DOM.

## Output
When complete, update `workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "planet-screen",
  "worker_output": {
    "files_created": ["src/ui/screens/PlanetScreen.ts", "..."],
    "files_modified": ["..."],
    "tests_added": ["test/..."],
    "summary": "..."
  }
}
```
