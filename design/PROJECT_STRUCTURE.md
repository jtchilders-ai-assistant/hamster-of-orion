# Hamster of Orion - Project Structure

> **Note:** This file reflects the actual design document layout as of 2026-04-18.
> Files marked ❌ are planned but not yet written.

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
│   ├── turn-structure.md           # What happens each turn
│   └── victory-conditions.md       # Two paths to victory: Council Election and Military Conquest
│
├── moo_screens/                     # MOO1 reference screenshots
│   ├── viewer.html                 # Screenshot viewer
│   └── *.png                       # Various MOO1 screen captures
│
├── narrative/                       # Story and events (❌ folder not yet created)
│   ├── opening-story.md            # ❌ Game intro text
│   ├── victory-endings.md          # ❌ Unique ending for each victory
│   ├── discovery-events.md         # ❌ Ancient ruins, artifacts
│   ├── crisis-events.md            # ❌ Mid-game challenges
│   └── flavor-text.md              # ❌ Tooltips, descriptions
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
├── reference/                       # ❌ Not yet created
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
├── technical/                       # Implementation specifications
│   ├── ARCHITECTURE.md
│   ├── ai-implementation.md
│   ├── data-schemas.md
│   ├── data-structures.md
│   ├── development-roadmap.md
│   └── rendering-pipeline.md
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
    ├── ground-combat-ui.md         # Ground combat interface
    ├── information-displays.md     # Graphs, reports
    ├── interaction-spec.md
    ├── main-screens.md             # Galaxy map, colony view
    ├── navigation-flow.md
    ├── screen-inventory.md
    ├── spy-network-ui.md           # Espionage interface
    ├── state-transitions.md
    ├── tactical-combat-ui.md
    ├── random-events-ui.md         # ❌ Not yet written
    ├── save-load-ui.md             # ❌ Not yet written
    ├── tutorial.md                 # ❌ Not yet written
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

- Files marked ❌ are planned but not yet created.
- The `narrative/` folder does not exist yet; all five files within it are deferred.
- The `reference/` folder from the original proposal was never created; reference material lives in `review/` and the `moo_screens/` folder.
- `moo_screens/` contains MOO1 reference screenshots and a viewer.
- For AI agent workspace conventions and task routing, see `AGENTS.md`.
- Last updated: 2026-04-18 to reflect actual file layout.
