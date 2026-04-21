/**
 * Fleets Screen — MOO1-accurate fleet overview.
 * src/ui/screens/FleetsScreen.ts
 *
 * Full-screen modal displaying all player fleets organized by location.
 * Layout matches Master of Orion (1993) Fleet screen.
 *
 * Wireframes:
 *   design/ui-ux/wireframes/command_menu/command_menu_fleet.md
 *   design/ui-ux/wireframes/fleet-screen.md
 *
 * Hotkey: F3
 *
 * Acceptance criteria:
 *   1. Lists all player fleets
 *   2. Shows fleet location (system name or 'In Transit')
 *   3. Shows destination if moving
 *   4. Shows ship counts by design
 *   5. Click fleet to select on galaxy map
 *   6. Merge/split fleet buttons
 *   7. Accessible via F3 or command bar
 */

import { GameState, FleetId, ShipDesignId } from '../../game/state';
import { Store } from '../../game/store';

// ── Utility types ──────────────────────────────────────────────────────────────

interface DesignCell {
  designId: ShipDesignId;
  count: number;
}

// ── Pure utility functions (unit-testable) ─────────────────────────────────────

/**
 * Calculate total fleet maintenance cost across all fleets in the empire.
 * Uses the design-level maintenance × number of ships (pure game logic).
 *
 * @param state - Current game state
 * @returns Total BC per turn for fleet maintenance
 */
export function calculateFleetMaintenance(state: GameState): number {
  const playerId = state.empires.playerId;
  const empire = state.empires.byId[playerId];
  if (!empire) return 0;

  let total = 0;
  for (const fleetId of empire.fleets) {
    const fleet = state.fleets.byId[fleetId];
    if (!fleet) continue;
    for (const shipId of fleet.shipIds) {
      const ship = state.ships.byId[shipId];
      if (!ship) continue;
      const design = state.shipDesigns.byId[ship.designId];
      if (!design) continue;
      total += design.stats.maintenance;
    }
  }
  return total;
}

/**
 * Group ships in a fleet by design and count.
 * @param state - Current game state
 * @param fleetId - The fleet to analyze
 * @returns Array of { designId, count } entries
 */
