# Random Events System - Complete Specification

## Overview

The Random Events System introduces unpredictable occurrences that add variety and challenge to each playthrough. Events range from devastating space monsters to beneficial discoveries, creating narrative moments and strategic disruptions that keep games fresh.

**Design Philosophy:** "Dignified Ridiculousness" - Events are presented with gravitas despite the absurd setting. A plague devastating a hamster colony is treated as seriously as any galactic catastrophe.

**MOO1 Faithful:** This specification follows Master of Orion 1 mechanics for event frequency, types, and effects.

---

## 1. Event System Fundamentals

### 1.1 Event Probability

Events are checked at the end of each turn during the event processing phase.

**Base Event Chance:**
```
EventChance = BASE_CHANCE + (TurnNumber × TURN_MODIFIER)
```

| Parameter | Value | Description |
|-----------|-------|-------------|
| BASE_CHANCE | 3% | Initial probability at turn 1 |
| TURN_MODIFIER | 0.07% | Additional chance per turn |
| MAXIMUM_CHANCE | 10% | Hard cap (reached ~turn 100) |

**Difficulty Modifiers:**

| Difficulty | Event Frequency Modifier | Bad Event Bias |
|------------|--------------------------|----------------|
| Simple | 0.50× | -25% (fewer bad events) |
| Easy | 0.75× | -10% |
| Average | 1.00× | 0% |
| Hard | 1.25× | +10% |
| Impossible | 1.50× | +20% (more bad events) |

### 1.2 Event Cooldown

To prevent event spam, a cooldown system is in place:

```
MinTurnsBetweenEvents = 5
MinTurnsBetweenSameEvent = 50
```

A specific event cannot occur twice within 50 turns, preventing repetitive experiences.

### 1.3 Event Target Selection

Most events target a specific empire or planet:

**Empire Selection:**
- 50% chance: Targets current player
- 50% chance: Targets random empire (can be player)

**Planet Selection (for planetary events):**
- Weighted by population (larger colonies more likely)
- Special planets (Homeworld, Orion) have modified weights
- Homeworld: 0.5× weight (protected somewhat)
- Newly colonized (<10 turns): 0.25× weight

### 1.4 Event Category Distribution

When an event triggers, category is determined:

| Category | Weight | Examples |
|----------|--------|----------|
| Disasters | 30% | Plague, Earthquake, Comet |
| Space Monsters | 15% | Amoeba, Crystal, (Guardian excluded) |
| Discoveries | 25% | Derelict, Artifacts, Rich Planet |
| Diplomacy | 15% | Blunder, Breakthrough, Tribute |
| Opportunities | 15% | Piracy, Donation, Leader |

Bad Event Bias adjusts Disasters vs beneficial categories.

---

## 2. Space Monsters

Space monsters are the most dramatic random events, spawning powerful entities that attack colonies. They cannot be negotiated with and must be destroyed or avoided.

### 2.1 Space Amoeba (The Devourer)

**Pet-Theme Name:** The Cosmic Cheek-Pouch
*"A vast protoplasmic mass drifting through space, consuming all organic matter it encounters. Some whisper it was once a pet store aquarium organism, awakened and grown beyond comprehension."*

**Statistics:**

| Attribute | Value | Notes |
|-----------|-------|-------|
| Hit Points | 1,000 | Enormous health pool |
| Regeneration | 100 HP/turn | Heals every combat round |
| Attack | 25 | Per combat round |
| Defense | 0 | Cannot dodge |
| Shields | None | Vulnerable to all damage |
| Speed | 1 parsec/turn | Very slow movement |
| Combat Speed | 1 | Slow in tactical combat |

**Combat Behavior:**
- Moves toward nearest colony each turn
- In combat: Moves toward largest ship stack
- Attacks only ships directly adjacent
- Cannot retreat
- Regenerates 100 HP at the start of each combat round

**Arrival Mechanics:**
```
ArrivalLocation = Random edge of galaxy
TargetSelection = Nearest enemy colony (any empire)
MovementPath = Direct line, ignoring nebulae effects
```

**Effects on Contact:**
If Amoeba reaches a colony and is not intercepted:
- Each turn in orbit: Kills 10% population (rounded up)
- Destroys 5 factories per turn
- Cannot damage missile bases or shields directly
- Colony survives until population = 0

**Defeating the Amoeba:**

**Required Firepower:**
```
MinDamagePerRound = Regeneration + 1 = 101 damage
TimeToKill = ceil(1000 / (DamagePerRound - 100))
```

**Example Fleet Sizes Needed:**

| Weapon Tech | Ships Needed | Damage/Round | Rounds to Kill |
|-------------|--------------|--------------|----------------|
| Laser (1-4 dmg) | ~60 mediums | ~150 | ~10 rounds |
| Fusion Beam (6-16 dmg) | ~15 mediums | ~165 | ~7 rounds |
| Stellar Converter (10-35 dmg) | ~6 mediums | ~135 | ~30 rounds |

**Rewards for Destruction:**
- Empire-wide notification: *"The Cosmic Cheek-Pouch has been destroyed!"*
- +15 relations with ALL races (great service to galaxy)
- Technology reward: **Advanced Damage Control** (if not owned)
  - Grants Automated Repair II: 15% HP repair per round

**Probability:**

| Turn Range | Spawn Chance (if event triggers) |
|------------|----------------------------------|
| 1-50 | 0% (too early) |
| 51-100 | 5% |
| 101-200 | 8% |
| 201+ | 10% |

---

### 2.2 Space Crystal (The Prism Terror)

**Pet-Theme Name:** The Crystal Cage
*"A lattice of living crystal, grown from fragments of an Ancient One's hermit crab shell. It reflects beam weapons back at their source with devastating precision."*

**Statistics:**

| Attribute | Value | Notes |
|-----------|-------|-------|
| Hit Points | 800 | High, but no regen |
| Regeneration | 0 | Does not heal |
| Attack | 15 | Per combat round |
| Defense | 5 | Some evasion |
| Shields | Class X | Absorbs 10 damage per hit |
| Beam Reflection | 50% | Reflects beams back at attacker |
| Speed | 2 parsecs/turn | Faster than Amoeba |
| Combat Speed | 2 | Moderate speed |

**Combat Behavior:**
- Moves toward richest (Ultra Rich > Rich > Normal) colony
- In combat: Attacks highest-value ship first
- Reflects 50% of beam weapon damage back at attacker
  - Reflected damage ignores attacker's shields
- Missiles and torpedoes are NOT reflected
- Cannot retreat

**Reflection Mechanics:**
```
ReflectedDamage = floor(IncomingBeamDamage × 0.50)
// Applied to attacking ship, bypasses shields
```

**Effects on Contact:**
If Crystal reaches a colony:
- Each turn: Kills 15% population
- Destroys 10 factories per turn
- Destroys 1 missile base per turn
- Ignores planetary shields for population kills

**Defeating the Crystal:**

**Strategy:** Use missiles, torpedoes, and bombs only!

**Missile Damage Table (vs Class X Shields):**

