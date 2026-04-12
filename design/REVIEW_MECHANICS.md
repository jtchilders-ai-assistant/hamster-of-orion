# Mechanics Review Report — Hamster of Orion

**Reviewer:** Wesley Crusher (AI)
**Date:** 2026-04-12
**Scope:** Economy & technology design documents

---

## Summary

Overall, the design documents are thorough and internally consistent. The major issues fall into four categories: (1) **cross-document inconsistencies** between how systems reference each other, (2) **formula conflicts** where the same mechanic is defined differently in two places, (3) **undefined or under-specified variables**, and (4) **placeholder content** needing concrete values. No show-stoppers, but several issues would cause implementation bugs if left unresolved.

---

## CRITICAL Issues (Will Cause Implementation Bugs)

### ~~C1 — Cloning formula mismatch between two docs~~ **[FIXED 2026-04-12]**
**Files:** `economy/population-growth.md` §5 vs `technology/planetology.md` Cloning section

**Resolution:** Adopted the flat bonus model from `population-growth.md` as authoritative, matching MOO1 design philosophy. `planetology.md` updated to match:
- Cloning: tech level 11, +2 pop/turn flat bonus
- Advanced Cloning: tech level 22, +5 pop/turn flat bonus
- BC-investment model removed from `planetology.md`
- JSON `effect` updated from `bc_per_million` to `bonus_per_turn`
- Prose, summary tables, worked example, and JSON all reconciled

Both docs now agree on mechanic, tech levels, and formula.

---

### C2 — Soil Enrichment multiplier conflicts with Max Population formula ✅ FIXED (2026-04-12)
**Files:** `economy/population-growth.md` §2, §4 vs `technology/planetology.md` Soil Enrichment section

**Resolution:** MOO1 approach adopted — Soil Enrichment works exactly like terraforming: a flat permanent increase to maximum population capacity per planet, paid as a one-time BC cost.

```
Max_Population = (Base_Size + Terraforming_Bonus + Soil_Enrichment_Bonus) × Environment_Capacity_Modifier
# Soil_Enrichment_Bonus: 0 (none), 25 (Basic), 50 (Advanced) — tracked per planet
```

| Technology | Tech Level | RP Cost | Max Pop Bonus | One-Time Cost |
|------------|------------|---------|---------------|---------------|
| Soil Enrichment | 14 | 4,090 | +25 | 150 BC |
| Advanced Soil Enrichment | 26 | 14,400 | +50 | 300 BC |

Resolved conflicts:
1. **Tech levels unified** at 14 (Basic) and 26 (Advanced) — `planetology.md` values are authoritative
2. **Mechanic unified:** flat `max_pop_bonus` additive to Base_Size + Terraforming_Bonus; no multipliers
3. **Gaia conversion removed:** Advanced Soil Enrichment does NOT change environment type or growth rate modifier
4. Both docs updated: `population-growth.md` and `planetology.md` now use identical formula, tech levels, and JSON schema

---

### C3 — Robotic Controls tech levels differ across docs ✅ FIXED (2026-04-12)
**Files:** `economy/factory-formulas.md` §1 vs `technology/computers.md` RC table

**Resolution:** Canonical MOO1 values from StrategyWiki applied to both files:
```
RC II  @ tech level 1  (FREE starting tech) — 2 factories/pop
RC III @ tech level 8                        — 3 factories/pop
RC IV  @ tech level 18                       — 4 factories/pop
RC V   @ tech level 28                       — 5 factories/pop
RC VI  @ tech level 38                       — 6 factories/pop
RC VII @ tech level 48                       — 7 factories/pop
```
Both `factory-formulas.md` and `computers.md` now use these values.
Meklars (Mice) +2 RC level bonus documented in both files.
Worked examples in `factory-formulas.md` corrected (RC II is 2:1, RC V is 5:1).

---

### C4 — Ecological Restoration defined incompatibly in two docs
**Status: FIXED (2026-04-12)**

**Files:** `economy/factory-formulas.md` §7–§8 vs `technology/planetology.md` Eco Restoration section

