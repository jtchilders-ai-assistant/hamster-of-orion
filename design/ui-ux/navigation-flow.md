# Hamster of Orion - UI Navigation Flow

## Overview

This document defines the complete screen navigation flow for Hamster of Orion, based on MOO1's interface structure. The game uses a **hub-and-spoke model** where the Galaxy Map is the central hub, with all other screens accessible as modal overlays or sub-screens.

---

## 1. High-Level Game Flow

```mermaid
flowchart TD
    subgraph PreGame["Pre-Game"]
        MainMenu[Main Menu]
        NewGame[New Game Setup]
        GalaxySetup[Galaxy Configuration]
        RaceSelect[Race Selection]
        LoadGame[Load Game]
    end

    subgraph CoreGame["Core Gameplay"]
        GalaxyMap[Galaxy Map<br/>─────────<br/>CENTRAL HUB]
    end

    subgraph EndGame["End Game"]
        Victory[Victory Screen]
        Defeat[Defeat Screen]
        Score[Final Score]
        Credits[Credits]
    end

    MainMenu -->|"New Game"| NewGame
    MainMenu -->|"Load Game"| LoadGame
    MainMenu -->|"Exit"| Exit[Exit Game]
    
    NewGame --> GalaxySetup
    GalaxySetup --> RaceSelect
    RaceSelect -->|"Start"| GalaxyMap
    LoadGame -->|"Select Save"| GalaxyMap
    
    GalaxyMap -->|"Council Vote Won"| Victory
    GalaxyMap -->|"Military Conquest"| Victory
    GalaxyMap -->|"Eliminated"| Defeat
    GalaxyMap -->|"Refuse Council"| GalaxyMap
    
    Victory --> Score
    Defeat --> Score
    Score --> Credits
    Credits --> MainMenu
```

### Reference Screenshots — Pre-Game Setup Flow

| Step | Screenshot |
|------|------------|
| New Game menu | ![New Game Menu](../moo_screens/moo_new_game_menu.png) |
| Race selection | ![Race Selection](../moo_screens/moo_new_game_race_select.png) |
| Banner / color selection | ![Banner Selection](../moo_screens/moo_new_game_banner_select.png) |
| Emperor name entry | ![Emperor Name](../moo_screens/moo_new_game_emporer_name.png) |
| Homeworld name entry | ![Homeworld Name](../moo_screens/moo_new_game_home_world_name.png) |

---

## 2. Galaxy Map - Central Hub

The Galaxy Map is the primary gameplay screen. All other screens are accessed from here via the **bottom command bar** or by clicking on game elements.

```mermaid
flowchart TD
    subgraph GalaxyHub["Galaxy Map (Always Visible Behind Modals)"]
        GM[Galaxy Map]
    end

    subgraph CommandBar["Bottom Command Bar"]
        GAME[GAME]
        DESIGN[DESIGN]
        FLEET[FLEET]
        MAP[MAP]
        RACES[RACES]
        PLANETS[PLANETS]
        TECH[TECH]
        TURN[NEXT TURN]
    end

    subgraph Modals["Full-Screen Modal Overlays"]
        GameMenu[Game Menu<br/>Save/Load/Options/Quit]
        ShipDesign[Ship Design Screen]
        FleetScreen[Fleet Screen]
        MapView[Galaxy Overview]
        Diplomacy[Races Screen (F5)]
        PlanetList[Planets List]
        Research[Technology Screen]
    end

    GM --- CommandBar
    
    GAME -->|"Opens"| GameMenu
    DESIGN -->|"Opens"| ShipDesign
    FLEET -->|"Opens"| FleetScreen
    MAP -->|"Opens"| MapView
    RACES -->|"Opens"| Diplomacy
    PLANETS -->|"Opens"| PlanetList
    TECH -->|"Opens"| Research
    TURN -->|"Process"| TurnResolution[Turn Resolution]
    
    GameMenu -->|"Close/ESC"| GM
    ShipDesign -->|"Close/ESC"| GM
    FleetScreen -->|"Close/ESC"| GM
    MapView -->|"Close/ESC"| GM
    Diplomacy -->|"Close/ESC"| GM
    PlanetList -->|"Close/ESC"| GM
    Research -->|"Close/ESC"| GM
    TurnResolution -->|"Complete"| GM
```

### Reference Screenshots — Galaxy Map Hub

Galaxy Map with home colony selected (starting state):

![Galaxy Map - Home Colony Selected](../moo_screens/moo_galaxy_home.png)

