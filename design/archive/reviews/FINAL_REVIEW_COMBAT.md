# FINAL_REVIEW_COMBAT.md

**Reviewer:** Wesley Crusher (subagent)
**Date:** 2026-04-13
**Reference:** MOO1 StrategyWiki (fetched live: Interstellar_combat, Attack_roll, Attack_range, Damage, Shields, Weapons, Tactical_initiative_and_movement, Warship_design, Miscellaneous_factors)
**Design files reviewed:**
- `design/ships/combat-algorithm.md`
- `design/ships/combat-mechanics.md`
- `design/ships/ship-classes.md`
- `design/ships/ship-design.md`

**Prior review:** `design/ships/REVIEW_COMBAT.md` (2026-04-12, 32 issues, 22 fixed as of that date)

---

## Purpose

This is a **final fidelity pass** comparing Hamster of Orion's combat and ship design documents against confirmed MOO1 mechanics sourced from live StrategyWiki pages. It is not a re-review of internal consistency (that was done in REVIEW_COMBAT.md). Focus here is: **does our design match MOO1?**

---

## Section 1 — Combat Grid and Movement

### MOO1 Reference
- Combat board: ~10 rows × ~14 columns of **squares** (not hexes)
- Ships of the same design stack in one square; different designs each occupy separate squares
- Movement: 1–8 **squares** per turn (diagonal = same cost as orthogonal)
- Sub-Space Teleporter: moves ship to **any square on the battle grid** instantly (unrestricted range)
- Space debris spawns randomly in the middle; missiles travelling through debris have **50% chance** of detonating on it
- Retreat: ship must do nothing for **one full turn**, then leaves

### Our Design
- Combat board: **hex grid**, 20×20 to 40×40 hexes (`combat-mechanics.md`)
- Movement: 1–8 hexes per turn ✓
- Sub-Space Teleporter: `combat-algorithm.md` Section 26 says "any hex" (no range limit) ✓ — but `tactical-combat-ui.md` says "within 5 spaces" ✗ (flagged in REVIEW_COMBAT issue 4.5)
- No mention of space debris / debris missile intercept mechanic
- Retreat: ship must spend one full turn, then exits ✓ (Section 28 approximates this)

### Discrepancies

**D1 — Grid shape: squares vs hexes (intentional enhancement)**
MOO1 uses a square grid with diagonal movement. Our design uses hexes (explicitly noted as enhancement in `combat-mechanics.md`). This is a **deliberate design decision**, not an error, but it means diagonal vs. hex movement costs differ. No action needed unless you want strict MOO1 compliance.

**D2 — Space debris missile intercept mechanic — MISSING**
MOO1: missiles travelling through space debris squares have 50% chance to detonate prematurely. Our design has no space debris mechanic at all — not in combat-algorithm.md, combat-mechanics.md, or any other document. This is a real MOO1 mechanic that affects missile strategy. Low-priority for minimum viable product, but should be noted as a known omission.

**D3 — Retreat: one-turn delay**
MOO1 explicitly requires a ship to do nothing for one full turn before retreating. `combat-algorithm.md` Section 28 `attempt_retreat()` doesn't model this waiting phase — it resolves retreat in a single roll without requiring the ship to spend a turn doing nothing first. The retreat function should add a "retreat_declared" status that prevents action for one full turn before the ship exits.

---

## Section 2 — Initiative and Movement Order

### MOO1 Reference
- Initiative is based on **maneuverability** (engine maneuver + Inertial Stabilizer +2 or Inertial Nullifier +4)
- Battle Scanner adds **+3 to initiative**
- Ships with very high maneuverability can **act twice** before slow ships act once (if maneuver gap is large enough)
- A teleporting or decloaking ship **always fires first** regardless of initiative
- Combat movement: 1 square per **2 maneuverability** (round down); Inertial Stabilizer adds 1 extra square, Inertial Nullifier adds 2 extra squares
- Attacker wins all initiative ties

### Our Design
- Initiative = `Base(10) + Engine_Maneuver × 2 + Battle_Scanner (+3) + racial + experience + d6` (`combat-algorithm.md` Section 4)
- Sub-Space Teleporter / decloaking ship fires first: not explicitly stated in our algorithm
- Movement: `combat_speed` hexes/turn taken directly from engine table

### Discrepancies

