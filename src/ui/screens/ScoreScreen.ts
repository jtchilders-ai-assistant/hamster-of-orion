/**
 * Score Breakdown — empire score calculation and comparison.
 * src/ui/screens/ScoreScreen.ts
 *
 * MOO1-style scoring:
 *   Population    1 pt  per population unit
 *   Factories     0.5 pt per factory
 *   Technology    2 pts per researched tech
 *   Fleet         class-dependent per ship
 *   Credits       0.1 pt per BC
 *
 * Displays player score breakdown + ranked leaderboard.
 */

import {
  GameState,
  Empire,
  EmpireId,
  ShipClass,
} from '../../game/state';
import { Store } from '../../game/store';

// ── Score types ───────────────────────────────────────────────────────────────

interface EmpireScore {
  empireId: EmpireId;
  empireName: string;
  population: number;
  factories: number;
  technology: number;
  fleet: number;
  credits: number;
  total: number;
}

// ── Score multipliers ─────────────────────────────────────────────────────────

const FACTORY_FACTOR = 0.5;
const TECH_FACTOR = 2;
const CREDIT_FACTOR = 0.1;
const POPULATION_FACTOR = 1;

const SHIP_CLASS_POINTS: Record<ShipClass, number> = {
  small: 1,
  medium: 3,
  large: 6,
  huge: 12,
};

// ── Score calculation ─────────────────────────────────────────────────────────

/**
 * Calculate total scores for a single empire across all five MOO1 categories.
 */
function calculateScore(
  empire: Empire,
  state: GameState,
): EmpireScore {
  // Population
  const totalPop = empire.planets.reduce((sum: number, pid: string) => {
    const planet = state.planets.byId[pid];
    return sum + (planet?.population ?? 0);
  }, 0);

  // Factories
  const totalFactories = empire.planets.reduce((sum: number, pid: string) => {
    const planet = state.planets.byId[pid];
    return sum + (planet?.factories ?? 0);
  }, 0);

  // Technology
  const techCount = empire.research.completedTechs.length;

  // Fleet — iterate each fleet, then each ship, look up its design for class
  let fleetPoints = 0;
  for (const fleetId of empire.fleets) {
    const fleet = state.fleets.byId[fleetId];
    if (!fleet) continue;
    for (const shipId of fleet.shipIds) {
      const ship = state.ships.byId[shipId];
      if (!ship) continue;
      const design = state.shipDesigns.byId[ship.designId];
      if (design) {
        fleetPoints += SHIP_CLASS_POINTS[design.class] ?? 0;
      }
    }
  }

  // Credits
  const creditPoints = empire.credits * CREDIT_FACTOR;

  // Totals
  const popScore = totalPop * POPULATION_FACTOR;
  const factoryScore = totalFactories * FACTORY_FACTOR;
  const techScore = techCount * TECH_FACTOR;
  const creditScore = Number(creditPoints.toFixed(1));

  const total = popScore + factoryScore + techScore + fleetPoints + creditScore;

  return {
    empireId: empire.id,
    empireName: empire.name,
    population: totalPop,
    factories: totalFactories,
    technology: techCount,
    fleet: fleetPoints,
    credits: creditScore,
    total: Number(total.toFixed(1)),
  };
}

// ── ScoreScreen ────────────────────────────────────────────────────────────────

