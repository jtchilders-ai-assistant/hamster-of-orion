# UI Screen Inventory - MOO1 vs Hamster of Orion

## Overview

This document provides a comprehensive inventory of ALL screens and interfaces from the original Master of Orion (1993) compared against existing Hamster of Orion UI documentation. It identifies gaps, screens needing updates, and serves as a roadmap for UI specification completion.

**Reference Materials:**
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)
- [Planetary Controls Explained PDF](file:///Users/jchilders/mywork/hamster-of-orion/design/Master%20of%20Orion%20Planetary%20Controls%20Explained.pdf)
- [StrategyWiki Reference Text](file:///Users/jchilders/mywork/hamster-of-orion/reference/strategywiki-moo1.txt)
- Screenshot Directory: [design/moo_screens/](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/)

---

## Screenshot Reference Index

Screenshots are located in `../moo_screens/`. The following screenshots are available as visual references:

| Category | Screenshot | Description |
|----------|------------|-------------|
| New Game | [moo_new_game_menu.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_menu.png) | New game / main menu |
| New Game | [moo_new_game_race_select.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_race_select.png) | Race selection screen |
| New Game | [moo_new_game_banner_select.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_banner_select.png) | Banner/flag selection |
| New Game | [moo_new_game_emporer_name.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_emporer_name.png) | Emperor name entry |
| New Game | [moo_new_game_home_world_name.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_home_world_name.png) | Home world naming |
| Galaxy Map | [moo_galaxy_home.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_home.png) | Galaxy map - home view |
| Galaxy Map | [moo_galaxy_unexplored.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_unexplored.png) | Galaxy map - unexplored fog |
| Galaxy Map | [moo_galaxy_shipselect.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_shipselect.png) | Galaxy map - ship selected |
| Galaxy Map | [moo_galaxy_aftershipdestinationselected.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_aftershipdestinationselected.png) | After destination selected |
| Galaxy Map | [moo_galaxy_movingshipselected.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_movingshipselected.png) | Moving ship selected |
| Galaxy Map | [moo_galaxy_fleet_deployment.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_fleet_deployment.png) | Fleet deployment |
| Galaxy Map | [moo_galaxy_select_uncolonized_planet.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_select_uncolonized_planet.png) | Selecting uncolonized planet |
| Galaxy Map | [moo_galaxy_ship_select_destination_out_of_range.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_ship_select_destination_out_of_range.png) | Destination out of range |
| Colony States | [moo_galaxy_planet_new.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_planet_new.png) | New colony planet |
| Colony States | [moo_galaxy_planet_post_tform.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_planet_post_tform.png) | Post-terraforming planet |
| Colony States | [moo_galaxy_planet_is_full.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_planet_is_full.png) | Planet at max population |
| Colony States | [moo_galaxy_max_factories.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_max_factories.png) | Planet at max factories |
| MAP Overlay | [moo_map_colonies_selected.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_map_colonies_selected.png) | MAP overlay - colonies |
| MAP Overlay | [moo_map_environments_selected.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_map_environments_selected.png) | MAP overlay - environments |
| MAP Overlay | [moo_map_minerals_selected.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_map_minerals_selected.png) | MAP overlay - minerals |
| Command Menu | [moo_design.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_design.png) | Design screen |
| Command Menu | [moo_ship_design.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_ship_design.png) | Ship design screen |
| Command Menu | [moo_fleet_screen.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_fleet_screen.png) | Fleet command screen |
| Command Menu | [moo_planets.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_planets.png) | Planets / colony list |
| Command Menu | [moo_tech.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_tech.png) | Technology / research screen |
| Turn Notifications | [moo_new_tech.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_tech.png) | New technology discovered |
| Turn Notifications | [moo_new_tech_eco_increase.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_tech_eco_increase.png) | New tech - eco increase |
| Turn Notifications | [moo_tech_eco_reduction.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_tech_eco_reduction.png) | Tech eco cost reduction |
| Turn Notifications | [moo_start_of_turn_select_new_research.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_select_new_research.png) | Start of turn - pick research |
| Turn Notifications | [moo_start_of_turn_new_planet_reveal.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_new_planet_reveal.png) | Start of turn - planet revealed |
| Turn Notifications | [moo_start_of_turn_new_ships.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_new_ships.png) | Start of turn - new ships |
| Colony Events | [moo_colony_ship_arrives_at_potential_planet.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_colony_ship_arrives_at_potential_planet.png) | Colony ship arrives at planet |
| Colony Events | [moo_new_colony_screen.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_colony_screen.png) | New colony established |

---

## Screen Inventory Summary

| Category | MOO1 Screens | HoO Documented | HoO Wireframes | Status |
|----------|-------------|----------------|----------------|--------|
| Pre-Game | 6 | 4 | 1 (`new-game-setup.md`) | ⚠️ Partial |
| Core Gameplay | 8 | 8 | 6 (`galaxy-map.md`, `command_menu_map.md`, `command_menu_planets.md`, `command_menu_fleet.md`, `command_menu_tech.md`, `command_menu_design.md`) | ✅ Wireframed |
| Combat | 3 | 3 | 1 (`tactical-combat-ui.md`) | ⚠️ Partial — ground combat stub |
| Information | 5 | 5 | 1 (`research-tree.md`) | ✅ Good Coverage |
| Diplomacy | 4 | 3 | 1 (`diplomacy-screen.md`) | ⚠️ Stub wireframe |
| Victory/Defeat | 4 | 2 | 0 | ⚠️ Incomplete |
| System | 4 | 3 | 0 | ⚠️ Partial |
| **TOTAL** | **34** | **28** | **10** | **Gap: 6 screens** |

---

## 1. Pre-Game Screens

### 1.1 Main Menu
| Aspect | MOO1 | HoO Status | Screenshot | Notes |
|--------|------|------------|------------|-------|
| Title Screen | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_menu.png) | In `main-screens.md` |
| New Game Button | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_menu.png) | |
| Load Game Button | ✓ | ✅ Documented | | |
| Settings/Options | ✓ | ⚠️ Basic | | Needs detailed spec |
| Credits | ✓ | ✅ Documented | | |
| Exit/Quit | ✓ | ✅ Documented | | |
| Version Display | ✓ | ❌ Missing | | Show build version |

