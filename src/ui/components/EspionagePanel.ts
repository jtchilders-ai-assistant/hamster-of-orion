/**
 * Espionage panel — spy allocation and mission controls.
 * src/ui/components/EspionagePanel.ts
 *
 * Integrates with DiplomacyScreen. Shown when viewing an empire's diplomatic
 * details and the player has chosen the espionage tab.
 *
 * Renders:
 *  1. Spy count per target empire (active missions)
 *  2. Slider to allocate spies (0-100% of total available)
 *  3. Mission type selector
 *  4. Success probability based on spy count vs target security
 *  5. Results display when mission completes
 *  6. Counter-espionage events (caught spies)
 */

import {
  GameState,
  Empire,
  EmpireId,
  MissionType,
  SpyMission,
} from '../../game/state';

// ── Mission definitions (from design/diplomacy/espionage.md §5) ─────────────

interface MissionDef {
  type: MissionType;
  label: string;
  baseSuccess: number;
  cost: number;
  riskLevel: string;
  deathRisk: number;
  relationPenalty: number;
}

const MISSION_DEFS: Record<MissionType, MissionDef> = {
  sabotage: {
    type: 'sabotage',
    label: 'Sabotage Factories',
    baseSuccess: 40,
    cost: 100,
    riskLevel: 'Medium',
    deathRisk: 20,
    relationPenalty: -30,
  },
  theft: {
    type: 'theft',
    label: 'Steal Technology',
    baseSuccess: 30,
    cost: 100,
    riskLevel: 'Medium',
    deathRisk: 15,
    relationPenalty: -20,
  },
  propaganda: {
    type: 'propaganda',
    label: 'Incite Rebellion',
    baseSuccess: 25,
    cost: 200,
    riskLevel: 'High',
    deathRisk: 30,
    relationPenalty: -50,
  },
  infiltration: {
    type: 'infiltration',
    label: 'Intelligence Gathering',
    baseSuccess: 80,
    cost: 0,
    riskLevel: 'Very Low',
    deathRisk: 5,
    relationPenalty: -10,
  },
  assassination: {
    type: 'assassination',
    label: 'Assassination',
    baseSuccess: 10,
    cost: 300,
    riskLevel: 'Extreme',
    deathRisk: 50,
    relationPenalty: -100,
  },
  intelligence_gathering: {
    type: 'intelligence_gathering',
    label: 'Reconnaissance',
    baseSuccess: 80,
    cost: 0,
    riskLevel: 'Very Low',
    deathRisk: 5,
    relationPenalty: -10,
  },
};

// ── Risk level color map ─────────────────────────────────────────────────────

const RISK_COLORS: Record<string, string> = {
  'Very Low': '#66cc66',
  Medium: '#ffaa33',
  'Medium-High': '#ff8833',
  High: '#ff5533',
  'Very High': '#ff3333',
  Extreme: '#cc0000',
};

// ── Success probability color ────────────────────────────────────────────────

function successColor(pct: number): string {
  if (pct >= 70) return '#66cc66';
  if (pct >= 40) return '#ffcc33';
  if (pct >= 20) return '#ff9933';
  return '#ff5533';
}

/**
 * Compute a simplified spy effectiveness score for UI display.
 * Simplified from design/diplomacy/espionage.md §1.2.
 */
function computeSuccessProbability(
  totalSpiesInTarget: number,
  totalSpiesDeployed: number,
  targetComputerTech: number,
  attackerComputerTech: number,
): number {
  // Proportional spy presence (diminishing returns above 50%)
  const presenceFactor = Math.min(1, totalSpiesInTarget / Math.max(1, totalSpiesDeployed)) * 100;

  // Tech advantage bonus (each tech level = 2% modifier, capped ±20)
  const techAdvantage = Math.max(
    -20,
    Math.min(20, (attackerComputerTech - targetComputerTech) * 2),
  );

  // Simple base calculation (UI only, not game-logic accurate)
  const raw = 30 + presenceFactor + techAdvantage;

  // Clamp 5-95 per design spec §5.2
  return Math.max(5, Math.min(95, Math.round(raw)));
}

