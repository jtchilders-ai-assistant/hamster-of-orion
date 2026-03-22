# Hamster of Orion - Phase 2: Gap Analysis & UI Specification

## Goal
Thoroughly review all existing design documents, identify gaps compared to the original Master of Orion, and create detailed ASCII wireframes for all UI screens that faithfully recreate MOO1's interface behavior.

## Phase 2 Objectives

### 1. Gap Analysis (Tasks review-001 to review-004)
- Compare ALL specs against MOO1 manual PDF
- Cross-reference with StrategyWiki pages
- Create coverage matrix showing what's documented
- Identify inconsistencies across our spec documents

### 2. UI Specification (Tasks ui-001 to ui-012)
- Inventory all MOO1 screens vs our current UI docs
- Create detailed ASCII wireframes for each screen
- Match original MOO1 layout and behavior
- Document all interactions and state transitions

### 3. Resolution (Tasks fix-001 to fix-002)
- Address all gaps found in analysis
- Fix consistency issues across specs

## Reference Materials

### Primary Sources
- Original MOO1 Manual PDF (in project)
- StrategyWiki: https://strategywiki.org/wiki/Master_of_Orion/Table_of_Contents
- Archive.org Strategy Guide: https://archive.org/stream/MasterOfOrionStrategyGuide/MasterOfOrionStrategyGuide_opt_djvu.txt

### Existing UI Docs to Review/Update
- `design/ui-ux/UI_OVERVIEW.md` - General UI principles
- `design/ui-ux/main-screens.md` - Main screen layouts
- `design/ui-ux/tactical-combat-ui.md` - Combat screen
- `design/ui-ux/information-displays.md` - Info panels

## Output Requirements

### Gap Analysis Reports
```markdown
# Gap Analysis Report

## Summary
- Total gaps found: X
- Critical gaps: X
- Minor gaps: X

## Detailed Findings

### [System Name]
- **Status**: Missing / Incomplete / Deviation
- **MOO1 Reference**: [manual page or wiki section]
- **Our Coverage**: [file and section]
- **Gap Description**: What's missing or wrong
- **Recommended Fix**: How to address
```

### ASCII Wireframes
```
Each wireframe should include:
1. Full screen layout with borders
2. All UI elements labeled
3. Multiple states (selected/unselected, different modes)
4. Exact button/control positions
5. Information panel contents
6. How it matches MOO1 behavior
```

## Success Criteria
- [ ] Complete gap analysis with all discrepancies documented
- [ ] All 10+ UI screens have detailed ASCII wireframes
- [ ] Wireframes match MOO1 layout and behavior
- [ ] All gaps resolved with updated specs
- [ ] Consistency issues fixed across all documents
