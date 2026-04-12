# Command Menu: RACES (F5) - MOO1-Accurate Wireframe

## Overview

The RACES command button opens the **Race Relations / Diplomacy** screen. This is a **full-screen modal** showing all known alien civilizations and your diplomatic status with each.

**Reference**: Master of Orion (1993) Race/Diplomacy Screen  
**Hotkey**: F5  
**Exit**: OK button or ESC

> **Screenshot Note**: No in-game RACES screen screenshot is currently available in `moo_screens/`. The reference screenshots below (`moo_new_game_race_select.png`, `moo_new_game_banner_select.png`) are from the **new game setup flow** — they show race portraits and banner/color selection, which share visual assets with the in-game RACES screen but represent a different context. The in-game wireframe below is reconstructed from MOO1 documentation and memory.

---

## Visual Style

- **Background**: Dark brown/maroon stone-like texture (consistent with all MOO1 full-screen modals)
- **Race portrait**: Large pixel-art portrait, left side of screen — same art assets used in the new-game race selection
- **Text**: Gold/yellow pixel font for headers; lighter color for body text
- **Buttons**: 3D raised style

---

## Screen Layout (In-Game Diplomacy View)

The RACES screen shows one alien empire at a time, with navigation to cycle through all known races.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                              RACE RELATIONS                                     │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  ┌──────────────────────────────┐  ┌────────────────────────────────────────┐  │
│  │                              │  │                                        │  │
│  │                              │  │  PSILON EMPIRE                         │  │
│  │    [ RACE PORTRAIT ]         │  │  ════════════════════════════════════  │  │
│  │    (Large pixel art,         │  │                                        │  │
│  │     ~40% screen width)       │  │  Relation:   NEUTRAL                   │  │
│  │                              │  │  Aggression: Low                       │  │
│  │                              │  │  Trade:      None                      │  │
│  │                              │  │                                        │  │
│  │                              │  │  ──────────────────────────────────    │  │
│  │                              │  │                                        │  │
│  │                              │  │  "A brilliant but reclusive species.   │  │
│  │                              │  │   They have not yet provoked us."      │  │
│  │                              │  │                                        │  │
│  │                              │  │  ──────────────────────────────────    │  │
│  │                              │  │                                        │  │
│  │                              │  │  [ SEND EMBASSY ]  [ DECLARE WAR ]     │  │
│  │                              │  │  [ SIGN TREATY  ]                      │  │
│  │                              │  │                                        │  │
│  └──────────────────────────────┘  └────────────────────────────────────────┘  │
│                                                                                 │
│  ◄ PREV                                                              NEXT ►     │
│                                                                    [ OK ]       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Sections

### Left Panel — Race Portrait
- Large pixel-art depiction of the alien species
- Same artwork used in new-game race selection (see reference screenshots)
- Approximately 40% of the screen width
- Portrait changes when cycling between races via PREV/NEXT

### Right Panel — Diplomatic Status

#### Empire Header
- **Empire name** (e.g., "PSILON EMPIRE") in large gold text
- Underline separator

#### Diplomacy Stats

| Field | Possible Values |
|-------|----------------|
| **Relation** | WAR, NEUTRAL, PEACE, ALLIED |
| **Aggression** | Low, Medium, High |
| **Trade** | None, Limited, Extensive |

#### Relationship Notes
- Brief narrative text summarizing current political standing
- Updates based on recent events (wars declared, treaties signed, territory encroachment)
- Examples:
  - *"A brilliant but reclusive species. They have not yet provoked us."*
  - *"They are highly aggressive and have expanded into our territory."*
  - *"Longstanding allies. Trade agreements are in effect."*

#### Available Actions (Context-Sensitive)

Actions available depend on the current **Relation** status:

| Relation | Available Actions |
|----------|------------------|
| **Neutral / Peace** | `SEND EMBASSY`, `SIGN TREATY`, `DECLARE WAR` |
| **War** | `OFFER PEACE`, `DEMAND SURRENDER` |
| **Allied** | `TERMINATE ALLIANCE`, `PROPOSE TRADE AGREEMENT` |

Buttons are 3D raised; unavailable actions are greyed out or hidden.

### Navigation
- **◄ PREV / NEXT ►**: Cycle through all known alien civilizations
- Only civilizations your empire has made **first contact** with are shown
- Unknown/uncontacted races are not listed

---

## Interactions

| Action | Result |
|--------|--------|
| Click **◄ PREV** | Cycle to previous known race |
| Click **NEXT ►** | Cycle to next known race |
| Click **SEND EMBASSY** | Opens confirmation; establishes diplomatic channel |
| Click **SIGN TREATY** | Opens treaty negotiation sub-screen |
| Click **DECLARE WAR** | Opens confirmation dialog; changes Relation to WAR |
| Click **OFFER PEACE** | Opens negotiation; may change Relation to NEUTRAL |
| Click **DEMAND SURRENDER** | Opens demand dialog (only when at war and dominant) |
| Click **OK** | Close screen, return to Galaxy Map |
| Press **ESC** | Close screen, return to Galaxy Map |

