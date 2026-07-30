# Hamster of Orion - Opening Story & Lore Narrative Specification

## Overview

This document specifies the master lore, galactic backstory, species-specific intro narratives, and introductory cutscene UI specs for **Hamster of Orion**, directly grounded in the original Master of Orion (1993) backstory and universe lore.

**References:**
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)
- [StrategyWiki MOO1 Reference Text](file:///Users/jchilders/mywork/hamster-of-orion/reference/strategywiki-moo1.txt)
- [Master Lore Document](file:///Users/jchilders/mywork/hamster-of-orion/design/LORE.md)

---

## 1. Galactic Backstory & The Orion Precursor Mythos

Eons ago, the galaxy was ruled by an ancient, hyper-advanced civilization known only as the **Precursors of Orion**. They shaped stellar systems, terraformed barren worlds, and constructed the Cosmic Wheel—a central power structure surrounding the star system **Orion**.

Without warning, the Ancient Ones vanished from known space, leaving behind Orion—a mythic paradise world guarded by an impenetrable automated leviathan known as the **Guardian of Orion**.

Now, ten distinct species have unlocked sub-light interstellar travel and hyperspace warp drives simultaneously. The galaxy stands on the precipice of a new era. Each species must expand from their homeworld, colonize uncharted star systems, master cutting-edge technologies, manage planetary economies, and either unite the High Council through diplomacy or achieve total galactic conquest.

---

## 2. Species Opening Intros

When launching a new game, after selecting a race and named emperor in the [New Game Setup UI](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/wireframes/new-game-setup.md), the player is presented with a race-specific narrative intro modal overlay.

### 2.1 Hamsters (Alkari Equivalent)
> *"For centuries, the Hamster clans have tilled the fertile soil of rodent homeworlds and gazed up at the stars. Natural flyers and agile pilots, your people have achieved hyperspace travel through unyielding curiosity and industrial discipline. As Emperor, your mission is clear: spread our burrows across the cosmos and establish an enduring era of peace—or crush those who threaten our freedom."*

### 2.2 Ants (Klackon Equivalent)
> *"The High Queen of the Ant Hive has spoken. Unified under a single consciousness, our worker legions do not sleep, do not pause, and do not compromise. Our subterranean nests thrive on maximum efficiency. As the Supreme Mind, expand the Hive to every star system in the sector. Unaligned races will submit to the swarm or be harvested."*

### 2.3 Budgies (Psilon Equivalent)
> *"Knowledge is the ultimate force in the galaxy. From the high perches of our academic towers, Budgie scholars have unlocked quantum energy matrices and advanced propulsion. Though our physical forms are delicate, our intellectual superiority is unmatched. As Grand Chancellor, lead our scientists to master the six technological fields and uncover the lost secrets of Orion."*

### 2.4 Chameleons (Darlok Equivalent)
> *"Shadows shield the Chameleon Hegemony. Master shapeshifters and subversion specialists, we walk unseen among the alien courts. While rival empires boast of massive fleets, our covert networks will turn their own weapons against them. As Master Spymaster, sow discord, steal their secrets, and let our enemies destroy one another."*

### 2.5 Ferrets (Mrrshan Equivalent)
> *"Fierce, proud, and relentless, the Ferret Prides rule through military prowess and marksmanship. Our warrior pilots hunger for combat and glory among the stars. Weakness is an invitation to strike. As Supreme Commander, lead our battle fleets to reclaim our ancestral honor across the stellar sea."*

### 2.6 Guinea Pigs (Bulrathi Equivalent)
> *"Engineered for resilience, the Guinea Pig clans fear neither harsh climates nor grueling planetary sieges. Strong of body and stubborn of mind, our heavy infantry can hold any world against impossible odds. As High Chieftain, carve out an unshakeable realm where no alien aggressor can ever break our defenses."*

### 2.7 Hermit Crabs (Meklar Equivalent)
> *"Cybernetic augmentation has elevated the Hermit Crabs beyond organic limits. Wrapped in impenetrable titanium shells and automated exo-suits, our industrial output scales without limit. As Prime Architect, construct automated factory complexes across every star system and build an unstoppable armadas of war dreadnoughts."*

### 2.8 Mice (Human Equivalent)
> *"Charismatic, adaptable, and clever, the Mouse Republics excel in diplomacy, trade, and political coalition building. Alien leaders listen when our envoys speak. As President, forge non-aggression treaties, build lucrative trade routes, and rally the Galactic High Council to crown you Emperor of the Galaxy."*

### 2.9 Rabbits (Sakkra Equivalent)
> *"Life flourishes where the Rabbit clutches tread. With unmatched population growth and rapid expansion rates, our colonies overflow with eager pioneers. As Great Matriarch, send colony fleets to claim every fertile world in the quadrant before rival empires can plant their flags."*

### 2.10 Rats (Silicoid Equivalent)
> *"Born in subterranean magma tunnels and harsh radioactive waste, the Rat Enclaves thrive where organic life perishes. We consume minerals directly from barren rock and ignore planetary pollution entirely. As Warlord, spread our hardy hosts across hostile worlds and consume the galaxy's resources."*

---

## 3. Introductory Cutscene & Text Crawl UI Spec

### 3.1 Visual & Audio Layout
- **Screen State**: Overlay modal centered over the initial Homeworld System view on the Galaxy Map.
- **Background**: Parallax scrolling starry nebula backdrop with animated homeworld planet rotating on the left side.
- **Text Box**: Parchment/hologram styled dialog window on the right side with gold borders. Text crawls upward at 30 wpm.
- **Audio**: Ambient theme music tailored to race personality (e.g. martial drums for Ferrets, orchestral synth for Budgies).

### 3.2 Interaction Spec (3-Part)
1. **Trigger / Click Response**:
   - Triggered automatically upon clicking "Start Game" in the final step of [New Game Setup UI](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/wireframes/new-game-setup.md).
   - Clicking anywhere inside the text panel speeds up scrolling text to 120 wpm.
   - Clicking `[Skip Intro]` button or pressing `Esc` / `Space` immediately terminates the text crawl.
2. **Visual Transition**:
   - Dialog box smoothly fades out (`300ms ease-out`).
   - Camera zooms in from galaxy overview to focus on the homeworld system (`800ms cubic-bezier`).
3. **Return Path / Exit Method**:
   - Automatically closes upon text completion or `[Begin Conquest]` button click.
   - Focus is transferred directly to the Homeworld Colony View on the Galaxy Map (`moo_galaxy_home.png`), with Turn 1 active.
