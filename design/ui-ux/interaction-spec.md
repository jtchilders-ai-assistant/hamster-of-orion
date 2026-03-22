# UI Interaction Specification

## Overview

This document specifies all user interface interactions for Hamster of Orion, matching Master of Orion (1993) behavior with modern web enhancements. It covers click behaviors, keyboard shortcuts, slider mechanics, list navigation, context menus, drag-and-drop, focus states, and modal interaction patterns.

**Reference**: Master of Orion (1993) UI Controls  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)  
**Input Methods**: Mouse/trackpad (primary), keyboard, touch (tablet)

---

## 1. Click Behaviors

### 1.1 Single Left-Click

Single left-click is the primary selection and activation input.

#### Galaxy Map (F1)
| Target | Action | Result |
|--------|--------|--------|
| Star (unexplored) | Select | Star info panel appears with "Unknown" status |
| Star (explored) | Select | System detail panel with planets, fleets |
| Star (your colony) | Select | System panel with [VIEW COLONY] button |
| Fleet icon (yours) | Select | Fleet panel with composition, orders |
| Fleet icon (enemy) | Select | Fleet panel with estimated strength |
| Empty space | Deselect | Close any open selection panel |
| Navigation buttons [F2-F7] | Navigate | Switch to respective screen |
| [END TURN] button | Confirm | Open turn confirmation dialog |
| Zoom [+]/[-] buttons | Zoom | Zoom map in/out by one step |
| [⊕] Center button | Center | Center view on homeworld |

#### Planet Management (F2)
| Target | Action | Result |
|--------|--------|--------|
| Slider track | Set position | Jump slider to clicked position |
| Slider handle | Begin drag | Start slider adjustment |
| Lock icon [🔓]/[🔒] | Toggle | Lock/unlock slider from auto-balance |
| [◀ PREV]/[NEXT ▶] | Navigate | Cycle to previous/next colony |
| Building tile (available) | Select | Highlight building, show cost |
| [BUILD] button | Queue build | Add building to construction queue |
| [CHANGE SHIP] button | Open picker | Show ship design selection dialog |
| Ship queue item | Select | Highlight for removal |

#### Fleet Command (F3)
| Target | Action | Result |
|--------|--------|--------|
| Fleet in list | Select | Show fleet details in right panel |
| Ship in fleet | Select | Show individual ship statistics |
| [MOVE TO] button | Activate mode | Enter destination selection mode |
| Star on mini-map | Set destination | Confirm fleet movement order |
| [SPLIT FLEET] button | Open dialog | Show fleet split interface |

#### Research Tree (F4)
| Target | Action | Result |
|--------|--------|--------|
| Tech field header | Expand/collapse | Toggle tech tree visibility |
| Available tech | Select | Highlight tech, show details panel |
| [RESEARCH] button | Set research | Begin researching selected tech |
| Progress bar | No action | Tooltip shows completion details |
| Completed tech | Select | Show tech details (no research option) |

#### Ship Design (F6)
| Target | Action | Result |
|--------|--------|--------|
| Hull class button | Select | Change ship hull, reset components |
| Component in list | Select | Highlight component, show stats |
| [ADD] button / Double-click | Add component | Add component to current design |
| Component in design | Select | Highlight for removal |
| [REMOVE] button | Remove | Remove selected component from design |
| [SAVE DESIGN] button | Save | Open name input, save design |
| [CLEAR] button | Reset | Clear all components, confirm dialog |

#### Diplomacy (F5)
| Target | Action | Result |
|--------|--------|--------|
| Race in list | Select | Show race details in main panel |
| Race portrait | Select | Same as clicking race in list |
| [CONTACT] button | Request audience | Open diplomatic negotiation screen |
| Treaty checkbox | Toggle | Select/deselect treaty type |
| [PROPOSE] button | Submit offer | Send proposal to AI, show response |

#### Tactical Combat
| Target | Action | Result |
|--------|--------|--------|
| Hex (empty, in range) | Move | Move selected ship to hex |
| Hex (enemy ship) | Target | Select as attack target |
| Ship (yours, not selected) | Select | Select ship for orders |
| Ship (yours, selected) | Deselect | Deselect ship |
| Weapon button | Select | Arm weapon for firing |
| [FIRE] button | Fire | Execute attack on selected target |
| [END TURN] button | End turn | Complete ship's turn, next initiative |
| [RETREAT] button | Retreat | Attempt retreat from combat |

### 1.2 Double Left-Click

Double-click provides quick-action shortcuts and navigation.

| Screen | Target | Action |
|--------|--------|--------|
| Galaxy Map | Star (your colony) | Open Planet Management (F2) for that colony |
| Galaxy Map | Fleet (yours) | Open Fleet Command (F3) for that fleet |
| Galaxy Map | Star (in fleet range) | Set fleet destination directly |
| Planet Management | Slider | Set slider to 100% (or 0% if already 100%) |
| Planet Management | Building (available) | Immediately start building |
| Fleet Command | Fleet | Center map on fleet location |
| Fleet Command | Ship | Open Ship Detail view |
| Research Tree | Available tech | Start researching immediately |
| Ship Design | Component | Add to design (same as click + ADD) |
| Ship Design | Component in design | Remove from design |
| Diplomacy | Race portrait | Open diplomatic audience immediately |
| Tactical Combat | Hex (in range) | Move and auto-select next ship |
| Reports | Planet row | Open Planet Management for that colony |

### 1.3 Right-Click (Context Menu)

Right-click opens context-sensitive menus with additional options.

#### Galaxy Map Context Menus

**On Star (Your Colony):**
```
┌─────────────────────────┐
│ ★ Sol System            │
├─────────────────────────┤
│ View Colony        F2   │
│ Send Fleet Here...      │
│ Set as Rally Point      │
│ ──────────────────────  │
│ Show in Reports    F7   │
│ Zoom to System          │
└─────────────────────────┘
```

**On Star (Enemy Colony):**
```
┌─────────────────────────┐
│ ◉ Alpha Centauri        │
│   (Guinea Pig Colony)   │
├─────────────────────────┤
│ Send Fleet Here...      │
│ View Intelligence...    │
│ ──────────────────────  │
│ Diplomatic Status       │
│ Zoom to System          │
└─────────────────────────┘
```

