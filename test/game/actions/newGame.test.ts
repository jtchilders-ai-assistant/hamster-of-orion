/**
 * New game action tests.
 * test/game/actions/newGame.test.ts
 */

import { describe, it, expect } from 'vitest';
import { startGame, newGameReducer, NewGameOptions } from '../../../src/game/actions/newGame';
import { GameState } from '../../../src/game/state';
import { initialState } from '../../../src/game/initialState';

const baseOptions: NewGameOptions = {
  galaxySize: 'small',
  opponents: 3,
  difficulty: 'normal',
  galaxyAge: 'average',
  raceId: 'hamsters',
  empireColor: '#ff0000',
  emperorName: 'Lord Whiskers',
  homeworldName: 'New Hamsteria',
  seed: 12345,
};

describe('START_GAME action creator', () => {
  it('creates a START_GAME action with payload', () => {
    const action = startGame(baseOptions);
    expect(action.type).toBe('START_GAME');
    expect(action.payload).toEqual(baseOptions);
  });
});

describe('newGameReducer', () => {
  it('returns state unchanged for unrelated actions', () => {
    const result = newGameReducer(initialState, { type: 'UNKNOWN' });
    expect(result).toBe(initialState);
  });

  it('produces a state with galaxy systems populated', () => {
    const action = startGame(baseOptions);
    const state: GameState = newGameReducer(initialState, action);
    expect(state.galaxy.systems.allIds.length).toBeGreaterThan(0);
  });

  it('sets currentScreen to galaxy', () => {
    const action = startGame(baseOptions);
    const state: GameState = newGameReducer(initialState, action);
    expect(state.currentScreen).toBe('galaxy');
  });

  it('creates player empire with correct raceId', () => {
    const action = startGame(baseOptions);
    const state: GameState = newGameReducer(initialState, action);
    const player = state.empires.byId[state.empires.playerId];
    expect(player).toBeDefined();
    expect(player.raceId).toBe(baseOptions.raceId);
    expect(player.isPlayer).toBe(true);
  });

  it('sets emperor name on player empire', () => {
    const action = startGame(baseOptions);
    const state: GameState = newGameReducer(initialState, action);
    const player = state.empires.byId[state.empires.playerId];
    expect(player.name).toBe(baseOptions.emperorName);
  });

  it('creates correct number of AI empires', () => {
    const action = startGame(baseOptions);
    const state: GameState = newGameReducer(initialState, action);
    const aiEmpireIds = state.empires.allIds.filter((id) => id !== state.empires.playerId);
    expect(aiEmpireIds.length).toBe(baseOptions.opponents);
  });

  it('all AI empires have aiEmpires entries', () => {
    const action = startGame(baseOptions);
    const state: GameState = newGameReducer(initialState, action);
    const aiIds = state.empires.allIds.filter((id) => id !== state.empires.playerId);
    for (const id of aiIds) {
      expect(state.aiEmpires[id]).toBeDefined();
    }
  });

  it('player is not listed in aiEmpires', () => {
    const action = startGame(baseOptions);
    const state: GameState = newGameReducer(initialState, action);
    expect(state.aiEmpires[state.empires.playerId]).toBeUndefined();
  });

  it('sets difficulty from options', () => {
    const action = startGame({ ...baseOptions, difficulty: 'hard' });
    const state: GameState = newGameReducer(initialState, action);
    expect(state.difficulty).toBe('hard');
  });

  it('sets galaxy size from options', () => {
    const action = startGame(baseOptions);
    const state: GameState = newGameReducer(initialState, action);
    expect(state.galaxy.size).toBe(baseOptions.galaxySize);
  });

  it('starts at turn 1 year 2624 (per design/game-mechanics/turn-structure.md)', () => {
    const action = startGame(baseOptions);
    const state: GameState = newGameReducer(initialState, action);
    expect(state.turn).toBe(1);
    expect(state.year).toBe(2624); // 2623 + 1
  });

  it('planets are populated', () => {
    const action = startGame(baseOptions);
    const state: GameState = newGameReducer(initialState, action);
    expect(state.planets.allIds.length).toBeGreaterThan(0);
  });

  it('player empire has a homeworld system assigned in galaxy', () => {
    const action = startGame(baseOptions);
    const state: GameState = newGameReducer(initialState, action);
    const homeSystemId = state.galaxy.homeSystemIds[state.empires.playerId];
    expect(homeSystemId).toBeDefined();
    expect(state.galaxy.systems.byId[homeSystemId]).toBeDefined();
  });

  it('renames homeworld system to homeworldName', () => {
    const action = startGame(baseOptions);
    const state: GameState = newGameReducer(initialState, action);
    const homeSystemId = state.galaxy.homeSystemIds[state.empires.playerId];
    const homeSystem = state.galaxy.systems.byId[homeSystemId];
    expect(homeSystem.name).toBe(baseOptions.homeworldName);
  });

  it('works with 1 opponent (minimum)', () => {
    const action = startGame({ ...baseOptions, opponents: 1 });
    const state: GameState = newGameReducer(initialState, action);
    const aiIds = state.empires.allIds.filter((id) => id !== state.empires.playerId);
    expect(aiIds.length).toBe(1);
  });

  it('works with a different galaxy size (medium)', () => {
    const action = startGame({ ...baseOptions, galaxySize: 'medium', opponents: 2 });
    const state: GameState = newGameReducer(initialState, action);
    expect(state.galaxy.size).toBe('medium');
    expect(state.galaxy.systems.allIds.length).toBeGreaterThan(0);
  });
});