| Screen | Screenshot |
|--------|------------|
| Ship Design | ![Ship Design](../moo_screens/moo_design.png) |
| Fleet Screen | ![Fleet Screen](../moo_screens/moo_fleet_screen.png) |
| Planets List | ![Planets List](../moo_screens/moo_planets.png) |
| Tech / Research | ![Tech Screen](../moo_screens/moo_tech.png) |

---

## 3. Galaxy Map - Selection States

The right panel of the Galaxy Map changes based on what's selected. In MOO1, something is ALWAYS selected (starts with homeworld).

```mermaid
stateDiagram-v2
    [*] --> ColonySelected: Game Start (Homeworld)
    
    ColonySelected --> ColonySelected: Click own colony
    ColonySelected --> UnexploredSelected: Click unexplored star
    ColonySelected --> EnemySelected: Click enemy colony
    ColonySelected --> FleetSelected: Click own fleet
    ColonySelected --> EmptySelected: Click explored empty
    
    UnexploredSelected --> ColonySelected: Click own colony
    UnexploredSelected --> FleetSelected: Click own fleet
    
    EnemySelected --> ColonySelected: Click own colony
    EnemySelected --> FleetSelected: Click own fleet
    
    FleetSelected --> ColonySelected: Click own colony
    FleetSelected --> FleetSelected: Click another fleet
    FleetSelected --> DestinationMode: Click destination star
    
    DestinationMode --> FleetSelected: Confirm/Cancel
    
    EmptySelected --> ColonySelected: Click own colony
    EmptySelected --> FleetSelected: Click own fleet

    note right of ColonySelected
        Right Panel Shows:
        - Colony name & stats
        - Population/Factories
        - 5 Production Sliders
        - Current build progress
    end note

    note right of FleetSelected
        Right Panel Shows:
        - System name
        - Fleet composition
        - Ship counts by design
        - Deploy/Rally options
    end note

    note right of UnexploredSelected
        Right Panel Shows:
        - "Unexplored"
        - Star type (color)
        - Distance from nearest colony
        - Range indicator
    end note
```

### Reference Screenshots — Selection States

| Selection State | Screenshot |
|----------------|------------|
| Home colony selected | ![Home Colony](../moo_screens/moo_galaxy_home.png) |
| Unexplored star selected | ![Unexplored Star](../moo_screens/moo_galaxy_unexplored.png) |
| Fleet / ship selected | ![Ship Selected](../moo_screens/moo_galaxy_shipselect.png) |
| After ship destination selected | ![Destination Selected](../moo_screens/moo_galaxy_aftershipdestinationselected.png) |
| Ship in transit (moving) | ![Ship Moving](../moo_screens/moo_galaxy_movingshipselected.png) |
| Fleet deployment panel | ![Fleet Deployment](../moo_screens/moo_galaxy_fleet_deployment.png) |
| Uncolonized planet selected | ![Uncolonized Planet](../moo_screens/moo_galaxy_select_uncolonized_planet.png) |
| Destination out of range | ![Out of Range](../moo_screens/moo_galaxy_ship_select_destination_out_of_range.png) |

### Colony States

| Colony State | Screenshot |
|-------------|------------|
| New colony | ![New Colony](../moo_screens/moo_galaxy_planet_new.png) |
| Post-terraformed | ![Post-Terraform](../moo_screens/moo_galaxy_planet_post_tform.png) |
| Colony at population cap | ![Colony Full](../moo_screens/moo_galaxy_planet_is_full.png) |
| Max factories reached | ![Max Factories](../moo_screens/moo_galaxy_max_factories.png) |

---

## 4. Modal Screen Details

### 4.1 Ship Design Screen Flow

```mermaid
flowchart TD
    subgraph ShipDesignScreen["Ship Design Screen (Modal)"]
        DesignList[Design List<br/>6 slots]
        NewDesign[New Design Mode]
        EditDesign[Edit Existing]
        
        HullSelect[Select Hull Size<br/>Small/Medium/Large/Huge]
        WeaponSelect[Weapon Slots x4]
        SpecialSelect[Special Slots x3]
        NameShip[Name Design]
        
        SaveDesign[Save Design]
        DeleteDesign[Delete Design]
        ScrapShips[Scrap Existing Ships]
    end

    Entry[From Galaxy Map<br/>DESIGN button] --> DesignList
    
    DesignList -->|"Empty Slot"| NewDesign
    DesignList -->|"Existing Design"| EditDesign
    DesignList -->|"Close"| Exit[Return to Galaxy Map]
    
    NewDesign --> HullSelect
    EditDesign --> HullSelect
    
    HullSelect --> WeaponSelect
    WeaponSelect --> SpecialSelect
    SpecialSelect --> NameShip
    NameShip --> SaveDesign
    
    SaveDesign --> DesignList
    DeleteDesign --> ScrapShips
    ScrapShips --> DesignList
```

