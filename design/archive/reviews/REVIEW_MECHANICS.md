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

### ~~H1 — Morale modifier missing from growth formula header~~ ✅ FIXED (2026-04-12)
**File:** `economy/population-growth.md` §1

The §1 formula now includes `Morale_Modifier` and a reference to §6:
```
Growth_Per_Turn = Population × Base_Growth_Rate × Environment_Modifier × Racial_Modifier × Morale_Modifier × (1 - Population / Max_Population)
```

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

### H3 — Population formula: Ants max-pop bonus not reflected in Max_Population formula ✅ FIXED (2026-04-12)
**File:** `economy/population-growth.md` §2 and pseudocode

**Resolution:** Added `Racial_Capacity_Modifier` to the Max_Population formula and `calculate_max_population()` pseudocode:
```
Max_Population = floor((Base_Size + Terraforming_Bonus + Soil_Enrichment_Bonus) × Environment_Capacity_Modifier × Racial_Capacity_Modifier)
```
Added `get_racial_capacity_modifier()` helper function (returns 1.25 for Ants, 1.0 for all others). Added `racial_capacity_modifiers` table to the JSON schema. The formula now correctly applies the Ants' Overpopulation +25% capacity bonus.

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

### ~~H5 — `species/race-stats-complete.md` referenced but does not exist~~ ✅ FIXED (2026-04-12)
**File:** `economy/factory-formulas.md` §2, §6

**Resolution:** `species/race-stats-complete.md` exists and has been updated with a complete **Example 0: Mice Triple-Stacking Production Bonus** section that documents:
- How the three bonuses apply at different formula stages
- Full pseudocode for ordering: RC bonus → Automated Production → Racial modifier
- Worked example comparing Mice vs Hamsters at game start and late-game
- Implementation notes clarifying that `production_per_pop_bonus: 2` in the JSON refers to the RC level effect, not a flat BC/pop bonus

Also fixed the cross-reference paths in `factory-formulas.md` (was `species/race-stats-complete.md`, now `../species/race-stats-complete.md`) and corrected the description of Cybernetic Workers bonus from "+2 production per population" to "+2 RC level bonus (more max-operable factories)".

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

### M1 — No formula for how `Difficulty_Modifier` affects RP generation ✅ FIXED (2026-04-12)
**File:** `technology/research-formulas.md` §1

**Resolution:** Removed `Difficulty_Modifier` from the player `Planet_RP` formula entirely. It was confusing because difficulty does not affect player RP generation at all. The doc now clearly states:
- `Planet_RP` formula (player): no `Difficulty_Modifier` term — player RP is unaffected by difficulty at all levels
- `Difficulty_Modifier` applies only to `AI_Actual_Tech_Cost` (making AI techs cheaper or more expensive to research)
- Full table of AI cost modifiers added: Simple 1.50×, Easy 1.25×, Average 1.00×, Hard 0.75×, Impossible 0.50×
- Implementation note added: `Difficulty_Modifier` check gates on `empire.is_ai` before applying

The `Difficulty Effects on Research` section at the bottom of the doc (which was already correct) is now consistent with §1 and §7.

---

### M2 — Artifacts world bonus applies inconsistently ✅ FIXED (2026-04-12)
**File:** `technology/research-formulas.md` §4, `galaxy/exploration.md` Artifacts Worlds section

**Resolution:** Artifacts worlds provide **both** bonuses — this was the intended design, never clearly stated. Both docs updated to document the dual benefit:
1. **One-time tech unlock** — fires upon first colonization; grants one random tech from any field; does not repeat even if planet is reconquered
2. **Ongoing +25% RP multiplier** — applies every turn while the planet remains under your control; lost permanently if the planet is conquered or bombed

Both `research-formulas.md` §4 and `exploration.md` now describe both mechanics with the same language and the same implementation note.

---

### M3 — Scanner range defined in exploration vs propulsion differently ✅ FIXED (2026-04-12)
**File:** `galaxy/exploration.md` Fog of War section, `technology/propulsion.md` Fuel Cells section

**Resolution:** Unified with a single canonical definition:
- **Base scanner range: 2 parsecs** from every owned colony (passive empire-wide sensor) — not 3
- Scanner range is improved by **Computers field** technologies only (Deep Space Scanner, Subspace Scanner, etc.)
- **Fuel cells and fuel tank components do not affect scanner range** — they extend ship travel range only

