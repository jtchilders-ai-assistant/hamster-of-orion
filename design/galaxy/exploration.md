# Exploration Mechanics

## Overview
The galaxy starts covered in fog of war. Send scouts to reveal star systems, find planets, and discover opportunities.

---

## Fog of War

**Unexplored Systems**: Black, no information
**Explored Systems**: Visible, planet data known
**Owned Systems**: Full visibility within scanner range

**Scanner Range** (M3 canonical definition):
- Base range: **2 parsecs** from every owned colony (passive empire-wide sensor)
- Scanner range is **not** affected by fuel cells or fuel tank components — those extend ship travel range only
- Scanner range is improved by **Computers field** technologies (e.g., Deep Space Scanner, Subspace Scanner)
- Extended Range / Reserve Fuel Tanks add to ship travel range, not scanner range

| Technology (Computers Field) | Scanner Range |
|------------------------------|---------------|
| None (base)                  | 2 parsecs     |
| Deep Space Scanner           | 4 parsecs     |
| Subspace Scanner             | 6 parsecs     |
| Deep Space Scanner II        | 8 parsecs     |

See `technology/computers.md` for scanner tech details.

---

## Scout Ships

**Role**: Exploration vessels
**Speed**: Fast (prioritize propulsion tech)
**Combat**: Weak (flee from threats)
**Cost**: Cheap

**Scout Loadout**:
- Best engine available
- Extended/Reserve Fuel Tanks (for range)
- NO weapons (waste of space)
- Possibly ECM (survival)

**Strategy**:
- Build several early game
- Fan out in all directions
- Prioritize nearest systems first
- Explore systematically outward

---

## System Discovery

**First Contact**:
1. Scout enters unexplored system
2. System revealed on map
3. Star type identified
4. Planet scanned (basic info)
5. Scout can continue or return

**Information Gained**:
- Planet type (Terran, Arid, Barren, etc.)
- Planet size (population capacity range)
- Special features (Artifacts, Rich/Poor minerals)
- Whether hostile presence exists

---

## Exploration Priority

**Turn 1-10**: Immediate vicinity
- Find nearby colonizable planets
- Identify threats
- Establish safe expansion zone

**Turn 10-30**: Expansion targets
- Find best planets within fuel range
- Identify chokepoints
- Locate enemy positions

**Turn 30+**: Deep space
- Map entire galaxy
- Find Artifacts worlds
- Locate Orion system
- Identify invasion routes

---

## Colonization Window

**Race for Planets**: First colony ship wins
- Scout finds planet
- Rush colony ship before enemy
- Plant flag, claim system

**Contested Systems**:
- Both empires can reach
- Diplomatic tension
- Often triggers first conflicts

---

## Artifacts Worlds

**Ancient Technology Sites** (randomly placed during galaxy generation). Colonizing an Artifacts world provides **two distinct bonuses** (M2 clarification):

**1. One-Time Tech Unlock (upon colonization)** ✔️ Implemented
- Immediately grants a random technology from any field
- Could be a tech you already own — in that case, no benefit
- Could be an advanced tech from any field — potentially a major advantage
- This fires exactly once per planet; reconquering does not re-trigger it
- Tracked via `planet.artifactsTechClaimed` flag
- Implementation: `src/game/systems/colonization.ts` — `grantArtifactsTechBonus()`

**2. Ongoing RP Multiplier (persistent)** ✔️ Implemented
- While the planet remains under your control, all RP generated there is multiplied by 1.25 (+25%)
- Lost permanently if the planet is conquered or bombed to zero population
- The Artifacts site is considered destroyed by orbital bombardment
- Implementation: `src/game/systems/research.ts` applies the multiplier

See `technology/research-formulas.md` §4 for the RP bonus formula.

**Strategy**: Prioritize colonizing Artifacts worlds early — both the immediate tech unlock and the long-term RP bonus compound over time.

---

## Space Monsters (Random Events)

Space monsters appear as random events after Turn 100. Implementation: `src/game/systems/events.ts`

