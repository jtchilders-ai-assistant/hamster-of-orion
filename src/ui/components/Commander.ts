/**
 * Commander — Main UI controller with turn processing.
 * src/ui/components/Commander.ts
 *
 * Wraps the App class and adds:
 *   - End Turn button in the command bar
 *   - TurnSummary overlay after each turn
 *   - Keyboard shortcut (Enter/Space) triggers turn with summary
 */

import { Store, Action } from '../../game/store';
import { GameState } from '../../game/state';
import { nextTurn } from '../../game/actions/turn';
import { App } from '../app';

/**
 * Commander is the top-level UI controller.
 * It owns an App instance, wires the End Turn button,
 * and displays the TurnSummary overlay after each turn.
 */
export class Commander {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;
  private turnSummaryEl: HTMLElement | null = null;
  private processingTurn = false;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    // Initialize the App (screen router, command bar, keyboard nav)
    new App(store);

    this.bindKeyboard();
  }

  // ── Store accessors (for screen rendering) ──────────────────────────────

  getState(): GameState {
    return this.store.getState();
  }

  dispatch(action: Action): void {
    this.store.dispatch(action);
  }

  // ── Keyboard: End Turn ──────────────────────────────────────────────────

  private bindKeyboard(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      // Enter or Space = process turn (when not in an input field)
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.processTurn();
      }
    });
  }

  // ── Turn processing ─────────────────────────────────────────────────────

  /** Process one game turn and show the TurnSummary overlay. */
  processTurn(): void {
    if (this.processingTurn) return;
    this.processingTurn = true;

    // Dispatch the turn action through the store
    this.dispatch(nextTurn());

    // Small delay to let the state settle, then show summary
    requestAnimationFrame(() => {
      this.showTurnSummary();
      this.processingTurn = false;
    });
  }

  /** Show the TurnSummary overlay after a turn. */
  private showTurnSummary(): void {
    // Remove any existing summary overlay
    if (this.turnSummaryEl) {
      this.container.removeChild(this.turnSummaryEl);
      this.turnSummaryEl = null;
    }

    const state = this.getState();

    // Create overlay container
    this.turnSummaryEl = document.createElement('div');
    this.turnSummaryEl.className = 'turn-summary-overlay';
    this.turnSummaryEl.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      font-family: 'Courier New', monospace;
    `;

    // Build dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: #1a1a2e;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 24px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'text-align: center; margin-bottom: 16px; border-bottom: 1px solid #444; padding-bottom: 12px;';
    const turnNum = state.turn;
    header.innerHTML = `
      <h2 style="margin: 0; color: #ffd700; font-size: 1.4em;">
        Turn ${turnNum} Complete — Year ${state.year}
      </h2>
      <p style="color: #888; margin: 4px 0 0;">AI empires have taken their turns</p>
    `;
    dialog.appendChild(header);

    // Event log — collect significant notifications from this turn
    const notifications = state.ui.notifications.slice(-20).reverse();
    if (notifications.length > 0) {
      const eventsDiv = document.createElement('div');
      eventsDiv.style.cssText = 'text-align: left; margin: 12px 0; max-height: 250px; overflow-y: auto;';

      for (const notif of notifications) {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 6px 0; border-bottom: 1px solid #222; color: #ccc; font-size: 0.9em;';

        const icon = this.notificationIcon(notif.type);
        const titleSpan = document.createElement('strong');
        titleSpan.textContent = notif.title;
        titleSpan.style.color = notif.priority === 'critical' ? '#ff6666' :
          notif.priority === 'important' ? '#ffaa00' : '#aaaacc';
        const msgSpan = document.createElement('span');
        msgSpan.textContent = ` ${notif.message}`;
        msgSpan.style.color = '#888';

        item.appendChild(document.createTextNode(icon + ' '));
        item.appendChild(titleSpan);
        item.appendChild(msgSpan);
        eventsDiv.appendChild(item);
      }

      dialog.appendChild(eventsDiv);
    } else {
      const emptyMsg = document.createElement('p');
      emptyMsg.style.cssText = 'color: #666; text-align: center; padding: 12px 0;';
      emptyMsg.textContent = 'No significant events this turn.';
      dialog.appendChild(emptyMsg);
    }

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Continue';
    closeBtn.style.cssText = `
      display: block; margin: 16px auto 0; padding: 8px 32px;
      background: #2d2d44; color: #ffd700;
      border: 1px solid #ffd700; border-radius: 4px;
      cursor: pointer; font-family: inherit; font-size: 1em;
    `;
    closeBtn.addEventListener('click', () => this.hideTurnSummary());
    dialog.appendChild(closeBtn);

    // Click outside to dismiss
    this.turnSummaryEl.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.turnSummaryEl) this.hideTurnSummary();
    });

    this.turnSummaryEl.appendChild(dialog);
    this.container.appendChild(this.turnSummaryEl);
  }

  private hideTurnSummary(): void {
    if (this.turnSummaryEl) {
      this.container.removeChild(this.turnSummaryEl);
      this.turnSummaryEl = null;
    }
  }

  // ── Notification icon mapping ───────────────────────────────────────────

  private notificationIcon(type: string): string {
    switch (type) {
      case 'combat':    return '⚔️';
      case 'event':     return '📢';
      case 'warning':   return '⚠️';
      case 'research':  return '🔬';
      case 'production':return '💰';
      case 'diplomacy': return '🤝';
      default:          return 'ℹ️';
    }
  }
}
