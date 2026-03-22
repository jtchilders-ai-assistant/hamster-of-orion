# Diplomacy Relationship Mathematics

## Overview

This document provides the complete mathematical formulas for calculating diplomatic relationships between races in Hamster of Orion. Based on MOO1 mechanics, relationships are tracked on a -100 to +100 scale and change based on player actions, racial modifiers, treaties, and the passage of time.

---

## 1. Relationship Scale

### Range and States

| Range | Diplomatic State | Description |
|-------|------------------|-------------|
| -100 to -50 | War (Hostile) | Active conflict, fleets attack on sight |
| -49 to -1 | Unfriendly (Cold) | High tension, likely to escalate |
| 0 to +49 | Neutral (Cautious) | Standard relations, wary cooperation |
| +50 to +79 | Friendly (Warm) | Good relations, cooperation likely |
| +80 to +100 | Allied (United) | Excellent relations, formal alliance possible |

### Starting Relationship Formula

```
StartingRelation = BaseStart + RacialModifier + FirstContactModifier
```

**Variables:**
- `BaseStart` = 0 (all races start at neutral baseline)
- `RacialModifier` = sum of racial attitude modifiers (see Section 5)
- `FirstContactModifier` = modifier from first contact interaction (-30 to +20)

**First Contact Modifiers:**

| Action | Modifier |
|--------|----------|
| Friendly greeting | +10 |
| Gift offered at first contact | +20 |
| Neutral stance | 0 |
| Aggressive posture | -20 |
| Threat issued | -30 |

---

## 2. Relationship Change Formulas

### 2.1 Action-Based Changes

```
RelationChange = floor(BaseChange × RacialMod × ReputationMod × DifficultyMod)
```

**Variables:**
- `BaseChange` = raw relationship change from action (see table below)
- `RacialMod` = racial diplomacy modifier (multiplier)
- `ReputationMod` = global reputation modifier (0.5 to 1.5)
- `DifficultyMod` = difficulty level modifier (0.75 to 1.25)

**Note:** All calculations use integer math with floor rounding.

### 2.2 Base Relationship Changes by Action

#### Positive Actions

| Action | Base Change | Notes |
|--------|-------------|-------|
| Establish trade agreement | +20 | Between the two parties |
| Establish research pact | +15 | Between the two parties |
| Sign non-aggression pact | +10 | Between the two parties |
| Sign defensive pact | +30 | Between the two parties |
| Form military alliance | +50 | Between the two parties |
| Send tribute/gift (small) | +10 | 50-200 BC value |
| Send tribute/gift (medium) | +20 | 201-500 BC value |
| Send tribute/gift (large) | +35 | 501-1000 BC value |
| Send tribute/gift (massive) | +50 | 1000+ BC value |
| Shared enemy (declare war on common foe) | +30 | To race also at war with target |
| Defend ally in war | +25 | Per battle where you assist |
| Accept peace treaty (as victor) | +15 | If terms were merciful |
| Trade technology (fair) | +10 | Equal-value tech exchange |
| Honor treaty obligation | +5 | Per obligation fulfilled |
| Vote for them in Council | +20 | Per election |

#### Negative Actions

| Action | Base Change | Notes |
|--------|-------------|-------|
| Declare war | -100 | Immediate, with target |
| Break peace treaty | -50 | With all races (violation) |
| Break non-aggression pact | -30 | With all races |
| Break alliance | -100 | With all races |
| Spy caught (reconnaissance) | -10 | With target race |
| Spy caught (tech theft) | -20 | With target race |
| Spy caught (sabotage) | -30 | With target race |
| Spy caught (incite rebellion) | -50 | With target race |
| Spy caught (assassination) | -100 | With target race, -50 all races |
| Spy caught (false flag) | -75 | With target race, -40 framed race |
| Border incursion | -10 | Per fleet trespassing |
| Refuse reasonable peace offer | -15 | Per refusal |
| Demand tribute (refused) | -25 | Per demand |
| Demand tribute (accept then attack) | -50 | With all races |
| Conquer planet | -25 | With conquered race |
| Destroy planet (orbital bombardment) | -50 | With target, -30 all races |
| Use bio-weapons | -75 | With all races |
| Conquer homeworld | -100 | With conquered race |
| Exterminate population | -100 | With all races |

### 2.3 Worked Examples

**Example 1: Hamsters establish trade agreement with Rats**

