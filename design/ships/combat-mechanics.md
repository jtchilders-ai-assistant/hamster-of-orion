# Combat Mechanics

## Overview
Space battles in Hamster of Orion follow MOO1-style combat: turn-based tactical with player control over positioning and targeting.

**Target Platform**: Web-based tactical combat with simple, clear visuals

---

## Battle Initiation

Combat triggers when:
- Your fleet enters system with enemy ships
- Enemy fleet enters your system
- You attack enemy colony

**Pre-Battle Phase**:
1. Show both fleets
2. Player can choose: Auto-Resolve or Tactical Battle
3. Retreat is possible (with risks)

---

## Combat Flow

### Turn Structure

**1. Initiative Phase**
- Faster ships move first
- Speed = Engine + Propulsion Tech + Combat Speed
- Budgies get bonus initiative

**2. Movement Phase**
- Ships move up to their speed rating
- Can reposition for better firing arcs
- Can attempt to close distance or retreat

**3. Firing Phase**
- Ships fire at selected targets
- Beam weapons: Instant hit (if accuracy succeeds)
- Missiles: Travel toward target, can be intercepted
- Damage applied immediately

**4. End Phase**
- Check for destroyed ships
- Check for retreat conditions
- Next turn or battle ends

### Win Conditions
- Destroy all enemy ships: Victory
- All your ships destroyed: Defeat
- Successful retreat: Escape (planet may be lost)
- Mutual destruction: Both sides lose

---

## Combat Grid

**Space**: Hexagonal grid (web-friendly)
- Range matters (close/medium/long/very long)
- Positioning matters (flank bonuses)
- Line of sight matters (asteroids/debris)

**Size**: Dynamic based on fleet size
- Small battle: 20x20 hexes
- Large battle: 40x40 hexes

---

## Targeting & Accuracy

### Base Hit Chance (MOO1 Differential Formula)

**Canonical Formula** (see `combat-algorithm.md` Section 9-10):

```
hit_chance = 50 + (battle_computer_rating × 5) - (target_defense × 5) + size_modifier - range_penalty + experience_modifier
```

Where:
- **battle_computer_rating** = Battle Computer Mark (I=1, II=2, etc.)
- **target_defense** = ecm_rating + maneuver_rating
- **size_modifier** = (target_size_class - 1) × 5 (Scout = class 1, Fighter = 2, etc.)
- **range_penalty** = {point_blank: -10, close: 0, medium: +5, long: +10, very_long: +20}
- **experience_modifier** = {rookie: -5, regular: 0, veteran: +5, elite: +10}

**Minimum**: 5% (always some chance to hit)
**Maximum**: 95% (always some chance to miss)

**Range Brackets**:
- Point Blank (1 hex): -10% penalty (bonus to attacker)
- Close (2-4 hexes): +0%
- Medium (5-8 hexes): +5% penalty
- Long (9-15 hexes): +10% penalty
- Very Long (16+ hexes): +20% penalty

**Racial Combat Bonuses**:
- Ferrets: +4 Attack Level AND +15% weapon damage (Deadly Accuracy ability)
- Budgies: +5 Defense Level (+50%), +3 Initiative, +20% Evasion (Superior Pilots)

**Example**:
- Ion Cannon at long range vs Destroyer with ECM III
- Attacker: Battle Computer Mark V (+5 × 5% = +25%), Size target (Destroyer = 3, so +2 × 5% = +10%)
- Defender: ECM III (3 × 5% = 15%), Maneuver 2 (2 × 5% = 10%), Long Range (+10%)
- Hit Chance: 50% + 25% + 10% - 15% - 10% - 10% = 50%

See `combat-algorithm.md` Section 9 for the full pseudocode implementation.
See `components-complete.md` for shield absorption values.

---

## Damage Resolution

### Damage Sequence
1. Check if hit (accuracy roll)
2. Damage hits shields first
3. Remaining damage hits armor
4. Remaining damage destroys ship systems
5. Ship destroyed when hull reaches 0

### Shields
- Absorb damage before armor
- Regenerate 100% between battles
- Don't regenerate during battle (unless special tech)
- Different shield classes have different HP

### Armor
- Second layer of defense
- Does NOT regenerate
- Damage is permanent until repaired
- Better armor = more HP per space

### Critical Hits (10% chance)
- Double damage
- Can disable specific systems
- Can destroy ship outright if damage exceeds threshold

---

## Special Combat Situations

### Missiles
- Travel 5 hexes per turn toward target
- Can be shot down by point defense
- Explode on contact
- Miss if target moves away

### Bombers
- Ships with bombs can attack planets
- Planetary defenses fire back
- Ground-based missiles
- Planetary shields absorb damage

### Cloaked Ships
- Can't be targeted until they fire
- Firing reveals them for 1 turn
- Perfect Cloaking: Never revealed

