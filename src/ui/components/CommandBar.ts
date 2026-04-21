/**
 * Command bar UI component — persistent bottom bar.
 * src/ui/components/CommandBar.ts
 *
 * Renders the MOO1-style command bar:
 *   GAME | DESIGN | FLEET | MAP | RACES | PLANETS | TECH | NEXT TURN
 *   F10     F6       F3    F1     F5       F2       F4     [ENTER]
 *
 * Active screen button is highlighted. F-key labels shown below each button.
 */

import { Store, Action } from '../../game/store';
import { GameState, ScreenType } from '../../game/state';
import { nextTurn } from '../../game/actions/turn';

interface NavButton {
  label: string;
  fkey: string;
  screen: ScreenType;
}

const NAV_BUTTONS: NavButton[] = [
  { label: 'GAME',    fkey: 'F10', screen: 'menu' },
  { label: 'DESIGN',  fkey: 'F6',  screen: 'ship_design' },
  { label: 'COUNCIL', fkey: 'F7',  screen: 'council' },
  { label: 'FLEET',   fkey: 'F3',  screen: 'fleet' },
  { label: 'MAP',     fkey: 'F1',  screen: 'galaxy' },
  { label: 'RACES',   fkey: 'F5',  screen: 'diplomacy' },
  { label: 'PLANETS', fkey: 'F2',  screen: 'planet_list' },
  { label: 'TECH',    fkey: 'F4',  screen: 'research' },
];

export class CommandBar {
  private readonly element: HTMLElement;
  private readonly navButtons: Map<ScreenType, HTMLButtonElement> = new Map();

  constructor(container: HTMLElement, store: Store<GameState>) {

    // Create or reuse the command bar element
    const existing = document.getElementById('command-bar');
    if (existing) {
      this.element = existing;
      this.element.innerHTML = ''; // rebuild contents
    } else {
      this.element = document.createElement('div');
      this.element.id = 'command-bar';
      container.appendChild(this.element);
    }

    this.buildButtons(store);
  }

  private buildButtons(store: Store<GameState>): void {
    // Navigation buttons
    for (const def of NAV_BUTTONS) {
      const btn = document.createElement('button');
      btn.className = 'cmd-nav-btn';
      btn.dataset['screen'] = def.screen;
      btn.dataset['testid'] = `cmd-${def.label.toLowerCase()}`;
      btn.innerHTML = `<span class="cmd-label">${def.label}</span><span class="cmd-fkey">${def.fkey}</span>`;

      btn.addEventListener('click', () => {
        store.dispatch({ type: 'NAVIGATE', payload: { screen: def.screen } } as Action);
      });

      this.navButtons.set(def.screen, btn);
      this.element.appendChild(btn);
    }

    // Spacer
    const spacer = document.createElement('div');
    spacer.className = 'cmd-spacer';
    this.element.appendChild(spacer);

    // Status bar embedded in command bar (turn, year, credits, RP)
    const statusBar = document.createElement('div');
    statusBar.id = 'status-bar';
    statusBar.innerHTML = `
      <span data-testid="turn-display">Turn: 1</span>
      <span data-testid="year-display">Year: 2500</span>
      <span data-testid="credits-display">BC: 0</span>
      <span data-testid="research-display">RP: 0/turn</span>
    `;
    this.element.appendChild(statusBar);

    // Next turn button
    const nextTurnBtn = document.createElement('button');
    nextTurnBtn.id = 'next-turn';
    nextTurnBtn.dataset['testid'] = 'next-turn';
    nextTurnBtn.innerHTML = `<span class="cmd-label">NEXT TURN</span><span class="cmd-fkey">ENTER</span>`;
    nextTurnBtn.addEventListener('click', () => {
      store.dispatch(nextTurn());
    });
    this.element.appendChild(nextTurnBtn);
  }

  render(state: GameState): void {
    // Highlight the active screen button
    for (const [screen, btn] of this.navButtons) {
      btn.classList.toggle('active', screen === state.currentScreen);
    }

    // Update status displays
    const turnEl = this.element.querySelector<HTMLElement>('[data-testid="turn-display"]');
    const yearEl = this.element.querySelector<HTMLElement>('[data-testid="year-display"]');
    const creditsEl = this.element.querySelector<HTMLElement>('[data-testid="credits-display"]');
    const rpEl = this.element.querySelector<HTMLElement>('[data-testid="research-display"]');

    if (turnEl) turnEl.textContent = `Turn: ${state.turn}`;
    if (yearEl) yearEl.textContent = `Year: ${state.year}`;

    const playerEmpire = state.empires.byId[state.empires.playerId];
    if (playerEmpire) {
      if (creditsEl) creditsEl.textContent = `BC: ${playerEmpire.credits}`;
      if (rpEl) rpEl.textContent = `RP: ${playerEmpire.research.researchPerTurn}/turn`;
    }
  }
}