```
BaseChange = +20
RacialMod = 1.60 (Hamsters get 2× diplomatic bonus for positive actions)
                 (Note: Rats have +0% diplomacy modifier = 1.0)
                 Combined: (1.60 + 1.0) / 2 = 1.30 average, but positive actions
                 use initiator's bonus primarily
RacialMod = 1.60 (Hamster-initiated, uses Hamster's 2× bonus)
ReputationMod = 1.0 (neutral reputation)
DifficultyMod = 1.0 (Normal difficulty)

RelationChange = floor(20 × 1.60 × 1.0 × 1.0) = floor(32) = +32
```

**Example 2: Guinea Pigs catch a Chameleon spy stealing technology**

```
BaseChange = -20
RacialMod = 0.80 (Guinea Pigs have -20% diplomacy)
ReputationMod = 1.0
DifficultyMod = 1.0

RelationChange = floor(-20 × 0.80 × 1.0 × 1.0) = floor(-16) = -16
```

---

## 3. Treaty Effects on Relations

### 3.1 Treaty Maintenance Bonuses

Active treaties provide ongoing relationship bonuses that are applied each turn (fractionally accumulated).

```
TreatyBonus_PerTurn = TreatyBaseBonus / 100
```

| Treaty Type | Base Bonus | Per Turn | Annual Effect |
|-------------|------------|----------|---------------|
| Trade Agreement | +20 | +0.20 | +2.0/year |
| Research Pact | +15 | +0.15 | +1.5/year |
| Non-Aggression Pact | +10 | +0.10 | +1.0/year |
| Defensive Pact | +20 | +0.20 | +2.0/year |
| Military Alliance | +30 | +0.30 | +3.0/year |

**Maximum Treaty Maintenance Cap:** +10 total per turn from all treaty bonuses

### 3.2 Treaty Violation Penalties

| Violation | Penalty (Target) | Penalty (All Races) | Duration |
|-----------|------------------|---------------------|----------|
| Break Trade Agreement | -25 | -10 | Permanent until forgiven |
| Break Research Pact | -20 | -10 | Permanent until forgiven |
| Break NAP | -30 | -15 | Permanent until forgiven |
| Break Defensive Pact | -40 | -20 | Permanent until forgiven |
| Break Alliance | -100 | -50 | Permanent until forgiven |

**"Treaty Breaker" Reputation:**
- Breaking any treaty flags you as a Treaty Breaker
- Treaty Breaker status: -20 penalty to all new treaty negotiations
- Duration: 50 turns
- Multiple violations: Stack duration (+25 turns each)

### 3.3 Treaty Duration Effects

```
TreatyDurationBonus = floor(TurnsActive / 25) × 5
```

**Maximum Duration Bonus:** +20

Treaties held for longer periods generate additional trust:
- 25 turns: +5 bonus
- 50 turns: +10 bonus
- 75 turns: +15 bonus
- 100+ turns: +20 bonus (maximum)

---

## 4. War Weariness System

### 4.1 War Weariness Accumulation

War weariness affects willingness to continue conflicts and impacts diplomatic negotiations.

```
WarWeariness = BaseDuration + CasualtyFactor + EconomicStrain
```

**Components:**

```
BaseDuration = floor(TurnsAtWar / 10)
```

```
CasualtyFactor = floor(ShipsLost × ShipWeight + PopulationLost × 0.01)
```

Where:
- `ShipWeight` = 0.1 (Scout), 0.5 (Destroyer), 1.0 (Cruiser), 2.0 (Battleship), 4.0 (Dreadnought), 6.0 (Titan)

```
EconomicStrain = floor((WarMaintenanceCost / TotalIncome) × 20)
```

**War Weariness Scale:**

| Weariness | Level | Effect |
|-----------|-------|--------|
| 0-10 | Fresh | No effect |
| 11-25 | Tired | -5% production |
| 26-50 | Weary | -10% production, +10% peace acceptance |
| 51-75 | Exhausted | -15% production, +25% peace acceptance |
| 76-100 | Critical | -20% production, +50% peace acceptance |
| 100+ | Desperate | -25% production, AI will seek peace at any cost |

### 4.2 War Weariness by Race

**War Weariness Multipliers:**

