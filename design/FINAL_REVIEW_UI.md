# Final UI/UX Review: Hamster of Orion vs. MOO1

**Date:** 2026-04-12  
**Reviewer:** Wesley (subagent)  
**Reference Material:**
- MOO1 StrategyWiki reference (`reference/strategywiki-moo1.txt`)
- MOO1 screenshots (`design/moo_screens/*.png` — 33 images)
- Design files: `design/ui-ux/*.md` (8 files) + `wireframes/**/*.md` (10 files + 6 command_menu files)

---

## Executive Summary

The Hamster of Orion UI/UX design is **well-grounded in MOO1 fidelity** and has been through multiple rounds of review and correction (through 2026-04-12). The core screen structure, navigation model, layout conventions, and game flow faithfully reproduce MOO1 patterns. Critical design decisions have been resolved. The main outstanding gaps are **missing wireframes for several screens** and **underdeveloped specifications for combat, espionage, and supporting UIs**.

**Overall Status: ~76% complete** (26 of 34 MOO1 screens documented; wireframes exist for ~60% of core screens)

---

## 1. Screen Layout & Navigation — vs. MOO1

### 1.1 Galaxy Map Layout ✅ Accurate

**MOO1 pattern:** Star map left (~75%), context-sensitive info panel right (~25%), bottom command bar always present.

**Design:** Matches exactly. The `UI_OVERVIEW.md` and `galaxy-map.md` wireframes correctly implement:
- `[GAME | DESIGN | FLEET | MAP | RACES | PLANETS | TECH | NEXT TURN]` command bar
- Right-side info panel with 5 production sliders when colony selected
- Nothing deselects — something is always selected (starting with homeworld)
- F1–F7 hotkeys (F1=MAP, F2=PLANETS, F3=FLEET, F4=TECH, F5=RACES, F6=DESIGN)

**Verified against screenshots:** `moo_galaxy_home.png` (colony selected with right panel), `moo_galaxy_unexplored.png`, `moo_galaxy_shipselect.png`, `moo_galaxy_fleet_deployment.png`.

### 1.2 Command Bar ✅ Accurate

**MOO1:** `GAME | DESIGN | FLEET | MAP | RACES | PLANETS | TECH | NEXT TURN`  
**Design:** Matches exactly. F10 was correctly removed; ESC is the sole Game Menu trigger.

**Key resolution (confirmed):** F7 (Reports screen) was not in MOO1 and has been removed from all design docs. The command bar follows MOO1 exactly.

### 1.3 MAP Screen ✅ Accurate

**MOO1:** Full-screen replacement view (not overlay), shows all stars at once. Three mode buttons: COLONIES / ENVIRONMENT / MINERALS.

**Design:** `command_menu_map.md` correctly documents this as a separate full-screen rendering mode. Mode buttons (COLONIES, ENVIRONMENT, MINERALS) match MOO1 exactly. Planet type codes (G/T/J/O/A/S/D/M/B/Tu/De/I/To/R) and mineral codes (UP/P/Normal/R/UR/A/O) are documented correctly.

**Verified against screenshots:** `moo_map_colonies_selected.png`, `moo_map_environments_selected.png`, `moo_map_minerals_selected.png`.

### 1.4 Screen Navigation Model ✅ Accurate (with noted modernization)

**MOO1:** Each screen was more isolated; some required closing before accessing another.

**Design (modernization):** All F1–F7 main screens are directly switchable via F-key from anywhere. ESC always returns to Galaxy Map. This is documented as a deliberate QoL improvement and is clearly flagged throughout.

**True modals** (block F-key navigation) are correctly identified as: Combat, Council Vote, Game Menu, start-of-turn popups (tech selection, random events, diplomatic messages).

---

## 2. Turn Flow & Game Phases — vs. MOO1

### 2.1 Turn Resolution Flow ✅ Accurate

**MOO1 sequence:** Player ends turn → AI processes → Space combat → Ground combat → Council vote → Random events → Tech completion → Diplomatic messages → Return to map.

**Design (`navigation-flow.md` §5):** Matches this sequence correctly in the Mermaid flowchart. All phases are represented. Tech completion correctly triggers the start-of-turn selection popup (not mid-turn).

### 2.2 Start-of-Turn Events ✅ Well Documented

All 6 start-of-turn event types have screenshots available and are documented:
- New tech breakthrough → `moo_new_tech.png`
- Select new research direction → `moo_start_of_turn_select_new_research.png`
- New planet revealed → `moo_start_of_turn_new_planet_reveal.png`
- New ships built → `moo_start_of_turn_new_ships.png`
- Colony ship arrives → `moo_colony_ship_arrives_at_potential_planet.png`
- New colony established → `moo_new_colony_screen.png`

