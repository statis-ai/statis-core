---
name: gsd
description: "GSD (Get Shit Done) workflow commands for phased project execution with atomic commits and state tracking."
---
# GSD — Project Execution Workflow

All GSD commands are available globally via `/gsd:<command>`.

## Commands used in Statis Core

| Command | When to use |
|---|---|
| `/gsd:progress` | Check current build state, see what phase is next |
| `/gsd:plan-phase` | Plan a new phase before executing (research → plan → verify) |
| `/gsd:execute-phase` | Execute all tasks in a phase with atomic commits |
| `/gsd:quick` | Ship a small, well-scoped task without full phase overhead |
| `/gsd:debug` | Systematic debugging with persistent state across resets |
| `/gsd:verify-work` | Conversational UAT to confirm a phase is actually done |
| `/gsd:add-tests` | Generate tests for a completed phase |
| `/gsd:new-milestone` | Start the next milestone cycle |

## Planning docs location

```
.planning/
  roadmap.md       — full milestone plan
  phases/          — per-phase PLAN.md + VERIFICATION.md
```
