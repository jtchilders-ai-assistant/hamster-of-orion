# Espionage System - Complete Formulas

## Overview

The espionage system allows empires to conduct covert operations against rivals: gathering intelligence, stealing technology, sabotaging infrastructure, inciting rebellion, and framing other races. Chameleons are the masters of espionage with a +60% success bonus, making them the undisputed spymasters of the galaxy.

This document provides complete, implementation-ready formulas for all espionage mechanics in Hamster of Orion.

**Related Documents:**
- `relationship-formulas.md` - Diplomatic penalties for caught spies
- `../species/chameleons.md` - Chameleon racial bonuses
- `../technology/computers.md` - Espionage-related technologies

---

## 1. Spy Network Fundamentals

### 1.1 Spy Recruitment

| Parameter | Value | Description |
|-----------|-------|-------------|
| Base Spy Cost | 50 BC | Cost to recruit one spy |
| Recruitment Time | 1 turn | Spy available immediately after payment |
| Maximum Spies | Unlimited | Limited only by economy |
| Spy Deployment Time | 5 turns | Turns before spy becomes operational |

**Spy Cost Formula:**
```
SpyCost = BASE_SPY_COST × DifficultyMod
```

**Difficulty Modifiers:**
| Difficulty | Spy Cost Multiplier |
|------------|---------------------|
| Simple | 0.75 |
| Easy | 0.90 |
| Average | 1.00 |
| Hard | 1.10 |
| Impossible | 1.25 |

### 1.2 Spy Effectiveness Calculation

Every spy has an effectiveness rating that modifies all mission success chances:

```
SpyEffectiveness = BaseEffectiveness + RacialBonus + TechBonus - TargetSecurity
```

**Variables:**
- `BaseEffectiveness` = 30 (all spies start here)
- `RacialBonus` = Espionage racial modifier (see Section 2)
- `TechBonus` = Computer tech level advantage × 2 (see Section 3)
- `TargetSecurity` = Target empire's security level × 10 (see Section 4)

**Example: Chameleon spy vs Hamster with moderate security**
```
RacialBonus = 60 (Chameleons)
TechBonus = (15 - 12) × 2 = 6 (Chameleon tech level 15, Hamster 12)
TargetSecurity = 3 × 10 = 30 (Security Level 3)

SpyEffectiveness = 30 + 60 + 6 - 30 = 66
```

---

## 2. Racial Espionage Modifiers

### 2.1 Offensive Espionage Bonuses

| Race | Espionage Bonus | Multiplier | Notes |
|------|-----------------|------------|-------|
| Chameleons | +60 | 1.60× | Masters of infiltration |
| Ferrets | +10 | 1.10× | Natural hunters and stalkers |
| Rats | +5 | 1.05× | Intelligent, careful operators |
| Hamsters | +0 | 1.00× | Balanced baseline |
| Mice | +0 | 1.00× | Cybernetic, but standard |
| Budgies | +0 | 1.00× | No spy aptitude |
| Rabbits | -5 | 0.95× | Too nervous for spy work |
| Guinea Pigs | -10 | 0.90× | Too direct, despise subterfuge |
| Hermit Crabs | -15 | 0.85× | Slow, obvious, patient not sneaky |
| Ants | -100 | 0.00× | Hive-mind cannot infiltrate |

**Ants Special Case:** Ants cannot conduct espionage operations. Their hive-mind nature makes individual infiltration impossible.

### 2.2 Defensive Security Bonuses

| Race | Defense Bonus | Notes |
|------|---------------|-------|
| Ants | Immune | Hive-mind detects all infiltration instantly |
| Chameleons | +30 | "Takes one to catch one" |
| Mice | +10 | Cybernetic surveillance |
| Rats | +5 | Paranoid academics |
| Hamsters | +0 | Baseline (trusting nature) |
| Guinea Pigs | +0 | Disinterested in subtlety |
| Ferrets | +0 | Prefer hunting to defending |
| Budgies | +0 | Standard |
| Rabbits | -5 | Easily panicked, poor coordination |
| Hermit Crabs | -10 | Too patient, slow to react |

---

## 3. Technology Effects on Espionage

### 3.1 Computer Tech Level Advantage

Espionage success is heavily influenced by the difference in Computer technology levels:

```
TechAdvantage = (AttackerCompTech - DefenderCompTech) × TECH_MODIFIER
```

Where:
- `TECH_MODIFIER` = 2 (each tech level = 2% success modifier)
- Maximum bonus: +20 (capped at 10 tech levels ahead)
- Maximum penalty: -20 (capped at 10 tech levels behind)

