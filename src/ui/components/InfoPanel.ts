/**
 * Info panel UI component.
 * src/ui/components/InfoPanel.ts
 */

import { GameState } from '../../game/state';

export class InfoPanel {
  private readonly element: HTMLElement;

  constructor(container: HTMLElement) {
    const existing = container.querySelector<HTMLElement>('#info-panel');
    if (existing) {
      this.element = existing;
    } else {
      this.element = document.createElement('div');
      this.element.id = 'info-panel';
      this.element.className = 'panel';
      container.appendChild(this.element);
    }
  }

  render(state: GameState): void {
    const selected = state.ui.selectedSystem;

    if (!selected) {
      this.element.innerHTML = '<p>Select a star system</p>';
      return;
    }

    const system = state.galaxy.systems.byId[selected];
    if (!system) {
      this.element.innerHTML = '<p>Unknown system</p>';
      return;
    }

    const planets = system.planetIds
      .map((id) => state.planets.byId[id])
      .filter(Boolean);

    this.element.innerHTML = `
      <h2 class="planet-name" data-testid="planet-name">${system.name}</h2>
      <div class="stat">Star Type <span>${system.starType}</span></div>
      <div class="stat">Planets <span>${planets.length}</span></div>
      ${planets.length > 0 ? this.renderPlanetList(state, system.planetIds) : ''}
    `;
  }

  private renderPlanetList(state: GameState, planetIds: string[]): string {
    return planetIds
      .map((id) => {
        const p = state.planets.byId[id];
        if (!p) return '';
        return `<div class="stat">${p.name} <span>${p.isColonized ? `Pop: ${p.population}M` : 'Uninhabited'}</span></div>`;
      })
      .join('');
  }
}
