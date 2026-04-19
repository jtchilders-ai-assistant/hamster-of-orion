/**
 * Star map canvas component — wires canvas events to the store.
 * src/ui/components/StarMap.ts
 *
 * This component owns the <canvas> element and handles:
 *   - Resize observation
 *   - Click-to-select star
 *   - Delegating all drawing to src/ui/canvas/starmap.ts helpers
 */

import { GameState, EmpireId } from '../../game/state';
import { Store } from '../../game/store';
import { clearCanvas, drawStarfield } from '../canvas/renderer';
import {
  MapTransform,
  getMapTransform,
  galaxyToCanvas,
  hitTestStar,
  drawStarDot,
  drawSelectionRing,
  drawColonyRing,
  drawStarLabel,
  drawFleetIndicator,
} from '../canvas/starmap';

// Empire color palette — indexed by empire ID (player = index 0)
const EMPIRE_COLORS: readonly string[] = [
  '#00ff88',  // Player: green
  '#ff4444',  // AI 1: red
  '#4444ff',  // AI 2: blue
  '#ffaa00',  // AI 3: orange
  '#ff00ff',  // AI 4: magenta
  '#00ffff',  // AI 5: cyan
];

export class StarMap {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly store: Store<GameState>;

  // Map from empire ID → display color (computed on first render)
  private empireColorMap: Map<EmpireId, string> = new Map();

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

  // ── Private ──────────────────────────────────────────────────────────────────

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

      const transform = this.buildTransform(state);
      const systems = galaxy.systems.allIds.map((id) => galaxy.systems.byId[id]);

      const clickedId = hitTestStar(mx, my, systems, transform, 20);
      this.store.dispatch({ type: 'SELECT_SYSTEM', payload: { systemId: clickedId } });
    });
  }

  private buildTransform(state: GameState): MapTransform {
    return getMapTransform(
      this.canvas.width,
      this.canvas.height,
      state.galaxy.width || 30,
      state.galaxy.height || 30,
    );
  }

  private buildEmpireColorMap(state: GameState): void {
    this.empireColorMap.clear();
    const empireIds = state.empires.allIds;
    empireIds.forEach((id, idx) => {
      this.empireColorMap.set(id, EMPIRE_COLORS[idx % EMPIRE_COLORS.length]);
    });
  }

  // ── Public ───────────────────────────────────────────────────────────────────

  render(state: GameState): void {
    const ctx = this.ctx;
    const galaxy = state.galaxy;

    clearCanvas(ctx);
    drawStarfield(ctx, 300);

    if (!galaxy.systems.allIds.length) return;

    this.buildEmpireColorMap(state);
    const transform = this.buildTransform(state);
    const selectedId = state.ui.selectedSystem;

    // ── Pass 1: Selection ring (drawn first so it appears behind star) ─────────
    if (selectedId && galaxy.systems.byId[selectedId]) {
      const sys = galaxy.systems.byId[selectedId];
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      drawSelectionRing(ctx, x, y);
    }

    // ── Pass 2: Colony rings ───────────────────────────────────────────────────
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      if (!sys.ownerId) continue;
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      const color = this.empireColorMap.get(sys.ownerId) ?? '#ffffff';
      drawColonyRing(ctx, x, y, color);
    }

    // ── Pass 3: Stars ──────────────────────────────────────────────────────────
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      drawStarDot(ctx, x, y, sys.starType);
    }

    // ── Pass 4: Fleet indicators ───────────────────────────────────────────────
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      if (!sys.fleetIds.length) continue;
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      // Show a fleet indicator in the player's color for their fleets
      const playerColor = this.empireColorMap.get(state.empires.playerId) ?? '#00ff88';
      drawFleetIndicator(ctx, x, y, playerColor, 'right');
    }

    // ── Pass 5: Labels ─────────────────────────────────────────────────────────
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      const isSelected = id === selectedId;
      drawStarLabel(ctx, x, y, sys.name, isSelected ? '#ffffff' : '#b8d0e8');
    }
  }
}
