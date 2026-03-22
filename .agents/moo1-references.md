# Master of Orion 1 Reference Sources

This file lists authoritative sources for MOO1 mechanics. Agents should use `web_fetch` to access these when writing or verifying specifications.

## Primary Sources

### StrategyWiki (Recommended)
Comprehensive community-maintained wiki with detailed mechanics.

| Topic | URL |
|-------|-----|
| **Main Page** | https://strategywiki.org/wiki/Master_of_Orion |
| **Gameplay Overview** | https://strategywiki.org/wiki/Master_of_Orion/Gameplay |
| **Technology** | https://strategywiki.org/wiki/Master_of_Orion/Technology |
| **Ship Design** | https://strategywiki.org/wiki/Master_of_Orion/Ship_design |
| **Combat** | https://strategywiki.org/wiki/Master_of_Orion/Combat |
| **Races** | https://strategywiki.org/wiki/Master_of_Orion/Races |
| **Planets** | https://strategywiki.org/wiki/Master_of_Orion/Planets |
| **Diplomacy** | https://strategywiki.org/wiki/Master_of_Orion/Diplomacy |

### Usage Example

```
web_fetch with url: "https://strategywiki.org/wiki/Master_of_Orion/Technology"
```

## Key Things to Verify

1. **MOO1 vs MOO2**: These games have different mechanics. Always verify you're using MOO1 (1993) data, not MOO2 (1996).

2. **Formula Accuracy**: Cross-reference formulas with multiple sources when possible.

3. **Race Bonuses**: Verify exact percentages and effects for each race.

4. **Tech Tree**: Confirm tech names, costs, and effects match MOO1.

## Notes

- The original game manual is in the project (referenced during initial design)
- When in doubt, favor StrategyWiki as it has detailed mechanics breakdowns
- Some formulas may need reverse-engineering from gameplay descriptions
