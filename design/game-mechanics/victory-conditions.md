# Victory Conditions - Complete Specification

## Overview

This document specifies the complete algorithms, formulas, and data structures for all victory conditions in Hamster of Orion. Victory can be achieved through five distinct paths: **Domination**, **Discovery (Orion)**, **Diplomatic (Council)**, **Survival (Conquest)**, and **Transcendence (Hidden)**. All mechanics are faithful to Master of Orion 1 with exact formulas for implementation.

Victory condition checks occur **at the start of each turn** after the production phase completes. The game evaluates all victory conditions in priority order and triggers the first satisfied condition.

---

## 1. Victory Check Algorithm

### 1.1 Turn-by-Turn Checking Logic

Victory conditions are evaluated every turn in a specific order:

```pseudocode
function CheckVictoryConditions(game_state):
    // Priority 1: Survival (instant trigger - only one empire remains)
    if CountLivingEmpires(game_state) == 1:
        surviving_empire = GetLastLivingEmpire(game_state)
        return VictoryResult("survival", surviving_empire)
    
    // Priority 2: Discovery (Orion colonized)
    if game_state.orion.colonized:
        colonizer = game_state.orion.owner
        return VictoryResult("discovery", colonizer)
    
    // Priority 3: Domination (2/3 population)
    for each empire in game_state.living_empires:
        if CheckDominationVictory(empire, game_state):
            return VictoryResult("domination", empire)
    
    // Priority 4: Council (if council is in session and winner exists)
    if game_state.council.in_session and game_state.council.winner:
        if game_state.council.winner_accepted:
            return VictoryResult("diplomatic", game_state.council.winner)
    
    // Priority 5: Transcendence (hidden check)
    for each empire in game_state.living_empires:
        if CheckTranscendenceVictory(empire, game_state):
            return VictoryResult("transcendence", empire)
    
    // No victory
    return null
```

### 1.2 Constants

```json
{
  "victory_check_constants": {
    "CHECK_PHASE": "start_of_turn",
    "CHECK_AFTER": "production_phase",
    "PRIORITY_SURVIVAL": 1,
    "PRIORITY_DISCOVERY": 2,
    "PRIORITY_DOMINATION": 3,
    "PRIORITY_DIPLOMATIC": 4,
    "PRIORITY_TRANSCENDENCE": 5
  }
}
```

---

## 2. Domination Victory

### 2.1 Overview

Domination victory is achieved when a single empire controls **two-thirds (2/3) or more** of the total galactic population. This represents overwhelming demographic superiority that makes further resistance futile.

### 2.2 Formula

```
Domination_Achieved = (Empire_Population / Galaxy_Total_Population) >= DOMINATION_THRESHOLD
```

**Constants:**
- `DOMINATION_THRESHOLD` = 0.6667 (66.67%, exactly 2/3)

### 2.3 Population Calculation

```pseudocode
function CalculateGalaxyPopulation(game_state):
    total_population = 0
    
    for each empire in game_state.all_empires:
        for each colony in empire.colonies:
            total_population += colony.population
    
    return total_population

function CalculateEmpirePopulation(empire):
    empire_population = 0
    
    for each colony in empire.colonies:
        empire_population += colony.population
    
    return empire_population

function CheckDominationVictory(empire, game_state):
    galaxy_pop = CalculateGalaxyPopulation(game_state)
    empire_pop = CalculateEmpirePopulation(empire)
    
    // Handle edge case: zero total population
    if galaxy_pop == 0:
        return false
    
    ratio = empire_pop / galaxy_pop
    
    return ratio >= DOMINATION_THRESHOLD
```

### 2.4 Population Counting Rules

| Source | Counts? | Notes |
|--------|---------|-------|
| Colony population | Yes | All population on owned planets |
| Population in transit | Yes | Colonists en route to new worlds |
| Transports | Yes | Ground troops count as population |
| Captured planets (same turn) | Yes | Immediately counted |
| Rebels | No | Population in rebellion not counted for owner |
| Recently conquered (unrest) | Yes | Still counts as owner's population |

### 2.5 Algorithm with Edge Cases

```pseudocode
function CheckDominationVictoryComplete(empire, game_state):
    // Calculate total galactic population
    galaxy_pop = 0
    empire_pop = 0
    
    for each e in game_state.all_empires:
        if e.is_eliminated:
            continue
            
        for each colony in e.colonies:
            pop = colony.population
            
            // Subtract rebels if in unrest
            if colony.rebellion_status == "active":
                pop = pop * (1.0 - colony.rebel_percentage)
            
            galaxy_pop += pop
            
            if e == empire:
                empire_pop += pop
        
        // Add population in transit
        for each transport in e.transports_in_flight:
            pop = transport.colonist_count
            galaxy_pop += pop
            if e == empire:
                empire_pop += pop
    
    // Edge case: only one empire with any population
    if galaxy_pop == 0:
        return false
    
    // Calculate ratio with precision
    ratio = empire_pop / galaxy_pop
    
    // Use integer math for determinism
    // Ratio >= 2/3 equivalent to: empire_pop * 3 >= galaxy_pop * 2
    return (empire_pop * 3) >= (galaxy_pop * 2)
```

