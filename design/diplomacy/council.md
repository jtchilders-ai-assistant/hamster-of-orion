# The High Council - Voting Algorithm Specification

## Overview

The High Council is the galactic governing body that convenes to elect a **Master of Orion** through democratic vote. This document provides the complete mathematical formulas and algorithms for vote allocation, voting behavior, victory thresholds, and abstention rules.

When 50%+ of habitable planets are colonized, the Council forms and meets periodically to potentially end the game through **Diplomatic Victory**.

---

## 1. Council Formation

### 1.1 Formation Trigger

```
Council_Forms = (Colonized_Planets / Total_Habitable_Planets) >= 0.50
```

**Variables:**
- `Colonized_Planets` = total planets with colonies (all races combined)
- `Total_Habitable_Planets` = all colonizable planets in galaxy (excludes Asteroid fields, Gas Giants)

**Note:** The 50% threshold is checked at the start of each turn. Once triggered, the Council exists permanently.

### 1.2 Meeting Frequency

```
Next_Council_Turn = Council_Formation_Turn + (Council_Count × COUNCIL_INTERVAL)
```

**Constants:**
- `COUNCIL_INTERVAL` = 25 turns between meetings

**First Meeting:**
- Occurs on the turn the 50% threshold is crossed
- Subsequent meetings every 25 turns thereafter

### 1.3 Attendance Rules

- **Mandatory:** All living races must attend
- **No Proxies:** Extinct races have no votes
- **Two Candidates:** Only the two races with highest vote weight can be nominated
- **Self-Nomination:** Candidates automatically nominated (no abstention from candidacy)

---

## 2. Vote Allocation Formula

### 2.1 Base Vote Weight by Population

```
Vote_Weight(race) = Total_Population(race) / Galaxy_Total_Population × 100
```

**Result:** Percentage of total galactic population = percentage of total votes

**Example:**
```
Galaxy Total Population: 1,000 million
Hamsters: 300 million → 30% vote weight
Guinea Pigs: 250 million → 25% vote weight
Rats: 200 million → 20% vote weight
Others: 250 million → 25% combined
```

### 2.2 Vote Weight Calculation Algorithm

```pseudocode
function CalculateVoteWeights():
    total_population = 0
    race_populations = {}
    
    // Step 1: Sum all population
    for each race in living_races:
        race_pop = 0
        for each planet in race.colonies:
            race_pop += planet.population
        race_populations[race] = race_pop
        total_population += race_pop
    
    // Step 2: Calculate percentages
    vote_weights = {}
    for each race in living_races:
        weight = floor((race_populations[race] / total_population) × 10000) / 100
        vote_weights[race] = weight  // Two decimal precision
    
    // Step 3: Normalize to exactly 100% (handle rounding)
    weight_sum = sum(vote_weights.values())
    if weight_sum != 100.0:
        largest_race = race_with_max(vote_weights)
        vote_weights[largest_race] += (100.0 - weight_sum)
    
    return vote_weights
```

### 2.3 Minimum Vote Threshold

```
Has_Council_Vote = Vote_Weight(race) >= MIN_VOTE_THRESHOLD
```

**Constants:**
- `MIN_VOTE_THRESHOLD` = 1.0% (races below 1% still vote, but are not candidates)

### 2.4 Candidate Selection

Only the **two races with the highest vote weights** are eligible as candidates.

```pseudocode
function SelectCandidates(vote_weights):
    sorted_races = sort_by_value_descending(vote_weights)
    candidate_1 = sorted_races[0]  // Highest population
    candidate_2 = sorted_races[1]  // Second highest population
    return (candidate_1, candidate_2)
```

**Tie-Breaking:**
- If two or more races tie for second place, the race with the higher diplomatic reputation score becomes the second candidate
- If still tied, alphabetical by race ID

---

## 3. Victory Threshold

### 3.1 Required Majority

```
Victory_Threshold = floor(Total_Votes × 2/3) + 1
```

**Simplified:**
```
Victory_Threshold = 66.67% of total votes (rounded up)
```

**In practice:** A candidate needs ≥ 67% of votes cast (abstentions excluded from total)

### 3.2 Vote Counting Formula

```
Effective_Votes_Cast = 100% - Sum(Abstention_Weights)
Victory_Requirement = Effective_Votes_Cast × (2/3)
```

**Example:**
```
Total Votes: 100%
Abstentions: 15% (races abstaining)
Effective Votes Cast: 85%
Victory Requirement: 85 × 0.667 = 56.7% → rounds to 57%
Candidate needs 57% of original 100% to win
```

