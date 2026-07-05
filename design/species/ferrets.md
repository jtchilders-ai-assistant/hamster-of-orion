# Ferrets

## Physical Description
Sleek, elongated bodies built for speed and agility. Sharp teeth and retractable claws. Keen predatory senses - can detect the faintest energy signatures. Eyes that track movement with unsettling intensity. Natural hunters adapted for space warfare.

## Biology & Habitat
- **Homeworld**: Mustela (Temperate world with vast plains and underground warrens)
- **Environment Preference**: Moderate climates, open hunting grounds
- **Lifespan**: 10 years (natural), extended through genetic optimization
- **Reproduction**: Controlled breeding programs to maintain predatory instincts

## Culture & Society
### Core Values
Precision. Patience. The perfect strike. "A true hunter needs only one shot." Take pride in lethal efficiency. Death should be quick, clean, professional. Suffering is wasteful.

### Government Type
Military aristocracy based on confirmed kills. The "Apex Council" consists of the deadliest weapons officers and ship commanders. Leadership earned through combat accuracy.

### Philosophy on War
War is hunting elevated to galactic scale. Enemy ships are prey. Every engagement is an opportunity to demonstrate superiority. Fight smart, strike hard, finish quickly. Never waste ammunition.

### View of Other Races
Evaluate all beings as potential prey or threats. Respect Budgies as fellow hunters (different medium). Contemptuous of Guinea Pigs' brutality (inelegant). Disturbed by Rabbits (too many targets, no satisfaction). Professional rivalry with Chameleons.

## Gameplay Mechanics

### Racial Bonuses
- **Production**: +0% (balanced)
- **Research**: +10% (focused on weapons technology)
- **Food**: +5% (efficient carnivores)
- **Growth**: +0% (balanced)
- **Ground Combat**: +15% (deadly commandos)
- **Ship Combat**: +30% (superior weapon accuracy)
- **Espionage**: +10% (patient stalkers)
- **Diplomacy**: -30% (catastrophic predatory instincts — matches MOO1 Mrrshan as worst-relations race in the galaxy)
- **Starting Relations**: Blood Enemies with most races — nearly all civilizations begin at maximum distrust; war is almost inevitable early game

### Special Abilities
- **Deadly Accuracy**: All weapons gain +4 Attack Levels (equivalent to 4 tiers of targeting computers) — increases hit chance, not raw damage
- **First Strike**: Ferret ships fire first in combat, often destroying enemies before they can respond
- **Hunter's Instinct**: Can detect cloaked/hidden enemy ships more easily
- **Efficient Killers**: Ships cost 10% less to build (streamlined weapon systems)

### Starting Technologies
- Nuclear Engines
- Laser Cannon (better starting weapons)
- Battle Scanner
- Class I Shield

### Unique Units/Buildings/Technologies
- **Unique Building**: Hunter's Lodge - Trains elite weapon specialists, ships built here have accuracy bonus
- **Unique Ship**: Stalker Class - Fast attack ship with devastating alpha strike
- **Unique Technology**: Predictive Targeting - Weapons automatically lead targets, +50% hit chance

## AI Behavior

### Personality Archetype
Ruthless Militarist / Diplomatically Catastrophic (matches MOO1 Mrrshan — worst diplomatic relations in the galaxy)

### Diplomatic Tendencies
- **Natural Allies**: Budgies (grudging respect), Guinea Pigs (useful blunt instrument)
- **Natural Enemies**: Essentially everyone — Ferrets are blood enemies with most races; Rabbits (prey instinct), Chameleons (dishonorable), Hamsters (weakness), Ants (alien), Hermit Crabs (prey)
- **Trade Behavior**: Rarely trades — prefers to take what it wants
- **Treaty Reliability**: Low — pragmatic, will break if clear advantage; diplomatic isolation means treaties rarely form anyway

### Strategic Priorities
1. Research superior weapons technology
2. Build small but lethal fleet
3. Pick off weak targets opportunistically
4. Expand through surgical strikes
5. Maintain technological edge in weapons