### 2.6 Worked Example

**Scenario:** Turn 150, 4 empires remain

| Empire | Population (millions) | Percentage |
|--------|----------------------|------------|
| Rabbits | 450 | 45% |
| Hamsters | 250 | 25% |
| Rats | 200 | 20% |
| Ants | 100 | 10% |
| **Total** | **1000** | 100% |

```
Rabbits: 450 / 1000 = 45% < 66.67% → NO VICTORY

(Rabbits continue expanding...)

Turn 175:
| Empire | Population (millions) | Percentage |
|--------|----------------------|------------|
| Rabbits | 720 | 67.3% |
| Hamsters | 180 | 16.8% |
| Rats | 120 | 11.2% |
| Ants | 50 | 4.7% |
| **Total** | **1070** | 100% |

Rabbits: 720 / 1070 = 67.3% >= 66.67% → DOMINATION VICTORY
```

### 2.7 Victory Trigger

When domination threshold is reached:
1. Victory check passes at start of turn
2. Victory screen displays
3. Player can accept victory (game ends) or continue playing (sandbox mode)

**Victory Message:**
> "Your empire spans the galaxy. Two-thirds of all living beings owe allegiance to you. The High Council has no choice but to proclaim you Master of Orion by unanimous consent. The Wheel turns in your favor."

---

## 3. Discovery Victory (Orion)

### 3.1 Overview

Discovery victory is achieved by defeating the **Guardian of Orion**, an ancient automated warship protecting the planet Orion at the galactic center, then colonizing the planet and claiming the **Cosmic Wheel**.

### 3.2 Requirements

1. **Reach Orion system** (galactic center)
2. **Defeat the Guardian of Orion** in combat
3. **Colonize Orion planet** (send colony ship)
4. **Claim the Cosmic Wheel** (automatic upon colonization)

### 3.3 Guardian of Orion Statistics

```json
{
  "guardian_of_orion": {
    "id": "guardian_of_orion",
    "name": "Guardian of Orion",
    "type": "ancient_warship",
    "ship_class": "titan_equivalent",
    
    "combat_stats": {
      "hit_points": 3000,
      "hull_structure": "indestructible_frame",
      "attack_level": 12,
      "defense_level": 10,
      "initiative": 10,
      "movement_speed": 5
    },
    
    "defensive_systems": {
      "shield_class": 15,
      "shield_regeneration_per_round": 50,
      "armor_type": "adamantium",
      "armor_reduction": 10,
      "ecm_level": 8
    },
    
    "weapons": [
      {
        "type": "death_ray",
        "count": 1,
        "damage": "instant_kill",
        "range": 10,
        "notes": "Kills one ship per turn regardless of size"
      },
      {
        "type": "scatter_pack_missiles",
        "count": 5,
        "damage_per_missile": 20,
        "missiles_per_salvo": 5,
        "range": "unlimited"
      },
      {
        "type": "plasma_torpedo",
        "count": 3,
        "damage": 150,
        "range": 8
      },
      {
        "type": "heavy_beam",
        "count": 4,
        "damage_min": 15,
        "damage_max": 45,
        "range": 6
      }
    ],
    
    "special_systems": [
      {
        "type": "damper_field",
        "effect": "nullifies_all_special_systems",
        "range": 8,
        "notes": "Disables cloaking, teleporters, subspace fields, etc."
      },
      {
        "type": "high_energy_focus",
        "effect": "beam_damage_x2",
        "notes": "All beam weapons deal double damage"
      },
      {
        "type": "advanced_targeting",
        "effect": "cannot_miss",
        "notes": "All attacks ignore defense bonuses"
      }
    ],
    
    "immunities": [
      "biological_weapons",
      "psionic_attacks",
      "stasis_field",
      "repulsor_beam",
      "black_hole_generator",
      "web_snare"
    ],
    
    "behavior": {
      "patrol_area": "orion_system_only",
      "engagement_range": "entire_system",
      "retreat_threshold": "never",
      "targeting_priority": ["colony_ships", "largest_ship", "closest_ship"],
      "respawn_turns": 50,
      "respawn_condition": "orion_not_colonized"
    }
  }
}
```

### 3.4 Guardian Combat Algorithm

