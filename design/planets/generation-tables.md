# Planet Generation Tables

## Overview

This specification defines the complete probability tables for procedural planet generation in Hamster of Orion. Each star system contains exactly one habitable planet (following MOO1 design). Planet properties are determined by weighted random rolls based on the parent star's color.

This document provides implementation-ready JSON data tables for:
- Planet type (environment) probability by star color
- Planet size distribution
- Mineral richness distribution by star color
- Special feature assignment

**Cross-Reference**: See `design/galaxy/generation-algorithm.md` for the complete galaxy generation algorithm that uses these tables.

---

## 1. Star Color Types

The galaxy contains six star colors, each with different probabilities of generating various planet types:

| Star Color | Frequency | Description | Planet Quality Tendency |
|------------|-----------|-------------|-------------------------|
| Yellow | 25% | Sun-like stars | Best habitability |
| Green | 15% | Young main-sequence | Good habitability |
| Red | 25% | Red dwarfs/giants | Mixed quality |
| Blue | 15% | Hot blue giants | Poor habitability, rich minerals |
| White | 12% | White dwarfs | Poor habitability, rich minerals |
| Purple | 8% | Neutron stars/exotic | Hostile environments, ultra-rich minerals |

```json
{
  "star_colors": {
    "yellow": {
      "id": "yellow",
      "name": "Yellow Star",
      "frequency_weight": 25,
      "description": "Sun-like stars with stable habitable zones",
      "habitability_tier": "excellent",
      "mineral_tier": "average"
    },
    "green": {
      "id": "green",
      "name": "Green Star",
      "frequency_weight": 15,
      "description": "Young main-sequence stars",
      "habitability_tier": "good",
      "mineral_tier": "average"
    },
    "red": {
      "id": "red",
      "name": "Red Star",
      "frequency_weight": 25,
      "description": "Red dwarfs and red giants",
      "habitability_tier": "moderate",
      "mineral_tier": "below_average"
    },
    "blue": {
      "id": "blue",
      "name": "Blue Star",
      "frequency_weight": 15,
      "description": "Hot blue giants with intense radiation",
      "habitability_tier": "poor",
      "mineral_tier": "good"
    },
    "white": {
      "id": "white",
      "name": "White Star",
      "frequency_weight": 12,
      "description": "White dwarfs and aging stars",
      "habitability_tier": "poor",
      "mineral_tier": "good"
    },
    "purple": {
      "id": "purple",
      "name": "Purple Star",
      "frequency_weight": 8,
      "description": "Neutron stars, black holes, exotic objects",
      "habitability_tier": "terrible",
      "mineral_tier": "excellent"
    }
  }
}
```

---

## 2. Environment Types

### 2.1 Environment Definitions

There are 14 environment types organized by habitability:

```json
{
  "environment_types": {
    "hostile": {
      "description": "Require colonization technology. Per-environment growth/capacity modifiers defined in economy/population-growth.md (authoritative).",
      "requires_tech": true,
      "types": [
        {
          "id": "radiated",
          "name": "Radiated",
          "hostility_rank": 1,
          "growth_modifier": 0.10,
          "pop_capacity_modifier": 0.20,
          "tech_required": "controlled_radiated_environment",
          "description": "Intense radiation bombardment. Most hostile environment."
        },
        {
          "id": "toxic",
          "name": "Toxic",
          "hostility_rank": 2,
          "growth_modifier": 0.20,
          "pop_capacity_modifier": 0.30,
          "tech_required": "controlled_toxic_environment",
          "description": "Corrosive atmosphere and lethal chemicals."
        },
        {
          "id": "inferno",
          "name": "Inferno",
          "hostility_rank": 3,
          "growth_modifier": 0.20,
          "pop_capacity_modifier": 0.30,
          "tech_required": "controlled_inferno_environment",
          "description": "Extremely high temperatures, volcanic activity."
        },
        {
          "id": "dead",
          "name": "Dead",
          "hostility_rank": 4,
          "growth_modifier": 0.30,
          "pop_capacity_modifier": 0.40,
          "tech_required": "controlled_dead_environment",
          "description": "No atmosphere or water. Lifeless rock."
        },
        {
          "id": "tundra",
          "name": "Tundra",
          "hostility_rank": 5,
          "growth_modifier": 0.50,
          "pop_capacity_modifier": 0.60,
          "tech_required": "controlled_tundra_environment",
          "description": "Frozen world with extreme cold."
        },
        {
          "id": "barren",
          "name": "Barren",
          "hostility_rank": 6,
          "growth_modifier": 0.40,
          "pop_capacity_modifier": 0.50,
          "tech_required": "controlled_barren_environment",
          "description": "Thin atmosphere, minimal resources."
        }
      ]
    },
    "standard": {
      "description": "Colonizable from game start. Per-environment growth/capacity modifiers defined in economy/population-growth.md (authoritative).",
      "requires_tech": false,
      "types": [
        {
          "id": "minimal",
          "name": "Minimal",
          "hostility_rank": 7,
          "growth_modifier": 0.60,
          "pop_capacity_modifier": 0.70,
          "description": "Oxygen-poor atmosphere, barely supports life."
        },
        {
          "id": "desert",
          "name": "Desert",
          "hostility_rank": 8,
          "growth_modifier": 0.70,
          "pop_capacity_modifier": 0.80,
          "description": "Scarce water, dust storms, extreme heat."
        },
        {
          "id": "steppe",
          "name": "Steppe",
          "hostility_rank": 9,
          "growth_modifier": 0.80,
          "pop_capacity_modifier": 0.90,
          "description": "Rugged terrain, seasonal extremes."
        },
        {
          "id": "arid",
          "name": "Arid",
          "hostility_rank": 10,
          "growth_modifier": 0.80,
          "pop_capacity_modifier": 0.90,
          "description": "Limited water, dry but livable."
        },
        {
          "id": "ocean",
          "name": "Ocean",
          "hostility_rank": 11,
          "growth_modifier": 0.90,
          "pop_capacity_modifier": 1.00,
          "description": "Mostly water with limited land masses."
        },
        {
          "id": "jungle",
          "name": "Jungle",
          "hostility_rank": 12,
          "growth_modifier": 0.90,
          "pop_capacity_modifier": 1.00,
          "description": "Lush vegetation, young world, dense atmosphere."
        },
        {
          "id": "terran",
          "name": "Terran",
          "hostility_rank": 13,
          "growth_modifier": 1.00,
          "pop_capacity_modifier": 1.00,
          "description": "Earth-like conditions. Ideal for colonization."
        }
      ]
    },
    "legendary": {
      "description": "Perfect world. Cannot spawn naturally — created through terraforming only (Gaia Transformation tech).",
      "requires_tech": false,
      "spawns_naturally": false,
      "types": [
        {
          "id": "gaia",
          "name": "Gaia",
          "hostility_rank": 14,
          "growth_modifier": 1.00,
          "pop_capacity_modifier": 1.00,
          "description": "Paradise world. Only created through terraforming."
        }
      ]
    }
  }
}
```

> **Authoritative reference:** All per-environment growth modifiers and capacity modifiers above are sourced from `economy/population-growth.md` §3, which is the canonical source of truth. Do not modify these values here without updating population-growth.md to match.

### 2.2 Environment Summary Table