| Race | Multiplier | Notes |
|------|------------|-------|
| Guinea Pigs | 0.5× | Warriors thrive on conflict |
| Ferrets | 0.7× | Predators enjoy the hunt |
| Budgies | 0.75× | Warrior's honor sustains them |
| Ants | 0.8× | Hive-mind reduces individual suffering |
| Chameleons | 0.9× | Avoid direct conflict anyway |
| Hamsters | 1.0× | Standard baseline |
| Mice | 1.0× | Standard baseline |
| Rats | 1.2× | Prefer research to war |
| Rabbits | 1.5× | Terrified of casualties |
| Hermit Crabs | 0.6× | Patient, defensive mindset |

### 4.3 War Weariness Recovery

```
WearinessRecovery_PerTurn = 2 + PeaceYears + VictoryBonus
```

**Variables:**
- `PeaceYears` = consecutive years at peace (max contribution: 5)
- `VictoryBonus` = +10 if war ended in victory, +5 if favorable peace

**Minimum War Weariness:** 0

---

## 5. Racial Diplomacy Modifiers

### 5.1 Diplomacy Skill Modifiers

Each race has inherent diplomatic abilities that modify relationship calculations.

| Race | Diplomacy Modifier | Effect |
|------|-------------------|--------|
| Hamsters | +30% (1.30) | Base diplomacy modifier. **Additionally:** Universal Diplomat ability grants 2× multiplier on positive diplomatic action effects (separate from base modifier). |
| Chameleons | +20% | Skilled manipulators |
| Rabbits | +5% | Non-threatening demeanor |
| Mice | +0% | Neutral |
| Rats | +0% | Neutral |
| Ants | +0% | Neutral (but alien logic) |
| Hermit Crabs | +0% | Neutral (but distant) |
| Budgies | -5% | Proud, can be dismissive |
| Ferrets | -10% | Predatory demeanor unsettles others |
| Guinea Pigs | -20% | Aggressive and intimidating |

### 5.2 Hamster Special Abilities

Hamsters (equivalent to MOO1 Humans) receive special diplomatic bonuses:

1. **Double Positive Actions:** All positive diplomatic actions have 2× effect
2. **Trade Bonus:** +25% income from trade agreements
3. **Treaty Bonus:** +5 effective relationship when proposing treaties
4. **Council Bonus:** +5 effective relationship in Council voting
5. **Universal Neutrality:** Start at Neutral with all races (not Unfriendly)

### 5.3 Racial Attitude Matrix

Initial relationship modifiers between specific race pairs:

| Race | Versus | Modifier | Reason |
|------|--------|----------|--------|
| Guinea Pigs | Hamsters | -30 | Contempt for diplomats |
| Guinea Pigs | Chameleons | -20 | Dishonorable cowards |
| Ferrets | Rabbits | -25 | Predator/prey instinct |
| Ferrets | Chameleons | -15 | Dishonorable tactics |
| Chameleons | Everyone | -10 | No one trusts them |
| Budgies | Guinea Pigs | +10 | Mutual warrior respect |
| Budgies | Ferrets | +10 | Fellow combat masters |
| Rats | Mice | +15 | Fellow researchers |
| Hamsters | Everyone | +10 | Universal diplomat bonus |

**Calculating Starting Relations:**

```
InitialRelation = 0 + SumOfRacialModifiers
```

**Example: Guinea Pigs meeting Hamsters**
```
InitialRelation = 0 + (-30 Guinea Pig→Hamster) + (+10 Hamster→Everyone)
InitialRelation = -20 (Unfriendly)
```

### 5.4 Racial Treaty Acceptance Thresholds

Minimum relationship required to propose treaties:

| Treaty | Base Minimum | Modified by Race |
|--------|--------------|------------------|
| Peace Treaty | -100 (always possible) | — |
| Trade Agreement | +10 | Rats: +0, Guinea Pigs: +25 |
| Non-Aggression Pact | +20 | Hamsters: +10, Ferrets: +30 |
| Research Pact | +40 | Rats: +20, Guinea Pigs: +60 |
| Defensive Pact | +50 | Hermit Crabs: +35, Chameleons: +70 |
| Military Alliance | +65 | Hamsters: +50, Chameleons: +85 |

---

## 6. Relationship Decay & Natural Drift

### 6.1 Relationship Decay Formula

Relations naturally drift toward baseline over time:

```
DecayAmount = floor((CurrentRelation - BaselineRelation) × DecayRate)
```

**Variables:**
- `CurrentRelation` = current relationship value
- `BaselineRelation` = target drift value (typically racial baseline)
- `DecayRate` = 0.02 per turn (2% of difference)

