/**
 * SELECT_SYSTEM action tests.
 * test/game/actions/selectSystem.test.ts
 */

import { describe, it, expect } from 'vitest';
import { rootReducer } from '../../../src/game/reducer';
import { GameState } from '../../../src/game/state';
import { initialState } from '../../../src/game/initialState';

const baseState: GameState = {
  ...initialState,
  ui: {
    ...initialState.ui,
    selectedSystem: null,
    selectedPlanet: null,
    selectedFleet: null,
  },
};

describe('SELECT_SYSTEM action', () => {
  it('sets selectedSystem when a valid ID is dispatched', () => {
    const result = rootReducer(baseState, {
      type: 'SELECT_SYSTEM',
      payload: { systemId: 'sys_001' },
    });
    expect(result.ui.selectedSystem).toBe('sys_001');
  });

  it('clears selectedSystem when null is dispatched', () => {
    const stateWithSelection: GameState = {
      ...baseState,
      ui: { ...baseState.ui, selectedSystem: 'sys_001' },
    };
    const result = rootReducer(stateWithSelection, {
      type: 'SELECT_SYSTEM',
      payload: { systemId: null },
    });
    expect(result.ui.selectedSystem).toBeNull();
  });

  it('clears selectedPlanet on system change', () => {
    const stateWithPlanet: GameState = {
      ...baseState,
      ui: { ...baseState.ui, selectedSystem: 'sys_001', selectedPlanet: 'pla_001' },
    };
    const result = rootReducer(stateWithPlanet, {
      type: 'SELECT_SYSTEM',
      payload: { systemId: 'sys_002' },
    });
    expect(result.ui.selectedSystem).toBe('sys_002');
    expect(result.ui.selectedPlanet).toBeNull();
  });

  it('clears selectedFleet on system change', () => {
    const stateWithFleet: GameState = {
      ...baseState,
      ui: { ...baseState.ui, selectedSystem: 'sys_001', selectedFleet: 'flt_001' },
    };
    const result = rootReducer(stateWithFleet, {
      type: 'SELECT_SYSTEM',
      payload: { systemId: 'sys_002' },
    });
    expect(result.ui.selectedFleet).toBeNull();
  });

  it('does not change other state properties', () => {
    const result = rootReducer(baseState, {
      type: 'SELECT_SYSTEM',
      payload: { systemId: 'sys_001' },
    });
    expect(result.turn).toBe(baseState.turn);
    expect(result.year).toBe(baseState.year);
    expect(result.ui.currentScreen).toBe(baseState.ui.currentScreen);
  });

  it('allows re-selecting the same system', () => {
    const stateWithSelection: GameState = {
      ...baseState,
      ui: { ...baseState.ui, selectedSystem: 'sys_001' },
    };
    const result = rootReducer(stateWithSelection, {
      type: 'SELECT_SYSTEM',
      payload: { systemId: 'sys_001' },
    });
    expect(result.ui.selectedSystem).toBe('sys_001');
  });
});
