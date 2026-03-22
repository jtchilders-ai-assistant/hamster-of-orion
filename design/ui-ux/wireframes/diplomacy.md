# Diplomacy UI - Detailed Wireframe Specification

## Overview

The Diplomacy screen in Hamster of Orion serves as the primary interface for all inter-racial relations. Players can request audiences with other empires, negotiate treaties, propose trades, declare war, and manage espionage activities. This specification provides detailed ASCII wireframes matching MOO1 behavior while incorporating the pet-themed lore of Hamster of Orion.

**Reference**: Master of Orion (1993) Races/Diplomacy Screen  
**Hotkey**: F5  
**Target Resolution**: 1920×1080 (scalable)

---

## Screen Layout: Races Overview (Main Diplomacy Hub)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║                              ═══ GALACTIC DIPLOMACY ═══                                          ║
║                                                                                                   ║
║  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  KNOWN CIVILIZATIONS                                                                        │ ║
║  ├─────────────────────────────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                                             │ ║
║  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ ║
║  │  │          │  │          │  │          │  │          │  │          │  │██████████│        │ ║
║  │  │ [BUDGIES]│  │[GUINEA  ]│  │[CHAMELE-]│  │ [ANTS]   │  │ [MICE]   │  │[NOT YET ]│        │ ║
║  │  │          │  │[ PIGS  ]│  │[ ONS   ]│  │          │  │          │  │[CONTACT-]│        │ ║
║  │  │          │  │          │  │          │  │          │  │          │  │[  ED   ]│        │ ║
║  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │ ║
║  │     ALLY        NEUTRAL       HOSTILE        PEACE        TRADE        UNKNOWN             │ ║
║  │  ████████████  ████████████  ████████████  ████████████  ████████████                      │ ║
║  │  ▓▓▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓░░░░░░  ░░░░░░░░░░░░  ▓▓▓▓▓▓▓░░░░░  ▓▓▓▓▓▓▓▓░░░░                      │ ║
║  │   (+90)          (+15)         (-45)         (+35)         (+55)                           │ ║
║  │                                                                                             │ ║
║  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                                    │ ║
║  │  │          │  │          │  │          │  │          │    YOUR EMPIRE:                    │ ║
║  │  │ [FERRETS]│  │ [RATS]   │  │[RABBITS ]│  │[HERMIT  ]│    ┌──────────┐                    │ ║
║  │  │          │  │          │  │          │  │[ CRABS ]│    │          │                    │ ║
║  │  │          │  │          │  │          │  │          │    │[HAMSTERS]│                    │ ║
║  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │          │                    │ ║
║  │     WAR         TREATY       NON-AGG        PEACE         └──────────┘                    │ ║
║  │  ░░░░░░░░░░░░  ████████████  ████████████  ████████████   Colonies: 12                    │ ║
║  │  ░░░░░░░░░░░░  ▓▓▓▓▓▓▓▓▓░░░  ▓▓▓▓▓▓▓▓░░░░  ▓▓▓▓▓▓░░░░░░   Population: 450M                 │ ║
║  │   (-80)          (+60)         (+50)         (+25)        Fleet Power: 2,350              │ ║
║  │                                                            Tech Level: 18                  │ ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  DIPLOMATIC ACTIONS                                                                         │ ║
║  ├─────────────────────────────────────────────────────────────────────────────────────────────┤ ║
║  │  [REQUEST AUDIENCE]  [SPY NETWORK]  [SECURITY]  [DIPLOMATIC SUMMARY]  [GALACTIC COUNCIL]   │ ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Select a race to view details or request an audience.                       [CLOSE ×]          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Race Selected (Pre-Audience View)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║                              ═══ GALACTIC DIPLOMACY ═══                                          ║
║                                                                                                   ║
║  ┌──────────────────────────────────────┐  ┌────────────────────────────────────────────────────┐║
║  │  ╔════════════════════════════════╗  │  │  INTELLIGENCE REPORT: GUINEA PIGS                 │║
║  │  ║                                ║  │  ├────────────────────────────────────────────────────┤║
║  │  ║                                ║  │  │                                                    │║
║  │  ║      [GUINEA PIG PORTRAIT]     ║  │  │  Leader: Emperor Flufficus the Bold               │║
║  │  ║                                ║  │  │  Personality: Aggressive                          │║
║  │  ║        180×180 pixels          ║  │  │  Objective: Militarist                            │║
║  │  ║                                ║  │  │                                                    │║
║  │  ║                                ║  │  │  ─────────────────────────────────────────────    │║
║  │  ╚════════════════════════════════╝  │  │  EMPIRE STATUS                                    │║
║  │                                       │  │  ─────────────────────────────────────────────    │║
║  │  THE GUINEA PIG HEGEMONY             │  │  Colonies: 8     (Rank: 3rd)                      │║
║  │                                       │  │  Population: 320M (Rank: 2nd)                    │║
║  │  ─────────────────────────────────── │  │  Fleet Power: 1,850 (Rank: 3rd)                   │║
║  │  CURRENT RELATIONS                    │  │  Tech Level: 15 (Rank: 4th)                      │║
║  │  ─────────────────────────────────── │  │  Production: 280 BC/turn (Rank: 3rd)              │║
║  │                                       │  │                                                    │║
║  │  Status: NEUTRAL                      │  │  ─────────────────────────────────────────────    │║
║  │                                       │  │  TREATIES & AGREEMENTS                            │║
║  │  Relations: ████████░░░░░░░░ (+15)   │  │  ─────────────────────────────────────────────    │║
║  │             ←Hostile    Ally→        │  │  □ Non-Aggression Pact: None                      │║
║  │                                       │  │  □ Trade Agreement: None                          │║
║  │  At War: NO                           │  │  □ Alliance: None                                 │║
║  │  Trade Route: 0 BC/turn               │  │                                                    │║
║  │  Embassy: Not Established             │  │  Trade Routes: 0 BC/turn                          │║
║  │                                       │  │                                                    │║
║  └──────────────────────────────────────┘  └────────────────────────────────────────────────────┘║
║                                                                                                   ║
║  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                                             │ ║
║  │   [REQUEST AUDIENCE]        [VIEW HISTORY]        [SPY ON THIS RACE]        [BACK]         │ ║
║  │                                                                                             │ ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Emperor Flufficus last contacted you 5 turns ago.                           [CLOSE ×]          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Diplomatic Audience - Main Menu

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║      ╔═════════════════════════════════════════════════════════════════════════════════════╗     ║
║      ║                                                                                     ║     ║
║      ║    ┌────────────────────────┐                                                       ║     ║
║      ║    │                        │    "Greetings, representative of the Hamster          ║     ║
║      ║    │                        │     Consortium. I am Emperor Flufficus the Bold       ║     ║
║      ║    │   [GUINEA PIG LEADER   │     of the Guinea Pig Hegemony.                       ║     ║
║      ║    │       PORTRAIT]        │                                                       ║     ║
║      ║    │                        │     What brings you before our mighty presence?"      ║     ║
║      ║    │      200×200 px        │                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    └────────────────────────┘                                                       ║     ║
║      ║                                                                                     ║     ║
║      ║    ═══════════════════════════════════════════════════════════════════════════     ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌───────────────────────────────────────────────────────────────────────────┐   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [1] PROPOSE TREATY                                                      │   ║     ║
║      ║    │       Negotiate Non-Aggression Pact, Trade Agreement, or Alliance        │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [2] OFFER TRADE                                                         │   ║     ║
║      ║    │       Exchange technology or tribute in BC                                │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [3] THREATEN / DEMAND                                                   │   ║     ║
║      ║    │       Demand tribute, technology, or break treaties                       │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [4] DECLARE WAR                                                         │   ║     ║
║      ║    │       End diplomatic relations and begin hostilities                      │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [5] FORM ALLIANCE AGAINST...                                            │   ║     ║
║      ║    │       Propose joint war against a mutual enemy                            │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [6] GOOD BYE                                                            │   ║     ║
║      ║    │       End audience without further action                                 │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    └───────────────────────────────────────────────────────────────────────────┘   ║     ║
║      ║                                                                                     ║     ║
║      ╚═════════════════════════════════════════════════════════════════════════════════════╝     ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Press 1-6 or click an option to continue.                                                       ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Propose Treaty Submenu

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║      ╔═════════════════════════════════════════════════════════════════════════════════════╗     ║
║      ║                                                                                     ║     ║
║      ║    ┌────────────────────────┐                                                       ║     ║
║      ║    │                        │    "A treaty, you say? We are open to reasonable      ║     ║
║      ║    │                        │     proposals that respect our strength.              ║     ║
║      ║    │   [GUINEA PIG LEADER   │                                                       ║     ║
║      ║    │       PORTRAIT]        │     What do you wish to propose?"                     ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    │      200×200 px        │                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    └────────────────────────┘                                                       ║     ║
║      ║                                                                                     ║     ║
║      ║    ═══════════════════════════════════════════════════════════════════════════     ║     ║
║      ║                              PROPOSE TREATY                                         ║     ║
║      ║    ─────────────────────────────────────────────────────────────────────────────   ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌───────────────────────────────────────────────────────────────────────────┐   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [1] NON-AGGRESSION PACT                                    [AVAILABLE]  │   ║     ║
║      ║    │       Both parties agree not to attack each other's colonies or ships.   │   ║     ║
║      ║    │       Breaking this pact severely damages relations with all races.      │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [2] TRADE AGREEMENT                                        [AVAILABLE]  │   ║     ║
║      ║    │       Establish trade routes generating BC per turn for both parties.    │   ║     ║
║      ║    │       Income grows over time as routes mature (25 BC/turn starting).     │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [3] ALLIANCE                                               [REQUIRES:   │   ║     ║
║      ║    │       Full military alliance. Share maps, coordinate against enemies.    │   TRADE] │
║      ║    │       Ally must join your wars; you must join theirs.                    │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [4] PEACE TREATY                                           [NOT AT WAR] │   ║     ║
║      ║    │       End current hostilities and establish cease-fire.                  │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [ESC] BACK                                                              │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    └───────────────────────────────────────────────────────────────────────────┘   ║     ║
║      ║                                                                                     ║     ║
║      ╚═════════════════════════════════════════════════════════════════════════════════════╝     ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Prerequisites shown in brackets. Gray options are not currently available.                      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Trade Negotiation

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║      ╔═════════════════════════════════════════════════════════════════════════════════════╗     ║
║      ║                                                                                     ║     ║
║      ║    ┌────────────────────────┐                                                       ║     ║
║      ║    │   [GUINEA PIG LEADER   │    "Trade? Very well. Show us what you have to       ║     ║
║      ║    │       PORTRAIT]        │     offer, and we shall consider its worth."         ║     ║
║      ║    └────────────────────────┘                                                       ║     ║
║      ║                                                                                     ║     ║
║      ║    ═════════════════════════════════ TRADE OFFER ═══════════════════════════════   ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌─────────────────────────────────┐   ┌─────────────────────────────────────┐   ║     ║
║      ║    │  YOUR OFFER (HAMSTERS)          │   │  THEIR OFFER (GUINEA PIGS)          │   ║     ║
║      ║    ├─────────────────────────────────┤   ├─────────────────────────────────────┤   ║     ║
║      ║    │                                 │   │                                     │   ║     ║
║      ║    │  TECHNOLOGY:                    │   │  TECHNOLOGY:                        │   ║     ║
║      ║    │  □ Improved Lasers       (+)    │   │  □ Titanium Armor          (-)      │   ║     ║
║      ║    │  □ Enhanced ECM          (+)    │   │  □ Hyper-X Capacitors      (-)      │   ║     ║
║      ║    │  ■ Fusion Rifle          (✓)    │   │  □ Battle Pods             (-)      │   ║     ║
║      ║    │  □ Ion Cannon            (+)    │   │                                     │   ║     ║
║      ║    │                                 │   │  They do not have technology        │   ║     ║
║      ║    │  ─────────────────────────────  │   │  we lack.                           │   ║     ║
║      ║    │  BC TRIBUTE:                    │   │  ─────────────────────────────────  │   ║     ║
║      ║    │  [____0____] BC                 │   │  BC TRIBUTE:                        │   ║     ║
║      ║    │                                 │   │  Request: [___100___] BC            │   ║     ║
║      ║    │  Your Treasury: 1,250 BC        │   │                                     │   ║     ║
║      ║    │                                 │   │                                     │   ║     ║
║      ║    └─────────────────────────────────┘   └─────────────────────────────────────┘   ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌─────────────────────────────────────────────────────────────────────────────┐ ║     ║
║      ║    │  DEAL SUMMARY                                                               │ ║     ║
║      ║    ├─────────────────────────────────────────────────────────────────────────────┤ ║     ║
║      ║    │  You offer: Fusion Rifle                                                    │ ║     ║
║      ║    │  They offer: 100 BC                                                         │ ║     ║
║      ║    │                                                                             │ ║     ║
║      ║    │  Estimated Acceptance: LIKELY (Relations: +15, Balance: Fair)               │ ║     ║
║      ║    └─────────────────────────────────────────────────────────────────────────────┘ ║     ║
║      ║                                                                                     ║     ║
║      ║         [PROPOSE DEAL]         [CLEAR OFFER]         [CANCEL]                      ║     ║
║      ║                                                                                     ║     ║
║      ╚═════════════════════════════════════════════════════════════════════════════════════╝     ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Click technologies to add/remove. Enter BC amounts for tribute.                                 ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Threaten / Demand

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║      ╔═════════════════════════════════════════════════════════════════════════════════════╗     ║
║      ║                                                                                     ║     ║
║      ║    ┌────────────────────────┐                                                       ║     ║
║      ║    │                        │    "You dare to threaten us? Choose your words       ║     ║
║      ║    │                        │     carefully, little rodent..."                      ║     ║
║      ║    │   [GUINEA PIG LEADER   │                                                       ║     ║
║      ║    │       PORTRAIT]        │                                                       ║     ║
║      ║    │    (ANGRY EXPRESSION)  │                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    └────────────────────────┘                                                       ║     ║
║      ║                                                                                     ║     ║
║      ║    ═══════════════════════════════ DEMANDS ══════════════════════════════════════  ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌───────────────────────────────────────────────────────────────────────────┐   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [1] DEMAND TRIBUTE                                                      │   ║     ║
║      ║    │       Demand a payment of BC from their treasury.                         │   ║     ║
║      ║    │       Amount: [____500____] BC                                            │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [2] DEMAND TECHNOLOGY                                                   │   ║     ║
║      ║    │       Force them to hand over a technology.                               │   ║     ║
║      ║    │       Select: [▼ Choose Technology...              ]                      │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [3] DEMAND BREAK ALLIANCE                                               │   ║     ║
║      ║    │       Demand they end their alliance with another race.                   │   ║     ║
║      ║    │       Target: [▼ Mice                              ]                      │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [4] ISSUE ULTIMATUM                                                     │   ║     ║
║      ║    │       Demand surrender of a colony or face war.                           │   ║     ║
║      ║    │       Colony: [▼ Pigsville III                     ]                      │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   ─────────────────────────────────────────────────────────────────────   │   ║     ║
║      ║    │   ⚠ WARNING: Demands damage relations and may cause war!                  │   ║     ║
║      ║    │   Your Military Power: 2,350   Their Military Power: 1,850               │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [ESC] BACK                                                              │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    └───────────────────────────────────────────────────────────────────────────┘   ║     ║
║      ║                                                                                     ║     ║
║      ╚═════════════════════════════════════════════════════════════════════════════════════╝     ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Successful demands depend on military strength comparison.                                      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Declare War Confirmation

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║      ╔═════════════════════════════════════════════════════════════════════════════════════╗     ║
║      ║                                                                                     ║     ║
║      ║    ┌────────────────────────┐                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    │   [GUINEA PIG LEADER   │                                                       ║     ║
║      ║    │       PORTRAIT]        │                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    └────────────────────────┘                                                       ║     ║
║      ║                                                                                     ║     ║
║      ║    ╔═══════════════════════════════════════════════════════════════════════════╗   ║     ║
║      ║    ║                                                                           ║   ║     ║
║      ║    ║                    ⚔️  DECLARATION OF WAR  ⚔️                              ║   ║     ║
║      ║    ║                                                                           ║   ║     ║
║      ║    ║   You are about to declare war on the GUINEA PIG HEGEMONY.               ║   ║     ║
║      ║    ║                                                                           ║   ║     ║
║      ║    ║   CONSEQUENCES:                                                           ║   ║     ║
║      ║    ║   • All treaties with Guinea Pigs will be broken                         ║   ║     ║
║      ║    ║   • Trade income: -50 BC/turn will be lost                               ║   ║     ║
║      ║    ║   • Relations with ALL races will decrease (-10 to -30)                  ║   ║     ║
║      ║    ║   • Guinea Pig allies (MICE) may join the war against you                ║   ║     ║
║      ║    ║                                                                           ║   ║     ║
║      ║    ║   MILITARY COMPARISON:                                                    ║   ║     ║
║      ║    ║   Your Fleet Power:   ████████████████████░░░░  2,350                    ║   ║     ║
║      ║    ║   Their Fleet Power:  ███████████████░░░░░░░░░  1,850                    ║   ║     ║
║      ║    ║                                                                           ║   ║     ║
║      ║    ║              [DECLARE WAR]          [CANCEL]                              ║   ║     ║
║      ║    ║                                                                           ║   ║     ║
║      ║    ╚═══════════════════════════════════════════════════════════════════════════╝   ║     ║
║      ║                                                                                     ║     ║
║      ╚═════════════════════════════════════════════════════════════════════════════════════╝     ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  ⚠ This action cannot be undone!                                                                 ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: War Declared (Outcome)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║      ╔═════════════════════════════════════════════════════════════════════════════════════╗     ║
║      ║                                                                                     ║     ║
║      ║    ┌────────────────────────┐                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    │                        │     "So be it! The Guinea Pig Hegemony accepts       ║     ║
║      ║    │   [GUINEA PIG LEADER   │      your declaration of war!                        ║     ║
║      ║    │       PORTRAIT]        │                                                       ║     ║
║      ║    │                        │      Your worlds will BURN, hamster! Our legions     ║     ║
║      ║    │   (ENRAGED EXPRESSION) │      shall crush your pitiful empire beneath our     ║     ║
║      ║    │                        │      mighty paws!                                     ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    └────────────────────────┘      Prepare for annihilation!"                       ║     ║
║      ║                                                                                     ║     ║
║      ║    ═══════════════════════════════════════════════════════════════════════════     ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌───────────────────────────────────────────────────────────────────────────┐   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   ⚔️  WAR HAS BEEN DECLARED  ⚔️                                           │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   The HAMSTER CONSORTIUM is now at war with the GUINEA PIG HEGEMONY.     │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   Treaties Broken:                                                        │   ║     ║
║      ║    │     • Trade Agreement (-50 BC/turn)                                       │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   Relation Changes:                                                       │   ║     ║
║      ║    │     • Mice: -25 (Allied with Guinea Pigs)                                │   ║     ║
║      ║    │     • Budgies: -10 (Diplomatic penalty)                                  │   ║     ║
║      ║    │     • Rats: -10 (Diplomatic penalty)                                     │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │                           [CONTINUE]                                      │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    └───────────────────────────────────────────────────────────────────────────┘   ║     ║
║      ║                                                                                     ║     ║
║      ╚═════════════════════════════════════════════════════════════════════════════════════╝     ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  War status will persist until a peace treaty is negotiated.                                     ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Form Alliance Against (Joint War Proposal)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║      ╔═════════════════════════════════════════════════════════════════════════════════════╗     ║
║      ║                                                                                     ║     ║
║      ║    ┌────────────────────────┐                                                       ║     ║
║      ║    │                        │    "You wish to discuss... mutual enemies?           ║     ║
║      ║    │   [GUINEA PIG LEADER   │     Interesting. Against whom do you propose        ║     ║
║      ║    │       PORTRAIT]        │     we unite our forces?"                            ║     ║
║      ║    └────────────────────────┘                                                       ║     ║
║      ║                                                                                     ║     ║
║      ║    ═════════════════════════ PROPOSE JOINT WAR ════════════════════════════════   ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌───────────────────────────────────────────────────────────────────────────┐   ║     ║
║      ║    │  SELECT TARGET RACE:                                                      │   ║     ║
║      ║    ├───────────────────────────────────────────────────────────────────────────┤   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │  ┌────────┐  FERRETS                                                      │   ║     ║
║      ║    │  │Portrait│  Relations with Guinea Pigs: HOSTILE (-35)                   │   ║     ║
║      ║    │  └────────┘  Chance of Acceptance: HIGH                        [SELECT]  │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │  ┌────────┐  CHAMELEONS                                                   │   ║     ║
║      ║    │  │Portrait│  Relations with Guinea Pigs: NEUTRAL (+5)                    │   ║     ║
║      ║    │  └────────┘  Chance of Acceptance: LOW                         [SELECT]  │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │  ┌────────┐  ANTS                                                         │   ║     ║
║      ║    │  │Portrait│  Relations with Guinea Pigs: PEACE (+40)                     │   ║     ║
║      ║    │  └────────┘  Chance of Acceptance: VERY LOW                    [SELECT]  │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │  ─────────────────────────────────────────────────────────────────────    │   ║     ║
║      ║    │  ⚠ You cannot propose war against races allied with Guinea Pigs.         │   ║     ║
║      ║    │  ⚠ Mice (Allied) - Not available                                         │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [ESC] BACK                                                              │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    └───────────────────────────────────────────────────────────────────────────┘   ║     ║
║      ║                                                                                     ║     ║
║      ╚═════════════════════════════════════════════════════════════════════════════════════╝     ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Acceptance depends on target's relations with the ally you're negotiating with.                ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: AI Initiates Contact (Incoming Audience)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║      ╔═════════════════════════════════════════════════════════════════════════════════════╗     ║
║      ║                                                                                     ║     ║
║      ║                         ═══ INCOMING TRANSMISSION ═══                               ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌────────────────────────────────────────────────────────────────────────────┐  ║     ║
║      ║    │                                                                            │  ║     ║
║      ║    │    ┌──────────────────────┐                                                │  ║     ║
║      ║    │    │                      │                                                │  ║     ║
║      ║    │    │                      │   "Hamster leader, I am Supreme Chancellor     │  ║     ║
║      ║    │    │   [MICE LEADER       │    Squeaksworth of the Mice Collective.        │  ║     ║
║      ║    │    │     PORTRAIT]        │                                                │  ║     ║
║      ║    │    │                      │    We request an audience to discuss matters   │  ║     ║
║      ║    │    │     200×200 px       │    of mutual importance."                      │  ║     ║
║      ║    │    │                      │                                                │  ║     ║
║      ║    │    │                      │                                                │  ║     ║
║      ║    │    └──────────────────────┘                                                │  ║     ║
║      ║    │                                                                            │  ║     ║
║      ║    │    THE MICE COLLECTIVE                                                     │  ║     ║
║      ║    │    Current Relations: TRADE AGREEMENT (+55)                                │  ║     ║
║      ║    │                                                                            │  ║     ║
║      ║    └────────────────────────────────────────────────────────────────────────────┘  ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌───────────────────────────────────────────────────────────────────────────┐   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │              [ACCEPT AUDIENCE]          [REFUSE AUDIENCE]                 │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │              ⚠ Refusing may damage relations (-5 to -15)                  │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    └───────────────────────────────────────────────────────────────────────────┘   ║     ║
║      ║                                                                                     ║     ║
║      ╚═════════════════════════════════════════════════════════════════════════════════════╝     ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Press A to accept or R to refuse the audience.                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: AI Makes Proposal

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║      ╔═════════════════════════════════════════════════════════════════════════════════════╗     ║
║      ║                                                                                     ║     ║
║      ║    ┌────────────────────────┐                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    │                        │   "We of the Mice Collective propose a formal        ║     ║
║      ║    │   [MICE LEADER         │    ALLIANCE between our peoples.                     ║     ║
║      ║    │     PORTRAIT]          │                                                       ║     ║
║      ║    │                        │    Together, our combined technological might        ║     ║
║      ║    │                        │    shall be unstoppable. Our enemies will tremble   ║     ║
║      ║    │                        │    before our unified forces.                        ║     ║
║      ║    └────────────────────────┘                                                       ║     ║
║      ║                                                                                     ║     ║
║      ║    ═══════════════════════════════ PROPOSAL ═══════════════════════════════════   ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌───────────────────────────────────────────────────────────────────────────┐   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   The Mice Collective proposes: ALLIANCE                                  │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   Terms:                                                                  │   ║     ║
║      ║    │   • Full military cooperation                                            │   ║     ║
║      ║    │   • Shared star maps                                                      │   ║     ║
║      ║    │   • Mutual defense pact (you must join their wars)                        │   ║     ║
║      ║    │   • Shared research visibility                                            │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   Current Treaties: Trade Agreement (50 BC/turn)                          │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   ⚠ Alliance requires joining any wars they are involved in.              │   ║     ║
║      ║    │   ⚠ Currently at war with: Ferrets                                        │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │             [ACCEPT]        [REJECT]        [COUNTER-OFFER]               │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    └───────────────────────────────────────────────────────────────────────────┘   ║     ║
║      ║                                                                                     ║     ║
║      ╚═════════════════════════════════════════════════════════════════════════════════════╝     ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Accepting an alliance with a race at war will make you their enemy's enemy.                    ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: AI Declares War On You

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║      ╔═════════════════════════════════════════════════════════════════════════════════════╗     ║
║      ║                                                                                     ║     ║
║      ║                          ⚔️ ═══ WAR DECLARED ═══ ⚔️                                  ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌────────────────────────────────────────────────────────────────────────────┐  ║     ║
║      ║    │                                                                            │  ║     ║
║      ║    │    ┌──────────────────────┐                                                │  ║     ║
║      ║    │    │                      │                                                │  ║     ║
║      ║    │    │                      │   "Your treachery ends today, hamster scum!    │  ║     ║
║      ║    │    │   [FERRET LEADER     │                                                │  ║     ║
║      ║    │    │     PORTRAIT]        │    The Ferret Dominion declares TOTAL WAR      │  ║     ║
║      ║    │    │                      │    upon the Hamster Consortium!                │  ║     ║
║      ║    │    │   (AGGRESSIVE POSE)  │                                                │  ║     ║
║      ║    │    │                      │    Your colonies will fall. Your people will   │  ║     ║
║      ║    │    │                      │    serve us. There will be no mercy!"          │  ║     ║
║      ║    │    └──────────────────────┘                                                │  ║     ║
║      ║    │                                                                            │  ║     ║
║      ║    └────────────────────────────────────────────────────────────────────────────┘  ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌───────────────────────────────────────────────────────────────────────────┐   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   THE FERRET DOMINION HAS DECLARED WAR!                                   │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   Treaties Broken:                                                        │   ║     ║
║      ║    │     • Non-Aggression Pact                                                 │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   Ferret Military Power: ██████████████████████████  3,200               │   ║     ║
║      ║    │   Your Military Power:   ████████████████████░░░░░░  2,350               │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │                           [ACKNOWLEDGED]                                  │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    └───────────────────────────────────────────────────────────────────────────┘   ║     ║
║      ║                                                                                     ║     ║
║      ╚═════════════════════════════════════════════════════════════════════════════════════╝     ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  The Ferret Dominion has broken all treaties and declared war!                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Sue for Peace (During War)

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2650 - Turn 27  │  Treasury: 850 BC   │ [F2][F3][F4][F5][F6][F7] ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║      ╔═════════════════════════════════════════════════════════════════════════════════════╗     ║
║      ║                                                                                     ║     ║
║      ║    ┌────────────────────────┐                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    │                        │   "You come crawling for peace? After all the        ║     ║
║      ║    │   [FERRET LEADER       │    destruction you have wrought?                     ║     ║
║      ║    │     PORTRAIT]          │                                                       ║     ║
║      ║    │                        │    Perhaps... if the price is right."                ║     ║
║      ║    │   (SKEPTICAL LOOK)     │                                                       ║     ║
║      ║    │                        │                                                       ║     ║
║      ║    └────────────────────────┘                                                       ║     ║
║      ║                                                                                     ║     ║
║      ║    ═══════════════════════════════ PEACE TERMS ════════════════════════════════   ║     ║
║      ║                                                                                     ║     ║
║      ║    ┌───────────────────────────────────────────────────────────────────────────┐   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   War Duration: 5 turns                                                   │   ║     ║
║      ║    │   War Score: FERRETS WINNING                                              │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   ─────────────────────────────────────────────────────────────────────   │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [1] OFFER WHITE PEACE                                     [UNLIKELY]    │   ║     ║
║      ║    │       End hostilities with no reparations.                                │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [2] OFFER TRIBUTE FOR PEACE                                             │   ║     ║
║      ║    │       Pay BC to end the war.                                              │   ║     ║
║      ║    │       Suggested amount: 500 BC     [___500___] BC          [POSSIBLE]     │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [3] OFFER TECHNOLOGY FOR PEACE                                          │   ║     ║
║      ║    │       Trade a technology to end the war.                                  │   ║     ║
║      ║    │       [▼ Select Technology...              ]               [LIKELY]       │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    │   [ESC] BACK (Continue War)                                               │   ║     ║
║      ║    │                                                                           │   ║     ║
║      ║    └───────────────────────────────────────────────────────────────────────────┘   ║     ║
║      ║                                                                                     ║     ║
║      ╚═════════════════════════════════════════════════════════════════════════════════════╝     ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Peace acceptance depends on war progress and relative military strength.                        ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Spy Network Management

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║                              ═══ ESPIONAGE OPERATIONS ═══                                        ║
║                                                                                                   ║
║  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  SPY ALLOCATION                          Annual Spy Budget: 125 BC (10% of income)          │ ║
║  ├─────────────────────────────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                                             │ ║
║  │  Empire-Wide Spy Spending:                                                                  │ ║
║  │  ├─────────────────────────────────────────────────────────────────────────────────────┤   │ ║
║  │  │ 0%                          [████████░░░░░░░░░░░░] 40%                         100% │   │ ║
║  │  ├─────────────────────────────────────────────────────────────────────────────────────┤   │ ║
║  │                                                                                             │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────     │ ║
║  │  ALLOCATION BY TARGET RACE                                                                  │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────     │ ║
║  │                                                                                             │ ║
║  │  ┌────────┐ GUINEA PIGS      [████████████████░░░░] 80%        Active Spies: 3             │ ║
║  │  │Portrait│ Infiltration: MODERATE (45%)                       Mission: ESPIONAGE          │ ║
║  │  └────────┘ Security Level: MEDIUM                             [▼ Change Mission]          │ ║
║  │                                                                                             │ ║
║  │  ┌────────┐ FERRETS          [████████░░░░░░░░░░░░] 40%        Active Spies: 2             │ ║
║  │  │Portrait│ Infiltration: LOW (25%)                            Mission: SABOTAGE           │ ║
║  │  └────────┘ Security Level: HIGH                               [▼ Change Mission]          │ ║
║  │                                                                                             │ ║
║  │  ┌────────┐ MICE             [░░░░░░░░░░░░░░░░░░░░] 0%         Active Spies: 0             │ ║
║  │  │Portrait│ Infiltration: NONE                                 Mission: NONE               │ ║
║  │  └────────┘ Security Level: LOW                                [▼ Change Mission]          │ ║
║  │                                                                                             │ ║
║  │  ┌────────┐ ANTS             [████░░░░░░░░░░░░░░░░] 20%        Active Spies: 1             │ ║
║  │  │Portrait│ Infiltration: LOW (20%)                            Mission: HIDE               │ ║
║  │  └────────┘ Security Level: MEDIUM                             [▼ Change Mission]          │ ║
║  │                                                                                             │ ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
║  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  SPY MISSIONS: ESPIONAGE = Steal tech │ SABOTAGE = Destroy bases/factories │ HIDE = Build  │ ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Drag sliders to adjust spy allocation. Total cannot exceed 100%.                [BACK]          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Counter-Espionage / Security

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║                              ═══ INTERNAL SECURITY ═══                                           ║
║                                                                                                   ║
║  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  SECURITY BUDGET                        Annual Budget: 100 BC (8% of income)                │ ║
║  ├─────────────────────────────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                                             │ ║
║  │  Empire-Wide Security Spending:                                                             │ ║
║  │  ├─────────────────────────────────────────────────────────────────────────────────────┤   │ ║
║  │  │ 0%                          [████████████░░░░░░░░] 60%                         100% │   │ ║
║  │  ├─────────────────────────────────────────────────────────────────────────────────────┤   │ ║
║  │                                                                                             │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────     │ ║
║  │  SECURITY STATUS                                                                            │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────     │ ║
║  │                                                                                             │ ║
║  │  Overall Security Level: MODERATE                                                           │ ║
║  │                                                                                             │ ║
║  │  Defense Against:                                                                           │ ║
║  │    Espionage:   ████████████░░░░░░░░  60%  (Will catch ~60% of spy attempts)               │ ║
║  │    Sabotage:    ██████████████░░░░░░  70%  (Will catch ~70% of sabotage attempts)          │ ║
║  │                                                                                             │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────     │ ║
║  │  RECENT SECURITY EVENTS                                                                     │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────     │ ║
║  │                                                                                             │ ║
║  │  Turn 21: ✓ Captured Ferret spy attempting to steal Fusion Beam technology.               │ ║
║  │  Turn 19: ✗ Guinea Pig spies destroyed 2 missile bases on Hamsterdam II.                  │ ║
║  │  Turn 15: ✓ Prevented Mouse sabotage attempt on factory complex.                          │ ║
║  │  Turn 12: ✗ Unknown agents stole Enhanced ECM Jammer technology!                          │ ║
║  │                                                                                             │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────     │ ║
║  │  FRAME ENEMY (Special Action)                                                               │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────     │ ║
║  │  Make an espionage action appear to be from another race.                                  │ ║
║  │  [▼ Select Race to Frame ]  Cost: 150 BC                           [EXECUTE FRAME]         │ ║
║  │                                                                                             │ ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Higher security spending reduces successful enemy spy operations.               [BACK]          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen Layout: Diplomatic History

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║ [≡]  HAMSTER OF ORION   │  Year 2645 - Turn 22  │  Treasury: 1,250 BC  │ [F2][F3][F4][F5][F6][F7]║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                   ║
║                       ═══ DIPLOMATIC HISTORY: GUINEA PIG HEGEMONY ═══                            ║
║                                                                                                   ║
║  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  TIMELINE OF EVENTS                                                                         │ ║
║  ├─────────────────────────────────────────────────────────────────────────────────────────────┤ ║
║  │                                                                                             │ ║
║  │  Turn 22  │ Current                                                                        │ ║
║  │           │ Relations: NEUTRAL (+15)                                                       │ ║
║  │           │                                                                                │ ║
║  │  Turn 20  │ ▼ We refused their demand for tribute (-10)                                   │ ║
║  │           │                                                                                │ ║
║  │  Turn 18  │ ▲ Trade agreement matured (+5 relations, +5 BC/turn income)                   │ ║
║  │           │                                                                                │ ║
║  │  Turn 15  │ ═ Signed Trade Agreement (25 BC/turn)                                         │ ║
║  │           │                                                                                │ ║
║  │  Turn 12  │ ▲ They accepted our gift of 100 BC (+8)                                       │ ║
║  │           │                                                                                │ ║
║  │  Turn 10  │ ═ First contact established                                                   │ ║
║  │           │                                                                                │ ║
║  │  ─────────┴────────────────────────────────────────────────────────────────────────────── │ ║
║  │                                                                                             │ ║
║  │  RELATION BREAKDOWN                                                                         │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────     │ ║
║  │                                                                                             │ ║
║  │  Base Relations (Racial):        +5  (Guinea Pigs are neutral toward Hamsters)            │ ║
║  │  Trade Income Bonus:            +15  (50 BC/turn trade)                                    │ ║
║  │  Gift Appreciation:              +8  (100 BC gift on Turn 12)                              │ ║
║  │  Demand Refusal Penalty:        -10  (Refused tribute Turn 20)                             │ ║
║  │  Personality Modifier:           -3  (Aggressive personality)                              │ ║
║  │  ─────────────────────────────────────────────────────────────────────────────────────     │ ║
║  │  TOTAL:                         +15                                                        │ ║
║  │                                                                                             │ ║
║  └─────────────────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════╣
║  Scroll to view earlier events.                                                  [BACK]          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Diplomatic State Definitions

