/**
 * New Game Setup Wizard — 5-step linear wizard UI.
 * src/ui/screens/NewGameScreen.ts
 *
 * Steps:
 *   1. Galaxy Setup (size, opponents, difficulty, age)
 *   2. Race Selection (from races.json)
 *   3. Banner / Empire Color
 *   4. Emperor Name
 *   5. Home World Name → triggers game start
 *
 * All game logic lives in src/game/actions/newGame.ts.
 * This file is DOM-only: no game logic, no pure functions.
 */

import { Store, Action } from '../../game/store';
import { GameState, GalaxySize, DifficultyLevel } from '../../game/state';
import { startGame, NewGameOptions, GalaxyAge } from '../../game/actions/newGame';
import racesData from '../../data/races.json';

// ── Types ────────────────────────────────────────────────────────────────────

interface RaceData {
  id: string;
  name: string;
  description: string;
  homeworld: { name: string; type: string };
  bonuses: Record<string, number>;
  specialAbilities: Array<{ name: string; description: string }>;
}

interface WizardState {
  step: 1 | 2 | 3 | 4 | 5;
  galaxySize: GalaxySize;
  opponents: number;
  difficulty: DifficultyLevel;
  galaxyAge: GalaxyAge;
  raceId: string;
  empireColor: string;
  emperorName: string;
  homeworldName: string;
}

const EMPIRE_COLORS = [
  { label: 'Red',    value: '#cc2200' },
  { label: 'Blue',   value: '#1144cc' },
  { label: 'Green',  value: '#117733' },
  { label: 'Yellow', value: '#ccaa00' },
  { label: 'Purple', value: '#772299' },
  { label: 'Cyan',   value: '#009999' },
  { label: 'Orange', value: '#cc6600' },
  { label: 'White',  value: '#dddddd' },
];

// ── NewGameScreen ─────────────────────────────────────────────────────────────

