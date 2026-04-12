# UI/UX Design Review — Gap Analysis

**Reviewed:** 2026-04-12  
**Reviewer:** Wesley (subagent)  
**Documents reviewed:**
- `UI_OVERVIEW.md`
- `main-screens.md`
- `navigation-flow.md`
- `state-transitions.md`
- `screen-inventory.md`
- `interaction-spec.md`
- `information-displays.md`
- `tactical-combat-ui.md`
- `wireframes/` (all files)

---

## Summary

The documentation is thorough for core gameplay screens and well-grounded in MOO1 references. The main weaknesses are:

1. **Screens missing wireframes** (pre-game, diplomacy, combat results, victory/defeat)
2. **Keyboard shortcut conflicts and inconsistencies** across documents
3. **Terminology inconsistencies** (screen names differ between docs)
4. **Undefined UI states and edge cases** (especially for diplomacy and combat)
5. **Screen inventory items marked "missing"** that now have screenshots
6. **Navigation flow vs state-transitions conflicts** (F7 Reports, F8 Council)
7. **Cross-reference mismatches** (modal behavior descriptions differ)

---

## 1. Screens Mentioned But Not Wireframed

### 1.1 Pre-Game Flow — No Wireframes
- **Issue:** `main-screens.md` and `navigation-flow.md` fully describe a 5-step new game setup (Galaxy Setup → Race Select → Banner → Emperor Name → Home World Name), but `wireframes/` has zero pre-game wireframes.
- **Files:** `main-screens.md` §1, `navigation-flow.md` §1, `screen-inventory.md` §1
- **Screenshots available:** All 5 steps have screenshots in `moo_screens/` (see item 7 below)
- **Suggested fix:** Create `wireframes/new-game-setup.md` covering all 5 steps. Use existing screenshots as reference.

### 1.2 Diplomacy / RACES Screen — No Wireframe
- **Issue:** `main-screens.md` §7 contains a detailed ASCII layout for the Diplomacy screen, but no corresponding wireframe file exists in `wireframes/`. The `command_menu/command_menu_races.md` file exists but appears to cover only the command-bar button, not the full screen.
- **Files:** `main-screens.md` §7, `screen-inventory.md` §5
- **Suggested fix:** Create `wireframes/diplomacy-screen.md` with: race list, race detail panel, audience/negotiation sub-flow, tech trade UI, treaty negotiation panel.

### 1.3 Planet Management Detail View — No Wireframe
- **Issue:** `main-screens.md` §3 has a detailed ASCII wireframe for single-planet management. No `wireframes/planet-management.md` exists—only `command_menu/command_menu_planets.md` covers the command button.
- **Suggested fix:** Create `wireframes/planet-management.md` with production sliders, colony stats, planet image panel, and build queue.

### 1.4 Game Menu (ESC/GAME) — No Wireframe
- **Issue:** The Game Menu modal (Save/Load/Options/Retire/Quit) is described in `main-screens.md` §8 but has no wireframe.
- **Suggested fix:** Add to `wireframes/` or append to `moo1-reference-wireframes.md`.

### 1.5 Victory / Defeat Screens — No Wireframe
- **Issue:** `state-transitions.md` §8.4 defines 5 victory conditions and 2 defeat conditions with screen names (`VICTORY_DOMINATION`, `DEFEAT_CONQUEST`, etc.), but no wireframe or layout spec exists for any of them.
- **Files:** `state-transitions.md` §8.4, `screen-inventory.md` §6
- **Suggested fix:** Create `wireframes/end-game-screens.md`.

### 1.6 High Council Screen (F8) — No Wireframe
- **Issue:** `screen-inventory.md` §6.3 says this is "✅ Complete" but there is no wireframe file. The layout is not described in `main-screens.md` either (§9 is listed in the TOC but the section content is missing from the reviewed file).
- **Suggested fix:** Create wireframe; verify `main-screens.md` §9 exists and is complete.

### 1.7 Ground Combat — Documented as Missing, Still Missing
- **Issue:** `screen-inventory.md` §3.3 and `navigation-flow.md` §5 both reference Ground Combat as a turn-resolution step, but no specification document exists. `tactical-combat-ui.md` covers only space combat.
- **Suggested fix:** Create `ground-combat-ui.md` with troop counts, combat roll animation, conquest options.

### 1.8 Spy Network / Espionage UI — Documented as Missing, Still Missing
- **Issue:** `screen-inventory.md` §5.4 calls for `espionage-ui.md`; it does not exist.
- **Suggested fix:** Create `espionage-ui.md` with spy count, security/espionage sliders, target selection, results log.