### Treaty Types

| Treaty | Prerequisites | Effects | Breaking Penalty |
|--------|--------------|---------|------------------|
| **Non-Aggression Pact** | Relations ≥ 0 | Cannot attack each other; +5 relations | -40 relations with target, -20 with all others |
| **Trade Agreement** | Relations ≥ +10 | Generates BC/turn (starts 25, grows to 100) | -20 relations, lose trade income |
| **Alliance** | Trade Agreement, Relations ≥ +40 | Shared maps, mutual defense, +20 relations | -60 relations, -30 with all others |
| **Peace Treaty** | At war | Ends hostilities, sets relations to -20 | N/A |

### Diplomatic States

| State | Relations Range | Color | Behavior |
|-------|----------------|-------|----------|
| **Allied** | ≥ +80 | Green | Full cooperation, will not attack |
| **Friendly** | +40 to +79 | Light Green | Open to treaties, unlikely to attack |
| **Neutral** | -20 to +39 | Yellow | Cautious, will negotiate |
| **Unfriendly** | -50 to -21 | Orange | May refuse audience, preparing for war |
| **Hostile** | -80 to -51 | Red | Likely to attack, difficult negotiations |
| **At War** | N/A | Dark Red | Active hostilities |

### Relation Modifiers

| Action | Effect |
|--------|--------|
| Gift of BC | +1 per 10 BC (max +20) |
| Gift of technology | +5 to +15 based on tech value |
| Trade agreement active | +1 per 5 BC/turn income |
| Alliance active | +20 permanent |
| Spy caught | -15 to -30 |
| Sabotage successful | -20 to -40 |
| War declaration | -100 (permanent war modifier) |
| Planet captured | -10 per million population killed |
| Broken treaty | Variable (see treaty table) |
| Refused demand | -10 to -20 |
| Accepted demand | +0 (no bonus for compliance) |
| Common enemy at war | +10 to +25 |
| Allied with your enemy | -20 to -40 |

