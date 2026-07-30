# Hamster of Orion - Discovery & Exploration Events Narrative Specification

## Overview

This document specifies the narrative text, popups, and reward lore for exploration discoveries, ancient ruins, artifact worlds, and anomaly encounters in **Hamster of Orion**.

**References:**
- [Exploration Mechanics Spec](file:///Users/jchilders/mywork/hamster-of-orion/design/galaxy/exploration.md)
- [Special Planets Spec](file:///Users/jchilders/mywork/hamster-of-orion/design/planets/special-planets.md)
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)

---

## 1. Unexplored System Arrival Popups

When a scout ship or fleet reaches an unexplored star system for the first time, a start-of-turn event popup displays system details (`moo_start_of_turn_new_planet_reveal.png`).

### 1.1 Terran / Ideal World Discovery
> *"Scout sensors confirm an extraordinary discovery in the [System Name] star system! Planet [System Name] I is a lush, fertile world rich in bio-diversity and clean water. Max population capacity is estimated at [Cap] million. Colonization is highly recommended!"*

### 1.2 Hostile Environment Discovery
> *"Scout ships have surveyed the [System Name] system. The primary world possesses a toxic, high-gravity atmosphere. Special Planetology colonization technology (Toxic Landing) is required before a colony can be established here."*

### 1.3 Rich / Ultra-Rich Mineral Discovery
> *"Galleys of heavy ore veins illuminate scanner displays! Planet [System Name] contains vast deposits of rare heavy metals and neutronium ore. Factories built on this world will generate +100% (Rich) to +200% (Ultra-Rich) production output!"*

---

## 2. Artifact Planets & Ancient Ruins

### 2.1 Artifact Planet Exploration
> *"Surveys of [Planet Name] reveal ancient subterranean planetary vaults built by a forgotten precursor species. Scientific research conducted on this world receives a permanent +100% Research RP multiplier! Furthermore, our ground team has recovered intact tech blueprints for [Technology Name]!"*

### 2.2 Orion Precursor Relic Vault
When colonizing or surveying Orion after defeating the Guardian:
> *"Extensive excavations of Orion's central continent have uncovered the Great Vault of the Ancients. Among the crystalline data matrices, our engineers have extracted legendary precursor technologies: [List of Orion Techs, e.g. Death Ray, Particle Beam, Spatial Tearer]!"*

---

## 3. Derelict Ships & Space Anomalies

### 3.1 Abandoned Precursor Hull Discovery
> *"Scouting units in deep space have intercepted an abandoned precursor warship drifting in orbit around an asteroid belt. Our engineers have successfully towed the vessel to our nearest colony yard. The ship has been added to our fleet reserves as a unique Cruiser class hull!"*

### 3.2 Space Hyperspace Anomaly
> *"A localized hyperspace fold has been detected near [System Name]. Ships traveling through this sector will gain +2 warp engine speed for 10 turns."*

---

## 4. UI Interaction & Event Modal Specs (3-Part)

1. **Trigger / Click Response**:
   - Triggered during turn processing when a fleet arrives at an unvisited star system or uncovers an artifact event.
   - Popup displays visual artwork of the discovered planet or ruin.
2. **Visual Transition**:
   - Camera centers on the target star on the Galaxy Map.
   - Discovery dialog box appears (`moo_start_of_turn_new_planet_reveal.png`).
3. **Return Path / Exit Method**:
   - Clicking `[OK]` or pressing `Enter` / `Esc` closes the notification modal.
   - Galaxy map selection remains focused on the newly scouted system.
