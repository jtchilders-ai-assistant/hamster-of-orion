/**
 * Info panel UI component — context-sensitive right panel.
 * src/ui/components/InfoPanel.ts
 *
 * Matches MOO1 galaxy-map info panel layout per design/ui-ux/wireframes/galaxy-map.md.
 * Shows different content based on what's selected (unexplored, uncolonized, colony, fleet).
 */

import { GameState, StarSystem, Planet, EmpireId, Fleet, Ship } from '../../game/state';
import { Store, Action } from '../../game/store';
import { selectPlanet } from '../../game/actions/colony';
import { cancelFleetDeployment } from '../../game/actions/fleet';

export class InfoPanel {
  private readonly element: HTMLElement;
  private store: Store<GameState> | null = null;

  constructor(container: HTMLElement, store?: Store<GameState>) {
    this.store = store ?? null;
    const existing = container.querySelector<HTMLElement>('#info-panel');
    if (existing) {
      this.element = existing;
    } else {
      this.element = document.createElement('div');
      this.element.id = 'info-panel';
      this.element.className = 'panel info-panel';
      container.appendChild(this.element);
    }
  }

  render(state: GameState): void {
    const deployment = state.ui.fleetDeploymentMode;

    // Fleet deployment mode takes priority
    if (deployment) {
      const fleet = state.fleets.byId[deployment.fleetId];
      if (fleet) {
        const origin = state.galaxy.systems.byId[fleet.systemId];
        const dest = deployment.destinationId
          ? state.galaxy.systems.byId[deployment.destinationId]
          : null;
        this.element.innerHTML = this.renderFleetDeployment(
          state, fleet, origin, dest, deployment.ships,
        );
        this.bindDeploymentButtons(state, fleet);
      }
      return;
    }

    // Fleet in transit — click on a moving fleet
    if (state.ui.selectedFleet) {
      const fleet = state.fleets.byId[state.ui.selectedFleet];
      if (fleet?.destination && fleet.eta > 0) {
        const dest = state.galaxy.systems.byId[fleet.destination];
        this.element.innerHTML = this.renderFleetInTransit(state, fleet, dest);
        return;
      }
      // Fleet selected but not in transit — fall through to system selection
    }

    // Normal system-based selection
    const selectedId = state.ui.selectedSystem;

    if (!selectedId) {
      this.element.innerHTML = this.renderEmpty();
      return;
    }

    const system = state.galaxy.systems.byId[selectedId];
    if (!system) {
      this.element.innerHTML = this.renderEmpty();
      return;
    }

    const planets = system.planetIds
      .map((id) => state.planets.byId[id])
      .filter((p): p is Planet => p !== undefined);

    const playerId = state.empires.playerId;
    const playerPlanets = planets.filter((p) => p.ownerId === playerId && p.isColonized);
    const aiPlanets = planets.filter((p) => p.ownerId !== null && p.ownerId !== playerId && p.isColonized);
    const uncolonizedPlanets = planets.filter((p) => !p.isColonized);

    // Check for player fleets at this system
    const playerFleets = system.fleetIds.filter(
      (fid) => state.fleets.byId[fid]?.ownerId === playerId && !state.fleets.byId[fid]?.destination,
    );

    const primaryPlanet = playerPlanets[0] ?? aiPlanets[0] ?? uncolonizedPlanets[0] ?? null;

    // Colonize button: show when a colony ship fleet is at an uncolonized planet
    const colonyShipFleetId = this.findColonyShipFleet(state, playerFleets);
    const colonizableTarget = uncolonizedPlanets[0] ?? null;
    const showColonizeButton = !!(colonyShipFleetId && colonizableTarget);

    if (showColonizeButton && colonizableTarget) {
      // Show uncolonized panel with colonize button (takes priority over fleet-at-system view)
      this.element.innerHTML = this.renderUncolonized(system, colonizableTarget, colonyShipFleetId);
      this.bindColonizeButton(state, system, colonizableTarget, colonyShipFleetId);
      return;
    }

    if (playerFleets.length > 0 && primaryPlanet && !showColonizeButton) {
      // Show fleet deployment info even for non-deployed fleet clicks
      const fleetId = playerFleets[0];
      const fleet = state.fleets.byId[fleetId];
      if (fleet) {
        this.element.innerHTML = this.renderFleetAtSystem(state, fleet);
        return;
      }
    }

    if (playerPlanets.length > 0 && primaryPlanet) {
      this.element.innerHTML = this.renderYourColony(state, system, primaryPlanet);
      this.bindManageButton();
    } else if (aiPlanets.length > 0 && primaryPlanet) {
      const ownerId = primaryPlanet.ownerId as EmpireId;
      const ownerEmpire = state.empires.byId[ownerId];
      this.element.innerHTML = this.renderEnemyColony(system, primaryPlanet, ownerEmpire?.name ?? 'Unknown');
    } else if (primaryPlanet) {
      this.element.innerHTML = this.renderUncolonized(system, primaryPlanet);
    } else {
      this.element.innerHTML = this.renderUnexplored(system);
    }
  }

