# Slider Mathematics — Hamster of Orion

## Overview

Each colony has **5 production sliders** that allocate its net production capacity across different categories each turn. The sliders represent the governor's (or player's) priorities for that planet: what to build, what to research, and how to develop.

The 5 sliders are:

| Slider | Abbreviation | Primary Function |
|--------|-------------|-----------------|
| **SHIP** | SHIP | Build ships and starbases |
| **DEF** | DEF | Build missile bases and planetary shields |
| **IND** | IND | Build factories |
| **ECO** | ECO | Clean pollution, grow population, terraform |
| **TECH** | TECH | Generate research points (RP) |

**Constraint:** All 5 slider values must sum to exactly 100% at all times.

---

## Production Flow Summary

```
1. Calculate Gross_Production (factories + population labor)
2. Subtract Cleanup_Cost (mandatory, from ECO allocation)
3. Distribute Net_Production across SHIP / DEF / IND / TECH
4. ECO receives its own allocation for growth and terraforming
5. Any overflow goes to Empire Reserve
```

See `factory-formulas.md` for Gross_Production and Cleanup_Cost formulas.

---

## 1. The 5 Sliders

### SHIP — Shipbuilding
Allocates BC toward the current ship or starbase in the build queue.

```
SHIP_BC = Net_Production × (SHIP_Percent / 100)
```

- BC accumulates in the ship's construction progress each turn
- When the full ship cost is reached, the ship is launched
- Overflow (BC beyond ship cost) rolls into the next item in queue
- If queue is empty, overflow goes to **Empire Reserve**
- Starbases are built in-system; ships are produced and immediately available

### DEF — Planetary Defenses
Allocates BC toward missile bases and planetary shields.

```
DEF_BC = Net_Production × (DEF_Percent / 100)
```

Build priority within DEF (player sets, default order):
1. Missile Bases (until count goal reached)
2. Planetary Shields (until desired tier reached)
3. Excess DEF BC → Empire Reserve

**Missile Base Cost:** Base 100 BC (reduced by Construction tech).  
**Planetary Shield Cost:** Varies by tech tier; see `../technology/force-fields.md`.

### IND — Industry (Factory Construction)
Allocates BC toward building new factories.

```
IND_BC = Net_Production × (IND_Percent / 100)
```

- Factories are built at `Factory_Cost` BC each (reduced by Construction tech)
- Partial progress carries over to the next turn (no waste)
- When planet reaches maximum factory capacity: IND overflow → Empire Reserve
- Max factories = `Max_Population × Robotic_Controls_Level`

See `factory-formulas.md` §5 for the build algorithm.

### ECO — Ecological / Growth
ECO has **priority-ordered internal spending**. Its BC allocation is consumed in this exact sequence:

```
ECO_BC = Net_Production × (ECO_Percent / 100)
```

**ECO Spending Priority (in order):**

1. **Pollution Cleanup** — mandatory first charge; see §2 below
2. **Population Growth Bonus** — accelerate population growth
3. **Terraforming** — permanently increase planet max population

If ECO_BC is insufficient to cover cleanup, the deficit accumulates as uncleared pollution (reducing effective production next turn). The growth and terraforming phases are only funded with ECO BC remaining after cleanup.

### TECH — Research
Allocates population to scientific research rather than production.

```
Scientists = Population × (TECH_Percent / 100)
TECH_RP = Scientists × Base_RP_Per_Scientist × Racial_Research_Modifier
```

- TECH slider is unusual: it **diverts population** from production, it doesn't spend BC
- Population contributing to TECH does **not** contribute to Population_Production
- Base RP per scientist = 1.0 (modified by racial bonuses and Computing tech)
- The 6 research field sliders within TECH determine how RP is distributed

See `../technology/research-formulas.md` for the full RP calculation.

> **Important:** Because TECH diverts workers, increasing TECH_Percent reduces both factory labor availability and population production output. This is the fundamental tradeoff between science and industry.

---

## 2. Pollution Cleanup — ECO Priority Phase

Pollution cleanup is the **first and mandatory charge** against ECO_BC. It is not optional.

```
Pollution_Generated = Operating_Factories × Waste_Rate
Cleanup_Cost = Pollution_Generated × 0.5 × Cleanup_Modifier

Remaining_ECO_BC = ECO_BC - Cleanup_Cost
```

**If ECO_BC < Cleanup_Cost:**
- All of ECO_BC goes to cleanup (partial cleanup)
- Uncleaned pollution = `Pollution_Generated - (ECO_BC / (0.5 × Cleanup_Modifier))`
- Uncleaned pollution reduces planet's effective housing capacity, slowing growth