### Cosmic Blob (Space Amoeba)
- **HP**: 500, **Attack/Defense**: 4/4
- **Beam Damage**: 10-40
- **Regeneration**: 15 HP per combat round
- **Movement**: 2 hexes per turn (roaming)
- **Reward**: Biotechnology field +50% research bonus for 10 turns, 200-500 BC

### Crystal Horror (Space Crystal)
- **HP**: 400, **Attack/Defense**: 6/8
- **Beam Damage**: 15-50
- **Beam Reflection**: 25% of beam damage reflected to attacker
- **Movement**: 3 hexes per turn (roaming)
- **Reward**: Construction field +25% research bonus for 10 turns, 300-600 BC

### Void Wyrm (Guardian variant)
- **HP**: 750, **Attack/Defense**: 8/6
- **Beam Damage**: 30-100
- **Movement**: 4 hexes per turn (guards treasure location)
- **Reward**: 2-4 random techs, 500-1000 BC, 25% chance of artifact

**Defeating Monsters**:
- Monster guards a planet until defeated
- Requires significant fleet strength
- Reward: Planet becomes safe to colonize + field-specific bonuses

**Strategy**: Avoid until fleet strong enough; Crystal Horror reflects beam weapons

---

## Guardian of Orion

**Special Case** (not a random event):
- Always present at Orion system
- Extremely powerful automated warship
- Guards the Orion planet and ancient technology

**Defeating the Guardian**:
- Requires late-game fleet
- Reward: Access to Orion colony + advanced technologies
- Major strategic milestone

See `space-regions.md` for more on the Orion system.

---

## Random Events Affecting Exploration

Random events are implemented in `src/game/systems/events.ts` and configured in `src/data/events.json`. Event processing occurs during the Events phase (Phase 9) of each turn via `processRandomEvents()`.

**Implementation Notes:**
- Events are NOT generated in the galaxy generator; they occur dynamically during gameplay
- Event probability: 3% base + 0.1% per turn, capped at 15%
- Minimum turns between same event: 20 turns
- Multi-turn events (plague, comet, supernova) are tracked in `state.activeEvents`

These events can occur during the game:

**Beneficial**:
- Ancient Derelict: Free technology discovery (choice: salvage for BC or board for tech chance)
- Fertile Planet: Planet becomes more habitable
- Mineral-Rich Planet: Planet gains Rich status
- Donation: Receive bonus credits

**Harmful**:
- Comet: 5-turn countdown, 1000 HP, destroys colony on impact (can be shot down by fleet)
- Depleted Planet: Planet loses mineral richness
- Plague: 3-5 turns, 10-20% pop loss/turn, 25% spread chance (mitigated by Bio Toxin Antidote)
- Supernova: 5-turn warning, destroys all planets/ships in system
- Computer Virus: 3-6 turns, reduces research/production (mitigated by ECM Jammer V)
- Earthquake: Destroys factories
- Industrial Accident: Damages production
- Piracy: Lose credits to space pirates

**Diplomatic**:
- Diplomatic Blunder: Relations worsen with random race

**Note**: Random events can be disabled in game setup.

See `game-mechanics/random-events.md` for full event specifications.

---

## Exploration Hazards

**Nebulae**: 
- Shields don't work in nebula combat
- Extra danger when fighting in nebulae

**Enemy Territory**:
- Ships may be attacked
- Need to scout enemy strength before invading

---

## Strategic Scouting by Race

**Budgies**: Fast ships = excellent scouts
**Chameleons**: Could theoretically cloak scouts (if researched)
**Rabbits**: High growth = many cheap scouts
**Rats**: Research better propulsion quickly

---

## Discovery Milestones

**Milestone 1**: Home region mapped (Turn 5-10)
**Milestone 2**: Enemy homeworld located (Turn 15-25)
**Milestone 3**: Artifacts worlds found (varies)
**Milestone 4**: Orion discovered (Turn 50-80)
**Milestone 5**: Full galaxy mapped (Turn 80-120)

---

Next: See `travel.md` for movement mechanics.
