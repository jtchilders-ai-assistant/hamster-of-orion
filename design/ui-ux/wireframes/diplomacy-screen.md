# Wireframe: Diplomacy / Races Screen (F5)

**Status:** STUB — Needs full wireframe development  
**Created:** 2026-04-12  
**Button label:** RACES  
**Canonical screen name:** Races Screen (F5) — see terminology note below  
**Reference:** `main-screens.md` §7, `screen-inventory.md` §5

**MOO1 Reference Screenshots:**
- `../moo_screens/moo_races.png` — Main races list screen
- `../moo_screens/moo_races_status.png` — Race status/relationship view
- `../moo_screens/moo_races_report.png` — Intelligence report panel

> ⚠️ **This is a stub wireframe.** The layout structure and subflows are defined here based on `main-screens.md` §7 ASCII layout and the MOO1 reference. The `command_menu/command_menu_races.md` file covers the command-bar button only, not this full screen. Full ASCII wireframes with exact sizing and all interaction states need to be developed.

---

## Terminology Note

The command-bar button is labeled **RACES**. This screen is also referred to as "Diplomacy Screen" in several documents. The canonical name per the REVIEW_GAPS.md resolution (§3.3) is:

> **Races Screen (F5)** — with a note that "Diplomacy" is an acceptable synonym for the sub-flow (audience/negotiation).

---

## Layout Overview

This is a **full navigation screen** with the bottom command bar present (not a modal overlay — see REVIEW_GAPS.md §8.5 and §6.3 resolution).

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────────────────────────────────┐ │
│  │  RACES LIST  │  │           RACE DETAIL PANEL              │ │
│  │              │  │                                          │ │
│  │ > Guinea Pig │  │  [Portrait]  GUINEA PIG EMPIRE           │ │
│  │   Bunnoid    │  │             Leader: Grand Nibbler        │ │
│  │   Hamsteroid │  │             Homeworld: Pelletia          │ │
│  │   Gerbilian  │  │             Government: Feudal           │ │
│  │   Ratfolk    │  │             Population: 2.4B             │ │
│  │   ...        │  │                                          │ │
│  │              │  │  Diplomatic Status: AT PEACE             │ │
│  │              │  │  Treaties: Trade (+15 BC/yr)             │ │
│  │              │  │  Military Power: Comparable              │ │
│  │              │  │  Tech Level: Slightly Ahead              │ │
│  │              │  │                                          │ │
│  │              │  │  [ REQUEST AUDIENCE ]  [ VIEW INTEL ]   │ │
│  │              │  │                                          │ │
│  └──────────────┘  └──────────────────────────────────────────┘ │
│  ─────────────────────────────────────────────────────────────── │
│  [ GAME ] [ DESIGN ] [ FLEET ] [ MAP ] [ RACES ] [ PLANETS ] [ TECH ] [ NEXT TURN ] │
└─────────────────────────────────────────────────────────────────┘
```

**TODO — full wireframe needs:**
- Exact column widths for race list vs detail panel
- All diplomatic status variants (at war, trade embargo, non-aggression pact, etc.)
- Treaty badge icons
- Relative power indicator design (bar, label, or icon?)

---

## Sub-Flow: Diplomatic Audience

Triggered by **REQUEST AUDIENCE** or **double-click race portrait**.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DIPLOMATIC AUDIENCE                          │
│  ┌─────────────┐                                                │
│  │  AI Leader  │  "Your ambitions threaten us, Hamsteroid..."   │
│  │  Portrait   │                                                │
│  └─────────────┘  [ Leader Name ] of [ Empire Name ]           │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  OPTIONS:                                                       │
│  [ TRADE TECH ]    [ PROPOSE TREATY ]    [ DEMAND TRIBUTE ]     │
│  [ OFFER AID ]     [ DECLARE WAR ]       [ CLOSE AUDIENCE ]     │
│                                                                 │
│  Current offers on table:                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  (empty — no active offers)                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**TODO — full wireframe needs:**
- AI leader portrait dimensions
- Dialogue text area (scrollable?)
- Offer/counter-offer display format
- Response timer (if any — MOO1 had no timer)

---

## Sub-Flow: Tech Trade

Triggered by **TRADE TECH** within diplomatic audience.

**Key elements:**
- Left panel: Our available techs (can offer)
- Right panel: Their available techs (can request)
- Center: Trade terms / exchange rate
- Accept/Reject buttons

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECHNOLOGY TRADE                           │
│                                                                 │
│  ┌──────────────────┐  OFFER ⇄ REQUEST  ┌──────────────────┐  │
│  │  OUR TECHS       │                   │  THEIR TECHS     │  │
│  │                  │                   │                  │  │
│  │  [x] Fusion Bomb │        ↔          │  [ ] Neutronium  │  │
│  │  [ ] Scatter Gun │                   │  [ ] Pulsar      │  │
│  │  ...             │                   │  ...             │  │
│  └──────────────────┘                   └──────────────────┘  │
│                                                                 │
│  Offer:    Fusion Bomb                                          │
│  Receive:  (select from their list)                             │
│                                                                 │
│  [ PROPOSE DEAL ]                        [ CANCEL ]            │
└─────────────────────────────────────────────────────────────────┘
```