**Computer Tech Level** is derived from the highest Computer technology researched:

| Tech Tier | Approximate Tech Level |
|-----------|------------------------|
| 1-2 | 1-8 |
| 3-4 | 9-16 |
| 5-6 | 17-24 |
| 7-8 | 25-32 |
| 9-10 | 33-40 |
| 11-12 | 41-47 |
| 13-14 | 48-55 |

### 3.2 Espionage Technologies

Specific technologies provide espionage bonuses:

| Technology | Tech Level | Espionage Effect |
|------------|------------|------------------|
| Deep Space Scanner | 4 | +5% spy detection |
| Improved Scanner | 14 | +10% spy detection |
| Advanced Scanner | 24 | +15% spy detection |
| Subspace Scanner | 35 | +20% spy detection |
| Hyper Scanner | 45 | +25% spy detection, detect cloaked |
| Battle Scanner | 1 | +5% mission success (intel) |

**Scanner Detection Bonus:**
```
ScannerBonus = HighestScannerLevel × 5
```

---

## 4. Security System

### 4.1 Security Spending

Empires allocate BC to internal security, which determines spy detection rate:

```
SecurityLevel = floor(SecuritySpending / SECURITY_COST_PER_LEVEL)
```

**Security Cost Table:**

| Security Level | Total Spending Required | Detection Chance |
|----------------|------------------------|------------------|
| 0 | 0 BC | 10% (base) |
| 1 | 50 BC | 20% |
| 2 | 150 BC | 30% |
| 3 | 300 BC | 40% |
| 4 | 500 BC | 50% |
| 5 | 750 BC | 60% |
| 6 | 1,050 BC | 70% |
| 7 | 1,400 BC | 80% |
| 8 | 1,800 BC | 90% |
| 9 | 2,250 BC | 95% |
| 10 | 2,750 BC | 99% (maximum) |

**Security Level Cost Formula:**
```
RequiredSpending = (SecurityLevel × (SecurityLevel + 1) / 2) × 50 + (SecurityLevel × 50)
```

Simplified:
```
Level 1: 50
Level 2: 150  (+100)
Level 3: 300  (+150)
Level 4: 500  (+200)
Level 5: 750  (+250)
...
```

### 4.2 Detection Chance Formula

```
DetectionChance = BASE_DETECTION + (SecurityLevel × 10) + RacialDefenseBonus + ScannerBonus
```

**Variables:**
- `BASE_DETECTION` = 10%
- `SecurityLevel` = 0-10 (based on spending)
- `RacialDefenseBonus` = See Section 2.2
- `ScannerBonus` = See Section 3.2

**Example: Hamsters with Level 4 Security and Advanced Scanner**
```
DetectionChance = 10 + (4 × 10) + 0 + 15 = 65%
```

**Clamping:**
- Minimum Detection: 5% (even with no security, some chance)
- Maximum Detection: 99% (never perfectly secure)

---

## 5. Mission Success Formulas

### 5.1 Base Mission Success Rates

| Mission Type | Base Success | Risk Level |
|--------------|--------------|------------|
| Reconnaissance | 80% | Very Low |
| Steal Technology | 30% | Medium |
| Sabotage Factories | 40% | Medium |
| Sabotage Missile Bases | 35% | Medium-High |
| Incite Rebellion | 25% | High |
| Frame Another Race | 50% | High |
| Assassination | 10% | Extreme |

### 5.2 Mission Success Formula

```
SuccessChance = BaseMissionSuccess + SpyEffectiveness
```

Where `SpyEffectiveness` is calculated per Section 1.2.

**Clamping:**
- Minimum Success: 5% (always some chance)
- Maximum Success: 95% (never guaranteed)

### 5.3 Worked Examples

**Example 1: Chameleon Reconnaissance vs Rats (Security Level 2)**
```
BaseMissionSuccess = 80%
SpyEffectiveness = 30 + 60 + 4 - 20 = 74

SuccessChance = min(95, max(5, 80 + 74)) = 95% (capped)
```

**Example 2: Hamster Tech Theft vs Guinea Pigs (Security Level 5)**
```
BaseMissionSuccess = 30%
SpyEffectiveness = 30 + 0 + 0 - 50 = -20

SuccessChance = min(95, max(5, 30 + (-20))) = 10%
```

**Example 3: Ferret Sabotage vs Rabbits (Security Level 1)**
```
BaseMissionSuccess = 40%
SpyEffectiveness = 30 + 10 + 6 - 10 - 5 = 31
                   (Rabbits have -5 defense)

SuccessChance = min(95, max(5, 40 + 31)) = 71%
```

