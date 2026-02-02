# TASK_CRAFTER

A skill for breaking down goals into atomic, agent-executable tasks.

## Activation Check

When this skill is triggered, respond with:
```
📋 TASK_CRAFTER activated for #<goal_id>
```

## Triggers

This skill activates when the user prompt matches ANY of these patterns:

**Explicit task creation:**
- "break down #goal_id"
- "create tasks for #goal_id"
- "decompose this goal"
- "what are the tasks for #goal_id"
- "break this into tasks"
- "task breakdown"
- "split #goal_id into tasks"

**Notepad tasks:**
- "notepad task"
- "add to notepad"
- "quick task"
- "#notepad"

**Bare change requests (no task described):**
- User asks for a code change without referencing any goal or task
- User says "fix this", "change that", "add X" without context
- User pastes code and asks for modifications
- Any implementation request that doesn't fit an existing workflow

**Implementation planning:**
- "how do I implement #goal_id"
- "what steps for #goal_id"
- "plan the work for #goal_id"
- "what needs to be done for #goal_id"
- "let's break this down"
- "decompose #goal_id"

**After GOAL_CRAFTER completes:**
- "now break it down"
- "create the tasks"
- "what are the steps"
- "let's task this out"

**Implicit:**
- User references a goal ID and asks about next steps
- User says "how should I tackle this"
- User asks "what's the implementation plan"

## Behavior

### Tasks Always Belong to Goals

**Every task must belong to a goal.** If the user creates a task without specifying a goal:

1. Ask if it should go into an existing goal
2. Or offer to add it to their **Notepad** (see below)

### Notepad: Rolling Goal for Stray Tasks

The **Notepad** is a personal rolling goal for miscellaneous tasks that don't fit elsewhere. Each user has one notepad goal with ID `#{username}` (e.g., `#dfosco`).

**Notepad tasks** are numbered sequentially: `#dfosco#t1`, `#dfosco#t2`, etc.

**When to use Notepad:**
- User creates a task without specifying a goal
- User explicitly says "notepad task", "add to notepad", or "quick task"
- Small standalone tasks that don't warrant a full goal
- **Bare change requests**: User asks for changes without describing a task AT ALL

**Notepad tasks follow the exact same lifecycle as regular tasks:**
- Worktree creation with dedicated branch
- Commits on that branch
- Merge back to main when complete
- No special treatment - they just happen to live in the notepad goal

### Handling Bare Change Requests

When a user asks for code changes without referencing any goal or task (e.g., "fix this bug", "add a button here", "change the color to blue"):

1. **Create a notepad task** with a clear title summarizing the change
2. **Run the task** using the regular lifecycle (`dots run`)
3. **Complete normally** with `dots finish`

Example flow:
```
User: "Add a loading spinner to the submit button"

Agent response:
📋 TASK_CRAFTER activated - creating notepad task

Creating task in your notepad...
✓ Created #dfosco#t4: Add loading spinner to submit button

Running task now...
[proceeds with regular task workflow]
```

**Do NOT** make changes directly without creating a task. The task provides:
- Traceability of what was changed and why
- Ability to review/revert changes via git branch
- Consistent workflow regardless of change size

