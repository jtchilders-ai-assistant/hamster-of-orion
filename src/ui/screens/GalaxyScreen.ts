/**
 * Galaxy screen — full-screen star map view.
 * src/ui/screens/GalaxyScreen.ts
 *
 * Layout: star map canvas (~75% width) + info panel (~25% width) side by side.
 * Matches MOO1 galaxy map layout per design/ui-ux/wireframes/galaxy-map.md.
 *
 * This class owns the screen container and wires all sub-components:
 *   - StarMap: canvas rendering + click-to-select
 *   - InfoPanel: context-sensitive right panel
 *   - CommandBar: rendered by the global App; this screen does NOT own it
 */

import { GameState } from '../../game/state';
import { Store } from '../../game/store';
import { InfoPanel } from '../components/InfoPanel';
import { CommandBar } from '../components/CommandBar';
import { StarMap } from '../components/StarMap';

export class GalaxyScreen {
  private readonly container: HTMLElement;
  private readonly starMap: StarMap;
  private readonly infoPanel: InfoPanel;
  private readonly commandBar: CommandBar;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;

    // Ensure the screen has the galaxy layout class
    this.container.classList.add('galaxy-screen');

    // Resolve or create the star map canvas
    const canvas = this.resolveCanvas(container);

    // Resolve or create the info panel element
    this.infoPanel = new InfoPanel(container, store);

    // Star map handles canvas rendering and dispatches SELECT_SYSTEM on click
    this.starMap = new StarMap(canvas, store);

    // Command bar — uses an existing wrapper or creates one inside the container
    this.commandBar = new CommandBar(container, store);
  }

  // ── Public interface (matches Screen interface in App) ─────────────────────

  render(state: GameState): void {
    this.starMap.render(state);
    this.infoPanel.render(state);
    this.commandBar.render(state);
  }

  show(): void {
    this.container.style.display = '';
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.classList.remove('active');
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /**
   * Find the existing #star-map canvas or create a new one inside the container.
   */
  private resolveCanvas(container: HTMLElement): HTMLCanvasElement {
    const existing = container.querySelector<HTMLCanvasElement>('#star-map');
    if (existing) return existing;

    // Create canvas if the HTML template didn't include it
    const canvas = document.createElement('canvas');
    canvas.id = 'star-map';
    canvas.className = 'star-map-canvas';
    // Insert before info panel if it exists, otherwise append
    const panel = container.querySelector('#info-panel');
    if (panel) {
      container.insertBefore(canvas, panel);
    } else {
      container.appendChild(canvas);
    }
    return canvas;
  }
}
