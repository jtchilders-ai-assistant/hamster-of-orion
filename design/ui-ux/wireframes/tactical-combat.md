# Tactical Combat UI - Detailed Wireframe Specification

## Overview

The Tactical Combat screen provides full player control over space battles in Hamster of Orion. This turn-based combat system features a hexagonal grid where players maneuver ship stacks, fire weapons, and issue retreat orders. The design faithfully recreates MOO1's tactical combat while enhancing clarity for modern web interfaces.

**Reference**: Master of Orion (1993) Tactical Combat Screen  
**Access**: Triggered when fleets meet or player attacks a system  
**Target Resolution**: 1920×1080 (scalable)

---

## Core Concepts

### MOO1 Combat Philosophy
- **Ship Stacks**: Ships of the same design are grouped and move together
- **Turn-Based**: Each stack acts once per combat round
- **Initiative Order**: Faster ships move first
- **Range Matters**: Weapons have effective ranges, accuracy drops with distance
- **Retreat Option**: Ships can attempt to flee the battle
- **Planetary Defense**: Missile bases and shields defend colonies

### Combat Arena
- **Grid Type**: Hexagonal (6 directions of movement)
- **Grid Size**: 16 × 10 hexes (standard MOO1 size)
- **Orientation**: Your ships start on the left, enemies on the right
- **Planet Position**: If present, centered in the grid

---