---

## 6. Mission-Specific Mechanics

### 6.1 Reconnaissance (Passive Intelligence)

**Cost:** Free (spies in place)
**Frequency:** Automatic each turn
**Risk:** Very Low

**Intel Gathered on Success:**

| Information | Detection Required |
|-------------|-------------------|
| Fleet locations | 1 spy |
| Fleet composition | 2 spies |
| Technology levels | 2 spies |
| Production capacity | 3 spies |
| Diplomatic relations | 3 spies |
| Research priorities | 4 spies |
| Colony details | 4 spies |

**Reconnaissance Success Formula:**
```
ReconSuccess = 80 + SpyEffectiveness
```

### 6.2 Technology Theft

**Cost:** 100 BC per attempt
**Frequency:** Once per turn per target
**Risk:** Medium

**Tech Theft Success Formula:**
```
TheftSuccess = 30 + SpyEffectiveness + TechValueModifier
```

**Tech Value Modifier:**
- Tier 1-3 techs: +10 (easier to steal basic tech)
- Tier 4-6 techs: +0
- Tier 7-9 techs: -5
- Tier 10-12 techs: -10
- Tier 13+ techs: -15 (hardest to steal advanced tech)

**Technology Selection Algorithm:**
```pseudocode
function SelectStolenTech(attacker, defender):
    available_techs = []
    
    for tech in defender.researched_techs:
        if tech not in attacker.researched_techs:
            available_techs.append(tech)
    
    if available_techs is empty:
        return null  // Nothing to steal
    
    // Weight by tech value (prefer higher value)
    weights = []
    for tech in available_techs:
        weight = tech.research_cost / 100
        weights.append(weight)
    
    return weighted_random_choice(available_techs, weights)
```

**Chameleon Special:** Chameleons can choose which tech category to target (not specific tech), doubling their chances of getting desired technology.

### 6.3 Sabotage Factories

**Cost:** 100 BC per attempt
**Frequency:** Once per turn per target planet
**Risk:** Medium

**Sabotage Success Formula:**
```
SabotageSuccess = 40 + SpyEffectiveness
```

**Factories Destroyed on Success:**
```
FactoriesDestroyed = floor(TargetFactories × (10 + random(0, 20)) / 100)
```

This destroys 10-30% of target planet's factories.

**Minimum Destruction:** 5 factories (if planet has at least 5)
**Maximum Destruction:** 50 factories per operation

### 6.4 Sabotage Missile Bases

**Cost:** 150 BC per attempt
**Frequency:** Once per turn per target planet
**Risk:** Medium-High

**Sabotage Success Formula:**
```
SabotageSuccess = 35 + SpyEffectiveness
```

**Bases Destroyed on Success:**
```
BasesDestroyed = floor(TargetBases × (15 + random(0, 15)) / 100)
```

This destroys 15-30% of target planet's missile bases.

**Minimum Destruction:** 1 base
**Maximum Destruction:** 10 bases per operation

### 6.5 Incite Rebellion

**Cost:** 200 BC per attempt
**Frequency:** Once per turn per target planet
**Risk:** High
**Requirement:** Target planet morale < 70%

**Rebellion Success Formula:**
```
RebellionSuccess = 25 + SpyEffectiveness + MoraleModifier
```

**Morale Modifier:**
```
MoraleModifier = (70 - TargetMorale) / 2
```

| Target Morale | Modifier |
|---------------|----------|
| 70% | +0 (minimum to attempt) |
| 60% | +5 |
| 50% | +10 |
| 40% | +15 |
| 30% | +20 |
| 20% | +25 |

**Rebellion Outcomes:**

| Roll | Outcome | Effect |
|------|---------|--------|
| 1-40% | Join Attacker | Planet defects to spy's empire |
| 41-70% | Independence | Planet becomes independent (neutral) |
| 71-100% | Civil Unrest | Production halted for 5 turns |

**Best Targets:**
- Recently conquered planets (low morale)
- Overcrowded planets (morale penalty)
- High-tax planets (morale penalty)
- Planets with alien populations

### 6.6 Frame Another Race

**Cost:** 150 BC per attempt
**Frequency:** Once per turn per target pair
**Risk:** High
**Requirement:** Chameleon spy tech OR Advanced Espionage tech

**Frame Success Formula:**
```
FrameSuccess = 50 + SpyEffectiveness - TargetIntelligence
```

Where:
- `TargetIntelligence` = Target's scanner level × 5 (they might detect the frame)

**Frame Detection Formula:**
```
FrameDetection = 30 + (PreviousFramesDetected × 10)
```

