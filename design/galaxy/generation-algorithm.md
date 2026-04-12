# Galaxy Generation Algorithm

## Overview

This specification documents the complete procedural galaxy generation algorithm for Hamster of Orion. The algorithm creates a balanced, playable galaxy map with proper star placement, planet assignment, resource distribution, and fair starting positions for all players.

The generation follows Master of Orion 1 conventions: each star system contains exactly one habitable planet, and the galaxy is a 2D rectangular coordinate space.

---

## 1. Galaxy Configuration

### 1.1 Galaxy Size Options

| Size | Stars | Map Dimensions | Recommended Players | Generation Time |
|------|-------|----------------|---------------------|-----------------|
| Small | 24 | 500 × 400 | 2-4 | < 100ms |
| Medium | 48 | 700 × 560 | 4-6 | < 200ms |
| Large | 70 | 850 × 680 | 6-8 | < 300ms |
| Huge | 108 | 1000 × 800 | 8-10 | < 500ms |

### 1.2 Configuration Parameters

```json
{
  "galaxy_config": {
    "small": {
      "star_count": 24,
      "width": 500,
      "height": 400,
      "min_star_distance": 35,
      "min_homeworld_distance": 150,
      "nebula_count": [1, 2],
      "artifacts_count": [2, 3],
      "cluster_count": [2, 4]
    },
    "medium": {
      "star_count": 48,
      "width": 700,
      "height": 560,
      "min_star_distance": 35,
      "min_homeworld_distance": 175,
      "nebula_count": [2, 3],
      "artifacts_count": [3, 4],
      "cluster_count": [4, 6]
    },
    "large": {
      "star_count": 70,
      "width": 850,
      "height": 680,
      "min_star_distance": 35,
      "min_homeworld_distance": 200,
      "nebula_count": [2, 4],
      "artifacts_count": [3, 5],
      "cluster_count": [5, 8]
    },
    "huge": {
      "star_count": 108,
      "width": 1000,
      "height": 800,
      "min_star_distance": 35,
      "min_homeworld_distance": 225,
      "nebula_count": [3, 5],
      "artifacts_count": [4, 6],
      "cluster_count": [7, 12]
    }
  }
}
```

---

## 2. Star Placement Algorithm

### 2.1 Overview

Stars are placed using a clustered Poisson disk sampling approach. This creates natural-looking star distributions with clusters of nearby stars while maintaining minimum distances for gameplay balance.

### 2.2 Core Formula: Minimum Distance

```
MinDistance = BaseMinDistance × (1 - ClusterFactor × 0.3)
```

Where:
- `BaseMinDistance` = 35 parsecs (prevents stars from overlapping)
- `ClusterFactor` = 0.0 to 1.0 (how clustered the generation should be)
- Minimum distance within clusters = ~25 parsecs
- Minimum distance between clusters = ~50 parsecs

### 2.3 Star Placement Algorithm

```pseudocode
function GenerateStarPositions(config):
    stars = []
    attempts = 0
    max_attempts = config.star_count * 100
    
    // Phase 1: Generate cluster centers
    cluster_centers = GenerateClusterCenters(config)
    
    // Phase 2: Place stars with clustering bias
    while stars.length < config.star_count AND attempts < max_attempts:
        attempts++
        
        // 70% chance to place near a cluster center
        if random() < 0.70 AND cluster_centers.length > 0:
            center = random_choice(cluster_centers)
            position = GenerateClusteredPosition(center, config)
        else:
            // 30% chance for random field star
            position = GenerateRandomPosition(config)
        
        // Validate minimum distance from all existing stars
        if IsValidPosition(position, stars, config.min_star_distance):
            stars.append(position)
    
    // Phase 3: Fill gaps if needed (fallback)
    if stars.length < config.star_count:
        FillRemainingStars(stars, config)
    
    return stars

function GenerateClusterCenters(config):
    centers = []
    cluster_count = random_int(config.cluster_count[0], config.cluster_count[1])
    margin = 100  // Keep clusters away from edges
    
    for i in range(cluster_count):
        attempts = 0
        while attempts < 50:
            x = random_int(margin, config.width - margin)
            y = random_int(margin, config.height - margin)
            
            // Ensure clusters aren't too close together
            if IsValidPosition({x, y}, centers, 120):
                centers.append({x, y, size: random_int(3, 8)})
                break
            attempts++
    
    return centers

function GenerateClusteredPosition(center, config):
    // Gaussian distribution around cluster center
    angle = random() * 2 * PI
    distance = gaussian_random(mean=0, stddev=center.size * 15)
    distance = abs(distance)  // Only positive distances
    distance = min(distance, 100)  // Cap cluster radius
    
    x = center.x + cos(angle) * distance
    y = center.y + sin(angle) * distance
    
    // Clamp to map bounds
    x = clamp(x, 20, config.width - 20)
    y = clamp(y, 20, config.height - 20)
    
    return {x, y}

function GenerateRandomPosition(config):
    margin = 20
    return {
        x: random_int(margin, config.width - margin),
        y: random_int(margin, config.height - margin)
    }

function IsValidPosition(pos, existing, min_distance):
    for star in existing:
        dist = sqrt((pos.x - star.x)^2 + (pos.y - star.y)^2)
        if dist < min_distance:
            return false
    return true
```