### 3.3 Victory Determination Algorithm

```pseudocode
function DetermineCouncilOutcome(votes, abstentions, candidates):
    effective_total = 100.0 - sum(abstentions.values())
    
    if effective_total < MIN_EFFECTIVE_VOTES:
        return "NO_QUORUM"  // Not enough participation
    
    votes_for_c1 = sum(votes[c] for c in votes if votes[c] == candidates[0])
    votes_for_c2 = sum(votes[c] for c in votes if votes[c] == candidates[1])
    
    threshold = ceil(effective_total × (2/3))
    
    if votes_for_c1 >= threshold:
        return ("VICTORY", candidates[0])
    elif votes_for_c2 >= threshold:
        return ("VICTORY", candidates[1])
    else:
        return ("NO_DECISION", null)
```

**Constants:**
- `MIN_EFFECTIVE_VOTES` = 50.0% (quorum requirement)

---

## 4. Voting Behavior Algorithm

### 4.1 AI Vote Decision Formula

Each AI race calculates a **Vote Score** for each candidate:

```
Vote_Score(candidate) = Relation_Factor + Fear_Factor + Bribery_Factor + Racial_Factor + Reputation_Factor
```

**Decision Rule:**
- Vote for candidate with highest positive score
- If both scores negative → Abstain
- If scores within 5 points of each other and both low (<20) → Abstain

### 4.2 Relation Factor

```
Relation_Factor = Relation_Value × RELATION_WEIGHT
```

**Variables:**
- `Relation_Value` = current relationship (-100 to +100)
- `RELATION_WEIGHT` = 0.5

**Range:** -50 to +50

**Example:**
```
Relation with Hamsters: +80 (Allied)
Relation_Factor = 80 × 0.5 = +40
```

### 4.3 Fear Factor (Military Intimidation)

```
Fear_Factor = Military_Ratio × FEAR_WEIGHT × Racial_Fear_Modifier
```

**Military Ratio Calculation:**
```
Military_Ratio = (Candidate_Military / Voter_Military) - 1.0
```

**Capped:** Military_Ratio capped at +3.0 (cannot exceed 3× advantage benefit)

**Variables:**
- `FEAR_WEIGHT` = 15
- `Racial_Fear_Modifier` = varies by race (see table below)

**Racial Fear Modifiers:**

| Race | Fear Modifier | Notes |
|------|---------------|-------|
| Rabbits | 2.0 | Very susceptible to intimidation |
| Rats | 1.5 | Prefer peaceful resolution |
| Mice | 1.2 | Pragmatic about threats |
| Chameleons | 1.0 | Standard |
| Hamsters | 1.0 | Standard |
| Hermit Crabs | 0.8 | Patient, less fearful |
| Ants | 0.6 | Hive-mind calculates odds |
| Budgies | 0.4 | Warriors don't fear easily |
| Ferrets | 0.3 | Predators respect strength but don't fear |
| Guinea Pigs | 0.1 | Almost immune to intimidation |

**Example:**
```
Candidate (Hamsters) Military: 500
Voter (Rabbits) Military: 100
Military_Ratio = (500/100) - 1 = 4.0 → capped to 3.0
Fear_Factor = 3.0 × 15 × 2.0 = +90

(Rabbits are terrified and will vote for Hamsters)
```

### 4.4 Bribery Factor

```
Bribery_Factor = (Bribe_Value / Voter_Economy) × BRIBERY_WEIGHT × Racial_Bribe_Modifier
```

**Variables:**
- `Bribe_Value` = BC offered + Tech_Value(offered_techs)
- `Voter_Economy` = voter's annual BC income
- `BRIBERY_WEIGHT` = 100

**Racial Bribe Modifiers:**

| Race | Bribe Modifier | Notes |
|------|----------------|-------|
| Rabbits | 1.5 | Desperate for protection |
| Mice | 1.3 | Value practical gains |
| Chameleons | 1.2 | Opportunistic |
| Rats | 1.0 | Standard |
| Hamsters | 1.0 | Standard |
| Ants | 1.0 | Calculate precise value |
| Hermit Crabs | 0.8 | Prefer isolation to wealth |
| Ferrets | 0.6 | Pride over payment |
| Budgies | 0.5 | Dishonor to accept |
| Guinea Pigs | 0.3 | Insult to offer bribes |

**Tech Value Calculation:**
```
Tech_Value(tech) = Tech_Tier × 50 + (1000 if voter_does_not_have)
```

**Bribery Cap:** Maximum +50 Bribery_Factor regardless of amount offered

