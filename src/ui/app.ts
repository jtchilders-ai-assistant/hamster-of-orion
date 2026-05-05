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
import { HallOfFameScreen } from './screens/HallOfFameScreen';
import { MapScreen } from './screens/MapScreen';

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
    console.log('[App.buildScreens] root =', root?.id ?? 'null', 'children before =', root?.children.length);

    const coloniesEl   = this.makeScreenContainer(root, 'colonies-screen');
    const planetEl     = this.makeScreenContainer(root, 'planet-screen');
    const fleetsEl     = this.makeScreenContainer(root, 'fleets-screen');
    const researchEl   = this.makeScreenContainer(root, 'research-screen');
    const diplomacyEl  = this.makeScreenContainer(root, 'diplomacy-screen');
    const designEl     = this.makeScreenContainer(root, 'design-screen');
    const newGameEl    = this.makeScreenContainer(root, 'new-game-screen');
    const galaxyEl     = this.makeScreenContainer(root, 'galaxy-screen');
    const mapEl        = this.makeScreenContainer(root, 'map-screen');
    const combatEl          = this.makeScreenContainer(root, 'combat-screen');
    const groundCombatEl   = this.makeScreenContainer(root, 'ground-combat-screen');
    const councilEl        = this.makeScreenContainer(root, 'council-screen');
    const saveLoadEl       = this.makeScreenContainer(root, 'save-load-screen');
    const turnSummaryEl    = this.makeScreenContainer(root, 'turn-summary-screen');
    const victoryEl        = this.makeScreenContainer(root, 'victory-screen');
    const reportsEl   = this.makeScreenContainer(root, 'reports-screen');
    const hallOfFameEl = this.makeScreenContainer(root, 'hall-of-fame-screen');

    // Wrap screen instantiation in try/catch — one failure shouldn't kill all screens
    const screenInstances: [ScreenType, Screen][] = [];
    try {
      const turnSummary = new TurnSummaryScreen(turnSummaryEl, store);
      const victory = new VictoryScreen(victoryEl, store);

      screenInstances.push(
        ['new_game',         new NewGameScreen(newGameEl, store)],
        ['galaxy',           new GalaxyScreen(galaxyEl, store)],
        ['map',              new MapScreen(mapEl, store)],
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
        ['hall_of_fame',   new HallOfFameScreen(hallOfFameEl, store)],
      );
    } catch (err) {
      console.error('[App.buildScreens] ERROR creating screens:', err);
      // Fall back to just the new-game screen
      screenInstances.push(['new_game', new NewGameScreen(newGameEl, store)]);
    }

    console.log('[App.buildScreens] Creating map with', screenInstances.length, 'screens');
    return new Map(screenInstances);
  }

  private bindKeyboard(): void {
    // Galaxy-map pan step (galaxy-coord units per keypress).
    // Shift+Arrow pans 3× faster ("fast pan").
    const PAN_STEP      = 20;
    const PAN_STEP_FAST = 60;
    // Zoom step per keypress (+/- keys).
    const ZOOM_STEP = 0.25;

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      // ── 1. Turn-summary overlay: ESC dismisses it, nothing else fires ────────
      if (this.turnSummaryActive) {
        if (e.key === 'Escape') {
          e.preventDefault();
          (this.screens.get('turn_summary') as TurnSummaryScreen | undefined)?.continue();
        }
        // All other keys suppressed while turn summary is open.
        return;
      }

      // ── 2. True modal screens block F-key navigation ─────────────────────
      // Combat and ground-combat handle their own keys internally.
      if (MODAL_SCREENS.has(this.currentScreen)) return;

      // ── 3. ESC: return to galaxy map OR open game menu ────────────────
      // Per navigation-flow.md: "ESC from any main screen returns to the Galaxy Map (F1)."
      // From galaxy map, ESC opens the game menu.
      if (e.key === 'Escape') {
        e.preventDefault();
        if (this.currentScreen === 'galaxy') {
          // From galaxy map, open the game menu
          this.navigate('menu');
        } else if (this.currentScreen === 'save_load') {
          // From save/load screen, return to galaxy map
          this.navigate('galaxy');
        } else if (this.currentScreen === 'menu') {
          // From game menu, return to galaxy map (close menu)
          this.navigate('galaxy');
        } else {
          // From any other main screen, return to galaxy map
          this.navigate('galaxy');
        }
        return;
      }

      // ── 4. Ctrl+S: Quick Save ────────────────────────────────────────
      // Per interaction-spec.md §2.1: Ctrl+S = Quick Save
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.quickSave();
        return;
      }

      // ── 5. Ctrl+L: Load Game ─────────────────────────────────────────
      // Per interaction-spec.md §2.1: Ctrl+L = Load Game (open load dialog)
      if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.navigate('save_load');
        return;
      }

      // ── 6. Enter / Space: end turn ────────────────────────────────
      // Only on galaxy map — other screens may use Enter/Space differently
      if ((e.key === 'Enter' || e.key === ' ') && this.currentScreen === 'galaxy') {
        e.preventDefault();
        this.store.dispatch({ type: 'NEXT_TURN' } as Action);
        return;
      }

      // ── 7. F1–F8: global screen navigation ──────────────────────────
      const fTarget = F_KEY_MAP[e.key];
      if (fTarget !== undefined) {
        e.preventDefault();
        // F8 (council) is a no-op unless the High Council is currently in session.
        if (fTarget === 'council' && !this.store.getState().highCouncil?.isActive) return;
        this.navigate(fTarget);
        return;
      }

      // ── 8. Galaxy-map-only keys ──────────────────────────────────
      // Arrow-key panning and +/-/0 zoom only apply on the galaxy map.
      if (this.currentScreen !== 'galaxy') return;

      const step = e.shiftKey ? PAN_STEP_FAST : PAN_STEP;

      switch (e.key) {
        // ─ Arrow pan ──────────────────────────────────────────
        case 'ArrowLeft':
          e.preventDefault();
          this.store.dispatch({ type: 'PAN_CAMERA', payload: { dx: -step, dy: 0 } } as Action);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.store.dispatch({ type: 'PAN_CAMERA', payload: { dx: step, dy: 0 } } as Action);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.store.dispatch({ type: 'PAN_CAMERA', payload: { dx: 0, dy: -step } } as Action);
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.store.dispatch({ type: 'PAN_CAMERA', payload: { dx: 0, dy: step } } as Action);
          break;

        // ─ Zoom ──────────────────────────────────────────────
        case '+':
        case '=':  // unshifted + key on US keyboards
          e.preventDefault();
          this.store.dispatch({ type: 'ZOOM_CAMERA', payload: { delta: ZOOM_STEP } } as Action);
          break;
        case '-':
          e.preventDefault();
          this.store.dispatch({ type: 'ZOOM_CAMERA', payload: { delta: -ZOOM_STEP } } as Action);
          break;
        case '0':
          e.preventDefault();
          this.store.dispatch({ type: 'ZOOM_CAMERA', payload: { delta: 0 } } as Action);
          break;

        // ─ Colony/Fleet cycling (interaction-spec.md §2.2) ─────────────────
        case 'n':
        case 'N':
          e.preventDefault();
          this.store.dispatch({ type: e.shiftKey ? 'SELECT_PREV_COLONY' : 'SELECT_NEXT_COLONY' } as Action);
          break;
        case 'f':
          // Note: F key (lowercase only) cycles fleets; Shift+F cycles prev fleet.
          // F1-F8 are handled above in section 7, so we only get here for lowercase 'f'.
          e.preventDefault();
          this.store.dispatch({ type: e.shiftKey ? 'SELECT_PREV_FLEET' : 'SELECT_NEXT_FLEET' } as Action);
          break;

        // ─ Display toggles (interaction-spec.md §2.2) ──────────────────────
        case 'g':
        case 'G':
          e.preventDefault();
          this.store.dispatch({ type: 'TOGGLE_GRID' } as Action);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          this.store.dispatch({ type: 'TOGGLE_RANGE_CIRCLES' } as Action);
          break;
        case 't':
        case 'T':
          e.preventDefault();
          this.store.dispatch({ type: 'TOGGLE_TRADE_ROUTES' } as Action);
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          this.store.dispatch({ type: 'TOGGLE_HIGHLIGHT_ENEMIES' } as Action);
          break;
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

  // ── Quick Save (Ctrl+S) ────────────────────────────────────────────────
  // Saves to the autosave slot in localStorage.
  private quickSave(): void {
    const state = this.store.getState();
    const envelope = {
      version: 1,
      savedAt: Date.now(),
      turn: state.turn,
      year: state.year,
      empire: state.empires.byId[state.empires.playerId]?.name ?? 'Unknown',
      state,
    };
    try {
      localStorage.setItem('hamster_autosave', JSON.stringify(envelope));
      console.log('[App] Quick save completed to autosave slot');
      // TODO: Show a brief "Saved" toast notification
    } catch (err) {
      console.error('[App] Quick save failed:', err);
    }
  }
}
