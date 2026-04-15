# Force Fields Technology - Complete Tech Tree

## Overview

The Force Fields technology field provides defensive capabilities through ship-mounted Deflector Shields, Planetary Shields for colony protection, Personal Shields for ground combat, and special tactical fields that disrupt enemy operations. It is one of six technology fields in Hamster of Orion.

**Key Races:**
- Hermit Crabs: +25% Defense Rating (natural shell advantage)
- Hamsters: Balanced defenders (no modifiers)

**Technology Tiers:** 1-14 (50 RP to 50,000 RP)

**Tier cost mapping note:** Force Fields has only 14 internal tiers but spans the full tech level range (1–50+). Its tiers cover a wider range of tech levels than fields with 18+ tiers, so the RP cost schedule is **accelerated** — each Force Fields tier costs proportionally more than a same-numbered global tier. Force Fields uses its own internal RP cost table (listed in the tier distribution below and in the JSON). Do not use the global tier cost table from `research-formulas.md` to look up Force Fields RP costs. The mapping is:

| Force Fields Tier | Research Cost (Force Fields) | Global Tier Equivalent |
|-------------------|------------------------------|------------------------|
| 1 | 50 RP | Global Tier 1 |
| 2 | 80 RP | Global Tier 2 |
| 3 | 150 RP | Global Tier 3 |
| 4 | 300 RP | ~Global Tier 4–5 |
| 5 | 500 RP | Global Tier 5 |
| 6 | 1,000 RP | ~Global Tier 6–7 |
| 7 | 1,500 RP | Global Tier 7 |
| 8 | 3,000 RP | ~Global Tier 8–9 |
| 9 | 5,000 RP | ~Global Tier 9–10 |
| 10 | 8,000 RP | Global Tier 11 |
| 11 | 12,000 RP | ~Global Tier 11–12 |
| 12 | 18,000 RP | Global Tier 14 |
| 13 | 30,000 RP | Global Tier 16 |
| 14 | 50,000 RP | Global Tier 18 |

This means researching all 14 Force Fields tiers costs roughly the same total RP as researching 18 tiers in fields like Propulsion or Weapons.

---

## Tech Tree Structure

In each game, players are offered **2-3 random technologies** at each tier. Not all technologies appear in every game, creating strategic variety.

### Tier Distribution

| Tier Range | Tech Level | Game Phase | Typical RP Cost |
|------------|------------|------------|-----------------|
| 1-2 | 1-5 | Early | 50-80 RP |
| 3-4 | 6-12 | Early-Mid | 150-300 RP |
| 5-6 | 13-20 | Mid | 500-1,000 RP |
| 7-8 | 21-28 | Mid-Late | 1,500-3,000 RP |
| 9-10 | 29-36 | Late | 4,000-8,000 RP |
| 11-12 | 37-44 | End | 10,000-18,000 RP |
| 13-14 | 45-50 | Ultimate | 30,000-50,000 RP |

---

## Technology Categories

### Deflector Shields
Ship-mounted shields that absorb damage from each hit. Shield class equals damage absorbed per hit.

### Planetary Shields
Ground installations protecting missile bases from orbital bombardment. Stack with deflector effects on bases.

### Personal Shields
Passive ground combat bonuses for troops during invasions.

### Tactical Fields
Special devices: Repulsor Beams, Cloaking Devices, Stasis Fields, and ultimate weapons like the Black Hole Generator.

---

## Complete Force Fields Technology List

### Tier 1 (Tech Level 1-3) - Basic Shielding
**Research Cost:** 50 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Class I Deflector Shield | 1 | Class I Deflector | -1 damage per hit |

**Starting Tech:** Class I Deflector Shield is the universal Tier 1 force fields baseline available to all races. Races that list `class_1_shield` in their race-specific starting tech (e.g., Ferrets, Budgies) have it as a notable starting asset, but it is not exclusive to them — all races have access to it from game start. See `race-stats-complete.md` for per-race starting tech details.

---

### Tier 2 (Tech Level 4-6) - Improved Shielding
**Research Cost:** 80 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Class II Deflector Shield | 4 | Class II Deflector | -2 damage per hit |

---

### Tier 3 (Tech Level 7-10) - Personal Protection
**Research Cost:** 150 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Personal Deflector Shield | 8 | Personal Deflector | +10 ground combat bonus |
| Class III Deflector Shield | 10 | Class III Deflector | -3 damage per hit |

---

### Tier 4 (Tech Level 11-14) - Planetary Defense
**Research Cost:** 300 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Planetary Shield V | 12 | Planetary Shield V | -5 bombardment damage |
| Class IV Deflector Shield | 14 | Class IV Deflector | -4 damage per hit |

---

### Tier 5 (Tech Level 15-20) - Tactical Fields & Mid Shields
**Research Cost:** 500 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Repulsor Beam | 16 | Repulsor Beam | Push enemy ships 2 hexes away |
| Class V Deflector Shield | 20 | Class V Deflector | -5 damage per hit |

