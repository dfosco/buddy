# GOAL_RUNNER

A skill for implementing tasks from the dots system.

> **Auto-generated from `src/workflow.json`**
> Do not edit directly. Run `dots workflow generate` to regenerate.

## Overview

The CLI enforces workflow state - commands validate prerequisites before running.
After each command, use `dots status` to see current state and next steps.

## Starting a Task

```bash
dots run #goal#task     # Claims hook, creates worktree, prepares context
```

## Implementing

Work in the worktree directory. The CLI tracks which phases are complete.

```bash
dots status             # See current phase and what's next
dots status --json      # Machine-readable output
```

## Completing a Task

```bash
dots finish             # Check-in, merge, release hook
```

## Command Reference

### START

`dots start #goal#task`

Launch a copilot session for the task. This initializes the AI agent context with the task reference and runs the implementation workflow.

### CONFIG

`dots run #goal#task`

Read workflow configuration from .dots/dots.config.json. This loads settings like default_branch and merge_mode that control later phases. The CLI parses and validates the config before proceeding.

### REFRESH_PRE

`dots refresh pull`

Sync the ledger from the dots branch to check coordination state. Verifies if this task is already hooked by another session or already completed.

### HOOK_CLAIM

`dots hook claim #goal#task`

Claim ownership of the task by writing hook_created event to the ledger. Assigns a session ID ({PID}-{timestamp}). Sets task status to in_progress in the goal's JSONL file. This prevents other sessions from working on the same task.

### WORK_MODE

`dots worktree setup #goal#task`

Create an isolated per-task worktree at .worktrees/{goal}-{task}/. This is MANDATORY - never work directly in the main repo. The worktree has its own branch (dots/{goal}/{task}) checked out from default_branch.

### PREPARE

`dots prepare #goal#task`

Load the goal and task context from .dots/db/{goal}.jsonl. Also checks for an implementation plan at .dots/plans/{goal}/{task}.md. Displays full context to the agent: goal title/description, task title/description, acceptance criteria, and optional plan guidance.

**Requires:** HOOK_CLAIM

### CHECK_IN

`dots check_in #goal#task`

Pause execution for user validation of the changes. The user reviews the diff and decides whether to proceed to commit.

### COMMIT

`dots push`

Stage, commit, and push all changes to the task branch. The CLI handles commit message formatting and ensures the ledger is properly updated.

**Requires:** IMPLEMENT

### MERGE_MODE

`dots merge #goal#task`

Apply the merge strategy from dots.config.json to integrate changes from the task branch.

### HOOK_RELEASE

`dots hook release #goal#task`

Release the task hook by writing hook_finished event to the ledger. Update the task status to 'done' in .dots/db/{goal}.jsonl. This signals to other sessions that the task is complete.

### REFRESH_POST

`dots refresh push`

Push ledger updates and status changes to the dots branch. This makes the completion visible to other agents and persists the coordination state. The task is now fully complete.

## Agent Work

After PREPARE, implement the task in the worktree:

1. **IMPLEMENT** - Write code to satisfy the task requirements
2. **DOCS** - Update all relevant documentation to reflect changes made during IMPLEMENT
3. **COMMIT** - `dots push`

Then run `dots finish` to complete the workflow.

## ⛔ STOP - Do Not Mark Goal Done

**CRITICAL**: After completing a task, STOP HERE.

❌ Do NOT run `dots goal status <id> done`
❌ Do NOT mark the goal as complete
❌ Do NOT assume the goal is finished just because all tasks are done

✅ The USER decides when a goal is truly complete
✅ Report task completion and wait for user instructions
✅ The CLI handles `auto_done_goal` setting automatically - you don't need to do anything

## Goal Completion

**IMPORTANT**: After completing all tasks, do NOT automatically mark the goal as done.
The user decides when a goal is truly complete.