| Missile Type | Base Damage | After Shields | Missiles to Kill |
|--------------|-------------|---------------|------------------|
| Nuclear | 4 | 0 | Ineffective |
| Hyper-V | 6 | 0 | Ineffective |
| Hyper-X | 8 | 0 | Ineffective |
| Scatter Pack V | 5×5=25 | 5×0=0 | Ineffective |
| Merculite | 10 | 0 | Ineffective |
| Stinger | 15 | 5 | 160 |
| Scatter Pack VII | 5×7=35 | 5×0=0 | Ineffective |
| Pulson | 20 | 10 | 80 |
| Hercular | 25 | 15 | 54 |
| Zeon | 30 | 20 | 40 |
| Scatter Pack X | 5×10=50 | 5×0=0 | Ineffective |

**Note:** Individual scatter pack submunitions each face shield absorption, making them ineffective. Only high-damage single-warhead missiles work.

**Torpedo Damage Table (vs Class X Shields):**

| Torpedo Type | Base Damage | After Shields | Torpedoes to Kill |
|--------------|-------------|---------------|-------------------|
| Anti-Matter | 30 | 20 | 40 |
| Hellfire | 25 | 15 | 54 |
| Proton | 40 | 30 | 27 |
| Plasma | 75 | 65 | 13 |

**Rewards for Destruction:**
- +20 relations with ALL races
- Technology reward: **Hard Shields** (if not owned)
  - Shields cannot be bypassed by shield-piercing weapons

**Probability:**

| Turn Range | Spawn Chance |
|------------|--------------|
| 1-75 | 0% |
| 76-150 | 4% |
| 151-250 | 7% |
| 251+ | 9% |

---

### 2.3 The Guardian of Orion

**Pet-Theme Name:** The Eternal Sentinel
*"Placed by the Ancient Ones to guard the Cosmic Wheel, this massive construct has slumbered for ten thousand years. It awakens only for those who dare approach Orion itself."*

**Note:** The Guardian is NOT a random event. It spawns at game start at Orion and remains until defeated. However, its statistics are included here for completeness.

**Statistics:**

| Attribute | Value | Notes |
|-----------|-------|-------|
| Hit Points | 32,000 | Massive health pool |
| Regeneration | 0 | Does not heal |
| Armor | Neutronium (4×) | 128,000 effective HP |
| Attack Rating | +7 | Very accurate |
| Defense Rating | +5 | Hard to hit |
| Shields | Class XV | Absorbs 15 damage per hit |
| Weapons | Plasma Torpedoes, Stellar Converter, Death Ray |
| Special | Repulsor Beam, Lightning Shield |
| Speed | 0 (stationary) | Does not leave Orion |
| Combat Speed | 3 | Moderate in tactical |

**Guardian Weapons:**

| Weapon | Damage | Effect |
|--------|--------|--------|
| Plasma Torpedo ×4 | 75 each | Cannot be intercepted |
| Stellar Converter ×2 | 10-35 each | Always hits, destroys on kill |
| Death Ray ×2 | Instant kill | 3-6% chance per hit vs ships |

**Guardian Specials:**
- **Repulsor Beam:** Pushes ships back 2 hexes, prevents adjacency
- **Lightning Shield:** 50% chance to destroy incoming missiles
- **Hard Shields:** Shield-piercing weapons don't bypass

**Defeating the Guardian:**

This requires late-game technology. Estimated fleet requirements:

| Fleet Composition | Approximate Success |
|-------------------|---------------------|
| 100× Huge w/ Plasma + Shield XV | Good chance |
| 50× Titan w/ Stellar Converter | Moderate chance |
| 200× Large w/ Zeon Missiles | Possible with losses |

**Combat Strategy:**
1. Use Black Hole Generators (25% instant kill chance)
2. Deploy High Energy Focus ships for initiative
3. Accept high casualties - Guardian cannot retreat

**Rewards for Destruction:**
- **Orion Colony:** Ultra Rich, Artifacts (4× research)
- **Technology Package:** 4 random technologies from any field, guaranteed top-tier
- **Death Ray Technology** (if not owned)
- **+25 relations** with ALL races
- **GNN Announcement:** *"[Empire] has conquered Orion!"*

**Unique Mechanics:**
- Guardian respawns if Space Amoeba or Crystal reaches Orion (bug in MOO1, feature here)
- Guardian does not attack Orion's population
- Ships must engage Guardian to enter orbit

---

### 2.4 Space Monster Spawn Algorithm

```pseudocode
function CheckMonsterSpawn(turn, galaxy):
    if turn < 50:
        return null  // Too early for monsters
    
    // Only one monster active at a time
    if galaxy.active_monster != null:
        return null
    
    // Calculate spawn chance
    base_chance = GetMonsterSpawnChance(turn)
    
    roll = random(1, 100)
    if roll > base_chance:
        return null
    
    // Select monster type
    amoeba_weight = GetAmoebaWeight(turn)
    crystal_weight = GetCrystalWeight(turn)
    
    total_weight = amoeba_weight + crystal_weight
    monster_roll = random(1, total_weight)
    
    if monster_roll <= amoeba_weight:
        monster = CreateAmoeba()
    else:
        monster = CreateCrystal()
    
    // Place at galaxy edge
    monster.position = RandomGalaxyEdge()
    monster.target = FindNearestColony(monster.position)
    
    // Announce
    GNN_Broadcast("Space Monster Alert!", monster)
    
    return monster
```

---

## 3. Disasters

Natural and technological disasters that harm a specific colony. These events test player resilience and resource management.

### 3.1 Plague

**Pet-Theme:** *"A mysterious illness sweeps through the habitrail ventilation systems..."*

**Trigger Requirements:**
- Colony population ≥ 30 million
- No colony has had plague in last 30 turns

**Effect:**
```
PopulationLost = floor(CurrentPopulation × PLAGUE_SEVERITY)
```

| Severity Roll | Severity | Population Lost |
|---------------|----------|-----------------|
| 1-40 | Minor | 10% |
| 41-70 | Moderate | 20% |
| 71-90 | Severe | 30% |
| 91-100 | Catastrophic | 40% |

**Duration:** Instant (single turn effect)

**Mitigation:**
- **Bio Toxin Antidote:** Reduces severity by 1 tier
- **Universal Antidote:** Reduces severity by 2 tiers
- **Planetology Tech 15+:** 50% chance to halve losses
- **Hermit Crabs:** Immune (crystalline biology)

**Recovery:**
- Normal population growth resumes next turn
- No permanent effects

**Probability:** 15% of Disaster events

---

### 3.2 Earthquake

**Pet-Theme:** *"Seismic activity threatens the underground burrow complexes..."*

**Trigger Requirements:**
- Colony has ≥ 50 factories OR ≥ 5 missile bases
- Planet is not Hostile environment (radiation/toxic = fragile, no quakes)

**Effect:**
```
FactoriesLost = floor(CurrentFactories × QUAKE_SEVERITY)
BasesLost = floor(CurrentBases × QUAKE_SEVERITY × 0.5)
PopulationLost = floor(CurrentPopulation × 0.05)  // 5% always
```

| Severity Roll | Severity | Factory Loss | Base Loss |
|---------------|----------|--------------|-----------|
| 1-50 | Minor | 10% | 5% |
| 51-80 | Major | 20% | 10% |
| 81-100 | Catastrophic | 35% | 20% |

**Duration:** Instant

**Mitigation:**
- **Planetary Shield (any):** -5% from all losses
- **Construction Tech 20+:** 25% chance to halve factory losses
- **Hermit Crabs:** -50% factory losses (crystalline structures)

