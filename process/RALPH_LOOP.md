# Ralph Loop — Execution Framework

## Overview

Ralph Loop is my execution engine. It transforms Asana tasks into shippable code through a disciplined, TDD-driven process.

---

## THE LOOP

```
1. FRESH CONTEXT → Get Asana task + Project docs
2. BREAK → Create subtasks/checklist
3. CODE → Implement with TDD
4. VALIDATE → Run tests + type checks
5. COMPLETE → Mark done in Asana
```

---

## 1. FRESH CONTEXT

**Before touching code, ALWAYS get fresh context from two sources:**

### A. Asana Task
```bash
TOKEN="2/1213287152205467/1213287139030185:70bce90f612d0ea072617e4dc8686bcd"
TASK_GID="1213291705087438"

# Get task with full details
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://app.asana.com/api/1.0/tasks/$TASK_GID?opt_fields=name,notes,assignee,due_date,custom_fields"
```

**Capture from Asana:**
- Task name
- Description/Context
- Acceptance Criteria (checkboxes)
- Technical Notes
- Priority

### B. Project Specs (PRD)
```
Read the following from the project folder:
- SPEC.md - Full product vision
- README.md - Project overview
- docs/ - Any design docs
```

Example project paths:
```
projects/agentwatch/SPEC.md
projects/nexus-ai/SPEC.md
projects/reddit-marketing-tool/SPEC.md
```

---

## EXAMPLE TASK EXECUTION

### Example 1: Simple Fix Task

**Asana Task:**
```
Name: FIX: Build error - prisma/config module not found
Notes: Build fails with: Cannot find module prisma/config. 
       Need to fix prisma.config.ts or remove it if not needed.
```

**Execution Prompt:**
```
Task: FIX: Build error - prisma/config module not found

Context from Asana:
- Build fails with: Cannot find module prisma/config
- Need to fix prisma.config.ts or remove it if not needed

Steps:
1. cd projects/agentwatch/agentwatch
2. Run npm run build to see the error
3. Fix the prisma.config.ts issue
4. Verify build passes
5. Commit with [TASK-ID]
```

### Example 2: Feature Task with Acceptance Criteria

**Asana Task:**
```
Name: Build agent monitoring dashboard

Context:
Users need to see their AI agent status in real-time on a dashboard.

Acceptance Criteria:
- [ ] Dashboard shows list of agents
- [ ] Each agent shows: name, status (running/idle/error), uptime, last activity
- [ ] Real-time updates via WebSocket
- [ ] Click agent to see detailed metrics

Technical Notes:
- Next.js app with WebSocket
- Store agent state in Redis or in-memory
- Use shadcn/ui for components

Priority: P1
```

**Execution Prompt:**
```
Task: Build agent monitoring dashboard
Project: AgentWatch (agentwatch)

Context from Asana:
- Users need to see their AI agent status in real-time on a dashboard

Acceptance Criteria (MUST ALL PASS):
- [ ] Dashboard shows list of agents
- [ ] Each agent shows: name, status (running/idle/error), uptime, last activity
- [ ] Real-time updates via WebSocket
- [ ] Click agent to see detailed metrics

Technical Notes:
- Next.js app with WebSocket
- Store agent state in Redis or in-memory
- Use shadcn/ui for components

Project Vision (from SPEC.md):
- "Datadog for AI Agents" - monitoring platform
- Target: Startups ($49/mo), Agencies ($199/mo), Enterprises ($999/mo)
- Core features: Agent Activity, Token & Cost Tracking, Error Tracking, Audit Logs

Steps:
1. Read projects/agentwatch/SPEC.md for full context
2. Create branch: feature/TASK-ID-dashboard
3. Write test first (TDD): npm run test should fail
4. Implement dashboard with shadcn/ui
5. Add WebSocket for real-time
6. Run npm run type-check && npm run build
7. Verify all acceptance criteria pass
8. Commit: [TASK-ID] Description
9. Mark Asana task complete
```

### Example 3: QA/Code Review Task

**Asana Task:**
```
Name: [QA] End-to-end testing
Notes: 
## Context
Test all features

## Acceptance Criteria
- [ ] User flows work
- [ ] No critical bugs
- [ ] Performance acceptable
```

**Execution Prompt:**
```
Task: [QA] End-to-end testing
Project: AgentWatch

Context:
Test all features

Acceptance Criteria:
- [ ] User flows work
- [ ] No critical bugs
- [ ] Performance acceptable

Steps:
1. cd projects/agentwatch/agentwatch
2. npm run dev to start the app
3. Test all user flows manually
4. Check for console errors
5. Test performance
6. Report bugs as new Asana tasks
7. Mark this task complete if passing
```

---

## 2. BREAK (Subtasks)

If task is large, break into subtasks in Asana:

```bash
# Create subtask
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": {"name": "Subtask name", "parent": "TASK_GID"}}' \
  "https://app.asana.com/api/1.0/subtasks"
```

---

## 3. CODE (TDD)

### Test First, Then Code

```bash
# 1. Write test first (must fail)
npm run test
# Expected: FAIL - feature doesn't exist yet

# 2. Implement feature
# ... code ...

# 3. Run tests again (should pass)
npm run test
```

### Pre-commit Checks

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

All must pass before pushing.

---

## 4. VALIDATE

### Checklist

- [ ] Tests pass (`npm run test`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] No lint errors
- [ ] All acceptance criteria checked
- [ ] PR created (if applicable)

### Run Locally

```bash
# Full validation
npm run type-check && npm run lint && npm run test && npm run build
```

---

## 5. COMPLETE

### Mark Task Done

```bash
curl -s -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": {"completed": true}}' \
  "https://app.asana.com/api/1.0/tasks/$TASK_GID"
```

### Add Completion Comment

```bash
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": {"text": "✅ Completed - [summary of work]"}}' \
  "https://app.asana.com/api/1.0/tasks/$TASK_GID/stories"
```

---

## Branch Strategy

```
feature/TASK-ID-description
fix/TASK-ID-bug-description
```

### Commit Format

```
[TASK-ID] Brief description

- What changed
- Why
```

---

## Quick Start

```bash
# Pick task → Fresh context → Read project specs → Code → Validate → Complete

# 1. Get task
TASK_GID="1213291705087438"

# 2. Fresh Asana context
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://app.asana.com/api/1.0/tasks/$TASK_GID?opt_fields=name,notes"

# 3. Read project spec
# Read projects/agentwatch/SPEC.md

# 4. TDD
npm run test  # Write failing test first
# ... implement ...
npm run test  # Should pass

# 5. Pre-push checks
npm run type-check && npm run build

# 6. Commit
git add -A
git commit -m "[TASK-ID] Description"

# 7. Mark complete
curl -s -X PUT -H "Authorization: Bearer $TOKEN" \
  -d '{"data": {"completed": true}}' \
  "https://app.asana.com/api/1.0/tasks/$TASK_GID"
```

---

## Anti-Patterns

❌ **No stale context** - Always query fresh Asana data  
❌ **Skip project docs** - Always read SPEC.md for context  
❌ **Skip tests** - TDD or no code  
❌ **Skip type check** - Must pass before push  
❌ **Skip lint** - Code style matters  
❌ **Skip build** - Must compile successfully  
❌ **Skip acceptance criteria** - Verify each checkbox  
❌ **Fake progress** - Don't mark done until validated

---

*Fresh context first. Test first. Validate. Complete.*
