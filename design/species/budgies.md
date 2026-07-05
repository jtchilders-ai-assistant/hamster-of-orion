# Budgies (Budgerigars)

## Physical Description
Vibrant plumage in blues, greens, and yellows. Small, agile bodies built for flight. Keen eyes capable of processing rapid three-dimensional movement. Natural acrobats with extraordinary spatial awareness.

## Biology & Habitat
- **Homeworld**: Aeria (Low-gravity world with dense atmosphere and floating islands)
- **Environment Preference**: Thin atmosphere, open spaces, vertical territories
- **Lifespan**: 8 years (natural), extended through consciousness transfer
- **Reproduction**: Clutch layers, moderate population growth

## Culture & Society
### Core Values
Honor through aerial mastery, courage in combat, freedom of movement, perfection through practice. "The sky has no limits, neither should we."

### Government Type
Meritocratic military hierarchy. Rank determined by flight trials and combat performance. The "Wing Commander" leads through demonstrated superiority.

### Philosophy on War
War is the ultimate test of skill. Combat should be direct, honorable, and decisive. Prefer quick strikes over prolonged sieges. View space combat as the highest form of aerial dogfighting.

### View of Other Races
Respect those who prove themselves in battle. Contemptuous of ground-dwellers who "don't understand three dimensions." Admire Ferrets for their precision, but consider them earthbound. Frustrated by Chameleons' indirect methods.

## Gameplay Mechanics

### Racial Bonuses
- **Production**: -10% (focus on quality over quantity)
- **Research**: +0% (balanced)
- **Research Field Bonuses**: Propulsion +40% (field expert — reach distant planets faster, better engines sooner; matches MOO1 Alkari)
- **Food**: -10% (poor farmers, prefer hunting)
- **Growth**: +0% (balanced)
- **Ground Combat**: -20% (terrible at ground warfare)
- **Ship Combat**: +50% (exceptional space pilots)
- **Espionage**: -10% (too direct/honorable)
- **Diplomacy**: +0% (respected but aloof)

### Special Abilities
- **Superior Pilots**: All ships gain +3 combat initiative, +3 Defense Levels (maneuverability/dodge), and +20% evasion
- **Extended Range**: All ships gain +1 movement range (Propulsion specialization)
- **Three-Dimensional Tactics**: Enemy missile accuracy reduced by 30%
- **Dogfighter**: Small ships get additional combat bonuses
- **Flight School**: New ships enter combat with veteran crew status

### Starting Technologies
- Ion Drives (faster ships from the start)
- Battle Computer Mark I
- Fusion Bomb
- Class I Shields

### Unique Units/Buildings/Technologies
- **Unique Building**: Aerial Academy - Ships built here start at higher experience level
- **Unique Ship**: Interceptor Class - Ultra-fast small combat ship
- **Unique Technology**: Barrel Roll Thrusters - Allows ships to dodge beam weapons

## AI Behavior

### Personality Archetype
Honorable Militarist (matches MOO1 Alkari — aggressive in combat but honor-bound; will not betray allies or attack without cause)

### Diplomatic Tendencies
- **Natural Allies**: Ferrets (mutual respect for hunters), Guinea Pigs (honor-bound warriors)
- **Natural Enemies**: Chameleons (dishonorable tactics — Honorable races react strongly to betrayal and sabotage), Ants (incomprehensible collectivism)
- **Trade Behavior**: Fair but uninterested in economics
- **Treaty Reliability**: Very High — honor is everything; breaking promises is anathema

### Strategic Priorities
1. Build superior combat fleet
2. Seek out and engage enemy ships
3. Moderate expansion (quality colonies over quantity)
4. Research ship weapons and defenses
5. Maintain small but elite empire

### War Behavior
Highly aggressive in space combat. Seeks out enemy fleets for direct engagement. Poor at planetary invasion. Prefers to bomb planets from orbit rather than ground assault. Will accept honorable surrender.

## Flavor & Personality

### Leader Names
*Aeronautical and wind-themed*
- Males: Skydancer, Cloudstriker, Windcaller, Galeforce, Stormwing
- Females: Breezewhisper, Draftrider, Updraft, Skyweaver, Zephyr
- Titles: Wing Commander, Sky Marshal, Fleet Ace

### Ship Names
*Flight and aerial combat themed*
- FAS (Free Aeria Ship) Talon, Wingspan, Thermal, Altitude
- FAS Dive, Roll, Loop, Spiral, Barrel
- FAS Contrail, Slipstream, Jetstream, Thunderhead

### Planet Names
*Height and sky themed*
- New Aeria, Skyreach, Cloudtop, Summit, Zenith
- Altitude-I, Altitude-II, Altitude-III
- Updraft, Downdraft, Crosswind

### Quotes & Personality
**When greeting player:**
> "We acknowledge your presence in our skies. Prove yourself worthy, and we may call you ally."

**When declaring war:**
> "You have challenged our mastery of the void. We accept. Meet us in battle, and let skill decide the victor!"

**When forming alliance:**
> "You have earned your wings. Together, our fleets will be unstoppable!"

**When betraying player:**
> "The winds have changed direction. Your flight ends here."

**When defeated:**
> "We fall... with grace. Your pilots are... exceptional. The sky... remembers..."

## Design Notes
Budgies are the "ace pilot" race - devastating in space combat but weak everywhere else. Their terrible ground combat makes invasion difficult, so they rely on bombing and blockades.

Design intent: High-risk, high-reward gameplay. Dominate in fleet battles but struggle with expansion and planetary management. Perfect for players who love tactical combat.

Their weakness to ground invasion means they must maintain fleet superiority at all times. Losing space superiority is catastrophic for Budgies.

Balance consideration: Their ship combat bonus is huge (+50%) but offset by production penalty and ground combat weakness. They can't hold what they conquer easily.

---

## Repurposed Ancient Technology
Budgies believe the Habitrail tubes were clearly designed as three-dimensional flight training courses. They've converted them into the most complex pilot training simulators in the galaxy. They view the exercise wheels as "primitive attempts at understanding circular flight patterns" and study them intensely to perfect their barrel rolls.

## Species-Specific Mechanics (Formulas)

### Budgie Interactions
Budgies respect military strength. Their diplomatic relationship with other empires is directly modified by relative fleet power.
- **Respect Modifier**: `Respect_Score = (Your_Fleet_Power / Budgie_Fleet_Power) * 20` (Capped at +40).
- If your fleet power is less than 50% of theirs, they apply a `-20` "Disdain" penalty to relations.
- **Honorable Duel**: If you defeat a Budgie fleet in combat without retreating, you gain an immediate `+15` relation boost ("Warrior's Respect").

### Budgie Combat Initiative & Defense
In tactical combat, turn order (Initiative) is determined for each ship.
- **Initiative Formula**: `Initiative = Base_Ship_Speed + Computer_Level + Racial_Initiative_Bonus`
- **Budgie Initiative Algorithm**: Budgies receive a flat `+3` Racial_Initiative_Bonus to all ships. While they do not have an absolute "always first" First Strike like Ferrets, this massive initiative boost means Budgies will almost always move and fire before non-Ferret opponents of equivalent or slightly higher technology.
- **Defense Bonus**: Budgie ships add `+3` to their Defense rating (dodge chance against beam weapons) due to erratic, three-dimensional flight patterns.
