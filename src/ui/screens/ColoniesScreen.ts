/**
 * Colonies / Planet List screen — full implementation.
 * src/ui/screens/ColoniesScreen.ts
 *
 * Corresponds to the PLANETS button (F2) in the command bar.
 * Shows a tabular list of all player colonies with key stats,
 * sortable columns, and three bottom panels (SPENDING / TOTALS / FINANCE).
 *
 * Design doc: design/ui-ux/wireframes/command_menu/command_menu_planets.md
 *
 * Column layout:
 *   IMG | PLANET NAME | POP (segmented bar) | FACT | SHD | BASE | WST | PROD | BUILDING
 *
 * Bottom panels:
 *   SPENDING — empire-wide per-turn expenditures (SHIPS, BASES, SPYING, SECURITY)
 *   TOTALS   — net empire income (TRADE, PLANETS, TOTAL)
 *   FINANCE  — reserve balance + transfer controls for selected planet
 *
 * Interactions:
 *   - Click row → select planet for finance ops
 *   - Double-click → open Planet Detail screen
 *   - Column headers → sort by that column
 *   - [▲] / [▼] → adjust BC transfer amount
 *   - [TRANSFER] → move BCs to selected planet's industry
 *   - [OK] → return to Galaxy Map
 */

import {
  GameState,
  PlanetId,
  Planet,
  SystemId,
} from '../../game/state';
import { Store } from '../../game/store';

// ── Column definitions ────────────────────────────────────────────────────────

export type SortColumn = 'name' | 'population' | 'factories' | 'production';
export type SortOrder = 'asc' | 'desc';

export interface PlanetSortInfo {
  column: SortColumn;
  order: SortOrder;
}

// ── Planet row data (derived from state for rendering) ─────────────────────────

export interface PlanetRowData {
  id: PlanetId;
  systemId: SystemId;
  name: string;
  type: string;
  population: number;
  maxPopulation: number;
  factories: number;
  shield: number;
  bases: number;
  waste: number;
  production: number; // BC/turn
  building: string;
  /** Filled segment count for the population bar. */
  popSegments: number;
  /** Total capacity segments. */
  popTotal: number;
}

// ── Planet image maps ─────────────────────────────────────────────────────────

export const PLANET_TYPE_ICONS: Record<string, string> = {
  terran: '🌍',
  ocean: '🌊',
  jungle: '🌿',
  arid: '🏜️',
  tundra: '❄️',
  toxic: '☢️',
  radiated: '☢️',
  barren: '🪨',
  dead: '💀',
  gas_giant: '🪐',
  gaia: '🌿',
  steppe: '🌾',
  desert: '🏜️',
  minimal: '🌑',
  inferno: '🔥',
};

// ── Population bar segment count (from design doc) ────────────────────────────

export const POP_BAR_SEGMENTS = 10;

// ── Finance transfer step amounts ─────────────────────────────────────────────

export const TRANSFER_STEP_VALUES = [1, 5, 10, 25, 50, 100, 500, 1000];

// ── ColoniesScreen ────────────────────────────────────────────────────────────

