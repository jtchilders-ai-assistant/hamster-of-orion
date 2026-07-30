# UI Specification: Interactive Tutorial & Advisor System

## Overview

This document specifies the interactive first-time player onboarding walkthrough, advisor recommendation UI overlays, contextual hint popups, and toggle controls in **Hamster of Orion**.

**References:**
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)
- [Main Screens Spec](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/main-screens.md)

---

## 1. Onboarding Walkthrough Steps

When launching a new game with `[Enable Tutorial]` checked in setup, the game presents a guided 6-step interactive walkthrough.

```
+-------------------------------------------------------------------+
|  ADVISOR HINT: LESSON 1 - SCOUTING THE VOID               [X]     |
+-------------------------------------------------------------------+
|                                                                   |
|  Welcome, Emperor! Your first task is to explore surrounding      |
|  star systems.                                                    |
|                                                                   |
|  ACTION REQUIRED: Click on your Scout fleet stationed at          |
|  Hamsteria, then click on an unexplored star system.              |
|                                                                   |
|  +-----------------------+              +----------------------+  |
|  |     [SKIP LESSON]     |              |    [DISABLE TUTORIAL]|  |
|  +-----------------------+              +----------------------+  |
+-------------------------------------------------------------------+
```

---

## 2. Interaction Specifications (3-Part)

### 2.1 Guided Spotlight Overlay
1. **Trigger / Click Response**:
   - Tutorial banner attaches to the top of the UI.
   - Target UI elements (e.g. Scout ship icon, Colony sliders) are highlighted with a glowing gold border (`box-shadow: 0 0 15px gold; animate pulse 1.5s`).
   - Non-target UI controls are semi-transparent and disabled until the lesson objective is fulfilled.
2. **Visual Transition**:
   - Completing the requested action (e.g. setting scout destination) advances the tutorial progress bar and displays a green checkmark (`"Objective Complete!"`).
3. **Return Path / Exit Method**:
   - Clicking `[SKIP LESSON]` advances to the next lesson immediately.
   - Clicking `[DISABLE TUTORIAL]` or pressing `Esc` disables all tutorial overlays for the remainder of the session and restores full UI interaction.

### 2.2 In-Game Advisor Recommendations
- **Production Advisor**: Appears on Colony view when factory capacity is maxed out, recommending reallocation of Ind slider to Ship or Research.
- **Defense Advisor**: Appears when enemy fleets approach an undefended colony, recommending missile base construction.
- **Research Advisor**: Appears on Tech screen, highlighting recommended breakthroughs based on empire strategic posture.
