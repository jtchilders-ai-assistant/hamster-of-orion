# Complete Race Statistics

## Overview

This document contains the complete, implementation-ready statistics for all 10 playable races in Hamster of Orion. All values are derived from MOO1 mechanics adapted for the pet-themed setting.

Each race has:
- **Racial bonuses/penalties** (percentage modifiers to core systems)
- **Special abilities** (unique mechanics)
- **Starting technologies** (4 techs each race begins with)
- **Homeworld specifications** (planet type and characteristics)
- **AI behavior parameters** (for computer-controlled opponents)

## Race-to-MOO1 Mapping

| Race | MOO1 Equivalent | Primary Trait |
|------|-----------------|---------------|
| Hamsters | Humans | Diplomatic, Balanced |
| Ants | Klackons | +50% Production, Hive Mind |
| Mice | Meklar | +25% Production (Cybernetic) |
| Rats | Psilons | +75% Research (ALL fields) |
| Rabbits | Sakkra | +100% Population Growth |
| Hermit Crabs | Silicoids | Universal Planet Colonization |
| Guinea Pigs | Bulrathi | +50% Ground Combat |
| Ferrets | Mrrshan | +30% Ship Attack |
| Budgies | Alkari | +50% Ship Defense |
| Chameleons | Darloks | +60% Espionage |

---

## Formulas

### Racial Modifier Application

Racial bonuses apply as **multiplicative modifiers** to base values:

```
FinalValue = BaseValue × (1 + RacialBonus/100)
```

**Example**: Ants with +50% Production building a 100 BC factory:
```
EffectiveProduction = BaseProduction × 1.50
```

### Ground Combat Modifier

```
GroundCombatStrength = BaseTroopStrength × (1 + GroundCombatBonus/100)
```

### Ship Combat Modifier

Ship combat bonuses apply to attack rolls:

```
EffectiveAttack = BaseAttack + (ShipCombatBonus / 10)
EffectiveDefense = BaseDefense + (ShipDefenseBonus / 10)
```

**Example**: Budgies with +50% Ship Defense gain +5 to defense rolls.

### Research Modifier

```
EffectiveResearchPoints = BaseRP × (1 + ResearchBonus/100)
```

### Population Growth Modifier

```
EffectiveGrowthRate = BaseGrowthRate × (1 + GrowthBonus/100)
```

### Espionage Modifier

```
EspionageSuccessChance = BaseChance × (1 + EspionageBonus/100)
```

### Diplomacy Modifier

```
RelationshipChange = BaseChange × (1 + DiplomacyBonus/100)
InitialRelationship = BaseInitial + (DiplomacyBonus / 3)
```

---

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `BASE_PRODUCTION_PER_POP` | 1.0 | Base production per population unit |
| `BASE_RESEARCH_PER_SCIENTIST` | 1.0 | Base RP per scientist |
| `BASE_GROWTH_RATE` | 0.10 | Base 10% population growth per turn (MOO1 standard) |
| `BASE_ESPIONAGE_SUCCESS` | 0.30 | Base 30% spy success rate |
| `GROUND_COMBAT_BASE` | 3 | Base ground combat strength |
| `SHIP_COMBAT_BASE_ATTACK` | 1 | Base ship attack bonus |
| `SHIP_COMBAT_BASE_DEFENSE` | 1 | Base ship defense bonus |
| `DIPLOMACY_NEUTRAL_START` | 0 | Neutral relationship value |
| `DIPLOMACY_UNFRIENDLY_START` | -20 | Default starting relationship |

---

## Complete Race Data (JSON)

