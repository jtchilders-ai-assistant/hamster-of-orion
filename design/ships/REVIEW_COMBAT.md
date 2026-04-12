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

### 1.1 — Ferrets' Racial Combat Bonus: Three Conflicting Values
**Severity: HIGH**

| Document | Value |
|---|---|
| `weapons-complete.md` (table) | +4 Attack Level AND +15% damage |
| `weapons-complete.md` (racial modifiers JSON) | `ship_damage: 1.25` (= +25%) |
| `combat-mechanics.md` | "+4 Attack Level AND +15% weapon damage" — then a note that "+30% ship combat bonus in `race-stats-complete.md` translates to the +4 attack level" |

Three different numbers (+15%, +25%, +30%) are floating around for Ferret ship combat. The JSON data (`1.25`) disagrees with the prose description (`+15%` separate from the `+4` level). The reference to `race-stats-complete.md` as the canonical source means this file may not even be authoritative. Needs a single source of truth.

### 1.2 — Ferrets: Attack Level vs. Raw Hit Percentage
**Severity: HIGH**

The hit formula (`Hit_Chance = 50 + Battle_Computer × 5 - Target_Defense × 5 + ...`) applies Attack Level as `level × 5%`. So "+4 Attack Level" = +20% to hit. But the description also says "+15% weapon damage." Are these both always active? Do they stack? The note says "Both always apply" but is vague on the interaction with the Battle Computer formula.

### 1.3 — Budgies' Defense: "+5 Defense Level" vs. "+3 Defense"
**Severity: MEDIUM**

| Document | Value |
|---|---|
| `combat-mechanics.md` | "+5 Defense Level (+50%), +3 Initiative, +20% Evasion" |
| `components-complete.md` (racial modifiers) | "+3 Defense" |

`+5 Defense Level × 5% = +25% defense` doesn't match "+50%" in the prose. "+3 Defense" in components doesn't match either. Inconsistent.

### 1.4 — Megabolt Cannon Chain Lightning: 4 vs. 3 Adjacent Ships
**Severity: MEDIUM**

| Document | Value |
|---|---|
| `combat-algorithm.md` (Section 21 special effects table) | `chain_lightning` — "hits up to 3 adjacent enemies" |
| `weapons-complete.md` (table, special column) | `chain_lightning_4` — implicit: hits 4 |
| `weapons-complete.md` (special effects reference, bottom) | `chain_lightning_4` — "Damage spreads to 4 adjacent ships" |

The algorithm doc says 3; the weapons doc says 4. One is wrong.

### 1.5 — Critical Hit Chance: 5% vs. 10%
**Severity: MEDIUM**

| Document | Value |
|---|---|
| `combat-algorithm.md` (Section 14) | 5% base critical chance |
| `combat-mechanics.md` | "10% chance" |

These are directly contradictory. Which is intended?

### 1.6 — Critical Hit Damage Multiplier: 2× vs. "+50%"
**Severity: MEDIUM**

| Document | Value |
|---|---|
| `combat-algorithm.md` (Section 14) | `critical_damage = damage * 2` (double damage) |
| `tactical-combat-ui.md` (hit feedback popup) | "CRITICAL HIT! +50%" |

The UI would show the wrong number if the algorithm is 2×.

### 1.7 — Ion Stream Projector Listed Twice, Different Names
**Severity: LOW**

`weapons-complete.md` has "Ion Stream Projector" in the Special Weapons table and JSON with `effect: "disable_engines"`. The field name `special` in beam weapons uses `"kills_crew"` for Neutron Blaster (beam) but the special weapon called "Neutron Stream Projector" also kills crew via `effect: "crew_damage"`. These are separate items but the naming overlap ("Neutron Blaster" beam vs "Neutron Stream Projector" special weapon) is confusing and not flagged anywhere.

### 1.8 — `base_hp_by_class` JSON Uses Different Ship Classes Than the Hull Size System
**Severity: HIGH**

`components-complete.md` JSON section `base_hp_by_class` defines:
```json
"scout": 5, "fighter": 10, "destroyer": 25, "cruiser": 60,
"battle_cruiser": 120, "dreadnought": 200, "titan": 400
```

