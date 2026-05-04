# Current Task: Fix 16 issues in src/game/systems/combat.ts for ships

**ID**: fix-1
**Severity**: high
**Type**: mismatch
**Source Files**: src/game/systems/combat.ts

## Description
[high] design/ships/combat-algorithm.md: Hit_Chance = 50 + (Effective_Attacker_Level - Effective_Defender_Level) × 10
[high] design/ships/weapons-complete.md: Hellfire Torpedo: MOO1 fires 4 separate 25-damage attacks per hit (100 damage total). Each attack resolved independently through shields.
[high] design/ships/combat-algorithm.md: Boarding mechanics: Sections 36-43 detail transporter boarding with success formula, casualties, and ship capture
[medium] design/ships/combat-algorithm.md: Missile fuel: 'remaining_fuel: 2 # MOO1: ship-launched missiles self-destruct after 2 turns'
[medium] design/ships/combat-algorithm.md: Critical Hit System: 5% base chance, +5% if Elite, +10% if Death Ray. Double damage + 50% system damage chance.
[medium] design/ships/combat-algorithm.md: Crew loss penalties: <= 25% skeleton_crew (-20% accuracy, half speed, 50% weapon failure), <= 50% undermanned (-10% accuracy, speed -1)
[medium] design/ships/combat-algorithm.md: Base crew by hull: Small=20, Medium=60, Large=200, Huge=500
[medium] design/ships/combat-algorithm.md: Initiative formula: Ship_Initiative = Base_Initiative(10) + Engine_Maneuver × 2 + Battle_Scanner(+3) + Racial + Experience + roll(1,6)
[medium] design/ships/combat-algorithm.md: Cloaking: +5 defense when cloaked, applies to effective defender level in hit chance formula
[medium] design/ships/combat-mechanics.md: Budgies: +3 Defense Level, +3 Initiative, +20% Evasion
[medium] design/ships/combat-mechanics.md: Anti-Missile Rockets: destroys 40% of incoming missiles (−1% per missile tech level)
[low] design/ships/combat-algorithm.md: MOO1 damage-mapped-to-roll: 'A roll exactly at the hit threshold = minimum damage. A roll of 100 = maximum damage.'
[low] N/A: getDifficultyLevel combat modifiers (getCombatAttackModifier, getCombatDefenseModifier) - difficulty scaling is implemented but not detailed in combat design docs (not in design)
[low] N/A: Black Hole Generator implementation with d4 roll for 25-100% destruction - referenced in special-systems.md but implementation details (penaltyPerShield, cooldown) aren't in the ships design docs (not in design)
[low] N/A: High Energy Focus one-time +1 attack rating bonus - mentioned in components but combat behavior not detailed in algorithm doc (not in design)
[low] N/A: activateDisplacementDevice() as an active ability (removes ship for 1 round) vs the passive 33% hit avoidance - design only mentions passive avoidance (not in design)

## Design Documents (MUST READ)
- design/ships/combat-algorithm.md — primary design doc for combat mechanics
- design/ships/weapons-complete.md — weapon specifications
- design/ships/combat-mechanics.md — combat mechanics details

## Acceptance Criteria
1. Code changes align with design specification
2. npm run typecheck passes
3. npm run test passes
4. npm run check-design passes
