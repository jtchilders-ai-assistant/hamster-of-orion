/**
 * MAP screen — full-screen zoomed-out galaxy overview.
 * src/ui/screens/MapScreen.ts
 *
 * Per design/ui-ux/navigation-flow.md §4.5:
 *   "The MAP button opens a **separate full-screen MAP view** — a completely
 *   different rendering mode from the normal Galaxy View. The entire main view
 *   is replaced with a zoomed-out display showing all stars in the galaxy at once.
 *   Within the MAP screen, three mode buttons on the right panel filter what data
 *   is displayed."
 *
 * Modes:
 *   - COLONIES: show ownership flags (who controls each star)
 *   - ENVIRONMENT: show planet type codes (terran, ocean, etc.)
 *   - MINERALS: show resource indicators (poor/normal/rich)
 *
 * Exit: Click MAP again in the command bar, or press ESC, to return to Galaxy View.
 */

import { GameState, EmpireId } from '../../game/state';
import { Store, Action } from '../../game/store';

export type MapMode = 'colonies' | 'environment' | 'minerals';

// Empire color palette — matches StarMap.ts
const EMPIRE_COLORS: readonly string[] = [
  '#00ff88',  // Player: green
  '#ff4444',  // AI 1: red
  '#4444ff',  // AI 2: blue
  '#ffaa00',  // AI 3: orange
  '#ff00ff',  // AI 4: magenta
  '#00ffff',  // AI 5: cyan
];

