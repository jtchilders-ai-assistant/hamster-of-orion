# Species & Lore Review — Hamster of Orion

**Reviewer:** Wesley (subagent)  
**Date:** 2026-04-12  
**Second-pass fixes:** 2026-04-12 (all remaining 🔴 issues resolved)  
**Files Reviewed:**
- `design/LORE.md`
- `design/species/_TEMPLATE.md`
- `design/species/race-stats-complete.md`
- All 10 individual species files (`ants.md`, `budgies.md`, `chameleons.md`, `ferrets.md`, `guinea-pigs.md`, `hamsters.md`, `hermit-crabs.md`, `mice.md`, `rabbits.md`, `rats.md`)
- Cross-referenced: `galaxy/star-systems.md`, `technology/categories.md`, `technology/computers.md`, `technology/weapons.md`, `technology/propulsion.md`, `technology/construction.md`, `technology/force-fields.md`, `diplomacy/ai-personalities.md`

---

## Summary

10 species present — correct count matching MOO1's 10 races. All individual files use the complete template structure with no missing required sections. Most issues are **stat mismatches between individual files and `race-stats-complete.md`**, **invalid technology field names**, and **cross-document inconsistencies** with the tech docs.

Severity legend: 🔴 **Critical** (breaks implementation) | 🟡 **Moderate** (inconsistent, needs resolution) | 🔵 **Minor** (cosmetic, won't break gameplay)

---

## 1. Missing Species

**Result: None missing.** All 10 MOO1 equivalents are present:

| Race | MOO1 Equivalent |
|------|----------------|
| Hamsters | Humans ✓ |
| Ants | Klackons ✓ |
| Mice | Meklar ✓ |
| Rats | Psilons ✓ |
| Rabbits | Sakkra ✓ |
| Hermit Crabs | Silicoids ✓ |
| Guinea Pigs | Bulrathi ✓ |
| Ferrets | Mrrshan ✓ |
| Budgies | Alkari ✓ |
| Chameleons | Darloks ✓ |

---

## 2. Missing Required Template Fields

All 10 species files contain every required section from `_TEMPLATE.md`:
- Physical Description ✓
- Biology & Habitat ✓
- Culture & Society (Core Values, Government Type, Philosophy on War, View of Other Races) ✓
- Gameplay Mechanics (Racial Bonuses, Special Abilities, Starting Technologies, Unique Units/Buildings/Technologies) ✓
- AI Behavior (Personality Archetype, Diplomatic Tendencies, Strategic Priorities, War Behavior) ✓
- Flavor & Personality (Leader Names, Ship Names, Planet Names, Quotes) ✓
- Design Notes ✓
- Repurposed Ancient Technology ✓

**One extra section found:** `hermit-crabs.md` has an additional `## Unique Gameplay Note` section not in the template. This is additive and fine — just note it as a precedent if other species need special clarifications.

---

## 3. Stat Mismatches: Individual Files vs. `race-stats-complete.md`

### ✅ BUDGIES — Superior Pilots ability — **FIXED 2026-04-12**

| Source | Description |
|--------|-------------|
| `budgies.md` | ~~All ships gain **+1 combat initiative** and +20% evasion~~ → **+3 combat initiative, +3 Defense Levels, and +20% evasion** |
| `race-stats-complete.md` | All ships gain **+3 combat initiative, +3 defense level**, and +20% evasion |

Fixed: `budgies.md` updated to match `race-stats-complete.md` (MOO1 Alkari: +3 Defense, +3 Initiative).

### ✅ FERRETS — Deadly Accuracy ability — **FIXED 2026-04-12**

| Source | Description |
|--------|-------------|
| `ferrets.md` | ~~All weapons deal **+25% damage** and have better hit chance~~ → **+4 Attack Levels (hit chance only, no damage bonus)** |
| `race-stats-complete.md` | ~~+4 Attack Level and deal **+15% damage** on hit~~ → **+4 Attack Levels only** |
| `technology/categories.md` | ~~"All weapons deal **+25% damage**"~~ → **"+4 Attack Levels (hit chance bonus, not damage)"** |

Fixed: MOO1 Mrrshan get **only +4 Attack Levels** — no damage bonus. All three documents corrected. The `damage_bonus_percent` field removed from `race-stats-complete.md` JSON.

### ✅ ANTS — Espionage stat representation — FIXED 2026-04-12

| Source | Value |
|--------|-------|
| `ants.md` | "Immune (hive mind cannot be infiltrated)" |
| `race-stats-complete.md` JSON | `espionage: 0` (with Hive Mind ability providing immunity) |
| `race-stats-complete.md` summary table | `0*` with footnote |

Functionally these are equivalent — the immunity comes from the `hive_mind` special ability rather than the stat. However, `ants.md` says "Immune" under the Racial Bonuses section where the template expects a numeric value. Consider changing the individual file's bonus to `0` with a note pointing to the Hive Mind ability, matching the approach in `race-stats-complete.md`.

### ✅ ANTS — Expendable Units ability — FIXED 2026-04-12

`ants.md` says: "Ships and troops cost less to produce"  
`race-stats-complete.md` specifies: **10% cost reduction**

Individual file omits the specific value. Not a contradiction but should be updated for consistency.

### ✅ HAMSTERS — Female leader names — FIXED 2026-04-12

| Source | Female Names |
|--------|-------------|
| `hamsters.md` | Daisy, Peanut, Cinnamon, Honey, Marble (5 names) |
| `race-stats-complete.md` | Daisy, Peanut, Cinnamon, Honey, Marble, **Biscuit** (6 names) |

`hamsters.md` is missing "Biscuit."

### ✅ BUDGIES — Female leader names — FIXED 2026-04-12

| Source | Female Names |
|--------|-------------|
| `budgies.md` | Breezewhisper, Draftrider, Updraft, Skyweaver (4 names) |
| `race-stats-complete.md` | Breezewhisper, Draftrider, Updraft, Skyweaver, **Zephyr** (5 names) |

`budgies.md` is missing "Zephyr."

### 🔵 DUPLICATE LEADER NAMES across species

- **"Daisy"**: Both Hamsters (female) and Rabbits (female) — `race-stats-complete.md`
- **"Shadow"**: Both Ferrets (female) and Chameleons (female) — `race-stats-complete.md`

These names are unlikely to cause implementation bugs but could confuse players seeing the same name for different race leaders. Consider replacing one instance of each.

---

## 4. Invalid Technology Field Names — ✅ FIXED 2026-04-12

`race-stats-complete.md` previously referenced three technology fields that don't exist in the 6-field tech system. All corrected:

| Race | Unique Technology | Old Field (Invalid) | New Field (Valid) |
|------|------------------|---------------------|-------------------|
| Hamsters | Cultural Exchange Program | ~~`sociology`~~ | `planetology` |
| Ants | Pheromone Control | ~~`sociology`~~ | `planetology` |
| Rats | Unified Field Theory | ~~`physics`~~ | `force_fields` |
| Rabbits | Genetic Vitality | ~~`biology`~~ | `planetology` |
| Guinea Pigs | Battle Frenzy | ~~`biology`~~ | `weapons` |

---

## 5. Starting Technologies — Cross-document Conflicts — ✅ FIXED 2026-04-12

**Resolution applied:** Tech docs now clarify that "universal" starting techs are the *baseline* available to all races, not the race-specific starting loadout. Race-specific starting tech lists in `race-stats-complete.md` represent equipped loadouts which may include superior versions of universal techs.

| Tech Doc | Universal Baseline | Fix Applied |
|----------|-------------------|-------------|
| `weapons.md` | Laser + Nuclear Missile | ✅ Clarified: baseline only; race loadouts may differ |
| `propulsion.md` | Retro Engines + Standard Fuel Cells | ✅ Clarified: baseline only |
| `construction.md` | Titanium Armor + Standard Construction | ✅ Clarified: listing it highlights an asset, not exclusivity |
| `computers.md` | Battle Computer I + **Robotic Controls I** | ✅ Fixed: universal baseline RC-II → RC-I; Mice start at RC-III via Cybernetic Workers |
| `force-fields.md` | Class I Deflector Shield | ✅ Clarified: universal baseline; listing it doesn't claim exclusivity |

### ✅ Undefined starting techs — resolved:

| Tech ID | Used By | Resolution |
|---------|---------|------------|
| ~~`standard_missiles`~~ | Hamsters | ✅ Renamed to `nuclear_missile` (matches weapons.md ID) |
| ~~`standard_colony_base`~~ | Rats | ✅ Renamed to `colony_base` |
| ~~`stealth_suit`~~ | Chameleons | ✅ Renamed to `cloaking_device` (matches force-fields.md) |

- `laser_cannon` (Ferrets) — naming inconsistency with `laser` in weapons.md; deferred to Issue #14 (ID standardization pass).

### 🟡 Chameleons' starting `hyper_x_rockets` appears unbalanced

Chameleons start with Hyper-X Rockets (tier 7 weapon), which is significantly more advanced than any other race's starting weapons (most start at tier 1-4). This may be intentional (spy-race needs fast scouts) but warrants balance review. No other race starts with a tier 7+ weapon.

---

## 6. Homeworld Planet Types vs. `star-systems.md`

Valid planet types from `star-systems.md`: Gaia, Terran, Jungle, Ocean, Arid, Steppe, Desert, Minimal, Tundra, Barren, Dead, Inferno, Toxic, Radiated.

| Race | `race-stats-complete.md` Type | Status |
|------|-------------------------------|--------|
| Hamsters | `terran` | ✓ |
| Ants | `arid` | ✓ |
| Mice | `terran` | ✓ |
| Rats | `terran` | ✓ |
| Rabbits | `terran` | ✓ |
| Hermit Crabs | `radiated` | ✓ |
| Guinea Pigs | `terran` | ✓ |
| Ferrets | `terran` | ✓ |
| Budgies | `terran` | ✓ |
| Chameleons | `jungle` | ✓ |

All homeworld types are valid. However, several `special` field values are used (`mineral_rich`, `artifacts`, `fertile`, `mineral_ultra_rich`, `high_gravity`, `low_gravity`) that are **not defined in `star-systems.md`**. The doc only mentions "Artifacts Worlds" explicitly. The other special types (`mineral_rich`, `fertile`, `high_gravity`, `low_gravity`, `mineral_ultra_rich`) need to be documented in `star-systems.md` or `galaxy/generation-algorithm.md`.

### 🟡 Homeworld description inconsistency — Mice

| Source | Description |
|--------|-------------|
| `mice.md` | "Ecumenopolis — entirely covered in factories and labs" |
| `race-stats-complete.md` | `type: terran`, `climate: controlled` |

An ecumenopolis is a city-planet, not a standard Terran world. This is a lore/mechanical disconnect. Either the planet type should reflect the description (perhaps `minimal` or a unique type) or the lore description should be softened to fit a terran world.

### 🟡 Climate field not defined anywhere

`race-stats-complete.md` includes a `climate` field for homeworlds (`temperate`, `dry`, `humid`, `controlled`, `hostile`) that is not defined in `star-systems.md` or any other design doc. If this field drives gameplay (e.g., affects colonization bonuses), it needs a spec.

---

## 7. Lore References Without Mechanical Definitions

### 🟡 Rabbits' hyperspace intuition (LORE.md)

`LORE.md` states: *"Rabbits discovered they could calculate hyperspace coordinates intuitively."*

There is **no corresponding mechanic** in `rabbits.md` or `race-stats-complete.md`. This implies some navigation/exploration advantage (faster travel, better range, or reduced exploration fog) but none exists. Either add a mechanic or soften the lore claim.

### 🔵 Chameleons and human disappearance

`LORE.md` says: *"The Chameleons hint at darker possibilities [about humanity's disappearance] but refuse to elaborate."*

No mechanic, unique event, or AI dialog is defined for this. This is probably intentional mystery, but if it's meant to drive a narrative event or unique Chameleon intel ability, it needs a design doc entry.

### 🔵 Budgies' Orion belief vs. abilities

`LORE.md` describes Budgies believing Orion opens only to those who "navigate the perfect three-dimensional approach pattern." No mechanic gives Budgies any advantage in reaching or accessing Orion. Lore-only flavor is fine, but worth noting.

---

## 8. Cross-Document Inconsistencies (Non-Stats)

### ✅ Hamsters in `diplomacy/ai-personalities.md` — Already Present (Review Error 2026-04-12)

Hamsters **are present** in `diplomacy/ai-personalities.md` as the first entry ("The Honorable Diplomats"). The original review incorrectly stated they were absent. No change needed.

### ✅ Budgies: +1 movement range — FIXED 2026-04-12

The +1 movement range from `categories.md` has been added to `budgies.md` (as "Extended Range" special ability) and `race-stats-complete.md` (as `propulsion_bonus` field).

### ✅ Ferrets: damage bonus inconsistency — **FIXED 2026-04-12**

MOO1 Mrrshan have **no damage bonus** — only +4 Attack Levels (hit chance). All three documents corrected:
- `ferrets.md`: removed damage claim, now shows +4 Attack Levels only
- `race-stats-complete.md`: removed `damage_bonus_percent` from JSON, updated `moo1_note`
- `technology/categories.md`: updated to "+4 Attack Levels (hit chance bonus, not damage)"

### 🔵 Naming inconsistency: weapon IDs

| Used in race-stats | Defined in tech docs |
|-------------------|---------------------|
| `laser_cannon` | `laser` (weapons.md ID) |
| `class_1_shield` | `class_i_deflector_shield` (implied by naming convention) |
| `ecm_jammer_1` | `ecm_jammer_i` or similar |
| `research_lab_1` | `research_lab` (research-formulas.md ID) |

Tech IDs should be standardized. The `_1` suffix convention in `race-stats-complete.md` differs from the snake_case IDs in the individual tech docs.

### 🔵 Ants: AI ally misrepresentation

- `ants.md` says "Natural Allies: None (cannot truly 'ally' with non-hive entities)"
- `race-stats-complete.md` JSON: `natural_allies: []`
- These are consistent.
- But `mice.md` lists Ants as a natural ally for Mice, and `race-stats-complete.md` confirms `mice.allies = ["ants", "rats"]`.

The relationship is one-way in the JSON: Mice consider Ants allies, but Ants don't consider Mice allies. This may be intentional (reflecting the hive's alien worldview) but should be explicitly noted in the AI behavior docs to avoid implementation confusion.

