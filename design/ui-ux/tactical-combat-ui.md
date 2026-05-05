# Tactical Combat UI

## Overview

Turn-based tactical combat on a hexagonal grid. Inspired by MOO1's auto-resolve option but with full tactical control for players who want it.

> **Implementation Status**: Core combat UI is implemented in `src/ui/screens/CombatScreen.ts`.
> Features marked with 🚧 are designed but not yet implemented.

---

## Combat Initiation

### Pre-Battle Screen
```
╔════════════════════════════════════════════════════════════╗
║                  BATTLE IMMINENT!                          ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  Location: Alpha Centauri System                            ║
║                                                             ║
║  ┌─Your─Forces─────────┐  VS  ┌─Enemy─Forces──────────┐  ║
║  │ Battle Group A      │       │ Guinea Pig Raiders    │  ║
║  │                     │       │                       │  ║
║  │ 3× Destroyer        │       │ 5× Scout Ship         │  ║
║  │ 1× Cruiser          │       │ 2× Fighter            │  ║
║  │                     │       │ 1× Destroyer          │  ║
║  │ Total Strength:     │       │ Total Strength:       │  ║
║  │ ★★★★☆              │       │ ★★☆☆☆                │  ║
║  └─────────────────────┘       └───────────────────────┘  ║
║                                                             ║
║  Tactical Advantage: +20% (Superior Computer Tech)         ║
║                                                             ║
║  ┌─Combat─Options──────────────────────────────────────┐  ║
║  │                                                      │  ║
║  │  [TACTICAL COMBAT]  - Full control (recommended)    │  ║
║  │                                                      │  ║
║  │  [AUTO-RESOLVE]     - Quick result                  │  ║
║  │                                                      │  ║
║  │  [RETREAT]          - Flee battle (50% escape)      │  ║
║  │                                                      │  ║
║  └──────────────────────────────────────────────────────┘  ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

---

## Main Combat Screen

### Full Battle Interface

This is the primary tactical combat view. Ships on the hex grid display HP bars and movement point indicators directly on (or adjacent to) their hex token. The initiative/turn order strip runs along the top of the UI. A combat log panel tracks all events.

```
╔════════════════════════════════════════════════════════════╗
║ TACTICAL COMBAT - Alpha Centauri | Round 3 of max 10      ║
╠════════════════════════════════════════════════════════════╣
║ ┌─Initiative─Strip──────────────────────────────────────┐ ║
║ │▶ [YOUR Dest] [ENM Scout] [YOUR Crus] [ENM Ftr] ...   │ ║
║ │   HP:90/100   HP:30/50    HP:200/200  HP:80/80        │ ║
║ │ (active)                                              │ ║
║ └───────────────────────────────────────────────────────┘ ║
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │                HEX BATTLE GRID                      │  ║
║  │                                                     │  ║
║  │      ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                     │  ║
║  │     ⬡ ⬡ ⬡ [E₁] ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                   │  ║
║  │    ⬡ ⬡ [E₂] ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                    │  ║
║  │    E₁: ██░░ HP  E₂: ████ HP                        │  ║
║  │    MP:3/4        MP:2/4                             │  ║
║  │  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                     │  ║
║  │   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                      │  ║
║  │    ⬡ [Y₁] ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ [Y₂] ⬡                   │  ║
║  │    Y₁: ████ HP  Y₂: ████ HP  ← HP bars per token  │  ║
║  │    MP:4/4 ◀▶   MP:0/4 ✓ done                       │  ║
║  │     ⬡ ⬡ ⬡ [Y₃] ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                     │  ║
║  │    Y₃: ██████ HP   MP:3/4                         │  ║
║  │      ⬡ ⬡ ⬡ ⬡ [Y₄] ⬡ ⬡ ⬡ ⬡                      │  ║
║  │    Y₄: ████████ HP  MP:5/6                        │  ║
║  │                                                     │  ║
║  │  [Y] = Your Ships (Green)   [E] = Enemy (Red)      │  ║
║  │  ██ = HP bar (green→yellow→red as HP drops)        │  ║
║  │  MP = Movement Points left this turn               │  ║
║  │  Highlighted hexes = movement range                │  ║
║  │  ~M~ on grid = in-flight missile token             │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                             ║
║ ┌─Selected─Ship─────────────┐ ┌─Combat─Log──────────────┐ ║
║ │ Destroyer "Vengeance"     │ │ Round 3:                │ ║
║ │ ━━━━━━━━━━━━━━━━━━━━━━━ │ │ • Vengeance moves N     │ ║
║ │ HP:  [████████████░] 90/100│ │ • Scout fires — Miss!   │ ║
║ │ SHD: [█████░░░░░░] 10/14  │ │ • Cruiser fires:        │ ║
║ │ MP:  [████░░░░] 4/6 left  │ │   -45 dmg (Scout)  💥  │ ║
║ │                           │ │ • Scout DESTROYED       │ ║
║ │ Weapons:                  │ │                         │ ║
║ │ • Plasma×4 [READY]        │ │ Round 2:                │ ║
║ │ • Missiles×2 [3 in flight]│ │ • Initiative rolled     │ ║
║ │                           │ │ • Battle begins!        │ ║
║ │ Accuracy: 75% at range 3  │ └─────────────────────────┘ ║
║ │                           │                            ║
║ │ [MOVE] [FIRE] [SPECIAL]   │  ┌─Enemy─Target────────┐  ║
║ │ [WAIT] [DONE]  [RETREAT]  │  │ Scout Ship          │  ║
║ └───────────────────────────┘  │ HP: [██░░] 30/50    │  ║
║                                │ SHD: [░░░░] 0/0     │  ║
║ ┌─Action─Phase──────────────┐  │ Weapons: Laser×2    │  ║
║ │ YOUR TURN — FIRING PHASE  │  │ Distance: 3 hexes   │  ║
║ │ Select weapon and target  │  │ Hit Chance: 75%     │  ║
║ │                           │  └─────────────────────┘  ║
║ └───────────────────────────┘                            ║
╠════════════════════════════════════════════════════════════╣
║ Speed: [SLOW][NORM][FAST][⚡] │ [AUTO-RESOLVE] [RETREAT]  ║
╚════════════════════════════════════════════════════════════╝
```

> 🚧 **Animation Speed Controls**: The Speed bar (SLOW/NORM/FAST/⚡) is not yet implemented.
> Current implementation has instant resolution with floating damage numbers.

**Key UI elements explained:**
- **Initiative strip** (top bar): All ships sorted by speed/initiative, showing faction, name, and HP. Active ship has ▶ marker.
- **HP bars on grid tokens**: Each ship token on the hex grid shows a small HP bar (color coded: green > 50%, yellow 25–50%, red < 25%).
- **MP display on grid tokens**: Movement Points remaining shown as `MP:n/max` below each token. Done ships show `✓ done`.
- **WAIT button**: Ship yields its place in turn order — acts last this round. Useful for letting faster ships close distance.
- **DONE button**: Confirms ship is finished for this round (same as END TURN for that ship).
- **Missiles in flight**: `[3 in flight]` shown in weapon list; missile tokens (~M~) appear on the hex grid and advance each round.
- **Combat log**: Scrollable event log; damage numbers shown inline (e.g. `-45 dmg`).
- **Combat speed bar**: 🚧 Slow / Normal / Fast / Instant — controls animation speed globally (not yet implemented).

---

## Hex Grid Details

### Grid Size
**Standard Combat Grid**:
- 15×15 hexes (225 total)
- Each hex = ~1000 km in-universe
- Ships start 8-10 hexes apart

**Grid Features**:
- Clear hexes (normal space)
- Asteroid hexes (provide cover, -20% to hit)
- Nebula hexes (sensor disruption)
- Planet/Moon (blocks movement, can block line of sight)

### Hex Movement Display
```
     Current Ship Position: [Y]

        ⬢ ⬢ ⬢        Legend:
       ⬢ ⬢ ⬢ ⬢       ⬢ = Reachable (green highlight)
      ⬢ ⬢[Y]⬢ ⬢      ⬡ = Out of range
       ⬢ ⬢ ⬢ ⬢       [E] = Enemy ship
        ⬢ ⬢ ⬢        ⬣ = Asteroid (cover)

     Movement: 3 hexes remaining this turn
     Click hex to move
