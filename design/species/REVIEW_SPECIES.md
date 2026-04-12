# Species & Lore Review — Hamster of Orion

**Reviewer:** Wesley (subagent)  
**Date:** 2026-04-12  
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

### 🔴 BUDGIES — Superior Pilots ability

| Source | Description |
|--------|-------------|
| `budgies.md` | All ships gain **+1 combat initiative** and +20% evasion |
| `race-stats-complete.md` | All ships gain **+3 combat initiative, +3 defense level**, and +20% evasion |

The individual file is missing "+3 defense level" and understates initiative by 2. The JSON in `race-stats-complete.md` also carries the `moo1_note` ("Matches Alkari +3 Defense AND +3 Initiative bonuses"), suggesting that document is authoritative. **The individual file needs updating.**

### 🔴 FERRETS — Deadly Accuracy ability

| Source | Description |
|--------|-------------|
| `ferrets.md` | All weapons deal **+25% damage** and have better hit chance |
| `race-stats-complete.md` | All weapons have **+4 Attack Level** and deal **+15% damage** on hit |
| `technology/categories.md` | "All weapons deal **+25% damage**" |

Three-way inconsistency. `race-stats-complete.md` has the most specific definition (with `moo1_note` citing Mrrshan equivalence). `categories.md` matches the old `ferrets.md` figure of +25%. Recommend settling on the `race-stats-complete.md` version (+4 Attack Level, +15% damage) as canonical and updating both `ferrets.md` and `categories.md`.

### 🟡 ANTS — Espionage stat representation

| Source | Value |
|--------|-------|
| `ants.md` | "Immune (hive mind cannot be infiltrated)" |
| `race-stats-complete.md` JSON | `espionage: 0` (with Hive Mind ability providing immunity) |
| `race-stats-complete.md` summary table | `0*` with footnote |

Functionally these are equivalent — the immunity comes from the `hive_mind` special ability rather than the stat. However, `ants.md` says "Immune" under the Racial Bonuses section where the template expects a numeric value. Consider changing the individual file's bonus to `0` with a note pointing to the Hive Mind ability, matching the approach in `race-stats-complete.md`.

### 🟡 ANTS — Expendable Units ability (vague in individual file)

`ants.md` says: "Ships and troops cost less to produce"  
`race-stats-complete.md` specifies: **10% cost reduction**

Individual file omits the specific value. Not a contradiction but should be updated for consistency.

### 🔵 HAMSTERS — Female leader names (count mismatch)

| Source | Female Names |
|--------|-------------|
| `hamsters.md` | Daisy, Peanut, Cinnamon, Honey, Marble (5 names) |
| `race-stats-complete.md` | Daisy, Peanut, Cinnamon, Honey, Marble, **Biscuit** (6 names) |

`hamsters.md` is missing "Biscuit."

### 🔵 BUDGIES — Female leader names (count mismatch)

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

## 4. Invalid Technology Field Names

`race-stats-complete.md` references three technology fields that don't exist in the 6-field tech system defined in `technology/categories.md` (Weapons, Propulsion, Construction, Computers, Force Fields, Planetology):

| Race | Unique Technology | Invalid Field | Suggested Field |
|------|------------------|---------------|-----------------|
| Hamsters | Cultural Exchange Program | `sociology` | Planetology (social/colony tech) |
| Ants | Pheromone Control | `sociology` | Planetology (population control) |
| Rats | Unified Field Theory | `physics` | Force Fields or Weapons (energy physics) |
| Rabbits | Genetic Vitality | `biology` | Planetology (population/ecology) |
| Guinea Pigs | Battle Frenzy | `biology` | Weapons (combat enhancement) |

🔴 **These fields are unimplementable as-is.** Each unique technology must be assigned to one of the 6 valid tech categories before tech tree implementation can proceed.

---

## 5. Starting Technologies — Cross-document Conflicts

Multiple tech docs claim universal starting techs that contradict the per-race starting tech lists in `race-stats-complete.md`:

| Tech Doc | Claims as Universal Start |
|----------|--------------------------|
| `weapons.md` | Laser + Nuclear Missile |
| `propulsion.md` | Retro Engines + Standard Fuel Cells |
| `construction.md` | Titanium Armor + Standard Construction |
| `computers.md` | Battle Computer I + Robotic Controls II |
| `force-fields.md` | Class I Deflector Shield |

But `race-stats-complete.md` gives each race a distinct 4-tech starting set — and many races have *better* versions (Nuclear Engines instead of Retro Engines, Ion Drives for Budgies, etc.). Some races don't list these "universal" techs at all.

**Resolution needed:** Are the "universal start" claims in tech docs referring to techs that all races have access to at game start (regardless of the race-specific list), or are they outdated? If universal techs exist alongside the 4 race-specific ones, the race-stats doc should document this explicitly.

### 🔴 Specific conflicts:

