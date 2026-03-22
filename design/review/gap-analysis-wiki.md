# Gap Analysis: Hamster of Orion vs. Master of Orion 1 Reference Sources

**Review ID:** review-002
**Date:** 2026-03-22
**Status:** Complete
**Sources Consulted:**
- Master of Orion Official Strategy Guide (Prima Publishing, 1994)
- StrategyWiki MOO1 pages (access blocked - Cloudflare protection)
- MoO Fandom Wiki
- CivFanatics Forums discussions
- Community reference materials

---

## Executive Summary

This document compares the Hamster of Orion specifications against canonical Master of Orion 1 mechanics as documented in the Official Strategy Guide and community resources. Overall, the specifications demonstrate strong adherence to MOO1 principles with intentional deviations for the pet-themed setting.

**Key Findings:**
- ✅ **Well-Aligned:** Technology system, six-field structure, miniaturization
- ✅ **Well-Aligned:** Factory/production formulas, Robotic Controls progression
- ⚠️ **Minor Gap:** Combat accuracy formula differs from MOO1
- ⚠️ **Minor Gap:** Some tech tier costs don't match MOO1's exponential curve
- ⚠️ **Minor Gap:** Miniaturization rate (5% per tier) differs from MOO1 (varies by component)
- ❌ **Design Decision:** Ground combat simplified (MOO1 had complex kill ratios)
- ❌ **Missing:** Some MOO1 random events not specified
- ❌ **Missing:** Detailed missile base mechanics

---

## 1. Race Abilities Comparison

### 1.1 MOO1 Original Races vs. Hamster of Orion Equivalents

| MOO1 Race | Ability | HoO Race | Ability | Gap Status |
|-----------|---------|----------|---------|------------|
| **Alkari** | +3 Defense, +3 Initiative | **Budgies** | +3 Defense, +1 Speed | ⚠️ **Partial** |
| **Bulrathi** | +25 Ground Combat | **Guinea Pigs** | +50% Ground Combat | ✅ **Enhanced** |
| **Darloks** | +80% Spy | **Chameleons** | +60% Spy | ⚠️ **Reduced** |
| **Humans** | 2× Diplomacy, +25% Trade | **Hamsters** | 2× Diplomacy, +25% Trade | ✅ **Match** |
| **Klackons** | +50% Production | **Ants** | +50% Production | ✅ **Match** |
| **Meklars** | +2 Factory/Pop | **Mice** | +25% Production, +15% Research | ⚠️ **Different** |
| **Mrrshans** | +4 Attack | **Ferrets** | +25% Damage | ⚠️ **Different** |
| **Psilons** | +50% Research | **Rats** | +50% Research, 3 tech choices | ✅ **Match+** |
| **Sakkra** | +100% Population Growth | **Rabbits** | +100% Population Growth | ✅ **Match** |
| **Silicoids** | No food/environment penalties | **Hermit Crabs** | Universal Adaptation | ✅ **Match** |

### 1.2 Detailed Discrepancies

#### Budgies vs. Alkari
**MOO1 Alkari:**
- +3 Defense bonus to all ships (reduces enemy hit chance)
- +3 Initiative bonus (act first in combat)
- Per Strategy Guide: "Alkari pilots add three levels of defense to any spacecraft"

**HoO Budgies:**
- +3 Defense (matches)
- +1 Speed/Movement range
- Missing: Explicit +3 Initiative

**Recommendation:** Add "+3 Initiative in combat" to Budgies for full parity, or document this as intentional simplification.

#### Chameleons vs. Darloks
**MOO1 Darloks:**
- +80% spy success rate
- Stealth ships (cloaking bonus)
- Universal distrust: -10 relations with all races

**HoO Chameleons:**
- +60% spy success rate (lower)
- Frame job ability (additional)
- -10 relations with all races (matches)

**Gap:** Spy bonus is 20% lower. This may be intentional for balance.
**Recommendation:** Document the -20% spy reduction as intentional balance change, or increase to +80%.

#### Mice vs. Meklars
**MOO1 Meklars:**
- +2 Robotic Controls (start with 4:1 factory ratio vs. base 2:1)
- No other bonuses

**HoO Mice:**
- +25% Production modifier
- +15% Research modifier
- No explicit Robotic Controls head start

**Gap:** Different implementation. Meklars had a specific tech advantage, Mice have flat bonuses.
**Recommendation:** Consider adding "+2 starting Robotic Controls" to Mice, or document as intentional redesign for broader utility.