**Probability:** 12% of Disaster events

---

### 3.3 Comet Strike

**Pet-Theme:** *"A massive ice comet is on collision course with one of your worlds..."*

**Trigger Requirements:**
- Any colonized planet
- No comet event in last 50 turns

**Mechanics:**
Unlike other disasters, comet gives WARNING:

```
WarningTurns = 5  // Turns before impact
```

**Warning Phase:**
- Player notified: *"A comet approaches [Planet]! Impact in [N] turns!"*
- Can redirect ships to intercept

**Interception:**
```
CometHP = 500
DamagePerShip = ShipWeaponDamage × ShipsInOrbit
```

Each turn of the warning phase, ships in orbit can damage the comet.

| Comet HP at Impact | Impact Severity |
|--------------------|-----------------|
| 0 (destroyed) | None |
| 1-100 | Minor fragments |
| 101-300 | Partial strike |
| 301-500 | Full impact |

**Impact Effects:**

| Severity | Population Lost | Factories Lost | Bases Lost |
|----------|-----------------|----------------|------------|
| None | 0% | 0% | 0% |
| Minor | 5% | 5% | 0% |
| Partial | 20% | 15% | 10% |
| Full | 40% | 30% | 25% |

**Full Impact Special:**
- Planet environment may degrade one tier (Terran → Jungle, Jungle → Arid, etc.)
- 10% chance if impact is Full severity

**Probability:** 8% of Disaster events

---

### 3.4 Industrial Accident

**Pet-Theme:** *"A catastrophic failure in the automated treat-dispensing factories..."*

**Trigger Requirements:**
- Colony has ≥ 100 factories
- Colony has Industrial Tech level < 30 (advanced tech = safer)

**Effect:**
```
FactoriesLost = 20 + random(0, 30)  // 20-50 factories
PollutionGenerated = FactoriesLost × 10  // Must be cleaned up
```

**Duration:** Instant

**Special:** The pollution generated must be cleaned via ECO slider, potentially disrupting other colony activities.

**Mitigation:**
- **Atmospheric Terraforming:** Halves pollution generated
- **Eco Restoration 10+:** -25% factories lost

**Probability:** 10% of Disaster events

---

### 3.5 Rebellion

**Pet-Theme:** *"The colonists demand independence! The exercise wheels have fallen silent in protest!"*

**Trigger Requirements:**
- Colony has low morale (< 60%)
- Colony is NOT homeworld
- Colony population ≥ 20 million
- Empire has ≥ 3 colonies (need alternatives)

**Mechanics:**

**Phase 1 - Unrest (1 turn):**
- Production halted
- Warning message

**Phase 2 - Resolution:**

| Roll | Outcome | Effect |
|------|---------|--------|
| 1-40 | Suppressed | -10% population, production resumes |
| 41-70 | Ongoing | Continues for 5 more turns, no production |
| 71-90 | Independence | Colony becomes neutral |
| 91-100 | Defection | Colony joins rival empire |

**Modifiers to Roll:**
- Garrison present: -15 (less likely to rebel)
- Fleet in orbit: -10
- Espionage incited: +20 (see Espionage spec)
- Adjacent to enemy: +15

**If Independence:**
- Colony goes neutral (can be recolonized)
- All ships in orbit become neutral (lost)

**If Defection:**
- Roll for which empire gains the colony
- Weight by proximity and relations
- Chameleon incitement targets specific empire

**Probability:** 5% of Disaster events (rare, but devastating)

---

### 3.6 Computer Virus

**Pet-Theme:** *"A corrupted data packet has spread through the Imperial hamster-mail system..."*

**Trigger Requirements:**
- Empire has ≥ 2 colonies with Computers tech
- No virus event in last 40 turns

**Effect:**
```
TechFieldAffected = RandomField()
ResearchLost = floor(CurrentFieldRP × 0.25)  // 25% of current progress
```

**Duration:** Instant

**Additional Effect:** All espionage operations suffer -10% success for 5 turns (compromised networks)

**Mitigation:**
- **Hyperspace Communications Tech:** 50% chance to prevent entirely
- **Computer Tech 30+:** Research loss reduced to 15%

**Probability:** 10% of Disaster events

---

### 3.7 Super Nova

**Pet-Theme:** *"The star of [System] is about to go supernova! All life will be extinguished!"*

**Trigger Requirements:**
- Galaxy has ≥ 20 stars remaining
- Target star is NOT a homeworld system
- Target star has been colonized (makes it dramatic)
- No supernova in last 100 turns

**Mechanics:**

**Warning Phase:** 10 turns before destruction

**Evacuation:**
- Transports can evacuate population
- Each transport saves 1 population unit
- Ships can escape (just leave the system)

**Detonation:**
- Star becomes Dead (no habitable planets)
- All population, factories, bases destroyed
- Any ships in system destroyed
- Planet becomes "Asteroid Field" (not colonizable)

**No Mitigation:** This cannot be prevented, only evacuated.

**Probability:** 3% of Disaster events (very rare)

---

### 3.8 Depleted Planet

**Pet-Theme:** *"The mineral veins of [Planet] have been exhausted..."*

**Trigger Requirements:**
- Planet is Rich or Ultra Rich
- Colony has ≥ 100 factories
- Colony has existed for ≥ 50 turns

**Effect:**
```
NewResourceLevel = CurrentLevel - 1
// Ultra Rich → Rich → Normal → Poor → Ultra Poor
```

**Duration:** Permanent

**Special:** This represents over-extraction and is partially player-caused (heavy industry).

**Probability:** 7% of Disaster events

---

## 4. Discoveries

Beneficial events that provide resources, technology, or advantages.

### 4.1 Ancient Derelict

**Pet-Theme:** *"An Ancient One's spacecraft has been discovered drifting in deep space..."*

**Trigger Requirements:**
- Any turn after turn 20
- Scout or ship exploring uncolonized star

**Effect Options:**

| Roll | Discovery | Effect |
|------|-----------|--------|
| 1-30 | Empty Hulk | +50-200 BC salvage |
| 31-60 | Damaged Technology | +1 random tech (any field) |
| 61-85 | Pristine Archive | +1 random top-tier tech |
| 86-95 | Functioning Ship | +1 Huge ship with random loadout |
| 96-100 | Ancient Treasure | +500-1000 BC + tech |

**Special Mechanics:**
- Ship gained from discovery has Ancient design (cannot be copied)
- Tech gained may be above current research tier
- BC is added directly to Reserve

**Probability:** 20% of Discovery events

---

### 4.2 Fertile Planet

**Pet-Theme:** *"The soil of [Planet] has proven exceptionally rich with nutrients!"*

**Trigger Requirements:**
- Planet is Standard environment (Minimal to Terran)
- Planet is not already Gaia
- Planet has been colonized ≥ 10 turns

**Effect:**
```
NewEnvironment = CurrentEnvironment + 1  // Up to Terran
// OR
PopulationBonus = +10 to max population
```

| Roll | Outcome |
|------|---------|
| 1-50 | Environment upgrade |
| 51-100 | +10 max population (without terraforming) |

**Duration:** Permanent

**Probability:** 15% of Discovery events

---

