# Wireframe: New Game Setup Flow

**Status:** STUB — Needs full wireframe development  
**Created:** 2026-04-12  
**Reference screenshots:** `../moo_screens/moo_new_game_menu.png`, `moo_new_game_race_select.png`, `moo_new_game_banner_select.png`, `moo_new_game_emporer_name.png`, `moo_new_game_home_world_name.png`

> ⚠️ **This is a stub wireframe.** The layout structure and step flow are defined here based on screenshots and `main-screens.md` §1. Full ASCII wireframes with exact component sizes, spacing, and interaction states need to be developed.

---

## Overview

The New Game Setup is a 5-step linear wizard. Each step is a full-screen modal with BACK/NEXT navigation. No bottom command bar.

**Flow:**
```
Step 1: Galaxy Setup → Step 2: Race Selection → Step 3: Banner/Color → Step 4: Emperor Name → Step 5: Home World Name → Game Start
```

---

## Step 1 — Galaxy Setup

**Screen name:** Galaxy Configuration  
**Reference:** `moo_new_game_menu.png`

**Key parameters (MOO1-faithful):**
- Galaxy Size: Small / Medium / Large / Huge
- Number of Opponents: 1–9 (default: 5, range: 1–9 per HoO spec; see `screen-inventory.md` §1.2)
- Difficulty: Tutor / Easy / Average / Hard / Impossible
- Age: Young / Average / Old (affects mineral richness)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              HAMSTER OF ORION                       │
│                                                     │
│           ─── New Game Setup ───                    │
│                                                     │
│  Galaxy Size      [ MEDIUM        ▼ ]               │
│                                                     │
│  Opponents        [  5  ]  (1-9)                    │
│                                                     │
│  Difficulty       [ AVERAGE       ▼ ]               │
│                                                     │
│  Galaxy Age       [ AVERAGE       ▼ ]               │
│                                                     │
│  ─────────────────────────────────────────          │
│                                                     │
│         [ BACK ]              [ NEXT → ]            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**TODO — full wireframe needs:**
- Exact control widths and alignment
- Dropdown option lists
- Tooltip/description area for each option
- Keyboard navigation behavior

---

## Step 2 — Race Selection

**Screen name:** Race Selection  
**Reference:** `moo_new_game_race_select.png`

**Key elements:**
- Grid of 10 alien race portraits (or human Hamsteroid)
- Selected race: name, homeworld, special traits, description text
- Pre-game race customization (if any)

```
┌─────────────────────────────────────────────────────┐
│           ─── Select Your Race ───                  │
│                                                     │
│  [ Race 1 ] [ Race 2 ] [ Race 3 ] [ Race 4 ]        │
│  [ Race 5 ] [ Race 6 ] [ Race 7 ] [ Race 8 ]        │
│  [ Race 9 ] [ Race 10]                              │
│                                                     │
│  ┌──────────────┐  Race Name: ___________           │
│  │   Portrait   │  Homeworld: ___________           │
│  │              │  Traits: _____________ │           │
│  └──────────────┘                                   │
│  Description: ________________________________      │
│  ____________________________________________       │
│                                                     │
│         [ ← BACK ]            [ NEXT → ]           │
└─────────────────────────────────────────────────────┘
```

**TODO — full wireframe needs:**
- Portrait grid layout with hover/selected states
- Trait display format (icons vs text)
- Whether custom race creation is supported

---

## Step 3 — Banner / Color Selection

**Screen name:** Banner Selection  
**Reference:** `moo_new_game_banner_select.png`

**Key elements:**
- Grid of banner/flag designs
- Color palette for empire color
- Preview of banner with selected color

```
┌─────────────────────────────────────────────────────┐
│         ─── Choose Your Banner & Color ───          │
│                                                     │
│  Banners:                                           │
│  [ B1 ] [ B2 ] [ B3 ] [ B4 ] [ B5 ]                │
│  [ B6 ] [ B7 ] [ B8 ] [ B9 ] [B10 ]                │
│                                                     │
│  Colors:                                            │
│  [●Red] [●Blue] [●Green] [●Yellow] [●Purple]        │
│  [●Cyan] [●Orange] [●White]                         │
│                                                     │
│  Preview: [ BANNER IMAGE ]                          │
│                                                     │
│         [ ← BACK ]            [ NEXT → ]           │
└─────────────────────────────────────────────────────┘
```

**TODO — full wireframe needs:**
- Exact number of banner designs available
- Whether color applies to banner tint or border
- Preview panel dimensions

---

## Step 4 — Emperor Name Entry

**Screen name:** Emperor Name Entry  
**Reference:** `moo_new_game_emporer_name.png`

**Key elements:**
- Text input field for emperor/leader name
- Default name pre-populated (race-specific)
- Character limit

```
┌─────────────────────────────────────────────────────┐
│          ─── Enter Your Emperor's Name ───          │
│                                                     │
│                                                     │
│         Emperor: [ _______________________ ]        │
│                  (max 20 characters)                │
│                                                     │
│                                                     │
│         [ ← BACK ]            [ NEXT → ]           │
└─────────────────────────────────────────────────────┘
```

**TODO — full wireframe needs:**
- Character limit (actual value)
- Whether name validation occurs (blocked chars, etc.)
- Accompanying portrait or flavor text

---

## Step 5 — Home World Name Entry

**Screen name:** Home World Name Entry  
**Reference:** `moo_new_game_home_world_name.png`

**Key elements:**
- Text input for homeworld name
- Default name pre-populated (race-specific)
- Planet image/preview

```
┌─────────────────────────────────────────────────────┐
│          ─── Name Your Home World ───               │
│                                                     │
│  ┌────────────┐                                     │
│  │   Planet   │  Home World: [ _________________ ] │
│  │   Image    │              (max 20 characters)   │
│  └────────────┘                                     │
│                                                     │
│                                                     │
│         [ ← BACK ]       [ BEGIN GAME → ]           │
└─────────────────────────────────────────────────────┘
```

**TODO — full wireframe needs:**
- Character limit
- Whether a planet type preview is shown
- Star system name entry (separate field or same screen?)

---

## Transitions

- **BACK** on Step 1 → returns to Main Menu
- **NEXT** on Step 5 / **BEGIN GAME** → triggers galaxy generation → fades into Galaxy Map (first turn, homeworld selected)
- **ESC** at any step → confirm dialog "Abandon setup and return to Main Menu?"

---

## Open Design Questions

1. Is there a "Custom Race" option on the Race Selection screen?
2. Does the galaxy generate during a loading screen between Step 5 and the Galaxy Map?
3. Are steps 3–5 skippable (random/default options)?

---

*Stub created 2026-04-12 by Wesley (subagent). Needs full wireframe development.*
