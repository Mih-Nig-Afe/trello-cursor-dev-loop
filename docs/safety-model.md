# Safety model — human-in-the-loop

## This is NOT autonomous AI

**MCP Dev Loop** is a human-controlled development assistant.

| Role | Who |
|------|-----|
| Prioritize work | You |
| Approve plans | You |
| Approve commits | You |
| Approve pushes | You |
| Approve Trello updates | You |
| Write code | AI (after your approval) |
| Suggest messages | AI |

The AI **suggests**. You **approve**. The AI **executes**.

## Why

Prevents:

- Wrong commits landing on `main`
- Infinite fix loops without review
- Trello cards closed before you verify
- Sensitive files committed
- Deployments from unreviewed AI output

## Enforcement layers

### 1. Agent rules

`cursor-rules/ai-dev-agent.mdc` — always applied. Tells the agent to wait for explicit phrases like `commit` and `update trello`.

### 2. Workflow skill

`cursor-rules/skills/trello-dev-loop/SKILL.md` — defines phases: Analyze → Implement → Review → Commit → Sync. Analyze mode forbids code edits.

### 3. Cursor hooks

| Hook | Blocks until you approve |
|------|--------------------------|
| `guard-git.sh` | `git commit`, `git push` (extra gate for `main`/`master`) |
| `guard-trello.sh` | `add_comment`, `move_card`, `attach_commit`, `mark_*` |

Trello writes auto-allow when your message includes `update trello`, `mark done`, etc.

### 4. Your judgment

Hooks and rules are guardrails. You still review diffs before approving commits.

## Safe workflow

```
analyze ticket X     →  read only
proceed              →  you approved the plan
prepare commit       →  AI drafts, you review diff
commit this change   →  hook asks → you approve
update trello        →  hook asks → you approve
```

## What AI can do without asking

- Read Trello cards and comments
- Read and edit source files (during implement phase)
- Run tests and read terminal output
- Draft commit messages (not execute)
- Summarize and plan

## What always needs your explicit OK

- `git commit`
- `git push`
- Trello comments, moves, attachments
