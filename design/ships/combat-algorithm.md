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
  "design": "Warship-Class",
  "side": "attacker",
  "position": {"x": 5, "y": 3},
  "current_hp": 60,
  "max_hp": 60,
  "shields_current": 30,
  "shields_max": 30,
  "shield_class": 5,
  "combat_speed": 3,
  "crew_current": 100,
  "crew_max": 100,
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

**`shield_class`** — The tier number of the installed deflector shield (1–15, matching the Class I–XV Deflector table). Used by `apply_damage()` to determine how much damage is absorbed per hit: `shield_absorb = min(ship.shield_class, remaining_damage)`. A ship with no shields has `shield_class: 0`.

**`combat_speed`** — Hexes the ship can move per combat round, taken directly from the installed engine's `combat_speed` value (1–8). Used by the movement and retreat systems.

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
        # MOO1: Damage is MAPPED across the success range of the hit roll.
        # A roll exactly at the hit threshold = minimum damage.
        # A roll of 100 = maximum damage.
        # This means barely-hitting shots deal min damage; high rolls deal high damage.
        #
        # hit_threshold = 101 - hit_chance  (the lowest roll that still hits)
        # success_range = 100 - hit_threshold  (= hit_chance - 1, or 0 if hit_chance == 100)
        # damage_fraction = (roll - hit_threshold) / max(success_range, 1)
        # base_damage = weapon.damage_min + floor(damage_fraction × (weapon.damage_max - weapon.damage_min))
        hit_threshold = 101 - hit_chance
        success_range = max(hit_chance - 1, 1)
        damage_fraction = (roll - hit_threshold) / success_range
        base_damage = weapon.damage_min + floor(damage_fraction * (weapon.damage_max - weapon.damage_min))
        
        # Apply range penalty
        distance = hex_distance(attacker.position, target.position)
        if not weapon.has_special("no_range_penalty"):
            range_penalty = max(0, (distance - weapon.optimal_range) * 0.10)
            base_damage = floor(base_damage * (1 - range_penalty))
        
        # Apply racial damage bonus (Ferrets: +25%)
        racial_modifier = get_racial_damage_modifier(attacker.race)
        final_damage = floor(base_damage * racial_modifier)
        
        # Apply damage to target
        apply_damage(target, final_damage, weapon)
        
        return {hit: true, damage: final_damage}
    else:
        return {hit: false, damage: 0}
```

### 9. Hit Chance Formula (MOO1 Differential System)

```
# MOO1 canonical formula: each level of attacker advantage = +10%, each defender level = -10%
# Base 50% when both levels are equal.

Hit_Chance = 50 + (Effective_Attacker_Level - Effective_Defender_Level) × 10

Where:
  Effective_Attacker_Level = Battle_Computer_Mark
                           + Battle_Scanner_Bonus   (+1 if equipped)
                           + Racial_Attack_Bonus    (Ferrets: +4)
                           + Wide_Beam_Bonus        (wide-beam weapons like Megabolt: +3)
  
  Effective_Defender_Level = Target_Maneuver_Class
                           + Inertial_Stabilizer    (+2 if equipped)
                           + Inertial_Nullifier     (+4 if equipped; replaces Stabilizer)
                           + Cloaking_Device        (+5 if cloaked)
                           + Racial_Defense_Bonus   (Alkari/Budgies: +3)

Floor: 5% (always some chance to miss)
Ceiling: 95% (always some chance to hit)

NOTE: Experience bonuses, size modifiers, point-blank bonuses, and range penalties
are intentional design enhancements beyond MOO1. They are applied AFTER the
differential calculation and are clearly documented as such.

Enhancement modifiers (applied after base differential, documented as non-MOO1):
  + Experience_Bonus (Rookie: -5%, Regular: 0%, Veteran: +5%, Elite: +10%)
  + Point_Blank_Bonus (1 hex: +10%)
  + Size_Target_Bonus (per size class above Small: +5%)
  - Range_Penalty (Medium: -5%, Long: -10%, Very Long: -20%)
