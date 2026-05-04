/**
 * Empire Dashboard — at-a-glance overview of empire status.
 * src/ui/screens/EmpireDashboardScreen.ts
 *
 * Displays a single-page summary of all key empire metrics:
 *   • Resources  — BC reserve, income/turn, maintenance costs
 *   • Population — total citizens, average growth rate
 *   • Production — industrial output, active shipyard queues
 *   • Military   — fleet count, ship count, breakdown by class
 *   • Research   — current tech, progress %, RP/turn
 *   • Colonies   — planet count, type distribution
 *
 * Navigable via the command bar or hotkey (no interactive sub-controls
 * beyond the OK button that returns to the galaxy map).
 */

import {
  GameState,
  Empire,
  Planet,
  Fleet,
  Ship,
  ShipDesign,
  ShipClass,
  PlanetType,
  ResearchState,
} from '../../game/state';
import { Store } from '../../game/store';

// ── (no standalone helper types needed — computation is inline) ──────────────

// ── EmpireDashboardScreen ─────────────────────────────────────────────────────

export class EmpireDashboardScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  // DOM refs updated by render()
  private turnYearEl!: HTMLElement;
  private empireNameEl!: HTMLElement;

  // Resource section
  private resReserve!: HTMLElement;
  private resIncome!: HTMLElement;
  private resMaint!: HTMLElement;
  private resNet!: HTMLElement;

  // Population section
  private popTotal!: HTMLElement;
  private popCapacity!: HTMLElement;
  private popGrowth!: HTMLElement;
  private popColonies!: HTMLElement;

  // Production section
  private prodFactories!: HTMLElement;
  private prodOutput!: HTMLElement;
  private prodShipsBuilding!: HTMLElement;
  private prodTurnsNext!: HTMLElement;

  // Military section
  private milFleets!: HTMLElement;
  private milShips!: HTMLElement;
  private milSmall!: HTMLElement;
  private milMedium!: HTMLElement;
  private milLarge!: HTMLElement;
  private milHuge!: HTMLElement;
  private milBases!: HTMLElement;

  // Research section
  private resToch!: HTMLElement;
  private resPct!: HTMLElement;
  private resRpTurn!: HTMLElement;
  private resTurns!: HTMLElement;
  private resCompleted!: HTMLElement;

  // Colony section
  private colTotal!: HTMLElement;
  private colHomeworld!: HTMLElement;
  private colTypesEl!: HTMLElement;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.container.classList.add('empire-dashboard-screen');
    this.buildLayout();
  }

  // ── Public interface ───────────────────────────────────────────────────────

  render(state: GameState): void {
    const playerId = state.empires.playerId;
    const empire = state.empires.byId[playerId];
    if (!empire) return;

    const playerPlanets = empire.planets
      .map((pid) => state.planets.byId[pid])
      .filter((p): p is Planet => !!p);

    const playerFleets = empire.fleets
      .map((fid) => state.fleets.byId[fid])
      .filter((f): f is Fleet => !!f);

    const allShips: Ship[] = playerFleets.flatMap((f) =>
      f.shipIds.map((sid) => state.ships.byId[sid]).filter((s): s is Ship => !!s),
    );

    // ── Header ───────────────────────────────────────────────────────────────
    this.empireNameEl.textContent = empire.name.toUpperCase();
    this.turnYearEl.textContent = `TURN ${state.turn}  •  YEAR ${state.year}`;

    // ── Sections ─────────────────────────────────────────────────────────────
    this.renderResources(empire, playerPlanets, playerFleets);
    this.renderPopulation(playerPlanets);
    this.renderProduction(playerPlanets, state);
    this.renderMilitary(playerFleets, allShips, playerPlanets, state);
    this.renderResearch(empire.research, state);
    this.renderColonies(playerPlanets, empire, state);
  }

  show(): void {
    this.container.style.display = '';
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.classList.remove('active');
  }

  // ── Layout construction ────────────────────────────────────────────────────

  private buildLayout(): void {
    this.container.innerHTML = '';

    // ── Screen header ─────────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'screen-header empire-dashboard-header';
    header.innerHTML = `
      <div class="dashboard-title-row">
        <h1 class="dashboard-title">EMPIRE OVERVIEW</h1>
        <span class="dashboard-empire-name" id="db-empire-name"></span>
      </div>
      <div class="dashboard-turn" id="db-turn-year"></div>
    `;
    this.container.appendChild(header);
    this.empireNameEl = header.querySelector('#db-empire-name')!;
    this.turnYearEl = header.querySelector('#db-turn-year')!;

    // ── Scrollable body ──────────────────────────────────────────────────────
    const body = document.createElement('div');
    body.className = 'screen-body dashboard-body';
    this.container.appendChild(body);

    // Two-column grid: left column = Resources + Military, right = Population + Production + Research + Colonies
    const grid = document.createElement('div');
    grid.className = 'dashboard-grid';
    body.appendChild(grid);

    const left = document.createElement('div');
    left.className = 'dashboard-col';
    grid.appendChild(left);

    const right = document.createElement('div');
    right.className = 'dashboard-col';
    grid.appendChild(right);

    // ── Resources section ─────────────────────────────────────────────────────
    left.appendChild(this.buildSection('💰 RESOURCES', (section) => {
      this.resReserve = this.addStatRow(section, 'Reserve');
      this.resIncome = this.addStatRow(section, 'Income / turn');
      this.resMaint = this.addStatRow(section, 'Maintenance');
      this.resNet = this.addStatRow(section, 'Net / turn', true);
    }));

    // ── Military section ──────────────────────────────────────────────────────
    left.appendChild(this.buildSection('⚔️ MILITARY STRENGTH', (section) => {
      this.milFleets = this.addStatRow(section, 'Fleets');
      this.milShips = this.addStatRow(section, 'Total ships');
      this.milSmall = this.addStatRow(section, '  Small');
      this.milMedium = this.addStatRow(section, '  Medium');
      this.milLarge = this.addStatRow(section, '  Large');
      this.milHuge = this.addStatRow(section, '  Huge');
      this.milBases = this.addStatRow(section, 'Missile bases');
    }));

    // ── Population section ────────────────────────────────────────────────────
    right.appendChild(this.buildSection('👥 POPULATION', (section) => {
      this.popTotal = this.addStatRow(section, 'Total citizens');
      this.popCapacity = this.addStatRow(section, 'Max capacity');
      this.popGrowth = this.addStatRow(section, 'Avg growth / turn');
      this.popColonies = this.addStatRow(section, 'Colonies');
    }));

    // ── Production section ────────────────────────────────────────────────────
    right.appendChild(this.buildSection('🏭 PRODUCTION', (section) => {
      this.prodFactories = this.addStatRow(section, 'Total factories');
      this.prodOutput = this.addStatRow(section, 'Industrial output');
      this.prodShipsBuilding = this.addStatRow(section, 'Ships building');
      this.prodTurnsNext = this.addStatRow(section, 'Next ship in');
    }));

    // ── Research section ──────────────────────────────────────────────────────
    right.appendChild(this.buildSection('🔬 RESEARCH', (section) => {
      this.resToch = this.addStatRow(section, 'Current tech');
      this.resPct = this.addStatRow(section, 'Progress');
      // Progress bar
      const barWrap = document.createElement('div');
      barWrap.className = 'db-progress-wrap';
      const bar = document.createElement('div');
      bar.className = 'db-progress-bar';
      bar.id = 'db-research-bar';
      barWrap.appendChild(bar);
      section.appendChild(barWrap);
      this.resRpTurn = this.addStatRow(section, 'RP / turn');
      this.resTurns = this.addStatRow(section, 'Turns remaining');
      this.resCompleted = this.addStatRow(section, 'Techs researched');
    }));

    // ── Colony summary section ────────────────────────────────────────────────
    right.appendChild(this.buildSection('🌍 COLONIES', (section) => {
      this.colTotal = this.addStatRow(section, 'Total colonies');
      this.colHomeworld = this.addStatRow(section, 'Homeworld');
      const typeHeader = document.createElement('div');
      typeHeader.className = 'db-stat-label db-type-header';
      typeHeader.textContent = 'Planet types:';
      section.appendChild(typeHeader);
      this.colTypesEl = document.createElement('div');
      this.colTypesEl.className = 'db-types-grid';
      section.appendChild(this.colTypesEl);
    }));

    // ── Footer / OK button ────────────────────────────────────────────────────
    const footer = document.createElement('div');
    footer.className = 'dashboard-footer';
    const okBtn = document.createElement('button');
    okBtn.className = 'btn-ok dashboard-ok';
    okBtn.textContent = 'OK';
    okBtn.addEventListener('click', () => {
      this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
    });
    footer.appendChild(okBtn);
    body.appendChild(footer);

    // Inject scoped styles
    this.injectStyles();
  }

  // ── Section builder helper ─────────────────────────────────────────────────

  private buildSection(
    title: string,
    populate: (el: HTMLElement) => void,
  ): HTMLElement {
    const section = document.createElement('div');
    section.className = 'detail-section dashboard-section';

    const h2 = document.createElement('h2');
    h2.className = 'dashboard-section-title';
    h2.textContent = title;
    section.appendChild(h2);

    const content = document.createElement('div');
    content.className = 'dashboard-section-content';
    section.appendChild(content);

    populate(content);
    return section;
  }

  /**
   * Append a label + value row to a section and return the value element.
   * @param highlight  When true the value is rendered in accent colour.
   */
  private addStatRow(
    parent: HTMLElement,
    label: string,
    highlight = false,
  ): HTMLElement {
    const row = document.createElement('div');
    row.className = 'db-stat-row';

    const lbl = document.createElement('span');
    lbl.className = 'db-stat-label';
    lbl.textContent = label;
    row.appendChild(lbl);

    const val = document.createElement('span');
    val.className = highlight ? 'db-stat-value db-stat-highlight' : 'db-stat-value';
    val.textContent = '—';
    row.appendChild(val);

    parent.appendChild(row);
    return val;
  }

  // ── Section render methods ─────────────────────────────────────────────────

  private renderResources(
    empire: Empire,
    planets: Planet[],
    _fleets: Fleet[],
  ): void {
    // Maintenance: 0.5 BC/missile base + ship maintenance from designs
    let maintenance = 0;
    for (const p of planets) {
      maintenance += p.missileBases * 0.5;
    }
    // Fleet ship maintenance (approximate via design stats if available)
    // We don't have ship design stats loaded here, so use empire-level creditPerTurn
    // and subtract planet income to estimate ship costs.
    const income = empire.creditPerTurn;
    const net = income - maintenance;

    this.resReserve.textContent = `${empire.credits.toFixed(0)} BC`;
    this.resIncome.textContent = `${income.toFixed(1)} BC/turn`;
    this.resMaint.textContent = `${maintenance.toFixed(1)} BC/turn`;
    this.resNet.textContent = `${net >= 0 ? '+' : ''}${net.toFixed(1)} BC/turn`;
    this.resNet.style.color = net >= 0
      ? 'var(--color-success)'
      : 'var(--color-danger)';
  }

  private renderPopulation(planets: Planet[]): void {
    const total = planets.reduce((s, p) => s + p.population, 0);
    const capacity = planets.reduce((s, p) => s + p.maxPopulation, 0);
    const avgGrowth = planets.length > 0
      ? planets.reduce((s, p) => s + p.growthRate, 0) / planets.length
      : 0;

    this.popTotal.textContent = total.toFixed(1);
    this.popCapacity.textContent = capacity.toFixed(1);
    this.popGrowth.textContent =
      `${avgGrowth >= 0 ? '+' : ''}${avgGrowth.toFixed(2)} / turn`;
    this.popGrowth.style.color = avgGrowth >= 0
      ? 'var(--color-success)'
      : 'var(--color-danger)';
    this.popColonies.textContent = String(planets.length);
  }

  private renderProduction(planets: Planet[], state: GameState): void {
    const totalFactories = planets.reduce((s, p) => s + p.factories, 0);
    // Industrial output = net factories (after waste) × ship+industry slider allocation
    const totalOutput = planets.reduce((s, p) => {
      const netFact = Math.max(0, p.factories - p.waste);
      const prodSlider = (p.production.ship + p.production.industry) / 100;
      return s + netFact * prodSlider;
    }, 0);

    // Count active shipyard queues
    const buildingPlanets = planets.filter((p) => p.currentDesignId !== null);
    const shipsBuilding = buildingPlanets.length;

    // Closest ship to completion
    let minTurns: number | null = null;
    for (const p of buildingPlanets) {
      const design: ShipDesign | undefined = p.currentDesignId
        ? state.shipDesigns.byId[p.currentDesignId]
        : undefined;
      if (!design) continue;
      const remaining = design.stats.cost - p.shipyardProgress;
      // Each factory contributes 1 BC/turn toward ships (simplified)
      const output = Math.max(1, p.factories * (p.production.ship / 100));
      const turns = remaining > 0 ? Math.ceil(remaining / output) : 0;
      if (minTurns === null || turns < minTurns) minTurns = turns;
    }

    this.prodFactories.textContent = String(totalFactories);
    this.prodOutput.textContent = `${totalOutput.toFixed(0)} BC/turn`;
    this.prodShipsBuilding.textContent = String(shipsBuilding);
    this.prodTurnsNext.textContent =
      minTurns !== null ? `${minTurns} turn${minTurns === 1 ? '' : 's'}` : '—';
  }

  private renderMilitary(
    fleets: Fleet[],
    ships: Ship[],
    planets: Planet[],
    state: GameState,
  ): void {
    const byClass: Record<ShipClass, number> = {
      small: 0,
      medium: 0,
      large: 0,
      huge: 0,
    };

    for (const ship of ships) {
      const design = state.shipDesigns.byId[ship.designId];
      if (design) byClass[design.class]++;
    }

    const totalBases = planets.reduce((s, p) => s + p.missileBases, 0);

    this.milFleets.textContent = String(fleets.length);
    this.milShips.textContent = String(ships.length);
    this.milSmall.textContent = String(byClass.small);
    this.milMedium.textContent = String(byClass.medium);
    this.milLarge.textContent = String(byClass.large);
    this.milHuge.textContent = String(byClass.huge);
    this.milBases.textContent = String(totalBases);
  }

  private renderResearch(research: ResearchState, _state: GameState): void {
    const bar = this.container.querySelector('#db-research-bar') as HTMLElement | null;

    if (!research.currentTech) {
      this.resToch.textContent = 'None selected';
      this.resPct.textContent = '—';
      this.resRpTurn.textContent = `${research.researchPerTurn} RP/turn`;
      this.resTurns.textContent = '—';
      this.resCompleted.textContent = String(research.completedTechs.length);
      if (bar) bar.style.width = '0%';
      return;
    }

    // Find the tech definition to get its base cost
    // We can derive cost from researchPoints vs. what's needed
    const rp = research.researchPoints;
    const rpPerTurn = research.researchPerTurn;

    // Try to find the technology name from any empire's perspective
    // (tech data is referenced by ID; we don't have a tech catalog in state directly,
    //  but we can display the tech ID formatted nicely as a fallback)
    const techId = research.currentTech;
    // Format tech ID for display: "weapons_laser_1" → "Weapons Laser 1"
    const techName = formatTechId(techId);

    // Without the tech catalog cost we can't compute a true percentage;
    // surface accumulated RP and let the player gauge progress from RP/turn.
    this.resToch.textContent = techName;
    this.resPct.textContent = rp > 0 ? `${rp.toFixed(0)} RP accumulated` : '0 RP';
    this.resRpTurn.textContent = `${rpPerTurn} RP/turn`;
    this.resTurns.textContent = '—';
    this.resCompleted.textContent = String(research.completedTechs.length);
    if (bar) bar.style.width = '0%';
  }

  private renderColonies(
    planets: Planet[],
    _empire: Empire,
    _state: GameState,
  ): void {
    // Find homeworld name
    let homeworldName: string | null = null;
    for (const p of planets) {
      if (p.isHomeworld) {
        homeworldName = p.name;
        break;
      }
    }

    // Count by type
    const byType: Partial<Record<PlanetType, number>> = {};
    for (const p of planets) {
      byType[p.type] = (byType[p.type] ?? 0) + 1;
    }

    this.colTotal.textContent = String(planets.length);
    this.colHomeworld.textContent = homeworldName ?? '—';

    // Render type pills
    this.colTypesEl.innerHTML = '';
    const entries = Object.entries(byType) as [PlanetType, number][];
    entries.sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'db-type-empty';
      empty.textContent = 'No colonies';
      this.colTypesEl.appendChild(empty);
    } else {
      for (const [type, count] of entries) {
        const pill = document.createElement('span');
        pill.className = `db-type-pill db-type-${type}`;
        pill.title = type;
        pill.textContent = `${PLANET_ICONS[type] ?? '🪐'} ${formatPlanetType(type)} ×${count}`;
        this.colTypesEl.appendChild(pill);
      }
    }
  }

  // ── Scoped style injection ─────────────────────────────────────────────────

  private injectStyles(): void {
    const styleId = 'empire-dashboard-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
/* ── Empire Dashboard Screen ────────────────────────────────────────────── */

.empire-dashboard-screen {
  display: none;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-mono);
  overflow: hidden;
}

