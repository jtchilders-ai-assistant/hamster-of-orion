/**
 * Fleets screen — stub.
 * src/ui/screens/FleetsScreen.ts
 *
 * Corresponds to the FLEET button (F3) in the command bar.
 * Shows a list of all player fleets with location and orders.
 */

import { GameState } from '../../game/state';

export class FleetsScreen {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.buildLayout();
  }

  private buildLayout(): void {
    this.container.innerHTML = `
      <div class="screen-header">
        <h1>FLEET OVERVIEW</h1>
      </div>
      <div class="screen-body placeholder-screen">
        <p class="placeholder-label">[ FLEET LIST — coming soon ]</p>
        <p class="placeholder-hint">F3 · Fleets</p>
      </div>
    `;
  }

  render(state: GameState): void {
    void state;
  }

  show(): void {
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.classList.remove('active');
  }
}
