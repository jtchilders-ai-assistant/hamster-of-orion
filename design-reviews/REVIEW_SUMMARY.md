# Orion Game — Design Consistency Review

**Review Date:** April 28–29, 2026
**Reviewers:** 9 parallel sub-agents
**Scope:** 136 design docs + 72 source files, partitioned into 10 review areas
**Status:** 10/10 areas complete

---

### 10. UI Widgets & Tactical Systems ✅
- **Matches:** 29 verified correct implementations (hex grid, HP bars, initiative strip, combat log, movement range, auto-resolve, retreat, damage numbers, explosions, ground combat deployment, animated rounds, speed controls, espionage panel with all mission types, counter-espionage, mission history, command bar, info panels)
- **High mismatches:** 4
  - Grid is 15×11 (165 hexes) vs design's 15×15 (225 hexes)
  - No WAIT button (ship yields turn order)
  - No DONE button (no explicit "end turn for this ship" action)
  - No combat speed control UI (animation timing hardcoded)
- **Medium:** No MP tracking on tokens, no missile flight visualization, no hover tooltips, no bombardment phase after space combat victory, no camera controls
- **Missing (23):** Planet bombardment UI, pre-battle force comparison screen, multi-fleet combat, special systems panel (cloak/teleport/cooldowns), direct hit feedback, asteroid/nimbus cover, tactical tips panel, spy budget integration with PLANETS screen, spy result notifications, empire dashboard, graphs/charts screens, combat history log, diplomatic relations matrix, technology reports, score breakdown, hall of fame
- **Extras:** REPLAY button, demo fleet builders, shield class on tokens, 25-spy cap, COUNCIL button, RP/turn display, generic sprite loading

---

## Executive Summary

The codebase is a **substantial but incomplete** implementation of the MOO1-inspired design. Core systems (economy, galaxy generation, ship design, planet colonization) are functionally implemented and broadly faithful to design. However, there are **significant deviations in combat resolution, turn structure, AI behavior, and UI interaction** that affect gameplay fundamentally.

**Key stat:** ~25-35 high-severity mismatches across 9 areas, plus ~40+ missing features. This exceeds the expected ~20% inconsistency rate.

---

## Results by Area

