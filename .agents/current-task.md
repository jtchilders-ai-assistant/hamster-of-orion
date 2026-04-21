# Current Task: Combat resolution UI screen

**ID**: combat-resolution-ui
**Type**: ui
**Output**: src/ui/screens/CombatScreen.ts

## Description
Complete the CombatScreen to show tactical combat. Display hex grid with ships, allow unit selection, movement, and firing. Show damage numbers, explosions, and combat log.

## Design Documents (MUST READ)
- `design/ships/combat-algorithm.md` — Full combat resolution algorithm: hex grid, initiative, hit chance formula (Section 9-10), damage application (shields→armor→hull, Section 11), missiles, retreat, auto-resolve
- `design/ships/combat-mechanics.md` — High-level combat overview: turn structure, targeting/accuracy, range brackets, combat grid layout, stacked ships, planetary bombardment

**NOTE:** The wireframe file `design/ui-ux/wireframes/tactical-combat.md` does not exist. Use the combat algorithm and mechanics docs as primary references for UI layout and behavior.

## Key UI Requirements from Design Docs

### Grid & Layout
- Hex grid (20×20 small battles, 40×40 large battles)
- Ships positioned on hexes, stacks for same-design ships
- Range brackets: Point Blank (1 hex), Close (2-4), Medium (5-8), Long (9-15), Very Long (16+)

### Combat Flow to Display
1. **Initiative Phase** — Show turn order (faster ships first)
2. **Action Phase** — Each ship: movement, fire weapons, use specials
3. **Missile Phase** — Missiles move, show point defense intercepts
4. **End Phase** — Apply effects, regenerate, check victory

### Ship Selection & Actions
- Click ship to select → show movement range (hexes reachable based on combat_speed)
- Click hex to move selected ship
- Click enemy ship to fire → resolve attack, show hit/miss
- Show valid targets (in weapon range)

### Damage Display
- Damage numbers on hit (pop-up or floating text)
- Shield absorption vs hull damage distinction
- Ship explosion animation when destroyed
- Critical hit indicator

### Combat Log
- Scrolling text log of all actions
- "Round 1: Medium ship fires Fusion Beam at Large ship, hits for 12 damage"
- Missile launches, intercepts, retreats

### Additional UI
- **Auto-resolve button** — Skip to quick result (see Section 25.6 of combat-algorithm.md)
- **Retreat button** — Attempt fleet retreat (success chance displayed)
- Initiative/turn order display
- Current round number
- Fleet summaries (ships remaining, total HP)

## Acceptance Criteria
1. Hex grid renders with ships positioned
2. Click ship to select, show movement range
3. Click hex to move selected ship
4. Click enemy ship to fire
5. Damage numbers display on hit
6. Ships explode when destroyed
7. Combat log shows all actions
8. Auto-resolve button skips to result
9. Retreat button available

## Dependencies
- None (no blocking dependencies)

## Existing Code to Reference
Check existing combat system code in:
- `src/game/systems/combat/` — Combat engine implementation
- `src/ui/screens/` — Other screen implementations for patterns
- `src/ui/components/` — Reusable UI components