Each time a frame job is detected, future frames become harder.

**Frame Outcomes:**

| Result | Effect |
|--------|--------|
| Success | Target believes framed race conducted espionage |
| Failure | Nothing happens, spy escapes |
| Detected | Target knows YOU framed them (-75 relations) |

**Diplomatic Effects of Successful Frame:**
- Target applies espionage penalties to framed race
- Framed race relations with target: -20 to -50 (based on perceived mission)
- Your relations: Unaffected (unless detected)

### 6.7 Assassination

**Cost:** 300 BC per attempt
**Frequency:** Once every 10 turns per target
**Risk:** Extreme
**Requirement:** Target must have named leader

**Assassination Success Formula:**
```
AssassinationSuccess = 10 + SpyEffectiveness - LeaderProtection
```

**Leader Protection:**
- Base: 20
- Per Security Level: +5
- Capital Planet: +10
- At War: +15 (heightened security)

**Assassination Effects on Success:**
| Effect | Duration |
|--------|----------|
| -20% all production | 10 turns |
| -10 morale all planets | 10 turns |
| Diplomatic penalty to attacker | Permanent |

**If Caught:**
- Immediate war declaration
- -100 relations with target
- -50 relations with ALL races
- Spy executed

---

## 7. Spy Death Mechanics

### 7.1 Spy Death Chance

Spies can die during missions, especially when caught:

```
SpyDeathChance = BaseMissionRisk + CaughtPenalty - SpyEffectiveness / 4
```

**Base Mission Risk:**

| Mission | Death Risk |
|---------|------------|
| Reconnaissance | 5% |
| Steal Technology | 15% |
| Sabotage | 20% |
| Incite Rebellion | 30% |
| Frame | 25% |
| Assassination | 50% |

**Caught Penalty:** +30% death chance if mission detected

**Example: Chameleon sabotage caught**
```
SpyEffectiveness = 66 (from earlier example)
BaseMissionRisk = 20%
CaughtPenalty = 30%

SpyDeathChance = 20 + 30 - (66 / 4) = 50 - 16.5 = 33.5%
```

### 7.2 Spy Execution

When a spy is caught, the target empire chooses:

| Action | Effect |
|--------|--------|
| Execute | Spy dies, -10 additional relations |
| Expel | Spy returned, no additional penalty |
| Trade | Offer spy exchange (if you have their spies) |

**AI Execution Likelihood:**

| Race | Execute Chance | Notes |
|------|----------------|-------|
| Guinea Pigs | 90% | Death to spies! |
| Ferrets | 75% | Predatory justice |
| Budgies | 60% | Honor demands it |
| Ants | 100% | No concept of mercy |
| Mice | 40% | Prefer information |
| Hamsters | 25% | Diplomatic, prefer exchange |
| Rats | 30% | Study the spy first |
| Rabbits | 20% | Too scared to execute |
| Hermit Crabs | 50% | Indifferent |
| Chameleons | 10% | Prefer to turn them |

---

## 8. Counter-Espionage Operations

### 8.1 Active Counter-Intelligence

Beyond passive security spending, empires can assign spies to counter-intelligence:

```
CounterIntelBonus = AssignedSpies × 10
```

This adds to detection chance against all enemy spies.

**Counter-Intel Success:**
```
CounterIntelSuccess = DetectionChance + CounterIntelBonus
```

### 8.2 Spy Hunt Mode

Spend 200 BC to conduct a spy hunt in your empire:

```
SpyHuntSuccess = 50 + SecurityLevel × 5 + CounterIntelBonus
```

On success, one enemy spy is identified and can be:
- Executed
- Expelled
- Turned (requires Chameleon tech or 500 BC bribe)

### 8.3 Double Agents

Turned spies become double agents:

**Double Agent Benefits:**
- +20% detection against their former empire
- Can feed false intelligence
- 25% chance per turn to provide intel on enemy spy operations

**Double Agent Risk:**
```
DoubleAgentLoyalty = 50 + BribeAmount / 100 - (TurnsActive × 2)
```

If loyalty drops below 20, double agent may:
- Return to original empire (30%)
- Defect permanently to you (40%)
- Die mysteriously (30%)

---

## 9. Diplomatic Consequences

### 9.1 Caught Spy Penalties

From `relationship-formulas.md`:

| Mission | Relation Penalty | War Risk |
|---------|------------------|----------|
| Reconnaissance | -10 | Low |
| Steal Technology | -20 | Medium |
| Sabotage | -30 | High |
| Incite Rebellion | -50 | Very High |
| Frame Job (detected) | -75 | War likely |
| Assassination (caught) | -100 | Immediate War |