### Reference Screenshots — Ship Design

| View | Screenshot |
|------|------------|
| Design screen overview | ![Ship Design Overview](../moo_screens/moo_design.png) |
| Ship design detail | ![Ship Design Detail](../moo_screens/moo_ship_design.png) |

### 4.2 Technology Screen Flow

```mermaid
flowchart TD
    subgraph ResearchScreen["Technology Screen (Modal)"]
        Overview[6 Tech Fields Overview]
        FieldDetail[Field Detail View]
        TechSelect[Technology Selection<br/>2-3 choices per field]
        Confirm[Confirm Selection]
    end

    Entry[From Galaxy Map<br/>TECH button] --> Overview
    
    Overview -->|"Click Field"| FieldDetail
    FieldDetail -->|"Back"| Overview
    FieldDetail -->|"Select Tech"| TechSelect
    TechSelect -->|"Choose"| Confirm
    Confirm --> Overview
    
    Overview -->|"Close"| Exit[Return to Galaxy Map]
```

### Reference Screenshots — Research

| View | Screenshot |
|------|------------|
| Tech / Research screen | ![Tech Screen](../moo_screens/moo_tech.png) |
| New tech available | ![New Tech](../moo_screens/moo_new_tech.png) |
| Select new research (start of turn) | ![Select Research](../moo_screens/moo_start_of_turn_select_new_research.png) |

### 4.3 Races Screen (F5) Flow

```mermaid
flowchart TD
    subgraph DiplomacyScreen["Races Screen / Diplomacy (F5)"]
        RaceList[Known Races List]
        RaceDetail[Race Detail View]
        Audience[Audience with Leader]
        
        TradeMenu[Trade Options]
        TreatyMenu[Treaty Options]
        DeclareWar[Declare War]
        
        MessageReceive[Incoming Message]
    end

    Entry[From Galaxy Map<br/>RACES button] --> RaceList
    
    RaceList -->|"Select Race"| RaceDetail
    RaceDetail -->|"Request Audience"| Audience
    RaceDetail -->|"Back"| RaceList
    
    Audience --> TradeMenu
    Audience --> TreatyMenu
    Audience --> DeclareWar
    
    TradeMenu -->|"Complete"| Audience
    TreatyMenu -->|"Complete"| Audience
    DeclareWar -->|"Confirm"| RaceDetail
    
    RaceList -->|"Close"| Exit[Return to Galaxy Map]
    
    MessageReceive -.->|"During Turn"| Audience
```

### 4.4 Fleet Screen Flow

```mermaid
flowchart TD
    subgraph FleetScreen["Fleet Screen (Modal)"]
        FleetList[All Fleets by System]
        SystemDetail[System Fleet Detail]
        ShipDetail[Individual Ship Info]
        
        DeployPanel[Fleet Deployment Panel]
        RallyPoint[Set Rally Point]
        ScrapFleet[Scrap Ships]
    end

    Entry[From Galaxy Map<br/>FLEET button] --> FleetList
    
    FleetList -->|"Select System"| SystemDetail
    SystemDetail -->|"Select Ship Type"| ShipDetail
    SystemDetail -->|"Deploy"| DeployPanel
    SystemDetail -->|"Rally"| RallyPoint
    SystemDetail -->|"Scrap"| ScrapFleet
    
    DeployPanel -->|"Confirm"| SystemDetail
    RallyPoint -->|"Set"| SystemDetail
    ScrapFleet -->|"Confirm"| SystemDetail
    
    ShipDetail -->|"Back"| SystemDetail
    SystemDetail -->|"Back"| FleetList
    FleetList -->|"Close"| Exit[Return to Galaxy Map]
```

### Reference Screenshots — Fleet Screen

![Fleet Screen](../moo_screens/moo_fleet_screen.png)

Fleet deployment panel (accessed from Galaxy Map fleet selection):

![Fleet Deployment Panel](../moo_screens/moo_galaxy_fleet_deployment.png)

### 4.5 MAP Overlay Modes

The MAP button cycles through galaxy overview modes showing different data layers:

| Overlay Mode | Screenshot |
|-------------|------------|
| Colonies overlay | ![Colonies Map](../moo_screens/moo_map_colonies_selected.png) |
| Environments overlay | ![Environments Map](../moo_screens/moo_map_environments_selected.png) |
| Minerals overlay | ![Minerals Map](../moo_screens/moo_map_minerals_selected.png) |

---

## 5. Turn Resolution Flow

When "NEXT TURN" is clicked, a sequence of events may require player input:

```mermaid
flowchart TD
    NextTurn[Click NEXT TURN] --> Processing[Turn Processing]
    
    Processing --> CheckCombat{Space Combat?}
    CheckCombat -->|"Yes"| CombatScreen[Tactical Combat Screen]
    CheckCombat -->|"No"| CheckGround
    
    CombatScreen -->|"Auto-Resolve"| CombatResult[Combat Results]
    CombatScreen -->|"Manual"| TacticalBattle[Tactical Battle]
    TacticalBattle --> CombatResult
    CombatResult --> CheckGround
    
    CheckGround{Ground Combat?} -->|"Yes"| GroundCombat[Ground Combat Screen]
    CheckGround -->|"No"| CheckCouncil
    GroundCombat --> CheckCouncil
    
    CheckCouncil{Council Vote?} -->|"Yes"| Council[High Council Screen]
    CheckCouncil -->|"No"| CheckEvents
    Council -->|"Vote"| VoteResult{Won Election?}
    VoteResult -->|"Yes + Accept"| Victory[Victory Screen]
    VoteResult -->|"Yes + Refuse"| FinalWar[Final War Declared]
    VoteResult -->|"No"| CheckEvents
    FinalWar --> CheckEvents
    
    CheckEvents{Random Events?} -->|"Yes"| EventPopup[Event Notification]
    CheckEvents -->|"No"| CheckTech
    EventPopup --> CheckTech
    
    CheckTech{Tech Completed?} -->|"Yes"| TechPopup[Technology Breakthrough]
    CheckTech -->|"No"| CheckDiplo
    TechPopup -->|"Select Next"| TechSelect[Tech Selection]
    TechSelect --> CheckDiplo
    
    CheckDiplo{Diplomatic Messages?} -->|"Yes"| DiploMessage[Diplomacy Popup]
    CheckDiplo -->|"No"| TurnComplete
    DiploMessage --> TurnComplete
    
    TurnComplete[Turn Complete] --> GalaxyMap[Return to Galaxy Map]
```

### Reference Screenshots — Turn Resolution Events

| Event | Screenshot |
|-------|------------|
| New tech breakthrough | ![New Tech](../moo_screens/moo_new_tech.png) |
| Select new research direction | ![Select Research](../moo_screens/moo_start_of_turn_select_new_research.png) |
| New planet revealed | ![Planet Reveal](../moo_screens/moo_start_of_turn_new_planet_reveal.png) |
| New ships built notification | ![New Ships](../moo_screens/moo_start_of_turn_new_ships.png) |
| Colony ship arrives at candidate planet | ![Colony Ship Arrival](../moo_screens/moo_colony_ship_arrives_at_potential_planet.png) |
| New colony established | ![New Colony](../moo_screens/moo_new_colony_screen.png) |

---

## 6. Combat Screen Flow

```mermaid
flowchart TD
    subgraph CombatEntry["Combat Initiated"]
        Detected[Enemy Fleet Detected]
        PreBattle[Pre-Battle Screen<br/>Force comparison]
    end

    subgraph CombatOptions["Combat Options"]
        AutoResolve[Auto-Resolve]
        Manual[Manual Tactical]
        Retreat[Attempt Retreat]
    end

    subgraph TacticalCombat["Tactical Combat (if Manual)"]
        BattleGrid[Hex Battle Grid]
        SelectShip[Select Ship Stack]
        MoveShip[Move Ship]
        FireWeapons[Fire Weapons]
        SpecialAbility[Use Special]
        EndShipTurn[End Ship Turn]
        NextRound[Next Combat Round]
    end

    subgraph CombatEnd["Combat Resolution"]
        Victory[Victory]
        Defeat[Defeat]
        Draw[Retreat/Stalemate]
        Salvage[Salvage Screen]
    end

    Detected --> PreBattle
    PreBattle --> AutoResolve
    PreBattle --> Manual
    PreBattle --> Retreat
    
    AutoResolve --> Victory
    AutoResolve --> Defeat
    
    Retreat -->|"Success"| Draw
    Retreat -->|"Fail"| Manual
    
    Manual --> BattleGrid
    BattleGrid --> SelectShip
    SelectShip --> MoveShip
    MoveShip --> FireWeapons
    FireWeapons --> SpecialAbility
    SpecialAbility --> EndShipTurn
    EndShipTurn -->|"More Ships"| SelectShip
    EndShipTurn -->|"Round Complete"| NextRound
    NextRound -->|"Battle Continues"| SelectShip
    NextRound -->|"Enemy Destroyed"| Victory
    NextRound -->|"Player Destroyed"| Defeat
    
    Victory --> Salvage
    Defeat --> ReturnMap[Return to Galaxy Map]
    Draw --> ReturnMap
    Salvage --> ReturnMap
```

