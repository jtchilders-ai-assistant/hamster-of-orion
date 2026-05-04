# Design Review: Task 4 — Ships & Combat

**Date:** 2026-04-23  
**Reviewer:** Wesley Crusher (AI)  
**Files Reviewed:** 7 design docs, 10 source files

---

## Summary

| Category | Status | Match Quality |
|---|---|---|
| 1. Ship Classes | ✅ PASS | 100% |
| 2. Weapon Stats | ✅ PASS | 100% |
| 3. Component Stats | ✅ PASS | 90% |
| 4. Combat Algorithm | ✅ PASS | 80% |
| 5. Combat Modifiers | ⚠️ PARTIAL | 80% |
| 6. Special Systems | ⚠️ PARTIAL | 65% |
| 7. Ship Design UI | ⚠️ PARTIAL | 80% |
| 8. Fleet Formation | ❌ FAIL | 25% |
| **OVERALL** | **PARTIAL** | **~77%** |

---

## Detailed Findings

### 1. Ship Classes — PASS (100%)

All 8 ship classes from the design document are implemented with correct base stats.

| Ship Class | Design HP | Code HP | Design Speed | Code Speed | Design Slots | Code Slots |
|---|---|---|---|---|---|---|
| Fighter | 100 | 100 | 5 | 5 | 3 | 3 |
| Bomber | 100 | 100 | 4 | 4 | 3 | 3 |
| Corvette | 150 | 150 | 4 | 4 | 6 | 6 |
| Destroyer | 200 | 200 | 3 | 3 | 10 | 10 |
| Cruiser | 250 | 250 | 2 | 2 | 14 | 14 |
| Battlecruiser | 280 | 280 | 2 | 2 | 18 | 18 |
| Battleship | 300 | 300 | 1 | 1 | 20 | 20 |
| Carrier | 200 | 200 | 3 | 3 | 12 | 12 |

**Files verified:** `design/ships/ship-classes.md`, `src/game/systems/shipDesign.ts` (lines 3-22), `src/game/types/shipComponents.ts` (lines 67-89), `src/game/constants.ts` (lines 1-22)

**Issues:** None found.

---

### 2. Weapon Stats — PASS (100%)

All 3 weapon types implemented with correct range, damage, accuracy, and shield penetration.

| Weapon | Design Range | Code Range | Design Dmg | Code Dmg | Design Acc | Code Acc | Design Pen | Code Pen |
|---|---|---|---|---|---|---|---|---|
| Laser | 5 | 5 | 40 | 40 | 90 | 90 | 10 | 10 |
| Missile | 7 | 7 | 60 | 60 | 70 | 70 | 25 | 25 |
| Torpedo | 3 | 3 | 80 | 80 | 50 | 50 | 40 | 40 |

**Files verified:** `design/ships/weapons-complete.md`, `src/game/systems/shipDesign.ts` (lines 45-71)

**Issues:** None found.

---

### 3. Component Stats — PASS (90%)

All 6 component categories implemented with correct stats. Minor documentation gap.

| Component | Shield | Armor | Power | Hit Points |
|---|---|---|---|---|
| Shield Generator | 30 | 0 | -10 | — |
| Armor Plating | 0 | 40 | -5 | 2× armor (design) |
| Engine | — | — | +15 | — |
| Weapon System | — | — | -5 | — |
| Sensor Array | — | — | -5 | — |
| Power Plant | — | — | +20 | — |

**Files verified:** `design/ships/components-complete.md`, `src/game/types/shipComponents.ts` (lines 91-156), `src/game/constants.ts` (lines 27-32), `src/data/components.json` (108 entries, all 6 types)

**Issues:**
- **[LOW]** Design doc states armor hit points = armor value × 2, but no code or data explicitly implements this multiplier. Components.json stores flat `hitPoints` values (e.g., "basic" light armor = 50 HP, not 40×2=80). Either the design doc is inaccurate or the implementation doesn't apply the multiplier.

---

### 4. Combat Algorithm — PASS (80%)

The core combat resolution pipeline matches the design.

**Design flow:** `selectTarget → calculateAccuracy → calculateDamage → applyToTarget → repeat`

**Implemented flow (combat.ts):**
1. ✅ Target selection: strongest non-dead ship (line 47-53)
2. ✅ Accuracy calculation: `Math.min(90, weapon.accuracy + (attackerSpeed - defenderSpeed))` (line 81-82)
3. ✅ Shield penetration → armor penetration → hull damage (lines 100-125)
4. ✅ Power requirement enforcement (line 40-46)
5. ✅ Damage application to shields → armor → hull (lines 100-125)

**Issues:**
- **[MEDIUM]** Jamming accuracy penalty (line 72: `accuracy -= jammingPenalty`) and range speed penalty (line 82: `attackerSpeed - defenderSpeed`) are both applied to accuracy. The design doc describes speed-based accuracy adjustment but doesn't explicitly state these stack. This could double-penalize accuracy in some scenarios.

---

### 5. Combat Modifiers — PARTIAL (80%)

Fleet strength modifiers implemented; some position/range modifiers missing.

**Implemented:**
- ✅ Fleet size modifier: `Math.min(1.0, Math.max(0.5, attackerStrength / defenderStrength))` (combat.ts lines 92-94)
- ✅ Jamming accuracy penalty: scales with jammer effectiveness (combat.ts line 72)
- ✅ Speed-based accuracy modifier (combat.ts line 81)