---

## Interactive Elements Specification

### 1. Race Portrait Interactions

| Action | Result |
|--------|--------|
| Click on race portrait | Select race, show detailed info |
| Double-click portrait | Request audience (if available) |
| Hover over portrait | Show tooltip with quick stats |
| Right-click portrait | Context menu (Audience, Spy, History) |

### 2. Relations Bar

```
Relations: ████████░░░░░░░░ (+15)
           ←Hostile    Ally→
```

| Zone | Color | Range |
|------|-------|-------|
| Deep Red | Hostile | -100 to -51 |
| Orange | Unfriendly | -50 to -21 |
| Yellow | Neutral | -20 to +39 |
| Light Green | Friendly | +40 to +79 |
| Green | Allied | +80 to +100 |

### 3. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F5 | Open/close Diplomacy screen |
| 1-9 | Select race by position |
| A | Request Audience with selected race |
| S | Open Spy Network |
| C | Open Security (Counter-espionage) |
| H | View diplomatic history |
| Esc | Back/Cancel/Close |
| Enter | Confirm selection |

### 4. Audience Menu Navigation

| Key | Action |
|-----|--------|
| 1 | Propose Treaty |
| 2 | Offer Trade |
| 3 | Threaten/Demand |
| 4 | Declare War |
| 5 | Form Alliance Against |
| 6/Esc | Good Bye / Exit |

