# Changelog

## 1.0.1 — 2026-08-21

Pre-publication hardening pass. No balance, mechanics, or content changes.

### Security
- **Stored XSS fixed.** Empire and star colours were interpolated into `style="color:…"` inside strings assigned to `innerHTML`, so a save file could close the attribute and inject a tag. An imported save from a stranger could run script in the page and read or rewrite every save in browser storage. Colours now go through `util.safeColor()` (hex literals only) and star names through `util.esc()` at every markup sink.
- The player's own **Home World name** reached `innerHTML` unescaped in the fleet panel; typing markup into the new-game form executed it.
- Save import now validates galaxy dimensions, nebulas, and per-star fields, and a save that passes validation but fails to render no longer destroys the running game — the previous session is restored.

### Fixes
- Re-picking the research project already under way no longer discards its accumulated investment. A stale research-choice dispatch could silently wipe hundreds of RP.
- Research-choice dispatches now supersede their own predecessor per field instead of stacking; the dispatch feed can no longer grow until it covers the map and clips its oldest entries out of reach.
- A busy turn can no longer evict the dispatch that just arrived once the feed is full of pending decisions.
- Queued battles are rebuilt from live state when you command them, so a second battle at the same system can't resurrect ships or missile bases lost in the first.
- The Guardian of Orion reads its own battle rather than a shared reference — two empires reaching Orion in the same year no longer discards the player's kill.
- Bombing out an empire's last colony eliminates it immediately, as invasion and monsters already did.
- A transport whose empire was eliminated earlier in the same landing phase can no longer invade and found a colony for a dead empire.
- Accepting a High Council verdict showed the end-of-game dialog twice; after "Keep Playing" it reopened at the end of every later turn. An eliminated empire is no longer offered a "Keep Playing" button that leads nowhere.
- A half-issued transport or relocation order no longer survives into a loaded game and fire against the wrong galaxy.
- The Message Log no longer carries the previous game's dispatches into a new one.

### Compatibility & performance
- Tactical combat renders at device pixel ratio (no longer blurry on HiDPI displays) and no longer traps Tab, so its controls are reachable by keyboard.
- The galaxy map drops to its idle heartbeat when the window is unfocused or a full-screen panel is open, instead of repainting at 30fps for the whole session.
- `-webkit-` prefixes added for `backdrop-filter` and `user-select` (Safari).
- A dismissed dispatch can no longer be clicked again while it fades out.

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
