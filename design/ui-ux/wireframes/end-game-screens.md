# Wireframe: End Game Screens (Victory & Defeat)

**Status:** STUB — Needs full wireframe development  
**Created:** 2026-04-12  
**Reference:** `state-transitions.md` §8.4, `screen-inventory.md` §6, `navigation-flow.md` §1

> ⚠️ **This is a stub wireframe.** The screen names, victory/defeat conditions, and flow are defined here based on `state-transitions.md` §8.4. Full visual layouts, animation sequences, and exact text need to be designed.

---

## Victory Conditions (from `state-transitions.md` §8.4)

| State Name | Trigger |
|-----------|---------|
| `VICTORY_DOMINATION` | Military conquest — all other empires eliminated |
| `VICTORY_DIPLOMATIC` | Won High Council election and accepted the role |
| `VICTORY_TECHNOLOGICAL` | Research all technologies (if applicable) |
| `VICTORY_ECONOMIC` | Accumulate enough BC to win (if applicable) |
| `VICTORY_SCORE` | Score victory at turn limit (highest score wins) |

## Defeat Conditions

| State Name | Trigger |
|-----------|---------|
| `DEFEAT_CONQUEST` | All colonies captured/destroyed by enemies |
| `DEFEAT_SCORE` | Turn limit reached, score too low / another player wins |

---

## Screen Flow

```
Victory/Defeat Screen → Final Score Screen → Credits → Main Menu
```

All end-game screens lead back to the Main Menu. No "play again" shortcut (confirm this design decision).

---

## Victory Screen

### `VICTORY_DIPLOMATIC` — Council Victory

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ★  VICTORY!  ★                              │
│                                                                 │
│         "By decree of the Galactic High Council..."             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │         [ Coronation / Throne Room Graphic ]              │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│     Grand Nibbler of the Hamsteroid Empire                      │
│     has been elected GUARDIAN OF THE GALAXY!                    │
│                                                                 │
│  Total Turns: 147       Final Score: 48,230                     │
│  Difficulty: Average    Rank: OVERLORD                          │
│                                                                 │
│              [ VIEW FULL SCORE ]   [ CONTINUE ]                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### `VICTORY_DOMINATION` — Military Conquest

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                  ★  CONQUEST COMPLETE!  ★                      │
│                                                                 │
│      "The last enemy fleet burns. The galaxy is yours."         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │          [ Galaxy Map showing full control ]              │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│     All 10 races have submitted to the Hamsteroid Empire!       │
│                                                                 │
│  Total Turns: 203       Final Score: 61,840                     │
│  Difficulty: Hard       Rank: SUPREME OVERLORD                  │
│                                                                 │
│              [ VIEW FULL SCORE ]   [ CONTINUE ]                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Other Victory Types

**TODO:** Separate layouts or shared template?  
- `VICTORY_TECHNOLOGICAL` — "You have mastered all the sciences of the universe..."
- `VICTORY_ECONOMIC` — TBD (design decision: does HoO have economic victory?)
- `VICTORY_SCORE` — Turn-limit score victory; similar format to above

---

## Defeat Screen

### `DEFEAT_CONQUEST` — All Colonies Lost

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   ✗  DEFEAT  ✗                                  │
│                                                                 │
│        "The last Hamsteroid colony has fallen..."               │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │              [ Burning planet graphic ]                   │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│     Defeated by: Guinea Pig Empire on Turn 89                   │
│                                                                 │
│  Total Turns: 89        Final Score: 12,400                     │
│  Difficulty: Average    Rank: ENSIGN                            │
│                                                                 │
│              [ VIEW FULL SCORE ]   [ CONTINUE ]                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### `DEFEAT_SCORE` — Score Defeat

```
┌─────────────────────────────────────────────────────────────────┐
│                   ✗  GAME OVER  ✗                               │
│                                                                 │
│     "The galactic age has passed. History will not               │
│      remember your empire..."                                   │
│                                                                 │
│  Another race achieved victory before you.                      │
│                                                                 │
│  Final Standings:                                               │
│  1. Guinea Pig Empire   — 54,200  (WINNER)                      │
│  2. Hamsteroid Empire   — 32,100  (YOU)                         │
│  3. Bunnoid Republic    — 28,400                                │
│  ...                                                            │
│                                                                 │
│              [ VIEW FULL SCORE ]   [ CONTINUE ]                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Final Score Screen

Follows any victory or defeat screen.

```
┌─────────────────────────────────────────────────────────────────┐
│                       FINAL SCORE                               │
│                                                                 │
│  Empire:      Hamsteroid Empire                                 │
│  Emperor:     Grand Nibbler                                     │
│  Difficulty:  Average                                           │
│  Galaxy Size: Medium                                            │
│  Turns Taken: 147                                               │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Score Breakdown:                                               │
│  Colonies controlled:     +12,000                               │
│  Population:              + 8,400                               │
│  Technologies researched: + 6,200                               │
│  Military strength:       + 5,800                               │
│  BC reserves:             + 4,100                               │
│  Difficulty bonus:        × 1.00                                │
│  ─────────────────────────────────────────────────────────────  │
│  TOTAL SCORE:              48,230                               │
│  RANK:                     OVERLORD                             │
│                                                                 │
│            [ RETURN TO MAIN MENU ]                              │
└─────────────────────────────────────────────────────────────────┘
```

**TODO — full wireframe needs:**
- Rank scale (what are all possible ranks?)
- Whether score is compared to a high score table
- Whether Hall of Fame / leaderboard is included
- Whether score formula is final (BC bonus, difficulty multiplier values)

---

## Transitions

- Victory/Defeat → (optional animation/fanfare) → Final Score Screen
- Final Score → Credits (optional, skippable) → Main Menu
- **ESC** at any point skips to Main Menu with confirm dialog

---

## Open Design Questions

1. Does HoO include a high score / hall of fame local table?
2. Is there a "Retire" option that triggers a score-based end without defeat?
3. What are all rank names (Ensign → ... → Supreme Overlord)?
4. Does `VICTORY_ECONOMIC` / `VICTORY_TECHNOLOGICAL` exist in HoO, or is it MOO1-only?
5. Is there victory animation / fanfare, or static screen?

---

*Stub created 2026-04-12 by Wesley (subagent). Needs full wireframe development.*