---

## Diplomatic AI Behavior

### Personality Types (Per MOO1)

| Personality | Behavior |
|-------------|----------|
| **Pacifist** | Avoids war, accepts treaties easily, never declares war first |
| **Honorable** | Keeps treaties, fair negotiations, retaliates proportionally |
| **Erratic** | Unpredictable, may break treaties randomly, variable demands |
| **Aggressive** | Quick to anger, hard to satisfy, often declares war |
| **Ruthless** | Will break treaties when advantageous, maximizes gains |
| **Xenophobic** | Dislikes all races, hard to befriend, prefers isolation |

### Objectives (Per MOO1)

| Objective | Focus |
|-----------|-------|
| **Militarist** | Fleet building, conquest |
| **Technologist** | Research priority, tech trades |
| **Ecologist** | Population growth, terraforming |
| **Industrialist** | Production, factory building |
| **Expansionist** | Colonization, territory |
| **Diplomat** | Alliances, trade, council votes |

---

## Data Schemas

### Race Diplomatic State

```json
{
  "raceId": "guinea_pigs",
  "raceName": "Guinea Pig Hegemony",
  "leaderName": "Emperor Flufficus the Bold",
  "leaderPersonality": "aggressive",
  "leaderObjective": "militarist",
  "portraitId": "guinea_pig_leader_01",
  
  "relations": {
    "current": 15,
    "modifiers": [
      {"type": "racial_base", "value": 5, "description": "Base racial relations"},
      {"type": "trade_income", "value": 15, "description": "50 BC/turn trade"},
      {"type": "gift", "value": 8, "turns_remaining": 10, "description": "100 BC gift"},
      {"type": "demand_refused", "value": -10, "description": "Refused tribute Turn 20"},
      {"type": "personality", "value": -3, "description": "Aggressive personality"}
    ]
  },
  
  "treaties": {
    "nonAggression": false,
    "tradeAgreement": {
      "active": true,
      "signedTurn": 15,
      "incomePerTurn": 50,
      "maturityLevel": 2
    },
    "alliance": false
  },
  
  "warState": {
    "atWar": false,
    "warDeclaredTurn": null,
    "warDeclaredBy": null
  },
  
  "espionage": {
    "spyAllocation": 0.35,
    "activeSpies": 3,
    "mission": "espionage",
    "infiltrationLevel": 0.45
  },
  
  "lastContact": 17,
  "firstContactTurn": 10
}
```