#### Ferrets vs. Mrrshans
**MOO1 Mrrshans:**
- +4 Attack level (to-hit bonus)
- This stacked with Battle Computer bonuses

**HoO Ferrets:**
- +25% weapon damage
- No accuracy bonus mentioned

**Gap:** Different mechanic entirely. Attack bonus (accuracy) vs. Damage bonus.
**Recommendation:** Either change to "+4 Attack accuracy" or document as intentional design shift (damage vs. accuracy tradeoff).

---

## 2. Technology System Comparison

### 2.1 Structure

| Aspect | MOO1 | HoO | Status |
|--------|------|-----|--------|
| Number of fields | 6 | 6 | ✅ Match |
| Field names | Computers, Construction, Force Fields, Planetology, Propulsion, Weapons | Same | ✅ Match |
| Random tech selection | 2-3 choices per tier | 2-3 choices (Rats get 3) | ✅ Match |
| Miniaturization | Yes | Yes | ✅ Match |
| Tech trading | Yes | Yes | ✅ Match |
| Tech stealing | Yes | Yes | ✅ Match |

### 2.2 Research Cost Progression

**MOO1 (from Strategy Guide Table 10-1):**
| Tech Level | Approx RP Cost |
|------------|----------------|
| 1-5 | 100-500 |
| 6-10 | 600-1500 |
| 11-15 | 2000-5000 |
| 16-20 | 6000-15000 |
| 21-30 | 15000-50000 |
| 31-50 | 50000-200000+ |

**HoO (from research-formulas.md):**
| Tier | Cost |
|------|------|
| 1 | 50 |
| 5 | 500 |
| 10 | 6,000 |
| 15 | 24,000 |
| 20 | 100,000 |

**Gap Analysis:**
- MOO1 uses **Tech Level** (1-50 scale) per field
- HoO uses **Tiers** (1-20 scale) per field
- The cost progression is similar but HoO jumps faster in mid-game

**Recommendation:** Consider adding more granularity to tech tiers (1-50 instead of 1-20) for closer MOO1 parity, or document the compressed tier system as intentional.

### 2.3 Miniaturization

**MOO1 (Strategy Guide Table 10-2):**
```
Cost and Size Reduction Per Tech Level Advance:
Level 1 above: 10% reduction
Level 2 above: 15% reduction
Level 3 above: 20% reduction
Level 4 above: 25% reduction
Level 5 above: 30% reduction
Level 6 above: 35% reduction
Level 7 above: 40% reduction
Level 8 above: 44% reduction
Level 9 above: 48% reduction
Level 10+ above: 50% (maximum)
```

**HoO (from research-formulas.md):**
```
Size_Reduction = (Current_Tier - Tech_Tier) × 0.05
Minimum Size = 20% of original
```

**Gap Analysis:**
- MOO1 has variable reduction rates (10% → 5% → 5% → 4% → 4%...)
- HoO uses flat 5% per tier difference
- MOO1 maximum reduction: 50%
- HoO maximum reduction: 80% (capped at 20% minimum size)

**Discrepancy:** HoO allows greater miniaturization (up to 80% reduction) than MOO1 (50% cap).

**Recommendation:** Consider capping miniaturization at 50% reduction to match MOO1, or document as intentional enhancement.

### 2.4 Research Buildings

**MOO1:**
| Building | RP Multiplier | Tech Level |
|----------|---------------|------------|
| Research Lab | +50% | Early |
| Planetary Supercomputer | +100% (cumulative) | Mid |
| Galactic Cybernet | +100% additional (if present) | Late |

Total possible: ~3.5× with all buildings

**HoO (from research-formulas.md):**
| Building | Multiplier | Cumulative |
|----------|------------|------------|
| Research Lab | +50% | 1.5× |
| Supercomputer | +100% | 2.5× |
| Autolab | +150% | 4.0× |
| Galactic Cybernet | +200% | 6.0× |

**Gap Analysis:**
- HoO adds "Autolab" (not in MOO1)
- HoO total multiplier (6×) exceeds MOO1 (~3.5×)
- MOO1 building bonuses were less straightforward

**Recommendation:** Consider reducing total multiplier cap, or document Autolab as HoO-specific addition.

---

## 3. Combat Mechanics Comparison

### 3.1 Hit Probability

**MOO1 (Strategy Guide Table 7-3):**
```
Hit_Chance = 50% + (Attack_Level - Defense_Level) × 5%
Minimum: 5%
Maximum: 95%
```

Where:
- Attack_Level = Battle Computer Mark + Weapon Attack Bonuses
- Defense_Level = ECM Jammer Level + Ship Maneuver Level

