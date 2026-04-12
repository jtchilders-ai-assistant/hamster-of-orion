# Tactical Combat UI

## Overview

Turn-based tactical combat on a hexagonal grid. Inspired by MOO1's auto-resolve option but with full tactical control for players who want it.

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
```
╔════════════════════════════════════════════════════════════╗
║ TACTICAL COMBAT - Alpha Centauri | Turn 3 | Round 1/10    ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │                HEX BATTLE GRID                      │  ║
║  │                                                     │  ║
║  │      ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                     │  ║
║  │     ⬡ ⬡ ⬡ ⬡[E]⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                    │  ║
║  │    ⬡ ⬡ ⬡[E]⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                     │  ║
║  │   ⬡ ⬡ ⬡ ⬡[E]⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                    │  ║
║  │  ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                     │  ║
║  │   ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡                      │  ║
║  │    ⬡ ⬡[Y]⬡ ⬡ ⬡ ⬡ ⬡ ⬡ ⬡[Y]⬡                     │  ║
║  │     ⬡ ⬡ ⬡ ⬡[Y]⬡ ⬡ ⬡ ⬡ ⬡ ⬡                      │  ║
║  │      ⬡ ⬡ ⬡ ⬡ ⬡[Y]⬡ ⬡ ⬡ ⬡                       │  ║
║  │                                                     │  ║
║  │  [Y] = Your Ships (Green)                          │  ║
║  │  [E] = Enemy Ships (Red)                           │  ║
║  │  ⬡ = Empty space                                   │  ║
║  │  Highlighted hexes = Movement range                │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                             ║
║ ┌─Selected─Ship─────────────┐ ┌─Combat─Log──────────────┐ ║
║ │ Destroyer "Vengeance"     │ │ Turn 3:                 │ ║
║ │ ━━━━━━━━━━━━━━━━━━━━━━━ │ │ • Your Destroyer moves  │ ║
║ │ HP: [████████████░] 90/100│ │ • Enemy Scout fires     │ ║
║ │ Shield: [█████░░] 10/14   │ │   Miss!                 │ ║
║ │                           │ │ • Your Cruiser fires    │ ║
║ │ Weapons:                  │ │   HIT! 45 damage        │ ║
║ │ • Plasma×4 [READY]        │ │ • Enemy Scout destroyed │ ║
║ │ • Missiles×2 [READY]      │ │                         │ ║
║ │                           │ │ Turn 2:                 │ ║
║ │ Movement: 4 hexes left    │ │ • Initiative roll...    │ ║
║ │ Accuracy: 75% at range 3  │ │ • Battle begins!        │ ║
║ │                           │ └─────────────────────────┘ ║
║ │ [MOVE] [FIRE] [SPECIAL]   │                            ║
║ │ [END TURN] [RETREAT]      │  ┌─Enemy─Target────────┐  ║
║ └───────────────────────────┘  │ Scout Ship          │  ║
║                                │ HP: 30/50           │  ║
║ ┌─Action─Phase──────────────┐  │ Shield: 0/0         │  ║
║ │ FIRING PHASE              │  │ Weapons:            │  ║
║ │ Select weapon and target  │  │ • Laser×2           │  ║
║ │                           │  │ Distance: 3 hexes   │  ║
║ │ Your Turn!                │  │ Hit Chance: 75%     │  ║
║ └───────────────────────────┘  └─────────────────────┘  ║
╠════════════════════════════════════════════════════════════╣
║ [AUTO-FINISH] [RETREAT] [OPTIONS] [END TURN ⏎]            ║
╚════════════════════════════════════════════════════════════╝
```

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
```
┌─Turn─Order───────────────────┐
│ 1. ▶ Your Cruiser (Speed 5) │
│ 2.   Enemy Fighter (Speed 5) │
│ 3.   Your Destroyer (Speed 4)│
│ 4.   Enemy Scout (Speed 4)   │
│ 5.   Your Destroyer (Speed 4)│
│ 6.   Enemy Destroyer (Speed 3│
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
│ Jump to any hex within 5 spaces                  │
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