**Resolution:**
- **Authoritative mechanic:** `cleanup_modifier` multiplier approach (from `factory-formulas.md`)
- **Authoritative tech levels and names:** from `planetology.md` (tech levels 1/4/11/22/29)
- **Authoritative tech names:** Ecological Restoration / Improved / Enhanced / Advanced / Complete
- **Formula:** `Effective_Cleanup_Cost = Pollution × 0.5 × Cleanup_Modifier`
- **Cleanup modifiers:** 1.00 / 0.67 / 0.40 / 0.20 / 0.10 (derived as `2 / Waste_Per_BC`)
- **Both docs** now use `cleanup_modifier` as the primary field and retain `waste_per_bc` as a cross-reference
- **Conversion identity:** `Cleanup_Modifier = 2 / Waste_Per_BC` (both formulations are mathematically equivalent)
- The old 0.00 modifier / "Atmospheric Terraform" tier at level 46 was removed from eco_restoration; near-zero cleanup is achieved by stacking Complete Eco Restoration with Reduced Industrial Waste (Construction tech)

---

### C5 — Waste Reduction tech levels differ
**Files:** `economy/factory-formulas.md` §7 vs `technology/construction.md` Pollution Control section

**In `factory-formulas.md`:**
```
Reduced Industrial Waste 80% @ tech level 5
Reduced Industrial Waste 60% @ tech level 15
Reduced Industrial Waste 40% @ tech level 25
Reduced Industrial Waste 20% @ tech level 35
Industrial Waste Elimination  @ tech level 45
```

**In `construction.md`:**
```
Reduced Waste 80%  @ tech level 5   ✓ (matches)
Reduced Waste 60%  @ tech level 15  ✓ (matches)
Reduced Waste 40%  @ tech level 25  ✓ (matches)
Reduced Waste 20%  @ tech level 35  ✓ (matches)
Waste Elimination  @ tech level 45  ✓ (matches)
```

These actually match — no issue here. Note for completeness.

---

### C6 — Terraforming tech levels conflict between docs ✅ FIXED (2026-04-12)
**Files:** `economy/population-growth.md` Terraforming table vs `technology/planetology.md` Terraforming table

**Resolution:** Both files updated to match MOO1 canonical tech levels:
```
+10  @ tech 2   (unchanged)
+20  @ tech 6
+30  @ tech 10
+40  @ tech 14
+50  @ tech 18
+60  @ tech 22
+80  @ tech 30
+100 @ tech 38
+120 @ tech 46
```

`planetology.md` updated as authoritative source (has RP costs, BC costs, full tier structure). `population-growth.md` Terraforming table and JSON array updated to match. `planetology.md` tier structure restructured to accommodate the new level distribution — Complete Terraforming +120 moved to Tier 13 at level 46; Advanced Planetology Tech IV (which previously occupied level 46) removed from future tech section. All summary tables, JSON schema, and category summaries updated consistently.

---

### C7 — Miniaturization cap inconsistency ✅ FIXED
**Files:** `economy/ship-costs.md` §3 vs `technology/research-formulas.md` §9

**Resolution:** Updated `ship-costs.md` to use 50% max reduction (matching MOO1 and `research-formulas.md`). Both files now consistently cap miniaturization at 50% (minimum 50% of base cost).

**In `ship-costs.md` (fixed):**
```
Miniaturization_Reduction = (Current_Tier - Component_Tier) × 0.05
Maximum_Reduction = 0.50 (50% off, minimum 50% of base cost)
```

**In `research-formulas.md` (was already correct):**
```
miniaturization_maximum = 0.50 (50%)
miniaturization_minimum = 0.50 (50% of base — i.e., same cap)
```

---

## HIGH Priority Issues (Formula Gaps / Structural Problems)

### H1 — Morale modifier missing from growth formula header
**File:** `economy/population-growth.md` §1

The "Core Formulas" section (§1) does not include `Morale_Modifier` in the displayed formula:
```
Growth_Per_Turn = Population × Base_Growth_Rate × Environment_Modifier × Racial_Modifier × (1 - Population / Max_Population)
```

But the complete formula in §6 and the pseudocode in the algorithm section both correctly include `morale_modifier`. The §1 formula is misleading and should be updated to match §6.

---

### ~~H2 — Biological weapon max-population reduction is defined differently in each doc~~ ✅ FIXED (2026-04-12)
**Files:** `economy/population-growth.md` Edge Cases vs `technology/weapons.md` Bio Weapons table vs `technology/planetology.md` Bio Weapon Mechanics