### 9.2 Cumulative Espionage Hostility

Repeated espionage builds cumulative hostility:

```
CumulativeHostility = SuccessfulMissions × 5 + CaughtMissions × 15
```

When `CumulativeHostility > 100`:
- AI will not accept treaties
- War declaration likely
- Other races may be warned about you

**Hostility Decay:**
```
HostilityDecay = 2 per turn (when no new espionage)
```

### 9.3 Reputation Track: Espionage

Espionage affects the "Honor" reputation track:

| Action | Honor Change |
|--------|--------------|
| Successful theft (undetected) | -1 |
| Successful sabotage (undetected) | -2 |
| Caught doing espionage | -5 |
| Frame job (successful) | -5 |
| Frame job (detected) | -15 |
| Assassination (any) | -20 |

---

## 10. Special Operations

### 10.1 Chameleon Sleeper Agents

**Requirement:** Chameleon race only
**Cost:** 150 BC to plant, 50 BC/turn to maintain

Sleeper agents remain dormant until activated:

```
SleeperActivation = Any time (player choice)
SleeperBonus = +30% to next mission
SleeperConcealment = Not detected until activated
```

After activation, sleeper becomes normal spy (or dies if mission fails).

### 10.2 False Flag Operations

**Requirement:** Frame technology OR Chameleon race
**Cost:** 200 BC

Plant evidence suggesting a third party conducted espionage:

```
FalseFlagSuccess = FrameSuccess - 10 (harder than normal frame)
```

**False Flag Targets:**
- Must be a race known to both you and target
- Cannot frame yourself
- Cannot frame races at war with target (too obvious)

### 10.3 Technology Sabotage

**Requirement:** Advanced Computer tech (level 30+)
**Cost:** 250 BC

Instead of stealing tech, delay enemy research:

```
TechSabotageSuccess = SabotageSuccess - 15
```

**Effect on Success:**
```
ResearchDelay = TargetResearchCost × (15 + random(0, 15)) / 100
```

Removes 15-30% of accumulated research points in target field.

---

## 11. Algorithm: Espionage Mission Resolution

```pseudocode
function ResolveMission(spy, target, mission_type):
    // Step 1: Calculate spy effectiveness
    racial_bonus = GetRacialEspionageBonus(spy.empire.race)
    tech_bonus = (spy.empire.computer_tech - target.computer_tech) * 2
    tech_bonus = clamp(tech_bonus, -20, 20)
    target_security = target.security_level * 10
    
    spy_effectiveness = 30 + racial_bonus + tech_bonus - target_security
    
    // Step 2: Calculate success chance
    base_success = GetBaseMissionSuccess(mission_type)
    mission_modifiers = GetMissionModifiers(mission_type, target)
    
    success_chance = base_success + spy_effectiveness + mission_modifiers
    success_chance = clamp(success_chance, 5, 95)
    
    // Step 3: Roll for success
    roll = random(1, 100)
    mission_succeeded = roll <= success_chance
    
    // Step 4: Check for detection
    detection_chance = GetDetectionChance(target)
    detection_roll = random(1, 100)
    spy_detected = detection_roll <= detection_chance
    
    // Step 5: Apply results
    if mission_succeeded:
        ApplyMissionSuccess(spy, target, mission_type)
    
    if spy_detected:
        ApplyDetectionPenalties(spy, target, mission_type)
        
        // Check for spy death
        death_chance = GetDeathChance(mission_type, spy_detected, spy_effectiveness)
        death_roll = random(1, 100)
        if death_roll <= death_chance:
            KillSpy(spy)
    
    // Step 6: Update cumulative hostility
    if mission_succeeded:
        target.cumulative_hostility[spy.empire] += 5
    if spy_detected:
        target.cumulative_hostility[spy.empire] += 15
    
    return {
        success: mission_succeeded,
        detected: spy_detected,
        spy_alive: spy.alive
    }
```

---

## 12. Constants Summary

```json
{
  "espionage_constants": {
    "BASE_SPY_COST": 50,
    "SPY_DEPLOYMENT_TIME": 5,
    "BASE_EFFECTIVENESS": 30,
    "TECH_MODIFIER": 2,
    "TECH_BONUS_CAP": 20,
    "BASE_DETECTION": 10,
    "MIN_DETECTION": 5,
    "MAX_DETECTION": 99,
    "MIN_SUCCESS": 5,
    "MAX_SUCCESS": 95,
    "SECURITY_COST_BASE": 50,
    "HOSTILITY_DECAY_RATE": 2,
    "CUMULATIVE_HOSTILITY_THRESHOLD": 100,
    "DOUBLE_AGENT_BASE_LOYALTY": 50,
    "SPY_HUNT_COST": 200,
    "SLEEPER_PLANT_COST": 150,
    "SLEEPER_MAINTAIN_COST": 50,
    "FALSE_FLAG_COST": 200,
    "TECH_SABOTAGE_COST": 250
  }
}
```