### War Behavior
Surgical and devastating. Strikes weak points with overwhelming force. Prefers ambush tactics. Excellent at hit-and-run raids. Focuses on destroying enemy fleets rather than capturing territory. Will disengage if odds aren't favorable.

## Flavor & Personality

### Leader Names
*Predatory and sharp*
- Males: Fang, Talon, Blade, Strike, Hunter
- Females: Slash, Pierce, Venom, Shadow, Razor
- Titles: Huntmaster, Apex Predator, First Strike

### Ship Names
*Lethal and precise*
- FHS (Ferret Hunter Ship) Fang, Claw, Bite, Rend, Strike
- FHS Precision, Accuracy, Lethality, Elimination
- FHS Silent Death, Quick Kill, Clean Cut, Final Strike

### Planet Names
*Hunting and territory themed*
- New Mustela, Hunting Ground Alpha, Kill Zone 7
- Prey-World, Stalking Ground, Ambush Point
- Territory-[Number], Claim-[Letter]

### Quotes & Personality
**When greeting player:**
> "We acknowledge your presence. You are... not prey. Yet. Tread carefully in our territory."

**When declaring war:**
> "You have entered our hunting ground. You are now prey. We suggest you run. It makes the hunt more interesting."

**When forming alliance:**
> "An alliance. Practical. Together we shall hunt bigger prey. Try not to get in our line of fire."

**When betraying player:**
> "You've grown weak. Complacent. A predator knows when prey is vulnerable. Nothing personal. Just... instinct."

**When defeated:**
> "Impossible... we were the hunters... how did we become... the prey? [snarling] At least... make it quick..."

## Design Notes
Ferrets are the "weapon specialist" race - devastating damage output but must play smart. Their accuracy and damage bonuses make them lethal in combat, but they're not numerous enough to win through attrition.

Design intent: High-skill gameplay. Requires good tactical positioning and target prioritization. Glass cannon - deadly but vulnerable if caught. Perfect for players who love tactical combat.

Their attack bonuses (+4 Attack Levels from Deadly Accuracy, First Strike ability) make them arguably the best combat race in a straight fight, but their small empire size means they can be overwhelmed by numbers.

Balance consideration: Extremely powerful in small engagements due to superior hit rates, vulnerable to swarm tactics. Must maintain technological edge and pick battles carefully. Cannot afford prolonged wars of attrition.

Key weakness: Low population tolerance for casualties. A pyrrhic victory is still a loss for Ferrets. Must win decisively or disengage.

---

## Repurposed Ancient Technology
Ferrets have studied Ancient facilities with predatory intensity. Their conclusion: the Ancient Ones were apex predators who hunted across dimensions before transcending physical form.

The Habitrail tubes are obviously pursuit corridors for hunting prey through multiple dimensions. The exercise wheels test prey's endurance before the kill. The food dispensers are traps for unwary creatures.

Ferrets have incorporated Ancient targeting systems into their weapons technology, achieving accuracy the original builders never intended. "We are better hunters than even the Ancient Ones. When we reach Orion, we will prove it."

## Species-Specific Mechanics (Formulas)

### Ferret First Strike & Initiative
In tactical combat, turn order (Initiative) determines who moves and fires first.
- **Initiative Formula**: `Initiative = Base_Ship_Speed + Computer_Level + Racial_Initiative_Bonus`
- **Ferret First Strike Algorithm**: Ferrets possess a unique "always fire first" First Strike capability. In the combat code, Ferret ships bypass the standard Initiative sorting for the first round of engagement, guaranteeing they act before all non-Ferret ships regardless of enemy speed or computer level. If both sides are Ferrets, standard Initiative sorting is used between them.
- **Retreat Logic**: If Ferret fleet power drops below 30% of the enemy's present fleet power in combat, their ships gain a `+50%` chance to successfully retreat before taking damage.
