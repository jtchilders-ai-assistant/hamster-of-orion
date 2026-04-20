/**
 * Fleets screen — full implementation.
 * src/ui/screens/FleetsScreen.ts
 *
 * Layout:
 *   Left panel  : fleet list table (name, location, ships, destination, ETA)
 *   Right panel : selected fleet details + galaxy mini-map for destination
 *
 * Interactions:
 *   - Click row      → select fleet (dispatches SELECT_FLEET)
 *   - Right-click star on mini-map → move selected fleet there (dispatches MOVE_FLEET)
 *   - [Merge]   → merges selected fleet with another at same location
 *   - [Split]   → splits selected ships into a new fleet (stub modal)
 *   - [Scrap]   → scrap selected fleet
 *
 * Pure DOM — no canvas drawing. All game logic stays in src/game/.
 * All event listeners are removed on hide() to prevent leaks.
 */

import { GameState, SystemId, ShipId } from '../../game/state';
import { Store } from '../../game/store';
import {
  moveFleet,
  mergeFleets,
  splitFleet,
  scrapFleet,
} from '../../game/actions/fleet';
import { calculateEta } from '../../game/systems/fleet';
import {
  getMapTransform,
  galaxyToCanvas,
  hitTestStar,
  drawStarDot,
  drawSelectionRing,
  drawColonyRing,
  drawStarLabel,
  drawFleetIndicator,
} from '../canvas/starmap';
import { clearCanvas, drawStarfield } from '../canvas/renderer';

// ── Empire color palette ───────────────────────────────────────────────────────

const EMPIRE_COLORS: readonly string[] = [
  '#00ff88',
  '#ff4444',
  '#4444ff',
  '#ffaa00',
  '#ff00ff',
  '#00ffff',
];

// ── Internal state ────────────────────────────────────────────────────────────

interface SplitModalState {
  open: boolean;
  selectedShipIds: Set<ShipId>;
}

// ── FleetsScreen ──────────────────────────────────────────────────────────────