**On Fleet (Yours):**
```
┌─────────────────────────┐
│ ▲ Battle Group Alpha    │
├─────────────────────────┤
│ Set Destination...      │
│ Cancel Orders           │
│ Split Fleet...          │
│ Merge with Fleet...     │
│ ──────────────────────  │
│ Auto-Explore            │
│ Set Patrol Route...     │
│ ──────────────────────  │
│ View Fleet Details F3   │
│ Scrap Fleet...          │
└─────────────────────────┘
```

**On Empty Space:**
```
┌─────────────────────────┐
│ Center View Here        │
│ ──────────────────────  │
│ Zoom In            +    │
│ Zoom Out           -    │
│ Reset Zoom         0    │
│ ──────────────────────  │
│ Show Grid          G    │
│ Show Range Circles R    │
│ Show Trade Routes  T    │
└─────────────────────────┘
```

#### Planet Management Context Menus

**On Slider:**
```
┌─────────────────────────┐
│ Set to 0%               │
│ Set to 25%              │
│ Set to 50%              │
│ Set to 75%              │
│ Set to 100%             │
│ ──────────────────────  │
│ Lock Slider        L    │
│ ──────────────────────  │
│ Copy to All Planets     │
└─────────────────────────┘
```

**On Building:**
```
┌─────────────────────────┐
│ 🔬 Research Lab II      │
├─────────────────────────┤
│ View Details            │
│ ──────────────────────  │
│ Demolish... (500 BC)    │
│ Replace with...         │
└─────────────────────────┘
```

#### Fleet Command Context Menus

**On Ship:**
```
┌─────────────────────────┐
│ 🚀 Cruiser "Sunflower"  │
├─────────────────────────┤
│ View Ship Details       │
│ View Design             │
│ ──────────────────────  │
│ Rename Ship...          │
│ Transfer to Fleet...    │
│ ──────────────────────  │
│ Scrap Ship (250 BC)     │
└─────────────────────────┘
```

#### Tactical Combat Context Menus

**On Your Ship:**
```
┌─────────────────────────┐
│ 🚀 Destroyer "Whiskers" │
├─────────────────────────┤
│ View Ship Status        │
│ ──────────────────────  │
│ Hold Position           │
│ Retreat (this ship)     │
│ ──────────────────────  │
│ Auto-Attack             │
│ Focus Fire Mode         │
└─────────────────────────┘
```

**On Enemy Ship:**
```
┌─────────────────────────┐
│ △ Enemy Cruiser         │
│   HP: 180/250           │
├─────────────────────────┤
│ Focus All Fire          │
│ Ignore (until damaged)  │
│ ──────────────────────  │
│ View Ship Info          │
│ Estimate Kill Chance    │
└─────────────────────────┘
```

### 1.4 Middle-Click (Pan)

Middle mouse button enables map panning on scrollable views.

| Screen | Action |
|--------|--------|
| Galaxy Map | Hold middle + drag = pan view |
| Tactical Combat | Hold middle + drag = pan grid |
| Research Tree | Hold middle + drag = scroll tech tree |
| Reports (graphs) | Hold middle + drag = scroll timeline |

---

## 2. Keyboard Shortcuts

### 2.1 Global Shortcuts (Available on All Screens)

| Key | Action | Description |
|-----|--------|-------------|
| `F1` | Galaxy Map | Switch to main galaxy view |
| `F2` | Planets | Switch to planet management |
| `F3` | Fleets | Switch to fleet command |
| `F4` | Research | Switch to research tree |
| `F5` | Diplomacy | Switch to diplomatic relations |
| `F6` | Ship Design | Switch to ship design lab |
| `F7` | Reports | Switch to statistics/reports |
| `F8` | Council | Switch to High Council (when active) |
| `Enter` / `Space` | End Turn | Open turn confirmation dialog |
| `Escape` | Menu/Cancel | Open game menu OR cancel current action |
| `Ctrl+S` | Quick Save | Save game to current slot |
| `Ctrl+L` | Load Game | Open load game dialog |
| `Ctrl+Z` | Undo | Undo last action (where applicable) |
| `M` | Mute Audio | Toggle all audio on/off |
| `?` / `F11` | Help | Open context-sensitive help |
| `Tab` | Cycle Focus | Move focus to next UI element |
| `Shift+Tab` | Reverse Cycle | Move focus to previous UI element |

### 2.2 Galaxy Map (F1) Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `+` / `=` | Zoom In | Increase map zoom level |
| `-` | Zoom Out | Decrease map zoom level |
| `0` | Reset Zoom | Return to default zoom level |
| `Home` | Center Home | Center view on homeworld |
| `Arrow Keys` | Pan Map | Scroll map in direction |
| `Shift+Arrows` | Fast Pan | Scroll map faster |
| `N` | Next Colony | Select next colony (cycle) |
| `Shift+N` | Prev Colony | Select previous colony |
| `F` | Next Fleet | Select next fleet (cycle) |
| `Shift+F` | Prev Fleet | Select previous fleet |
| `G` | Toggle Grid | Show/hide grid overlay |
| `R` | Range Circles | Show/hide fleet range circles |
| `T` | Trade Routes | Show/hide trade route lines |
| `E` | Enemy Fleets | Highlight all enemy fleets |
| `1-9` | Quick Select | Select fleet by number |
| `Ctrl+1-9` | Assign Number | Assign number to selected fleet |

### 2.3 Planet Management (F2) Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `←` / `[` | Previous Planet | Navigate to previous colony |
| `→` / `]` | Next Planet | Navigate to next colony |
| `S` | Focus Ship Slider | Select ship production slider |
| `D` | Focus Defense Slider | Select defense slider |
| `I` | Focus Industry Slider | Select industry slider |
| `E` | Focus Ecology Slider | Select ecology slider |
| `R` | Focus Research Slider | Select research slider |
| `L` | Lock/Unlock | Toggle lock on focused slider |
| `↑` / `↓` | Adjust Slider | Increase/decrease by 5% |
| `Shift+↑/↓` | Fine Adjust | Increase/decrease by 1% |
| `Ctrl+↑/↓` | Coarse Adjust | Increase/decrease by 25% |
| `B` | Buildings | Focus building panel |
| `Q` | Queue | Focus build queue |
| `A` | Auto-Balance | Trigger auto-balance sliders |
| `Ctrl+A` | Auto All | Apply auto settings to all colonies |