### Stacked Ships
- Multiple ships on same hex
- Take concentrated fire
- Can split up next turn

---

## Combat AI (Auto-Resolve)

For players who skip tactical:
- AI controls your ships
- Fast resolution
- Outcome determined by fleet strength + tech + dice
- Higher risk than player control

**AI Behavior**:
- Small ships screen capital ships
- Capital ships focus fire on biggest threats
- Wounded ships attempt retreat
- Bombers prioritize planet bombing

---

## Retreat Mechanics

**Player Retreat**:
- Can attempt retreat any turn
- Success chance = (Your speed ÷ Enemy speed) × 100%
- Failed retreat = trapped for 1 turn, then can try again
- Budgies: +20% retreat chance

**Enemy Retreat**:
- AI retreats when odds poor
- Aggressive races (Guinea Pigs) rarely retreat
- Defensive races (Hermit Crabs) retreat quickly

---

## Combat Experience

Ships gain experience through battles:
- **Rookie**: New ships, -10% accuracy
- **Regular**: Standard ships, +0%
- **Veteran**: 3+ battles, +10% accuracy
- **Elite**: 10+ battles, +20% accuracy

Race bonuses:
- Budgies: Start at Veteran
- Ferrets: Gain experience 2x faster

---

## Victory Results

**After Battle**:
- Show casualties
- Salvage enemy tech (5% chance per destroyed ship)
- Experience gains
- If attacking planet: Proceed to invasion or bombardment

---

## Planet Bombardment

**Requirements**: Bombs equipped on ships
**Mechanics**:
- Each bomb deals damage to population/factories
- Planetary shields reduce damage
- Ground-based missiles fire back
- Can destroy planet infrastructure without invasion

**Ethical Choices**:
- Light bombardment: Soften defenses
- Heavy bombardment: Destroy everything
- Biological weapons: Kill population, preserve buildings
- Stellar Converter: Destroy planet entirely

---

## Ground Invasion

**After Bombardment** (or instead of):
- Ground troops land from ships
- Defender garrison bonus
- Attacker tech bonuses (better weapons)
- Racial combat bonuses apply

**Ground Combat**: Simple comparison
- Attacker Strength = Troops × Tech Bonus × Racial Bonus
- Defender Strength = Garrison × Fortifications × Racial Bonus
- Higher strength wins, casualties both sides

Guinea Pigs: +50% ground combat (devastating)
Budgies: -20% ground combat (terrible)

---

## Combat Tips

**General**:
- Focus fire (kill ships one at a time)
- Protect bombers (they win wars)
- Screen capital ships with fighters
- Use terrain (asteroids block line of sight)

**By Race**:
- Budgies: Stay at range, use speed
- Ferrets: Alpha strike biggest threat first
- Hermit Crabs: Tank damage, outlast
- Rabbits: Swarm with numbers

---

## Missile Bases (Planetary Defense)

Missile bases are ground-based defense installations that participate in orbital combat.

### Base Statistics

| Component | Value | Notes |
|-----------|-------|-------|
| Base Cost | 150 BC | Plus component costs |
| Volleys per Round | 3 | Fire 3 times per combat round |
| Auto-Upgrade | Yes | Uses best available tech |

### Component Assignment

Missile bases automatically use the best available technology:
- **Shield**: Best researched Deflector Shield class
- **Battle Computer**: Best researched BC Mark
- **ECM Jammer**: Best researched Jammer Mark
- **Missiles**: Best researched missile type

### Combat Behavior

**Targeting Priority** (highest to lowest):
1. Bombers (ships with bombs equipped)
2. Troop transports
3. Largest enemy ships
4. Closest enemy ships

**Attack Resolution**:
- Each base fires 3 missile volleys per combat round
- Missiles use standard hit formula with base's Battle Computer
- Enemy point defense can intercept missiles
- Missiles that hit deal standard missile damage

### Base Cost Formula

```
Total_Base_Cost = 150 + Shield_Cost + Computer_Cost + ECM_Cost + (Missile_Cost × 3)
```

Where component costs are based on the best available technology at time of construction.

### Planetary Shield Interaction

- Missile bases benefit from Planetary Shields
- Planetary Shield absorbs X damage per bomb hit (Class V = 5, Class X = 10, etc.)
- Shields stack with base armor

### Edge Cases

- Bases cannot retreat
- Bases are destroyed when planet is captured
- Bases continue firing even if all ships retreat
- Multiple bases fire independently (no coordination bonus)

---

## Related Documents

- `combat-algorithm.md` - Full combat resolution pseudocode
- `../technology/force-fields.md` - Shield absorption values
- `components-complete.md` - All ship components
- `weapons-complete.md` - All weapon statistics
- `ship-design.md` - Ship design rules

---

Next: See `ship-design.md` for custom ship design.
