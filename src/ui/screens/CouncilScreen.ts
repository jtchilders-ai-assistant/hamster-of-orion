/**
 * High Council screen — Galactic diplomatic victory system.
 * src/ui/screens/CouncilScreen.ts
 *
 * Shows the two council candidates, vote tallies, and allows the player
 * to cast their vote or abstain. Displays the result if voting is complete.
 */

import { EmpireId, GameState } from '../../game/state';
import {
  calculateVoteShares,
  getCouncilCandidates,
  isCouncilTurn,
  VICTORY_THRESHOLD,
} from '../../game/systems/council';

export class CouncilScreen {
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.buildLayout();
  }

  // ── Layout ─────────────────────────────────────────────────────────────────

  private buildLayout(): void {
    this.container.innerHTML = `
      <div class="screen-header">
        <h1>GALACTIC HIGH COUNCIL</h1>
      </div>
      <div class="council-body" id="council-body">
        <p class="placeholder-label">Council not yet convened.</p>
      </div>
    `;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  render(state: GameState): void {
    const bodyEl = this.container.querySelector('#council-body');
    if (!bodyEl) return;

    const council = state.highCouncil;
    if (!council || !council.isActive) {
      bodyEl.innerHTML = this.renderInactive(state);
      return;
    }

    const player = Object.values(state.empires.byId).find(e => e.isPlayer);
    if (!player) return;

    const isVotingTurn = isCouncilTurn(state.turn);
    const voteShares = calculateVoteShares(state);

    let candidates: [EmpireId, EmpireId] | null = null;
    try {
      candidates = getCouncilCandidates(state);
    } catch (_err) {
      candidates = null;
    }

    const lastVoteEntry = council.voteHistory.length > 0
      ? council.voteHistory[council.voteHistory.length - 1]
      : null;
    const lastVote = lastVoteEntry ?? null;

    if (isVotingTurn && candidates) {
      bodyEl.innerHTML = this.renderVoting(candidates, voteShares, player.id, state);
      this.bindVoteButtons(state, player.id);
    } else {
      bodyEl.innerHTML = this.renderSummary(council, voteShares, lastVote as Parameters<typeof this.renderSummary>[2], state);
    }
  }

  // ── Inactive state ─────────────────────────────────────────────────────────

  private renderInactive(state: GameState): string {
    const colonized = Object.values(state.planets.byId).filter(p => p.ownerId !== null).length;
    const habitable = Object.values(state.planets.byId).filter(p => p.type !== 'gas_giant').length;
    const pct = habitable > 0 ? Math.round((colonized / habitable) * 100) : 0;
    const needed = Math.ceil(habitable * 0.5);

    return `
      <div class="council-inactive">
        <h2>Council Not Yet Formed</h2>
        <p>The Galactic High Council forms when 50% of habitable planets are colonized.</p>
        <div class="council-progress">
          <div class="progress-label">Galaxy colonization: ${pct}% (${colonized} / ${habitable} planets)</div>
          <div class="progress-bar-outer">
            <div class="progress-bar-inner" style="width:${pct}%"></div>
          </div>
          <div class="progress-needed">Need ${Math.max(0, needed - colonized)} more colonized planets to convene the Council</div>
        </div>
      </div>
    `;
  }

  // ── Voting state ───────────────────────────────────────────────────────────

  private renderVoting(
    candidates: [EmpireId, EmpireId],
    voteShares: Record<EmpireId, number>,
    playerId: EmpireId,
    state: GameState,
  ): string {
    const [candA, candB] = candidates;
    const empireA = state.empires.byId[candA];
    const empireB = state.empires.byId[candB];
    if (!empireA || !empireB) return '<p>Error: candidates not found.</p>';

    const shareA = (voteShares[candA] ?? 0).toFixed(1);
    const shareB = (voteShares[candB] ?? 0).toFixed(1);
    const playerShare = (voteShares[playerId] ?? 0).toFixed(1);
    const winThreshold = Math.round(VICTORY_THRESHOLD * 100);

    return `
      <div class="council-voting">
        <h2>THE COUNCIL HAS CONVENED — TURN ${state.turn}</h2>
        <p class="council-subtitle">Cast your vote for Master of Orion. ${winThreshold}% majority required to win.</p>

        <div class="all-empire-votes">
          <h3>All Empire Vote Shares</h3>
          <table class="empire-vote-table">
            <thead>
              <tr>
                <th>Empire</th>
                <th>Status</th>
                <th>Vote Share</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(voteShares)
                .sort((a, b) => b[1] - a[1])
                .map(([id, share]) => {
                  const empire = state.empires.byId[id];
                  const name = empire?.name ?? id;
                  const isCand = id === candA || id === candB;
                  const pct = share.toFixed(1);
                  return `
                  <tr class="empire-vote-row ${isCand ? 'empire-vote-row--candidate' : ''}">
                    <td class="empire-name">${name}</td>
                    <td class="empire-status">
                      ${isCand ? `<span class="badge badge--candidate">★ Candidate</span>` : '—'}
                    </td>
                    <td class="empire-pct">
                      <div class="vote-bar-outer bar-sm">
                        <div class="vote-bar-inner" style="width:${pct}%"></div>
                      </div>
                      ${pct}%
                    </td>
                  </tr>
                `;
                }).join('')}
            </tbody>
          </table>
        </div>

        <div class="candidate-row">
          <div class="candidate-card ${candA === playerId ? 'candidate-self' : ''}">
            <div class="candidate-portrait">${empireA.raceId.charAt(0).toUpperCase()}</div>
            <div class="candidate-name">${empireA.name}</div>
            <div class="candidate-share">${shareA}% of votes</div>
            <div class="vote-bar-outer">
              <div class="vote-bar-inner" style="width:${shareA}%"></div>
            </div>
            ${candA === playerId ? '<div class="self-tag">YOU</div>' : ''}
          </div>

          <div class="vs-label">VS</div>

          <div class="candidate-card ${candB === playerId ? 'candidate-self' : ''}">
            <div class="candidate-portrait">${empireB.raceId.charAt(0).toUpperCase()}</div>
            <div class="candidate-name">${empireB.name}</div>
            <div class="candidate-share">${shareB}% of votes</div>
            <div class="vote-bar-outer">
              <div class="vote-bar-inner" style="width:${shareB}%"></div>
            </div>
            ${candB === playerId ? '<div class="self-tag">YOU</div>' : ''}
          </div>
        </div>

        <div class="player-votes">
          <p>Your empire controls <strong>${playerShare}%</strong> of the total vote.</p>
        </div>

        <div class="vote-actions">
          <h3>Cast Your Vote</h3>
          <button class="vote-btn vote-btn-a" data-action="vote" data-target="${candA}">
            Vote for ${empireA.name}
          </button>
          <button class="vote-btn vote-btn-b" data-action="vote" data-target="${candB}">
            Vote for ${empireB.name}
          </button>
          <button class="vote-btn vote-btn-abstain" data-action="abstain" data-target="">
            Abstain
          </button>
        </div>
      </div>
    `;
  }

  // ── Summary state ──────────────────────────────────────────────────────────

  private renderSummary(
    council: NonNullable<GameState['highCouncil']>,
    voteShares: Record<EmpireId, number>,
    lastVote: { turn: number; candidates: EmpireId[]; results: Record<EmpireId, number>; winner: EmpireId | null; votes: Record<EmpireId, EmpireId> } | null,
    state: GameState,
  ): string {
    const nextVoteTurn = council.nextVoteTurn;
    const turnsUntil = Math.max(0, nextVoteTurn - state.turn);

    const shareRows = Object.entries(voteShares)
      .sort((a, b) => b[1] - a[1])
      .map(([id, share]) => {
        const empire = state.empires.byId[id];
        const name = empire?.name ?? id;
        const pct = share.toFixed(1);
        return `
          <div class="share-row">
            <span class="share-name">${name}</span>
            <div class="vote-bar-outer small">
              <div class="vote-bar-inner" style="width:${pct}%"></div>
            </div>
            <span class="share-pct">${pct}%</span>
          </div>
        `;
      }).join('');

    // Vote results summary (if a vote just happened)
    let voteResultSection = '';
    if (lastVote && lastVote.winner) {
      const player = Object.values(state.empires.byId).find(e => e.isPlayer);
      const winner = state.empires.byId[lastVote.winner];
      const playerWon = lastVote.winner === (player?.id ?? '');
      const outcomeClass = playerWon ? 'result-win' : 'result-lose';
      const outcomeIcon = playerWon ? '🏆' : '🔴';
      const outcomeText = playerWon
        ? 'Diplomatic Victory!' 
        : `${winner?.name ?? lastVote.winner} won`;
      
      // Build per-candidate vote breakdown
      const resultRows = lastVote.candidates
        .filter(c => lastVote.results[c] != null)
        .map(c => {
          const emp = state.empires.byId[c];
          const pct = (lastVote.results[c] ?? 0).toFixed(1);
          const isWinner = c === lastVote.winner;
          return `
            <div class="result-bar ${isWinner ? 'result-bar--winner' : ''}">
              <span class="result-bar-name">${emp?.name ?? c}</span>
              <span class="result-bar-pct">${pct}%</span>
            </div>
          `;
        }).join('');

      voteResultSection = `
        <div class="vote-result-summary ${outcomeClass}">
          <h3>🗳️ Election Result — Turn ${lastVote.turn}</h3>
          <div class="result-outcome">${outcomeIcon} ${outcomeText}</div>
          <p>${playerWon ? 'Your empire has been elected Master of Orion!' : `${winner?.name ?? lastVote.winner} has been elected Master of Orion.`}</p>
          ${resultRows}
          <p class="result-detail">${Math.round(VICTORY_THRESHOLD * 100)}% majority required</p>
        </div>
      `;
    }

    return `
      <div class="council-summary">
        <h2>HIGH COUNCIL STATUS</h2>
        <p>Formed on turn ${council.formationTurn}. ${council.voteHistory.length} elections held.</p>
        <p class="next-vote">Next vote: Turn ${nextVoteTurn} (${turnsUntil} turns away)</p>

        ${voteResultSection}

        <div class="vote-shares-section">
          <h3>Current Vote Shares</h3>
          <div class="share-list">${shareRows}</div>
        </div>

        <div class="victory-note">
          <p>A candidate must receive ${Math.round(VICTORY_THRESHOLD * 100)}% of votes to become Master of Orion.</p>
        </div>
      </div>
    `;
  }

  // ── Event binding ──────────────────────────────────────────────────────────

  private bindVoteButtons(_state: GameState, _playerId: EmpireId): void {
    this.container.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = (btn as HTMLElement).dataset['action'];
        const target = (btn as HTMLElement).dataset['target'];
        const event = new CustomEvent('council-action', {
          bubbles: true,
          detail: { action, targetEmpireId: target || null },
        });
        this.container.dispatchEvent(event);
      });
    });
  }

  // ── Visibility ─────────────────────────────────────────────────────────────

  show(): void {
    this.container.classList.add('active');
  }

  hide(): void {
    this.container.classList.remove('active');
  }
}
