# Complete Weapons Table

## Overview

This document provides the complete weapon statistics for all weapons in Hamster of Orion. All values are faithful to Master of Orion 1 mechanics with pet-themed naming conventions where applicable.

**Weapon Categories:**
- **Beam Weapons** - Direct fire, instant hit, damage decreases with range
- **Missiles** - Tracking projectiles, can be intercepted by point defense
- **Torpedoes** - Heavy missiles, cannot be intercepted, fire every 2 turns
- **Bombs** - Planetary bombardment weapons
- **Biological Weapons** - Kill population, special effects
- **Special Weapons** - Unique mechanics

---

## Beam Weapons

Beam weapons fire instantly and cannot be intercepted. Damage is rolled between minimum and maximum. Some beams lose damage at range.

| Weapon | Tech Level | Damage | Range | Space | Cost | Special |
|--------|------------|--------|-------|-------|------|---------|
| Laser | 1 | 1-4 | 1 | 10 | 5 BC | Starting weapon |
| Heavy Lasers | 1 | 1-7 | 2 | 20 | 10 BC | Range 2 variant of Laser |
| Gatling Laser | 6 | 1-4 ×4 | 1 | 20 | 12 BC | 4 attacks per turn |
| Neutron Pellet Gun | 5 | 2-5 | 2 | 15 | 8 BC | Armor-piercing (halves shield class) |
| Ion Cannon | 10 | 3-8 | 2 | 15 | 15 BC | — |
| Mass Driver | 8 | 5-8 | 3 | 20 | 18 BC | Armor-piercing (halves shield class) |
| Neutron Blaster | 13 | 3-12 | 3 | 25 | 25 BC | Kills crew on hit |
| Graviton Beam | 15 | 1-15 | 5 | 20 | 22 BC | Overflow (excess damage hits next ship in stack) |
| Hard Beam | 18 | 8-12 | 4 | 25 | 30 BC | No range penalty; Armor-piercing (halves shield class) |
| Fusion Beam | 20 | 4-16 | 4 | 30 | 35 BC | — |
| Heavy Fusion Beam | 22 | 8-24 | 4 | 45 | 50 BC | — |
| Megabolt Cannon | 25 | 2-20 | 5 | 30 | 38 BC | Chain lightning (hits 4) |
| Phasor | 27 | 5-20 | 6 | 35 | 45 BC | — |
| Heavy Phasor | 30 | 10-40 | 6 | 55 | 70 BC | — |
| Auto-Blaster | 32 | 4-16 ×3 | 4 | 50 | 60 BC | 3 attacks per turn |
| Tachyon Beam | 35 | 1-25 | 7 | 40 | 55 BC | Overflow (excess damage hits next ship in stack) |
| Gauss Autocannon | 37 | 7-10 ×4 | 6 | 60 | 75 BC | 4 attacks per turn; Armor-piercing (halves shield class) |
| Particle Beam | 40 | 10-20 | 6 | 45 | 60 BC | Armor-piercing (halves shield class) |
| Plasma Cannon | 42 | 6-30 | 7 | 50 | 70 BC | Shield damage ×2 |
| Death Ray | 45 | 200-1000 | 8 | 100 | 150 BC | Instant kill small ships |
| Disruptor | 47 | 10-40 | 8 | 60 | 85 BC | — |
| Mauler Device | 50 | 20-100 | 9 | 150 | 200 BC | Always hits (100% acc) |
| Stellar Converter | 55 | 10-35 ×4 | 10 | 200 | 500 BC | Destroys planets |

### Beam Weapon Notes

**Range Penalty:** Most beams lose 10% damage per range bracket beyond optimal.

**Damage Calculation:**
```
Actual_Damage = roll(Min, Max) × (1 - Range_Penalty)
Range_Penalty = max(0, (Distance - Optimal_Range) × 0.10)
```

---

## Missiles

Missiles are tracking projectiles that deal fixed damage. They can be shot down by point defense weapons or affected by ECM jammers.

