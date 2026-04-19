/**
 * Ship Design screen — stub.
 * src/ui/screens/DesignScreen.ts
 *
 * Corresponds to the DESIGN button (F6) in the command bar.
 * Allows designing and managing ship blueprints.
 */

import { GameState } from '../../game/state';

export class DesignScreen {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.buildLayout();
  }

  private buildLayout(): void {
    this.container.innerHTML = `
      <div class="screen-header">
        <h1>SHIP DESIGN</h1>
      </div>
      <div class="screen-body placeholder-screen">
        <p class="placeholder-label">[ SHIP DESIGNER — coming soon ]</p>
        <p class="placeholder-hint">F6 · Design</p>
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
