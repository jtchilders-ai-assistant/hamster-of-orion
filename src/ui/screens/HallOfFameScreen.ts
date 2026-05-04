/**
 * Hall of Fame — game records and achievements.
 * src/ui/screens/HallOfFameScreen.ts
 *
 * Two sections:
 *   1. Current Game Records — live leader-board across all empires, recalculated
 *      each render from the active GameState (BC, colonies, ships built,
 *      population, techs researched).
 *   2. Historical Games — past completed games persisted to localStorage,
 *      each with outcome, score, turn count, and final records snapshot.
 *
 * Public API:
 *   render(state)         — rebuild DOM from current state + stored history
 *   show() / hide()       — standard screen-visibility interface
 *   continue()            — navigate back to previous screen
 *   clearHistory()        — erase localStorage history (with confirm)
 *   static saveGameToHistory(state, outcome) — call from VictoryScreen on end
 */

import { GameState } from '../../game/state';
import { Store } from '../../game/store';

// ── Data types ────────────────────────────────────────────────────────────────

interface GameRecord {
  category: string;
  holder: string;
  value: number;
  turn: number;
}

interface HistoricalGame {
  date: string;
  playerEmpire: string;
  outcome: 'victory' | 'defeat';
  victoryType?: string;
  finalScore: number;
  turns: number;
  records?: GameRecord[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const HALL_OF_FAME_KEY = 'orion-hall-of-fame';
const MAX_HISTORY = 50;

const CATEGORY_ICONS: Record<string, string> = {
  'Most BC':             '💰',
  'Most Colonies':       '🌍',
  'Most Ships Built':    '🚀',
  'Highest Population':  '👥',
  'Most Techs':          '⚗️',
};

// ── Module-level pure helpers ─────────────────────────────────────────────────

/**
 * Compute a rough end-of-game score from the player empire's state.
 * Used both when saving history and displayed on historical entries.
 */
function computeFinalScore(state: GameState): number {
  const empire = state.empires.byId[state.empires.playerId];
  if (!empire) return 0;

  let score = empire.credits;
  score += empire.planets.length * 500;
  score += empire.research.completedTechs.length * 200;

  for (const pid of empire.planets) {
    const planet = state.planets.byId[pid];
    if (planet) score += planet.population * 2;
  }

  for (const designId of empire.shipDesigns) {
    const design = state.shipDesigns.byId[designId];
    if (design) score += design.shipsBuilt * 50;
  }

  return score;
}

/**
 * Calculate the five current-game records by scanning all empires.
 * Returns highest holder per category at the current game turn.
 */
function calculateCurrentRecords(state: GameState): GameRecord[] {
  const turn = state.turn;
  const records: GameRecord[] = [];
  const empires = Object.values(state.empires.byId);

  // ── Most BC ──────────────────────────────────────────────────────
  let best = empires.reduce(
    (acc, e) => (e.credits > acc.value ? { value: e.credits, name: e.name } : acc),
    { value: -Infinity, name: '' },
  );
  records.push({ category: 'Most BC', holder: best.name, value: Math.max(0, best.value), turn });

  // ── Most Colonies ────────────────────────────────────────────────
  best = empires.reduce(
    (acc, e) => (e.planets.length > acc.value ? { value: e.planets.length, name: e.name } : acc),
    { value: -1, name: '' },
  );
  records.push({ category: 'Most Colonies', holder: best.name, value: Math.max(0, best.value), turn });

  // ── Most Ships Built ─────────────────────────────────────────────
  best = empires.reduce((acc, e) => {
    const built = e.shipDesigns.reduce((sum, did) => {
      return sum + (state.shipDesigns.byId[did]?.shipsBuilt ?? 0);
    }, 0);
    return built > acc.value ? { value: built, name: e.name } : acc;
  }, { value: -1, name: '' });
  records.push({ category: 'Most Ships Built', holder: best.name, value: Math.max(0, best.value), turn });

  // ── Highest Population ───────────────────────────────────────────
  best = empires.reduce((acc, e) => {
    const pop = e.planets.reduce((sum, pid) => {
      return sum + (state.planets.byId[pid]?.population ?? 0);
    }, 0);
    return pop > acc.value ? { value: pop, name: e.name } : acc;
  }, { value: -1, name: '' });
  records.push({ category: 'Highest Population', holder: best.name, value: Math.max(0, best.value), turn });

  // ── Most Techs Researched ─────────────────────────────────────────
  best = empires.reduce(
    (acc, e) => {
      const c = e.research.completedTechs.length;
      return c > acc.value ? { value: c, name: e.name } : acc;
    },
    { value: -1, name: '' },
  );
  records.push({ category: 'Most Techs', holder: best.name, value: Math.max(0, best.value), turn });

  return records;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadHistory(): HistoricalGame[] {
  try {
    const raw = localStorage.getItem(HALL_OF_FAME_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoricalGame[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(games: HistoricalGame[]): void {
  try {
    localStorage.setItem(HALL_OF_FAME_KEY, JSON.stringify(games));
  } catch {
    // Storage quota exceeded or unavailable — silently skip
  }
}

function prependToHistory(game: HistoricalGame): void {
  const existing = loadHistory();
  // Most-recent-first; cap at MAX_HISTORY entries
  const updated = [game, ...existing].slice(0, MAX_HISTORY);
  saveHistory(updated);
}

// ── Screen class ──────────────────────────────────────────────────────────────

export class HallOfFameScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.container.classList.add('hall-of-fame-screen');
  }

  // ── Screen interface ──────────────────────────────────────────────────────

  render(state: GameState): void {
    this.container.innerHTML = '';
    this.container.appendChild(this.buildPanel(state));
  }

  show(): void {
    this.container.style.display = '';
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.classList.remove('active');
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Navigate back to the previous screen (galaxy map by default). */
  continue(): void {
    const state = this.store.getState();
    const target = state.ui.previousScreen ?? 'galaxy';
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: target } });
  }

  /** Erase all persisted game history (asks for confirmation). */
  clearHistory(): void {
    if (!confirm('Clear all historical game records? This cannot be undone.')) return;
    localStorage.removeItem(HALL_OF_FAME_KEY);
    this.render(this.store.getState());
  }

  // ── Static save ───────────────────────────────────────────────────────────

  /**
   * Persist the just-completed game to localStorage.
   * Call this from VictoryScreen (or wherever the game ends) so the
   * Hall of Fame accumulates history across sessions.
   */
  static saveGameToHistory(state: GameState, outcome: 'victory' | 'defeat'): void {
    const playerEmpire = state.empires.byId[state.empires.playerId];
    if (!playerEmpire) return;

    const rawType = state.victoryResult?.type;
    const victoryType = rawType
      ? rawType.charAt(0).toUpperCase() + rawType.slice(1) + ' Victory'
      : undefined;

    const game: HistoricalGame = {
      date:         new Date().toISOString(),
      playerEmpire: playerEmpire.name,
      outcome,
      victoryType,
      finalScore:   computeFinalScore(state),
      turns:        state.turn,
      records:      calculateCurrentRecords(state),
    };

    prependToHistory(game);
  }

  // ── Private DOM builders ──────────────────────────────────────────────────

  private buildPanel(state: GameState): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'hof-panel';

    panel.appendChild(this.buildTitleBar());
    panel.appendChild(this.buildRecordsSection(calculateCurrentRecords(state)));
    panel.appendChild(this.buildHistorySection(loadHistory()));
    panel.appendChild(this.buildFooter());

    return panel;
  }

  private buildTitleBar(): HTMLElement {
    const bar = document.createElement('div');
    bar.className = 'hof-title-bar';

    const icon = document.createElement('span');
    icon.className = 'hof-icon';
    icon.textContent = '🏆';
    bar.appendChild(icon);

    const title = document.createElement('h2');
    title.className = 'hof-title';
    title.textContent = 'HALL OF FAME';
    bar.appendChild(title);

    return bar;
  }

  // ── Current game records section ─────────────────────────────────────────

  private buildRecordsSection(records: GameRecord[]): HTMLElement {
    const section = document.createElement('div');
    section.className = 'hof-section';
    section.appendChild(this.buildSectionHeader('📊', 'CURRENT GAME RECORDS'));

    if (records.length === 0) {
      section.appendChild(this.buildEmpty('No records yet — start a game!'));
      return section;
    }

    const grid = document.createElement('div');
    grid.className = 'records-grid';

    const playerEmpireName = this.store.getState().empires.byId[
      this.store.getState().empires.playerId
    ]?.name ?? '';

    for (const record of records) {
      grid.appendChild(this.buildRecordCard(record, playerEmpireName));
    }

    section.appendChild(grid);
    return section;
  }

  private buildRecordCard(record: GameRecord, playerEmpireName: string): HTMLElement {
    const card = document.createElement('div');
    card.className = 'record-card';
    if (record.holder === playerEmpireName) {
      card.classList.add('player-record');
    }

    const icon = document.createElement('div');
    icon.className = 'record-icon';
    icon.textContent = CATEGORY_ICONS[record.category] ?? '📌';
    card.appendChild(icon);

    const cat = document.createElement('div');
    cat.className = 'record-category';
    cat.textContent = record.category;
    card.appendChild(cat);

    const holder = document.createElement('div');
    holder.className = 'record-holder';
    holder.textContent = record.holder || '—';
    card.appendChild(holder);

    const value = document.createElement('div');
    value.className = 'record-value';
    value.textContent = record.value.toLocaleString();
    card.appendChild(value);

    return card;
  }

  // ── Historical games section ──────────────────────────────────────────────

  private buildHistorySection(games: HistoricalGame[]): HTMLElement {
    const section = document.createElement('div');
    section.className = 'hof-section';

    const header = this.buildSectionHeader('📜', 'HISTORICAL GAMES');

    const badge = document.createElement('span');
    badge.className = 'hof-count-badge';
    badge.textContent = `${games.length} game${games.length !== 1 ? 's' : ''}`;
    header.appendChild(badge);

    section.appendChild(header);

    if (games.length === 0) {
      const empty = this.buildEmpty('No completed games yet.');
      const hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = 'Finish a game and your result will appear here.';
      empty.appendChild(hint);
      section.appendChild(empty);
      return section;
    }

    // History table
    const table = document.createElement('table');
    table.className = 'history-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Date</th>
        <th>Empire</th>
        <th>Result</th>
        <th>Score</th>
        <th>Turns</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const game of games) {
      tbody.appendChild(this.buildHistoryRow(game));
    }
    table.appendChild(tbody);

    section.appendChild(table);

    // Aggregate stats strip
    section.appendChild(this.buildHistoryStats(games));

    // Clear button
    const footer = document.createElement('div');
    footer.className = 'hof-history-footer';
    const clearBtn = document.createElement('button');
    clearBtn.className = 'hof-clear-btn';
    clearBtn.textContent = 'Clear All History';
    clearBtn.addEventListener('click', () => this.clearHistory());
    footer.appendChild(clearBtn);
    section.appendChild(footer);

    return section;
  }

  private buildHistoryRow(game: HistoricalGame): HTMLElement {
    const tr = document.createElement('tr');

    const dateTd = document.createElement('td');
    dateTd.textContent = this.formatDate(game.date);
    tr.appendChild(dateTd);

    const empireTd = document.createElement('td');
    empireTd.textContent = game.playerEmpire;
    tr.appendChild(empireTd);

    const resultTd = document.createElement('td');
    const resultSpan = document.createElement('span');
    if (game.outcome === 'victory') {
      resultSpan.className = 'result-victory';
      resultSpan.textContent = game.victoryType ?? 'Victory';
    } else {
      resultSpan.className = 'result-defeat';
      resultSpan.textContent = 'Defeat';
    }
    resultTd.appendChild(resultSpan);
    tr.appendChild(resultTd);

    const scoreTd = document.createElement('td');
    scoreTd.textContent = game.finalScore.toLocaleString();
    tr.appendChild(scoreTd);

    const turnsTd = document.createElement('td');
    turnsTd.textContent = String(game.turns);
    tr.appendChild(turnsTd);

    return tr;
  }

  private buildHistoryStats(games: HistoricalGame[]): HTMLElement {
    const wins    = games.filter(g => g.outcome === 'victory').length;
    const losses  = games.length - wins;
    const winRate = games.length > 0 ? Math.round((wins / games.length) * 100) : 0;
    const best    = games.reduce(
      (acc, g) => (g.finalScore > acc ? g.finalScore : acc),
      0,
    );
    const avgTurns = games.length > 0
      ? Math.round(games.reduce((sum, g) => sum + g.turns, 0) / games.length)
      : 0;

    const strip = document.createElement('div');
    strip.className = 'history-stats';

    const items: Array<{ label: string; value: string }> = [
      { label: 'Victories',  value: String(wins) },
      { label: 'Defeats',    value: String(losses) },
      { label: 'Win Rate',   value: `${winRate}%` },
      { label: 'Best Score', value: best.toLocaleString() },
      { label: 'Avg Turns',  value: String(avgTurns) },
    ];

    for (const item of items) {
      const el = document.createElement('div');
      el.className = 'stat-item';

      const lbl = document.createElement('span');
      lbl.className = 'stat-label';
      lbl.textContent = item.label;

      const val = document.createElement('span');
      val.className = 'stat-value';
      val.textContent = item.value;

      el.appendChild(lbl);
      el.appendChild(val);
      strip.appendChild(el);
    }

    return strip;
  }

  // ── Footer ────────────────────────────────────────────────────────────────

  private buildFooter(): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'hof-footer';

    const btn = document.createElement('button');
    btn.className = 'panel button';
    btn.textContent = 'Continue';
    btn.addEventListener('click', () => this.continue());
    footer.appendChild(btn);

    return footer;
  }

  // ── Small helpers ─────────────────────────────────────────────────────────

  private buildSectionHeader(iconText: string, titleText: string): HTMLElement {
    const header = document.createElement('div');
    header.className = 'hof-section-header';

    const icon = document.createElement('span');
    icon.className = 'hof-section-icon';
    icon.textContent = iconText;
    header.appendChild(icon);

    const title = document.createElement('h3');
    title.className = 'section-title';
    title.textContent = titleText;
    header.appendChild(title);

    return header;
  }

  private buildEmpty(message: string): HTMLElement {
    const el = document.createElement('div');
    el.className = 'no-history';
    el.textContent = message;
    return el;
  }

  private formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch {
      return iso;
    }
  }
}