| Weapon | Tech Level | Damage | Speed | Space | Cost | Racks | Special |
|--------|------------|--------|-------|-------|------|-------|---------|
| Nuclear Missile | 1 | 4 | 2 | 10 | 5 BC | 2 | Starting missile |
| Anti-Missile Rockets | 6 | — | — | 15 | 12 BC | 4 | **Point defense** — destroys 40% of incoming missiles (−1% per missile tech level) |
| Hyper-V Rocket | 4 | 6 | 3.5 | 12 | 8 BC | 2 | — |
| Hyper-X Rocket | 7 | 8 | 4 | 15 | 12 BC | 2 | — |
| Scatter Pack V | 10 | 6 ×5 | 3.5 | 20 | 15 BC | 5 | MIRV warhead (5 MIRVs × 6 dmg each) |
| Merculite Missile | 12 | 10 | 4 | 18 | 18 BC | 2 | — |
| Stinger Missile | 15 | 15 | 4.5 | 20 | 22 BC | 2 | — |
| Scatter Pack VII | 18 | 10 ×7 | 4 | 25 | 25 BC | 7 | MIRV warhead (7 MIRVs × 10 dmg each) |
| Pulson Missile | 21 | 20 | 5 | 25 | 30 BC | 2 | — |
| Hercular Missile | 24 | 25 | 5 | 28 | 35 BC | 2 | — |
| Zeon Missile | 30 | 30 | 6 | 30 | 40 BC | 2 | — |
| Scatter Pack X | 33 | 15 ×10 | 5 | 35 | 45 BC | 10 | MIRV warhead (10 MIRVs × 15 dmg each) |

### Missile Mechanics

**Speed:** Missiles travel this many hexes per combat round.

**Racks:** Each weapon mount holds this many missiles before reloading (reloads between combats).

**Point Defense:** Ships with beam weapons can shoot down incoming missiles:
```
Intercept_Chance = 10% per beam weapon × Beam_Attacks
```

**ECM Effect:** ECM reduces missile hit chance:
```
Missile_Hit_Chance = Base_Accuracy - (ECM_Level × 5%)
```

---

## Torpedoes

Torpedoes are heavy warheads that cannot be intercepted but fire only every 2 turns.

| Weapon | Tech Level | Damage | Speed | Space | Cost | Special |
|--------|------------|--------|-------|-------|------|---------|
| Anti-Matter Torpedo | 25 | 30 | 4 | 40 | 50 BC | Cannot be intercepted |
| Hellfire Torpedo | 35 | 25×4 | 5 | 45 | 55 BC | 4 separate 25-damage attacks per hit (100 total) |
| Proton Torpedo | 42 | 75 | 5 | 50 | 70 BC | Cannot be intercepted |
| Plasma Torpedo | 48 | 150 | 6 | 60 | 100 BC | Cannot be intercepted |

### Torpedo Mechanics

**Fire Rate:** Torpedoes fire on turns 1, 3, 5, etc. (every other turn).

**MOO1 Rules Apply:** Torpedoes follow the same targeting rules as missiles. They ARE subject to ECM and point defense interception. They are **not** auto-hit weapons.

---

## Planetary Bombs

Bombs are used for orbital bombardment. They destroy population, factories, and defenses.

| Weapon | Tech Level | Damage | Space | Cost | Special |
|--------|------------|--------|-------|------|---------|
| Nuclear Bomb | 3 | 3-12 | 25 | 15 BC | Basic bombardment |
| Fusion Bomb | 10 | 5-20 | 35 | 25 BC | — |
| Anti-Matter Bomb | 20 | 10-40 | 50 | 40 BC | — |
| Omega-V Bomb | 30 | 15-60 | 70 | 60 BC | — |
| Neutronium Bomb | 43 | 30-125 | 100 | 100 BC | Maximum destruction |

### Bomb Mechanics

**Damage Distribution:**
```
Population_Killed = Bomb_Damage × 0.5
Factories_Destroyed = Bomb_Damage × 0.3
Defense_Damage = Bomb_Damage × 0.2
```

**Planetary Shield Absorption:**
```
Effective_Damage = Bomb_Damage - Shield_Absorb
```

---

## Biological Weapons

Biological weapons kill population without destroying infrastructure. They have severe diplomatic penalties.

**Note:** Bio weapons are researched in the **Planetology** technology field, not the Weapons field.

| Weapon | Tech Level (Planetology) | Kill Rate | Space | Cost | Max Pop Penalty |
|--------|--------------------------|-----------|-------|------|-----------------|
| Death Spores | 9 | 1M per combat round | 150 | 100 BC | -10% permanent |
| Doom Virus | 25 | 2M per combat round | 200 | 200 BC | -25% permanent |
| Bio Terminator | 33 | 3M per combat round | 250 | 300 BC | -50% permanent |

