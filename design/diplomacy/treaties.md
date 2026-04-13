# Treaties & Diplomatic Relations

## Overview
Negotiate treaties with other races to secure peace, trade benefits, or military alliances. Each race has unique diplomatic tendencies based on their personality.

---

## Diplomatic States

> **⚠️ INTENTIONAL DESIGN DECISION — 5 states vs MOO1's 17 states.**
>
> MOO1 used 17 named relationship states (Harmony, Unity, Friendly, Peaceful, Affable, Calm,
> Amiable, Relaxed, Neutral, Unease, Wary, Restless, Tense, Troubled, Discord, Hate, Feud)
> with specific numeric ranges. HoO deliberately collapses these into 5 coarser states for
> clarity and simplicity. The underlying -100 to +100 numeric scale is identical to MOO1;
> only the number of named bands differs.
>
> **Why 5 states:** Playtesting found 17 states created UI noise — players struggled to
> distinguish "Affable" from "Amiable" from "Calm." Five states communicate the diplomatic
> situation at a glance. Flavor text and mood icons compensate for reduced granularity.
>
> **MOO1 flavor name reference (UI only — optional future enhancement):**
>
> | HoO State | MOO1 Equivalent Names | HoO Range |
> |-----------|----------------------|----------|
> | War (Hostile) | Feud / Hate / Discord | -100 to -50 |
> | Unfriendly (Cold) | Troubled / Tense / Restless / Wary | -49 to -1 |
> | Neutral (Cautious) | Unease / Neutral / Relaxed | 0 to +49 |
> | Friendly (Warm) | Amiable / Calm / Affable / Peaceful | +50 to +79 |
> | Allied (United) | Friendly / Unity / Harmony | +80 to +100 |

### War (Hostile)
**Relations**: -100 to -50
**Trade**: Forbidden
**Effects**: 
- Fleets attack on sight
- Can invade colonies
- Technology theft easier
- Other races may intervene

**How to End**: Peace treaty negotiation

### Unfriendly (Cold)
**Relations**: -49 to -1
**Trade**: Limited
**Effects**:
- Border tensions
- Espionage common
- Alliance requests rejected
- May declare war suddenly

**How to Improve**: Tributes, trade agreements, time

### Neutral (Cautious)
**Relations**: 0 to +49
**Trade**: Available
**Effects**:
- Standard diplomatic options
- Will trade basic tech
- May accept non-aggression pact
- Unlikely to attack unprovoked

**Starting State**: Most races (except natural enemies)

### Friendly (Warm)
**Relations**: +50 to +79
**Trade**: Generous
**Effects**:
- Technology sharing
- Military coordination
- Will warn of dangers
- May join your wars

**How to Achieve**: Treaties, gifts, common enemies

### Allied (United)
**Relations**: +80 to +100
**Trade**: Full access
**Effects**:
- Fight together
- Share intelligence
- Defensive pacts
- Council votes together

**How to Achieve**: Formal alliance treaty

---

## Treaty Types

### Peace Treaty
**Cost**: Variable (depends on war status)
**Duration**: Permanent (until broken)
**Effect**: End state of war
**Requires**: Both sides willing

**Breaking Peace**:
- -50 relations with all races
- "Treaty Breaker" reputation
- Diplomatic victory impossible for 50 turns

**Negotiation**:
- Winning side: Can demand tribute/territory
- Losing side: Must pay to end war
- Stalemate: Simple cessation

### Non-Aggression Pact (NAP)
**Cost**: Free (mutual agreement)
**Duration**: 20 turns minimum
**Effect**: Cannot declare war on each other
**Requires**: Neutral or better relations

**Benefits**:
- +10 relations
- Secure border
- Focus elsewhere
- Can still spy on each other

**Breaking NAP**:
- -30 relations all races
- "Untrustworthy" reputation
- Future treaties harder

### Trade Agreement
**Cost**: Free
**Duration**: Permanent
**Effect**: +BC per turn to both sides (ramps up over ~30 turns)
**Requires**: Neutral or better