### 4.3 Mineral Rich Planet

**Pet-Theme:** *"A new vein of precious metals has been discovered on [Planet]!"*

**Trigger Requirements:**
- Planet is Poor, Ultra Poor, or Normal resource level
- Planet has been colonized ≥ 20 turns

**Effect:**
```
NewResourceLevel = CurrentLevel + 1
// Ultra Poor → Poor → Normal → Rich
```

**Duration:** Permanent

**Special:** Cannot upgrade to Ultra Rich via this event.

**Probability:** 15% of Discovery events

---

### 4.4 Artifact World Discovery

**Pet-Theme:** *"Ancient One ruins have been uncovered beneath the surface of [Planet]!"*

**Trigger Requirements:**
- Colony exists without Artifacts special
- Turn ≥ 50

**Effect:**
- Planet gains Artifacts special
- +100% research output from this colony (2× multiplier)

**Duration:** Permanent

**Flavor:** *"The partially functioning databases contain records of technologies long forgotten..."*

**Probability:** 10% of Discovery events (valuable)

---

### 4.5 Technology Breakthrough

**Pet-Theme:** *"Your scientists have made an unexpected breakthrough!"*

**Trigger Requirements:**
- Actively researching in at least one field
- Research progress ≥ 50% toward current tech

**Effect:**
```
ResearchGained = floor(RemainingCost × 0.50)  // Complete half of remaining
```

**OR** (roll 1-100):

| Roll | Outcome |
|------|---------|
| 1-70 | 50% research completion |
| 71-90 | 75% research completion |
| 91-100 | Instant discovery (100%) |

**Probability:** 15% of Discovery events

---

### 4.6 Ancient Cache

**Pet-Theme:** *"A hidden vault of the Ancient Ones has been found!"*

**Trigger Requirements:**
- Any colony
- Turn ≥ 30

**Effect:**
```
CacheValue = 200 + random(0, 300)  // 200-500 BC
```

Added directly to Empire Reserve.

**Probability:** 25% of Discovery events (common but modest)

---

## 5. Diplomatic Incidents

Events that affect relationships between empires.

### 5.1 Diplomatic Blunder

**Pet-Theme:** *"Your ambassador accidentally offended the [Race] delegation by commenting on their fur!"*

**Trigger Requirements:**
- Have diplomatic contact with at least 1 race
- Relations are not at War
- Relations are not Allied

**Effect:**
```
RelationPenalty = -10 to -30  // Random
AffectedRace = Random race in contact
```

**Duration:** Instant (permanent relation change)

**Probability:** 25% of Diplomacy events

---

### 5.2 Diplomatic Breakthrough

**Pet-Theme:** *"A cultural exchange has led to unexpected friendship!"*

**Trigger Requirements:**
- Have diplomatic contact
- Relations are Neutral or better
- No active wars

**Effect:**
```
RelationBonus = +10 to +25
AffectedRace = Random race with Neutral+ relations
```

**Duration:** Instant

**Special:** May trigger treaty offer from affected race (50% chance).

**Probability:** 20% of Diplomacy events

---

### 5.3 Generous Donation

**Pet-Theme:** *"An anonymous benefactor from [Race] has donated to your cause!"*

**Trigger Requirements:**
- Relations ≥ Neutral with at least one race
- That race has economy > 50% of yours

**Effect:**
```
DonationAmount = floor(TheirIncome × 0.05)  // 5% of their income
RelationBonus = +5
```

**Duration:** Instant

**Probability:** 15% of Diplomacy events

---

### 5.4 Border Skirmish

**Pet-Theme:** *"Your ships and [Race] ships exchanged fire in disputed space!"*

**Trigger Requirements:**
- Have borders adjacent to another race
- Relations are Neutral to Tense
- Both empires have military presence in region

**Effect:**

| Roll | Outcome |
|------|---------|
| 1-40 | Your ships destroyed a scout: -15 relations |
| 41-60 | Their ships destroyed your scout: -10 relations |
| 61-80 | Mutual exchange: -20 relations, possible war |
| 81-100 | De-escalation: -5 relations, crisis averted |

**War Trigger:** If relations drop below -75, automatic war declaration.

**Probability:** 30% of Diplomacy events

---

### 5.5 Trade Dispute

**Pet-Theme:** *"A shipment of premium sunflower seeds has gone missing, and accusations fly!"*

**Trigger Requirements:**
- Have trade treaty with at least one race
- Trade has been active ≥ 10 turns

**Effect:**

| Roll | Outcome |
|------|---------|
| 1-30 | Resolved in your favor: +50 BC, +5 relations |
| 31-60 | Compromise: No BC change, -5 relations |
| 61-90 | Resolved against you: -50 BC, -10 relations |
| 91-100 | Treaty cancelled: Trade ends, -20 relations |

**Probability:** 10% of Diplomacy events

---

## 6. Opportunities

Events that provide tactical or economic advantages.

### 6.1 Pirate Raiders

**Pet-Theme:** *"Space pirates have established a base near your territory!"*

**Trigger Requirements:**
- Empire has ≥ 3 colonies
- Turn ≥ 25
- No pirates currently active

**Mechanics:**

**Pirate Base Spawn:**
- Location: Uncolonized star near player border
- Fleet: 5-15 medium ships with era-appropriate tech

**Pirate Behavior:**
- Each turn: 30% chance to raid nearest colony
- Raid effect: -5% production for 1 turn, -10 BC
- Pirates steal +10 BC per successful raid

**Defeating Pirates:**
- Send fleet to pirate base
- Combat against pirate fleet
- Victory: +100-300 BC loot, pirates eliminated

**Duration:** Until defeated or 20 turns (then they leave)

**Probability:** 15% of Opportunity events

---

### 6.2 Mercenary Offer

**Pet-Theme:** *"A band of independent warriors seeks employment!"*

**Trigger Requirements:**
- Empire has ≥ 200 BC in reserve
- Turn ≥ 40

**Effect:**
- Offered: 1-3 Large ships with good loadouts
- Cost: 100-200 BC each
- Ships have "Mercenary" flag (higher maintenance: 150%)

**Decision:** Accept (pay BC, gain ships) or Decline

**Probability:** 10% of Opportunity events

---

### 6.3 Scientific Genius

**Pet-Theme:** *"A brilliant scientist has emerged from your populace!"*

**Trigger Requirements:**
- Any turn
- Not currently researching top-tier tech in all fields

**Effect:**
```
ResearchBonus = +25% to one random field for 25 turns
```

**Duration:** 25 turns

**Flavor:** The genius eventually retires/dies, ending the bonus.

**Probability:** 15% of Opportunity events

---

### 6.4 Industrial Boom

**Pet-Theme:** *"A new manufacturing technique has revolutionized production!"*

**Trigger Requirements:**
- Colony has ≥ 50 factories
- Colony is not at maximum factories

**Effect:**
```
FreeFactories = 10 + random(0, 20)  // 10-30 free factories
TargetColony = Random eligible colony
```

**Duration:** Instant

**Probability:** 20% of Opportunity events

---

### 6.5 Population Boom

**Pet-Theme:** *"An unusually fertile season has led to a baby boom!"*

**Trigger Requirements:**
- Colony has < 80% max population
- Colony is not Hostile environment

