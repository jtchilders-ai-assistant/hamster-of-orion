/**
 * Save / Load screen — multi-slot localStorage persistence.
 * src/ui/screens/SaveLoadScreen.ts
 *
 * Accessible from the game menu (F8). Shows autosave slot at the top,
 * numbered save slots below, with save / load / delete actions.
 *
 * Acceptance criteria:
 *   1. Save slots list — shows 10 slots with game info (turn, year, player empire)
 *   2. Save button — saves current game to selected slot
 *   3. Load button — loads selected save
 *   4. Delete button — deletes save with confirmation dialog
 *   5. Autosave slot — shown separately at top
 *   6. Uses LocalStorage — keys like hamster_save_1, hamster_autosave
 */

import { GameState } from '../../game/state';
import { Store } from '../../game/store';

// ── Number of save slots ──────────────────────────────────────────────────────

const NUM_SLOTS = 10;

// ── LocalStorage helpers ──────────────────────────────────────────────────────

/**
 * Load a GameState from a named slot.
 * Returns the raw envelope (with metadata) so the screen can display save info.
 */
function loadFromSlot(slot: string): SavedSlotData | null {
  try {
    const raw = localStorage.getItem(`hamster_${slot}`);
    if (!raw) return null;
    return JSON.parse(raw) as SavedSlotData;
  } catch {
    return null;
  }
}

/**
 * Delete a slot from localStorage.
 */
function deleteSlot(slot: string): void {
  try {
    localStorage.removeItem(`hamster_${slot}`);
  } catch {
    // Ignore
  }
}

// ── Type for deserialized save data ──────────────────────────────────────────

interface SavedSlotData {
  version: number;
  savedAt: number;
  turn: number;
  year: number;
  empire: string;
  state: GameState;
}

// ── Format saved date nicely ──────────────────────────────────────────────────

function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Screen class ──────────────────────────────────────────────────────────────