### 1.9 Save / Load Game UI — Documented as Missing, Still Missing
- **Issue:** `screen-inventory.md` §7.1–7.2 call for a `save-load-ui.md`. `state-transitions.md` §10.2 has a detailed Save Game flow diagram, but no wireframe.
- **Suggested fix:** Create `wireframes/save-load-ui.md`.

### 1.10 Random Events UI — Documented as Missing, Still Missing
- **Issue:** `screen-inventory.md` §8.4 lists 8 random event types (space monster, plague, comet, etc.) with no UI spec. `state-transitions.md` §3.2 lists `SPACE_MONSTER`, `PLAGUE`, `COMET`, `REBELLION` as possible triggers with no popup design.
- **Suggested fix:** Create `random-events-ui.md` with notification layouts per event type.

### 1.11 Opening Cinematic / Story — Documented as Missing, Still Missing
- **Issue:** `screen-inventory.md` §1.4 calls for a narrative spec (`narrative/opening-story.md`); it does not exist.
- **Suggested fix:** Create `narrative/opening-story.md`.

---

## 2. Interactions Described But Not Specified

### 2.1 Population Transfer / Transport Ships
- **Issue:** `screen-inventory.md` §2.2 lists "Transfer Population" as ❌ Missing. `interaction-spec.md` mentions population transfer in modal types and slider context menus but never shows the actual UI for how you move population between planets.
- **Files:** `screen-inventory.md` §2.2, `interaction-spec.md` §4.1
- **Suggested fix:** Specify: which slider/button triggers it, the amount input dialog, the transport ship requirement, and success/failure states.

### 2.2 Fleet Split / Merge UI
- **Issue:** `interaction-spec.md` §1.1 (Fleet Command) references `[SPLIT FLEET]` and `[MERGE WITH]` buttons, and `navigation-flow.md` §4.4 shows a `SplitFleet` node, but there is no wireframe or step-by-step spec for either operation.
- **Files:** `interaction-spec.md` §1.1, `navigation-flow.md` §4.4
- **Suggested fix:** Add a split-fleet dialog spec: ship selection checkboxes, new fleet naming, confirmation.

### 2.3 Tech Trade During Diplomacy
- **Issue:** `screen-inventory.md` §5.3 calls it ❌ Missing. `interaction-spec.md` §1.1 (Diplomacy) mentions `[PROPOSE]` and trade deal flows but the actual tech-trade screen (our list, their list, terms) is unspecified.
- **Suggested fix:** Add tech trade screen to diplomacy wireframe.

### 2.4 Right-Click on Empty Space — "Show Grid" Toggle Not Specified
- **Issue:** `interaction-spec.md` §1.3 lists "Show Grid G" in the empty-space context menu, but `G` is not listed in the Galaxy Map keyboard shortcuts table (§2.2). The grid itself is not described anywhere.
- **Files:** `interaction-spec.md` §1.3, §2.2
- **Suggested fix:** Add `G` to Galaxy Map shortcuts table; define what the grid overlay looks like.

### 2.5 Rally Points — Referenced But Unspecified
- **Issue:** `screen-inventory.md` §2.4 lists Rally Points as ⚠️ Basic. `interaction-spec.md` §1.3 includes "Set as Rally Point" in the right-click menu and §2.4 lists `P` (Patrol) and rally keyboard shortcut, but there is no spec for how rally points are set, displayed, or cleared.
- **Suggested fix:** Define rally point display (marker on map), set/clear interaction, and behavior (auto-redirect newly built ships).

### 2.6 Auto-Explore Behavior
- **Issue:** `interaction-spec.md` §2.4 lists `X` for auto-explore and right-click menus show "Auto-Explore" on fleets, but what happens when a fleet is set to auto-explore is not defined. What does it do when it finds an enemy? Does it stop? Does it report back?
- **Suggested fix:** Add auto-explore behavior spec to `interaction-spec.md` or fleet behavior doc.

### 2.7 Build Queue Management
- **Issue:** `interaction-spec.md` §6.2 describes dragging to reorder the production queue, but the queue itself is only vaguely shown as "Ship queue item → Select → Highlight for removal" in §1.1. There's no wireframe for the queue, no spec for what happens when a build is cancelled mid-progress, or how the queue interacts with production sliders.
- **Suggested fix:** Add build queue wireframe to planet management spec.

### 2.8 MAP Button Cycling Behavior
- **Issue:** `main-screens.md` §2 says "The MAP button cycles through overlay modes" (Colonies → Environments → Minerals → back to normal?). But `navigation-flow.md` §2 shows MAP as opening a `MapView` modal, and `state-transitions.md` §1.2 shows MAP navigating to a separate "Galaxy Overview" screen. These are three different behaviors.
- **Files:** `main-screens.md` §2, `navigation-flow.md` §2, `state-transitions.md` §1.2, `wireframes/command_menu/command_menu_map.md`
- **Suggested fix:** Decide and document: Does MAP cycle overlays in-place on the galaxy map, or open a separate screen? Update all three docs to match.

