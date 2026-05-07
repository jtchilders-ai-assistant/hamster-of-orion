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
  getTechCost as systemGetTechCost,
  isTechResearchable,
  getTechPrerequisite,
  getTechEntryById,
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
  /** ID of another tech that must be completed before this one can be researched. */
  prerequisite?: string;
}

interface TechTreeData {
  technologies: TechEntry[];
}

const TECH_DATA = (techTreeRaw as TechTreeData).technologies;

// ── Tech lookup map for O(1) access ──────────────────────────────────────────

const TECH_BY_ID = new Map<string, TechEntry>(TECH_DATA.map((t) => [t.id, t]));

// ── Field display metadata ────────────────────────────────────────────────────

/**
 * Maps ResearchField keys to the MOO1 display label and the TechField used in
 * state.ts availableTechs. The 6th field differs:
 *   'biotechnology' in state.ts TechField ↔ 'planetology' in research.ts / JSON
 */
interface FieldMeta {
  label: string;        // MOO1 uppercase display name
  stateKey: TechField;  // Key in ResearchState.availableTechs
  jsonField: string;    // Field string in tech-tree.json
}

const FIELD_META: Record<ResearchField, FieldMeta> = {
  computers:    { label: 'COMPUTERS',    stateKey: 'computers',    jsonField: 'computers'    },
  construction: { label: 'CONSTRUCTION', stateKey: 'construction', jsonField: 'construction' },
  force_fields: { label: 'FORCE FIELDS', stateKey: 'force_fields', jsonField: 'force_fields' },
  planetology:  { label: 'PLANETOLOGY',  stateKey: 'biotechnology',jsonField: 'planetology'  },
  propulsion:   { label: 'PROPULSION',   stateKey: 'propulsion',   jsonField: 'propulsion'   },
  weapons:      { label: 'WEAPONRY',     stateKey: 'weapons',      jsonField: 'weapons'      },
};

// ── Working RP allocation state ───────────────────────────────────────────────

/** Working RP allocation percentages (integer, must sum to 100). */
type WorkingAllocation = Record<ResearchField, number>;