---

## 13. Mission Data Tables (JSON)

### 13.1 Mission Definitions

```json
{
  "espionage_missions": [
    {
      "id": "reconnaissance",
      "name": "Reconnaissance",
      "base_success": 80,
      "cost": 0,
      "frequency": "automatic",
      "risk_level": "very_low",
      "death_risk": 5,
      "relation_penalty_if_caught": -10,
      "war_risk": "low"
    },
    {
      "id": "steal_technology",
      "name": "Steal Technology",
      "base_success": 30,
      "cost": 100,
      "frequency": "once_per_turn",
      "risk_level": "medium",
      "death_risk": 15,
      "relation_penalty_if_caught": -20,
      "war_risk": "medium"
    },
    {
      "id": "sabotage_factories",
      "name": "Sabotage Factories",
      "base_success": 40,
      "cost": 100,
      "frequency": "once_per_turn_per_planet",
      "risk_level": "medium",
      "death_risk": 20,
      "relation_penalty_if_caught": -30,
      "war_risk": "high",
      "effect": {
        "destruction_percent_min": 10,
        "destruction_percent_max": 30,
        "min_destroyed": 5,
        "max_destroyed": 50
      }
    },
    {
      "id": "sabotage_bases",
      "name": "Sabotage Missile Bases",
      "base_success": 35,
      "cost": 150,
      "frequency": "once_per_turn_per_planet",
      "risk_level": "medium_high",
      "death_risk": 20,
      "relation_penalty_if_caught": -30,
      "war_risk": "high",
      "effect": {
        "destruction_percent_min": 15,
        "destruction_percent_max": 30,
        "min_destroyed": 1,
        "max_destroyed": 10
      }
    },
    {
      "id": "incite_rebellion",
      "name": "Incite Rebellion",
      "base_success": 25,
      "cost": 200,
      "frequency": "once_per_turn_per_planet",
      "risk_level": "high",
      "death_risk": 30,
      "relation_penalty_if_caught": -50,
      "war_risk": "very_high",
      "requirement": "target_morale_below_70",
      "outcomes": {
        "join_attacker": [1, 40],
        "independence": [41, 70],
        "civil_unrest": [71, 100]
      }
    },
    {
      "id": "frame_race",
      "name": "Frame Another Race",
      "base_success": 50,
      "cost": 150,
      "frequency": "once_per_turn",
      "risk_level": "high",
      "death_risk": 25,
      "relation_penalty_if_caught": -75,
      "war_risk": "war_likely",
      "requirement": "chameleon_or_advanced_espionage_tech"
    },
    {
      "id": "assassination",
      "name": "Assassination",
      "base_success": 10,
      "cost": 300,
      "frequency": "once_per_10_turns",
      "risk_level": "extreme",
      "death_risk": 50,
      "relation_penalty_if_caught": -100,
      "war_risk": "immediate_war",
      "additional_penalty_all_races": -50,
      "effect": {
        "production_penalty": -0.20,
        "morale_penalty": -10,
        "duration": 10
      }
    }
  ]
}
```

### 13.2 Racial Espionage Stats

