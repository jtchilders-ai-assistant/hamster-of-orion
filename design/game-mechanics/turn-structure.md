# Turn Structure

## Overview
Hamster of Orion is turn-based. Each turn represents one galactic cycle (~1 year game time). All empires move simultaneously.

---

## Turn Phases

### Phase 1: Income & Maintenance
**Order of Operations**:
1. **Collect Income**: BC from trade, tribute, captured systems
2. **Pay Maintenance**: Ships, buildings, spies cost upkeep
3. **Calculate Net Income**: Total revenue - expenses

**Bankruptcy**:
- If negative BC: Ships scrap randomly until balanced
- Morale penalties empire-wide
- Diplomatic reputation damage

---

### Phase 2: Production
**Each Planet Processes**:
1. Apply resource sliders (Ship/Defense/Industry/Ecology/Research)
2. Population works (farmers, workers, scientists)
3. Factories produce based on allocation
4. Pollution generated
5. Buildings constructed

**Simultaneous**: All empires produce at once

**Output**:
- BC toward current projects
- Research Points generated
- Food surplus/deficit calculated
- Ship construction progress

---

### Phase 3: Research
**Technology Progress**:
1. Sum all Research Points empire-wide
2. Apply to current tech
3. If complete: Choose next tech from options
4. Miniaturization kicks in for old techs

**Breakthrough Event**: Popup showing new tech acquired

---

### Phase 4: Population Growth
**For Each Planet**:
1. Calculate growth rate (base + modifiers)
2. Add new population
3. Check food supply (starvation if negative)
4. Check pollution (unrest if excessive)
5. Update morale

**Migrations**: Excess population can transfer to new colonies

---

### Phase 5: Diplomacy
**AI Actions**:
- Treaties proposed/broken
- Spy missions executed
- Trade route updates
- Diplomatic messages

**Player Response**: Review and respond to proposals

---

### Phase 6: Movement
**Fleet Operations**:
1. All fleets move simultaneously
2. Calculate arrival times
3. Detect enemy fleets
4. Scouts reveal new systems

**Interception**: Fast fleets can intercept slow ones

---

### Phase 7: Combat Resolution
**If Fleets Meet**:
1. Battle initiation
2. Player choice: Tactical or Auto-resolve
3. Combat plays out
4. Victor determined
5. Aftermath (salvage, experience)

**Multiple Battles**: Resolve in order of detection

---

### Phase 8: Ground Combat & Colonization
**Planet Operations**:
- Invasions resolve
- Bombardments process
- New colonies establish
- Captured planets integrate

---

### Phase 9: Events
**Random Events** (10% chance):
- Space monsters appear
- Ancient ruins discovered
- Pirates attack trade
- Solar flares damage ships
- Diplomatic incidents

**Scripted Events**: Orion sightings, Council formation, etc.

---

### Phase 10: Victory Check
**Evaluate**:
- Diplomatic: Council vote passed? (2/3 majority)
- Domination: All enemies eliminated?

**If Victory**: End game, show ending
**If None**: Advance to next turn

---

### Phase 11: AI Turn
**AI Empires Process**:
- Adjust sliders
- Design ships
- Assign fleets
- Make diplomatic decisions
- Research priorities

**Simultaneous Processing**: All AI act at once (players don't see individual decisions)

---

### Phase 12: End Turn
**Cleanup**:
- Save game state
- Update turn counter
- Prepare next turn
- Player can review reports

**Turn Complete**: Advance to Turn N+1

---

## Turn Length Estimates

**Early Game** (Turns 1-40):
- 2-5 minutes per turn
- Few decisions
- Small empire

**Mid Game** (Turns 40-80):
- 5-10 minutes per turn
- Multiple colonies
- Fleet management
- Diplomacy active

**Late Game** (Turns 80-150+):
- 10-20 minutes per turn
- Large empire
- Multiple wars
- Complex diplomacy

**Auto-Governors**: Can speed up by letting AI manage colonies

---

## Turn Counter

**Starting**: Year 2623 (lore: 123 years post-Awakening)
**Each Turn**: +1 year
**Display**: "Year 2623 - Turn 1"

**Milestones**:
- Turn 25: Technology tier 2
- Turn 50: Council may form
- Turn 75: Mid-game crisis
- Turn 100: Late-game techs available
- Turn 150+: Endgame

---

## Simultaneous vs Sequential

**Simultaneous** (MOO1 style):
- All empires move at once
- No player advantage
- Fair multiplayer
- AI doesn't see your moves before deciding

**Benefits**:
- Faster gameplay
- Balanced multiplayer
- No turn-order exploitation

---

## Save System

**Autosave**: Every turn automatically
**Manual Save**: Any time during turn
**Quicksave**: F5 hotkey (web: localStorage)
**Cloud Save**: Optional account sync

**Save Data Includes**:
- Full game state
- All empire data
- Research progress
- Diplomatic history
- Random seed (for consistency)

---

## Speed Options

**Normal**: Full animations, 1x speed
**Fast**: Reduced animations, 2x speed
**Instant**: Skip animations, 4x speed

**Quick Combat**: Auto-resolve all battles
**Quick End Turn**: AI turns instant

---

Next: See `victory-conditions.md` for victory conditions (Diplomatic and Domination).
