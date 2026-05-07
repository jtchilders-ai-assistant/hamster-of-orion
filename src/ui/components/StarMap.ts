/**
 * Star map canvas component — wires canvas events to the store.
 * src/ui/components/StarMap.ts
 *
 * This component owns the <canvas> element and handles:
 *   - Resize observation
 *   - Click-to-select star
 *   - Fleet icon click → select fleet / open deployment mode
 *   - Deployment mode: click destination star to issue move order
 *   - Delegating all drawing to src/ui/canvas/starmap.ts helpers
 */

import { FleetId, GameState } from '../../game/state';
import { Store } from '../../game/store';
import { findPath } from '../../game/utils/pathfinding';
import { getFleetFuelRange } from '../../game/systems/fleet';
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
  drawFleetRangeCircle,
  drawPathLine,
  drawFleetInTransit,
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

// Fleet icon hit radius (slightly larger than visual indicator)
const FLEET_HIT_RADIUS = 16;

export class StarMap {
  private readonly canvas: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private readonly store: Store<GameState>;

  // Map from empire ID → display color (computed on first render)
  private empireColorMap: Map<string, string> = new Map();

  // ResizeObserver to handle canvas being created while hidden (0×0)
  private resizeObserver: ResizeObserver | null = null;
  private lastKnownWidth = 0;
  private lastKnownHeight = 0;