### 2.4 Star Color Distribution

Star colors are assigned based on weighted random selection:

```json
{
  "star_color_weights": {
    "yellow": 25,
    "green": 15,
    "red": 25,
    "blue": 15,
    "white": 12,
    "purple": 8
  }
}
```

**Total Weight**: 100

**Selection Algorithm**:
```pseudocode
function AssignStarColor():
    roll = random_int(1, 100)
    
    if roll <= 25: return "yellow"      // 1-25
    if roll <= 40: return "green"       // 26-40
    if roll <= 65: return "red"         // 41-65
    if roll <= 80: return "blue"        // 66-80
    if roll <= 92: return "white"       // 81-92
    return "purple"                      // 93-100
```

### 2.5 Star Naming

Stars are assigned names from a predefined pool of classical star names:

```json
{
  "star_names": [
    "Altair", "Antares", "Arcturus", "Betelgeuse", "Capella",
    "Deneb", "Fomalhaut", "Pollux", "Procyon", "Regulus",
    "Rigel", "Sirius", "Spica", "Vega", "Aldebaran",
    "Canopus", "Castor", "Centauri", "Cygni", "Draconis",
    "Eridani", "Hydrae", "Leonis", "Lyrae", "Ophiuchi",
    "Orionis", "Pegasi", "Phoenicis", "Sagittarii", "Scorpii",
    "Serpentis", "Tauri", "Ursae", "Velorum", "Virginis",
    "Andromedae", "Aquarii", "Arietis", "Bootis", "Cancri",
    "Canis", "Carinae", "Cassiopeiae", "Cephei", "Ceti",
    "Columbae", "Coronae", "Corvi", "Crateris", "Crucis",
    "Delphini", "Doradus", "Equulei", "Fornacis", "Geminorum",
    "Gruis", "Herculis", "Horologii", "Hydri", "Indi",
    "Lacertae", "Leporis", "Librae", "Lupi", "Lyncis",
    "Mensae", "Monocerotis", "Muscae", "Normae", "Octantis",
    "Pavonis", "Persei", "Pictoris", "Piscium", "Puppis",
    "Pyxidis", "Reticuli", "Sagittae", "Sculptoris", "Scuti",
    "Sextantis", "Trianguli", "Tucanae", "Volantis", "Vulpeculae",
    "Naos", "Thuban", "Mira", "Achernar", "Hadar",
    "Acrux", "Mimosa", "Alioth", "Alkaid", "Dubhe",
    "Merak", "Phecda", "Megrez", "Mizar", "Alcor",
    "Polaris", "Kochab", "Pherkad", "Rastaban", "Eltanin",
    "Grumium", "Kuma", "Thuban", "Giausar", "Tyl"
  ]
}
```

Names are shuffled at generation start and assigned sequentially. If more stars than names, append Roman numerals (e.g., "Altair II").

---

## 3. Cluster Formation

### 3.1 Cluster Definition

A cluster is a group of 3-8 nearby stars that share strategic importance. Clusters create natural chokepoints and defensible regions.

### 3.2 Cluster Detection Algorithm

After star placement, clusters are formally identified:

```pseudocode
function IdentifyClusters(stars, cluster_radius=60):
    clusters = []
    assigned = set()
    
    for star in stars:
        if star.id in assigned:
            continue
        
        // Find all stars within cluster radius
        nearby = []
        for other in stars:
            if other.id != star.id:
                dist = distance(star, other)
                if dist <= cluster_radius:
                    nearby.append(other)
        
        // Form cluster if 3+ stars nearby
        if nearby.length >= 2:
            cluster = {
                id: clusters.length,
                center: star,
                members: [star] + nearby,
                region: DetermineRegion(star)
            }
            clusters.append(cluster)
            
            for member in cluster.members:
                assigned.add(member.id)
    
    return clusters
```

### 3.3 Region Assignment

Stars are assigned to lore-based regions (see `space-regions.md`):

