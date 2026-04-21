/**
 * Victory / Defeat Screen
 * src/ui/screens/VictoryScreen.ts
 *
 * Shown when the game ends (isGameOver === true).
 * Displays win type (Conquest, Military, Diplomatic), game statistics,
 * and provides buttons to start a new game or quit.
 *
 * Acceptance criteria:
 *   1. Victory screen shows win type (Conquest, Diplomatic, etc)
 *   2. Defeat screen shows who won
 *   3. Game statistics (turns, planets, battles)
 *   4. Play again button starts new game
 *   5. Credits/about section
 */

import { GameState, VictoryType } from '../../game/state';
import { Store } from '../../game/store';

// ── Victory type display names ────────────────────────────────────────────────

const VICTORY_TYPE_LABELS: Record<VictoryType, string> = {
  conquest: 'Conquest Victory',
  military: 'Military Victory',
  diplomatic: 'Diplomatic Victory',
};

const VICTORY_TYPE_DESCRIPTIONS: Record<VictoryType, string> = {
  conquest: 'Your forces have subdued all opposition across the galaxy.',
  military: 'Your fleet stands supreme — no rival power dares challenge you.',
  diplomatic: 'Through negotiation and alliance, peace reigns across the stars.',
};

// ── Color palette per win type ────────────────────────────────────────────────

const VICTORY_COLORS: Record<VictoryType, { bg: string; accent: string; glow: string }> = {
  conquest: { bg: '#3a1000', accent: '#ff4422', glow: '#ff6644' },
  military: { bg: '#3a2a00', accent: '#ffaa00', glow: '#ffcc44' },
  diplomatic: { bg: '#002a3a', accent: '#44aaff', glow: '#66ccff' },
};

// ── Compute game statistics from the current state ────────────────────────────

interface GameStats {
  totalTurns: number;
  totalPlanets: number;
  totalFleets: number;
  totalShips: number;
  planetsControlled: number;
  battlesWon: number;
  shipsBuilt: number;
  empiresAlive: number;
  empiresDefeated: number;
}

function computeStats(state: GameState): GameStats {
  const playerEmpire = state.empires.byId[state.empires.playerId];

  let battlesWon = 0;
  let shipsBuilt = 0;

  for (const empire of Object.values(state.empires.byId)) {
    // Count ships built across all designs
    for (const designId of empire.shipDesigns) {
      const design = state.shipDesigns.byId[designId];
      if (design) {
        shipsBuilt += design.shipsBuilt;
      }
    }
    // Rough battle win estimate: count positive combat events for this empire
    for (const event of state.turnEvents) {
      if (event.type === 'combat' && event.empireId === empire.id) {
        battlesWon++;
      }
    }
  }

  // Player-specific stats
  const planetsControlled = playerEmpire ? playerEmpire.planets.length : 0;
  const totalFleets = playerEmpire ? playerEmpire.fleets.length : 0;
  let totalShips = 0;
  if (playerEmpire) {
    for (const fleetId of playerEmpire.fleets) {
      const fleet = state.fleets.byId[fleetId];
      if (fleet) {
        totalShips += fleet.shipIds.length;
      }
    }
  }

  const totalPlanets = state.planets.allIds.length;
  const empiresAlive = state.empires.allIds.filter((id) => !state.empires.byId[id].isDefeated).length;
  const empiresDefeated = state.empires.allIds.filter((id) => state.empires.byId[id].isDefeated).length;

  return {
    totalTurns: state.turn,
    totalPlanets,
    totalFleets,
    totalShips,
    planetsControlled,
    battlesWon,
    shipsBuilt,
    empiresAlive,
    empiresDefeated,
  };
}

// ── VictoryScreen ─────────────────────────────────────────────────────────────