**HoO Location:** `main-screens.md` Section 1

**Screenshot:** [moo_new_game_menu.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_menu.png)

**Gap Actions:**
- [ ] Add version display requirement
- [ ] Expand settings/options specification

---

### 1.2 Galaxy Setup Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Galaxy Size Selection | Small/Medium/Large/Huge | ✅ Documented | 4 sizes |
| Number of Opponents | 1-5 slider | ✅ Documented | Shows as 1-9 in HoO |
| Difficulty Level | Simple/Easy/Normal/Hard/Impossible | ⚠️ Partial | Need difficulty effects |
| Galaxy Shape | N/A (MOO1 random) | ✅ Added | Spiral/Elliptical/Irregular |
| Random Seed | N/A in MOO1 UI | ✅ Added | Optional seed input |

**HoO Location:** `main-screens.md` Section 1 - New Game Setup

**Gap Actions:**
- [ ] Document difficulty level effects on UI feedback
- [ ] Clarify opponent count difference (MOO1: 1-5, HoO: 1-9)

---

### 1.3 Race Selection Screen
| Aspect | MOO1 | HoO Status | Screenshot | Notes |
|--------|------|------------|------------|-------|
| Race Portrait | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_race_select.png) | |
| Race Name | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_race_select.png) | |
| Race Bonuses Display | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_race_select.png) | |
| Recommended Victory Type | N/A in MOO1 | ✅ Added | | |
| Difficulty Rating | N/A in MOO1 | ✅ Added | | |
| Flavor Text/Quote | ✓ | ✅ Documented | | |
| Scroll/Navigate Races | Arrow navigation | ✅ Documented | | |
| Start Game Button | ✓ | ✅ Documented | | |
| Banner Selection | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_banner_select.png) | |
| Emperor Name | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_emporer_name.png) | |
| Home World Name | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_home_world_name.png) | |

**HoO Location:** `main-screens.md` Section 1 - Step 2: Race Selection

**Screenshots:** [Race Select](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_race_select.png) | [Banner](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_banner_select.png) | [Emperor Name](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_emporer_name.png) | [Home World](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_home_world_name.png)

**Status:** ✅ Complete - Well documented with enhancements

---

### 1.4 Opening Cinematic/Story
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Story Text Crawl | ✓ (Opening text) | ❌ Missing | "The Cosmic Wheel" intro |
| Race-Specific Intro | ✓ | ❌ Missing | Species-specific text |
| Skip Option | ✓ | ❌ Missing | Press any key to skip |

**HoO Location:** Not documented

**Gap Actions:**
- [ ] Create `narrative/opening-story.md` specification
- [ ] Define skip behavior
- [ ] Create pet-themed opening crawl text

---

### 1.5 Loading Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Progress Bar | ✓ | ✅ Documented | In `UI_OVERVIEW.md` |
| Loading Tips | N/A in MOO1 | ✅ Added | |
| Galaxy Preview | N/A | ❌ Missing | Could show generating galaxy |

**HoO Location:** `UI_OVERVIEW.md` - Loading & Performance

**Status:** ✅ Adequate

---

### 1.6 Game Mode Selection (MOO1: New vs Continue)
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| New Game | ✓ | ✅ Documented | |
| Continue Game | ✓ | ✅ Documented | As "Load Game" |
| Tutorial Mode | N/A in MOO1 | ❌ Missing | Consider adding |

**Gap Actions:**
- [ ] Consider tutorial mode specification

---

## 2. Core Gameplay Screens