export class SaveLoadScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;
  private selectedSlot: string = 'save_1';
  private deleteConfirmSlot: string | null = null;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.buildLayout();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Layout
  // ═══════════════════════════════════════════════════════════════════════

  private buildLayout(): void {
    this.container.innerHTML = `
      <div class="screen-header">
        <h1>SAVE / LOAD GAME</h1>
      </div>
      <div class="screen-body">
        <div class="save-load-body" id="save-load-body">
          <!-- Rendered dynamically -->
        </div>
      </div>
      <!-- Delete confirmation overlay (hidden until needed) -->
      <div class="save-load-delete-overlay" id="delete-confirm-overlay" style="display:none;">
        <div class="delete-confirm-dialog">
          <h3>⚠️ Delete Save</h3>
          <p id="delete-confirm-text"></p>
          <div class="delete-confirm-actions">
            <button class="btn-cancel" id="delete-cancel-btn">Cancel</button>
            <button class="btn-confirm btn-danger" id="delete-confirm-btn">Delete</button>
          </div>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════════

  render(state: GameState): void {
    const bodyEl = this.container.querySelector('#save-load-body');
    if (!bodyEl) return;

    bodyEl.innerHTML = this.buildSlotsHtml(state);
    this.bindActions(state);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HTML builders
  // ═══════════════════════════════════════════════════════════════════════

  private buildSlotsHtml(state: GameState): string {
    const playerEmpire = state.empires.byId[state.empires.playerId]?.name ?? 'Unknown';

    // Autosave slot
    const autosaveData = loadFromSlot('autosave');
    const autosaveHtml = this.renderAutosaveSlot(autosaveData, playerEmpire, state);

    // Numbered slots
    const slotsHtml = Array.from({ length: NUM_SLOTS }, (_, i) => {
      const slotNum = i + 1;
      const slotName = `save_${slotNum}`;
      const data = loadFromSlot(slotName);
      return this.renderSlot(slotNum, data, playerEmpire, state);
    }).join('');

    return `
      ${autosaveHtml}
      <div class="slots-divider"></div>
      <div class="numbered-slots">${slotsHtml}</div>
    `;
  }

  private renderAutosaveSlot(data: SavedSlotData | null, playerEmpire: string, state: GameState): string {
    const slotName = 'autosave';
    const isSelected = this.selectedSlot === slotName;
    const info = data ? this.slotInfo(data, playerEmpire) : this.emptySlotInfo(slotName, state);
    const selectedClass = isSelected ? 'selected' : '';

    return `
      <div class="save-load-section">
        <h2 class="save-load-section-title">AUTO-SAVE</h2>
        <div class="save-slot${selectedClass}" data-slot="${slotName}" data-is-autosave="true">
          <div class="slot-label">
            <span class="slot-icon">💾</span>
            <span class="slot-name">Auto-Save</span>
          </div>
          <div class="slot-info">${info}</div>
          <div class="slot-actions">
            <button class="btn-load btn-primary" data-action="load" data-slot="${slotName}" ${!data ? 'disabled' : ''}>Load</button>
            <button class="btn-save" data-action="save" data-slot="${slotName}">Overwrite</button>
          </div>
        </div>
      </div>
    `;
  }

  private renderSlot(slotNum: number, data: SavedSlotData | null, playerEmpire: string, state: GameState): string {
    const slotName = `save_${slotNum}`;
    const isSelected = this.selectedSlot === slotName;
    const info = data ? this.slotInfo(data, playerEmpire) : this.emptySlotInfo(slotNum, state);
    const selectedClass = isSelected ? 'selected' : '';

    return `
      <div class="save-slot${selectedClass}" data-slot="${slotName}">
        <div class="slot-label">
          <span class="slot-number">Slot ${slotNum}</span>
        </div>
        <div class="slot-info">${info}</div>
        <div class="slot-actions">
          <button class="btn-load btn-primary" data-action="load" data-slot="${slotName}" ${!data ? 'disabled' : ''}>Load</button>
          <button class="btn-save" data-action="save" data-slot="${slotName}">Save</button>
          <button class="btn-delete btn-danger" data-action="delete" data-slot="${slotName}">Delete</button>
        </div>
      </div>
    `;
  }

  private slotInfo(data: SavedSlotData, _playerEmpire: string): string {
    return `
      <div class="info-row"><span class="info-label">Turn</span><span>${data.turn}</span></div>
      <div class="info-row"><span class="info-label">Year</span><span>${data.year}</span></div>
      <div class="info-row"><span class="info-label">Empire</span><span>${data.empire}</span></div>
      <div class="info-row"><span class="info-label">Saved</span><span>${formatDate(data.savedAt)}</span></div>
    `;
  }

  private emptySlotInfo(_slotLabel: string | number, state: GameState): string {
    const playerEmpire = state.empires.byId[state.empires.playerId]?.name ?? 'Unknown';
    return `
      <div class="info-row"><span class="info-label">Turn</span><span>${state.turn}</span></div>
      <div class="info-row"><span class="info-label">Year</span><span>${state.year}</span></div>
      <div class="info-row"><span class="info-label">Empire</span><span>${playerEmpire}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="empty-slot">Empty</span></div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Event binding
  // ═══════════════════════════════════════════════════════════════════════

  private bindActions(state: GameState): void {
    // Slot selection (clicking a slot highlights it)
    this.container.querySelectorAll('.save-slot').forEach(el => {
      el.addEventListener('click', (e: Event) => {
        // Don't change selection if clicking a button inside the slot
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON') return;

        const slot = (el as HTMLElement).dataset['slot'];
        if (slot) {
          this.selectedSlot = slot;
          this.render(state);
        }
      });
    });

    // Action buttons (save, load, delete)
    this.container.querySelectorAll('.btn-load, .btn-save, .btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = (btn as HTMLElement).dataset['action'];
        const slot = (btn as HTMLElement).dataset['slot'];
        if (!action || !slot) return;

        if (action === 'save') {
          this.saveToSlot(slot, state);
          this.render(state);
        } else if (action === 'load') {
          this.loadFromSlot(slot);
        } else if (action === 'delete') {
          this.showDeleteConfirm(slot);
        }
      });
    });

    // Delete confirmation
    this.wireDeleteConfirm();
  }

  // ── Save to a slot ──────────────────────────────────────────────────────

  private saveToSlot(slot: string, state: GameState): void {
    const envelope = {
      version: 1,
      savedAt: Date.now(),
      turn: state.turn,
      year: state.year,
      empire: state.empires.byId[state.empires.playerId]?.name ?? 'Unknown',
      state,
    };
    try {
      localStorage.setItem(`hamster_${slot}`, JSON.stringify(envelope));
    } catch {
      // Storage quota exceeded
    }
  }

  // ── Load from a slot ────────────────────────────────────────────────────

  private loadFromSlot(slot: string): void {
    const raw = localStorage.getItem(`hamster_${slot}`);
    if (!raw) return;

    try {
      const envelope = JSON.parse(raw) as SavedSlotData;
      // Dispatch action to replace game state
      this.store.dispatch({
        type: 'LOAD_GAME',
        payload: { state: envelope.state },
      });
      // Navigate back to galaxy
      this.store.dispatch({
        type: 'NAVIGATE',
        payload: { screen: 'galaxy' },
      });
    } catch {
      // Invalid save data — ignore
    }
  }

  // ── Delete with confirmation ────────────────────────────────────────────

  private showDeleteConfirm(slot: string): void {
    this.deleteConfirmSlot = slot;
    const overlay = this.container.querySelector('#delete-confirm-overlay') as HTMLElement | null;
    const text = this.container.querySelector('#delete-confirm-text') as HTMLElement | null;
    if (overlay) overlay.style.display = 'flex';
    if (text) text.textContent = `Delete ${slot}? This action cannot be undone.`;
  }

  private hideDeleteConfirm(): void {
    this.deleteConfirmSlot = null;
    const overlay = this.container.querySelector('#delete-confirm-overlay') as HTMLElement | null;
    if (overlay) overlay.style.display = 'none';
  }

  private wireDeleteConfirm(): void {
    const cancelBtn = this.container.querySelector('#delete-cancel-btn') as HTMLElement | null;
    const confirmBtn = this.container.querySelector('#delete-confirm-btn') as HTMLElement | null;

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideDeleteConfirm());
    }
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (this.deleteConfirmSlot) {
          deleteSlot(this.deleteConfirmSlot);
          this.hideDeleteConfirm();
          // Re-render to reflect the change
          const state = this.store.getState();
          this.render(state);
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Visibility
  // ═══════════════════════════════════════════════════════════════════════

  show(): void {
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.classList.remove('active');
  }
}
