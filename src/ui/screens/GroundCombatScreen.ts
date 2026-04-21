/**
 * Ground Combat Screen — non-interactive planetary invasion resolution.
 * src/ui/screens/GroundCombatScreen.ts
 *
 * Shows attacker troops vs. defender population, animates round-by-round
 * casualty rolls, then presents a result overlay (PLANET CAPTURED or
 * INVASION REPELLED) with a continue button that returns to the galaxy map.
 *
 * Design reference : design/ui-ux/ground-combat-ui.md
 * Combat odds      : calculateGroundCombatOdds() from groundCombat.ts
 *
 * This screen is non-interactive: combat runs automatically.  The player only
 * clicks Continue when the result overlay appears.
 *
 * Integration
 * ───────────
 * • Navigate here by dispatching  { type: 'NAVIGATE', payload: { screen: 'ground_combat' } }
 *   from any context that wants to trigger a ground combat.
 * • Supply combat parameters via  show(params: GroundCombatParams).
 *   (App.ts calls show() on every navigation to this screen; callers must
 *   populate the params before navigating.)
 * • When the player clicks Continue the screen dispatches:
 *     GROUNDCOMBAT_RESULT  { attackerId, defenderId, planetId }
 *   which executes the full state mutation via executeGroundCombat(), then
 *   navigates back to 'galaxy'.
 *
 * Layout (matches ground-combat-ui.md §2)
 * ────────────────────────────────────────
 *   ┌─ Header ─────────────────────────────────────────┐
 *   │ GROUND COMBAT — <Planet Name>                    │
 *   ├─ Panels ─────────────────────────────────────────┤
 *   │ [ATTACKERS]          │          [DEFENDERS]       │
 *   │  portrait, troops,   │  portrait, pop, bonuses   │
 *   │  bonuses, bar        │  bar                      │
 *   ├─ Round display ──────────────────────────────────┤
 *   │  ══ ROUND N ══  Attackers: −X  Defenders: −Y    │
 *   ├─ Combat Log ─────────────────────────────────────┤
 *   │  scrollable per-round summaries                  │
 *   └──────────────────────────────────────────────────┘
 *   [Result overlay on combat end]
 */

import { GameState } from '../../game/state';
import { Store } from '../../game/store';
import { calculateGroundCombatOdds } from '../../game/systems/groundCombat';

// ── Public parameter type ──────────────────────────────────────────────────────

/** Caller supplies these before navigating to 'ground_combat'. */
export interface GroundCombatParams {
  /** EmpireId of the invading player (used in GROUNDCOMBAT_RESULT dispatch). */
  attackerId: string;
  /** EmpireId of the defending player. */
  defenderId: string;
  /** PlanetId being invaded. */
  planetId: string;

  // Display info (derived from state by the caller)
  planetName: string;
  attackerRaceName: string;
  defenderRaceName: string;

  /** Number of troops the attacker is landing. */
  attackerTroops: number;
  /** Attacker ground-combat strength factor (from applyGroundCombatBonus). */
  attackerStrength: number;
  /** Flat percentage bonus to display (e.g. tech bonus, 0–100). */
  attackerTechBonusPct: number;
  /** Racial ground combat bonus in percent (positive = bonus). */
  attackerRaceBonusPct: number;

  /** Effective defender troop count (10% of planet population). */
  defenderTroops: number;
  /** Defender ground-combat strength factor (from applyGroundCombatBonus × groundDefense). */
  defenderStrength: number;
  /** Planetary fortification bonus to display (0–100). */
  defenderFortBonusPct: number;
  /** Racial ground combat bonus for defender (percent). */
  defenderRaceBonusPct: number;

  /** Pre-computed bombardment bonus (0–50 typically). */
  bombardmentBonus: number;
}

// ── Internal simulation types ──────────────────────────────────────────────────

interface CombatRound {
  roundNum: number;
  attackerCasualties: number;
  defenderCasualties: number;
  attackerRemaining: number;
  defenderRemaining: number;
}

type CombatOutcome = 'attacker_wins' | 'defender_wins';

interface SimResult {
  rounds: CombatRound[];
  outcome: CombatOutcome;
  totalAttackerCasualties: number;
  totalDefenderCasualties: number;
}

// ── Helper: run a fast ground-combat simulation ───────────────────────────────