**Resolution:** `planetology.md` adopted as authoritative. Bio weapons are in the **Planetology** technology field, not the Weapons field. All docs now use fixed integer kill rates per combat round with permanent max-pop reductions:

| Weapon | Tech Level (Planetology) | Kill Rate | Max Pop Reduction |
|--------|--------------------------|-----------|-------------------|
| Death Spores | 9 | 1M per combat round | -10% permanent |
| Doom Virus | 25 | 2M per combat round | -25% permanent |
| Bio Terminator | 33 | 3M per combat round | -50% permanent |

**Changes made:**
- `technology/planetology.md`: Added max pop reduction column to bio weapons table; clarified "per combat round" wording; added note that max pop reduction is permanent
- `ships/weapons-complete.md`: Updated bio weapons table and JSON with canonical values (tech levels 9/25/33, kill rates 1M/2M/3M, Planetology field, correct space/cost); added note that bio weapons are in Planetology field
- `technology/weapons.md`: Removed bio weapons from Weapons field entries; updated summary table to point to Planetology; set biological category count to 0
- `economy/population-growth.md`: Updated bio weapon section to include kill rate table alongside max-pop reduction; added formula; cross-referenced `planetology.md`

---

### H3 — Population formula: Ants max-pop bonus not reflected in Max_Population formula
**File:** `economy/population-growth.md` §4 (Racial modifiers note)

The Ants entry says: "Ants also receive +25% max population capacity from their Overpopulation ability (applied to max_population calculation)." But `calculate_max_population()` pseudocode does not include a racial capacity modifier. The formula:
```
max_pop = floor((base_size + terraforming_bonus) * soil_multiplier * env_capacity)
```
...has no slot for a racial capacity bonus. Either the formula needs a `Racial_Capacity_Modifier` term, or the note should point to where it applies.

---

### H4 — `slider-mathematics.md` referenced but does not exist ✅ FIXED (2026-04-12)
**Files:** `economy/population-growth.md`, `economy/factory-formulas.md`, `economy/ship-costs.md`, `technology/research-formulas.md`

**Resolution:** Created `economy/slider-mathematics.md` defining the complete 5-slider system (SHIP/DEF/IND/ECO/TECH). Document includes:
- Overview of all 5 sliders and their functions
- Net production formula showing how TECH diverts population before production is calculated
- ECO priority-ordered spending: (1) pollution cleanup, (2) population growth bonus, (3) terraforming
- Locking mechanics and re-balancing algorithm
- Reserve/overflow mechanics per slider
- 3 worked examples including cleanup shortfall scenario
- JSON schema for implementation
- Governor AI notes

All four referencing documents now have a valid target for their `slider-mathematics.md` cross-reference links.

---

### H5 — `species/race-stats-complete.md` referenced but does not exist
**File:** `economy/factory-formulas.md` §2, §6

Mice production bonus notes: "See `species/race-stats-complete.md` for full calculation." This file is referenced in at least two places but was not present. Mice have three stacking production bonuses described in a note, but the complete formula for how they interact is deferred to a non-existent document.

---

### H6 — Transport cost discrepancy ✅ FIXED
**Files:** `economy/population-growth.md` §7 vs `economy/ship-costs.md` §16

**Resolution:** These were two different transport classes that were never clearly distinguished. Fixed as follows:

- **Population (Colony) Transports** — civilian ships moving colonists between friendly planets. Updated from implausible 5 BC to **50 BC** (1 BC/turn maintenance, 1M pop capacity). Consistent with Small hull cost tables.
- **Military (Troop) Transports** — invasion vessels. Unchanged: Light 50 BC / Heavy 100 BC / Assault 200 BC.

Both `population-growth.md` §7 and `ship-costs.md` §16 updated to clearly document both types with cross-references. JSON schema in ship-costs.md split into `population_transports` and `troop_transports` keys.

---

### H7 — Planet base sizes differ between ecology doc and planetology doc ✅ FIXED
**Files:** `economy/population-growth.md` and `economy/factory-formulas.md` vs `technology/planetology.md` constants section and `galaxy/generation-algorithm.md`

**Resolution:** Unified to MOO1 canonical fixed values across all docs:
```
Tiny: 20, Small: 40, Medium: 60, Large: 80, Huge: 100
```

