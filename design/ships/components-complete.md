# Complete Ship Components Table

## Overview

This document provides the complete statistics for all non-weapon ship components in Hamster of Orion. Components include engines, computers, ECM, shields, armor, scanners, and special systems.

**Component Categories:**
- **Engines** - Determine interstellar speed and combat maneuverability
- **Fuel Cells** - Determine maximum range from colonies
- **Battle Computers** - Increase attack accuracy
- **ECM Jammers** - Reduce enemy missile hit chance
- **Deflector Shields** - Absorb damage per hit
- **Armor** - Increase ship hull points
- **Scanners** - Detection and targeting systems
- **Special Systems** - Unique tactical abilities

---

## Engines

Engines determine interstellar travel speed (parsecs/turn) and combat maneuverability. Every ship requires an engine.

| Engine | Tech Level | Speed | Combat Speed | Space | Cost | Maneuver |
|--------|------------|-------|--------------|-------|------|----------|
| Retro Engine | 1 | 1 | 1 | 25 | 10 BC | 1 |
| Nuclear Engine | 5 | 2 | 2 | 22 | 18 BC | 1 |
| Sub-Light Drive | 8 | 2 | 3 | 20 | 25 BC | 2 |
| Fusion Drive | 12 | 3 | 3 | 18 | 35 BC | 2 |
| Impulse Drive | 16 | 3 | 4 | 17 | 45 BC | 2 |
| Ion Drive | 20 | 4 | 4 | 15 | 55 BC | 3 |
| Antimatter Drive | 26 | 5 | 5 | 14 | 70 BC | 3 |
| Interphased Drive | 34 | 6 | 6 | 12 | 90 BC | 4 |
| Hyperdrive | 42 | 7 | 7 | 11 | 120 BC | 4 |
| Hyper-X Drive | 48 | 8 | 8 | 10 | 150 BC | 5 |

### Engine Notes

**Speed:** Parsecs traveled per turn on galaxy map.

**Combat Speed:** Hexes moved per combat round.

**Maneuver:** Bonus to defense (harder to hit) and initiative order.

---

## Fuel Cells

Fuel cells determine maximum range from the nearest friendly colony. Ships cannot travel beyond their fuel range.

| Fuel Cell | Tech Level | Range | Space | Cost |
|-----------|------------|-------|-------|------|
| Standard Fuel | 1 | 4 | 0 | 0 BC |
| Extended Fuel | 4 | 5 | 3 | 5 BC |
| Improved Fuel | 8 | 6 | 3 | 8 BC |
| Advanced Fuel | 13 | 7 | 3 | 12 BC |
| Superior Fuel | 18 | 8 | 3 | 16 BC |
| High-Capacity | 24 | 9 | 3 | 22 BC |
| Ultra Fuel | 30 | 10 | 3 | 28 BC |
| Maximum Fuel | 37 | 11 | 3 | 35 BC |
| Thorium Cells | 45 | ∞ | 5 | 50 BC |

### Fuel Notes

**Standard Fuel:** Included in all ships by default (no space cost).

**Thorium Cells:** Infinite range - ships can travel anywhere.

---

## Battle Computers

Battle computers increase weapon accuracy (Attack Rating). Each point of Attack Rating adds approximately 5% to hit chance.

| Computer | Tech Level | Attack Rating | Space | Cost |
|----------|------------|---------------|-------|------|
| Battle Computer I | 1 | +1 | 5 | 10 BC |
| Battle Computer II | 6 | +2 | 6 | 15 BC |
| Battle Computer III | 11 | +3 | 7 | 22 BC |
| Battle Computer IV | 16 | +4 | 8 | 30 BC |
| Battle Computer V | 21 | +5 | 9 | 40 BC |
| Battle Computer VI | 26 | +6 | 10 | 52 BC |
| Battle Computer VII | 31 | +7 | 11 | 65 BC |
| Battle Computer VIII | 36 | +8 | 12 | 80 BC |
| Battle Computer IX | 41 | +9 | 14 | 100 BC |
| Battle Computer X | 46 | +10 | 16 | 125 BC |
| Battle Computer XI | 50 | +11 | 18 | 150 BC |

### Computer Notes

**Hit Chance Formula:**
```
Hit_Chance = 50 + (Attack_Rating × 5) - (Target_Defense × 5) + Size_Modifier
```