---

## 9. Balance Observations (Informational Only)

These are not bugs but may warrant design review:

- **Ferrets** have only **one penalty** (-10% diplomacy) against five positive stats. Most other races have 2–3 penalties. Combined with their Deadly Accuracy and First Strike abilities, they may be overtuned relative to other combat races.

- **Budgies** have **four penalties** (-10% production, -10% food, -20% ground combat, -10% espionage) against only one positive (ship combat +50%). This is the most lopsided ratio in the game — intentional as a specialist race, but extreme.

- **Chameleons** start with `hyper_x_rockets` (tier 7), far ahead of any other race's starting weapon tier. This gives them a significant early military deterrent despite being a non-combat race.

- **Hamsters** AI in `race-stats-complete.md` has `natural_allies: []` but the individual file says "All races (tries to befriend everyone)." This is a data model limitation — the intention doesn't map cleanly to the ally list. The diplomacy bonus and `universal_diplomat` ability capture the intent mechanically, but the null ally list could cause the AI to not prioritize Hamsters as partners.

---

## 10. Issues Requiring Immediate Attention (Priority List)

| # | Issue | Severity | File(s) |
|---|-------|----------|---------|
| 1 | ~~Budgies `Superior Pilots` ability understated in individual file~~ | ✅ FIXED | `budgies.md` |
| 2 | ~~Ferrets `Deadly Accuracy` 3-way inconsistency~~ | ✅ FIXED | `ferrets.md`, `categories.md`, `race-stats-complete.md` |
| 3 | ~~5 unique technologies use invalid tech field names (`sociology`, `physics`, `biology`)~~ | ✅ FIXED 2026-04-12 | `race-stats-complete.md` |
| 4 | ~~Hamsters missing from `ai-personalities.md`~~ | ✅ FIXED (was already present — review error) | `diplomacy/ai-personalities.md` |
| 5 | ~~`standard_missiles`, `standard_colony_base`, `stealth_suit` not defined in any tech doc~~ | ✅ FIXED 2026-04-12 | `race-stats-complete.md` |
| 6 | ~~Universal starting tech claims in tech docs conflict with race-specific lists~~ | ✅ FIXED 2026-04-12 | All tech docs + `race-stats-complete.md` |
| 7 | ~~Mice Robotic Controls starting level inconsistency (RC-I vs RC-II universal baseline)~~ | ✅ FIXED 2026-04-12 | `computers.md`, `race-stats-complete.md` |
| 8 | ~~Budgies +1 movement range in `categories.md` absent from species docs~~ | ✅ FIXED 2026-04-12 | `budgies.md`, `race-stats-complete.md` |
| 9 | Homeworld `special` field values not defined in `star-systems.md` | 🟡 DEFERRED — needs `star-systems.md` expansion; not a blocker | `star-systems.md`, `race-stats-complete.md` |
| 10 | Rabbits' hyperspace intuition (LORE) has no mechanical definition | 🟡 DEFERRED — lore/design decision needed | `LORE.md`, `rabbits.md` |
| 11 | Mice homeworld lore ("Ecumenopolis") contradicts `type: terran` | 🟡 DEFERRED — lore/design decision needed | `mice.md`, `race-stats-complete.md` |
| 12 | `climate` field in homeworld spec not defined anywhere | 🟡 DEFERRED — needs spec doc; not a blocker | `race-stats-complete.md`, `star-systems.md` |
| 13 | ~~Ants espionage represented as `Immune` vs numeric 0 in individual file~~ | ✅ FIXED 2026-04-12 | `ants.md` |
| 14 | Weapon ID naming inconsistency (`laser_cannon` vs `laser`, etc.) | 🟡 DEFERRED — needs ID standardization pass across all tech docs | `race-stats-complete.md`, tech docs |
| 15 | Duplicate leader names: Daisy (Hamsters/Rabbits), Shadow (Ferrets/Chameleons) | 🔵 Noted in `race-stats-complete.md` with `_note` fields — design decision deferred | `race-stats-complete.md` |
| 16 | ~~Hamsters/Budgies missing 1 female leader name each vs `race-stats-complete.md`~~ | ✅ FIXED 2026-04-12 | `hamsters.md`, `budgies.md` |
| 17 | ~~Ants `Expendable Units` lacks specific value in individual file~~ | ✅ FIXED 2026-04-12 | `ants.md` |

---

*Generated by species review subagent — 2026-04-12*
