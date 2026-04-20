/**
 * Tactical Combat Screen
 * src/ui/screens/CombatScreen.ts
 *
 * Implements the combat UI per design/ui-ux/tactical-combat-ui.md
 *
 * Features:
 * - Hex grid canvas rendering of ship positions
 * - Initiative strip showing turn order
 * - Ship detail panel (selected ship) + combat log
 * - Auto-resolve button that runs combat to completion
 * - Combat results screen after combat ends
 * - Return to galaxy map button
 *
 * Design constraints (from worker-prompt.md):
 * - All DOM is allowed here (this is src/ui/)
 * - Uses the combat engine from src/game/systems/combat.ts (pure, no DOM)
 * - Dispatches NAVIGATE action to return to galaxy screen
 */

import { GameState } from '../../game/state';
import { Store } from '../../game/store';
import {
  CombatState,
  CombatShip,
  CombatStatus,
  CombatResult,
  FleetForCombat,
  initiateCombat,
  processRound,
  autoResolveCombat,
} from '../../game/systems/combat';

// ── Hex grid constants ─────────────────────────────────────────────────────────

const GRID_COLS = 15;
const GRID_ROWS = 11;
const HEX_SIZE = 32; // pixels, flat-top hex radius

// Flat-top hex geometry
const HEX_H = Math.sqrt(3) * HEX_SIZE;

// ── Demo fleet builders ────────────────────────────────────────────────────────

/**
 * Build a demo attacker fleet for standalone testing.
 * In a real game this would be sourced from GameState fleets/ships.
 */
function buildDemoAttackerFleet(): FleetForCombat {
  return {
    ships: [
      {
        id: 'atk-1',
        designId: 'Destroyer',
        side: 'attacker',
        hp: 60,
        maxHp: 60,
        shieldClass: 3,
        weapons: [
          { id: 'w1', name: 'Fusion Beam', category: 'beam', damageMin: 8, damageMax: 16, attacksPerRound: 1 },
        ],
        attackRating: 3,
        defenseRating: 2,
        speed: 4,
        experience: 'regular',
        retreated: false,
      },
      {
        id: 'atk-2',
        designId: 'Cruiser',
        side: 'attacker',
        hp: 100,
        maxHp: 100,
        shieldClass: 5,
        weapons: [
          { id: 'w2', name: 'Plasma Cannon', category: 'beam', damageMin: 15, damageMax: 30, attacksPerRound: 2 },
        ],
        attackRating: 4,
        defenseRating: 2,
        speed: 3,
        experience: 'veteran',
        retreated: false,
      },
    ],
  };
}

function buildDemoDefenderFleet(): FleetForCombat {
  return {
    ships: [
      {
        id: 'def-1',
        designId: 'Scout',
        side: 'defender',
        hp: 30,
        maxHp: 30,
        shieldClass: 1,
        weapons: [
          { id: 'w3', name: 'Laser Cannon', category: 'beam', damageMin: 4, damageMax: 10, attacksPerRound: 1 },
        ],
        attackRating: 1,
        defenseRating: 3,
        speed: 5,
        experience: 'rookie',
        retreated: false,
      },
      {
        id: 'def-2',
        designId: 'Fighter',
        side: 'defender',
        hp: 45,
        maxHp: 45,
        shieldClass: 2,
        weapons: [
          { id: 'w4', name: 'Neutron Pellet Gun', category: 'beam', damageMin: 6, damageMax: 12, attacksPerRound: 1, armorPiercing: true },
        ],
        attackRating: 2,
        defenseRating: 2,
        speed: 4,
        experience: 'regular',
        retreated: false,
      },
      {
        id: 'def-3',
        designId: 'Destroyer',
        side: 'defender',
        hp: 60,
        maxHp: 60,
        shieldClass: 3,
        weapons: [
          { id: 'w5', name: 'Mass Driver', category: 'beam', damageMin: 10, damageMax: 20, attacksPerRound: 1, armorPiercing: true },
        ],
        attackRating: 3,
        defenseRating: 2,
        speed: 3,
        experience: 'regular',
        retreated: false,
      },
    ],
  };
}