```json
{
  "races": [
    {
      "id": "hamsters",
      "name": "Hamsters",
      "moo1_equivalent": "Humans",
      "description": "Diplomatic survivors, adaptable and balanced in all things. Natural mediators who seek peaceful resolution but fight tenaciously when cornered.",
      "homeworld": {
        "name": "Hamsteria Prime",
        "type": "terran",
        "climate": "temperate",
        "size": "medium",
        "special": null
      },
      "bonuses": {
        "production": 0,
        "research": 0,
        "food": 10,
        "growth": 0,
        "ground_combat": -10,
        "ship_combat": 0,
        "espionage": -20,
        "diplomacy": 30
      },
      "research_field_bonuses": {
        "force_fields": 40,
        "propulsion": 20,
        "planetology": 20
      },
      "moo1_note": "Matches MOO1 Humans: +40% Force Fields, +20% Propulsion, +20% Planetology research bonuses",
      "special_abilities": [
        {
          "id": "universal_diplomat",
          "name": "Universal Diplomat",
          "description": "All other races start at Neutral rather than Unfriendly",
          "effect": {
            "type": "starting_relations",
            "value": 20,
            "scope": "all_races"
          }
        },
        {
          "id": "trade_hub",
          "name": "Trade Hub",
          "description": "+25% credits from trade agreements (matches MOO1 Human +25% trade curve shift)",
          "effect": {
            "type": "trade_bonus",
            "value": 25
          }
        },
        {
          "id": "council_favorite",
          "name": "Council Favorite",
          "description": "+1 vote in High Council elections",
          "effect": {
            "type": "council_votes",
            "value": 1
          }
        },
        {
          "id": "adaptive",
          "name": "Adaptive",
          "description": "Can colonize any planet type at reduced penalty (-25% hostility penalty)",
          "effect": {
            "type": "colonization_penalty_reduction",
            "value": 25
          }
        }
      ],
      "starting_technologies": [
        "nuclear_engines",
        "controlled_environment",
        "standard_missiles",
        "titanium_armor"
      ],
      "unique_content": {
        "building": {
          "id": "galactic_embassy",
          "name": "Galactic Embassy",
          "description": "Increases diplomatic relations and trade income",
          "cost": 200,
          "maintenance": 2,
          "effects": {
            "diplomacy_bonus": 10,
            "trade_bonus": 15
          }
        },
        "ship": {
          "id": "cargo_runner",
          "name": "Cargo Runner",
          "description": "Unarmed transport that generates credits from trade routes",
          "size": "medium",
          "special": "trade_income"
        },
        "technology": {
          "id": "cultural_exchange",
          "name": "Cultural Exchange Program",
          "description": "Further boosts diplomatic relations",
          "field": "sociology",
          "tier": 15,
          "effect": {
            "diplomacy_bonus": 20
          }
        }
      },
      "ai_behavior": {
        "archetype": "diplomat",
        "aggression": 0.1,
        "expansion": 0.5,
        "research_focus": 0.5,
        "production_focus": 0.5,
        "diplomacy_priority": 0.9,
        "natural_allies": [],
        "natural_enemies": [],
        "treaty_reliability": 0.95,
        "declares_war_first": false
      },
      "leader_names": {
        "male": ["Whiskers", "Nibbles", "Pip", "Chester", "Fuzzy", "Buttons"],
        "female": ["Daisy", "Peanut", "Cinnamon", "Honey", "Marble", "Biscuit"]
      },
      "ship_prefix": "HSS"
    },
    {
      "id": "ants",
      "name": "Ants",
      "moo1_equivalent": "Klackons",
      "description": "Hive-minded collectives with perfect industrial efficiency. The individual is nothing; the Collective is all.",
      "homeworld": {
        "name": "Formicae",
        "type": "arid",
        "climate": "dry",
        "size": "large",
        "special": "mineral_rich"
      },
      "bonuses": {
        "production": 50,
        "research": -10,
        "food": 20,
        "growth": 25,
        "ground_combat": 20,
        "ship_combat": 0,
        "espionage": 0,
        "diplomacy": -30
      },
      "special_abilities": [
        {
          "id": "perfect_efficiency",
          "name": "Perfect Efficiency",
          "description": "No population unrest, ever. Maximum production always.",
          "effect": {
            "type": "morale",
            "value": "immune_to_unrest"
          }
        },
        {
          "id": "hive_mind",
          "name": "Hive Mind",
          "description": "Immune to espionage, sabotage, and diplomatic manipulation",
          "effect": {
            "type": "espionage_immunity",
            "value": true
          }
        },
        {
          "id": "rapid_industrialization",
          "name": "Rapid Industrialization",
          "description": "New colonies reach full production 50% faster",
          "effect": {
            "type": "colony_development_speed",
            "value": 50
          }
        },
        {
          "id": "expendable_units",
          "name": "Expendable Units",
          "description": "Ships and troops cost 10% less to produce",
          "effect": {
            "type": "military_cost_reduction",
            "value": 10
          }
        },
        {
          "id": "overpopulation",
          "name": "Overpopulation",
          "description": "Can support 25% more population per planet",
          "effect": {
            "type": "max_population_bonus",
            "value": 25
          }
        }
      ],
      "starting_technologies": [
        "retro_engines",
        "automated_factory",
        "mass_driver",
        "reinforced_hull"
      ],
      "unique_content": {
        "building": {
          "id": "hive_complex",
          "name": "Hive Complex",
          "description": "Dramatically increases production and population capacity",
          "cost": 300,
          "maintenance": 3,
          "effects": {
            "production_bonus": 25,
            "max_population_bonus": 15
          }
        },
        "ship": {
          "id": "swarm_carrier",
          "name": "Swarm Carrier",
          "description": "Deploys waves of disposable fighter drones",
          "size": "huge",
          "special": "deploys_drones",
          "drone_count": 6
        },
        "technology": {
          "id": "pheromone_control",
          "name": "Pheromone Control",
          "description": "Conquered populations integrate instantly into Collective",
          "field": "sociology",
          "tier": 20,
          "effect": {
            "assimilation_time": 0
          }
        }
      },
      "ai_behavior": {
        "archetype": "expansionist",
        "aggression": 0.6,
        "expansion": 0.9,
        "research_focus": 0.3,
        "production_focus": 0.9,
        "diplomacy_priority": 0.1,
        "natural_allies": [],
        "natural_enemies": [],
        "treaty_reliability": 1.0,
        "declares_war_first": true
      },
      "leader_names": {
        "coordinators": ["Efficiency-Node-Alpha", "Production-Nexus-12", "War-Coordinator-Prime"],
        "queens": ["Colony-Founder-92", "Genetic-Template-Omega", "Egg-Layer-3847"]
      },
      "ship_prefix": "CAS"
    },
    {
      "id": "mice",
      "name": "Mice",
      "moo1_equivalent": "Meklar",
      "description": "Cybernetically-enhanced technologists, masters of automation. The flesh is weak; the machine is eternal.",
      "homeworld": {
        "name": "Cyberia",
        "type": "terran",
        "climate": "controlled",
        "size": "medium",
        "special": "artifacts"
      },
      "bonuses": {
        "production": 25,
        "research": 15,
        "food": -50,
        "growth": -25,
        "ground_combat": 15,
        "ship_combat": 15,
        "espionage": 0,
        "diplomacy": -10
      },
      "special_abilities": [
        {
          "id": "automated_production",
          "name": "Automated Production",
          "description": "Factories operate at 150% normal efficiency",
          "effect": {
            "type": "factory_efficiency",
            "value": 50
          }
        },
        {
          "id": "cybernetic_workers",
          "name": "Cybernetic Workers",
          "description": "Start with Robotic Controls III (+2 levels from base), population operates at enhanced efficiency",
          "effect": {
            "type": "starting_robotic_controls_bonus",
            "value": 2,
            "production_per_pop_bonus": 2
          },
          "moo1_note": "Matches Meklars +2 Robotic Controls starting bonus"
        },
        {
          "id": "robotic_labor",
          "name": "Robotic Labor",
          "description": "Can work hostile environments without terraforming penalties",
          "effect": {
            "type": "hostile_environment_penalty",
            "value": 0
          }
        },
        {
          "id": "reduced_waste",
          "name": "Reduced Waste",
          "description": "Pollution generates 50% slower",
          "effect": {
            "type": "pollution_reduction",
            "value": 50
          }
        },
        {
          "id": "tech_integration",
          "name": "Tech Integration",
          "description": "Reverse-engineer captured technology 50% faster",
          "effect": {
            "type": "reverse_engineering_speed",
            "value": 50
          }
        }
      ],
      "starting_technologies": [
        "nuclear_engines",
        "automated_repair",
        "battle_computer_1",
        "robotic_controls_1"
      ],
      "unique_content": {
        "building": {
          "id": "drone_factory",
          "name": "Drone Factory",
          "description": "Produces robotic workers that don't count toward population",
          "cost": 250,
          "maintenance": 2,
          "effects": {
            "virtual_population": 5,
            "production_only": true
          }
        },
        "ship": {
          "id": "automated_cruiser",
          "name": "Automated Cruiser",
          "description": "Unmanned ship with superior AI control",
          "size": "large",
          "special": "no_crew",
          "combat_bonus": 10
        },
        "technology": {
          "id": "neural_link",
          "name": "Neural Link",
          "description": "Ships controlled directly by pilot's brain",
          "field": "computers",
          "tier": 25,
          "effect": {
            "ship_combat_bonus": 30
          }
        }
      },
      "ai_behavior": {
        "archetype": "researcher",
        "aggression": 0.3,
        "expansion": 0.5,
        "research_focus": 0.8,
        "production_focus": 0.8,
        "diplomacy_priority": 0.4,
        "natural_allies": ["ants", "rats"],
        "natural_enemies": [],
        "treaty_reliability": 0.85,
        "declares_war_first": false
      },
      "leader_names": {
        "male": ["Circuit", "Protocol", "Algorithm", "Binary", "Vector", "Nexus"],
        "female": ["Matrix", "Syntax", "Compiler", "Data", "Network", "Logic"]
      },
      "ship_prefix": "MCS"
    },
    {
      "id": "rats",
      "name": "Rats",
      "moo1_equivalent": "Psilons",
      "description": "Hyper-intelligent researchers dedicated to pure science. Knowledge above all; ignorance is the only true evil.",
      "moo1_note": "Psilons: +75% research ALL fields, no espionage bonus, Pacifistic Technologist personality, always gets multiple tech choices per field.",
      "homeworld": {
        "name": "Scientifica",
        "type": "terran",
        "climate": "temperate",
        "size": "medium",
        "special": "artifacts"
      },
      "bonuses": {
        "production": -10,
        "research": 75,
        "food": 0,
        "growth": -10,
        "ground_combat": -20,
        "ship_combat": 10,
        "espionage": 0,
        "diplomacy": 10
      },
      "research_note": "+75% applies to ALL research fields equally (Physics, Math, Chemistry, Biology, Computers, Sociology).",
      "special_abilities": [
        {
          "id": "genius_researchers",
          "name": "Genius Researchers",
          "description": "Technology costs 50% less RP to research",
          "effect": {
            "type": "research_cost_reduction",
            "value": 50
          }
        },
        {
          "id": "academic_network",
          "name": "Academic Network",
          "description": "Always gets multiple tech choices per field (minimum 3)",
          "effect": {
            "type": "tech_choices",
            "value": 3
          }
        },
        {
          "id": "eureka_moments",
          "name": "Eureka Moments",
          "description": "5% chance per turn to receive free breakthrough technology",
          "effect": {
            "type": "free_tech_chance",
            "value": 5
          }
        },
        {
          "id": "quick_study",
          "name": "Quick Study",
          "description": "Can reverse-engineer captured tech immediately",
          "effect": {
            "type": "instant_reverse_engineering",
            "value": true
          }
        },
        {
          "id": "scientific_method",
          "name": "Scientific Method",
          "description": "Immune to false intelligence from Chameleons",
          "effect": {
            "type": "false_intel_immunity",
            "value": true
          }
        }
      ],
      "starting_technologies": [
        "nuclear_engines",
        "deep_space_scanner",
        "research_lab_1",
        "standard_colony_base"
      ],
      "unique_content": {
        "building": {
          "id": "grand_university",
          "name": "Grand University",
          "description": "Massive research bonus, attracts scientist population",
          "cost": 400,
          "maintenance": 4,
          "effects": {
            "research_bonus": 50,
            "scientist_growth": 25
          }
        },
        "ship": {
          "id": "research_vessel",
          "name": "Research Vessel",
          "description": "Unarmed scout that generates research points",
          "size": "small",
          "special": "generates_rp",
          "rp_per_turn": 2
        },
        "technology": {
          "id": "unified_field_theory",
          "name": "Unified Field Theory",
          "description": "Unlocks all remaining tech tree branches",
          "field": "physics",
          "tier": 50,
          "effect": {
            "unlock_all_tech": true
          }
        }
      },
      "ai_behavior": {
        "archetype": "researcher",
        "aggression": 0.2,
        "expansion": 0.4,
        "research_focus": 1.0,
        "production_focus": 0.3,
        "diplomacy_priority": 0.6,
        "natural_allies": ["mice", "hamsters"],
        "natural_enemies": ["guinea_pigs"],
        "treaty_reliability": 0.9,
        "declares_war_first": false
      },
      "leader_names": {
        "male": ["Professor Theorem", "Doctor Hypothesis", "Scholar Paradigm", "Sage Equation"],
        "female": ["Doctor Axiom", "Professor Theory", "Philosopher Quantum", "Savant Logic"]
      },
      "ship_prefix": "RSS"
    },
    {
      "id": "rabbits",
      "name": "Rabbits",
      "moo1_equivalent": "Sakkra",
      "description": "Prolific breeders who reproduce at alarming rates. Population as power; the warren that breeds fastest inherits the galaxy.",
      "homeworld": {
        "name": "Leporis",
        "type": "terran",
        "climate": "temperate",
        "size": "huge",
        "special": "fertile"
      },
      "bonuses": {
        "production": 10,
        "research": -10,
        "food": 25,
        "growth": 100,
        "ground_combat": 5,
        "ship_combat": -10,
        "espionage": -5,
        "diplomacy": 5
      },
      "special_abilities": [
        {
          "id": "exponential_growth",
          "name": "Exponential Growth",
          "description": "Population growth rate doubled",
          "effect": {
            "type": "growth_multiplier",
            "value": 2.0
          }
        },
        {
          "id": "rapid_colonization",
          "name": "Rapid Colonization",
          "description": "Can colonize planets with minimal infrastructure (50% reduced setup time)",
          "effect": {
            "type": "colony_setup_reduction",
            "value": 50
          }
        },
        {
          "id": "overflow_population",
          "name": "Overflow Population",
          "description": "Can transfer excess population to new colonies instantly",
          "effect": {
            "type": "instant_population_transfer",
            "value": true
          }
        },
        {
          "id": "democratic_resilience",
          "name": "Democratic Resilience",
          "description": "Conquered populations rebel 50% less often",
          "effect": {
            "type": "rebellion_reduction",
            "value": 50
          }
        },
        {
          "id": "swarm_tactics",
          "name": "Swarm Tactics",
          "description": "Can field massive fleets of cheap ships (ships cost 15% less)",
          "effect": {
            "type": "ship_cost_reduction",
            "value": 15
          }
        }
      ],
      "starting_technologies": [
        "retro_engines",
        "colony_ship",
        "hyper_v_rockets",
        "standard_fuel_cells"
      ],
      "unique_content": {
        "building": {
          "id": "mega_warren",
          "name": "Mega-Warren",
          "description": "Increases planetary population capacity by 50%",
          "cost": 200,
          "maintenance": 1,
          "effects": {
            "max_population_bonus": 50
          }
        },
        "ship": {
          "id": "colony_swarm",
          "name": "Colony Swarm",
          "description": "Can colonize multiple planets in one trip",
          "size": "huge",
          "special": "multi_colony",
          "colony_count": 3
        },
        "technology": {
          "id": "genetic_vitality",
          "name": "Genetic Vitality",
          "description": "Population growth accelerates even further (+50% growth)",
          "field": "biology",
          "tier": 20,
          "effect": {
            "growth_bonus": 50
          }
        }
      },
      "ai_behavior": {
        "archetype": "expansionist",
        "aggression": 0.2,
        "expansion": 1.0,
        "research_focus": 0.3,
        "production_focus": 0.5,
        "diplomacy_priority": 0.5,
        "natural_allies": ["hamsters"],
        "natural_enemies": [],
        "treaty_reliability": 0.85,
        "declares_war_first": false
      },
      "leader_names": {
        "male": ["Warren", "Clover", "Thicket", "Meadow", "Burrow", "Hazel"],
        "female": ["Blossom", "Garden", "Willow", "Daisy", "Heather", "Fern"]
      },
      "ship_prefix": "RCS"
    },
    {
      "id": "hermit_crabs",
      "name": "Hermit Crabs",
      "moo1_equivalent": "Silicoids",
      "description": "Crystalline-shelled beings immune to environmental hazards. Patient, enduring, and utterly self-sufficient.",
      "homeworld": {
        "name": "Crystalia",
        "type": "radiated",
        "climate": "hostile",
        "size": "large",
        "special": "mineral_ultra_rich"
      },
      "bonuses": {
        "production": 25,
        "research": 0,
        "food": 0,
        "growth": -50,
        "ground_combat": 25,
        "ship_combat": 0,
        "espionage": -30,
        "diplomacy": 0
      },
      "special_abilities": [
        {
          "id": "universal_adaptation",
          "name": "Universal Adaptation",
          "description": "Can colonize ANY planet type without terraforming penalty",
          "effect": {
            "type": "colonization_restriction",
            "value": "none"
          }
        },
        {
          "id": "radiation_immunity",
          "name": "Radiation Immunity",
          "description": "Hostile environments don't affect production",
          "effect": {
            "type": "hostile_production_penalty",
            "value": 0
          }
        },
        {
          "id": "no_food_requirement",
          "name": "No Food Requirement",
          "description": "Don't need agriculture - frees all farming slots for production/research",
          "effect": {
            "type": "food_consumption",
            "value": 0
          }
        },
        {
          "id": "armored_shell",
          "name": "Armored Shell",
          "description": "Natural +50% defense bonus in ground combat",
          "effect": {
            "type": "ground_defense_bonus",
            "value": 50
          }
        },
        {
          "id": "patient",
          "name": "Patient",
          "description": "Immune to morale penalties and unrest",
          "effect": {
            "type": "morale_immunity",
            "value": true
          }
        },
        {
          "id": "mineral_consumption",
          "name": "Mineral Consumption",
          "description": "Can extract resources from asteroids (+2 minerals per asteroid belt)",
          "effect": {
            "type": "asteroid_mining",
            "value": 2
          }
        }
      ],
      "starting_technologies": [
        "nuclear_engines",
        "controlled_environment",
        "duralloy_armor",
        "automated_factory"
      ],
      "unique_content": {
        "building": {
          "id": "crystal_garden",
          "name": "Crystal Garden",
          "description": "Generates resources from planetary minerals",
          "cost": 250,
          "maintenance": 0,
          "effects": {
            "production_bonus": 20,
            "no_maintenance": true
          }
        },
        "ship": {
          "id": "fortress_class",
          "name": "Fortress Class",
          "description": "Slow but heavily armored mobile station",
          "size": "huge",
          "special": "mobile_base",
          "armor_bonus": 100,
          "speed_penalty": -2
        },
        "technology": {
          "id": "crystalline_matrix",
          "name": "Crystalline Matrix",
          "description": "Armor becomes stronger under fire (+10% per hit taken, max +50%)",
          "field": "construction",
          "tier": 30,
          "effect": {
            "reactive_armor": true,
            "max_bonus": 50
          }
        }
      },
      "ai_behavior": {
        "archetype": "defensive",
        "aggression": 0.0,
        "expansion": 0.7,
        "research_focus": 0.5,
        "production_focus": 0.7,
        "diplomacy_priority": 0.5,
        "natural_allies": ["rats", "hamsters"],
        "natural_enemies": [],
        "treaty_reliability": 1.0,
        "declares_war_first": false
      },
      "leader_names": {
        "male": ["Quartz", "Obsidian", "Geode", "Basalt", "Granite", "Feldspar"],
        "female": ["Crystal", "Diamond", "Pearl", "Opal", "Jade", "Amethyst"]
      },
      "ship_prefix": "HCS"
    },
    {
      "id": "guinea_pigs",
      "name": "Guinea Pigs",
      "moo1_equivalent": "Bulrathi",
      "description": "Stocky warriors with unmatched strength and endurance. A warrior's worth is measured in scars and victories.",
      "homeworld": {
        "name": "Cavissia",
        "type": "terran",
        "climate": "temperate",
        "size": "large",
        "special": "high_gravity"
      },
      "bonuses": {
        "production": 10,
        "research": -20,
        "food": 0,
        "growth": 10,
        "ground_combat": 50,
        "ship_combat": 10,
        "espionage": -20,
        "diplomacy": -20
      },
      "special_abilities": [
        {
          "id": "warrior_culture",
          "name": "Warrior Culture",
          "description": "Ground troops deal +50% damage and have +25% morale",
          "effect": {
            "type": "ground_damage_bonus",
            "value": 50,
            "morale_bonus": 25
          }
        },
        {
          "id": "fearless",
          "name": "Fearless",
          "description": "Immune to morale penalties from losing battles",
          "effect": {
            "type": "battle_morale_immunity",
            "value": true
          }
        },
        {
          "id": "heavy_worlders",
          "name": "Heavy Worlders",
          "description": "Can colonize high-gravity worlds at no penalty",
          "effect": {
            "type": "high_gravity_penalty",
            "value": 0
          }
        },
        {
          "id": "relentless",
          "name": "Relentless",
          "description": "Conquered planets integrate 50% faster",
          "effect": {
            "type": "conquest_integration_speed",
            "value": 50
          }
        }
      ],
      "starting_technologies": [
        "hyper_v_rockets",
        "reinforced_hull",
        "hand_lasers",
        "duralloy_armor"
      ],
      "unique_content": {
        "building": {
          "id": "war_academy",
          "name": "War Academy",
          "description": "Doubles ground troop effectiveness",
          "cost": 300,
          "maintenance": 3,
          "effects": {
            "ground_combat_multiplier": 2.0
          }
        },
        "ship": {
          "id": "dreadnought_class",
          "name": "Dreadnought Class",
          "description": "Heavily armored assault ship with troop bays",
          "size": "huge",
          "special": "assault_ship",
          "troop_capacity": 10,
          "armor_bonus": 50
        },
        "technology": {
          "id": "battle_frenzy",
          "name": "Battle Frenzy",
          "description": "Ground troops gain +20% damage per turn of combat",
          "field": "biology",
          "tier": 25,
          "effect": {
            "escalating_damage": 20,
            "per_turn": true
          }
        }
      },
      "ai_behavior": {
        "archetype": "aggressive",
        "aggression": 0.9,
        "expansion": 0.7,
        "research_focus": 0.2,
        "production_focus": 0.7,
        "diplomacy_priority": 0.1,
        "natural_allies": ["budgies", "ferrets"],
        "natural_enemies": ["chameleons", "hamsters"],
        "treaty_reliability": 0.5,
        "declares_war_first": true
      },
      "leader_names": {
        "male": ["Ironhide", "Battleheart", "Grimfang", "Stonefoot", "Thundercharge"],
        "female": ["Steelfur", "Wartooth", "Bloodwhisker", "Rockmane", "Shieldmaiden"]
      },
      "ship_prefix": "GPS"
    },
    {
      "id": "ferrets",
      "name": "Ferrets",
      "moo1_equivalent": "Mrrshan",
      "description": "Sleek hunters with lethal accuracy and predatory instincts. A true hunter needs only one shot.",
      "homeworld": {
        "name": "Mustela",
        "type": "terran",
        "climate": "temperate",
        "size": "medium",
        "special": null
      },
      "bonuses": {
        "production": 0,
        "research": 10,
        "food": 5,
        "growth": 0,
        "ground_combat": 15,
        "ship_combat": 30,
        "espionage": 10,
        "diplomacy": -10
      },
      "special_abilities": [
        {
          "id": "deadly_accuracy",
          "name": "Deadly Accuracy",
          "description": "All weapons gain +4 Attack Levels (equivalent to 4 tiers of targeting computers). Increases hit chance only \u2014 no damage bonus.",
          "effect": {
            "type": "weapon_attack_bonus",
            "attack_level_bonus": 4
          },
          "moo1_note": "Matches Mrrshan +4 Attack Level bonus. MOO1 Mrrshan get no damage bonus, only attack roll bonus."
        },
        {
          "id": "first_strike",
          "name": "First Strike",
          "description": "Ferret ships always fire first in combat round",
          "effect": {
            "type": "combat_initiative",
            "value": "always_first"
          }
        },
        {
          "id": "hunters_instinct",
          "name": "Hunter's Instinct",
          "description": "Can detect cloaked/hidden enemy ships (+50% detection)",
          "effect": {
            "type": "cloak_detection_bonus",
            "value": 50
          }
        },
        {
          "id": "efficient_killers",
          "name": "Efficient Killers",
          "description": "Ships cost 10% less to build",
          "effect": {
            "type": "ship_cost_reduction",
            "value": 10
          }
        }
      ],
      "starting_technologies": [
        "nuclear_engines",
        "laser_cannon",
        "battle_scanner",
        "class_1_shield"
      ],
      "unique_content": {
        "building": {
          "id": "hunters_lodge",
          "name": "Hunter's Lodge",
          "description": "Ships built here start with +10% accuracy",
          "cost": 200,
          "maintenance": 2,
          "effects": {
            "ship_accuracy_bonus": 10
          }
        },
        "ship": {
          "id": "stalker_class",
          "name": "Stalker Class",
          "description": "Fast attack ship with devastating alpha strike",
          "size": "medium",
          "special": "alpha_strike",
          "first_round_damage_bonus": 50,
          "speed_bonus": 2
        },
        "technology": {
          "id": "predictive_targeting",
          "name": "Predictive Targeting",
          "description": "Weapons automatically lead targets",
          "field": "computers",
          "tier": 20,
          "effect": {
            "hit_chance_bonus": 50
          }
        }
      },
      "ai_behavior": {
        "archetype": "aggressive",
        "aggression": 0.7,
        "expansion": 0.5,
        "research_focus": 0.6,
        "production_focus": 0.5,
        "diplomacy_priority": 0.3,
        "natural_allies": ["budgies", "guinea_pigs"],
        "natural_enemies": ["rabbits", "chameleons"],
        "treaty_reliability": 0.7,
        "declares_war_first": true
      },
      "leader_names": {
        "male": ["Fang", "Talon", "Blade", "Strike", "Hunter", "Razor"],
        "female": ["Slash", "Pierce", "Venom", "Shadow", "Claw", "Swift"]
      },
      "ship_prefix": "FHS"
    },
    {
      "id": "budgies",
      "name": "Budgies",
      "moo1_equivalent": "Alkari",
      "description": "Avian acrobats and superior pilots, masters of three-dimensional combat. The sky has no limits, neither should we.",
      "homeworld": {
        "name": "Aeria",
        "type": "terran",
        "climate": "temperate",
        "size": "medium",
        "special": "low_gravity"
      },
      "bonuses": {
        "production": -10,
        "research": 0,
        "food": -10,
        "growth": 0,
        "ground_combat": -20,
        "ship_combat": 50,
        "espionage": -10,
        "diplomacy": 0
      },
      "special_abilities": [
        {
          "id": "superior_pilots",
          "name": "Superior Pilots",
          "description": "All ships gain +3 combat initiative, +3 defense level, and +20% evasion",
          "effect": {
            "type": "ship_combat_bonus",
            "initiative_bonus": 3,
            "defense_level_bonus": 3,
            "evasion_bonus": 20
          },
          "moo1_note": "Matches Alkari +3 Defense AND +3 Initiative bonuses"
        },
        {
          "id": "three_dimensional_tactics",
          "name": "Three-Dimensional Tactics",
          "description": "Enemy missile accuracy reduced by 30%",
          "effect": {
            "type": "enemy_missile_penalty",
            "value": 30
          }
        },
        {
          "id": "dogfighter",
          "name": "Dogfighter",
          "description": "Small ships get additional +15% combat bonus",
          "effect": {
            "type": "small_ship_bonus",
            "value": 15
          }
        },
        {
          "id": "flight_school",
          "name": "Flight School",
          "description": "New ships enter combat with veteran crew status (+1 experience level)",
          "effect": {
            "type": "starting_experience",
            "value": 1
          }
        }
      ],
      "starting_technologies": [
        "ion_drives",
        "battle_computer_1",
        "fusion_bomb",
        "class_1_shield"
      ],
      "unique_content": {
        "building": {
          "id": "aerial_academy",
          "name": "Aerial Academy",
          "description": "Ships built here start at higher experience level (+2)",
          "cost": 250,
          "maintenance": 2,
          "effects": {
            "ship_experience_bonus": 2
          }
        },
        "ship": {
          "id": "interceptor_class",
          "name": "Interceptor Class",
          "description": "Ultra-fast small combat ship",
          "size": "small",
          "special": "interceptor",
          "speed_bonus": 4,
          "evasion_bonus": 30
        },
        "technology": {
          "id": "barrel_roll_thrusters",
          "name": "Barrel Roll Thrusters",
          "description": "Ships can dodge beam weapons (30% chance to evade beams)",
          "field": "propulsion",
          "tier": 25,
          "effect": {
            "beam_evasion": 30
          }
        }
      },
      "ai_behavior": {
        "archetype": "aggressive",
        "aggression": 0.6,
        "expansion": 0.4,
        "research_focus": 0.5,
        "production_focus": 0.4,
        "diplomacy_priority": 0.4,
        "natural_allies": ["ferrets", "guinea_pigs"],
        "natural_enemies": ["chameleons", "ants"],
        "treaty_reliability": 0.85,
        "declares_war_first": true
      },
      "leader_names": {
        "male": ["Skydancer", "Cloudstriker", "Windcaller", "Galeforce", "Stormwing"],
        "female": ["Breezewhisper", "Draftrider", "Updraft", "Skyweaver", "Zephyr"]
      },
      "ship_prefix": "FAS"
    },
    {
      "id": "chameleons",
      "name": "Chameleons",
      "moo1_equivalent": "Darloks",
      "description": "Color-shifting spies whose true allegiance no one can discern. Information is power; trust no one.",
      "moo1_note": "Darloks: +30 flat bonus to spying rolls, +20% Computers research only (good not expert), Unease diplomatic status with most races (second worst), Aggressive Diplomat personality.",
      "homeworld": {
        "name": "Chromatia",
        "type": "jungle",
        "climate": "humid",
        "size": "medium",
        "special": "artifacts"
      },
      "bonuses": {
        "production": -10,
        "research": 20,
        "research_fields": ["computers"],
        "food": 0,
        "growth": -10,
        "ground_combat": 0,
        "ship_combat": -10,
        "espionage": 60,
        "spy_roll_bonus": 30,
        "diplomacy": -15
      },
      "diplomacy_note": "Chameleons start at Unease with most races (second worst relations in MOO1, behind only Guinea Pigs). The -15 diplomacy penalty reflects this hostile baseline.",
      "special_abilities": [
        {
          "id": "master_spies",
          "name": "Master Spies",
          "description": "Espionage missions cost 50% less and succeed 25% more often",
          "effect": {
            "type": "espionage_cost_reduction",
            "value": 50,
            "success_bonus": 25
          }
        },
        {
          "id": "infiltrators",
          "name": "Infiltrators",
          "description": "Can see enemy technology, production, and fleet movements",
          "effect": {
            "type": "intel_visibility",
            "value": "full"
          }
        },
        {
          "id": "false_flags",
          "name": "False Flags",
          "description": "Can frame other races for espionage acts",
          "effect": {
            "type": "frame_ability",
            "value": true
          }
        },
        {
          "id": "sleeper_agents",
          "name": "Sleeper Agents",
          "description": "Sabotage can be delayed by 1-5 turns and is untraceable",
          "effect": {
            "type": "delayed_sabotage",
            "max_delay": 5,
            "untraceable": true
          }
        },
        {
          "id": "technology_theft",
          "name": "Technology Theft",
          "description": "Stealing tech is 50% easier than normal espionage",
          "effect": {
            "type": "tech_theft_bonus",
            "value": 50
          }
        }
      ],
      "starting_technologies": [
        "hyper_x_rockets",
        "ecm_jammer_1",
        "stealth_suit",
        "battle_scanner"
      ],
      "unique_content": {
        "building": {
          "id": "intelligence_network",
          "name": "Intelligence Network",
          "description": "Provides constant intel on all races",
          "cost": 350,
          "maintenance": 4,
          "effects": {
            "global_intel": true,
            "spy_defense_bonus": 25
          }
        },
        "ship": {
          "id": "shadow_class",
          "name": "Shadow Class",
          "description": "Invisible to most sensors",
          "size": "medium",
          "special": "cloaking",
          "detection_penalty": -75
        },
        "technology": {
          "id": "perfect_mimicry",
          "name": "Perfect Mimicry",
          "description": "Can disguise ships as other races' vessels",
          "field": "computers",
          "tier": 30,
          "effect": {
            "ship_disguise": true
          }
        }
      },
      "ai_behavior": {
        "archetype": "sneaky",
        "aggression": 0.3,
        "expansion": 0.4,
        "research_focus": 0.5,
        "production_focus": 0.3,
        "diplomacy_priority": 0.7,
        "natural_allies": [],
        "natural_enemies": [],
        "treaty_reliability": 0.2,
        "declares_war_first": false
      },
      "leader_names": {
        "male": ["Shade", "Whisper", "Phantom", "Eclipse", "Silhouette", "Mirage"],
        "female": ["Shadow", "Umbra", "Specter", "Veil", "Haze", "Mist"]
      },
      "ship_prefix": "CSS"
    }
  ]
}
```

