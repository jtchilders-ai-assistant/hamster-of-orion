/**
 * Tactical Combat Screen
 * src/ui/screens/CombatScreen.ts
 *
 * Implements the combat UI per design/ships/combat-algorithm.md and
 * design/ships/combat-mechanics.md.
 *
 * Features:
 * - Hex grid canvas rendering of ship positions
 * - Ship selection with movement range visualization (per combat_speed, Section 6-7)
 * - Click-to-move: click a highlighted hex to move selected friendly ship
 * - Click-to-fire: click an enemy ship to fire all weapons at it
 * - Floating damage numbers on hit; explosion effect on ship destroy
 * - Initiative strip showing turn order (speed-sorted, per Section 4-5)
 * - Ship detail panel (selected ship) + combat log
 * - Auto-resolve button (runs combat to completion, Section 25.6 equivalent)
 * - Retreat button (attempt fleet retreat, per Section 28-29)
 * - Combat results screen after combat ends
 *
 * Design constraints:
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
  WeaponInstance,
  initiateCombat,
  processRound,
  autoResolveCombat,
  attemptRetreat,
  calcHitChanceVs,
  applyDamage,
} from '../../game/systems/combat';

// ── Hex grid constants ─────────────────────────────────────────────────────────

const GRID_COLS = 15;
const GRID_ROWS = 15;
const HEX_SIZE = 32; // pixels, flat-top hex radius

// Flat-top hex geometry
const HEX_H = Math.sqrt(3) * HEX_SIZE;

// Range brackets per combat-mechanics.md
const RANGE_POINT_BLANK = 1;
const RANGE_CLOSE_MAX   = 4;
const RANGE_MEDIUM_MAX  = 8;
const RANGE_LONG_MAX    = 15;

// ── Visual effect types ────────────────────────────────────────────────────────

interface DamageNumber {
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  vy: number;        // upward drift speed (px/frame)
  framesLeft: number;
}

interface ExplosionParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  framesLeft: number;
}

// ── Environment flag for development mode ───────────────────────────────────

/** Set to true to enable demo fleets for combat UI testing. Disable in production. */
const DEV_ENABLE_DEMO_COMBAT = false;

// ── Demo fleet builders (DEV ONLY) ─────────────────────────────────────────
// These functions are only used for testing the combat UI.
// In production, combat data comes from the game state.

