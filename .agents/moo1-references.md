# Master of Orion 1 Reference Sources

This file lists authoritative sources for MOO1 mechanics. Agents should use `web_fetch` to access these when writing or verifying specifications.

## Primary Sources

### StrategyWiki - Complete Guide
Comprehensive community-maintained wiki with detailed mechanics.

| Topic | URL |
|-------|-----|
| **Main Page** | https://strategywiki.org/wiki/Master_of_Orion |
| **Table of Contents** | https://strategywiki.org/wiki/Master_of_Orion/Table_of_Contents |
| **Gameplay Overview** | https://strategywiki.org/wiki/Master_of_Orion/Gameplay |
| **How to Begin** | https://strategywiki.org/wiki/Master_of_Orion/How_to_begin |
| **Walkthrough** | https://strategywiki.org/wiki/Master_of_Orion/Walkthrough |
| **Game Roadmap** | https://strategywiki.org/wiki/Master_of_Orion/Game_roadmap |
| **Tips and Tricks** | https://strategywiki.org/wiki/Master_of_Orion/Tips_and_Tricks |
| **Technology** | https://strategywiki.org/wiki/Master_of_Orion/Technology |
| **Ship Design** | https://strategywiki.org/wiki/Master_of_Orion/Ship_design |
| **Combat** | https://strategywiki.org/wiki/Master_of_Orion/Combat |
| **Races** | https://strategywiki.org/wiki/Master_of_Orion/Races |
| **Planets** | https://strategywiki.org/wiki/Master_of_Orion/Planets |
| **Diplomacy** | https://strategywiki.org/wiki/Master_of_Orion/Diplomacy |

### Official Strategy Guide (Archive.org)
The original official MicroProse strategy guide - **HIGHLY AUTHORITATIVE**

| Resource | URL |
|----------|-----|
| **Strategy Guide (Full Text)** | https://archive.org/stream/MasterOfOrionStrategyGuide/MasterOfOrionStrategyGuide_opt_djvu.txt |
| **Strategy Guide (PDF/Images)** | https://archive.org/details/MasterOfOrionStrategyGuide |

### Master of Orion Wiki (Fandom)
Another community resource with detailed mechanics.

| Resource | URL |
|----------|-----|
| **Main Wiki** | https://masteroforion.fandom.com/wiki/Master_of_Orion |

## Usage Example

```python
# Fetch a reference page
web_fetch(url="https://strategywiki.org/wiki/Master_of_Orion/Technology")

# Fetch the official strategy guide text
web_fetch(url="https://archive.org/stream/MasterOfOrionStrategyGuide/MasterOfOrionStrategyGuide_opt_djvu.txt")
```

## IMPORTANT: MOO1 vs MOO2

These are DIFFERENT games with different mechanics:

| Aspect | MOO1 (1993) - USE THIS | MOO2 (1996) - IGNORE |
|--------|------------------------|----------------------|
| URL pattern | `/Master_of_Orion/` | `/Master_of_Orion_II:_Battle_at_Antares/` |
| Ship design | Fixed size classes | Modular design |
| Combat | Stack-based | Individual ships |
| Tech tree | Exclusive choices | All techs available |

**Always verify you're reading MOO1 content, not MOO2!**

## Key Things to Verify

1. **Formula Accuracy**: Cross-reference formulas with multiple sources when possible.

2. **Race Bonuses**: Verify exact percentages and effects for each race.

3. **Tech Tree**: Confirm tech names, costs, and effects match MOO1.

4. **Combat Mechanics**: MOO1 uses stack-based combat, not individual ships.

## Notes

- The original game manual is in the project (referenced during initial design)
- When in doubt, the Archive.org Strategy Guide is the most authoritative
- Some formulas may need reverse-engineering from gameplay descriptions
- The StrategyWiki pages have good community-verified information