### 2.4 Fleet Command (F3) Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `↑` / `↓` | Navigate Fleet List | Move selection in fleet list |
| `Enter` | Select Fleet | Open fleet details |
| `M` | Move | Enter destination selection mode |
| `C` | Cancel Orders | Cancel current fleet orders |
| `S` | Split Fleet | Open split fleet dialog |
| `J` | Join/Merge | Enter merge fleet mode |
| `X` | Explore | Set fleet to auto-explore |
| `P` | Patrol | Set fleet to patrol route |
| `Delete` | Scrap | Open scrap confirmation |
| `R` | Rename | Rename selected fleet/ship |
| `Space` | Toggle Ship | Include/exclude ship in selection |

### 2.5 Research Tree (F4) Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `1-6` | Select Field | Focus tech field (1=Weapons, etc.) |
| `↑` / `↓` | Navigate Techs | Move selection within field |
| `←` / `→` | Change Field | Move to adjacent field |
| `Enter` | Research | Start researching selected tech |
| `Space` | Toggle Expand | Expand/collapse tech field |
| `Tab` | Next Available | Jump to next researchable tech |
| `I` | Tech Info | Open detailed tech information |

### 2.6 Ship Design (F6) Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `1-6` | Select Hull | Choose hull class (1=Scout, 6=Titan) |
| `W` | Weapons Panel | Focus weapons component list |
| `A` | Armor Panel | Focus armor/defense list |
| `P` | Propulsion Panel | Focus propulsion list |
| `C` | Computer Panel | Focus computer list |
| `X` | Special Panel | Focus special systems list |
| `↑` / `↓` | Navigate | Move selection in current panel |
| `Enter` / `+` | Add Component | Add selected component to design |
| `Delete` / `-` | Remove | Remove selected component |
| `Ctrl+S` | Save Design | Save current design |
| `Ctrl+N` | New Design | Start fresh design |
| `Ctrl+L` | Load Design | Load existing design |

### 2.7 Diplomacy (F5) Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `↑` / `↓` | Navigate Races | Move selection in race list |
| `Enter` | Contact | Request diplomatic audience |
| `T` | Treaties | Focus treaty options |
| `W` | Declare War | Open war declaration dialog |
| `P` | Propose Peace | Offer peace treaty |
| `D` | Trade Deal | Open trade negotiation |
| `I` | Intelligence | View spy report on race |

### 2.8 Tactical Combat Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `Tab` | Next Ship | Select next ship in initiative |
| `Shift+Tab` | Prev Ship | Select previous ship |
| `1-9` | Select Weapon | Choose weapon slot |
| `Space` | Fire / Confirm | Fire weapon or confirm move |
| `W` | Wait | Skip ship's turn (act later) |
| `H` | Hold | End ship's turn (no action) |
| `R` | Retreat | Attempt retreat (current ship) |
| `Shift+R` | Retreat All | Attempt full fleet retreat |
| `A` | Auto-Combat | Toggle auto-combat for this battle |
| `S` | Ship Status | Open detailed ship status |
| `Arrow Keys` | Move Ship | Move selected ship in direction |
| `Ctrl+Arrows` | Scroll View | Pan combat view |
| `+` / `-` | Zoom | Zoom combat view in/out |
| `C` | Center | Center view on selected ship |

### 2.9 High Council (F8) Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `↑` / `↓` | Navigate | Move between vote options |
| `Enter` | Cast Vote | Confirm vote selection |
| `A` | Abstain | Abstain from voting |
| `V` | Vote For | Vote for highlighted candidate |
| `Space` | View Details | Show candidate details |

---

## 3. Slider Mechanics

### 3.1 Production Sliders (Planet Management)

The five production sliders (Ship, Defense, Industry, Ecology, Research) share common mechanics:

#### Visual Structure
```
🚀 SHIP          [🔓]  [░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 45%
                        ↑              ↑                ↑
                    Empty Track    Filled Track    Percentage
```

#### Interaction Methods

| Input | Action | Result |
|-------|--------|--------|
| Click on track | Set position | Slider jumps to click position |
| Drag handle | Continuous adjust | Slider follows mouse |
| Click+drag anywhere | Adjust | Drag interaction from any point |
| Scroll wheel (on slider) | Increment | ±5% per scroll tick |
| Shift+scroll | Fine increment | ±1% per scroll tick |
| Keyboard ↑/↓ | Increment | ±5% per keypress |
| Shift+↑/↓ | Fine increment | ±1% per keypress |
| Double-click | Max/Min | Toggle between 0% and 100% |
| Right-click | Context menu | Quick-set options (0/25/50/75/100%) |

#### Lock Behavior

| State | Icon | Behavior |
|-------|------|----------|
| Unlocked | 🔓 | Slider participates in auto-balance |
| Locked | 🔒 | Slider maintains fixed percentage |

**Auto-Balance Rules:**
1. When one unlocked slider is adjusted, all other unlocked sliders redistribute to total 100%
2. Locked sliders maintain their exact percentage
3. If all sliders are locked and don't total 100%, show warning
4. Unlock all resets distribution evenly among unlocked sliders

#### Auto-Balance Algorithm
```
When adjusting slider X to value N%:
1. Calculate locked_total = sum of all locked slider values
2. Calculate available = 100% - locked_total
3. If N > available: clamp N to available
4. Set slider X to N%
5. remaining = available - N
6. unlocked_others = all unlocked sliders except X
7. If count(unlocked_others) > 0:
   - current_total = sum of unlocked_others values
   - If current_total > 0:
     - scale_factor = remaining / current_total
     - For each slider in unlocked_others:
       - new_value = round(slider.value * scale_factor)
   - Else:
     - Distribute remaining evenly
8. Adjust for rounding to ensure total = 100%
```

#### Visual Feedback

