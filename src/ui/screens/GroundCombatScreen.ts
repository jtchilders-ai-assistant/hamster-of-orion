/**
 * Ground Combat Screen
 * src/ui/screens/GroundCombatScreen.ts
 *
 * Implements the ground combat UI per design/ui-ux/ground-combat-ui.md.
 *
 * Features:
 * - Invasion preparation: troop deployment slider
 * - Combat resolution: animated rounds with dice rolls and casualty displays
 * - Speed controls: Slow/Normal/Fast/Instant
 * - Result screens: Victory (colonize/enslave), Defeat (retreat/bombardment), Pyrrhic
 *
 * Design constraints:
 * - All DOM is allowed here (this is src/ui/)
 * - Uses simulateGroundCombat from src/game/systems/groundCombat.ts
 * - Dispatches NAVIGATE action to return to galaxy screen
 */

import { GameState, EmpireId, PlanetId } from '../../game/state';
import { Store } from '../../game/store';
import {
  simulateGroundCombat,
  GroundCombatResultUI,
  GroundCombatRoundUI,
} from '../../game/systems/groundCombat';

// ── Types ─────────────────────────────────────────────────────────────────────

type CombatSpeed = 'slow' | 'normal' | 'fast' | 'instant';
type ScreenPhase = 'planning' | 'resolving' | 'result';

