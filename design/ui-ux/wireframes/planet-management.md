# Planet Management UI - Detailed Wireframe Specification

## Overview

The Planet Management screen (F2) is the primary interface for managing individual colonies in Hamster of Orion. This screen provides control over the five production sliders, displays population and factory statistics, manages the building queue, and shows ship construction progress. This specification provides detailed ASCII wireframes matching MOO1 behavior with modern web enhancements.

**Reference**: Master of Orion (1993) Colony Management Screen  
**Hotkey**: F2  
**Target Resolution**: 1920×1080 (scalable)

---

## Screen Layout: Full View (Single Planet)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2623 - Turn 15  │  Treasury: 1,850 BC  │ [F1][F2][F3][F4][F5][F6]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║  [◀ PREV]     ★ NEW HAMSTERTON - Sol System                                      [NEXT ▶]       ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║
║                                                                                                   ║
║  ┌────────────────────────┐    ┌───────────────────────────────────────────────────────────────┐ ║
║  │                        │    │  PRODUCTION ALLOCATION                                         │ ║
║  │   ┌──────────────────┐ │    │  ═══════════════════════════════════════════════════════════  │ ║
║  │   │                  │ │    │                                                                │ ║
║  │   │                  │ │    │  🚀 SHIP          [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓] 35% │ ║
║  │   │   [PLANET        │ │    │                           └─ +53 BC/turn → Cruiser (142/400)  │ ║
║  │   │    PORTRAIT]     │ │    │                                                                │ ║
║  │   │                  │ │    │  🛡️ DEF           [🔓]  [░░░░░░░░░░░░░░░░░░░░▓▓▓▓░░░░░░░░░░] 15% │ ║
║  │   │   🌍 TERRAN      │ │    │                           └─ +23 BC/turn → Missile Base 7/10  │ ║
║  │   │                  │ │    │                                                                │ ║
║  │   │                  │ │    │  🏭 IND           [🔓]  [░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░] 30% │ ║
║  │   └──────────────────┘ │    │                           └─ +45 BC/turn → Factories +5/turn  │ ║
║  │                        │    │                                                                │ ║
║  │  Type: Terran          │    │  🌿 ECO           [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓░░] 15% │ ║
║  │  Size: Large (80 max)  │    │                           └─ +23 BC/turn → Cleanup (5 waste)  │ ║
║  │  Gravity: 1.0g (Normal)│    │                                                                │ ║
║  │  Special: RICH (+50%)  │    │  🔬 TECH          [🔒]  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓░░░░░]  5% │ ║
║  │  Morale: 😊 Happy      │    │                           └─ +8 RP/turn                        │ ║
║  │                        │    │                                                                │ ║
║  │ ─────────────────────  │    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ║
║  │                        │    │  TOTAL:  152 BC/turn  │  [🔄 AUTO-BALANCE]  [🔒 LOCK ALL]      │ ║
║  │  👥 POPULATION         │    └───────────────────────────────────────────────────────────────┘ ║
║  │  ═══════════════════   │                                                                      ║
║  │  Current:  45 / 80 M   │    ┌───────────────────────────────────────────────────────────────┐ ║
║  │  [████████████░░░░░░]  │    │  SHIP CONSTRUCTION                                            │ ║
║  │                        │    │  ═══════════════════════════════════════════════════════════  │ ║
║  │  Workers:    38 M      │    │                                                                │ ║
║  │  Scientists:  7 M      │    │  Building: CRUISER "SUNFLOWER MK II"                          │ ║
║  │  Growth: +2.5M/turn    │    │  ┌──────────────────────────────────────────────────────────┐ │ ║
║  │                        │    │  │  ┌──────────┐  Cost: 400 BC                              │ │ ║
║  │ ─────────────────────  │    │  │  │          │  Progress: 142 / 400 BC                    │ │ ║
║  │                        │    │  │  │  [SHIP   │  [███████████████░░░░░░░░░░░░░░░░░░░░░] 36%│ │ ║
║  │  🏭 FACTORIES          │    │  │  │   IMG]   │  ETA: 5 turns at current rate              │ │ ║
║  │  ═══════════════════   │    │  │  │          │                                            │ │ ║
║  │  Built:    190 / 480   │    │  │  └──────────┘  Stats: HP 250 │ Attack +25% │ Speed 3    │ │ ║
║  │  [████████████░░░░░░]  │    │  │                                                          │ │ ║
║  │                        │    │  └──────────────────────────────────────────────────────────┘ │ ║
║  │  Operating:  190       │    │                                                                │ ║
║  │  Idle:         0       │    │  [CHANGE SHIP]  [VIEW DESIGN]  [CANCEL BUILD]                 │ ║
║  │  Output: 190 BC/turn   │    │                                                                │ ║
║  │  (×1.5 Rich bonus)     │    │  Ship Queue: Cruiser → Cruiser → Cruiser (×3 queued)         │ ║
║  │                        │    └───────────────────────────────────────────────────────────────┘ ║
║  │ ─────────────────────  │                                                                      ║
║  │                        │    ┌───────────────────────────────────────────────────────────────┐ ║
║  │  🛡️ DEFENSES           │    │  PLANETARY BUILDINGS & QUEUE                                   │ ║
║  │  ═══════════════════   │    │  ═══════════════════════════════════════════════════════════  │ ║
║  │  Missile Bases:  7/10  │    │                                                                │ ║
║  │  Shield Level: Class II│    │  ✅ BUILT:                                                     │ ║
║  │  Ground Troops: 45M    │    │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │ ║
║  │  (+25% Guinea Pig)     │    │  │ 🏠 Colony Base │ │ 🔬 Research    │ │ 🤖 Robotic     │     │ ║
║  │                        │    │  │                │ │    Lab II      │ │    Controls III│     │ ║
║  │ ─────────────────────  │    │  └────────────────┘ └────────────────┘ └────────────────┘     │ ║
║  │                        │    │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │ ║
║  │  🌿 ECOLOGY            │    │  │ 🛡️ Planetary   │ │ 🏭 Industrial  │ │ 🌱 Soil        │     │ ║
║  │  ═══════════════════   │    │  │    Shield II   │ │    Tech 8      │ │    Enrichment  │     │ ║
║  │  Waste: 5 / turn       │    │  └────────────────┘ └────────────────┘ └────────────────┘     │ ║
║  │  Cleanup: 3 BC/unit    │    │                                                                │ ║
║  │  Terraform: +20 (done) │    │  🚧 AVAILABLE TO BUILD:                                        │ ║
║  │                        │    │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │ ║
║  └────────────────────────┘    │  │ 🧬 Cloning     │ │ 🌍 Atmospheric │ │ 🛡️ Shield III  │     │ ║
║                                │  │    Center      │ │    Terraform   │ │    (150 BC)    │     │ ║
║                                │  │    (75 BC)     │ │    (200 BC)    │ │                │     │ ║
║                                │  │  [BUILD]       │ │  [BUILD]       │ │  [LOCKED 🔒]   │     │ ║
║                                │  └────────────────┘ └────────────────┘ └────────────────┘     │ ║
║                                └───────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  [📋 PLANET LIST]  [🗺️ VIEW ON MAP]  [📤 TRANSFER POP]                         [END TURN ⏎]    ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Production Sliders - Detailed Specification

