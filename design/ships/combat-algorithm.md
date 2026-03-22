# Combat Damage Resolution Algorithm

## Overview

This document specifies the complete combat resolution algorithm for Hamster of Orion space battles. All mechanics are faithful to Master of Orion 1 with precise formulas for implementation.

**Combat System Goals:**
- Turn-based tactical combat on hex grid
- Initiative-based action order
- Shields → Armor → Hull damage sequence
- Support for all weapon types and special systems
- Player or AI control options

---

## Combat Initialization

### 1. Battle Setup

When combat is triggered:

```pseudocode
function initiate_combat(attacker_fleet, defender_fleet, location):
    # Create combat instance
    combat = {
        grid: create_hex_grid(calculate_grid_size(attacker_fleet, defender_fleet)),
        attacker_ships: [],
        defender_ships: [],
        round: 0,
        phase: "setup",
        missiles_in_flight: [],
        status: "active"
    }
    
    # Initialize ships
    for ship in attacker_fleet:
        combat_ship = create_combat_ship(ship, "attacker")
        place_ship(combat_ship, combat.grid, "attacker_zone")
        combat.attacker_ships.append(combat_ship)
    
    for ship in defender_fleet:
        combat_ship = create_combat_ship(ship, "defender")
        place_ship(combat_ship, combat.grid, "defender_zone")
        combat.defender_ships.append(combat_ship)
    
    return combat
```

### 2. Combat Ship State

Each ship tracks:

```json
{
  "id": "ship_001",
  "design": "Destroyer-Class",
  "side": "attacker",
  "position": {"x": 5, "y": 3},
  "current_hp": 60,
  "max_hp": 60,
  "shields_current": 30,
  "shields_max": 30,
  "weapons": [...],
  "weapon_cooldowns": {},
  "missile_ammo": {},
  "special_systems": [...],
  "status_effects": [],
  "has_acted": false,
  "can_retreat": true,
  "experience_level": "regular",
  "cloaked": false
}
```

---

## Turn Structure

### 3. Combat Round Phases

Each combat round consists of:

```
1. INITIATIVE PHASE
   - Calculate initiative for all ships
   - Sort ships by initiative (highest first)

2. ACTION PHASE (for each ship in initiative order)
   - Movement (optional)
   - Fire weapons (optional)
   - Use special systems (optional)

3. MISSILE PHASE
   - Move all missiles in flight
   - Check for missile impacts
   - Check for point defense intercepts

4. END PHASE
   - Apply damage over time effects
   - Regenerate shields (if applicable)
   - Check victory/defeat conditions
   - Increment round counter
```

---

## Initiative System

### 4. Initiative Calculation

```
Ship_Initiative = Base_Initiative + Engine_Bonus + Computer_Bonus + Racial_Bonus + Experience_Bonus + Random

Where:
  Base_Initiative = 10
  Engine_Bonus = Engine_Maneuver_Rating × 2
  Computer_Bonus = Battle_Scanner_Bonus (if equipped: +3)
  Racial_Bonus = Race-specific (Budgies: +3)
  Experience_Bonus = -1 (Rookie), 0 (Regular), +1 (Veteran), +2 (Elite)
  Random = roll(1, 6)
```

### 5. Initiative Order

```pseudocode
function calculate_initiative_order(combat):
    all_ships = combat.attacker_ships + combat.defender_ships
    
    for ship in all_ships:
        if ship.current_hp > 0 and not ship.is_disabled:
            ship.initiative = calculate_initiative(ship)
    
    # Sort descending (highest initiative acts first)
    sorted_ships = sort(all_ships, key=initiative, descending=True)
    
    # Ties broken by: 1) Higher maneuver, 2) Smaller ship, 3) Random
    return sorted_ships
```

---

## Movement

### 6. Movement Mechanics

```
Movement_Points = Combat_Speed + Maneuver_Bonus

Combat_Speed = Engine_Combat_Speed (1-8 based on engine)
Maneuver_Bonus = 0 (can be modified by specials)
```

Each hex moved costs 1 movement point. Ships can move in any of 6 hex directions.

### 7. Movement Restrictions

```pseudocode
function get_valid_moves(ship, combat):
    valid_hexes = []
    movement_remaining = ship.combat_speed
    
    for hex in get_hexes_in_range(ship.position, movement_remaining):
        if hex_is_empty(hex, combat) or hex == ship.position:
            path = find_path(ship.position, hex, combat)
            if path and len(path) <= movement_remaining:
                valid_hexes.append(hex)
    
    return valid_hexes
```

