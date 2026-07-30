# Wireframe: Diplomacy / Races Screen (F5)

## Overview

The Races Screen (F5) is a full navigation screen providing empire intelligence, diplomatic relationship statuses, and audience entry points for negotiations.

**Status:** COMPLETE Specification  
**Button Label:** RACES  
**Canonical Name:** Races Screen (F5)  
**Hotkey:** F5  

**Reference Materials:**
- [MOO1 Manual (PC)](file:///Users/jchilders/mywork/hamster-of-orion/reference/Master_of_Orion_-_Manual_-_PC.pdf)
- [StrategyWiki MOO1 Reference Text](file:///Users/jchilders/mywork/hamster-of-orion/reference/strategywiki-moo1.txt)

**Reference Screenshots:**
- ![Main Races List Screen](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_races.png)
- ![Race Status View](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_races_status.png)
- ![Intelligence Report Panel](file:///Users/jchilders/mywork/hamster-of-orion/design/moo_screens/moo_races_report.png)

---

## Screen Layout Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌──────────────┐  ┌──────────────────────────────────────────────────────────┐ │
│  │  KNOWN RACES │  │                    RACE DETAIL PANEL                     │ │
│  │  ─────────── │  │  ──────────────────────────────────────────────────────  │ │
│  │              │  │                                                          │ │
│  │ ► Guinea Pig │  │  ┌─────────────┐  GUINEA PIG EMPIRE                      │ │
│  │   Rabbits    │  │  │ [PORTRAIT]  │  Emperor: Grand Nibbler                  │ │
│  │   Hamsters   │  │  └─────────────┘  Personality: Honorable Diplomat        │ │
│  │   Ferrets    │  │                   Homeworld: Pelletia                    │ │
│  │   Rats       │  │                                                          │ │
│  │              │  │  Status: PEACE  |  Treaty: Non-Aggression + Trade       │ │
│  │              │  │  Military Power: Strong  |  Tech Level: Advanced         │ │
│  │              │  │                                                          │ │
│  │              │  │  [ REQUEST AUDIENCE ]  [ INTEL REPORT ]  [ TECH TRADE ]  │ │
│  └──────────────┘  └──────────────────────────────────────────────────────────┘ │
│  ─────────────────────────────────────────────────────────────────────────────── │
│  [ GAME ] [ DESIGN ] [ FLEET ] [ MAP ] [ RACES ] [ PLANETS ] [ TECH ] [ NEXT TURN ] │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4-Column Interaction Element Table

| UI Element | (a) Trigger Response | (b) Visual Transition | (c) Return Path / Exit Method |
| :--- | :--- | :--- | :--- |
| **Race List Item** | Highlights selected species row | Details panel slides horizontally with selected leader data | Remains selected until another race or command button is clicked |
| **`[REQUEST AUDIENCE]` Button** | Initiates diplomatic contact sequence | Fades out race panel and opens Audience Modal overlay with leader dialogue | Click `[Goodbye]`, press `Esc`, or finish audience to return to Races Screen |
| **`[INTEL REPORT]` Button** | Opens espionage intelligence summary modal | Displays spy allocation, stolen techs, and military breakdown overlay (`moo_races_report.png`) | Click `[Close]` or press `Esc` to close modal and restore detail panel |
| **`[TECH TRADE]` Button** | Opens technology exchange negotiation window | Displays side-by-side offer/request tech trees | Click `[Cancel]` or press `Esc` to return to detail panel |
| **Command Bar Buttons (`F1-F7`)** | Switches active main screen | Screen transitions to target view (e.g. Galaxy Map, Ship Design) | Direct navigation to selected screen |
| **Keyboard `Esc` Key** | Cancels active sub-modal or returns to Galaxy Map | Fades out Races Screen | Returns directly to Galaxy Map (`moo_galaxy_home.png`) |
