/**
 * Diplomatic Relations Matrix — relationships between ALL empires.
 * src/ui/screens/DiplomaticMatrixScreen.ts
 *
 * Shows a full NxN grid so the player can see every empire's stance toward every
 * other empire at a glance — not just the player's own relations.
 *
 * Design:
 *  • Row = "from" empire, Column = "to" empire
 *  • Each cell is color-coded by diplomatic state and shows the numeric value
 *  • Diagonal (self→self) is grayed out with an em-dash
 *  • Color legend below the table
 *  • Player's row/column is highlighted with a faint border
 */

import { DiplomaticRelations, DiplomaticState, Empire, EmpireId, GameState } from '../../game/state';
import { Store } from '../../game/store';
import {
  getDiplomaticState,
  getRelationValue,
  STATE_ALLIED_THRESHOLD,
  STATE_FRIENDLY_THRESHOLD,
  STATE_UNFRIENDLY_THRESHOLD,
  STATE_WAR_THRESHOLD,
} from '../../game/systems/diplomacy';

// ── Color palette (matches DiplomacyScreen's rel-* class colors) ─────────────

const REL_COLORS: Record<DiplomaticState, { bg: string; text: string; label: string }> = {
  war:        { bg: '#7a1515', text: '#ff9090', label: 'At War'      },
  unfriendly: { bg: '#6b3900', text: '#ffb347', label: 'Unfriendly'  },
  neutral:    { bg: '#2c2c2c', text: '#a0a0a0', label: 'Neutral'     },
  friendly:   { bg: '#0d4020', text: '#6ee0a0', label: 'Friendly'    },
  allied:     { bg: '#0d2d55', text: '#7ec8ff', label: 'Allied'      },
};

const SELF_BG    = '#1a1a1a';
const SELF_TEXT  = '#444';

// ── Threshold labels for legend ───────────────────────────────────────────────

const LEGEND_ENTRIES: Array<{ state: DiplomaticState; range: string }> = [
  { state: 'allied',     range: `> ${STATE_ALLIED_THRESHOLD}`     },
  { state: 'friendly',   range: `${STATE_FRIENDLY_THRESHOLD + 1}–${STATE_ALLIED_THRESHOLD}` },
  { state: 'neutral',    range: `${STATE_WAR_THRESHOLD + 1}–${STATE_FRIENDLY_THRESHOLD}`    },
  { state: 'unfriendly', range: `${STATE_WAR_THRESHOLD}–${STATE_UNFRIENDLY_THRESHOLD - 1}` },
  { state: 'war',        range: `< ${STATE_WAR_THRESHOLD}`         },
];

// ─────────────────────────────────────────────────────────────────────────────

