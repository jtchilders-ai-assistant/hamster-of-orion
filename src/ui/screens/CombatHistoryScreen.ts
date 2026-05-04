/**
 * Combat History Log — record of all battles.
 * src/ui/screens/CombatHistoryScreen.ts
 *
 * Shows a scrollable log of every combat that has occurred during play,
 * pulled from state.turnEvents (combat type) enriched with details from
 * state.combats.byId.  Each entry is collapsible to show participants,
 * casualties, and salvage.
 */

import { Combat, CombatId, CombatPhase, EmpireId, GameState } from '../../game/state';
import { Store } from '../../game/store';

// ── Data types ────────────────────────────────────────────────────────────────

interface CombatLogEntry {
  turn: number;
  systemName: string;
  combatId: CombatId;
  participants: {
    empireId: EmpireId;
    empireName: string;
    fleetCount: number;
    shipCount: number;
  }[];
  victor: EmpireId | null;
  casualties: {
    empire: string;
    lostShips: number;
    shipNames: string[];
  }[];
  salvage: number;
  phase: CombatPhase;
}

// ── Screen class ──────────────────────────────────────────────────────────────

export class CombatHistoryScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.container.classList.add('combat-history-screen');
  }

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

  /** Navigate back to the previous screen (typically the galaxy map). */
  continue(): void {
    const state = this.store.getState();
    if (state.ui.previousScreen) {
      this.store.dispatch({ type: 'NAVIGATE', payload: { screen: state.ui.previousScreen } });
    } else {
      this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
    }
  }

  // ── Private builders ──────────────────────────────────────────────────────

  private buildPanel(state: GameState): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'combat-history-panel';

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.className = 'combat-history-title-bar';

    const icon = document.createElement('span');
    icon.className = 'combat-history-icon';
    icon.textContent = '⚔️';
    titleBar.appendChild(icon);

    const title = document.createElement('h2');
    title.className = 'combat-history-title';
    title.textContent = 'Combat History';
    titleBar.appendChild(title);

    const count = document.createElement('span');
    count.className = 'combat-history-count';
    const entries = this.extractCombatHistory(state);
    count.textContent = `${entries.length} battle${entries.length !== 1 ? 's' : ''}`;
    titleBar.appendChild(count);

    panel.appendChild(titleBar);

    // Scrollable log
    const log = this.buildLog(state, entries);
    panel.appendChild(log);

    // Continue button
    const footer = document.createElement('div');
    footer.className = 'combat-history-footer';
    const btn = document.createElement('button');
    btn.className = 'combat-history-continue-btn';
    btn.textContent = 'Continue';
    btn.addEventListener('click', () => this.continue());
    footer.appendChild(btn);
    panel.appendChild(footer);

    return panel;
  }

  private buildLog(_state: GameState, entries: CombatLogEntry[]): HTMLElement {
    const log = document.createElement('div');
    log.className = 'combat-history-log';

    if (entries.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'combat-history-empty';
      empty.textContent = 'No battles have been fought yet.';
      log.appendChild(empty);
      return log;
    }

    for (const entry of entries) {
      log.appendChild(this.renderLogEntry(entry));
    }

    return log;
  }

  /**
   * Gather combat history from turnEvents (type === 'combat') and enrich
   * with details from state.combats.byId.
   */
  private extractCombatHistory(state: GameState): CombatLogEntry[] {
    const entries: CombatLogEntry[] = [];
    const { turnEvents, combats } = state;

    // galaxy.systems.byId provides system name lookups
    const sysById = state.galaxy.systems.byId;

    // Collect combat turnEvents, preserving order
    const combatEvents = turnEvents.filter(e => e.type === 'combat' && e.combatId);

    // Also check state.combats.allIds for any combats not yet in turnEvents
    const eventCombatIds = new Set(combatEvents.map(e => e.combatId!));

    for (const evt of combatEvents) {
      const combat = combats.byId[evt.combatId!];
      if (!combat) continue;

      entries.push(this.resolveCombatEntry(state, combat, sysById, evt.turn));
    }

    // Pick up any finished combats that weren't captured by turnEvents
    for (const combatId of combats.allIds) {
      if (eventCombatIds.has(combatId)) continue;
      const combat = combats.byId[combatId];
      if (!combat || !combat.isFinished) continue;
      entries.push(this.resolveCombatEntry(state, combat, sysById, combat.turn));
    }

    // Sort by turn descending (most recent first)
    entries.sort((a, b) => b.turn - a.turn);

    return entries;
  }

  private resolveCombatEntry(
    state: GameState,
    combat: Combat,
    sysById: Record<string, { name: string }>,
    turn: number,
  ): CombatLogEntry {
    const systemName = sysById[combat.systemId]?.name ?? combat.systemId;

    const participants: CombatLogEntry['participants'] = [];
    const casualties: CombatLogEntry['casualties'] = [];

    for (const [empireId, p] of Object.entries(combat.participants)) {
      const empire = state.empires.byId[empireId];
      const empireName = empire?.name ?? empireId;
      const shipCount = p.ships.length;
      const fleetCount = p.fleetIds.length;

      participants.push({ empireId, empireName, fleetCount, shipCount });

      const losses = combat.casualties[empireId];
      const lostShips = losses ? losses.length : 0;
      const shipNames = losses ? losses.map(l => l.designName) : [];

      casualties.push({
        empire: empireName,
        lostShips,
        shipNames,
      });
    }

    // Only show non-zero casualties
    const relevantCasualties = casualties.filter(c => c.lostShips > 0);

    return {
      turn,
      systemName,
      combatId: combat.id,
      participants,
      victor: combat.victor,
      casualties: relevantCasualties.length > 0 ? relevantCasualties : [{ empire: 'No casualties', lostShips: 0, shipNames: [] }],
      salvage: combat.salvage,
      phase: combat.phase,
    };
  }

  private renderLogEntry(entry: CombatLogEntry): HTMLElement {
    const card = document.createElement('div');
    card.className = 'combat-history-entry';

    // ── Summary row (always visible) ──

    const summary = document.createElement('div');
    summary.className = 'combat-history-summary';

    // Turn badge
    const turnBadge = document.createElement('span');
    turnBadge.className = 'combat-history-turn-badge';
    turnBadge.textContent = `T${entry.turn}`;
    summary.appendChild(turnBadge);

    // System name
    const systemName = document.createElement('span');
    systemName.className = 'combat-history-system';
    systemName.textContent = entry.systemName;
    summary.appendChild(systemName);

    // Outcome indicator
    const outcome = document.createElement('span');
    outcome.className = 'combat-history-outcome';
    if (entry.victor) {
      const victorEmpire = this.store.getState().empires.byId[entry.victor];
      outcome.textContent = `${victorEmpire?.name ?? entry.victor} victory`;
      outcome.classList.add('victory');
    } else {
      outcome.textContent = 'Undecided';
      outcome.classList.add('inconclusive');
    }
    summary.appendChild(outcome);

    // Salvage
    if (entry.salvage > 0) {
      const salvageEl = document.createElement('span');
      salvageEl.className = 'combat-history-salvage';
      salvageEl.textContent = `+${entry.salvage} salvage`;
      summary.appendChild(salvageEl);
    }

    // Toggle arrow
    const toggle = document.createElement('span');
    toggle.className = 'combat-history-toggle';
    toggle.textContent = '▼';
    summary.appendChild(toggle);

    card.appendChild(summary);

    // ── Expanded details (hidden by default) ──

    const details = document.createElement('div');
    details.className = 'combat-history-details';
    details.style.display = 'none';

    // Participants section
    const partsSection = this.renderParticipants(entry);
    details.appendChild(partsSection);

    // Casualties section
    const casSection = this.renderCasualties(entry);
    details.appendChild(casSection);

    // Phase
    const phaseRow = document.createElement('div');
    phaseRow.className = 'combat-history-phase-row';
    const phaseLabel = document.createElement('span');
    phaseLabel.className = 'combat-history-phase-label';
    phaseLabel.textContent = 'Phase:';
    phaseRow.appendChild(phaseLabel);
    const phaseValue = document.createElement('span');
    phaseValue.className = 'combat-history-phase-value';
    phaseValue.textContent = this.formatPhase(entry.phase);
    phaseRow.appendChild(phaseValue);
    details.appendChild(phaseRow);

    // Toggle behavior
    summary.addEventListener('click', () => {
      const isOpen = details.style.display !== 'none';
      details.style.display = isOpen ? 'none' : '';
      toggle.textContent = isOpen ? '▼' : '▶';
      card.classList.toggle('expanded', !isOpen);
    });

    card.appendChild(details);

    return card;
  }

  private renderParticipants(entry: CombatLogEntry): HTMLElement {
    const section = document.createElement('div');
    section.className = 'combat-history-subsection';

    const header = document.createElement('h4');
    header.className = 'combat-history-subsection-title';
    header.textContent = `Participants — ${entry.participants.length} factions`;
    section.appendChild(header);

    const list = document.createElement('div');
    list.className = 'combat-history-participant-list';

    for (const p of entry.participants) {
      const row = document.createElement('div');
      row.className = 'combat-history-participant-row';

      const name = document.createElement('span');
      name.className = 'combat-history-participant-name';
      name.textContent = p.empireName;
      row.appendChild(name);

      const fleets = document.createElement('span');
      fleets.className = 'combat-history-participant-stat';
      fleets.textContent = `${p.fleetCount} fleet${p.fleetCount !== 1 ? 's' : ''}`;
      row.appendChild(fleets);

      const ships = document.createElement('span');
      ships.className = 'combat-history-participant-stat';
      ships.textContent = `${p.shipCount} ship${p.shipCount !== 1 ? 's' : ''}`;
      row.appendChild(ships);

      list.appendChild(row);
    }

    section.appendChild(list);
    return section;
  }

  private renderCasualties(entry: CombatLogEntry): HTMLElement {
    const section = document.createElement('div');
    section.className = 'combat-history-subsection';

    const header = document.createElement('h4');
    header.className = 'combat-history-subsection-title';
    header.textContent = `Casualties`;
    section.appendChild(header);

    const list = document.createElement('div');
    list.className = 'combat-history-casualty-list';

    for (const c of entry.casualties) {
      const row = document.createElement('div');
      row.className = 'combat-history-casualty-row';

      const name = document.createElement('span');
      name.className = 'combat-history-casualty-name';
      name.textContent = c.empire;
      row.appendChild(name);

      const lost = document.createElement('span');
      lost.className = 'combat-history-casualty-count';
      lost.textContent = c.lostShips > 0 ? `${c.lostShips} lost` : 'None';
      if (c.lostShips > 0) {
        lost.classList.add('casualties');
      } else {
        lost.classList.add('none');
      }
      row.appendChild(lost);

      list.appendChild(row);

      // Show individual ship names if there are losses
      if (c.lostShips > 0 && c.shipNames.length > 0) {
        const shipList = document.createElement('div');
        shipList.className = 'combat-history-ship-losses';
        for (const shipName of c.shipNames) {
          const shipEl = document.createElement('span');
          shipEl.className = 'combat-history-ship-loss';
          shipEl.textContent = `▸ ${shipName}`;
          shipList.appendChild(shipEl);
        }
        list.appendChild(shipList);
      }
    }

    section.appendChild(list);
    return section;
  }

  private formatPhase(phase: CombatPhase): string {
    const labels: Record<CombatPhase, string> = {
      initiative: 'Initiative',
      movement: 'Movement',
      firing: 'Firing',
      special: 'Special',
      resolution: 'Resolution',
    };
    return labels[phase] ?? phase;
  }
}