export class VictoryScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;
  private overlayEl!: HTMLElement;
  private contentEl!: HTMLElement;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.container.classList.add('victory-screen');
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

  /** Start a new game (dispatches NEW_GAME). */
  playAgain(): void {
    this.store.dispatch({ type: 'NEW_GAME' });
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'new_game' } });
  }

  /** Return to galaxy map (for defeated player who wants to continue watching). */
  returnToMap(): void {
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
  }

  /** Quit to main menu. */
  quitToMenu(): void {
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'menu' } });
  }

  // ── Private builders ──────────────────────────────────────────────────────

  private buildPanel(state: GameState): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'victory-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Game Over');

    // Full-screen overlay
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'victory-overlay';
    this.overlayEl.addEventListener('click', (e) => {
      // Clicking outside content area does nothing (prevents accidental dismissal)
      if (e.target === this.overlayEl) {
        // Optional: could add a "press ESC" feel, but game over should require explicit action
      }
    });
    panel.appendChild(this.overlayEl);

    // Main card
    this.contentEl = document.createElement('div');
    this.contentEl.className = 'victory-card';
    this.contentEl.style.display = 'none'; // Hidden until first render
    panel.appendChild(this.contentEl);

    // Build the content
    this.renderContent(state);

    return panel;
  }

  private renderContent(state: GameState): void {
    const content = this.contentEl;
    if (!content) return;
    content.style.display = '';

    // Determine if player won or lost
    const isGameOver = state.isGameOver;
    const victoryResult = state.victoryResult;
    const isPlayerWinner =
      isGameOver &&
      victoryResult &&
      victoryResult.winnerId === state.empires.playerId;

    // Victory type and styling
    const winType = victoryResult?.type ?? null;
    const colors = winType ? VICTORY_COLORS[winType] : VICTORY_COLORS.conquest;

    // ── Card background with gradient ──────────────────────────────────────
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 48px;
      max-width: 680px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      background: linear-gradient(180deg, ${colors.bg} 0%, #000a1a 100%);
      border: 2px solid ${colors.accent};
      border-radius: 12px;
      box-shadow: 0 0 60px ${colors.glow}44, inset 0 0 30px ${colors.glow}22;
      font-family: 'Courier New', Courier, monospace;
      color: #c0d8f0;
      position: relative;
    `;

    // ── Title ──────────────────────────────────────────────────────────────
    const title = document.createElement('h1');
    title.className = 'victory-title';
    if (isPlayerWinner) {
      title.textContent = 'VICTORY!';
      title.style.color = colors.accent;
    } else if (isGameOver) {
      title.textContent = 'DEFEAT';
      title.style.color = '#ff3333';
    } else {
      title.textContent = 'GAME OVER';
      title.style.color = '#ffaa00';
    }
    title.style.cssText = `
      font-size: 48px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 6px;
      margin: 0 0 8px 0;
      text-shadow: 0 0 20px ${colors.glow}88;
      text-align: center;
    `;
    content.appendChild(title);

    // ── Victory type description ───────────────────────────────────────────
    if (isPlayerWinner && winType) {
      const typeLabel = document.createElement('h2');
      typeLabel.className = 'victory-type-label';
      typeLabel.textContent = VICTORY_TYPE_LABELS[winType];
      typeLabel.style.cssText = `
        font-size: 22px;
        color: ${colors.accent};
        margin: 0 0 4px 0;
        text-transform: uppercase;
        letter-spacing: 3px;
      `;
      content.appendChild(typeLabel);

      const typeDesc = document.createElement('p');
      typeDesc.className = 'victory-type-desc';
      typeDesc.textContent = VICTORY_TYPE_DESCRIPTIONS[winType];
      typeDesc.style.cssText = `
        font-size: 13px;
        color: #8899aa;
        margin: 0 0 24px 0;
        text-align: center;
        max-width: 500px;
      `;
      content.appendChild(typeDesc);
    }

    // ── Defeat info ────────────────────────────────────────────────────────
    if (isGameOver && !isPlayerWinner && victoryResult) {
      const winnerEmpire = state.empires.byId[victoryResult.winnerId];
      const winnerName = winnerEmpire ? winnerEmpire.name : 'Unknown Empire';

      const defeatInfo = document.createElement('p');
      defeatInfo.style.cssText = `
        font-size: 18px;
        color: #ff8888;
        margin: 0 0 24px 0;
        text-align: center;
      `;
      defeatInfo.textContent = `${winnerName} has won the game.`;
      content.appendChild(defeatInfo);

      if (winType) {
        const typeLabel = document.createElement('p');
        typeLabel.style.cssText = `
          font-size: 13px;
          color: #8899aa;
          margin: 0 0 24px 0;
          text-align: center;
          font-style: italic;
        `;
        typeLabel.textContent = VICTORY_TYPE_LABELS[winType];
        content.appendChild(typeLabel);
      }
    }

    // ── Game Statistics Panel ──────────────────────────────────────────────
    const gameStats = computeStats(state);

    const statsContainer = document.createElement('div');
    statsContainer.className = 'victory-stats-panel';
    statsContainer.style.cssText = `
      width: 100%;
      max-width: 500px;
      background: rgba(0, 10, 26, 0.8);
      border: 1px solid ${colors.accent}44;
      border-radius: 8px;
      padding: 20px 24px;
      margin-bottom: 24px;
    `;

    const statsTitle = document.createElement('h3');
    statsTitle.className = 'victory-stats-title';
    statsTitle.textContent = 'GAME STATISTICS';
    statsTitle.style.cssText = `
      font-size: 14px;
      letter-spacing: 2px;
      color: ${colors.accent};
      text-align: center;
      margin: 0 0 16px 0;
      border-bottom: 1px solid ${colors.accent}33;
      padding-bottom: 8px;
    `;
    statsContainer.appendChild(statsTitle);

    // Two-column stat layout
    const statsGrid = document.createElement('div');
    statsGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px;';

    const statItems: Array<{ label: string; value: string | number }> = [
      { label: 'Total Turns', value: gameStats.totalTurns },
      { label: 'Planets Controlled', value: gameStats.planetsControlled },
      { label: 'Total Planets', value: gameStats.totalPlanets },
      { label: 'Total Fleets', value: gameStats.totalFleets },
      { label: 'Total Ships Built', value: gameStats.shipsBuilt },
      { label: 'Total Ships', value: gameStats.totalShips },
      { label: 'Battles Won', value: gameStats.battlesWon },
      { label: 'Empires Defeated', value: gameStats.empiresDefeated },
      { label: 'Empires Alive', value: gameStats.empiresAlive },
    ];

    for (const stat of statItems) {
      const statEl = document.createElement('div');
      statEl.style.cssText = 'display: flex; flex-direction: column; gap: 2px;';

      const statLabel = document.createElement('span');
      statLabel.style.cssText = 'font-size: 10px; color: #607080; text-transform: uppercase; letter-spacing: 1px;';
      statLabel.textContent = stat.label;

      const statValue = document.createElement('span');
      statValue.style.cssText = 'font-size: 18px; color: #e0f0ff; font-weight: bold;';
      statValue.textContent = String(stat.value);

      statEl.appendChild(statLabel);
      statEl.appendChild(statValue);
      statsGrid.appendChild(statEl);
    }

    statsContainer.appendChild(statsGrid);
    content.appendChild(statsContainer);

    // ── Action Buttons ─────────────────────────────────────────────────────
    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = 'display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; justify-content: center;';

    // PLAY AGAIN button
    const playAgainBtn = this.makeButton('PLAY AGAIN', '#005500', '#00cc66');
    playAgainBtn.style.cssText = 'padding: 10px 28px; font-size: 14px;';
    playAgainBtn.textContent = '▶  PLAY AGAIN';
    playAgainBtn.addEventListener('click', () => this.playAgain());
    buttonRow.appendChild(playAgainBtn);

    // RETURN TO MAP (only if player is alive and game ended for another reason)
    if (isGameOver && !isPlayerWinner) {
      const returnBtn = this.makeButton('RETURN TO MAP', '#3a2a00', '#ffaa00');
      returnBtn.style.cssText = 'padding: 10px 20px; font-size: 13px;';
      returnBtn.textContent = '◀  RETURN';
      returnBtn.addEventListener('click', () => this.returnToMap());
      buttonRow.appendChild(returnBtn);
    }

    // QUIT TO MENU button
    const quitBtn = this.makeButton('QUIT TO MENU', '#3a1a1a', '#ff4444');
    quitBtn.style.cssText = 'padding: 10px 20px; font-size: 13px;';
    quitBtn.textContent = '✕  QUIT';
    quitBtn.addEventListener('click', () => this.quitToMenu());
    buttonRow.appendChild(quitBtn);

    content.appendChild(buttonRow);

    // ── Credits / About ────────────────────────────────────────────────────
    const creditsEl = document.createElement('div');
    creditsEl.className = 'victory-credits';
    creditsEl.style.cssText = `
      text-align: center;
      font-size: 10px;
      color: #445566;
      line-height: 1.6;
      padding-top: 12px;
      border-top: 1px solid #1a2a3a;
      max-width: 400px;
    `;
    creditsEl.innerHTML = [
      'Hamster of Orion',
      'A turn-based 4X space strategy game',
      '',
      'Inspired by Master of Orion',
      'v' + (state.version || '0.1.0'),
    ].join('<br>');
    content.appendChild(creditsEl);
  }

  private makeButton(label: string, bg: string, border: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `
      background: ${bg};
      border: 1px solid ${border};
      color: #fff;
      padding: 8px 20px;
      cursor: pointer;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: background 0.15s, border-color 0.15s;
      border-radius: 4px;
    `;
    btn.addEventListener('mouseover', () => {
      btn.style.background = border;
      btn.style.borderColor = border;
    });
    btn.addEventListener('mouseout', () => {
      btn.style.background = bg;
      btn.style.borderColor = border;
    });
    return btn;
  }
}