**Example:**
```
Hamsters offer Rats: 500 BC + Impulse Drive (Tier 6)
Tech_Value = 6 × 50 + 1000 = 1300 (Rats don't have it)
Total Bribe = 500 + 1300 = 1800
Rats Economy = 400 BC/turn
Bribery_Factor = (1800 / 400) × 100 × 1.0 = 450 → capped to +50
```

### 4.5 Racial Factor (Natural Affinities)

Some races have inherent preferences:

```
Racial_Factor = Base_Affinity(voter, candidate)
```

**Racial Affinity Matrix:**

| Voter | Prefers | Modifier | Dislikes | Modifier |
|-------|---------|----------|----------|----------|
| Guinea Pigs | Guinea Pigs | +20 | Chameleons | -20 |
| Budgies | Budgies, Ferrets | +15 | Chameleons | -15 |
| Ferrets | Ferrets, Budgies | +15 | Rabbits | -10 |
| Ants | Ants | +10 | — | — |
| Mice | Mice, Rats | +10 | — | — |
| Rats | Rats, Mice | +10 | — | — |
| Rabbits | Hamsters | +15 | Guinea Pigs, Ferrets | -20 |
| Chameleons | — | — | — | — |
| Hermit Crabs | Hermit Crabs | +10 | — | — |
| Hamsters | — | — | — | — |

**Note:** Hamsters have no built-in affinities but receive +5 bonus from all non-hostile races (universal diplomat effect).

### 4.6 Reputation Factor

```
Reputation_Factor = Candidate_Reputation × REPUTATION_WEIGHT
```

**Reputation Score Calculation:**
```
Candidate_Reputation = (Honor + Peace + Fairness + Mercy) / 4
```

Where each track ranges from -100 to +100 (see relationship-formulas.md)

**Variables:**
- `REPUTATION_WEIGHT` = 0.15

**Range:** -15 to +15

**Reputation Penalties:**

| Condition | Penalty |
|-----------|---------|
| Treaty Breaker (active) | -20 |
| Used Bio-Weapons | -30 |
| Exterminated Population | -40 |
| Destroyed Planet | -25 |

### 4.7 Complete Vote Decision Algorithm

```pseudocode
function DetermineVote(voter, candidate1, candidate2):
    // Calculate scores for each candidate
    score1 = CalculateVoteScore(voter, candidate1)
    score2 = CalculateVoteScore(voter, candidate2)
    
    // Apply Hamster diplomat bonus
    if candidate1.race == "hamsters":
        score1 += HAMSTER_COUNCIL_BONUS
    if candidate2.race == "hamsters":
        score2 += HAMSTER_COUNCIL_BONUS
    
    // Determine vote
    if voter == candidate1:
        return candidate1  // Always vote for self
    if voter == candidate2:
        return candidate2  // Always vote for self
    
    // Check for abstention conditions
    if score1 < 0 and score2 < 0:
        return ABSTAIN
    if abs(score1 - score2) < ABSTAIN_THRESHOLD and max(score1, score2) < LOW_SCORE_THRESHOLD:
        return ABSTAIN
    
    // Check for special conditions
    if voter.at_war_with(candidate1) and not voter.at_war_with(candidate2):
        return candidate2  // Never vote for active enemy
    if voter.at_war_with(candidate2) and not voter.at_war_with(candidate1):
        return candidate1
    if voter.at_war_with(candidate1) and voter.at_war_with(candidate2):
        return ABSTAIN  // At war with both
    
    // Standard decision
    if score1 > score2:
        return candidate1
    else:
        return candidate2

function CalculateVoteScore(voter, candidate):
    relation = GetRelation(voter, candidate)
    relation_factor = relation × RELATION_WEIGHT
    
    military_ratio = min(GetMilitaryRatio(candidate, voter), MAX_MILITARY_RATIO)
    fear_factor = military_ratio × FEAR_WEIGHT × GetFearModifier(voter.race)
    
    bribe = GetBribeOffer(candidate, voter)
    bribery_factor = min((bribe / voter.economy) × BRIBERY_WEIGHT × GetBribeModifier(voter.race), MAX_BRIBERY_FACTOR)
    
    racial_factor = GetRacialAffinity(voter.race, candidate.race)
    
    reputation = GetReputationScore(candidate)
    reputation_factor = reputation × REPUTATION_WEIGHT
    reputation_factor += GetReputationPenalties(candidate)
    
    // Population dominance penalty (MOO1 mechanic)
    // All voters penalize a candidate who controls 40%+ of galactic population
    dominance_penalty = 0
    if candidate.is_dominant:  // See relationship-formulas.md Section 7
        dominance_penalty = DOMINANCE_COUNCIL_PENALTY  // -20
    
    return relation_factor + fear_factor + bribery_factor + racial_factor + reputation_factor + dominance_penalty
```

