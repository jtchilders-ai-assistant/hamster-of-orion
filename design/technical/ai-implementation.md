# AI Decision Scoring Functions

## Overview

This document provides complete, implementation-ready mathematical formulas for AI decision-making in Hamster of Orion. The AI system uses scoring functions to evaluate options and select optimal actions across five core domains:

1. **Threat Assessment** - Evaluate danger from other empires
2. **Expansion Priority** - Score potential colony targets
3. **Research Selection** - Choose technologies to pursue
4. **Fleet Deployment** - Assign ships to strategic objectives
5. **Diplomatic Stance** - Determine relationship approach

All formulas use integer arithmetic with explicit rounding rules, faithful to MOO1 mechanics.

---

## 1. Threat Assessment Scoring

### 1.1 Overview

Each turn, the AI evaluates every other empire to determine threat level. This drives defensive posture, alliance-seeking, and preemptive war decisions.

### 1.2 Base Threat Formula

```
Threat_Score = floor(
    (Military_Threat × 0.40) +
    (Economic_Threat × 0.25) +
    (Tech_Threat × 0.15) +
    (Proximity_Threat × 0.10) +
    (Hostility_Threat × 0.10)
)
```

**Output Range:** 0-100 (clamped)

### 1.3 Military Threat Component

```
Military_Threat = floor(min(100, (Enemy_Fleet_Power / Our_Fleet_Power) × 50))
```

Where `Fleet_Power` is calculated as:

```
Fleet_Power = Σ (Ship_Power × Ship_Count) for all ship designs

Ship_Power = floor(
    (Hull_HP × Armor_Multiplier × 0.5) +
    (Total_Weapon_Damage × 2.0) +
    (Shield_Class × 5) +
    (Speed × 3)
)
```

**Hull HP by Size (MOO1):**

| Hull Size | Base HP |
|-----------|---------|
| Small | 3 |
| Medium | 18 |
| Large | 100 |
| Huge | 600 |

**Armor Multipliers:**

| Armor | Multiplier |
|-------|------------|
| Titanium | 1.0 |
| Duralloy | 1.5 |
| Zortrium | 2.0 |
| Andrium | 2.5 |
| Tritanium | 3.0 |
| Adamantium | 3.5 |
| Neutronium | 4.0 |

**Worked Example:**

```
Enemy has: 10 Large ships with Fusion Beams (20 dmg), Class V shields, Zortrium armor
Our Fleet: 5 Large ships with same loadout

Enemy Ship_Power = floor((60 × 2.0 × 0.5) + (20 × 2.0) + (5 × 5) + (4 × 3))
                 = floor(60 + 40 + 25 + 12) = 137
Enemy Fleet_Power = 137 × 10 = 1370

Our Ship_Power = 137 (same design)
Our Fleet_Power = 137 × 5 = 685

Military_Threat = floor(min(100, (1370 / 685) × 50))
                = floor(min(100, 2.0 × 50))
                = floor(100) = 100
```

### 1.4 Economic Threat Component

```
Economic_Threat = floor(min(100, (Enemy_Production / Our_Production) × 50))

Total_Production = Σ (Planet_Net_Production) for all planets
```

### 1.5 Technology Threat Component

```
Tech_Threat = floor(min(100, Tech_Gap × 10))

Tech_Gap = Enemy_Avg_Tech_Level - Our_Avg_Tech_Level

Avg_Tech_Level = Σ (Highest_Tech_In_Field) / 6
```

The six technology fields are: Weapons, Propulsion, Construction, Computers, Force Fields, Planetology.

### 1.6 Proximity Threat Component

```
Proximity_Threat = floor(100 - (Distance_To_Nearest_Enemy_Colony × 5))

Distance = shortest path in parsecs from any of our colonies to any of theirs
```

Minimum: 0 (very far), Maximum: 100 (adjacent systems)

### 1.7 Hostility Threat Component

```
Hostility_Threat = floor((50 - Relationship) × 1.0)
```

Where `Relationship` ranges from -100 to +100:
- At -100 (War): Hostility_Threat = 150 → clamped to 100
- At 0 (Neutral): Hostility_Threat = 50
- At +100 (Allied): Hostility_Threat = -50 → clamped to 0

### 1.8 Racial Threat Perception Modifiers

Different races perceive threats differently:

```
Final_Threat = floor(Base_Threat × Racial_Threat_Modifier)
```

| Race | Threat Modifier | Notes |
|------|-----------------|-------|
| Guinea Pigs | 0.70 | Overconfident warriors |
| Ferrets | 0.85 | Predator confidence |
| Budgies | 0.90 | Warrior's pride |
| Hamsters | 1.00 | Balanced assessment |
| Mice | 1.00 | Logical calculation |
| Rats | 1.00 | Scientific analysis |
| Ants | 1.10 | Collective caution |
| Chameleons | 1.10 | Paranoid spies |
| Rabbits | 1.30 | Fearful prey |
| Hermit Crabs | 0.80 | Confident in defenses |

### 1.9 Threat Classification