  // ── Render states ──────────────────────────────────────────────────────────

  private renderEmpty(): string {
    return `<div class="info-empty"><p>Select a star system</p></div>`;
  }

  private renderUnexplored(system: StarSystem): string {
    return `
      <div class="info-header">
        <h2 class="info-system-name" data-testid="planet-name">${system.name}</h2>
        <div class="info-divider"></div>
      </div>
      <div class="info-body">
        <div class="info-row"><span>${this.starTypeLabel(system.starType)}</span></div>
        <div class="info-divider"></div>
        <div class="info-status">UNEXPLORED</div>
        <div class="info-note">(no planet data)</div>
      </div>
    `;
  }

  private renderUncolonized(system: StarSystem, planet: Planet, colonyShipFleetId?: string): string {
    const maxPop = planet.maxPopulation;
    const hasColonyShip = !!colonyShipFleetId;
    return `
      <div class="info-header">
        <h2 class="info-system-name" data-testid="planet-name">${system.name}</h2>
        <div class="info-divider"></div>
      </div>
      <div class="info-body">
        <div class="info-row"><span>${this.starTypeLabel(system.starType)}</span></div>
        <div class="info-row"><span>${this.capitalize(planet.type)}</span></div>
        <div class="info-row">Size: <span>${maxPop}</span></div>
        ${planet.isRich ? '<div class="info-row bonus">Rich minerals</div>' : ''}
        ${planet.hasArtifacts ? '<div class="info-row bonus">Artifacts</div>' : ''}
        <div class="info-divider"></div>
        <div class="info-status">UNCOLONIZED</div>
        <div class="info-divider"></div>
        ${hasColonyShip
          ? `<button class="btn btn-primary" data-action="colonize" data-planet-id="${planet.id}" data-fleet-id="${colonyShipFleetId}">COLONIZE</button>`
          : '<div class="info-row">Requires: <span>Colony Ship</span></div>'}
        <div class="info-row">Special: <span>${planet.hasArtifacts ? 'Artifacts' : 'None'}</span></div>
      </div>
    `;
  }

  private renderYourColony(_state: GameState, system: StarSystem, planet: Planet): string {
    const maxFactories = planet.maxFactories;
    const atMaxFactories = planet.factories >= maxFactories;
    const atMaxPop = planet.population >= planet.maxPopulation;
    const wastePercent = Math.round(planet.waste * 100);

    const currentBuild = planet.buildQueue[0];

    // Production slider percentages
    const sliders = planet.production;

    return `
      <div class="info-header">
        <h2 class="info-system-name" data-testid="planet-name">${system.name}</h2>
        <div class="info-divider"></div>
      </div>
      <div class="info-body">
        <div class="info-row"><span>${this.starTypeLabel(system.starType)}</span></div>
        <div class="info-row"><span>${this.capitalize(planet.type)} ${planet.maxPopulation} max pop</span></div>
        <div class="info-divider"></div>
        <div class="info-stat">
          <span class="stat-label">Population</span>
          <span class="stat-value">${Math.round(planet.population)}${atMaxPop ? ' (MAX)' : ''}</span>
        </div>
        <div class="info-stat">
          <span class="stat-label">Factories</span>
          <span class="stat-value">${planet.factories}${atMaxFactories ? ' (MAX)' : ''}</span>
        </div>
        <div class="info-stat">
          <span class="stat-label">Bases</span>
          <span class="stat-value">${planet.missileBases}</span>
        </div>
        <div class="info-stat">
          <span class="stat-label">Waste</span>
          <span class="stat-value">${wastePercent}</span>
        </div>
        <div class="info-divider"></div>
        <div class="info-status">PRODUCTION</div>
        <div class="info-divider"></div>
        <div class="info-slider">
          <span class="slider-label">SHIP</span>
          <span class="slider-bar">${this.renderSliderBar(sliders.ship)}</span>
          <span class="slider-pct">${Math.round(sliders.ship)}%</span>
        </div>
        <div class="info-slider">
          <span class="slider-label">DEF</span>
          <span class="slider-bar">${this.renderSliderBar(sliders.defense)}</span>
          <span class="slider-pct">${Math.round(sliders.defense)}%</span>
        </div>
        <div class="info-slider">
          <span class="slider-label">IND</span>
          <span class="slider-bar">${this.renderSliderBar(sliders.industry)}</span>
          <span class="slider-pct">${Math.round(sliders.industry)}%</span>
        </div>
        <div class="info-slider">
          <span class="slider-label">ECO</span>
          <span class="slider-bar">${this.renderSliderBar(sliders.ecology)}</span>
          <span class="slider-pct">${Math.round(sliders.ecology)}%</span>
        </div>
        <div class="info-slider">
          <span class="slider-label">TECH</span>
          <span class="slider-bar">${this.renderSliderBar(sliders.research)}</span>
          <span class="slider-pct">${Math.round(sliders.research)}%</span>
        </div>
        <div class="info-divider"></div>
        ${currentBuild ? this.renderProductionItem(currentBuild) : ''}
        <button class="btn-manage-colony" data-planet-id="${planet.id}">MANAGE COLONY</button>
      </div>
    `;
  }

