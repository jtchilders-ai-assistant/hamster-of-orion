# Current Task: Complete diplomacy UI

**ID**: diplomacy-ui-complete
**Type**: ui
**Output**: src/ui/screens/DiplomacyScreen.ts

## Description
Finish DiplomacyScreen with all treaty actions, relation display, and AI response handling. Allow proposing/accepting treaties, declaring war, and viewing relation history.

## Design Documents (MUST READ)
- design/ui-ux/wireframes/diplomacy-screen.md — UI layout, components, relation display
- design/diplomacy/relationship-formulas.md — Relation values, modifiers, calculations
- design/diplomacy/treaties.md — Treaty types, proposal flow, acceptance logic

## Acceptance Criteria
1. Empire list shows all known empires
2. Relation bar (-100 to +100) with color coding
3. Treaty status icons (NAP, Trade, Alliance, War)
4. Propose treaty dropdown with all treaty types
5. Accept/reject incoming proposals
6. Declare war button with confirmation
7. Relation history/events log

## Dependencies
- None (this is an independent UI task)

## Notes
- The diplomacy logic backend (relations, treaties, AI diplomacy) is complete
- This task focuses on the UI layer only
- Check existing DiplomacyScreen.ts for current state before implementing