// ── Component state (local slider / selection) ───────────────────────────────

interface PanelState {
  allocatedPct: number;
  selectedMission: MissionType;
  targetEmpireId: EmpireId | null;
}

/**
 * Custom event dispatched when the player submits a spy mission.
 * DiplomacyScreen listens for this to handle the mission.
 */
export class SpyMissionEvent extends CustomEvent<{
  targetEmpireId: EmpireId;
  missionType: MissionType;
  allocatedPct: number;
}> {
  constructor(targetEmpireId: EmpireId, missionType: MissionType, allocatedPct: number) {
    super('spy-mission-submit', {
      bubbles: true,
      detail: { targetEmpireId, missionType, allocatedPct },
    });
  }
}

// ── EspionagePanel ───────────────────────────────────────────────────────────

export class EspionagePanel {
  private readonly container: HTMLElement;
  private panelState: PanelState = {
    allocatedPct: 50,
    selectedMission: 'sabotage',
    targetEmpireId: null,
  };
  private _lastState: GameState | null = null;

  constructor(container: HTMLElement) {
    const existing = container.querySelector<HTMLElement>('#espionage-panel');
    if (existing) {
      this.container = existing;
    } else {
      this.container = document.createElement('div');
      this.container.id = 'espionage-panel';
      this.container.className = 'panel espionage-panel';
      this.container.style.display = 'none';
      container.appendChild(this.container);
    }
  }

  /**
   * Show or hide the panel.
   */
  setVisible(visible: boolean): void {
    this.container.style.display = visible ? '' : 'none';
  }

  /**
   * Render the panel for a given target empire.
   */
  render(state: GameState, targetEmpireId: EmpireId): void {
    const playerEmpire = state.empires.byId[state.empires.playerId];
    const targetEmpire = state.empires.byId[targetEmpireId];
    if (!playerEmpire || !targetEmpire) return;

    // Track selected target and snapshot state for handlers
    this.panelState.targetEmpireId = targetEmpireId;
    this._lastState = state;

    // Count spy missions as "spies deployed" (each active mission = one spy)
    const activeMissions = state.spyMissions.filter(
      (m) => m.senderId === state.empires.playerId && m.targetId === targetEmpireId && m.status === 'active',
    );
    const deployedCount = activeMissions.length;
    const totalAvailable = Math.max(0, 25 - deployedCount); // cap at 25 total spies
    const allocatedCount = Math.max(
      0,
      Math.min(totalAvailable, Math.round((this.panelState.allocatedPct / 100) * totalAvailable)),
    );

    // Filter missions for history
    const completedMissions = state.spyMissions.filter(
      (m) =>
        (m.senderId === state.empires.playerId || m.targetId === state.empires.playerId) &&
        (m.targetId === targetEmpireId || m.senderId === targetEmpireId) &&
        m.status === 'completed',
    );
    const foiledMissions = state.spyMissions.filter(
      (m) =>
        (m.senderId === state.empires.playerId || m.targetId === state.empires.playerId) &&
        (m.targetId === targetEmpireId || m.senderId === targetEmpireId) &&
        m.status === 'foiled',
    );

    // Success probability (simplified)
    const successPct = computeSuccessProbability(
      deployedCount + allocatedCount,
      countActiveSpies(state, state.empires.playerId),
      targetEmpire.computerTechLevel,
      playerEmpire.computerTechLevel,
    );

    const missionDef = MISSION_DEFS[this.panelState.selectedMission];

    this.container.innerHTML = this.buildHTML({
      playerEmpire,
      targetEmpire,
      totalAvailable,
      deployedCount,
      allocatedCount,
      allocatedPct: this.panelState.allocatedPct,
      successPct,
      missionDef,
      activeMissions,
      completedMissions,
      foiledMissions,
      counterEspionageHtml: this.renderCounterEspionage(state, playerEmpire, targetEmpire),
    });

    this.bindHandlers(playerEmpire, totalAvailable);
  }