```json
{
  "racial_espionage_stats": [
    {
      "id": "chameleons",
      "offensive_bonus": 60,
      "defensive_bonus": 30,
      "can_conduct_espionage": true,
      "special_abilities": ["sleeper_agents", "false_flag", "choose_tech_category"],
      "spy_cost_modifier": 0.50,
      "execution_chance": 0.10
    },
    {
      "id": "ferrets",
      "offensive_bonus": 10,
      "defensive_bonus": 0,
      "can_conduct_espionage": true,
      "special_abilities": [],
      "spy_cost_modifier": 1.00,
      "execution_chance": 0.75
    },
    {
      "id": "rats",
      "offensive_bonus": 5,
      "defensive_bonus": 5,
      "can_conduct_espionage": true,
      "special_abilities": [],
      "spy_cost_modifier": 1.00,
      "execution_chance": 0.30
    },
    {
      "id": "hamsters",
      "offensive_bonus": 0,
      "defensive_bonus": 0,
      "can_conduct_espionage": true,
      "special_abilities": [],
      "spy_cost_modifier": 1.00,
      "execution_chance": 0.25
    },
    {
      "id": "mice",
      "offensive_bonus": 0,
      "defensive_bonus": 10,
      "can_conduct_espionage": true,
      "special_abilities": ["cybernetic_surveillance"],
      "spy_cost_modifier": 1.00,
      "execution_chance": 0.40
    },
    {
      "id": "budgies",
      "offensive_bonus": 0,
      "defensive_bonus": 0,
      "can_conduct_espionage": true,
      "special_abilities": [],
      "spy_cost_modifier": 1.00,
      "execution_chance": 0.60
    },
    {
      "id": "rabbits",
      "offensive_bonus": -5,
      "defensive_bonus": -5,
      "can_conduct_espionage": true,
      "special_abilities": [],
      "spy_cost_modifier": 1.00,
      "execution_chance": 0.20
    },
    {
      "id": "guinea_pigs",
      "offensive_bonus": -10,
      "defensive_bonus": 0,
      "can_conduct_espionage": true,
      "special_abilities": [],
      "spy_cost_modifier": 1.00,
      "execution_chance": 0.90
    },
    {
      "id": "hermit_crabs",
      "offensive_bonus": -15,
      "defensive_bonus": -10,
      "can_conduct_espionage": true,
      "special_abilities": [],
      "spy_cost_modifier": 1.00,
      "execution_chance": 0.50
    },
    {
      "id": "ants",
      "offensive_bonus": -100,
      "defensive_bonus": 100,
      "can_conduct_espionage": false,
      "special_abilities": ["immune_to_espionage"],
      "spy_cost_modifier": null,
      "execution_chance": 1.00
    }
  ]
}
```

### 13.3 Security Level Table

```json
{
  "security_levels": [
    {"level": 0, "cost": 0, "detection_chance": 10},
    {"level": 1, "cost": 50, "detection_chance": 20},
    {"level": 2, "cost": 150, "detection_chance": 30},
    {"level": 3, "cost": 300, "detection_chance": 40},
    {"level": 4, "cost": 500, "detection_chance": 50},
    {"level": 5, "cost": 750, "detection_chance": 60},
    {"level": 6, "cost": 1050, "detection_chance": 70},
    {"level": 7, "cost": 1400, "detection_chance": 80},
    {"level": 8, "cost": 1800, "detection_chance": 90},
    {"level": 9, "cost": 2250, "detection_chance": 95},
    {"level": 10, "cost": 2750, "detection_chance": 99}
  ]
}
```

### 13.4 Tech Theft Value Modifiers

```json
{
  "tech_theft_modifiers": [
    {"tier_range": [1, 3], "modifier": 10},
    {"tier_range": [4, 6], "modifier": 0},
    {"tier_range": [7, 9], "modifier": -5},
    {"tier_range": [10, 12], "modifier": -10},
    {"tier_range": [13, 99], "modifier": -15}
  ]
}
```

---

## 14. Edge Cases

### 14.1 No Valid Targets

- **No tech to steal:** Mission auto-fails, spy returns safely, BC refunded
- **No planets with low morale:** Cannot attempt rebellion
- **Target is Ants:** Cannot conduct any espionage (100% detection, immune)

### 14.2 Simultaneous Operations

- Multiple spies can operate against same target
- Each spy rolls independently
- Detection applies per-spy, not per-operation
- Cumulative hostility stacks

### 14.3 War State Effects

- During war: +20% sabotage success (chaos provides cover)
- During war: +20% detection (heightened security)
- Peace treaty: Spies remain in place but cannot act for 5 turns

### 14.4 Race Extinction

- If target race is eliminated, all spies return home
- Stolen technologies remain
- Cumulative hostility is preserved (in case of resurrection event)

### 14.5 Alliance Espionage

- Cannot conduct espionage against allies (mission blocked)
- Breaking alliance removes this restriction immediately
- Spies deployed before alliance remain dormant

### 14.6 Chameleon vs Chameleon

Both sides apply full offensive and defensive bonuses:
```
ChameleonVsChameleon_NetBonus = 60 (attack) - 30 (defense) = 30
```
Still gives Chameleon attacker an advantage.

### 14.7 Integer Math

All calculations use integer math with floor rounding:
```
floor(SpyEffectiveness) before applying to SuccessChance
floor(SuccessChance) for final probability
```

---

## 15. Strategic Considerations

### 15.1 Chameleon Playstyle