### Slider Component Layout

Each of the five production sliders follows this detailed pattern:

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                │
│  🚀 SHIP          [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓] 35%                │
│     └─ Label           │  └─ Slider Track ─────────────────┘  └─ Percentage   │
│                        │                                                       │
│                   Lock Button                                                  │
│                                                                                │
│                           └─ +53 BC/turn → Cruiser (142/400)                  │
│                              └─ Output ────────────┴─ Progress                │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### The Five Sliders

#### 1. SHIP (Ship Construction)
```
🚀 SHIP          [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓] 35%
                        └─ +53 BC/turn → Cruiser (142/400)
```

| Element | Value Display | Notes |
|---------|---------------|-------|
| Icon | 🚀 | Rocket/spaceship |
| Lock State | 🔓 Unlocked / 🔒 Locked | Click to toggle |
| Slider | Visual percentage fill | Draggable |
| Percentage | 0-100% | Right-aligned |
| BC Output | "+X BC/turn" | Production per turn |
| Ship Name | Current ship building | From design |
| Progress | (Current/Total BC) | Cost tracking |

**Tooltip (hover on slider):**
```
┌────────────────────────────────────────┐
│ SHIP CONSTRUCTION                      │
│ ══════════════════════════════════════│
│ Currently Building: Cruiser            │
│ Design: "Sunflower MK II"              │
│                                        │
│ Production Allocated: 53 BC/turn       │
│ Progress: 142 / 400 BC (36%)          │
│ Estimated Completion: 5 turns          │
│                                        │
│ ─────────────────────────────────────  │
│ Drag slider to adjust allocation       │
│ Hold Shift for 1% increments          │
│ Double-click for quick set to 100%    │
└────────────────────────────────────────┘
```

---

#### 2. DEF (Defense / Missile Bases)
```
🛡️ DEF           [🔓]  [░░░░░░░░░░░░░░░░░░░░▓▓▓▓░░░░░░░░░░] 15%
                        └─ +23 BC/turn → Missile Base 7/10
```

| Element | Value Display | Notes |
|---------|---------------|-------|
| Icon | 🛡️ | Shield/defense |
| BC Output | Production per turn | Goes to base construction |
| Base Count | "X/Y" | Current / Max missile bases |

**When building bases:**
- Shows current/max missile base count
- Shows progress toward next base
- After max bases, automatically redirects to shields

**When max bases reached:**
```
🛡️ DEF           [🔓]  [░░░░░░░░░░░░░░░░░░░░▓▓▓▓░░░░░░░░░░] 15%
                        └─ +23 BC/turn → Shield III (45%)
```

---

#### 3. IND (Industry / Factories)
```
🏭 IND           [🔓]  [░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░] 30%
                        └─ +45 BC/turn → Factories +5/turn
```

| Element | Value Display | Notes |
|---------|---------------|-------|
| Icon | 🏭 | Factory building |
| BC Output | Production allocated | Total to industry |
| Factory Rate | "+X/turn" | How many factories built per turn |

