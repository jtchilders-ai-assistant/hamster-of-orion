# Agent Workflow System

Autonomous agent system for Hamster of Orion development.

## Overview

This system uses a cron job to run an orchestrator every 5 minutes. The orchestrator manages a state machine that coordinates Worker and Verifier agents to complete development tasks.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  CRON JOB (every 5 min)                                     │
│  └── Triggers: Orchestrator agent (isolated session)        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR                                               │
│  ├── Reads workflow-state.json                              │
│  ├── If IDLE + pending tasks → spawns Worker                │
│  ├── If TESTING → runs tests → spawns Verifier              │
│  └── If VERIFYING + approved → commits, returns to IDLE     │
└───────────────────────────┬─────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  WORKER AGENT           │   │  VERIFIER AGENT         │
│  - Writes TypeScript    │   │  - Reviews code         │
│  - Runs typecheck       │   │  - Checks tests         │
│  - Updates state        │   │  - Approves or rejects  │
└─────────────────────────┘   └─────────────────────────┘
```

## State Machine

```
IDLE → WORKING → TESTING → VERIFYING → IDLE
         ↑                      │
         └──────────────────────┘
              (if rejected)
```

## Files

| File | Purpose |
|------|---------|
| `workflow-state.json` | Current state (IDLE/WORKING/TESTING/VERIFYING) |
| `tasks.json` | All tasks with status and dependencies |
| `current-task.md` | Active task details for Worker |
| `progress.md` | Append-only work log |
| `orchestrator-prompt.md` | Instructions for orchestrator |
| `worker-prompt.md` | Instructions for implementation worker |
| `verifier-prompt.md` | Instructions for code reviewer |

## Current Phase

**Phase 3: Core Implementation**

17 tasks covering:
- Project scaffold and build system
- Game state and store
- Galaxy generation
- Economy systems (production, growth, research)
- Basic UI (galaxy map, command bar, panels)

## Cron Job

- **Job ID:** 56accb00-8f0c-40af-a3ae-95ce1ed1164d
- **Schedule:** Every 5 minutes
- **Status:** Disabled (enable when ready to start)

### Enable/Disable

```
cron action=update jobId=56accb00-8f0c-40af-a3ae-95ce1ed1164d patch={"enabled": true}
cron action=update jobId=56accb00-8f0c-40af-a3ae-95ce1ed1164d patch={"enabled": false}
```

## Manual Trigger

To run the orchestrator manually:
```
cron action=run jobId=56accb00-8f0c-40af-a3ae-95ce1ed1164d
```
