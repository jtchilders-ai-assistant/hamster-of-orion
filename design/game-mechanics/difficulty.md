# Difficulty Level Modifiers

## Overview

Hamster of Orion features five difficulty levels that scale the challenge from beginner-friendly to brutally unfair. Higher difficulties provide AI empires with significant production, research, and combat advantages while placing handicaps on the player. This document specifies exact modifiers for all game systems affected by difficulty.

**Key MOO1 Faithful Mechanics:**
- Five difficulty levels: Simple, Easy, Average, Hard, Impossible
- AI bonuses scale exponentially with difficulty
- Player starting conditions vary by difficulty
- Tech costs for AI decrease at higher difficulties
- Event frequency increases at higher difficulties

---

## Difficulty Levels Summary

| Level | Description | Player Experience | AI Behavior |
|-------|-------------|-------------------|-------------|
| Simple | Tutorial mode | Significant advantages | Passive, forgiving |
| Easy | Beginner friendly | Moderate advantages | Cautious, reactive |
| Average | Balanced | No modifiers | Competent |
| Hard | Challenging | Moderate handicaps | Aggressive, skilled |
| Impossible | Unfair | Severe handicaps | Optimal, cheating |

---

## Starting Conditions

### Player Homeworld Starting State

Starting conditions scale with difficulty level:

| Difficulty | Population | Factories | Ships | Reserve BC |
|------------|------------|-----------|-------|------------|
| Simple | 50 | 40 | 2 Scouts, 1 Fighter | 100 |
| Easy | 45 | 35 | 2 Scouts | 50 |
| Average | 40 | 30 | 1 Scout | 0 |
| Hard | 40 | 30 | 1 Scout | 0 |
| Impossible | 40 | 30 | 1 Scout | 0 |

**Notes:**
- All players start on a Large or Huge Terran planet regardless of difficulty
- Homeworld is always Normal mineral richness
- AI empires always start with Average-level conditions (40 pop, 30 factories, 1 scout)

### Starting Production Calculation

```
Starting_Production = (Population × 0.5) + (Factories × 1.0)

Simple:     (50 × 0.5) + (40 × 1.0) = 25 + 40 = 65 BC/turn
Easy:       (45 × 0.5) + (35 × 1.0) = 22.5 + 35 = 57.5 BC/turn
Average:    (40 × 0.5) + (30 × 1.0) = 20 + 30 = 50 BC/turn
Hard:       (40 × 0.5) + (30 × 1.0) = 20 + 30 = 50 BC/turn
Impossible: (40 × 0.5) + (30 × 1.0) = 20 + 30 = 50 BC/turn
```

---

## Production Modifiers

Production output is multiplied by difficulty modifiers:

### Production Modifier Table

| Difficulty | Player Modifier | AI Modifier | Net Ratio (AI:Player) |
|------------|-----------------|-------------|----------------------|
| Simple | 1.25 (125%) | 0.75 (75%) | 0.60:1 |
| Easy | 1.10 (110%) | 0.90 (90%) | 0.82:1 |
| Average | 1.00 (100%) | 1.00 (100%) | 1.00:1 |
| Hard | 0.90 (90%) | 1.25 (125%) | 1.39:1 |
| Impossible | 0.75 (75%) | 1.50 (150%) | 2.00:1 |

### Production Formula with Difficulty

```
Effective_Production = Base_Production × Racial_Modifier × Difficulty_Modifier

# Example: Ants empire on Hard difficulty
Base_Production = 100 BC
Racial_Modifier = 1.50 (Ants +50%)
Difficulty_Modifier = 1.25 (AI on Hard)

Effective_Production = 100 × 1.50 × 1.25 = 187.5 BC
```

**Application:** Applies to all production including factory output, ship construction, and defensive installations.

---

## Research Modifiers

Research costs and output are modified by difficulty:

### AI Research Cost Modifier

| Difficulty | Player Tech Cost | AI Tech Cost | AI Research Speed |
|------------|------------------|--------------|-------------------|
| Simple | 1.00× | 1.50× | 0.67× slower |
| Easy | 1.00× | 1.25× | 0.80× slower |
| Average | 1.00× | 1.00× | Baseline |
| Hard | 1.00× | 0.75× | 1.33× faster |
| Impossible | 1.00× | 0.50× | 2.00× faster |

**Note:** Player research cost is NOT modified by difficulty. Only AI receives cost reduction.

### Research Formula with Difficulty

```
AI_Tech_Cost = Base_Tech_Cost × AI_Difficulty_Cost_Modifier

# Example: Tier 5 tech (500 RP base) for AI on Impossible
AI_Tech_Cost = 500 × 0.50 = 250 RP

# Player always pays full cost
Player_Tech_Cost = 500 × 1.00 = 500 RP
```

### AI Research Priority Intelligence

| Difficulty | Research Selection |
|------------|-------------------|
| Simple | Random, no optimization |
| Easy | Slight racial preference |
| Average | Racial preference, some counter-tech |
| Hard | Optimal counter-tech, racial synergy |
| Impossible | Perfect counter-tech, knows player's research |

### AI Starting Tech Bonuses

```json
{
  "ai_starting_tech_bonuses": {
    "simple": {
      "bonus_techs": 0,
      "starting_tier": 1,
      "tech_cost_mult": 1.50,
      "research_speed_mult": 0.67
    },
    "easy": {
      "bonus_techs": 0,
      "starting_tier": 1,
      "tech_cost_mult": 1.25,
      "research_speed_mult": 0.80
    },
    "average": {
      "bonus_techs": 0,
      "starting_tier": 1,
      "tech_cost_mult": 1.00,
      "research_speed_mult": 1.00
    },
    "hard": {
      "bonus_techs": 2,
      "starting_tier": 1,
      "tech_cost_mult": 0.75,
      "research_speed_mult": 1.33,
      "bonus_tech_fields": ["racial_preference", "random"]
    },
    "impossible": {
      "bonus_techs": 4,
      "starting_tier": 2,
      "tech_cost_mult": 0.50,
      "research_speed_mult": 2.00,
      "bonus_tech_fields": ["racial_preference", "racial_preference", "weapons", "random"]
    }
  }
}
```

**Bonus Tech Selection Algorithm:**
1. On Hard/Impossible, AI receives bonus starting techs
2. "racial_preference" picks random tech from the race's preferred field
3. "random" picks any tier-appropriate tech
4. "weapons" guarantees early weapon upgrade
5. Techs are tier-1 on Hard, tier-1 or tier-2 on Impossible

---

## Combat Modifiers

### Ship Combat Bonuses

