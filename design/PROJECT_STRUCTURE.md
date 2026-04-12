# Hamster of Orion - Project Structure

> **Note:** This file reflects the actual design document layout as of 2026-04-12.
> It was updated from an early proposed structure that had diverged significantly from reality.
> Files marked ❌ are planned but not yet written.

## Actual Folder Layout

```
design/
├── LORE.md                          # Master lore document
├── PROJECT_STRUCTURE.md             # This file
│
├── economy/                         # Economic formulas
│   ├── factory-formulas.md         # Production calculations
│   ├── population-growth.md        # Growth mechanics
│   └── ship-costs.md               # Ship build costs
│
├── diplomacy/                       # Inter-species relations
│   ├── ai-personalities.md         # How AI races behave
│   ├── council.md                  # High Council mechanics
│   ├── espionage.md                # Spies and sabotage
│   ├── relationship-formulas.md    # Diplomatic math
│   ├── trade.md                    # Resource trading
│   └── treaties.md                 # Trade, alliance, NAP, war
│
├── galaxy/                          # Map and exploration
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
│   ├── slider-mathematics.md       # Slider formula details
│   └── special-planets.md         # Artifacts, Orion, etc.
│
├── review/                          # Structural and consistency reviews
│   ├── consistency-report.md
│   ├── consistency-resolved.md
│   ├── coverage-matrix.md
│   ├── gap-analysis-manual.md
│   ├── gap-analysis-wiki.md
│   ├── gaps-resolved.md
│   └── REVIEW_STRUCTURE.md         # This structural review
│
├── ships/                           # Ship designs and combat
│   ├── combat-algorithm.md         # Full combat resolution spec
│   ├── combat-mechanics.md         # How space battles work
│   ├── components-complete.md      # All component stats
│   ├── defense-systems.md          # Shields, armor, point defense
│   ├── ship-classes.md             # Scout, destroyer, cruiser, etc.
│   ├── ship-design.md              # Ship design interface
│   ├── special-systems.md          # Cloaking, transporters, etc.
│   ├── weapons-complete.md         # Full weapon stats
│   └── weapons-systems.md          # Weapon stats overview
│
├── species/                         # Individual race details
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
│   ├── TECH_OVERVIEW.md            # Tech tree structure
│   ├── biotechnology.md            # ❌ Cloning, terraforming
│   ├── categories.md               # Tech categories explained
│   ├── computers.md                # Targeting, ECM
│   ├── construction.md             # Building tech
│   ├── force-fields.md             # Shields, barriers
│   ├── planetology.md              # Terraforming research
│   ├── propulsion.md               # Drive systems
│   ├── research-formulas.md        # Research point calculations
│   ├── special-tech.md             # ❌ Race-specific technologies
│   └── weapons.md                  # Weapon technologies
│
└── ui-ux/                           # Interface design
    ├── UI_OVERVIEW.md
    ├── information-displays.md     # Graphs, reports (plural — note the 's')
    ├── interaction-spec.md
    ├── main-screens.md             # Galaxy map, colony view
    ├── navigation-flow.md
    ├── screen-inventory.md
    ├── state-transitions.md
    ├── tactical-combat-ui.md
    ├── espionage-ui.md             # ❌ Not yet written
    ├── ground-combat-ui.md         # ❌ Not yet written
    ├── random-events-ui.md         # ❌ Not yet written
    ├── save-load-ui.md             # ❌ Not yet written
    ├── tutorial.md                 # ❌ Not yet written
    └── wireframes/
        ├── command_menu/           # (6 files)
        ├── fleet-deployment-panel.md
        ├── fleet-screen.md
        ├── galaxy-map.md
        ├── moo1-reference-wireframes.md
        ├── research-tree.md
        └── ship-design-screen.md
```

## Notes

- Files marked ❌ are planned but not yet created.
- The `narrative/` folder does not exist yet; all five files within it are deferred.
- `reference/` folder from the original proposal was never created; reference material lives in `review/` and external PDFs.
- For AI agent workspace conventions and task routing, see `AGENTS.md`.
- Last updated: 2026-04-12 to reflect actual file layout.