```pseudocode
function DetermineRegion(star, map_center, map_size):
    // Calculate distance from center as percentage
    dx = abs(star.x - map_center.x) / (map_size.width / 2)
    dy = abs(star.y - map_center.y) / (map_size.height / 2)
    dist_from_center = sqrt(dx^2 + dy^2)
    
    if dist_from_center < 0.15:
        return "omega_sector"       // 5% - Orion's domain
    if dist_from_center < 0.40:
        return "wild_pellet_fields" // 50% - Contested space
    if dist_from_center > 0.75:
        return "safe_zones"         // 30% - Starting areas
    
    // Remaining 15% - check for nebula assignment
    return "wild_pellet_fields"
```

---

## 4. Planet Assignment

### 4.1 Core Rule

Each star system contains exactly **one habitable planet**. This is faithful to MOO1 design.

### 4.2 Planet Generation Process

```pseudocode
function GeneratePlanet(star):
    planet = {
        star_id: star.id,
        name: star.name,
        environment: RollEnvironment(star.color),
        size: RollSize(star.color),
        resources: RollResources(star.color),
        special: null,
        in_nebula: star.in_nebula
    }
    
    // Apply nebula bonus
    if planet.in_nebula:
        planet.resources = ApplyNebulaBonus(planet.resources)
    
    return planet
```

### 4.3 Environment by Star Color

Environment type probabilities depend on star color:

```json
{
  "environment_tables": {
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

**Note**: Gaia environments are only created through the Soil Enrichment II technology transformation. They never appear naturally.

### 4.4 Size Distribution

Planet size probabilities are independent of star color but weighted toward medium:

```json
{
  "size_distribution": {
    "tiny": 15,
    "small": 25,
    "medium": 30,
    "large": 20,
    "huge": 10
  }
}
```

**Size to Base Population Capacity** (MOO1 canonical fixed values):

| Size | Base Population |
|------|-----------------|
| Tiny | 20 |
| Small | 40 |
| Medium | 60 |
| Large | 80 |
| Huge | 100 |

```pseudocode
function RollSize():
    roll = random_int(1, 100)
    
    if roll <= 15: return {type: "tiny", base_pop: 20}
    if roll <= 40: return {type: "small", base_pop: 40}
    if roll <= 70: return {type: "medium", base_pop: 60}
    if roll <= 90: return {type: "large", base_pop: 80}
    return {type: "huge", base_pop: 100}