### 2.1 Galaxy Map (Main Hub - F1)
| Aspect | MOO1 | HoO Status | Screenshot | Notes |
|--------|------|------------|------------|-------|
| Star Display | Color-coded stars | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_home.png) | |
| Fleet Icons | Ship stack indicators | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_shipselect.png) | |
| Colony Indicators | Planet ownership | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_home.png) | |
| Fog of War | Unexplored areas | ⚠️ Basic | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_unexplored.png) | Need exploration mechanics |
| Range Circles | Ship range display | ⚠️ Basic | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_ship_select_destination_out_of_range.png) | When fleet selected |
| Selection Highlighting | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_shipselect.png) | |
| Zoom In/Out | Mouse wheel | ✅ Documented | | |
| Pan/Scroll | Edge scroll/drag | ✅ Documented | | |
| Mini-Map | N/A in MOO1 | ❌ Consider | | Web enhancement |
| Year/Turn Display | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_home.png) | Top bar |
| Treasury Display | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_home.png) | |
| Navigation Buttons | F1-F7 equivalents | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_home.png) | |
| End Turn Button | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_home.png) | |
| System Info Panel | Right-click star | ✅ Documented | | System Detail Overlay |
| Fleet Movement Orders | Click destination | ⚠️ Basic | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_aftershipdestinationselected.png) | Need movement confirmation |
| Moving Ship Display | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_movingshipselected.png) | |
| Fleet Deployment | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_fleet_deployment.png) | |
| Uncolonized Planet | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_select_uncolonized_planet.png) | |
| ETA Display | ✓ | ❌ Missing | | Turns to destination |
| Nebula Display | Purple haze effect | ❌ Missing | | Visual representation |
| Wormhole Display | N/A in MOO1 | ❌ N/A | | Not in MOO1 |

**HoO Location:** `main-screens.md` Section 2

**Screenshots:** [Home](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_home.png) | [Unexplored](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_unexplored.png) | [Ship Select](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_shipselect.png) | [After Destination](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_aftershipdestinationselected.png) | [Moving Ship](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_movingshipselected.png) | [Fleet Deploy](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_fleet_deployment.png) | [Uncolonized](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_select_uncolonized_planet.png) | [Out of Range](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_ship_select_destination_out_of_range.png)

**Gap Actions:**
- [ ] Add ETA display when plotting movement
- [ ] Document nebula visual representation
- [ ] Clarify fog of war mechanics
- [ ] Add movement confirmation dialog spec

---

### 2.1a MAP Overlays
| Overlay | MOO1 | HoO Status | Screenshot | Notes |
|---------|------|------------|------------|-------|
| Colonies Overlay | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_map_colonies_selected.png) | Shows colony ownership |
| Environments Overlay | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_map_environments_selected.png) | Planet habitability |
| Minerals Overlay | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_map_minerals_selected.png) | Resource richness |

**Screenshots:** [Colonies](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_map_colonies_selected.png) | [Environments](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_map_environments_selected.png) | [Minerals](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_map_minerals_selected.png)

---

### 2.1b Colony Planet States (Galaxy Map)
| State | Screenshot | Notes |
|-------|------------|-------|
| New Colony | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_planet_new.png) | Freshly colonized |
| Post-Terraforming | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_planet_post_tform.png) | After terraform completes |
| Population Full | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_planet_is_full.png) | Max population reached |
| Max Factories | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_max_factories.png) | Factory cap reached |

**Screenshots:** [New](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_planet_new.png) | [Post-Terraform](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_planet_post_tform.png) | [Full](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_planet_is_full.png) | [Max Factories](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_max_factories.png)

---

### 2.2 Planet Management Screen (F2)
| Aspect | MOO1 | HoO Status | Screenshot | Notes |
|--------|------|------------|------------|-------|
| Planet Portrait/Image | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_planets.png) | |
| Planet Type Display | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_planets.png) | |
| Population Count | Current/Max | ✅ Documented | | |
| Population Growth Rate | ✓ | ✅ Documented | | |
| Factory Count | Current/Max | ✅ Documented | | |
| Factory Production Rate | ✓ | ⚠️ Basic | | Need formula display |
| **Production Sliders (5):** | | | | |
| - Ship Construction | ✓ | ✅ Documented | | |
| - Defense (Bases) | ✓ | ✅ Documented | | |
| - Industry (Factories) | ✓ | ✅ Documented | | |
| - Ecology (Cleanup/Terra) | ✓ | ✅ Documented | | |
| - Research | ✓ | ✅ Documented | | |
| Slider Lock Buttons | ✓ | ✅ Documented | | |
| Building List | Available structures | ✅ Documented | | |
| Ship Being Built | Name and progress | ✅ Documented | | |
| Missile Base Count | ✓ | ✅ Documented | | |
| Shield Level | ✓ | ⚠️ Implicit | | Part of buildings |
| Waste Level | ✓ | ✅ Documented | | |
| Terraforming Progress | ✓ | ⚠️ Basic | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_galaxy_planet_post_tform.png) | Need progress display |
| Planet Special (Rich/Poor) | ✓ | ❌ Missing | | Visual indicator |
| Morale Indicator | ✓ | ✅ Documented | | Emoji in HoO |
| Transfer Population | ✓ | ❌ Missing | | Transport screen |
| Previous/Next Planet | ✓ | ✅ Documented | | |
| Return to Map | ✓ | ✅ Documented | | |

**HoO Location:** `main-screens.md` Section 3

**Screenshot:** [moo_planets.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_planets.png)

**Gap Actions:**
- [ ] Add planet special indicator (Rich/Poor/Artifacts)
- [ ] Add population transfer UI spec
- [ ] Document terraforming progress visualization
- [ ] Add factory construction formula tooltip

---

### 2.3 Planet List Screen (Alternative View)
| Aspect | MOO1 | HoO Status | Screenshot | Notes |
|--------|------|------------|------------|-------|
| Sortable Colony List | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_planets.png) | |
| Column Headers | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_planets.png) | |
| Quick Stats per Planet | ✓ | ✅ Documented | | |
| Go to Planet | ✓ | ✅ Documented | | |
| Build Queue Summary | ✓ | ✅ Documented | | |