**Benefits**:
- +5-50 BC/turn at full maturity (based on economies)
- +20 relations
- Technology trade enabled
- Mutual growth

**Hamsters**: +25% trade income (Trade Hub ability — matches MOO1 Human +25% trade curve shift)

**Trade Ramp-Up Mechanic** *(MOO1 mechanic, retained in HoO):*

Trade income is not immediate — it ramps up over ~30 turns as merchants establish routes, contacts, and supply chains. This matches MOO1's explicit design: "usually takes about 30 turns to start getting the maximum value."

```
TradeTurnProgress = min(TurnsActive, TRADE_RAMP_TURNS)
TradeIncome = BaseTradeIncome × (TradeTurnProgress / TRADE_RAMP_TURNS)
```

**Constants:**
- `TRADE_RAMP_TURNS` = 30
- `BaseTradeIncome` = (Production_A + Production_B) / 20

**Ramp table (as fraction of BaseTradeIncome):**

| Turns Active | Income % |
|-------------|----------|
| 1           | 3%       |
| 5           | 17%      |
| 10          | 33%      |
| 15          | 50%      |
| 20          | 67%      |
| 25          | 83%      |
| 30+         | 100%     |

**Re-negotiation resets the ramp:**
If a trade agreement is canceled and re-signed, `TurnsActive` resets to `floor(PriorTurns × 0.5)` (partial retention — existing relationships aren’t lost entirely, but route reconstruction takes time).

```
OnRenegotiate(prior_turns):
    TurnsActive = floor(prior_turns × RENEGOTIATION_RETENTION)
```

- `RENEGOTIATION_RETENTION` = 0.5 (50% progress retained)
- Full reset if agreement was broken (rather than renegotiated voluntarily): 0% retained

**Hamster trade bonus applies to the ramped income:**
```
HamsterTradeIncome = TradeIncome × 1.25
```

### Research Agreement
**Cost**: Free
**Duration**: 20 turns
**Effect**: +10% research both sides
**Requires**: Friendly or better

**Benefits**:
- Shared scientific knowledge
- +15 relations
- Tech trading easier
- Mutual advancement

**Rats**: Love these (science-focused)

### Military Alliance
**Cost**: Significant commitment
**Duration**: Until broken
**Effect**: Fight together in all wars
**Requires**: Friendly relations

**Benefits**:
- +50 relations
- Shared military intelligence
- Coordinated attacks
- Cannot be at war with each other

**Obligations**:
- Must join ally's wars
- Must defend ally if attacked
- Breaking alliance = -100 relations all races

**Strategic**:
- Guinea Pigs: Seek strong allies
- Hamsters: Natural alliance builders
- Chameleons: Rarely honor alliances

### Defensive Pact
**Cost**: Moderate commitment
**Duration**: 30 turns minimum
**Effect**: Mutual defense only
**Requires**: Friendly relations

**Benefits**:
- +30 relations
- Deterrent to aggression
- No offensive obligations

**Difference from Alliance**:
- Only triggers if attacked
- Don't join offensive wars
- Easier to negotiate

---

## Diplomatic Actions

### Demand Tribute
**Requires**: Superior military
**Effect**: Extort BC or tech from weaker race
**Relations**: -20 if accepted, -50 if rejected and you attack

**When to Use**:
- Overwhelmingly stronger
- Need quick resources
- Want to humiliate rival

**Risks**:
- Galaxy sees you as bully
- Victim seeks revenge later
- Other races may unite against you

### Offer Tribute/Gift
**Cost**: BC, tech, or planets
**Effect**: +10 to +50 relations (depends on value)

**When to Use**:
- Appease stronger neighbor
- Secure alliance
- Prevent war
- Improve reputation