```

### 10. Hit Chance Calculation

```pseudocode
function calculate_hit_chance(attacker, weapon, target):
    # --- MOO1 Differential Formula ---
    # Attacker effective level = Battle Computer Mark + bonuses
    attacker_level = attacker.battle_computer_mark  # Mark I=1, II=2, ... Mark V=5
    if attacker.has_system("battle_scanner"):
        attacker_level += 1
    attacker_level += get_racial_attack_level_bonus(attacker.race)  # Ferrets: +4
    if weapon.has_special("wide_beam"):
        attacker_level += 3  # Wide-beam weapons (e.g. Megabolt Cannon)
    
    # Defender effective level = Maneuver Class + bonuses
    defender_level = target.maneuver_class  # Engine maneuver class (1–6+)
    if target.has_system("inertial_stabilizer"):
        defender_level += 2
    if target.has_system("inertial_nullifier"):
        defender_level += 4  # Replaces Stabilizer; do not double-count
    if target.cloaked:
        defender_level += 5  # Cloaking Device: +5 to effective defender level
    defender_level += get_racial_defense_level_bonus(target.race)  # Budgies: +3
    
    # Base differential hit chance
    hit_chance = 50 + (attacker_level - defender_level) * 10
    
    # --- Enhancement modifiers (non-MOO1, documented additions) ---
    hit_chance += get_experience_accuracy_bonus(attacker.experience_level)
    
    # Range modifiers
    distance = hex_distance(attacker.position, target.position)
    if distance == 1:
        hit_chance += 10  # Point blank (enhancement)
    elif distance >= 5 and distance <= 8:
        hit_chance -= 5   # Medium range
    elif distance >= 9 and distance <= 15:
        hit_chance -= 10  # Long range
    elif distance > 15:
        hit_chance -= 20  # Very long range
    
    # Size modifier — larger targets easier to hit (enhancement, no MOO1 basis)
    size_diff = target.size_class - 1  # Small = 1, Medium = 2, Large = 3, Huge = 4
    hit_chance += size_diff * 5
    
    # Displacement Device: separate 33% miss reroll (handled in check_displacement())
    # Do NOT subtract from hit_chance here — it's resolved after the hit roll.
    
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
    
    # Step 1: Compute effective shield absorption for this hit
    if target.shield_class > 0:
        effective_shield_class = target.shield_class
        
        # armor_piercing: MOO1 mechanic — halves the defender's shield class (round down)
        # for this hit only. Applies to: Neutron Pellet Gun, Mass Driver, Hard Beam,
        # Gauss Autocannon, Particle Beam (and any weapon with Oracle Interface).
        # The reduced shield still absorbs up to its halved class value; remainder hits hull.
        if weapon.has_special("armor_piercing"):
            effective_shield_class = floor(target.shield_class / 2)
        
        # Standard shield absorption
        shield_absorb = min(effective_shield_class, remaining_damage)
        remaining_damage -= shield_absorb
        
        # Some weapons do extra shield damage (non-MOO1 enhancement)
        if weapon.has_special("double_shield_damage"):
            target.shields_current -= shield_absorb * 2
        else:
            target.shields_current -= shield_absorb
        
        target.shields_current = max(0, target.shields_current)
    
    # Step 2: Armor/Hull damage
    if remaining_damage > 0:
        target.current_hp -= remaining_damage
    
    # Step 3: Check for destruction
    if target.current_hp <= 0:
        destroy_ship(target)
        return
    
    # Step 4: Apply weapon special effects
    apply_weapon_effects(target, weapon, damage)
