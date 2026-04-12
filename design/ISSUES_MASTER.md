# Master Issues List - Hamster of Orion Design Review

**Generated:** 2026-04-12  
**Total Issues:** ~135 across 6 review areas

This document consolidates all critical and high-priority issues found during the comprehensive design review. Individual detailed reports are in their respective directories.

---

## Summary by Area

| Area | Issues | Report Location |
|------|--------|-----------------|
| Diplomacy & AI | 36 | `diplomacy/REVIEW_DIPLOMACY.md` |
| Combat & Ships | 32 | `ships/REVIEW_COMBAT.md` |
| Game Mechanics | 45 | `REVIEW_MECHANICS.md` |
| Project Structure | 4 critical | `REVIEW_STRUCTURE.md` |
| UI/UX | 5 critical + 8 gaps | `ui-ux/REVIEW_GAPS.md` |
| Species & Lore | 17 | `species/REVIEW_SPECIES.md` |

---

## 🔴 CRITICAL ISSUES (Implementation Blockers)

### Diplomacy (6)

| ID | Issue | Files Affected |
|----|-------|----------------|
| D-C1 | Hamsters trade bonus: 3 different values (+50%, +25%, +20%) | `trade.md`, `hamsters.md`, `race-stats-complete.md` |
| D-C2 | Hamsters diplomacy multiplier: 1.30 vs 1.60 in worked example | `relationship-formulas.md` |
| D-C3 | Ants espionage: both "-100 modifier" AND "can't conduct" — contradictory | `espionage.md`, `ants.md` |
| D-C4 | Ants defense: "Immune" vs "+100 bonus" — different implementations | `espionage.md` |
| D-C5 | Ferret spy formula has 5 terms but spec only defines 4 | `espionage.md` |
| D-C6 | Rats espionage: +5 in one doc, +15 in two others | `espionage.md`, `rats.md`, `race-stats-complete.md` |

### Combat (8)

| ID | Issue | Files Affected |
|----|-------|----------------|
| C-C1 | `base_hp_by_class` uses role-based classes but game only has 4 hull sizes | `combat-algorithm.md` |
| C-C2 | `shield_class` referenced in damage calc but never defined | `combat-algorithm.md` |
| C-C3 | `experience_level` is string in one place, multiplied as number elsewhere | `combat-mechanics.md`, `combat-algorithm.md` |
| C-C4 | `apply_weapon_effects()` called but never written | `combat-algorithm.md` |
| C-C5 | Crew stat doesn't exist on ships despite weapons referencing it | `weapons-complete.md` |
| C-C6 | Boarding/transporter mechanics have zero definition | Multiple |
| C-C7 | Ferrets combat bonus: +15%, +25%, +30% in three different docs | `ferrets.md`, `race-stats-complete.md`, `categories.md` |
| C-C8 | `target_defense` computed two different ways | `combat-algorithm.md`, `combat-mechanics.md` |

### Mechanics (7)

| ID | Issue | Files Affected |
|----|-------|----------------|
| M-C1 | Cloning: Two different mechanics — flat pop/turn vs BC-per-million | `population-growth.md`, `planetology.md` |
| M-C2 | Soil Enrichment: Multiplier vs size+growth, different tech levels | `population-growth.md`, `planetology.md` |
| M-C3 | Robotic Controls: Tech levels totally different (starting vs level-10) | `factory-formulas.md`, `computers.md` |
| M-C4 | Eco Restoration: Two incompatible formulas | `factory-formulas.md`, `planetology.md` |
| M-C5 | Terraforming: Only +10 matches; +20 through +120 all differ | `population-growth.md`, `planetology.md` |
| M-C6 | Miniaturization cap: 80% vs 50% (MOO1 used 50%) | `ship-costs.md`, `research-formulas.md` |
| M-C7 | `slider-mathematics.md` referenced everywhere but **doesn't exist** | Multiple |

### Structure (4)

