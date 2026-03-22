# UI Screen Inventory - MOO1 vs Hamster of Orion

## Overview

This document provides a comprehensive inventory of ALL screens and interfaces from the original Master of Orion (1993) compared against existing Hamster of Orion UI documentation. It identifies gaps, screens needing updates, and serves as a roadmap for UI specification completion.

**References Used:**
- MOO1 Official Strategy Guide (Prima, 1994)
- MOO1 Game Manual
- StrategyWiki Master of Orion pages
- Existing HoO design documents in `design/ui-ux/`

---

## Screen Inventory Summary

| Category | MOO1 Screens | HoO Documented | HoO Wireframes | Status |
|----------|-------------|----------------|----------------|--------|
| Pre-Game | 6 | 4 | 0 | ⚠️ Partial |
| Core Gameplay | 8 | 8 | 0 | ⚠️ Need Wireframes |
| Combat | 3 | 1 | 0 | ⚠️ Missing Details |
| Information | 5 | 5 | 0 | ✅ Good Coverage |
| Diplomacy | 4 | 3 | 0 | ⚠️ Missing Screens |
| Victory/Defeat | 4 | 2 | 0 | ⚠️ Incomplete |
| System | 4 | 3 | 0 | ⚠️ Partial |
| **TOTAL** | **34** | **26** | **0** | **Gap: 8 screens** |

---

## 1. Pre-Game Screens

### 1.1 Main Menu
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Title Screen | ✓ | ✅ Documented | In `main-screens.md` |
| New Game Button | ✓ | ✅ Documented | |
| Load Game Button | ✓ | ✅ Documented | |
| Settings/Options | ✓ | ⚠️ Basic | Needs detailed spec |
| Credits | ✓ | ✅ Documented | |
| Exit/Quit | ✓ | ✅ Documented | |
| Version Display | ✓ | ❌ Missing | Show build version |

**HoO Location:** `main-screens.md` Section 1

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
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Race Portrait | ✓ | ✅ Documented | |
| Race Name | ✓ | ✅ Documented | |
| Race Bonuses Display | ✓ | ✅ Documented | |
| Recommended Victory Type | N/A in MOO1 | ✅ Added | |
| Difficulty Rating | N/A in MOO1 | ✅ Added | |
| Flavor Text/Quote | ✓ | ✅ Documented | |
| Scroll/Navigate Races | Arrow navigation | ✅ Documented | |
| Start Game Button | ✓ | ✅ Documented | |

**HoO Location:** `main-screens.md` Section 1 - Step 2: Race Selection

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
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Star Display | Color-coded stars | ✅ Documented | |
| Fleet Icons | Ship stack indicators | ✅ Documented | |
| Colony Indicators | Planet ownership | ✅ Documented | |
| Fog of War | Unexplored areas | ⚠️ Basic | Need exploration mechanics |
| Range Circles | Ship range display | ⚠️ Basic | When fleet selected |
| Selection Highlighting | ✓ | ✅ Documented | |
| Zoom In/Out | Mouse wheel | ✅ Documented | |
| Pan/Scroll | Edge scroll/drag | ✅ Documented | |
| Mini-Map | N/A in MOO1 | ❌ Consider | Web enhancement |
| Year/Turn Display | ✓ | ✅ Documented | Top bar |
| Treasury Display | ✓ | ✅ Documented | |
| Navigation Buttons | F1-F7 equivalents | ✅ Documented | |
| End Turn Button | ✓ | ✅ Documented | |
| System Info Panel | Right-click star | ✅ Documented | System Detail Overlay |
| Fleet Movement Orders | Click destination | ⚠️ Basic | Need movement confirmation |
| ETA Display | ✓ | ❌ Missing | Turns to destination |
| Nebula Display | Purple haze effect | ❌ Missing | Visual representation |
| Wormhole Display | N/A in MOO1 | ❌ N/A | Not in MOO1 |

**HoO Location:** `main-screens.md` Section 2

**Gap Actions:**
- [ ] Add ETA display when plotting movement
- [ ] Document nebula visual representation
- [ ] Clarify fog of war mechanics
- [ ] Add movement confirmation dialog spec

---

