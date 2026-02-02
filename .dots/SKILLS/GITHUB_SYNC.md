# GITHUB_SYNC

A skill for synchronizing goals and tasks with GitHub Issues.

## Activation Check

When this skill is triggered, respond with:
```
🔄 GITHUB_SYNC activated for #<goal_id>
```

## Triggers

This skill activates when the user prompt matches ANY of these patterns:

**Explicit sync commands:**
- "sync #goal_id to github"
- "push #goal_id to github"
- "create github issue for #goal_id"
- "update github issue for #goal_id"
- "sync #goal_id"
- "github sync #goal_id"

**Issue management:**
- "make an issue for #goal_id"
- "create issue from #goal_id"
- "turn #goal_id into an issue"
- "publish #goal_id"
- "export #goal_id to github"

**Update requests:**
- "update the issue for #goal_id"
- "refresh #goal_id on github"
- "sync the tasks to github"
- "update github with progress"

**Implicit:**
- User says "put this on github" after creating a goal
- User asks "can we track this in github"
- User says "let's make this official"

## Behavior

### Sync a Goal

When syncing a goal:

```bash
dots github_sync #<goal_id>
```

This will:
1. **Create** a new GitHub Issue if none exists
2. **Update** the existing issue if already synced

### Issue Format

The generated issue will have:

**Title:** `[Goal] <goal title>`

**Body:**
```markdown
## Description

<goal description>

## Acceptance Criteria

- Criterion 1
- Criterion 2

## Tasks

- [ ] **#goal_id#task_id**: Task title
  Task description
- [x] **#goal_id#task_id**: Completed task
  Task description

---
_Managed by dots • Goal ID: #goal_id_
```

### Sync Events

When a goal is synced, an event is recorded:

```json
{"event":"github_synced","goal_id":"abc1","timestamp":"...","issue_number":42}
```

Subsequent syncs update the same issue.

## Usage Examples

**First sync (creates issue):**
```
User: sync #abc1 to github

Agent: Running github sync...

✅ Created GitHub Issue #42 for Goal #abc1
URL: https://github.com/owner/repo/issues/42
```

**Update sync (updates existing issue):**
```
User: sync #abc1 to github

Agent: Running github sync...

✅ Updated GitHub Issue #42 for Goal #abc1
- Tasks checkbox states updated
- Description refreshed
```

## Requirements

- GitHub CLI (`gh`) must be installed and authenticated
- Must be in a git repository with a GitHub remote

## Task Checkboxes

Tasks appear as checkboxes in the issue:
- `pending` / `in_progress` → `- [ ]` (unchecked)
- `prototype` / `done` → `- [x]` (checked)

This allows tracking progress directly in GitHub.
