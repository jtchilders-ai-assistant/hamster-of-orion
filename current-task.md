# Current Task: fix-2 — Technology Issues in Combat

**ID**: fix-2
**Severity**: high
**Type**: mismatch
**Source Files**: src/game/systems/combat.ts
**Issue Count**: 14

## Description
Fix 14 design-vs-code consistency issues in combat.ts related to technology implementations:

1. **Ion Stream Projector** — Deals 20% of target's current HP as damage (design/technology/weapons.md)
2. **Zyro Shield** — 75% chance to destroy incoming missiles − 1% per missile tech level (design/technology/force-fields.md)
3. **Lightning Shield** — 100% chance to destroy incoming missiles − 1% per missile tech level (design/technology/force-fields.md)
4. **Energy Pulsar** — 5 damage to all adjacent ships + 1 damage per 2 firing ships (design/technology/propulsion.md)
5. **Ionic Pulsar** — 10 damage to all adjacent ships + 1 damage per 2 firing ships (design/technology/propulsion.md)
6. **Stasis Field** — Ship cannot move, fire, or retreat (design/technology/force-fields.md)
7. **Repulsor Beam** — Push enemy ships 2 hexes away (design/technology/force-fields.md)
8. **Cloaking Device** — +5 Defense, invisible until firing (design/technology/force-fields.md)
9. **Anti-Missile Rockets** — Point defense destroys 40% of incoming missiles (design/technology/weapons.md)
10. **Hit_Chance formula** — 50% + (Attack_Rating × 5%) - (Target_Defense × 3%) (design/technology/computers.md)

Plus 4 "not in design" extra features to document or remove.

## Design Documents (MUST READ)
- `design/technology/weapons.md` — Ion Stream, Anti-Missile Rockets
- `design/technology/force-fields.md` — Zyro Shield, Lightning Shield, Stasis, Repulsor, Cloaking
- `design/technology/propulsion.md` — Energy/Ionic Pulsars
- `design/technology/computers.md` — Hit Chance formula

## Acceptance Criteria
1. Code changes align with design specification
2. `npm run typecheck` passes
3. `npm run test` passes
4. Write `verification-result.json` with summary