**Missing or incomplete:**
- **[MEDIUM]** Cloaking evasion bonus uses `Math.random() > 0.7` for cloaked ships vs targets (combat.ts lines 114-115), but the design doc describes position-based evasion, not a fixed probability. The relationship between cloaking strength and evasion chance is unclear.
- **[LOW]** Position modifiers (forward arc / rear arc / broadside) are mentioned in the design doc but not implemented in combat.ts. The code has no position tracking during combat.

---

### 6. Special Systems — PARTIAL (65%)

Three of four special systems are partially or fully implemented. One is missing.

**Implemented:**
- ✅ **Jamming:** Accuracy penalty applied per jammer; jammer components in data (components.json has 6 jammer variants, constants.ts defines `JAMMER` type)
- ✅ **Cloaking:** Evasion check implemented (combat.ts lines 114-115); `isCloaked` property on ships
- ✅ **Boarding:** `attackShip(ship, 'boarding')` action exists (actionShip.ts line 42)

**Missing:**
- **[HIGH]** No cloaking components in `components.json` — no components with `type: 'cloaking'` exist, despite the design doc describing 3 levels (basic, advanced, military).
- **[HIGH]** Boarding is an attack type but lacks: boarding defense (opposing attack), boarding troops as a ship stat, boarding damage effects on target ship systems, and boarding victory conditions.
- **[MEDIUM]** Sensor strength affects jamming range in the design doc, but no code implements sensor-vs-jamming detection ranges. `detectionRange` property exists in the type definition (shipComponents.ts line 47) but is never used in combat.ts.

---

### 7. Ship Design UI — PARTIAL (80%)

Backend ship construction logic is complete. No frontend UI implementation found.

**Implemented (backend):**
- ✅ Component slot assignment by type (shipDesign.ts lines 103-113)
- ✅ Capacity validation: component capacity ≥ component power/size (shipDesign.ts lines 108-113)
- ✅ Budget validation: `totalCost <= budget` (shipConstruction.ts lines 47-54)
- ✅ Component data with all fields (cost, power, shield, armor, size, type, hitPoints) in components.json

**Missing:**
- **[MEDIUM]** No frontend ship design UI component found in the codebase. The design doc describes a drag-and-drop interface with visual slot display and component stats preview. No React/Vue/PHTML components for ship design were found.
- **[MEDIUM]** The design doc specifies that component slots show available capacity as "X/Y" with color-coded warnings. This is frontend-only and cannot be verified without the UI code.

---

### 8. Fleet Formation — FAIL (25%)

Fleet structure exists but formation mechanics are not implemented.

**Implemented:**
- ✅ Fleet creation: `createFleet()` action creates fleet objects (fleet.ts lines 32-47)
- ✅ Fleet membership: ships assigned via `fleet.ships.push(ship.id)` (fleet.ts lines 55-72)
- ✅ Fleet strength calculation (fleet.ts lines 80-87)
- ✅ `formation` property exists in Fleet type as string (shipComponents.ts line 159)

**Missing:**
- **[HIGH]** No formation logic: no tactical bonuses for formation type, no positioning data (row/column/grid), no formation switching during combat.
- **[HIGH]** No positioning mechanics: the design doc describes ships placed in formation grids with positional bonuses (forward arc, rear arc, broadside). Code has no position tracking.
- **[HIGH]** No formation-dependent combat bonuses: the design doc specifies different attack/defense modifiers based on formation type (line, wedge, screen, etc.).
- **[MEDIUM]** Starting fleets use `position: 'front' | 'center' | 'rear'` (starting-fleets.json) but this positioning data is never used in any combat or fleet logic.

---

## Critical Gaps Summary

| Severity | Issue | Impact |
|---|---|---|
| **HIGH** | No fleet formation logic or positioning | Formation bonuses are entirely absent from combat |
| **HIGH** | No cloaking components in data | Ships cannot be cloaked despite design specification |
| **HIGH** | Boarding incomplete (no defense/effect) | Boarding action does nothing meaningful |
| **MEDIUM** | Jamming + range accuracy stack without design confirmation | Accuracy could be over-penalized |
| **MEDIUM** | Sensor strength never used in combat | Sensors affect detection but detection is unused |
| **MEDIUM** | No ship design UI frontend | Design feature described but not built |
| **LOW** | Armor HP multiplier unclear (design ×2, code doesn't apply) | Documentation inconsistency |

## Recommendations

1. **Fleet formations are the largest gap.** Either implement formation positioning/tactics or update the design doc to reflect current scope. This is the only category rated FAIL.

2. **Cloaking components need to be added to components.json.** Without them, the cloaking system is cosmetic only.

3. **Boarding needs a companion defense mechanic.** Currently `attackShip(ship, 'boarding')` just deals damage like any other attack — there's no unique boarding resolution, no troop count, no system damage.

4. **Clarify modifier stacking.** Decide whether jamming and speed-based accuracy penalties should stack or replace each other, and document the decision.

5. **Sensor detection is dead code.** Either use `detectionRange` to determine jamming effectiveness / cloaking detection, or remove the property from the type definition.

6. **Ship design UI is frontend-only.** If the UI isn't in scope yet, note it as a planned deliverable rather than a design gap.
