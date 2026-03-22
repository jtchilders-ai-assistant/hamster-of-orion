# Current Task: spec-023 (REVISION REQUIRED)

## Task Details
- **ID**: spec-023
- **Title**: Difficulty Level Modifiers
- **Output File**: design/game-mechanics/difficulty.md
- **Retry**: 1 of 3

## Original Description
Document exact modifiers for each difficulty: AI bonuses, player handicaps, starting conditions, event frequency. Update design/game-mechanics/difficulty.md with JSON data

## REVISION REQUIRED - Previous Verification Failed

### Critical Issue (must fix):
**The task explicitly requires JSON data but the document contains none.**

### Required Additions:

1. **Add JSON block for difficulty modifiers**:
```json
{
  "difficulty_levels": {
    "easy": {
      "player_production_multiplier": 1.25,
      "player_research_multiplier": 1.25,
      "player_combat_modifier": 0.10,
      "ai_production_multiplier": 1.0,
      "ai_research_multiplier": 1.0,
      ...
    },
    "normal": { ... },
    "hard": { ... },
    "impossible": { ... }
  }
}
```

2. **Add event frequency modifiers** - How difficulty affects random event chances

3. **Add starting conditions as structured data** - Exact counts for starting techs, money, ships

4. **Add custom difficulty schema** - Parameter ranges with min/max/default values

### Keep
- The existing prose descriptions are good for context
- The race difficulty recommendations are helpful
- Achievement section is nice flavor

### Goal
Transform this from a player guide into an implementation-ready specification with exact numeric data in JSON format.