| Threat Score | Level | AI Response |
|--------------|-------|-------------|
| 0-20 | Negligible | Ignore |
| 21-40 | Minor | Monitor |
| 41-60 | Moderate | Prepare defenses |
| 61-80 | Serious | Seek alliances, build fleet |
| 81-100 | Critical | Maximum military focus |

---

## 2. Expansion Priority Scoring

### 2.1 Overview

The AI scores unclaimed planets to prioritize colonization and determine where to send colony ships.

### 2.2 Expansion Score Formula

```
Expansion_Score = floor(
    Base_Value +
    Environment_Modifier +
    Resource_Modifier +
    Distance_Penalty +
    Strategic_Bonus +
    Competition_Modifier
)
```

**Output Range:** 0-200 (higher is better)

### 2.3 Base Value (by Planet Size)

| Planet Size | Base Value |
|-------------|------------|
| Tiny | 20 |
| Small | 40 |
| Medium | 60 |
| Large | 80 |
| Huge | 100 |

### 2.4 Environment Modifier

| Environment Type | Modifier | Colonizable Without Tech |
|------------------|----------|-------------------------|
| Radiated | -40 | No |
| Toxic | -35 | No |
| Inferno | -30 | No |
| Dead | -25 | No |
| Tundra | -20 | No |
| Barren | -15 | No |
| Minimal | +0 | Yes |
| Desert | +5 | Yes |
| Steppe | +10 | Yes |
| Arid | +15 | Yes |
| Ocean | +20 | Yes |
| Jungle | +25 | Yes |
| Terran | +40 | Yes |
| Gaia | +60 | Yes |

**Hermit Crab Special:** Ignore environment modifier entirely (all environments are equally livable)

### 2.5 Resource Modifier

| Resource Level | Modifier |
|----------------|----------|
| Ultra Poor | -30 |
| Poor | -15 |
| Normal | +0 |
| Rich | +30 |
| Ultra Rich | +50 |

### 2.6 Special Planet Bonuses

| Special | Bonus |
|---------|-------|
| Artifacts World | +40 |
| Homeworld (captured) | +60 |
| Near Orion | +20 |

### 2.7 Distance Penalty

```
Distance_Penalty = -Distance_In_Parsecs × 3

If planet is outside fuel range: Expansion_Score = 0
```

### 2.8 Strategic Bonus

```
Strategic_Bonus = Σ(Strategic_Factors)

Strategic_Factors:
  +15 if planet is on border with enemy
  +10 if planet blocks enemy expansion route
  +10 if planet creates defensive buffer
  +20 if planet would complete control of star system
  +25 if planet provides jump point to rich sector
  -20 if planet is exposed (easily attacked)
```

### 2.9 Competition Modifier

```
Competition_Modifier = -Number_Of_Other_Empires_In_Range × 10
```

If another empire is closer than us:
```
Competition_Modifier -= 20  // They'll probably get it first
```

### 2.10 Racial Expansion Preferences

```
Final_Score = floor(Expansion_Score × Racial_Expansion_Weight)
```

| Race | Weight | Notes |
|------|--------|-------|
| Rabbits | 1.40 | Population-focused |
| Ants | 1.25 | Industrial expansion |
| Hamsters | 1.10 | Balanced growth |
| Guinea Pigs | 1.05 | Conquest over colonization |
| Budgies | 1.00 | Standard |
| Mice | 1.00 | Standard |
| Ferrets | 0.95 | Hunting over settling |
| Chameleons | 1.00 | Standard |
| Rats | 0.90 | Research over expansion |
| Hermit Crabs | 0.80 | Slow, careful expansion |

### 2.11 Worked Example

**Planet:** Medium Jungle, Rich resources, 8 parsecs away, Artifacts world, on enemy border

```
Base_Value = 60 (Medium)
Environment_Modifier = +25 (Jungle)
Resource_Modifier = +30 (Rich)
Distance_Penalty = -8 × 3 = -24
Special_Bonus = +40 (Artifacts)
Strategic_Bonus = +15 (border)
Competition_Modifier = 0 (no other empires in range)

Expansion_Score = 60 + 25 + 30 - 24 + 40 + 15 + 0 = 146

For Rabbits (1.40 weight): Final_Score = floor(146 × 1.40) = 204
For Rats (0.90 weight): Final_Score = floor(146 × 0.90) = 131
```

---

## 3. Research Selection Algorithm

### 3.1 Overview

When multiple technologies are available for research, the AI scores each and selects the highest-scoring option.

### 3.2 Research Score Formula

```
Research_Score = floor(
    Base_Tech_Value +
    Strategic_Alignment +
    Racial_Preference +
    Cost_Efficiency +
    Synergy_Bonus +
    Urgency_Modifier
)
```

### 3.3 Base Tech Value

Technologies are valued by their tier (higher = more valuable):

```
Base_Tech_Value = Tech_Tier × 10

Tech_Tier ranges from 1 to 50 (approximately)
```

### 3.4 Strategic Alignment

Based on current strategic goal:

| Strategy | Field Bonuses |
|----------|---------------|
| Military Supremacy | Weapons +40, Force Fields +30, Computers +20 |
| Tech Advantage | All fields +10, Computers +20 |
| Expansion | Propulsion +40, Planetology +30, Construction +20 |
| Diplomatic Victory | Computers +20 (scanners), Planetology +15 |
| Orion Rush | Weapons +50, Force Fields +40, Propulsion +30 |
| Defensive | Force Fields +40, Construction +30, Weapons +20 |

### 3.5 Racial Research Preferences

Each race has inherent preferences:

```json
{
  "racial_research_preferences": {
    "hamsters": {
      "weapons": 1.0, "propulsion": 1.0, "construction": 1.0,
      "computers": 1.1, "force_fields": 1.0, "planetology": 1.0
    },
    "guinea_pigs": {
      "weapons": 1.4, "propulsion": 0.8, "construction": 1.2,
      "computers": 0.7, "force_fields": 1.1, "planetology": 0.8
    },
    "chameleons": {
      "weapons": 0.9, "propulsion": 1.0, "construction": 0.9,
      "computers": 1.5, "force_fields": 0.9, "planetology": 0.8
    },
    "budgies": {
      "weapons": 1.1, "propulsion": 1.3, "construction": 0.9,
      "computers": 1.2, "force_fields": 0.9, "planetology": 0.8
    },
    "ants": {
      "weapons": 0.9, "propulsion": 1.0, "construction": 1.4,
      "computers": 1.0, "force_fields": 1.0, "planetology": 1.1
    },
    "mice": {
      "weapons": 1.0, "propulsion": 1.0, "construction": 1.3,
      "computers": 1.3, "force_fields": 1.0, "planetology": 0.9
    },
    "ferrets": {
      "weapons": 1.4, "propulsion": 1.1, "construction": 0.9,
      "computers": 1.1, "force_fields": 0.8, "planetology": 0.7
    },
    "rats": {
      "weapons": 1.0, "propulsion": 1.0, "construction": 1.0,
      "computers": 1.2, "force_fields": 1.0, "planetology": 1.0
    },
    "rabbits": {
      "weapons": 0.7, "propulsion": 1.0, "construction": 0.9,
      "computers": 0.8, "force_fields": 0.8, "planetology": 1.5
    },
    "hermit_crabs": {
      "weapons": 0.8, "propulsion": 0.8, "construction": 1.3,
      "computers": 0.9, "force_fields": 1.4, "planetology": 1.0
    }
  }
}
```

```
Racial_Preference = floor(20 × (Racial_Weight - 1.0) × 10)
```

Example: Guinea Pigs researching Weapons (1.4 weight):
```
Racial_Preference = floor(20 × (1.4 - 1.0) × 10) = floor(20 × 4) = 80
```

### 3.6 Cost Efficiency

```
Cost_Efficiency = floor(50 - (Tech_Cost / Empire_Research_Output))

Where:
  Tech_Cost = base research points required
  Empire_Research_Output = total RP/turn from all sources
```

If a tech would take longer than 20 turns: Cost_Efficiency = -50

### 3.7 Synergy Bonus

Technologies that unlock other valuable techs or synergize with existing techs:

```
Synergy_Bonus = 0
Synergy_Bonus += 15 for each tech this unlocks (max +45)
Synergy_Bonus += 10 if this completes a "tech combo" (e.g., shields + armor)
Synergy_Bonus += 20 if this unlocks a new ship class
Synergy_Bonus += 25 if this unlocks terraforming ability
```

### 3.8 Urgency Modifier

Situational bonuses based on current game state:

```
Urgency_Modifier = Σ(Urgency_Factors)

Urgency_Factors:
  +30 if tech counters enemy's dominant strategy
  +25 if tech enables colonization of blocked planets
  +20 if tech would make our ships significantly stronger
  +20 if tech unlocks defense against imminent threat
  +15 if tech enables new diplomatic options
  -10 if tech duplicates existing capability
  -20 if tech is obsolete by next tier tech we nearly have
```

### 3.9 Research Selection Algorithm

```pseudocode
function select_research(empire, available_techs):
    best_tech = null
    best_score = -999
    
    for tech in available_techs:
        # Calculate base value
        score = tech.tier * 10
        
        # Add strategic alignment
        strategy = empire.current_strategy
        score += get_strategy_bonus(strategy, tech.field)
        
        # Add racial preference
        racial_weight = get_racial_preference(empire.race, tech.field)
        score += floor(20 * (racial_weight - 1.0) * 10)
        
        # Add cost efficiency
        turns_to_research = tech.cost / empire.research_output
        if turns_to_research > 20:
            score -= 50
        else:
            score += floor(50 - turns_to_research * 2)
        
        # Add synergy
        score += count_unlocked_techs(tech) * 15
        if completes_tech_combo(tech, empire):
            score += 10
        if unlocks_ship_class(tech):
            score += 20
        
        # Add urgency
        score += calculate_urgency(tech, empire, game_state)
        
        # Random factor (±5)
        score += random(-5, 5)
        
        if score > best_score:
            best_score = score
            best_tech = tech
    
    return best_tech
```

