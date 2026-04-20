# Current Task: starting-fleets

## Task ID
starting-fleets

## Name
Starting fleets per race

## Type
data

## Description
Define starting ship designs and fleets for each race. Reference design/species/race-stats-complete.md for starting techs.

## Output
src/data/starting-fleets.json

## Acceptance Criteria
- Each race has starting ship designs
- Starting fleet composition defined
- Ships use only starting techs
- Colony ship included for expansion

## Dependencies (all done)
- ship-components-data ✓

## Reference Files
- design/species/race-stats-complete.md
- src/data/components.json (ship components available)
- src/data/races.json (race definitions)