**Kill Rate Formula:**
```
Population_Killed = Weapon_Kill_Rate × Number_Of_Weapons × Combat_Rounds_Survived
```

**Example:** A ship with 2 Death Spores survives 3 combat rounds:
- 1M × 2 × 3 = 6M population killed

### Biological Weapon Notes

**Diplomatic Penalty:** Using biological weapons causes:
- -100 relations with all races
- Some races will declare war immediately
- Possible galaxy-wide war declarations

**Permanent Damage:** Max population reduction is permanent until planet is re-terraformed.

**Stacking:** Multiple bio weapons on the same ship stack additively (2 Death Spores = 2M per round).

---

## Special Weapons

Unique weapons with special mechanics.

| Weapon | Tech Level | Effect | Space | Cost | Special |
|--------|------------|--------|-------|------|---------|
| Ion Stream Projector | 21 | 20% of target's current HP | 50 | 40 BC | HP-percentage damage (ignores armor class); cannot be used on structures |
| Neutron Stream Projector | 47 | 40% of target's current HP | 60 | 60 BC | Upgraded Ion Stream Projector; HP-percentage damage |
| Energy Pulsar | 28 | Area damage | 70 | 75 BC | 1-6 damage to all ships in hex |
| Black Hole Generator | 50 | Destroys ship | 200 | 250 BC | 25% instant kill chance |
| Gyro Destabilizer | 35 | Removes maneuver | 45 | 50 BC | Target loses evasion |
| Pulse Phasor | 38 | 5-20 ×3 | 55 | 80 BC | Fires Phasor-class beam 3× per turn |
| Tri-Focus Plasma Cannon | 45 | 6-30 ×3 | 80 | 110 BC | Heavy Plasma Cannon, fires 3× per turn |

---

## Ground Combat Weapons

Personal weapons provide bonuses to all ground combat.

| Weapon | Tech Level | Ground Combat Bonus | Notes |
|--------|------------|---------------------|-------|
| Hand Lasers | 5 | +5 | Basic sidearm |
| Gatling Laser Rifle | 12 | +10 | Rapid fire |
| Fusion Rifle | 18 | +15 | High damage |
| Hand Phasor | 27 | +20 | — |
| Plasma Rifle | 38 | +25 | — |
| Mauler Pistol | 50 | +30 | Ultimate personal weapon |

---

## Racial Weapon Modifiers

| Race | Modifier | Effect |
|------|----------|--------|
| Ferrets | +4 Attack Level | Deadly Accuracy ability: +4 to attack rating (hit chance only — no damage bonus). |
| Guinea Pigs | +0% ship, +50% ground | Ground weapons are devastating |
| Budgies | +0% damage | But +50% ship defense (+3 Defense Level), +3 initiative, +20% evasion (Superior Pilots) |
| All others | 0% | No weapon modifier |

**Note:** Ferrets' +30% ship combat bonus in `race-stats-complete.md` translates to the +4 Attack Level bonus shown here (Deadly Accuracy). This increases hit chance only — no weapon damage bonus.

---

## Weapon Mounting Rules

### Weapon Slots by Hull Size (MOO1)

In MOO1, all ships have **4 weapon slots** regardless of hull size. The difference is how much space is available for weapons:

| Hull Size | Weapon Slots | Available Space |
|-----------|--------------|-----------------|
| Small | 4 | ~40 |
| Medium | 4 | ~100 |
| Large | 4 | ~250 |
| Huge | 4 | ~500+ |

Larger hulls can fit more weapons per slot or heavier weapons.

### Heavy Weapons

The following weapons are "Heavy" and have mounting limits:
- Death Ray
- Mauler Device
- Stellar Converter
- Black Hole Generator
- Plasma Torpedo
- All Biological Weapons

---

## JSON Data Schema