| Difficulty | Player Attack | Player Defense | AI Attack | AI Defense |
|------------|---------------|----------------|-----------|------------|
| Simple | +10% | +10% | -10% | -10% |
| Easy | +5% | +5% | -5% | -5% |
| Average | +0% | +0% | +0% | +0% |
| Hard | -5% | -5% | +5% | +5% |
| Impossible | -10% | -10% | +10% | +10% |

**Application:** These modify hit chance and damage in space combat.

### Combat Modifier Formula

```
Effective_Hit_Chance = Base_Hit_Chance + Computer_Bonus - ECM_Penalty + Difficulty_Attack_Modifier

# Example: Player ship vs AI ship on Impossible
Base_Hit_Chance = 50%
Computer_Bonus = +20% (Mark IV)
ECM_Penalty = -10% (AI ECM II)
Difficulty_Attack_Modifier = -10% (player on Impossible)

Effective_Hit_Chance = 50 + 20 - 10 - 10 = 50%
```

### Ground Combat Modifiers

| Difficulty | Player Ground Bonus | AI Ground Bonus |
|------------|---------------------|-----------------|
| Simple | +15% | -15% |
| Easy | +10% | -10% |
| Average | +0% | +0% |
| Hard | -10% | +10% |
| Impossible | -15% | +15% |

---

## Population Growth Modifiers

### Growth Rate Modifiers

| Difficulty | Player Growth | AI Growth |
|------------|---------------|-----------|
| Simple | 1.25× | 0.75× |
| Easy | 1.10× | 0.90× |
| Average | 1.00× | 1.00× |
| Hard | 0.90× | 1.10× |
| Impossible | 0.75× | 1.25× |

### Growth Formula with Difficulty

```
Effective_Growth = Base_Growth × Racial_Modifier × Environment_Modifier × Difficulty_Modifier

# Example: Rabbits on Terran planet, Hard difficulty (AI)
Base_Growth = 10%
Racial_Modifier = 2.00 (Rabbits +100%)
Environment_Modifier = 1.00 (Terran)
Difficulty_Modifier = 1.10 (AI on Hard)

Effective_Growth = 10% × 2.00 × 1.00 × 1.10 = 22%
```

---

## Diplomatic Modifiers

### AI Diplomatic Behavior

| Difficulty | AI Forgiveness | Treaty Duration | War Declaration Threshold |
|------------|----------------|-----------------|---------------------------|
| Simple | 1.50× | 1.25× longer | +30 (very reluctant) |
| Easy | 1.25× | 1.10× longer | +15 (reluctant) |
| Average | 1.00× | 1.00× baseline | +0 (normal) |
| Hard | 0.75× | 0.90× shorter | -15 (eager) |
| Impossible | 0.50× | 0.75× shorter | -30 (aggressive) |

**Forgiveness:** Multiplier on how quickly negative relations decay.
**Treaty Duration:** Affects AI willingness to maintain treaties.
**War Declaration Threshold:** Modifier to the relation level at which AI considers war.

### Anti-Player Coalition

| Difficulty | Coalition Probability |
|------------|----------------------|
| Simple | 0% (never) |
| Easy | 10% (rare) |
| Average | 25% (occasional) |
| Hard | 50% (common) |
| Impossible | 75% (frequent) |

**Coalition Mechanics:** At higher difficulties, AI empires coordinate against the leading player. When triggered:
- AI empires share intelligence about player
- Coordinated attack timing
- Refuse separate peace treaties
- Trade embargoes

---

## Espionage Modifiers

### Spy Operation Modifiers

| Difficulty | Player Spy Success | AI Spy Success | Player Detection | AI Detection |
|------------|-------------------|----------------|------------------|--------------|
| Simple | +20% | -20% | +20% | -20% |
| Easy | +10% | -10% | +10% | -10% |
| Average | +0% | +0% | +0% | +0% |
| Hard | -10% | +10% | -10% | +10% |
| Impossible | -20% | +20% | -20% | +20% |

### Spy Cost Modifier

| Difficulty | Player Spy Cost |
|------------|-----------------|
| Simple | 0.75× (37 BC) |
| Easy | 0.90× (45 BC) |
| Average | 1.00× (50 BC) |
| Hard | 1.10× (55 BC) |
| Impossible | 1.25× (62 BC) |

**Note:** AI always pays baseline spy cost (50 BC).

---

## Event Frequency Modifiers

### Random Event Probability

| Difficulty | Event Frequency | Negative Event Bias | Monster Strength |
|------------|-----------------|---------------------|------------------|
| Simple | 0.50× | -25% | 0.75× |
| Easy | 0.75× | -10% | 0.90× |
| Average | 1.00× | +0% | 1.00× |
| Hard | 1.25× | +10% | 1.25× |
| Impossible | 1.50× | +25% | 1.50× |

**Event Frequency:** Multiplier on base event probability.
**Negative Event Bias:** Adjustment to negative vs. positive event probability.
**Monster Strength:** HP and damage multiplier for space monsters.

### Event Probability Formula

```
Event_Chance = Base_Event_Chance × Difficulty_Event_Multiplier

Base_Event_Chance = 3% + (Turn × 0.1%) (max 15%)

# Example: Turn 50 on Impossible
Base_Event_Chance = min(3% + (50 × 0.1%), 15%) = 8%
Difficulty_Multiplier = 1.50
Effective_Chance = 8% × 1.50 = 12%
```

### Monster Stats by Difficulty

| Monster | Stat | Simple | Easy | Average | Hard | Impossible |
|---------|------|--------|------|---------|------|------------|
| Cosmic Blob | HP | 750 | 900 | 1000 | 1250 | 1500 |
| Cosmic Blob | Regen | 75 | 90 | 100 | 125 | 150 |
| Crystal Horror | HP | 600 | 720 | 800 | 1000 | 1200 |
| Crystal Horror | Shields | VIII | IX | X | XI | XII |
| Void Wyrm | HP | 1125 | 1350 | 1500 | 1875 | 2250 |
| Void Wyrm | Damage | 75 | 90 | 100 | 125 | 150 |

### Monster Stats JSON Data