**Changes made:**
- `exploration.md` Fog of War section rewritten: base range corrected 3→2 parsecs, incorrect fuel cell reference removed, clarifying table added showing scanner range progression by Computers tech
- `propulsion.md` Fuel Cells category description updated: explicit note added that fuel cells affect travel range only, not scanner range, with cross-reference to `exploration.md` and `computers.md`

Canonical scanner range table (in `exploration.md`):
| Technology (Computers Field) | Scanner Range |
|------------------------------|---------------|
| None (base)                  | 2 parsecs     |
| Deep Space Scanner           | 4 parsecs     |
| Subspace Scanner             | 6 parsecs     |
| Deep Space Scanner II        | 8 parsecs     |

---

### M4 — `Actual_Tech_Cost` formula has an inversion issue ✅ FIXED (2026-04-12)
**File:** `technology/research-formulas.md` §7

**Resolution:** Removed `(1 / Racial_Research_Modifier)` from `Actual_Tech_Cost` formula. Single canonical implementation: racial modifier is applied to RP generation (§1, §3), not tech cost. `Actual_Tech_Cost` now only uses `Galaxy_Size_Modifier` and `Difficulty_Modifier`. Explicit note added to §7 stating that the cost-inversion form is **not** the implementation and must not be used.

---

### M5 — Edge case: what happens when Max_Population < current population after terraforming loss? ✅ FIXED (2026-04-12)
**File:** `economy/population-growth.md` Edge Cases section

**Resolution:** Added "Overcrowding" edge case to `population-growth.md`. Explicit rule: excess population does NOT die instantly. Growth halts (growth_factor = 0), and natural starvation from `process_food()` reduces population to max over several turns at the starvation rate (0.5 × deficit/turn). Added pseudocode and a concrete bio-weapon example. Implementation note added: `calculate_max_population()` must be called before `calculate_population_growth()` each turn.

---

### M6 — Black Hole Generator requires "Huge hull" but JSON specifies different ship classes ✅ FIXED (previously, as part of H8)
**File:** `technology/force-fields.md` §12 / JSON

**Resolution:** Fixed as part of H8 (hull class unification). JSON `requires_ship_class` was updated from `["dreadnought", "titan"]` to `["huge"]` when the game was unified to MOO1's 4-class hull system. Prose already said "Huge hull only" and the JSON now matches.

---

### M7 — Stasis Field: "cannot target same ship two turns in a row" conflicts with duration ✅ FIXED (2026-04-12)
**File:** `technology/force-fields.md` §10

**Resolution:** Authoritative ruling: **stasis DOES prevent retreat**. A ship in stasis cannot move, fire, or retreat during the stasis round; "cannot move or take any action" explicitly includes retreat. The contradictory "does not prevent retreat" note was removed from the Edge Cases section and the Stasis Field mechanics description was updated to state this explicitly. JSON updated with `"prevents_retreat": true`, `"prevents_targeting": true`, and `"cannot_retarget_same_ship_consecutive_rounds": true`.

---

### M8 — Energy Pulsar area damage target is undefined ✅ FIXED (2026-04-12)
**File:** `technology/propulsion.md` §4 / JSON

**Resolution:** Added "Energy Pulsar Mechanics (Detail)" section to `propulsion.md` with full Q&A targeting table. Authoritative rules:
- "Adjacent" = the 6 immediately surrounding hexes on the combat grid (range 1)
- Affects **all ships** in adjacent hexes (no cap), including **friendly ships** (indiscriminate)
- Each ship in an adjacent hex is rolled separately (1d6 per ship, independent rolls)
- Auto-hits (no accuracy roll), shields apply normally
- Manual activation, uses special weapon slot, once per round
- JSON updated with `area_target`, `affects_friendly`, `range`, `auto_hit`, `uses_weapon_slot`, `activations_per_round` fields

---

### M9 — Warp Dissipator mechanics undefined ✅ FIXED (2026-04-12)
**File:** `technology/propulsion.md` §7

**Resolution:** Added complete Warp Dissipator mechanics to `propulsion.md`: area of effect (combat-zone-wide field, passive activation), all enemy ships blocked from retreat, carrier ship also cannot retreat while active, no stacking with multiple Dissipators, does NOT block hyperspace transit, does NOT work against Orion Guardian or Sub-Space Teleporter. JSON `effect` field updated with `area`, `prevents_dissipator_ship_retreat`, and `stacks` fields. A dedicated "Warp Dissipator Mechanics (Detail)" section added with full Q&A table and interaction notes.

---

### M10 — Tech tier cost table header says "Tier Multiplier" but values are all 1× ✅ FIXED (2026-04-12)
**File:** `technology/research-formulas.md` Table §6