---

## Attack Resolution

### 8. Beam Weapon Attack

```pseudocode
function resolve_beam_attack(attacker, weapon, target, combat):
    # Calculate hit chance
    hit_chance = calculate_hit_chance(attacker, weapon, target)
    
    # Roll for hit
    roll = random(1, 100)
    
    if roll <= hit_chance:
        # Calculate damage
        base_damage = roll_damage(weapon.damage_min, weapon.damage_max)
        
        # Apply range penalty
        distance = hex_distance(attacker.position, target.position)
        if not weapon.has_special("no_range_penalty"):
            range_penalty = max(0, (distance - weapon.optimal_range) * 0.10)
            base_damage = base_damage * (1 - range_penalty)
        
        # Apply racial damage bonus (Ferrets: +25%)
        racial_modifier = get_racial_damage_modifier(attacker.race)
        final_damage = floor(base_damage * racial_modifier)
        
        # Apply damage to target
        apply_damage(target, final_damage, weapon)
        
        return {hit: true, damage: final_damage}
    else:
        return {hit: false, damage: 0}
```

### 9. Hit Chance Formula

```
Hit_Chance = Base_Accuracy + Attack_Modifiers - Defense_Modifiers

Where:
  Base_Accuracy = 50%
  
  Attack_Modifiers:
    + (Battle_Computer_Rating × 5%)
    + Experience_Bonus (Rookie: -5%, Regular: 0%, Veteran: +5%, Elite: +10%)
    + Point_Blank_Bonus (1 hex: +10%)
    + Size_Target_Bonus (per size class above Scout: +5%)
  
  Defense_Modifiers:
    + (Target_Maneuver × 3%)
    + (Inertial_Stabilizer_Bonus: +2 or +4)
    + (Displacement_Device: +10%)
    + (Cloaking_Bonus: +5)
    + Range_Penalty (Medium: +5%, Long: +10%, Very Long: +20%)
```

### 10. Hit Chance Calculation

```pseudocode
function calculate_hit_chance(attacker, weapon, target):
    # Base accuracy
    hit_chance = 50
    
    # Attack modifiers
    hit_chance += attacker.battle_computer_rating * 5
    hit_chance += get_experience_accuracy_bonus(attacker.experience_level)
    
    # Range modifiers
    distance = hex_distance(attacker.position, target.position)
    if distance == 1:
        hit_chance += 10  # Point blank
    elif distance >= 5 and distance <= 8:
        hit_chance -= 5   # Medium range
    elif distance >= 9 and distance <= 15:
        hit_chance -= 10  # Long range
    elif distance > 15:
        hit_chance -= 20  # Very long range
    
    # Size modifier (larger targets easier to hit)
    size_diff = target.size_class - 1  # Scout = 1
    hit_chance += size_diff * 5
    
    # Defense modifiers
    hit_chance -= target.maneuver_rating * 3
    hit_chance -= target.defense_bonus  # From specials
    
    # Cloaking
    if target.cloaked:
        hit_chance -= 20
    
    # Mauler Device always hits
    if weapon.has_special("always_hits"):
        hit_chance = 100
    
    # Clamp to valid range
    return clamp(hit_chance, 5, 95)  # Always 5% miss/hit chance
```

---

## Damage Application

### 11. Damage Sequence

Damage is applied in this order:
1. **Shields** absorb damage first
2. **Armor/Hull** takes remaining damage
3. **Special effects** trigger (crew kill, system damage, etc.)

```pseudocode
function apply_damage(target, damage, weapon):
    remaining_damage = damage
    
    # Step 1: Shield absorption
    if target.shields_current > 0:
        shield_absorb = min(target.shield_class, remaining_damage)
        remaining_damage -= shield_absorb
        
        # Some weapons do extra shield damage
        if weapon.has_special("double_shield_damage"):
            target.shields_current -= shield_absorb * 2
        else:
            target.shields_current -= shield_absorb
        
        target.shields_current = max(0, target.shields_current)
    
    # Step 2: Armor/Hull damage
    if remaining_damage > 0:
        # Check for armor piercing
        if weapon.has_special("armor_piercing"):
            remaining_damage = floor(remaining_damage * 1.5)
        
        target.current_hp -= remaining_damage
    
    # Step 3: Check for destruction
    if target.current_hp <= 0:
        destroy_ship(target)
        return
    
    # Step 4: Apply weapon special effects
    apply_weapon_effects(target, weapon, damage)
```