### 3.10 Worked Example

**Situation:** Rats (research-focused) choosing between:
- Fusion Beam (Weapons, Tier 10, 2000 RP)
- Improved Space Scanner (Computers, Tier 8, 1500 RP)

Empire Research Output: 200 RP/turn
Strategy: Tech Advantage
No immediate military threats

**Fusion Beam:**
```
Base_Value = 10 × 10 = 100
Strategic_Alignment = +10 (tech advantage, all fields)
Racial_Preference = floor(20 × (1.0 - 1.0) × 10) = 0
Cost_Efficiency = floor(50 - (2000 / 200)) = floor(50 - 10) = 40
Synergy_Bonus = +15 (unlocks Heavy Fusion Beam)
Urgency_Modifier = 0

Total = 100 + 10 + 0 + 40 + 15 + 0 = 165
```

**Improved Space Scanner:**
```
Base_Value = 8 × 10 = 80
Strategic_Alignment = +30 (tech advantage + computers bonus)
Racial_Preference = floor(20 × (1.2 - 1.0) × 10) = 40
Cost_Efficiency = floor(50 - (1500 / 200)) = floor(50 - 7.5) = 42
Synergy_Bonus = +10 (completes scanner suite)
Urgency_Modifier = 0

Total = 80 + 30 + 40 + 42 + 10 + 0 = 202
```

**Result:** Rats select Improved Space Scanner (202 > 165)

---

## 4. Fleet Deployment Decisions

### 4.1 Overview

The AI must decide where to send fleets based on strategic objectives. This involves scoring potential destinations and assigning appropriate fleet compositions.

### 4.2 Fleet Role Classification

Ships are classified into roles based on their design:

```pseudocode
function classify_fleet_role(fleet):
    total_ships = count(fleet.ships)
    
    scout_count = count(ships where class == 'scout')
    bomber_count = count(ships where has_bombs == true)
    capital_count = count(ships where class in ['cruiser', 'battle_cruiser', 'dreadnought', 'titan'])
    fighter_count = count(ships where class in ['scout', 'fighter', 'destroyer'])
    
    if scout_count > total_ships * 0.7:
        return 'reconnaissance'
    
    if bomber_count > capital_count:
        return 'invasion'
    
    if capital_count >= 3:
        return 'strike_force'
    
    if fighter_count > capital_count * 2:
        return 'patrol'
    
    return 'defense'
```

### 4.3 Deployment Target Score Formula

```
Target_Score = floor(
    Objective_Value +
    Success_Probability +
    Strategic_Importance +
    Distance_Factor +
    Risk_Assessment
)
```

### 4.4 Objective Value

| Objective Type | Base Value |
|----------------|------------|
| Defend Homeworld | 200 |
| Defend Colony | 50 + (Planet_Production × 2) |
| Attack Enemy Homeworld | 150 |
| Attack Enemy Colony | 40 + (Planet_Production × 2) |
| Intercept Enemy Fleet | Enemy_Fleet_Power / 10 |
| Guard Chokepoint | 60 |
| Escort Colony Ship | 80 |
| Explore Unknown | 20 |
| Raid Trade Route | 40 |

### 4.5 Success Probability

```
Success_Probability = floor(50 × (Our_Fleet_Power / Total_Opposition))

Total_Opposition = Enemy_Fleet_Power + Planet_Defense_Power

Planet_Defense_Power = (Missile_Bases × 100) + (Planetary_Shields × 20)
```

Capped at +100 (overwhelming advantage) or -50 (suicide mission)

### 4.6 Strategic Importance

```
Strategic_Importance = Σ(Strategic_Factors)

Factors:
  +30 if target is blocking expansion
  +25 if target threatens our production
  +20 if capturing would cut enemy in half
  +15 if target has strategic resource
  +10 if target is on victory path
  -10 if target is peripheral
  -20 if capturing would overextend us
```

### 4.7 Distance Factor

```
Distance_Factor = floor(40 - (Distance_In_Parsecs × 3))
```

Minimum: -50 (very far), Maximum: +40 (adjacent)

### 4.8 Risk Assessment

```
Risk_Assessment = -floor((Loss_Probability × Fleet_Value) / 100)

Loss_Probability = 100 - Success_Probability (if engaging)
Fleet_Value = Σ(Ship_Build_Cost) for all ships in fleet
```

### 4.9 Fleet Assignment Algorithm

