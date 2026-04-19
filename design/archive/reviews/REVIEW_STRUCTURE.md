# Design Structure Review Report

**Reviewed:** 2026-04-12  
**Reviewer:** Wesley Crusher (AI Structural Reviewer)  
**Files Reviewed:** All `.md` files under `/design/`, `AGENTS.md`, `PROJECT_STRUCTURE.md`, `.agents/`

---

## Summary

The design documents are in excellent overall shape — the core game systems are thoroughly specified. However, `PROJECT_STRUCTURE.md` is significantly out of date with the actual file layout, there are a number of broken cross-references, a few real technical inconsistencies remain unresolved, and the galaxy generation algorithm has a structural bug. Details below.

---

## Issue Categories

| # | Severity | Category | Description |
|---|----------|----------|-------------|
| 1 | ✅ FIXED | Structure | PROJECT_STRUCTURE.md is stale — large gap between proposed and actual layout |
| 2 | ✅ FIXED | Galaxy Gen | `dark_sectors` region is defined but never assigned in DetermineRegion() |
| 3 | ✅ FIXED | Galaxy Gen | Hermit Crabs homeworld forced to Terran despite being `radiated` type |
| 4 | ✅ FIXED | Victory | PROJECT_STRUCTURE.md claims "Five paths to victory" — game only has two |
| 5 | ✅ FIXED | Naming | Star color mismatch: `star-systems.md` uses Orange, gen-algorithm uses Green |
| 6 | 🟠 Major | Cross-ref | Multiple cross-referenced files don't exist (11 missing) |
| 7 | 🟠 Major | Cross-ref | Several files in PROJECT_STRUCTURE don't exist (15 missing) |
| 8 | 🟠 Major | Cross-ref | Large number of files not listed in PROJECT_STRUCTURE (27 unlisted) |
| 9 | 🟡 Minor | Naming | `information-display.md` (PROJECT_STRUCTURE) vs `information-displays.md` (actual) |
| 10 | 🟡 Minor | Naming | `opening-crawl.md` (PROJECT_STRUCTURE) vs `opening-story.md` (screen-inventory ref) |
| 11 | 🟡 Minor | Galaxy Gen | Nebula count description in map-generation.md ("1-5") doesn't match generation-algorithm.md (per-size ranges) |
| 12 | 🟡 Minor | Galaxy Gen | Artifacts count in map-generation.md ("2-6") vs actual per-size config (2-3 to 4-6) |
| 13 | 🔵 Info | TODOs | One remaining placeholder text in interaction-spec.md |
| 14 | 🔵 Info | Incomplete | Ants homeworld type conflict (arid in species file, forced to terran in galaxy gen) |
| 15 | 🔵 Info | Incomplete | `narrative/` folder doesn't exist despite being in PROJECT_STRUCTURE |
| 16 | 🔵 Info | Already Fixed | Several issues in consistency-report.md are marked resolved in consistency-resolved.md |

---

## Detailed Issues

---

### ISSUE-001 ✅ FIXED (2026-04-12) — PROJECT_STRUCTURE.md Is Significantly Stale

**Resolution:** Rewrote PROJECT_STRUCTURE.md to reflect the actual file layout as of 2026-04-12. All 27 unlisted files added, all 15 phantom entries removed or marked ❌. "Five paths to victory" corrected to "Two paths to victory." Narrative folder marked as planned-but-not-created. `information-displays.md` name corrected (plural). Old "Key Questions" section replaced with current notes.

---

### ISSUE-001 (archived) 🔴 PROJECT_STRUCTURE.md Is Significantly Stale (original text below)

**File:** `design/PROJECT_STRUCTURE.md`

PROJECT_STRUCTURE.md shows an early proposed layout that diverged substantially from the actual structure as the specification grew. It's no longer a reliable map of the project.

**Missing from structure (15 files/folders):**

| File | Status |
|------|--------|
| `design/DESIGN_PHILOSOPHY.md` | Missing |
| `design/technology/biotechnology.md` | Missing |
| `design/technology/special-tech.md` | Missing |
| `design/narrative/` (entire folder) | Missing — folder doesn't exist |
| `design/ui-ux/information-display.md` | Exists as `information-displays.md` (name mismatch) |
| `design/ui-ux/controls.md` | Missing |
| `design/ui-ux/visual-style.md` | Missing |
| `design/reference/moo1-analysis.md` | Missing (reference/ contains PDF/HTML, no .md) |
| `design/reference/modern-4x-analysis.md` | Missing |
| `design/reference/inspiration.md` | Missing |
| `design/reference/glossary.md` | Missing |

