/**
 * Charts screen — production trends and statistics graphs.
 * src/ui/screens/ChartsScreen.ts
 *
 * Reachable as a tab within the Reports screen or via direct navigation.
 * Displays four visual chart panels using pure DOM/CSS — no external libraries.
 *
 * Charts:
 *   1. Production Trends  — last 5 turns production totals (bar chart)
 *   2. Research Progress  — current RP progress per field (progress bars)
 *   3. Population Growth  — per-planet and total population (bar chart)
 *   4. Fleet Composition  — ship class breakdown (stacked segment bars)
 */

import { GameState, ShipClass, TechField } from '../../game/state';
import { Store } from '../../game/store';

// ── Constants ─────────────────────────────────────────────────────────────────

/** Display label for each TechField key. */
const TECH_FIELD_LABELS: Record<TechField, string> = {
  weapons:      'WEAPONRY',
  propulsion:   'PROPULSION',
  construction: 'CONSTRUCTION',
  computers:    'COMPUTERS',
  force_fields: 'FORCE FIELDS',
  biotechnology:'PLANETOLOGY',
};

/** Accent color per TechField for progress bars. */
const TECH_FIELD_COLORS: Record<TechField, string> = {
  weapons:      '#ff4444',
  propulsion:   '#44aaff',
  construction: '#ffaa00',
  computers:    '#44ff88',
  force_fields: '#aa44ff',
  biotechnology:'#00ccaa',
};