| Environment | Category | Growth Mult | Pop Capacity Mult | Tech Required |
|-------------|----------|-------------|-------------------|---------------|
| Radiated | Hostile | 0.10× | 0.20× | Controlled Radiated |
| Toxic | Hostile | 0.20× | 0.30× | Controlled Toxic |
| Inferno | Hostile | 0.20× | 0.30× | Controlled Inferno |
| Dead | Hostile | 0.30× | 0.40× | Controlled Dead |
| Tundra | Hostile | 0.50× | 0.60× | Controlled Tundra |
| Barren | Hostile | 0.40× | 0.50× | Controlled Barren |
| Minimal | Standard | 0.60× | 0.70× | None |
| Desert | Standard | 0.70× | 0.80× | None |
| Steppe | Standard | 0.80× | 0.90× | None |
| Arid | Standard | 0.80× | 0.90× | None |
| Ocean | Standard | 0.90× | 1.00× | None |
| Jungle | Standard | 0.90× | 1.00× | None |
| Terran | Standard | 1.00× | 1.00× | None |
| Gaia | Legendary | 1.00× | 1.00× | None (Terraformed only) |

> **Note:** Growth and capacity modifiers are authoritative from `economy/population-growth.md` §3. The former binary model (hostile=0.5×, standard=1.0×) has been replaced with the graduated 14-value scale. Gaia growth modifier is 1.00× (same as Terran) — it was never 2.0× in population-growth.md.

---

## 3. Planet Type Probability by Star Color

### 3.1 Master Probability Table

The following table defines the probability (as percentage) of each environment type spawning at each star color. All values in each column sum to 100.

```json
{
  "environment_probability_by_star": {
    "yellow": {
      "terran": 20,
      "jungle": 15,
      "ocean": 15,
      "arid": 10,
      "steppe": 10,
      "desert": 10,
      "minimal": 8,
      "tundra": 5,
      "barren": 4,
      "dead": 2,
      "inferno": 1,
      "toxic": 0,
      "radiated": 0,
      "gaia": 0
    },
    "green": {
      "terran": 15,
      "jungle": 15,
      "ocean": 12,
      "arid": 12,
      "steppe": 12,
      "desert": 10,
      "minimal": 10,
      "tundra": 6,
      "barren": 4,
      "dead": 2,
      "inferno": 1,
      "toxic": 1,
      "radiated": 0,
      "gaia": 0
    },
    "red": {
      "terran": 5,
      "jungle": 5,
      "ocean": 5,
      "arid": 8,
      "steppe": 8,
      "desert": 12,
      "minimal": 12,
      "tundra": 15,
      "barren": 12,
      "dead": 10,
      "inferno": 4,
      "toxic": 3,
      "radiated": 1,
      "gaia": 0
    },
    "blue": {
      "terran": 5,
      "jungle": 3,
      "ocean": 5,
      "arid": 5,
      "steppe": 5,
      "desert": 8,
      "minimal": 10,
      "tundra": 8,
      "barren": 12,
      "dead": 12,
      "inferno": 10,
      "toxic": 10,
      "radiated": 7,
      "gaia": 0
    },
    "white": {
      "terran": 2,
      "jungle": 2,
      "ocean": 3,
      "arid": 5,
      "steppe": 5,
      "desert": 8,
      "minimal": 8,
      "tundra": 8,
      "barren": 12,
      "dead": 15,
      "inferno": 15,
      "toxic": 10,
      "radiated": 7,
      "gaia": 0
    },
    "purple": {
      "terran": 0,
      "jungle": 0,
      "ocean": 2,
      "arid": 3,
      "steppe": 3,
      "desert": 5,
      "minimal": 7,
      "tundra": 8,
      "barren": 15,
      "dead": 20,
      "inferno": 12,
      "toxic": 12,
      "radiated": 13,
      "gaia": 0
    }
  }
}
```

### 3.2 Cumulative Probability Tables (For Roll Implementation)

For efficient random selection, use cumulative probability ranges (roll 1-100):