---

## 3. Inconsistent Terminology

### 3.1 "Research Screen" vs "Technology Screen"
- **Conflict:** `UI_OVERVIEW.md` and `main-screens.md` consistently call it the **Technology Screen** (F4). `navigation-flow.md` §4.2 calls it **Research Screen** and the Mermaid flowchart node is labeled `Research`. `state-transitions.md` §1.2 navigation matrix column header is "Research (F4)". `interaction-spec.md` §2.5 header is "Research Tree (F4)". `wireframes/research-tree.md` title uses "Technology Screen."
- **Files:** All documents
- **Suggested fix:** Standardize on **"Technology Screen (F4)"** everywhere, matching the in-game button label (TECH).

### 3.2 "Fleet Command" vs "Fleet Screen"
- **Conflict:** The F3 screen is called "Fleet Command" in `interaction-spec.md` §2.4, "Fleet Screen" in `navigation-flow.md` §4.4 and `main-screens.md` §6, and "Fleet Overview" in the `wireframes/fleet-screen.md` title header. The command bar button is labeled "FLEET."
- **Suggested fix:** Standardize on **"Fleet Screen (F3)"** to match button label.

### 3.3 "Diplomacy Screen" vs "Races Screen"
- **Conflict:** The F5 screen is the **RACES** button in the command bar, but the screen is called "Diplomacy Screen" in `main-screens.md` §7 and `navigation-flow.md` §4.3, and "Diplomatic Relations" in `information-displays.md`. `screen-inventory.md` §2.7 uses "Diplomacy Screen (F5)."
- **Suggested fix:** Standardize on **"Races Screen (F5)"** to match button label, or add a note that "Races" and "Diplomacy" are the same screen.

### 3.4 "Game Menu" vs "Pause Menu" vs "In-Game Menu"
- **Conflict:** The ESC/GAME button modal is called "Game Menu" in `main-screens.md` §8, "Pause Menu" in `screen-inventory.md` §7.4, and "In-Game Menu" in `state-transitions.md` §8.1 (as `GAME_PAUSED`).
- **Suggested fix:** Standardize on **"Game Menu"** to match the button label.

### 3.5 "Production Sliders" vs "Allocation Sliders" vs "Command Sliders"
- **Conflict:** The 5 production sliders are called "Production Sliders" in `UI_OVERVIEW.md`, `main-screens.md`, and `interaction-spec.md`, but "Allocation Sliders" appears in `state-transitions.md` §12 JSON context.
- **Suggested fix:** Standardize on **"Production Sliders"** throughout.

### 3.6 Hull Size Naming Inconsistency
- **Conflict:** `main-screens.md` §5 lists hull classes as Scout/Fighter/Destroyer/Cruiser/Battleship/Dreadnought. `interaction-spec.md` §2.6 shortcut `1-4` maps to "1=Small, 2=Medium, 3=Large, 4=Huge." These are different naming conventions — functional names vs size labels. The shortcut only maps 4 keys but there are 6 hull classes.
- **Files:** `main-screens.md` §5, `interaction-spec.md` §2.6
- **Suggested fix:** Clarify that the size labels (Small/Medium/Large/Huge) are internal groupings, not hull class names. Update the shortcut spec — either map all 6 keys (`1`–`6`) or explain the shortcut covers the 4 base sizes and Scout/Dreadnought are auto-assigned.

### 3.7 "Biotechnology" vs "Planetology"
- **Conflict:** The 6th tech field is called **Planetology** in `UI_OVERVIEW.md` (tech field tabs: COMP/CONST/FORCE/PLAN/PROP/WEAP), `main-screens.md` §4 (field tabs), and `interaction-spec.md` §2.5. But `information-displays.md` (Research Progress section) calls it **Biotechnology**, and `screen-inventory.md` §2.5 (Research Screen) also uses Biotechnology in examples. MOO1 uses **Planetology**.
- **Suggested fix:** Standardize on **"Planetology"** to match MOO1 and the command-bar tab labels.

---

## 4. Missing Keyboard Shortcuts / Hotkeys

