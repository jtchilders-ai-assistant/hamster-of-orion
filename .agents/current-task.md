# Current Task: research-system

## Task ID
research-system

## Name
Research and technology

## Description
Implement the research system per `design/technology/research-formulas.md`.

## Output Files
- `src/game/systems/research.ts` — Core research system (RP calculation, tech cost, field allocation, miniaturization, progress tracking)
- `src/data/technologies.json` — Tech tier cost table, research buildings config, racial modifiers, galaxy size modifiers, difficulty modifiers
- `test/game/systems/research.test.ts` — Unit tests

## Acceptance Criteria
1. **RP generation from scientists**: `calculatePlanetRP(planet, race, buildings)` returns correct RP using formula: `Scientists × 1.0 × Lab_Multiplier × Racial_Modifier × special_bonuses`
2. **Tech cost calculation**: `getTechCost(tier, galaxySize)` returns correct cost from tier table × galaxy size modifier; AI variant adds difficulty modifier
3. **Field allocation works**: `allocateResearch(totalRP, allocation)` splits RP correctly across the 6 fields, allocation must sum to 100%
4. **Research progress tracking**: `processResearchTurn(empire)` adds RP to progress, detects completion with overflow carry-over
5. **Miniaturization**: `getMiniaturizedStats(component, currentTier)` returns correct size/cost with 5%/tier reduction, capped at 50%
6. **Unit tests pass**: All worked examples from design doc verified, edge cases covered

## Key Formulas (from design/technology/research-formulas.md)

### Planet RP
```
Planet_RP = Scientists × 1.0 × Lab_Multiplier × Racial_Modifier
```
- Scientists = population × (research_slider / 100)
- Lab_Multiplier: cumulative from buildings (base 1.0, +0.5 Research Lab, +1.0 Supercomputer, +1.5 Autolab, +2.0 Galactic Cybernet)
- If planet.hasArtifacts: × 1.25
- If planet.isOrion: × 4.0

### Tech Cost
```
Player_Cost = Base_Tier_Cost × Galaxy_Size_Modifier
AI_Cost = Base_Tier_Cost × Galaxy_Size_Modifier × Difficulty_AI_Modifier
```
- Tier costs: 1→50, 2→80, 3→150, 4→250, 5→500, 6→800, 7→1500, 8→2500, 9→4000, 10→6000, ...20→100000
- Galaxy modifiers: small=0.75, medium=1.00, large=1.25, huge=1.50
- Difficulty AI modifiers: simple=1.50, easy=1.25, average=1.00, hard=0.75, impossible=0.50

### Miniaturization
```
Size_Reduction = min((currentTier - techTier) × 0.05, 0.50)
Miniaturized_Size = Base_Size × (1 - Size_Reduction)
Miniaturized_Cost = Base_Cost × (1 - Size_Reduction)
```
- Minimum 50% of base (never below 0.5× original)

### Field Allocation (6 fields)
- weapons, propulsion, construction, computers, force_fields, planetology
- Each field gets: Empire_Total_RP × (field_allocation_percent / 100)
- All allocations must sum to 100%

## Worked Examples to Verify

### Example 1: Basic RP
- Race: Hamsters (1.0×), pop=100, research_slider=30, buildings: [Research Lab, Supercomputer]
- Scientists: 30, Lab multiplier: 2.5×, RP: 75/turn

### Example 2: Rats Research
- Race: Rats (1.5×), pop=50, research_slider=40, buildings: [Research Lab, Supercomputer]
- Per planet: 20 × 1.0 × 2.5 × 1.5 = 75 RP

### Example 3: Miniaturization
- currentTier=12, techTier=5, baseSize=20, baseCost=15
- reduction = (12-5) × 0.05 = 0.35
- miniSize = 20 × 0.65 = 13, miniCost = 15 × 0.65 = 9.75

### Example 4: Tech Cost (Large Galaxy, Tier 10)
- baseCost=6000, galaxyMod=1.25 → actualCost=7500 RP

## Racial Modifiers
```
rats: 1.50, mice: 1.15, chameleons: 1.00, hamsters: 1.00, budgies: 1.00,
ferrets: 1.00, hermit_crabs: 1.00, rabbits: 0.90, ants: 0.90, guinea_pigs: 0.80
```

## Notes
- Review existing `src/game/systems/races.ts` and `src/game/state.ts` to understand GameState shape before adding research fields
- Add research-related fields to GameState if not present (e.g., `researchProgress`, `researchAllocation`, `currentResearch`, `completedTechs`, `currentTier`)
- `src/data/technologies.json` should contain static config (tier cost table, buildings, modifiers) 
- No DOM imports anywhere in `src/game/`
- No `any` types