---

## ECM Jammers

ECM (Electronic Countermeasures) reduce enemy missile hit chance. Each point of ECM reduces missile accuracy by 5%.

| ECM | Tech Level | Missile Defense | Space | Cost |
|-----|------------|-----------------|-------|------|
| ECM Jammer I | 3 | +1 | 4 | 8 BC |
| ECM Jammer II | 8 | +2 | 5 | 12 BC |
| ECM Jammer III | 13 | +3 | 6 | 18 BC |
| ECM Jammer IV | 18 | +4 | 7 | 25 BC |
| ECM Jammer V | 23 | +5 | 8 | 35 BC |
| ECM Jammer VI | 28 | +6 | 9 | 45 BC |
| ECM Jammer VII | 33 | +7 | 10 | 58 BC |
| ECM Jammer VIII | 38 | +8 | 12 | 72 BC |
| ECM Jammer IX | 43 | +9 | 14 | 90 BC |
| ECM Jammer X | 48 | +10 | 16 | 110 BC |

### ECM Notes

**Missile Hit Formula:**
```
Missile_Hit_Chance = Base_Accuracy - (ECM_Level × 5%)
```

ECM does NOT affect beam weapons or torpedoes.

---

## Deflector Shields

Shields absorb a fixed amount of damage from each hit. Shields regenerate fully between battles.

| Shield | Tech Level | Absorbs | Space | Cost |
|--------|------------|---------|-------|------|
| Class I Deflector | 2 | 1 | 8 | 12 BC |
| Class II Deflector | 5 | 2 | 10 | 18 BC |
| Class III Deflector | 8 | 3 | 12 | 25 BC |
| Class IV Deflector | 11 | 4 | 14 | 32 BC |
| Class V Deflector | 14 | 5 | 16 | 42 BC |
| Class VI Deflector | 18 | 6 | 18 | 52 BC |
| Class VII Deflector | 22 | 7 | 20 | 65 BC |
| Class VIII Deflector | 26 | 8 | 22 | 78 BC |
| Class IX Deflector | 30 | 9 | 24 | 92 BC |
| Class X Deflector | 34 | 10 | 26 | 108 BC |
| Class XI Deflector | 38 | 11 | 28 | 125 BC |
| Class XII Deflector | 42 | 12 | 30 | 145 BC |
| Class XIII Deflector | 45 | 13 | 32 | 165 BC |
| Class XIV Deflector | 48 | 14 | 34 | 190 BC |
| Class XV Deflector | 50 | 15 | 36 | 220 BC |

### Shield Notes

**Damage Reduction:**
```
Actual_Damage = Weapon_Damage - Shield_Absorb
Minimum_Damage = 0 (shields can completely block weak weapons)
```

**Shield Bypass:** Some weapons ignore or halve shields (see weapons-complete.md).

---

## Armor

Armor determines base hull hit points. Higher-tier armor multiplies HP and provides ground combat bonuses.

| Armor | Tech Level | HP Multiplier | Ground Bonus | Notes |
|-------|------------|---------------|--------------|-------|
| Titanium | 1 | 1.0× | +0 | Starting armor |
| Duralloy | 10 | 1.5× | +5 | — |
| Zortrium | 17 | 2.0× | +10 | — |
| Andrium | 26 | 2.5× | +15 | — |
| Tritanium | 34 | 3.0× | +20 | — |
| Adamantium | 42 | 3.5× | +25 | — |
| Neutronium | 50 | 4.0× | +30 | Ultimate armor |

### Armor Notes

**Base HP by Hull Size (MOO1):**

| Hull Size | Base HP (Titanium) |
|-----------|--------------------|
| Small | 3 |
| Medium | 18 |
| Large | 100 |
| Huge | 600 |

**Example:** A Large hull with Zortrium Armor has 100 × 2.0 = 200 HP.

**Armor Space:** Armor does not consume ship space - it fills remaining space automatically.

---

## Scanners

Scanners provide detection range and tactical advantages.