**Factory Progress Display:**
```
Factories: 190 / 480 (39%)
Building: +5/turn (Factory Cost: 9 BC)
Full Capacity ETA: 58 turns
```

**When factory cap reached:**
```
🏭 IND           [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  0%
                        └─ Factory Limit Reached (480/480)
                           Excess → Reserve Fund
```

---

#### 4. ECO (Ecology / Terraforming)
```
🌿 ECO           [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓░░] 15%
                        └─ +23 BC/turn → Cleanup (5 waste)
```

| Element | Value Display | Notes |
|---------|---------------|-------|
| Icon | 🌿 | Plant/ecology |
| BC Output | Production allocated | For waste cleanup |
| Status | Varies by planet state | See below |

**ECO Status Modes:**

**Mode 1: Pollution Cleanup (Normal)**
```
└─ +23 BC/turn → Cleanup (5 waste remaining)
```

**Mode 2: Terraforming Active**
```
└─ +23 BC/turn → Terraforming +10 pop capacity (65%)
```

**Mode 3: Atmosphere Transformation**
```
└─ +23 BC/turn → Hostile → Barren (4 turns)
```

**Mode 4: Fully Cleaned (Optimal)**
```
└─ Ecology Balanced ✓ (minimum allocation)
```

**ECO Warning States:**
```
⚠️ ECO           [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  0%
                        └─ ⚠️ POLLUTION CRISIS - Pop declining!
                           (15 waste, need 8 BC/turn minimum)
```

---

#### 5. TECH (Research)
```
🔬 TECH          [🔒]  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓░░░░░]  5%
                        └─ +8 RP/turn
```

| Element | Value Display | Notes |
|---------|---------------|-------|
| Icon | 🔬 | Microscope/research |
| RP Output | "+X RP/turn" | Research points |
| Lock Default | Often locked | Strategic choice |

**Note:** Research slider produces Research Points (RP), not BC. The conversion depends on research labs and population scientists.

---

### Slider Interaction States

#### State 1: Default (Unlocked, Adjustable)
```
🚀 SHIP          [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓] 35%
                        │                       ↑
                        │              Drag handle visible
                        └── Click anywhere on track to set
```

#### State 2: Locked
```
🚀 SHIP          [🔒]  [░░░░░░░░░░░░░░░░░░░░░░░░████████] 35%
                  ↑     └── Solid color (not draggable)
                  │
            Lock icon (red/closed)
            Click to unlock
```

#### State 3: Hover (Ready to Drag)
```
🚀 SHIP          [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓] 35%
                        └── Highlight effect ──────┘ │
                                                     └── Cursor: grab
```

#### State 4: Active Drag
```
🚀 SHIP          [🔓]  [░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 45%
                        └── Live update ───────────────┘ │
                                                         └── Cursor: grabbing
                                                         
Other sliders auto-adjust to maintain 100% total
```

#### State 5: Warning (Insufficient Allocation)
```
⚠️ ECO           [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  0%
↑                       └── Red border / pulsing animation
Warning icon            └─ ⚠️ POLLUTION BUILDING UP!
```

#### State 6: Maxed Out / Completed
```
🏭 IND           [─]  [████████████████████████████████████] ✓
                  ↑    └── Green fill, checkmark icon
             Disabled (grayed out lock)
                       └─ Factory Limit Reached ✓
```

---

### Slider Adjustment Rules

#### Basic Rules (MOO1 Faithful)
1. Total of all five sliders must equal 100%
2. Locked sliders cannot be adjusted
3. When one slider increases, unlocked sliders decrease proportionally
4. Minimum allocation for each slider is 0%
5. When dragging, other unlocked sliders auto-balance

#### Adjustment Algorithm

```pseudocode
function adjust_slider(target_slider, new_value):
    # Get all unlocked sliders except target
    unlocked = [s for s in sliders if not s.locked and s != target_slider]
    
    # Calculate delta
    old_value = target_slider.value
    delta = new_value - old_value
    
    # Cannot adjust if no other sliders are unlocked
    if len(unlocked) == 0:
        return FAIL
    
    # Calculate total available to take from
    total_available = sum(s.value for s in unlocked)
    
    # Cannot exceed available
    if delta > total_available:
        new_value = old_value + total_available
        delta = total_available
    
    # Distribute change proportionally among unlocked sliders
    for slider in unlocked:
        if total_available > 0:
            proportion = slider.value / total_available
            slider.value -= delta * proportion
            slider.value = max(0, slider.value)  # Floor at 0
    
    target_slider.value = new_value
    
    # Normalize to exactly 100%
    normalize_to_100(sliders)
```

#### Special Interactions

**Shift+Drag**: Fine-tune mode (1% increments)
```
🚀 SHIP          [🔓]  [░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓│] 35%
                                              Snap indicator ↑
```

**Double-Click**: Quick set to 100%
```
# Double-click on SHIP slider
🚀 SHIP          [🔓]  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%
# All other unlocked sliders go to 0%
```

