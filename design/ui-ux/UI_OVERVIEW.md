# UI/UX Overview

## Design Philosophy

**Master of Orion 1 Meets Modern Web**:
- Classic MOO1 layout and feel
- Clean, functional interface
- Information density (strategy game players want data)
- Responsive web design (desktop primary, tablet secondary)
- Charming pet-themed visual style

---

## Visual Style

### Art Direction
**Dignified Ridiculousness**:
- Portraits: Serious pet portraits (formal attire, dramatic lighting)
- UI: Professional, military-grade interface
- Iconography: Clear, functional symbols
- Color: Space-appropriate palette (deep blues, stellar purples, tactical greens)
- Typography: Readable sci-fi fonts (clear at small sizes)

### Color Palette
**Primary Colors**:
- Deep Space Blue: `#0a1628` (backgrounds)
- Stellar Purple: `#4a148c` (highlights)
- Tactical Green: `#00e676` (friendly)
- Warning Orange: `#ff6d00` (caution)
- Hostile Red: `#d32f2f` (enemy)
- Neutral Gray: `#546e7a` (UI chrome)

**Race Colors** (for empire identification):
- Hamsters: Warm Gold `#ffa726`
- Guinea Pigs: Olive Drab `#7cb342`
- Chameleons: Shifting Teal `#26a69a`
- Ants: Industrial Red `#ef5350`
- Mice: Electric Blue `#42a5f5`
- Ferrets: Hunter Brown `#8d6e63`
- Rats: Lab Coat White `#eeeeee`
- Rabbits: Pastel Pink `#f48fb1`
- Budgies: Sky Cyan `#4dd0e1`
- Hermit Crabs: Ocean Turquoise `#00acc1`

---

## Screen Resolution

**Target Resolutions**:
- Desktop Primary: 1920×1080 (Full HD)
- Desktop Secondary: 2560×1440 (2K)
- Tablet: 1280×800 (landscape)
- Minimum: 1366×768

**Responsive Breakpoints**:
- Desktop: 1920px+ (full interface)
- Laptop: 1366px–1919px (slightly compressed)
- Tablet: 1024px–1365px (simplified layout)
- Mobile: Not supported (too complex for phones)

---

## Navigation Structure

### Main Screen Flow
```
Galaxy Map (Hub Screen)
    ├─→ Planets Screen (F2)
    ├─→ Fleet Screen (F3)
    ├─→ Research Screen (F4)
    ├─→ Diplomacy Screen (F5)
    ├─→ Ship Design Screen (F6)
    ├─→ Reports Screen (F7)
    ├─→ Game Menu (Esc)
    └─→ End Turn (Enter/Space)
```

### Hotkeys (MOO1 Legacy)
- `F1`: Galaxy Map
- `F2`: Planets Management
- `F3`: Fleet Command
- `F4`: Research Tree
- `F5`: Diplomacy
- `F6`: Ship Design
- `F7`: Reports & Stats
- `F8`: High Council (when active)
- `Enter/Space`: End Turn
- `Esc`: Game Menu
- `Ctrl+S`: Quick Save
- `Ctrl+L`: Load Game

---

## Interface Components

### Standard UI Elements

**Top Bar** (present on all screens):
```
┌─────────────────────────────────────────────────────────────┐
│ [≡] Hamster of Orion | Year 2623 - Turn 1 | Treasury: 500 BC │
│ [F1: Map] [F2: Planets] [F3: Fleets] [F4: Research] [F5: Dip]│
└─────────────────────────────────────────────────────────────┘
```

**Bottom Action Bar**:
```
┌─────────────────────────────────────────────────────────────┐
│ [← Previous] Current Context Info [Next →] [END TURN ⏎]    │
└─────────────────────────────────────────────────────────────┘
```

**Side Panel** (contextual):
- Left: Primary information/options
- Right: Details/stats
- Collapsible on small screens

---

## Interaction Patterns

### Mouse Controls
- **Left Click**: Select/Activate
- **Right Click**: Context menu
- **Scroll Wheel**: Zoom (on maps)
- **Middle Click**: Pan (on maps)
- **Hover**: Tooltips (500ms delay)
- **Drag**: Select multiple (ships, planets)

### Touch Controls (Tablet)
- **Tap**: Select/Activate
- **Long Press**: Context menu (800ms)
- **Pinch**: Zoom
- **Two-finger Pan**: Map movement
- **Swipe**: Navigate lists