```

### 11b. Weapon Special Effects Application

This function handles all weapon special effects after base damage is applied. Called only if the target survived (HP > 0 after damage). The `combat` context is passed in for chain-lightning AoE resolution.

```pseudocode
function apply_weapon_effects(target, weapon, damage, combat):
    effects = weapon.special_effects  # List of effect strings
    
    # --- kills_crew ---
    # Each hit kills a percentage of crew.
    # Weapons: Neutron Blaster (1%), Neutron Stream Projector (10% per turn via stream).
    if "kills_crew" in effects:
        crew_kill_pct = weapon.crew_kill_percent  # Default: 0.01 (1% of crew_max per hit)
        crew_killed = max(1, floor(target.crew_max * crew_kill_pct))
        target.crew_current = max(0, target.crew_current - crew_killed)
        apply_crew_loss_penalties(target)
    
    # --- overflow_damage ---
    # MOO1 mechanic for Graviton Beam and Tachyon Beam:
    # Damage that exceeds what is needed to destroy a ship "overflows" to the
    # next ship of the same design in the target's stack.
    # The overflow amount = overkill damage (damage beyond 0 HP on the primary).
    # Each successive ship in the stack has shields applied normally.
    # Used by: Graviton Beam, Tachyon Beam.
    if "overflow_damage" in effects:
        overflow = max(0, -target.current_hp)  # Overkill amount (target.current_hp already negative)
        if overflow > 0:
            stack_mates = get_stack_mates(target, combat)  # Ships of same design in same hex
            for next_ship in stack_mates:
                if next_ship.current_hp > 0:
                    apply_damage(next_ship, overflow, weapon)
                    break  # Only overflow to one ship at a time
    
    # --- hellfire_multi_hit ---
    # MOO1: Hellfire Torpedo deals 4 SEPARATE 25-damage attacks per hit, totaling 100 damage.
    # Each of the 4 attacks is resolved independently through the shield absorption
    # sequence (shields absorb their class value from each of the 4 hits).
    # The damage field on the hellfire_torpedo JSON represents 25 (one sub-attack);
    # the multi-hit is fired here N=4 times rather than once.
    # NOTE: apply_damage() is called with the torpedo's base 25-damage from
    # resolve_torpedo_impact(); this effect fires 3 MORE hits (total = 4).
    if "hellfire_multi_hit" in effects:
        for i in range(3):  # 3 additional hits (first hit already applied)
            if target.current_hp > 0:
                apply_damage(target, 25, weapon)
    
    # --- chain_lightning ---
    # After hitting the primary, arcs to up to N additional adjacent enemies at 50% damage.
    # chain_lightning_count is set per-weapon (canonical value TBD per issue 1.4).
    # Used by: Megabolt Cannon.
    if "chain_lightning" in effects:
        chain_count = weapon.chain_lightning_count  # e.g., 3 or 4
        arc_damage = floor(damage * 0.5)
        
        adjacent_enemies = get_ships_within_range(
            center=target.position,
            range=2,
            side=get_enemy_side(target.side),
            combat=combat
        )
        adjacent_enemies = [s for s in adjacent_enemies if s.id != target.id]
        
        arcs_fired = 0
        for arc_target in adjacent_enemies:
            if arcs_fired >= chain_count:
                break
            if arc_target.current_hp > 0:
                # Apply arc — no further chaining from arc hits
                apply_damage(arc_target, arc_damage, weapon)
                arcs_fired += 1
    
    # --- disable_engines ---
    # Reduces target's combat_speed to 1 for N turns. Refreshes if already applied.
    # Used by: Ion Stream Projector. NOTE: Ion Stream Projector in MOO1 is actually an
    # HP%-damage weapon (20% current HP + 1%/firing ship). The disable_engines effect
    # is a design choice; see FINAL_REVIEW_COMBAT.md D23 for the full MOO1 description.
    if "disable_engines" in effects:
        duration = weapon.disable_duration  # Default: 2 turns
        existing = get_status(target, "engines_disabled")
        if existing:
            existing.duration = max(existing.duration, duration)  # Refresh, don't stack
        else:
            target.status_effects.append({
                type: "engines_disabled",
                duration: duration,
                saved_speed: target.combat_speed
            })
            target.combat_speed = 1
    
    # --- instant_kill_small ---
    # Destroys Small hull ships outright regardless of remaining HP.
    # No effect on Medium/Large/Huge hulls.
    if "instant_kill_small" in effects:
        if target.size_class == 1:  # Small hull
            destroy_ship(target)
            return  # No further effects
    
    # --- double_shield_damage and armor_piercing ---
    # Both handled directly inside apply_damage() before this function is called.
    # No additional action needed here.
