# Current Task: fix-37 — Population Design Doc Fixes (COMPLETED)

**ID**: fix-37 | **Severity**: medium | **Source**: design/planets/population.md

## Summary

Updated design/planets/population.md to remove inaccurate "(estimated)" note and align with authoritative population-growth.md:

1. **Ants growth modifier**: Removed "(estimated)" since population-growth.md §4 specifies exact value (+25%)
2. **Added missing racial modifiers**: Added Mice (-25%) and Hermit Crabs (-50%) which were documented in population-growth.md but missing from the high-level overview
3. **Added cross-reference**: Referenced population-growth.md §4 for complete racial growth modifier table

## Files Modified

- `design/planets/population.md` - Updated Racial Modifiers section

## Design Compliance

| Doc | Section | Quote | Status |
|-----|---------|-------|--------|
| design/economy/population-growth.md | §4 Racial Growth Modifiers | ants: 1.25 (+25%), mice: 0.75 (-25%), hermit_crabs: 0.50 (-50%) | ✅ Aligned |

## Test Results

- Typecheck: PASS
- Tests: 1445 passed