```


---

## Per-Ship HP Bars and Movement Points (On-Grid Display)

### HP Bar on Ship Tokens

Each ship token on the hex grid renders a small HP bar directly beneath the ship icon. This gives at-a-glance health status without opening the detail panel.

```
     ┌────────────────────────────┐
     │  Token layout (per hex):   │
     │                            │
     │       [Y] or [E]           │
     │    ███████░░░  ← HP bar     │
     │    MP: 3/4                 │  ← movement points
     │                            │
     │  HP bar colors:            │
     │  ████████  Green  (>50% HP)   │
     │  ████████  Yellow (25-50% HP) │
     │  ████████  Red    (<25% HP)   │
     └────────────────────────────┘
```

**Movement Points (MP) display:**
- Shows `MP: n/max` below each token
- Decrements as the ship moves
- `MP: 0/4 ✓ done` when the ship has exhausted its moves
- `MP: 4/4 ◄►` when a ship is selected and waiting for movement input
- Ships that used WAIT show `[WAIT]` tag until they act

**Hover tooltip** (on mouse-over of a token): 🚧 Not yet implemented
```
┌──────────────────────────────────────┐
│ Destroyer "Vengeance" (Yours)       │
│ HP:  90/100  [█████████░░] 90%   │
│ SHD: 10/14   [███████░░░░] 71%   │
│ MP:  4/6     [██████░░░░░] 67%   │
│ Weapons: Plasma×4, Rockets×2          │
│ Speed: 5  Initiative: 3rd          │
└──────────────────────────────────────┘
```

> Ship details are available via click-selection in the ship detail panel on the right side.

---

## Combat Phases (Per Turn)

### Phase Display
```
┌─────────────────────────────────────────────────┐
│ COMBAT TURN PHASES                              │
├─────────────────────────────────────────────────┤
│ ✓ 1. Initiative Roll (Computer determines)      │
│ ✓ 2. Movement Phase (faster ships first)        │
│ → 3. Firing Phase (YOU) ←                       │
│   4. Special Systems Phase                      │
│   5. Damage Resolution                          │
│   6. Check Victory Conditions                   │
└─────────────────────────────────────────────────┘
```

### Initiative Order Display

The **initiative strip** runs across the top of the combat screen as a horizontal band. Ships are listed left-to-right in act order (highest speed first; ties broken by computer level). The currently acting ship has a `▶` marker and is highlighted. When a ship uses **WAIT**, it slides to the end of the strip for this round. Destroyed ships are removed with a strikethrough animation.

```
┌─Initiative─Strip─(top─of─screen)────────────────────────┐
│ ▶[Your Crus] [ENM Ftr] [Your Dest] [ENM Scout] [ENM Dest]  │
│  HP:██████  HP:██████ HP:███████  HP:██░░░░   HP:███████  │
│  200/200   80/80   90/100     30/50     200/200    │
│  Spd 5     Spd 5   Spd 4      Spd 4     Spd 3      │
│(acting now)                                         │
└─────────────────────────────────────────────────────┘
```

**Compact sidebar fallback** (when grid is zoomed in and top strip doesn’t fit):
```
┌─Turn─Order──────────────┐
│ 1. ▶ Your Cruiser (Spd 5)  │
│ 2.   Enemy Fighter (Spd 5) │
│ 3.   Your Dest. (Spd 4)   │
│ 4.   Enemy Scout (Spd 4)  │
│ 5.   Enemy Dest. (Spd 3)  │
└──────────────────────────────┘
▶ = Currently acting
```

---

## Weapon Targeting

### Firing Mode Interface
```
╔════════════════════════════════════════════════════════════╗
║ FIRING PHASE - Select Weapon and Target                   ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║ Active Ship: Destroyer "Vengeance"                         ║
║                                                             ║
║ ┌─Available─Weapons──────────────────────────────────────┐ ║
║ │                                                         │ ║
║ │ (•) Plasma Cannon ×4                                   │ ║
║ │     Damage: 20×4 = 80 total                            │ ║
║ │     Range: 5 hexes                                     │ ║
║ │     Type: Beam (instant hit)                           │ ║
║ │     Ammo: Unlimited                                    │ ║
║ │                                                         │ ║
║ │ ( ) Heavy Rockets ×2                                   │ ║
║ │     Damage: 30×2 = 60 total                            │ ║
║ │     Range: 7 hexes                                     │ ║
║ │     Type: Missile (can be intercepted)                 │ ║
║ │     Ammo: 10 remaining                                 │ ║
║ │                                                         │ ║
║ │ ( ) Point Defense (Auto-fires at missiles)             │ ║
║ │                                                         │ ║
║ └─────────────────────────────────────────────────────────┘ ║
║                                                             ║
║ ┌─Valid─Targets──────────────────────────────────────────┐ ║
║ │                                                         │ ║
║ │ [1] Enemy Scout      Range: 3 hexes  | Hit: 85%       │ ║
║ │     HP: 30/50  Shield: 0/0           | EASY TARGET    │ ║
║ │                                                         │ ║
║ │ [2] Enemy Fighter    Range: 5 hexes  | Hit: 70%       │ ║
║ │     HP: 80/80  Shield: 10/10         | MEDIUM         │ ║
║ │                                                         │ ║
║ │ [3] Enemy Destroyer  Range: 8 hexes  | Hit: OUT OF RANGE║
║ │     HP: 120/120  Shield: 20/20       | TOO FAR        │ ║
║ │                                                         │ ║
║ └─────────────────────────────────────────────────────────┘ ║
║                                                             ║
║ Recommendation: Fire at Scout [1] - Highest hit chance     ║
║                                                             ║
║      [FIRE AT TARGET 1] [FIRE AT TARGET 2] [CANCEL]        ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