### 1. Economy & Production Systems ✅
- **Matches:** 30 verified correct implementations (factory formulas, slider math, population growth, racial modifiers, ECO phases)
- **High mismatches:** 2
  - Mice factory output overproduces (~25%) via stacked `factoryEfficiencyMultiplier × racialProductionModifier` (yields 1.875 vs design's 1.5 BC)
  - Legacy `growth.ts` implements a parallel, conflicting growth system (enum-based morale) that diverges from the spec's numeric formula — both files coexist
- **Medium/lower:** Ship maintenance constants absent; ECO priority order inverted between slider-mathematics.md and code; deprecated `distributeProduction()` and `calculateMaxFactories()` functions still present; building overflow BC silently discarded
- **Missing:** Ship maintenance, terraforming tier completion (BC accepted but never executed), Rabbit auto-transport overflow, difficulty modifiers for factories (only growth has them)

### 2. Galaxy Generation & Navigation ✅
- **Matches:** 24 verified correct implementations (star placement, color weights, environment tables, resource tables, homeworld placement, nebulae, regions, pathfinding)
- **High mismatches:** 1
  - Orion's star is not forced to yellow despite design explicitly stating `best_star.color = "yellow"` (MOO1 precedent)
- **Medium:** Cluster formation restricts membership to unassigned stars (design allows multi-cluster membership); min homeworld distance hardcoded (150/175/200/225) vs design formula (25% of diagonal: 160/224/272/320)
- **Missing:** Star Gates, Space Monsters, galaxy shape enum unused
- **Extras:** gas_giant planet type (weight 0, never generates), 'dragon' monster type (undocumented), QuadTree spatial index (useful, not in design)

### 3. Ships, Weapons & Combat ✅
- **Matches:** 27 verified correct implementations (hull specs, miniaturization, combat loop structure, damage-to-roll mechanic, armor-piercing, experience bonuses, component data)
- **High mismatches:** 1
  - Hit-chance multiplier is ×5 per level of advantage vs design's ×10. Code comment explicitly notes this deviation but cites a "task spec" with no design-doc amendment
- **Missing (critical):** ~60% of MOO1-faithful mechanics absent — weapon-specific effects (chain lightning, Hellfire multi-hit, percent damage, crew kills, overflow damage), range modifiers, size modifiers, racial damage bonuses, scanner range bonuses, missile/torpedo distinct combat resolution, special systems (Warp Dissipator, Sub-Space Teleporter, High Energy Focus, Cloaking Device)
- **Extras:** Temporal Drive engine (undocumented, tier 55), heavy weapon variants, undocumented ground weapons

### 4. Planets & Colonization ✅
- **Matches:** 22 verified correct implementations (hostile environment techs, mineral modifiers, slider system, population formulas, racial modifiers, building maintenance)
- **High mismatches:** 5
  - Orion = gaia (should be dead) with basePop 100 (should be 150)
  - `researchMultiplier` set on planets (4.0/2.0) but never read by any system
  - Gaia world spawns naturally (should only exist via terraforming)
  - Hermit Crab colonization exception missing (can't colonize hostile worlds)
  - Terraforming buildings unreachable (filtered out of `getAvailableBuildings`)
- **Missing:** Stellar Converter, conquered population mechanics, nebula capacity bonus, planet quality scoring

### 5. Diplomacy, AI & Espionage ✅
- **Matches:** 17 verified correct implementations (relationship thresholds, decay formula, council voting, espionage effectiveness formula, detection chance, base mission rates, treaty break penalties, AI personalities)
- **High mismatches:** 4
  - Espionage racial aggression multipliers wrong for Rabbits (1.00 vs 0.95), Guinea Pigs (1.00 vs 0.90), Hermit Crabs (1.00 vs 0.85)
  - Espionage `applyMissionEffect()` is a no-op stub — sabotage, rebellion, assassination, tech theft all produce placeholder rewards only
  - Frame job mission completely absent (not in MissionType union)
  - "All Spies Fail" catastrophic failure mechanic absent
- **Medium:** Trade income formula drops the +5 offset (`base + (P1+P2)/20` vs design `(P1+P2)/20`)
- **Missing:** Treaty maintenance bonuses, relation decay toward baselines, war weariness, defensive pact duration lock, trade sanctions

### 6. Technology & Research ✅
- **Matches:** 16 verified correct implementations (research cost formula, miniaturization, planet bonuses, race modifiers, combat hit/damage formulas, tech tree mappings)
- **High mismatches:** 3
  - Force Fields uses generic 18-tier cost table instead of 14-tier accelerated schedule (underpriced)
  - Force Fields has 15 techs in data vs 14 in design (tier 15 super_deflector undocumented)
  - Techs per tier reduced from 5-7 (design) to 3 (implementation)
- **Medium:** Death Ray doesn't ignore shields despite component data flag; planetary shields have no bombardment absorption; planet type enum has 22 entries vs design's 23; Black Hole Generator completely missing

### 7. UI Core & Navigation ✅
- **Matches:** 20 verified correct implementations (F1-F8 navigation, modal screen blocking, turn summary overlay, victory screen, command bar, info panels, save/load)
- **High mismatches:** 4
  - CommandBar has wrong COUNCIL=F7 button (should be F8; F7=Reports missing from bar)
  - Enter/Space skips design-specified confirmation dialog (directly processes turn)
  - ESC from any non-modal screen opens 'menu' instead of returning to Galaxy Map
  - Unexplored star panel missing range from nearest colony
- **Medium:** Fleet in-transit missing [REDIRECT] button and warp speed display; numerous keyboard shortcuts absent (Ctrl+S/L/Z, N/F cycling, G/R/T overlays); Commander class creates duplicate turn-summary overlay competing with App's screen state machine; Commander adds second keyboard listener causing double-dispatch
- **Missing:** MAP screen with overlay modes, notification stack, structured turn resolution event queue, double-click behaviors, right-click context menus, middle-click pan, settings screen, credits screen

### 8. Core Game Mechanics ✅
- **Findings:** 28 total (6 high, 13 medium, 9 low)
- **High mismatches:**
  - Turn phases not implemented as structured 12-phase sequence (flat function)
  - Difficulty level accepted at game start but multipliers never applied to any system
  - Victory conditions not fully implemented (military conquest, diplomatic victory)
  - Combat resolution not called during turn processing
- **Medium:** Random event probability scaling partial; fog of war declared in state but never updated; diplomatic relations decay not implemented; race modifiers not applied to empire stats; starting credits hardcoded; AI personality traits defined but never used
- **Missing:** 12-phase turn structure, difficulty scaling constants, combat resolution in turn loop, fog of war system, event effect implementations, turn events log

### 9. Species Definitions & Lore ✅
- **Matches:** 30 verified correct implementations (all 10 races with correct bonuses, AI archetype weights, special abilities, starting techs, ship prefixes, racial constants, homeworld specs)
- **High mismatches:** 4
  - AI empire builder hardcodes identical 'balanced' personality for all 10 races (ignores race-specific aiBehavior)
  - Race starting technologies never applied (all empires start with empty completedTechs)
  - Starting diplomatic relationships hardcoded (50/40) instead of using race-based formula
  - Ferrets "blood_enemies_all" starting relations completely absent
- **Medium:** Local RaceData interface strips almost all race data at compile time; Diplomacy bonus applied multiplicatively to relationship changes (not specified in design)
- **Missing:** All 40 starting techs, all race-specific special ability effects (44 abilities across all races, none wired to logic), unique race buildings/ships/technologies

---

## Cross-Cutting Themes

### Critical Structural Issues
1. **Combat is skeleton-only:** The combat engine handles basic hit/damage but is missing ~60% of MOO1 mechanics (weapon effects, special systems, racial bonuses, missiles/torpedoes). This is the single largest gap.
2. **Turn structure is flat:** 12 explicit design phases collapsed into one function. No phase boundaries, no event queue, no tech choice modals, no diplomatic popups.
3. **Difficulty scaling is phantom:** Difficulty parameter flows into state but is never read by any system. All difficulties behave identically.
4. **Race identity is lost at game start:** Despite 136 pages of species design, AI behavior, starting techs, and diplomatic relationships are all hardcoded to defaults.
5. **Espionage exists but does nothing:** Mission effects are stubbed out. Sabotage, rebellion, assassination, and tech theft produce no game-state changes.

### Code Quality Concerns
- **Duplicate/conflicting systems:** Two growth implementations (growth.ts vs population.ts), two keyboard listeners (App vs Commander), two turn-summary overlays (Commander vs App)
- **Legacy stubs not removed:** growth.ts, distributeProduction(), calculateMaxFactories() — all obsolete but present
- **Undocumented extensions:** Temporal Drive, heavy weapons, ground weapon variants, dragon monster, gas_giant planet type — code exists without design basis
- **Data/model drift:** Planet type enum has 22 entries vs design's 23; type indices don't match between documents and code

### Design Doc Issues
- **Internal inconsistency:** Chameleons.md lists "Stealth Suit" while race-stats-complete.md and races.json correctly list "cloaking_device"
- **Missing cross-references:** Food system exists in population.ts but not documented in planet design docs
- **Terminology drift:** snake_case in design JSON vs camelCase in TypeScript; "weaponry" vs "weapons" label

### What's Working Well
- Core formulas (production, growth, tech costs, race bonuses) are correctly implemented in most areas
- Component data (ships, weapons, armor, shields) is comprehensive and matches design tables
- UI layout structure (command bar, info panels, screen routing) follows design wireframes faithfully
- Race definitions (10 races, all stats, AI weights, special abilities) are complete and correct
- The data layer (races.json, components.json, tech-tree.json, events.json) is thorough

---

## Recommendations by Priority

### Must Fix (gameplay-breaking)
1. Apply race-specific starting techs, AI personalities, and diplomatic relationships — these make race selection meaningless
2. Wire up espionage mission effects — espionage exists as UI but does nothing
3. Fix combat hit-chance multiplier (×5 vs ×10) and implement missing weapon effects
4. Implement difficulty multipliers — current game has no difficulty differentiation
5. Fix Orion environment (gaia → dead, basePop 100 → 150) and researchMultiplier application

### Should Fix (design fidelity)
6. Implement structured 12-phase turn processing
7. Clean up duplicate/conflicting systems (growth.ts, Commander keyboard listener, double turn-summary)
8. Remove or document undocumented extensions (Temporal Drive, heavy weapons, dragon, gas_giant)
9. Implement MAP screen with overlay modes and all missing keyboard shortcuts
10. Add ESC navigation fix (return to galaxy vs game menu based on context)

### Nice to Have
11. Fix color palette discrepancies
12. Implement notification stack with batching
13. Add right-click context menus and double-click behaviors
14. Cross-reference planet design docs with food/starvation system in code
15. Fix Mice factory efficiency to match design intent