## Screen Layout: Pre-Battle Screen (Combat Initiation)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                    ⚔️ BATTLE IMMINENT! ⚔️                                         ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  Location: Alpha Centauri System                                            Year 2623 - Turn 42  ║
║  ═══════════════════════════════════════════════════════════════════════════════════════════════ ║
║                                                                                                   ║
║  ┌──YOUR FORCES────────────────────────────────┐   ┌──ENEMY FORCES───────────────────────────┐  ║
║  │                                              │   │                                         │  ║
║  │  ┌─────────────────────────────────────────┐│   │┌────────────────────────────────────┐  │  ║
║  │  │    ╔═══════════════════════════════╗    ││   ││   ╔═══════════════════════════╗    │  │  ║
║  │  │    ║        HAMSTERS               ║    ││   ││   ║      GUINEA PIGS          ║    │  │  ║
║  │  │    ║ ┌───────────────────────────┐ ║    ││   ││   ║ ┌─────────────────────┐   ║    │  │  ║
║  │  │    ║ │                           │ ║    ││   ││   ║ │                     │   ║    │  │  ║
║  │  │    ║ │      [Race Portrait]      │ ║    ││   ││   ║ │   [Race Portrait]   │   ║    │  │  ║
║  │  │    ║ │       - Hamster -         │ ║    ││   ││   ║ │   - Guinea Pig -    │   ║    │  │  ║
║  │  │    ║ │                           │ ║    ││   ││   ║ │                     │   ║    │  │  ║
║  │  │    ║ └───────────────────────────┘ ║    ││   ││   ║ └─────────────────────┘   ║    │  │  ║
║  │  │    ╚═══════════════════════════════╝    ││   ││   ╚═══════════════════════════╝    │  │  ║
║  │  └─────────────────────────────────────────┘│   │└────────────────────────────────────┘  │  ║
║  │                                              │   │                                         │  ║
║  │  FLEET: Battle Group Alpha                   │   │  FLEET: 2nd Strike Force               │  ║
║  │  ─────────────────────────────────────────  │   │  ────────────────────────────────────  │  ║
║  │                                              │   │                                         │  ║
║  │  Ship Composition:                           │   │  Ship Composition:                      │  ║
║  │  ┌─────────────────────────────────────────┐│   │┌────────────────────────────────────┐  │  ║
║  │  │ Design             │ Count │ Hull      │││   ││ Design             │Count│ Hull   │  │  ║
║  │  ├─────────────────────────────────────────┤│   │├────────────────────────────────────┤  │  ║
║  │  │ Cruiser "Sunflower"│   2   │ Cruiser   │││   ││ Dreadnought "Fist" │  1  │ Dread. │  │  ║
║  │  │ Dest. "Whiskers"   │   6   │ Destroyer │││   ││ Cruiser "Paw"      │  4  │ Cruiser│  │  ║
║  │  │ Fighter "Pellet"   │  12   │ Fighter   │││   ││ Fighter "Grunt"    │ 20  │ Fighter│  │  ║
║  │  └─────────────────────────────────────────┘│   │└────────────────────────────────────┘  │  ║
║  │                                              │   │                                         │  ║
║  │  Total Ships: 20                             │   │  Total Ships: 25                        │  ║
║  │  Fleet Strength: ★★★☆☆                      │   │  Fleet Strength: ★★★★☆                 │  ║
║  │                                              │   │                                         │  ║
║  │  Tactical Bonus:                             │   │  Tactical Bonus:                        │  ║
║  │  • Computer Tech +3                          │   │  • Ground Combat +25%                   │  ║
║  │  • Maneuverability +1                        │   │  • Attack Bonus +2                      │  ║
║  │                                              │   │                                         │  ║
║  └──────────────────────────────────────────────┘   └─────────────────────────────────────────┘  ║
║                                                                                                   ║
║  ┌──PLANET DEFENSES (if applicable)─────────────────────────────────────────────────────────────┐ ║
║  │                                                                                               │ ║
║  │  🌍 Planet: New Pigton (Guinea Pig Colony)                                                   │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────────   │ ║
║  │  Missile Bases: 8                  │  Planetary Shield: Class IV                             │ ║
║  │  Base Weapons: Fusion Beam, Merculite Missiles                                               │ ║
║  │  Population: 65M (will defend)     │  Ground Combat Strength: ★★★★★ (Guinea Pig bonus!)   │ ║
║  │                                                                                               │ ║
║  └───────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──BATTLE OPTIONS────────────────────────────────────────────────────────────────────────────┐  ║
║  │                                                                                             │  ║
║  │   ╔═══════════════════════════════╗  ╔═══════════════════════════════╗                    │  ║
║  │   ║   [⚔️ TACTICAL COMBAT]        ║  ║   [🎲 AUTO-RESOLVE]            ║                    │  ║
║  │   ║   Full player control         ║  ║   Quick AI-controlled battle  ║                    │  ║
║  │   ║   (Recommended)               ║  ║   (Higher casualty risk)      ║                    │  ║
║  │   ╚═══════════════════════════════╝  ╚═══════════════════════════════╝                    │  ║
║  │                                                                                             │  ║
║  │   ╔═══════════════════════════════╗                                                        │  ║
║  │   ║   [🏃 RETREAT]                ║   Escape Chance: 65%                                   │  ║
║  │   ║   Attempt to flee battle      ║   (Speed 4 vs Enemy Speed 3)                          │  ║
║  │   ╚═══════════════════════════════╝   ⚠️ Failed retreat: Trapped for 1 turn              │  ║
║  │                                                                                             │  ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Main Combat Arena (Standard View)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ ⚔️ TACTICAL COMBAT │ Alpha Centauri │ Round 3 of 50 │ Phase: MOVEMENT │ [?] Help  [⚙️] Options  ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║ ┌──INITIATIVE ORDER─────────┐  ┌──COMBAT ARENA (16×10 Hex Grid)────────────────────────────────┐ ║
║ │                           │  │                                                                │ ║
║ │  Round 3 Turn Order:      │  │  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                         │ ║
║ │  ─────────────────────    │  │   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                        │ ║
║ │  1. ▶[Y]Fighter ×12       │  │  ⬡ ⬡[Y]⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡[E]⬡ ⬡                        │ ║
║ │     Speed: 6 │ YOUR TURN  │  │   ⬡  12  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡  20  ⬡                       │ ║
║ │  2.  [E]Fighter ×20       │  │  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                         │ ║
║ │     Speed: 5              │  │   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                        │ ║
║ │  3.  [Y]Destroyer ×6      │  │  ⬡[Y]⬡ ⬡ ⬡ ⬡ ⬡ ⬢ ⬢ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡[E]                         │ ║
║ │     Speed: 4              │  │   ⬡ 6  ⬡ ⬡ ⬡ ⬡ ⬢🌍⬢ ⬡ ⬡ ⬡ ⬡ ⬡  4                          │ ║
║ │  4.  [E]Cruiser ×4        │  │  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬢ ⬢ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                         │ ║
║ │     Speed: 3              │  │   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                        │ ║
║ │  5.  [Y]Cruiser ×2        │  │  ⬡[Y]⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡[E]                         │ ║
║ │     Speed: 3              │  │   ⬡ 2  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡  1                          │ ║
║ │  6.  [E]Dreadnought ×1    │  │  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                         │ ║
║ │     Speed: 2              │  │   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                        │ ║
║ │                           │  │                                                                │ ║
║ │  ─────────────────────    │  │  Legend: [Y]=Your Stack  [E]=Enemy Stack  🌍=Planet           │ ║
║ │  [Y] = Your Ships (Green) │  │          ⬢=Shield Zone   ⬡=Empty Space    ##=Ship Count       │ ║
║ │  [E] = Enemy Ships (Red)  │  │                                                                │ ║
║ │  ▶ = Currently Acting     │  └────────────────────────────────────────────────────────────────┘ ║
║ │                           │                                                                     ║
║ └───────────────────────────┘                                                                     ║
║                                                                                                   ║
║ ┌──SELECTED STACK: Fighter "Pellet" ×12─────────────────────────────────────────────────────────┐ ║
║ │                                                                                                │ ║
║ │  Hull: Fighter │ Design: "Pellet Mk II" │ Count: 12 ships │ Experience: Veteran (+10% acc)   │ ║
║ │  ─────────────────────────────────────────────────────────────────────────────────────────── │ ║
║ │                                                                                                │ ║
║ │  STATS                           │  WEAPONS                        │  SPECIALS                │ ║
║ │  ════════════════════════════    │  ════════════════════════════   │  ═══════════════════════ │ ║
║ │  HP: 10/10 each                  │  🔫 Laser ×2                     │  • Inertial Stabilizer  │ ║
║ │  Shield: Class I (1 absorption)  │     Damage: 1-4                 │    +2 Defense           │ ║
║ │  Armor: Titanium                 │     Range: 1-4 hexes            │                          │ ║
║ │  Speed: 6 hexes/round            │     Status: READY               │  • Combat Speed +2      │ ║
║ │  Defense: +3                     │                                 │                          │ ║
║ │  Attack: +2                      │  No missiles equipped           │                          │ ║
║ │                                                                                                │ ║
║ │  Movement Remaining: 6 hexes     │  Can Attack: YES (has not fired)                           │ ║
║ │                                                                                                │ ║
║ └────────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║ ┌──COMMANDS────────────────────────────────────────────────────────────────────────────────────┐  ║
║ │                                                                                               │  ║
║ │  [🎯 MOVE]  [🔫 FIRE]  [⏭️ DONE]  [🔁 WAIT]  │  [🏃 RETREAT]  [⚙️ SPECIAL]  │  [⏩ AUTO]    │  ║
║ │                                                                                               │  ║
║ └───────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 📜 Combat Log: Your Destroyer "Whiskers" fires Fusion Beam at Enemy Fighter - HIT! 2 destroyed  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Movement Phase (Stack Selected for Movement)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ ⚔️ TACTICAL COMBAT │ Alpha Centauri │ Round 3 of 50 │ Phase: MOVEMENT │ [?] Help  [⚙️] Options  ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║ ┌──INITIATIVE ORDER─────────┐  ┌──COMBAT ARENA (Movement Mode)─────────────────────────────────┐ ║
║ │                           │  │                                                                │ ║
║ │  Round 3 Turn Order:      │  │  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                         │ ║
║ │  ─────────────────────    │  │   ⬡ ⬢ ⬢ ⬢ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                        │ ║
║ │  1. ▶[Y]Fighter ×12       │  │  ⬡ ⬢ ⬢ ⬢ ⬢ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡[E]⬡ ⬡                        │ ║
║ │     Speed: 6 │ MOVING     │  │   ⬢ ⬢[▶]⬢ ⬢ ⬢ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡  20  ⬡    ← Enemy Fighters    │ ║
║ │                           │  │  ⬡ ⬢ ⬢ ⬢ ⬢ ⬢ ⬢ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                         │ ║
║ │  2.  [E]Fighter ×20       │  │   ⬡ ⬢ ⬢ ⬢ ⬢ ⬢ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                        │ ║
║ │     Speed: 5              │  │  ⬡[Y]⬢ ⬢ ⬢ ⬢ ⬢ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡[E]                         │ ║
║ │  3.  [Y]Destroyer ×6      │  │   ⬡ 6  ⬢ ⬢ ⬢ ⬡ ⬡🌍⬡ ⬡ ⬡ ⬡ ⬡ ⬡  4     ← Enemy Cruisers     │ ║
║ │     Speed: 4              │  │  ⬡ ⬡ ⬢ ⬢ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                         │ ║
║ │  4.  [E]Cruiser ×4        │  │   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                        │ ║
║ │     Speed: 3              │  │  ⬡[Y]⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡[E]                         │ ║
║ │  5.  [Y]Cruiser ×2        │  │   ⬡ 2  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡  1     ← Enemy Dreadnought │ ║
║ │     Speed: 3              │  │  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                         │ ║
║ │  6.  [E]Dreadnought ×1    │  │   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                        │ ║
║ │     Speed: 2              │  │                                                                │ ║
║ │                           │  │  Legend:                                                       │ ║
║ │  ─────────────────────    │  │  [▶] = Selected Stack (12 Fighters)                           │ ║
║ │  ⬢ = Movement Range       │  │  ⬢  = Valid Movement Hex (click to move)                     │ ║
║ │  ⬡ = Out of Range         │  │  ⬡  = Cannot reach this turn                                 │ ║
║ │                           │  │                                                                │ ║
║ └───────────────────────────┘  └────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║ ┌──MOVEMENT INFO───────────────────────────────────────────────────────────────────────────────┐  ║
║ │                                                                                               │  ║
║ │  SELECTED: Fighter "Pellet" ×12                                                              │  ║
║ │  ─────────────────────────────────────────────────────────────────────────────────────────   │  ║
║ │  Movement Speed: 6 hexes per round                                                           │  ║
║ │  Movement Remaining: 6 hexes (full)                                                          │  ║
║ │  Combat Maneuver: +3 (Inertial Stabilizer + Budgie ancestry)                                │  ║
║ │                                                                                               │  ║
║ │  Click a highlighted hex ⬢ to move │ Movement is optional │ Can still fire after moving    │  ║
║ │                                                                                               │  ║
║ │  ┌──TACTICAL TIPS────────────────────────────────────────────────────────────────────────┐   │  ║
║ │  │ • Move closer to increase hit chance (+10% at point blank)                            │   │  ║
║ │  │ • Fighters are best in close range - your lasers are short range weapons              │   │  ║
║ │  │ • You can move past enemies to get behind them (no zone of control in MOO1)          │   │  ║
║ │  │ • Press [ESC] or [CANCEL] to select a different stack                                 │   │  ║
║ │  └───────────────────────────────────────────────────────────────────────────────────────┘   │  ║
║ │                                                                                               │  ║
║ └───────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
║ ┌──COMMANDS────────────────────────────────────────────────────────────────────────────────────┐  ║
║ │                                                                                               │  ║
║ │  [✗ CANCEL MOVE]  [⏭️ SKIP MOVEMENT]  │  After Move: [🔫 FIRE] or [⏭️ DONE]                  │  ║
║ │                                                                                               │  ║
║ └───────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 📜 Select destination hex for Fighter stack (12 ships) - 6 hexes movement available             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Firing Phase (Weapon Selection & Targeting)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ ⚔️ TACTICAL COMBAT │ Alpha Centauri │ Round 3 of 50 │ Phase: FIRING │ [?] Help  [⚙️] Options    ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║ ┌──FIRING: Destroyer "Whiskers" ×6───────────────────────────────────────────────────────────┐  ║
║ │                                                                                             │  ║
║ │  SELECT WEAPON                                   │  SELECT TARGET                           │  ║
║ │  ═══════════════════════════════════════════════ │  ═══════════════════════════════════════ │  ║
║ │                                                  │                                          │  ║
║ │  ┌─BEAM WEAPONS───────────────────────────────┐ │  ┌─VALID TARGETS─────────────────────┐  │  ║
║ │  │                                            │ │  │                                    │  │  ║
║ │  │  (•) 🔫 Fusion Beam ×4                    │ │  │  [1] Enemy Fighter ×20             │  │  ║
║ │  │      Damage: 4-16 each (16-64 total)      │ │  │      Range: 4 hexes                │  │  ║
║ │  │      Range: 1-8 hexes                     │ │  │      Hit Chance: 75%               │  │  ║
║ │  │      Fires: 6 ships × 4 beams = 24 shots  │ │  │      HP: 10 each, Shield: 1        │  │  ║
║ │  │      Status: ✓ READY                      │ │  │      Est. Kills: 8-16 fighters     │  │  ║
║ │  │                                            │ │  │      [■■■■■■■■░░] EASY             │  │  ║
║ │  │  ( ) 🔫 Heavy Laser ×2                    │ │  │                                    │  │  ║
║ │  │      Damage: 3-9 each (6-18 total)        │ │  │  [2] Enemy Cruiser ×4              │  │  ║
║ │  │      Range: 1-5 hexes                     │ │  │      Range: 6 hexes                │  │  ║
║ │  │      Fires: 6 ships × 2 lasers = 12 shots │ │  │      Hit Chance: 60%               │  │  ║
║ │  │      Status: ✓ READY                      │ │  │      HP: 120 each, Shield: 3       │  │  ║
║ │  │                                            │ │  │      Est. Kills: 0-1 cruiser       │  │  ║
║ │  └────────────────────────────────────────────┘ │  │      [■■■░░░░░░░] MEDIUM           │  │  ║
║ │                                                  │  │                                    │  │  ║
║ │  ┌─MISSILES───────────────────────────────────┐ │  │  [3] Enemy Dreadnought ×1         │  │  ║
║ │  │                                            │ │  │      Range: 8 hexes                │  │  ║
║ │  │  ( ) 🚀 Merculite Missile ×2              │ │  │      Hit Chance: 45%               │  │  ║
║ │  │      Damage: 10 each × 6 ships = 120 max  │ │  │      HP: 400, Shield: 8            │  │  ║
║ │  │      Speed: 4 hexes/round                 │ │  │      Est. Damage: ~15-30           │  │  ║
║ │  │      Racks: 2 (can fire twice more)       │ │  │      [■░░░░░░░░░] HARD             │  │  ║
║ │  │      ⚠️ Can be intercepted by PD          │ │  │                                    │  │  ║
║ │  │      Status: ✓ READY (12 missiles loaded) │ │  │  ─────────────────────────────     │  │  ║
║ │  │                                            │ │  │  ⚠️ Missile Bases out of range   │  │  ║
║ │  └────────────────────────────────────────────┘ │  │                                    │  │  ║
║ │                                                  │  └────────────────────────────────────┘  │  ║
║ │                                                  │                                          │  ║
║ └──────────────────────────────────────────────────┴──────────────────────────────────────────┘  ║
║                                                                                                   ║
║ ┌──COMBAT ARENA (Targeting Mode)────────────────────────────────────────────────────────────────┐ ║
║ │                                                                                                │ ║
║ │    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                                                        │ ║
║ │     ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                                                       │ ║
║ │    ⬡ ⬡[Y]⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡[①]⬡ ⬡       ①=Target 1 (Enemy Fighters) - SELECTED         │ ║
║ │     ⬡  12  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡═════════20  ⬡       ══ = Firing Line                              │ ║
║ │    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                                                        │ ║
║ │     ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                                                       │ ║
║ │    ⬡[▶]⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡[②]       ②=Target 2 (Enemy Cruisers)                      │ ║
║ │     ⬡  6  ⬡ ⬡ ⬡ ⬡ ⬡ 🌍 ⬡ ⬡ ⬡ ⬡ ⬡ ⬡  4        [▶]=Currently Firing Stack                     │ ║
║ │    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                                                        │ ║
║ │     ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                                                       │ ║
║ │    ⬡[Y]⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡[③]       ③=Target 3 (Enemy Dreadnought)                   │ ║
║ │     ⬡  2  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡  1                                                        │ ║
║ │                                                                                                │ ║
║ └────────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║ ┌──COMMANDS────────────────────────────────────────────────────────────────────────────────────┐  ║
║ │                                                                                               │  ║
║ │  [🔫 FIRE AT TARGET 1]  [🔫 FIRE AT TARGET 2]  [🔫 FIRE AT TARGET 3]  │  [⏭️ HOLD FIRE]       │  ║
║ │                                                                                               │  ║
║ └───────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 📜 Select target for Fusion Beam attack - Recommend: Target 1 (Fighters) for maximum kills      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Attack Resolution (Damage Display)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ ⚔️ TACTICAL COMBAT │ Alpha Centauri │ Round 3 of 50 │ Phase: RESOLUTION │ [?] Help [⚙️] Options ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  ┌──ATTACK RESULT──────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │            ╔═══════════════════════════════════════════════════════════════════════╗        │ ║
║  │            ║                        🔥 DIRECT HIT! 🔥                               ║        │ ║
║  │            ╠═══════════════════════════════════════════════════════════════════════╣        │ ║
║  │            ║                                                                       ║        │ ║
║  │            ║   Destroyer "Whiskers" ×6 fires Fusion Beam at Enemy Fighters!       ║        │ ║
║  │            ║                                                                       ║        │ ║
║  │            ║   ─────────────────────────────────────────────────────────────────  ║        │ ║
║  │            ║                                                                       ║        │ ║
║  │            ║   Shots Fired: 24 (6 ships × 4 beams each)                           ║        │ ║
║  │            ║   Shots Hit: 18 (75% accuracy)                                       ║        │ ║
║  │            ║                                                                       ║        │ ║
║  │            ║   Damage Per Hit: 4-16 (Fusion Beam)                                 ║        │ ║
║  │            ║   Total Damage: 162                                                  ║        │ ║
║  │            ║                                                                       ║        │ ║
║  │            ║   ─────────────────────────────────────────────────────────────────  ║        │ ║
║  │            ║                                                                       ║        │ ║
║  │            ║   Enemy Shields Absorbed: 18 (1 per hit)                             ║        │ ║
║  │            ║   Damage to Hulls: 144                                               ║        │ ║
║  │            ║                                                                       ║        │ ║
║  │            ║   ═══════════════════════════════════════════════════════════════   ║        │ ║
║  │            ║   💥 FIGHTERS DESTROYED: 14                                          ║        │ ║
║  │            ║   ═══════════════════════════════════════════════════════════════   ║        │ ║
║  │            ║                                                                       ║        │ ║
║  │            ║   Enemy Fighters Remaining: 6 (was 20)                               ║        │ ║
║  │            ║   Enemy HP: [██░░░░░░░░] 30%                                         ║        │ ║
║  │            ║                                                                       ║        │ ║
║  │            ║                       [CONTINUE ⏎]                                   ║        │ ║
║  │            ║                                                                       ║        │ ║
║  │            ╚═══════════════════════════════════════════════════════════════════════╝        │ ║
║  │                                                                                              │ ║
║  │   [Animation: Beam traces from Destroyers to Fighters, explosions, ships destroyed]         │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌──COMBAT STATISTICS THIS ROUND───────────────────────────────────────────────────────────────┐ ║
║  │                                                                                              │ ║
║  │   YOUR KILLS                           │  ENEMY KILLS                                        │ ║
║  │   ═══════════════════════════════════  │  ═══════════════════════════════════               │ ║
║  │   • Fighter "Grunt" ×14 destroyed      │  • None this round                                 │ ║
║  │   • (14 of 20 - 70% casualties)        │                                                    │ ║
║  │                                        │                                                    │ ║
║  │   YOUR LOSSES                          │  DAMAGE DEALT                                      │ ║
║  │   ═══════════════════════════════════  │  ═══════════════════════════════════               │ ║
║  │   • None this round                    │  • Total: 162 damage                               │ ║
║  │                                        │  • Shields absorbed: 18                            │ ║
║  │                                        │  • Hull damage: 144                                │ ║
║  │                                                                                              │ ║
║  └──────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 📜 Excellent shot! 14 enemy fighters destroyed. Press CONTINUE to proceed.                       ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Missile Attack (In-Flight Display)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ ⚔️ TACTICAL COMBAT │ Alpha Centauri │ Round 4 of 50 │ Phase: MISSILES │ [?] Help  [⚙️] Options  ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║ ┌──MISSILES IN FLIGHT────────────────────────────────────────────────────────────────────────┐   ║
║ │                                                                                             │   ║
║ │  Active Missiles:                                                                           │   ║
║ │  ════════════════════════════════════════════════════════════════════════════════════════  │   ║
║ │                                                                                             │   ║
║ │  🚀 Your Missiles:                                                                          │   ║
║ │  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │   ║
║ │  │ Merculite ×12  │ From: Destroyers │ Target: Dreadnought │ ETA: 2 rounds │ 🎯 On track │  │   ║
║ │  └──────────────────────────────────────────────────────────────────────────────────────┘  │   ║
║ │                                                                                             │   ║
║ │  🚀 Enemy Missiles:                                                                         │   ║
║ │  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │   ║
║ │  │ Nuclear ×8     │ From: Cruisers   │ Target: Your Cruisers│ ETA: 1 round  │ 🎯 On track │  │   ║
║ │  │ Hyper-V ×16    │ From: Bases      │ Target: Your Fighters│ ETA: 1 round  │ 🎯 On track │  │   ║
║ │  └──────────────────────────────────────────────────────────────────────────────────────┘  │   ║
║ │                                                                                             │   ║
║ └─────────────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                                   ║
║ ┌──COMBAT ARENA (Missile Tracking)──────────────────────────────────────────────────────────────┐ ║
║ │                                                                                                │ ║
║ │    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                                                        │ ║
║ │     ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                                                       │ ║
║ │    ⬡ ⬡[Y]⬡ ⬡ ⬡ ⬡ ⬡🚀⬡ ⬡ ⬡ ⬡ ⬡[E]⬡ ⬡       ← Enemy missiles incoming!                       │ ║
║ │     ⬡  12  ⬡ ⬡ ⬡ ⬡←🚀← ⬡ ⬡ ⬡ ⬡ ⬡  6   ⬡       🚀← = Incoming missiles                        │ ║
║ │    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡🚀⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                                                        │ ║
║ │     ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                                                       │ ║
║ │    ⬡[Y]⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡🚀→⬡ ⬡ ⬡ ⬡ ⬡[E]       →🚀 = Your missiles outgoing                      │ ║
║ │     ⬡ 6  ←🚀← ⬡ ⬡ ⬡ 🌍 ⬡→🚀→ ⬡ ⬡ ⬡ ⬡  4                                                      │ ║
║ │    ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡🚀→⬡ ⬡ ⬡ ⬡ ⬡                                                        │ ║
║ │     ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                                                       │ ║
║ │    ⬡[Y]⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡🚀→⬡ ⬡ ⬡[E]                                                        │ ║
║ │     ⬡  2  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡→🚀→⬡ ⬡  1       Target: Enemy Dreadnought                      │ ║
║ │                                                                                                │ ║
║ └────────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║ ┌──POINT DEFENSE (Automatic)───────────────────────────────────────────────────────────────────┐  ║
║ │                                                                                               │  ║
║ │  Your Point Defense:                           │  Enemy Point Defense:                        │  ║
║ │  ═════════════════════════════════════════════ │  ════════════════════════════════════════   │  ║
║ │  Cruiser "Sunflower" PD System                │  Dreadnought "Fist" Anti-Missile Rockets    │  ║
║ │  • Intercept Chance: 40% per missile          │  • Intercept Chance: 60% per missile        │  ║
║ │  • Missiles incoming: 24 (Hyper-V + Nuclear)  │  • Missiles incoming: 12 (Merculite)        │  ║
║ │  • Est. intercepts: ~10                       │  • Est. intercepts: ~7                      │  ║
║ │                                                                                               │  ║
║ └───────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 📜 24 enemy missiles approaching! Your point defense will attempt interception next round.       ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Retreat Attempt

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ ⚔️ TACTICAL COMBAT │ Alpha Centauri │ Round 5 of 50 │ Phase: RETREAT │ [?] Help  [⚙️] Options   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  ┌──RETREAT ORDERS────────────────────────────────────────────────────────────────────────────┐  ║
║  │                                                                                             │  ║
║  │                 ╔═══════════════════════════════════════════════════════╗                  │  ║
║  │                 ║              🏃 RETREAT ATTEMPT                       ║                  │  ║
║  │                 ╠═══════════════════════════════════════════════════════╣                  │  ║
║  │                 ║                                                       ║                  │  ║
║  │                 ║  Select which stacks will attempt to retreat:         ║                  │  ║
║  │                 ║                                                       ║                  │  ║
║  │                 ║  ┌────────────────────────────────────────────────┐  ║                  │  ║
║  │                 ║  │                                                │  ║                  │  ║
║  │                 ║  │  [✓] Fighter "Pellet" ×12                     │  ║                  │  ║
║  │                 ║  │      Speed: 6 │ Escape Chance: 85%            │  ║                  │  ║
║  │                 ║  │                                                │  ║                  │  ║
║  │                 ║  │  [✓] Destroyer "Whiskers" ×6                  │  ║                  │  ║
║  │                 ║  │      Speed: 4 │ Escape Chance: 65%            │  ║                  │  ║
║  │                 ║  │                                                │  ║                  │  ║
║  │                 ║  │  [ ] Cruiser "Sunflower" ×2                   │  ║                  │  ║
║  │                 ║  │      Speed: 3 │ Escape Chance: 50%            │  ║                  │  ║
║  │                 ║  │      ⚠️ Low escape chance!                    │  ║                  │  ║
║  │                 ║  │                                                │  ║                  │  ║
║  │                 ║  └────────────────────────────────────────────────┘  ║                  │  ║
║  │                 ║                                                       ║                  │  ║
║  │                 ║  ─────────────────────────────────────────────────   ║                  │  ║
║  │                 ║                                                       ║                  │  ║
║  │                 ║  Retreat Calculation:                                 ║                  │  ║
║  │                 ║  Base Chance = Your Speed ÷ Fastest Enemy Speed × 100%║                  │  ║
║  │                 ║  Fastest Enemy: Fighter (Speed 5)                     ║                  │  ║
║  │                 ║                                                       ║                  │  ║
║  │                 ║  ⚠️ WARNING:                                          ║                  │  ║
║  │                 ║  • Failed retreat = trapped for 1 turn               ║                  │  ║
║  │                 ║  • Retreating ships can still be targeted            ║                  │  ║
║  │                 ║  • Retreating leaves the planet undefended           ║                  │  ║
║  │                 ║                                                       ║                  │  ║
║  │                 ║  [SELECT ALL]  [SELECT NONE]                          ║                  │  ║
║  │                 ║                                                       ║                  │  ║
║  │                 ║        [CONFIRM RETREAT]       [CANCEL]               ║                  │  ║
║  │                 ║                                                       ║                  │  ║
║  │                 ╚═══════════════════════════════════════════════════════╝                  │  ║
║  │                                                                                             │  ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 📜 Select ships to retreat. Ships that fail escape will be trapped and take fire next turn.      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Planetary Bombardment Phase

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ ⚔️ TACTICAL COMBAT │ Alpha Centauri │ Round 6 of 50 │ Phase: BOMBARDMENT │ [?] Help [⚙️] Options║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  ┌──BOMBARDMENT ORDERS────────────────────────────────────────────────────────────────────────┐  ║
║  │                                                                                             │  ║
║  │  🌍 TARGET: New Pigton (Guinea Pig Colony)                                                 │  ║
║  │  ═══════════════════════════════════════════════════════════════════════════════════════   │  ║
║  │                                                                                             │  ║
║  │  PLANETARY STATUS                          │  YOUR BOMBERS                                 │  ║
║  │  ════════════════════════════════════════  │  ════════════════════════════════════════════ │  ║
║  │  Population: 65M                           │  Cruiser "Sunflower" ×2                       │  ║
║  │  Factories: 180                            │  Bombs: Fusion Bomb ×4 each                   │  ║
║  │  Missile Bases: 8 (active!)               │  Est. Damage: 40-80 factories/turn            │  ║
║  │  Planetary Shield: Class IV (blocks 4 dmg) │  Est. Casualties: 2-5M population/turn        │  ║
║  │  Ground Defense: ★★★★★ (Guinea Pigs!)    │                                               │  ║
║  │                                             │                                               │  ║
║  │  ┌──BOMBARDMENT OPTIONS───────────────────────────────────────────────────────────────┐   │  ║
║  │  │                                                                                     │   │  ║
║  │  │  (•) 🎯 MILITARY TARGETS                                                           │   │  ║
║  │  │      Focus: Missile Bases, Shields                                                 │   │  ║
║  │  │      Effect: -2 bases/turn, minimal civilian casualties                            │   │  ║
║  │  │      Diplomacy: -10 relations                                                      │   │  ║
║  │  │                                                                                     │   │  ║
║  │  │  ( ) 🏭 INDUSTRIAL TARGETS                                                         │   │  ║
║  │  │      Focus: Factories, Production                                                  │   │  ║
║  │  │      Effect: -40 factories/turn, 2-5M casualties                                   │   │  ║
║  │  │      Diplomacy: -25 relations                                                      │   │  ║
║  │  │                                                                                     │   │  ║
║  │  │  ( ) 💀 TERROR BOMBING                                                             │   │  ║
║  │  │      Focus: Population Centers                                                     │   │  ║
║  │  │      Effect: -10-30M population/turn, colony may surrender                         │   │  ║
║  │  │      Diplomacy: -50 relations (WAR CRIME)                                          │   │  ║
║  │  │                                                                                     │   │  ║
║  │  │  ( ) ☢️ BIOLOGICAL WEAPON (if available)                                           │   │  ║
║  │  │      Effect: -90% population, planet irradiated 50 turns                           │   │  ║
║  │  │      Diplomacy: -100 ALL RACES (ATROCITY - may unite galaxy against you)          │   │  ║
║  │  │                                                                                     │   │  ║
║  │  └─────────────────────────────────────────────────────────────────────────────────────┘   │  ║
║  │                                                                                             │  ║
║  │       [COMMENCE BOMBARDMENT]        [LAUNCH GROUND INVASION]        [CANCEL]              │  ║
║  │                                                                                             │  ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                                   ║
║  ⚠️ WARNING: 8 Missile Bases will return fire! Expected losses: 15-30 damage to your fleet.      ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 📜 Enemy fleet destroyed. You may now bombard or invade the planet. Bases still active!          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Victory Screen

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                   ║
║         ╔═══════════════════════════════════════════════════════════════════════════════════╗    ║
║         ║                                                                                    ║    ║
║         ║                           🏆 BATTLE WON! 🏆                                        ║    ║
║         ║                                                                                    ║    ║
║         ╠════════════════════════════════════════════════════════════════════════════════════╣    ║
║         ║                                                                                    ║    ║
║         ║   [Victory Animation: Your ships triumphant, enemy debris floating]               ║    ║
║         ║                                                                                    ║    ║
║         ║   ══════════════════════════════════════════════════════════════════════════════  ║    ║
║         ║                                                                                    ║    ║
║         ║   BATTLE SUMMARY: Alpha Centauri - Year 2623                                      ║    ║
║         ║   ────────────────────────────────────────────────────────────────────────────   ║    ║
║         ║                                                                                    ║    ║
║         ║   ┌─YOUR LOSSES──────────────────┐   ┌─ENEMY LOSSES────────────────┐             ║    ║
║         ║   │                              │   │                              │             ║    ║
║         ║   │  Destroyed:                  │   │  Destroyed:                  │             ║    ║
║         ║   │  • Fighter "Pellet" ×4       │   │  • Fighter "Grunt" ×20       │             ║    ║
║         ║   │                              │   │  • Cruiser "Paw" ×4          │             ║    ║
║         ║   │  Damaged:                    │   │  • Dreadnought "Fist" ×1     │             ║    ║
║         ║   │  • Destroyer "Whiskers" ×2   │   │                              │             ║    ║
║         ║   │    (HP: 60/100)              │   │  Total Ships Lost: 25        │             ║    ║
║         ║   │  • Cruiser "Sunflower" ×1    │   │                              │             ║    ║
║         ║   │    (HP: 80/200)              │   │  Escaped: 0                  │             ║    ║
║         ║   │                              │   │                              │             ║    ║
║         ║   │  Total Lost: 4               │   │                              │             ║    ║
║         ║   └──────────────────────────────┘   └──────────────────────────────┘             ║    ║
║         ║                                                                                    ║    ║
║         ║   ──────────────────────────────────────────────────────────────────────────────  ║    ║
║         ║                                                                                    ║    ║
║         ║   EXPERIENCE GAINED                                                               ║    ║
║         ║   ════════════════════════════════════════════════════════════════════════════   ║    ║
║         ║   • Destroyer "Whiskers": Regular → Veteran ★★☆☆☆                               ║    ║
║         ║   • Fighter "Pellet": Already Elite (max)                                        ║    ║
║         ║                                                                                    ║    ║
║         ║   SALVAGE                                                                         ║    ║
║         ║   ════════════════════════════════════════════════════════════════════════════   ║    ║
║         ║   • +280 BC (scrap value of destroyed enemy ships)                               ║    ║
║         ║   • 💡 Technology Insight: Adamantium Armor (5% research bonus)                  ║    ║
║         ║                                                                                    ║    ║
║         ║   REPUTATION                                                                      ║    ║
║         ║   ════════════════════════════════════════════════════════════════════════════   ║    ║
║         ║   • +10 with all empires (military victory)                                      ║    ║
║         ║   • Guinea Pigs: -20 (war) → Total: -45 (Hostile)                               ║    ║
║         ║                                                                                    ║    ║
║         ║   ══════════════════════════════════════════════════════════════════════════════  ║    ║
║         ║                                                                                    ║    ║
║         ║                            [CONTINUE ⏎]                                           ║    ║
║         ║                                                                                    ║    ║
║         ╚════════════════════════════════════════════════════════════════════════════════════╝    ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Defeat Screen

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                   ║
║         ╔═══════════════════════════════════════════════════════════════════════════════════╗    ║
║         ║                                                                                    ║    ║
║         ║                           💀 BATTLE LOST 💀                                        ║    ║
║         ║                                                                                    ║    ║
║         ╠════════════════════════════════════════════════════════════════════════════════════╣    ║
║         ║                                                                                    ║    ║
║         ║   [Defeat Animation: Your ships destroyed, enemy victorious]                      ║    ║
║         ║                                                                                    ║    ║
║         ║   ══════════════════════════════════════════════════════════════════════════════  ║    ║
║         ║                                                                                    ║    ║
║         ║   BATTLE SUMMARY: Alpha Centauri - Year 2623                                      ║    ║
║         ║   ────────────────────────────────────────────────────────────────────────────   ║    ║
║         ║                                                                                    ║    ║
║         ║   Your fleet has been destroyed!                                                  ║    ║
║         ║                                                                                    ║    ║
║         ║   ┌─YOUR LOSSES──────────────────────────────────────────────────────────────┐   ║    ║
║         ║   │                                                                          │   ║    ║
║         ║   │  Destroyed:                                                              │   ║    ║
║         ║   │  • Fighter "Pellet" ×12                                                  │   ║    ║
║         ║   │  • Destroyer "Whiskers" ×6                                               │   ║    ║
║         ║   │  • Cruiser "Sunflower" ×2                                                │   ║    ║
║         ║   │                                                                          │   ║    ║
║         ║   │  Escaped: 0                                                              │   ║    ║
║         ║   │                                                                          │   ║    ║
║         ║   │  Total Fleet Lost: 20 ships (Battle Group Alpha - DESTROYED)             │   ║    ║
║         ║   │                                                                          │   ║    ║
║         ║   └──────────────────────────────────────────────────────────────────────────┘   ║    ║
║         ║                                                                                    ║    ║
║         ║   STRATEGIC IMPACT                                                                ║    ║
║         ║   ════════════════════════════════════════════════════════════════════════════   ║    ║
║         ║   • Alpha Centauri remains under Guinea Pig control                              ║    ║
║         ║   • Your fleet strength reduced by 40%                                           ║    ║
║         ║   • Guinea Pigs gain +15 diplomatic standing (victory)                           ║    ║
║         ║   • Other empires now view you as weaker                                         ║    ║
║         ║                                                                                    ║    ║
║         ║   RECOMMENDATION                                                                  ║    ║
║         ║   ════════════════════════════════════════════════════════════════════════════   ║    ║
║         ║   • Rebuild fleet before next engagement                                         ║    ║
║         ║   • Consider defensive posture until recovery                                    ║    ║
║         ║   • Research better weapons/shields to counter Guinea Pig strength               ║    ║
║         ║                                                                                    ║    ║
║         ║   ══════════════════════════════════════════════════════════════════════════════  ║    ║
║         ║                                                                                    ║    ║
║         ║                            [CONTINUE ⏎]                                           ║    ║
║         ║                                                                                    ║    ║
║         ╚════════════════════════════════════════════════════════════════════════════════════╝    ║
║                                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Interactive Elements Specification