**Example:**
```
CurrentRelation = +75 (Friendly)
BaselineRelation = 0 (Neutral)
DecayRate = 0.02

DecayAmount = floor((75 - 0) × 0.02) = floor(1.5) = 1
New Relation = 75 - 1 = 74
```

### 6.2 Decay Rate Modifiers

| Condition | Decay Rate Modifier |
|-----------|---------------------|
| Active trade agreement | 0.5× (slower decay) |
| Military alliance | 0.25× (much slower decay) |
| Recent war (within 50 turns) | 2.0× (faster decay) |
| Treaty breaker reputation | 1.5× (faster decay) |
| Shared enemy | 0.5× (slower decay) |
| Border friction | 1.5× (faster decay) |

### 6.3 Border Friction

Contested systems cause ongoing relationship strain:

```
BorderFriction = ContestedSystems × 5
```

Applied as negative modifier each turn (maximum -25).

**Contested System Definition:**
- Both races have colonies within 3 parsecs
- Both races have claimed but uncolonized planets in same system
- Fleet incursions into territory claimed by the other

---

## 7. Reputation System

### 7.1 Reputation Tracks

Four separate reputation tracks affect diplomatic calculations:

| Track | Positive | Negative | Range |
|-------|----------|----------|-------|
| Honor | Honorable | Treaty Breaker | -100 to +100 |
| Peace | Peaceful | Warmonger | -100 to +100 |
| Fairness | Fair | Exploiter | -100 to +100 |
| Mercy | Merciful | Genocidal | -100 to +100 |

### 7.2 Reputation Change Events

**Honor Track:**

| Event | Change |
|-------|--------|
| Keep treaty for 25+ turns | +5 |
| Break any treaty | -25 |
| Honor defensive pact call | +15 |
| Refuse to help ally in war | -20 |

**Peace Track:**

| Event | Change |
|-------|--------|
| 25 turns without declaring war | +5 |
| Declare war | -15 |
| Accept peace treaty (as loser) | +5 |
| Reject peace treaty (while winning) | -10 |

**Fairness Track:**

| Event | Change |
|-------|--------|
| Fair tech trade | +5 |
| Accept tribute under threat | +0 (no change) |
| Demand excessive tribute | -10 |
| Break trade agreement for advantage | -15 |

**Mercy Track:**

| Event | Change |
|-------|--------|
| Accept surrender | +10 |
| Release captured planet | +15 |
| Orbital bombardment of civilians | -20 |
| Use biological weapons | -50 |
| Exterminate population | -75 |

### 7.3 Reputation Effects on Relations

```
ReputationModifier = (Honor + Peace + Fairness + Mercy) / 400
```

This produces a value from -1.0 to +1.0, applied as:

```
EffectiveReputation = 1.0 + (ReputationModifier × 0.5)
```

Range: 0.5 to 1.5

**Applied to:** All relationship gain/loss calculations

---

## 8. AI Diplomatic Behavior

### 8.1 AI Acceptance Formula

When AI evaluates diplomatic proposals:

```
AcceptanceChance = BaseChance + RelationBonus + RacialBonus + ReputationBonus + OfferBonus
```

**Variables:**

```
BaseChance = 30%
RelationBonus = Relation × 0.5 (e.g., +60 relation = +30%)
RacialBonus = See Section 5.1
ReputationBonus = ReputationModifier × 20
OfferBonus = GiftValue / 50 (if gift included, max +40%)
```

**Example: Hamsters propose alliance to Rats**
```
Relation = +70
BaseChance = 30%
RelationBonus = 70 × 0.5 = +35%
RacialBonus = +0% (Rats neutral)
ReputationBonus = 0.3 × 20 = +6% (good reputation)
OfferBonus = 0% (no gift)

AcceptanceChance = 30 + 35 + 0 + 6 + 0 = 71%
```

### 8.2 AI Peace Acceptance

```
PeaceChance = BaseChance + WarWeariness + MilitaryDisparity + OfferBonus
```

**Variables:**

```
BaseChance = 20%
WarWeariness = WarWearinessLevel × 1.0 (0-100% based on weariness)
MilitaryDisparity = (EnemyMilitary - OurMilitary) / OurMilitary × 50
                    (capped at ±50%)
OfferBonus = TributeOffered / 100 (max +30%)
```

### 8.3 AI Declaration of War

AI evaluates war likelihood each turn:

```
WarChance = RacialAggressiveness + MilitaryAdvantage + RelationPenalty + OpportunityBonus
```

**Variables:**

