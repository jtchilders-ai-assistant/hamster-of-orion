# Hamster of Orion - Flavor Text & Tooltip Lore Specification

## Overview

This document specifies technology field fluff, planetary environmental quotes, diplomatic insult/compliment snippets per species, and UI tooltip flavor text across **Hamster of Orion**.

**References:**
- [Master Lore Document](file:///Users/jchilders/mywork/hamster-of-orion/design/LORE.md)
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)

---

## 1. Technology Category Fluff Quotes

### 1.1 Computers
> *"The mind of a machine does not hesitate, nor does it blink when calculating targeting vectors through a solar flare."*

### 1.2 Construction
> *"Give me a thousand automated riveters and ten million tons of titanium, and I shall construct a fortress in the void."*

### 1.3 Force Fields
> *"Energy bent at precise angles can stop a nuclear warhead as easily as a glass window stops a autumn breeze."*

### 1.4 Planetology
> *"To mold a desolate rock into a garden world is the highest calling of mortal science."*

### 1.5 Propulsion
> *"Distance is merely an equation waiting for a more powerful warp engine."*

### 1.6 Weapons
> *"Peace is an admirable virtue, but a heavy plasma cannon ensures others respect it."*

---

## 2. Diplomatic Snippets per Species

### 2.1 Hamsters
- **Friendly Greeting**: *"Welcome, honored friend! Our granaries and trade ports are open to your merchants."*
- **Hostile Warning**: *"Push us any further and our pilot squadrons will show you how hamsters handle wolves!"*

### 2.2 Ants
- **Friendly Greeting**: *"The Hive acknowledges your peaceful intent. Trade protocols initiated."*
- **Hostile Warning**: *"You are an impediment to the Hive's growth. You will be cleared like weeds."*

### 2.3 Budgies
- **Friendly Greeting**: *"Ah, greetings seeker of truth! Let us exchange knowledge for mutual advancement."*
- **Hostile Warning**: *"Your primitive threats are mathematically insignificant to our defense matrix."*

---

## 3. UI Tooltip Lore & Interaction Specs

Every tooltip in the UI (e.g. hovering over colony sliders, ship components, tech items) displays:
- Functional gameplay stat (e.g., `Eco Slider: Cleans 1.5 Waste / BC`).
- Short italicized flavor string (e.g., *"Automated scrubbers filter toxins from soil and atmosphere"*).
- Tooltips fade in after a 300ms hover delay and disappear immediately on mouse leave (`Return Path`).
