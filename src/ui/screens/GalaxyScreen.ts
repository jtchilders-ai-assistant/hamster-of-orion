/**
 * Galaxy screen — main view of the star map.
 * src/ui/screens/GalaxyScreen.ts
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

    const canvas = container.querySelector<HTMLCanvasElement>('#star-map');
    if (!canvas) throw new Error('Missing #star-map canvas');

    this.starMap = new StarMap(canvas, store);
    this.infoPanel = new InfoPanel(container);
    this.commandBar = new CommandBar(container, store);
  }

  render(state: GameState): void {
    this.starMap.render(state);
    this.infoPanel.render(state);
    this.commandBar.render(state);
  }

  show(): void {
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.classList.remove('active');
  }
}
