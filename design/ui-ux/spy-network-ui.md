# Spy Network UI

**Created:** 2026-04-13  
**Reference:** Master of Orion (1993) Espionage System  
**Related files:** `espionage.md` (game mechanics), `command_menu_planets.md` (SPYING/SECURITY spending lines)

---

## Overview

The spy network UI governs how players allocate espionage spending, assign spy missions, and review the outcomes of spy operations. In MOO1, espionage was managed through the **PLANETS screen's SPENDING panel** (SPYING and SECURITY budget lines) plus start-of-turn notification pop-ups for spy results.

Hamster of Orion implements a dedicated **Spy Network sub-screen** accessible from the RACES (Diplomacy) screen, providing a fuller interface while keeping MOO1's spending model.

---

## 1. Espionage Spending (PLANETS Screen Integration)

The PLANETS screen (F2) already shows empire-wide spy spending in its bottom SPENDING panel. This is the primary budget control.

```
┌─SPENDING─────────────────────┐
│  SHIPS:      45 BC/turn      │
│  BASES:       8 BC/turn      │
│  SPYING:     20 BC/turn  ←   │  ← Offensive espionage budget
│  SECURITY:   15 BC/turn  ←   │  ← Counter-espionage budget
└──────────────────────────────┘
```

**SPYING** funds offensive spy operations (stealing tech, sabotage, assassination).  
**SECURITY** funds counter-espionage (detecting and eliminating enemy spies).

The detailed allocation (which empire to target, which mission) is set in the **Spy Assignment Screen** below.

---

## 2. Spy Assignment Screen

Accessible via: **RACES screen (F5) → [SPY NETWORK] button** (or a dedicated sidebar button on the Diplomacy screen).

### Full Layout

```
╔════════════════════════════════════════════════════════════╗
║                    SPY NETWORK                            ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  Empire-wide espionage budget:  SPYING: 20 BC  SEC: 15 BC ║
║  Active Spies: 4 offensive,  2 counter-intel               ║
║                                                             ║
║  ┌─Offensive─Espionage──────────────────────────────────┐  ║
║  │                                                       │  ║
║  │  Target Empire: [Guinea Pig Raiders         ▼]        │  ║
║  │                                                       │  ║
║  │  Mission Type:                                        │  ║
║  │                                                       │  ║
║  │  (•) STEAL TECHNOLOGY                                 │  ║
║  │       Attempts to copy one tech from target empire    │  ║
║  │       Success rate: ~35%  (based on spy budget diff.) │  ║
║  │                                                       │  ║
║  │  ( ) SABOTAGE FACTORIES                               │  ║
║  │       Destroys 10-30 factories at target colony       │  ║
║  │       Target colony: [Pigopolis       ▼]              │  ║
║  │       Success rate: ~28%                              │  ║
║  │                                                       │  ║
║  │  ( ) SABOTAGE MISSILE BASES                           │  ║
║  │       Destroys 1-3 missile bases at target colony     │  ║
║  │       Target colony: [Pigopolis       ▼]              │  ║
║  │       Success rate: ~28%                              │  ║
║  │                                                       │  ║
║  │  ( ) FRAME EMPIRE   (Diplomatic warfare)             │  ║
║  │       Frame another empire for your spy ops          │  ║
║  │       Frame target: [Rat Confederation ▼]            │  ║
║  │       Success rate: ~20%                              │  ║
║  │                                                       │  ║
║  └───────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌─Counter─Intelligence─────────────────────────────────┐  ║
║  │                                                       │  ║
║  │  Security Level: [████████░░░░] Moderate             │  ║
║  │  (Adjust via SECURITY budget in PLANETS screen)       │  ║
║  │                                                       │  ║
║  │  Spies caught last turn: 1 (Rat Confederation)       │  ║
║  │  Your spy losses: 0                                   │  ║
║  │                                                       │  ║
║  └───────────────────────────────────────────────────────┘  ║
║                                                             ║
║                    [APPLY]   [CLOSE]                       ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

### Controls

| Element | Function |
|---------|----------|
| Target Empire dropdown | Select which empire your spies are assigned against |
| Mission Type radio | Choose mission (one active per empire target) |
| Target colony dropdown | Appears for colony-specific sabotage missions |
| Security Level bar | Read-only; reflects SECURITY budget vs. attacker spending |
| [APPLY] | Confirm mission assignment (takes effect next turn) |
| [CLOSE] | Return to RACES screen without changing assignment |

**Note:** Only one mission type active per target empire at a time. You can target multiple empires simultaneously by visiting their entry in the RACES screen individually.

---

## 3. Spy Mission Selection Details

### Mission Types

| Mission | Description | Risk | Diplomatic Hit |
|---------|-------------|------|----------------|
| **Steal Technology** | Copy one random tech from target | Spy may be caught | -15 if caught |
| **Sabotage Factories** | Destroy factories at a colony | Spy may be caught | -25 if caught |
| **Sabotage Missile Bases** | Destroy bases at a colony | Spy may be caught | -25 if caught |
| **Frame Empire** | Attribute spy ops to another race | Double-risk (two spies) | -10 if exposed |
| **Assassinate Leader** | *Enhancement — not in MOO1* | Very high | -50 (atrocity) |

### Success Rate Display

Each mission shows an estimated success rate:

```
┌─Mission─Analysis──────────────────────────────┐
│                                               │
│  Mission: STEAL TECHNOLOGY                    │
│  Target:  Guinea Pig Raiders                  │
│                                               │
│  Your Spy Power:   ████████░░░░  High         │
│  Their Security:   █████░░░░░░░  Medium       │
│  Net Advantage:    +2 levels                  │
│                                               │
│  Est. Success Rate: ~42%                      │
│  Est. Capture Risk: ~18%                      │
│                                               │
│  Tip: Increase SPYING budget to improve odds  │
│                                               │
└───────────────────────────────────────────────┘
```

Success rates are estimates, not exact — the player doesn't see the exact formula, which maintains uncertainty.

---

## 4. Spy Results Notifications

Spy results appear as **start-of-turn notification pop-ups**, interrupting normal turn flow until dismissed.

### 4.1 Successful Tech Theft

```
╔════════════════════════════════════════════════════════════╗
║                  ESPIONAGE SUCCESS!                       ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║   [Spy Portrait / Hamster in trench coat]                  ║
║                                                             ║
║   Your spy has stolen technology from the                   ║
║   Guinea Pig Raiders!                                       ║
║                                                             ║
║   Technology Acquired:                                      ║
║   ► Class III Shields                                       ║
║     (Research credit worth ~150 RP)                        ║
║                                                             ║
║   Your spy escaped undetected.                              ║
║                                                             ║
║                       [OK] ⏎                               ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