**HoO (from combat-mechanics.md):**
```
Hit_Chance = 70% - (Range_Penalty) + (Computer_Bonus) - (ECM_Penalty) + (Size_Modifier)
```

**Gap Analysis:**
- MOO1 uses differential system (Attack vs. Defense)
- HoO uses additive system with base 70%
- MOO1 baseline: 50%; HoO baseline: 70%
- Range penalties not explicit in MOO1 base formula

**Discrepancy:** Fundamentally different formula structure. HoO is more complex but less faithful.

**Recommendation:** Consider adopting MOO1's simpler differential formula:
```
Hit_Chance = 50% + (Computer_Level - ECM_Level - Maneuver) × 5%
```

### 3.2 Initiative Order

**MOO1:**
- Base initiative from race (+3 for Alkari)
- Modified by ship maneuver class
- Higher initiative moves/fires first

**HoO:**
- Speed = Engine + Propulsion Tech + Combat Speed
- Budgies get bonus initiative (not quantified)

**Gap:** Initiative system is present but less detailed in HoO specs.

**Recommendation:** Add explicit initiative formula to combat-mechanics.md.

### 3.3 Shield Absorption

**MOO1 (Strategy Guide Table F-1):**
| Shield Class | Absorption Per Hit |
|--------------|-------------------|
| Class I | 1 |
| Class II | 2 |
| Class III | 3 |
| Class IV | 4 |
| Class V | 5 |
| Planetary V | 5 |
| Planetary X | 10 |
| Planetary XV | 15 |
| Planetary XX | 20 |

**HoO:**
Shields mentioned but no specific absorption values found in specs.

**Gap:** Shield absorption values not specified in HoO documentation.

**Recommendation:** Add shield absorption table to force-fields.md or combat-mechanics.md.

### 3.4 Ground Combat

**MOO1 (Strategy Guide Table 8-11):**
```
Kill Ratio = Attacker_Tech / Defender_Tech × Racial_Modifier × Terrain_Modifier

Bulrathi Ground Bonus: ×1.25 attack strength
Personal weapon techs: +5 to +30 to attack/defense
Armor techs: +0 to +30 to defense
```

The combat was resolved through iterative rounds with specific casualty formulas.

**HoO (from combat-mechanics.md):**
```
Attacker_Strength = Troops × Tech_Bonus × Racial_Bonus
Defender_Strength = Garrison × Fortifications × Racial_Bonus
Higher strength wins, casualties both sides

Guinea Pigs: +50% ground combat (higher than MOO1's +25%)
```

**Gap Analysis:**
- HoO simplified ground combat to strength comparison
- MOO1 had complex kill ratio tables with multiple rounds
- Guinea Pigs have higher bonus than MOO1 Bulrathi

**Recommendation:** Document simplified ground combat as intentional design choice. Consider whether +50% is too strong compared to MOO1's +25%.

---

## 4. Economic Formulas Comparison

### 4.1 Factory Production

**MOO1 (Strategy Guide Ch. 6):**
```
Factory_Output = 1 BC per factory
Population_Output = 0.5 BC per colonist
Total_Production = Factories + (Population × 0.5)

Factory Cost = 10 BC (base)
Industrial Tech 9 → 2: Reduces cost from 10 to 2 BC
```

**HoO (from factory-formulas.md):**
```
Base_Factory_Output = 1 BC per factory per turn
Base_Population_Output = 0.5 BC per colonist

Factory Cost Table matches MOO1 (10 BC → 2 BC progression)
```

**Status:** ✅ **Perfect Match**

### 4.2 Robotic Controls

**MOO1:**
| Tech | Factory:Pop Ratio |
|------|-------------------|
| None | 2:1 |
| RC II | 3:1 |
| RC III | 4:1 |
| RC IV | 5:1 |
| RC V | 6:1 |
| RC VI | 7:1 |

**HoO (from factory-formulas.md):**
Identical progression (2:1 to 7:1).

**Status:** ✅ **Perfect Match**

### 4.3 Industrial Waste/Pollution

**MOO1 (Strategy Guide Table 6-3):**
```
Waste cleanup cost = Operating_Factories × Pollution_Rate × 0.5 BC

Reduced Industrial Waste techs: 80% → 60% → 40% → 20% → 0%
```

**HoO (from factory-formulas.md):**
```
Base_Pollution = Operating_Factories × Pollution_Rate
Cleanup_Cost = Pollution_Generated × 0.5 BC

Waste Reduction: 1.00 → 0.80 → 0.60 → 0.40 → 0.20 → 0.00
```