### Diplomatic Event

```json
{
  "eventId": "evt_001",
  "turn": 20,
  "type": "demand_refused",
  "initiator": "guinea_pigs",
  "target": "hamsters",
  "details": {
    "demandType": "tribute",
    "demandAmount": 200,
    "relationChange": -10
  },
  "description": "We refused their demand for 200 BC tribute."
}
```

### Treaty Definition

```json
{
  "treaties": [
    {
      "id": "non_aggression_pact",
      "name": "Non-Aggression Pact",
      "description": "Both parties agree not to attack each other's colonies or ships.",
      "prerequisites": {
        "minRelations": 0,
        "requiredTreaties": []
      },
      "effects": {
        "relationBonus": 5,
        "cannotAttack": true
      },
      "breakingPenalty": {
        "targetRelations": -40,
        "otherRelations": -20
      }
    },
    {
      "id": "trade_agreement",
      "name": "Trade Agreement",
      "description": "Establish trade routes generating BC per turn for both parties.",
      "prerequisites": {
        "minRelations": 10,
        "requiredTreaties": []
      },
      "effects": {
        "baseIncome": 25,
        "maxIncome": 100,
        "maturityTurns": 50,
        "relationBonusPerIncome": 0.3
      },
      "breakingPenalty": {
        "targetRelations": -20,
        "loseIncome": true
      }
    },
    {
      "id": "alliance",
      "name": "Alliance",
      "description": "Full military alliance with shared maps and mutual defense.",
      "prerequisites": {
        "minRelations": 40,
        "requiredTreaties": ["trade_agreement"]
      },
      "effects": {
        "relationBonus": 20,
        "shareMaps": true,
        "mutualDefense": true,
        "mustJoinWars": true
      },
      "breakingPenalty": {
        "targetRelations": -60,
        "otherRelations": -30
      }
    },
    {
      "id": "peace_treaty",
      "name": "Peace Treaty",
      "description": "End hostilities and establish cease-fire.",
      "prerequisites": {
        "atWar": true
      },
      "effects": {
        "endWar": true,
        "setRelations": -20
      },
      "breakingPenalty": {
        "immediate": true,
        "targetRelations": -40
      }
    }
  ]
}
```