```
RacialAggressiveness = (see table below)
MilitaryAdvantage = (OurMilitary - TheirMilitary) / TheirMilitary × 30
                    (only positive values count)
RelationPenalty = -Relation × 0.3 (negative relations increase war chance)
OpportunityBonus = +20% if target is at war with another race
                   +15% if target has low fleet presence in border regions
```

**Racial Aggressiveness Base:**

| Race | Base War Tendency |
|------|-------------------|
| Guinea Pigs | 40% |
| Ferrets | 30% |
| Budgies | 20% |
| Chameleons | 25% (backstab focused) |
| Ants | 15% (calculated) |
| Mice | 10% |
| Hamsters | 5% |
| Rats | 5% |
| Hermit Crabs | 2% |
| Rabbits | 1% (almost never) |

---

## 9. Constants Summary

| Constant | Value | Description |
|----------|-------|-------------|
| RELATION_MIN | -100 | Minimum relationship value |
| RELATION_MAX | +100 | Maximum relationship value |
| DECAY_RATE | 0.02 | Base decay per turn (2%) |
| TREATY_DURATION_BONUS_INTERVAL | 25 | Turns per duration bonus |
| TREATY_DURATION_BONUS_MAX | +20 | Maximum duration bonus |
| TREATY_MAINTENANCE_CAP | +10 | Maximum treaty bonus per turn |
| WAR_WEARINESS_INTERVAL | 10 | Turns per base weariness point |
| BORDER_FRICTION_PER_SYSTEM | -5 | Relation penalty per contested system |
| BORDER_FRICTION_MAX | -25 | Maximum border friction penalty |
| TREATY_BREAKER_DURATION | 50 | Turns as treaty breaker |
| HAMSTER_POSITIVE_MULTIPLIER | 2.0 | Hamster bonus on positive actions |
| HAMSTER_TRADE_BONUS | 1.25 | Hamster trade income multiplier |
| HAMSTER_TREATY_BONUS | +5 | Effective relation boost for treaties |
| REPUTATION_TRACK_MAX | +100 | Maximum reputation per track |
| REPUTATION_TRACK_MIN | -100 | Minimum reputation per track |

---

## 10. Edge Cases

### 10.1 Relationship Overflow

- If relationship would exceed +100, cap at +100
- If relationship would drop below -100, cap at -100
- Capping does not lose the "excess" - future negative/positive actions still apply normally

### 10.2 Extinct Races

- Relations with extinct races are preserved in case of resurrection (rare event)
- Relations with races that exterminated others: +10 to all who hated the extinct race

### 10.3 First Turn Contact

- Cannot declare war on turn of first contact
- First contact triggers one-time personality evaluation
- AI races with extreme negative starting relations may declare war on turn 2

### 10.4 Council Effects

- During Council sessions, temporary +5 bonus to all relations
- After Council rejection, -10 to relations with races who voted against you
- After Council acceptance, +20 to relations with supporting races

### 10.5 Spy Frame Jobs (Chameleons)

- When Chameleons frame another race:
  - Framed race receives spy-caught penalty from target
  - If frame is detected (30% chance), Chameleons receive -75 from target
  - Detection chance increases +10% per previous frame job detected

### 10.6 Simultaneous Actions

- Multiple relationship changes in same turn are summed before applying
- Order of operations: Actions → Decay → Treaty Bonuses → Cap
- Integer rounding only applied at final step

---

## 11. Algorithm: Turn Relationship Update

```pseudocode
function UpdateRelationships(race_a, race_b):
    relation = GetCurrentRelation(race_a, race_b)
    
    // Step 1: Apply action-based changes from this turn
    for each action in GetTurnActions(race_a, race_b):
        base_change = GetActionBaseChange(action)
        racial_mod = GetRacialMod(race_a)
        reputation_mod = GetReputationMod(race_a)
        difficulty_mod = GetDifficultyMod()
        
        change = floor(base_change * racial_mod * reputation_mod * difficulty_mod)
        relation = relation + change
    
    // Step 2: Apply treaty maintenance bonuses
    for each treaty in GetActiveTreaties(race_a, race_b):
        bonus = GetTreatyBonus(treaty)
        accumulated_bonus = accumulated_bonus + bonus
        if accumulated_bonus >= 1.0:
            relation = relation + floor(accumulated_bonus)
            accumulated_bonus = accumulated_bonus - floor(accumulated_bonus)
    
    // Step 3: Apply natural decay toward baseline
    baseline = GetRacialBaseline(race_a, race_b)
    decay_rate = GetDecayRate(race_a, race_b)
    decay_amount = floor((relation - baseline) * decay_rate)
    relation = relation - decay_amount
    
    // Step 4: Apply border friction
    contested_systems = CountContestedSystems(race_a, race_b)
    friction = min(contested_systems * BORDER_FRICTION_PER_SYSTEM, BORDER_FRICTION_MAX)
    relation = relation + friction  // friction is negative
    
    // Step 5: Cap result
    relation = max(RELATION_MIN, min(RELATION_MAX, relation))
    
    SetRelation(race_a, race_b, relation)
    return relation
```

