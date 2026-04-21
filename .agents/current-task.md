# Current Task: Complete diplomacy UI (REVISION)

**ID**: diplomacy-ui-complete
**Type**: ui
**Output**: src/ui/screens/DiplomacyScreen.ts

**STATUS**: REJECTED — Returning to Worker for fixes

## Rejection Details

The Verifier rejected this task. **6 of 7 acceptance criteria passed.** The following issues MUST be fixed:

### CRITICAL: Criterion 5 Failed — Accept/reject incoming proposals

**Problem**: `renderIncomingProposals()` is a hardcoded stub returning `'No pending proposals'` unconditionally. The `DiplomaticRelations` interface (state.ts) has **no `incomingProposals` field** — there is no data source for the UI to read from. The accept/reject buttons exist in HTML but are never rendered because there's no data.

**Required Fix**:
1. Add `incomingProposals: { type: TreatyType; fromEmpireId: EmpireId }[]` to `DiplomaticRelations` in `src/game/state.ts`
2. Update `proposeTreaty()` in `src/game/diplomacy/treaties.ts` to populate this field when an AI empire proposes to the player
3. Update `renderIncomingProposals()` in `DiplomacyScreen.ts` to iterate `player.relations[selectedEmpireId].incomingProposals` and render Accept/Reject buttons for each proposal

### MODERATE BUG: Line 333 — Template literal not interpolating

**Problem**: Line 333 uses single quotes instead of backticks:
```typescript
// WRONG:
disabled title="Requires +${t.minRelation} relations"
// CORRECT:
disabled title=\`Requires +${t.minRelation} relations\`
```

The tooltip literally shows `${t.minRelation}` instead of the number.

## Design Documents (MUST READ)
- design/ui-ux/wireframes/diplomacy-screen.md — Sub-Flow: AI-Initiated Audience shows incoming proposals as modal overlay
- design/diplomacy/relationship-formulas.md — Relation values, modifiers, calculations
- design/diplomacy/treaties.md — Treaty types, proposal flow, acceptance logic

## Acceptance Criteria
1. ✅ Empire list shows all known empires
2. ✅ Relation bar (-100 to +100) with color coding
3. ✅ Treaty status icons (NAP, Trade, Alliance, War)
4. ✅ Propose treaty dropdown with all treaty types (FIX: template literal bug on line 333)
5. ❌ Accept/reject incoming proposals — **MUST IMPLEMENT DATA MODEL + RENDERING**
6. ✅ Declare war button with confirmation
7. ✅ Relation history/events log

## Files to Modify
- `src/game/state.ts` — Add `incomingProposals` to `DiplomaticRelations` interface
- `src/game/diplomacy/treaties.ts` — Populate `incomingProposals` when AI proposes
- `src/ui/screens/DiplomacyScreen.ts` — Fix line 333 bug; implement real `renderIncomingProposals()`
- `test/ui/screens/DiplomacyScreen.test.ts` — Add tests for incoming proposals rendering

## Dependencies
- None
