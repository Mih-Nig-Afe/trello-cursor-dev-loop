# implement ticket

**Phase:** Build

## Trigger

```
implement ticket <cardId>
/implement-ticket <cardId>
proceed
```

**Prerequisite:** You approved the plan from `analyze ticket`.

## What the agent does

1. Re-read `get_card` for latest comments.
2. Apply minimal, focused code changes.
3. Run relevant tests if appropriate.
4. Summarize changes.
5. Ask: fix / improve / commit / update trello.

## What the agent does NOT do

- Commit (unless you say `commit`)
- Push
- Update Trello (unless you say `update trello`)
- Mark card done automatically

## You say next

- `fix issue in ticket <id>: ...` — iterate
- `prepare commit for ticket <id>` — draft commit
- `update trello ticket <id>` — sync board (after commit)