interface CombatConfig {
  planetId: PlanetId;
  planetName: string;
  attackerId: EmpireId;
  attackerName: string;
  defenderId: EmpireId;
  defenderName: string;
  availableTroops: number;
  defenderTroops: number;
  attackerBonus: number;
  defenderBonus: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SPEED_DELAYS: Record<CombatSpeed, number> = {
  slow: 2000,
  normal: 1000,
  fast: 400,
  instant: 0,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function hpBarColor(ratio: number): string {
  if (ratio > 0.5) return '#00cc66';
  if (ratio > 0.25) return '#ffaa00';
  return '#ff4444';
}

// ── GroundCombatScreen ────────────────────────────────────────────────────────

export class GroundCombatScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  // Screen state
  private phase: ScreenPhase = 'planning';
  private config: CombatConfig | null = null;
  private invadingTroops = 0;
  private speed: CombatSpeed = 'normal';

  // Combat result state
  private combatResult: GroundCombatResultUI | null = null;
  private currentRoundIndex = 0;
  private animationTimer: number | null = null;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.buildLayout();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Screen interface
  // ═══════════════════════════════════════════════════════════════════════════

  render(_state: GameState): void {
    // Ground combat screen manages its own state; external renders refresh display
    this.renderContent();
  }

  show(): void {
    this.container.classList.add('active');
    this.container.style.display = '';
    this.renderContent();
  }

  hide(): void {
    this.stopAnimation();
    this.container.classList.remove('active');
    this.container.style.display = 'none';
  }

  /**
   * Initialize ground combat with the given configuration.
   * Call this before showing the screen.
   */
  initCombat(config: CombatConfig): void {
    this.config = config;
    this.invadingTroops = config.availableTroops;
    this.phase = 'planning';
    this.combatResult = null;
    this.currentRoundIndex = 0;
    this.stopAnimation();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Layout
  // ═══════════════════════════════════════════════════════════════════════════

  private buildLayout(): void {
    this.container.innerHTML = '';
    this.container.style.cssText = `
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: #000a1a;
      font-family: 'Courier New', Courier, monospace;
      color: #c0d8f0;
      overflow: hidden;
    `;
  }

  private renderContent(): void {
    this.container.innerHTML = '';

    switch (this.phase) {
      case 'planning':
        this.renderPlanningPhase();
        break;
      case 'resolving':
        this.renderResolvingPhase();
        break;
      case 'result':
        this.renderResultPhase();
        break;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Planning Phase (Invasion Preparation)
  // ═══════════════════════════════════════════════════════════════════════════

  private renderPlanningPhase(): void {
    if (!this.config) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 32px;
    `;

    // Title
    const title = document.createElement('h1');
    title.style.cssText = `
      font-size: 24px;
      color: #00aaff;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 8px;
    `;
    title.textContent = `INVASION READY: ${this.config.planetName}`;
    wrapper.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.style.cssText = `
      font-size: 14px;
      color: #607080;
      margin-bottom: 32px;
    `;
    subtitle.textContent = 'Planet defenses cleared. Ready to invade?';
    wrapper.appendChild(subtitle);

    // Troop info panel
    const infoPanel = document.createElement('div');
    infoPanel.style.cssText = `
      background: #0a1a2e;
      border: 1px solid #1a3a5c;
      padding: 24px;
      border-radius: 4px;
      width: 100%;
      max-width: 500px;
      margin-bottom: 24px;
    `;

    // Available troops
    const availableRow = document.createElement('div');
    availableRow.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 12px;';
    availableRow.innerHTML = `
      <span style="color: #00aaff;">Your Troops Available:</span>
      <span style="color: #00cc66; font-weight: bold;">${this.config.availableTroops}</span>
    `;
    infoPanel.appendChild(availableRow);

    // Estimated defenders
    const defenderRow = document.createElement('div');
    defenderRow.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 24px;';
    defenderRow.innerHTML = `
      <span style="color: #ff6666;">Estimated Defenders:</span>
      <span style="color: #ff6666; font-weight: bold;">~${this.config.defenderTroops}</span>
    `;
    infoPanel.appendChild(defenderRow);

    // Troop slider section
    const sliderSection = document.createElement('div');
    sliderSection.style.cssText = `
      border: 1px solid #1a3a5c;
      padding: 16px;
      border-radius: 4px;
      background: #050f1e;
    `;

    const sliderLabel = document.createElement('div');
    sliderLabel.style.cssText = 'color: #00aaff; margin-bottom: 12px; text-transform: uppercase; font-size: 12px;';
    sliderLabel.textContent = 'Troops to Deploy';
    sliderSection.appendChild(sliderLabel);

    // Slider row
    const sliderRow = document.createElement('div');
    sliderRow.style.cssText = 'display: flex; align-items: center; gap: 16px;';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '1';
    slider.max = String(this.config.availableTroops);
    slider.value = String(this.invadingTroops);
    slider.style.cssText = 'flex: 1; cursor: pointer;';

    const valueDisplay = document.createElement('span');
    valueDisplay.style.cssText = 'min-width: 40px; text-align: right; font-weight: bold; color: #00cc66;';
    valueDisplay.textContent = String(this.invadingTroops);

    slider.addEventListener('input', () => {
      this.invadingTroops = parseInt(slider.value, 10);
      valueDisplay.textContent = String(this.invadingTroops);
      remainingDisplay.textContent = String(this.config!.availableTroops - this.invadingTroops);
    });

    sliderRow.appendChild(slider);
    sliderRow.appendChild(valueDisplay);
    sliderSection.appendChild(sliderRow);

    // Remaining troops display
    const remainingRow = document.createElement('div');
    remainingRow.style.cssText = 'display: flex; justify-content: space-between; margin-top: 12px; color: #607080;';
    const remainingDisplay = document.createElement('span');
    remainingDisplay.textContent = String(this.config.availableTroops - this.invadingTroops);
    remainingRow.innerHTML = '<span>Remaining in reserve:</span>';
    remainingRow.appendChild(remainingDisplay);
    sliderSection.appendChild(remainingRow);

    infoPanel.appendChild(sliderSection);
    wrapper.appendChild(infoPanel);

    // Buttons
    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = 'display: flex; gap: 16px;';

    const launchBtn = this.makeButton('LAUNCH INVASION', '#1a3a1a', '#00cc66');
    launchBtn.addEventListener('click', () => this.launchInvasion());
    buttonRow.appendChild(launchBtn);

    const cancelBtn = this.makeButton('CANCEL', '#3a1a1a', '#ff6666');
    cancelBtn.addEventListener('click', () => this.returnToGalaxy());
    buttonRow.appendChild(cancelBtn);

    wrapper.appendChild(buttonRow);
    this.container.appendChild(wrapper);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Resolving Phase (Combat Animation)
  // ═══════════════════════════════════════════════════════════════════════════

  private renderResolvingPhase(): void {
    if (!this.config || !this.combatResult) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 24px;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      background: #0a1a2e;
      border-bottom: 2px solid #1a3a5c;
      padding: 12px 16px;
      text-align: center;
      margin-bottom: 24px;
    `;
    header.innerHTML = `
      <h1 style="color: #00aaff; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">
        GROUND COMBAT — ${this.config.planetName}
      </h1>
    `;
    wrapper.appendChild(header);

    // Main combat area
    const combatArea = document.createElement('div');
    combatArea.style.cssText = `
      display: flex;
      gap: 24px;
      flex: 1;
      min-height: 0;
    `;

    // Attacker panel
    const attackerPanel = this.buildCombatantPanel(
      'ATTACKERS (YOU)',
      this.config.attackerName,
      this.invadingTroops,
      this.getCurrentRound()?.attackerRemaining ?? this.invadingTroops,
      this.config.attackerBonus,
      '#00aaff'
    );
    combatArea.appendChild(attackerPanel);

    // Center info panel
    const centerPanel = this.buildCenterPanel();
    combatArea.appendChild(centerPanel);

    // Defender panel
    const defenderPanel = this.buildCombatantPanel(
      'DEFENDERS (ENEMY)',
      this.config.defenderName,
      this.config.defenderTroops,
      this.getCurrentRound()?.defenderRemaining ?? this.config.defenderTroops,
      this.config.defenderBonus,
      '#ff4444'
    );
    combatArea.appendChild(defenderPanel);

    wrapper.appendChild(combatArea);

    // Speed controls
    const speedControls = this.buildSpeedControls();
    wrapper.appendChild(speedControls);

    this.container.appendChild(wrapper);
  }

  private buildCombatantPanel(
    title: string,
    empireName: string,
    totalTroops: number,
    currentTroops: number,
    bonus: number,
    accentColor: string
  ): HTMLElement {
    const panel = document.createElement('div');
    panel.style.cssText = `
      flex: 1;
      background: #0a1a2e;
      border: 1px solid #1a3a5c;
      padding: 16px;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
    `;

    // Title
    const titleEl = document.createElement('div');
    titleEl.style.cssText = `
      color: ${accentColor};
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #1a3a5c;
    `;
    titleEl.textContent = title;
    panel.appendChild(titleEl);

    // Empire name
    const nameEl = document.createElement('div');
    nameEl.style.cssText = 'font-size: 16px; font-weight: bold; margin-bottom: 16px;';
    nameEl.textContent = empireName;
    panel.appendChild(nameEl);

    // Troops count
    const troopsEl = document.createElement('div');
    troopsEl.style.cssText = 'margin-bottom: 8px;';
    troopsEl.innerHTML = `
      <span style="color: #607080;">Troops:</span>
      <span style="font-weight: bold; margin-left: 8px;">${currentTroops}</span>
    `;
    panel.appendChild(troopsEl);

    // Bonus
    const bonusEl = document.createElement('div');
    bonusEl.style.cssText = 'margin-bottom: 16px;';
    bonusEl.innerHTML = `
      <span style="color: #607080;">Bonus:</span>
      <span style="color: #ffaa00; margin-left: 8px;">+${Math.round((bonus - 1) * 100)}%</span>
    `;
    panel.appendChild(bonusEl);

    // Troop bar
    const ratio = totalTroops > 0 ? currentTroops / totalTroops : 0;
    const barContainer = document.createElement('div');
    barContainer.style.cssText = `
      background: #050f1e;
      height: 20px;
      border-radius: 2px;
      overflow: hidden;
      position: relative;
    `;

    const bar = document.createElement('div');
    bar.style.cssText = `
      height: 100%;
      width: ${ratio * 100}%;
      background: ${hpBarColor(ratio)};
      transition: width 0.3s ease;
    `;
    barContainer.appendChild(bar);

    const barLabel = document.createElement('span');
    barLabel.style.cssText = `
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 11px;
      color: #fff;
    `;
    barLabel.textContent = `${currentTroops}/${totalTroops}`;
    barContainer.appendChild(barLabel);

    panel.appendChild(barContainer);

    return panel;
  }

  private buildCenterPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.style.cssText = `
      flex: 1.5;
      background: #050f1e;
      border: 1px solid #1a3a5c;
      padding: 16px;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    `;

    const round = this.getCurrentRound();
    const roundNum = round?.roundNumber ?? 1;

    // Round header
    const roundHeader = document.createElement('div');
    roundHeader.style.cssText = `
      text-align: center;
      padding: 12px;
      background: #0a1a2e;
      border-radius: 4px;
      margin-bottom: 16px;
    `;
    roundHeader.innerHTML = `
      <span style="color: #00aaff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
        ══════════ ROUND ${roundNum} ══════════
      </span>
    `;
    panel.appendChild(roundHeader);

    if (round) {
      // Dice rolls
      const rollsSection = document.createElement('div');
      rollsSection.style.cssText = 'margin-bottom: 16px;';

      // Attacker rolls
      const atkRolls = document.createElement('div');
      atkRolls.style.cssText = 'margin-bottom: 8px;';
      atkRolls.innerHTML = `
        <span style="color: #00aaff;">Attackers roll:</span>
        <span style="margin-left: 8px;">${round.attackerRolls.slice(0, 12).join(', ')}${round.attackerRolls.length > 12 ? '...' : ''}</span>
      `;
      rollsSection.appendChild(atkRolls);

      // Defender rolls
      const defRolls = document.createElement('div');
      defRolls.innerHTML = `
        <span style="color: #ff4444;">Defenders roll:</span>
        <span style="margin-left: 8px;">${round.defenderRolls.slice(0, 12).join(', ')}${round.defenderRolls.length > 12 ? '...' : ''}</span>
      `;
      rollsSection.appendChild(defRolls);

      panel.appendChild(rollsSection);

      // Divider
      const divider = document.createElement('hr');
      divider.style.cssText = 'border: none; border-top: 1px solid #1a3a5c; margin: 16px 0;';
      panel.appendChild(divider);

      // Casualties
      const casualties = document.createElement('div');
      casualties.innerHTML = `
        <div style="color: #ffaa00; font-size: 12px; text-transform: uppercase; margin-bottom: 12px;">
          Casualties this round:
        </div>
        <div style="margin-bottom: 8px;">
          • Attackers lost: <span style="color: #ff4444;">${round.casualties}</span> troops
          (<span style="color: #00cc66;">${round.attackerRemaining}</span> remaining)
        </div>
        <div>
          • Defenders lost: <span style="color: #ff4444;">${round.casualties}</span> troops
          (<span style="color: #00cc66;">${round.defenderRemaining}</span> remaining)
        </div>
      `;
      panel.appendChild(casualties);
    } else {
      // No round data yet
      const placeholder = document.createElement('div');
      placeholder.style.cssText = 'text-align: center; color: #607080; padding: 32px;';
      placeholder.textContent = 'Combat commencing...';
      panel.appendChild(placeholder);
    }

    // Continue button
    const continueBtn = this.makeButton('Continue ▶', '#005588', '#00aaff');
    continueBtn.style.cssText += 'margin-top: auto; align-self: center;';
    continueBtn.addEventListener('click', () => this.advanceRound());
    panel.appendChild(continueBtn);

    return panel;
  }

  private buildSpeedControls(): HTMLElement {
    const controls = document.createElement('div');
    controls.style.cssText = `
      background: #0a1a2e;
      border: 1px solid #1a3a5c;
      padding: 12px 16px;
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
    `;

    const label = document.createElement('span');
    label.style.cssText = 'color: #607080; font-size: 12px; text-transform: uppercase;';
    label.textContent = 'Combat Speed:';
    controls.appendChild(label);

    const speeds: CombatSpeed[] = ['slow', 'normal', 'fast', 'instant'];
    const speedLabels: Record<CombatSpeed, string> = {
      slow: 'Slow',
      normal: 'Normal',
      fast: 'Fast',
      instant: 'Instant',
    };

    for (const spd of speeds) {
      const btn = document.createElement('button');
      btn.textContent = speedLabels[spd];
      btn.style.cssText = `
        background: ${this.speed === spd ? '#00aaff' : '#1a3a5c'};
        border: 1px solid ${this.speed === spd ? '#00aaff' : '#2a4a6c'};
        color: #fff;
        padding: 6px 12px;
        cursor: pointer;
        font-family: inherit;
        font-size: 11px;
        text-transform: uppercase;
      `;
      btn.addEventListener('click', () => {
        this.speed = spd;
        this.renderContent();
      });
      controls.appendChild(btn);
    }

    return controls;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Result Phase
  // ═══════════════════════════════════════════════════════════════════════════

  private renderResultPhase(): void {
    if (!this.config || !this.combatResult) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 32px;
    `;

    const isVictory = this.combatResult.attackerWins;
    const isPyrrhic = isVictory && this.combatResult.totalAttackerLosses > this.invadingTroops * 0.7;

    // Title
    const title = document.createElement('h1');
    title.style.cssText = `
      font-size: 28px;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 16px;
      color: ${isVictory ? '#00cc66' : '#ff4444'};
    `;
    title.textContent = isVictory
      ? (isPyrrhic ? '⚠️ COSTLY VICTORY' : '🌍 PLANET CAPTURED!')
      : '❌ INVASION REPELLED!';
    wrapper.appendChild(title);

    // Description
    const desc = document.createElement('p');
    desc.style.cssText = 'color: #c0d8f0; margin-bottom: 32px; text-align: center;';
    desc.textContent = isVictory
      ? `${this.config.planetName} is now yours!`
      : `Your troops were defeated at ${this.config.planetName}.`;
    wrapper.appendChild(desc);

    // Casualties panel
    const casualtiesPanel = document.createElement('div');
    casualtiesPanel.style.cssText = `
      background: #0a1a2e;
      border: 1px solid #1a3a5c;
      padding: 24px;
      border-radius: 4px;
      width: 100%;
      max-width: 400px;
      margin-bottom: 32px;
    `;

    const survivingPop = isVictory ? Math.floor(this.config.defenderTroops * 0.1) : 0;
    const factoriesIntact = isVictory ? Math.floor(this.config.defenderTroops * 0.3) : 0;

    casualtiesPanel.innerHTML = `
      <div style="color: #ffaa00; font-size: 12px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid #1a3a5c; padding-bottom: 8px;">
        Final Casualties
      </div>
      <div style="margin-bottom: 8px;">
        • Your losses: <span style="color: #ff4444; font-weight: bold;">${this.combatResult.totalAttackerLosses}</span> troops
      </div>
      <div style="margin-bottom: 16px;">
        • Enemy losses: <span style="color: #ff4444; font-weight: bold;">${this.combatResult.totalDefenderLosses}</span> troops
        ${isVictory ? '(all defenders eliminated)' : `(${this.combatResult.defenderRemaining} remain)`}
      </div>
      ${isVictory ? `
      <div style="color: #00cc66; font-size: 12px; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid #1a3a5c; padding-bottom: 8px;">
        Planetary Status
      </div>
      <div style="margin-bottom: 8px;">
        • Surviving Population: <span style="color: #00cc66; font-weight: bold;">${survivingPop}</span>
      </div>
      <div style="margin-bottom: 8px;">
        • Factories Intact: <span style="color: #00cc66; font-weight: bold;">${factoriesIntact}</span>
      </div>
      <div>
        • Missile Bases: <span style="color: #ffaa00; font-weight: bold;">Cleared</span>
      </div>
      ` : ''}
    `;
    wrapper.appendChild(casualtiesPanel);

    // Buttons
    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = 'display: flex; gap: 16px;';

    if (isVictory) {
      // Victory buttons: Colonize / Enslave
      const colonizeBtn = this.makeButton('COLONIZE', '#1a3a1a', '#00cc66');
      colonizeBtn.addEventListener('click', () => this.doColonize());
      buttonRow.appendChild(colonizeBtn);

      // Enslave option (could be disabled based on race traits)
      const enslaveBtn = this.makeButton('ENSLAVE', '#3a3a1a', '#ffaa00');
      enslaveBtn.addEventListener('click', () => this.doEnslave());
      buttonRow.appendChild(enslaveBtn);
    } else {
      // Defeat buttons: Return to Bombardment / Retreat
      const bombardBtn = this.makeButton('RETURN TO BOMBARDMENT', '#1a3a3a', '#00aaff');
      bombardBtn.addEventListener('click', () => this.returnToBombardment());
      buttonRow.appendChild(bombardBtn);

      const retreatBtn = this.makeButton('RETREAT FLEET', '#3a1a1a', '#ff6666');
      retreatBtn.addEventListener('click', () => this.retreatFleet());
      buttonRow.appendChild(retreatBtn);
    }

    wrapper.appendChild(buttonRow);
    this.container.appendChild(wrapper);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Actions
  // ═══════════════════════════════════════════════════════════════════════════

  private launchInvasion(): void {
    if (!this.config) return;

    // Simulate combat
    this.combatResult = simulateGroundCombat(
      this.config.attackerName,
      this.config.defenderName,
      this.config.planetName,
      this.invadingTroops,
      this.config.defenderTroops,
      this.config.attackerBonus,
      this.config.defenderBonus
    );

    this.currentRoundIndex = 0;
    this.phase = 'resolving';
    this.renderContent();

    // Start auto-advance if not instant
    if (this.speed !== 'instant') {
      this.startAnimation();
    } else {
      // Jump to result
      this.currentRoundIndex = this.combatResult.rounds.length - 1;
      this.phase = 'result';
      this.renderContent();
    }
  }

  private advanceRound(): void {
    if (!this.combatResult) return;

    this.currentRoundIndex++;

    if (this.currentRoundIndex >= this.combatResult.rounds.length) {
      // Combat finished
      this.phase = 'result';
      this.stopAnimation();
    }

    this.renderContent();
  }

  private startAnimation(): void {
    this.stopAnimation();

    const delay = SPEED_DELAYS[this.speed];
    if (delay <= 0) return;

    this.animationTimer = window.setInterval(() => {
      this.advanceRound();
    }, delay);
  }

  private stopAnimation(): void {
    if (this.animationTimer !== null) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
  }

  private getCurrentRound(): GroundCombatRoundUI | null {
    if (!this.combatResult || this.currentRoundIndex >= this.combatResult.rounds.length) {
      return null;
    }
    return this.combatResult.rounds[this.currentRoundIndex];
  }

  private doColonize(): void {
    // Dispatch colonize action and navigate to planet
    if (this.config) {
      this.store.dispatch({
        type: 'CAPTURE_PLANET',
        payload: { planetId: this.config.planetId, mode: 'colonize' },
      });
    }
    this.returnToGalaxy();
  }

  private doEnslave(): void {
    // Dispatch enslave action and navigate to planet
    if (this.config) {
      this.store.dispatch({
        type: 'CAPTURE_PLANET',
        payload: { planetId: this.config.planetId, mode: 'enslave' },
      });
    }
    this.returnToGalaxy();
  }

  private returnToBombardment(): void {
    // Return to bombardment screen (tactical combat)
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'combat' } });
  }

  private retreatFleet(): void {
    // Retreat and return to galaxy
    this.returnToGalaxy();
  }

  private returnToGalaxy(): void {
    this.stopAnimation();
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════════════════════════════════════

  private makeButton(label: string, bg: string, border: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `
      background: ${bg};
      border: 1px solid ${border};
      color: #fff;
      padding: 10px 20px;
      cursor: pointer;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: background 0.15s;
    `;
    btn.addEventListener('mouseover', () => { btn.style.background = border; });
    btn.addEventListener('mouseout', () => { btn.style.background = bg; });
    return btn;
  }
}