**Right-Click**: Context menu
```
┌────────────────────────┐
│ Set to 100%            │
│ Set to 50%             │
│ Set to 0%              │
│ ─────────────────────  │
│ Lock Slider            │
│ Lock All Others        │
│ ─────────────────────  │
│ Copy to All Colonies   │
└────────────────────────┘
```

---

## Population Display Panel

```
┌────────────────────────┐
│                        │
│  👥 POPULATION         │
│  ═══════════════════   │
│                        │
│  Current:  45 / 80 M   │ ← Current / Maximum
│  [████████████░░░░░░]  │ ← Visual bar
│                        │
│  Workers:    38 M      │ ← Assigned to production
│  Scientists:  7 M      │ ← Assigned to research
│  Growth: +2.5M/turn    │ ← Growth rate
│                        │
└────────────────────────┘
```

### Population Breakdown Detail

**Tooltip on Workers:**
```
┌─────────────────────────────────────┐
│ WORKER ALLOCATION                   │
│ ═══════════════════════════════════│
│ Total Population:      45M          │
│ Assigned to Industry:  38M (84%)    │
│ Assigned to Research:   7M (16%)    │
│                                     │
│ Factory Capacity:                   │
│   Workers × Controls = Max Factories│
│   38M × 5 (RC IV) = 190 operable   │
│                                     │
│ Factories built: 190                │
│ All factories operational ✓         │
└─────────────────────────────────────┘
```

**Tooltip on Growth:**
```
┌─────────────────────────────────────┐
│ POPULATION GROWTH                   │
│ ═══════════════════════════════════│
│ Base Growth Rate:      2% / turn    │
│ Planet Environment:    +0.5%        │
│ Racial Bonus:          +0%          │
│ Cloning Center:        Not built    │
│ ─────────────────────────────────── │
│ Effective Rate:        2.5%         │
│ Growth per Turn:       +2.5M        │
│                                     │
│ Time to Max (80M):     14 turns     │
└─────────────────────────────────────┘
```

---

## Factory Display Panel

```
┌────────────────────────┐
│                        │
│  🏭 FACTORIES          │
│  ═══════════════════   │
│                        │
│  Built:    190 / 480   │ ← Current / Maximum
│  [████████████░░░░░░]  │ ← Visual bar
│                        │
│  Operating:  190       │ ← Workers can operate
│  Idle:         0       │ ← Built but no workers
│  Output: 190 BC/turn   │ ← Base production
│  (×1.5 Rich bonus)     │ ← Planet special
│                        │
└────────────────────────┘
```

### Factory States

**Normal (All Operational):**
```
Operating:  190
Idle:         0 ✓
```

**Worker Shortage (Idle Factories):**
```
Operating:  150
Idle:        40 ⚠️ (Need +8M population)
```

**Tooltip (click on factory section):**
```
┌─────────────────────────────────────────────┐
│ FACTORY DETAILS                             │
│ ═══════════════════════════════════════════│
│ Factories Built:           190              │
│ Maximum (Planet):          480 (80 pop × 6) │
│ ─────────────────────────────────────────── │
│ Workers Available:         38M              │
│ Robotic Controls Level:    IV (5:1 ratio)   │
│ Max Operable:              190 factories    │
│ Currently Operating:       190 (100%)       │
│ ─────────────────────────────────────────── │
│ Base Output:               190 BC/turn      │
│ Planet Modifier (Rich):    ×1.5             │
│ Racial Modifier:           ×1.0             │
│ ─────────────────────────────────────────── │
│ EFFECTIVE OUTPUT:          285 BC/turn      │
│ ─────────────────────────────────────────── │
│ Factory Construction Cost: 9 BC (IT-8)      │
│ Building Rate (30%):       +5/turn          │
│ Time to Max Factories:     58 turns         │
└─────────────────────────────────────────────┘
```

---

## Defense Display Panel

```
┌────────────────────────┐
│                        │
│  🛡️ DEFENSES           │
│  ═══════════════════   │
│                        │
│  Missile Bases:  7/10  │ ← Current / Maximum
│  Shield Level: Class II│ ← Planetary shield
│  Ground Troops: 45M    │ ← Population as troops
│  (+25% Guinea Pig)     │ ← Racial bonus
│                        │
└────────────────────────┘
```

### Defense Tooltip

```
┌─────────────────────────────────────────────┐
│ PLANETARY DEFENSES                          │
│ ═══════════════════════════════════════════│
│ MISSILE BASES                               │
│ ─────────────────────────────────────────── │
│ Built: 7 / 10 maximum                       │
│ Weapons: Nuclear Missiles (10-40 dmg)       │
│ Shields: Class II (absorbs 2 damage)        │
│ Computer: Mk III (+30% accuracy)            │
│ ─────────────────────────────────────────── │
│ PLANETARY SHIELD                            │
│ ─────────────────────────────────────────── │
│ Level: Class II                             │
│ Bombardment Reduction: 10%                  │
│ ─────────────────────────────────────────── │
│ GROUND DEFENSE                              │
│ ─────────────────────────────────────────── │
│ Population: 45M (all defend if invaded)     │
│ Combat Bonus: +25% (Guinea Pig racial)      │
│ Ground Tech: Fusion Rifles (+15%)           │
│ Effective Strength: 63M equivalent          │
└─────────────────────────────────────────────┘
```