### Spy Mission Types

```json
{
  "spyMissions": [
    {
      "id": "hide",
      "name": "Hide",
      "description": "Spies remain hidden, building infiltration without action.",
      "riskLevel": "low",
      "buildInfiltration": true,
      "actionPerformed": false
    },
    {
      "id": "espionage",
      "name": "Espionage",
      "description": "Attempt to steal enemy technologies.",
      "riskLevel": "medium",
      "successOutcome": "steal_technology",
      "failureOutcome": "spy_caught",
      "relationPenaltyOnCatch": -25
    },
    {
      "id": "sabotage",
      "name": "Sabotage",
      "description": "Destroy enemy missile bases or factories.",
      "riskLevel": "high",
      "successOutcome": "destroy_infrastructure",
      "failureOutcome": "spy_caught",
      "relationPenaltyOnCatch": -35,
      "targetsPerSuccess": {
        "missileBases": 1,
        "factories": 5
      }
    },
    {
      "id": "incite_rebellion",
      "name": "Incite Rebellion",
      "description": "Attempt to cause colony rebellion.",
      "riskLevel": "very_high",
      "successOutcome": "colony_rebels",
      "failureOutcome": "spy_caught",
      "relationPenaltyOnCatch": -50
    }
  ]
}
```

---

## Edge Cases