**Changes made:**
- `technology/planetology.md` constants comment updated: "Base sizes range from 10 (tiny) to 120 (huge)" → "Base sizes (fixed): Tiny=20, Small=40, Medium=60, Large=80, Huge=100"
- `galaxy/generation-algorithm.md` size table replaced (ranges → fixed values); `RollSize()` pseudocode updated to return fixed values; Orion base_pop corrected 150→100; homeworld base_pop corrected from random_int(85,120) to fixed large=80 or huge=100
- `economy/population-growth.md` and `economy/factory-formulas.md` were already correct (authoritative source)

---

### H8 — Hull cost tables are inconsistent ✅ FIXED
**File:** `economy/ship-costs.md` §1 vs JSON schema

**Resolution (2026-04-12):** Unified all hull class definitions to MOO1's 4-class system with canonical space values from MOO1:

| Hull Size | Space | Base Cost |
|-----------|-------|----------|
| Small  | 25    | 6 BC     |
| Medium | 70    | 36 BC    |
| Large  | 280   | 200 BC   |
| Huge   | 1400  | 1200 BC  |

**Changes made:**
- `economy/ship-costs.md`: Prose table corrected (~40/~100/~250/~500+ → 25/70/280/1400); JSON `hull_costs` array replaced 7 old named classes (scout/fighter/destroyer/cruiser/battle_cruiser/dreadnought/titan) with 4 MOO1 classes (small/medium/large/huge)
- `ships/ship-classes.md`: Hull size table updated to exact MOO1 space values; note updated; combat stats table updated with correct space values
- `ships/ship-design.md`: Hull sizes table updated from approximations to exact values
- `ships/components-complete.md`: `base_hp_by_class` JSON updated from 7 old classes to 4 MOO1 classes (small=3, medium=18, large=100, huge=600)
- `technical/data-schemas.md`: `ShipClass` enum updated from 7 old classes to 4 MOO1 hull sizes
- `technical/data-structures.md`: `ShipClass` type updated from 7 old classes to 4 MOO1 hull sizes
- `technical/ai-implementation.md`: Fleet classification logic and fleet composition JSON updated to use MOO1 hull sizes
- `technology/force-fields.md`: Black Hole Generator `requires_ship_class` updated from ["dreadnought", "titan"] to ["huge"]

---

### H9 — Uridium Fuel Cells tech level conflict ✅ FIXED (2026-04-12)
**Files:** `technology/propulsion.md` vs `galaxy/travel.md`

**Resolution:** Unified to MOO1 canonical values. Standard Fuel Cells now give **4 parsecs** range in all docs.

- `propulsion.md`: Standard Fuel corrected from range 3 → 4; full progression shifted up by 1 throughout prose tables, detailed stats table, and JSON
- `components-complete.md`: Fuel cell table and JSON array updated identically (Standard: 3→4, Extended: 4→5, … Maximum: 10→11)
- `travel.md`: Starting fuel (Hydrogen) was already 4 — no change needed. Ranges now consistent with propulsion.md

**Canonical fuel cell progression (all docs now agree):**
```
Standard/Hydrogen: 4
Extended/Deuterium: 5
Improved/Irridium:  6
Advanced/Dotomite:  7
Superior/Uridium:   8
High-Capacity/Reajax: 9
Ultra/Trilithium:  10
Maximum:           11
Thorium:            ∞
```

Note: `travel.md` uses MOO1 lore names; `propulsion.md`/`components-complete.md` use generic names. Name canonicalization is a separate concern (see L-series issues).

---

### H10 — Travel doc uses different engine table than propulsion doc ✅ FIXED (2026-04-12)
**File:** `galaxy/travel.md` vs `technology/propulsion.md`

**Resolution:** Unified to MOO1 canonical warp speeds 1–9 (max warp 9). Both docs now agree.

- `propulsion.md`: Temporal Drive corrected from Speed 10 → **9** (prose table, detailed stats table, JSON). Hyper-X Drive stays at Speed 8.
- `travel.md`: Engine table expanded and corrected to match `propulsion.md` speed values:
  - Sub-Light Drives corrected from warp 3 → **2** (matches propulsion.md Speed 2)
  - Fusion Drives corrected from warp 4 → **3**
  - Impulse Drives corrected from warp 5 → **3**
  - Ion Drives corrected from warp 6 → **4**
  - Anti-Matter Drives corrected from warp 7 → **5**
  - Interphased Drives corrected from warp 8 → **6**
  - Hyperdrives corrected from warp 9 → **7**
  - Hyper-X Drives added at warp **8**
  - Temporal Drive added at warp **9**
