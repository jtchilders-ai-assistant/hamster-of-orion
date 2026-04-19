/**
 * Star map canvas component.
 * src/ui/components/StarMap.ts
 */

import { GameState, StarType } from '../../game/state';
import { Store } from '../../game/store';
import { clearCanvas, drawStarfield, drawStar } from '../canvas/renderer';

const STAR_COLORS: Record<StarType, string> = {
  yellow: '#ffee88',
  green:  '#88ff88',
  red:    '#ff6644',
  blue:   '#88aaff',
  white:  '#ffffff',
  purple: '#cc88ff',
};

export class StarMap {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly store: Store<GameState>;

  constructor(canvas: HTMLCanvasElement, store: Store<GameState>) {
    this.canvas = canvas;
    this.store = store;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context from star map canvas');
    this.ctx = ctx;

    this.bindEvents();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width || this.canvas.parentElement?.clientWidth || 800;
    this.canvas.height = rect.height || this.canvas.parentElement?.clientHeight || 600;
  }

  private bindEvents(): void {
    this.canvas.addEventListener('click', (e) => {
      const state = this.store.getState();
      const galaxy = state.galaxy;
      if (!galaxy.systems.allIds.length) return;

      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const { scaleX, scaleY, offsetX, offsetY } = this.getMapTransform(state);

      // Find closest system within click radius
      let closestId: string | null = null;
      let closestDist = 20; // pixels

      for (const id of galaxy.systems.allIds) {
        const sys = galaxy.systems.byId[id];
        const sx = sys.coordinates.x * scaleX + offsetX;
        const sy = sys.coordinates.y * scaleY + offsetY;
        const d = Math.hypot(mx - sx, my - sy);
        if (d < closestDist) {
          closestDist = d;
          closestId = id;
        }
      }

      this.store.dispatch({ type: 'SELECT_SYSTEM', payload: { systemId: closestId } });
    });
  }

  private getMapTransform(state: GameState): { scaleX: number; scaleY: number; offsetX: number; offsetY: number } {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const gw = state.galaxy.width || 30;
    const gh = state.galaxy.height || 30;
    const padding = 40;

    const scaleX = (w - padding * 2) / gw;
    const scaleY = (h - padding * 2) / gh;
    return { scaleX, scaleY, offsetX: padding, offsetY: padding };
  }

  render(state: GameState): void {
    const ctx = this.ctx;

    clearCanvas(ctx);
    drawStarfield(ctx, 300);

    const galaxy = state.galaxy;
    if (!galaxy.systems.allIds.length) return;

    const { scaleX, scaleY, offsetX, offsetY } = this.getMapTransform(state);
    const selectedId = state.ui.selectedSystem;

    // Draw selection ring
    if (selectedId && galaxy.systems.byId[selectedId]) {
      const sys = galaxy.systems.byId[selectedId];
      const sx = sys.coordinates.x * scaleX + offsetX;
      const sy = sys.coordinates.y * scaleY + offsetY;
      ctx.strokeStyle = '#00aaff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw stars
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      const sx = sys.coordinates.x * scaleX + offsetX;
      const sy = sys.coordinates.y * scaleY + offsetY;
      const color = STAR_COLORS[sys.starType] ?? '#ffffff';
      drawStar(ctx, sx, sy, color);

      // Label
      ctx.fillStyle = '#c0d8f0';
      ctx.font = '10px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText(sys.name, sx, sy + 16);
    }
  }
}
