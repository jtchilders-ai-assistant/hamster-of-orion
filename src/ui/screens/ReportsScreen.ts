/**
 * Reports screen — empire statistics and graphs.
 * src/ui/screens/ReportsScreen.ts
 *
 * Reachable via F7 (global hotkey). Displays empire-wide statistics:
 * population totals, production totals, research progress, military strength,
 * and diplomatic standing compared to known rivals.
 *
 * Currently a stub — full implementation follows design/ui-ux/wireframes/.
 */

import { GameState } from '../../game/state';
import { Store } from '../../game/store';

export class ReportsScreen {
  private readonly container: HTMLElement;

  // store is accepted for API consistency with other screens but not used yet.
  constructor(container: HTMLElement, _store: Store<GameState>) {
    this.container = container;
    this.container.classList.add('reports-screen');
  }

  // ── Public interface (matches Screen interface in App) ──────────────────────

  render(state: GameState): void {
    this.container.innerHTML = '';

    const playerId = state.empires.playerId;
    const empire = state.empires.byId[playerId];
    if (!empire) return;

    // ── Header ─────────────────────────────────────────────────────────────────
    const header = document.createElement('h2');
    header.className = 'reports-header';
    header.textContent = 'EMPIRE REPORTS';
    this.container.appendChild(header);

    const hint = document.createElement('p');
    hint.className = 'reports-hint';
    hint.textContent = 'Press F1–F6 to switch screens  •  ESC for Game Menu';
    this.container.appendChild(hint);

    // ── Stats table ────────────────────────────────────────────────────────────
    const table = document.createElement('table');
    table.className = 'reports-table';

    const playerPlanets = empire.planets.length;
    const playerFleets  = empire.fleets.length;
    const totalPop = empire.planets.reduce((sum, pid) => {
      return sum + (state.planets.byId[pid]?.population ?? 0);
    }, 0);

    const rows: [string, string][] = [
      ['Turn',        String(state.turn)],
      ['Year',        String(state.year)],
      ['Colonies',    String(playerPlanets)],
      ['Fleets',      String(playerFleets)],
      ['Population',  String(totalPop)],
      ['Credits',     `${empire.credits} BC`],
      ['Income/turn', `${empire.creditPerTurn} BC/turn`],
    ];

    for (const [label, value] of rows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="reports-label">${label}</td><td class="reports-value">${value}</td>`;
      table.appendChild(tr);
    }

    this.container.appendChild(table);
  }

  show(): void {
    this.container.style.display = '';
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.classList.remove('active');
  }
}