**Exists but not in PROJECT_STRUCTURE (27 files):**

- `design/economy/` (entire folder: factory-formulas.md, population-growth.md, ship-costs.md)
- `design/galaxy/generation-algorithm.md`
- `design/ships/combat-algorithm.md`, `components-complete.md`, `weapons-complete.md`
- `design/species/race-stats-complete.md`
- `design/technical/` (entire folder: ARCHITECTURE.md, ai-implementation.md, data-schemas.md, data-structures.md, development-roadmap.md, rendering-pipeline.md)
- `design/technology/TECH_OVERVIEW.md`, `research-formulas.md`, `planetology.md`
- `design/ui-ux/UI_OVERVIEW.md`, `interaction-spec.md`, `navigation-flow.md`, `screen-inventory.md`, `state-transitions.md`, `tactical-combat-ui.md`
- `design/ui-ux/wireframes/` (entire folder)
- `design/planets/generation-tables.md`, `slider-mathematics.md`
- `design/game-mechanics/balance.md`
- `design/diplomacy/relationship-formulas.md`
- `design/review/` (entire folder)

**Recommendation:** Either update PROJECT_STRUCTURE.md to reflect actual layout, or explicitly note it as a historical artifact and point to AGENTS.md which has the current structure.

---

### ISSUE-002 ✅ FIXED (2026-04-12) — `dark_sectors` Region Never Assigned in DetermineRegion()

**Resolution:** Updated `DetermineRegion()` in `design/galaxy/generation-algorithm.md` Section 3.3 to assign `dark_sectors` to all nebula stars (`if star.in_nebula: return "dark_sectors"`). Added explicit `AssignRegions()` wrapper function that iterates all stars. Added region distribution table. The nebula check correctly runs after the `omega_sector` check (so Orion's star isn't accidentally flagged dark even if in a nebula).

---

### ISSUE-002 (archived) 🔴 `dark_sectors` Region Never Assigned in DetermineRegion() (original text below)

**File:** `design/galaxy/generation-algorithm.md` — Section 3.3

The `DetermineRegion()` function assigns three regions: `omega_sector`, `wild_pellet_fields`, and `safe_zones`. The `dark_sectors` region is defined in `space-regions.md`, included in the star schema enum, and referenced throughout the design — but the generation algorithm never assigns it.

```pseudocode
// Current implementation - dark_sectors unreachable
if dist_from_center < 0.15:   return "omega_sector"
if dist_from_center < 0.40:   return "wild_pellet_fields"
if dist_from_center > 0.75:   return "safe_zones"
return "wild_pellet_fields"   // ← fallback, never "dark_sectors"
```

**Fix:** Nebula-tagged stars should be reassigned to `dark_sectors`. The comment at the end ("check for nebula assignment") suggests this was intended but never implemented:

```pseudocode
// Recommended fix - assign dark_sectors to nebula stars
if star.in_nebula: return "dark_sectors"
```

This logic should run AFTER nebula placement (Step 3) in the main galaxy generation pipeline, during Step 9 (AssignRegions). Currently this step is mentioned but not defined.

---

### ISSUE-003 ✅ FIXED (2026-04-12) — Hermit Crabs Homeworld Type Conflict with Galaxy Generation

**Resolution:** Chose Option 1 (balance-first). All homeworlds are Terran for equal starts. Updated `ConfigureAsHomeworld()` in `generation-algorithm.md` with an explicit comment explaining the design decision. Updated `hermit-crabs.md` and `ants.md` to add a "Homeworld Lore vs. Gameplay" section clarifying Crystalia/Formicae are origin-planet backstory, not in-game starting planets. The `race-stats-complete.md` entries (`type: "radiated"` for Hermit Crabs, `type: "arid"` for Ants) remain as lore references but are superseded by the generation algorithm at game start.

---

### ISSUE-003 (archived) 🔴 Hermit Crabs Homeworld Type Conflict with Galaxy Generation (original text below)