export class ScoreScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.container.classList.add('score-screen');
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

  // ── Private builders ──────────────────────────────────────────────────────

  private buildPanel(state: GameState): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'score-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Score Breakdown');

    // ── Background ─────────────────────────────────────────────────────────
    panel.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 32px 24px;
      max-width: 900px;
      width: 95%;
      max-height: 92vh;
      overflow-y: auto;
      background: linear-gradient(180deg, #0a0e1a 0%, #000a1a 100%);
      border: 1px solid #2a4a6a;
      border-radius: 8px;
      font-family: 'Courier New', Courier, monospace;
      color: #c0d8f0;
      box-sizing: border-box;
    `;

    // ── Title ──────────────────────────────────────────────────────────────
    const title = document.createElement('h1');
    title.style.cssText = `
      font-size: 28px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 4px;
      color: #88ccff;
      margin: 0 0 4px 0;
      text-shadow: 0 0 12px #4488cc66;
      text-align: center;
    `;
    title.textContent = 'SCORE BREAKDOWN';
    panel.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.style.cssText = `
      font-size: 11px;
      color: #556677;
      margin: 0 0 20px 0;
      text-align: center;
      letter-spacing: 1px;
    `;
    subtitle.textContent = `Turn ${state.turn}  •  ${state.year}`;
    panel.appendChild(subtitle);

    // ── Calculate all scores ───────────────────────────────────────────────
    const scores: EmpireScore[] = Object.values(state.empires.byId)
      .filter((e) => !e.isDefeated)
      .map((e) => calculateScore(e, state))
      .sort((a, b) => b.total - a.total);

    const playerScore = scores.find(
      (s) => s.empireId === state.empires.playerId,
    );

    // ── Player breakdown ───────────────────────────────────────────────────
    if (playerScore) {
      const playerEmpire = state.empires.byId[state.empires.playerId];
      const rawCredits = playerEmpire ? playerEmpire.credits : 0;
      panel.appendChild(this.renderScoreBreakdown(playerScore, rawCredits));
    }

    // ── Separator ──────────────────────────────────────────────────────────
    const sep = document.createElement('div');
    sep.style.cssText = 'width: 100%; height: 1px; background: #2a4a6a; margin: 16px 0;';
    panel.appendChild(sep);

    // ── Leaderboard ────────────────────────────────────────────────────────
    panel.appendChild(this.renderLeaderboard(scores));

    // ── Close button ───────────────────────────────────────────────────────
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'CLOSE';
    closeBtn.style.cssText = `
      background: #1a2a3a;
      border: 1px solid #4488aa;
      color: #88ccff;
      padding: 8px 24px;
      cursor: pointer;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-radius: 4px;
      margin-top: 20px;
      transition: background 0.15s, border-color 0.15s;
    `;
    closeBtn.addEventListener('mouseover', () => {
      closeBtn.style.background = '#2a3a4a';
      closeBtn.style.borderColor = '#66aadd';
    });
    closeBtn.addEventListener('mouseout', () => {
      closeBtn.style.background = '#1a2a3a';
      closeBtn.style.borderColor = '#4488aa';
    });
    closeBtn.addEventListener('click', () => {
      this.hide();
      this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'reports' } });
    });
    panel.appendChild(closeBtn);

    return panel;
  }

  /**
   * Render a detailed score breakdown for the player's empire.
   * Shows each category with its components and sub-total.
   */
  private renderScoreBreakdown(
    score: EmpireScore,
    rawCredits: number,
  ): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      width: 100%;
      max-width: 420px;
      margin: 0 auto;
    `;

    // ── Empire name header ────────────────────────────────────────────────
    const header = document.createElement('h2');
    header.style.cssText = `
      font-size: 16px;
      color: #88ccff;
      text-align: center;
      margin: 0 0 12px 0;
      letter-spacing: 2px;
    `;
    header.textContent = score.empireName;
    wrapper.appendChild(header);

    // ── Category rows ─────────────────────────────────────────────────────
    const categories: Array<{
      label: string;
      icon: string;
      detail: string;
      value: number;
    }> = [
      {
        label: 'Population',
        icon: '👤',
        detail: `${score.population} pop × ${POPULATION_FACTOR}`,
        value: score.population * POPULATION_FACTOR,
      },
      {
        label: 'Factories',
        icon: '🏭',
        detail: `${score.factories} fac × ${FACTORY_FACTOR}`,
        value: score.factories * FACTORY_FACTOR,
      },
      {
        label: 'Technology',
        icon: '🔬',
        detail: `${score.technology} tech × ${TECH_FACTOR}`,
        value: score.technology * TECH_FACTOR,
      },
      {
        label: 'Fleet',
        icon: '🚀',
        detail: `${score.fleet} pts from all ships`,
        value: score.fleet,
      },
      {
        label: 'Credits',
        icon: '💰',
        detail: `${rawCredits} BC × ${CREDIT_FACTOR}`,
        value: score.credits,
      },
    ];

    // Build breakdown table
    const table = document.createElement('table');
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    `;

    for (const cat of categories) {
      const tr = document.createElement('tr');

      // Icon + label
      const tdLeft = document.createElement('td');
      tdLeft.style.cssText = `
        padding: 4px 8px;
        text-align: left;
        vertical-align: middle;
        color: #aabbcc;
        border-bottom: 1px solid #1a2a3a;
        white-space: nowrap;
      `;
      tdLeft.textContent = `${cat.icon} ${cat.label}`;
      tr.appendChild(tdLeft);

      // Detail
      const tdDetail = document.createElement('td');
      tdDetail.style.cssText = `
        padding: 4px 8px;
        text-align: center;
        vertical-align: middle;
        color: #556677;
        font-size: 10px;
        border-bottom: 1px solid #1a2a3a;
      `;
      tdDetail.textContent = cat.detail;
      tr.appendChild(tdDetail);

      // Score
      const tdRight = document.createElement('td');
      tdRight.style.cssText = `
        padding: 4px 8px;
        text-align: right;
        vertical-align: middle;
        color: #ddeeff;
        font-weight: bold;
        border-bottom: 1px solid #1a2a3a;
      `;
      tdRight.textContent = cat.value.toFixed(1);
      tr.appendChild(tdRight);

      table.appendChild(tr);
    }

    // ── Total row ─────────────────────────────────────────────────────────
    const totalTr = document.createElement('tr');
    totalTr.style.cssText = `
      border-top: 2px solid #4488aa;
      background: rgba(40, 80, 120, 0.15);
    `;

    const totalLabel = document.createElement('td');
    totalLabel.style.cssText = `
      padding: 8px;
      text-align: left;
      font-weight: bold;
      color: #88ccff;
      font-size: 13px;
    `;
    totalLabel.textContent = 'TOTAL';
    totalTr.appendChild(totalLabel);

    const totalSpacer = document.createElement('td');
    totalSpacer.style.cssText = 'padding: 8px;';
    totalTr.appendChild(totalSpacer);

    const totalValue = document.createElement('td');
    totalValue.style.cssText = `
      padding: 8px;
      text-align: right;
      font-weight: bold;
      font-size: 14px;
      color: #ffdd44;
      text-shadow: 0 0 8px #ffaa0044;
    `;
    totalValue.textContent = score.total.toFixed(1);
    totalTr.appendChild(totalValue);

    table.appendChild(totalTr);
    wrapper.appendChild(table);

    return wrapper;
  }

  /**
   * Render a ranked leaderboard comparing all empires.
   */
  private renderLeaderboard(scores: EmpireScore[]): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      width: 100%;
      margin-top: 4px;
    `;

    const header = document.createElement('h3');
    header.style.cssText = `
      font-size: 13px;
      letter-spacing: 2px;
      color: #6699bb;
      text-align: center;
      margin: 0 0 10px 0;
      border-bottom: 1px solid #2a4a6a;
      padding-bottom: 6px;
    `;
    header.textContent = 'EMPIRE RANKINGS';
    wrapper.appendChild(header);

    // Build a compact table (or column layout for narrow screens)
    const table = document.createElement('table');
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    `;

    // Header row
    const thead = document.createElement('tr');
    thead.style.cssText = 'border-bottom: 1px solid #2a4a6a;';

    const headers = [
      { label: '#', w: '36px' },
      { label: 'Empire', w: 'auto' },
      { label: 'POP', w: '42px', align: 'right' },
      { label: 'FAC', w: '42px', align: 'right' },
      { label: 'TEC', w: '42px', align: 'right' },
      { label: 'FLT', w: '42px', align: 'right' },
      { label: 'CRD', w: '42px', align: 'right' },
      { label: 'TOTAL', w: '56px', align: 'right' },
    ];

    for (const h of headers) {
      const th = document.createElement('th');
      th.style.cssText = `
        padding: 4px 6px;
        text-align: ${h.align ?? 'left'};
        color: #556677;
        font-size: 10px;
        letter-spacing: 1px;
        text-transform: uppercase;
        width: ${h.w};
      `;
      th.textContent = h.label;
      thead.appendChild(th);
    }
    table.appendChild(thead);

    // Score rows
    const medals = ['🥇', '🥈', '🥉'];

    for (let i = 0; i < scores.length; i++) {
      const score = scores[i];
      const tr = document.createElement('tr');

      // Highlight player row
      if (score.empireId === this.store.getState().empires.playerId) {
        tr.style.cssText = 'background: rgba(68, 136, 170, 0.12);';
      } else {
        tr.style.cssText = 'border-bottom: 1px solid #1a2a3a;';
      }

      // Rank
      const tdRank = document.createElement('td');
      tdRank.style.cssText = `
        padding: 5px 6px;
        text-align: center;
        font-size: 13px;
        color: ${i < 3 ? '#ffdd88' : '#445566'};
        font-weight: bold;
      `;
      tdRank.textContent = i < 3 ? medals[i] : String(i + 1);
      tr.appendChild(tdRank);

      // Name
      const tdName = document.createElement('td');
      tdName.style.cssText = `
        padding: 5px 6px;
        text-align: left;
        color: ${i < 3 ? '#ccddff' : '#8899aa'};
        font-weight: ${i < 3 ? 'bold' : 'normal'};
      `;
      tdName.textContent = score.empireName;
      tr.appendChild(tdName);

      // Score columns
      const columns = [
        score.population,
        score.factories,
        score.technology,
        score.fleet,
        score.credits,
        score.total,
      ];

      for (const val of columns) {
        const td = document.createElement('td');
        td.style.cssText = `
          padding: 5px 6px;
          text-align: right;
          color: ${i < 3 ? '#ddeeff' : '#8899aa'};
          font-variant-numeric: tabular-nums;
        `;
        td.textContent = Number.isInteger(val) ? String(val) : val.toFixed(1);
        tr.appendChild(td);
      }

      table.appendChild(tr);
    }

    wrapper.appendChild(table);

    // ── Legend ─────────────────────────────────────────────────────────────
    const legend = document.createElement('div');
    legend.style.cssText = `
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #1a2a3a;
      font-size: 10px;
      color: #445566;
      text-align: center;
      line-height: 1.8;
    `;
    legend.textContent = [
      'POP = population  •  FAC = factories  •  TEC = technology  •  FLT = fleet  •  CRD = credits',
      'POP ×1  •  FAC ×0.5  •  TEC ×2  •  CRD ×0.1  •  FLT = small:1  med:3  lg:6  huge:12',
    ].join('  •  ');
    wrapper.appendChild(legend);

    return wrapper;
  }

}