### 4.1 Conflict: F10 vs G for Game Menu
- **Issue:** `UI_OVERVIEW.md` navigation table lists the GAME button hotkey as **F10/ESC**. `navigation-flow.md` §9 keyboard shortcuts table lists **G** for GAME menu (not F10). `interaction-spec.md` §2.1 global shortcuts does not list F10 or G for Game Menu at all — it lists only ESC for "Open Menu / Cancel."
- **Files:** `UI_OVERVIEW.md` nav table, `navigation-flow.md` §9, `interaction-spec.md` §2.1
- **Suggested fix:** Resolve to one canonical hotkey. MOO1 used no F10 (ESC was the main escape). Recommend: **ESC** = Game Menu, **F10** = optional alias. Remove `G` from navigation-flow §9 (it conflicts with "Toggle Grid" in `interaction-spec.md` §2.2).

### 4.2 G Key Conflict
- **Issue:** `navigation-flow.md` §9 assigns `G` to "GAME menu." `interaction-spec.md` §2.2 assigns `G` to "Toggle Grid" on the Galaxy Map. Both cannot be true.
- **Suggested fix:** Remove `G` from navigation-flow §9 game menu entry. Galaxy Map `G` = Toggle Grid is the more useful binding.

### 4.3 D Key Conflict
- **Issue:** `navigation-flow.md` §9 assigns `D` to "DESIGN screen." `interaction-spec.md` §2.3 assigns `D` to "Focus Defense Slider" on Planet Management. These are on different screens so they don't technically conflict, but since navigation shortcuts are described as "Galaxy Map Actions" vs "In Modals" — the navigation-flow §9 description says D is a global shortcut.
- **Files:** `navigation-flow.md` §9, `interaction-spec.md` §2.3
- **Suggested fix:** Clarify in `navigation-flow.md` §9 that letter shortcuts (G/D/F/M/R/P/T) are only active on the Galaxy Map, not globally. This matches `interaction-spec.md`'s screen-specific sections.

### 4.4 R Key Triple Conflict
- **Issue:** `navigation-flow.md` §9 assigns `R` to "RACES/Diplomacy." `interaction-spec.md` §2.2 assigns `R` to "Range Circles" (Galaxy Map), §2.3 assigns `R` to "Focus Research Slider" (Planet Management), and §2.8 assigns `R` to "Retreat Ship" (Tactical Combat).
- **Suggested fix:** Galaxy Map shortcuts should be mutually exclusive. Choose one use of R on Galaxy Map (Range Circles makes sense; R = RACES is a stretch). Document clearly that R means different things in different screen contexts.

### 4.5 F Key Conflict
- **Issue:** `navigation-flow.md` §9 assigns `F` to "FLEET screen." `interaction-spec.md` §2.2 assigns `F` to "Select Next Fleet" (Galaxy Map). The intended behavior on Galaxy Map is ambiguous: does pressing F open the Fleet Screen modal, or cycle to the next fleet selection?
- **Suggested fix:** Assign `F3` to open Fleet Screen modal; assign `F` (letter) to cycle fleet selection on Galaxy Map. Document this explicitly.

### 4.6 Missing: Hotkeys for Fleet Deployment Panel
- **Issue:** The Fleet Deployment Panel (clicking a fleet at a star) has `<<` `<` `>` `>>` buttons but no keyboard shortcuts defined. `interaction-spec.md` §1.1 covers mouse clicks only.
- **Suggested fix:** Define keyboard equivalents for deployment count adjustment (e.g., arrow keys, `[`/`]`).

### 4.7 Missing: ENTER / ESC Behavior in Fleet Deployment
- **Issue:** The Fleet Deployment Panel has `[CANCEL]` and `[ACCEPT]` buttons but `interaction-spec.md` doesn't specify that ENTER = ACCEPT or ESC = CANCEL for this panel. This matters because ENTER also ends the turn globally.
- **Suggested fix:** Explicitly state: while Fleet Deployment Panel is active, ENTER = ACCEPT, ESC = CANCEL. The global ENTER (End Turn) is suppressed.

### 4.8 Missing: Technology Screen Navigation Shortcuts
- **Issue:** `interaction-spec.md` §2.5 Research Tree shortcuts list keys `1-6` for selecting tech fields, but the Technology Screen as described in `main-screens.md` §4 uses tabs (COMP/CONST/FORCE/PLAN/PROP/WEAP), not a tree structure. The shortcut number mapping (1=Weapons?) is undefined.
- **Suggested fix:** Map the 6 numbers to the 6 fields explicitly (e.g., 1=Computers, 2=Construction, 3=Force Fields, 4=Planetology, 5=Propulsion, 6=Weapons). Confirm this matches the tab order in the wireframe.

### 4.9 Missing: High Council Shortcuts
- **Issue:** `interaction-spec.md` §2.9 documents High Council shortcuts but the High Council screen is F8. `state-transitions.md` §1.2 navigation matrix shows F8 as only accessible "when Council is in session." There's no spec for how the player knows council is active or how they navigate to F8 from a notification.
- **Suggested fix:** Document the Council notification → F8 unlock flow.