```pseudocode
function assign_fleets(empire, game_state):
    assignments = {}
    unassigned_fleets = empire.fleets.copy()
    objectives = generate_objectives(empire, game_state)
    
    # Sort objectives by urgency
    objectives.sort(key=urgency, descending=True)
    
    for objective in objectives:
        # Find best fleet for this objective
        best_fleet = null
        best_score = -999
        
        for fleet in unassigned_fleets:
            if not fleet_can_reach(fleet, objective):
                continue
            
            score = calculate_target_score(fleet, objective, game_state)
            
            # Adjust for fleet suitability
            if objective.type == 'invasion' and fleet.role != 'invasion':
                score -= 50
            if objective.type == 'defense' and fleet.role == 'strike_force':
                score -= 30  # Overkill
            
            if score > best_score:
                best_score = score
                best_fleet = fleet
        
        if best_fleet and best_score > MIN_SCORE_THRESHOLD:
            assignments[best_fleet.id] = objective
            unassigned_fleets.remove(best_fleet)
    
    # Assign remaining fleets to patrol
    for fleet in unassigned_fleets:
        assignments[fleet.id] = get_nearest_patrol_zone(fleet, empire)
    
    return assignments
```

### 4.10 Fleet Composition Recommendations

When building fleets, the AI targets compositions based on role:

```json
{
  "fleet_compositions": {
    "reconnaissance": {
      "scout": {"min": 3, "max": 10},
      "destroyer": {"min": 0, "max": 2}
    },
    "patrol": {
      "fighter": {"min": 5, "max": 20},
      "destroyer": {"min": 2, "max": 8}
    },
    "defense": {
      "destroyer": {"min": 5, "max": 15},
      "cruiser": {"min": 2, "max": 6},
      "battle_cruiser": {"min": 0, "max": 2}
    },
    "strike_force": {
      "cruiser": {"min": 3, "max": 10},
      "battle_cruiser": {"min": 2, "max": 5},
      "dreadnought": {"min": 1, "max": 3}
    },
    "invasion": {
      "destroyer": {"min": 5, "max": 15},
      "cruiser": {"min": 3, "max": 8},
      "bomber": {"min": 5, "max": 20}
    }
  }
}
```

### 4.11 Combat Engagement Decision

```
Engage_Score = floor(
    (Our_Fleet_Power / Enemy_Fleet_Power) × 50 +
    Objective_Importance × 0.3 +
    Personality_Aggression × 0.2
)

If Engage_Score >= 40: ENGAGE
If Engage_Score >= 25 and Engage_Score < 40: ENGAGE if personality is aggressive
If Engage_Score < 25: RETREAT or AVOID
```

### 4.12 Retreat Decision

```pseudocode
function should_retreat(ship, combat_state):
    hp_remaining = ship.current_hp / ship.max_hp
    allies_remaining = count(friendly_ships)
    enemies_remaining = count(enemy_ships)
    
    # Desperation threshold
    if hp_remaining < 0.20:
        return true
    
    # Losing badly
    if allies_remaining == 1 and enemies_remaining >= 3:
        return true
    
    # Valuable ship in danger
    if ship.class in ['dreadnought', 'titan'] and hp_remaining < 0.40:
        return true
    
    # Personality check
    if empire.personality.honorable and hp_remaining > 0.30:
        return false  # Fight to the death
    
    return false
```

---

## 5. Diplomatic Stance Calculations

### 5.1 Overview

The AI determines its diplomatic approach to each empire based on strategic calculations, personality, and game state.

### 5.2 Stance Categories

| Stance | Relationship Effect | Behavior |
|--------|---------------------|----------|
| Hostile | Target for war | Attack on sight, reject treaties |
| Unfriendly | Cold relations | No treaties, border tensions |
| Neutral | Standard | Open to fair negotiations |
| Cooperative | Warming | Seek treaties, trade |
| Allied | Full partnership | Mutual defense, tech sharing |

### 5.3 Stance Score Formula

```
Stance_Score = floor(
    Base_Relationship +
    Power_Assessment +
    Strategic_Value +
    Trust_Factor +
    Personality_Modifier +
    History_Modifier
)
```

**Score to Stance Mapping:**

| Score Range | Stance |
|-------------|--------|
| < -60 | Hostile |
| -60 to -20 | Unfriendly |
| -19 to +30 | Neutral |
| +31 to +60 | Cooperative |
| > +60 | Allied |

### 5.4 Base Relationship

Uses the current diplomatic relationship value (-100 to +100).

### 5.5 Power Assessment

```
Power_Ratio = Our_Total_Power / Their_Total_Power

Total_Power = Fleet_Power + (Production × 5) + (Tech_Level × 10)

Power_Assessment:
  If Power_Ratio < 0.5: +30 (we're weaker, seek peace)
  If Power_Ratio 0.5-0.8: +15 (slightly weaker)
  If Power_Ratio 0.8-1.2: +0 (evenly matched)
  If Power_Ratio 1.2-2.0: -15 (we're stronger)
  If Power_Ratio > 2.0: -30 (we're much stronger, can bully)
```

**Note:** Aggressive races invert this (strength encourages war)

### 5.6 Strategic Value

```
Strategic_Value = Σ(Strategic_Factors)

Factors:
  +30 if they are buffer against common enemy
  +25 if tech trading would be beneficial
  +20 if trade agreement would be profitable
  +15 if they control strategic resources
  +10 if alliance improves Council votes
  -10 if they block our expansion
  -20 if they are allied with our enemy
  -30 if they are primary expansion target
```

### 5.7 Trust Factor