**HoO Location:** `main-screens.md` Section 3 - Planet List View

**Screenshot:** [moo_planets.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_planets.png)

**Status:** ✅ Complete

---

### 2.4 Fleet Command Screen (F3)
| Aspect | MOO1 | HoO Status | Screenshot | Notes |
|--------|------|------------|------------|-------|
| Fleet List | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_fleet_screen.png) | |
| Fleet Location | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_fleet_screen.png) | |
| Fleet Composition | Ship types & counts | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_fleet_screen.png) | |
| Fleet Strength Rating | ✓ | ✅ Documented | | Star rating |
| Fleet Speed | ✓ | ✅ Documented | | |
| Fleet Range | ✓ | ✅ Documented | | |
| Set Destination | ✓ | ✅ Documented | | |
| Split Fleet | ✓ | ✅ Documented | | |
| Merge Fleets | ✓ | ✅ Documented | | |
| Auto-Explore | N/A in MOO1 | ✅ Added | | HoO enhancement |
| Rally Points | ✓ | ⚠️ Basic | | Need detailed spec |
| Transport Selection | ✓ | ❌ Missing | | Separate transport UI |
| Ship Detail View | ✓ | ✅ Documented | | |
| Scrap Ships | ✓ | ✅ Documented | | |
| Rename Ship | ✓ | ✅ Documented | | |

**HoO Location:** `main-screens.md` Section 4

**Screenshot:** [moo_fleet_screen.png](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_fleet_screen.png)

**Gap Actions:**
- [ ] Document transport ship selection UI
- [ ] Expand rally point specification
- [ ] Document fleet routing display

---

### 2.5 Research Screen (F4)
| Aspect | MOO1 | HoO Status | Screenshot | Notes |
|--------|------|------------|------------|-------|
| 6 Tech Field Display | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_tech.png) | |
| Current Research | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_tech.png) | |
| Progress Bar | ✓ | ✅ Documented | | |
| RP/Turn Display | ✓ | ✅ Documented | | |
| Estimated Completion | ✓ | ✅ Documented | | |
| Tech Tree View | ✓ | ✅ Documented | | |
| Researched Techs | ✓ | ✅ Documented | | |
| Available Techs | ✓ | ✅ Documented | | |
| Locked Techs | ✓ | ⚠️ Implicit | | Need visual indicator |
| Tech Selection | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_select_new_research.png) | Start-of-turn popup ONLY |
| Tech Details Panel | ✓ | ✅ Documented | | |
| Miniaturization Info | ✓ | ⚠️ Basic | | Need tooltip detail |
| RP Allocation Sliders | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_tech.png) | 6 sliders, anytime (main Tech Screen) |
| Field Progress Bars | ✓ | ✅ Documented | | One tech per field at a time |
| New Tech Notification | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_tech.png) | Appears start-of-next-turn |
| Select New Research | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_select_new_research.png) | Start-of-turn popup, 2–3 options |

**HoO Location:** `main-screens.md` Section 5, `wireframes/research-tree.md`, `wireframes/command_menu/command_menu_tech.md`

**Screenshots:** [Research Screen](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_tech.png) | [New Tech](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_tech.png) | [New Tech Eco](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_tech_eco_increase.png) | [Eco Reduction](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_tech_eco_reduction.png) | [Select Research](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_select_new_research.png)

**MOO1-Accurate Research Mechanic — RESOLVED (2026-04-12):**
HoO uses MOO1-style research with **two distinct UI moments**:
1. **Tech Screen (F4)** — 6 RP allocation sliders (one per field), adjustable at any time. Players redistribute research points. Does NOT allow tech picking.
2. **Tech Selection Popup** — appears at start of turn only, when a field completes. Player picks next tech from 2–3 offered options. No mid-turn tech picking allowed.
Each field researches exactly one tech at a time. See `wireframes/research-tree.md` for full wireframe.

**Gap Actions:**
- [ ] Add locked tech visual indicator
- [ ] Expand miniaturization tooltip spec

---

### 2.6 Ship Design Screen (F6)
| Aspect | MOO1 | HoO Status | Screenshot | Notes |
|--------|------|------------|------------|-------|
| Hull Class Selection | 6 classes | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_ship_design.png) | Scout to Titan |
| Hull Space Display | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_ship_design.png) | |
| Component List | Available tech | ✅ Documented | | |
| Weapon Slots | ✓ | ✅ Documented | | |
| Defense Selection | ✓ | ✅ Documented | | |
| Computer Selection | ✓ | ✅ Documented | | |
| Shield Selection | ✓ | ✅ Documented | | |
| Engine Selection | ✓ | ✅ Documented | | |
| Maneuver Selection | ✓ | ⚠️ Implicit | | Part of engine |
| Special Device Slots | ✓ | ✅ Documented | | |
| Space Remaining | ✓ | ✅ Documented | | |
| Cost Display | ✓ | ✅ Documented | | |
| Ship Stats Summary | ✓ | ✅ Documented | | |
| Design Name Input | ✓ | ✅ Documented | | |
| Save Design | ✓ | ✅ Documented | | |
| Clear Design | ✓ | ⚠️ Missing | | Reset button |
| Design Limit | 6 designs | ❌ Missing | | MOO1 limit |
| Auto-Best Equipment | ✓ | ❌ Missing | | Auto-fill button |
| Miniaturization Effects | ✓ | ⚠️ Basic | | Show size reduction |
| Design Overview | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_design.png) | |

