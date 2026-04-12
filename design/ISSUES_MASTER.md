# Master Issues List - Hamster of Orion Design Review

**Generated:** 2026-04-12  
**Last Updated:** 2026-04-12  
**Total Issues:** ~135 across 6 review areas  
**Resolved:** 40 critical/high/medium issues

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

### Diplomacy (6) — ✅ 5 RESOLVED

| ID | Issue | Status |
|----|-------|--------|
| D-C1 | Hamsters trade bonus: 3 different values | ✅ **FIXED** — Unified to +25% everywhere |
| D-C2 | Hamsters diplomacy multiplier conflict | ✅ **FIXED** — Clarified: base 1.30, positive ×2.0, combined 2.60 |
| D-C3 | Ants espionage contradictory modifiers | ✅ **FIXED** — Now uses boolean flags consistently |
| D-C4 | Ants defense "Immune" vs "+100" | ✅ **FIXED** — Uses `immune_to_espionage: true` flag |
| D-C5 | Ferret spy formula missing term | 🔴 OPEN |
| D-C6 | Rats espionage +5 vs +15 | ✅ **FIXED** — Set to +0% (Psilons have no spy bonus in MOO1) |

### Combat (8) — ✅ 1 RESOLVED

| ID | Issue | Status |
|----|-------|--------|
| C-C1 | `base_hp_by_class` uses role-based classes | 🔴 OPEN |
| C-C2 | `shield_class` never defined | 🔴 OPEN |
| C-C3 | `experience_level` type mismatch | 🔴 OPEN |
| C-C4 | `apply_weapon_effects()` never written | 🔴 OPEN |
| C-C5 | Crew stat doesn't exist | 🔴 OPEN |
| C-C6 | Boarding/transporter undefined | 🔴 OPEN |
| C-C7 | Ferrets combat bonus 3-way conflict | ✅ **FIXED** — Set to +4 Attack Levels only (no damage bonus) |
| C-C8 | `target_defense` computed two ways | 🔴 OPEN |

### Mechanics (7) — ✅ 6 RESOLVED

| ID | Issue | Status |
|----|-------|--------|
| M-C1 | Cloning: Two different mechanics | ✅ **FIXED** — Unified to flat +2/+5 pop/turn, tech levels 11/22 |
| M-C2 | Soil Enrichment: Multiplier vs flat bonus | ✅ **FIXED** — Unified to flat +25/+50 bonus, tech levels 14/26 |
| M-C3 | Robotic Controls: Tech levels conflict | ✅ **FIXED** — MOO1 levels: RC II@1, III@8, IV@18, V@28, VI@38, VII@48 |
| M-C4 | Eco Restoration: Two incompatible formulas | ✅ **FIXED** — Unified cleanup_modifier, tech levels 1/4/11/22/29 |
| M-C5 | Terraforming: Tech levels differ | ✅ **FIXED** — MOO1 levels: +10@2, +20@6, +30@10, etc. through +120@46 |
| M-C6 | Miniaturization cap: 80% vs 50% | ✅ **FIXED** — Changed to 50% (MOO1 value) |
| M-C7 | `slider-mathematics.md` doesn't exist | ✅ **FIXED** — Created 524-line document |

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

### Species (5) — ✅ 3 RESOLVED

| ID | Issue | Status |
|----|-------|--------|
| SP-C1 | Budgies `Superior Pilots` wrong values | ✅ **FIXED** — Now +3 Defense AND +3 Initiative |
| SP-C2 | Ferrets `Deadly Accuracy` 3-way conflict | ✅ **FIXED** — Set to +4 Attack Levels (no damage bonus) |
| SP-C3 | 5 techs use invalid fields | 🔴 OPEN |
| SP-C4 | Hamsters missing from ai-personalities | ✅ **FIXED** — Added with Honorable Diplomat personality |
| SP-C5 | 3 starting techs undefined | 🔴 OPEN |

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

1. ~~**Resolve critical conflicts**~~ ✅ Race value conflicts resolved (11 issues fixed)
2. **Create missing docs** — Especially `slider-mathematics.md`
3. **Delete stale stubs** — `defense-systems.md`, `weapons-systems.md`
4. **Update PROJECT_STRUCTURE.md** — Make it accurate
5. **Standardize terminology** — One term per concept
6. **Add missing wireframes** — Pre-game, victory/defeat, High Council
7. **Define AI decision trees** — Currently zero AI logic defined

---

*Individual detailed reports contain full context and suggested fixes for each issue.*