- Travel example corrected: "Warp 4 (Fusion)" → "Warp 4 (Ion)"

**Canonical engine warp speed table (all docs now agree):**
```
Retro Engines:    warp 1
Nuclear Engines:  warp 2
Sub-Light Drives: warp 2
Fusion Drives:    warp 3
Impulse Drives:   warp 3
Ion Drives:       warp 4
Antimatter Drive: warp 5
Interphased Drive:warp 6
Hyperdrive:       warp 7
Hyper-X Drive:    warp 8
Temporal Drive:   warp 9
```

---

## MEDIUM Priority Issues (Gaps / Undefined Behavior)

### M1 — No formula for how `Difficulty_Modifier` affects RP generation
**File:** `technology/research-formulas.md` §1

`Planet_RP` formula includes `Difficulty_Modifier` as a parameter, but the table at the bottom of the doc shows difficulty affects AI tech costs (not AI RP generation directly). The doc says "Player research cost is not affected by difficulty." It's unclear whether `Difficulty_Modifier` in the RP formula is for the player or AI, and what values it takes for each difficulty level at the per-planet RP generation stage.

---

### M2 — Artifacts world bonus applies inconsistently
**File:** `technology/research-formulas.md` §4

Artifacts bonus listed as "+25% RP from that planet" in the Special RP Bonuses table, but the algorithm applies it as `planet_rp *= 1.25` only if `planet.has_artifacts`. The `exploration.md` doc says colonizing an Artifacts world gives "an immediate technology breakthrough" (a one-time tech, not an ongoing RP bonus). These are different mechanics — is it a one-time tech unlock, an ongoing RP multiplier, or both?

---

### M3 — Scanner range defined in exploration vs propulsion differently
**File:** `galaxy/exploration.md` vs `technology/propulsion.md`

`exploration.md` says: "Base range: 3 parsecs from owned colonies. Improved with fuel cell technology." This implies fuel cells extend scanner range. But `propulsion.md` scanner tech (Deep Space Scanner, Subspace Scanner, etc.) are in the Computers field, not Propulsion. And `exploration.md` explicitly says "Extended Range / Reserve Fuel Tanks add to ship range, not scanner range" — contradicting its own opening sentence that fuel cells improve scanner range.

---

### M4 — `Actual_Tech_Cost` formula has an inversion issue
**File:** `technology/research-formulas.md` §7

```
Actual_Tech_Cost = Base_Tech_Cost × (1 / Racial_Research_Modifier) × Galaxy_Size_Modifier × Difficulty_Modifier
```

This means Rats (1.5× research bonus) pay `1/1.5 = 0.67×` of base cost — effectively a cost reduction. This is functionally correct (Rats research faster), but the doc elsewhere says "Rats pay 50% less" which matches this math. However, the `process_research_turn` algorithm applies racial modifier to RP generation (not cost), and the comment in that function says `# For Rats: tech costs 50% less (modifier 1.5 applied to RP, not cost)`. These two implementations (cost reduction vs RP bonus) are mathematically equivalent but the dual documentation creates implementation confusion. Pick one and use it consistently.

---

### M5 — Edge case: what happens when Max_Population < current population after terraforming loss?
**File:** `economy/population-growth.md` Edge Cases section

The Conquered Population edge case says "Bio weapons reduce max population capacity: Death Spores: -10% max pop permanently." There is no formula or procedure for what happens when a tech upgrade is stolen/lost or when max population drops below current population (e.g., when you conquer a planet and bio weapons have reduced its capacity). The growth formula clamps at max, but what about existing excess population?

---

### M6 — Black Hole Generator requires "Huge hull" but JSON specifies different ship classes
**File:** `technology/force-fields.md` §12 / JSON

Prose says: "Requires capital ship (Huge hull only)." JSON says: `"requires_ship_class": ["dreadnought", "titan"]`. The game uses 4 MOO1 hulls (Small/Medium/Large/Huge) in some docs and 7 custom classes in others. "Dreadnought" and "Titan" are not MOO1 hull classes. Which hull classification system is authoritative here?

---

### M7 — Stasis Field: "cannot target same ship two turns in a row" conflicts with duration
**File:** `technology/force-fields.md` §10