| Scanner | Tech Level | Colony Detect | Ship Detect | Space | Cost | Special |
|---------|------------|---------------|-------------|-------|------|---------|
| None | — | 1 | 0 | 0 | 0 BC | — |
| Deep Space Scanner | 5 | 5 | 1 | 5 | 15 BC | — |
| Improved Scanner | 14 | 7 | 2 | 6 | 25 BC | Shows ETA |
| Advanced Scanner | 24 | 9 | 3 | 8 | 40 BC | Shows planet stats |
| Subspace Scanner | 35 | 12 | 4 | 10 | 60 BC | — |
| Hyper Scanner | 45 | 15 | 5 | 12 | 85 BC | See cloaked ships |

### Scanner Notes

**Colony Detect:** Detection range (parsecs) from your colonies.

**Ship Detect:** Detection range from your ships.

---

## Battle Scanner

The Battle Scanner is a special computer enhancement.

| Component | Tech Level | Effect | Space | Cost |
|-----------|------------|--------|-------|------|
| Battle Scanner | 1 | +3 Initiative, +1 Targeting, View enemy ship stats | 8 | 20 BC |

---

## Special Systems

### Cloaking Devices

| Device | Tech Level | Effect | Space | Cost |
|--------|------------|--------|-------|------|
| Cloaking Device | 30 | +5 Defense, invisible until firing | 30 | 80 BC |
| Improved Cloaking | 40 | +5 Defense, -50% detection range | 35 | 120 BC |
| Perfect Cloaking | 50 | Invisible even while firing | 50 | 200 BC |

### Repair Systems

| System | Tech Level | Effect | Space | Cost |
|--------|------------|--------|-------|------|
| Automated Repair | 15 | +15% HP per turn | 25 | 40 BC |
| Advanced Damage Control | 35 | +30% HP per turn | 35 | 80 BC |

### Tactical Systems

| System | Tech Level | Effect | Space | Cost |
|--------|------------|--------|-------|------|
| Inertial Stabilizer | 3 | +2 Defense, +2 Initiative | 15 | 25 BC |
| Inertial Nullifier | 20 | +4 Defense, +4 Initiative | 20 | 50 BC |
| Repulsor Beam | 18 | Push ships 1 hex away | 20 | 35 BC |
| Tractor Beam | 22 | Pull ships 1 hex closer | 20 | 40 BC |
| Stasis Field | 38 | Disable target 2 turns | 45 | 90 BC |
| Displacement Device | 45 | 33% chance to ignore any hit | 40 | 110 BC |
| High Energy Focus | 48 | +2 Initiative, +1 Attack | 30 | 80 BC |
| Sub-Space Teleporter | 28 | Teleport to any hex | 35 | 75 BC |
| Warp Dissipator | 25 | Prevent enemy retreat | 25 | 55 BC |

### Boarding Systems

| System | Tech Level | Effect | Space | Cost |
|--------|------------|--------|-------|------|
| Standard Transporter | 25 | Board adjacent ship | 20 | 45 BC |
| Improved Transporter | 35 | Board within 2 hexes | 25 | 70 BC |
| Combat Transporter | 45 | Board within 3 hexes, +50% success | 35 | 100 BC |

### Reserve Fuel Tank

| System | Tech Level | Effect | Space | Cost |
|--------|------------|--------|-------|------|
| Reserve Fuel Tank | 1 | +3 range | 15 | 20 BC |
| Extended Reserve Tank | 15 | +5 range | 20 | 35 BC |

---

## Planetary Shields

For planetary defense (not mounted on ships).

| Shield | Tech Level | Absorbs | Cost |
|--------|------------|---------|------|
| Planetary Shield V | 12 | 5 | 500 BC |
| Planetary Shield X | 22 | 10 | 1,000 BC |
| Planetary Shield XV | 32 | 15 | 2,000 BC |
| Planetary Shield XX | 42 | 20 | 4,000 BC |

---

## Ground Combat Gear

Passive bonuses for ground invasions.

| Equipment | Tech Level | Ground Bonus | Type |
|-----------|------------|--------------|------|
| Personal Deflector | 8 | +10 | Shield |
| Battle Suits | 12 | +10 | Armor |
| Personal Absorption | 21 | +20 | Shield |
| Armored Exoskeleton | 25 | +20 | Armor |
| Personal Barrier | 38 | +30 | Shield |

---

## Robotic Controls

Planetary production enhancement (not ship component).