/**
 * Simulate ground combat round-by-round.
 *
 * Each round both sides roll 1d10 per effective troop.  A roll > threshold is
 * a kill on the enemy.  The threshold is derived from the MOO1 combat-odds
 * formula so the aggregate result converges to the calculated attackerChance.
 *
 * This is a pure function so it can be called during show() before any DOM
 * is updated.
 */
function simulateCombat(params: GroundCombatParams): SimResult {
  const { attackerChance } = calculateGroundCombatOdds(
    params.attackerStrength,
    params.defenderStrength,
    1, // defenderDefenseFactor already baked into defenderStrength
    1, // attackerAttackFactor already baked into attackerStrength
    params.bombardmentBonus,
  );

  // Per-troop kill probability each round
  // attackerChance is the overall win chance; per-round we want each
  // attacker troop to have a p_a kill chance and each defender a p_d.
  // We use: p_a = attackerChance * 0.4, p_d = (1 - attackerChance) * 0.4
  // (0.4 throttle keeps rounds from ending in 1–2 turns for equal forces)
  const p_a = Math.max(0.05, Math.min(0.6, attackerChance * 0.45));
  const p_d = Math.max(0.05, Math.min(0.6, (1 - attackerChance) * 0.45));

  let atk = params.attackerTroops;
  let def = params.defenderTroops;

  const rounds: CombatRound[] = [];
  const MAX_ROUNDS = 20;

  for (let r = 1; r <= MAX_ROUNDS; r++) {
    if (atk <= 0 || def <= 0) break;

    // Each attacker troop has p_a chance to kill a defender this round
    let defKills = 0;
    for (let i = 0; i < atk; i++) {
      if (Math.random() < p_a) defKills++;
    }

    // Each defender troop has p_d chance to kill an attacker
    let atkKills = 0;
    for (let i = 0; i < def; i++) {
      if (Math.random() < p_d) atkKills++;
    }

    // Apply — both sides lose simultaneously
    defKills = Math.min(defKills, def);
    atkKills = Math.min(atkKills, atk);
    atk = Math.max(0, atk - atkKills);
    def = Math.max(0, def - defKills);

    rounds.push({
      roundNum: r,
      attackerCasualties: atkKills,
      defenderCasualties: defKills,
      attackerRemaining: atk,
      defenderRemaining: def,
    });

    if (atk <= 0 || def <= 0) break;
  }

  // Resolve any stalemate by using the overall odds
  let outcome: CombatOutcome;
  if (atk > 0 && def <= 0) {
    outcome = 'attacker_wins';
  } else if (def > 0 && atk <= 0) {
    outcome = 'defender_wins';
  } else {
    // Still ongoing after MAX_ROUNDS — use odds to decide
    outcome = Math.random() < attackerChance ? 'attacker_wins' : 'defender_wins';
  }

  const totalAttackerCasualties = params.attackerTroops - atk;
  const totalDefenderCasualties = params.defenderTroops - def;

  return { rounds, outcome, totalAttackerCasualties, totalDefenderCasualties };
}

// ── GroundCombatScreen ─────────────────────────────────────────────────────────