```

### 11c. Crew Loss Penalties

Crew are not just flavor — performance degrades as crew falls. Thresholds are rechecked after every crew loss event.

**Crew scaling by hull size (base complement):**

| Hull | Base Crew |
|------|-----------|
| Small | 20 |
| Medium | 60 |
| Large | 200 |
| Huge | 500 |

`crew_max` is set from this table at combat initialization. `crew_current` starts equal to `crew_max`.

```pseudocode
function apply_crew_loss_penalties(ship):
    crew_ratio = ship.crew_current / ship.crew_max
    
    # Clear previous crew-loss status effects before reapplying
    remove_status(ship, "skeleton_crew")
    remove_status(ship, "undermanned")
    remove_status(ship, "adrift")
    
    if crew_ratio <= 0.0:
        # No crew — ship drifts, all systems fail
        # Ship is NOT destroyed; it becomes a boarding prize
        ship.can_act = false
        ship.combat_speed = 0
        ship.status_effects.append({type: "adrift", duration: 99})
    
    elif crew_ratio <= 0.25:
        # Skeleton crew — severe degradation
        ship.status_effects.append({type: "skeleton_crew", duration: 99})
        # Effects applied in combat resolution:
        #   - attack accuracy: -20%
        #   - combat_speed: floor(original / 2)
        #   - each weapon: 50% chance it cannot fire this turn (unmanned)
    
    elif crew_ratio <= 0.50:
        # Undermanned — moderate degradation
        ship.status_effects.append({type: "undermanned", duration: 99})
        # Effects applied in combat resolution:
        #   - attack accuracy: -10%
        #   - combat_speed: original - 1 (minimum 1)
```

### 12. Shield Mechanics

Shields absorb damage **up to their class rating per hit**. Damage exceeding the shield class passes through to armor/hull:

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

Base_HP by Hull Size (MOO1):
  Small: 3
  Medium: 18
  Large: 100
  Huge: 600

Armor_Multiplier:
  Titanium: 1.0×
  Duralloy: 1.5×
  Zortrium: 2.0×
  Andrium: 2.5×
  Tritanium: 3.0×
  Adamantium: 3.5×
  Neutronium: 4.0×
```

**Example:** A Large hull with Zortrium armor has 100 × 2.0 = 200 HP.

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
        remaining_fuel: 2  # MOO1: ship-launched missiles self-destruct after 2 turns
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

Torpedoes follow the same targeting rules as missiles (including ECM) but
fire every 2 turns. They are heavier warheads — not auto-hit weapons.

```pseudocode
function fire_torpedo(attacker, weapon, target, combat):
    # Check cooldown
    if attacker.weapon_cooldowns[weapon.id] > 0:
        return false
    
    torpedo = {
        source: attacker,
        target: target,
        weapon: weapon,
        position: attacker.position,
        speed: weapon.torpedo_speed,
        damage: weapon.damage,
        remaining_fuel: 2  # Same fuel rule as missiles (MOO1: torpedoes follow missile rules)
    }
    
    combat.missiles_in_flight.append(torpedo)
    
    # Set cooldown (fires every 2 turns)
    attacker.weapon_cooldowns[weapon.id] = 2
    
    return true

function resolve_torpedo_impact(torpedo, combat):
    # MOO1: Torpedoes follow the same rules as missiles.
    # They ARE subject to ECM and point defense. They are NOT auto-hit.
    target = torpedo.target
    
    if target.current_hp <= 0:
        return
    
    # Attempt point defense intercept (same as missiles)
    if attempt_point_defense(target, torpedo, combat):
        log_combat("Torpedo intercepted by point defense")
        return
    
    # Hit chance follows missile formula (ECM applies)
    hit_chance = 80 - (target.ecm_rating * 5) - (target.maneuver_rating * 2)
    hit_chance = clamp(hit_chance, 10, 95)
    
    # MOO1 damage-mapped-to-roll mechanic applies to torpedoes too
    roll = random(1, 100)
    if roll <= hit_chance:
        hit_threshold = 101 - hit_chance
        success_range = max(hit_chance - 1, 1)
        damage_fraction = (roll - hit_threshold) / success_range
        final_damage = torpedo.weapon.damage_min + floor(
            damage_fraction * (torpedo.weapon.damage_max - torpedo.weapon.damage_min)
        )
        apply_damage(target, final_damage, torpedo.weapon)
        log_combat("Torpedo hit for " + final_damage + " damage")
    else:
        log_combat("Torpedo missed")
```

