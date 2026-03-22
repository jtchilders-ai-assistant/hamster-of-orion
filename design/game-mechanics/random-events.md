# Random Events System

## Overview

Random events inject unpredictability into each playthrough, creating emergent narratives and strategic challenges. Events range from beneficial (mineral discoveries, fertile planets) to catastrophic (supernovas, comets destroying planets). The system includes space monsters guarding valuable locations, natural disasters, economic events, diplomatic incidents, and opportunities for discovery.

Events occur per-turn based on a probability that increases as the game progresses. Events can target the player or AI empires. Some events (like the Guardian of Orion) are fixed location encounters rather than random occurrences.

---

## Event Probability System

### Base Probability Formula

```
event_chance_per_turn = BASE_EVENT_CHANCE + (turn_number * TURN_PROBABILITY_INCREMENT)
```

Where:
- `BASE_EVENT_CHANCE` = 3% (starting turn 1)
- `TURN_PROBABILITY_INCREMENT` = 0.1% per turn
- Maximum probability caps at 15%

### Event Roll Algorithm

```pseudocode
function rollForRandomEvent(turn_number, difficulty):
    # Calculate current event probability
    event_chance = min(0.03 + (turn_number * 0.001), 0.15)
    
    # Apply difficulty modifier
    event_chance = event_chance * DIFFICULTY_EVENT_MULTIPLIER[difficulty]
    
    # Roll for event occurrence
    if random() < event_chance:
        return selectEvent(turn_number)
    return null

function selectEvent(turn_number):
    # Build eligible event pool based on turn requirements
    eligible_events = []
    
    for event in ALL_EVENTS:
        if turn_number >= event.min_turn:
            if meetsPrerequisites(event):
                eligible_events.append(event)
    
    # Weighted random selection
    total_weight = sum(e.weight for e in eligible_events)
    roll = random() * total_weight
    
    cumulative = 0
    for event in eligible_events:
        cumulative += event.weight
        if roll <= cumulative:
            return event
    
    return eligible_events[-1]  # Fallback
```

---

## Constants

### EVENT_PROBABILITY_CONFIG

```json
{
  "BASE_EVENT_CHANCE": 0.03,
  "TURN_PROBABILITY_INCREMENT": 0.001,
  "MAX_EVENT_CHANCE": 0.15,
  "MIN_TURNS_BETWEEN_SAME_EVENT": 20,
  "DIFFICULTY_EVENT_MULTIPLIER": {
    "simple": 0.5,
    "easy": 0.75,
    "average": 1.0,
    "hard": 1.25,
    "impossible": 1.5
  }
}
```

### EVENT_WEIGHTS

Probability weights for random event selection:

```json
{
  "EVENT_WEIGHTS": {
    "space_monsters": {
      "cosmic_blob": 8,
      "crystal_horror": 6,
      "void_wyrm": 4
    },
    "discoveries": {
      "ancient_derelict": 12,
      "fertile_planet": 10,
      "mineral_rich_planet": 10
    },
    "disasters": {
      "plague": 10,
      "comet": 6,
      "earthquake": 8,
      "industrial_accident": 10,
      "computer_virus": 8,
      "depleted_planet": 6,
      "supernova": 2
    },
    "diplomatic": {
      "diplomatic_blunder": 8,
      "piracy": 10,
      "rebellion": 6
    },
    "opportunities": {
      "donation": 8,
      "scientist_recruitment": 6,
      "leader_emergence": 4
    }
  },
  "CATEGORY_WEIGHTS": {
    "space_monsters": 15,
    "discoveries": 25,
    "disasters": 30,
    "diplomatic": 15,
    "opportunities": 15
  }
}
```

---

## Event Selection Algorithm

```pseudocode
function selectEventCategory():
    # First select category based on category weights
    categories = ["space_monsters", "discoveries", "disasters", "diplomatic", "opportunities"]
    weights = [15, 25, 30, 15, 15]
    
    return weightedRandomChoice(categories, weights)

function selectEventFromCategory(category, galaxy_state):
    events = EVENT_WEIGHTS[category]
    eligible = []
    
    for event_id, weight in events:
        event = EVENT_DEFINITIONS[event_id]
        
        # Check turn requirement
        if galaxy_state.turn < event.min_turn:
            continue
            
        # Check tech prerequisites
        if not hasTechPrerequisites(event, galaxy_state):
            continue
            
        # Check galaxy state requirements
        if not meetsGalaxyRequirements(event, galaxy_state):
            continue
            
        # Check cooldown
        if galaxy_state.turn - event.last_triggered < MIN_TURNS_BETWEEN_SAME_EVENT:
            continue
            
        eligible.append((event_id, weight))
    
    if len(eligible) == 0:
        return null
    
    return weightedRandomChoice(eligible)

function meetsGalaxyRequirements(event, galaxy_state):
    match event.galaxy_requirement:
        case "has_colonies":
            return galaxy_state.player_colony_count > 0
        case "has_multiple_colonies":
            return galaxy_state.player_colony_count >= 2
        case "has_enemy_contact":
            return galaxy_state.known_empires > 0
        case "has_factories":
            return galaxy_state.total_factories > 0
        case "has_fleet":
            return galaxy_state.total_ships > 0
        case null:
            return true
    return false
```

---

## Space Monsters

Space monsters are powerful neutral entities that attack systems or guard valuable locations. They cannot be negotiated with and must be destroyed through combat.

### Cosmic Blob (Space Amoeba equivalent)

A massive single-celled organism that drifts through space, consuming everything in its path. Regenerates damage rapidly.