**Constants:**
- `RELATION_WEIGHT` = 0.5
- `FEAR_WEIGHT` = 15
- `MAX_MILITARY_RATIO` = 3.0
- `BRIBERY_WEIGHT` = 100
- `MAX_BRIBERY_FACTOR` = 50
- `REPUTATION_WEIGHT` = 0.15
- `HAMSTER_COUNCIL_BONUS` = 5
- `ABSTAIN_THRESHOLD` = 5
- `LOW_SCORE_THRESHOLD` = 20
- `DOMINANCE_COUNCIL_PENALTY` = -20 (applied to candidate who controls ≥40% of galactic population; see relationship-formulas.md Section 7)

---

## 5. Abstention Rules

### 5.1 Mandatory Abstention Conditions

A race **must abstain** if:

1. **At war with both candidates**
2. **Candidate race does not exist** (extinct, somehow still nominated)
3. **Zero vote weight** (population is 0)

### 5.2 AI-Triggered Abstention Conditions

AI races **choose to abstain** if:

1. **Both scores negative:** Neither candidate acceptable
2. **Scores too close and low:** Indifference
3. **Racial personality (Hermit Crabs):** 25% chance to abstain regardless

### 5.3 Abstention Behavior by Race

| Race | Abstention Tendency | Condition |
|------|---------------------|-----------|
| Hermit Crabs | High | 25% base abstention chance + normal rules |
| Ants | Low | Only abstain if mathematically optimal |
| Chameleons | Medium | Abstain to avoid commitment |
| Guinea Pigs | Very Low | Always have strong opinion |
| Hamsters | Low | Prefer to participate |
| Others | Standard | Follow normal rules |

### 5.4 Abstention Weight Formula

Abstained votes are **removed from the total**, not counted as "no" votes:

```
Effective_Total = 100% - Abstention_Percentage
Required_For_Victory = ceil(Effective_Total × (2/3))
```

**Example:**
```
Total Votes: 100%
Hamsters Vote Weight: 35% (candidate)
Guinea Pigs Vote Weight: 30% (candidate)  
Hermit Crabs Vote Weight: 15% (abstain)
Others: 20% (voting for Hamsters)

Effective Total = 100% - 15% = 85%
Required for Victory = ceil(85 × 0.667) = 57%

Hamsters receive: 35% (self) + 20% (others) = 55%
55% < 57% = NO VICTORY

If Hermit Crabs had voted for Hamsters:
Hamsters receive: 35% + 20% + 15% = 70%
Required: ceil(100 × 0.667) = 67%
70% ≥ 67% = VICTORY
```

---

## 6. Player Interactions

### 6.1 Pre-Vote Lobbying Phase

**Timing:** 5 turns before Council meeting

**Available Actions:**
- View current vote projections
- Offer bribes (BC + Technology)
- Make threats (military posturing)
- Request votes in diplomatic screen
- Form/strengthen alliances

### 6.2 Bribery Interface

```
Bribe_Effectiveness = (BC_Amount + Tech_Value) × Target_Bribe_Modifier / Target_Economy
```

**UI Display:** Shows estimated vote change per bribe amount

### 6.3 Vote Request

Player can request votes through diplomacy:

```
Request_Success_Chance = 30% + (Relation × 0.5) + Treaty_Bonus
```

**Treaty Bonuses:**
- Alliance: +30%
- Defensive Pact: +20%
- Trade Agreement: +10%

**Failure:** Race may become slightly annoyed (-5 relation)

### 6.4 Player Vote Options

If player is a candidate:
- Must vote for self (automatic)

If player is not a candidate:
- Vote for Candidate 1
- Vote for Candidate 2
- Abstain

### 6.5 Post-Vote Options

**If You Win (voted Master of Orion):**
1. **Accept Victory** → Game ends, Diplomatic Victory achieved
2. **Reject Title** → Game continues, -30 relation with all races who voted for you

**If Opponent Wins:**
1. **Accept Decision** → Game ends, you lose
2. **Reject Decision (Declare War)** → Galactic War begins

### 6.6 Rejection Consequences

**Rejecting Your Own Victory:**
- Game continues
- All races who voted for you: -30 relation
- Cannot win Council for next 50 turns
- "Refused Mandate" reputation flag