---

## 7. Screen Hierarchy Summary

```
MAIN MENU
├── New Game
│   ├── Galaxy Setup
│   └── Race Selection → GALAXY MAP
├── Load Game → GALAXY MAP
├── Options
└── Exit

GALAXY MAP (Central Hub)
├── [Click Colony] → Right Panel: Colony View + Sliders
├── [Click Fleet] → Right Panel: Fleet View + Deploy
├── [Click Star] → Right Panel: Star Info
│
├── GAME → Game Menu Modal
│   ├── Save Game
│   ├── Load Game
│   ├── Options
│   └── Quit to Menu
│
├── DESIGN → Ship Design Modal
│   ├── View 6 Design Slots
│   ├── Create New Design
│   ├── Edit Design
│   └── Delete Design
│
├── FLEET → Fleet Screen Modal
│   ├── All Fleets List
│   ├── System Details
│   └── Deployment Panel
│
├── MAP → Galaxy Overview Modal
│   └── Zoomed out view
│
├── RACES → Diplomacy Modal
│   ├── Race List
│   ├── Race Details
│   └── Audience/Negotiations
│
├── PLANETS → Planets List Modal
│   ├── All Colonies
│   └── Colony Quick-Edit
│
├── TECH → Research Modal
│   ├── 6 Field Overview
│   └── Tech Selection
│
└── NEXT TURN → Turn Resolution
    ├── Combat (if any)
    ├── Council (if triggered)
    ├── Events (random)
    ├── Tech Breakthroughs
    └── Diplomatic Messages

VICTORY/DEFEAT
├── Victory Screen
├── Defeat Screen
├── Final Score
└── Return to Main Menu
```

---

## 8. Key Navigation Principles (MOO1-Faithful)

1. **Galaxy Map is always "home"** - All modals return to it
2. **Something is always selected** - No empty/null selection state
3. **Bottom command bar only on Galaxy Map** - Modals have their own close buttons
4. **ESC closes current modal** - Returns to Galaxy Map
5. **Right-click = context menu** (optional enhancement over MOO1)
6. **Turn resolution is sequential** - Events processed in order with player input as needed
7. **No nested modals** - One modal at a time over Galaxy Map

---

## 9. Keyboard Shortcuts

> **Authoritative reference:** `interaction-spec.md` §2 is the canonical keyboard specification. The table below covers navigation-layer shortcuts only. Screen-specific shortcuts (sliders, fleet controls, etc.) are defined per-screen in `interaction-spec.md`.

### F-Key Navigation (Global — All Screens)

F-keys are available from the Galaxy Map and all full navigation screens (those with a command bar). They are **blocked** from true modal screens that have no command bar (Tech Screen F4, Fleet Screen F3 when opened as modal, Game Menu).

| Key | Screen |
|-----|--------|
| `F1` | Galaxy Map |
| `F2` | Planets (Planet Management) |
| `F3` | Fleet Screen |
| `F4` | Technology Screen |
| `F5` | Races Screen (Diplomacy) |
| `F6` | Ship Design |
| `F8` | High Council (only when Council is in session; otherwise no-op) |

### Galaxy Map Letter Shortcuts

These letter shortcuts are **only active on the Galaxy Map** (F1). They do NOT function as global shortcuts. When inside any modal or sub-screen, letter keys follow that screen's own shortcut table.

