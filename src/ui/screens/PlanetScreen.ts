/**
 * Planet management screen — full slider-based colony control.
 * src/ui/screens/PlanetScreen.ts
 *
 * Shows the 5 production sliders (SHIP / DEF / IND / ECO / TECH) for a
 * selected planet plus a live production preview panel.
 *
 * Layout: top header (planet name / stats) + left slider panel + right preview.
 *
 * Uses the rebalance algorithm from design/economy/slider-mathematics.md §7.
 * All rebalance logic is delegated to the pure function in
 * src/game/utils/sliders.ts so it can be unit-tested without DOM.
 */

import { GameState, Planet, PlanetId, PlanetProduction } from '../../game/state';
import { Store } from '../../game/store';
import { updateProduction, lockSlider, unlockSlider } from '../../game/actions/colony';
import { rebalanceSliders, SliderState } from '../../game/utils/sliders';
import {
  calculateNetProduction,
  allocateSliders,
  DEFAULT_PRODUCTION_CONTEXT,
} from '../../game/systems/production';

// ─────────────────────────────────────────────────────────────────────────────
// Slider metadata
// ─────────────────────────────────────────────────────────────────────────────

type SliderKey = keyof PlanetProduction;

interface SliderMeta {
  key: SliderKey;
  label: string;
  description: string;
  cssClass: string;
}