```pseudocode
function ResolveGuardianCombat(attacking_fleet, guardian):
    // Guardian always has initiative
    guardian.acts_first = true
    
    // Combat loop
    while attacking_fleet.has_ships() and guardian.hit_points > 0:
        // Guardian turn
        GuardianCombatTurn(guardian, attacking_fleet)
        
        if not attacking_fleet.has_ships():
            return CombatResult("guardian_victory", attacking_fleet.losses)
        
        // Attacker turn
        for each ship in attacking_fleet.ships:
            AttackerCombatTurn(ship, guardian)
        
        // Check guardian destruction
        if guardian.hit_points <= 0:
            return CombatResult("attacker_victory", attacking_fleet.survivors)
    
    return CombatResult("guardian_victory", attacking_fleet.losses)

function GuardianCombatTurn(guardian, attacking_fleet):
    // Apply damper field (disables specials)
    for each ship in attacking_fleet.ships:
        ship.specials_disabled = true
    
    // Death Ray targets most valuable ship
    target = SelectHighestValueTarget(attacking_fleet)
    if target:
        DestroyShip(target)  // Instant kill
    
    // Fire scatter pack missiles at all ships
    for i in range(guardian.scatter_pack_count):
        targets = SelectMultipleTargets(attacking_fleet, 5)
        for t in targets:
            ApplyDamage(t, 20)
    
    // Fire plasma torpedoes at remaining large ships
    for torpedo in guardian.plasma_torpedoes:
        target = SelectLargestShip(attacking_fleet)
        if target:
            ApplyDamage(target, 150)
    
    // Fire heavy beams
    for beam in guardian.heavy_beams:
        target = SelectClosestShip(attacking_fleet)
        if target:
            damage = Random(15, 45) * 2  // High energy focus
            ApplyDamage(target, damage)
```

### 3.5 Minimum Fleet Requirements (Estimated)

Based on Guardian statistics, successful assaults typically require:

| Ship Class | Minimum Count | Recommended Count | Notes |
|------------|--------------|-------------------|-------|
| Scout | 0 | 0 | Useless vs Guardian |
| Destroyer | 0 | 0 | Too fragile |
| Cruiser | 20+ | 30+ | Attrition fleet |
| Battleship | 10+ | 15+ | Primary damage dealers |
| Dreadnought | 5+ | 8+ | Best value |
| Titan | 3+ | 5+ | Can absorb Death Ray hits |

**Technology Requirements:**
- Weapons: Plasma Cannon or better (Tier 8+)
- Shields: Class V minimum, Class X recommended
- Armor: Neutronium or Adamantium
- Propulsion: Ion Drive minimum (to reach Orion)

### 3.6 Victory Trigger Algorithm

```pseudocode
function CheckDiscoveryVictory(game_state):
    orion = game_state.systems.orion
    
    // Check if Guardian is defeated
    if not orion.guardian_defeated:
        return false
    
    // Check if Orion is colonized
    if not orion.planet.colonized:
        return false
    
    // Discovery victory achieved
    return true

function OnGuardianDefeated(game_state, defeating_empire):
    orion = game_state.systems.orion
    orion.guardian_defeated = true
    orion.guardian_defeat_turn = game_state.current_turn
    orion.guardian_defeated_by = defeating_empire
    
    // Grant Death Ray technology
    defeating_empire.grant_technology("death_ray")
    
    // Roll for additional Ancient technologies
    additional_techs = Random(2, 5)
    for i in range(additional_techs):
        field = RandomChoice(TECH_FIELDS)
        tech = GetHighestUnknownTech(defeating_empire, field)
        if tech:
            defeating_empire.grant_technology(tech)
    
    // Display notification
    ShowNotification("Guardian Defeated", 
        "The Guardian of Orion has fallen. The way to the Cosmic Wheel is open!")

function OnOrionColonized(game_state, colonizing_empire):
    orion = game_state.systems.orion
    orion.planet.colonized = true
    orion.planet.owner = colonizing_empire
    
    // Trigger Discovery Victory
    TriggerVictory("discovery", colonizing_empire)
```

### 3.7 Guardian Respawn Rules

```pseudocode
function CheckGuardianRespawn(game_state):
    orion = game_state.systems.orion
    
    // No respawn if Orion colonized
    if orion.planet.colonized:
        return false
    
    // No respawn if not defeated
    if not orion.guardian_defeated:
        return false
    
    // Check respawn timer
    turns_since_defeat = game_state.current_turn - orion.guardian_defeat_turn
    
    if turns_since_defeat >= GUARDIAN_RESPAWN_TURNS:
        orion.guardian_defeated = false
        orion.guardian = CreateGuardian()
        ShowNotification("Guardian Returns",
            "A new Guardian has emerged to protect Orion!")
        return true
    
    return false
```

**Constants:**
- `GUARDIAN_RESPAWN_TURNS` = 50

### 3.8 Victory Message

> "The Guardian falls. The barrier dissolves. You descend to Orion's surface and place your paw upon the Cosmic Wheel. Its power flows through you, through your people, through your civilization. The Wheel has chosen. You are the Master of Orion."

---

## 4. Diplomatic Victory (Council)

### 4.1 Overview

Diplomatic victory is achieved by winning a **two-thirds majority vote** in the High Council. The Council forms when 50% or more of habitable planets are colonized and meets every 25 turns thereafter.

Full Council mechanics are documented in `design/diplomacy/council.md`. This section summarizes the victory-relevant algorithms.

### 4.2 Council Formation Check

```pseudocode
function CheckCouncilFormation(game_state):
    colonized_planets = 0
    habitable_planets = 0
    
    for each system in game_state.systems:
        for each planet in system.planets:
            if planet.is_habitable:
                habitable_planets += 1
                if planet.colonized:
                    colonized_planets += 1
    
    return (colonized_planets / habitable_planets) >= COUNCIL_FORMATION_THRESHOLD
```