### Targeting Overlay (On Grid)
```
     [Y] = Your Ship (firing)

        ⬡ ⬡ ⬡
       ⬡[E₁]⬡ ⬡     E₁ = Target 1 (85% hit) - RED glow
      ⬡ ⬡ ⬡ ⬡ ⬡
     ⬡ ⬡ ⬡[E₂]⬡    E₂ = Target 2 (70% hit) - ORANGE glow
      ⬡[Y]⬡ ⬡ ⬡
       ⬡ ⬡ ⬡ ⬡     Range circles shown
        ⬡ ⬡ ⬡      Weapon range highlighted

     Line of sight indicators
     Cover indicators (if asteroid between)
```

---

## Combat Animations

### Attack Sequence
**Beam Weapons**:
1. Ship glows (0.2s)
2. Beam traces to target instantly (0.3s)
3. Target flashes (0.2s)
4. Damage numbers float up (0.5s)
5. Shield/armor sparkle effect (0.3s)

**Missile Weapons**:
1. Ship launches missile (0.3s)
2. Missile travels hex-by-hex to target (0.5s)
3. Target can fire point defense (0.2s each)
4. Impact explosion (0.4s)
5. Damage numbers (0.5s)

**Ship Destruction**:
1. Critical hit flash (0.3s)
2. Ship breaks apart (0.5s)
3. Explosion effect (0.7s)
4. Debris scatters (0.5s)
5. Remove from grid