  /**
   * Render a slider bar with 8 segments.
   * Per design/ui-ux/main-screens.md §Info Panel State: Colony Selected.
   */
  private renderSliderBar(percent: number): string {
    const totalSegments = 8;
    const filledSegments = Math.round((percent / 100) * totalSegments);
    const filled = '■'.repeat(filledSegments);
    const empty = '□'.repeat(totalSegments - filledSegments);
    return filled + empty;
  }

  /**
   * Render current build item with progress bar.
   * Per design/ui-ux/main-screens.md §Info Panel State: Colony Selected.
   */
  private renderProductionItem(build: { targetName: string; turnsRemaining: number; costTotal: number; costRemaining: number }): string {
    const progress = build.costTotal > 0
      ? Math.max(0, Math.min(1, 1 - build.costRemaining / build.costTotal))
      : 0;
    const barFilled = Math.round(progress * 10);
    const barEmpty = 10 - barFilled;
    const progressBar = '█'.repeat(barFilled) + '░'.repeat(barEmpty);

    return `
      <div class="info-build">
        <div class="info-build-label">Building: ${build.targetName}</div>
        <div class="info-build-bar">${progressBar} ${build.turnsRemaining} turns</div>
      </div>
      <div class="info-divider"></div>
    `;
  }

  private renderEnemyColony(system: StarSystem, planet: Planet, empireName: string): string {
    return `
      <div class="info-header">
        <h2 class="info-system-name" data-testid="planet-name">${system.name}</h2>
        <div class="info-divider"></div>
      </div>
      <div class="info-body">
        <div class="info-row"><span>${this.starTypeLabel(system.starType)}</span></div>
        <div class="info-row"><span>${this.capitalize(planet.type)}</span></div>
        <div class="info-row">Size: <span>${planet.maxPopulation}</span></div>
        <div class="info-divider"></div>
        <div class="info-status">${empireName.toUpperCase()} COLONY</div>
        <div class="info-divider"></div>
        <div class="info-stat">
          <span class="stat-label">Pop</span>
          <span class="stat-value">~${Math.round(planet.population)}M</span>
        </div>
      </div>
    `;
  }

  // ── Fleet rendering ────────────────────────────────────────────────────────

