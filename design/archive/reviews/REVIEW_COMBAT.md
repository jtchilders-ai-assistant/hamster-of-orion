# Combat & Ships Design Review

**Reviewer:** Wesley Crusher (automated review subagent)
**Date:** 2026-04-12
**Scope:** 10 design documents covering combat, weapons, components, ship classes, special systems, and tactical UI
**Files Reviewed:**
- `combat-algorithm.md`
- `combat-mechanics.md`
- `weapons-complete.md`
- `weapons-systems.md`
- `components-complete.md`
- `defense-systems.md`
- `ship-classes.md`
- `ship-design.md`
- `special-systems.md`
- `ui-ux/tactical-combat-ui.md`

---

## Summary

Found **32 issues** across 7 categories. Several are blocking (formulas that reference undefined values or directly contradict each other); others are cosmetic or need clarification. Issues are ordered within each category by severity.

---

## 1. Duplicate or Conflicting Definitions

### 1.1 - Ferrets' Racial Combat Bonus: Three Conflicting Values
**Severity: HIGH** - ✅ FIXED (2026-04-12)

**Canonical value: +4 Attack Level (hit chance only, no damage bonus).**
`race-stats-complete.md` is authoritative: `ship_combat: 30` and Deadly Accuracy = `attack_level_bonus: 4` with no damage multiplier. The spurious +15% damage and 1.25 ship_damage multiplier were inconsistencies introduced in the ship combat docs. Fixed:
- `weapons-complete.md` table: removed "+15% Damage", updated description to "hit chance only"
- `weapons-complete.md` note: removed reference to "+15% damage is from Deadly Accuracy"
- `weapons-complete.md` racial JSON: `ship_damage: 1.25` → `1.00`
- `combat-mechanics.md`: removed "+15% weapon damage" from Ferret bonus line

### 1.2 - Ferrets: Attack Level vs. Raw Hit Percentage
**Severity: HIGH**

The hit formula (`Hit_Chance = 50 + Battle_Computer × 5 - Target_Defense × 5 + ...`) applies Attack Level as `level × 5%`. So "+4 Attack Level" = +20% to hit. But the description also says "+15% weapon damage." Are these both always active? Do they stack? The note says "Both always apply" but is vague on the interaction with the Battle Computer formula.

### 1.3 - Budgies' Defense: "+5 Defense Level" vs. "+3 Defense"
**Severity: MEDIUM** - ✅ FIXED (2026-04-12)

**Canonical value: +3 Defense Level, +3 Initiative, +20% Evasion.**
`race-stats-complete.md` Superior Pilots ability specifies `defense_level_bonus: 3` and `initiative_bonus: 3` - consistent with `components-complete.md` (+3 Defense). The "+5 Defense Level (+50%)" in `combat-mechanics.md` and "+5 effective" in `weapons-complete.md` were wrong. Fixed:
- `combat-mechanics.md`: "+5 Defense Level (+50%)" → "+3 Defense Level (+30%)"
- `weapons-complete.md` table: "+50% defense (+5 effective)" → "+50% ship defense (+3 Defense Level)"
- `components-complete.md`: already correct at "+3 Defense" - no change needed

### 1.4 - Megabolt Cannon Chain Lightning: 4 vs. 3 Adjacent Ships
**Severity: MEDIUM** - ✅ FIXED (2026-04-12)

**Canonical value: 4 adjacent ships.**
`weapons-complete.md` is the authoritative weapons spec and consistently says `chain_lightning_4` (hits 4 adjacent ships) in both the table and the special effects reference. The `combat-algorithm.md` Section 21 description was wrong (said 3). Fixed: updated `combat-algorithm.md` special effects table to "hits up to 4 adjacent enemies."

### 1.5 - Critical Hit Chance: 5% vs. 10%
**Severity: MEDIUM** - ✅ FIXED (2026-04-12)

**Canonical value: 5% base critical chance.**
`combat-algorithm.md` Section 14 is the implementation specification and defines 5%. The `combat-mechanics.md` overview was wrong (said 10%). Fixed: updated `combat-mechanics.md` to read "Critical Hits (5% chance)".

### 1.6 - Critical Hit Damage Multiplier: 2× vs. "+50%"
**Severity: MEDIUM** - ✅ FIXED (2026-04-12)

