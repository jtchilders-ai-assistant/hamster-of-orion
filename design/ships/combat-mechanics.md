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

## Combat Grid (Hamster of Orion Enhancement)

> **Note**: Original MOO1 used simplified linear combat. Hamster of Orion enhances this with a hex-based tactical grid for more strategic depth.

**Hex Grid Layout**:
- Ships are positioned on a hexagonal grid
- Range matters (close/medium/long/very long)
- Positioning matters (flank bonuses possible)
- Line of sight can be affected by debris/asteroids

**Grid Size**: Dynamic based on fleet size
- Small battle: 20x20 hexes
- Large battle: 40x40 hexes

**Range Brackets**:
- Point Blank (1 hex): Best for beam weapons
- Close (2-4 hexes): Standard engagement
- Medium (5-8 hexes): Mixed weapon range
- Long (9-15 hexes): Missile advantage
- Very Long (16+ hexes): Long-range only

**Stacks**: Ships of the same design move and fire as a group (stack), similar to MOO1.

---

## Targeting & Accuracy

### Base Hit Chance (MOO1 Differential Formula)

**Canonical Formula** (see `combat-algorithm.md` Section 9-10):

```
hit_chance = 50 + (Effective_Attacker_Level - Effective_Defender_Level) × 10
```

Each **level of attacker advantage** adds **+10%**. Each **level of defender advantage** subtracts **10%**.
Base 50% when both levels are equal.

**Effective_Attacker_Level** = Battle Computer Mark + Battle Scanner (+1) + Racial Bonus (Ferrets: +4) + Wide Beam (+3)

**Effective_Defender_Level** = Target Maneuver Class + Inertial Stabilizer (+2) or Nullifier (+4) + Cloaking (+5) + Racial Bonus (Budgies: +3)

**Minimum**: 5% | **Maximum**: 95%

> **ECM and beams:** ECM jamming does **not** affect beam weapons. ECM only reduces missile hit chance
> (see `combat-algorithm.md` Section 19: `hit_chance = 80 - (ecm_rating × 5) - (maneuver_rating × 2)` for missiles).

**Enhancement modifiers** (non-MOO1 additions, documented as such):
- Point Blank (1 hex): +10% bonus to attacker
- Close (2-4 hexes): +0%
- Medium (5-8 hexes): -5% penalty
- Long (9-15 hexes): -10% penalty
- Very Long (16+ hexes): -20% penalty
- Experience: {rookie: -5%, regular: 0%, veteran: +5%, elite: +10%}
- Size modifier: (target_size_class - 1) × 5% (Small=class1, Medium=2, Large=3, Huge=4)