```json
{
  "environment_cumulative_ranges": {
    "yellow": {
      "comment": "Roll 1-100, select environment by range",
      "terran": [1, 20],
      "jungle": [21, 35],
      "ocean": [36, 50],
      "arid": [51, 60],
      "steppe": [61, 70],
      "desert": [71, 80],
      "minimal": [81, 88],
      "tundra": [89, 93],
      "barren": [94, 97],
      "dead": [98, 99],
      "inferno": [100, 100]
    },
    "green": {
      "terran": [1, 15],
      "jungle": [16, 30],
      "ocean": [31, 42],
      "arid": [43, 54],
      "steppe": [55, 66],
      "desert": [67, 76],
      "minimal": [77, 86],
      "tundra": [87, 92],
      "barren": [93, 96],
      "dead": [97, 98],
      "inferno": [99, 99],
      "toxic": [100, 100]
    },
    "red": {
      "terran": [1, 5],
      "jungle": [6, 10],
      "ocean": [11, 15],
      "arid": [16, 23],
      "steppe": [24, 31],
      "desert": [32, 43],
      "minimal": [44, 55],
      "tundra": [56, 70],
      "barren": [71, 82],
      "dead": [83, 92],
      "inferno": [93, 96],
      "toxic": [97, 99],
      "radiated": [100, 100]
    },
    "blue": {
      "terran": [1, 5],
      "jungle": [6, 8],
      "ocean": [9, 13],
      "arid": [14, 18],
      "steppe": [19, 23],
      "desert": [24, 31],
      "minimal": [32, 41],
      "tundra": [42, 49],
      "barren": [50, 61],
      "dead": [62, 73],
      "inferno": [74, 83],
      "toxic": [84, 93],
      "radiated": [94, 100]
    },
    "white": {
      "terran": [1, 2],
      "jungle": [3, 4],
      "ocean": [5, 7],
      "arid": [8, 12],
      "steppe": [13, 17],
      "desert": [18, 25],
      "minimal": [26, 33],
      "tundra": [34, 41],
      "barren": [42, 53],
      "dead": [54, 68],
      "inferno": [69, 83],
      "toxic": [84, 93],
      "radiated": [94, 100]
    },
    "purple": {
      "ocean": [1, 2],
      "arid": [3, 5],
      "steppe": [6, 8],
      "desert": [9, 13],
      "minimal": [14, 20],
      "tundra": [21, 28],
      "barren": [29, 43],
      "dead": [44, 63],
      "inferno": [64, 75],
      "toxic": [76, 87],
      "radiated": [88, 100]
    }
  }
}
```

### 3.3 Selection Algorithm

```pseudocode
function SelectEnvironment(star_color):
    table = environment_cumulative_ranges[star_color]
    roll = random_int(1, 100)
    
    for environment, range in table:
        if roll >= range[0] AND roll <= range[1]:
            return environment
    
    // Fallback (should never reach)
    return "barren"
```

### 3.4 Probability Summary by Star Quality

| Star Color | Habitable (Terran/Jungle/Ocean) | Colonizable (Standard) | Hostile |
|------------|--------------------------------|------------------------|---------|
| Yellow | 50% | 88% | 12% |
| Green | 42% | 86% | 14% |
| Red | 15% | 55% | 45% |
| Blue | 13% | 46% | 54% |
| White | 7% | 35% | 65% |
| Purple | 2% | 20% | 80% |

---

## 4. Planet Size Distribution

### 4.1 Size Definitions

Planet size is **independent of star color** and uses a fixed distribution weighted toward medium-sized worlds:

```json
{
  "size_distribution": {
    "tiny": {
      "id": "tiny",
      "name": "Tiny",
      "probability": 15,
      "base_population_range": [10, 20],
      "typical_population": 15,
      "description": "Moon-sized worlds with minimal surface area"
    },
    "small": {
      "id": "small",
      "name": "Small",
      "probability": 25,
      "base_population_range": [25, 40],
      "typical_population": 32,
      "description": "Small planets with limited living space"
    },
    "medium": {
      "id": "medium",
      "name": "Medium",
      "probability": 30,
      "base_population_range": [45, 70],
      "typical_population": 55,
      "description": "Earth-sized worlds with balanced capacity"
    },
    "large": {
      "id": "large",
      "name": "Large",
      "probability": 20,
      "base_population_range": [75, 100],
      "typical_population": 85,
      "description": "Large terrestrial worlds with significant capacity"
    },
    "huge": {
      "id": "huge",
      "name": "Huge",
      "probability": 10,
      "base_population_range": [100, 150],
      "typical_population": 120,
      "description": "Super-terrestrial worlds with vast living space"
    }
  }
}
```