```json
{
  "space_monsters": {
    "cosmic_blob": {
      "id": "cosmic_blob",
      "name": "Cosmic Blob",
      "description": "Amorphous space creature with regenerative abilities",
      "base_stats": {
        "hp": 1000,
        "regen_per_turn": 100,
        "speed": 1,
        "attack_rating": 0,
        "defense_rating": 0,
        "damage_min": 50,
        "damage_max": 100,
        "armor_class": 5
      },
      "difficulty_scaling": {
        "simple": {"hp_mult": 0.75, "regen_mult": 0.75, "damage_mult": 0.75},
        "easy": {"hp_mult": 0.90, "regen_mult": 0.90, "damage_mult": 0.90},
        "average": {"hp_mult": 1.00, "regen_mult": 1.00, "damage_mult": 1.00},
        "hard": {"hp_mult": 1.25, "regen_mult": 1.25, "damage_mult": 1.25},
        "impossible": {"hp_mult": 1.50, "regen_mult": 1.50, "damage_mult": 1.50}
      },
      "abilities": ["regeneration", "immune_to_missiles"]
    },
    "crystal_horror": {
      "id": "crystal_horror",
      "name": "Crystal Horror",
      "description": "Crystalline entity with powerful energy shields",
      "base_stats": {
        "hp": 800,
        "regen_per_turn": 0,
        "speed": 2,
        "attack_rating": 3,
        "defense_rating": 2,
        "damage_min": 75,
        "damage_max": 125,
        "shield_class": 10
      },
      "difficulty_scaling": {
        "simple": {"hp_mult": 0.75, "shield_class": 8, "damage_mult": 0.75},
        "easy": {"hp_mult": 0.90, "shield_class": 9, "damage_mult": 0.90},
        "average": {"hp_mult": 1.00, "shield_class": 10, "damage_mult": 1.00},
        "hard": {"hp_mult": 1.25, "shield_class": 11, "damage_mult": 1.25},
        "impossible": {"hp_mult": 1.50, "shield_class": 12, "damage_mult": 1.50}
      },
      "abilities": ["reflect_beam_weapons", "shield_regeneration"]
    },
    "void_wyrm": {
      "id": "void_wyrm",
      "name": "Void Wyrm",
      "description": "Massive serpentine creature capable of devastating attacks",
      "base_stats": {
        "hp": 1500,
        "regen_per_turn": 0,
        "speed": 3,
        "attack_rating": 5,
        "defense_rating": 3,
        "damage_min": 100,
        "damage_max": 200,
        "armor_class": 8
      },
      "difficulty_scaling": {
        "simple": {"hp_mult": 0.75, "damage_mult": 0.75, "attack_rating": 3},
        "easy": {"hp_mult": 0.90, "damage_mult": 0.90, "attack_rating": 4},
        "average": {"hp_mult": 1.00, "damage_mult": 1.00, "attack_rating": 5},
        "hard": {"hp_mult": 1.25, "damage_mult": 1.25, "attack_rating": 6},
        "impossible": {"hp_mult": 1.50, "damage_mult": 1.50, "attack_rating": 7}
      },
      "abilities": ["multi_attack", "armor_piercing"]
    }
  }
}
```

---

## Guardian of Orion Modifiers

The Guardian's stats scale significantly with difficulty:

| Stat | Simple | Easy | Average | Hard | Impossible |
|------|--------|------|---------|------|------------|
| HP | 16,000 | 24,000 | 32,000 | 40,000 | 48,000 |
| Attack Rating | +5 | +7 | +10 | +12 | +15 |
| Shields | Class X | Class XII | Class XV | Class XVIII | Class XX |
| Armor | ×2.0 | ×3.0 | ×4.0 | ×5.0 | ×6.0 |
| Speed | 2 | 3 | 4 | 5 | 6 |

### Guardian Effective HP Calculation

```
Effective_HP = Base_HP × Armor_Multiplier

Simple:     16,000 × 2.0 = 32,000 effective HP
Easy:       24,000 × 3.0 = 72,000 effective HP
Average:    32,000 × 4.0 = 128,000 effective HP
Hard:       40,000 × 5.0 = 200,000 effective HP
Impossible: 48,000 × 6.0 = 288,000 effective HP
```

---

## Ship Maintenance Modifiers

| Difficulty | Player Maintenance | AI Maintenance |
|------------|-------------------|----------------|
| Simple | 0.75× | 1.25× |
| Easy | 0.90× | 1.10× |
| Average | 1.00× | 1.00× |
| Hard | 1.10× | 0.90× |
| Impossible | 1.25× | 0.75× |

**Application:** Affects fleet upkeep costs, allowing AI to field larger fleets at higher difficulties.

---

## AI Decision Intelligence

### AI Quality by Difficulty

| Difficulty | Decision Quality | Information Access | Planning Horizon |
|------------|------------------|-------------------|------------------|
| Simple | Random (±30) | Fog of War | 5 turns |
| Easy | Suboptimal (±20) | Limited Intel | 10 turns |
| Average | Competent (±10) | Normal Intel | 15 turns |
| Hard | Skilled (±5) | Extended Intel | 25 turns |
| Impossible | Perfect (±0) | Omniscient | Infinite |

**Decision Quality:** Random noise added to AI scoring functions.
**Information Access:** What the AI can "see" about player activities.
**Planning Horizon:** How far ahead AI plans its strategy.

### AI Information Access Details

| Difficulty | Sees Player Ships | Sees Player Tech | Sees Player Production | Sees Player Plans |
|------------|-------------------|------------------|------------------------|-------------------|
| Simple | Only in combat | Never | Never | Never |
| Easy | Adjacent systems | Combat encounters | Never | Never |
| Average | Scanner range | Known + rumors | General strength | Never |
| Hard | Extended range | Most techs | Detailed | Partial |
| Impossible | All ships | All tech | Exact values | Full plans |

---

## Council Voting Modifiers

### Council Formation Timing

| Difficulty | Council Formation |
|------------|-------------------|
| Simple | 60% colonized |
| Easy | 55% colonized |
| Average | 50% colonized |
| Hard | 45% colonized |
| Impossible | 40% colonized |

### AI Vote Behavior

| Difficulty | AI Vote Loyalty | Bribe Effectiveness |
|------------|-----------------|---------------------|
| Simple | Low (player favored) | 1.50× |
| Easy | Moderate | 1.25× |
| Average | Normal | 1.00× |
| Hard | High (AI coordinated) | 0.75× |
| Impossible | Maximum (anti-player) | 0.50× |

**Vote Loyalty:** Tendency for AI to vote against the player leader.
**Bribe Effectiveness:** Multiplier on bribe value for vote influence.

---

## Constants Summary

### DIFFICULTY_CONSTANTS

| Constant | Value | Description |
|----------|-------|-------------|
| DIFFICULTY_COUNT | 5 | Number of difficulty levels |
| MIN_DIFFICULTY_INDEX | 0 | Simple (0-indexed) |
| MAX_DIFFICULTY_INDEX | 4 | Impossible (0-indexed) |
| DEFAULT_DIFFICULTY | 2 | Average (default selection) |
| COALITION_CHECK_INTERVAL | 25 | Turns between coalition checks |
| COALITION_LEADER_THRESHOLD | 1.5 | Power ratio to trigger coalition |