The prose says: "Cannot be used on same target two turns in row." But also says: "Does not prevent retreat (ship still retreats normally)." If a ship is in stasis (cannot move or fire), how can it retreat? This edge case needs explicit resolution. Also, the stasis effect says it "disables all weapons on target ship 1 turn" — it should specify whether this prevents retreat or not.

---

### M8 — Energy Pulsar area damage target is undefined
**File:** `technology/propulsion.md` §4 / JSON

Energy Pulsar effect listed as `"area_damage": "1-6"` in JSON. The tech description says "1-6 damage to adjacent ships" but doesn't specify: adjacent on the combat grid? How many can be affected? Does this affect friendly ships? Does it apply to all ships in a stack? Needs a combat targeting definition.

---

### M9 — Warp Dissipator mechanics undefined
**File:** `technology/propulsion.md` §7

`"prevent_retreat": true` is the entire mechanical description. There's no formula or procedure for: How does it work (area of effect? targeting? range)? Can the ship with the Dissipator retreat? Does it affect all fleeing ships or just one? Does it work against hyperspace transit or only combat retreat?

---

### M10 — Tech tier cost table header says "Tier Multiplier" but values are all 1×
**File:** `technology/research-formulas.md` Table §6

The tier cost table has a `Tier_Multiplier` column that is `1×` for every row. This column is either meaningless (and the costs are simply the flat values) or it was intended to show a multiplier system that was never filled in. The formula says `Base_Tech_Cost = Base_Cost × Tier_Multiplier` but this is tautological. The table should either remove the multiplier column or explain what it represents.

---

### M11 — Conquest population reduction is defined vaguely
**File:** `economy/population-growth.md` Edge Cases

> "When conquering an enemy planet: Population is reduced by 50% (combat casualties)"

No formula is given. Is this 50% of the remaining population after bombardment? 50% of the planet's total? Does this apply before or after ground combat? The phrase "combat casualties" implies it's from the invasion combat, but that's not quantified here.

---

### M12 — Maintenance tech modifier stacking is not defined
**File:** `economy/ship-costs.md` §7

Three maintenance-reducing technologies are listed:
```
Automated Repair: -10% maintenance
Advanced Damage Control: -20% maintenance
Self-Repairing Hull: -30% maintenance
```

The algorithm applies them multiplicatively (`ship_maintenance *= tech.modifier`), but the table presents them as simple reductions. Are these additive or multiplicative? And are these the same "Automated Repair" and "Advanced Damage Control" defined in `construction.md` (which lists them as in-combat HP regeneration systems, not maintenance reducers)? The naming collision between maintenance modifiers in `ship-costs.md` and combat repair systems in `construction.md` is a significant gap.

---

### M13 — Force Fields: total tiers claim is 14 but research cost table ends at tier 14 with 50,000 RP
**File:** `technology/force-fields.md` overview vs `research-formulas.md` tier cost table

`force-fields.md` says `"total_tiers": 14`. The global tier cost table in `research-formulas.md` only goes to tier 20 (100,000 RP), and tier 14 costs 18,000 RP. But the Force Fields tier 14 research cost in the doc is listed as 50,000 RP, which corresponds to tier 20 in the global table. The Force Fields field uses 14 internal tiers but the global RP costs don't map 1:1 to its tier numbering. This mapping is not explained anywhere.

---

## LOW Priority Issues (Naming / Clarity / Polish)

### L1 — Inconsistent naming: "industry" vs "production" vs "factories"
**Files:** Multiple

- `factory-formulas.md` uses "Production Capacity (BC)" and "Factory_Production"
- `population-growth.md` uses "more production" as a benefit of population
- `TECH_OVERVIEW.md` uses "Production" when describing Ants/Mice bonuses
- `construction.md` and `computers.md` racial bonus JSONs use `"production_bonus"` and `"factory_ratio"` interchangeably

Recommend standardizing on `Factory_Output` (per-factory), `Population_Output` (per-colonist labor), and `Net_Production` (after cleanup) throughout.

---

### L2 — "BC" is used for both currency and "Building Credits" without consistent definition
**Files:** Multiple

`factory-formulas.md` intro defines BC as "Building Credits." Elsewhere it's used for ship costs, maintenance, and research building costs. The ship costs doc calls them "BC" throughout. No document defines the exchange rate or whether this is the same unit as production output. A single authoritative definition with a brief note in each doc would help.

---

