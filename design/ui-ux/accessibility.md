# Accessibility (a11y) & Input Remapping Specification

## Overview

This document specifies the accessibility compliance rules, colorblind visual modes, keyboard shortcut registry, focus management, and UI scaling engine for **Hamster of Orion**.

**Reference Materials:**
- [UI Style Guide](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/style-guide.md)
- [Main Screens Specification](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/main-screens.md)

---

## 1. Colorblind Accessibility Modes

In a 4X strategy game, color is critical for empire boundaries, diplomatic statuses, and star ownership. The UI provides 3 colorblind palette modes + pattern overlays:

| Mode | Target Condition | Modification Strategy |
| :--- | :--- | :--- |
| **Normal** | Standard Vision | HSL palette defined in `style-guide.md` |
| **Deuteranopia** | Red-Green Blindness (Most common) | Replaces Green/Red indicators with High-Contrast Blue/Yellow + Crosshatch pattern overlays |
| **Protanopia** | Red-Deficient | Brightens Red tones to Magenta/Orange; adds distinct shape badges (Circle, Triangle, Square) |
| **Tritanopia** | Blue-Yellow Blindness | Replaces Yellow with Cyan/Teal; replaces Blue with Dark Violet |

### Pattern Overlay Enforcement
- Star map territory borders include optional dashed (`---`) vs dotted (`...`) pattern styles so empire ownership is clear without relying solely on color hue.

---

## 2. Complete Keyboard Hotkey Registry

All game functions are 100% accessible via keyboard navigation:

| Key Binding | Screen / Context | Function |
| :--- | :--- | :--- |
| `F1` / `G` | Global | Open Game / Options Menu |
| `F2` / `D` | Global | Open Ship Design Workspace |
| `F3` / `F` | Global | Open Fleet Overview Screen |
| `F4` / `M` | Global | Focus Galaxy Map Screen |
| `F5` / `R` | Global | Open Races / Diplomacy Screen |
| `F6` / `P` | Global | Open Planets Overview Screen |
| `F7` / `T` | Global | Open Tech & Research Screen |
| `Space` / `Enter` | Global | End Turn / Confirm active dialog |
| `Esc` | Global | Pop active modal / Close sub-view / Return to Galaxy Map |
| `WASD` / `Arrow Keys` | Galaxy Map | Pan map camera smoothly in 4 directions |
| `+` / `-` | Galaxy Map | Zoom camera in / out |
| `1` – `6` | Colony View | Focus slider (`1`: SHIP, `2`: DEF, `3`: IND, `4`: ECO, `5`: TECH) |
| `L` | Colony View | Toggle Lock (`[🔒]/[🔓]`) on focused slider |

---

## 3. UI Scale Engine & Focus Management

- **Supported UI Scales**: `100%` (Default 1080p), `125%` (1440p), `150%` (4K UHD).
- **Focus Rings**: Keyboard focus places a high-contrast glowing gold outline (`2px solid #F5B025`) around active UI controls.
- **Screen Reader Aria Labels**: All interactive buttons feature explicit `aria-label` tags (e.g. `aria-label="Relocate ships from Sol to Altair"`).