### DIFFICULTY_MODIFIER_CAPS

| Modifier | Minimum | Maximum |
|----------|---------|---------|
| Production | 0.50× | 2.00× |
| Research | 0.50× | 2.00× |
| Combat | -20% | +20% |
| Growth | 0.50× | 1.50× |
| Event Frequency | 0.25× | 2.00× |

### Constants JSON Data

```json
{
  "difficulty_constants": {
    "DIFFICULTY_COUNT": 5,
    "MIN_DIFFICULTY_INDEX": 0,
    "MAX_DIFFICULTY_INDEX": 4,
    "DEFAULT_DIFFICULTY": 2,
    "COALITION_CHECK_INTERVAL": 25,
    "COALITION_LEADER_THRESHOLD": 1.5,
    "AI_GRACE_PERIOD_TURNS": 50,
    "MIN_FACTORY_OUTPUT_PER_TURN": 1,
    "TIER_1_TECH_TURN_LIMIT": 20
  },
  "difficulty_modifier_caps": {
    "production": {"min": 0.50, "max": 2.00},
    "research": {"min": 0.50, "max": 2.00},
    "combat": {"min": -0.20, "max": 0.20},
    "ground_combat": {"min": -0.25, "max": 0.25},
    "growth": {"min": 0.50, "max": 1.50},
    "event_frequency": {"min": 0.25, "max": 2.00},
    "maintenance": {"min": 0.50, "max": 2.00},
    "spy_success": {"min": -0.30, "max": 0.30},
    "spy_cost": {"min": 0.50, "max": 2.00}
  },
  "score_multipliers": {
    "simple": 0.50,
    "easy": 0.75,
    "average": 1.00,
    "hard": 1.50,
    "impossible": 2.00
  },
  "difficulty_names": {
    "0": "Simple",
    "1": "Easy",
    "2": "Average",
    "3": "Hard",
    "4": "Impossible"
  }
}
```

---

## JSON Data Schema

