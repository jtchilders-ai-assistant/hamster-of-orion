# Hamster of Orion — Production-Readiness Review Findings

Generated 2026-08-20 by a 20-agent review (10 domain reviewers + 10 adversarial verifiers, every finding traced to code) plus hands-on browser testing. 142 findings raised; 140 confirmed against the code, 2 refuted and dropped. Cross-domain duplicates are kept where two reviewers found the same issue independently (noted inline).


## CRITICAL

### [ui-code] Escape key closes noClose modals, soft-locking the turn pipeline
**Location:** `js/ui/ui.js:184` · **Category:** bug

HOO.UI.close() (ui.js:184-190) pops the top overlay without checking the noClose flag, and the global Escape handler (js/main.js:86-88) calls it unconditionally whenever hasOverlay() is true. The combat prompt (notices.js:104-125), the Cycle Reports digest (notices.js:229), council dialogs (notices.js:263-319), and after-action dialogs are all created with noClose:true because their buttons carry the queue continuation next()/done(). Pressing Escape on any of them removes the modal without running any continuation: done() in main.js endTurn never fires, so `processing` stays true forever, setWheelSpinning(false) never runs (the Turn button stays disabled), the turn's autosave (HOO.State.save('auto') at main.js:37) is skipped, and Enter is dead (endTurn early-returns on processing). The game is soft-locked until a page reload, which rolls back to the previous turn's autosave even though this turn's state mutations already ran. Escape is the most natural key to press on a modal, so this is trivially reachable.

