/**
 * Unit tests for the 6-design ship limit enforced in rootReducer ADD_SHIP_DESIGN.
 *
 * Design reference: design/ships/ship-design.md
 * Fix: ORION-FIX-011
 */

import { describe, it, expect } from 'vitest';
import { rootReducer } from '../../../src/game/reducer';
import { initialState } from '../../../src/game/initialState';
import type { GameState, ShipDesign, EmpireId } from '../../../src/game/state';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeDesign(id: string): ShipDesign {
  return {
    id,
    name: `Design ${id}`,
    class: 'small',
    ownerId: 'player' as EmpireId,
    size: 25,
    spaceUsed: 0,
    spaceFree: 25,
    components: [],
    stats: {
      cost: 6,
      maintenance: 0,
      hp: 3,
      shieldHp: 0,
      speed: 1,
      range: 2,
      weapons: [],
      defense: { armor: 0, shields: 0, ecm: 0 },
      special: [],
    },
    miniaturization: {},
    isObsolete: false,
    shipsBuilt: 0,
  };
}

/** Build a base state with a player empire and the given ship design IDs already registered. */
function stateWithDesigns(designIds: string[]): GameState {
  const designs = designIds.map(makeDesign);
  const byId = Object.fromEntries(designs.map((d) => [d.id, d]));

  return {
    ...initialState,
    empires: {
      byId: {
        player: {
          id: 'player' as EmpireId,
          raceId: 'human',
          name: 'Human Empire',
          isPlayer: true,
          credits: 500,
          creditPerTurn: 30,
          planets: [],
          fleets: [],
          shipDesigns: [...designIds],
          research: {
            currentTech: null,
            researchPoints: 0,
            researchPerTurn: 20,
            completedTechs: [],
            availableTechs: {
              weapons: [],
              propulsion: [],
              construction: [],
              computers: [],
              force_fields: [],
              biotechnology: [],
            },
            miniaturization: {},
            stolenTechs: [],
          },
          relations: {},
          isDefeated: false,
          defeatedTurn: null,
        },
      },
      allIds: ['player'],
      playerId: 'player',
    },
    shipDesigns: {
      byId,
      allIds: [...designIds],
    },
  };
}

function addDesign(state: GameState, design: ShipDesign): GameState {
  return rootReducer(state, { type: 'ADD_SHIP_DESIGN', payload: { design } });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('ADD_SHIP_DESIGN — 6-design limit (ORION-FIX-011)', () => {
  it('allows adding the 1st through 6th design', () => {
    let state = stateWithDesigns([]);
    for (let i = 1; i <= 6; i++) {
      const design = makeDesign(`design_${i}`);
      state = addDesign(state, design);
      expect(state.empires.byId['player'].shipDesigns).toHaveLength(i);
      expect(state.shipDesigns.allIds).toHaveLength(i);
    }
  });

  it('blocks adding a 7th NEW design — state is unchanged', () => {
    const state = stateWithDesigns(['d1', 'd2', 'd3', 'd4', 'd5', 'd6']);
    const before = state.empires.byId['player'].shipDesigns.length;

    const newDesign = makeDesign('d7');
    const after = addDesign(state, newDesign);

    expect(after.empires.byId['player'].shipDesigns).toHaveLength(before);
    expect(after.shipDesigns.allIds).not.toContain('d7');
    // State reference should be unchanged (same object returned)
    expect(after).toBe(state);
  });

  it('allows overwriting an existing design when at the 6-design limit', () => {
    const state = stateWithDesigns(['d1', 'd2', 'd3', 'd4', 'd5', 'd6']);

    // Overwrite d3 with a modified version (same ID)
    const updated = { ...makeDesign('d3'), name: 'Updated Design' };
    const after = addDesign(state, updated);

    // Count stays at 6
    expect(after.empires.byId['player'].shipDesigns).toHaveLength(6);
    // The updated design is in state
    expect(after.shipDesigns.byId['d3'].name).toBe('Updated Design');
  });

  it('allows adding to exactly 5 designs (boundary)', () => {
    const state = stateWithDesigns(['d1', 'd2', 'd3', 'd4', 'd5']);
    const after = addDesign(state, makeDesign('d6'));
    expect(after.empires.byId['player'].shipDesigns).toHaveLength(6);
    expect(after.shipDesigns.allIds).toContain('d6');
  });

  it('blocks at exactly 6 designs (boundary off-by-one check)', () => {
    const state = stateWithDesigns(['d1', 'd2', 'd3', 'd4', 'd5', 'd6']);
    const after = addDesign(state, makeDesign('d7'));
    expect(after.empires.byId['player'].shipDesigns).toHaveLength(6);
  });
});