### 4.2 Successful Sabotage

```
╔════════════════════════════════════════════════════════════╗
║                  SABOTAGE SUCCESSFUL!                     ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║   Your spy has struck at Pigopolis!                         ║
║                                                             ║
║   ► 24 factories destroyed                                  ║
║   ► Production loss: ~48 BC/turn until rebuilt             ║
║                                                             ║
║   Your spy escaped undetected.                              ║
║                                                             ║
║                       [OK] ⏎                               ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

### 4.3 Spy Caught (Mission Failed)

```
╔════════════════════════════════════════════════════════════╗
║                  SPY CAUGHT!                              ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║   Your spy was captured by the Guinea Pig Raiders!          ║
║                                                             ║
║   ► Mission: Steal Technology — FAILED                     ║
║   ► Spy lost (replace at cost: 20 BC)                      ║
║   ► Relations with Guinea Pigs: -15                        ║
║                                                             ║
║   The Guinea Pig Emperor demands an explanation!            ║
║                                                             ║
║   [APOLOGIZE (-5 more relations, defuses)]  [DENY]         ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

**Response options when caught:**
- **APOLOGIZE**: Small additional relations hit, but incident is closed
- **DENY**: No immediate relations hit; empire may declare war anyway if already hostile

### 4.4 Enemy Spy Caught (Counter-Intel Success)

```
╔════════════════════════════════════════════════════════════╗
║               ENEMY SPY APPREHENDED!                     ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║   Your security forces have caught an enemy spy!            ║
║                                                             ║
║   ► Spy from: Rat Confederation                            ║
║   ► Mission attempted: Steal Technology                    ║
║   ► Mission: FOILED                                        ║
║                                                             ║
║   Options:                                                  ║
║   [EXECUTE]    — Sends message to their empire (-20 rel.) │
║   [IMPRISON]   — Holds as diplomatic leverage              │
║   [RELEASE]    — Goodwill gesture (+5 relations)           │
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

### 4.5 Spy Killed (Accident / High Security)

```
╔════════════════════════════════════════════════════════════╗
║                  SPY LOST                                 ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║   A spy was lost during operations against the             ║
║   Guinea Pig Raiders.                                       ║
║                                                             ║
║   ► Cause: Eliminated by counter-intelligence              ║
║   ► Our spy's identity: Unknown (no diplomatic incident)   ║
║   ► Replacement cost: 20 BC                                ║
║                                                             ║
║                       [OK] ⏎                               ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