---

### Tier 6 (Tech Level 21-24) - Advanced Protection
**Research Cost:** 1,000 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Personal Absorption Shield | 21 | Personal Absorption | +20 ground combat bonus |
| Planetary Shield X | 22 | Planetary Shield X | -10 bombardment damage |
| Class VI Deflector Shield | 24 | Class VI Deflector | -6 damage per hit |

---

### Tier 7 (Tech Level 25-30) - Stealth Technology & Heavy Shields
**Research Cost:** 1,500 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Class VIII Deflector Shield | 26 | Class VIII Deflector | -8 damage per hit |
| Cloaking Device | 27 | Cloaking Device | +5 Defense, invisible until firing |
| Class VII Deflector Shield | 30 | Class VII Deflector | -7 damage per hit |

---

### Tier 8 (Tech Level 31-34) - Heavy Shielding & Missile Defense
**Research Cost:** 3,000 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Zyro Shield | 31 | Zyro Shield | 75% chance to destroy incoming missiles − 1% per missile tech level |
| Planetary Shield XV | 32 | Planetary Shield XV | -15 bombardment damage |
| Class IX Deflector Shield | 34 | Class IX Deflector | -9 damage per hit |

---

### Tier 9 (Tech Level 35-38) - Disabling Fields
**Research Cost:** 5,000 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Class X Deflector Shield | 36 | Class X Deflector | -10 damage per hit |
| Stasis Field | 37 | Stasis Field | Disables all weapons on target ship 1 turn |
| Personal Barrier Shield | 38 | Personal Barrier | +30 ground combat bonus |

---

### Tier 10 (Tech Level 39-42) - Fortress Shields
**Research Cost:** 8,000 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Class XI Deflector Shield | 40 | Class XI Deflector | -11 damage per hit |
| Planetary Shield XX | 42 | Planetary Shield XX | -20 bombardment damage |

---

### Tier 11 (Tech Level 43-46) - Ultimate Defense
**Research Cost:** 12,000 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Black Hole Generator | 43 | Black Hole Generator | Destroys 25-100% of target stack − 2% per shield class |
| Class XII Deflector Shield | 44 | Class XII Deflector | -12 damage per hit |
| Lightning Shield | 46 | Lightning Shield | 100% chance to destroy incoming missiles − 1% per missile tech level |

---

### Tier 12 (Tech Level 47-49) - Legendary Shields
**Research Cost:** 18,000 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Class XIII Deflector Shield | 48 | Class XIII Deflector | -13 damage per hit |

---

### Tier 13 (Tech Level 50+) - Ultimate Shielding I
**Research Cost:** 30,000 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Class XIV Deflector Shield | 50 | Class XIV Deflector | -14 damage per hit |

---

### Tier 14 (Tech Level 52+) - Ultimate Shielding II
**Research Cost:** 50,000 RP

| Tech Name | Tech Level | Unlocks | Effect |
|-----------|------------|---------|--------|
| Class XV Deflector Shield | 52 | Class XV Deflector | -15 damage per hit |

---

## Detailed Component Statistics

### Deflector Shield Progression

| Shield | Tech Level | Absorbs | Space | Cost | Notes |
|--------|------------|---------|-------|------|-------|
| Class I | 1 | 1 | 8 | 12 BC | Starting |
| Class II | 4 | 2 | 10 | 18 BC | — |
| Class III | 10 | 3 | 12 | 25 BC | — |
| Class IV | 14 | 4 | 14 | 32 BC | — |
| Class V | 20 | 5 | 16 | 42 BC | — |
| Class VI | 24 | 6 | 18 | 52 BC | — |
| Class VII | 30 | 7 | 20 | 65 BC | — |
| Class VIII | 26 | 8 | 22 | 78 BC | — |
| Class IX | 34 | 9 | 24 | 92 BC | — |
| Class X | 36 | 10 | 26 | 108 BC | — |
| Class XI | 40 | 11 | 28 | 125 BC | — |
| Class XII | 44 | 12 | 30 | 145 BC | — |
| Class XIII | 48 | 13 | 32 | 165 BC | — |
| Class XIV | 50 | 14 | 34 | 190 BC | — |
| Class XV | 52 | 15 | 36 | 220 BC | Ultimate |

### Shield Space Formula
```
Space = 8 + (Shield_Class - 1) × 2
```

### Shield Cost Formula
```
Cost = 12 + (Shield_Class - 1) × 8 + (Shield_Class² × 0.5)
```
Rounded to nearest whole BC.

### Shield Damage Reduction
```
Actual_Damage = max(0, Weapon_Damage - Shield_Absorb)
```
Shields can completely negate low-damage weapons.

---

### Planetary Shield Statistics

