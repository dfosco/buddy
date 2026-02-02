# GOAL_CRAFTER

A skill for expanding, refining, and generating epics/large goals through collaborative dialogue.

## Activation Check

When this skill is triggered, respond with:
```
🎯 GOAL_CRAFTER activated
```

## Triggers

This skill activates when the user prompt matches ANY of these patterns:

**Explicit goal creation:**
- "let's write a goal"
- "generate a goal"
- "create a goal for..."
- "I need a goal for this feature"
- "help me define a goal"
- "new goal"
- "draft a goal"
- "goal for X"

**Feature/epic planning:**
- "I want to build..."
- "we need to implement..."
- "let's plan out..."
- "I'm thinking about adding..."
- "help me scope..."
- "what would it take to..."
- "let's design..."
- "I have an idea for..."

**Refinement requests:**
- "help me think through..."
- "let's flesh this out"
- "can you help me define..."
- "what should I consider for..."
- "let's brainstorm..."

**Implicit (when discussing features without existing goal):**
- User describes a feature idea in detail
- User asks "how should I approach X"
- User says "I need to add X to my app"

## Behavior

When triggered, engage in a **diverge → converge** workflow:

### Phase 1: Discovery (Diverge)

Ask clarifying questions to fully understand the scope:

1. **What problem are we solving?** - Understand the core need
2. **Who benefits?** - Identify stakeholders/users
3. **What does success look like?** - Define outcomes
4. **What constraints exist?** - Technical, time, resources
5. **What's out of scope?** - Boundaries to avoid scope creep

Ask 2-3 questions at a time. Don't overwhelm.

### Phase 2: Synthesis (Converge)

Based on answers, draft a goal with:

```
## Title
[Clear, actionable title]

## Description
[2-3 sentences explaining the goal]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Context
[Background information, constraints, related work]
```

### Phase 3: Validation

Before finalizing, validate the goal is ready for TASK_CRAFTER:

**Validation Checklist:**
- [ ] Title is specific and actionable (not vague like "improve performance")
- [ ] Description answers: what, why, and for whom
- [ ] Acceptance criteria are measurable and testable
- [ ] No ambiguous terms without definitions
- [ ] Scope is clear (what's in, what's out)
- [ ] An agent could understand this without additional context

If validation fails, do another pass focusing on sharpness and clarity.

### Phase 4: Save

Once validated and confirmed by user, save using:

```bash
dots goal create '{"title":"...","description":"...","acceptance_criteria":["...","..."]}'
```

Report the created goal ID (e.g., `#g007`).

### Phase 5: Create Plan

After saving the goal, create a plan document at `.dots/db/plans/<goal_id>.md`:

```markdown
# <goal_id>: <title>

## Problem

[What problem are we solving? Why does this matter?]

## Solution

[High-level approach and key decisions made during goal crafting]

## Key Decisions

- [Decision 1 and rationale]
- [Decision 2 and rationale]

## Tasks

[Will be populated by TASK_CRAFTER]

## Open Questions

- [Any unresolved questions or future considerations]
```

The plan captures the **conversation context and rationale** that led to the goal, ensuring future agents (or humans) understand the "why" behind decisions.

**IMPORTANT - File Format:**
- Goals are stored as individual JSONL files in `.dots/db/`
- Each goal has its own file: `.dots/db/<goal_id>.jsonl`
- Plans are stored in `.dots/db/plans/<goal_id>.md`
- NEVER create a single `goals.jsonl` file - each goal must be separate
- The script handles file creation automatically - just use the command above

## Status Flow

Goals follow: `draft → ready → in_progress → prototype (alias: production) → done`

**Note:** While a goal is in `draft` status and no tasks have been started, you can reorder tasks using:
```bash
dots task reorder <goal_id> '["t3","t1","t2"]'
```

## Example Dialogue

**User:** Let's write a goal for adding user authentication

**Agent:** Great! Let me understand the scope:
1. What authentication methods do you need? (email/password, OAuth, SSO?)
2. Is this for a new app or adding to an existing system?
3. What's the user base size we're designing for?

**User:** Email/password for now, existing Express app, ~1000 users

**Agent:** Got it. A few more:
1. Do you need email verification?
2. Password reset flow?
3. Any compliance requirements (SOC2, GDPR)?

**User:** Yes to verification and reset, no compliance for now

**Agent:** Here's the draft goal:

## Title
Add Email/Password Authentication to Express App

## Description
Implement secure user authentication using email and password for our existing Express application, supporting approximately 1000 users with email verification and password reset capabilities.

## Acceptance Criteria
- [ ] Users can register with email and password
- [ ] Email verification sent on registration
- [ ] Users can log in with verified email
- [ ] Password reset flow via email link
- [ ] Passwords hashed with bcrypt (cost factor 12+)
- [ ] JWT tokens for session management
- [ ] Rate limiting on auth endpoints

## Context
- Existing Express.js application
- ~1000 expected users
- No immediate compliance requirements
- OAuth/SSO may be added later (out of scope for now)

---

**Validation:** ✅ All criteria pass. Ready for TASK_CRAFTER.

Shall I save this goal?