**HoO Location:** `main-screens.md` Section 6

**Screenshots:** [Ship Design](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_ship_design.png) | [Design Overview](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_design.png)

**Gap Actions:**
- [ ] Document 6-design limit
- [ ] Add clear/reset design button
- [ ] Consider auto-best equipment button
- [ ] Show miniaturization reduction percentages

---

### 2.7 Diplomacy Screen (F5)
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Empire List | Known races | ✅ Documented | |
| Relation Indicators | Love bar | ✅ Documented | |
| Race Portrait | ✓ | ✅ Documented | |
| Treaty Status | ✓ | ✅ Documented | |
| Trade Status | ✓ | ✅ Documented | |
| Contact Button | Request audience | ✅ Documented | |
| War/Peace Status | ✓ | ✅ Documented | |
| Fleet Power Comparison | ✓ | ✅ Documented | |
| Tech Level Comparison | ✓ | ✅ Documented | |
| Planet Count | ✓ | ⚠️ Implicit | In population |
| Unknown Races | ✓ | ✅ Documented | Locked icon |

**HoO Location:** `main-screens.md` Section 7

**Status:** ✅ Good Coverage

---

### 2.8 Reports Screen (F7)

> **RESTORED (2026-05-04):** Reports Screen is implemented as a HoO enhancement. While MOO1 didn't have a
> dedicated reports screen, HoO adds F7 Reports as a hub for empire statistics and analysis.
> Per `interaction-spec.md §2.1`: F7 = Reports.

| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Empire Dashboard | N/A | ✅ Implemented | Overview of empire status |
| Charts & Statistics | N/A | ✅ Implemented | Trends and graphs |
| Technology Reports | N/A | ✅ Implemented | Tech analysis |
| Score Breakdown | N/A | ✅ Implemented | Empire rankings |
| Combat History | N/A | ✅ Implemented | Battle log |
| Diplomatic Matrix | N/A | ✅ Implemented | Relations grid |
| Hall of Fame | N/A | ✅ Implemented | Records and achievements |

**HoO Location:** `src/ui/screens/ReportsScreen.ts`

**Status:** ✅ Implemented — HoO enhancement (not in MOO1).

---

## 3. Combat Screens

### 3.1 Tactical Space Combat Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Combat Grid/Hex | ✓ | ⚠️ Basic | In `main-screens.md` brief |
| Ship Stack Display | ✓ | ⚠️ Basic | Need stack representation |
| Ship Health Bars | ✓ | ❌ Missing | Per-stack health |
| Movement Points | ✓ | ❌ Missing | Show remaining MP |
| Initiative Display | ✓ | ❌ Missing | Turn order |
| Weapon Selection | ✓ | ⚠️ Basic | |
| Fire Button | ✓ | ⚠️ Basic | |
| Wait/Done Button | ✓ | ❌ Missing | End ship turn |
| Retreat Button | ✓ | ⚠️ Basic | |
| Auto-Combat Toggle | ✓ | ⚠️ Basic | |
| Combat Speed Control | ✓ | ❌ Missing | Animation speed |
| Damage Numbers | ✓ | ❌ Missing | Pop-up damage |
| Special Weapon Targeting | ✓ | ❌ Missing | Area effects |
| Missile Tracking | ✓ | ❌ Missing | In-flight missiles |
| Combat Log | ✓ | ❌ Missing | Battle events |
| Planet/Base Display | ✓ | ⚠️ Basic | Orbital combat |

**HoO Location:** Brief mention in `main-screens.md`, needs dedicated file

**Gap Actions:**
- [ ] Create `design/ui-ux/tactical-combat-ui.md`
- [ ] Document hex/grid mechanics
- [ ] Specify stack interaction
- [ ] Detail weapon targeting UI
- [ ] Combat log specification
- [ ] Initiative/turn order display

---

### 3.2 Pre-Combat Screen (Battle Setup)
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Fleet Composition | Both sides | ❌ Missing | Pre-battle preview |
| Strength Comparison | ✓ | ❌ Missing | |
| Fight/Retreat Choice | ✓ | ❌ Missing | Initial decision |
| Auto-Resolve Option | ✓ | ❌ Missing | Skip tactical |
| Odds Display | ✓ | ❌ Missing | Win probability |

**HoO Location:** Not documented

**Gap Actions:**
- [ ] Create pre-combat screen specification
- [ ] Document auto-resolve mechanics display

---

### 3.3 Ground Combat Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Attacker Forces | ✓ | ❌ Missing | Troop count |
| Defender Forces | ✓ | ❌ Missing | Population + bonus |
| Combat Animation | ✓ | ❌ Missing | Roll animation |
| Casualty Display | ✓ | ❌ Missing | Losses per round |
| Victory/Defeat Result | ✓ | ❌ Missing | |
| Conquest Options | ✓ | ❌ Missing | Post-victory |

**HoO Location:** Not documented