// ── Hex grid utilities ─────────────────────────────────────────────────────────

/** Convert axial grid coordinates to canvas pixel center (flat-top hexes). */
function hexToPixel(col: number, row: number): { x: number; y: number } {
  const x = HEX_SIZE * 1.5 * col + HEX_SIZE;
  const y = HEX_H * (row + (col % 2 === 0 ? 0 : 0.5)) + HEX_H / 2;
  return { x, y };
}

/** Draw a single flat-top hexagon outline. */
function drawHex(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fillColor: string,
  strokeColor: string,
): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // flat-top: 0° is right
    const px = cx + size * Math.cos(angle);
    const py = cy + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;
  ctx.stroke();
}

/** Compute canvas dimensions required for the full grid. */
function computeCanvasSize(): { width: number; height: number } {
  // Max pixel extent for flat-top hexes
  const width = Math.ceil(HEX_SIZE * 1.5 * GRID_COLS + HEX_SIZE * 1.5);
  const height = Math.ceil(HEX_H * (GRID_ROWS + 0.5) + HEX_H / 2);
  return { width, height };
}

// ── Color helpers ──────────────────────────────────────────────────────────────

function hpColor(ratio: number): string {
  if (ratio > 0.5) return '#00cc66';
  if (ratio > 0.25) return '#ffaa00';
  return '#ff3333';
}

function sideColor(side: 'attacker' | 'defender'): string {
  return side === 'attacker' ? '#00aaff' : '#ff4444';
}

// ── CombatScreen ──────────────────────────────────────────────────────────────