*Verified:* js/ui/ui.js:184-190 close() pops overlays[last] and removes it with no noClose check (modal() at 160-181 never stores the noClose flag on the overlay, so close() could not check it even if it tried). js/main.js:86-87 calls HOO.UI.close() unconditionally on Escape whenever hasOverlay() is true (inGame() passes because #next-turn-btn exists under the modal). The combat prompt (notices.js:104-125, dialog(...,true)), Cycle Reports digest (notices.js:229, noClose:true, 'To the Bridge' button carries 


## HIGH

### [ai] AI colony allocations sum to up to 130%, letting AI colonies overspend production
**Location:** `js/game/ai.js:216` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual, Planet Production: the five spending bars (SHIP/DEF/IND/ECO/TECH) always divide 100% of a planet's output; difficulty handicaps are the only sanctioned AI production bonus

manageColonies builds alloc percentages that are never normalized, and processColony (colony.js:190-194) multiplies each bar by spend/100 with no cap on the total. Two paths exceed 100%: (1) the colony-ship path at ai.js:216 sets a.ship=max(a.ship,40) on top of a developing colony whose ind was already set to 100-eco-10, giving eco + 40 + (90-eco) = 130% — this happens on the AI's biggest colony for essentially the whole expansion era while wantColonyShip is true; (2) the developed-at-war path (ai.js:205-210) gives eco(clamped up to 60) + ship 45 + def 15 + ind 10 = up to 130% with tech floored at 0. The player is physically limited to 100% by the slider UI, so this is a hidden ~3-30% AI production cheat on every difficulty, stacked multiplicatively on top of the intended diff.aiProd bonus (colony.js:156).

*Verified:* Verified by tracing manageColonies (ai.js:183-227). Developing branch (ai.js:200-202): eco + ind(100-eco-10) + tech(10) = 100. Colony-ship override (ai.js:214-216) then sets a.ship=max(a.ship,40) and recomputes ONLY tech (floored at 0) while leaving ind at 90-eco, so total = eco + 40 + (90-eco) + 0 = 130. Developed-at-war branch (ai.js:204-210): ship 45 + def 15 + ind 10 + eco (clamped 4..60 at ai.js:197) with tech = max(0, 30-eco), so eco>30 pushes the total up to 130. processColony (colony.js:

### [ai] AI never bombards colonies — Ground.bombard is only reachable from player UI
**Location:** `js/game/ai.js:369` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Bombarding Planets / Fleet orders: any fleet orbiting an enemy colony may bombard it, killing population and factories; AI empires use this constantly during wars

HOO.Ground.bombard is invoked only from js/ui/notices.js:140 and js/ui/panels.js:144 (player buttons). No AI or turn-loop path ever calls it, and tactical combat only damages the missile-base stack (bases written back at combat.js:676-678), never pop/factories. Consequences: an AI war fleet parked over an enemy colony with 0 bases and hostility above the AI's maxHostility (ai.js:373-374 blocks invasion) is permanently stuck — it cannot harm the colony at all, and turn.js won't even generate a battle (bases must be >0 at turn.js:157). The AI also cannot soften heavily populated worlds before invading. In MOO 1993, AI fleets routinely bombard player colonies; this is a headline behavior MOO fans will immediately miss.

*Verified:* Grep confirms HOO.Ground.bombard is called only from js/ui/notices.js:140 and js/ui/panels.js:144, both player-only buttons (attacker id hardcoded to 0). No AI or turn-loop caller exists. Tactical combat writes back only base counts (combat.js:675-678); bombs in battle target the planetary base stack, never pop/factories. turn.js:157 requires colony.bases > 0 to generate a fleets-vs-colony battle, and the AI invasion path skips colonies whose planet hostility exceeds emp.derived.maxHostility (ai

### [combat] Aggregated damage applications can never kill more than one unit
**Location:** `js/game/combat.js:267` · **Category:** bug
**MOO 1993 rule:** MOO 1993 Ship Combat: each shot/bomb is resolved individually; a salvo that does multiple ships' worth of damage destroys multiple ships (bases have 50 hits each and are destroyed base-by-base)

applyDamage() with streaming=false breaks out of its kill loop after one kill and zeroes the remaining topDamage, so any call that passes summed damage can destroy at most ONE unit no matter how large the damage is. Several code paths pass aggregated damage: (a) bombs — fireWeapon's bomb branch (line 335) sums all bomb hits into dmgTot and applies it in one call, so a bombing run doing 500+ damage against a 10-base missile-base stack (50 hits/base) kills exactly 1 base per turn; (b) the >400-shot extrapolation for beams (line 373) and >400-missile extrapolation (line 465) lump the scaled extra damage into one call, so large stacks (e.g. 150+ autofire ships) drastically undercount kills; (c) pulsar damage (line 408). This is internally inconsistent with the per-shot loop just above (which kills correctly per shot) and makes reducing heavily-based planets by tactical bombing nearly impossible.

*Verifier correction:* Minor detail: the bomb sampling cap is 300 shots (combat.js:325), not 400; the 400 cap applies to beams (line 352) and missiles (line 448). The core defect is exactly as described.

*Verified:* applyDamage (combat.js:267-279): with streaming=false the kill loop hits `target.topDamage = 0; target.count--; killed++; if (!streaming) break;` — one kill max per call and all remaining damage discarded. Aggregated call sites verified: bomb branch sums up to 300 sampled shots (plus >300 scaling) into dmgTot and applies it once at line 335 with streaming=false; beam >400-shot extrapolation applies scaledExtra in one call at line 373; missile >400 extrapolation at line 465; pulsar at line 408. T

### [diplo-esp-council] Espionage 'frame another race' outcome is unreachable dead code
**Location:** `js/game/espionage.js:58` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual p.43 (Espionage): captured spies may implicate a different race, shifting the diplomatic blame to a framed third party

The framed-empire branch requires roll <= 0, where roll = U.roll100() (min 1) + secBonus (>= 0) + Math.max(0, defLv - attLv) (>= 0), minus 30 only when mission === 'hide'. For espionage/sabotage missions roll is always >= 1, so 'framed' is never set; for hide missions it can be set, but line 81 (`if (confessed || hiding || infiltrators <= 0) return;`) exits before the mission block that uses it. Consequently `frameOther = iroll >= 100 && framed` (line 86) is always false and blame always falls on the real spy empire. The file header claims 'manual p.43 tables implemented exactly', but the mistaken-identity/framing mechanic can never fire for any empire, AI or player.

*Verified:* espionage.js:54 computes roll = U.roll100() + secBonus + Math.max(0, defLv - attLv). U.roll100() is rint(1,100) (util.js:26, inclusive per comment at util.js:22), so min 1. secBonus = securityAlloc*2 + race.securityBonus (line 37); securityAlloc is slider-set >= 0 and the only nonzero securityBonus in data/races.js is Chameleons +20 — never negative. So for non-hide missions roll >= 1 and the `roll <= 0` framed branch (lines 56-60) is unreachable. For hide missions (roll -= 30, line 55) framed C

### [diplo-esp-council] Incite-rebellion sabotage and spy targeting are unreachable (sabTarget/techTarget never set)
**Location:** `js/game/espionage.js:114` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual p.43-44 (Sabotage): the saboteur selects a target planet and one of three missions — destroy factories, destroy missile bases, or incite rebellion

mode = sp.sabTarget || (bases > 2 ? 'bases' : 'factories'), but `sabTarget` is never assigned anywhere in the codebase (grep confirms only this read), and neither is `techTarget` (line 90). The races screen (js/ui/screens.js:456) only offers Hide/Espionage/Sabotage buttons. Therefore the 'rebellion' branch (lines 127-137) is dead code — spy-incited rebellion can never happen for player or AI (rebellion occurs only via random events, js/game/events_run.js:86) — the player can never choose which tech field to steal from, and sabotage always auto-targets the defender's largest colony rather than a chosen planet.

*Verified:* Grep across the whole js/ tree finds exactly two hits: espionage.js:90 reads sp.techTarget and espionage.js:114 reads sp.sabTarget — neither is ever assigned. The spy record is created as { count: 0, mission: 'hide', alloc: 0, fund: 0 } (js/ui/screens.js:446) and the races screen offers only Hide/Espionage/Sabotage buttons (screens.js:456-461). Therefore mode at line 114 is always 'bases' or 'factories' and the 'rebellion' branch (lines 127-137) is dead; espionage always picks a random field (li

### [diplo-esp-council] Player can negotiate peace during the Final War (finalWar check missing in evalProposal)
**Location:** `js/game/diplomacy.js:181` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual (Winning the Game): once the council's ruling is defied, all other empires unite in a final war that ends only in extermination or conquest — no separate peace

evalProposal case 'peace' accepts based on `rel.war && U.rand() < will` with no check of g.council.finalWar. The AI-initiated path guards this (js/game/ai.js:408 `if (!g.council.finalWar && ...)`), but the player's audience path (js/ui/screens.js:516-522) calls evalProposal directly. Embassies reopen after warWeary > 8 (diplomacy.js:73), so ~9 years into the Final War the player can propose peace; a pacifist leader (peaceWill 0.9 + weariness 0.3 + power bonus) accepts nearly always. This breaks the council's everyone-allies-against-you invariant: the rebel peaces out one empire at a time while shouldConvene stays disabled forever (council.js:28). Internal inconsistency between ai.js and diplomacy.js.

*Verified:* diplomacy.js:179-182 case 'peace' returns { accept: rel.war && U.rand() < will } with no g.council.finalWar check; will = pers.peaceWill + (warWeary>6 ? 0.3 : 0) + (ratio>1.5 ? 0.3 : 0) - (ratio<0.6 ? 0.4 : 0), so a pacifist (peaceWill 0.9, races.js:147) exceeds 1.0 with weariness. The AI-initiated path is guarded (ai.js:408 `if (!g.council.finalWar && ...)`), but the player audience path (screens.js:515-523) calls evalProposal directly, gated only on relThem.embassy, which yearlyDrift restores 

### [economy] Population growth rate is double MOO 1993 (20% logistic base instead of 10%)
**Location:** `js/game/colony.js:431` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual 'Growing Your Empire' / Official Strategy Guide: natural growth ≈ pop × (1 − pop/maxPop) × 10% before race/environment modifiers

growPopulation uses `growth = 0.2 * c.pop * (1 - c.pop / mp) * mult`, a 20% logistic base. MOO 1993's curve is ~10%. Every colony in the game fills roughly twice as fast as the original, which compounds with the Rabbits/Sakkra +50% and fertile/gaia multipliers (0.2*1.5*2 = 60% peak growth). The file header claims manual fidelity and no comment marks this as an intentional pacing change.

*Verified:* js/game/colony.js:431 reads exactly `var growth = 0.2 * c.pop * (1 - c.pop / mp) * mult;`. envGrowthMult (lines 51-63) stacks popGrowthBonus 0.5 (races.js:92) and SPECIALS growth (fertile 1.5, gaia 2.0 at state.js:48-49), so peak effective base can hit 0.2*1.5*2 as claimed. MOO 1993's growth is a ~10% logistic base (rate tapering from ~10% as the planet fills; halved on hostile, +50% fertile, Sakkra +50%), so 0.2 is double. File header (colony.js:1) cites the manual, and lines 426-444 contain no

### [economy] AI colony allocations can sum to 130%, letting AI spend more BC than it produces
**Location:** `js/game/ai.js:210` · **Category:** bug
**MOO 1993 rule:** MOO 1993: the five colony sliders always total exactly 100% of planetary output

manageColonies only clamps the remainder into tech (`a.tech = Math.max(0, 100 - a.eco - a.ship - a.def - a.ind)`) and never scales the other bars down. At war on a developed colony: ship 45 + def 15 + ind 10 + eco up to 60 = 130%. The colony-ship branch (line 216) is worse and very common: ind was set to 100-eco-10 in the undeveloped branch, then ship is forced to 40, giving eco + (90-eco) + 40 = 130% on every expanding AI's biggest colony. processColony (js/game/colony.js:190-194) computes each category as `spend * a.X / 100` independently with no sum check, so the AI genuinely spends up to 1.3× its production — stacked on top of the explicit difficulty aiBonus multiplier. This is an internal inconsistency between the 100%-pool invariant the engine assumes and what the AI writes.

*Verifier correction:* The colony-ship 130% case requires the AI's biggest colony to be in the undeveloped branch (factories < 0.9*maxFact), which is the norm while expanding; if the biggest colony is developed the overshoot still occurs whenever eco+ship+def+ind > 100. Category spend computation is at colony.js:189-194 (reviewer said 190-194).

*Verified:* js/game/ai.js:210 clamps only tech: `a.tech = Math.max(0, 100 - a.eco - a.ship - a.def - a.ind)`; nothing rescales ship/def/ind/eco when their sum already exceeds 100 (at war: 45+15+10+eco up to 60 from line 197's clamp to 60 = 130, tech floored at 0). Colony-ship branch ai.js:216: after the undeveloped branch set ind=100-eco-10 (line 201) and tech=10, ship is forced to max(ship,40) and tech recomputes to max(0, -30)=0, leaving eco + (90-eco) + 40 = 130. c.alloc = a is committed at line 225. pro

### [events-ground] Space monster spawns on top of its target and devours the colony the same turn it is announced
**Location:** `js/game/events_run.js:91` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual p.50 (Random Events): the Space Amoeba/Space Crystal appear and travel between systems; GNN announces the threatened system in advance, giving the owner time to defend or evacuate.

maybeFire() creates the monster with x/y equal to the victim star's coordinates and targetStarId set to that same star (events_run.js:90-95). turn.js:233-234 calls maybeFire() and then progress() in the same turn, and in progress() the distance check `d <= step` is immediately true (d = 0), so the monster arrives, auto-fights whatever happens to be in orbit, and nulls star.planet.colony in the very turn the GNN warning is generated. The player sees 'Something vast has entered known space... It is moving from system to system' and 'The Devourer has consumed all life at X' in the same report digest, with zero opportunity to react. In MOO 1993 the Amoeba/Crystal spawned away from the target and GNN warned which system it was heading to, giving several turns to evacuate or mass a fleet.

*Verified:* js/game/events_run.js:90-95 creates the monster with x: star.x, y: star.y and targetStarId: star.id (the victim star). turn.js:233-234 calls maybeFire() then progress() inside the same nextTurn(), both pushing into the same g.notices digest. In progress(), d = U.dist(m.x,m.y,tstar.x,tstar.y) = 0 <= step (events_run.js:161-163), so the monster arrives immediately, auto-resolves against whoever is in orbit (line 174), and nulls star.planet.colony at 182-184 in the same turn as the GNN spawn notice

### [fleet-galaxy] Ship deflector shields are not disabled in nebula combat (missile bases are)
**Location:** `js/game/combat.js:40` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, Nebulas: inside a nebula all deflector shields are inoperative and ships travel at warp 1

baseStack() correctly zeroes both the deflector and planetary shield when the star is in a nebula (combat.js:57-58, 'star.inNebula ? 0 : ...'), but stackFromDesign() sets 'shield: design.shieldCls' unconditionally, so warships fight at full shield strength inside nebulas. This is both a deviation from the MOO nebula rule (shieldless combat is the headline tactical property of nebulas) and an internal inconsistency: at the same battle the defender's bases lose their shields while every ship on both sides keeps theirs. Movement code (fleet.js:139) does implement the warp-1 half of the nebula rule, making the missing shield half more glaring.

*Verified:* combat.js:40 in stackFromDesign() sets 'shield: design.shieldCls' unconditionally; combat.js:57-58 in baseStack() sets 'var defl = star.inNebula ? 0 : emp.derived.deflector; var pshield = star.inNebula ? 0 : c.shield;'. A grep for inNebula across combat.js shows lines 57-58 are the only nebula handling in combat — no later pass zeroes ship shields. fleet.js:139 does implement the warp-1 movement clamp. MOO 1993's rule is that deflector shields are inoperative in nebulae, so ships fighting at ful

### [moo-checklist] Per-game randomized tech tree subsets are missing — every empire can research every tech
**Location:** `js/game/research.js:24` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Technology chapter: each race's available technology list is randomly determined at game start — 'not all technologies will be available to your scientists in any given game'; Psilons receive a larger selection.

choices() simply returns the next 2 (3 for the Psilon analog) unknown techs in ascending level order, and ensureProjects() walks the full tree sequentially. Nothing is ever removed from a race's tree, so all empires can eventually research 100% of every field. In MOO 1993 each race receives only a random subset of the tech tree each game (roughly half, more for Psilons); missing techs could only be obtained via espionage, conquest, trade, or the Orion ruins. This subset mechanic is a headline research feature that drives espionage/tech-trade gameplay and is what the Psilon 'wider tech choices' bonus actually meant. The README's Psilon claim ('wider tech choices') is approximated by showing 3 sequential choices instead of 2, which is not equivalent.

*Verified:* js/game/research.js:19-28 — choices() iterates HOO.DATA.TECHS[field] (the full global tree) and returns the next n unknown techs in ascending level order, with n = race.researchBonus ? 3 : 2 (line 21, only the Rats/Psilon analog get 3). ensureProjects() (lines 34-43) auto-starts the first choice per field until 'field exhausted'. A repo-wide grep shows research.js is the only consumer of DATA.TECHS and no code ever removes techs from an empire's reachable set (emp.techFlags/emp.techs only track 

### [production] Save games have no schema version field, validation, or migration path
**Location:** `js/game/state.js:352` · **Category:** production

save() serializes the raw HOO.game object with no version/schema identifier, and load() (line 367) does JSON.parse and assigns it directly to HOO.game with zero validation or migration. Any future code change that adds/renames game-state fields (or changes tech ids referenced by emp.techs/techFlags, design slots, etc.) will load an old autosave into new code and produce undefined-field behavior at unpredictable points later. Since the game autosaves every turn and offers 'Continue Game' by default, every returning player after an update is exposed. Minimum fix: write {version: N, game: ...}, refuse or migrate mismatched versions, and sanity-check required top-level fields before replacing HOO.game.

*Verified:* js/game/state.js:352-365 save() does JSON.stringify(HOO.game) and writes it plus a meta blob {year, race, size, when} — no version/schema field anywhere. load() at lines 367-375 does JSON.parse and assigns directly to HOO.game with zero field validation or migration (only rngState fallback at line 372 and recomputeEmpire per empire). Autosave every turn confirmed at js/main.js:37; 'Continue Game' is the primary (btn primary) title button when an autosave exists (js/ui/newgame.js:26-31). grep for

### [production] Corrupt or inaccessible localStorage crashes the title screen — game cannot boot
**Location:** `js/game/state.js:379` · **Category:** bug

saveMeta() runs JSON.parse(m) with no try/catch, and load() (line 370) likewise parses unguarded. showTitle() calls saveMeta('auto') at js/ui/newgame.js:25 and saveMeta(slot) at line 34 during title-screen construction, and gameMenu() calls it at js/ui/screens.js:25. A single truncated/corrupt meta entry (e.g. quota hit mid-write in an old session, or another tool writing the key) throws during boot(), leaving a permanently blank black page with no error UI — unrecoverable without devtools/clearing storage. Additionally, localStorage.getItem itself throws SecurityError in Chrome when 'Block all cookies' is enabled (and in some file:// contexts), which hits the same unguarded path at startup. All localStorage reads and JSON.parse calls need try/catch with graceful 'save unreadable' fallback.

*Verified:* js/game/state.js:377-380 saveMeta() runs JSON.parse(m) with no try/catch; load() line 370 also parses unguarded. showTitle() calls HOO.State.saveMeta('auto') at js/ui/newgame.js:25 and saveMeta(slot) at line 34, AFTER U.clearEl(app) at line 11 — so a throw leaves #app permanently empty. boot() (js/main.js:117-121) has no try/catch and there is no window.onerror/unhandledrejection anywhere (grep across js/ and index.html returned nothing). gameMenu() call site confirmed at js/ui/screens.js:25. Th

### [research] MOO's per-game random tech-tree subset is missing — every empire can research every tech every game
**Location:** `js/game/research.js:19` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Research/Technology: at game start each empire receives only a random portion of the techs in each field; techs you don't receive must be obtained via espionage, trade, or conquest. Psilons receive a larger selection of the tree than other races.

choices() simply returns the next 2 unknown techs by ascending level (3 for the Psilon-analog Rats), drawn from the complete tree in js/data/tech.js, and ensureProjects() auto-advances through it. There is no per-game randomized subset, so every empire in every game can eventually research 100% of the tree in near-level order. This removes a headline MOO mechanic: tech gaps that differentiate empires and give espionage tech theft (espionage.js), diplomacy tech exchange, and invasion tech capture (ground.js:222) their strategic purpose. The comment 'Rats see more of the tree' (research.js:21) only widens the next-project window from 2 to 3, which is not the Psilon larger-tree-selection mechanic.

*Verifier correction:* Fully accurate, including the note that the Rats-only widening of the choice window from 2 to 3 (research.js:21) is not the Psilon larger-subset mechanic — it only affects ordering of picks, not which techs are ultimately reachable.

*Verified:* js/game/research.js:19-28: choices() iterates the full HOO.DATA.TECHS[field] array and returns the first n unknown techs by ascending level, where n = race.researchBonus ? 3 : 2 (line 21, comment 'Rats see more of the tree'). ensureProjects() (lines 34-43) auto-starts the next choice whenever a project is done, and returns null only when the whole field is researched. A repo-wide grep for any tech-subset randomization (techFlags initialization, 'subset', 'randomiz') finds none: state.js makeEmpi


## MEDIUM

### [ai] Difficulty production multipliers deviate from MOO's documented handicaps (up to 160% vs 125%)
**Location:** `js/game/state.js:23` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 difficulty handicaps: computer players' production scales Simple 50% .. Impossible 125%

DIFFICULTIES defines aiProd 0.6/0.8/1.0/1.3/1.6 (state.js:19-23), applied to AI colony spending at colony.js:156. MOO 1993's AI production percentages are Simple 50%, Easy 75%, Average 100%, Hard 110%, Impossible 125%. Simple/Easy here are more generous to the AI (60/80 vs 50/75) and Hard/Impossible are far above spec (130/160 vs 110/125). Combined with the un-normalized allocation bug, an Impossible AI colony can effectively spend ~208% of raw output vs the original's 125% — a very different balance curve than the 1993 game.

*Verifier correction:* The code values and the stacking math are confirmed. The exact MOO1 percentages quoted (Hard 110%, Impossible 125%) come from community disassembly/OSG sources I could not fully re-verify; however no documented MOO1 handicap approaches +30%/+60%, so the deviation claim stands regardless.

*Verified:* Code fact fully verified: state.js:18-23 defines aiProd 0.6/0.8/1.0/1.3/1.6 and colony.js:156 multiplies AI colony spend by it (also mirrored in spendEstimate at colony.js:395). The un-normalized allocation bug (#1) does stack multiplicatively (130% alloc x 1.6 ≈ 208% claim is arithmetically right). The 1993 reference values (50/75/100/110/125) are the commonly cited disassembly/strategy-guide figures; web sources I could reach confirm the direction (AI penalized below Average, modest bonuses ab

### [ai] AI warships never retreat from hopeless battles; only weaponless ships flee
**Location:** `js/game/combat.js:561` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Ship Combat — Retreating: ships may disengage and warp to the nearest friendly system; AI fleets retreat when a battle is lost

In combat.js aiAct, retreatStack is only called for stacks with zero weapons (combat.js:561-564). Any armed AI stack fights to annihilation regardless of odds — a lone fighter engages 100 battleships plus bases. There is no strength assessment anywhere in aiAct or autoResolve; the only forced retreat is the 50-round attacker timeout (combat.js:499-503). MOO's AI withdraws outmatched fleets to the nearest friendly colony to preserve them; here AI empires bleed their entire navies in unwinnable engagements, which flattens the strategic AI over a long game. The retreat plumbing already exists (retreatStack, applyResults routes losers' retreaters to the nearest colony at combat.js:657-668) but is never used tactically.

*Verified:* aiAct (combat.js:535-603) calls retreatStack only in the weaponless-ship branch at combat.js:561-563 ('if (!s.weapons.length && s.kind === "ship") { retreatStack(b, s); return; }'). There is no strength/odds assessment anywhere in aiAct or autoResolve (combat.js:617-627); armed stacks always advance and fire until dead. The only other forced retreat is the round-50 attacker timeout (combat.js:499-503, COMBAT_MAX_TURNS=50 at state.js:65). The plumbing exists unused as claimed: retreatStack (comba

### [ai] AI transports ignore the fuel-range rule enforced on the player
**Location:** `js/game/ai.js:380` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual, Colony Transports: transports may only be sent to planets within fuel range of your colonies

The player's transport path hard-fails if the destination is out of range (panels.js:436 'lies beyond our fuel range'). The AI's two transport paths — population balancing at ai.js:310 and invasions at ai.js:380 — call HOO.Fleet.sendTransports directly, and sendTransports itself (fleet.js:178-194) performs no range validation. The AI can therefore ship colonists and invasion forces to any star in the galaxy regardless of fuel range, a rule asymmetry between the AI and the player. The invasion path also picks the source colony purely by distance with no range check (ai.js:376-381).

*Verifier correction:* The asymmetry is real but only bites on the invasion path (ai.js:380). The population-balancing path (ai.js:310) sends between the AI's own colonies, and rangeFrom (fleet.js:56-66) measures distance to the nearest own colony — an own-colony destination is always distance 0, so the player's check would trivially pass there too. The genuine cheat is invasion transports to enemy stars beyond emp.derived.range.

*Verified:* sendTransports (fleet.js:178-194) performs no range validation. The player path hard-fails out-of-range at panels.js:436-438 ('lies beyond our fuel range'). AI callers at ai.js:310 (population balancing) and ai.js:380 (invasion) go straight to sendTransports, and the invasion source is picked purely by distance (ai.js:376-381) with the target-colony loop at ai.js:369 not filtered by range either.

### [ai] Non-aggression pact still triggers combat 40% of the time over a partner's colony
**Location:** `js/game/turn.js:172` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, Diplomatic Relations — Non-Aggression Pact: both empires agree not to attack each other's fleets or planets; combat cannot occur unless the pact is broken

turn.js hostile(): when two non-warring empires' fleets meet at a colonized star, a nonAggression treaty only suppresses combat with probability 0.6 (turn.js:172 'U.rand() < 0.6'); the other 40% of the time both sides take -5/-5 relations hits and a full battle is fought — without any war declaration or pact-breaking event. In MOO 1993 a non-aggression pact categorically prevents fleet/planet attacks until a side explicitly breaks it. Additionally, two peaceful empires co-orbiting an unclaimed star bleed -2/-2 relations every single turn with a 30% combat roll (turn.js:179-181), so shared scouting silently corrodes relations into war. This makes AI diplomacy erratic in ways the original never was.

*Verified:* hostile() at turn.js:164-182: over either party's colony, 'if (rel.treaty === "nonAggression" && U.rand() < 0.6) return false;' (turn.js:172) — the other 40% of rolls fall through to -5/-5 adjusts (turn.js:173-174) and 'return true' (full battle), with no war declaration or pact-break event. Also confirmed: two non-warring, non-NAP empires over an unclaimed star take -2/-2 every turn plus a 30% combat roll (turn.js:179-181) — and since this fires per co-orbiting turn, shared presence does corrod

### [ai] Invading transports land before player battles are resolved
**Location:** `js/game/turn.js:206` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual, Combat Resolution order: space combat at a system resolves before enemy transports attempt to land

nextTurn resolves AI-vs-AI battles inline (turn.js:199-201) but queues player battles for the UI, then immediately runs transport landings at step 6 (turn.js:206-212) before the player battle is fought. An AI invasion arriving the same year as its escort fleet lands and fights the ground battle even if the player's defending fleet then wins the queued orbital battle — the space-combat outcome cannot stop the landing. AI-vs-AI landings, by contrast, correctly happen after their combats. This asymmetry favors AI invasions against the player specifically. In MOO, transports run the gauntlet of whatever bases/ships survive that turn's resolved combat.

*Verified:* nextTurn resolves non-player combats inline (turn.js:198-202) but queues player battles into playerCombats (turn.js:195-197) and returns them for the UI (turn.js:241; header comment turn.js:57-61 confirms UI resolves them after nextTurn). Step 6 landings (turn.js:205-212) run unconditionally inside nextTurn, so resolveLanding (ground.js:115) executes before any player battle is fought — the orbital outcome cannot stop the landing, and the transport gauntlet (ground.js:153-169) is computed agains

### [ai] AI never initiates alliances, tech trades, tribute, or threats
**Location:** `js/game/ai.js:422` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, The Alien Leaders / Audiences: AI emperors actively propose alliances and trade treaties, offer and demand tribute, threaten, and ask you to break treaties or join wars

manageDiplomacy (ai.js:386-445) only ever initiates: war declarations, peace, non-aggression pacts, and trade agreements. The evaluation machinery for 'alliance', 'breakAllianceWith', and 'declareWarOn' exists in diplomacy.js:161-216 but is only reachable from the player's audience UI, and tradableTechs/exchangeTech/offerTribute are likewise never called by AI code. So AI empires never ally with each other or the player, never swap technology among themselves, never demand tribute or issue threats, and never try to pull third parties into wars — a large slice of MOO's diplomatic personality is one-directional (player-initiated only).

*Verifier correction:* Slightly stronger than stated: the 'breakAllianceWith' and 'declareWarOn' evalProposal branches have zero callers anywhere (player UI included) — they are dead code, not player-reachable.

*Verified:* manageDiplomacy (ai.js:386-445) only ever calls declareWar (ai.js:404), evalProposal 'peace'/'nonAggression'/'trade' (ai.js:415, 424, 430), formTrade (ai.js:431), and pushes NAP/trade offer notices to the player (ai.js:437-441). Grep confirms evalProposal 'alliance'/'threat' are invoked only from the player audience UI (screens.js:534, 552); offerTribute only at screens.js:568; tradableTechs only at screens.js:573-574; exchangeTech only at screens.js:607. 'breakAllianceWith' and 'declareWarOn' h

### [ai] AI ship design ceiling: no huge hulls, no specials on warships, colony ship never upgraded
**Location:** `js/game/ai.js:113` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993: AI designs scale up through Huge hulls and mount special systems as tech advances; extended-environment colony ships replace the base model

manageDesigns caps AI warships at 'large' hulls (ai.js:113: construction > 14 ? 'large' : 'medium') — huge hulls are never built. Warship and bomber specs always pass specials: [] (ai.js:118, ai.js:154), so the AI never mounts battle scanners, repulsors, cloaks, teleporters, hellfire specials, etc., even though the tactical engine fully supports them (combat.js:390-425) and the player can use them. The comment at ai.js:85 says colony designs are 'replace[d] with extended-environment versions', but the code only creates a colony design when none exists (colSlot < 0 at ai.js:87), so the turn-1 colony ship — with the starting engine — is kept for the whole game. Late-game AI fleets are therefore structurally weaker than equal-production player fleets.

*Verified:* ai.js:113: hullId = construction > 14 ? 'large' : 'medium' — 'huge' (defined in shipdesign.js:8 and js/data/tech.js:605) is never selected by the AI. Warship spec has specials: [] (ai.js:118); bomber spec specials: [] (ai.js:154); the tactical engine supports stasis/blackHole/pulsar/repulsor/teleporter/cloak/heFocus etc. (combat.js:390-425, 218, 493-496) and the player design UI can mount them. The comment at ai.js:85 promises extended-environment colony-ship replacement but the code only create

### [combat] Stasis field is a near no-op instead of freezing the stack
**Location:** `js/game/combat.js:390` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, Stasis Field special: the targeted stack is frozen in time and removed from combat (cannot act or be attacked) for as long as the field is maintained

fireAll sets target.stasisLeft = 1, but beginRound (line 167) decrements stasisLeft at the START of the next round, before nextStack checks it. Result: if the target has already acted this round (higher initiative), stasis has zero effect; at best it skips the remainder of the current round. The frozen stack can also still be targeted and damaged by all weapons, which MOO forbids. The special is effectively useless despite costing 200 space/275 power.

*Verified:* fireAll sets target.stasisLeft = 1 (combat.js:390-394). beginRound (line 167) decrements stasisLeft at the start of the next round, before the new order is walked, so by the time nextStack checks `s.stasisLeft <= 0` (line 185) in round N+1 it is already 0. Effect is limited to skipping the target's action in the current round if it has not yet acted (nextStack line 186 sets done=true). Nothing in fireWeapon or stepMissiles checks target.stasisLeft, so the 'frozen' stack can be freely shot — MOO 

### [combat] Automated repair heals 25%/50% per round instead of 15%/30%
**Location:** `js/game/combat.js:489` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 tech appendix: Automated Repair System repairs 15% of hull damage per combat turn; Advanced Damage Control repairs 30%

endRound uses s.hits * 0.5 for advDamControl and s.hits * 0.25 for autoRepair — roughly double the MOO values. The project's own tech data contradicts the code: tech.js line 150 says '15% of hull damage' and line 177 says '30%'. A ship with Advanced Damage Control that repairs 50% of max hits per round is effectively unkillable by chip damage. (The stack field autoRepairUsed is also created but never read.)

*Verifier correction:* Slightly worse than 'double': the code repairs a percentage of MAX hits per round (flat s.hits*0.25/0.5), while the data/MOO describe a percentage of accumulated hull damage, so the effective over-repair grows even larger at low damage levels.

*Verified:* endRound (combat.js:489-490): `s.topDamage - s.hits * 0.5` for advDamControl and `s.hits * 0.25` for autoRepair. tech.js:150 (automated_repair) says '15% of hull damage'; tech.js:177 (advanced_damage_control) says '30%'; SPECIAL_STATS (lines 615-616) repeat 15%/30%. MOO 1993 values are 15%/30%. grep confirms autoRepairUsed is only ever initialized (combat.js:44, 70, 96) and never read.

### [combat] Anti-Missile Rockets use 35% base chance instead of 85%
**Location:** `js/game/combat.js:440` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 tech appendix: Anti-Missile Rockets destroy incoming missiles 85% of the time, minus 5% per tech level of the attacking missile

stepMissiles computes destroyPct = 35 - m.tech.level for the antiMissile special. The game's own data disagrees with the code twice over: tech.js line 471 ('85% chance (minus 5% per enemy tech level)') and SPECIAL_STATS line 631 ('85% base chance'). Code gives Nuclear Missiles (level 1) a 34% intercept instead of 80%, and anything level 35+ zero. Zyro (75 - level) and Lightning (100 - level) also silently subtract 1%/level, while their descs claim flat 75%/100%.

*Verifier correction:* One sub-claim is off: Zyro (75 - level, line 439) and Lightning (100 - level, line 438) subtracting 1% per missile tech level actually MATCHES MOO 1993 behavior — only the tech.js descriptions are incomplete there. Also the code subtracts 1%/level for AMR where both the desc and MOO specify 5%/level. The real bug is the 35 vs 85 base.

*Verified:* combat.js:440: `destroyPct = 35 - m.tech.level` for antiMissile. tech.js:471 says '85% chance (minus 5% per enemy tech level)' and SPECIAL_STATS antiMissile (tech.js:631) says '85% base chance'. Nuclear Missile (level 1) gets 34% instead of 80%, and destroyPct <= 0 for missile tech level >= 35 (line 442 only applies if destroyPct > 0).

### [combat] Ferret (Mrrshan) first-strike ability defined but never implemented
**Location:** `js/data/races.js:76` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Mrrshan race: their ships always fire first in combat (first-strike initiative)

races.js sets firstStrike: true on the Ferrets (the Mrrshan analog) and the header comment (line 9) documents 'shipAttack/firstStrike (Mrrshan)', but grep shows firstStrike is referenced nowhere in combat.js or shipdesign.js — initiative order (combat.js line 170-171) is purely initiative-stat sort. Half of the race's signature combat bonus silently does nothing.

*Verified:* races.js:74 sets `shipAttack: 4, firstStrike: true` (finding cited line 76; actual line is 74, with the header comment at line 9). Project-wide grep for firstStrike returns only races.js:9 and races.js:74 — no reference in combat.js or shipdesign.js. Turn order is a pure initiative sort in beginRound (combat.js:170-171), and shipdesign compute (line 135) builds initiative from maneuver + computer mark + race.initBonus only. shipAttack IS used (shipdesign.js:133); firstStrike is dead.

### [combat] Combat speed uses floor(maneuver/2) instead of MOO's round-up table
**Location:** `js/game/shipdesign.js:148` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual maneuverability table: combat movement = maneuver class rounded up per 2 classes (class 1-2 move 1, class 3-4 move 2, class 5-6 move 3, ...)

combatSpeed: Math.max(1, Math.floor(man / 2)) gives odd maneuver classes one less movement than MOO: class 3 (Sub-Light) moves 1 instead of 2, class 5 (Impulse) moves 2 instead of 3, class 7 moves 3 instead of 4, class 9 moves 4 instead of 5. Every odd-warp engine generation ships a speed downgrade relative to the original.

*Verified:* shipdesign.js:148: `combatSpeed: Math.max(1, Math.floor(man / 2))`. MOO 1993's movement table is ceil(maneuver/2): class 3 -> 2, class 5 -> 3, class 7 -> 4, class 9 -> 5. Code gives 1, 2, 3, 4 respectively — one less for every odd maneuver class (man = engine warp, shipdesign.js:117), exactly as claimed.

### [combat] Ship deflector shields still work inside nebulae; base shields don't
**Location:** `js/game/combat.js:40` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual: deflector shields (ship and planetary) do not function in a nebula

baseStack correctly zeroes both the deflector and planetary shield in a nebula (lines 57-58: star.inNebula ? 0 : ...), but stackFromDesign copies design.shieldCls unconditionally and createBattle never passes nebula state to ship stacks. In a nebula battle the defender's bases fight shieldless while every ship keeps full shields — an internal inconsistency and a deviation from the original rule that no shields work in nebulae.

*Verified:* baseStack zeroes both shields in nebulae (combat.js:57-58: `star.inNebula ? 0 : emp.derived.deflector` / `star.inNebula ? 0 : c.shield`), while stackFromDesign copies `shield: design.shieldCls` unconditionally (line 40) and createBattle (106-156) never consults star.inNebula for ship stacks. MOO 1993 disables all deflector shields in nebulae, so defending bases fight shieldless while attacking/defending ships keep full shields — confirmed inconsistency and fidelity deviation.

### [combat] Tactical bio weapons are shield-blocked and hit bases instead of population
**Location:** `js/game/combat.js:320` · **Category:** bug
**MOO 1993 rule:** MOO 1993: biological weapons ignore planetary shields entirely and kill population (reduced by antidote tech); they do not damage missile bases

fireWeapon routes wclass 'bio' through the bomb branch: it rolls to-hit, subtracts the full combined shield (deflector + planetary shield, via shieldOf at line 324/329), and applies the result to the missile-base stack's hit points. Death Spores (dmax 1) therefore can never do anything once the defender has any shield >= 1, and even when damage lands it erodes base hits rather than killing colonists. The strategic path in ground.js (lines 55-59) implements bio correctly (ignores shields, kills pop, shrinks planet size) — two code paths computing the same weapon completely differently.

*Verified:* combat.js:320: `if (wc === 'bomb' || wc === 'bio')` — bio shares the bomb branch; sh = shieldOf(target, s) at line 324 (the base stack's shield = deflector + planetary shield, line 65), subtracted per hit at line 329, and the result is applied to the missile-base stack's hits at line 335. Death Spores (tech.js:284, dmin:0 dmax:1, desc 'ignoring planetary shields') can never penetrate any shield >= 1. Strategic path ground.js:55-59 correctly ignores shields, kills pop, and shrinks planet size. Co

### [combat] Warp Dissipator cannot actually prevent retreat
**Location:** `js/game/combat.js:381` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 tech appendix: the Warp Dissipator drains a fleeing ship's engines so it cannot retreat from combat

The tech description (tech.js line 399: 'snares fleeing enemy ships, preventing their retreat') is not implemented: retreatStack (line 515) performs the retreat unconditionally with no check of speedDrain or the dissipator. The only effect is speedDrain += 1 on beam hits, capped by Math.min(target.speed - 1, ...) — which for speed-1 ships evaluates to 0, so the slowest ships are immune to the drain entirely, and effSpeed's max(1, ...) floor means no ship is ever immobilized.

*Verified:* combat.js:381: `target.speedDrain = Math.min(target.speed - 1, target.speedDrain + 1)` — for speed-1 ships the cap is 0, so they are immune. effSpeed (line 198) floors at 1 for non-planetary stacks, so no ship is ever immobilized. retreatStack (line 515) has no check of speedDrain, warpDissipator, or anything else — retreat always succeeds. tech.js:399 promises it 'snares fleeing enemy ships, preventing their retreat from combat', and SPECIAL_STATS (line 629) repeats 'Prevents enemy ships from r

### [combat] Retreat is instantaneous instead of MOO's end-of-next-turn warp-out
**Location:** `js/game/combat.js:515` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Retreating: a retreating ship turns toward the map edge and warps out at the end of its NEXT turn, remaining exposed to enemy fire for a full round

retreatStack removes the stack from combat immediately, granting only unfired beams a single parting shot (lines 520-528). The original's one-full-round vulnerability window — a core risk of retreating, and the reason the Warp Dissipator matters — is absent. Additionally, applyResults line 654 puts the WINNING side's retreated ships straight back into the fleet at the battle star, so victors' retreats are cost-free, whereas in MOO all retreated ships fly to the nearest friendly colony.

*Verified:* retreatStack (combat.js:515-531) sets retreated=true immediately; only enemy beam/heavy weapons not yet fired this round get parting shots (520-528) — missiles in flight even lose their target (stepMissiles line 433 drops projectiles targeting retreated stacks). In MOO 1993 a retreating ship stays in combat until its next turn, fully attackable. applyResults line 654: `if (won) ... stayCounts[i] += retreated[i]; // victors' retreaters rejoin` — winners' retreated ships return to the fleet at the

### [combat] Guardian weapon id typo silently drops one of its four weapon groups
**Location:** `js/game/turn.js:253` · **Category:** bug
**MOO 1993 rule:** MOO 1993: the Guardian of Orion attacks with a full battery of Stellar Converters, Plasma Torpedoes, and Scatter Pack X missiles

buildBattle gives the Guardian weaponIds ['stellar_converter', 'plasma_torpedoes', 'scatter_pack_x_missiles', 'scatter_pack_x']. 'scatter_pack_x_missiles' does not exist in HOO.DATA.techById (the real id is 'scatter_pack_x', already present), so monsterStack (combat.js lines 78-81) silently filters it out and the Guardian fights with 3 weapon groups of 3 instead of the intended 4, materially weakening the endgame encounter.

*Verified:* turn.js:253: `weaponIds: ['stellar_converter', 'plasma_torpedoes', 'scatter_pack_x_missiles', 'scatter_pack_x']`. techById contains 'scatter_pack_x' (tech.js:568) but no 'scatter_pack_x_missiles' — verified by grep over js/data/tech.js. monsterStack (combat.js:77-81) returns null for unknown ids and `.filter(Boolean)` silently discards it, so the Guardian fields 3 weapon groups (each count 3, per weaponCount:3 at turn.js:254) instead of the intended 4.

### [combat] Defender base stack can be placed on the same cell as a ship stack
**Location:** `js/game/combat.js:150` · **Category:** bug

createBattle assigns side-1 stacks column COLS-1 with y spread by index, then force-moves the planetary stack to (COLS-1, ROWS/2)=(9,4). With 4+ defender stacks (3+ ship designs plus bases), a ship stack independently computes y=4 in the same column (e.g. len=4: i=2 gives floor(4-2+2+8)%8=4), so two stacks occupy one cell. occupied() only excludes the moving stack itself, stackAtCell returns whichever comes first, the two icons render on top of each other, and the shared cell blocks pathing — a persistent grid corruption for the whole battle.

*Verified:* combat.js:147-151: each side-1 stack gets y = floor(ROWS/2 - len/2 + i + ROWS) % 8 at x=9, then the planetary stack is force-moved to (9,4). Math verified for len=4 (3 ship designs + bases, bases pushed last so i=3): ship stack i=2 gets floor(4-2+2+8)%8 = 4, colliding with the base override at (9,4); len=5 collides likewise (i=3 -> 4). There is no post-placement collision resolution; occupied() (line 192) only guards moves, and combatui stackAtCell (combatui.js:163-169) returns the first match, 

### [combat] Missiles button can toggle enemy/AI stacks' missile fire
**Location:** `js/ui/combatui.js:73` · **Category:** bug

The 'Missiles' button handler checks only `if (current)` — not `awaiting` and not stack ownership. During the AI's turn (and during the setTimeout delay in step()), `current` is the enemy stack, so clicking Missiles sets the ENEMY stack's missilesOn=false, which makes fireWeapon (combat.js line 294) and anyWeaponInRange skip its missiles for the rest of the battle. The player can permanently disarm every enemy missile stack, including missile bases, with well-timed clicks.

*Verified:* combatui.js:72-74: onclick checks only `if (current)` — no awaiting check, no side check (contrast Done/Retreat buttons at lines 68 and 78, which require `awaiting && current`). step() (line 93) assigns current = s for every stack including enemy ones, with a 140 ms setTimeout window (line 104-109) before aiAct runs. Once toggled off, nothing ever re-arms an AI stack's missiles: aiAct never touches missilesOn, and combat.js:294 (fireWeapon) plus combat.js:259 (anyWeaponInRange) skip missiles whe

### [combat] Black hole / pulsar specials re-trigger on every attack click in the same turn
**Location:** `js/game/combat.js:396` · **Category:** bug
**MOO 1993 rule:** MOO 1993: the Black Hole Generator and Energy Pulsar activate once per combat turn

fireAll fires the black hole (lines 396-401) and pulsar (403-413) with no per-round guard (only stasis has stasisUsedRound). In the UI, the turn only ends when no weapon remains with !usedThisRound && shotsLeft>0 (combatui.js lines 194-197), and anyWeaponInRange (combat.js 254-264) ignores usedThisRound. So a ship carrying e.g. beams + held missiles (Missiles toggled off) + Black Hole Generator can be clicked on an adjacent enemy repeatedly, invoking fireAll and destroying 25-100% of the stack per click, unbounded, in a single turn.

*Verified:* fireAll: only stasis has a per-round guard (stasisUsedRound, combat.js:390); blackHole (396-401) and pulsar (403-413) fire unconditionally on every invocation. combatui.js onClick (188-197) calls fireAll whenever anyWeaponInRange is true and only ends the turn when no weapon has `!usedThisRound && shotsLeft > 0`. anyWeaponInRange (combat.js:254-264) ignores usedThisRound and beams have shotsLeft=Infinity (line 29), so the fire-click stays valid; holding missiles off (or having any unfired bomb/o

### [diplo-esp-council] Spy confession ('entire network exposed') destroys zero spies — weaker than a lesser outcome
**Location:** `js/game/espionage.js:75` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual p.43: a spy who confesses compromises the spy ring, destroying the network rather than only the current mission

The worst security outcome (roll 100+) sets confessed = true, pushes a notice claiming the confession is 'exposing the entire network', and aborts this year's mission — but never reduces sp.count. Meanwhile the milder 71-99 band eliminates one spy (sp.count--, line 69). So confession, the outcome described as catastrophic, leaves the whole network intact while a routine capture shrinks it. The message and the effect contradict each other; the outcome table is inverted at the top end.

*Verified:* espionage.js:74-79 (roll >= 100 branch): sets confessed = true, pushes the 'confessed, exposing the entire network' notice, applies -10 relations, and breaks — sp.count is never reduced. The milder 71-99 branch (lines 68-73) does sp.count--. Line 81 then aborts only this year's mission on confession. So the catastrophic-sounding outcome leaves every spy network intact while a routine capture destroys one. Message and effect contradict as claimed; line numbers accurate (confession branch is lines

### [diplo-esp-council] Council convenes at >1/2 of planets colonized instead of MOO's two-thirds
**Location:** `js/game/council.js:29` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, Winning the Game: 'Once two-thirds of the planets in the galaxy have been colonized, the Galactic High Council convenes every 25 years'

shouldConvene returns false while colonizedFraction(g) <= 0.5, so the first council fires as soon as more than half of habitable non-Orion planets are colonized; the UI narration (js/ui/notices.js:243) repeats 'More than half the galaxy has been settled'. MOO 1993 convenes the High Council only once two-thirds of the galaxy's planets are colonized (then every 25 years, which the code does implement via lastVote >= 25). Unlike votesOf (whose 1-vote-per-50-pop deviation is explicitly commented as intentional), no comment marks this threshold as a deliberate change. Elections therefore begin a whole game phase earlier than the original.

*Verified:* council.js:29 `if (colonizedFraction(g) <= 0.5) return false;` — first election fires past 50% of habitable non-Orion planets (colonizedFraction, lines 8-17, excludes s.orion). The 25-year cadence is implemented at line 32. UI narration at js/ui/notices.js:243 says 'More than half the galaxy has been settled.' MOO 1993's Galactic Council first convenes when two-thirds of the galaxy's planets are colonized, then every 25 years. votesOf carries an explicit deviation comment (line 24: '1 vote per ~

### [diplo-esp-council] Non-aggression pact fails to prevent combat 40% of the time over colonies, and the pact survives the shooting
**Location:** `js/game/turn.js:172` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, Diplomatic Relations: Non-Aggression Pact — fleets of the signatories will not attack one another unless the pact is deliberately broken

hostile() gives NAP signatories only a 60% chance to avoid battle when fleets meet over either side's colony (`if (rel.treaty === 'nonAggression' && U.rand() < 0.6) return false;`); the other 40% of encounters apply -5/-5 relation hits and trigger real combat while rel.treaty remains 'nonAggression' — the treaty is neither honored nor considered broken (no permanentPenalty, no cancellation via breakTradeAndTreaty). In MOO 1993 a non-aggression pact categorically prevents automatic engagement; combat occurs only if a side deliberately breaks the pact, which then carries the treaty-breaking penalty.

*Verified:* turn.js:164-182 hostile(): for encounters over either side's colony (line 171), line 172 `if (rel.treaty === 'nonAggression' && U.rand() < 0.6) return false;` — otherwise lines 173-175 apply -5/-5 adjust(hostile) to both sides and return true, producing a real combat entry (line 149). rel.treaty is never cleared, no permanentPenalty is applied, and breakTradeAndTreaty is not called, so the pact persists through the battle. In MOO 1993 a non-aggression pact categorically prevents automatic engage

### [diplo-esp-council] War declarations never propagate: allies do not join or react to wars
**Location:** `js/game/diplomacy.js:27` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Diplomatic Relations: Alliance — allies come to each other's aid and declaring war on an empire angers its treaty partners

declareWar mutates only the two belligerents' relation records. No relation penalty is applied to the victim's allies, allies are never drawn into (or asked to join) the war, and third parties have no reaction whatsoever to a declaration. The only ally-war machinery in the game is the evalProposal 'declareWarOn' case, which is itself dead code (see separate finding). In MOO 1993, attacking an empire damages your standing with its allies and allied empires join wars against a common aggressor; alliances here are purely a combat-suppression flag (turn.js:168) plus +1 goodwill/yr.

*Verifier correction:* Core claim is accurate: declareWar (diplomacy.js:27-43) touches only who.relations[onId] and on.relations[whoId]; no third-party relation change, no ally war-joining anywhere (ai.js manageDiplomacy decides wars purely pairwise; the 'declareWarOn' evalProposal case at diplomacy.js:206 has no caller). One overstatement: alliances are not *purely* a combat-suppression flag plus +1 goodwill/yr — they also veto AI war declarations (ai.js:402), add +25 to council vote scoring (council.js:84), and gate the AI alliance acceptance path; but none of that constitutes war propagation, so the finding stands.

*Verified:* Read diplomacy.js:27-43 — only the two belligerents' records mutated. Grep for evalProposal callers shows only 'peace'/'nonAggression'/'alliance'/'trade'/'threat' kinds ever invoked (screens.js:517-552, ai.js:415-430), so 'declareWarOn' is dead. turn.js:168 `if (rel.treaty === 'alliance') return false;` and diplomacy.js:66 +1/yr confirmed. MOO 1993 does penalize standing with a victim's allies and can pull allies into wars, so the fidelity gap is real.

### [diplo-esp-council] Tech tribute, 'break alliance with X', and 'declare war on X' requests are dead code
**Location:** `js/game/diplomacy.js:151` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Audiences: tribute may be paid in BC or technology; leaders can be asked to break alliances with, or declare war on, a mutual enemy

tributeTech (line 151) is exported but has no caller — the audience screen (js/ui/screens.js:566) only offers BC tribute, so gifting a technology to improve relations is impossible. Likewise evalProposal's 'breakAllianceWith' (line 197) and 'declareWarOn' (line 206) cases are never invoked from any UI or AI path (grep confirms definitions only). All three are MOO 1993 audience staples: offering technology as tribute, and pressuring/asking other leaders to break pacts with or declare war on a third empire. The engine logic exists but is unreachable for both player and AI.

*Verified:* Grep for tributeTech across js/ and index.html: only the definition (diplomacy.js:151) and the export (diplomacy.js:246) — no caller; the audience screen offers only BC tribute (screens.js:566-571, `Offer Tribute (BC)` calling offerTribute). Grep for breakAllianceWith/declareWarOn: only the case labels at diplomacy.js:197 and 206. All evalProposal call sites (screens.js:517/526/534/544/552, ai.js:415/424/430) pass other kinds. These three are genuine MOO 1993 audience options (offering technolog

### [diplo-esp-council] Trade profit ramps at half MOO's rate and diverges between the two partners
**Location:** `js/game/diplomacy.js:68` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, Trade and Tribute: new trade routes begin at roughly a 30% loss and improve about 5% per year until reaching full (100%) profitability — one shared rate per agreement

yearlyDrift advances tradePct by U.rint(0, 5) — an average of +2.5%/year — so climbing from -30% to +100% takes ~52 years on average versus ~26 in MOO 1993's ~+5%/year ramp. Additionally, because the increment is rolled independently for each directed relation record inside the emp×other double loop, the two sides of a single trade agreement drift to different profit percentages (a.relations[b].tradePct != b.relations[a].tradePct), so one signatory can be at full profit while the other still runs a loss on the same treaty. Start at -30% (state.js:270), the 100% cap, and the Human-analog +25% bonus (colony.js:104) are all faithful.

*Verifier correction:* All code facts verified: diplomacy.js:68 `rel.tradePct = Math.min(100, rel.tradePct + U.rint(0, 5))` runs per directed relation record inside the emp×other double loop (lines 55-70), with U.rint inclusive (util.js:22), so each side's tradePct advances by an independent 0-5 roll (avg +2.5/yr) and the two signatories of one treaty genuinely diverge — one can reach +100% while the other is still negative. Start -30 (state.js:270), cap 100 (line 68 and colony.js:102), and Hamster tradeBonus 0.25 (races.js:47, applied colony.js:104) all confirmed. The one soft spot is the MOO comparison: MOO 1993 trade does start at a loss and mature to full profit much faster and symmetrically for both partners, but I could not independently verify the exact '~+5%/year' figure, so 'half MOO's rate' is approximate rather than proven.

*Verified:* Read diplomacy.js:54-78 (yearlyDrift double loop, per-record rint(0,5)), state.js:270 (tradePct: -30 at creation), colony.js:100-106 (clamp to [-30,100], tradeBonus multiplier). 130 points / 2.5 avg per year = ~52 years to full profit, as claimed. The asymmetric-drift defect is unambiguous in code regardless of the exact MOO rate.

### [diplo-esp-council] Spy capture roll ignores the attacker's computer-tech advantage and the spy race bonus
**Location:** `js/game/espionage.js:54` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual p.43: spy success and capture are modified by the difference between the spying and defending races' computer technology plus racial espionage bonuses (Darlok +30)

The per-spy security roll is `U.roll100() + secBonus + Math.max(0, defLv - attLv)` — the tech term is clamped to defender advantage only, so a spy from a vastly more advanced race is captured exactly as often as an equal-tech one; the attacker's edge counts only in the separate infiltration roll (line 84, also one-way clamped). The Chameleon (Darlok-analog) +30 spyBonus likewise applies only to infiltration, giving their networks no extra survivability against capture. In MOO 1993 the signed computer-tech differential and the race espionage bonus modify the spy's evasion/capture chances, not just mission success.

*Verified:* espionage.js:54: security roll = `U.roll100() + secBonus + Math.max(0, defLv - attLv)` — the tech term is clamped so only a defender advantage counts; an attacker with vastly superior computers gets zero survivability benefit, and (spyRace.spyBonus || 0) appears only in the infiltration roll at line 84 (`U.roll100() + Math.max(0, attLv - defLv) + (spyRace.spyBonus || 0)`), which is likewise one-way clamped. races.js:38 confirms Chameleons (Darlok analog) have spyBonus: 30 used nowhere else, so t

### [economy] Slider rebalance leaves total allocation below 100% when the other four bars are locked
**Location:** `js/ui/ui.js:290` · **Category:** bug
**MOO 1993 rule:** MOO 1993: colony spending bars are a ratio display that always totals 100%

In rebalance(), `alloc[changedKey] = newVal` is committed before the `if (freeKeys.length === 0) return;` early-out. If a player locks four bars and drags the fifth down, nothing can absorb the freed share, so the allocations sum to less than 100 and the deficit BC is silently never spent (not even routed to the reserve). In MOO the last unlocked bar cannot be reduced below the remainder; here the alert bar only flags IDLE when the total is <= 0 (js/ui/ui.js:71-72), so partial idling is invisible.

*Verified:* js/ui/ui.js:284-290: `newVal = U.clamp(newVal, 0, 100 - lockedSum); alloc[changedKey] = newVal;` is committed at line 285, then `if (freeKeys.length === 0) return;` at line 290 exits before any redistribution. The clamp only caps the upper bound, so dragging the sole unlocked bar down with four locked bars leaves the sum below 100. processColony (colony.js:189-194) spends only alloc percentages — the deficit is never spent and never routed to reserve. The IDLE alert fires only when totalAlloc <=

### [economy] Soil Enrichment / Advanced Soil Enrichment never raise max population (+25% / +50% in MOO), contradicting the game's own tech text
**Location:** `js/game/colony.js:322` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, Planetology techs: Soil Enrichment converts standard planets to Fertile (+50% growth, +25% max population); Advanced Soil Enrichment creates Gaia (+100% growth, +50% max population)

Completing soil enrichment only sets `p.special = 'fertile'` (and line 331 sets 'gaia'); growth multipliers come from SPECIALS in state.js, but planet size/baseSize is never increased. The clone's own tech description (js/data/tech.js:294, 'raising max population by 25%') promises the size bonus, so this is both a MOO formula deviation and an internal inconsistency between the tech tooltip and the engine.

*Verifier correction:* SPECIALS live in js/game/state.js (HOO.CONST.SPECIALS, lines 41-51); the finding's 'state.js' reference is right, there is no js/data/const.js.

*Verified:* js/game/colony.js:322 sets only `p.special = 'fertile'` and line 331 `p.special = 'gaia'`; neither touches p.size or p.baseSize. maxPop (colony.js:45-49) is `p.size - Math.floor(p.waste)`, and SPECIALS (js/game/state.js:41-51, not a separate const.js) give fertile/gaia only growth multipliers (1.5/2.0), no size effect. The clone's own descriptions promise the size bonus: tech.js:294 'raising max population by 25%' and tech.js:345 'raising max population by 50%'. MOO 1993's Soil Enrichment does r

### [economy] Eco Restoration cleanup rates shifted one tier too generous; Complete Eco Restoration missing
**Location:** `js/data/tech.js:275` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 planetology ladder: Ecological Restoration 2 waste/BC (base), Improved Eco Restoration 3/BC (lvl 3), Enhanced 5/BC (lvl 16), Advanced 10/BC (lvl 30), Complete Eco Restoration 20/BC (lvl ~46)

The clone places the techs at the correct levels (3/16/30, matching MOO) but assigns each the NEXT tier's cleanup value: Improved = 5/BC, Enhanced = 10/BC, Advanced = 20/BC, and the level-46 Complete Eco Restoration is absent entirely. Waste cleanup is therefore roughly half price versus the original from planetology level 3 onward, materially weakening the whole eco-slider economy the recent overhaul is built around (d.wastePerBC in state.js:166 consumes these values).

*Verifier correction:* 'Roughly half price from level 3 onward' is slightly overstated for the first tier: Improved is 5 vs MOO's 3 (~40% cheaper); Enhanced and Advanced are exactly half price (10 vs 5, 20 vs 10), and the 20/BC endgame rate arrives at level 30 instead of 46.

*Verified:* js/data/tech.js: improved_eco_restoration level 3 wastePerBC:5 (lines 274-276), enhanced level 16 wastePerBC:10 (298-300), advanced level 30 wastePerBC:20 (325-327); grep -i 'complete' over tech.js finds no Complete Eco Restoration anywhere (level 46 holds bio_terminator instead, line 352). Base is 2/BC via state.js:166 `d.wastePerBC = et ? et.effect.wastePerBC : 2;`. MOO 1993: base 2, Improved (3)=3/BC, Enhanced (16)=5/BC, Advanced (30)=10/BC, Complete (46)=20/BC — so each clone tech indeed car

### [economy] Colonist BC output scales to 2.0 at planetology 50 — about double MOO's worker output curve
**Location:** `js/game/state.js:170` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 production formula (OSG / known internals): each colonist produces 0.5 BC, rising with Planetology tech to roughly (50 + planetology level)/100 BC — about 1.0 BC at level 50, not 2.0

recomputeEmpire sets `d.workerBC = (0.5 + 1.5 * Math.min(50, pl) / 50)`, i.e. 0.5 → 2.0 BC per colonist at planetology 50. The original's population output roughly doubles over the whole tech game (0.5 → ~1.0); here it quadruples, inflating late-game economies (especially Ants/Klackon whose workerOutput doubles this again to 4 BC per colonist).

*Verified:* js/game/state.js:170 reads `d.workerBC = (0.5 + 1.5 * Math.min(50, pl) / 50) * (race.workerOutput || 1);` — 0.5 BC at planetology 0-1 rising to 2.0 at level 50 (comment on line 168 states this explicitly). MOO 1993 worker output is (50 + planetology level)/100 BC per colonist, i.e. ~1.0 at level 50 (1.5 only at the never-reached level 100), so the clone is roughly 2x at equal tech and the pop-output multiplier over the game is ~4x vs MOO's ~2x. Klackon workerOutput: 2 (races.js:56) multiplies on

### [economy] Eco spring-back bypassed when dragging any other bar — allocations still silently rewritten at end of turn
**Location:** `js/ui/panels.js:204` · **Category:** ux
**MOO 1993 rule:** MOO 1993 manual p.14: ECO allocation is automatically kept at the waste-cleanup minimum; bars visibly reflect what will be spent

The spring-back added by the eco overhaul only triggers in the eco bar's own set() handler (`if (key === 'eco' && !c.locks.eco)`). Dragging ship/def/ind/tech calls HOO.UI.rebalance, which freely squeezes an unlocked eco below ecoMinPct with no clamp. The engine then auto-raises eco during processColony (js/game/colony.js:183-186), shrinking the other bars proportionally — exactly the 'silently changing during end-of-turn processing' behavior the commit message claims was removed. Until then, the ship/def/ind/tech notes (shipNote etc.) overstate output because they are computed from the displayed, not enforced, percentages.

*Verified:* js/ui/panels.js:200-204: the clamp `if (key === 'eco' && !c.locks.eco) { ... if (v < minPct) v = minPct; }` runs only inside the dragged bar's own set(); dragging ship/def/ind/tech goes straight to HOO.UI.rebalance (line 204), whose proportional squeeze (ui.js:294-296) freely pushes an unlocked eco below ecoMinPct. processColony then auto-raises eco at colony.js:183-186 via raiseEco (367-383), shrinking the other bars proportionally at end of turn. Commit 6398561's message explicitly claims the 

### [economy] Atmospheric terraforming inflates planet size to at least 40 (MOO keeps the original size)
**Location:** `js/game/colony.js:311` · **Category:** balance
**MOO 1993 rule:** MOO 1993 manual, Planetology: Atmospheric Terraforming converts a hostile planet into a Minimal environment for 200 BC; planet size is unchanged (further growth requires the Terraforming +N techs)

On completion the code sets `p.size = Math.max(p.size, 40 + p.terraformed); p.baseSize = Math.max(p.baseSize, 40);`. Converting a size-10 Radiated world quadruples its max population for the same 200 BC the original charges just for the environment change. The 200 BC cost and hostile→minimal conversion are faithful; the free size jump to 40 is not, and is not labeled as an intentional simplification. (Also note the transient use of unfloored p.terraformed here vs Math.floor everywhere else.)

*Verified:* js/game/colony.js:311 reads exactly `p.size = Math.max(p.size, 40 + p.terraformed); p.baseSize = Math.max(p.baseSize, 40);` inside the atmos completion branch (cost 200 at lines 305-314, hostile→minimal conversion at line 310 — both faithful to MOO). MOO 1993's Atmospheric Terraforming changes only the environment class, not planet size, so a size-10 Radiated world jumping to >=40 (quadrupled max pop) is a real deviation, with no comment marking it intentional. The parenthetical is also accurate

### [events-ground] Plague population loss is applied by two independent code paths every year
**Location:** `js/game/events_run.js:208` · **Category:** bug
**MOO 1993 rule:** MOO 1993: plague kills a fraction of population each turn until cured; a single attrition rule, not two stacked ones.

events_run.js:208 drains 4% of population per year for a plagued colony (`c.pop = Math.max(1, c.pop - c.pop * 0.04)`), while colony.js:435 in growPopulation() independently applies `growth = Math.min(growth, 0) - c.pop * 0.05` for the same plague flag. Both run every turn, so the effective drain is ~9%/year from two different formulas, and the two paths disagree on floors: events_run clamps at 1 pop, but growPopulation allows pop to fall below 0.5 and destroy the colony. One of these is clearly a leftover duplicate; the same 'thing' (plague attrition) is computed differently in two places.

*Verifier correction:* One nuance: because progress() (turn step 9) re-floors pop at 1 after growPopulation (turn step 3), a plagued colony enters the next growth phase with pop >= 1 and a 5% drain can only reach ~0.95, so plague attrition alone cannot actually push pop below 0.5; the colony-death path needs an additional pop-loss source (transports, bombardment, overcrowding). The duplicate-drain core claim is fully correct.

*Verified:* Both paths exist exactly as claimed: js/game/events_run.js:208 does c.pop = Math.max(1, c.pop - c.pop*0.04) each year, and js/game/colony.js:435 does growth = Math.min(growth,0) - c.pop*0.05 for the same c.plague flag; growPopulation has no floor of 1 and kills the colony below 0.5 (colony.js:438-441). Combined drain is ~8.8%/yr from two different formulas.

### [events-ground] Events have no once-per-game flags; every event can repeat indefinitely
**Location:** `js/game/events_run.js:30` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 random events: each event type fires at most once per game.

weightedPick(HOO.DATA.EVENTS) draws from the full event list on every fire with static weights; there is no fired-events tracking on the game object. In MOO 1993, each random event type occurs at most once per game (only the monster events and a few others were special-cased). Here the same empire can be hit by plague, supernova, or rebellion repeatedly for the whole game. Only mineral_rich/mineral_poor degrade gracefully on re-fire (they silently fizzle, which also wastes the 6-14 year event slot with no notice, events_run.js:73,79).

*Verified:* maybeFire() picks via weightedPick(HOO.DATA.EVENTS) over the full static list (events_run.js:30, 105-110); grep shows the only event state on the game object is g.eventCooldown (state.js:301) — no fired-event tracking anywhere. The mineral fizzle paths (events_run.js:73, 79) return empty after the cooldown was already reset at line 24, silently wasting the slot (the rebellion home-star guard at line 85 does the same). MOO 1993 fidelity confirmed via the 1oom recreation: game_event.c marks each e

### [events-ground] Player never gets tactical combat against the event monster; battles are force-auto-resolved
**Location:** `js/game/events_run.js:174` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993: space monster attacks are resolved through the normal ship combat screen where the player commands the defense.

progress() calls HOO.Combat.autoResolve(battle) unconditionally when the monster arrives at a defended star, even when the defender is the player (empire 0). This is internally inconsistent with the Guardian of Orion, whose battles are queued into playerCombats for manual command (turn.js:195-198), and with MOO 1993 where you fought the Amoeba/Crystal in normal tactical combat. Additionally, only the first fleet owner at the star fights (`defenders[0].empire`, events_run.js:168); other empires' fleets in the same orbit are ignored entirely.

*Verified:* events_run.js:166-175: progress() builds the battle and calls HOO.Combat.autoResolve(battle) unconditionally with no isPlayer check; line 168 uses defenders[0].empire and line 172 filters the defender fleets to that single empire, so other empires' fleets in the same orbit neither fight nor are considered. Guardian battles involving the player are queued for manual resolution in turn.js:191-203 (involvesPlayer check at 195, playerCombats.push at 197). In MOO 1993 the Amoeba/Crystal were fought i

### [events-ground] MOO1 has distinct Space Amoeba and Space Crystal events; clone has one generic 'Devourer'
**Location:** `js/data/events.js:64` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual p.50: Space Amoeba and Space Crystal are separate random events; both leave affected planets devastated (lifeless/radiated), not merely depopulated.

The event list contains a single 'monster' entry, and events_run.js:90-95 spawns one generic monster (3000 hits, generic beam via combat.js monsterStack fallback 'Annihilation Field'). MOO 1993 had two separate monster events with distinct stats and aftermath: the Space Amoeba (consumes the biosphere, leaving planets uninhabitable) and the Space Crystal (irradiates planets). Here the planet is left fully colonizable after the colony is 'devoured' (star.planet.colony = null, planet untouched), so neither monster's signature planet-ruining effect exists.

*Verifier correction:* The reviewer swapped the two aftermaths: per the 1oom recreation, the AMOEBA leaves the planet RADIATED with max pop slashed to ~10-20 and factories divided by 10, while the CRYSTAL zeroes population and floods the planet with waste but leaves the planet type unchanged (recolonizable). The substantive claim stands: MOO1 had two distinct monsters with lasting planet damage; the clone has one generic monster with no lasting planetary effect.

*Verified:* data/events.js:63-66 has a single 'monster' entry; events_run.js:90-95 spawns one generic 3000-hit monster with weaponIds: [], which falls back to the 'Annihilation Field' beam in combat.js:84. On devouring, only star.planet.colony = null (events_run.js:182-184) — the planet object is untouched and immediately recolonizable. MOO1 (1oom game_event.c) has separate GAME_EVENT_CRYSTAL and GAME_EVENT_AMOEBA with distinct stats and lasting planetary aftermath.

### [events-ground] AI never puts down rebellions on its own colonies, permanently zeroing their production
**Location:** `js/game/ai.js:299` · **Category:** balance
**MOO 1993 rule:** MOO 1993: AI empires suppress their own rebellions by invading with loyal troops, as the player must.

The rebellion event (events_run.js:84-87) and spy-incited rebellion (espionage.js:130-133) set inRebellion, which zeroes rawProduction (colony.js:71) and skips all colony processing (colony.js:178). The only cure is landing own transports (ground.js:128-139), but manageTransports() in ai.js only moves population from crowded to under-populated colonies and never checks inRebellion (grep confirms no reference to inRebellion/rebels anywhere in ai.js). A rebelling colony keeps ~full population so it never qualifies as 'hungry'; an AI empire hit by the event therefore loses that colony's output for the rest of the game, silently.

*Verified:* Verified: events_run.js:84-88 and espionage.js:130-133 set inRebellion; colony.js:71 zeroes rawProduction (bc = 0) and colony.js:178 early-returns processColony for rebelling colonies; the only clear path is landing own transports (ground.js:128-139) or losing the colony to invasion (ground.js:181 replaces the object). grep confirms no reference to inRebellion or rebels anywhere in js/game/ai.js; manageTransports (ai.js:299-312) only moves pop from colonies above 85% capacity to colonies below 4

### [events-ground] Rebellion suppression battle corrupts population accounting
**Location:** `js/game/ground.js:133` · **Category:** bug
**MOO 1993 rule:** MOO 1993: putting down a rebellion is a ground battle in which each unit lost on either side is one million colonists killed.

In resolveLanding()'s own-colony branch, arriving loyalists are first added to pop with a clamp (`c.pop = Math.min(mp * 1.2, c.pop + pop)`, line 127), then groundBattle(pop, ..., rebels, 0) runs. On victory (line 133) no loyalist casualties are removed from pop and dead rebels are never deducted either, so crushing a 50%-pop rebellion costs zero population. On defeat (line 137) the FULL transport pop is subtracted even when the mp*1.2 clamp discarded part of it, deleting population that was never added (e.g. pop 100, cap 105, send 20: pop becomes 105 then 85 on loss — 15 pop vanish). In MOO 1993 both rebel and loyalist casualties from suppression reduced the planet's population.

*Verified:* ground.js:127: c.pop = Math.min(mp*1.2, c.pop + pop) adds (and possibly clamps away part of) the arriving loyalists before the battle. Victory branch (ground.js:132-135) only sets inRebellion=false, rebels=0 — neither loyalist casualties (pop - result.attackersLeft) nor dead rebels are deducted from c.pop, so crushing a 50%-pop rebellion costs zero population. Defeat branch (ground.js:136-138) subtracts the FULL transport pop (c.pop = Math.max(1, c.pop - pop)) even when the clamp discarded part 

### [fleet-galaxy] ETA calculation ignores the nebula warp-1 clamp applied by actual movement
**Location:** `js/game/fleet.js:128` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual, Nebulas: fleets inside a nebula move at warp 1 regardless of engines

Two code paths compute travel time differently: moveFleets() clamps warp to 1 when the fleet's current position is inside a nebula (fleet.js:139) and moveTransports() does the same (fleet.js:200), but eta() (fleet.js:122-129) uses raw fleetWarp with no nebula check. Every ETA the player sees (panels.js:544/623/642, screens.js:379, map.js:233, and the hover previews at map.js:398/428) can therefore be wrong by a factor of up to the fleet's warp speed for any route that starts in or crosses a nebula — a fleet shown as '2 yr' can take 10+ years to arrive.

*Verified:* eta() at fleet.js:122-129 computes Math.ceil(d / warp) from fleetWarp(g, f) with no nebula test, while moveFleets() clamps 'if (inNebula(g, f.x, f.y)) warp = 1' (fleet.js:139) and moveTransports() does 'warp = inNebula(g, t.x, t.y) ? 1 : t.warp' (fleet.js:200). All cited display sites verified: panels.js:544, 623, 642; screens.js:379; map.js:233 call HOO.Fleet.eta, and the hover previews at map.js:398 (transport) and map.js:428-430 (fleet, eta3) recompute distance/warp inline, also without any n

### [fleet-galaxy] Hypercomm redirect of a gate-jumping fleet teleports it to any destination
**Location:** `js/ui/panels.js:622` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual, Star Gates: instant travel only between two colonies that both have star gates

sendFleet() marks a fleet gateJump when both endpoints have friendly stargates (fleet.js:107), and moveFleets() honors 'if (f.gateJump || step >= d)' by snapping the fleet to f.to (fleet.js:142-143). The in-transit redirect path for a player with Hyperspace Communications sets 'f.to = destStar.id' without clearing f.gateJump (panels.js:622). Redirecting a fleet during its one-turn gate jump therefore makes it arrive instantly next turn at ANY in-range star — including gateless and enemy systems — giving effectively free galaxy-wide teleportation once the two techs are combined.

*Verified:* sendFleet() sets 'gateJump: !!(gateFrom && gateTo)' (fleet.js:107) based on the ORIGINAL endpoints. The hypercomm redirect path in directDeploy() (panels.js:617-625, gated by derived.hasHypercomm at panels.js:595) does only an inRange check and then 'f.to = destStar.id;' (panels.js:622) without touching f.gateJump. moveFleets() then hits 'if (f.gateJump || step >= d)' (fleet.js:142) and snaps the fleet to the new f.to instantly (line 143). Since the fleet is selectable in transit during the same

### [fleet-galaxy] Homeworld/Orion inNebula flag forced false while position stays inside the nebula ellipse
**Location:** `js/game/galaxy.js:156` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual, Nebulas: a system inside a nebula is consistently subject to nebula rules (warp 1, no shields)

Homeworld setup does 'hs.inNebula = false' (galaxy.js:156) and Orion is created with 'inNebula: false' (galaxy.js:115) without checking or relocating the star, yet nebulas are placed before homeworlds are chosen, so a homeworld can sit geometrically inside a nebula ellipse. The two nebula code paths then disagree forever: movement uses the geometric test HOO.Fleet.inNebula(g, x, y) (fleet.js:139, 200), so every fleet and transport leaving/approaching that homeworld crawls at warp 1 for the whole game, while combat and colony code use the star.inNebula flag (combat.js:57, colony.js:238, ground.js:44) and treat the system as clear space. Homeworld selection should exclude nebula-covered stars (or clear the covering nebula).

*Verified:* Nebulas are generated first (galaxy.js:71-78), stars get a geometric inNebula flag (line 124), Orion is hardcoded 'inNebula: false' at the exact centre (lines 97, 115), and homeworld candidates filter only '!s.orion' (line 136) with no nebula exclusion; line 156 then forces 'hs.inNebula = false' without moving the star. Movement uses the geometric test HOO.Fleet.inNebula(g, x, y) (fleet.js:139, 200) so fleets to/from such a homeworld crawl at warp 1 forever, while combat.js:57-58, colony.js:238,

### [fleet-galaxy] Retreating defenders at their own colony never actually retreat and are forced to re-fight
**Location:** `js/game/combat.js:660` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, Retreating: ships that retreat from combat jump to the closest friendly colony system

applyResults() sends a losing side's retreated ships toward nearestColonyStar(), but when the battle takes place at that empire's own colony (the most common defensive battle), the nearest friendly colony IS the battle star, so the 'nearest.id !== b.star.id' guard fails and the retreated ships are merged back into the fleet sitting at the battle star (combat.js:669-671). Next turn, combat detection (turn.js:130-162) re-triggers the same battle, so 'retreat' for a defender at home is impossible — the ships that fled are thrown straight back into the meat grinder every turn until destroyed. MOO sends such retreaters to the next-closest friendly colony; the search should exclude the battle star.

*Verified:* applyResults() at combat.js:657-671: losers' retreaters flee via nearestColonyStar(g, emp, b.star) (combat.js:683-690), which iterates ALL of the empire's colonies including the battle star itself; when the battle is at the loser's own surviving colony the nearest colony is distance 0, the 'nearest && nearest.id !== b.star.id' guard (line 660) fails, and the else branch (lines 669-671) merges the retreated ships back into the fleet left at the battle star. turn.js:128-162 then re-detects combat 

### [fleet-galaxy] Homeworld neighborhood guarantee is weaker than its own comment and than MOO's playable-start rule
**Location:** `js/game/galaxy.js:162` · **Category:** balance
**MOO 1993 rule:** MOO 1993 galaxy generation: every homeworld is guaranteed nearby colonizable stars reachable at the starting 3-parsec fuel range

The comment (galaxy.js:161) says 'guarantee at least two reachable planets (any quality) within range 5', but the code only ensures ONE habitable planet ('if (habitable.length < 1 && near.length)') and does nothing at all if no star happens to lie within 5 parsecs of the homeworld. Additionally, the 5-parsec radius exceeds the starting fuel range of 3 (BASE_RANGE, state.js:58): colony ships have no reserve fuel tanks (only the scout gets +3, shipdesign.js:169-183), so the one 'guaranteed' habitable world can be unreachable for colonization until Hydrogen/Deuterium Fuel Cells are researched. An unlucky roll produces a stranded, unwinnable start, which the original game's generator explicitly prevented.

*Verifier correction:* All code claims verified exactly. The one soft spot is the MOO-1993 comparison: it is widely reported that the original generator guaranteed a reachable colonizable star near each homeworld, but the exact original rule (count/radius) is not documented precisely enough to pin the deviation to a specific number; the code-vs-own-comment mismatch and the range-3 arithmetic stand regardless.

*Verified:* galaxy.js:161 comment promises 'at least two reachable planets (any quality) within range 5' but the code (lines 162-173) only patches ONE habitable planet ('if (habitable.length < 1 && near.length)') and silently does nothing when no star lies within 5*PARSEC. BASE_RANGE is 3 (state.js:58), and inRange() takes the MINIMUM extraRange across a fleet's designs (fleet.js:70-77): the starter Colony Ship (shipdesign.js:184-188) has no reserve fuel tanks (only the Scout gets them, shipdesign.js:167-18

### [fleet-galaxy] Ship relocation destination never revalidated after the destination colony is lost
**Location:** `js/game/colony.js:211` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual, Relocate: new ships may only be routed to one of your own colonies

relocTo() validates ownership only at the moment the order is set (panels.js:467). Nothing clears c.reloc when the destination colony is later captured (ground.js:181 creates a new colony object for the conqueror), destroyed by bombardment (ground.js:104) or by events (events_run.js:134/183/226). processColony then keeps calling sendNewShips() every production tick (colony.js:211-213), shipping every newly built vessel — including unarmed colony ships — one-by-one into what is now an enemy or empty system, with no range check and no player notification. The reloc order should be cancelled (ships kept in orbit) when the destination is no longer a friendly colony.

*Verified:* relocTo() checks 'colony.empire === 0' only at order time (panels.js:460-471). Grep for 'reloc' across js/ shows it is set only there and read only at colony.js:211-216 and map.js:330; nothing clears it when the destination colony disappears: ground.js bombardment sets star.planet.colony = null on destruction (~line 104), invasion replaces it with HOO.Colony.create(t.empire, ...) for the conqueror (~line 181), and events_run.js nulls colonies for comet impact, Devourer, and supernova. processCol

### [moo-checklist] High Council convenes at >50% colonized instead of MOO1's two-thirds
**Location:** `js/game/council.js:29` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, Winning the Game / The High Council: the council first convenes when two-thirds of the planets in the galaxy have been colonized, then votes every 25 years; candidates are the two most populous empires; two-thirds of all votes elects the High Master.

shouldConvene() triggers the first council once colonizedFraction(g) > 0.5 (and every 25 years thereafter). MOO 1993 convenes the Galactic High Council only once two-thirds of the galaxy's planets are colonized. The README states 'once half the galaxy is settled' as fact but presents the game as manual-faithful, so purists will see elections fire noticeably early. (The 1-vote-per-50-pop scale on line 24 is explicitly commented as an intentional small-game tweak and is not counted here.)

*Verified:* js/game/council.js:29 — shouldConvene() returns false while colonizedFraction(g) <= 0.5, so the first election fires as soon as more than half of habitable (non-Orion) planets are colonized, then every 25 years (line 32). MOO 1993 convenes the council only once two-thirds of the galaxy's planets are colonized. README line 21 states 'The High Council convenes once half the galaxy is settled', so the behavior is documented but still deviates from the original. The 2/3 figure IS used for the vote t

### [moo-checklist] Ferret (Mrrshan) 'ships fire first' trait is defined but never implemented
**Location:** `js/data/races.js:74` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual, The Races — Mrrshan: their ships receive +4 attack levels and always fire first in ship-to-ship combat.

races.js sets firstStrike: true for the Ferrets and README line 33 advertises '+4 to ship attack rolls; ships fire first', but grep shows 'firstStrike' is referenced nowhere in the engine — combat initiative (combat.js beginRound, shipdesign.js compute) uses only maneuver + computer mark + initBonus (Budgies/Alkari get their +3, Ferrets get nothing). Half of the Mrrshan analog's racial ability is silently missing, weakening the race relative to canon and to its own README description.

*Verified:* js/data/races.js:74 sets shipAttack: 4, firstStrike: true, and README line 33 area advertises 'ships fire first'. Grep across js/ finds 'firstStrike' only in races.js (line 74 and the header comment at line 9). Ship stats in js/game/shipdesign.js:133-135 use race.shipAttack, race.shipDefense, race.initBonus — never firstStrike — and combat turn order (js/game/combat.js:171) sorts purely by stack initiative with a random tiebreak. The +4 attack half of the trait works; the fire-first half is sile

### [moo-checklist] Nebula 'shields fail' rule applied to missile bases but not to ships
**Location:** `js/game/combat.js:41` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual, The Map / Nebulas: inside a nebula ships travel at warp 1 and deflector shields do not function during combat (all combatants, not just planetary defenses).

baseStack() (lines 57-58) correctly zeroes the deflector and planetary shield when star.inNebula, but stackFromDesign() gives ship stacks their full design.shieldCls with no nebula check, and createBattle() never inspects star.inNebula for ships. So in a nebula battle the defender's bases fight shieldless while every ship on both sides keeps full deflectors — an internal inconsistency, contrary to both MOO1 and the README's own claim ('nebulas (warp 1, shields fail)'). Fleet movement (fleet.js) does clamp warp to 1 correctly.

*Verified:* js/game/combat.js:57-58 — baseStack() zeroes both deflector and planetary shield when star.inNebula. But stackFromDesign() assigns ships their full design.shieldCls unconditionally (line 40; the reviewer cited line 41, one line off, inside the same function), and grep confirms combat.js references inNebula only at lines 57-58 — createBattle() never checks it for ship stacks. MOO 1993 negates deflector shields for all combatants in a nebula, and README line 21 itself says 'nebulas (warp 1, shield

### [moo-checklist] Guinea Pig (Bulrathi) ground-combat bonus is +20; MOO1 Bulrathi get +25
**Location:** `js/data/races.js:29` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, The Races — Bulrathi: the strongest race, gaining a +25 bonus in all ground combat.

groundBonus: 20 (and README: '+20 bonus in all ground combat'). The original Bulrathi bonus is +25 in ground combat. The header comment in races.js claims 'Mechanics fields follow the original manual exactly', so this is a fidelity miss rather than a labeled rebalance; it makes the ground-combat race noticeably weaker since groundBattle() resolves opposed d100 rolls where 5 points matters.

*Verified:* js/data/races.js:29 — groundBonus: 20, with bonusText '+20 bonus in all ground combat' (line 28) and README line 28 matching. MOO 1993 Bulrathi receive +25 in ground combat. The file header (races.js:5-6) claims 'Mechanics fields follow the original manual exactly', so this is an undocumented fidelity miss. groundBattle() (js/game/ground.js:199-210) resolves opposed d100+bonus rolls per casualty, so the 5-point difference is a real, repeated disadvantage.

### [moo-checklist] Meklar-analog 'free factory refits' is a non-canon invented racial ability
**Location:** `js/data/races.js:65` · **Category:** balance
**MOO 1993 rule:** MOO 1993 manual, The Races — Meklar: cybernetic interfaces allow each population point to control 2 additional factories; that is their only listed advantage. Factory refits to higher robotic controls cost BC for every race (Colony Development chapter).

freeRefit: true lets Mice skip the entire factory refit cost when robotic controls improve (colony.js:264 waives the refit charge that every other race pays). MOO 1993's Meklar bonus was solely superior robotic controls (+2 factories per population); no race got free refits — all races paid to upgrade factories to new control levels. The README's race table presents 'free refits' as the Meklar heritage ability, which misrepresents canon and stacks a second industrial perk on the race, compounding with the correct +2 controls bonus.

*Verified:* js/data/races.js:65 — factoryControlBonus: 2, freeRefit: true for the Mice, and js/game/colony.js:264 skips the refit charge when race.freeRefit ('if (c.controls < d.controls && !race.freeRefit && c.factories > 0)'); panels.js:337 mirrors this in the UI. In MOO 1993 the Meklar bonus was solely operating +2 factories per population unit; every race paid to refit factories to improved robotic controls. The +2 controls part is canon; freeRefit is an invented second industrial perk presented in READ

### [production] Save failures are silently swallowed; manual save shows a false success toast
**Location:** `js/ui/screens.js:31` · **Category:** bug

state.js save() correctly catches QuotaExceededError/private-mode failures and returns false, but no caller checks the result. The Game-menu save button (screens.js:31-33) unconditionally shows 'Game saved to slot N' even when save() returned false, and the per-turn autosave (js/main.js:37) ignores the result entirely. A player in Safari private mode or with a full quota (huge-galaxy saves are large JSON blobs written twice per turn) plays for hours believing they are protected, then loses everything. Also, save() writes the save blob then the meta as two separate setItem calls, so a failure between them leaves meta and save out of sync.

*Verified:* js/game/state.js:352-364: save() catches all exceptions and returns false. js/ui/screens.js:30-34: the Save button calls HOO.State.save(slot) at line 31 and unconditionally toasts 'Game saved to slot N' (kind green) at line 33 without checking the return value. Autosave at js/main.js:37 (HOO.State.save('auto');) also ignores the result. The two-setItem out-of-sync claim is accurate: state.js:356 writes the save blob, :357 writes the meta as a separate setItem inside the same try — a quota failur

### [production] After a caught mid-turn exception, play continues on half-mutated state and the next autosave permanently overwrites the only good save
**Location:** `js/main.js:28` · **Category:** production

endTurn() wraps HOO.Turn.nextTurn in try/catch, but nextTurn mutates state incrementally (turn/year incremented at turn.js:64-65, then AI, economy, movement, combat...). On exception the dialog 'Anomaly Detected' is shown and the player keeps playing the partially-processed game; the next successful end-of-turn autosave (main.js:37) then persists that corrupted state over the single 'auto' slot — there is no autosave rotation (e.g. auto/auto-prev) and no pre-turn snapshot to roll back to. The catch prevents the immediate freeze but converts a transient bug into permanent save corruption. Positive note: autosave timing itself is safe — it fires only after the turn fully completes, so a hard crash mid-turn cannot truncate the save.

*Verified:* js/main.js:26-33: try/catch around HOO.Turn.nextTurn shows the 'Anomaly Detected' dialog (line 32) and resets processing, letting play continue. js/game/turn.js:64-65 confirms g.turn++/g.year++ happen first, then AI planning (line 68), economy (72-83), growth (93-103), movement (106-107) — incremental mutation with no rollback. The only autosave slot is 'auto' (grep: save('auto') appears only at main.js:37 and screens.js:49); no rotation or pre-turn snapshot exists. Positive note also verified: 

### [production] No global error handler; an exception during turn presentation or tactical combat soft-locks the game
**Location:** `js/main.js:35` · **Category:** production

Only nextTurn is guarded. HOO.Notices.presentTurn (main.js:35) and everything it drives — the sequential queue in notices.js:81-86, combat dialogs, and the entire CombatUI setTimeout chain (combatui.js:104-110, 113-120) — run unguarded. Any thrown error there leaves processing=true and the wheel button disabled (setWheelSpinning(true) sets disabled), the done() callback never fires, and the autosave for that turn is never written: the game is frozen until a full page reload, losing the turn. There is no window.onerror / 'error' / 'unhandledrejection' listener anywhere to surface or recover from faults. Given combat.js/combatui.js are the most complex code paths, a single edge-case throw there is a whole-session freeze.

*Verified:* grep across js/ and index.html finds no window.onerror, addEventListener('error'), or unhandledrejection handler. Only nextTurn is guarded (main.js:26-33); HOO.Notices.presentTurn at main.js:35 and its sequential queue (js/ui/notices.js:81-86 runNext) are unguarded, as is the CombatUI setTimeout chain (js/ui/combatui.js:104-110 and actAI 113-120). setWheelSpinning(true) sets b.disabled = true (js/ui/ui.js:308-311), and processing stays true (main.js:15 blocks Enter/endTurn), so a throw before do

### [production] Every new game/load stacks an additional permanent requestAnimationFrame render loop and window resize listener
**Location:** `js/ui/map.js:32` · **Category:** bug

Map.init() is called from every UI.buildFrame() (new game, Continue, every slot load, HOO.Main.rebuild). It adds window.addEventListener('resize', resize) at line 23 (never removed) and starts requestAnimationFrame(tick) at line 32. The old loop's guard `if (!canvas.parentNode) return` (line 265) reads the module-level `canvas` variable, which init() has already reassigned to the NEW attached canvas by the time the old callback fires — so the old loop never terminates. After N loads in one session there are N+1 concurrent loops each doing a full draw() (including per-star createRadialGradient for up to 108 stars) every frame on the same canvas. CPU/battery usage grows linearly with each game loaded until the tab is closed.

*Verified:* js/ui/map.js:19-33: init() reassigns the module-level canvas (declared line 8) at line 20, adds window.addEventListener('resize', resize) at line 23 (never removed; grep finds no removeEventListener), and starts requestAnimationFrame(tick) at line 32. tick() at 264-269 guards only on !canvas.parentNode — but that reads the module variable, which init() has synchronously reassigned to the new attached canvas before the old loop's next rAF callback fires (buildFrame in js/ui/ui.js:13-52 detaches t

### [production] ratioRow leaks two permanent window-level listeners per slider on every panel render
**Location:** `js/ui/ui.js:251` · **Category:** bug

Every ratioRow() call registers window.addEventListener('mousemove', ...) and window.addEventListener('mouseup', ...) that are never removed. The colony panel builds 5 bars per showStar (panels.js:194), which fires on every star click, every Tab-cycle, and after every turn (main.js:43); the tech screen adds 6 more (screens.js:744), races/status screens more. Over a 300-turn session this accumulates thousands of window listeners, each closure retaining its detached DOM subtree and colony references (memory leak), and each mousemove event now walks the entire dead-listener list. Listeners should be attached on mousedown and removed on mouseup, or delegated once.

*Verified:* js/ui/ui.js:251-256: every ratioRow() call registers window.addEventListener('mousemove', ...) and window.addEventListener('mouseup', ...); neither is ever removed (no removeEventListener anywhere in the file). js/ui/panels.js:194 creates ratioRow inside Object.keys({ship,def,ind,eco,tech}).forEach → 5 bars per showStar; showStar fires on star click, Tab-cycle (main.js:107→cycleColonies→showStar line 64), and after every turn (main.js:43). js/ui/screens.js:744 adds one per research field (HOO.CO

### [production] No touch or pointer input support — game is unplayable on touch devices despite viewport meta and 'any modern browser' claim
**Location:** `js/ui/map.js:26` · **Category:** ux

index.html:5 ships a mobile viewport meta and README.md:7 says 'Open index.html in any modern browser', but the map registers only mousedown/mousemove/mouseup/wheel (map.js:26-30) with no touchstart/pointerdown equivalents; combat uses click/mousemove only (combatui.js:52-53); allocation bars are mouse-drag only (ui.js:244). On a tablet/phone: tapping selects (synthesized click) but drag-to-pan pans the page instead of the map, pinch zooms the whole document, wheel-zoom is impossible, and sliders barely respond. The single responsive rule (@media max-width:900px, style.css:615) still allocates a fixed 300px sidebar, leaving a sliver of map on phones. Either add pointer-event handlers plus touch-action:none on the canvas, or drop the mobile-ready signals.

*Verified:* grep for touchstart/pointerdown/pointermove/PointerEvent/touch-action across js/, css/, index.html returns zero hits. js/ui/map.js:26-30 registers only mousedown/mousemove/mouseup/wheel/mouseleave; js/ui/combatui.js:52-53 only click/mousemove; js/ui/ui.js:244 ratio bars only mousedown (plus the window mousemove/mouseup drag). index.html:5 ships the mobile viewport meta; README.md:7 says 'Open index.html in any modern browser'. The single responsive rule is at css/style.css:615-616: @media (max-w

### [research] Anti-Missile Rockets implemented at 35% base kill chance vs the 85% −5%/level stated in its own tech data and the manual
**Location:** `js/game/combat.js:440` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, weapons technology table: Anti-Missile Rockets destroy incoming missiles 85% of the time, minus 5% per tech level of the attacking missile.

Internal inconsistency: js/data/tech.js:471 describes the special as '85% chance (minus 5% per enemy tech level)' and SPECIAL_STATS (tech.js:631) says '85% base chance', but combat.js line 440 computes destroyPct = 35 - m.tech.level (a flat −1%/level from a 35% base). Against level-1 nuclear missiles the device kills 34% instead of the manual's 80%, making a purchased special roughly 2.4x weaker than both the manual and the game's own tooltips claim. (Zyro at 75 - level and Lightning at 100 - level on lines 438-439 also use −1%/level, but their bases match their descriptions; anti-missile is the clear outlier.)

*Verified:* js/game/combat.js:440: `else if (t.specials && t.specials.antiMissile) destroyPct = 35 - m.tech.level;` — a 35% base minus 1% per enemy missile tech level. The game's own data contradicts this twice: js/data/tech.js:471 ('85% chance (minus 5% per enemy tech level) to destroy incoming missiles') and tech.js:631 SPECIAL_STATS.antiMissile ('85% base chance to shoot down incoming missiles'), both matching the MOO 1993 manual's 85% −5%/level rule. Against a level-1 nuclear missile the code yields 34%

### [research] Automated Repair and Advanced Damage Control heal 25%/50% of hull per turn instead of the documented 15%/30%
**Location:** `js/game/combat.js:490` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, construction technologies: Automated Repair System repairs 15% of hull damage per combat turn; Advanced Damage Control repairs 30%.

Internal inconsistency between tech data and combat wiring: tech.js:150 ('repairs 15% of hull damage at the start of each combat turn') and tech.js:177 ('repairs 30%') match the manual, but combat.js:489-490 repairs s.hits * 0.5 for advDamControl and s.hits * 0.25 for autoRepair — 1.67x the stated rates. A large hull with Advanced Damage Control regenerates half its maximum hit points every round, which makes repair-fitted ships nearly unkillable by low-DPS fleets and deviates from both the manual and the in-game descriptions shown to the player.

*Verified:* js/game/combat.js:489-490 in endRound(): advDamControl reduces topDamage by `s.hits * 0.5` and autoRepair by `s.hits * 0.25` each round — 50% and 25% of the ship's maximum hits. The in-game descriptions say otherwise: js/data/tech.js:150 (Automated Repair System, 'repairs 15% of hull damage at the start of each combat turn'), tech.js:177 (Advanced Damage Control, 'repairs 30%'), and SPECIAL_STATS at tech.js:615-616 repeat 15%/30%. Those documented values match MOO 1993; the code is 1.67x the sta

### [research] Scatter Pack V/VII/X all split into 3 warheads instead of 5/7/10; Gatling Laser fires 3 shots instead of 4
**Location:** `js/data/tech.js:488` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, weapons table: Scatter Pack V/VII/X Rockets split into 5, 7, and 10 warheads respectively (Hyper-V, Merculite, and Stinger class); the Gatling Laser fires 4 times per combat turn.

All three scatter packs (tech.js:488, :542, :569) and the Gatling Laser (tech.js:467) use the same autofire:3 flag, which combat.js:305/350 multiplies into 3 launches/shots. Per-warhead damage values are faithful (6/10/15), but the submunition counts are 3 across the board, so Scatter Pack V delivers 60% of its MOO throughput, VII delivers 43%, and X delivers 30% — inverting the tier progression (higher scatter packs are proportionally more nerfed than lower ones). Gatling Laser at 3 shots is 75% of the original's 4.

*Verifier correction:* One small addition: the Gatling Laser's own description (tech.js:468, 'firing 3 shots') is internally consistent with the code — only the scatter packs' descriptions ('splits into multiple warheads') are vague — so the Gatling issue is purely a MOO-fidelity deviation, not an internal inconsistency.

*Verified:* js/data/tech.js: scatter_pack_v (line 488), scatter_pack_vii (line 542), scatter_pack_x (line 569) all carry `autofire:3`, and gatling_laser (line 467) also has `autofire:3`. combat.js:305 multiplies missile launches by autofire (`launches = s.count * w.count * (e.autofire ? e.autofire : 1)`) and combat.js:350 does the same for beam shots, so all three scatter packs deliver 3 warheads and the Gatling fires 3 shots. Per-warhead damage 6/10/15 (dmin/dmax on those lines) is faithful to MOO's Hyper-

### [research] Psilon-analog Rats get a +50% research-point multiplier that does not exist in MOO, stacked on the correct 80% tech costs
**Location:** `js/data/races.js:83` · **Category:** balance
**MOO 1993 rule:** MOO 1993 manual, race descriptions: the Psilon advantage is reduced technology cost (80% in all six fields) plus a larger selection of available techs per game — there is no flat research-output bonus.

races.js:83 gives Rats researchBonus: 0.5, and research.js:48 multiplies all their research points by 1.5 (also reflected in the UI at panels.js:374). Combined with the faithful all-0.8 researchCosts (races.js:85), Rats effectively research at ~53% of standard cost, far stronger than MOO Psilons — while the actual Psilon perk (larger tech-tree subset) is only approximated by one extra next-project choice (research.js:21). The races.js header comment (line 9) claims these fields 'follow the original manual exactly'. The other nine races' per-field 0.6/0.8/1.0/1.25 multipliers do match the MOO pattern; only this invented output multiplier deviates.

*Verifier correction:* The fidelity-claim comment is at races.js:6 (the comment block spans lines 5-12); line 9 is where 'researchBonus (Psilon)' is named. Everything else is as stated.

*Verified:* js/data/races.js:83 `researchBonus: 0.5` and line 85 `researchCosts` all 0.8. js/game/research.js:48 `if (race.researchBonus) points *= (1 + race.researchBonus);` multiplies all Rat research points by 1.5 before allocation, and panels.js:374 applies the same multiplier in the per-colony RP forecast. Combined effect is 0.8/1.5 ≈ 53% of standard cost. In MOO 1993 the Psilon research advantage is implemented entirely through the per-field tech-cost table plus a larger per-game tech-tree subset — th

### [research] Externally acquired tech (espionage/trade/capture) does not reset the player's active research project — RP wasted and a phantom duplicate breakthrough is announced
**Location:** `js/game/research.js:74` · **Category:** bug
**MOO 1993 rule:** MOO 1993: acquiring a technology by theft, exchange, or invasion immediately makes it known; you cannot continue researching a tech you already possess.

State.grantTech (state.js:89) never touches emp.research.projects, and Research.ensureProjects is only run each turn for AI empires (ai.js:10 early-returns for the player; ai.js:35 is AI-only). If the player obtains their in-progress tech via spy theft (espionage.js:102), tech exchange (diplomacy.js:154, 235-236), council gift (turn.js:299), or invasion capture (ground.js:222), processResearch keeps pouring that field's RP into the already-known tech. When the breakthrough roll eventually succeeds, grantTech returns false but research.js:74-76 pushes the discovery unconditionally, so turn.js:86-90 announces a second 'Research breakthrough' for a tech the player already owns. All RP invested in that field between acquisition and the phantom breakthrough is silently lost; AI empires are immune because their projects are re-validated every turn.

*Verifier correction:* Two small corrections: (1) turn.js:299 is the Guardian-of-Orion spoils grant, not a 'council gift'. (2) The wasted-RP window can end before the phantom breakthrough: a genuine breakthrough in ANY other player field triggers ensureProjects (research.js:81), which silently replaces the stale project (invested resets to 0 via startProject, research.js:31) — the banked RP is still lost, but the duplicate announcement only fires if the stale field's roll succeeds first. The core defect stands as described.

*Verified:* state.js:89-96 grantTech sets techFlags and calls recomputeEmpire but never touches emp.research.projects. Research.ensureProjects (research.js:34-43, which would clear a known-tech project via the techFlags check on line 37) is called only at game creation (state.js:343), from AI planning (ai.js:35, unreachable for the player because ai.js:10 returns on emp.isPlayer), and at research.js:81 only when that empire just had a discovery. External grants — spy theft espionage.js:102, tech tribute dip

### [ui-code] Fleet sidebar not refreshed after end of turn (stale ships/position)
**Location:** `js/main.js:42` · **Category:** bug

The post-turn refresh only re-renders the sidebar when a star is selected: `if (sel.star !== null ...) HOO.Panels.showStar(sel.star)`. If a fleet is selected (very common: player just ordered ships, presses Enter), the Fleet Deployment panel keeps pre-turn data — in-transit fleets show the old ETA/position, orbiting fleets show ship counts from before combat, and a fleet destroyed in battle or emptied by cleanup() (fleet.js:41-43) is still shown as commandable. currentSel/selectedFleet still reference the dead object; clicking a star then calls directDeploy → HOO.Fleet.sendFleet, which silently returns null (fleetAt finds nothing), so orders appear to be ignored with no feedback. Fix: also call HOO.Panels.showFleet(sel.fleet) (re-resolving the fleet object) or showBlank when the fleet no longer exists.

*Verified:* js/main.js:42-43: post-turn refresh is only `if (sel.star !== null && sel.star !== undefined) HOO.Panels.showStar(sel.star)`; when a fleet is selected, getSelected().star is null (map.js:259-261 selectFleet nulls selectedStar) so nothing re-renders. showFleet (panels.js:533-605) renders static DOM (ETA at line 544, counts at 561-585), so in-transit position/ETA and post-combat ship counts go stale. fleet.js:41-43 cleanup() removes emptied fleets from g.fleets but the dead object (still reference

### [ui-code] ratioRow leaks two window event listeners on every render
**Location:** `js/ui/ui.js:251` · **Category:** bug

Every HOO.UI.ratioRow() call registers window.addEventListener('mousemove') and window.addEventListener('mouseup') closures (ui.js:251-256) that are never removed when the row's DOM is discarded. The colony panel creates 5 rows and is fully rebuilt by showStar() on every star click, every preset click, every cycleShip, every reloc/transport completion, and every end of turn; the Races screen adds 1 row per contacted empire plus security, the Planets screen 1 (tax), the Tech screen 6 — all rebuilt on each open. A long session accumulates thousands of live mousemove handlers, each retaining detached DOM subtrees and colony/empire objects (including objects from games that were since loaded over — a cross-game memory leak). Handlers early-return on !dragging so behavior stays correct, but memory and per-mousemove CPU grow without bound. Listeners should be bound once at module level or removed on teardown.

*Verified:* js/ui/ui.js:251-256: every ratioRow() call does window.addEventListener('mousemove', ...) and window.addEventListener('mouseup', ...) with closures over the row's bar element and opts (which capture colony/empire objects); no removeEventListener exists anywhere in the file. Row counts verified: colony panel builds 5 rows (panels.js:193-213, labels ship/def/ind/eco/tech) and is fully rebuilt by showStar on every star click/preset (panels.js:227)/cycleShip (panels.js:388)/transport-reloc completio

### [ui-code] requestAnimationFrame render loop multiplies every time a game is rebuilt
**Location:** `js/ui/map.js:265` · **Category:** bug

HOO.Map.init() (called from buildFrame on every new game / load) starts a new rAF loop (map.js:32), and tick()'s termination guard `if (!canvas.parentNode) return` (map.js:265) checks the module-level `canvas` variable, which init() has already rebound to the NEW canvas. So when the player loads a save from the in-game Imperial Archives menu (screens.js:39 → HOO.Main.rebuild), the old loop's pending frame sees the new attached canvas and keeps running: two loops now call draw() every frame, `pulse` advances at double speed (selection ring/animation speed visibly doubles), and every subsequent in-session load adds another loop. Loops only die when the title screen detaches the canvas. Guard should capture its own canvas reference (or a generation counter) per init.

*Verified:* map.js:19-33 init() rebinds the module-level `canvas` (line 20) and starts a new rAF loop (line 32); tick's guard at map.js:264-269 reads that module-level `canvas`, not the canvas the loop was started for. HOO.Main.rebuild (main.js:7-10) → buildFrame → HOO.Map.init(new canvas) runs synchronously, so the old loop's pending frame fires afterward, sees the new attached canvas, and keeps running — both loops call draw() and advance pulse (+0.04 each, map.js:266), doubling the selection-ring animati

### [ui-code] Keyboard shortcuts stay active during tactical combat (CombatUI bypasses overlay registry)
**Location:** `js/main.js:96` · **Category:** bug

The key handler suppresses screen shortcuts only via HOO.UI.hasOverlay() (main.js:96), but CombatUI builds its own .station-overlay and appends it directly to document.body (combatui.js:23,50) without registering in HOO.UI's overlays[] array — an internal inconsistency: two overlay systems for the same concept. During a tactical battle hasOverlay() is false, so 1-6/G open the Design/Fleet/Races/Planets/Tech/Status/Game modals at z-index 40 UNDER the combat screen (z-index 80) where they are invisible and unclickable; Tab/F/H silently change map selection and the sidebar beneath; Escape (main.js:87) closes the hidden modal or clears the map selection. After combat ends the orphaned modals pop into view stacked under the after-action dialog. Shortcuts should be disabled while CombatUI is active (register the combat overlay, or expose a CombatUI.isActive check).

*Verified:* combatui.js:23 creates its own div.station-overlay with inline z-index:80 and appends it directly to document.body (line 50), never touching HOO.UI's overlays[] (ui.js:158-194); HOO.CombatUI exports only {run} (combatui.js:353) — no isActive. The combat prompt dialog closes itself before invoking CombatUI.run (ui.js:207 close(ov) runs before b.fn()), so during battle hasOverlay() is false and main.js:96 does not suppress keys; inGame() (main.js:52) passes since #next-turn-btn still exists. Keys 

### [ui-code] Enemy fleet destination and ETA shown without the required scanner tech
**Location:** `js/ui/panels.js:544` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, Deep Space Scanners: enemy fleet destinations visible only with Improved Space Scanner; destination + ETA with Advanced Space Scanner

showFleet() builds the header before the enemy branch, so for ANY in-transit fleet — including enemy fleets — line 544 prints 'From → To · N yr'. The properly gated line 552 (`if (f.at === null && g.empires[0].derived.scanShowsDest) head.push(kv('Destination', ...))`) then adds a redundant Destination row: two code paths compute the same information, one gated by scanner tech and one not. The map hover tip (js/ui/map.js:233) likewise shows 'in transit (N yr)' ETA for enemy fleets with no scanner check. In MOO 1993, enemy fleet destinations are revealed only with the Improved Space Scanner and ETAs only with the Advanced Space Scanner (the derived.scanShowsDest flag models exactly this, but the UI leaks around it).

*Verifier correction:* Everything claimed is true; additionally the map hover/click hit-test (map.js:72-80) does not filter fleets that fail the visibleToPlayer scanner check used for drawing, so even undrawn enemy fleets can be hovered and inspected — the leak is slightly worse than stated.

*Verified:* panels.js:542-544: the header is built before the enemy branch at line 546, so for any in-transit fleet (enemy included) line 544 pushes 'From → To · N yr' via HOO.Fleet.eta; the enemy branch then renders it (line 553 section('Fleet Scan', head...)). Line 552 is the properly gated redundant Destination row using derived.scanShowsDest, which is set from tech effect.showDest (state.js:152; tech.js: improved_space_scanner and advanced_space_scanner have showDest:true) — no ETA flag is modeled at al

### [ui-code] No confirmation when loading over a running game or overwriting a save slot
**Location:** `js/ui/screens.js:38` · **Category:** ux

In the Imperial Archives menu, the Load button (screens.js:36-41) immediately replaces the running game — all orders, allocation changes, diplomacy, and battles since the last autosave (which happens only at end of turn) are lost with no 'unsaved progress will be lost' prompt. Save (screens.js:28-35) likewise overwrites a non-empty slot without confirmation. By contrast the genuinely destructive acts that ARE guarded (Abandon Game screens.js:47-52, Scrap Class screens.js:348-354, Bombard panels.js:137-155) all confirm — Load/Save are the inconsistent outliers. Title-screen Load/Continue are fine (nothing in progress).

*Verified:* screens.js:36-41: Load onclick immediately does HOO.State.load(slot) + HOO.Main.rebuild() with no prompt; autosave only happens at end of turn (main.js:37), so mid-turn orders/diplomacy since the last autosave are silently lost. screens.js:28-35: Save overwrites any slot with no confirm. Contrast confirmed: Abandon Game confirms via dialog (screens.js:48-52), Scrap Class confirms (screens.js:349-352), Bombard confirms (panels.js:139-155). Title-screen Continue/Load (newgame.js:27-39) indeed have

### [ui-code] Corrupt save JSON bricks the title screen; save failures reported as success
**Location:** `js/game/state.js:370` · **Category:** production

HOO.State.load (state.js:367-375) and saveMeta (state.js:377-380) call JSON.parse with no try/catch and no schema/version check. A corrupt 'hoo_save_auto_meta' value makes showTitle() throw at newgame.js:25 AFTER it has already cleared #app (newgame.js:10-11), leaving a permanently blank page on boot with no recovery short of devtools/localStorage surgery; a corrupt save body makes Continue/Load buttons silently dead. There is also no save format version stamp, so saves from older builds can load into partially-incompatible state and crash later. Separately, HOO.State.save returns false on failure (quota etc.) but the Save button (screens.js:30-34) shows the 'Game saved to slot N' toast unconditionally, and per-turn autosave failures (main.js:37) are silent — a player can play for hours believing they are protected.

*Verified:* state.js:367-375 load() calls JSON.parse(json) with no try/catch and no schema/version check; state.js:377-380 saveMeta() likewise (`return m ? JSON.parse(m) : null`). newgame.js showTitle clears #app at lines 10-11, then calls HOO.State.saveMeta('auto') at line 25 — a corrupt hoo_save_auto_meta throws there, leaving a permanently blank page on boot; a corrupt save body throws inside the Continue/Load onclick handlers (newgame.js:29,38) making them silently dead. save() (state.js:352-365) writes


## LOW

### [ai] Hard-coded scout slot 0: after redesigns, AI 'explores' with warships and never rebuilds scouts
**Location:** `js/game/ai.js:280` · **Category:** bug

manageExpansion uses var scoutSlot = 0 (ai.js:280). scrapWorst (ai.js:168-180) scores designs by count*cost, so the cheap 2-ship Scout design is the first scrapped when slots fill; slot 0 is then reused for a war design. From then on the exploration loop peels up to 2 slot-0 warships per fleet per turn (ai.js:289-294) and sends them to unexplored stars, slowly bleeding combat fleets, and the AI never designs a replacement scout (with reserve tanks) at all.

*Verifier correction:* Mechanism confirmed with one ordering nuance: the very first design scrapped is usually the starter Fighter (slot 2), which has 0 ships for AI empires except on Simple (state.js:337) and thus scores 0; the cheap 2-ship Scout goes on a later scrap. The end state — slot 0 reused for a warship, exploration bleeding combat ships, no scout ever rebuilt — is exactly as described. Cited line is 279, not 280.

*Verified:* var scoutSlot = 0 is at ai.js:279 (loop at 280-295, peeling up to 2 slot-0 ships per fleet at ai.js:289-294). Starter designs put Scout at slot 0 with 2 ships (shipdesign.js:167, state.js:337-338). scrapWorst (ai.js:168-180) scores count*cost among non-colony designs and never protects slot 0; no code anywhere designs a replacement scout. Once slot 0 is scrapped and refilled (freeSlot returns lowest index), the exploration loop peels whatever war/bomber design landed in slot 0.

### [ai] AI reserve only accumulates and is never spent
**Location:** `js/game/ai.js:9` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Planetary Reserve: reserve BC can be pumped into a planet to boost production up to 2x; AI empires use their reserves

AI empires bank BC into emp.reserve from scrapped designs (shipdesign.js:199-208 via ai.js:179), excess industry/eco (colony.js:284, 353-356), Guardian spoils, and tribute — but no AI code path ever sets taxRate or a colony transferFund, the only two mechanisms that spend reserve (colony.js:164-175). Over a long game AI money hoards uselessly while MOO's AI uses its reserve to double a developing colony's output. planTurn (ai.js:9-19) has no reserve-management step.

*Verifier correction:* Two detail corrections: (1) taxRate does not spend reserve — it collects into it (colony.js:164-168); transferFund is the sole productive spend path. (2) The AI reserve is not literally never debited: a player threat can extort tribute from it (diplomacy.js:186-189), and the Guardian yields a tech, not BC (turn.js:295-299). The core claim — the AI never voluntarily/productively spends its reserve — is correct.

*Verified:* Inflows confirmed: scrapDesign salvage (shipdesign.js:208, via ai.js:179), excess industry (colony.js:284), eco surplus (colony.js:353-355), and tribute received (diplomacy.js:144, 189). Grep confirms no AI code sets emp.taxRate (only player UI, screens.js:718-720) or colony.transferFund (only player UI, panels.js:495), and planTurn (ai.js:9-19) has no reserve step. transferFund is the only path that converts reserve into colony output (colony.js:170-175).

### [ai] AI never attacks the Guardian, so only the player can ever take Orion
**Location:** `js/game/ai.js:335` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993: AI empires eventually assault the Guardian and colonize Orion if the player does not

manageWar only selects colonies of empires it is at war with (ai.js:335), manageExpansion excludes Orion while the Guardian lives (ground.js canColonize:13), and no other code sends AI fleets to the Orion system. The Guardian (turn.js:138-143) is therefore exclusively a player challenge; the AI can never claim the Throne of the Ancients, its +25 council sway (council.js:82), or the Guardian's tech spoils, removing a late-game race the original had.

*Verifier correction:* Two nuances: (1) 'no other code sends AI fleets to the Orion system' is slightly overstated — the exploration loop (ai.js:280-295) will send AI scouts to Orion once (it is just an unexplored star), where the unarmed stacks auto-retreat from the Guardian (combat.js:561-563); they never threaten it. (2) If the player kills the Guardian but leaves Orion vacant, canColonize then passes for AI empires, so an AI could still colonize Orion afterward. What is strictly true: the Guardian can only ever be destroyed by the player, and the Orion race the original had does not exist for AI empires.

*Verified:* manageWar targets only colonies of at-war empires (ai.js:335-340); canColonize rejects Orion while the Guardian lives (ground.js:11, not :13); the Guardian intercepts every fleet at Orion (turn.js:138-143); the Orion-holder council sway is at council.js:82 (+25) as cited. No AI code deliberately assaults the Guardian, so it can only die to the player.

### [ai] manageColonies reads wantColonyShip one turn stale (set later in planTurn)
**Location:** `js/game/ai.js:186` · **Category:** bug

planTurn runs manageColonies (ai.js:13) before manageExpansion (ai.js:14), but emp.wantColonyShip is assigned inside manageExpansion (ai.js:246). manageColonies at ai.js:186/214 therefore always acts on last turn's value: on the turn the last colonization target disappears, the biggest AI colony still diverts 40% of spending to a colony ship (compounding the >100% allocation bug), and on the turn a new target appears the AI waits a year before building. Reordering the two calls fixes it.

*Verified:* planTurn (ai.js:9-19) calls manageColonies (ai.js:13) before manageExpansion (ai.js:14). manageColonies snapshots emp.wantColonyShip at ai.js:186 and uses it at ai.js:214 to divert ship spend (compounding the 130% bug via a.ship=max(a.ship,40) at ai.js:216), but emp.wantColonyShip is only assigned inside manageExpansion at ai.js:246. So allocations always act on the previous turn's targets: one wasted turn of 40% colony-ship spend after the last target vanishes, and one turn of delay when a new 

### [combat] Transport interception gaps: unopposed reinforcement and interdictor ignored
**Location:** `js/game/ground.js:126` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993: transports are fired upon by enemy ships/bases in orbit at the destination regardless of who owns the planet; the Sub Space Interdictor prevents enemy Combat Transporters from beaming troops past defenses

resolveLanding's own-colony reinforcement branch (lines 126-141) returns before the defensive-fire gauntlet, so friendly transports land untouched even with a hostile fleet in orbit. Separately, the Combat Transporters halving at line 168 never checks the defender's derived.hasInterdictor, although tech.js line 432 explicitly says the interdictor prevents 'enemy teleporters and combat transporters' — the teleporter half is enforced in combat.js but the transporter half is not.

*Verified:* resolveLanding's own-colony branch (ground.js:125-141) returns before the defensive-fire gauntlet (which starts at line 149), so friendly reinforcement transports never face hostile orbiting fleets — in MOO 1993 enemy ships in orbit fire on incoming transports regardless of destination ownership. Second part: line 168 `if (emp.derived.hasCombatTransporters) lossFrac *= 0.5;` with no check of the defender's derived.hasInterdictor; tech.js:432 says the interdictor prevents 'enemy teleporters and c

### [combat] Missile rack size option (2-shot vs 5-shot) missing
**Location:** `js/data/tech.js:458` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 Ship Design: every missile can be mounted as a 2-shot rack or a heavier 5-shot rack

All missile techs hard-code shots:5 and shipdesign.js offers no rack choice, so the 2-rack (lighter, cheaper, fewer salvos) design tradeoff from the original is absent. combat.js line 29 falls back to (t.effect.shots || 5) — always 5.

*Verified:* Every missile tech in tech.js hard-codes shots:5 (lines 458, 464, 476, 488, 497, 512, 542, 548, 563, 569, 578); grep finds no shots:2 anywhere. shipdesign.js weapon specs are just {id, count} with no rack variant, and combat.js:29 falls back to `(t.effect.shots || 5)`. MOO 1993 offered each missile in a 2-rack and a 5-rack version as a size/cost tradeoff; that choice is absent.

### [combat] Scatter Pack missiles split into 3 warheads instead of 5/7/10
**Location:** `js/data/tech.js:488` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 weapons: Scatter Pack V splits into 5 warheads, Scatter Pack VII into 7, Scatter Pack X into 10

scatter_pack_v (line 488), scatter_pack_vii (line 542) and scatter_pack_x (line 569) all use autofire:3, which combat.js uses as the warhead multiplier when launching (line 306). All three tiers deliver 3 warheads per rack instead of their namesake counts, undervaluing the higher packs (X delivers 30% of its original volume).

*Verified:* scatter_pack_v (tech.js:488), scatter_pack_vii (tech.js:542), and scatter_pack_x (tech.js:569) all carry autofire:3, and combat.js:305 uses autofire as the launch multiplier (`launches = s.count * w.count * (e.autofire ? e.autofire : 1)`). MOO 1993 scatter packs split into 5, 7, and 10 warheads respectively, so all three tiers under-deliver and Scatter Pack X gets 30% of its original volume, as claimed.

### [combat] Battle Scanner grants +3 initiative +1 attack; data says +1 initiative
**Location:** `js/game/shipdesign.js:137` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 tech appendix: the Battle Scanner reveals enemy ship specs and adds +3 to initiative (no attack bonus)

compute() applies initiative += 3; attack += 1 for battleScanner, while tech.js line 45 and SPECIAL_STATS line 612 both describe '+1 to initiative'. The +3 matches MOO (the descriptions are wrong), but the +1 attack is invented and appears nowhere in the data or the original rules. Note the spec-viewer/design screen shows players the wrong numbers relative to what combat actually uses.

*Verified:* shipdesign.js:136-137: `if (hasScanner) { initiative += 3; attack += 1; }`. tech.js:45 (battle_scanner desc) and SPECIAL_STATS battleScanner (tech.js:612) both say '+1 initiative' and mention no attack bonus. MOO 1993's Battle Scanner grants +3 initiative and no attack bonus, so the reviewer's characterization is exactly right: the +3 matches MOO (descriptions understate it), the +1 attack is invented, and the displayed data disagrees with combat behavior.

### [combat] Disruptor's advertised 'no range penalty' is not implemented
**Location:** `js/game/combat.js:342` · **Category:** bug

tech.js line 573 sells the Disruptor as 'inflicting 10-40 damage at range 2 with no range penalty' (matching MOO's disruptor, which suffers no dissipation at range), but fireWeapon applies the extended-range defense penalty (defense += d-1) to every wclass 'heavy' weapon with no per-weapon exemption flag, so disruptors are penalized like any other heavy mount.

*Verified:* Disruptor is wclass 'heavy' (tech.js:572) with desc at tech.js:573 promising 'no range penalty' (matching MOO 1993, where disruptor bolts do not attenuate with distance). combat.js:342-343 applies `defense += (d - 1)` to every heavy-mount/extended-range weapon with no exemption; no per-weapon flag (e.g., noRangePenalty) exists anywhere in the tech effect schema, so disruptors are penalized identically to other heavy weapons.

### [combat] Two independent bombardment implementations disagree
**Location:** `js/game/ground.js:61` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 uses one bombardment resolution (per-weapon to-hit and damage vs planetary shield; ~200 damage per population point, 50 per factory)

Strategic bombardment (ground.js lines 47-79) computes expected-value damage with ad-hoc scalars (missiles at 0.6*dmax with unlimited racks every year, torpedoes at 0.5*dmax*0.5, bases destroyed at BASE_HITS + shield*4 with a hard Math.floor so damage below 50+4*shield per base kills nothing) while tactical combat (combat.js bomb branch) rolls per-shot to-hit with shield-per-hit subtraction. The same fleet bombing the same colony produces very different results depending on whether it fires during combat or from the orbit menu — an internal inconsistency the original did not have.

*Verified:* ground.js bombard (47-79) is expected-value math with the exact cited scalars: missiles at 0.6 * (dmax - shield) every year with no ammo tracking (line 62, comment 'limited racks'), torpedoes at (dmax*0.5 - shield)*0.5 (line 63), and bases lost = Math.floor(baseDmg / (BASE_HITS + shield*4)) (line 74; BASE_HITS=50 per state.js:57), so sub-threshold damage kills zero bases. Tactical combat's bomb branch (combat.js:320-337) instead rolls per-shot to-hit with per-hit shield subtraction (and is itsel

### [diplo-esp-council] Sabotage damage scaled by weapons tech level instead of MOO's flat 1-5 / 1-2 rolls
**Location:** `js/game/espionage.js:140` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual p.44: successful sabotage destroys 1-5 factories or 1-2 missile bases

Factory sabotage computes `lost += U.rint(1, 5) * Math.max(1, Math.floor(wLv / 10))` per infiltrator, multiplying MOO's 1-5 factory roll by a weapons-tech factor (x2 at weapons 20, x3 at 30...). The missile-base branch (line 118) uses a convoluted probability `0.5 * Math.max(1, wLv/10) / Math.max(1, Math.ceil(wLv/10))` that oscillates non-monotonically between 0.375 and 0.5 as tech rises, then multiplies destroyed count by floor(wLv/10). MOO 1993 sabotage destroys a flat 1-5 factories or 1-2 missile bases per successful mission regardless of weapons technology.

*Verifier correction:* Factory branch exactly as described: line 140 `lost += U.rint(1, 5) * Math.max(1, Math.floor(wLv / 10))` per infiltrator (x2 at weapons 20, x3 at 30). Missile-base branch confirmed at line 118 with the destroyed count multiplied by Math.floor(Math.max(1, wLv/10)) at line 120. One numeric correction: the per-infiltrator probability `0.5 * Math.max(1, wLv/10) / Math.max(1, Math.ceil(wLv/10))` oscillates non-monotonically between roughly 0.275 and 0.5 (e.g. 0.275 at wLv=11, 0.5 at wLv=10/20/30, 0.35 at wLv=21), not 0.375-0.5 as stated; the lower bound rises toward 0.5 only at high tech. The non-monotonicity claim itself is correct.

*Verified:* Read espionage.js:115-148. Computed the chance() argument for wLv 1-31: 0.5 for wLv<=10, 0.275-0.475 for 11-19, 0.5 at 20, 0.35-0.483 for 21-29, 0.5 at 30 — sawtooth, non-monotonic. MOO 1993 sabotage destroys a flat small number of factories (1-5) or missile bases (1-2) per success with no weapons-tech multiplier, so the fidelity deviation stands.

### [diplo-esp-council] derived.securityBase is computed but never used — espionage rolls its own security formula
**Location:** `js/game/state.js:214` · **Category:** production

recomputeEmpire sets `d.securityBase = techLevel(emp, 'computers')` with the comment 'security base = computer tech level (as %)', but no code reads securityBase (grep confirms). espionage.js:37 independently builds security from `securityAlloc * 2 + race.securityBonus` plus an inline tech-level differential. Two code paths purporting to define empire security disagree, and the derived stat is dead weight that will silently diverge from actual espionage behavior if either side changes.

*Verified:* state.js:213-214: comment 'security base = computer tech level (as %)' and `d.securityBase = techLevel(emp, 'computers')`. Grep across all of js/ finds exactly one occurrence — the write; nothing ever reads d.securityBase. espionage.js:37 independently computes secBonus = (defender.securityAlloc || 0) * 2 + (race.securityBonus || 0) and folds computer tech in separately as an inline Math.max(0, defLv - attLv) differential (line 54). Dead derived stat and duplicated security definition confirmed;

### [diplo-esp-council] Player-candidate's council votes are auto-cast for themselves; cannot abstain or vote for the rival
**Location:** `js/game/council.js:55` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Winning the Game: at each council meeting every empire, including the two candidates, casts its votes for either candidate or abstains

holdElection assigns candidates their own id as choice (`if (emp.id === cand[0].id) choice = cand[0].id`) before the isPlayer branch, and immediately adds their votes to totals (line 65). The council UI (js/ui/notices.js:259) then only offers 'Hear the Votes' when the player is a candidate. In MOO 1993 a player who is a council candidate still chooses freely — vote for self, for the opponent, or abstain — which matters when trying to block the rival from reaching two-thirds without electing yourself.

*Verified:* council.js:55-57: `if (emp.id === cand[0].id) choice = cand[0].id; else if (emp.id === cand[1].id) choice = cand[1].id; else if (emp.isPlayer) choice = 'PLAYER_CHOICE';` — the candidate checks precede the isPlayer check, so a player-candidate gets their own id and line 65 immediately adds their votes to their own total. In the UI (notices.js:248) needChoice is false because votes[0].choice !== 'PLAYER_CHOICE', so the player-candidate only sees 'Hear the Votes' (notices.js:258-261) calling finali

### [diplo-esp-council] AI-vs-AI war declarations generate no news; player only learns of foreign wars via spy reports
**Location:** `js/game/diplomacy.js:39` · **Category:** ux
**MOO 1993 rule:** MOO 1993: GNN news events announce wars and treaties between rival empires

declareWar pushes a 'war' notice only when `who.isPlayer || on.isPlayer`. Wars (and peaces — makePeace emits nothing at all) between two AI empires are silent, even for empires the player has contacted. The only way to discover third-party wars is the per-empire intelligence Report screen (js/ui/screens.js:655). MOO 1993's GNN broadcasts war declarations and peace treaties between AI empires to the player, which is important strategic information for council votes and alliance choices.

*Verified:* diplomacy.js:39-42: the 'war' notice is pushed only when `who.isPlayer || on.isPlayer`. makePeace (lines 45-51) pushes no notice for anyone, including the player's own peaces via AI acceptance (ai.js:416). Grep shows no other code emitting war/peace news for third parties. The only visibility into AI-AI wars is the per-empire intelligence Report screen (screens.js:651-657, `if (r.war) lines.push('At war with the ...')` at line 655 — matching the cited line). MOO 1993's GNN broadcasts war declara

### [economy] Rebalance rounding can drive a 0% bar to -1%, leaving positive bars summing to 101%
**Location:** `js/ui/ui.js:302` · **Category:** bug

After proportional redistribution, each key is Math.round()ed and the residual diff is corrected by ±1 on freeKeys in order. When the rounding excess is negative and the first free key already rounded to 0 (e.g. free shares 0.2/18.3/17.2/16.3 rounding to 0/18/17/16 against a remaining 52), that key is set to -1. The engine's `if (shipBC > 0)` guards skip the negative share, so the remaining positive bars total 101% and the colony spends ~1% more BC than it has; the alert bar and in-bar readouts also display the negative value oddly.

*Verifier correction:* Mechanism is real but the reviewer's example is inverted: 0.2/18.3/17.2/16.3 rounds to 0/18/17/16 = 51 against 52, giving diff = +1 (which harmlessly bumps the 0 bar to 1). The -1 case needs net round-UP of the free shares with the first free key rounding to 0, e.g. 0.3/17.6/17.6/16.5 → 0/18/18/17. Also note: if the -1 lands on eco while waste > 0, the eco block runs anyway (`ecoBC > 0 || p.waste > 0`, colony.js:293) and the negative cleanSpend slightly increases waste.

*Verified:* js/ui/ui.js:297-305: every key is Math.round()ed, then `diff = 100 - sum` is corrected by ±1 starting at freeKeys[0] with no floor check (`alloc[k2] += diff > 0 ? 1 : -1;` at line 303). When the free shares collectively round up (e.g. 0.3/17.6/17.6/16.5 against remaining 52 rounds to 0/18/18/17 = 53, diff = -1), freeKeys[0] goes 0 → -1 while the others keep the excess, so positive bars sum to 101. The engine's `if (shipBC > 0)` / `if (defBC > 0)` / `if (indBC > 0)` guards (colony.js:197/224/262)

### [economy] Colony panel 'Production' header ignores the reserve tax that every bar note deducts
**Location:** `js/ui/panels.js:167` · **Category:** ux

showOwnColony displays `spend = raw * ratio` while all the per-bar forecasts use HOO.Colony.spendEstimate, which additionally subtracts emp.taxRate (js/game/colony.js:396). With a nonzero tax the headline BC disagrees with the sum implied by the bar notes — a leftover bypass of the 'single source of truth' the eco overhaul introduced.

*Verified:* js/ui/panels.js:167 computes `var spend = raw * (emp.economy ? emp.economy.ratio : 1);` and line 175 renders it as the 'Production' header. All bar notes go through colonySpend → HOO.Colony.spendEstimate (panels.js:298-300, shipNote line 305 etc.), and spendEstimate subtracts the reserve tax at colony.js:396 (`if (emp.taxRate > 0) spend -= spend * emp.taxRate / 100;`). With nonzero taxRate the headline BC exceeds what the bar notes are computed from, bypassing the 'single source of truth' the ov

### [economy] ecoMinPct/spendEstimate exclude reserve transfer funds that processColony spends, overstating the enforced eco minimum
**Location:** `js/game/colony.js:394` · **Category:** bug

processColony adds c.transferFund into the colony's spend (lines 170-175) before applying the eco auto-raise, but the shared spendEstimate/ecoMinPct pair (lines 392-413) omits it. For a reserve-funded colony the displayed and auto-enforced clean minimum percentage is computed against a smaller denominator than the BC actually spent, so eco is raised higher than needed and the excess drains into terraform/pop/reserve instead of the categories the player set. Conservative direction (planet stays clean), but it contradicts the overhaul's stated guarantee that the shown minimum is exactly what the engine enforces.

*Verifier correction:* One nuance: the overhaul's literal guarantee (displayed minimum == enforced minimum, commit 6398561) still technically holds — both use the same ecoMinPct. What breaks is that for reserve-funded colonies that shared minimum is overstated relative to the BC actually spent (up to ~2x, since transfers are capped at raw production/year), so eco over-cleans and siphons from the player's chosen categories.

*Verified:* processColony adds transfer money into spend at colony.js:170-175 (`use = Math.min(c.transferFund, raw); ... spend += use;`) before the eco auto-raise at 183-186, but spendEstimate (colony.js:392-398) mirrors only ratio/aiBonus/tax and omits transferFund; ecoMinPct (402-413) divides the clean cost by that smaller spend. So needPct applied to the larger actual spend yields ecoBC > clean cost: raiseEco (368-383) takes more than necessary from ship/def/ind/tech and the surplus falls through the eco

### [events-ground] Killing the monster aborts the rest of the yearly event progression (early return)
**Location:** `js/game/events_run.js:179` · **Category:** bug

In progress(), when defenders slay the monster, the code does `g.monster = null; return notices;` — returning from the whole function. The subsequent loop that advances plague cures and supernova countdowns (lines 200-229) is skipped for that year for every colony in the galaxy: cure research is not accrued and novaYears is not decremented. A one-year hiccup, but a genuine control-flow bug; the block should `break`/fall through, not return.

*Verified:* events_run.js:176-179: when m.hits <= 0, the code pushes the notice, sets g.monster = null, and executes 'return notices;' at line 179, exiting progress() entirely. The plague/nova progression loop at events_run.js:201-229 (plagueProgress accrual, 4% plague drain, novaProgress accrual, novaYears--) is therefore skipped for every colony in the galaxy that year. Genuine control-flow bug; the code should fall through to the loop instead of returning.

### [events-ground] Empire elimination and player game-over are not checked when events destroy the last colony
**Location:** `js/game/events_run.js:135` · **Category:** bug

Comet impact (line 133-137), monster devouring (line 182-185), and supernova failure (line 226) null star.planet.colony without calling HOO.Turn.eliminateEmpire. The only elimination check runs in the population-growth phase of the NEXT turn (turn.js:102), so an empire whose last colony is destroyed by an event survives one full turn with zero colonies (AI plans, economy runs, fleets act); if it is the player's last colony, the defeat screen is delayed a turn. Contrast with ground.js:190 which checks elimination immediately after invasion.

*Verified:* events_run.js nulls star.planet.colony at line 134 (comet impact, notice at 135), line 183 (monster devour), and line 226 (supernova with pop < 1) — grep confirms no eliminateEmpire call anywhere in events_run.js. The only elimination check is turn.js:102, which runs in phase 3 (population growth) of the NEXT turn, after that turn's AI planning (phase 1) and economy (phase 2); events run in phase 9 (turn.js:233-234). So a zero-colony empire survives a full turn and a player defeat screen is dela

### [events-ground] New comet/pirates/monster events silently overwrite an active one
**Location:** `js/game/events_run.js:46` · **Category:** bug

g.comet, g.pirates, and g.monster are single global slots. If the weighted pick fires 'comet' while a comet is already inbound (eta up to 8 years vs. cooldown as low as 6), the first comet vanishes without impact or notice; same for piracy and monster. No guard like the ones on mineral_rich/mineral_poor exists for these three cases.

*Verified:* g.comet, g.pirates, g.monster are single global slots assigned unconditionally at events_run.js:46, 82, and 90-94 with no in-progress guard, unlike the mineral_rich/mineral_poor guards at lines 72-79. The minimum re-fire gap is 6 years (g.eventCooldown = U.rint(6,14) at line 24) while a comet's eta is up to 8 years (line 46), and pirates/monster persist indefinitely (pirates until strength <= 0, monster wanders with an 80% continue chance at line 188), so a re-fired event of the same type replac

### [events-ground] Industrial Accident can REDUCE waste; sets it to a fixed 60% of size instead of adding
**Location:** `js/game/events_run.js:70` · **Category:** bug
**MOO 1993 rule:** MOO 1993 manual p.50: Industrial Accident floods the planet with additional waste that must be cleaned up.

`p.waste = Math.min(p.size * 0.75, p.size * 0.6)` always evaluates to exactly p.size * 0.6 (the min is constant-foldable), overwriting rather than adding to existing waste — a planet already above 60% waste is cleaned by the 'accident'. The MOO 1993 industrial accident added a large amount of waste to whatever was there (up to the cap). Also note waste-immune races (ecoMinPct returns 0, colony.js:407) will never auto-clean this event waste, permanently reducing that planet's max pop for AI empires.

*Verifier correction:* Two sub-claims need correction: (a) MOO1's accident also SETS waste rather than adding (1oom: waste assigned on the scale of the planet's max pop minus 10), so the deviation is the clone's value being mild and able to reduce waste, not set-vs-add per se; (b) the waste-immune claim is wrong: ai.js:198 gives wasteImmune AI races a fixed eco allocation of 4, and the cleanup code at colony.js:293-299 spends eco BC on waste regardless of race, so accident waste on a Silicoid AI planet is cleaned over a few years. Only the ecoMinPct-driven auto-raise (colony.js:407 returns 0) ignores it.

*Verified:* events_run.js:70: p.waste = Math.min(p.size*0.75, p.size*0.6) — both operands are constants of p.size, so it always assigns exactly 0.6*size, overwriting existing waste. Since processColony caps waste at 0.75*size (colony.js:291), a planet between 60% and 75% waste is genuinely cleaned by the 'accident'. MOO1's accident (1oom game_event.c) assigns a devastating near-max waste value, never an improvement.

### [events-ground] Diplomatic Blunder GNN text blames the wrong race
**Location:** `js/game/events_run.js:60` · **Category:** bug

The event applies the -30 relations penalty to o2's opinion of emp (emp is the blundering empire, correct), but then sets ctx.race = o2's race name. The template (data/events.js:29) reads 'An ambassador of the {race} has caused a catastrophic insult at a foreign court', so the GNN report names the offended empire as the one whose ambassador blundered. ctx.race should stay as the picked empire (emp); only the penalized relation involves o2.

*Verified:* events_run.js:55-62: HOO.Diplomacy.adjust(g, o2.id, emp.id, -30, true) — adjust(g, whoId, aboutId, ...) per diplomacy.js:9 lowers o2's opinion OF emp, making emp the offender — but line 60 then overwrites ctx.race with o2's race name. The template (data/events.js:29) reads 'An ambassador of the {race} has caused a catastrophic insult at a foreign court', so the GNN report names the offended empire (o2) as the blunderer. ctx.race should remain emp's race name (set at events_run.js:32-33).

### [events-ground] Computer Virus destroys only 80% of accumulated research instead of all of it
**Location:** `js/game/events_run.js:52` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual p.50: the computer virus destroys all research accumulated in one randomly selected technology field.

`pr.invested *= 0.2` retains 20% of the invested RP in the randomly chosen field, and the GNN text ('Years of accumulated work in one field are gone') claims total loss. In MOO 1993 the virus event wiped out all research points accumulated toward the current project in the affected field.

*Verified:* events_run.js:49-53: pr.invested *= 0.2 retains 20% of the invested RP in the randomly picked field, while the GNN text (data/events.js:25) claims the work 'is gone'. MOO 1993 wiped the field entirely: the 1oom recreation's virus event sets the affected field's tech investment to 0 (game_event.c: e->tech.investment[virus_field] = 0).

### [events-ground] Conquering a colony instantly erases plague, quarantine, supernova threat, and rebellion state
**Location:** `js/game/ground.js:181` · **Category:** bug

Successful invasion replaces the colony object wholesale via HOO.Colony.create (ground.js:181), which has no plague/plagueNeed/novaThreat/novaYears fields — so invading a plague-quarantined colony cures the plague for free and cancels a pending supernova on that star (the threat is stored on the colony, not the star/planet). An empire can therefore dodge a supernova countdown by letting the colony be captured. The nova threatens the star, so it should persist across ownership changes.

*Verified:* ground.js:181 replaces the colony wholesale with HOO.Colony.create(t.empire, star, ...). create() (colony.js:12-26) contains quarantine: false and inRebellion: false, and has no plague/plagueNeed/plagueProgress/novaThreat/novaNeed/novaProgress/novaYears fields (those are created ad hoc at events_run.js:83 and :97 on the OLD colony object). The progress() loop reads these from s.planet.colony (events_run.js:205, 214), so after capture the plague is cured and the nova countdown vanishes even thoug

### [events-ground] Dead colony fields novaResearch/plagueResearch vs. runtime plagueProgress/novaProgress
**Location:** `js/game/colony.js:23` · **Category:** bug

Colony.create initializes `novaResearch: 0, plagueResearch: 0`, but the event runtime reads/writes plagueProgress/plagueNeed/novaProgress/novaNeed/novaYears created ad hoc in events_run.js:83 and :97 (grep confirms novaResearch/plagueResearch are referenced nowhere else). Rename leftovers; the real event-progress fields are undocumented in the colony schema and only exist after an event fires.

*Verified:* colony.js:23 initializes novaResearch: 0, plagueResearch: 0; grep across js/ confirms these two names appear nowhere else in the codebase. The event runtime instead reads/writes plagueProgress/plagueNeed (events_run.js:83, 206-209) and novaProgress/novaNeed/novaYears (events_run.js:97, 215-221), all created ad hoc when the event fires. Rename leftovers exactly as described.

### [fleet-galaxy] 'gaia' planet special is unreachable dead code; fertile/gaia are not MOO 1993 specials
**Location:** `js/game/galaxy.js:60` · **Category:** bug
**MOO 1993 rule:** MOO 1993 planet specials are only Poor, Ultra-Poor, Rich, Ultra-Rich, Artifacts (and Orion); Fertile/Gaia are MOO2 concepts

In rollPlanet's else-if chain, 'else if (!hostile && s > 0.93) special = fertile;' precedes 'else if (!hostile && s > 0.985) special = gaia;'. Any s > 0.985 also satisfies s > 0.93, so the gaia branch can never execute — no gaia world is ever generated even though HOO.CONST.SPECIALS defines it (state.js:49) and the AI scores growth specials (ai.js:275). Separately, both fertile and gaia are additions not present in the 1993 game the project claims to reproduce.

*Verified:* galaxy.js:59-60: 'else if (!hostile && s > 0.93) special = "fertile"; else if (!hostile && s > 0.985) special = "gaia";' — any s satisfying the gaia condition already satisfied the fertile condition (and if hostile, both fail), so the gaia branch is unreachable in the else-if chain. state.js:41-51 defines gaia in SPECIALS ('gaia: { ..., growth: 2 }') and ai.js:274-275 scores growth specials ('sp.growth > 1 ? 20 : 0'). Fertile and Gaia are Master of Orion II concepts; MOO 1993's specials were Art

### [fleet-galaxy] Fuel-cell ladder tops out at 9 parsecs and drops a rung; MOO reaches 10 before unlimited
**Location:** `js/data/tech.js:416` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 propulsion: Hydrogen 4, Deuterium 5, Irridium 6, Dotomite Crystals 7, Uridium 8, Reajax II 9, Trilithium Crystals 10, Thorium unlimited

The implemented range ladder is 4/5/6/7/8/9 then Thorium (range:99): Dotomite Crystals is missing entirely and Uridium (7 vs 8), Reajax II (8 vs 9) and Trilithium Crystals (9 vs 10) are each one parsec short of their MOO values, so the maximum finite fuel range is 9 instead of 10. The prompt-level movement rules in fleet.js consume derived.range correctly; the deviation is purely in this tech table.

*Verified:* tech.js range techs: hydrogen_fuel_cells range 4 (line 368), deuterium 5 (374), irridium 6 (380), uridium 7 (391-392), reajax_ii 8 (400-401), trilithium_crystals 9 (415-416), thorium_cells 99 (421-422). Dotomite Crystals is absent from the propulsion list entirely. MOO 1993's ladder is 4/5/6 (Hydrogen/Deuterium/Irridium), Dotomite 7, Uridium 8, Reajax II 9, Trilithium 10, Thorium unlimited — so Uridium/Reajax/Trilithium are each one parsec short and max finite range is 9 not 10. Movement code co

### [fleet-galaxy] Blue and white stars roll planet types uniformly, unlike MOO's per-color tables
**Location:** `js/game/galaxy.js:42` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 star-color planet tables: blue and white stars host predominantly hostile/lifeless worlds; benign Terran-class planets there are rare

rollPlanet has bespoke distributions for yellow, red, green and purple stars but falls through to 'U.pick(types)' — a uniform draw over all 13 planet classes — for blue and white stars (galaxy.js:41-43), making a size-100 Terran exactly as likely as a Radiated rock at those stars (~7.7% each after the no-planet roll). In the original, blue/white stars were the risk/reward frontier (mostly hostile, but disproportionately mineral-rich); here they are on average friendlier than red stars, inverting the intended exploration incentive structure.

*Verifier correction:* The core claim (uniform draw, no MOO-style hostile-but-rich skew, Terran as likely as Radiated) is correct. The secondary claim that blue/white are 'on average friendlier than red stars' is overstated: uniform over 13 types gives ~46% hostile planets vs ~24% for red's table (red never rolls Inferno/Toxic/Radiated), though blue/white do yield slightly more top-tier worlds (3/13 ≈ 23% vs 20%) and more no-planet rolls (25/30% vs 20%). The inversion is that blue/white lost their mineral-rich compensation, not that they became friendlier than red.

*Verified:* rollPlanet (galaxy.js:28-43) has bespoke branches for yellow, red, green, purple; blue and white fall to the final 'else { t = U.pick(types); }' (line 42), a uniform draw over all 13 PLANET_TYPES (state.js:26-40), so given a planet exists, Terran = Radiated ≈ 1/13 ≈ 7.7%. In MOO 1993 blue/white stars skewed heavily hostile but disproportionately mineral-rich; here there is no such skew (rich chance at line 52 depends only on planet hostility/nebula/purple, not blue/white).

### [fleet-galaxy] Orion is placed at the exact galaxy center every game
**Location:** `js/game/galaxy.js:97` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993: Orion appears at a random location in the general vicinity of the galaxy's middle, not a fixed point

generate() pushes Orion at exactly (conf.w/2, conf.h/2) before random star placement, so in every game on every size the Throne of the Ancients is at the mathematically exact center. Combined with the homeworld scoring term that pushes homes away from the center (galaxy.js:148), players can always locate Orion without exploring, removing the discovery element the original preserved.

*Verified:* galaxy.js:97: 'stars.push({ x: conf.w / 2, y: conf.h / 2, orion: true });' before the random placement loop — deterministic exact centre on every size. The homeworld loop's scoring term 'dmin = Math.min(dmin, U.dist(s.x, s.y, conf.w / 2, conf.h / 2) * 1.2)' (galaxy.js:148) further advertises the centre as Orion-adjacent. In MOO 1993 Orion's position varied game to game, so always-exact-centre does remove the locate-Orion discovery element.

### [fleet-galaxy] First homeworld is picked uniformly at random, skipping the spacing/Orion-avoidance rules the others get
**Location:** `js/game/galaxy.js:140` · **Category:** bug
**MOO 1993 rule:** MOO 1993: race homeworlds are mutually spaced and not seeded next to Orion/the Guardian

homes[0] = U.pick(candidates) can land anywhere — including 1.8 parsecs from Orion, since only subsequent homeworlds apply the farthest-point criterion with the 1.2x Orion-distance penalty (galaxy.js:143-149). Because empires are assigned to homes in index order and the player is empire 0, it is specifically the PLAYER who can start adjacent to the Guardian while every AI gets the spacing guarantee — an internal inconsistency between the first pick and the rest of the loop.

*Verified:* galaxy.js:140: 'homes.push(U.pick(candidates));' — candidates only exclude Orion itself (line 136), so the first home can be any star, as close as the global star min-separation of PARSEC * 1.8 (line 93) = 1.8 parsecs from Orion. Only subsequent picks (lines 141-152) apply farthest-point selection with the 1.2x Orion-distance penalty (line 148). Empires are assigned homes in index order ('g.empires.forEach(function (emp, i) { var hs = homes[i]; ... })', line 154-155) and the player is empire 0 t

### [fleet-galaxy] Fleet 'retreating' flag is write-only; retreating fleets can be freely redirected
**Location:** `js/game/fleet.js:106` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Retreating: ships that retreat must complete their jump to the friendly colony and cannot be given new orders mid-retreat

Fleets created by combat retreat carry retreating: true (combat.js:666) and normal fleets carry retreating: false (fleet.js:15, 106), but no code ever reads the flag. With Hyperspace Communications the player can select a fleet that just fled a battle and redirect it anywhere in range — including straight back to the battle it retreated from (panels.js:617-624 performs no retreating check) — nullifying the tactical cost of retreat that the original enforced.

*Verifier correction:* The code claim is fully verified: the flag is dead state and redirect is unrestricted. The MOO-fidelity framing is softer: MOO 1993 locked retreaters onto the nearest-friendly-colony route, but whether Hyperspace Communications could re-order such a fleet mid-flight in the original is not definitively documented; the write-only flag nonetheless shows an intended-but-unimplemented restriction.

*Verified:* Grep across js/ finds 'retreating' only at write sites: fleet.js:15 and fleet.js:106 (false) and combat.js:666 (true); no code ever reads it. The hypercomm redirect path directDeploy() (panels.js:616-626) checks only f.at === null and inRange — no retreating check — so a fleet that just fled a battle can be re-aimed anywhere in range, including back at the battle star.

### [moo-checklist] Guardian arsenal contains nonexistent tech id 'scatter_pack_x_missiles'
**Location:** `js/game/turn.js:253` · **Category:** bug
**MOO 1993 rule:** MOO 1993: the Guardian of Orion is armed with multiple Stellar Converters, Plasma Torpedoes and Scatter Pack X racks — the toughest single opponent in the game.

The Guardian's weaponIds array is ['stellar_converter', 'plasma_torpedoes', 'scatter_pack_x_missiles', 'scatter_pack_x']. 'scatter_pack_x_missiles' is not in HOO.DATA.techById (the real id is 'scatter_pack_x', already listed), so monsterStack() filters it out and the Guardian fights with 3 weapon groups instead of the intended 4 — silently weaker than designed. No crash (filter(Boolean) guards it), but the dead id indicates an intended fourth weapon (MOO1's Guardian also fired Death Ray-class beams) that never fires.

*Verified:* js/game/turn.js:253 — weaponIds: ['stellar_converter', 'plasma_torpedoes', 'scatter_pack_x_missiles', 'scatter_pack_x']. tech.js defines only scatter_pack_v (line 487), scatter_pack_vii (line 541), and scatter_pack_x (line 568); 'scatter_pack_x_missiles' matches nothing in techById. monsterStack() (js/game/combat.js:77-81) maps ids through techById and .filter(Boolean) drops the null, so the Guardian fights with 3 weapon groups instead of 4 with no crash and no warning.

### [moo-checklist] Top-tier waste techs missing: Industrial Waste Elimination and Complete Eco Restoration
**Location:** `js/data/tech.js:186` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 tech appendix — Construction: 'Industrial Waste Elimination' (factories produce no waste); Planetology: 'Complete Eco Restoration' (highest waste-cleanup ratio).

The Construction tree ends with Reduced Industrial Waste 20% (line 169) and Improved Industrial Tech 2; MOO1's Construction tree also contains Industrial Waste Elimination, which removes factory waste entirely. Similarly the Planetology eco ladder (Improved 5/BC, Enhanced 10/BC, Advanced 20/BC) omits MOO1's top tier, Complete Eco Restoration. Late-game empires here can never fully escape the eco tax the way MOO1 endgame empires could.

*Verified:* js/data/tech.js — the Construction waste ladder is reduced_waste_80/60/40/20 (lines 124, 142, 157, 169) and the tree tops out with industrial_tech_2 at line 184; no Industrial Waste Elimination entry exists. The Planetology eco ladder is improved_eco_restoration (5/BC, line 274), enhanced_eco_restoration (10/BC, line 298), advanced_eco_restoration (line 325) and stops there; no complete_eco_restoration. MOO 1993's Construction tree includes Industrial Waste Elimination (zero factory waste) and i

### [moo-checklist] Missing MOO1 propulsion special: Displacement Device
**Location:** `js/data/tech.js:441` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 tech appendix — Propulsion: Displacement Device (special): 1/3 of all attacks against the ship automatically miss, regardless of attacker skill.

The propulsion tree (Retro Engines through Hyper Drives, including Star Gates, Sub Space Interdictor, Combat Transporters, Inertial Nullifier) omits the Displacement Device, MOO1's top propulsion ship special that causes one-third of all incoming weapon attacks to automatically miss. It was a signature endgame defensive special (also carried by MOO1's Guardian). Every other MOO1 ship special appears to be present.

*Verified:* Case-insensitive grep for 'displacement' across js/ returns zero hits. The propulsion tree (js/data/tech.js:364-441) runs Retro Engines through Hyper Drives (level 50, line 439) and contains inertial_stabilizer, energy_pulsar, warp_dissipator, high_energy_focus, sub_space_teleporter, ionic_pulsar, combat_transporters, inertial_nullifier, sub_space_interdictor, star_gates — i.e., every MOO1 propulsion special except the Displacement Device (MOO1's endgame special making 1/3 of incoming attacks au

### [moo-checklist] MOO1's 2-rack vs 5-rack missile mount choice is not offered
**Location:** `js/data/tech.js:458` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Ship Design — missile weapons may be installed with either 2-shot or 5-shot racks; the 5-rack version consumes ~50% more space.

All missiles are hardcoded shots:5 (and combat.js:29 defaults missiles to 5 shots). In MOO 1993's ship design screen each missile weapon could be mounted as a 2-shot rack (smaller/cheaper) or a 5-shot rack (larger), a meaningful space/endurance tradeoff, and missile bases fired unlimited scatter-pack volleys. The design UI (screens.js weaponSlot) offers no rack choice.

*Verified:* js/data/tech.js — every missile weapon hardcodes shots:5 (lines 458, 464, 476, 488, 497, 512, 542, 548, 563, 569, 578), and js/game/combat.js:29 defaults missile stacks to (t.effect.shots || 5). The design UI weaponSlot() (js/ui/screens.js:201-226) offers only a weapon picker and a +/- count control — no 2-shot vs 5-shot rack option, which in MOO 1993 was a real space/cost/endurance tradeoff per missile mount. (Missile bases in this clone do get unlimited shots, combat.js:68, matching MOO1.)

### [moo-checklist] Colony base capability is empire-global instead of designed into the ship
**Location:** `js/game/ground.js:13` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, Ship Design / Colonization — colony bases come in standard and controlled-environment versions; a colony ship can only settle environments its installed base supports.

canColonize() gates landing on the empire's current derived.maxHostility, and a single generic 'colony_base' special (tech.js:271) serves all environments. In MOO 1993 the controlled-environment capability was baked into the colony ship's design: after researching Controlled Barren/Tundra/etc. you had to design and build a new colony ship carrying the improved (larger, more expensive) colony base module; old colony ships already in flight could not land on hostile worlds. Here a pre-tech colony ship gains new landing rights retroactively the moment the tech is researched, and improved bases cost nothing extra.

*Verified:* js/game/ground.js:9-14 — canColonize() checks def.hostility <= emp.derived.maxHostility, where maxHostility is a live empire-wide derived stat from the best controlled-environment tech known (js/game/state.js:174). colonize() (ground.js:22-24) accepts any ship whose design hasColonyBase. Only one generic 'colony_base' special exists (js/data/tech.js:271-273, 'standard habitable planets'); there are no Barren/Tundra/etc. base modules with extra size/cost. So a colony ship built before researching

### [moo-checklist] Naturally spawning Fertile/Gaia worlds (and README's 'fourteen environments' vs 13 in code)
**Location:** `js/game/galaxy.js:59` · **Category:** formula-fidelity
**MOO 1993 rule:** MOO 1993 manual, Planetology — Soil Enrichment converts standard planets to Fertile; Advanced Soil Enrichment creates Gaia worlds; planet classes at generation range Radiated through Terran.

rollPlanet() can generate planets that start as 'fertile' (s > 0.93) or 'gaia' (s > 0.985) specials at galaxy creation. In MOO 1993, Fertile and Gaia states exist only as the products of Soil Enrichment and Advanced Soil Enrichment terraforming — no planet spawns that way (natural Gaia worlds are a MOO2-ism purists will notice). Relatedly, README claims 'fourteen planetary environments' but CONST.PLANET_TYPES (state.js:26-40) defines 13; the 14th canonical class, Gaia, is modeled as a special instead.

*Verified:* js/game/galaxy.js:59-60 — rollPlanet() assigns special = 'fertile' when s > 0.93 and 'gaia' when s > 0.985 on non-hostile worlds at galaxy generation, so such worlds spawn naturally; in MOO 1993 Fertile/Gaia arise only from Soil Enrichment / Advanced Soil Enrichment terraforming (natural mineral/artifact specials exist, natural fertile/gaia do not). CONST.PLANET_TYPES (js/game/state.js:26-40) defines exactly 13 classes — ironically under a comment reading '// 14 environments' (line 25) — while R

### [moo-checklist] Sabotage/espionage targeting is engine-supported but has no UI — player cannot choose
**Location:** `js/game/espionage.js:114` · **Category:** ux
**MOO 1993 rule:** MOO 1993 manual, Espionage/Sabotage — when saboteurs are ready, the player selects the target colony and the operation (destroy factories, destroy missile bases, or incite rebellion).

resolveAgainst() reads sp.sabTarget (bases/factories/rebellion, line 114) and sp.techTarget (field to steal, line 90), but no code anywhere assigns either — the races screen (screens.js:456) only exposes Hide/Espionage/Sabotage missions, so sabotage always auto-picks the largest colony and a default operation. In MOO 1993 the player chose the sabotage target planet and whether to blow up factories, destroy missile bases, or incite rebellion when the mission window appeared. The dead fields confirm the hook was planned but never wired up.

*Verified:* js/game/espionage.js:90 reads sp.techTarget and line 114 reads sp.sabTarget, both falling back to defaults (random field; largest-factory colony picked at lines 109-112 with bases/factories auto mode). Repo-wide grep shows these two reads are the ONLY references — nothing ever assigns either field. The races screen (js/ui/screens.js:455-461) exposes exactly three mission buttons: Hide, Espionage, Sabotage. So the player never chooses the target planet or operation (factories vs bases vs rebellio

### [moo-checklist] Technology tribute implemented in engine but unreachable from the audience UI
**Location:** `js/game/diplomacy.js:151` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Audiences — Offer Tribute: tribute may be paid in BC or by gifting a technology.

tributeTech() (grant a tech as a gift for a relations boost) is defined and exported but never called by any UI or AI code — the audience screen (screens.js:566) only offers BC tribute and bilateral tech exchange. MOO 1993 audiences allowed offering technologies as one-way tribute to improve relations, a common tool for appeasing stronger empires.

*Verified:* js/game/diplomacy.js:151-158 defines tributeTech() and line 246 exports it; repo-wide grep finds no other reference — no UI and no AI code ever calls it. The audience screen (js/ui/screens.js:486-580) offers peace/pact/alliance/trade/threat, 'Offer Tribute (BC)' at line 566 (calling offerTribute), and 'Exchange Technology' at line 575 (bilateral exchangeTech via techExchange) — but no one-way tech gift, which MOO 1993 audiences allowed as an appeasement tool.

### [moo-checklist] Home world naming option is dead — engine honors opts.homeName but setup screen never asks
**Location:** `js/ui/newgame.js:52` · **Category:** ux
**MOO 1993 rule:** MOO 1993 manual, Starting a New Game — the player enters an emperor name and may rename the home world before play begins.

showSetup() initializes opts.homeName = '' and state.js:332 renames the player's home star when it is set, but the setup panel renders only the leader-name input — there is no home-world field, so the code path is unreachable. MOO 1993's new-game flow asks for both the emperor's name and the home world's name.

*Verified:* js/ui/newgame.js:52 initializes homeName: '' in opts, and js/game/state.js:332 renames the player's home star when set ('if (opts.homeName && emp.isPlayer) star.name = opts.homeName;'). But the setup panel (newgame.js:84-92) renders only the leader-name input ('Eternal Consciousness (optional name)' with oninput setting opts.leaderName); grep confirms nothing else writes homeName, so the rename path is unreachable. MOO 1993's new-game flow asks for both the emperor's name and the home world's na

### [production] Google Fonts CDN dependency contradicts the offline double-click-to-play claim
**Location:** `index.html:9` · **Category:** production

README.md:7 promises 'no server, build step, or install required', but index.html:7-9 pulls Chakra Petch / IBM Plex Sans / IBM Plex Mono from fonts.googleapis.com. Fully offline (or behind a firewall blocking Google), the entire display typography — including canvas-rendered star labels and combat text that hardcode '"IBM Plex Mono", monospace' — silently degrades to fallbacks, and each page load makes third-party requests (a privacy consideration for a distributable file). Bundling the three WOFF2 files locally with @font-face would make the offline claim true.

*Verified:* index.html:7-9 preconnects to fonts.googleapis.com/fonts.gstatic.com and loads Chakra Petch, IBM Plex Sans, and IBM Plex Mono from the Google Fonts CDN. README.md:7 promises 'no server, build step, or install required'. Canvas text hardcodes '"IBM Plex Mono", monospace' at js/ui/map.js:444 and :557 and js/ui/combatui.js:327 and :332, so offline these silently fall back to system monospace. No local @font-face exists in css/style.css.

### [production] Modals have no focus management, ARIA roles, or keyboard-accessible sliders
**Location:** `js/ui/ui.js:160` · **Category:** ux

modal()/dialog() append a fixed overlay with no role='dialog'/aria-modal, never move focus into the dialog, and have no focus trap — after opening, keyboard focus remains on the background button, and Tab walks background controls behind the scrim. (Esc does work via the global handler, and buttons are real <button> elements with a :focus-visible style, which is good.) The five colony ratio bars and research sliders are mouse-drag-only divs with no keyboard or ARIA slider semantics, so allocation — the core economic verb of the game — is impossible without a mouse.

*Verified:* js/ui/ui.js:160-182: modal() builds div.station-overlay / div.station with no role, no aria-modal, no tabindex, and never calls .focus(); dialog() (197-213) likewise. No focus trap exists — Tab continues through background controls. The positive notes check out: Esc closes via the global keydown handler (js/main.js:86-95) and .btn:focus-visible outline exists (css/style.css:86). ratioRow (ui.js:219-277) is plain divs with only a mousedown handler — no tabindex, keydown, or ARIA slider role — so 

### [production] Tactical combat overlay bypasses the overlay registry, so global shortcuts fire mid-battle and stack invisible modals
**Location:** `js/ui/combatui.js:23` · **Category:** bug

CombatUI.run appends its overlay directly to document.body instead of going through HOO.UI.modal, so HOO.UI.hasOverlay() is false during battle. The keyboard gate at main.js:96 therefore lets G/1-6/Tab/F/H through: screen modals open at z-index 40 behind the combat screen (z-index 80) — invisible and unclickable until combat ends, when they pop up unexpectedly stacked; Tab/H silently change map selection mid-battle. Internal inconsistency: two overlay mechanisms, one registry. (Enter is safely blocked only because the `processing` flag happens to still be true.) Registering the combat overlay with the UI overlay stack, or gating shortcuts on any .station-overlay in the DOM, fixes it.

*Verified:* js/ui/combatui.js:23 creates the overlay with inline z-index:80 and line 50 appends it directly to document.body — it is never pushed to the overlays array in ui.js (158-194), so hasOverlay() returns false during battle. The keyboard gate at js/main.js:96 (if (HOO.UI.hasOverlay()) return;) therefore lets G/1-6/Tab/F/H through: HOO.Screens.open modals render in .station-overlay at z-index 40 (css/style.css:273-278), behind the combat screen's z-index 80. Tab calls cycleColonies (main.js:107) chan

### [production] No LICENSE file — the 'from scratch, original code' project is legally all-rights-reserved
**Location:** `README.md:50` · **Category:** production

The repo root contains README.md, LORE.md, css/, js/ and no LICENSE, COPYING, or license header in any source file. The README's disclaimer (line 48-50) carefully addresses the MicroProse trademark but grants recipients no rights to the project's own code/art/writing, so a fan recreation presumably meant to be shared cannot legally be redistributed, forked, or hosted by anyone else. Add an explicit license (MIT/GPL/CC-BY-NC etc.) matching the non-commercial intent.

*Verified:* ls of the repo root shows only .claude, .git, .gitignore, LORE.md, README.md, css, js, index.html — no LICENSE or COPYING. Source file headers are one-line descriptions (e.g. '/* Hamster of Orion — game state... */') with no license grant. README.md:48-50 ('Disclaimer') addresses only the MicroProse trademark and asset provenance; it grants no rights to the project's own code/art/writing, so default all-rights-reserved copyright applies.

### [production] No favicon, no in-game version number, no changelog
**Location:** `index.html:6` · **Category:** production

index.html declares no <link rel='icon'>, so every load 404s /favicon.ico and the tab shows a generic icon — easily fixed with an inline SVG data-URI of the existing wheel motif (util.js wheelSvg). No version string exists anywhere in code or UI (grep confirms), and there is no CHANGELOG, so bug reports cannot be correlated to builds and save-compatibility breaks (see the versioning finding) cannot even be detected. The title screen and the save meta blob are natural places to carry a version.

*Verifier correction:* The '/favicon.ico 404 on every load' applies only when the game is served over HTTP; opened via file:// (the README's primary distribution mode) browsers do not issue that network request, though the tab still shows a generic icon. The core finding (no icon, no version, no changelog) is fully accurate.

*Verified:* index.html (45 lines) contains no <link rel="icon">; grep for favicon across the repo returns nothing. grep -rni 'version' over js/, css/, index.html finds only two unrelated comment/prose matches (ai.js:85, colony.js:312) — no version string in code or UI. No CHANGELOG file exists (repo root listing). Corrected detail below on the 404 claim.

### [production] Saves are trapped in localStorage with no export/import — fragile for a file:// distributed game
**Location:** `js/game/state.js:356` · **Category:** production

All persistence is localStorage keyed under the page origin. For a game distributed as a double-click index.html, the origin is the file path in several browsers, so moving/renaming the HTML file or opening it in a different browser silently orphans every save; browser 'clear site data' wipes them irrecoverably. There is no export-to-file / import-from-file option (a JSON download/upload is ~20 lines given saves are already JSON strings), which would also serve as the bug-report attachment mechanism the project currently lacks.

*Verifier correction:* The file:// origin claim is directionally right but imprecise: Firefox scopes file:// localStorage per containing directory (moving the folder orphans saves; renaming index.html itself within the same directory does not), while Chrome shares one file:// origin across local files. Switching browsers always orphans saves, and 'clear site data' wipes them irrecoverably — those parts are exactly right.

*Verified:* js/game/state.js:352-380: all persistence is localStorage under keys hoo_save_<slot>/_meta; grep for FileReader/Blob/download/upload/export across js/ finds no export/import mechanism anywhere. Saves are already JSON strings (state.js:355), so a file download/upload path would indeed be trivial. Corrected detail on the origin-scoping claim below.

### [production] Galaxy map redraws fully at 60fps even when completely idle
**Location:** `js/ui/map.js:264` · **Category:** production

tick() unconditionally calls draw() every animation frame with no dirty flag or idle throttle. Each draw allocates a fresh createRadialGradient per star (108 stars on Huge, line 517) plus nebula gradients, iterates all fleets/transports, and calls orderPreviewInfo() twice per frame (drawOrderPreview line 384 and refreshBanner line 385), which can invoke Fleet.inRange repeatedly while merely hovering. Only the selection-ring pulse actually needs continuous animation. On laptops this burns battery for a turn-based game sitting idle, and it multiplies with the duplicated-render-loop leak reported separately. Rendering on state change plus a low-rate pulse timer (or pausing rAF when the document is hidden) would eliminate it.

*Verified:* js/ui/map.js:264-269: tick() unconditionally calls draw() and re-queues requestAnimationFrame every frame with no dirty flag, idle throttle, or document.hidden check. draw() allocates ctx.createRadialGradient per star per frame at line 517 (drawStar, called for every star at line 371; Huge = 108 stars per js/game/state.js:16) plus per-nebula gradients at line 299, iterates all fleets (337) and transports (350), and calls orderPreviewInfo() twice per frame — via drawOrderPreview (call at line 384

### [research] Advanced Space Scanner's showPlanets ability is defined but never wired into any system
**Location:** `js/data/tech.js:68` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Computers: the Advanced Space Scanner allows ships to scan planets (view colony details) from any distance within scanner range.

tech.js:68 sets effect showPlanets:true and the description promises ships 'can scan planets from orbit range', but no other file reads showPlanets (state.js recomputeEmpire lines 149-152 copies only range, shipRange, and showDest into derived stats). The other scanner fields are consumed (scanRange at fleet.js:216, shipScanRange at fleet.js:218, scanShowsDest at panels.js:552), so the top-tier scanner's differentiating ability is a dead attribute — the level-23 tech gives only the range bump.

*Verified:* js/data/tech.js:68 sets `showPlanets:true` on advanced_space_scanner with desc promising ships 'can scan planets from orbit range' (line 69). A repo-wide grep shows 'showPlanets' appears only in tech.js (line 32 as false, line 68 as true) — no game or UI code reads it. state.js recomputeEmpire lines 149-152 copy only effect.range → scanRange, effect.shipRange → shipScanRange, and effect.showDest → scanShowsDest. The sibling fields are all consumed as claimed: scanRange at fleet.js:216, shipScanR

### [research] Research points allocated to an exhausted field are silently discarded
**Location:** `js/game/research.js:56` · **Category:** ux
**MOO 1993 rule:** MOO 1993: the tech sliders always direct research somewhere useful; there is no state in which allocated research evaporates.

processResearch sums totalAlloc over all six fields (research.js:52) including fields whose project is null (fully researched tree), then line 56-57 returns without banking that field's share — the points vanish. The tech screen (screens.js:778) still shows an active slider for the exhausted field with the caption 'Field exhausted — refinements only', but no refinement mechanic exists, so a player who leaves the slider up loses that fraction of empire-wide RP every turn with no feedback.

*Verified:* js/game/research.js:51-52 sums totalAlloc over all six fields including those whose project is null (ensureProjects sets `emp.research.projects[f] = null` for exhausted fields, line 40). Then in the per-field loop, lines 56-57 `var pr = emp.research.projects[f]; if (!pr) return;` skip the field without banking or redistributing its share of `points * alloc[f]/totalAlloc` — that fraction of empire RP evaporates. screens.js:742-756 builds an active, lockable allocation slider for every field uncon

### [research] Battle Scanner tooltip says +1 initiative but the implementation grants +3 initiative and +1 attack
**Location:** `js/data/tech.js:45` · **Category:** ux
**MOO 1993 rule:** MOO 1993 manual, Computers: the Battle Scanner adds +3 to a ship's initiative and reveals enemy ship statistics.

tech.js:45 describes the Battle Scanner as adding '+1 to initiative', but shipdesign.js:136-137 applies initiative += 3 (matching the manual) plus an undocumented attack += 1. The player-facing description understates the tech relative to both the manual and the actual code, and the +1 attack bonus has no MOO basis. The stat-revealing half of the special is also not implemented in the combat UI.

*Verified:* js/data/tech.js:45 desc: 'reveals enemy ship stats in combat and adds +1 to initiative', repeated in SPECIAL_STATS at tech.js:612 ('+1 initiative'). The implementation at shipdesign.js:136-137: `var hasScanner = slist.some(... === 'battleScanner'); if (hasScanner) { initiative += 3; attack += 1; }` — +3 initiative (matching the MOO 1993 manual) plus an undocumented +1 attack with no MOO 1993 basis. Grep confirms 'battleScanner' is consumed only in shipdesign.js:136; nothing in combat.js or the c

### [ui-code] Eco clean-minimum enforced only when dragging the Eco bar itself; notes then misreport
**Location:** `js/ui/panels.js:199` · **Category:** bug

The UI spring-back (panels.js:199-205) applies only when key==='eco'; dragging Ship/Def/Ind/Tech up rebalances Eco below HOO.Colony.ecoMinPct with no lock and no visual warning — ecoNote (panels.js:351-366) only shows WASTE when the bar is locked, so it displays CLEAN. The engine does spring Eco back at turn processing (colony.js:183-185), stealing the difference from the other bars, so the per-bar forecast notes (shipNote/defNote/indNote/techNote, panels.js:303-376) computed from the raw on-screen allocations overstate what will actually be produced. Either apply the spring-back on every rebalance (matching the engine) or reflect the post-spring values in the notes.

*Verified:* panels.js:197-204: the spring-back (`if (key === 'eco' && !c.locks.eco) { ... if (v < minPct) v = minPct; }`) only runs in the eco row's set(); dragging ship/def/ind/tech calls rebalance (ui.js:280-306) which freely shrinks unlocked eco below HOO.Colony.ecoMinPct. ecoNote (panels.js:346-367) shows WASTE only when `c.locks.eco && alloc.eco < minPct` (line 353); with eco unlocked and below minimum, surplusBC clamps to 0 (line 355) and it returns 'CLEAN' (line 366). The engine springs eco back at t

### [ui-code] Notices digest discovery-choice block is unreachable dead code
**Location:** `js/ui/notices.js:203` · **Category:** bug

MINOR_TYPES (notices.js:10) includes discovery:1, so discovery notices are always routed to the toast feed and never reach noticesDigest — the entire 'discovery' handling block in the digest (notices.js:203-220), plus its tagFor branch (notices.js:159), can never execute. Two parallel implementations of the research-choice UI exist (toastMinor buttons at 34-47 and this one), one of them dead. Either remove the dead path or demote it to the live one.

*Verifier correction:* Minor naming precision: line 159 is not part of the top-level tagFor() function (whose discovery branch at line 20 IS live via toastMinor); it is a separate inline tag assignment inside noticesDigest. That inline branch is the dead one, exactly at the cited line.

*Verified:* notices.js:10 MINOR_TYPES includes discovery:1; presentTurn (lines 62-67) splits visible notices into minor (MINOR_TYPES → toastMinor) and interesting (everything else → noticesDigest), unconditionally, and noticesDigest has no other caller. Therefore the digest's discovery block at 203-220 and the inline `tag = 'Ministry of Science'` branch at line 159 can never execute; toastMinor's sticky-button implementation at 34-47 is the live duplicate of the same research-choice UI. Confirmed.

### [ui-code] Toast cap silently evicts sticky research-choice toasts
**Location:** `js/ui/ui.js:126` · **Category:** ux

The toast stack is capped at 7 by removing the oldest child (ui.js:126) with no exemption for sticky toasts. On a busy late-game turn (several built/eco/explore/spy dispatches), the sticky discovery toast carrying the 'choose next research project' buttons is evicted before the player sees it. Research does not stall (ensureProjects auto-picks the first choice, research.js:34-43) and the choice can still be changed on the Tech screen while invested < 1 (screens.js:767), but the player is never told a choice existed. Sticky/button toasts should be exempt from eviction or fall back to the digest.

*Verified:* ui.js:126: `while (toastStack.children.length > 7) toastStack.removeChild(toastStack.firstChild)` — oldest-first eviction with no sticky/button exemption; sticky merely skips the auto-dismiss timeout (ui.js:127-129). The sticky research-choice toast is built in notices.js:34-47 and is appended in notice order (presentTurn line 65 minor.forEach), so 7+ later toasts in one busy turn evict it unseen. Research indeed does not stall: research.js:34-43 ensureProjects auto-picks choices()[0] (called af

### [ui-code] Hover tooltip leaks the names of unexplored stars
**Location:** `js/ui/map.js:210` · **Category:** bug

showTipStar always renders s.name in the tooltip header (map.js:210) before checking s.explored[0], while drawStar deliberately hides unexplored star names as '· ·' (map.js:564) and the sidebar shows 'Uncharted System' (panels.js:56). Internal inconsistency: hovering reveals what the map and panel conceal. Cosmetic info leak (names are flavor), but it undercuts the exploration presentation.

*Verified:* map.js:210: showTipStar always renders `'<div class="t-name">' + U.esc(s.name) + '</div>'` before the `if (!s.explored[0])` branch at line 211 (which only changes the subtitle to 'Unexplored ... star'). drawStar hides unexplored names as '·  ·' at map.js:564, and the sidebar shows 'Uncharted System' at panels.js:56. Internal inconsistency confirmed exactly as described; impact is cosmetic since names are flavor.

### [ui-code] Home-world naming supported by the engine but missing from the setup screen
**Location:** `js/ui/newgame.js:52` · **Category:** missing-feature
**MOO 1993 rule:** MOO 1993 manual, Starting a New Game: player names emperor and home world

showSetup initializes opts.homeName (newgame.js:52) and HOO.State.newGame applies it (state.js:332 `if (opts.homeName && emp.isPlayer) star.name = opts.homeName`), but the setup panel only renders a leader-name input — no home-world name field exists anywhere, so the option is dead. Either add the input next to the leader name or drop the dead plumbing. (MOO 1993's setup similarly let you name your emperor and home world.)

*Verified:* newgame.js:50-53: opts initializes homeName: ''; state.js:332 applies it (`if (opts.homeName && emp.isPlayer) star.name = opts.homeName`). The setup panel renders only the leader-name input (newgame.js:85-92, oninput sets opts.leaderName); grep confirms no input ever writes opts.homeName, so the plumbing is dead. MOO 1993's setup did let you name both your emperor and your home world, so the fidelity note is accurate. Confirmed.

### [ui-code] Planets screen lacks sorting and totals
**Location:** `js/ui/screens.js:671` · **Category:** ux

The Colonial Administration table (screens.js:671-705) lists colonies in fixed star order with no sortable columns (by pop, production, bases, waste) and no totals row, which becomes painful past ~15 colonies; the original game's Planets screen kept the whole-empire picture in view. There is also no indication per row of pending transports or reloc targets (only '(*)' for stargates). Column-header click-to-sort plus a totals footer would close the gap.

*Verifier correction:* The code facts are all accurate. The MOO 1993 comparison is loose: the original Planets screen was also a fixed, non-sortable list; its 'whole-empire picture' advantage was the summary information kept on-screen, not sortable columns. So this is best read as a UX-gap/enhancement finding (which its 'low' severity reflects), not a fidelity deviation.

*Verified:* screens.js:671-705: the table is built from HOO.Colony.colonies(g, 0) in fixed star order; header cells (673-676) have no click handlers, there is no totals row (only an empire-wide economy summary line and tax bar below at 709-724), and per-row Notes (695-702) show only special/hostile/'(*)' stargate/REBELLION — no pending-transport or reloc indicators. All code claims verified.

### [ui-code] No settings surface; dead showRanges toggle; limited save slots
**Location:** `js/ui/map.js:313` · **Category:** ux
**MOO 1993 rule:** MOO 1993 manual, Game menu: six save game slots

Long-session gaps, all code-verifiable: (1) map.js:313 gates fuel-range rings on `view.showRanges !== false`, but nothing anywhere sets view.showRanges — the toggle is dead code and the player cannot hide (or emphasize) range rings; (2) there is no settings screen at all — no toast-duration/turn-pacing options (the 250 ms wheel delay at main.js:45 and 14-16 s toast timeouts are hardcoded), which is acceptable for a no-audio game but leaves nothing tunable; (3) only 3 manual save slots plus autosave (screens.js:24, newgame.js:33), with no delete-save or export/import of the localStorage JSON for backup — MOO 1993 offered 6 save slots; (4) no message/event history log, so a dismissed toast is gone forever.

*Verified:* (1) map.js:313 gates range rings on `view.showRanges !== false`; grep shows that is the sole reference in the repo — `view` is initialized {x,y,scale} (map.js:9) and nothing ever sets showRanges, so the toggle is dead. (2) No settings screen exists (Screens.open handles only game/design/fleet/races/planets/tech/status, screens.js:9-19); the 250 ms wheel delay is hardcoded at main.js:45, toast timeouts hardcoded at 14000 default (ui.js:128) and 16000 (notices.js:31). (3) Exactly 3 manual slots: s