**Gap Actions:**
- [ ] Create `design/ui-ux/ground-combat-ui.md`
- [ ] Document invasion results screen

---

## 4. Information/Report Screens

### 4.1 Colony Report (Detailed)
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| All Colonies List | ✓ | ✅ Documented | |
| Sortable Columns | ✓ | ✅ Documented | |
| Production Summary | ✓ | ✅ Documented | |
| Issues Highlight | N/A in MOO1 | ✅ Added | |

**HoO Location:** `information-displays.md` - Colony Summary List

**Status:** ✅ Complete

---

### 4.2 Fleet Report (Detailed)
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Fleet Composition | ✓ | ✅ Documented | |
| Ship Classes | ✓ | ✅ Documented | |
| Maintenance Costs | ✓ | ✅ Documented | |
| Battle History | ✓ | ✅ Documented | |

**HoO Location:** `information-displays.md` - Fleet Reports

**Status:** ✅ Complete

---

### 4.3 Technology Report
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| All Tech Fields | ✓ | ✅ Documented | |
| Research Progress | ✓ | ✅ Documented | |
| Miniaturization Status | ✓ | ⚠️ Basic | |
| Stolen Tech History | ✓ | ✅ Documented | |

**HoO Location:** `information-displays.md` - Technology Reports

**Status:** ✅ Good

---

### 4.4 Diplomatic Relations Report
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Relations Matrix | ✓ | ✅ Documented | |
| Treaty Summary | ✓ | ✅ Documented | |
| War History | ✓ | ⚠️ Basic | |

**HoO Location:** `information-displays.md` - Diplomatic Reports

**Status:** ✅ Good

---

### 4.5 Score/Rankings
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Current Score | ✓ | ✅ Documented | |
| Score Breakdown | ✓ | ✅ Documented | |
| Empire Rankings | ✓ | ✅ Documented | |
| Power Projections | N/A | ✅ Added | |

**HoO Location:** `information-displays.md` - Score & Rankings

**Status:** ✅ Complete

---

## 5. Diplomacy Sub-Screens

### 5.1 Audience Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Leader Portrait | ✓ | ✅ Documented | |
| Dialogue Text | ✓ | ✅ Documented | |
| Response Options | ✓ | ✅ Documented | |
| Relation Indicator | ✓ | ✅ Documented | |

**HoO Location:** Implied in `main-screens.md` Section 7

**Gap Actions:**
- [ ] Create dedicated audience screen specification
- [ ] Document all dialogue branches

---

### 5.2 Treaty Negotiation Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Treaty Types | ✓ | ✅ Documented | |
| Our Offer Panel | ✓ | ✅ Documented | |
| Their Offer Panel | ✓ | ✅ Documented | |
| Accept Likelihood | ✓ | ✅ Documented | AI evaluation |
| Propose/Cancel | ✓ | ✅ Documented | |

**HoO Location:** `main-screens.md` Section 7 - Treaty Negotiation

**Status:** ✅ Good

---

### 5.3 Tech Trade Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Our Tech List | ✓ | ❌ Missing | Available to trade |
| Their Tech List | ✓ | ❌ Missing | What they have |
| Trade Terms | ✓ | ❌ Missing | Tech for tech/BC |
| Acceptance Indicator | ✓ | ❌ Missing | |

**HoO Location:** Not documented

**Gap Actions:**
- [ ] Create tech trade UI specification

---

### 5.4 Spy Network Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Spy Count | ✓ | ❌ Missing | Active spies |
| Security Slider | ✓ | ❌ Missing | Defensive allocation |
| Espionage Slider | ✓ | ❌ Missing | Offensive allocation |
| Target Empire Selection | ✓ | ❌ Missing | Who to spy on |
| Spy Mission Results | ✓ | ❌ Missing | Success/failure log |
| Counter-Intel Report | ✓ | ❌ Missing | Caught enemy spies |

**HoO Location:** Not documented (espionage.md covers mechanics, not UI)

**Gap Actions:**
- [ ] Create `design/ui-ux/espionage-ui.md`
- [ ] Document spy allocation interface
- [ ] Specify spy mission result notifications

---

## 6. Victory/Defeat Screens

### 6.1 Victory Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Victory Type | ✓ | ✅ Documented | |
| Victory Animation | ✓ | ✅ Documented | |
| Victory Text | ✓ | ✅ Documented | |
| Final Statistics | ✓ | ✅ Documented | |
| Score Display | ✓ | ✅ Documented | |
| Play Again Option | ✓ | ✅ Documented | |

**HoO Location:** `main-screens.md` Section 10

**Status:** ✅ Complete

---

### 6.2 Defeat Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Defeat Type | ✓ | ✅ Documented | |
| Defeat Text | ✓ | ✅ Documented | |
| Conqueror Display | ✓ | ✅ Documented | |
| Try Again Option | ✓ | ✅ Documented | |

**HoO Location:** `main-screens.md` Section 10

**Status:** ✅ Complete

---

### 6.3 High Council Screen (F8)
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Candidate Display | ✓ | ✅ Documented | |
| Vote Count Display | ✓ | ✅ Documented | |
| Voting Progress | ✓ | ✅ Documented | |
| Your Vote Choice | ✓ | ✅ Documented | |
| Accept/Reject Victory | ✓ | ✅ Documented | |
| Alliance Votes | ✓ | ✅ Documented | |

