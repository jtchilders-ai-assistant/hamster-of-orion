/**
 * Turn End Confirmation Dialog
 * src/ui/components/TurnConfirmDialog.ts
 *
 * Per design/ui-ux/state-transitions.md §3.3 "Turn End Confirmation Dialog":
 *   - Shows automatically when player presses Enter/End Turn
 *   - Summarizes all actions that will execute
 *   - Highlights warnings for undefended colonies, idle production, idle research
 *   - "Don't show warnings in future" checkbox (sets confirmEndTurn: false in settings)
 *   - Enter key confirms, Escape cancels
 *
 * This is a UI-only component (DOM). Game logic stays in src/game/.
 */

import { Store, Action } from '../../game/store';
import { GameState, Treaty } from '../../game/state';
import techTreeRaw from '../../data/tech-tree.json';

// ── Tech lookup (same pattern as ResearchScreen) ─────────────────────────────

interface TechEntry {
  id: string;
  name: string;
  tier: number;
  cost?: number;
}
interface TechTreeData {
  technologies: TechEntry[];
}
const TECH_DATA = (techTreeRaw as TechTreeData).technologies;
const TECH_BY_ID = new Map<string, TechEntry>(TECH_DATA.map((t) => [t.id, t]));

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TurnSummaryData {
  turn: number;
  movingFleets: number;
  shipsCompleting: Array<{ name: string; planet: string }>;
  researchProgress: string | null; // e.g. "Plasma Cannon continues (78% → 91%)"
  tradeIncome: number;
  warnings: string[];
}

// ── Dialog ────────────────────────────────────────────────────────────────────

export class TurnConfirmDialog {
  private readonly store: Store<GameState>;
  private overlay: HTMLElement | null = null;
  private onConfirmCb: (() => void) | null = null;

  constructor(store: Store<GameState>) {
    this.store = store;
  }

  /**
   * Show the confirmation dialog. Resolves when player confirms or cancels.
   * @param onConfirm Called if player clicks End Turn or presses Enter
   */
  show(onConfirm: () => void): void {
    // Remove any existing dialog
    this.remove();

    this.onConfirmCb = onConfirm;

    const state = this.store.getState();
    const data = this.buildSummary(state);

    this.overlay = this.buildDialog(data);
    document.body.appendChild(this.overlay);

    // Focus the confirm button for keyboard accessibility
    const confirmBtn = this.overlay.querySelector<HTMLButtonElement>('.turn-confirm-btn-confirm');
    confirmBtn?.focus();

    // Keyboard handler
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        this.confirm();
        document.removeEventListener('keydown', onKeyDown, true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.remove();
        document.removeEventListener('keydown', onKeyDown, true);
      }
    };
    document.addEventListener('keydown', onKeyDown, true);

