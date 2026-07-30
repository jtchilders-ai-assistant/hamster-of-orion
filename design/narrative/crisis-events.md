# Hamster of Orion - Crisis & Random Events Narrative Specification

## Overview

This document specifies the narrative text, crisis alerts, monster encounter dialogs, and event prompts for all random occurrences in **Hamster of Orion**, aligned with Master of Orion 1 random event mechanics.

**References:**
- [Random Events Design Spec](file:///Users/jchilders/mywork/hamster-of-orion/design/game-mechanics/random-events.md)
- [StrategyWiki Random Events Reference](file:///Users/jchilders/mywork/hamster-of-orion/reference/strategywiki-moo1.txt)

---

## 1. Space Monster Incursions

### 1.1 Space Amoeba
> *"CRITICAL WARNING: A colossal organic Space Amoeba has entered the [System Name] star system! This cosmic behemoth is consuming planetary atmosphere and energy grids. Armed fleets must be dispatched immediately to destroy the creature before the colony is wiped out!"*

### 1.2 Space Crystal
> *"DANGER: A crystalline entity of immense energy has materialized near [System Name]! Emitting deadly energy pulses, the Space Crystal is targeting orbital defenses and surface factories. Mobilize war fleets to eliminate the threat!"*

---

## 2. Galactic Disasters

### 2.1 Supernova Threat
> *"URGENT DISASTER ALERT: Astrophysicists report that the star [System Name] has entered a rapid destabilization phase! The star WILL explode into a Supernova in [X] turns, destroying all planets and colonies in the system. Evacuate all population and factories immediately!"*

### 2.2 Planetary Plague
> *"BIOHAZARD EMERGENCY: A virulent bio-pathogen has broken out on [Planet Name]! Population death rate is accelerating by [X]% per turn. The outbreak can be contained by injecting [BC Amount] BC from the Planetary Reserve into medical research or by researching advanced Ecology technologies."*

### 2.3 Industrial Rebellion / Strike
> *"REBELLION ALERT: Disgruntled factory workers on [Planet Name] have seized control of industrial complexes! Factory production is frozen. Dispatched troop transports or allocation of planetary reserve funds to morale programs will restore order."*

### 2.4 Comet Impact Course
> *"COLLISION ALERT: A giant rogue comet is on a direct collision course with [Planet Name]! Impact in [X] turns will reduce max population capacity by 50% and destroy 75% of factories. Dispatch warships equipped with beam weapons or missiles to destroy the comet before impact!"*

---

## 3. UI Interaction Spec for Crisis Modals (3-Part)

1. **Trigger / Click Response**:
   - Triggered at start of turn processing when a random crisis event rolls positive.
   - Red header banner with flashing alert icon.
2. **Visual Transition**:
   - Camera swings across the galaxy map to center on the impacted planet/system.
   - Event dialog modal overlays the screen with distinct crisis artwork.
3. **Return Path / Exit Method**:
   - Clicking `[Acknowledge]` or pressing `Esc` closes the crisis prompt.
   - Adds a red warning icon to the Turn Summary notification drawer on the right side of the screen.