But the game only has **4 hull sizes** (Small, Medium, Large, Huge), as stated in `ship-classes.md`, `ship-design.md`, and `combat-algorithm.md`. The JSON references 7 role-based ship types that don't exist in the design. This will cause implementation confusion. The correct base HP values are in `combat-algorithm.md` Section 13: Small=3, Medium=18, Large=100, Huge=600.

---

## 2. Combat Formulas Referencing Undefined Values

### 2.1 — Hit Formula: `target_defense` is Undefined
**Severity: HIGH**

`combat-mechanics.md` canonical formula:
```
hit_chance = 50 + (battle_computer_rating × 5) - (target_defense × 5) + ...
```

`target_defense` is never defined as a field. `combat-algorithm.md` Section 10 uses `target.maneuver_rating × 3` and `target.defense_bonus` separately — not a single `target_defense` aggregate field. The mechanics doc also writes `target_defense = ecm_rating + maneuver_rating` in-line, but the algorithm applies them differently (maneuver × 3%, not × 5%; ECM doesn't affect beams at all in Section 18). These need to be reconciled into a single authoritative formula.

### 2.2 — Inertial Stabilizer/Nullifier Defense Bonus: Incorrect Formula Reference
**Severity: MEDIUM**

`combat-algorithm.md` Section 9 lists:
```
Defense_Modifiers:
  + (Inertial_Stabilizer_Bonus: +2 or +4)
```
Note: adding to Defense_Modifiers increases the subtracted value, so larger = harder to hit. But the `+` sign implies it *helps* the attacker. This is inverted — should be listed under Defense_Modifiers as a positive value that reduces hit chance, which is what the section already represents. However the comment "(+2 or +4)" doesn't specify that this is subtracted from hit_chance. A developer could misread this as +2/+4 to hit.

### 2.3 — Shield Absorption Formula: `shield_class` Undefined in Algorithm
**Severity: HIGH**

`combat-algorithm.md` Section 11 `apply_damage()`:
```python
shield_absorb = min(target.shield_class, remaining_damage)
```

`target.shield_class` is never set on the combat ship struct (Section 2). The shield data is stored as `shields_max` and `shields_current`, which are HP values. The class number (e.g., Class V = absorbs 5) is a different field not defined in the combat state JSON schema. This is a real implementation gap: where does `shield_class` come from at runtime?

### 2.4 — Retreat Formula References Undefined `own_speed`
**Severity: MEDIUM**

`combat-algorithm.md` Section 28:
```python
own_speed = ship.combat_speed
...
retreat_chance = (own_speed / max(enemy_max_speed, 1)) * 50 + 25
```

`ship.combat_speed` is not in the combat ship state JSON (Section 2). It tracks `current_hp`, `shields_current`, etc., but not `combat_speed`. The field must be added to the combat ship struct.

### 2.5 — `calculate_ship_combat_power()` References `experience_level` as Numeric
**Severity: MEDIUM**

`combat-algorithm.md` Section 36 (Auto-Resolve):
```python
power *= 1 + (ship.experience_level * 0.1)
```

But `experience_level` is a string: `"rookie"`, `"regular"`, `"veteran"`, `"elite"` (Section 31). Multiplying a string by 0.1 will fail at runtime. Needs a mapping (e.g., rookie=0, regular=1, veteran=2, elite=3) or a numeric field.

### 2.6 — `armor_piercing` Effect: "×1.5 to hull" vs. "Ignores 50% of Armor"
**Severity: MEDIUM**

| Document | Description |
|---|---|
| `combat-algorithm.md` (Section 21 table) | `armor_piercing` → "Damage to hull ×1.5" |
| `weapons-complete.md` (special effects reference) | `armor_piercing` → "Ignores 50% of armor" |

These are not the same thing. "×1.5 to hull" means leftover damage after shields is amplified. "Ignores 50% of armor" could mean it bypasses 50% of the shield absorption and hits hull directly. The actual pseudocode in Section 11 does `remaining_damage * 1.5` after shields are resolved — so the algorithm interpretation is "1.5× to hull damage," not "bypasses shields." The weapons doc description is misleading.

---

## 3. Ship Classes with Incomplete Stats

### 3.1 — `ship-classes.md` Size Modifier Uses Points, Not Percentage
**Severity: MEDIUM**

`ship-classes.md` table:
```
Small: -2 (harder to hit)
Medium: 0 (baseline)
Large: +2 (easier to hit)
Huge: +4 (much easier to hit)
```

`combat-algorithm.md` Section 10 formula uses: `size_diff = (target.size_class - 1)` × 5%. That gives Small=0%, Medium=5%, Large=10%, Huge=15%. The ship-classes doc's `±2/+4` point values are not reconciled with the actual formula. These are different systems and the ship-classes doc doesn't explain how its numbers map to hit_chance.

### 3.2 — Hull Space Ranges Are Inconsistent Across Documents
**Severity: MEDIUM**

| Document | Small | Medium | Large | Huge |
|---|---|---|---|---|
| `ship-classes.md` | 25–40 | 60–100 | 160–250 | 400–600 |
| `ship-design.md` | ~40 | ~100 | ~250 | ~500+ |
| `components-complete.md` | ~40 | ~100 | ~250 | ~500+ |
| `weapons-complete.md` (weapon slot table) | "~40" | "~100" | "~250" | "~500+" |

`ship-classes.md` gives lower bounds (25, 60, 160, 400) that don't appear elsewhere. The "~40, ~100, ~250, ~500+" approximations appear consistent across most docs, but `ship-classes.md` suggests a range rather than a single value. This needs one canonical table.

### 3.3 — No Stats for Rookie Experience Level
**Severity: LOW**

`combat-algorithm.md` Section 32 experience table lists: Rookie (-5% accuracy), Regular, Veteran (+5%), Elite (+10%). But the `award_experience()` function (Section 31) never assigns "rookie" — ships start as "regular" after 0 battles. If Rookie is used in the hit formula, there must be a way for ships to be in that state (perhaps new ships default to it?). Needs clarification.

---

## 4. Special Systems Without Clear Mechanics

### 4.1 — Stasis Field: Disables Weapons vs. Cannot Act
**Severity: MEDIUM**

| Document | Effect |
|---|---|
| `combat-algorithm.md` (Section 25) | `"cannot_act"` — entire ship frozen |
| `special-systems.md` | "Disable enemy **weapons** 2 turns" |
| `components-complete.md` | "Disable target 2 turns" |

"Cannot act" (full disable) vs "disable weapons only" are meaningfully different. A ship that can still move but not fire is tactically very different from a fully frozen ship.

### 4.2 — Black Hole Generator: "25% kill" vs. "Once per battle"
**Severity: MEDIUM**

| Document | Limitation |
|---|---|
| `combat-algorithm.md` (Section 21 table) | Not listed (no once-per-battle clause) |
| `components-complete.md` | Not listed (no once-per-battle clause) |
| `special-systems.md` | "Once per battle" |
| `weapons-complete.md` (JSON) | No `once_per_battle` field in the schema |

If it's once-per-battle, that constraint needs to be in the JSON schema and the algorithm. Currently nothing enforces it.

### 4.3 — Tractor/Repulsor Beam: No Combat Resolution Mechanic
**Severity: MEDIUM**

`components-complete.md` defines Repulsor Beam ("Push ships 1 hex away") and Tractor Beam ("Pull ships 1 hex closer"). These appear in the UI special systems panel. But neither `combat-algorithm.md` nor any other doc specifies:
- Can the target resist? (saving throw? maneuver check?)
- Does this use the ship's action for the turn?
- What happens if the target hex is occupied?
- Range limitation (how many hexes away can it affect a target)?

The `tactical-combat-ui.md` special panel shows "Tractor Beam: Pull enemy ship **2 hexes** closer" — but `components-complete.md` says "Pull ships 1 hex closer." Conflict.

### 4.4 — Automated Repair: 15% HP Per Turn — of What?
**Severity: MEDIUM**

`combat-algorithm.md` Section 24:
```python
repair_amount = floor(ship.max_hp * 0.15)
```

`special-systems.md` says "Regenerate 10-15% HP per turn" — is it 10%, 15%, or a range? The algorithm uses a flat 15%, but the special-systems doc implies it could be 10%. `components-complete.md` says `hp_per_turn: 0.15`. These should agree, and "10-15%" in the overview doc should be replaced with the canonical value.

### 4.5 — Sub-Space Teleporter: "Any Hex" vs. "Within 5 Spaces"
**Severity: MEDIUM**

| Document | Range |
|---|---|
| `combat-algorithm.md` (Section 26) | "any hex" (no range limit) |
| `components-complete.md` | "Teleport to any hex" (no range limit) |
| `tactical-combat-ui.md` (special panel) | "Jump to any hex within 5 spaces" |

The UI wireframe introduces a 5-hex range limit not present in any other doc. If this is intentional, it must be added to the algorithm and component spec.

### 4.6 — Cloaking: Defense Bonus Application Unclear
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
This means cloaked ships get `-5` from defense_bonus AND `-20` from the cloaked check — a total of `-25`. Is that intentional? The +5 bonus listed in `components-complete.md` for all three cloaking devices may be redundant with the hard -20.

### 4.7 — Boarding/Transporter Systems: Zero Combat Mechanics Defined
**Severity: HIGH**

`components-complete.md` lists three transporter tiers (Standard, Improved, Combat). `special-systems.md` says "Board enemy ships — Capture instead of destroy." But **no document defines**:
- What determines boarding success/failure?
- What crew mechanics exist (there's a `kills_crew` weapon effect but no crew stat on ships)?
- What are the rewards for successful boarding?
- Is there a counter-boarding mechanic?
- Does the target need to be at low HP?

This is a significant feature with zero mechanical definition.

---

## 5. UI Wireframes vs. Combat Mechanics Mismatches

### 5.1 — Combat Phase Display Shows "Firing Phase" and "Special Systems Phase" as Separate
**Severity: MEDIUM**

`tactical-combat-ui.md` phase display:
```
3. Firing Phase (YOU)
4. Special Systems Phase
5. Damage Resolution
```

But `combat-algorithm.md` Section 3 defines the turn structure as:
1. Initiative Phase
2. Action Phase (move, fire, **and** use special systems — all in one)
3. Missile Phase
4. End Phase

The UI implies specials happen *after* firing as a separate phase. The algorithm treats them as part of the same action. This will confuse both players and developers.

### 5.2 — UI Shows "Movement Phase" Before "Firing Phase" as Sequential for All Ships
**Severity: MEDIUM**

The UI phase list (Section "Combat Phases Per Turn") shows all ships move, then all ships fire. But `combat-algorithm.md` is initiative-based: each ship takes its full turn (move + fire + special) before the next ship acts. The UI should show a per-ship action sequence, not a fleet-wide move-then-fire structure.

### 5.3 — UI Grid: 15×15, Mechanics Say 20×20 to 40×40
**Severity: LOW**

| Document | Grid Size |
|---|---|
| `tactical-combat-ui.md` | "15×15 hexes (225 total)" — standard combat |
| `combat-mechanics.md` | "Small battle: 20×20, Large battle: 40×40" |

These are irreconcilable without a note explaining which is canonical or how "standard" is defined.

### 5.4 — Ships Start 8–10 Hexes Apart (UI) — Doesn't Fit 15×15 Grid at All Ranges
**Severity: LOW**

A 15×15 grid where ships start 8–10 hexes apart means long-range weapons (range 9–15 in the mechanics doc) cover almost the entire grid from the opening position. Medium-range weapons (5–8) would be in range immediately. This may be intended, but it squashes the tactical meaning of range categories.

### 5.5 — Bombing UI Presents "BIOLOGICAL WEAPON" as Making Planet "Radioactive for 50 Turns"
**Severity: LOW**

`tactical-combat-ui.md` bombardment screen:
```
[BIOLOGICAL WEAPON] - Genocidal plague... Planet radioactive for 50 turns
```

`weapons-complete.md` defines biological weapons as killing population and reducing max pop permanently. There's no "radioactive" mechanic defined anywhere. The UI has invented a mechanic not present in the design docs.

### 5.6 — Firing UI Shows Weapon Damage as Fixed: "Plasma Cannon ×4 = 80 total"
**Severity: LOW**

`tactical-combat-ui.md` weapon selection panel shows:
```
Plasma Cannon ×4
Damage: 20×4 = 80 total
```

But `weapons-complete.md` lists Plasma Cannon as 6–30 damage per shot. "20" appears to be an average, but the UI presents it as a fixed value. Players will be confused when actual damage varies. The display should show the damage range (24–120 total for ×4) or "avg 72."

---

## 6. Missing Damage Types or Armor Interactions

### 6.1 — No "Armor Piercing" Interaction With Shields Defined
**Severity: HIGH**

`combat-algorithm.md` Section 11 applies `armor_piercing` *after* shields have absorbed damage:
```python
if weapon.has_special("armor_piercing"):
    remaining_damage = floor(remaining_damage * 1.5)
```

This means `armor_piercing` only boosts damage that already made it past shields. It does *not* pierce shields in any way. But "armor-piercing" is commonly understood to bypass or reduce armor/shields. This behavior should be explicitly documented — is the intent that it only amplifies hull damage, or should it also reduce shield absorption?

### 6.2 — `halves_shields` vs. `ignores_half_shields`: Two Similar Effects, No Clear Distinction
**Severity: MEDIUM**

Two beam specials exist:
- `halves_shields` (Ion Cannon): "Target's shield absorption halved for this hit"
- `ignores_half_shields` (Mass Driver): "50% of damage bypasses shields"

These sound similar but work differently:
- `halves_shields`: Shield absorbs `shield_class / 2`; the rest is halved too  
- `ignores_half_shields`: Half of total damage ignores shields entirely; other half hits shields normally

The algorithm (Section 21) describes them but the actual pseudocode in `apply_damage()` (Section 11) only handles `armor_piercing` and `double_shield_damage`. Neither `halves_shields` nor `ignores_half_shields` has an implementation in the pseudocode. **Both are unimplemented in the algorithm.**

### 6.3 — Hellfire Torpedo "+10 vs Shields" Has No Implementation
**Severity: MEDIUM**

`weapons-complete.md` (torpedoes table and JSON): Hellfire Torpedo has `special: "bonus_vs_shields"`. But:
- The special effects reference table doesn't define `bonus_vs_shields`
- `combat-algorithm.md` Section 20 torpedo resolution uses `apply_damage()` which has no `bonus_vs_shields` branch
- No document specifies whether this means +10 to damage dealt to shields, -10 to shield absorption, or something else

Complete gap.

### 6.4 — "Kills Crew" Effect: No Crew Stat Defined on Ships
**Severity: HIGH**

Multiple weapons reference crew mechanics:
- `kills_crew` (Neutron Blaster): "Each hit kills 1% of crew"
- `Neutron Stream Projector`: "Target loses 10% crew/turn"
- `tactical-combat-ui.md` nowhere mentions crew
- `combat-algorithm.md` `apply_weapon_effects()` is referenced but never defined

The combat ship state JSON (Section 2) has no `crew`, `crew_current`, or `crew_max` field. There's no formula for how crew loss affects combat effectiveness. **Crew is a referenced mechanic with zero definition.**

### 6.5 — `stream` Weapon Effect (Graviton Beam): Mechanics Undefined
**Severity: MEDIUM**

`weapons-complete.md` and `combat-algorithm.md` Section 21 list `stream`: "Damage continues each round while target is held." But no document defines:
- What roll determines if the target is "held" initially?
- Can the target break free? How?
- Does the holding ship need to use its action each turn to maintain the beam?
- Does the holding ship lose its ability to fire other weapons while streaming?
- How does this interact with missiles in flight (the stream ship fires in Action Phase, missiles resolve in Missile Phase)?

### 6.6 — No Damage Type System (e.g., Energy vs. Kinetic vs. Explosive)
**Severity: LOW**

MOO1 doesn't have typed damage, and this game appears to follow that. But the `defense-systems.md` (stub doc) mentions "Armor: 5/space (Titanium) → 60/space (Adamantium Exo)" — "Adamantium Exo" is undefined. Also the shield/armor interaction is purely subtractive (no damage type resistance), which is fine if intentional. Worth a note that damage is untyped.

---

## 7. Inconsistent Terminology

### 7.1 — "Armor" vs. "Hull" Used Interchangeably
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

### 7.2 — "Hit Points" vs. "HP" vs. "Armor" vs. "Hull Points"
**Severity: MEDIUM**

The combat ship state JSON uses `current_hp` / `max_hp`. The hit feedback UI says "-60 Armor." Ship classes doc uses "Base Hits." Needs a single canonical term. (See 7.1.)

### 7.3 — "Combat Speed" vs. "Speed Rating" vs. "Maneuver Rating"
**Severity: MEDIUM**

`combat-algorithm.md` Section 6:
```
Movement_Points = Combat_Speed + Maneuver_Bonus
Combat_Speed = Engine_Combat_Speed
```

But Section 4 (initiative) uses `Engine_Maneuver_Rating`. The `tactical-combat-ui.md` turn order panel shows "Speed 5" to mean initiative order, but in the algorithm initiative uses a formula (not just speed). `combat-mechanics.md` says "Speed = Engine + Propulsion Tech + Combat Speed" — treating Speed and Combat Speed as different additive values. These need a clear glossary.

### 7.4 — "Battle Computer Rating" vs. "Attack Rating" vs. "Battle_Computer_Mark"
**Severity: LOW**

| Term | Used In |
|---|---|
| `battle_computer_rating` | `combat-mechanics.md` formula |
| `Attack_Rating` / `attack_rating` | `components-complete.md` |
| `Battle_Computer_Mark` | `combat-algorithm.md` Section 4 |
| `Battle_Scanner_Bonus` | `combat-algorithm.md` Section 4 |

These all refer to the same stat. Pick one term.

### 7.5 — "Maneuver Rating" Used Both for Defense and Initiative
**Severity: LOW**

Maneuver is simultaneously:
- A defense modifier (harder to hit): `target.maneuver_rating × 3%` in hit formula
- An initiative modifier: `Engine_Maneuver_Rating × 2` in initiative formula

Using the same stat for two different formulas with different coefficients (×3 vs ×2) is fine mechanically, but the term needs to be defined as a single property with explicit dual use, not two separate concepts.

### 7.6 — "ECM Level" vs. "Missile Defense" vs. "ECM Rating"
**Severity: LOW**

| Term | Used In |
|---|---|
| `ecm_rating` | `combat-algorithm.md` missile formula |
| `Missile Defense` / `missile_defense` | `components-complete.md` |
| `ECM Level` | `combat-mechanics.md`, `weapons-complete.md` |

All refer to the same stat. Standardize to one term.

---

## 8. Other Issues

### 8.1 — `weapons-systems.md` Is Effectively a Stub
**Severity: LOW**

`weapons-systems.md` is a very high-level summary (4 sections, ~30 lines) that adds nothing not already in `weapons-complete.md`. It also says Mauler Device "ignores shields," which contradicts `weapons-complete.md` where Mauler's special is `always_hits` (100% accuracy) — not shield bypass. Consider deleting this file or expanding it into something meaningful.

### 8.2 — `defense-systems.md` Is a Stub with Wrong Stats
**Severity: MEDIUM**

`defense-systems.md` says:
```
Shields HP: 25 (Class I) → 250 (Planetary)
Armor: 5/space (Titanium) → 60/space (Adamantium Exo)
ECM: -10% to -35% enemy hit chance
Point Defense: 30-70% per missile
```

None of these values match any other document:
- Shields aren't measured in "HP" (they absorb 1–15 damage per hit; they have `shields_current`/`shields_max` which are never defined)
- Armor doesn't have an HP-per-space value anywhere else
- "Adamantium Exo" is undefined (Adamantium exists, no "Exo" variant)
- ECM ranges don't match (ECM I = -5%, ECM X = -50%; not "-10% to -35%")
- Point defense success is calculated per-beam-weapon (10% per beam × attacks), not a flat 30–70%

This file appears to be an early draft that was superseded by `components-complete.md` but never updated.

### 8.3 — Missile "Racks" vs. "Ammo" Terminology
**Severity: LOW**

`weapons-complete.md` uses "Racks" (2 or 5 missiles per weapon mount). `combat-algorithm.md` uses `missile_ammo[weapon.id]` and `attacker.missile_ammo[weapon.id] -= 1`. The combat ship state JSON shows `missile_ammo: {}`. The term "rack" should map to the initial ammo value — but this is never stated. Do 2 racks mean 2 total missiles, or 2 missiles per firing that reload between battles?

### 8.4 — No Definition of "Optimal Range" for AI Movement
**Severity: LOW**

`combat-algorithm.md` AI movement (Sections 34, 25.3) calls `get_optimal_weapon_range(ship)` — a function referenced but never defined. It needs a definition: is it the max range of the ship's primary weapon? The average? The range at which DPS is maximized accounting for range penalties?

### 8.5 — Experience Thresholds Inconsistent Between Algorithm and Mechanics
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

### 8.6 — `apply_weapon_effects()` Is Called But Never Defined
**Severity: HIGH**

`combat-algorithm.md` Section 11:
```python
apply_weapon_effects(target, weapon, damage)
```

This function is called in `apply_damage()` but never defined anywhere in the document. It presumably handles `kills_crew`, `stream`, `chain_lightning`, `disable_engines`, etc. — but these mechanics are left as table entries with no pseudocode. This is a major implementation gap.

---

## Issues by Priority

### Must Fix (Blockers)
1. `base_hp_by_class` JSON uses role-based classes that don't exist — **1.8**
2. `shield_class` undefined on combat ship state — **2.3**
3. `experience_level` treated as numeric in formula — **2.5**
4. `apply_weapon_effects()` never defined — **8.6**
5. Crew stat not defined anywhere — **6.4**
6. Boarding mechanics entirely undefined — **4.7**
7. Ferret racial bonus: three conflicting values — **1.1**
8. Hit formula: `target_defense` undefined / conflicting formula — **2.1**

### Should Fix (High Friction)
9. Critical hit: 5% vs 10% base chance — **1.5**
10. Critical hit: 2× vs +50% damage — **1.6**
11. Chain lightning: 3 vs 4 targets — **1.4**
12. `halves_shields` / `ignores_half_shields` not implemented in `apply_damage()` — **6.2**
13. Hellfire Torpedo `bonus_vs_shields` undefined — **6.3**
14. Stasis Field: full freeze vs weapons-only — **4.1**
15. Tractor/Repulsor: UI says 2-hex pull, spec says 1-hex — **4.3**
16. Teleporter: unlimited range vs 5-hex limit in UI — **4.5**
17. UI phase structure doesn't match algorithm — **5.1, 5.2**
18. `combat_speed` not in combat ship state JSON — **2.4**
19. `stream` effect mechanics undefined — **6.5**
20. `armor_piercing` behavior described differently in two docs — **2.6**

### Nice to Fix (Cleanup)
21. Budgies defense: +5 level vs +3 flat — **1.3**
22. Hull space ranges inconsistent — **3.2**
23. Grid size: 15×15 vs 20×20 — **5.3**
24. Biological weapon "radioactive" invented by UI — **5.5**
25. Plasma Cannon fixed damage in UI — **5.6**
26. `defense-systems.md` stub with wrong stats — **8.2**
27. Terminology: hull/armor/HP — **7.1–7.2**
28. Terminology: combat speed/maneuver/speed — **7.3**
29. Terminology: BC rating/attack rating — **7.4**
30. Terminology: ECM level/missile defense — **7.6**
31. `weapons-systems.md` stub — **8.1**
32. Experience accuracy bonuses: values differ by 2× — **8.5**

---

*End of review. 32 issues identified.*