**Resolution:** Removed the vestigial `Tier_Multiplier` column (was always 1×, adding no information) and updated the formula from `Base_Tech_Cost = Base_Cost × Tier_Multiplier` to `Base_Tech_Cost = Tier_Cost_Table[tier]` (direct lookup). Added a note explaining this is a flat per-tier schedule, not a multiplicative system. Also added a note explaining the Force Fields exception (see M13).

---

### M11 — Conquest population reduction is defined vaguely ✅ FIXED (2026-04-12)
**File:** `economy/population-growth.md` Edge Cases

**Resolution:** Replaced the vague one-liner with an explicit sequence and formula:
1. Bombardment phase kills population first (see weapons docs for bomb damage)
2. Ground invasion occurs
3. Post-invasion: `Conquest_Survivors = floor(Post_Bombardment_Pop × 0.50)` — applies to population surviving bombardment, NOT the planet's original total
4. Minimum 1M survivors (cannot depopulate by conquest alone)
5. Max pop capacity: player's terraforming tech applied, preserving floor of prior capacity
6. Racial note: Ferrets reduce post-invasion reduction from 50% to 40%

---

### M12 — Maintenance tech modifier stacking is not defined ✅ FIXED (2026-04-12)
**File:** `economy/ship-costs.md` §7

**Resolution:**
- **Naming collision resolved:** The maintenance-reducing techs were renamed to "Fleet Logistics I/II/III" (Construction TL 14/30/44) to distinguish them from "Automated Repair Unit" and "Advanced Damage Control" in `construction.md` which are **combat HP regeneration systems** (not maintenance reducers)
- **Stacking clarified:** Multiplicative. Formula: `Ship_Maintenance = Base × Racial_Mod × Fleet_Logistics_I_Mod × Fleet_Logistics_II_Mod × Fleet_Logistics_III_Mod`. With all three: 0.9 × 0.8 × 0.7 = 0.504 (~50% of base, not 60% additive)
- JSON `maintenance_tech_modifiers` updated with new tech IDs and construction tech level references
- `maintenance_stacking` field added with value `"multiplicative"`

---

### M13 — Force Fields: total tiers claim is 14 but research cost table ends at tier 14 with 50,000 RP ✅ FIXED (2026-04-12)
**File:** `technology/force-fields.md` overview vs `research-formulas.md` tier cost table

**Resolution:** Documented the Force Fields accelerated tier cost schedule explicitly in both files:
- **Root cause:** Force Fields has only 14 internal tiers but spans the full tech level range (1–50+), so its tiers cover more tech levels each and cost proportionally more. It uses its own RP cost schedule, NOT the global table.
- **`force-fields.md`:** Added a "Tier cost mapping note" section after the overview with a full 14-row table showing each internal tier's RP cost and its equivalent global tier (Tier 14 = 50,000 RP = Global Tier 18).
- **`research-formulas.md` §6:** Added a Force Fields exception note explaining that Force Fields does NOT use the global tier cost table — always look up its costs in `force-fields.md`. All other fields (Weapons, Propulsion, Construction, Computers, Planetology) use the global table indexed by their internal tier number.

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
| `economy/population-growth.md` | C1, C2, C6 | H1, H2, H3 | ~~M5~~✅, M11 | L3, L4 |
| `economy/factory-formulas.md` | C3, C4, C5 | ~~H4~~✅, ~~H5~~✅ | M12 | L1, L2 |
| `economy/ship-costs.md` | C7 | H6, ~~H8~~✅ | ~~M6~~✅, M12 | L8 |
| `technology/research-formulas.md` | C7 | ~~H4~~✅ | ~~M1~~✅, ~~M4~~✅, M10 | L6 |
| `technology/TECH_OVERVIEW.md` | — | — | — | — |
| `technology/computers.md` | C3 | — | — | L10, L11 |
| `technology/construction.md` | — | ~~H8~~✅ | — | L1 |
| `technology/force-fields.md` | — | — | ~~M6~~✅, ~~M7~~✅, M13 | L12 |
| `technology/planetology.md` | C1, C2, C4, C6 | H2, H7 | ~~M2~~✅ | L4, L5 |
| `technology/propulsion.md` | — | H9, H10 | ~~M3~~✅, ~~M8~~✅, M9 | L7, L9 |
| `technology/weapons.md` | — | H2 | — | — |
| `galaxy/travel.md` | — | H9, H10 | ~~M3~~✅ | — |
| `galaxy/exploration.md` | — | — | ~~M2~~✅, ~~M3~~✅ | — |

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