---

## 5. Spy Report / History Log

The RACES screen (F5) includes a **spy activity log** accessible via a [SPY LOG] button in the diplomacy detail panel for each empire.

```
╔════════════════════════════════════════════════════════════╗
║         SPY ACTIVITY LOG — Guinea Pig Raiders             ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  Turn │ Action                    │ Result                 ║
║  ─────┼───────────────────────────┼───────────────────────  ║
║   47  │ Steal Technology          │ ✓ Class III Shields    ║
║   45  │ Steal Technology          │ ✗ Spy caught (-15 rel) ║
║   43  │ Sabotage Factories        │ ✓ 24 factories (Pigop) ║
║   40  │ Steal Technology          │ ✓ Merculite Missiles   ║
║   38  │ Enemy spy caught (Rats)   │ ✓ Imprisoned           ║
║                                                             ║
║  Your current assignment vs. Guinea Pigs:                  ║
║  → STEAL TECHNOLOGY  (active since turn 40)               ║
║  → Est. success: ~42%   Risk: ~18%                        ║
║                                                             ║
║                    [CHANGE MISSION]   [CLOSE]              ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

---

## 6. Spy Count and Budget Display

### Spy Count (Empire Summary)

The total spy count is visible in the Spy Network screen header and implicitly in the SPYING budget line. There is no separate "spy count" slider — spy effectiveness scales with the SPYING BC/turn budget.

```
Active Spy Summary:
  Offensive Spies:   4  (funded by SPYING budget)
  Counter-Intel:     2  (funded by SECURITY budget)
  Total Agents:      6

  SPYING budget:   20 BC/turn → 4 effective agents
  SECURITY budget: 15 BC/turn → 2 counter-intel units
  
  (Each agent costs ~5 BC/turn to maintain)
```

**Note:** This is a simplification for the UI. The actual mechanic is budget-based; the "agent count" display is derived from budget / cost-per-agent and shown for flavor.

### Security Level Indicator

Shown in the Spy Assignment Screen's Counter-Intelligence panel:

```
Your Security:  [████████████░░░░] 75%   (STRONG)
Enemy Spying:   [████████░░░░░░░░] 50%   (MODERATE)
Net Defense:    +25% → High chance of catching their spies
```

Security levels: Minimal / Weak / Moderate / Strong / Fortress

---

## 7. Integration with RACES Screen

The RACES screen (F5) shows a **Spy Activity Indicator** in each empire's portrait card:

```
┌─────────────────┐
│ [Guinea Pig     │
│  Portrait]      │
│                 │
│ WAR             │
│ Hostile (-75)   │
│                 │
│ 🕵️ Spying: Active│  ← shows if you have active spy ops
│ 🔒 Security: High│  ← shows their security level
└─────────────────┘
```

Clicking the empire opens the full Diplomacy panel with a [SPY NETWORK] button to access the Spy Assignment Screen for that empire.

---

## 8. Spy-Related Settings

In the Game Menu → Options, players can configure:

| Setting | Options | Default |
|---------|---------|---------|
| Spy result notifications | Always / Summary only / Off | Always |
| Auto-continue mission | Yes / No | Yes |
| Show enemy spy attempts | Yes / No | Yes |

**Auto-continue mission**: If Yes, the same mission repeats each turn without prompting. If No, the player must re-confirm the mission each turn.

---

## Related Screens

| Screen | File |
|--------|------|
| RACES (Diplomacy) screen | `main-screens.md` §7 |
| PLANETS screen spending panel | `wireframes/command_menu/command_menu_planets.md` |
| Espionage game mechanics | `espionage.md` |
| Start-of-turn notifications | `information-displays.md` |

---

*Document created: 2026-04-13*  
*MOO1 reference: Original espionage system (spy slider, target selection, start-of-turn results)*

## Detailed Calculation Formulas (UI Context)

### Mission Success Probability Formula
The UI displays the expected success probability to the player before launching a spy mission.
`Probability = Base_Mission_Success + Spy_Effectiveness - Target_Security_Defense`
- **Base_Mission_Success**: 30% for Tech Theft, 40% for Sabotage, 25% for Rebellion, 10% for Assassination.
- **Spy_Effectiveness**: `Racial_Bonus + (Attacker_Computer_Tech_Tier * 2)`
- **Target_Security_Defense**: `(Target_Security_Level * 10) + Racial_Defense_Bonus`

*Note: Displayed probability is clamped between 5% and 95%.*
