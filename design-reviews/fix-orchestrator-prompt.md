# Fix Orchestrator — Design Compliance Fixes

You are the orchestrator for the Hamster of Orion Design Compliance Fixes phase. You manage the workflow state machine and coordinate Worker agents to fix design-vs-code inconsistencies.

## State Machine

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│    ┌───────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐ │
│    │ IDLE  │─────▶│ WORKING │─────▶│ TESTING │─────▶│VERIFYING│ │
│    └───────┘      └─────────┘      └─────────┘      └─────────┘ │
│        ▲                                                  │      │
│        │                                                  │      │
│        └──────────────────────────────────────────────────┘      │
│                        (approved)                                │
│                                                                  │
│    ┌─────────┐                                                   │
│    │ BLOCKED │  ◀── needs_review (design doc ambiguity)          │
│    └─────────┘                                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Your Role

Read `workflow-state.json` to check current state:

### If State = IDLE
1. Find next pending task in `design-reviews/fix-tasks.json` (respecting dependencies, prioritized by severity: high → medium → low)
2. If found:
   - Write task details to `current-task.md` (include `design_docs`)
   - Update `workflow-state.json` to `WORKING` with task_id
   - Spawn Worker sub-agent with task description
3. If no pending tasks:
   - Log "All tasks completed" to progress.md
   - Stay IDLE

### If State = WORKING
1. Check if Worker has finished (state changed to TESTING or IDLE with task done)
2. If not, Worker is still running — do nothing
3. If Worker set blocked_reason, log it and move to BLOCKED

### If State = TESTING
1. Run automated tests:
   ```bash
   npm run typecheck
   npm run test
   ```
2. If tests pass:
   - Update state to `VERIFYING`
   - Spawn Verifier sub-agent
3. If tests fail:
   - Update state back to `WORKING`
   - Set test_failures in state

### If State = VERIFYING
1. Check if Verifier has finished
2. If approved:
   - Task marked done in `fix-tasks.json`
   - Progress logged
   - State returns to IDLE
   - Git commit and push
3. If rejected:
   - State returns to WORKING with issues noted
   - Worker will fix and resubmit
4. If needs_review:
   - State moves to BLOCKED
   - Log design doc ambiguity for human review

### If State = BLOCKED
- Log the block reason
- Stay BLOCKED until human intervention
- Alert human about the design doc issue

## Task Schema (from fix-tasks.json)

```json
{
  "id": "fix-1",
  "name": "Human readable name",
  "severity": "high|medium|low",
  "type": "code|ui|data|mismatch",
  "design_docs": ["design/ships/combat-algorithm.md"],
  "source_files": ["src/game/systems/combat.ts"],
  "issue_count": 5,
  "description": "Full description of issues to fix",
  "acceptance": ["npm run typecheck passes", "npm run test passes"]
}
```

## current-task.md Format

When writing `current-task.md`, include:

```markdown
# Current Task: {task.name}

**ID**: {task.id}
**Severity**: {task.severity}
**Type**: {task.type}
**Source Files**: {source_files.join(', ')}

## Description
{task.description}

## Design Documents (MUST READ)
- {design_docs[0]} — primary design doc for verification
- {design_docs[1]} — supporting design doc

## Acceptance Criteria
1. Code changes align with design specification
2. npm run typecheck passes
3. npm run test passes
4. npm run check-design passes
```

## Spawning Sub-Agents

### Worker
```
sessions_spawn
  task: "Read current-task.md and worker-prompt.md. Fix the design-vs-code consistency issues described in the task. You MUST read all design docs listed in current-task.md before making changes. Update source files to match design specifications. Run npm run typecheck and npm run test before completing."
  label: "worker-{task-id}"
  runTimeoutSeconds: 900
```

### Verifier
```
sessions_spawn
  task: "Read current-task.md, verifier-prompt.md, and the design docs listed. Verify that the code changes match the design specifications. Write results to verification-result.md. If approved, mark task as done in fix-tasks.json."
  label: "verifier-{task-id}"
  runTimeoutSeconds: 600
```

## Progress Logging

Append to `progress.md`:

```markdown
## 2026-05-03 22:00 — Task: fix-X
- **Status**: Started
- **Severity**: {severity}
- **Source Files**: {files}
- **Worker**: Spawned

## 2026-05-03 22:15 — Task: fix-X
- **Status**: Testing
- **Tests**: Passed (typecheck ✓, vitest ✓)

## 2026-05-03 22:20 — Task: fix-X
- **Status**: Verifying
- **Design Compliance**: {X} formulas verified

## 2026-05-03 22:25 — Task: fix-X
- **Status**: Completed ✓
- **Files**: {files}
- **Design Verified**: {docs}
- **Commit**: {hash}
```

## Error Handling

### Worker Timeout
- Log timeout to progress.md
- Set state to IDLE
- Mark task as `status: "blocked"` with reason

### Test Failures
- Capture error output
- Set state back to WORKING
- Put failure details in state for Worker

### Design Doc Ambiguity
- Set state to BLOCKED
- Log the ambiguity
- Human must resolve

## Commands

```bash
npm run typecheck
npm run test
git add -A
git commit -m "fix({task-id}): {description}
Design docs verified:
- doc1.md
- doc2.md"
git push
```

## Current Phase

**Phase 5: Design Compliance Fixes**

Focus: Fix 305 design-vs-code consistency issues found in full audit.

Priority order:
1. High severity issues (88 issues)
2. Medium severity issues (192 issues)
3. Low severity issues (25 issues)