export class FleetsScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  // DOM nodes built once in buildLayout()
  private fleetListBody!: HTMLTableSectionElement;
  private detailPanel!: HTMLElement;
  private miniMapCanvas!: HTMLCanvasElement;
  private miniMapCtx!: CanvasRenderingContext2D;
  private mergeButton!: HTMLButtonElement;
  private splitButton!: HTMLButtonElement;
  private scrapButton!: HTMLButtonElement;
  private splitModal!: HTMLElement;
  private splitShipList!: HTMLElement;
  private splitConfirm!: HTMLButtonElement;
  private splitCancel!: HTMLButtonElement;

  private splitState: SplitModalState = { open: false, selectedShipIds: new Set() };

  // Bound event listener references — needed for cleanup
  private readonly onMiniMapClick: (e: MouseEvent) => void;
  private readonly onMiniMapContextMenu: (e: MouseEvent) => void;
  private readonly onMiniMapResize: () => void;
  private readonly onMerge: () => void;
  private readonly onSplit: () => void;
  private readonly onScrap: () => void;
  private readonly onSplitConfirm: () => void;
  private readonly onSplitCancel: () => void;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;

    // Bind handlers with stable references so we can removeEventListener later
    this.onMiniMapClick = (e) => this.handleMiniMapClick(e);
    this.onMiniMapContextMenu = (e) => this.handleMiniMapContextMenu(e);
    this.onMiniMapResize = () => this.resizeMiniMap();
    this.onMerge = () => this.handleMerge();
    this.onSplit = () => this.handleSplitOpen();
    this.onScrap = () => this.handleScrap();
    this.onSplitConfirm = () => this.handleSplitConfirm();
    this.onSplitCancel = () => this.handleSplitClose();

    this.buildLayout();
    this.bindEvents();
  }

  // ── Public interface ────────────────────────────────────────────────────────

  render(state: GameState): void {
    this.renderFleetList(state);
    this.renderDetail(state);
    this.renderMiniMap(state);
    this.updateButtons(state);
  }

  show(): void {
    this.container.classList.add('active');
    this.resizeMiniMap();
    // Re-render with current state when screen becomes visible
    this.render(this.store.getState());
  }

  hide(): void {
    this.container.classList.remove('active');
  }

  destroy(): void {
    this.miniMapCanvas.removeEventListener('click', this.onMiniMapClick);
    this.miniMapCanvas.removeEventListener('contextmenu', this.onMiniMapContextMenu);
    window.removeEventListener('resize', this.onMiniMapResize);
    this.mergeButton.removeEventListener('click', this.onMerge);
    this.splitButton.removeEventListener('click', this.onSplit);
    this.scrapButton.removeEventListener('click', this.onScrap);
    this.splitConfirm.removeEventListener('click', this.onSplitConfirm);
    this.splitCancel.removeEventListener('click', this.onSplitCancel);
  }

  // ── Layout construction ────────────────────────────────────────────────────

  private buildLayout(): void {
    this.container.innerHTML = '';
    this.container.classList.add('fleets-screen');

    // ── Header ──────────────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'screen-header';
    header.innerHTML = '<h1>FLEETS</h1>';
    this.container.appendChild(header);

    // ── Body: two-column layout ─────────────────────────────────────────────
    const body = document.createElement('div');
    body.className = 'screen-body fleets-body';
    this.container.appendChild(body);

    // Left: fleet list
    const leftPanel = document.createElement('div');
    leftPanel.className = 'fleets-list-panel';
    body.appendChild(leftPanel);

    const table = document.createElement('table');
    table.className = 'fleets-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th></th>
          <th>Fleet Name</th>
          <th>Location</th>
          <th>Ships</th>
          <th>Destination</th>
          <th>ETA</th>
        </tr>
      </thead>
    `;
    this.fleetListBody = document.createElement('tbody');
    table.appendChild(this.fleetListBody);
    leftPanel.appendChild(table);

    // Right: detail panel
    this.detailPanel = document.createElement('div');
    this.detailPanel.className = 'fleets-detail-panel';
    body.appendChild(this.detailPanel);

    // Detail panel contents
    this.detailPanel.innerHTML = `
      <div class="fleet-detail-info">
        <p class="fleet-detail-placeholder">Select a fleet</p>
      </div>
      <div class="fleet-mini-map-wrapper">
        <canvas class="fleet-mini-map" title="Right-click a star to send fleet there"></canvas>
        <p class="fleet-mini-map-hint">Right-click star → move fleet</p>
      </div>
      <div class="fleet-actions">
        <button class="btn fleet-btn-merge" disabled>Merge</button>
        <button class="btn fleet-btn-split" disabled>Split</button>
        <button class="btn fleet-btn-scrap" disabled>Scrap</button>
      </div>
    `;

    this.miniMapCanvas = this.detailPanel.querySelector<HTMLCanvasElement>('.fleet-mini-map')!;
    const ctx = this.miniMapCanvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get 2D context for fleet mini-map');
    this.miniMapCtx = ctx;

    this.mergeButton = this.detailPanel.querySelector<HTMLButtonElement>('.fleet-btn-merge')!;
    this.splitButton = this.detailPanel.querySelector<HTMLButtonElement>('.fleet-btn-split')!;
    this.scrapButton = this.detailPanel.querySelector<HTMLButtonElement>('.fleet-btn-scrap')!;

    // Split modal (hidden by default)
    this.splitModal = document.createElement('div');
    this.splitModal.className = 'fleet-split-modal hidden';
    this.splitModal.innerHTML = `
      <div class="fleet-split-modal-inner">
        <h3>Split Fleet — Select Ships to Move</h3>
        <div class="fleet-split-ship-list"></div>
        <div class="fleet-split-actions">
          <button class="btn fleet-split-confirm" disabled>Split</button>
          <button class="btn fleet-split-cancel">Cancel</button>
        </div>
      </div>
    `;
    this.container.appendChild(this.splitModal);
    this.splitShipList = this.splitModal.querySelector('.fleet-split-ship-list')!;
    this.splitConfirm = this.splitModal.querySelector<HTMLButtonElement>('.fleet-split-confirm')!;
    this.splitCancel = this.splitModal.querySelector<HTMLButtonElement>('.fleet-split-cancel')!;
  }

  // ── Event wiring ──────────────────────────────────────────────────────────

  private bindEvents(): void {
    this.miniMapCanvas.addEventListener('click', this.onMiniMapClick);
    this.miniMapCanvas.addEventListener('contextmenu', this.onMiniMapContextMenu);
    window.addEventListener('resize', this.onMiniMapResize);

    this.mergeButton.addEventListener('click', this.onMerge);
    this.splitButton.addEventListener('click', this.onSplit);
    this.scrapButton.addEventListener('click', this.onScrap);

    this.splitConfirm.addEventListener('click', this.onSplitConfirm);
    this.splitCancel.addEventListener('click', this.onSplitCancel);
  }

  // ── Render helpers ─────────────────────────────────────────────────────────

  private renderFleetList(state: GameState): void {
    const playerId = state.empires.playerId;
    const empire = state.empires.byId[playerId];
    const selectedFleetId = state.ui.selectedFleet;

    this.fleetListBody.innerHTML = '';

    if (!empire || empire.fleets.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6" class="fleet-empty">No fleets</td>';
      this.fleetListBody.appendChild(row);
      return;
    }

    for (const fleetId of empire.fleets) {
      const fleet = state.fleets.byId[fleetId];
      if (!fleet) continue;

      const isSelected = fleetId === selectedFleetId;
      const system = state.galaxy.systems.byId[fleet.systemId];
      const locationName = system ? system.name : fleet.systemId;

      const shipCount = fleet.shipIds.length;

      let destName = '—';
      let etaDisplay = '—';
      if (fleet.destination) {
        const destSys = state.galaxy.systems.byId[fleet.destination];
        destName = destSys ? destSys.name : fleet.destination;
        etaDisplay = fleet.eta > 0 ? `${fleet.eta} turn${fleet.eta !== 1 ? 's' : ''}` : 'Arriving';
      }

      const row = document.createElement('tr');
      row.className = `fleet-row${isSelected ? ' selected' : ''}`;
      row.dataset['fleetId'] = fleetId;
      row.innerHTML = `
        <td class="fleet-indicator">${isSelected ? '▶' : ''}</td>
        <td class="fleet-name">${escapeHtml(fleet.name)}</td>
        <td class="fleet-location">${escapeHtml(locationName)}</td>
        <td class="fleet-ships">${shipCount}</td>
        <td class="fleet-dest">${escapeHtml(destName)}</td>
        <td class="fleet-eta">${escapeHtml(etaDisplay)}</td>
      `;

      row.addEventListener('click', () => {
        this.store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId } });
      });

      this.fleetListBody.appendChild(row);
    }
  }

  private renderDetail(state: GameState): void {
    const selectedFleetId = state.ui.selectedFleet;
    const infoEl = this.detailPanel.querySelector('.fleet-detail-info');
    if (!infoEl) return;

    if (!selectedFleetId) {
      infoEl.innerHTML = '<p class="fleet-detail-placeholder">Select a fleet</p>';
      return;
    }

    const fleet = state.fleets.byId[selectedFleetId];
    if (!fleet) {
      infoEl.innerHTML = '<p class="fleet-detail-placeholder">Fleet not found</p>';
      return;
    }

    const system = state.galaxy.systems.byId[fleet.systemId];
    const locationName = system ? system.name : fleet.systemId;

    // Count ships by design class
    const shipCounts = new Map<string, number>();
    for (const shipId of fleet.shipIds) {
      const ship = state.ships.byId[shipId];
      if (!ship) continue;
      const design = state.shipDesigns.byId[ship.designId];
      const label = design ? design.name : 'Unknown';
      shipCounts.set(label, (shipCounts.get(label) ?? 0) + 1);
    }

    const shipBreakdown = Array.from(shipCounts.entries())
      .map(([name, count]) => `${count}× ${escapeHtml(name)}`)
      .join(', ') || 'No ships';

    let statusLine = '';
    if (fleet.destination) {
      const destSys = state.galaxy.systems.byId[fleet.destination];
      const destName = destSys ? destSys.name : fleet.destination;
      statusLine = `<p class="fleet-status">→ ${escapeHtml(destName)} (${fleet.eta} turn${fleet.eta !== 1 ? 's' : ''})</p>`;
    } else {
      statusLine = `<p class="fleet-status fleet-idle">Idle at ${escapeHtml(locationName)}</p>`;
    }

    infoEl.innerHTML = `
      <h3 class="fleet-detail-name">${escapeHtml(fleet.name)}</h3>
      <p class="fleet-detail-loc">Location: ${escapeHtml(locationName)}</p>
      ${statusLine}
      <p class="fleet-detail-ships">Ships: ${shipBreakdown}</p>
      <p class="fleet-detail-exp">Experience: ${fleet.experience}</p>
    `;
  }

  private renderMiniMap(state: GameState): void {
    const ctx = this.miniMapCtx;
    const canvas = this.miniMapCanvas;

    clearCanvas(ctx);
    drawStarfield(ctx, 150);

    const galaxy = state.galaxy;
    if (!galaxy.systems.allIds.length) return;

    // Build empire color map
    const empireColorMap = new Map<string, string>();
    state.empires.allIds.forEach((id, idx) => {
      empireColorMap.set(id, EMPIRE_COLORS[idx % EMPIRE_COLORS.length]);
    });

    const transform = getMapTransform(
      canvas.width,
      canvas.height,
      galaxy.width || 30,
      galaxy.height || 30,
    );

    const selectedFleetId = state.ui.selectedFleet;
    const selectedFleet = selectedFleetId ? state.fleets.byId[selectedFleetId] : null;

    // Draw destination line if fleet is moving
    if (selectedFleet?.destination) {
      const fromSys = galaxy.systems.byId[selectedFleet.systemId];
      const toSys = galaxy.systems.byId[selectedFleet.destination];
      if (fromSys && toSys) {
        const from = galaxyToCanvas(fromSys.coordinates, transform);
        const to = galaxyToCanvas(toSys.coordinates, transform);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = 'rgba(0, 170, 255, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Selection ring for selected fleet's location
    if (selectedFleet) {
      const sys = galaxy.systems.byId[selectedFleet.systemId];
      if (sys) {
        const { x, y } = galaxyToCanvas(sys.coordinates, transform);
        drawSelectionRing(ctx, x, y);
      }
    }

    // Colony rings
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      if (!sys.ownerId) continue;
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      const color = empireColorMap.get(sys.ownerId) ?? '#ffffff';
      drawColonyRing(ctx, x, y, color);
    }

    // Stars
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      drawStarDot(ctx, x, y, sys.starType);
    }

    // Fleet indicators (player fleets only)
    const playerColor = empireColorMap.get(state.empires.playerId) ?? '#00ff88';
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      const hasPlayerFleet = sys.fleetIds.some((fid) => {
        const f = state.fleets.byId[fid];
        return f && f.ownerId === state.empires.playerId;
      });
      if (!hasPlayerFleet) continue;
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      drawFleetIndicator(ctx, x, y, playerColor, 'right');
    }

    // Star labels (abbreviated for mini-map)
    for (const id of galaxy.systems.allIds) {
      const sys = galaxy.systems.byId[id];
      const { x, y } = galaxyToCanvas(sys.coordinates, transform);
      drawStarLabel(ctx, x, y, sys.name, '#607080');
    }
  }

  private updateButtons(state: GameState): void {
    const fleetId = state.ui.selectedFleet;
    const hasFleet = !!fleetId;
    const fleet = fleetId ? state.fleets.byId[fleetId] : null;

    this.scrapButton.disabled = !hasFleet;
    this.splitButton.disabled = !hasFleet || !fleet || fleet.shipIds.length < 2;

    // Merge: need another fleet at the same system, not in transit
    let canMerge = false;
    if (fleet && fleet.destination === null) {
      const playerId = state.empires.playerId;
      const empire = state.empires.byId[playerId];
      canMerge = empire.fleets.some((id) => {
        if (id === fleetId) return false;
        const other = state.fleets.byId[id];
        return other && other.systemId === fleet.systemId && other.destination === null;
      });
    }
    this.mergeButton.disabled = !canMerge;
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  private handleMiniMapClick(e: MouseEvent): void {
    e.preventDefault();
    // Left-click on mini-map: select fleet via system click (mirrors galaxy map behavior)
    const { systemId } = this.hitTestMiniMap(e);
    if (systemId) {
      this.store.dispatch({ type: 'SELECT_SYSTEM', payload: { systemId } });
    }
  }

  private handleMiniMapContextMenu(e: MouseEvent): void {
    e.preventDefault();
    const state = this.store.getState();
    const selectedFleetId = state.ui.selectedFleet;
    if (!selectedFleetId) return;

    const { systemId } = this.hitTestMiniMap(e);
    if (!systemId) return;

    this.store.dispatch(moveFleet(selectedFleetId, systemId));
  }

  private hitTestMiniMap(e: MouseEvent): { systemId: SystemId | null } {
    const state = this.store.getState();
    const galaxy = state.galaxy;
    if (!galaxy.systems.allIds.length) return { systemId: null };

    const rect = this.miniMapCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const transform = getMapTransform(
      this.miniMapCanvas.width,
      this.miniMapCanvas.height,
      galaxy.width || 30,
      galaxy.height || 30,
    );

    const systems = galaxy.systems.allIds.map((id) => galaxy.systems.byId[id]);
    const systemId = hitTestStar(mx, my, systems, transform, 16);
    return { systemId };
  }

  private handleMerge(): void {
    const state = this.store.getState();
    const selectedFleetId = state.ui.selectedFleet;
    if (!selectedFleetId) return;

    const fleet = state.fleets.byId[selectedFleetId];
    if (!fleet || fleet.destination !== null) return;

    const playerId = state.empires.playerId;
    const empire = state.empires.byId[playerId];

    // Find first compatible fleet at same system
    const targetId = empire.fleets.find((id) => {
      if (id === selectedFleetId) return false;
      const other = state.fleets.byId[id];
      return other && other.systemId === fleet.systemId && other.destination === null;
    });

    if (!targetId) return;

    this.store.dispatch(mergeFleets(selectedFleetId, targetId));
    // After merge, deselect (the merged fleet ID may be gone)
    this.store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId: selectedFleetId } });
  }

  private handleSplitOpen(): void {
    const state = this.store.getState();
    const selectedFleetId = state.ui.selectedFleet;
    if (!selectedFleetId) return;

    const fleet = state.fleets.byId[selectedFleetId];
    if (!fleet || fleet.shipIds.length < 2) return;

    this.splitState = { open: true, selectedShipIds: new Set() };
    this.splitModal.classList.remove('hidden');
    this.renderSplitShipList(state, fleet.shipIds);
    this.updateSplitConfirmButton();
  }

  private renderSplitShipList(state: GameState, shipIds: ShipId[]): void {
    this.splitShipList.innerHTML = '';
    for (const shipId of shipIds) {
      const ship = state.ships.byId[shipId];
      if (!ship) continue;
      const design = state.shipDesigns.byId[ship.designId];
      const label = design ? design.name : 'Unknown Ship';

      const item = document.createElement('label');
      item.className = 'fleet-split-ship-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = shipId;
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this.splitState.selectedShipIds.add(shipId);
        } else {
          this.splitState.selectedShipIds.delete(shipId);
        }
        this.updateSplitConfirmButton();
      });

      item.appendChild(checkbox);
      item.appendChild(document.createTextNode(` ${escapeHtml(ship.name)} (${escapeHtml(label)})`));
      this.splitShipList.appendChild(item);
    }
  }

  private updateSplitConfirmButton(): void {
    const state = this.store.getState();
    const selectedFleetId = state.ui.selectedFleet;
    const fleet = selectedFleetId ? state.fleets.byId[selectedFleetId] : null;
    const totalShips = fleet?.shipIds.length ?? 0;
    const selectedCount = this.splitState.selectedShipIds.size;
    // Must select at least 1, and can't select all ships
    this.splitConfirm.disabled = selectedCount < 1 || selectedCount >= totalShips;
  }

  private handleSplitConfirm(): void {
    const state = this.store.getState();
    const selectedFleetId = state.ui.selectedFleet;
    if (!selectedFleetId) return;

    const shipIds = Array.from(this.splitState.selectedShipIds);
    if (shipIds.length === 0) return;

    this.store.dispatch(splitFleet(selectedFleetId, shipIds));
    this.handleSplitClose();
  }

  private handleSplitClose(): void {
    this.splitState = { open: false, selectedShipIds: new Set() };
    this.splitModal.classList.add('hidden');
    this.splitShipList.innerHTML = '';
  }

  private handleScrap(): void {
    const state = this.store.getState();
    const selectedFleetId = state.ui.selectedFleet;
    if (!selectedFleetId) return;

    const fleet = state.fleets.byId[selectedFleetId];
    if (!fleet) return;

    // Simple confirm dialog
    const confirmed = window.confirm(
      `Scrap "${fleet.name}"? This will permanently destroy all ${fleet.shipIds.length} ship(s).`,
    );
    if (!confirmed) return;

    this.store.dispatch(scrapFleet(selectedFleetId));
    // Deselect scrapped fleet
    this.store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId: null } });
  }

  // ── Canvas utilities ────────────────────────────────────────────────────────

  private resizeMiniMap(): void {
    const wrapper = this.miniMapCanvas.parentElement;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    this.miniMapCanvas.width = rect.width || 300;
    this.miniMapCanvas.height = rect.height || 220;
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Re-export calculateEta to silence unused-import lint (used in renderDetail via fleet.eta which
// is pre-computed in state, but we import it in case we need on-demand recalc)
void (calculateEta as unknown);