export class ColoniesScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  // DOM nodes built once
  private planetListBody!: HTMLTableSectionElement;
  private planetTable!: HTMLTableElement;
  private spendingShips!: HTMLElement;
  private spendingBases!: HTMLElement;
  private spendingSpying!: HTMLElement;
  private spendingSecurity!: HTMLElement;
  private totalsTrade!: HTMLElement;
  private totalsPlanets!: HTMLElement;
  private totalsTotal!: HTMLElement;
  private reserveDisplay!: HTMLElement;
  private transferAmountField!: HTMLSpanElement;
  private transferIncrementBtn!: HTMLButtonElement;
  private transferDecrementBtn!: HTMLButtonElement;
  private transferBtn!: HTMLButtonElement;
  private okBtn!: HTMLButtonElement;

  // Internal state
  private selectedPlanetId: PlanetId | null = null;
  private sortInfo: PlanetSortInfo = { column: 'name', order: 'asc' };
  private transferAmount: number = 0;

  // Bound event listeners for cleanup
  private readonly onTransferIncrement: () => void;
  private readonly onTransferDecrement: () => void;
  private readonly onTransfer: () => void;
  private readonly onOk: () => void;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;

    this.onTransferIncrement = () => this.adjustTransfer(1);
    this.onTransferDecrement = () => this.adjustTransfer(-1);
    this.onTransfer = () => this.handleTransfer();
    this.onOk = () => this.handleOk();

    this.buildLayout();
    this.bindEvents();
  }

  // ── Public interface ───────────────────────────────────────────────────────

  render(state: GameState): void {
    this.renderPlanetTable(state);
    this.renderBottomPanels(state);
    this.updateTransferUI();
  }

  show(): void {
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.classList.remove('active');
  }

  destroy(): void {
    this.container.removeEventListener('click', this.onTransferIncrement);
    this.transferIncrementBtn.removeEventListener('click', this.onTransferIncrement);
    this.transferDecrementBtn.removeEventListener('click', this.onTransferDecrement);
    this.transferBtn.removeEventListener('click', this.onTransfer);
    this.okBtn.removeEventListener('click', this.onOk);
  }

  // ── Layout construction ─────────────────────────────────────────────────────

  private buildLayout(): void {
    this.container.innerHTML = '';
    this.container.classList.add('colonies-screen');

    // ── Header ──────────────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'screen-header';
    header.innerHTML = '<h1>PLANETS &amp; COLONIES</h1>';
    this.container.appendChild(header);

    // ── Planet list ─────────────────────────────────────────────────────────
    const listContainer = document.createElement('div');
    listContainer.className = 'colonies-list-container';
    this.container.appendChild(listContainer);

    this.planetTable = document.createElement('table');
    this.planetTable.className = 'colonies-table';
    listContainer.appendChild(this.planetTable);

    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th class="col-img"></th>
        <th class="col-name" data-sort="name">PLANET NAME ⇅</th>
        <th class="col-pop" data-sort="population">POP ⇅</th>
        <th class="col-fact" data-sort="factories">FACT</th>
        <th class="col-shd">SHD</th>
        <th class="col-base">BASE</th>
        <th class="col-wst">WST</th>
        <th class="col-prod" data-sort="production">PROD</th>
        <th class="col-building">BUILDING</th>
      </tr>
    `;
    this.planetTable.appendChild(thead);

    this.planetListBody = document.createElement('tbody');
    this.planetTable.appendChild(this.planetListBody);

    // ── Bottom panels ───────────────────────────────────────────────────────
    const bottomPanels = document.createElement('div');
    bottomPanels.className = 'colonies-bottom-panels';
    this.container.appendChild(bottomPanels);

    // Left: SPENDING
    const spendingPanel = document.createElement('div');
    spendingPanel.className = 'bottom-panel spending-panel';
    spendingPanel.innerHTML = `
      <h2>SPENDING</h2>
      <div class="panel-row"><span class="panel-label">SHIPS:</span> <span class="panel-value spending-ships">0.0 BC</span></div>
      <div class="panel-row"><span class="panel-label">BASES:</span> <span class="panel-value spending-bases">0.0 BC</span></div>
      <div class="panel-row"><span class="panel-label">SPYING:</span> <span class="panel-value spending-spying">0.0 BC</span></div>
      <div class="panel-row"><span class="panel-label">SECURITY:</span> <span class="panel-value spending-security">0.0 BC</span></div>
    `;
    bottomPanels.appendChild(spendingPanel);
    this.spendingShips = spendingPanel.querySelector('.spending-ships')!;
    this.spendingBases = spendingPanel.querySelector('.spending-bases')!;
    this.spendingSpying = spendingPanel.querySelector('.spending-spying')!;
    this.spendingSecurity = spendingPanel.querySelector('.spending-security')!;

    // Center: TOTALS
    const totalsPanel = document.createElement('div');
    totalsPanel.className = 'bottom-panel totals-panel';
    totalsPanel.innerHTML = `
      <h2>TOTALS</h2>
      <div class="panel-row"><span class="panel-label">TRADE:</span> <span class="panel-value totals-trade">0 BC</span></div>
      <div class="panel-row"><span class="panel-label">PLANETS:</span> <span class="panel-value totals-planets">0 BC</span></div>
      <div class="panel-row totals-total-row"><span class="panel-label">TOTAL:</span> <span class="panel-value totals-total">0 BC</span></div>
    `;
    bottomPanels.appendChild(totalsPanel);
    this.totalsTrade = totalsPanel.querySelector('.totals-trade')!;
    this.totalsPlanets = totalsPanel.querySelector('.totals-planets')!;
    this.totalsTotal = totalsPanel.querySelector('.totals-total')!;

    // Right: FINANCE
    const financePanel = document.createElement('div');
    financePanel.className = 'bottom-panel finance-panel';
    financePanel.innerHTML = `
      <h2>FINANCE</h2>
      <div class="finance-reserve-row"><span class="panel-label">RESERVE:</span> <span class="panel-value finance-reserve">0 BC</span></div>
      <div class="finance-transfer-row">
        <button class="btn-transfer-arrow" id="transfer-up" title="Increase transfer amount">▲</button>
        <span class="transfer-amount" id="transfer-amount">0</span>
        <button class="btn-transfer-arrow" id="transfer-down" title="Decrease transfer amount">▼</button>
      </div>
      <div class="finance-actions">
        <button class="btn-finance btn-transfer" id="transfer-btn">TRANSFER</button>
        <button class="btn-finance btn-ok" id="ok-btn">OK</button>
      </div>
    `;
    bottomPanels.appendChild(financePanel);
    this.reserveDisplay = financePanel.querySelector('.finance-reserve')!;
    this.transferAmountField = financePanel.querySelector('#transfer-amount')!;
    this.transferIncrementBtn = financePanel.querySelector('#transfer-up')!;
    this.transferDecrementBtn = financePanel.querySelector('#transfer-down')!;
    this.transferBtn = financePanel.querySelector('#transfer-btn')!;
    this.okBtn = financePanel.querySelector('#ok-btn')!;
  }

  // ── Event wiring ────────────────────────────────────────────────────────────

  private bindEvents(): void {
    // Column header sort clicks
    this.planetTable.querySelectorAll('th[data-sort]').forEach((th) => {
      (th as HTMLElement).style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const col = (th as HTMLElement).dataset.sort as SortColumn;
        this.handleSort(col);
      });
    });

    // Planet row click events (delegated via tbody)
    this.planetTable.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const row = target.closest('tr');
      if (!row) return;
      const planetId = (row as HTMLElement).dataset.planetId;
      if (!planetId) return;
      const isDoubleClick = (e as MouseEvent).detail === 2;
      if (isDoubleClick) {
        this.handleOpenPlanet(planetId);
      } else {
        this.handleSelectPlanet(planetId);
      }
    });

    // Transfer controls
    this.transferIncrementBtn.addEventListener('click', this.onTransferIncrement);
    this.transferDecrementBtn.addEventListener('click', this.onTransferDecrement);
    this.transferBtn.addEventListener('click', this.onTransfer);
    this.okBtn.addEventListener('click', this.onOk);
  }

  // ── Sort handling ───────────────────────────────────────────────────────────

  private handleSort(column: SortColumn): void {
    if (this.sortInfo.column === column) {
      this.sortInfo.order = this.sortInfo.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortInfo.column = column;
      this.sortInfo.order = 'asc';
    }
    this.updateSortHeaders();
    // Re-render will happen automatically on next render() call,
    // but also re-render immediately if state hasn't changed
    this.renderPlanetTable(this.store.getState());
  }

  private updateSortHeaders(): void {
    const nameTh = this.planetTable.querySelector<HTMLTableCellElement>('.col-name');
    const popTh  = this.planetTable.querySelector<HTMLTableCellElement>('.col-pop');
    const prodTh = this.planetTable.querySelector<HTMLTableCellElement>('.col-prod');

    if (nameTh) {
      nameTh.textContent = 'PLANET NAME' + (this.sortInfo.column === 'name'
        ? ` ${this.sortInfo.order === 'asc' ? '↑' : '↓'}`
        : ' ⇅');
    }
    if (popTh) {
      popTh.textContent = 'POP' + (this.sortInfo.column === 'population'
        ? ` ${this.sortInfo.order === 'asc' ? '↑' : '↓'}`
        : ' ⇅');
    }
    if (prodTh) {
      prodTh.textContent = 'PROD' + (this.sortInfo.column === 'production'
        ? ` ${this.sortInfo.order === 'asc' ? '↑' : '↓'}`
        : '');
    }
  }

  // ── Planet list rendering ──────────────────────────────────────────────────

  private renderPlanetTable(state: GameState): void {
    const playerId = state.empires.playerId;
    const empire = state.empires.byId[playerId];
    const selectedPlanetId = state.ui.selectedPlanet;

    // Collect player's planets
    if (!empire) {
      this.planetListBody.innerHTML = '<tr><td colspan="9" class="colonies-empty">No empire data available</td></tr>';
      return;
    }

    const planetData: PlanetRowData[] = empire.planets
      .map((pid) => state.planets.byId[pid])
      .filter((p): p is Planet => p !== undefined && p.isColonized && p.ownerId === playerId)
      .map((p) => this.buildPlanetRow(p))
      .sort((a, b) => this.sortByColumn(a, b, this.sortInfo));

    this.planetListBody.innerHTML = '';

    if (planetData.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="9" class="colonies-empty">No colonies found</td>';
      this.planetListBody.appendChild(row);
      return;
    }

    for (const data of planetData) {
      const isSelected = data.id === this.selectedPlanetId || data.id === selectedPlanetId;
      const row = document.createElement('tr');
      row.className = `colony-row${isSelected ? ' selected' : ''}`;
      row.dataset.planetId = data.id;

      const popBar = this.renderPopBar(data.popSegments, data.popTotal);

      const icon = PLANET_TYPE_ICONS[data.type] || '🌍';
      const buildingText = data.building || '—';

      row.innerHTML = `
        <td class="col-img">${icon}</td>
        <td class="col-name">${escapeHtml(data.name)}</td>
        <td class="col-pop">${popBar}<span class="pop-label">${data.population.toFixed(0)} / ${data.maxPopulation}</span></td>
        <td class="col-fact">${data.factories}</td>
        <td class="col-shd">${data.shield}</td>
        <td class="col-base">${data.bases}</td>
        <td class="col-wst">${data.waste.toFixed(1)}</td>
        <td class="col-prod">${data.production.toFixed(0)}</td>
        <td class="col-building">${escapeHtml(buildingText)}</td>
      `;

      this.planetListBody.appendChild(row);
    }
  }

  /** Build a PlanetRowData from a Planet, including derived fields. */
  private buildPlanetRow(planet: Planet): PlanetRowData {
    // Determine the building/production item
    const building = this.getBuildingDescription(planet);

    // Population bar: 10 segments, proportional to current/max
    const popSegments = Math.max(0, Math.min(POP_BAR_SEGMENTS, Math.round((planet.population / Math.max(planet.maxPopulation, 1)) * POP_BAR_SEGMENTS)));

    return {
      id: planet.id,
      systemId: planet.systemId,
      name: planet.name,
      type: planet.type,
      population: planet.population,
      maxPopulation: planet.maxPopulation,
      factories: planet.factories,
      shield: planet.planetaryShield,
      bases: planet.missileBases,
      waste: planet.waste,
      production: this.calculatePlanetProduction(planet),
      building,
      popSegments,
      popTotal: POP_BAR_SEGMENTS,
    };
  }

  /**
   * Determine what the planet's industry is currently building.
   * Per design/planets/production.md §Ship Construction:
   *   Display Text: `(Ship Name) & Turns` (e.g., "Scout 4")
   */
  private getBuildingDescription(planet: Planet): string {
    if (planet.buildQueue.length > 0) {
      const item = planet.buildQueue[0];
      return item.targetName;
    }

    // Check if a ship is in progress
    if (planet.currentDesignId !== null) {
      const state = this.store.getState();
      const design = state.shipDesigns.byId[planet.currentDesignId];
      if (design) {
        const planetProduction = this.calculatePlanetProduction(planet);
        const shipSliderAllocation = planet.production?.ship ?? 0;
        const productionPerTurn = Math.max(1, planetProduction * (shipSliderAllocation / 100));
        const remainingCost = Math.max(0, design.stats.cost - planet.shipyardProgress);
        const turnsRemaining = Math.ceil(remainingCost / productionPerTurn);
        // Per design doc: "(Ship Name) & Turns" e.g., "Scout 4"
        return `${design.name} ${turnsRemaining}`;
      }
    }

    return '—';
  }

  /**
   * Calculate planet production in BC/turn.
   *
   * Per design/planets/population.md and design/economy/factory-formulas.md §3:
   *   Total_Production = (Factory_Production + Population_Production) × Mineral_Richness_Modifier
   *   Where:
   *     Factory_Production = Operating_Factories × 1.0 × Racial_Production_Modifier
   *     Population_Production = Population × Base_Pop_Output × Racial_Production_Modifier
   *     Base_Pop_Output = 0.5 + (Planetology_TL / 50 × 1.5)
   *
   * NOTE: This is a simplified display estimate for the colonies list view.
   * The full production calculation with racial modifiers, mineral richness,
   * Planetology tech scaling, and Mice factory efficiency lives in
   * src/game/systems/production.ts and requires a full ProductionContext.
   *
   * For accurate display, this should ideally call the production system,
   * but for the list view a baseline estimate (factories × 1 + pop × 0.5)
   * provides reasonable approximation at game start (Planetology TL ≈ 1).
   */
  private calculatePlanetProduction(planet: Planet): number {
    // Simplified baseline estimate for list display.
    // At game start (TL 1), Base_Pop_Output ≈ 0.53 ≈ 0.5
    // Does not include mineral richness or racial modifiers.
    const factoryOutput = planet.factories * 1.0;
    const popOutput = planet.population * 0.5;
    return factoryOutput + popOutput;
  }

  /** Sort comparison function for PlanetRowData. */
  private sortByColumn(
    a: PlanetRowData,
    b: PlanetRowData,
    sort: PlanetSortInfo,
  ): number {
    let cmp = 0;

    switch (sort.column) {
      case 'name':
        cmp = a.name.localeCompare(b.name);
        break;
      case 'population':
        cmp = a.population - b.population;
        break;
      case 'factories':
        cmp = a.factories - b.factories;
        break;
      case 'production':
        cmp = a.production - b.production;
        break;
    }

    return sort.order === 'asc' ? cmp : -cmp;
  }

  /** Render the population segmented bar. */
  private renderPopBar(
    filled: number,
    total: number,
  ): string {
    let bar = '';
    for (let i = 0; i < total; i++) {
      bar += i < filled ? '█' : '░';
    }
    return `<span class="pop-bar">${escapeHtml(bar)}</span>`;
  }

  // ── Bottom panels ───────────────────────────────────────────────────────────

  private renderBottomPanels(state: GameState): void {
    const playerId = state.empires.playerId;
    const player = state.empires.byId[playerId];
    if (!player) return;

    // SPENDING panel
    // Calculate empire-wide spending:
    //   SHIPS = sum of fleet maintenance
    //   BASES = sum of missile base maintenance
    //   SPYING = espionage spending
    //   SECURITY = counter-espionage spending
    let shipSpending = 0;
    let baseSpending = 0;

    for (const fid of player.fleets) {
      const fleet = state.fleets.byId[fid];
      if (!fleet) continue;
      // Fleet maintenance = sum of ship component maintenance
      for (const sid of fleet.shipIds) {
        const ship = state.ships.byId[sid];
        if (!ship) continue;
        const design = state.shipDesigns.byId[ship.designId];
        if (design) {
          shipSpending += design.stats.maintenance || 0;
        }
      }
    }

    for (const pid of player.planets) {
      const planet = state.planets.byId[pid];
      if (planet) {
        baseSpending += planet.missileBases * 0.5; // 0.5 BC per missile base
      }
    }

    const spyingSpend = player.securityLevel * 0.1; // Simplified
    const securitySpend = player.securityLevel * 0.05; // Simplified

    this.spendingShips.textContent = `${shipSpending.toFixed(1)} BC`;
    this.spendingBases.textContent = `${baseSpending.toFixed(1)} BC`;
    this.spendingSpying.textContent = `${spyingSpend.toFixed(1)} BC`;
    this.spendingSecurity.textContent = `${securitySpend.toFixed(1)} BC`;

    // TOTALS panel
    let planetProductionTotal = 0;
    for (const pid of player.planets) {
      const planet = state.planets.byId[pid];
      if (planet) {
        planetProductionTotal += this.calculatePlanetProduction(planet);
      }
    }

    // Trade income from active treaties
    let tradeIncome = 0;
    for (const rel of Object.values(player.relations)) {
      for (const treaty of rel.treaties) {
        if (treaty.isActive && treaty.type === 'trade' && treaty.terms.tradeIncome) {
          tradeIncome += treaty.terms.tradeIncome;
        }
      }
    }

    const totalIncome = tradeIncome + planetProductionTotal;

    this.totalsTrade.textContent = `${tradeIncome} BC`;
    this.totalsPlanets.textContent = `${planetProductionTotal.toFixed(0)} BC`;
    this.totalsTotal.textContent = `${totalIncome.toFixed(0)} BC`;

    // FINANCE panel
    this.reserveDisplay.textContent = `${player.credits} BC`;

    // Update transfer button state
    this.transferBtn.disabled = this.transferAmount <= 0 || this.transferAmount > player.credits;
  }

  // ── Transfer amount controls ────────────────────────────────────────────────

  private adjustTransfer(direction: 1 | -1): void {
    const currentIndex = TRANSFER_STEP_VALUES.indexOf(this.transferAmount);
    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = 0;
    if (newIndex >= TRANSFER_STEP_VALUES.length) newIndex = TRANSFER_STEP_VALUES.length - 1;

    this.transferAmount = TRANSFER_STEP_VALUES[newIndex];
    this.updateTransferUI();
  }

  private updateTransferUI(): void {
    this.transferAmountField.textContent = String(this.transferAmount);
  }

  // ── Action handlers ─────────────────────────────────────────────────────────

  private handleSelectPlanet(planetId: PlanetId): void {
    this.selectedPlanetId = planetId;
    this.renderPlanetTable(this.store.getState());
    this.store.dispatch({ type: 'SELECT_PLANET', payload: { planetId } });
  }

  private handleOpenPlanet(planetId: PlanetId): void {
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'planet' } });
    this.store.dispatch({ type: 'SELECT_PLANET', payload: { planetId } });
  }

  private handleTransfer(): void {
    const state = this.store.getState();
    const playerId = state.empires.playerId;
    const player = state.empires.byId[playerId];
    if (!player || this.transferAmount <= 0) return;
    if (this.transferAmount > player.credits) return;
    if (!this.selectedPlanetId) return;

    const planet = state.planets.byId[this.selectedPlanetId];
    if (!planet) return;

    // Transfer BCs to the selected planet's production (industry allocation)
    // This dispatches an action that will be handled by the game reducer
    this.store.dispatch({
      type: 'TRANSFER_BC',
      payload: {
        planetId: this.selectedPlanetId,
        amount: this.transferAmount,
      },
    });

    // Reset transfer amount after transfer
    this.transferAmount = TRANSFER_STEP_VALUES[0];
    this.updateTransferUI();
    this.renderBottomPanels(state);
  }

  private handleOk(): void {
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
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