**Effect:**
```
PopulationGained = 5 + random(0, 10)  // 5-15 million
TargetColony = Random eligible colony
```

**Duration:** Instant

**Note:** Cannot exceed max population.

**Probability:** 15% of Opportunity events

---

### 6.6 Defector Arrival

**Pet-Theme:** *"A high-ranking official from [Race] has defected to your empire!"*

**Trigger Requirements:**
- Have contact with at least one race
- Relations are Tense or worse with at least one race
- Turn ≥ 50

**Effect:**

| Roll | Defector Type | Benefit |
|------|---------------|---------|
| 1-40 | Scientist | +1 random tech from their empire |
| 41-70 | General | +10% combat effectiveness for 20 turns |
| 71-90 | Spy | +30% espionage success vs that race for 20 turns |
| 91-100 | Noble | +200 BC, +10% production on one colony for 20 turns |

**Side Effect:** -10 relations with the defector's original race.

**Probability:** 10% of Opportunity events

---

### 6.7 Wormhole Discovery

**Pet-Theme:** *"A stable wormhole has been discovered linking [System A] to [System B]!"*

**Trigger Requirements:**
- Empire has ≥ 5 explored systems
- Turn ≥ 30
- No active wormholes in galaxy

**Effect:**
- Creates permanent two-way wormhole
- Instant travel between endpoints (1 turn)
- Both endpoints must be in explored space

**Strategic Value:** Highly dependent on location. Can bypass enemy territory.

**Duration:** Permanent (once per game)

**Probability:** 5% of Opportunity events (rare, impactful)

---

## 7. Event Data Tables (JSON)

### 7.1 Complete Event List