| Shield | Tech Level | Absorbs | Build Cost | Maintenance | Notes |
|--------|------------|---------|------------|-------------|-------|
| Planetary Shield V | 12 | 5 | 500 BC | 5 BC/turn | Early defense |
| Planetary Shield X | 22 | 10 | 1,000 BC | 10 BC/turn | Mid-game fortress |
| Planetary Shield XV | 32 | 15 | 2,000 BC | 15 BC/turn | Major defense |
| Planetary Shield XX | 42 | 20 | 4,000 BC | 20 BC/turn | Ultimate defense |

### Planetary Shield Effects

- Reduces all bombardment damage to missile bases and ground forces
- Stacks with any ship shield protecting the planet
- Does NOT reduce biological weapon effects
- Does NOT prevent troop transport landing

### Planetary Shield Formula
```
Bombardment_Damage = max(0, Bomb_Damage - Planetary_Shield_Level)
```

---

### Personal Shield Statistics (Ground Combat)

| Shield | Tech Level | Ground Bonus | Effect |
|--------|------------|--------------|--------|
| Personal Deflector | 8 | +10 | Early infantry boost |
| Personal Absorption | 21 | +20 | Mid-game advantage |
| Personal Barrier | 38 | +30 | Late-game superiority |

### Ground Combat Formula
```
Combat_Roll = d100 + (Population_Ratio × 10) + Tech_Bonus + Racial_Bonus + Shield_Bonus
```

Personal shields add directly to defending/attacking troops' combat rolls.

---

### Tactical Field Systems

#### Repulsor Beam

| Component | Tech Level | Effect | Space | Cost |
|-----------|------------|--------|-------|------|
| Repulsor Beam | 16 | Push enemy ships 2 hexes | 20 | 35 BC |

**Mechanics:**
- Activates automatically when enemy ship enters range 2
- Cannot push ships through obstacles
- Prevents bombardment by slow ships
- Counters short-range beam builds
- Does NOT work against missiles or torpedoes
- Multiple repulsor beams do not stack

**Tactical Use:** Install on orbital defense platforms or fast harassment ships to keep slow enemy capitals at bay.

---

#### Lightning Shield

| Component | Tech Level | Effect | Space | Cost |
|-----------|------------|--------|-------|------|
| Lightning Shield | 46 | 100% chance to destroy incoming missiles − 1% per missile tech level | 15 | 45 BC |

**Mechanics:**
- Base 100% chance to destroy each incoming missile before impact
- Chance reduced by 1% per missile tech level (e.g., Tech Level 20 missiles face 80% destruction chance)
- Roll made per missile, not per salvo
- Does NOT affect torpedoes (torpedoes are immune)
- Does NOT affect bombs
- Does NOT affect beam weapons
- Stacks multiplicatively with ECM and Zyro Shield

---

#### Cloaking Device

| Component | Tech Level | Effect | Space | Cost |
|-----------|------------|--------|-------|------|
| Cloaking Device | 27 | +5 Defense, invisible until firing | 30 | 80 BC |

**Mechanics:**
- Ship cannot be targeted by weapons until it attacks
- +5 Defense bonus remains even after decloaking
- Breaks cloak when firing any weapon
- Can be detected by Hyper Scanner (Tech Level 45)
- Does NOT hide from "detect cloaked" abilities
- Re-cloaks at start of next combat round if ship does not fire

**Tactical Use:** Alpha strike builds - load with heavy weapons, decloak, fire, retreat.

---

#### Zyro Shield

| Component | Tech Level | Effect | Space | Cost |
|-----------|------------|--------|-------|------|
| Zyro Shield | 31 | 75% chance to destroy incoming missiles − 1% per missile tech level | 25 | 70 BC |

**Mechanics:**
- Base 75% chance to destroy each incoming missile before impact
- Chance reduced by 1% per missile tech level (e.g., Tech Level 20 missiles face 55% destruction chance)
- Roll made per missile, not per salvo
- Does NOT affect torpedoes (torpedoes are immune)
- Does NOT affect bombs
- Does NOT affect beam weapons
- Stacks multiplicatively with ECM

**Formula:**
```
Destruction_Chance = max(0, 0.75 - (Missile_Tech_Level × 0.01))
```

**Example:**
A ship with Zyro Shield and ECM V faces a 10-missile salvo (Tech Level 15 missiles):
- Zyro destruction chance: 75% - 15% = 60%
- Zyro destroys average 6 missiles
- Remaining 4 missiles face ECM accuracy penalty
- Very few missiles will actually hit

---

#### Stasis Field

| Component | Tech Level | Effect | Space | Cost |
|-----------|------------|--------|-------|------|
| Stasis Field | 37 | Disable target for 1 turn | 45 | 90 BC |

**Mechanics:**
- Target ship cannot fire, move, or take any action for 1 combat round
- Stasis target also cannot be targeted by friendly or enemy fire while in stasis
- Single-target only (choose one ship in enemy stack)
- 100% success rate (no save)
- Uses special weapon slot
- Cannot be used on the same target two consecutive combat rounds
- Does NOT work on Orion Guardian