**Constants:**
- `COUNCIL_FORMATION_THRESHOLD` = 0.50 (50%)
- `COUNCIL_INTERVAL` = 25 turns
- `VICTORY_VOTE_THRESHOLD` = 0.6667 (2/3 majority)

### 4.3 Vote Allocation

```
Vote_Weight(empire) = Empire_Population / Total_Galaxy_Population × 100%
```

Population calculation follows the same rules as Domination victory.

### 4.4 Council Victory Check

```pseudocode
function CheckDiplomaticVictory(game_state):
    council = game_state.council
    
    // No victory if council not formed
    if not council.formed:
        return false
    
    // No victory if not in session
    if not council.in_session:
        return false
    
    // Calculate votes for winner
    winner = council.leading_candidate
    winner_votes = council.votes_for[winner]
    total_effective_votes = 100.0 - council.abstention_total
    
    // Check victory threshold
    required_votes = total_effective_votes * VICTORY_VOTE_THRESHOLD
    
    if winner_votes >= required_votes:
        // Offer victory acceptance
        if winner.is_player:
            choice = PromptPlayer("Accept the title of Master of Orion?")
            if choice == "accept":
                return VictoryResult("diplomatic", winner)
            else:
                HandleVictoryRejection(winner, game_state)
                return false
        else:
            // AI always accepts
            return VictoryResult("diplomatic", winner)
    
    return false
```

### 4.5 Victory Acceptance/Rejection

**Winner Accepts:**
- Game ends with Diplomatic Victory
- Final screen displays vote totals

**Winner Rejects (Player Only):**
- Game continues
- -30 relation with all empires who voted for you
- Cannot win Council for next 50 turns
- "Refused Mandate" reputation flag applied

**Opponent Wins, Player Rejects:**
- Player declares war on winner
- All other rejecting races become temporary allies
- All accepting races become enemies
- "Galactic War" state until resolution

### 4.6 Victory Message

> "The High Council convenes. One by one, the races cast their votes. The tally rises. Two-thirds achieved. The Council proclaims you Master of Orion. The galaxy bows to your legitimacy. Your rule is righteous."

---

## 5. Survival Victory (Conquest)

### 5.1 Overview

Survival victory is achieved when only **one empire remains** in the galaxy. All other empires must be eliminated through conquest, rebellion collapse, or voluntary surrender.

### 5.2 Empire Elimination Conditions

An empire is considered **eliminated** when:

```pseudocode
function IsEmpireEliminated(empire):
    // No colonies remaining
    if empire.colonies.count == 0:
        // Check for any ships in flight with colonists
        for each fleet in empire.fleets:
            if fleet.has_colony_ships:
                return false  // Can still colonize
        return true
    
    return false
```

### 5.3 Victory Check Algorithm

```pseudocode
function CheckSurvivalVictory(game_state):
    living_empires = []
    
    for each empire in game_state.all_empires:
        if not IsEmpireEliminated(empire):
            living_empires.append(empire)
    
    if living_empires.count == 1:
        return VictoryResult("survival", living_empires[0])
    
    if living_empires.count == 0:
        // Edge case: mutual destruction
        return VictoryResult("mutual_destruction", null)
    
    return false
```

### 5.4 Elimination Tracking

```pseudocode
function OnColonyLost(empire, colony, game_state):
    // Check if empire is eliminated
    if IsEmpireEliminated(empire):
        EliminateEmpire(empire, game_state)

function EliminateEmpire(empire, game_state):
    empire.eliminated = true
    empire.elimination_turn = game_state.current_turn
    
    // Destroy remaining ships (optional rule)
    for each fleet in empire.fleets:
        if not fleet.has_colony_ships:
            DestroyFleet(fleet)
    
    // Check for survival victory
    CheckSurvivalVictory(game_state)
    
    // Notify all empires
    BroadcastNotification("Empire Eliminated",
        empire.name + " has been wiped from the galaxy!")
```

### 5.5 Edge Cases

**Colony Ships in Transit:**
- Empire with no colonies but colony ships in flight is NOT eliminated
- Must wait for colony ships to be destroyed or colonize

**Last Two Empires Mutual Destruction:**
- Both eliminate each other on same turn (e.g., mutual bioweapon strikes)
- Result: Draw (rare edge case)
- Display: "Mutual Destruction - No Victor"

**AI Surrender:**
- AI empires may offer surrender when:
  - Population < 10% of victor
  - No hope of recovery
  - War weariness extreme
- Accepting surrender eliminates them immediately
- Rejecting continues war

### 5.6 Victory Message

> "Silence. The galaxy is empty save for your people. No rival civilizations remain. No opposition. No resistance. You are Master of Orion by simple fact: there is no one left to contest the title. In the silence of a dead galaxy, you rule supreme."

---

## 6. Transcendence Victory (Hidden)

### 6.1 Overview

