/**
 * Technology Reports — tech comparison and analysis.
 * src/ui/screens/TechReportsScreen.ts
 *
 * Shows four panels:
 *   1. Player's researched techs, grouped by field
 *   2. Empire comparison matrix (tech count per field per known empire)
 *   3. Research speed bars (RP/turn per known empire)
 *   4. Tech advantage summary (who leads each field)
 *
 * All game logic is read-only — no actions dispatched from this screen.
 * Follows the DOM-only, CSS-variable styling conventions of ResearchScreen.ts.
 */

import { GameState, Empire, TechField, TechId } from '../../game/state';
import { Store } from '../../game/store';
import techTreeRaw from '../../data/tech-tree.json';

// ── Tech tree data ────────────────────────────────────────────────────────────

interface TechEntry {
  id: string;
  name: string;
  field: string;     // JSON field name (may be 'planetology' for biotechnology)
  tier: number;
  cost: number;
  unlocks: string[];
  description: string;
}

const TECH_DATA: TechEntry[] = (techTreeRaw as { technologies: TechEntry[] }).technologies;
const TECH_BY_ID = new Map<string, TechEntry>(TECH_DATA.map((t) => [t.id, t]));

// ── Field display config ──────────────────────────────────────────────────────

/**
 * Maps state.ts TechField values to display labels and JSON field names.
 * Note: 'biotechnology' in state.ts ↔ 'planetology' in tech-tree.json.
 */
interface FieldConfig {
  label: string;
  jsonField: string;
  color: string;   // Accent colour for bars and highlights
}

const FIELD_CONFIG: Record<TechField, FieldConfig> = {
  weapons:      { label: 'WEAPONS',      jsonField: 'weapons',      color: '#e05050' },
  propulsion:   { label: 'PROPULSION',   jsonField: 'propulsion',   color: '#e0a050' },
  construction: { label: 'CONSTRUCTION', jsonField: 'construction', color: '#a0c040' },
  computers:    { label: 'COMPUTERS',    jsonField: 'computers',    color: '#50c0e0' },
  force_fields: { label: 'FORCE FIELDS', jsonField: 'force_fields', color: '#8060e0' },
  biotechnology:{ label: 'PLANETOLOGY',  jsonField: 'planetology',  color: '#50d080' },
};

