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
        Diplomacy[Diplomacy/Races]
        PlanetList[Planets List]
        Research[Research Screen]
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

### 4.2 Research Screen Flow

```mermaid
flowchart TD
    subgraph ResearchScreen["Research Screen (Modal)"]
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

### 4.3 Diplomacy Screen Flow

```mermaid
flowchart TD
    subgraph DiplomacyScreen["Diplomacy/Races Screen (Modal)"]
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

| Key | Galaxy Map Action | In Modals |
|-----|------------------|-----------|
| `G` | GAME menu | - |
| `D` | DESIGN screen | - |
| `F` | FLEET screen | - |
| `M` | MAP overview | - |
| `R` | RACES/Diplomacy | - |
| `P` | PLANETS list | - |
| `T` | TECH/Research | - |
| `Enter` | NEXT TURN | Confirm |
| `ESC` | - | Close modal |
| `1-4` | - | Select hull (Design) |
| `Space` | Center on selection | - |

---

*Next: See `wireframes/` folder for detailed screen layouts.*
