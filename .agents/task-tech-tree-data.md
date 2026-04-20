# Current Task: tech-tree-data

## Task ID
tech-tree-data

## Name
Full technology tree JSON

## Description
Complete all 6 tech fields from design docs: weapons.md, propulsion.md, construction.md, computers.md, force-fields.md, planetology.md. Each tech needs: id, name, field, tier, cost, unlocks[], description.

## Key References
- `design/technology/weapons.md`
- `design/technology/propulsion.md`
- `design/technology/construction.md`
- `design/technology/computers.md`
- `design/technology/force-fields.md`
- `design/technology/planetology.md`
- `src/data/components.json` — component IDs to reference in unlocks

## Output
`src/data/tech-tree.json`

## Acceptance Criteria
1. All 6 fields represented (weapons, propulsion, construction, computers, force_fields, planetology)
2. Tiers 1-50 with correct costs (base cost formula: tier^2 * 50 or as per design docs)
3. Unlocks reference component IDs from components.json
4. 150+ technologies total
5. Valid JSON with TypeScript types

## Tech Structure
```typescript
interface Technology {
  id: string;           // e.g., "laser_tech", "nuclear_engines"
  name: string;         // Display name
  field: TechField;     // "weapons" | "propulsion" | "construction" | "computers" | "force_fields" | "planetology"
  tier: number;         // 1-50
  cost: number;         // Research cost in RP
  unlocks: string[];    // Component IDs or building IDs this unlocks
  description: string;  // Flavor text / what it does
  prerequisite?: string; // Tech ID required before this one (if any)
}
```

## Tech Cost Formula (MOO1 style)
- Tier 1-5: tier * 50
- Tier 6-10: tier * 100
- Tier 11-20: tier * 200
- Tier 21-30: tier * 400
- Tier 31-40: tier * 800
- Tier 41-50: tier * 1600

## Example Technologies per Field
**Weapons:** laser → heavy_laser → gatling_laser → ion_cannon → ... → stellar_converter
**Propulsion:** nuclear_engines → sub_light → warp_1 → ... → warp_9
**Construction:** reduced_waste → auto_factories → ... → robotic_controls
**Computers:** battle_computer_1 → ECM_1 → ... → battle_computer_10
**Force Fields:** shield_1 → deflector_shields → ... → planetary_shield_XX
**Planetology:** terraforming_10 → enhanced_eco → ... → gaia_transformation

## Tests Required
Create `test/data/tech-tree.test.ts`:
- All 6 fields present
- Each tech has required fields (id, name, field, tier, cost, unlocks)
- Unlocks reference valid component IDs (cross-check with components.json)
- No duplicate tech IDs
- Tiers are positive integers
- Costs are positive and follow progression
- 150+ total technologies

## Output on Completion
Update `workflow-state.json`:
```json
{
  "state": "TESTING",
  "current_task": "tech-tree-data",
  "worker_output": {
    "files_created": ["src/data/tech-tree.json", "test/data/tech-tree.test.ts"],
    "files_modified": [],
    "tests_added": ["test/data/tech-tree.test.ts"],
    "summary": "..."
  }
}
```