```
Trust_Factor = floor(Trust_Base × Trust_Modifier)

Trust_Base:
  +40 if they have never broken a treaty with us
  +20 if they honored defensive pact call
  0 if no significant history
  -30 if they have broken a treaty with us
  -50 if they have attacked us unprovoked
  -80 if they are Chameleons (never trust)

Trust_Modifier (racial):
  Hamsters: 1.3 (trusting)
  Rabbits: 1.2 (trusting)
  Rats: 1.1 (logical, give benefit of doubt)
  Standard races: 1.0
  Ferrets: 0.9 (suspicious)
  Chameleons: 0.7 (deeply suspicious)
  Guinea Pigs: 0.8 (trust only strength)
```

### 5.8 Personality Modifier

```json
{
  "personality_stance_modifiers": {
    "hamsters": {
      "base_friendliness": 20,
      "war_reluctance": 30,
      "treaty_bonus": 15
    },
    "guinea_pigs": {
      "base_friendliness": -20,
      "war_reluctance": -30,
      "treaty_bonus": -10
    },
    "chameleons": {
      "base_friendliness": 0,
      "war_reluctance": 10,
      "treaty_bonus": 0,
      "backstab_tendency": 40
    },
    "budgies": {
      "base_friendliness": 0,
      "war_reluctance": 0,
      "treaty_bonus": 5
    },
    "ferrets": {
      "base_friendliness": -10,
      "war_reluctance": -15,
      "treaty_bonus": -5
    },
    "rats": {
      "base_friendliness": 15,
      "war_reluctance": 25,
      "treaty_bonus": 20
    },
    "rabbits": {
      "base_friendliness": 25,
      "war_reluctance": 40,
      "treaty_bonus": 10
    },
    "mice": {
      "base_friendliness": 10,
      "war_reluctance": 15,
      "treaty_bonus": 15
    },
    "ants": {
      "base_friendliness": -5,
      "war_reluctance": 10,
      "treaty_bonus": 0
    },
    "hermit_crabs": {
      "base_friendliness": 0,
      "war_reluctance": 30,
      "treaty_bonus": -5
    }
  }
}
```

### 5.9 History Modifier

```
History_Modifier = Σ(Historical_Events × Decay_Factor)

Historical_Events:
  War between us: -30 (decays slowly)
  They attacked our ally: -20
  They helped us in war: +25
  Long-standing trade: +15
  Technology shared: +10 per tech
  Broken treaty: -40 (decays very slowly)

Decay_Factor = 0.98^(turns_since_event)
```

After 50 turns, an event's impact is reduced to ~36% of original.
After 100 turns, ~13% of original.

### 5.10 War Declaration Decision

```pseudocode
function should_declare_war(empire, target, game_state):
    # Never declare war on allies
    if has_alliance(empire, target):
        return false
    
    # Check war weariness
    if empire.war_weariness > 50:
        return false
    
    # Calculate war score
    war_score = 0
    
    # Military advantage
    power_ratio = empire.fleet_power / target.fleet_power
    if power_ratio > 1.5:
        war_score += 30
    if power_ratio > 2.0:
        war_score += 20  # Additional bonus
    
    # Strategic need
    if target_blocks_expansion(empire, target):
        war_score += 25
    if target_has_valuable_planets(target):
        war_score += 20
    
    # Relationship already hostile
    relation = get_relationship(empire, target)
    if relation < -30:
        war_score += 15
    
    # Personality
    war_score += empire.personality.aggression * 0.3
    
    # Opportunity (target at war with someone else)
    if target.is_at_war and target.war_weariness > 30:
        war_score += 30
    
    # Risk check
    if target_has_allies(target):
        war_score -= 20 * count(target.allies)
    
    # Threshold by personality
    threshold = 50
    if empire.personality.warmonger:
        threshold = 30
    if empire.personality.peaceful:
        threshold = 80
    
    return war_score >= threshold
```

### 5.11 Treaty Proposal Decision

```pseudocode
function should_propose_treaty(empire, target, treaty_type):
    relation = get_relationship(empire, target)
    min_relation = get_treaty_min_relation(treaty_type, empire.race)
    
    if relation < min_relation:
        return false
    
    # Calculate benefit
    benefit_score = calculate_treaty_benefit(empire, target, treaty_type)
    
    # Trade agreement
    if treaty_type == 'trade':
        benefit_score = (target.production / empire.production) * 20
        benefit_score += 10  # Base benefit
    
    # Research pact
    if treaty_type == 'research':
        tech_gap = target.tech_level - empire.tech_level
        benefit_score = tech_gap * 5 + 15
    
    # Non-aggression pact
    if treaty_type == 'nap':
        threat = calculate_threat(empire, target)
        benefit_score = threat * 0.4 + 10
    
    # Alliance
    if treaty_type == 'alliance':
        # Only if they would help in war
        common_enemies = count_common_enemies(empire, target)
        benefit_score = common_enemies * 20 + relation * 0.3
    
    return benefit_score > 20
```

### 5.12 Treaty Response Algorithm