**D4 — Initiative formula structure: additive with randomness vs. maneuver-primary**
MOO1 initiative is purely maneuver-driven (a deterministic order). Our design adds experience, racial, and a d6 random component, making it semi-random. This is a design choice but diverges from MOO1. The current formula makes high-maneuver ships less reliably first-to-move. **Flag as intentional deviation or reconsider.**

**D5 — "Move twice" mechanic for high-maneuver ships — MISSING**
MOO1: ships with very high maneuverability relative to low-maneuver ships can take two full actions before slower ships act once. Our initiative model is a sorted list where each ship acts once per round. This mechanic is absent. It meaningfully affects high-speed ship design choices. **Missing MOO1 mechanic.**

**D6 — Teleporting/decloaking ships always fire first — NOT SPECIFIED**
Our algorithm does not mention that ships using Sub-Space Teleporter or decloaking act before all others regardless of initiative roll. Should be added as a special case to `calculate_initiative_order()`.

**D7 — Movement: maneuver÷2 vs. direct combat_speed**
MOO1: combat squares moved = floor(maneuver / 2). Inertial Stabilizer adds 1 movement square, Inertial Nullifier adds 2. In our design, `combat_speed` is a discrete value in the engine table (1–8 hexes), and Inertial Stabilizer/Nullifier add +2/+4 to maneuver used for hit chance but their movement contribution is not separately specified. The relationship between engine maneuver rating, Inertial Stabilizer/Nullifier, and combat hexes/turn needs to be explicitly defined to match MOO1 semantics.

---

## Section 3 — Hit Chance / Attack Roll

### MOO1 Reference
- Base roll: random 1–100
- Comparison: attacker targeting computer level vs. defender maneuver level
- 50% hit when both are equal (same level)
- Each level of defender advantage: **-10%** hit chance
- Each level of attacker advantage: **+10%** hit chance
- Floor at **5%** (always some chance to miss)
- Ceiling at **95%** (≥5 attacker levels advantage)
- Mrrshan: targeting computer acts **4 levels higher**
- Alkari: maneuverability acts **3 levels higher** for dodge purposes
- Battle Scanner: **+1** effective targeting level
- Inertial Stabilizer: **+2** maneuver; Inertial Nullifier: **+4** maneuver (max total 13)
- Cloaking Device: **+5** to defender maneuver when active; ship must de-cloak to attack
- Displacement Device: 1/3 of hits that would land become misses (separate 33% miss roll)
- ECM: applies to **missiles only**. For beams, formula is `attacker_targeting vs. defender_maneuver` only
- Wide beam weapons (e.g., Megabolt Cannon): **+3** effective targeting level for that weapon
- Technology Nullifier: reduces defender's targeting computer 2–6 levels per hit

### Our Design (combat-algorithm.md Section 9-10)
- Base 50% + `battle_computer_rating × 5%` + experience ± range penalty ± size modifier - `maneuver × 3%` - defense_bonus
- Cloaking: -20 to hit chance
- Min 5%, max 95% ✓

### Discrepancies

**D8 — Hit formula structure: percentage-per-level values differ** ✅ **FIXED**
MOO1 uses **10% per level** of advantage (targeting level vs. maneuver level). Our formula uses **5% per Battle Computer rating point** for attack and **3% per maneuver level** for defense. These are not equivalent:
- A Mark V computer vs. Maneuver 5 ship: MOO1 = 50% (equal → 50%). Our formula: `50 + 5×5 - 5×3 = 50 + 25 - 15 = 60%`. **Our formula gives 60%, MOO1 gives 50% for the same matchup.**
- The differential system (attacker_level vs defender_level → ±10% per difference) is the canonical MOO1 approach. Our design replaced it with independent multipliers that produce different outcomes.

**FIXED:** Refactored to `hit_chance = 50 + (attacker_computer_level - defender_maneuver_level) × 10`, clamped 5–95%. Racial bonuses now add to the respective level (Ferrets: +4 attacker, Budgies: +3 defender). Non-MOO1 enhancement modifiers (experience, point-blank, size, range) are preserved but documented as intentional additions. Updated `combat-algorithm.md` Sections 9-10 and `combat-mechanics.md`.

**D9 — Cloaking: our design -20, MOO1 +5 maneuver**
MOO1: Cloaking Device adds +5 to the defender's maneuver for hit purposes (so a maneuver 5 ship becomes effectively maneuver 10 when cloaked = -5 levels advantage for attacker = -50% hit in MOO1's system). Our design applies a flat -20 to hit_chance, which is not equivalent and doesn't scale with attacker capability. Under the MOO1 differential formula, cloaking should add +5 to defender's effective maneuver, not apply a fixed -20. The design's current +5 defense_bonus from cloaking AND -20 from the `cloaked` flag double-counts (flagged as issue 4.6 in prior review).