**If ECO_BC ≥ Cleanup_Cost:**
- Cleanup is fully funded
- Remaining ECO BC proceeds to growth bonus phase

Cleanup modifiers by tech level (from `../technology/planetology.md`):

| Tech Level | Technology | Cleanup Modifier |
|------------|-----------|-----------------|
| 1 | Ecological Restoration | 1.00 |
| 4 | Improved Eco Restoration | 0.67 |
| 11 | Enhanced Eco Restoration | 0.40 |
| 22 | Advanced Eco Restoration | 0.20 |
| 29 | Complete Eco Restoration | 0.10 |

---

## 3. ECO — Population Growth Bonus Phase

After cleanup is paid, remaining ECO BC can accelerate population growth.

```
Growth_BC = min(Remaining_ECO_BC, Growth_BC_Cap)
Growth_Bonus = Growth_BC × Growth_BC_Efficiency
Remaining_ECO_BC -= Growth_BC
```

- **Growth_BC_Efficiency:** 1 BC → 0.1 additional population growth per turn (base)
- **Growth_BC_Cap:** `Max_Population - Current_Population` (cannot grow beyond cap)
- Growth bonus stacks additively with natural growth rate
- Growth bonus applies once per turn (not compounding within the turn)

If the planet is already at maximum population, this phase is skipped and BC passes to terraforming.

---

## 4. ECO — Terraforming Phase

Remaining ECO BC after cleanup and growth bonus can fund terraforming upgrades.

```
Terraforming_BC = Remaining_ECO_BC
Terraforming_Progress += Terraforming_BC
```

When `Terraforming_Progress` reaches the next tier's cost:
- Planet max population increases by the tier's bonus (+10 per tier)
- Progress resets to 0 for the next tier
- Partial progress carries over (no waste)

Terraforming tier costs and max-pop bonuses: see `population-growth.md` Terraforming table.

**Terraforming cannot progress beyond the tech tier the empire has researched.** Excess BC at the max researched tier → Empire Reserve.

---

## 5. Net Production Formula

Because TECH diverts population, the actual production used by SHIP/DEF/IND/ECO is reduced:

```
Active_Population = Population × (1 - TECH_Percent / 100)

Factory_Production = Operating_Factories × 1.0 × Racial_Production_Modifier
Population_Production = Active_Population × 0.5 × Racial_Production_Modifier
Gross_Production = Factory_Production + Population_Production

Pollution = Operating_Factories × Waste_Rate
Cleanup_Cost = Pollution × 0.5 × Cleanup_Modifier

Net_Production = Gross_Production - Cleanup_Cost
```

This Net_Production is then split by SHIP / DEF / IND / ECO percentages (renormalized to exclude TECH):

> **Note on TECH slider and production split:** TECH_Percent removes population from the labor pool before production is calculated. The remaining SHIP + DEF + IND + ECO percentages must still sum to 100% among themselves. In practice, increasing TECH from 0% to 20% doesn't give 20% to TECH "out of" the other sliders — it removes 20% of population from production entirely, and the other 4 sliders split 100% of the (now smaller) Net_Production.

---

## 6. Slider Sum Constraint

The 5 sliders must always sum to 100%:

```
SHIP + DEF + IND + ECO + TECH = 100
```

When the player adjusts one slider, the others must be adjusted to maintain the sum. See §7 (Locking Mechanics) for how this is handled when some sliders are locked.

**Auto-Governor Rule:** When no player-specified governor logic applies, the AI governor adjusts unlocked sliders proportionally to maintain the constraint.

---

## 7. Locking Mechanics

Players can **lock** individual sliders to prevent the auto-governor from adjusting them. Locked sliders retain their exact value; only unlocked sliders are adjusted when re-balancing is needed.

### Lock Rules

1. A slider can be locked at any value from 0% to 100%
2. **At least one slider must remain unlocked** (otherwise re-balancing is impossible)
3. The sum of locked sliders cannot exceed 100% (game prevents this)
4. If locked sliders sum to exactly 100%, all unlocked sliders are forced to 0%

### Re-balancing Algorithm

When the player adjusts slider X (or an event requires re-balancing):