---

## Special Weapon Effects

### 21. Weapon Special Effects Table

| Effect | Implementation |
|--------|----------------|
| `multi_attack` | Fire N times, each attack resolved separately |
| `armor_piercing` | **MOO1**: Halves the defender's shield class (round down) for this hit only. Remaining damage still hits hull at face value. Applies to: Neutron Pellet Gun, Mass Driver, Hard Beam, Gauss Autocannon, Particle Beam. |
| `overflow_damage` | **MOO1**: Excess damage beyond what destroys a ship carries over to the next ship of the same design in the stack. Used by Graviton Beam, Tachyon Beam. |
| `kills_crew` | Each hit kills 1% of crew (reduces combat effectiveness) |
| `no_range_penalty` | No damage reduction at range |
| `chain_lightning` | After hitting primary, hits up to 4 adjacent enemies |
| `double_shield_damage` | Shield takes 2× damage (non-MOO1 enhancement) |
| `instant_kill_small` | 100% kill vs Small hull ships |
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
      "Round 1: Medium ship fires Fusion Beam at Large ship, hits for 12 damage",
      "Round 1: Large ship launches Merculite Missiles at Medium ship"
    ]
  }
}
```

---

## Section 25: Auto-Combat AI Targeting Priorities

When the player chooses "Auto-Resolve" or AI controls ships, the following algorithms determine behavior.

### 25.1 Target Priority Algorithm

```pseudocode
function select_target(ship, combat):
    enemies = get_enemy_ships(ship.side, combat)
    
    # Score each potential target
    scores = []
    for enemy in enemies:
        score = calculate_target_priority(ship, enemy, combat)
        scores.append({target: enemy, score: score})
    
    # Sort by score descending
    scores.sort(key=score, descending=True)
    
    # Return highest priority target
    return scores[0].target if scores else None

function calculate_target_priority(ship, target, combat):
    score = 0
    
    # Priority 1: Bombers (highest threat to planets)
    if target.has_bombs:
        score += 1000
    
    # Priority 2: Troop transports (invasion threat)
    if target.has_troops:
        score += 800
    
    # Priority 3: Capital ships with heavy weapons
    if target.size_class >= 4:  # Large or bigger
        score += 500
    
    # Priority 4: Ships that can kill us this turn
    if can_destroy_us(target, ship):
        score += 400
    
    # Priority 5: Damaged ships (finish them off)
    damage_percent = 1 - (target.current_hp / target.max_hp)
    score += damage_percent * 300
    
    # Priority 6: Range bonus (prefer closer targets)
    distance = hex_distance(ship.position, target.position)
    score -= distance * 10  # Penalize distant targets
    
    # Priority 7: Kill probability (prefer easy kills)
    kill_chance = estimate_kill_chance(ship, target)
    score += kill_chance * 200
    
    return score