**D10 — Displacement Device: 33% miss reroll — correctly spec'd**
Our design (`combat-algorithm.md` Section 27): 33% chance to completely avoid hit. This matches MOO1 ✓. No issue.

**D11 — Wide-beam bonus not applied to Megabolt Cannon specifically**
MOO1: "Wide beam weapons add +3 to effective targeting computer level." The Megabolt Cannon is explicitly wide-beam in MOO1 (`combat-mechanics.md` mentions it as +3 attack). Our design has `chain_lightning` as the primary effect of Megabolt Cannon. The +3 targeting bonus for wide-beam should also be on the Megabolt Cannon. Check `weapons-complete.md` to confirm it's there — if not, add it.

**D12 — Size modifier: our design uses +5% per size class above Small**
MOO1's attack roll page doesn't mention a size modifier to hit chance. The StrategyWiki pages on attack roll, damage, and shields make no reference to target size affecting hit chance. This may be a design addition (larger ships present a bigger target). If it's intentional, it should be clearly marked as a deliberate enhancement. If it's meant to be MOO1-faithful, it should be removed from the base formula.

**D13 — Point-blank +10% bonus — no MOO1 basis**
MOO1's attack roll formula has no point-blank bonus. It only uses attacker level vs. defender level. The +10% at 1 hex is a design addition. Flag as intentional enhancement.

**D14 — Experience modifiers — no MOO1 basis**
MOO1 has no experience system or combat accuracy bonus from experience in the attack roll formula. Our design adds ±5/+10% accuracy for veteran/elite. Flag as intentional enhancement if kept.

---

## Section 4 — Damage Resolution

### MOO1 Reference
- Damage is **mapped across the success range of the roll**, not rolled separately.
  - If weapon is 50% to hit (roll 51–100), a roll of 51 = min damage, roll of 100 = max damage.
  - The damage range is mapped proportionally across the rolls that hit.
  - If accuracy requirement is 90 (roll 90–100), a roll of 90 = min damage, 100 = max damage.
- Shields subtract directly from damage: shield level subtracts that many points of damage per hit.
- Armor piercing (MOO1): **halves the defender's shield level** (round down). Named "Armor Piercing" in the wiki but mechanically it halves shields, not hull damage.
- Weapons with "Armor Piercing" per MOO1 Shields page: Neutron Pellet Gun, Mass Driver, Hard Beam, Gauss Autocannon, Particle Beam.
- Oracle Interface: makes all non-missile, non-torpedo, non-bomb weapons count as armor piercing.
- No "×1.5 hull damage" mechanic exists in MOO1.
- No "ignores half shields" mechanic exists in MOO1 — both Mass Driver and Neutron Pellet Gun simply **halve shield level**.

### Our Design
- Damage is rolled separately from the hit roll (`roll_damage(weapon.damage_min, weapon.damage_max)`)
- `armor_piercing`: ×1.5 to hull damage after shields
- `halves_shields`: halves effective shield class for this hit
- `ignores_half_shields`: splits damage, half bypasses shields

### Discrepancies

**D15 — Damage roll is separate from hit roll in our design; MOO1 maps damage across the hit range** ✅ **FIXED**
MOO1's damage mechanic is that the degree of success on the attack roll determines damage: rolling exactly at the hit threshold gives minimum damage; rolling 100 gives maximum damage. Our design rolls hit independently and then rolls damage separately. This is a significant mechanical divergence:
- In MOO1, a ship that barely hits (just over 50%) tends to do minimum damage. A ship with high hit chance and a high roll gets both a hit AND high damage.
- Our design treats hit and damage as fully independent, which produces a different probability distribution.

**FIXED:** `resolve_beam_attack()` now maps damage across the hit roll range: `damage_fraction = (roll - hit_threshold) / success_range`, then `base_damage = damage_min + floor(damage_fraction × (damage_max - damage_min))`. Same formula applied to torpedo impacts. Updated `combat-algorithm.md` Sections 8 and 20.

