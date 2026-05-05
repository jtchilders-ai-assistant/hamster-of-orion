/**
 * Command bar UI component — persistent bottom bar.
 * src/ui/components/CommandBar.ts
 *
 * Renders the MOO1-style command bar:
 *   GAME | DESIGN | FLEET | MAP | RACES | PLANETS | TECH | REPORTS | COUNCIL | NEXT TURN
 *   ESC     F6       F3    ---    F5       F2       F4       F7         F8     [ENTER]
 *
 * Design Compliance (navigation-flow.md, screen-inventory.md, interaction-spec.md):
 * - ESC is the sole trigger for Game Menu (F10 intentionally omitted per §9)
 * - MAP opens a separate full-screen MAP view (not the Galaxy Map / F1) per §4.5
 * - F7 = Reports (Empire Statistics) per interaction-spec.md §2.1
 * - F1 navigates to Galaxy Map (handled by keyboard bindings, not command bar)
 *
 * QoL Additions (not in original MOO1 but documented as acceptable enhancements):
 * - Speed control buttons (slow/normal/fast) for combat and map animations
 * - Toast notification system for user feedback (e.g., "Council not yet formed")
 *
 * Active screen button is highlighted. F-key labels shown below each button.
 * Hover tooltips provide button descriptions.
 */

import { Store, Action } from '../../game/store';
import { GameState, ScreenType, GameSpeed } from '../../game/state';
import { nextTurn } from '../../game/actions/turn';
import { isCouncilFormationMet } from '../../game/systems/council';
import { TurnConfirmDialog } from './TurnConfirmDialog';

interface NavButton {
  label: string;
  fkey: string;
  screen: ScreenType;
  tooltip: string;
}

/**
 * Navigation buttons per MOO1 command bar layout.
 *
 * F-Key assignments per design/ui-ux/navigation-flow.md §9 and interaction-spec.md §2.1:
 *   F1 = Galaxy Map (not in command bar, handled via keyboard)
 *   F2 = Planets
 *   F3 = Fleet
 *   F4 = Tech
 *   F5 = Races (Diplomacy)
 *   F6 = Design
 *   F7 = Reports (HoO enhancement, restored per screen-inventory.md §2.8)
 *   F8 = Council (when active)
 *   ESC = Game Menu (F10 intentionally NOT bound per navigation-flow.md §9)
 *   MAP = No F-key (button-only, opens separate full-screen MAP view per §4.5)
 */
const NAV_BUTTONS: NavButton[] = [
  { label: 'GAME',    fkey: 'ESC', screen: 'menu',        tooltip: 'Game Menu — Save, Load, Options, Quit' },
  { label: 'DESIGN',  fkey: 'F6',  screen: 'ship_design', tooltip: 'Ship Design Lab — Create and modify ship blueprints' },
  { label: 'FLEET',   fkey: 'F3',  screen: 'fleet',       tooltip: 'Fleet Management — View and command your fleets' },
  { label: 'MAP',     fkey: '',    screen: 'map',         tooltip: 'Full Galaxy Map — Zoomed-out view with filters (Colonies, Environment, Minerals)' },
  { label: 'RACES',   fkey: 'F5',  screen: 'diplomacy',   tooltip: 'Diplomacy — Manage relations with other empires' },
  { label: 'PLANETS', fkey: 'F2',  screen: 'planet_list', tooltip: 'Colony Management — Oversee all your planets' },
  { label: 'TECH',    fkey: 'F4',  screen: 'research',    tooltip: 'Research — Direct your scientific efforts' },
  { label: 'REPORTS', fkey: 'F7',  screen: 'reports',     tooltip: 'Empire Reports — Statistics and graphs' },
  { label: 'COUNCIL', fkey: 'F8',  screen: 'council',     tooltip: 'Galactic High Council — Vote for Master of Orion' },
];

/**
 * Animation speed multipliers for combat and map animations.
 *
 * QoL Enhancement (not in original MOO1):
 * Speed controls are a modern convenience feature. They are not specified in
 * the design documents but are reasonable UX additions per screen-inventory.md.
 */
const SPEED_MULTIPLIERS: Record<GameSpeed, number> = {
  slow: 2.0,    // 2x duration (slower animations)
  normal: 1.0,  // Standard speed
  fast: 0.5,    // 0.5x duration (faster animations)
};

export class CommandBar {
  private readonly element: HTMLElement;
  private readonly navButtons: Map<ScreenType, HTMLButtonElement> = new Map();
  private readonly store: Store<GameState>;
  private readonly turnConfirmDialog: TurnConfirmDialog;
  private speedControlEl: HTMLElement | null = null;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.store = store;
    this.turnConfirmDialog = new TurnConfirmDialog(store);

    // Create or reuse the command bar element
    const existing = document.getElementById('command-bar');
    if (existing) {
      this.element = existing;
      this.element.innerHTML = ''; // rebuild contents
    } else {
      this.element = document.createElement('div');
      this.element.id = 'command-bar';
      container.appendChild(this.element);
    }