Transcendence is a **hidden victory condition** not explicitly stated in the game. It is achieved by demonstrating "balanced excellence" across all aspects of civilization, proving worthiness to join the Ancient Ones beyond physical existence.

### 6.2 Detection Philosophy

The game tracks various excellence metrics invisibly. When a civilization achieves sufficient balance and mastery, Orion recognizes them without requiring Guardian defeat.

### 6.3 Transcendence Score Calculation

```pseudocode
function CalculateTranscendenceScore(empire, game_state):
    score = 0
    
    // Technology mastery (0-100)
    tech_score = CalculateTechMastery(empire, game_state)
    score += tech_score
    
    // Military strength (0-100)
    military_score = CalculateMilitaryStrength(empire, game_state)
    score += military_score
    
    // Economic power (0-100)
    economic_score = CalculateEconomicPower(empire, game_state)
    score += economic_score
    
    // Diplomatic standing (0-100)
    diplomatic_score = CalculateDiplomaticStanding(empire, game_state)
    score += diplomatic_score
    
    // Population size (0-100)
    population_score = CalculatePopulationScore(empire, game_state)
    score += population_score
    
    // Wisdom/time factor (0-100)
    wisdom_score = CalculateWisdomScore(empire, game_state)
    score += wisdom_score
    
    // Balance bonus (multiplier for well-rounded civilization)
    balance_multiplier = CalculateBalanceMultiplier(
        tech_score, military_score, economic_score,
        diplomatic_score, population_score, wisdom_score
    )
    
    score = score * balance_multiplier
    
    // Apply penalties
    score -= CalculateAtrocityPenalty(empire)
    
    return score
```

### 6.4 Component Formulas

**Technology Mastery (0-100):**
```
tech_score = (Techs_Researched / Total_Possible_Techs) × 100

where:
- Count techs in all 6 fields
- Higher tier techs weight more
- Tier 1-5: 1 point each
- Tier 6-10: 2 points each
- Tier 11+: 3 points each
```

**Military Strength (0-100):**
```
military_score = (Empire_Fleet_Power / Strongest_Fleet_Power) × 100

Fleet_Power = Σ (Ship_Combat_Value × Ship_Count)
```

**Economic Power (0-100):**
```
economic_score = (Empire_Production / Highest_Production) × 100

Production = Total_BC_per_turn + Reserve_BC/100
```

**Diplomatic Standing (0-100):**
```
diplomatic_score = (Average_Relationship + 100) / 2

where relationships range -100 to +100
- Only living races counted
- Alliance = +20 bonus
- Treaty = +10 bonus
```

**Population Score (0-100):**
```
population_score = (Empire_Population / Galaxy_Population) × 150

Capped at 100 (threshold at 66.7% would cap)
```

**Wisdom Score (0-100):**
```
wisdom_score = min(100, (Current_Turn - 100) / 2)

Requires at least turn 100 to start accumulating
Maximum at turn 300+
```

### 6.5 Balance Multiplier

Excellence must be **balanced**. Civilizations that excel in everything receive a bonus:

```pseudocode
function CalculateBalanceMultiplier(scores...):
    // Calculate coefficient of variation
    mean = Average(scores)
    std_dev = StandardDeviation(scores)
    
    if mean == 0:
        return 0.5  // No excellence at all
    
    cv = std_dev / mean  // Coefficient of variation
    
    // Lower CV = more balanced
    // CV of 0 = perfect balance = 1.5× multiplier
    // CV of 0.5 = moderate imbalance = 1.0× multiplier
    // CV of 1.0+ = severe imbalance = 0.5× multiplier
    
    if cv <= 0.2:
        return 1.5  // Perfect balance bonus
    elif cv <= 0.4:
        return 1.25  // Good balance
    elif cv <= 0.6:
        return 1.0   // No modifier
    else:
        return 0.75  // Imbalance penalty
```

### 6.6 Atrocity Penalty

Certain actions disqualify or penalize transcendence pursuit:

| Atrocity | Penalty | Duration |
|----------|---------|----------|
| Used Bio-weapons | -50 | Permanent |
| Destroyed Planet (Stellar Converter) | -75 | Permanent |
| Exterminated Population (Genocide) | -100 | Permanent |
| Broke Treaty | -15 | 50 turns |
| Attacked without declaration | -10 | 25 turns |

### 6.7 Transcendence Threshold

```
TRANSCENDENCE_THRESHOLD = 500

Total Score Required: 500 points after all calculations
```

### 6.8 Victory Check Algorithm

```pseudocode
function CheckTranscendenceVictory(empire, game_state):
    // Only check after turn 150
    if game_state.current_turn < TRANSCENDENCE_MIN_TURN:
        return false
    
    // Cannot have committed major atrocities
    if empire.has_permanent_atrocity:
        return false
    
    // Calculate transcendence score
    score = CalculateTranscendenceScore(empire, game_state)
    
    // Check threshold
    if score >= TRANSCENDENCE_THRESHOLD:
        // Additional check: balance requirement
        if empire.transcendence_balance_multiplier >= 1.0:
            return VictoryResult("transcendence", empire)
    
    return false
```