**D16 — "Armor Piercing" in MOO1 halves shields, not multiplies hull damage** ✅ **FIXED**
The MOO1 Shields page explicitly states: "There is a special type of weapon that halves the values of the defender's shields (round down), referred to as 'Armor Piercing'." The weapons listed: Neutron Pellet Gun, Mass Driver, Hard Beam, Gauss Autocannon, Particle Beam.

Our design has:
- `halves_shields` (Ion Cannon): halves shield class — **not a MOO1 mechanic on Ion Cannon** (Ion Cannon is just a beam weapon in MOO1 with no armor piercing)
- `ignores_half_shields` (Mass Driver): half bypass, half absorbed — **incorrect for MOO1** (Mass Driver halves shields, same as Neutron Pellet Gun)
- `armor_piercing` (Neutron Pellet Gun): ×1.5 hull damage — **incorrect for MOO1** (NPG halves shields)

The design has invented a new taxonomy (`halves_shields` vs `ignores_half_shields` vs `armor_piercing`) that doesn't match MOO1's simpler single mechanic: **halves shield level for that hit**. All five MOO1 armor-piercing weapons should use the same `halves_shields` effect.

**FIXED:** `armor_piercing` now correctly means "halves defender's shield class (round down) for this hit." Removed ×1.5 hull multiplier. Removed `halves_shields` and `ignores_half_shields` specials. All five AP weapons (Neutron Pellet Gun, Mass Driver, Hard Beam, Gauss Autocannon, Particle Beam) now use `special: "armor_piercing"`. Updated `combat-algorithm.md` Section 11 and `weapons-complete.md`.

**D17 — "Ion Cannon" listed as having `halves_shields` — incorrect vs MOO1** ✅ **FIXED**
MOO1 Weapons page: Ion Cannon is level 10, "Deals 3-8 damage to target" with no armor piercing or special effect. Our design gives it `halves_shields`. This needs correction.

**FIXED:** Removed `halves_shields` from Ion Cannon. `special` is now `null`. Updated `weapons-complete.md` table and JSON.

**D18 — Hellfire Torpedo MOO1 mechanic differs from our design** ✅ **FIXED**
MOO1 Weapons page: "Hellfire Torpedoes - Deals 4 attacks to the target per hit, each for 25 damage. Fires every other turn." → Total 100 damage per torpedo hit (4 × 25). Our design models it as `bonus_vs_shields` (+10 damage to shields_current). That's a significant divergence. The MOO1 mechanic is **4 separate 25-damage hits**, not a shield bonus.

**FIXED:** Hellfire Torpedo now has `special: "hellfire_multi_hit"`. The `apply_weapon_effects()` function fires 4 separate 25-damage `apply_damage()` calls, each resolved independently through shields. JSON updated with `attacks: 4`, `damage_min/max: 25`. Table updated to show 25×4. Updated `combat-algorithm.md` Section 11b and `weapons-complete.md`.

**D19 — No Oracle Interface component defined**
MOO1: Oracle Interface is a high-level Computers tech that makes all non-missile/torpedo/bomb weapons count as armor piercing. Our design doesn't mention this component. It should be in `components-complete.md`.

---

## Section 5 — Shields

### MOO1 Reference
- Shields: Class I through XV (levels 1, 2, 3, 4, 5, 6, 7, 9, 11, 13, 15)
- Subtract damage directly: `damage_dealt = weapon_damage - shield_class`
- If shield_class ≥ weapon_max_damage, weapon is completely nullified
- Shield level is NOT modifiable except by armor-piercing weapons
- Shields do NOT regenerate during combat in MOO1 (the wiki does not mention in-combat regen)
- The Automated Repair / Advanced Damage Control are the only in-combat recovery mechanics (HP, not shields)

### Our Design
- Class I–XV shields ✓
- Subtract shield_class from damage per hit ✓
- `shields_current` / `shields_max` tracked (implying shields can be depleted and regenerated)
- `combat-mechanics.md`: "Don't regenerate during battle (unless special tech)"
- `combat-algorithm.md` Section 12 shield table ✓

### Discrepancies

**D20 — shields_current/shields_max implies shield HP depletion; MOO1 doesn't have this**
MOO1 shields always absorb their full class value per hit — they don't have a pool of "shield HP" that depletes. In MOO1, a Class V shield always absorbs 5 damage per hit, whether it's the first hit or the hundredth. Our design tracks `shields_current` separately from `shield_class`, implying shields can be "worn down" to 0 and stop absorbing. This is not a MOO1 mechanic. The `double_shield_damage` special (which depletes `shields_current`) reinforces this non-MOO1 subsystem. **Design decision to clarify:** is in-combat shield depletion intentional? If so, it's a deliberate enhancement. If not, the `shields_current` tracking and `double_shield_damage` should be removed.