```json
{
  "difficulty_levels": [
    {
      "id": "simple",
      "name": "Simple",
      "index": 0,
      "description": "Tutorial mode with significant player advantages",
      "starting_conditions": {
        "player_population": 50,
        "player_factories": 40,
        "player_scouts": 2,
        "player_fighters": 1,
        "player_reserve_bc": 100
      },
      "production_modifier": {
        "player": 1.25,
        "ai": 0.75
      },
      "research_modifier": {
        "player_cost": 1.00,
        "ai_cost": 1.50
      },
      "combat_modifier": {
        "player_attack": 0.10,
        "player_defense": 0.10,
        "ai_attack": -0.10,
        "ai_defense": -0.10
      },
      "ground_combat_modifier": {
        "player": 0.15,
        "ai": -0.15
      },
      "growth_modifier": {
        "player": 1.25,
        "ai": 0.75
      },
      "diplomacy_modifier": {
        "ai_forgiveness": 1.50,
        "treaty_duration": 1.25,
        "war_threshold": 30,
        "coalition_probability": 0.00
      },
      "espionage_modifier": {
        "player_success": 0.20,
        "ai_success": -0.20,
        "player_detection": 0.20,
        "ai_detection": -0.20,
        "player_spy_cost_multiplier": 0.75
      },
      "event_modifier": {
        "frequency": 0.50,
        "negative_bias": -0.25,
        "monster_strength": 0.75
      },
      "maintenance_modifier": {
        "player": 0.75,
        "ai": 1.25
      },
      "ai_intelligence": {
        "decision_noise": 30,
        "information_access": "fog_of_war",
        "planning_horizon": 5
      },
      "council_modifier": {
        "formation_threshold": 0.60,
        "ai_vote_loyalty": 0.50,
        "bribe_effectiveness": 1.50
      },
      "guardian_stats": {
        "hp": 16000,
        "attack_rating": 5,
        "shield_class": 10,
        "armor_multiplier": 2.0,
        "speed": 2
      }
    },
    {
      "id": "easy",
      "name": "Easy",
      "index": 1,
      "description": "Beginner-friendly with moderate player advantages",
      "starting_conditions": {
        "player_population": 45,
        "player_factories": 35,
        "player_scouts": 2,
        "player_fighters": 0,
        "player_reserve_bc": 50
      },
      "production_modifier": {
        "player": 1.10,
        "ai": 0.90
      },
      "research_modifier": {
        "player_cost": 1.00,
        "ai_cost": 1.25
      },
      "combat_modifier": {
        "player_attack": 0.05,
        "player_defense": 0.05,
        "ai_attack": -0.05,
        "ai_defense": -0.05
      },
      "ground_combat_modifier": {
        "player": 0.10,
        "ai": -0.10
      },
      "growth_modifier": {
        "player": 1.10,
        "ai": 0.90
      },
      "diplomacy_modifier": {
        "ai_forgiveness": 1.25,
        "treaty_duration": 1.10,
        "war_threshold": 15,
        "coalition_probability": 0.10
      },
      "espionage_modifier": {
        "player_success": 0.10,
        "ai_success": -0.10,
        "player_detection": 0.10,
        "ai_detection": -0.10,
        "player_spy_cost_multiplier": 0.90
      },
      "event_modifier": {
        "frequency": 0.75,
        "negative_bias": -0.10,
        "monster_strength": 0.90
      },
      "maintenance_modifier": {
        "player": 0.90,
        "ai": 1.10
      },
      "ai_intelligence": {
        "decision_noise": 20,
        "information_access": "limited",
        "planning_horizon": 10
      },
      "council_modifier": {
        "formation_threshold": 0.55,
        "ai_vote_loyalty": 0.75,
        "bribe_effectiveness": 1.25
      },
      "guardian_stats": {
        "hp": 24000,
        "attack_rating": 7,
        "shield_class": 12,
        "armor_multiplier": 3.0,
        "speed": 3
      }
    },
    {
      "id": "average",
      "name": "Average",
      "index": 2,
      "description": "Balanced gameplay with no modifiers",
      "starting_conditions": {
        "player_population": 40,
        "player_factories": 30,
        "player_scouts": 1,
        "player_fighters": 0,
        "player_reserve_bc": 0
      },
      "production_modifier": {
        "player": 1.00,
        "ai": 1.00
      },
      "research_modifier": {
        "player_cost": 1.00,
        "ai_cost": 1.00
      },
      "combat_modifier": {
        "player_attack": 0.00,
        "player_defense": 0.00,
        "ai_attack": 0.00,
        "ai_defense": 0.00
      },
      "ground_combat_modifier": {
        "player": 0.00,
        "ai": 0.00
      },
      "growth_modifier": {
        "player": 1.00,
        "ai": 1.00
      },
      "diplomacy_modifier": {
        "ai_forgiveness": 1.00,
        "treaty_duration": 1.00,
        "war_threshold": 0,
        "coalition_probability": 0.25
      },
      "espionage_modifier": {
        "player_success": 0.00,
        "ai_success": 0.00,
        "player_detection": 0.00,
        "ai_detection": 0.00,
        "player_spy_cost_multiplier": 1.00
      },
      "event_modifier": {
        "frequency": 1.00,
        "negative_bias": 0.00,
        "monster_strength": 1.00
      },
      "maintenance_modifier": {
        "player": 1.00,
        "ai": 1.00
      },
      "ai_intelligence": {
        "decision_noise": 10,
        "information_access": "normal",
        "planning_horizon": 15
      },
      "council_modifier": {
        "formation_threshold": 0.50,
        "ai_vote_loyalty": 1.00,
        "bribe_effectiveness": 1.00
      },
      "guardian_stats": {
        "hp": 32000,
        "attack_rating": 10,
        "shield_class": 15,
        "armor_multiplier": 4.0,
        "speed": 4
      }
    },
    {
      "id": "hard",
      "name": "Hard",
      "index": 3,
      "description": "Challenging gameplay for experienced players",
      "starting_conditions": {
        "player_population": 40,
        "player_factories": 30,
        "player_scouts": 1,
        "player_fighters": 0,
        "player_reserve_bc": 0
      },
      "production_modifier": {
        "player": 0.90,
        "ai": 1.25
      },
      "research_modifier": {
        "player_cost": 1.00,
        "ai_cost": 0.75
      },
      "combat_modifier": {
        "player_attack": -0.05,
        "player_defense": -0.05,
        "ai_attack": 0.05,
        "ai_defense": 0.05
      },
      "ground_combat_modifier": {
        "player": -0.10,
        "ai": 0.10
      },
      "growth_modifier": {
        "player": 0.90,
        "ai": 1.10
      },
      "diplomacy_modifier": {
        "ai_forgiveness": 0.75,
        "treaty_duration": 0.90,
        "war_threshold": -15,
        "coalition_probability": 0.50
      },
      "espionage_modifier": {
        "player_success": -0.10,
        "ai_success": 0.10,
        "player_detection": -0.10,
        "ai_detection": 0.10,
        "player_spy_cost_multiplier": 1.10
      },
      "event_modifier": {
        "frequency": 1.25,
        "negative_bias": 0.10,
        "monster_strength": 1.25
      },
      "maintenance_modifier": {
        "player": 1.10,
        "ai": 0.90
      },
      "ai_intelligence": {
        "decision_noise": 5,
        "information_access": "extended",
        "planning_horizon": 25
      },
      "council_modifier": {
        "formation_threshold": 0.45,
        "ai_vote_loyalty": 1.50,
        "bribe_effectiveness": 0.75
      },
      "guardian_stats": {
        "hp": 40000,
        "attack_rating": 12,
        "shield_class": 18,
        "armor_multiplier": 5.0,
        "speed": 5
      }
    },
    {
      "id": "impossible",
      "name": "Impossible",
      "index": 4,
      "description": "Brutally unfair - AI cheats significantly",
      "starting_conditions": {
        "player_population": 40,
        "player_factories": 30,
        "player_scouts": 1,
        "player_fighters": 0,
        "player_reserve_bc": 0
      },
      "production_modifier": {
        "player": 0.75,
        "ai": 1.50
      },
      "research_modifier": {
        "player_cost": 1.00,
        "ai_cost": 0.50
      },
      "combat_modifier": {
        "player_attack": -0.10,
        "player_defense": -0.10,
        "ai_attack": 0.10,
        "ai_defense": 0.10
      },
      "ground_combat_modifier": {
        "player": -0.15,
        "ai": 0.15
      },
      "growth_modifier": {
        "player": 0.75,
        "ai": 1.25
      },
      "diplomacy_modifier": {
        "ai_forgiveness": 0.50,
        "treaty_duration": 0.75,
        "war_threshold": -30,
        "coalition_probability": 0.75
      },
      "espionage_modifier": {
        "player_success": -0.20,
        "ai_success": 0.20,
        "player_detection": -0.20,
        "ai_detection": 0.20,
        "player_spy_cost_multiplier": 1.25
      },
      "event_modifier": {
        "frequency": 1.50,
        "negative_bias": 0.25,
        "monster_strength": 1.50
      },
      "maintenance_modifier": {
        "player": 1.25,
        "ai": 0.75
      },
      "ai_intelligence": {
        "decision_noise": 0,
        "information_access": "omniscient",
        "planning_horizon": -1
      },
      "council_modifier": {
        "formation_threshold": 0.40,
        "ai_vote_loyalty": 2.00,
        "bribe_effectiveness": 0.50
      },
      "guardian_stats": {
        "hp": 48000,
        "attack_rating": 15,
        "shield_class": 20,
        "armor_multiplier": 6.0,
        "speed": 6
      }
    }
  ]
}
```

---

## Difficulty Selection Algorithm