.empire-dashboard-screen.active {
  display: flex;
}

/* Header */
.empire-dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 20px;
  background: var(--color-bg-panel);
  border-bottom: 2px solid var(--color-accent);
}

.dashboard-title-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.dashboard-title {
  font-size: 20px;
  letter-spacing: 4px;
  color: var(--color-accent);
  text-transform: uppercase;
}

.dashboard-empire-name {
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--color-warning);
}

.dashboard-turn {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--color-text-dim);
}

/* Body */
.dashboard-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Two-column grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.dashboard-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Sections */
.dashboard-section {
  background: var(--color-bg-panel);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.dashboard-section-title {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--color-accent);
  text-transform: uppercase;
  padding: 8px 12px;
  background: rgba(0, 170, 255, 0.06);
  border-bottom: 1px solid var(--color-border);
}

.dashboard-section-content {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Stat rows */
.db-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 2px 0;
  border-bottom: 1px solid rgba(26, 58, 92, 0.4);
  gap: 8px;
}

.db-stat-row:last-child {
  border-bottom: none;
}

.db-stat-label {
  font-size: 11px;
  color: var(--color-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.db-stat-value {
  font-size: 12px;
  color: var(--color-text);
  text-align: right;
  font-family: var(--font-mono);
  min-width: 80px;
}

.db-stat-highlight {
  color: var(--color-accent);
  font-weight: bold;
}

/* Progress bar */
.db-progress-wrap {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
  margin: 4px 0;
}

.db-progress-bar {
  height: 100%;
  background: var(--color-accent);
  border-radius: 3px;
  transition: width 0.3s ease;
  min-width: 0;
  width: 0%;
}

/* Type header label */
.db-type-header {
  padding-top: 6px;
  border-bottom: none;
}

/* Planet type pills grid */
.db-types-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 4px 0 2px;
}

.db-type-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  background: rgba(0, 170, 255, 0.1);
  border: 1px solid var(--color-accent-dim);
  color: var(--color-text);
  white-space: nowrap;
}

