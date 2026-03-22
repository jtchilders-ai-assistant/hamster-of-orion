# Current Task: spec-021

## Title
Random Events System

## Description
Document all random events: trigger conditions, probability, effects, duration. Include space monsters, discoveries, disasters, opportunities. Update design/game-mechanics/random-events.md

## Output File
design/game-mechanics/random-events.md

## Priority
21

## Requirements
- Complete list of all random events from MOO1
- Trigger conditions for each event
- Probability/frequency of occurrence
- Effects (positive/negative/neutral)
- Duration if applicable
- Space monsters (Guardian, Space Amoeba, Space Crystal)
- Discoveries (Orion, artifacts, derelicts)
- Disasters (plague, rebellion, comet)
- Opportunities (leaders, technology finds)
- JSON data structures where appropriate

---

## ⚠️ REVISION REQUIRED (Attempt 2/3)

Verification failed with score 52/100. Please address these issues:

### Critical (must fix):
1. **Add probability weights** - Include EVENT_WEIGHTS JSON with probability for each event type and selection algorithm
2. **Add trigger conditions** - Each event needs: turn requirements, tech prerequisites, galaxy state requirements
3. **Add missing MOO1 events**:
   - Guardian of Orion (guards Orion system)
   - Space Pirates (random fleet raids)
   - Comet (can destroy planet)
   - Rebellion (colony revolt)
   - Supernova (star death, destroys system)
   - Leader/Scientist recruitment events

### Major (should fix):
4. **Add JSON data structures** - EVENT_TYPES, MONSTER_STATS, DISASTER_EFFECTS constants
5. **Add duration fields** - Specify how long ongoing effects last in turns

### Minor:
6. **Pet-themed names** - Rename monsters per LORE.md conventions

Revise `design/game-mechanics/random-events.md` to address all issues.
