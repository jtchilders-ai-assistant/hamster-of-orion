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
import { VictoryScreen } from './screens/VictoryScreen';
import { SaveLoadScreen } from './screens/SaveLoadScreen';
import { GroundCombatScreen } from './screens/GroundCombatScreen';
import { ReportsScreen } from './screens/ReportsScreen';

// ── F-key → Screen mapping ────────────────────────────────────────────────────
// Canonical source: design/ui-ux/interaction-spec.md §2.1 (Global Shortcuts)
// and design/ui-ux/navigation-flow.md §9.
//
// F7  = Reports   (statistics/graphs)
// F8  = Council   (only when High Council is in session; no-op otherwise)
// F10 intentionally omitted — ESC is the sole Game Menu trigger.

const F_KEY_MAP: Readonly<Record<string, ScreenType>> = {
  F1: 'galaxy',       // Galaxy Map (central hub)
  F2: 'planet_list',  // Planets / colony management
  F3: 'fleet',        // Fleet screen
  F4: 'research',     // Technology / research tree
  F5: 'diplomacy',    // Races / diplomatic relations
  F6: 'ship_design',  // Ship design lab
  F7: 'reports',      // Empire reports & statistics
  F8: 'council',      // High Council (active when council is in session)
};

// Screens that block F-key navigation (true modals).
// While on these screens, F1–F8 do nothing to prevent accidental navigation.
const MODAL_SCREENS: ReadonlySet<ScreenType> = new Set([
  'combat',
  'ground_combat',
  'turn_summary',
]);

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
  private victoryActive: boolean = false;

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
    const combatEl          = this.makeScreenContainer(root, 'combat-screen');
    const groundCombatEl   = this.makeScreenContainer(root, 'ground-combat-screen');
    const councilEl        = this.makeScreenContainer(root, 'council-screen');
    const saveLoadEl       = this.makeScreenContainer(root, 'save-load-screen');
    const turnSummaryEl    = this.makeScreenContainer(root, 'turn-summary-screen');
    const turnSummary      = new TurnSummaryScreen(turnSummaryEl, store);
    const victoryEl        = this.makeScreenContainer(root, 'victory-screen');
    const victory          = new VictoryScreen(victoryEl, store);

    const reportsEl = this.makeScreenContainer(root, 'reports-screen');

    return new Map<ScreenType, Screen>([
      ['new_game',         new NewGameScreen(newGameEl, store)],
      ['galaxy',           new GalaxyScreen(galaxyEl, store)],
      ['planet',           new PlanetScreen(planetEl, store)],
      ['planet_list',      new ColoniesScreen(coloniesEl, store)],
      ['fleet',            new FleetsScreen(fleetsEl, store)],
      ['research',         new ResearchScreen(researchEl, store)],
      ['diplomacy',        new DiplomacyScreen(diplomacyEl)],
      ['ship_design',      new DesignScreen(designEl, store)],
      ['reports',          new ReportsScreen(reportsEl, store)],
      ['combat',           new CombatScreen(combatEl, store)],
      ['ground_combat',    new GroundCombatScreen(groundCombatEl, store)],
      ['council',          new CouncilScreen(councilEl)],
      ['save_load',        new SaveLoadScreen(saveLoadEl, store)],
      ['turn_summary',     turnSummary],
      ['victory',          victory],
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

    // Victory screen — shown when game is over
    if (state.isGameOver && state.victoryResult) {
      const victoryScreen = this.screens.get('victory') as VictoryScreen | undefined;
      if (victoryScreen) {
        if (!this.victoryActive) {
          // Hide whatever was active and show victory
          this.screens.get(prevScreen)?.hide();
          victoryScreen.render(state);
          victoryScreen.show();
          this.victoryActive = true;
        } else {
          victoryScreen.render(state);
        }
      }
      this.commandBar.render(state);
      return;
    } else if (this.victoryActive) {
      // Game is no longer over — hide victory, restore the underlying screen
      this.screens.get('victory')?.hide();
      this.victoryActive = false;
      this.screens.get(state.currentScreen)?.show();
    }

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
