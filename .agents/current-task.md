# Current Task: Fleets list screen (F3)

**ID**: fleets-list-screen
**Type**: ui
**Output**: src/ui/screens/FleetsScreen.ts

## Description

Create FleetsScreen showing all player fleets. Display location, destination, ship counts, and fleet commands.

## Design Documents (MUST READ)

- `design/ui-ux/wireframes/command_menu/command_menu_fleet.md` — Full wireframe: table layout (SYSTEM column + 6 ship design columns), in-transit display with arrow + ETA, ship icons with count badges, bottom Fleet Maintenance display, SPECS/SCRAP/OK buttons
- `design/ui-ux/wireframes/fleet-screen.md` — MOO1-accurate spec: black background, "FLEET OVERVIEW" title with golden rule, row interactions (click to select on galaxy map), cell structure with ship sprites and count in bottom-right

## Key Design Details

### Layout
- Full-screen modal (no bottom command bar visible)
- "FLEET OVERVIEW" title centered, golden horizontal rule beneath
- Table with 7 columns: SYSTEM + 6 ship design columns
- Bottom section: Fleet Maintenance box (left), SPECS/SCRAP/OK buttons (right)

### System Column
- Orbiting: System name (e.g., "FIRMA")
- In transit: `→ DESTINATION` with `ETA: N` on second line

### Ship Design Columns
- Header: Actual ship design name
- Cell: Ship sprite with count in bottom-right corner
- Empty cell: Solid black/background fill

### Interactions
- Click row → return to Galaxy Map with that fleet selected
- SPECS → view ship design specifications
- SCRAP → open scrapping interface
- OK / ESC → close, return to Galaxy Map

## Acceptance Criteria

1. Lists all player fleets
2. Shows fleet location (system name or 'In Transit')
3. Shows destination if moving
4. Shows ship counts by design
5. Click fleet to select on galaxy map
6. Merge/split fleet buttons
7. Accessible via F3 or command bar

## Dependencies

- None (no blocking dependencies)

## Notes

- Max 6 ship designs (MOO1 constraint)
- Fleet Maintenance shows total BC/turn upkeep
- Reference: `design/moo_screens/moo_fleet_screen.png`