```pseudocode
function apply_difficulty_modifiers(empire, difficulty):
    diff = DIFFICULTY_LEVELS[difficulty]
    
    # Starting conditions (player only, turn 1)
    if empire.is_player and turn == 1:
        empire.homeworld.population = diff.starting_conditions.player_population
        empire.homeworld.factories = diff.starting_conditions.player_factories
        empire.reserve_bc = diff.starting_conditions.player_reserve_bc
        spawn_starting_ships(empire, diff.starting_conditions)
    
    # Production modifier
    if empire.is_player:
        empire.production_multiplier = diff.production_modifier.player
    else:
        empire.production_multiplier = diff.production_modifier.ai
    
    # Research modifier
    if empire.is_player:
        empire.tech_cost_multiplier = diff.research_modifier.player_cost
    else:
        empire.tech_cost_multiplier = diff.research_modifier.ai_cost
    
    # Combat modifiers
    if empire.is_player:
        empire.attack_modifier = diff.combat_modifier.player_attack
        empire.defense_modifier = diff.combat_modifier.player_defense
    else:
        empire.attack_modifier = diff.combat_modifier.ai_attack
        empire.defense_modifier = diff.combat_modifier.ai_defense
    
    # Growth modifier
    if empire.is_player:
        empire.growth_multiplier = diff.growth_modifier.player
    else:
        empire.growth_multiplier = diff.growth_modifier.ai
    
    # Espionage modifier
    if empire.is_player:
        empire.spy_success_modifier = diff.espionage_modifier.player_success
        empire.spy_detection_modifier = diff.espionage_modifier.player_detection
        empire.spy_cost_multiplier = diff.espionage_modifier.player_spy_cost_multiplier
    else:
        empire.spy_success_modifier = diff.espionage_modifier.ai_success
        empire.spy_detection_modifier = diff.espionage_modifier.ai_detection
        empire.spy_cost_multiplier = 1.00  # AI always pays base cost
    
    # Maintenance modifier
    if empire.is_player:
        empire.maintenance_multiplier = diff.maintenance_modifier.player
    else:
        empire.maintenance_multiplier = diff.maintenance_modifier.ai
    
    # AI-specific settings
    if not empire.is_player:
        empire.ai_decision_noise = diff.ai_intelligence.decision_noise
        empire.ai_information_access = diff.ai_intelligence.information_access
        empire.ai_planning_horizon = diff.ai_intelligence.planning_horizon
        empire.ai_war_threshold = diff.diplomacy_modifier.war_threshold
        empire.ai_forgiveness = diff.diplomacy_modifier.ai_forgiveness

function get_event_modifier(difficulty):
    diff = DIFFICULTY_LEVELS[difficulty]
    return {
        frequency: diff.event_modifier.frequency,
        negative_bias: diff.event_modifier.negative_bias,
        monster_strength: diff.event_modifier.monster_strength
    }

function get_guardian_stats(difficulty):
    return DIFFICULTY_LEVELS[difficulty].guardian_stats

function get_coalition_probability(difficulty):
    return DIFFICULTY_LEVELS[difficulty].diplomacy_modifier.coalition_probability

function check_coalition_formation(leading_empire, difficulty):
    if random() > get_coalition_probability(difficulty):
        return false
    
    # Calculate power ratio
    leader_power = calculate_empire_power(leading_empire)
    average_power = calculate_average_ai_power()
    
    if leader_power / average_power < COALITION_LEADER_THRESHOLD:
        return false
    
    # Form coalition
    for empire in ai_empires:
        if empire != leading_empire:
            empire.join_coalition_against(leading_empire)
    
    return true
```

---

## Difficulty by Race Recommendations

### Beginner-Friendly Races (Recommended for Simple/Easy)

| Race | Difficulty Rating | Why Beginner-Friendly |
|------|-------------------|----------------------|
| Hamsters | ★☆☆☆☆ | Balanced, diplomatic bonuses |
| Ants | ★★☆☆☆ | Strong production, simple strategy |
| Mice | ★★☆☆☆ | Tech advantage, automated factories |
| Rabbits | ★★☆☆☆ | Population boom, quantity over quality |

### Intermediate Races (Recommended for Average/Hard)

| Race | Difficulty Rating | Challenge Factors |
|------|-------------------|-------------------|
| Rats | ★★★☆☆ | Research focus, need to stay ahead |
| Hermit Crabs | ★★★☆☆ | Defensive, slow expansion |
| Guinea Pigs | ★★★☆☆ | Aggressive play required |

### Expert Races (Recommended for Hard/Impossible)

| Race | Difficulty Rating | Challenge Factors |
|------|-------------------|-------------------|
| Ferrets | ★★★★☆ | Glass cannon, precision needed |
| Budgies | ★★★★☆ | Tactical mastery required |
| Chameleons | ★★★★★ | Complex espionage management |

---

## Achievements by Difficulty

### Completion Achievements

| Achievement | Requirement |
|-------------|-------------|
| First Steps | Win any victory on Simple |
| Getting Started | Win any victory on Easy |
| Competent Commander | Win any victory on Average |
| Skilled Strategist | Win any victory on Hard |
| Master of Orion | Win any victory on Impossible |

### Challenge Achievements

| Achievement | Requirement |
|-------------|-------------|
| Easy Champion | Win with all 10 races on Easy |
| Balanced Master | Win both victory types on Average |
| Hardcore Hamster | Win with Hamsters on Impossible |
| Against All Odds | Win Domination on Impossible |
| Master Diplomat | Win Diplomatic on Hard+ difficulty |

### Speedrun Achievements

| Achievement | Requirement |
|-------------|-------------|
| Swift Conquest | Win in under 100 turns on Average |
| Blitz Victory | Win in under 75 turns on Hard |
| Lightning Strike | Win in under 50 turns on any difficulty |

---

## Edge Cases

### Difficulty Change Mid-Game

Difficulty cannot be changed after game start. All modifiers are locked at game creation.

### Custom Difficulty

Custom difficulty allows individual modifier adjustment:
- Each modifier can be set independently
- Score multiplier calculated from average of all modifiers
- Achievements disabled if any modifier easier than Average

#### Custom Difficulty Parameters Schema