**HoO Location:** `main-screens.md` Section 9

**Status:** ✅ Complete

---

### 6.4 Hall of Fame
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Victory List | ✓ | ✅ Documented | |
| Score History | ✓ | ✅ Documented | |
| Statistics | ✓ | ✅ Documented | |

**HoO Location:** `information-displays.md` - Hall of Fame

**Status:** ✅ Complete

---

## 7. System Screens

### 7.1 Save Game Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Save Slot List | ✓ | ⚠️ Basic | Modern: unlimited |
| Save Name Input | ✓ | ⚠️ Basic | |
| Save Date/Time | ✓ | ❌ Missing | Timestamp |
| Game Preview | N/A in MOO1 | ❌ Missing | Thumbnail |
| Overwrite Confirmation | ✓ | ❌ Missing | |

**HoO Location:** Not fully documented

**Gap Actions:**
- [ ] Create save/load UI specification
- [ ] Document auto-save behavior
- [ ] Cloud save considerations

---

### 7.2 Load Game Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Save List | ✓ | ⚠️ Basic | |
| Save Details | ✓ | ❌ Missing | Preview info |
| Delete Save | ✓ | ❌ Missing | |
| Sort Options | N/A in MOO1 | ❌ Missing | Date/Name sort |

**HoO Location:** Not fully documented

**Gap Actions:**
- [ ] Create load game UI specification

---

### 7.3 Settings/Options Screen
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Music Volume | ✓ | ✅ Documented | |
| SFX Volume | ✓ | ✅ Documented | |
| Ambient Volume | N/A | ✅ Added | |
| Mute All | ✓ | ✅ Documented | |
| Graphics Quality | N/A in MOO1 | ❌ Missing | Web options |
| Resolution | N/A in DOS | ✅ Documented | Responsive |
| Color Blind Mode | N/A | ✅ Documented | Accessibility |
| Text Scaling | N/A | ✅ Documented | |
| Animation Speed | ✓ | ❌ Missing | Combat speed |
| Auto-End Turn | N/A | ❌ Missing | Consider adding |
| Advisor Hints | N/A | ❌ Missing | Consider adding |

**HoO Location:** `UI_OVERVIEW.md` - Audio Design, Accessibility

**Gap Actions:**
- [ ] Create dedicated settings screen specification
- [ ] Add game speed options
- [ ] Document all toggle settings

---

### 7.4 Pause Menu (In-Game)
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Resume | ✓ | ⚠️ Basic | Implied by Esc |
| Save Game | ✓ | ⚠️ Basic | |
| Load Game | ✓ | ⚠️ Basic | |
| Settings | ✓ | ⚠️ Basic | |
| Help/Manual | ✓ | ❌ Missing | In-game help |
| Retire/Surrender | ✓ | ❌ Missing | Quit current game |
| Exit to Menu | ✓ | ⚠️ Basic | |
| Exit Game | ✓ | ⚠️ Basic | |

**HoO Location:** Mentioned in `UI_OVERVIEW.md`

**Gap Actions:**
- [ ] Create pause menu specification
- [ ] Document retire/surrender option
- [ ] In-game help system

---

## 8. Notification/Event Screens

### 8.1 Turn Summary Screen
| Aspect | MOO1 | HoO Status | Screenshot | Notes |
|--------|------|------------|------------|-------|
| Events List | ✓ | ✅ Documented | | |
| Continue Button | ✓ | ✅ Documented | | |
| Event Categories | ✓ | ✅ Documented | | |
| New Planet Revealed | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_new_planet_reveal.png) | |
| New Ships Completed | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_new_ships.png) | |

**HoO Location:** `information-displays.md` - Turn Summary

**Screenshots:** [Planet Reveal](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_new_planet_reveal.png) | [New Ships](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_new_ships.png)

**Status:** ✅ Complete

---

### 8.2 Notification Pop-ups
| Aspect | MOO1 | HoO Status | Screenshot | Notes |
|--------|------|------------|------------|-------|
| Research Complete | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_tech.png) | |
| Research - Eco Increase | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_tech_eco_increase.png) | |
| Eco Cost Reduction | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_tech_eco_reduction.png) | |
| Select New Research | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_select_new_research.png) | |
| Building Complete | ✓ | ✅ Documented | | |
| War Declared | ✓ | ✅ Documented | | |
| Treaty Offered | ✓ | ✅ Documented | | |
| Colony Attacked | ✓ | ✅ Documented | | |
| Fleet Arrived | ✓ | ✅ Documented | | |
| Council Called | ✓ | ⚠️ Implicit | | |

**HoO Location:** `UI_OVERVIEW.md` - Notification System

**Screenshots:** [New Tech](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_tech.png) | [Eco Increase](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_tech_eco_increase.png) | [Eco Reduction](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_tech_eco_reduction.png) | [Select Research](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_start_of_turn_select_new_research.png)

**Status:** ✅ Good Coverage

---

### 8.3 Colony Events
| Event | MOO1 | HoO Status | Screenshot | Notes |
|-------|------|------------|------------|-------|
| Colony Ship Arrives | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_colony_ship_arrives_at_potential_planet.png) | At uncolonized world |
| New Colony Established | ✓ | ✅ Documented | [📷](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_colony_screen.png) | Colony founding screen |

