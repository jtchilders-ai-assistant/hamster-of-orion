# Current Task: Colonies list screen (F2)

**ID**: colonies-list-screen
**Type**: ui
**Output**: src/ui/screens/ColoniesScreen.ts

## Description
Create ColoniesScreen showing all player colonies in a sortable list. Display population, factories, current build, and production stats.

## Design Documents (MUST READ)
- `design/ui-ux/wireframes/command_menu/command_menu_planets.md` — Full wireframe with column definitions, layout, interactions, and bottom panels (SPENDING, TOTALS, FINANCE)

**Note:** The task listed `design/ui-ux/wireframes/colony-list.md` but the actual doc is `command_menu/command_menu_planets.md`. Use that.

## Acceptance Criteria
1. Lists all player colonies
2. Sortable by name, population, factories
3. Shows current build queue item per colony
4. Shows production stats (BC/turn)
5. Click colony name to open planet screen
6. Shows environment type icons
7. Accessible via F2 or command bar

## Additional Requirements from Design Doc
- Column layout: IMG, PLANET NAME, POP (segmented bar), FACT, SHD, BASE, WST, PROD, BUILDING
- Population shown as segmented bar (filled = current, empty = capacity)
- Bottom panels: SPENDING (ships/bases/spying/security), TOTALS (trade/planets/total), FINANCE (reserve/transfer)
- Click row to select, double-click to open Planet Detail
- Scrollable if > 12-15 colonies
- OK button returns to Galaxy Map

## Existing Code
There's a stub at `src/ui/screens/ColoniesScreen.ts` (1056 bytes). Replace it with full implementation.

## Dependencies
- None (can start immediately)