**TODO — full wireframe needs:**
- Multi-tech trades (multiple selections)
- "Acceptable" indicator — does AI preview their response?
- BC payment in lieu of tech (MOO1 supported cash payments)

---

## Sub-Flow: Treaty Negotiation

Types of treaties (from `main-screens.md` §7):
- Non-Aggression Pact
- Trade Treaty (+BC/turn)
- Research Treaty (share some research progress)
- Military Alliance (mutual defense)

```
┌─────────────────────────────────────────────────────────────────┐
│                    TREATY NEGOTIATION                           │
│                                                                 │
│  Propose:  [ ] Non-Aggression Pact                             │
│            [ ] Trade Treaty         Bonus: +___ BC/turn        │
│            [ ] Research Agreement   Bonus: +___ RP/turn        │
│            [ ] Military Alliance                                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Response: "(They will likely accept this offer)"              │
│                                                                 │
│  [ PROPOSE ]                             [ CANCEL ]            │
└─────────────────────────────────────────────────────────────────┘
```

**TODO — full wireframe needs:**
- AI attitude indicator (friendly/neutral/hostile)
- Prediction accuracy (hint system vs none)

---

## Sub-Flow: AI-Initiated Audience (Popup)

When an AI race contacts the player during turn resolution (see REVIEW_GAPS.md §5.9).

This appears as a **modal overlay on the Galaxy Map** during turn resolution, not as a navigation to the Races Screen.

```
┌────────────────────────────────────────┐
│  ┌──────────┐  INCOMING MESSAGE        │
│  │ Portrait │                          │
│  └──────────┘  Grand Nibbler of the   │
│                Guinea Pig Empire:      │
│                                        │
│  "We propose a non-aggression pact.   │
│   Will you accept?"                   │
│                                        │
│  [ ACCEPT ]  [ DECLINE ]  [ COUNTER ] │
└────────────────────────────────────────┘
```

**TODO — full wireframe needs:**
- Exact modal dimensions
- Whether player can defer ("I'll consider it") or must decide immediately
- Whether this interrupts turn processing or queues until player returns to galaxy map

---

## Navigation

- Accessed via **RACES button (F5)** from command bar, or `F5` keyboard shortcut
- Bottom command bar present — player can navigate to other screens (F1–F6) directly
- **ESC** or clicking a different F-key command returns to Galaxy Map
- Diplomatic audience sub-flow is a modal over the Races Screen (not a separate navigation level)

---

## Open Design Questions

1. Are races hidden until first contact (fog of war for race discovery)?
2. Can you initiate diplomacy with a race you've never met?
3. Is there a "message log" showing diplomatic history?
4. How is the relative military/tech power assessed — exact values or qualitative labels?

---

*Stub created 2026-04-12 by Wesley (subagent). Needs full wireframe development.*