**Creating a Notepad goal** (if it doesn't exist):
```bash
dots goal create '{"id":"<username>","title":"Notepad","description":"Rolling goal for miscellaneous tasks"}'
dots goal status <username> ready
```

**Adding tasks to Notepad:**
```bash
dots task create <username> '{"title":"...","description":"..."}'
```

### Phase 1: Load Goal

First, read the goal:

```bash
dots goal show <goal_id>
```

### Phase 2: Decomposition

Break the goal into tasks that are:

1. **Atomic** - Cannot be meaningfully subdivided
2. **Independent** - Can be completed in isolation (minimal dependencies)
3. **Executable** - An agent can complete in a single continuous session
4. **Testable** - Has a clear "done" condition
5. **Time-boxed** - Roughly 15-60 minutes of focused work

### Phase 3: Task Definition

For each task, define:

```
## Task Title
[Verb + specific action]

## Description
[What to do, where to do it, expected outcome]
```

### Phase 4: Review with User

Present the task breakdown:

```
Goal #abc1: Add Email/Password Authentication

Tasks:
1. Set up auth database schema (users table, sessions)
2. Create user registration endpoint with validation
3. Implement email verification flow
4. Create login endpoint with JWT generation
5. Build password reset request endpoint
6. Build password reset completion endpoint
7. Add bcrypt password hashing utility
8. Implement rate limiting middleware for auth routes
9. Write integration tests for auth flows

Does this breakdown look right? Any tasks to add/remove/modify?
```

### Phase 5: Order Tasks for Implementation

Before saving, order tasks by implementation sequence:

1. **Infrastructure/setup first** - Schema, config, utilities
2. **Core functionality next** - Main features and endpoints
3. **Integration/testing later** - Tests, validation
4. **Documentation/cleanup last** - Docs, refactoring, polish

This ensures each task can build on previous work. Example ordering:
- ❌ Bad: Tests → Endpoint → Schema
- ✅ Good: Schema → Endpoint → Tests

**User override:** If the user explicitly requests a specific order (e.g., "order by priority" or "do X first"), follow their requested order instead.

### Reordering Tasks

If the user wants to change task order after creation (only while goal is still in draft):

```bash
dots task reorder <goal_id> '["t3","t1","t2"]'
```

This only works when:
- Goal status is `draft`
- No tasks have been started (all tasks are `pending`)

### Phase 6: Save Tasks

Once confirmed, save all tasks:

```bash
dots task create-batch <goal_id> '[{"title":"...","description":"..."},{"title":"...","description":"..."}]'
```

Then update goal status to ready:

```bash
dots goal status <goal_id> ready
```

Report created task IDs (e.g., `#abc1#t1`, `#abc1#t2`).

**IMPORTANT - File Format:**
- Tasks are appended to the goal's JSONL file: `.dots/db/<goal_id>.jsonl`
- NEVER create separate task files or a `tasks.jsonl` file
- The script handles this automatically - just use the commands above

## Task Status Flow

Tasks follow: `pending → in_progress → prototype (alias: production) → done`

## Decomposition Guidelines

**Good task:** "Create POST /api/auth/register endpoint with email/password validation"
- Specific endpoint
- Clear inputs
- Defined behavior

**Bad task:** "Set up authentication"
- Too vague
- Multiple steps hidden
- No clear completion point

**Good task:** "Add bcrypt hashing with cost factor 12 to user model"
- Specific library
- Specific configuration
- Single concern

**Bad task:** "Make it secure"
- Undefined scope
- No actionable steps

## Task Ordering

By default, order tasks for optimal implementation:

| Order | Type | Examples |
|-------|------|----------|
| 1st | Infrastructure | DB schema, config, utilities |
| 2nd | Core features | Main endpoints, business logic |
| 3rd | Integration | API connections, webhooks |
| 4th | Testing | Unit tests, integration tests |
| 5th | Polish | Documentation, cleanup, refactoring |

**Note:** Users can override this by explicitly requesting a different order in their prompt.

## Example Output

```
Created tasks for Goal #abc1:

#abc1#t1: Create users table migration
#abc1#t2: Create registration endpoint POST /api/auth/register
#abc1#t3: Implement email verification token generation
#abc1#t4: Create verify-email endpoint GET /api/auth/verify/:token
#abc1#t5: Create login endpoint POST /api/auth/login
#abc1#t6: Implement JWT token generation and validation
#abc1#t7: Create password reset request endpoint
#abc1#t8: Create password reset completion endpoint
#abc1#t9: Add rate limiting to all auth endpoints

Goal #abc1 status updated to: ready
```