**Racial Combat Bonuses**:
- Ferrets: +4 Attack Level (Deadly Accuracy — adds to attacker's effective level, not a flat % bonus)
- Budgies: +3 Defense Level (adds to defender's effective level), +3 Initiative, +20% Evasion

**Example** (MOO1-faithful, no enhancement modifiers):
- Attacker: Battle Computer Mark V (attacker_level = 5)
- Defender: Maneuver Class 3 (defender_level = 3)
- Hit Chance: 50 + (5 - 3) × 10 = **70%**

**Example with Budgies (Alkari equivalent)**:
- Attacker: BC Mark III (level 3), vs Budgie Maneuver 2 + Racial +3 = defender_level 5
- Hit Chance: 50 + (3 - 5) × 10 = **30%**

See `combat-algorithm.md` Section 9-10 for full pseudocode implementation.
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

**Shield Regeneration Between Battles:**
- Shields regenerate 100% between battles
- At the start of each new combat, all ships have full shield effectiveness
- This applies whether the previous battle was won, lost, or the ship retreated
- Ships that retreat with damaged shields will have full shields in the next battle

**In-Battle Behavior:**
- Shields absorb damage before armor
- Don't regenerate during battle (unless special tech: Advanced Damage Control)
- Different shield classes have different HP/absorption values

**Implementation Note (Per-Hit Absorption Model):**
- MOO1-style shields use per-hit absorption rather than a depleting pool
- Each hit is absorbed up to the ship's Shield Class value
- Example: Shield Class V absorbs up to 5 damage per hit
- See `combat-algorithm.md` Section 11-12 for detailed shield mechanics

### Armor
- Second layer of defense
- Does NOT regenerate
- Damage is permanent until repaired
- Better armor = more HP per space

### Critical Hits (5% chance)
- Double damage (2×)
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
- **Hyperspace Comms Constraints**: Retreated ships travel back to the nearest friendly colony. Without Hyperspace Communications technology, retreating fleets cannot be redirected mid-flight and will take the full transit time to arrive.

**Enemy Retreat**:
- AI retreats when odds poor
- Aggressive races (Guinea Pigs) rarely retreat
- Defensive races (Hermit Crabs) retreat quickly

---

## Combat Experience

Ships gain experience through battles. In Hamster of Orion, a ship gains +1 Experience Point (XP) for every combat it survives.

**Experience Level Thresholds:**
- **Green (0 XP)**: New ships, -10% accuracy
- **Regular (1-2 XP)**: Standard ships, +0% accuracy
- **Veteran (3-9 XP)**: +10% accuracy, +1 Combat Speed
- **Elite (10-19 XP)**: +20% accuracy, +2 Combat Speed, +5% Critical Hit chance
- **Legendary (20+ XP)**: +30% accuracy, +3 Combat Speed, +10% Critical Hit chance, +1 Shield Absorption

**Race bonuses:**
- Budgies: Start at Veteran (3 XP)
- Ferrets: Gain experience 2x faster (+2 XP per combat)

**Merging Fleets (Averaging Experience):**
When two fleets merge, or when new ships join a stack of existing ships of the same design, the experience of the combined stack is calculated via a weighted average of total XP, rounded down to the nearest integer.

`Merged_XP = floor( ((Stack_A_Count × Stack_A_XP) + (Stack_B_Count × Stack_B_XP)) / (Stack_A_Count + Stack_B_Count) )`

The new experience level is then determined by the threshold for `Merged_XP`.

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
- Biological weapons: **Bio weapon math:** Kills 1 million population per bomb hit (1 pop unit) per turn. Does NOT damage factories or missile bases (preserves infrastructure). Highly effective but damages diplomatic relations.
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

### Maintenance Cost

Planetary defenses incur a strict maintenance cost each turn to remain operational.

```
Missile_Base_Maintenance = 5 BC per base per turn
Planetary_Shield_Maintenance = Shield_Class × 2 BC per turn
```

This maintenance is automatically deducted from the planet's Gross Production (before slider allocations). If the planet cannot pay the maintenance, the structures are temporarily disabled until production improves.

### Planetary Shield Interaction

- Missile bases benefit from Planetary Shields
- Planetary Shield absorbs X damage per bomb hit (Class V = 5, Class X = 10, etc.)
- Shields stack with base armor

### Edge Cases

- Bases cannot retreat
- Bases are destroyed when planet is captured
- Bases continue firing even if all ships retreat
- Multiple bases fire independently (no coordination bonus)

### Implementation Reference

**Combat Integration** (see `src/game/systems/combat.ts`):
- Use `initiateCombatWithBases()` to include missile bases in orbital combat
- `MissileBaseParticipant` interface defines base combat statistics
- Bases fire after all ships have acted each round via `missileBasesAct()`
- `checkVictory()` considers active missile bases as defenders

**Victory Conditions**:
- Combat is ongoing while missile bases remain (even if all ships destroyed/retreated)
- Attackers must destroy all bases to claim victory
- Bases are removed when planet is captured (not destroyed via combat HP)

---

## Fleet and Military Power

To assist AI decision making and UI representation, the game calculates `Fleet_Power` and `Military_Power`.

### Fleet Power Formula

```
Fleet_Power = Σ (Ship_Power × Ship_Count) for all ships in the fleet

Ship_Power = floor(
    (Hull_HP × Armor_Multiplier × 0.5) +
    (Total_Weapon_Damage × 2.0) +
    (Shield_Class × 5) +
    (Combat_Speed × 3)
) × (1.0 + (Ship_XP / 20))
```

### Military Power Formula

The overall `Military_Power` of an Empire represents their entire galactic footprint, combining all active fleets and planetary defenses:

```
Military_Power = Σ (Fleet_Power of all Empire Fleets) + Σ (Planet_Defense_Power of all Empire Planets)

Planet_Defense_Power = (Missile_Bases × 100) + (Planetary_Shield_Class × 50)
```

---

## Related Documents

- `combat-algorithm.md` - Full combat resolution pseudocode
- `../technology/force-fields.md` - Shield absorption values
- `components-complete.md` - All ship components
- `weapons-complete.md` - All weapon statistics
- `ship-design.md` - Ship design rules

---

Next: See `ship-design.md` for custom ship design.