### Animation Speed Options

🚧 **Not yet implemented** — current behavior is instant resolution with floating damage numbers.

```
┌─Combat─Speed────────────────┐
│ Animation Speed:            │
│ ( ) Slow (2x time)          │
│ (•) Normal                  │
│ ( ) Fast (0.5x time)        │
│ ( ) Instant (no animations) │
└─────────────────────────────┘
```

---


---

## Missile Tracking (In-Flight Missiles)

Missiles are **persistent tokens** on the hex grid. Unlike beam weapons (which resolve instantly), missiles travel hex-by-hex each round until they reach their target or are destroyed by point defense.

### Missile Token Display
```
     Hex grid after launch:

          [Y] fires rockets
           |
           ↓
     ⬡ ⬡ [~M~] ⬡ ⬡    ← missile token (turn 1)
      ⬡ ⬡ ⬡ ⬡ ⬡
       ⬡ ⬡ [E] ⬡          ← target
```

- `~M~` = missile in flight (animated projectile icon)
- Missiles advance toward target every round
- Multiple missiles show as `~M₂~`, `~M₃~`, etc.
- Point defense ships auto-fire when a missile enters range
- Combat log records each missile's status: **launched / in-flight / intercepted / impact**

### Missile Status in Selected-Ship Panel
```
┌─Selected─Ship─────────────┐
│ Destroyer "Vengeance"     │
│ Weapons:                  │
│ • Plasma×4  [READY]         │
│ • Rockets×2 [3 in flight]  │  ← shows count
│              Round 2 of 4 │  ← ETA to target
│ • Rockets×2 [RELOAD 2]     │  ← reloading
└───────────────────────────┘
```