**Hamsters**: Frequently give gifts (diplomatic)
**Guinea Pigs**: Never give gifts (warriors don't bribe)

### Technology Exchange
**Cost**: One of your techs
**Effect**: Receive one of their techs
**Requires**: Trade agreement

**Negotiation**:
- Offer tech of similar value
- AI evaluates fair trade
- Can sweeten deal with BC

**Chameleons**: Prefer stealing to trading
**Rats**: Eager to trade (science cooperation)

### Break Treaty
**Cost**: Massive relations penalty
**Effect**: Cancel any treaty
**Consequence**: "Treaty Breaker" reputation

**Reputation Damage**:
- -50 to -100 with all races
- Future treaties nearly impossible
- Diplomatic victory locked for 50+ turns

**When Justified**:
- Survival at stake
- Ally demands unreasonable war
- Strategic necessity

---

## Relations Modifiers

### Positive Modifiers
- Trade agreement: +20
- Research pact: +15
- Shared enemy: +30
- Gift/tribute received: +10 to +50
- Similar government: +10
- Hamster diplomacy bonus: +30

### Negative Modifiers
- At war: -100
- Border friction: -10 per contested system
- Spy caught: -20 per incident
- Treaty broken: -50 to -100
- Attacked ally: -75
- Different government: -5
- Racial hatred: -30 (Guinea Pigs vs Hamsters)

### Action-Based
- Destroyed planet: -50 (all races)
- Used bio-weapons: -75 (all races)
- Broke NAP: -30 (all races)
- Conquered homeworld: -100 (that race)

---

## First Contact

**Discovery**: When scouts meet
**Initial Relations**: Based on personalities
- Hamsters → Anyone: Neutral (+10 bonus)
- Guinea Pigs → Hamsters: Unfriendly (-20)
- Chameleons → Anyone: Neutral (plotting)
- Ferrets → Rabbits: Unfriendly (predator/prey)

**First Impressions Matter**:
- Aggressive posture: -20
- Friendly greeting: +10
- Gift: +20
- Threat: -30

---

## Reputation System

**Global Reputation Tracks**:
1. **Honorable** (keep treaties) vs **Treaty Breaker**
2. **Peaceful** (avoid wars) vs **Warmonger**
3. **Fair** (balanced trade) vs **Exploiter**
4. **Merciful** (accept surrenders) vs **Genocidal**

**Effects**:
- Honorable: +20 relations all races
- Treaty Breaker: -50 relations all races
- Warmonger: -30 relations peaceful races, +10 with aggressive races
- Genocidal: -75 relations all races (bio-weapons, planet destruction)

---

## AI Diplomatic Behavior by Race

**Hamsters (Peacemakers)**:
- Accept treaties easily
- Offer generous trades
- Forgive quickly
- Build alliance networks

**Guinea Pigs (Warriors)**:
- Reject peace unless losing badly
- Respect strength only
- Keep treaties (honor-bound)
- Demand tribute from weak

**Chameleons (Manipulators)**:
- Break treaties frequently
- Frame other races
- Backstab allies
- Trust no one

**Rats (Cooperators)**:
- Eager for research pacts
- Fair traders
- Logical negotiations
- Reliable allies

**Ferrets (Opportunists)**:
- Treaty as long as beneficial
- Quick to betray if advantage
- Respect other predators
- Prey on weakness

**Rabbits (Survivors)**:
- Accept any treaty for peace
- Terrified of strong neighbors
- Reliable (too scared to break treaties)
- Bribe aggressors

**Ants (Calculating)**:
- Treaties = efficiency calculations
- Perfectly reliable (no emotion)
- Fair trades only
- Confused by illogical diplomacy

**Hermit Crabs (Patient)**:
- Slow to trust
- Keep treaties forever
- Rarely initiate contact
- Defensive pacts preferred

**Mice (Pragmatic)**:
- Technology trading focus
- Reliable partners
- Calculate optimal alliances
- Update calculations regularly

**Budgies (Proud)**:
- Respect combat prowess
- Duel for honor
- Keep warrior's code
- Insult = war

---

Next: See `espionage.md` for spy operations.
