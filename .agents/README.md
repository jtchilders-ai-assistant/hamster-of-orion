# Autonomous Agent System

This directory contains the configuration and state files for the autonomous agent implementation workflow.

## Overview

The workflow uses three agent types:
- **Orchestrator**: Manages state machine, assigns tasks, coordinates agents
- **Worker**: Implements code according to design documents
- **Verifier**: Validates code against design docs, runs tests, approves/rejects

## Design Document Compliance

**This is the core principle of the workflow.**

All code must match the design documents exactly. The agents enforce this through:

### 1. Task `designDocs` Field
Every task lists its authoritative design documents:
```json
{
  "id": "combat-engine",
  "designDocs": [
    "design/ships/combat-algorithm.md",
    "design/ships/combat-mechanics.md"
  ]
}
```

### 2. Worker `design_compliance` Output
Worker must document which formulas they implemented:
```json
{
  "design_compliance": [
    {
      "doc": "design/ships/combat-algorithm.md",
      "section": "Hit Formula",
      "quote": "Hit% = 50 + (AttackerSkill - DefenderSkill) × 5",
      "impl_file": "src/game/systems/combat.ts",
      "impl_line": 78,
      "verified": true
    }
  ]
}
```

### 3. Verifier Validation
Verifier reads the design docs and checks that:
- Each claimed formula is actually in the design doc
- The code at the specified line implements it correctly
- No formulas in the design doc are missing from code

### 4. Automated Check
Run `npm run check-design` to scan for obvious mismatches between design docs and constants.

## Files

| File | Purpose |
|------|---------|
| `orchestrator-prompt.md` | Instructions for orchestrator agent |
| `worker-prompt.md` | Instructions for implementation worker |
| `verifier-prompt.md` | Instructions for code review verifier |
| `tasks.json` | Task queue with status and designDocs |
| `workflow-state.json` | Current state machine state |
| `current-task.md` | Active task details |
| `progress.md` | Append-only work log |

## State Machine

```
IDLE → WORKING → TESTING → VERIFYING → IDLE (approved)
                    ↓           ↓
                WORKING ←── WORKING (rejected)
                    
BLOCKED ← (design doc ambiguity needs human review)
```

## Task Schema

```json
{
  "id": "unique-id",
  "name": "Human readable name",
  "type": "code|ui|data",
  "status": "pending|in_progress|done|blocked",
  "description": "What to implement",
  "designDocs": [
    "design/path/to/doc1.md",
    "design/path/to/doc2.md"
  ],
  "output": "src/path/to/output.ts",
  "acceptance": [
    "Criterion 1",
    "Criterion 2"
  ],
  "dependencies": ["other-task-id"]
}
```

## Running the Workflow

The orchestrator runs via cron job (every 5 minutes):
```bash
# Check cron status
openclaw cron status

# Manually trigger orchestrator
openclaw cron run --jobId <orchestrator-job-id>
```

## Design Doc Compliance Script

```bash
# Check all design docs
npm run check-design

# Check specific doc
npx tsx scripts/check-design-compliance.ts design/economy/factory-formulas.md

# Verbose output
npm run check-design -- --verbose
```

## When Blocked

If the workflow enters BLOCKED state, it means:
1. Design docs are ambiguous or conflicting
2. Human must clarify the design
3. Update the design doc with the clarification
4. Set state back to WORKING

## Adding New Tasks

1. Add task to `tasks.json` with all fields
2. **Include `designDocs`** — list ALL relevant design docs
3. Set `status: "pending"`
4. Orchestrator will pick it up when dependencies are met

## Design Documents

Source of truth for all game mechanics:
- `design/economy/` — production, growth, sliders, trade
- `design/ships/` — combat, ship design, weapons
- `design/species/` — race bonuses, special abilities
- `design/technology/` — tech tree, costs, unlocks
- `design/diplomacy/` — relations, treaties, espionage
- `design/planets/` — infrastructure, colonization
- `design/ui-ux/` — wireframes, navigation
- `reference/strategywiki-moo1.txt` — authoritative MOO1 reference
