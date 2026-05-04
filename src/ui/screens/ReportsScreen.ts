/**
 * Reports screen — empire reports hub with sub-screen navigation.
 * src/ui/screens/ReportsScreen.ts
 *
 * Reachable via F7 (global hotkey). Provides access to detailed reports:
 * - Empire Dashboard (overview)
 * - Charts & Statistics (trends/graphs)
 * - Technology Reports (tech analysis)
 * - Score Breakdown (rankings)
 * - Combat History (battle log)
 * - Diplomatic Matrix (relations grid)
 * - Hall of Fame (records)
 */

import { GameState } from '../../game/state';
import { Store } from '../../game/store';
import { EmpireDashboardScreen } from './EmpireDashboardScreen';
import { ChartsScreen } from './ChartsScreen';
import { TechReportsScreen } from './TechReportsScreen';
import { ScoreScreen } from './ScoreScreen';
import { CombatHistoryScreen } from './CombatHistoryScreen';
import { DiplomaticMatrixScreen } from './DiplomaticMatrixScreen';
import { HallOfFameScreen } from './HallOfFameScreen';

// ── Report tabs ───────────────────────────────────────────────────────────────

type ReportTab = 
  | 'dashboard' 
  | 'charts' 
  | 'tech' 
  | 'score' 
  | 'combat' 
  | 'diplomatic' 
  | 'hall_of_fame';

interface TabConfig {
  id: ReportTab;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'charts', label: 'Charts', icon: '📈' },
  { id: 'tech', label: 'Technology', icon: '🔬' },
  { id: 'score', label: 'Score', icon: '🏆' },
  { id: 'combat', label: 'Combat Log', icon: '⚔️' },
  { id: 'diplomatic', label: 'Relations', icon: '🤝' },
  { id: 'hall_of_fame', label: 'Hall of Fame', icon: '🏛️' },
];

// ── Reports Screen ────────────────────────────────────────────────────────────

export class ReportsScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  // Sub-screen containers and instances
  private readonly tabBar: HTMLElement;
  private readonly contentArea: HTMLElement;

  private readonly subScreens: Map<ReportTab, {
    container: HTMLElement;
    screen: { render: (state: GameState) => void; show: () => void; hide: () => void };
  }>;

  private activeTab: ReportTab = 'dashboard';
  private lastState: GameState | null = null;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.container.classList.add('reports-screen');

    // Build layout
    this.container.innerHTML = `
      <div class="reports-header">
        <h1>EMPIRE REPORTS</h1>
        <p class="reports-hint">Press F1–F6 to switch screens • ESC for Game Menu</p>
      </div>
      <div class="reports-tabs" id="reports-tabs"></div>
      <div class="reports-content" id="reports-content"></div>
    `;

    this.tabBar = this.container.querySelector('#reports-tabs')!;
    this.contentArea = this.container.querySelector('#reports-content')!;

    // Build tabs
    this.buildTabBar();

    // Initialize sub-screens
    this.subScreens = new Map();
    this.initializeSubScreens();
  }

  // ── Public interface (matches Screen interface in App) ──────────────────────

  render(state: GameState): void {
    this.lastState = state;
    
    // Render the active sub-screen
    const activeScreen = this.subScreens.get(this.activeTab);
    if (activeScreen) {
      activeScreen.screen.render(state);
    }
  }

  show(): void {
    this.container.style.display = '';
    this.container.classList.add('active');
    
    // Show the active sub-screen
    const activeScreen = this.subScreens.get(this.activeTab);
    if (activeScreen) {
      activeScreen.screen.show();
    }
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.classList.remove('active');

    // Hide all sub-screens
    for (const [, { screen }] of this.subScreens) {
      screen.hide();
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private buildTabBar(): void {
    this.tabBar.innerHTML = '';

    for (const tab of TABS) {
      const button = document.createElement('button');
      button.className = `report-tab ${tab.id === this.activeTab ? 'active' : ''}`;
      button.dataset['tab'] = tab.id;
      button.innerHTML = `<span class="tab-icon">${tab.icon}</span><span class="tab-label">${tab.label}</span>`;
      
      button.addEventListener('click', () => this.switchTab(tab.id));
      
      this.tabBar.appendChild(button);
    }
  }

  private initializeSubScreens(): void {
    for (const tab of TABS) {
      const containerEl = document.createElement('div');
      containerEl.className = `report-subscreen report-${tab.id}`;
      containerEl.style.display = 'none';
      this.contentArea.appendChild(containerEl);

      let screen: { render: (state: GameState) => void; show: () => void; hide: () => void };

      switch (tab.id) {
        case 'dashboard':
          screen = new EmpireDashboardScreen(containerEl, this.store);
          break;
        case 'charts':
          screen = new ChartsScreen(containerEl, this.store);
          break;
        case 'tech':
          screen = new TechReportsScreen(containerEl, this.store);
          break;
        case 'score':
          screen = new ScoreScreen(containerEl, this.store);
          break;
        case 'combat':
          screen = new CombatHistoryScreen(containerEl, this.store);
          break;
        case 'diplomatic':
          screen = new DiplomaticMatrixScreen(containerEl, this.store);
          break;
        case 'hall_of_fame':
          screen = new HallOfFameScreen(containerEl, this.store);
          break;
      }

      this.subScreens.set(tab.id, { container: containerEl, screen });
    }

    // Show initial tab
    const initialScreen = this.subScreens.get(this.activeTab);
    if (initialScreen) {
      initialScreen.container.style.display = '';
    }
  }

  private switchTab(tabId: ReportTab): void {
    if (tabId === this.activeTab) return;

    // Hide current
    const currentScreen = this.subScreens.get(this.activeTab);
    if (currentScreen) {
      currentScreen.container.style.display = 'none';
      currentScreen.screen.hide();
    }

    // Update active tab
    this.activeTab = tabId;

    // Update tab bar
    this.tabBar.querySelectorAll('.report-tab').forEach(btn => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset['tab'] === tabId);
    });

    // Show and render new tab
    const newScreen = this.subScreens.get(tabId);
    if (newScreen) {
      newScreen.container.style.display = '';
      newScreen.screen.show();
      if (this.lastState) {
        newScreen.screen.render(this.lastState);
      }
    }
  }
}