| Event | Feedback |
|-------|----------|
| Hover over slider | Highlight handle, show tooltip |
| Dragging | Handle enlarges, track glows |
| Value change | Smooth animation (100ms ease) |
| Lock toggle | Lock icon animates, brief flash |
| Invalid adjustment | Shake animation, warning color |
| At minimum (0%) | Dim color, cannot go lower |
| At maximum (100%) | Bright color, cannot go higher |

### 3.2 Research Allocation Slider

Located on the Empire Status panel, controls percentage of production allocated to research.

#### Structure
```
Research Allocation: [░░░░░░░░░▓▓▓▓▓▓▓▓▓▓] 60%
                     └────────────────────────┘
```

#### Behavior
- Range: 0% to 100%
- Affects empire-wide research points
- No auto-balance with other sliders
- Independent per-planet research allocation available in advanced settings

### 3.3 Spy Allocation Sliders

Two sliders for espionage management:

```
Internal Security: [▓▓▓▓▓▓▓▓░░░░░░░░░░░░] 40%
Espionage:         [░░░░░░░░░░░░▓▓▓▓▓▓▓▓] 60%
                   └───────── Must total 100% ─────────┘
```

**Linked Behavior:**
- These two sliders are linked; adjusting one automatically adjusts the other
- Total always equals 100%
- No lock option (they balance together)

### 3.4 Volume Sliders (Settings)

```
Master Volume:  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░] 80%  [🔊]
Music:          [▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░] 60%  [🎵]
SFX:            [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% [🔔]
Ambient:        [▓▓▓▓▓▓░░░░░░░░░░░░░░] 30%  [🌌]
```

- Independent sliders (no auto-balance)
- Icon buttons toggle mute for each channel
- Master affects all others proportionally
- Preview sound plays on adjustment

---

## 4. List Navigation

### 4.1 Standard List Behavior

Lists appear throughout the game (fleets, planets, ships, technologies, etc.).

#### Mouse Navigation
| Input | Action |
|-------|--------|
| Click item | Select item |
| Double-click item | Select and activate (context-dependent) |
| Click + drag | Select range (if multi-select enabled) |
| Right-click item | Open context menu |
| Scroll wheel | Scroll list |
| Click scroll bar | Jump scroll position |
| Drag scroll thumb | Continuous scroll |

#### Keyboard Navigation
| Key | Action |
|-----|--------|
| `↑` / `↓` | Move selection up/down |
| `Home` | Jump to first item |
| `End` | Jump to last item |
| `Page Up` | Scroll up one page |
| `Page Down` | Scroll down one page |
| `Enter` | Activate selected item |
| `Space` | Toggle selection (multi-select) |
| Type letters | Jump to matching item (type-ahead) |

#### Type-Ahead Search

When a list has focus, typing letters performs incremental search:

```
Fleet List (type "bat" to search):
┌─────────────────────────────┐
│ ▶ Alpha Scout Squadron      │
│   Asteroid Miners           │
│ ► Battle Group Alpha  ← Match│
│   Battle Group Beta         │
│   Defense Fleet             │
└─────────────────────────────┘
```

- Matching is case-insensitive
- Search resets after 1 second of no typing
- Cycles through matches if multiple
- Visual highlight on matching text

### 4.2 Multi-Select Lists

Some lists support selecting multiple items (e.g., ships when splitting fleets).

| Input | Action |
|-------|--------|
| Click | Select single item, deselect others |
| Ctrl+Click | Toggle selection (add/remove) |
| Shift+Click | Select range from anchor to clicked |
| Ctrl+A | Select all items |
| Ctrl+Shift+A | Deselect all items |
| Space | Toggle current item selection |

**Visual Feedback:**
```
┌─────────────────────────────┐
│ ☐ Cruiser "Sunflower"       │  ← Unselected
│ ☑ Destroyer "Whiskers"      │  ← Selected
│ ☑ Destroyer "Sniffles"      │  ← Selected
│ ☐ Fighter "Pellet I"        │  ← Unselected
│ ☑ Fighter "Pellet II"       │  ← Selected
└─────────────────────────────┘
  [3 ships selected]
```

### 4.3 Sortable Lists

Lists with sortable columns (e.g., Planet List, Fleet Summary).

#### Sort Interaction
| Input | Action |
|-------|--------|
| Click column header | Sort ascending by column |
| Click same header again | Toggle descending |
| Click different header | Sort by new column (ascending) |
| Shift+Click header | Secondary sort (multi-column) |

#### Sort Indicators
```
┌─Planet────────┬─Pop──↓──┬─Prod─────┬─Status────┐
│               │ (sorted) │          │           │
├───────────────┼──────────┼──────────┼───────────┤
│ New Hamburg   │   45M    │   95 BC  │ Building  │
│ Forest Moon   │   38M    │   82 BC  │ Idle      │
│ Desert Base   │   25M    │   65 BC  │ Defending │
└───────────────┴──────────┴──────────┴───────────┘

↑ = Ascending    ↓ = Descending
```

### 4.4 Tree Navigation (Tech Tree, etc.)

Hierarchical tree structures have additional navigation:

| Key | Action |
|-----|--------|
| `→` | Expand node / Move to child |
| `←` | Collapse node / Move to parent |
| `*` | Expand all under current |
| `-` (numpad) | Collapse all under current |
| `+` (numpad) | Expand current node |

---

## 5. Context Menus

### 5.1 General Context Menu Behavior

| Aspect | Specification |
|--------|---------------|
| Trigger | Right-click on element |
| Position | Appears at cursor position |
| Bounds | Adjusts to stay within viewport |
| Dismiss | Click outside, press Escape, or select item |
| Animation | Fade in 100ms, instant dismiss |
| Submenu delay | 200ms hover before submenu opens |

### 5.2 Context Menu Structure

```
┌─────────────────────────────┐
│ Menu Title (optional)       │  ← Bold header
├─────────────────────────────┤
│ Action Item           Key   │  ← Normal item
│ Another Action              │
│ ────────────────────────────│  ← Separator
│ Submenu Item          ▶     │  ← Has submenu
│ ────────────────────────────│
│ Disabled Item         Key   │  ← Grayed out
│ Dangerous Action      Del   │  ← Red text for destructive
└─────────────────────────────┘
```