function buildDemoAttackerFleet(): FleetForCombat {
  if (!DEV_ENABLE_DEMO_COMBAT) {
    console.warn('[CombatScreen] Demo fleets disabled. Combat should come from game state.');
  }
  return {
    ships: [
      {
        id: 'atk-1',
        designId: 'Destroyer',
        side: 'attacker',
        hp: 60,
        maxHp: 60,
        hullSize: 'medium',
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
        hullSize: 'large',
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
  if (!DEV_ENABLE_DEMO_COMBAT) {
    console.warn('[CombatScreen] Demo fleets disabled. Combat should come from game state.');
  }
  return {
    ships: [
      {
        id: 'def-1',
        designId: 'Scout',
        side: 'defender',
        hp: 30,
        maxHp: 30,
        hullSize: 'small',
        shieldClass: 1,
        weapons: [
          { id: 'w3', name: 'Laser', category: 'beam', damageMin: 4, damageMax: 10, attacksPerRound: 1 },
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
        hullSize: 'small',
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
        hullSize: 'medium',
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

/** Draw a single flat-top hexagon. */
function drawHex(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fillColor: string,
  strokeColor: string,
  lineWidth = 1,
): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = cx + size * Math.cos(angle);
    const py = cy + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

/** Compute canvas dimensions required for the full grid. */
function computeCanvasSize(): { width: number; height: number } {
  const width = Math.ceil(HEX_SIZE * 1.5 * GRID_COLS + HEX_SIZE * 1.5);
  const height = Math.ceil(HEX_H * (GRID_ROWS + 0.5) + HEX_H / 2);
  return { width, height };
}

/**
 * Hex distance between two grid positions using the flat-top offset→cube coord
 * conversion.
 *
 * Formula source: design/ships/combat-mechanics.md — Range Brackets.
 */
function hexDistance(
  a: { col: number; row: number },
  b: { col: number; row: number },
): number {
  // Convert offset (flat-top, odd-r) → cube coordinates
  function toCube(col: number, row: number): { x: number; y: number; z: number } {
    const x = col;
    const z = row - (col - (col & 1)) / 2;
    const y = -x - z;
    return { x, y, z };
  }
  const ca = toCube(a.col, a.row);
  const cb = toCube(b.col, b.row);
  return Math.max(
    Math.abs(ca.x - cb.x),
    Math.abs(ca.y - cb.y),
    Math.abs(ca.z - cb.z),
  );
}

/**
 * BFS to find all hexes reachable within `maxDist` steps from `origin`.
 * Excludes hexes occupied by other ships.
 *
 * Per design/ships/combat-algorithm.md §6-7: Movement_Points = combat_speed.
 * Each hex costs 1 movement point.
 */
function getReachableHexes(
  origin: { col: number; row: number },
  maxDist: number,
  occupiedHexes: Set<string>,
): Set<string> {
  const reachable = new Set<string>();
  const visited = new Set<string>();
  const queue: Array<{ col: number; row: number; dist: number }> = [
    { col: origin.col, row: origin.row, dist: 0 },
  ];
  const originKey = `${origin.col},${origin.row}`;
  visited.add(originKey);

  // Flat-top hex neighbors (6 directions, col-parity-aware)
  function neighbors(col: number, row: number): Array<{ col: number; row: number }> {
    const isEven = col % 2 === 0;
    return isEven
      ? [
          { col: col - 1, row: row - 1 },
          { col: col + 1, row: row - 1 },
          { col: col - 1, row },
          { col: col + 1, row },
          { col: col - 1, row: row + 1 },
          { col: col + 1, row: row + 1 },
          { col, row: row - 1 },
          { col, row: row + 1 },
        ]
      : [
          { col: col - 1, row },
          { col: col + 1, row },
          { col: col - 1, row: row + 1 },
          { col: col + 1, row: row + 1 },
          { col: col - 1, row: row - 1 },
          { col: col + 1, row: row - 1 },
          { col, row: row - 1 },
          { col, row: row + 1 },
        ];
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.dist >= maxDist) continue;

    for (const nb of neighbors(current.col, current.row)) {
      if (nb.col < 0 || nb.col >= GRID_COLS) continue;
      if (nb.row < 0 || nb.row >= GRID_ROWS) continue;
      const key = `${nb.col},${nb.row}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (!occupiedHexes.has(key) || key === originKey) {
        reachable.add(key);
        queue.push({ col: nb.col, row: nb.row, dist: current.dist + 1 });
      }
    }
  }

  return reachable;
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

/** Label for range bracket per combat-mechanics.md. */
function rangeBracket(dist: number): string {
  if (dist <= RANGE_POINT_BLANK) return 'Point Blank';
  if (dist <= RANGE_CLOSE_MAX) return 'Close';
  if (dist <= RANGE_MEDIUM_MAX) return 'Medium';
  if (dist <= RANGE_LONG_MAX) return 'Long';
  return 'Very Long';
}

// ── Combat action helpers ──────────────────────────────────────────────────────

/**
 * Roll a single weapon attack for the attacker vs target.
 * Returns { hit, damage, roll, hitChance }.
 *
 * Implements combat-algorithm.md §8-11.
 */
function resolveWeaponAttack(
  attacker: CombatShip,
  weapon: WeaponInstance,
  target: CombatShip,
): { hit: boolean; damage: number; roll: number; hitChance: number } {
  const hitChance = calcHitChanceVs(attacker, weapon, target);
  const r = Math.floor(Math.random() * 100) + 1;

  if (r > hitChance) {
    return { hit: false, damage: 0, roll: r, hitChance };
  }

  // MOO1 damage-mapped-to-roll mechanic (combat-algorithm.md §8)
  let damage: number;
  if (weapon.damageMin === weapon.damageMax) {
    damage = weapon.damageMin;
  } else {
    const hitThreshold = 101 - hitChance;
    const successRange = Math.max(hitChance - 1, 1);
    const fraction = (r - hitThreshold) / successRange;
    damage = weapon.damageMin + Math.floor(fraction * (weapon.damageMax - weapon.damageMin));
    damage = Math.max(weapon.damageMin, damage);
  }

  applyDamage(target, damage, weapon);
  return { hit: true, damage, roll: r, hitChance };
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

  // Position map: shipId → { col, row } — persisted across rounds for manual movement
  private positions: Map<string, { col: number; row: number }> = new Map();

  // Interaction state
  private selectedShipId: string | null = null;

  /**
   * Interaction mode:
   * - 'select': click selects a ship
   * - 'move': click on a highlighted hex moves selected ship
   * - 'fire': click on an enemy ship fires at it
   */
  private interactionMode: 'select' | 'move' | 'fire' = 'select';

  /** Hexes the selected ship can move to (BFS result). */
  private moveableHexes: Set<string> = new Set();

  /** Enemy ships the selected ship can target (within grid). */
  private targetableShipIds: Set<string> = new Set();

  // Visual effects
  private damageNumbers: DamageNumber[] = [];
  private explosionParticles: ExplosionParticle[] = [];
  private animFrameId: number | null = null;

  // Auto-resolve animation
  private autoResolveAnimId: number | null = null;

  // Ships that have used WAIT this round (will act at end of initiative)
  private waitingShipIds: Set<string> = new Set();

  // Ships that are marked DONE this round (cannot act again until next round)
  private doneShipIds: Set<string> = new Set();

  // Track remaining movement points for each ship this round (shipId → MP remaining)
  private movementPointsRemaining: Map<string, number> = new Map();

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;

    // Try to load combat from game state; fall back to demo fleets if DEV mode enabled
    const state = store.getState();
    const fleets = this.loadCombatFleets(state);
    this.attackerFleet = fleets.attacker;
    this.defenderFleet = fleets.defender;

    this.buildLayout();
    this.initCombat();
    // Start hidden — show() will make it visible when combat begins
    this.container.style.display = 'none';
  }

  /**
   * Load combat fleets from game state, or fall back to demo fleets in dev mode.
   */
  private loadCombatFleets(state: GameState): { attacker: FleetForCombat; defender: FleetForCombat } {
    // Check if there's an active combat in the game state
    const activeCombatId = state.combats?.activeCombatId;
    if (activeCombatId) {
      const combat = state.combats.byId[activeCombatId];
      if (combat) {
        // TODO: Convert Combat state to FleetForCombat format
        // For now, this is a placeholder for the real implementation
        console.log('[CombatScreen] Loading combat from state:', activeCombatId);
      }
    }

    // No active combat in state — use demo fleets only if dev mode is enabled
    if (DEV_ENABLE_DEMO_COMBAT) {
      console.log('[CombatScreen] Using demo fleets (DEV mode)');
      return {
        attacker: buildDemoAttackerFleet(),
        defender: buildDemoDefenderFleet(),
      };
    }

    // Production mode with no active combat — return empty fleets
    // Combat screen shouldn't be shown in this case
    console.warn('[CombatScreen] No active combat and demo mode disabled');
    return {
      attacker: { ships: [] },
      defender: { ships: [] },
    };
  }

  // ── Screen interface ──────────────────────────────────────────────────────────

  render(_state: GameState): void {
    // Combat screen manages its own state internally; external renders are no-ops
  }

  show(): void {
    this.container.classList.add('active');
    this.container.style.display = '';
    this.initCombat();
    this.renderAll();
    this.startEffectLoop();
  }

  hide(): void {
    this.cancelAutoResolve();
    this.stopEffectLoop();
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
      position: relative;
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

    // Ship detail panel
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

    // Combat log
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
    this.container.appendChild(this.resultEl);
  }

  private buildControls(): void {
    this.controlsEl.innerHTML = '';

    const label = document.createElement('span');
    label.style.cssText = 'font-size:12px; color:#607080; flex:1;';
    label.textContent = 'Combat Controls';
    this.controlsEl.appendChild(label);

    // Next Round
    const nextRoundBtn = this.makeButton('NEXT ROUND', '#005588', '#00aaff');
    nextRoundBtn.title = 'Advance one combat round (AI controls all ships)';
    nextRoundBtn.addEventListener('click', () => this.stepRound());
    this.controlsEl.appendChild(nextRoundBtn);

    // Auto-Resolve
    const autoBtn = this.makeButton('AUTO-RESOLVE', '#1a3a1a', '#00cc66');
    autoBtn.title = 'Run combat to completion automatically';
    autoBtn.addEventListener('click', () => this.doAutoResolve());
    this.controlsEl.appendChild(autoBtn);

    // WAIT — yield ship's turn order, move to end of initiative
    const waitBtn = this.makeButton('WAIT', '#2a2a3a', '#8888ff');
    waitBtn.title = 'Yield selected ship\'s turn order (move to end of initiative queue)';
    waitBtn.addEventListener('click', () => this.doWait());
    this.controlsEl.appendChild(waitBtn);

    // DONE — mark ship as finished for this round
    const doneBtn = this.makeButton('DONE', '#2a3a2a', '#88cc88');
    doneBtn.title = 'Mark selected ship as finished for this combat round';
    doneBtn.addEventListener('click', () => this.doDone());
    this.controlsEl.appendChild(doneBtn);

    // Retreat — attempt fleet retreat per combat-algorithm.md §28-29
    // Retreat chance = clamp((ownSpeed / maxEnemySpeed) × 50 + 25, 0, 95)
    const retreatBtn = this.makeButton('RETREAT', '#3a2a00', '#ffaa00');
    retreatBtn.title = 'Attempt to retreat your fleet from combat';
    retreatBtn.addEventListener('click', () => this.doRetreat());
    this.controlsEl.appendChild(retreatBtn);

    // Return to map
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
      transition: background 0.15s;
    `;
    btn.addEventListener('mouseover', () => { btn.style.background = border; });
    btn.addEventListener('mouseout', () => { btn.style.background = bg; });
    return btn;
  }

  // ── Combat initialization ─────────────────────────────────────────────────────

  private initCombat(): void {
    this.cancelAutoResolve();
    this.result = null;
    this.selectedShipId = null;
    this.interactionMode = 'select';
    this.moveableHexes.clear();
    this.targetableShipIds.clear();
    this.waitingShipIds.clear();
    this.doneShipIds.clear();
    this.movementPointsRemaining.clear();
    this.damageNumbers = [];
    this.explosionParticles = [];
    this.combatState = initiateCombat(this.attackerFleet, this.defenderFleet);
    this.rebuildPositions();
    this.resetMovementPoints();
    this.hideResultOverlay();
  }

  /**
   * Assign initial hex positions for all ships.
   * Attackers start on left columns, defenders on right.
   * Positions are preserved between rounds for manual movement.
   */
  private rebuildPositions(): void {
    if (!this.combatState) return;

    // Only assign positions for ships not yet placed
    const attackerLiving = this.combatState.attackerShips.filter((s) => !this.positions.has(s.id));
    const defenderLiving = this.combatState.defenderShips.filter((s) => !this.positions.has(s.id));

    const allAttackers = this.combatState.attackerShips;
    const allDefenders = this.combatState.defenderShips;

    allAttackers.forEach((ship, i) => {
      if (!this.positions.has(ship.id)) {
        this.positions.set(ship.id, {
          col: 1 + Math.floor(i / (GRID_ROWS - 2)),
          row: 1 + (i % (GRID_ROWS - 2)),
        });
      }
    });

    allDefenders.forEach((ship, i) => {
      if (!this.positions.has(ship.id)) {
        this.positions.set(ship.id, {
          col: GRID_COLS - 2 - Math.floor(i / (GRID_ROWS - 2)),
          row: 1 + (i % (GRID_ROWS - 2)),
        });
      }
    });

    // suppress unused variable warnings
    void attackerLiving;
    void defenderLiving;
  }

  /**
   * Reset movement points for all ships at the start of each round.
   * Each ship gets MP = combat_speed per design/ships/combat-algorithm.md §6-7.
   */
  private resetMovementPoints(): void {
    if (!this.combatState) return;
    const allShips = [...this.combatState.attackerShips, ...this.combatState.defenderShips];
    for (const ship of allShips) {
      if (ship.hp > 0 && !ship.retreated) {
        this.movementPointsRemaining.set(ship.id, ship.speed);
      }
    }
  }

  /**
   * Get remaining movement points for a ship.
   * Returns 0 if ship is dead, retreated, or not found.
   */
  private getMovementPoints(shipId: string): number {
    return this.movementPointsRemaining.get(shipId) ?? 0;
  }

  /**
   * Get the maximum movement points (combat_speed) for a ship.
   */
  private getMaxMovementPoints(shipId: string): number {
    const ship = this.findShipById(shipId);
    return ship?.speed ?? 0;
  }

  // ── Effect animation loop ─────────────────────────────────────────────────────

  private startEffectLoop(): void {
    if (this.animFrameId !== null) return;
    const loop = () => {
      this.tickEffects();
      if (this.damageNumbers.length > 0 || this.explosionParticles.length > 0) {
        this.renderGrid(); // redraw grid to show effect overlays
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private stopEffectLoop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private tickEffects(): void {
    // Advance damage numbers
    this.damageNumbers = this.damageNumbers.filter((d) => d.framesLeft > 0);
    for (const d of this.damageNumbers) {
      d.y += d.vy;
      d.opacity = Math.max(0, d.opacity - 0.03);
      d.framesLeft--;
    }

    // Advance explosion particles
    this.explosionParticles = this.explosionParticles.filter((p) => p.framesLeft > 0);
    for (const p of this.explosionParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.opacity = Math.max(0, p.opacity - 0.025);
      p.radius = Math.max(0.5, p.radius - 0.15);
      p.framesLeft--;
    }
  }

  // ── Spawn visual effects ──────────────────────────────────────────────────────

  /**
   * Spawn a floating damage number at pixel position (x, y).
   * @param damage - damage dealt
   * @param shieldAbsorbed - how much was absorbed by shields (shown separately)
   * @param isCrit - whether it was a critical hit
   */
  private spawnDamageNumber(x: number, y: number, damage: number, shieldAbsorbed = 0, isCrit = false): void {
    const hullDmg = damage - shieldAbsorbed;
    const text = isCrit
      ? `✦${damage}`
      : shieldAbsorbed > 0 && hullDmg > 0
      ? `${hullDmg} (${shieldAbsorbed}🛡)`
      : `${damage}`;
    const color = isCrit ? '#ffff00' : hullDmg > 0 ? '#ff4444' : '#4488ff';

    this.damageNumbers.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y - 12,
      text,
      color,
      opacity: 1.0,
      vy: -1.2,
      framesLeft: 50,
    });
  }

  private spawnMissEffect(x: number, y: number): void {
    this.damageNumbers.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y - 12,
      text: 'MISS',
      color: '#607080',
      opacity: 0.8,
      vy: -0.8,
      framesLeft: 35,
    });
  }

  /**
   * Spawn explosion particle burst at pixel (x, y).
   * Used when a ship is destroyed.
   */
  private spawnExplosion(x: number, y: number): void {
    const colors = ['#ff8800', '#ffcc00', '#ff3300', '#ffffff', '#ffaaaa'];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 1.5 + Math.random() * 2.5;
      this.explosionParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1.0,
        framesLeft: 45 + Math.floor(Math.random() * 20),
      });
    }
  }

  // ── Step one round ────────────────────────────────────────────────────────────

  private stepRound(): void {
    if (!this.combatState || this.combatState.status !== 'ongoing') return;
    this.clearInteractionMode();
    // Clear WAIT/DONE state at the start of each new round and reset movement points
    this.waitingShipIds.clear();
    this.doneShipIds.clear();
    this.resetMovementPoints();
    processRound(this.combatState);

    // Check for newly destroyed ships and spawn explosions
    const allShips = [...this.combatState.attackerShips, ...this.combatState.defenderShips];
    for (const ship of allShips) {
      if (ship.hp <= 0) {
        const pos = this.positions.get(ship.id);
        if (pos) {
          const { x, y } = hexToPixel(pos.col, pos.row);
          this.spawnExplosion(x, y);
          this.spawnDamageNumber(x, y, 0, 0, false);
        }
      }
    }

    this.renderAll();

    if (this.combatState.status !== 'ongoing') {
      this.finishCombat();
    }
  }

  // ── Auto-resolve ──────────────────────────────────────────────────────────────

  private doAutoResolve(): void {
    if (!this.combatState) return;
    if (this.combatState.status !== 'ongoing') {
      this.showResultOverlay();
      return;
    }

    this.clearInteractionMode();
    this.result = autoResolveCombat(this.attackerFleet, this.defenderFleet, 100);

    // Sync combat state from result for display
    if (this.combatState) {
      this.combatState.log = this.result.log;
      this.combatState.round = this.result.rounds;
      this.combatState.status = this.result.status;
      const allLosses = [...this.result.losses.attacker, ...this.result.losses.defender];
      const lossIds = new Set(allLosses.map((s) => s.id));
      for (const ship of [...this.combatState.attackerShips, ...this.combatState.defenderShips]) {
        if (lossIds.has(ship.id)) {
          ship.hp = 0;
          const pos = this.positions.get(ship.id);
          if (pos) {
            const { x, y } = hexToPixel(pos.col, pos.row);
            this.spawnExplosion(x, y);
          }
        }
      }
    }

    this.renderAll();
    this.finishCombat();
  }

  /**
   * WAIT action: yield selected ship's turn order, move it to the end of
   * the initiative queue for this round. The ship can still act later.
   */
  private doWait(): void {
    if (!this.combatState || this.combatState.status !== 'ongoing') return;
    if (!this.selectedShipId) {
      this.combatState.log.push({
        round: this.combatState.round,
        message: `[WAIT] No ship selected.`,
      });
      this.renderLog();
      return;
    }

    const ship = this.findShipById(this.selectedShipId);
    if (!ship || ship.hp <= 0 || ship.retreated) {
      this.combatState.log.push({
        round: this.combatState.round,
        message: `[WAIT] Selected ship is not available.`,
      });
      this.renderLog();
      return;
    }

    // Only attacker ships (player-controlled) can use WAIT
    if (ship.side !== 'attacker') {
      this.combatState.log.push({
        round: this.combatState.round,
        message: `[WAIT] Can only use WAIT on friendly ships.`,
      });
      this.renderLog();
      return;
    }

    if (this.doneShipIds.has(this.selectedShipId)) {
      this.combatState.log.push({
        round: this.combatState.round,
        message: `[WAIT] ${ship.designId} is already marked DONE this round.`,
      });
      this.renderLog();
      return;
    }

    // Add to waiting list (will act at end of initiative order)
    this.waitingShipIds.add(this.selectedShipId);
    this.combatState.log.push({
      round: this.combatState.round,
      message: `[WAIT] ${ship.designId} yields turn order — will act at end of initiative.`,
    });

    this.clearInteractionMode();
    this.selectedShipId = null;
    this.renderAll();
  }

  /**
   * DONE action: mark the selected ship as finished for this combat round.
   * The ship cannot act again until the next round.
   */
  private doDone(): void {
    if (!this.combatState || this.combatState.status !== 'ongoing') return;
    if (!this.selectedShipId) {
      this.combatState.log.push({
        round: this.combatState.round,
        message: `[DONE] No ship selected.`,
      });
      this.renderLog();
      return;
    }

    const ship = this.findShipById(this.selectedShipId);
    if (!ship || ship.hp <= 0 || ship.retreated) {
      this.combatState.log.push({
        round: this.combatState.round,
        message: `[DONE] Selected ship is not available.`,
      });
      this.renderLog();
      return;
    }

    // Only attacker ships (player-controlled) can use DONE
    if (ship.side !== 'attacker') {
      this.combatState.log.push({
        round: this.combatState.round,
        message: `[DONE] Can only use DONE on friendly ships.`,
      });
      this.renderLog();
      return;
    }

    // Mark as done — cannot act again this round
    this.doneShipIds.add(this.selectedShipId);
    // Also remove from waiting list if it was there
    this.waitingShipIds.delete(this.selectedShipId);

    this.combatState.log.push({
      round: this.combatState.round,
      message: `[DONE] ${ship.designId} is finished for this round.`,
    });

    this.clearInteractionMode();
    this.selectedShipId = null;
    this.renderAll();
  }

  /**
   * Attempt fleet retreat per combat-algorithm.md §28-29.
   *
   * Retreat chance = clamp((ownSpeed / maxEnemySpeed) × 50 + 25, 0, 95)
   * Each attacker ship attempts retreat independently.
   */
  private doRetreat(): void {
    if (!this.combatState || this.combatState.status !== 'ongoing') return;
    this.clearInteractionMode();

    const attackers = this.combatState.attackerShips.filter(
      (s) => s.hp > 0 && !s.retreated,
    );
    let retreatedCount = 0;
    let trappedCount = 0;

    for (const ship of attackers) {
      const succeeded = attemptRetreat(ship, this.combatState);
      if (succeeded) {
        retreatedCount++;
        // Remove from position map — ship is gone from grid
        this.positions.delete(ship.id);
      } else {
        trappedCount++;
      }
    }

    const summary =
      retreatedCount > 0 && trappedCount === 0
        ? `Fleet retreated successfully (${retreatedCount} ship${retreatedCount !== 1 ? 's' : ''} escaped).`
        : retreatedCount > 0
        ? `Partial retreat: ${retreatedCount} escaped, ${trappedCount} trapped.`
        : `Retreat FAILED — all ${trappedCount} ship${trappedCount !== 1 ? 's' : ''} trapped!`;

    this.combatState.log.push({
      round: this.combatState.round,
      message: `[RETREAT] ${summary}`,
    });

    // Check if combat has ended (all attackers retreated or dead)
    const attackersRemaining = this.combatState.attackerShips.filter(
      (s) => s.hp > 0 && !s.retreated,
    );
    if (attackersRemaining.length === 0) {
      this.combatState.status = 'defender_wins';
      this.combatState.log.push({
        round: this.combatState.round,
        message: `[R${this.combatState.round}] Combat ended — all attackers retreated or destroyed.`,
      });
    }

    this.renderAll();

    if (this.combatState.status !== 'ongoing') {
      this.finishCombat();
    }
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
    this.stopEffectLoop();
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
  }

  // ── Interaction mode management ───────────────────────────────────────────────

  private clearInteractionMode(): void {
    this.interactionMode = 'select';
    this.moveableHexes.clear();
    this.targetableShipIds.clear();
  }

  /**
   * After selecting a friendly ship, compute:
   * - moveableHexes: hexes reachable within ship.speed (BFS)
   * - targetableShipIds: visible enemy ships on the grid
   *
   * The player can then:
   *   1. Click a highlighted hex → move
   *   2. Click an enemy ship → fire
   *
   * Per combat-algorithm.md §6-7:
   *   Movement_Points = combat_speed
   *   Each hex costs 1 MP.
   */
  private activateShipInteraction(ship: CombatShip): void {
    if (!this.combatState) return;
    if (ship.hp <= 0 || ship.retreated) {
      this.clearInteractionMode();
      return;
    }

    // Build occupied set (exclude the selected ship itself)
    const occupied = new Set<string>();
    for (const [id, pos] of this.positions) {
      if (id !== ship.id) {
        occupied.add(`${pos.col},${pos.row}`);
      }
    }

    const origin = this.positions.get(ship.id);
    if (!origin) { this.clearInteractionMode(); return; }

    // Reachable hexes by BFS within remaining movement points (not full speed)
    const remainingMP = this.getMovementPoints(ship.id);
    this.moveableHexes = getReachableHexes(origin, remainingMP, occupied);

    // Targetable enemies: all living enemies on the grid
    const enemies = ship.side === 'attacker'
      ? this.combatState.defenderShips
      : this.combatState.attackerShips;

    this.targetableShipIds.clear();
    for (const enemy of enemies) {
      if (enemy.hp > 0 && !enemy.retreated && this.positions.has(enemy.id)) {
        this.targetableShipIds.add(enemy.id);
      }
    }

    this.interactionMode = 'move';
    this.renderGrid();
  }

  // ── Canvas click handler ──────────────────────────────────────────────────────

  private onCanvasClick(e: MouseEvent): void {
    if (!this.combatState || this.combatState.status !== 'ongoing') return;

    const rect = this.canvasEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Find the closest hex col/row to the click
    const { clickedCol, clickedRow } = this.pixelToHex(clickX, clickY);

    // Check if clicking on a ship
    const clickedShipId = this.findShipAtHex(clickedCol, clickedRow);

    if (this.interactionMode === 'select' || this.interactionMode === 'move' || this.interactionMode === 'fire') {
      // Priority 1: click on an enemy ship → fire if a friendly is selected
      if (clickedShipId !== null) {
        const clickedShip = this.findShipById(clickedShipId);
        const selectedShip = this.selectedShipId ? this.findShipById(this.selectedShipId) : null;

        if (
          selectedShip &&
          clickedShip &&
          clickedShip.side !== selectedShip.side &&
          this.targetableShipIds.has(clickedShipId) &&
          selectedShip.hp > 0
        ) {
          // Fire at the clicked enemy
          this.executeFire(selectedShip, clickedShip);
          return;
        }

        // Otherwise: select the clicked ship
        this.selectedShipId = clickedShipId;
        const ship = this.findShipById(clickedShipId);
        if (ship && ship.side === 'attacker') {
          // Activate movement/fire mode for friendly ships
          this.activateShipInteraction(ship);
        } else {
          this.clearInteractionMode();
        }

        this.renderShipPanel();
        this.renderInitiativeStrip();
        this.renderGrid();
        return;
      }

      // Priority 2: click on a moveable hex → move selected ship
      const hexKey = `${clickedCol},${clickedRow}`;
      if (
        this.interactionMode === 'move' &&
        this.moveableHexes.has(hexKey) &&
        this.selectedShipId !== null
      ) {
        this.executeMoveToHex(this.selectedShipId, clickedCol, clickedRow);
        return;
      }

      // Priority 3: deselect (click empty, non-moveable hex)
      if (clickedShipId === null) {
        this.selectedShipId = null;
        this.clearInteractionMode();
        this.renderShipPanel();
        this.renderInitiativeStrip();
        this.renderGrid();
      }
    }
  }

  /**
   * Approximate nearest hex column/row from a pixel position.
   * Uses the inverse of hexToPixel to find the closest grid cell.
   */
  private pixelToHex(px: number, py: number): { clickedCol: number; clickedRow: number } {
    let bestDist = Infinity;
    let bestCol = 0;
    let bestRow = 0;

    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS; row++) {
        const { x, y } = hexToPixel(col, row);
        const dist = Math.hypot(px - x, py - y);
        if (dist < bestDist) {
          bestDist = dist;
          bestCol = col;
          bestRow = row;
        }
      }
    }

    return { clickedCol: bestCol, clickedRow: bestRow };
  }

  /** Returns the ship ID at the given hex position, or null if empty. */
  private findShipAtHex(col: number, row: number): string | null {
    for (const [id, pos] of this.positions) {
      if (pos.col === col && pos.row === row) return id;
    }
    return null;
  }

  private findShipById(id: string): CombatShip | undefined {
    if (!this.combatState) return undefined;
    return [...this.combatState.attackerShips, ...this.combatState.defenderShips]
      .find((s) => s.id === id);
  }

  // ── Execute move ──────────────────────────────────────────────────────────────

  /**
   * Move the selected ship to (col, row).
   * Per combat-algorithm.md §6-7: each hex costs 1 MP = 1 movement point.
   * After moving, the hex is occupied and movement mode clears.
   */
  private executeMoveToHex(shipId: string, col: number, row: number): void {
    if (!this.combatState) return;
    const ship = this.findShipById(shipId);
    if (!ship || ship.hp <= 0 || ship.retreated) return;

    const oldPos = this.positions.get(shipId);
    if (!oldPos) return;

    const dist = hexDistance(oldPos, { col, row });

    // Decrement movement points by distance moved
    const currentMP = this.getMovementPoints(shipId);
    const newMP = Math.max(0, currentMP - dist);
    this.movementPointsRemaining.set(shipId, newMP);

    this.positions.set(shipId, { col, row });

    this.combatState.log.push({
      round: this.combatState.round,
      message: `[M] ${ship.designId} moves ${dist} hex${dist !== 1 ? 'es' : ''} to (${col},${row}) [MP: ${newMP}/${ship.speed}]`,
    });

    // Recompute movement range from new position (using remaining MP)
    this.activateShipInteraction(ship);

    this.renderAll();
  }

  // ── Execute fire ──────────────────────────────────────────────────────────────

  /**
   * Fire all weapons from attacker at target, one attack per weapon per
   * attacksPerRound, per combat-algorithm.md §8-11.
   *
   * Hit chance formula (§9-10):
   *   Hit% = 50 + (attackRating - defenseRating) × 5 + experience bonus
   *   Range modifiers applied after (§10).
   * Damage (§8 MOO1 mapped): min + floor(fraction × (max-min)).
   * Shields (§11): absorb min(shieldClass, damage); remainder hits hull.
   */
  private executeFire(attacker: CombatShip, target: CombatShip): void {
    if (!this.combatState) return;
    if (attacker.hp <= 0 || target.hp <= 0) return;

    const attackerPos = this.positions.get(attacker.id);
    const targetPos = this.positions.get(target.id);

    const distHexes = attackerPos && targetPos
      ? hexDistance(attackerPos, targetPos)
      : 5; // fallback if positions unknown

    const bracket = rangeBracket(distHexes);
    const targetPixel = targetPos ? hexToPixel(targetPos.col, targetPos.row) : { x: 0, y: 0 };

    let totalHullDamage = 0;
    let anyHit = false;
    let targetDestroyed = false;

    for (const weapon of attacker.weapons) {
      const count = Math.max(1, weapon.attacksPerRound);

      for (let atk = 0; atk < count; atk++) {
        if (target.hp <= 0) { targetDestroyed = true; break; }

        const hpBefore = target.hp;
        const { hit, damage, roll, hitChance } = resolveWeaponAttack(attacker, weapon, target);
        const hpAfter = target.hp;
        const hullDamage = Math.max(0, hpBefore - hpAfter);
        const shieldAbsorbed = hit ? Math.max(0, damage - hullDamage) : 0;

        if (hit) {
          anyHit = true;
          totalHullDamage += hullDamage;
          this.spawnDamageNumber(targetPixel.x, targetPixel.y, damage, shieldAbsorbed);

          this.combatState.log.push({
            round: this.combatState.round,
            message:
              `[R${this.combatState.round}] ${attacker.designId} fires ${weapon.name}` +
              ` at ${target.designId} (${bracket})` +
              ` — HIT (${roll}≤${hitChance}%), ${damage} dmg` +
              (shieldAbsorbed > 0 ? ` (${shieldAbsorbed} absorbed by shields)` : '') +
              ` → ${target.hp}/${target.maxHp} HP`,
          });

          if (target.hp <= 0) {
            targetDestroyed = true;
            this.spawnExplosion(targetPixel.x, targetPixel.y);
            this.combatState.log.push({
              round: this.combatState.round,
              message: `[R${this.combatState.round}] ${target.designId} DESTROYED!`,
            });

            // Check if combat ended
            const allAttackers = this.combatState.attackerShips;
            const allDefenders = this.combatState.defenderShips;
            const attackersAlive = allAttackers.some((s) => s.hp > 0 && !s.retreated);
            const defendersAlive = allDefenders.some((s) => s.hp > 0 && !s.retreated);

            if (!attackersAlive && !defendersAlive) {
              this.combatState.status = 'draw';
            } else if (!defendersAlive) {
              this.combatState.status = 'attacker_wins';
            } else if (!attackersAlive) {
              this.combatState.status = 'defender_wins';
            }
            break;
          }
        } else {
          this.spawnMissEffect(targetPixel.x, targetPixel.y);
          this.combatState.log.push({
            round: this.combatState.round,
            message:
              `[R${this.combatState.round}] ${attacker.designId} fires ${weapon.name}` +
              ` at ${target.designId} (${bracket})` +
              ` — MISS (roll ${roll} > ${hitChance}%)`,
          });
        }
      }

      if (targetDestroyed) break;
    }

    void anyHit;
    void totalHullDamage;

    // Refresh move range after firing
    const selectedShip = this.selectedShipId ? this.findShipById(this.selectedShipId) : null;
    if (selectedShip && selectedShip.hp > 0) {
      this.activateShipInteraction(selectedShip);
    } else {
      this.clearInteractionMode();
    }

    this.renderAll();

    if (this.combatState.status !== 'ongoing') {
      setTimeout(() => this.finishCombat(), 600);
    }
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
    const modeHint = this.interactionMode === 'move' && this.selectedShipId
      ? '  [Click hex: MOVE | Click enemy: FIRE | Click unit: SELECT]'
      : '';

    const statusText: Record<CombatStatus, string> = {
      ongoing:       `ROUND ${this.combatState.round} — ONGOING`,
      attacker_wins: `ROUND ${this.combatState.round} — ATTACKERS VICTORIOUS`,
      defender_wins: `ROUND ${this.combatState.round} — DEFENDERS VICTORIOUS`,
      draw:          `ROUND ${this.combatState.round} — DRAW`,
    };
    this.headerEl.textContent = `TACTICAL COMBAT  ·  ${statusText[this.combatState.status]}${modeHint}`;
  }

  // ── Initiative strip ──────────────────────────────────────────────────────────

  private renderInitiativeStrip(): void {
    if (!this.combatState) return;
    this.initiativeEl.innerHTML = '';

    // Sort by speed descending — initiative order per §4-5
    // Ships using WAIT move to end of initiative order (per design doc)
    const allShips = [
      ...this.combatState.attackerShips,
      ...this.combatState.defenderShips,
    ].sort((a, b) => {
      const aWaiting = this.waitingShipIds.has(a.id);
      const bWaiting = this.waitingShipIds.has(b.id);
      // Waiting ships go to end
      if (aWaiting && !bWaiting) return 1;
      if (!aWaiting && bWaiting) return -1;
      // Otherwise sort by speed descending
      return b.speed - a.speed;
    });

    const label = document.createElement('span');
    label.style.cssText = 'font-size:10px; color:#607080; white-space:nowrap; margin-right:4px;';
    label.textContent = 'INITIATIVE:';
    this.initiativeEl.appendChild(label);

    for (const ship of allShips) {
      const card = document.createElement('div');
      const isSelected = ship.id === this.selectedShipId;
      const isDead = ship.hp <= 0;
      const isRetreated = ship.retreated;
      const isWaiting = this.waitingShipIds.has(ship.id);
      const isDone = this.doneShipIds.has(ship.id);
      const color = sideColor(ship.side);
      const hpRatio = ship.maxHp > 0 ? ship.hp / ship.maxHp : 0;

      // Determine border color based on state
      let borderColor = isSelected ? '#fff' : color;
      if (isWaiting) borderColor = '#8888ff';
      if (isDone) borderColor = '#88cc88';

      card.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px 8px;
        border: 1px solid ${borderColor};
        background: ${isSelected ? '#1a2a3a' : isDone ? '#1a2a1a' : isWaiting ? '#1a1a2a' : '#050f1e'};
        min-width: 80px;
        cursor: pointer;
        opacity: ${isDead || isRetreated ? '0.35' : isDone ? '0.6' : '1'};
        text-decoration: ${isDead ? 'line-through' : 'none'};
        flex-shrink: 0;
        transition: background 0.1s;
      `;

      // Build status indicator string
      const statusParts: string[] = [];
      if (isRetreated) statusParts.push('FLED');
      if (isWaiting) statusParts.push('[WAIT]');
      if (isDone) statusParts.push('✓ done');
      const statusStr = statusParts.length > 0 ? ` · ${statusParts.join(' ')}` : '';

      card.innerHTML = `
        <span style="font-size:10px; color:${color}; font-weight:bold; white-space:nowrap;">${ship.designId}</span>
        <span style="font-size:9px; color:#607080; white-space:nowrap;">
          ${ship.side === 'attacker' ? 'ALLY' : 'ENEMY'} · Spd ${ship.speed}${statusStr}
        </span>
        <div style="width:60px; height:5px; background:#1a1a1a; border-radius:2px; margin-top:3px; overflow:hidden;">
          <div style="width:${Math.round(hpRatio * 100)}%; height:100%; background:${hpColor(hpRatio)};"></div>
        </div>
        <span style="font-size:9px; color:#607080;">${ship.hp}/${ship.maxHp} HP</span>
      `;

      card.addEventListener('click', () => {
        this.selectedShipId = ship.id;
        if (ship.side === 'attacker' && ship.hp > 0 && !ship.retreated) {
          this.activateShipInteraction(ship);
        } else {
          this.clearInteractionMode();
        }
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

    // ── 1. Draw base hexes ──────────────────────────────────────────────────────
    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS; row++) {
        const { x, y } = hexToPixel(col, row);
        const key = `${col},${row}`;

        let fill = '#00080f';
        let stroke = '#0f2a40';
        let lineW = 1;

        if (this.moveableHexes.has(key)) {
          // Movement range highlight (blue-green tint)
          fill = '#0a2a1a';
          stroke = '#00aa55';
          lineW = 1.5;
        }

        // Draw the hex
        drawHex(ctx, x, y, HEX_SIZE - 1, fill, stroke, lineW);

        // Add pulsing dot for moveable hexes
        if (this.moveableHexes.has(key) && !this.findShipAtHex(col, row)) {
          ctx.fillStyle = '#00aa5555';
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // ── 2. Draw range bracket labels (relative to selected ship) ──────────────
    const selectedPos = this.selectedShipId ? this.positions.get(this.selectedShipId) : null;
    if (selectedPos && this.interactionMode === 'move') {
      // Lightly label the range zones
      for (const [, pos] of this.positions) {
        if (pos === selectedPos) continue;
        const dist = hexDistance(selectedPos, pos);
        const { x, y } = hexToPixel(pos.col, pos.row);
        ctx.fillStyle = '#223344';
        ctx.font = `8px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${dist}h`, x, y + HEX_SIZE * 0.95);
      }
    }

    // ── 3. Draw ships ───────────────────────────────────────────────────────────
    const allShips = [...this.combatState.attackerShips, ...this.combatState.defenderShips];

    for (const ship of allShips) {
      const pos = this.positions.get(ship.id);
      if (!pos) continue;

      const { x, y } = hexToPixel(pos.col, pos.row);
      const isDead = ship.hp <= 0;
      const isSelected = ship.id === this.selectedShipId;
      const isTargetable = this.targetableShipIds.has(ship.id);
      const color = sideColor(ship.side);
      const hpRatio = ship.maxHp > 0 ? ship.hp / ship.maxHp : 0;

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

      if (ship.retreated) {
        // Retreated — dim ghost
        ctx.globalAlpha = 0.2;
        drawHex(ctx, x, y, HEX_SIZE - 1, '#1a1a2a', '#334455');
        ctx.globalAlpha = 1;
        continue;
      }

      // Selection highlight
      if (isSelected) {
        drawHex(ctx, x, y, HEX_SIZE, '#1a3a5a', '#ffffff', 2);
      }

      // Targetable enemy highlight (pulsing red border)
      if (isTargetable) {
        ctx.globalAlpha = 0.6;
        drawHex(ctx, x, y, HEX_SIZE - 1, '#3a0a0a', '#ff4444', 2);
        ctx.globalAlpha = 1;
      }

      // Ship token
      drawHex(ctx, x, y, HEX_SIZE - 3, color + '22', color, 1);

      // Side initial + design abbreviation
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(HEX_SIZE * 0.55)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ship.side === 'attacker' ? 'A' : 'E', x, y - 5);

      ctx.fillStyle = color;
      ctx.font = `${Math.round(HEX_SIZE * 0.3)}px monospace`;
      ctx.fillText(ship.designId.slice(0, 3).toUpperCase(), x, y + 9);

      // HP bar
      const barW = HEX_SIZE * 1.4;
      const barH = 4;
      const barX = x - barW / 2;
      const barY = y + HEX_SIZE * 0.82;
      ctx.fillStyle = '#111';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = hpColor(hpRatio);
      ctx.fillRect(barX, barY, barW * hpRatio, barH);

      // Movement Points (MP) display per design doc
      // Format: "MP: n/max" with status indicators
      const mp = this.getMovementPoints(ship.id);
      const maxMp = this.getMaxMovementPoints(ship.id);
      const isWaiting = this.waitingShipIds.has(ship.id);
      const isDone = this.doneShipIds.has(ship.id);

      // Build MP label with status indicator per design:
      // - "MP: 0/4 ✓ done" when ship has exhausted its moves or is marked done
      // - "MP: 4/4 ◄►" when a ship is selected and waiting for movement input
      // - "[WAIT]" when ship used WAIT
      let mpLabel: string;
      let mpColor: string;
      if (isDone) {
        mpLabel = `MP: ${mp}/${maxMp} ✓`;
        mpColor = '#88cc88';
      } else if (isWaiting) {
        mpLabel = `[WAIT]`;
        mpColor = '#8888ff';
      } else if (mp === 0 && maxMp > 0) {
        mpLabel = `MP: 0/${maxMp} ✓`;
        mpColor = '#88cc88';
      } else if (isSelected) {
        mpLabel = `MP: ${mp}/${maxMp} ◄►`;
        mpColor = '#00aaff';
      } else {
        mpLabel = `MP: ${mp}/${maxMp}`;
        mpColor = '#607080';
      }

      ctx.fillStyle = mpColor;
      ctx.font = `${Math.round(HEX_SIZE * 0.28)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(mpLabel, x, barY + barH + 1);

      // Shield indicator
      if (ship.shieldClass > 0) {
        ctx.fillStyle = '#4488ff88';
        ctx.font = `${Math.round(HEX_SIZE * 0.28)}px monospace`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`🛡${ship.shieldClass}`, x + HEX_SIZE * 0.85, y - HEX_SIZE * 0.9);
      }
    }

    // ── 4. Draw explosion particles ─────────────────────────────────────────────
    for (const p of this.explosionParticles) {
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── 5. Draw floating damage numbers ─────────────────────────────────────────
    for (const d of this.damageNumbers) {
      ctx.globalAlpha = d.opacity;
      ctx.fillStyle = d.color;
      ctx.font = `bold 13px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Shadow for readability
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 3;
      ctx.fillText(d.text, d.x, d.y);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  // ── Ship detail panel ─────────────────────────────────────────────────────────

  private renderShipPanel(): void {
    if (!this.combatState || !this.selectedShipId) {
      this.shipPanelEl.innerHTML = '<p style="color:#607080; font-size:12px;">Select a ship on the grid or initiative strip.<br><br><em style="font-size:10px;">Friendly ships: click to select, then click a green hex to move or an enemy to fire.</em></p>';
      return;
    }

    const allShips = [...this.combatState.attackerShips, ...this.combatState.defenderShips];
    const ship = allShips.find((s) => s.id === this.selectedShipId);

    if (!ship) {
      this.shipPanelEl.innerHTML = '<p style="color:#607080; font-size:12px;">Ship not found.</p>';
      return;
    }

    const hpRatio = ship.maxHp > 0 ? ship.hp / ship.maxHp : 0;
    const color = sideColor(ship.side);
    const side = ship.side === 'attacker' ? 'ALLY' : 'ENEMY';
    const isDead = ship.hp <= 0;

    // Range bracket if position is known
    const selectedPos = this.positions.get(ship.id);
    const shipPos = this.selectedShipId && this.positions.get(this.selectedShipId);
    const rangeStr = selectedPos && shipPos && ship.id !== this.selectedShipId
      ? rangeBracket(hexDistance(selectedPos, shipPos))
      : '';
    void rangeStr;

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

    const interactionHint =
      !isDead && ship.side === 'attacker' && this.interactionMode === 'move'
        ? `<div style="font-size:10px; color:#00aa55; margin-top:6px; padding:4px; border:1px solid #00aa55; background:#001a0a;">
            ⬡ Green hexes = move range (${ship.speed} hex${ship.speed !== 1 ? 'es' : ''})<br>
            🎯 Red-bordered ships = fire targets
           </div>`
        : '';

    this.shipPanelEl.innerHTML = `
      <div style="border-bottom:1px solid #1a3a5c; padding-bottom:8px; margin-bottom:8px;">
        <div style="font-size:13px; color:${color}; font-weight:bold;">${ship.designId}</div>
        <div style="font-size:11px; color:#607080;">${side} · ${ship.experience.toUpperCase()} · ID: ${ship.id}</div>
      </div>

      ${isDead ? '<div style="color:#ff3333; font-weight:bold; margin-bottom:8px;">⚠ DESTROYED</div>' : ''}
      ${ship.retreated ? '<div style="color:#ffaa00; font-weight:bold; margin-bottom:8px;">↩ RETREATED</div>' : ''}

      <div style="margin-bottom:6px;">
        <div style="font-size:11px; color:#607080; margin-bottom:2px;">HULL POINTS</div>
        <div style="height:8px; background:#111; border-radius:3px; overflow:hidden; margin-bottom:2px;">
          <div style="width:${Math.round(hpRatio * 100)}%; height:100%; background:${hpColor(hpRatio)};"></div>
        </div>
        <div style="font-size:11px; color:#c0d8f0;">${ship.hp} / ${ship.maxHp} HP</div>
      </div>

      <div style="margin-bottom:6px;">
        <div style="font-size:11px; color:#607080; margin-bottom:2px;">SHIELDS</div>
        <div style="font-size:11px; color:#4488ff;">
          Class ${ship.shieldClass}
          ${ship.shieldClass > 0 ? `(absorbs ${ship.shieldClass} dmg/hit)` : '(none)'}
        </div>
      </div>

      <div style="margin-bottom:6px; font-size:11px; color:#607080;">
        ATK: <span style="color:#c0d8f0;">${ship.attackRating}</span>
        &nbsp; DEF: <span style="color:#c0d8f0;">${ship.defenseRating}</span>
        &nbsp; SPD: <span style="color:#c0d8f0;">${ship.speed}</span>
      </div>

      ${interactionHint}

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

    // Show newest entries first (reversed)
    const entries = this.combatState.log.slice().reverse();

    this.logEl.innerHTML = entries
      .map((entry) => {
        const m = entry.message;
        const isHit      = m.includes('HIT');
        const isMiss     = m.includes('MISS');
        const isDestroy  = m.includes('DESTROYED');
        const isEnd      = m.includes('Combat ended') || m.includes('VICTORIOUS') || m.includes('DRAW');
        const isRetreat  = m.includes('retreat') || m.includes('RETREAT');
        const isMove     = m.startsWith('[M]');
        const color =
          isDestroy  ? '#ff8800' :
          isEnd      ? '#00aaff' :
          isHit      ? '#00cc66' :
          isMiss     ? '#607080' :
          isRetreat  ? '#ffaa00' :
          isMove     ? '#00aaaa' :
                       '#c0d8f0';
        return `<div style="color:${color}; margin-bottom:2px; padding:1px 0; border-bottom:1px solid #0a1a2e;">${m}</div>`;
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
      draw:          'DRAW — MUTUAL DESTRUCTION',
      ongoing:       'COMBAT ONGOING',
    };
    const statusColor: Record<CombatStatus, string> = {
      attacker_wins: '#00cc66',
      defender_wins: '#ff3333',
      draw:          '#ffaa00',
      ongoing:       '#00aaff',
    };

    const attackerLossLines = r.losses.attacker.length > 0
      ? r.losses.attacker.map((s) => `<li>${s.designId} (${s.id})</li>`).join('')
      : '<li style="color:#607080;">None</li>';

    const defenderLossLines = r.losses.defender.length > 0
      ? r.losses.defender.map((s) => `<li>${s.designId} (${s.id})</li>`).join('')
      : '<li style="color:#607080;">None</li>';

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
            <div style="font-size:11px; color:#607080; margin-top:6px;">Total: ${r.losses.attacker.length}</div>
          </div>
          <div style="flex:1; background:#050f1e; padding:12px; border:1px solid #1a3a5c;">
            <div style="font-size:11px; color:#ff4444; margin-bottom:8px; text-transform:uppercase;">Enemy Losses</div>
            <ul style="list-style:none; padding:0; margin:0; font-size:12px;">
              ${defenderLossLines}
            </ul>
            <div style="font-size:11px; color:#607080; margin-top:6px;">Total: ${r.losses.defender.length}</div>
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
          ">RETURN TO MAP</button>
        </div>
      </div>
    `;

    this.resultEl.querySelector<HTMLButtonElement>('#result-replay-btn')
      ?.addEventListener('click', () => {
        this.positions.clear(); // reset positions for fresh layout
        this.initCombat();
        this.renderAll();
      });

    this.resultEl.querySelector<HTMLButtonElement>('#result-return-btn')
      ?.addEventListener('click', () => {
        this.returnToGalaxy();
      });
  }

  private hideResultOverlay(): void {
    this.resultEl.style.display = 'none';
    this.resultEl.innerHTML = '';
  }
}