export class NewGameScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;
  private wizard: WizardState;

  constructor(container: HTMLElement, store: Store<GameState>) {
    console.log('[NewGameScreen] Constructor called');
    this.container = container;
    this.container.id = 'new-game-screen';
    this.container.className = 'screen new-game-screen';
    this.store = store;

    const races = (racesData as { races: RaceData[] }).races;
    const defaultRace = races[0];

    this.wizard = {
      step: 1,
      galaxySize: 'medium',
      opponents: 5,
      difficulty: 'average',
      galaxyAge: 'average',
      raceId: defaultRace.id,
      empireColor: EMPIRE_COLORS[0].value,
      emperorName: 'Emperor',
      homeworldName: defaultRace.homeworld.name,
    };

    this.container.style.display = 'none';
    console.log('[NewGameScreen] Container display set to none, initial DOM: tag=', container?.tagName, 'id=', container?.id);
  }

  // ── Screen interface ────────────────────────────────────────────────────────

  show(): void {
    console.log('[NewGameScreen.show] Setting display to flex, current display:', this.container.style.display);
    this.container.style.display = 'flex';
    this.container.classList.add('active');
    console.log('[NewGameScreen.show] After setting flex and adding active, class=', this.container.className);
    this.wizard.step = 1;
    this.renderCurrentStep();
    console.log('[NewGameScreen.show] After render, container innerHTML length:', this.container.innerHTML.length);
    // Log computed styles (immediate - opacity 0 is expected before animation completes)
    if (typeof window !== 'undefined') {
      const computed = window.getComputedStyle(this.container);
      console.log('[NewGameScreen.show] Computed immediately: display=', computed.display, 'visibility=', computed.visibility, 'opacity=', computed.opacity);
      // Check opacity again after animation should complete (250ms)
      setTimeout(() => {
        const postAnim = window.getComputedStyle(this.container);
        console.log('[NewGameScreen.show] Computed after animation: opacity=', postAnim.opacity);
      }, 250);
    }
  }

  hide(): void {
    this.container.style.display = 'none';
  }

  render(_state: GameState): void {
    // State-driven re-renders not needed for this wizard;
    // wizard state is local to this component.
  }

  // ── Navigation helpers ──────────────────────────────────────────────────────

  private goNext(): void {
    if (this.wizard.step < 5) {
      this.wizard.step = (this.wizard.step + 1) as WizardState['step'];
      this.renderCurrentStep();
    }
  }

  private goBack(): void {
    if (this.wizard.step > 1) {
      this.wizard.step = (this.wizard.step - 1) as WizardState['step'];
      this.renderCurrentStep();
    } else {
      // Back on step 1 → return to main menu
      this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'menu' } } as Action);
    }
  }

  private beginGame(): void {
    const options: NewGameOptions = {
      galaxySize: this.wizard.galaxySize,
      opponents: this.wizard.opponents,
      difficulty: this.wizard.difficulty,
      galaxyAge: this.wizard.galaxyAge,
      raceId: this.wizard.raceId,
      empireColor: this.wizard.empireColor,
      emperorName: this.wizard.emperorName.trim() || 'Emperor',
      homeworldName: this.wizard.homeworldName.trim() || 'Home World',
      seed: Math.floor(Math.random() * 2_000_000_000),
    };
    this.store.dispatch(startGame(options));
  }

  // ── Step rendering ──────────────────────────────────────────────────────────

  private renderCurrentStep(): void {
    this.container.innerHTML = '';

    const panel = document.createElement('div');
    panel.className = 'wizard-panel';

    switch (this.wizard.step) {
      case 1: this.buildStep1(panel); break;
      case 2: this.buildStep2(panel); break;
      case 3: this.buildStep3(panel); break;
      case 4: this.buildStep4(panel); break;
      case 5: this.buildStep5(panel); break;
    }

    this.container.appendChild(panel);
  }

  // ── Step 1: Galaxy Setup ────────────────────────────────────────────────────

  private buildStep1(panel: HTMLElement): void {
    panel.appendChild(this.makeTitle('HAMSTER OF ORION'));
    panel.appendChild(this.makeSubtitle('── New Game Setup ──'));

    panel.appendChild(this.makeSelect(
      'Galaxy Size',
      ['small', 'medium', 'large', 'huge'],
      this.wizard.galaxySize,
      (v) => { this.wizard.galaxySize = v as GalaxySize; },
    ));

    panel.appendChild(this.makeNumberInput(
      'Opponents',
      this.wizard.opponents,
      1, 9,
      (v) => { this.wizard.opponents = v; },
    ));

    panel.appendChild(this.makeSelect(
      'Difficulty',
      ['easy', 'normal', 'hard', 'impossible'],
      this.wizard.difficulty,
      (v) => { this.wizard.difficulty = v as DifficultyLevel; },
    ));

    panel.appendChild(this.makeSelect(
      'Galaxy Age',
      ['young', 'average', 'old'],
      this.wizard.galaxyAge,
      (v) => { this.wizard.galaxyAge = v as GalaxyAge; },
    ));

    panel.appendChild(this.makeNavRow(
      () => this.goBack(),
      () => this.goNext(),
      'BACK', 'NEXT →',
    ));
  }

  // ── Step 2: Race Selection ──────────────────────────────────────────────────

  private buildStep2(panel: HTMLElement): void {
    panel.appendChild(this.makeSubtitle('── Select Your Race ──'));

    const races = (racesData as { races: RaceData[] }).races;

    const grid = document.createElement('div');
    grid.className = 'race-grid';

    for (const race of races) {
      const btn = document.createElement('button');
      btn.className = 'race-btn' + (race.id === this.wizard.raceId ? ' selected' : '');
      btn.textContent = race.name;
      btn.addEventListener('click', () => {
        this.wizard.raceId = race.id;
        this.wizard.homeworldName = race.homeworld.name;
        this.renderCurrentStep();
      });
      grid.appendChild(btn);
    }
    panel.appendChild(grid);

    // Race detail panel
    const selectedRace = races.find((r) => r.id === this.wizard.raceId) ?? races[0];
    const detail = document.createElement('div');
    detail.className = 'race-detail';
    detail.innerHTML = `
      <h3>${selectedRace.name}</h3>
      <p><strong>Homeworld:</strong> ${selectedRace.homeworld.name}</p>
      <p>${selectedRace.description}</p>
      <p><strong>Abilities:</strong> ${selectedRace.specialAbilities.map((a) => a.name).join(', ')}</p>
    `;
    panel.appendChild(detail);

    panel.appendChild(this.makeNavRow(
      () => this.goBack(),
      () => this.goNext(),
      '← BACK', 'NEXT →',
    ));
  }

  // ── Step 3: Banner / Color Selection ───────────────────────────────────────

  private buildStep3(panel: HTMLElement): void {
    panel.appendChild(this.makeSubtitle('── Choose Your Empire Color ──'));

    const colorGrid = document.createElement('div');
    colorGrid.className = 'color-grid';

    for (const color of EMPIRE_COLORS) {
      const btn = document.createElement('button');
      btn.className = 'color-btn' + (color.value === this.wizard.empireColor ? ' selected' : '');
      btn.title = color.label;
      btn.style.backgroundColor = color.value;
      btn.textContent = color.label;
      btn.addEventListener('click', () => {
        this.wizard.empireColor = color.value;
        this.renderCurrentStep();
      });
      colorGrid.appendChild(btn);
    }
    panel.appendChild(colorGrid);

    const preview = document.createElement('div');
    preview.className = 'color-preview';
    preview.style.backgroundColor = this.wizard.empireColor;
    preview.textContent = 'Empire Banner';
    panel.appendChild(preview);

    panel.appendChild(this.makeNavRow(
      () => this.goBack(),
      () => this.goNext(),
      '← BACK', 'NEXT →',
    ));
  }

  // ── Step 4: Emperor Name ────────────────────────────────────────────────────

  private buildStep4(panel: HTMLElement): void {
    panel.appendChild(this.makeSubtitle("── Enter Your Emperor's Name ──"));

    const field = this.makeTextInput(
      'Emperor',
      this.wizard.emperorName,
      20,
      (v) => { this.wizard.emperorName = v; },
    );
    panel.appendChild(field);

    const hint = document.createElement('p');
    hint.className = 'wizard-hint';
    hint.textContent = 'max 20 characters';
    panel.appendChild(hint);

    panel.appendChild(this.makeNavRow(
      () => this.goBack(),
      () => this.goNext(),
      '← BACK', 'NEXT →',
    ));
  }

  // ── Step 5: Home World Name ─────────────────────────────────────────────────

  private buildStep5(panel: HTMLElement): void {
    panel.appendChild(this.makeSubtitle('── Name Your Home World ──'));

    const field = this.makeTextInput(
      'Home World',
      this.wizard.homeworldName,
      20,
      (v) => { this.wizard.homeworldName = v; },
    );
    panel.appendChild(field);

    const hint = document.createElement('p');
    hint.className = 'wizard-hint';
    hint.textContent = 'max 20 characters';
    panel.appendChild(hint);

    panel.appendChild(this.makeNavRow(
      () => this.goBack(),
      () => this.beginGame(),
      '← BACK', 'BEGIN GAME →',
    ));
  }

  // ── Builder helpers ─────────────────────────────────────────────────────────

  private makeTitle(text: string): HTMLElement {
    const h1 = document.createElement('h1');
    h1.className = 'wizard-title';
    h1.textContent = text;
    return h1;
  }

  private makeSubtitle(text: string): HTMLElement {
    const h2 = document.createElement('h2');
    h2.className = 'wizard-subtitle';
    h2.textContent = text;
    return h2;
  }

  private makeSelect(
    label: string,
    options: string[],
    current: string,
    onChange: (value: string) => void,
  ): HTMLElement {
    const row = document.createElement('div');
    row.className = 'wizard-row';

    const lbl = document.createElement('label');
    lbl.textContent = label;
    row.appendChild(lbl);

    const sel = document.createElement('select');
    sel.className = 'wizard-select';
    for (const opt of options) {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
      if (opt === current) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => onChange(sel.value));
    row.appendChild(sel);

    return row;
  }

  private makeNumberInput(
    label: string,
    current: number,
    min: number,
    max: number,
    onChange: (value: number) => void,
  ): HTMLElement {
    const row = document.createElement('div');
    row.className = 'wizard-row';

    const lbl = document.createElement('label');
    lbl.textContent = label;
    row.appendChild(lbl);

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'wizard-input';
    input.min = String(min);
    input.max = String(max);
    input.value = String(current);
    input.addEventListener('change', () => {
      const v = Math.max(min, Math.min(max, Number(input.value)));
      input.value = String(v);
      onChange(v);
    });
    row.appendChild(input);

    const hint = document.createElement('span');
    hint.className = 'wizard-hint';
    hint.textContent = `(${min}–${max})`;
    row.appendChild(hint);

    return row;
  }

  private makeTextInput(
    label: string,
    current: string,
    maxLength: number,
    onChange: (value: string) => void,
  ): HTMLElement {
    const row = document.createElement('div');
    row.className = 'wizard-row';

    const lbl = document.createElement('label');
    lbl.textContent = `${label}:`;
    row.appendChild(lbl);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'wizard-input wizard-text';
    input.maxLength = maxLength;
    input.value = current;
    input.addEventListener('input', () => onChange(input.value));
    row.appendChild(input);

    return row;
  }

  private makeNavRow(
    onBack: () => void,
    onNext: () => void,
    backLabel: string,
    nextLabel: string,
  ): HTMLElement {
    const row = document.createElement('div');
    row.className = 'wizard-nav';

    const backBtn = document.createElement('button');
    backBtn.className = 'wizard-btn wizard-btn-back';
    backBtn.textContent = backLabel;
    backBtn.addEventListener('click', onBack);
    row.appendChild(backBtn);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'wizard-btn wizard-btn-next';
    nextBtn.textContent = nextLabel;
    nextBtn.addEventListener('click', onNext);
    row.appendChild(nextBtn);

    return row;
  }
}