const SLIDER_META: readonly SliderMeta[] = [
  { key: 'ship',     label: 'SHIP',  description: 'Shipbuilding',   cssClass: 'slider-ship'     },
  { key: 'defense',  label: 'DEF',   description: 'Defense',        cssClass: 'slider-defense'  },
  { key: 'industry', label: 'IND',   description: 'Industry',       cssClass: 'slider-industry' },
  { key: 'ecology',  label: 'ECO',   description: 'Ecology',        cssClass: 'slider-ecology'  },
  { key: 'research', label: 'TECH',  description: 'Research',       cssClass: 'slider-research' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PlanetScreen
// ─────────────────────────────────────────────────────────────────────────────

export class PlanetScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  /** Current slider UI state (value + locked). Kept in-sync with store on each render. */
  private sliderState: SliderState = {
    ship:     { value: 20, locked: false },
    defense:  { value: 20, locked: false },
    industry: { value: 20, locked: false },
    ecology:  { value: 20, locked: false },
    research: { value: 20, locked: false },
  };

  /** Planet ID currently being displayed. */
  private currentPlanetId: PlanetId | null = null;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.buildLayout();
  }

  // ── Public interface (matches Screen interface in App) ────────────────────

  render(state: GameState): void {
    const planetId = state.ui.selectedPlanet;

    if (!planetId) {
      this.showNoPlanetSelected();
      return;
    }

    const planet = state.planets.byId[planetId];
    if (!planet || !planet.isColonized) {
      this.showNoPlanetSelected();
      return;
    }

    // Sync slider state when planet changes
    if (planetId !== this.currentPlanetId) {
      this.currentPlanetId = planetId;
      this.syncSlidersFromPlanet(planet);
    }

    this.renderPlanet(planet, state);
  }

  show(): void {
    this.container.style.display = '';
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.classList.remove('active');
  }

  // ── Layout construction ────────────────────────────────────────────────────

  private buildLayout(): void {
    this.container.innerHTML = `
      <div class="planet-screen" id="planet-screen-inner">

        <!-- Header -->
        <div class="planet-header" id="planet-header">
          <button class="btn-back" id="btn-back-to-galaxy" title="Back to Galaxy (F1)">← GALAXY</button>
          <div class="planet-title-block">
            <h1 class="planet-name" id="planet-name">—</h1>
            <div class="planet-stats" id="planet-stats"></div>
          </div>
        </div>

        <!-- Body: sliders + preview -->
        <div class="planet-body">

          <!-- Left: production sliders -->
          <div class="slider-panel" id="slider-panel">
            <h2 class="panel-heading">PRODUCTION</h2>
            ${SLIDER_META.map((m) => this.buildSliderRow(m)).join('')}
          </div>

          <!-- Right: production preview -->
          <div class="preview-panel" id="preview-panel">
            <h2 class="panel-heading">OUTPUT PREVIEW</h2>
            <div class="preview-content" id="preview-content">
              <p class="placeholder-label">No colony selected</p>
            </div>
          </div>

        </div>

        <!-- No planet overlay -->
        <div class="no-planet-overlay" id="no-planet-overlay" style="display:none;">
          <p>No colony selected. Return to the galaxy map and click a colony.</p>
          <button class="btn-back" id="btn-back-overlay">← GALAXY</button>
        </div>

      </div>
    `;

    this.bindStaticEvents();
  }

  /** Build HTML for one slider row (label + range input + lock button + value display). */
  private buildSliderRow(meta: SliderMeta): string {
    return `
      <div class="slider-row ${meta.cssClass}" data-slider-key="${meta.key}">
        <div class="slider-labels">
          <span class="slider-label">${meta.label}</span>
          <span class="slider-desc">${meta.description}</span>
        </div>
        <div class="slider-controls">
          <input
            type="range"
            class="slider-input"
            data-slider-key="${meta.key}"
            min="0"
            max="100"
            step="1"
            value="20"
            aria-label="${meta.description} allocation"
          />
          <span class="slider-value" data-slider-value="${meta.key}">20%</span>
          <button
            class="btn-lock"
            data-lock-key="${meta.key}"
            title="Lock ${meta.label} slider"
            aria-label="Lock ${meta.description}"
            aria-pressed="false"
          >🔓</button>
        </div>
      </div>
    `;
  }

  // ── Event wiring ───────────────────────────────────────────────────────────

  private bindStaticEvents(): void {
    // Back button → navigate to galaxy
    const backBtn = this.container.querySelector<HTMLButtonElement>('#btn-back-to-galaxy');
    backBtn?.addEventListener('click', () => {
      this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
    });

    const backOverlay = this.container.querySelector<HTMLButtonElement>('#btn-back-overlay');
    backOverlay?.addEventListener('click', () => {
      this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
    });

    // Slider inputs (input = live preview while dragging; change = commit to store)
    const sliderInputs = this.container.querySelectorAll<HTMLInputElement>('.slider-input');
    sliderInputs.forEach((input) => {
      const key = input.dataset.sliderKey as SliderKey;

      // Live feedback while dragging
      input.addEventListener('input', () => {
        this.handleSliderInput(key, Number(input.value));
      });

      // Commit on mouse release
      input.addEventListener('change', () => {
        this.commitSliders();
      });
    });

    // Lock buttons
    const lockBtns = this.container.querySelectorAll<HTMLButtonElement>('.btn-lock');
    lockBtns.forEach((btn) => {
      const key = btn.dataset.lockKey as SliderKey;
      btn.addEventListener('click', () => {
        this.toggleLock(key);
      });
    });
  }

  // ── Slider interaction ────────────────────────────────────────────────────

  /**
   * Called on every `input` event (live drag).
   * Rebalances in-memory sliderState and updates DOM without dispatching.
   */
  private handleSliderInput(key: SliderKey, newValue: number): void {
    const result = rebalanceSliders(this.sliderState, key, newValue);
    if (!result.ok) return; // Silently reject invalid moves

    this.sliderState = result.sliders;
    this.applySliderDOMValues();
    this.updatePreview();
  }

  /** Commit current sliderState to the store via UPDATE_PRODUCTION. */
  private commitSliders(): void {
    if (!this.currentPlanetId) return;

    const sliders: Partial<PlanetProduction> = {
      ship:     Math.round(this.sliderState.ship.value),
      defense:  Math.round(this.sliderState.defense.value),
      industry: Math.round(this.sliderState.industry.value),
      ecology:  Math.round(this.sliderState.ecology.value),
      research: Math.round(this.sliderState.research.value),
    };

    // Dispatch lock state too
    const keys: SliderKey[] = ['ship', 'defense', 'industry', 'ecology', 'research'];
    for (const k of keys) {
      if (this.sliderState[k].locked) {
        this.store.dispatch(lockSlider(this.currentPlanetId, k));
      } else {
        this.store.dispatch(unlockSlider(this.currentPlanetId, k));
      }
    }

    this.store.dispatch(updateProduction(this.currentPlanetId, sliders));
  }

  /** Toggle the lock state for a slider. */
  private toggleLock(key: SliderKey): void {
    this.sliderState = {
      ...this.sliderState,
      [key]: {
        ...this.sliderState[key],
        locked: !this.sliderState[key].locked,
      },
    };
    this.applySliderDOMValues();
    this.commitSliders();
  }

  // ── Sync helpers ──────────────────────────────────────────────────────────

  /** Pull slider values from planet production into local sliderState. */
  private syncSlidersFromPlanet(planet: Planet): void {
    const p = planet.production;
    // Preserve existing lock state (don't reset locks on planet switch)
    this.sliderState = {
      ship:     { value: p.ship,     locked: this.sliderState.ship.locked     },
      defense:  { value: p.defense,  locked: this.sliderState.defense.locked  },
      industry: { value: p.industry, locked: this.sliderState.industry.locked },
      ecology:  { value: p.ecology,  locked: this.sliderState.ecology.locked  },
      research: { value: p.research, locked: this.sliderState.research.locked },
    };
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  private showNoPlanetSelected(): void {
    const inner = this.container.querySelector<HTMLElement>('#planet-screen-inner');
    const overlay = this.container.querySelector<HTMLElement>('#no-planet-overlay');
    if (inner && overlay) {
      inner.style.opacity = '0.3';
      overlay.style.display = '';
    }
  }

  private renderPlanet(planet: Planet, state: GameState): void {
    // Hide overlay
    const inner = this.container.querySelector<HTMLElement>('#planet-screen-inner');
    const overlay = this.container.querySelector<HTMLElement>('#no-planet-overlay');
    if (inner && overlay) {
      inner.style.opacity = '';
      overlay.style.display = 'none';
    }

    this.updateHeader(planet, state);
    this.applySliderDOMValues();
    this.updatePreview();
  }

  private updateHeader(planet: Planet, state: GameState): void {
    const nameEl = this.container.querySelector<HTMLElement>('#planet-name');
    if (nameEl) nameEl.textContent = planet.name;

    const statsEl = this.container.querySelector<HTMLElement>('#planet-stats');
    if (!statsEl) return;

    const empire = planet.ownerId ? state.empires.byId[planet.ownerId] : null;
    const ownerName = empire ? empire.name : '—';

    statsEl.innerHTML = `
      <span class="stat"><strong>Type:</strong> ${this.formatPlanetType(planet)}</span>
      <span class="stat"><strong>Size:</strong> ${planet.size}</span>
      <span class="stat"><strong>Pop:</strong> ${planet.population.toFixed(1)} / ${planet.maxPopulation}</span>
      <span class="stat"><strong>Factories:</strong> ${planet.factories} / ${planet.maxFactories}</span>
      <span class="stat"><strong>Owner:</strong> ${ownerName}</span>
    `;
  }

  /** Push current sliderState values into DOM inputs and display spans. */
  private applySliderDOMValues(): void {
    const keys: SliderKey[] = ['ship', 'defense', 'industry', 'ecology', 'research'];
    for (const key of keys) {
      const val = this.sliderState[key].value;
      const locked = this.sliderState[key].locked;

      const input = this.container.querySelector<HTMLInputElement>(
        `.slider-input[data-slider-key="${key}"]`,
      );
      const display = this.container.querySelector<HTMLElement>(
        `[data-slider-value="${key}"]`,
      );
      const lockBtn = this.container.querySelector<HTMLButtonElement>(
        `[data-lock-key="${key}"]`,
      );

      if (input) {
        input.value = String(Math.round(val));
        input.disabled = locked;
      }
      if (display) {
        display.textContent = `${Math.round(val)}%`;
      }
      if (lockBtn) {
        lockBtn.textContent = locked ? '🔒' : '🔓';
        lockBtn.setAttribute('aria-pressed', String(locked));
        lockBtn.classList.toggle('locked', locked);
      }
    }
  }

  /** Recompute and display the production preview panel. */
  private updatePreview(): void {
    const previewEl = this.container.querySelector<HTMLElement>('#preview-content');
    if (!previewEl || !this.currentPlanetId) return;

    const state = this.store.getState();
    const planet = state.planets.byId[this.currentPlanetId];
    if (!planet) return;

    // Build a temporary planet with current slider values for preview
    const previewPlanet: Planet = {
      ...planet,
      production: {
        ship:     Math.round(this.sliderState.ship.value),
        defense:  Math.round(this.sliderState.defense.value),
        industry: Math.round(this.sliderState.industry.value),
        ecology:  Math.round(this.sliderState.ecology.value),
        research: Math.round(this.sliderState.research.value),
      },
    };

    // Use default context (baseline — production context isn't in MVP state yet)
    const ctx = DEFAULT_PRODUCTION_CONTEXT;
    const net = calculateNetProduction(previewPlanet, ctx);
    const alloc = allocateSliders(previewPlanet, net.netProduction, ctx);

    previewEl.innerHTML = `
      <div class="preview-section">
        <div class="preview-row">
          <span class="preview-label">Gross Production</span>
          <span class="preview-value">${net.gross.grossProduction.toFixed(1)} BC</span>
        </div>
        <div class="preview-row">
          <span class="preview-label">Pollution Cleanup</span>
          <span class="preview-value preview-cost">−${net.pollution.cleanupCost.toFixed(1)} BC</span>
        </div>
        <div class="preview-row preview-total">
          <span class="preview-label">Net Production</span>
          <span class="preview-value">${net.netProduction} BC</span>
        </div>
      </div>
      <div class="preview-divider"></div>
      <div class="preview-section">
        <h3 class="preview-heading">Allocation</h3>
        <div class="preview-row">
          <span class="preview-label">🚀 Shipbuilding</span>
          <span class="preview-value">${alloc.ship} BC/turn</span>
        </div>
        <div class="preview-row">
          <span class="preview-label">🛡️ Defense</span>
          <span class="preview-value">${alloc.defense} BC/turn</span>
        </div>
        <div class="preview-row">
          <span class="preview-label">🏭 Industry</span>
          <span class="preview-value">${alloc.industry} BC/turn</span>
        </div>
        <div class="preview-row">
          <span class="preview-label">🌿 Ecology</span>
          <span class="preview-value">${alloc.ecology} BC/turn</span>
        </div>
        <div class="preview-row">
          <span class="preview-label">🔬 Scientists</span>
          <span class="preview-value">${alloc.scientists.toFixed(1)} pop → ${alloc.techRP.toFixed(1)} RP/turn</span>
        </div>
      </div>
      <div class="preview-divider"></div>
      <div class="preview-section">
        <div class="preview-row">
          <span class="preview-label">Factory Capacity</span>
          <span class="preview-value">${planet.factories} / ${planet.maxFactories}</span>
        </div>
        <div class="preview-row">
          <span class="preview-label">Population</span>
          <span class="preview-value">${planet.population.toFixed(1)} / ${planet.maxPopulation}</span>
        </div>
        <div class="preview-row">
          <span class="preview-label">Pollution Generated</span>
          <span class="preview-value">${net.pollution.pollutionGenerated.toFixed(1)} units</span>
        </div>
      </div>
    `;
  }

  // ── Utility ───────────────────────────────────────────────────────────────

  private formatPlanetType(planet: Planet): string {
    return planet.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