```json
{
  "custom_difficulty_parameters": [
    {
      "id": "player_production",
      "name": "Player Production",
      "category": "economy",
      "type": "multiplier",
      "min": 0.50,
      "max": 2.00,
      "default": 1.00,
      "step": 0.05,
      "description": "Multiplier applied to all player production output"
    },
    {
      "id": "ai_production",
      "name": "AI Production",
      "category": "economy",
      "type": "multiplier",
      "min": 0.50,
      "max": 2.00,
      "default": 1.00,
      "step": 0.05,
      "description": "Multiplier applied to all AI production output"
    },
    {
      "id": "player_research_cost",
      "name": "Player Research Cost",
      "category": "research",
      "type": "multiplier",
      "min": 0.50,
      "max": 2.00,
      "default": 1.00,
      "step": 0.05,
      "description": "Multiplier on player technology costs"
    },
    {
      "id": "ai_research_cost",
      "name": "AI Research Cost",
      "category": "research",
      "type": "multiplier",
      "min": 0.50,
      "max": 2.00,
      "default": 1.00,
      "step": 0.05,
      "description": "Multiplier on AI technology costs"
    },
    {
      "id": "player_combat_attack",
      "name": "Player Attack Bonus",
      "category": "combat",
      "type": "additive_percentage",
      "min": -0.20,
      "max": 0.20,
      "default": 0.00,
      "step": 0.05,
      "description": "Additive bonus/penalty to player hit chance"
    },
    {
      "id": "player_combat_defense",
      "name": "Player Defense Bonus",
      "category": "combat",
      "type": "additive_percentage",
      "min": -0.20,
      "max": 0.20,
      "default": 0.00,
      "step": 0.05,
      "description": "Additive bonus/penalty to player evasion"
    },
    {
      "id": "ai_combat_attack",
      "name": "AI Attack Bonus",
      "category": "combat",
      "type": "additive_percentage",
      "min": -0.20,
      "max": 0.20,
      "default": 0.00,
      "step": 0.05,
      "description": "Additive bonus/penalty to AI hit chance"
    },
    {
      "id": "ai_combat_defense",
      "name": "AI Defense Bonus",
      "category": "combat",
      "type": "additive_percentage",
      "min": -0.20,
      "max": 0.20,
      "default": 0.00,
      "step": 0.05,
      "description": "Additive bonus/penalty to AI evasion"
    },
    {
      "id": "player_ground_combat",
      "name": "Player Ground Combat",
      "category": "combat",
      "type": "additive_percentage",
      "min": -0.25,
      "max": 0.25,
      "default": 0.00,
      "step": 0.05,
      "description": "Additive bonus/penalty to player ground combat"
    },
    {
      "id": "ai_ground_combat",
      "name": "AI Ground Combat",
      "category": "combat",
      "type": "additive_percentage",
      "min": -0.25,
      "max": 0.25,
      "default": 0.00,
      "step": 0.05,
      "description": "Additive bonus/penalty to AI ground combat"
    },
    {
      "id": "player_growth",
      "name": "Player Growth Rate",
      "category": "economy",
      "type": "multiplier",
      "min": 0.50,
      "max": 1.50,
      "default": 1.00,
      "step": 0.05,
      "description": "Multiplier on player population growth"
    },
    {
      "id": "ai_growth",
      "name": "AI Growth Rate",
      "category": "economy",
      "type": "multiplier",
      "min": 0.50,
      "max": 1.50,
      "default": 1.00,
      "step": 0.05,
      "description": "Multiplier on AI population growth"
    },
    {
      "id": "player_maintenance",
      "name": "Player Ship Maintenance",
      "category": "economy",
      "type": "multiplier",
      "min": 0.50,
      "max": 2.00,
      "default": 1.00,
      "step": 0.05,
      "description": "Multiplier on player fleet upkeep costs"
    },
    {
      "id": "ai_maintenance",
      "name": "AI Ship Maintenance",
      "category": "economy",
      "type": "multiplier",
      "min": 0.50,
      "max": 2.00,
      "default": 1.00,
      "step": 0.05,
      "description": "Multiplier on AI fleet upkeep costs"
    },
    {
      "id": "player_spy_success",
      "name": "Player Spy Success",
      "category": "espionage",
      "type": "additive_percentage",
      "min": -0.30,
      "max": 0.30,
      "default": 0.00,
      "step": 0.05,
      "description": "Additive bonus/penalty to player spy mission success"
    },
    {
      "id": "ai_spy_success",
      "name": "AI Spy Success",
      "category": "espionage",
      "type": "additive_percentage",
      "min": -0.30,
      "max": 0.30,
      "default": 0.00,
      "step": 0.05,
      "description": "Additive bonus/penalty to AI spy mission success"
    },
    {
      "id": "player_spy_cost",
      "name": "Player Spy Cost",
      "category": "espionage",
      "type": "multiplier",
      "min": 0.50,
      "max": 2.00,
      "default": 1.00,
      "step": 0.05,
      "description": "Multiplier on player spy training costs"
    },
    {
      "id": "event_frequency",
      "name": "Event Frequency",
      "category": "events",
      "type": "multiplier",
      "min": 0.25,
      "max": 2.00,
      "default": 1.00,
      "step": 0.05,
      "description": "Multiplier on random event occurrence rate"
    },
    {
      "id": "negative_event_bias",
      "name": "Negative Event Bias",
      "category": "events",
      "type": "additive_percentage",
      "min": -0.50,
      "max": 0.50,
      "default": 0.00,
      "step": 0.05,
      "description": "Shifts event balance toward negative (positive value) or positive (negative value)"
    },
    {
      "id": "monster_strength",
      "name": "Monster Strength",
      "category": "events",
      "type": "multiplier",
      "min": 0.50,
      "max": 2.00,
      "default": 1.00,
      "step": 0.10,
      "description": "Multiplier on space monster HP and damage"
    },
    {
      "id": "coalition_probability",
      "name": "AI Coalition Chance",
      "category": "diplomacy",
      "type": "percentage",
      "min": 0.00,
      "max": 1.00,
      "default": 0.25,
      "step": 0.05,
      "description": "Probability that AI empires will form anti-player coalition"
    },
    {
      "id": "ai_war_threshold",
      "name": "AI War Eagerness",
      "category": "diplomacy",
      "type": "additive_integer",
      "min": -50,
      "max": 50,
      "default": 0,
      "step": 5,
      "description": "Modifier to AI war declaration threshold (negative = more eager)"
    },
    {
      "id": "ai_forgiveness",
      "name": "AI Forgiveness",
      "category": "diplomacy",
      "type": "multiplier",
      "min": 0.25,
      "max": 2.00,
      "default": 1.00,
      "step": 0.05,
      "description": "Multiplier on AI relation recovery speed"
    },
    {
      "id": "council_threshold",
      "name": "Council Formation",
      "category": "diplomacy",
      "type": "percentage",
      "min": 0.30,
      "max": 0.70,
      "default": 0.50,
      "step": 0.05,
      "description": "Galaxy colonization percentage to trigger council"
    },
    {
      "id": "bribe_effectiveness",
      "name": "Bribe Effectiveness",
      "category": "diplomacy",
      "type": "multiplier",
      "min": 0.25,
      "max": 2.00,
      "default": 1.00,
      "step": 0.05,
      "description": "Multiplier on council vote bribe effectiveness"
    },
    {
      "id": "ai_decision_noise",
      "name": "AI Decision Quality",
      "category": "ai",
      "type": "noise_integer",
      "min": 0,
      "max": 50,
      "default": 10,
      "step": 5,
      "description": "Random noise added to AI decisions (0 = perfect, higher = worse)"
    },
    {
      "id": "ai_information_level",
      "name": "AI Information Access",
      "category": "ai",
      "type": "enum",
      "options": ["fog_of_war", "limited", "normal", "extended", "omniscient"],
      "default": "normal",
      "description": "How much information AI has about player activities"
    },
    {
      "id": "starting_population",
      "name": "Starting Population",
      "category": "starting",
      "type": "integer",
      "min": 30,
      "max": 60,
      "default": 40,
      "step": 5,
      "description": "Player homeworld starting population"
    },
    {
      "id": "starting_factories",
      "name": "Starting Factories",
      "category": "starting",
      "type": "integer",
      "min": 20,
      "max": 50,
      "default": 30,
      "step": 5,
      "description": "Player homeworld starting factory count"
    },
    {
      "id": "starting_scouts",
      "name": "Starting Scouts",
      "category": "starting",
      "type": "integer",
      "min": 0,
      "max": 5,
      "default": 1,
      "step": 1,
      "description": "Number of scout ships player starts with"
    },
    {
      "id": "starting_fighters",
      "name": "Starting Fighters",
      "category": "starting",
      "type": "integer",
      "min": 0,
      "max": 3,
      "default": 0,
      "step": 1,
      "description": "Number of fighter ships player starts with"
    },
    {
      "id": "starting_reserve",
      "name": "Starting Reserve BC",
      "category": "starting",
      "type": "integer",
      "min": 0,
      "max": 200,
      "default": 0,
      "step": 25,
      "description": "Player starting treasury in BC"
    },
    {
      "id": "guardian_hp_multiplier",
      "name": "Guardian HP",
      "category": "guardian",
      "type": "multiplier",
      "min": 0.50,
      "max": 1.50,
      "default": 1.00,
      "step": 0.10,
      "description": "Multiplier on Guardian of Orion base HP (32000)"
    },
    {
      "id": "guardian_armor_multiplier",
      "name": "Guardian Armor",
      "category": "guardian",
      "type": "multiplier",
      "min": 2.0,
      "max": 8.0,
      "default": 4.0,
      "step": 0.5,
      "description": "Guardian damage reduction multiplier"
    }
  ]
}
```

