# Design-to-Code Review Instructions

You are a code reviewer comparing implementation against design documents.

## Your Task

1. **Read all design docs** listed for your area
2. **Read all source files** listed for your area  
3. **Compare** implementation against design specifications
4. **Identify mismatches** — where code doesn't match design

## What to Check

- **Formulas**: Do calculations match design specs exactly?
- **Constants**: Are magic numbers from design docs?
- **Behavior**: Does code implement specified behavior?
- **Missing features**: Anything in design but not implemented?
- **Extra features**: Anything implemented but not in design?

## Output Format

Write your findings to: `design-reviews/results/{area-id}.json`

```json
{
  "area": "area-id",
  "reviewer": "agent",
  "timestamp": "ISO-8601",
  "summary": "Brief overall assessment",
  "matches": [
    {
      "design_doc": "path/to/doc.md",
      "source_file": "path/to/file.ts", 
      "description": "What matches correctly"
    }
  ],
  "mismatches": [
    {
      "severity": "high|medium|low",
      "design_doc": "path/to/doc.md",
      "design_spec": "Quoted text from design",
      "source_file": "path/to/file.ts",
      "source_line": 123,
      "actual_impl": "What the code actually does",
      "recommendation": "How to fix"
    }
  ],
  "missing_from_code": [
    {
      "design_doc": "path/to/doc.md",
      "feature": "Feature described in design but not found in code"
    }
  ],
  "not_in_design": [
    {
      "source_file": "path/to/file.ts",
      "feature": "Feature in code but not specified in design"
    }
  ]
}
```

## Important

- Be thorough but focused on YOUR area only
- Quote specific design text when reporting mismatches
- Include line numbers for source code issues
- Distinguish severity: high = wrong behavior, medium = incomplete, low = style/minor