---

## Ecology Display Panel

```
┌────────────────────────┐
│                        │
│  🌿 ECOLOGY            │
│  ═══════════════════   │
│                        │
│  Waste: 5 / turn       │ ← Pollution generated
│  Cleanup: 3 BC/unit    │ ← Cost per waste unit
│  Terraform: +20 (done) │ ← Extra pop capacity
│                        │
└────────────────────────┘
```

### Ecology States

**Stable (Cleaned):**
```
Waste: 5 / turn
Cleanup: 15 BC/turn (Balanced ✓)
```

**Pollution Building:**
```
Waste: 12 / turn ⚠️
Cleanup: 6 BC/turn
Accumulated: 24 units (Pop -1M next turn!)
```

**Terraforming in Progress:**
```
Terraform: +15 / +20 (75%)
ETA: 4 turns
```

---

## Ship Construction Panel

### Building Ship State

```
┌───────────────────────────────────────────────────────────────┐
│  SHIP CONSTRUCTION                                            │
│  ═══════════════════════════════════════════════════════════  │
│                                                                │
│  Building: CRUISER "SUNFLOWER MK II"                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ┌──────────┐  Cost: 400 BC                              │ │
│  │  │          │  Progress: 142 / 400 BC                    │ │
│  │  │  [SHIP   │  [███████████████░░░░░░░░░░░░░░░░░░░░░] 36%│ │
│  │  │   IMG]   │  ETA: 5 turns at current rate              │ │
│  │  │          │                                            │ │
│  │  └──────────┘  Stats: HP 250 │ Attack +25% │ Speed 3    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [CHANGE SHIP]  [VIEW DESIGN]  [CANCEL BUILD]                 │
│                                                                │
│  Ship Queue: Cruiser → Cruiser → Cruiser (×3 queued)         │
└───────────────────────────────────────────────────────────────┘
```

### No Ship Selected State

```
┌───────────────────────────────────────────────────────────────┐
│  SHIP CONSTRUCTION                                            │
│  ═══════════════════════════════════════════════════════════  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │            No ship currently in production               │ │
│  │                                                          │ │
│  │                 [SELECT SHIP TO BUILD]                   │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Available Designs:                                            │
│  Scout │ Fighter │ Destroyer │ Cruiser │ Battleship │ Titan  │
└───────────────────────────────────────────────────────────────┘
```

### Ship Selection Modal

When clicking [CHANGE SHIP] or [SELECT SHIP TO BUILD]:

```
╔══════════════════════════════════════════════════════════════════════════╗
║  SELECT SHIP TO BUILD                                              [×]   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Your Ship Designs (6 max):                                              ║
║  ═══════════════════════════════════════════════════════════════════════ ║
║                                                                          ║
║  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       ║
║  │ 🚀 Scout         │  │ 🚀 Fighter       │  │ 🚀 Destroyer     │       ║
║  │ "Pellet Runner"  │  │ "Whisker MK I"   │  │ "Hamster Fist"   │       ║
║  │ ┌────────────┐   │  │ ┌────────────┐   │  │ ┌────────────┐   │       ║
║  │ │            │   │  │ │            │   │  │ │            │   │       ║
║  │ │ [Scout Img]│   │  │ │[Fight Img] │   │  │ │[Destr Img] │   │       ║
║  │ │            │   │  │ │            │   │  │ │            │   │       ║
║  │ └────────────┘   │  │ └────────────┘   │  │ └────────────┘   │       ║
║  │ Cost: 25 BC      │  │ Cost: 45 BC      │  │ Cost: 150 BC     │       ║
║  │ ETA: <1 turn     │  │ ETA: 1 turn      │  │ ETA: 3 turns     │       ║
║  │                  │  │                  │  │                  │       ║
║  │ [SELECT]         │  │ [SELECT]         │  │ [SELECT]         │       ║
║  └──────────────────┘  └──────────────────┘  └──────────────────┘       ║
║                                                                          ║
║  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       ║
║  │ 🚀 Cruiser       │  │ 🚀 Battleship    │  │ ✚ New Design     │       ║
║  │ "Sunflower MkII" │  │ "Wheel Master"   │  │                  │       ║
║  │ ┌────────────┐   │  │ ┌────────────┐   │  │ ┌────────────┐   │       ║
║  │ │            │   │  │ │            │   │  │ │    + + +   │   │       ║
║  │ │[Cruis Img] │   │  │ │[Battl Img] │   │  │ │   + + +    │   │       ║
║  │ │            │   │  │ │            │   │  │ │    + + +   │   │       ║
║  │ └────────────┘   │  │ └────────────┘   │  │ └────────────┘   │       ║
║  │ Cost: 400 BC     │  │ Cost: 1200 BC    │  │                  │       ║
║  │ ETA: 5 turns     │  │ ETA: 15 turns    │  │ Open Ship Design │       ║
║  │                  │  │                  │  │ (F6)             │       ║
║  │ [SELECT] ◀───────│  │ [SELECT]         │  │ [GO TO DESIGN]   │       ║
║  └──────────────────┘  └──────────────────┘  └──────────────────┘       ║
║                                                                          ║
║  Queue Options:  [BUILD ×1]  [BUILD ×5]  [BUILD ×10]  [BUILD FOREVER]   ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Building Queue Panel

```
┌───────────────────────────────────────────────────────────────┐
│  PLANETARY BUILDINGS & QUEUE                                   │
│  ═══════════════════════════════════════════════════════════  │
│                                                                │
│  ✅ BUILT:                                                     │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │ 🏠 Colony Base │ │ 🔬 Research    │ │ 🤖 Robotic     │     │
│  │                │ │    Lab II      │ │    Controls III│     │
│  └────────────────┘ └────────────────┘ └────────────────┘     │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │ 🛡️ Planetary   │ │ 🏭 Industrial  │ │ 🌱 Soil        │     │
│  │    Shield II   │ │    Tech 8      │ │    Enrichment  │     │
│  └────────────────┘ └────────────────┘ └────────────────┘     │
│                                                                │
│  🚧 AVAILABLE TO BUILD:                                        │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │ 🧬 Cloning     │ │ 🌍 Atmospheric │ │ 🛡️ Shield III  │     │
│  │    Center      │ │    Terraform   │ │    (150 BC)    │     │
│  │    (75 BC)     │ │    (200 BC)    │ │                │     │
│  │  [BUILD]       │ │  [BUILD]       │ │  [LOCKED 🔒]   │     │
│  └────────────────┘ └────────────────┘ └────────────────┘     │
└───────────────────────────────────────────────────────────────┘
```

### Building Card States

**Built (Complete):**
```
┌────────────────┐
│ ✅ Research    │ ← Checkmark indicator
│    Lab II      │
│                │
│    [INFO]      │ ← Hover for stats
└────────────────┘
```

**Available to Build:**
```
┌────────────────┐
│ 🧬 Cloning     │
│    Center      │
│    (75 BC)     │ ← Cost display
│  [BUILD]       │ ← Action button
└────────────────┘
```

**Locked (Need Tech):**
```
┌────────────────┐
│ 🔒 Shield III  │ ← Lock icon
│    (150 BC)    │
│                │
│ Need: Force    │ ← Requirement
│ Fields IV      │
└────────────────┘
```

**Currently Building:**
```
┌────────────────┐
│ 🚧 Cloning     │ ← Construction icon
│    Center      │
│ [██████░░░] 60%│ ← Progress bar
│  [CANCEL]      │
└────────────────┘
```

---

## Planet Special Indicators

### Rich Planet
```
┌────────────────────────┐
│  Special: RICH (+50%)  │
│  ━━━━━━━━━━━━━━━━━━━   │
│  ⭐ Production ×1.5    │
│  Factory output boosted│
└────────────────────────┘
```

### Poor Planet
```
┌────────────────────────┐
│  Special: POOR (-50%)  │
│  ━━━━━━━━━━━━━━━━━━━   │
│  ⬇️ Production ×0.5    │
│  Consider relocating   │
└────────────────────────┘
```

### Ultra-Rich
```
┌────────────────────────┐
│  Special: ULTRA RICH   │
│  ━━━━━━━━━━━━━━━━━━━   │
│  ⭐⭐ Production ×2.0   │
│  Maximum output!       │
└────────────────────────┘
```

### Artifacts World
```
┌────────────────────────┐
│  Special: ARTIFACTS    │
│  ━━━━━━━━━━━━━━━━━━━   │
│  🏛️ Research ×2.0      │
│  Ancient tech found!   │
└────────────────────────┘
```

---

## Planet Navigation

### Previous/Next Planet Navigation

```
╔══════════════════════════════════════════════════════════════════════════╗
║  [◀ PREV]     ★ NEW HAMSTERTON - Sol System                [NEXT ▶]     ║
║    Jungle       └─ Current Planet ────────────┘             Desert       ║
║   Paradise                                                  Outpost      ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Keyboard Navigation:**
- `←` Previous planet
- `→` Next planet
- `1-9` Jump to planet by number
- `Home` Jump to homeworld

### Planet List View

Clicking [📋 PLANET LIST] shows:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  YOUR COLONIES (3)                                        Sort by: [Name ▼]  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  │ Name              │ System    │ Pop    │ Prod  │ Building       │ Status ║
║  ├───────────────────┼───────────┼────────┼───────┼────────────────┼────────║
║  │ ★ New Hamsterton  │ Sol       │ 45/80M │ 152BC │ Cruiser (36%)  │ ✓ OK  ║
║  │   Jungle Paradise │ Alpha     │ 28/60M │  85BC │ Research Lab   │ ✓ OK  ║
║  │   Desert Outpost  │ Beta      │ 12/40M │  35BC │ Factories      │ ⚠️ Pol ║
║                                                                              ║
║  TOTALS:                         │ 85M    │ 272BC │                │        ║
║                                                                              ║
║  [MANAGE ALL: Auto-Balance] [MANAGE ALL: Max Industry] [MANAGE ALL: Research]║
║                                                                              ║
║                                           [CLOSE] [SELECT PLANET]            ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Transfer Population Modal