.db-type-terran  { background: rgba(0, 200, 80, 0.15);  border-color: rgba(0,200,80,0.4); }
.db-type-ocean   { background: rgba(0, 80, 200, 0.15);  border-color: rgba(0,80,200,0.4); }
.db-type-jungle  { background: rgba(50, 180, 0, 0.15);  border-color: rgba(50,180,0,0.4); }
.db-type-gaia    { background: rgba(100, 255, 100, 0.15); border-color: rgba(100,255,100,0.4); color: #7dff7d; }
.db-type-arid    { background: rgba(200, 150, 0, 0.15); border-color: rgba(200,150,0,0.4); }
.db-type-desert  { background: rgba(220, 120, 0, 0.15); border-color: rgba(220,120,0,0.4); }
.db-type-steppe  { background: rgba(180, 160, 0, 0.15); border-color: rgba(180,160,0,0.4); }
.db-type-tundra  { background: rgba(150, 200, 220, 0.15); border-color: rgba(150,200,220,0.4); }
.db-type-barren  { background: rgba(120, 120, 120, 0.15); border-color: rgba(120,120,120,0.4); }
.db-type-dead    { background: rgba(60, 60, 60, 0.2);   border-color: rgba(60,60,60,0.5); color: var(--color-text-dim); }
.db-type-minimal { background: rgba(80, 80, 80, 0.15);  border-color: rgba(80,80,80,0.4); }
.db-type-toxic   { background: rgba(150, 0, 200, 0.15); border-color: rgba(150,0,200,0.4); color: #cc66ff; }
.db-type-radiated { background: rgba(255, 50, 0, 0.12); border-color: rgba(255,50,0,0.4); color: #ff8866; }
.db-type-inferno { background: rgba(255, 80, 0, 0.18);  border-color: rgba(255,80,0,0.5); color: #ffaa66; }
.db-type-gas_giant { background: rgba(100, 120, 200, 0.12); border-color: rgba(100,120,200,0.35); }

.db-type-empty {
  font-size: 11px;
  color: var(--color-text-dim);
  font-style: italic;
}

/* Footer */
.dashboard-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0 4px;
}

.dashboard-ok {
  padding: 7px 28px;
  background: var(--color-accent-dim);
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 2px;
  cursor: pointer;
  text-transform: uppercase;
  transition: background 0.15s, color 0.15s;
}

.dashboard-ok:hover {
  background: var(--color-accent);
  color: #000;
}

/* Responsive: single column on narrow viewports */
@media (max-width: 700px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
    `;
    document.head.appendChild(style);
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

/** Convert a snake_case tech ID to a readable title. */
function formatTechId(id: string): string {
  return id
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Capitalise a planet type for display. */
function formatPlanetType(type: PlanetType): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Planet type → representative emoji. */
const PLANET_ICONS: Partial<Record<PlanetType, string>> = {
  terran:    '🌍',
  ocean:     '🌊',
  jungle:    '🌿',
  arid:      '🏜️',
  tundra:    '❄️',
  toxic:     '☢️',
  radiated:  '☢️',
  barren:    '🪨',
  dead:      '💀',
  gas_giant: '🪐',
  gaia:      '✨',
  steppe:    '🌾',
  desert:    '🏜️',
  minimal:   '🌑',
  inferno:   '🔥',
};
