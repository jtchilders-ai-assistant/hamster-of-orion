/**
 * Research / Technology screen — F4 / TECH button.
 * src/ui/screens/ResearchScreen.ts
 *
 * Full MOO1-accurate research screen:
 *  - Left panel: 6 tech fields, current research, progress bar, RP allocation
 *  - Right panel: tech tree browser (all techs in selected field, by level)
 *  - Bottom: tech description panel + total RP + OK button
 *
 * Corresponds to design/ui-ux/wireframes/research-tree.md.
 *
 * DOM-only — all game logic delegated to src/game/systems/research.ts.
 */

import { Store } from '../../game/store';
import { GameState, TechField } from '../../game/state';
import {
  ResearchField,
  ALL_RESEARCH_FIELDS,
  EmpireFieldResearch,
  createDefaultFieldResearch,
  createEvenAllocation,
} from '../../game/systems/research';
import techTreeRaw from '../../data/tech-tree.json';

// ── Tech tree data types ──────────────────────────────────────────────────────

interface TechEntry {
  id: string;
  name: string;
  field: string;
  tier: number;
  cost: number;
  unlocks: string[];
  description: string;
}

interface TechTreeData {
  technologies: TechEntry[];
}

const TECH_DATA = (techTreeRaw as TechTreeData).technologies;

// ── Field display metadata ────────────────────────────────────────────────────

/**
 * Maps ResearchField keys to the MOO1 display label and the TechField used in
 * state.ts availableTechs. The data uses 'weapons' in tech-tree.json but
 * state.ts TechField uses 'weapons' too — only the 6th field differs
 * ('biotechnology' in state.ts vs 'planetology' in research.ts / JSON).
 */
interface FieldMeta {
  label: string;        // MOO1 uppercase display name
  stateKey: TechField;  // Key in ResearchState.availableTechs
  jsonField: string;    // Field string in tech-tree.json
}

const FIELD_META: Record<ResearchField, FieldMeta> = {
  computers:   { label: 'COMPUTERS',    stateKey: 'computers',   jsonField: 'computers'   },
  construction:{ label: 'CONSTRUCTION', stateKey: 'construction',jsonField: 'construction' },
  force_fields:{ label: 'FORCE FIELDS', stateKey: 'force_fields',jsonField: 'force_fields' },
  planetology: { label: 'PLANETOLOGY',  stateKey: 'biotechnology',jsonField: 'planetology' },
  propulsion:  { label: 'PROPULSION',   stateKey: 'propulsion',  jsonField: 'propulsion'  },
  weapons:     { label: 'WEAPONRY',     stateKey: 'weapons',     jsonField: 'weapons'     },
};

// ── Working RP allocation state ───────────────────────────────────────────────

/** Working RP allocation percentages (integer, must sum to 100). */
type WorkingAllocation = Record<ResearchField, number>;

function defaultAllocation(): WorkingAllocation {
  const even = createEvenAllocation();
  // Round to integers summing to 100
  const result = {} as WorkingAllocation;
  let remaining = 100;
  for (let i = 0; i < ALL_RESEARCH_FIELDS.length; i++) {
    const field = ALL_RESEARCH_FIELDS[i];
    if (i === ALL_RESEARCH_FIELDS.length - 1) {
      result[field] = remaining;
    } else {
      result[field] = Math.round(even[field]);
      remaining -= result[field];
    }
  }
  return result;
}

// ── Helper: get all techs in a field grouped by tier ─────────────────────────

function getTechsByField(jsonField: string): Map<number, TechEntry[]> {
  const byTier = new Map<number, TechEntry[]>();
  for (const tech of TECH_DATA) {
    if (tech.field !== jsonField) continue;
    const existing = byTier.get(tech.tier) ?? [];
    existing.push(tech);
    byTier.set(tech.tier, existing);
  }
  return byTier;
}

// ── ResearchScreen ────────────────────────────────────────────────────────────