### 2.3 Research Mechanic ✅ Resolved (Correct MOO1 Model)

**MOO1:** 6 RP allocation sliders (adjustable anytime), tech selection only at start-of-turn when a field completes; 2–3 choices offered.

**Design:** Correctly implements this two-moment model. `command_menu_tech.md` and `wireframes/research-tree.md` both document this accurately. Tech Screen (F4) = RP reallocation only. Start-of-turn popup = tech selection only.

### 2.4 Colony States ✅ Documented

All 4 galaxy-map colony state variants are documented with screenshots:
- New colony (`moo_galaxy_planet_new.png`)
- Post-terraforming (`moo_galaxy_planet_post_tform.png`)
- Population at cap (`moo_galaxy_planet_is_full.png`)
- Max factories (`moo_galaxy_max_factories.png`)

---

## 3. Screen Inventory — MOO1 Coverage Check

### 3.1 Screens with Full/Good Coverage ✅

| Screen | MOO1 Present | HoO Status | Screenshots |
|--------|-------------|------------|-------------|
| Main Menu | ✓ | ✅ Full | `moo_new_game_menu.png` |
| Race Selection (new game) | ✓ | ✅ Full | `moo_new_game_race_select.png` |
| Banner Selection | ✓ | ✅ Full | `moo_new_game_banner_select.png` |
| Emperor Name | ✓ | ✅ Full | `moo_new_game_emporer_name.png` |
| Home World Name | ✓ | ✅ Full | `moo_new_game_home_world_name.png` |
| Galaxy Map (F1) | ✓ | ✅ Full | Multiple screenshots |
| MAP Screen (3 overlays) | ✓ | ✅ Full | 3 screenshots |
| Planet List (F2) | ✓ | ✅ Full | `moo_planets.png` |
| Fleet Screen (F3) | ✓ | ✅ Full | `moo_fleet_screen.png` |
| Technology Screen (F4) | ✓ | ✅ Full | `moo_tech.png` + 3 notification screenshots |
| Ship Design (F6) | ✓ | ✅ Full | `moo_ship_design.png`, `moo_design.png` |
| Tech Selection Popup | ✓ | ✅ Full | `moo_start_of_turn_select_new_research.png` |
| New Tech Notification | ✓ | ✅ Full | `moo_new_tech.png`, `moo_new_tech_eco_increase.png` |
| New Ships Notification | ✓ | ✅ Full | `moo_start_of_turn_new_ships.png` |
| Planet Reveal Notification | ✓ | ✅ Full | `moo_start_of_turn_new_planet_reveal.png` |
| Colony Ship Arrives | ✓ | ✅ Full | `moo_colony_ship_arrives_at_potential_planet.png` |
| New Colony Screen | ✓ | ✅ Full | `moo_new_colony_screen.png` |
| High Council | ✓ | ✅ Documented | (no screenshot) |
| Victory/Defeat | ✓ | ✅ Stub | (no screenshot) |
| Hall of Fame | ✓ | ✅ Documented | (no screenshot) |

### 3.2 Screens with Partial Coverage ⚠️

| Screen | MOO1 Present | HoO Status | Gap |
|--------|-------------|------------|-----|
| Diplomacy/RACES (F5) | ✓ | ⚠️ Stub wireframe | No full layout; audience/negotiation sub-flow documented but not wireframed |
| Planet Management (single colony) | ✓ | ⚠️ ASCII in main-screens | No dedicated wireframe file |
| Pre-Combat Screen | ✓ | ⚠️ Layout in tactical-combat-ui | Strength comparison, odds display not fully specified |
| Galaxy Setup Screen | ✓ | ⚠️ Listed, stub | Difficulty effects on UI not documented |
| Game Menu (ESC) | ✓ | ⚠️ Mentioned | No wireframe |
| Save/Load UI | ✓ | ⚠️ Basic | No wireframe; auto-save not spec'd |
| Settings Screen | ✓ | ⚠️ Partial | Missing animation speed, auto-end-turn toggles |

### 3.3 Screens Missing from Design ❌

| Screen | MOO1 Present | HoO Status | Priority |
|--------|-------------|------------|----------|
| Tactical Combat (full hex grid) | ✓ | ❌ Only overview; missing: health bars, movement points, initiative display, damage numbers, missile tracking, wait/done button, combat speed control | **Critical** |
| Ground Combat | ✓ | ❌ Not documented | Critical |
| Spy Network UI | ✓ | ❌ Not documented | Critical |
| Tech Trade UI | ✓ | ❌ Not documented | Important |
| Population Transfer UI | ✓ | ❌ Not documented | Important |
| Random Event Screens (8 types) | ✓ | ❌ Not documented | Important |
| Opening Story/Cinematic | ✓ | ❌ Not documented | Minor |