When clicking [📤 TRANSFER POP]:

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  TRANSFER POPULATION                                                    [×]   ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  FROM: New Hamsterton (45M)                                                   ║
║                                                                               ║
║  Transfer Amount: [─────────────●─────] 10M                                   ║
║                   0M                   45M                                    ║
║                                                                               ║
║  TO: Select Destination ▼                                                     ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │  ○ Jungle Paradise (28/60M) - 4 turns travel - Capacity: 32M           │ ║
║  │  ● Desert Outpost (12/40M)  - 3 turns travel - Capacity: 28M ◀         │ ║
║  │  ○ New Colony Alpha (5/50M) - 6 turns travel - Capacity: 45M           │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
║  Transport Ships Required: 2 (10M ÷ 5M per transport)                         ║
║  Available Transports: 5 (in orbit or 1 turn away)                           ║
║                                                                               ║
║  ⚠️ Warning: Removing 10M will idle 50 factories (need more workers)         ║
║                                                                               ║
║                              [CANCEL]  [CONFIRM TRANSFER]                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## Responsive Behavior

### Desktop (1920×1080) - Full Layout
- All panels visible as shown in wireframes
- Two-column layout (planet info | production controls)
- Rich tooltips on hover

### Laptop (1366×768) - Compact Layout

```
╔══════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION  │  Year 2623  │  1,850 BC  │ [F1][F2][F3]... ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  [◀]  ★ NEW HAMSTERTON - Sol System                            [▶]  ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                                      ║
║  ┌─────────────────┐  ┌──────────────────────────────────────────┐  ║
║  │ [Planet] Terran │  │ SLIDERS           Total: 152 BC/turn    │  ║
║  │  Pop: 45/80M    │  │ 🚀SHIP [░░░░░░░▓▓▓] 35% → Cruiser      │  ║
║  │  Fact: 190/480  │  │ 🛡️DEF  [░░░░▓▓░░░░] 15% → Base 7/10    │  ║
║  │  Base: 7/10     │  │ 🏭IND  [░░░▓▓▓▓▓░░] 30% → +5 Fact      │  ║
║  │  Special: RICH  │  │ 🌿ECO  [░░░░░▓▓▓░░] 15% → Cleanup      │  ║
║  └─────────────────┘  │ 🔬TECH [░░░░░░░▓░░]  5% → +8 RP        │  ║
║                       └──────────────────────────────────────────┘  ║
║                                                                      ║
║  [SHIP: Cruiser 36%] [BUILDINGS ▼] [TRANSFER]      [END TURN ⏎]    ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Collapsed Sections:**
- Buildings shown as dropdown
- Ship construction as single line
- Planet info condensed

### Tablet (1024×768) - Touch Optimized

```
╔════════════════════════════════════════════════════════════════════════╗
║  [◀]    NEW HAMSTERTON                                           [▶]  ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  ┌────────────────────────────────────────────────────────────────┐   ║
║  │                    [Large Planet Image]                        │   ║
║  │                                                                │   ║
║  │        Terran │ Pop: 45/80M │ Rich (+50%)                     │   ║
║  └────────────────────────────────────────────────────────────────┘   ║
║                                                                        ║
║  ┌──────────────────────────────────────────────────────────────────┐ ║
║  │  🚀 SHIP     [━━━━━━━━━━━━━━━━━━━━━━━━━▓▓▓▓▓▓▓▓▓▓]  35%        │ ║
║  │              Cruiser "Sunflower" - 142/400 BC (5 turns)        │ ║
║  ├──────────────────────────────────────────────────────────────────┤ ║
║  │  🛡️ DEF      [━━━━━━━━━━━━━━━━━━━▓▓▓▓▓━━━━━━━━━━━━]  15%        │ ║
║  │              Missile Base 7/10                                  │ ║
║  ├──────────────────────────────────────────────────────────────────┤ ║
║  │  🏭 IND      [━━━━━━━━━━▓▓▓▓▓▓▓▓▓▓▓▓▓━━━━━━━━━━━━━]  30%        │ ║
║  │              Factories +5/turn (190/480)                        │ ║
║  ├──────────────────────────────────────────────────────────────────┤ ║
║  │  🌿 ECO      [━━━━━━━━━━━━━━━━━━━━━━▓▓▓▓▓▓▓▓▓━━━━━]  15%        │ ║
║  │              Cleanup 5 waste ✓                                  │ ║
║  ├──────────────────────────────────────────────────────────────────┤ ║
║  │  🔬 TECH     [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▓▓━━━━━]   5%        │ ║
║  │              +8 RP/turn                                         │ ║
║  └──────────────────────────────────────────────────────────────────┘ ║
║                                                                        ║
║  [ 🏗️ Buildings ]  [ 📤 Transfer ]  [ 🗺️ Map ]     [  END TURN  ]    ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
```

**Touch Enhancements:**
- Larger slider touch targets (minimum 44px height)
- Swipe left/right to navigate planets
- Tap slider to open numeric input
- Long-press for lock/unlock

### Mobile (375×667) - Simplified

```
╔═══════════════════════════════════════╗
║  ◀   NEW HAMSTERTON   ▶               ║
╠═══════════════════════════════════════╣
║  [Planet Img] Terran │ RICH           ║
║  Pop: 45/80M │ Fact: 190/480          ║
╠═══════════════════════════════════════╣
║  🚀 35% [━━━━━━━━━▓▓▓▓] Cruiser       ║
║  🛡️ 15% [━━━━━━▓▓━━━━━] Base 7/10     ║
║  🏭 30% [━━━━▓▓▓▓▓━━━━] +5/turn       ║
║  🌿 15% [━━━━━━▓▓▓━━━━] Clean ✓       ║
║  🔬  5% [━━━━━━━━━▓━━━] +8 RP         ║
╠═══════════════════════════════════════╣
║  [More] [Buildings] [END TURN]        ║
╚═══════════════════════════════════════╝
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F2 | Open Planet Management |
| F1 | Return to Galaxy Map |
| ← / → | Previous/Next planet |
| 1-5 | Focus slider (1=SHIP, 2=DEF, etc.) |
| +/- | Increase/decrease focused slider |
| L | Lock/unlock focused slider |
| Shift+L | Lock all sliders |
| B | Open building menu |
| S | Open ship selection |
| T | Open transfer population |
| Enter | End turn |
| Esc | Close modal / Return to map |