const TECH_FIELDS: TechField[] = [
  'weapons',
  'propulsion',
  'construction',
  'computers',
  'force_fields',
  'biotechnology',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return TechId[] from empire.research.completedTechs that belong to `jsonField`. */
function completedInField(completedTechs: TechId[], jsonField: string): TechId[] {
  return completedTechs.filter((id) => TECH_BY_ID.get(id)?.field === jsonField);
}

/** Highest tier among completed techs in a field; 0 if none. */
function maxTierInField(completedTechs: TechId[], jsonField: string): number {
  return completedInField(completedTechs, jsonField).reduce((max, id) => {
    const t = TECH_BY_ID.get(id);
    return t ? Math.max(max, t.tier) : max;
  }, 0);
}

/** All tech IDs in a json field, sorted ascending by tier. */
function allTechsInField(jsonField: string): TechEntry[] {
  return TECH_DATA.filter((t) => t.field === jsonField).sort((a, b) => a.tier - b.tier);
}

// ── TechReportsScreen ─────────────────────────────────────────────────────────

export class TechReportsScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  // Active tab: 'techs' | 'matrix' | 'speed' | 'advantage'
  private activeTab: 'techs' | 'matrix' | 'speed' | 'advantage' = 'techs';

  // Top-level DOM refs built once; content swapped on render/tab change
  private tabBar!: HTMLElement;
  private contentArea!: HTMLElement;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.container.classList.add('tech-reports-screen');
    this.buildLayout();
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
    this.renderContent(state);
  }

  // ── Layout (built once) ───────────────────────────────────────────────────

  private buildLayout(): void {
    this.container.innerHTML = '';
    this.container.style.cssText =
      'display:none; flex-direction:column; height:100%; overflow:hidden;' +
      'background:var(--color-bg); font-family:var(--font-mono); color:var(--color-text);';

    // Header
    const header = document.createElement('div');
    header.style.cssText =
      'text-align:center; padding:12px 0 8px; flex-shrink:0;' +
      'border-bottom:2px solid var(--color-border);';
    header.innerHTML =
      `<h1 style="font-size:18px;letter-spacing:4px;color:var(--color-accent);` +
      `text-transform:uppercase;margin:0">T E C H   R E P O R T S</h1>`;
    this.container.appendChild(header);

    // Tab bar
    this.tabBar = document.createElement('div');
    this.tabBar.style.cssText =
      'display:flex; gap:0; flex-shrink:0; border-bottom:1px solid var(--color-border);';
    this.buildTabBar();
    this.container.appendChild(this.tabBar);

    // Content area
    this.contentArea = document.createElement('div');
    this.contentArea.style.cssText =
      'flex:1; overflow-y:auto; padding:16px;';
    this.container.appendChild(this.contentArea);
  }

  private buildTabBar(): void {
    const tabs: Array<{ id: 'techs' | 'matrix' | 'speed' | 'advantage'; label: string }> = [
      { id: 'techs',     label: 'MY TECHS'   },
      { id: 'matrix',   label: 'COMPARISON'  },
      { id: 'speed',    label: 'RP / TURN'   },
      { id: 'advantage',label: 'ADVANTAGE'   },
    ];

    this.tabBar.innerHTML = '';
    for (const tab of tabs) {
      const btn = document.createElement('button');
      btn.textContent = tab.label;
      btn.style.cssText =
        'font-family:var(--font-mono); font-size:11px; letter-spacing:1px; padding:8px 20px;' +
        'cursor:pointer; border:none; border-right:1px solid var(--color-border);' +
        'text-transform:uppercase; transition:background 0.15s, color 0.15s;' +
        'background:' + (tab.id === this.activeTab ? 'var(--color-accent-dim)' : 'var(--color-bg)') + ';' +
        'color:' + (tab.id === this.activeTab ? 'var(--color-accent)' : 'var(--color-text-dim)') + ';';
      btn.addEventListener('click', (_e: MouseEvent) => {
        this.activeTab = tab.id;
        this.buildTabBar();   // re-style tabs
        this.render(this.store.getState());
      });
      this.tabBar.appendChild(btn);
    }
  }

  // ── Content dispatch ──────────────────────────────────────────────────────

  private renderContent(state: GameState): void {
    this.contentArea.innerHTML = '';
    const player = state.empires.byId[state.empires.playerId];
    if (!player) {
      this.contentArea.textContent = 'No empire data.';
      return;
    }

    switch (this.activeTab) {
      case 'techs':     this.contentArea.appendChild(this.renderPlayerTechs(state, player)); break;
      case 'matrix':    this.contentArea.appendChild(this.renderTechComparison(state, player)); break;
      case 'speed':     this.contentArea.appendChild(this.renderResearchSpeeds(state, player)); break;
      case 'advantage': this.contentArea.appendChild(this.renderTechAdvantage(state, player)); break;
    }
  }

  // ── Tab 1: Player's researched techs by field ─────────────────────────────

  private renderPlayerTechs(state: GameState, player: Empire): HTMLElement {
    const root = document.createElement('div');

    const heading = this.makeHeading(
      `Researched Technologies — Turn ${state.turn}`,
      `${player.research.completedTechs.length} technologies discovered`,
    );
    root.appendChild(heading);

    if (player.research.completedTechs.length === 0) {
      root.appendChild(this.makeEmptyNote('No technologies researched yet.'));
      return root;
    }

    const grid = document.createElement('div');
    grid.style.cssText =
      'display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px; margin-top:16px;';
    root.appendChild(grid);

    for (const field of TECH_FIELDS) {
      const cfg = FIELD_CONFIG[field];
      const done = completedInField(player.research.completedTechs, cfg.jsonField);
      if (done.length === 0) continue;

      const card = document.createElement('div');
      card.style.cssText =
        'border:1px solid var(--color-border); border-top:3px solid ' + cfg.color + ';' +
        'padding:12px; background:rgba(255,255,255,0.02);';

      // Field header
      const cardHead = document.createElement('div');
      cardHead.style.cssText =
        'font-size:12px; letter-spacing:2px; color:' + cfg.color + ';' +
        'text-transform:uppercase; margin-bottom:8px; font-weight:bold;';
      cardHead.textContent = cfg.label + '  (' + done.length + ')';
      card.appendChild(cardHead);

      // Tech list sorted by tier
      const sorted = done.slice().sort((a, b) => {
        const ta = TECH_BY_ID.get(a);
        const tb = TECH_BY_ID.get(b);
        return (ta?.tier ?? 0) - (tb?.tier ?? 0);
      });

      for (const techId of sorted) {
        const entry = TECH_BY_ID.get(techId);
        const row = document.createElement('div');
        row.style.cssText =
          'display:flex; align-items:baseline; gap:8px; padding:3px 0;' +
          'border-bottom:1px solid rgba(255,255,255,0.05);';
        row.title = entry?.description ?? '';

        const tier = document.createElement('span');
        tier.textContent = entry ? `T${entry.tier}` : '??';
        tier.style.cssText =
          'font-size:10px; color:var(--color-text-dim); min-width:24px;';

        const name = document.createElement('span');
        name.textContent = entry?.name ?? techId;
        name.style.cssText = 'font-size:12px; color:var(--color-text);';

        row.append(tier, name);
        card.appendChild(row);
      }

      // Pending research for this field
      const stateKey = field;
      const available = (player.research.availableTechs[stateKey] ?? []).filter(
        (id) => !player.research.completedTechs.includes(id),
      );
      if (available.length > 0) {
        const pendingLabel = document.createElement('div');
        pendingLabel.style.cssText =
          'margin-top:8px; font-size:11px; color:var(--color-text-dim);';
        pendingLabel.textContent = `${available.length} tech${available.length !== 1 ? 's' : ''} available to research`;
        card.appendChild(pendingLabel);
      }

      grid.appendChild(card);
    }

    // Empty fields note
    const emptyFields = TECH_FIELDS.filter(
      (f) => completedInField(player.research.completedTechs, FIELD_CONFIG[f].jsonField).length === 0,
    );
    if (emptyFields.length > 0) {
      const note = document.createElement('p');
      note.style.cssText = 'color:var(--color-text-dim); font-size:12px; margin-top:16px;';
      note.textContent =
        'No research yet in: ' +
        emptyFields.map((f) => FIELD_CONFIG[f].label).join(', ') + '.';
      root.appendChild(note);
    }

    return root;
  }

  // ── Tab 2: Empire comparison matrix ──────────────────────────────────────

  private renderTechComparison(state: GameState, player: Empire): HTMLElement {
    const root = document.createElement('div');

    // Collect empires we can compare: player + known AI empires (not defeated)
    const visibleEmpires = this.getVisibleEmpires(state, player);

    const heading = this.makeHeading(
      'Technology Comparison Matrix',
      'Tech count per field per empire. AI data based on available intelligence.',
    );
    root.appendChild(heading);

    if (visibleEmpires.length === 0) {
      root.appendChild(this.makeEmptyNote('No rival empires discovered yet.'));
      return root;
    }

    // Build the matrix table
    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-x:auto; margin-top:16px;';
    root.appendChild(tableWrap);

    const table = document.createElement('table');
    table.style.cssText =
      'border-collapse:collapse; font-size:12px; min-width:100%;';
    tableWrap.appendChild(table);

    // Header row: field names
    const thead = document.createElement('thead');
    table.appendChild(thead);
    const headerRow = document.createElement('tr');
    thead.appendChild(headerRow);

    // Empire name column
    const thEmpire = document.createElement('th');
    thEmpire.textContent = 'EMPIRE';
    thEmpire.style.cssText = this.thStyle() + 'text-align:left; min-width:120px;';
    headerRow.appendChild(thEmpire);

    // One column per field
    for (const field of TECH_FIELDS) {
      const th = document.createElement('th');
      th.textContent = FIELD_CONFIG[field].label;
      th.style.cssText =
        this.thStyle() +
        'color:' + FIELD_CONFIG[field].color + '; min-width:90px; text-align:center;';
      headerRow.appendChild(th);
    }

    // Total column
    const thTotal = document.createElement('th');
    thTotal.textContent = 'TOTAL';
    thTotal.style.cssText = this.thStyle() + 'text-align:center; min-width:60px;';
    headerRow.appendChild(thTotal);

    // Body rows
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // Find max per field for shading
    const maxPerField: Record<TechField, number> = {} as Record<TechField, number>;
    for (const field of TECH_FIELDS) {
      maxPerField[field] = Math.max(
        ...visibleEmpires.map((e) =>
          completedInField(e.research.completedTechs, FIELD_CONFIG[field].jsonField).length,
        ),
        1,
      );
    }

    for (const empire of visibleEmpires) {
      const tr = document.createElement('tr');
      const isPlayer = empire.id === player.id;

      tr.style.cssText =
        'border-bottom:1px solid var(--color-border);' +
        (isPlayer ? 'background:rgba(255,255,255,0.04);' : '');

      // Empire name cell
      const tdName = document.createElement('td');
      tdName.style.cssText =
        'padding:8px 12px; color:' +
        (isPlayer ? 'var(--color-accent)' : 'var(--color-text)') + ';' +
        'white-space:nowrap; font-weight:' + (isPlayer ? 'bold' : 'normal') + ';';
      tdName.textContent = empire.name + (isPlayer ? ' ★' : '');
      tr.appendChild(tdName);

      let total = 0;

      for (const field of TECH_FIELDS) {
        const cfg = FIELD_CONFIG[field];
        const count = completedInField(empire.research.completedTechs, cfg.jsonField).length;
        total += count;

        const td = document.createElement('td');
        td.style.cssText = 'padding:8px 6px; text-align:center; position:relative;';

        // Background fill proportional to max
        const pct = maxPerField[field] > 0 ? (count / maxPerField[field]) * 100 : 0;
        const isLeader =
          count > 0 && count === maxPerField[field] && visibleEmpires.length > 1;

        td.innerHTML =
          `<div style="` +
          `position:absolute;inset:2px;left:4px;right:4px;` +
          `background:${cfg.color};opacity:${(pct * 0.25) / 100};border-radius:2px;` +
          `"></div>` +
          `<span style="position:relative;z-index:1;` +
          `color:${isLeader ? cfg.color : 'var(--color-text)'};` +
          `font-weight:${isLeader ? 'bold' : 'normal'};` +
          `">${count}</span>` +
          (isLeader ? `<span title="Leading field" style="position:relative;z-index:1;font-size:9px;color:${cfg.color};"> ▲</span>` : '');

        tr.appendChild(td);
      }

      // Total cell
      const tdTotal = document.createElement('td');
      tdTotal.textContent = String(total);
      tdTotal.style.cssText =
        'padding:8px 6px; text-align:center;' +
        'color:' + (isPlayer ? 'var(--color-accent)' : 'var(--color-text)') + ';' +
        'font-weight:bold;';
      tr.appendChild(tdTotal);

      tbody.appendChild(tr);
    }

    // Legend
    const legend = document.createElement('p');
    legend.style.cssText = 'color:var(--color-text-dim); font-size:11px; margin-top:12px;';
    legend.textContent = '▲ = Leading empire in that field. AI data may be incomplete without espionage.';
    root.appendChild(legend);

    return root;
  }

  // ── Tab 3: Research speed comparison ─────────────────────────────────────

  private renderResearchSpeeds(state: GameState, player: Empire): HTMLElement {
    const root = document.createElement('div');

    const heading = this.makeHeading(
      'Research Speed — RP / Turn',
      'Compares research output across all known empires.',
    );
    root.appendChild(heading);

    const visibleEmpires = this.getVisibleEmpires(state, player);

    if (visibleEmpires.length === 0) {
      root.appendChild(this.makeEmptyNote('No rival empires discovered yet.'));
      return root;
    }

    // Sort by RP descending for the bar chart
    const sorted = [...visibleEmpires].sort(
      (a, b) => b.research.researchPerTurn - a.research.researchPerTurn,
    );

    const maxRP = Math.max(...sorted.map((e) => e.research.researchPerTurn), 1);

    const bars = document.createElement('div');
    bars.style.cssText = 'display:flex; flex-direction:column; gap:10px; margin-top:20px;';
    root.appendChild(bars);

    for (const empire of sorted) {
      const isPlayer = empire.id === player.id;
      const rp = empire.research.researchPerTurn;
      const pct = (rp / maxRP) * 100;

      const row = document.createElement('div');
      row.style.cssText = 'display:flex; flex-direction:column; gap:4px;';

      // Label row
      const labelRow = document.createElement('div');
      labelRow.style.cssText =
        'display:flex; justify-content:space-between; font-size:12px;';

      const nameEl = document.createElement('span');
      nameEl.textContent = empire.name + (isPlayer ? ' ★' : '');
      nameEl.style.cssText =
        'color:' + (isPlayer ? 'var(--color-accent)' : 'var(--color-text)') + ';' +
        'font-weight:' + (isPlayer ? 'bold' : 'normal') + ';';

      const rpEl = document.createElement('span');
      rpEl.textContent = rp + ' RP/turn';
      rpEl.style.cssText = 'color:var(--color-text-dim);';

      labelRow.append(nameEl, rpEl);
      row.appendChild(labelRow);

      // Bar track
      const track = document.createElement('div');
      track.style.cssText =
        'height:12px; background:rgba(255,255,255,0.08);' +
        'border:1px solid var(--color-border); border-radius:2px; overflow:hidden;';

      const fill = document.createElement('div');
      fill.style.cssText =
        'height:100%; width:' + pct.toFixed(1) + '%;' +
        'background:' + (isPlayer ? 'var(--color-accent)' : 'rgba(255,255,255,0.35)') + ';' +
        'transition:width 0.4s;';

      track.appendChild(fill);
      row.appendChild(track);
      bars.appendChild(row);
    }

    // Comparison note vs player
    const playerRP = player.research.researchPerTurn;
    const ahead = sorted.filter(
      (e) => !e.isPlayer && e.research.researchPerTurn > playerRP,
    );
    const behind = sorted.filter(
      (e) => !e.isPlayer && e.research.researchPerTurn < playerRP,
    );

    const note = document.createElement('p');
    note.style.cssText = 'color:var(--color-text-dim); font-size:12px; margin-top:16px;';

    if (ahead.length === 0 && behind.length === 0) {
      note.textContent = 'No rival empire data available.';
    } else {
      const parts: string[] = [];
      if (ahead.length > 0) {
        parts.push(`${ahead.length} empire${ahead.length > 1 ? 's' : ''} ahead of you in research output`);
      }
      if (behind.length > 0) {
        parts.push(`${behind.length} empire${behind.length > 1 ? 's' : ''} behind you`);
      }
      note.textContent = parts.join(' · ') + '.';
    }

    root.appendChild(note);
    return root;
  }

  // ── Tab 4: Tech advantage per field ──────────────────────────────────────

  private renderTechAdvantage(state: GameState, player: Empire): HTMLElement {
    const root = document.createElement('div');

    const heading = this.makeHeading(
      'Technology Advantage Tracker',
      'Who leads each field by highest researched tier.',
    );
    root.appendChild(heading);

    const visibleEmpires = this.getVisibleEmpires(state, player);

    if (visibleEmpires.length <= 1) {
      root.appendChild(this.makeEmptyNote('Discover rival empires to see tech comparisons.'));
      return root;
    }

    const list = document.createElement('div');
    list.style.cssText =
      'display:flex; flex-direction:column; gap:12px; margin-top:16px;';
    root.appendChild(list);

    for (const field of TECH_FIELDS) {
      const cfg = FIELD_CONFIG[field];

      // Compute max tier per empire
      const tierMap: Array<{ empire: Empire; maxTier: number; count: number }> =
        visibleEmpires.map((e) => ({
          empire: e,
          maxTier: maxTierInField(e.research.completedTechs, cfg.jsonField),
          count: completedInField(e.research.completedTechs, cfg.jsonField).length,
        }));

      const globalMax = Math.max(...tierMap.map((r) => r.maxTier), 0);
      const playerRecord = tierMap.find((r) => r.empire.id === player.id)!;
      const leaders = tierMap.filter((r) => r.maxTier === globalMax && globalMax > 0);

      const isPlayerLeading = leaders.some((r) => r.empire.id === player.id);
      const isPlayerBehind =
        globalMax > 0 && playerRecord.maxTier < globalMax;
      const gap = globalMax - playerRecord.maxTier;

      // Card
      const card = document.createElement('div');
      card.style.cssText =
        'border:1px solid var(--color-border); border-left:4px solid ' + cfg.color + ';' +
        'padding:12px 16px; background:rgba(255,255,255,0.02);';

      // Field name row
      const fieldRow = document.createElement('div');
      fieldRow.style.cssText =
        'display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;';

      const fieldLabel = document.createElement('span');
      fieldLabel.textContent = cfg.label;
      fieldLabel.style.cssText =
        'font-size:13px; font-weight:bold; letter-spacing:2px; color:' + cfg.color + ';';

      // Status badge
      const badge = document.createElement('span');
      badge.style.cssText =
        'font-size:10px; padding:2px 8px; border-radius:10px; letter-spacing:1px;';
      if (globalMax === 0) {
        badge.textContent = 'UNEXPLORED';
        badge.style.cssText +=
          'background:rgba(255,255,255,0.08); color:var(--color-text-dim);';
      } else if (isPlayerLeading) {
        badge.textContent = '▲ LEADING';
        badge.style.cssText += 'background:rgba(80,192,80,0.2); color:#50d080;';
      } else if (isPlayerBehind) {
        badge.textContent = gap === 1 ? '▼ 1 TIER BEHIND' : `▼ ${gap} TIERS BEHIND`;
        badge.style.cssText += 'background:rgba(224,80,80,0.2); color:#e07070;';
      } else {
        badge.textContent = '= TIED';
        badge.style.cssText += 'background:rgba(80,160,224,0.2); color:#50c0e0;';
      }

      fieldRow.append(fieldLabel, badge);
      card.appendChild(fieldRow);

      // Per-empire tier mini-table
      const tiers = document.createElement('div');
      tiers.style.cssText =
        'display:flex; flex-wrap:wrap; gap:6px;';

      for (const rec of tierMap.sort((a, b) => b.maxTier - a.maxTier)) {
        const isPlayer = rec.empire.id === player.id;
        const chip = document.createElement('div');
        chip.style.cssText =
          'padding:4px 10px; border:1px solid ' +
          (isPlayer ? 'var(--color-accent)' : 'var(--color-border)') + ';' +
          'border-radius:2px; font-size:11px; display:flex; gap:6px; align-items:center;';

        const empName = document.createElement('span');
        empName.textContent = rec.empire.name + (isPlayer ? ' ★' : '');
        empName.style.color = isPlayer ? 'var(--color-accent)' : 'var(--color-text-dim)';

        const empTier = document.createElement('span');
        empTier.textContent = rec.maxTier > 0 ? `T${rec.maxTier} (${rec.count})` : '—';
        empTier.style.cssText =
          'color:' +
          (rec.maxTier === globalMax && globalMax > 0 ? cfg.color : 'var(--color-text-dim)') +
          '; font-weight:' + (rec.maxTier === globalMax && globalMax > 0 ? 'bold' : 'normal') + ';';

        chip.append(empName, empTier);
        tiers.appendChild(chip);
      }

      card.appendChild(tiers);

      // Tip: number of techs left in this field
      const allInField = allTechsInField(cfg.jsonField);
      const doneCount = playerRecord.count;
      const remaining = allInField.length - doneCount;
      if (remaining > 0) {
        const tip = document.createElement('p');
        tip.style.cssText =
          'margin:8px 0 0; font-size:11px; color:var(--color-text-dim);';
        tip.textContent =
          `You have ${doneCount} of ${allInField.length} known techs in this field` +
          ` (${remaining} remaining).`;
        card.appendChild(tip);
      }

      list.appendChild(card);
    }

    // Summary line
    const leadCount = TECH_FIELDS.filter((field) => {
      const cfg = FIELD_CONFIG[field];
      const empireData = visibleEmpires.map((e) => ({
        id: e.id,
        maxTier: maxTierInField(e.research.completedTechs, cfg.jsonField),
      }));
      const globalMax = Math.max(...empireData.map((e) => e.maxTier), 0);
      return globalMax > 0 && empireData.find((e) => e.id === player.id)?.maxTier === globalMax;
    }).length;

    const summary = document.createElement('p');
    summary.style.cssText =
      'color:var(--color-text-dim); font-size:12px; margin-top:8px;' +
      'border-top:1px solid var(--color-border); padding-top:12px;';
    summary.textContent =
      `You are leading in ${leadCount} of ${TECH_FIELDS.length} fields. ` +
      `Turn ${state.turn} — data reflects your current intelligence.`;
    root.appendChild(summary);

    return root;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Returns the player empire plus any AI empires whose data is available
   * (contacted or not defeated). The player is always first.
   */
  private getVisibleEmpires(state: GameState, player: Empire): Empire[] {
    const result: Empire[] = [player];

    for (const id of state.empires.allIds) {
      if (id === player.id) continue;
      const empire = state.empires.byId[id];
      if (!empire || empire.isDefeated) continue;

      // Include if the player has had any diplomatic contact with this empire
      const relation = player.relations[id];
      if (relation) {
        result.push(empire);
      }
    }

    return result;
  }

  private makeHeading(title: string, subtitle?: string): HTMLElement {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:4px;';

    const h = document.createElement('h2');
    h.textContent = title;
    h.style.cssText =
      'font-size:15px; letter-spacing:2px; color:var(--color-text);' +
      'text-transform:uppercase; margin:0 0 4px;';
    wrap.appendChild(h);

    if (subtitle) {
      const sub = document.createElement('p');
      sub.textContent = subtitle;
      sub.style.cssText = 'font-size:11px; color:var(--color-text-dim); margin:0;';
      wrap.appendChild(sub);
    }

    return wrap;
  }

  private makeEmptyNote(text: string): HTMLElement {
    const el = document.createElement('p');
    el.textContent = text;
    el.style.cssText =
      'color:var(--color-text-dim); font-style:italic; font-size:13px; margin-top:20px;';
    return el;
  }

  private thStyle(): string {
    return (
      'padding:8px 6px; font-size:11px; letter-spacing:1px; text-transform:uppercase;' +
      'border-bottom:2px solid var(--color-border); background:rgba(255,255,255,0.03);'
    );
  }
}
