# Hamster of Orion - UI Style Guide & Design System

## Overview

This document defines the complete visual design system, UI styling specifications, CSS design tokens, component states, micro-animations, and interactive behaviors for **Hamster of Orion**.

The aesthetic combines **Master of Orion 1 tactical clarity** with **modern sci-fi glassmorphism**, rich dark modes, HSL color palettes, and responsive web micro-interactions.

**References:**
- [UI/UX Overview](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/UI_OVERVIEW.md)
- [Main Screens Specification](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/main-screens.md)
- [Interaction Specification](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/interaction-spec.md)
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)

---

## 1. Aesthetic Vision & Art Direction

### "Dignified Sci-Fi & Tactile Tactical Glass"
- **Dignified Pet Lore**: Majestic, serious sci-fi presentation featuring rodent species in formal military, academic, and diplomatic attire.
- **High Information Density**: Clean data tables, crisp typography, and uncluttered layout allowing strategy players to digest complex galactic data instantly.
- **Glassmorphic Depth**: Semi-transparent dark surfaces with backdrop blur (`backdrop-filter: blur(12px)`), subtle neon border glows, and tactile 3D button feel.

---

## 2. Typography System

| Usage | Font Family | Weight | Size Range | Character Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Headers & Displays** | `Outfit`, sans-serif | 600 (SemiBold), 700 (Bold) | `20px` – `32px` | `0.05em` (uppercase tracking) |
| **UI Controls & Labels** | `Inter`, sans-serif | 500 (Medium), 600 (SemiBold) | `13px` – `16px` | `0.02em` |
| **Data Tables & Badges** | `Inter`, sans-serif | 400 (Regular), 500 (Medium) | `11px` – `14px` | Normal |
| **Numeric Values & Coordinates** | `Fira Code`, monospace | 500 (Medium) | `12px` – `15px` | Monospaced numeric alignment |

---

## 3. Color System & Design Tokens

### 3.1 Base Surface Tokens
```css
:root {
  /* Surface Colors */
  --bg-deep-space:       hsl(220, 28%, 6%);   /* #0B0E14 */
  --bg-panel-dark:       hsl(220, 24%, 10%);  /* #121826 */
  --bg-surface-glass:    rgba(18, 24, 38, 0.85);
  --bg-modal-backdrop:   rgba(5, 7, 12, 0.80);
  --border-glass:        rgba(245, 176, 37, 0.25);
  --border-glass-bright: rgba(245, 176, 37, 0.60);

  /* Primary Accent Tokens */
  --accent-gold-primary: hsl(43, 92%, 55%);   /* #F5B025 - Imperial Gold */
  --accent-gold-glow:    rgba(245, 176, 37, 0.40);
  --accent-cyan-plasma:  hsl(187, 92%, 53%);  /* #1ACCEE - Plasma Cyan */
  --accent-cyan-glow:    rgba(26, 204, 238, 0.35);
  --accent-amber-alert:  hsl(32, 98%, 51%);   /* #F2840D - Warning Amber */

  /* Status Colors */
  --color-success:       hsl(142, 76%, 45%);  /* #1BB95A - Growth / Peace */
  --color-warning:       hsl(43, 96%, 56%);   /* #F5B025 - Moderate Risk */
  --color-danger:        hsl(354, 85%, 54%);  /* #E62E44 - War / Crisis / Damage */
  --color-info:          hsl(199, 89%, 48%);  /* #109CEB - Discovery / Tech */

  /* Faction Color Palette */
  --faction-hamsters:    #F5B025;  /* Imperial Gold */
  --faction-ants:        #2ECC71;  /* Swarm Emerald */
  --faction-budgies:     #1ACCEE;  /* Plasma Cyan */
  --faction-chameleons:  #9B59B6;  /* Stealth Violet */
  --faction-ferrets:     #E74C3C;  /* Crimson Pride */
  --faction-guinea-pigs: #D35400;  /* Subterranean Bronze */
  --faction-hermit-crabs:#3498DB;  /* Steel Armor Blue */
  --faction-mice:        #BDC3C7;  /* Republic Silver */
  --faction-rabbits:     #1ABC9C;  /* Fertile Jade */
  --faction-rats:        #E67E22;  /* Magma Rust */
}
```

---

## 4. UI Component Style Specifications

### 4.1 Bottom Command Bar & Buttons

```
  Normal Button         Hover State          Active Screen State
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     MAP      │     │  ✨ MAP ✨   │     │  [●] MAP     │
└──────────────┘     └──────────────┘     └──────────────┘
```

- **Visual Base**: Tactile pill/rect with 3D raised border, gradient fill (`linear-gradient(180deg, #1E2638 0%, #121826 100%)`).
- **Normal State**: `1px solid rgba(245, 176, 37, 0.3)`; text color `--accent-gold-primary`.
- **Hover State**:
  - `transform: translateY(-2px);`
  - `border-color: var(--accent-gold-primary);`
  - `box-shadow: 0 4px 15px var(--accent-gold-glow);`
  - `transition: all 0.15s ease-out;`