export class MapScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;
  private canvas: HTMLCanvasElement | null = null;
  private mode: MapMode = 'colonies';
  private modeButtons: HTMLElement | null = null;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.container.classList.add('map-screen');
    this.buildUI();
  }

  private buildUI(): void {
    // Clear existing content
    this.container.innerHTML = '';

    // Main layout: canvas (left) + mode panel (right)
    const layout = document.createElement('div');
    layout.className = 'map-layout';

    // Canvas for zoomed-out galaxy
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'map-canvas';
    this.canvas.className = 'map-canvas';
    layout.appendChild(this.canvas);

    // Mode selection panel
    this.modeButtons = document.createElement('div');
    this.modeButtons.id = 'map-mode-panel';
    this.modeButtons.className = 'map-mode-panel';
    this.modeButtons.innerHTML = `
      <h3>MAP VIEW</h3>
      <button data-mode="colonies" data-testid="map-mode-colonies" class="map-mode-btn active" title="Show colony ownership">COLONIES</button>
      <button data-mode="environment" data-testid="map-mode-environment" class="map-mode-btn" title="Show planet environments">ENVIRONMENT</button>
      <button data-mode="minerals" data-testid="map-mode-minerals" class="map-mode-btn" title="Show mineral resources">MINERALS</button>
      <hr />
      <button data-testid="map-close" class="map-close-btn" title="Return to Galaxy Map (ESC)">CLOSE</button>
    `;
    layout.appendChild(this.modeButtons);

    this.container.appendChild(layout);

    // Wire mode buttons
    this.modeButtons.querySelectorAll<HTMLButtonElement>('.map-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset['mode'] as MapMode;
        if (mode) {
          this.mode = mode;
          this.updateModeHighlight();
          this.render(this.store.getState());
        }
      });
    });

    // Wire close button
    const closeBtn = this.modeButtons.querySelector<HTMLButtonElement>('.map-close-btn');
    closeBtn?.addEventListener('click', () => {
      this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } } as Action);
    });
  }

  private updateModeHighlight(): void {
    this.modeButtons?.querySelectorAll<HTMLButtonElement>('.map-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset['mode'] === this.mode);
    });
  }

  render(state: GameState): void {
    if (!this.canvas) return;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // Size canvas to container
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      this.canvas.width = rect.width - 200; // Leave room for mode panel
      this.canvas.height = rect.height;
    }

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all stars in zoomed-out view
    this.renderStars(ctx, state);
  }

  private renderStars(ctx: CanvasRenderingContext2D, state: GameState): void {
    const systems = state.galaxy?.systems;
    const empires = state.empires;
    const planets = state.planets;
    if (!systems?.allIds?.length) return;

    // Build empire color map (empire index → color)
    const empireColorMap = new Map<EmpireId, string>();
    empires.allIds.forEach((id, idx) => {
      empireColorMap.set(id, EMPIRE_COLORS[idx % EMPIRE_COLORS.length]);
    });

    // Calculate bounds for auto-zoom
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const id of systems.allIds) {
      const sys = systems.byId[id];
      if (sys) {
        minX = Math.min(minX, sys.coordinates.x);
        maxX = Math.max(maxX, sys.coordinates.x);
        minY = Math.min(minY, sys.coordinates.y);
        maxY = Math.max(maxY, sys.coordinates.y);
      }
    }

    const padding = 50;
    const scaleX = (this.canvas!.width - padding * 2) / (maxX - minX || 1);
    const scaleY = (this.canvas!.height - padding * 2) / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY);

    const offsetX = padding + (this.canvas!.width - padding * 2 - (maxX - minX) * scale) / 2;
    const offsetY = padding + (this.canvas!.height - padding * 2 - (maxY - minY) * scale) / 2;

    // Draw each star
    for (const id of systems.allIds) {
      const sys = systems.byId[id];
      if (!sys) continue;

      const x = offsetX + (sys.coordinates.x - minX) * scale;
      const y = offsetY + (sys.coordinates.y - minY) * scale;

      // Get the first planet in this system (if any)
      const firstPlanetId = sys.planetIds[0];
      const planet = firstPlanetId ? planets.byId[firstPlanetId] : null;

      // Get color/label based on mode
      let color = '#888';
      let label = '';

      switch (this.mode) {
        case 'colonies': {
          // Show ownership
          if (sys.ownerId) {
            const empire = empires.byId[sys.ownerId];
            color = empireColorMap.get(sys.ownerId) ?? '#0f0';
            label = empire?.name?.charAt(0) ?? '?';
          } else {
            color = planet ? '#555' : '#333';
          }
          break;
        }
        case 'environment': {
          // Show planet type
          if (planet) {
            color = this.getEnvironmentColor(planet.type);
            label = planet.type.charAt(0).toUpperCase();
          }
          break;
        }
        case 'minerals': {
          // Show resource level
          if (planet) {
            color = this.getMineralColor(planet.resourceLevel);
            label = this.getMineralSymbol(planet.resourceLevel);
          }
          break;
        }
      }

      // Draw star
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Draw label
      if (label) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y);
      }
    }
  }

  private getEnvironmentColor(type: string): string {
    const colors: Record<string, string> = {
      terran: '#4a4',
      ocean: '#44a',
      jungle: '#2a2',
      arid: '#a84',
      tundra: '#88c',
      toxic: '#a4a',
      radiated: '#c44',
      barren: '#666',
      dead: '#444',
      gaia: '#0f0',
      steppe: '#8a8',
      desert: '#ca8',
      minimal: '#555',
      inferno: '#f44',
    };
    return colors[type] ?? '#888';
  }

  private getMineralColor(resourceLevel: string): string {
    const colors: Record<string, string> = {
      ultra_poor: '#622',
      poor: '#844',
      normal: '#888',
      rich: '#cc4',
      ultra_rich: '#ff0',
    };
    return colors[resourceLevel] ?? '#888';
  }

  private getMineralSymbol(resourceLevel: string): string {
    const symbols: Record<string, string> = {
      ultra_poor: '--',
      poor: '-',
      normal: '',
      rich: '+',
      ultra_rich: '++',
    };
    return symbols[resourceLevel] ?? '';
  }

  show(): void {
    this.container.style.display = '';
    this.container.classList.add('active');
    // Resize canvas when shown
    setTimeout(() => this.render(this.store.getState()), 0);
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.classList.remove('active');
  }
}
