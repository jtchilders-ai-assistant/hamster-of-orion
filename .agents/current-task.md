# Current Task: High Council screen UI

**ID**: council-screen-ui
**Type**: ui
**Output**: src/ui/screens/CouncilScreen.ts

## Description
Create CouncilScreen showing Galactic High Council. Display vote shares, current leader, and voting UI when council convenes.

## Design Documents (MUST READ)
- design/ui-ux/wireframes/council-screen.md — Council screen layout, vote display, voting UI
- design/diplomacy/high-council.md — Council mechanics, vote calculation, victory condition

## Acceptance Criteria
1. Shows all empires with vote share %
2. Vote share based on population
3. Current council leader highlighted
4. When council convenes: voting UI
5. Vote for self or another empire
6. Shows vote results and winner
7. Diplomatic victory triggers if 2/3 votes

## Dependencies
- None (all dependencies completed)

## Notes
- This is task 10/16 in Phase 4B
- Follow existing screen patterns (ResearchScreen, DiplomacyScreen)
- Hook into F7 hotkey per navigation-flow.md