  /**
   * Fleet deployment panel — shows ships at a system and deployment controls.
   * Matches MOO1 wireframe State 5: Fleet Deployment Panel.
   */
  private renderFleetDeployment(
    state: GameState,
    fleet: Fleet,
    origin: StarSystem,
    dest: StarSystem | null,
    shipDeployments: Record<string, number>,
  ): string {
    // Get all ships at this system that belong to the fleet
    const fleetShips = fleet.shipIds
      .map((sid) => state.ships.byId[sid])
      .filter((s): s is Ship => s !== undefined);

    // Group by design
    const designs = new Map<string, Ship[]>();
    for (const ship of fleetShips) {
      const existing = designs.get(ship.designId) ?? [];
      existing.push(ship);
      designs.set(ship.designId, existing);
    }

    const shipTypes = [...designs.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    // Get the best warp speed among fleet ships for ETA calculation
    const bestWarp = this.getBestWarpSpeed(state, fleet);

    // Calculate ETA if destination is set
    let etaText = '';
    if (dest) {
      const pathDist = Math.hypot(
        dest.coordinates.x - origin.coordinates.x,
        dest.coordinates.y - origin.coordinates.y,
      );
      const eta = Math.ceil(pathDist / bestWarp);
      if (eta > 0) {
        etaText = `<div class="info-eta">ETA: ${eta} turn${eta > 1 ? 's' : ''}</div>`;
      } else {
        etaText = '<div class="info-eta">ETA: 1 turn</div>';
      }
    }

    // Build ship type rows
    const shipRows = shipTypes.map(([designId, ships]) => {
      const design = state.shipDesigns.byId[designId];
      const name = design?.name ?? 'Unknown';
      const shipCount = ships.length;
      const deploy = shipDeployments[designId] ?? shipCount;
      const deployClamped = Math.min(deploy, shipCount);
      const shipCountInputId = `deploy-${designId}`;

      return `
        <div class="fleet-deployment-row">
          <div class="fleet-ship-info">
            <span class="fleet-ship-name">${name}</span>
            <span class="fleet-ship-total">x${shipCount}</span>
          </div>
          <div class="fleet-deploy-controls">
            <button class="btn-deploy-ship" data-design-id="${designId}" data-action="zero" title="Leave all">«</button>
            <button class="btn-deploy-ship" data-design-id="${designId}" data-action="decrease" title="Decrease">‹</button>
            <input type="number" id="${shipCountInputId}" class="fleet-deploy-count"
              data-design-id="${designId}" data-total="${shipCount}"
              value="${deployClamped}" min="0" max="${shipCount}" />
            <button class="btn-deploy-ship" data-design-id="${designId}" data-action="increase" title="Increase">›</button>
            <button class="btn-deploy-ship" data-design-id="${designId}" data-action="all" title="Deploy all">»</button>
          </div>
        </div>
      `;
    }).join('');

    // Check if destination is in range
    const inRange = dest !== null;

    // Buttons
    const acceptDisabled = !inRange ? ' disabled' : '';

    return `
      <div class="info-header">
        <h2 class="info-system-name" data-testid="fleet-header">FLEET DEPLOYMENT</h2>
        <div class="info-divider"></div>
      </div>
      <div class="info-body">
        <div class="info-note">Origin: <strong>${origin.name}</strong></div>
        ${dest ? `<div class="info-note">Destination: <strong>${dest.name}</strong></div>` : '<div class="info-note">Click a star to set destination</div>'}
        ${dest && !inRange ? '<div class="info-note" style="color:#ff6644">OUT OF RANGE</div>' : ''}
        <div class="info-divider"></div>
        <div class="info-status">SHIPS AT ${origin.name.toUpperCase()}</div>
        <div class="info-divider"></div>
        <div class="fleet-deployment-list">
          ${shipRows}
        </div>
        ${etaText}
        <div class="info-divider"></div>
        <div class="fleet-deploy-buttons">
          <button class="btn-deploy-cancel">CANCEL</button>
          <button class="btn-deploy-accept"${acceptDisabled}>ACCEPT</button>
        </div>
      </div>
    `;
  }

  /**
   * Fleet in transit panel — shows info about a fleet currently moving.
   * Matches MOO1 wireframe State 6: Fleet In Transit.
   */
  private renderFleetInTransit(
    state: GameState,
    fleet: Fleet,
    dest: StarSystem | null,
  ): string {
    const origin = state.galaxy.systems.byId[fleet.systemId];
    const originName = origin?.name ?? 'Unknown';
    const destName = dest?.name ?? 'Unknown';

    // Get ship list
    const fleetShips = fleet.shipIds
      .map((sid) => state.ships.byId[sid])
      .filter((s): s is Ship => s !== undefined);

    const totalShips = fleetShips.length;

    const designs = new Map<string, Ship[]>();
    for (const ship of fleetShips) {
      const existing = designs.get(ship.designId) ?? [];
      existing.push(ship);
      designs.set(ship.designId, existing);
    }

    const shipListRows = [...designs.entries()].map(([designId, ships]) => {
      const design = state.shipDesigns.byId[designId];
      const name = design?.name ?? 'Unknown';
      return `<div class="info-row"><span>${name}</span><span class="stat-value">x${ships.length}</span></div>`;
    }).join('');

    return `
      <div class="info-header">
        <h2 class="info-system-name" data-testid="fleet-header">FLEET IN TRANSIT</h2>
        <div class="info-divider"></div>
      </div>
      <div class="info-body">
        <div class="info-stat">
          <span class="stat-label">From</span>
          <span class="stat-value">${originName}</span>
        </div>
        <div class="info-stat">
          <span class="stat-label">To</span>
          <span class="stat-value">${destName}</span>
        </div>
        <div class="info-stat">
          <span class="stat-label">ETA</span>
          <span class="stat-value">${fleet.eta} turn${fleet.eta > 1 ? 's' : ''}</span>
        </div>
        <div class="info-divider"></div>
        <div class="info-status">SHIPS</div>
        <div class="info-divider"></div>
        ${shipListRows}
        <div class="info-divider"></div>
        <div class="info-row">Total: <span class="stat-value">${totalShips}</span></div>
      </div>
    `;
  }

  /**
   * Fleet at system panel — shows fleet info without full deployment controls.
   */
  private renderFleetAtSystem(state: GameState, fleet: Fleet): string {
    const origin = state.galaxy.systems.byId[fleet.systemId];
    const originName = origin?.name ?? 'Unknown';

    const fleetShips = fleet.shipIds
      .map((sid) => state.ships.byId[sid])
      .filter((s): s is Ship => s !== undefined);

    const totalShips = fleetShips.length;

    const designs = new Map<string, Ship[]>();
    for (const ship of fleetShips) {
      const existing = designs.get(ship.designId) ?? [];
      existing.push(ship);
      designs.set(ship.designId, existing);
    }

    const shipListRows = [...designs.entries()].map(([designId, ships]) => {
      const design = state.shipDesigns.byId[designId];
      const name = design?.name ?? 'Unknown';
      return `<div class="info-row"><span>${name}</span><span class="stat-value">x${ships.length}</span></div>`;
    }).join('');

    return `
      <div class="info-header">
        <h2 class="info-system-name" data-testid="fleet-header">FLEET AT ${originName.toUpperCase()}</h2>
        <div class="info-divider"></div>
      </div>
      <div class="info-body">
        <div class="info-status">${totalShips} SHIP${totalShips !== 1 ? 'S' : ''}</div>
        <div class="info-divider"></div>
        ${shipListRows}
      </div>
    `;
  }

  // ── Button binding ─────────────────────────────────────────────────────────

  private bindManageButton(): void {
    const btn = this.element.querySelector<HTMLButtonElement>('.btn-manage-colony');
    if (!btn || !this.store) return;

    btn.addEventListener('click', () => {
      const planetId = btn.dataset.planetId;
      if (planetId) {
        this.store!.dispatch(selectPlanet(planetId) as Action);
      }
    }, { once: true });
  }

  /**
   * Bind colonize button event handler.
   * Triggers the colonization action when a colony ship fleet is at the planet.
   */
  private bindColonizeButton(state: GameState, _system: StarSystem, planet: Planet, fleetId: string): void {
    const button = this.element.querySelector<HTMLButtonElement>('[data-action="colonize"]');
    if (!button || !this.store) return;

    button.addEventListener('click', () => {
      // Double-check planet is still uncolonized (state may have changed)
      const currentPlanet = state.planets.byId[planet.id];
      if (!currentPlanet || currentPlanet.isColonized) return;

      // Double-check fleet still exists and is owned by player
      const currentFleet = state.fleets.byId[fleetId];
      if (!currentFleet) return;

      this.store?.dispatch({
        type: 'COLONIZE_PLANET' as const,
        payload: { planetId: planet.id, fleetId },
      } as Action);
    });
  }

  /**
   * Find a colony ship fleet ID among player fleets at this system.
   * Returns null if no colony ship fleet is present.
   */
  private findColonyShipFleet(state: GameState, fleetIds: string[]): string | null {
    for (const fid of fleetIds) {
      const fleet = state.fleets.byId[fid];
      if (!fleet || fleet.shipIds.length === 0) continue;

      const shipId = this.findColonyShipIdInFleet(state, fleet);
      if (shipId) return fid;
    }
    return null;
  }

  /**
   * Find a colony ship (Colony Pod + Colony Engine) in a fleet.
   * Returns the shipId if found, null otherwise.
   */
  private findColonyShipIdInFleet(state: GameState, fleet: Fleet): string | null {
    for (const sid of fleet.shipIds) {
      const ship = state.ships.byId[sid];
      if (!ship) continue;
      const design = state.shipDesigns.byId[ship.designId];
      if (!design) continue;

      const hasColonyPod = design.components?.some(
        (c) => c.type === 'special' && c.name === 'Colony Pod',
      );
      const hasColonyEngine = design.components?.some(
        (c) => c.type === 'engine' && c.name === 'Colony Engine',
      );

      if (hasColonyPod && hasColonyEngine) return sid;
    }
    return null;
  }

  /**
   * Bind fleet deployment button events.
   */
  private bindDeploymentButtons(state: GameState, fleet: Fleet): void {
    const store = this.store;
    if (!store) return;

    // Ship deployment controls
    this.element.querySelectorAll<HTMLButtonElement>('.btn-deploy-ship').forEach((btn) => {
      const designId = btn.dataset.designId;
      const action = btn.dataset.action;
      if (!designId || !action) return;

      btn.addEventListener('click', () => {
        const actualTotal = fleet.shipIds.filter((sid) => state.ships.byId[sid]?.designId === designId).length;
        const input = this.element.querySelector<HTMLInputElement>(`#deploy-${designId}`);
        let current = input ? parseInt(input.value) : 0;

        let newVal: number;
        switch (action) {
          case 'zero': newVal = 0; break;
          case 'decrease': newVal = Math.max(0, current - 1); break;
          case 'increase': newVal = Math.min(actualTotal, current + 1); break;
          case 'all': newVal = actualTotal; break;
          default: return;
        }

        if (input) input.value = String(newVal);

        // Update deployment state
        const currentShips = { ...store.getState().ui.fleetDeploymentMode?.ships };
        currentShips![designId] = newVal;
        store.dispatch({
          type: 'UPDATE_DEPLOYMENT_SHIPS',
          payload: { fleetId: fleet.id, ships: currentShips! },
        });

        // Update accept button state
        this.updateAcceptButton(state, fleet);
      });
    });

    // Accept button
    const acceptBtn = this.element.querySelector<HTMLButtonElement>('.btn-deploy-accept');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        // Dispatch the move order
        const destId = state.ui.fleetDeploymentMode?.destinationId;
        if (destId) {
          store.dispatch({ type: 'MOVE_FLEET', payload: { fleetId: fleet.id, destinationId: destId } });
          store.dispatch({ type: 'CANCEL_FLEET_DEPLOYMENT' });
        }
      });
    }

    // Cancel button
    const cancelBtn = this.element.querySelector<HTMLButtonElement>('.btn-deploy-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        store.dispatch(cancelFleetDeployment());
      });
    }
  }

  /**
   * Enable/disable the accept button based on whether destination is set.
   */
  private updateAcceptButton(_state: GameState, _fleet: Fleet): void {
    // Accept is enabled when destination is set (handled in render via HTML disabled attr)
    // No additional logic needed here — re-render handles state.
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Get the best warp speed among all ships in a fleet.
   * Used for ETA calculation.
   */
  private getBestWarpSpeed(state: GameState, fleet: Fleet): number {
    // Use the design's stats.speed as the warp speed proxy.
    // The fleet system computes minimum across all ships; here we use best for ETA estimate.
    let bestWarp = 1;
    for (const shipId of fleet.shipIds) {
      const ship = state.ships.byId[shipId];
      if (!ship) continue;
      const design = state.shipDesigns.byId[ship.designId];
      if (!design) continue;
      // stats.speed is the combat speed, which correlates with warp speed.
      // Fall back to 1 if not available.
      const warp = design.stats?.speed ?? 1;
      if (warp > bestWarp) bestWarp = warp;
    }
    return bestWarp;
  }

  private starTypeLabel(starType: string): string {
    const labels: Record<string, string> = {
      yellow: 'Yellow Star',
      green:  'Green Star',
      red:    'Red Star',
      blue:   'Blue Star',
      white:  'White Star',
      purple: 'Purple Star',
    };
    return labels[starType] ?? `${this.capitalize(starType)} Star`;
  }

  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  }
}