    // Store cleanup ref on the overlay for removal
    (this.overlay as HTMLElement & { _keyHandler?: (e: KeyboardEvent) => void })._keyHandler =
      onKeyDown;
  }

  remove(): void {
    if (this.overlay) {
      const h = (this.overlay as HTMLElement & { _keyHandler?: (e: KeyboardEvent) => void })
        ._keyHandler;
      if (h) document.removeEventListener('keydown', h, true);
      this.overlay.remove();
      this.overlay = null;
    }
    this.onConfirmCb = null;
  }

  isOpen(): boolean {
    return this.overlay !== null;
  }

  // ── Private: build summary from game state ──────────────────────────────────

  private buildSummary(state: GameState): TurnSummaryData {
    const playerEmpire = Object.values(state.empires.byId).find((e) => e.isPlayer);

    const turn = state.turn ?? 1;
    let movingFleets = 0;
    const shipsCompleting: Array<{ name: string; planet: string }> = [];
    const warnings: string[] = [];

    if (playerEmpire) {
      // Fleets with destinations (will move this turn)
      const fleets = Object.values(state.fleets?.byId ?? {}).filter(
        (f) => f.ownerId === playerEmpire.id && f.destination !== null,
      );
      movingFleets = fleets.length;

      // Ships completing construction next turn (turnsRemaining === 1)
      for (const planetId of playerEmpire.planets) {
        const planet = state.planets.byId[planetId];
        if (!planet) continue;

        // Warn: planet with no build queue and not at population/factory cap
        const hasIdle =
          planet.buildQueue.length === 0 && planet.population > 0;
        if (hasIdle) {
          warnings.push(`${planet.name} has unspent production capacity`);
        }

        for (const item of planet.buildQueue) {
          if (item.turnsRemaining === 1) {
            shipsCompleting.push({ name: item.targetName, planet: planet.name });
          }
        }

        // Warn: undefended colonies (no fleet, no missile bases)
        const planetFleets = Object.values(state.fleets?.byId ?? {}).filter(
          (f) =>
            f.ownerId === playerEmpire.id &&
            f.systemId === planet.systemId &&
            f.destination === null,
        );
        if (planetFleets.length === 0 && planet.missileBases === 0 && planet.population > 0) {
          warnings.push(`${planet.name} has no defending fleet!`);
        }
      }

      // Research progress
      // Per design/ui-ux/state-transitions.md §3.3: show "Research X continues (A% → B%)"
      // We check if any field has 0% allocation and warn
      const fieldAlloc = playerEmpire.research.fieldAllocation;
      if (fieldAlloc) {
        const hasZeroField = Object.values(fieldAlloc).some((v) => v === 0);
        // Only warn if they also have active research in that field
        if (hasZeroField) {
          const fieldCurrentTech = playerEmpire.research.fieldCurrentTech;
          if (fieldCurrentTech) {
            const zeroedFields = Object.entries(fieldAlloc)
              .filter(([, v]) => v === 0)
              .map(([k]) => k);
            for (const field of zeroedFields) {
              const techId = fieldCurrentTech[field as keyof typeof fieldCurrentTech];
              if (techId) {
                warnings.push(`Research allocation at 0% for ${field}`);
              }
            }
          }
        }
      }
    }

    // Trade income: gather all active trade treaties from player's relations
    let tradeIncome = 0;
    if (playerEmpire) {
      const relations = playerEmpire.relations ?? {};
      const allTreaties: Treaty[] = [];
      for (const rel of Object.values(relations)) {
        if (rel.treaties) {
          for (const treaty of rel.treaties) {
            if (treaty.isActive && treaty.type === 'trade') {
              allTreaties.push(treaty);
            }
          }
        }
      }
      tradeIncome = allTreaties.reduce((sum, t) => sum + (t.terms.tradeIncome ?? 0), 0);
    }

    // Research summary (current tech + rough progress if available)
    let researchProgress: string | null = null;
    if (playerEmpire?.research.currentTech) {
      const tech = TECH_BY_ID.get(playerEmpire.research.currentTech);
      if (tech) {
        const rp = playerEmpire.research.researchPoints ?? 0;
        const cost = tech.cost ?? 1;
        const pct = Math.min(99, Math.round((rp / cost) * 100));
        const afterPct = Math.min(99, pct + Math.round(((playerEmpire.research.researchPerTurn ?? 0) / cost) * 100));
        researchProgress = `${tech.name} continues (${pct}% → ${afterPct}%)`;
      }
    }

    return { turn, movingFleets, shipsCompleting, researchProgress, tradeIncome, warnings };
  }

  // ── Private: build DOM ──────────────────────────────────────────────────────

  private buildDialog(data: TurnSummaryData): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'turn-confirm-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'turn-confirm-title');

    const dialog = document.createElement('div');
    dialog.className = 'turn-confirm-dialog';

    // Header
    const header = document.createElement('div');
    header.className = 'turn-confirm-header';
    header.innerHTML = `<span id="turn-confirm-title">END TURN ${data.turn}?</span>`;
    dialog.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'turn-confirm-body';

    // Summary list
    const summaryLines: string[] = [];
    if (data.movingFleets > 0) {
      summaryLines.push(`✓ ${data.movingFleets} fleet${data.movingFleets !== 1 ? 's' : ''} will move to their destinations`);
    }
    if (data.shipsCompleting.length > 0) {
      const names = data.shipsCompleting.map((s) => `${s.name} at ${s.planet}`).join(', ');
      summaryLines.push(`✓ ${data.shipsCompleting.length} ship${data.shipsCompleting.length !== 1 ? 's' : ''} will complete construction (${names})`);
    }
    if (data.researchProgress) {
      summaryLines.push(`✓ Research: ${data.researchProgress}`);
    }
    if (data.tradeIncome > 0) {
      summaryLines.push(`✓ Trade income: +${data.tradeIncome} BC`);
    }
    if (summaryLines.length === 0) {
      summaryLines.push('No pending actions this turn.');
    }

    const summaryEl = document.createElement('ul');
    summaryEl.className = 'turn-confirm-summary';
    for (const line of summaryLines) {
      const li = document.createElement('li');
      li.textContent = line;
      summaryEl.appendChild(li);
    }
    body.appendChild(summaryEl);

    // Warnings
    if (data.warnings.length > 0) {
      const warnSection = document.createElement('div');
      warnSection.className = 'turn-confirm-warnings';
      const warnTitle = document.createElement('p');
      warnTitle.className = 'turn-confirm-warn-title';
      warnTitle.textContent = '⚠ WARNINGS:';
      warnSection.appendChild(warnTitle);

      const warnList = document.createElement('ul');
      for (const w of data.warnings) {
        const li = document.createElement('li');
        li.textContent = `• ${w}`;
        warnList.appendChild(li);
      }
      warnSection.appendChild(warnList);
      body.appendChild(warnSection);
    }

    dialog.appendChild(body);

    // Footer: checkbox + buttons
    const footer = document.createElement('div');
    footer.className = 'turn-confirm-footer';

    // "Don't show" checkbox
    const checkRow = document.createElement('label');
    checkRow.className = 'turn-confirm-skip-label';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'turn-confirm-skip-check';
    checkbox.dataset['testid'] = 'turn-confirm-skip';
    checkRow.appendChild(checkbox);
    checkRow.appendChild(document.createTextNode(' Don\'t show end turn confirmation'));
    footer.appendChild(checkRow);

    // Buttons row
    const btnRow = document.createElement('div');
    btnRow.className = 'turn-confirm-btns';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'turn-confirm-btn turn-confirm-btn-cancel';
    cancelBtn.dataset['testid'] = 'turn-confirm-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.remove());

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'turn-confirm-btn turn-confirm-btn-confirm';
    confirmBtn.dataset['testid'] = 'turn-confirm-end-turn';
    confirmBtn.textContent = 'End Turn ⏎';
    confirmBtn.addEventListener('click', () => {
      if (checkbox.checked) {
        // Persist setting: disable end-turn confirmation
        this.store.dispatch({ type: 'SET_CONFIRM_END_TURN', payload: { value: false } } as Action);
      }
      this.confirm();
    });

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    footer.appendChild(btnRow);

    dialog.appendChild(footer);
    overlay.appendChild(dialog);

    // Click overlay background to cancel
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.remove();
    });

    return overlay;
  }

  // ── Private: actions ────────────────────────────────────────────────────────

  private confirm(): void {
    const cb = this.onConfirmCb;
    this.remove();
    cb?.();
  }
}