### 5.3 Context Menu Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate items |
| `→` | Open submenu |
| `←` | Close submenu, return to parent |
| `Enter` | Activate item |
| `Escape` | Close menu |
| Letter | Jump to item starting with letter |

### 5.4 Submenu Behavior

```
┌─────────────────────────────┐
│ Send Fleet Here...     ▶    │──┬─────────────────────┐
│                             │  │ Scout Squadron      │
│                             │  │ Battle Group Alpha  │
│                             │  │ Defense Fleet       │
│                             │  │ ─────────────────── │
│                             │  │ All Available Fleets│
│                             │  └─────────────────────┘
```

- Submenu appears 200ms after hovering parent item
- Triangle indicator (▶) shows submenu presence
- Submenu positioned to right, or left if near edge
- Moving diagonally to submenu keeps parent highlighted

---

## 6. Drag and Drop

### 6.1 Fleet Ship Transfer

Drag ships between fleets or to create new fleets.

#### Initiation
| Input | Action |
|-------|--------|
| Click + drag ship | Begin drag |
| Hold 100ms + drag | Begin drag (touch) |

#### Visual Feedback
```
Before drag:
┌─Fleet Alpha────────────────┐
│ • Cruiser "Sunflower"      │
│ • Destroyer "Whiskers"     │  ← Dragging this
│ • Fighter "Pellet"         │
└────────────────────────────┘

During drag:
┌─Fleet Alpha────────────────┐
│ • Cruiser "Sunflower"      │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │  ← Ghost placeholder
│ • Fighter "Pellet"         │
└────────────────────────────┘
                    ┌───────────────────────┐
                    │ • Destroyer "Whiskers"│  ← Drag preview (50% opacity)
                    └───────────────────────┘
                              ↑
                          Cursor
```

#### Drop Targets
| Target | Result |
|--------|--------|
| Another fleet | Transfer ship to that fleet |
| Empty space | Create new fleet with ship |
| Invalid area | Snap back to original (rubber band) |
| Same fleet | Reorder within fleet |

#### Drop Feedback
| State | Appearance |
|-------|------------|
| Valid target | Green highlight border |
| Invalid target | Red highlight, X cursor |
| Hovering | Pulsing highlight |
| On drop | Flash confirmation |

### 6.2 Production Queue Reordering

Drag to reorder items in build queue.

```
Build Queue:
┌─────────────────────────────┐
│ 1. Cruiser (building)  ████ │  ← Cannot move (in progress)
│ 2. Cruiser             ░░░░ │
│ 3. Destroyer           ░░░░ │  ← Dragging
│ 4. Fighter             ░░░░ │
└─────────────────────────────┘

Reordering:
┌─────────────────────────────┐
│ 1. Cruiser (building)  ████ │
│ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ │  ← Drop indicator
│ 2. Cruiser             ░░░░ │
│ 3. Fighter             ░░░░ │  ← Moved down
└─────────────────────────────┘
        ┌─────────────────┐
        │ 3. Destroyer    │  ← Dragging
        └─────────────────┘
```

### 6.3 Component Arrangement (Ship Design)

Drag components in ship design to reorder weapon priorities.

### 6.4 Drag Thresholds

| Parameter | Value |
|-----------|-------|
| Minimum drag distance | 4 pixels |
| Touch hold delay | 100ms |
| Scroll zone (edge) | 40 pixels |
| Auto-scroll speed | 200px/sec |
| Snap-back animation | 200ms ease-out |

---

## 7. Focus and Hover States

### 7.1 Focus Indicators

Focus states are critical for keyboard navigation and accessibility.

#### Button Focus
```
Normal:      [  Save Design  ]
Focused:     [ ▸Save Design◂ ]   ← Visible border/glow
             ╰──────────────────── 2px solid highlight
Pressed:     [ ▾Save Design▴ ]   ← Inverted/depressed
```

#### Input Focus
```
Normal:      [Fleet Name: ______________]
Focused:     [Fleet Name: ______________|]   ← Cursor visible
             ╰───────────────────────────── Border highlight
```

#### List Item Focus
```
┌─────────────────────────────┐
│   Cruiser "Sunflower"       │
│ ▶ Destroyer "Whiskers"  ◀   │  ← Focused item (keyboard)
│   Fighter "Pellet"          │
└─────────────────────────────┘
```

### 7.2 Hover States

| Element | Normal | Hover |
|---------|--------|-------|
| Button | Flat color | Lighter, slight lift |
| List item | Normal background | Highlight background |
| Star (map) | Normal star | Glow effect, info appear |
| Slider | Normal track | Highlight track |
| Link | Normal text | Underline, color change |
| Icon button | Normal | Scale 110%, tooltip |

### 7.3 Tooltip Behavior

#### Timing
| Phase | Duration |
|-------|----------|
| Hover delay | 500ms before showing |
| Fade in | 150ms |
| Display | Until mouse leaves |
| Fade out | 100ms |
| Cooldown | 100ms before next tooltip |

#### Positioning
```
             ┌─────────────────────┐
             │ Plasma Cannon       │
             │ Damage: 20×4 shots  │   ← Tooltip
             │ Range: 5 hexes      │
             └─────────▼───────────┘
                   ↓
            [Plasma Cannon]        ← Target element
```

- Default: Above element, centered
- Fallback: Below if insufficient space above
- Never clip viewport edges
- Arrow points to target element

### 7.4 Disabled States

| Element | Disabled Appearance |
|---------|---------------------|
| Button | 50% opacity, no hover, cursor: not-allowed |
| Slider | Grayed track, no interaction |
| List item | Grayed text, skipped in keyboard nav |
| Input | Grayed, no cursor |
| Checkbox | Grayed, no toggle |

---

## 8. Modal Interaction Patterns

### 8.1 Modal Types

#### Confirmation Dialog
```
╔═══════════════════════════════════════════════╗
║  ⚠️ Confirm Action                             ║
╠═══════════════════════════════════════════════╣
║                                                ║
║  Are you sure you want to scrap the fleet     ║
║  "Battle Group Alpha"?                         ║
║                                                ║
║  This will recover 1,250 BC but cannot be     ║
║  undone.                                       ║
║                                                ║
╠═══════════════════════════════════════════════╣
║        [ Cancel ]         [ Scrap Fleet ]     ║
╚═══════════════════════════════════════════════╝
```