**Status:** ✅ **Perfect Match**

### 4.4 Population Growth

**MOO1 (Strategy Guide Ch. 6):**
```
Growth follows logistic curve: faster when low, slower near max
Base growth rate approximately 10% of current population
Modified by environment and cloning tech
```

**HoO (from population-growth.md):**
```
Growth_Per_Turn = Population × 0.10 × Environment_Mod × Racial_Mod × (1 - Pop/MaxPop)
```

**Status:** ✅ **Conceptually Matches** (logistic growth model)

### 4.5 Terraforming

**MOO1:**
```
Terraforming increases max population in increments
Costs scale with amount being terraformed
Soil Enrichment provides multiplicative bonus
```

**HoO (from population-growth.md):**
| Tech | Bonus |
|------|-------|
| Terraforming +10 | +10 max pop |
| ... | ... |
| Terraforming +120 | +120 max pop |
| Soil Enrichment | 1.25× |
| Advanced Soil (Gaia) | 1.50× |

**Gap Analysis:**
- HoO has more terraforming tiers than MOO1
- Bonuses are cleaner (fixed values vs. MOO1's variable)

**Status:** ⚠️ **Minor Enhancement** - More tiers, cleaner numbers

---

## 5. Missile Base Mechanics

### 5.1 MOO1 Missile Base Details

**From Strategy Guide Table 8-1:**
```
Single Missile Base Cost Breakdown:
- Base Structure: 50 BC
- Computer (Mark X): Variable
- ECM (Jammer X): Variable  
- Shields (Class X): Variable
- Missiles: Variable based on type

Total cost varies from ~150 BC (early game) to 500+ BC (late game)
```

**From Strategy Guide:**
- Missile bases fire 3 volleys per combat round
- Bases can switch missile types during combat
- Bases automatically upgrade to best available tech

**HoO Documentation:**
- Missile bases mentioned in combat-mechanics.md briefly
- No detailed cost breakdown found
- No volley count specified

**Gap:** ❌ **Missing** - Detailed missile base specifications not found in HoO docs.

**Recommendation:** Create missile-bases.md with:
- Cost formula
- Volley count per combat round
- Tech upgrade mechanics
- Combat behavior

---

## 6. Diplomacy Comparison

### 6.1 Relationship Scale

**MOO1 (Strategy Guide Table 11-1):**
```
Relations Bar Values:
-100 to -80: War
-79 to -60: Feud
-59 to -40: Hostile
-39 to -20: Unease
-19 to 0: Neutral
+1 to +20: Relaxed
+21 to +40: Affable  
+41 to +60: Amiable
+61 to +80: Harmonious
+81 to +100: Unity
```

**HoO (from relationship-formulas.md):**
```
-100 to -50: War (Hostile)
-49 to -1: Unfriendly (Cold)
0 to +49: Neutral (Cautious)
+50 to +79: Friendly (Warm)
+80 to +100: Allied (United)
```

**Gap Analysis:**
- MOO1 had 10 relation states
- HoO has 5 relation states
- HoO simplified the granularity

**Recommendation:** Document as intentional simplification for cleaner UI/UX.

### 6.2 Human/Hamster Diplomatic Bonus

**MOO1 (Humans):**
- All positive diplomatic actions have 2× effect
- +25% trade income
- Start at Neutral with all races

**HoO (Hamsters):**
- All positive diplomatic actions have 2× effect ✅
- +25% trade income ✅
- Universal Neutrality: Start at Neutral with all races ✅
- Additional: +5 treaty bonus, +5 council bonus

**Status:** ✅ **Match with Enhancements**

### 6.3 Treaty Types

**MOO1:**
- Peace Treaty
- Trade Agreement
- Non-Aggression Pact
- Alliance

**HoO:**
- Peace Treaty
- Trade Agreement
- Non-Aggression Pact
- Research Pact
- Defensive Pact
- Military Alliance

**Gap:** HoO adds Research Pact and separates Alliance into Defensive/Military variants.

**Status:** ⚠️ **Enhancement** - More treaty types for deeper diplomacy

---

## 7. Missing Specifications

### 7.1 Random Events

**MOO1 Events (from Strategy Guide Ch. 14):**
- Ancient Derelict (found tech)
- Comet (planetary threat)
- Computer Virus (lose RP)
- Depleted Planet (lose minerals)
- Diplomatic Blunder (-relations)
- Donation (free BC)
- Earthquake (lose factories)
- Fertile Planet (+population)
- Industrial Accident (lose factories)
- Mineral-Rich Planet (+production)
- Piracy (lose BC)
- Plague (lose population)
- Rebellion (planet revolts)
- Space Monsters (Amoeba, Crystal)
- Super Nova (lose planet)

**HoO Documentation:**
Random events mentioned but no comprehensive list found.

**Gap:** ❌ **Missing** - Need events.md specification

**Recommendation:** Create random-events.md listing all events with probabilities and effects.

### 7.2 Space Monsters

**MOO1:**
- Space Amoeba: Regenerates HP, requires sustained firepower
- Space Crystal: Immune to beams, vulnerable to missiles

**HoO:**
Not specified in reviewed documents.

**Gap:** ❌ **Missing** - Space monster specifications needed

**Recommendation:** Add space monsters to events or create guardians.md

### 7.3 Orion Guardian

**MOO1:**
```
Guardian Ship Stats:
- Massive HP (~32,000)
- Death Ray, Black Hole Generator, Mauler Device
- Class XV Shields
- Perfect Cloaking until engaged
```

**HoO:**
Guardian mentioned but not detailed.

**Gap:** ⚠️ **Incomplete** - Guardian needs full specification

---

## 8. Summary Tables

### 8.1 Feature Compliance Matrix

| Category | Subcategory | MOO1 | HoO | Status |
|----------|-------------|------|-----|--------|
| **Races** | Count | 10 | 10 | ✅ |
| | Ability mapping | See Sec 1 | See Sec 1 | ⚠️ Some differences |
| **Tech** | 6 Fields | Yes | Yes | ✅ |
| | Random selection | 2-3 | 2-3 | ✅ |
| | Miniaturization | 50% max | 80% max | ⚠️ |
| | Research buildings | 3 | 4 | ⚠️ |
| **Combat** | Turn-based tactical | Yes | Yes | ✅ |
| | Hit formula | Differential | Additive | ⚠️ |
| | Initiative | +3 Alkari | Mentioned | ⚠️ |
| | Shields | Absorption values | Not specified | ❌ |
| | Ground combat | Kill ratios | Simplified | ⚠️ |
| **Economy** | Factory output | 1 BC | 1 BC | ✅ |
| | Factory cost | 10→2 BC | 10→2 BC | ✅ |
| | Robotic Controls | 2:1→7:1 | 2:1→7:1 | ✅ |
| | Pollution | Yes | Yes | ✅ |
| | Pop growth | Logistic | Logistic | ✅ |
| **Diplomacy** | Relation scale | 10 states | 5 states | ⚠️ |
| | Human bonus | 2× positive | 2× positive | ✅ |
| | Treaties | 4 types | 6 types | ✅+ |
| **Events** | Random events | 15+ types | Not specified | ❌ |
| | Space monsters | 2 types | Not specified | ❌ |
| **Special** | Missile bases | Detailed | Brief | ❌ |
| | Orion Guardian | Detailed | Brief | ⚠️ |

### 8.2 Priority Recommendations

**High Priority (Core Gameplay):**
1. Add shield absorption values to spec
2. Document missile base mechanics fully
3. Create random events specification
4. Clarify combat hit formula decision (keep or change to MOO1)

**Medium Priority (Balance):**
5. Review miniaturization cap (80% vs 50%)
6. Review Chameleon spy bonus (60% vs 80%)
7. Review Guinea Pig ground bonus (50% vs 25%)
8. Consider Meklar-equivalent Robotic Controls for Mice

**Low Priority (Polish):**
9. Document simplified diplomacy states as intentional
10. Document simplified ground combat as intentional
11. Add initiative formula explicitly
12. Document Autolab as HoO addition

---

## 9. Appendix: Reference Sources Used

### Primary Sources
1. **Master of Orion: The Official Strategy Guide** (Prima Publishing, 1994)
   - Authors: Alan Emrich and Tom E. Hughes, Jr.
   - Obtained via Archive.org digitized text
   - Tables referenced: 6-1 through 15-4, Appendices B-I

### Secondary Sources
2. **CivFanatics Forums** - MOO1 race balance discussions
3. **Master of Orion Fandom Wiki** - Race ability summaries
4. **Various community guides** - Formula confirmations

### Inaccessible Sources
- StrategyWiki MOO1 pages (Cloudflare blocked)
- Some detailed weapon tables (not in Archive.org excerpt)

---

## 10. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-22 | Review Worker | Initial gap analysis |

---

*End of Gap Analysis Document*