### Point Defense Auto-Fire
When a missile token enters a ship’s point defense range, PD fires automatically (no player action required). The result appears in the combat log:
- `• PD intercepts missile — DESTROYED`
- `• PD fires at missile — MISSED (continues)`

## Special Systems UI

### Special Actions Panel
```
┌─Special─Systems──────────────────────────────────┐
│ Ship: Battle Cruiser "Dominator"                 │
├───────────────────────────────────────────────────┤
│                                                   │
│ [CLOAK]        Energy: 20/100                     │
│ Become invisible for 3 turns                     │
│ Cooldown: 5 turns                                │
│ Status: READY                                     │
│                                                   │
│ [REPAIR BOTS]  Progress: 10 HP/turn              │
│ Auto-repair hull damage                          │
│ Status: ACTIVE                                    │
│                                                   │
│ [TRACTOR BEAM] Range: 3 hexes                    │
│ Pull enemy ship 2 hexes closer                   │
│ Status: READY                                     │
│                                                   │
│ [TELEPORTER]   Energy: 50/100                    │
│ Jump to any hex (unlimited range)                │
│ Cooldown: 3 turns                                │
│ Status: RECHARGING (2 turns)                     │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## Damage Display

### Hit Feedback
```
     ╔═══════════════════════════╗
     ║   DIRECT HIT!             ║
     ╠═══════════════════════════╣
     ║                           ║
     ║   Plasma Cannon hits      ║
     ║   Enemy Scout!            ║
     ║                           ║
     ║   -20 Shield              ║
     ║   -60 Armor               ║
     ║   ═══════                 ║
     ║   Enemy HP: 30/50         ║
     ║   [███████░░░] 60%        ║
     ║                           ║
     ║   CRITICAL HIT! ×2 damage  ║
     ║                           ║
     ╚═══════════════════════════╝

     (Auto-closes after 1.5s or click)
```

### Floating Damage Numbers
```
        Enemy Ship
           [E]
           ↑
         -80  ← Red damage number floats up
         ↑
        ⚠️ CRIT!  ← Critical indicator
```

---

## Combat Results Screen

### Victory
```
╔════════════════════════════════════════════════════════════╗
║                    BATTLE WON!                             ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  [Victory animation: Your ships triumphant]                ║
║                                                             ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                             ║
║  ┌─Your─Losses──────────┐   ┌─Enemy─Losses──────────┐    ║
║  │ Destroyed:           │   │ Destroyed:            │    ║
║  │ • None!              │   │ • 5× Scout Ship       │    ║
║  │                      │   │ • 2× Fighter          │    ║
║  │ Damaged:             │   │ • 1× Destroyer        │    ║
║  │ • Destroyer (90/100) │   │                       │    ║
║  │ • Cruiser (150/200)  │   │ Total: 8 ships        │    ║
║  └──────────────────────┘   └───────────────────────┘    ║
║                                                             ║
║  Experience Gained:                                         ║
║  • Destroyer "Vengeance": Veteran → Elite (★★★☆☆)        ║
║  • Cruiser "Thunder": Green → Veteran (★★☆☆☆)            ║
║                                                             ║
║  Salvage:                                                   ║
║  • +150 BC (scrap metal)                                    ║
║  • Laser Technology insight (+5% miniaturization)          ║
║                                                             ║
║  Reputation: +5 with all empires (military strength shown) ║
║                                                             ║
║                   [CONTINUE] ⏎                             ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