---

## 12. Data Tables (JSON)

### 12.1 Racial Diplomacy Stats

```json
{
  "racial_diplomacy_stats": [
    {
      "id": "hamsters",
      "diplomacy_modifier": 1.30,
      "positive_action_multiplier": 2.0,
      "trade_bonus": 1.25,
      "treaty_bonus": 5,
      "council_bonus": 5,
      "war_weariness_multiplier": 1.0,
      "aggressiveness": 0.05
    },
    {
      "id": "guinea_pigs",
      "diplomacy_modifier": 0.80,
      "positive_action_multiplier": 1.0,
      "trade_bonus": 1.0,
      "treaty_bonus": 0,
      "council_bonus": 0,
      "war_weariness_multiplier": 0.5,
      "aggressiveness": 0.40
    },
    {
      "id": "chameleons",
      "diplomacy_modifier": 1.20,
      "positive_action_multiplier": 1.0,
      "trade_bonus": 1.0,
      "treaty_bonus": 0,
      "council_bonus": 0,
      "war_weariness_multiplier": 0.9,
      "aggressiveness": 0.25
    },
    {
      "id": "budgies",
      "diplomacy_modifier": 0.95,
      "positive_action_multiplier": 1.0,
      "trade_bonus": 1.0,
      "treaty_bonus": 0,
      "council_bonus": 0,
      "war_weariness_multiplier": 0.75,
      "aggressiveness": 0.20
    },
    {
      "id": "ferrets",
      "diplomacy_modifier": 0.90,
      "positive_action_multiplier": 1.0,
      "trade_bonus": 1.0,
      "treaty_bonus": 0,
      "council_bonus": 0,
      "war_weariness_multiplier": 0.7,
      "aggressiveness": 0.30
    },
    {
      "id": "rats",
      "diplomacy_modifier": 1.0,
      "positive_action_multiplier": 1.0,
      "trade_bonus": 1.0,
      "treaty_bonus": 0,
      "council_bonus": 0,
      "war_weariness_multiplier": 1.2,
      "aggressiveness": 0.05
    },
    {
      "id": "rabbits",
      "diplomacy_modifier": 1.05,
      "positive_action_multiplier": 1.0,
      "trade_bonus": 1.0,
      "treaty_bonus": 0,
      "council_bonus": 0,
      "war_weariness_multiplier": 1.5,
      "aggressiveness": 0.01
    },
    {
      "id": "mice",
      "diplomacy_modifier": 1.0,
      "positive_action_multiplier": 1.0,
      "trade_bonus": 1.0,
      "treaty_bonus": 0,
      "council_bonus": 0,
      "war_weariness_multiplier": 1.0,
      "aggressiveness": 0.10
    },
    {
      "id": "ants",
      "diplomacy_modifier": 1.0,
      "positive_action_multiplier": 1.0,
      "trade_bonus": 1.0,
      "treaty_bonus": 0,
      "council_bonus": 0,
      "war_weariness_multiplier": 0.8,
      "aggressiveness": 0.15
    },
    {
      "id": "hermit_crabs",
      "diplomacy_modifier": 1.0,
      "positive_action_multiplier": 1.0,
      "trade_bonus": 1.0,
      "treaty_bonus": 0,
      "council_bonus": 0,
      "war_weariness_multiplier": 0.6,
      "aggressiveness": 0.02
    }
  ]
}
```

### 12.2 Racial Attitude Matrix

