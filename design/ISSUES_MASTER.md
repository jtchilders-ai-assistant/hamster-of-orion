# Master Issues List - Hamster of Orion Design Review

**Generated:** 2026-04-12  
**Last Updated:** 2026-04-18  
**Total Issues:** ~135 across 6 review areas  
**Resolved:** All critical issues (31/31) + High/Medium + MOO1 fidelity fixes
**Status:** ✅ COMPLETE — All critical issues resolved across all 6 areas

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

### Diplomacy (6) — ✅ 6 RESOLVED

| ID | Issue | Status |
|----|-------|--------|
| D-C1 | Hamsters trade bonus: 3 different values | ✅ **FIXED** — Unified to +25% everywhere |
| D-C2 | Hamsters diplomacy multiplier conflict | ✅ **FIXED** — Clarified: base 1.30, positive ×2.0, combined 2.60 |
| D-C3 | Ants espionage contradictory modifiers | ✅ **FIXED** — Now uses boolean flags consistently |
| D-C4 | Ants defense "Immune" vs "+100" | ✅ **FIXED** — Uses `immune_to_espionage: true` flag |
| D-C5 | Ferret spy formula missing term | ✅ **FIXED** — Added `racial_aggression_multiplier` (Ferrets: 1.10×) to SpyEffectiveness formula |
| D-C6 | Rats espionage +5 vs +15 | ✅ **FIXED** — Set to +0% (Psilons have no spy bonus in MOO1) |

### Combat (8) — ✅ ALL RESOLVED

| ID | Issue | Status |
|----|-------|--------|
| C-C1 | `base_hp_by_class` uses role-based classes | ✅ **FIXED** — Already had correct 4-class table |
| C-C2 | `shield_class` never defined | ✅ **FIXED** — Added to combat ship state |
| C-C3 | `experience_level` type mismatch | ✅ **FIXED** — Added numeric mapping dict |
| C-C4 | `apply_weapon_effects()` never written | ✅ **FIXED** — Full pseudocode added |
| C-C5 | Crew stat doesn't exist | ✅ **FIXED** — crew_current/max + degradation tiers |
| C-C6 | Boarding/transporter undefined | ✅ **FIXED** — Full mechanics (Sections 36-43) |
| C-C7 | Ferrets combat bonus 3-way conflict | ✅ **FIXED** — +4 Attack Levels only |
| C-C8 | `target_defense` computed two ways | ✅ **FIXED** — Unified formula, ECM missiles only |

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

### Structure (4) — ✅ 4 RESOLVED (ALL)

| ID | Issue | Status |
|----|-------|--------|
| S-C1 | PROJECT_STRUCTURE.md is stale: 15 files don't exist, 27 not listed | ✅ **FIXED** — Updated to reflect actual file layout as of 2026-04-18 |
| S-C2 | `dark_sectors` region defined but never assigned in generation | ✅ **FIXED** — Already implemented: nebulae set `in_nebula=true`, then `DetermineRegion()` assigns `dark_sectors` |
| S-C3 | Hermit Crabs/Ants homeworld: Lore says radiated/arid, code forces terran | ✅ **FIXED** — Intentional design decision: Terran for balance, lore homeworlds are backstory. Documented in species files and `ConfigureAsHomeworld()` |
| S-C4 | "Five paths to victory" wrong — doc explicitly says 2 | ✅ **FIXED** — Both `victory-conditions.md` and `PROJECT_STRUCTURE.md` now correctly state two victory paths |
| S-C5 | Star color "Orange" vs "Green" — same slot, different names | ✅ **FIXED** — Standardized on Green. Updated `data-structures.md` and `rendering-pipeline.md` to match |

### UI/UX (5) — ✅ 5 RESOLVED (ALL)

