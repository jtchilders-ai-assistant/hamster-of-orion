# Task: buildings-system

**Task ID:** buildings-system
**Phase:** phase4a-core-interactivity
**Dependencies:** buildings-data ✅
**Output:** `src/game/systems/buildings.ts`
**Tests:** `test/game/systems/buildings.test.ts`

## Description

Implement building construction via DEF slider. Queue management, completion, effects application.

## Acceptance Criteria

1. DEF slider allocates to building queue (missile bases, planetary shields, star gates)
2. Buildings complete when cost is met
3. Building effects apply (shields, missile bases, star gates)
4. Maintenance costs deducted each turn
5. Unit tests pass

## Context

### Game Design (MOO1-style)

MOO1 doesn't have discrete building queues. Infrastructure is built via the slider system.
However, the UI presents it as a queue-like system on the PlanetScreen.

**Key building types:**
- **Factories** — Built via IND slider, cost ~10 BC, produces 1 BC/turn each (already handled by `production.ts`'s `buildFactories()`)
- **Missile Bases** — Built via DEF slider, cost ~150 BC, defends planet. Fires missiles matching best researched tech.
- **Planetary Shields** — Built via DEF slider after missile bases. Classes V/X/XV/XX, costs 500/1000/2000/3000 BC. Absorbs bombardment damage.
- **Star Gate** — Special project, 3000 BC, requires Intergalactic Star Gates tech.
- **Terraforming** — Built via ECO slider after pollution cleared (handled in `production.ts`'s `processEcoPhases()`)

### State Types (from `src/game/state.ts`)

- `Planet.buildings: BuildingId[]` — list of building IDs on the planet
- `Planet.missileBases: number` — count of missile bases
- `Planet.maxMissileBases: number`
- `Planet.planetaryShield: number` — shield absorption value
- `Planet.buildQueue: BuildQueueItem[]` — existing queue with types: `'ship' | 'building' | 'defense' | 'industry'`
- `Building` type — defined in state.ts with id, name, category, cost, maintenance, effects, etc.

### Building Data

Building definitions are in `src/data/buildings.json`. Example:
- `missile_base`: category "defense", cost 150 BC, built via DEF slider
- `planetary_shield_5`: cost 500 BC, maintenance 5, absorbs 5 damage
- `planetary_shield_10`: cost 1000 BC, maintenance 10, absorbs 10 damage
- `star_gate`: cost 3000 BC, maintenance 2, requires Intergalactic Star Gates tech

### Production System (existing `src/game/systems/production.ts`)

Already handles:
- Factory construction via IND slider (`buildFactories()`)
- Slider allocation (`allocateSliders()`)
- ECO phases including terraforming (`processEcoPhases()`)

**This task adds:** DEF slider allocation for missile bases and planetary shields, and general building queue processing.

### Code Patterns to Follow

- Pure functions, no DOM, no side effects
- State is passed in, returns new state (or mutation-returning functions for reducer use)
- Follows existing test patterns using vitest
- Import state types from `../state`
- Use `Math.floor()` for integer BC

### Design Doc

See `design/planets/buildings.md` for full mechanics.

## Implementation Plan

### 1. Building Data Loader

```typescript
export interface BuildingDef {
  id: string;
  cost: number;
  maintenance: number;
  effects: Record<string, unknown>;
  builtVia: 'defense_slider' | 'industry_slider' | 'special';
  techRequired?: string | null;
  shieldAbsorption?: number;
  category: string;
}
```

Load from `src/data/buildings.json`.

### 2. Building Queue Processing

```typescript
export interface BuildResult {
  buildingId: string;
  completed: boolean;
  progress: number;
  costSpent: number;
  overflow: number;
}

export function processBuildingQueue(
  planet: Planet,
  bcAvailable: number,
  defs: Record<string, BuildingDef>,
  completedTechs: string[],
): { planet: Planet; result: BuildResult };
```

Process the build queue from front to back:
1. Check tech requirements
2. Add BC to current build
3. If cost met, complete building (update planet state, deduct maintenance)
4. Return progress for remaining items

### 3. DEF Slider to Building Queue

```typescript
export function allocDefToBuildings(
  planet: Planet,
  defenseBc: number,
  defs: Record<string, BuildingDef>,
  completedTechs: string[],
): { queueItems: BuildingQueueItem[]; remainingBC: number };
```

Auto-populate build queue with the highest-priority building the planet needs:
1. Missile bases (if below maxMissileBases)
2. Planetary shields (if tech available)
3. Star gates (if tech available and no gate yet)

### 4. Maintenance Processing

```typescript
export function processBuildingMaintenance(
  planet: Planet,
  defs: Record<string, BuildingDef>,
): { totalMaintenance: number; buildingsAtRisk: string[] };
```

Deduct maintenance BC from planet's credits. Track buildings that can't be maintained.

### 5. Building Effects Application

```typescript
export function applyBuildingEffects(
  planet: Planet,
  defs: Record<string, BuildingDef>,
): Planet;
```

Apply effects when buildings are constructed:
- Missile bases increment `planet.missileBases`
- Planetary shields set `planet.planetaryShield` to absorption value
- Other effects as defined

### 6. Tests

Write comprehensive tests in `test/game/systems/buildings.test.ts`:
- DEF slider queue building missile bases
- Shield construction after tech requirement met
- Maintenance deduction
- Queue ordering (missile base before shield)
- Tech requirement enforcement
- Star gate construction
- Multiple turns progress tracking