```pseudocode
function rebalance_sliders(sliders, changed_slider, new_value):
    delta = new_value - sliders[changed_slider].value
    sliders[changed_slider].value = new_value
    
    # Identify adjustable (unlocked, not the changed one) sliders
    adjustable = [s for s in sliders if not s.locked and s != changed_slider]
    
    if len(adjustable) == 0:
        # Cannot rebalance — reject the change
        sliders[changed_slider].value = new_value - delta
        return ERROR_NO_UNLOCKED_SLIDERS
    
    # Distribute the delta proportionally among adjustable sliders
    total_adjustable = sum(s.value for s in adjustable)
    
    for s in adjustable:
        if total_adjustable > 0:
            s.value -= delta * (s.value / total_adjustable)
        else:
            s.value -= delta / len(adjustable)
        s.value = max(0, s.value)  # Clamp to 0
    
    # Final clamp pass: ensure sum == 100 (handle rounding)
    remainder = 100 - sum(s.value for s in sliders)
    adjustable[-1].value += remainder  # Give remainder to last adjustable
    
    return OK
```

### Locking Edge Cases

- **Locked slider at 0%:** Allowed. Prevents the auto-governor from stealing BC to that category.
- **All sliders locked:** Not allowed. The UI should prevent this.
- **Planet at max population/factories:** Auto-governor may suggest unlocking ECO/IND sliders to redirect BC to SHIP or TECH.

---

## 8. Reserve / Overflow Mechanics

When production allocated to a slider has no valid target, it overflows to the **Empire Reserve Fund**.

| Slider | Overflow Condition | Destination |
|--------|-------------------|-------------|
| SHIP | Ship queue empty | Empire Reserve |
| DEF | All defense goals met | Empire Reserve |
| IND | Planet at max factories | Empire Reserve |
| ECO | Planet at max pop + max terraform tier | Empire Reserve |
| TECH | (RP has no overflow; unused RP is wasted) | — |

**Empire Reserve** is a single empire-wide BC pool that can be:
- Manually injected into any planet's production queue
- Applied to urgent ship construction
- Held as strategic flexibility for future turns

The Reserve has no storage limit and does not decay.

### Reserve Slider (Global)

Some implementations add a 6th **RESERVE** slider as a deliberate savings mechanism. In MOO1, this was implicit (overflow auto-filled reserve). If a Reserve slider is added:

```
Reserve_BC = Net_Production × (RESERVE_Percent / 100)
Empire.reserve += Reserve_BC
```

This is treated identically to other overflow: it goes into the empire-wide pool.

---

## 9. Worked Examples

### Example 1: Basic Planet Turn

**Setup:**
- Race: Hamsters (production modifier 1.0, research modifier 1.0)
- Population: 40M, Factories: 80, Planet: Medium
- Robotic Controls II (2:1), no waste reduction, base eco restoration
- Sliders: SHIP 30%, DEF 0%, IND 20%, ECO 30%, TECH 20%

**Step 1 — Active Population:**
```
Active_Population = 40 × (1 - 20/100) = 40 × 0.8 = 32M
```

**Step 2 — Operating Factories:**
```
Max_Operable = 40 × 2 = 80  (uses full population, not just active — workers not in TECH still run factories)
Operating = min(80, 80) = 80
```

> *Note: Factory operation uses total population (factories need tenders), but population production bonus uses only Active_Population. This is the MOO1 faithful interpretation.*

**Step 3 — Gross Production:**
```
Factory_Production = 80 × 1.0 × 1.0 = 80 BC
Population_Production = 32 × 0.5 × 1.0 = 16 BC
Gross_Production = 96 BC
```

**Step 4 — Cleanup:**
```
Pollution = 80 × 1.0 = 80 units
Cleanup_Cost = 80 × 0.5 × 1.0 = 40 BC
Net_Production = 96 - 40 = 56 BC
```

**Step 5 — Slider Allocation:**
```
SHIP_BC = 56 × 0.30 = 16.8 → 16 BC (floor) toward ship queue
DEF_BC  = 56 × 0.00 = 0 BC
IND_BC  = 56 × 0.20 = 11.2 → 11 BC toward factories
ECO_BC  = 56 × 0.30 = 16.8 → 16 BC to ECO
```

**Step 6 — ECO Phase:**
```
Cleanup already paid (from Gross_Production above)
Remaining ECO_BC = 16 BC → all goes to growth bonus
Growth_Bonus = 16 × 0.1 = +1.6 additional pop growth this turn
```

**Step 7 — TECH:**
```
Scientists = 40 × 0.20 = 8M scientists
TECH_RP = 8 × 1.0 × 1.0 = 8 RP/turn (distributed across 6 research fields)
```

---

### Example 2: Full-Development Planet (Overflow to Reserve)

**Setup:**
- Race: Ants (1.5 production, large planet at max: 100M pop, 500 factories)
- Robotic Controls V (5:1), Reduced Industrial Waste 40%, Enhanced Eco Restoration
- Planet is at max population and max factories
- Sliders: SHIP 0%, DEF 0%, IND 30%, ECO 30%, TECH 40%