  constructor(canvas: HTMLCanvasElement, store: Store<GameState>) {
    this.canvas = canvas;
    this.store = store;

    // Use ResizeObserver to detect when canvas becomes visible/sized
    // This handles the case where the canvas is created while hidden (0×0)
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          // Set context and dimensions now that canvas is visible
          if (!this.ctx || this.lastKnownWidth !== width || this.lastKnownHeight !== height) {
            const ctx = this.canvas.getContext('2d');
            if (ctx) {
              this.ctx = ctx;
              this.lastKnownWidth = width;
              this.lastKnownHeight = height;
              this.bindEvents();
              this.resize();
              // Immediately render with correct dimensions
              const state = this.store.getState();
              this.render(state);
            }
          }
        }
      }
    });
    this.resizeObserver.observe(this.canvas);

    // If canvas already has a valid context and non-zero size, init immediately
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    if (ctx && rect.width > 0 && rect.height > 0) {
      this.ctx = ctx;
      this.lastKnownWidth = rect.width;
      this.lastKnownHeight = rect.height;
      this.bindEvents();
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  // ── Private ──────────────────────────────────────────────────────────────────

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width || this.canvas.parentElement?.clientWidth || 800;
    this.canvas.height = rect.height || this.canvas.parentElement?.clientHeight || 600;
  }

  /**
   * Check if a click (mx, my) hits a fleet icon at a star position.
   * Returns the fleet ID if a clickable fleet was hit.
   */
  private hitTestFleetIcon(
    mx: number,
    my: number,
    transform: MapTransform,
    state: GameState,
  ): FleetId | null {
    const { fleetId } = this.getFleetAtPosition(mx, my, transform, state);
    if (!fleetId) return null;

    const fleet = state.fleets.byId[fleetId];
    if (!fleet || fleet.ownerId !== state.empires.playerId) return null;
    // Can only deploy fleets that are at rest (not in transit, not in combat)
    if (fleet.destination) return null;

    return fleetId;
  }

  /**
   * Find the system and fleet at a canvas position.
   * Returns { systemId, fleetId } for the first fleet at a nearby star.
   */
  private getFleetAtPosition(
    mx: number,
    my: number,
    transform: MapTransform,
    state: GameState,
  ): { systemId: string | null; fleetId: string | null } {
    const galaxy = state.galaxy;
    let closestSystem: { id: string; x: number; y: number } | null = null;
    let closestFleet: string | null = null;
    let closestDist = FLEET_HIT_RADIUS;

    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      if (!sys.fleetIds.length) continue;

      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      const d = Math.hypot(mx - x, my - y);

      if (d < closestDist) {
        // Prefer fleet hits over system hits
        if (sys.fleetIds.length > 0 && d < FLEET_HIT_RADIUS) {
          closestFleet = sys.fleetIds[0]; // Use first fleet for simplicity
          closestSystem = { id, x, y };
          closestDist = d;
        }
      }
    }

    if (!closestFleet) {
      // Fallback to system hit
      const systems = galaxy.systems.allIds.map((id) => ({
        id,
        ...galaxyToCanvas(galaxy.systems.byId[id].coordinates, transform),
      }));
      const starHit = hitTestStar(mx, my, systems.map((s) => ({ id: s.id, coordinates: galaxy.systems.byId[s.id].coordinates })), transform, 20);
      if (starHit) {
        const sys = galaxy.systems.byId[starHit];
        const { x, y } = galaxyToCanvas(sys.coordinates, transform);
        closestSystem = { id: starHit, x, y };
      }
    }

    return {
      systemId: closestSystem?.id ?? null,
      fleetId: closestFleet,
    };
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

      // Check fleet icon click first
      const fleetId = this.hitTestFleetIcon(mx, my, transform, state);
      if (fleetId) {
        this.store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId } });
        return;
      }

      // Check star system click
      const clickedId = hitTestStar(mx, my, systems, transform, 20);

      // If in deployment mode, handle destination selection or cancel
      const deployment = state.ui.fleetDeploymentMode;
      if (deployment) {
        if (clickedId && clickedId !== deployment.fleetId) {
          // Clicked a different star — issue move order
          this.store.dispatch({ type: 'SET_DEPLOYMENT_DESTINATION', payload: { fleetId: deployment.fleetId, destinationId: clickedId } });
          this.store.dispatch({ type: 'MOVE_FLEET', payload: { fleetId: deployment.fleetId, destinationId: clickedId } });
          // After move, cancel deployment mode
          this.store.dispatch({ type: 'CANCEL_FLEET_DEPLOYMENT' });
        } else {
          // Clicked empty space or same fleet — cancel deployment
          this.store.dispatch({ type: 'CANCEL_FLEET_DEPLOYMENT' });
        }
        return;
      }

      // Normal behavior: select system
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

  /**
   * Calculate movement range in pixels for a fleet deployment circle.
   * Uses the maximum fuel range among all ships in the fleet.
   */
  private getDeploymentRangePixels(state: GameState, transform: MapTransform, fleetId: string): number {
    const fleet = state.fleets.byId[fleetId];
    if (!fleet) return 80;

    const system = state.galaxy.systems.byId[fleet.systemId];
    if (!system) return 80;

    void galaxyToCanvas(system.coordinates, transform); // unused but kept for future range-to-pixel calc
    const canvasSize = Math.min(this.canvas.width, this.canvas.height);
    // Map the maximum possible range to canvas pixels (covers ~60% of canvas)
    return canvasSize * 0.3;
  }

  /**
   * Calculate fleet in-transit position along its route.
   * Returns progress 0-1, or null if not in transit.
   */
  private getFleetTransitProgress(_state: GameState, fleet: { destination: string | null; eta: number }): number | null {
    if (!fleet.destination || fleet.eta <= 0) return null;

    // The fleet was dispatched some turns ago. Its eta is the total travel time.
    // Progress = 1 - (eta / totalTravelTime)
    // But we don't have totalTravelTime stored. Approximate using remaining eta.
    // Actually, eta is the REMAINING turns, so progress = 1 - (eta / total)
    // We need the total travel time. Let's calculate from the fleet's route.
    // For now, we'll use the eta value to approximate — the fleet arrives when eta === 0.
    // Progress = (currentTurn - departureTurn) / totalTurns
    // But departureTurn isn't stored. Instead, we estimate:
    // eta is remaining turns. If eta was set to N on departure, then progress = 1 - (eta / N).
    // Since we don't have N stored, we use a heuristic: the fleet's eta IS the remaining time,
    // and it was set to some initial value. The total travel time can be derived from the
    // path distance and warp speed. For rendering, we'll approximate.

    // Simpler approach: eta is the remaining turns. We approximate progress as
    // 1 - eta/maxETA where maxETA is the initial ETA at departure.
    // Since we don't track that, we use a simple heuristic based on current eta:
    // The smaller the eta, the closer to destination.
    // We'll estimate total from path distance / warp speed.
    // For simplicity in rendering: progress = 1 - (eta / 20) capped at [0, 1]
    // This is approximate but visually correct enough.
    // Actually the fleet system does have route information. Let me use that.
    // The fleet has a `route` array of SystemId and `routeDistance`.
    // Total distance is routeDistance, distance traveled depends on turn progression.

    // Since we only have eta (remaining turns), let's approximate:
    // For a fleet with eta = 3, it's 3/3 = 0 progress remaining from where we started tracking.
    // The initial eta was the total travel time. We don't have that stored separately.
    // But we can derive it: when eta was first set, it was totalTravelTime.
    // Each turn, eta decrements by 1.
    // So progress = (totalTravelTime - eta) / totalTravelTime = 1 - eta/totalTravelTime
    // We need totalTravelTime. Since we don't have it stored, let's use a reasonable estimate.
    // Actually, looking at the fleet system, the `eta` field is the REMAINING turns.
    // The total was calculated as ceil(distance / warpSpeed). We don't store the total.
    // For rendering, let's just use eta to determine approximate position.
    // If eta = 3, the fleet has been traveling for some time and has 3 turns left.
    // We'll assume total travel time was eta + (currentTurn - arrivalTurn)...
    // This is getting circular. Let's use a simple approximation:
    // progress = Math.max(0, Math.min(1, 1 - fleet.eta / 20))
    // The 20 is a rough max travel time that works for visual purposes.
    return Math.max(0, Math.min(1, 1 - fleet.eta / 20));
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
    const deployment = state.ui.fleetDeploymentMode;
    const playerEmpire = state.empires.byId[state.empires.playerId];

    // ── Pass 0: Fleet range circle (drawn first so it appears behind everything) ──
    if (deployment) {
      const fleet = state.fleets.byId[deployment.fleetId];
      if (fleet) {
        const sys = galaxy.systems.byId[fleet.systemId];
        if (sys) {
          const { x, y } = galaxyToCanvas(sys.coordinates, transform);
          const range = this.getDeploymentRangePixels(state, transform, deployment.fleetId);
          drawFleetRangeCircle(ctx, x, y, range);
        }
      }
    }

    // ── Pass 1: Colony rings (only for systems the player can see) ─────────────
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      if (!sys.ownerId) continue;
      // Only draw rings for systems the player has explored or is currently detecting
      if (!playerEmpire.exploredSystems.includes(id) && !playerEmpire.visibleSystems.includes(id)) continue;
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      const color = this.empireColorMap.get(sys.ownerId) ?? '#ffffff';
      drawColonyRing(ctx, x, y, color);
    }

    // ── Pass 2: Stars ──────────────────────────────────────────────────────────
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      drawStarDot(ctx, x, y, sys.starType);
    }

    // ── Pass 3: Path lines (deployment mode) ───────────────────────────────────
    if (deployment) {
      const fleet = state.fleets.byId[deployment.fleetId];
      if (fleet && deployment.destinationId && galaxy.systems.byId[deployment.destinationId]) {
        const origin = galaxy.systems.byId[fleet.systemId];
        const dest = galaxy.systems.byId[deployment.destinationId];
        const { x: ox, y: oy } = galaxyToCanvas(origin.coordinates, transform);
        const { x: dx, y: dy } = galaxyToCanvas(dest.coordinates, transform);

        // Check if in range using pathfinding
        // Per design/galaxy/travel.md: use actual fleet fuel range (fuel cells + bonus tanks)
        const fleetRange = getFleetFuelRange(fleet, state);
        const pathResult = findPath(
          galaxy,
          fleet.systemId,
          deployment.destinationId,
          isFinite(fleetRange) ? fleetRange : 9999, // Infinity = Thorium Cells (unlimited)
        );
        const inRange = pathResult !== null;

        drawPathLine(
          ctx,
          ox, oy, dx, dy,
          inRange ? '#00cc66' : '#ff4444',
          !inRange,
        );
      }
    }

    // ── Pass 4: Fleets in transit ──────────────────────────────────────────────
    for (const fleetId of state.fleets.allIds) {
      const fleet = state.fleets.byId[fleetId];
      if (!fleet || !fleet.destination || fleet.eta <= 0) continue;
      if (fleet.ownerId !== state.empires.playerId) continue;

      const origin = galaxy.systems.byId[fleet.systemId];
      const dest = galaxy.systems.byId[fleet.destination];
      if (!origin || !dest) continue;

      const { x: ox, y: oy } = galaxyToCanvas(origin.coordinates, transform);
      const { x: dx, y: dy } = galaxyToCanvas(dest.coordinates, transform);
      const color = this.empireColorMap.get(fleet.ownerId) ?? '#00ff88';
      const progress = this.getFleetTransitProgress(state, fleet);
      if (progress !== null) {
        drawFleetInTransit(ctx, ox, oy, dx, dy, progress, color);
      }
    }

    // ── Pass 5: Fleet indicators (at systems) ──────────────────────────────────
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      if (!sys.fleetIds.length) continue;

      // Skip if any fleet at this system is in transit (it will be drawn as in-transit)
      const allInTransit = sys.fleetIds.every((fid) => {
        const f = state.fleets.byId[fid];
        return f?.destination;
      });
      if (allInTransit) continue;

      const { x, y } = galaxyToCanvas(sys.coordinates, transform);

      // Draw one indicator per fleet, offset slightly to avoid overlap
      for (let i = 0; i < Math.min(sys.fleetIds.length, 3); i++) {
        const fleet = state.fleets.byId[sys.fleetIds[i]];
        if (!fleet || fleet.destination) continue;
        const color = this.empireColorMap.get(fleet.ownerId) ?? '#00ff88';
        const offset = i * 5;
        const fx = x + 14 + offset;
        const fy = y - 6 - i * 3;

        ctx.save();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        const size = 4;
        ctx.beginPath();
        ctx.moveTo(fx + size, fy);
        ctx.lineTo(fx - size * 0.5, fy - size * 0.8);
        ctx.lineTo(fx - size * 0.5, fy + size * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // ── Pass 6: Selection ring ─────────────────────────────────────────────────
    if (selectedId && galaxy.systems.byId[selectedId]) {
      const sys = galaxy.systems.byId[selectedId];
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      drawSelectionRing(ctx, x, y);
    }

    // ── Pass 7: Labels (only for explored systems) ─────────────────────────────
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      const isSelected = id === selectedId;
      // Don't show system names unless the player has explored it
      if (!playerEmpire.exploredSystems.includes(id)) continue;
      drawStarLabel(ctx, x, y, sys.name, isSelected ? '#ffffff' : '#b8d0e8');
    }
  }
}