export function groupFleetShipsByDesign(state: GameState, fleetId: FleetId): DesignCell[] {
  const fleet = state.fleets.byId[fleetId];
  if (!fleet) return [];

  const counts = new Map<ShipDesignId, number>();
  for (const shipId of fleet.shipIds) {
    const ship = state.ships.byId[shipId];
    if (!ship) continue;
    counts.set(ship.designId, (counts.get(ship.designId) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 0)
    .map(([designId, count]) => ({ designId, count }));
}

/**
 * Format the SYSTEM column display for a fleet row.
 * - Idle fleet: system name
 * - In-transit: "→ DESTINATION" + "ETA: N" on separate lines
 *
 * @param systemName - Name of the current or destination system
 * @param destinationName - Name of the destination (null = idle)
 * @param eta - Turns until arrival (0 = not moving)
 * @returns HTML-safe string for the SYSTEM cell
 */
export function formatFleetStatusLine(
  systemName: string,
  destinationName: string | null,
  eta: number,
): string {
  if (destinationName && eta > 0) {
    return `${escapeHtml(destinationName)}\nETA: ${eta}`;
  }
  return systemName;
}

// ── HTML/JSX helper ──────────────────────────────────────────────────────────

/**
 * Safely insert text content into an element.
 * (DOM helper — only in ui/screens, not in src/game/)
 */
function setSafeText(el: HTMLElement, text: string): void {
  el.textContent = '';
  el.appendChild(document.createTextNode(text));
}

// ── FleetsScreen class ────────────────────────────────────────────────────────

export class FleetsScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  // Bound event listeners (stable refs for cleanup)
  private readonly onClose: () => void;
  private readonly onKeyDown: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;

    this.onClose = () => this.handleClose();
    this.onKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);

    this.buildLayout();
    this.bindEvents();
  }

  // ── Public interface ────────────────────────────────────────────────────────

  show(): void {
    this.container.classList.add('active');
    this.render(this.store.getState());
  }

  hide(): void {
    this.container.classList.remove('active');
  }

  destroy(): void {
    this.container.classList.remove('active');
    this.container.innerHTML = '';
    document.removeEventListener('keydown', this.onKeyDown);
  }

  // ── Layout construction ────────────────────────────────────────────────────

  private buildLayout(): void {
    this.container.innerHTML = '';
    this.container.classList.add('fleets-screen');

    // ── Header ────────────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'fleets-header';
    header.innerHTML = `
      <h1 class="fleets-title">FLEET OVERVIEW</h1>
      <div class="fleets-rule"></div>
    `;
    this.container.appendChild(header);

    // ── Table ─────────────────────────────────────────────────────────────
    const table = document.createElement('table');
    table.className = 'fleets-table';

    const thead = document.createElement('thead');
    this.theadEl = thead;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    this.tbodyEl = tbody;
    table.appendChild(tbody);

    this.container.appendChild(table);

    // ── Footer ────────────────────────────────────────────────────────────
    const footer = document.createElement('div');
    footer.className = 'fleets-footer';

    // Left: fleet maintenance display
    this.maintenanceEl = document.createElement('div');
    this.maintenanceEl.className = 'fleets-maintenance';
    footer.appendChild(this.maintenanceEl);

    // Right: action buttons
    const actions = document.createElement('div');
    actions.className = 'fleets-actions';

    const specsBtn = document.createElement('button');
    specsBtn.className = 'fleets-btn fleets-btn-specs';
    setSafeText(specsBtn, 'SPECS');
    this.specsBtn = specsBtn;
    actions.appendChild(specsBtn);

    const scrapBtn = document.createElement('button');
    scrapBtn.className = 'fleets-btn fleets-btn-scrap';
    setSafeText(scrapBtn, 'SCRAP');
    this.scrapBtn = scrapBtn;
    actions.appendChild(scrapBtn);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'fleets-btn fleets-btn-close';
    setSafeText(closeBtn, 'OK');
    this.closeBtn = closeBtn;
    actions.appendChild(closeBtn);

    footer.appendChild(actions);
    this.container.appendChild(footer);
  }

  // ── Event wiring ─────────────────────────────────────────────────────────

  private bindEvents(): void {
    // ESC key closes the screen
    document.addEventListener('keydown', this.onKeyDown);

    // Button clicks
    this.closeBtn.addEventListener('click', this.onClose);
    this.specsBtn.addEventListener('click', () => this.handleSpecs());
    this.scrapBtn.addEventListener('click', () => this.handleScrap());
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render(state: GameState): void {
    const empire = state.empires.byId[state.empires.playerId];
    if (!empire) return;

    // Get all active ship designs for the player's empire
    const designIds = empire.shipDesigns;
    const designs: { id: ShipDesignId; name: string }[] = [];
    for (const id of designIds) {
      const design = state.shipDesigns.byId[id];
      if (design) designs.push({ id, name: design.name });
    }

    // Calculate total fleet maintenance
    const maintenanceCost = calculateFleetMaintenance(state);

    // ── Table header ──────────────────────────────────────────────────────
    let headerRow = '<tr><th>SYSTEM</th>';
    for (const design of designs) {
      headerRow += `<th>${escapeHtml(design.name)}</th>`;
    }
    headerRow += '</tr>';
    this.theadEl!.innerHTML = headerRow;

    // ── Table body ────────────────────────────────────────────────────────
    this.tbodyEl!.innerHTML = '';

    if (empire.fleets.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'fleets-empty-row';
      setSafeText(emptyRow, 'No fleets in your empire.');
      // Fill remaining cells with colspan
      const colCount = 1 + designs.length;
      emptyRow.setAttribute('colspan', colCount.toString());
      this.tbodyEl!.appendChild(emptyRow);
      return;
    }

    for (const fleetId of empire.fleets) {
      const fleet = state.fleets.byId[fleetId];
      if (!fleet) continue;

      const row = document.createElement('tr');
      row.className = 'fleets-row';
      row.setAttribute('data-fleet-id', fleetId);

      // System column
      const systemCell = document.createElement('td');
      systemCell.className = 'fleets-cell fleets-cell-system';
      const system = state.galaxy.systems.byId[fleet.systemId];
      const systemName = system ? system.name : fleet.systemId;

      if (fleet.destination && fleet.eta > 0) {
        const dest = state.galaxy.systems.byId[fleet.destination];
        const destName = dest ? dest.name : fleet.destination;
        systemCell.innerHTML = `
          <div class="fleets-fleet-status fleets-transit">
            <span class="fleets-arrow">&rarr;</span> ${escapeHtml(destName)}
            <div class="fleets-eta">ETA: ${fleet.eta}</div>
          </div>
        `;
      } else {
        setSafeText(systemCell, systemName);
        if (!system) {
          systemCell.classList.add('fleets-cell-missing');
        }
      }
      row.appendChild(systemCell);

      // Ship design columns
      const shipsByDesign = groupFleetShipsByDesign(state, fleetId);
      const counts = new Map<ShipDesignId, number>();
      for (const cell of shipsByDesign) {
        counts.set(cell.designId, cell.count);
      }

      for (const design of designs) {
        const cell = document.createElement('td');
        cell.className = 'fleets-cell';
        const count = counts.get(design.id) ?? 0;
        if (count > 0) {
          cell.innerHTML = `
            <div class="fleets-ship-cell">
              <div class="fleets-ship-icon"></div>
              <span class="fleets-ship-count">${count}</span>
            </div>
          `;
        }
        row.appendChild(cell);
      }

      // Click → select fleet (returns to galaxy map with fleet selected)
      row.addEventListener('click', () => {
        this.store.dispatch({ type: 'SELECT_FLEET', payload: { fleetId } });
      });

      this.tbodyEl!.appendChild(row);
    }

    // ── Footer ────────────────────────────────────────────────────────────
    setSafeText(this.maintenanceEl!, `Fleet Maintenance: ${maintenanceCost} BC/turn`);
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      this.handleClose();
    }
  }

  private handleClose(): void {
    this.hide();
    this.store.dispatch({ type: 'SHOW_SCREEN', payload: { screen: 'galaxy' } });
  }

  private handleSpecs(): void {
    // TODO: Open ship design specification viewer
    console.debug('[FleetsScreen] SPECS clicked — open design specs view');
  }

  private handleScrap(): void {
    // TODO: Open scrap interface for selected fleet
    console.debug('[FleetsScreen] SCRAP clicked — open scrap interface');
  }

  // ── Private references ───────────────────────────────────────────────────

  private theadEl!: HTMLTableSectionElement;
  private tbodyEl!: HTMLTableSectionElement;
  private maintenanceEl!: HTMLElement;
  private specsBtn!: HTMLButtonElement;
  private scrapBtn!: HTMLButtonElement;
  private closeBtn!: HTMLButtonElement;
}

// ── HTML escape utility ───────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Exports ───────────────────────────────────────────────────────────────────

export default FleetsScreen;