**Files:** `design/species/hermit-crabs.md`, `design/species/race-stats-complete.md`, `design/galaxy/generation-algorithm.md`

The Hermit Crabs (Silicoid equivalent) have a lore homeworld called **Crystalia** described as "harsh radiation-blasted world with silicon-based mineral life." In `race-stats-complete.md`, their homeworld type is explicitly `"radiated"`.

However, the galaxy generation algorithm in `ConfigureAsHomeworld()` forces **all homeworlds** to `environment: "terran"` regardless of species:

```pseudocode
star.planet.environment = "terran"  // Always Terran — overwrites Crystalia's radiated type
```

This means the Hermit Crabs start on a Terran planet, which contradicts their special ability (they ignore planet hostility), their lore (radiated homeworld), and the stat file.

**Secondary conflict:** Ants' homeworld Formicae is described as "Arid" and `race-stats-complete.md` lists it as `type: "arid"` — also overwritten to `"terran"`.

**Options:**
1. Accept that in-game homeworld is always Terran (game balance), update species files and race-stats to reflect this, and treat the lore descriptions as origin-planet backstory only (they fled their harsh homeworld and now inhabit a new one).
2. Add species-specific homeworld type overrides in the homeworld placement algorithm.
3. Document explicitly that lore homeworld types are flavor text, not gameplay values.

---

### ISSUE-004 ✅ FIXED (2026-04-12) — PROJECT_STRUCTURE.md Claims "Five Paths to Victory"

**Resolution:** Fixed as part of the PROJECT_STRUCTURE.md rewrite (ISSUE-001). The new entry reads: `victory-conditions.md  # Two paths to victory: Council Election and Military Conquest`.

---

### ISSUE-004 (archived) 🔴 PROJECT_STRUCTURE.md Claims "Five Paths to Victory" (original text below)

**File:** `design/PROJECT_STRUCTURE.md` line 65

```
│   ├── victory-conditions.md # Five paths to victory
```

**Actual:** `design/game-mechanics/victory-conditions.md` explicitly states there are exactly **two** victory conditions (Council Election and Military Conquest), and that MOO1 does NOT have research, economic, wonder, score, or time-limit victories.

This is a factual error in PROJECT_STRUCTURE.md. Should be: "Two paths to victory."

---

### ISSUE-005 ✅ FIXED (2026-04-12) — Star Color Naming Mismatch: Orange vs Green

**Resolution:** Standardized on **Green** (used by the more implementation-complete documents: `generation-algorithm.md` and `generation-tables.md`). Updated `star-systems.md` ("Orange Stars" → "Green Stars") and `map-generation.md` (added Green and Purple to the color list, removed Orange). Canonical star colors are now: Yellow, Green, Red, Blue, White, Purple — consistent across all four files.

---

### ISSUE-005 (archived) 🟠 Star Color Naming Mismatch: Orange vs Green (original text below)

**Files:** `design/galaxy/star-systems.md`, `design/galaxy/map-generation.md`, `design/galaxy/generation-algorithm.md`, `design/planets/generation-tables.md`

- `star-systems.md` and `map-generation.md` list star colors as: **Yellow, Orange, Red, Blue, White, Purple**
- `generation-algorithm.md` and `generation-tables.md` use: **Yellow, Green, Red, Blue, White, Purple**

"Orange" and "Green" occupy the same slot in the color distribution. This is a direct naming conflict that will cause implementation confusion — which color name is canonical?

**Check MOO1 reference:** MOO1 used Yellow, Blue, White, Red, and Purple/Neutron stars. Neither Orange nor Green appears in the original. "Green" appears to have been introduced in the generation algorithm. "Orange" appears to have come from the star-systems description written separately.

**Recommendation:** Pick one. `generation-algorithm.md` is the more detailed/implementation-ready document. Standardize on **Green** and update `star-systems.md` and `map-generation.md` to match, OR choose **Orange** and update `generation-algorithm.md` and `generation-tables.md`.

---

### ISSUE-006 🟠 Broken Cross-References (Referenced Files That Don't Exist)

The following files are explicitly linked in cross-references but do not exist:

| Missing File | Referenced From |
|---|---|
| `design/ui-ux/espionage-ui.md` | Multiple UI docs |
| `design/ui-ux/ground-combat-ui.md` | Multiple UI docs |
| `design/ui-ux/random-events-ui.md` | Multiple UI docs |
| `design/ui-ux/save-load-ui.md` | Multiple UI docs |
| `design/ui-ux/tutorial.md` | Multiple UI docs |
| `design/narrative/opening-story.md` | screen-inventory.md |
| `design/planets/missile-bases.md` | Various |
| `design/ships/auto-combat-ai.md` | Mentioned in gaps-resolved.md |
| `design/ships/fleet-management.md` | Various ship docs |
| `design/galaxy/galaxy-map-moo1-accurate.md` | UI docs |
| `design/ships/special-abilities.md` | Various |

**Note:** Most of these are UI screens (espionage, ground combat, random events, save/load, tutorial) that were identified as gaps. screen-inventory.md tracks some of these as open TODOs. The gaps-resolved.md mentions auto-combat-ai was added to combat-algorithm.md rather than as a separate file — the reference should be updated.

---

### ISSUE-007 🟠 FILE NAME INCONSISTENCY: `information-display.md` vs `information-displays.md`

**Files:** `design/PROJECT_STRUCTURE.md` (proposes `information-display.md`), actual file is `design/ui-ux/information-displays.md`

Multiple references in `screen-inventory.md` correctly use `information-displays.md` (plural). PROJECT_STRUCTURE.md uses singular. Minor but confusing.

---

### ISSUE-008 🟡 Naming Conflict: `opening-crawl.md` vs `opening-story.md`

**Files:** `design/PROJECT_STRUCTURE.md` (proposes `narrative/opening-crawl.md`), `design/ui-ux/screen-inventory.md` (references `narrative/opening-story.md`)

Neither file exists. Two different names are being used for the same intended document.

---

### ISSUE-009 🟡 Nebula Count Description Mismatch

**Files:** `design/galaxy/map-generation.md`, `design/galaxy/generation-algorithm.md`

`map-generation.md` says: "1-5 nebula regions depending on galaxy size"

But `generation-algorithm.md` defines per-size ranges:
- Small: 1-2
- Medium: 2-3  
- Large: 2-4
- Huge: 3-5

The "1-5" in map-generation.md is the overall range across sizes, which is technically correct but misleading — a Small galaxy will never have 4 or 5 nebulae. Should document the per-size ranges explicitly.

---

### ISSUE-010 🟡 Artifacts Count Description Mismatch

**Files:** `design/galaxy/map-generation.md`, `design/galaxy/generation-algorithm.md`

`map-generation.md` says: "2-6 systems with ancient technology"

`generation-algorithm.md` per-size config:
- Small: 2-3
- Medium: 3-4
- Large: 3-5
- Huge: 4-6

Same issue as nebulae — the "2-6" is the total range, not valid for any single galaxy size.

---

### ISSUE-011 🟡 `DetermineRegion()` Called Before Nebula Placement in Generation Pipeline

**File:** `design/galaxy/generation-algorithm.md` — Section 9 (Main Generation Function)

The main `GenerateGalaxy()` function calls `AssignRegions()` in Step 9, but nebulae are placed in Step 3 (before planets, before Orion). So nebula membership is known when regions are assigned — this ordering is actually fine.

However, the `DetermineRegion()` function in Section 3.3 doesn't reference nebula membership at all, and `AssignRegions()` (Step 9) is referenced but never defined. This is a gap in the specification.

**Recommendation:** Define `AssignRegions()` explicitly, including the `dark_sectors` assignment logic (see ISSUE-002).

---

### ISSUE-012 🔵 One Remaining Placeholder in interaction-spec.md

**File:** `design/ui-ux/interaction-spec.md` line 759

```
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │  ← Ghost placeholder
```

This is a visual wireframe placeholder annotation. It's inline diagram markup, likely intentional for the ASCII wireframe — but the label "Ghost placeholder" could be read as unfinished content. Low priority; verify it's intentional.

---

### ISSUE-013 🔵 `narrative/` Folder Doesn't Exist

**File:** `design/PROJECT_STRUCTURE.md`

PROJECT_STRUCTURE.md specifies a `narrative/` folder with five files (opening-crawl.md, victory-endings.md, discovery-events.md, crisis-events.md, flavor-text.md). None of these exist and the folder was never created.