### 1. No Contact Yet
- Race portrait shows silhouette with "NOT CONTACTED" label
- No audience possible
- No spy operations possible
- First contact occurs when fleets meet or via long-range scanner

### 2. Audience Refused
- AI may refuse audience if relations too low (< -50)
- Certain personalities (Xenophobic) refuse more often
- During war, may refuse all audiences except peace negotiations

### 3. Broken Treaty Consequences
- Breaking Non-Aggression Pact: All races lose trust (-20 with everyone)
- Breaking Alliance: Major diplomatic penalty, may trigger immediate war

### 4. Race Eliminated
- Remove from diplomacy screen
- Cancel all treaties
- Reassign spy allocations

### 5. Final War (Galactic Council Reject)
- If player rejects Council election result, enters permanent war with all races
- No diplomacy possible
- Screen shows "FINAL WAR - NO DIPLOMACY"

### 6. Maximum Treaties
- Player can have treaties with all known races simultaneously
- No limit on number of alliances

### 7. Trade Agreement Growth
- Trade income grows 1 BC/turn every 2 turns
- Maximum 100 BC/turn after ~50 turns
- Breaking and re-signing resets to 25 BC/turn

### 8. Spy Caught - Diplomatic Incident
- Can result in immediate war declaration (based on personality)
- Option to apologize and pay reparations
- Erratic leaders may overlook it randomly