```json
{
  "random_events": {
    "space_monsters": [
      {
        "id": "space_amoeba",
        "name": "Space Amoeba",
        "pet_name": "The Cosmic Cheek-Pouch",
        "category": "space_monster",
        "hp": 1000,
        "regeneration": 100,
        "attack": 25,
        "defense": 0,
        "shields": 0,
        "speed_map": 1,
        "speed_combat": 1,
        "spawn_turn_min": 51,
        "spawn_weight_by_turn": [
          {"turn_range": [51, 100], "weight": 5},
          {"turn_range": [101, 200], "weight": 8},
          {"turn_range": [201, 9999], "weight": 10}
        ],
        "colony_effect_per_turn": {
          "population_percent": -10,
          "factories_flat": -5,
          "bases_flat": 0
        },
        "reward_relations_all": 15,
        "reward_tech": "advanced_damage_control"
      },
      {
        "id": "space_crystal",
        "name": "Space Crystal",
        "pet_name": "The Crystal Cage",
        "category": "space_monster",
        "hp": 800,
        "regeneration": 0,
        "attack": 15,
        "defense": 5,
        "shields": 10,
        "beam_reflection": 0.50,
        "speed_map": 2,
        "speed_combat": 2,
        "spawn_turn_min": 76,
        "spawn_weight_by_turn": [
          {"turn_range": [76, 150], "weight": 4},
          {"turn_range": [151, 250], "weight": 7},
          {"turn_range": [251, 9999], "weight": 9}
        ],
        "colony_effect_per_turn": {
          "population_percent": -15,
          "factories_flat": -10,
          "bases_flat": -1
        },
        "reward_relations_all": 20,
        "reward_tech": "hard_shields"
      }
    ],
    
    "disasters": [
      {
        "id": "plague",
        "name": "Plague",
        "category": "disaster",
        "weight": 15,
        "requirements": {
          "min_population": 30,
          "cooldown_turns": 30
        },
        "severity_table": [
          {"roll_range": [1, 40], "severity": "minor", "population_loss_percent": 10},
          {"roll_range": [41, 70], "severity": "moderate", "population_loss_percent": 20},
          {"roll_range": [71, 90], "severity": "severe", "population_loss_percent": 30},
          {"roll_range": [91, 100], "severity": "catastrophic", "population_loss_percent": 40}
        ],
        "mitigation": {
          "bio_toxin_antidote": "reduce_severity_1",
          "universal_antidote": "reduce_severity_2",
          "planetology_tech_15": "50_percent_halve_losses",
          "hermit_crabs": "immune"
        }
      },
      {
        "id": "earthquake",
        "name": "Earthquake",
        "category": "disaster",
        "weight": 12,
        "requirements": {
          "min_factories_or_bases": 50,
          "exclude_hostile_environments": true
        },
        "severity_table": [
          {"roll_range": [1, 50], "severity": "minor", "factory_loss_percent": 10, "base_loss_percent": 5},
          {"roll_range": [51, 80], "severity": "major", "factory_loss_percent": 20, "base_loss_percent": 10},
          {"roll_range": [81, 100], "severity": "catastrophic", "factory_loss_percent": 35, "base_loss_percent": 20}
        ],
        "population_loss_percent": 5,
        "mitigation": {
          "planetary_shield": "minus_5_percent_all",
          "construction_tech_20": "25_percent_halve_factory_loss",
          "hermit_crabs": "minus_50_percent_factory_loss"
        }
      },
      {
        "id": "comet_strike",
        "name": "Comet Strike",
        "category": "disaster",
        "weight": 8,
        "requirements": {
          "cooldown_turns": 50
        },
        "warning_turns": 5,
        "comet_hp": 500,
        "impact_severity_table": [
          {"hp_remaining": [0, 0], "severity": "none", "pop_loss": 0, "factory_loss": 0, "base_loss": 0},
          {"hp_remaining": [1, 100], "severity": "minor", "pop_loss": 5, "factory_loss": 5, "base_loss": 0},
          {"hp_remaining": [101, 300], "severity": "partial", "pop_loss": 20, "factory_loss": 15, "base_loss": 10},
          {"hp_remaining": [301, 500], "severity": "full", "pop_loss": 40, "factory_loss": 30, "base_loss": 25}
        ],
        "full_impact_environment_degrade_chance": 10
      },
      {
        "id": "industrial_accident",
        "name": "Industrial Accident",
        "category": "disaster",
        "weight": 10,
        "requirements": {
          "min_factories": 100,
          "max_industrial_tech": 29
        },
        "factories_lost_range": [20, 50],
        "pollution_multiplier": 10,
        "mitigation": {
          "atmospheric_terraforming": "halve_pollution",
          "eco_restoration_10": "minus_25_percent_factories_lost"
        }
      },
      {
        "id": "rebellion",
        "name": "Rebellion",
        "category": "disaster",
        "weight": 5,
        "requirements": {
          "max_morale": 59,
          "exclude_homeworld": true,
          "min_population": 20,
          "min_colonies": 3
        },
        "resolution_table": [
          {"roll_range": [1, 40], "outcome": "suppressed", "effect": "minus_10_percent_population"},
          {"roll_range": [41, 70], "outcome": "ongoing", "effect": "no_production_5_turns"},
          {"roll_range": [71, 90], "outcome": "independence", "effect": "colony_neutral"},
          {"roll_range": [91, 100], "outcome": "defection", "effect": "colony_joins_rival"}
        ],
        "modifiers": {
          "garrison_present": -15,
          "fleet_in_orbit": -10,
          "espionage_incited": 20,
          "adjacent_to_enemy": 15
        }
      },
      {
        "id": "computer_virus",
        "name": "Computer Virus",
        "category": "disaster",
        "weight": 10,
        "requirements": {
          "min_colonies_with_computers": 2,
          "cooldown_turns": 40
        },
        "research_lost_percent": 25,
        "espionage_penalty_duration": 5,
        "espionage_penalty_amount": -10,
        "mitigation": {
          "hyperspace_communications": "50_percent_prevent",
          "computer_tech_30": "reduce_loss_to_15_percent"
        }
      },
      {
        "id": "supernova",
        "name": "Super Nova",
        "category": "disaster",
        "weight": 3,
        "requirements": {
          "min_stars": 20,
          "exclude_homeworlds": true,
          "target_colonized": true,
          "cooldown_turns": 100
        },
        "warning_turns": 10,
        "effect": "star_becomes_dead_all_destroyed",
        "mitigation": "none_evacuation_only"
      },
      {
        "id": "depleted_planet",
        "name": "Depleted Planet",
        "category": "disaster",
        "weight": 7,
        "requirements": {
          "resource_level": ["rich", "ultra_rich"],
          "min_factories": 100,
          "min_colony_age": 50
        },
        "effect": "resource_level_minus_1"
      }
    ],
    
    "discoveries": [
      {
        "id": "ancient_derelict",
        "name": "Ancient Derelict",
        "category": "discovery",
        "weight": 20,
        "requirements": {
          "min_turn": 20,
          "scout_exploring": true
        },
        "outcome_table": [
          {"roll_range": [1, 30], "outcome": "empty_hulk", "bc_range": [50, 200]},
          {"roll_range": [31, 60], "outcome": "damaged_tech", "tech_count": 1, "tech_tier": "any"},
          {"roll_range": [61, 85], "outcome": "pristine_archive", "tech_count": 1, "tech_tier": "top"},
          {"roll_range": [86, 95], "outcome": "functioning_ship", "ship_class": "huge"},
          {"roll_range": [96, 100], "outcome": "ancient_treasure", "bc_range": [500, 1000], "tech_count": 1}
        ]
      },
      {
        "id": "fertile_planet",
        "name": "Fertile Planet",
        "category": "discovery",
        "weight": 15,
        "requirements": {
          "environment": ["minimal", "barren", "desert", "tundra", "ocean", "jungle", "arid"],
          "exclude_gaia": true,
          "min_colony_age": 10
        },
        "outcome_table": [
          {"roll_range": [1, 50], "outcome": "environment_upgrade"},
          {"roll_range": [51, 100], "outcome": "population_bonus", "amount": 10}
        ]
      },
      {
        "id": "mineral_rich_planet",
        "name": "Mineral Rich Planet",
        "category": "discovery",
        "weight": 15,
        "requirements": {
          "resource_level": ["ultra_poor", "poor", "normal"],
          "min_colony_age": 20
        },
        "effect": "resource_level_plus_1",
        "max_level": "rich"
      },
      {
        "id": "artifact_world",
        "name": "Artifact World Discovery",
        "category": "discovery",
        "weight": 10,
        "requirements": {
          "exclude_artifacts": true,
          "min_turn": 50
        },
        "effect": "gain_artifacts_special",
        "research_multiplier": 2.0
      },
      {
        "id": "tech_breakthrough",
        "name": "Technology Breakthrough",
        "category": "discovery",
        "weight": 15,
        "requirements": {
          "active_research": true,
          "min_research_progress": 50
        },
        "outcome_table": [
          {"roll_range": [1, 70], "outcome": "complete_50_percent"},
          {"roll_range": [71, 90], "outcome": "complete_75_percent"},
          {"roll_range": [91, 100], "outcome": "instant_discovery"}
        ]
      },
      {
        "id": "ancient_cache",
        "name": "Ancient Cache",
        "category": "discovery",
        "weight": 25,
        "requirements": {
          "min_turn": 30
        },
        "bc_range": [200, 500]
      }
    ],
    
    "diplomacy": [
      {
        "id": "diplomatic_blunder",
        "name": "Diplomatic Blunder",
        "category": "diplomacy",
        "weight": 25,
        "requirements": {
          "has_contact": true,
          "exclude_war": true,
          "exclude_allied": true
        },
        "relation_penalty_range": [-30, -10]
      },
      {
        "id": "diplomatic_breakthrough",
        "name": "Diplomatic Breakthrough",
        "category": "diplomacy",
        "weight": 20,
        "requirements": {
          "has_contact": true,
          "min_relations": 0,
          "exclude_war": true
        },
        "relation_bonus_range": [10, 25],
        "treaty_offer_chance": 50
      },
      {
        "id": "generous_donation",
        "name": "Generous Donation",
        "category": "diplomacy",
        "weight": 15,
        "requirements": {
          "min_relations": 0,
          "donor_economy_ratio": 0.5
        },
        "donation_percent": 5,
        "relation_bonus": 5
      },
      {
        "id": "border_skirmish",
        "name": "Border Skirmish",
        "category": "diplomacy",
        "weight": 30,
        "requirements": {
          "adjacent_borders": true,
          "relations_range": [-50, 25]
        },
        "outcome_table": [
          {"roll_range": [1, 40], "outcome": "your_victory", "relation_change": -15},
          {"roll_range": [41, 60], "outcome": "their_victory", "relation_change": -10},
          {"roll_range": [61, 80], "outcome": "mutual_exchange", "relation_change": -20, "war_check": true},
          {"roll_range": [81, 100], "outcome": "deescalation", "relation_change": -5}
        ],
        "war_threshold": -75
      },
      {
        "id": "trade_dispute",
        "name": "Trade Dispute",
        "category": "diplomacy",
        "weight": 10,
        "requirements": {
          "has_trade_treaty": true,
          "min_trade_duration": 10
        },
        "outcome_table": [
          {"roll_range": [1, 30], "outcome": "your_favor", "bc_change": 50, "relation_change": 5},
          {"roll_range": [31, 60], "outcome": "compromise", "bc_change": 0, "relation_change": -5},
          {"roll_range": [61, 90], "outcome": "their_favor", "bc_change": -50, "relation_change": -10},
          {"roll_range": [91, 100], "outcome": "treaty_cancelled", "relation_change": -20}
        ]
      }
    ],
    
    "opportunities": [
      {
        "id": "pirate_raiders",
        "name": "Pirate Raiders",
        "category": "opportunity",
        "weight": 15,
        "requirements": {
          "min_colonies": 3,
          "min_turn": 25,
          "no_active_pirates": true
        },
        "pirate_ship_count_range": [5, 15],
        "pirate_ship_class": "medium",
        "raid_chance_per_turn": 30,
        "raid_production_penalty": -5,
        "raid_bc_stolen": 10,
        "duration_max": 20,
        "loot_range": [100, 300]
      },
      {
        "id": "mercenary_offer",
        "name": "Mercenary Offer",
        "category": "opportunity",
        "weight": 10,
        "requirements": {
          "min_reserve": 200,
          "min_turn": 40
        },
        "ship_count_range": [1, 3],
        "ship_class": "large",
        "cost_per_ship_range": [100, 200],
        "maintenance_multiplier": 1.5
      },
      {
        "id": "scientific_genius",
        "name": "Scientific Genius",
        "category": "opportunity",
        "weight": 15,
        "requirements": {
          "not_all_fields_maxed": true
        },
        "research_bonus_percent": 25,
        "duration_turns": 25
      },
      {
        "id": "industrial_boom",
        "name": "Industrial Boom",
        "category": "opportunity",
        "weight": 20,
        "requirements": {
          "min_factories": 50,
          "not_at_max_factories": true
        },
        "free_factories_range": [10, 30]
      },
      {
        "id": "population_boom",
        "name": "Population Boom",
        "category": "opportunity",
        "weight": 15,
        "requirements": {
          "population_below_80_percent": true,
          "exclude_hostile_environments": true
        },
        "population_gained_range": [5, 15]
      },
      {
        "id": "defector_arrival",
        "name": "Defector Arrival",
        "category": "opportunity",
        "weight": 10,
        "requirements": {
          "has_contact": true,
          "has_tense_relations": true,
          "min_turn": 50
        },
        "outcome_table": [
          {"roll_range": [1, 40], "type": "scientist", "effect": "gain_random_tech"},
          {"roll_range": [41, 70], "type": "general", "effect": "combat_bonus_10_percent", "duration": 20},
          {"roll_range": [71, 90], "type": "spy", "effect": "espionage_bonus_30_percent", "duration": 20},
          {"roll_range": [91, 100], "type": "noble", "effect": "bc_200_production_bonus_10_percent", "duration": 20}
        ],
        "relation_penalty_with_source": -10
      },
      {
        "id": "wormhole_discovery",
        "name": "Wormhole Discovery",
        "category": "opportunity",
        "weight": 5,
        "requirements": {
          "min_explored_systems": 5,
          "min_turn": 30,
          "no_existing_wormholes": true
        },
        "effect": "create_permanent_wormhole",
        "travel_time": 1,
        "limit_per_game": 1
      }
    ]
  }
}
```