| ID | Issue | Files Affected |
|----|-------|----------------|
| S-C1 | PROJECT_STRUCTURE.md is stale: 15 files don't exist, 27 not listed | `PROJECT_STRUCTURE.md` |
| S-C2 | `dark_sectors` region defined but never assigned in generation | `space-regions.md`, `generation-algorithm.md` |
| S-C3 | Hermit Crabs/Ants homeworld: Lore says radiated/arid, code forces terran | `hermit-crabs.md`, `ants.md`, `generation-algorithm.md` |
| S-C4 | "Five paths to victory" wrong — doc explicitly says 2 | `PROJECT_STRUCTURE.md` |
| S-C5 | Star color "Orange" vs "Green" — same slot, different names | `star-systems.md`, `generation-algorithm.md` |

### UI/UX (5)

| ID | Issue | Files Affected |
|----|-------|----------------|
| U-C1 | MAP button: 3 docs describe it 3 different ways | `command_menu_map.md`, `navigation-flow.md`, `state-transitions.md` |
| U-C2 | F7 Reports screen: Listed but missing from command bar | `state-transitions.md`, `navigation-flow.md` |
| U-C3 | Tech/Fleet "no command bar" but nav matrix allows F-keys | `state-transitions.md` |
| U-C4 | Research: 6 simultaneous sliders vs one-at-a-time | `screen-inventory.md`, wireframes |
| U-C5 | Keyboard conflicts: G, R, F, D assigned to multiple actions | `navigation-flow.md` |

### Species (5)

| ID | Issue | Files Affected |
|----|-------|----------------|
| SP-C1 | Budgies `Superior Pilots`: Missing +3 defense, wrong initiative | `budgies.md`, `race-stats-complete.md` |
| SP-C2 | Ferrets `Deadly Accuracy`: Three-way conflict (+25% vs +15%+4AL vs +25%) | `ferrets.md`, `race-stats-complete.md`, `categories.md` |
| SP-C3 | 5 unique techs use invalid fields (sociology, physics, biology) | Multiple species files |
| SP-C4 | Hamsters missing from `ai-personalities.md` entirely | `ai-personalities.md` |
| SP-C5 | 3 starting techs undefined in tech docs | Tech docs, species files |

---

## 🟠 HIGH PRIORITY ISSUES

### Diplomacy (8)
- Trade formula has undefined variables (production, distance)
- Council bonus applied inconsistently
- Bribery formula dimensionally odd
- **No AI decision trees** for production, colony, tech, treaties
- Government type modifier never defined
- Frame job success/detection interaction unclear
- Assassination LeaderProtection not integrated
- Double agent loyalty formula has no floor/ceiling

### Combat (Notable)
- `defense-systems.md` and `weapons-systems.md` are stale stubs — should be deleted
- Tactical UI wireframe introduces mechanics not in design docs
- "Hull", "Armor", "HP" used interchangeably with no distinction

### Mechanics (13)
- Bio weapon kill-rate defined three different ways
- Hull class tables can't be reconciled
- 14 referenced documents don't exist

### UI/UX (8 gaps)
- No wireframes: pre-game, diplomacy detail, planet management, victory/defeat, High Council
- Missing specs: ground combat, spy network, save/load, random events
- Population transfer and fleet split never wireframed
- Planetary bombardment missing from combat state machine

---

## 🟡 TERMINOLOGY INCONSISTENCIES

These appear throughout the docs and should be standardized:

| Inconsistent Terms | Should Be |
|-------------------|-----------|
| "Research Screen" / "Technology Screen" | Pick one |
| "Fleet Command" / "Fleet Screen" | Pick one |
| "Biotechnology" / "Planetology" | Planetology (MOO1) |
| "Hull" / "Armor" / "HP" | Define each clearly |
| Game Menu (3 different names) | Pick one |
| Star color "Orange" / "Green" | Pick one |

---

## 📋 MISSING DOCUMENTS

Referenced but don't exist:
1. `slider-mathematics.md` — **Critical**, referenced everywhere
2. Multiple tech docs have gaps
3. 14+ other referenced documents

---

## Next Steps

1. **Resolve critical conflicts** — Pick canonical values for all the 3-way inconsistencies
2. **Create missing docs** — Especially `slider-mathematics.md`
3. **Delete stale stubs** — `defense-systems.md`, `weapons-systems.md`
4. **Update PROJECT_STRUCTURE.md** — Make it accurate
5. **Standardize terminology** — One term per concept
6. **Add missing wireframes** — Pre-game, victory/defeat, High Council
7. **Define AI decision trees** — Currently zero AI logic defined

---

*Individual detailed reports contain full context and suggested fixes for each issue.*