#### Information Dialog
```
╔═══════════════════════════════════════════════╗
║  ℹ️ Research Complete                          ║
╠═══════════════════════════════════════════════╣
║                                                ║
║  You have discovered PLASMA CANNON!           ║
║                                                ║
║  Your weapons technology has advanced.        ║
║  This weapon is now available in the Ship     ║
║  Design lab.                                   ║
║                                                ║
║  Damage: 20 × 4 shots                          ║
║  Range: 5 hexes                                ║
║                                                ║
╠═══════════════════════════════════════════════╣
║              [ Continue ]                      ║
╚═══════════════════════════════════════════════╝
```

#### Input Dialog
```
╔═══════════════════════════════════════════════╗
║  📝 Rename Fleet                               ║
╠═══════════════════════════════════════════════╣
║                                                ║
║  Enter new name for "Battle Group Alpha":     ║
║                                                ║
║  [Hamster Strike Force___________________]    ║
║                                                ║
║  (Max 32 characters)                           ║
║                                                ║
╠═══════════════════════════════════════════════╣
║        [ Cancel ]           [ Rename ]         ║
╚═══════════════════════════════════════════════╝
```

#### Selection Dialog
```
╔═══════════════════════════════════════════════╗
║  🚀 Select Ship Design                         ║
╠═══════════════════════════════════════════════╣
║                                                ║
║  Choose a design to build:                     ║
║                                                ║
║  ┌────────────────────────────────────────┐   ║
║  │ ( ) Scout "Explorer"      - 50 BC      │   ║
║  │ (•) Destroyer "Whiskers"  - 150 BC     │   ║
║  │ ( ) Cruiser "Sunflower"   - 400 BC     │   ║
║  │ ( ) Battleship "Thunder"  - 800 BC     │   ║
║  └────────────────────────────────────────┘   ║
║                                                ║
║  Build: ×[ 1 ] ships                          ║
║                                                ║
╠═══════════════════════════════════════════════╣
║        [ Cancel ]         [ Build ]            ║
╚═══════════════════════════════════════════════╝
```

### 8.2 Modal Behavior

| Aspect | Specification |
|--------|---------------|
| Background | Dim overlay (rgba(0,0,0,0.6)) |
| Position | Centered in viewport |
| Animation | Fade in 200ms, scale from 95% to 100% |
| Close methods | Cancel button, Escape key, click outside (configurable) |
| Focus trap | Tab cycles only within modal |
| Initial focus | First interactive element or primary button |
| Return focus | Returns to triggering element on close |

### 8.3 Modal Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move to next focusable element |
| `Shift+Tab` | Move to previous element |
| `Enter` | Activate focused button |
| `Escape` | Close modal (if cancelable) |
| `Space` | Activate focused button/checkbox |

### 8.4 Stacked Modals

When one modal opens another:

```
Base Screen (dimmed)
    └─► Modal 1 (dimmed)
            └─► Modal 2 (active)
```

- Each modal dims the previous
- Escape closes topmost only
- Focus returns through stack correctly

### 8.5 Turn Confirmation Modal

Special modal at end of turn:

```
╔═══════════════════════════════════════════════════════════╗
║  END TURN 15?                                              ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  Summary of pending actions:                               ║
║                                                            ║
║  ✓ 3 fleets will move to their destinations               ║
║  ✓ 2 ships will complete construction                      ║
║  ✓ Research "Plasma Cannon" continues (60%)               ║
║                                                            ║
║  ⚠️ Warning: Border Fort has no defending fleet!          ║
║                                                            ║
╠═══════════════════════════════════════════════════════════╣
║  [☐] Don't show warnings      [ Cancel ]  [ End Turn ⏎]  ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 9. Touch Controls (Tablet)

### 9.1 Touch Gesture Mapping

| Gesture | Mouse Equivalent | Action |
|---------|------------------|--------|
| Tap | Left-click | Select/activate |
| Double-tap | Double-click | Quick action |
| Long-press (800ms) | Right-click | Context menu |
| Drag | Click+drag | Move/scroll |
| Two-finger drag | Middle-click+drag | Pan map |
| Pinch | Scroll wheel | Zoom in/out |
| Two-finger tap | Right-click | Context menu |
| Swipe left/right | Arrow keys | Navigate lists |

### 9.2 Touch-Specific Adjustments

| Adjustment | Value |
|------------|-------|
| Minimum tap target | 44×44 pixels |
| Slider handle size | 48×48 pixels (touch) |
| List item height | 56 pixels minimum |
| Button padding | 16px minimum |
| Context menu item height | 48 pixels |
| Tooltip delay | Disabled (use long-press info) |

### 9.3 Touch Feedback

| Action | Feedback |
|--------|----------|
| Tap | Ripple effect from tap point |
| Long-press | Vibration (if supported), highlight |
| Drag start | Slight lift shadow |
| Invalid gesture | Subtle shake |
| Successful action | Haptic pulse |

---

## 10. Animation Specifications

### 10.1 Timing Standards

| Animation Type | Duration | Easing |
|----------------|----------|--------|
| Button press | 100ms | ease-out |
| Modal open | 200ms | ease-out |
| Modal close | 150ms | ease-in |
| Tooltip appear | 150ms | ease-out |
| Tooltip disappear | 100ms | ease-in |
| Slider adjustment | 100ms | ease-out |
| List reorder | 200ms | ease-in-out |
| Screen transition | 300ms | ease-in-out |
| Notification slide | 250ms | ease-out |
| Highlight pulse | 1000ms | sine wave |
| Error shake | 300ms (3 cycles) | ease-in-out |

### 10.2 Motion Principles

1. **Purposeful**: Animations guide attention, not distract
2. **Quick**: Never delay user actions
3. **Consistent**: Same action = same animation everywhere
4. **Reducible**: Respect `prefers-reduced-motion` setting

### 10.3 Reduced Motion Mode

When enabled:
- Fade transitions only (no transforms)
- Duration reduced to 100ms maximum
- No bounce/spring effects
- No continuous animations (pulsing)
- Instant scroll position changes

---

## 11. Accessibility Interaction Patterns

### 11.1 Screen Reader Announcements

| Event | Announcement |
|-------|--------------|
| Screen change | "Now on [Screen Name]" |
| Modal open | "[Modal Title] dialog" |
| Modal close | "Dialog closed" |
| Selection change | "[Item Name] selected" |
| Error | "Error: [message]" |
| Success | "[Action] completed" |
| Loading start | "Loading..." |
| Loading complete | "Content loaded" |

### 11.2 ARIA Attributes

| Element | ARIA |
|---------|------|
| Modal | `role="dialog"`, `aria-modal="true"` |
| Menu | `role="menu"`, items `role="menuitem"` |
| List | `role="listbox"`, items `role="option"` |
| Slider | `role="slider"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Tab panel | `role="tablist"`, tabs `role="tab"`, panels `role="tabpanel"` |
| Alert | `role="alert"`, `aria-live="assertive"` |
| Status | `role="status"`, `aria-live="polite"` |