---

## Stat Summary Table

| Race | PROD | RES | FOOD | GROW | GND | SHIP | SPY | DIP | Primary Advantage |
|------|------|-----|------|------|-----|------|-----|-----|-------------------|
| Hamsters | +0% | +0% | +10% | +0% | -10% | +0% | -20% | +30% | Diplomacy, Trade |
| Ants | +50% | -10% | +20% | +25% | +20% | +0% | N/A† | -30% | Production, Hive Mind |
| Mice | +25% | +15% | -50% | -25% | +15% | +15% | +0% | -10% | Automation, Tech |
| Rats | -10% | +75% | +0% | -10% | -20% | +10% | +0% | +10% | Research (ALL fields, +30 spy roll bonus removed) |
| Rabbits | +10% | -10% | +25% | +100% | +5% | -10% | -5% | +5% | Population Growth |
| Hermit Crabs | +25% | +0% | N/A | -50% | +25% | +0% | -30% | +0% | Universal Colonization |
| Guinea Pigs | +10% | -20% | +0% | +10% | +50% | +10% | -20% | -20% | Ground Combat |
| Ferrets | +0% | +10% | +5% | +0% | +15% | +30% | +10% | -10% | Ship Attack |
| Budgies | -10% | +0% | -10% | +0% | -20% | +50% | -10% | +0% | Ship Defense/Evasion |
| Chameleons | -10% | +20% (Computers) | +0% | -10% | +0% | -10% | +60% (+30 flat spy roll) | -15% (Unease) | Espionage |

