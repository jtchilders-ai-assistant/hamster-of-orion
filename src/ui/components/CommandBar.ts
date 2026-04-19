/**
 * Command bar UI component.
 * src/ui/components/CommandBar.ts
 */

import { Store, Action } from '../../game/store';
import { GameState, ScreenType } from '../../game/state';
import { nextTurn } from '../../game/actions/turn';

export class CommandBar {
  private readonly element: HTMLElement;

  constructor(container: HTMLElement, store: Store<GameState>) {
    const existing = container.querySelector<HTMLElement>('#command-bar');
    if (existing) {
      this.element = existing;
    } else {
      this.element = document.createElement('div');
      this.element.id = 'command-bar';
      container.appendChild(this.element);
    }

    this.bindEvents(store);
  }

  private bindEvents(store: Store<GameState>): void {
    // Screen navigation buttons
    this.element.querySelectorAll<HTMLButtonElement>('[data-screen]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const screen = btn.dataset['screen'] as ScreenType | undefined;
        if (!screen) return;
        store.dispatch({ type: 'NAVIGATE', payload: { screen } } as Action);
      });
    });

    // Next turn button
    const nextTurnBtn = this.element.querySelector<HTMLButtonElement>('#next-turn');
    nextTurnBtn?.addEventListener('click', () => {
      store.dispatch(nextTurn());
    });
  }

  render(state: GameState): void {
    // Update status bar displays
    const statusBar = document.querySelector<HTMLElement>('#status-bar');
    if (!statusBar) return;

    const turnEl = statusBar.querySelector<HTMLElement>('[data-testid="turn-display"]');
    const yearEl = statusBar.querySelector<HTMLElement>('[data-testid="year-display"]');

    if (turnEl) turnEl.textContent = `Turn: ${state.turn}`;
    if (yearEl) yearEl.textContent = `Year: ${state.year}`;

    const playerEmpire = state.empires.byId[state.empires.playerId];
    if (playerEmpire) {
      const creditsEl = statusBar.querySelector<HTMLElement>('[data-testid="credits-display"]');
      const rpEl = statusBar.querySelector<HTMLElement>('[data-testid="research-display"]');
      if (creditsEl) creditsEl.textContent = `BC: ${playerEmpire.credits}`;
      if (rpEl) rpEl.textContent = `RP: ${playerEmpire.research.researchPerTurn}/turn`;
    }
  }
}
