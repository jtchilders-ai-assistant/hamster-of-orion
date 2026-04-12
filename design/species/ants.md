# Ants

## Physical Description
Six-legged insectoid forms. Segmented bodies in black, red, or brown chitin. Powerful mandibles. Antennae constantly twitching, receiving chemical signals. Individual ants are unremarkable; the Collective is everything.

## Biology & Habitat
- **Homeworld (Lore)**: Formicae — an arid world with massive underground tunnel networks. This is where the Collective *evolved*, but in-game their starting planet is Terran (see Gameplay Note below).
- **Environment Preference**: Any - the Collective adapts
- **Lifespan**: Individual irrelevant; Collective is immortal
- **Reproduction**: Queens produce thousands. Population = industrial capacity.

## Culture & Society
### Core Values
Efficiency. Unity. Purpose. The individual is nothing; the Collective is all. Waste is sin. Perfection through optimization. "One mind, countless bodies, infinite production."

### Government Type
Hive mind. No government as other races understand it. Queens coordinate specialized castes. Every ant knows its function from birth. Decisions are unanimous because they come from the Collective consciousness.

### Philosophy on War
War is resource allocation problem. Victory = optimal expenditure of units to capture productive systems. Casualties meaningless; only production matters. Peace or war equally acceptable if efficiency demands it.

### View of Other Races
Fascinating but inefficient. Individuality appears to cause 43.7% productivity loss. Offer to assimilate other races into the Collective (they always refuse - suboptimal decision). View Chameleons as incomprehensible chaos. Respect Mice's efficiency.

## Gameplay Mechanics

### Racial Bonuses
- **Production**: +50% (unmatched industrial capacity)
- **Research**: -10% (practical, not theoretical)
- **Food**: +20% (efficient resource conversion)
- **Growth**: +25% (rapid reproduction)
- **Ground Combat**: +20% (overwhelming numbers)
- **Ship Combat**: +0% (adequate but not exceptional)
- **Espionage (Offensive)**: 0 — the Hive Mind cannot conduct individual infiltration (cannot be assigned to espionage slider; see `Hive Mind` special ability)
- **Espionage (Defensive)**: 0 + Immune — `Hive Mind` special ability grants full immunity; all enemy spy missions auto-fail. Do **not** model as a numeric modifier; use the boolean flag `immune_to_espionage: true`.
- **Diplomacy**: -30% (alien mindset disturbs others)

### Special Abilities
- **Perfect Efficiency**: No population unrest, ever. Maximum production always.
- **Hive Mind**: Immune to espionage, sabotage, and diplomatic manipulation
- **Rapid Industrialization**: New colonies reach full production 50% faster
- **Expendable Units**: Ships and troops cost **10% less** to produce
- **Overpopulation**: Can support more population per planet

### Starting Technologies
- Retro Engines (basic, efficient)
- Automated Factory (immediate production bonus)
- Mass Driver (simple, effective weapons)
- Reinforced Hull

### Unique Units/Buildings/Technologies
- **Unique Building**: Hive Complex - Dramatically increases production and population capacity
- **Unique Ship**: Swarm Carrier - Deploys waves of disposable fighter drones
- **Unique Technology**: Pheromone Control - Conquered populations integrate instantly into Collective

## AI Behavior

### Personality Archetype
Expansionist / Production-Focused / Relentless

### Diplomatic Tendencies
- **Natural Allies**: None (cannot truly "ally" with non-hive entities)
- **Natural Enemies**: None (views all as resources or obstacles)
- **Trade Behavior**: Coldly efficient, calculates exact value
- **Treaty Reliability**: Perfectly reliable - treaties are efficiency decisions

### Strategic Priorities
1. Maximize total production across all systems
2. Expand to resource-rich planets immediately
3. Build overwhelming numerical superiority
4. Research production-enhancing technologies
5. Calculate optimal moment for conquest