---

## 5. Undefined UI States / Edge Cases

### 5.1 Galaxy Map: Enemy Colony Selected
- **Issue:** `main-screens.md` §2 info panel states list "Enemy Colony Selected → Enemy Info" with a brief description, but there's no wireframe or detailed spec for this panel. What buttons appear? Can you declare war from here? Can you send a diplomat?
- **Files:** `main-screens.md` §2, `navigation-flow.md` §3
- **Suggested fix:** Add wireframe for Enemy Colony info panel, including action buttons.

### 5.2 Galaxy Map: "EmptySelected" State
- **Issue:** `navigation-flow.md` §3 Mermaid diagram includes an `EmptySelected` state (for explored but empty star systems). The note says "Something is always selected" but this state is for "clicking explored empty" — what does that mean? Can an explored star have no planet? What does the info panel show?
- **Files:** `navigation-flow.md` §3
- **Suggested fix:** Clarify or remove the `EmptySelected` state; in MOO1, every star has a planetary system. Define what "explored empty" means.

### 5.3 Planet at 0% Ecology — Waste Behavior
- **Issue:** The production slider section in `UI_OVERVIEW.md` and `main-screens.md` shows ECO at 0% = "Clean" for the example planet. But what happens visually when waste exists and ECO is 0%? Is there a warning? Does the colony info panel change color? This is a common game state and the UI response is undefined.
- **Suggested fix:** Define visual warning state for uncleaned waste.

### 5.4 Production Sliders: All Sliders Locked State
- **Issue:** `interaction-spec.md` §3.1 says "If all sliders are locked and don't total 100%, show warning." But it doesn't define what the warning looks like or whether the game prevents this state.
- **Suggested fix:** Add: which UI element shows the warning, whether it blocks gameplay, and how to resolve it.

### 5.5 Ship Design: Exceeding Hull Space
- **Issue:** `main-screens.md` §5 shows "Space Used: 98/125" for an example design. What happens if the player tries to add a component that would exceed hull space? Is the add button disabled? Is there a toast? The interaction-spec §1.1 (Ship Design) says `[ADD]` adds the component but doesn't handle the full-hull case.
- **Suggested fix:** Define visual state for "hull full" and over-capacity error.

### 5.6 Fleet Deployment: Deploying 0 Ships
- **Issue:** The `<<` button sets deployment to 0 (leave all behind). If the player clicks ACCEPT with all counts at 0, what happens? This is presumably a no-op but it's not specified.
- **Files:** `main-screens.md` §2 Fleet Deployment, `wireframes/fleet-deployment-panel.md`
- **Suggested fix:** Disable ACCEPT if all counts are 0, or provide a warning.

### 5.7 Tech Screen: No Active Research
- **Issue:** `main-screens.md` §4 shows "Currently Researching: Battle Computer II" in the right half. What does the panel show when nothing is being researched (e.g., at the start of a new game before first research is selected)? The right half layout is undefined for this state.
- **Suggested fix:** Define the "no active research" state for the right panel.

### 5.8 Combat: Planetary Bombardment After Space Victory
- **Issue:** `tactical-combat-ui.md` shows a detailed Bombardment UI but it's unclear when this UI appears. Does it come after space combat ends, as a separate phase? Does it replace the combat results screen? `state-transitions.md` §9 combat flow doesn't mention bombardment at all — it jumps from `COMBAT_RESULT` to "Return to Galaxy Map."
- **Files:** `tactical-combat-ui.md`, `state-transitions.md` §9
- **Suggested fix:** Add bombardment as a post-combat phase in the state machine; specify the transition trigger.

### 5.9 Diplomacy: AI-Initiated Audience
- **Issue:** `navigation-flow.md` §4.3 shows `MessageReceive` as a trigger that opens a diplomatic audience during the turn. `state-transitions.md` §4.3 lists "War Declared (by AI)" and "Treaty Offered" as triggers. But the actual popup/dialog for an AI-initiated audience is not wireframed. What does it look like? Is it a full modal or a notification?
- **Suggested fix:** Wireframe the AI-initiated diplomacy popup in the diplomacy wireframe.

### 5.10 Turn End: Slider Not Totaling 100%
- **Issue:** If a player somehow gets production sliders to not total 100% (e.g., through edge cases in the auto-balance logic described in `interaction-spec.md` §3.1), what happens when they hit End Turn? Is this a warning? A blocking error? This is not addressed in `state-transitions.md` §3.3 (Turn End Confirmation) or in the edge cases section.
- **Suggested fix:** Add to `state-transitions.md` §14 Edge Cases.

---

## 6. Conflicts Between navigation-flow.md and state-transitions.md