**Gross Production:**
```
Active_Population = 100 × (1 - 0.40) = 60M
Operating = min(500, 100×5) = 500
Factory_Production = 500 × 1.0 × 1.5 = 750 BC
Population_Production = 60 × 0.5 × 1.5 = 45 BC
Gross = 795 BC
```

**Cleanup:**
```
Pollution = 500 × 0.40 = 200 units
Cleanup_Cost = 200 × 0.5 × 0.40 = 40 BC
Net_Production = 755 BC
```

**Slider Allocation:**
```
SHIP_BC = 0 BC (queue empty → Reserve)
DEF_BC  = 0 BC
IND_BC  = 755 × 0.30 = 226 BC → max factories already reached → Reserve
ECO_BC  = 755 × 0.30 = 226 BC → cleanup done; max pop → no growth; max terraform → Reserve
```

**Reserve this turn:** 0 + 226 + 226 = **452 BC to Empire Reserve**

**TECH:** 40M scientists × 1.5 (racial) = 60 RP/turn

---

### Example 3: ECO Cleanup Shortfall

**Setup:**
- Medium planet, 60M pop, 200 factories
- Robotic Controls III (3:1), no waste reduction, base eco restoration
- Sliders: ECO 5% (player put almost nothing into ECO)
- Net_Production before cleanup = 200 BC (hypothetical gross)

**Cleanup Needed:**
```
Pollution = 200 × 1.0 = 200 units
Cleanup_Cost = 200 × 0.5 × 1.0 = 100 BC
ECO_BC = 200 × 0.05 = 10 BC
```

**Shortfall:**
```
Uncovered Cleanup = 100 - 10 = 90 BC unpaid
Uncleaned Pollution = 90 / (0.5 × 1.0) = 180 units remaining
```

This uncleaned pollution reduces effective planet capacity, increasing population cramping and slowing growth. Sustained pollution buildup can cause population decline over multiple turns.

---

## 10. JSON Schema

```json
{
  "colony_sliders": {
    "ship": {
      "value": 0,
      "locked": false,
      "min": 0,
      "max": 100
    },
    "def": {
      "value": 0,
      "locked": false,
      "min": 0,
      "max": 100
    },
    "ind": {
      "value": 0,
      "locked": false,
      "min": 0,
      "max": 100
    },
    "eco": {
      "value": 0,
      "locked": false,
      "min": 0,
      "max": 100
    },
    "tech": {
      "value": 0,
      "locked": false,
      "min": 0,
      "max": 100
    }
  },

  "slider_constraint": {
    "sum_must_equal": 100,
    "minimum_unlocked_count": 1
  },

  "eco_priority_order": [
    { "phase": 1, "name": "pollution_cleanup",    "mandatory": true  },
    { "phase": 2, "name": "population_growth",    "mandatory": false },
    { "phase": 3, "name": "terraforming",         "mandatory": false }
  ],

  "overflow_destinations": {
    "ship":  "empire_reserve",
    "def":   "empire_reserve",
    "ind":   "empire_reserve",
    "eco":   "empire_reserve",
    "tech":  "wasted"
  },

  "production_constants": {
    "base_factory_output_per_turn":     1.0,
    "base_population_output_per_turn":  0.5,
    "eco_growth_bc_efficiency":         0.1,
    "base_cleanup_cost_per_pollution":  0.5
  }
}
```

---

## 11. Governor AI Notes

The AI governor (for AI-controlled planets or when auto-management is on) uses these priorities:

1. **Always fund cleanup first** — set ECO high enough to cover `Cleanup_Cost`
2. **Early game:** IND heavy (60–70%) until factories reach ~80% of max
3. **Mid game:** Balance SHIP and TECH; ECO for growth on undersettled planets
4. **Late game:** SHIP dominant if at war; TECH dominant if behind in research
5. **DEF:** Raised when threats are detected in the system or adjacent systems
6. **TECH slider:** Set by empire-wide research strategy, not per-planet logic

Locking suggestion: Players often lock TECH at a flat value for consistency; AI never locks sliders.

---

## Related Documents

- `factory-formulas.md` — Gross production and cleanup cost formulas
- `population-growth.md` — Population growth and max population cap
- `ship-costs.md` — SHIP slider costs and queue mechanics
- `../technology/research-formulas.md` — TECH slider RP generation
- `../technology/planetology.md` — ECO terraforming tech tiers and costs
- `../technology/construction.md` — Factory cost reductions and waste reduction tech

---

*Created: 2026-04-12*
*Specification: spec-006 — Slider Mathematics*
*Resolves: REVIEW_MECHANICS.md H4*