### War Behavior
Overwhelms through sheer numbers. Values territory over ships - will trade fleets for planets. Accepts heavy casualties without hesitation. Predictable but unstoppable. Once war is calculated as efficient, fights to total victory or total loss.

## Flavor & Personality

### Leader Names
*The Collective doesn't have leaders, but designates communication nodes*
- Coordinators: Efficiency-Node-Alpha, Production-Nexus-12, War-Coordinator-Prime
- Queens: Egg-Layer-3847, Colony-Founder-92, Genetic-Template-Omega
- Titles: [None - only functional designations]

### Ship Names
*Pure function descriptors*
- CAS (Collective Ant Ship) Production-Unit-147, Resource-Gatherer-8
- CAS Defense-Platform-23, Combat-Element-956, Transport-Vessel-41
- CAS Efficiency, Productivity, Industry, Labor, Output

### Planet Names
*Systematic designation*
- Formicae Prime, Colony-Alpha, Colony-Beta, Colony-Gamma
- Production-World-01, Resource-Node-07
- Factory, Foundry, Forge, Workshop, Industrial-Center

### Quotes & Personality
**When greeting player:**
> "Acknowledgment: Individual entity detected. Query: Purpose of communication? The Collective awaits data."

**When declaring war:**
> "Calculation complete: Military action achieves optimal resource allocation efficiency. Deploying force. Resistance will be processed."

**When forming alliance:**
> "Analysis: Cooperation yields 23.4% efficiency increase. Alliance parameters accepted. The Collective will comply."

**When betraying player:**
> "Recalculation: Alliance no longer optimal. New parameters require conflict. This is not personal. Personal is inefficient."

**When defeated:**
> "Error. Miscalculation. Resources... depleted. The Collective... fails. This outcome... suboptimal. [static] [silence]"

## Design Notes
Ants are the "production powerhouse" race - they can outbuild everyone but lack flexibility and creativity. Perfect for players who love economic management and numerical superiority.

Design intent: Overwhelming industrial output but poor at innovation and diplomacy. Win through sheer weight of numbers. Simple to play but powerful in skilled hands.

Their production bonus (+50%) is huge and stacks with growth (+25%). They can field massive fleets and colonize aggressively. However, their diplomatic penalty makes everyone uncomfortable, and their research penalty slows tech advancement.

Balance consideration: Strongest in mid-game when production matters most. Vulnerable early (before economy scales up) and late (when technology gap becomes critical). Must leverage industrial advantage before enemies out-tech them.

Key weakness: Predictable. Cannot adapt to unexpected strategies. Complete espionage isolation — their hive mind immunity protects them from all spying, but also prevents them from conducting any intelligence operations themselves.

**Design deviation from MOO1:** In the original Master of Orion, Klackons had no special espionage traits — they were merely xenophobic industrialists. The Ants' two-way espionage isolation (cannot spy / immune to spying) is a deliberate design choice to reinforce the hive-mind theme. This makes them mechanically distinct from Klackons in a way that fits their flavor.

---

## Homeworld Lore vs. Gameplay
**Lore:** Formicae is an arid world — the ancient birthplace of the Collective, carved into vast tunnel networks by the first colonies.
**Gameplay:** The in-game starting planet is always Terran (equal starting conditions for all species). Formicae is treated as the Collective's original homeworld, long since integrated into the broader empire before the events of the game.

See `design/galaxy/generation-algorithm.md` — `ConfigureAsHomeworld()` for the balance rationale.

## Repurposed Ancient Technology
The Collective has analyzed Ancient facilities with 99.7% efficiency. Conclusion: Ancient Ones were proto-Collective entities who achieved partial unification before transcendence. Evidence: all facilities designed for optimal resource distribution.

The exercise wheels are obviously power generation systems (kinetic energy conversion). The water bottles are clearly automated hydration networks. The Habitrail tubes represent the Ancient Ones' attempt to create a physical manifestation of hive-mind connections.

The Collective has requisitioned all Ancient facilities for maximum productive efficiency. This is logical. The Ancient Ones would approve.