**Canonical value: 2× (double damage).**
`combat-algorithm.md` Section 14 defines `critical_damage = damage * 2`. Fixed: updated `tactical-combat-ui.md` hit feedback popup from "CRITICAL HIT! +50%" to "CRITICAL HIT! ×2 damage".

### 1.7 - Ion Stream Projector Listed Twice, Different Names
**Severity: LOW**

`weapons-complete.md` has "Ion Stream Projector" in the Special Weapons table and JSON with `effect: "disable_engines"`. The field name `special` in beam weapons uses `"kills_crew"` for Neutron Blaster (beam) but the special weapon called "Neutron Stream Projector" also kills crew via `effect: "crew_damage"`. These are separate items but the naming overlap ("Neutron Blaster" beam vs "Neutron Stream Projector" special weapon) is confusing and not flagged anywhere.

### 1.8 - `base_hp_by_class` JSON Uses Different Ship Classes Than the Hull Size System
**Severity: HIGH** ✅ **FIXED**

`components-complete.md` `base_hp_by_class` now uses the 4-hull-size keys matching the rest of the design:
```json
"small": 3, "medium": 18, "large": 100, "huge": 600
```
The old 7-class role-based table (`scout`, `fighter`, `destroyer`, etc.) has been replaced.

---

## 2. Combat Formulas Referencing Undefined Values

### 2.1 - Hit Formula: `target_defense` is Undefined
**Severity: HIGH** - ✅ FIXED (2026-04-12)

`combat-mechanics.md` canonical formula:
```
hit_chance = 50 + (battle_computer_rating × 5) - (target_defense × 5) + ...
```

