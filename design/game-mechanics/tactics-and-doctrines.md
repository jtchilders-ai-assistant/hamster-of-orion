# Strategic Doctrines & Tactical Mechanics

## Overview

This document specifies advanced combat tactics, fleet doctrines, planetary conquest tech-stealing formulas, turtling defense math, Orion Guardian battle strategies, and interplanetary reserve operations in **Hamster of Orion**, directly derived from Master of Orion 1 reference guides.

**References:**
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)
- [StrategyWiki MOO1 Tactics Reference](file:///Users/jchilders/mywork/hamster-of-orion/reference/strategywiki-moo1.txt)
- [Planetary Controls Explained PDF](file:///Users/jchilders/mywork/hamster-of-orion/design/Master%20of%20Orion%20Planetary%20Controls%20Explained.pdf)
- [Combat Algorithm Spec](file:///Users/jchilders/mywork/hamster-of-orion/design/ships/combat-algorithm.md)

---

## 1. Fleet Combat Doctrines & Tactics

### 1.1 Missile vs Beam Warfare Doctrines
- **Missile Kiting Doctrine**:
  - Equipping Small or Medium ships with long-range Hyper-V / Hyper-X missile launchers and high-tier engines.
  - Ships fire initial missile salvo on Turn 1, move backward along the combat grid to stay outside enemy beam range, and wait for missile detonation.
  - Fast missile ships retreat once ammunition is exhausted to prevent ship loss.
- **Beam Rush & Shield Disruption Doctrine**:
  - Heavy Cruisers and Dreadnoughts equipped with Class V+ Deflector Shields, Heavy Lasers / Disruptors, and Battle Computers.
  - Advance directly toward target, strip enemy shields using Disrupters, and destroy high-value target stacks at point-blank range.
- **Scout Spam Counter-Tactic**:
  - Constructing hundreds of 1-cost Small Scout ships to draw enemy missile fire and absorb initial alpha-strikes, protecting high-cost Capital Hulls behind a screen of expendable decoys.

---

## 2. Guardian of Orion Defeat Mechanics

### 2.1 Guardian Boss Stats
- **Hull HP**: 32,000 HP (Normal difficulty) up to 48,000 HP (Impossible difficulty).
- **Armament**: Stellar Converter (massive damage), Heavy Plasma Cannons, Lightning Shield, Auto-Repair system (+10% HP restored per turn), High-Tier Target Computer and ECM.

### 2.2 Winning Battle Strategies
1. **Hyper-X Missile Overload**: Deploying 500+ Small scout ships equipped with Hyper-X missiles. The sheer volume of incoming warheads overwhelms the Guardian's point-defense and shield absorption in a single turn.
2. **Heavy Disrupter Kiting**: Utilizing Large hulls with high combat speed and Heavy Disrupters to stay outside Plasma Cannon range while stripping Guardian shields over multiple turns.

---

## 3. Planetary Invasion & Tech Capture Formulas

### 3.1 Ground Combat Resolution
Ground combat occurs when troop transports land on an enemy colony surface.
$$Power_{Attacker} = Troops_{Attacking} \times Roll(1, 100) \times Multiplier_{Race} \times Bonus_{Armor}$$
$$Power_{Defender} = (Population_{Defending} + Base_{Defenses}) \times Roll(1, 100) \times Multiplier_{Race} \times Bonus_{Armor}$$

### 3.2 Tech Capture Probability
When an enemy colony is successfully conquered by ground troops:
- If the defender possesses technologies unknown to the attacker, the attacker captures **exactly 1 unresearched technology**.
- **Probability of Tech Theft**: $100\%$ on first colony conquest if unknown techs exist.
- **Tech Selection**: Chosen randomly from the defender's known tech list up to the defender's maximum tech level in that field.

---

## 4. Interplanetary Reserve & Slider Overflow Operations

### 4.1 Planetary Reserve Fund
- Excess production allocated to the `Res` (Reserve) slider is deposited into the Empire Treasury (Interplanetary Reserve).
- Reserve BC can be injected directly into any colony to boost local production at a $1:1$ ratio (up to max colony BC transfer limit per turn).

### 4.2 Factory Overflow Mechanics
- Based on [Planetary Controls Explained PDF](file:///Users/jchilders/mywork/hamster-of-orion/design/Master%20of%20Orion%20Planetary%20Controls%20Explained.pdf):
- When a colony reaches its maximum factory capacity, any surplus BC allocated to the `Ind` slider automatically overflows into the Empire Reserve at $100\%$ efficiency, preventing wasted production.