**Retreat and Stasis:**
A ship in stasis **cannot retreat** during the turn it is in stasis — it is frozen in place. "Cannot move or take any action" explicitly includes retreat attempts. The note in the Edge Cases section ("does not prevent retreat") referred to a previous design; the authoritative rule is:
- **In stasis:** Cannot move, fire, or retreat. Immune to all targeting.
- **After stasis expires** (next round): Ship acts normally, including retreat if desired.

This means Stasis Field effectively grants one free combat round against a priority target with zero risk of that ship escaping.

**Tactical Use:** Neutralize enemy capital ships while dealing with escorts. The target cannot flee during the stasis turn.

---

#### Black Hole Generator

| Component | Tech Level | Effect | Space | Cost |
|-----------|------------|--------|-------|------|
| Black Hole Generator | 43 | Destroys 25-100% of target stack − 2% per shield class | 100 | 250 BC |

**Mechanics:**
- Targets entire enemy ship stack
- Roll 1d4: result × 25% = base percentage of stack destroyed
- Destruction percentage reduced by 2% per shield class on target ships
- Affected ships are completely destroyed (no escape, no salvage)
- 3 turn cooldown before can be used again
- Requires capital ship (Huge hull only)
- Does NOT work on Orion Guardian (reduced to 10% damage)

**Formula:**
```
Base_Destruction = Roll × 25%
Actual_Destruction = max(0, Base_Destruction - (Target_Shield_Class × 2%))
```

**Destruction Roll:**
| Roll | Base Destruction |
|------|------------------|
| 1 | 25% of ships |
| 2 | 50% of ships |
| 3 | 75% of ships |
| 4 | 100% of ships |

**Example:**
Enemy has 12 Large ships with Class VII shields. You activate Black Hole Generator and roll 3.
- Base destruction: 75%
- Shield reduction: 7 × 2% = 14%
- Actual destruction: 75% - 14% = 61%
- Ships destroyed: 12 × 0.61 = 7.32 → 7 ships destroyed instantly
- Ships remaining: 5 ships

---

## Racial Force Field Bonuses

### Hermit Crabs: Natural Shell

- +25% to all Shield absorption (multiplicative)
- Natural crystalline shell provides innate defense
- Shield Class V becomes effective Class VI for Crabs

**Example:**
Hermit Crab ship with Class V Deflector:
- Base absorption: 5
- Racial bonus: 5 × 1.25 = 6.25 → rounded to 6
- Effective shield class: 6

### All Other Races

Standard shield values apply. No racial modifiers.

---

## Strategic Analysis

### Shield Meta-Game

**Small Weapons Problem:**
- Class V shields completely negate weapons dealing 1-5 damage
- This makes Lasers, Gatling Lasers, and early missiles useless
- Counter with: Mass Drivers (ignore 50% shields), Ion Cannons (halve shields)

**Shield Arms Race:**
```
Attacker: "I have 10-damage weapons!"
Defender: "I have Class IX shields, so I take 1 damage per hit."
Attacker: "I need 15-damage weapons..."
Defender: "I'll research Class X shields..."
```

This creates a constant push to upgrade both weapons and shields.

### Key Tech Milestones

| Tech | Why It Matters |
|------|----------------|
| Class III | Negates early missiles (4 damage) |
| Class V | Negates most tier 1-3 weapons |
| Planetary V | Colonies survive light bombardment |
| Repulsor | Counters slow beam ships |
| Class VII | Midgame standard |
| Cloaking | Alpha strike capability |
| Zyro Shield | Missile immunity |
| Class X | Late game baseline |
| Stasis Field | Capital ship counter |
| Planetary XX | Fortress worlds |
| Black Hole | Ultimate weapon |
| Class XV | Endgame shields |

### Early Game (Tiers 1-4)
**Priority:** Class III Deflector, Planetary Shield V

- Class III negates nuclear missiles (4 damage)
- Planetary V protects colonies from early raids
- Personal Deflector helps with ground combat

### Mid Game (Tiers 5-8)
**Priority:** Repulsor Beam, Class VI-VIII, Cloaking Device

- Repulsor prevents bombardment by slow ships
- Higher shields negate mid-tier weapons
- Cloaking enables surgical strike fleets

### Late Game (Tiers 9-14)
**Priority:** Zyro Shield, Stasis Field, Black Hole Generator

- Zyro Shield makes missile-heavy fleets obsolete
- Stasis Field neutralizes enemy flagships
- Black Hole Generator can win battles instantly
- Planetary XX creates impregnable fortress worlds

---

## Technology Selection

### Available Technologies by Tier

