/**
 * Main UI controller — screen router.
 * src/ui/app.ts
 *
 * Owns all screens, wires F-key navigation, and subscribes to store.
 * This is the single top-level UI orchestrator.
 */

import { Store, Action } from '../game/store';
import { GameState, ScreenType } from '../game/state';
import { GalaxyScreen } from './screens/GalaxyScreen';
import { ColoniesScreen } from './screens/ColoniesScreen';
import { FleetsScreen } from './screens/FleetsScreen';
import { ResearchScreen } from './screens/ResearchScreen';
import { DiplomacyScreen } from './screens/DiplomacyScreen';
import { DesignScreen } from './screens/DesignScreen';
import { CommandBar } from './components/CommandBar';

// ── F-key → Screen mapping (matches MOO1 command bar layout) ─────────────────

const F_KEY_MAP: Readonly<Record<string, ScreenType>> = {
  F1:  'galaxy',       // MAP
  F2:  'planet_list',  // PLANETS
  F3:  'fleet',        // FLEET
  F4:  'research',     // TECH
  F5:  'diplomacy',    // RACES
  F6:  'ship_design',  // DESIGN
  F10: 'menu',         // GAME (save/quit)
};

// ── Screen interface ──────────────────────────────────────────────────────────

interface Screen {
  show(): void;
  hide(): void;
  render(state: GameState): void;
}

// ── App ───────────────────────────────────────────────────────────────────────

export class App {
  private readonly store: Store<GameState>;
  private readonly screens: Map<ScreenType, Screen>;
  private readonly commandBar: CommandBar;
  private currentScreen: ScreenType;

  constructor(store: Store<GameState>) {
    this.store = store;
    this.currentScreen = store.getState().currentScreen;

    const root = this.ensureRoot();

    // Build screen containers and instances
    this.screens = this.buildScreens(root, store);

    // Persistent command bar — rendered outside any screen container
    const cmdContainer = this.ensureCommandBarContainer(root);
    this.commandBar = new CommandBar(cmdContainer, store);

    // Wire F-key keyboard navigation
    this.bindKeyboard();

    // Subscribe to state changes
    store.subscribe((state) => this.onStateChange(state));

    // Initial render
    this.onStateChange(store.getState());
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private ensureRoot(): HTMLElement {
    const root = document.getElementById('app');
    if (!root) throw new Error('Missing #app element');
    return root;
  }

  private ensureCommandBarContainer(root: HTMLElement): HTMLElement {
    let bar = root.querySelector<HTMLElement>('#command-bar-wrapper');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'command-bar-wrapper';
      root.appendChild(bar);
    }
    return bar;
  }

  /** Create or find a screen div inside #app and return the Screen instance. */
  private makeScreenContainer(root: HTMLElement, id: string): HTMLElement {
    let el = root.querySelector<HTMLElement>(`#${id}`);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.className = 'screen';
      root.appendChild(el);
    }
    return el;
  }

  private buildScreens(root: HTMLElement, store: Store<GameState>): Map<ScreenType, Screen> {
    const galaxyEl = root.querySelector<HTMLElement>('#galaxy-screen')
      ?? this.makeScreenContainer(root, 'galaxy-screen');

    const coloniesEl   = this.makeScreenContainer(root, 'colonies-screen');
    const fleetsEl     = this.makeScreenContainer(root, 'fleets-screen');
    const researchEl   = this.makeScreenContainer(root, 'research-screen');
    const diplomacyEl  = this.makeScreenContainer(root, 'diplomacy-screen');
    const designEl     = this.makeScreenContainer(root, 'design-screen');

    return new Map<ScreenType, Screen>([
      ['galaxy',      new GalaxyScreen(galaxyEl, store)],
      ['planet_list', new ColoniesScreen(coloniesEl)],
      ['fleet',       new FleetsScreen(fleetsEl)],
      ['research',    new ResearchScreen(researchEl)],
      ['diplomacy',   new DiplomacyScreen(diplomacyEl)],
      ['ship_design', new DesignScreen(designEl)],
    ]);
  }

  private bindKeyboard(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      // Enter or Space = next turn
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.store.dispatch({ type: 'NEXT_TURN' } as Action);
        return;
      }

      const target = F_KEY_MAP[e.key];
      if (target) {
        e.preventDefault();
        this.navigate(target);
      }
    });
  }

  private navigate(screen: ScreenType): void {
    this.store.dispatch({ type: 'NAVIGATE', payload: { screen } } as Action);
  }

  private onStateChange(state: GameState): void {
    // Handle screen transitions
    if (state.currentScreen !== this.currentScreen) {
      this.screens.get(this.currentScreen)?.hide();
      this.currentScreen = state.currentScreen;
      this.screens.get(this.currentScreen)?.show();
    }

    // Render active screen
    this.screens.get(this.currentScreen)?.render(state);

    // Always render command bar (it's persistent)
    this.commandBar.render(state);
  }
}
