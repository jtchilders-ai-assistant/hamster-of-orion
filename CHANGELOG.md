# Changelog

## 1.0.0 — 2026-08-21

Production-readiness release: a full audit against the MOO 1993 manual (140 verified findings) followed by a comprehensive fix pass. Highlights:

### Stability & saves
- Escape can no longer dismiss turn-sequence dialogs and soft-lock the game.
- Fixed the frame layout bug that shrank the map and inflated the bottom menu whenever no alerts were active.
- Saves are versioned (`{version, game}`), validated on load, and never crash the title screen on corrupt or blocked localStorage; legacy saves still load.
- Rolling pre-turn backup save; a mid-turn error now offers restoring the last good state instead of continuing on half-mutated data.
- Save export/import to a JSON file; six manual save slots; save failures are reported instead of showing a false success.
- Seeded RNG (mulberry32) threaded through saves — a reload continues the same stream, and bug reports are reproducible.

### Formula fidelity (per the 1993 manual)
- Population growth restored to the ~10% logistic base (was 20%).
- Eco restoration ladder corrected to 3/5/10/20 waste per BC; Complete Eco Restoration and Industrial Waste Elimination added.
- Soil/Advanced Soil Enrichment now raise max population +25%/+50%; atmospheric terraforming no longer inflates planet size.
- Worker output curve corrected; AI difficulty handicaps corrected to 50%–125%.
- Combat: multi-kill damage overflow (bombs and large salvos now destroy multiple units), nebulae zero ship shields, stasis field freezes, warp dissipator blocks retreat, retreat takes the manual's delayed warp-out, anti-missile rockets at 85%−5%/level, auto-repair at 15%/30%, scatter packs split 5/7/10, combat speed rounds up, bio weapons hit population and ignore shields.
- Ferret first strike implemented; Guinea Pig ground bonus corrected to +25; Mice non-canon "free refits" removed; Rats' non-canon +50% RP removed in favor of the Psilon larger-tech-tree mechanic.
- Per-game randomized tech-tree subsets: each empire can only research a portion of the tree each game; the rest must come from espionage, conquest, trade, or Orion.
- Espionage: framing is reachable, spy missions can target a tech field or sabotage objective (including incited rebellions), confessions destroy the network, capture rolls use computer-tech deltas.
- Diplomacy: trade ramps at the manual's rate symmetrically, wars propagate to allies, NAPs actually prevent incidental combat, no peace during the Final War, contact is established by fleets as well as colony proximity.
- Council convenes at two-thirds settled; the player can abstain or back a rival when a candidate.
- Guardian's arsenal fixed (a typo silently dropped a weapon group); Orion placement varies; galaxy generation uses per-color planet tables and stronger homeworld guarantees.
- Events: monsters (now distinct Amoeba and Crystal) spawn away from their target, move visibly, and can be fought tactically; events respect once-per-game flags; plague damage no longer double-applies; events check for empire elimination.
- AI: allocations always total 100% (no hidden overspend), bombards, retreats hopeless battles, initiates alliances/trades/threats, spends its reserve, obeys fuel range, designs up to huge hulls with specials, suppresses rebellions, and can attack the Guardian.

### UI
- Tactical combat: per-stack hull/shield/initiative readout, initiative-order banner, planet rendered, full casualty report after action, hotkeys blocked during battle.
- Colony sliders: rebalancing always sums to exactly 100% with locks respected; partial idling is surfaced.
- Fleet/planets screens: aligned columns, sorting and totals; scanner-gated intel (enemy ETAs and planet details require the appropriate scanner tech); no more unexplored-name tooltip leaks.
- Confirmations for loading over a running game and overwriting saves; in-game help & shortcuts reference; message log; fuel-range rings toggle; version shown in-game; favicon.
- Fixed listener/render-loop leaks; the map only redraws when needed and pauses when hidden; basic touch input (tap, drag-pan, pinch-zoom).

### Project
- MIT LICENSE added; README corrected to match actual mechanics (thirteen environments, two-thirds council, race table).