---

## 4. Specific Screen Comparisons — Screenshots vs. Design

### 4.1 Galaxy Map (moo_galaxy_home.png)

**MOO1 shows:**
- Star map with colony icons (filled circles)
- Right panel: star name, planet type, pop/factories/bases/waste, 5 production sliders
- Bottom command bar with 8 buttons
- No top status bar (empire info is in the right panel)

**Design matches:** ✅ The `galaxy-map.md` wireframe and `main-screens.md` §2 reproduce this exactly. Command bar order is correct. No top status bar (correctly absent).

**Minor gap:** The design shows `SHIP/DEF/IND/ECO/TECH` slider labels. MOO1 uses this labeling. Confirmed accurate.

### 4.2 Technology Screen (moo_tech.png)

**MOO1 shows:**
- Full-screen replacement (no command bar at bottom in MOO1 — but HoO modernizes this)
- Left panel: 6 field rows with RP allocation (not percentage sliders but click-adjustable)
- Right panel: tech tree for selected field, organized by level
- Bottom: tech description panel + "Total Research BC" + OK button

**Design matches:** ✅ `command_menu_tech.md` wireframe reproduces this accurately. Field labels are correct (COMPUTERS/CONSTRUCTION/FORCE FIELDS/PLANETOLOGY/PROPULSION/WEAPONRY). Two-panel layout is correct.

**Noted modernization:** Design adds command bar to Tech screen (makes it a full nav screen rather than modal). Clearly flagged as QoL improvement.

**Gap:** `main-screens.md` §4 still contains old "full-screen modal with NO bottom command bar" language that contradicts the resolved decision. Needs a cleanup pass.

### 4.3 Ship Design Screen (moo_ship_design.png / moo_design.png)

**MOO1 shows:**
- Hull class selector at top
- Auto-assigned systems panel (computer, shield, armor, engine — not player-configurable)
- Weapon slots (player-configurable, 4 slots)
- Special devices (3 slots)
- Bottom: ship name, cost, space remaining, BUILD button

**Design matches:** ✅ `command_menu_design.md` wireframe accurately reproduces this, including the important detail that computer/shield/armor/engine are auto-assigned to best available tech (not player-configured in the design screen).

**Gap:** The design mentions "CLEAR" button but MOO1's original "clear/reset" workflow needs confirmation. The 6-design limit is documented in `screen-inventory.md` but not yet reflected in the wireframe.

### 4.4 Fleet Screen (moo_fleet_screen.png)

**MOO1 shows:**
- Grid of ships organized by location (system rows, ship-class columns)
- Ship icons with count badges
- ETA display for fleets in transit

**Design matches:** ✅ `command_menu_fleet.md` wireframe reproduces the grid-with-ship-icons layout accurately, including the ETA column for transiting fleets.

### 4.5 Planets Screen (moo_planets.png)

**MOO1 shows:**
- Sortable list of all colonies
- Columns: planet thumbnail, name, population, factories, bases, shields, waste, production, current build
- Bottom: spending breakdown, totals, finance/reserve section

**Design matches:** ✅ `command_menu_planets.md` wireframe matches this layout, including the three-panel bottom section (SPENDING / TOTALS / FINANCE).

**Note:** The wireframe has the PLANETS hotkey listed as F6, but it should be F2 per the canonical command bar. This is a documentation error in `command_menu_planets.md`.

### 4.6 New Game Setup Flow (5 screenshots)

**MOO1 shows:** Multi-step new game flow — galaxy config → race selection → banner selection → emperor name → home world name.

**Design matches:** ✅ `main-screens.md` §1 and `navigation-flow.md` §1 document all 5 steps. `wireframes/new-game-setup.md` is a stub but covers the steps. Race selection shows portraits, bonuses, flavor text — all consistent with `moo_new_game_race_select.png`.

**Gap:** Stub wireframe needs full ASCII layout detail.

---

## 5. Modernizations vs. MOO1 Original

The following are **deliberate modernizations** over MOO1, clearly documented as such:

| Feature | MOO1 Original | HoO Modernization | Documented? |
|---------|--------------|-------------------|-------------|
| F-key navigation | Screens more isolated; closing required in some cases | All F1–F7 screens directly switchable; no screen needs to be "closed" first | ✅ Yes, flagged in navigation-flow.md |
| Tech screen navigation | Full-screen modal, no command bar | Full nav screen with command bar | ✅ Yes, documented as QoL |
| Fleet screen navigation | Full-screen modal | Full nav screen with command bar | ✅ Yes |
| Number of races/opponents | 5 AI races max (6 total) | Up to 9 opponents (10 races total) | ✅ Yes, noted in screen-inventory.md |
| Galaxy shapes | Random only | Spiral/Elliptical/Irregular options | ✅ Yes |
| Victory types shown during race select | Not in MOO1 | Recommended victory type shown | ✅ Yes, flagged as enhancement |
| Difficulty rating per race | Not in MOO1 | Difficulty indicator shown | ✅ Yes |
| Auto-explore for fleets | Not in MOO1 | Added | ✅ Yes (behavior needs spec) |
| Right-click context menus | Not in MOO1 | Optional enhancement | ✅ Yes |
| Mini-map | Not in MOO1 | Considered (marked optional) | ✅ Yes |
| Build queue ordering (drag) | Not in MOO1 | Added | ✅ Yes (incomplete spec) |
| Color-blind mode | Not in MOO1 | Added to settings | ✅ Yes |
| Text scaling | Not in MOO1 | Added to settings | ✅ Yes |
| Tutorial mode | Not in MOO1 | Under consideration | ✅ Noted as gap |
| Pet-themed races (Hamsters/Mice/etc.) | Human/alien races | All-new pet species | ✅ Core design decision |

All modernizations are **clearly distinguished** from MOO1-faithful elements in the documentation. No modernization silently replaces a MOO1 feature without acknowledgment.

---

## 6. Outstanding Issues & Remaining Gaps

### 6.1 Critical Gaps (Block Implementation)

1. **Tactical Combat UI** — `tactical-combat-ui.md` has the overall structure (pre-battle screen, hex grid, combat log) but is missing: per-ship health bars, movement point display, initiative/turn order UI, damage pop-up numbers, missile tracking visual, combat speed control, wait/done button, bombard phase integration. **[FIXED 2026-04-13: Added HP bars on grid tokens, MP display, initiative strip, missile tracking section with in-flight tokens, WAIT/DONE buttons in ship panel, combat speed bar, and bombardment phase trigger documentation]**

2. **Ground Combat Screen** — Not documented anywhere. MOO1 had a simple troop-vs-population screen with animated rolls and casualty display. Needs: attacker/defender troop counts, combat animation, casualty display, victory/defeat result, conquest options. **[FIXED 2026-04-13: Created `ground-combat-ui.md` with full troop display, round animation, casualty display, victory/defeat/pyrrhic screens, conquest options, and transport ship notes]**

3. **Spy Network UI** — Not documented. MOO1 had spy count, security/espionage sliders, target empire selection, and spy mission result logs. `espionage-ui.md` needs to be created. **[FIXED 2026-04-13: Created `spy-network-ui.md` with spy assignment screen, mission selection, all result notification types (success/caught/foiled/killed), spy log, RACES screen integration, and budget display]**

### 6.2 Important Gaps (Will Cause Confusion)

4. **Tech Trade UI** — Partially referenced in diplomacy flow but never specced (our tech list, their tech list, trade terms, acceptance likelihood).

5. **Population Transfer UI** — Referenced in screen-inventory §2.2 as Missing. The mechanism (which button triggers it, amount input, transport ship requirement) is undefined.

6. **Random Event Screens** — 8 event types from MOO1 (space monster, comet, plague, rebellion, ancient derelict, supernova, gift, industrial accident) have zero UI specification.

7. **Enemy Colony Info Panel** — The right panel state when clicking an enemy colony on the galaxy map is referenced but not wireframed. Unclear what action buttons appear.

8. **`main-screens.md` stale language** — §4 (Technology Screen) and §6 (Fleet Screen) still say "full-screen modal with NO bottom command bar" — contradicts the resolved C3/C4 decisions. Needs a cleanup pass. **[FIXED 2026-04-13: Removed 'full-screen modal with NO bottom command bar' from §4 and §6; both now correctly say 'full navigation screen with the bottom command bar']**

9. **`command_menu_planets.md` hotkey error** — Lists PLANETS as F6, should be F2. **[FIXED 2026-04-13: Hotkey corrected from F6 to F2 in title, Overview section, and removed 'does NOT display the bottom command bar' per C4 resolution]**