---

## Section 6 — Hull Sizes and Ship Space

### MOO1 Reference (from Warship_design page — Races section)
- MOO1 has ship hull sizes referenced in the game context as small/medium/large/huge
- The Warship_design page discusses ship space availability, with Construction tech research improving available space
- "Assault class ships with their massive hit point totals" — MOO1 uses specific ship class names but the StrategyWiki focuses on role/strategy rather than exact HP tables

### Our Design (ship-classes.md)
| Hull | Space | Cost | Base HP |
|------|-------|------|---------|
| Small | 25 | 6 BC | 3 |
| Medium | 70 | 36 BC | 18 |
| Large | 280 | 200 BC | 100 |
| Huge | 1400 | 1200 BC | 600 |

### Assessment
The hull sizes (Small/Medium/Large/Huge), space values, costs, and base HP figures are internally consistent across the design docs (after fixing issue 3.2 from REVIEW_COMBAT). These are plausible MOO1-faithful values. The StrategyWiki reference doesn't provide exact space/cost/HP tables for validation; these values likely come from the game manual or other sources.

**D21 — ship-classes.md size modifier table uses points, not percentages — still unresolved**
The size modifier table in `ship-classes.md` shows `Small: -2, Medium: 0, Large: +2, Huge: +4` as raw point values, but `combat-algorithm.md` uses `(size_class - 1) × 5%`. This inconsistency was flagged as issue 3.1 in REVIEW_COMBAT and is **still unresolved**. The two representations give different outcomes. One table must be removed or aligned.

---

## Section 7 — Special Systems

### MOO1 Reference vs. Our Design

| MOO1 Mechanic | MOO1 Description | Our Design | Status |
|---|---|---|---|
| Automated Repair | 15% max HP per turn | 15% ✓ (`combat-algorithm.md` §24) | ✓ Match |
| Advanced Damage Control | 30% max HP per turn | 30% ✓ | ✓ Match |
| Repulsor Beam | Pushes ships away, minimum distance 2 at all times | "Push 1 hex away" in spec, "2 hexes" in UI | ✗ Conflict (issue 4.3) |
| Anti-Missile Rockets | 40% chance to destroy each missile, minus 1% per missile tech level | "10% per beam × attacks" in our design | ✗ Different formula |
| Zyro Shield | 75% minus 1% per missile tech level | Not modeled | ✗ Missing |
| Lightning Shield | 100% minus 1% per missile tech level | Not modeled | ✗ Missing |
| Stasis Field | Takes target out of play for 1 full turn | "Cannot act 2 turns" in our design | ✗ MOO1 = 1 turn |
| Black Hole Generator | Destroys `100% - 2% per shield class` of all ships of that type | Flagged in REVIEW_COMBAT issue 4.2 (no implementation) | ✗ Missing |
| Energy Pulsar | 5 + 1 per 2 equipped ships, hits all ships in stack | Not in our design | ✗ Missing |
| Ionic Pulsar | 10 + 1 per equipped ship, hits all ships in stack | Not in our design | ✗ Missing |
| Ion Stream Projector | 20% of target current HP + 1% per firing ship (max 50%) | "disable_engines" effect in our design | ✗ Wrong mechanic |
| Neutron Stream Projector | 40% of target current HP + 1% per firing ship (max 75%) | "kills_crew" stream in our design | ✗ Wrong mechanic |
| Sub-Space Teleporter | Always moves first; teleports to any square | ✓ (algorithm §26) but UI says "5 hex limit" | Partial (UI conflict) |
| Sub-Space Interdictor | Blocks teleporter when defending planet | Not in our design | ✗ Missing |
| Technology Nullifier | Reduces target computer level 2–6 per hit | Not in our design | ✗ Missing |
| Oracle Interface | Makes all non-missile/torpedo/bomb weapons armor piercing | Not in our design | ✗ Missing |
| High Energy Focus | +3 range to all non-missile/torpedo/bomb weapons | Not in our design | ✗ Missing |

**D22 — Stasis Field duration: 1 turn (MOO1) vs. 2 turns (our design)**
MOO1 Miscellaneous_factors: "takes a target out of play for a **full turn**." Our design (Section 25): `duration: 2`. This needs to be corrected to 1 turn, or the enhancement must be explicitly documented.

