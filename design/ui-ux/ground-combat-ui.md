# Ground Combat UI

**Created:** 2026-04-13  
**Reference:** Master of Orion (1993) Ground Combat Screen  
**MOO1 Screenshots:** None available — documented from MOO1 strategy guide and gameplay descriptions

---

## Overview

Ground combat occurs when your fleet successfully reaches an enemy-controlled planet (after winning or bypassing the space battle phase). It is a **modal, non-interactive resolution screen** — the player watches the combat play out with animated rolls and casualty displays, then is presented with the result.

MOO1's ground combat is deliberately streamlined: no hex grid, no unit positioning. Troops vs. population, modified by tech bonuses, resolved in rounds.

---

## 1. Ground Combat Trigger

Ground combat is initiated from the **Bombardment / Invasion decision screen** (which follows space combat victory):

```
╔════════════════════════════════════════════════════════════╗
║           INVASION READY: New Hamsterton                  ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  Planet defenses cleared. Ready to invade?                  ║
║                                                             ║
║  Your Troops Available:  12 (from transport ships)          ║
║  Estimated Defenders:    ~8 (population + garrison)         ║
║                                                             ║
║  ┌─Troops─to─Deploy─────────────────────────────────────┐  ║
║  │                                                       │  ║
║  │  Invading:  [  12  ] troops    (max: 12)              │  ║
║  │             [──────────────────────────]              │  ║
║  │  Remaining: [   0  ] troops    (held in reserve)      │  ║
║  │                                                       │  ║
║  └───────────────────────────────────────────────────────┘  ║
║                                                             ║
║  Minimum to invade: 1 troop                                 ║
║                                                             ║
║         [LAUNCH INVASION]         [CANCEL]                 ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

**Notes:**
- Troops are simply your population that have been sent to an enemy planet via the Transport slider on the planet screen. No specialized transport ships need to be built.
- The slider lets players hold some troops in reserve (in case of failure).
- CANCEL returns to the Bombardment screen without attacking.

---

## 2. Ground Combat Resolution Screen

After launching an invasion, the ground combat screen displays. This is **non-interactive** — the player watches rounds resolve automatically.

### Full Screen Layout

```
╔════════════════════════════════════════════════════════════╗
║               GROUND COMBAT — New Hamsterton              ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║   ┌─ATTACKERS (YOU)──────────┐  ┌─DEFENDERS (ENEMY)──────┐ ║
║   │                          │  │                        │ ║
║   │   [Your Race Portrait]   │  │   [Enemy Race Portrait]│ ║
║   │     Hamster Empire       │  │     Guinea Pig Raiders │ ║
║   │                          │  │                        │ ║
║   │   Troops:  12            │  │   Troops:   8          │ ║
║   │   Bonus:  +20% (tech)    │  │   Bonus:  +10% (fort.) │ ║
║   │                          │  │                        │ ║
║   │   ████████████  12/12    │  │   ████████   8/8       │ ║
║   │   (troops bar)           │  │   (defenders bar)      │ ║
║   └──────────────────────────┘  └────────────────────────┘ ║
║                                                             ║
║   ══════════════════  ROUND 1  ══════════════════           ║
║                                                             ║
║   [    ANIMATED DICE ROLL / COMBAT ANIMATION    ]           ║
║                                                             ║
║   Attacker Roll: 87  (67 + 20 tech bonus)                   ║
║   Defender Roll: 53  (43 + 10 base bonus)                   ║
║                                                             ║
║   ─────────────────────────────────────────────────────    ║
║                                                             ║
║   Casualties this round:                                    ║
║   • Attackers lost:  2 troops   (10 remaining)             ║
║   • Defenders lost:  3 troops   ( 5 remaining)             ║
║                                                             ║
║   [Continue ▶]  (or auto-advance after 1.5s)               ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

### Round-by-Round Display

Each round:
1. Animated dice icons tumble (0.5–1.5s depending on speed setting)
2. Rolls appear as numbers
3. Casualty calculation shown
4. Troop bars update (shrink from right as troops are lost)
5. Round number increments
6. Auto-advances after delay OR player clicks [Continue ▶]

**Troop bars:**
```
Attackers: ████████████████████████ 12/12  (full, green)
           ██████████████████       9/12   (partial, green)
           ████████████             6/12   (half, yellow)
           ██████                   3/12   (low, red)
```

### Speed Control
```
┌─Combat─Speed──────────────┐
│ ( ) Slow (watch all rolls) │
│ (•) Normal                 │
│ ( ) Fast (quick summary)   │
│ ( ) Instant (result only)  │
└────────────────────────────┘
```

---

## 3. Combat Mechanics (Visual Representation)

### Attack Bonuses Shown
The UI displays the combat modifiers each side has:

| Modifier | Attacker | Defender |
|----------|----------|----------|
| Base combat | 1 die/troop | 1 die/troop |
| Ground combat tech | +% bonus | — |
| Barracks building | — | +% bonus |
| Fortified planet | — | +% bonus |
| Race bonus (Warlords) | +% bonus | +% bonus |

These bonuses are shown as `+N%` next to the troop count in the portrait panels.