10. **`screen-inventory.md` wireframe counts** — Still shows 0 wireframes in summary table; many wireframes now exist. **[FIXED 2026-04-13: Summary table updated — wireframe counts corrected from 0 to actual numbers (10 wireframe files), documented files list, HoO documented count updated to 28]**

### 6.3 Minor Issues

11. **Bombardment phase** — Missing from `state-transitions.md` combat state machine. `tactical-combat-ui.md` documents the bombardment UI but `state-transitions.md` §9 jumps from `COMBAT_RESULT` to "Return to Galaxy Map" without mentioning bombardment. **[PARTIALLY FIXED 2026-04-13: `tactical-combat-ui.md` now documents the bombardment phase trigger with full state flow (COMBAT_RESULT → BOMBARDMENT_PHASE → RETURN_TO_MAP); `state-transitions.md` still needs update]**

12. **Auto-explore behavior** — Referenced in interaction spec and wireframes but behavior is undefined (what happens when it encounters an enemy, does it stop or report?).

13. **Fleet deployment: ACCEPT with 0 ships** — Edge case not specified.

14. **Hull shortcut keys 1–4** — Ship design has 6 hull classes but shortcuts only cover 4.

15. **High Council wireframe** — Screen-inventory claims "✅ Complete" but no wireframe exists and main-screens §9 section content appears missing.

16. **Opening story/cinematic** — MOO1 had an opening text crawl. Not documented for HoO.

---

## 7. Summary Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| **Layout fidelity to MOO1** | ✅ 9/10 | Galaxy map, command bar, info panel exact. Minor stale-text issues. |
| **Navigation model** | ✅ 9/10 | Hub-and-spoke correctly implemented; modernizations clearly flagged. |
| **Turn flow** | ✅ 9/10 | All phases documented; combat phases need detail. |
| **Core screen coverage** | ✅ 8/10 | 26/34 screens; core gameplay well covered. |
| **Combat UI** | ⚠️ 4/10 | Pre-battle and tactical structure present; missing critical details. |
| **Diplomacy UI** | ⚠️ 6/10 | Race list and audience flow documented; no full wireframe; tech trade missing. |
| **Supporting UIs** | ❌ 3/10 | Ground combat, spies, random events, save/load not documented. |
| **Wireframe completeness** | ⚠️ 5/10 | Core screens wireframed; 40% are stubs or missing. |
| **Modernization handling** | ✅ 10/10 | All mods clearly labeled; nothing silently replaces MOO1 behavior. |
| **Terminology consistency** | ✅ 8/10 | Key terms resolved (Research→Technology, Biotechnology→Planetology). §3.4–3.6 still need passes. |

**Overall: B+ / 75%** — Strong foundation with clear MOO1 grounding. Missing specs are in support screens (combat detail, espionage, ground combat), not core gameplay.

---

## 8. Recommended Next Actions (Priority Order)

1. **Cleanup pass on `main-screens.md`** — Remove stale "full-screen modal" language from §4 and §6 per C3/C4 resolution.

2. **Fix `command_menu_planets.md` hotkey** — PLANETS = F2, not F6.

3. **Update `screen-inventory.md` summary table** — Wireframe counts are wrong (show 0, many exist).

4. **Create `ground-combat-ui.md`** — Troop counts, roll animation, casualty display, conquest options.

5. **Create `espionage-ui.md`** — Spy count, security/espionage sliders, target selection, results log.

6. **Expand `tactical-combat-ui.md`** — Add: per-ship HP bars, movement points, initiative order, damage numbers, missile tracking, wait/done button, combat speed, bombardment phase trigger.

7. **Add bombardment phase to `state-transitions.md`** §9 combat state machine.

8. **Create `random-events-ui.md`** — Notification layouts for all 8 MOO1 event types.

9. **Expand diplomacy wireframe** — Full layout for RACES screen, tech trade sub-screen, AI-initiated audience popup.

10. **Standardize remaining terminology** — §3.4 (Game Menu vs Pause Menu vs In-Game Menu), §3.5 (Production Sliders), §3.6 (Hull size naming vs class naming).

11. **Expand stub wireframes** — `new-game-setup.md`, `diplomacy-screen.md`, `end-game-screens.md` need full ASCII detail.

12. **Spec population transfer UI** — Which trigger, amount input, transport ship requirement.

13. **Enemy colony info panel** — Wireframe the right-panel state for enemy colony selection.

14. **High Council wireframe** — Create and verify against `main-screens.md` §9.

---

*Review completed: 2026-04-12*  
*Files reviewed: 24 design/wireframe files + 33 reference screenshots*  
*MOO1 reference: StrategyWiki (strategywiki-moo1.txt)*
