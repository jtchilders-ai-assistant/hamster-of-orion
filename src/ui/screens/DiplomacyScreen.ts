/**
 * Diplomacy / Races screen — stub.
 * src/ui/screens/DiplomacyScreen.ts
 *
 * Corresponds to the RACES button (F5) in the command bar.
 * Shows diplomatic relations with all encountered races.
 */

import { GameState } from '../../game/state';

export class DiplomacyScreen {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.buildLayout();
  }

  private buildLayout(): void {
    this.container.innerHTML = `
      <div class="screen-header">
        <h1>RACES &amp; DIPLOMACY</h1>
      </div>
      <div class="screen-body placeholder-screen">
        <p class="placeholder-label">[ DIPLOMACY — coming soon ]</p>
        <p class="placeholder-hint">F5 · Races</p>
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
