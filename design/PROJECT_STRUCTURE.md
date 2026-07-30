# Hamster of Orion - Project Structure

> **Note:** This file reflects the actual design document layout as of 2026-04-18.
> Files marked ✅ are planned but not yet written.

## Actual Folder Layout

```
design/
├── FINAL_REVIEW_COMBAT.md           # Combat system final review
├── FINAL_REVIEW_DIPLOMACY.md        # Diplomacy final review
├── FINAL_REVIEW_ECONOMY.md          # Economy final review
├── FINAL_REVIEW_SPECIES.md          # Species final review
├── FINAL_REVIEW_TECHNOLOGY.md       # Technology final review
├── FINAL_REVIEW_UI.md               # UI/UX final review
├── IMPLEMENTATION_CHECKLIST_ECONOMY.md  # Economy implementation tasks
├── ISSUES_MASTER.md                 # Master issues tracker
├── LORE.md                          # Master lore document
├── PROJECT_STRUCTURE.md             # This file
├── REVIEW_MECHANICS.md              # Game mechanics review
├── REVIEW_STRUCTURE.md              # Structural review
│
├── diplomacy/                       # Inter-species relations
│   ├── REVIEW_DIPLOMACY.md         # Diplomacy review notes
│   ├── ai-personalities.md         # How AI races behave
│   ├── council.md                  # High Council mechanics
│   ├── espionage.md                # Spies and sabotage
│   ├── relationship-formulas.md    # Diplomatic math
│   ├── trade.md                    # Resource trading
│   └── treaties.md                 # Trade, alliance, NAP, war
│
├── economy/                         # Economic formulas
│   ├── factory-formulas.md         # Production calculations
│   ├── population-growth.md        # Growth mechanics
│   ├── ship-costs.md               # Ship build costs
│   └── slider-mathematics.md       # Slider formula details
│
├── galaxy/                          # Map and exploration
│   ├── AUDIT_GALAXY_GEN_2026-04-15.md  # Galaxy generation audit
│   ├── exploration.md              # Scouting and fog of war
│   ├── generation-algorithm.md     # Full procedural gen spec
│   ├── map-generation.md           # Galaxy creation overview
│   ├── space-regions.md            # Safe Zones, Pellet Fields, etc.
│   ├── star-systems.md             # Star types and systems
│   └── travel.md                   # Hyperspace mechanics
│
├── game-mechanics/                  # Core systems
│   ├── balance.md                  # Design balance principles
│   ├── difficulty.md               # Easy to impossible
│   ├── random-events.md            # Space monsters, discoveries
│   ├── tactics-and-doctrines.md    # Fleet doctrines, Orion Guardian fight, invasion tech theft
│   ├── turn-structure.md           # What happens each turn
│   └── victory-conditions.md       # Two paths to victory: Council Election and Military Conquest
│
├── moo_screens/                     # MOO1 reference screenshots
│   ├── viewer.html                 # Screenshot viewer
│   └── *.png                       # Various MOO1 screen captures
│
├── narrative/                       # Story and events
│   ├── opening-story.md            # Game intro text crawl & species lore
│   ├── victory-endings.md          # Unique ending cutscene specs for each victory
│   ├── discovery-events.md         # Ancient ruins, artifacts, precursor discoveries
│   ├── crisis-events.md            # Mid-game challenges (Space monsters, plagues, supernovas)
│   └── flavor-text.md              # UI tooltips, diplomatic snippets, field quotes
│
├── planets/                         # Colonization and planets
│   ├── buildings.md                # Factories, research labs, etc.
│   ├── generation-tables.md        # Probability tables for planet gen
│   ├── planet-sizes.md             # Tiny to huge
│   ├── planet-types.md             # Terran, ocean, desert, etc.
│   ├── population.md               # Growth, morale, taxation
│   ├── production.md               # Resource management
│   ├── slider-mathematics.md       # Slider formula details (planet-specific)
│   └── special-planets.md          # Artifacts, Orion, etc.
│
├── reference/                       # Reference materials directory (root /reference)
│   ├── Master_of_Orion_-_Manual_-_PC.pdf # Official MOO1 Game Manual
│   ├── README.md                   # Reference overview
│   ├── strategywiki-moo1.txt       # StrategyWiki guide text
│   └── index.html                  # StrategyWiki HTML reference
│
├── review/                          # Structural and consistency reviews
│   ├── consistency-report.md
│   ├── consistency-resolved.md
│   ├── coverage-matrix.md
│   ├── gap-analysis-manual.md
│   ├── gap-analysis-wiki.md
│   └── gaps-resolved.md
│
├── ships/                           # Ship designs and combat
│   ├── REVIEW_COMBAT.md            # Combat review notes
│   ├── combat-algorithm.md         # Full combat resolution spec
│   ├── combat-mechanics.md         # How space battles work
│   ├── components-complete.md      # All component stats (shields, armor, specials)
│   ├── ship-classes.md             # Scout, destroyer, cruiser, etc.
│   ├── ship-design.md              # Ship design interface
│   ├── special-systems.md          # Cloaking, transporters, etc.
│   └── weapons-complete.md         # Full weapon stats
│
├── species/                         # Individual race details
│   ├── REVIEW_SPECIES.md           # Species review notes
│   ├── _TEMPLATE.md                # Template for consistency
│   ├── ants.md
│   ├── budgies.md
│   ├── chameleons.md
│   ├── ferrets.md
│   ├── guinea-pigs.md
│   ├── hamsters.md
│   ├── hermit-crabs.md
│   ├── mice.md
│   ├── rabbits.md
│   ├── race-stats-complete.md      # Implementation-ready race statistics
│   └── rats.md
│
├── audio/                           # Sound design & music architecture
│   ├── audio-asset-manifest.md     # Master SFX & Music Asset Delivery Tracker
│   └── sound-specification.md      # Web Audio API topology, SFX matrix, dynamic music engine
│
├── technical/                       # Implementation specifications
│   ├── ARCHITECTURE.md
│   ├── ai-implementation.md
│   ├── data-schemas.md
│   ├── data-structures.md
│   ├── development-roadmap.md
│   ├── localization-spec.md        # i18n JSON key schema, ICU syntax, reflow budgets
│   ├── performance-budget.md       # 60 FPS SLAs, QuadTree spatial index, memory budgets
│   ├── qa-test-matrix.md           # Headless 1000-turn sim suite, PRNG seed determinism
│   ├── rendering-pipeline.md
│   └── telemetry-and-saves.md      # Balance analytics schema, save migration & recovery
│
├── technology/                      # Tech tree and research
│   ├── AUDIT_TECH_TREE_2026-04-15.md   # Tech tree audit
│   ├── TECH_OVERVIEW.md            # Tech tree structure
│   ├── VERIFICATION_2026-04-15.md  # Tech verification report
│   ├── categories.md               # Tech categories explained
│   ├── computers.md                # Targeting, ECM
│   ├── construction.md             # Building tech
│   ├── force-fields.md             # Shields, barriers
│   ├── planetology.md              # Terraforming research
│   ├── propulsion.md               # Drive systems
│   ├── research-formulas.md        # Research point calculations
│   └── weapons.md                  # Weapon technologies
│
└── ui-ux/                           # Interface design
    ├── REVIEW_GAPS.md              # UI gaps review
    ├── UI_OVERVIEW.md
    ├── accessibility.md            # Colorblind modes, hotkey registry, UI scaling
    ├── art-asset-manifest.md       # Master UI, Portait, Planet & Ship Asset Tracker
    ├── ground-combat-ui.md         # Ground combat interface
    ├── information-displays.md     # Graphs, reports
    ├── interaction-spec.md
    ├── main-screens.md             # Galaxy map, colony view
    ├── navigation-flow.md
    ├── screen-inventory.md
    ├── spy-network-ui.md           # Espionage interface
    ├── state-transitions.md
    ├── style-guide.md              # Master UI Style Guide & Design System (Tokens, CSS, Components)
    ├── tactical-combat-ui.md
    ├── random-events-ui.md         # Random events and monster UI specs
    ├── save-load-ui.md             # Save game management & autosave UI
    ├── tutorial.md                 # Guided onboarding & advisor system UI
    └── wireframes/
        ├── command_menu/
        │   ├── command_menu_design.md
        │   ├── command_menu_fleet.md
        │   ├── command_menu_map.md
        │   ├── command_menu_planets.md
        │   ├── command_menu_races.md
        │   └── command_menu_tech.md
        ├── diplomacy-screen.md
        ├── end-game-screens.md
        ├── fleet-deployment-panel.md
        ├── fleet-screen.md
        ├── galaxy-map.md
        ├── moo1-reference-wireframes.md
        ├── new-game-setup.md
        ├── research-tree.md
        └── ship-design-screen.md
```

## Notes

- All planned design documents across all folders are fully written, validated, and integrated.
- The `audio/` folder contains the full Web Audio API specification, SFX matrix, and music engine rules.
- The `technical/` folder includes production-grade specs for performance budgets, i18n localization, telemetry, and automated headless QA.
- The `ui-ux/` folder contains accessibility compliance, hotkey registries, and the master UI Style Guide.
- All 39 PNG reference screenshots in `moo_screens/` are linked and embedded across design files using absolute `file://` URIs.
- Local reference files in `reference/` (`Master_of_Orion_-_Manual_-_PC.pdf`, `strategywiki-moo1.txt`) and `Master of Orion Planetary Controls Explained.pdf` are directly linked across relevant design documents.
- Last updated: 2026-07-29 to reflect complete 100% AAA studio-ready workspace layout.