### Defeat
```
╔════════════════════════════════════════════════════════════╗
║                   BATTLE LOST!                             ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  [Defeat animation: Your ships retreating/destroyed]       ║
║                                                             ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                             ║
║  Your fleet has been defeated!                              ║
║                                                             ║
║  ┌─Your─Losses──────────────────────────────────────────┐  ║
║  │ Destroyed:                                           │  ║
║  │ • Destroyer "Vengeance"                              │  ║
║  │ • Destroyer "Justice"                                │  ║
║  │                                                      │  ║
║  │ Escaped:                                             │  ║
║  │ • Cruiser "Thunder" (badly damaged)                  │  ║
║  │ • Destroyer "Hope" (retreated early)                 │  ║
║  │                                                      │  ║
║  │ Total Lost: 2 ships                                  │  ║
║  └──────────────────────────────────────────────────────┘  ║
║                                                             ║
║  Strategic Situation:                                       ║
║  • Alpha Centauri remains enemy-controlled                  ║
║  • Guinea Pigs gain +10 relations (victory boost)          ║
║  • Your fleet power reduced by 35%                          ║
║                                                             ║
║  Recommendation: Build reinforcements before next assault   ║
║                                                             ║
║                   [CONTINUE] ⏎                             ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

---

## Auto-Resolve Option

### Quick Combat Resolution
```
╔════════════════════════════════════════════════════════════╗
║ AUTO-RESOLVING BATTLE...                                   ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  Processing combat simulation...                            ║
║                                                             ║
║  [████████████████████░░] 90%                              ║
║                                                             ║
║  Turn 5 of estimated 7...                                   ║
║                                                             ║
║  Current Status:                                            ║
║  • Your Forces: 4 ships remaining (good condition)         ║
║  • Enemy Forces: 3 ships remaining (heavily damaged)       ║
║                                                             ║
║  Projected Outcome: VICTORY (85% confidence)                ║
║                                                             ║
║         [STOP AND TAKE CONTROL] [LET FINISH]               ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

**Auto-Resolve Results**:
- Faster gameplay (instant resolution)
- Based on ship stats + dice rolls
- Less optimal than player control
- Good for lopsided battles

---

## Tactical Combat Tips Panel

### In-Battle Help
```
┌─Tactical─Tips─────────────────────────────┐
│                                           │
│ 💡 Combat Tips:                           │
│                                           │
│ • Focus fire: Kill ships one at a time    │
│ • Use cover: Hide behind asteroids        │
│ • Range matters: Close for accuracy       │
│ • Missiles can be shot down               │
│ • Retreat if outmatched                   │
│ • Fast ships move first                   │
│                                           │
│ [HIDE TIPS] [MORE TIPS]                   │
└───────────────────────────────────────────┘
```

---

## Combat Camera Controls

### View Options
```
┌─Camera─Controls──────────┐
│ [↑↓←→] Pan view          │
│ [+/-]  Zoom              │
│ [R]    Rotate grid       │
│ [C]    Center on ship    │
│ [Space] Center on action │
│ [F]    Follow selected   │
└──────────────────────────┘
```

**Zoom Levels**:
- **Close**: See 7×7 hex area (detailed ships)
- **Medium**: See 11×11 hex area (standard)
- **Far**: See full 15×15 grid (strategic overview)

---

## Multi-Fleet Combat

