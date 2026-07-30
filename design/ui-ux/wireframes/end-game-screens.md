# Wireframe: End Game Screens (Victory & Defeat)

## Overview

The End Game screens handle game resolution, victory/defeat fanfare presentations, score breakdown calculations, galactic rankings, and return paths to the title menu.

**Status:** COMPLETE Specification  
**Reference Materials:**
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)
- [StrategyWiki MOO1 Reference Text](file:///Users/jchilders/mywork/hamster-of-orion/reference/strategywiki-moo1.txt)

**Reference Screenshots:**
- Screenshot Directory: [design/moo_screens/](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/)

---

## Screen Layout Architecture (Score Breakdown)

```
┌─────────────────────────────────────────────────────────────────┐
│                     GALACTIC HALL OF FAME                       │
│  ═════════════════════════════════════════════════════════════  │
│                                                                 │
│  EMPEROR: Hammy the Great       SPECIES: Hamsters               │
│  VICTORY TYPE: Council Diplomatic Election                      │
│                                                                 │
│  Colonies Controlled:     +12,000                               │
│  Population Total:        + 8,400                               │
│  Techs Researched:        + 6,200                               │
│  Military Supremacy:      + 5,800                               │
│  Reserve Treasury:        + 4,100                               │
│  Difficulty Multiplier:   × 1.50 (Hard)                         │
│  ─────────────────────────────────────────────────────────────  │
│  FINAL SCORE:              54,750                               │
│  GALACTIC RANK:            HIGH CHANCELLOR OF ORION             │
│                                                                 │
│       [ VIEW GRAPH ]      [ HALL OF FAME ]      [ MAIN MENU ]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4-Column Interaction Element Table

| UI Element | (a) Trigger Response | (b) Visual Transition | (c) Return Path / Exit Method |
| :--- | :--- | :--- | :--- |
| **`[VIEW GRAPH]` Button** | Displays comparative power curve graph over turns | Slides graph panel over score breakdown | Click `[Back]` or press `Esc` to return to score view |
| **`[HALL OF FAME]` Button** | Saves local score payload and opens leaderboard | Fades into local top-10 high scores table | Click `[Close]` or press `Esc` to return to main menu |
| **`[MAIN MENU]` Button** | Terminates session state and clears active save | Fades screen out (`1.0s ease-in-out`) | Loads Main Title Menu (`moo_new_game_menu.png`) |
| **Keyboard `Space` / `Enter`** | Advances sequence from fanfare to score breakdown | Fades fanfare artwork out | Progresses forward to next ending screen |
| **Keyboard `Esc` Key** | Prompts confirmation to exit ending cutscene | Displays exit modal prompt | Returns to Main Title Menu (`moo_new_game_menu.png`) |
