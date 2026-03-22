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

### Base Hit Chance
**Formula**: 70% - (Range Penalty) + (Computer Bonus) - (ECM Penalty) + (Size Modifier)

**Range Penalties**:
- Point Blank (1 hex): +10%
- Close (2-4 hexes): +0%
- Medium (5-8 hexes): -10%
- Long (9-15 hexes): -20%
- Very Long (16+ hexes): -30%

**Computer Bonus**: Battle Computer Mark adds +accuracy
**ECM Penalty**: Enemy ECM reduces your accuracy
**Size Modifier**: Larger targets easier to hit (+10% per size class)

**Example**:
- Ion Cannon at long range vs destroyer with ECM III
- Base: 70%
- Range: -20% (long)
- Computer Mark V: +35%
- ECM III: -20%
- Size (destroyer): +0%
- **Final: 65% hit chance**

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

Next: See `ship-design.md` for custom ship design.