### 4.2 Cumulative Size Ranges

```json
{
  "size_cumulative_ranges": {
    "tiny": [1, 15],
    "small": [16, 40],
    "medium": [41, 70],
    "large": [71, 90],
    "huge": [91, 100]
  }
}
```

### 4.3 Size Selection Algorithm

```pseudocode
function SelectSize():
    roll = random_int(1, 100)
    
    if roll <= 15: 
        return {
            type: "tiny", 
            base_population: random_int(10, 20)
        }
    if roll <= 40: 
        return {
            type: "small", 
            base_population: random_int(25, 40)
        }
    if roll <= 70: 
        return {
            type: "medium", 
            base_population: random_int(45, 70)
        }
    if roll <= 90: 
        return {
            type: "large", 
            base_population: random_int(75, 100)
        }
    return {
        type: "huge", 
        base_population: random_int(100, 150)
    }
```

---

## 5. Mineral Richness Distribution

### 5.1 Richness Levels

```json
{
  "mineral_richness_levels": {
    "ultra_poor": {
      "id": "ultra_poor",
      "name": "Ultra Poor",
      "production_modifier": 0.33,
      "display_name": "Ultra Poor",
      "description": "Extremely scarce minerals. Industrial development severely hampered."
    },
    "poor": {
      "id": "poor",
      "name": "Poor",
      "production_modifier": 0.50,
      "display_name": "Poor",
      "description": "Limited mineral resources. Slower industrial development."
    },
    "normal": {
      "id": "normal",
      "name": "Normal",
      "production_modifier": 1.00,
      "display_name": "",
      "description": "Standard mineral deposits. Baseline production rate."
    },
    "rich": {
      "id": "rich",
      "name": "Rich",
      "production_modifier": 2.00,
      "display_name": "Rich",
      "description": "Abundant heavy metals. Double construction speed."
    },
    "ultra_rich": {
      "id": "ultra_rich",
      "name": "Ultra Rich",
      "production_modifier": 3.00,
      "display_name": "Ultra Rich",
      "description": "Mineral wealth beyond measure. Triple construction speed."
    }
  }
}
```

### 5.2 Richness Probability by Star Color

Star color affects mineral richness probability. Hotter/exotic stars have better mineral prospects:

```json
{
  "mineral_richness_by_star": {
    "yellow": {
      "ultra_poor": 5,
      "poor": 15,
      "normal": 60,
      "rich": 15,
      "ultra_rich": 5
    },
    "green": {
      "ultra_poor": 8,
      "poor": 17,
      "normal": 55,
      "rich": 15,
      "ultra_rich": 5
    },
    "red": {
      "ultra_poor": 12,
      "poor": 23,
      "normal": 50,
      "rich": 12,
      "ultra_rich": 3
    },
    "blue": {
      "ultra_poor": 5,
      "poor": 10,
      "normal": 45,
      "rich": 28,
      "ultra_rich": 12
    },
    "white": {
      "ultra_poor": 10,
      "poor": 15,
      "normal": 40,
      "rich": 25,
      "ultra_rich": 10
    },
    "purple": {
      "ultra_poor": 3,
      "poor": 7,
      "normal": 30,
      "rich": 35,
      "ultra_rich": 25
    }
  }
}
```

### 5.3 Cumulative Richness Ranges