| Technology | Tech Level | Factories/Pop |
|------------|------------|---------------|
| Robotic Controls II (Base) | 1 | 2:1 |
| Robotic Controls III | 10 | 3:1 |
| Robotic Controls IV | 16 | 4:1 |
| Robotic Controls V | 23 | 5:1 |
| Robotic Controls VI | 30 | 6:1 |
| Robotic Controls VII | 38 | 7:1 |

**Note:** Tech levels align with `economy/factory-formulas.md` (canonical source for Robotic Controls).

---

## Component Space by Ship Class

Maximum space available for components (MOO1 hull sizes):

| Hull Size | Base Space | Notes |
|-----------|------------|-------|
| Small | ~40 | Scouts, fighters, colony ships |
| Medium | ~100 | Multi-role warships |
| Large | ~250 | Heavy warships |
| Huge | ~500+ | Capital ships |

**Note:** In MOO1, ship systems (engines, shields, etc.) are automatic and don't consume space. Only weapons and specials use space. Space increases with Construction technology.

---

## JSON Data Schema

```json
{
  "engines": [
    {
      "id": "retro_engine",
      "name": "Retro Engine",
      "tech_level": 1,
      "speed": 1,
      "combat_speed": 1,
      "space": 25,
      "cost": 10,
      "maneuver": 1
    },
    {
      "id": "nuclear_engine",
      "name": "Nuclear Engine",
      "tech_level": 5,
      "speed": 2,
      "combat_speed": 2,
      "space": 22,
      "cost": 18,
      "maneuver": 1
    },
    {
      "id": "sub_light_drive",
      "name": "Sub-Light Drive",
      "tech_level": 8,
      "speed": 2,
      "combat_speed": 3,
      "space": 20,
      "cost": 25,
      "maneuver": 2
    },
    {
      "id": "fusion_drive",
      "name": "Fusion Drive",
      "tech_level": 12,
      "speed": 3,
      "combat_speed": 3,
      "space": 18,
      "cost": 35,
      "maneuver": 2
    },
    {
      "id": "impulse_drive",
      "name": "Impulse Drive",
      "tech_level": 16,
      "speed": 3,
      "combat_speed": 4,
      "space": 17,
      "cost": 45,
      "maneuver": 2
    },
    {
      "id": "ion_drive",
      "name": "Ion Drive",
      "tech_level": 20,
      "speed": 4,
      "combat_speed": 4,
      "space": 15,
      "cost": 55,
      "maneuver": 3
    },
    {
      "id": "antimatter_drive",
      "name": "Antimatter Drive",
      "tech_level": 26,
      "speed": 5,
      "combat_speed": 5,
      "space": 14,
      "cost": 70,
      "maneuver": 3
    },
    {
      "id": "interphased_drive",
      "name": "Interphased Drive",
      "tech_level": 34,
      "speed": 6,
      "combat_speed": 6,
      "space": 12,
      "cost": 90,
      "maneuver": 4
    },
    {
      "id": "hyperdrive",
      "name": "Hyperdrive",
      "tech_level": 42,
      "speed": 7,
      "combat_speed": 7,
      "space": 11,
      "cost": 120,
      "maneuver": 4
    },
    {
      "id": "hyper_x_drive",
      "name": "Hyper-X Drive",
      "tech_level": 48,
      "speed": 8,
      "combat_speed": 8,
      "space": 10,
      "cost": 150,
      "maneuver": 5
    }
  ],

  "fuel_cells": [
    { "id": "standard_fuel", "name": "Standard Fuel", "tech_level": 1, "range": 4, "space": 0, "cost": 0 },
    { "id": "extended_fuel", "name": "Extended Fuel", "tech_level": 4, "range": 5, "space": 3, "cost": 5 },
    { "id": "improved_fuel", "name": "Improved Fuel", "tech_level": 8, "range": 6, "space": 3, "cost": 8 },
    { "id": "advanced_fuel", "name": "Advanced Fuel", "tech_level": 13, "range": 7, "space": 3, "cost": 12 },
    { "id": "superior_fuel", "name": "Superior Fuel", "tech_level": 18, "range": 8, "space": 3, "cost": 16 },
    { "id": "high_capacity", "name": "High-Capacity", "tech_level": 24, "range": 9, "space": 3, "cost": 22 },
    { "id": "ultra_fuel", "name": "Ultra Fuel", "tech_level": 30, "range": 10, "space": 3, "cost": 28 },
    { "id": "maximum_fuel", "name": "Maximum Fuel", "tech_level": 37, "range": 11, "space": 3, "cost": 35 },
    { "id": "thorium_cells", "name": "Thorium Cells", "tech_level": 45, "range": -1, "space": 5, "cost": 50 }
  ],

  "battle_computers": [
    { "id": "bc_1", "name": "Battle Computer I", "tech_level": 1, "attack_rating": 1, "space": 5, "cost": 10 },
    { "id": "bc_2", "name": "Battle Computer II", "tech_level": 6, "attack_rating": 2, "space": 6, "cost": 15 },
    { "id": "bc_3", "name": "Battle Computer III", "tech_level": 11, "attack_rating": 3, "space": 7, "cost": 22 },
    { "id": "bc_4", "name": "Battle Computer IV", "tech_level": 16, "attack_rating": 4, "space": 8, "cost": 30 },
    { "id": "bc_5", "name": "Battle Computer V", "tech_level": 21, "attack_rating": 5, "space": 9, "cost": 40 },
    { "id": "bc_6", "name": "Battle Computer VI", "tech_level": 26, "attack_rating": 6, "space": 10, "cost": 52 },
    { "id": "bc_7", "name": "Battle Computer VII", "tech_level": 31, "attack_rating": 7, "space": 11, "cost": 65 },
    { "id": "bc_8", "name": "Battle Computer VIII", "tech_level": 36, "attack_rating": 8, "space": 12, "cost": 80 },
    { "id": "bc_9", "name": "Battle Computer IX", "tech_level": 41, "attack_rating": 9, "space": 14, "cost": 100 },
    { "id": "bc_10", "name": "Battle Computer X", "tech_level": 46, "attack_rating": 10, "space": 16, "cost": 125 },
    { "id": "bc_11", "name": "Battle Computer XI", "tech_level": 50, "attack_rating": 11, "space": 18, "cost": 150 }
  ],

  "ecm_jammers": [
    { "id": "ecm_1", "name": "ECM Jammer I", "tech_level": 3, "missile_defense": 1, "space": 4, "cost": 8 },
    { "id": "ecm_2", "name": "ECM Jammer II", "tech_level": 8, "missile_defense": 2, "space": 5, "cost": 12 },
    { "id": "ecm_3", "name": "ECM Jammer III", "tech_level": 13, "missile_defense": 3, "space": 6, "cost": 18 },
    { "id": "ecm_4", "name": "ECM Jammer IV", "tech_level": 18, "missile_defense": 4, "space": 7, "cost": 25 },
    { "id": "ecm_5", "name": "ECM Jammer V", "tech_level": 23, "missile_defense": 5, "space": 8, "cost": 35 },
    { "id": "ecm_6", "name": "ECM Jammer VI", "tech_level": 28, "missile_defense": 6, "space": 9, "cost": 45 },
    { "id": "ecm_7", "name": "ECM Jammer VII", "tech_level": 33, "missile_defense": 7, "space": 10, "cost": 58 },
    { "id": "ecm_8", "name": "ECM Jammer VIII", "tech_level": 38, "missile_defense": 8, "space": 12, "cost": 72 },
    { "id": "ecm_9", "name": "ECM Jammer IX", "tech_level": 43, "missile_defense": 9, "space": 14, "cost": 90 },
    { "id": "ecm_10", "name": "ECM Jammer X", "tech_level": 48, "missile_defense": 10, "space": 16, "cost": 110 }
  ],

  "shields": [
    { "id": "shield_1", "name": "Class I Deflector", "tech_level": 2, "absorbs": 1, "space": 8, "cost": 12 },
    { "id": "shield_2", "name": "Class II Deflector", "tech_level": 5, "absorbs": 2, "space": 10, "cost": 18 },
    { "id": "shield_3", "name": "Class III Deflector", "tech_level": 8, "absorbs": 3, "space": 12, "cost": 25 },
    { "id": "shield_4", "name": "Class IV Deflector", "tech_level": 11, "absorbs": 4, "space": 14, "cost": 32 },
    { "id": "shield_5", "name": "Class V Deflector", "tech_level": 14, "absorbs": 5, "space": 16, "cost": 42 },
    { "id": "shield_6", "name": "Class VI Deflector", "tech_level": 18, "absorbs": 6, "space": 18, "cost": 52 },
    { "id": "shield_7", "name": "Class VII Deflector", "tech_level": 22, "absorbs": 7, "space": 20, "cost": 65 },
    { "id": "shield_8", "name": "Class VIII Deflector", "tech_level": 26, "absorbs": 8, "space": 22, "cost": 78 },
    { "id": "shield_9", "name": "Class IX Deflector", "tech_level": 30, "absorbs": 9, "space": 24, "cost": 92 },
    { "id": "shield_10", "name": "Class X Deflector", "tech_level": 34, "absorbs": 10, "space": 26, "cost": 108 },
    { "id": "shield_11", "name": "Class XI Deflector", "tech_level": 38, "absorbs": 11, "space": 28, "cost": 125 },
    { "id": "shield_12", "name": "Class XII Deflector", "tech_level": 42, "absorbs": 12, "space": 30, "cost": 145 },
    { "id": "shield_13", "name": "Class XIII Deflector", "tech_level": 45, "absorbs": 13, "space": 32, "cost": 165 },
    { "id": "shield_14", "name": "Class XIV Deflector", "tech_level": 48, "absorbs": 14, "space": 34, "cost": 190 },
    { "id": "shield_15", "name": "Class XV Deflector", "tech_level": 50, "absorbs": 15, "space": 36, "cost": 220 }
  ],

  "armor": [
    { "id": "titanium", "name": "Titanium", "tech_level": 1, "hp_multiplier": 1.0, "ground_bonus": 0 },
    { "id": "duralloy", "name": "Duralloy", "tech_level": 10, "hp_multiplier": 1.5, "ground_bonus": 5 },
    { "id": "zortrium", "name": "Zortrium", "tech_level": 17, "hp_multiplier": 2.0, "ground_bonus": 10 },
    { "id": "andrium", "name": "Andrium", "tech_level": 26, "hp_multiplier": 2.5, "ground_bonus": 15 },
    { "id": "tritanium", "name": "Tritanium", "tech_level": 34, "hp_multiplier": 3.0, "ground_bonus": 20 },
    { "id": "adamantium", "name": "Adamantium", "tech_level": 42, "hp_multiplier": 3.5, "ground_bonus": 25 },
    { "id": "neutronium", "name": "Neutronium", "tech_level": 50, "hp_multiplier": 4.0, "ground_bonus": 30 }
  ],

  "base_hp_by_class": {
    "small": 3,
    "medium": 18,
    "large": 100,
    "huge": 600
  },

  "scanners": [
    { "id": "deep_space", "name": "Deep Space Scanner", "tech_level": 5, "colony_detect": 5, "ship_detect": 1, "space": 5, "cost": 15 },
    { "id": "improved", "name": "Improved Scanner", "tech_level": 14, "colony_detect": 7, "ship_detect": 2, "space": 6, "cost": 25 },
    { "id": "advanced", "name": "Advanced Scanner", "tech_level": 24, "colony_detect": 9, "ship_detect": 3, "space": 8, "cost": 40 },
    { "id": "subspace", "name": "Subspace Scanner", "tech_level": 35, "colony_detect": 12, "ship_detect": 4, "space": 10, "cost": 60 },
    { "id": "hyper", "name": "Hyper Scanner", "tech_level": 45, "colony_detect": 15, "ship_detect": 5, "space": 12, "cost": 85 }
  ],

  "special_systems": {
    "cloaking": [
      { "id": "cloak_basic", "name": "Cloaking Device", "tech_level": 30, "defense_bonus": 5, "space": 30, "cost": 80, "effect": "invisible_until_fire" },
      { "id": "cloak_improved", "name": "Improved Cloaking", "tech_level": 40, "defense_bonus": 5, "space": 35, "cost": 120, "effect": "reduced_detection" },
      { "id": "cloak_perfect", "name": "Perfect Cloaking", "tech_level": 50, "defense_bonus": 5, "space": 50, "cost": 200, "effect": "always_invisible" }
    ],
    "repair": [
      { "id": "auto_repair", "name": "Automated Repair", "tech_level": 15, "hp_per_turn": 0.15, "space": 25, "cost": 40 },
      { "id": "adv_damage_control", "name": "Advanced Damage Control", "tech_level": 35, "hp_per_turn": 0.30, "space": 35, "cost": 80 }
    ],
    "tactical": [
      { "id": "inertial_stab", "name": "Inertial Stabilizer", "tech_level": 3, "defense_bonus": 2, "initiative_bonus": 2, "space": 15, "cost": 25 },
      { "id": "inertial_null", "name": "Inertial Nullifier", "tech_level": 20, "defense_bonus": 4, "initiative_bonus": 4, "space": 20, "cost": 50 },
      { "id": "repulsor", "name": "Repulsor Beam", "tech_level": 18, "effect": "push_1_hex", "space": 20, "cost": 35 },
      { "id": "tractor", "name": "Tractor Beam", "tech_level": 22, "effect": "pull_1_hex", "space": 20, "cost": 40 },
      { "id": "stasis", "name": "Stasis Field", "tech_level": 38, "effect": "disable_2_turns", "space": 45, "cost": 90 },
      { "id": "displacement", "name": "Displacement Device", "tech_level": 45, "dodge_chance": 0.33, "space": 40, "cost": 110 },
      { "id": "hef", "name": "High Energy Focus", "tech_level": 48, "initiative_bonus": 2, "attack_bonus": 1, "space": 30, "cost": 80 },
      { "id": "teleporter", "name": "Sub-Space Teleporter", "tech_level": 28, "effect": "teleport_any_hex", "space": 35, "cost": 75 },
      { "id": "dissipator", "name": "Warp Dissipator", "tech_level": 25, "effect": "prevent_retreat", "space": 25, "cost": 55 }
    ],
    "boarding": [
      { "id": "transporter_std", "name": "Standard Transporter", "tech_level": 25, "range": 1, "space": 20, "cost": 45 },
      { "id": "transporter_imp", "name": "Improved Transporter", "tech_level": 35, "range": 2, "space": 25, "cost": 70 },
      { "id": "transporter_combat", "name": "Combat Transporter", "tech_level": 45, "range": 3, "success_bonus": 0.50, "space": 35, "cost": 100 }
    ]
  },

  "planetary_shields": [
    { "id": "pshield_5", "name": "Planetary Shield V", "tech_level": 12, "absorbs": 5, "cost": 500 },
    { "id": "pshield_10", "name": "Planetary Shield X", "tech_level": 22, "absorbs": 10, "cost": 1000 },
    { "id": "pshield_15", "name": "Planetary Shield XV", "tech_level": 32, "absorbs": 15, "cost": 2000 },
    { "id": "pshield_20", "name": "Planetary Shield XX", "tech_level": 42, "absorbs": 20, "cost": 4000 }
  ]
}
```