```

### 4.5 Environment Modifiers

Environment affects maximum population through multipliers:

```json
{
  "environment_modifiers": {
    "gaia": {"growth_mult": 2.0, "pop_mult": 1.0, "hostile": false},
    "terran": {"growth_mult": 1.0, "pop_mult": 1.0, "hostile": false},
    "jungle": {"growth_mult": 1.0, "pop_mult": 0.9, "hostile": false},
    "ocean": {"growth_mult": 1.0, "pop_mult": 0.9, "hostile": false},
    "arid": {"growth_mult": 1.0, "pop_mult": 0.8, "hostile": false},
    "steppe": {"growth_mult": 1.0, "pop_mult": 0.8, "hostile": false},
    "desert": {"growth_mult": 1.0, "pop_mult": 0.7, "hostile": false},
    "minimal": {"growth_mult": 1.0, "pop_mult": 0.6, "hostile": false},
    "tundra": {"growth_mult": 0.5, "pop_mult": 0.5, "hostile": true},
    "barren": {"growth_mult": 0.5, "pop_mult": 0.5, "hostile": true},
    "dead": {"growth_mult": 0.5, "pop_mult": 0.4, "hostile": true},
    "inferno": {"growth_mult": 0.5, "pop_mult": 0.4, "hostile": true},
    "toxic": {"growth_mult": 0.5, "pop_mult": 0.3, "hostile": true},
    "radiated": {"growth_mult": 0.5, "pop_mult": 0.3, "hostile": true}
  }
}
```

**Maximum Population Formula**:
```
MaxPop = floor(BasePop × EnvironmentModifier × TerraformingBonus × SoilEnrichment)
```

---

## 5. Resource Distribution

### 5.1 Resource Levels

Each planet has a mineral richness level affecting production:

| Level | Production Modifier | Description |
|-------|---------------------|-------------|
| Ultra Poor | 0.33× | Extremely scarce minerals |
| Poor | 0.50× | Limited resources |
| Normal | 1.00× | Standard deposits |
| Rich | 2.00× | Abundant heavy metals |
| Ultra Rich | 3.00× | Mineral wealth beyond measure |

### 5.2 Resource Distribution by Star Color

```json
{
  "resource_tables": {
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

**Key Insight**: Purple stars (neutron stars/black holes) have the highest chance of Ultra Rich planets (25%) but the worst habitability. Blue stars offer a good balance of Rich planets and reasonable habitability.

### 5.3 Nebula Resource Bonus

Planets within nebulae receive a resource upgrade chance:

```pseudocode
function ApplyNebulaBonus(resource_level):
    // 40% chance to upgrade resource level in nebula
    if random() < 0.40:
        if resource_level == "ultra_poor": return "poor"
        if resource_level == "poor": return "normal"
        if resource_level == "normal": return "rich"
        if resource_level == "rich": return "ultra_rich"
    
    return resource_level
```

---

## 6. Special System Placement

### 6.1 Orion System

Orion is the most important system in the galaxy:

```pseudocode
function PlaceOrion(stars, map_center):
    // Find star closest to exact center
    best_star = null
    best_distance = infinity
    
    for star in stars:
        dist = distance(star, map_center)
        if dist < best_distance:
            best_distance = dist
            best_star = star
    
    // Convert to Orion
    best_star.name = "Orion"
    best_star.color = "white"  // Orion is always white
    best_star.special = "orion"
    best_star.planet = {
        environment: "dead",       // Hostile but irrelevant
        size: {type: "huge", base_pop: 100},
        resources: "ultra_rich",
        special: "orion",
        research_multiplier: 4.0,  // 4× research
        guardian: true             // Protected by Guardian ship
    }
    
    return best_star
```

**Orion Properties**:
- Research output: **4× normal**
- First colonizer receives: **Multiple high-level technologies** (one random from each field at tier 10+)
- Guardian fleet: **1 Guardian ship** (see `ships/combat-algorithm.md` for Guardian stats)
- Environment: Irrelevant (tech bonus overrides)
- Cannot be attacked until Guardian is destroyed

### 6.2 Artifacts Worlds

Artifacts worlds contain Ancient One ruins providing research bonuses:

```pseudocode
function PlaceArtifactsWorlds(stars, config, orion_star):
    count = random_int(config.artifacts_count[0], config.artifacts_count[1])
    placed = 0
    candidates = []
    
    // Collect eligible stars (not Orion, not homeworlds)
    for star in stars:
        if star.special != "orion" AND not star.is_homeworld:
            candidates.append(star)
    
    // Sort by distance from center (middle ring preferred)
    candidates.sort(by: distance_from_center, order: ascending)
    middle_start = floor(candidates.length * 0.3)
    middle_end = floor(candidates.length * 0.7)
    
    // Prefer Wild Pellet Fields (middle ring)
    middle_candidates = candidates[middle_start:middle_end]
    shuffle(middle_candidates)
    
    for star in middle_candidates:
        if placed >= count:
            break
        if star.planet.environment != "radiated":  // Skip worst environments
            star.special = "artifacts"
            star.planet.special = "artifacts"
            star.planet.research_multiplier = 2.0  // 2× research
            placed++
    
    return placed
```

**Artifacts World Properties**:
- Research output: **2× normal**
- First scout bonus: **One random technology** at current tier + 1-3

### 6.3 Special Feature Summary

```json
{
  "special_systems": {
    "orion": {
      "count": 1,
      "location": "galactic_center",
      "research_multiplier": 4.0,
      "first_scout_bonus": "multiple_high_tier_techs",
      "guardian": true
    },
    "artifacts": {
      "count": [2, 6],
      "location": "wild_pellet_fields",
      "research_multiplier": 2.0,
      "first_scout_bonus": "one_tier_plus_tech"
    }
  }
}
```

---

## 7. Nebula Placement

### 7.1 Nebula Properties

Nebulae are regions of space with special properties:
- Ships reduced to **Warp 1** speed
- Shields **do not function** in combat
- Increased chance of **mineral-rich planets**
- Visual: Large purple cloud overlay

### 7.2 Nebula Generation Algorithm

```pseudocode
function GenerateNebulae(stars, config):
    nebula_count = random_int(config.nebula_count[0], config.nebula_count[1])
    nebulae = []
    
    for i in range(nebula_count):
        // Place nebula center in middle-outer ring (avoid center and edges)
        center = {
            x: random_int(config.width * 0.2, config.width * 0.8),
            y: random_int(config.height * 0.2, config.height * 0.8)
        }
        
        // Nebula size varies
        radius = random_int(60, 120)
        
        nebula = {
            id: i,
            center: center,
            radius: radius,
            stars: []
        }
        
        // Assign stars within nebula
        for star in stars:
            dist = distance(star, center)
            if dist <= radius:
                star.in_nebula = true
                star.nebula_id = nebula.id
                nebula.stars.append(star)
        
        // Require at least 2 stars in nebula
        if nebula.stars.length >= 2:
            nebulae.append(nebula)
    
    return nebulae
```

### 7.3 Nebula Overlap Prevention

```pseudocode
function ValidateNebulaPlacement(new_nebula, existing_nebulae):
    for existing in existing_nebulae:
        dist = distance(new_nebula.center, existing.center)
        min_dist = new_nebula.radius + existing.radius + 30
        if dist < min_dist:
            return false  // Too close to existing nebula
    return true
```

---

## 8. Homeworld Placement Algorithm

### 8.1 Requirements

Homeworld placement must ensure:
1. **Balanced starts**: All players have similar expansion options
2. **Minimum distance**: Homeworlds are spread apart
3. **Quality guarantee**: All homeworlds are Terran, Large or Huge
4. **Reachable neighbors**: At least 2-3 stars within starting range (3 parsecs)

### 8.2 Player Count Validation

| Galaxy Size | Min Players | Max Players | Recommended |
|-------------|-------------|-------------|-------------|
| Small (24) | 2 | 4 | 3 |
| Medium (48) | 3 | 6 | 5 |
| Large (70) | 4 | 8 | 6 |
| Huge (108) | 5 | 10 | 8 |

### 8.3 Homeworld Placement Algorithm

```pseudocode
function PlaceHomeworlds(stars, player_count, config):
    // Phase 1: Calculate ideal distribution
    ideal_positions = CalculateIdealPositions(player_count, config)
    
    // Phase 2: Find best star near each ideal position
    homeworlds = []
    used_stars = set()
    
    for ideal in ideal_positions:
        candidates = FindCandidateStars(stars, ideal, used_stars, config)
        
        if candidates.length == 0:
            throw Error("Cannot place homeworld - regenerate galaxy")
        
        best = SelectBestHomeworld(candidates, homeworlds, config)
        
        // Convert to homeworld
        ConfigureAsHomeworld(best)
        homeworlds.append(best)
        used_stars.add(best.id)
        
        // Mark nearby stars as unavailable for other homeworlds
        for star in stars:
            if distance(star, best) < config.min_homeworld_distance * 0.5:
                used_stars.add(star.id)
    
    // Phase 3: Validate spacing
    if not ValidateHomeworldSpacing(homeworlds, config):
        throw Error("Homeworld spacing invalid - regenerate galaxy")
    
    return homeworlds

function CalculateIdealPositions(player_count, config):
    positions = []
    margin = 80  // Stay away from edges
    
    // Distribute around edges of map (Safe Zones)
    if player_count <= 4:
        // Corners
        positions = [
            {x: margin, y: margin},
            {x: config.width - margin, y: margin},
            {x: margin, y: config.height - margin},
            {x: config.width - margin, y: config.height - margin}
        ]
    else:
        // Distribute evenly around perimeter
        perimeter = 2 * (config.width + config.height)
        spacing = perimeter / player_count
        
        for i in range(player_count):
            pos = GetPerimeterPosition(i * spacing, config, margin)
            positions.append(pos)
    
    return positions[0:player_count]

function FindCandidateStars(stars, ideal, used, config):
    candidates = []
    search_radius = 100
    
    for star in stars:
        if star.id in used:
            continue
        if star.special == "orion":
            continue
        
        dist = distance(star, ideal)
        if dist <= search_radius:
            // Check for nearby expansion options
            neighbors = CountReachableNeighbors(star, stars, 45)  // 3 parsecs × 15
            if neighbors >= 2:
                candidates.append({
                    star: star,
                    dist_from_ideal: dist,
                    neighbor_count: neighbors
                })
    
    // Sort by proximity to ideal position
    candidates.sort(by: dist_from_ideal)
    
    return candidates

function ConfigureAsHomeworld(star):
    star.is_homeworld = true
    star.special = "homeworld"
    
    // Force homeworld quality
    star.planet.environment = "terran"
    star.planet.size = {
        type: random_choice(["large", "huge"]),
        base_pop: random_choice([80, 100])  // large=80 or huge=100 (MOO1 fixed values)
    }
    star.planet.resources = "normal"  // Fair start - no rich homeworlds
    star.planet.special = "homeworld"
    
    // Starting development
    star.planet.starting_population = 40
    star.planet.starting_factories = 30
```

### 8.4 Minimum Homeworld Distance

The minimum distance between any two homeworlds scales with galaxy size:

```
MinHomeworldDistance = GalaxyDiagonal × 0.25
```

Where:
- `GalaxyDiagonal = sqrt(width^2 + height^2)`

| Galaxy Size | Diagonal | Min Homeworld Distance |
|-------------|----------|------------------------|
| Small | 640 | 160 |
| Medium | 896 | 224 |
| Large | 1088 | 272 |
| Huge | 1280 | 320 |

### 8.5 Neighbor Quality Check

Homeworlds should have balanced expansion opportunities:

```pseudocode
function ValidateHomeworldNeighbors(homeworld, stars, max_distance=45):
    neighbors = []
    
    for star in stars:
        if star.id == homeworld.id:
            continue
        dist = distance(star, homeworld)
        if dist <= max_distance:
            neighbors.append({
                star: star,
                distance: dist,
                quality: CalculatePlanetQuality(star.planet)
            })
    
    // Must have at least 2 neighbors
    if neighbors.length < 2:
        return {valid: false, reason: "insufficient_neighbors"}
    
    // Calculate average quality
    avg_quality = sum(n.quality for n in neighbors) / neighbors.length
    
    // Warn if below threshold (but don't fail)
    if avg_quality < 30:
        return {valid: true, warning: "low_quality_neighbors"}
    
    return {valid: true}

function CalculatePlanetQuality(planet):
    // 0-100 scale
    score = 0
    
    // Environment score (0-40)
    env_scores = {
        "gaia": 40, "terran": 35, "jungle": 32, "ocean": 30,
        "arid": 25, "steppe": 25, "desert": 20, "minimal": 15,
        "tundra": 10, "barren": 8, "dead": 5,
        "inferno": 3, "toxic": 2, "radiated": 0
    }
    score += env_scores[planet.environment]
    
    // Size score (0-30)
    size_scores = {"tiny": 5, "small": 12, "medium": 20, "large": 26, "huge": 30}
    score += size_scores[planet.size.type]
    
    // Resource score (0-30)
    res_scores = {"ultra_poor": 0, "poor": 8, "normal": 15, "rich": 25, "ultra_rich": 30}
    score += res_scores[planet.resources]
    
    return score
```

---

## 9. Complete Generation Algorithm

### 9.1 Main Generation Function

```pseudocode
function GenerateGalaxy(size, player_count, seed=null):
    // Initialize random seed
    if seed != null:
        set_random_seed(seed)
    else:
        seed = generate_random_seed()
    
    config = galaxy_config[size]
    
    // Validate player count
    if player_count < 2 OR player_count > 10:
        throw Error("Invalid player count")
    if player_count > config.star_count / 6:
        throw Error("Too many players for galaxy size")
    
    galaxy = {
        seed: seed,
        size: size,
        config: config,
        stars: [],
        nebulae: [],
        clusters: [],
        homeworlds: [],
        orion: null,
        artifacts: []
    }
    
    // Step 1: Generate star positions
    galaxy.stars = GenerateStarPositions(config)
    
    // Step 2: Assign star colors
    for star in galaxy.stars:
        star.color = AssignStarColor()
        star.name = AssignStarName()
    
    // Step 3: Generate nebulae
    galaxy.nebulae = GenerateNebulae(galaxy.stars, config)
    
    // Step 4: Generate planets for each star
    for star in galaxy.stars:
        star.planet = GeneratePlanet(star)
    
    // Step 5: Place Orion (must be before homeworlds)
    map_center = {x: config.width / 2, y: config.height / 2}
    galaxy.orion = PlaceOrion(galaxy.stars, map_center)
    
    // Step 6: Place homeworlds
    galaxy.homeworlds = PlaceHomeworlds(galaxy.stars, player_count, config)
    
    // Step 7: Place Artifacts worlds
    PlaceArtifactsWorlds(galaxy.stars, config, galaxy.orion)
    
    // Step 8: Identify clusters
    galaxy.clusters = IdentifyClusters(galaxy.stars)
    
    // Step 9: Assign regions
    AssignRegions(galaxy.stars, map_center, config)
    
    // Step 10: Validate galaxy
    validation = ValidateGalaxy(galaxy)
    if not validation.valid:
        throw Error("Galaxy validation failed: " + validation.reason)
    
    return galaxy
```

### 9.2 Validation Checks

```pseudocode
function ValidateGalaxy(galaxy):
    errors = []
    
    // Check star count
    if galaxy.stars.length != galaxy.config.star_count:
        errors.append("Incorrect star count")
    
    // Check all stars have planets
    for star in galaxy.stars:
        if star.planet == null:
            errors.append("Star " + star.name + " has no planet")
    
    // Check Orion exists and is centered
    if galaxy.orion == null:
        errors.append("Orion not placed")
    
    // Check homeworld count
    expected_homeworlds = galaxy.player_count
    if galaxy.homeworlds.length != expected_homeworlds:
        errors.append("Incorrect homeworld count")
    
    // Check homeworld spacing
    for i in range(galaxy.homeworlds.length):
        for j in range(i + 1, galaxy.homeworlds.length):
            dist = distance(galaxy.homeworlds[i], galaxy.homeworlds[j])
            if dist < galaxy.config.min_homeworld_distance:
                errors.append("Homeworlds too close: " + 
                    galaxy.homeworlds[i].name + " and " + galaxy.homeworlds[j].name)
    
    // Check for isolated stars (no path to rest of galaxy)
    connectivity = CheckConnectivity(galaxy.stars, max_warp_range=50)
    if not connectivity.fully_connected:
        errors.append("Galaxy has isolated stars")
    
    if errors.length > 0:
        return {valid: false, errors: errors}
    
    return {valid: true}
```

---

## 10. Configuration Parameters Summary

### 10.1 Distance Constants

| Constant | Value | Description |
|----------|-------|-------------|
| MIN_STAR_DISTANCE | 35 | Minimum parsecs between any two stars |
| CLUSTER_RADIUS | 60 | Maximum distance to be considered same cluster |
| NEBULA_MIN_RADIUS | 60 | Minimum nebula size |
| NEBULA_MAX_RADIUS | 120 | Maximum nebula size |
| STARTING_RANGE | 45 | 3 parsecs × 15 (display scale) |
| MAX_WARP_RANGE | 135 | 9 parsecs × 15 (Thorium cells) |

### 10.2 Probability Constants

| Constant | Value | Description |
|----------|-------|-------------|
| CLUSTER_PLACEMENT_CHANCE | 0.70 | Chance star is placed near cluster |
| NEBULA_RESOURCE_BONUS | 0.40 | Chance for resource upgrade in nebula |
| ARTIFACTS_DISCOVERY_CHANCE | 1.00 | First scout always gets tech |

### 10.3 Quality Thresholds

| Constant | Value | Description |
|----------|-------|-------------|
| MIN_HOMEWORLD_NEIGHBORS | 2 | Minimum reachable stars from homeworld |
| MIN_NEIGHBOR_QUALITY | 30 | Warning threshold for average neighbor quality |
| MIN_NEBULA_STARS | 2 | Minimum stars to form valid nebula |

---

## 11. Edge Cases

### 11.1 Placement Failures

**Problem**: Cannot place all stars with minimum distance
**Solution**: Reduce minimum distance by 10% and retry, up to 3 times. If still failing, reduce cluster bias.

```pseudocode
function HandlePlacementFailure(config, attempt):
    if attempt >= 3:
        throw Error("Cannot generate valid star placement")
    
    // Reduce constraints
    config.min_star_distance *= 0.9
    config.cluster_placement_chance -= 0.1
    
    return GenerateStarPositions(config)
```

### 11.2 Homeworld Clustering

**Problem**: All homeworlds end up on one side
**Solution**: Use sector-based distribution (divide map into equal sectors per player)

```pseudocode
function DistributeHomeworldsBySector(player_count, config):
    sectors = DivideMapIntoSectors(player_count, config)
    
    for i, sector in enumerate(sectors):
        // Force one homeworld per sector
        homeworld = FindBestStarInSector(sector, stars)
        ConfigureAsHomeworld(homeworld)
```

### 11.3 No Valid Artifacts Locations

**Problem**: All middle-ring stars are hostile or claimed
**Solution**: Allow Artifacts on any non-homeworld, non-Orion star

### 11.4 Isolated Stars

**Problem**: Some stars unreachable even with max warp
**Solution**: During validation, move isolated stars closer to nearest neighbor

```pseudocode
function FixIsolatedStars(stars, max_range):
    for star in stars:
        nearest = FindNearestStar(star, stars)
        if distance(star, nearest) > max_range:
            // Move star to be within range
            direction = normalize(nearest - star)
            star.x = nearest.x - direction.x * (max_range - 5)
            star.y = nearest.y - direction.y * (max_range - 5)
```

### 11.5 Regeneration Limit

After 10 failed galaxy generation attempts, present error to user and request different parameters (smaller galaxy or fewer players).

---

## 12. Worked Examples

### 12.1 Small Galaxy Generation (24 stars, 4 players)

**Configuration**:
- Map: 500 × 400
- Min star distance: 35
- Clusters: 3 (rolled)
- Nebulae: 1 (rolled)
- Artifacts: 2 (rolled)

**Step-by-step**:

1. **Place cluster centers**: (125, 100), (375, 100), (250, 300)
2. **Place stars**: 
   - 17 stars near clusters (70% × 24 ≈ 17)
   - 7 field stars randomly distributed
3. **Assign colors**: 6 yellow, 4 green, 6 red, 4 blue, 3 white, 1 purple
4. **Place nebula**: Center (300, 250), radius 80, contains 4 stars
5. **Generate planets**: Each star gets environment, size, resources based on color
6. **Place Orion**: Star at (248, 195) closest to center → becomes Orion
7. **Place homeworlds**: 
   - Player 1: Star near (50, 50) → Terran Large
   - Player 2: Star near (450, 50) → Terran Huge
   - Player 3: Star near (50, 350) → Terran Large
   - Player 4: Star near (450, 350) → Terran Large
8. **Place Artifacts**: 2 stars in middle ring designated
9. **Validation**: All checks pass

**Result**: 24 stars, 1 Orion, 4 homeworlds, 2 Artifacts, 1 nebula (4 stars), balanced distribution

### 12.2 Planet Quality Distribution (48-star Medium Galaxy)

After generation, expected distribution:

| Category | Count | Percentage |
|----------|-------|------------|
| Excellent (Terran/Jungle Large+) | 4-6 | ~10% |
| Good (Ocean/Arid Medium+) | 10-14 | ~25% |
| Average (Desert/Steppe any size) | 15-20 | ~35% |
| Poor (Hostile environments) | 12-16 | ~30% |

**Resource distribution**:
- Ultra Rich: 2-4 planets
- Rich: 8-12 planets  
- Normal: 25-30 planets
- Poor: 6-8 planets
- Ultra Poor: 2-4 planets

---

## 13. JSON Data Schema

### 13.1 Star Schema

```json
{
  "star_schema": {
    "id": "string (uuid)",
    "name": "string",
    "x": "number (0-1000)",
    "y": "number (0-800)",
    "color": "enum (yellow|green|red|blue|white|purple)",
    "in_nebula": "boolean",
    "nebula_id": "string|null",
    "region": "enum (safe_zones|wild_pellet_fields|dark_sectors|omega_sector)",
    "cluster_id": "string|null",
    "special": "enum (null|orion|artifacts|homeworld)",
    "is_homeworld": "boolean",
    "owner_id": "string|null",
    "explored_by": ["string (race_id)"],
    "planet": "Planet"
  }
}
```

### 13.2 Planet Schema

```json
{
  "planet_schema": {
    "star_id": "string",
    "name": "string",
    "environment": "enum (14 types)",
    "size": {
      "type": "enum (tiny|small|medium|large|huge)",
      "base_pop": "number (20|40|60|80|100)"
    },
    "resources": "enum (ultra_poor|poor|normal|rich|ultra_rich)",
    "special": "enum (null|orion|artifacts|homeworld)",
    "research_multiplier": "number (1.0|2.0|4.0)",
    "guardian": "boolean",
    "starting_population": "number|null",
    "starting_factories": "number|null"
  }
}
```

### 13.3 Galaxy Schema

```json
{
  "galaxy_schema": {
    "seed": "number",
    "size": "enum (small|medium|large|huge)",
    "width": "number",
    "height": "number",
    "turn": "number",
    "stars": ["Star"],
    "nebulae": [{
      "id": "string",
      "center": {"x": "number", "y": "number"},
      "radius": "number",
      "star_ids": ["string"]
    }],
    "clusters": [{
      "id": "string",
      "center_star_id": "string",
      "member_star_ids": ["string"],
      "region": "string"
    }],
    "homeworld_ids": ["string"],
    "orion_id": "string",
    "artifacts_ids": ["string"]
  }
}
```

---

## 14. Integration Notes

### 14.1 Related Specifications

- **star-systems.md**: Star color effects, one planet per system
- **planet-types.md**: Environment details and growth modifiers
- **planet-sizes.md**: Population capacity details
- **special-planets.md**: Orion and Artifacts mechanics
- **space-regions.md**: Safe Zones, Wild Pellet Fields, Dark Sectors, Omega Sector
- **exploration.md**: Scout mechanics and discovery
- **travel.md**: Warp speed and range calculations

### 14.2 Implementation Sequence

1. Implement star placement with clustering
2. Add planet generation with color-based probabilities
3. Implement special system placement (Orion, Artifacts)
4. Add homeworld placement and validation
5. Implement nebula generation
6. Add connectivity validation
7. Build regeneration/retry logic

### 14.3 Testing Recommendations

- Generate 100 galaxies of each size, verify statistical distributions
- Test edge cases: max players on small maps, minimum players on huge maps
- Verify homeworld balance by measuring average neighbor quality
- Test connectivity with various warp ranges
- Measure generation time to ensure performance targets

---

## 15. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-22 | Initial specification |