### 7.2 Event Category Weights

```json
{
  "event_category_weights": {
    "base_weights": {
      "disasters": 30,
      "space_monsters": 15,
      "discoveries": 25,
      "diplomacy": 15,
      "opportunities": 15
    },
    "difficulty_bad_event_bias": {
      "simple": -25,
      "easy": -10,
      "average": 0,
      "hard": 10,
      "impossible": 20
    },
    "calculation": "Disasters weight = base + bias; Others scaled proportionally"
  }
}
```

### 7.3 Event Constants

```json
{
  "event_constants": {
    "BASE_EVENT_CHANCE": 3,
    "TURN_MODIFIER": 0.07,
    "MAXIMUM_CHANCE": 10,
    "MIN_TURNS_BETWEEN_EVENTS": 5,
    "MIN_TURNS_BETWEEN_SAME_EVENT": 50,
    "PLAYER_TARGET_WEIGHT": 50,
    "HOMEWORLD_TARGET_WEIGHT": 0.5,
    "NEW_COLONY_TARGET_WEIGHT": 0.25,
    "NEW_COLONY_THRESHOLD_TURNS": 10,
    "MONSTER_COOLDOWN_AFTER_KILL": 75,
    "MONSTER_MAX_ACTIVE": 1,
    "COMET_WARNING_TURNS": 5,
    "SUPERNOVA_WARNING_TURNS": 10,
    "REBELLION_UNREST_TURNS": 1,
    "REBELLION_ONGOING_TURNS": 5,
    "PIRATE_MAX_DURATION": 20,
    "GENIUS_DURATION": 25
  }
}
```

---

## 8. Event Processing Algorithm

```pseudocode
function ProcessRandomEvents(game_state):
    // Step 1: Check cooldown
    if game_state.turns_since_last_event < MIN_TURNS_BETWEEN_EVENTS:
        return
    
    // Step 2: Calculate event chance
    base_chance = BASE_EVENT_CHANCE + (game_state.turn × TURN_MODIFIER)
    capped_chance = min(base_chance, MAXIMUM_CHANCE)
    modified_chance = capped_chance × GetDifficultyModifier(game_state.difficulty)
    
    // Step 3: Roll for event
    roll = random(1, 100)
    if roll > modified_chance:
        return  // No event this turn
    
    // Step 4: Select category
    category_weights = GetCategoryWeights(game_state.difficulty)
    selected_category = WeightedRandomChoice(category_weights)
    
    // Step 5: Select specific event from category
    available_events = GetEligibleEvents(selected_category, game_state)
    if available_events is empty:
        return  // No valid events available
    
    selected_event = WeightedRandomChoice(available_events)
    
    // Step 6: Select target
    target = SelectEventTarget(selected_event, game_state)
    
    // Step 7: Execute event
    ExecuteEvent(selected_event, target, game_state)
    
    // Step 8: Record event
    game_state.last_event_turn = game_state.turn
    game_state.event_history.append({
        "turn": game_state.turn,
        "event": selected_event.id,
        "target": target
    })
    
    // Step 9: Announce via GNN
    GNN_Broadcast(selected_event, target)

function GetEligibleEvents(category, game_state):
    eligible = []
    
    for event in EVENTS[category]:
        // Check cooldown
        if EventOnCooldown(event, game_state):
            continue
        
        // Check requirements
        if not MeetsRequirements(event.requirements, game_state):
            continue
        
        eligible.append(event)
    
    return eligible

function SelectEventTarget(event, game_state):
    if event.category == "space_monster":
        return SelectMonsterSpawnPoint(game_state)
    
    if event.requires_planet:
        return SelectTargetPlanet(event, game_state)
    
    if event.requires_empire:
        return SelectTargetEmpire(event, game_state)
    
    return null

function SelectTargetPlanet(event, game_state):
    candidates = []
    
    for colony in game_state.all_colonies:
        // Check event-specific requirements
        if not MeetsColonyRequirements(event, colony):
            continue
        
        // Calculate weight
        weight = colony.population
        
        if colony.is_homeworld:
            weight *= HOMEWORLD_TARGET_WEIGHT
        
        if colony.age < NEW_COLONY_THRESHOLD_TURNS:
            weight *= NEW_COLONY_TARGET_WEIGHT
        
        candidates.append({colony: colony, weight: weight})
    
    return WeightedRandomChoice(candidates)
```

---

## 9. GNN (Galactic News Network) Announcements

All events are announced via GNN, providing flavor and information.

### 9.1 Announcement Templates