export class ResearchScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  /** Currently selected field (for right panel tech tree). */
  private selectedField: ResearchField = 'computers';

  /** Currently hovered/clicked tech for the description panel. */
  private selectedTechId: string | null = null;

  /** Working RP allocation (may differ from state until OK is pressed). */
  private allocation: WorkingAllocation = defaultAllocation();

  /** Cached field research state (derived from store on render). */
  private fieldResearch: EmpireFieldResearch = createDefaultFieldResearch();

  // DOM references
  private fieldRows: Map<ResearchField, HTMLElement> = new Map();
  private fieldPctLabels: Map<ResearchField, HTMLElement> = new Map();
  private fieldProgressBars: Map<ResearchField, HTMLElement> = new Map();
  private fieldProgressLabels: Map<ResearchField, HTMLElement> = new Map();
  private fieldCurrentTechLabels: Map<ResearchField, HTMLElement> = new Map();
  private rightTitle!: HTMLElement;
  private rightTechList!: HTMLElement;
  private descName!: HTMLElement;
  private descBody!: HTMLElement;
  private totalRPLabel!: HTMLElement;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.buildLayout();
  }

  // ── Public interface ────────────────────────────────────────────────────────

  show(): void {
    this.container.classList.add('active');
    this.container.style.display = 'flex';
    // Sync allocation from state on show
    const state = this.store.getState();
    this.syncAllocationFromState(state);
    this.render(state);
  }

  hide(): void {
    this.container.classList.remove('active');
    this.container.style.display = 'none';
  }

  render(state: GameState): void {
    this.syncFieldResearchFromState(state);
    this.renderFieldList(state);
    this.renderTechTree(state);
    this.renderTotalRP(state);
  }

  // ── Layout construction ──────────────────────────────────────────────────────

  private buildLayout(): void {
    this.container.innerHTML = '';
    this.container.style.cssText =
      'display:none; flex-direction:column; height:100%; overflow:hidden;' +
      'background:var(--color-bg); font-family:var(--font-mono);';

    // ── Header ────────────────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.style.cssText =
      'text-align:center; padding:12px 0 8px; flex-shrink:0;' +
      'border-bottom:2px solid var(--color-border);';
    header.innerHTML =
      `<h1 style="font-size:18px;letter-spacing:4px;color:var(--color-accent);` +
      `text-transform:uppercase;margin:0">R E S E A R C H</h1>`;
    this.container.appendChild(header);

    // ── Main body (left + right) ──────────────────────────────────────────────
    const body = document.createElement('div');
    body.style.cssText = 'flex:1; display:flex; gap:0; overflow:hidden; min-height:0;';
    this.container.appendChild(body);

    body.appendChild(this.buildLeftPanel());
    body.appendChild(this.buildRightPanel());

    // ── Bottom section ────────────────────────────────────────────────────────
    this.container.appendChild(this.buildBottomSection());
  }

  // ── Left panel: field rows + RP sliders ──────────────────────────────────────

  private buildLeftPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.style.cssText =
      'width:38%; min-width:260px; flex-shrink:0; display:flex; flex-direction:column;' +
      'border-right:2px solid var(--color-border); overflow-y:auto;';

    for (const field of ALL_RESEARCH_FIELDS) {
      const row = this.buildFieldRow(field);
      this.fieldRows.set(field, row);
      panel.appendChild(row);
    }

    return panel;
  }

  private buildFieldRow(field: ResearchField): HTMLElement {
    const meta = FIELD_META[field];
    const row = document.createElement('div');
    row.style.cssText =
      'padding:10px 14px; border-bottom:1px solid var(--color-border);' +
      'cursor:pointer; user-select:none; transition:background 0.1s;';

    row.addEventListener('click', () => {
      this.selectedField = field;
      this.highlightFieldRow(field);
      const state = this.store.getState();
      this.renderTechTree(state);
    });

    row.addEventListener('mouseenter', () => {
      if (field !== this.selectedField) {
        row.style.background = 'rgba(255,255,255,0.04)';
      }
    });
    row.addEventListener('mouseleave', () => {
      if (field !== this.selectedField) {
        row.style.background = '';
      }
    });

    // ── Row top: label + RP% ─────────────────────────────────────────────────
    const topRow = document.createElement('div');
    topRow.style.cssText =
      'display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;';

    const labelEl = document.createElement('span');
    labelEl.textContent = meta.label;
    labelEl.style.cssText =
      'font-size:12px; letter-spacing:1px; color:var(--color-accent); text-transform:uppercase;';

    const pctWrapper = document.createElement('div');
    pctWrapper.style.cssText =
      'display:flex; align-items:center; gap:4px;';

    const decBtn = document.createElement('button');
    decBtn.textContent = '−';
    decBtn.title = 'Decrease allocation';
    this.styleAllocBtn(decBtn);
    decBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.adjustAllocation(field, -5);
    });

    const pctLabel = document.createElement('span');
    pctLabel.style.cssText =
      'font-size:13px; color:var(--color-text); min-width:36px; text-align:right;';
    pctLabel.textContent = `${this.allocation[field]}%`;
    this.fieldPctLabels.set(field, pctLabel);

    const incBtn = document.createElement('button');
    incBtn.textContent = '+';
    incBtn.title = 'Increase allocation';
    this.styleAllocBtn(incBtn);
    incBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.adjustAllocation(field, +5);
    });

    pctWrapper.appendChild(decBtn);
    pctWrapper.appendChild(pctLabel);
    pctWrapper.appendChild(incBtn);

    topRow.appendChild(labelEl);
    topRow.appendChild(pctWrapper);
    row.appendChild(topRow);

    // ── Current tech label ───────────────────────────────────────────────────
    const currentTechLabel = document.createElement('div');
    currentTechLabel.style.cssText =
      'font-size:12px; color:var(--color-text); margin-bottom:5px;' +
      'white-space:nowrap; overflow:hidden; text-overflow:ellipsis;';
    currentTechLabel.textContent = '—';
    this.fieldCurrentTechLabels.set(field, currentTechLabel);
    row.appendChild(currentTechLabel);

    // ── Progress bar + ETA ───────────────────────────────────────────────────
    const progressRow = document.createElement('div');
    progressRow.style.cssText = 'display:flex; align-items:center; gap:8px;';

    const barTrack = document.createElement('div');
    barTrack.style.cssText =
      'flex:1; height:8px; background:rgba(255,255,255,0.1);' +
      'border:1px solid var(--color-border); border-radius:2px; overflow:hidden;';

    const barFill = document.createElement('div');
    barFill.style.cssText =
      'height:100%; width:0%; background:var(--color-accent); transition:width 0.3s;';
    barTrack.appendChild(barFill);
    this.fieldProgressBars.set(field, barFill);

    const etaLabel = document.createElement('span');
    etaLabel.style.cssText =
      'font-size:11px; color:var(--color-text-dim); white-space:nowrap; min-width:60px; text-align:right;';
    etaLabel.textContent = '';
    this.fieldProgressLabels.set(field, etaLabel);

    progressRow.appendChild(barTrack);
    progressRow.appendChild(etaLabel);
    row.appendChild(progressRow);

    return row;
  }

  // ── Right panel: tech tree browser ───────────────────────────────────────────

  private buildRightPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.style.cssText =
      'flex:1; display:flex; flex-direction:column; overflow:hidden;';

    this.rightTitle = document.createElement('div');
    this.rightTitle.style.cssText =
      'padding:10px 16px 6px; font-size:14px; letter-spacing:2px; color:var(--color-accent);' +
      'text-transform:uppercase; flex-shrink:0; border-bottom:1px solid var(--color-border);';
    this.rightTitle.textContent = 'COMPUTERS';
    panel.appendChild(this.rightTitle);

    this.rightTechList = document.createElement('div');
    this.rightTechList.style.cssText =
      'flex:1; overflow-y:auto; padding:8px 0;';
    panel.appendChild(this.rightTechList);

    return panel;
  }

  // ── Bottom section: description + summary ────────────────────────────────────

  private buildBottomSection(): HTMLElement {
    const bottom = document.createElement('div');
    bottom.style.cssText =
      'display:flex; gap:0; flex-shrink:0; border-top:2px solid var(--color-border);' +
      'min-height:120px; max-height:160px;';

    // Description panel (80% width)
    const descPanel = document.createElement('div');
    descPanel.style.cssText =
      'flex:4; padding:12px 16px; border-right:2px solid var(--color-border); overflow:hidden;';

    this.descName = document.createElement('div');
    this.descName.style.cssText =
      'font-size:14px; color:var(--color-accent); letter-spacing:1px; margin-bottom:6px;' +
      'padding-bottom:4px; border-bottom:1px solid var(--color-border);';
    this.descName.textContent = 'Select a technology to view details';

    this.descBody = document.createElement('div');
    this.descBody.style.cssText =
      'font-size:12px; color:var(--color-text); line-height:1.5; overflow:hidden;';
    this.descBody.textContent = '';

    descPanel.appendChild(this.descName);
    descPanel.appendChild(this.descBody);

    // Summary panel (20% width)
    const summaryPanel = document.createElement('div');
    summaryPanel.style.cssText =
      'flex:1; padding:12px 14px; display:flex; flex-direction:column;' +
      'align-items:center; justify-content:space-between; min-width:130px;';

    const rpSection = document.createElement('div');
    rpSection.style.cssText = 'text-align:center;';

    const rpTitle = document.createElement('div');
    rpTitle.style.cssText =
      'font-size:10px; color:var(--color-text-dim); text-transform:uppercase;' +
      'letter-spacing:1px; margin-bottom:4px;';
    rpTitle.textContent = 'Total RP';

    this.totalRPLabel = document.createElement('div');
    this.totalRPLabel.style.cssText =
      'font-size:14px; color:var(--color-text); font-weight:bold;';
    this.totalRPLabel.textContent = '— RP/turn';

    rpSection.appendChild(rpTitle);
    rpSection.appendChild(this.totalRPLabel);
    summaryPanel.appendChild(rpSection);

    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    this.styleBtn(okBtn, 'primary');
    okBtn.style.width = '80px';
    okBtn.addEventListener('click', () => this.close());
    summaryPanel.appendChild(okBtn);

    bottom.appendChild(descPanel);
    bottom.appendChild(summaryPanel);

    return bottom;
  }

  // ── Render: field list ────────────────────────────────────────────────────────

  private renderFieldList(state: GameState): void {
    const empire = this.getPlayerEmpire(state);
    const totalRP = empire?.research.researchPerTurn ?? 0;

    for (const field of ALL_RESEARCH_FIELDS) {
      this.renderFieldRow(field, state, totalRP);
    }

    this.highlightFieldRow(this.selectedField);
  }

  private renderFieldRow(field: ResearchField, state: GameState, totalRP: number): void {
    const fieldState = this.fieldResearch[field];
    const pctLabel = this.fieldPctLabels.get(field);
    const currentTechLabel = this.fieldCurrentTechLabels.get(field);
    const barFill = this.fieldProgressBars.get(field);
    const etaLabel = this.fieldProgressLabels.get(field);

    const alloc = this.allocation[field];

    if (pctLabel) {
      pctLabel.textContent = `${alloc}%`;
    }

    // Current tech name
    const currentTechId = fieldState.currentTechId;
    const tech = currentTechId ? TECH_DATA.find((t) => t.id === currentTechId) : null;

    if (currentTechLabel) {
      currentTechLabel.textContent = tech?.name ?? '(none)';
      currentTechLabel.style.color = tech
        ? 'var(--color-text)'
        : 'var(--color-text-dim)';
    }

    // Progress bar + ETA
    const progressRP = fieldState.progressRP;
    const techCost = tech ? this.getTechCost(tech.tier, state) : 0;

    let progressFraction = 0;
    let etaText = '';

    if (alloc === 0) {
      etaText = 'Never';
      progressFraction = fieldState.progressRP > 0 && techCost > 0
        ? Math.min(1, progressRP / techCost)
        : 0;
    } else if (tech && techCost > 0) {
      progressFraction = Math.min(1, progressRP / techCost);
      const fieldRPPerTurn = totalRP * (alloc / 100);
      if (fieldRPPerTurn > 0) {
        const remainingRP = Math.max(0, techCost - progressRP);
        const turns = Math.ceil(remainingRP / fieldRPPerTurn);
        etaText = turns <= 0 ? 'Next turn' : `${turns} turn${turns !== 1 ? 's' : ''}`;
      } else {
        etaText = 'Never';
      }
    } else if (currentTechId === null) {
      etaText = 'No target';
    }

    if (barFill) {
      barFill.style.width = `${Math.round(progressFraction * 100)}%`;
    }
    if (etaLabel) {
      etaLabel.textContent = etaText;
      etaLabel.style.color =
        etaText === 'Never' || etaText === 'No target'
          ? 'var(--color-text-dim)'
          : 'var(--color-text)';
    }
  }

  private highlightFieldRow(field: ResearchField): void {
    for (const [f, row] of this.fieldRows.entries()) {
      if (f === field) {
        row.style.background = 'rgba(var(--color-accent-rgb, 100,160,220),0.15)';
        row.style.borderLeft = '3px solid var(--color-accent)';
        row.style.paddingLeft = '11px';
      } else {
        row.style.background = '';
        row.style.borderLeft = '3px solid transparent';
        row.style.paddingLeft = '11px';
      }
    }
  }

  // ── Render: tech tree (right panel) ──────────────────────────────────────────

  private renderTechTree(state: GameState): void {
    const meta = FIELD_META[this.selectedField];
    this.rightTitle.textContent = meta.label;

    const empire = this.getPlayerEmpire(state);
    const completedSet = new Set(empire?.research.completedTechs ?? []);
    const currentTechId = this.fieldResearch[this.selectedField].currentTechId;

    const byTier = getTechsByField(meta.jsonField);
    const sortedTiers = Array.from(byTier.keys()).sort((a, b) => a - b);

    this.rightTechList.innerHTML = '';

    for (const tier of sortedTiers) {
      const techs = byTier.get(tier) ?? [];

      // ── Tier separator ───────────────────────────────────────────────────
      const tierSep = document.createElement('div');
      tierSep.style.cssText =
        'display:flex; align-items:center; padding:4px 14px; margin:2px 0;';

      const tierLabel = document.createElement('span');
      tierLabel.style.cssText =
        'font-size:10px; color:var(--color-text-dim); text-transform:uppercase;' +
        'letter-spacing:2px; white-space:nowrap; margin-right:8px;';
      tierLabel.textContent = `Level ${tier}`;

      const tierLine = document.createElement('div');
      tierLine.style.cssText =
        'flex:1; height:1px; background:var(--color-border);';

      tierSep.appendChild(tierLabel);
      tierSep.appendChild(tierLine);
      this.rightTechList.appendChild(tierSep);

      // ── Tech rows ────────────────────────────────────────────────────────
      for (const tech of techs) {
        const isCompleted = completedSet.has(tech.id);
        const isCurrent = tech.id === currentTechId;

        const techRow = this.buildTechRow(tech, isCompleted, isCurrent);
        this.rightTechList.appendChild(techRow);
      }
    }
  }

  private buildTechRow(tech: TechEntry, isCompleted: boolean, isCurrent: boolean): HTMLElement {
    const row = document.createElement('div');
    row.style.cssText =
      'display:flex; align-items:center; justify-content:space-between;' +
      'padding:5px 14px; cursor:pointer; transition:background 0.1s;' +
      (isCompleted ? 'opacity:1;' : isCurrent ? 'opacity:1;' : 'opacity:0.65;');

    row.addEventListener('mouseenter', () => {
      row.style.background = 'rgba(255,255,255,0.05)';
    });
    row.addEventListener('mouseleave', () => {
      if (tech.id !== this.selectedTechId) row.style.background = '';
      else row.style.background = 'rgba(255,255,255,0.08)';
    });
    row.addEventListener('click', () => {
      this.selectedTechId = tech.id;
      this.showTechDescription(tech);
      // Update row highlight
      this.rightTechList.querySelectorAll<HTMLElement>('.tech-row').forEach((el) => {
        (el as HTMLElement).style.background = '';
      });
      row.style.background = 'rgba(255,255,255,0.08)';
    });
    row.classList.add('tech-row');

    // Tech name
    const nameEl = document.createElement('span');
    nameEl.textContent = tech.name;
    nameEl.style.cssText =
      `font-size:12px; color:${isCompleted ? 'var(--color-text)' : isCurrent ? 'var(--color-accent)' : 'var(--color-text-dim)'};`;

    // Status indicator
    const statusEl = document.createElement('span');
    statusEl.style.cssText =
      'font-size:12px; font-family:var(--font-mono); margin-left:12px; min-width:24px; text-align:center;';

    if (isCompleted) {
      statusEl.textContent = '[✓]';
      statusEl.style.color = '#4a9';
    } else if (isCurrent) {
      statusEl.textContent = '[→]';
      statusEl.style.color = 'var(--color-accent)';
    } else {
      statusEl.textContent = '[ ]';
      statusEl.style.color = 'var(--color-text-dim)';
    }

    row.appendChild(nameEl);
    row.appendChild(statusEl);
    return row;
  }

  // ── Render: tech description ──────────────────────────────────────────────────

  private showTechDescription(tech: TechEntry): void {
    this.descName.textContent = tech.name;
    this.descBody.textContent = tech.description || '(No description available.)';
  }

  // ── Render: total RP ─────────────────────────────────────────────────────────

  private renderTotalRP(state: GameState): void {
    const empire = this.getPlayerEmpire(state);
    const rp = empire?.research.researchPerTurn ?? 0;
    this.totalRPLabel.textContent = `${Math.round(rp)} RP/turn`;
  }

  // ── RP allocation adjustment ──────────────────────────────────────────────────

  /**
   * Adjusts RP allocation for the given field by `delta` percentage points.
   * Redistributes the change from/to other fields proportionally to keep sum at 100.
   */
  private adjustAllocation(field: ResearchField, delta: number): void {
    const current = this.allocation[field];
    const newVal = Math.max(0, Math.min(100, current + delta));
    const actualDelta = newVal - current;

    if (actualDelta === 0) return;

    // Distribute the opposite delta across other fields (proportionally, or round-robin if equal)
    const otherFields = ALL_RESEARCH_FIELDS.filter((f) => f !== field);
    const totalOthers = otherFields.reduce((sum, f) => sum + this.allocation[f], 0);

    const newAllocation = { ...this.allocation };
    newAllocation[field] = newVal;

    if (totalOthers === 0) {
      // Spread delta evenly
      const share = Math.floor(-actualDelta / otherFields.length);
      let leftover = -actualDelta - share * otherFields.length;
      for (const f of otherFields) {
        newAllocation[f] = Math.max(0, this.allocation[f] + share);
      }
      // Apply leftover to last field that has room
      for (let i = otherFields.length - 1; i >= 0 && leftover !== 0; i--) {
        const f = otherFields[i];
        if (leftover > 0) {
          newAllocation[f] = Math.min(100, newAllocation[f] + leftover);
        } else {
          newAllocation[f] = Math.max(0, newAllocation[f] + leftover);
        }
        leftover = 0;
      }
    } else {
      // Proportional redistribution
      let redistributed = 0;
      for (let i = 0; i < otherFields.length - 1; i++) {
        const f = otherFields[i];
        const proportion = this.allocation[f] / totalOthers;
        const change = -actualDelta * proportion;
        newAllocation[f] = Math.max(0, Math.round(this.allocation[f] + change));
        redistributed += newAllocation[f] - this.allocation[f];
      }
      // Last field absorbs rounding error
      const lastField = otherFields[otherFields.length - 1];
      newAllocation[lastField] = Math.max(
        0,
        this.allocation[lastField] - actualDelta - redistributed,
      );
    }

    // Clamp and ensure sum = 100
    const total = ALL_RESEARCH_FIELDS.reduce((s, f) => s + newAllocation[f], 0);
    if (total !== 100) {
      // Fix rounding by adjusting a non-changed field
      const diff = 100 - total;
      for (const f of otherFields) {
        const adj = newAllocation[f] + diff;
        if (adj >= 0 && adj <= 100) {
          newAllocation[f] = adj;
          break;
        }
      }
    }

    this.allocation = newAllocation as WorkingAllocation;

    // Dispatch the new allocation to store
    this.store.dispatch({
      type: 'SET_RESEARCH_ALLOCATION',
      payload: { allocation: { ...this.allocation } },
    });

    // Re-render field list with updated percentages
    const state = this.store.getState();
    this.renderFieldList(state);
  }

  // ── Close / navigation ────────────────────────────────────────────────────────

  private close(): void {
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
  }

  // ── State synchronization ─────────────────────────────────────────────────────

  /**
   * Pulls RP allocation from game state if available, otherwise uses defaults.
   * The store may hold allocation under empire.research (extended fields not yet
   * in state.ts), so we fall back gracefully.
   */
  private syncAllocationFromState(_state: GameState): void {
    // If the empire's research state has per-field allocation info (future extension),
    // use it. Otherwise keep defaults / current working allocation.
    // For now, keep current working allocation as-is (it persists between show/hide).
  }

  /**
   * Builds per-field research state from the empire's ResearchState.
   * ResearchState.currentTech is the overall active tech; we need to map it
   * back to a field. We do this by looking up the tech in tech-tree.json.
   */
  private syncFieldResearchFromState(state: GameState): void {
    const empire = this.getPlayerEmpire(state);
    if (!empire) {
      this.fieldResearch = createDefaultFieldResearch();
      return;
    }

    const research = empire.research;
    const completedSet = new Set(research.completedTechs);

    // Build per-field FieldResearchState from the flat ResearchState
    const fieldResearch = createDefaultFieldResearch();

    for (const field of ALL_RESEARCH_FIELDS) {
      const jsonField = FIELD_META[field].jsonField;

      // Completed techs in this field
      const fieldCompleted = research.completedTechs.filter((id) => {
        const tech = TECH_DATA.find((t) => t.id === id);
        return tech?.field === jsonField;
      });

      const maxCompletedTier = fieldCompleted.reduce((max, id) => {
        const tech = TECH_DATA.find((t) => t.id === id);
        return tech ? Math.max(max, tech.tier) : max;
      }, 0);

      fieldResearch[field].completedTechs = fieldCompleted;
      fieldResearch[field].currentTier = maxCompletedTier;

      // Detect current research target for this field
      const currentTechId = research.currentTech;
      if (currentTechId) {
        const currentTech = TECH_DATA.find((t) => t.id === currentTechId);
        if (currentTech?.field === jsonField) {
          fieldResearch[field].currentTechId = currentTechId;
          fieldResearch[field].currentTechTier = currentTech.tier;
          // Map research progress: research.researchPoints / cost
          const cost = this.getTechCost(currentTech.tier, state);
          fieldResearch[field].progressRP = Math.min(
            research.researchPoints,
            cost,
          );
        }
      }

      // Check availableTechs for this field to find a pending tech
      const stateKey = FIELD_META[field].stateKey;
      const availInState = research.availableTechs[stateKey] ?? [];
      if (!fieldResearch[field].currentTechId && availInState.length > 0) {
        // Pick first available that's not completed
        const next = availInState.find((id) => !completedSet.has(id));
        if (next) {
          const techEntry = TECH_DATA.find((t) => t.id === next);
          if (techEntry) {
            fieldResearch[field].currentTechId = next;
            fieldResearch[field].currentTechTier = techEntry.tier;
          }
        }
      }
    }

    this.fieldResearch = fieldResearch;
  }

  // ── Helper: tech cost ──────────────────────────────────────────────────────────

  private getTechCost(tier: number, _state: GameState): number {
    // Use the tech-tree.json cost directly (already accounts for tier).
    // In a full implementation, this would use getTechCost(tier, state.galaxy.size).
    const tierTechs = TECH_DATA.filter((t) => t.tier === tier);
    return tierTechs.length > 0 ? (tierTechs[0]?.cost ?? tier * 50) : tier * 50;
  }

  // ── Helper: player empire ──────────────────────────────────────────────────────

  private getPlayerEmpire(state: GameState) {
    const pid = state.empires.playerId;
    return state.empires.byId[pid] ?? null;
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────────

  private styleBtn(btn: HTMLButtonElement, variant: 'default' | 'primary' = 'default'): void {
    const base =
      'font-family:var(--font-mono); font-size:12px; padding:6px 14px; cursor:pointer;' +
      'border-radius:2px; text-transform:uppercase; letter-spacing:1px; border:1px solid;';
    if (variant === 'primary') {
      btn.style.cssText =
        base + 'background:var(--color-accent-dim); border-color:var(--color-accent); color:#fff;';
    } else {
      btn.style.cssText =
        base + 'background:var(--color-bg); border-color:var(--color-border); color:var(--color-text);';
    }
    btn.addEventListener('mouseenter', () => { btn.style.opacity = '0.8'; });
    btn.addEventListener('mouseleave', () => { btn.style.opacity = '1'; });
  }

  private styleAllocBtn(btn: HTMLButtonElement): void {
    btn.style.cssText =
      'background:var(--color-bg); border:1px solid var(--color-border);' +
      'color:var(--color-text); font-family:var(--font-mono); font-size:13px;' +
      'width:20px; height:20px; cursor:pointer; padding:0; text-align:center; line-height:1;' +
      'border-radius:2px; flex-shrink:0;';
    btn.addEventListener('mouseenter', () => { btn.style.opacity = '0.7'; });
    btn.addEventListener('mouseleave', () => { btn.style.opacity = '1'; });
  }
}
