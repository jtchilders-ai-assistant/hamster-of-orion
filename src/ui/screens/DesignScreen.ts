/**
 * Ship Design screen — F6 / DESIGN button.
 * src/ui/screens/DesignScreen.ts
 *
 * Full MOO1-accurate ship designer:
 *  - Hull size selector (Frigate/Destroyer/Cruiser/Battleship/Titan)
 *  - Auto-assigned systems panel (computer, shield, armor, engine, ECM — read-only)
 *  - Weapons panel — 4 slots, weapon type + count
 *  - Special equipment panel — 3 slots
 *  - Live stats: remaining space, total cost in BC
 *  - Ship name input
 *  - Save (BUILD), Clear, Cancel, Delete, Load/cycle designs
 *
 * DOM-only — all game logic delegated to src/game/systems/shipDesign.ts.
 */

import { Store } from '../../game/store';
import {
  GameState,
  ShipClass,
  ShipDesign,
  ShipDesignId,
  ShipComponent,
  ShipDesignStats,
  EmpireId,
} from '../../game/state';
import {
  validateDesign,
  calculateDesignCost,
  HULL_SPECS,
  getComponent,
  DesignComponent,
} from '../../game/systems/shipDesign';
import type { ComponentData } from '../../game/types/shipComponents';
import componentsRaw from '../../data/components.json';

// ── Type for the full components schema ──────────────────────────────────────

interface ComponentsSchema {
  version: number;
  components: ComponentData[];
}

const ALL_COMPONENTS: ComponentData[] = (componentsRaw as ComponentsSchema).components;

// ── Hull display names ────────────────────────────────────────────────────────

const HULL_LABELS: Record<ShipClass, string> = {
  small:  'Frigate',
  medium: 'Destroyer',
  large:  'Cruiser',
  huge:   'Battleship',
};

// ── Working design state (in-progress edit) ───────────────────────────────────

interface WeaponSlot {
  componentId: string | null;
  count: number;
}

interface WorkingDesign {
  name: string;
  hullSize: ShipClass;
  weaponSlots: [WeaponSlot, WeaponSlot, WeaponSlot, WeaponSlot];
  specialSlots: [string | null, string | null, string | null];
}

function emptyWeaponSlot(): WeaponSlot {
  return { componentId: null, count: 1 };
}

function emptyWorking(): WorkingDesign {
  return {
    name: 'NEW DESIGN',
    hullSize: 'small',
    weaponSlots: [emptyWeaponSlot(), emptyWeaponSlot(), emptyWeaponSlot(), emptyWeaponSlot()],
    specialSlots: [null, null, null],
  };
}

// ── DesignScreen ─────────────────────────────────────────────────────────────

