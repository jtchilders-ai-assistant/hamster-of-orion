# Hamster of Orion

*An unaffiliated, non-commercial fan project. Not endorsed by the rights holders of Master of Orion — see [Disclaimer](#disclaimer).*

A browser-based 4X strategy game that faithfully recreates the mechanics of *Master of Orion* (MicroProse, 1993), set in the Great Awakening universe described in `LORE.md`. One hundred twenty-three years after the pets of a vanished humanity achieved sentience, ten races contend for the galaxy — and for the Cosmic Wheel waiting behind Orion's barrier.

## Play It

**[▶ Play in your browser](https://jtchilders-ai-assistant.github.io/hamster-of-orion/)** — no install, no build step, nothing to download.

To run it locally instead, clone the repo and open `index.html` directly (double-click it — there is no server or build step). Everything is vanilla HTML/CSS/JS loaded with plain `<script>` tags; the only network request is an optional Google Fonts stylesheet, and the game falls back to system fonts offline.

```bash
git clone https://github.com/jtchilders-ai-assistant/hamster-of-orion.git
cd hamster-of-orion && open index.html
```

Browsing the source? [`docs/architecture.html`](docs/architecture.html) is an interactive map of the 27 modules, what each one exposes, and the load order — open it in a browser.

## How to Play

Open `index.html` in any modern desktop browser (double-click it — no server, build step, or install required; best at window widths of 1024px or more). Games autosave every turn with a rolling pre-turn backup; six manual save slots plus export/import to a file are available from the **Game** menu, which also holds settings, the message log, and an in-game help reference. Display fonts load from Google Fonts when online and fall back to system fonts offline.

## What's Implemented (per the original 1993 manual)

The economy follows the manual's formulas: five production ratio bars per colony (Ship / Def / Ind / Eco / Tech, with lockable bars), factories at 2 per colonist rising with Robotic Controls, industrial waste and ecology cleanup, terraforming, atmospheric conversion, soil enrichment, planetary reserve with 2:1 taxation and colony funding, trade treaties that start at −30% and ramp to 100%, and ship/base maintenance.

Research uses the original model — six fields with slider allocation, base cost = level² with race multipliers (Excellent 60% … Poor 125%), 15% interest capped at your yearly investment, breakthrough odds of +1% per 2% overinvestment, and miniaturization (cost halves per 10 levels; weapon size halves, other devices shrink 25%). As in the original, each empire receives only a randomized portion of the tech tree every game (the Rats see more of it) — missing techs must come from espionage, conquest, trade, or the ruins of Orion.

Ship design offers the four hulls from the manual's table (40/200/1000/5000 tons), battle computers, shields, ECM, six armor materials with double-hull variants, engines that both move and power the ship, four weapon slots, and three special-device slots drawn from the full MOO catalog (cloaking devices, stasis fields, repulsor beams, black hole generators, subspace teleporters, and the rest). Six designs may be in commission at once.

Tactical combat runs on a 10×8 grid with initiative from maneuverability + computer mark, the manual's exact to-hit table and damage interpolation, tracked missiles with limited racks, torpedoes firing every other round, shields subtracting their class, atmospheric halving of beams against planets, missile bases (50 hits, planetary shield stacking), retreat with parting shots, and auto-resolve for any battle you'd rather not command personally.

Diplomacy models the fifteen relation levels from Feud to Harmony, the manual's starting-relations matrix, six leader personalities and six objectives, non-aggression pacts, alliances, trade, tribute, tech exchange, threats, war weariness, and peace. Espionage implements the manual's security and infiltration roll tables, including framing third parties, hiding, technology theft, sabotage of bases and factories, and incited rebellions (Chameleon bonuses included).

The galaxy comes in four sizes with nebulas (warp 1, shields fail), five difficulties (AI handicaps 50%–125%, per the manual), 1–5 opponents, thirteen planetary environments, mineral rich/poor worlds, and artifacts; fertile and gaia worlds arise through Soil Enrichment, raising growth and maximum population as the manual describes. Random events include comets, plagues, supernovas, rebellions, the Space Amoeba and Space Crystal, pirates, derelicts, and more. The High Council convenes once two-thirds of the galaxy is settled and elects a Master of Orion by two-thirds vote — abstain, back a rival, accept the verdict, or defy the united galaxy in a Final War. And the Guardian waits at Orion.

## The Ten Races

| Race | Heritage (MOO) | Advantage |
|---|---|---|
| Budgies | Alkari | +3 ship defense and initiative |
| Guinea Pigs | Bulrathi | +25 ground combat |
| Chameleons | Darlok | Half-cost spies, +30 espionage, +20 security |
| Hamsters | Human | +25% trade, doubled goodwill, council sway |
| Ants | Klackon | Double worker output |
| Mice | Meklar | +2 factory controls per colonist |
| Ferrets | Mrrshan | +4 ship attack, first strike |
| Rats | Psilon | Cheaper research, larger tech tree, wider choices |
| Rabbits | Sakkra | +50% population growth |
| Hermit Crabs | Silicoid | Ignore waste and hostile worlds |

## Controls

Click a star to view it; click a fleet triangle to command it. With a fleet selected, just click any star to send it — a green/red path with ETA previews the order as you hover, and adjusting the ship counts first splits the fleet. Transports and ship relocation work the same way: pick the action on the colony panel, then click the target. Drag to pan, scroll to zoom, click empty space or press Esc to deselect.

Minor reports (surveys, spy captures, construction) arrive as dismissable dispatches over the map — click one to jump to the system it mentions. Only battles, wars, first contact, GNN crises, and the High Council interrupt you. An alert bar under the header flags colonies in trouble (waste, rebellion, plague, decline); click a chip to go there. Colony panels include one-click allocation presets — Develop, Defend, Research, Shipyard — and shift-clicking a preset applies it to every colony.

Keyboard: **Enter** turns the Wheel · **Esc** closes/cancels · **1–6** open Design, Fleet, Races, Planets, Tech, Status · **G** game menu · **?** help & shortcuts · **Tab** cycles colonies · **F** cycles fleets · **H** jumps home.

*"The Wheel turns whether you run in it or not. Better to run, and make it turn your way."*

## Disclaimer

Hamster of Orion is a non-commercial fan recreation of the game mechanics of *Master of Orion* (MicroProse, 1993), built from scratch with original code, art, and writing, released under the MIT License (see `LICENSE`). It contains no assets, code, or data files from the original game. *Master of Orion* is a trademark of its respective rights holders; this project is not affiliated with or endorsed by them. The original game's manual is referenced for mechanics but is not distributed with this repository.
