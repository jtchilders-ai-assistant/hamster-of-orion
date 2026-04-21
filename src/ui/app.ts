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
import { NewGameScreen } from './screens/NewGameScreen';
import { PlanetScreen } from './screens/PlanetScreen';
import { CombatScreen } from './screens/CombatScreen';
import { CouncilScreen } from './screens/CouncilScreen';
import { CommandBar } from './components/CommandBar';
import { TurnSummaryScreen } from './screens/TurnSummaryScreen';
import { SaveLoadScreen } from './screens/SaveLoadScreen';

// ── F-key → Screen mapping (matches MOO1 command bar layout) ─────────────────

const F_KEY_MAP: Readonly<Record<string, ScreenType>> = {
  F1:  'galaxy',       // MAP
  F2:  'planet_list',  // PLANETS
  F3:  'fleet',        // FLEET
  F4:  'research',     // TECH
  F5:  'diplomacy',    // RACES
  F6:  'ship_design',  // DESIGN
  F8:  'save_load',    // SAVE/LOAD
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
  private turnSummaryActive: boolean = false;

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

    // Show and render initial screen
    this.screens.get(this.currentScreen)?.show();
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
    const planetEl     = this.makeScreenContainer(root, 'planet-screen');
    const fleetsEl     = this.makeScreenContainer(root, 'fleets-screen');
    const researchEl   = this.makeScreenContainer(root, 'research-screen');
    const diplomacyEl  = this.makeScreenContainer(root, 'diplomacy-screen');
    const designEl     = this.makeScreenContainer(root, 'design-screen');
    const newGameEl    = this.makeScreenContainer(root, 'new-game-screen');
    const combatEl       = this.makeScreenContainer(root, 'combat-screen');
    const councilEl      = this.makeScreenContainer(root, 'council-screen');
    const saveLoadEl     = this.makeScreenContainer(root, 'save-load-screen');
    const turnSummaryEl  = this.makeScreenContainer(root, 'turn-summary-screen');
    const turnSummary    = new TurnSummaryScreen(turnSummaryEl, store);

    return new Map<ScreenType, Screen>([
      ['new_game',         new NewGameScreen(newGameEl, store)],
      ['galaxy',           new GalaxyScreen(galaxyEl, store)],
      ['planet',           new PlanetScreen(planetEl, store)],
      ['planet_list',      new ColoniesScreen(coloniesEl)],
      ['fleet',            new FleetsScreen(fleetsEl, store)],
      ['research',         new ResearchScreen(researchEl, store)],
      ['diplomacy',        new DiplomacyScreen(diplomacyEl)],
      ['ship_design',      new DesignScreen(designEl, store)],
      ['combat',           new CombatScreen(combatEl, store)],
      ['council',          new CouncilScreen(councilEl)],
      ['save_load',        new SaveLoadScreen(saveLoadEl, store)],
      ['turn_summary',     turnSummary],
    ]);
  }

  private bindKeyboard(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      // Turn summary: ESC dismisses
      if (e.key === 'Escape' && this.turnSummaryActive) {
        (this.screens.get('turn_summary') as TurnSummaryScreen | undefined)?.continue();
        return;
      }

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
    const prevScreen = this.currentScreen;
    const prevTurnSummary = this.turnSummaryActive;

    // Special handling for turn summary — it's an overlay, not a full replacement
    if (state.currentScreen === 'turn_summary') {
      // Hide the underlying screen (galaxy, planets, etc.)
      this.screens.get(prevScreen)?.hide();
      this.currentScreen = 'turn_summary';
      this.turnSummaryActive = true;
      this.screens.get('turn_summary')?.render(state);
      this.screens.get('turn_summary')?.show();
      // Always render command bar
      this.commandBar.render(state);
      return;
    }

    // Dismiss turn summary overlay — show underlying screen
    if (prevTurnSummary) {
      this.screens.get('turn_summary')?.hide();
      this.turnSummaryActive = false;
      this.currentScreen = state.currentScreen;
      this.screens.get(state.currentScreen)?.render(state);
      this.screens.get(state.currentScreen)?.show();
      this.commandBar.render(state);
      return;
    }

    // Normal screen transition
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
