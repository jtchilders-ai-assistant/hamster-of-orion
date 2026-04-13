# Economy Implementation Checklist

## ✅ Verified: All Details Present for Implementation

### 1. Production Calculation
**Files:** `economy/factory-formulas.md`, `economy/slider-mathematics.md`

- [x] Factory output formula (1 BC/factory × racial modifier)
- [x] Population labor formula (0.5–2.0 BC/pop scaling with Planetology TL)
- [x] Mineral richness modifiers (Ultra Poor ×0.33 → Ultra Rich ×3.0)
- [x] Max operable factories (Pop × Robotic Controls level)
- [x] Racial production modifiers table
- [x] JSON schema for all values

### 2. Pollution & Cleanup
**Files:** `economy/factory-formulas.md`, `economy/slider-mathematics.md`

- [x] Pollution generation formula (factories × waste rate)
- [x] Waste reduction tech table (100% → 0%)
- [x] Cleanup cost formula (pollution × 0.5 × cleanup modifier)
- [x] Eco Restoration tech table (modifier 1.0 → 0.1)
- [x] Net production = Gross - Cleanup cost

### 3. The 5 Sliders
**File:** `economy/slider-mathematics.md`

- [x] SHIP slider — BC to ship construction queue
- [x] DEF slider — BC to missile bases and planetary shields
- [x] IND slider — BC to factory construction
- [x] ECO slider — Cleanup → Growth → Terraforming (priority order)
- [x] TECH slider — Diverts population to research (reduces production)
- [x] Sum constraint (must equal 100%)
- [x] Locking mechanics
- [x] Rebalancing algorithm pseudocode

### 4. Ship Building (SHIP Slider)
**Files:** `economy/slider-mathematics.md`, `economy/ship-costs.md`

- [x] Construction cost formula (hull + components)
- [x] Hull base costs (Small=6, Medium=36, Large=200, Huge=1200)
- [x] Component costs tables (engines, weapons, shields, specials)
- [x] Build queue mechanics
- [x] Overflow to Empire Reserve
- [x] Maintenance costs per turn

### 5. Defense Building (DEF Slider)
**Files:** `economy/slider-mathematics.md`, `ships/combat-mechanics.md`

- [x] Missile Base cost (150 BC base)
- [x] Missile Base components (auto-upgrade to best tech)
- [x] Planetary Shield costs (per force-fields.md)
- [x] Build priority (bases first, then shields)
- [x] Overflow to Empire Reserve

### 6. Factory Building (IND Slider)
**File:** `economy/factory-formulas.md`

- [x] Factory cost (10 BC base, reduced by Construction tech)
- [x] Factory cost reduction table (10 → 2 BC)
- [x] Build rate formula
- [x] Partial progress carryover
- [x] Max factories (Max Pop × RC level)
- [x] Overflow to Empire Reserve

### 7. ECO Slider (Cleanup/Terraform/Growth)
**Files:** `economy/slider-mathematics.md`, `economy/population-growth.md`

- [x] Priority order: Cleanup → Growth → Terraform
- [x] Cleanup is mandatory first charge
- [x] Growth bonus formula (BC → population acceleration)
- [x] Terraforming costs per tier (+10 max pop each)
- [x] Soil Enrichment (+25/+50 flat bonus)
- [x] Overflow to Empire Reserve (when maxed)

### 8. Research (TECH Slider)
**Files:** `economy/slider-mathematics.md`, `technology/research-formulas.md`

- [x] Scientists = Pop × TECH% (diverts from labor)
- [x] RP formula (scientists × 1.0 × lab multiplier × racial)
- [x] Research Lab multipliers (1.5× → 6.0×)
- [x] Racial research modifiers
- [x] Empire-wide RP pooling
- [x] Tech cost formula (base × tier scaling)
- [x] 6-field allocation sliders

### 9. Population Growth
**File:** `economy/population-growth.md`

- [x] Logistic growth formula
- [x] Base growth rate (10%)
- [x] Environment modifiers (14 types, 0.0–1.0)
- [x] Racial growth modifiers
- [x] Max population formula
- [x] Terraforming bonuses
- [x] Cloning (+2/+5 flat bonus)

### 10. Support Systems
**Files:** Various

- [x] Empire Reserve mechanics
- [x] Trade income (`diplomacy/treaties.md` — 30-turn ramp)
- [x] Maintenance costs (`economy/ship-costs.md`)
- [x] Difficulty modifiers (`technology/research-formulas.md`)

---

## JSON Data Available

All formulas have corresponding JSON schemas for direct implementation:
- `factory-formulas.md` §JSON Data Schema
- `slider-mathematics.md` §13 JSON Schema
- `population-growth.md` §JSON Data Schema
- `research-formulas.md` §JSON Schema

---

## Implementation Notes

1. **Order of operations per turn:**
   - Calculate gross production (factories + pop labor)
   - Apply mineral richness
   - Calculate pollution and cleanup cost
   - Net = Gross - Cleanup
   - Split net across SHIP/DEF/IND by slider %
   - ECO handles its own allocation (cleanup/growth/terraform)
   - TECH diverts pop before production calc

2. **Key edge cases documented:**
   - Cleanup underfunding (pollution accumulates)
   - Slider locks preventing rebalance
   - Max factories reached (overflow to reserve)
   - Research field bonuses by race
   - Hermit Crabs: no pollution but cannot terraform

3. **Racial special cases:**
   - Mice: +2 RC bonus, +25% production, no refit costs
   - Ants: +50% production, +25% max pop, no espionage
   - Hermit Crabs: no pollution, cannot terraform
   - All field research bonuses now documented per race

---

**Status: READY FOR IMPLEMENTATION** ✅
