# Current Task: Complete research screen

**ID**: research-screen-complete
**Type**: ui
**Output**: src/ui/screens/ResearchScreen.ts

## Description

Finish ResearchScreen with tech selection, progress display, and field allocation. Show available techs per field, costs, and effects.

## Design Documents (MUST READ)

- `design/ui-ux/wireframes/research-tree.md` — MOO1-accurate wireframe for Technology Screen (F4). Two-half layout: left = 6 field rows with RP% sliders; right = tech tree browser by level. Tech description panel at bottom. Tech selection happens via start-of-turn popup, NOT from main screen. No bottom command bar — exit via OK or ESC.
- `design/technology/research-formulas.md` — RP calculation, tech costs by tier (§6), progress tracking (§8), miniaturization. Empire_Total_RP formula, field allocation, and completion overflow.
- `design/technology/categories.md` — 6 tech fields: Computers, Construction, Force Fields, Planetology, Propulsion, Weaponry. Strategy considerations per field.

## Acceptance Criteria

1. Shows 6 research fields (Computers, Construction, Force Fields, Planetology, Propulsion, Weaponry)
2. Each field shows current research target
3. Click field to see available techs (right-half tech tree browser by level)
4. Tech list shows cost, turns to complete
5. Select tech to set as current research
6. Progress bar for current research
7. Completed techs list/history

## Key Implementation Notes

From `research-tree.md`:
- Full-screen modal opened by F4/TECH button
- Left half (~40%): 6 stacked field rows, each showing: field name, RP%, current tech, progress bar + ETA
- Right half (~60%): Tech tree browser for selected field, organized by level with separators
- Tech states: [✓] researched, [→] researching, [ ] not researched
- Bottom: description panel (~80%) + summary box with Total RP + OK button (~20%)
- RP % sliders adjustable at any time — all 6 must sum to 100%
- Tech selection popup is SEPARATE (start-of-turn only, not part of main screen)

From `research-formulas.md`:
- 6 fields: weapons, propulsion, construction, computers, force_fields, planetology
- Tech tier costs: Tier 1=50 RP, Tier 2=80, ..., Tier 20=100,000 RP (see §6)
- ETA = remaining_cost / field_rp_per_turn
- Progress overflow carries to next tech (§8)

## Dependencies

- None (no blocking dependencies)