| Tier | Pool Size | Choices Offered |
|------|-----------|-----------------|
| 1 | 1 | 1 (starting) |
| 2 | 1 | 1 |
| 3 | 2 | 2 |
| 4 | 2 | 2 |
| 5 | 2 | 2 |
| 6 | 3 | 2-3 |
| 7 | 3 | 2-3 |
| 8 | 3 | 2-3 |
| 9 | 3 | 2-3 |
| 10 | 2 | 2 |
| 11 | 3 | 2-3 |
| 12 | 1 | 1 |
| 13 | 1 | 1 |
| 14 | 1 | 1 |

### Always Available Techs

Some techs appear in every game tree:
- Class I Deflector Shield (starting tech)
- Class III Deflector Shield
- Planetary Shield V
- Class VII Deflector Shield

### Never Available (Must Trade/Steal)

If not in your tree, must acquire via:
- Diplomatic tech trade
- Espionage theft
- Conquering tech-holding races

---

## Countering Force Fields

### Shield-Bypassing Weapons

| Weapon | Effect |
|--------|--------|
| Mass Driver | Ignores 50% shield |
| Ion Cannon | Halves shield value |
| Hard Beam | Full damage (no bypass, but very high damage) |
| Torpedo | Ignores shields entirely |
| Death Ray | Ignores shields |
| Stellar Converter | Ignores everything |

### Anti-Shield Strategy

1. **High Damage:** Overwhelm shields with 15+ damage weapons
2. **Shield Bypass:** Use torpedoes, death rays, mass drivers
3. **Volume of Fire:** Many small hits still chip away
4. **Boarding:** Transport troops bypass shields entirely

---

## JSON Data Schema