```json
{
  "mineral_cumulative_ranges": {
    "yellow": {
      "ultra_poor": [1, 5],
      "poor": [6, 20],
      "normal": [21, 80],
      "rich": [81, 95],
      "ultra_rich": [96, 100]
    },
    "green": {
      "ultra_poor": [1, 8],
      "poor": [9, 25],
      "normal": [26, 80],
      "rich": [81, 95],
      "ultra_rich": [96, 100]
    },
    "red": {
      "ultra_poor": [1, 12],
      "poor": [13, 35],
      "normal": [36, 85],
      "rich": [86, 97],
      "ultra_rich": [98, 100]
    },
    "blue": {
      "ultra_poor": [1, 5],
      "poor": [6, 15],
      "normal": [16, 60],
      "rich": [61, 88],
      "ultra_rich": [89, 100]
    },
    "white": {
      "ultra_poor": [1, 10],
      "poor": [11, 25],
      "normal": [26, 65],
      "rich": [66, 90],
      "ultra_rich": [91, 100]
    },
    "purple": {
      "ultra_poor": [1, 3],
      "poor": [4, 10],
      "normal": [11, 40],
      "rich": [41, 75],
      "ultra_rich": [76, 100]
    }
  }
}
```

### 5.4 Richness Selection Algorithm

```pseudocode
function SelectMineralRichness(star_color):
    table = mineral_cumulative_ranges[star_color]
    roll = random_int(1, 100)
    
    for richness, range in table:
        if roll >= range[0] AND roll <= range[1]:
            return richness
    
    return "normal"
```

### 5.5 Mineral Richness Summary

| Star Color | Ultra Poor | Poor | Normal | Rich | Ultra Rich | Avg Modifier |
|------------|------------|------|--------|------|------------|--------------|
| Yellow | 5% | 15% | 60% | 15% | 5% | 1.05× |
| Green | 8% | 17% | 55% | 15% | 5% | 0.99× |
| Red | 12% | 23% | 50% | 12% | 3% | 0.87× |
| Blue | 5% | 10% | 45% | 28% | 12% | 1.31× |
| White | 10% | 15% | 40% | 25% | 10% | 1.13× |
| Purple | 3% | 7% | 30% | 35% | 25% | 1.63× |

**Design Insight**: Purple stars offer the best mineral prospects (25% Ultra Rich!) but have terrible habitability. This creates interesting strategic tradeoffs - these systems are valuable for production but require technology investment to colonize.

---

## 6. Special Features

### 6.1 Special Feature Types

```json
{
  "special_features": {
    "orion": {
      "id": "orion",
      "name": "Orion",
      "count_per_galaxy": 1,
      "placement": "galactic_center",
      "research_multiplier": 4.0,
      "guardian": true,
      "discovery_bonus": "multiple_high_tier_techs",
      "forced_environment": "dead",
      "forced_size": "huge",
      "forced_richness": "ultra_rich",
      "description": "Home of the Cosmic Wheel. Guarded by the ancient Guardian."
    },
    "artifacts": {
      "id": "artifacts",
      "name": "Artifacts World",
      "count_per_galaxy": {
        "small": [2, 3],
        "medium": [3, 4],
        "large": [3, 5],
        "huge": [4, 6]
      },
      "placement": "wild_pellet_fields",
      "research_multiplier": 2.0,
      "guardian": false,
      "discovery_bonus": "one_tier_plus_tech",
      "exclude_environments": ["radiated"],
      "description": "Ancient One ruins containing invaluable research materials."
    },
    "homeworld": {
      "id": "homeworld",
      "name": "Homeworld",
      "count_per_galaxy": "player_count",
      "placement": "safe_zones",
      "research_multiplier": 1.0,
      "guardian": false,
      "discovery_bonus": null,
      "forced_environment": "terran",
      "forced_size_options": ["large", "huge"],
      "forced_richness": "normal",
      "starting_population": 40,
      "starting_factories": 30,
      "description": "Home of a spacefaring civilization."
    }
  }
}
```

### 6.2 Artifacts World Placement

Artifacts worlds are distributed in the "Wild Pellet Fields" (middle ring of the galaxy):