† Ants are fully isolated from the espionage system in both directions — use the boolean flags `can_conduct_espionage: false` and `immune_to_espionage: true`, **not** a numeric modifier. See the Ants and Espionage edge case below and `diplomacy/espionage.md` Section 2 for details. **MOO1 deviation:** Klackons had no special espionage traits; this is an original design choice.

---

## Edge Cases

### Hermit Crabs and Food
- Hermit Crabs do not consume food and have no food slider
- Their "food" budget is automatically allocated to production/research
- When calculating empire totals, Hermit Crab planets contribute 0 to food but their full population to other categories

### Ants and Espionage (Design Deviation from MOO1)

In MOO1, Klackons had no special espionage traits — they were just xenophobic industrialists and could be spied on normally. The Ants' two-way espionage isolation is a deliberate design choice to reinforce the hive-mind theme.

**Canonical rules (both directions):**
- Ants **cannot conduct** any espionage operations (`can_conduct_espionage: false`). A hive mind cannot infiltrate individuals.
- Ants are **immune to all enemy espionage** (`immune_to_espionage: true`). The hive mind has no individuals to bribe, flip, or subvert — all spy missions auto-fail at resolution.
- Ants cannot assign population to the espionage slider; the UI should hide or disable this option.
- Frame operations targeting Ants automatically fail (nothing to attribute to an individual).
- Ants can still be affected by **overt** diplomatic actions (war declarations, treaties, council votes).