  // ── HTML builder ─────────────────────────────────────────────────────────

  private buildHTML(ctx: {
    playerEmpire: Empire;
    targetEmpire: Empire;
    totalAvailable: number;
    deployedCount: number;
    allocatedCount: number;
    allocatedPct: number;
    successPct: number;
    missionDef: MissionDef;
    activeMissions: SpyMission[];
    completedMissions: SpyMission[];
    foiledMissions: SpyMission[];
    counterEspionageHtml: string;
  }): string {
    const {
      playerEmpire, targetEmpire, totalAvailable, deployedCount,
      allocatedCount, allocatedPct, successPct, missionDef,
    } = ctx;
    const riskColor = RISK_COLORS[missionDef.riskLevel] ?? '#ffffff';

    return `
      <div class="espionage-header">
        <h2>ESPIONAGE — <span class="target-name" data-target-id="${targetEmpire.id}">${targetEmpire.name}</span></h2>
        <div class="espionage-divider"></div>
      </div>

      <div class="espionage-section">
        <h3>SPY NETWORK</h3>
        <div class="spy-stats">
          <div class="spy-stat-row">
            <span class="stat-label">Deployed to ${targetEmpire.name}</span>
            <span class="stat-value">${deployedCount}</span>
          </div>
          <div class="spy-stat-row">
            <span class="stat-label">Available for deployment</span>
            <span class="stat-value">${totalAvailable}</span>
          </div>
        </div>
      </div>

      <div class="espionage-section">
        <h3>ALLOCATE SPY ASSETS</h3>
        <div class="slider-row">
          <input type="range" id="espionage-slider"
            min="0" max="100" value="${allocatedPct}"
            data-testid="spy-allocation-slider" />
          <span id="espionage-slider-label" data-testid="spy-allocation-label">
            ${allocatedPct}% — ${allocatedCount} spies
          </span>
        </div>
      </div>

      <div class="espionage-section">
        <h3>MISSION TYPE</h3>
        <div class="mission-select-grid" data-testid="mission-selector">
          ${Object.values(MISSION_DEFS).map((def) => {
            const isSelected = def.type === this.panelState.selectedMission;
            const disabled = def.cost > playerEmpire.credits
              ? ' opacity-50 pointer-events-none'
              : '';
            const selectedAttr = isSelected ? ' aria-selected="true"' : '';
            const riskC = RISK_COLORS[def.riskLevel] ?? '#ffffff';
            return `
              <button class="mission-btn${disabled}"
                data-mission-type="${def.type}"
                data-cost="${def.cost}"
                data-testid="mission-${def.type}"
                ${selectedAttr}
              >
                <div class="mission-btn-name">${def.label}</div>
                <div class="mission-btn-cost">${def.cost > 0 ? def.cost + ' BC' : 'Free'}</div>
                <div class="mission-btn-risk" style="color:${riskC}">${def.riskLevel}</div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div class="espionage-section">
        <h3>PROBABILITY & COST</h3>
        <div class="probability-display">
          <div class="prob-bar-container">
            <div class="prob-bar-fill"
              style="width:${successPct}%; background-color:${successColor(successPct)};">
            </div>
          </div>
          <div class="prob-value" data-testid="success-probability"
            style="color:${successColor(successPct)};">
            ${successPct}% success chance
          </div>
        </div>
        <div class="mission-details">
          <div class="detail-row"><span>Base success rate:</span> <span>${missionDef.baseSuccess}%</span></div>
          <div class="detail-row"><span>Mission cost:</span> <span>${missionDef.cost > 0 ? missionDef.cost + ' BC' : 'Free'}</span></div>
          <div class="detail-row"><span>Death risk:</span> <span style="color:${riskColor}">${missionDef.deathRisk}%</span></div>
          <div class="detail-row"><span>Relation penalty (if caught):</span> <span style="color:#ff5533">${missionDef.relationPenalty}</span></div>
        </div>
        ${allocatedCount > 0
          ? `<button class="btn btn-primary espionage-action-btn" id="espionage-launch-btn"
                data-testid="launch-spy-mission"
                ${playerEmpire.credits < missionDef.cost ? ' disabled' : ''}>
                LAUNCH MISSION
             </button>`
          : '<div class="espionage-note">Allocate at least 1 spy to launch a mission</div>'}
      </div>

      <div class="espionage-section">
        <h3>ACTIVE MISSIONS</h3>
        ${ctx.activeMissions.length > 0
          ? ctx.activeMissions.map((m) => `
              <div class="mission-card active-mission">
                <div class="mission-card-header">
                  <span>${this.missionLabel(m.type)}</span>
                  <span class="mission-status active" data-testid="mission-active">ACTIVE</span>
                </div>
                <div class="mission-card-body">
                  <div>Turns remaining: <strong>${m.durationTurns}</strong></div>
                  <div>Success chance: <strong>${Math.round(m.successProbability * 100)}%</strong></div>
                </div>
              </div>
            `).join('')
          : '<div class="espionage-note">No active missions against this target</div>'}
      </div>

      <div class="espionage-section">
        <h3>MISSION HISTORY</h3>
        ${ctx.completedMissions.length + ctx.foiledMissions.length > 0
          ? [
              ...ctx.completedMissions.map((m) => this.renderHistoryCard(m, true)),
              ...ctx.foiledMissions.map((m) => this.renderHistoryCard(m, false)),
            ].join('')
          : '<div class="espionage-note">No completed missions yet</div>'}
      </div>

      <div class="espionage-section">
        <h3>COUNTER-ESPIONAGE EVENTS</h3>
        ${ctx.counterEspionageHtml}
      </div>
    `;
  }

  private renderHistoryCard(mission: SpyMission, success: boolean): string {
    const statusText = success ? 'SUCCESS' : 'FOILED';
    const statusClass = success ? 'status-success' : 'status-failed';
    return `
      <div class="mission-card ${success ? 'completed' : 'foiled'}">
        <div class="mission-card-header">
          <span>${this.missionLabel(mission.type)}</span>
          <span class="mission-status ${statusClass}" data-testid="${success ? 'mission-completed' : 'mission-foiled'}">${statusText}</span>
        </div>
        <div class="mission-card-body">
          <div>Turn completed: <strong>${mission.startTurn}</strong></div>
          ${mission.reward ? `<div>Reward: <strong>${mission.reward.type}</strong> (${mission.reward.value})</div>` : ''}
        </div>
      </div>
    `;
  }

  private renderCounterEspionage(
    state: GameState,
    playerEmpire: Empire,
    targetEmpire: Empire,
  ): string {
    const events: string[] = [];

    // Foiled missions = counter-espionage events
    const caughtMissions = state.spyMissions.filter(
      (m) =>
        (m.targetId === playerEmpire.id || m.senderId === playerEmpire.id) &&
        m.status === 'foiled',
    );

    if (caughtMissions.length > 0) {
      events.push(
        `<div class="counter-event">
          <div class="counter-event-title">Caught Spies: ${caughtMissions.length} mission(s) foiled</div>
          <div class="counter-event-desc">
            Your spies were detected during operations against ${targetEmpire.name}.
          </div>
        </div>`,
      );
    }

    // Show detection risk estimate
    const detectionChance = Math.min(
      99,
      Math.max(5, 10 + (targetEmpire.computerTechLevel > playerEmpire.computerTechLevel
        ? Math.floor(targetEmpire.computerTechLevel * 0.5)
        : 0)),
    );

    events.push(
      `<div class="counter-event">
        <div class="counter-event-title">Detection Risk</div>
        <div class="counter-event-desc">
          ${targetEmpire.name} detection chance estimate: <strong>${detectionChance}%</strong>
        </div>
      </div>`,
    );

    // Cumulative hostility
    const playerRelations = playerEmpire.relations[targetEmpire.id];
    if (playerRelations) {
      const hostility = playerRelations.events.reduce(
        (sum, e) => sum + Math.abs(e.impact), 0,
      );
      if (hostility > 0) {
        events.push(
          `<div class="counter-event">
            <div class="counter-event-title">Cumulative Hostility</div>
            <div class="counter-event-desc">
              Hostility score vs ${targetEmpire.name}: <strong>${hostility}</strong>
              ${hostility > 100 ? ' — WAR IMMINENT' : ''}
            </div>
          </div>`,
        );
      }
    }

    if (events.length === 0) {
      return '<div class="espionage-note">No counter-espionage events</div>';
    }
    return events.join('');
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  private bindHandlers(playerEmpire: Empire, totalAvailable: number): void {
    // Slider handler
    const slider = this.container.querySelector<HTMLInputElement>('#espionage-slider');
    if (slider) {
      slider.addEventListener('input', () => {
        this.panelState.allocatedPct = parseInt(slider.value, 10);
        const allocatedCount = Math.max(
          0,
          Math.min(totalAvailable, Math.round((this.panelState.allocatedPct / 100) * totalAvailable)),
        );
        const label = this.container.querySelector<HTMLElement>('#espionage-slider-label');
        if (label) {
          label.textContent = `${this.panelState.allocatedPct}% — ${allocatedCount} spies`;
        }
        // Re-render to update probability and button state
        if (this.panelState.targetEmpireId && this._lastState) {
          this.render(this._lastState, this.panelState.targetEmpireId);
        }
      });
    }

    // Mission type selection
    this.container.querySelectorAll<HTMLElement>('[data-mission-type]').forEach((btn) => {
      const type = btn.dataset.missionType as MissionType;
      if (!type || !(type in MISSION_DEFS)) return;

      btn.addEventListener('click', () => {
        this.panelState.selectedMission = type;
        if (this.panelState.targetEmpireId && this._lastState) {
          this.render(this._lastState, this.panelState.targetEmpireId);
        }
      });
    });

    // Launch mission button
    const launchBtn = this.container.querySelector<HTMLButtonElement>('#espionage-launch-btn');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        const allocatedCount = Math.max(
          0,
          Math.min(totalAvailable, Math.round((this.panelState.allocatedPct / 100) * totalAvailable)),
        );
        if (allocatedCount <= 0) return;

        const targetEmpireId = this.panelState.targetEmpireId;
        if (!targetEmpireId) return;

        const missionDef = MISSION_DEFS[this.panelState.selectedMission];
        if (playerEmpire.credits < missionDef.cost) return;

        // Dispatch custom event for DiplomacyScreen to handle
        this.container.dispatchEvent(new SpyMissionEvent(
          targetEmpireId,
          this.panelState.selectedMission,
          this.panelState.allocatedPct,
        ));
      });
    }
  }

  /**
   * Dispatch spy-mission-submit from outside (e.g. keyboard shortcut).
   */
  dispatchMission(targetEmpireId: EmpireId, missionType: MissionType): void {
    this.container.dispatchEvent(new SpyMissionEvent(
      targetEmpireId,
      missionType,
      this.panelState.allocatedPct,
    ));
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private missionLabel(type: MissionType): string {
    return MISSION_DEFS[type]?.label ?? type;
  }
}

/**
 * Count total active spy missions for a given empire (across all targets).
 */
/**
 * Count total active spy missions for a given empire (across all targets).
 */
function countActiveSpies(state: GameState, empireId: EmpireId): number {
  return state.spyMissions.filter(
    (m) => m.senderId === empireId && m.status === 'active',
  ).length;
}