export class DesignScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  /** The design currently being edited */
  private working: WorkingDesign = emptyWorking();
  /** The design ID being edited (null = new design) */
  private editingId: ShipDesignId | null = null;
  /** Index into allIds for the "cycle designs" feature */
  private cycleIndex = 0;

  // Cached DOM references (set during buildLayout)
  private hullRadios: HTMLInputElement[] = [];
  private systemsPanel!: HTMLElement;
  private weaponRows: HTMLElement[] = [];
  private specialRows: HTMLElement[] = [];
  private statsBar!: HTMLElement;
  private nameInput!: HTMLInputElement;
  private errorBox!: HTMLElement;
  private deleteBtn!: HTMLButtonElement;
  private prevBtn!: HTMLButtonElement;
  private nextBtn!: HTMLButtonElement;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.buildLayout();
  }

  // ── Public interface ────────────────────────────────────────────────────────

  show(): void {
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.classList.remove('active');
  }

  render(state: GameState): void {
    // Refresh available components when state changes (research might have advanced)
    this.refreshDynamicContent(state);
  }

  // ── Layout construction ──────────────────────────────────────────────────────

  private buildLayout(): void {
    this.container.innerHTML = '';
    this.container.style.cssText =
      'display:none; flex-direction:column; height:100%; overflow:hidden; background:var(--color-bg)';

    // Header
    const header = document.createElement('div');
    header.className = 'screen-header';
    header.innerHTML = `<h1 style="font-family:var(--font-mono);font-size:18px;color:var(--color-accent);
      text-transform:uppercase;letter-spacing:3px;margin:0">SHIP DESIGN</h1>`;
    this.container.appendChild(header);

    // Scrollable body
    const body = document.createElement('div');
    body.style.cssText = 'flex:1; overflow-y:auto; padding:12px 16px; display:flex; flex-direction:column; gap:12px;';
    this.container.appendChild(body);

    // Hull selector row
    body.appendChild(this.buildHullSelector());

    // Auto-assigned systems panel
    this.systemsPanel = this.buildSystemsPanel();
    body.appendChild(this.systemsPanel);

    // Weapons panel
    const [weaponsSection, weaponRows] = this.buildWeaponsPanel();
    this.weaponRows = weaponRows;
    body.appendChild(weaponsSection);

    // Lower row: specials + preview
    const lowerRow = document.createElement('div');
    lowerRow.style.cssText = 'display:flex; gap:12px;';
    const [specialsSection, specialRows] = this.buildSpecialsPanel();
    this.specialRows = specialRows;
    lowerRow.appendChild(specialsSection);
    lowerRow.appendChild(this.buildPreviewPanel());
    body.appendChild(lowerRow);

    // Error box
    this.errorBox = document.createElement('div');
    this.errorBox.style.cssText =
      'display:none; background:#1a0000; border:1px solid var(--color-danger); border-radius:4px;' +
      'padding:8px 12px; color:var(--color-danger); font-family:var(--font-mono); font-size:12px;';
    body.appendChild(this.errorBox);

    // Bottom stats + action bar
    this.statsBar = this.buildStatsBar();
    this.container.appendChild(this.statsBar);
  }

  // ── Hull selector ──────────────────────────────────────────────────────────

  private buildHullSelector(): HTMLElement {
    const panel = this.makePanel();
    panel.style.cssText += 'padding:10px 16px;';

    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center; gap:20px; flex-wrap:wrap;';

    const label = document.createElement('span');
    label.textContent = 'Ship Size:';
    label.style.cssText =
      'font-family:var(--font-mono); font-size:13px; color:var(--color-text-dim); margin-right:4px;';
    row.appendChild(label);

    const hulls: ShipClass[] = ['small', 'medium', 'large', 'huge'];
    this.hullRadios = [];

    for (const hull of hulls) {
      const radioLabel = document.createElement('label');
      radioLabel.style.cssText =
        'display:flex; align-items:center; gap:6px; cursor:pointer;' +
        'font-family:var(--font-mono); font-size:13px; color:var(--color-text);';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'hull-size';
      radio.value = hull;
      radio.style.accentColor = 'var(--color-accent)';
      if (hull === 'small') radio.checked = true;

      radio.addEventListener('change', () => {
        if (radio.checked) {
          this.working.hullSize = hull;
          this.clampWeaponsToHull();
          this.updateStats();
        }
      });

      radioLabel.appendChild(radio);
      radioLabel.appendChild(document.createTextNode(HULL_LABELS[hull]));
      row.appendChild(radioLabel);
      this.hullRadios.push(radio);
    }

    panel.appendChild(row);
    return panel;
  }

  // ── Auto-assigned systems panel ────────────────────────────────────────────

  private buildSystemsPanel(): HTMLElement {
    const panel = this.makePanel();

    const title = document.createElement('div');
    title.textContent = 'SHIP SYSTEMS (AUTO-ASSIGNED)';
    title.style.cssText =
      'font-family:var(--font-mono); font-size:12px; color:var(--color-accent);' +
      'text-transform:uppercase; letter-spacing:2px; margin-bottom:10px;';
    panel.appendChild(title);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:6px 24px;';
    grid.id = 'ds-systems-grid';
    panel.appendChild(grid);

    const note = document.createElement('div');
    note.textContent = 'Read-only — upgrades automatically when you research better technology.';
    note.style.cssText =
      'font-family:var(--font-mono); font-size:11px; color:var(--color-text-dim); margin-top:8px;';
    panel.appendChild(note);

    return panel;
  }

  /** Re-render the systems grid from current state. */
  private renderSystems(state: GameState): void {
    const grid = this.container.querySelector('#ds-systems-grid') as HTMLElement | null;
    if (!grid) return;
    grid.innerHTML = '';

    const empire = this.getPlayerEmpire(state);
    const techs = empire?.research.completedTechs ?? [];

    const rows: Array<{ label: string; value: string }> = [
      { label: 'Computer', value: this.bestSystemLabel('computer', techs) },
      { label: 'Armor',    value: this.bestSystemLabel('armor',    techs) },
      { label: 'Shield',   value: this.bestSystemLabel('shield',   techs) },
      { label: 'Engine',   value: this.bestSystemLabel('engine',   techs) },
      { label: 'ECM',      value: this.bestECMLabel(techs) },
      { label: 'Maneuver', value: this.bestManeuverLabel('engine', techs) },
    ];

    for (const row of rows) {
      const cell = document.createElement('div');
      cell.style.cssText =
        'display:flex; gap:8px; font-family:var(--font-mono); font-size:12px; align-items:center;';

      const lbl = document.createElement('span');
      lbl.textContent = row.label;
      lbl.style.cssText = 'color:var(--color-text-dim); min-width:72px;';

      const val = document.createElement('span');
      val.textContent = row.value;
      val.style.color = 'var(--color-text)';

      cell.appendChild(lbl);
      cell.appendChild(val);
      grid.appendChild(cell);
    }
  }

  // ── Weapons panel ──────────────────────────────────────────────────────────

  private buildWeaponsPanel(): [HTMLElement, HTMLElement[]] {
    const panel = this.makePanel();

    const title = document.createElement('div');
    title.textContent = 'WEAPONS (PLAYER SELECTS)';
    title.style.cssText =
      'font-family:var(--font-mono); font-size:12px; color:var(--color-accent);' +
      'text-transform:uppercase; letter-spacing:2px; margin-bottom:10px;';
    panel.appendChild(title);

    // Table header
    const table = document.createElement('div');
    table.style.cssText = 'display:table; width:100%; border-collapse:collapse;';

    const header = document.createElement('div');
    header.style.cssText = 'display:table-row;';
    for (const col of ['Count', 'Weapon', 'Damage', 'Arc']) {
      const th = document.createElement('div');
      th.textContent = col;
      th.style.cssText =
        'display:table-cell; font-family:var(--font-mono); font-size:11px;' +
        'color:var(--color-text-dim); padding:4px 8px; border-bottom:1px solid var(--color-border);' +
        'text-transform:uppercase; letter-spacing:1px;';
      header.appendChild(th);
    }
    table.appendChild(header);

    const rows: HTMLElement[] = [];
    for (let i = 0; i < 4; i++) {
      const row = this.buildWeaponRow(i);
      rows.push(row);
      table.appendChild(row);
    }

    panel.appendChild(table);
    return [panel, rows];
  }

  private buildWeaponRow(index: number): HTMLElement {
    const row = document.createElement('div');
    row.style.cssText =
      'display:table-row; border-bottom:1px solid var(--color-border);';

    // Count cell: decrement button, count display, increment button
    const countCell = document.createElement('div');
    countCell.style.cssText =
      'display:table-cell; vertical-align:middle; padding:6px 8px; white-space:nowrap;';

    const decBtn = document.createElement('button');
    decBtn.textContent = '−';
    this.styleSmallBtn(decBtn);
    decBtn.addEventListener('click', () => this.adjustWeaponCount(index, -1));

    const countSpan = document.createElement('span');
    countSpan.style.cssText =
      'font-family:var(--font-mono); font-size:13px; color:var(--color-text);' +
      'min-width:24px; text-align:center; display:inline-block;';
    countSpan.dataset['idx'] = String(index);
    countSpan.className = 'ds-weapon-count';

    const incBtn = document.createElement('button');
    incBtn.textContent = '+';
    this.styleSmallBtn(incBtn);
    incBtn.addEventListener('click', () => this.adjustWeaponCount(index, +1));

    countCell.appendChild(decBtn);
    countCell.appendChild(countSpan);
    countCell.appendChild(incBtn);
    row.appendChild(countCell);

    // Weapon dropdown cell
    const weaponCell = document.createElement('div');
    weaponCell.style.cssText = 'display:table-cell; vertical-align:middle; padding:6px 8px;';

    const select = document.createElement('select');
    select.className = 'ds-weapon-select';
    select.dataset['idx'] = String(index);
    this.styleSelect(select);
    select.addEventListener('change', () => {
      const val = select.value || null;
      this.working.weaponSlots[index].componentId = val;
      if (!val) this.working.weaponSlots[index].count = 1;
      this.updateStats();
      this.refreshWeaponRowStats(index);
    });

    weaponCell.appendChild(select);
    row.appendChild(weaponCell);

    // Damage cell
    const damageCell = document.createElement('div');
    damageCell.style.cssText =
      'display:table-cell; vertical-align:middle; padding:6px 8px;' +
      'font-family:var(--font-mono); font-size:12px; color:var(--color-text);';
    damageCell.className = 'ds-weapon-damage';
    damageCell.dataset['idx'] = String(index);
    damageCell.textContent = '—';
    row.appendChild(damageCell);

    // Arc cell
    const arcCell = document.createElement('div');
    arcCell.style.cssText =
      'display:table-cell; vertical-align:middle; padding:6px 8px;' +
      'font-family:var(--font-mono); font-size:12px; color:var(--color-text-dim);';
    arcCell.textContent = '360°';
    row.appendChild(arcCell);

    return row;
  }

  // ── Specials panel ─────────────────────────────────────────────────────────

  private buildSpecialsPanel(): [HTMLElement, HTMLElement[]] {
    const panel = this.makePanel();
    panel.style.cssText += 'flex:1; min-width:260px;';

    const title = document.createElement('div');
    title.textContent = 'SPECIAL EQUIPMENT';
    title.style.cssText =
      'font-family:var(--font-mono); font-size:12px; color:var(--color-accent);' +
      'text-transform:uppercase; letter-spacing:2px; margin-bottom:10px;';
    panel.appendChild(title);

    const rows: HTMLElement[] = [];
    for (let i = 0; i < 3; i++) {
      const row = this.buildSpecialRow(i);
      rows.push(row);
      panel.appendChild(row);
    }

    return [panel, rows];
  }

  private buildSpecialRow(index: number): HTMLElement {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center; gap:8px; margin-bottom:8px;';

    const slotLabel = document.createElement('span');
    slotLabel.textContent = `${index + 1}.`;
    slotLabel.style.cssText =
      'font-family:var(--font-mono); font-size:12px; color:var(--color-text-dim); min-width:16px;';
    row.appendChild(slotLabel);

    const select = document.createElement('select');
    select.className = 'ds-special-select';
    select.dataset['idx'] = String(index);
    this.styleSelect(select);
    select.style.flex = '1';
    select.addEventListener('change', () => {
      this.working.specialSlots[index] = select.value || null;
      this.updateStats();
    });

    row.appendChild(select);
    return row;
  }

  // ── Ship preview panel ─────────────────────────────────────────────────────

  private buildPreviewPanel(): HTMLElement {
    const panel = this.makePanel();
    panel.style.cssText += 'flex:1; min-width:200px; align-items:center; justify-content:center; text-align:center;';

    const title = document.createElement('div');
    title.textContent = 'SHIP PREVIEW';
    title.style.cssText =
      'font-family:var(--font-mono); font-size:12px; color:var(--color-accent);' +
      'text-transform:uppercase; letter-spacing:2px; margin-bottom:12px;';
    panel.appendChild(title);

    // Placeholder ship icon — ASCII art
    const shipArt = document.createElement('pre');
    shipArt.id = 'ds-ship-art';
    shipArt.style.cssText =
      'font-family:var(--font-mono); font-size:11px; color:var(--color-accent);' +
      'line-height:1.4; margin:0 0 12px; text-align:center;';
    shipArt.textContent = this.getShipArt('small');
    panel.appendChild(shipArt);

    const styleRow = document.createElement('div');
    styleRow.style.cssText =
      'font-family:var(--font-mono); font-size:11px; color:var(--color-text-dim);';
    styleRow.textContent = '[ cosmetic — no effect ]';
    panel.appendChild(styleRow);

    return panel;
  }

  // ── Stats + action bar ─────────────────────────────────────────────────────

  private buildStatsBar(): HTMLElement {
    const bar = document.createElement('div');
    bar.style.cssText =
      'background:var(--color-bg-panel); border-top:2px solid var(--color-border);' +
      'padding:10px 16px; flex-shrink:0;';

    // Row 1: name input + design cycle
    const nameRow = document.createElement('div');
    nameRow.style.cssText = 'display:flex; align-items:center; gap:12px; margin-bottom:10px;';

    const nameLabel = document.createElement('span');
    nameLabel.textContent = 'Name:';
    nameLabel.style.cssText =
      'font-family:var(--font-mono); font-size:13px; color:var(--color-text-dim);';
    nameRow.appendChild(nameLabel);

    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.maxLength = 24;
    this.nameInput.style.cssText =
      'background:var(--color-bg); border:1px solid var(--color-border); color:var(--color-text);' +
      'font-family:var(--font-mono); font-size:13px; padding:4px 8px; width:180px;' +
      'text-transform:uppercase;';
    this.nameInput.addEventListener('input', () => {
      this.working.name = this.nameInput.value.toUpperCase() || 'NEW DESIGN';
    });
    nameRow.appendChild(this.nameInput);

    // Load prev/next buttons
    this.prevBtn = document.createElement('button');
    this.prevBtn.textContent = '◄';
    this.styleBtn(this.prevBtn);
    this.prevBtn.title = 'Previous design';
    this.prevBtn.addEventListener('click', () => this.cycleDesign(-1));
    nameRow.appendChild(this.prevBtn);

    this.nextBtn = document.createElement('button');
    this.nextBtn.textContent = '►';
    this.styleBtn(this.nextBtn);
    this.nextBtn.title = 'Next design';
    this.nextBtn.addEventListener('click', () => this.cycleDesign(+1));
    nameRow.appendChild(this.nextBtn);

    const newBtn = document.createElement('button');
    newBtn.textContent = 'NEW';
    this.styleBtn(newBtn);
    newBtn.title = 'Start a new design';
    newBtn.addEventListener('click', () => this.startNew());
    nameRow.appendChild(newBtn);

    bar.appendChild(nameRow);

    // Row 2: stats + buttons
    const bottomRow = document.createElement('div');
    bottomRow.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;';

    const statsArea = document.createElement('div');
    statsArea.id = 'ds-stats-area';
    statsArea.style.cssText =
      'font-family:var(--font-mono); font-size:13px; color:var(--color-text); display:flex; gap:24px;';
    bottomRow.appendChild(statsArea);

    const btnArea = document.createElement('div');
    btnArea.style.cssText = 'display:flex; gap:8px; align-items:center;';

    this.deleteBtn = document.createElement('button');
    this.deleteBtn.textContent = 'DELETE';
    this.styleBtn(this.deleteBtn, 'danger');
    this.deleteBtn.addEventListener('click', () => this.deleteDesign());
    btnArea.appendChild(this.deleteBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'CANCEL';
    this.styleBtn(cancelBtn);
    cancelBtn.addEventListener('click', () => this.cancel());
    btnArea.appendChild(cancelBtn);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'CLEAR';
    this.styleBtn(clearBtn);
    clearBtn.addEventListener('click', () => this.clearDesign());
    btnArea.appendChild(clearBtn);

    const buildBtn = document.createElement('button');
    buildBtn.textContent = 'BUILD';
    this.styleBtn(buildBtn, 'primary');
    buildBtn.addEventListener('click', () => this.saveDesign());
    btnArea.appendChild(buildBtn);

    bottomRow.appendChild(btnArea);
    bar.appendChild(bottomRow);

    return bar;
  }

  // ── Dynamic content refresh ────────────────────────────────────────────────

  private refreshDynamicContent(state: GameState): void {
    const empire = this.getPlayerEmpire(state);
    const techs = empire?.research.completedTechs ?? [];

    this.populateWeaponDropdowns(techs);
    this.populateSpecialDropdowns(techs);
    this.renderSystems(state);
    this.updateStats();
    this.syncFormToWorking();
    this.updateDeleteButton(state);
    this.updateCycleButtons(state);
    this.updateShipArt();
  }

  private syncFormToWorking(): void {
    // Hull radio
    for (const radio of this.hullRadios) {
      radio.checked = radio.value === this.working.hullSize;
    }

    // Name
    this.nameInput.value = this.working.name;

    // Weapon dropdowns
    for (let i = 0; i < 4; i++) {
      const slot = this.working.weaponSlots[i];
      const select = this.weaponRows[i]?.querySelector('.ds-weapon-select') as HTMLSelectElement | null;
      if (select) {
        select.value = slot.componentId ?? '';
      }
      const countSpan = this.weaponRows[i]?.querySelector('.ds-weapon-count') as HTMLElement | null;
      if (countSpan) {
        countSpan.textContent = slot.componentId ? String(slot.count) : '—';
      }
      this.refreshWeaponRowStats(i);
    }

    // Special dropdowns
    for (let i = 0; i < 3; i++) {
      const select = this.specialRows[i]?.querySelector('.ds-special-select') as HTMLSelectElement | null;
      if (select) {
        select.value = this.working.specialSlots[i] ?? '';
      }
    }
  }

  private populateWeaponDropdowns(techs: string[]): void {
    const available = this.getAvailableComponents('weapon', techs)
      .filter((c) => c.subtype !== 'ground'); // ground weapons don't go in ship weapon slots

    for (let i = 0; i < 4; i++) {
      const select = this.weaponRows[i]?.querySelector('.ds-weapon-select') as HTMLSelectElement | null;
      if (!select) continue;

      const current = select.value;
      select.innerHTML = '<option value="">(empty)</option>';
      for (const c of available) {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name} (size ${c.size})`;
        select.appendChild(opt);
      }
      // Restore selection if still available
      if (current && available.some((c) => c.id === current)) {
        select.value = current;
      } else if (current) {
        // No longer available — clear slot
        this.working.weaponSlots[i].componentId = null;
        this.working.weaponSlots[i].count = 1;
        select.value = '';
      }
    }
  }

  private populateSpecialDropdowns(techs: string[]): void {
    const available = this.getAvailableComponents('special', techs)
      .filter((c) => c.size > 0); // only ship-mounted specials (not ground troops gear, planet shields)

    for (let i = 0; i < 3; i++) {
      const select = this.specialRows[i]?.querySelector('.ds-special-select') as HTMLSelectElement | null;
      if (!select) continue;

      const current = select.value;
      select.innerHTML = '<option value="">(empty)</option>';

      // Also add fuel components that use space (reserve tanks, etc.)
      const fuelWithSpace = this.getAvailableComponents('fuel', techs).filter((c) => c.size > 0);

      for (const c of [...available, ...fuelWithSpace]) {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name} (size ${c.size})`;
        select.appendChild(opt);
      }

      if (current && [...available, ...fuelWithSpace].some((c) => c.id === current)) {
        select.value = current;
      } else if (current) {
        this.working.specialSlots[i] = null;
        select.value = '';
      }
    }
  }

  // ── Stats calculation + display ────────────────────────────────────────────

  private updateStats(): void {
    const components = this.buildDesignComponents();
    const designInput = {
      hullSize: this.working.hullSize,
      components,
    };

    const hull = HULL_SPECS[this.working.hullSize];
    const validation = validateDesign(designInput, []);
    const cost = calculateDesignCost(designInput);

    const statsArea = this.container.querySelector('#ds-stats-area') as HTMLElement | null;
    if (statsArea) {
      statsArea.innerHTML = '';

      this.addStat(statsArea, 'Hull', HULL_LABELS[this.working.hullSize]);
      this.addStat(statsArea, 'Cost', `${cost} BC`);
      this.addStat(statsArea, 'Total Space', String(hull.space));

      const remaining = validation.spaceRemaining;
      const remainStat = this.addStat(statsArea, 'Available', String(remaining));
      if (remaining < 0) {
        remainStat.style.color = 'var(--color-danger)';
      }
    }

    // Update errors
    if (validation.errors.length > 0) {
      this.errorBox.style.display = 'block';
      this.errorBox.textContent = validation.errors.join(' | ');
    } else {
      this.errorBox.style.display = 'none';
    }
  }

  private addStat(container: HTMLElement, label: string, value: string): HTMLElement {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; flex-direction:column; gap:2px;';

    const lbl = document.createElement('span');
    lbl.textContent = label;
    lbl.style.cssText = 'font-size:10px; color:var(--color-text-dim); text-transform:uppercase; letter-spacing:1px;';

    const val = document.createElement('span');
    val.textContent = value;
    val.style.cssText = 'font-size:14px; color:var(--color-text); font-weight:bold;';

    div.appendChild(lbl);
    div.appendChild(val);
    container.appendChild(div);
    return val;
  }

  private refreshWeaponRowStats(index: number): void {
    const slot = this.working.weaponSlots[index];
    const damageCell = this.weaponRows[index]?.querySelector('.ds-weapon-damage') as HTMLElement | null;
    const countSpan = this.weaponRows[index]?.querySelector('.ds-weapon-count') as HTMLElement | null;

    if (!slot.componentId) {
      if (damageCell) damageCell.textContent = '—';
      if (countSpan) countSpan.textContent = '—';
      return;
    }

    const comp = getComponent(slot.componentId);
    if (!comp) return;

    if (countSpan) countSpan.textContent = String(slot.count);

    if (damageCell) {
      const eff = comp.effect as Record<string, number | undefined>;
      if (eff['damageMin'] !== undefined && eff['damageMax'] !== undefined) {
        damageCell.textContent = `${eff['damageMin']}-${eff['damageMax']}`;
      } else if (eff['damage'] !== undefined) {
        damageCell.textContent = String(eff['damage']);
      } else {
        damageCell.textContent = '—';
      }
    }
  }

  // ── Weapon count adjustment ───────────────────────────────────────────────

  private adjustWeaponCount(index: number, delta: number): void {
    const slot = this.working.weaponSlots[index];
    if (!slot.componentId) return;

    const newCount = Math.max(1, slot.count + delta);
    slot.count = newCount;
    this.updateStats();
    this.refreshWeaponRowStats(index);
  }

  // ── Space clamping ────────────────────────────────────────────────────────

  /** When hull changes to smaller size, remove components that no longer fit. */
  private clampWeaponsToHull(): void {
    const hull = HULL_SPECS[this.working.hullSize];
    let used = 0;

    // Process weapons
    for (const slot of this.working.weaponSlots) {
      if (!slot.componentId) continue;
      const comp = getComponent(slot.componentId);
      if (!comp) continue;
      const slotSpace = comp.size * slot.count;
      if (used + slotSpace > hull.space) {
        slot.componentId = null;
        slot.count = 1;
      } else {
        used += slotSpace;
      }
    }

    // Process specials
    for (let i = 0; i < 3; i++) {
      const id = this.working.specialSlots[i];
      if (!id) continue;
      const comp = getComponent(id);
      if (!comp) continue;
      if (used + comp.size > hull.space) {
        this.working.specialSlots[i] = null;
      } else {
        used += comp.size;
      }
    }

    this.syncFormToWorking();
  }

  // ── Save / load / delete ───────────────────────────────────────────────────

  private saveDesign(): void {
    const state = this.store.getState();
    const empire = this.getPlayerEmpire(state);
    if (!empire) {
      this.showError('No player empire found — start a game first.');
      return;
    }

    const components = this.buildDesignComponents();
    const designInput = { hullSize: this.working.hullSize, components };
    const validation = validateDesign(designInput, empire.research.completedTechs);

    if (!validation.valid) {
      this.showError(validation.errors.join('\n'));
      return;
    }

    const id = this.editingId ?? `design_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const cost = calculateDesignCost(designInput);
    const hull = HULL_SPECS[this.working.hullSize];

    // Build ShipComponent[] from working slots
    const shipComponents: ShipComponent[] = [];
    for (const slot of this.working.weaponSlots) {
      if (!slot.componentId) continue;
      const comp = getComponent(slot.componentId);
      if (!comp) continue;
      shipComponents.push({
        id: comp.id,
        type: 'weapon',
        name: comp.name,
        space: comp.size,
        baseCost: comp.cost,
        count: slot.count,
      });
    }
    for (const specialId of this.working.specialSlots) {
      if (!specialId) continue;
      const comp = getComponent(specialId);
      if (!comp) continue;
      shipComponents.push({
        id: comp.id,
        type: 'special',
        name: comp.name,
        space: comp.size,
        baseCost: comp.cost,
        count: 1,
      });
    }

    const stats: ShipDesignStats = {
      cost,
      maintenance: Math.floor(cost * 0.02),
      hp: this.calcHp(empire.research.completedTechs),
      shieldHp: this.calcShieldHp(empire.research.completedTechs),
      speed: this.bestEngineSpeed(empire.research.completedTechs),
      range: this.bestRange(empire.research.completedTechs),
      weapons: [],
      defense: { armor: 0, shields: 0, ecm: 0 },
      special: [],
    };

    const design: ShipDesign = {
      id,
      name: this.working.name || 'UNNAMED',
      class: this.working.hullSize,
      ownerId: empire.id as EmpireId,
      size: hull.space,
      spaceUsed: validation.spaceUsed,
      spaceFree: validation.spaceRemaining,
      components: shipComponents,
      stats,
      miniaturization: {},
      isObsolete: false,
      shipsBuilt: 0,
    };

    this.store.dispatch({ type: 'ADD_SHIP_DESIGN', payload: { design } });
    this.editingId = id;
    this.hideError();
    this.updateDeleteButton(this.store.getState());
    this.updateCycleButtons(this.store.getState());
  }

  private deleteDesign(): void {
    if (!this.editingId) return;
    const confirmed = window.confirm(`Delete design "${this.working.name}"?`);
    if (!confirmed) return;

    this.store.dispatch({ type: 'DELETE_SHIP_DESIGN', payload: { designId: this.editingId } });
    this.startNew();
  }

  private clearDesign(): void {
    const hull = this.working.hullSize;
    const name = this.working.name;
    this.working = emptyWorking();
    this.working.hullSize = hull;
    this.working.name = name;
    this.syncFormToWorking();
    this.updateStats();
  }

  private startNew(): void {
    this.editingId = null;
    this.working = emptyWorking();
    this.syncFormToWorking();
    this.updateStats();
    this.updateDeleteButton(this.store.getState());
    const state = this.store.getState();
    const allIds = state.shipDesigns.allIds;
    this.cycleIndex = allIds.length; // points past the end → "new"
    this.updateCycleButtons(state);
  }

  private cycleDesign(delta: number): void {
    const state = this.store.getState();
    const empire = this.getPlayerEmpire(state);
    if (!empire) return;

    const allIds = empire.shipDesigns;
    if (allIds.length === 0) return;

    this.cycleIndex = (this.cycleIndex + delta + allIds.length) % allIds.length;
    const id = allIds[this.cycleIndex];
    if (!id) return;

    const design = state.shipDesigns.byId[id];
    if (!design) return;

    this.loadDesign(design);
  }

  private loadDesign(design: ShipDesign): void {
    this.editingId = design.id;
    this.working.name = design.name;
    this.working.hullSize = design.class;

    // Clear all slots
    this.working.weaponSlots = [emptyWeaponSlot(), emptyWeaponSlot(), emptyWeaponSlot(), emptyWeaponSlot()];
    this.working.specialSlots = [null, null, null];

    let wIdx = 0;
    let sIdx = 0;

    for (const comp of design.components) {
      if (comp.type === 'weapon' && wIdx < 4) {
        this.working.weaponSlots[wIdx] = { componentId: comp.id, count: comp.count };
        wIdx++;
      } else if ((comp.type === 'special' || comp.type === 'fuel') && sIdx < 3) {
        this.working.specialSlots[sIdx] = comp.id;
        sIdx++;
      }
    }

    this.syncFormToWorking();
    this.updateStats();
    this.updateDeleteButton(this.store.getState());
    this.updateShipArt();
  }

  private cancel(): void {
    // Navigate back to galaxy
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
  }

  // ── Helper: build DesignComponent[] for shipDesign.ts functions ────────────

  private buildDesignComponents(): DesignComponent[] {
    const comps: DesignComponent[] = [];

    for (const slot of this.working.weaponSlots) {
      if (slot.componentId) {
        comps.push({ componentId: slot.componentId, count: slot.count });
      }
    }

    for (const id of this.working.specialSlots) {
      if (id) {
        comps.push({ componentId: id, count: 1 });
      }
    }

    return comps;
  }

  // ── Helper: available components from data ─────────────────────────────────

  private getAvailableComponents(
    category: string,
    techs: string[],
  ): ComponentData[] {
    const techSet = new Set(techs);
    return ALL_COMPONENTS.filter((c) => {
      if (c.category !== category) return false;
      if (c.startingTech) return true;
      if (c.techLevel === 1) return true;
      return techSet.has(c.id);
    });
  }

  // ── Helper: auto-assigned system labels ───────────────────────────────────

  private bestSystemLabel(category: string, techs: string[]): string {
    const available = this.getAvailableComponents(category, techs);
    if (available.length === 0) return '(none)';
    const best = available.reduce((a, b) => (b.techLevel > a.techLevel ? b : a));
    return best.name;
  }

  private bestECMLabel(techs: string[]): string {
    const available = this.getAvailableComponents('computer', techs)
      .filter((c) => c.id.startsWith('ecm'));
    if (available.length === 0) return '(none)';
    const best = available.reduce((a, b) => (b.techLevel > a.techLevel ? b : a));
    const eff = best.effect as Record<string, number | undefined>;
    const def = eff['missileDefense'];
    return def !== undefined ? `${best.name}  Missile Def: ${def}` : best.name;
  }

  private bestManeuverLabel(category: string, techs: string[]): string {
    const available = this.getAvailableComponents(category, techs);
    if (available.length === 0) return '(none)';
    const best = available.reduce((a, b) => (b.techLevel > a.techLevel ? b : a));
    const eff = best.effect as Record<string, number | undefined>;
    const spd = eff['combatSpeed'];
    return spd !== undefined ? `Combat Spd ${spd}` : best.name;
  }

  private bestEngineSpeed(techs: string[]): number {
    const available = this.getAvailableComponents('engine', techs);
    if (available.length === 0) return 1;
    const best = available.reduce((a, b) => (b.techLevel > a.techLevel ? b : a));
    const eff = best.effect as Record<string, number | undefined>;
    return eff['warpSpeed'] ?? 1;
  }

  private bestRange(techs: string[]): number {
    const available = this.getAvailableComponents('fuel', techs);
    if (available.length === 0) return 3;
    const best = available.reduce((a, b) => (b.techLevel > a.techLevel ? b : a));
    const eff = best.effect as Record<string, number | null | undefined>;
    return eff['range'] ?? 3;
  }

  private calcHp(techs: string[]): number {
    const available = this.getAvailableComponents('armor', techs);
    if (available.length === 0) return 1;
    const best = available.reduce((a, b) => (b.techLevel > a.techLevel ? b : a));
    const eff = best.effect as Record<string, number | undefined>;
    return Math.round((eff['hpMultiplier'] ?? 1) * HULL_SPECS[this.working.hullSize].baseHp);
  }

  private calcShieldHp(techs: string[]): number {
    const available = this.getAvailableComponents('shield', techs);
    if (available.length === 0) return 0;
    const best = available.reduce((a, b) => (b.techLevel > a.techLevel ? b : a));
    const eff = best.effect as Record<string, number | undefined>;
    return eff['damageAbsorption'] ?? 0;
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────

  private makePanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.style.cssText =
      'background:var(--color-bg-panel); border:1px solid var(--color-border);' +
      'border-radius:4px; padding:12px 16px; display:flex; flex-direction:column;';
    return panel;
  }

  private styleBtn(btn: HTMLButtonElement, variant: 'default' | 'primary' | 'danger' = 'default'): void {
    const base =
      'font-family:var(--font-mono); font-size:12px; padding:6px 14px; cursor:pointer;' +
      'border-radius:2px; text-transform:uppercase; letter-spacing:1px; border:1px solid;';
    if (variant === 'primary') {
      btn.style.cssText = base + 'background:var(--color-accent-dim); border-color:var(--color-accent); color:#fff;';
    } else if (variant === 'danger') {
      btn.style.cssText = base + 'background:#2a0000; border-color:var(--color-danger); color:var(--color-danger);';
    } else {
      btn.style.cssText = base + 'background:var(--color-bg); border-color:var(--color-border); color:var(--color-text);';
    }
    btn.addEventListener('mouseenter', () => {
      btn.style.opacity = '0.8';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.opacity = '1';
    });
  }

  private styleSmallBtn(btn: HTMLButtonElement): void {
    btn.style.cssText =
      'background:var(--color-bg); border:1px solid var(--color-border); color:var(--color-text);' +
      'font-family:var(--font-mono); font-size:13px; width:22px; height:22px; cursor:pointer;' +
      'padding:0; text-align:center; line-height:1;';
  }

  private styleSelect(select: HTMLSelectElement): void {
    select.style.cssText =
      'background:var(--color-bg); border:1px solid var(--color-border); color:var(--color-text);' +
      'font-family:var(--font-mono); font-size:12px; padding:4px 8px; cursor:pointer; width:100%;';
  }

  private updateDeleteButton(_state: GameState): void {
    this.deleteBtn.disabled = this.editingId === null;
    this.deleteBtn.style.opacity = this.editingId ? '1' : '0.4';
  }

  private updateCycleButtons(state: GameState): void {
    const empire = this.getPlayerEmpire(state);
    const count = empire?.shipDesigns.length ?? 0;
    const hasDesigns = count > 0;
    this.prevBtn.disabled = !hasDesigns;
    this.nextBtn.disabled = !hasDesigns;
    this.prevBtn.style.opacity = hasDesigns ? '1' : '0.4';
    this.nextBtn.style.opacity = hasDesigns ? '1' : '0.4';
  }

  private showError(msg: string): void {
    this.errorBox.style.display = 'block';
    this.errorBox.textContent = msg;
  }

  private hideError(): void {
    this.errorBox.style.display = 'none';
  }

  private getPlayerEmpire(state: GameState) {
    const pid = state.empires.playerId;
    return state.empires.byId[pid] ?? null;
  }

  private updateShipArt(): void {
    const art = this.container.querySelector('#ds-ship-art') as HTMLPreElement | null;
    if (art) art.textContent = this.getShipArt(this.working.hullSize);
  }

  private getShipArt(hull: ShipClass): string {
    const arts: Record<ShipClass, string> = {
      small: [
        '   /\\   ',
        '  /  \\  ',
        ' / == \\ ',
        '/______\\',
        ' |    | ',
      ].join('\n'),
      medium: [
        '   /\\   ',
        '  /  \\  ',
        ' /====\\ ',
        '/  ==  \\',
        '|  []  |',
        '\\______/',
      ].join('\n'),
      large: [
        '    /\\    ',
        '   /  \\   ',
        '  /====\\  ',
        ' / \\__/ \\ ',
        '/   ==   \\',
        '|  [  ]  |',
        '|___  ___|',
        '    \\/    ',
      ].join('\n'),
      huge: [
        '     /\\     ',
        '    /  \\    ',
        '   /====\\   ',
        '  / \\__/ \\  ',
        ' /  /  \\  \\ ',
        '/  / == \\  \\',
        '| |  []  | |',
        '| |______| |',
        '\\___\\  /___/',
        '     \\/     ',
      ].join('\n'),
    };
    return arts[hull] ?? arts['small'];
  }

}
