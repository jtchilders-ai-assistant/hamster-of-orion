/**
 * Info panel UI component — context-sensitive right panel.
 * src/ui/components/InfoPanel.ts
 *
 * Matches MOO1 galaxy-map info panel layout per design/ui-ux/wireframes/galaxy-map.md.
 * Shows different content based on what's selected (unexplored, uncolonized, colony).
 */

import { GameState, StarSystem, Planet, EmpireId } from '../../game/state';
import { Store, Action } from '../../game/store';
import { selectPlanet } from '../../game/actions/colony';

export class InfoPanel {
  private readonly element: HTMLElement;
  private store: Store<GameState> | null = null;

  constructor(container: HTMLElement, store?: Store<GameState>) {
    this.store = store ?? null;
    const existing = container.querySelector<HTMLElement>('#info-panel');
    if (existing) {
      this.element = existing;
    } else {
      this.element = document.createElement('div');
      this.element.id = 'info-panel';
      this.element.className = 'panel info-panel';
      container.appendChild(this.element);
    }
  }

  render(state: GameState): void {
    const selectedId = state.ui.selectedSystem;

    if (!selectedId) {
      this.element.innerHTML = this.renderEmpty();
      return;
    }

    const system = state.galaxy.systems.byId[selectedId];
    if (!system) {
      this.element.innerHTML = this.renderEmpty();
      return;
    }

    const planets = system.planetIds
      .map((id) => state.planets.byId[id])
      .filter((p): p is Planet => p !== undefined);

    const playerId = state.empires.playerId;
    const playerPlanets = planets.filter((p) => p.ownerId === playerId && p.isColonized);
    const aiPlanets = planets.filter((p) => p.ownerId !== null && p.ownerId !== playerId && p.isColonized);
    const uncolonizedPlanets = planets.filter((p) => !p.isColonized);

    // Determine the primary display planet (first colonized, or first planet)
    const primaryPlanet = playerPlanets[0] ?? aiPlanets[0] ?? uncolonizedPlanets[0] ?? null;

    if (playerPlanets.length > 0 && primaryPlanet) {
      this.element.innerHTML = this.renderYourColony(state, system, primaryPlanet);
      this.bindManageButton();
    } else if (aiPlanets.length > 0 && primaryPlanet) {
      const ownerId = primaryPlanet.ownerId as EmpireId;
      const ownerEmpire = state.empires.byId[ownerId];
      this.element.innerHTML = this.renderEnemyColony(system, primaryPlanet, ownerEmpire?.name ?? 'Unknown');
    } else if (primaryPlanet) {
      this.element.innerHTML = this.renderUncolonized(system, primaryPlanet);
    } else {
      this.element.innerHTML = this.renderUnexplored(system);
    }
  }

  // ── Render states ──────────────────────────────────────────────────────────

  private renderEmpty(): string {
    return `<div class="info-empty"><p>Select a star system</p></div>`;
  }

  private renderUnexplored(system: StarSystem): string {
    return `
      <div class="info-header">
        <h2 class="info-system-name" data-testid="planet-name">${system.name}</h2>
        <div class="info-divider"></div>
      </div>
      <div class="info-body">
        <div class="info-row"><span>${this.starTypeLabel(system.starType)}</span></div>
        <div class="info-divider"></div>
        <div class="info-status">UNEXPLORED</div>
        <div class="info-note">(no planet data)</div>
      </div>
    `;
  }

  private renderUncolonized(system: StarSystem, planet: Planet): string {
    const maxPop = planet.maxPopulation;
    return `
      <div class="info-header">
        <h2 class="info-system-name" data-testid="planet-name">${system.name}</h2>
        <div class="info-divider"></div>
      </div>
      <div class="info-body">
        <div class="info-row"><span>${this.starTypeLabel(system.starType)}</span></div>
        <div class="info-row"><span>${this.capitalize(planet.type)}</span></div>
        <div class="info-row">Size: <span>${maxPop}</span></div>
        ${planet.isRich ? '<div class="info-row bonus">Rich minerals</div>' : ''}
        ${planet.hasArtifacts ? '<div class="info-row bonus">Artifacts</div>' : ''}
        <div class="info-divider"></div>
        <div class="info-status">UNCOLONIZED</div>
        <div class="info-divider"></div>
        <div class="info-row">Requires: <span>Colony Ship</span></div>
        <div class="info-row">Special: <span>${planet.hasArtifacts ? 'Artifacts' : 'None'}</span></div>
      </div>
    `;
  }

