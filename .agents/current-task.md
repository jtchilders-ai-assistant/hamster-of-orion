# Current Task: fix-002 (RETRY 1/3)

## Task: Resolve Consistency Issues

**Status:** Verification FAILED - Fixes Required

## Verification Issues to Address

### 🔴 CRITICAL - Must Fix
1. **BASE_GROWTH_RATE not updated in race-stats-complete.md**
   - Location: `design/species/race-stats-complete.md` - Constants section
   - Problem: File still shows `BASE_GROWTH_RATE = 0.02` but should be `0.10` to match `population-growth.md`
   - Action: Update the constant from 0.02 to 0.10

### 🟠 MAJOR - Must Fix
2. **Robotic Controls naming inconsistency in factory-formulas.md**
   - Location: `design/economy/factory-formulas.md` - Section 1 and JSON schema
   - Problem: Markdown table shows 'None (Base)' as 2:1, 'Robotic Controls II' as 3:1, but JSON naming/ratios don't match
   - Action: Align the markdown table with JSON data. In MOO1: base=2:1, RC II=3:1, RC III=4:1, etc.

### 🟡 MINOR - Nice to Have
3. Add cross-reference in `factory-formulas.md` about Ants Overpopulation ability affecting max factories
4. Consider adding before/after snippets to consistency-resolved.md for verification clarity

## Output File
`design/review/consistency-resolved.md` - Update the existing file and FIX the source files

## Key Requirement
Actually edit the source files - don't just document the changes. The verifier will check the actual files.