```json
{
  "beam_weapons": [
    {
      "id": "laser",
      "name": "Laser",
      "tech_level": 1,
      "damage_min": 1,
      "damage_max": 4,
      "range": 1,
      "space": 10,
      "cost": 5,
      "attacks": 1,
      "special": null
    },
    {
      "id": "gatling_laser",
      "name": "Gatling Laser",
      "tech_level": 6,
      "damage_min": 1,
      "damage_max": 4,
      "range": 1,
      "space": 20,
      "cost": 12,
      "attacks": 4,
      "special": "multi_attack"
    },
    {
      "id": "neutron_pellet_gun",
      "name": "Neutron Pellet Gun",
      "tech_level": 5,
      "damage_min": 2,
      "damage_max": 5,
      "range": 2,
      "space": 15,
      "cost": 8,
      "attacks": 1,
      "special": "armor_piercing"
    },
    {
      "id": "ion_cannon",
      "name": "Ion Cannon",
      "tech_level": 10,
      "damage_min": 3,
      "damage_max": 8,
      "range": 2,
      "space": 15,
      "cost": 15,
      "attacks": 1,
      "special": null
    },
    {
      "id": "mass_driver",
      "name": "Mass Driver",
      "tech_level": 8,
      "damage_min": 5,
      "damage_max": 8,
      "range": 3,
      "space": 20,
      "cost": 18,
      "attacks": 1,
      "special": "armor_piercing"
    },
    {
      "id": "neutron_blaster",
      "name": "Neutron Blaster",
      "tech_level": 13,
      "damage_min": 3,
      "damage_max": 12,
      "range": 3,
      "space": 25,
      "cost": 25,
      "attacks": 1,
      "special": "kills_crew"
    },
    {
      "id": "graviton_beam",
      "name": "Graviton Beam",
      "tech_level": 15,
      "damage_min": 1,
      "damage_max": 15,
      "range": 5,
      "space": 20,
      "cost": 22,
      "attacks": 1,
      "special": "overflow_damage"
    },
    {
      "id": "hard_beam",
      "name": "Hard Beam",
      "tech_level": 18,
      "damage_min": 8,
      "damage_max": 12,
      "range": 4,
      "space": 25,
      "cost": 30,
      "attacks": 1,
      "special": ["no_range_penalty", "armor_piercing"]
    },
    {
      "id": "fusion_beam",
      "name": "Fusion Beam",
      "tech_level": 20,
      "damage_min": 4,
      "damage_max": 16,
      "range": 4,
      "space": 30,
      "cost": 35,
      "attacks": 1,
      "special": null
    },
    {
      "id": "heavy_fusion_beam",
      "name": "Heavy Fusion Beam",
      "tech_level": 22,
      "damage_min": 8,
      "damage_max": 24,
      "range": 4,
      "space": 45,
      "cost": 50,
      "attacks": 1,
      "special": null
    },
    {
      "id": "megabolt_cannon",
      "name": "Megabolt Cannon",
      "tech_level": 25,
      "damage_min": 2,
      "damage_max": 20,
      "range": 5,
      "space": 30,
      "cost": 38,
      "attacks": 1,
      "special": "chain_lightning_4"
    },
    {
      "id": "phasor",
      "name": "Phasor",
      "tech_level": 27,
      "damage_min": 5,
      "damage_max": 20,
      "range": 6,
      "space": 35,
      "cost": 45,
      "attacks": 1,
      "special": null
    },
    {
      "id": "heavy_phasor",
      "name": "Heavy Phasor",
      "tech_level": 30,
      "damage_min": 10,
      "damage_max": 40,
      "range": 6,
      "space": 55,
      "cost": 70,
      "attacks": 1,
      "special": null
    },
    {
      "id": "auto_blaster",
      "name": "Auto-Blaster",
      "tech_level": 32,
      "damage_min": 4,
      "damage_max": 16,
      "range": 4,
      "space": 50,
      "cost": 60,
      "attacks": 3,
      "special": "multi_attack"
    },
    {
      "id": "tachyon_beam",
      "name": "Tachyon Beam",
      "tech_level": 35,
      "damage_min": 1,
      "damage_max": 25,
      "range": 7,
      "space": 40,
      "cost": 55,
      "attacks": 1,
      "special": "overflow_damage"
    },
    {
      "id": "gauss_autocannon",
      "name": "Gauss Autocannon",
      "tech_level": 37,
      "damage_min": 7,
      "damage_max": 10,
      "range": 6,
      "space": 60,
      "cost": 75,
      "attacks": 4,
      "special": ["multi_attack", "armor_piercing"]
    },
    {
      "id": "particle_beam",
      "name": "Particle Beam",
      "tech_level": 40,
      "damage_min": 10,
      "damage_max": 20,
      "range": 6,
      "space": 45,
      "cost": 60,
      "attacks": 1,
      "special": "armor_piercing"
    },
    {
      "id": "plasma_cannon",
      "name": "Plasma Cannon",
      "tech_level": 42,
      "damage_min": 6,
      "damage_max": 30,
      "range": 7,
      "space": 50,
      "cost": 70,
      "attacks": 1,
      "special": "double_shield_damage"
    },
    {
      "id": "death_ray",
      "name": "Death Ray",
      "tech_level": 45,
      "damage_min": 200,
      "damage_max": 1000,
      "range": 8,
      "space": 100,
      "cost": 150,
      "attacks": 1,
      "special": "instant_kill_small",
      "heavy": true
    },
    {
      "id": "disruptor",
      "name": "Disruptor",
      "tech_level": 47,
      "damage_min": 10,
      "damage_max": 40,
      "range": 8,
      "space": 60,
      "cost": 85,
      "attacks": 1,
      "special": null
    },
    {
      "id": "mauler_device",
      "name": "Mauler Device",
      "tech_level": 50,
      "damage_min": 20,
      "damage_max": 100,
      "range": 9,
      "space": 150,
      "cost": 200,
      "attacks": 1,
      "special": "always_hits",
      "heavy": true
    },
    {
      "id": "stellar_converter",
      "name": "Stellar Converter",
      "tech_level": 55,
      "damage_min": 10,
      "damage_max": 35,
      "range": 10,
      "space": 200,
      "cost": 500,
      "attacks": 4,
      "special": "destroys_planets",
      "heavy": true
    }
  ],

  "missiles": [
    {
      "id": "nuclear_missile",
      "name": "Nuclear Missile",
      "tech_level": 1,
      "damage": 4,
      "speed": 2,
      "space": 10,
      "cost": 5,
      "rack_size": 2,
      "special": null
    },
    {
      "id": "hyper_v_rocket",
      "name": "Hyper-V Rocket",
      "tech_level": 4,
      "damage": 6,
      "speed": 3.5,
      "space": 12,
      "cost": 8,
      "rack_size": 2,
      "special": null
    },
    {
      "id": "hyper_x_rocket",
      "name": "Hyper-X Rocket",
      "tech_level": 7,
      "damage": 8,
      "speed": 4,
      "space": 15,
      "cost": 12,
      "rack_size": 2,
      "special": null
    },
    {
      "id": "scatter_pack_v",
      "name": "Scatter Pack V",
      "tech_level": 10,
      "damage": 6,
      "speed": 3.5,
      "space": 20,
      "cost": 15,
      "rack_size": 5,
      "mirv_count": 5,
      "special": "mirv_5"
    },
    {
      "id": "merculite_missile",
      "name": "Merculite Missile",
      "tech_level": 12,
      "damage": 10,
      "speed": 4,
      "space": 18,
      "cost": 18,
      "rack_size": 2,
      "special": null
    },
    {
      "id": "stinger_missile",
      "name": "Stinger Missile",
      "tech_level": 15,
      "damage": 15,
      "speed": 4.5,
      "space": 20,
      "cost": 22,
      "rack_size": 2,
      "special": null
    },
    {
      "id": "scatter_pack_vii",
      "name": "Scatter Pack VII",
      "tech_level": 18,
      "damage": 10,
      "speed": 4,
      "space": 25,
      "cost": 25,
      "rack_size": 7,
      "mirv_count": 7,
      "special": "mirv_7"
    },
    {
      "id": "pulson_missile",
      "name": "Pulson Missile",
      "tech_level": 21,
      "damage": 20,
      "speed": 5,
      "space": 25,
      "cost": 30,
      "rack_size": 2,
      "special": null
    },
    {
      "id": "hercular_missile",
      "name": "Hercular Missile",
      "tech_level": 24,
      "damage": 25,
      "speed": 5,
      "space": 28,
      "cost": 35,
      "rack_size": 2,
      "special": null
    },
    {
      "id": "zeon_missile",
      "name": "Zeon Missile",
      "tech_level": 30,
      "damage": 30,
      "speed": 6,
      "space": 30,
      "cost": 40,
      "rack_size": 2,
      "special": null
    },
    {
      "id": "scatter_pack_x",
      "name": "Scatter Pack X",
      "tech_level": 33,
      "damage": 15,
      "speed": 5,
      "space": 35,
      "cost": 45,
      "rack_size": 10,
      "mirv_count": 10,
      "special": "mirv_10"
    }
  ],

  "torpedoes": [
    {
      "id": "anti_matter_torpedo",
      "name": "Anti-Matter Torpedo",
      "tech_level": 25,
      "damage": 30,
      "speed": 4,
      "space": 40,
      "cost": 50,
      "fire_rate": 2,
      "special": "no_intercept"
    },
    {
      "id": "hellfire_torpedo",
      "name": "Hellfire Torpedo",
      "tech_level": 35,
      "damage_min": 25,
      "damage_max": 25,
      "attacks": 4,
      "speed": 5,
      "space": 45,
      "cost": 55,
      "fire_rate": 2,
      "special": "hellfire_multi_hit",
      "note": "MOO1: fires 4 separate 25-damage attacks per hit (100 damage total). Each attack resolved independently through shields."
    },
    {
      "id": "proton_torpedo",
      "name": "Proton Torpedo",
      "tech_level": 42,
      "damage": 75,
      "speed": 5,
      "space": 50,
      "cost": 70,
      "fire_rate": 2,
      "special": "no_intercept"
    },
    {
      "id": "plasma_torpedo",
      "name": "Plasma Torpedo",
      "tech_level": 48,
      "damage": 150,
      "speed": 6,
      "space": 60,
      "cost": 100,
      "fire_rate": 2,
      "special": "no_intercept",
      "heavy": true
    }
  ],

  "bombs": [
    {
      "id": "nuclear_bomb",
      "name": "Nuclear Bomb",
      "tech_level": 3,
      "damage_min": 3,
      "damage_max": 12,
      "space": 25,
      "cost": 15
    },
    {
      "id": "fusion_bomb",
      "name": "Fusion Bomb",
      "tech_level": 10,
      "damage_min": 5,
      "damage_max": 20,
      "space": 35,
      "cost": 25
    },
    {
      "id": "anti_matter_bomb",
      "name": "Anti-Matter Bomb",
      "tech_level": 20,
      "damage_min": 10,
      "damage_max": 40,
      "space": 50,
      "cost": 40
    },
    {
      "id": "omega_v_bomb",
      "name": "Omega-V Bomb",
      "tech_level": 30,
      "damage_min": 15,
      "damage_max": 60,
      "space": 70,
      "cost": 60
    },
    {
      "id": "neutronium_bomb",
      "name": "Neutronium Bomb",
      "tech_level": 43,
      "damage_min": 30,
      "damage_max": 125,
      "space": 100,
      "cost": 100
    }
  ],

  "biological_weapons": [
    {
      "id": "death_spores",
      "name": "Death Spores",
      "tech_level": 9,
      "tech_field": "planetology",
      "pop_kill_per_round": 1,
      "max_pop_reduction": 0.10,
      "space": 150,
      "cost": 100,
      "heavy": true
    },
    {
      "id": "doom_virus",
      "name": "Doom Virus",
      "tech_level": 25,
      "tech_field": "planetology",
      "canonical_source": "planetology.md",
      "pop_kill_per_round": 2,
      "max_pop_reduction": 0.25,
      "space": 200,
      "cost": 200,
      "heavy": true
    },
    {
      "id": "bio_terminator",
      "name": "Bio Terminator",
      "tech_level": 33,
      "tech_field": "planetology",
      "canonical_source": "planetology.md",
      "pop_kill_per_round": 3,
      "max_pop_reduction": 0.50,
      "space": 250,
      "cost": 300,
      "heavy": true
    }
  ],

  "special_weapons": [
    {
      "id": "ion_stream_projector",
      "name": "Ion Stream Projector",
      "tech_level": 21,
      "effect": "hp_percent_damage",
      "damage_percent_current_hp": 20,
      "space": 50,
      "cost": 40
    },
    {
      "id": "neutron_stream_projector",
      "name": "Neutron Stream Projector",
      "tech_level": 47,
      "effect": "hp_percent_damage",
      "damage_percent_current_hp": 40,
      "space": 60,
      "cost": 60
    },
    {
      "id": "energy_pulsar",
      "name": "Energy Pulsar",
      "tech_level": 28,
      "effect": "area_damage",
      "damage_min": 1,
      "damage_max": 6,
      "space": 70,
      "cost": 75
    },
    {
      "id": "black_hole_generator",
      "name": "Black Hole Generator",
      "tech_level": 50,
      "effect": "instant_kill",
      "kill_chance": 0.25,
      "space": 200,
      "cost": 250,
      "heavy": true
    },
    {
      "id": "gyro_destabilizer",
      "name": "Gyro Destabilizer",
      "tech_level": 35,
      "effect": "remove_evasion",
      "space": 45,
      "cost": 50
    }
  ],

  "ground_weapons": [
    {
      "id": "hand_lasers",
      "name": "Hand Lasers",
      "tech_level": 5,
      "ground_combat_bonus": 5
    },
    {
      "id": "gatling_laser_rifle",
      "name": "Gatling Laser Rifle",
      "tech_level": 12,
      "ground_combat_bonus": 10
    },
    {
      "id": "fusion_rifle",
      "name": "Fusion Rifle",
      "tech_level": 18,
      "ground_combat_bonus": 15
    },
    {
      "id": "hand_phasor",
      "name": "Hand Phasor",
      "tech_level": 27,
      "ground_combat_bonus": 20
    },
    {
      "id": "plasma_rifle",
      "name": "Plasma Rifle",
      "tech_level": 38,
      "ground_combat_bonus": 25
    },
    {
      "id": "mauler_pistol",
      "name": "Mauler Pistol",
      "tech_level": 50,
      "ground_combat_bonus": 30
    }
  ],

  "racial_weapon_modifiers": {
    "ferrets": { "ship_damage": 1.00, "ground_damage": 1.00 },
    "guinea_pigs": { "ship_damage": 1.00, "ground_damage": 1.50 },
    "budgies": { "ship_damage": 1.00, "ground_damage": 1.00 },
    "hamsters": { "ship_damage": 1.00, "ground_damage": 1.00 },
    "ants": { "ship_damage": 1.00, "ground_damage": 1.00 },
    "mice": { "ship_damage": 1.00, "ground_damage": 1.00 },
    "rats": { "ship_damage": 1.00, "ground_damage": 1.00 },
    "rabbits": { "ship_damage": 1.00, "ground_damage": 1.00 },
    "chameleons": { "ship_damage": 1.00, "ground_damage": 1.00 },
    "hermit_crabs": { "ship_damage": 1.00, "ground_damage": 1.00 }
  }
}
```