| ID | Issue | Status |
|----|-------|--------|
| U-C1 | MAP button: 3 docs describe it 3 different ways | ✅ **FIXED** — Opens separate MAP Screen (not overlay cycle) |
| U-C2 | F7 Reports screen: Listed but missing from command bar | ✅ **FIXED** — REMOVED — not in MOO1, F7 = Tech Screen |
| U-C3 | Tech/Fleet "no command bar" but nav matrix allows F-keys | ✅ **FIXED** — Modernization: All F1-F7 screens switchable via F-keys |
| U-C4 | Research: 6 simultaneous sliders vs one-at-a-time | ✅ **FIXED** — MOO1-style: 6 sliders + tech selection at start-of-turn |
| U-C5 | Keyboard conflicts: G, R, F, D assigned to multiple actions | ✅ **FIXED** — Resolved: G=Grid, R=Range, F=Fleet cycle, D=Defense slider |

### Species (5) — ✅ 5 RESOLVED (ALL)

| ID | Issue | Status |
|----|-------|--------|
| SP-C1 | Budgies `Superior Pilots` wrong values | ✅ **FIXED** — Now +3 Defense AND +3 Initiative |
| SP-C2 | Ferrets `Deadly Accuracy` 3-way conflict | ✅ **FIXED** — Set to +4 Attack Levels (no damage bonus) |
| SP-C3 | 5 techs use invalid fields | ✅ **FIXED** — Removed invalid field names (`sociology`, `physics`, `biology`) from `race-stats-complete.md` |
| SP-C4 | Hamsters missing from ai-personalities | ✅ **FIXED** — Added with Honorable Diplomat personality |
| SP-C5 | 3 starting techs undefined | ✅ **FIXED** — Renamed: `standard_missiles`→`nuclear_missile`, `standard_colony_base`→`colony_base`, `stealth_suit`→`cloaking_device` |

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

### Combat (3) — ✅ ALL RESOLVED
- ~~`defense-systems.md` and `weapons-systems.md` are stale stubs~~ → ✅ DELETED (replaced by `*-complete.md` versions)
- ~~Tactical UI wireframe introduces mechanics not in design docs~~ → ✅ FIXED teleporter range (now "unlimited" per combat-algorithm.md)
- ~~"Hull", "Armor", "HP" used interchangeably~~ → ✅ FIXED added Terminology Glossary to combat-algorithm.md

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

---

## UI Design Decisions (2026-04-12)

All 4 critical UI design decisions resolved:

| Decision | Resolution |
|----------|------------|
| MAP button behavior | Opens separate MAP Screen (not overlay cycle) |
| Research allocation | MOO1-style: 6 sliders for allocation + tech selection popup at start-of-turn only |
| F7 Reports | REMOVED — not in MOO1, F7 = Tech Screen |
| Tech/Fleet modals | **Modernization:** All main screens (F1-F7) switchable via F-keys; true modals only for Combat, Council, Game Menu, start-of-turn popups |


---

## MOO1 Fidelity Fixes (2026-04-13)

Final review against MOO1 reference identified and fixed 60+ critical discrepancies:

### Combat (8 fixes)
- Hit formula → MOO1 differential system
- Damage mapped to hit roll
- Armor Piercing halves shields
- Torpedoes follow missile rules
- Missile fuel 2 turns
- Graviton/Tachyon overflow damage

### Technology (16 fixes)
- Damage values corrected (Proton/Plasma torpedoes, Stellar Converter, Scatter Packs)
- 10 missing techs added
- Bio weapon tech levels synced

### Species (17 fixes)
- All field research bonuses implemented
- AI archetypes corrected
- Hermit Crabs: no_pollution + cannot_terraform

### Economy (5 fixes)
- Manual labor scales with Planetology tech
- Mineral richness applied to production

### Diplomacy (7 fixes)
- Trade ramp-up mechanic
- Population dominance coalition
- Spy system documented as HoO original

### UI/UX (7 fixes)
- Tactical combat enhanced
- Ground combat UI created
- Spy network UI created