export class DiplomaticMatrixScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store     = store;
    this.container.classList.add('diplomatic-matrix-screen');
    this.buildShell();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Static shell (header + scroll wrapper)
  // ═══════════════════════════════════════════════════════════════════════

  private buildShell(): void {
    this.container.innerHTML = `
      <div class="screen-header">
        <h1>DIPLOMATIC RELATIONS MATRIX</h1>
        <p class="dm-subtitle">All empire-to-empire standings — turn <span id="dm-turn">—</span></p>
      </div>
      <div class="dm-body">
        <div class="dm-legend" id="dm-legend"></div>
        <div class="dm-scroll-wrap">
          <div id="dm-matrix-root"></div>
        </div>
      </div>
    `;

    this.renderLegend();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Public render — called each time the game state updates
  // ═══════════════════════════════════════════════════════════════════════

  render(state: GameState): void {
    // Turn counter
    const turnEl = this.container.querySelector<HTMLElement>('#dm-turn');
    if (turnEl) turnEl.textContent = String(state.turn);

    // Collect all living empires, player first then alphabetical
    const empires = this.sortedEmpires(state);

    const root = this.container.querySelector<HTMLElement>('#dm-matrix-root');
    if (!root) return;

    if (empires.length === 0) {
      root.innerHTML = '<p class="placeholder-label">No empires to display.</p>';
      return;
    }

    root.innerHTML = '';
    root.appendChild(this.buildMatrix(empires, state));
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Empire ordering
  // ═══════════════════════════════════════════════════════════════════════

  private sortedEmpires(state: GameState): Empire[] {
    return state.empires.allIds
      .map(id => state.empires.byId[id])
      .filter((e): e is Empire => !!e && !e.isDefeated)
      .sort((a, b) => {
        // Player always goes first
        if (a.id === state.empires.playerId) return -1;
        if (b.id === state.empires.playerId) return  1;
        return a.name.localeCompare(b.name);
      });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Matrix table
  // ═══════════════════════════════════════════════════════════════════════

  private buildMatrix(empires: Empire[], state: GameState): HTMLElement {
    const playerId = state.empires.playerId;

    const table = document.createElement('table');
    table.className = 'dm-table';
    table.setAttribute('aria-label', 'Diplomatic relations matrix');

    // ── Header row ──────────────────────────────────────────────────────
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Top-left corner (empty)
    const corner = document.createElement('th');
    corner.className = 'dm-corner';
    corner.textContent = 'FROM \\ TO';
    headerRow.appendChild(corner);

    for (const col of empires) {
      const th = document.createElement('th');
      th.className = 'dm-col-header' + (col.id === playerId ? ' dm-player-header' : '');
      th.textContent = col.name;
      th.title = col.name;
      headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // ── Body rows ───────────────────────────────────────────────────────
    const tbody = document.createElement('tbody');

    for (const row of empires) {
      const tr = document.createElement('tr');

      // Row header
      const rowTh = document.createElement('th');
      rowTh.className = 'dm-row-header' + (row.id === playerId ? ' dm-player-header' : '');
      rowTh.textContent = row.name;
      rowTh.title = row.name;
      tr.appendChild(rowTh);

      // Data cells
      for (const col of empires) {
        tr.appendChild(this.buildCell(row, col, state, playerId));
      }

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    return table;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Individual cell
  // ═══════════════════════════════════════════════════════════════════════

  private buildCell(
    row: Empire,
    col: Empire,
    state: GameState,
    playerId: EmpireId,
  ): HTMLTableCellElement {
    const td = document.createElement('td');
    td.className = 'dm-cell';

    // Player row/col gets a subtle highlight class
    if (row.id === playerId || col.id === playerId) {
      td.classList.add('dm-player-lane');
    }

    // ── Self (diagonal) ─────────────────────────────────────────────────
    if (row.id === col.id) {
      td.classList.add('dm-self');
      td.style.backgroundColor = SELF_BG;
      td.style.color = SELF_TEXT;
      td.textContent = '—';
      td.title = `${row.name} (self)`;
      return td;
    }

    // ── Normal cell ─────────────────────────────────────────────────────
    const value    = getRelationValue(state, row.id, col.id);
    const relState = getDiplomaticState(value);
    const palette  = REL_COLORS[relState];
    const sign     = value > 0 ? '+' : '';

    td.style.backgroundColor = palette.bg;
    td.style.color            = palette.text;
    td.textContent            = `${sign}${value}`;
    td.classList.add(`dm-rel-${relState}`);

    // Build rich tooltip
    td.title = this.cellTooltip(row, col, relState, value);

    // Hover: briefly expand to show the state label too
    td.addEventListener('mouseenter', () => {
      td.textContent = palette.label;
      td.classList.add('dm-cell-hover');
    });
    td.addEventListener('mouseleave', () => {
      td.textContent = `${sign}${value}`;
      td.classList.remove('dm-cell-hover');
    });

    return td;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Tooltip text
  // ═══════════════════════════════════════════════════════════════════════

  private cellTooltip(
    row: Empire,
    col: Empire,
    relState: DiplomaticState,
    value: number,
  ): string {
    const sign = value > 0 ? '+' : '';
    const label = REL_COLORS[relState].label;

    const lines: string[] = [
      `${row.name}  →  ${col.name}`,
      `${label} (${sign}${value})`,
    ];

    // Active treaties (from row empire's perspective)
    const relation: DiplomaticRelations | undefined = row.relations[col.id];
    const activeTreaties = relation?.treaties.filter(t => t.isActive) ?? [];
    if (activeTreaties.length > 0) {
      const treatyNames: Record<string, string> = {
        peace: 'Peace',
        non_aggression: 'Non-Aggression',
        trade: 'Trade',
        research: 'Research',
        military_alliance: 'Military Alliance',
        defensive_pact: 'Defensive Pact',
      };
      lines.push('Treaties: ' + activeTreaties.map(t => treatyNames[t.type] ?? t.type).join(', '));
    }

    return lines.join('\n');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Color legend
  // ═══════════════════════════════════════════════════════════════════════

  private renderLegend(): void {
    const legendEl = this.container.querySelector<HTMLElement>('#dm-legend');
    if (!legendEl) return;

    legendEl.innerHTML = '<span class="dm-legend-title">Legend:</span>';

    for (const { state, range } of LEGEND_ENTRIES) {
      const { bg, text, label } = REL_COLORS[state];

      const item = document.createElement('span');
      item.className = 'dm-legend-item';

      const swatch = document.createElement('span');
      swatch.className = 'dm-legend-swatch';
      swatch.style.backgroundColor = bg;
      swatch.style.color           = text;
      swatch.textContent           = range;

      const lbl = document.createElement('span');
      lbl.className = 'dm-legend-label';
      lbl.textContent = label;

      item.appendChild(swatch);
      item.appendChild(lbl);
      legendEl.appendChild(item);
    }

    // Self
    const selfItem = document.createElement('span');
    selfItem.className = 'dm-legend-item';

    const selfSwatch = document.createElement('span');
    selfSwatch.className = 'dm-legend-swatch';
    selfSwatch.style.backgroundColor = SELF_BG;
    selfSwatch.style.color           = SELF_TEXT;
    selfSwatch.textContent           = '—';

    const selfLbl = document.createElement('span');
    selfLbl.className = 'dm-legend-label';
    selfLbl.textContent = 'Self';

    selfItem.appendChild(selfSwatch);
    selfItem.appendChild(selfLbl);
    legendEl.appendChild(selfItem);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Visibility
  // ═══════════════════════════════════════════════════════════════════════

  show(): void {
    this.container.style.display = '';
    this.container.classList.add('active');
    // Re-render from store so we always have fresh data
    this.render(this.store.getState());
  }

  hide(): void {
    this.container.classList.remove('active');
    this.container.style.display = 'none';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Color helper — public so callers (e.g. map overlays) can read a color
  // ═══════════════════════════════════════════════════════════════════════

  getRelationColor(relState: DiplomaticState): string {
    return REL_COLORS[relState].bg;
  }
}