### 6.1 F7 Reports Screen
- **Conflict:** `navigation-flow.md` §2 Mermaid diagram (Galaxy Map hub) does not show a Reports screen. The Command Bar section in §2 mentions only 7 screens (GAME, DESIGN, FLEET, MAP, RACES, PLANETS, TECH). `state-transitions.md` §1.2 navigation matrix includes **F7 (Reports)** as a navigable screen from all other screens. `UI_OVERVIEW.md` command bar table lists only 8 buttons with no Reports — MAP is F1 (a separate button from the overlay).
- **Files:** `navigation-flow.md` §2, `state-transitions.md` §1.2, `UI_OVERVIEW.md`
- **Suggested fix:** Decide: does the game have a separate Reports screen (F7)? If yes, add the REPORTS button to the command bar in `UI_OVERVIEW.md` and all wireframes. If no, remove F7 from `state-transitions.md` and `interaction-spec.md`. Note: MOO1 did not have a separate F7 Reports screen. All information was integrated in the main screens.

### 6.2 F8 High Council Screen
- **Conflict:** `navigation-flow.md` §7 Screen Hierarchy shows Council at the GALAXY MAP level under "NEXT TURN → Turn Resolution → Council." It does not list F8 as a direct navigation option. `state-transitions.md` §1.2 lists F8 as navigable with `✓*` (only when Council is in session). `interaction-spec.md` §2.1 lists `F8` as a global shortcut to "Council."
- **Files:** `navigation-flow.md` §7, `state-transitions.md` §1.2, `interaction-spec.md` §2.1
- **Suggested fix:** Clarify that F8 is only enabled during a Council session (triggered by turn events). Outside of Council sessions, F8 should have no effect or be visually disabled in the command bar. Document this state in `UI_OVERVIEW.md`.

### 6.3 Modal vs. In-Place Panel for PLANETS (F2)
- **Conflict:** `navigation-flow.md` §2 groups PLANETS under "Full-Screen Modal Overlays." `main-screens.md` §3 shows PLANETS as a full-screen layout with the command bar present at the bottom — identical to the Galaxy Map layout, not a modal. `state-transitions.md` §1.2 allows F1-F7 cross-navigation from the Planets screen, consistent with it being a screen, not a modal.
- **Files:** `navigation-flow.md` §2, `main-screens.md` §3
- **Suggested fix:** Correct `navigation-flow.md` §2 to not classify PLANETS as a modal. It is a full navigation screen. Only TECH (no command bar, OK to exit) and FLEET (OK to exit) appear to be true modals. GAME MENU, by contrast, is an overlay modal.

### 6.4 Technology Screen: Modal or Full Screen?
- **Conflict:** `main-screens.md` §4 explicitly states "This is a full-screen modal with NO bottom command bar." `state-transitions.md` §1.2 shows F1-F6 navigation available from Research (F4), implying you can navigate away from it using F-keys — which contradicts the "no command bar" description. If there's no command bar, the F-keys should not work.
- **Files:** `main-screens.md` §4, `state-transitions.md` §1.2
- **Suggested fix:** Resolve: If Tech is a full-screen modal (like MOO1), F-key navigation should be blocked from it. Update `state-transitions.md` navigation matrix to show `✗` for Tech → other screens. The OK button is the only exit.

### 6.5 Fleet Screen: Modal or Full Screen?
- **Same issue as 6.4.** `main-screens.md` §6 says Fleet Screen is "Full-screen modal with NO bottom command bar." `state-transitions.md` §1.2 shows F-key navigation available from Fleet (F3). Same contradiction.
- **Suggested fix:** Same resolution — if Fleet has no command bar, block F-key navigation. Update navigation matrix.

### 6.6 Turn End Confirmation: Optional vs Always
- **Conflict:** `state-transitions.md` §3.3 shows the End Turn confirmation dialog with a "Don't show warnings in future" checkbox. `interaction-spec.md` §8.5 shows the same dialog. But `state-transitions.md` §6.3 JSON lists `confirmationSettings.bypassable` including `END_TURN` → `skipTurnConfirmation`. If the confirmation is bypassed, the game goes directly to turn processing — but `navigation-flow.md` §5 turn flow shows no bypass path.
- **Suggested fix:** Add the bypass path to `navigation-flow.md` §5 turn resolution flowchart.

---

## 7. Screen Inventory Items Marked "Missing" That Now Have Screenshots

The `screen-inventory.md` was last updated before all screenshots were added. The following items are marked ❌ Missing or ⚠️ Partial in the inventory but screenshots now exist in `moo_screens/`:

| Inventory Status | Item | Screenshot Available |
|-----------------|------|---------------------|
| ⚠️ Partial | New Game Setup | `moo_new_game_menu.png` |
| ✅ (implied) | Banner Selection | `moo_new_game_banner_select.png` |
| ✅ (implied) | Emperor Name Entry | `moo_new_game_emporer_name.png` |
| ✅ (implied) | Home World Name | `moo_new_game_home_world_name.png` |
| ❌ Missing (ETA Display) | Fleet in transit ETA | `moo_galaxy_movingshipselected.png` (shows ETA) |
| ❌ Missing (ETA Display) | Fleet deployment ETA | `moo_galaxy_aftershipdestinationselected.png` |
| ⚠️ Basic (Fog of War) | Unexplored star view | `moo_galaxy_unexplored.png` |
| ⚠️ Basic (Range Circles) | Out-of-range display | `moo_galaxy_ship_select_destination_out_of_range.png` |
| Colony States | New colony | `moo_galaxy_planet_new.png` |
| Colony States | Post-terraform | `moo_galaxy_planet_post_tform.png` |
| Colony States | Population full | `moo_galaxy_planet_is_full.png` |
| Colony States | Max factories | `moo_galaxy_max_factories.png` |
| Turn notifications | New tech + eco | `moo_new_tech_eco_increase.png` |
| Turn notifications | Tech eco reduction | `moo_tech_eco_reduction.png` |