    this.buildButtons();
  }

  private buildButtons(): void {
    const store = this.store;

    // Navigation buttons
    for (const def of NAV_BUTTONS) {
      const btn = document.createElement('button');
      btn.className = 'cmd-nav-btn';
      btn.dataset['screen'] = def.screen;
      btn.dataset['testid'] = `cmd-${def.label.toLowerCase()}`;
      btn.title = def.tooltip; // Hover tooltip
      btn.innerHTML = `<span class="cmd-label">${def.label}</span><span class="cmd-fkey">${def.fkey}</span>`;

      btn.addEventListener('click', () => {
        // COUNCIL button: only navigate if council is active or forming
        if (def.screen === 'council') {
          const state = store.getState();
          const councilActive = state.highCouncil?.isActive ?? false;
          const councilForming = isCouncilFormationMet(state);
          if (!councilActive && !councilForming) {
            // Show feedback that council is not available
            this.showToast('Council not yet formed — colonize 50% of habitable planets');
            return;
          }
        }
        store.dispatch({ type: 'NAVIGATE', payload: { screen: def.screen } } as Action);
      });

      this.navButtons.set(def.screen, btn);
      this.element.appendChild(btn);
    }

    // Spacer
    const spacer = document.createElement('div');
    spacer.className = 'cmd-spacer';
    this.element.appendChild(spacer);

    // Speed control buttons
    this.speedControlEl = document.createElement('div');
    this.speedControlEl.id = 'speed-control';
    this.speedControlEl.className = 'speed-control';
    this.speedControlEl.title = 'Animation Speed — Affects combat and map animations';
    this.speedControlEl.innerHTML = `
      <span class="speed-label">SPEED:</span>
      <button data-speed="slow" data-testid="speed-slow" class="speed-btn" title="Slow animations (2x duration)">▶</button>
      <button data-speed="normal" data-testid="speed-normal" class="speed-btn" title="Normal animation speed">▶▶</button>
      <button data-speed="fast" data-testid="speed-fast" class="speed-btn" title="Fast animations (0.5x duration)">▶▶▶</button>
    `;
    this.element.appendChild(this.speedControlEl);

    // Wire up speed buttons
    this.speedControlEl.querySelectorAll<HTMLButtonElement>('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = btn.dataset['speed'] as GameSpeed;
        if (speed) {
          store.dispatch({ type: 'SET_GAME_SPEED', payload: { speed } } as Action);
        }
      });
    });

    // Status bar embedded in command bar (turn, year, credits, RP)
    const statusBar = document.createElement('div');
    statusBar.id = 'status-bar';
    statusBar.innerHTML = `
      <span data-testid="turn-display" title="Current game turn">Turn: 1</span>
      <span data-testid="year-display" title="Current galactic year">Year: 2500</span>
      <span data-testid="credits-display" title="Treasury balance (Billion Credits)">BC: 0</span>
      <span data-testid="research-display" title="Research Points generated per turn">RP: 0/turn</span>
    `;
    this.element.appendChild(statusBar);

    // Next turn button
    const nextTurnBtn = document.createElement('button');
    nextTurnBtn.id = 'next-turn';
    nextTurnBtn.dataset['testid'] = 'next-turn';
    nextTurnBtn.title = 'End your turn and process all empire actions';
    nextTurnBtn.innerHTML = `<span class="cmd-label">NEXT TURN</span><span class="cmd-fkey">ENTER</span>`;
    nextTurnBtn.addEventListener('click', () => {
      // Per design/ui-ux/state-transitions.md §3.3: show confirmation if enabled
      if (this.turnConfirmDialog.isOpen()) return;
      const confirmEnabled = this.store.getState().ui.settings.confirmEndTurn ?? true;
      if (!confirmEnabled) {
        store.dispatch(nextTurn());
        return;
      }
      this.turnConfirmDialog.show(() => {
        store.dispatch(nextTurn());
      });
    });
    this.element.appendChild(nextTurnBtn);
  }

  /**
   * Show a brief toast message for user feedback.
   *
   * QoL Enhancement (not in original MOO1):
   * Toast notifications are a modern UX pattern for non-blocking feedback.
   * Not specified in design documents but reasonable addition per screen-inventory.md.
   */
  private showToast(message: string): void {
    // Create or reuse toast element
    let toast = document.getElementById('cmd-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cmd-toast';
      toast.className = 'cmd-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast?.classList.remove('visible'), 2500);
  }

  render(state: GameState): void {
    // Highlight the active screen button
    for (const [screen, btn] of this.navButtons) {
      btn.classList.toggle('active', screen === state.currentScreen);

      // Disable COUNCIL button if council not yet formed
      if (screen === 'council') {
        const councilActive = state.highCouncil?.isActive ?? false;
        const councilForming = isCouncilFormationMet(state);
        btn.disabled = !councilActive && !councilForming;
        btn.classList.toggle('disabled', !councilActive && !councilForming);
      }
    }

    // Update speed control highlight
    if (this.speedControlEl) {
      const currentSpeed = state.gameSpeed ?? 'normal';
      this.speedControlEl.querySelectorAll<HTMLButtonElement>('.speed-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset['speed'] === currentSpeed);
      });
    }

    // Update status displays
    const turnEl = this.element.querySelector<HTMLElement>('[data-testid="turn-display"]');
    const yearEl = this.element.querySelector<HTMLElement>('[data-testid="year-display"]');
    const creditsEl = this.element.querySelector<HTMLElement>('[data-testid="credits-display"]');
    const rpEl = this.element.querySelector<HTMLElement>('[data-testid="research-display"]');

    if (turnEl) turnEl.textContent = `Turn: ${state.turn}`;
    if (yearEl) yearEl.textContent = `Year: ${state.year}`;

    const playerEmpire = state.empires.byId[state.empires.playerId];
    if (playerEmpire) {
      if (creditsEl) creditsEl.textContent = `BC: ${playerEmpire.credits}`;
      if (rpEl) rpEl.textContent = `RP: ${playerEmpire.research.researchPerTurn}/turn`;
    }
  }

  /** Get animation speed multiplier for the current game speed setting */
  static getAnimationMultiplier(state: GameState): number {
    return SPEED_MULTIPLIERS[state.gameSpeed ?? 'normal'] ?? 1.0;
  }
}