```pseudocode
function PlaceArtifactsWorlds(stars, galaxy_size):
    // Determine count based on galaxy size
    count_range = special_features.artifacts.count_per_galaxy[galaxy_size]
    count = random_int(count_range[0], count_range[1])
    
    // Calculate middle ring (30-70% distance from center)
    map_center = {x: width/2, y: height/2}
    candidates = []
    
    for star in stars:
        if star.special != null:
            continue  // Skip Orion, homeworlds
        
        dist_ratio = distance(star, map_center) / max_distance
        if dist_ratio >= 0.30 AND dist_ratio <= 0.70:
            // Exclude worst environments
            if star.planet.environment not in ["radiated"]:
                candidates.append(star)
    
    // Randomly select from candidates
    shuffle(candidates)
    placed = 0
    
    for star in candidates:
        if placed >= count:
            break
        star.special = "artifacts"
        star.planet.special = "artifacts"
        star.planet.research_multiplier = 2.0
        placed++
    
    return placed
```

### 6.3 Special Feature Summary Table

| Feature | Count | Location | Research | Discovery Bonus |
|---------|-------|----------|----------|-----------------|
| Orion | 1 | Center | 4× | Multiple high-tier techs |
| Artifacts | 2-6 | Middle ring | 2× | One tier+1-3 tech |
| Homeworld | Players | Edges | 1× | None |

---

## 7. Nebula Effects on Generation

### 7.1 Nebula Resource Bonus

Planets within nebulae have a 40% chance to receive a mineral richness upgrade:

```json
{
  "nebula_effects": {
    "resource_upgrade_chance": 0.40,
    "upgrade_table": {
      "ultra_poor": "poor",
      "poor": "normal",
      "normal": "rich",
      "rich": "ultra_rich",
      "ultra_rich": "ultra_rich"
    },
    "combat_effects": {
      "warp_speed_cap": 1,
      "shields_disabled": true
    }
  }
}
```

### 7.2 Nebula Bonus Algorithm

```pseudocode
function ApplyNebulaBonus(planet):
    if not planet.in_nebula:
        return planet
    
    if random() < 0.40:
        current = planet.resources
        planet.resources = nebula_effects.upgrade_table[current]
    
    return planet
```

---

## 8. Complete Planet Generation Algorithm

### 8.1 Full Generation Pseudocode

```pseudocode
function GeneratePlanet(star):
    planet = {
        star_id: star.id,
        name: star.name,
        environment: null,
        size: null,
        resources: null,
        special: null,
        research_multiplier: 1.0,
        in_nebula: star.in_nebula
    }
    
    // Step 1: Roll environment based on star color
    planet.environment = SelectEnvironment(star.color)
    
    // Step 2: Roll size (independent of star color)
    planet.size = SelectSize()
    
    // Step 3: Roll mineral richness based on star color
    planet.resources = SelectMineralRichness(star.color)
    
    // Step 4: Apply nebula bonus if applicable
    if planet.in_nebula:
        planet = ApplyNebulaBonus(planet)
    
    // Step 5: Calculate effective population capacity
    planet.max_population = CalculateMaxPopulation(planet)
    
    return planet

function CalculateMaxPopulation(planet):
    // Base population from size
    base_pop = planet.size.base_population
    
    // Apply environment modifier
    env_modifier = GetEnvironmentPopModifier(planet.environment)
    
    // Final calculation (integer)
    return floor(base_pop * env_modifier)
```

### 8.2 Full Generation Example

**Input**: Yellow star in a nebula

**Roll Sequence**:
1. Environment roll: 45 → Ocean (range 36-50)
2. Size roll: 78 → Large (range 71-90), base_pop = 87
3. Richness roll: 93 → Rich (range 81-95)
4. Nebula roll: 0.28 → No upgrade (< 0.40, but roll was 0.28)

**Output**:
```json
{
  "name": "Altair",
  "environment": "ocean",
  "size": {
    "type": "large",
    "base_population": 87
  },
  "resources": "rich",
  "special": null,
  "research_multiplier": 1.0,
  "in_nebula": true,
  "max_population": 78
}
```

**Calculation**: 87 × 0.90 (ocean modifier) = 78.3 → 78

---