- **`computers.md`** says all races start with **Robotic Controls II**, but `race-stats-complete.md` gives Mice **`robotic_controls_1`** (Mark I) as their race-specific starting tech. If all races start at RC-II, Mice should list RC-III (their +2 bonus over baseline) — or the universal start should be RC-I and Mice begin at RC-III.

- **Hamsters** list `titanium_armor` as a special starting tech, but `construction.md` says all races start with it. If it's universal, it wastes one of Hamsters' 4 race-specific slots.

- **Budgies** and **Ferrets** list `class_1_shield` as a starting tech, but `force-fields.md` says all races start with it.

### 🟡 Undefined/missing starting techs:

The following techs appear in `race-stats-complete.md` starting lists but have no entry in any tech doc:

| Tech ID | Used By | Status |
|---------|---------|--------|
| `standard_missiles` | Hamsters | ❌ Not found in tech docs (only "Nuclear Missile" exists in weapons.md) |
| `standard_colony_base` | Rats | ❌ Not found in tech docs |
| `stealth_suit` | Chameleons | ❌ Not found in any tech doc (only in species files) |

- `laser_cannon` (Ferrets) — weapons.md only defines `"id": "laser"`, not `laser_cannon`. Naming inconsistency.

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

### 🔴 Hamsters missing from `diplomacy/ai-personalities.md`

Nine of the ten races have dedicated sections in `diplomacy/ai-personalities.md`:
Budgies, Guinea Pigs, Chameleons, Ants, Mice, Ferrets, Rats, Rabbits, Hermit Crabs.

**Hamsters are entirely absent.** This is the most diplomatically complex race and arguably the most important for the AI personality doc. This needs to be added.

### 🟡 Budgies: +1 movement range in `categories.md` not in species files

`technology/categories.md` under Propulsion race specializations states:
> "Budgies: +1 movement range on all ships"

This ability does **not appear** in `budgies.md` or `race-stats-complete.md`. Either:
- It's a real ability that was accidentally omitted from the species docs, or
- `categories.md` is outdated (maybe this was replaced by the evasion/initiative bonuses).

Needs resolution — if real, add it to `budgies.md` and `race-stats-complete.md`.

### 🟡 Ferrets: damage bonus inconsistency across three documents

| Document | Ferret weapon damage bonus |
|----------|---------------------------|
| `ferrets.md` | +25% damage |
| `race-stats-complete.md` | +15% damage on hit (plus +4 Attack Level) |
| `technology/categories.md` | +25% damage |

`race-stats-complete.md` is the most detailed and carries the MOO1 alignment note. Recommend that as canonical; update the other two.

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
| 1 | Budgies `Superior Pilots` ability understated in individual file | 🔴 | `budgies.md` |
| 2 | Ferrets `Deadly Accuracy` 3-way inconsistency | 🔴 | `ferrets.md`, `categories.md`, `race-stats-complete.md` |
| 3 | 5 unique technologies use invalid tech field names (`sociology`, `physics`, `biology`) | 🔴 | `race-stats-complete.md` |
| 4 | Hamsters missing from `ai-personalities.md` | 🔴 | `diplomacy/ai-personalities.md` |
| 5 | `standard_missiles`, `standard_colony_base`, `stealth_suit` not defined in any tech doc | 🔴 | `race-stats-complete.md` + tech docs |
| 6 | Universal starting tech claims in tech docs conflict with race-specific lists | 🔴 | All tech docs + `race-stats-complete.md` |
| 7 | Mice Robotic Controls starting level inconsistency (RC-I vs RC-II universal baseline) | 🔴 | `computers.md`, `race-stats-complete.md` |
| 8 | Budgies +1 movement range in `categories.md` absent from species docs | 🟡 | `categories.md`, `budgies.md`, `race-stats-complete.md` |
| 9 | Homeworld `special` field values not defined in `star-systems.md` | 🟡 | `star-systems.md`, `race-stats-complete.md` |
| 10 | Rabbits' hyperspace intuition (LORE) has no mechanical definition | 🟡 | `LORE.md`, `rabbits.md` |
| 11 | Mice homeworld lore ("Ecumenopolis") contradicts `type: terran` | 🟡 | `mice.md`, `race-stats-complete.md` |
| 12 | `climate` field in homeworld spec not defined anywhere | 🟡 | `race-stats-complete.md`, `star-systems.md` |
| 13 | Ants espionage represented as `Immune` vs numeric 0 in individual file | 🟡 | `ants.md` |
| 14 | Weapon ID naming inconsistency (`laser_cannon` vs `laser`, etc.) | 🟡 | `race-stats-complete.md`, tech docs |
| 15 | Duplicate leader names: Daisy (Hamsters/Rabbits), Shadow (Ferrets/Chameleons) | 🔵 | `race-stats-complete.md` |
| 16 | Hamsters/Budgies missing 1 female leader name each vs `race-stats-complete.md` | 🔵 | `hamsters.md`, `budgies.md` |
| 17 | Ants `Expendable Units` lacks specific value in individual file | 🔵 | `ants.md` |

---

*Generated by species review subagent — 2026-04-12*