### 12. Shield Mechanics

Shields absorb a fixed amount of damage **per hit**:

```
Damage_After_Shields = max(0, Weapon_Damage - Shield_Class)
```

| Shield | Absorbs per Hit |
|--------|-----------------|
| Class I | 1 |
| Class V | 5 |
| Class X | 10 |
| Class XV | 15 |

**Example:** A weapon dealing 8 damage against Class III shields:
- Shield absorbs: 3
- Hull takes: 8 - 3 = 5 damage

### 13. Armor and HP

Ship HP is determined by:

```
Ship_HP = Base_HP × Armor_Multiplier

Base_HP by Class:
  Scout: 5
  Fighter: 10
  Destroyer: 25
  Cruiser: 60
  Battle Cruiser: 120
  Dreadnought: 200
  Titan: 400

Armor_Multiplier:
  Titanium: 1.0×
  Duralloy: 1.5×
  Zortrium: 2.0×
  Andrium: 2.5×
  Tritanium: 3.0×
  Adamantium: 3.5×
  Neutronium: 4.0×
```

**Example:** A Cruiser with Zortrium armor has 60 × 2.0 = 120 HP.

---

## Critical Hits

### 14. Critical Hit System

```
Critical_Chance = 5% base
Critical_Chance += 5% if attacker is Elite
Critical_Chance += 10% if weapon is Death Ray
```

When a critical hit occurs:

```pseudocode
function apply_critical_hit(target, damage, weapon):
    # Double damage
    critical_damage = damage * 2
    
    # Roll for system damage (50% chance)
    if random(1, 100) <= 50:
        damaged_system = select_random_system(target)
        disable_system(target, damaged_system)
        log_critical("System Damaged: " + damaged_system.name)
    
    return critical_damage
```

### 15. System Damage Effects

| System Disabled | Effect |
|-----------------|--------|
| Engine | Speed reduced to 1 |
| Weapons (random) | That weapon cannot fire |
| Computer | Attack rating reduced by half |
| Shields | Shields do not regenerate |
| Special System | That system disabled |

---

## Missile Combat

### 16. Missile Launch

```pseudocode
function launch_missile(attacker, weapon, target, combat):
    if attacker.missile_ammo[weapon.id] <= 0:
        return false  # Out of ammo
    
    missile = {
        id: generate_id(),
        source: attacker,
        target: target,
        weapon: weapon,
        position: attacker.position,
        speed: weapon.missile_speed,
        damage: weapon.damage,
        remaining_fuel: 20  # Turns before missile expires
    }
    
    combat.missiles_in_flight.append(missile)
    attacker.missile_ammo[weapon.id] -= 1
    
    return true
```

### 17. Missile Movement Phase

```pseudocode
function process_missiles(combat):
    for missile in combat.missiles_in_flight:
        # Move missile toward target
        direction = get_direction(missile.position, missile.target.position)
        
        for i in range(missile.speed):
            missile.position = move_hex(missile.position, direction)
            
            # Check if reached target
            if missile.position == missile.target.position:
                resolve_missile_impact(missile, combat)
                combat.missiles_in_flight.remove(missile)
                break
        
        # Check for fuel expiration
        missile.remaining_fuel -= 1
        if missile.remaining_fuel <= 0:
            combat.missiles_in_flight.remove(missile)
```

### 18. Point Defense

Ships can intercept incoming missiles with beam weapons:

```pseudocode
function attempt_point_defense(target, missile, combat):
    # Calculate intercept chance
    intercept_chance = 0
    
    for weapon in target.weapons:
        if weapon.type == "beam" and not weapon.on_cooldown:
            intercept_chance += 10 * weapon.attacks_per_turn
    
    # ECM does not help against point defense
    # But target's own ECM doesn't help either
    
    # Roll for intercept
    if random(1, 100) <= intercept_chance:
        return true  # Missile destroyed
    
    return false  # Missile hits
```

### 19. Missile Impact

