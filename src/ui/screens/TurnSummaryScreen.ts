/**
 * Turn Summary / Events Screen
 * src/ui/screens/TurnSummaryScreen.ts
 *
 * Shows between turns after "Next Turn" is clicked.
 * Displays research breakthroughs, ships built, combat results,
 * diplomatic events, and random events.
 *
 * Matches MOO1 start-of-turn screens:
 *   - moo_start_of_turn_select_new_research.png (research breakthrough popup)
 *   - moo_start_of_turn_new_ships.png (ships built this turn)
 *   - moo_start_of_turn_new_planet_reveal.png (new planet discovery)
 *
 * Acceptance criteria:
 *   1. Shows after Next Turn is clicked
 *   2. Lists research completed this turn
 *   3. Lists ships built this turn
 *   4. Lists combat results with links
 *   5. Lists diplomatic events
 *   6. Lists random events
 *   7. Continue button returns to galaxy map
 */

import { GameState, TurnEvent, TurnEventType } from '../../game/state';
import { Store } from '../../game/store';

// ── Event type metadata ──────────────────────────────────────────────────────

const EVENT_META: Record<TurnEventType, { icon: string; label: string; color: string }> = {
  research: { icon: '⚗️', label: 'Research Completed', color: '#8B5CF6' },
  ship_built: { icon: '🚀', label: 'Ships Built', color: '#3B82F6' },
  combat: { icon: '⚔️', label: 'Combat Results', color: '#EF4444' },
  diplomatic: { icon: '🤝', label: 'Diplomatic Events', color: '#10B981' },
  random_event: { icon: '⭐', label: 'Random Events', color: '#F59E0B' },
  colonization: { icon: '🏗️', label: 'Colonization', color: '#EC4899' },
  population: { icon: '👥', label: 'Population', color: '#06B6D4' },
  production: { icon: '🏭', label: 'Production', color: '#84CC16' },
  victory: { icon: '🏆', label: 'Victory', color: '#FBBF24' },
};

/** Group events by type, preserving insertion order for known types. */
function groupEvents(events: TurnEvent[]): Map<TurnEventType, TurnEvent[]> {
  const grouped = new Map<TurnEventType, TurnEvent[]>();
  const order: TurnEventType[] = [
    'research', 'ship_built', 'combat', 'diplomatic',
    'random_event', 'colonization', 'population', 'production', 'victory',
  ];
  for (const evt of events) {
    if (!grouped.has(evt.type)) {
      grouped.set(evt.type, []);
    }
    grouped.get(evt.type)!.push(evt);
  }
  // Reorder to match the display order
  const result = new Map<TurnEventType, TurnEvent[]>();
  for (const type of order) {
    if (grouped.has(type)) {
      result.set(type, grouped.get(type)!);
    }
  }
  return result;
}

// ── Screen class ─────────────────────────────────────────────────────────────

export class TurnSummaryScreen {
  private readonly container: HTMLElement;
  private readonly store: Store<GameState>;

  constructor(container: HTMLElement, store: Store<GameState>) {
    this.container = container;
    this.store = store;
    this.container.classList.add('turn-summary-screen');
  }

  render(state: GameState): void {
    // Clear and rebuild
    this.container.innerHTML = '';
    this.container.appendChild(this.buildPanel(state));
  }