### When 3+ Fleets Battle
```
╔════════════════════════════════════════════════════════════╗
║ MULTI-FACTION BATTLE                                       ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║ Three-way battle at Neutral Zone!                          ║
║                                                             ║
║ ┌─Faction─1─────┐ ┌─Faction─2─────┐ ┌─Faction─3─────┐   ║
║ │ YOU            │ │ Guinea Pigs    │ │ Rats           │   ║
║ │ (Hamsters)     │ │ (Enemy)        │ │ (Neutral)      │   ║
║ │                │ │                │ │                │   ║
║ │ 4 ships        │ │ 6 ships        │ │ 3 ships        │   ║
║ │ Green markers  │ │ Red markers    │ │ Yellow markers │   ║
║ └────────────────┘ └────────────────┘ └────────────────┘   ║
║                                                             ║
║ Turn Order: All factions alternate by speed                ║
║ Victory: Last faction standing or mutual retreat           ║
║                                                             ║
║         [BEGIN COMBAT] [AUTO-RESOLVE] [RETREAT]            ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

**Special Rules**:
- Each faction acts independently
- Alliances can break mid-battle
- Opportunistic targeting allowed
- Last two factions can negotiate mid-fight

---

## Planet Bombardment Combat

### Orbital Bombardment Interface
```
╔════════════════════════════════════════════════════════════╗
║ BOMBARDMENT OF: New Hamsterton                            ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║ ┌─Target─Planet─────────────────────────────────────────┐  ║
║ │                                                        │  ║
║ │        🌍                  Defenses:                   │  ║
║ │    [Planet Img]            • 8 Missile Bases           │  ║
║ │                            • Planetary Shield III      │  ║
║ │  Population: 50M           • Fighter Squadron          │  ║
║ │  Factories: 250                                        │  ║
║ │  Morale: Defiant          Shield: [██████] 60/60      │  ║
║ │                           Bases:  [████████] 8/8       │  ║
║ └────────────────────────────────────────────────────────┘  ║
║                                                             ║
║ ┌─Bombing─Options──────────────────────────────────────┐   ║
║ │                                                       │   ║
║ │ [MILITARY TARGETS]  - Bases, shields, fighters       │   ║
║ │    Reduces defenses, allows invasion                 │   ║
║ │    -10 diplomatic relations                          │   ║
║ │                                                       │   ║
║ │ [FACTORIES]         - Industrial bombardment         │   ║
║ │    Destroys production capability                    │   ║
║ │    Collateral: 5-10M population                      │   ║
║ │    -25 diplomatic relations                          │   ║
║ │                                                       │   ║
║ │ [POPULATION]        - Terror bombing                 │   ║
║ │    Mass casualties to force surrender                │   ║
║ │    10-30M casualties per turn                        │   ║
║ │    -50 diplomatic relations (war crime)              │   ║
║ │                                                       │   ║
║ │ [BIOLOGICAL WEAPON] - Genocidal plague (if unlocked) │   ║
║ │    Wipes out 90% of population                       │   ║
║ │    Planet radioactive for 50 turns                   │   ║
║ │    -100 diplomatic ALL empires (atrocity)            │   ║
║ │    May trigger united war against you                │   ║
║ │                                                       │   ║
║ └───────────────────────────────────────────────────────┘   ║
║                                                             ║
║ [CONTINUE BOMBARDMENT] [LAUNCH INVASION] [CANCEL]          ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

---


---

## Bombardment Phase Trigger (Post-Combat)

Bombardment is **not** part of the tactical combat round sequence. It is triggered **after** combat resolves (either through all enemies destroyed or retreated). The flow is:

```
Space Combat
     ↓ (all enemy ships destroyed or retreated)
[COMBAT RESULT screen]
     ↓ [CONTINUE]
[BOMBARD or INVADE decision screen]
     ↓ player chooses: Bombard / Invade / Leave
[Bombardment UI  -or-  Ground Combat UI]
     ↓ completion
[Return to Galaxy Map]
```

If the player’s ships won but the planet still has defenses (bases, shields), the Bombardment screen opens automatically. If defenses have already been cleared during combat, the player is offered the **LAUNCH INVASION** button immediately.

**State machine note:** `state-transitions.md` §9 should add a `BOMBARDMENT_PHASE` state between `COMBAT_RESULT` and `RETURN_TO_MAP`. See that file for the combat state machine.

## Performance Optimizations

### Low-End Mode
- Reduce hex grid to 11×11
- Simplify ship models
- Disable particle effects
- Cap at 30fps
- Instant damage numbers (no float animation)
- Static backgrounds

### High-End Mode
- Full 15×15 grid with zoom
- Detailed ship models
- Particle effects (explosions, beams, shields)
- Smooth 60fps
- Background star field with parallax
- Dynamic lighting

---

All combat designs optimized for web Canvas/WebGL rendering at 1920×1080. Next: `information-displays.md` for reports and statistics screens.