export class GroundCombatScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  // Current combat parameters (set by show())
  private params: GroundCombatParams | null = null;
  private simResult: SimResult | null = null;

  // Animation state
  private roundIndex = -1;
  private animTimerId: ReturnType<typeof setTimeout> | null = null;

  // DOM refs (created once in buildLayout, reused across show() calls)
  private headerEl!: HTMLElement;
  private atkTitleEl!: HTMLElement;
  private atkRaceEl!: HTMLElement;
  private atkTroopsEl!: HTMLElement;
  private atkBonusesEl!: HTMLElement;
  private atkBarFill!: HTMLElement;
  private atkBarLabel!: HTMLElement;
  private defTitleEl!: HTMLElement;
  private defRaceEl!: HTMLElement;
  private defTroopsEl!: HTMLElement;
  private defBonusesEl!: HTMLElement;
  private defBarFill!: HTMLElement;
  private defBarLabel!: HTMLElement;
  private roundBannerEl!: HTMLElement;
  private logEl!: HTMLElement;
  private resultOverlayEl!: HTMLElement;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.buildLayout();
  }

  // ── Screen interface ─────────────────────────────────────────────────────────

  /** Called by App.ts on every render tick — no-op since we drive ourselves. */
  render(_state: GameState): void { /* self-driven */ }

  /**
   * Show the screen with the given combat parameters.
   * App.ts calls show() after dispatching NAVIGATE; callers must set params first.
   * If called without params (no pending combat), falls back to a demo scenario.
   */
  show(params?: GroundCombatParams): void {
    this.container.style.display = '';
    this.container.classList.add('active');

    this.params = params ?? this.buildDemoParams();
    this.simResult = simulateCombat(this.params);

    this.resetDisplay();
    this.startAnimation();
  }

  hide(): void {
    this.stopAnimation();
    this.container.style.display = 'none';
    this.container.classList.remove('active');
  }

  // ── Layout (built once) ──────────────────────────────────────────────────────

  private buildLayout(): void {
    this.container.innerHTML = '';
    this.container.style.cssText = `
      display: none;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: #000a1a;
      font-family: 'Courier New', Courier, monospace;
      color: #c0d8f0;
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
    `;

    // ── Header ───────────────────────────────────────────────────────────────
    this.headerEl = this.el('div', {
      cssText: `
        background: #0a1a2e;
        border-bottom: 2px solid #1a3a5c;
        padding: 10px 20px;
        font-size: 15px;
        font-weight: bold;
        color: #00aaff;
        text-transform: uppercase;
        letter-spacing: 3px;
        flex-shrink: 0;
        text-align: center;
      `,
      text: 'GROUND COMBAT',
    });
    this.container.appendChild(this.headerEl);

    // ── Main content ─────────────────────────────────────────────────────────
    const main = this.el('div', {
      cssText: `
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        padding: 14px;
        gap: 10px;
        overflow: hidden;
      `,
    });
    this.container.appendChild(main);

    // ── Side panels ──────────────────────────────────────────────────────────
    const panelRow = this.el('div', {
      cssText: 'display:flex; gap:14px; flex-shrink:0;',
    });
    main.appendChild(panelRow);

    const atkPanel = this.makeSidePanel('#00aaff');
    panelRow.appendChild(atkPanel.panel);
    this.atkTitleEl   = atkPanel.title;
    this.atkRaceEl    = atkPanel.race;
    this.atkTroopsEl  = atkPanel.troops;
    this.atkBonusesEl = atkPanel.bonuses;
    this.atkBarFill   = atkPanel.barFill;
    this.atkBarLabel  = atkPanel.barLabel;

    const defPanel = this.makeSidePanel('#ff4444');
    panelRow.appendChild(defPanel.panel);
    this.defTitleEl   = defPanel.title;
    this.defRaceEl    = defPanel.race;
    this.defTroopsEl  = defPanel.troops;
    this.defBonusesEl = defPanel.bonuses;
    this.defBarFill   = defPanel.barFill;
    this.defBarLabel  = defPanel.barLabel;

    // ── Round banner ─────────────────────────────────────────────────────────
    this.roundBannerEl = this.el('div', {
      cssText: `
        flex-shrink: 0;
        background: #050f1e;
        border: 1px solid #1a3a5c;
        border-radius: 3px;
        padding: 10px 16px;
        text-align: center;
        font-size: 14px;
        color: #607080;
        letter-spacing: 1px;
      `,
      text: 'Combat initializing…',
    });
    main.appendChild(this.roundBannerEl);

    // ── Log header ───────────────────────────────────────────────────────────
    const logHeader = this.el('div', {
      cssText: `
        flex-shrink: 0;
        background: #050f1e;
        padding: 5px 16px;
        font-size: 11px;
        color: #00aaff;
        text-transform: uppercase;
        letter-spacing: 1px;
        border: 1px solid #1a3a5c;
        border-bottom: none;
        border-radius: 3px 3px 0 0;
      `,
      text: '■ Combat Log',
    });
    main.appendChild(logHeader);

    // ── Log body ─────────────────────────────────────────────────────────────
    this.logEl = this.el('div', {
      cssText: `
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        background: #0a1a2e;
        border: 1px solid #1a3a5c;
        border-radius: 0 0 3px 3px;
        padding: 8px 14px;
        font-size: 12px;
        line-height: 1.6;
      `,
    });
    main.appendChild(this.logEl);

    // ── Result overlay ───────────────────────────────────────────────────────
    this.resultOverlayEl = this.el('div', {
      cssText: `
        display: none;
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,10,26,0.93);
        z-index: 20;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        padding: 40px;
      `,
    });
    this.container.appendChild(this.resultOverlayEl);
  }

  /** Build one side-panel (attacker or defender). Returns element refs. */
  private makeSidePanel(accentColor: string): {
    panel: HTMLElement;
    title: HTMLElement;
    race: HTMLElement;
    troops: HTMLElement;
    bonuses: HTMLElement;
    barFill: HTMLElement;
    barLabel: HTMLElement;
  } {
    const panel = this.el('div', {
      cssText: `
        flex: 1;
        background: #0a1a2e;
        border: 2px solid #1a3a5c;
        border-radius: 4px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      `,
    });

    const title = this.el('div', {
      cssText: `font-size:11px; color:${accentColor}; text-transform:uppercase; letter-spacing:1px; font-weight:bold;`,
    });
    panel.appendChild(title);

    const race = this.el('div', {
      cssText: 'font-size:14px; font-weight:bold; color:#fff;',
    });
    panel.appendChild(race);

    const troops = this.el('div', {
      cssText: 'font-size:13px; color:#c0d8f0;',
    });
    panel.appendChild(troops);

    const bonuses = this.el('div', {
      cssText: 'font-size:11px; color:#00cc66; line-height:1.5;',
    });
    panel.appendChild(bonuses);

    // Bar container
    const barWrap = this.el('div', {
      cssText: `
        position: relative;
        height: 18px;
        background: #050f1e;
        border: 1px solid #1a3a5c;
        border-radius: 2px;
        overflow: hidden;
        margin-top: 4px;
      `,
    });
    panel.appendChild(barWrap);

    const barFill = this.el('div', {
      cssText: `height:100%; width:100%; background:${accentColor}; border-radius:1px; transition:width 0.25s ease;`,
    });
    barWrap.appendChild(barFill);

    const barLabel = this.el('div', {
      cssText: `
        position: absolute;
        top: 0; left: 0; right: 0;
        text-align: center;
        line-height: 18px;
        font-size: 10px;
        color: #fff;
        text-shadow: 0 0 3px #000;
      `,
    });
    barWrap.appendChild(barLabel);

    return { panel, title, race, troops, bonuses, barFill, barLabel };
  }

  // ── Display reset ────────────────────────────────────────────────────────────

  private resetDisplay(): void {
    const p = this.params!;
    const s = this.simResult!;

    // Header
    this.headerEl.textContent = `GROUND COMBAT — ${p.planetName}`;

    // Attacker side
    this.atkTitleEl.textContent = '⚔ ATTACKERS (YOU)';
    this.atkRaceEl.textContent  = p.attackerRaceName;
    this.atkTroopsEl.innerHTML  = `Troops: <strong>${p.attackerTroops}</strong>`;
    this.atkBonusesEl.innerHTML = this.buildBonusHtml(
      p.attackerTechBonusPct,
      p.attackerRaceBonusPct,
      p.bombardmentBonus,
      'tech',
    );
    this.setBar(this.atkBarFill, this.atkBarLabel, p.attackerTroops, p.attackerTroops, '#00aaff');

    // Defender side
    this.defTitleEl.textContent = '🛡 DEFENDERS';
    this.defRaceEl.textContent  = p.defenderRaceName;
    this.defTroopsEl.innerHTML  = `Population militia: <strong>${p.defenderTroops}</strong>`;
    this.defBonusesEl.innerHTML = this.buildBonusHtml(
      p.defenderFortBonusPct,
      p.defenderRaceBonusPct,
      0,
      'fortification',
    );
    this.setBar(this.defBarFill, this.defBarLabel, p.defenderTroops, p.defenderTroops, '#ff4444');

    // Round banner
    this.roundBannerEl.textContent = '══ COMBAT BEGINS ══';
    this.roundBannerEl.style.color = '#607080';

    // Log
    this.logEl.innerHTML = '';
    this.logEntry(
      `Invading ${p.planetName}… ${p.attackerTroops} troops vs ${p.defenderTroops} defenders.`,
      '#607080',
    );
    if (p.bombardmentBonus > 0) {
      this.logEntry(`Bombardment bonus: +${p.bombardmentBonus}% (softened planetary defenses).`, '#ffaa00');
    }

    // Hide result overlay
    this.resultOverlayEl.style.display = 'none';
    this.resultOverlayEl.innerHTML = '';

    this.roundIndex = -1;

    void s; // suppress unused warning; used in animation
  }

  private buildBonusHtml(bonus1: number, bonus2: number, bonus3: number, label1: string): string {
    const lines: string[] = [];
    if (bonus1 > 0) lines.push(`+${bonus1}% ${label1} bonus`);
    if (bonus2 > 0) lines.push(`+${bonus2}% racial bonus`);
    if (bonus2 < 0) lines.push(`${bonus2}% racial penalty`);
    if (bonus3 > 0) lines.push(`+${bonus3}% bombardment`);
    return lines.length > 0 ? lines.join('<br>') : 'No bonuses';
  }

  // ── Animation ────────────────────────────────────────────────────────────────

  private startAnimation(): void {
    this.stopAnimation();
    // Slight delay before first round so layout can paint
    this.animTimerId = setTimeout(() => this.advanceRound(), 500);
  }

  private stopAnimation(): void {
    if (this.animTimerId !== null) {
      clearTimeout(this.animTimerId);
      this.animTimerId = null;
    }
  }

  private advanceRound(): void {
    this.animTimerId = null;

    const rounds = this.simResult!.rounds;
    this.roundIndex++;

    if (this.roundIndex >= rounds.length) {
      // All rounds consumed — show result
      this.showResult();
      return;
    }

    const round = rounds[this.roundIndex];
    const p = this.params!;

    // Update round banner
    this.roundBannerEl.innerHTML =
      `<span style="color:#00aaff;">══ ROUND ${round.roundNum} ══</span>` +
      `<span style="font-size:11px; color:#607080; margin-left:14px;">` +
      `Attacker casualties: <span style="color:#ff6666;">-${round.attackerCasualties}</span>` +
      ` &nbsp; Defender casualties: <span style="color:#66aaff;">-${round.defenderCasualties}</span>` +
      `</span>`;

    // Update bars
    this.setBar(this.atkBarFill, this.atkBarLabel, round.attackerRemaining, p.attackerTroops, '#00aaff');
    this.setBar(this.defBarFill, this.defBarLabel, round.defenderRemaining, p.defenderTroops, '#ff4444');

    // Log entry
    const atkColor = round.attackerCasualties > 0 ? '#ff6666' : '#607080';
    const defColor = round.defenderCasualties > 0 ? '#66aaff' : '#607080';
    this.logEntry(
      `<span style="color:#00aaff;">R${round.roundNum}</span>` +
      ` &nbsp;Attackers: <span style="color:${atkColor};">−${round.attackerCasualties}</span>` +
      ` → <strong>${round.attackerRemaining}</strong> remaining` +
      ` &nbsp;|&nbsp; Defenders: <span style="color:${defColor};">−${round.defenderCasualties}</span>` +
      ` → <strong>${round.defenderRemaining}</strong> remaining`,
    );

    // Auto-advance after ~1.4 s
    this.animTimerId = setTimeout(() => this.advanceRound(), 1400);
  }

  // ── Result overlay ───────────────────────────────────────────────────────────

  private showResult(): void {
    const sim = this.simResult!;
    const p   = this.params!;
    const won = sim.outcome === 'attacker_wins';
    const pyrrhic = won && sim.totalAttackerCasualties >= p.attackerTroops * 0.75;

    const overlay = this.resultOverlayEl;
    overlay.innerHTML = '';
    overlay.style.display = 'flex';

    // Title
    let titleText: string;
    let titleColor: string;
    if (pyrrhic) {
      titleText = '⚠ COSTLY VICTORY';
      titleColor = '#ffaa00';
    } else if (won) {
      titleText = '🌍 PLANET CAPTURED!';
      titleColor = '#00cc66';
    } else {
      titleText = 'INVASION REPELLED!';
      titleColor = '#ff4444';
    }

    const title = this.el('div', {
      cssText: `font-size:22px; font-weight:bold; color:${titleColor}; text-transform:uppercase; letter-spacing:3px; text-align:center;`,
      text: titleText,
    });
    overlay.appendChild(title);

    // Planet subtitle
    const sub = this.el('div', {
      cssText: 'font-size:14px; color:#c0d8f0; text-align:center;',
      text: won
        ? `${p.planetName} is now yours!`
        : `Your troops were defeated at ${p.planetName}.`,
    });
    overlay.appendChild(sub);

    // Separator
    overlay.appendChild(this.el('div', { cssText: 'width:70%; height:1px; background:#1a3a5c;' }));

    // Casualties block
    const cas = this.el('div', { cssText: 'font-size:13px; text-align:center; line-height:2;' });
    const atkRemaining = p.attackerTroops - sim.totalAttackerCasualties;
    const defRemaining = p.defenderTroops - sim.totalDefenderCasualties;
    cas.innerHTML =
      `Your losses: <strong style="color:#ff6666;">${sim.totalAttackerCasualties} troops</strong><br>` +
      `Enemy losses: <strong style="color:#66aaff;">${sim.totalDefenderCasualties} troops</strong>` +
      (defRemaining > 0 ? ` <span style="color:#607080;">(${defRemaining} defenders remain)</span>` : ' <span style="color:#607080;">(all eliminated)</span>');
    overlay.appendChild(cas);

    // Population change note
    if (won) {
      const popNote = this.el('div', {
        cssText: 'font-size:12px; color:#607080; text-align:center;',
        text: `Surviving population transferred to your rule. Troops remaining: ${atkRemaining}.`,
      });
      overlay.appendChild(popNote);
    }

    // Pyrrhic warning
    if (pyrrhic) {
      const warn = this.el('div', {
        cssText: 'font-size:12px; color:#ffaa00; text-align:center;',
        text: '⚠ Recommendation: Reinforce before next invasion.',
      });
      overlay.appendChild(warn);
    }

    // Continue button
    const btn = this.el('button', {
      cssText: `
        background: #1a3a5c;
        border: 2px solid #00aaff;
        color: #fff;
        padding: 12px 36px;
        cursor: pointer;
        font-family: 'Courier New', Courier, monospace;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-top: 8px;
      `,
      text: won ? 'CONTINUE TO GALAXY' : 'RETURN TO GALAXY',
    }) as HTMLButtonElement;

    btn.addEventListener('mouseover', () => {
      btn.style.background = '#00aaff';
      btn.style.color = '#000a1a';
    });
    btn.addEventListener('mouseout', () => {
      btn.style.background = '#1a3a5c';
      btn.style.color = '#fff';
    });
    btn.addEventListener('click', () => this.onContinue());
    overlay.appendChild(btn);
  }

  // ── Continue (dispatches result + navigate) ──────────────────────────────────

  private onContinue(): void {
    this.stopAnimation();

    if (this.params) {
      // Dispatch combat result so the reducer applies planet capture / troop loss
      this.store.dispatch({
        type: 'GROUNDCOMBAT_RESULT',
        payload: {
          attackerId: this.params.attackerId,
          defenderId: this.params.defenderId,
          planetId:   this.params.planetId,
        },
      });
    }

    // Navigate back to galaxy map
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
  }

  // ── Bar helper ───────────────────────────────────────────────────────────────

  private setBar(
    fill: HTMLElement,
    label: HTMLElement,
    current: number,
    max: number,
    color: string,
  ): void {
    const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
    fill.style.width   = `${pct}%`;
    fill.style.background = color;
    label.textContent  = `${current}/${max}`;
  }

  // ── Log helper ───────────────────────────────────────────────────────────────

  private logEntry(html: string, color?: string): void {
    const row = document.createElement('div');
    row.style.cssText = `
      border-bottom: 1px solid #0d1f36;
      padding: 2px 0;
      color: ${color ?? '#c0d8f0'};
    `;
    row.innerHTML = html;
    this.logEl.appendChild(row);
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  // ── Generic element factory ──────────────────────────────────────────────────

  private el(
    tag: string,
    opts: { cssText?: string; text?: string } = {},
  ): HTMLElement {
    const el = document.createElement(tag);
    if (opts.cssText)  el.style.cssText = opts.cssText;
    if (opts.text)     el.textContent   = opts.text;
    return el;
  }

  // ── Demo params (used when no real combat is pending) ───────────────────────

  private buildDemoParams(): GroundCombatParams {
    return {
      attackerId: 'player',
      defenderId: 'ai-1',
      planetId: 'demo-planet',
      planetName: 'New Hamsterton',
      attackerRaceName: 'Hamster Empire',
      defenderRaceName: 'Guinea Pig Raiders',
      attackerTroops: 12,
      attackerStrength: 13.2,
      attackerTechBonusPct: 10,
      attackerRaceBonusPct: 0,
      defenderTroops: 8,
      defenderStrength: 8.8,
      defenderFortBonusPct: 10,
      defenderRaceBonusPct: 50,
      bombardmentBonus: 20,
    };
  }
}
