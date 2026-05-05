// @vitest-environment jsdom
/**
 * TurnConfirmDialog unit tests
 * test/ui/components/TurnConfirmDialog.test.ts
 *
 * Per design/ui-ux/state-transitions.md §3.3:
 *   - Shows when player presses Enter/End Turn AND confirmEndTurn = true
 *   - "Don't show" checkbox toggles confirmEndTurn setting
 *   - Cancel closes without dispatching NEXT_TURN
 *   - Confirm dispatches NEXT_TURN and closes
 *   - SET_CONFIRM_END_TURN action updates settings.confirmEndTurn
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStore } from '../../../src/game/store';
import { rootReducer } from '../../../src/game/reducer';
import { TurnConfirmDialog } from '../../../src/ui/components/TurnConfirmDialog';
import { initialState } from '../../../src/game/initialState';

function makeStore() {
  return createStore(rootReducer, structuredClone(initialState));
}

describe('TurnConfirmDialog', () => {
  beforeEach(() => {
    // Clean up any dialogs left from previous tests
    document.querySelectorAll('.turn-confirm-overlay').forEach((el) => el.remove());
  });

  it('isOpen() returns false before show()', () => {
    const store = makeStore();
    const dialog = new TurnConfirmDialog(store);
    expect(dialog.isOpen()).toBe(false);
  });

  it('isOpen() returns true after show()', () => {
    const store = makeStore();
    const dialog = new TurnConfirmDialog(store);
    dialog.show(() => {});
    expect(dialog.isOpen()).toBe(true);
    dialog.remove();
  });

  it('isOpen() returns false after remove()', () => {
    const store = makeStore();
    const dialog = new TurnConfirmDialog(store);
    dialog.show(() => {});
    dialog.remove();
    expect(dialog.isOpen()).toBe(false);
  });

  it('renders the dialog in the DOM when shown', () => {
    const store = makeStore();
    const dialog = new TurnConfirmDialog(store);
    dialog.show(() => {});
    expect(document.querySelector('.turn-confirm-overlay')).not.toBeNull();
    dialog.remove();
  });

  it('removes dialog from DOM on remove()', () => {
    const store = makeStore();
    const dialog = new TurnConfirmDialog(store);
    dialog.show(() => {});
    dialog.remove();
    expect(document.querySelector('.turn-confirm-overlay')).toBeNull();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const store = makeStore();
    const dialog = new TurnConfirmDialog(store);
    const onConfirm = vi.fn();
    dialog.show(onConfirm);

    const btn = document.querySelector<HTMLButtonElement>('[data-testid="turn-confirm-end-turn"]');
    expect(btn).not.toBeNull();
    btn!.click();

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(dialog.isOpen()).toBe(false);
  });

  it('does NOT call onConfirm when cancel button is clicked', () => {
    const store = makeStore();
    const dialog = new TurnConfirmDialog(store);
    const onConfirm = vi.fn();
    dialog.show(onConfirm);

    const btn = document.querySelector<HTMLButtonElement>('[data-testid="turn-confirm-cancel"]');
    expect(btn).not.toBeNull();
    btn!.click();

    expect(onConfirm).not.toHaveBeenCalled();
    expect(dialog.isOpen()).toBe(false);
  });

  it('shows the turn number in the dialog title', () => {
    const store = makeStore();
    // Set a known turn number
    const stateWithTurn = { ...store.getState(), turn: 42 };
    store.dispatch({ type: 'LOAD_STATE', payload: stateWithTurn });
    
    const dialog = new TurnConfirmDialog(store);
    dialog.show(() => {});
    
    const title = document.getElementById('turn-confirm-title');
    expect(title?.textContent).toContain('42');
    dialog.remove();
  });

  it('dispatches SET_CONFIRM_END_TURN when checkbox is checked on confirm', () => {
    const store = makeStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const dialog = new TurnConfirmDialog(store);
    dialog.show(() => {});

    // Check the "don't show" checkbox
    const checkbox = document.querySelector<HTMLInputElement>('[data-testid="turn-confirm-skip"]');
    expect(checkbox).not.toBeNull();
    checkbox!.checked = true;

    // Click confirm
    const confirmBtn = document.querySelector<HTMLButtonElement>('[data-testid="turn-confirm-end-turn"]');
    confirmBtn!.click();

    // Should have dispatched SET_CONFIRM_END_TURN with value: false
    const setConfirmCall = dispatchSpy.mock.calls.find(
      ([action]) => (action as { type: string }).type === 'SET_CONFIRM_END_TURN',
    );
    expect(setConfirmCall).toBeDefined();
    expect((setConfirmCall![0] as { type: string; payload: { value: boolean } }).payload.value).toBe(false);
  });

  it('does NOT dispatch SET_CONFIRM_END_TURN when checkbox is not checked', () => {
    const store = makeStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const dialog = new TurnConfirmDialog(store);
    dialog.show(() => {});

    // Do NOT check the "don't show" checkbox
    const confirmBtn = document.querySelector<HTMLButtonElement>('[data-testid="turn-confirm-end-turn"]');
    confirmBtn!.click();

    const setConfirmCall = dispatchSpy.mock.calls.find(
      ([action]) => (action as { type: string }).type === 'SET_CONFIRM_END_TURN',
    );
    expect(setConfirmCall).toBeUndefined();
  });
});

describe('SET_CONFIRM_END_TURN reducer action (design/ui-ux/state-transitions.md §3.3)', () => {
  it('sets confirmEndTurn to false', () => {
    const store = makeStore();
    expect(store.getState().ui.settings.confirmEndTurn).toBe(true);

    store.dispatch({ type: 'SET_CONFIRM_END_TURN', payload: { value: false } });
    expect(store.getState().ui.settings.confirmEndTurn).toBe(false);
  });

  it('sets confirmEndTurn back to true', () => {
    const store = makeStore();
    store.dispatch({ type: 'SET_CONFIRM_END_TURN', payload: { value: false } });
    store.dispatch({ type: 'SET_CONFIRM_END_TURN', payload: { value: true } });
    expect(store.getState().ui.settings.confirmEndTurn).toBe(true);
  });

  it('confirmEndTurn defaults to true in initial state (per design doc)', () => {
    const store = makeStore();
    expect(store.getState().ui.settings.confirmEndTurn).toBe(true);
  });
});