**Rejecting Opponent's Victory:**
- Automatically declare war on winner
- All other rejecting races become your temporary allies
- All accepting races become enemies
- Coalition war until resolution

---

## 7. Special Cases

### 7.1 Two-Race Galaxy

If only two races remain:
- Both automatically candidates
- 67% threshold still applies
- If neither reaches 67%, no decision
- Effectively requires one to control 2/3 of total population

### 7.2 Single-Race Galaxy

If only one race remains:
- Council does not convene
- That race wins by **Domination Victory** instead

### 7.3 Tied Candidates

If two races have identical vote weight for candidacy:
- Higher diplomatic reputation wins nomination
- If still tied: Alphabetical by race ID

### 7.4 Tied Vote Outcome

If both candidates receive exactly 50% of effective votes:
- No decision
- Game continues
- Council reconvenes in 25 turns

### 7.5 Population Shift Mid-Vote

Population is calculated at **start of Council turn**, not during voting phase. Any changes during the same turn do not affect current vote.

### 7.6 Alliance Voting

Races in formal **Military Alliance**:
- 80% chance to vote for allied candidate
- 20% chance to vote independently based on score
- Chameleons: Only 50% alliance loyalty

### 7.7 Candidate Elimination

If a candidate is eliminated (conquered) between nomination and voting:
- Remaining candidate automatically wins if they have ≥50% vote
- Otherwise, third-highest population race becomes second candidate

---

## 8. Council Timing and Game Flow

### 8.1 Turn Order During Council

1. Start of turn: Council eligibility check
2. If Council triggered: Pause normal turn processing
3. Council Meeting Phase:
   a. Calculate vote weights
   b. Select candidates
   c. AI decision phase (hidden)
   d. Player decision phase
   e. Vote reveal (dramatic presentation)
   f. Outcome determination
4. If victory accepted: Game ends
5. If rejected/no decision: Normal turn resumes

### 8.2 Between-Council Diplomacy

Council outcomes affect relations:

| Outcome | Effect |
|---------|--------|
| Voted for winner (accepted) | +20 relation with winner |
| Voted against winner (accepted) | -10 relation with winner |
| Abstained | No change |
| Rejected decision | War with winner, alliance with other rejecters |

### 8.3 Council Frequency Modifiers

**Optional Rule - Galaxy Size Adjustment:**

| Galaxy Size | Council Interval |
|-------------|------------------|
| Small (24 stars) | 20 turns |
| Medium (48 stars) | 25 turns |
| Large (72 stars) | 30 turns |
| Huge (108 stars) | 35 turns |

---

## 9. Constants Summary

```json
{
  "council_constants": {
    "FORMATION_THRESHOLD": 0.50,
    "COUNCIL_INTERVAL": 25,
    "VICTORY_THRESHOLD": 0.6667,
    "MIN_VOTE_THRESHOLD": 1.0,
    "MIN_EFFECTIVE_VOTES": 50.0,
    "RELATION_WEIGHT": 0.5,
    "FEAR_WEIGHT": 15,
    "MAX_MILITARY_RATIO": 3.0,
    "BRIBERY_WEIGHT": 100,
    "MAX_BRIBERY_FACTOR": 50,
    "REPUTATION_WEIGHT": 0.15,
    "HAMSTER_COUNCIL_BONUS": 5,
    "ABSTAIN_THRESHOLD": 5,
    "LOW_SCORE_THRESHOLD": 20,
    "LOBBYING_TURNS": 5,
    "REJECT_PENALTY": -30,
    "MANDATE_COOLDOWN": 50,
    "ALLIANCE_VOTE_LOYALTY": 0.80,
    "CHAMELEON_LOYALTY": 0.50,
    "HERMIT_CRAB_ABSTAIN_CHANCE": 0.25,
    "DOMINANCE_COUNCIL_PENALTY": -20
  }
}
```

---

## 10. Data Tables (JSON)

### 10.1 Racial Vote Modifiers