---

## Accessibility Features

### Screen Reader Support
- All portraits have alt-text descriptions
- Relations bar announces numeric value
- Treaty status announced on focus

### Color Blind Mode
- Relations use patterns in addition to colors
- Treaty icons use distinct shapes
- War/Peace states use high-contrast indicators

### Keyboard Navigation
- Full keyboard navigation through all menus
- Number keys for quick selection
- Tab cycles through interactive elements

---

## Animation & Feedback

### Relation Changes
- Bar animates smoothly when relations change
- Positive changes: Green flash
- Negative changes: Red flash
- Accompanies notification sound

### Treaty Signing
- Brief celebration animation
- Sound effect for treaty accepted
- Diplomatic document visual

### War Declaration
- Screen shake effect
- Warning klaxon sound
- Red border flash

### Spy Results
- Success: Document steal animation
- Caught: Alert animation with spy silhouette
- Sabotage: Explosion effect indicator

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-22 | Initial wireframe specification |

---

## References

- Master of Orion (1993) Races Menu
- Master of Orion Official Strategy Guide, Chapter 11: "Politics and Personalities"
- Master of Orion Official Strategy Guide, Chapter 12: "Spies"
- StrategyWiki MOO1 Diplomacy Page
- Hamster of Orion LORE.md (pet-themed naming conventions)