```json
{
  "force_fields_tech_tree": {
    "field": "force_fields",
    "total_tiers": 14,
    "total_technologies": 25,
    
    "tiers": [
      {
        "tier": 1,
        "tech_level_range": [1, 3],
        "research_cost": 50,
        "technologies": [
          {
            "id": "deflector_1",
            "name": "Class I Deflector Shield",
            "tech_level": 1,
            "category": "ship_shield",
            "unlocks": "class_1_deflector",
            "starting_tech": true,
            "effect": {
              "damage_absorption": 1
            },
            "component": {
              "space": 8,
              "cost": 12
            }
          }
        ]
      },
      {
        "tier": 2,
        "tech_level_range": [4, 6],
        "research_cost": 80,
        "technologies": [
          {
            "id": "deflector_2",
            "name": "Class II Deflector Shield",
            "tech_level": 4,
            "category": "ship_shield",
            "unlocks": "class_2_deflector",
            "effect": {
              "damage_absorption": 2
            },
            "component": {
              "space": 10,
              "cost": 18
            }
          }
        ]
      },
      {
        "tier": 3,
        "tech_level_range": [7, 10],
        "research_cost": 150,
        "technologies": [
          {
            "id": "personal_deflector",
            "name": "Personal Deflector Shield",
            "tech_level": 8,
            "category": "personal_shield",
            "unlocks": "personal_deflector",
            "effect": {
              "ground_combat_bonus": 10
            }
          },
          {
            "id": "deflector_3",
            "name": "Class III Deflector Shield",
            "tech_level": 10,
            "category": "ship_shield",
            "unlocks": "class_3_deflector",
            "always_available": true,
            "effect": {
              "damage_absorption": 3
            },
            "component": {
              "space": 12,
              "cost": 25
            }
          }
        ]
      },
      {
        "tier": 4,
        "tech_level_range": [11, 14],
        "research_cost": 300,
        "technologies": [
          {
            "id": "planetary_5",
            "name": "Planetary Shield V",
            "tech_level": 12,
            "category": "planetary_shield",
            "unlocks": "planetary_shield_5",
            "always_available": true,
            "effect": {
              "bombardment_absorption": 5
            },
            "building": {
              "build_cost": 500,
              "maintenance": 5
            }
          },
          {
            "id": "deflector_4",
            "name": "Class IV Deflector Shield",
            "tech_level": 14,
            "category": "ship_shield",
            "unlocks": "class_4_deflector",
            "effect": {
              "damage_absorption": 4
            },
            "component": {
              "space": 14,
              "cost": 32
            }
          }
        ]
      },
      {
        "tier": 5,
        "tech_level_range": [15, 20],
        "research_cost": 500,
        "technologies": [
          {
            "id": "repulsor_beam",
            "name": "Repulsor Beam",
            "tech_level": 16,
            "category": "tactical_field",
            "unlocks": "repulsor_beam",
            "effect": {
              "push_distance": 2,
              "description": "Push enemy ships away, prevents close-range attacks"
            },
            "component": {
              "space": 20,
              "cost": 35
            }
          },
          {
            "id": "deflector_5",
            "name": "Class V Deflector Shield",
            "tech_level": 20,
            "category": "ship_shield",
            "unlocks": "class_5_deflector",
            "effect": {
              "damage_absorption": 5
            },
            "component": {
              "space": 16,
              "cost": 42
            }
          }
        ]
      },
      {
        "tier": 6,
        "tech_level_range": [21, 24],
        "research_cost": 1000,
        "technologies": [
          {
            "id": "personal_absorption",
            "name": "Personal Absorption Shield",
            "tech_level": 21,
            "category": "personal_shield",
            "unlocks": "personal_absorption",
            "effect": {
              "ground_combat_bonus": 20
            }
          },
          {
            "id": "planetary_10",
            "name": "Planetary Shield X",
            "tech_level": 22,
            "category": "planetary_shield",
            "unlocks": "planetary_shield_10",
            "effect": {
              "bombardment_absorption": 10
            },
            "building": {
              "build_cost": 1000,
              "maintenance": 10
            }
          },
          {
            "id": "deflector_6",
            "name": "Class VI Deflector Shield",
            "tech_level": 24,
            "category": "ship_shield",
            "unlocks": "class_6_deflector",
            "effect": {
              "damage_absorption": 6
            },
            "component": {
              "space": 18,
              "cost": 52
            }
          }
        ]
      },
      {
        "tier": 7,
        "tech_level_range": [25, 30],
        "research_cost": 1500,
        "technologies": [
          {
            "id": "deflector_8",
            "name": "Class VIII Deflector Shield",
            "tech_level": 26,
            "category": "ship_shield",
            "unlocks": "class_8_deflector",
            "effect": {
              "damage_absorption": 8
            },
            "component": {
              "space": 22,
              "cost": 78
            }
          },
          {
            "id": "cloaking_device",
            "name": "Cloaking Device",
            "tech_level": 27,
            "category": "tactical_field",
            "unlocks": "cloaking_device",
            "effect": {
              "defense_bonus": 5,
              "invisible_until_fire": true
            },
            "component": {
              "space": 30,
              "cost": 80
            }
          },
          {
            "id": "deflector_7",
            "name": "Class VII Deflector Shield",
            "tech_level": 30,
            "category": "ship_shield",
            "unlocks": "class_7_deflector",
            "always_available": true,
            "effect": {
              "damage_absorption": 7
            },
            "component": {
              "space": 20,
              "cost": 65
            }
          }
        ]
      },
      {
        "tier": 8,
        "tech_level_range": [31, 34],
        "research_cost": 3000,
        "technologies": [
          {
            "id": "zyro_shield",
            "name": "Zyro Shield",
            "tech_level": 31,
            "category": "tactical_field",
            "unlocks": "zyro_shield",
            "effect": {
              "missile_destroy_chance_base": 0.75,
              "missile_destroy_chance_penalty_per_tech_level": 0.01,
              "description": "75% chance to destroy each incoming missile − 1% per missile tech level"
            },
            "component": {
              "space": 25,
              "cost": 70
            }
          },
          {
            "id": "planetary_15",
            "name": "Planetary Shield XV",
            "tech_level": 32,
            "category": "planetary_shield",
            "unlocks": "planetary_shield_15",
            "effect": {
              "bombardment_absorption": 15
            },
            "building": {
              "build_cost": 2000,
              "maintenance": 15
            }
          },
          {
            "id": "deflector_9",
            "name": "Class IX Deflector Shield",
            "tech_level": 34,
            "category": "ship_shield",
            "unlocks": "class_9_deflector",
            "effect": {
              "damage_absorption": 9
            },
            "component": {
              "space": 24,
              "cost": 92
            }
          }
        ]
      },
      {
        "tier": 9,
        "tech_level_range": [35, 38],
        "research_cost": 5000,
        "technologies": [
          {
            "id": "deflector_10",
            "name": "Class X Deflector Shield",
            "tech_level": 36,
            "category": "ship_shield",
            "unlocks": "class_10_deflector",
            "effect": {
              "damage_absorption": 10
            },
            "component": {
              "space": 26,
              "cost": 108
            }
          },
          {
            "id": "stasis_field",
            "name": "Stasis Field",
            "tech_level": 37,
            "category": "tactical_field",
            "unlocks": "stasis_field",
            "effect": {
              "disable_duration_turns": 1,
              "prevents_retreat": true,
              "prevents_targeting": true,
              "cannot_retarget_same_ship_consecutive_rounds": true,
              "description": "Completely disables target ship for 1 combat round; ship cannot fire, move, or retreat. Immune to all targeting while frozen."
            },
            "component": {
              "space": 45,
              "cost": 90
            }
          },
          {
            "id": "personal_barrier",
            "name": "Personal Barrier Shield",
            "tech_level": 38,
            "category": "personal_shield",
            "unlocks": "personal_barrier",
            "effect": {
              "ground_combat_bonus": 30
            }
          }
        ]
      },
      {
        "tier": 10,
        "tech_level_range": [39, 42],
        "research_cost": 8000,
        "technologies": [
          {
            "id": "deflector_11",
            "name": "Class XI Deflector Shield",
            "tech_level": 40,
            "category": "ship_shield",
            "unlocks": "class_11_deflector",
            "effect": {
              "damage_absorption": 11
            },
            "component": {
              "space": 28,
              "cost": 125
            }
          },
          {
            "id": "planetary_20",
            "name": "Planetary Shield XX",
            "tech_level": 42,
            "category": "planetary_shield",
            "unlocks": "planetary_shield_20",
            "effect": {
              "bombardment_absorption": 20
            },
            "building": {
              "build_cost": 4000,
              "maintenance": 20
            }
          }
        ]
      },
      {
        "tier": 11,
        "tech_level_range": [43, 46],
        "research_cost": 12000,
        "technologies": [
          {
            "id": "black_hole_generator",
            "name": "Black Hole Generator",
            "tech_level": 43,
            "category": "tactical_field",
            "unlocks": "black_hole_generator",
            "effect": {
              "stack_destruction_min": 0.25,
              "stack_destruction_max": 1.00,
              "destruction_penalty_per_shield_class": 0.02,
              "cooldown_turns": 3,
              "description": "Destroys 25-100% of target ship stack (roll 1d4 × 25%) − 2% per shield class"
            },
            "component": {
              "space": 100,
              "cost": 250,
              "requires_ship_class": ["huge"]
            }
          },
          {
            "id": "deflector_12",
            "name": "Class XII Deflector Shield",
            "tech_level": 44,
            "category": "ship_shield",
            "unlocks": "class_12_deflector",
            "effect": {
              "damage_absorption": 12
            },
            "component": {
              "space": 30,
              "cost": 145
            }
          },
          {
            "id": "lightning_shield",
            "name": "Lightning Shield",
            "tech_level": 46,
            "category": "tactical_field",
            "unlocks": "lightning_shield",
            "effect": {
              "missile_destroy_chance_base": 1.00,
              "missile_destroy_chance_penalty_per_tech_level": 0.01,
              "description": "100% chance to destroy each incoming missile − 1% per missile tech level"
            },
            "component": {
              "space": 15,
              "cost": 45
            }
          }
        ]
      },
      {
        "tier": 12,
        "tech_level_range": [47, 49],
        "research_cost": 18000,
        "technologies": [
          {
            "id": "deflector_13",
            "name": "Class XIII Deflector Shield",
            "tech_level": 48,
            "category": "ship_shield",
            "unlocks": "class_13_deflector",
            "effect": {
              "damage_absorption": 13
            },
            "component": {
              "space": 32,
              "cost": 165
            }
          }
        ]
      },
      {
        "tier": 13,
        "tech_level_range": [50, 51],
        "research_cost": 30000,
        "technologies": [
          {
            "id": "deflector_14",
            "name": "Class XIV Deflector Shield",
            "tech_level": 50,
            "category": "ship_shield",
            "unlocks": "class_14_deflector",
            "effect": {
              "damage_absorption": 14
            },
            "component": {
              "space": 34,
              "cost": 190
            }
          }
        ]
      },
      {
        "tier": 14,
        "tech_level_range": [52, 55],
        "research_cost": 50000,
        "technologies": [
          {
            "id": "deflector_15",
            "name": "Class XV Deflector Shield",
            "tech_level": 52,
            "category": "ship_shield",
            "unlocks": "class_15_deflector",
            "effect": {
              "damage_absorption": 15
            },
            "component": {
              "space": 36,
              "cost": 220
            }
          }
        ]
      }
    ],
    
    "categories": {
      "ship_shield": 15,
      "planetary_shield": 4,
      "personal_shield": 3,
      "tactical_field": 6
    },
    
    "racial_bonuses": {
      "hermit_crabs": {
        "shield_absorption_multiplier": 1.25,
        "description": "Crystalline shell provides +25% shield effectiveness"
      }
    }
  }
}
```