**D23 — Ion Stream Projector mechanic is wrong**
MOO1: Ion Stream Projector deals `20% of target's current HP + 1% per firing ship` damage (max 50%). Our design uses it to `disable_engines`. These are completely different mechanics. The Ion Stream Projector in MOO1 is a damage weapon based on target HP percentage, not an engine disabler.

**D24 — Neutron Stream Projector mechanic is partially wrong**
MOO1: "40% of target current HP + 1% per firing ship" damage (max 75%). Our design has it as a "stream" weapon that "kills crew." The HP%-based damage mechanic is missing entirely.

**D25 — Energy Pulsar and Ionic Pulsar — MISSING**
Both are real MOO1 weapons (from Propulsion tech tree) that deal AoE damage to all ships in a stack. Neither appears in our design documents at all.

**D26 — Anti-Missile Point Defense formula differs from MOO1**
MOO1: Anti-Missile Rockets have "40% chance to destroy each missile minus 1% per tech level of the missile." Our design (Section 18): intercept_chance builds from "10% × weapon.attacks_per_turn" for each beam weapon. These are fundamentally different formulas. MOO1's is missile-type-dependent; ours is based on attacker beam count.

**D27 — Zyro Shield and Lightning Shield — MISSING**
Both are MOO1 missile defense special equipment with 75% and 100% base intercept rates. Not present in our design at all.

**D28 — Black Hole Generator — still not implemented**
REVIEW_COMBAT issue 4.2 flagged this. MOO1: destroys `100% - 2% × target_shield_class` percent of all enemy ships of that type when fired. No implementation in any design doc.

**D29 — High Energy Focus — MISSING**
One of the most impactful MOO1 specials: +3 range to all beam/non-missile weapons. Not present in our design.

**D30 — Sub-Space Interdictor — MISSING**
MOO1: automatically equipped by planets when researched; blocks Sub-Space Teleporter in that planet's combats. Not in our design.

**D31 — Technology Nullifier — MISSING**
MOO1: reduces target's targeting computer level by 2–6 per hit. Not in our design.

---

## Section 8 — Missiles and Torpedoes

### MOO1 Reference
- Missiles: limited ammo (2-shot or 5-shot racks)
- Travel a fixed number of squares per turn
- Self-destruct after **2 turns** without hitting target (for ship-launched missiles)
- Planetary missile base missiles have much greater fuel (possibly 4 turns or unlimited)
- Torpedoes: unlimited shots, fire every **other turn**; same rules as missiles otherwise
- Missiles vs. torpedoes: missiles generally better because combat usually shorter than torpedo reload cycle

### Our Design
- Missiles: 2-shot or 5-shot ammo ✓ (from components-complete.md)
- `remaining_fuel: 20` turns before missile expires — **way too long vs MOO1's 2 turns**
- Torpedoes fire every 2 turns (cooldown = 2) ✓
- Torpedoes: "always hit - no intercept, no ECM" — **partially wrong** per MOO1 (torpedoes follow missile rules including ECM)

**D32 — Missile fuel: 20 turns vs. MOO1's 2 turns** ✅ **FIXED**
MOO1: ship-launched missiles self-destruct after 2 turns without hitting. Our design sets `remaining_fuel: 20`. This makes missiles effectively infinite-range in combat, which changes tactics significantly. **Should be 2 turns.**

**FIXED:** `remaining_fuel` changed from 20 to 2 in `launch_missile()`. Same 2-turn fuel applied to torpedoes (which follow missile rules). Updated `combat-algorithm.md` Sections 16 and 20.

**D33 — Torpedo immunity to intercept and ECM — incorrect per MOO1** ✅ **FIXED**
Our design (Section 20): "Cannot be intercepted by point defense. Cannot be affected by ECM." MOO1 Attack_roll page: "Torpedo weapons follow the rules for Missiles." This means torpedoes in MOO1 ARE subject to ECM and should follow the same targeting formula. Our design incorrectly gives torpedoes auto-hit status.

**FIXED:** `fire_torpedo()` and `resolve_torpedo_impact()` now follow missile rules: point defense intercept attempted, hit chance = `80 - (ecm_rating × 5) - (maneuver_rating × 2)` clamped 10–95%, and damage mapped across hit roll range. Removed auto-hit language. Updated `combat-algorithm.md` Section 20 and `weapons-complete.md` torpedo notes.

