/**
 * Diplomacy / Races screen — full implementation.
 * src/ui/screens/DiplomacyScreen.ts
 *
 * Corresponds to the RACES button (F5) in the command bar.
 * Shows diplomatic relations, treaties, and audience options for all known races.
 */

import { DiplomaticRelations, Empire, EmpireId, GameState, Treaty } from '../../game/state';
import {
  getDiplomaticState,
  getRelationValue,
  STATE_WAR_THRESHOLD,
} from '../../game/systems/diplomacy';
import { hasTreaty } from '../../game/systems/treaties';

export class DiplomacyScreen {
  private readonly container: HTMLElement;
  private selectedEmpireId: EmpireId | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.buildLayout();
  }

  // ── Layout ────────────────────────────────────────────────────────────────

  private buildLayout(): void {
    this.container.innerHTML = `
      <div class="screen-header">
        <h1>RACES &amp; DIPLOMACY</h1>
      </div>
      <div class="diplomacy-body">
        <div class="diplomacy-races-list" id="diplomacy-races-list"></div>
        <div class="diplomacy-detail-panel" id="diplomacy-detail-panel">
          <p class="placeholder-label">Select a race to view details</p>
        </div>
      </div>
    `;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render(state: GameState): void {
    const player = Object.values(state.empires.byId).find(e => e.isPlayer);
    if (!player) return;

    const known = this.knownEmpires(player, state);
    this.renderRaceList(known, player, state);

    if (this.selectedEmpireId && state.empires.byId[this.selectedEmpireId]) {
      this.renderDetail(state.empires.byId[this.selectedEmpireId]!, player, state);
    } else if (known.length > 0) {
      this.selectedEmpireId = known[0]!.id;
      this.renderDetail(known[0]!, player, state);
    }
  }

  // ── Race list panel ───────────────────────────────────────────────────────

  private knownEmpires(player: Empire, state: GameState): Empire[] {
    const known: Empire[] = [];
    for (const id of Object.keys(player.relations)) {
      const empire = state.empires.byId[id];
      if (empire && !empire.isPlayer && !empire.isDefeated) {
        known.push(empire);
      }
    }
    return known;
  }

  private renderRaceList(empires: Empire[], player: Empire, state: GameState): void {
    const listEl = this.container.querySelector('#diplomacy-races-list');
    if (!listEl) return;

    if (empires.length === 0) {
      listEl.innerHTML = '<p class="placeholder-label">No known races</p>';
      return;
    }

    listEl.innerHTML = empires.map(empire => {
      const relValue = getRelationValue(state, player.id, empire.id);
      const relState = getDiplomaticState(relValue);
      const isSelected = empire.id === this.selectedEmpireId;
      const stateClass = this.relationClass(relState);

      return `
        <div class="race-list-item ${isSelected ? 'selected' : ''} ${stateClass}"
             data-empire-id="${empire.id}">
          <span class="race-name">${empire.name}</span>
          <span class="race-status">${this.statusLabel(relState, relValue)}</span>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.race-list-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset['empireId'];
        if (id) {
          this.selectedEmpireId = id;
          const empire = state.empires.byId[id];
          if (empire) this.renderDetail(empire, player, state);
          listEl.querySelectorAll('.race-list-item').forEach(e => e.classList.remove('selected'));
          el.classList.add('selected');
        }
      });
    });
  }

  // ── Detail panel ──────────────────────────────────────────────────────────

  private renderDetail(empire: Empire, player: Empire, state: GameState): void {
    const detailEl = this.container.querySelector('#diplomacy-detail-panel');
    if (!detailEl) return;

    const relValue = getRelationValue(state, player.id, empire.id);
    const relState = getDiplomaticState(relValue);
    const relation: DiplomaticRelations | undefined = player.relations[empire.id];
    const treaties: Treaty[] = relation?.treaties ?? [];
    const stateClass = this.relationClass(relState);
    const barWidth = Math.round(((relValue + 100) / 200) * 100);

    const isAtWar = relValue <= STATE_WAR_THRESHOLD;
    const canDeclareWar = !isAtWar;
    const hasTradeAgreement = hasTreaty(state, player.id, empire.id, 'trade');
    const hasNAP = hasTreaty(state, player.id, empire.id, 'non_aggression');
    const hasAlliance = hasTreaty(state, player.id, empire.id, 'military_alliance');

    const treatyList = treaties.length > 0
      ? treaties.map(t => `<li class="treaty-tag treaty-${t.type}">${this.treatyLabel(t)}</li>`).join('')
      : '<li class="no-treaties">None</li>';

    const powerLabel = this.militaryPowerLabel(empire, player, state);
    const techLabel = this.techComparison(empire, player);

    detailEl.innerHTML = `
      <div class="detail-header">
        <div class="race-portrait">
          <div class="portrait-placeholder">${empire.raceId.charAt(0).toUpperCase()}</div>
        </div>
        <div class="race-info">
          <h2>${empire.name}</h2>
          <div class="race-id-tag">${empire.raceId}</div>
        </div>
      </div>

      <div class="detail-section relation-section">
        <div class="relation-label ${stateClass}">
          ${this.statusLabel(relState, relValue)} (${relValue > 0 ? '+' : ''}${relValue})
        </div>
        <div class="relation-bar-outer">
          <div class="relation-bar-inner ${stateClass}" style="width:${barWidth}%"></div>
        </div>
      </div>

      <div class="detail-section">
        <h3>Active Treaties</h3>
        <ul class="treaty-list">${treatyList}</ul>
      </div>

      <div class="detail-section intel-section">
        <h3>Intelligence</h3>
        <div class="intel-row"><span>Military Power:</span><span>${powerLabel}</span></div>
        <div class="intel-row"><span>Tech Level:</span><span>${techLabel}</span></div>
        <div class="intel-row"><span>Planets:</span><span>${empire.planets.length}</span></div>
      </div>

      <div class="detail-section actions-section">
        <h3>Diplomatic Actions</h3>
        <div class="action-buttons">
          ${!hasTradeAgreement && !isAtWar ? `<button class="action-btn" data-action="propose-trade" data-target="${empire.id}">Propose Trade</button>` : ''}
          ${!hasNAP && !isAtWar ? `<button class="action-btn" data-action="propose-nap" data-target="${empire.id}">Non-Aggression Pact</button>` : ''}
          ${!hasAlliance && !isAtWar ? `<button class="action-btn" data-action="propose-alliance" data-target="${empire.id}">Propose Alliance</button>` : ''}
          ${isAtWar ? `<button class="action-btn action-peace" data-action="propose-peace" data-target="${empire.id}">Offer Peace</button>` : ''}
          ${canDeclareWar ? `<button class="action-btn action-war" data-action="declare-war" data-target="${empire.id}">Declare War</button>` : ''}
        </div>
      </div>
    `;

    detailEl.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = (btn as HTMLElement).dataset['action'];
        const target = (btn as HTMLElement).dataset['target'];
        if (action && target) {
          this.handleAction(action, target);
        }
      });
    });
  }

  // ── Action handler ────────────────────────────────────────────────────────

  private handleAction(action: string, targetEmpireId: EmpireId): void {
    // Dispatch custom event for the app to handle with game state mutation
    const event = new CustomEvent('diplomacy-action', {
      bubbles: true,
      detail: { action, targetEmpireId },
    });
    this.container.dispatchEvent(event);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private statusLabel(state: string, value: number): string {
    if (value <= STATE_WAR_THRESHOLD) return 'AT WAR';
    switch (state) {
      case 'war': return 'AT WAR';
      case 'unfriendly': return 'UNFRIENDLY';
      case 'neutral': return 'NEUTRAL';
      case 'friendly': return 'FRIENDLY';
      case 'allied': return 'ALLIED';
      default: return 'UNKNOWN';
    }
  }

  private relationClass(state: string): string {
    switch (state) {
      case 'war': return 'rel-war';
      case 'unfriendly': return 'rel-unfriendly';
      case 'neutral': return 'rel-neutral';
      case 'friendly': return 'rel-friendly';
      case 'allied': return 'rel-allied';
      default: return 'rel-neutral';
    }
  }

  private treatyLabel(treaty: Treaty): string {
    const labels: Record<string, string> = {
      peace: 'Peace Treaty',
      non_aggression: 'Non-Aggression Pact',
      trade: 'Trade Agreement',
      research: 'Research Pact',
      military_alliance: 'Military Alliance',
      defensive_pact: 'Defensive Pact',
    };
    return labels[treaty.type] ?? treaty.type;
  }

  private militaryPowerLabel(empire: Empire, player: Empire, _state: GameState): string {
    const empireFleets = empire.fleets.length;
    const playerFleets = player.fleets.length;
    if (empireFleets > playerFleets * 1.5) return 'Overwhelming';
    if (empireFleets > playerFleets * 1.2) return 'Superior';
    if (empireFleets > playerFleets * 0.8) return 'Comparable';
    if (empireFleets > playerFleets * 0.5) return 'Inferior';
    return 'Weak';
  }

  private techComparison(empire: Empire, player: Empire): string {
    const diff = empire.research.completedTechs.length - player.research.completedTechs.length;
    if (diff > 2) return 'Far Ahead';
    if (diff > 0) return 'Slightly Ahead';
    if (diff === 0) return 'Comparable';
    if (diff > -3) return 'Slightly Behind';
    return 'Far Behind';
  }

  // ── Visibility ────────────────────────────────────────────────────────────

  show(): void {
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.classList.remove('active');
  }
}
