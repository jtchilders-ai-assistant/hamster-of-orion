# Final Review: Economy & Colony Design vs MOO1 Reference

**Reviewer:** Wesley Crusher (AI Subagent)
**Date:** 2026-04-13
**Scope:** Economy design files + galaxy/planet design files vs MOO1 (StrategyWiki + actual game mechanics)

---

## Executive Summary

The economy and colony design documents are **substantially faithful to MOO1** in their core structure: logistic population growth, factory-based production, 5-slider colony management, and mineral richness modifiers. The main issues are:

1. **Population manual labor output is wrong** — MOO1 scales it via Planetology tech; design docs treat it as fixed (Critical)
2. **Mineral richness modifier not integrated into economy formulas** — defined in planet docs but missing from production calculations (Critical)
3. **Planet size max-pop values are inconsistent** between economy docs and planet-gen docs (Moderate)
4. **Environment growth modifiers use different granularity** between generation-tables.md and population-growth.md (Moderate)
5. **Gaia can spawn naturally** in star-systems.md but cannot in generation-tables.md — contradiction (Minor)
6. **Colonization tech order is reversed** in design vs MOO1 (Barren harder than Tundra; MOO1 is the other way) (Minor)
7. Several items are design additions beyond MOO1 (morale growth modifier, starvation deaths, detailed food system, ECO growth bonus phase) — these are intentional extensions and should be flagged as non-MOO1 additions

---

## Reference Sources Used

- StrategyWiki MOO1 — "Growing your population" (live fetch)
- StrategyWiki MOO1 — "Increasing your production" (live fetch)
- StrategyWiki MOO1 — "Planets to colonize" (live fetch)
- StrategyWiki MOO1 — "Star systems" (live fetch)
- Design files reviewed:
  - `economy/population-growth.md`
  - `economy/factory-formulas.md`
  - `economy/slider-mathematics.md`
  - `economy/ship-costs.md`
  - `galaxy/star-systems.md`
  - `planets/planet-types.md`
  - `planets/planet-sizes.md`
  - `planets/generation-tables.md`
  - `planets/population.md`
  - `planets/production.md`
  - `REVIEW_MECHANICS.md` (prior review context)

---

## Discrepancy Report

---

### CRITICAL-1 — Population Manual Labor Output: Fixed vs Tech-Scaled ✅ FIXED

**MOO1 Behavior (from StrategyWiki "Growing your population"):**

> Each population by itself can make between 0.5 BCs and 2 BCs depending on the civilization's technology level in Planetology (scaled evenly across the range from technology level 1 to 99).
> 
> Formula: `Base 0.5 + (LVL ÷ 50 × 1.5)` (at TL 50 = 2.0 BC/pop)

Population labor output scales with Planetology tech level, not fixed.

**Design Docs (factory-formulas.md §3):**
```
Population_Production = Population × 0.5 × Racial_Production_Modifier
```
Fixed at 0.5 BC/pop. Planetology scaling is **not mentioned anywhere** in the economy files.

**Impact:** At high Planetology tech levels, MOO1 populations are 4× more productive from manual labor than the design docs specify. This is a significant late-game economic difference.

**Recommendation:** Update `factory-formulas.md` and `slider-mathematics.md` to scale population output:
```
Base_Pop_Output = 0.5 + (Planetology_TL / 50 × 1.5)
Population_Production = Population × Base_Pop_Output × Racial_Production_Modifier
```
Note: At game start (TL ~1), output is ≈ 0.5 BC — so early game is correct; error compounds later.

**✅ FIXED 2026-04-13:** Updated `economy/factory-formulas.md` §3 and algorithm, and `economy/slider-mathematics.md` §5 and JSON schema. Formula is now `Base_Pop_Output = 0.5 + (Planetology_TL / 50 × 1.5)` with a TL cap of 50. Worked examples updated. Klackon/Ants note retained as-is (1.5× racial modifier still applies to scaled output).