```pseudocode
function respond_to_treaty(empire, proposer, treaty_type):
    # Get base acceptance
    relation = get_relationship(empire, proposer)
    base_chance = 30 + (relation * 0.5)
    
    # Racial modifiers
    racial_bonus = get_racial_treaty_bonus(empire.race)
    base_chance += racial_bonus
    
    # Reputation check
    if proposer.is_treaty_breaker:
        base_chance -= 30
    
    # Strategic value
    strategic_value = calculate_treaty_value(empire, proposer, treaty_type)
    base_chance += strategic_value
    
    # Gift bonus (if offered)
    if treaty_includes_gift(treaty):
        gift_value = treaty.gift_amount / 100
        base_chance += min(gift_value, 30)
    
    # Personality
    if empire.personality.peaceful:
        base_chance += 15
    if empire.personality.xenophobic:
        base_chance -= 20
    
    # Clamp and roll
    acceptance_chance = clamp(base_chance, 5, 95)
    
    return random(1, 100) <= acceptance_chance
```

---

## 6. Difficulty Level Modifiers

### 6.1 AI Decision Bonuses by Difficulty

| Difficulty | Decision Quality | Information | Cheats |
|------------|------------------|-------------|--------|
| Simple | Random factor ±30 | Fog of war | None |
| Easy | Random factor ±20 | Fog of war | None |
| Average | Random factor ±10 | Full map | None |
| Hard | Random factor ±5 | Full map | +25% production |
| Impossible | Optimal decisions | Full vision | +50% all resources |

### 6.2 Difficulty Constants

```json
{
  "difficulty_modifiers": {
    "simple": {
      "production_modifier": 0.75,
      "research_modifier": 0.75,
      "combat_modifier": 0.80,
      "decision_randomness": 30,
      "fog_of_war": true,
      "perfect_information": false
    },
    "easy": {
      "production_modifier": 0.90,
      "research_modifier": 0.90,
      "combat_modifier": 0.90,
      "decision_randomness": 20,
      "fog_of_war": true,
      "perfect_information": false
    },
    "average": {
      "production_modifier": 1.00,
      "research_modifier": 1.00,
      "combat_modifier": 1.00,
      "decision_randomness": 10,
      "fog_of_war": false,
      "perfect_information": false
    },
    "hard": {
      "production_modifier": 1.25,
      "research_modifier": 1.25,
      "combat_modifier": 1.15,
      "decision_randomness": 5,
      "fog_of_war": false,
      "perfect_information": true
    },
    "impossible": {
      "production_modifier": 1.50,
      "research_modifier": 1.50,
      "combat_modifier": 1.30,
      "decision_randomness": 0,
      "fog_of_war": false,
      "perfect_information": true
    }
  }
}
```

---

## 7. Constants Summary

### 7.1 Threat Assessment Constants

| Constant | Value | Description |
|----------|-------|-------------|
| THREAT_MILITARY_WEIGHT | 0.40 | Weight for military component |
| THREAT_ECONOMIC_WEIGHT | 0.25 | Weight for economic component |
| THREAT_TECH_WEIGHT | 0.15 | Weight for technology component |
| THREAT_PROXIMITY_WEIGHT | 0.10 | Weight for proximity component |
| THREAT_HOSTILITY_WEIGHT | 0.10 | Weight for hostility component |
| THREAT_NEGLIGIBLE_MAX | 20 | Upper bound for negligible threat |
| THREAT_MINOR_MAX | 40 | Upper bound for minor threat |
| THREAT_MODERATE_MAX | 60 | Upper bound for moderate threat |
| THREAT_SERIOUS_MAX | 80 | Upper bound for serious threat |

### 7.2 Expansion Constants

| Constant | Value | Description |
|----------|-------|-------------|
| BASE_TINY_VALUE | 20 | Base expansion value for tiny planet |
| BASE_SMALL_VALUE | 40 | Base expansion value for small planet |
| BASE_MEDIUM_VALUE | 60 | Base expansion value for medium planet |
| BASE_LARGE_VALUE | 80 | Base expansion value for large planet |
| BASE_HUGE_VALUE | 100 | Base expansion value for huge planet |
| DISTANCE_PENALTY_PER_PARSEC | 3 | Score reduction per parsec |
| ARTIFACT_BONUS | 40 | Bonus for artifacts world |
| ULTRA_RICH_BONUS | 50 | Bonus for ultra rich resources |
| COMPETITION_PENALTY | 10 | Penalty per competing empire |

### 7.3 Research Constants

| Constant | Value | Description |
|----------|-------|-------------|
| BASE_VALUE_PER_TIER | 10 | Base score per tech tier |
| MAX_SYNERGY_BONUS | 45 | Maximum from unlocked techs |
| SHIP_CLASS_UNLOCK_BONUS | 20 | Bonus for unlocking ship class |
| TERRAFORM_UNLOCK_BONUS | 25 | Bonus for terraforming |
| LONG_RESEARCH_PENALTY | -50 | Penalty if tech takes >20 turns |

### 7.4 Fleet Deployment Constants