export class CombatScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  // Sub-elements
  private headerEl!: HTMLElement;
  private initiativeEl!: HTMLElement;
  private canvasEl!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private shipPanelEl!: HTMLElement;
  private logEl!: HTMLElement;
  private controlsEl!: HTMLElement;
  private resultEl!: HTMLElement;

  // Combat state
  private combatState: CombatState | null = null;
  private result: CombatResult | null = null;
  private attackerFleet: FleetForCombat;
  private defenderFleet: FleetForCombat;

  // Position map: shipId → { col, row } — rebuilt on init and after movement
  private positions: Map<string, { col: number; row: number }> = new Map();

  // Selected ship for detail panel
  private selectedShipId: string | null = null;

  // Animation / auto-resolve
  private autoResolveAnimId: number | null = null;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;

    // Initialize with demo fleets; real game would pass from GameState
    this.attackerFleet = buildDemoAttackerFleet();
    this.defenderFleet = buildDemoDefenderFleet();

    this.buildLayout();
    this.initCombat();
  }

  // ── Screen interface ──────────────────────────────────────────────────────────

  render(_state: GameState): void {
    // State changes are handled internally; external renders are no-ops
    // (combat screen manages its own state independently)
  }

  show(): void {
    this.container.classList.add('active');
    this.container.style.display = '';
    // Reset and start fresh combat on each show
    this.initCombat();
    this.renderAll();
  }

  hide(): void {
    this.cancelAutoResolve();
    this.container.classList.remove('active');
    this.container.style.display = 'none';
  }

  // ── Layout builder ────────────────────────────────────────────────────────────

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

    // ── Header bar ─────────────────────────────────────────────────────────────
    this.headerEl = document.createElement('div');
    this.headerEl.style.cssText = `
      background: #0a1a2e;
      border-bottom: 2px solid #1a3a5c;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: bold;
      color: #00aaff;
      text-transform: uppercase;
      letter-spacing: 2px;
      flex-shrink: 0;
    `;
    this.headerEl.textContent = 'TACTICAL COMBAT';
    this.container.appendChild(this.headerEl);

    // ── Initiative strip ───────────────────────────────────────────────────────
    this.initiativeEl = document.createElement('div');
    this.initiativeEl.style.cssText = `
      background: #050f1e;
      border-bottom: 1px solid #1a3a5c;
      padding: 6px 12px;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      flex-shrink: 0;
      align-items: center;
      min-height: 56px;
    `;
    this.container.appendChild(this.initiativeEl);

    // ── Main area: grid + side panels ─────────────────────────────────────────
    const mainArea = document.createElement('div');
    mainArea.style.cssText = `
      display: flex;
      flex: 1;
      min-height: 0;
      gap: 0;
      overflow: hidden;
    `;
    this.container.appendChild(mainArea);

    // Canvas wrapper (scrollable)
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style.cssText = `
      flex: 1;
      overflow: auto;
      background: #00050f;
      position: relative;
    `;
    mainArea.appendChild(canvasWrapper);

    const { width, height } = computeCanvasSize();
    this.canvasEl = document.createElement('canvas');
    this.canvasEl.width = width;
    this.canvasEl.height = height;
    this.canvasEl.style.cssText = `
      display: block;
      cursor: pointer;
    `;
    this.canvasEl.addEventListener('click', (e) => this.onCanvasClick(e));
    canvasWrapper.appendChild(this.canvasEl);

    const ctx = this.canvasEl.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D canvas context');
    this.ctx = ctx;

    // Right side panel (ship detail + log)
    const sidePanel = document.createElement('div');
    sidePanel.style.cssText = `
      width: 300px;
      min-width: 260px;
      display: flex;
      flex-direction: column;
      border-left: 1px solid #1a3a5c;
      background: #0a1a2e;
      flex-shrink: 0;
      overflow: hidden;
    `;
    mainArea.appendChild(sidePanel);

    // Ship detail panel (top half of side)
    this.shipPanelEl = document.createElement('div');
    this.shipPanelEl.style.cssText = `
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      border-bottom: 1px solid #1a3a5c;
      min-height: 0;
    `;
    this.shipPanelEl.innerHTML = '<p style="color:#607080; font-size:12px;">Select a ship to view details.</p>';
    sidePanel.appendChild(this.shipPanelEl);

    // Combat log (bottom half of side)
    const logWrapper = document.createElement('div');
    logWrapper.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    `;
    sidePanel.appendChild(logWrapper);

    const logHeader = document.createElement('div');
    logHeader.style.cssText = `
      background: #050f1e;
      padding: 6px 12px;
      font-size: 11px;
      color: #00aaff;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #1a3a5c;
      flex-shrink: 0;
    `;
    logHeader.textContent = '■ Combat Log';
    logWrapper.appendChild(logHeader);

    this.logEl = document.createElement('div');
    this.logEl.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 8px 12px;
      font-size: 11px;
      line-height: 1.5;
      color: #c0d8f0;
    `;
    logWrapper.appendChild(this.logEl);

    // ── Controls bar (bottom) ──────────────────────────────────────────────────
    this.controlsEl = document.createElement('div');
    this.controlsEl.style.cssText = `
      background: #0a1a2e;
      border-top: 2px solid #1a3a5c;
      padding: 8px 16px;
      display: flex;
      gap: 12px;
      align-items: center;
      flex-shrink: 0;
    `;
    this.container.appendChild(this.controlsEl);
    this.buildControls();

    // ── Result overlay ─────────────────────────────────────────────────────────
    this.resultEl = document.createElement('div');
    this.resultEl.style.cssText = `
      display: none;
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,10,26,0.92);
      z-index: 20;
      align-items: center;
      justify-content: center;
    `;
    this.container.style.position = 'relative';
    this.container.appendChild(this.resultEl);
  }

  private buildControls(): void {
    this.controlsEl.innerHTML = '';

    // Label
    const label = document.createElement('span');
    label.style.cssText = 'font-size:12px; color:#607080; flex:1;';
    label.textContent = 'Combat Controls';
    this.controlsEl.appendChild(label);

    // Next Round button
    const nextRoundBtn = this.makeButton('NEXT ROUND', '#005588', '#00aaff');
    nextRoundBtn.title = 'Advance one combat round';
    nextRoundBtn.addEventListener('click', () => this.stepRound());
    this.controlsEl.appendChild(nextRoundBtn);

    // Auto-Resolve button
    const autoBtn = this.makeButton('AUTO-RESOLVE', '#1a3a1a', '#00cc66');
    autoBtn.title = 'Run combat to completion automatically';
    autoBtn.addEventListener('click', () => this.doAutoResolve());
    this.controlsEl.appendChild(autoBtn);

    // Return to map (only enabled when combat ended)
    const returnBtn = this.makeButton('RETURN TO MAP', '#3a1a1a', '#ff6666');
    returnBtn.id = 'combat-return-btn';
    returnBtn.title = 'Return to galaxy map';
    returnBtn.addEventListener('click', () => this.returnToGalaxy());
    this.controlsEl.appendChild(returnBtn);
  }

  private makeButton(label: string, bg: string, border: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `
      background: ${bg};
      border: 1px solid ${border};
      color: #fff;
      padding: 6px 14px;
      cursor: pointer;
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: background 0.15s, border-color 0.15s;
    `;
    btn.addEventListener('mouseover', () => {
      btn.style.background = border;
    });
    btn.addEventListener('mouseout', () => {
      btn.style.background = bg;
    });
    return btn;
  }

  // ── Combat initialization ─────────────────────────────────────────────────────

  private initCombat(): void {
    this.cancelAutoResolve();
    this.result = null;
    this.selectedShipId = null;
    this.combatState = initiateCombat(this.attackerFleet, this.defenderFleet);
    this.rebuildPositions();
    this.hideResultOverlay();
  }

  /** Assign hex positions for all ships based on current state. */
  private rebuildPositions(): void {
    this.positions.clear();
    if (!this.combatState) return;

    // Attackers start on left columns, defenders on right
    const attackerLiving = this.combatState.attackerShips.filter((s) => s.hp > 0 && !s.retreated);
    const defenderLiving = this.combatState.defenderShips.filter((s) => s.hp > 0 && !s.retreated);

    attackerLiving.forEach((ship, i) => {
      this.positions.set(ship.id, {
        col: 1 + Math.floor(i / GRID_ROWS),
        row: 1 + (i % (GRID_ROWS - 1)),
      });
    });

    defenderLiving.forEach((ship, i) => {
      this.positions.set(ship.id, {
        col: GRID_COLS - 2 - Math.floor(i / GRID_ROWS),
        row: 1 + (i % (GRID_ROWS - 1)),
      });
    });
  }

  // ── Step one round ────────────────────────────────────────────────────────────

  private stepRound(): void {
    if (!this.combatState || this.combatState.status !== 'ongoing') return;
    processRound(this.combatState);
    this.rebuildPositions();
    this.renderAll();

    if (this.combatState.status !== 'ongoing') {
      this.finishCombat();
    }
  }

  // ── Auto-resolve all remaining rounds ─────────────────────────────────────────

  private doAutoResolve(): void {
    if (!this.combatState) return;
    if (this.combatState.status !== 'ongoing') {
      this.showResultOverlay();
      return;
    }

    // Run synchronously to completion (combat engine is fast)
    this.result = autoResolveCombat(this.attackerFleet, this.defenderFleet, 100);
    // Sync the state's log for display
    if (this.combatState) {
      this.combatState.log = this.result.log;
      this.combatState.round = this.result.rounds;
      this.combatState.status = this.result.status;
      // Update HP from result survivors/losses
      const allLosses = [...this.result.losses.attacker, ...this.result.losses.defender];
      const lossIds = new Set(allLosses.map((s) => s.id));
      for (const ship of [...this.combatState.attackerShips, ...this.combatState.defenderShips]) {
        if (lossIds.has(ship.id)) ship.hp = 0;
      }
      this.rebuildPositions();
    }
    this.renderAll();
    this.finishCombat();
  }

  private cancelAutoResolve(): void {
    if (this.autoResolveAnimId !== null) {
      cancelAnimationFrame(this.autoResolveAnimId);
      this.autoResolveAnimId = null;
    }
  }

  // ── Combat finished ───────────────────────────────────────────────────────────

  private finishCombat(): void {
    if (!this.combatState) return;

    if (!this.result) {
      // Build result from current state
      const state = this.combatState;
      const attackerLosses = state.attackerShips.filter((s) => s.hp <= 0);
      const defenderLosses = state.defenderShips.filter((s) => s.hp <= 0);
      const survivors: CombatShip[] =
        state.status === 'attacker_wins'
          ? state.attackerShips.filter((s) => s.hp > 0 && !s.retreated)
          : state.status === 'defender_wins'
          ? state.defenderShips.filter((s) => s.hp > 0 && !s.retreated)
          : [];

      this.result = {
        status: state.status,
        survivors,
        losses: { attacker: attackerLosses, defender: defenderLosses },
        rounds: state.round,
        log: state.log,
      };
    }

    this.showResultOverlay();
  }

  // ── Return to galaxy map ──────────────────────────────────────────────────────

  private returnToGalaxy(): void {
    this.cancelAutoResolve();
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
  }

  // ── Canvas click: select ship ─────────────────────────────────────────────────

  private onCanvasClick(e: MouseEvent): void {
    if (!this.combatState) return;

    const rect = this.canvasEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Find ship closest to click point
    let bestDist = HEX_SIZE * 1.2;
    let found: string | null = null;

    const allShips = [...this.combatState.attackerShips, ...this.combatState.defenderShips];
    for (const ship of allShips) {
      const pos = this.positions.get(ship.id);
      if (!pos) continue;
      const { x, y } = hexToPixel(pos.col, pos.row);
      const dist = Math.hypot(clickX - x, clickY - y);
      if (dist < bestDist) {
        bestDist = dist;
        found = ship.id;
      }
    }

    this.selectedShipId = found;
    this.renderShipPanel();
    this.renderGrid(); // redraw to show selection highlight
  }

  // ── Render all ────────────────────────────────────────────────────────────────

  private renderAll(): void {
    this.renderHeader();
    this.renderInitiativeStrip();
    this.renderGrid();
    this.renderShipPanel();
    this.renderLog();
  }

  // ── Header ────────────────────────────────────────────────────────────────────

  private renderHeader(): void {
    if (!this.combatState) return;
    const statusText: Record<CombatStatus, string> = {
      ongoing: `ROUND ${this.combatState.round} — ONGOING`,
      attacker_wins: `ROUND ${this.combatState.round} — ATTACKERS VICTORIOUS`,
      defender_wins: `ROUND ${this.combatState.round} — DEFENDERS VICTORIOUS`,
      draw: `ROUND ${this.combatState.round} — DRAW`,
    };
    this.headerEl.textContent = `TACTICAL COMBAT  ·  ${statusText[this.combatState.status]}`;
  }

  // ── Initiative strip ──────────────────────────────────────────────────────────

  private renderInitiativeStrip(): void {
    if (!this.combatState) return;
    this.initiativeEl.innerHTML = '';

    const allShips = [
      ...this.combatState.attackerShips,
      ...this.combatState.defenderShips,
    ].filter((s) => !s.retreated).sort((a, b) => b.speed - a.speed);

    const label = document.createElement('span');
    label.style.cssText = 'font-size:10px; color:#607080; white-space:nowrap; margin-right:4px;';
    label.textContent = 'INITIATIVE:';
    this.initiativeEl.appendChild(label);

    for (const ship of allShips) {
      const card = document.createElement('div');
      const isSelected = ship.id === this.selectedShipId;
      const isDead = ship.hp <= 0;
      const color = sideColor(ship.side);
      const hpRatio = ship.hp / ship.maxHp;

      card.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px 8px;
        border: 1px solid ${isSelected ? '#fff' : color};
        background: ${isSelected ? '#1a2a3a' : '#050f1e'};
        min-width: 80px;
        cursor: pointer;
        opacity: ${isDead ? '0.35' : '1'};
        text-decoration: ${isDead ? 'line-through' : 'none'};
        flex-shrink: 0;
        transition: background 0.1s;
      `;

      card.innerHTML = `
        <span style="font-size:10px; color:${color}; font-weight:bold; white-space:nowrap;">${ship.designId}</span>
        <span style="font-size:9px; color:#607080; white-space:nowrap;">${ship.side === 'attacker' ? 'ALLY' : 'ENEMY'} · Spd ${ship.speed}</span>
        <div style="width:60px; height:5px; background:#1a1a1a; border-radius:2px; margin-top:3px; overflow:hidden;">
          <div style="width:${Math.round(hpRatio * 100)}%; height:100%; background:${hpColor(hpRatio)};"></div>
        </div>
        <span style="font-size:9px; color:#607080;">${ship.hp}/${ship.maxHp} HP</span>
      `;

      card.addEventListener('click', () => {
        this.selectedShipId = ship.id;
        this.renderShipPanel();
        this.renderInitiativeStrip();
        this.renderGrid();
      });

      this.initiativeEl.appendChild(card);
    }
  }

  // ── Hex grid canvas ───────────────────────────────────────────────────────────

  private renderGrid(): void {
    if (!this.combatState) return;
    const ctx = this.ctx;
    const { width, height } = computeCanvasSize();
    ctx.clearRect(0, 0, width, height);

    // ── Draw all hexes ──────────────────────────────────────────────────────────
    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS; row++) {
        const { x, y } = hexToPixel(col, row);
        drawHex(ctx, x, y, HEX_SIZE - 1, '#00080f', '#0f2a40');
      }
    }

    // ── Draw ships ──────────────────────────────────────────────────────────────
    const allShips = [...this.combatState.attackerShips, ...this.combatState.defenderShips];

    for (const ship of allShips) {
      const pos = this.positions.get(ship.id);
      if (!pos) continue;

      const { x, y } = hexToPixel(pos.col, pos.row);
      const isDead = ship.hp <= 0;
      const isSelected = ship.id === this.selectedShipId;
      const color = sideColor(ship.side);
      const hpRatio = ship.hp / ship.maxHp;

      // Hex highlight for selected
      if (isSelected && !isDead) {
        drawHex(ctx, x, y, HEX_SIZE - 1, '#1a2a3a', '#ffffff');
      }

      if (isDead) {
        // Debris marker
        ctx.globalAlpha = 0.3;
        drawHex(ctx, x, y, HEX_SIZE - 1, '#3a1a1a', '#552222');
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#553333';
        ctx.font = `bold ${Math.round(HEX_SIZE * 0.8)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✕', x, y);
        continue;
      }

      // Ship token hexagon (filled)
      drawHex(ctx, x, y, HEX_SIZE - 2, color + '22', color);

      // Ship letter label
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(HEX_SIZE * 0.6)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const sideInitial = ship.side === 'attacker' ? 'A' : 'E';
      ctx.fillText(sideInitial, x, y - 4);

      ctx.fillStyle = color;
      ctx.font = `${Math.round(HEX_SIZE * 0.35)}px monospace`;
      ctx.fillText(ship.designId.slice(0, 3).toUpperCase(), x, y + 10);

      // HP bar below hex
      const barW = HEX_SIZE * 1.4;
      const barH = 4;
      const barX = x - barW / 2;
      const barY = y + HEX_SIZE * 0.85;

      ctx.fillStyle = '#111';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = hpColor(hpRatio);
      ctx.fillRect(barX, barY, barW * hpRatio, barH);

      // Speed/MP label
      ctx.fillStyle = '#607080';
      ctx.font = `${Math.round(HEX_SIZE * 0.3)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`Spd ${ship.speed}`, x, barY + barH + 2);
    }
  }

  // ── Ship detail panel ─────────────────────────────────────────────────────────

  private renderShipPanel(): void {
    if (!this.combatState || !this.selectedShipId) {
      this.shipPanelEl.innerHTML = '<p style="color:#607080; font-size:12px;">Select a ship on the grid or initiative strip.</p>';
      return;
    }

    const allShips = [...this.combatState.attackerShips, ...this.combatState.defenderShips];
    const ship = allShips.find((s) => s.id === this.selectedShipId);

    if (!ship) {
      this.shipPanelEl.innerHTML = '<p style="color:#607080; font-size:12px;">Ship not found.</p>';
      return;
    }

    const hpRatio = ship.hp / ship.maxHp;
    const color = sideColor(ship.side);
    const side = ship.side === 'attacker' ? 'ALLY' : 'ENEMY';
    const isDead = ship.hp <= 0;

    const weaponRows = ship.weapons
      .map(
        (w) =>
          `<div style="font-size:11px; margin-top:4px; padding:4px; background:#050f1e; border:1px solid #1a3a5c;">
            <span style="color:#00aaff;">${w.name}</span>
            <span style="color:#607080; float:right;">${w.attacksPerRound}×/round</span>
            <br/>
            <span style="color:#c0d8f0;">Dmg: ${w.damageMin}–${w.damageMax}</span>
            ${w.armorPiercing ? '<span style="color:#ffaa00; margin-left:6px;">[AP]</span>' : ''}
            ${w.alwaysHits ? '<span style="color:#ff3333; margin-left:6px;">[AUTO-HIT]</span>' : ''}
          </div>`,
      )
      .join('');

    this.shipPanelEl.innerHTML = `
      <div style="border-bottom:1px solid #1a3a5c; padding-bottom:8px; margin-bottom:8px;">
        <div style="font-size:13px; color:${color}; font-weight:bold;">${ship.designId}</div>
        <div style="font-size:11px; color:#607080;">${side} · ${ship.experience.toUpperCase()} · ID: ${ship.id}</div>
      </div>

      ${isDead ? '<div style="color:#ff3333; font-weight:bold; margin-bottom:8px;">⚠ DESTROYED</div>' : ''}

      <div style="margin-bottom:6px;">
        <div style="font-size:11px; color:#607080; margin-bottom:2px;">HULL POINTS</div>
        <div style="height:8px; background:#111; border-radius:3px; overflow:hidden; margin-bottom:2px;">
          <div style="width:${Math.round(hpRatio * 100)}%; height:100%; background:${hpColor(hpRatio)};"></div>
        </div>
        <div style="font-size:11px; color:#c0d8f0;">${ship.hp} / ${ship.maxHp} HP</div>
      </div>

      <div style="margin-bottom:6px;">
        <div style="font-size:11px; color:#607080; margin-bottom:2px;">SHIELDS</div>
        <div style="font-size:11px; color:#c0d8f0;">Class ${ship.shieldClass} (absorbs ${ship.shieldClass} dmg/hit)</div>
      </div>

      <div style="margin-bottom:6px;">
        <div style="font-size:11px; color:#607080;">ATK RATING: <span style="color:#c0d8f0;">${ship.attackRating}</span>
          &nbsp; DEF RATING: <span style="color:#c0d8f0;">${ship.defenseRating}</span>
          &nbsp; SPEED: <span style="color:#c0d8f0;">${ship.speed}</span>
        </div>
      </div>

      <div style="margin-top:8px;">
        <div style="font-size:11px; color:#607080; margin-bottom:4px; text-transform:uppercase;">Weapons</div>
        ${weaponRows || '<span style="font-size:11px; color:#607080;">No weapons</span>'}
      </div>
    `;
  }

  // ── Combat log ────────────────────────────────────────────────────────────────

  private renderLog(): void {
    if (!this.combatState) {
      this.logEl.innerHTML = '';
      return;
    }

    const entries = this.combatState.log.slice().reverse();

    this.logEl.innerHTML = entries
      .map((entry) => {
        const isHit = entry.message.includes('HIT');
        const isMiss = entry.message.includes('MISS');
        const isEnd = entry.message.includes('Combat ended');
        const isRetreat = entry.message.includes('retreat');
        const color = isEnd ? '#00aaff' : isHit ? '#00cc66' : isMiss ? '#607080' : isRetreat ? '#ffaa00' : '#c0d8f0';
        return `<div style="color:${color}; margin-bottom:2px; padding:1px 0; border-bottom:1px solid #0a1a2e;">${entry.message}</div>`;
      })
      .join('');
  }

  // ── Result overlay ────────────────────────────────────────────────────────────

  private showResultOverlay(): void {
    if (!this.result) return;

    const r = this.result;

    const statusLabel: Record<CombatStatus, string> = {
      attacker_wins: 'BATTLE WON!',
      defender_wins: 'BATTLE LOST!',
      draw: 'DRAW — MUTUAL DESTRUCTION',
      ongoing: 'COMBAT ONGOING',
    };
    const statusColor: Record<CombatStatus, string> = {
      attacker_wins: '#00cc66',
      defender_wins: '#ff3333',
      draw: '#ffaa00',
      ongoing: '#00aaff',
    };

    const attackerLossLines = r.losses.attacker.length > 0
      ? r.losses.attacker.map((s) => `<li>${s.designId} (${s.id})</li>`).join('')
      : '<li>None!</li>';

    const defenderLossLines = r.losses.defender.length > 0
      ? r.losses.defender.map((s) => `<li>${s.designId} (${s.id})</li>`).join('')
      : '<li>None!</li>';

    this.resultEl.style.display = 'flex';
    this.resultEl.innerHTML = `
      <div style="
        background: #0a1a2e;
        border: 2px solid #1a3a5c;
        padding: 32px 40px;
        max-width: 560px;
        width: 90%;
        font-family: 'Courier New', Courier, monospace;
        color: #c0d8f0;
        position: relative;
      ">
        <div style="font-size:24px; color:${statusColor[r.status]}; font-weight:bold; text-align:center; margin-bottom:16px; letter-spacing:3px;">
          ${statusLabel[r.status]}
        </div>
        <div style="font-size:13px; color:#607080; text-align:center; margin-bottom:20px;">
          Combat resolved in ${r.rounds} round${r.rounds !== 1 ? 's' : ''}.
        </div>

        <div style="display:flex; gap:20px; margin-bottom:20px;">
          <div style="flex:1; background:#050f1e; padding:12px; border:1px solid #1a3a5c;">
            <div style="font-size:11px; color:#00aaff; margin-bottom:8px; text-transform:uppercase;">Your Losses</div>
            <ul style="list-style:none; padding:0; margin:0; font-size:12px;">
              ${attackerLossLines}
            </ul>
            <div style="font-size:11px; color:#607080; margin-top:6px;">Total: ${r.losses.attacker.length} ship${r.losses.attacker.length !== 1 ? 's' : ''}</div>
          </div>
          <div style="flex:1; background:#050f1e; padding:12px; border:1px solid #1a3a5c;">
            <div style="font-size:11px; color:#ff4444; margin-bottom:8px; text-transform:uppercase;">Enemy Losses</div>
            <ul style="list-style:none; padding:0; margin:0; font-size:12px;">
              ${defenderLossLines}
            </ul>
            <div style="font-size:11px; color:#607080; margin-top:6px;">Total: ${r.losses.defender.length} ship${r.losses.defender.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        ${r.survivors.length > 0 ? `
        <div style="font-size:12px; color:#607080; margin-bottom:16px; text-align:center;">
          Survivors: ${r.survivors.map((s) => s.designId).join(', ')}
        </div>` : ''}

        <div style="display:flex; gap:12px; justify-content:center; margin-top:8px;">
          <button id="result-replay-btn" style="
            background:#005588; border:1px solid #00aaff; color:#fff;
            padding:10px 24px; cursor:pointer; font-family:inherit;
            font-size:12px; text-transform:uppercase; letter-spacing:1px;
          ">REPLAY</button>
          <button id="result-return-btn" style="
            background:#3a1a00; border:1px solid #ffaa00; color:#fff;
            padding:10px 24px; cursor:pointer; font-family:inherit;
            font-size:12px; text-transform:uppercase; letter-spacing:1px;
          ">RETURN TO GALAXY MAP</button>
        </div>
      </div>
    `;

    const replayBtn = this.resultEl.querySelector<HTMLButtonElement>('#result-replay-btn');
    const returnBtn = this.resultEl.querySelector<HTMLButtonElement>('#result-return-btn');

    replayBtn?.addEventListener('click', () => {
      this.initCombat();
      this.renderAll();
    });

    returnBtn?.addEventListener('click', () => {
      this.returnToGalaxy();
    });
  }

  private hideResultOverlay(): void {
    this.resultEl.style.display = 'none';
    this.resultEl.innerHTML = '';
  }
}