### Dice Roll Mechanic (MOO1 Math)
- Ground combat is resolved in a series of 1-on-1 attacks until one side has been completely eliminated.
- **Roll Formula:** Each attack consists of a roll of `1d100` made by each side.
- **Bonuses:** The race's current best ground combat technology bonuses for weapons, armor, and personal shields are added to their respective rolls.
- **Racial Advantage:** The Bulrathi receive an automatic `+20` to all ground combat rolls.
- **Resolution:** The highest total score wins the attack, killing off `1` unit of the loser's population. In the case of a tie, both sides lose `1` unit.
- **Capture Threshold:** The planet is captured when the defending troops are reduced to `0` and the attacker has at least `1` troop remaining. If both sides are simultaneously reduced to `0` (via a tie on the last troops), the invasion fails and the planet remains with the defender, though empty of population.

*(Note: To save time in the UI for large battles, the system rapidly calculates the series of 1-on-1 attacks and displays them in batched round summaries, showing the net casualties of multiple rolls at once.)*

---

## 4. Ground Combat Result Screens

### 4.1 Victory — Planet Conquered

```
╔════════════════════════════════════════════════════════════╗
║               PLANET CAPTURED!                            ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║   🌍  New Hamsterton is now yours!                          ║
║                                                             ║
║   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                             ║
║   Final Casualties:                                         ║
║   • Your losses:    4 troops                               ║
║   • Enemy losses:   8 troops  (all defenders eliminated)   ║
║                                                             ║
║   Planet Status:                                            ║
║   • Surviving Population: 22M  (transferred to your rule)  ║
║   • Factories intact:     180  (some destroyed in combat)  ║
║   • Missile Bases:          0  (cleared by bombardment)    ║
║                                                             ║
║   ┌─Conquest─Options──────────────────────────────────┐   ║
║   │                                                    │   ║
║   │  [COLONIZE]  — Absorb planet into your empire     │   ║
║   │               Population joins your empire         │   ║
║   │               Standard production immediately     │   ║
║   │                                                    │   ║
║   │  [ENSLAVE]   — Use population as slave labor      │   ║
║   │               +50% factory output                 │   ║
║   │               -30 relations ALL empires (atrocity) │   ║
║   │               (if race trait allows)               │   ║
║   │                                                    │   ║
║   └────────────────────────────────────────────────────┘   ║
║                                                             ║
║                   [COLONIZE] (default, ENTER)              ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

**Conquest option notes:**
- **COLONIZE**: Standard conquest. Population joins your empire. Morale penalty for first N turns (occupation).
- **ENSLAVE**: Available only to races with slavery trait. Diplomatic penalty is severe.
- Some races may have additional options (e.g., Assimilation if tech unlocked).

### 4.2 Defeat — Invasion Repelled

```
╔════════════════════════════════════════════════════════════╗
║               INVASION REPELLED!                          ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║   Your troops were defeated at New Hamsterton.             ║
║                                                             ║
║   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                             ║
║   Final Casualties:                                         ║
║   • Your losses:    12 troops (all troops lost)            ║
║   • Enemy losses:    5 troops  (3 defenders remain)        ║
║                                                             ║
║   Planet Status:                                            ║
║   • New Hamsterton remains under Guinea Pig control        ║
║   • Defenders: 3 remaining troops                          ║
║                                                             ║
║   Your fleet remains in orbit. You may:                    ║
║   • Continue bombardment to soften defenses                ║
║   • Retreat your fleet                                     ║
║   • Await reinforcements before invading again             ║
║                                                             ║
║         [RETURN TO BOMBARDMENT]    [RETREAT FLEET]         ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

### 4.3 Pyrrhic Victory (Won but badly damaged)

If invasion succeeds but with heavy casualties:

```
║   ⚠️  COSTLY VICTORY                                        ║
║   New Hamsterton captured, but at great cost.              ║
║                                                             ║
║   Your losses: 10 of 12 troops                             ║
║   Defenders eliminated: 8 of 8                             ║
║                                                             ║
║   Recommendation: Build more troops before next invasion.  ║
```

---

## 5. Post-Combat: New Colony Integration

After a successful COLONIZE, the captured planet transitions immediately into your empire:

- Galaxy map shows your colony color
- Planet appears in PLANETS screen (F2) on next turn
- Production sliders reset to default allocation
- Build queue: empty (player must set)
- Morale: Low for 3–5 turns (conquered population penalty)
- Notification at start of next turn: "New Hamsterton is now producing for your empire"

---

## 6. Troop Sources and Transports

### How Troops Get There
In Master of Orion 1, troops are not separate military units and you do not build "Transport Ships" at a shipyard. Troops are simply your planet's **population**. 

To invade, you go to the Planet screen of one of your colonies, select the **Transport** option, and select how many millions of population to send, targeting the enemy planet.
These population units fly across the map as transport fleets. If they arrive at an enemy planet, they act as invading troops in Ground Combat. 

- Each 1 million population = 1 troop.
- Transport fleets move at a speed determined by your current engine technology.
- If they arrive at a friendly planet, they merge into the population.
- If they arrive at an enemy planet, Ground Combat begins (if space defenses are cleared).

---

## 7. Related Screens

| Screen | Trigger | File |
|--------|---------|------|
| Bombardment UI | After space combat win, before invasion | `tactical-combat-ui.md` §Planet Bombardment |
| Fleet Deployment | Deploying transport-carrying fleet | `main-screens.md` §2 Fleet Deployment |
| Tactical Space Combat | Space battle before invasion | `tactical-combat-ui.md` |
| New Colony Screen | After successful colonization | `main-screens.md` §9 |

---

*Document created: 2026-04-13*  
*MOO1 reference: Strategy guide ground combat rules + MOO1 gameplay*