```pseudocode
function resolve_missile_impact(missile, combat):
    target = missile.target
    
    # Check if target still exists
    if target.current_hp <= 0:
        return  # Target already destroyed
    
    # Attempt point defense
    if attempt_point_defense(target, missile, combat):
        log_combat("Missile intercepted by point defense")
        return
    
    # Calculate hit chance (missiles are easier to dodge than beams)
    hit_chance = 80 - (target.ecm_rating * 5) - (target.maneuver_rating * 2)
    hit_chance = clamp(hit_chance, 10, 95)
    
    if random(1, 100) <= hit_chance:
        # Missile hits
        apply_damage(target, missile.damage, missile.weapon)
        log_combat("Missile hit for " + missile.damage + " damage")
    else:
        log_combat("Missile missed")
```

---

## Torpedo Combat

### 20. Torpedo Mechanics

Torpedoes are special:
- Cannot be intercepted by point defense
- Cannot be affected by ECM
- Fire every 2 turns (cooldown)
- Always hit (100% accuracy after tracking)

```pseudocode
function fire_torpedo(attacker, weapon, target, combat):
    # Check cooldown
    if attacker.weapon_cooldowns[weapon.id] > 0:
        return false
    
    # Torpedoes auto-hit but travel slowly
    torpedo = {
        source: attacker,
        target: target,
        weapon: weapon,
        position: attacker.position,
        speed: weapon.torpedo_speed,
        damage: weapon.damage
    }
    
    combat.missiles_in_flight.append(torpedo)
    
    # Set cooldown (fires every 2 turns)
    attacker.weapon_cooldowns[weapon.id] = 2
    
    return true

function resolve_torpedo_impact(torpedo, combat):
    # Torpedoes always hit - no intercept, no ECM
    apply_damage(torpedo.target, torpedo.damage, torpedo.weapon)
```

---

## Special Weapon Effects

### 21. Weapon Special Effects Table

| Effect | Implementation |
|--------|----------------|
| `multi_attack` | Fire N times, each attack resolved separately |
| `armor_piercing` | Damage to hull ×1.5 |
| `halves_shields` | Target's shield absorption halved for this hit |
| `ignores_half_shields` | 50% of damage bypasses shields |
| `kills_crew` | Each hit kills 1% of crew (reduces combat effectiveness) |
| `stream` | Damage continues each round while target is held |
| `no_range_penalty` | No damage reduction at range |
| `chain_lightning` | After hitting primary, hits up to 3 adjacent enemies |
| `double_shield_damage` | Shield takes 2× damage |
| `instant_kill_small` | 100% kill vs Scout/Fighter class |
| `always_hits` | 100% accuracy, ignores all defense |
| `destroys_planets` | Can be used in bombardment phase |

### 22. Multi-Attack Weapons

```pseudocode
function resolve_multi_attack(attacker, weapon, target, combat):
    total_damage = 0
    hits = 0
    
    for i in range(weapon.attacks_per_turn):
        result = resolve_beam_attack(attacker, weapon, target, combat)
        if result.hit:
            hits += 1
            total_damage += result.damage
        
        # Check if target destroyed
        if target.current_hp <= 0:
            break
    
    return {hits: hits, total_damage: total_damage}
```

---

## Special Systems in Combat

### 23. Cloaking

```pseudocode
function process_cloak(ship, combat):
    if ship.has_system("cloaking_device"):
        if not ship.has_fired_this_turn:
            ship.cloaked = true
            ship.defense_bonus += 5
        else:
            # Firing decloaks (unless perfect cloaking)
            if not ship.has_system("perfect_cloaking"):
                ship.cloaked = false
```

### 24. Repair Systems

```pseudocode
function process_repair(ship):
    if ship.has_system("automated_repair"):
        repair_amount = floor(ship.max_hp * 0.15)
        ship.current_hp = min(ship.max_hp, ship.current_hp + repair_amount)
    
    if ship.has_system("advanced_damage_control"):
        repair_amount = floor(ship.max_hp * 0.30)
        ship.current_hp = min(ship.max_hp, ship.current_hp + repair_amount)
```

### 25. Stasis Field

```pseudocode
function use_stasis_field(attacker, target, combat):
    if attacker.stasis_field_used:
        return false  # Once per battle
    
    # Stasis disables target for 2 turns
    target.status_effects.append({
        type: "stasis",
        duration: 2,
        effect: "cannot_act"
    })
    
    attacker.stasis_field_used = true
    return true
```

### 26. Sub-Space Teleporter

```pseudocode
function use_teleporter(ship, destination_hex, combat):
    if ship.teleporter_used_this_turn:
        return false
    
    if hex_is_valid(destination_hex, combat):
        ship.position = destination_hex
        ship.teleporter_used_this_turn = true
        return true
    
    return false
```

