# Specification Consistency Report

## Overview

This document identifies inconsistencies, contradictions, and discrepancies across all specification files in the Hamster of Orion game design documentation. Each issue is categorized by severity and includes the affected files, the nature of the inconsistency, and a recommended resolution.

**Review Date:** 2026-03-22  
**Files Reviewed:** 30+ specification documents across economy, ships, technology, diplomacy, species, and galaxy systems  
**Status:** Complete

---

## Severity Levels

| Severity | Description |
|----------|-------------|
| 🔴 **Critical** | Direct contradictions that would break gameplay or cause implementation errors |
| 🟠 **Major** | Significant inconsistencies that could cause confusion or imbalanced gameplay |
| 🟡 **Minor** | Small discrepancies in naming, values, or descriptions that should be standardized |
| 🔵 **Documentation** | Missing cross-references, unclear wording, or formatting inconsistencies |

---

## Critical Issues (🔴)

### CRIT-001: Racial Production Modifier Conflicts

**Files Affected:**
- `economy/factory-formulas.md`
- `species/race-stats-complete.md`
- `technology/research-formulas.md`

**Issue:**
Production modifiers for races are inconsistent across documents:

| Race | factory-formulas.md | race-stats-complete.md |
|------|---------------------|------------------------|
| Ants | +50% (1.50) | +50% (consistent) ✓ |
| Mice | +25% (1.25) | +25% (consistent) ✓ |
| Guinea Pigs | +10% (1.10) | +10% (consistent) ✓ |
| Budgies | -10% (0.90) | -10% (consistent) ✓ |

**Severity:** Critical candidate - values match upon review, but the **Mice description differs**:
- `factory-formulas.md` says "Automated factories"
- `race-stats-complete.md` lists multiple production abilities: `+2 production per pop`, `factory_efficiency: 50`

**Resolution:**  
Clarify in `factory-formulas.md` that Mice have layered bonuses:
1. +25% base production modifier
2. +2 production per pop from Cybernetic Workers ability
3. +50% factory efficiency from Automated Production ability

These should stack, making Mice significantly stronger in production than the simple +25% suggests.

---

### CRIT-002: Hit Chance Formula Discrepancies

**Files Affected:**
- `ships/combat-mechanics.md`
- `ships/combat-algorithm.md`
- `AGENTS.md`

**Issue:**
Three different hit chance formulas are documented:

**combat-mechanics.md:**
```
Hit_Chance = 70% - (Range Penalty) + (Computer Bonus) - (ECM Penalty) + (Size Modifier)
```

**combat-algorithm.md:**
```
Hit_Chance = 50 + (Attack_Rating × 5) - (Target_Defense × 5) + Size_Modifier
```

**AGENTS.md:**
```
Hit Chance = 50 + Computer - ECM + Size Modifier - Range Penalty
```

**Analysis:**
- Base accuracy differs: 70% vs 50%
- Computer bonus calculation differs: flat vs ×5 multiplier
- Range penalty integration differs

**Resolution:**  
Standardize on `combat-algorithm.md` formula as it is most detailed:
```
Base_Accuracy = 50%
Hit_Chance = Base_Accuracy + (Battle_Computer_Rating × 5) - (ECM_Rating × 5) - Range_Penalty + Size_Modifier + Experience_Modifier
```

Update `combat-mechanics.md` and `AGENTS.md` to reference this canonical formula.

---

### CRIT-003: Ship Hull Costs Mismatch

**Files Affected:**
- `economy/ship-costs.md`
- `ships/ship-classes.md`

**Issue:**
Hull costs differ between documents:

| Ship Class | ship-costs.md Hull Cost | ship-classes.md Cost Range |
|------------|-------------------------|----------------------------|
| Scout | 25 BC | ~50-100 BC |
| Fighter | 40 BC | ~100-200 BC |
| Destroyer | 80 BC | ~300-600 BC |
| Cruiser | 150 BC | ~800-1,500 BC |
| Battle Cruiser | 300 BC | ~2,000-4,000 BC |
| Dreadnought | 500 BC | ~4,000-8,000 BC |
| Titan | 1,000 BC | ~10,000-20,000 BC |