---

## Category Summaries

### Deflector Shields (15 total)

| Class | Tech Level | Absorbs | Space | Cost |
|-------|------------|---------|-------|------|
| I | 1 | 1 | 8 | 12 BC |
| II | 4 | 2 | 10 | 18 BC |
| III | 10 | 3 | 12 | 25 BC |
| IV | 14 | 4 | 14 | 32 BC |
| V | 20 | 5 | 16 | 42 BC |
| VI | 24 | 6 | 18 | 52 BC |
| VII | 30 | 7 | 20 | 65 BC |
| VIII | 26 | 8 | 22 | 78 BC |
| IX | 34 | 9 | 24 | 92 BC |
| X | 36 | 10 | 26 | 108 BC |
| XI | 40 | 11 | 28 | 125 BC |
| XII | 44 | 12 | 30 | 145 BC |
| XIII | 48 | 13 | 32 | 165 BC |
| XIV | 50 | 14 | 34 | 190 BC |
| XV | 52 | 15 | 36 | 220 BC |

### Planetary Shields (4 total)

| Shield | Tech Level | Absorbs | Build Cost | Maintenance |
|--------|------------|---------|------------|-------------|
| V | 12 | 5 | 500 BC | 5 BC/turn |
| X | 22 | 10 | 1,000 BC | 10 BC/turn |
| XV | 32 | 15 | 2,000 BC | 15 BC/turn |
| XX | 42 | 20 | 4,000 BC | 20 BC/turn |