  private renderYourColony(_state: GameState, system: StarSystem, planet: Planet): string {
    const maxFactories = planet.maxFactories;
    const atMaxFactories = planet.factories >= maxFactories;
    const atMaxPop = planet.population >= planet.maxPopulation;
    const shieldClass = planet.planetaryShield > 0 ? `Class ${this.toRoman(planet.planetaryShield)}` : 'None';
    const wastePercent = Math.round(planet.waste * 100);

    const currentBuild = planet.buildQueue[0];

    return `
      <div class="info-header">
        <h2 class="info-system-name" data-testid="planet-name">${system.name}</h2>
        <div class="info-divider"></div>
      </div>
      <div class="info-body">
        <div class="info-row"><span>${this.starTypeLabel(system.starType)}</span></div>
        <div class="info-row"><span>${this.capitalize(planet.type)}</span></div>
        <div class="info-row">Size: <span>${planet.maxPopulation}</span></div>
        <div class="info-divider"></div>
        <div class="info-status">YOUR COLONY</div>
        <div class="info-divider"></div>
        <div class="info-stat">
          <span class="stat-label">Pop</span>
          <span class="stat-value">${Math.round(planet.population)} / ${planet.maxPopulation}${atMaxPop ? ' (MAX)' : ''}</span>
        </div>
        <div class="info-stat">
          <span class="stat-label">Factories</span>
          <span class="stat-value">${planet.factories}${atMaxFactories ? ' (MAX)' : ` / ${maxFactories}`}</span>
        </div>
        <div class="info-stat">
          <span class="stat-label">Bases</span>
          <span class="stat-value">${planet.missileBases}</span>
        </div>
        <div class="info-stat">
          <span class="stat-label">Shield</span>
          <span class="stat-value">${shieldClass}</span>
        </div>
        <div class="info-stat">
          <span class="stat-label">Waste</span>
          <span class="stat-value">${wastePercent}%</span>
        </div>
        <div class="info-divider"></div>
        ${currentBuild ? this.renderProduction(currentBuild) : '<div class="info-note">Nothing producing</div>'}
        <div class="info-divider"></div>
        <button class="btn-manage-colony" data-planet-id="${planet.id}">MANAGE COLONY</button>
      </div>
    `;
  }

  private renderEnemyColony(system: StarSystem, planet: Planet, empireName: string): string {
    return `
      <div class="info-header">
        <h2 class="info-system-name" data-testid="planet-name">${system.name}</h2>
        <div class="info-divider"></div>
      </div>
      <div class="info-body">
        <div class="info-row"><span>${this.starTypeLabel(system.starType)}</span></div>
        <div class="info-row"><span>${this.capitalize(planet.type)}</span></div>
        <div class="info-row">Size: <span>${planet.maxPopulation}</span></div>
        <div class="info-divider"></div>
        <div class="info-status">${empireName.toUpperCase()} COLONY</div>
        <div class="info-divider"></div>
        <div class="info-stat">
          <span class="stat-label">Pop</span>
          <span class="stat-value">~${Math.round(planet.population)}M</span>
        </div>
      </div>
    `;
  }

  private renderProduction(build: { targetName: string; turnsRemaining: number; costTotal: number; costRemaining: number }): string {
    const progress = build.costTotal > 0
      ? Math.max(0, Math.min(1, 1 - build.costRemaining / build.costTotal))
      : 0;
    const barFilled = Math.round(progress * 14);
    const barEmpty = 14 - barFilled;
    const progressBar = '█'.repeat(barFilled) + '░'.repeat(barEmpty);

    return `
      <div class="info-status">PRODUCING</div>
      <div class="info-divider"></div>
      <div class="info-row producing-item">${build.targetName}</div>
      <div class="info-progress-bar" aria-label="Production progress ${Math.round(progress * 100)}%">${progressBar}</div>
      <div class="info-row">Turns left: <span>${build.turnsRemaining}</span></div>
    `;
  }

  // ── Button binding ─────────────────────────────────────────────────────────

  private bindManageButton(): void {
    const btn = this.element.querySelector<HTMLButtonElement>('.btn-manage-colony');
    if (!btn || !this.store) return;

    btn.addEventListener('click', () => {
      const planetId = btn.dataset.planetId;
      if (planetId) {
        this.store!.dispatch(selectPlanet(planetId) as Action);
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private starTypeLabel(starType: string): string {
    const labels: Record<string, string> = {
      yellow: 'Yellow Star',
      green:  'Green Star',
      red:    'Red Star',
      blue:   'Blue Star',
      white:  'White Star',
      purple: 'Purple Star',
    };
    return labels[starType] ?? `${this.capitalize(starType)} Star`;
  }

  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  }

  private toRoman(n: number): string {
    const numerals: Array<[number, string]> = [
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
    ];
    let result = '';
    let remaining = n;
    for (const [val, sym] of numerals) {
      while (remaining >= val) {
        result += sym;
        remaining -= val;
      }
    }
    return result || String(n);
  }
}