```json
{
  "gnn_templates": {
    "space_amoeba_spawn": {
      "headline": "SPACE MONSTER ALERT!",
      "body": "The Cosmic Cheek-Pouch has emerged at the galaxy's edge! This massive protoplasmic entity is heading toward {target_system}. All empires are advised to prepare defenses.",
      "severity": "critical"
    },
    "space_crystal_spawn": {
      "headline": "CRYSTALLINE TERROR DETECTED!",
      "body": "The Crystal Cage has been sighted near {spawn_location}! Its beam-reflecting properties make conventional weapons dangerous. Missile-based fleets are recommended.",
      "severity": "critical"
    },
    "monster_destroyed": {
      "headline": "MONSTER VANQUISHED!",
      "body": "The {monster_name} has been destroyed by the forces of {empire_name}! The galaxy breathes easier, and all civilizations express their gratitude.",
      "severity": "celebration"
    },
    "plague": {
      "headline": "PLAGUE OUTBREAK!",
      "body": "A devastating illness has swept through {colony_name}. {casualties} million citizens have perished. Medical teams are working around the clock.",
      "severity": "disaster"
    },
    "comet_warning": {
      "headline": "COMET APPROACHING!",
      "body": "A massive comet is on collision course with {colony_name}! Impact expected in {turns} turns. Ships with sufficient firepower may be able to divert or destroy it.",
      "severity": "warning"
    },
    "supernova_warning": {
      "headline": "STELLAR CATASTROPHE IMMINENT!",
      "body": "The star of the {system_name} system is showing signs of imminent supernova! All inhabitants have {turns} turns to evacuate before total destruction.",
      "severity": "critical"
    },
    "ancient_derelict": {
      "headline": "ANCIENT DISCOVERY!",
      "body": "Explorers from {empire_name} have discovered an Ancient One vessel drifting in deep space near {location}. What secrets does it hold?",
      "severity": "discovery"
    },
    "guardian_defeated": {
      "headline": "ORION HAS FALLEN!",
      "body": "In a historic victory, {empire_name} has defeated the Eternal Sentinel and claimed the Cosmic Wheel of Orion! The galaxy will never be the same.",
      "severity": "historic"
    }
  }
}
```

---

## 10. Racial Event Interactions

Some races have unique interactions with specific events:

### 10.1 Hermit Crabs

| Event | Interaction |
|-------|-------------|
| Plague | Immune (crystalline biology) |
| Earthquake | -50% factory damage (crystalline structures) |
| Space Crystal | +25% damage dealt (kindred spirits understand weaknesses) |

### 10.2 Rats

| Event | Interaction |
|-------|-------------|
| Technology Breakthrough | +25% more likely to trigger |
| Scientific Genius | +10 turns duration |
| Computer Virus | -50% research loss |

### 10.3 Rabbits

| Event | Interaction |
|-------|-------------|
| Population Boom | +50% population gained |
| Plague | +10% additional losses (dense population) |

### 10.4 Chameleons

| Event | Interaction |
|-------|-------------|
| Defector Arrival | Always spy type |
| Rebellion (incited) | +10% success chance |

### 10.5 Hamsters

| Event | Interaction |
|-------|-------------|
| Diplomatic Blunder | 50% chance to avoid entirely |
| Diplomatic Breakthrough | +50% chance of treaty offer |
| Trade Dispute | Always resolved in favor or compromise |

---

## 11. Edge Cases

### 11.1 No Valid Targets

If an event triggers but has no valid targets:
- Re-roll for a different event
- Maximum 3 re-rolls before skipping this turn's event
- Log skipped event for debugging

### 11.2 Empire Elimination During Event

If target empire is eliminated while event is processing:
- Planetary events: Affect new owner if colonized, else cancel
- Diplomatic events: Cancel
- Space monsters: Continue toward next nearest colony

### 11.3 Multiple Monsters

Only one space monster can be active at a time:
- New monster spawn blocked while existing monster lives
- After kill: 75-turn cooldown before next monster can spawn

### 11.4 Wormhole Creation Failure

If wormhole cannot be placed (no valid endpoints):
- Event skipped, no re-roll
- Wormhole remains available for future games

### 11.5 Comet Destruction

If comet target colony is destroyed before impact:
- Comet continues to impact location
- Damage affects whoever owns it at impact time
- If no one owns it: Comet destroys empty system

### 11.6 Rebellion During War

If rebellion succeeds and colony goes to rival during active war:
- Colony immediately becomes valid war target
- No peace treaty implications
- Defecting ships join enemy fleet

---

## 12. Strategic Considerations

### 12.1 Monster Preparedness

**Amoeba Strategy:**
- Keep a reserve fleet with high damage output
- Position near likely approach vectors
- Research Advanced Damage Control for sustained fights

**Crystal Strategy:**
- Maintain missile-capable fleet (Pulson+ missiles or torpedoes)
- Avoid beam weapons entirely
- Research Hard Shields to defend against its attacks

### 12.2 Disaster Mitigation

**General:**
- Spread population across multiple colonies
- Maintain positive morale to prevent rebellions
- Research planetology for plague resistance

**Comet-Specific:**
- Keep some fleet near home territory
- High-damage weapons can destroy comets in warning phase
- Don't panic - 5 turns is enough to redirect ships

### 12.3 Maximizing Discoveries

- Explore aggressively to trigger derelict events
- Maintain Artifacts colonies for research bonuses
- Keep reserve BC for mercenary opportunities

---

## 13. Constants Summary

```json
{
  "random_event_constants": {
    "BASE_EVENT_CHANCE": 3,
    "TURN_MODIFIER": 0.07,
    "MAXIMUM_CHANCE": 10,
    "MIN_TURNS_BETWEEN_EVENTS": 5,
    "MIN_TURNS_BETWEEN_SAME_EVENT": 50,
    "PLAYER_TARGET_WEIGHT": 50,
    "HOMEWORLD_TARGET_WEIGHT": 0.5,
    "NEW_COLONY_TARGET_WEIGHT": 0.25,
    "NEW_COLONY_THRESHOLD_TURNS": 10,
    "MONSTER_COOLDOWN_AFTER_KILL": 75,
    "MONSTER_MAX_ACTIVE": 1,
    "AMOEBA_HP": 1000,
    "AMOEBA_REGEN": 100,
    "AMOEBA_ATTACK": 25,
    "AMOEBA_MAP_SPEED": 1,
    "CRYSTAL_HP": 800,
    "CRYSTAL_SHIELDS": 10,
    "CRYSTAL_BEAM_REFLECT": 0.50,
    "CRYSTAL_MAP_SPEED": 2,
    "GUARDIAN_HP": 32000,
    "GUARDIAN_ARMOR_MULT": 4,
    "GUARDIAN_SHIELDS": 15,
    "GUARDIAN_ATTACK_RATING": 7,
    "GUARDIAN_DEFENSE_RATING": 5,
    "COMET_HP": 500,
    "COMET_WARNING_TURNS": 5,
    "SUPERNOVA_WARNING_TURNS": 10,
    "REBELLION_UNREST_TURNS": 1,
    "REBELLION_ONGOING_TURNS": 5,
    "PIRATE_RAID_CHANCE": 30,
    "PIRATE_MAX_DURATION": 20,
    "GENIUS_BONUS_PERCENT": 25,
    "GENIUS_DURATION": 25,
    "WORMHOLE_TRAVEL_TIME": 1
  }
}
```

---

## 14. Implementation Notes

### 14.1 Event Queue

Events should be queued and processed at the end of each turn, after all player/AI actions:

```
Turn Processing Order:
1. Player input
2. AI decisions
3. Movement execution
4. Combat resolution
5. Production completion
6. Random events ← HERE
7. Victory checks
8. Save game state
```

### 14.2 Save/Load Compatibility

Event state must be persisted:
- Current active monster (if any)
- Event cooldown timers
- Event history (for cooldown checks)
- Ongoing events (comet warning, rebellion state)

### 14.3 Multiplayer Considerations

In multiplayer:
- Events are rolled server-side
- All players see GNN announcements simultaneously
- Monster targeting uses galaxy-wide colony pool

---

*Document Version: 1.0*
*Last Updated: 2026-03-22*
*Specification: spec-021 - Random Events System*
*Status: Complete*
