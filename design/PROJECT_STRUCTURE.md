# Hamster of Orion - Project Structure

## Proposed Folder Organization

```
moo_clone/
├── LORE.md                    # Master lore document (current)
├── PROJECT_STRUCTURE.md       # This file
├── DESIGN_PHILOSOPHY.md       # Core design pillars and goals
│
├── species/                   # Individual race details
│   ├── _TEMPLATE.md          # Template for consistency
│   ├── budgies.md
│   ├── guinea-pigs.md
│   ├── chameleons.md
│   ├── hamsters.md
│   ├── ants.md
│   ├── mice.md
│   ├── ferrets.md
│   ├── rats.md
│   ├── rabbits.md
│   └── hermit-crabs.md
│
├── technology/                # Tech tree and research
│   ├── TECH_OVERVIEW.md      # Tech tree structure
│   ├── categories.md         # Tech categories explained
│   ├── weapons.md            # Weapon technologies
│   ├── propulsion.md         # Drive systems
│   ├── construction.md       # Building tech
│   ├── computers.md          # Targeting, ECM
│   ├── force-fields.md       # Shields, barriers
│   ├── biotechnology.md      # Cloning, terraforming
│   └── special-tech.md       # Race-specific technologies
│
├── ships/                     # Ship designs and combat
│   ├── ship-classes.md       # Scout, destroyer, cruiser, etc.
│   ├── weapons-systems.md    # Weapon stats and behavior
│   ├── defense-systems.md    # Shields, armor, point defense
│   ├── special-systems.md    # Cloaking, transporters, etc.
│   └── combat-mechanics.md   # How space battles work
│
├── planets/                   # Colonization and planets
│   ├── planet-types.md       # Terran, ocean, desert, etc.
│   ├── planet-sizes.md       # Tiny to huge
│   ├── special-planets.md    # Artifacts, orion, etc.
│   ├── buildings.md          # Factories, research labs, etc.
│   ├── population.md         # Growth, morale, taxation
│   └── production.md         # Resource management
│
├── diplomacy/                 # Inter-species relations
│   ├── treaties.md           # Trade, alliance, NAP, war
│   ├── council.md            # High council mechanics
│   ├── espionage.md          # Spies and sabotage
│   ├── trade.md              # Resource trading
│   └── ai-personalities.md   # How AI races behave
│
├── galaxy/                    # Map and exploration
│   ├── map-generation.md     # Galaxy creation
│   ├── star-systems.md       # Star types and systems
│   ├── space-regions.md      # Safe zones, pellet fields, etc.
│   ├── travel.md             # Hyperspace mechanics
│   └── exploration.md        # Scouting and fog of war
│
├── game-mechanics/            # Core systems
│   ├── victory-conditions.md # Five paths to victory
│   ├── turn-structure.md     # What happens each turn
│   ├── difficulty.md         # Easy to impossible
│   ├── random-events.md      # Space monsters, discoveries
│   └── balance.md            # Design balance principles
│
├── narrative/                 # Story and events
│   ├── opening-crawl.md      # Game intro text
│   ├── victory-endings.md    # Unique ending for each victory
│   ├── discovery-events.md   # Ancient ruins, artifacts
│   ├── crisis-events.md      # Mid-game challenges
│   └── flavor-text.md        # Tooltips, descriptions
│
├── ui-ux/                     # Interface design
│   ├── main-screens.md       # Galaxy map, colony view
│   ├── information-display.md # Graphs, reports
│   ├── controls.md           # Input methods
│   └── visual-style.md       # Art direction notes
│
└── reference/                 # Development reference
    ├── moo1-analysis.md      # What made MOO1 great
    ├── modern-4x-analysis.md # What modern 4X games do well
    ├── inspiration.md        # Books, games, media
    └── glossary.md           # Term definitions
```

## Key Questions for Each Section

### Species Files Should Include:
- Physical description
- Cultural values and philosophy
- Government type
- Racial bonuses/penalties (production, research, combat, etc.)
- Starting technologies
- Unique ships/buildings/techs?
- AI personality (aggressive, expansionist, defensive, etc.)
- Diplomatic tendencies (who they like/hate)
- Leader naming conventions
- Flavor text for various situations

### Technology System Questions:
- Do races have unique tech trees or just bonuses?
- Are some techs locked to certain races?
- Research cost scaling?
- Tech prerequisites and branching?
- "Dead end" techs vs. gateway techs?

### Other Critical Decisions:
- Real-time or turn-based?
- Tactical combat or auto-resolve?
- Planet management depth (MOO1 simple vs. MOO2 complex)?
- Multiplayer or single-player only?
- Target platform (PC, web, mobile)?
- Art style (pixel art, vector, 3D)?