---

## Racial Ship Combat Modifiers

These modifiers are applied to ships belonging to each race. See `../species/race-stats-complete.md` for complete racial abilities.

| Race | Modifier | Source Ability | Notes |
|------|----------|----------------|-------|
| Budgies | +3 Defense Level, +3 Initiative, +20% Evasion | Superior Pilots | Ships harder to hit, act earlier in combat |
| Ferrets | +4 Attack Levels | Deadly Accuracy | Hit chance bonus only (no damage bonus) |
| Ants | -10% Ship/Troop Cost | Expendable Units | Applies to production cost |
| Mice | +50% Factory Efficiency, +2 RC Levels | Automated Production, Cybernetic Workers | Indirect benefit: more production for ships |
| Rabbits | -15% Ship Cost | Swarm Tactics | Can field larger fleets cheaply |

**Note:** Hermit Crabs' "Armored Shell" ability (+50% defense) applies to **ground combat** only, not ship armor. Racial research bonuses (e.g., Budgies +40% Propulsion, Mice +40% Computers) affect component unlock timing but not component stats directly.

---

## Related Documents

- `weapons-complete.md` - All offensive weapons
- `ship-classes.md` - Ship size categories
- `ship-design.md` - Ship design process
- `combat-algorithm.md` - How components affect combat
- `../technology/` - Tech tree for unlocking components

---

*Last Updated: 2026-03-22*
*Specification: spec-007 - Complete Ship Components Table*