**Constants:**
- `TRANSCENDENCE_MIN_TURN` = 150
- `TRANSCENDENCE_THRESHOLD` = 500
- `TRANSCENDENCE_BALANCE_REQUIRED` = 1.0 (no imbalance penalty)

### 6.9 Transcendence Trigger

Unlike other victories, transcendence is **not announced in advance**. The player receives no progress bar or hints.

**Trigger Sequence:**
1. Transcendence check passes
2. Special event triggers (not victory screen)
3. Orion barrier dissolves without combat
4. Player receives invitation message
5. Unique transcendence ending plays

### 6.10 Victory Message

> "You did not claim Orion. Orion claimed you."
>
> "The barrier falls away. The Wheel calls. You do not descend in conquest but in invitation. The Ancient Ones whisper: 'You are ready. Join us.'"
>
> "The Wheel turns. Your species begins to glow with inner light. One by one, your people step through portals appearing everywhere. You are not destroying. You are becoming. This is not victory. This is evolution."
>
> *"We have gone ahead. When you are ready, you will understand. The Wheel waits for those with the wisdom to turn it."*

---

## 7. Simultaneous Victory Resolution

### 7.1 Priority Order

When multiple victory conditions are satisfied on the same turn:

| Priority | Victory Type | Reason |
|----------|-------------|--------|
| 1 | Survival | Instantaneous (all others eliminated) |
| 2 | Discovery | Specific achievement (claimed Orion) |
| 3 | Domination | Population milestone |
| 4 | Diplomatic | Council decision |
| 5 | Transcendence | Hidden/special |

### 7.2 Same Priority Ties

If two empires achieve the same victory type simultaneously:

**Domination Tie:**
- Both reach 66.67% on same turn (impossible mathematically)
- Theoretically: Empire with higher absolute population wins

**Discovery Tie:**
- Both colonize Orion same turn (impossible - only one colony)
- First to send colony ship wins

**Survival Tie:**
- Both eliminate each other simultaneously
- Result: Mutual Destruction (no winner)

**Diplomatic Tie:**
- Both candidates reach 66.67% (mathematically possible with abstentions)
- Candidate with higher absolute vote percentage wins
- If still tied: Candidate with higher population wins

**Transcendence Tie:**
- Both reach threshold same turn
- Higher transcendence score wins
- If tied: Higher balance multiplier wins

### 7.3 Algorithm

```pseudocode
function ResolveTiedVictories(victories):
    if victories.count <= 1:
        return victories[0] if victories else null
    
    // Sort by priority
    victories.sort_by(v => v.priority)
    
    // Check for same priority
    if victories[0].priority == victories[1].priority:
        // Same victory type - apply tiebreaker
        return ApplyTiebreaker(victories[0], victories[1])
    
    // Different priorities - highest priority wins
    return victories[0]

function ApplyTiebreaker(v1, v2):
    match v1.type:
        case "domination":
            return v1 if v1.empire.population > v2.empire.population else v2
        case "diplomatic":
            return v1 if v1.vote_percentage > v2.vote_percentage else v2
        case "transcendence":
            return v1 if v1.score > v2.score else v2
        case "survival":
            return MutualDestructionResult()
        default:
            return v1  // Fallback
```

---

## 8. Victory Progress Tracking

### 8.1 Player-Visible Progress

The game displays progress toward each victory condition:

```
╔═══════════════════════════════════════════════════════════════╗
║ VICTORY PROGRESS                                              ║
╠═══════════════════════════════════════════════════════════════╣
║ Domination:    [████████░░░░░░░░░░░░] 42% / 67%              ║
║ Discovery:     Guardian not defeated                          ║
║ Diplomatic:    Council forms in ~35 turns                     ║
║ Survival:      4 empires remaining                            ║
║ Transcendence: ???                                            ║
╚═══════════════════════════════════════════════════════════════╝
```

### 8.2 Transcendence Display

Transcendence progress is **never shown directly**. The "???" display is intentional.

**Optional Hint System (difficulty-dependent):**
- Easy: Shows "Seek balance in all things"
- Normal: Shows "???"
- Hard: No transcendence line at all

### 8.3 Progress Update Frequency

Progress is recalculated:
- Domination: Every turn
- Discovery: On Guardian defeat, on colonization
- Diplomatic: Every turn after Council forms
- Survival: On empire elimination
- Transcendence: Every 10 turns (internal only)

---

## 9. Victory Screen and Aftermath

### 9.1 Victory Screen Components

```
╔═══════════════════════════════════════════════════════════════╗
║                     VICTORY ACHIEVED!                         ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║        [VICTORY TYPE]: [DOMINATION / DISCOVERY / etc.]        ║
║                                                               ║
║  Victory Turn: 175                                            ║
║  Game Year: 2798                                              ║
║  Empire: The Rabbit Hegemony                                  ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────┐      ║
║  │ Final Statistics                                    │      ║
║  ├─────────────────────────────────────────────────────┤      ║
║  │ Total Population: 720 million                       │      ║
║  │ Colonies Owned: 34                                  │      ║
║  │ Technologies Researched: 89                         │      ║
║  │ Ships Built: 412                                    │      ║
║  │ Battles Won: 67                                     │      ║
║  │ Council Votes Won: 2                                │      ║
║  └─────────────────────────────────────────────────────┘      ║
║                                                               ║
║  [Victory Message based on victory type]                      ║
║                                                               ║
║  [Continue Playing]  [New Game]  [View Replay]  [Exit]        ║
╚═══════════════════════════════════════════════════════════════╝
```

