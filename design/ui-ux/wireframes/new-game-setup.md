# Wireframe: New Game Setup Flow

## Overview

The New Game Setup is a 5-step linear wizard leading from main menu selection to initial galaxy generation.

**Status:** COMPLETE Specification  
**Reference Materials:**
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)

**Reference Screenshots:**
- ![Title Menu](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_menu.png)
- ![Race Selection](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_race_select.png)
- ![Banner Select](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_banner_select.png)
- ![Emperor Name](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_emporer_name.png)
- ![Home World Name](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_new_game_home_world_name.png)

---

## Screen Layout Architecture (Wizard Layout)

```
┌─────────────────────────────────────────────────────────────────┐
│                      NEW GAME SETUP (STEP 2 OF 5)               │
│  ═════════════════════════════════════════════════════════════  │
│                                                                 │
│  SELECT YOUR SPECIES:                                           │
│                                                                 │
│  [ HAMSTERS ]  [ ANTS ]  [ BUDGIES ]  [ CHAMELEONS ]  [ FERRETS ]│
│  [ GUINEA PIGS ] [ HERMIT CRABS ] [ MICE ] [ RABBITS ] [ RATS ] │
│                                                                 │
│  ┌───────────────┐  SPECIES: HAMSTERS                           │
│  │               │  TRAIT: Natural Aviators & Pilot Skill       │
│  │  [ PORTRAIT ] │  BONUS: +2 Combat Defense                    │
│  │               │  HOMEWORLD: Hamsteria (Terran)               │
│  └───────────────┘                                              │
│                                                                 │
│            [ ← BACK ]                    [ NEXT STEP → ]        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4-Column Interaction Element Table

| UI Element | (a) Trigger Response | (b) Visual Transition | (c) Return Path / Exit Method |
| :--- | :--- | :--- | :--- |
| **Wizard Radio Options (Size, Diff)** | Selects parameter choice | Highlights selected button with gold border | Selection persists until changed or wizard reset |
| **Species Grid Card** | Selects active empire species | Updates portrait, stats, and trait description box | Selection persists until another card clicked |
| **Text Entry Fields (Name, Homeworld)** | Focuses input cursor | Shows blinking cursor; validates string against illegal chars | Pressing `Enter` or clicking `[NEXT]` validates and proceeds |
| **`[NEXT STEP →]` Button** | Validates current step inputs and advances wizard | Fades current step out (`200ms`) and slides in next step | Progresses to Step N+1 |
| **`[← BACK]` Button** | Returns to previous setup step | Fades current step out and slides in Step N-1 | Returns to Step N-1; clicking Back on Step 1 returns to Main Menu |
| **`[BEGIN GAME →]` Button (Step 5)** | Triggers procedural galaxy generator | Displays star system loading screen and fades into Galaxy Map | Opens Homeworld View (`moo_galaxy_home.png`), starting Turn 1 |
| **Keyboard `Esc` Key** | Prompts setup cancellation | Displays `"Cancel setup and return to Main Menu?"` confirmation dialog | Pressing `Esc` again or confirming returns to Main Menu (`moo_new_game_menu.png`) |