```

### 25.2 Weapon Selection Logic

```pseudocode
function select_weapon(ship, target, combat):
    best_weapon = None
    best_dps = 0
    
    for weapon in ship.weapons:
        if weapon.cooldown > 0:
            continue
        if weapon.ammo_remaining <= 0:
            continue
        
        # Calculate expected damage per second
        hit_chance = calculate_hit_chance(ship, weapon, target)
        avg_damage = (weapon.damage_min + weapon.damage_max) / 2
        expected_damage = hit_chance * avg_damage
        
        # Apply shield consideration
        if target.shields_current > 0:
            # Prefer shield-bypassing weapons
            if weapon.ignores_shields:
                expected_damage *= 1.5
            else:
                expected_damage -= min(target.shield_class, expected_damage)
        
        # Consider ammo conservation
        if weapon.is_missile and ship.missile_count < 3:
            expected_damage *= 0.7  # Prefer saving missiles
        
        if expected_damage > best_dps:
            best_dps = expected_damage
            best_weapon = weapon
    
    return best_weapon
```

### 25.3 Movement AI

```pseudocode
function ai_choose_movement(ship, target, combat):
    optimal_range = get_optimal_weapon_range(ship)
    current_range = hex_distance(ship.position, target.position)
    
    # Bombers: Rush planet
    if ship.has_bombs and combat.has_planet:
        return move_toward(ship, combat.planet_position)
    
    # Short-range ships: Close distance
    if optimal_range <= 3 and current_range > optimal_range:
        return move_toward(ship, target.position)
    
    # Long-range ships: Maintain distance
    if optimal_range >= 6 and current_range < optimal_range:
        return move_away(ship, target.position)
    
    # Damaged ships: Seek escape route
    if ship.current_hp < ship.max_hp * 0.25:
        return move_toward_retreat_edge(ship, combat)
    
    # Default: Approach to optimal range
    return move_to_optimal_range(ship, target.position, optimal_range)
```

### 25.4 Retreat Decision Algorithm

```pseudocode
function ai_should_retreat(ship, combat):
    # Calculate force ratios
    our_strength = calculate_fleet_strength(ship.side, combat)
    enemy_strength = calculate_fleet_strength(get_enemy_side(ship.side), combat)
    ratio = our_strength / max(enemy_strength, 1)
    
    # Racial tendencies
    retreat_threshold = get_racial_retreat_threshold(ship.race)
    
    # Guinea Pigs: Almost never retreat (threshold 0.1)
    # Hermit Crabs: Retreat quickly (threshold 0.5)
    # Others: Standard (threshold 0.3)
    
    if ratio < retreat_threshold:
        return true
    
    # Individual ship survival
    if ship.current_hp < ship.max_hp * 0.15:
        return true
    
    return false

function get_racial_retreat_threshold(race):
    thresholds = {
        "guinea_pigs": 0.10,
        "budgies": 0.25,
        "ferrets": 0.20,
        "hermit_crabs": 0.50,
        "hamsters": 0.30,
        "default": 0.30
    }
    return thresholds.get(race, thresholds["default"])
```

### 25.5 Focus Fire Coordination

```pseudocode
function coordinate_focus_fire(fleet_side, combat):
    # All AI ships focus on single target when possible
    primary_target = None
    
    for ship in get_fleet_ships(fleet_side, combat):
        if ship.current_target:
            if primary_target == None:
                primary_target = ship.current_target
            elif ship.current_target.current_hp < primary_target.current_hp:
                # Switch to almost-dead target
                primary_target = ship.current_target
    
    # Assign all ships to primary target if valid
    if primary_target and primary_target.current_hp > 0:
        for ship in get_fleet_ships(fleet_side, combat):
            if can_hit(ship, primary_target, combat):
                ship.current_target = primary_target
    
    return primary_target