**Pet-themed name**: "Cosmic Blob" (evokes escaped pet hamster ball filled with slime)

| Stat | Value | Notes |
|------|-------|-------|
| Hit Points | 500 | Regenerates each combat round |
| Attack Level | 4 | Equivalent to Class IV Battle Computer |
| Defense Level | 4 | Equivalent to Class IV ECM Jammer |
| Beam Attack | 10-40 | Per round |
| Movement | 2 | Slow but inexorable |
| Regeneration | 15 HP/round | Key threat - must kill fast |

**Trigger Conditions**:
- Minimum turn: 50
- No tech prerequisites
- Cannot spawn within 5 parsecs of player homeworld
- Targets random owned system

**Behavior**:
1. Spawns at random location 3+ parsecs from nearest colony
2. Moves toward nearest colony (any empire)
3. Attacks planetary defenses, then bombards population
4. Regenerates 15 HP per combat round
5. Moves to next nearest colony after destroying target

**Reward on Defeat**:
- Regeneration technology research bonus (+50% to Planetology for 10 turns)
- 200-500 BC salvage

### Crystal Horror (Space Crystal equivalent)

A massive crystalline entity that reflects beam weapon energy back at attackers.

**Pet-themed name**: "Crystal Horror" (evokes hermit crab shell gone terrifyingly wrong)

| Stat | Value | Notes |
|------|-------|-------|
| Hit Points | 400 | No regeneration |
| Attack Level | 6 | High accuracy |
| Defense Level | 8 | Very hard to hit |
| Beam Attack | 15-50 | Crystal shards |
| Beam Reflection | 25% | Reflects beam damage back |
| Movement | 3 | Moderate speed |

**Trigger Conditions**:
- Minimum turn: 75
- No tech prerequisites
- Cannot spawn within 5 parsecs of player homeworld

**Behavior**:
1. Spawns near nebula regions when possible
2. Moves toward nearest colony
3. Reflects 25% of beam weapon damage back at attacker
4. Missiles and torpedoes are unaffected by reflection
5. Immune to point defense systems

**Reward on Defeat**:
- Crystal armor technology (+25% to Construction research for 10 turns)
- 300-600 BC salvage

### Void Wyrm (Space Dragon equivalent)

An ancient predator that guards a treasure hoard. The most dangerous random space monster.

**Pet-themed name**: "Void Wyrm" (evokes ancient escaped ferret grown to cosmic proportions)

| Stat | Value | Notes |
|------|-------|-------|
| Hit Points | 750 | Highest HP |
| Attack Level | 8 | Devastating accuracy |
| Defense Level | 6 | Hard to hit |
| Breath Attack | 30-100 | Plasma breath, area effect |
| Movement | 4 | Fast |
| Treasure | Yes | Ancient tech cache |

**Trigger Conditions**:
- Minimum turn: 100
- No tech prerequisites
- Very rare (weight: 4)

**Behavior**:
1. Does NOT roam - guards a specific "treasure" location
2. Location revealed when monster spawns
3. Attacks any fleet that enters system
4. Cannot be bypassed - must be destroyed to access treasure

**Reward on Defeat**:
- 2-4 random technologies from any field
- 500-1000 BC salvage
- Possible artifact: +10% research empire-wide permanently

### Guardian of Orion

The Guardian is NOT a random event - it is a fixed encounter guarding the Orion system at galaxy center. However, it is documented here as part of the monster system.