**Implementation note:** Use the boolean flags `can_conduct_espionage` and `immune_to_espionage` exclusively. Do **not** model this as a -100/+100 numeric modifier — that approach is contradictory with the flag system and breaks at formula boundaries.

### Stacking Bonuses
- Racial bonuses stack multiplicatively with technology bonuses
- Example: Rats (+50% research) with Research Lab III (+100%) = 1.5 × 2.0 = 3.0× research output
- Ground combat bonuses stack additively with equipment bonuses

### Negative Bonuses (Penalties)
- Penalties are applied as negative values in the same formula
- Example: Budgies (-20% ground combat) = BaseStrength × 0.80
- Minimum effective value is 10% of base (never reduces to zero)

### Starting Relationship Calculation
```
InitialRelationship = DIPLOMACY_UNFRIENDLY_START + (DiplomacyBonus / 3)
```
- Hamsters start everyone at Neutral (+30/3 = +10, offsets -20)
- Guinea Pigs start everyone at Very Unfriendly (-20/3 = -7, adds to -20)

### Multiple Special Abilities
- All racial abilities are always active
- Abilities that affect the same system stack unless explicitly noted
- AI behavior is determined by the combination of all traits

---

## Examples

### Example 1: Ant Production Calculation
An Ant colony with 50 population and 100 factories:
```
BaseProduction = 50 × 1.0 + 100 × 1.0 = 150 BC
RacialBonus = 1.50 (50% production bonus)
EffectiveProduction = 150 × 1.50 = 225 BC
```