### 11.3 Keyboard Focus Order

1. Skip link (hidden until focused)
2. Top navigation bar
3. Main content area (top to bottom, left to right)
4. Side panels
5. Bottom action bar

### 11.4 High Contrast Mode Adjustments

| Element | Adjustment |
|---------|------------|
| Focus indicator | 3px solid border (instead of glow) |
| Buttons | Solid border, no gradient |
| Selected items | Inverted colors |
| Disabled items | Strikethrough pattern |
| Sliders | High contrast track/handle |

---

## 12. Error Handling Interactions

### 12.1 Input Validation

#### Inline Validation
```
Ship Name: [This name is too long!!! ×]
           ↳ "Name must be 32 characters or fewer"
             └── Red text, error icon
```

#### Validation Timing
| Event | Action |
|-------|--------|
| On blur (leave field) | Validate and show error if invalid |
| On submit | Validate all, focus first error |
| While typing | Clear error when valid |
| After error | Re-validate on next change |

### 12.2 Error Recovery

| Error Type | Recovery |
|------------|----------|
| Invalid input | Show message, focus field |
| Action failed | Show toast, offer retry |
| Network error | Show message, auto-retry option |
| Fatal error | Show dialog, offer reload |

### 12.3 Error Message Format

```
[❌ Icon] Error Title
    ↳ Explanation of what went wrong
    ↳ Suggestion for how to fix
    
    [Retry] [Cancel] [Help]
```

---

## 13. JSON Data Tables

### 13.1 Key Bindings Configuration

```json
{
  "keyBindings": {
    "global": {
      "galaxyMap": { "key": "F1", "description": "Open Galaxy Map" },
      "planets": { "key": "F2", "description": "Open Planet Management" },
      "fleets": { "key": "F3", "description": "Open Fleet Command" },
      "research": { "key": "F4", "description": "Open Research Tree" },
      "diplomacy": { "key": "F5", "description": "Open Diplomacy" },
      "shipDesign": { "key": "F6", "description": "Open Ship Design" },
      "reports": { "key": "F7", "description": "Open Reports" },
      "council": { "key": "F8", "description": "Open High Council" },
      "endTurn": { "key": "Enter", "altKey": "Space", "description": "End Turn" },
      "menu": { "key": "Escape", "description": "Open Menu / Cancel" },
      "quickSave": { "key": "Ctrl+S", "description": "Quick Save" },
      "quickLoad": { "key": "Ctrl+L", "description": "Quick Load" },
      "mute": { "key": "M", "description": "Toggle Audio" },
      "help": { "key": "F11", "altKey": "?", "description": "Open Help" }
    },
    "galaxyMap": {
      "zoomIn": { "key": "+", "altKey": "=", "description": "Zoom In" },
      "zoomOut": { "key": "-", "description": "Zoom Out" },
      "resetZoom": { "key": "0", "description": "Reset Zoom" },
      "centerHome": { "key": "Home", "description": "Center on Homeworld" },
      "panUp": { "key": "ArrowUp", "description": "Pan Up" },
      "panDown": { "key": "ArrowDown", "description": "Pan Down" },
      "panLeft": { "key": "ArrowLeft", "description": "Pan Left" },
      "panRight": { "key": "ArrowRight", "description": "Pan Right" },
      "nextColony": { "key": "N", "description": "Select Next Colony" },
      "prevColony": { "key": "Shift+N", "description": "Select Previous Colony" },
      "nextFleet": { "key": "F", "description": "Select Next Fleet" },
      "prevFleet": { "key": "Shift+F", "description": "Select Previous Fleet" },
      "toggleGrid": { "key": "G", "description": "Toggle Grid Overlay" },
      "rangeCircles": { "key": "R", "description": "Toggle Range Circles" },
      "tradeRoutes": { "key": "T", "description": "Toggle Trade Routes" }
    },
    "planetManagement": {
      "prevPlanet": { "key": "ArrowLeft", "altKey": "[", "description": "Previous Planet" },
      "nextPlanet": { "key": "ArrowRight", "altKey": "]", "description": "Next Planet" },
      "focusShip": { "key": "S", "description": "Focus Ship Slider" },
      "focusDefense": { "key": "D", "description": "Focus Defense Slider" },
      "focusIndustry": { "key": "I", "description": "Focus Industry Slider" },
      "focusEcology": { "key": "E", "description": "Focus Ecology Slider" },
      "focusResearch": { "key": "R", "description": "Focus Research Slider" },
      "lockSlider": { "key": "L", "description": "Toggle Slider Lock" },
      "increaseSlider": { "key": "ArrowUp", "description": "Increase 5%" },
      "decreaseSlider": { "key": "ArrowDown", "description": "Decrease 5%" },
      "autoBalance": { "key": "A", "description": "Auto-Balance Sliders" }
    },
    "tacticalCombat": {
      "nextShip": { "key": "Tab", "description": "Select Next Ship" },
      "prevShip": { "key": "Shift+Tab", "description": "Select Previous Ship" },
      "weapon1": { "key": "1", "description": "Select Weapon 1" },
      "weapon2": { "key": "2", "description": "Select Weapon 2" },
      "weapon3": { "key": "3", "description": "Select Weapon 3" },
      "fire": { "key": "Space", "description": "Fire Weapon" },
      "wait": { "key": "W", "description": "Wait (Act Later)" },
      "hold": { "key": "H", "description": "Hold (End Turn)" },
      "retreat": { "key": "R", "description": "Retreat Ship" },
      "retreatAll": { "key": "Shift+R", "description": "Retreat All" },
      "autoCombat": { "key": "A", "description": "Toggle Auto-Combat" }
    }
  }
}
```