### 27. Displacement Device

```pseudocode
function check_displacement(target, damage):
    if target.has_system("displacement_device"):
        # 33% chance to completely avoid hit
        if random(1, 100) <= 33:
            log_combat("Displacement device activated - attack missed!")
            return 0  # No damage
    
    return damage  # Normal damage
```

---

## Retreat Mechanics

### 28. Retreat Attempt

```pseudocode
function attempt_retreat(ship, combat):
    # Calculate retreat chance
    own_speed = ship.combat_speed
    
    # Find fastest enemy ship
    enemies = get_enemy_ships(ship.side, combat)
    enemy_max_speed = max(enemy.combat_speed for enemy in enemies)
    
    retreat_chance = (own_speed / max(enemy_max_speed, 1)) * 50 + 25
    
    # Racial bonus
    if ship.race == "budgies":
        retreat_chance += 20
    
    # Warp Dissipator prevents retreat
    for enemy in enemies:
        if enemy.has_system("warp_dissipator"):
            retreat_chance = 0
            break
    
    retreat_chance = clamp(retreat_chance, 0, 95)
    
    # Roll for retreat
    if random(1, 100) <= retreat_chance:
        ship.retreated = true
        remove_from_combat(ship, combat)
        return true
    else:
        ship.retreat_failed = true  # Cannot try again this turn
        return false
```

### 29. Fleet Retreat

```pseudocode
function attempt_fleet_retreat(side, combat):
    ships = get_ships_by_side(side, combat)
    retreated = []
    trapped = []
    
    for ship in ships:
        if ship.can_retreat and not ship.retreat_failed:
            if attempt_retreat(ship, combat):
                retreated.append(ship)
            else:
                trapped.append(ship)
    
    return {retreated: retreated, trapped: trapped}
```

---

## Victory Conditions

### 30. Combat Resolution

```pseudocode
function check_combat_end(combat):
    attacker_ships = [s for s in combat.attacker_ships if s.current_hp > 0 and not s.retreated]
    defender_ships = [s for s in combat.defender_ships if s.current_hp > 0 and not s.retreated]
    
    if len(defender_ships) == 0:
        if len(attacker_ships) > 0:
            return {result: "attacker_victory", survivors: attacker_ships}
        else:
            return {result: "mutual_destruction", survivors: []}
    
    if len(attacker_ships) == 0:
        return {result: "defender_victory", survivors: defender_ships}
    
    return {result: "ongoing", survivors: None}
```

---

## Experience System

### 31. Experience Gain

```pseudocode
function award_experience(combat):
    for ship in combat.attacker_ships + combat.defender_ships:
        if ship.current_hp > 0:
            ship.battles_survived += 1
            
            # Experience thresholds
            if ship.battles_survived >= 10:
                ship.experience_level = "elite"
            elif ship.battles_survived >= 3:
                ship.experience_level = "veteran"
            else:
                ship.experience_level = "regular"
```

### 32. Experience Effects

| Level | Battles | Accuracy | Damage | Notes |
|-------|---------|----------|--------|-------|
| Rookie | 0 | -5% | -0% | New ships |
| Regular | 1+ | +0% | +0% | Baseline |
| Veteran | 3+ | +5% | +5% | — |
| Elite | 10+ | +10% | +10% | — |

**Racial Bonuses:**
- Budgies: Start as Veteran
- Ferrets: Gain experience 2× faster

---

## Combat AI

### 33. AI Target Selection

```pseudocode
function ai_select_target(ship, combat):
    enemies = get_enemy_ships(ship.side, combat)
    
    # Score each target
    target_scores = []
    for enemy in enemies:
        score = 0
        
        # Prioritize damaged ships (easier kills)
        damage_percent = 1 - (enemy.current_hp / enemy.max_hp)
        score += damage_percent * 30
        
        # Prioritize threats
        threat = calculate_threat(enemy)
        score += threat * 20
        
        # Prioritize bombers (if defending planet)
        if enemy.has_bombs and combat.has_planet:
            score += 50
        
        # Penalize cloaked ships
        if enemy.cloaked:
            score -= 30
        
        # Penalize distant ships
        distance = hex_distance(ship.position, enemy.position)
        score -= distance * 2
        
        target_scores.append({enemy: enemy, score: score})
    
    # Select highest scoring target
    target_scores.sort(key=score, descending=True)
    return target_scores[0].enemy
```