### L3 — Hermit Crabs' food mechanic is inconsistently described
**Files:** `economy/population-growth.md`

The food table says Hermit Crabs have `food_modifier: null` and the JSON `racial_food_modifiers` sets them to `null`. The special rules say `"no_food_required": true`. But the `process_food()` pseudocode returns early with `food_required: 0, food_produced: 0` — which is fine. However, the Starvation section has no exception for Hermit Crabs, meaning starvation code must check `no_food_required` before applying deaths. This should be made explicit in the starvation algorithm.

---

### L4 — Colonization tech order in population-growth.md doesn't match planetology.md
**Files:** `economy/population-growth.md` §13 vs `technology/planetology.md` Colonization section

**`population-growth.md`:** Barren@3, Tundra@6, Dead@9, Inferno@12, Toxic@15, Radiated@18
**`planetology.md`:** Barren@3, Tundra@6, Dead@8, Inferno@10, Toxic@13, Radiated@17

Dead, Inferno, Toxic, and Radiated all have different tech levels. Only Barren and Tundra agree.

---

### L5 — "Future Tech" / "Advanced Planetology" effects are placeholders
**File:** `technology/planetology.md` Future Tech section

Ten "Advanced Planetology Tech" entries all have `"effect": {"general_improvement": true}` with no concrete definition. These are pure placeholders. If this content is intentionally deferred, it should be marked `[TODO]` explicitly.

---

### L6 — Research building maintenance costs are inconsistent with ship costs
**File:** `technology/research-formulas.md` §13

Research building maintenance (1–8 BC/turn) isn't deducted from empire income anywhere in the reviewed docs. `factory-formulas.md` discusses factory cleanup costs; `ship-costs.md` handles fleet maintenance. Building maintenance seems to be a third maintenance category with no specified payment phase or empire-wide accounting.

---

### L7 — Thorium Cells JSON uses `"range": -1` to represent infinite range
**File:** `technology/propulsion.md` JSON, Tier 13

```json
{ "id": "thorium_cells", "effect": { "range": -1 } }
```

Using -1 as a sentinel for "infinite" is fine as a convention, but it should be documented explicitly (in a comment or a separate `"infinite_range": true` field) to avoid confusion during implementation.

---

### L8 — Refit formula worked example uses wrong numbers
**File:** `economy/ship-costs.md` §11 and §17 (Example 4)

In §11 (Refit Cost Formula):
> "Old Design: 400 BC → New Design: 600 BC → Difference: 200 BC → Refit: 100 BC"

In Example 4 (§17 "Refit Analysis"):
> "Old Design: 150 BC → New Design: 250 BC"
> But then: "Difference: 600 - 400 = 200 BC → Refit cost: 200 × 0.50 = 100 BC"

Example 4 states the ships cost 150 and 250 BC, then uses 400 and 600 in the actual calculation. The numbers in the example's narrative don't match its math. This should use 150/250 consistently.

---

### L9 — `categories.md` says Budgies have "+1 movement range" but propulsion.md says "+1 combat speed"
**Files:** `technology/categories.md` Propulsion section vs `technology/propulsion.md` Racial Bonuses

`categories.md`: "Budgies: +1 movement range on all ships"
`propulsion.md`: "Budgies: +1 Combat Speed, +3 Initiative (not warp speed)"

These are different bonuses. Movement range (fuel range) vs combat speed. `propulsion.md` also says "No direct warp speed bonus" explicitly.

---

### L10 — ECM Jammer I listed in two different tiers in computers.md
**File:** `technology/computers.md`

In the narrative text, ECM Jammer I is listed under Tier 2 at tech level 3. In the tech level table `computers.md` also says Tier 2 tech level range is [5-8]. A tech level 3 item cannot be in a tier whose range starts at 5. Either ECM Jammer I is Tier 1 (which starts at [1-4]) or its tech level should be ≥5.

---

### L11 — Quantum Computer stats inconsistency
**File:** `technology/computers.md` Tier 14 JSON and summary table

In the tech tree narrative, Quantum Computer is at tech level 55. In the JSON it's also tech level 55. But the "Battle Computer XI" in the same tier is at tech level 50, and the tier range is [51, 55]. Tech level 50 is not in the range [51, 55]. BC XI should probably be tech level 51 or the tier range should start at 50.

---