---

## Section 9 — Streaming Weapons (Graviton Beam, Tachyon Beam)

### MOO1 Reference (Weapons + Miscellaneous_factors)
- **Graviton Beam**: 1–15 damage; damage beyond what's needed to kill a ship **carries over to the next ship** in the stack
- **Tachyon Beam**: 1–25 damage; same carry-over mechanic
- Neither is described as a "locking stream" that holds ships and deals ongoing damage
- Both are described as useful for killing swarms of small ships via damage bleed-through
- MOO1 Warship_design: "The shields of the defender are applied for each ship" (for streaming weapons)

### Our Design
- `stream` effect: "beam locks onto target — damage repeats each End Phase until target breaks free"
- This is used for Graviton Beam in our components

**D34 — "Stream" mechanic doesn't match MOO1 Graviton/Tachyon Beam behavior** ✅ **FIXED**
MOO1's Graviton and Tachyon beams do damage overflow to adjacent ships in a stack — they are NOT continuous-damage lock-on weapons. Our design implements `stream` as a persistent hold/damage-over-time effect with a break-free mechanic, which is a fundamentally different concept. The carry-over damage mechanic (excess damage hits the next ship) is the correct MOO1 behavior and is **completely absent** from our design.

**FIXED:** `special: "stream"` removed from Graviton Beam and Tachyon Beam. Replaced with `special: "overflow_damage"`. `apply_weapon_effects()` now implements the overflow mechanic: when a ship is killed, overkill damage is applied to the next ship of the same design in the stack. Updated `combat-algorithm.md` Section 11b and `weapons-complete.md`.

---

## Section 10 — Racial Bonuses (Combat-Relevant)

### MOO1 Reference
- **Mrrshan** (our "Ferrets"): targeting computer acts 4 levels higher
- **Alkari** (our "Budgies"): maneuverability acts 3 levels higher for dodging
- Both are level-based modifiers in the differential hit formula

### Our Design
- Ferrets: "+4 Attack Level (hit chance only)" ✓ — fixed in REVIEW_COMBAT 1.1
- Budgies: "+3 Defense Level (+30%)" ✓ — fixed in REVIEW_COMBAT 1.3
- Under the correct MOO1 differential formula (D8), "+4 attack level" means the computer counts 4 higher → +40% hit at equal footing (since each level = 10%). This is correctly captured if we implement D8's formula fix.

### Assessment
The racial combat bonuses are directionally correct after REVIEW_COMBAT fixes. They need to be re-expressed as level modifiers under the corrected differential formula (D8).

---

## Summary of New Findings

### Critical Issues (Architectural)

| ID | Issue | MOO1 Source | Status |
|----|-------|-------------|--------|
| D8 | Hit formula structure — our formula produces wrong percentages vs MOO1's differential system | Attack_roll | ✅ FIXED |
| D15 | Damage roll is separate from hit roll — MOO1 maps damage across the hit range | Damage | ✅ FIXED |
| D16 | "Armor Piercing" in our design is wrong mechanic — MOO1 AP halves shields, not multiplies hull | Shields | ✅ FIXED |
| D17 | Ion Cannon has `halves_shields` — not a MOO1 mechanic | Weapons | ✅ FIXED |
| D18 | Hellfire Torpedo: our design gives +10 shield bonus; MOO1 = 4 separate 25-damage hits | Weapons | ✅ FIXED |
| D33 | Torpedoes auto-hit in our design; MOO1 follows same formula as missiles (ECM applies) | Attack_roll | ✅ FIXED |
| D34 | Graviton/Tachyon "streaming" mechanic — our design has hold/DoT; MOO1 has damage overflow to next ship | Weapons, Misc | ✅ FIXED |

### High-Priority Issues (Wrong Mechanic)

| ID | Issue | MOO1 Source |
|----|-------|-------------|
| D3 | Retreat requires one full turn doing nothing; our algorithm resolves it instantly | Interstellar_combat |
| D5 | High-maneuver ships can act twice in one round; not in our design | Tactical_initiative |
| D6 | Teleporting/decloaking ships always act first; not specified | Tactical_initiative |
| D22 | Stasis Field: 1 turn (MOO1) vs. 2 turns (our design) | Miscellaneous_factors |
| D23 | Ion Stream Projector: HP%-based damage (MOO1) vs. engine disable (our design) | Weapons, Misc |
| D24 | Neutron Stream Projector: HP%-based damage (MOO1) partially captured | Weapons, Misc |
| D26 | Point defense formula differs (missile tech level matters in MOO1) | Miscellaneous_factors |
| D32 | Missile fuel: 20 turns vs. MOO1's 2 turns | Attack_range | ✅ FIXED |

