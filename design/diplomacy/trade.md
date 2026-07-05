# Trade & Resource Exchange

## Overview
Trade agreements generate income and enable technology exchanges. Crucial for diplomatic and economic strategies.

---

## Trade Agreements

**Establishing Trade**:
- Requires: Neutral or better relations
- Cost: Free (mutual benefit)
- Income: +5-50 BC/turn (based on economies)

**Income Calculation**:
Base = (Your Production + Their Production) / 20
Modified by:
- Trade routes (hyperspace lanes)
- Distance penalty (-10% per 20 parsecs, bounded to a max penalty of -50% at 100+ parsecs)
- Pirates (-20% to -50% if present, see formula below)

**Example**:
- Your empire: 1000 BC/turn production
- Their empire: 800 BC/turn
- Total: 1800 / 20 = 90 BC/turn each
- Distance 40 parsecs: -20% = 72 BC/turn each

**Hamsters**: +25% trade income (Trade Hub ability — matches MOO1 Human trade curve shift of +25%)

---

## Technology Trading

**Requirements**:
- Trade agreement active
- Friendly relations (+50+)
- Neither at war

**Negotiation**:
- Offer one of your techs
- Request one of theirs
- AI evaluates value
- Adjust with BC if unequal

**Tech Value Factors**:
- Research cost (higher = more valuable)
- Military advantage
- Uniqueness
- Current need

**Tech Value Conversion Formula**:
`Trade_Value = Base_RP_Cost * (1.0 + (Tech_Tier * 0.1)) * Needs_Multiplier`
*   **Base_RP_Cost**: Base research points required for the tech.
*   **Tech_Tier**: Level of the tech (1 to 50).
*   **Needs_Multiplier**: 1.5 if the receiving AI lacks the prerequisite in that field, 0.5 if they already have superior tech in that category.

**Fair Trades**:
- Similar RP cost techs
- Weapon for weapon
- Defense for defense
- Can sweeten with BC

**AI Willingness**:
- Rats: Eager (science cooperation)
- Mice: Interested (tech sharing)
- Guinea Pigs: Never (military advantage)
- Chameleons: Prefer stealing

---

## Resource Trading

**Food Surplus**: 
- Can export to starving colonies
- +BC income: `1 Surplus Food = 0.5 BC` (MOO1 standard conversion)
- Prevents rebellion

**Minerals**:
- Cannot trade directly
- But Rich worlds attract traders
- **Rich World Trade Bonus**: Planets with "Rich" status add a `+25%` multiplier to their individual production contribution to the empire's total trade base. "Ultra-Rich" adds `+50%`.

**Technology**:
- Primary trade good
- Most valuable exchange

---

## Trade Routes

**Hyperspace Lanes (Trade Route Pathfinding)**:
- Trade flows through logical space lanes drawn between the two empires.
- **Algorithm**: 
  1. Identify the closest pair of colonies (one from Empire A, one from Empire B).
  2. Draw a straight line segment between these two colonies.
  3. **Hostile Blockade Check**: Check if the line segment passes within 3 parsecs of any colony owned by a hostile third-party empire (an empire at war with A or B).
  4. If blocked, check the next closest pair of colonies. Repeat up to 3 pairs.
  5. If all paths are blocked, the trade route is considered **Blockaded** and generates 0 BC until the blockade is cleared.
- Can be blockaded by enemy fleets (if an enemy fleet is stationed on any star along the route).
- Pirates target trade routes along these specific drawn lines.

**Protection**:
- Station fleets on trade lanes
- Convoy escorts
- Anti-pirate patrols

**Disruption**:
- Wartime tactic
- Blockade enemy trade
- Economic warfare

---

## Pirates & Space Monsters

**Pirates** (early game):
- Attack trade convoys
- Reduce income 20-50%
- Clear with military fleets

**Pirate Algorithm**:
- **Spawn Chance**: `Pirate_Spawn_% = (Total_Trade_Volume / 1000) * (Unpatrolled_Route_Length / Total_Route_Length)`
- **Clarification**: "Unpatrolled" refers *only* to the specific trade route itself. A section of the route is considered "patrolled" if a friendly military fleet is stationed within 5 parsecs of that segment. It does not refer to the entire galaxy map.
- Maximum spawn chance is 10% per turn per trade route.
- **Effect**: If pirates spawn, they inflict a `Base -30%` penalty to the trade route's income.
- **Countermeasure**: Stationing a military fleet on the route reduces the penalty by `5% per military ship`, up to complete mitigation (0% penalty).

**Space Monsters**:
- Block trade routes
- Must defeat to restore trade
- Rare but devastating

---

## Trade Strategy

**Economic Hamsters**:
- Maximum trade agreements
- +25% bonus = significant income advantage
- Peaceful expansion funded by trade

**Ants Production**:
- Trade less important (self-sufficient)
- But value tech trades
- Fair exchanges only

**Chameleons**:
- Pretend to trade
- Actually steal technology
- Unreliable partners

---

## Trade Sanctions

**Council Action**: Vote to sanction race
- All trade with target banned
- Diplomatic pressure

**Sanction Penalty Logic**:
- Income reduction: `Sanction_Penalty_% = (Votes_For_Sanction / Total_Galactic_Votes) * 50%`
- This penalty applies globally to the target's net planetary production (representing embargoed goods and supply chain collapse).
- Minimum penalty: 15%. Maximum: 50%.

**Breaking Sanctions**: -30 relations all races

---

Trade & diplomacy complete! Full diplomatic system documented.