## 9. Statistical Distribution Summary

### 9.1 Expected Galaxy Composition (48-Star Medium Galaxy)

| Category | Expected Count | Percentage |
|----------|----------------|------------|
| **Environment Quality** | | |
| Excellent (Terran/Jungle/Ocean) | 12-15 | 25-31% |
| Good (Arid/Steppe) | 8-10 | 17-21% |
| Marginal (Desert/Minimal) | 10-12 | 21-25% |
| Hostile (Requires Tech) | 12-18 | 25-38% |
| **Size Distribution** | | |
| Tiny | 7 | 15% |
| Small | 12 | 25% |
| Medium | 14 | 30% |
| Large | 10 | 20% |
| Huge | 5 | 10% |
| **Mineral Richness** | | |
| Ultra Poor | 3-4 | 6-8% |
| Poor | 7-8 | 15-17% |
| Normal | 24-26 | 50-54% |
| Rich | 8-10 | 17-21% |
| Ultra Rich | 3-4 | 6-8% |
| **Special Features** | | |
| Orion | 1 | 2% |
| Artifacts | 3-4 | 6-8% |
| Homeworlds | 4-6 | 8-13% |

### 9.2 Planet Quality Scoring

For AI and balance calculations, a planet quality score (0-100):

```json
{
  "planet_quality_formula": {
    "description": "Quality = Environment Score + Size Score + Resource Score",
    "environment_scores": {
      "gaia": 40,
      "terran": 35,
      "jungle": 32,
      "ocean": 30,
      "arid": 25,
      "steppe": 25,
      "desert": 20,
      "minimal": 15,
      "tundra": 10,
      "barren": 8,
      "dead": 5,
      "inferno": 3,
      "toxic": 2,
      "radiated": 0
    },
    "size_scores": {
      "tiny": 5,
      "small": 12,
      "medium": 20,
      "large": 26,
      "huge": 30
    },
    "resource_scores": {
      "ultra_poor": 0,
      "poor": 8,
      "normal": 15,
      "rich": 25,
      "ultra_rich": 30
    }
  }
}
```

**Quality Examples**:
- Terran Huge Ultra Rich: 35 + 30 + 30 = **95** (Exceptional)
- Ocean Large Rich: 30 + 26 + 25 = **81** (Excellent)
- Desert Medium Normal: 20 + 20 + 15 = **55** (Average)
- Barren Tiny Poor: 8 + 5 + 8 = **21** (Poor)
- Radiated Tiny Ultra Poor: 0 + 5 + 0 = **5** (Terrible)

---

## 10. Edge Cases

### 10.1 No Valid Environment Rolls

**Problem**: Statistical edge case where all planets roll hostile in a sector.

**Solution**: Game allows this - it's part of the challenge. Players must research colonization tech.

### 10.2 Forced Overrides

The following systems override normal generation:

| System | Environment | Size | Resources |
|--------|-------------|------|-----------|
| Orion | Dead | Huge (150 pop) | Ultra Rich |
| Homeworld | Terran | Large or Huge | Normal |

### 10.3 Gaia Worlds

Gaia environments **never spawn naturally**. They can only be created through:
- Soil Enrichment (Planetology tech) upgrading Terran planets
- Gaia Transformation (late-game tech)

### 10.4 Hermit Crab Special Case

The Hermit Crab race ignores hostile environment penalties. Their generation tables remain the same, but they can colonize any environment without tech requirements.

---

## 11. Implementation Checklist

- [ ] Implement star color selection (weighted random)
- [ ] Implement environment selection by star color
- [ ] Implement size selection (universal distribution)
- [ ] Implement mineral richness selection by star color
- [ ] Implement nebula bonus application
- [ ] Implement special feature placement (Orion, Artifacts, Homeworlds)
- [ ] Implement planet quality scoring
- [ ] Implement max population calculation
- [ ] Add unit tests for statistical distribution validation

---

## 12. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-22 | Initial specification with complete JSON tables |