### Example 2: Rat Research Calculation
A Rat empire researching Tier 10 technology (base cost 1000 RP):
```
BaseCost = 1000 RP
GeniusResearchers = 0.50 (50% cost reduction)
EffectiveCost = 1000 × 0.50 = 500 RP

With 20 scientists and +75% research bonus (ALL fields):
BaseRP = 20 × 1.0 = 20 RP/turn
EffectiveRP = 20 × 1.75 = 35 RP/turn
TurnsToComplete = 500 / 35 = 15 turns

Note: The +75% applies equally to Physics, Math, Chemistry, Biology, Computers, and Sociology.
```

### Example 3: Guinea Pig Ground Combat
Guinea Pig troops (base strength 3) attacking a defended planet:
```
BaseStrength = 3
GroundCombatBonus = 1.50 (50%)
WarriorCulture = 1.50 (additional 50% damage)
EffectiveStrength = 3 × 1.50 = 4.5 (rounded to 5)
EffectiveDamage = BaseDamage × 1.50 = 1.5× damage output
```

### Example 4: Budgie Ship Defense
Budgie destroyer in combat:
```
BaseDefense = 1
ShipCombatBonus = +50% (percentage bonus) = +5 defense from racial stat
SuperiorPilots = +3 Defense Levels (maneuverability/dodge, MOO1 Alkari mechanic)
SuperiorPilots = +3 Initiative (fires earlier in combat round)
SuperiorPilots = +20% evasion
Dogfighter (small ship) = +15% combat bonus
ThreeDimensionalTactics = Enemy missiles at -30% accuracy

EffectiveDefense = 1 + 5 + 3 = 9
Initiative bonus = +3
Evasion = 20%
Enemy missile hit chance reduced by 30%
```

---

## Implementation Notes

1. **Load Order**: Race data should be loaded before galaxy generation to determine starting positions and homeworld types.

2. **Validation**: All bonus values should be validated at load time to ensure they fall within expected ranges (-100 to +100 for most).

3. **AI Weighting**: The `ai_behavior` section provides weights for AI decision-making. Values are 0.0 to 1.0 representing priority.

4. **Localization**: The `name` and `description` fields should be keys for localization, not raw strings, in the actual implementation.

5. **Unique Content**: Unique buildings, ships, and technologies should be added to the respective tech trees/build lists only for the owning race.

---

*Document Version: 1.1*
*Last Updated: 2026-04-12*
*Specification: spec-024*

### Changelog
- **v1.1 (2026-04-12):** Corrected Rats (Psilons) research bonus: +50% → +75% ALL fields. Removed Rats espionage bonus (+15 → +0). Added Chameleon flat spy_roll_bonus: +30. Updated Chameleon research to +20% Computers only. Updated Chameleon diplomacy to -15 (Unease). Updated Example 2 to reflect +75% research and faster research speed.
