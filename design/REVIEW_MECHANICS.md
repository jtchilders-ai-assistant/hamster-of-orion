# Mechanics Review Report — Hamster of Orion

**Reviewer:** Wesley Crusher (AI)
**Date:** 2026-04-12
**Scope:** Economy & technology design documents

---

## Summary

Overall, the design documents are thorough and internally consistent. The major issues fall into four categories: (1) **cross-document inconsistencies** between how systems reference each other, (2) **formula conflicts** where the same mechanic is defined differently in two places, (3) **undefined or under-specified variables**, and (4) **placeholder content** needing concrete values. No show-stoppers, but several issues would cause implementation bugs if left unresolved.

---

## CRITICAL Issues (Will Cause Implementation Bugs)

### C1 — Cloning formula mismatch between two docs
**Files:** `economy/population-growth.md` §5 vs `technology/planetology.md` Cloning section

**In `population-growth.md`:**
```
Cloning: +2 pop/turn (flat, added to growth)
Advanced Cloning: +5 pop/turn
Tech levels: Cloning @ 11, Advanced Cloning @ 22
```

**In `planetology.md`:**
```
Cloning (Tech Level 19, 7,050 RP): 1M per 10 BC invested
Advanced Cloning (Tech Level 34, 28,220 RP): 1M per 5 BC invested
```

These are **completely different mechanics**. `population-growth.md` models cloning as a flat per-turn growth bonus (regardless of spending). `planetology.md` models it as a BC investment → population conversion. The tech levels also conflict (11 vs 19 for basic Cloning; 22 vs 34 for Advanced). One of these definitions must be authoritative; the other must be reconciled or removed.

---

### C2 — Soil Enrichment multiplier conflicts with Max Population formula
**Files:** `economy/population-growth.md` §2, §4 vs `technology/planetology.md` Soil Enrichment section

**In `population-growth.md`:**
- Soil Enrichment: `multiplier = 1.25` (25% more)
- Advanced Soil Enrichment: `multiplier = 1.50` (50% more)
- Listed as tech levels 16 and 30

**In `planetology.md`:**
- Soil Enrichment: `base_size_bonus = 0.25` (+25% base size), `growth_rate_bonus = 0.50` (+50% growth), tech level 14
- Advanced Soil Enrichment: `base_size_bonus = 0.50`, converts planet to Gaia, tech level 26

Three conflicts here:
1. Tech levels differ (16 vs 14 for basic; 30 vs 26 for advanced)
2. `population-growth.md` applies Soil Enrichment as a `Max_Population` multiplier; `planetology.md` applies it as a base size bonus separately from growth rate bonus
3. `planetology.md` says Advanced Soil Enrichment converts to Gaia (environment type changes), but `population-growth.md` has no mention of environment conversion and treats it as a flat 1.5× multiplier

The `Max_Population` formula in `population-growth.md` uses `Soil_Enrichment_Modifier` as a single multiplier on `(base_size + terraforming_bonus)`, which doesn't match the separate `base_size_bonus` + `growth_rate_bonus` + Gaia conversion described in `planetology.md`.

---

### C3 — Robotic Controls tech levels differ across docs
**Files:** `economy/factory-formulas.md` §1 vs `technology/computers.md` RC table

**In `factory-formulas.md`:**
```
RC II @ tech level 10
RC III @ tech level 16
RC IV @ tech level 23
RC V @ tech level 30
RC VI @ tech level 38
```

**In `computers.md`:**
```
RC II @ tech level 1 (starting tech)
RC III @ tech level 8
RC IV @ tech level 20
RC V @ tech level 30
RC VI @ tech level 40
RC VII @ tech level 50
```

RC II is a starting tech in `computers.md` but listed at tech level 10 in `factory-formulas.md`. RC III is at 16 in one and 8 in the other. RC VI is at 38 vs 40. `computers.md` also lists RC VII (7:1 ratio @ tech 50) which is absent from `factory-formulas.md`.

---

### C4 — Ecological Restoration defined incompatibly in two docs
**Files:** `economy/factory-formulas.md` §7–§8 vs `technology/planetology.md` Eco Restoration section

**In `factory-formulas.md`:**
- Eco Restoration tech reduces `cleanup_modifier` (a multiplier on cleanup cost), ranging from 1.00 down to 0.00
- Tech is named "Eco Restoration 20/40/60/80%" with tech levels 6, 16, 26, 36, 46
- Cleanup formula: `Effective_Cleanup_Cost = Pollution × 0.5 × Cleanup_Modifier`