```json
{
  "racial_vote_modifiers": [
    {
      "id": "hamsters",
      "fear_modifier": 1.0,
      "bribe_modifier": 1.0,
      "council_bonus": 5,
      "abstain_tendency": "low",
      "alliance_loyalty": 0.85,
      "notes": "Universal diplomat, receives +5 from all voters"
    },
    {
      "id": "guinea_pigs",
      "fear_modifier": 0.1,
      "bribe_modifier": 0.3,
      "council_bonus": 0,
      "abstain_tendency": "very_low",
      "alliance_loyalty": 0.90,
      "notes": "Immune to intimidation, insulted by bribes"
    },
    {
      "id": "chameleons",
      "fear_modifier": 1.0,
      "bribe_modifier": 1.2,
      "council_bonus": 0,
      "abstain_tendency": "medium",
      "alliance_loyalty": 0.50,
      "notes": "Opportunistic, low alliance loyalty"
    },
    {
      "id": "budgies",
      "fear_modifier": 0.4,
      "bribe_modifier": 0.5,
      "council_bonus": 0,
      "abstain_tendency": "low",
      "alliance_loyalty": 0.85,
      "notes": "Proud warriors, bribes are dishonorable"
    },
    {
      "id": "ferrets",
      "fear_modifier": 0.3,
      "bribe_modifier": 0.6,
      "council_bonus": 0,
      "abstain_tendency": "low",
      "alliance_loyalty": 0.70,
      "notes": "Predators respect strength"
    },
    {
      "id": "rats",
      "fear_modifier": 1.5,
      "bribe_modifier": 1.0,
      "council_bonus": 0,
      "abstain_tendency": "standard",
      "alliance_loyalty": 0.80,
      "notes": "Prefer peace, susceptible to threats"
    },
    {
      "id": "rabbits",
      "fear_modifier": 2.0,
      "bribe_modifier": 1.5,
      "council_bonus": 0,
      "abstain_tendency": "standard",
      "alliance_loyalty": 0.75,
      "notes": "Easily intimidated, desperate for protection"
    },
    {
      "id": "mice",
      "fear_modifier": 1.2,
      "bribe_modifier": 1.3,
      "council_bonus": 0,
      "abstain_tendency": "standard",
      "alliance_loyalty": 0.80,
      "notes": "Pragmatic, value practical gains"
    },
    {
      "id": "ants",
      "fear_modifier": 0.6,
      "bribe_modifier": 1.0,
      "council_bonus": 0,
      "abstain_tendency": "low",
      "alliance_loyalty": 0.95,
      "notes": "Hive-mind calculates optimal choice"
    },
    {
      "id": "hermit_crabs",
      "fear_modifier": 0.8,
      "bribe_modifier": 0.8,
      "council_bonus": 0,
      "abstain_tendency": "high",
      "alliance_loyalty": 0.90,
      "notes": "Isolationist, 25% random abstention"
    }
  ]
}
```

### 10.2 Racial Affinity Matrix

```json
{
  "racial_affinities": [
    {"voter": "guinea_pigs", "prefers": "guinea_pigs", "modifier": 20},
    {"voter": "guinea_pigs", "dislikes": "chameleons", "modifier": -20},
    {"voter": "budgies", "prefers": "budgies", "modifier": 15},
    {"voter": "budgies", "prefers": "ferrets", "modifier": 15},
    {"voter": "budgies", "dislikes": "chameleons", "modifier": -15},
    {"voter": "ferrets", "prefers": "ferrets", "modifier": 15},
    {"voter": "ferrets", "prefers": "budgies", "modifier": 15},
    {"voter": "ferrets", "dislikes": "rabbits", "modifier": -10},
    {"voter": "ants", "prefers": "ants", "modifier": 10},
    {"voter": "mice", "prefers": "mice", "modifier": 10},
    {"voter": "mice", "prefers": "rats", "modifier": 10},
    {"voter": "rats", "prefers": "rats", "modifier": 10},
    {"voter": "rats", "prefers": "mice", "modifier": 10},
    {"voter": "rabbits", "prefers": "hamsters", "modifier": 15},
    {"voter": "rabbits", "dislikes": "guinea_pigs", "modifier": -20},
    {"voter": "rabbits", "dislikes": "ferrets", "modifier": -20},
    {"voter": "hermit_crabs", "prefers": "hermit_crabs", "modifier": 10},
    {"voter": "*", "prefers": "hamsters", "modifier": 5, "notes": "Universal diplomat bonus"}
  ]
}
```

### 10.3 Reputation Penalties

```json
{
  "reputation_penalties": [
    {
      "id": "treaty_breaker",
      "penalty": -20,
      "duration_turns": 50,
      "stackable": true,
      "stack_duration": 25
    },
    {
      "id": "used_bioweapons",
      "penalty": -30,
      "duration_turns": -1,
      "permanent": true
    },
    {
      "id": "exterminated_population",
      "penalty": -40,
      "duration_turns": -1,
      "permanent": true
    },
    {
      "id": "destroyed_planet",
      "penalty": -25,
      "duration_turns": 100
    },
    {
      "id": "refused_mandate",
      "penalty": -15,
      "duration_turns": 50,
      "special": "Cannot win council"
    }
  ]
}
```