#### Custom Difficulty Score Calculation

```pseudocode
function calculate_custom_difficulty_score(settings):
    # Weight each parameter by its impact
    weights = {
        "player_production": 1.0,
        "ai_production": 1.0,
        "player_research_cost": 0.8,
        "ai_research_cost": 0.8,
        "player_combat_attack": 0.6,
        "player_combat_defense": 0.6,
        "ai_combat_attack": 0.6,
        "ai_combat_defense": 0.6,
        "player_growth": 0.5,
        "ai_growth": 0.5,
        "event_frequency": 0.3,
        "monster_strength": 0.3,
        "coalition_probability": 0.4,
        "ai_decision_noise": 0.5
    }
    
    # Calculate deviation from Average (index 2)
    total_weighted_deviation = 0
    total_weight = 0
    
    for param in settings:
        if param.id in weights:
            # Normalize deviation: 0 = Average, -1 = Simple, +1 = Impossible
            deviation = calculate_deviation(param.value, param.default, param.min, param.max)
            total_weighted_deviation += deviation * weights[param.id]
            total_weight += weights[param.id]
    
    # Map to difficulty index (0-4)
    average_deviation = total_weighted_deviation / total_weight
    difficulty_score = 2 + (average_deviation * 2)  # Center on Average (2)
    
    return clamp(difficulty_score, 0, 4)

function get_score_multiplier(difficulty_score):
    # Score multiplier for leaderboards
    # Simple = 0.5x, Easy = 0.75x, Average = 1.0x, Hard = 1.5x, Impossible = 2.0x
    multipliers = [0.50, 0.75, 1.00, 1.50, 2.00]
    return interpolate(multipliers, difficulty_score)
```

### Multiplayer Difficulty

In multiplayer games:
- All human players use the same difficulty setting
- AI empires (if any) use selected difficulty for AI-specific modifiers
- Combat modifiers do not apply to human vs. human battles

### Minimum Viable Empire

Even with Impossible modifiers, player must be able to:
- Build 1 factory per turn minimum at start
- Research tier 1 tech within 20 turns
- Reach neighboring star with starting range tech
- Survive first 50 turns without AI aggression (grace period)

---

## Worked Examples

### Example 1: Production Comparison (Turn 1)

**Scenario:** Ant empire (AI) vs Hamster empire (Player) on Hard difficulty

**Hamster (Player):**
```
Starting Population: 40
Starting Factories: 30
Base Production: (40 × 0.5) + (30 × 1.0) = 50 BC
Racial Modifier: 1.00 (Hamsters)
Difficulty Modifier: 0.90 (Player on Hard)
Effective Production: 50 × 1.00 × 0.90 = 45 BC/turn
```

**Ant (AI):**
```
Starting Population: 40 (AI always uses Average start)
Starting Factories: 30
Base Production: (40 × 0.5) + (30 × 1.0) = 50 BC
Racial Modifier: 1.50 (Ants +50%)
Difficulty Modifier: 1.25 (AI on Hard)
Effective Production: 50 × 1.50 × 1.25 = 93.75 BC/turn
```

**Ratio:** AI produces 2.08× as much as player on turn 1.

---

### Example 2: Research Race (Tier 5 Tech)

**Scenario:** Player vs Rat AI on Impossible, both racing for Tier 5 tech

**Player:**
```
Base Tech Cost: 500 RP
Player Cost Modifier: 1.00
Actual Cost: 500 × 1.00 = 500 RP
```

**Rat AI:**
```
Base Tech Cost: 500 RP
AI Cost Modifier: 0.50 (Impossible)
Racial Modifier: 0.67 (Rats get +50% efficiency, inverted for cost)
Actual Cost: 500 × 0.50 × 0.67 = 167.5 RP
```

**Result:** Rat AI needs only 33.5% of the RP the player needs.

---

### Example 3: Guardian Fight Comparison

**Scenario:** Defeating Guardian on Average vs Impossible

**Average:**
```
Guardian HP: 32,000
Armor Multiplier: 4.0×
Effective HP: 128,000
Shield Class: XV (absorbs 15 damage/hit)
```

**Impossible:**
```
Guardian HP: 48,000
Armor Multiplier: 6.0×
Effective HP: 288,000
Shield Class: XX (absorbs 20 damage/hit)
```

**Comparison:**
- Impossible Guardian has 2.25× the effective HP
- Requires significantly more late-game tech to defeat
- Player combat penalty (-10% attack/defense) makes fight even harder

---

## Related Documents

- `factory-formulas.md` - Production calculations
- `population-growth.md` - Growth rate calculations
- `research-formulas.md` - Tech cost calculations
- `combat-algorithm.md` - Combat modifiers application
- `espionage.md` - Spy success calculations
- `random-events.md` - Event frequency and monster stats
- `council.md` - Council voting behavior
- `ai-implementation.md` - AI decision quality

---

*Last Updated: 2026-03-22*
*Specification: spec-023 - Difficulty Level Modifiers*