**Action:** Update `screen-inventory.md` Screenshot Reference Index to include `moo_new_tech_eco_increase.png` and `moo_tech_eco_reduction.png` (they appear in state-transitions.md but not in the screen inventory's screenshot index table).

**Also:** `moo_fleet_screen.png` is not listed in the screenshot reference table in `screen-inventory.md` but is referenced throughout other documents and does exist on disk.

---

## 8. Cross-References That Don't Match

### 8.1 Hotkey Table in UI_OVERVIEW.md vs interaction-spec.md
- **Conflict:** `UI_OVERVIEW.md` keyboard shortcuts table includes `ENTER/SPACE` for Next Turn. `interaction-spec.md` §2.1 global shortcuts lists `Enter` and `Space` separately with identical descriptions. However, `UI_OVERVIEW.md` does NOT include `Ctrl+S`, `Ctrl+L`, `Ctrl+Z`, `M`, `?`/`F11`, `Tab`, or any of the letter shortcuts (N/F/G/R/T/E) that `interaction-spec.md` defines as Galaxy Map shortcuts. The overview table appears incomplete.
- **Suggested fix:** Either expand `UI_OVERVIEW.md` shortcuts table or add a note referencing `interaction-spec.md` as the authoritative keyboard spec.

### 8.2 Ship Design: 6 Hull Classes vs shortcut `1-4`
- **Conflict (detailed above in 4.6):** `interaction-spec.md` §2.6 maps keys `1-4` to hull sizes (Small/Medium/Large/Huge), but `main-screens.md` §5 defines 6 hull classes (Scout, Fighter, Destroyer, Cruiser, Battleship, Dreadnought). The shortcut spec only covers 4, leaving Battleship and Dreadnought without hotkeys.
- **Suggested fix:** Map `1-6` to all hull classes, or explicitly state that `1-4` covers the base 4 sizes and Scout/Dreadnought require click.

### 8.3 Research Allocation: Single Field vs. Multi-Slider
- **Conflict:** `UI_OVERVIEW.md` shows 6 research allocation sliders (one per field). `main-screens.md` §4 shows 6 allocation sliders. But `screen-inventory.md` §2.5 notes "Research Allocation: N/A (single research) - MOO1 = 1 research at a time" with status N/A. This is contradictory — either HoO has multi-field allocation (6 sliders) or it researches one thing at a time.
- **Files:** `UI_OVERVIEW.md`, `main-screens.md` §4, `screen-inventory.md` §2.5
- **Suggested fix:** Make a design decision and document it clearly. If HoO uses 6 simultaneous research sliders (deviation from MOO1), state that explicitly. The wireframes show 6 sliders, so presumably this is intentional.

### 8.4 Max Opponents: 1-5 (MOO1) vs 1-9 (HoO)
- **Conflict:** `screen-inventory.md` §1.2 notes "MOO1: 1-5 opponents, HoO: 1-9 opponents" but `main-screens.md` §1 New Game Setup shows `[  5  ] (1-9)` — which shows the value 5 but range 1-9. MOO1 had 5 AI races max (6 total). HoO has 10 races total, so 9 opponents is plausible but needs the races list to support it.
- **Suggested fix:** Confirm max opponent count, update galaxy setup wireframe to show the correct default and range.

### 8.5 Diplomacy Screen: Bottom Command Bar Present or Not?
- **Conflict:** `main-screens.md` §7 Diplomacy screen ASCII wireframe shows the bottom command bar present. `navigation-flow.md` §2 classifies Diplomacy as a "Full-Screen Modal Overlay" (which by convention should NOT have the command bar). `state-transitions.md` §1.2 allows F-key navigation from Diplomacy, implying the command bar IS present.
- **Suggested fix:** Decide: Diplomacy is a full navigation screen with command bar (consistent with Planets). Update `navigation-flow.md` §2 to remove it from "modal overlays."

### 8.6 screen-inventory.md Claims 0 Wireframes; Wireframes Exist
- **Conflict:** `screen-inventory.md` §summary table shows "HoO Wireframes: 0" for every category. As of 2026-04-12, the following wireframes exist:
  - `wireframes/galaxy-map.md`
  - `wireframes/moo1-reference-wireframes.md`
  - `wireframes/research-tree.md`
  - `wireframes/ship-design-screen.md`
  - `wireframes/fleet-screen.md`
  - `wireframes/fleet-deployment-panel.md`
  - `wireframes/command_menu/` (6 files)
- **Suggested fix:** Update `screen-inventory.md` summary table and status tracking to reflect existing wireframes.

### 8.7 state-transitions.md References Non-Existent Screenshot
- **Issue:** `state-transitions.md` §3 visual references table includes `moo_new_tech_eco_increase.png` and `moo_tech_eco_reduction.png` — both exist on disk. However, these are not in the `screen-inventory.md` screenshot reference index table. Minor, but causes the index to be incomplete.
- **Suggested fix:** Add to screen-inventory.md screenshot index.

---

## Priority Summary

### 🔴 Critical — Blocks Implementation

| # | Issue | Location |
|---|-------|----------|
| C1 | MAP button behavior undefined (cycle vs modal vs screen) | §2.8 |
| C2 | F7 Reports: does this screen exist? | §6.1 |
| C3 | Tech/Fleet screens: modal (no F-key nav) or screen (F-keys work)? | §6.4–6.5 |
| C4 | Research allocation: 6 sliders simultaneously or 1 at a time? | §8.3 |
| C5 | Keyboard shortcut conflicts (G, R, F, D keys) | §4.1–4.5 |

### 🟡 Important — Gaps That Will Cause Confusion

| # | Issue | Location |
|---|-------|----------|
| I1 | No wireframes for pre-game, diplomacy, planet management, victory/defeat | §1.1–1.6 |
| I2 | Terminology inconsistencies across all documents | §3 |
| I3 | Ground combat, spy UI, save/load, random events — never specced | §1.7–1.10 |
| I4 | Population transfer UI undefined | §2.1 |
| I5 | Fleet split/merge interaction unspecced | §2.2 |
| I6 | Enemy colony info panel undefined | §5.1 |
| I7 | Bombardment missing from combat state machine | §5.8 |
| I8 | screen-inventory.md wireframe counts all wrong (shows 0, many exist) | §8.6 |

### 🟢 Minor — Clean-Up Items

| # | Issue | Location |
|---|-------|----------|
| M1 | Screen inventory screenshot index missing 3 screenshots | §7, §8.7 |
| M2 | Slider lock all-locked warning not designed | §5.4 |
| M3 | Auto-explore behavior undefined | §2.6 |
| M4 | Build queue cancel mid-progress behavior | §2.7 |
| M5 | Tech screen: no active research state | §5.7 |
| M6 | Fleet deployment: ACCEPT with 0 ships | §5.6 |
| M7 | Turn bypass path missing from navigation flow | §6.6 |
| M8 | Hull shortcut keys `1-4` only covers 4 of 6 classes | §4.6, §8.2 |

---

## Suggested Next Actions (Ordered)

1. **Resolve the 5 critical design decisions** (C1–C5 above) — these require a human decision, not just documentation.
2. **Update `screen-inventory.md`** wireframe counts and screenshot index.
3. **Standardize terminology** — pick one name per screen and do a find/replace pass across all docs.
4. **Create `wireframes/diplomacy-screen.md`** — highest-value missing wireframe for a complex screen.
5. **Create `wireframes/new-game-setup.md`** — all screenshots exist, just needs ASCII wireframes.
6. **Resolve keyboard conflicts** — create a single canonical `keybindings-reference.md` that all other docs link to.
7. **Create `ground-combat-ui.md`** and **`espionage-ui.md`** — critical missing specs.
8. **Add bombardment phase** to `state-transitions.md` §9 combat state machine.
9. **Update `navigation-flow.md`** to fix modal vs. screen classification for PLANETS and DIPLOMACY.

---

*Generated by Wesley (subagent) — 2026-04-12*