```

### 25.6 Auto-Resolve Quick Combat

For players who skip tactical combat entirely:

```pseudocode
function auto_resolve_combat(attacker_fleet, defender_fleet, location):
    # Calculate force strengths
    attacker_strength = 0
    for ship in attacker_fleet:
        attacker_strength += calculate_ship_combat_power(ship)
    
    defender_strength = 0
    for ship in defender_fleet:
        defender_strength += calculate_ship_combat_power(ship)
    
    # Add planetary defenses to defender
    if location.has_missile_bases:
        defender_strength += location.missile_bases * 50
    
    # Determine winner
    total = attacker_strength + defender_strength
    attacker_roll = random() * attacker_strength
    defender_roll = random() * defender_strength
    
    if attacker_roll > defender_roll:
        winner = "attacker"
        casualty_rate = defender_strength / total
    else:
        winner = "defender"
        casualty_rate = attacker_strength / total
    
    # Apply casualties (higher variance than manual combat)
    attacker_losses = apply_casualties(attacker_fleet, casualty_rate * 1.2)
    defender_losses = apply_casualties(defender_fleet, casualty_rate * 0.8)
    
    return {
        winner: winner,
        attacker_losses: attacker_losses,
        defender_losses: defender_losses
    }

function calculate_ship_combat_power(ship):
    power = ship.max_hp
    power += ship.shield_class * 10
    power += sum(weapon.avg_damage for weapon in ship.weapons) * 5
    # experience_level is a string; map to numeric for math
    exp_numeric = {"rookie": 0, "regular": 1, "veteran": 2, "elite": 3}
    power *= 1 + (exp_numeric.get(ship.experience_level, 1) * 0.1)
    return power
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

---

## Boarding and Transporter Mechanics

### 36. Boarding Overview

Ships equipped with Transporters can capture enemy vessels instead of destroying them. A successful boarding grants a prize ship — re-crewed by the attacker and added to their fleet. Boarding is high-risk, high-reward: both sides suffer crew casualties, and failure leaves the target under enemy control.

**Requirements to attempt boarding:**
- Attacker has a Transporter installed (Standard, Improved, or Combat tier)
- Target is within 1 hex
- Target is in a weakened condition: ≥ 50% crew lost **OR** HP ≤ 25% max (Combat Transporter relaxes HP threshold to ≤ 50%)
- Attacker has at least 2× the minimum boarding party in available crew (so the home ship remains crewed)

### 37. Crew State on Ships

Each combat ship tracks crew as part of its combat state (see Section 2). Crew complement scales with hull size:

```
Base_Crew_by_Hull:
  Small:  20
  Medium: 60
  Large:  200
  Huge:   500
```

Crew loss below key thresholds degrades combat effectiveness (see Section 11c). A ship reduced to 0 crew becomes **adrift** — it can be boarded without resistance and without the HP threshold requirement.

### 38. Boarding Attempt

```pseudocode
function attempt_boarding(attacker, target, combat):
    # --- Prerequisite checks ---
    transporter = attacker.get_system("transporter")
    if not transporter:
        return {success: false, reason: "no_transporter"}
    
    if hex_distance(attacker.position, target.position) > 1:
        return {success: false, reason: "out_of_range"}
    
    crew_ratio = target.crew_current / target.crew_max
    hp_ratio = target.current_hp / target.max_hp
    hp_threshold = 0.50 if transporter.tier == "combat" else 0.25
    
    if not has_status(target, "adrift"):
        if crew_ratio > 0.50 and hp_ratio > hp_threshold:
            return {success: false, reason: "target_not_weakened"}
    
    # Minimum boarding party: 10% of attacker's crew_max, at least 1
    boarding_party_size = max(floor(attacker.crew_max * 0.10), 1)
    
    # Attacker must keep enough crew to remain operational
    if attacker.crew_current < boarding_party_size * 2:
        return {success: false, reason: "insufficient_crew"}
    
    # --- Success formula ---
    # Adrift targets are auto-captured (trivially easy)
    if has_status(target, "adrift"):
        return capture_ship(attacker, target, boarding_party_size, combat)
    
    success_chance = 50
    success_chance += transporter.boarding_bonus     # Standard: +0, Improved: +15, Combat: +30
    
    # Crew advantage: net crew difference, capped at ±20%
    crew_advantage = attacker.crew_current - target.crew_current
    success_chance += clamp(floor(crew_advantage / 10), -20, 20)
    
    # Racial modifier
    success_chance += get_racial_boarding_bonus(attacker.race)
    
    success_chance = clamp(success_chance, 5, 95)
    
    # --- Resolve ---
    roll = random(1, 100)
    
    resolve_boarding_casualties(attacker, target, attacker_wins=(roll <= success_chance))
    
    if roll <= success_chance:
        return capture_ship(attacker, target, boarding_party_size, combat)
    else:
        return {success: false, reason: "repelled"}
```