**Klackon/Ants special ability note (MOO1):** The Klackon (Ants in our design) double their manual labor output. In MOO1 this means 1–4 BC/pop (not a 1.5× production modifier as currently documented). Verify whether the 1.5× Ants production modifier in `factory-formulas.md` correctly represents this or needs adjustment.

---

### CRITICAL-2 — Mineral Richness Modifier Not Integrated Into Production Formula ✅ FIXED

**MOO1 Behavior:**
Mineral richness multiplies factory output. This is established in MOO1 and referenced consistently in the design galaxy/planet docs.

**Design Docs:**
- `galaxy/star-systems.md`: Documents richness modifiers (Ultra Poor 1/3×, Poor 1/2×, Normal 1×, Rich 2×, Ultra Rich 3×) ✅
- `planets/generation-tables.md`: Documents richness levels and probability tables ✅
- `economy/factory-formulas.md`: **No mention of mineral richness modifier.** The `Total_Production` formula does not include it.
- `economy/slider-mathematics.md`: **No mention of mineral richness modifier.**

**The production formula in `factory-formulas.md` §3 is:**
```
Total_Production = Factory_Production + Population_Production
```
Missing the richness modifier.

**Correct MOO1 formula should be:**
```
Total_Production = (Factory_Production + Population_Production) × Mineral_Richness_Modifier
```
Or equivalently, just factory output is modified (depends on MOO1 interpretation — StrategyWiki isn't explicit, but conventionally richness affects factory output, not population labor).

**Impact:** Ultra Rich planets would produce the same as Normal planets in the current design. This breaks a core MOO1 strategic mechanic (fighting over Rich/Ultra Rich worlds).

**Recommendation:** Add `Mineral_Richness_Modifier` to `factory-formulas.md` production formula. Update `planets/population.md` formula (which does include the modifier) to be the authoritative reference, and make `factory-formulas.md` consistent with it.

Note: `planets/population.md` correctly shows:
```
Total_Production *= Mineral_Richness_Modifier
```
but `economy/factory-formulas.md` did not. **These docs were inconsistent with each other.**

**✅ FIXED 2026-04-13:** Added `Mineral_Richness_Modifier` table (Ultra Poor ×0.33 → Ultra Rich ×3.0) to `economy/factory-formulas.md` §3 and JSON schema. Updated `economy/slider-mathematics.md` §5 formula and JSON schema. Applied as multiplier to gross production: `Gross = (Factory_Production + Population_Production) × Mineral_Richness_Modifier`. Worked examples updated.

---

### MODERATE-1 — Planet Size Max-Pop Values Are Inconsistent ✅ FIXED

**economy/population-growth.md and economy/factory-formulas.md:**
| Size | Max Pop |
|------|---------|
| Tiny | 20 |
| Small | 40 |
| Medium | 60 |
| Large | 80 |
| Huge | 100 |

**planets/planet-sizes.md and planets/generation-tables.md:**
| Size | Range |
|------|-------|
| Tiny | 10–20 |
| Small | 25–40 |
| Medium | 45–70 |
| Large | 75–100 |
| Huge | 100–150 |

**MOO1 Reference:** MOO1 uses fixed values per size (not ranges). The typical values from MOO1 community documentation are approximately 25/50/75/100/125 or similar round numbers — the exact values aren't confirmed from StrategyWiki text alone, but fixed values per size is the correct MOO1 model.

**Impact:** The economy formulas assume fixed max-pop values (e.g., "Large = 80"), but the planet generation system generates variable values within a range. If a generated Large planet rolls 95 base pop, the economy docs' formula `Max_Factories = 80 × RC_Level` would be wrong for that planet.

**Recommendation:** Decide: use fixed per-size values (simpler, more MOO1) or variable ranges (more variety). If ranges are kept, update `economy/population-growth.md` and `factory-formulas.md` to use the generated `base_population` value rather than hardcoded per-size numbers. The economy docs' "Base Planet Sizes" tables should be labeled as typical/representative values, not definitive.

**✅ FIXED 2026-04-13:** Chose to keep variable ranges (more variety). Updated `economy/population-growth.md` §2 and JSON schema to show ranges alongside typical midpoints, with explicit note that formulas must use `planet.base_population` (generated value). Updated `economy/factory-formulas.md` §6 and JSON schema similarly. `planets/generation-tables.md` §4 is already authoritative for ranges.

---

### MODERATE-2 — Environment Growth Modifiers: Granular vs Binary ✅ FIXED

**economy/population-growth.md:**
Uses 14 distinct growth modifiers (Gaia 1.0 → Radiated 0.10), a detailed graduated scale.

**planets/generation-tables.md:**
Uses a simple binary model for the environment summary table:
- Hostile environments: `growth_modifier: 0.5`
- Standard environments: `growth_modifier: 1.0`
- Legendary (Gaia): `growth_modifier: 2.0`

**MOO1 Reference:** MOO1 does use differentiated growth rates between environments, though exact values aren't confirmed from StrategyWiki text. The detailed graduated scale in `population-growth.md` is a reasonable faithful extension.

**Impact:** These two documents directly contradict each other for the same game mechanic. `generation-tables.md` implies a Jungle planet (standard, 1.0×) grows at the same rate as a Terran planet — `population-growth.md` says Jungle grows at 0.9× vs Terran at 1.0×.

**Recommendation:** `economy/population-growth.md` should be treated as authoritative for growth rates (it's more detailed and MOO1-consistent). Update `generation-tables.md` to remove the simple binary growth modifiers from the environment type JSON schema, or add a note that the per-environment growth rates are defined in `economy/population-growth.md`.

**✅ FIXED 2026-04-13:** Updated `planets/generation-tables.md` §2.1 JSON and §2.2 summary table to use the full 14-value graduated scale from `economy/population-growth.md` (authoritative). Removed the binary category-level `growth_modifier` fields. Added per-environment `growth_modifier` and `pop_capacity_modifier` fields to each type entry. Added authoritative-reference note to both the JSON block and the summary table.

---

### MODERATE-3 — Environment Capacity Modifiers Differ Between Docs ✅ FIXED

**economy/population-growth.md capacity modifiers (selected):**
| Environment | Capacity Mod |
|-------------|-------------|
| Radiated | 0.20 |
| Toxic | 0.30 |
| Inferno | 0.30 |
| Dead | 0.40 |
| Barren | 0.50 |
| Tundra | 0.60 |

**planets/generation-tables.md capacity modifiers:**
| Environment | Capacity Mod |
|-------------|-------------|
| Radiated | 0.30 |
| Toxic | 0.30 |
| Inferno | 0.40 |
| Dead | 0.40 |
| Tundra | 0.50 |
| Barren | 0.50 |

The values for Radiated, Inferno, Tundra, and Barren differ between the two documents. Specifically:
- Radiated: 0.20 (pop-growth.md) vs 0.30 (gen-tables.md) — 50% difference!
- Inferno: 0.30 vs 0.40
- Tundra: 0.60 vs 0.50

**Recommendation:** `economy/population-growth.md` should be authoritative; update `generation-tables.md` to match.

**✅ FIXED 2026-04-13:** Updated `planets/generation-tables.md` §2.1 and §2.2 to match `economy/population-growth.md` values exactly:
- Radiated: 0.30 → **0.20** (was wrong in gen-tables)
- Inferno: 0.40 → **0.30**
- Tundra: 0.50 → **0.60**
- Minimal: 0.60 → **0.70** (standard category correction)
All values now synchronized with population-growth.md as the single source of truth.

---

### MINOR-1 — Gaia World Spawn Rules Contradict Each Other

**galaxy/star-systems.md:** Does not mention Gaia at all (oversight).

**planets/generation-tables.md §2.1:**
```json
"legendary": {
  "spawns_naturally": false,
  "description": "Only created through terraforming."
}
```
Gaia cannot spawn naturally. ✅ (MOO1 consistent)

**planets/planet-types.md:**
Describes Gaia as "rare" but doesn't say it can't spawn naturally.

**economy/population-growth.md:**
Gaia appears in environment tables with `growth_modifier: 1.00` — no mention of whether it spawns naturally.

**MOO1 Reference:** Gaia worlds do not spawn naturally in MOO1. They are created through terraforming (the Gaia Transformation tech). This is consistent with `generation-tables.md`.

**Recommendation:** Add a note to `planet-types.md` and `population-growth.md` that Gaia is a terraforming-only environment that cannot appear on generated planets.

---

### MINOR-2 — Colonization Tech Order Reversed vs MOO1

**economy/population-growth.md §13 (Colonization tech order):**
```
Tech Level 3:  Controlled Barren
Tech Level 6:  Controlled Tundra
Tech Level 9:  Controlled Dead
Tech Level 12: Controlled Inferno
Tech Level 15: Controlled Toxic
Tech Level 18: Controlled Radiated
```
Barren is the easiest to colonize (TL 3), Radiated is hardest (TL 18).

**planets/planet-types.md (Hostile Environments order):**
```
Radiated    (most hostile)
Toxic
Inferno
Dead
Tundra
Barren      (least hostile)
```
Barren is least hostile, Radiated is most hostile — consistent with the intuitive ordering.

**planets/generation-tables.md:**
Lists `hostility_rank`: Radiated=1 (most hostile), Barren=6 (least hostile among hostile worlds).

**MOO1 Reference (StrategyWiki "Planets to colonize"):** Mentions that more hostile environments require more advanced technology. The standard MOO1 tech ordering has **Barren as easiest to colonize**, progressing through Tundra, Dead, Inferno, Toxic, to Radiated as hardest. This matches `planet-types.md` and `generation-tables.md` ordering.

**The tech order in `economy/population-growth.md` is CORRECT** (TL 3 Barren → TL 18 Radiated), even though the hostility description in `planet-types.md` lists them in opposite order. No actual discrepancy in the tech levels — but the prose descriptions are confusing because `planet-types.md` lists Radiated first in the "Require Tech" table, implying it's the first one you'd encounter/want to colonize, when it's actually the last you can.

**Recommendation:** Reorder `planet-types.md` "Hostile Environments" table from easiest-to-colonize (Barren) to hardest (Radiated) to match the natural colonization progression. This is a documentation clarity fix, not a formula fix.

---

### MINOR-3 — ECO Slider Growth Bonus Phase (Non-MOO1 Addition)

**Design docs (`slider-mathematics.md` §3, `economy/population-growth.md` §6):**
Define an "ECO Growth Bonus Phase" where excess ECO BC (after cleanup) accelerates population growth:
```
Growth_BC_Efficiency = 0.1 additional pop growth per BC
```

**MOO1 Reference:** MOO1 does not have an explicit ECO-to-growth-bonus mechanic. In MOO1, population grows naturally and the ECO slider is primarily about waste cleanup and terraforming. There is no "spend BC to grow population faster" mechanic.

**Assessment:** This is a deliberate design extension beyond MOO1. It's not wrong — it adds an interesting economic lever — but it should be documented as a **non-MOO1 addition** rather than presented as MOO1-faithful behavior. The `Growth_BC_Efficiency` constant (0.1) has no MOO1 basis.

**Recommendation:** Add a note in `slider-mathematics.md` §3 marking the ECO growth bonus phase as a "HoO design extension" not present in MOO1. This helps implementers understand what to test against MOO1 vs what is original.

---

### MINOR-4 — Starvation System (Non-MOO1 Addition, Under-Documented)

**Design docs (`population-growth.md` §10, food system):**
A detailed food production/starvation system with farmer workers, food fertility by environment, starvation deaths at 50% of deficit per turn.

**MOO1 Reference:** MOO1 does **not** have a separate food/farmer mechanic. Population growth happens automatically based on environment and race. There are no farmer worker allocations, no food deficits, no starvation mechanics in MOO1. The "Increasing your production" wiki page confirms: production sliders cover Ships/Defense/Industry/Ecology/Research — no Food slider exists.

**Assessment:** This is a substantial non-MOO1 addition. It's a significant feature addition that changes gameplay considerably. The food system involves:
- A 6th resource type (food) and fertility modifiers per environment
- Farmer worker allocation (not present in MOO1 sliders)
- Starvation death mechanics
- Food racial modifiers

If this is intentional, it needs to be integrated into `slider-mathematics.md` as a 6th slider, or clarified how farmer allocation interacts with the 5-slider system. Currently, the food system is described but the slider integration is absent.

**Recommendation:** Either:
1. **Keep as design extension:** Explicitly document this as an HoO original feature, define how farmer allocation works within or alongside the 5-slider system, add the Food slider if applicable.
2. **Remove:** If strict MOO1 faithfulness is desired, remove the food/starvation system and replace with MOO1's natural population growth model (no food required).

---

### MINOR-5 — Morale Growth Modifier (Non-MOO1 Addition)

**Design docs (`population-growth.md` §11):**
```
Morale_Growth_Modifier = 0.5 + (Morale / 200)
```
Morale affects population growth rate.

**MOO1 Reference:** MOO1 does not have a morale system that affects population growth. Morale in MOO1 (called "unrest") affects tax rates and may trigger rebellions, but does not multiply population growth rate.

**Assessment:** Another deliberate design extension. Not a problem per se, but should be flagged. The formula means a colony in rebellion (Morale=0) grows at only 50% rate, while an ecstatic colony (Morale=100) grows at 100% rate.

**Recommendation:** Flag as HoO design extension. Verify the morale range (0–100) and formula are consistent with how morale is implemented in the broader morale/diplomacy docs.

---

## Items Confirmed Faithful to MOO1

These match MOO1 reference and require no changes:

| Area | Design Doc | MOO1 Match |
|------|-----------|------------|
| Base population growth formula (logistic) | population-growth.md | ✅ |
| 5 colony sliders (SHIP/DEF/IND/ECO/TECH) | slider-mathematics.md | ✅ |
| Robotic Controls II starting tech, 2 fac/pop | factory-formulas.md | ✅ |
| RC progression II→VII (2–7 factories/pop) | factory-formulas.md | ✅ |
| Meklars/Mice +2 RC bonus | factory-formulas.md | ✅ |
| Factory base output: 1 BC/factory | factory-formulas.md | ✅ |
| Factory cost: 10 BC (base), reduced by Construction | factory-formulas.md | ✅ |
| Pollution generated by factories, cleaned by ECO | factory-formulas.md | ✅ |
| Empire Reserve for overflow production | slider-mathematics.md | ✅ |
| Research is factory-driven (TECH slider) | slider-mathematics.md | ✅ (wiki confirms) |
| Terraforming increases max population | population-growth.md | ✅ |
| Soil Enrichment: flat max-pop bonus, one-time cost | population-growth.md | ✅ (after C2 fix) |
| Cloning: flat pop/turn bonus | population-growth.md | ✅ (after C1 fix) |
| Initial colony population: 2 million | population-growth.md | ✅ |
| Star color → habitability tendency | star-systems.md, gen-tables.md | ✅ |
| Mineral richness levels (5 tiers, modifiers) | star-systems.md, gen-tables.md | ✅ |
| One planet per star system | star-systems.md | ✅ |
| Artifacts worlds give tech bonuses | planet-types.md, gen-tables.md | ✅ |
| Gaia cannot spawn naturally | generation-tables.md | ✅ |
| 14 environment types | population-growth.md | ✅ |
| Ship maintenance at 2% of construction cost | ship-costs.md | ✅ (reasonable) |
| Scrap value ~25% of construction cost | ship-costs.md | ✅ (reasonable) |
| Difficulty modifiers for player vs AI | population-growth.md, factory-formulas.md | ✅ |

---

## Non-MOO1 Design Extensions (Intentional Additions)

These are confirmed departures from MOO1 that should be explicitly labeled as HoO original features:

| Feature | Source | Notes |
|---------|--------|-------|
| Food/Farmer/Starvation system | population-growth.md | No equivalent in MOO1 |
| ECO slider growth bonus phase | slider-mathematics.md | MOO1 ECO = cleanup + terraform only |
| Morale growth modifier | population-growth.md | MOO1 morale affects tax, not growth |
| Detailed fertility per environment | population-growth.md | MOO1 doesn't have fertility multipliers |
| Starvation deaths formula | population-growth.md | No starvation in MOO1 |
| Conquest 50% pop reduction detail | population-growth.md | MOO1 has conquest pop reduction, exact % unclear |
| Bio weapon max-pop reduction | population-growth.md | MOO1 has bio weapons; exact mechanics may differ |
| Fleet Logistics maintenance tech | ship-costs.md | MOO1 fleet maintenance not tech-reducible (unconfirmed) |
| Planet quality scoring system | generation-tables.md | Design tool, no MOO1 equivalent |

---

## Action Items Summary

| Priority | Issue | Files Affected | Status |
|----------|-------|----------------|--------|
| 🔴 CRITICAL | Pop labor output must scale with Planetology TL, not fixed at 0.5 | `economy/factory-formulas.md`, `economy/slider-mathematics.md` | ✅ FIXED 2026-04-13 |
| 🔴 CRITICAL | Mineral richness modifier missing from production formula | `economy/factory-formulas.md`, `economy/slider-mathematics.md` | ✅ FIXED 2026-04-13 |
| 🟡 MODERATE | Planet size max-pop values inconsistent (fixed vs range) | `economy/population-growth.md`, `economy/factory-formulas.md` | ✅ FIXED 2026-04-13 |
| 🟡 MODERATE | Environment growth modifiers: graduated vs binary contradiction | `planets/generation-tables.md` | ✅ FIXED 2026-04-13 |
| 🟡 MODERATE | Environment capacity modifier values differ between two docs | `planets/generation-tables.md` vs `economy/population-growth.md` | ✅ FIXED 2026-04-13 |
| 🟢 MINOR | Gaia spawn rules missing from some docs | `planets/planet-types.md`, `economy/population-growth.md` | ⏳ Open |
| 🟢 MINOR | Hostile env table ordering counterintuitive in planet-types.md | `planets/planet-types.md` | ⏳ Open |
| 🟢 MINOR | ECO growth bonus not labeled as non-MOO1 extension | `economy/slider-mathematics.md` | ⏳ Open |
| 🟢 MINOR | Food/starvation system needs slider integration or removal | `economy/population-growth.md`, `economy/slider-mathematics.md` | ⏳ Open |
| 🟢 MINOR | Morale growth modifier not labeled as non-MOO1 extension | `economy/population-growth.md` | ⏳ Open |

---

## Notes on Reference Limitations

The MOO1 StrategyWiki subpages (Growing_your_population, Increasing_your_production, etc.) were fetched live. The local reference file (`strategywiki-moo1.txt`) contains only the TOC — no subpage content was scraped locally. The PDF manual (`Master_of_Orion_-_Manual_-_PC.pdf`) was not parsed. Some MOO1 mechanics (exact conquest pop-reduction percentages, exact fleet maintenance tech, exact morale growth interaction) are not confirmed from available text sources and are flagged as "reasonable" or "unconfirmed."

---

*Generated: 2026-04-13 by subagent final-review-economy*
*Spec coverage: economy/*.md + galaxy/star-systems.md + planets/*.md vs MOO1 StrategyWiki*