```json
{
  "racial_attitudes": [
    {"from": "guinea_pigs", "to": "hamsters", "modifier": -30},
    {"from": "guinea_pigs", "to": "chameleons", "modifier": -20},
    {"from": "ferrets", "to": "rabbits", "modifier": -25},
    {"from": "ferrets", "to": "chameleons", "modifier": -15},
    {"from": "chameleons", "to": "*", "modifier": -10},
    {"from": "budgies", "to": "guinea_pigs", "modifier": 10},
    {"from": "budgies", "to": "ferrets", "modifier": 10},
    {"from": "rats", "to": "mice", "modifier": 15},
    {"from": "mice", "to": "rats", "modifier": 15},
    {"from": "hamsters", "to": "*", "modifier": 10}
  ]
}
```

### 12.3 Treaty Definitions

```json
{
  "treaties": [
    {
      "id": "peace_treaty",
      "name": "Peace Treaty",
      "initial_bonus": 0,
      "maintenance_bonus": 0,
      "min_relation_required": -100,
      "duration_min": 0,
      "break_penalty_target": 0,
      "break_penalty_all": -50
    },
    {
      "id": "trade_agreement",
      "name": "Trade Agreement",
      "initial_bonus": 20,
      "maintenance_bonus": 0.20,
      "min_relation_required": 10,
      "duration_min": 0,
      "break_penalty_target": -25,
      "break_penalty_all": -10
    },
    {
      "id": "non_aggression_pact",
      "name": "Non-Aggression Pact",
      "initial_bonus": 10,
      "maintenance_bonus": 0.10,
      "min_relation_required": 20,
      "duration_min": 20,
      "break_penalty_target": -30,
      "break_penalty_all": -15
    },
    {
      "id": "research_pact",
      "name": "Research Pact",
      "initial_bonus": 15,
      "maintenance_bonus": 0.15,
      "min_relation_required": 40,
      "duration_min": 20,
      "break_penalty_target": -20,
      "break_penalty_all": -10
    },
    {
      "id": "defensive_pact",
      "name": "Defensive Pact",
      "initial_bonus": 30,
      "maintenance_bonus": 0.20,
      "min_relation_required": 50,
      "duration_min": 30,
      "break_penalty_target": -40,
      "break_penalty_all": -20
    },
    {
      "id": "military_alliance",
      "name": "Military Alliance",
      "initial_bonus": 50,
      "maintenance_bonus": 0.30,
      "min_relation_required": 65,
      "duration_min": 0,
      "break_penalty_target": -100,
      "break_penalty_all": -50
    }
  ]
}
```

### 12.4 Diplomatic Actions

```json
{
  "diplomatic_actions": [
    {"id": "establish_trade", "type": "positive", "base_change": 20},
    {"id": "establish_research_pact", "type": "positive", "base_change": 15},
    {"id": "sign_nap", "type": "positive", "base_change": 10},
    {"id": "sign_defensive_pact", "type": "positive", "base_change": 30},
    {"id": "form_alliance", "type": "positive", "base_change": 50},
    {"id": "gift_small", "type": "positive", "base_change": 10, "min_value": 50, "max_value": 200},
    {"id": "gift_medium", "type": "positive", "base_change": 20, "min_value": 201, "max_value": 500},
    {"id": "gift_large", "type": "positive", "base_change": 35, "min_value": 501, "max_value": 1000},
    {"id": "gift_massive", "type": "positive", "base_change": 50, "min_value": 1001},
    {"id": "shared_enemy", "type": "positive", "base_change": 30},
    {"id": "defend_ally", "type": "positive", "base_change": 25},
    {"id": "merciful_peace", "type": "positive", "base_change": 15},
    {"id": "fair_tech_trade", "type": "positive", "base_change": 10},
    {"id": "honor_obligation", "type": "positive", "base_change": 5},
    {"id": "council_vote_for", "type": "positive", "base_change": 20},
    {"id": "declare_war", "type": "negative", "base_change": -100, "target_only": true},
    {"id": "break_peace", "type": "negative", "base_change": -50, "affects_all": true},
    {"id": "break_nap", "type": "negative", "base_change": -30, "affects_all": true},
    {"id": "break_alliance", "type": "negative", "base_change": -100, "affects_all": true},
    {"id": "spy_recon_caught", "type": "negative", "base_change": -10, "target_only": true},
    {"id": "spy_theft_caught", "type": "negative", "base_change": -20, "target_only": true},
    {"id": "spy_sabotage_caught", "type": "negative", "base_change": -30, "target_only": true},
    {"id": "spy_rebellion_caught", "type": "negative", "base_change": -50, "target_only": true},
    {"id": "spy_assassination_caught", "type": "negative", "base_change": -100, "target_only": true, "all_change": -50},
    {"id": "spy_frame_caught", "type": "negative", "base_change": -75, "target_only": true},
    {"id": "border_incursion", "type": "negative", "base_change": -10, "target_only": true},
    {"id": "refuse_peace", "type": "negative", "base_change": -15, "target_only": true},
    {"id": "demand_tribute_refused", "type": "negative", "base_change": -25, "target_only": true},
    {"id": "conquer_planet", "type": "negative", "base_change": -25, "target_only": true},
    {"id": "destroy_planet", "type": "negative", "base_change": -50, "target_only": true, "all_change": -30},
    {"id": "use_bioweapons", "type": "negative", "base_change": -75, "affects_all": true},
    {"id": "conquer_homeworld", "type": "negative", "base_change": -100, "target_only": true},
    {"id": "exterminate_population", "type": "negative", "base_change": -100, "affects_all": true}
  ]
}
```

