# Hamster of Orion - Victory & Ending Narrative Specification

## Overview

This document specifies the narrative text, ending cutscenes, UI dialog flows, and visual sequences for all victory and defeat paths in **Hamster of Orion**, matching Master of Orion 1 mechanics.

**References:**
- [Victory Conditions Design Spec](file:///Users/jchilders/mywork/hamster-of-orion/design/game-mechanics/victory-conditions.md)
- [Diplomacy & Council Spec](file:///Users/jchilders/mywork/hamster-of-orion/design/diplomacy/council.md)
- [End Game Screens Wireframe](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/wireframes/end-game-screens.md)

---

## 1. High Council Diplomatic Victory

### 1.1 Trigger & High Council Session
When empires control at least 2/3 of the total galaxy population, the High Council convenes on Orion. The two largest leaders are nominated. To win, a candidate must receive a 2/3 supermajority vote from all council delegates.

### 1.2 Election Victory Narrative
> *"The High Council of Orion has cast its final votes. Delegates from across the galaxy rise in unison to applaud your leadership. By diplomatic acclaim and overwhelming political consensus, Emperor [Player Name] of the [Player Species] is crowned High Chancellor of the Galactic Federation. A era of unprecedented galactic peace and shared prosperity begins under your wise rule."*

### 1.3 Council Refusal & Final War Narrative
If the player wins the 2/3 vote but the losing rival empire refuses to accept the council's verdict:
> *"The High Council has elected you High Chancellor! However, Emperor [Rival Name] of the [Rival Species] slams their fist upon the council rostrum and declares: 'Never! We will not bow to your false federation!' The rival empires break away, forming a suicidal grand alliance. Prepare your fleets—the Final War has begun. You must eliminate all opposition to enforce council law!"*

---

## 2. Military Conquest Victory (Domination)

### 2.1 Trigger
Achieved when every opposing alien empire has been completely eliminated—their homeworlds glassed or invaded, their fleets destroyed, and their colonies annexed.

### 2.2 Domination Victory Narrative
> *"The final enemy world has fallen. Star by star, system by system, your war armadas have established absolute dominion over the galaxy. No alien fleet remains to challenge your authority; no rival flag flies in known space. The [Player Species] stand undisputed as the supreme masters of Orion and the entire cosmos."*

---

## 3. Orion Guardian Defeat Story Sequence

### 3.1 Trigger
Achieved when player fleets engage and destroy the automated Guardian ship guarding the Orion star system.

### 3.2 Triumph Narrative
> *"Sensors confirm: the automated Guardian of Orion has detonated in a brilliant flash of plasma! For tens of thousands of years, the precursor homeworld remained forbidden. Now, your victory fleet descends to the surface of Orion. Ancient stasis vaults open, bestowing lost technologies, hyper-advanced weaponry, and infinite energy matrix blueprints upon your empire. The galaxy gazes in awe as you claim the throne of the Ancients!"*

---

## 4. Defeat Scenarios & Narratives

### 4.1 Diplomatic Defeat (Rival Elected Council Leader)
If a rival leader receives a 2/3 majority vote in the High Council and the player chooses to submit to council decree:
> *"The High Council has spoken. Emperor [Rival Name] has been elected High Chancellor of the Galaxy. Bowing to the supreme will of the council, your empire surrenders its sovereignty and merges into the new Galactic Empire. Your reign as independent ruler ends here."*

### 4.2 Extinction Defeat (Military Elimination)
If all player colonies are invaded or destroyed by rival armadas:
> *"Your last colony planet burns. The final defense fleet of the [Player Species] breaks apart in orbital debris. Alien invaders march through the ruins of your cities. The story of your people ends not with a bang, but with silent ashes scattered across the void. Game Over."*

---

## 5. UI Interaction & End Game Flow (3-Part)

1. **Trigger / Click Response**:
   - Triggered at start of turn processing when win/loss condition evaluation evaluates to TRUE.
   - Triggers the [End Game Screen UI](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/wireframes/end-game-screens.md).
   - Clicking `[View Galaxy Statistics]` transitions to the end-game score graph & timeline view.
2. **Visual Transition**:
   - Screen fades to victory artwork overlay (Gold frame for win, Crimson frame for defeat) over a 1.2-second transition.
   - Victory fanfare plays.
3. **Return Path / Exit Method**:
   - Clicking `[Main Menu]` returns to the title screen (`moo_new_game_menu.png`).
   - Clicking `[Hall of Fame]` saves score metadata to local storage and displays top high scores before returning to main menu.