### Tooltips
**Rich Information on Hover**:
- Technology tooltips show full effects
- Ship tooltips show loadout and stats
- Planet tooltips show production summary
- Always include hotkey in tooltip

Example:
```
┌──────────────────────────────┐
│ Plasma Cannon                │
│ ────────────────────────────│
│ Range: 5 spaces              │
│ Damage: 20 × 4 shots         │
│ Type: Beam (instant)         │
│ Size: 30 space               │
│ ────────────────────────────│
│ Miniaturization: 75%         │
│ Cost: 150 BC/unit            │
└──────────────────────────────┘
```

---

## Notification System

### Alert Types
1. **Critical** (Red, requires acknowledgment):
   - War declared
   - Colony under attack
   - Tech stolen

2. **Important** (Orange, dismissable):
   - Research complete
   - Building finished
   - Treaty offered

3. **Info** (Blue, auto-dismiss):
   - Fleet arrived
   - Colony grew
   - Trade income increased

### Notification Display
**Top-Right Corner Stack**:
```
┌──────────────────────────────┐
│ ⚠️ Guinea Pigs declare war!  │
│    [View Fleet] [Dismiss]    │
├──────────────────────────────┤
│ ✓ Plasma Cannon researched   │
│    [Design Ship] [OK]        │
├──────────────────────────────┤
│ ℹ️ Fleet arrived at Sol      │
│    (auto-dismiss in 3s)      │
└──────────────────────────────┘
```

---

## Loading & Performance

### Loading Screens
**Initial Load**:
- Hamster portrait animation
- "Initializing Cosmic Wheel..." progress bar
- Loading tips (gameplay hints, lore snippets)

**Turn Processing**:
- "Processing Turn N..." with phase indicator
- AI empire logos cycling through
- Estimated time remaining (late game)

### Performance Targets
- **Turn End**: < 5 seconds (up to 200 turns)
- **Screen Transition**: < 200ms
- **Map Rendering**: 60fps smooth pan/zoom
- **Combat Animation**: 30fps minimum

---

## Accessibility

### Features
- **Color Blind Mode**: Alternative palettes
- **Text Scaling**: 100%, 125%, 150%
- **High Contrast Mode**: Increased UI contrast
- **Screen Reader Support**: All buttons/data labeled
- **Keyboard Only**: Full game playable without mouse

### Readability
- Minimum font size: 12px
- High contrast text on backgrounds
- Important info never color-only (use icons too)
- Option to disable animations

---

## Audio Design

### Sound Effects
- **UI Clicks**: Satisfying mechanical clicks
- **Notifications**: Distinct sounds per alert type
- **Combat**: Weapon firing sounds, explosions
- **Ambient**: Subtle space ambiance on map

### Music
- **Main Theme**: Epic orchestral with playful undertones
- **Battle Theme**: Intense combat music
- **Victory Theme**: Triumphant fanfare
- **Defeat Theme**: Somber but dignified

### Volume Controls
- Master Volume
- Music Volume
- SFX Volume
- Ambient Volume
- Mute All (M key)

---

## Mobile/Tablet Considerations

### Simplified Touch UI
- Larger hit targets (44px minimum)
- Touch-friendly sliders (thick handles)
- Reduced info density on small screens
- Collapsible panels for screen real estate
- Portrait mode not supported (landscape only)

### Performance Optimizations
- Reduced particle effects
- Lower resolution assets on demand
- Simplified shadows/lighting
- Frame rate cap at 30fps on mobile

---

## Web Technologies

### Recommended Stack
**Frontend**:
- HTML5 Canvas (for star map, combat)
- React/Vue for UI components
- SVG for icons and UI elements
- WebGL for advanced effects (optional)

**Styling**:
- CSS Grid for layouts
- Flexbox for component arrangement
- CSS Variables for theming
- Tailwind or custom design system

**State Management**:
- Redux or Zustand for game state
- LocalStorage for save games
- IndexedDB for larger saves

---

## Screen List

**Core Screens** (detailed in separate files):
1. Main Menu & Settings
2. Galaxy Map (primary hub)
3. Planet Management
4. Fleet Command
5. Research Tree
6. Ship Design
7. Diplomacy
8. Tactical Combat
9. Reports & Statistics
10. High Council
11. Victory/Defeat Screens

Each screen detailed in `main-screens.md`, `tactical-combat-ui.md`, and `information-displays.md`.

---

Next: See `main-screens.md` for detailed screen layouts.
