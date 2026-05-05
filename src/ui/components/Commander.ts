/**
 * Commander — Main UI controller wrapper.
 * src/ui/components/Commander.ts
 *
 * Wraps the App class. The App class handles:
 *   - End Turn processing via Enter/Space keyboard shortcuts
 *   - Navigation to TurnSummaryScreen after turn completion
 *   - All F-key navigation and screen routing
 *
 * @note Keyboard handling and turn summary display are now consolidated
 *       in App and TurnSummaryScreen. Commander previously had duplicate
 *       keyboard listeners and an inline overlay that conflicted with
 *       the screen-based TurnSummaryScreen implementation.
 */

import { Store, Action } from '../../game/store';
import { GameState } from '../../game/state';
import { App } from '../app';

/**
 * Commander is the top-level UI controller.
 * It owns an App instance which handles all UI concerns.
 */
export class Commander {
  // Note: container and app kept as class fields for potential future use
  // or external access, even if not currently read within this class.
  private readonly _container: HTMLElement;
  private readonly store: Store<GameState>;
  private readonly _app: App;

  constructor(container: HTMLElement, store: Store<GameState>) {
    console.log('[Commander] Creating, container:', container?.id || container?.tagName, 'children:', container?.children.length);
    this._container = container;
    this.store = store;
    // Initialize the App (screen router, command bar, keyboard nav, turn processing)
    this._app = new App(store);
    console.log('[Commander] App instantiated, container:', container?.id || container?.tagName);
    console.log('[Commander] Store currentScreen after App construction:', store.getState().currentScreen);
    // Note: Keyboard handling is now fully in App — no duplicate listeners here
  }

  /** Get the underlying App instance. */
  get app(): App {
    return this._app;
  }

  /** Get the container element. */
  get container(): HTMLElement {
    return this._container;
  }

  // ── Store accessors (for external access if needed) ────────────────────────

  getState(): GameState {
    return this.store.getState();
  }

  dispatch(action: Action): void {
    this.store.dispatch(action);
  }
}