### 13.2 Animation Timing Configuration

```json
{
  "animations": {
    "defaults": {
      "durationFast": 100,
      "durationNormal": 200,
      "durationSlow": 300,
      "easingDefault": "ease-out",
      "easingBounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    },
    "elements": {
      "buttonPress": {
        "duration": 100,
        "easing": "ease-out",
        "properties": ["transform", "background-color"]
      },
      "modalOpen": {
        "duration": 200,
        "easing": "ease-out",
        "properties": ["opacity", "transform"],
        "fromScale": 0.95,
        "toScale": 1.0
      },
      "modalClose": {
        "duration": 150,
        "easing": "ease-in",
        "properties": ["opacity", "transform"]
      },
      "tooltipShow": {
        "duration": 150,
        "delay": 500,
        "easing": "ease-out",
        "properties": ["opacity"]
      },
      "sliderChange": {
        "duration": 100,
        "easing": "ease-out",
        "properties": ["width"]
      },
      "listReorder": {
        "duration": 200,
        "easing": "ease-in-out",
        "properties": ["transform"]
      },
      "screenTransition": {
        "duration": 300,
        "easing": "ease-in-out",
        "properties": ["opacity"]
      },
      "notificationSlide": {
        "duration": 250,
        "easing": "ease-out",
        "properties": ["transform", "opacity"]
      },
      "errorShake": {
        "duration": 300,
        "cycles": 3,
        "amplitude": 10
      }
    },
    "reducedMotion": {
      "maxDuration": 100,
      "disableTransforms": true,
      "disableContinuous": true
    }
  }
}
```

### 13.3 Touch Configuration

```json
{
  "touch": {
    "thresholds": {
      "tapMaxDuration": 200,
      "tapMaxMovement": 10,
      "longPressDelay": 800,
      "doubleTapMaxDelay": 300,
      "dragMinDistance": 10,
      "swipeMinVelocity": 0.5,
      "pinchMinScale": 0.1
    },
    "targets": {
      "minimumSize": 44,
      "sliderHandleSize": 48,
      "listItemHeight": 56,
      "buttonPadding": 16,
      "menuItemHeight": 48
    },
    "feedback": {
      "hapticTap": true,
      "hapticLongPress": true,
      "hapticSuccess": true,
      "rippleEffect": true,
      "visualFeedback": true
    },
    "gestures": {
      "tap": "select",
      "doubleTap": "quickAction",
      "longPress": "contextMenu",
      "drag": "scroll",
      "twoFingerDrag": "pan",
      "pinch": "zoom",
      "twoFingerTap": "contextMenu",
      "swipeLeft": "navigateBack",
      "swipeRight": "navigateForward"
    }
  }
}
```

### 13.4 Accessibility Configuration

```json
{
  "accessibility": {
    "focusIndicator": {
      "width": 2,
      "style": "solid",
      "color": "#4da6ff",
      "offset": 2
    },
    "highContrast": {
      "focusWidth": 3,
      "usePatterns": true,
      "invertSelection": true
    },
    "screenReader": {
      "announceScreenChange": true,
      "announceSelection": true,
      "announceErrors": true,
      "announceProgress": true,
      "verbosity": "medium"
    },
    "timing": {
      "tooltipDelay": 500,
      "tooltipDismiss": 5000,
      "autoHideNotifications": 8000,
      "focusReturnDelay": 100
    },
    "navigation": {
      "skipLink": true,
      "landmarkRegions": true,
      "headingHierarchy": true,
      "focusVisible": true
    }
  }
}
```

---

## 14. Edge Cases

### 14.1 Rapid Input Handling

| Scenario | Handling |
|----------|----------|
| Rapid clicks | Debounce 50ms, ignore duplicates |
| Slider spam | Throttle updates to 60fps |
| Multiple modals | Stack and queue, prevent conflicts |
| Key repeat | Respect OS repeat rate, debounce actions |

### 14.2 Boundary Conditions

| Scenario | Handling |
|----------|----------|
| Slider at 0% | Cannot decrease further, visual feedback |
| Slider at 100% | Cannot increase further, visual feedback |
| All sliders locked | Show warning, unlock required to adjust |
| Empty list | Show "No items" message |
| Very long names | Truncate with ellipsis, full text in tooltip |
| Viewport resize during interaction | Reposition modals, adjust layouts |

### 14.3 Conflicting Inputs

| Scenario | Resolution |
|----------|------------|
| Mouse + keyboard same element | Last input wins |
| Touch + mouse simultaneously | Prioritize touch |
| Drag interrupted by modal | Cancel drag, handle modal |
| Focus change during animation | Complete animation, then focus |

### 14.4 Network and Performance

| Scenario | Handling |
|----------|----------|
| Slow response | Show loading indicator after 200ms |
| Action timeout | Show error after 5 seconds, offer retry |
| Offline mode | Disable online features, show indicator |
| Low framerate | Reduce animation complexity |

---

## 15. Implementation Notes

### 15.1 Event Priorities

1. Modal interactions (highest)
2. Context menu interactions
3. Focused element interactions
4. Hover interactions
5. Global keyboard shortcuts (lowest)

### 15.2 State Management

- Current focused element
- Active modal stack
- Drag state (source, target, position)
- Selection state (single, multi, range anchor)
- Hover state (element, tooltip pending)
- Keyboard navigation mode (mouse vs keyboard last used)

### 15.3 Performance Considerations

- Use CSS transitions over JavaScript animations where possible
- Throttle scroll and resize handlers
- Debounce search/filter inputs
- Lazy render off-screen list items
- Cache tooltip content

---

*Document Version: 1.0*  
*Last Updated: 2026-03-22*  
*Reference: MOO1 Official Manual, StrategyWiki, existing HoO UI documents*