**Pet-themed name**: "Guardian of Orion" (Ancient Ones' final defender)

| Stat | Value | Notes |
|------|-------|-------|
| Hit Points | 3000 | Massive |
| Attack Level | 12 | Cannot miss |
| Defense Level | 10 | Nearly unhittable |
| Shield Level | Class XV | Absorbs 15 damage per hit |
| Weapons | Death Ray, Scatter Pack Missiles, Plasma Torpedo | Multiple weapon systems |
| Movement | 5 | Fast |
| Specials | Damper Field, High Energy Focus | Nullifies specials |

**Location**: Always at Orion system (galaxy center)

**Behavior**:
1. Does not leave Orion system
2. Attacks any fleet entering Orion
3. Cannot be negotiated with
4. Respawns after 50 turns if destroyed (unless Orion colonized)

**Reward on Defeat**:
- Access to Orion system (richest planet in galaxy)
- Death Ray technology
- Possible additional Ancient technologies

---

## MONSTER_STATS JSON

```json
{
  "MONSTER_STATS": {
    "cosmic_blob": {
      "id": "cosmic_blob",
      "name": "Cosmic Blob",
      "moo1_equivalent": "Space Amoeba",
      "description": "A massive single-celled organism that drifts through space, consuming everything in its path.",
      "hit_points": 500,
      "attack_level": 4,
      "defense_level": 4,
      "beam_attack_min": 10,
      "beam_attack_max": 40,
      "movement": 2,
      "regeneration_per_round": 15,
      "beam_reflection_percent": 0,
      "specials": ["regeneration"],
      "immune_to": [],
      "reward_research_bonus": {
        "field": "planetology",
        "percent": 50,
        "duration_turns": 10
      },
      "reward_bc_min": 200,
      "reward_bc_max": 500,
      "min_turn": 50,
      "event_weight": 8,
      "roaming": true
    },
    "crystal_horror": {
      "id": "crystal_horror",
      "name": "Crystal Horror",
      "moo1_equivalent": "Space Crystal",
      "description": "A massive crystalline entity that reflects beam weapon energy back at attackers.",
      "hit_points": 400,
      "attack_level": 6,
      "defense_level": 8,
      "beam_attack_min": 15,
      "beam_attack_max": 50,
      "movement": 3,
      "regeneration_per_round": 0,
      "beam_reflection_percent": 25,
      "specials": ["beam_reflection"],
      "immune_to": ["point_defense"],
      "reward_research_bonus": {
        "field": "construction",
        "percent": 25,
        "duration_turns": 10
      },
      "reward_bc_min": 300,
      "reward_bc_max": 600,
      "min_turn": 75,
      "event_weight": 6,
      "roaming": true
    },
    "void_wyrm": {
      "id": "void_wyrm",
      "name": "Void Wyrm",
      "moo1_equivalent": "Space Dragon",
      "description": "An ancient predator that guards a treasure hoard of Ancient One technology.",
      "hit_points": 750,
      "attack_level": 8,
      "defense_level": 6,
      "beam_attack_min": 30,
      "beam_attack_max": 100,
      "movement": 4,
      "regeneration_per_round": 0,
      "beam_reflection_percent": 0,
      "specials": ["area_attack", "treasure_hoard"],
      "immune_to": [],
      "reward_technologies_min": 2,
      "reward_technologies_max": 4,
      "reward_bc_min": 500,
      "reward_bc_max": 1000,
      "reward_artifact_chance": 0.25,
      "min_turn": 100,
      "event_weight": 4,
      "roaming": false
    },
    "guardian_of_orion": {
      "id": "guardian_of_orion",
      "name": "Guardian of Orion",
      "moo1_equivalent": "Guardian",
      "description": "The Ancient Ones' final defender, an automated warship of immense power guarding the Cosmic Wheel.",
      "hit_points": 3000,
      "attack_level": 12,
      "defense_level": 10,
      "shield_level": 15,
      "weapons": [
        {"type": "death_ray", "count": 1},
        {"type": "scatter_pack_missiles", "count": 5},
        {"type": "plasma_torpedo", "count": 3}
      ],
      "movement": 5,
      "specials": ["damper_field", "high_energy_focus"],
      "immune_to": ["biological_weapons"],
      "location": "orion",
      "respawn_turns": 50,
      "is_random_event": false,
      "reward_technology": "death_ray",
      "reward_system_access": "orion"
    }
  }
}
```

---

## Discoveries

Beneficial events that provide resources, technology, or permanent planetary improvements.

### Ancient Derelict

An abandoned spacecraft from the Ancient Ones is discovered drifting in space.

**Trigger Conditions**:
- Minimum turn: 20
- Requires: Player has active scout/colony ship
- Galaxy requirement: None

**Duration**: Instant (one-time event)

**Effects**:
- Option A: Salvage for BC (200-800 BC)
- Option B: Board and explore
  - 60% chance: Technology discovery (random tier 1-current+2)
  - 25% chance: Nothing found
  - 15% chance: Trap - lose ship crew (if colony ship, lose colonists)

```json
{
  "id": "ancient_derelict",
  "name": "Ancient Derelict",
  "category": "discoveries",
  "description": "An abandoned spacecraft from the Ancient Ones drifts silently in the void.",
  "min_turn": 20,
  "weight": 12,
  "tech_prerequisites": [],
  "galaxy_requirement": null,
  "duration_turns": 0,
  "target_type": "random_owned_system",
  "effects": {
    "choice_required": true,
    "options": [
      {
        "id": "salvage",
        "label": "Salvage for Parts",
        "outcomes": [
          {"probability": 1.0, "effect": "bc_gain", "min": 200, "max": 800}
        ]
      },
      {
        "id": "board",
        "label": "Board and Explore",
        "outcomes": [
          {"probability": 0.60, "effect": "tech_discovery", "tier_range": [1, "current+2"]},
          {"probability": 0.25, "effect": "nothing"},
          {"probability": 0.15, "effect": "trap", "casualty_type": "crew"}
        ]
      }
    ]
  }
}
```

### Fertile Planet

A planet develops unusually fertile conditions, increasing its maximum population.

**Trigger Conditions**:
- Minimum turn: 30
- Requires: Player has 2+ colonized planets
- Galaxy requirement: has_multiple_colonies

**Duration**: Permanent

**Effects**:
- Target planet gains +25% maximum population capacity
- Population growth rate +50% for 10 turns

```json
{
  "id": "fertile_planet",
  "name": "Fertile Planet",
  "category": "discoveries",
  "description": "Unusual biological activity makes this world exceptionally hospitable to life.",
  "min_turn": 30,
  "weight": 10,
  "tech_prerequisites": [],
  "galaxy_requirement": "has_multiple_colonies",
  "duration_turns": -1,
  "target_type": "random_owned_colony",
  "effects": {
    "permanent": {
      "max_population_modifier": 1.25
    },
    "temporary": {
      "population_growth_modifier": 1.5,
      "duration_turns": 10
    }
  }
}
```

### Mineral-Rich Planet

Valuable mineral deposits are discovered on a colony.

**Trigger Conditions**:
- Minimum turn: 30
- Requires: Player has colonies
- Galaxy requirement: has_colonies

**Duration**: Permanent

**Effects**:
- Target planet production +25% permanently
- Equivalent to upgrading planet to Rich

```json
{
  "id": "mineral_rich_planet",
  "name": "Mineral-Rich Planet",
  "category": "discoveries",
  "description": "Deep mineral surveys reveal vast untapped deposits beneath the surface.",
  "min_turn": 30,
  "weight": 10,
  "tech_prerequisites": [],
  "galaxy_requirement": "has_colonies",
  "duration_turns": -1,
  "target_type": "random_owned_colony",
  "exclude_planet_types": ["rich", "ultra_rich"],
  "effects": {
    "permanent": {
      "production_modifier": 1.25
    }
  }
}
```

---

## Disasters

Harmful events that damage colonies, destroy resources, or create diplomatic crises.

### Plague

A deadly disease outbreak devastates a colony's population.

**Trigger Conditions**:
- Minimum turn: 40
- Requires: Population > 20 million on target
- Galaxy requirement: has_colonies

**Duration**: 3-5 turns (unless cured)

**Effects**:
- -10% to -20% population per turn while active
- Spreads to adjacent colonies (25% chance per turn)
- Can be cured with Atmospheric Terraforming tech or Bio Toxin Antidote

**Mitigation**:
- Bio Toxin Antidote: Immediate cure
- Atmospheric Terraforming: Duration reduced by 50%
- Soil Enrichment: Death rate reduced by 50%

```json
{
  "id": "plague",
  "name": "Plague",
  "category": "disasters",
  "description": "A virulent disease spreads through the colony, claiming lives by the millions.",
  "min_turn": 40,
  "weight": 10,
  "tech_prerequisites": [],
  "galaxy_requirement": "has_colonies",
  "target_requirements": {
    "min_population": 20
  },
  "duration_turns": {
    "min": 3,
    "max": 5
  },
  "effects": {
    "population_loss_percent_per_turn": {
      "min": 10,
      "max": 20
    },
    "spread_chance_per_turn": 0.25,
    "spread_range_parsecs": 3
  },
  "mitigation": {
    "bio_toxin_antidote": {"effect": "cure_immediate"},
    "atmospheric_terraforming": {"effect": "duration_reduction", "percent": 50},
    "soil_enrichment": {"effect": "death_rate_reduction", "percent": 50}
  }
}
```

### Comet

A massive comet threatens to impact a colony world.

**Trigger Conditions**:
- Minimum turn: 60
- Requires: Player has colonies
- Galaxy requirement: has_colonies

**Duration**: 5 turns warning period

**Effects**:
- If not intercepted: Colony DESTROYED (all population and factories lost)
- Player has 5 turns to move fleet to system
- Fleet automatically engages comet in combat
- Comet has HP that must be depleted before impact

**Comet Combat Stats**:
| Stat | Value |
|------|-------|
| Hit Points | 1000 |
| Hit Points Lost Per Ship Damage | 1:1 ratio |
| Movement | 0 (stationary target) |
| Defense Level | 0 |

**Interception Formula**:
```
damage_to_comet = sum(ship_damage_output for all ships in system)
comet_destroyed = (damage_to_comet >= comet_hp)
```

```json
{
  "id": "comet",
  "name": "Comet",
  "category": "disasters",
  "description": "A massive comet is on collision course with one of your worlds. Deploy your fleet to intercept!",
  "min_turn": 60,
  "weight": 6,
  "tech_prerequisites": [],
  "galaxy_requirement": "has_colonies",
  "duration_turns": 5,
  "target_type": "random_owned_colony",
  "effects": {
    "warning_turns": 5,
    "comet_hp": 1000,
    "comet_defense": 0,
    "if_not_intercepted": {
      "colony_destroyed": true,
      "population_killed": "all",
      "factories_destroyed": "all"
    }
  },
  "interception": {
    "fleet_requirement": "any",
    "damage_applies_per_turn": true,
    "success_condition": "comet_hp_depleted"
  }
}
```

### Earthquake

Seismic activity destroys factories and infrastructure.

**Trigger Conditions**:
- Minimum turn: 25
- Requires: Target has 20+ factories
- Galaxy requirement: has_factories

**Duration**: Instant

**Effects**:
- -10 to -30 factories destroyed
- -5% to -15% population killed

```json
{
  "id": "earthquake",
  "name": "Earthquake",
  "category": "disasters",
  "description": "Massive seismic activity devastates industrial zones and populated areas.",
  "min_turn": 25,
  "weight": 8,
  "tech_prerequisites": [],
  "galaxy_requirement": "has_factories",
  "target_requirements": {
    "min_factories": 20
  },
  "duration_turns": 0,
  "target_type": "random_owned_colony",
  "effects": {
    "factories_destroyed": {
      "min": 10,
      "max": 30
    },
    "population_killed_percent": {
      "min": 5,
      "max": 15
    }
  }
}
```

### Industrial Accident

A catastrophic failure at industrial facilities causes damage and pollution.

**Trigger Conditions**:
- Minimum turn: 20
- Requires: Target has 30+ factories
- Galaxy requirement: has_factories

**Duration**: Instant

**Effects**:
- -10 to -25 factories destroyed
- +50 to +100 waste/pollution added
- Small population loss (1-5%)

```json
{
  "id": "industrial_accident",
  "name": "Industrial Accident",
  "category": "disasters",
  "description": "A catastrophic failure at the industrial complex causes widespread damage and contamination.",
  "min_turn": 20,
  "weight": 10,
  "tech_prerequisites": [],
  "galaxy_requirement": "has_factories",
  "target_requirements": {
    "min_factories": 30
  },
  "duration_turns": 0,
  "target_type": "random_owned_colony",
  "effects": {
    "factories_destroyed": {
      "min": 10,
      "max": 25
    },
    "pollution_added": {
      "min": 50,
      "max": 100
    },
    "population_killed_percent": {
      "min": 1,
      "max": 5
    }
  }
}
```

### Computer Virus

A computer virus infects empire systems, reducing research output.

**Trigger Conditions**:
- Minimum turn: 50
- Requires: Empire has research output > 100 RP/turn
- Tech prerequisites: Computer tech level 10+

**Duration**: 5-10 turns

**Effects**:
- -25% research output empire-wide
- -10% production on all colonies (automated systems compromised)

**Mitigation**:
- Battle Computer Mark V or higher: Duration reduced by 50%
- ECM Jammer Mark V or higher: Effect severity reduced by 50%

```json
{
  "id": "computer_virus",
  "name": "Computer Virus",
  "category": "disasters",
  "description": "A malicious program has infiltrated your empire's computer networks, disrupting research and production.",
  "min_turn": 50,
  "weight": 8,
  "tech_prerequisites": [
    {"field": "computers", "level": 10}
  ],
  "galaxy_requirement": null,
  "empire_requirements": {
    "min_research_output": 100
  },
  "duration_turns": {
    "min": 5,
    "max": 10
  },
  "target_type": "empire_wide",
  "effects": {
    "research_output_modifier": 0.75,
    "production_modifier": 0.90
  },
  "mitigation": {
    "battle_computer_v": {"effect": "duration_reduction", "percent": 50},
    "ecm_jammer_v": {"effect": "severity_reduction", "percent": 50}
  }
}
```

### Depleted Planet

A colony's mineral resources become exhausted.

**Trigger Conditions**:
- Minimum turn: 80
- Requires: Target is normal/rich planet with 50+ factories
- Galaxy requirement: has_factories

**Duration**: Permanent

**Effects**:
- Planet downgraded one resource level (Rich → Normal → Poor)
- Production permanently reduced by 25%

```json
{
  "id": "depleted_planet",
  "name": "Depleted Planet",
  "category": "disasters",
  "description": "Decades of intensive mining have exhausted the easily accessible mineral deposits.",
  "min_turn": 80,
  "weight": 6,
  "tech_prerequisites": [],
  "galaxy_requirement": "has_factories",
  "target_requirements": {
    "min_factories": 50,
    "exclude_resource_level": ["poor", "ultra_poor"]
  },
  "duration_turns": -1,
  "target_type": "random_owned_colony",
  "effects": {
    "permanent": {
      "resource_level_downgrade": 1,
      "production_modifier": 0.75
    }
  }
}
```

### Supernova

A star goes supernova, devastating the entire system.

**Trigger Conditions**:
- Minimum turn: 100
- Requires: Galaxy has 15+ colonized systems total
- Very rare event (weight: 2)
- Cannot target homeworld systems

**Duration**: 5 turns warning, then instant destruction

**Effects**:
- ALL planets in system destroyed (converted to asteroid belts)
- All population and infrastructure lost
- All ships in system destroyed
- System becomes uninhabitable permanently

**Prevention**:
- Evacuate population during warning period
- No technology can prevent supernova

```json
{
  "id": "supernova",
  "name": "Supernova",
  "category": "disasters",
  "description": "The star is entering catastrophic collapse. All worlds in this system will be destroyed!",
  "min_turn": 100,
  "weight": 2,
  "tech_prerequisites": [],
  "galaxy_requirement": null,
  "empire_requirements": {
    "min_total_colonized_systems": 15
  },
  "target_restrictions": {
    "exclude_homeworld": true
  },
  "duration_turns": 5,
  "target_type": "random_owned_system",
  "effects": {
    "warning_turns": 5,
    "on_detonation": {
      "all_planets_destroyed": true,
      "system_becomes": "asteroid_belt",
      "ships_in_system_destroyed": true,
      "population_killed": "all",
      "factories_destroyed": "all",
      "permanently_uninhabitable": true
    }
  },
  "prevention": null
}
```

---

## Diplomatic Events

Events that affect relationships with other empires.

### Diplomatic Blunder

An inadvertent insult or miscommunication damages relations with another empire.

**Trigger Conditions**:
- Minimum turn: 30
- Requires: Contact with at least 1 other empire
- Galaxy requirement: has_enemy_contact

**Duration**: Instant

**Effects**:
- -20 to -40 diplomacy points with random contacted empire
- May trigger AI aggression check

```json
{
  "id": "diplomatic_blunder",
  "name": "Diplomatic Blunder",
  "category": "diplomatic",
  "description": "A cultural misunderstanding has caused offense to a foreign power.",
  "min_turn": 30,
  "weight": 8,
  "tech_prerequisites": [],
  "galaxy_requirement": "has_enemy_contact",
  "duration_turns": 0,
  "target_type": "random_contacted_empire",
  "effects": {
    "diplomacy_points_change": {
      "min": -40,
      "max": -20
    },
    "triggers_aggression_check": true
  }
}
```

### Piracy (Space Pirates)

Rogue ships raid your trade routes and colonies.

**Trigger Conditions**:
- Minimum turn: 40
- Requires: Player has trade agreements OR 3+ colonies
- Galaxy requirement: has_colonies

**Duration**: Persists until fleet destroys pirates

**Effects**:
- Pirate fleet spawns near trade route
- -10% to -25% trade income while active
- Random colony raided for 50-200 BC per turn
- Pirates have fleet strength scaled to game turn

**Pirate Fleet Composition**:
| Turn Range | Composition |
|------------|-------------|
| 40-70 | 3 Small ships, 1 Medium |
| 71-100 | 4 Small ships, 2 Medium |
| 101+ | 5 Small ships, 2 Medium, 1 Large |

```json
{
  "id": "piracy",
  "name": "Space Pirates",
  "category": "diplomatic",
  "description": "A fleet of renegade ships preys upon your shipping lanes and remote colonies.",
  "min_turn": 40,
  "weight": 10,
  "tech_prerequisites": [],
  "galaxy_requirement": "has_colonies",
  "duration_turns": -1,
  "duration_condition": "fleet_destroyed",
  "target_type": "random_trade_route",
  "effects": {
    "trade_income_modifier": {
      "min": 0.75,
      "max": 0.90
    },
    "colony_raided_bc_per_turn": {
      "min": 50,
      "max": 200
    }
  },
  "fleet_scaling": {
    "turn_40_70": {
      "small": 3,
      "medium": 1
    },
    "turn_71_100": {
      "small": 4,
      "medium": 2
    },
    "turn_101_plus": {
      "small": 5,
      "medium": 2,
      "large": 1
    }
  },
  "pirate_tech_level": "player_average - 5"
}
```

### Rebellion

A colony's population revolts against your rule.

**Trigger Conditions**:
- Minimum turn: 60
- Requires: Colony with morale < 50% OR recently conquered
- More likely on conquered colonies (2x weight)

**Duration**: Until resolved

**Effects**:
- Colony produces no income, research, or ships
- Population fights against any incoming transports
- Garrison troops attack each other (50% civil war losses)
- If not suppressed within 10 turns, colony declares independence

**Resolution Options**:
1. Land troops to suppress (triggers ground combat)
2. Bombard from orbit (kills population, damages factories)
3. Wait for loyalty to recover (10 turns, may lose colony)

**Prevention**:
- High morale (75%+) makes rebellion nearly impossible
- Psionics technology reduces chance by 50%

```json
{
  "id": "rebellion",
  "name": "Rebellion",
  "category": "diplomatic",
  "description": "The population has risen up against your rule. Loyalty must be restored or the colony will be lost.",
  "min_turn": 60,
  "weight": 6,
  "tech_prerequisites": [],
  "galaxy_requirement": "has_colonies",
  "target_requirements": {
    "morale_below": 50,
    "recently_conquered_multiplier": 2.0
  },
  "duration_turns": 10,
  "duration_condition": "suppressed_or_independent",
  "target_type": "random_low_morale_colony",
  "effects": {
    "income_production": 0,
    "research_production": 0,
    "ship_production": 0,
    "garrison_losses_per_turn_percent": 50,
    "independence_threshold_turns": 10
  },
  "resolution_options": [
    {
      "id": "suppress",
      "label": "Land Troops to Suppress",
      "effect": "ground_combat",
      "defender_strength_modifier": 1.5
    },
    {
      "id": "bombard",
      "label": "Bombard from Orbit",
      "effect": "orbital_bombardment"
    },
    {
      "id": "wait",
      "label": "Wait for Loyalty",
      "effect": "gradual_morale_recovery",
      "turns_to_recover": 10
    }
  ],
  "prevention": {
    "high_morale_threshold": 75,
    "psionics_tech_reduction": 0.5
  }
}
```

---

## Opportunities

Positive events that provide bonuses, resources, or special options.

### Donation

A wealthy benefactor donates resources to your empire.

**Trigger Conditions**:
- Minimum turn: 15
- No special requirements

**Duration**: Instant

**Effects**:
- +100 to +500 BC added to treasury

```json
{
  "id": "donation",
  "name": "Donation",
  "category": "opportunities",
  "description": "A wealthy citizen has bequeathed their fortune to the empire's treasury.",
  "min_turn": 15,
  "weight": 8,
  "tech_prerequisites": [],
  "galaxy_requirement": null,
  "duration_turns": 0,
  "target_type": "empire",
  "effects": {
    "bc_gain": {
      "min": 100,
      "max": 500
    }
  }
}
```

### Scientist Recruitment

A brilliant scientist offers their services to your empire.

**Trigger Conditions**:
- Minimum turn: 40
- Requires: Empire has research output > 50 RP/turn

**Duration**: Permanent (until scientist dies/retires)

**Effects**:
- +10% to +25% research bonus in one random field
- Duration: 20-50 turns (scientist's career)

```json
{
  "id": "scientist_recruitment",
  "name": "Scientist Recruitment",
  "category": "opportunities",
  "description": "A brilliant researcher seeks to join your scientific community.",
  "min_turn": 40,
  "weight": 6,
  "tech_prerequisites": [],
  "galaxy_requirement": null,
  "empire_requirements": {
    "min_research_output": 50
  },
  "duration_turns": {
    "min": 20,
    "max": 50
  },
  "target_type": "empire",
  "effects": {
    "research_bonus": {
      "field": "random",
      "percent_min": 10,
      "percent_max": 25
    }
  }
}
```

### Leader Emergence

A charismatic leader emerges, boosting empire morale and productivity.

**Trigger Conditions**:
- Minimum turn: 50
- Requires: Empire has 5+ colonies

**Duration**: 15-30 turns

**Effects**:
- +10% morale empire-wide
- +5% production empire-wide
- +10 diplomacy with all known empires

```json
{
  "id": "leader_emergence",
  "name": "Leader Emergence",
  "category": "opportunities",
  "description": "An inspiring figure has emerged to rally your people to greater heights.",
  "min_turn": 50,
  "weight": 4,
  "tech_prerequisites": [],
  "galaxy_requirement": null,
  "empire_requirements": {
    "min_colonies": 5
  },
  "duration_turns": {
    "min": 15,
    "max": 30
  },
  "target_type": "empire",
  "effects": {
    "morale_modifier": 1.10,
    "production_modifier": 1.05,
    "diplomacy_bonus_all_empires": 10
  }
}
```

---

## EVENT_TYPES JSON

Complete JSON data structure for all event types:

```json
{
  "EVENT_TYPES": {
    "categories": ["space_monsters", "discoveries", "disasters", "diplomatic", "opportunities"],
    
    "events": {
      "cosmic_blob": {
        "id": "cosmic_blob",
        "name": "Cosmic Blob",
        "category": "space_monsters",
        "min_turn": 50,
        "weight": 8,
        "is_monster": true
      },
      "crystal_horror": {
        "id": "crystal_horror", 
        "name": "Crystal Horror",
        "category": "space_monsters",
        "min_turn": 75,
        "weight": 6,
        "is_monster": true
      },
      "void_wyrm": {
        "id": "void_wyrm",
        "name": "Void Wyrm",
        "category": "space_monsters",
        "min_turn": 100,
        "weight": 4,
        "is_monster": true
      },
      "ancient_derelict": {
        "id": "ancient_derelict",
        "name": "Ancient Derelict",
        "category": "discoveries",
        "min_turn": 20,
        "weight": 12,
        "choice_required": true
      },
      "fertile_planet": {
        "id": "fertile_planet",
        "name": "Fertile Planet",
        "category": "discoveries",
        "min_turn": 30,
        "weight": 10,
        "permanent": true
      },
      "mineral_rich_planet": {
        "id": "mineral_rich_planet",
        "name": "Mineral-Rich Planet",
        "category": "discoveries",
        "min_turn": 30,
        "weight": 10,
        "permanent": true
      },
      "plague": {
        "id": "plague",
        "name": "Plague",
        "category": "disasters",
        "min_turn": 40,
        "weight": 10,
        "duration_type": "variable",
        "can_spread": true
      },
      "comet": {
        "id": "comet",
        "name": "Comet",
        "category": "disasters",
        "min_turn": 60,
        "weight": 6,
        "duration_type": "countdown",
        "can_intercept": true
      },
      "earthquake": {
        "id": "earthquake",
        "name": "Earthquake",
        "category": "disasters",
        "min_turn": 25,
        "weight": 8,
        "duration_type": "instant"
      },
      "industrial_accident": {
        "id": "industrial_accident",
        "name": "Industrial Accident",
        "category": "disasters",
        "min_turn": 20,
        "weight": 10,
        "duration_type": "instant"
      },
      "computer_virus": {
        "id": "computer_virus",
        "name": "Computer Virus",
        "category": "disasters",
        "min_turn": 50,
        "weight": 8,
        "duration_type": "variable",
        "empire_wide": true
      },
      "depleted_planet": {
        "id": "depleted_planet",
        "name": "Depleted Planet",
        "category": "disasters",
        "min_turn": 80,
        "weight": 6,
        "permanent": true
      },
      "supernova": {
        "id": "supernova",
        "name": "Supernova",
        "category": "disasters",
        "min_turn": 100,
        "weight": 2,
        "duration_type": "countdown",
        "catastrophic": true
      },
      "diplomatic_blunder": {
        "id": "diplomatic_blunder",
        "name": "Diplomatic Blunder",
        "category": "diplomatic",
        "min_turn": 30,
        "weight": 8,
        "duration_type": "instant"
      },
      "piracy": {
        "id": "piracy",
        "name": "Space Pirates",
        "category": "diplomatic",
        "min_turn": 40,
        "weight": 10,
        "duration_type": "until_resolved",
        "spawns_fleet": true
      },
      "rebellion": {
        "id": "rebellion",
        "name": "Rebellion",
        "category": "diplomatic",
        "min_turn": 60,
        "weight": 6,
        "duration_type": "until_resolved",
        "choice_required": true
      },
      "donation": {
        "id": "donation",
        "name": "Donation",
        "category": "opportunities",
        "min_turn": 15,
        "weight": 8,
        "duration_type": "instant"
      },
      "scientist_recruitment": {
        "id": "scientist_recruitment",
        "name": "Scientist Recruitment",
        "category": "opportunities",
        "min_turn": 40,
        "weight": 6,
        "duration_type": "variable"
      },
      "leader_emergence": {
        "id": "leader_emergence",
        "name": "Leader Emergence",
        "category": "opportunities",
        "min_turn": 50,
        "weight": 4,
        "duration_type": "variable",
        "empire_wide": true
      }
    }
  }
}
```

---

## DISASTER_EFFECTS JSON

Summary of all disaster effect types:

```json
{
  "DISASTER_EFFECTS": {
    "population_effects": {
      "population_killed_instant": {
        "description": "Immediate population loss",
        "unit": "percent or absolute",
        "examples": ["earthquake", "industrial_accident"]
      },
      "population_killed_per_turn": {
        "description": "Ongoing population loss each turn",
        "unit": "percent",
        "examples": ["plague"]
      },
      "population_killed_total": {
        "description": "Complete population elimination",
        "unit": "all",
        "examples": ["comet", "supernova"]
      }
    },
    "factory_effects": {
      "factories_destroyed_instant": {
        "description": "Immediate factory loss",
        "unit": "absolute",
        "examples": ["earthquake", "industrial_accident"]
      },
      "factories_destroyed_total": {
        "description": "Complete factory elimination",
        "unit": "all",
        "examples": ["comet", "supernova"]
      }
    },
    "production_effects": {
      "production_modifier": {
        "description": "Multiplier to production output",
        "unit": "multiplier",
        "examples": ["computer_virus", "depleted_planet"]
      },
      "pollution_added": {
        "description": "Immediate pollution increase",
        "unit": "absolute",
        "examples": ["industrial_accident"]
      }
    },
    "research_effects": {
      "research_modifier": {
        "description": "Multiplier to research output",
        "unit": "multiplier",
        "examples": ["computer_virus"]
      }
    },
    "diplomatic_effects": {
      "diplomacy_points_change": {
        "description": "Change to relationship with empire",
        "unit": "points",
        "examples": ["diplomatic_blunder"]
      }
    },
    "economic_effects": {
      "trade_income_modifier": {
        "description": "Multiplier to trade income",
        "unit": "multiplier",
        "examples": ["piracy"]
      },
      "bc_stolen_per_turn": {
        "description": "Credits lost per turn",
        "unit": "absolute",
        "examples": ["piracy"]
      }
    },
    "system_effects": {
      "planet_destroyed": {
        "description": "Planet becomes uninhabitable",
        "unit": "boolean",
        "examples": ["comet", "supernova"]
      },
      "resource_downgrade": {
        "description": "Planet resource level reduced",
        "unit": "levels",
        "examples": ["depleted_planet"]
      }
    }
  }
}
```

---

## Duration Fields Summary

| Event | Duration Type | Duration Value | Notes |
|-------|--------------|----------------|-------|
| Cosmic Blob | Until destroyed | N/A | Roams until killed |
| Crystal Horror | Until destroyed | N/A | Roams until killed |
| Void Wyrm | Until destroyed | N/A | Guards location |
| Ancient Derelict | Instant | 0 turns | One-time choice |
| Fertile Planet | Permanent | -1 (forever) | Temporary growth bonus: 10 turns |
| Mineral-Rich Planet | Permanent | -1 (forever) | - |
| Plague | Variable | 3-5 turns | Can spread |
| Comet | Countdown | 5 turns | Warning period |
| Earthquake | Instant | 0 turns | - |
| Industrial Accident | Instant | 0 turns | - |
| Computer Virus | Variable | 5-10 turns | Can be mitigated |
| Depleted Planet | Permanent | -1 (forever) | - |
| Supernova | Countdown | 5 turns | Warning period |
| Diplomatic Blunder | Instant | 0 turns | - |
| Space Pirates | Until resolved | N/A | Fleet must be destroyed |
| Rebellion | Until resolved | Max 10 turns | Independence or suppression |
| Donation | Instant | 0 turns | - |
| Scientist Recruitment | Variable | 20-50 turns | Scientist career length |
| Leader Emergence | Variable | 15-30 turns | Leader tenure |

---

## Edge Cases

### Multiple Active Events
- Maximum 3 active disaster events simultaneously per empire
- Monster events do not count against this limit
- If 3 disasters active, new disaster events are skipped

### Event Targeting
- Events cannot target the same colony twice within 10 turns
- Homeworlds have 50% reduced chance of being targeted by disasters
- Newly colonized systems (< 5 turns) are immune to disasters

### Monster Combat
- Retreating from monster combat is always allowed
- Monsters do not pursue retreating fleets
- Monsters heal to full HP if combat ends without their destruction

### Event Notification
- All events provide immediate notification
- Warning events (comet, supernova) show countdown timer
- Monster movement shown on galaxy map

### Difficulty Scaling
- Simple/Easy: 50%/75% event frequency
- Hard/Impossible: 125%/150% event frequency
- Monster HP scaled by 0.75x on Simple, 1.5x on Impossible

### AI Events
- AI empires experience same events as player
- Player receives notification only if event affects known empire
- AI receives same mitigation from technologies

---

## Examples

### Example 1: Comet Interception Calculation

**Scenario**: Comet threatens colony with 1000 HP. Player has fleet in system:
- 10 Small ships with 5 damage/turn each = 50 damage/turn
- 3 Medium ships with 15 damage/turn each = 45 damage/turn
- Total fleet damage = 95 damage/turn

**Calculation**:
```
Turns to destroy comet = ceil(1000 / 95) = 11 turns
Warning period = 5 turns
Result: COMET IMPACTS (fleet cannot destroy in time)
```

Player needs additional ships to increase damage to 200+/turn.

### Example 2: Plague Spread

**Scenario**: Plague on Colony A, turn 1 of infection

**Turn 1**:
- Colony A loses 15% population (rolled 15 in 10-20 range)
- Spread check: 25% chance to Colony B (3 parsecs away)
- Roll: 0.18 → Spreads to Colony B

**Turn 2**:
- Colony A loses 12% population, Colony B loses 18% population
- Bio Toxin Antidote researched → Both colonies cured

### Example 3: Event Selection Algorithm

**Scenario**: Turn 75, player has 5 colonies, tech level 20

```pseudocode
# Roll event occurrence
event_chance = min(0.03 + (75 * 0.001), 0.15) = 0.105 (10.5%)
roll = 0.08 → Event occurs!

# Select category (weights: 15, 25, 30, 15, 15)
category_roll = 42 (out of 100)
# 15 + 25 = 40, 40 + 30 = 70
# 42 > 40, 42 < 70 → Category: disasters

# Select event from disasters
eligible_events = [
    (plague, 10),      # min_turn 40 ✓
    (comet, 6),        # min_turn 60 ✓
    (earthquake, 8),   # min_turn 25 ✓
    (industrial_accident, 10),  # min_turn 20 ✓
    (computer_virus, 8),        # min_turn 50, needs tech 10+ ✓
    (depleted_planet, 6)        # min_turn 80 ✗
]

# Weighted selection from eligible (total weight: 42)
roll = 28
# plague: 0-10, comet: 10-16, earthquake: 16-24, industrial: 24-34
# 28 falls in industrial_accident range

Result: Industrial Accident event triggered
```

---

## References

- Master of Orion (1993) Original Game
- Master of Orion Strategy Guide (Prima Publishing, 1994)
- MOO1 Wiki: https://masteroforion.fandom.com/wiki/
- Project LORE.md for pet-themed naming conventions