**Analysis:**
`ship-costs.md` lists BASE hull costs (before components), while `ship-classes.md` lists TOTAL ship costs (hull + components). This is not a contradiction, but the distinction is unclear.

**Resolution:**  
Add clarifying notes to both documents:
- `ship-costs.md`: "Hull Cost is the base cost before adding engines, weapons, and other components"
- `ship-classes.md`: "Cost ranges shown are for typical fully-equipped ships"

---

### CRIT-004: Engine Cost and Space Conflict

**Files Affected:**
- `economy/ship-costs.md`
- `ships/components-complete.md`

**Issue:**
Engine specifications differ:

| Engine | ship-costs.md Cost | components-complete.md Cost | ship-costs.md Space | components-complete.md Space |
|--------|--------------------|-----------------------------|---------------------|------------------------------|
| Retro Engine | 10 BC | 10 BC ✓ | 20 | 25 |
| Nuclear Engine | 18 BC | 18 BC ✓ | 18 | 22 |
| Fusion Engine | 30 BC | 35 BC (Fusion Drive) | 16 | 18 |
| Ion Engine | 48 BC | 55 BC (Ion Drive) | 14 | 15 |
| Antimatter Engine | 75 BC | 70 BC | 12 | 14 |
| Interphased Engine | 110 BC | 90 BC | 11 | 12 |
| Hyperdrive | 160 BC | 120 BC | 10 | 11 |

**Resolution:**  
Use `components-complete.md` as the canonical source (more recent and detailed). Update `ship-costs.md` to match these values.

---

### CRIT-005: Racial Growth Modifier Inconsistency

**Files Affected:**
- `economy/population-growth.md`
- `species/race-stats-complete.md`

**Issue:**
Ants growth modifier differs:

| Document | Ants Growth Modifier |
|----------|----------------------|
| population-growth.md | +25% (1.25) |
| race-stats-complete.md | +25% growth, BUT also has "Overpopulation: +25% max population" |

**Analysis:**
These are two different bonuses that should both apply:
1. Growth rate modifier: 1.25× 
2. Max population capacity: +25%

The distinction is clear in `race-stats-complete.md` but could be confused with growth rate in `population-growth.md`.

**Resolution:**  
Add explicit note to `population-growth.md` under Ants entry:
```
| Ants | 1.25 (+25%) | Rapid reproduction |
Note: Ants also gain +25% max population capacity from Overpopulation ability (separate bonus)
```

---

## Major Issues (🟠)

### MAJ-001: Diplomacy Modifier Value Conflicts

**Files Affected:**
- `diplomacy/relationship-formulas.md`
- `species/race-stats-complete.md`
- `species/hamsters.md`

**Issue:**
Hamster diplomacy modifier differs:

| Document | Hamster Diplomacy Modifier |
|----------|---------------------------|
| relationship-formulas.md | +60% (1.60 multiplier) |
| race-stats-complete.md | +30% (diplomacy bonus in stat table) |
| hamsters.md | +30% |

**Analysis:**
`relationship-formulas.md` describes Hamsters as having `diplomacy_modifier: 1.60` which equals +60%, but the stat table shows +30%. The description says "2× effect on positive diplomatic actions" which would be consistent with 2.0× (100% bonus), not 1.60.

**Resolution:**  
Standardize: Hamsters should have:
- Diplomacy stat: +30% (affects starting relations, negotiation)
- Special ability "Universal Diplomat": 2× effect on positive actions (separate multiplier)

Update `relationship-formulas.md` JSON to reflect this distinction.

---

### MAJ-002: Ferrets Weapon Damage Bonus Inconsistency

**Files Affected:**
- `ships/weapons-complete.md`
- `species/race-stats-complete.md`
- `AGENTS.md`

**Issue:**
Ferrets weapon damage bonus varies:

| Document | Ferrets Ship Combat/Damage Bonus |
|----------|----------------------------------|
| weapons-complete.md | +25% damage |
| race-stats-complete.md | +30% ship combat (in bonuses table), +25% damage (in special abilities) |
| AGENTS.md | +4 Ship Attack |