### 34. AI Movement

```pseudocode
function ai_move(ship, target, combat):
    # Calculate optimal range for weapons
    optimal_range = get_optimal_weapon_range(ship)
    current_range = hex_distance(ship.position, target.position)
    
    if current_range > optimal_range:
        # Move closer
        move_toward(ship, target.position, combat)
    elif current_range < optimal_range and ship.prefers_range:
        # Move away (hit and run)
        move_away(ship, target.position, combat)
    # else: stay in place
```

---

## Planetary Bombardment

### 35. Bombardment Phase

After space combat is won (or if no defending ships):

```pseudocode
function bombardment_phase(fleet, planet):
    for ship in fleet:
        for weapon in ship.weapons:
            if weapon.type == "bomb":
                resolve_bombardment(ship, weapon, planet)
            if weapon.type == "biological":
                resolve_bio_attack(ship, weapon, planet)

function resolve_bombardment(ship, bomb, planet):
    # Roll damage
    damage = roll(bomb.damage_min, bomb.damage_max)
    
    # Reduce by planetary shield
    damage = max(0, damage - planet.shield_class)
    
    # Apply damage
    population_killed = floor(damage * 0.5)
    factories_destroyed = floor(damage * 0.3)
    defense_damage = floor(damage * 0.2)
    
    planet.population -= population_killed
    planet.factories -= factories_destroyed
    planet.missile_bases -= floor(defense_damage / 10)
```

---

## JSON Schema: Combat State

```json
{
  "combat_state": {
    "round": 1,
    "phase": "action",
    "current_ship_index": 3,
    "attacker": {
      "empire_id": "hamsters",
      "ships": [
        {
          "id": "ship_001",
          "design_id": "destroyer_mk2",
          "current_hp": 45,
          "max_hp": 60,
          "shields_current": 20,
          "shields_max": 30,
          "position": {"x": 5, "y": 3},
          "has_acted": false,
          "status_effects": []
        }
      ]
    },
    "defender": {
      "empire_id": "ferrets",
      "ships": []
    },
    "missiles_in_flight": [
      {
        "id": "missile_001",
        "source_ship_id": "ship_001",
        "target_ship_id": "ship_010",
        "weapon_id": "merculite_missile",
        "position": {"x": 8, "y": 5},
        "damage": 10
      }
    ],
    "combat_log": [
      "Round 1: Destroyer fires Fusion Beam at Cruiser, hits for 12 damage",
      "Round 1: Cruiser launches Merculite Missiles at Destroyer"
    ]
  }
}
```

---

## Summary: Complete Combat Flow

```pseudocode
function run_combat(attacker_fleet, defender_fleet, location):
    combat = initiate_combat(attacker_fleet, defender_fleet, location)
    
    while combat.status == "active":
        combat.round += 1
        
        # 1. Initiative Phase
        ship_order = calculate_initiative_order(combat)
        
        # 2. Action Phase
        for ship in ship_order:
            if ship.current_hp > 0 and not ship.retreated:
                # Check status effects (stasis, etc.)
                if not can_act(ship):
                    continue
                
                # Get action (AI or player)
                action = get_ship_action(ship, combat)
                
                # Execute action
                if action.type == "move":
                    execute_move(ship, action.destination, combat)
                if action.type == "attack":
                    execute_attack(ship, action.target, action.weapon, combat)
                if action.type == "special":
                    execute_special(ship, action.system, action.target, combat)
                if action.type == "retreat":
                    attempt_retreat(ship, combat)
                
                ship.has_acted = true
        
        # 3. Missile Phase
        process_missiles(combat)
        
        # 4. End Phase
        for ship in get_all_ships(combat):
            process_repair(ship)
            process_status_effects(ship)
            decrement_cooldowns(ship)
            ship.has_acted = false
        
        # Check victory
        result = check_combat_end(combat)
        if result.result != "ongoing":
            combat.status = "ended"
            combat.result = result
    
    # Post-combat
    award_experience(combat)
    process_salvage(combat)
    
    return combat.result
```

---

## Related Documents

- `weapons-complete.md` - Weapon statistics
- `components-complete.md` - Component statistics
- `ship-classes.md` - Ship HP and sizes
- `combat-mechanics.md` - High-level combat overview
- `../game-mechanics/turn-structure.md` - Where combat fits in turn

---

*Last Updated: 2026-03-22*
*Specification: spec-008 - Combat Damage Resolution Algorithm*