---

## Animation Specifications

| Element | Animation | Duration | Trigger |
|---------|-----------|----------|---------|
| Slider adjustment | Smooth slide | 150ms | User drag |
| Other sliders rebalance | Smooth slide | 200ms | Primary slider change |
| Progress bar update | Fill animation | 300ms | Turn end |
| Ship complete | Flash + sound | 500ms | Construction done |
| Building complete | Glow effect | 400ms | Building finished |
| Warning pulse | Pulsing border | 1s loop | Problem detected |
| Lock/unlock | Icon flip | 200ms | Click lock |
| Planet transition | Slide/fade | 300ms | Prev/Next |

---

## Color Specifications

| Element | Normal | Warning | Error | Success |
|---------|--------|---------|-------|---------|
| Slider fill | `#4fc3f7` | `#ffb74d` | `#ef5350` | `#81c784` |
| Slider track | `#37474f` | — | — | — |
| Lock icon | `#78909c` | — | `#ef5350` | — |
| Progress bar | `#4fc3f7` | — | — | `#81c784` |
| Warning text | — | `#ffa726` | `#f44336` | `#4caf50` |

---

## Accessibility Features

| Feature | Implementation |
|---------|----------------|
| Screen Reader | All sliders announced with label, value, and state |
| Keyboard Navigation | Full slider control via keyboard |
| High Contrast | Increased border thickness, brighter colors |
| Color Blind | Icons and patterns differentiate sliders |
| Focus Indicators | Clear focus rings on interactive elements |
| ARIA Labels | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` on sliders |

---

## Data Requirements

### Planet Data Structure

```json
{
  "id": "planet_001",
  "name": "New Hamsterton",
  "system": "Sol",
  "type": "terran",
  "size": "large",
  "maxPopulation": 80,
  "currentPopulation": 45,
  "populationGrowth": 2.5,
  "special": "rich",
  "morale": "happy",
  
  "factories": {
    "built": 190,
    "maximum": 480,
    "operating": 190,
    "idle": 0
  },
  
  "defenses": {
    "missileBases": 7,
    "maxBases": 10,
    "shieldLevel": 2,
    "groundBonus": 0.25
  },
  
  "ecology": {
    "wastePerTurn": 5,
    "cleanupCostPerUnit": 3,
    "terraformProgress": 20,
    "terraformMax": 20
  },
  
  "production": {
    "sliders": {
      "ship": { "percent": 35, "locked": false },
      "def": { "percent": 15, "locked": false },
      "ind": { "percent": 30, "locked": false },
      "eco": { "percent": 15, "locked": false },
      "tech": { "percent": 5, "locked": true }
    },
    "totalOutput": 152,
    "shipProgress": { "current": 142, "target": 400, "designId": "cruiser_02" },
    "shipQueue": ["cruiser_02", "cruiser_02", "cruiser_02"]
  },
  
  "buildings": {
    "built": ["colony_base", "research_lab_2", "robotic_controls_3", "planetary_shield_2", "industrial_tech_8", "soil_enrichment"],
    "available": ["cloning_center", "atmospheric_terraform"],
    "inProgress": null
  }
}
```

---

## Related Documents

- `main-screens.md` - Overview of Planet Management screen
- `galaxy-map.md` - Galaxy Map wireframe (F1)
- `../economy/factory-formulas.md` - Factory production calculations
- `../economy/population-growth.md` - Population mechanics
- `../technology/construction.md` - Building tech tree
- `../ships/ship-design.md` - Ship construction details

---

*Document Version: 1.0*  
*Created: 2026-03-22*  
*Based on: Master of Orion (1993) colony management interface*  
*Task: ui-003 - Planet Management UI Wireframe*