### Personal Shields (3 total)

| Shield | Tech Level | Ground Bonus |
|--------|------------|--------------|
| Personal Deflector | 8 | +10 |
| Personal Absorption | 21 | +20 |
| Personal Barrier | 38 | +30 |

### Tactical Fields (6 total)

| System | Tech Level | Effect | Space | Cost |
|--------|------------|--------|-------|------|
| Repulsor Beam | 16 | Push 2 hexes | 20 | 35 BC |
| Cloaking Device | 27 | +5 Def, invisible | 30 | 80 BC |
| Zyro Shield | 31 | 75% − 1%/missile TL missile destroy | 25 | 70 BC |
| Stasis Field | 37 | Disable 1 turn | 45 | 90 BC |
| Black Hole Gen | 43 | 25-100% stack destroy − 2%/shield class | 100 | 250 BC |
| Lightning Shield | 46 | 100% − 1%/missile TL missile destroy | 15 | 45 BC |

---

## Edge Cases

### Shield Stacking
- Only one deflector shield can be equipped per ship
- Deflector shields and planetary shields do NOT stack on ships
- Planetary shields DO stack with missile base shields

### Shield vs Special Weapons
- **Torpedoes:** Ignore shields entirely
- **Death Ray:** Ignores shields
- **Ion Cannon:** Halves shield value
- **Mass Driver:** 50% of damage ignores shields
- **Biological Weapons:** Ignore shields and planetary shields

### Zyro Shield Edge Cases
- Base 75% destruction chance reduced by 1% per missile tech level
- Does not affect torpedoes
- Roll per missile, not per salvo
- MIRV missiles: each warhead rolled separately
- Stacks with ECM (multiplicative)

### Black Hole Generator Limitations
- Base destruction (25-100%) reduced by 2% per shield class on target
- Only usable on Huge hull ships
- 3-turn cooldown between uses
- Does NOT affect Orion Guardian (10% damage cap)
- Does NOT affect planets
- Friendly fire possible if targeting own hex (do not do this)

### Stasis Field Edge Cases
- Cannot target same ship two consecutive combat rounds
- Stasis target immune to friendly and enemy fire while in stasis
- **Stasis DOES prevent retreat** — a ship in stasis cannot move or retreat that round (contrary to a previous note which said otherwise; this is the authoritative ruling)
- After stasis expires, ship can retreat normally on the next round
- Does not work on Orion Guardian

---

## Examples

### Example 1: Shield Absorption
**Situation:** Enemy fires Fusion Beam (4-16 damage) at ship with Class V Deflector (absorbs 5).
- Roll: 12 damage
- After shields: 12 - 5 = 7 damage taken

### Example 2: Shield Completely Blocks
**Situation:** Enemy fires Gatling Laser (1-4 damage ×4 shots) at ship with Class V Deflector.
- Each shot deals max 4 damage
- Shield absorbs 5 per hit
- Result: 0 damage from all 4 shots (shields completely negate)

### Example 3: Zyro Shield vs Missile Salvo
**Situation:** 20-missile salvo (Tech Level 10 missiles) incoming. Ship has Zyro Shield.
- Base destruction chance: 75%
- Tech level penalty: 10 × 1% = 10%
- Actual destruction chance: 75% - 10% = 65%
- Expected missiles destroyed: 20 × 0.65 = 13
- Expected missiles hitting: 7
- (Then ECM reduces hit chance on remaining 7)

### Example 4: Black Hole Generator
**Situation:** Enemy has 8 Large ships with Class V Shields. You activate Black Hole Generator.
- Roll 1d4: result is 3
- Base destruction: 3 × 25% = 75%
- Shield reduction: 5 × 2% = 10%
- Actual destruction: 75% - 10% = 65%
- Ships destroyed: 8 × 0.65 = 5.2 → 5 ships
- Ships remaining: 3 ships

### Example 5: Hermit Crab Racial Bonus
**Situation:** Hermit Crab ship with Class VIII Deflector (normally absorbs 8).
- Racial bonus: ×1.25
- Effective absorption: 8 × 1.25 = 10
- Hermit Crab Class VIII equals standard Class X effectiveness

---

## Related Documents

- `../ships/components-complete.md` - Full component statistics
- `../ships/combat-algorithm.md` - How shields integrate with combat
- `computers.md` - ECM synergy with shields
- `weapons.md` - Shield-penetrating weapons
- `construction.md` - Armor works alongside shields
- `planetology.md` - Next tech field

---

*Last Updated: 2026-04-15*
*Specification: spec-013 - Complete Tech Tree - Force Fields Field*