Some narrative content may be scattered in LORE.md and species files, but there is no dedicated narrative specification. This is lower priority unless the project needs narrative/flavor text specs for implementation.

---

### ISSUE-014 🔵 `AssignRegions()` Function Referenced but Never Defined

**File:** `design/galaxy/generation-algorithm.md` — Section 9.1 Step 9

The main pipeline references `AssignRegions(galaxy.stars, map_center, config)` but this function is never defined anywhere in the document. The closest thing is `DetermineRegion()` in Section 3.3, which operates per-star. A wrapper `AssignRegions()` that iterates all stars is missing.

---

## Issues Already Resolved (No Action Needed)

Per `design/review/consistency-resolved.md` (2026-03-22), the following were previously identified and resolved:

- **CRIT-001**: Mice production bonus stacking (clarified)
- **CRIT-002**: Hit chance formula standardized to `combat-algorithm.md`
- **CRIT-003**: Hull cost vs total ship cost distinction documented
- **CRIT-004**: Engine cost/space values standardized to `components-complete.md`
- **CRIT-005**: Ants growth vs max population bonuses clarified
- **MAJ-001**: Hamster diplomacy modifier standardized (+30% stat, separate 2× multiplier)
- **MAJ-002**: Ferrets attack vs damage bonuses clarified (two separate bonuses)
- **MAJ-003**: Budgies defense calculation clarified (+50% = +5 defense rating)
- **MAJ-004**: Robotic Controls tech levels standardized to `factory-formulas.md`
- **MAJ-005**: Base population growth rate fixed
- **MAJ-006**: Shield absorption language clarified

---

## Priority Recommendations

### Immediate (blocks implementation)

1. **ISSUE-002** — Fix `DetermineRegion()` to assign `dark_sectors` to nebula stars and define `AssignRegions()`
2. **ISSUE-003** — Decide and document canonical Hermit Crabs (and Ants) homeworld type
3. **ISSUE-005** — Pick canonical star color name: Orange or Green; update all files

### Soon (documentation debt)

4. **ISSUE-001 / ISSUE-004** — Update PROJECT_STRUCTURE.md to match reality; fix "Five paths" error
5. **ISSUE-006** — Either create the missing UI screen files or update references to note they're deferred

### Low priority

6. **ISSUE-007 through ISSUE-012** — Naming consistency, description mismatches, missing function definitions

---

## File Inventory (Actual vs Documented)

For reference, the **actual** design document structure as of 2026-04-12:

```
design/
├── LORE.md                          ✅
├── PROJECT_STRUCTURE.md             ✅ (stale — see ISSUE-001)
├── DESIGN_PHILOSOPHY.md             ❌ Missing
├── economy/
│   ├── factory-formulas.md          ✅ (not in PROJECT_STRUCTURE)
│   ├── population-growth.md         ✅ (not in PROJECT_STRUCTURE)
│   └── ship-costs.md                ✅ (not in PROJECT_STRUCTURE)
├── diplomacy/
│   ├── ai-personalities.md          ✅
│   ├── council.md                   ✅
│   ├── espionage.md                 ✅
│   ├── relationship-formulas.md     ✅ (not in PROJECT_STRUCTURE)
│   ├── trade.md                     ✅
│   └── treaties.md                  ✅
├── galaxy/
│   ├── exploration.md               ✅
│   ├── generation-algorithm.md      ✅ (not in PROJECT_STRUCTURE)
│   ├── map-generation.md            ✅
│   ├── space-regions.md             ✅
│   ├── star-systems.md              ✅
│   └── travel.md                    ✅
├── game-mechanics/
│   ├── balance.md                   ✅ (not in PROJECT_STRUCTURE)
│   ├── difficulty.md                ✅
│   ├── random-events.md             ✅
│   ├── turn-structure.md            ✅
│   └── victory-conditions.md        ✅
├── narrative/                       ❌ Folder doesn't exist
├── planets/
│   ├── buildings.md                 ✅
│   ├── generation-tables.md         ✅ (not in PROJECT_STRUCTURE)
│   ├── planet-sizes.md              ✅
│   ├── planet-types.md              ✅
│   ├── population.md                ✅
│   ├── production.md                ✅
│   ├── slider-mathematics.md        ✅ (not in PROJECT_STRUCTURE)
│   └── special-planets.md          ✅
├── review/
│   ├── consistency-report.md        ✅ (not in PROJECT_STRUCTURE)
│   ├── consistency-resolved.md      ✅ (not in PROJECT_STRUCTURE)
│   ├── coverage-matrix.md           ✅ (not in PROJECT_STRUCTURE)
│   ├── gap-analysis-manual.md       ✅ (not in PROJECT_STRUCTURE)
│   ├── gap-analysis-wiki.md         ✅ (not in PROJECT_STRUCTURE)
│   └── gaps-resolved.md             ✅ (not in PROJECT_STRUCTURE)
├── ships/
│   ├── combat-algorithm.md          ✅ (not in PROJECT_STRUCTURE)
│   ├── combat-mechanics.md          ✅
│   ├── components-complete.md       ✅ (not in PROJECT_STRUCTURE)
│   ├── defense-systems.md           ✅
│   ├── ship-classes.md              ✅
│   ├── ship-design.md               ✅
│   ├── special-systems.md           ✅
│   ├── weapons-complete.md          ✅ (not in PROJECT_STRUCTURE)
│   └── weapons-systems.md           ✅
├── species/
│   ├── _TEMPLATE.md                 ✅
│   ├── ants.md                      ✅
│   ├── budgies.md                   ✅
│   ├── chameleons.md                ✅
│   ├── ferrets.md                   ✅
│   ├── guinea-pigs.md               ✅
│   ├── hamsters.md                  ✅
│   ├── hermit-crabs.md              ✅
│   ├── mice.md                      ✅
│   ├── rabbits.md                   ✅
│   ├── race-stats-complete.md       ✅ (not in PROJECT_STRUCTURE)
│   └── rats.md                      ✅
├── technical/
│   ├── ARCHITECTURE.md              ✅ (not in PROJECT_STRUCTURE)
│   ├── ai-implementation.md         ✅ (not in PROJECT_STRUCTURE)
│   ├── data-schemas.md              ✅ (not in PROJECT_STRUCTURE)
│   ├── data-structures.md           ✅ (not in PROJECT_STRUCTURE)
│   ├── development-roadmap.md       ✅ (not in PROJECT_STRUCTURE)
│   └── rendering-pipeline.md       ✅ (not in PROJECT_STRUCTURE)
├── technology/
│   ├── TECH_OVERVIEW.md             ✅ (not in PROJECT_STRUCTURE)
│   ├── biotechnology.md             ❌ Missing
│   ├── categories.md                ✅
│   ├── computers.md                 ✅
│   ├── construction.md              ✅
│   ├── force-fields.md              ✅
│   ├── planetology.md               ✅ (not in PROJECT_STRUCTURE)
│   ├── propulsion.md                ✅
│   ├── research-formulas.md         ✅ (not in PROJECT_STRUCTURE)
│   ├── special-tech.md              ❌ Missing
│   └── weapons.md                   ✅
└── ui-ux/
    ├── UI_OVERVIEW.md               ✅ (not in PROJECT_STRUCTURE)
    ├── information-displays.md      ✅ (PROJECT_STRUCTURE has wrong name)
    ├── interaction-spec.md          ✅ (not in PROJECT_STRUCTURE)
    ├── main-screens.md              ✅
    ├── navigation-flow.md           ✅ (not in PROJECT_STRUCTURE)
    ├── screen-inventory.md          ✅ (not in PROJECT_STRUCTURE)
    ├── state-transitions.md         ✅ (not in PROJECT_STRUCTURE)
    ├── tactical-combat-ui.md        ✅ (not in PROJECT_STRUCTURE)
    ├── espionage-ui.md              ❌ Missing (cross-referenced)
    ├── ground-combat-ui.md          ❌ Missing (cross-referenced)
    ├── random-events-ui.md          ❌ Missing (cross-referenced)
    ├── save-load-ui.md              ❌ Missing (cross-referenced)
    ├── tutorial.md                  ❌ Missing (cross-referenced)
    └── wireframes/
        ├── command_menu/            ✅ (6 files)
        ├── fleet-deployment-panel.md ✅
        ├── fleet-screen.md          ✅
        ├── galaxy-map.md            ✅
        ├── moo1-reference-wireframes.md ✅
        ├── research-tree.md         ✅
        └── ship-design-screen.md    ✅
```