**Analysis:**
- +30% ship combat could mean +30% to-hit bonus
- +25% damage is damage multiplier
- +4 Ship Attack is attack rating bonus (×5% = +20% accuracy)

These are three different mechanics being conflated.

**Resolution:**  
Clarify Ferrets have TWO separate bonuses:
1. +30% ship attack rating (translates to ~+6 attack rating via ship_combat formula)
2. +25% weapon damage multiplier (from Deadly Accuracy ability)

Update all documents to clearly distinguish attack vs damage.

---

### MAJ-003: Budgies Ship Defense Calculation Conflict

**Files Affected:**
- `ships/combat-algorithm.md`
- `species/race-stats-complete.md`
- `AGENTS.md`

**Issue:**
Budgies defense bonus inconsistent:

| Document | Budgies Ship Defense Bonus |
|----------|---------------------------|
| combat-algorithm.md | +3 Initiative, +20% evasion (from Superior Pilots) |
| race-stats-complete.md | +50% ship combat (defense), +3 initiative, +20% evasion |
| AGENTS.md | +3 Ship Defense |

**Analysis:**
+50% ship combat could mean +5 to defense rating (at 10× per point), but +3 defense is stated in AGENTS.md.

**Resolution:**  
Budgies should have:
- +3 Combat Initiative (always acts earlier)
- +20% Evasion (chance to dodge)  
- +50% ship_combat stat translates to effective +5 defense rating

Update AGENTS.md to match the +50% / +5 defense interpretation.

---

### MAJ-004: Robotic Controls Tech Level Conflict

**Files Affected:**
- `economy/factory-formulas.md`
- `ships/components-complete.md`

**Issue:**
Robotic Controls tech levels differ:

| Level | factory-formulas.md Tech Level | components-complete.md Tech Level |
|-------|-------------------------------|----------------------------------|
| RC II (3:1) | 10 | 1 (implied starting) |
| RC III (4:1) | 16 | 10 |
| RC IV (5:1) | 23 | 20 |
| RC V (6:1) | 30 | 30 ✓ |
| RC VI (7:1) | 38 | 40 |
| RC VII | — | 50 |

**Analysis:**
`components-complete.md` shows RC II starting at level 1, which contradicts `factory-formulas.md` showing it at level 10.

**Resolution:**  
Use `factory-formulas.md` as canonical (aligns with MOO1 progression). Update `components-complete.md` to match.

---

### MAJ-005: Base Population Growth Rate Conflict

**Files Affected:**
- `economy/population-growth.md`
- `species/race-stats-complete.md`

**Issue:**
Base growth rate differs:

| Document | Base Growth Rate |
|----------|------------------|
| population-growth.md | 0.10 (10% per turn) |
| race-stats-complete.md (Constants) | 0.02 (2% per turn) |

**Resolution:**  
10% base growth rate is correct for MOO1-style gameplay. The 2% in race-stats-complete.md appears to be an error. Update to 0.10.

---

### MAJ-006: Shield Absorption Mechanic Conflict

**Files Affected:**
- `ships/combat-algorithm.md`
- `ships/components-complete.md`
- `ships/weapons-complete.md`

**Issue:**
Shield absorption described differently:

- `combat-algorithm.md`: "Shields absorb a fixed amount of damage **per hit**"
- `components-complete.md`: Same (shields absorb per hit)
- But `combat-algorithm.md` also states: "Shield absorb = min(target.shield_class, remaining_damage)"

**Analysis:**
The min() function means shields absorb UP TO their class value, but only if damage exceeds it. This is correct MOO1 behavior, but the text "Shields absorb a fixed amount" is slightly misleading.

**Resolution:**  
Clarify language: "Shields absorb damage up to their class rating per hit. Excess damage passes through to armor."

---

## Minor Issues (🟡)

### MIN-001: Inconsistent Variable Naming

**Files Affected:** Multiple

**Issue:**
Same concepts use different variable names:

| Concept | Variations Found |
|---------|-----------------|
| Production modifier | `Racial_Production_Modifier`, `racial_modifier`, `production_bonus`, `racial_mod` |
| Hit chance | `Hit_Chance`, `hit_chance`, `Accuracy`, `accuracy` |
| Ship HP | `current_hp`, `Ship_HP`, `hull_points`, `hp` |
| Factory ratio | `Robotic_Controls_Level`, `factory_ratio`, `Factories_Per_Pop` |