| Key | Galaxy Map Action | Notes |
|-----|-----------------|-------|
| `N` | Next Colony (cycle) | See `interaction-spec.md` §2.2 |
| `F` | Next Fleet (cycle) | **Not** "open Fleet screen" — use F3 for that |
| `G` | Toggle Grid overlay | **Not** "Game menu" — use ESC for Game Menu |
| `R` | Toggle Range Circles | **Not** "RACES screen" — use F5 for that |
| `T` | Toggle Trade Routes | **Not** "Tech screen" — use F4 for that |
| `E` | Highlight Enemy Fleets | |
| `M` | _(no Galaxy Map binding)_ | `M` = Mute Audio globally; avoid reassigning |
| `P` | _(no Galaxy Map binding)_ | `P` = Patrol in Fleet Command |
| `D` | _(no Galaxy Map binding)_ | `D` = Defense Slider in Planet Mgmt |
| `Enter` | Open End Turn confirmation | |
| `Space` | Center view on selection | |
| `+` / `=` | Zoom In | |
| `-` | Zoom Out | |
| `0` | Reset Zoom | |
| `ESC` | Open Game Menu | Primary and only binding for Game Menu |

### Conflict Resolutions (2026-04-12)

The following conflicts existed in earlier drafts of this section and are now resolved:

| Key | Old (this table, pre-fix) | Canonical (interaction-spec.md) | Reason |
|-----|---------------------------|---------------------------------|--------|
| `G` | GAME menu | Toggle Grid (Galaxy Map only) | ESC opens Game Menu; G = grid is more useful |
| `R` | RACES/Diplomacy | Range Circles (Galaxy Map only) | R = RACES was a stretch; use F5 |
| `F` | FLEET screen | Next Fleet cycle (Galaxy Map only) | F3 opens Fleet screen; `F` cycles fleet selection |
| `D` | DESIGN screen (listed as global) | Defense Slider in Planet Mgmt only | D is screen-local, not global; use F6 for Design |
| `T` | TECH/Research | Trade Routes toggle (Galaxy Map only) | T = Tech was a stretch; use F4 |
| `P` | PLANETS list | No Galaxy Map binding | P = Patrol in Fleet Cmd; use F2 for Planets |
| `M` | MAP overview | No Galaxy Map letter binding | M = Mute Audio globally; MAP button cycles overlays |
| `F10` | Game Menu (UI_OVERVIEW) | Removed — not used | ESC is the sole Game Menu trigger |

### In Modals

| Key | Action |
|-----|--------|
| `ESC` | Close modal / cancel current action |
| `Enter` | Confirm (context-dependent; suppressed in Fleet Deployment panel — see §4.4) |
| `1-4` | Select hull size (Ship Design only) |

---

## 10. Screenshot Index

All reference screenshots are in `../moo_screens/`. Quick reference:

| Filename | What It Shows |
|----------|--------------|
| `moo_new_game_menu.png` | New Game menu |
| `moo_new_game_race_select.png` | Race selection |
| `moo_new_game_banner_select.png` | Banner / color selection |
| `moo_new_game_emporer_name.png` | Emperor name entry |
| `moo_new_game_home_world_name.png` | Homeworld name entry |
| `moo_galaxy_home.png` | Galaxy Map with home colony selected |
| `moo_galaxy_unexplored.png` | Unexplored star selected |
| `moo_galaxy_shipselect.png` | Fleet / ship selected |
| `moo_galaxy_aftershipdestinationselected.png` | After ship destination set |
| `moo_galaxy_movingshipselected.png` | Ship in transit |
| `moo_galaxy_fleet_deployment.png` | Fleet deployment panel |
| `moo_galaxy_select_uncolonized_planet.png` | Uncolonized planet selected |
| `moo_galaxy_ship_select_destination_out_of_range.png` | Destination out of range |
| `moo_galaxy_planet_new.png` | New colony state |
| `moo_galaxy_planet_post_tform.png` | Post-terraformed colony |
| `moo_galaxy_planet_is_full.png` | Colony at population cap |
| `moo_galaxy_max_factories.png` | Colony at max factories |
| `moo_map_colonies_selected.png` | MAP overlay — colonies |
| `moo_map_environments_selected.png` | MAP overlay — environments |
| `moo_map_minerals_selected.png` | MAP overlay — minerals |
| `moo_design.png` | Ship design overview |
| `moo_ship_design.png` | Ship design detail |
| `moo_fleet_screen.png` | Fleet screen |
| `moo_planets.png` | Planets list |
| `moo_tech.png` | Tech / research screen |
| `moo_new_tech.png` | New tech breakthrough |
| `moo_start_of_turn_select_new_research.png` | Select new research |
| `moo_colony_ship_arrives_at_potential_planet.png` | Colony ship arrival |
| `moo_new_colony_screen.png` | New colony established |
| `moo_start_of_turn_new_planet_reveal.png` | Planet reveal (start of turn) |
| `moo_start_of_turn_new_ships.png` | New ships built notification |

---

*Next: See `wireframes/` folder for detailed screen layouts.*