---

## Design Constraints

- **Only known races shown**: The RACES screen is empty at game start (no first contact yet). Races appear as they are discovered.
- **One race at a time**: Unlike a list view, MOO1 shows one empire per screen with PREV/NEXT navigation.
- **No bottom command bar**: Hidden while this screen is open.
- **Action buttons are context-sensitive**: Not all actions appear for every diplomatic state.

---

## New Game: Race Selection (Setup Flow)

The **new game race selection** is a separate screen accessed from the main menu — it is **not** the in-game RACES command. However, it shares portrait artwork and race data with the in-game screen.

### Race Selection Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌──────────────────────────────┐  ┌────────────────────────────────────────┐  │
│  │                              │  │  SELECT YOUR RACE                      │  │
│  │  [ RACE PORTRAIT ]           │  │  ════════════════════════════════════  │  │
│  │  (large, selected race)      │  │                                        │  │
│  │                              │  │  ○ Humans       ○ Bulrathi             │  │
│  │                              │  │  ○ Mrrshan      ○ Alkari               │  │
│  │                              │  │  ○ Silicoid     ○ Meklar               │  │
│  │                              │  │  ○ Sakkra       ○ Psilon               │  │
│  │                              │  │  ○ Klackon      ○ Darlok               │  │
│  │                              │  │  ○ Gnolam       ○ Elerian              │  │
│  │                              │  │                                        │  │
│  │                              │  │  ──────────────────────────────────    │  │
│  │                              │  │                                        │  │
│  │                              │  │  SPECIAL ABILITIES:                    │  │
│  │                              │  │  • Telepathic                          │  │
│  │                              │  │  • Creative                            │  │
│  │                              │  │  • Omniscient                          │  │
│  │                              │  │                                        │  │
│  └──────────────────────────────┘  └────────────────────────────────────────┘  │
│                                                                                 │
│                                                                    [ OK ]       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Races Available (MOO1)

| Race | Notable Traits |
|------|---------------|
| Humans | Diplomacy bonus |
| Bulrathi | Combat bonus, large |
| Alkari | Piloting bonus, evasion |
| Meklar | Industry bonus |
| Psilon | Research bonus, creative |
| Mrrshan | Combat bonus, fast |
| Sakkra | Growth bonus |
| Klackon | Industry bonus, unified |
| Silicoid | Colonizes any planet type |
| Darlok | Espionage bonus |
| Elerian | Telepathic |
| Gnolam | Trade/money bonus |

### Banner / Color Selection

After choosing a race, the player selects an empire **banner color**. This determines the color of the empire's flag on the galaxy map (Colonies filter mode).

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌──────────────────────────────┐  ┌────────────────────────────────────────┐  │
│  │  [ RACE PORTRAIT ]           │  │  SELECT YOUR BANNER COLOR              │  │
│  │                              │  │  ════════════════════════════════════  │  │
│  │                              │  │                                        │  │
│  │                              │  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐            │  │
│  │                              │  │  │  │ │  │ │  │ │  │ │  │            │  │
│  │                              │  │  └──┘ └──┘ └──┘ └──┘ └──┘            │  │
│  │                              │  │  Blue  Red  Grn  Yel  Org             │  │
│  │                              │  │                                        │  │
│  │                              │  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐            │  │
│  │                              │  │  │  │ │  │ │  │ │  │ │  │            │  │
│  │                              │  │  └──┘ └──┘ └──┘ └──┘ └──┘            │  │
│  │                              │  │  Pur  Teal Brwn Wht  Gray             │  │
│  │                              │  │                                        │  │
│  └──────────────────────────────┘  └────────────────────────────────────────┘  │
│                                                                                 │
│                                                                    [ OK ]       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- Selected color swatch is highlighted/bordered
- Color choice affects flag display on the galaxy map (MAP → COLONIES filter)
- Each race has a **default banner color** but the player can change it

---

## Reference Screenshots

| File | Description |
|------|-------------|
| [`../../../moo_screens/moo_new_game_race_select.png`](../../../moo_screens/moo_new_game_race_select.png) | New-game race selection screen — large portrait on left, race list and special abilities on right. Shares portrait artwork with in-game RACES screen. |
| [`../../../moo_screens/moo_new_game_banner_select.png`](../../../moo_screens/moo_new_game_banner_select.png) | New-game banner/color selection screen — color swatches grid with race portrait. Determines empire flag color on the galaxy map. |