### 10.4 Council Outcomes

```json
{
  "council_outcomes": [
    {
      "id": "victory_accepted",
      "result": "game_end",
      "victory_type": "diplomatic",
      "winner_relation_change": 20,
      "loser_relation_change": -10
    },
    {
      "id": "victory_rejected_by_winner",
      "result": "game_continues",
      "penalty": -30,
      "cooldown": 50,
      "flag": "refused_mandate"
    },
    {
      "id": "victory_rejected_by_loser",
      "result": "galactic_war",
      "rejectors_allied": true,
      "acceptors_enemy": true
    },
    {
      "id": "no_decision",
      "result": "game_continues",
      "next_council": 25
    },
    {
      "id": "no_quorum",
      "result": "game_continues",
      "next_council": 25,
      "warning": "Insufficient votes cast"
    }
  ]
}
```

---

## 11. Worked Examples

### Example 1: Standard Council Vote

**Scenario:** Turn 150, 6 races remain

**Population:**
- Hamsters: 280 million (28%)
- Guinea Pigs: 250 million (25%)
- Rats: 180 million (18%)
- Budgies: 120 million (12%)
- Ants: 100 million (10%)
- Hermit Crabs: 70 million (7%)

**Candidates:** Hamsters (28%), Guinea Pigs (25%)

**Relations with Hamsters:**
- Guinea Pigs: -20 (Unfriendly)
- Rats: +60 (Friendly)
- Budgies: +30 (Neutral)
- Ants: +40 (Neutral)
- Hermit Crabs: +10 (Neutral)

**Relations with Guinea Pigs:**
- Hamsters: -20 (Unfriendly)
- Rats: -30 (Unfriendly)
- Budgies: +40 (Neutral, warrior respect)
- Ants: +20 (Neutral)
- Hermit Crabs: +5 (Neutral)

**Vote Calculations:**

*Rats voting:*
```
Score for Hamsters:
  Relation: 60 × 0.5 = +30
  Fear: (150/100 - 1) × 15 × 1.5 = +11.25
  Bribery: 0
  Racial: +10 (prefers Rats but +5 for Hamsters)
  Reputation: +5
  Hamster Bonus: +5
  Total: +61.25

Score for Guinea Pigs:
  Relation: -30 × 0.5 = -15
  Fear: (300/100 - 1) × 15 × 1.5 = +45
  Bribery: 0
  Racial: 0
  Reputation: -5 (treaty breaker)
  Total: +25

Rats vote: Hamsters (61.25 > 25)
```

*Budgies voting:*
```
Score for Hamsters:
  Relation: 30 × 0.5 = +15
  Fear: (150/200 - 1) × 15 × 0.4 = -3
  Racial: +5
  Hamster Bonus: +5
  Total: +22

Score for Guinea Pigs:
  Relation: 40 × 0.5 = +20
  Fear: (300/200 - 1) × 15 × 0.4 = +3
  Racial: +10 (warrior respect)
  Total: +33

Budgies vote: Guinea Pigs (33 > 22)
```

*Ants voting:*
```
Score for Hamsters: +25 + 5 + 5 = +35
Score for Guinea Pigs: +10 + 8 = +18
Ants vote: Hamsters
```

*Hermit Crabs:*
```
25% abstention chance → Roll: 0.15 → Does NOT abstain
Score for Hamsters: +5 + 5 + 5 = +15
Score for Guinea Pigs: +2.5 + 5 = +7.5
Hermit Crabs vote: Hamsters
```

**Final Tally:**
- Hamsters: 28% (self) + 18% (Rats) + 10% (Ants) + 7% (Hermit Crabs) = 63%
- Guinea Pigs: 25% (self) + 12% (Budgies) = 37%

**Threshold:** 67%

**Result:** NO DECISION (Hamsters at 63%, need 67%)

Game continues, Council reconvenes in 25 turns.

---

### Example 2: Bribery Changes Outcome

**Same scenario, but Hamsters bribe Budgies:**

*Bribe: 300 BC + Impulse Drive (Tier 6)*
```
Bribe Value: 300 + (6 × 50 + 1000) = 300 + 1300 = 1600
Budgie Economy: 80 BC/turn
Bribery Factor: (1600 / 80) × 100 × 0.5 = 1000 → capped to +50

New Score for Hamsters:
  Previous: +22
  Bribery: +50
  Total: +72

Score for Guinea Pigs: +33 (unchanged)

Budgies vote: Hamsters (72 > 33)
```