---

## Weapon Special Effects Reference

| Special | Effect |
|---------|--------|
| `multi_attack` | Fires multiple times per turn |
| `armor_piercing` | **MOO1**: Halves defender's shield class (round down) for this hit only. Does NOT multiply hull damage. Applies to: Neutron Pellet Gun, Mass Driver, Hard Beam, Gauss Autocannon, Particle Beam. |
| `overflow_damage` | **MOO1**: Excess damage beyond what kills a ship carries over to the next ship of the same design in the stack. Used by: Graviton Beam, Tachyon Beam. |
| `hellfire_multi_hit` | **MOO1**: Fires 4 separate 25-damage attacks per hit (100 total). Each attack resolved independently through shields. Used by: Hellfire Torpedo. |
| `kills_crew` | Each hit kills 1% of crew |
| `no_range_penalty` | Full damage at all ranges |
| `chain_lightning_4` | Damage spreads to up to 4 adjacent ships |
| `double_shield_damage` | Does 2× damage to shields (non-MOO1 enhancement) |
| `instant_kill_small` | 100% kill vs Small hull ships |
| `always_hits` | 100% accuracy, ignores ECM |
| `destroys_planets` | Can destroy entire planets |
| `mirv_5` | Single launch, 5 separate warheads (Scatter Pack V) |
| `mirv_7` | Single launch, 7 separate warheads (Scatter Pack VII) |
| `mirv_10` | Single launch, 10 separate warheads (Scatter Pack X) |
| `no_intercept` | Cannot be shot down |
| `disable_engines` | Target speed becomes 0 |
| `crew_damage` | Kills X% crew per hit |
| `area_damage` | Damages all ships in hex |
| `instant_kill` | X% chance to destroy target |
| `remove_evasion` | Target loses all evasion bonuses |

---

## Related Documents

- `components-complete.md` - Defensive systems and engines
- `combat-algorithm.md` - How damage is resolved
- `ship-design.md` - Mounting weapons on ships
- `../technology/weapons.md` - Weapons tech tree

---

*Last Updated: 2026-03-21*
*Specification: spec-006 - Complete Weapons Table*