  show(): void {
    this.container.style.display = '';
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.style.display = 'none';
    this.container.classList.remove('active');
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Navigate back to the previous screen (typically the galaxy map). */
  continue(): void {
    const state = this.store.getState();
    if (state.ui.previousScreen) {
      this.store.dispatch({ type: 'NAVIGATE', payload: { screen: state.ui.previousScreen } });
    } else {
      this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'galaxy' } });
    }
  }

  // ── Private builders ──────────────────────────────────────────────────────

  private buildPanel(state: GameState): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'turn-summary-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', `Turn ${state.turn} Summary`);

    // Background overlay (click to dismiss)
    const overlay = document.createElement('div');
    overlay.className = 'turn-summary-overlay';
    overlay.addEventListener('click', () => this.continue());
    panel.appendChild(overlay);

    // Main card
    const card = document.createElement('div');
    card.className = 'turn-summary-card';

    // Title
    const title = document.createElement('h2');
    title.className = 'turn-summary-title';
    title.textContent = `Turn ${state.turn} — ${state.year}`;
    card.appendChild(title);

    // Content
    const content = document.createElement('div');
    content.className = 'turn-summary-content';

    const events = state.turnEvents;

    if (events.length === 0) {
      // Empty state
      const empty = document.createElement('p');
      empty.className = 'turn-summary-empty';
      empty.textContent = `Turn ${state.turn} Complete — Nothing of note occurred.`;
      content.appendChild(empty);
    } else {
      // Group events by type
      const grouped = groupEvents(events);
      for (const [type, group] of grouped) {
        const meta = EVENT_META[type];
        const section = this.buildEventSection(type, group, meta);
        content.appendChild(section);
      }
    }

    card.appendChild(content);

    // Continue button
    const footer = document.createElement('div');
    footer.className = 'turn-summary-footer';
    const btn = document.createElement('button');
    btn.className = 'turn-summary-continue-btn';
    btn.textContent = 'Continue';
    btn.addEventListener('click', () => this.continue());
    footer.appendChild(btn);

    card.appendChild(footer);
    panel.appendChild(card);

    return panel;
  }

  private buildEventSection(
    _type: TurnEventType,
    events: TurnEvent[],
    meta: { icon: string; label: string; color: string },
  ): HTMLElement {
    const section = document.createElement('section');
    section.className = 'turn-summary-section';

    // Section header
    const header = document.createElement('div');
    header.className = 'turn-summary-section-header';

    const icon = document.createElement('span');
    icon.className = 'turn-summary-icon';
    icon.textContent = meta.icon;
    header.appendChild(icon);

    const label = document.createElement('h3');
    label.className = 'turn-summary-section-title';
    label.textContent = meta.label;
    header.appendChild(label);

    const badge = document.createElement('span');
    badge.className = 'turn-summary-badge';
    badge.textContent = `${events.length}`;
    header.appendChild(badge);

    section.appendChild(header);

    // Event list
    for (const evt of events) {
      const item = this.buildEventItem(evt, meta.color);
      section.appendChild(item);
    }

    return section;
  }

  private buildEventItem(evt: TurnEvent, accentColor: string): HTMLElement {
    const item = document.createElement('div');
    item.className = 'turn-summary-event-item';

    const content = document.createElement('div');
    content.className = 'turn-summary-event-content';

    // Title line
    const title = document.createElement('div');
    title.className = 'turn-summary-event-title';
    title.textContent = evt.title;
    content.appendChild(title);

    // Description
    const desc = document.createElement('div');
    desc.className = 'turn-summary-event-desc';
    desc.textContent = evt.description;
    content.appendChild(desc);

    // Optional system/planet/empire tags
    const tags: string[] = [];
    if (evt.systemId) {
      const sys = evt.systemId;
      tags.push(sys);
    }
    if (evt.empireId && evt.empireId !== 'player') {
      const emp = this.getEmpireName(evt.empireId);
      tags.push(emp);
    }
    if (tags.length > 0) {
      const tagRow = document.createElement('div');
      tagRow.className = 'turn-summary-event-tags';
      for (const tag of tags) {
        const tagEl = document.createElement('span');
        tagEl.className = 'turn-summary-tag';
        tagEl.textContent = tag;
        tagRow.appendChild(tagEl);
      }
      content.appendChild(tagRow);
    }

    // Combat link
    if (evt.type === 'combat' && evt.combatId) {
      const link = document.createElement('a');
      link.className = 'turn-summary-link';
      link.style.borderColor = accentColor;
      link.textContent = 'View Battle Report →';
      link.addEventListener('click', () => {
        const state = this.store.getState();
        const combat = state.combats.byId[evt.combatId!];
        if (combat) {
          this.store.dispatch({ type: 'NAVIGATE', payload: { screen: 'combat' } });
          if (state.ui) {
            this.store.dispatch({ type: 'OPEN_COMBAT', payload: { combatId: evt.combatId! } });
          }
        }
      });
      content.appendChild(link);
    }

    item.appendChild(content);
    return item;
  }

  private getEmpireName(empireId: string): string {
    const state = this.store.getState();
    const empire = state.empires.byId[empireId];
    return empire ? empire.name : empireId;
  }
}
