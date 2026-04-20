# Current Task: combat-engine

## Task ID
combat-engine

## Name
Tactical combat engine

## Description
Combat resolution engine per design/ships/combat-algorithm.md. Hex grid, initiative, movement, firing, damage resolution. Start with auto-resolve; manual control later.

## Key References
- `design/ships/combat-algorithm.md` — combat formulas
- `src/data/components.json` — weapon damage, shields, etc.
- `src/game/types/shipComponents.ts` — component effect types
- `src/game/state.ts` — Ship, Fleet types

## Output
`src/game/systems/combat.ts`

## Acceptance Criteria
1. `initiateCombat(attackerFleet, defenderFleet)` creates combat state
2. `processRound(combatState)` handles one combat round
3. Damage formula matches MOO1: `hitChance = 50 + (attackRating - defenseRating) * 5` (clamped 5-95%)
4. Shields absorb before HP (shield absorption value per hit)
5. Combat ends when one side eliminated or retreats
6. Returns victor and losses
7. Unit tests pass — no DOM imports

## Combat Flow (per round)
1. Initiative: sort ships by speed (engine combat speed)
2. For each ship in initiative order:
   a. Select target (lowest HP enemy, or random)
   b. For each weapon:
      - Roll hit: d100 <= hitChance
      - If hit: damage = weapon damage roll (min-max for beams, fixed for missiles)
      - Apply shields: damage = max(0, damage - shieldAbsorption)
      - Apply to HP
   c. Remove destroyed ships
3. Check victory conditions

## CombatState Interface
```typescript
interface CombatState {
  attackerShips: CombatShip[];
  defenderShips: CombatShip[];
  round: number;
  log: CombatLogEntry[];
  status: 'ongoing' | 'attacker_wins' | 'defender_wins' | 'draw';
}

interface CombatShip {
  id: string;
  designId: string;
  hp: number;
  maxHp: number;
  shields: number;  // current shield absorption
  weapons: WeaponInstance[];
  attackRating: number;
  defenseRating: number;
  speed: number;
}
```

## Tests Required
Create `test/game/systems/combat.test.ts`:
- initiateCombat creates valid state from fleets
- processRound reduces HP when hits land
- Shields absorb damage before HP
- Ships removed when HP <= 0
- Combat ends when all ships on one side destroyed
- Hit chance formula correct (50 + diff*5, clamped 5-95)
- Returns correct victor
- Handles retreat (if implemented)

## Output on Completion
Update `workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "combat-engine",
  "worker_output": {
    "files_created": ["src/game/systems/combat.ts", "test/game/systems/combat.test.ts"],
    "files_modified": [],
    "tests_added": ["test/game/systems/combat.test.ts"],
    "summary": "..."
  }
}
```