const SHIP_CLASS_ORDER: ShipClass[] = ['small', 'medium', 'large', 'huge'];
const SHIP_CLASS_LABELS: Record<ShipClass, string> = {
  small:  'FRIGATE',
  medium: 'DESTROYER',
  large:  'CRUISER',
  huge:   'BATTLESHIP',
};
const SHIP_CLASS_COLORS: Record<ShipClass, string> = {
  small:  '#44aaff',
  medium: '#44ff88',
  large:  '#ffaa00',
  huge:   '#ff4444',
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface BarItem {
  label: string;
  value: number;
  max: number;
  color?: string;
  sublabel?: string;
}

interface TrendPoint {
  label: string;
  value: number;
}

// ── ChartsScreen ──────────────────────────────────────────────────────────────

export class ChartsScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  /**
   * Circular buffer: stores the last 5 turn production snapshots.
   * Each entry is the total empire production BC for that turn.
   * Updated on each render() call so history accumulates across turns.
   */
  private readonly productionHistory: TrendPoint[] = [];
  private readonly populationHistory: TrendPoint[] = [];
  private lastRecordedTurn = -1;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.container.classList.add('charts-screen');
    this.container.style.cssText =
      'display:none; flex-direction:column; height:100%; overflow:hidden;' +
      'background:var(--color-bg); font-family:var(--font-mono);';
  }

  // ── Public interface ────────────────────────────────────────────────────────

  show(): void {
    this.container.style.display = 'flex';
    this.container.classList.add('active');
    this.render(this.store.getState());
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.classList.remove('active');
  }

  render(state: GameState): void {
    // Snapshot current turn data into history buffers (once per turn).
    this.recordTurnSnapshot(state);

    this.container.innerHTML = '';

    const empire = state.empires.byId[state.empires.playerId];
    if (!empire) {
      const msg = document.createElement('p');
      msg.style.cssText = 'padding:24px; color:var(--color-text-dim);';
      msg.textContent = 'No empire data available.';
      this.container.appendChild(msg);
      return;
    }

    // ── Header ─────────────────────────────────────────────────────────────────
    const header = this.buildHeader(state);
    this.container.appendChild(header);

    // ── Scrollable chart grid ──────────────────────────────────────────────────
    const grid = document.createElement('div');
    grid.style.cssText =
      'flex:1; overflow-y:auto; padding:16px; display:grid;' +
      'grid-template-columns:1fr 1fr; grid-template-rows:auto auto;' +
      'gap:16px; min-height:0;';
    this.container.appendChild(grid);

    grid.appendChild(this.buildPanel('PRODUCTION TRENDS',  this.renderProductionTrends(state)));
    grid.appendChild(this.buildPanel('RESEARCH PROGRESS',  this.renderResearchProgress(state)));
    grid.appendChild(this.buildPanel('POPULATION',         this.renderPopulationChart(state)));
    grid.appendChild(this.buildPanel('FLEET COMPOSITION',  this.renderFleetComposition(state)));
  }

  // ── History recording ───────────────────────────────────────────────────────

  /**
   * Appends a snapshot for the current turn into productionHistory and
   * populationHistory, keeping at most 5 entries (oldest drops off).
   */
  private recordTurnSnapshot(state: GameState): void {
    if (state.turn === this.lastRecordedTurn) return;
    this.lastRecordedTurn = state.turn;

    const empire = state.empires.byId[state.empires.playerId];
    if (!empire) return;

    // Production total: sum of factories × production slider across all planets
    let totalProduction = 0;
    let totalPop = 0;
    for (const pid of empire.planets) {
      const planet = state.planets.byId[pid];
      if (!planet) continue;
      // Approximate production BC: factories * (ship+defense+industry sliders / 100)
      const productionPct =
        (planet.production.ship + planet.production.defense + planet.production.industry) / 100;
      totalProduction += Math.round(planet.factories * productionPct);
      totalPop += planet.population;
    }

    const label = `T${state.turn}`;

    pushCapped(this.productionHistory, { label, value: totalProduction }, 5);
    pushCapped(this.populationHistory, { label, value: totalPop }, 5);
  }

  // ── Header ──────────────────────────────────────────────────────────────────

  private buildHeader(state: GameState): HTMLElement {
    const header = document.createElement('div');
    header.style.cssText =
      'flex-shrink:0; padding:12px 20px 10px;' +
      'border-bottom:2px solid var(--color-border);' +
      'display:flex; justify-content:space-between; align-items:center;';

    const title = document.createElement('h1');
    title.style.cssText =
      'font-size:16px; letter-spacing:4px; color:var(--color-accent);' +
      'text-transform:uppercase; margin:0;';
    title.textContent = 'C H A R T S   &   S T A T I S T I C S';

    const meta = document.createElement('span');
    meta.style.cssText = 'font-size:12px; color:var(--color-text-dim);';
    meta.textContent = `Turn ${state.turn}  •  Year ${state.year}`;

    header.appendChild(title);
    header.appendChild(meta);
    return header;
  }

  // ── Panel wrapper ────────────────────────────────────────────────────────────

  private buildPanel(title: string, content: HTMLElement): HTMLElement {
    const panel = document.createElement('div');
    panel.style.cssText =
      'background:var(--color-bg-panel); border:1px solid var(--color-border);' +
      'display:flex; flex-direction:column; overflow:hidden;';

    const panelTitle = document.createElement('div');
    panelTitle.style.cssText =
      'padding:8px 14px 6px; font-size:11px; letter-spacing:2px;' +
      'color:var(--color-accent); border-bottom:1px solid var(--color-border);' +
      'text-transform:uppercase; flex-shrink:0;';
    panelTitle.textContent = title;

    const body = document.createElement('div');
    body.style.cssText = 'flex:1; overflow-y:auto; padding:12px 14px;';
    body.appendChild(content);

    panel.appendChild(panelTitle);
    panel.appendChild(body);
    return panel;
  }

  // ── Chart 1: Production Trends ───────────────────────────────────────────────

  private renderProductionTrends(state: GameState): HTMLElement {
    const wrap = document.createElement('div');

    if (this.productionHistory.length === 0) {
      return emptyNotice('No production history yet. End a turn to record data.');
    }

    const max = Math.max(...this.productionHistory.map((p) => p.value), 1);

    // Vertical bar chart — bars grow upward using flex-end alignment
    const chartArea = document.createElement('div');
    chartArea.style.cssText =
      'display:flex; align-items:flex-end; gap:8px; height:120px;' +
      'border-bottom:1px solid var(--color-border); margin-bottom:8px;';

    for (const point of this.productionHistory) {
      const col = document.createElement('div');
      col.style.cssText =
        'flex:1; display:flex; flex-direction:column; align-items:center;' +
        'justify-content:flex-end; gap:2px;';

      const heightPct = Math.max(4, Math.round((point.value / max) * 100));

      const bar = document.createElement('div');
      bar.style.cssText =
        `height:${heightPct}%; min-height:4px; width:100%;` +
        'background:var(--color-accent); border-radius:2px 2px 0 0;' +
        'transition:height 0.3s;';
      bar.title = `${point.label}: ${point.value} BC production`;

      const valLabel = document.createElement('span');
      valLabel.style.cssText =
        'font-size:9px; color:var(--color-text-dim); white-space:nowrap;';
      valLabel.textContent = String(point.value);

      col.appendChild(valLabel);
      col.appendChild(bar);
      chartArea.appendChild(col);
    }

    // Turn labels row
    const labelsRow = document.createElement('div');
    labelsRow.style.cssText =
      'display:flex; gap:8px; margin-bottom:12px;';

    for (const point of this.productionHistory) {
      const lbl = document.createElement('div');
      lbl.style.cssText =
        'flex:1; text-align:center; font-size:10px; color:var(--color-text-dim);';
      lbl.textContent = point.label;
      labelsRow.appendChild(lbl);
    }

    // Current turn breakdown as horizontal bars (per-planet contribution)
    const empire = state.empires.byId[state.empires.playerId];
    const breakdownItems: BarItem[] = [];
    if (empire) {
      for (const pid of empire.planets) {
        const planet = state.planets.byId[pid];
        if (!planet) continue;
        const pct =
          (planet.production.ship + planet.production.defense + planet.production.industry) / 100;
        const contrib = Math.round(planet.factories * pct);
        if (contrib > 0) {
          breakdownItems.push({
            label: planet.name,
            value: contrib,
            max: Math.max(...breakdownItems.map((b) => b.value), contrib, 1),
          });
        }
      }
      // Recompute max after collecting all
      const bMax = Math.max(...breakdownItems.map((b) => b.value), 1);
      for (const b of breakdownItems) b.max = bMax;
    }

    wrap.appendChild(chartArea);
    wrap.appendChild(labelsRow);

    if (breakdownItems.length > 0) {
      const subTitle = document.createElement('div');
      subTitle.style.cssText =
        'font-size:10px; letter-spacing:1px; color:var(--color-text-dim);' +
        'text-transform:uppercase; margin-bottom:6px;';
      subTitle.textContent = 'Current Turn — By Colony';
      wrap.appendChild(subTitle);
      wrap.appendChild(this.renderBarChart(breakdownItems));
    }

    return wrap;
  }

  // ── Chart 2: Research Progress ───────────────────────────────────────────────

  private renderResearchProgress(state: GameState): HTMLElement {
    const empire = state.empires.byId[state.empires.playerId];
    if (!empire) return emptyNotice('No empire data.');

    const research = empire.research;
    const totalRP = research.researchPerTurn;
    const allFields: TechField[] = [
      'weapons', 'propulsion', 'construction', 'computers', 'force_fields', 'biotechnology',
    ];

    const wrap = document.createElement('div');

    // RP/turn header
    const rpHeader = document.createElement('div');
    rpHeader.style.cssText =
      'font-size:11px; color:var(--color-text-dim); margin-bottom:10px;';
    rpHeader.textContent = `Total Research: ${totalRP} RP/turn`;
    wrap.appendChild(rpHeader);

    for (const field of allFields) {
      const row = document.createElement('div');
      row.style.cssText = 'margin-bottom:10px;';

      // Label row: field name + allocation %
      const labelRow = document.createElement('div');
      labelRow.style.cssText =
        'display:flex; justify-content:space-between; align-items:baseline; margin-bottom:3px;';

      const nameEl = document.createElement('span');
      nameEl.style.cssText =
        `font-size:11px; letter-spacing:1px; color:${TECH_FIELD_COLORS[field]};` +
        'text-transform:uppercase;';
      nameEl.textContent = TECH_FIELD_LABELS[field];

      // Map TechField → ResearchFieldKey for allocation lookup
      const allocKey = techFieldToAllocKey(field);
      const allocPct = research.fieldAllocation?.[allocKey] ?? Math.round(100 / 6);
      const fieldRP = Math.round(totalRP * allocPct / 100);

      const allocEl = document.createElement('span');
      allocEl.style.cssText = 'font-size:11px; color:var(--color-text-dim);';
      allocEl.textContent = `${allocPct}%  (${fieldRP} RP/turn)`;

      labelRow.appendChild(nameEl);
      labelRow.appendChild(allocEl);
      row.appendChild(labelRow);

      // Current tech + progress bar
      const currentTechId = research.fieldCurrentTech?.[allocKey] ?? research.currentTech;
      const progressRP = research.fieldProgress?.[allocKey] ?? 0;

      // Resolve current tech cost from availableTechs
      const fieldTechField = techFieldToStateKey(field);
      const available = research.availableTechs[fieldTechField] ?? [];
      const completedSet = new Set(research.completedTechs);
      const currentInField = available.find((id) => !completedSet.has(id)) ?? null;
      const activeTechId = currentTechId ?? currentInField;

      // We don't have tech cost in GameState directly; show RP progress / completedTechs count
      const completedInField = research.completedTechs.filter((id) =>
        available.includes(id) || id === activeTechId,
      ).length;

      const techLabel = document.createElement('div');
      techLabel.style.cssText =
        'font-size:10px; color:var(--color-text-dim); margin-bottom:3px;' +
        'white-space:nowrap; overflow:hidden; text-overflow:ellipsis;';
      techLabel.textContent = activeTechId
        ? `Researching: ${activeTechId}  •  ${completedInField} techs complete`
        : `${completedInField} techs complete  •  Nothing queued`;
      row.appendChild(techLabel);

      // Progress bar: show accumulated RP toward next tech (estimate width from researchPoints)
      const progressBar = this.buildProgressBar(progressRP, research.researchPoints + 1, TECH_FIELD_COLORS[field]);
      row.appendChild(progressBar);

      wrap.appendChild(row);
    }

    return wrap;
  }

  // ── Chart 3: Population ──────────────────────────────────────────────────────

  private renderPopulationChart(state: GameState): HTMLElement {
    const empire = state.empires.byId[state.empires.playerId];
    if (!empire) return emptyNotice('No empire data.');

    const wrap = document.createElement('div');

    // Trend bars (history) — vertical bar chart
    if (this.populationHistory.length > 1) {
      const trendTitle = document.createElement('div');
      trendTitle.style.cssText =
        'font-size:10px; letter-spacing:1px; color:var(--color-text-dim);' +
        'text-transform:uppercase; margin-bottom:6px;';
      trendTitle.textContent = 'Population Trend';
      wrap.appendChild(trendTitle);

      const maxPop = Math.max(...this.populationHistory.map((p) => p.value), 1);
      const trendArea = document.createElement('div');
      trendArea.style.cssText =
        'display:flex; align-items:flex-end; gap:8px; height:80px;' +
        'border-bottom:1px solid var(--color-border); margin-bottom:4px;';

      for (const point of this.populationHistory) {
        const col = document.createElement('div');
        col.style.cssText =
          'flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; gap:2px;';

        const heightPct = Math.max(4, Math.round((point.value / maxPop) * 100));
        const bar = document.createElement('div');
        bar.style.cssText =
          `height:${heightPct}%; min-height:4px; width:100%;` +
          'background:var(--color-success); border-radius:2px 2px 0 0;';
        bar.title = `${point.label}: ${point.value}M pop`;

        const vl = document.createElement('span');
        vl.style.cssText = 'font-size:9px; color:var(--color-text-dim);';
        vl.textContent = String(point.value);

        col.appendChild(vl);
        col.appendChild(bar);
        trendArea.appendChild(col);
      }

      const labelsRow = document.createElement('div');
      labelsRow.style.cssText = 'display:flex; gap:8px; margin-bottom:12px;';
      for (const point of this.populationHistory) {
        const lbl = document.createElement('div');
        lbl.style.cssText = 'flex:1; text-align:center; font-size:10px; color:var(--color-text-dim);';
        lbl.textContent = point.label;
        labelsRow.appendChild(lbl);
      }

      wrap.appendChild(trendArea);
      wrap.appendChild(labelsRow);
    }

    // Per-colony breakdown (horizontal bar chart)
    const colTitle = document.createElement('div');
    colTitle.style.cssText =
      'font-size:10px; letter-spacing:1px; color:var(--color-text-dim);' +
      'text-transform:uppercase; margin-bottom:6px;';
    colTitle.textContent = 'By Colony';
    wrap.appendChild(colTitle);

    const planetItems: BarItem[] = [];
    for (const pid of empire.planets) {
      const planet = state.planets.byId[pid];
      if (!planet) continue;
      planetItems.push({
        label: planet.name,
        value: planet.population,
        max: 0, // filled below
        color: 'var(--color-success)',
        sublabel: `/ ${planet.maxPopulation} max`,
      });
    }

    if (planetItems.length === 0) {
      wrap.appendChild(emptyNotice('No colonies.'));
      return wrap;
    }

    const maxPop = Math.max(...planetItems.map((p) => p.value), 1);
    for (const item of planetItems) item.max = maxPop;

    // Sort by population descending for readability
    planetItems.sort((a, b) => b.value - a.value);

    wrap.appendChild(this.renderBarChart(planetItems));
    return wrap;
  }

  // ── Chart 4: Fleet Composition ───────────────────────────────────────────────

  private renderFleetComposition(state: GameState): HTMLElement {
    const empire = state.empires.byId[state.empires.playerId];
    if (!empire) return emptyNotice('No empire data.');

    // Count ships by class
    const countByClass: Record<ShipClass, number> = {
      small: 0, medium: 0, large: 0, huge: 0,
    };

    for (const fleetId of empire.fleets) {
      const fleet = state.fleets.byId[fleetId];
      if (!fleet) continue;
      for (const shipId of fleet.shipIds) {
        const ship = state.ships.byId[shipId];
        if (!ship) continue;
        const design = state.shipDesigns.byId[ship.designId];
        if (!design) continue;
        countByClass[design.class] = (countByClass[design.class] ?? 0) + 1;
      }
    }

    const total = Object.values(countByClass).reduce((s, n) => s + n, 0);

    const wrap = document.createElement('div');

    if (total === 0) {
      wrap.appendChild(emptyNotice('No ships in your fleets.'));
      return wrap;
    }

    // Summary line
    const summaryEl = document.createElement('div');
    summaryEl.style.cssText =
      'font-size:11px; color:var(--color-text-dim); margin-bottom:12px;';
    summaryEl.textContent = `Total ships: ${total}  •  Fleets: ${empire.fleets.length}`;
    wrap.appendChild(summaryEl);

    // Stacked horizontal bar (pie-as-stacked)
    const stackedBar = document.createElement('div');
    stackedBar.style.cssText =
      'display:flex; width:100%; height:24px; border-radius:3px; overflow:hidden;' +
      'border:1px solid var(--color-border); margin-bottom:10px;';

    for (const cls of SHIP_CLASS_ORDER) {
      const count = countByClass[cls];
      if (count === 0) continue;
      const pct = (count / total) * 100;
      const seg = document.createElement('div');
      seg.style.cssText =
        `width:${pct}%; background:${SHIP_CLASS_COLORS[cls]}; transition:width 0.3s;`;
      seg.title = `${SHIP_CLASS_LABELS[cls]}: ${count} (${Math.round(pct)}%)`;
      stackedBar.appendChild(seg);
    }
    wrap.appendChild(stackedBar);

    // Legend + per-class bars
    for (const cls of SHIP_CLASS_ORDER) {
      const count = countByClass[cls];
      if (count === 0) continue;
      const pct = Math.round((count / total) * 100);

      const row = document.createElement('div');
      row.style.cssText = 'display:flex; align-items:center; gap:8px; margin-bottom:7px;';

      const dot = document.createElement('div');
      dot.style.cssText =
        `width:10px; height:10px; border-radius:2px; flex-shrink:0;` +
        `background:${SHIP_CLASS_COLORS[cls]};`;

      const lbl = document.createElement('span');
      lbl.style.cssText = 'font-size:11px; color:var(--color-text); min-width:90px;';
      lbl.textContent = SHIP_CLASS_LABELS[cls];

      const track = document.createElement('div');
      track.style.cssText =
        'flex:1; height:8px; background:rgba(255,255,255,0.08);' +
        'border:1px solid var(--color-border); border-radius:2px; overflow:hidden;';

      const fill = document.createElement('div');
      fill.style.cssText =
        `height:100%; width:${pct}%; background:${SHIP_CLASS_COLORS[cls]};`;
      track.appendChild(fill);

      const val = document.createElement('span');
      val.style.cssText =
        'font-size:11px; color:var(--color-text-dim); min-width:50px; text-align:right;';
      val.textContent = `${count}  (${pct}%)`;

      row.appendChild(dot);
      row.appendChild(lbl);
      row.appendChild(track);
      row.appendChild(val);
      wrap.appendChild(row);
    }

    return wrap;
  }

  // ── Shared chart helpers ─────────────────────────────────────────────────────

  /**
   * Horizontal bar chart.
   * Each item: { label, value, max, color?, sublabel? }
   */
  private renderBarChart(data: BarItem[]): HTMLElement {
    const chart = document.createElement('div');
    chart.className = 'bar-chart';

    for (const item of data) {
      const bar = document.createElement('div');
      bar.style.cssText = 'margin-bottom:6px;';

      const widthPct = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0;
      const color = item.color ?? 'var(--color-accent)';

      bar.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;">
          <span style="font-size:11px;color:var(--color-text);
                       white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%;">
            ${escapeHtml(item.label)}
          </span>
          <span style="font-size:10px;color:var(--color-text-dim);white-space:nowrap;">
            ${item.value}${item.sublabel ? ' ' + escapeHtml(item.sublabel) : ''}
          </span>
        </div>
        <div style="height:8px;background:rgba(255,255,255,0.08);
                    border:1px solid var(--color-border);border-radius:2px;overflow:hidden;">
          <div style="height:100%;width:${widthPct}%;background:${color};
                      border-radius:2px;transition:width 0.3s;"></div>
        </div>
      `;

      chart.appendChild(bar);
    }

    return chart;
  }

  /**
   * A single progress bar.
   * @param value   Current progress (numerator).
   * @param max     Max value (denominator); clamped to at least 1.
   * @param color   CSS color string.
   */
  private buildProgressBar(value: number, max: number, color: string): HTMLElement {
    const safeMax = Math.max(max, 1);
    const pct = Math.min(100, Math.round((value / safeMax) * 100));

    const track = document.createElement('div');
    track.style.cssText =
      'height:8px; background:rgba(255,255,255,0.08);' +
      'border:1px solid var(--color-border); border-radius:2px; overflow:hidden;';

    const fill = document.createElement('div');
    fill.style.cssText =
      `height:100%; width:${pct}%; background:${color};` +
      'border-radius:2px; transition:width 0.3s;';
    track.appendChild(fill);

    return track;
  }
}

// ── Module-level helpers ──────────────────────────────────────────────────────

/** Append to array, dropping oldest entries when length exceeds cap. */
function pushCapped<T>(arr: T[], item: T, cap: number): void {
  arr.push(item);
  if (arr.length > cap) arr.splice(0, arr.length - cap);
}

/**
 * Map TechField (state.ts) → ResearchFieldKey (ResearchState.fieldAllocation).
 * biotechnology maps to 'planetology' for the allocation/progress keys.
 */
function techFieldToAllocKey(
  field: TechField,
): 'weapons' | 'propulsion' | 'construction' | 'computers' | 'force_fields' | 'planetology' {
  if (field === 'biotechnology') return 'planetology';
  return field as 'weapons' | 'propulsion' | 'construction' | 'computers' | 'force_fields';
}

/**
 * Map TechField → the key used in ResearchState.availableTechs.
 * availableTechs is Record<TechField, TechId[]>, so the key IS the TechField.
 */
function techFieldToStateKey(field: TechField): TechField {
  return field;
}

/** Return a styled "empty" notice element. */
function emptyNotice(message: string): HTMLElement {
  const el = document.createElement('p');
  el.style.cssText =
    'font-size:12px; color:var(--color-text-dim); padding:8px 0; font-style:italic;';
  el.textContent = message;
  return el;
}

/** Escape HTML special chars for safe innerHTML insertion. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