### Missing MOO1 Mechanics

| ID | Missing Item | MOO1 Source |
|----|-------------|-------------|
| D2 | Space debris + 50% missile intercept chance | Interstellar_combat |
| D19 | Oracle Interface component | Shields |
| D25 | Energy Pulsar and Ionic Pulsar | Miscellaneous_factors |
| D27 | Zyro Shield and Lightning Shield | Miscellaneous_factors |
| D28 | Black Hole Generator implementation | Miscellaneous_factors |
| D29 | High Energy Focus (+3 range) | Attack_range |
| D30 | Sub-Space Interdictor | Miscellaneous_factors |
| D31 | Technology Nullifier | Attack_roll |

### Minor / Confirmed Enhancements

| ID | Item | Status |
|----|------|--------|
| D1 | Hex grid vs square grid | Intentional enhancement (documented) |
| D4 | Random d6 + experience in initiative | Design choice; diverges from MOO1 |
| D9 | Cloaking: flat -20 vs. +5 maneuver | Wrong value; should be +5 to maneuver |
| D12 | Size modifier to hit chance | No MOO1 basis — flag as enhancement |
| D13 | Point-blank +10% bonus | No MOO1 basis — flag as enhancement |
| D14 | Experience accuracy modifiers | No MOO1 basis — flag as enhancement |
| D20 | shields_current depletion pool | No MOO1 basis — flag as enhancement |
| D21 | ship-classes.md size modifier table vs formula | Still unresolved (from REVIEW_COMBAT 3.1) |
| D7 | Movement: maneuver÷2 vs. combat_speed lookup | Implementation detail; should document relationship |

---

## Recommended Fix Priority

### Fix First (Blocking — Wrong Mechanics)
1. **D16** ✅ FIXED — `armor_piercing` now halves shield class; all five AP weapons use same mechanic
2. **D17** ✅ FIXED — Removed `halves_shields` from Ion Cannon (plain beam weapon)
3. **D18** ✅ FIXED — Hellfire Torpedo: 4 separate 25-damage attacks via `hellfire_multi_hit`
4. **D23** — Ion Stream Projector: HP%-based damage (20% current HP + 1%/firing ship), not engine disable (deferred)
5. **D33** ✅ FIXED — Torpedoes: follow missile ECM rules; not auto-hit
6. **D32** ✅ FIXED — Missile fuel: changed from 20 turns to 2 turns
7. **D34** ✅ FIXED — Graviton/Tachyon: damage-overflow-to-next-ship via `overflow_damage`

### Fix Next (High Value MOO1 Mechanics)
8. **D8** ✅ FIXED — Hit formula refactored to differential system: `50 + (attacker_level - defender_level) × 10`
9. **D15** ✅ FIXED — Damage mapped across hit roll range (same formula in beam attacks and torpedo impacts)
10. **D3** — Retreat: requires one full turn before exiting
11. **D5** — High-maneuver ships can act twice per round
12. **D6** — Teleporter/decloaking ships always act first
13. **D22** — Stasis Field: 1 turn, not 2
14. **D9** — Cloaking: +5 to defender maneuver (not flat -20 to hit_chance)
15. **D26** — Point defense: missile tech level matters in success formula

### Add (Missing MOO1 Content)
16. **D25** — Energy Pulsar and Ionic Pulsar (stack-AoE weapons from Propulsion tree)
17. **D29** — High Energy Focus special (+3 range to all beams)
18. **D27** — Zyro Shield and Lightning Shield (missile defense specials)
19. **D28** — Black Hole Generator implementation
20. **D19** — Oracle Interface component (makes all beams armor-piercing)
21. **D30** — Sub-Space Interdictor (planet auto-blocks teleporter)
22. **D31** — Technology Nullifier (reduces target computer level)
23. **D2** — Space debris missile intercept mechanic

---

*End of final combat review. 34 new findings (D1–D34), with severity ratings. Prior 32 issues (REVIEW_COMBAT.md) remain valid; this document supersedes for MOO1 fidelity comparison.*