1. **Early Game:** Establish spy networks by turn 20-30
2. **Mid Game:** Steal critical technologies (RC IV, shields, weapons)
3. **Late Game:** Frame races against each other, incite rebellions
4. **Victory Path:** Let the galaxy burn, swoop in during chaos

**Key Technologies for Chameleons:**
- Battle Scanner (recon bonus)
- Any Computer tech (advantage bonus)
- Don't research much - steal instead

### 15.2 Counter-Chameleon Strategy

1. **Maximum security spending** (Level 5+ minimum)
2. **Execute captured spies** (deter future operations)
3. **Form anti-Chameleon alliance** (share intel)
4. **Early military pressure** (before spy networks establish)
5. **Verify all espionage claims** (may be frame jobs)

### 15.3 Espionage ROI

| Mission | Cost | Expected Value | ROI Threshold |
|---------|------|----------------|---------------|
| Tech Theft | 100 BC | Tech worth 500+ RP | 30%+ success |
| Sabotage | 100 BC | 5-50 factories (100-500 BC) | 40%+ success |
| Rebellion | 200 BC | Entire planet | 15%+ success |
| Frame | 150 BC | War between enemies | 25%+ success |

---

## 16. Worked Examples

### Example 1: Complete Chameleon Tech Theft Operation

**Setup:**
- Chameleon empire (Computer Tech 18)
- Target: Rat empire (Computer Tech 22)
- Rat Security: Level 3

**Calculations:**
```
Step 1: Spy Effectiveness
RacialBonus = 60
TechBonus = (18 - 22) × 2 = -8
TargetSecurity = 3 × 10 = 30

SpyEffectiveness = 30 + 60 + (-8) - 30 = 52

Step 2: Success Chance
BaseMissionSuccess = 30 (tech theft)
TechValueModifier = 0 (assume tier 5 tech)

SuccessChance = 30 + 52 + 0 = 82% (capped at 95%)

Step 3: Detection Chance
RatDefenseBonus = 5
ScannerBonus = 10 (Improved Scanner)

DetectionChance = 10 + 30 + 5 + 10 = 55%

Step 4: Resolution
Roll 1 (Success): 45 → SUCCESS (45 ≤ 82)
Roll 2 (Detection): 60 → NOT DETECTED (60 > 55)

Result: Technology stolen, spy undetected!
```

### Example 2: Guinea Pig Assassination Attempt

**Setup:**
- Guinea Pig empire (Computer Tech 15)
- Target: Hamster empire (Computer Tech 20)
- Hamster Security: Level 4
- Hamster capital, at peace

**Calculations:**
```
Step 1: Spy Effectiveness
RacialBonus = -10 (Guinea Pigs)
TechBonus = (15 - 20) × 2 = -10
TargetSecurity = 4 × 10 = 40

SpyEffectiveness = 30 + (-10) + (-10) - 40 = -30

Step 2: Success Chance
BaseMissionSuccess = 10 (assassination)
LeaderProtection = 20 + (4 × 5) + 10 = 50 (base + security + capital)

SuccessChance = 10 + (-30) - 50 = -70 → clamped to 5%

Step 3: Detection Chance
HamsterDefenseBonus = 0
ScannerBonus = 5 (Deep Space Scanner)

DetectionChance = 10 + 40 + 0 + 5 = 55%

Step 4: Death Chance (if detected)
DeathRisk = 50 + 30 - (-30/4) = 50 + 30 + 7.5 = 87.5%

Result: Almost certainly fails, probably detected, spy likely dies.
```

### Example 3: Building Cumulative Hostility

**Scenario:** Ferret empire conducts 5 missions against Mice over 20 turns

| Turn | Mission | Success | Detected | Hostility Change | Total |
|------|---------|---------|----------|------------------|-------|
| 1 | Recon | Yes | No | +5 | 5 |
| 5 | Tech Theft | Yes | Yes | +5 + 15 = +20 | 25 |
| 10 | Sabotage | No | Yes | +15 | 40 |
| 15 | Sabotage | Yes | No | +5 | 45 |
| 20 | Tech Theft | Yes | No | +5 | 50 |

**With Decay:**
- Turns 2-4: -2/turn = -6 → 5 - 6 = 0 (minimum 0)
- Turns 6-9: -2/turn = -8 → 25 - 8 = 17
- Turns 11-14: -2/turn = -8 → 40 - 8 = 32
- Turns 16-19: -2/turn = -8 → 45 - 8 = 37

**Final Hostility:** 50 (below 100 threshold, Mice still wary but not hostile)

---

*Document Version: 1.0*
*Last Updated: 2026-03-22*
*Specification: spec-017 - Espionage Success Formulas*
*Status: Complete*
