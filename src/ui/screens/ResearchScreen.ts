/**
 * Research / Technology screen — stub.
 * src/ui/screens/ResearchScreen.ts
 *
 * Corresponds to the TECH button (F4) in the command bar.
 * Shows the research tree across all 6 tech fields.
 */

import { GameState } from '../../game/state';

export class ResearchScreen {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.buildLayout();
  }

  private buildLayout(): void {
    this.container.innerHTML = `
      <div class="screen-header">
        <h1>RESEARCH &amp; TECHNOLOGY</h1>
      </div>
      <div class="screen-body placeholder-screen">
        <p class="placeholder-label">[ RESEARCH TREE — coming soon ]</p>
        <p class="placeholder-hint">F4 · Research</p>
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