function defaultAllocation(): WorkingAllocation {
  const even = createEvenAllocation();
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

  /** Currently selected field (drives right panel tech tree). */
  private selectedField: ResearchField = 'computers';

  /** Tech clicked in the right panel — shown in the description panel. */
  private selectedTechId: string | null = null;

  /**
   * Working RP allocation (integers, sum = 100).
   * Loaded from state on show(); committed to store on every +/- click.
   */
  private allocation: WorkingAllocation = defaultAllocation();

  /** Cached per-field research state derived from store on each render. */
  private fieldResearch: EmpireFieldResearch = createDefaultFieldResearch();

  // ── DOM refs ────────────────────────────────────────────────────────────────
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

  // ── Layout ──────────────────────────────────────────────────────────────────

  private buildLayout(): void {
    this.container.innerHTML = '';
    this.container.style.cssText =
      'display:none; flex-direction:column; height:100%; overflow:hidden;' +
      'background:var(--color-bg); font-family:var(--font-mono);';

    // Header
    const header = document.createElement('div');
    header.style.cssText =
      'text-align:center; padding:12px 0 8px; flex-shrink:0;' +
      'border-bottom:2px solid var(--color-border);';
    header.innerHTML =
      `<h1 style="font-size:18px;letter-spacing:4px;color:var(--color-accent);` +
      `text-transform:uppercase;margin:0">R E S E A R C H</h1>`;
    this.container.appendChild(header);

    // Main body (left + right)
    const body = document.createElement('div');
    body.style.cssText = 'flex:1; display:flex; gap:0; overflow:hidden; min-height:0;';
    this.container.appendChild(body);

    body.appendChild(this.buildLeftPanel());
    body.appendChild(this.buildRightPanel());

    // Bottom section
    this.container.appendChild(this.buildBottomSection());
  }

  // ── Left panel: 6 field rows ─────────────────────────────────────────────────

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
      'cursor:pointer; user-select:none; transition:background 0.1s;' +
      'border-left:3px solid transparent;';

    row.addEventListener('click', () => {
      this.selectedField = field;
      this.highlightFieldRow(field);
      const state = this.store.getState();
      this.renderTechTree(state);
    });
    row.addEventListener('mouseenter', () => {
      if (field !== this.selectedField) row.style.background = 'rgba(255,255,255,0.04)';
    });
    row.addEventListener('mouseleave', () => {
      if (field !== this.selectedField) row.style.background = '';
    });

    // Row top: label + RP% slider controls
    const topRow = document.createElement('div');
    topRow.style.cssText =
      'display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;';

    const labelEl = document.createElement('span');
    labelEl.textContent = meta.label;
    labelEl.style.cssText =
      'font-size:12px; letter-spacing:1px; color:var(--color-accent); text-transform:uppercase;';

    const pctWrapper = document.createElement('div');
    pctWrapper.style.cssText = 'display:flex; align-items:center; gap:4px;';

    const decBtn = document.createElement('button');
    decBtn.textContent = '−';
    decBtn.title = 'Decrease 5%';
    this.styleAllocBtn(decBtn);
    decBtn.addEventListener('click', (e) => { e.stopPropagation(); this.adjustAllocation(field, -5); });

    const pctLabel = document.createElement('span');
    pctLabel.style.cssText =
      'font-size:13px; color:var(--color-text); min-width:36px; text-align:right;';
    pctLabel.textContent = `${this.allocation[field]}%`;
    this.fieldPctLabels.set(field, pctLabel);

    const incBtn = document.createElement('button');
    incBtn.textContent = '+';
    incBtn.title = 'Increase 5%';
    this.styleAllocBtn(incBtn);
    incBtn.addEventListener('click', (e) => { e.stopPropagation(); this.adjustAllocation(field, +5); });

    pctWrapper.append(decBtn, pctLabel, incBtn);
    topRow.append(labelEl, pctWrapper);
    row.appendChild(topRow);

    // Current tech label
    const currentTechLabel = document.createElement('div');
    currentTechLabel.style.cssText =
      'font-size:12px; color:var(--color-text-dim); margin-bottom:5px;' +
      'white-space:nowrap; overflow:hidden; text-overflow:ellipsis;';
    currentTechLabel.textContent = '(none)';
    this.fieldCurrentTechLabels.set(field, currentTechLabel);
    row.appendChild(currentTechLabel);

    // Progress bar + ETA
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
    this.fieldProgressLabels.set(field, etaLabel);

    progressRow.append(barTrack, etaLabel);
    row.appendChild(progressRow);

    return row;
  }

  // ── Right panel: tech tree browser ───────────────────────────────────────────

  private buildRightPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.style.cssText = 'flex:1; display:flex; flex-direction:column; overflow:hidden;';

    this.rightTitle = document.createElement('div');
    this.rightTitle.style.cssText =
      'padding:10px 16px 6px; font-size:14px; letter-spacing:2px; color:var(--color-accent);' +
      'text-transform:uppercase; flex-shrink:0; border-bottom:1px solid var(--color-border);';
    this.rightTitle.textContent = 'COMPUTERS';
    panel.appendChild(this.rightTitle);

    this.rightTechList = document.createElement('div');
    this.rightTechList.style.cssText = 'flex:1; overflow-y:auto; padding:8px 0;';
    panel.appendChild(this.rightTechList);

    return panel;
  }

  // ── Bottom section: description + OK ────────────────────────────────────────

  private buildBottomSection(): HTMLElement {
    const bottom = document.createElement('div');
    bottom.style.cssText =
      'display:flex; flex-shrink:0; border-top:2px solid var(--color-border);' +
      'min-height:120px; max-height:160px;';

    // Description panel (~80%)
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

    descPanel.append(this.descName, this.descBody);

    // Summary panel (~20%) — Total RP + OK button
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
    this.totalRPLabel.style.cssText = 'font-size:14px; color:var(--color-text); font-weight:bold;';
    this.totalRPLabel.textContent = '— RP/turn';

    rpSection.append(rpTitle, this.totalRPLabel);
    summaryPanel.appendChild(rpSection);

    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    this.styleBtn(okBtn, 'primary');
    okBtn.style.width = '80px';
    okBtn.addEventListener('click', () => this.close());
    summaryPanel.appendChild(okBtn);

    bottom.append(descPanel, summaryPanel);
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
    if (pctLabel) pctLabel.textContent = `${alloc}%`;

    // Current tech name from fieldResearch (derived from state)
    const currentTechId = fieldState.currentTechId;
    const tech = currentTechId ? TECH_BY_ID.get(currentTechId) ?? null : null;

    if (currentTechLabel) {
      currentTechLabel.textContent = tech?.name ?? '(none)';
      currentTechLabel.style.color = tech ? 'var(--color-text)' : 'var(--color-text-dim)';
    }

    // Progress bar + ETA
    // Per research-formulas.md §6: cost = Tier_Cost_Table[tier] × galaxy_size_modifier
    const galaxySize = state.galaxy.size;
    const techCost = tech ? systemGetTechCost(tech.tier, galaxySize) : 0;
    const progressRP = fieldState.progressRP;

    let progressFraction = 0;
    let etaText = '';

    if (alloc === 0) {
      // RP never flows to this field
      etaText = 'Never';
      progressFraction = techCost > 0 ? Math.min(1, progressRP / techCost) : 0;
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
    } else {
      etaText = 'No target';
    }

    if (barFill) barFill.style.width = `${Math.round(progressFraction * 100)}%`;
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
        row.style.background = 'rgba(100,160,220,0.15)';
        row.style.borderLeft = '3px solid var(--color-accent)';
        row.style.paddingLeft = '11px';
      } else {
        row.style.background = '';
        row.style.borderLeft = '3px solid transparent';
        row.style.paddingLeft = '14px';
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

      // Tier separator
      const tierSep = document.createElement('div');
      tierSep.style.cssText = 'display:flex; align-items:center; padding:4px 14px; margin:2px 0;';

      const tierLabel = document.createElement('span');
      tierLabel.style.cssText =
        'font-size:10px; color:var(--color-text-dim); text-transform:uppercase;' +
        'letter-spacing:2px; white-space:nowrap; margin-right:8px;';
      tierLabel.textContent = `Level ${tier}`;

      const tierLine = document.createElement('div');
      tierLine.style.cssText = 'flex:1; height:1px; background:var(--color-border);';

      tierSep.append(tierLabel, tierLine);
      this.rightTechList.appendChild(tierSep);

      // Tech rows
      for (const tech of techs) {
        const isCompleted = completedSet.has(tech.id);
        const isCurrent = tech.id === currentTechId;
        const techRow = this.buildTechRow(tech, isCompleted, isCurrent, state);
        this.rightTechList.appendChild(techRow);
      }
    }
  }

  /**
   * Build one tech row in the right panel.
   *
   * States per wireframe/research-tree.md:
   *   [✓] Already researched — green, no select button
   *   [→] Currently researching — accent color, no select button
   *   [ ] Not yet researched — dimmed, shows "Research" button on hover
   *
   * Clicking anywhere on the row updates the description panel.
   * Clicking "Research" sets this tech as the current research target for the
   * field via SET_RESEARCH_CURRENT_TECH (acceptance criterion #5).
   */
  private buildTechRow(
    tech: TechEntry,
    isCompleted: boolean,
    isCurrent: boolean,
    state: GameState,
  ): HTMLElement {
    // Prerequisite check: tech is only selectable when its prereq is done.
    const empire = this.getPlayerEmpire(state);
    const completedSet = new Set(empire?.research.completedTechs ?? []);
    const prereq = getTechPrerequisite(tech.id);
    const prereqMet = prereq === undefined || completedSet.has(prereq);
    const isLocked = !isCompleted && !isCurrent && !prereqMet;
    const isSelectable = !isCompleted && !isCurrent && prereqMet;

    // Locked (prereq unmet) rows are visually more dimmed
    const opacityStyle = isCompleted || isCurrent ? 'opacity:1;' : isLocked ? 'opacity:0.35;' : 'opacity:0.7;';

    const row = document.createElement('div');
    row.className = 'tech-row';
    row.style.cssText =
      'display:flex; align-items:center; justify-content:space-between;' +
      `padding:5px 14px; cursor:pointer; transition:background 0.1s;` +
      opacityStyle;

    row.addEventListener('mouseenter', () => {
      row.style.background = 'rgba(255,255,255,0.05)';
    });
    row.addEventListener('mouseleave', () => {
      if (tech.id !== this.selectedTechId) row.style.background = '';
      else row.style.background = 'rgba(255,255,255,0.08)';
    });

    // Click row → show description
    row.addEventListener('click', (e) => {
      // Don't re-trigger if the "Research" button was clicked
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') return;

      this.selectedTechId = tech.id;
      this.showTechDescription(tech, state);
      this.rightTechList.querySelectorAll<HTMLElement>('.tech-row').forEach((el) => {
        el.style.background = '';
      });
      row.style.background = 'rgba(255,255,255,0.08)';
    });

    // Left side: name (+ lock icon when prereq unmet)
    const nameEl = document.createElement('span');
    nameEl.textContent = isLocked ? `🔒 ${tech.name}` : tech.name;
    nameEl.style.cssText =
      `font-size:12px; flex:1;` +
      (isCompleted
        ? 'color:var(--color-text);'
        : isCurrent
          ? 'color:var(--color-accent);'
          : isLocked
            ? 'color:var(--color-text-dim);'
            : 'color:var(--color-text-dim);');

    // Tooltip showing what prereq is needed
    if (isLocked && prereq !== undefined) {
      const prereqEntry = getTechEntryById(prereq);
      row.title = prereqEntry
        ? `Requires: ${prereqEntry.name}`
        : `Requires: ${prereq}`;
    }

    row.appendChild(nameEl);

    // Right side: status indicator + optional "Research" button
    const rightSide = document.createElement('div');
    rightSide.style.cssText = 'display:flex; align-items:center; gap:8px;';

    if (isSelectable) {
      // "Research" button — sets this as current tech for the field
      // Per design doc: tech selection from this screen updates per-field targets
      const researchBtn = document.createElement('button');
      researchBtn.textContent = 'Research';
      researchBtn.style.cssText =
        'font-family:var(--font-mono); font-size:10px; padding:2px 6px; cursor:pointer;' +
        'background:transparent; border:1px solid var(--color-border);' +
        'color:var(--color-text-dim); border-radius:2px; display:none;';

      row.addEventListener('mouseenter', () => { researchBtn.style.display = 'inline-block'; });
      row.addEventListener('mouseleave', () => { researchBtn.style.display = 'none'; });

      researchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectTechForField(this.selectedField, tech.id);
      });

      rightSide.appendChild(researchBtn);
    }

    const statusEl = document.createElement('span');
    statusEl.style.cssText =
      'font-size:12px; font-family:var(--font-mono); min-width:28px; text-align:center;';

    if (isCompleted) {
      statusEl.textContent = '[✓]';
      statusEl.style.color = '#4a9';
    } else if (isCurrent) {
      statusEl.textContent = '[→]';
      statusEl.style.color = 'var(--color-accent)';
    } else if (isLocked) {
      statusEl.textContent = '[🔒]';
      statusEl.style.color = 'var(--color-text-dim)';
    } else {
      statusEl.textContent = '[ ]';
      statusEl.style.color = 'var(--color-text-dim)';
    }

    rightSide.appendChild(statusEl);
    row.appendChild(rightSide);

    return row;
  }

  /**
   * Selects a technology as the current research target for a field.
   * Dispatches SET_RESEARCH_CURRENT_TECH to the store (reducer persists it).
   * Per research-formulas.md §5: field_rp = empire_total_rp × (alloc% / 100).
   *
   * Also updates fieldCurrentTech state which is used in renderFieldRow to
   * display the tech name and calculate ETA.
   */
  private selectTechForField(field: ResearchField, techId: string): void {
    // Prerequisite guard: refuse selection if the prereq hasn't been completed.
    const state = this.store.getState();
    const empire = this.getPlayerEmpire(state);
    const completedTechs = empire?.research.completedTechs ?? [];
    if (!isTechResearchable(techId, completedTechs)) {
      // Tech is already done or prereq unmet — silently reject (button should
      // never be visible for these cases, but defend in depth).
      return;
    }

    // Persist to store — reducer stores in empire.research.fieldCurrentTech
    this.store.dispatch({
      type: 'SET_RESEARCH_CURRENT_TECH',
      payload: { field, techId },
    });

    // Update local fieldResearch so UI reflects immediately without waiting for
    // the next full render cycle (fieldResearch is re-derived from state on render)
    const tech = TECH_BY_ID.get(techId);
    if (tech) {
      this.fieldResearch = {
        ...this.fieldResearch,
        [field]: {
          ...this.fieldResearch[field],
          currentTechId: techId,
          currentTechTier: tech.tier,
        },
      };
    }

    // Re-render to reflect the new selection
    const newState = this.store.getState();
    this.renderFieldList(newState);
    this.renderTechTree(newState);

    // Show description for the newly selected tech
    if (tech) this.showTechDescription(tech, newState);
  }

  // ── Render: description panel ─────────────────────────────────────────────────

  /**
   * Updates the bottom description panel with the clicked tech's details.
   * Per wireframe: name header + short description text only (no separate
   * labeled fields for cost/tier per design note).
   */
  private showTechDescription(tech: TechEntry, state: GameState): void {
    this.descName.textContent = tech.name;

    const galaxySize = state.galaxy.size;
    let cost: number;
    try {
      cost = systemGetTechCost(tech.tier, galaxySize);
    } catch {
      // Fallback if tier not in table
      cost = tech.cost;
    }

    // Build description with cost info (MOO1 keeps it brief)
    const desc = tech.description || '(No description available.)';
    const costLine = `Research cost: ${cost.toLocaleString()} RP`;
    this.descBody.textContent = `${desc}  [${costLine}]`;
  }

  // ── Render: total RP ─────────────────────────────────────────────────────────

  private renderTotalRP(state: GameState): void {
    const empire = this.getPlayerEmpire(state);
    const rp = empire?.research.researchPerTurn ?? 0;
    this.totalRPLabel.textContent = `${Math.round(rp)} RP/turn`;
  }

  // ── RP allocation: +/- buttons ────────────────────────────────────────────────

  /**
   * Adjusts RP % for the given field by `delta` (±5), redistributing proportionally
   * across the other 5 fields so the total stays exactly 100.
   *
   * Per research-formulas.md §5: all field percentages must sum to 100%.
   */
  private adjustAllocation(field: ResearchField, delta: number): void {
    const current = this.allocation[field];
    const newVal = Math.max(0, Math.min(100, current + delta));
    const actualDelta = newVal - current;
    if (actualDelta === 0) return;

    const otherFields = ALL_RESEARCH_FIELDS.filter((f) => f !== field);
    const totalOthers = otherFields.reduce((s, f) => s + this.allocation[f], 0);
    const newAlloc = { ...this.allocation };
    newAlloc[field] = newVal;

    if (totalOthers === 0) {
      // Spread evenly across other fields
      const share = Math.floor(-actualDelta / otherFields.length);
      let leftover = -actualDelta - share * otherFields.length;
      for (const f of otherFields) newAlloc[f] = Math.max(0, this.allocation[f] + share);
      for (let i = otherFields.length - 1; i >= 0 && leftover !== 0; i--) {
        const f = otherFields[i];
        const adj = leftover > 0
          ? Math.min(100, newAlloc[f] + leftover)
          : Math.max(0, newAlloc[f] + leftover);
        newAlloc[f] = adj;
        leftover = 0;
      }
    } else {
      // Proportional redistribution
      let redistributed = 0;
      for (let i = 0; i < otherFields.length - 1; i++) {
        const f = otherFields[i];
        const proportion = this.allocation[f] / totalOthers;
        newAlloc[f] = Math.max(0, Math.round(this.allocation[f] + (-actualDelta * proportion)));
        redistributed += newAlloc[f] - this.allocation[f];
      }
      const last = otherFields[otherFields.length - 1];
      newAlloc[last] = Math.max(0, this.allocation[last] - actualDelta - redistributed);
    }

    // Ensure sum = 100 (fix any rounding error)
    const sum = ALL_RESEARCH_FIELDS.reduce((s, f) => s + newAlloc[f], 0);
    if (sum !== 100) {
      const diff = 100 - sum;
      for (const f of otherFields) {
        const adj = newAlloc[f] + diff;
        if (adj >= 0 && adj <= 100) { newAlloc[f] = adj; break; }
      }
    }

    this.allocation = newAlloc as WorkingAllocation;

    // Persist to store (reducer saves to empire.research.fieldAllocation)
    this.store.dispatch({
      type: 'SET_RESEARCH_ALLOCATION',
      payload: { allocation: { ...this.allocation } },
    });

    const state = this.store.getState();
    this.renderFieldList(state);
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  private close(): void {
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
  }

  // ── State synchronization ──────────────────────────────────────────────────────

  /**
   * Loads RP allocation from the store's empire research state.
   * Falls back to the current working allocation (preserves user's last choice).
   *
   * Reads from empire.research.fieldAllocation (persisted by SET_RESEARCH_ALLOCATION).
   */
  private syncAllocationFromState(state: GameState): void {
    const empire = this.getPlayerEmpire(state);
    if (!empire) return;

    const saved = empire.research.fieldAllocation;
    if (!saved) return;

    // Validate: all 6 fields present and sum to 100
    const fields: Array<keyof typeof saved> = [
      'weapons', 'propulsion', 'construction', 'computers', 'force_fields', 'planetology',
    ];
    const allPresent = fields.every((f) => typeof saved[f] === 'number');
    if (!allPresent) return;

    const total = fields.reduce((s, f) => s + (saved[f] ?? 0), 0);
    if (Math.abs(total - 100) > 1) return; // sanity check

    this.allocation = {
      weapons:      saved.weapons      ?? 17,
      propulsion:   saved.propulsion   ?? 17,
      construction: saved.construction ?? 17,
      computers:    saved.computers    ?? 17,
      force_fields: saved.force_fields ?? 16,
      planetology:  saved.planetology  ?? 16,
    };
  }

  /**
   * Derives per-field research state from the flat ResearchState in the store.
   *
   * Strategy (in priority order):
   * 1. If empire.research.fieldCurrentTech[field] is set → use it (persisted selection)
   * 2. If empire.research.currentTech belongs to this field → use it (legacy single-tech)
   * 3. If empire.research.availableTechs[field] has options → show first non-completed
   * 4. Otherwise: no current tech for this field
   *
   * Progress (RP accumulated):
   * - Uses empire.research.researchPoints only for the field that owns currentTech.
   * - Other fields start from 0 (turn-processing populates per-field progress).
   */
  private syncFieldResearchFromState(state: GameState): void {
    const empire = this.getPlayerEmpire(state);
    if (!empire) {
      this.fieldResearch = createDefaultFieldResearch();
      return;
    }

    const research = empire.research;
    const completedSet = new Set(research.completedTechs);
    const fieldResearch = createDefaultFieldResearch();

    for (const field of ALL_RESEARCH_FIELDS) {
      const meta = FIELD_META[field];
      const jsonField = meta.jsonField;

      // Completed techs for this field
      const fieldCompleted = research.completedTechs.filter((id) => {
        const t = TECH_BY_ID.get(id);
        return t?.field === jsonField;
      });
      fieldResearch[field].completedTechs = fieldCompleted;
      fieldResearch[field].currentTier = fieldCompleted.reduce((max, id) => {
        const t = TECH_BY_ID.get(id);
        return t ? Math.max(max, t.tier) : max;
      }, 0);

      // 1. Persisted per-field selection (SET_RESEARCH_CURRENT_TECH)
      const savedFieldTech = research.fieldCurrentTech?.[field as keyof typeof research.fieldCurrentTech];
      if (savedFieldTech && !completedSet.has(savedFieldTech)) {
        const t = TECH_BY_ID.get(savedFieldTech);
        if (t) {
          fieldResearch[field].currentTechId = savedFieldTech;
          fieldResearch[field].currentTechTier = t.tier;
          // Use stored progress; research turn processor will update it
          fieldResearch[field].progressRP = 0;
        }
      }

      // 2. Legacy: single currentTech that belongs to this field
      if (!fieldResearch[field].currentTechId && research.currentTech) {
        const t = TECH_BY_ID.get(research.currentTech);
        if (t?.field === jsonField) {
          fieldResearch[field].currentTechId = research.currentTech;
          fieldResearch[field].currentTechTier = t.tier;
          fieldResearch[field].progressRP = research.researchPoints;
        }
      }

      // 3. Fall back to first available tech in this field
      if (!fieldResearch[field].currentTechId) {
        const stateKey = meta.stateKey;
        const available = research.availableTechs[stateKey] ?? [];
        const next = available.find((id) => !completedSet.has(id));
        if (next) {
          const t = TECH_BY_ID.get(next);
          if (t) {
            fieldResearch[field].currentTechId = next;
            fieldResearch[field].currentTechTier = t.tier;
          }
        }
      }
    }

    this.fieldResearch = fieldResearch;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────────

  private getPlayerEmpire(state: GameState) {
    const pid = state.empires.playerId;
    return state.empires.byId[pid] ?? null;
  }

  // ── UI style helpers ──────────────────────────────────────────────────────────

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