**In `planetology.md`:**
- Eco Restoration tech is defined as `waste_per_bc` (how much pollution is eliminated per BC spent), ranging from 2 to 20
- Tech levels 1, 4, 11, 22, 29

These are mathematically equivalent approaches, but:
1. The tech levels don't match (base Eco Restoration is a starting tech at level 1 in `planetology.md`, but listed at level 6 in `factory-formulas.md`)
2. The tech names differ completely
3. Implementation cannot use both formulas simultaneously — one must be chosen

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

### C6 — Terraforming tech levels conflict between docs
**Files:** `economy/population-growth.md` Terraforming table vs `technology/planetology.md` Terraforming table

**In `population-growth.md`** (tech levels 2, 8, 14, 20, 26, 32, 38, 44, 50):
```
+10 @ tech 2
+20 @ tech 8
+30 @ tech 14
+40 @ tech 20
+50 @ tech 26
+60 @ tech 32
+80 @ tech 38
+100 @ tech 44
+120 @ tech 50
```

**In `planetology.md`** (tech levels 2, 7, 12, 18, 24, 28, 32, 36, 38):
```
+10 @ tech 2   ✓
+20 @ tech 7   ✗ (8 in other doc)
+30 @ tech 12  ✗ (14)
+40 @ tech 18  ✗ (20)
+50 @ tech 24  ✗ (26)
+60 @ tech 28  ✗ (32)
+80 @ tech 32  ✗ (38)
+100 @ tech 36 ✗ (44)
+120 @ tech 38 ✗ (50)
```

Only the +10 bonus matches. All subsequent tech levels differ. `planetology.md` also assigns RP costs per tier that `population-growth.md` doesn't address. The `planetology.md` version appears more authoritative (it has RP costs, BC costs, and is the dedicated tech doc), but the conflict must be resolved.

Also: `population-growth.md` says "Terraforming bonuses are NOT cumulative — you only get the highest level you've researched." `planetology.md`'s edge case section says "New terraforming tech replaces old (takes you to new limit)" — consistent in intent, but implementation note in `population-growth.md` labeled the table as "cumulative" in the heading before contradicting itself in the note. The heading should be fixed.

---

### C7 — Miniaturization cap inconsistency
**Files:** `economy/ship-costs.md` §3 vs `technology/research-formulas.md` §9

**In `ship-costs.md`:**
```
Miniaturization_Reduction = (Current_Tier - Component_Tier) × 0.05
Maximum_Reduction = 0.80 (80% off)
```

**In `research-formulas.md`:**
```
miniaturization_maximum = 0.50 (50%)
miniaturization_minimum = 0.50 (50% of base — i.e., same cap)
```

One doc says max reduction is 80%, the other says 50%. `research-formulas.md` explicitly notes this matches MOO1, which capped at 50%. The 80% figure in `ship-costs.md` appears to be an error.

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

### H2 — Biological weapon max-population reduction is defined differently in each doc
**Files:** `economy/population-growth.md` Edge Cases vs `technology/weapons.md` Bio Weapons table vs `technology/planetology.md` Bio Weapon Mechanics

**In `population-growth.md`:**
> Death Spores: -10% max population permanently
> Doom Virus: -25% max population permanently
> Bio Terminator: -50% max population permanently

**In `weapons.md`** bio weapons table:
```
Death Spores: 2-10 pop/turn, -10% max pop
Doom Virus:   5-20 pop/turn, -25% max pop
Bio Terminator: 10-40 pop/turn, -50% max pop
```

**In `planetology.md`** bio weapon stats:
```
Death Spores:   1M per attack, no max pop reduction mentioned
Doom Virus:     2M per attack, no max pop reduction mentioned
Bio Terminator: 3M per attack, no max pop reduction mentioned
```

Three different kill rates for the same weapons:
- `population-growth.md`: implicitly flat (percentage of max pop)
- `weapons.md`: `2-10/turn`, `5-20/turn`, `10-40/turn` (ranges)
- `planetology.md`: `1M/attack`, `2M/attack`, `3M/attack` (fixed integers)

The per-attack vs per-turn distinction also creates ambiguity. `planetology.md` treats each combat round as one "attack"; `weapons.md` says per-turn. Are these the same? Additionally, `planetology.md` omits the permanent max-population reduction that the other two docs specify. This needs a single authoritative definition.

Also: `weapons.md` places Death Spores at tech level 15 (Weapons field), while `planetology.md` places them at tech level 9 (Planetology field). These are different fields — which field are bio weapons in?

