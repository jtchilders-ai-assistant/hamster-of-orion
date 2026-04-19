/**
 * Colonies / Planet List screen — stub.
 * src/ui/screens/ColoniesScreen.ts
 *
 * Corresponds to the PLANETS button (F2) in the command bar.
 * Shows a tabular list of all player colonies with key stats.
 */

import { GameState } from '../../game/state';

export class ColoniesScreen {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.buildLayout();
  }

  private buildLayout(): void {
    this.container.innerHTML = `
      <div class="screen-header">
        <h1>PLANETS &amp; COLONIES</h1>
      </div>
      <div class="screen-body placeholder-screen">
        <p class="placeholder-label">[ PLANET LIST — coming soon ]</p>
        <p class="placeholder-hint">F2 · Colonies</p>
      </div>
    `;
  }

  render(state: GameState): void {
    // Future: render colony table from state.planets + state.empires
    void state;
  }

  show(): void {
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.classList.remove('active');
  }
}