### 1. Ship Stack Display

| Element | Symbol | Color | Description |
|---------|--------|-------|-------------|
| Your Ships | [Y] | Green (#4caf50) | Your ship stacks |
| Enemy Ships | [E] | Red (#f44336) | Enemy ship stacks |
| Selected Stack | [▶] | Bright Green | Currently acting |
| Target | [①②③] | Orange (#ff9800) | Numbered targets |
| Retreating | [→] | Gray | Ships attempting retreat |
| Cloaked | [?] | Purple (#9c27b0) | Hidden ships |

**Stack Count Display**:
- Small ships (1-9): Single digit below stack
- Large stacks (10-99): Two digits below stack
- Huge stacks (100+): "99+" displayed

### 2. Hex Grid Elements

| Hex Type | Symbol | Description |
|----------|--------|-------------|
| Empty Space | ⬡ | Normal traversable hex |
| Movement Range | ⬢ | Highlighted reachable hexes |
| Planet | 🌍 | Planetary body (blocks LOS) |
| Shield Zone | ⬢ | Protected by planetary shields |
| Asteroid | ⬣ | Provides cover (-20% hit) |
| Debris | ✦ | Destroyed ship remains |
| Missile | 🚀 | Missile in flight |

### 3. Turn Phase Indicators

| Phase | Icon | Player Action |
|-------|------|---------------|
| Initiative | ⚡ | Automatic (speed determines order) |
| Movement | 🎯 | Click destination hex |
| Firing | 🔫 | Select weapon + target |
| Missiles | 🚀 | Automatic (missiles advance) |
| Resolution | 💥 | View damage results |
| Retreat | 🏃 | Select stacks to flee |

---

## Command Buttons Specification

### Movement Phase Commands

| Button | Hotkey | Action |
|--------|--------|--------|
| [🎯 MOVE] | M | Enter movement mode, show range |
| [⏭️ SKIP] | S | Skip movement for this stack |
| [🔁 WAIT] | W | Move this stack to end of initiative |
| [✗ CANCEL] | ESC | Deselect, choose different stack |

### Firing Phase Commands

| Button | Hotkey | Action |
|--------|--------|--------|
| [🔫 FIRE] | F | Enter firing mode, select weapon |
| [⏭️ HOLD FIRE] | H | Do not fire this turn |
| [🔫 FIRE AT #] | 1-9 | Fire at numbered target |

### Special Commands

| Button | Hotkey | Action |
|--------|--------|--------|
| [🏃 RETREAT] | R | Attempt to flee battle |
| [⚙️ SPECIAL] | P | Activate special systems |
| [⏩ AUTO] | A | Auto-resolve remainder of battle |
| [⚙️ OPTIONS] | O | Combat settings (speed, etc.) |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space/Enter | End turn / Confirm action |
| Escape | Cancel / Back |
| Tab | Cycle to next stack |
| Arrow Keys | Pan combat view |
| +/- | Zoom in/out |
| C | Center on selected stack |
| L | Toggle combat log |

---

## Combat Log Display

```
┌──COMBAT LOG─────────────────────────────────────────────────────────┐
│                                                                      │
│  Round 3:                                                            │
│  ────────                                                            │
│  [14:32:15] Initiative: Your Fighters move first (Speed 6)          │
│  [14:32:18] Your Fighter "Pellet" ×12 moves to hex (5,4)            │
│  [14:32:25] Enemy Fighter ×20 moves to hex (10,4)                    │
│  [14:32:30] Your Destroyer "Whiskers" ×6 fires Fusion Beam           │
│             → Target: Enemy Fighter ×20                              │
│             → Shots: 24, Hits: 18 (75%)                              │
│             → Damage: 162, Shields absorbed: 18                      │
│             → 💥 14 Enemy Fighters DESTROYED                         │
│  [14:32:45] Enemy Fighter ×6 fires Laser                             │
│             → Target: Your Fighter ×12                               │
│             → Shots: 12, Hits: 7 (58%)                               │
│             → Damage: 21, Shields absorbed: 7                        │
│             → 2 Your Fighters DESTROYED                              │
│                                                                      │
│  Round 2:                                                            │
│  ────────                                                            │
│  [14:31:10] Battle begins at Alpha Centauri                          │
│  [14:31:12] Your forces: 20 ships vs Enemy: 25 ships                │
│                                                                      │
│  [SCROLL ↑↓]                                    [EXPORT LOG] [HIDE]  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Tooltips Specification

### Ship Stack Tooltip (on hover)
```
┌─────────────────────────────────────┐
│ Destroyer "Whiskers" ×6             │
│ ════════════════════════════════════│
│ Hull: Destroyer (250 space)         │
│ Ships: 6 in this stack              │
│ Experience: Veteran (+10% accuracy) │
│ ─────────────────────────────────── │
│ HP: 100/100 each                    │
│ Shield: Class III (3 absorption)    │
│ Armor: Zortrium (×2.0 HP)          │
│ ─────────────────────────────────── │
│ Weapons:                            │
│ • Fusion Beam ×4 (Dmg: 4-16)       │
│ • Merculite Missiles ×2 (10 left)  │
│ ─────────────────────────────────── │
│ Speed: 4 hexes/round                │
│ Attack: +3 │ Defense: +2            │
│ ─────────────────────────────────── │
│ Status: Ready to act                │
│ Click to select                     │
└─────────────────────────────────────┘
```

### Weapon Tooltip (on hover)
```
┌─────────────────────────────────────┐
│ 🔫 Fusion Beam                       │
│ ════════════════════════════════════│
│ Type: Beam (instant hit)            │
│ Damage: 4-16 per beam               │
│ Range: 1-8 hexes                    │
│ ─────────────────────────────────── │
│ Accuracy Modifiers:                 │
│ • Point blank (1 hex): +10%        │
│ • Close (2-4): +0%                  │
│ • Medium (5-8): -10%                │
│ ─────────────────────────────────── │
│ Special: None                       │
│ Ammo: Unlimited                     │
│ ─────────────────────────────────── │
│ This ship: 4 beams equipped        │
│ Total stack: 24 beams (6 ships)    │
└─────────────────────────────────────┘
```

### Target Tooltip (on hover)
```
┌─────────────────────────────────────┐
│ 🎯 TARGET: Enemy Fighter ×6         │
│ ════════════════════════════════════│
│ Distance: 4 hexes                   │
│ Hit Chance: 75%                     │
│ ─────────────────────────────────── │
│ Enemy Stats:                        │
│ • HP: 10 each                       │
│ • Shield: Class I (1)               │
│ • ECM: None                         │
│ ─────────────────────────────────── │
│ Expected Damage:                    │
│ • Your weapon: Fusion Beam ×24     │
│ • Est. hits: 18                     │
│ • Est. damage: 144                  │
│ • Est. kills: 12-14 fighters       │
│ ─────────────────────────────────── │
│ Recommendation: GOOD TARGET        │
│ (High kill potential)               │
└─────────────────────────────────────┘
```

---

## Animation Specifications

### Attack Animations

| Animation | Duration | Description |
|-----------|----------|-------------|
| Beam Fire | 0.3s | Line traces from attacker to target |
| Beam Impact | 0.2s | Target flashes white/red |
| Missile Launch | 0.3s | Missile leaves ship |
| Missile Travel | 0.5s/hex | Missile moves toward target |
| Missile Impact | 0.4s | Explosion effect at target |
| Point Defense | 0.2s | Small explosions (intercepted missiles) |
| Ship Explosion | 0.7s | Ship breaks apart, debris scatters |
| Stack Destroyed | 1.0s | All ships in stack explode |
| Damage Numbers | 0.5s | Numbers float up and fade |

### Movement Animations

| Animation | Duration | Description |
|-----------|----------|-------------|
| Ship Move | 0.3s/hex | Ship glides to destination |
| Turn Rotation | 0.2s | Ship rotates to face direction |
| Retreat | 0.5s | Ship accelerates off-screen |

### Animation Speed Options
```
┌──ANIMATION SPEED────────────┐
│ ( ) Slow (2× duration)      │
│ (•) Normal                  │
│ ( ) Fast (0.5× duration)    │
│ ( ) Instant (skip all)      │
└─────────────────────────────┘
```

---

## Combat Options Menu

```
╔══════════════════════════════════════════════════════════════════════╗
║                        ⚙️ COMBAT OPTIONS                              ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  ANIMATION                                                            ║
║  ════════════════════════════════════════════════════════════════    ║
║  Animation Speed: [ Slow ▼ ]                                         ║
║  Show Damage Numbers: [✓]                                            ║
║  Show Combat Log: [✓]                                                ║
║  Camera Follow: [✓]                                                  ║
║                                                                       ║
║  AUTOMATION                                                           ║
║  ════════════════════════════════════════════════════════════════    ║
║  Auto-fire Point Defense: [✓]                                        ║
║  Auto-advance Missiles: [✓]                                          ║
║  Skip Enemy Turns (show results only): [ ]                           ║
║                                                                       ║
║  DIFFICULTY (applies to AI behavior)                                  ║
║  ════════════════════════════════════════════════════════════════    ║
║  AI Targeting: [ Smart ▼ ]  (Smart/Random/Focus Fire)                ║
║  AI Retreat Threshold: [ 30% ▼ ] (When AI attempts retreat)          ║
║                                                                       ║
║  DISPLAY                                                              ║
║  ════════════════════════════════════════════════════════════════    ║
║  Grid Lines: [✓]                                                     ║
║  Range Circles: [✓]                                                  ║
║  Weapon Arcs: [ ]                                                    ║
║  Tactical Overlay: [✓]                                               ║
║                                                                       ║
║               [APPLY]  [CANCEL]  [RESTORE DEFAULTS]                  ║
║                                                                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## Responsive Behavior

### Desktop (1920×1080)
- Full layout as shown
- 16×10 hex grid clearly visible
- All panels displayed simultaneously
- Rich animations and effects

### Laptop (1366×768)
- Condensed layout
- Combat log collapses to single line
- Initiative order shows top 3 only
- Side panels become tabbed

### Tablet (1024×768)
- Touch-optimized controls
- Larger hex tap targets (minimum 44px)
- Swipe to pan combat grid
- Long-press for tooltips
- Floating action buttons

---

## Accessibility Features

| Feature | Implementation |
|---------|----------------|
| Color Blind Mode | Shape indicators for friend/foe |
| High Contrast | Thicker hex borders, brighter highlights |
| Screen Reader | All actions have ARIA labels |
| Keyboard Only | Full combat playable via keyboard |
| Animation Disable | Skip all animations option |
| Large Text | Scalable UI text |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Grid Rendering | 60fps during pan/zoom |
| Animation Playback | 30fps minimum |
| Turn Resolution | <100ms calculation |
| Missile Tracking | 60fps during flight |
| Memory Usage | <50MB for combat state |
| Max Ships Displayed | 100 stacks (500+ individual ships) |

---

## Technical Notes

### Data Required Per Combat

```json
{
  "combat_id": "battle_001",
  "location": {
    "system": "Alpha Centauri",
    "has_planet": true,
    "planet": {
      "name": "New Pigton",
      "owner": "guinea_pigs",
      "missile_bases": 8,
      "shield_class": 4,
      "population": 65000000
    }
  },
  "attacker": {
    "race": "hamsters",
    "stacks": [
      {
        "design_id": "cruiser_sunflower_mk3",
        "count": 2,
        "hp_each": 200,
        "current_hp": [200, 180],
        "position": {"x": 2, "y": 5},
        "weapons_ready": true,
        "has_moved": false,
        "experience": "veteran"
      }
    ]
  },
  "defender": {
    "race": "guinea_pigs",
    "stacks": []
  },
  "round": 3,
  "max_rounds": 50,
  "missiles_in_flight": [],
  "combat_log": []
}
```

---

## Related Documents

- `combat-mechanics.md` - Combat formulas and calculations
- `combat-algorithm.md` - Turn resolution algorithm
- `tactical-combat-ui.md` - Previous UI draft (less detailed)
- `ship-classes.md` - Ship hull specifications
- `ship-design.md` - Ship design system

---

*Document Version: 1.0*  
*Created: 2026-03-22*  
*Based on: Master of Orion (1993) tactical combat screen*
