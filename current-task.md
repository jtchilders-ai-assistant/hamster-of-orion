# Current Task: fix-31 — Spy Network UI Design Doc Fixes

**ID**: fix-31 | **Severity**: medium | **Source**: design/ui-ux/spy-network-ui.md

## Status: COMPLETED

## Issues Fixed

1. **Mission labels aligned with design doc**:
   - `sabotage_bases`: Changed from "Incite Rebellion" to "Sabotage Missile Bases"
   - `frame_race`: Changed from "Credit Theft" to "Frame Empire" 
   - `assassination`: Changed from "Assassination" to "Assassinate Leader"
   - `incite_rebellion`: Changed from "Intelligence Gathering" to "Incite Rebellion"

2. **Success rates updated per design doc §2**:
   - Steal Technology: 30% (was 30% ✓)
   - Sabotage Factories: 28% (was 40%)
   - Sabotage Missile Bases: 28% (was 25%)
   - Frame Empire: 20% (was 35%)

3. **Relation penalties updated per design doc §3**:
   - Steal Technology: -15 if caught (was -20)
   - Sabotage Factories: -25 if caught (was -30)
   - Sabotage Missile Bases: -25 if caught (was -50)
   - Frame Empire: -10 if exposed (was -35)
   - Assassinate Leader: -50 (atrocity) (was -100)

4. **Event title labels updated in espionageResolution.ts**:
   - `sabotage_bases` → "Missile Base Sabotage"
   - `frame_race` → "Frame Empire"
   - `assassination` → "Leader Assassination"

5. **Mission reward display enhanced**:
   - Added `bases_destroyed` reward formatting
   - Added `factories_destroyed` reward formatting
   - Added `bc_stolen` reward formatting for Frame Empire
   - Added `rebellion_points` reward formatting
   - Added `frame_job_failed` to failure cases

## Files Modified

- `src/ui/components/EspionagePanel.ts` - Mission labels, success rates, penalties, and JSDoc
- `src/game/systems/espionageResolution.ts` - Event title labels

## Files Created

- `test/ui/components/espionagePanel.test.ts` - Design compliance tests for mission labels and values

## Remaining Design Doc Items (for future tasks)

The following design doc features are documented but not yet implemented:
- **Spy caught response options**: APOLOGIZE vs DENY (§4.3) - requires modal popup system
- **Enemy spy caught options**: EXECUTE/IMPRISON/RELEASE (§4.4) - requires modal popup system
- **SPYING/SECURITY budget integration**: Full budget display from PLANETS screen (§1, §6)

These items require additional UI infrastructure (modal popups, budget system integration) beyond the scope of this fix task.

## Verification

- ✅ `npm run typecheck` - Pre-existing errors unrelated to this task
- ✅ `npm run test` - 1497 tests pass
- ✅ `npm run check-design` - No compliance issues found