### L12 — Planetary Shield maintenance not included in any maintenance formula
**Files:** `technology/force-fields.md` vs `economy/ship-costs.md`

Planetary Shields have explicit maintenance costs (5–20 BC/turn). The `ship-costs.md` fleet maintenance algorithm adds `planet.defensive_installations` maintenance, but Planetary Shields are listed as a separate tech category in `force-fields.md`. It's unclear whether Planetary Shields count as "defensive installations" in the maintenance formula or have a separate payment mechanism.

---

## Missing Documents (Referenced but Not Found)

| Document | Referenced In | Content Needed |
|----------|--------------|----------------|
| ~~`economy/slider-mathematics.md`~~ | ~~4 docs~~ | ~~Complete slider (ECO/PROD/SHIP/DEF/RES) formulas~~ — **CREATED 2026-04-12** |
| `species/race-stats-complete.md` | `factory-formulas.md` | Mice triple-stacking bonus formula |
| `diplomacy/council.md` | `population-growth.md` | Council vote formula |
| `game-mechanics/victory-conditions.md` | `population-growth.md` | Domination victory threshold |
| `ships/ship-classes.md` | `ship-costs.md` | Canonical hull class definitions |
| `ships/components-complete.md` | `ship-costs.md`, `computers.md` | Full component list |
| `ships/weapons-complete.md` | `ship-costs.md` | Full weapon list |
| `ships/combat-algorithm.md` | `computers.md`, `force-fields.md` | Combat resolution |
| `diplomacy/espionage.md` | `research-formulas.md` | Spy system details |
| `diplomacy/trade.md` | `research-formulas.md` | Tech trading mechanics |
| `planets/planet-types.md` | `planetology.md` | Environment type definitions |
| `game-mechanics/turn-structure.md` | `ship-costs.md` | Turn phase order |
| `space-regions.md` | `exploration.md` | Orion system details |
| `star-systems.md` | `travel.md` | System details |

---

## Issues by File

| File | Critical | High | Medium | Low |
|------|----------|------|--------|-----|
| `economy/population-growth.md` | C1, C2, C6 | H1, H2, H3 | M5, M11 | L3, L4 |
| `economy/factory-formulas.md` | C3, C4, C5 | ~~H4~~✅, H5 | M12 | L1, L2 |
| `economy/ship-costs.md` | C7 | H6, ~~H8~~✅ | M6, M12 | L8 |
| `technology/research-formulas.md` | C7 | ~~H4~~✅ | M1, M4, M10 | L6 |
| `technology/TECH_OVERVIEW.md` | — | — | — | — |
| `technology/computers.md` | C3 | — | — | L10, L11 |
| `technology/construction.md` | — | ~~H8~~✅ | — | L1 |
| `technology/force-fields.md` | — | — | ~~M6~~✅, M7, M13 | L12 |
| `technology/planetology.md` | C1, C2, C4, C6 | H2, H7 | M2 | L4, L5 |
| `technology/propulsion.md` | — | H9, H10 | M3, M8, M9 | L7, L9 |
| `technology/weapons.md` | — | H2 | — | — |
| `galaxy/travel.md` | — | H9, H10 | M3 | — |
| `galaxy/exploration.md` | — | — | M2, M3 | — |

---

## Recommended Priority Order

1. **Resolve C1 (Cloning)** — two completely incompatible mechanics
2. ~~**Resolve C3 (Robotic Controls tech levels)**~~ ✅ FIXED
3. **Resolve C6 (Terraforming tech levels)** — foundational to population
4. ~~**Resolve C2 (Soil Enrichment formula)**~~ ✅ FIXED
5. **Resolve C4 (Eco Restoration)** — affects all factory calculations
6. **Resolve C7 (Miniaturization cap)** — affects all ship design costs
7. ~~**Create `slider-mathematics.md`** (H4)~~ ✅ DONE — core to all per-turn calculations
8. ~~**Reconcile hull classes** (H8)~~ ✅ FIXED — unified to MOO1 4-class system (Small/Medium/Large/Huge)
9. **Resolve bio weapon stats** (H2) — three-way inconsistency
10. ~~**Resolve fuel range starting value** (H9, H10)~~ ✅ FIXED

---

*Generated: 2026-04-12*
*Files reviewed: 13 design documents*
*Issues found: 7 Critical, 13 High, 13 Medium, 12 Low, 14 Missing Documents*
