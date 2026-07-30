# Localization & i18n Framework Specification

## Overview

This document specifies the internationalization (i18n) framework, string key schema, variable interpolation rules, pluralization logic, and UI text layout budgets for **Hamster of Orion**.

**Reference Materials:**
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)
- [UI Style Guide](file:///Users/jchilders/mywork/hamster-of-orion/design/ui-ux/style-guide.md)

---

## 1. String Key Hierarchy Schema

All strings are stored in structured JSON dictionaries under `assets/locales/{lang}.json`. Keys follow strict dot-notation categories:

```json
{
  "ui": {
    "command_bar": {
      "game": "GAME",
      "design": "DESIGN",
      "fleet": "FLEET",
      "map": "MAP",
      "races": "RACES",
      "planets": "PLANETS",
      "tech": "TECH",
      "next_turn": "NEXT TURN"
    },
    "galaxy_map": {
      "system_pop": "Population: {pop}M / {max_pop}M",
      "system_factories": "Factories: {count} / {max_count}",
      "reloc_target": "Relocate Ships to: {star_name}"
    }
  },
  "species": {
    "hamsters": {
      "name": "Hamsters",
      "leader_title": "Grand Nibbler",
      "greeting_peace": "Greetings, traveler! The Hamster Empire welcomes you in peace."
    }
  },
  "tech": {
    "weapons": {
      "laser_v1": {
        "name": "Laser",
        "description": "Fires a concentrated beam of coherent light. Deals {damage_min}-{damage_max} damage."
      }
    }
  }
}
```

---

## 2. Variable Interpolation & Pluralization Rules

The translation engine uses ICU-style syntax for variables, numbers, and pluralization:

```javascript
// Example Pluralization Syntax
"colony_ships_count": "{count, plural, =0 {No Colony Ships} =1 {1 Colony Ship} other {# Colony Ships}}"

// Example Gender / Title Syntax
"diplomatic_audience": "Emperor {name} of the {species} Empire demands an audience."
```

---

## 3. UI Container Expansion & Text Reflow Budgets

Different languages require different string lengths. The UI engine enforces explicit reflow guidelines:

| Target Language | Text Expansion Factor | UI Container Strategy |
| :--- | :--- | :--- |
| **English (Source)** | 1.0x (Baseline) | Standard button width |
| **German (de)** | +30% to +40% expansion | Flexbox wrap / text auto-shrink (`font-size: 13px -> 11px`) |
| **French (fr)** | +20% to +30% expansion | Multi-line button text support |
| **Japanese / Chinese (ja/zh)** | -20% contraction (higher line density) | Line-height adjustment (`1.4 -> 1.6`) |

### Truncation Fallback Rules
- If text exceeds container width after auto-shrink: Apply CSS `text-overflow: ellipsis; overflow: hidden; white-space: nowrap;`.
- Full untruncated string MUST be accessible via element hover tooltip.