### 9.2 Post-Victory Options

| Option | Effect |
|--------|--------|
| Continue Playing | Sandbox mode, no more victory checks |
| New Game | Return to setup screen |
| View Replay | Watch turn-by-turn history |
| Exit | Return to main menu |

### 9.3 Hall of Fame Entry

Victory records the following for Hall of Fame:

```json
{
  "hall_of_fame_entry": {
    "race": "Rabbits",
    "victory_type": "domination",
    "victory_turn": 175,
    "game_year": 2798,
    "difficulty": "hard",
    "galaxy_size": "large",
    "opponents": 7,
    "final_population": 720000000,
    "final_colonies": 34,
    "final_techs": 89,
    "final_fleet_size": 142,
    "timestamp": "2026-03-22T11:46:00Z",
    "score": 15420
  }
}
```

---

## 10. Constants Summary

```json
{
  "VICTORY_CONSTANTS": {
    "domination": {
      "THRESHOLD": 0.6667,
      "CHECK_FREQUENCY": "every_turn"
    },
    
    "discovery": {
      "GUARDIAN_HP": 3000,
      "GUARDIAN_ATTACK": 12,
      "GUARDIAN_DEFENSE": 10,
      "GUARDIAN_SHIELD": 15,
      "GUARDIAN_RESPAWN_TURNS": 50,
      "ORION_RESEARCH_BONUS": 4.0
    },
    
    "diplomatic": {
      "COUNCIL_FORMATION_THRESHOLD": 0.50,
      "COUNCIL_INTERVAL_TURNS": 25,
      "VICTORY_VOTE_THRESHOLD": 0.6667,
      "REJECTION_PENALTY": -30,
      "MANDATE_COOLDOWN_TURNS": 50
    },
    
    "survival": {
      "MIN_EMPIRES_FOR_CHECK": 2,
      "COLONY_SHIP_EXCEPTION": true
    },
    
    "transcendence": {
      "MIN_TURN": 150,
      "THRESHOLD": 500,
      "MIN_BALANCE_MULTIPLIER": 1.0,
      "TECH_WEIGHT_LOW": 1,
      "TECH_WEIGHT_MID": 2,
      "TECH_WEIGHT_HIGH": 3,
      "ATROCITY_BIOWEAPON": -50,
      "ATROCITY_PLANET_DESTROY": -75,
      "ATROCITY_GENOCIDE": -100,
      "ATROCITY_TREATY_BREAK": -15,
      "ATROCITY_SNEAK_ATTACK": -10,
      "CHECK_FREQUENCY": 10
    },
    
    "general": {
      "PRIORITY_SURVIVAL": 1,
      "PRIORITY_DISCOVERY": 2,
      "PRIORITY_DOMINATION": 3,
      "PRIORITY_DIPLOMATIC": 4,
      "PRIORITY_TRANSCENDENCE": 5
    }
  }
}
```

---

## 11. Data Structures (JSON)

### 11.1 Victory State

```json
{
  "victory_state_schema": {
    "game_over": "boolean",
    "victory_type": "string|null (domination|discovery|diplomatic|survival|transcendence)",
    "winner": "empire_id|null",
    "victory_turn": "number|null",
    "victory_details": {
      "domination": {
        "final_population": "number",
        "population_percentage": "number"
      },
      "discovery": {
        "guardian_defeat_turn": "number",
        "colonization_turn": "number",
        "techs_gained": "array<string>"
      },
      "diplomatic": {
        "vote_percentage": "number",
        "votes_received": "number",
        "council_session": "number"
      },
      "survival": {
        "empires_eliminated": "array<empire_id>",
        "final_colonies": "number"
      },
      "transcendence": {
        "final_score": "number",
        "balance_multiplier": "number",
        "component_scores": {
          "technology": "number",
          "military": "number",
          "economic": "number",
          "diplomatic": "number",
          "population": "number",
          "wisdom": "number"
        }
      }
    }
  }
}
```

### 11.2 Victory Progress State

```json
{
  "victory_progress_schema": {
    "domination": {
      "current_percentage": "number",
      "threshold": 0.6667,
      "turns_until_estimate": "number|null"
    },
    "discovery": {
      "guardian_status": "alive|defeated",
      "guardian_defeat_turn": "number|null",
      "orion_colonized": "boolean",
      "can_reach_orion": "boolean"
    },
    "diplomatic": {
      "council_formed": "boolean",
      "council_formation_turn": "number|null",
      "next_council_turn": "number|null",
      "estimated_vote_percentage": "number",
      "is_candidate": "boolean"
    },
    "survival": {
      "empires_remaining": "number",
      "empires_eliminated": "array<empire_id>"
    },
    "transcendence": {
      "hidden": true,
      "internal_score": "number",
      "internal_balance": "number"
    }
  }
}
```