### 2.2 Planet Management Screen (F2)
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Planet Portrait/Image | ✓ | ✅ Documented | |
| Planet Type Display | ✓ | ✅ Documented | |
| Population Count | Current/Max | ✅ Documented | |
| Population Growth Rate | ✓ | ✅ Documented | |
| Factory Count | Current/Max | ✅ Documented | |
| Factory Production Rate | ✓ | ⚠️ Basic | Need formula display |
| **Production Sliders (5):** | | | |
| - Ship Construction | ✓ | ✅ Documented | |
| - Defense (Bases) | ✓ | ✅ Documented | |
| - Industry (Factories) | ✓ | ✅ Documented | |
| - Ecology (Cleanup/Terra) | ✓ | ✅ Documented | |
| - Research | ✓ | ✅ Documented | |
| Slider Lock Buttons | ✓ | ✅ Documented | |
| Building List | Available structures | ✅ Documented | |
| Ship Being Built | Name and progress | ✅ Documented | |
| Missile Base Count | ✓ | ✅ Documented | |
| Shield Level | ✓ | ⚠️ Implicit | Part of buildings |
| Waste Level | ✓ | ✅ Documented | |
| Terraforming Progress | ✓ | ⚠️ Basic | Need progress display |
| Planet Special (Rich/Poor) | ✓ | ❌ Missing | Visual indicator |
| Morale Indicator | ✓ | ✅ Documented | Emoji in HoO |
| Transfer Population | ✓ | ❌ Missing | Transport screen |
| Previous/Next Planet | ✓ | ✅ Documented | |
| Return to Map | ✓ | ✅ Documented | |

**HoO Location:** `main-screens.md` Section 3

**Gap Actions:**
- [ ] Add planet special indicator (Rich/Poor/Artifacts)
- [ ] Add population transfer UI spec
- [ ] Document terraforming progress visualization
- [ ] Add factory construction formula tooltip

---

### 2.3 Planet List Screen (Alternative View)
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Sortable Colony List | ✓ | ✅ Documented | |
| Column Headers | ✓ | ✅ Documented | |
| Quick Stats per Planet | ✓ | ✅ Documented | |
| Go to Planet | ✓ | ✅ Documented | |
| Build Queue Summary | ✓ | ✅ Documented | |

**HoO Location:** `main-screens.md` Section 3 - Planet List View

**Status:** ✅ Complete

---

### 2.4 Fleet Command Screen (F3)
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Fleet List | ✓ | ✅ Documented | |
| Fleet Location | ✓ | ✅ Documented | |
| Fleet Composition | Ship types & counts | ✅ Documented | |
| Fleet Strength Rating | ✓ | ✅ Documented | Star rating |
| Fleet Speed | ✓ | ✅ Documented | |
| Fleet Range | ✓ | ✅ Documented | |
| Set Destination | ✓ | ✅ Documented | |
| Split Fleet | ✓ | ✅ Documented | |
| Merge Fleets | ✓ | ✅ Documented | |
| Auto-Explore | N/A in MOO1 | ✅ Added | HoO enhancement |
| Rally Points | ✓ | ⚠️ Basic | Need detailed spec |
| Transport Selection | ✓ | ❌ Missing | Separate transport UI |
| Ship Detail View | ✓ | ✅ Documented | |
| Scrap Ships | ✓ | ✅ Documented | |
| Rename Ship | ✓ | ✅ Documented | |

**HoO Location:** `main-screens.md` Section 4

**Gap Actions:**
- [ ] Document transport ship selection UI
- [ ] Expand rally point specification
- [ ] Document fleet routing display

---

### 2.5 Research Screen (F4)
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| 6 Tech Field Display | ✓ | ✅ Documented | |
| Current Research | ✓ | ✅ Documented | |
| Progress Bar | ✓ | ✅ Documented | |
| RP/Turn Display | ✓ | ✅ Documented | |
| Estimated Completion | ✓ | ✅ Documented | |
| Tech Tree View | ✓ | ✅ Documented | |
| Researched Techs | ✓ | ✅ Documented | |
| Available Techs | ✓ | ✅ Documented | |
| Locked Techs | ✓ | ⚠️ Implicit | Need visual indicator |
| Tech Selection | ✓ | ✅ Documented | |
| Tech Details Panel | ✓ | ✅ Documented | |
| Miniaturization Info | ✓ | ⚠️ Basic | Need tooltip detail |
| Research Allocation | N/A (single research) | N/A | MOO1 = 1 research at a time |
| Field Progress Bars | ✓ | ⚠️ Added | HoO shows tier progress |