**New Tally:**
- Hamsters: 28% + 18% + 10% + 7% + 12% = 75%
- Guinea Pigs: 25%

**Result:** HAMSTERS WIN (75% ≥ 67%)

---

### Example 3: Abstention Scenario

**Scenario:** Hermit Crabs have -10 relation with both candidates

```
Score for Hamsters:
  Relation: -10 × 0.5 = -5
  Fear: 0 (equal military)
  Racial: +5
  Hamster Bonus: +5
  Total: +5

Score for Guinea Pigs:
  Relation: -10 × 0.5 = -5
  Fear: +6
  Racial: 0
  Total: +1

Both scores positive but within ABSTAIN_THRESHOLD (5) and below LOW_SCORE_THRESHOLD (20).
Hermit Crabs: ABSTAIN
```

**With Abstention:**
```
Effective Total: 100% - 7% = 93%
Required: ceil(93 × 0.667) = 62%
```

Hamsters now need 62% instead of 67% to win.

---

## 12. Edge Cases

### 12.1 Race at War with Both Candidates

The race **must abstain** - cannot vote for an active enemy.

### 12.2 Candidate with Zero Votes

If a candidate receives 0% votes (everyone abstained or voted for opponent):
- Opponent wins if they have ≥67% of effective votes
- Otherwise, no decision

### 12.3 Both Candidates Extinct Mid-Turn

- Council does not convene
- Domination Victory check triggered instead

### 12.4 Player is Only Non-Candidate

Player must still vote. Their vote weight affects outcome even though they cannot win.

### 12.5 50% Exact Split

- Both candidates at 50% of effective votes
- Neither reaches 67%
- Result: No decision

### 12.6 Negative Total Score

If a voter's total score for both candidates is negative (both hated):
- Abstain
- Exception: Guinea Pigs always vote (pick least negative)

### 12.7 Alliance with Enemy Candidate

If formally allied with a candidate but at war with them (broken alliance):
- War status takes priority
- Must abstain

---

## 13. Algorithm: Complete Council Resolution

```pseudocode
function ResolveCouncil(game_state):
    // Step 1: Calculate vote weights
    vote_weights = CalculateVoteWeights(game_state.living_races)
    
    // Step 2: Select candidates
    (candidate1, candidate2) = SelectCandidates(vote_weights)
    
    // Step 3: Determine each race's vote
    votes = {}
    abstentions = {}
    
    for each race in game_state.living_races:
        if race == candidate1:
            votes[race] = candidate1
        elif race == candidate2:
            votes[race] = candidate2
        else:
            vote = DetermineVote(race, candidate1, candidate2)
            if vote == ABSTAIN:
                abstentions[race] = vote_weights[race]
            else:
                votes[race] = vote
    
    // Step 4: Calculate totals
    effective_total = 100.0 - sum(abstentions.values())
    
    if effective_total < MIN_EFFECTIVE_VOTES:
        return CouncilResult("NO_QUORUM")
    
    c1_votes = sum(vote_weights[r] for r in votes if votes[r] == candidate1)
    c2_votes = sum(vote_weights[r] for r in votes if votes[r] == candidate2)
    
    // Step 5: Determine outcome
    threshold = ceil(effective_total × VICTORY_THRESHOLD)
    
    if c1_votes >= threshold:
        return CouncilResult("VICTORY", candidate1, c1_votes)
    elif c2_votes >= threshold:
        return CouncilResult("VICTORY", candidate2, c2_votes)
    else:
        return CouncilResult("NO_DECISION", null, max(c1_votes, c2_votes))

function ProcessPlayerResponse(result, player):
    if result.outcome == "NO_DECISION":
        ScheduleNextCouncil(current_turn + COUNCIL_INTERVAL)
        return
    
    if result.winner == player:
        choice = PromptPlayer("Accept title of Master of Orion?")
        if choice == ACCEPT:
            EndGame(player, "DIPLOMATIC_VICTORY")
        else:
            ApplyRefusedMandate(player)
            ScheduleNextCouncil(current_turn + MANDATE_COOLDOWN)
    else:
        choice = PromptPlayer("Accept " + result.winner.name + " as Master of Orion?")
        if choice == ACCEPT:
            EndGame(result.winner, "DIPLOMATIC_VICTORY")
        else:
            DeclareGalacticWar(player, result.winner, result.acceptors)
```

---

*Document Version: 2.0*
*Last Updated: 2026-03-22*
*Status: Complete - Implementation Ready*