### 11.3 Guardian State

```json
{
  "guardian_state_schema": {
    "exists": "boolean",
    "current_hp": "number",
    "max_hp": 3000,
    "defeated": "boolean",
    "defeated_by": "empire_id|null",
    "defeat_turn": "number|null",
    "respawn_turn": "number|null"
  }
}
```

---

## 12. Worked Examples

### Example 1: Domination Victory Progression

**Turn 100:**
```
Galaxy Population: 500 million
Rabbit Population: 150 million (30%)
Status: 30% / 67% needed → Not achieved
```

**Turn 150:**
```
Galaxy Population: 800 million
Rabbit Population: 400 million (50%)
Status: 50% / 67% needed → Not achieved
```

**Turn 175:**
```
Galaxy Population: 900 million
Rabbit Population: 610 million (67.8%)
Status: 67.8% >= 67% → DOMINATION VICTORY!
```

### Example 2: Discovery Victory Sequence

**Turn 120:**
- Rats research Impulse Drive, can reach Orion
- Rats research Plasma Cannon, Neutronium Armor
- Fleet: 8 Dreadnoughts, 15 Battleships

**Turn 125:**
- Fleet arrives at Orion
- Guardian combat begins
- Guardian uses Death Ray: 1 Dreadnought destroyed
- Fleet fires: 450 damage dealt
- Guardian HP: 3000 → 2550

**Turn 126 (Combat continues):**
- Guardian Death Ray: 1 Battleship destroyed
- Fleet fires: 380 damage
- Guardian HP: 2550 → 2170

**... Combat continues for 6 more rounds ...**

**Turn 131:**
- Guardian HP: 280 → 0
- Guardian defeated!
- Rats receive: Death Ray, Stellar Converter, Advanced Cloning
- Rats send colony ship

**Turn 134:**
- Colony ship arrives at Orion
- Orion colonized
- DISCOVERY VICTORY!

### Example 3: Council Victory

**Turn 150:**
- 55% of planets colonized → Council forms
- First council meeting

**Vote Weights:**
- Hamsters: 28%
- Guinea Pigs: 25%
- Others: 47%

**Hamsters receive:**
- Own vote: 28%
- Allied Rats: 15%
- Bribed Ants: 10%
- Total: 53%

**Result:** No decision (need 67%)

**Turn 175:**
- Second council meeting
- Hamsters expanded, more allies

**Vote Weights:**
- Hamsters: 35%
- Guinea Pigs: 22%
- Others: 43%

**Hamsters receive:**
- Own vote: 35%
- Allied Rats: 12%
- Allied Mice: 10%
- Intimidated Rabbits: 8%
- Bribed Ants: 6%
- Total: 71%

**Result:** 71% >= 67% → DIPLOMATIC VICTORY!

---

## 13. Edge Cases

### 13.1 Population Edge Cases

**Zero Population Galaxy:**
- All empires eliminated simultaneously
- Result: Mutual destruction, no winner

**Population Shift During Turn:**
- Population calculated at start of turn
- Conquests during turn don't affect this turn's check

**Rebellions:**
- Rebel population doesn't count for Domination
- If rebellion wins, population transfers to rebels (new empire)

### 13.2 Discovery Edge Cases

**Two Fleets at Orion:**
- Guardian attacks first arriving fleet
- If first fleet dies, second fleet continues combat
- Victor colonizes

**Colony Ship Destroyed After Guardian:**
- Guardian defeated, but no colony ships arrive
- Other empire can colonize
- First colonizer wins Discovery

**Guardian Regeneration:**
- Guardian regenerates 50 shield per round
- Does not regenerate HP
- Does not respawn mid-combat

### 13.3 Council Edge Cases

**All Candidates Eliminated:**
- If both candidates die before vote, council postponed
- Next meeting in 25 turns with new candidates

**100% Abstention:**
- No quorum reached
- Council postponed 25 turns
- Warning displayed

**Player is Non-Candidate:**
- Player still votes
- Cannot win
- Vote affects outcome

### 13.4 Survival Edge Cases

**Colony Ships Only:**
- Empire with no colonies but colony ships in flight survives
- Must colonize or be destroyed to resolve

**Simultaneous Elimination:**
- Both remaining empires destroy each other
- Mutual destruction result
- No Hall of Fame entry

### 13.5 Transcendence Edge Cases

**Atrocity After High Score:**
- Using bio-weapons after reaching threshold
- Penalty applied retroactively
- Victory revoked if below threshold

**AI Cannot Transcend:**
- AI empires never check for transcendence
- Player-only victory path

**No Balance:**
- Excellent in one area, poor in others
- Balance multiplier of 0.5×-0.75×
- Much harder to reach threshold

---

*Document Version: 2.0*
*Last Updated: 2026-03-22*
*Status: Complete - Implementation Ready*