**Screenshots:** [Colony Ship Arrives](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_colony_ship_arrives_at_potential_planet.png) | [New Colony](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_colony_screen.png)

---

### 8.4 Random Event Screens
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Space Monster Appears | ✓ | ❌ Missing | Guardian, Amoeba, Crystal |
| Comet Warning | ✓ | ❌ Missing | |
| Plague Alert | ✓ | ❌ Missing | |
| Rebellion Alert | ✓ | ❌ Missing | |
| Ancient Derelict Found | ✓ | ❌ Missing | |
| Supernova Warning | ✓ | ❌ Missing | |
| Gift/Donation Event | ✓ | ❌ Missing | |
| Industrial Accident | ✓ | ❌ Missing | |

**HoO Location:** Not documented

**Gap Actions:**
- [ ] Create random event notification specifications
- [ ] Document event response options
- [ ] Visual style for different event types

---

## 9. Priority Gap List (Action Items)

### Critical Gaps (Must Have)
1. **Tactical Combat UI** - No detailed specification
2. **Ground Combat UI** - Not documented
3. **Pre-Combat Screen** - Not documented
4. **Spy Network UI** - Not documented
5. **Tech Trade UI** - Not documented
6. **Population Transfer UI** - Not documented
7. **Random Event Screens** - Not documented

### Important Gaps (Should Have)
8. **Opening Story/Cinematic** - Not documented
9. **Save/Load Game UI** - Basic only
10. **Settings Screen Details** - Incomplete
11. **Pause Menu** - Basic only
12. **Movement Confirmation** - Not documented
13. **ETA Display** - Missing from galaxy map
14. **6-Design Limit** - Ship design constraint

### Nice to Have (Enhancements)
15. **Tutorial Mode** - Not in MOO1 but valuable
16. **Mini-Map** - Not in MOO1 but useful for web
17. **In-Game Help** - Not documented
18. **Galaxy Preview** - Loading screen enhancement

---

## 10. Documentation Status by File

| File | Status | Coverage | Priority Updates |
|------|--------|----------|------------------|
| `UI_OVERVIEW.md` | ✅ Good | General design | Add settings details |
| `main-screens.md` | ✅ Good | Core screens | Stale-text fixed 2026-04-13 |
| `information-displays.md` | ✅ Excellent | Reports | Minor additions |
| `tactical-combat-ui.md` | ✅ Expanded | Combat (full) | HP bars, MP, initiative, damage, missiles, bombardment added 2026-04-13 |
| `ground-combat-ui.md` | ✅ Created | Invasion | Created 2026-04-13 |
| `spy-network-ui.md` | ✅ Created | Spy screens | Created 2026-04-13 |
| `save-load-ui.md` | ❌ Missing | Save/Load | **CREATE FILE** |
| `random-events-ui.md` | ❌ Missing | Events | **CREATE FILE** |
| `wireframes/new-game-setup.md` | ⚠️ Stub | New game flow | Needs full ASCII detail |
| `wireframes/galaxy-map.md` | ✅ Good | Galaxy map | Complete |
| `wireframes/command_menu/*.md` | ✅ Good | Command screens | 6 files complete; hotkey F2 fixed 2026-04-13 |
| `wireframes/research-tree.md` | ✅ Good | Tech tree | Complete |
| `wireframes/diplomacy-screen.md` | ⚠️ Stub | Diplomacy | Needs full layout |

---

## 11. Recommended Task Sequence

Based on this inventory, recommended order for completing UI documentation:

1. **ui-008**: Tactical Combat UI Wireframe *(Critical - most complex)*
2. **Create**: Ground Combat UI specification
3. **Create**: Pre-Combat Screen specification
4. **Create**: Espionage/Spy Network UI
5. **ui-002**: Galaxy Map Wireframe *(Important - main hub)*
6. **ui-003**: Planet Management Wireframe
7. **ui-006**: Ship Design Wireframe
8. **Create**: Random Events UI notifications
9. **Create**: Save/Load Game UI
10. **ui-007**: Diplomacy Wireframe
11. **Create**: Tech Trade UI
12. **Remaining**: Other wireframes (F4, F3, F5, F8, F7)

---

## 12. Conclusion

Hamster of Orion has **good foundational UI documentation** covering most core screens with thoughtful enhancements over MOO1. However, there are **critical gaps in combat-related screens** and several supporting interfaces that need specification.

**Summary Statistics:**
- MOO1 Screens Identified: 34
- HoO Screens Documented: 26 (76%)
- Wireframes Created: 0 (0%)
- Screenshots Available: 33 (covering new game flow, galaxy map, colony states, MAP overlays, command screens, turn notifications, colony events)
- Critical Gaps: 7
- Important Gaps: 7
- Nice-to-Have: 4

**Next Steps:**
1. Create tactical combat UI specification (highest priority)
2. Fill remaining screen documentation gaps
3. Create ASCII wireframes for all screens per existing task list
4. Final pass to ensure MOO1 parity

---

*Document created: 2026-03-22*
*Screenshots added: 2026-04-12*
*Source: MOO1 Official Strategy Guide, existing HoO design documents, MOO1 gameplay screenshots*