---

## 13. Examples

### Example 1: Building an Alliance (Hamsters → Rats)

**Turn 1: First Contact**
```
Base Start: 0
Hamster Universal Diplomat: +10
Rats → Mice affinity (not applicable): +0
Initial Relation: +10 (Neutral)
```

**Turn 10: Establish Trade Agreement**
```
Base Change: +20
Hamster 2× Bonus: ×2.0
Total Change: +40
New Relation: +10 + 40 = +50 (Friendly)
```

**Turn 30: Sign Research Pact**
```
Current Relation: +50 (+ minor decay/treaty bonus)
Actual: ~+48 after decay
Base Change: +15
Hamster 2× Bonus: ×2.0
Total Change: +30
New Relation: +48 + 30 = +78 (Friendly, near Allied)
```

**Turn 50: Propose Military Alliance**
```
Current Relation: ~+80 (treaty maintenance offset decay)
Minimum Required: +65 (Rats) 
Relation exceeds minimum by +15: Accept likely
AI Acceptance: 30% + (80 × 0.5) + 0 + 0 = 70%
Result: Alliance formed
New Relation: +80 + 50 = +100 (capped at Allied maximum)
```

### Example 2: War and Recovery (Guinea Pigs → Hamsters)

**Initial Relations:**
```
Base: 0
Guinea Pigs → Hamsters: -30
Hamsters → Guinea Pigs: +10
Net: -20 (Unfriendly)
```

**Turn 15: Guinea Pigs Declare War**
```
Relation Change: -100
New Relation: -20 - 100 = -100 (War, capped)
```

**Turns 15-45: War Period (30 turns)**
```
War Weariness (GP): 
  BaseDuration = 30/10 = 3
  CasualtyFactor = (10 × 1.0) + (500 × 0.01) = 15 (lost cruisers + population)
  EconomicStrain = (150/500) × 20 = 6
  Total = 24 × 0.5 (GP multiplier) = 12 (Tired)

War Weariness (Hamsters):
  BaseDuration = 3
  CasualtyFactor = 8 + 3 = 11
  EconomicStrain = 8
  Total = 22 × 1.0 = 22 (Tired)
```

**Turn 45: Peace Treaty (Guinea Pigs losing)**
```
AI Peace Acceptance (GP):
  Base: 20%
  Weariness: 12%
  Military Disparity: (Hamster stronger) = -15% (negative, doesn't help)
  = 32% base chance (will likely need tribute)

After peace:
  Relation: -100 → -100 (stays at war minimum until treaty signed)
  Post-treaty: -100 + 0 (peace has no bonus) = -100
```

**Turns 45-145: Recovery Period**
```
Each turn:
  Decay toward racial baseline (-20):
  DecayAmount = (-100 - (-20)) × 0.02 × 1.5 (recent war) = floor(-2.4) = -2
  Wait, this would increase (less negative)...
  
Correction: Decay moves TOWARD baseline, not away:
  If below baseline: relation increases
  If above baseline: relation decreases
  
  Decay = (-100 - (-20)) × 0.02 = -1.6 → floor abs = 1, add (because below baseline)
  New: -100 + 1 = -99
  
After 50 turns: approximately -50 (still Hostile/War threshold)
After 100 turns: approximately -30 (Unfriendly)
```

**Turn 150: Hamster Gift Attempt**
```
Send Large Gift (800 BC):
  Base: +35
  Hamster 2× Bonus: ×2.0
  Change: +70
  New Relation: -30 + 70 = +40 (Neutral!)
```

---

*Document Version: 1.0*
*Last Updated: 2026-03-22*
*Status: Complete*