---

### H3 — Population formula: Ants max-pop bonus not reflected in Max_Population formula
**File:** `economy/population-growth.md` §4 (Racial modifiers note)

The Ants entry says: "Ants also receive +25% max population capacity from their Overpopulation ability (applied to max_population calculation)." But `calculate_max_population()` pseudocode does not include a racial capacity modifier. The formula:
```
max_pop = floor((base_size + terraforming_bonus) * soil_multiplier * env_capacity)
```
...has no slot for a racial capacity bonus. Either the formula needs a `Racial_Capacity_Modifier` term, or the note should point to where it applies.

---

### H4 — `slider-mathematics.md` referenced but does not exist
**Files:** `economy/population-growth.md`, `economy/factory-formulas.md`, `economy/ship-costs.md`, `technology/research-formulas.md`

All four economy docs reference `slider-mathematics.md` for worker/production allocation. This file does not appear to exist in the design directory. The slider system (ECO/PROD/SHIP/DEF/RES allocation) is central to all per-turn calculations but is entirely undefined in the reviewed documents.

---

### H5 — `species/race-stats-complete.md` referenced but does not exist
**File:** `economy/factory-formulas.md` §2, §6

Mice production bonus notes: "See `species/race-stats-complete.md` for full calculation." This file is referenced in at least two places but was not present. Mice have three stacking production bonuses described in a note, but the complete formula for how they interact is deferred to a non-existent document.

---

### H6 — Transport cost discrepancy
**Files:** `economy/population-growth.md` §7 vs `economy/ship-costs.md` §16

**In `population-growth.md`:**
```
Transport: 5 BC, capacity 1 million pop
```

**In `ship-costs.md`:**
```
Light Transport:   50 BC, 1 BC/turn maintenance, capacity 5 troops
Heavy Transport:  100 BC, 2 BC/turn maintenance, capacity 10 troops
Assault Transport: 200 BC, 4 BC/turn maintenance, capacity 20 troops
```

`population-growth.md` defines a single "Transport" at 5 BC carrying 1M colonists. `ship-costs.md` defines three troop transport types at 50–200 BC with troop capacities. These appear to be two different classes of transport (population vs troops), but neither doc explains the distinction or cross-references the other. The 5 BC transport cost is also implausibly low given the hull cost tables.

---

### H7 — Planet base sizes differ between ecology doc and planetology doc
**Files:** `economy/population-growth.md` and `economy/factory-formulas.md` vs `technology/planetology.md` constants section

**In `population-growth.md` and `factory-formulas.md`:**
```
Tiny: 20, Small: 40, Medium: 60, Large: 80, Huge: 100
```

**In `planetology.md`** constants:
```
max_population_cap: 300
Base sizes range from 10 (tiny) to 120 (huge)
```

The `planetology.md` constants comment says "Base sizes range from 10 (tiny) to 120 (huge)" which directly contradicts the 20–100 range in the economy docs. The JSON `environment_types` section and Soil Enrichment example (Large Ocean planet with base 100) are consistent with the economy docs' 20–100 range, making the constants comment appear to be an error — but it should be explicitly corrected.

---

### H8 — Hull cost tables are inconsistent
**File:** `economy/ship-costs.md` §1 vs JSON schema

**In the prose table (§1):**
```
Small:  Base Space ~40,  Hull Cost 6 BC
Medium: Base Space ~100, Hull Cost 36 BC
Large:  Base Space ~250, Hull Cost 200 BC
Huge:   Base Space ~500, Hull Cost 1200 BC
```

**In the JSON `hull_costs` array:**
```json
{ "class": "scout",        "space": 50,   "hull_cost": 25 },
{ "class": "fighter",      "space": 100,  "hull_cost": 40 },
{ "class": "destroyer",    "space": 250,  "hull_cost": 80 },
{ "class": "cruiser",      "space": 500,  "hull_cost": 150 },
{ "class": "battle_cruiser","space": 1000, "hull_cost": 300 },
{ "class": "dreadnought",  "space": 1500, "hull_cost": 500 },
{ "class": "titan",        "space": 2500, "hull_cost": 1000 }
```

The prose uses 4 hull sizes (Small/Medium/Large/Huge) matching MOO1. The JSON defines 7 named classes (scout/fighter/destroyer/etc.) with entirely different space and cost values. These two systems need to be reconciled. Are the 4 MOO1-style sizes mapped to some of the 7 JSON classes? Which is the canonical list?