**Resolution:**  
Establish naming convention in AGENTS.md:
- Use `snake_case` for all variable names in formulas
- Use `Title_Case` only for formula definitions
- Standardize: `production_modifier`, `hit_chance`, `ship_hp`, `robotic_controls_level`

---

### MIN-002: Tech Level vs Research Cost Confusion

**Files Affected:**
- `technology/research-formulas.md`
- `technology/construction.md`

**Issue:**
Documents sometimes conflate "tech level" (1-50 progression) with "tier" (1-18 research cost tiers) and "research cost" (RP required).

**Example from construction.md:**
```
| Tier 4 | Tech Level 12-15 | Research Cost: 250 RP |
```

This is clear, but other documents use "tech level" when they mean "tier."

**Resolution:**  
Add glossary to TECH_OVERVIEW.md:
- **Tech Level**: The numbered position (1-50) indicating progression
- **Tier**: Research cost bracket (1-18), determines RP cost
- **Research Cost**: Actual RP required (50 to 100,000+)

---

### MIN-003: Planet Size Max Population Inconsistency

**Files Affected:**
- `economy/factory-formulas.md`
- `economy/population-growth.md`

**Issue:**
Planet sizes listed identically - no actual inconsistency, but formatting differs:

| Size | factory-formulas.md | population-growth.md |
|------|---------------------|----------------------|
| Tiny | 20 | 20 ✓ |
| Small | 40 | 40 ✓ |
| Medium | 60 | 60 ✓ |
| Large | 80 | 80 ✓ |
| Huge | 100 | 100 ✓ |

**Resolution:**  
No action needed - values are consistent. Consider adding cross-reference.

---

### MIN-004: Ship Class Space Values

**Files Affected:**
- `economy/ship-costs.md`
- `ships/ship-classes.md`
- `ships/weapons-complete.md`

**Issue:**
Ship class space values are consistent:

| Class | All Documents |
|-------|---------------|
| Scout | 50 ✓ |
| Fighter | 100 ✓ |
| Destroyer | 250 ✓ |
| Cruiser | 500 ✓ |
| Battle Cruiser | 1,000 ✓ |
| Dreadnought | 1,500 ✓ |
| Titan | 2,500 ✓ |

**Resolution:**  
No action needed - values are consistent.

---

### MIN-005: Difficulty Modifier Naming

**Files Affected:**
- `economy/factory-formulas.md`
- `economy/population-growth.md`
- `technology/research-formulas.md`

**Issue:**
Difficulty level names vary slightly:

| Document | Names Used |
|----------|------------|
| factory-formulas.md | Simple, Easy, Average, Hard, Impossible |
| population-growth.md | Simple, Easy, Average, Hard, Impossible ✓ |
| research-formulas.md | Simple, Easy, Average, Hard, Impossible ✓ |

**Resolution:**  
Consistent - no action needed.

---

### MIN-006: Starvation Rate Inconsistency

**Files Affected:**
- `economy/population-growth.md`

**Issue:**
Starvation rate defined as 0.5 (50%), but the worked example shows:
```
Starvation deaths: floor(42 × 0.5) = 21 deaths
```

This would mean 42 people die from a 42-unit food deficit, which is 50% of the deficit dying. But does each unit of deficit = 1 person? This isn't clearly stated.

**Resolution:**  
Clarify in population-growth.md:
```
Food deficit = Food Required - Food Produced
Each unit of food deficit causes Starvation_Rate (50%) of that unit in deaths.
Example: 42 deficit × 0.5 = 21 deaths per turn
```

---

## Documentation Issues (🔵)

### DOC-001: Missing Cross-References

**Files Affected:** Multiple

**Issue:**
Several documents reference files that don't exist or have different names:

| Document | References | Actual File |
|----------|------------|-------------|
| factory-formulas.md | `slider-mathematics.md` | Does not exist |
| ship-costs.md | `../ships/ship-classes.md` | Correct ✓ |
| combat-algorithm.md | `combat-mechanics.md` | Correct ✓ |