- **Active State (Selected Screen)**:
  - Background fill: `linear-gradient(180deg, #2A344A 0%, #1A2234 100%)`.
  - Inward shadow: `box-shadow: inset 0 2px 4px rgba(0,0,0,0.5), 0 0 10px var(--accent-gold-glow);`
  - Glowing gold LED dot (`[●]`) next to label text.
- **Disabled State**:
  - `opacity: 0.4; filter: grayscale(80%); cursor: not-allowed;`

---

### 4.2 Planetary Production Sliders

```
  SHIP [🔒]  ████████████████░░░░░░░░░░  45% (120 BC)
```

- **Slider Track**: Recessed dark groove with rounded ends (`height: 10px; background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.1)`).
- **Fill Bar**: High-contrast gradient corresponding to slider function:
  - *SHIP*: Cyan Gradient (`#1ACCEE` -> `#0D8EA3`)
  - *DEF*: Amber Gradient (`#F2840D` -> `#B35D00`)
  - *IND*: Gold Gradient (`#F5B025` -> `#B88014`)
  - *ECO*: Emerald Green Gradient (`#2ECC71` -> `#1E8449`)
  - *TECH*: Electric Violet Gradient (`#9B59B6` -> `#6C3483`)
- **Slider Thumb (Handle)**:
  - Beveled metallic handle with center indicator notch (`width: 16px; height: 22px; border-radius: 3px`).
  - Active drag effect: `box-shadow: 0 0 12px var(--accent-cyan-glow); transform: scale(1.1);`
  - Live floating tooltip above thumb during drag (`ECO: 35.0% - 1.4 Waste Cleanup`).
- **Lock Icon Toggle `[🔒] / [🔓]`**:
  - Unlocked `[🔓]`: Slate grey icon (`color: #7F8C8D`), opacity `0.6`.
  - Locked `[🔒]`: Bright Amber icon (`color: #F5B025`), glowing backdrop pill. Clicking toggles slider lock state instantly.

---

### 4.3 Modals & Event Dialog Overlays

- **Backdrop Mask**: Darkened space blur (`background: rgba(5, 7, 12, 0.8); backdrop-filter: blur(8px)`).
- **Modal Container**:
  - Glass card with chamfered sci-fi corners (`clip-path` or `border-radius: 8px`).
  - Border: `1px solid var(--border-glass-bright);`
  - Header Banner: Dark gradient header with gold title text and right-aligned close button (`[X]`).
- **Entrance Animation**:
  - `transform: scale(0.95); opacity: 0;` -> `transform: scale(1.0); opacity: 1;` (`200ms cubic-bezier(0.16, 1, 0.3, 1)`).
- **Exit Animation**:
  - Reverse fade-out (`150ms ease-in`).

---

### 4.4 Data Tables & Lists

- **Header Row**: Dark metallic surface (`background: rgba(30, 38, 56, 0.9)`), uppercase bold text (`font-size: 11px; letter-spacing: 0.05em`). Sortable columns display interactive sort arrow (`▲` / `▼`).
- **Row Styling**:
  - Alternating zebra stripe: `background: rgba(255, 255, 255, 0.02)`.
  - Hover State: `background: rgba(26, 204, 238, 0.08); transition: background 0.12s ease-out;`
  - Left indicator border: `3px solid transparent` -> `3px solid var(--accent-cyan-plasma)` on hover/selection.

---

### 4.5 Tooltips & Micro-Badges

- **Tooltip Floating Window**:
  - Appears after `300ms` hover delay.
  - Layout: High-contrast dark glass window (`background: rgba(10, 14, 23, 0.95); border: 1px solid var(--accent-gold-primary)`).
  - Upper section: Bold functional stats (e.g. `ECO SLIDER: 24.0%`).
  - Lower section: Italicized flavor text in light grey (`color: #BDC3C7`).
  - Disappears immediately (`0ms`) on mouse leave (`Return Path`).
- **Status Micro-Badges**:
  - Small rounded pills (`padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600`).
  - *Peace*: Green background (`background: rgba(27, 185, 90, 0.2); color: #1BB95A; border: 1px solid #1BB95A`).
  - *War*: Red background (`background: rgba(230, 46, 68, 0.2); color: #E62E44; border: 1px solid #E62E44`).
  - *Trade*: Cyan background (`background: rgba(26, 204, 238, 0.2); color: #1ACCEE; border: 1px solid #1ACCEE`).

---

## 5. Micro-Animations & Responsive Transitions

- **Screen State Transitions**: Main content area fades out (`150ms`) and slides in new view from bottom (`200ms ease-out`).
- **Map Camera Movements**: Smooth cubic-bezier camera pan/zoom (`800ms cubic-bezier(0.25, 1, 0.5, 1)`).
- **Notification Drawer Banners**: Crisis banners slide in from right with subtle red pulse animation at `1Hz`.