Also: `construction.md` notes "all 4 hull sizes are available from the start" and lists hull sizes as Small/Medium/Large/Huge with space values matching the prose in `ship-costs.md`, inconsistent with the 7-class JSON in `ship-costs.md`.

---

### H9 — Uridium Fuel Cells tech level conflict
**Files:** `technology/propulsion.md` vs `galaxy/travel.md`

**In `propulsion.md`** (Tier 5):
- Uridium Fuel Cells @ tech level 18, range 7

**In `travel.md`** fuel cell table:
```
Reajax II (listed as "Mid-Late", range 9) — but propulsion.md puts Reajax at tier 7 (range 8)
Trilithium Crystals (range 10) — propulsion.md puts this at range 9
```

The `travel.md` table has 9 fuel cell entries but `propulsion.md` only has 9 too — however the ranges assigned differ. `travel.md` lists:
```
Hydrogen: 4, Deuterium: 5, Irridium: 6, Dotomite: 7, Uridium: 8, Reajax: 9, Trilithium: 10, Thorium: Unlimited
```

`propulsion.md` lists:
```
Standard: 3, Extended: 4, Improved: 5, Advanced: 6, Superior: 7, High-Capacity: 8, Ultra: 9, Maximum: 10, Thorium: ∞
```

The starting range is 3 in `propulsion.md` (Standard Fuel Cells) vs 4 in `travel.md` (Hydrogen). Also `travel.md` uses MOO1 lore names while `propulsion.md` uses generic names — which set of names is canonical? The starting range discrepancy (3 vs 4) matters for early-game balance.

---

### H10 — Travel doc uses different engine table than propulsion doc
**File:** `galaxy/travel.md` vs `technology/propulsion.md`

`travel.md` lists warp speeds 1–9 with engine types:
```
Retro → Nuclear → Sub-Light → Fusion → Impulse → Ion → Anti-Matter → Inter-Phased → Hyper Drives
```
Max warp = 9.

`propulsion.md` engine table goes up to Speed 10 (Temporal Drive, tech 55) and Speed 8 (Hyper-X Drive, tech 48). `travel.md` does not mention Hyper-X or Temporal drives, leaving a gap for end-game engines. The Hyper Drive in `travel.md` is listed as "End-game" at warp 9, but `propulsion.md` puts Hyperdrives at Speed 7 with Hyper-X at Speed 8.

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
| `economy/slider-mathematics.md` | 4 docs | Complete slider (ECO/PROD/SHIP/DEF/RES) formulas |
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
| `economy/factory-formulas.md` | C3, C4, C5 | H4, H5 | M12 | L1, L2 |
| `economy/ship-costs.md` | C7 | H6, H8 | M6, M12 | L8 |
| `technology/research-formulas.md` | C7 | H4 | M1, M4, M10 | L6 |
| `technology/TECH_OVERVIEW.md` | — | — | — | — |
| `technology/computers.md` | C3 | — | — | L10, L11 |
| `technology/construction.md` | — | H8 | — | L1 |
| `technology/force-fields.md` | — | — | M6, M7, M13 | L12 |
| `technology/planetology.md` | C1, C2, C4, C6 | H2, H7 | M2 | L4, L5 |
| `technology/propulsion.md` | — | H9, H10 | M3, M8, M9 | L7, L9 |
| `technology/weapons.md` | — | H2 | — | — |
| `galaxy/travel.md` | — | H9, H10 | M3 | — |
| `galaxy/exploration.md` | — | — | M2, M3 | — |

---

## Recommended Priority Order

1. **Resolve C1 (Cloning)** — two completely incompatible mechanics
2. **Resolve C3 (Robotic Controls tech levels)** — foundational to economy
3. **Resolve C6 (Terraforming tech levels)** — foundational to population
4. **Resolve C2 (Soil Enrichment formula)** — affects max population empire-wide
5. **Resolve C4 (Eco Restoration)** — affects all factory calculations
6. **Resolve C7 (Miniaturization cap)** — affects all ship design costs
7. **Create `slider-mathematics.md`** (H4) — core to all per-turn calculations
8. **Reconcile hull classes** (H8) — must choose MOO1 4-class or 7-class system
9. **Resolve bio weapon stats** (H2) — three-way inconsistency
10. **Resolve fuel range starting value** (H9, H10) — affects early game

---

*Generated: 2026-04-12*
*Files reviewed: 13 design documents*
*Issues found: 7 Critical, 13 High, 13 Medium, 12 Low, 14 Missing Documents*