**Resolution:**  
Either create `slider-mathematics.md` or remove references to it.

---

### DOC-002: Incomplete Special Ability Descriptions

**Files Affected:**
- `species/race-stats-complete.md`

**Issue:**
Some special abilities lack effect implementations:

- Hamsters "Adaptive" ability: "Can colonize any planet type at reduced penalty (-25% hostility penalty)" - but hostility penalty isn't defined elsewhere
- Rabbits "Overflow Population" ability: "Can transfer excess population to new colonies instantly" - mechanics not specified

**Resolution:**  
Add detailed mechanics for each special ability to `species/race-stats-complete.md` or create a dedicated `special-abilities.md` document.

---

### DOC-003: Inconsistent JSON Schema Formats

**Files Affected:** Multiple

**Issue:**
JSON schemas use inconsistent key naming:

- Some use `snake_case`: `tech_level`, `attack_rating`
- Some use `camelCase`: `attackRating`, `techLevel`
- Some use mixed: `tech_level` alongside `baseChange`

**Resolution:**  
Standardize on `snake_case` for all JSON keys to match common game data conventions.

---

### DOC-004: Missing Worked Examples

**Files Affected:**
- `ships/combat-mechanics.md`
- `diplomacy/espionage.md`
- `galaxy/travel.md`

**Issue:**
These documents lack worked examples showing calculations, making them harder to implement.

**Resolution:**  
Add at least 2 worked examples to each document showing typical scenarios.

---

### DOC-005: Version/Date Inconsistencies

**Files Affected:** Multiple

**Issue:**
Some documents have "Last Updated" dates of 2026-03-21, others 2026-03-22, some have no date.

**Resolution:**  
Add consistent version tracking to all specification documents:
```markdown
---
*Last Updated: YYYY-MM-DD*
*Specification: spec-XXX - Document Title*
*Version: 1.0*
---
```

---

## Summary of Required Actions

### Immediate (Critical Fixes)
1. ✅ Reconcile hit chance formula across 3 documents
2. ✅ Update engine costs/space in `ship-costs.md` to match `components-complete.md`
3. ✅ Clarify Mice production bonus stacking
4. ✅ Document hull cost vs total ship cost distinction

### Short-Term (Major Fixes)
1. ✅ Standardize Hamster diplomacy modifier documentation
2. ✅ Clarify Ferrets attack bonus vs damage bonus
3. ✅ Fix Robotic Controls tech level table
4. ✅ Correct base growth rate in race-stats-complete.md
5. ✅ Clarify Budgies defense bonus calculation

### Ongoing (Minor/Documentation)
1. ✅ Establish variable naming conventions
2. ✅ Add missing cross-references
3. ✅ Complete special ability mechanics
4. ✅ Standardize JSON schema format
5. ✅ Add worked examples where missing
6. ✅ Create `slider-mathematics.md` or remove references

---

## Consistency Verification Checklist

For future specification updates, verify:

- [ ] Variable names match established conventions
- [ ] Values match canonical source documents
- [ ] Formulas are consistent across all references
- [ ] JSON schemas use snake_case consistently
- [ ] Cross-references point to existing files
- [ ] Racial bonuses match `race-stats-complete.md`
- [ ] Tech levels match tech tree documents
- [ ] Ship stats match `components-complete.md`
- [ ] Combat formulas match `combat-algorithm.md`

---

## Canonical Source Documents

When conflicts arise, use these as the authoritative source:

| System | Canonical Document |
|--------|-------------------|
| Racial Stats | `species/race-stats-complete.md` |
| Combat Mechanics | `ships/combat-algorithm.md` |
| Ship Components | `ships/components-complete.md` |
| Weapons | `ships/weapons-complete.md` |
| Production | `economy/factory-formulas.md` |
| Population | `economy/population-growth.md` |
| Research | `technology/research-formulas.md` |
| Diplomacy | `diplomacy/relationship-formulas.md` |
| Tech Trees | `technology/*.md` (field-specific) |

---

*Report Generated: 2026-03-22*
*Reviewer: Specification Worker Agent*
*Status: Complete - Pending Fixes*