**HoO Location:** `main-screens.md` Section 5

**Gap Actions:**
- [ ] Add locked tech visual indicator
- [ ] Expand miniaturization tooltip spec
- [ ] Clarify single-research-at-a-time per field (MOO1 mechanic)

---

### 2.6 Ship Design Screen (F6)
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Hull Class Selection | 6 classes | ✅ Documented | Scout to Titan |
| Hull Space Display | ✓ | ✅ Documented | |
| Component List | Available tech | ✅ Documented | |
| Weapon Slots | ✓ | ✅ Documented | |
| Defense Selection | ✓ | ✅ Documented | |
| Computer Selection | ✓ | ✅ Documented | |
| Shield Selection | ✓ | ✅ Documented | |
| Engine Selection | ✓ | ✅ Documented | |
| Maneuver Selection | ✓ | ⚠️ Implicit | Part of engine |
| Special Device Slots | ✓ | ✅ Documented | |
| Space Remaining | ✓ | ✅ Documented | |
| Cost Display | ✓ | ✅ Documented | |
| Ship Stats Summary | ✓ | ✅ Documented | |
| Design Name Input | ✓ | ✅ Documented | |
| Save Design | ✓ | ✅ Documented | |
| Clear Design | ✓ | ⚠️ Missing | Reset button |
| Design Limit | 6 designs | ❌ Missing | MOO1 limit |
| Auto-Best Equipment | ✓ | ❌ Missing | Auto-fill button |
| Miniaturization Effects | ✓ | ⚠️ Basic | Show size reduction |

**HoO Location:** `main-screens.md` Section 6

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
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Empire Summary | ✓ | ✅ Documented | |
| Economic Stats | ✓ | ✅ Documented | |
| Military Stats | ✓ | ✅ Documented | |
| Research Stats | ✓ | ✅ Documented | |
| Population Graphs | ✓ | ✅ Documented | |
| Production Graphs | ✓ | ✅ Documented | |
| Fleet Strength Graphs | ✓ | ✅ Documented | |
| Tech Level Comparison | ✓ | ✅ Documented | |
| Empire Rankings | ✓ | ✅ Documented | |
| Victory Progress | N/A in MOO1 | ✅ Added | HoO enhancement |
| Score Display | ✓ | ✅ Documented | |

**HoO Location:** `main-screens.md` Section 8, `information-displays.md`

**Status:** ✅ Excellent - Well documented with enhancements

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
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Events List | ✓ | ✅ Documented | |
| Continue Button | ✓ | ✅ Documented | |
| Event Categories | ✓ | ✅ Documented | |

**HoO Location:** `information-displays.md` - Turn Summary

**Status:** ✅ Complete

---

### 8.2 Notification Pop-ups
| Aspect | MOO1 | HoO Status | Notes |
|--------|------|------------|-------|
| Research Complete | ✓ | ✅ Documented | |
| Building Complete | ✓ | ✅ Documented | |
| War Declared | ✓ | ✅ Documented | |
| Treaty Offered | ✓ | ✅ Documented | |
| Colony Attacked | ✓ | ✅ Documented | |
| Fleet Arrived | ✓ | ✅ Documented | |
| Council Called | ✓ | ⚠️ Implicit | |

**HoO Location:** `UI_OVERVIEW.md` - Notification System

**Status:** ✅ Good Coverage

---

### 8.3 Random Event Screens
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
| `main-screens.md` | ✅ Good | Core screens | Add missing UI elements |
| `information-displays.md` | ✅ Excellent | Reports | Minor additions |
| `tactical-combat-ui.md` | ❌ Missing | Combat | **CREATE FILE** |
| `ground-combat-ui.md` | ❌ Missing | Invasion | **CREATE FILE** |
| `espionage-ui.md` | ❌ Missing | Spy screens | **CREATE FILE** |
| `save-load-ui.md` | ❌ Missing | Save/Load | **CREATE FILE** |
| `random-events-ui.md` | ❌ Missing | Events | **CREATE FILE** |
| `wireframes/*.md` | ❌ Missing | All screens | **CREATE FILES** |

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
*Source: MOO1 Official Strategy Guide, existing HoO design documents*