`target_defense` is never defined as a field. `combat-algorithm.md` Section 10 uses `target.maneuver_rating × 3` and `target.defense_bonus` separately - not a single `target_defense` aggregate field. The mechanics doc also writes `target_defense = ecm_rating + maneuver_rating` in-line, but the algorithm applies them differently (maneuver × 3%, not × 5%; ECM doesn't affect beams at all in Section 18). These need to be reconciled into a single authoritative formula.

**Resolution:** Updated `combat-mechanics.md` to match `combat-algorithm.md` Section 10 as authoritative. The undefined `target_defense` aggregate is removed. The formula now explicitly uses `maneuver_rating × 3` and `defense_bonus` (from special systems) as separate terms - matching the pseudocode. Added a clear note that ECM does not affect beam weapons (only missiles). Updated example calculation accordingly.

### 2.2 - Inertial Stabilizer/Nullifier Defense Bonus: Incorrect Formula Reference
**Severity: MEDIUM**

`combat-algorithm.md` Section 9 lists:
```
Defense_Modifiers:
  + (Inertial_Stabilizer_Bonus: +2 or +4)
```
Note: adding to Defense_Modifiers increases the subtracted value, so larger = harder to hit. But the `+` sign implies it *helps* the attacker. This is inverted - should be listed under Defense_Modifiers as a positive value that reduces hit chance, which is what the section already represents. However the comment "(+2 or +4)" doesn't specify that this is subtracted from hit_chance. A developer could misread this as +2/+4 to hit.

### 2.3 - Shield Absorption Formula: `shield_class` Undefined in Algorithm
**Severity: HIGH** ✅ **FIXED**

`shield_class` has been added to the combat ship state JSON (Section 2) with an explanatory note: it holds the installed deflector's tier number (1-15, or 0 for no shields), which `apply_damage()` uses as the per-hit absorption cap.

### 2.4 - Retreat Formula References Undefined `own_speed`
**Severity: MEDIUM** ✅ **FIXED**

`combat_speed` has been added to the combat ship state JSON (Section 2). It holds the installed engine's combat hex movement value (1-8) and is used by the movement system (Section 6-7) and the retreat formula (Section 28).

### 2.5 - `calculate_ship_combat_power()` References `experience_level` as Numeric
**Severity: MEDIUM** ✅ **FIXED**

An explicit string→int mapping has been added inline in `calculate_ship_combat_power()` (Section 25.6 / Auto-Resolve):
```python
exp_numeric = {"rookie": 0, "regular": 1, "veteran": 2, "elite": 3}
power *= 1 + (exp_numeric.get(ship.experience_level, 1) * 0.1)
```

### 2.6 - `armor_piercing` Effect: "×1.5 to hull" vs. "Ignores 50% of Armor"
**Severity: MEDIUM** ✅ **FIXED (2026-04-12)**

| Document | Description |
|---|---|
| `combat-algorithm.md` (Section 21 table) | `armor_piercing` → "Damage to hull ×1.5" |
| `weapons-complete.md` (special effects reference) | `armor_piercing` → "Ignores 50% of armor" |

These are not the same thing. "×1.5 to hull" means leftover damage after shields is amplified. "Ignores 50% of armor" could mean it bypasses 50% of the shield absorption and hits hull directly. The actual pseudocode in Section 11 does `remaining_damage * 1.5` after shields are resolved - so the algorithm interpretation is "1.5× to hull damage," not "bypasses shields." The weapons doc description is misleading.

**Resolution:** `weapons-complete.md` special effects table updated to match the algorithm: "Hull damage ×1.5 (amplifies damage that passes shields; does NOT bypass shields)." The `apply_damage()` pseudocode in `combat-algorithm.md` was also annotated with an explicit comment clarifying this behavior.

---

## 3. Ship Classes with Incomplete Stats

### 3.1 - `ship-classes.md` Size Modifier Uses Points, Not Percentage
**Severity: MEDIUM**

`ship-classes.md` table:
```
Small: -2 (harder to hit)
Medium: 0 (baseline)
Large: +2 (easier to hit)
Huge: +4 (much easier to hit)
```

`combat-algorithm.md` Section 10 formula uses: `size_diff = (target.size_class - 1)` × 5%. That gives Small=0%, Medium=5%, Large=10%, Huge=15%. The ship-classes doc's `±2/+4` point values are not reconciled with the actual formula. These are different systems and the ship-classes doc doesn't explain how its numbers map to hit_chance.

### 3.2 - Hull Space Ranges Are Inconsistent Across Documents
**Severity: MEDIUM**

| Document | Small | Medium | Large | Huge |
|---|---|---|---|---|
| `ship-classes.md` | 25-40 | 60-100 | 160-250 | 400-600 |
| `ship-design.md` | ~40 | ~100 | ~250 | ~500+ |
| `components-complete.md` | ~40 | ~100 | ~250 | ~500+ |
| `weapons-complete.md` (weapon slot table) | "~40" | "~100" | "~250" | "~500+" |

`ship-classes.md` gives lower bounds (25, 60, 160, 400) that don't appear elsewhere. The "~40, ~100, ~250, ~500+" approximations appear consistent across most docs, but `ship-classes.md` suggests a range rather than a single value. This needs one canonical table.

### 3.3 - No Stats for Rookie Experience Level
**Severity: LOW**

`combat-algorithm.md` Section 32 experience table lists: Rookie (-5% accuracy), Regular, Veteran (+5%), Elite (+10%). But the `award_experience()` function (Section 31) never assigns "rookie" - ships start as "regular" after 0 battles. If Rookie is used in the hit formula, there must be a way for ships to be in that state (perhaps new ships default to it?). Needs clarification.

---

## 4. Special Systems Without Clear Mechanics

### 4.1 - Stasis Field: Disables Weapons vs. Cannot Act
**Severity: MEDIUM**

| Document | Effect |
|---|---|
| `combat-algorithm.md` (Section 25) | `"cannot_act"` - entire ship frozen |
| `special-systems.md` | "Disable enemy **weapons** 2 turns" |
| `components-complete.md` | "Disable target 2 turns" |

"Cannot act" (full disable) vs "disable weapons only" are meaningfully different. A ship that can still move but not fire is tactically very different from a fully frozen ship.

### 4.2 - Black Hole Generator: "25% kill" vs. "Once per battle"
**Severity: MEDIUM**

| Document | Limitation |
|---|---|
| `combat-algorithm.md` (Section 21 table) | Not listed (no once-per-battle clause) |
| `components-complete.md` | Not listed (no once-per-battle clause) |
| `special-systems.md` | "Once per battle" |
| `weapons-complete.md` (JSON) | No `once_per_battle` field in the schema |

If it's once-per-battle, that constraint needs to be in the JSON schema and the algorithm. Currently nothing enforces it.

### 4.3 - Tractor/Repulsor Beam: No Combat Resolution Mechanic
**Severity: MEDIUM**

`components-complete.md` defines Repulsor Beam ("Push ships 1 hex away") and Tractor Beam ("Pull ships 1 hex closer"). These appear in the UI special systems panel. But neither `combat-algorithm.md` nor any other doc specifies:
- Can the target resist? (saving throw? maneuver check?)
- Does this use the ship's action for the turn?
- What happens if the target hex is occupied?
- Range limitation (how many hexes away can it affect a target)?

The `tactical-combat-ui.md` special panel shows "Tractor Beam: Pull enemy ship **2 hexes** closer" - but `components-complete.md` says "Pull ships 1 hex closer." Conflict.

### 4.4 - Automated Repair: 15% HP Per Turn - of What?
**Severity: MEDIUM**

`combat-algorithm.md` Section 24:
```python
repair_amount = floor(ship.max_hp * 0.15)
```

`special-systems.md` says "Regenerate 10-15% HP per turn" - is it 10%, 15%, or a range? The algorithm uses a flat 15%, but the special-systems doc implies it could be 10%. `components-complete.md` says `hp_per_turn: 0.15`. These should agree, and "10-15%" in the overview doc should be replaced with the canonical value.

### 4.5 - Sub-Space Teleporter: "Any Hex" vs. "Within 5 Spaces"
**Severity: MEDIUM**

| Document | Range |
|---|---|
| `combat-algorithm.md` (Section 26) | "any hex" (no range limit) |
| `components-complete.md` | "Teleport to any hex" (no range limit) |
| `tactical-combat-ui.md` (special panel) | "Jump to any hex within 5 spaces" |

The UI wireframe introduces a 5-hex range limit not present in any other doc. If this is intentional, it must be added to the algorithm and component spec.

### 4.6 - Cloaking: Defense Bonus Application Unclear
**Severity: LOW**

`combat-algorithm.md` Section 23 awards `ship.defense_bonus += 5` when cloaked. Section 10 subtracts `target.defense_bonus` from hit_chance, which is correct. However, Section 9's Defense Modifiers list shows:
```
+ (Cloaking_Bonus: +5)
```
The `+` here means it's added to the defense modifier pool (which is subtracted), so it effectively penalizes attackers by 5%. But Section 10 separately applies `-20` for cloaked targets:
```python
if target.cloaked:
    hit_chance -= 20
```
This means cloaked ships get `-5` from defense_bonus AND `-20` from the cloaked check - a total of `-25`. Is that intentional? The +5 bonus listed in `components-complete.md` for all three cloaking devices may be redundant with the hard -20.

### 4.7 - Boarding/Transporter Systems: Zero Combat Mechanics Defined
**Severity: HIGH** ✅ FIXED (2026-04-12)

Full boarding mechanics defined in `combat-algorithm.md` Sections 36–43:
- **Prerequisites:** transporter equipped, within 1 hex, target weakened (≥50% crew lost or HP ≤25%; Combat Transporter relaxes HP threshold to ≤50%)
- **Success formula:** base 50% + transporter tier bonus (Standard +0, Improved +15, Combat +30) ± crew advantage (capped ±20%) + racial modifier; clamped 5–95%
- **Adrift targets** (0 crew) auto-captured without a roll
- **Casualties:** both sides lose crew on every attempt, win or lose
- **Capture:** boarding party switches sides, prize ship gets accuracy/speed penalties and boarding immunity for remainder of battle
- **Counter-boarding:** successfully boarded ships are immune; repelled ships can be re-attempted next turn
- **Racial bonuses:** Guinea Pigs +20%, Hermit Crabs +10%, Budgies -10%

---

## 5. UI Wireframes vs. Combat Mechanics Mismatches

### 5.1 - Combat Phase Display Shows "Firing Phase" and "Special Systems Phase" as Separate
**Severity: MEDIUM**

`tactical-combat-ui.md` phase display:
```
3. Firing Phase (YOU)
4. Special Systems Phase
5. Damage Resolution
```

But `combat-algorithm.md` Section 3 defines the turn structure as:
1. Initiative Phase
2. Action Phase (move, fire, **and** use special systems - all in one)
3. Missile Phase
4. End Phase

The UI implies specials happen *after* firing as a separate phase. The algorithm treats them as part of the same action. This will confuse both players and developers.

### 5.2 - UI Shows "Movement Phase" Before "Firing Phase" as Sequential for All Ships
**Severity: MEDIUM**

The UI phase list (Section "Combat Phases Per Turn") shows all ships move, then all ships fire. But `combat-algorithm.md` is initiative-based: each ship takes its full turn (move + fire + special) before the next ship acts. The UI should show a per-ship action sequence, not a fleet-wide move-then-fire structure.

### 5.3 - UI Grid: 15×15, Mechanics Say 20×20 to 40×40
**Severity: LOW**

| Document | Grid Size |
|---|---|
| `tactical-combat-ui.md` | "15×15 hexes (225 total)" - standard combat |
| `combat-mechanics.md` | "Small battle: 20×20, Large battle: 40×40" |

These are irreconcilable without a note explaining which is canonical or how "standard" is defined.

### 5.4 - Ships Start 8-10 Hexes Apart (UI) - Doesn't Fit 15×15 Grid at All Ranges
**Severity: LOW**

A 15×15 grid where ships start 8-10 hexes apart means long-range weapons (range 9-15 in the mechanics doc) cover almost the entire grid from the opening position. Medium-range weapons (5-8) would be in range immediately. This may be intended, but it squashes the tactical meaning of range categories.

### 5.5 - Bombing UI Presents "BIOLOGICAL WEAPON" as Making Planet "Radioactive for 50 Turns"
**Severity: LOW**

`tactical-combat-ui.md` bombardment screen:
```
[BIOLOGICAL WEAPON] - Genocidal plague... Planet radioactive for 50 turns
```

`weapons-complete.md` defines biological weapons as killing population and reducing max pop permanently. There's no "radioactive" mechanic defined anywhere. The UI has invented a mechanic not present in the design docs.

### 5.6 - Firing UI Shows Weapon Damage as Fixed: "Plasma Cannon ×4 = 80 total"
**Severity: LOW**

`tactical-combat-ui.md` weapon selection panel shows:
```
Plasma Cannon ×4
Damage: 20×4 = 80 total
```

But `weapons-complete.md` lists Plasma Cannon as 6-30 damage per shot. "20" appears to be an average, but the UI presents it as a fixed value. Players will be confused when actual damage varies. The display should show the damage range (24-120 total for ×4) or "avg 72."

---

## 6. Missing Damage Types or Armor Interactions

### 6.1 - No "Armor Piercing" Interaction With Shields Defined
**Severity: HIGH**

`combat-algorithm.md` Section 11 applies `armor_piercing` *after* shields have absorbed damage:
```python
if weapon.has_special("armor_piercing"):
    remaining_damage = floor(remaining_damage * 1.5)
```

This means `armor_piercing` only boosts damage that already made it past shields. It does *not* pierce shields in any way. But "armor-piercing" is commonly understood to bypass or reduce armor/shields. This behavior should be explicitly documented - is the intent that it only amplifies hull damage, or should it also reduce shield absorption?

### 6.2 - `halves_shields` vs. `ignores_half_shields`: Two Similar Effects, No Clear Distinction
**Severity: MEDIUM** ✅ **FIXED (2026-04-12)**

Two beam specials exist:
- `halves_shields` (Ion Cannon): "Target's shield absorption halved for this hit"
- `ignores_half_shields` (Mass Driver): "50% of damage bypasses shields"

These sound similar but work differently:
- `halves_shields`: Shield absorbs `shield_class / 2`; the rest is halved too
- `ignores_half_shields`: Half of total damage ignores shields entirely; other half hits shields normally

The algorithm (Section 21) describes them but the actual pseudocode in `apply_damage()` (Section 11) only handles `armor_piercing` and `double_shield_damage`. Neither `halves_shields` nor `ignores_half_shields` has an implementation in the pseudocode. **Both are unimplemented in the algorithm.**

**Resolution:** Both effects implemented in `apply_damage()` pseudocode (`combat-algorithm.md` Section 11):
- `halves_shields`: Computes `effective_shield_class = floor(shield_class / 2)` before absorption.
- `ignores_half_shields`: Splits damage into bypass (floor half) and shielded (remainder) portions; shield absorbs only the shielded half; both halves recombine for hull damage.

Section 21 table updated with precise descriptions.

### 6.3 — Hellfire Torpedo “+10 vs Shields” Has No Implementation
**Severity: MEDIUM** ✅ **FIXED (2026-04-12)**

`weapons-complete.md` (torpedoes table and JSON): Hellfire Torpedo has `special: "bonus_vs_shields"`. But:
- The special effects reference table doesn't define `bonus_vs_shields`
- `combat-algorithm.md` Section 20 torpedo resolution uses `apply_damage()` which has no `bonus_vs_shields` branch
- No document specifies whether this means +10 to damage dealt to shields, -10 to shield absorption, or something else

Complete gap.

**Resolution:** `bonus_vs_shields` defined and implemented:
- **Mechanic:** After normal shield absorption, +10 bonus damage is applied directly to `shields_current` (capped at remaining shield HP). This does **not** increase hull damage — the effect is purely extra punishment to shields.
- `apply_damage()` pseudocode updated with a `bonus_vs_shields` branch in the normal absorption path.
- `weapons-complete.md` special effects table updated with the canonical description.

### 6.4 - "Kills Crew" Effect: No Crew Stat Defined on Ships
**Severity: HIGH** ✅ FIXED (2026-04-12)

`crew_current` and `crew_max` added to the combat ship state JSON (Section 2). Base crew complement by hull size defined in Section 11c: Small 20, Medium 60, Large 200, Huge 500. `apply_crew_loss_penalties()` defined with three degradation tiers:
- **0% crew (adrift):** ship cannot act, combat_speed → 0; becomes boarding prize
- **≤25% crew (skeleton crew):** -20% accuracy, speed halved, 50% chance any weapon unmanned each turn
- **≤50% crew (undermanned):** -10% accuracy, combat_speed -1 (minimum 1)

### 6.5 - `stream` Weapon Effect (Graviton Beam): Mechanics Undefined
**Severity: MEDIUM**

`weapons-complete.md` and `combat-algorithm.md` Section 21 list `stream`: "Damage continues each round while target is held." But no document defines:
- What roll determines if the target is "held" initially?
- Can the target break free? How?
- Does the holding ship need to use its action each turn to maintain the beam?
- Does the holding ship lose its ability to fire other weapons while streaming?
- How does this interact with missiles in flight (the stream ship fires in Action Phase, missiles resolve in Missile Phase)?

### 6.6 - No Damage Type System (e.g., Energy vs. Kinetic vs. Explosive)
**Severity: LOW**

MOO1 doesn't have typed damage, and this game appears to follow that. But the `defense-systems.md` (stub doc) mentions "Armor: 5/space (Titanium) → 60/space (Adamantium Exo)" - "Adamantium Exo" is undefined. Also the shield/armor interaction is purely subtractive (no damage type resistance), which is fine if intentional. Worth a note that damage is untyped.

---

## 7. Inconsistent Terminology

### 7.1 - "Armor" vs. "Hull" Used Interchangeably
**Severity: HIGH**

The damage sequence across documents uses inconsistent terms:

| Document | Second-layer term |
|---|---|
| `combat-algorithm.md` (Section 11 header) | "Armor/Hull damage" |
| `combat-algorithm.md` (Section 12) | "Armor/Hull" |
| `combat-algorithm.md` (Section 13) | "Ship HP" / "Armor_Multiplier" |
| `combat-mechanics.md` | "armor" (damage resolution step 3) |
| `combat-mechanics.md` | "hull" (damage sequence step 2 header) |
| `combat-mechanics.md` | "hull reaches 0" |
| `defense-systems.md` | "hull hit points" |
| `ship-classes.md` | "hit points" |
| `tactical-combat-ui.md` | "HP" and "Armor" interchangeably |

Recommendation: Use **HP** for the numeric value (current_hp / max_hp), **Armor** for the material (Titanium, Zortrium, etc.) and its multiplier, and **Hull** for the physical ship structure. Currently all three refer to the same thing in different places.

### 7.2 - "Hit Points" vs. "HP" vs. "Armor" vs. "Hull Points"
**Severity: MEDIUM**

The combat ship state JSON uses `current_hp` / `max_hp`. The hit feedback UI says "-60 Armor." Ship classes doc uses "Base Hits." Needs a single canonical term. (See 7.1.)

### 7.3 - "Combat Speed" vs. "Speed Rating" vs. "Maneuver Rating"
**Severity: MEDIUM**

`combat-algorithm.md` Section 6:
```
Movement_Points = Combat_Speed + Maneuver_Bonus
Combat_Speed = Engine_Combat_Speed
```

But Section 4 (initiative) uses `Engine_Maneuver_Rating`. The `tactical-combat-ui.md` turn order panel shows "Speed 5" to mean initiative order, but in the algorithm initiative uses a formula (not just speed). `combat-mechanics.md` says "Speed = Engine + Propulsion Tech + Combat Speed" - treating Speed and Combat Speed as different additive values. These need a clear glossary.

### 7.4 - "Battle Computer Rating" vs. "Attack Rating" vs. "Battle_Computer_Mark"
**Severity: LOW**

| Term | Used In |
|---|---|
| `battle_computer_rating` | `combat-mechanics.md` formula |
| `Attack_Rating` / `attack_rating` | `components-complete.md` |
| `Battle_Computer_Mark` | `combat-algorithm.md` Section 4 |
| `Battle_Scanner_Bonus` | `combat-algorithm.md` Section 4 |

These all refer to the same stat. Pick one term.

### 7.5 - "Maneuver Rating" Used Both for Defense and Initiative
**Severity: LOW**

Maneuver is simultaneously:
- A defense modifier (harder to hit): `target.maneuver_rating × 3%` in hit formula
- An initiative modifier: `Engine_Maneuver_Rating × 2` in initiative formula

Using the same stat for two different formulas with different coefficients (×3 vs ×2) is fine mechanically, but the term needs to be defined as a single property with explicit dual use, not two separate concepts.

### 7.6 - "ECM Level" vs. "Missile Defense" vs. "ECM Rating"
**Severity: LOW**

| Term | Used In |
|---|---|
| `ecm_rating` | `combat-algorithm.md` missile formula |
| `Missile Defense` / `missile_defense` | `components-complete.md` |
| `ECM Level` | `combat-mechanics.md`, `weapons-complete.md` |

All refer to the same stat. Standardize to one term.

---

## 8. Other Issues

### 8.1 - `weapons-systems.md` Is Effectively a Stub
**Severity: LOW**

`weapons-systems.md` is a very high-level summary (4 sections, ~30 lines) that adds nothing not already in `weapons-complete.md`. It also says Mauler Device "ignores shields," which contradicts `weapons-complete.md` where Mauler's special is `always_hits` (100% accuracy) - not shield bypass. Consider deleting this file or expanding it into something meaningful.

### 8.2 - `defense-systems.md` Is a Stub with Wrong Stats
**Severity: MEDIUM**

`defense-systems.md` says:
```
Shields HP: 25 (Class I) → 250 (Planetary)
Armor: 5/space (Titanium) → 60/space (Adamantium Exo)
ECM: -10% to -35% enemy hit chance
Point Defense: 30-70% per missile
```

None of these values match any other document:
- Shields aren't measured in "HP" (they absorb 1-15 damage per hit; they have `shields_current`/`shields_max` which are never defined)
- Armor doesn't have an HP-per-space value anywhere else
- "Adamantium Exo" is undefined (Adamantium exists, no "Exo" variant)
- ECM ranges don't match (ECM I = -5%, ECM X = -50%; not "-10% to -35%")
- Point defense success is calculated per-beam-weapon (10% per beam × attacks), not a flat 30-70%

This file appears to be an early draft that was superseded by `components-complete.md` but never updated.

### 8.3 - Missile "Racks" vs. "Ammo" Terminology
**Severity: LOW**

`weapons-complete.md` uses "Racks" (2 or 5 missiles per weapon mount). `combat-algorithm.md` uses `missile_ammo[weapon.id]` and `attacker.missile_ammo[weapon.id] -= 1`. The combat ship state JSON shows `missile_ammo: {}`. The term "rack" should map to the initial ammo value - but this is never stated. Do 2 racks mean 2 total missiles, or 2 missiles per firing that reload between battles?

### 8.4 - No Definition of "Optimal Range" for AI Movement
**Severity: LOW**

`combat-algorithm.md` AI movement (Sections 34, 25.3) calls `get_optimal_weapon_range(ship)` - a function referenced but never defined. It needs a definition: is it the max range of the ship's primary weapon? The average? The range at which DPS is maximized accounting for range penalties?

### 8.5 - Experience Thresholds Inconsistent Between Algorithm and Mechanics
**Severity: LOW**

| Level | `combat-algorithm.md` threshold | `combat-mechanics.md` |
|---|---|---|
| Rookie | 0 battles (implied default) | "New ships" (no number) |
| Regular | 1+ battles | "Standard ships" |
| Veteran | 3+ battles | "3+ battles" ✓ |
| Elite | 10+ battles | "10+ battles" ✓ |

The accuracy bonuses differ:

| Level | `combat-algorithm.md` | `combat-mechanics.md` |
|---|---|---|
| Rookie | -5% | -10% |
| Veteran | +5% | +10% |
| Elite | +10% | +20% |

One doc has half the values of the other.

### 8.6 - `apply_weapon_effects()` Is Called But Never Defined
**Severity: HIGH** ✅ FIXED (2026-04-12)

`apply_weapon_effects()` fully defined in `combat-algorithm.md` Section 11b with pseudocode for all weapon special effects:
- **`kills_crew`:** kills `crew_kill_percent × crew_max` crew (min 1), then calls `apply_crew_loss_penalties()`
- **`stream`:** adds a `stream` status effect with per-turn damage (50% of initial hit); includes break-free mechanic (maneuver_rating × 10% chance per End Phase)
- **`chain_lightning`:** arcs to up to `chain_lightning_count` adjacent enemies at 50% damage; no re-chaining from arc hits
- **`disable_engines`:** sets combat_speed to 1 for `disable_duration` turns; refreshes if already applied
- **`instant_kill_small`:** destroys Small hull ships regardless of HP; no effect on other hull sizes
- **`double_shield_damage` / `armor_piercing`:** noted as handled in `apply_damage()` directly

---

## Issues by Priority

### Must Fix (Blockers)
1. ~~`base_hp_by_class` JSON uses role-based classes that don't exist~~ - **1.8** ✅ FIXED
2. ~~`shield_class` undefined on combat ship state~~ - **2.3** ✅ FIXED
3. ~~`experience_level` treated as numeric in formula~~ - **2.5** ✅ FIXED
4. ~~`apply_weapon_effects()` never defined~~ - **8.6** ✅ FIXED
5. ~~Crew stat not defined anywhere~~ - **6.4** ✅ FIXED
6. ~~Boarding mechanics entirely undefined~~ - **4.7** ✅ FIXED
7. ~~Ferret racial bonus: three conflicting values~~ - **1.1** ✅ FIXED
8. ~~Hit formula: `target_defense` undefined / conflicting formula - **2.1**~~ ✅ FIXED

### Should Fix (High Friction)
9. ~~Critical hit: 5% vs 10% base chance~~ - **1.5** ✅ FIXED (canonical: 5%)
10. ~~Critical hit: 2× vs +50% damage~~ - **1.6** ✅ FIXED (canonical: 2×)
11. ~~Chain lightning: 3 vs 4 targets~~ - **1.4** ✅ FIXED (canonical: 4)
12. ~~`halves_shields` / `ignores_half_shields` not implemented in `apply_damage()`~~ - **6.2** ✅ FIXED
13. ~~Hellfire Torpedo `bonus_vs_shields` undefined~~ - **6.3** ✅ FIXED
14. Stasis Field: full freeze vs weapons-only - **4.1**
15. Tractor/Repulsor: UI says 2-hex pull, spec says 1-hex - **4.3**
16. Teleporter: unlimited range vs 5-hex limit in UI - **4.5**
17. UI phase structure doesn't match algorithm - **5.1, 5.2**
18. ~~`combat_speed` not in combat ship state JSON~~ - **2.4** ✅ FIXED
19. `stream` effect mechanics undefined - **6.5**
20. ~~`armor_piercing` behavior described differently in two docs~~ - **2.6** ✅ FIXED

### Nice to Fix (Cleanup)
21. ~~Budgies defense: +5 level vs +3 flat~~ - **1.3** ✅ FIXED
22. Hull space ranges inconsistent - **3.2**
23. Grid size: 15×15 vs 20×20 - **5.3**
24. Biological weapon "radioactive" invented by UI - **5.5**
25. Plasma Cannon fixed damage in UI - **5.6**
26. `defense-systems.md` stub with wrong stats - **8.2**
27. Terminology: hull/armor/HP - **7.1-7.2**
28. Terminology: combat speed/maneuver/speed - **7.3**
29. Terminology: BC rating/attack rating - **7.4**
30. Terminology: ECM level/missile defense - **7.6**
31. `weapons-systems.md` stub - **8.1**
32. Experience accuracy bonuses: values differ by 2× - **8.5**

---

*End of review. 32 issues identified.*
