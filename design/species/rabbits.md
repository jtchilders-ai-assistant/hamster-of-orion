# Rabbits

## Physical Description
Large ears constantly swiveling for danger. Powerful hind legs built for rapid escape. Soft fur in browns, whites, and spotted patterns. Twitchy, nervous energy. Large families everywhere. Population density that makes other races uncomfortable.

## Biology & Habitat
- **Homeworld**: Leporis (Overcrowded garden world with three moons)
- **Environment Preference**: Temperate, abundant food sources, extensive burrow networks
- **Lifespan**: 9 years (natural), but most die young due to overcrowding
- **Reproduction**: Exponential - the primary cultural concern

## Culture & Society
### Core Values
Family. Survival through numbers. "The warren that breeds fastest inherits the galaxy." Population as power. Quantity over quality. Safety in overwhelming presence.

### Government Type
Democratic confederation of family warrens. The "Grand Burrow Council" consists of representatives from the largest family groups. Power determined by population share. Elections are frequent and chaotic.

### Philosophy on War
War is population displacement. Victory through sheer demographic weight. Colonize everything, outbreed everyone. Don't need to defeat enemies militarily - just outgrow them. Time is on their side.

### View of Other Races
Everyone is potential warren space. Nervous around predators (Ferrets trigger instinctive fear). View Ants as competitive breeders. Consider Rats and Mice as cute but naive for limiting reproduction. Pity Hermit Crabs for their isolation.

## Gameplay Mechanics

### Racial Bonuses
- **Production**: +10% (many workers)
- **Research**: -10% (focus on survival over innovation)
- **Research Field Bonuses**: Planetology +40% (field expert — better terraforming, soil enrichment, higher max pop; matches MOO1 Sakkra)
- **Food**: +25% (expert farmers and foragers)
- **Growth**: +100% (exponential reproduction)
- **Ground Combat**: +5% (overwhelming numbers)
- **Ship Combat**: -10% (quantity over quality)
- **Espionage**: -5% (too visible)
- **Diplomacy**: +5% (friendly, non-threatening)

### Special Abilities
- **Exponential Growth**: Population doubles at alarming rate
- **Rapid Colonization**: Can colonize planets with minimal infrastructure
- **Overflow Population**: Can transfer excess population to new colonies instantly
- **Democratic Resilience**: Conquered populations rebel less (too busy breeding)
- **Swarm Tactics**: Can field massive fleets of cheap, expendable ships

### Starting Technologies
- Retro Engines
- Colony Ship (immediate expansion capability)
- Hyper-V Rockets
- Standard Fuel Cells

### Unique Units/Buildings/Technologies
- **Unique Building**: Mega-Warren - Increases planetary population capacity by 50%
- **Unique Ship**: Colony Swarm - Can colonize multiple planets in one trip
- **Unique Technology**: Genetic Vitality - Population growth accelerates even further

## AI Behavior

### Personality Archetype
Aggressive Expansionist (matches MOO1 Sakkra — strongly driven to expand, will contest border planets)

### Diplomatic Tendencies
- **Natural Allies**: Hamsters (peaceful coexistence useful for breeding room), anyone who gives space
- **Natural Enemies**: Anyone encroaching on warren space — Rabbits react aggressively to crowding
- **Trade Behavior**: Generous with food, need everything else
- **Treaty Reliability**: Medium — keeps peace when it serves growth, aggressive when space is contested

### Strategic Priorities
1. Colonize every available planet immediately
2. Maximize population growth on all worlds
3. Research colony and farming technologies
4. Build defensive fleets only
5. Win through demographic dominance

### War Behavior
Extremely defensive. Avoids declaring war. When attacked, relies on massive population to absorb casualties and outlast enemies. Will trade territory for time, then recolonize with overwhelming numbers. Eventually wins through attrition and population replacement.

## Flavor & Personality

### Leader Names
*Family and pastoral themed*
- Males: Warren, Clover, Thicket, Meadow, Burrow
- Females: Blossom, Garden, Willow, Daisy, Heather
- Titles: Warren Master, Family Elder, Council Speaker

### Ship Names
*Pastoral and multiplication themed*
- RCS (Rabbit Colony Ship) Abundance, Plenty, Multitude, Prosperity
- RCS Family-1 through Family-9999, Warren-Alpha through Warren-Omega
- RCS Hop, Skip, Jump, Bound, Leap

### Planet Names
*Garden and family themed*
- New Leporis, Green Warren, Clover Field, Meadow-7
- Family-World-[Number], The Burrows, Safe Haven
- Garden, Orchard, Pasture, Field, Grove

### Quotes & Personality
**When greeting player:**
> "Oh! Hello! Welcome to our space! We mean no harm! Would you like to trade? We have lots of... well, lots of us, mostly."

**When declaring war (extremely rare):**
> "You've left us no choice! We may be peaceful, but there are SO MANY of us! Please reconsider!"

**When forming alliance:**
> "An alliance! How wonderful! Our families shall prosper together! We'll share our agricultural surplus!"

**When betraying player (never):**
> [This scenario does not occur - Rabbits never betray]

**When defeated:**
> "No... impossible... there were so MANY of us... how could you... at least our colonies on the outer rim will remember... and breed... and return..."

## Design Notes
Rabbits are the "population explosion" race - overwhelming numbers compensate for individual weakness. Win through demographic dominance. Perfect for players who love wide expansion and population management.

Design intent: Quantity over quality. Cover the map with colonies, outgrow everyone, win Domination victory through sheer population count. Simple but effective strategy.

Their growth bonus (+100%) is game-changing. While others have a dozen planets, Rabbits have fifty. While others field a hundred ships, Rabbits field a thousand. They're individually weak but collectively unstoppable.

Balance consideration: Strongest in Domination victory (population control). Vulnerable to quality-over-quantity strategies. Must survive early game when growth hasn't scaled up yet.

Key weakness: Overexpansion. Managing 50+ colonies is complex. Poor research means they fall behind technologically. A small, advanced empire can defeat a large, primitive one.

---

## Repurposed Ancient Technology
Rabbits view Ancient facilities as gifts from benevolent precursors who wanted all life to flourish. The structures are seen as cosmic nurseries designed to nurture emerging civilizations.

The exercise wheels were "meditation devices for contemplating the cycles of life." The Habitrail tubes were "migration routes for growing populations." The food dispensers were "blessings of plenty."

Rabbits believe the Ancient Ones would be proud of their exponential growth. "They left us a garden galaxy. We have filled it with life, as they intended. We are the inheritors, the living continuation of their legacy."

Every new Rabbit colony has a shrine thanking the Ancient Ones for their fertile gift.

## Species-Specific Mechanics (Formulas)

### Rabbit Colonization Times
Rabbits reproduce and establish themselves with terrifying speed.
- **Swarm Growth**: The base population growth formula is enhanced. `Rabbit_Growth = Base_Growth * 2.0`
- **Rapid Establishment**: When a Rabbit colony ship settles a new planet, the starting population is 5M (instead of the standard 2M), and the planet's factory construction cost is reduced by `25%` for the first 20 turns, allowing them to rapidly industrialize new worlds.