### 39. Boarding Casualties

Both sides take crew casualties whenever boarding is attempted, win or lose.

```pseudocode
function resolve_boarding_casualties(attacker, target, attacker_wins):
    base_attacker_loss = floor(target.crew_current * 0.20)  # Defenders fight back
    base_defender_loss = floor(attacker.crew_current * 0.15)
    
    if attacker_wins:
        # Boarding party overwhelmed defenders; defenders take more losses
        attacker.crew_current = max(1, attacker.crew_current - base_attacker_loss)
        target.crew_current = max(0, target.crew_current - floor(base_defender_loss * 1.5))
    else:
        # Defenders repelled; attackers take heavier losses
        attacker.crew_current = max(1, attacker.crew_current - floor(base_attacker_loss * 1.5))
        target.crew_current = max(1, target.crew_current - base_defender_loss)
    
    apply_crew_loss_penalties(attacker)
    apply_crew_loss_penalties(target)
```

### 40. Ship Capture

```pseudocode
function capture_ship(attacker, target, boarding_party_size, combat):
    # Detach boarding party from attacker
    attacker.crew_current -= boarding_party_size
    apply_crew_loss_penalties(attacker)
    
    # Prize ship is now crewed by the boarding party and switches sides
    target.crew_current = boarding_party_size
    target.side = attacker.side
    target.race = attacker.race  # For racial modifiers going forward
    
    # Prize ships operate at reduced effectiveness — unfamiliar controls
    target.status_effects.append({
        type: "prize_ship",
        duration: 99,
        accuracy_penalty: -20,
        speed_penalty: -1
    })
    
    # Cannot be boarded again this battle
    target.boarding_immune = true
    
    log_combat("BOARDING SUCCESS: " + target.design + " captured by " + attacker.side + "!")
    
    return {success: true, prize_ship: target}
```

### 41. Transporter Tiers

| Tier | Boarding Bonus | HP Threshold | Notes |
|------|---------------|--------------|-------|
| Standard Transporter | +0% | ≤ 25% HP | Baseline |
| Improved Transporter | +15% | ≤ 25% HP | — |
| Combat Transporter | +30% | ≤ 50% HP | Relaxed HP requirement |

### 42. Racial Boarding Modifiers

```pseudocode
function get_racial_boarding_bonus(race):
    bonuses = {
        "guinea_pigs": 20,   # Fierce close-quarters fighters
        "hermit_crabs": 10,  # Good at holding/defending spaces
        "ferrets":       5,
        "hamsters":      0,
        "rabbits":       0,
        "budgies":     -10   # Terrible ground combatants
    }
    return bonuses.get(race, 0)
```

### 43. Counter-Boarding

A ship that has been successfully boarded (`boarding_immune = true`) cannot be boarded again this battle. A ship that **repelled** a boarding attempt can be boarded again next turn — each attempt costs both sides crew casualties.

Ships with **Marine Barracks** (future component, if implemented) receive a +10% bonus to boarding defense (applied as -10% to attacker's success_chance).

---

## Related Documents

- `weapons-complete.md` - Weapon statistics
- `components-complete.md` - Component statistics
- `ship-classes.md` - Ship HP and sizes
- `combat-mechanics.md` - High-level combat overview
- `../game-mechanics/turn-structure.md` - Where combat fits in turn

---

*Last Updated: 2026-04-12*
*Specification: spec-008 - Combat Damage Resolution Algorithm*
