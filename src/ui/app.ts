/**
 * Main UI controller — screen router.
 * src/ui/app.ts
 */

import { Store } from '../game/store';
import { GameState, ScreenType } from '../game/state';
import { GalaxyScreen } from './screens/GalaxyScreen';

export class App {
  private readonly screens: Map<ScreenType, { show(): void; hide(): void; render(state: GameState): void }>;
  private currentScreen: ScreenType = 'galaxy';

  constructor(store: Store<GameState>) {
    const container = document.getElementById('app')!;
    const galaxyContainer = container.querySelector('#galaxy-screen') as HTMLElement ?? document.getElementById('galaxy-screen')!;

    this.screens = new Map([
      ['galaxy', new GalaxyScreen(galaxyContainer, store)],
    ]);

    // Subscribe to state changes
    store.subscribe((state) => this.onStateChange(state));

    // Initial render
    this.onStateChange(store.getState());
  }

  private onStateChange(state: GameState): void {
    // Handle screen transitions
    if (state.currentScreen !== this.currentScreen) {
      this.screens.get(this.currentScreen)?.hide();
      this.currentScreen = state.currentScreen;
      this.screens.get(this.currentScreen)?.show();
    }

    // Render active screen
    const activeScreen = this.screens.get(this.currentScreen);
    if (activeScreen) {
      activeScreen.render(state);
    }
  }
}
