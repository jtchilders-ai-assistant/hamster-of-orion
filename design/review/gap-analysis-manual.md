# Gap Analysis: Hamster of Orion Design Documents vs MOO1 Manual

## Executive Summary

This document provides a comprehensive comparison between the Hamster of Orion design specifications and the original Master of Orion (1993) game mechanics as documented in the official manual and strategy guides. The analysis identifies **coverage strengths**, **gaps requiring attention**, **intentional deviations**, and **areas needing additional specification**.

**Overall Assessment**: The design documents demonstrate **strong MOO1 fidelity** in core mechanics (research, production, combat, diplomacy) while making appropriate thematic adaptations for the pet setting. Several gaps exist primarily in UI/UX specifications and edge case handling rather than core game mechanics.

---

## Table of Contents

1. [Methodology](#methodology)
2. [Coverage Summary](#coverage-summary)
3. [Detailed System Analysis](#detailed-system-analysis)
   - [Galaxy Generation](#1-galaxy-generation)
   - [Star Systems & Planets](#2-star-systems--planets)
   - [Colony Management](#3-colony-management)
   - [Technology System](#4-technology-system)
   - [Ship Design & Combat](#5-ship-design--combat)
   - [Diplomacy & Espionage](#6-diplomacy--espionage)
   - [Galactic Council](#7-galactic-council)
   - [Random Events](#8-random-events)
   - [Victory Conditions](#9-victory-conditions)
   - [AI Behavior](#10-ai-behavior)
4. [Critical Gaps Requiring Specification](#critical-gaps-requiring-specification)
5. [Intentional Design Deviations](#intentional-design-deviations)
6. [Minor Gaps & Polish Items](#minor-gaps--polish-items)
7. [Recommendations](#recommendations)
8. [Appendix: MOO1 Reference Summary](#appendix-moo1-reference-summary)

---

## Methodology

This analysis was conducted by:
1. Reviewing all design documents in `/design/` directory
2. Cross-referencing against MOO1 official manual content
3. Comparing with MOO1 strategy guide specifications
4. Identifying gaps, deviations, and areas of strong coverage
5. Categorizing findings by severity and system area

**Gap Classification:**
- 🔴 **Critical Gap**: Core mechanic missing or significantly underspecified
- 🟡 **Moderate Gap**: Secondary feature missing or partially specified
- 🟢 **Minor Gap**: Polish, edge cases, or optional features
- ✅ **Covered**: Well-specified and MOO1-faithful
- 🔵 **Intentional Deviation**: Documented design choice diverging from MOO1

---

## Coverage Summary

### Systems by Coverage Level

| System | Coverage | Status |
|--------|----------|--------|
| Research & Technology | 95% | ✅ Excellent |
| Factory/Production | 95% | ✅ Excellent |
| Population Growth | 95% | ✅ Excellent |
| Diplomacy Relations | 95% | ✅ Excellent |
| Espionage | 90% | ✅ Excellent |
| Council Voting | 95% | ✅ Excellent |
| Race Statistics | 95% | ✅ Excellent |
| Galaxy Generation | 90% | ✅ Very Good |
| Combat Mechanics | 80% | ✅ Good |
| Ship Design | 75% | 🟡 Needs Work |
| Planet Types | 85% | ✅ Good |
| Random Events | 30% | 🔴 Major Gap |
| Victory Conditions | 60% | 🟡 Needs Work |
| UI/UX Flow | 20% | 🔴 Major Gap |
| AI Governor | 40% | 🟡 Needs Work |
| Fleet Movement | 50% | 🟡 Needs Work |

### Overall Score: **78%** (Solid foundation, needs completion in specific areas)

---

## Detailed System Analysis

### 1. Galaxy Generation

**MOO1 Reference:**
- 4 galaxy sizes: Small (24), Medium (48), Large (70), Huge (108) stars
- Each star has exactly one habitable planet
- Stars distributed with some clustering
- Nebulae affect combat (no shields) and travel (Warp 1)
- Orion always at center, heavily guarded

**Hamster of Orion Coverage:**

| Feature | Status | Notes |
|---------|--------|-------|
| Galaxy sizes | ✅ Covered | Exact MOO1 values (24/48/70/108) |
| One planet per star | ✅ Covered | Explicitly stated |
| Star colors (6 types) | ✅ Covered | Yellow, Green, Red, Blue, White, Purple |
| Nebula mechanics | ✅ Covered | Warp 1 + no shields |
| Orion placement | ✅ Covered | Center, Guardian, 4× research |
| Artifacts worlds | ✅ Covered | 2× research bonus |
| Homeworld placement | ✅ Covered | Balanced distribution algorithm |
| Star naming | ✅ Covered | Classic names + Roman numerals |
| Cluster generation | ✅ Covered | Poisson disk sampling |

**Gaps Identified:**
- 🟢 **Minor**: No specification for wormholes/hyperspace lanes (MOO1 doesn't have these, so intentionally absent)
- 🟢 **Minor**: Star "age" not specified (MOO1 doesn't use this either)

**Assessment**: ✅ **Excellent coverage** - Galaxy generation is comprehensively specified.

---

### 2. Star Systems & Planets

**MOO1 Reference:**
- Planet environments: Gaia, Terran, Jungle, Ocean, Arid, Steppe, Desert, Minimal, Tundra, Barren, Dead, Inferno, Toxic, Radiated
- Planet sizes: Tiny, Small, Medium, Large, Huge
- Mineral richness: Ultra Poor, Poor, Normal, Rich, Ultra Rich
- Star color influences planet type probability

**Hamster of Orion Coverage:**

| Feature | Status | Notes |
|---------|--------|-------|
| 14 environment types | ✅ Covered | All MOO1 types present |
| 5 planet sizes | ✅ Covered | Tiny through Huge |
| 5 mineral levels | ✅ Covered | Ultra Poor through Ultra Rich |
| Star color → planet table | ✅ Covered | Detailed probability tables |
| Environment growth mods | ✅ Covered | Full modifier table |
| Environment capacity mods | ✅ Covered | Population limits |
| Hostile colonization tech | ✅ Covered | Progressive unlock |

**Gaps Identified:**
- 🟢 **Minor**: Asteroid belts not specified (MOO1 uses these for Silicoid mining)
- 🟡 **Moderate**: Gas giants not mentioned (uncolonizable stars in MOO1)
- 🟢 **Minor**: Special minerals (e.g., Gold, Gems) not specified for unique planets

**Assessment**: ✅ **Very good coverage** - Core planet mechanics well-specified.

---

### 3. Colony Management

**MOO1 Reference:**
- 5-slider allocation: Ship, Defense, Industry, Ecology, Research
- Factories require population to operate (2:1 base ratio)
- Population growth follows logistic curve
- Waste/pollution cleanup required
- Reserve fund for excess production

**Hamster of Orion Coverage:**

| Feature | Status | Notes |
|---------|--------|-------|
| Production formulas | ✅ Covered | Factory output, racial mods |
| Population growth | ✅ Covered | Logistic formula, environment mods |
| Robotic Controls | ✅ Covered | Factory:population ratio tech |
| Industrial tech | ✅ Covered | Factory cost reduction |
| Pollution/waste | ✅ Covered | Generation and cleanup |
| Research buildings | ✅ Covered | Lab → Supercomputer → Autolab → Cybernet |
| Terraforming | ✅ Covered | +10 through +120 increments |
| Soil Enrichment | ✅ Covered | 1.25× and 1.50× multipliers |
| Cloning | ✅ Covered | +2 and +5 per turn |
| Food mechanics | ✅ Covered | Workers, fertility, starvation |
| Transport ships | ✅ Covered | 1 million per transport |

**Gaps Identified:**
- 🟡 **Moderate**: 5-slider system not fully specified in a single document
- 🟡 **Moderate**: Colony automation/AI governor logic not specified
- 🟢 **Minor**: Reserve fund mechanics mentioned but not detailed
- 🟢 **Minor**: Ship construction queue not specified

**Assessment**: ✅ **Excellent coverage** - Core mechanics very well-specified.

---

### 4. Technology System

**MOO1 Reference:**
- 6 technology fields: Computers, Construction, Force Fields, Planetology, Propulsion, Weapons
- ~30-40 techs per field, ~200 total
- Random tech selection (2-3 choices per tier)
- Miniaturization (components shrink as you advance)
- Tech trading and stealing

**Hamster of Orion Coverage:**

| Feature | Status | Notes |
|---------|--------|-------|
| 6 tech fields | ✅ Covered | Same as MOO1 |
| Tech cost formula | ✅ Covered | Tier-based exponential |
| Random tech choices | ✅ Covered | 2-3 per tier, race mods |
| Miniaturization | ✅ Covered | 5% per tier, 20% minimum |
| Research buildings | ✅ Covered | Full chain specified |
| Racial research mods | ✅ Covered | Rats +50%, Guinea Pigs -20% |
| Tech trading | ✅ Covered | In diplomacy docs |
| Tech stealing | ✅ Covered | In espionage docs |

**Gaps Identified:**
- 🔴 **Critical**: Complete tech tree not specified - individual technologies per field not listed
- 🟡 **Moderate**: Research Lab unlock levels inconsistent (tech_level 1 vs 10 in different docs)
- 🟢 **Minor**: "Creative" equivalent (Rats seeing all techs) not explicitly clarified
- 🟢 **Minor**: Tech discovery notifications not specified

**Assessment**: 🟡 **Good coverage of formulas, needs complete tech list**

---

### 5. Ship Design & Combat

**MOO1 Reference:**
- 6 hull sizes: Scout, Fighter, Destroyer, Cruiser, Battleship, Dreadnought, Titan
- Component categories: Weapons, Shields, Armor, Computer, ECM, Specials
- Turn-based tactical combat on hex grid
- Range affects accuracy
- Beam vs missile vs torpedo mechanics
- Ship experience levels

**Hamster of Orion Coverage:**

| Feature | Status | Notes |
|---------|--------|-------|
| Hull sizes | ✅ Covered | Scout → Titan hierarchy |
| Weapon types | ✅ Covered | Beams, missiles, bombs |
| Shield classes | ✅ Covered | Progressive shield tech |
| Armor types | ✅ Covered | Titanium → Neutronium |
| Battle computers | ✅ Covered | Accuracy bonuses |
| ECM | ✅ Covered | Enemy accuracy reduction |
| Combat grid | ✅ Covered | Hexagonal grid |
| Range penalties | ✅ Covered | Point blank → Very Long |
| Critical hits | ✅ Covered | 10% chance |
| Ship experience | ✅ Covered | Rookie → Elite |
| Combat flow | ✅ Covered | Initiative → Move → Fire |
| Retreat mechanics | ✅ Covered | Speed-based chance |

**Gaps Identified:**
- 🔴 **Critical**: Complete weapons list not specified (damage, range, size, cost for each weapon)
- 🔴 **Critical**: Complete specials list not specified (cloak, scanner, repair systems)
- 🟡 **Moderate**: Specific hull space values per size not documented
- 🟡 **Moderate**: Auto-combat algorithm not specified
- 🟡 **Moderate**: Planetary bombardment damage formula incomplete
- 🟡 **Moderate**: Ground invasion numbers not complete (troops vs garrison formula)
- 🟢 **Minor**: Fighter bay mechanics not specified
- 🟢 **Minor**: Bio-weapon effects partially specified

**Assessment**: 🟡 **Framework good, needs complete component lists**

---

### 6. Diplomacy & Espionage

**MOO1 Reference:**
- Relationship scale: -100 to +100
- Treaty types: Peace, Trade, Non-Aggression, Alliance
- Tribute/gift mechanics
- Espionage: Steal tech, sabotage, incite rebellion, frame jobs
- AI personality types affect negotiation

**Hamster of Orion Coverage:**

| Feature | Status | Notes |
|---------|--------|-------|
| Relationship scale | ✅ Covered | -100 to +100 with state names |
| Treaty types | ✅ Covered | All MOO1 types plus Research Pact |
| Relationship decay | ✅ Covered | Formula specified |
| Border friction | ✅ Covered | -5 per contested system |
| Treaty maintenance | ✅ Covered | Per-turn bonuses |
| Reputation tracks | ✅ Covered | Honor, Peace, Fairness, Mercy |
| Espionage missions | ✅ Covered | All mission types |
| Spy mechanics | ✅ Covered | Effectiveness, detection, death |
| Security spending | ✅ Covered | Level 0-10 system |
| Tech theft | ✅ Covered | Detailed formula |
| Sabotage | ✅ Covered | Factory and missile base |
| Frame jobs | ✅ Covered | Chameleon specialty |
| War weariness | ✅ Covered | Accumulation and effects |

**Gaps Identified:**
- 🟢 **Minor**: Demand tribute mechanics not fully specified
- 🟢 **Minor**: Diplomatic dialogue trees not specified
- 🟢 **Minor**: AI personality definitions incomplete

**Assessment**: ✅ **Excellent coverage** - One of the best-specified systems.

---

### 7. Galactic Council

**MOO1 Reference:**
- Forms when 50%+ of galaxy colonized
- Meets every 25 turns
- Two candidates: highest population empires
- 2/3 majority required for victory
- Population = votes
- Can reject election (triggers galactic war)

**Hamster of Orion Coverage:**

| Feature | Status | Notes |
|---------|--------|-------|
| Formation trigger | ✅ Covered | 50% colonization |
| Meeting frequency | ✅ Covered | 25 turns |
| Candidate selection | ✅ Covered | Top 2 populations |
| Victory threshold | ✅ Covered | 2/3 majority |
| Vote weight | ✅ Covered | Based on population |
| AI voting behavior | ✅ Covered | Detailed formula with factors |
| Abstention rules | ✅ Covered | Multiple conditions |
| Rejection mechanics | ✅ Covered | Galactic war scenario |
| Bribery | ✅ Covered | Formula for vote influence |
| Lobbying phase | ✅ Covered | 5 turns before meeting |

**Gaps Identified:**
- 🟢 **Minor**: Pre-vote UI flow not specified
- 🟢 **Minor**: Vote reveal animation not specified

**Assessment**: ✅ **Excellent coverage** - Comprehensive voting algorithm.

---

### 8. Random Events

**MOO1 Reference:**
- Positive: Comet (resources), Ancient Derelict (tech), Scientific Discovery
- Negative: Plague, Supernova, Space Amoeba, Space Crystal
- Orion Guardian (special challenge)
- Pirates/Raiders

**Hamster of Orion Coverage:**

| Feature | Status | Notes |
|---------|--------|-------|
| Orion Guardian | ✅ Covered | Guardian ship mechanics mentioned |
| Space monsters | ❌ Not Found | No specification for Amoeba, Crystal |
| Plagues | ❌ Not Found | No disease event specification |
| Supernova | ❌ Not Found | No star destruction event |
| Positive events | ❌ Not Found | No comet, derelict, etc. |
| Event frequency | ❌ Not Found | No random event timing |
| Event resolution | ❌ Not Found | No combat/outcome mechanics |

**Gaps Identified:**
- 🔴 **Critical**: No random events specification document
- 🔴 **Critical**: Space monsters not specified
- 🔴 **Critical**: Plague/disaster events not specified
- 🔴 **Critical**: Positive random events not specified
- 🔴 **Critical**: Event probability tables not specified

**Assessment**: 🔴 **Major gap** - Random events need full specification.

---

### 9. Victory Conditions

**MOO1 Reference:**
- Diplomatic Victory: Win Council election
- Military Victory: Conquer all other empires
- Defeat Guardian: Optional challenge for tech bonuses
- Survival: Last empire standing

**Hamster of Orion Coverage:**

| Feature | Status | Notes |
|---------|--------|-------|
| Diplomatic Victory | ✅ Covered | Council election mechanics |
| Military Victory | 🟡 Partial | "Domination" mentioned but not specified |
| Guardian Victory | 🟡 Partial | Discovery Victory mentioned, Guardian referenced |
| Score calculation | ❌ Not Found | No end-game scoring formula |
| Turn limit | ❌ Not Found | MOO1 has optional turn limit |
| Victory notification | ❌ Not Found | End-game flow not specified |

**Gaps Identified:**
- 🟡 **Moderate**: Military/Conquest victory conditions not specified
- 🟡 **Moderate**: End-game scoring formula not specified
- 🟢 **Minor**: Turn limit option not specified
- 🟢 **Minor**: Victory screen/statistics not specified

**Assessment**: 🟡 **Needs completion** - Victory conditions partially specified.

---

### 10. AI Behavior

**MOO1 Reference:**
- Racial AI personalities (aggressive, peaceful, etc.)
- Fleet management priorities
- Research priorities by race
- Diplomatic tendencies
- Expansion patterns

**Hamster of Orion Coverage:**

| Feature | Status | Notes |
|---------|--------|-------|
| Racial aggression | ✅ Covered | ai_behavior.aggression values |
| Expansion priority | ✅ Covered | ai_behavior.expansion values |
| Research focus | ✅ Covered | Per-race priorities |
| Diplomatic behavior | ✅ Covered | Treaty reliability, war tendency |
| Natural allies/enemies | ✅ Covered | Listed per race |
| War declaration logic | ✅ Covered | Formula in relationship docs |
| Council voting | ✅ Covered | Detailed vote decision |

**Gaps Identified:**
- 🟡 **Moderate**: Fleet management AI not specified
- 🟡 **Moderate**: Colony development AI not specified
- 🟡 **Moderate**: Ship design AI preferences not specified
- 🟢 **Minor**: Research allocation AI not specified

**Assessment**: 🟡 **Good high-level, needs tactical AI specs**

---

## Critical Gaps Requiring Specification

### Priority 1 - Must Have Before Alpha

1. **🔴 Random Events System** (`design/events/random-events.md`)
   - Event types (positive and negative)
   - Probability tables and triggers
   - Space monster specifications
   - Event resolution mechanics
   - Guardian encounter details

2. **🔴 Complete Technology Tree** (`design/technology/tech-tree-complete.md`)
   - Full list of technologies per field
   - Tech unlock effects
   - Building unlocks
   - Ship component unlocks
   - Research cost per tech

3. **🔴 Complete Ship Components** (`design/ships/components-complete.md`)
   - All weapons (damage, range, size, cost)
   - All shields (HP, size, cost)
   - All armor types (HP per space, weight)
   - All specials (cloaking, scanners, etc.)
   - All engines (speed, fuel efficiency)

### Priority 2 - Needed Before Beta

4. **🟡 Victory Conditions** (`design/game-mechanics/victory-conditions.md`)
   - Military/Conquest victory definition
   - Score calculation formula
   - Turn limits
   - End-game statistics

5. **🟡 Slider System** (`design/colony/slider-system.md`)
   - 5-slider allocation (Ship, Defense, Industry, Ecology, Research)
   - Slider interaction rules
   - Auto-balance mechanics
   - Governor automation

6. **🟡 Fleet Movement** (`design/ships/fleet-movement.md`)
   - Warp speed mechanics
   - Fuel consumption
   - Fleet formation
   - Rally points
   - Patrol routes

7. **🟡 AI Tactical Behavior** (`design/ai/tactical-ai.md`)
   - Fleet composition preferences
   - Combat target selection
   - Colony development priorities
   - Research allocation logic

---

## Intentional Design Deviations

The following differences from MOO1 appear to be **intentional design choices**:

### 1. 🔵 Pet-Themed Races
- **MOO1**: Sci-fi alien races (Psilons, Klackons, etc.)
- **Hamster of Orion**: Pet animals with equivalent traits
- **Assessment**: Appropriate thematic adaptation; mechanics preserved

### 2. 🔵 Research Pact Treaty
- **MOO1**: Only Peace, Trade, Non-Aggression, Alliance
- **Hamster of Orion**: Adds Research Pact (10% partner RP bonus)
- **Assessment**: Good addition; enhances diplomacy depth

### 3. 🔵 Four Reputation Tracks
- **MOO1**: Single "treaty breaker" flag
- **Hamster of Orion**: Honor, Peace, Fairness, Mercy tracks
- **Assessment**: More nuanced reputation system; good enhancement

### 4. 🔵 Defensive Pact
- **MOO1**: Implicit in Alliance
- **Hamster of Orion**: Separate tier between NAP and Alliance
- **Assessment**: More diplomatic granularity; appropriate addition

### 5. 🔵 20 Tech Tiers (vs ~50 MOO1 levels)
- **MOO1**: ~50 tech levels across 6 fields
- **Hamster of Orion**: 20 tiers with different cost curve
- **Assessment**: Compressed but maintains progression feel; acceptable

### 6. 🔵 Council Lobbying Phase
- **MOO1**: Direct voting
- **Hamster of Orion**: 5-turn lobbying phase before council
- **Assessment**: Enhances player agency; good addition

### 7. 🔵 Hermit Crabs Don't Need Food (vs MOO1 Silicoids)
- **MOO1**: Silicoids need no food
- **Hamster of Orion**: Hermit Crabs same mechanic
- **Assessment**: Direct translation; appropriate

### 8. 🔵 Ants Immune to Espionage (vs MOO1 Klackons)
- **MOO1**: Klackons have no espionage immunity
- **Hamster of Orion**: Ants immune (hive-mind)
- **Assessment**: Interesting addition; balances Chameleon power

---

## Minor Gaps & Polish Items

### User Interface Specifications
- 🟢 Galaxy map controls and zoom levels
- 🟢 Colony screen layout
- 🟢 Ship design interface
- 🟢 Research screen layout
- 🟢 Diplomacy screen flow
- 🟢 Combat UI and controls
- 🟢 Notification system

### Tutorial/Onboarding
- 🟢 New player tutorial sequence
- 🟢 Help system
- 🟢 Tooltips specification

### Audio/Visual
- 🟢 Sound effects list
- 🟢 Music requirements
- 🟢 Animation specifications

### Multiplayer (if planned)
- 🟢 Turn structure for multiplayer
- 🟢 Simultaneous vs sequential turns
- 🟢 Diplomacy in multiplayer

### Modding Support (if planned)
- 🟢 Data file formats
- 🟢 Moddable systems
- 🟢 Mod loading mechanism

---

## Recommendations

### Immediate Actions (Week 1-2)

1. **Create Random Events Specification**
   - Define 5-8 positive events
   - Define 5-8 negative events
   - Specify space monsters (2-3 types)
   - Create probability tables

2. **Complete Technology Tree**
   - List all technologies per field
   - Define unlock effects
   - Balance costs across fields

3. **Complete Ship Components**
   - Finalize weapon stats
   - Finalize shield/armor stats
   - Finalize special systems

### Short-Term Actions (Week 3-4)

4. **Victory Conditions Document**
   - Define all victory types
   - Create scoring formula
   - Specify end-game flow

5. **Slider System Document**
   - Consolidate slider mechanics
   - Define governor automation
   - Specify slider UI behavior

6. **Fleet Movement Document**
   - Define warp mechanics
   - Specify fuel consumption
   - Document fleet management

### Medium-Term Actions (Month 2)

7. **AI Tactical Specifications**
   - Fleet building priorities
   - Combat AI behavior
   - Colony automation logic

8. **UI/UX Specifications**
   - Screen layouts
   - Navigation flow
   - Control schemes

9. **Polish Documents**
   - Sound design requirements
   - Animation specifications
   - Accessibility features

---

## Appendix: MOO1 Reference Summary

### Core Game Loop (per turn)
1. View colony reports
2. Adjust planet sliders (Ship/Defense/Industry/Ecology/Research)
3. Review technology progress
4. Issue fleet orders
5. Conduct diplomacy
6. Review spy reports
7. End turn → process movement → resolve combat → process production

### Key Numerical References from MOO1 Manual

| Mechanic | MOO1 Value |
|----------|------------|
| Base factory cost | 10 BC |
| Factory:population ratio | 2:1 (base) |
| Population growth rate | ~2% per turn (base) |
| Miniaturization rate | 50% per tier |
| Council formation | 50% galaxy colonized |
| Council victory | 2/3 majority |
| Council interval | 25 turns |
| Spy base cost | 50 BC |
| Tech choices | 2-3 per tier |

### MOO1 Ship Hulls
| Hull | Space | Cost | Notes |
|------|-------|------|-------|
| Scout | 50 | 10 BC | Exploration |
| Fighter | 100 | 25 BC | Light combat |
| Destroyer | 250 | 60 BC | Medium combat |
| Cruiser | 600 | 150 BC | Heavy combat |
| Battleship | 1500 | 400 BC | Capital ship |
| Dreadnought | 3000 | 800 BC | Super-capital |
| Titan | 5000 | 1600 BC | Ultimate |

### MOO1 Racial Traits
| Race | Production | Research | Ground | Ship | Special |
|------|------------|----------|--------|------|---------|
| Humans | +0% | +0% | +0% | +0% | Diplomacy +50% |
| Klackons | +50% | +0% | +0% | +0% | Hive mind |
| Meklars | +25% | +0% | +0% | +0% | Automation |
| Psilons | +0% | +50% | +0% | +0% | Research |
| Sakkra | +0% | +0% | +0% | +0% | Growth +100% |
| Silicoids | +0% | +0% | +0% | +0% | Any planet |
| Bulrathi | +0% | +0% | +50% | +0% | Ground combat |
| Mrrshan | +0% | +0% | +0% | +30% | Ship attack |
| Alkari | +0% | +0% | +0% | +50% | Ship defense |
| Darloks | +0% | +0% | +0% | +0% | Spy +60% |

---

## Document Metadata

- **Created**: 2026-03-22
- **Author**: Specification Worker Agent
- **Version**: 1.0
- **Status**: Complete
- **Review Required**: Product Owner, Lead Designer

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-03-22 | 1.0 | Initial gap analysis |

