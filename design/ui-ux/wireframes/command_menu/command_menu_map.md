# Command Menu: MAP (F1) - MOO1-Accurate Wireframe

## Overview

The MAP command button opens a **full-screen replacement view** — not an overlay on the normal galaxy view. This is a completely different rendering mode:

- **Normal Galaxy View**: Zoomed in, showing only a few nearby stars at a time. Player clicks/drags to scroll around.
- **Map View**: Zoomed out to show **every star in the galaxy** at once. Stars are small, pixelated dots. No scrolling needed.

The Map View has three selectable filter modes displayed as raised 3D buttons on the right side panel.

**Reference**: Master of Orion (1993) Map Screen  
**Hotkey**: F1

---

## Screen Layout

When MAP is clicked, the entire main view is replaced:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   ┌───────────────────────────────────────────────────┐  ┌───────────────────┐  │
│   │                                                   │  │                   │  │
│   │                                                   │  │   ┌───────────┐   │  │
│   │                                                   │  │   │ COLONIES  │   │  │
│   │              FULL GALAXY MAP                      │  │   └───────────┘   │  │
│   │           (All stars visible)                     │  │        ▲          │  │
│   │                                                   │  │   (raised/3D)     │  │
│   │         Stars shown as small colored dots         │  │                   │  │
│   │         with overlay indicators based on          │  │   ┌───────────┐   │  │
│   │         selected filter mode                      │  │   │ENVIRONMENT│   │  │
│   │                                                   │  │   └───────────┘   │  │
│   │                                                   │  │                   │  │
│   │                  *    .   *                       │  │   ┌───────────┐   │  │
│   │              .        *       .                   │  │   │ MINERALS  │   │  │
│   │                 *  .     *                        │  │   └───────────┘   │  │
│   │                                                   │  │                   │  │
│   │                                                   │  │                   │  │
│   │                                                   │  │  (Legend area     │  │
│   │                                                   │  │   below buttons)  │  │
│   │                                                   │  │                   │  │
│   └───────────────────────────────────────────────────┘  └───────────────────┘  │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  GAME │ DESIGN │ FLEET │ MAP │ RACES │ PLANETS │ TECH │   NEXT TURN    │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Right Panel: Mode Selector Buttons

Three vertically stacked buttons, styled as **raised 3D buttons**. When selected, the button appears pressed/depressed.

| Button | Position | Function |
|--------|----------|----------|
| **COLONIES** | Top | Shows ownership flags on colonized stars |
| **ENVIRONMENT** | Middle | Shows planet type letter codes |
| **MINERALS** | Bottom | Shows resource richness indicators |

### Button Visual States

```
Unselected (raised):          Selected (pressed):
┌──────────────┐              ╔══════════════╗
│   COLONIES   │              ║   COLONIES   ║
└──────────────┘              ╚══════════════╝
   (shadow below)                (inset look)
```

---

## Filter Mode: COLONIES

When **COLONIES** is selected:

- Each colonized star displays a small **colored flag/banner** positioned on top of the star
- Flag color matches the race's **banner color**
- Uncolonized/unexplored stars show no flag

### Race Banner Colors (MOO1)

| Race | Banner Color |
|------|--------------|
| Human | Blue |
| Mrrshan | Orange |
| Silicoid | Yellow |
| Sakkra | Green |
| Psilon | White |
| Alkari | Teal |
| Klackon | Purple |
| Bulrathi | Brown |
| Meklar | Red |
| Darlok | Dark Gray |

### Visual Example (Colonies Mode)

```
         ⚑(blue)
            *  
                    ⚑(green)
      *                *
                            
   ⚑(purple)              
      *         *    
                    ⚑(blue)
            *          *
```

---

## Filter Mode: ENVIRONMENT

When **ENVIRONMENT** is selected:

- Each explored star displays a **single letter code** indicating planet type
- Letter appears next to the star
- Unexplored stars show no letter

### Planet Type Codes (MOO1)

| Code | Planet Type | Habitability |
|------|-------------|--------------|
| **G** | Gaia | Best (100% + growth bonus) |
| **T** | Terran | Excellent (100%) |
| **J** | Jungle | Very Good (90%) |
| **O** | Ocean | Good (80%) |
| **A** | Arid | Moderate (60%) |
| **S** | Steppe | Moderate (60%) |
| **D** | Desert | Poor (50%) |
| **M** | Minimal | Very Poor (40%) |
| **B** | Barren | Very Poor (35%) |
| **Tu** | Tundra | Bad (30%) |
| **De** | Dead | Bad (25%) |
| **I** | Inferno | Hostile (20%) |
| **To** | Toxic | Hostile (15%) |
| **R** | Radiated | Worst (10%) |
| **—** | None | No habitable planet |

### Visual Example (Environment Mode)

```
            T
            *  
                        J
      *                 *
         A                  
                            
      *    R    *    
                        T
            *          *
               De
```

---

## Filter Mode: MINERALS

When **MINERALS** is selected:

- Each explored star displays a **resource indicator** if non-normal
- Normal mineral planets show nothing (no clutter)
- Only exceptional planets are marked

### Mineral Richness Codes (MOO1)

| Code | Mineral Level | Production Modifier |
|------|---------------|---------------------|
| **UP** | Ultra Poor | 1/3 production |
| **P** | Poor | 1/2 production |
| *(blank)* | Normal | 1x production (no indicator) |
| **R** | Rich | 2x production |
| **UR** | Ultra Rich | 3x production |
| **A** | Artifacts | 4x research bonus |
| **O** | Orion | Special (Guardian) |

### Visual Example (Minerals Mode)

```
            
            *  
                        R
      *                 *
         UP                 
                            
      *         *    
              UR        
            *          *
                  
```

---

## Interaction Behaviors

| Action | Result |
|--------|--------|
| Click **MAP** button | Enter Map View (defaults to COLONIES mode, or last-used mode) |
| Click **COLONIES** button | Switch to Colonies filter, show ownership flags |
| Click **ENVIRONMENT** button | Switch to Environment filter, show planet type codes |
| Click **MINERALS** button | Switch to Minerals filter, show resource indicators |
| Click a star | Select that star system (may show minimal info or just highlight) |
| Click **MAP** again (while in Map View) | Exit Map View, return to normal Galaxy View |
| Press **ESC** or click elsewhere | Exit Map View, return to normal Galaxy View |

---

## Key Differences from Normal Galaxy View

| Aspect | Normal Galaxy View | Map View |
|--------|-------------------|----------|
| **Zoom level** | Zoomed in, partial view | Zoomed out, all stars visible |
| **Star size** | Larger, detailed | Small, pixelated dots |
| **Navigation** | Click/drag to scroll | No scrolling needed |
| **Right panel** | Context-sensitive star info | Mode selector buttons + legend |
| **Star info on click** | Full details | Minimal or none |

---

## Design Constraints

1. **Full Replacement**: Map View completely replaces the normal galaxy view — it's not a transparent overlay
2. **Mutual Exclusivity**: Only one filter mode can be active at a time
3. **Button Feedback**: Selected button must appear visually "pressed" vs unselected buttons appearing "raised"
4. **Readability**: Letter codes and flags must be legible even at small star sizes
5. **Exit Path**: Clear way to return to normal view (click MAP again, or ESC)