| Constant | Value | Description |
|----------|-------|-------------|
| DEFEND_HOMEWORLD_VALUE | 200 | Objective value for homeworld |
| ATTACK_HOMEWORLD_VALUE | 150 | Objective value for enemy homeworld |
| ESCORT_COLONY_SHIP_VALUE | 80 | Objective value for escort |
| EXPLORE_VALUE | 20 | Objective value for exploration |
| MIN_ENGAGE_SCORE | 40 | Minimum score to engage |
| RETREAT_HP_THRESHOLD | 0.20 | HP ratio to trigger retreat |

### 7.5 Diplomatic Constants

| Constant | Value | Description |
|----------|-------|-------------|
| STANCE_HOSTILE_MAX | -60 | Upper bound for hostile stance |
| STANCE_UNFRIENDLY_MAX | -20 | Upper bound for unfriendly |
| STANCE_NEUTRAL_MAX | 30 | Upper bound for neutral |
| STANCE_COOPERATIVE_MAX | 60 | Upper bound for cooperative |
| CHAMELEON_TRUST_PENALTY | -80 | Trust modifier for Chameleons |
| WAR_DECLARATION_THRESHOLD | 50 | Base war score to declare |
| TREATY_BENEFIT_THRESHOLD | 20 | Minimum benefit to propose |

---

## 8. Complete AI Turn Algorithm

```pseudocode
function execute_ai_turn(empire, game_state):
    # 1. Assess situation
    threat_scores = {}
    for other_empire in game_state.empires:
        if other_empire != empire:
            threat_scores[other_empire.id] = calculate_threat_score(
                empire, other_empire, game_state
            )
    
    # 2. Update strategy if needed
    if should_update_strategy(empire, game_state):
        empire.strategy = determine_strategy(empire, threat_scores, game_state)
    
    # 3. Diplomatic decisions
    diplomatic_actions = []
    for other_empire in game_state.empires:
        if other_empire != empire:
            stance = calculate_diplomatic_stance(
                empire, other_empire, game_state
            )
            action = determine_diplomatic_action(
                empire, other_empire, stance, game_state
            )
            if action:
                diplomatic_actions.append(action)
    
    # 4. Research selection
    if empire.current_research is None:
        available_techs = get_available_technologies(empire)
        empire.current_research = select_research(
            empire, available_techs, game_state
        )
    
    # 5. Expansion decisions
    if has_colony_ships(empire):
        expansion_targets = score_expansion_targets(empire, game_state)
        for colony_ship in empire.colony_ships:
            target = select_best_target(colony_ship, expansion_targets)
            if target:
                issue_colonization_order(colony_ship, target)
    
    # 6. Production decisions
    for planet in empire.planets:
        sliders = calculate_optimal_sliders(planet, empire.strategy, game_state)
        set_planet_sliders(planet, sliders)
        
        if should_build_ships(planet, empire.strategy):
            ship_design = select_ship_design(empire, planet)
            queue_ship_production(planet, ship_design)
    
    # 7. Fleet deployment
    fleet_assignments = assign_fleets(empire, game_state)
    for fleet_id, objective in fleet_assignments:
        issue_fleet_orders(fleet_id, objective)
    
    # 8. Ship design updates
    if should_update_designs(empire):
        new_designs = design_ships(empire, game_state)
        empire.ship_designs = new_designs
    
    return {
        diplomatic_actions: diplomatic_actions,
        research: empire.current_research,
        fleet_orders: fleet_assignments,
        production_orders: get_production_summary(empire)
    }
```

---

## 9. Edge Cases

### 9.1 No Valid Expansion Targets

If all reachable planets are claimed or hostile:
- Focus on internal development
- Increase fleet production
- Pursue technologies that extend range or enable hostile colonization

### 9.2 Surrounded by Hostile Empires

If threat score > 80 from multiple directions:
- Seek peace with weakest enemy
- Propose alliance with strongest non-enemy
- Maximum defensive production
- Concentrate forces rather than spread

### 9.3 Technology Gap Too Large

If enemy tech level exceeds ours by >10:
- Prioritize research
- Avoid direct military confrontation
- Focus on espionage (tech theft)
- Seek research pacts

### 9.4 Economic Collapse

If production falls below maintenance:
- Scrap obsolete ships
- Abandon marginal colonies
- Focus remaining production on factories
- Seek trade agreements

### 9.5 Diplomatic Isolation

If no empire has positive relations:
- Identify most receptive empire
- Send gifts
- Avoid provocative actions
- Accept disadvantageous treaties to build trust

---

## 10. Related Documents

- `ai-personalities.md` - Race-specific behavioral patterns
- `relationship-formulas.md` - Diplomatic relationship mathematics
- `combat-algorithm.md` - Combat resolution for fleet engagements
- `difficulty.md` - Difficulty level effects
- `factory-formulas.md` - Production calculations
- `ship-classes.md` - Fleet power calculations

---

*Document Version: 2.0*
*Last Updated: 2026-03-22*
*Specification: spec-018 - AI Decision Scoring Functions*
